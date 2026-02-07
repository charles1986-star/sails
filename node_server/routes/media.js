import express from 'express';
import db from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Ensure public uploads directory exists for media
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'media');
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
    const allowed = /\.(jpg|jpeg|png|gif|webp|mp4|mp3|wav|ogg)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only image and media files are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for media
});

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
router.post('/media', verifyToken, verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    const { title, description, media_type, category_id } = req.body;
    if (!title || !media_type) return res.status(400).json({ msg: 'Title and media type required', type: 'error' });

    const file_url = req.file ? `/uploads/media/${req.file.filename}` : null;

    await db.query(
      'INSERT INTO media (title, description, media_type, file_url, category_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, media_type, file_url, category_id || null, 'active']
    );

    res.status(201).json({ msg: 'Media created successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT /media/:id
router.put('/media/:id', verifyToken, verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, media_type, category_id, status } = req.body;

    let file_url = req.body.file_url;
    if (req.file) {
      file_url = `/uploads/media/${req.file.filename}`;
    }

    await db.query(
      'UPDATE media SET title = ?, description = ?, media_type = ?, file_url = ?, category_id = ?, status = ? WHERE id = ?',
      [title, description, media_type, file_url, category_id || null, status || 'active', id]
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
