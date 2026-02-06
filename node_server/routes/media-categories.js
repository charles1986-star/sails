import express from "express";
import pool from "../db.js";
import { verifyToken, verifyAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all media categories (public)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM categories WHERE status = 'active' ORDER BY name ASC"
    );
    res.json({ data: rows, msg: "Media categories retrieved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to retrieve categories", type: "error" });
  }
});

// Get all media categories (admin)
router.get("/admin", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM categories ORDER BY name ASC"
    );
    res.json({ data: rows, msg: "All media categories retrieved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to retrieve categories", type: "error" });
  }
});

// Get single media category
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM categories WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ msg: "Category not found", type: "error" });
    }
    res.json({ data: rows[0], msg: "Category retrieved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to retrieve category", type: "error" });
  }
});

// Create media category (admin only)
router.post("/", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, description, status = "active", parent_id = null } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ msg: "Category name is required", type: "error" });
    }

    const [result] = await pool.query(
      "INSERT INTO categories (name, description, status, parent_id) VALUES (?, ?, ?, ?)",
      [name.trim(), description || null, status, parent_id || null]
    );

    res.status(201).json({
      data: { id: result.insertId, name, description, status, parent_id },
      msg: "Category created successfully",
      type: "success"
    });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ msg: "Category name already exists", type: "error" });
    }
    res.status(500).json({ msg: "Failed to create category", type: "error" });
  }
});

// Update media category (admin only)
router.put("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, parent_id } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ msg: "Category name is required", type: "error" });
    }

    const [result] = await pool.query(
      "UPDATE categories SET name = ?, description = ?, status = ?, parent_id = ? WHERE id = ?",
      [name.trim(), description || null, status || "active", parent_id || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Category not found", type: "error" });
    }

    res.json({
      data: { id, name, description, status, parent_id },
      msg: "Category updated successfully",
      type: "success"
    });
  } catch (err) {
    console.error(err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ msg: "Category name already exists", type: "error" });
    }
    res.status(500).json({ msg: "Failed to update category", type: "error" });
  }
});

// Delete media category (admin only)
router.delete("/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: "Category not found", type: "error" });
    }

    res.json({ msg: "Category deleted successfully", type: "success" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to delete category", type: "error" });
  }
});

export default router;
