import asyncHandler from 'express-async-handler';
import Wishlist from '../models/Wishlist.js';

// @desc   Get user wishlist
// @route  GET /api/wishlist
// @access Private
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  res.json(wishlist ? wishlist.products : []);
});

// @desc   Add product to wishlist
// @route  POST /api/wishlist/:productId
// @access Private
const addToWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = new Wishlist({ user: req.user._id, products: [req.params.productId] });
  } else if (!wishlist.products.includes(req.params.productId)) {
    wishlist.products.push(req.params.productId);
  }
  await wishlist.save();
  res.json({ message: 'Added to wishlist' });
});

// @desc   Remove product from wishlist
// @route  DELETE /api/wishlist/:productId
// @access Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (wishlist) {
    wishlist.products = wishlist.products.filter(
      p => p.toString() !== req.params.productId
    );
    await wishlist.save();
  }
  res.json({ message: 'Removed from wishlist' });
});

export { getWishlist, addToWishlist, removeFromWishlist };
