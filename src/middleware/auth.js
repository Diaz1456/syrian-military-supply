const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

function signToken(admin) {
  return jwt.sign(
    { id: admin._id, username: admin.username },
    process.env.JWT_SECRET || 'dev-secret-change-me',
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
  );
}

async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized — missing token' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-me');
    const admin = await Admin.findById(payload.id).select('-password');
    if (!admin) return res.status(401).json({ message: 'Unauthorized — admin not found' });
    req.admin = admin;
    req.token = token;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized — invalid or expired token' });
  }
}

module.exports = { signToken, requireAdmin };