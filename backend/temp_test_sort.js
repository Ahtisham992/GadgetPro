import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const testSort = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Get the first product
    const firstProduct = await Product.findOne().sort({ createdAt: -1 });
    if (!firstProduct) {
      console.log('No products found');
      process.exit();
    }

    console.log(`Original first product: ${firstProduct.name} (Stock: ${firstProduct.countInStock})`);

    // 2. Set it to 0 stock
    const originalStock = firstProduct.countInStock;
    firstProduct.countInStock = 0;
    await firstProduct.save();
    console.log(`Updated ${firstProduct.name} stock to 0. It should now appear LAST.`);

    // Wait for user to verify or just log instructions
    console.log('\n--- VERIFICATION STEPS ---');
    console.log('1. Refresh http://localhost:5173/');
    console.log(`2. Verify "${firstProduct.name}" is now at the end of the list and dimmed.`);
    console.log('3. Run "node backend/temp_restore.js" to restore stock.');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testSort();
