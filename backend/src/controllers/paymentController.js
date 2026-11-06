const { randomUUID } = require("crypto");
const prisma = require("../prisma");
const sslczService = require("../services/sslcommerz.service");

const CALLBACK_BASE_URL = process.env.SSLCZ_CALLBACK_BASE_URL || "http://localhost:5050";
const FRONTEND_URL = process.env.CLIENT_URL || "http://localhost:5173";
const COMMISSION_RATE = Number(process.env.PLATFORM_COMMISSION_RATE) || 0.10;

// POST /api/payments/initiate - tourist starts a payment for a confirmed booking
// (touristId now comes from the logged-in session, not the request body)
async function initiatePayment(req, res) {
  try {
    const { bookingId, guideId, amount } = req.body;

    if (!bookingId || !guideId || !amount) {
      return res.status(400).json({ success: false, message: "bookingId, guideId and amount are required" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than zero" });
    }

    const guide = await prisma.guide.findUnique({ where: { id: guideId } });
    if (!guide) return res.status(404).json({ success: false, message: "Guide not found" });

    const merchantInvoiceNumber = `EXBD-${Date.now()}-${randomUUID().slice(0, 6)}`;

    const sslResponse = await sslczService.initSession({
      amount: Number(amount),
      merchantInvoiceNumber,
      touristName: req.user.name,
      touristEmail: req.user.email,
      callbackBaseUrl: CALLBACK_BASE_URL,
    });

    if (!sslResponse || sslResponse.status !== "SUCCESS") {
      return res.status(502).json({ success: false, message: "SSLCommerz rejected the payment session", details: sslResponse });
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        touristId: req.user.id,
        guideId,
        amount: Number(amount),
        method: "SSLCOMMERZ",
        status: "INITIATED",
        merchantInvoiceNo: merchantInvoiceNumber,
        payerReference: req.user.id,
      },
    });

    return res.status(201).json({ success: true, paymentId: payment.id, gatewayURL: sslResponse.GatewayPageURL });
  } catch (err) {
    console.error("initiatePayment error:", err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: "Failed to initiate payment" });
  }
}

// SSLCommerz redirects (POST) here after checkout - unchanged from the original
async function handleSuccess(req, res) {
  try {
    const { val_id, tran_id, bank_tran_id, card_type } = req.body;

    const validation = await sslczService.validateTransaction(val_id);

    if (validation.status !== "VALID" && validation.status !== "VALIDATED") {
      await prisma.payment.updateMany({ where: { merchantInvoiceNo: tran_id }, data: { status: "CANCELLED" } });
      return res.redirect(`${FRONTEND_URL}/payment/callback?status=fail`);
    }

    await prisma.payment.updateMany({
      where: { merchantInvoiceNo: tran_id },
      data: { status: "ESCROW_HELD", sslczValId: val_id, sslczBankTrxId: bank_tran_id, sslczCardType: card_type },
    });

    const payment = await prisma.payment.findFirst({ where: { merchantInvoiceNo: tran_id } });
    return res.redirect(`${FRONTEND_URL}/payment/callback?status=success&paymentId=${payment.id}`);
  } catch (err) {
    console.error("handleSuccess error:", err?.response?.data || err.message);
    return res.redirect(`${FRONTEND_URL}/payment/callback?status=error`);
  }
}

async function handleFail(req, res) {
  const { tran_id } = req.body;
  if (tran_id) await prisma.payment.updateMany({ where: { merchantInvoiceNo: tran_id }, data: { status: "CANCELLED" } });
  return res.redirect(`${FRONTEND_URL}/payment/callback?status=fail`);
}

async function handleCancel(req, res) {
  const { tran_id } = req.body;
  if (tran_id) await prisma.payment.updateMany({ where: { merchantInvoiceNo: tran_id }, data: { status: "CANCELLED" } });
  return res.redirect(`${FRONTEND_URL}/payment/callback?status=cancel`);
}

async function handleIpn(req, res) {
  try {
    const { val_id, tran_id } = req.body;
    if (!val_id || !tran_id) return res.status(400).send("Missing val_id or tran_id");

    const validation = await sslczService.validateTransaction(val_id);
    if (validation.status === "VALID" || validation.status === "VALIDATED") {
      await prisma.payment.updateMany({ where: { merchantInvoiceNo: tran_id }, data: { status: "ESCROW_HELD", sslczValId: val_id } });
    }
    return res.status(200).send("IPN received");
  } catch (err) {
    console.error("handleIpn error:", err.message);
    return res.status(500).send("IPN processing failed");
  }
}

async function getPayment(req, res) {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    return res.status(200).json({ success: true, payment });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch payment" });
  }
}

async function getAllPayments(req, res) {
  try {
    const payments = await prisma.payment.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json({ success: true, payments });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
}

// PATCH /api/payments/:id/complete - "After a tourist marks their tour as completed"
// Now checks the payment actually belongs to the logged-in tourist.
async function markTourCompleted(req, res) {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.touristId !== req.user.id) {
      return res.status(403).json({ success: false, message: "This isn't your payment to mark complete." });
    }
    if (payment.status !== "ESCROW_HELD") {
      return res.status(400).json({ success: false, message: `Cannot mark tour complete for a payment with status ${payment.status}` });
    }
    if (payment.tourCompleted) {
      return res.status(400).json({ success: false, message: "Tour is already marked as completed" });
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { tourCompleted: true, tourCompletedAt: new Date() },
    });

    return res.status(200).json({ success: true, message: "Tour marked as completed. Funds can now be released.", payment: updated });
  } catch (err) {
    console.error("markTourCompleted error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to mark tour as completed" });
  }
}

// PATCH /api/payments/:id/release - "the platform automatically calculates and
// deducts its commission, then releases the remaining payout to the guide"
async function releasePayment(req, res) {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.status !== "ESCROW_HELD") {
      return res.status(400).json({ success: false, message: `Cannot release a payment with status ${payment.status}` });
    }
    if (!payment.tourCompleted) {
      return res.status(400).json({ success: false, message: "Cannot release funds until the tour is marked as completed." });
    }

    const platformCommission = Number((payment.amount * COMMISSION_RATE).toFixed(2));
    const guideEarning = Number((payment.amount - platformCommission).toFixed(2));

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "RELEASED", platformCommission, guideEarning },
    });

    return res.status(200).json({ success: true, message: "Funds released to guide", payment: updated });
  } catch (err) {
    console.error("releasePayment error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to release payment" });
  }
}

async function refundPayment(req, res) {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.status !== "ESCROW_HELD") {
      return res.status(400).json({ success: false, message: `Cannot refund a payment with status ${payment.status}` });
    }

    if (payment.sslczBankTrxId) {
      await sslczService.initiateRefund({
        bank_tran_id: payment.sslczBankTrxId,
        amount: payment.amount,
        refund_remarks: req.body.reason || "Booking cancelled",
      });
    }

    const updated = await prisma.payment.update({ where: { id: payment.id }, data: { status: "REFUNDED" } });
    return res.status(200).json({ success: true, message: "Payment refunded to tourist", payment: updated });
  } catch (err) {
    console.error("refundPayment error:", err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: "Failed to refund payment" });
  }
}

// GET /api/payments/guide/earnings - guide's own earnings dashboard, real-time
async function getGuideEarnings(req, res) {
  try {
    const guide = await prisma.guide.findUnique({ where: { userId: req.user.id } });
    if (!guide) return res.status(404).json({ success: false, message: "Create your guide profile first." });

    const payments = await prisma.payment.findMany({ where: { guideId: guide.id }, orderBy: { createdAt: "desc" } });
    const totalReleased = payments.filter((p) => p.status === "RELEASED").reduce((sum, p) => sum + (p.guideEarning || 0), 0);
    const totalPending = payments.filter((p) => p.status === "ESCROW_HELD").reduce((sum, p) => sum + p.amount, 0);
    const totalCommissionPaid = payments.filter((p) => p.status === "RELEASED").reduce((sum, p) => sum + (p.platformCommission || 0), 0);

    res.status(200).json({ success: true, payments, summary: { totalReleased, totalPending, totalCommissionPaid } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch earnings" });
  }
}

module.exports = {
  initiatePayment, handleSuccess, handleFail, handleCancel, handleIpn,
  getPayment, getAllPayments, releasePayment, refundPayment, markTourCompleted, getGuideEarnings,
};