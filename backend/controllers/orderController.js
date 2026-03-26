import Order from '../models/Order.js';
import Product from '../models/Product.js';
import PushSubscription from '../models/PushSubscription.js';
import { sendOrderAcceptedEmail, sendOrderDeliveredEmail } from '../utils/emailService.js';
import { webpush } from '../utils/webPush.js';
import asyncHandler from 'express-async-handler';

const sendPush = async (userId, payload) => {
  try {
    const subs = await PushSubscription.find({ user: userId });
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload)
        );
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
        } else console.error('Push error:', err);
      }
    }
  } catch (err) {
    console.error('Failed to dispatch push notifications:', err);
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems, shippingAddress, paymentMethod,
    itemsPrice, taxPrice, shippingPrice, totalPrice,
    discountAmount, couponCode,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const order = new Order({
    orderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountAmount: discountAmount || 0,
    couponCode: couponCode || '',
    totalPrice,
    // Credit card orders start as paid
    isPaid: paymentMethod === 'Credit Card',
    paidAt: paymentMethod === 'Credit Card' ? Date.now() : undefined,
  });

  const createdOrder = await order.save();

  // Decrement inventory stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      product.countInStock = Math.max(0, product.countInStock - item.qty);
      await product.save();
    }
  }

  res.status(201).json(createdOrder);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  // Only admin or the order owner can view
  if (!req.user.isAdmin && order.user._id.toString() !== req.user._id.toString()) {
    res.status(401); throw new Error('Not authorized');
  }
  res.json(order);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private (owner or admin)
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }

  // ✅ FIX: allow order owner OR admin
  if (!req.user.isAdmin && order.user.toString() !== req.user._id.toString()) {
    res.status(401); throw new Error('Not authorized');
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id || 'CASH_ON_DELIVERY',
    status: req.body.status || 'PAID',
    update_time: req.body.update_time || Date.now().toString(),
    email_address: req.body.email_address || 'admin_override',
  };

  const updatedOrder = await order.save();
  res.json(updatedOrder);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.isDelivered = true;
  order.deliveredAt = Date.now();
  const updatedOrder = await order.save();

  sendOrderDeliveredEmail(order.user.email, updatedOrder).catch(console.error);
  sendPush(order.user._id, {
    title: 'Order Delivered! 🎉',
    body: `Your order #${order._id.toString().slice(-6).toUpperCase()} has arrived. Enjoy!`,
    url: '/profile',
  });

  res.json(updatedOrder);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/mine
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Accept order (admin)
// @route   PUT /api/orders/:id/accept
// @access  Private/Admin
const acceptOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }

  order.isAccepted = true;
  order.acceptedAt = Date.now();
  const updatedOrder = await order.save();

  sendOrderAcceptedEmail(order.user.email, updatedOrder).catch(console.error);
  sendPush(order.user._id, {
    title: 'Order Approved ✅',
    body: `Your order #${order._id.toString().slice(-6).toUpperCase()} is now processing!`,
    url: '/profile',
  });

  res.json(updatedOrder);
});

export { addOrderItems, getOrderById, getOrders, updateOrderToPaid, updateOrderToDelivered, getMyOrders, acceptOrder };