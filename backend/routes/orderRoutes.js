import express from 'express';
const router = express.Router();
import { addOrderItems, getOrderById, getOrders, updateOrderToPaid, updateOrderToDelivered, getMyOrders, acceptOrder } from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/mine').get(protect, getMyOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/accept').put(protect, admin, acceptOrder);
// ✅ FIX: removed `admin` — owner can mark their own credit-card order as paid
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router;