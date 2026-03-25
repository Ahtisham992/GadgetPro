import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      family: 4, // Force IPv4 to bypass Windows Node.js DNS bugs
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Protocol Error: ${error.message}`);
    console.error('Please ensure your IP is whitelisted in MongoDB Atlas Network Access.');
    process.exit(1);
  }
};

export default connectDB;
