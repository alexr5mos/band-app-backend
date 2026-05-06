import express from 'express';
import cors from 'express-cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes
import authRoutes from './routes/auth.js';
import songRoutes from './routes/songs.js';
import uploadRoutes from './routes/upload.js';
import rehearsalRoutes from './routes/rehearsals.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Database connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test DB connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('✓ Database connected');
  }
});

const app = express();

// Middleware
app.use(cors({
  origin: 'https://band-app-frontend.vercel.app',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// File upload functionality disabled for v1
// Audio upload will be added in a future version

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/rehearsals', rehearsalRoutes);

// Audio uploads disabled for v1

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
