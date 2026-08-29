const { randomUUID } = require("crypto");
const prisma = require("../config/db");
const bkashService = require("../services/bkash.service");
const nagadService = require("../services/nagad.service");
async function initiatePayment(req, res) {
  try {
    const { bookingId, touristId, guideId, amount, method } = req.body;
    if (!bookingId || !touristId || !guideId || !amount) {
      return res.status(400).json({ success: false, message: "bookingId, touristId, guideId and amount are required" });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Amount must be greater than zero" });
    }

    const paymentMethod = method === "NAGAD" ? "NAGAD" : "BKASH";
    const merchantInvoiceNumber = `EXBD-${Date.now()}-${randomUUID().slice(0, 6)}`;

    if (paymentMethod === "BKASH") {
      const bkashResponse = await bkashService.createPayment({ amount, merchantInvoiceNumber, payerReference: touristId });
      if (bkashResponse.statusCode !== "0000") {
        return res.status(502).json({ success: false, message: "bKash rejected the payment creation request", details: bkashResponse });
      }
      const payment = await prisma.payment.create({
        data: { bookingId, touristId, guideId, amount: Number(amount), method: "BKASH", status: "INITIATED",
          bkashPaymentID: bkashResponse.paymentID, merchantInvoiceNo: merchantInvoiceNumber, payerReference: touristId },
      });
      return res.status(201).json({ success: true, paymentId: payment.id, bkashURL: bkashResponse.bkashURL, paymentID: bkashResponse.paymentID });
    } else {
      const nagadResponse = await nagadService.createPayment({ amount, merchantInvoiceNumber });
      const payment = await prisma.payment.create({
        data: { bookingId, touristId, guideId, amount: Number(amount), method: "NAGAD", status: "ESCROW_HELD",
          bkashTrxID: nagadResponse.trxID, merchantInvoiceNo: merchantInvoiceNumber, payerReference: touristId },
      });
      return res.status(201).json({ success: true, paymentId: payment.id, message: "Nagad payment simulated and held in escrow", payment });
    }
  } catch (err) {
    console.error("initiatePayment error:", err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: "Failed to initiate payment" });
  }
}

async function handleCallback(req, res) {
  try {
    const { paymentID, status } = { ...req.query, ...req.body };
    if (!paymentID) return res.status(400).json({ success: false, message: "paymentID is required" });

    const payment = await prisma.payment.findUnique({ where: { bkashPaymentID: paymentID } });
    if (!payment) return res.status(404).json({ success: false, message: "Payment record not found" });

    if (status === "cancel" || status === "failure") {
      const updated = await prisma.payment.update({ where: { id: payment.id }, data: { status: "CANCELLED" } });
      return res.status(200).json({ success: false, message: `Payment ${status}`, payment: updated });
    }

    const executeResult = await bkashService.executePayment(paymentID);

    if (executeResult.transactionStatus !== "Completed") {
      const updated = await prisma.payment.update({ where: { id: payment.id }, data: { status: "CANCELLED" } });
      return res.status(200).json({ success: false, message: "Payment execution did not complete", details: executeResult, payment: updated });
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "ESCROW_HELD", bkashTrxID: executeResult.trxID },
    });

    return res.status(200).json({ success: true, message: "Payment captured into escrow", payment: updated });
  } catch (err) {
    console.error("handleCallback error:", err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: "Failed to process payment callback" });
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

async function syncPaymentStatus(req, res) {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment || !payment.bkashPaymentID) return res.status(404).json({ success: false, message: "Payment not found" });

    const bkashStatus = await bkashService.queryPayment(payment.bkashPaymentID);
    let status = payment.status;
    if (bkashStatus.transactionStatus === "Completed") status = "ESCROW_HELD";
    else if (["Cancelled", "Failed"].includes(bkashStatus.transactionStatus)) status = "CANCELLED";

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status, bkashTrxID: bkashStatus.trxID || payment.bkashTrxID },
    });

    return res.status(200).json({ success: true, payment: updated, bkashStatus });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to sync payment status" });
  }
}

module.exports = { initiatePayment, handleCallback, getPayment, syncPaymentStatus, releasePayment, refundPayment };
async function releasePayment(req, res) {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: req.params.id } });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.status !== "ESCROW_HELD") {
      return res.status(400).json({ success: false, message: `Cannot release a payment with status ${payment.status}` });
    }

    const commissionRate = 0.10; // 10% platform commission — adjust with your team's actual rate
    const platformCommission = Number((payment.amount * commissionRate).toFixed(2));
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

    if (payment.method === "BKASH" && payment.bkashPaymentID && payment.bkashTrxID) {
      await bkashService.refundTransaction({
        paymentID: payment.bkashPaymentID,
        trxID: payment.bkashTrxID,
        amount: payment.amount,
        reason: req.body.reason || "Booking cancelled",
      });
    } else if (payment.method === "NAGAD" && payment.bkashTrxID) {
      await nagadService.refundTransaction({
        paymentID: payment.merchantInvoiceNo,
        trxID: payment.bkashTrxID,
        amount: payment.amount,
        reason: req.body.reason || "Booking cancelled",
      });
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "REFUNDED" },
    });

    return res.status(200).json({ success: true, message: "Payment refunded to tourist", payment: updated });
  } catch (err) {
    console.error("refundPayment error:", err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: "Failed to refund payment" });
  }
}