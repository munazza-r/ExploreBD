const prisma = require("../db");

const DEFAULT_COMMISSION_PERCENT = Number(process.env.COMMISSION_PERCENT) || 15;

// GET /api/payments/customer/:touristName - a tourist's own payments (escrow status)
async function getCustomerPayments(req, res) {
  try {
    const { touristName } = req.params;
    const payments = await prisma.payment.findMany({
      where: { touristName },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching payments" });
  }
}

// GET /api/payments/guide/:guideName - a guide's earnings dashboard
async function getGuideEarnings(req, res) {
  try {
    const { guideName } = req.params;
    const payments = await prisma.payment.findMany({
      where: { guideName },
      orderBy: { createdAt: "desc" },
    });

    const totalReleased = payments
      .filter((p) => p.status === "RELEASED")
      .reduce((sum, p) => sum + p.payoutAmount, 0);
    const totalPending = payments
      .filter((p) => p.status === "IN_ESCROW")
      .reduce((sum, p) => sum + p.totalAmount, 0);
    const totalCommissionPaid = payments
      .filter((p) => p.status === "RELEASED")
      .reduce((sum, p) => sum + p.commissionAmount, 0);

    res.status(200).json({ payments, summary: { totalReleased, totalPending, totalCommissionPaid } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching earnings" });
  }
}

// POST /api/payments/:id/release - tourist marks the tour complete; platform releases payout to guide
async function releasePayment(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.payment.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Payment not found" });
    if (existing.status === "RELEASED") {
      return res.status(400).json({ error: "This payment has already been released" });
    }

    const commissionAmount = Math.round((existing.totalAmount * existing.commissionPercent) / 100);
    const payoutAmount = existing.totalAmount - commissionAmount;

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status: "RELEASED",
        commissionAmount,
        payoutAmount,
        completedAt: new Date(),
      },
    });

    res.status(200).json({ response: "Tour marked complete. Payment released to guide.", payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while releasing the payment" });
  }
}

// GET /api/payments - list everything (for testing/admin)
async function getAllPayments(req, res) {
  try {
    const payments = await prisma.payment.findMany({ orderBy: { createdAt: "desc" } });
    res.status(200).json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong while fetching payments" });
  }
}

module.exports = { getCustomerPayments, getGuideEarnings, releasePayment, getAllPayments };
