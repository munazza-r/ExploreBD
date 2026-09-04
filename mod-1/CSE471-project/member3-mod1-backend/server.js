const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

// During this local merge, reuse Module 2's already-configured MongoDB URI when
// the unified backend does not yet have its own .env. No secret is copied.
if (!process.env.MONGO_URI && !process.env.DATABASE_URL) {
  const moduleTwoEnv = path.resolve(__dirname, '../../../mod-2/backend/.env');
  if (fs.existsSync(moduleTwoEnv)) {
    const parsed = dotenv.parse(fs.readFileSync(moduleTwoEnv));
    if (parsed.DATABASE_URL) process.env.DATABASE_URL = parsed.DATABASE_URL;
    if (parsed.MONGO_URI) process.env.MONGO_URI = parsed.MONGO_URI;
  }
}

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const guideRoutes = require('./routes/guideRoutes');
const messageRoutes = require('./routes/messageRoutes');
const passRoutes = require('./routes/passRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5053;
const HOST = process.env.HOST || '127.0.0.1';

app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json({ limit: '3mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/guide', guideRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/passes', passRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'mongodb', modules: ['profile-auth', 'messaging', 'qr-pass'] });
});

const exploreRoot = path.resolve(__dirname, '../../..');
const moduleOneFrontend = path.resolve(__dirname, '../member3-mod1-frontend');
const messagesDist = path.join(exploreRoot, 'mod-2/frontend/dist');
const qrDist = path.join(exploreRoot, 'mod-3/frontend/dist');

function mountReactApp(route, directory) {
  app.use(route, express.static(directory));
  app.get([route, `${route}/*`], (req, res) => {
    const indexPath = path.join(directory, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return res.status(503).send('Frontend build is missing. Run npm run build from the ExploreBD root.');
    }
    return res.sendFile(indexPath);
  });
}

mountReactApp('/messages', messagesDist);
mountReactApp('/qr', qrDist);
app.use(express.static(moduleOneFrontend));

app.get('/', (req, res) => res.sendFile(path.join(moduleOneFrontend, 'index.html')));

async function startServer() {
  await connectDB();
  app.listen(PORT, HOST, () => {
    console.log(`ExploreBD (Modules 1 + 2 + 3) running at http://${HOST}:${PORT}`);
  });
}

startServer().catch(error => {
  console.error(`ExploreBD failed to start: ${error.message}`);
  process.exit(1);
});
