const path = require('path');
const os = require('os');
const fs = require('fs');
const multer = require('multer');
const { cloudinary, isConfigured } = require('../config/cloudinary');

const MAX_IMAGES = 8;
const UPLOAD_DIR = path.join(os.tmpdir(), 'sms-uploads');

const storage = multer.diskStorage({
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

/* Upload a staged local file to Cloudinary when configured; keep the local
   copy (served via /uploads) as a fallback so saves never fail on upload. */
async function uploadToCloudinary(localPath) {
  if (!isConfigured) return null;
  try {
    const res = await cloudinary.uploader.upload(localPath, {
      folder: process.env.CLOUDINARY_FOLDER || 'syrian-military-supply',
      transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
    });
    fs.unlink(localPath, () => {});
    return { url: res.secure_url, public_id: res.public_id };
  } catch (err) {
    console.warn('[cloudinary] upload failed, using local fallback:', err.message);
    return null;
  }
}

async function finalizeImages(files) {
  if (!files || !files.length) return [];
  const out = [];
  for (const f of files) {
    const localPath = f.path;
    const up = await uploadToCloudinary(localPath);
    if (up) {
      out.push({ url: up.url, public_id: up.public_id });
    } else {
      out.push({ url: `/uploads/${path.basename(localPath)}`, public_id: '' });
    }
  }
  return out;
}

async function finalizeSingle(file) {
  if (!file) return null;
  const arr = await finalizeImages([file]);
  return arr[0] || null;
}

module.exports = { parseProductFiles, parseSlideImage, MAX_IMAGES, UPLOAD_DIR, finalizeImages, finalizeSingle };