import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/db.js';
import { generateEmbedding } from './utils/embeddings.js';

dotenv.config();
connectDB();

const generateAllEmbeddings = async () => {
  try {
    const products = await Product.find({});
    console.log(`Found ${products.length} products. Starting embedding generation...`);

    let count = 0;
    for (const product of products) {
      const textToEmbed = `${product.name} ${product.brand} ${product.category} ${product.description}`;
      const embedding = await generateEmbedding(textToEmbed);
      
      product.embedding = embedding;
      await product.save();
      
      count++;
      console.log(`[${count}/${products.length}] Embedded: ${product.name}`);
    }

    console.log('All products successfully embedded!');
    process.exit();
  } catch (error) {
    console.error(`Error generating embeddings: ${error}`);
    process.exit(1);
  }
};

generateAllEmbeddings();
