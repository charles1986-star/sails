import express from 'express';
import db from '../db.js';
import multer from 'multer';
import path from 'path';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

const uploadDir = path.join(process.cwd(), 'node_server', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-')),
});
const upload = multer({ storage });

// GET /ships
router.get('/ships', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ships ORDER BY created_at DESC');
    res.json({ data: rows, msg: 'Ships fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST /ships (with image upload)
router.post('/ships', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, specifications } = req.body;
    if (!name) return res.status(400).json({ msg: 'Ship name required', type: 'error' });

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    await db.query(
      'INSERT INTO ships (name, description, specifications, image_url) VALUES (?, ?, ?, ?)',
      [name, description, specifications, imagePath]
    );

    res.status(201).json({ msg: 'Ship created', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT /ships/:id
router.put('/ships/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, specifications } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const [existing] = await db.query('SELECT * FROM ships WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ msg: 'Ship not found', type: 'error' });

    const img = imagePath === undefined ? existing[0].image_url : imagePath;
    await db.query(
      'UPDATE ships SET name = ?, description = ?, specifications = ?, image_url = ? WHERE id = ?',
      [name, description, specifications, img, id]
    );

    res.json({ msg: 'Ship updated', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// DELETE /ships/:id
router.delete('/ships/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM ships WHERE id = ?', [id]);
    res.json({ msg: 'Ship deleted', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
