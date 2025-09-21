import { DataTypes } from "sequelize";
import db from "../../config/db.js";
import Booking from "../bookingModels/booking.model.js";

const Payment = db.define("Payment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookingId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Booking, key: "id" }},
  paymentMethod: { type: DataTypes.STRING, allowNull: false }, // Cash, Card, UPI, Net Banking
  amount: { type: DataTypes.FLOAT, allowNull: false },
  tax: { type: DataTypes.FLOAT, defaultValue: 0 },
  securityDeposit: { type: DataTypes.FLOAT, defaultValue: 0 },
  extrasTotal: { type: DataTypes.FLOAT, defaultValue: 0 },
  penalties: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: "Pending" }, // Pending, Paid, Failed, Refunded, Cancelled
  paymentDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  notes: { type: DataTypes.TEXT, allowNull: true }, // Additional notes
  refundAmount: { type: DataTypes.FLOAT, defaultValue: 0 }, // Refund amount
  refundReason: { type: DataTypes.STRING, allowNull: true }, // Reason for refund
  refundNotes: { type: DataTypes.TEXT, allowNull: true }, // Refund notes
  refundDate: { type: DataTypes.DATE, allowNull: true }, // Date of refund
}, {
  tableName: "payments",
});

// Define associations
Payment.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });
Booking.hasMany(Payment, { foreignKey: "bookingId", as: "payments" });

export default Payment;
