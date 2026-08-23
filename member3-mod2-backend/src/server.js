require("dotenv").config();
const express = require("express");
const cors = require("cors");
const prisma = require("./db");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("ExploreBD API - Module 2 Feature 3 (In-App Chat) is running");
});

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database health check failed:", error.message);
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});

const PORT = process.env.PORT || 5073;
const HOST = process.env.HOST || "127.0.0.1";

async function startServer() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from backend/.env");
  }

  await prisma.$connect();
  console.log("Connected to MongoDB Atlas");

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
