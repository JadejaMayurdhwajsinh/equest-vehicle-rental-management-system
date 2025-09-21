// backend/routes/booking.routes.js
import express from 'express';
import {
  createBooking,
  getCustomerBookings,
  getAgentBookings,
  pickupBooking,
  returnBooking,
  cancelBooking
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/',protect,requireRole(['customer','admin']),createBooking);
router.get('/customer/:customerId', getCustomerBookings);
router.get('/agent/:agentId', getAgentBookings);
router.put('/:id/pickup',protect,requireRole(['customer','admin']), pickupBooking);
router.put('/:id/return',protect,requireRole(['customer','admin']), returnBooking);
router.delete('/:id/cancel',protect,requireRole(['customer','admin','agent']),cancelBooking);

export default router;
