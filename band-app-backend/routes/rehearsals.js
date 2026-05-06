import express from 'express';
import { pool } from '../server.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Get all rehearsals for this band
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, u.username as created_by_name,
             COUNT(a.id) as responses,
             SUM(CASE WHEN a.status = 'available' THEN 1 ELSE 0 END) as available_count
      FROM rehearsals r
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN availability a ON r.id = a.rehearsal_id
      GROUP BY r.id, u.username
      ORDER BY r.date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single rehearsal with availability details
router.get('/:id', async (req, res) => {
  try {
    const rehearsal = await pool.query(
      'SELECT * FROM rehearsals WHERE id = $1',
      [req.params.id]
    );

    if (rehearsal.rows.length === 0) {
      return res.status(404).json({ error: 'Rehearsal not found' });
    }

    // Get availability for all users
    const availability = await pool.query(`
      SELECT a.*, u.username, u.instrument
      FROM availability a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.rehearsal_id = $1
      ORDER BY u.username
    `, [req.params.id]);

    res.json({
      ...rehearsal.rows[0],
      availability: availability.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new rehearsal (propose a date)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, date, time, location, notes } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const result = await pool.query(
      `INSERT INTO rehearsals (title, date, time, location, notes, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'proposed')
       RETURNING *`,
      [title || null, date, time || null, location || null, notes || null, req.userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update rehearsal details
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, date, time, location, notes, status } = req.body;

    const result = await pool.query(
      `UPDATE rehearsals 
       SET title = COALESCE($1, title),
           date = COALESCE($2, date),
           time = COALESCE($3, time),
           location = COALESCE($4, location),
           notes = COALESCE($5, notes),
           status = COALESCE($6, status),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, date, time, location, notes, status, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Respond to availability poll (mark yourself as available/unavailable/maybe)
router.post('/:id/availability', verifyToken, async (req, res) => {
  try {
    const { status } = req.body; // 'available', 'unavailable', 'maybe'

    if (!['available', 'unavailable', 'maybe'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(`
      INSERT INTO availability (rehearsal_id, user_id, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (rehearsal_id, user_id) 
      DO UPDATE SET status = $3, responded_at = NOW()
      RETURNING *
    `, [req.params.id, req.userId, status]);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get availability status for current user on a rehearsal
router.get('/:id/my-availability', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM availability WHERE rehearsal_id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );

    res.json(result.rows[0] || { status: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete rehearsal
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM rehearsals WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
