require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("ExploreBD API - Module 2 Feature 1 (Tourist Booking & Scheduling) is running");
});

const PORT = process.env.PORT || 5061;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
