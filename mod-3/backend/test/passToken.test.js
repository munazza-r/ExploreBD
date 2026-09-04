const test = require("node:test");
const assert = require("node:assert/strict");
const { createDemoBooking } = require("../src/data/bookingStore");
const { createPassToken, verifyPassToken } = require("../src/services/passToken");

const SECRET = "a-test-secret-that-is-long-enough-for-hmac";

test("creates and verifies an authentic booking pass", () => {
  const booking = createDemoBooking();
  const token = createPassToken(booking, SECRET);
  const payload = verifyPassToken(token, SECRET, new Date("2026-09-12T03:00:00.000Z"));

  assert.equal(payload.sub, booking.id);
  assert.equal(payload.jti, booking.pass.id);
  assert.equal(payload.gid, booking.guide.id);
  assert.equal(payload.tid, booking.tourist.id);
});

test("rejects a tampered QR payload", () => {
  const token = createPassToken(createDemoBooking(), SECRET);
  const [payload, signature] = token.split(".");
  const tampered = `${payload.slice(0, -1)}A.${signature}`;

  assert.throws(
    () => verifyPassToken(tampered, SECRET, new Date("2026-09-12T03:00:00.000Z")),
    (error) => error.code === "INVALID_SIGNATURE",
  );
});

test("rejects a pass after its expiry", () => {
  const token = createPassToken(createDemoBooking(), SECRET);

  assert.throws(
    () => verifyPassToken(token, SECRET, new Date("2026-09-14T03:00:00.000Z")),
    (error) => error.code === "EXPIRED",
  );
});
