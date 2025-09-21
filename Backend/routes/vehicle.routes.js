// backend/routes/vehicle.routes.js
import { Router } from "express";
import * as vehicleController from "../controllers/vehicleController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

// Get all vehicles with filters
router.get("/", vehicleController.getAllVehicles);

// Create vehicle (Admin only)
router.post("/", protect, requireRole(["admin"]), vehicleController.createVehicle);

// Update vehicle (Admin or Agent)
router.put("/:id", protect, requireRole(["admin", "agent"]), vehicleController.updateVehicle);

router.delete("/:id", protect, requireRole(["admin"]), vehicleController.deleteVehicle);

// Update vehicle status (Agent only)
router.put("/:id/status", protect, requireRole(["agent"]), vehicleController.updateVehicleStatus);

export default router;
