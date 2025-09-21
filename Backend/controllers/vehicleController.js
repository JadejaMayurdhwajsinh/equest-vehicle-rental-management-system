import Vehicle from "../models/vehicleModels/vehicle.model.js";
import VehicleCategory from "../models/vehicleModels/vehicleCategory.model.js";
import Joi from "joi";
import { validator } from "sequelize/lib/utils/validator-extras";
import db from "../config/db.js";

const vehicleSchema = Joi.object({
  vehicle_number: Joi.string().alphanum().min(5).max(20).required().messages({
    "any.required": "Vehicle number is required",
  }),

  make: Joi.string().min(2).max(50).required(),

  model: Joi.string().min(1).max(50).required(),

  year: Joi.number()
    .integer()
    .min(1980)
    .max(new Date().getFullYear())
    .required(),

  category_id: Joi.number()
    .integer()
    .required()
    .messages({ "any.required": "Category is required" }),

  fuel_type: Joi.string()
    .valid("petrol", "diesel", "electric", "hybrid")
    .required(),

  seating_capacity: Joi.number().integer().min(1).max(100).required(),

  daily_rate: Joi.number().precision(2).positive().required(),

  current_mileage: Joi.number().integer().min(0).default(0),

  last_service_mileage: Joi.number().integer().min(0).default(0),

  status: Joi.string()
    .valid("available", "rented", "maintenance", "out_of_service")
    .default("available"),

  location: Joi.string().min(2).max(100).required(),

  registration_date: Joi.date().iso().required(),

  insurance_expiry: Joi.date().iso().required(),
});

export const createVehicle = async (req, res) => {
  try {
    const { error, value } = vehicleSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message),
      });
    }

    if (validator.isNumeric(value.make)) {
      return res.status(400).json({ message: "Make cannot be just numbers" });
    }

    const existing = await Vehicle.findOne({
      where: { vehicle_number: value.vehicle_number },
    });
    if (existing) {
      return res.status(400).json({ message: "Vehicle number already exists" });
    }

    const category = await VehicleCategory.findByPk(value.category_id);
    if (!category) {
      return res.status(400).json({ message: "Vehicle Category does not exist" });
    }

    const vehicle = await Vehicle.create({
      vehicle_number: value.vehicle_number,
      make: value.make,
      model: value.model,
      year: value.year,
      category_id: value.category_id,
      fuel_type: value.fuel_type,
      seating_capacity: value.seating_capacity,
      daily_rate: value.daily_rate,
      current_mileage: value.current_mileage || 0,
      last_service_mileage: value.last_service_mileage || 0,
      status: value.status || "available",
      location: value.location,
      registration_date: value.registration_date,
      insurance_expiry: value.insurance_expiry,
    });

    res.status(201).json({
      message: "Vehicle created successfully",
      vehicle,
    });
  } catch (error) {
    console.error("Create Vehicle Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllVehicles = async (req, res) => {
  try {
    const { category, available, pickup_date } = req.query;

    const filters = {};
    
    if (category) {
      filters.category_id = parseInt(category);
    }
    
    if (available) {
      if (available === "true") {
        filters.status = "available";
      } else if (available === "false") {
        filters.status = { [db.Sequelize.Op.in]: ["rented", "maintenance", "out_of_service"] };
      }
    }

    const queryOptions = {
      where: filters,
      include: [
        {
          model: VehicleCategory,
          as: "category",
          attributes: ["id", "name", "description", "base_daily_rate"]
        }
      ],
      order: [["created_at", "DESC"]]
    };

    const vehicles = await Vehicle.findAll(queryOptions);
    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Get All Vehicles Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    const vehicle = await Vehicle.findByPk(id, {
      include: [
        {
          model: VehicleCategory,
          as: "category",
          attributes: ["id", "name", "description", "base_daily_rate"]
        }
      ]
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({
      message: "Vehicle retrieved successfully",
      vehicle
    });
  } catch (error) {
    console.error("Get Vehicle By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const {
      vehicle_number,
      make,
      model,
      year,
      category_id,
      fuel_type,
      seating_capacity,
      daily_rate,
      current_mileage,
      last_service_mileage,
      status,
      location,
      registration_date,
      insurance_expiry
    } = req.body;

    const updateData = {};
    
    if (vehicle_number !== undefined) updateData.vehicle_number = vehicle_number;
    if (make !== undefined) updateData.make = make;
    if (model !== undefined) updateData.model = model;
    if (year !== undefined) updateData.year = year;
    if (category_id !== undefined) {
      const category = await VehicleCategory.findByPk(category_id);
      if (!category) {
        return res.status(400).json({ message: "Vehicle category does not exist" });
      }
      updateData.category_id = category_id;
    }
    if (fuel_type !== undefined) updateData.fuel_type = fuel_type;
    if (seating_capacity !== undefined) updateData.seating_capacity = seating_capacity;
    if (daily_rate !== undefined) updateData.daily_rate = daily_rate;
    if (current_mileage !== undefined) updateData.current_mileage = current_mileage;
    if (last_service_mileage !== undefined) updateData.last_service_mileage = last_service_mileage;
    if (status !== undefined) updateData.status = status;
    if (location !== undefined) updateData.location = location;
    if (registration_date !== undefined) updateData.registration_date = registration_date;
    if (insurance_expiry !== undefined) updateData.insurance_expiry = insurance_expiry;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    await vehicle.update(updateData);

    const updatedVehicle = await Vehicle.findByPk(id, {
      include: [
        {
          model: VehicleCategory,
          as: "category",
          attributes: ["id", "name", "description", "base_daily_rate"]
        }
      ]
    });

    res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error("Update Vehicle Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateVehicleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["available", "rented", "maintenance", "out_of_service"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status value",
        validStatuses: validStatuses
      });
    }

    await vehicle.update({ status });

    const updatedVehicle = await Vehicle.findByPk(id, {
      include: [
        {
          model: VehicleCategory,
          as: "category",
          attributes: ["id", "name", "description", "base_daily_rate"]
        }
      ]
    });

    res.status(200).json({ 
      message: "Vehicle status updated successfully", 
      vehicle: updatedVehicle 
    });
  } catch (error) {
    console.error("Update Vehicle Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    const vehicle = await Vehicle.findByPk(id, {
      include: [
        {
          model: VehicleCategory,
          as: "category",
          attributes: ["id", "name", "description", "base_daily_rate"]
        }
      ]
    });

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    if (vehicle.status === "rented") {
      return res.status(400).json({ 
        message: "Cannot delete vehicle that is currently rented",
        vehicle: {
          id: vehicle.id,
          vehicle_number: vehicle.vehicle_number,
          status: vehicle.status
        }
      });
    }

    const deletedVehicle = {
      id: vehicle.id,
      vehicle_number: vehicle.vehicle_number,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      category: vehicle.category,
      status: vehicle.status
    };

    await vehicle.destroy();

    res.status(200).json({ 
      message: "Vehicle deleted successfully",
      deletedVehicle
    });
  } catch (error) {
    console.error("Delete Vehicle Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};