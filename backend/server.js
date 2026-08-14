require("dotenv").config();
const express = require("express");
const cors = require("cors");
const tourPackageRoutes = require("./routes/tourPackages");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("ExploreBD Tour Package API is running");
});

app.use("/api/tour-packages", tourPackageRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});