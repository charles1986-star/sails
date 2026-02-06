import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET user's prize wheel status (can play today?)
router.get('/prize-wheel/status', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const [user] = await db.query(
      'SELECT id, score, anchors, last_prize_date FROM users WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ msg: 'User not found', type: 'error' });
    }

    const userData = user[0];
    const today = new Date().toISOString().split('T')[0];
    const lastPrizeDate = userData.last_prize_date ? new Date(userData.last_prize_date).toISOString().split('T')[0] : null;
    
    const canPlayToday = lastPrizeDate !== today;

    res.json({
      data: {
        canPlayToday,
        score: userData.score,
        anchors: userData.anchors,
        lastPrizeDate: userData.last_prize_date,
      },
      msg: 'Prize wheel status fetched',
      type: 'success'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST - Play prize wheel and get reward
router.post('/prize-wheel/spin', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { reward } = req.body;

    // Validate reward
    if (!reward || typeof reward !== 'number' || reward <= 0 || reward > 1000) {
      return res.status(400).json({ msg: 'Invalid reward amount', type: 'error' });
    }

    // Get user info
    const [user] = await db.query(
      'SELECT score, anchors, last_prize_date FROM users WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ msg: 'User not found', type: 'error' });
    }

    const userData = user[0];
    const today = new Date().toISOString().split('T')[0];
    const lastPrizeDate = userData.last_prize_date ? new Date(userData.last_prize_date).toISOString().split('T')[0] : null;

    // Check if user already played today
    if (lastPrizeDate === today) {
      return res.status(400).json({ 
        msg: 'You can only spin the prize wheel once per day. Come back tomorrow!',
        type: 'error',
        canPlayToday: false
      });
    }

    // Update user score and set last_prize_date
    const newScore = userData.score + reward;
    const newAnchors = userData.anchors + 1;

    await db.query(
      'UPDATE users SET score = ?, anchors = ?, last_prize_date = NOW() WHERE id = ?',
      [newScore, newAnchors, userId]
    );

    res.json({
      data: {
        reward,
        newScore,
        newAnchors,
      },
      msg: 'Prize wheel spun successfully!',
      type: 'success'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
