import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendOrderAcceptedEmail, sendOrderDeliveredEmail } from '../utils/emailService.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
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
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
};

// @desc    Update order to paid (Cash on Delivery or Admin override)
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const updateOrderToPaid = async (req, res) => {
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
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();
    // Send email notification
    sendOrderDeliveredEmail(order.user.email, updatedOrder).catch(console.error);
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/mine
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// @desc    Accept order (admin)
// @route   PUT /api/orders/:id/accept
// @access  Private/Admin
const acceptOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    order.isAccepted = true;
    order.acceptedAt = Date.now();
    const updatedOrder = await order.save();
    // Send email notification
    sendOrderAcceptedEmail(order.user.email, updatedOrder).catch(console.error);
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
};

export { addOrderItems, getOrderById, getOrders, updateOrderToPaid, updateOrderToDelivered, getMyOrders, acceptOrder };
