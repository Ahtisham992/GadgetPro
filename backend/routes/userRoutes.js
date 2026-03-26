import express from 'express';
const router = express.Router();
import { authUser, registerUser, verifyOtp, addAddress, deleteAddress, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').post(registerUser);
router.post('/login', authUser);
router.post('/verify-otp', verifyOtp);
router.route('/profile').get(protect, getUserProfile);
router.route('/addresses').post(protect, addAddress);
router.route('/addresses/:addrId').delete(protect, deleteAddress);

export default router;
