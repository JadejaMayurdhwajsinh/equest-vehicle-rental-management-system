// backend/routes/vehicle.routes.js
import { Router } from "express";
import * as VehicleCategoryController from "../controllers/vehicleCategoryController.js"
import { protect } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

// Get all vehicles with filters
router.post("/", protect,requireRole(['admin']),VehicleCategoryController.createVehicleCategory);
router.get("/", VehicleCategoryController.getAllVehiclesCategory);
router.get("/:id", VehicleCategoryController.getVehicleCategoryById);


export default router;
