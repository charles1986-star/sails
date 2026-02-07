import express from 'express';
import db from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();


// Ensure public uploads directory exists for ships

const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ship');
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
    const allowed = /\.(jpg|jpeg|png|gif|webp)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ==================== SHIP ROUTES ====================

// GET all ships (public - for users to browse)
router.get('/ships', async (req, res) => {
  try {
    const [ships] = await db.query(
      'SELECT * FROM ships WHERE status = "active" ORDER BY created_at DESC'
    );
    res.json({ data: ships, msg: 'Ships fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// GET single ship by IMO (public)
router.get('/ships/imo/:imo', async (req, res) => {
  try {
    const { imo } = req.params;
    const [ships] = await db.query(
      'SELECT * FROM ships WHERE imo = ? AND status = "active"',
      [imo]
    );
    if (ships.length === 0) {
      return res.status(404).json({ msg: 'Ship not found', type: 'error' });
    }
    res.json({ data: ships[0], msg: 'Ship fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// GET single ship by ID (public)
router.get('/ships/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [ships] = await db.query(
      'SELECT * FROM ships WHERE id = ? AND status = "active"',
      [id]
    );
    if (ships.length === 0) {
      return res.status(404).json({ msg: 'Ship not found', type: 'error' });
    }
    res.json({ data: ships[0], msg: 'Ship fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST - Create new ship (admin only)
router.post('/ships', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, imo, type, capacity_tons, start_port_id, end_port_id, ship_owner, description, last_maintenance_date, status } = req.body;

    // Validation
    if (!name || !imo || !type || !capacity_tons || !start_port_id || !end_port_id) {
      return res.status(400).json({ msg: 'Required fields: name, IMO, type, capacity_tons, start_port_id, end_port_id', type: 'error' });
    }

    if (typeof capacity_tons !== 'string' || isNaN(parseInt(capacity_tons))) {
      return res.status(400).json({ msg: 'Capacity must be a valid number', type: 'error' });
    }

    // Check if IMO is unique
    const [existing] = await db.query('SELECT id FROM ships WHERE imo = ?', [imo]);
    if (existing.length > 0) {
      return res.status(400).json({ msg: 'IMO number already exists', type: 'error' });
    }

    // Verify ports exist
    const [startPort] = await db.query('SELECT id FROM ports WHERE id = ?', [start_port_id]);
    const [endPort] = await db.query('SELECT id FROM ports WHERE id = ?', [end_port_id]);
    if (startPort.length === 0 || endPort.length === 0) {
      return res.status(400).json({ msg: 'Invalid port ID', type: 'error' });
    }

    const image_url = req.file ? `/uploads/ship/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO ships (name, imo, type, capacity_tons, start_port_id, end_port_id, ship_owner, image_url, description, last_maintenance_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, imo, type, parseInt(capacity_tons), start_port_id, end_port_id, ship_owner || null, image_url, description || null, last_maintenance_date || null, status || 'active']

    );

    const [shipData] = await db.query('SELECT * FROM ships WHERE id = ?', [result.insertId]);
    res.status(201).json({ data: shipData[0], msg: 'Ship created successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT - Update ship (admin only)
router.put('/ships/:id', verifyToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;

    const { name, imo, type, capacity_tons, start_port_id, end_port_id, ship_owner, description, last_maintenance_date, status } = req.body;


    // Check if ship exists
    const [existing] = await db.query('SELECT * FROM ships WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ msg: 'Ship not found', type: 'error' });
    }

    // Check if IMO is unique (when updated)
    if (imo && imo !== existing[0].imo) {
      const [imoExists] = await db.query('SELECT id FROM ships WHERE imo = ?', [imo]);
      if (imoExists.length > 0) {
        return res.status(400).json({ msg: 'IMO number already exists', type: 'error' });
      }
    }


    // Verify ports exist if provided
    if (start_port_id) {
      const [startPort] = await db.query('SELECT id FROM ports WHERE id = ?', [start_port_id]);
      if (startPort.length === 0) {
        return res.status(400).json({ msg: 'Start port not found', type: 'error' });
      }
    }
    if (end_port_id) {
      const [endPort] = await db.query('SELECT id FROM ports WHERE id = ?', [end_port_id]);
      if (endPort.length === 0) {
        return res.status(400).json({ msg: 'End port not found', type: 'error' });
      }
    }


    const image_url = req.file ? `/uploads/ship/${req.file.filename}` : existing[0].image_url;

    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (imo) {
      updateFields.push('imo = ?');
      updateValues.push(imo);
    }
    if (type) {
      updateFields.push('type = ?');
      updateValues.push(type);
    }
    if (category_id !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(category_id || null);
    }
    if (capacity_tons) {
      updateFields.push('capacity_tons = ?');
      updateValues.push(parseInt(capacity_tons));
    }
    if (start_port_id !== undefined) {
      updateFields.push('start_port_id = ?');
      updateValues.push(start_port_id || null);
    }
    if (end_port_id !== undefined) {
      updateFields.push('end_port_id = ?');
      updateValues.push(end_port_id || null);
    }
    if (ship_owner !== undefined) {
      updateFields.push('ship_owner = ?');
      updateValues.push(ship_owner || null);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description || null);
    }
    if (last_maintenance_date !== undefined) {
      updateFields.push('last_maintenance_date = ?');
      updateValues.push(last_maintenance_date || null);
    }
    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    updateFields.push('updated_at = NOW()');
    updateFields.push('image_url = ?');
    updateValues.push(image_url);
    updateValues.push(id);

    if (updateFields.length > 0) {
      const query = `UPDATE ships SET ${updateFields.join(', ')} WHERE id = ?`;
      await db.query(query, updateValues);
    }

    const [shipData] = await db.query('SELECT * FROM ships WHERE id = ?', [id]);
    res.json({ data: shipData[0], msg: 'Ship updated successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// DELETE - Delete ship (admin only)
router.delete('/ships/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM ships WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ msg: 'Ship not found', type: 'error' });
    }

    await db.query('DELETE FROM ships WHERE id = ?', [id]);
    res.json({ msg: 'Ship deleted successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// ==================== APPLICATIONS ROUTES ====================

// GET all applications (admin only)
router.get('/applications', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT a.*, u.username, u.email, s.name as ship_name, s.imo, s.image_url
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN ships s ON a.ship_id = s.id
       ORDER BY a.created_at DESC`
    );
    res.json({ data: applications, msg: 'Applications fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// GET user's applications (authenticated users)
router.get('/my-applications', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const [applications] = await db.query(
      `SELECT a.*, s.name as ship_name, s.imo, s.image_url
       FROM applications a
       JOIN ships s ON a.ship_id = s.id
       WHERE a.user_id = ?
       ORDER BY a.created_at DESC`,
      [userId]
    );
    res.json({ data: applications, msg: 'Your applications fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST - Create application (authenticated users)
router.post('/applications', verifyToken, upload.single('document'), async (req, res) => {
  try {
    const userId = req.userId;
    const { ship_id, ship_imo, cargo_type, cargo_weight, weight_unit, preferred_loading_date, preferred_arrival_date, contact_name, contact_email, contact_phone, message } = req.body;

    // Validation
    if (!ship_id || !cargo_type || !cargo_weight || !contact_name || !contact_email) {
      return res.status(400).json({ msg: 'Missing required fields', type: 'error' });
    }

    // Verify ship exists
    const [ship] = await db.query('SELECT id, imo FROM ships WHERE id = ?', [ship_id]);
    if (ship.length === 0) {
      return res.status(404).json({ msg: 'Ship not found', type: 'error' });
    }

    await db.query(
      `INSERT INTO applications (user_id, ship_id, ship_imo, cargo_type, cargo_weight, weight_unit, preferred_loading_date, preferred_arrival_date, contact_name, contact_email, contact_phone, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, ship_id, ship[0].imo, cargo_type, cargo_weight, weight_unit || 'tons', preferred_loading_date || null, preferred_arrival_date || null, contact_name, contact_email, contact_phone || null, message || null, 'pending']
    );

    res.status(201).json({ msg: 'Application submitted successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT - Update application status (admin only)
router.put('/applications/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_message } = req.body;

    if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status', type: 'error' });
    }

    const [existing] = await db.query('SELECT * FROM applications WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ msg: 'Application not found', type: 'error' });
    }

    await db.query(
      `UPDATE applications SET status = ?, admin_message = ?, updated_at = NOW() WHERE id = ?`,
      [status, admin_message || null, id]
    );

    res.json({ msg: 'Application updated successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// GET single application (admin or user who created it)
router.get('/applications/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [app] = await db.query(
      `SELECT a.*, u.username, u.email, s.name as ship_name, s.imo, s.image_url
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN ships s ON a.ship_id = s.id
       WHERE a.id = ?`,
      [id]
    );

    if (app.length === 0) {
      return res.status(404).json({ msg: 'Application not found', type: 'error' });
    }

    // Check authorization
    if (app[0].user_id !== userId && req.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized', type: 'error' });
    }

    res.json({ data: app[0], msg: 'Application fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
