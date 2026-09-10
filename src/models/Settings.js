const mongoose = require('mongoose');
const { DEFAULT_CATEGORIES } = require('../utils/helpers');

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

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
    categories: {
      type: [categorySchema],
      default: () => DEFAULT_CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
    },
  },
  { timestamps: true }
);

async function getSettings() {
  const Settings = mongoose.model('Settings');
  let s = await Settings.findOne().sort({ createdAt: 1 });
  if (!s) s = await Settings.create({});

  let dirty = false;
  if (!Array.isArray(s.categories) || !s.categories.length) {
    s.categories = DEFAULT_CATEGORIES.map((c) => ({ id: c.id, name: c.name }));
    dirty = true;
  } else {
    const fixed = s.categories
      .map((c) => {
        const name = c && typeof c === 'object' ? String(c.name || '').trim() : String(c || '').trim();
        if (!name) return null;
        const id = c && typeof c === 'object' && c.id ? String(c.id) : slugify(name);
        return { id, name };
      })
      .filter(Boolean);
    if (!fixed.every((c, i) => c.name === s.categories[i]?.name && c.id === s.categories[i]?.id)) {
      s.categories = fixed;
      dirty = true;
    }
  }
  if (dirty) await s.save();
  return s;
}

function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 48) || 'misc';
}

module.exports = mongoose.model('Settings', settingsSchema);
module.exports.getSettings = getSettings;