const mongoose = require('mongoose');
const User = require('../models/User');
const { usersById } = require('../store/memoryStore');
const { verifyToken } = require('../services/token');

function publicUser(user) {
  const value = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  return {
    id: String(value._id || value.id),
    name: value.name,
    email: value.email,
    role: value.role,
    country: value.country,
    phone: value.phone || '',
    nidOrPassport: value.nidOrPassport || '',
    university: value.university || '',
    city: value.city || '',
    primaryLanguage: value.primaryLanguage || ''
  };
}

async function findUserById(userId) {
  if (mongoose.connection.readyState === 1) return User.findById(userId);
  return usersById.get(userId) || null;
}

async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Please sign in to continue' });
  }

  try {
    const user = await findUserById(payload.userId);
    if (!user) return res.status(401).json({ error: 'Your session is no longer valid' });
    req.user = publicUser(user);
    return next();
  } catch (error) {
    console.error('Authentication lookup error:', error.message);
    return res.status(503).json({ error: 'Authentication service is temporarily unavailable' });
  }
}

function requireGuide(req, res, next) {
  if (req.user.role !== 'GUIDE') {
    return res.status(403).json({ error: 'A guide account is required for this page' });
  }
  return next();
}

module.exports = { publicUser, requireAuth, requireGuide };
