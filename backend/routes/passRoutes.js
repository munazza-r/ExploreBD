const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const GuideProfile = require('../models/GuideProfile');
const User = require('../models/User');
const { requireAuth, requireGuide, requireTourist } = require('../middleware/auth');
const { PassTokenError, createPassToken, verifyPassToken } = require('../services/passToken');

const router = express.Router();

function secret() {
  return process.env.QR_PASS_SECRET || process.env.JWT_SECRET || 'explorebd_local_qr_secret_change_me';
}

function initials(name) {
  return String(name || 'User').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0].toUpperCase()).join('');
}

function serializeBooking(value) {
  const booking = typeof value.toObject === 'function' ? value.toObject() : { ...value };
  return { ...booking, id: String(booking._id || booking.id) };
}

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function issueReplacementPass(booking) {
  const now = new Date();
  const previousExpiry = new Date(booking.pass.expiresAt).getTime();
  const minimumExpiry = now.getTime() + 24 * 60 * 60 * 1000;
  booking.pass.id = `PASS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  booking.pass.status = 'ACTIVE';
  booking.pass.issuedAt = now;
  booking.pass.expiresAt = new Date(Math.max(previousExpiry, minimumExpiry));
  booking.pass.verifiedAt = null;
  booking.pass.verifiedBy = null;
}

async function reconcileDeletedGuide(booking, preferredGuide = null) {
  const assignedGuide = mongoose.isValidObjectId(booking.guide.id)
    ? await User.findOne({ _id: booking.guide.id, role: 'GUIDE' }).select('name email')
    : null;
  const assignedProfileExists = assignedGuide
    ? await GuideProfile.exists({ userId: String(assignedGuide._id) })
    : false;
  if (assignedGuide && assignedProfileExists) return { booking, reassigned: false };

  let replacement = null;
  const samePreferredName = preferredGuide &&
    preferredGuide.role === 'GUIDE' &&
    preferredGuide.name.trim().toLowerCase() === booking.guide.name.trim().toLowerCase();
  const samePreferredEmail = preferredGuide && booking.guide.email &&
    preferredGuide.email.trim().toLowerCase() === booking.guide.email.trim().toLowerCase();

  if (samePreferredEmail || samePreferredName) {
    replacement = preferredGuide;
  } else if (booking.guide.email) {
    replacement = await User.findOne({ role: 'GUIDE', email: booking.guide.email });
  }

  if (!replacement) {
    const matchingGuides = await User.find({
      role: 'GUIDE',
      ...(assignedGuide ? { _id: { $ne: assignedGuide._id } } : {}),
      name: { $regex: `^${escapeRegex(booking.guide.name)}$`, $options: 'i' }
    }).sort({ createdAt: -1 }).limit(2);
    if (matchingGuides.length === 1) replacement = matchingGuides[0];
  }

  if (!replacement) return { booking, reassigned: false, stale: true };

  booking.guide = {
    id: replacement.id,
    name: replacement.name,
    initials: initials(replacement.name),
    email: replacement.email,
    verified: true
  };
  issueReplacementPass(booking);
  await booking.save();
  return { booking, reassigned: true };
}

async function findOrCreateTouristBooking(tourist) {
  const existing = await Booking.findOne({ 'tourist.id': tourist.id }).sort({ createdAt: -1 });
  if (existing) return reconcileDeletedGuide(existing);

  const guide = await User.findOne({ role: 'GUIDE' }).sort({ createdAt: 1 });
  if (!guide) return { booking: null, reason: 'GUIDE_REQUIRED' };

  const now = new Date();
  const startsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const endsAt = new Date(startsAt.getTime() + 8 * 60 * 60 * 1000);
  const expiresAt = new Date(endsAt.getTime() + 24 * 60 * 60 * 1000);
  const suffix = crypto.randomBytes(4).toString('hex').toUpperCase();

  const booking = await Booking.create({
    reference: `EXP-${suffix}`,
    packageName: "Cox's Bazar Sunrise & Heritage Trail",
    destination: "Cox's Bazar",
    meetingPoint: 'Laboni Beach Point, Kolatoli',
    startsAt,
    endsAt,
    travelers: 2,
    tourist: { id: tourist.id, name: tourist.name, initials: initials(tourist.name), email: tourist.email },
    guide: { id: guide.id, name: guide.name, initials: initials(guide.name), email: guide.email, verified: true },
    payment: {
      status: 'PAID',
      provider: 'bKash',
      transactionId: `TRX${suffix}`,
      amount: 4800,
      currency: 'BDT',
      paidAt: now
    },
    pass: {
      id: `PASS-${suffix}`,
      status: 'ACTIVE',
      issuedAt: now,
      expiresAt
    }
  });
  return { booking, reassigned: false };
}

function sameBookingIdentity(payload, booking) {
  return payload.sub === booking.id && payload.ref === booking.reference && payload.tid === booking.tourist.id;
}

function sameBooking(payload, booking) {
  return sameBookingIdentity(payload, booking) && payload.jti === booking.pass.id && payload.gid === booking.guide.id;
}

router.get('/me', requireAuth, requireTourist, async (req, res) => {
  try {
    const result = await findOrCreateTouristBooking(req.user);
    if (!result.booking && result.reason === 'GUIDE_REQUIRED') {
      return res.status(409).json({ code: 'GUIDE_REQUIRED', message: 'A guide account must exist before a tourist pass can be assigned.' });
    }
    if (!result.booking || result.stale) {
      return res.status(409).json({
        code: 'GUIDE_REASSIGN_REQUIRED',
        message: 'The previously assigned guide was removed and no unique replacement account was found.'
      });
    }
    return res.json({ booking: serializeBooking(result.booking), guideReassigned: result.reassigned });
  } catch (error) {
    console.error('Tourist booking error:', error);
    return res.status(500).json({ message: 'The tourist booking could not be loaded.' });
  }
});

router.get('/:bookingId', requireAuth, requireTourist, async (req, res) => {
  try {
    const bookingDocument = await Booking.findById(req.params.bookingId);
    if (!bookingDocument || bookingDocument.tourist.id !== req.user.id) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Booking not found.' });
    }
    if (bookingDocument.payment.status !== 'PAID') {
      return res.status(409).json({ code: 'PAYMENT_REQUIRED', message: 'The QR pass is issued only after successful payment.' });
    }
    let booking = serializeBooking(bookingDocument);
    return res.json({ booking, token: createPassToken(booking, secret()) });
  } catch (error) {
    console.error('Booking pass error:', error);
    return res.status(500).json({ message: 'The booking pass could not be loaded.' });
  }
});

router.post('/verify', requireAuth, requireGuide, async (req, res) => {
  const token = String(req.body.token || '').trim();
  if (!token) return res.status(400).json({ valid: false, code: 'MISSING_INPUT', message: 'A QR pass is required.' });

  try {
    const payload = verifyPassToken(token, secret());
    const bookingDocument = await Booking.findById(payload.sub);
    if (!bookingDocument) {
      return res.status(404).json({ valid: false, code: 'BOOKING_MISMATCH', message: 'This pass does not match an active ExploreBD booking.' });
    }
    let booking = serializeBooking(bookingDocument);
    if (!sameBooking(payload, booking)) {
      if (sameBookingIdentity(payload, booking)) {
        return res.status(409).json({
          valid: false,
          code: 'PASS_REPLACED',
          message: 'This QR was replaced after the guide account changed. Ask the tourist to refresh and show the new QR pass.'
        });
      }
      return res.status(404).json({ valid: false, code: 'BOOKING_MISMATCH', message: 'This pass does not match an active ExploreBD booking.' });
    }
    if (booking.payment.status !== 'PAID') {
      return res.status(409).json({ valid: false, code: 'PAYMENT_NOT_CONFIRMED', message: 'Payment is not confirmed for this booking.' });
    }
    if (booking.guide.id !== req.user.id) {
      const repair = await reconcileDeletedGuide(bookingDocument, req.user);
      if (repair.reassigned) {
        booking = serializeBooking(repair.booking);
      } else {
        return res.status(403).json({ valid: false, code: 'WRONG_GUIDE', message: 'This booking is assigned to a different guide.' });
      }
    }
    if (booking.pass.status === 'REVOKED') {
      return res.status(410).json({ valid: false, code: 'PASS_REVOKED', message: 'This booking pass has been revoked.' });
    }
    if (booking.pass.status === 'CHECKED_IN') {
      return res.json({ valid: true, alreadyVerified: true, code: 'ALREADY_VERIFIED', message: 'This booking was already verified.', booking });
    }

    bookingDocument.pass.status = 'CHECKED_IN';
    bookingDocument.pass.verifiedAt = new Date();
    bookingDocument.pass.verifiedBy = req.user.id;
    await bookingDocument.save();
    return res.json({
      valid: true,
      alreadyVerified: false,
      code: booking.guide.id === payload.gid ? 'VERIFIED' : 'VERIFIED_REASSIGNED',
      message: booking.guide.id === payload.gid
        ? 'Booking verified. The travelers are ready to check in.'
        : 'Guide account relinked and booking verified successfully.',
      booking: serializeBooking(bookingDocument)
    });
  } catch (error) {
    if (error instanceof PassTokenError) {
      return res.status(error.code === 'EXPIRED' ? 410 : 400).json({ valid: false, code: error.code, message: error.message });
    }
    console.error('QR verification error:', error);
    return res.status(500).json({ valid: false, code: 'SERVER_ERROR', message: 'The pass could not be verified right now.' });
  }
});

module.exports = router;
