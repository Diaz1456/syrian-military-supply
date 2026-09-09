const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema(
  {
    kicker: { type: String, default: '' },
    title: { type: String, required: true },
    text: { type: String, default: '' },
    cta: { type: String, default: 'Shop now' },
    link: { type: String, default: '/shop' },
    btn2: { type: String, default: '' },
    link2: { type: String, default: '/shop' },
    tag: { type: String, default: '' },
    image: {
      url: { type: String, required: true },
      public_id: { type: String, default: '' },
    },
    sortOrder: { type: Number, default: 0 },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Slide', slideSchema);