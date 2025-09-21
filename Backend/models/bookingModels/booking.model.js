import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import Vehicle from "../vehicleModels/vehicle.model.js";
import Customer from "../UserModels/customer.model.js";
import BookingExtra from "./bookingExtra.model.js";

const Booking = sequelize.define("Booking", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  agent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  pickup_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  return_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  pickup_location: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  return_location: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  total_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  daily_rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  base_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  tax_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  extras_amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  security_deposit: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("confirmed", "active", "completed", "cancelled", "overdue"),
    defaultValue: "confirmed",
  },
  payment_status: {
    type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
    defaultValue: "pending",
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  pickup_mileage: {
    type: DataTypes.INTEGER,
  },
  return_mileage: {
    type: DataTypes.INTEGER,
  },
  additional_charges: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
});

// ------------------ Associations ------------------

// Booking belongs to a customer
Booking.belongsTo(Customer, { as: "customer", foreignKey: "customer_id" });

// Booking belongs to a vehicle
Booking.belongsTo(Vehicle, { as: "vehicle", foreignKey: "vehicle_id" });

// Booking has many extras
Booking.hasMany(BookingExtra, { as: "extras", foreignKey: "booking_id" });

export default Booking;
