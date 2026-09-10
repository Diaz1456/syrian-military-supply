const { v4: uuidv4 } = require('uuid');

const CATEGORIES = [
  'Tactical Apparel',
  'Footwear',
  'Gear & Packs',
  'Optics',
  'Knives & Tools',
  'Surplus',
  'Patches & Morale',
  'Medical & Survival',
  'Local Crafts',
];

const DEFAULT_CATEGORIES = CATEGORIES.map((name) => ({
  id: slugify(name),
  name,
}));

function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 48) || 'misc';
}

function randomId() {
  return uuidv4();
}

function detectDevice(ua = '') {
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  if (/mobile|iphone|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

function clientIp(req) {
  return (
    (req.headers['x-forwarded-for'] &&
      String(req.headers['x-forwarded-for']).split(',')[0].trim()) ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

function parseSort(sort) {
  const map = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    newest: { createdAt: -1 },
    popular: { salesCount: -1, views: -1 },
  };
  return map[sort] || { createdAt: -1 };
}

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date = new Date()) {
  const d = startOfDay(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

module.exports = {
  CATEGORIES,
  DEFAULT_CATEGORIES,
  slugify,
  randomId,
  detectDevice,
  clientIp,
  parseSort,
  startOfDay,
  startOfWeek,
};