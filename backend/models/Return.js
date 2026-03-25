import mongoose from 'mongoose';

const returnSchema = mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order' },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  adminNote: { type: String },
  resolvedAt: { type: Date },
}, { timestamps: true });

const Return = mongoose.model('Return', returnSchema);
export default Return;
