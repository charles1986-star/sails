import express from 'express';
import db from '../db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// GET /transactions
router.get('/transactions', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.*, u.username FROM transactions t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC`
    );
    res.json({ data: rows, msg: 'Transactions fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST /transactions
router.post('/transactions', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { user_id, amount, type, description } = req.body;
    if (!user_id || !amount || !type) return res.status(400).json({ msg: 'All fields required', type: 'error' });
    if (isNaN(amount) || amount <= 0) return res.status(400).json({ msg: 'Amount must be positive', type: 'error' });

    await db.query(
      `INSERT INTO transactions (user_id, amount, type, description, status) VALUES (?, ?, ?, ?, ?)`,
      [user_id, amount, type, description, 'completed']
    );

    res.status(201).json({ msg: 'Transaction created successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT /transactions/:id
router.put('/transactions/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, description, status } = req.body;
    if (amount && (isNaN(amount) || amount <= 0)) return res.status(400).json({ msg: 'Amount must be positive', type: 'error' });

    await db.query(
      `UPDATE transactions SET amount = ?, type = ?, description = ?, status = ? WHERE id = ?`,
      [amount, type, description, status, id]
    );

    res.json({ msg: 'Transaction updated successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// DELETE /transactions/:id
router.delete('/transactions/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM transactions WHERE id = ?', [id]);
    res.json({ msg: 'Transaction deleted successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
