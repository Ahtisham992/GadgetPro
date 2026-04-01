import mongoose from 'mongoose';
import dotenv from 'dotenv';
import products from './data/products.js';
import User from './models/User.js';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const importProductsOnly = async () => {
  try {
    // 1. Delete all existing products ONLY
    await Product.deleteMany();
    console.log('Existing products cleared.');

    // 2. Find an admin user to associate products with
    const adminUser = await User.findOne({ isAdmin: true });
    
    if (!adminUser) {
      console.error('No admin user found! Please run the full seeder first or create an admin.');
      process.exit(1);
    }

    // 3. Prepare products with the admin user ID
    const sampleProducts = products.map((p) => {
      return { ...p, user: adminUser._id };
    });

    // 4. Insert the new products
    await Product.insertMany(sampleProducts);

    console.log(`${sampleProducts.length} Products Imported Successfully!`);
    process.exit();
  } catch (error) {
    console.error(`Error with products reseed: ${error}`);
    process.exit(1);
  }
};

importProductsOnly();
