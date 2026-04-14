import express from 'express';
const router = express.Router();
import {
  getProducts, getProductById, deleteProduct, createProduct, updateProduct,
  createProductReview, replyToReview, deleteReview, getTrendingStats,
  subscribeToProduct, getRecommendations, getForecast
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

router.get('/trending', protect, admin, getTrendingStats);
router.get('/forecast', protect, admin, getForecast);

router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/:id/reviews')
  .post(protect, createProductReview);

router.put('/:id/reviews/:reviewId/reply', protect, admin, replyToReview);
router.delete('/:id/reviews/:reviewId', protect, admin, deleteReview);

router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.post('/:id/subscribe', protect, subscribeToProduct);
router.get('/:id/recommendations', getRecommendations);

export default router;