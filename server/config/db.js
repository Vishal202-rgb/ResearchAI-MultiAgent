import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

// Global cache for serverless environments (Vercel)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If connection exists and is actively connected, reuse it
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If previous connection dropped or was closed during container freeze, reset cache
  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/research-workspace';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Fail fast in serverless environments rather than buffering indefinitely
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000, // 8-second ceiling to prevent serverless function hangs
      socketTimeoutMS: 45000,
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
