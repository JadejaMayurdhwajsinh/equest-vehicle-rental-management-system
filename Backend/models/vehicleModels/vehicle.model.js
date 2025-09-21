// backend/models/Vehicle.js
import { DataTypes } from "sequelize";
import db from "../../config/db.js";
import VehicleCategory from "./vehicleCategory.model.js";

const Vehicle = db.define("vehicles", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicle_number: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  make: { type: DataTypes.STRING(50), allowNull: false },
  model: { type: DataTypes.STRING(50), allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  category_id: { type: DataTypes.INTEGER, allowNull: false },
  fuel_type: { type: DataTypes.ENUM('petrol','diesel','electric','hybrid'), allowNull: false },
  seating_capacity: { type: DataTypes.INTEGER, allowNull: false },
  daily_rate: { type: DataTypes.DECIMAL(8,2), allowNull: false },
  current_mileage: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_service_mileage: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('available','rented','maintenance','out_of_service'), defaultValue: 'available' },
  location: { type: DataTypes.STRING(100) },
  registration_date: { type: DataTypes.DATEONLY },
  insurance_expiry: { type: DataTypes.DATEONLY },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  tableName: "vehicles",
});

// Association (optional — ensures Sequelize knows the relationship)
Vehicle.belongsTo(VehicleCategory, { foreignKey: "category_id", as: "category" });

export default Vehicle;
