import express from 'express';
import db from '../db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /books
router.get('/books', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM books ORDER BY created_at DESC');
    res.json({ data: rows, msg: 'Books fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST /books
router.post('/books', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, author, description, price, category } = req.body;
    if (!title || !author || !price) return res.status(400).json({ msg: 'Title, author, and price required', type: 'error' });
    if (isNaN(price) || price <= 0) return res.status(400).json({ msg: 'Price must be positive', type: 'error' });

    await db.query(
      'INSERT INTO books (title, author, description, price, category, status) VALUES (?, ?, ?, ?, ?, ?)',
      [title, author, description, price, category, 'active']
    );

    res.status(201).json({ msg: 'Book created successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT /books/:id
router.put('/books/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, description, price, category, status } = req.body;
    if (price && (isNaN(price) || price <= 0)) return res.status(400).json({ msg: 'Price must be positive', type: 'error' });

    await db.query(
      'UPDATE books SET title = ?, author = ?, description = ?, price = ?, category = ?, status = ? WHERE id = ?',
      [title, author, description, price, category, status, id]
    );

    res.json({ msg: 'Book updated successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// DELETE /books/:id
router.delete('/books/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM books WHERE id = ?', [id]);
    res.json({ msg: 'Book deleted successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
