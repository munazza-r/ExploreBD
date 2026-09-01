module.exports = {
  store_id: process.env.SSLCZ_STORE_ID,
  store_passwd: process.env.SSLCZ_STORE_PASSWORD,
  is_live: process.env.SSLCZ_IS_LIVE === 'true', // false = sandbox
};