require("dotenv").config();
const express = require("express");
const cors = require("cors");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("ExploreBD API - Module 2 Feature 3 (In-App Chat) is running");
});

const PORT = process.env.PORT || 5063;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
