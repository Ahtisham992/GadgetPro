import express from 'express';
const router = express.Router();
import {
  authUser, registerUser, verifyOtp, googleAuth,
  addAddress, deleteAddress, getUserProfile,
  changePassword, forgotPassword, resetPassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').post(registerUser);
router.post('/login', authUser);
router.post('/verify-otp', verifyOtp);
router.post('/google', googleAuth);
router.route('/profile').get(protect, getUserProfile);
router.route('/addresses').post(protect, addAddress);
router.route('/addresses/:addrId').delete(protect, deleteAddress);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.put('/change-password', protect, changePassword);

export default router;