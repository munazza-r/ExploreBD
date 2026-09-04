const DEMO_BOOKING_ID = "EB-BKG-260912-1042";

function createDemoBooking() {
  return {
    id: DEMO_BOOKING_ID,
    reference: "EXP-7F3K92",
    packageName: "Cox's Bazar Sunrise & Heritage Trail",
    destination: "Cox's Bazar",
    meetingPoint: "Laboni Beach Point, Kolatoli",
    startsAt: "2026-09-12T00:30:00.000Z",
    endsAt: "2026-09-12T08:30:00.000Z",
    travelers: 2,
    tourist: {
      id: "tourist-ayesha",
      name: "Ayesha Karim",
      initials: "AK",
    },
    guide: {
      id: "guide-muntasir",
      name: "Muntasir Rahman",
      initials: "MR",
      verified: true,
    },
    payment: {
      status: "PAID",
      provider: "bKash",
      transactionId: "TRX8J4A91BD",
      amount: 4800,
      currency: "BDT",
      paidAt: "2026-08-29T06:42:00.000Z",
    },
    pass: {
      id: "PASS-9C4A-7F3K",
      status: "ACTIVE",
      issuedAt: "2026-08-29T06:42:04.000Z",
      expiresAt: "2026-09-13T08:30:00.000Z",
      verifiedAt: null,
      verifiedBy: null,
    },
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

class BookingStore {
  constructor() {
    this.reset();
  }

  reset() {
    const booking = createDemoBooking();
    this.bookings = new Map([[booking.id, booking]]);
    return clone(booking);
  }

  getById(id) {
    const booking = this.bookings.get(id);
    return booking ? clone(booking) : null;
  }

  verifyBooking(id, guideId, verifiedAt = new Date()) {
    const booking = this.bookings.get(id);
    if (!booking) return null;
    if (booking.pass.status === "CHECKED_IN") return clone(booking);

    booking.pass.status = "CHECKED_IN";
    booking.pass.verifiedAt = verifiedAt.toISOString();
    booking.pass.verifiedBy = guideId;
    return clone(booking);
  }
}

module.exports = {
  BookingStore,
  DEMO_BOOKING_ID,
  createDemoBooking,
};

