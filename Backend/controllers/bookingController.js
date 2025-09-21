import Booking from "../models/bookingModels/booking.model.js";
import Vehicle from "../models/vehicleModels/vehicle.model.js";
import BookingExtra from "../models/bookingModels/bookingExtra.model.js";
import Customer from "../models/UserModels/customer.model.js";
import Joi from "joi";

const bookingSchema = Joi.object({
  customer_id: Joi.number().integer().required(),
  vehicle_id: Joi.number().integer().required(),
  pickup_date: Joi.date().iso().required(),
  return_date: Joi.date().iso().required(),
  pickup_location: Joi.string().max(100).optional(),
  return_location: Joi.string().max(100).optional(),
  payment_method: Joi.string().max(50).optional(),
  total_amount: Joi.number().positive().optional(),
  extras: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      dailyCost: Joi.number().positive().required()
    })
  ).optional()
});

export const createBooking = async (req, res) => {
  try {
    const { error, value } = bookingSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      console.log(error);
      
      return res.status(400).json({
        message: "Validation failed",
        details: error.details.map((err) => err.message),
      });
    }

    console.log(req.body);
    
    const { customer_id, vehicle_id, pickup_date, return_date, pickup_location, return_location, payment_method, total_amount,extras } = value;

    const vehicle = await Vehicle.findByPk(vehicle_id);
    
    if (!vehicle || vehicle.status !== 'available') {
      return res.status(400).json({ message: 'Vehicle not available' });
    }
    const customer = await Customer.findByPk(customer_id);
    console.log(customer);
    
    if (!customer) {
      return res.status(400).json({ message: 'Customer not found' });
    }

    const start = new Date(pickup_date);
    const end = new Date(return_date);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (totalDays < 1 || totalDays > 30) {
      return res.status(400).json({ message: 'Rental duration must be between 1 and 30 days' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'Pickup date cannot be in the past' });
    }

    const baseAmount = parseFloat(vehicle.daily_rate) * totalDays;
    const taxAmount = baseAmount * 0.18;
    let extrasAmount = 0;

    if (extras && extras.length > 0) {
      extras.forEach(extra => {
        extrasAmount += extra.dailyCost * totalDays;
      });
    }

    const securityDeposit = parseFloat(vehicle.daily_rate) * 2;
    const totalAmount = baseAmount + taxAmount + extrasAmount;

    const booking = await Booking.create({
      customer_id,
      vehicle_id,
      pickup_date,
      return_date,
      pickup_location,
      return_location,
      total_days: totalDays,
      daily_rate: vehicle.daily_rate,
      base_amount: baseAmount,
      tax_amount: taxAmount,
      extras_amount: extrasAmount,
      security_deposit: securityDeposit,
      total_amount: total_amount || totalAmount,
      status: 'confirmed',
      payment_status: 'pending',
      payment_method,
    });

    if (extras && extras.length > 0) {
      for (let extra of extras) {
        await BookingExtra.create({
          booking_id: booking.id,
          extra_name: extra.name,
          daily_cost: extra.dailyCost,
          total_days: totalDays,
          total_cost: extra.dailyCost * totalDays,
        });
      }
    }

    const createdBooking = await Booking.findByPk(booking.id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
        { model: BookingExtra, as: 'extras' }
      ]
    });

    res.status(201).json({ 
      message: 'Booking created successfully', 
      booking: createdBooking 
    });
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCustomerBookings = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId || isNaN(parseInt(customerId))) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const bookings = await Booking.findAll({
      where: { customer_id: customerId },
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: BookingExtra, as: 'extras' }
      ],
      order: [["created_at", "DESC"]]
    });

    res.status(200).json({
      message: "Customer bookings retrieved successfully",
      bookings
    });
  } catch (error) {
    console.error("Get Customer Bookings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAgentBookings = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!agentId || isNaN(parseInt(agentId))) {
      return res.status(400).json({ message: "Invalid agent ID" });
    }

    const bookings = await Booking.findAll({
      where: { agent_id: agentId },
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
        { model: BookingExtra, as: 'extras' }
      ],
      order: [["created_at", "DESC"]]
    });

    res.status(200).json({
      message: "Agent bookings retrieved successfully",
      bookings
    });
  } catch (error) {
    console.error("Get Agent Bookings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const pickupBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { agent_id, pickup_mileage } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    if (!agent_id || isNaN(parseInt(agent_id))) {
      return res.status(400).json({ message: "Agent ID is required" });
    }

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Booking not ready for pickup' });
    }

    await booking.update({
      status: 'active',
      agent_id: agent_id,
      pickup_mileage: pickup_mileage || 0
    });

    const vehicle = await Vehicle.findByPk(booking.vehicle_id);
    await vehicle.update({ status: 'rented' });

    const updatedBooking = await Booking.findByPk(id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
        { model: BookingExtra, as: 'extras' }
      ]
    });

    res.status(200).json({ 
      message: 'Vehicle picked up successfully', 
      booking: updatedBooking 
    });
  } catch (error) {
    console.error("Pickup Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const returnBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { return_mileage, additional_charges, notes } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== 'active') {
      return res.status(400).json({ message: 'Booking not active' });
    }

    await booking.update({
      status: 'completed',
      return_mileage: return_mileage || booking.pickup_mileage,
      additional_charges: additional_charges || 0,
      payment_status: 'paid',
      notes: notes
    });

    const vehicle = await Vehicle.findByPk(booking.vehicle_id);
    await vehicle.update({ 
      status: 'available',
      current_mileage: return_mileage || booking.pickup_mileage
    });

    const updatedBooking = await Booking.findByPk(id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
        { model: BookingExtra, as: 'extras' }
      ]
    });

    res.status(200).json({ 
      message: 'Vehicle returned successfully', 
      booking: updatedBooking 
    });
  } catch (error) {
    console.error("Return Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("id");
    console.log(id);
    

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    await booking.update({
      status: 'cancelled',
      payment_status: 'refunded'
    });

    const updatedBooking = await Booking.findByPk(id, {
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: Customer, as: 'customer' },
        { model: BookingExtra, as: 'extras' }
      ]
    });

    res.status(200).json({ 
      message: 'Booking cancelled successfully', 
      booking: updatedBooking 
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
