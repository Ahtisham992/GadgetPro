import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';

// @desc   Get all coupons
// @route  GET /api/coupons
// @access Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
});

// @desc   Create coupon
// @route  POST /api/coupons
// @access Admin
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercent, isActive, expiresAt, usageLimit } = req.body;
  const exists = await Coupon.findOne({ code: code.toUpperCase() });
  if (exists) { res.status(400); throw new Error('Coupon code already exists'); }
  const coupon = await Coupon.create({ code, discountPercent, isActive, expiresAt, usageLimit });
  res.status(201).json(coupon);
});

// @desc   Update coupon
// @route  PUT /api/coupons/:id
// @access Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  Object.assign(coupon, req.body);
  const updated = await coupon.save();
  res.json(updated);
});

// @desc   Delete coupon
// @route  DELETE /api/coupons/:id
// @access Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  await Coupon.deleteOne({ _id: coupon._id });
  res.json({ message: 'Coupon deleted' });
});

// @desc   Apply/validate coupon code (user endpoint)
// @route  POST /api/coupons/apply
// @access Private
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) { res.status(404); throw new Error('Invalid or expired coupon code'); }
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    res.status(400); throw new Error('This coupon has expired');
  }
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    res.status(400); throw new Error('Coupon usage limit reached');
  }
  res.json({ code: coupon.code, discountPercent: coupon.discountPercent });
});

export { getCoupons, createCoupon, updateCoupon, deleteCoupon, applyCoupon };
