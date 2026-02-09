import express from 'express';
import db from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Ensure public uploads directory exists for books
const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'book');
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
    // Allow images, pdfs, and common video/audio types for book content
    const allowed = /\.(jpg|jpeg|png|gif|webp|pdf|mp4|mov|webm|m4a|mp3)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit for book files
});

// GET /books
// GET /books with filters (admin)
router.get('/books', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { q, category_id, free, status, limit = 50, offset = 0 } = req.query;
    const where = [];
    const params = [];
    if (q) {
      where.push("(title LIKE ? OR author LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    if (category_id) {
      where.push('category_id = ?');
      params.push(category_id);
    }
    if (free === 'true') {
      where.push('is_free = 1');
    } else if (free === 'false') {
      where.push('is_free = 0');
    }
    if (status) {
      where.push('status = ?');
      params.push(status);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT * FROM books ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const [countRes] = await db.query(`SELECT COUNT(*) as total FROM books ${whereSql}`, params);
    const total = countRes[0].total;

    res.json({ data: rows, total, limit: parseInt(limit), offset: parseInt(offset), msg: 'Books fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// POST /books
// Create book with multiple uploads
router.post('/books', verifyToken, verifyAdmin, upload.fields([{ name: 'cover_image' }, { name: 'main_file' }, { name: 'preview_file' }, { name: 'thumbnail' }]), async (req, res) => {
  try {
    const body = req.body;
    const { title, subtitle, author_name, description, tags } = body;
    const is_free = body.is_free === 'true' || body.is_free === '1' ? 1 : 0;
    const price = body.price ? parseFloat(body.price) : 0;

    if (!title || !author_name) return res.status(400).json({ msg: 'Title and author required', type: 'error' });

    const files = req.files || {};
    const cover_image = files.cover_image?.[0] ? `/uploads/book/${files.cover_image[0].filename}` : body.cover_image || null;
    const file_url = files.main_file?.[0] ? `/uploads/book/${files.main_file[0].filename}` : body.file_url || null;
    const preview_url = files.preview_file?.[0] ? `/uploads/book/${files.preview_file[0].filename}` : body.preview_url || null;
    const thumbnail_url = files.thumbnail?.[0] ? `/uploads/book/${files.thumbnail[0].filename}` : body.thumbnail_url || null;

    await db.query(
      `INSERT INTO books (title, subtitle, author, description, tags, content_type, file_url, preview_url, cover_image, thumbnail_url, file_size, page_count, duration_minutes, is_free, price, currency, score_cost, discount_price, subscription_required, access_level, max_downloads, expire_days_after_purchase, status, is_featured, is_popular, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        body.subtitle || null,
        author_name,
        description || null,
        tags || null,
        body.content_type || 'pdf',
        file_url,
        preview_url,
        cover_image,
        thumbnail_url,
        body.file_size || 0,
        body.page_count || 0,
        body.duration_minutes || 0,
        is_free,
        price,
        body.currency || 'USD',
        body.score_cost || 0,
        body.discount_price || null,
        body.subscription_required === 'true' || body.subscription_required === '1' ? 1 : 0,
        body.access_level || 'public',
        body.max_downloads || 0,
        body.expire_days_after_purchase || 0,
        body.status || 'draft',
        body.is_featured === 'true' ? 1 : 0,
        body.is_popular === 'true' ? 1 : 0,
        body.is_active === 'false' ? 0 : 1
      ]
    );

    res.status(201).json({ msg: 'Book created successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// GET /books/:id
router.get('/books/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM books WHERE id = ? LIMIT 1', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ msg: 'Book not found', type: 'error' });
    res.json({ data: rows[0], msg: 'Book fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// PUT /books/:id
// Update book with optional file uploads
router.put('/books/:id', verifyToken, verifyAdmin, upload.fields([{ name: 'cover_image' }, { name: 'main_file' }, { name: 'preview_file' }, { name: 'thumbnail' }]), async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const files = req.files || {};

    const fields = [];
    const params = [];

    const map = (k, val) => { fields.push(`${k} = ?`); params.push(val); };

    if (body.title) map('title', body.title);
    if (body.subtitle) map('subtitle', body.subtitle);
    if (body.author_name) map('author', body.author_name);
    if (body.description) map('description', body.description);
    if (body.tags) map('tags', body.tags);
    if (body.content_type) map('content_type', body.content_type);
    if (files.main_file?.[0]) map('file_url', `/uploads/book/${files.main_file[0].filename}`);
    if (files.preview_file?.[0]) map('preview_url', `/uploads/book/${files.preview_file[0].filename}`);
    if (files.cover_image?.[0]) map('cover_image', `/uploads/book/${files.cover_image[0].filename}`);
    if (files.thumbnail?.[0]) map('thumbnail_url', `/uploads/book/${files.thumbnail[0].filename}`);
    if (body.price !== undefined) map('price', body.price || 0);
    if (body.is_free !== undefined) map('is_free', body.is_free === 'true' || body.is_free === '1' ? 1 : 0);
    if (body.status) map('status', body.status);
    if (body.is_featured !== undefined) map('is_featured', body.is_featured === 'true' ? 1 : 0);
    if (body.is_popular !== undefined) map('is_popular', body.is_popular === 'true' ? 1 : 0);

    if (fields.length === 0) return res.status(400).json({ msg: 'No fields to update', type: 'error' });

    params.push(id);
    await db.query(`UPDATE books SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, params);

    res.json({ msg: 'Book updated successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// DELETE /books/:id
// Soft delete: mark is_active = 0 and status = 'archived'
router.delete('/books/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE books SET is_active = 0, status = ? WHERE id = ?', ['archived', id]);
    res.json({ msg: 'Book archived successfully', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// Statistics endpoint for admin dashboard
router.get('/books/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [[{ total_books }]] = await db.query('SELECT COUNT(*) as total_books FROM books');
    const [[{ total_downloads }]] = await db.query('SELECT SUM(download_count) as total_downloads FROM books');
    const [[{ total_purchases }]] = await db.query('SELECT SUM(purchase_count) as total_purchases FROM books');
    const [[{ revenue }]] = await db.query('SELECT SUM(price * purchase_count) as revenue FROM books');

    const [popular] = await db.query('SELECT id, title, download_count FROM books ORDER BY download_count DESC LIMIT 5');
    const [topCats] = await db.query('SELECT category_id, COUNT(*) as cnt FROM books GROUP BY category_id ORDER BY cnt DESC LIMIT 5');

    res.json({ data: { total_books, total_downloads: total_downloads || 0, total_purchases: total_purchases || 0, revenue: revenue || 0, popular, topCats }, msg: 'Stats fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// Time-series endpoint: downloads/purchases by day
router.get('/books/stats/timeseries', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { start, end } = req.query;
    // validate dates
    const startDate = start ? new Date(start) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = end ? new Date(end) : new Date();
    if (isNaN(startDate) || isNaN(endDate)) return res.status(400).json({ msg: 'Invalid date range', type: 'error' });

    // Build list of days between start and end
    const days = [];
    const cur = new Date(startDate);
    cur.setHours(0,0,0,0);
    endDate.setHours(0,0,0,0);
    while (cur <= endDate) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    // Query aggregated counts per day
    const [rows] = await db.query(
      `SELECT DATE(created_at) as day, event_type, COUNT(*) as cnt, SUM(IFNULL(amount,0)) as amount FROM book_events WHERE created_at BETWEEN ? AND ? GROUP BY day, event_type ORDER BY day ASC`,
      [startDate.toISOString().slice(0,19).replace('T',' '), new Date(endDate.getTime()+24*60*60*1000).toISOString().slice(0,19).replace('T',' ')]
    );

    const map = {};
    rows.forEach(r => {
      const d = r.day.toISOString().slice(0,10);
      if (!map[d]) map[d] = { downloads: 0, purchases: 0, revenue: 0 };
      if (r.event_type === 'download') map[d].downloads = r.cnt;
      if (r.event_type === 'purchase') { map[d].purchases = r.cnt; map[d].revenue = parseFloat(r.amount || 0); }
    });

    const series = days.map(d => {
      const key = d.toISOString().slice(0,10);
      return { day: key, downloads: map[key]?.downloads || 0, purchases: map[key]?.purchases || 0, revenue: map[key]?.revenue || 0 };
    });

    res.json({ data: series, msg: 'Timeseries fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// Tracking endpoint: record download or purchase, increment counters
router.post('/books/:id/track', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, user_id, amount } = req.body;
    if (!['download','purchase'].includes(type)) return res.status(400).json({ msg: 'Invalid event type', type: 'error' });

    // Insert event
    await db.query('INSERT INTO book_events (book_id, user_id, event_type, amount) VALUES (?,?,?,?)', [id, user_id || null, type, amount || null]);

    // Increment counters on books table
    if (type === 'download') {
      await db.query('UPDATE books SET download_count = IFNULL(download_count,0) + 1 WHERE id = ?', [id]);
    } else if (type === 'purchase') {
      await db.query('UPDATE books SET purchase_count = IFNULL(purchase_count,0) + 1 WHERE id = ?', [id]);
      if (amount) {
        // optionally update revenue stored elsewhere; we keep revenue in book_events
      }
    }

    res.json({ msg: 'Event recorded', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

export default router;
