const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { usersByEmail, saveUser } = require('../store/memoryStore');
const { hashPassword, verifyPassword } = require('../services/password');
const { createToken } = require('../services/token');
const { publicUser, requireAuth } = require('../middleware/auth');

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ROLES = new Set(['TOURIST', 'GUIDE']);

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function findUserByEmail(email) {
  const memoryUser = usersByEmail.get(email);
  if (memoryUser) return memoryUser;
  if (mongoose.connection.readyState !== 1) return null;
  return User.findOne({ email });
}

router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    const role = String(req.body.role || 'TOURIST').toUpperCase();

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!ALLOWED_ROLES.has(role)) {
      return res.status(400).json({ error: 'Please choose Tourist or Student Guide' });
    }
    if (await findUserByEmail(email)) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);
    const userData = {
      name,
      email,
      password: passwordHash,
      role,
      country: String(req.body.country || 'Bangladesh').trim(),
      phone: String(req.body.phone || '').trim(),
      nidOrPassport: String(req.body.nidOrPassport || '').trim(),
      university: String(req.body.university || '').trim(),
      city: String(req.body.city || '').trim(),
      primaryLanguage: String(req.body.primaryLanguage || '').trim()
    };

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.create(userData);
    } else {
      user = saveUser({ id: crypto.randomUUID(), ...userData, createdAt: new Date() });
    }

    const safeUser = publicUser(user);
    return res.status(201).json({
      message: 'Registration successful',
      user: safeUser,
      token: createToken(safeUser)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Could not create the account' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);
    const passwordIsValid = user ? await verifyPassword(password, user.password) : false;
    if (!user || !passwordIsValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const safeUser = publicUser(user);
    return res.json({
      message: 'Login successful',
      user: safeUser,
      token: createToken(safeUser)
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Could not sign in' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
