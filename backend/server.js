const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const passRoutes = require('./routes/passRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5073;
const HOST = process.env.HOST || '127.0.0.1';

app.disable('x-powered-by');
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json({ limit: '64kb' }));

app.use('/api/auth', authRoutes);
app.use('/api/passes', passRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', module: 'qr-pass', database: 'mongodb' });
});

const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use((req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Route not found.' });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, HOST, () => {
    console.log(`ExploreBD Module 3 API running at http://${HOST}:${PORT}`);
  });
}

startServer().catch(error => {
  console.error(`Module 3 failed to start: ${error.message}`);
  process.exit(1);
});
