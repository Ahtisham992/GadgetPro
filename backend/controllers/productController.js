import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Wishlist from '../models/Wishlist.js';
import asyncHandler from 'express-async-handler';

// @desc    Fetch all products (with optional search + pagination)
// @route   GET /api/products?keyword=&page=1&limit=12
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { category: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;
  const product = new Product({
    name: name || 'Sample name',
    price: price || 0,
    user: req.user._id,
    image: image || '/images/sample.jpg',
    brand: brand || 'Sample brand',
    category: category || 'Sample category',
    countInStock: countInStock || 0,
    numReviews: 0,
    description: description || 'Sample description',
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name !== undefined ? name : product.name;
    product.price = price !== undefined ? price : product.price;
    product.description = description !== undefined ? description : product.description;
    product.image = image !== undefined ? image : product.image;
    product.brand = brand !== undefined ? brand : product.brand;
    product.category = category !== undefined ? category : product.category;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment, orderId } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (!orderId) {
    res.status(400);
    throw new Error('Order ID is required to leave a review.');
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
          && r.orderId.toString() === orderId.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product for this order.');
  }

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    isDelivered: true,
    'orderItems.product': product._id,
  });

  if (!order) {
    res.status(400);
    throw new Error('You can only review products from delivered orders.');
  }

  const review = {
    name: req.user.name,
    rating: Number(rating),
    comment,
    image: req.body.image,
    user: req.user._id,
    orderId,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ message: 'Review added' });
});

// @desc    Admin reply to a review
// @route   PUT /api/products/:id/reviews/:reviewId/reply
// @access  Private/Admin
const replyToReview = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const review = product.reviews.id(req.params.reviewId);
  if (!review) { res.status(404); throw new Error('Review not found'); }

  review.adminReply = reply;
  review.adminReplyAt = Date.now();
  await product.save();
  res.json({ message: 'Reply saved' });
});

// @desc    Admin delete a review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  product.reviews = product.reviews.filter(r => r._id.toString() !== req.params.reviewId);
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.length
    ? product.reviews.reduce((acc, r) => r.rating + acc, 0) / product.reviews.length
    : 0;
  await product.save();
  res.json({ message: 'Review deleted' });
});

// @desc    Get trending stats (most wishlisted, reviewed, ordered)
// @route   GET /api/products/trending
// @access  Private/Admin
const getTrendingStats = asyncHandler(async (req, res) => {
  // Most wishlisted products
  const wishlistAgg = await Wishlist.aggregate([
    { $unwind: '$products' },
    { $group: { _id: '$products', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $project: { _id: 0, product: { name: 1, image: 1, price: 1, _id: 1 }, count: 1 } },
  ]);

  // Most reviewed products
  const mostReviewed = await Product.find({}).select('name image price numReviews rating').sort({ numReviews: -1 }).limit(10);

  // Most ordered products (aggregate across all orders)
  const orderedAgg = await Order.aggregate([
    { $unwind: '$orderItems' },
    { $group: { _id: '$orderItems.product', name: { $first: '$orderItems.name' }, image: { $first: '$orderItems.image' }, totalQty: { $sum: '$orderItems.qty' }, totalRevenue: { $sum: { $multiply: ['$orderItems.qty', '$orderItems.price'] } } } },
    { $sort: { totalQty: -1 } },
    { $limit: 10 },
  ]);

  res.json({ mostWishlisted: wishlistAgg, mostReviewed, mostOrdered: orderedAgg });
});

export { getProducts, getProductById, deleteProduct, createProduct, updateProduct, createProductReview, replyToReview, deleteReview, getTrendingStats };
