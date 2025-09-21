// backend/routes/maintenance.routes.js
import express from "express";
import {
  createMaintenanceRecord,
  getMaintenanceRecordsByVehicle,
  getMaintenanceByAgent,
  getAllMaintenanceRecords,
  getMaintenanceRecordById,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceAnalytics,
  getUpcomingMaintenance,
  getMaintenanceStats
} from "../controllers/maintenanceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { agentOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// CRUD Operations
router.post("/", protect, agentOnly, createMaintenanceRecord);
router.get("/", protect, getAllMaintenanceRecords);
router.get("/:id", protect, getMaintenanceRecordById);
router.put("/:id", protect, agentOnly, updateMaintenanceRecord);
router.delete("/:id", protect, agentOnly, deleteMaintenanceRecord);

// Specific Queries
router.get("/vehicle/:vehicleId", protect, getMaintenanceRecordsByVehicle);
router.get("/agent/records", protect, agentOnly, getMaintenanceByAgent);

// Analytics and Statistics
router.get("/analytics/overview", protect, getMaintenanceAnalytics);
router.get("/analytics/upcoming", protect, getUpcomingMaintenance);
router.get("/analytics/stats", protect, getMaintenanceStats);

export default router;
