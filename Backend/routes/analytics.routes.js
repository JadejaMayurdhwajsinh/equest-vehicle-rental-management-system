// backend/routes/analytics.routes.js
import express from 'express';
import {
  getOverview,
  getBookingsAnalytics,
  getRevenueAnalytics,
  getVehicleUtilization,
  getCustomerAnalytics,
  getMaintenanceAnalytics,
  getPerformanceMetrics
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dashboard Overview
router.get('/overview', protect, getOverview);

// Booking Analytics
router.get('/bookings', protect, getBookingsAnalytics);

// Revenue Analytics
router.get('/revenue', protect, getRevenueAnalytics);

// Vehicle Analytics
router.get('/vehicles/utilization', protect, getVehicleUtilization);

// Customer Analytics
router.get('/customers', protect, getCustomerAnalytics);

// Maintenance Analytics
router.get('/maintenance', protect, getMaintenanceAnalytics);

// Performance Metrics
router.get('/performance', protect, getPerformanceMetrics);

export default router;
