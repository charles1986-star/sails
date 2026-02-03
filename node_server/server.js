import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";

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
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
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

// Get all transactions (admin only)
app.get("/api/admin/transactions", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.username FROM transactions t 
       JOIN users u ON t.user_id = u.id 
       ORDER BY t.created_at DESC`
    );
    res.json({ data: rows, msg: "Transactions fetched", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Create transaction
app.post("/api/admin/transactions", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { user_id, amount, type, description } = req.body;
    
    if (!user_id || !amount || !type) {
      return res.status(400).json({ msg: "All fields required", type: "error" });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ msg: "Amount must be positive", type: "error" });
    }

    await pool.query(
      `INSERT INTO transactions (user_id, amount, type, description, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, amount, type, description, "completed"]
    );

    res.status(201).json({ msg: "Transaction created successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Update transaction
app.put("/api/admin/transactions/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, description, status } = req.body;

    if (amount && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({ msg: "Amount must be positive", type: "error" });
    }

    await pool.query(
      `UPDATE transactions SET amount = ?, type = ?, description = ?, status = ? WHERE id = ?`,
      [amount, type, description, status, id]
    );

    res.json({ msg: "Transaction updated successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Delete transaction
app.delete("/api/admin/transactions/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM transactions WHERE id = ?", [id]);
    res.json({ msg: "Transaction deleted successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// ==================== BOOKS ====================

// Get all books (admin only)
app.get("/api/admin/books", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM books ORDER BY created_at DESC");
    res.json({ data: rows, msg: "Books fetched", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Create book
app.post("/api/admin/books", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, author, description, price, category } = req.body;
    
    if (!title || !author || !price) {
      return res.status(400).json({ msg: "Title, author, and price required", type: "error" });
    }

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ msg: "Price must be positive", type: "error" });
    }

    await pool.query(
      `INSERT INTO books (title, author, description, price, category, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, author, description, price, category, "active"]
    );

    res.status(201).json({ msg: "Book created successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Update book
app.put("/api/admin/books/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, description, price, category, status } = req.body;

    if (price && (isNaN(price) || price <= 0)) {
      return res.status(400).json({ msg: "Price must be positive", type: "error" });
    }

    await pool.query(
      `UPDATE books SET title = ?, author = ?, description = ?, price = ?, category = ?, status = ? WHERE id = ?`,
      [title, author, description, price, category, status, id]
    );

    res.json({ msg: "Book updated successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Delete book
app.delete("/api/admin/books/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM books WHERE id = ?", [id]);
    res.json({ msg: "Book deleted successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// ==================== MEDIA ====================

// Get all media (admin only)
app.get("/api/admin/media", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM media ORDER BY created_at DESC");
    res.json({ data: rows, msg: "Media fetched", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Create media
app.post("/api/admin/media", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, description, media_type, file_url, category } = req.body;
    
    if (!title || !media_type) {
      return res.status(400).json({ msg: "Title and media type required", type: "error" });
    }

    await pool.query(
      `INSERT INTO media (title, description, media_type, file_url, category, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, media_type, file_url, category, "active"]
    );

    res.status(201).json({ msg: "Media created successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Update media
app.put("/api/admin/media/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, media_type, file_url, category, status } = req.body;

    await pool.query(
      `UPDATE media SET title = ?, description = ?, media_type = ?, file_url = ?, category = ?, status = ? WHERE id = ?`,
      [title, description, media_type, file_url, category, status, id]
    );

    res.json({ msg: "Media updated successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Delete media
app.delete("/api/admin/media/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM media WHERE id = ?", [id]);
    res.json({ msg: "Media deleted successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// ==================== ARTICLES ====================

// Get all articles (admin only)
app.get("/api/admin/articles", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, u.username FROM articles a 
       JOIN users u ON a.author_id = u.id 
       ORDER BY a.created_at DESC`
    );
    res.json({ data: rows, msg: "Articles fetched", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Create article
app.post("/api/admin/articles", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, content, category, status } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ msg: "Title and content required", type: "error" });
    }

    await pool.query(
      `INSERT INTO articles (title, content, author_id, category, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, content, req.userId, category, status || "draft"]
    );

    res.status(201).json({ msg: "Article created successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Update article
app.put("/api/admin/articles/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, status } = req.body;

    await pool.query(
      `UPDATE articles SET title = ?, content = ?, category = ?, status = ? WHERE id = ?`,
      [title, content, category, status, id]
    );

    res.json({ msg: "Article updated successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

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

// Get all shops (admin only)
app.get("/api/admin/shops", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, u.username FROM shops s 
       JOIN users u ON s.owner_id = u.id 
       ORDER BY s.created_at DESC`
    );
    res.json({ data: rows, msg: "Shops fetched", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Create shop
app.post("/api/admin/shops", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, category, owner_id } = req.body;
    
    if (!name) {
      return res.status(400).json({ msg: "Shop name required", type: "error" });
    }

    await pool.query(
      `INSERT INTO shops (name, description, category, owner_id, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, description, category, owner_id, "active"]
    );

    res.status(201).json({ msg: "Shop created successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Update shop
app.put("/api/admin/shops/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, owner_id, status } = req.body;

    await pool.query(
      `UPDATE shops SET name = ?, description = ?, category = ?, owner_id = ?, status = ? WHERE id = ?`,
      [name, description, category, owner_id, status, id]
    );

    res.json({ msg: "Shop updated successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Delete shop
app.delete("/api/admin/shops/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM shops WHERE id = ?", [id]);
    res.json({ msg: "Shop deleted successfully", type: "success" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", type: "error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
