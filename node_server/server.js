import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import transactionsRouter from './routes/transactions.js';
import shopsRouter from './routes/shops.js';
import booksRouter from './routes/books.js';
import mediaRouter from './routes/media.js';
import articlesRouter from './routes/articles.js';
import shipsRouter from './routes/ships.js';
import shipListRouter from './routes/shipList.js';
import portsRouter from './routes/ports.js';
import gamesRouter from './routes/games.js';
import categoriesRouter from './routes/categories.js';
import prizewheelRouter from './routes/prizewheel.js';
import booksCategories from './routes/books-categories.js';
import mediaCategories from './routes/media-categories.js';
import articlesCategories from './routes/articles-categories.js';
import gamesCategories from './routes/games-categories.js';
import shopCategories from './routes/shop-categories.js';
import ordersRouter from './routes/orders.js';

// Create Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve public uploads folder as static
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // your MySQL password
  database: "gameportal",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Token required" });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
};

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({ msg: "Admin access required" });
  }
  next();
};

// Initialize database tables
async function initDatabase() {
  const queries = [
    
    `CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      parent_id INT,
      description TEXT,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
      INDEX idx_status (status),
      INDEX idx_parent_id (parent_id)
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      score INT DEFAULT 0,
      anchors INT DEFAULT 0,
      last_prize_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      amount DECIMAL(10, 2),
      type ENUM('purchase', 'payment', 'refund') DEFAULT 'purchase',
      description VARCHAR(255),
      status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255),
      description TEXT,
      price DECIMAL(10, 2),
      category_id INT,
      category VARCHAR(100),
      cover_image VARCHAR(255),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS media (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      media_type ENUM('image', 'video', 'audio') DEFAULT 'image',
      file_url VARCHAR(255),
      category_id INT,
      category VARCHAR(100),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      author_id INT,
      category_id INT,
      category VARCHAR(100),
      status ENUM('draft', 'published') DEFAULT 'draft',
      views INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )`,
    
    `CREATE TABLE IF NOT EXISTS shop_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      parent_id INT,
      description TEXT,
      image_url VARCHAR(255),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES shop_categories(id) ON DELETE SET NULL,
      INDEX idx_parent_id (parent_id),
      INDEX idx_status (status)
    )`,
    `CREATE TABLE IF NOT EXISTS shops (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      shop_category_id INT,
      contact_name INT,
      image_url VARCHAR(255),
      sku VARCHAR(100),
      brand VARCHAR(100),
      model_number VARCHAR(100),
      color VARCHAR(100),
      material VARCHAR(100),
      price DECIMAL(10, 2),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_category_id) REFERENCES shop_categories(id) ON DELETE SET NULL,
      INDEX idx_category (shop_category_id),
      INDEX idx_status (status)
    )`,
    `CREATE TABLE IF NOT EXISTS ports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      country VARCHAR(100) NOT NULL,
      description TEXT,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_country (country),
      INDEX idx_status (status)
    )`,
    `CREATE TABLE IF NOT EXISTS ships (
      id INT AUTO_INCREMENT PRIMARY KEY,
      imo VARCHAR(10) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100) NOT NULL,
      category_id INT,
      capacity_tons INT NOT NULL,
      start_port_id INT,
      end_port_id INT,
      ship_owner VARCHAR(255),
      image_url VARCHAR(255),
      last_maintenance_date DATE,
      status ENUM('active', 'maintenance', 'decommissioned') DEFAULT 'active',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
      UNIQUE KEY unique_imo (imo),
      FOREIGN KEY (start_port_id) REFERENCES ports(id) ON DELETE SET NULL,
      FOREIGN KEY (end_port_id) REFERENCES ports(id) ON DELETE SET NULL,
      INDEX idx_status (status),
      INDEX idx_imo (imo)
    )`,
    `CREATE TABLE IF NOT EXISTS games (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category_id INT,
      category VARCHAR(100),
      price DECIMAL(10, 2) DEFAULT 0,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      ship_id INT NOT NULL,
      ship_imo VARCHAR(10),
      cargo_type VARCHAR(100),
      cargo_weight DECIMAL(10, 2),
      weight_unit VARCHAR(20),
      preferred_loading_date DATE,
      preferred_arrival_date DATE,
      contact_name VARCHAR(255),
      contact_email VARCHAR(255),
      contact_phone VARCHAR(20),
      message LONGTEXT,
      status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
      admin_message LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (ship_id) REFERENCES ships(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_ship_id (ship_id),
      INDEX idx_status (status),
      INDEX idx_created_at (created_at)
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      delivery_required BOOLEAN DEFAULT false,
      delivery_address TEXT,
      delivery_city VARCHAR(100),
      delivery_country VARCHAR(100),
      delivery_postal_code VARCHAR(20),
      status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
      payment_method VARCHAR(50),
      notes LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_status (status),
      INDEX idx_created_at (created_at)
    )`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      shop_id INT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(10, 2) NOT NULL,
      subtotal DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
      INDEX idx_order_id (order_id)
    )`
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
    } catch (err) {
      console.error("Database initialization error:", err);
    }
  }

  // Ensure shop_categories has a display_order column for ordering
  try {
    const [cols] = await pool.query(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'shop_categories' AND COLUMN_NAME = 'display_order'`,
      [pool.config.connectionConfig.database]
    );
    if (cols[0].cnt === 0) {
      await pool.query(`ALTER TABLE shop_categories ADD COLUMN display_order INT DEFAULT 0`);
    }
  } catch (err) {
    // non-fatal
    console.error('Could not ensure display_order column on shop_categories:', err.message || err);
  }

  // Ensure categories table has display_order for ordering
  try {
    const [cols2] = await pool.query(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'display_order'`,
      [pool.config.connectionConfig.database]
    );
    if (cols2[0].cnt === 0) {
      await pool.query(`ALTER TABLE categories ADD COLUMN display_order INT DEFAULT 0`);
    }
  } catch (err) {
    console.error('Could not ensure display_order column on categories:', err.message || err);
  }

  // Ensure books table has extended columns required for digital library
  try {
    const dbName = pool.config.connectionConfig.database;
    const check = async (table, column, colDef) => {
      const [r] = await pool.query(
        `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [dbName, table, column]
      );
      if (r[0].cnt === 0) {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN ${colDef}`);
      }
    };

    await check('books', 'content_type', "VARCHAR(20) DEFAULT 'pdf'");
    await check('books', 'file_url', "VARCHAR(255)");
    await check('books', 'preview_url', "VARCHAR(255)");
    await check('books', 'thumbnail_url', "VARCHAR(255)");
    await check('books', 'file_size', "BIGINT DEFAULT 0");
    await check('books', 'page_count', "INT DEFAULT 0");
    await check('books', 'duration_minutes', "INT DEFAULT 0");
    await check('books', 'is_free', "TINYINT(1) DEFAULT 1");
    await check('books', 'currency', "VARCHAR(10) DEFAULT 'USD'");
    await check('books', 'score_cost', "INT DEFAULT 0");
    await check('books', 'discount_price', "DECIMAL(10,2) DEFAULT NULL");
    await check('books', 'subscription_required', "TINYINT(1) DEFAULT 0");
    await check('books', 'access_level', "VARCHAR(20) DEFAULT 'public'");
    await check('books', 'max_downloads', "INT DEFAULT 0");
    await check('books', 'expire_days_after_purchase', "INT DEFAULT 0");
    await check('books', 'view_count', "INT DEFAULT 0");
    await check('books', 'download_count', "INT DEFAULT 0");
    await check('books', 'purchase_count', "INT DEFAULT 0");
    await check('books', 'average_rating', "DECIMAL(3,2) DEFAULT 0");
    await check('books', 'is_featured', "TINYINT(1) DEFAULT 0");
    await check('books', 'is_popular', "TINYINT(1) DEFAULT 0");
    await check('books', 'is_active', "TINYINT(1) DEFAULT 1");
    await check('books', 'tags', "VARCHAR(255) DEFAULT NULL");
  } catch (err) {
    console.error('Could not ensure extended books columns:', err.message || err);
  }

  // Ensure a book_events table for time-series tracking exists
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS book_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        book_id INT NOT NULL,
        user_id INT,
        event_type ENUM('download','purchase') NOT NULL,
        amount DECIMAL(10,2) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_book_id (book_id),
        INDEX idx_user_id (user_id),
        INDEX idx_event_type (event_type),
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
  } catch (err) {
    console.error('Could not ensure book_events table:', err.message || err);
  }

  // Ensure subtitle column exists
  try {
    const [sub] = await pool.query(
      `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'books' AND COLUMN_NAME = 'subtitle'`,
      [pool.config.connectionConfig.database]
    );
    if (sub[0].cnt === 0) {
      await pool.query(`ALTER TABLE books ADD COLUMN subtitle VARCHAR(255) DEFAULT NULL`);
    }
  } catch (err) {
    console.error('Could not ensure subtitle column on books:', err.message || err);
  }

  // Extend books.status enum to include draft, published, archived if not already
  try {
    // Attempt to modify the column to include new values; keep default 'active' if present
    await pool.query(`ALTER TABLE books MODIFY COLUMN status ENUM('draft','published','active','inactive','archived') DEFAULT 'active'`);
  } catch (err) {
    // Not fatal; log and continue
    console.error('Could not modify books.status enum:', err.message || err);
  }
}

initDatabase();

// ==================== AUTHENTICATION ====================
app.use("/uploads", express.static("uploads"));
// SIGNUP
app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ msg: "All fields are required", type: "error" });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ msg: "Username must be at least 3 characters", type: "error" });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Invalid email format", type: "error" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters", type: "error" });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match", type: "error" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR username = ?", 
      [email, username]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ msg: "Email or username already exists", type: "error" });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)", 
      [username, email, hashed, "user"]
    );

    res.status(201).json({ 
      msg: "Account created successfully! Please login.", 
      type: "success" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required", type: "error" });
    }

    const [rows] = await pool.query(
      "SELECT id, username, email, role, score FROM users WHERE email = ?", 
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ msg: "Invalid email or password", type: "error" });
    }

    const user = rows[0];
    const [userWithPassword] = await pool.query(
      "SELECT password FROM users WHERE id = ?",
      [user.id]
    );

    const match = await bcrypt.compare(password, userWithPassword[0].password);
    
    if (!match) {
      return res.status(401).json({ msg: "Invalid email or password", type: "error" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      msg: "Login successful!",
      type: "success",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        score: user.score
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// ==================== TRANSACTIONS ====================
// Transactions routes moved to router: see ./routes/transactions.js


// ==================== BOOKS ====================
// Books routes moved to router: see ./routes/books.js

// ==================== MEDIA ====================
// Media routes moved to router: see ./routes/media.js

// ==================== ARTICLES ====================
// Articles routes moved to router: see ./routes/articles.js

// Delete article
app.delete("/api/admin/articles/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM articles WHERE id = ?", [id]);
    res.json({ msg: "Article deleted successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// ==================== SHOPS ====================
// Shops routes moved to router: see ./routes/shops.js

// serve uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'node_server', 'uploads')));

// ==================== MEDIA STREAMING ====================

// Helper function to get video duration and codec info
function getVideoInfo(filepath) {
  return new Promise((resolve, reject) => {
    exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1:noprint_sections=1 "${filepath}"`, (error, stdout) => {
      if (error) {
        return resolve({ duration: 0, error: true });
      }
      const duration = parseFloat(stdout.trim());
      resolve({ duration: isNaN(duration) ? 0 : duration, error: false });
    });
  });
}

// HLS Playlist endpoint
app.get('/api/hls/playlist/:videoId', verifyToken, async (req, res) => {
  try {
    const { videoId } = req.params;
    const videoPath = path.join(process.cwd(), 'node_server', 'uploads', videoId);
    const playlistPath = path.join(process.cwd(), 'node_server', 'uploads', `${videoId}.m3u8`);

    // Check if video exists
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ msg: 'Video not found' });
    }

    // Check if playlist exists, if not generate it
    if (!fs.existsSync(playlistPath)) {
      // Generate HLS playlist with ffmpeg
      exec(`ffmpeg -i "${videoPath}" -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${playlistPath}"`, (error) => {
        if (error) {
          console.error('FFmpeg error:', error);
          return res.status(500).json({ msg: 'Could not generate HLS stream' });
        }
      });
    }

    // Send the playlist file
    res.type('application/vnd.apple.mpegurl');
    fs.createReadStream(playlistPath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Streaming error' });
  }
});

// HLS Segment endpoint
app.get('/api/hls/segment/:videoId/:segmentIndex', verifyToken, (req, res) => {
  try {
    const { videoId, segmentIndex } = req.params;
    const segmentPath = path.join(
      process.cwd(),
      'node_server',
      'uploads',
      `${videoId}${segmentIndex}.ts`
    );

    // Security check
    if (!segmentPath.startsWith(path.join(process.cwd(), 'node_server', 'uploads'))) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    if (!fs.existsSync(segmentPath)) {
      return res.status(404).json({ msg: 'Segment not found' });
    }

    res.type('video/MP2T');
    fs.createReadStream(segmentPath).pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Segment streaming error' });
  }
});

// Progressive download with byte-range support (fallback for older clients)
app.get('/api/stream/:filename', verifyToken, (req, res) => {
  try {
    const { filename } = req.params;
    const filepath = path.join(process.cwd(), 'node_server', 'uploads', filename);
    
    // Security: prevent directory traversal
    if (!filepath.startsWith(path.join(process.cwd(), 'node_server', 'uploads'))) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ msg: 'File not found' });
    }

    const stat = fs.statSync(filepath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4'
      });
      fs.createReadStream(filepath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4'
      });
      fs.createReadStream(filepath).pipe(res);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Streaming error' });
  }
});

// mount admin routers
app.use('/api/admin', transactionsRouter);
app.use('/api/admin', shopsRouter);
app.use('/api/admin', booksRouter);
app.use('/api/admin', mediaRouter);
app.use('/api/admin', articlesRouter);
app.use('/api/admin', shipsRouter);
app.use('/api/admin', portsRouter);
app.use('/api/admin', gamesRouter);
app.use('/api/admin', categoriesRouter);
app.use('/api/admin/books-categories', booksCategories);
app.use('/api/admin/media-categories', mediaCategories);
app.use('/api/admin/articles-categories', articlesCategories);
app.use('/api/admin/games-categories', gamesCategories);
app.use('/api/admin/shop-categories', shopCategories);
app.use('/api/shop-categories', shopCategories);

import db from './db.js';

// Public shops endpoint
// Public shops endpoint (kept inline for simple listing)
app.get('/api/shops', async (req, res) => {
  try {
    
    console.log("hello");
    const [shops] = await db.query(
      'SELECT * FROM shops WHERE status = ? ORDER BY created_at DESC',
      ['active']
    );
    res.json({ data: shops, msg: 'Shops fetched', type: 'success' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', type: 'error' });
  }
});

// Mount ships routes at /api so public endpoints like /api/ships/applications are reachable

app.use('/api/ships', shipListRouter);

app.use('/api', shipsRouter);



// Mount orders router
app.use('/api/orders', ordersRouter);

app.use('/api', prizewheelRouter);  

// Mount public ports routes so frontend can fetch `/api/ports-list`
app.use('/api', portsRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
