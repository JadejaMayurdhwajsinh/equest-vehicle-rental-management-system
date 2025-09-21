import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";

const BookingExtra = sequelize.define("booking_extras", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  booking_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  extra_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  daily_cost: {
    type: DataTypes.DECIMAL(6,2),
    allowNull: false,
  },
  total_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_cost: {
    type: DataTypes.DECIMAL(8,2),
    allowNull: false,
  },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false,
  tableName: "booking_extras",
});

export default BookingExtra;
