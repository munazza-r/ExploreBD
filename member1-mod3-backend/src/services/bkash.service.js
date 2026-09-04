const axios = require("axios");
const bkashConfig = require("../config/bkash.config");

let tokenCache = { idToken: null, refreshToken: null, expiresAt: 0 };

const authHeaders = (idToken) => ({
  Authorization: idToken,
  "X-APP-Key": bkashConfig.appKey,
  "Content-Type": "application/json",
  Accept: "application/json",
});

async function getToken() {
  const now = Date.now();
  if (tokenCache.idToken && now < tokenCache.expiresAt - 30000) return tokenCache.idToken;
  if (tokenCache.refreshToken) {
    try { return await refreshToken(); } catch (e) { /* fall through to grant */ }
  }
  return grantToken();
}

async function grantToken() {
  const url = `${bkashConfig.baseURL}/tokenized/checkout/token/grant`;
  const { data } = await axios.post(
    url,
    { app_key: bkashConfig.appKey, app_secret: bkashConfig.appSecret },
    { headers: { username: bkashConfig.username, password: bkashConfig.password, "Content-Type": "application/json", Accept: "application/json" } }
  );
  cacheToken(data);
  return data.id_token;
}

async function refreshToken() {
  const url = `${bkashConfig.baseURL}/tokenized/checkout/token/refresh`;
  const { data } = await axios.post(
    url,
    { app_key: bkashConfig.appKey, app_secret: bkashConfig.appSecret, refresh_token: tokenCache.refreshToken },
    { headers: { username: bkashConfig.username, password: bkashConfig.password, "Content-Type": "application/json", Accept: "application/json" } }
  );
  cacheToken(data);
  return data.id_token;
}

function cacheToken(data) {
  tokenCache = {
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (Number(data.expires_in) || 3300) * 1000,
  };
}

async function createPayment({ amount, merchantInvoiceNumber, payerReference }) {
  const idToken = await getToken();
  const url = `${bkashConfig.baseURL}/tokenized/checkout/create`;
  const { data } = await axios.post(
    url,
    {
      mode: "0011",
      payerReference,
      callbackURL: bkashConfig.callbackURL,
      amount: String(amount),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber,
    },
    { headers: authHeaders(idToken) }
  );
  return data;
}

async function executePayment(paymentID) {
  const idToken = await getToken();
  const url = `${bkashConfig.baseURL}/tokenized/checkout/execute`;
  const { data } = await axios.post(url, { paymentID }, { headers: authHeaders(idToken) });
  return data;
}

async function queryPayment(paymentID) {
  const idToken = await getToken();
  const url = `${bkashConfig.baseURL}/tokenized/checkout/payment/status`;
  const { data } = await axios.post(url, { paymentID }, { headers: authHeaders(idToken) });
  return data;
}

async function refundTransaction({ paymentID, trxID, amount, sku, reason }) {
  const idToken = await getToken();
  const url = `${bkashConfig.baseURL}/tokenized/checkout/payment/refund`;
  const { data } = await axios.post(
    url,
    { paymentID, trxID, amount: String(amount), sku: sku || "refund", reason: reason || "Booking cancelled" },
    { headers: authHeaders(idToken) }
  );
  return data;
}

module.exports = { createPayment, executePayment, queryPayment, refundTransaction };