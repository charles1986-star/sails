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

// GET /shops
router.get('/shops', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM shops ORDER BY created_at DESC');
    res.json({ data: rows, msg: 'Shops fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST /shops (with image upload)
router.post('/shops', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, description, owner_id } = req.body;
    if (!name) return res.status(400).json({ msg: 'Name required', type: 'error' });

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    await db.query(
      'INSERT INTO shops (name, description, owner_id, image_url) VALUES (?, ?, ?, ?)',
      [name, description, owner_id || null, imagePath]
    );

    res.status(201).json({ msg: 'Shop created', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT /shops/:id
router.put('/shops/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, owner_id } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const [existing] = await db.query('SELECT * FROM shops WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ msg: 'Shop not found', type: 'error' });

    const img = imagePath === undefined ? existing[0].image_url : imagePath;
    await db.query('UPDATE shops SET name = ?, description = ?, owner_id = ?, image_url = ? WHERE id = ?', [name, description, owner_id || null, img, id]);

    res.json({ msg: 'Shop updated', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// DELETE /shops/:id
router.delete('/shops/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM shops WHERE id = ?', [id]);
    res.json({ msg: 'Shop deleted', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
