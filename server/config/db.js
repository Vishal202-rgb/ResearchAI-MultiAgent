import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

// Global cache for serverless environments (Vercel)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/research-workspace';

  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Allow Mongoose to buffer commands while connecting
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log(`MongoDB connected successfully: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    }).catch((error) => {
      console.error(`MongoDB connection error: ${error.message}`);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

export default connectDB;
