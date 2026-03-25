import express from 'express';
const router = express.Router();
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').get(protect, getWishlist);
router.route('/:productId').post(protect, addToWishlist).delete(protect, removeFromWishlist);

export default router;
