// backend/routes/booking.routes.js
import express from 'express';
import { getAllCustomers ,getCustomersById,updateCustomerById,deleteCustomerById} from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/',getAllCustomers)
router.get('/:id',getCustomersById)
router.delete('/:id',protect,requireRole(['admin','customer']),deleteCustomerById)
router.put('/:id',protect,requireRole(['admin','customer']),updateCustomerById)

export default router;
