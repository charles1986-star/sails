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

// PUBLIC: GET all active shops
router.get('/shops-public', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, description, shop_category_id, image_url, sku, brand, model_number, color, material, price FROM shops WHERE status = ? ORDER BY created_at DESC',
      ['active']
    );
    res.json({ data: rows, msg: 'Shops fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

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
    const { name, description, shop_category_id, owner_id, sku, brand, model_number, color, material, price, status } = req.body;
    if (!name) return res.status(400).json({ msg: 'Name required', type: 'error' });

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    await db.query(
      `INSERT INTO shops (name, description, shop_category_id, owner_id, image_url, sku, brand, model_number, color, material, price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description || null, shop_category_id || null, owner_id || null, imagePath, sku || null, brand || null, model_number || null, color || null, material || null, price || null, status || 'active']
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
    const { name, description, shop_category_id, owner_id, sku, brand, model_number, color, material, price, status } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    const [existing] = await db.query('SELECT * FROM shops WHERE id = ?', [id]);
    if (!existing.length) return res.status(404).json({ msg: 'Shop not found', type: 'error' });

    const img = imagePath === undefined ? existing[0].image_url : imagePath;
    await db.query(
      `UPDATE shops 
       SET name = ?, description = ?, shop_category_id = ?, owner_id = ?, image_url = ?, sku = ?, brand = ?, model_number = ?, color = ?, material = ?, price = ?, status = ?
       WHERE id = ?`,
      [name, description || null, shop_category_id || null, owner_id || null, img, sku || null, brand || null, model_number || null, color || null, material || null, price || null, status || 'active', id]
    );

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
