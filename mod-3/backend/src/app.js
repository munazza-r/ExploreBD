const fs = require("fs");
const path = require("path");
const cors = require("cors");
const express = require("express");
const { BookingStore, DEMO_BOOKING_ID } = require("./data/bookingStore");
const createPassRouter = require("./routes/passRoutes");

const LOCAL_DEMO_SECRET = "explorebd-local-demo-secret-change-before-production";

function createApp(options = {}) {
  const app = express();
  const store = options.store || new BookingStore();
  const secret = options.secret || process.env.QR_PASS_SECRET || LOCAL_DEMO_SECRET;
  const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

  app.disable("x-powered-by");
  app.use(cors({ origin: frontendOrigin }));
  app.use(express.json({ limit: "64kb" }));

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", module: "QR booking verification", storage: "local-demo" });
  });

  app.use(
    "/api/passes",
    createPassRouter({ store, secret, demoBookingId: DEMO_BOOKING_ID }),
  );

  const frontendDist = path.resolve(__dirname, "../../frontend/dist");
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      return res.sendFile(path.join(frontendDist, "index.html"));
    });
  }

  app.use((req, res) => {
    res.status(404).json({ code: "NOT_FOUND", message: "Route not found." });
  });

  return { app, store };
}

module.exports = {
  LOCAL_DEMO_SECRET,
  createApp,
};

