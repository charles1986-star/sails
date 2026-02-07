import express from 'express';
import db from '../db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// ==================== SHOP CATEGORIES ROUTES ====================

// GET all shop categories (public - hierarchical tree)
router.get('/', async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT id, name, parent_id, description, image_url, status, created_at 
       FROM shop_categories 
       WHERE status = 'active' 
       ORDER BY parent_id, name ASC`
    );
    res.json({ data: categories, msg: 'Shop categories fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// GET all categories (admin - including inactive)
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [categories] = await db.query(
      `SELECT id, name, parent_id, description, image_url, status, created_at, updated_at
       FROM shop_categories 
       ORDER BY parent_id, name ASC`
    );
    res.json({ data: categories, msg: 'All shop categories fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// GET single category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [categories] = await db.query(
      'SELECT * FROM shop_categories WHERE id = ?',
      [id]
    );
    if (categories.length === 0) {
      return res.status(404).json({ msg: 'Category not found', type: 'error' });
    }
    res.json({ data: categories[0], msg: 'Category fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST - Create new category (admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, parent_id, description, image_url, status } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({ msg: 'Category name is required', type: 'error' });
    }

    // Check if name already exists
    const [existing] = await db.query(
      'SELECT id FROM shop_categories WHERE name = ?',
      [name.trim()]
    );
    if (existing.length > 0) {
      return res.status(400).json({ msg: 'Category name already exists', type: 'error' });
    }

    // Validate parent_id if provided
    if (parent_id) {
      const [parentCat] = await db.query(
        'SELECT id FROM shop_categories WHERE id = ?',
        [parent_id]
      );
      if (parentCat.length === 0) {
        return res.status(400).json({ msg: 'Parent category not found', type: 'error' });
      }
    }

    // Insert category
    const [result] = await db.query(
      `INSERT INTO shop_categories (name, parent_id, description, image_url, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        parent_id || null,
        description || null,
        image_url || null,
        status || 'active'
      ]
    );

    res.status(201).json({
      msg: 'Category created successfully',
      type: 'success',
      data: {
        id: result.insertId,
        name,
        parent_id: parent_id || null,
        description: description || null,
        image_url: image_url || null,
        status: status || 'active'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to create category', type: 'error' });
  }
});

// PUT - Update category (admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id, description, image_url, status } = req.body;

    // Verify category exists
    const [existing] = await db.query(
      'SELECT * FROM shop_categories WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ msg: 'Category not found', type: 'error' });
    }

    // Validate name uniqueness (excluding self)
    if (name && name !== existing[0].name) {
      const [duplicate] = await db.query(
        'SELECT id FROM shop_categories WHERE name = ? AND id != ?',
        [name.trim(), id]
      );
      if (duplicate.length > 0) {
        return res.status(400).json({ msg: 'Category name already exists', type: 'error' });
      }
    }

    // Validate parent_id if changing
    if (parent_id && parent_id !== existing[0].parent_id) {
      const [parentCat] = await db.query(
        'SELECT id FROM shop_categories WHERE id = ?',
        [parent_id]
      );
      if (parentCat.length === 0) {
        return res.status(400).json({ msg: 'Parent category not found', type: 'error' });
      }
    }

    // Update category
    await db.query(
      `UPDATE shop_categories 
       SET name = ?, parent_id = ?, description = ?, image_url = ?, status = ?
       WHERE id = ?`,
      [
        name || existing[0].name,
        parent_id !== undefined ? (parent_id || null) : existing[0].parent_id,
        description || existing[0].description,
        image_url || existing[0].image_url,
        status || existing[0].status,
        id
      ]
    );

    res.json({ msg: 'Category updated successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to update category', type: 'error' });
  }
});

// DELETE - Delete category (admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify category exists
    const [existing] = await db.query(
      'SELECT * FROM shop_categories WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ msg: 'Category not found', type: 'error' });
    }

    // Check if category has child categories
    const [children] = await db.query(
      'SELECT id FROM shop_categories WHERE parent_id = ?',
      [id]
    );
    if (children.length > 0) {
      return res.status(400).json({
        msg: 'Cannot delete category with child categories. Move or delete children first.',
        type: 'error'
      });
    }

    // Check if category has products
    const [products] = await db.query(
      'SELECT id FROM shops WHERE shop_category_id = ?',
      [id]
    );
    if (products.length > 0) {
      return res.status(400).json({
        msg: 'Cannot delete category with products. Move or delete products first.',
        type: 'error'
      });
    }

    // Delete category
    await db.query('DELETE FROM shop_categories WHERE id = ?', [id]);

    res.json({ msg: 'Category deleted successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to delete category', type: 'error' });
  }
});

export default router;
