const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI
      || process.env.DATABASE_URL
      || 'mongodb://localhost:27017/explorebd';

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ MongoDB connection warning: ${error.message} (Using in-memory fallback state)`);
  }
};

module.exports = connectDB;
