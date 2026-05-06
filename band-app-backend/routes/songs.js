import express from 'express';
import { pool } from '../server.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all songs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id, s.title, s.genre, s.bpm, s.key, s.created_at, s.updated_at,
        u.username as created_by,
        COUNT(a.id) as audio_count
      FROM songs s
      LEFT JOIN users u ON s.created_by = u.id
      LEFT JOIN audio_files a ON s.id = a.song_id
      GROUP BY s.id, u.username
      ORDER BY s.updated_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single song with details
router.get('/:id', async (req, res) => {
  try {
    const songResult = await pool.query(`
      SELECT s.*, u.username as created_by_name
      FROM songs s
      LEFT JOIN users u ON s.created_by = u.id
      WHERE s.id = $1
    `, [req.params.id]);

    if (songResult.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }

    const detailsResult = await pool.query(
      'SELECT * FROM song_details WHERE song_id = $1',
      [req.params.id]
    );

    const audioResult = await pool.query(
      'SELECT id, file_name, file_path, uploaded_at, version_number, uploaded_by FROM audio_files WHERE song_id = $1 ORDER BY uploaded_at DESC',
      [req.params.id]
    );

    res.json({
      ...songResult.rows[0],
      details: detailsResult.rows[0] || {},
      audioFiles: audioResult.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create song
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, genre, bpm, key } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO songs (title, genre, bpm, key, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, genre || null, bpm || null, key || null, req.userId]
    );

    // Create empty details row
    await pool.query(
      'INSERT INTO song_details (song_id, updated_by) VALUES ($1, $2)',
      [result.rows[0].id, req.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update song
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, genre, bpm, key } = req.body;
    const result = await pool.query(
      'UPDATE songs SET title = $1, genre = $2, bpm = $3, key = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [title, genre, bpm, key, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update song details (lyrics, chords, structure)
router.put('/:id/details', verifyToken, async (req, res) => {
  try {
    const { lyrics, chords, structure, notes } = req.body;

    const result = await pool.query(`
      UPDATE song_details 
      SET lyrics = $1, chords = $2, structure = $3, notes = $4, updated_at = NOW(), updated_by = $5
      WHERE song_id = $6
      RETURNING *
    `, [lyrics || null, chords || null, structure || null, notes || null, req.userId, req.params.id]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete song
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM songs WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
