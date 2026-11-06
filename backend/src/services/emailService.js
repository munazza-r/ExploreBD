const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const BRAND = "ExploreBD";

// Generic sender — every function below calls this
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"${BRAND}" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    // Never throw — a failed email should not break the main request
  }
};

// ── Registration ─────────────────────────────────────────────

const sendRegistrationConfirmationEmail = (to, name) => {
  return sendEmail({
    to,
    subject: "Welcome to ExploreBD!",
    html: `
      <h2>Welcome to ExploreBD, ${name || "there"}!</h2>
      <p>Your account has been created successfully.</p>
      <p>If you registered as a guide, don't forget to submit your verification documents so tourists can find and book you.</p>
      <p>— ${BRAND} Team</p>
    `,
  });
};

// ── Guide Verification ───────────────────────────────────────

const sendVerificationReceivedEmail = (to, universityName) => {
  return sendEmail({
    to,
    subject: "We've received your verification documents",
    html: `
      <h2>Thanks for submitting your guide verification!</h2>
      <p>We've received your documents for <strong>${universityName}</strong>.</p>
      <p>Our admin team will review them shortly. You'll get another email once a decision is made.</p>
      <p>— ${BRAND} Team</p>
    `,
  });
};

const sendVerificationResultEmail = (to, status, rejectionReason) => {
  const isApproved = status === "APPROVED";
  return sendEmail({
    to,
    subject: isApproved ? "🎉 Congratulations — You're Verified on ExploreBD!" : "Verification Update",
    html: isApproved
      ? `
        <h2>Congratulations! You're verified.</h2>
        <p>Your guide documents have been approved. You're now visible to tourists and can start accepting bookings on ${BRAND}.</p>
        <p>— ${BRAND} Team</p>
      `
      : `
        <h2>Your verification was not approved</h2>
        <p>Reason: ${rejectionReason || "Not specified"}</p>
        <p>Please review your documents and resubmit.</p>
        <p>— ${BRAND} Team</p>
      `,
  });
};

// ── Booking (ready for Module 2 to call once booking data exists) ──

const sendBookingNotificationEmail = (to, bookingDetails) => {
  return sendEmail({
    to,
    subject: "New Booking Request — ExploreBD",
    html: `
      <h2>You have a new booking request!</h2>
      <p>Tourist: ${bookingDetails.touristName || bookingDetails.touristId}</p>
      <p>Date: ${bookingDetails.date}</p>
      <p>Package: ${bookingDetails.packageName}</p>
      <p>Please log in to accept or decline this request.</p>
      <p>— ${BRAND} Team</p>
    `,
  });
};

const sendBookingReceiptEmail = (to, bookingDetails) => {
  return sendEmail({
    to,
    subject: "Booking Confirmed — ExploreBD",
    html: `
      <h2>Your booking is confirmed!</h2>
      <p>Booking Reference: ${bookingDetails.bookingRef}</p>
      <p>Guide: ${bookingDetails.guideName}</p>
      <p>Date: ${bookingDetails.date}</p>
      <p>Package: ${bookingDetails.packageName}</p>
      <p>Amount: ৳${bookingDetails.amount}</p>
      <p>— ${BRAND} Team</p>
    `,
  });
};

// ── Payment (ready for Module 3 / SSLCommerz to call) ───────────

const sendPaymentConfirmationEmail = (to, paymentDetails) => {
  return sendEmail({
    to,
    subject: "Payment Confirmation — ExploreBD",
    html: `
      <h2>Payment Received</h2>
      <p>Amount: ৳${paymentDetails.amount}</p>
      <p>Transaction ID: ${paymentDetails.transactionId}</p>
      <p>Booking: ${paymentDetails.bookingRef}</p>
      <p>Your payment is held securely by the platform until your tour is completed.</p>
      <p>— ${BRAND} Team</p>
    `,
  });
};

// ── SOS Emergency Alert ──────────────────────────────────────

const sendSosAlertEmail = (adminEmail, sosDetails) => {
  return sendEmail({
    to: adminEmail,
    subject: `🚨 SOS ALERT — Immediate Attention Required`,
    html: `
      <h2 style="color:#dc2626;">Emergency SOS Triggered</h2>
      <p><strong>User:</strong> ${sosDetails.userName || sosDetails.userId} (${sosDetails.userEmail})</p>
      <p><strong>Location:</strong> ${sosDetails.location || "Not provided"}</p>
      <p><strong>Booking Reference:</strong> ${sosDetails.bookingRef || "N/A"}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Message:</strong> ${sosDetails.message || "No additional message provided."}</p>
      <p style="color:#dc2626; font-weight:bold;">Please contact the user immediately and follow emergency protocol.</p>
    `,
  });
};

// ── Generic reminder/notification — reusable for anything future ──

const sendReminderEmail = (to, subject, message) => {
  return sendEmail({
    to,
    subject,
    html: `<p>${message}</p><p>— ${BRAND} Team</p>`,
  });
};

module.exports = {
  sendRegistrationConfirmationEmail,
  sendVerificationReceivedEmail,
  sendVerificationResultEmail,
  sendBookingNotificationEmail,
  sendBookingReceiptEmail,
  sendPaymentConfirmationEmail,
  sendSosAlertEmail,
  sendReminderEmail,
};