const crypto = require('crypto');

class PassTokenError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'PassTokenError';
    this.code = code;
  }
}

function signatureFor(payloadSegment, secret) {
  return crypto.createHmac('sha256', secret).update(payloadSegment).digest('base64url');
}

function createPassToken(booking, secret) {
  if (!booking?.pass?.id || !booking?.id) {
    throw new PassTokenError('INVALID_BOOKING', 'A booking with an issued pass is required.');
  }

  const payload = {
    v: 1,
    iss: 'ExploreBD',
    typ: 'booking-pass',
    jti: booking.pass.id,
    sub: booking.id,
    ref: booking.reference,
    gid: booking.guide.id,
    tid: booking.tourist.id,
    iat: Math.floor(new Date(booking.pass.issuedAt).getTime() / 1000),
    exp: Math.floor(new Date(booking.pass.expiresAt).getTime() / 1000)
  };

  const payloadSegment = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${payloadSegment}.${signatureFor(payloadSegment, secret)}`;
}

function verifyPassToken(token, secret, now = new Date()) {
  const [payloadSegment, suppliedSignature, extra] = String(token || '').trim().split('.');
  if (!payloadSegment || !suppliedSignature || extra) {
    throw new PassTokenError('MALFORMED', 'The QR pass format is invalid.');
  }

  const expectedSignature = signatureFor(payloadSegment, secret);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (suppliedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    throw new PassTokenError('INVALID_SIGNATURE', 'This QR pass is not authentic.');
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadSegment, 'base64url').toString('utf8'));
  } catch {
    throw new PassTokenError('MALFORMED', 'The QR pass data could not be read.');
  }

  if (payload.v !== 1 || payload.iss !== 'ExploreBD' || payload.typ !== 'booking-pass' ||
      !payload.jti || !payload.sub || !payload.ref || !payload.gid || !payload.tid || !Number.isFinite(payload.exp)) {
    throw new PassTokenError('INVALID_CLAIMS', 'This QR pass is missing required verification data.');
  }
  if (Math.floor(now.getTime() / 1000) > payload.exp) {
    throw new PassTokenError('EXPIRED', 'This QR booking pass has expired.');
  }
  return payload;
}

module.exports = { PassTokenError, createPassToken, verifyPassToken };
