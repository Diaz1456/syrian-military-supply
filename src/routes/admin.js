const express = require('express');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Visitor = require('../models/Visitor');
const Feedback = require('../models/Feedback');
const Admin = require('../models/Admin');
const { getSettings } = require('../models/Settings');
const { signToken, requireAdmin } = require('../middleware/auth');
const { parseProductFiles } = require('../middleware/upload');
const { destroyCloudinary } = require('../middleware/errorHandler');
const { CATEGORIES, clientIp, parseImages, startOfDay, startOfWeek } = require('../utils/helpers');

const router = express.Router();

function hash(pw) {
  return bcrypt.hashSync(pw, 10);
}

function parseProductFields(body) {
  const num = (v, d = 0) => (v === '' || v === undefined || v === null ? d : Number(v));
  return {
    name: body.name ? body.name.trim() : undefined,
    sku: body.sku ? body.sku.trim().toUpperCase() : undefined,
    category: body.category || undefined,
    description: body.description || undefined,
    price: num(body.price, 0),
    salePrice: body.salePrice === '' ? null : num(body.salePrice, 0) || null,
    stock: num(body.stock, 0),
    status: body.status === 'inactive' ? 'inactive' : 'active',
    featured: body.featured === 'true' || body.featured === 'on',
    specs: {
      material: body.material || '',
      weight: body.weight || '',
      capacity: body.capacity || '',
      color: body.color || '',
      origin: body.origin || '',
    },
    updatedAt: new Date(),
  };
}

/* ─────────────────────── AUTH ─────────────────────── */

router.post('/login', async (req, res, next) => {
  try {
    const username = String((req.body || {}).username || '').trim().toLowerCase();
    const password = String((req.body || {}).password || '');
    if (!username || !password) {
      return res.status(400).json({ message: 'Enter both username and password.' });
    }
    if (require('mongoose').connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database not connected. Check MONGODB_URI on the server and redeploy.',
      });
    }
    const record = {
      timestamp: new Date(),
      ip: clientIp(req),
      success: false,
    };
    const admin = await Admin.findOne({ username });
    if (!admin) {
      const count = await Admin.countDocuments({});
      if (count === 0) {
        return res.status(401).json({
          message: 'No admin account exists yet. Run the seed first (visit /api/seed with ALLOW_SEED enabled), then log in.',
        });
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!(await bcrypt.compare(password, admin.password))) {
      await Admin.findByIdAndUpdate(
        admin._id,
        { $push: { loginHistory: { $each: [record], $slice: -50 } } }
      ).catch(() => {});
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    record.success = true;
    await Admin.findByIdAndUpdate(admin._id, {
      $push: { loginHistory: { $each: [record], $slice: -50 } },
      lastLogin: new Date(),
    });
    const token = signToken(admin);
    res.json({
      token,
      admin: { username: admin.username, forcePasswordChange: admin.forcePasswordChange },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: { username: req.admin.username, forcePasswordChange: req.admin.forcePasswordChange } });
});

router.post('/change-password', requireAdmin, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    const admin = await Admin.findById(req.admin._id);
    if (!(await bcrypt.compare(currentPassword || '', admin.password)))
      return res.status(401).json({ message: 'Current password is incorrect' });
    admin.password = hash(newPassword);
    admin.forcePasswordChange = false;
    await admin.save();
    const token = signToken(admin);
    res.json({ message: 'Password updated', token, forcePasswordChange: false });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', requireAdmin, async (req, res, next) => {
  try {
    const { username, currentPassword, newPassword } = req.body || {};
    const admin = await Admin.findById(req.admin._id);
    if (!(await bcrypt.compare(currentPassword || '', admin.password)))
      return res.status(401).json({ message: 'Current password is incorrect' });
    if (username && String(username).trim()) {
      const lower = String(username).trim().toLowerCase();
      const exists = await Admin.findOne({ username: lower, _id: { $ne: admin._id } });
      if (exists) return res.status(400).json({ message: 'Username already taken' });
      admin.username = lower;
    }
    if (newPassword) {
      if (newPassword.length < 8)
        return res.status(400).json({ message: 'New password must be at least 8 characters' });
      admin.password = hash(newPassword);
      admin.forcePasswordChange = false;
    }
    await admin.save();
    res.json({ message: 'Profile updated', admin: { username: admin.username, forcePasswordChange: admin.forcePasswordChange } });
  } catch (err) {
    next(err);
  }
});

/* ─────────────────────── DASHBOARD ─────────────────────── */

router.get('/dashboard', requireAdmin, async (req, res, next) => {
  try {
    const today = startOfDay();
    const week = startOfWeek();
    const [totalVisits, uniqueVisitors, visitsToday, visitsWeek, peakRows, topProducts] =
      await Promise.all([
        Visitor.countDocuments({}),
        Visitor.distinct('visitorId'),
        Visitor.countDocuments({ entryTime: { $gte: today } }),
        Visitor.countDocuments({ entryTime: { $gte: week } }),
        Visitor.aggregate([
          { $group: { _id: { $hour: '$entryTime' }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Product.find({})
          .sort({ salesCount: -1, views: -1 })
          .limit(5)
          .select('name price images salesCount views stock'),
      ]);

    const [orders, revenue, ordersToday, pendingOrders, lowStockProducts, recentFeedback, recentOrders] =
      await Promise.all([
        Order.countDocuments({}),
        Order.aggregate([
          { $match: { status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Order.countDocuments({ createdAt: { $gte: today } }),
        Order.countDocuments({ status: 'pending' }),
        Product.find({ stock: { $lte: 5 } }).select('name stock price images category'),
        Feedback.find().sort({ createdAt: -1 }).limit(5),
        Order.find().sort({ createdAt: -1 }).limit(5).select('customer total status createdAt'),
      ]);

    res.json({
      visitors: {
        totalVisits,
        uniqueVisitors: uniqueVisitors.length,
        visitsToday,
        visitsWeek,
        peakHours: peakRows.map((r) => ({ hour: r._id, count: r.count })),
      },
      sales: {
        totalOrders: orders,
        totalRevenue: revenue.length ? revenue[0].total : 0,
        ordersToday,
        pendingOrders,
      },
      lowStock: lowStockProducts,
      recentFeedback,
      recentOrders,
      topProducts,
    });
  } catch (err) {
    next(err);
  }
});

/* ─────────────────────── PRODUCTS ─────────────────────── */

router.get('/products', requireAdmin, async (req, res, next) => {
  try {
    const { q, category, sort } = req.query;
    const filter = {};
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { sku: { $regex: q, $options: 'i' } }];
    if (category && category !== 'All') filter.category = category;
    const sortSpec = { createdAt: -1 };
    if (sort === 'price-asc') sortSpec.price = 1;
    if (sort === 'price-desc') sortSpec.price = -1;
    const products = await Product.find(filter).sort(sortSpec);
    res.json({ products, categories: CATEGORIES });
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    next(err);
  }
});

router.post('/products', requireAdmin, parseProductFiles, async (req, res, next) => {
  try {
    const data = parseProductFields(req.body);
    if (!data.name) return res.status(400).json({ message: 'Product name is required' });
    const images = parseImages(req.files);
    if (!images.length) images.push(PLACEHOLDER_FALLBACK_IMG);
    try {
      const product = await Product.create({ ...data, images });
      res.status(201).json({ product });
    } catch (err) {
      if (err.code === 11000)
        return res.status(400).json({ message: `SKU already exists: ${data.sku}` });
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

const PLACEHOLDER_FALLBACK_IMG = {
  url: 'https://placehold.co/800x800/2f3120/e6e2d8?text=Product+Image',
  public_id: '',
};

router.put('/products/:id', requireAdmin, parseProductFiles, async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });
    const data = parseProductFields(req.body);
    const newImages = parseImages(req.files);
    if (newImages.length) {
      (existing.images || []).forEach((img) => destroyCloudinary(img.public_id));
      data.images = newImages;
    }
    const updated = await Product.findOneAndUpdate(
      { _id: existing._id },
      { $set: data },
      { new: true }
    );
    res.json({ product: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    (product.images || []).forEach((img) => destroyCloudinary(img.public_id));
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

router.patch('/products/bulk', requireAdmin, async (req, res, next) => {
  try {
    const { ids, action } = req.body || {};
    if (!Array.isArray(ids) || !ids.length)
      return res.status(400).json({ message: 'No products selected' });
    if (action === 'delete') {
      const products = await Product.find({ _id: { $in: ids } });
      products.forEach((p) => (p.images || []).forEach((img) => destroyCloudinary(img.public_id)));
      await Product.deleteMany({ _id: { $in: ids } });
    } else if (action === 'activate' || action === 'deactivate') {
      await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { status: action === 'activate' ? 'active' : 'inactive', updatedAt: new Date() } }
      );
    } else {
      return res.status(400).json({ message: 'Unknown bulk action' });
    }
    res.json({ message: `Bulk ${action} complete (${ids.length} items)` });
  } catch (err) {
    next(err);
  }
});

/* ─────────────────────── ORDERS ─────────────────────── */

router.get('/orders', requireAdmin, async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (q) {
      filter.$or = [
        { 'customer.name': { $regex: q, $options: 'i' } },
        { 'customer.email': { $regex: q, $options: 'i' } },
      ];
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status, updatedAt: new Date() } },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

/* ─────────────────────── FEEDBACK ─────────────────────── */

router.get('/feedback', requireAdmin, async (req, res, next) => {
  try {
    const { rating, q, sort = 'newest' } = req.query;
    const filter = {};
    const r = Number(rating);
    if (!Number.isNaN(r) && r >= 1 && r <= 5) filter.rating = r;
    if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }, { message: { $regex: q, $options: 'i' } }];
    const sortSpec = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const feedback = await Feedback.find(filter).sort(sortSpec);
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
});

router.patch('/feedback/:id/read', requireAdmin, async (req, res, next) => {
  try {
    const fb = await Feedback.findByIdAndUpdate(req.params.id, { $set: { read: true } }, { new: true });
    if (!fb) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ feedback: fb });
  } catch (err) {
    next(err);
  }
});

router.delete('/feedback/:id', requireAdmin, async (req, res, next) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    next(err);
  }
});

/* ─────────────────────── VISITORS ─────────────────────── */

router.get('/visitors', requireAdmin, async (req, res, next) => {
  try {
    const { q, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (q) filter.$or = [{ ip: { $regex: q, $options: 'i' } }, { visitorId: { $regex: q, $options: 'i' } }];
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
    const [visitors, total] = await Promise.all([
      Visitor.find(filter).sort({ entryTime: -1 }).skip((pageNum - 1) * pageSize).limit(pageSize),
      Visitor.countDocuments(filter),
    ]);
    res.json({ visitors, total, page: pageNum, pages: Math.ceil(total / pageSize) });
  } catch (err) {
    next(err);
  }
});

router.delete('/visitors/:id', requireAdmin, async (req, res, next) => {
  try {
    await Visitor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Visitor session deleted' });
  } catch (err) {
    next(err);
  }
});

router.delete('/visitors', requireAdmin, async (req, res, next) => {
  try {
    const { count } = await Visitor.deleteMany({});
    res.json({ message: `Deleted ${count} visitor sessions` });
  } catch (err) {
    next(err);
  }
});

/* ─────────────────────── SETTINGS ─────────────────────── */

router.get('/settings', requireAdmin, async (req, res, next) => {
  try {
    const settings = await getSettings();
    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

router.put('/settings', requireAdmin, async (req, res, next) => {
  try {
    const s = await getSettings();
    const body = req.body || {};
    const fields = [
      'storeName', 'tagline', 'currency', 'shippingFlatRate', 'freeShippingThreshold',
      'notificationEmail', 'contactEmail', 'hoursOfOperation',
    ];
    fields.forEach((f) => {
      if (body[f] !== undefined) s[f] = body[f];
    });
    await s.save();
    res.json({ settings: s });
  } catch (err) {
    next(err);
  }
});

module.exports = router;