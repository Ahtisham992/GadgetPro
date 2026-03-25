import asyncHandler from 'express-async-handler';
import Return from '../models/Return.js';

// @desc   Create return request
// @route  POST /api/returns
// @access Private
const createReturn = asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;
  const exists = await Return.findOne({ order: orderId, user: req.user._id });
  if (exists) { res.status(400); throw new Error('Return request already submitted for this order'); }
  const returnReq = await Return.create({ order: orderId, user: req.user._id, reason });
  res.status(201).json(returnReq);
});

// @desc   Get user's own return requests
// @route  GET /api/returns/mine
// @access Private
const getMyReturns = asyncHandler(async (req, res) => {
  const returns = await Return.find({ user: req.user._id }).populate('order', '_id totalPrice createdAt').sort({ createdAt: -1 });
  res.json(returns);
});

// @desc   Get all return requests
// @route  GET /api/returns
// @access Admin
const getAllReturns = asyncHandler(async (req, res) => {
  const returns = await Return.find({})
    .populate('user', 'name email')
    .populate('order', '_id totalPrice createdAt')
    .sort({ createdAt: -1 });
  res.json(returns);
});

// @desc   Update return status (approve/reject)
// @route  PUT /api/returns/:id
// @access Admin
const updateReturn = asyncHandler(async (req, res) => {
  const returnReq = await Return.findById(req.params.id);
  if (!returnReq) { res.status(404); throw new Error('Return request not found'); }
  returnReq.status = req.body.status || returnReq.status;
  returnReq.adminNote = req.body.adminNote || returnReq.adminNote;
  returnReq.resolvedAt = Date.now();
  const updated = await returnReq.save();
  res.json(updated);
});

export { createReturn, getMyReturns, getAllReturns, updateReturn };
