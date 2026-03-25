import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Fetch all products (with optional search + pagination)
// @route   GET /api/products?keyword=&page=1&limit=12
// @access  Public
const getProducts = async (req, res) => {
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
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    res.status(404);
    throw new Error('Product not found or invalid ID');
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    res.status(404);
    throw new Error('Product not found');
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
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
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
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
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
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

  // Check: has this user already reviewed THIS product for THIS specific order?
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
          && r.orderId.toString() === orderId.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product for this order.');
  }

  // Verify the specific order exists, belongs to the user, and was delivered
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
};

export { getProducts, getProductById, deleteProduct, createProduct, updateProduct, createProductReview };
