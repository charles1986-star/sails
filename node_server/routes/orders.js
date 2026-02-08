import express from 'express';
import db from '../db.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// ==================== ORDERS ROUTES ====================

// GET all orders (admin only) with pagination
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const [orders] = await db.query(
      `SELECT o.*, u.username, u.email, COUNT(oi.id) as item_count
       FROM orders o
       JOIN users u ON o.user_id = u.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM orders');
    const total = countResult[0].total;

    res.json({
      data: orders,
      total,
      limit,
      offset,
      msg: 'Orders fetched',
      type: 'success'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// GET user's orders
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const [orders] = await db.query(
      `SELECT o.*, COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [countResult] = await db.query('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [userId]);
    const total = countResult[0].total;

    res.json({
      data: orders,
      total,
      limit,
      offset,
      msg: 'Your orders fetched',
      type: 'success'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// GET single order with items
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ msg: 'Order not found', type: 'error' });
    }

    const order = orders[0];

    // Check authorization
    if (order.user_id !== userId && req.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized', type: 'error' });
    }

    // Get order items
    const [items] = await db.query(
      `SELECT oi.*, s.name as product_name, s.image_url, s.sku
       FROM order_items oi
       JOIN shops s ON oi.shop_id = s.id
       WHERE oi.order_id = ?
       ORDER BY oi.id`,
      [id]
    );

    res.json({
      data: {
        ...order,
        items
      },
      msg: 'Order fetched',
      type: 'success'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST - Create new order
router.post('/', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const {
      items,
      total_amount,
      delivery_required,
      delivery_address,
      delivery_city,
      delivery_country,
      delivery_postal_code,
      payment_method,
      notes
    } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ msg: 'Order must contain at least one item', type: 'error' });
    }

    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({ msg: 'Invalid order total', type: 'error' });
    }

    if (delivery_required && (!delivery_address || !delivery_city || !delivery_country)) {
      return res.status(400).json({ msg: 'Delivery details are required', type: 'error' });
    }

    // Verify all products exist
    for (const item of items) {
      const [shop] = await db.query('SELECT id FROM shops WHERE id = ?', [item.shop_id]);
      if (shop.length === 0) {
        return res.status(404).json({ msg: `Product ${item.shop_id} not found`, type: 'error' });
      }
    }

    // Create order
    const [result] = await db.query(
      `INSERT INTO orders (user_id, total_amount, delivery_required, delivery_address, delivery_city, delivery_country, delivery_postal_code, payment_method, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        total_amount,
        delivery_required ? 1 : 0,
        delivery_address || null,
        delivery_city || null,
        delivery_country || null,
        delivery_postal_code || null,
        payment_method || null,
        notes || null,
        'pending'
      ]
    );

    const orderId = result.insertId;

    // Create order items
    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, shop_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          item.shop_id,
          item.quantity || 1,
          item.unit_price || 0,
          (item.quantity || 1) * (item.unit_price || 0)
        ]
      );
    }

    const [orderData] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);

    res.status(201).json({
      data: orderData[0],
      msg: 'Order created successfully',
      type: 'success'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT - Update order status (admin only)
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status || !['pending', 'paid', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status', type: 'error' });
    }

    const [existing] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ msg: 'Order not found', type: 'error' });
    }

    await db.query(
      'UPDATE orders SET status = ?, notes = ?, updated_at = NOW() WHERE id = ?',
      [status, notes || existing[0].notes, id]
    );

    const [updated] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);

    res.json({
      data: updated[0],
      msg: 'Order updated successfully',
      type: 'success'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// DELETE - Cancel order
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [existing] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ msg: 'Order not found', type: 'error' });
    }

    // Check authorization
    if (existing[0].user_id !== userId && req.role !== 'admin') {
      return res.status(403).json({ msg: 'Unauthorized', type: 'error' });
    }

    // Only allow cancellation of pending orders
    if (existing[0].status !== 'pending') {
      return res.status(400).json({ msg: 'Can only cancel pending orders', type: 'error' });
    }

    await db.query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', id]);

    res.json({ msg: 'Order cancelled successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
