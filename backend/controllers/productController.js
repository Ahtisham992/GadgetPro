import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Wishlist from '../models/Wishlist.js';
import ProductNotification from '../models/ProductNotification.js';
import asyncHandler from 'express-async-handler';
import { sendBackInStockEmail } from '../utils/emailService.js';
import { generateEmbedding } from '../utils/embeddings.js';

let vectorIndexExists = true; // Circuit breaker to avoid slow timeouts if index is missing


// @desc    Fetch all products (with optional search + pagination)
// @route   GET /api/products?keyword=&page=1&limit=12
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  const { keyword, category, brand, minPrice, maxPrice, ram, processor, storage } = req.query;

  const matchQuery = {};

  if (category && category !== 'All') matchQuery.category = category;
  
  if (brand) {
    matchQuery.brand = { $in: brand.split(',') };
  }

  if (minPrice || maxPrice) {
    matchQuery.price = {};
    if (minPrice) matchQuery.price.$gte = Number(minPrice);
    if (maxPrice) matchQuery.price.$lte = Number(maxPrice);
  }

  if (ram) matchQuery['specs.ram'] = { $in: ram.split(',') };
  if (processor) matchQuery['specs.processor'] = { $in: processor.split(',') };
  if (storage) matchQuery['specs.storage'] = { $in: storage.split(',') };

  let products = [];
  let count = 0;
  
  if (keyword && vectorIndexExists) {
    try {
      // 1. Semantic Vector Search
      const queryVector = await generateEmbedding(keyword);
      
      // In Atlas, $vectorSearch must be the first stage
      const pipeline = [
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryVector,
            numCandidates: 100, // Number of nearest neighbors to retrieve
            limit: 50 // Limit total semantic matches before we apply filtering
          }
        },
        // Now apply the standard filters (category, price, etc.)
        { $match: matchQuery },
        {
          $addFields: {
            isStocked: { $cond: { if: { $gt: ["$countInStock", 0] }, then: 1, else: 0 } },
            score: { $meta: "vectorSearchScore" }
          }
        },
        // You can sort by semantic score or stock status
        { $sort: { isStocked: -1, score: -1, createdAt: -1 } }
      ];

      const allMatchingProducts = await Product.aggregate(pipeline);
      count = allMatchingProducts.length;
      
      // Manual pagination from the semantic results
      const startIndex = pageSize * (page - 1);
      products = allMatchingProducts.slice(startIndex, startIndex + pageSize);
    } catch (vectorError) {
      console.error("Vector Search failed (likely missing index). Disabling AI search to prevent further slow timeouts.", vectorError.message);
      vectorIndexExists = false; // Disable dynamically
      
      const fallbackQuery = { ...matchQuery };
      fallbackQuery.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
      ];

      count = await Product.countDocuments(fallbackQuery);
      products = await Product.aggregate([
        { $match: fallbackQuery },
        {
          $addFields: {
            isStocked: { $cond: { if: { $gt: ["$countInStock", 0] }, then: 1, else: 0 } }
          }
        },
        { $sort: { isStocked: -1, createdAt: -1 } },
        { $skip: pageSize * (page - 1) },
        { $limit: pageSize }
      ]);
    }
  } else if (keyword && !vectorIndexExists) {
      // Direct regex fallback without attempting vector search
      const fallbackQuery = { ...matchQuery };
      fallbackQuery.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
      ];

      count = await Product.countDocuments(fallbackQuery);
      products = await Product.aggregate([
        { $match: fallbackQuery },
        {
          $addFields: {
            isStocked: { $cond: { if: { $gt: ["$countInStock", 0] }, then: 1, else: 0 } }
          }
        },
        { $sort: { isStocked: -1, createdAt: -1 } },
        { $skip: pageSize * (page - 1) },
        { $limit: pageSize }
      ]);
  } else {
    // 2. Standard Search (No Keyword)
    count = await Product.countDocuments(matchQuery);
    
    products = await Product.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          isStocked: { $cond: { if: { $gt: ["$countInStock", 0] }, then: 1, else: 0 } }
        }
      },
      { $sort: { isStocked: -1, createdAt: -1 } },
      { $skip: pageSize * (page - 1) },
      { $limit: pageSize }
    ]);
  }

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
  const { name, price, description, image, brand, category, countInStock, specs } = req.body;
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
    specs: specs || {},
  });

  // Generate embedding for AI search
  const textToEmbed = `${product.name} ${product.brand} ${product.category} ${product.description}`;
  product.embedding = await generateEmbedding(textToEmbed);

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock, specs } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name !== undefined ? name : product.name;
    product.price = price !== undefined ? price : product.price;
    product.description = description !== undefined ? description : product.description;
    product.image = image !== undefined ? image : product.image;
    product.brand = brand !== undefined ? brand : product.brand;
    product.category = category !== undefined ? category : product.category;
    const oldStock = product.countInStock;
    product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
    product.specs = specs !== undefined ? specs : product.specs;

    // Regenerate embedding on update
    const textToEmbed = `${product.name} ${product.brand} ${product.category} ${product.description}`;
    product.embedding = await generateEmbedding(textToEmbed);

    const updatedProduct = await product.save();

    // Check for restock and notify users
    if (oldStock === 0 && updatedProduct.countInStock > 0) {
      const notifications = await ProductNotification.find({ product: updatedProduct._id }).populate('user');
      for (const note of notifications) {
        if (note.user && note.user.email) {
          await sendBackInStockEmail(note.user.email, updatedProduct, note.user.name);
        }
      }
      await ProductNotification.deleteMany({ product: updatedProduct._id });
    }

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

// @desc    Subscribe to back-in-stock notification
// @route   POST /api/products/:id/notify
// @access  Private
const subscribeToProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    if (product.countInStock > 0) {
      res.status(400);
      throw new Error('Product is already in stock');
    }
    const alreadySubscribed = await ProductNotification.findOne({
      user: req.user._id,
      product: product._id,
    });
    if (alreadySubscribed) {
      res.status(400);
      throw new Error('You are already subscribed to notifications for this product');
    }
    await ProductNotification.create({
      user: req.user._id,
      product: product._id,
    });
    res.status(201).json({ message: 'Notification subscription successful' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Get recommendations for a product or user
// @route   GET /api/products/:id/recommendations?userId=...
// @access  Public
const getRecommendations = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let aiRecommendations = [];
  const userId = req.query.userId;

  // 1. Try to get AI Collaborative Filtering recommendations if user is logged in
  if (userId && userId !== 'undefined') {
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${aiServiceUrl}/recommend/${userId}?limit=6`);
      if (response.ok) {
        const data = await response.json();
        if (data.recommendations && data.recommendations.length > 0) {
          aiRecommendations = await Product.find({
            _id: { $in: data.recommendations, $ne: product._id },
            countInStock: { $gt: 0 }
          });
        }
      }
    } catch (error) {
      console.error('AI Recommendation Service unreachable:', error.message);
      // Fails silently, proceeds to heuristic fallback
    }
  }

  // 2. Frequently Bought Together (Same category but different accessories)
  let complementaryCategories = [product.category];
  if (product.category === 'Laptops') complementaryCategories.push('Accessories', 'Monitors');
  
  const frequentlyBought = await Product.find({
    category: { $in: complementaryCategories },
    _id: { $ne: product._id },
    countInStock: { $gt: 0 }
  }).sort({ rating: -1 }).limit(4);

  // 3. You Might Also Like (Use AI if available, else Brand/Category heuristic)
  let youMightLike = aiRecommendations;
  
  if (youMightLike.length < 4) {
    const fallbackRecommendations = await Product.find({
      $or: [
        { brand: product.brand },
        { category: product.category }
      ],
      _id: { $ne: product._id },
      countInStock: { $gt: 0 }
    }).sort({ rating: -1 }).limit(6 - youMightLike.length);

    // Merge without duplicates
    const distinctIds = new Set(youMightLike.map(p => p._id.toString()));
    for (const p of fallbackRecommendations) {
      if (!distinctIds.has(p._id.toString())) {
        youMightLike.push(p);
      }
    }
  }

  res.json({ frequentlyBought, youMightLike });
});

export { 
  getProducts, 
  getProductById, 
  deleteProduct, 
  createProduct, 
  updateProduct, 
  createProductReview, 
  replyToReview, 
  deleteReview, 
  getTrendingStats, 
  subscribeToProduct,
  getRecommendations
};