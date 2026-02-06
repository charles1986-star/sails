import express from 'express';
import db from '../db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET all categories (public)
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await db.query(
      'SELECT * FROM categories WHERE status = "active" ORDER BY name ASC'
    );
    res.json({ data: categories, msg: 'Categories fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// GET single category by ID
router.get('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [categories] = await db.query(
      'SELECT * FROM categories WHERE id = ?',
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

// POST - Create category (admin only)
router.post('/categories', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, parent_id, description, status } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ msg: 'Category name is required', type: 'error' });
    }

    // Check if category already exists
    const [existing] = await db.query(
      'SELECT id FROM categories WHERE name = ?',
      [name]
    );
    if (existing.length > 0) {
      return res.status(400).json({ msg: 'Category already exists', type: 'error' });
    }

    // If parent_id provided, verify it exists
    if (parent_id) {
      const [parent] = await db.query(
        'SELECT id FROM categories WHERE id = ?',
        [parent_id]
      );
      if (parent.length === 0) {
        return res.status(400).json({ msg: 'Parent category not found', type: 'error' });
      }
    }

    await db.query(
      'INSERT INTO categories (name, parent_id, description, status) VALUES (?, ?, ?, ?)',
      [name, parent_id || null, description || null, status || 'active']
    );

    res.status(201).json({ msg: 'Category created successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT - Update category (admin only)
router.put('/categories/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id, description, status } = req.body;

    // Check if category exists
    const [existing] = await db.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ msg: 'Category not found', type: 'error' });
    }

    // Check if new name is unique (excluding current)
    if (name && name !== existing[0].name) {
      const [duplicate] = await db.query(
        'SELECT id FROM categories WHERE name = ? AND id != ?',
        [name, id]
      );
      if (duplicate.length > 0) {
        return res.status(400).json({ msg: 'Category name already exists', type: 'error' });
      }
    }

    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (parent_id !== undefined) {
      if (parent_id) {
        // Verify parent exists and prevent self-referencing
        if (parent_id == id) {
          return res.status(400).json({ msg: 'Cannot set category as its own parent', type: 'error' });
        }
        const [parent] = await db.query(
          'SELECT id FROM categories WHERE id = ?',
          [parent_id]
        );
        if (parent.length === 0) {
          return res.status(400).json({ msg: 'Parent category not found', type: 'error' });
        }
      }
      updateFields.push('parent_id = ?');
      updateValues.push(parent_id || null);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description || null);
    }
    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = NOW()');
      updateValues.push(id);
      
      const query = `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(query, updateValues);
    }

    res.json({ msg: 'Category updated successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// DELETE - Delete category (admin only)
router.delete('/categories/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existing] = await db.query(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ msg: 'Category not found', type: 'error' });
    }

    // Check if it has child categories
    const [children] = await db.query(
      'SELECT id FROM categories WHERE parent_id = ?',
      [id]
    );
    if (children.length > 0) {
      return res.status(400).json({ msg: 'Cannot delete category with subcategories', type: 'error' });
    }

    await db.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ msg: 'Category deleted successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
