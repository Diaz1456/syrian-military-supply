const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, isConfigured } = require('../config/cloudinary');

const MAX_IMAGES = 8;

const storage = isConfigured
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: process.env.CLOUDINARY_FOLDER || 'syrian-military-supply',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
      },
    })
  : multer.diskStorage({
      destination(req, file, cb) {
        const dir = path.join(__dirname, '..', '..', 'uploads');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename(req, file, cb) {
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
      },
    });

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: MAX_IMAGES },
});

const parseProductFiles = upload.array('images', MAX_IMAGES);

module.exports = { parseProductFiles, MAX_IMAGES };