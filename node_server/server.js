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
import gamesRouter from './routes/games.js';

// Create Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

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
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      score INT DEFAULT 0,
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
      category VARCHAR(100),
      cover_image VARCHAR(255),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS media (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      media_type ENUM('image', 'video', 'audio') DEFAULT 'image',
      file_url VARCHAR(255),
      category VARCHAR(100),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS articles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      author_id INT,
      category VARCHAR(100),
      status ENUM('draft', 'published') DEFAULT 'draft',
      views INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS shops (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      owner_id INT,
      image_url VARCHAR(255),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS ships (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      specifications TEXT,
      image_url VARCHAR(255),
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS games (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      price DECIMAL(10, 2) DEFAULT 0,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
    } catch (err) {
      console.error("Database initialization error:", err);
    }
  }
}

initDatabase();

// ==================== AUTHENTICATION ====================

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
app.use('/api/admin', gamesRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
