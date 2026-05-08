import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Routes
import authRoutes from './routes/auth.js';
import songRoutes from './routes/songs.js';
import uploadRoutes from './routes/upload.js';
import rehearsalRoutes from './routes/rehearsals.js';

dotenv.config();

// Database connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const app = express();

// Middleware
app.use(cors({
  origin: /\.vercel\.app$/,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rehearsals', rehearsalRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🎸 Band app running on port ${PORT}`);
});

export default app;