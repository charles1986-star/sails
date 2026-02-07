import express from 'express';
import db from '../db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /articles
router.get('/articles', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT a.*, u.username FROM articles a JOIN users u ON a.author_id = u.id ORDER BY a.created_at DESC'
    );
    res.json({ data: rows, msg: 'Articles fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST /articles
router.post('/articles', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, content, category_id, status } = req.body;
    if (!title || !content) return res.status(400).json({ msg: 'Title and content required', type: 'error' });

    await db.query(
      'INSERT INTO articles (title, content, author_id, category_id, status) VALUES (?, ?, ?, ?, ?)',
      [title, content, req.userId, category_id || null, status || 'draft']
    );

    res.status(201).json({ msg: 'Article created successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT /articles/:id
router.put('/articles/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category_id, status } = req.body;

    await db.query(
      'UPDATE articles SET title = ?, content = ?, category_id = ?, status = ? WHERE id = ?',
      [title, content, category_id || null, status, id]
    );

    res.json({ msg: 'Article updated successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// DELETE /articles/:id
router.delete('/articles/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM articles WHERE id = ?', [id]);
    res.json({ msg: 'Article deleted successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
