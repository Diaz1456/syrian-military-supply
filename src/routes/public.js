const express = require('express');
const { Types } = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Feedback = require('../models/Feedback');
const Visitor = require('../models/Visitor');
const { getSettings } = require('../models/Settings');
const {
  CATEGORIES,
  detectDevice,
  clientIp,
  parseSort,
} = require('../utils/helpers');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

router.get('/settings/public', async (req, res, next) => {
  try {
    const s = await getSettings();
    res.json({
      storeName: s.storeName,
      tagline: s.tagline,
      currency: s.currency,
      shippingFlatRate: s.shippingFlatRate,
      freeShippingThreshold: s.freeShippingThreshold,
      contactEmail: s.contactEmail,
      hoursOfOperation: s.hoursOfOperation,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const rows = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const counts = {};
    rows.forEach((r) => (counts[r._id] = r.count));
    const list = CATEGORIES.map((c) => ({ name: c, count: counts[c] || 0 })).filter(
      (c) => c.count > 0
    );
    res.json({ categories: list });
  } catch (err) {
    next(err);
  }
});

router.get('/products/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ results: [] });
    const results = await Product.find({
      status: 'active',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ],
    })
      .limit(6)
      .select('name price salePrice images category slug views');
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

router.get('/products', async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, sort, q, page = 1, limit = 12 } = req.query;
    const filter = { status: 'active' };
    if (category && category !== 'All') filter.category = category;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      filter.effectivePrice = {};
      const p = Number(minPrice);
      const x = Number(maxPrice);
      if (!Number.isNaN(p) && p > 0) filter.effectivePrice.$gte = p;
      if (!Number.isNaN(x) && x > 0) filter.effectivePrice.$lte = x;
      if (!Object.keys(filter.effectivePrice).length) delete filter.effectivePrice;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
    const sortSpec = parseSort(sort);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortSpec)
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .then((docs) => docs.map((p) => p.toJSON())),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/products/featured', async (req, res, next) => {
  try {
    const featured = await Product.find({ status: 'active', featured: true }).limit(6);
    res.json({ featured });
  } catch (err) {
    next(err);
  }
});

router.get('/products/deal', async (req, res, next) => {
  try {
    const withSale = await Product.find({
      status: 'active',
      salePrice: { $gt: 0 },
      $expr: { $lt: ['$salePrice', '$price'] },
    });
    const pick = withSale.length
      ? withSale[Math.floor(Math.random() * withSale.length)]
      : null;
    res.json({ deal: pick });
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = Types.ObjectId.isValid(id) ? { _id: id } : {};
    const product = await Product.findOne({ ...filter, status: 'active' });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.views += 1;
    await product.save();

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'active',
    })
      .limit(8)
      .select('name price salePrice images stock category');

    const doc = product.toJSON();

    res.json({ product: doc, related });
  } catch (err) {
    next(err);
  }
});

router.post('/orders', async (req, res, next) => {
  try {
    const { customer, items } = req.body || {};
    if (!customer || !customer.name || !customer.email || !customer.address) {
      return res.status(400).json({ message: 'Missing required customer fields' });
    }
    if (!items || !items.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const { shippingFlatRate, freeShippingThreshold } = await getSettings();

    let subtotal = 0;
    const lineItems = [];
    for (const it of items) {
      const prod = await Product.findById(it.productId);
      if (!prod || prod.status !== 'active')
        return res.status(400).json({ message: `Product unavailable: ${it.name}` });
      const unit = prod.salePrice && prod.salePrice < prod.price ? prod.salePrice : prod.price;
      const quantity = Math.max(1, parseInt(it.quantity, 10) || 1);
      if (prod.stock < quantity)
        return res.status(400).json({ message: `Not enough stock for: ${prod.name}` });
      subtotal += unit * quantity;
      lineItems.push({
        productId: prod._id,
        name: prod.name,
        sku: prod.sku,
        price: unit,
        quantity,
        image: prod.images && prod.images[0] ? prod.images[0].url : '',
      });
    }

    const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFlatRate;
    const order = await Order.create({
      customer,
      items: lineItems,
      subtotal,
      shipping,
      total: subtotal + shipping,
    });

    for (const li of lineItems) {
      await Product.findByIdAndUpdate(li.productId, {
        $inc: { stock: -li.quantity, salesCount: li.quantity },
      });
    }

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
});

router.get('/orders/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
});

router.post('/feedback', async (req, res, next) => {
  try {
    const { name, email, rating, message, subject } = req.body || {};
    const r = parseInt(rating, 10);
    if (Number.isNaN(r) || r < 1 || r > 5)
      return res.status(400).json({ message: 'Rating must be 1–5' });
    if (!message || !message.trim())
      return res.status(400).json({ message: 'Message is required' });
    const fb = await Feedback.create({ name, email, rating: r, message, subject });
    res.status(201).json({ feedback: fb });
  } catch (err) {
    next(err);
  }
});

router.get('/feedback', async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit, 10) || 6);
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name rating message subject createdAt')
      .lean();
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
});

router.post('/visitors/track', async (req, res, next) => {
  try {
    const { action = 'enter', visitorId, page = '/', device, duration } = req.body || {};
    const ip = clientIp(req);
    const ua = req.headers['user-agent'] || '';
    const dev = device || detectDevice(ua);
    if (!visitorId) return res.status(400).json({ message: 'visitorId required' });

    let session = await Visitor.findOne({ visitorId, exitTime: null }).sort({ entryTime: -1 });

    if (action === 'exit') {
      if (session) {
        const exitTime = new Date();
        session.exitTime = exitTime;
        session.duration += Math.floor((exitTime - session.entryTime) / 1000);
        await session.save();
      }
      return res.json({ ok: true });
    }

    if (!session) {
      const priorCount = await Visitor.countDocuments({ visitorId });
      session = await Visitor.create({
        visitorId,
        ip,
        userAgent: ua,
        device: dev,
        pagesVisited: [page],
        entryTime: new Date(),
        visitCount: priorCount + 1,
        duration: Number(duration) || 0,
      });
    } else if (action === 'page') {
      if (!session.pagesVisited.includes(page)) session.pagesVisited.push(page);
      if (session.duration !== Number(duration)) session.duration = Number(duration) || 0;
      await session.save();
    }

    res.json({
      ok: true,
      sessionId: session._id,
      visitCount: session.visitCount,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;