import express from "express";
import {
  createPayment,
  updatePaymentStatus,
  getPaymentByBooking,
  getAllPayments,
  getPaymentById,
  issueRefund,
  getPaymentAnalytics,
  getPaymentStats
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { agentOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// CRUD Operations
router.post("/", protect, agentOnly, createPayment); // Create new payment
router.get("/", protect, getAllPayments); // Get all payments with filtering
router.get("/:id", protect, getPaymentById); // Get payment by ID
router.patch("/:id/status", protect, agentOnly, updatePaymentStatus); // Update payment status
router.post("/:id/refund", protect, agentOnly, issueRefund); // Issue refund

// Specific Queries
router.get("/booking/:bookingId", protect, getPaymentByBooking); // Get payment by booking

// Analytics and Statistics
router.get("/analytics/overview", protect, getPaymentAnalytics); // Get payment analytics
router.get("/analytics/stats", protect, getPaymentStats); // Get payment statistics

export default router;
