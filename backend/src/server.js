require("dotenv").config();
const express = require("express");
const cors = require("cors");
const guideRoutes = require("./routes/guideRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Feature 1: Location & Language-Based Smart Guide Matching
app.use("/api/guides", guideRoutes);

app.get("/", (req, res) => {
  res.send("ExploreBD API - Feature 1 (Guide Matching) is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
