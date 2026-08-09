const mongoose = require('mongoose');

// Remove any previously seeded fake demo users on startup
const cleanFakeDemoUsers = async () => {
  try {
    const User = require('../models/User');
    const demoEmails = [
      'alex@skillswap.com',
      'sophia@skillswap.com',
      'marcus@skillswap.com',
      'elena@skillswap.com'
    ];
    const res = await User.deleteMany({ email: { $in: demoEmails } });
    if (res.deletedCount > 0) {
      console.log(`🧹 Removed ${res.deletedCount} fake demo profiles from MongoDB Atlas.`);
    }
  } catch (err) {
    console.error('cleanFakeDemoUsers error:', err.message);
  }
};

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI;

  if (!connStr) {
    console.error('❌ MONGODB_URI is not defined in .env file!');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    await cleanFakeDemoUsers();
  } catch (error) {
    console.error(`❌ MongoDB Atlas connection failed: ${error.message}`);
    console.error('Make sure your Atlas IP whitelist includes your current IP (or 0.0.0.0/0 for development).');
    process.exit(1);
  }
};

module.exports = connectDB;
