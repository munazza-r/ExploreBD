require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectMongo = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const guideRoutes = require("./routes/guideRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const tourPackageRoutes = require("./routes/tourPackageRoutes");
const meetingRoutes = require("./routes/meetingRoutes");
const fallbackPointRoutes = require("./routes/fallbackPointRoutes");
const messageRoutes = require("./routes/messageRoutes");
const itineraryRoutes = require("./routes/itineraryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const qrPassRoutes = require("./routes/qrPassRoutes");
const cancellationRoutes = require("./routes/cancellationRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/attachments", express.static("attachments")); // serves uploaded verification documents
app.use("/api/messages", messageRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/qr-passes", qrPassRoutes);
app.use("/api/cancellation", cancellationRoutes);

// ---- Auth (Mongoose-backed) ----
app.use("/api/auth", authRoutes);

// ---- Guide search + profile management (Prisma-backed) ----
app.use("/api/guides", guideRoutes);

// ---- Tourist Booking & Scheduling (Prisma-backed) ----
app.use("/api/bookings", bookingRoutes);

// ---- Student Guide Verification & Document Auditing (Prisma-backed) ----
app.use("/api/verification", verificationRoutes);
app.use("/api/tour-packages", tourPackageRoutes);

app.use("/api/meetings", meetingRoutes);
app.use("/api/fallback-points", fallbackPointRoutes);


app.get("/", (req, res) => {
  res.send("ExploreBD Unified API is running");
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectMongo(); // connects Mongoose for auth
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
