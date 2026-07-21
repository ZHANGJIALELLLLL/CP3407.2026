require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ─── Sign up ───
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter your email and password." });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)",
      [email, passwordHash, nickname || null]
    );

    res.status(201).json({ message: "Sign up successful." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── User login ───
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter your email and password." });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "This account does not exist." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    res.json({ message: "Login successful", id: user.id, email: user.email, nickname: user.nickname });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Admin login ───
app.post("/api/admin/login", async (req, res) => {
  try {
    const { adminId, password } = req.body;

    if (!adminId || !password) {
      return res.status(400).json({ message: "Please enter the admin ID and password." });
    }

    const [rows] = await pool.query("SELECT * FROM admins WHERE admin_id = ?", [adminId]);
    const admin = rows[0];

    if (!admin) {
      return res.status(401).json({ message: "This admin account does not exist." });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    res.json({ message: "Admin login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Get posts (public posts + the current user's own private posts) ───
app.get("/api/posts", async (req, res) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : null;

    const [posts] = await pool.query(
      `SELECT id, author_id AS authorId, category, content, is_public AS isPublic, created_at AS createdAt
       FROM posts
       WHERE is_public = TRUE ${userId ? "OR author_id = ?" : ""}
       ORDER BY id DESC`,
      userId ? [userId] : []
    );

    if (posts.length === 0) {
      return res.json([]);
    }

    const postIds = posts.map((p) => p.id);
    const [comments] = await pool.query(
      `SELECT post_id AS postId, content FROM comments WHERE post_id IN (?) ORDER BY id ASC`,
      [postIds]
    );

    const commentsByPost = {};
    for (const c of comments) {
      if (!commentsByPost[c.postId]) commentsByPost[c.postId] = [];
      commentsByPost[c.postId].push(c.content);
    }

    const result = posts.map((p) => ({
      ...p,
      isPublic: !!p.isPublic,
      comments: commentsByPost[p.id] || []
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Create a new post ───
app.post("/api/posts", async (req, res) => {
  try {
    const { authorId, category, content, isPublic } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({ message: "Missing author or content." });
    }

    const [result] = await pool.query(
      `INSERT INTO posts (author_id, category, content, is_public) VALUES (?, ?, ?, ?)`,
      [authorId, category || "other", content, isPublic !== false]
    );

    res.status(201).json({
      id: result.insertId,
      authorId,
      category: category || "other",
      content,
      isPublic: isPublic !== false,
      comments: []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Add a comment to a post ───
app.post("/api/posts/:id/comments", async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { authorId, content } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({ message: "Missing author or content." });
    }

    await pool.query(
      `INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)`,
      [postId, authorId, content]
    );

    res.status(201).json({ message: "Comment added." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});