const nodemailer = require('nodemailer');

function gmailTransport() {
  const user = String(process.env.GMAIL_USER || '').trim();
  const pass = String(process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (!user || !pass) {
    throw new Error('Gmail OTP is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env.');
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    disableFileAccess: true,
    disableUrlAccess: true
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

async function sendSignupOtp({ email, name, otp }) {
  if (process.env.EMAIL_MODE === 'console' && process.env.NODE_ENV !== 'production') {
    console.log(`[development OTP] ${email}: ${otp}`);
    return;
  }

  const sender = String(process.env.GMAIL_USER || '').trim();
  const safeName = escapeHtml(name);
  await gmailTransport().sendMail({
    from: `ExploreBD <${sender}>`,
    to: email,
    subject: 'Your ExploreBD signup verification code',
    text: `Hello ${name}, your ExploreBD verification code is ${otp}. It expires in 10 minutes.`,
    html: `<div style="font-family:Arial,sans-serif;color:#172033"><h2 style="color:#047857">ExploreBD email verification</h2><p>Hello ${safeName},</p><p>Use this code to finish creating your account:</p><p style="font-size:30px;font-weight:800;letter-spacing:8px;color:#065f46">${otp}</p><p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>`,
    disableFileAccess: true,
    disableUrlAccess: true
  });
}

module.exports = { sendSignupOtp };
