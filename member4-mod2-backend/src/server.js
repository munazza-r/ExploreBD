require("dotenv").config();
const express = require("express");
const cors = require("cors");
const itineraryRoutes = require("./routes/itineraryRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/itinerary", itineraryRoutes);

app.get("/", (req, res) => {
  res.send("ExploreBD API - Module 2 Feature 4 (Itinerary Builder & AI Recommendation) is running");
});

const PORT = process.env.PORT || 5064;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
