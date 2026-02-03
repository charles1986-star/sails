import express from 'express';
import db from '../db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /media
router.get('/media', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM media ORDER BY created_at DESC');
    res.json({ data: rows, msg: 'Media fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST /media
router.post('/media', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, description, media_type, file_url, category } = req.body;
    if (!title || !media_type) return res.status(400).json({ msg: 'Title and media type required', type: 'error' });

    await db.query(
      'INSERT INTO media (title, description, media_type, file_url, category, status) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, media_type, file_url, category, 'active']
    );

    res.status(201).json({ msg: 'Media created successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT /media/:id
router.put('/media/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, media_type, file_url, category, status } = req.body;

    await db.query(
      'UPDATE media SET title = ?, description = ?, media_type = ?, file_url = ?, category = ?, status = ? WHERE id = ?',
      [title, description, media_type, file_url, category, status, id]
    );

    res.json({ msg: 'Media updated successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// DELETE /media/:id
router.delete('/media/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM media WHERE id = ?', [id]);
    res.json({ msg: 'Media deleted successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
