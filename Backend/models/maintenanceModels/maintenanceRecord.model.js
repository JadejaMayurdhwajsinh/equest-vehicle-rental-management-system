// models/maintenanceModels/maintenanceRecord.model.js
import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js"; 
import Vehicle from "../vehicleModels/vehicle.model.js";
import Agent from "../UserModels/agent.model.js"; // Agents are users with role "agent"

const MaintenanceRecord = sequelize.define("MaintenanceRecord", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  maintenance_type: {
    type: DataTypes.ENUM("service", "repair", "inspection", "cleaning"),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  service_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  mileage_at_service: {
    type: DataTypes.INTEGER,
  },
  cost: {
    type: DataTypes.DECIMAL(8, 2),
  },
  service_provider: {
    type: DataTypes.STRING(100),
  },
  next_service_due_mileage: {
    type: DataTypes.INTEGER,
  },
  next_service_due_date: {
    type: DataTypes.DATEONLY,
  },
  performed_by: {
    type: DataTypes.INTEGER, // agent_id
  },
}, {
  tableName: "maintenance_records",
  timestamps: true,     // Sequelize will handle timestamps
  createdAt: "created_at", // map createdAt to created_at column
  updatedAt: false,        // disable updatedAt since it's not in SQL schema
});

// ✅ Associations with alias
Vehicle.hasMany(MaintenanceRecord, { foreignKey: "vehicle_id", as: "maintenanceRecords" });
MaintenanceRecord.belongsTo(Vehicle, { foreignKey: "vehicle_id", as: "vehicle" });

Agent.hasMany(MaintenanceRecord, { foreignKey: "performed_by", as: "maintenanceRecords" });
MaintenanceRecord.belongsTo(Agent, { foreignKey: "performed_by", as: "agent" });

export default MaintenanceRecord;
