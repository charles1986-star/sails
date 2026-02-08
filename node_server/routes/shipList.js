import express from 'express';
import db from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();



// GET all applications (admin only) - /ships/applications
router.get('/applicationsList', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    console.log("hello");
    
    const [applications] = await db.query(
      `SELECT a.*, u.username, u.email, s.name as ship_name, s.imo, s.image_url
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN ships s ON a.ship_id = s.id
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM applications');
    const total = countResult[0].total;

    res.json({ data: applications, total, limit, offset, msg: 'Applications fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});



export default router;
