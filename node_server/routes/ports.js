import express from 'express';
import db from '../db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /ports - Get all ports
router.get('/ports', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ports ORDER BY name ASC');
    res.json({ data: rows, msg: 'Ports fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// GET /ports/public - Get all active ports (public endpoint for ship creation)
router.get('/ports-list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, country FROM ports WHERE status = "active" ORDER BY name ASC');
    res.json({ data: rows, msg: 'Ports list fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST /ports - Create new port
router.post('/ports', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, country, description, status } = req.body;

    // Validation
    if (!name || !country) {
      return res.status(400).json({ msg: 'Name and country are required', type: 'error' });
    }

    // Check if port already exists
    const [existing] = await db.query('SELECT id FROM ports WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ msg: 'Port with this name already exists', type: 'error' });
    }

    await db.query(
      'INSERT INTO ports (name, country, description, status) VALUES (?, ?, ?, ?)',
      [name, country, description || null, status || 'active']
    );

    res.status(201).json({ msg: 'Port created successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT /ports/:id - Update port
router.put('/ports/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, country, description, status } = req.body;

    // Validation
    if (!name || !country) {
      return res.status(400).json({ msg: 'Name and country are required', type: 'error' });
    }

    // Check if port exists
    const [existing] = await db.query('SELECT * FROM ports WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ msg: 'Port not found', type: 'error' });
    }

    // Check if new name is already taken by another port
    const [duplicate] = await db.query('SELECT id FROM ports WHERE name = ? AND id != ?', [name, id]);
    if (duplicate.length > 0) {
      return res.status(400).json({ msg: 'Port name already exists', type: 'error' });
    }

    await db.query(
      'UPDATE ports SET name = ?, country = ?, description = ?, status = ? WHERE id = ?',
      [name, country, description || null, status || 'active', id]
    );

    res.json({ msg: 'Port updated successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// DELETE /ports/:id - Delete port
router.delete('/ports/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if port exists
    const [existing] = await db.query('SELECT * FROM ports WHERE id = ?', [id]);
    if (!existing.length) {
      return res.status(404).json({ msg: 'Port not found', type: 'error' });
    }

    // Check if port is being used in ships
    const [shipUsage] = await db.query(
      'SELECT id FROM ships WHERE start_port_id = ? OR end_port_id = ? LIMIT 1',
      [id, id]
    );
    if (shipUsage.length > 0) {
      return res.status(400).json({ msg: 'Cannot delete port that is in use by ships', type: 'error' });
    }

    await db.query('DELETE FROM ports WHERE id = ?', [id]);
    res.json({ msg: 'Port deleted successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
