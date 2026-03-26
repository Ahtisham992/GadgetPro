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
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: paymentMethod === 'Credit Card',
      paidAt: paymentMethod === 'Credit Card' ? Date.now() : undefined,
    });

    const createdOrder = await order.save();

    // Decrement inventory stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock -= item.qty;
        if (product.countInStock < 0) product.countInStock = 0;
        await product.save();
      }
    }

    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

// @desc    Update order to paid (Cash on Delivery or Admin override)
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
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
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();
    
    // Send email notification
    sendOrderDeliveredEmail(order.user.email, updatedOrder).catch(console.error);
    
    // Send Web Push notification
    sendPush(order.user._id, {
      title: 'Order Delivered! 🎉',
      body: `Your order ending in #${order._id.toString().slice(-6).toUpperCase()} has arrived. Enjoy!`,
      url: '/profile'
    });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/mine
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Accept order (admin)
// @route   PUT /api/orders/:id/accept
// @access  Private/Admin
const acceptOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    order.isAccepted = true;
    order.acceptedAt = Date.now();
    const updatedOrder = await order.save();
    
    // Send email notification
    sendOrderAcceptedEmail(order.user.email, updatedOrder).catch(console.error);
    
    // Send Web Push notification
    sendPush(order.user._id, {
      title: 'Order Approved ✅',
      body: `Your order ending in #${order._id.toString().slice(-6).toUpperCase()} is now processing!`,
      url: '/profile'
    });

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export { addOrderItems, getOrderById, getOrders, updateOrderToPaid, updateOrderToDelivered, getMyOrders, acceptOrder };
