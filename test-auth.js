import mongoose from 'mongoose';
import User from './server/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const conn = await mongoose.connect('mongodb://localhost:27017/testdb');
  console.log("Connected");
  
  await User.deleteMany({});

  const name = "Test User";
  const email = `test${Date.now()}@test.com`;
  const password = "password123";
  
  // 1. Register flow
  let createdUser;
  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) throw new Error('Exists');
    
    createdUser = await User.create({ name, email, password });
    console.log("Registered. Hash in memory:", createdUser.password);
  } catch (err) {
    console.error("Register Error:", err);
  }
  
  // 2. Login flow
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      console.error('Invalid credentials (not found)');
      return;
    }
    
    console.log("Fetched for login. Hash:", user.password);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.error('Invalid credentials (mismatch)');
      return;
    }
    console.log("Login success!");
  } catch (err) {
    console.error("Login Error:", err);
  }

  process.exit(0);
}
test();
