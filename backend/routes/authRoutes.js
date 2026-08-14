const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, country, nidOrPassport } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name,
      email,
      role: role || 'GUIDE',
      country: country || 'Bangladesh',
      nidOrPassport: nidOrPassport || ''
    };

    res.status(201).json({ message: 'Registration successful', user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = {
      id: 'demo_guide',
      name: 'Md. Muntasir Rahman',
      email: email || 'muntasir@explorebd.com',
      role: 'GUIDE'
    };
    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
