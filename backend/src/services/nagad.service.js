const crypto = require('crypto');

/**
 * Simulated Nagad Payment Gateway Service
 *
 * NOTE: Nagad's real merchant API requires business registration and
 * approval (unlike bKash's open developer sandbox at developer.bka.sh).
 * This module simulates Nagad's checkout response shape so the rest of
 * the app (controller, schema, escrow lifecycle) can treat BKASH and
 * NAGAD payments identically. Replace the internals of these functions
 * with real Nagad API calls once merchant sandbox access is available —
 * the function signatures are designed to match what a real integration
 * would need, so no other file should need to change.
 */

// Simulates creating a payment session with Nagad
async function createPayment({ amount, merchantInvoiceNumber }) {
  // simulate network round-trip to the sandbox
  await new Promise((resolve) => setTimeout(resolve, 600));

  const paymentRefId = `NGD_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const trxID = `NGDTXN${Date.now()}`;

  return {
    statusCode: "0000",
    statusMessage: "Successful",
    paymentID: paymentRefId,
    trxID,
    merchantInvoiceNumber,
    amount: String(amount),
    currency: "BDT",
    createTime: new Date().toISOString(),
  };
}

// Simulates checking the status of a previously created payment
async function queryPayment(paymentID) {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    paymentID,
    transactionStatus: "Completed",
    statusCode: "0000",
  };
}

// Simulates refunding a completed Nagad payment
async function refundTransaction({ paymentID, trxID, amount, reason }) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    statusCode: "0000",
    statusMessage: "Refund successful",
    paymentID,
    trxID,
    refundAmount: String(amount),
    reason: reason || "Booking cancelled",
    refundTime: new Date().toISOString(),
  };
}

module.exports = { createPayment, queryPayment, refundTransaction };