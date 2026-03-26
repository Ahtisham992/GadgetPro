import express from 'express';
import asyncHandler from 'express-async-handler';
import PushSubscription from '../models/PushSubscription.js';
import { vapidKeys } from '../utils/webPush.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get VAPID Public Key for frontend subscription
// @route   GET /api/notifications/vapidPublicKey
// @access  Public
router.get('/vapidPublicKey', (req, res) => {
  res.send(vapidKeys.publicKey);
});

// @desc    Subscribe user block to receive push notifications
// @route   POST /api/notifications/subscribe
// @access  Private
router.post('/subscribe', protect, asyncHandler(async (req, res) => {
  const subscription = req.body;
  const existing = await PushSubscription.findOne({ user: req.user._id, endpoint: subscription.endpoint });
  
  if (!existing) {
    await PushSubscription.create({ user: req.user._id, ...subscription });
  } else {
    // Refresh the subscription just in case
    Object.assign(existing, subscription);
    await existing.save();
  }
  
  res.status(201).json({ message: 'Subscribed successfully' });
}));

export default router;
