const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const guideRoutes = require('./routes/guideRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '3mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/guide', guideRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ExploreBD Backend API' });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 ExploreBD Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
