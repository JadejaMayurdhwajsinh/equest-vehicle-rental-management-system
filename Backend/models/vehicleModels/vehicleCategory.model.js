// backend/models/VehicleCategory.js
import { DataTypes } from "sequelize";
import db from "../../config/db.js";

const VehicleCategory = db.define("vehicle_categories", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  base_daily_rate: { type: DataTypes.DECIMAL(8,2), defaultValue: 1000.00 },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false, 
  tableName: "vehicle_categories",
});

export default VehicleCategory;
