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

  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not defined in environment variables');
    throw new Error('MONGODB_URI is required');
  }

  if (!cached.promise) {
    // Mongoose options for serverless
    const opts = {
      bufferCommands: false, // Disable buffering to immediately throw errors if disconnected
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongooseInstance) => {
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
