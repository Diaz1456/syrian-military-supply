const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI not set — API routes that need the DB will fail.');
    return false;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      bufferCommands: false,
      bufferTimeoutMS: 10000,
    });
    console.log('[db] Connected to MongoDB');
    return true;
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    return false;
  }
}

module.exports = { connectDB, mongoose };