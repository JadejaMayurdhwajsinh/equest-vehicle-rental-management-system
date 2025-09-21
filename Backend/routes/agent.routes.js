// backend/routes/auth.routes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import * as agentController from "../controllers/agentController.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/",agentController.getAllAgent)

router.get("/:id",agentController.getAgentById)

router.put("/:id",protect,requireRole(['admin','agent']),agentController.updateAgentById)

router.delete("/:id",protect,requireRole(['admin','agent']),agentController.deleteAgentById)

export default router;