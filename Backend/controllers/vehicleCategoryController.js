import VehicleCategory from "../models/vehicleModels/vehicleCategory.model.js";

// ✅ Create a new vehicle (Admin only)
export const createVehicleCategory = async (req, res) => {
  try {
    const { name, description, base_daily_rate} = req.body;

    if (!name || !description || !base_daily_rate) {
      return res.status(400).json({ message: "Name, description, and Base Daily Rate are required" });
    }

    const exist = await VehicleCategory.findOne({where : {name}})

    if(exist)
      return res.status(500).json({message:"Category Already Exist !"})

    const vehicleCategory = await VehicleCategory.create({
      name,
      description,
      base_daily_rate
    });

    res.status(201).json(vehicleCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all vehicles (with filters)
export const getAllVehiclesCategory = async (req, res) => {
  try {
    const vehiclesCategory = await VehicleCategory.findAll();
    res.status(200).json(vehiclesCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get single vehicle by ID
export const getVehicleCategoryById = async (req, res) => {
  try {
    const vehicleCategory = await VehicleCategory.findByPk(req.params.id);
    if (!vehicleCategory) return res.status(404).json({ message: "vehicle Category not found" });
    res.status(200).json(vehicleCategory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
