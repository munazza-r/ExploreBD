const assert = require('node:assert/strict');
const test = require('node:test');
const { PassTokenError, createPassToken, verifyPassToken } = require('../services/passToken');

const secret = 'test-secret-that-is-long-enough-for-signing';
const booking = {
  id: 'booking-1',
  reference: 'EXP-TEST',
  guide: { id: 'guide-1' },
  tourist: { id: 'tourist-1' },
  pass: {
    id: 'pass-1',
    issuedAt: '2026-08-29T00:00:00.000Z',
    expiresAt: '2026-09-29T00:00:00.000Z'
  }
};

test('creates and verifies a signed booking pass', () => {
  const token = createPassToken(booking, secret);
  const payload = verifyPassToken(token, secret, new Date('2026-09-01T00:00:00.000Z'));
  assert.equal(payload.sub, booking.id);
  assert.equal(payload.gid, booking.guide.id);
  assert.equal(payload.tid, booking.tourist.id);
});

test('rejects a tampered signature', () => {
  const token = createPassToken(booking, secret);
  assert.throws(
    () => verifyPassToken(`${token}tampered`, secret, new Date('2026-09-01T00:00:00.000Z')),
    error => error instanceof PassTokenError && error.code === 'INVALID_SIGNATURE'
  );
});

test('rejects an expired pass', () => {
  const token = createPassToken(booking, secret);
  assert.throws(
    () => verifyPassToken(token, secret, new Date('2026-10-01T00:00:00.000Z')),
    error => error instanceof PassTokenError && error.code === 'EXPIRED'
  );
});
