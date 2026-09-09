const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    visitorId: { type: String, index: true },
    ip: String,
    userAgent: String,
    device: { type: String, default: 'unknown' },
    pagesVisited: [String],
    entryTime: { type: Date, default: Date.now },
    exitTime: Date,
    duration: { type: Number, default: 0 },
    visitCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

visitorSchema.index({ entryTime: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);