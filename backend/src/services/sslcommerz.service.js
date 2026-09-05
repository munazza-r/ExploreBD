const SSLCommerzPayment = require('sslcommerz-lts');
const sslConfig = require('../config/sslcommerz.config');

async function initSession({ amount, merchantInvoiceNumber, touristName, touristEmail, callbackBaseUrl }) {
  const sslcz = new SSLCommerzPayment(sslConfig.store_id, sslConfig.store_passwd, sslConfig.is_live);

  const data = {
    total_amount: amount,
    currency: 'BDT',
    tran_id: merchantInvoiceNumber,
    success_url: `${callbackBaseUrl}/api/payments/sslcz/success`,
    fail_url: `${callbackBaseUrl}/api/payments/sslcz/fail`,
    cancel_url: `${callbackBaseUrl}/api/payments/sslcz/cancel`,
    ipn_url: `${callbackBaseUrl}/api/payments/sslcz/ipn`,
    shipping_method: 'NO',
    product_name: 'ExploreBD Tour Booking',
    product_category: 'Service',
    product_profile: 'general',
    cus_name: touristName,
    cus_email: touristEmail,
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01700000000',
    ship_name: touristName,
    ship_add1: 'Dhaka',
    ship_city: 'Dhaka',
    ship_postcode: '1000',
    ship_country: 'Bangladesh',
  };

  const apiResponse = await sslcz.init(data);
  return apiResponse;
}

async function validateTransaction(val_id) {
  const sslcz = new SSLCommerzPayment(sslConfig.store_id, sslConfig.store_passwd, sslConfig.is_live);
  return sslcz.validate({ val_id });
}

async function initiateRefund({ bank_tran_id, amount, refund_remarks }) {
  const sslcz = new SSLCommerzPayment(sslConfig.store_id, sslConfig.store_passwd, sslConfig.is_live);
  return sslcz.initiateRefund({
    refund_amount: amount,
    refund_remarks: refund_remarks || 'Booking cancelled',
    bank_tran_id,
    refe_id: `REF-${Date.now()}`,
  });
}

module.exports = { initSession, validateTransaction, initiateRefund };