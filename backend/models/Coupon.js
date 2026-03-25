import mongoose from 'mongoose';

const couponSchema = mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercent: { type: Number, required: true, min: 1, max: 100 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  usageLimit: { type: Number, default: 0 }, // 0 = unlimited
  usedCount: { type: Number, default: 0 },
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
