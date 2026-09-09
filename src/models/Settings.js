const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'Syrian Military Supply' },
    tagline: { type: String, default: 'Genuine Surplus • Field Tested • Local Crafts' },
    currency: { type: String, default: 'USD' },
    shippingFlatRate: { type: Number, default: 9.99 },
    freeShippingThreshold: { type: Number, default: 150 },
    notificationEmail: String,
    contactEmail: { type: String, default: 'contact@syrianmilitarysupply.com' },
    hoursOfOperation: { type: String, default: 'Mon–Sat: 09:00–19:00 • Sun: Closed' },
  },
  { timestamps: true }
);

async function getSettings() {
  const Settings = mongoose.model('Settings');
  let s = await Settings.findOne().sort({ createdAt: 1 });
  if (!s) s = await Settings.create({});
  return s;
}

module.exports = mongoose.model('Settings', settingsSchema);
module.exports.getSettings = getSettings;