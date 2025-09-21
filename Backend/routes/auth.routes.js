// backend/routes/auth.routes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {register,login,getProfile,getProfileInfo} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
// router.post("/logout", logout);

router.get("/profile", protect, getProfile);
router.get("/profileInfo", protect, getProfileInfo);

// router.put("/profile", protect, updateProfile);

export default router;
