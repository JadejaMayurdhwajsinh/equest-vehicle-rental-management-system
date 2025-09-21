import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import User from './user.model.js';

const Agent = sequelize.define('Agent', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  employee_id: { type: DataTypes.STRING(20), unique: true, allowNull: false },
  branch_location: { type: DataTypes.STRING(100) },
  role: { type: DataTypes.STRING(50) },
  hire_date: { type: DataTypes.DATEONLY },
  commission_rate: { type: DataTypes.DECIMAL(5,2), defaultValue: 5.00 },
  full_name: { type: DataTypes.STRING(100), allowNull: true } 
}, { timestamps: true });

Agent.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

export default Agent;
