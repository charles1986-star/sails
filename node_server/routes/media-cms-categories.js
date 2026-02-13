import express from 'express';
import db from '../db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET all categories (admin)
router.get('/media-cms/categories', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM media_categories ORDER BY name ASC');
    res.json({ data: rows, msg: 'Categories fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to fetch categories', type: 'error' });
  }
});

// POST create
router.post('/media-cms/categories', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, slug, description, parent_id = null } = req.body;
    if (!name) return res.status(400).json({ msg: 'Name required', type: 'error' });
    const id = uuidv4();
    await db.query('INSERT INTO media_categories (id, name, slug, description, parent_id) VALUES (?, ?, ?, ?, ?)', [id, name, slug || null, description || null, parent_id || null]);
    res.status(201).json({ data: { id, name, slug, description, parent_id }, msg: 'Category created', type: 'success' });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ msg: 'Category exists', type: 'error' });
    res.status(500).json({ msg: 'Failed to create category', type: 'error' });
  }
});

// PUT update
router.put('/media-cms/categories/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, parent_id = null } = req.body;
    const [result] = await db.query('UPDATE media_categories SET name = ?, slug = ?, description = ?, parent_id = ?, updated_at = NOW() WHERE id = ?', [name, slug || null, description || null, parent_id || null, id]);
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Category not found', type: 'error' });
    res.json({ msg: 'Category updated', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to update category', type: 'error' });
  }
});

// DELETE
router.delete('/media-cms/categories/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [usage] = await db.query('SELECT COUNT(*) as cnt FROM media_files WHERE category_id = ?', [id]);
    if (usage[0].cnt > 0) return res.status(400).json({ msg: 'Category in use', type: 'error' });
    const [result] = await db.query('DELETE FROM media_categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ msg: 'Category not found', type: 'error' });
    res.json({ msg: 'Category deleted', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to delete category', type: 'error' });
  }
});

export default router;
