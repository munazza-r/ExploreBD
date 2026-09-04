const crypto = require('crypto');

/**
 * Temporary bKash simulation — used only until real developer.bka.sh
 * sandbox credentials are obtained (their portal requires a separate
 * merchant/developer registration step beyond the public docs site).
 *
 * Matches the exact response shape bkash.service.js expects, so
 * switching back to the real service later requires no changes
 * anywhere else in the codebase — just swap which file is required
 * in payment.controller.js.
 */

async function createPayment({ amount, merchantInvoiceNumber }) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const paymentID = `BKASH_SIM_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  return {
    statusCode: "0000",
    statusMessage: "Successful",
    paymentID,
    bkashURL: `http://localhost:5173/payment/callback?paymentID=${paymentID}&status=success`,
    merchantInvoiceNumber,
    amount: String(amount),
  };
}

async function executePayment(paymentID) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    statusCode: "0000",
    transactionStatus: "Completed",
    paymentID,
    trxID: `BKTXN${Date.now()}`,
  };
}

async function queryPayment(paymentID) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { paymentID, transactionStatus: "Completed", statusCode: "0000" };
}

async function refundTransaction({ paymentID, trxID, amount, reason }) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    statusCode: "0000",
    statusMessage: "Refund successful",
    paymentID,
    trxID,
    refundAmount: String(amount),
    reason: reason || "Booking cancelled",
  };
}

module.exports = { createPayment, executePayment, queryPayment, refundTransaction };