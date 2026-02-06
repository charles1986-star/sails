import express from 'express';
import db from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Ensure public uploads directory exists for books
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'book');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${name}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|webp|pdf)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for books
});

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
router.post('/books', verifyToken, verifyAdmin, upload.single('cover_image'), async (req, res) => {
  try {
    const { title, author, description, price, category_id } = req.body;
    if (!title || !author || !price) return res.status(400).json({ msg: 'Title, author, and price required', type: 'error' });
    if (isNaN(price) || price <= 0) return res.status(400).json({ msg: 'Price must be positive', type: 'error' });

    const cover_image = req.file ? `/uploads/book/${req.file.filename}` : null;

    await db.query(
      'INSERT INTO books (title, author, description, price, category_id, cover_image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, author, description, price, category_id || null, cover_image, 'active']
    );

    res.status(201).json({ msg: 'Book created successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT /books/:id
router.put('/books/:id', verifyToken, verifyAdmin, upload.single('cover_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, description, price, category_id, status } = req.body;
    if (price && (isNaN(price) || price <= 0)) return res.status(400).json({ msg: 'Price must be positive', type: 'error' });

    let cover_image = req.body.cover_image;
    if (req.file) {
      cover_image = `/uploads/book/${req.file.filename}`;
    }

    await db.query(
      'UPDATE books SET title = ?, author = ?, description = ?, price = ?, category_id = ?, cover_image = ?, status = ? WHERE id = ?',
      [title, author, description, price, category_id || null, cover_image, status || 'active', id]
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
