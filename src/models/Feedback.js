const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    message: { type: String, required: true, trim: true },
    subject: String,
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);