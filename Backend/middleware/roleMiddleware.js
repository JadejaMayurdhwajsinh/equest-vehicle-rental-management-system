// backend/middleware/roleMiddleware.js
import User from "../models/UserModels/user.model.js";

export const requireRole = (roles = []) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized" });

      const user = await User.findByPk(req.user.id);
      if (!user) return res.status(401).json({ message: "Unauthorized: user not found" });
      if (!user.is_active) return res.status(403).json({ message: "User is deactivated" });

      const userRole = user.user_type;
      if (!roles.map(r => r.toLowerCase()).includes(userRole.toLowerCase()))
        return res.status(403).json({ message: "Forbidden: insufficient role" });

      next();
    } catch (err) {
      console.error("Role Middleware Error:", err);
      return res.status(500).json({ message: "Server error in role middleware" });
    }
  };
};

// Convenience named middlewares
export const agentOnly = requireRole(["agent"]);
export const adminOnly = requireRole(["admin"]);
export const customerOnly = requireRole(["customer"]);
