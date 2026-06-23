// routes/recordings.js
// Handles audio uploads via Supabase Storage.
//
// Endpoints:
//   GET  /recordings?song_id=<uuid>   — list recordings for a song
//   POST /recordings/upload            — upload a file + save metadata
//   GET  /recordings/:id/url           — get a short-lived playback URL
//   DELETE /recordings/:id             — delete a recording

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js'; // your existing JWT middleware
import pool from '../db.js'; // your existing pg pool

const router = express.Router();

// Supabase client — uses the service role key so the backend can bypass RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

const BUCKET = 'recordings';
const PLAYBACK_TTL = 3600; // seconds — 1 hour

// Multer stores the upload in memory temporarily while we stream it to Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max per file
  fileFilter: (req, file, cb) => {
    const ALLOWED = ['audio/mpeg', 'audio/mp4', 'audio/m4a', 'audio/aac',
                     'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-m4a'];
    if (ALLOWED.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported audio format'));
    }
  },
});

// ---------------------------------------------------------------------------
// GET /recordings?song_id=<uuid>
// Returns all recordings for a song, newest first.
// ---------------------------------------------------------------------------
router.get('/', authenticateToken, async (req, res) => {
  const { song_id } = req.query;
  if (!song_id) return res.status(400).json({ error: 'song_id is required' });

  const result = await pool.query(
    `SELECT id, song_id, uploaded_by, filename, mime_type,
            file_size_bytes, duration_seconds, label, created_at
     FROM recordings
     WHERE song_id = $1
     ORDER BY created_at DESC`,
    [song_id]
  );

  // storage_path is intentionally excluded — clients get a URL via /:id/url
  res.json(result.rows);
});

// ---------------------------------------------------------------------------
// POST /recordings/upload
// Accepts a multipart form upload with fields:
//   - audio (the file)
//   - song_id
//   - label (optional)
//   - duration_seconds (optional — detect client-side and send here)
// ---------------------------------------------------------------------------
router.post('/upload', authenticateToken, upload.single('audio'), async (req, res) => {
  const { song_id, label, duration_seconds } = req.body;

  if (!song_id) return res.status(400).json({ error: 'song_id is required' });
  if (!req.file) return res.status(400).json({ error: 'No audio file received' });

  // Verify the song exists
  const songCheck = await pool.query('SELECT id FROM songs WHERE id = $1', [song_id]);
  if (songCheck.rowCount === 0) return res.status(404).json({ error: 'Song not found' });

  // Build a unique storage path inside the bucket
  // e.g. songs/abc-123/2024-06-23T14-05_rehearsal.m4a
  const safeFilename = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const datePrefix = new Date().toISOString().slice(0, 16).replace(':', '-');
  const storage_path = `songs/${song_id}/${datePrefix}_${safeFilename}`;

  // Upload the file buffer to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storage_path, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    console.error('Supabase Storage upload error:', uploadError);
    return res.status(500).json({ error: 'File upload failed' });
  }

  // Save metadata to Postgres
  const result = await pool.query(
    `INSERT INTO recordings
       (id, song_id, uploaded_by, storage_path, filename, mime_type,
        file_size_bytes, duration_seconds, label, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
     RETURNING *`,
    [
      uuidv4(),
      song_id,
      req.user.id,
      storage_path,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      duration_seconds ? parseInt(duration_seconds) : null,
      label?.trim() || null,
    ]
  );

  res.status(201).json(result.rows[0]);
});

// ---------------------------------------------------------------------------
// GET /recordings/:id/url
// Returns a short-lived signed URL for in-app audio playback.
// ---------------------------------------------------------------------------
router.get('/:id/url', authenticateToken, async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'SELECT storage_path FROM recordings WHERE id = $1',
    [id]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Recording not found' });

  const { storage_path } = result.rows[0];

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storage_path, PLAYBACK_TTL);

  if (error) {
    console.error('Supabase signed URL error:', error);
    return res.status(500).json({ error: 'Could not generate playback URL' });
  }

  res.json({ url: data.signedUrl });
});

// ---------------------------------------------------------------------------
// DELETE /recordings/:id
// Deletes the file from storage and the metadata row from Postgres.
// ---------------------------------------------------------------------------
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    'SELECT storage_path, uploaded_by FROM recordings WHERE id = $1',
    [id]
  );
  if (result.rowCount === 0) return res.status(404).json({ error: 'Recording not found' });

  const { storage_path, uploaded_by } = result.rows[0];

  // Only the uploader can delete their recording
  if (uploaded_by !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own recordings' });
  }

  // Delete from Supabase Storage first
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([storage_path]);

  if (storageError) {
    console.error('Supabase Storage delete error:', storageError);
    return res.status(500).json({ error: 'Could not delete file' });
  }

  // Then delete the metadata row
  await pool.query('DELETE FROM recordings WHERE id = $1', [id]);

  res.json({ deleted: true });
});

export default router;
