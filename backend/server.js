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

    if (user.status === "suspended") {
      return res.status(403).json({ message: "This account has been suspended. Please contact an administrator." });
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

// ─── Admin dashboard stats ───
app.get("/api/admin/stats", async (req, res) => {
  try {
    const [[{ userCount }]] = await pool.query(`SELECT COUNT(*) AS userCount FROM users`);
    const [[{ postCount }]] = await pool.query(`SELECT COUNT(*) AS postCount FROM posts`);
    const [[{ publicPostCount }]] = await pool.query(`SELECT COUNT(*) AS publicPostCount FROM posts WHERE is_public = TRUE`);
    const [[{ commentCount }]] = await pool.query(`SELECT COUNT(*) AS commentCount FROM comments`);

    res.json({
      userCount,
      postCount,
      publicPostCount,
      privatePostCount: postCount - publicPostCount,
      commentCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Get all posts (admin view — includes private posts and author info) ───
app.get("/api/admin/posts", async (req, res) => {
  try {
    const [posts] = await pool.query(
      `SELECT p.id, p.category, p.content, p.is_public AS isPublic, p.created_at AS createdAt,
              u.email AS authorEmail,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS commentCount
       FROM posts p
       LEFT JOIN users u ON u.id = p.author_id
       ORDER BY p.id DESC`
    );
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Get all users (admin view — includes post count and report count) ───
app.get("/api/admin/users", async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT u.id, u.email, u.nickname, u.status,
              (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.id) AS postCount,
              (SELECT COUNT(*) FROM reports r JOIN posts p ON p.id = r.post_id WHERE p.author_id = u.id) AS reportCount
       FROM users u
       ORDER BY u.id DESC`
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Suspend / restore a user account ───
app.patch("/api/admin/users/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    await pool.query(`UPDATE users SET status = ? WHERE id = ?`, [status, req.params.id]);
    res.json({ message: "User updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Delete a post (used by admin to remove reported content) ───
app.delete("/api/posts/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM posts WHERE id = ?`, [req.params.id]);
    res.json({ message: "Post deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Submit a report on a post ───
app.post("/api/reports", async (req, res) => {
  try {
    const { postId, reporterId, reason } = req.body;

    if (!postId) {
      return res.status(400).json({ message: "Missing post id." });
    }

    await pool.query(
      `INSERT INTO reports (post_id, reporter_id, reason) VALUES (?, ?, ?)`,
      [postId, reporterId || null, reason || "Not specified"]
    );

    res.status(201).json({ message: "Report submitted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Get all reports (for the admin dashboard) ───
app.get("/api/reports", async (req, res) => {
  try {
    const [reports] = await pool.query(
      `SELECT r.id, r.post_id AS postId, r.reason, r.status, r.created_at AS createdAt,
              p.content AS postContent, u.email AS reporterEmail
       FROM reports r
       LEFT JOIN posts p ON p.id = r.post_id
       LEFT JOIN users u ON u.id = r.reporter_id
       ORDER BY r.id DESC`
    );
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Update a report's status (resolve / dismiss) ───
app.patch("/api/reports/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "resolved", "dismissed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    await pool.query(`UPDATE reports SET status = ? WHERE id = ?`, [status, req.params.id]);
    res.json({ message: "Report updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Submit feedback ───
app.post("/api/feedback", async (req, res) => {
  try {
    const { authorId, content } = req.body;

    if (!content || content.trim().length < 5) {
      return res.status(400).json({ message: "Please enter at least 5 characters." });
    }

    await pool.query(
      `INSERT INTO feedback (author_id, content) VALUES (?, ?)`,
      [authorId || null, content.trim()]
    );

    res.status(201).json({ message: "Feedback submitted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Get all feedback (for the admin dashboard) ───
app.get("/api/feedback", async (req, res) => {
  try {
    const [feedback] = await pool.query(
      `SELECT f.id, f.content, f.status, f.created_at AS createdAt,
              u.email AS authorEmail
       FROM feedback f
       LEFT JOIN users u ON u.id = f.author_id
       ORDER BY f.id DESC`
    );
    res.json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Update a feedback item's status (reviewed / archived) ───
app.patch("/api/feedback/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["new", "reviewed", "archived"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }
    await pool.query(`UPDATE feedback SET status = ? WHERE id = ?`, [status, req.params.id]);
    res.json({ message: "Feedback updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Delete a feedback item ───
app.delete("/api/feedback/:id", async (req, res) => {
  try {
    await pool.query(`DELETE FROM feedback WHERE id = ?`, [req.params.id]);
    res.json({ message: "Feedback deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});