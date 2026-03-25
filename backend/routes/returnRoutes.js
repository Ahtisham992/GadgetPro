import express from 'express';
const router = express.Router();
import { createReturn, getMyReturns, getAllReturns, updateReturn } from '../controllers/returnController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.route('/').post(protect, createReturn).get(protect, admin, getAllReturns);
router.route('/mine').get(protect, getMyReturns);
router.route('/:id').put(protect, admin, updateReturn);

export default router;
