require("dotenv").config();
const { createApp, LOCAL_DEMO_SECRET } = require("./app");

const PORT = Number(process.env.PORT) || 5073;
const HOST = process.env.HOST || "127.0.0.1";
const { app } = createApp();

if (!process.env.QR_PASS_SECRET) {
  console.warn("Using the local QR demo secret. Set QR_PASS_SECRET before deployment.");
}

app.listen(PORT, HOST, () => {
  console.log(`ExploreBD QR API running at http://${HOST}:${PORT}`);
  if (process.env.QR_PASS_SECRET === LOCAL_DEMO_SECRET) {
    console.warn("QR_PASS_SECRET should not use the documented demo value in production.");
  }
});

