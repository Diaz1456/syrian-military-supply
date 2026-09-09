const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  forcePasswordChange: { type: Boolean, default: true },
  lastLogin: Date,
  loginHistory: [
    {
      timestamp: { type: Date, default: Date.now },
      ip: String,
      success: { type: Boolean, default: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Admin', adminSchema);