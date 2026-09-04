const SSLCommerzPayment = require('sslcommerz-lts');
const sslConfig = require('../config/sslcommerz.config');

/**
 * Initiates a payment session with SSLCommerz's sandbox.
 * Returns a GatewayPageURL — the tourist is redirected there to pay
 * via bKash, Nagad, Rocket, or Visa/Mastercard/Amex (their choice,
 * all handled by SSLCommerz's hosted checkout page).
 */
async function initSession({ amount, merchantInvoiceNumber, touristId, callbackBaseUrl }) {
  const sslcz = new SSLCommerzPayment(sslConfig.store_id, sslConfig.store_passwd, sslConfig.is_live);

  const data = {
    total_amount: amount,
    currency: 'BDT',
    tran_id: merchantInvoiceNumber, // must be unique per transaction
    success_url: `${callbackBaseUrl}/api/payments/sslcz/success`,
    fail_url: `${callbackBaseUrl}/api/payments/sslcz/fail`,
    cancel_url: `${callbackBaseUrl}/api/payments/sslcz/cancel`,
    ipn_url: `${callbackBaseUrl}/api/payments/sslcz/ipn`,
    shipping_method: 'NO',
    product_name: 'ExploreBD Tour Booking',
    product_category: 'Service',
    product_profile: 'general',
    cus_name: touristId,
    cus_email: 'tourist@example.com', // placeholder until real user accounts exist
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01700000000',
    ship_name: touristId,
    ship_add1: 'Dhaka',
    ship_city: 'Dhaka',
    ship_postcode: '1000',
    ship_country: 'Bangladesh',
  };

  const apiResponse = await sslcz.init(data);
  return apiResponse; // contains GatewayPageURL
}

/**
 * Validates a transaction with SSLCommerz's Order Validation API.
 * CRITICAL: never trust the success redirect alone — always confirm
 * the transaction actually succeeded by calling this, since a
 * redirect URL can be visited/faked without a real payment happening.
 */
async function validateTransaction(val_id) {
  const sslcz = new SSLCommerzPayment(sslConfig.store_id, sslConfig.store_passwd, sslConfig.is_live);
  const validation = await sslcz.validate({ val_id });
  return validation;
}

/**
 * Initiates a refund for a previously validated transaction.
 */
async function initiateRefund({ bank_tran_id, amount, refund_remarks }) {
  const sslcz = new SSLCommerzPayment(sslConfig.store_id, sslConfig.store_passwd, sslConfig.is_live);
  const refund = await sslcz.initiateRefund({
    refund_amount: amount,
    refund_remarks: refund_remarks || 'Booking cancelled',
    bank_tran_id,
    refe_id: `REF-${Date.now()}`,
  });
  return refund;
}

module.exports = { initSession, validateTransaction, initiateRefund };