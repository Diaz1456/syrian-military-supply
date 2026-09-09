const path = require('path');
const os = require('os');
const fs = require('fs');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, isConfigured } = require('../config/cloudinary');

const MAX_IMAGES = 8;
const UPLOAD_DIR = path.join(os.tmpdir(), 'sms-uploads');

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
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        cb(null, UPLOAD_DIR);
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
const parseSlideImage = upload.single('image');

module.exports = { parseProductFiles, parseSlideImage, MAX_IMAGES, UPLOAD_DIR };