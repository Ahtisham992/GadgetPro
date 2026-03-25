import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import users from './data/users.js';
import products from './data/products.js';

dotenv.config();

await connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Manual seeding is performed via npm run data:import
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/returns', returnRoutes);

import path from 'path';
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
