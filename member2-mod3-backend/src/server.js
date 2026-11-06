require("dotenv").config();
const express = require("express");
const cors = require("cors");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.send("ExploreBD API - Module 3 Feature 2 (Payment Release & Commission Management) is running");
});

const PORT = process.env.PORT || 5082;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
