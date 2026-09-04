import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cancellationRoutes from './routes/cancellationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Register routes
app.use('/api/v1/cancellation', cancellationRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', port: PORT });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});