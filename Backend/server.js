// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import vehicleRoutes from "./routes/vehicle.routes.js";
import maintenanceRoutes from "./routes/maintenance.routes.js";
import bookingRoutes from './routes/booking.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import vehicleCategoryRouter from './routes/vehicleCategory.route.js'
import paymentRoutes from "./routes/payment.routes.js";
import customerRoutes from "./routes/customer.routes.js"
import agentRoutes from './routes/agent.routes.js';

dotenv.config({ path: "./.env" });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/vehiclesCategory',vehicleCategoryRouter)
app.use("/api/payments", paymentRoutes);
app.use('/api/customers',customerRoutes)
app.use('/api/agents',agentRoutes)

// Test route
app.get("/", (req, res) => {
  res.send("🚗 Vehicle Rental API is running...");
});

const startServer = async () => {
  try {
    await db.authenticate();

    // 🛠 Choose sync mode
    if (process.env.NODE_ENV === "development") {
      // reset DB completely (use carefully!)
      await db.sync({ force: true });
      console.log("✅ Database synced with { force: true } (tables dropped & recreated)");
    } else {
      // production safe
      await db.sync();
      console.log("✅ Database synced safely (no schema alter)");
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

startServer();
