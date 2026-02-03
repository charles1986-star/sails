import express from 'express';
import db from '../db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /games
router.get('/games', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM games ORDER BY created_at DESC');
    res.json({ data: rows, msg: 'Games fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST /games
router.post('/games', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, description, category, price } = req.body;
    if (!title) return res.status(400).json({ msg: 'Game title required', type: 'error' });

    await db.query(
      'INSERT INTO games (title, description, category, price, status) VALUES (?, ?, ?, ?, ?)',
      [title, description, category, price || 0, 'active']
    );

    res.status(201).json({ msg: 'Game created successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT /games/:id
router.put('/games/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, price, status } = req.body;

    await db.query(
      'UPDATE games SET title = ?, description = ?, category = ?, price = ?, status = ? WHERE id = ?',
      [title, description, category, price, status, id]
    );

    res.json({ msg: 'Game updated successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// DELETE /games/:id
router.delete('/games/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM games WHERE id = ?', [id]);
    res.json({ msg: 'Game deleted successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
