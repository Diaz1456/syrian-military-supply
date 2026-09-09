const path = require('path');
const fs = require('fs');
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');

const { connectDB } = require('./config/db');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { seedDatabase } = require('./utils/seed');
const { signalReady } = require('./utils/ready');

require('./models/Product');
require('./models/Order');
require('./models/Visitor');
require('./models/Feedback');
require('./models/Admin');
require('./models/Settings');
require('./models/Slide');

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
      : true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/* Health — must come before SPA fallback */
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', uptime: process.uptime(), ready: true })
);
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/seed', async (req, res) => {
  if (process.env.ALLOW_SEED !== 'true' && process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Seeding disabled. Set ALLOW_SEED=true temporarily.' });
  }
  try {
    const result = await seedDatabase();
    res.json({ ...result, seededAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* Serve uploaded images (Cloudinary when configured, local fallback via /tmp) */
const { UPLOAD_DIR } = require('./middleware/upload');
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '1d' }));

/* Serve built React app (client/dist) */
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist, { maxAge: '1d', index: false }));
  app.get(/^(?!\/?api\/|\/?uploads).*/, (req, res, next) => {
    const indexHtml = path.join(clientDist, 'index.html');
    if (fs.existsSync(indexHtml)) return res.sendFile(indexHtml);
    return next();
  });
}

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  const connected = await connectDB();
  signalReady(connected);
  const port = process.env.PORT || 5000;
  const server = app.listen(port, () => {
    console.log(`[sms] Syrian Military Supply running on port ${port}`);
  });
  return server;
}

module.exports = { app, startServer };