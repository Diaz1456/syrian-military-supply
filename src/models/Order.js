const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      address: { type: String, required: true },
      city: String,
      state: String,
      zip: String,
      country: { type: String, default: 'Syria' },
    },
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        sku: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    subtotal: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('Order', orderSchema);