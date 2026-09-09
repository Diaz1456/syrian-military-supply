function notFound(req, res, next) {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
}

function errorHandler(err, req, res, next) {
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach((f) => f.public_id && destroyCloudinary(f.public_id));
  }
  console.error('[error]', err.message, err.stack && err.stack.split('\n')[1]);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
}

function destroyCloudinary(publicId) {
  const { cloudinary, isConfigured } = require('../config/cloudinary');
  if (isConfigured && publicId) {
    cloudinary.uploader.destroy(publicId).catch(() => {});
  }
}

module.exports = { notFound, errorHandler, destroyCloudinary };