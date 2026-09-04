require("dotenv").config();
const express = require("express");
const cors = require("cors");
const meetingRoutes = require("./routes/meetingRoutes");
const fallbackPointRoutes = require("./routes/fallbackPointRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/meetings", meetingRoutes);
app.use("/api/fallback-points", fallbackPointRoutes);

app.get("/", (req, res) => {
  res.send("ExploreBD API - Module 2 Feature 2 (Meeting Point & Route) is running");
});

const PORT = process.env.PORT || 5062;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
