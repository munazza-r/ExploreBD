const express = require('express');
const User = require('../models/User');
const { publicUser, requireAuth } = require('../middleware/auth');
const { verifyPassword } = require('../services/password');
const { createToken } = require('../services/token');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    const passwordIsValid = user ? await verifyPassword(password, user.password) : false;
    if (!user || !passwordIsValid || !['TOURIST', 'GUIDE'].includes(user.role)) {
      return res.status(401).json({ error: 'Invalid tourist or guide credentials' });
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
