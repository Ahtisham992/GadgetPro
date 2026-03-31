import mongoose from 'mongoose';

const productNotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only subscribe once to a specific product
productNotificationSchema.index({ user: 1, product: 1 }, { unique: true });

const ProductNotification = mongoose.model('ProductNotification', productNotificationSchema);

export default ProductNotification;
