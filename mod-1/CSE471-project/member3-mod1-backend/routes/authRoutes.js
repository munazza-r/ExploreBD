const crypto = require('crypto');
const express = require('express');
const SignupOtp = require('../models/SignupOtp');
const User = require('../models/User');
const { hashPassword, verifyPassword } = require('../services/password');
const { createToken } = require('../services/token');
const { sendSignupOtp } = require('../services/email');
const { publicUser, requireAuth } = require('../middleware/auth');

const router = express.Router();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GMAIL_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@gmail\.com$/i;
const ALLOWED_ROLES = new Set(['TOURIST', 'GUIDE']);
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 45 * 1000;
const MAX_OTP_ATTEMPTS = 5;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function otpHash(email, otp) {
  const secret = process.env.JWT_SECRET || 'explorebd_local_development_secret_change_me';
  return crypto.createHmac('sha256', secret).update(`${email}:${otp}`).digest('hex');
}

function normalizeRegistration(body) {
  return {
    name: String(body.name || '').trim().slice(0, 100),
    email: normalizeEmail(body.email),
    password: String(body.password || ''),
    role: String(body.role || 'TOURIST').toUpperCase(),
    country: String(body.country || 'Bangladesh').trim().slice(0, 100),
    phone: String(body.phone || '').trim().slice(0, 50),
    nidOrPassport: String(body.nidOrPassport || '').trim().slice(0, 100),
    university: String(body.university || '').trim().slice(0, 180),
    city: String(body.city || '').trim().slice(0, 100),
    primaryLanguage: String(body.primaryLanguage || '').trim().slice(0, 100)
  };
}

function validateRegistration(registration) {
  if (!registration.name || !registration.email || !registration.password) {
    return 'Name, email address, and password are required';
  }
  if (!EMAIL_PATTERN.test(registration.email)) return 'Please enter a valid email address';
  if (registration.password.length < 8) return 'Password must be at least 8 characters';
  if (!/^\+\d{7,15}$/.test(registration.phone)) return 'Please enter a valid phone number with country code';
  if (!ALLOWED_ROLES.has(registration.role)) return 'Please choose Tourist or Student Guide';
  if (registration.role === 'GUIDE' && !registration.university) {
    return 'University or institution is required for a student guide';
  }
  return null;
}

router.post('/register/request-otp', async (req, res) => {
  try {
    const registration = normalizeRegistration(req.body);
    const validationError = validateRegistration(registration);
    if (validationError) return res.status(400).json({ error: validationError });
    if (!GMAIL_PATTERN.test(registration.email)) {
      return res.status(400).json({ error: 'Gmail OTP requires a valid @gmail.com address' });
    }

    if (await User.exists({ email: registration.email })) {
      return res.status(409).json({ error: 'An account with this Gmail address already exists' });
    }

    const existingOtp = await SignupOtp.findOne({ email: registration.email });
    if (existingOtp && Date.now() - new Date(existingOtp.lastSentAt).getTime() < RESEND_COOLDOWN_MS) {
      return res.status(429).json({ error: 'Please wait 45 seconds before requesting another OTP' });
    }

    const otp = String(crypto.randomInt(100000, 1000000));
    const passwordHash = await hashPassword(registration.password);
    const safeRegistration = { ...registration };
    delete safeRegistration.password;

    const pending = await SignupOtp.findOneAndUpdate(
      { email: registration.email },
      {
        otpHash: otpHash(registration.email, otp),
        passwordHash,
        registration: safeRegistration,
        attempts: 0,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        lastSentAt: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    );

    try {
      await sendSignupOtp({ email: registration.email, name: registration.name, otp });
    } catch (emailError) {
      await SignupOtp.deleteOne({ _id: pending._id, otpHash: pending.otpHash });
      throw emailError;
    }

    return res.json({
      message: `A 6-digit verification code was sent to ${registration.email}`,
      email: registration.email,
      expiresInSeconds: OTP_TTL_MS / 1000
    });
  } catch (error) {
    console.error('Request signup OTP error:', error.message);
    const configurationError = error.message.includes('Gmail OTP is not configured');
    return res.status(configurationError ? 503 : 500).json({
      error: configurationError ? error.message : 'Could not send the verification email'
    });
  }
});

router.post('/register/verify-otp', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();
    if (!GMAIL_PATTERN.test(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'Enter the Gmail address and 6-digit OTP' });
    }

    const pending = await SignupOtp.findOne({ email });
    if (!pending || pending.expiresAt.getTime() <= Date.now()) {
      if (pending) await pending.deleteOne();
      return res.status(410).json({ error: 'This OTP has expired. Request a new code' });
    }
    if (pending.attempts >= MAX_OTP_ATTEMPTS) {
      await pending.deleteOne();
      return res.status(429).json({ error: 'Too many incorrect attempts. Request a new code' });
    }

    const suppliedHash = otpHash(email, otp);
    const expected = Buffer.from(pending.otpHash, 'hex');
    const supplied = Buffer.from(suppliedHash, 'hex');
    if (expected.length !== supplied.length || !crypto.timingSafeEqual(expected, supplied)) {
      pending.attempts += 1;
      await pending.save();
      return res.status(400).json({ error: 'The verification code is incorrect' });
    }

    if (await User.exists({ email })) {
      await pending.deleteOne();
      return res.status(409).json({ error: 'An account with this Gmail address already exists' });
    }

    const user = await User.create({
      ...pending.registration,
      email,
      password: pending.passwordHash,
      emailVerified: true
    });
    await pending.deleteOne();

    const safeUser = publicUser(user);
    return res.status(201).json({
      message: 'Email verified and account created successfully',
      user: safeUser,
      token: createToken(safeUser)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'An account with this Gmail address already exists' });
    }
    console.error('Verify signup OTP error:', error);
    return res.status(500).json({ error: 'Could not verify the signup code' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const registration = normalizeRegistration(req.body);
    const validationError = validateRegistration(registration);
    if (validationError) return res.status(400).json({ error: validationError });

    if (await User.exists({ email: registration.email })) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const passwordHash = await hashPassword(registration.password);
    const userData = { ...registration, password: passwordHash, emailVerified: false };
    const user = await User.create(userData);
    const safeUser = publicUser(user);

    return res.status(201).json({
      message: 'Account created successfully',
      user: safeUser,
      token: createToken(safeUser)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Could not create the account' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    const passwordIsValid = user ? await verifyPassword(password, user.password) : false;
    if (!user || !passwordIsValid) return res.status(401).json({ error: 'Invalid email or password' });

    const safeUser = publicUser(user);
    return res.json({ message: 'Login successful', user: safeUser, token: createToken(safeUser) });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Could not sign in' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
