// backend/routes/auth.routes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import * as authController from "../controllers/authController.js";

const router = Router();

// Register a new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Get logged-in user's profile
router.get("/profile", protect, authController.getProfile);


export default router;
