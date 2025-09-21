import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import bcrypt from "bcrypt";

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_type: { type: DataTypes.ENUM("customer", "agent", "admin"), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    full_name: { type: DataTypes.STRING(100), allowNull: false },
    phone: { type: DataTypes.STRING(15) },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { timestamps: true }
);

// Hash password before create or update
User.beforeCreate(async (user) => {
  user.password_hash = await bcrypt.hash(user.password_hash, 10);
});

User.beforeUpdate(async (user) => {
  if (user.changed("password_hash")) {
    user.password_hash = await bcrypt.hash(user.password_hash, 10);
  }
});

// Instance method to check password
User.prototype.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password_hash);
};

export default User;