import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';
import User from './user.model.js';

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  date_of_birth: { type: DataTypes.DATEONLY },
  address: { type: DataTypes.TEXT },
  driving_license_number: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  license_expiry_date: { type: DataTypes.DATEONLY, allowNull: false },
  emergency_contact_name: { type: DataTypes.STRING(100) },
  emergency_contact_phone: { type: DataTypes.STRING(15) },
}, { timestamps: true });

Customer.belongsTo(User, { foreignKey: 'user_id', onDelete: 'CASCADE' });

export default Customer;
