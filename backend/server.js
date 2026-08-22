const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5070;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded document images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Verification Routes
const verificationRoutes = require('./src/routes/verificationRoutes');
app.use('/api/verification', verificationRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.send('ExploreBD Backend API is running...');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});