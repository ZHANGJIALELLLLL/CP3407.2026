require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────
// Admin auth: lightweight signed tokens (no extra dependency required).
// The admin dashboard previously had no server-side auth at all — every
// /api/admin/* route (and other moderation/write routes) could be called by
// anyone who knew the URL. This issues a signed, expiring token on
// successful admin login and requires it on every admin/moderation route.
// ─────────────────────────────────────────────────────────────────────────
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || "dev-only-insecure-secret-change-me";
if (!process.env.ADMIN_TOKEN_SECRET) {
  console.warn(
    "WARNING: ADMIN_TOKEN_SECRET is not set in .env — using an insecure default. " +
      "Set ADMIN_TOKEN_SECRET to a long random value before deploying."
  );
}
const ADMIN_TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function base64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(input) {
  let normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4) normalized += "=";
  return Buffer.from(normalized, "base64").toString("utf8");
}

function signAdminToken(adminId) {
  const payload = JSON.stringify({ adminId, exp: Date.now() + ADMIN_TOKEN_TTL_MS });
  const payloadPart = base64url(payload);
  const signature = crypto.createHmac("sha256", ADMIN_TOKEN_SECRET).update(payloadPart).digest("hex");
  return `${payloadPart}.${signature}`;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return null;

  const expectedSignature = crypto.createHmac("sha256", ADMIN_TOKEN_SECRET).update(payloadPart).digest("hex");
  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64urlDecode(payloadPart));
    if (!payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Admin session missing or expired. Please log in again." });
  }
  req.admin = payload;
  next();
}

// ─────────────────────────────────────────────────────────────────────────
// Platform settings: previously saved to the DB but never read anywhere.
// getSettings() is now used to actually enforce them at the relevant routes.
// ─────────────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  profanityFilter: true,
  userReporting: true,
  commentReplies: true,
  requireUniversityEmail: true,
  allowGuestBrowsing: true,
  allowAnonymousPosting: true
};

async function getSettings() {
  const [rows] = await pool.query(`SELECT setting_key AS \`key\`, setting_value AS value FROM settings`);
  const settings = { ...DEFAULT_SETTINGS };
  rows.forEach((r) => {
    settings[r.key] = !!r.value;
  });
  return settings;
}

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "live.com",
  "protonmail.com",
  "naver.com",
  "qq.com",
  "163.com",
  "mail.com"
]);

function isUniversityEmail(email) {
  const domain = (email.split("@")[1] || "").toLowerCase();
  return Boolean(domain) && !FREE_EMAIL_DOMAINS.has(domain);
}

// Small, generic word-list filter. Not exhaustive — good enough to back the
// "Profanity filtering" admin toggle, which previously did nothing at all.
const BLOCKED_WORDS = ["fuck", "shit", "bitch", "asshole", "bastard", "cunt", "dick", "slut", "whore", "faggot", "nigger"];

function containsProfanity(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some((word) => new RegExp(`\\b${word}\\b`, "i").test(lower));
}

// ─────────────────────────────────────────────────────────────────────────
// Post likes: previously the "like" button on community.html was purely
// client-side and never persisted. These helpers query a post_likes table
// created by `npm run migrate`. If that hasn't been run yet, we degrade
// gracefully instead of breaking the whole feed.
// ─────────────────────────────────────────────────────────────────────────
let postLikesTableAvailable = true;

async function safeLikeQuery(queryFn, fallback) {
  if (!postLikesTableAvailable) return fallback;
  try {
    return await queryFn();
  } catch (error) {
    if (error && error.code === "ER_NO_SUCH_TABLE") {
      postLikesTableAvailable = false;
      console.warn("post_likes table not found — run `npm run migrate` to enable persisted likes. Likes are disabled until then.");
      return fallback;
    }
    throw error;
  }
}

// ─── Sign up ───
app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter your email and password." });
    }

    const settings = await getSettings();
    if (settings.requireUniversityEmail && !isUniversityEmail(email)) {
      return res.status(400).json({
        message: "Please sign up using your university email address. Personal webmail addresses (Gmail, Yahoo, etc.) are not accepted."
      });
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

    const token = signAdminToken(admin.admin_id);
    res.json({ message: "Admin login successful", token, expiresInMs: ADMIN_TOKEN_TTL_MS });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Get posts (public posts + the current user's own private posts) ───
app.get("/api/posts", async (req, res) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : null;
    const viewerId = req.query.viewerId ? String(req.query.viewerId) : null;

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

    const likeCounts = await safeLikeQuery(
      async () =>
        (await pool.query(
          `SELECT post_id AS postId, COUNT(*) AS likeCount FROM post_likes WHERE post_id IN (?) GROUP BY post_id`,
          [postIds]
        ))[0],
      []
    );

    let likedPostIds = new Set();
    if (viewerId) {
      const likedRows = await safeLikeQuery(
        async () =>
          (await pool.query(`SELECT post_id AS postId FROM post_likes WHERE post_id IN (?) AND liker_id = ?`, [
            postIds,
            viewerId
          ]))[0],
        []
      );
      likedPostIds = new Set(likedRows.map((r) => r.postId));
    }

    const commentsByPost = {};
    for (const c of comments) {
      if (!commentsByPost[c.postId]) commentsByPost[c.postId] = [];
      commentsByPost[c.postId].push(c.content);
    }

    const likeCountByPost = {};
    for (const l of likeCounts) likeCountByPost[l.postId] = l.likeCount;

    const result = posts.map((p) => ({
      ...p,
      isPublic: !!p.isPublic,
      comments: commentsByPost[p.id] || [],
      likeCount: likeCountByPost[p.id] || 0,
      likedByMe: likedPostIds.has(p.id)
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

    const settings = await getSettings();
    if (!settings.allowAnonymousPosting) {
      return res.status(403).json({ message: "Posting has been temporarily disabled by an administrator." });
    }
    if (settings.profanityFilter && containsProfanity(content)) {
      return res.status(400).json({ message: "Your post contains language that isn't allowed here. Please revise it." });
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
      comments: [],
      likeCount: 0,
      likedByMe: false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Like / unlike a post ───
app.post("/api/posts/:id/like", async (req, res) => {
  try {
    const { likerId } = req.body;
    if (!likerId) {
      return res.status(400).json({ message: "Missing liker id." });
    }
    await pool.query(`INSERT IGNORE INTO post_likes (post_id, liker_id) VALUES (?, ?)`, [
      req.params.id,
      String(likerId)
    ]);
    const [[{ likeCount }]] = await pool.query(`SELECT COUNT(*) AS likeCount FROM post_likes WHERE post_id = ?`, [
      req.params.id
    ]);
    res.json({ likeCount, liked: true });
  } catch (error) {
    if (error && error.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({ message: "Likes aren't set up on this server yet. Run `npm run migrate`." });
    }
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

app.delete("/api/posts/:id/like", async (req, res) => {
  try {
    const likerId = req.query.likerId;
    if (!likerId) {
      return res.status(400).json({ message: "Missing liker id." });
    }
    await pool.query(`DELETE FROM post_likes WHERE post_id = ? AND liker_id = ?`, [req.params.id, String(likerId)]);
    const [[{ likeCount }]] = await pool.query(`SELECT COUNT(*) AS likeCount FROM post_likes WHERE post_id = ?`, [
      req.params.id
    ]);
    res.json({ likeCount, liked: false });
  } catch (error) {
    if (error && error.code === "ER_NO_SUCH_TABLE") {
      return res.status(503).json({ message: "Likes aren't set up on this server yet. Run `npm run migrate`." });
    }
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

    const settings = await getSettings();
    if (!settings.commentReplies) {
      return res.status(403).json({ message: "Comments have been temporarily disabled by an administrator." });
    }
    if (settings.profanityFilter && containsProfanity(content)) {
      return res.status(400).json({ message: "Your comment contains language that isn't allowed here. Please revise it." });
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
app.get("/api/admin/stats", requireAdmin, async (req, res) => {
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

// ─── Resources: list all (public) ───
app.get("/api/resources", async (req, res) => {
  try {
    const [resources] = await pool.query(`SELECT * FROM resources ORDER BY id DESC`);
    res.json(resources);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Resources: create (admin only) ───
app.post("/api/resources", requireAdmin, async (req, res) => {
  try {
    const { category, title, description, contactEmail, location } = req.body;
    if (!category || !title) {
      return res.status(400).json({ message: "Category and title are required." });
    }
    const [result] = await pool.query(
      `INSERT INTO resources (category, title, description, contact_email, location) VALUES (?, ?, ?, ?, ?)`,
      [category, title, description || null, contactEmail || null, location || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Resources: update (admin only) ───
app.put("/api/resources/:id", requireAdmin, async (req, res) => {
  try {
    const { category, title, description, contactEmail, location } = req.body;
    await pool.query(
      `UPDATE resources SET category = ?, title = ?, description = ?, contact_email = ?, location = ? WHERE id = ?`,
      [category, title, description || null, contactEmail || null, location || null, req.params.id]
    );
    res.json({ message: "Resource updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Resources: delete (admin only) ───
app.delete("/api/resources/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query(`DELETE FROM resources WHERE id = ?`, [req.params.id]);
    res.json({ message: "Resource deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Settings: get all (with sensible defaults). Public/read-only so pages
// like community.html can honor "Allow guest browsing" without needing an
// admin session — only *writing* settings requires admin auth. ───
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Settings: save all (admin only) ───
app.put("/api/settings", requireAdmin, async (req, res) => {
  try {
    const entries = Object.entries(req.body);
    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, !!value]
      );
    }
    res.json({ message: "Settings saved." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Get all posts (admin view — includes private posts and author info) ───
app.get("/api/admin/posts", requireAdmin, async (req, res) => {
  try {
    const [posts] = await pool.query(
      `SELECT p.id, p.category, p.content, p.is_public AS isPublic, p.created_at AS createdAt,
              u.email AS authorEmail,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS commentCount
       FROM posts p
       LEFT JOIN users u ON u.id = p.author_id
       ORDER BY p.id DESC`
    );

    const postIds = posts.map((p) => p.id);
    let likeCountByPost = {};
    if (postIds.length > 0) {
      const likeCounts = await safeLikeQuery(
        async () =>
          (await pool.query(
            `SELECT post_id AS postId, COUNT(*) AS likeCount FROM post_likes WHERE post_id IN (?) GROUP BY post_id`,
            [postIds]
          ))[0],
        []
      );
      likeCountByPost = Object.fromEntries(likeCounts.map((l) => [l.postId, l.likeCount]));
    }

    res.json(posts.map((p) => ({ ...p, likeCount: likeCountByPost[p.id] || 0 })));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Get all users (admin view — includes post count and report count) ───
app.get("/api/admin/users", requireAdmin, async (req, res) => {
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

// ─── Suspend / restore a user account (admin only) ───
app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
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

// ─── Delete a post (admin only — used to remove reported content) ───
app.delete("/api/posts/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query(`DELETE FROM posts WHERE id = ?`, [req.params.id]);
    res.json({ message: "Post deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Submit a report on a post (public — anyone can report) ───
app.post("/api/reports", async (req, res) => {
  try {
    const { postId, reporterId, reason } = req.body;

    if (!postId) {
      return res.status(400).json({ message: "Missing post id." });
    }

    const settings = await getSettings();
    if (!settings.userReporting) {
      return res.status(403).json({ message: "Reporting has been temporarily disabled by an administrator." });
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

// ─── Get all reports (admin only) ───
app.get("/api/reports", requireAdmin, async (req, res) => {
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

// ─── Update a report's status (admin only) ───
app.patch("/api/reports/:id", requireAdmin, async (req, res) => {
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

// ─── Submit feedback (public) ───
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

// ─── Get all feedback (admin only) ───
app.get("/api/feedback", requireAdmin, async (req, res) => {
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

// ─── Update a feedback item's status (admin only) ───
app.patch("/api/feedback/:id", requireAdmin, async (req, res) => {
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

// ─── Delete a feedback item (admin only) ───
app.delete("/api/feedback/:id", requireAdmin, async (req, res) => {
  try {
    await pool.query(`DELETE FROM feedback WHERE id = ?`, [req.params.id]);
    res.json({ message: "Feedback deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Groups: list categories ───
app.get("/api/group-categories", async (req, res) => {
  try {
    const [categories] = await pool.query(
      `SELECT id, slug, label FROM group_categories ORDER BY id ASC`
    );
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

function slugify(value) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `category-${Date.now()}`
  );
}

// ─── Groups: create a category ───
app.post("/api/group-categories", async (req, res) => {
  try {
    const { label } = req.body;
    if (!label || label.trim().length < 3) {
      return res.status(400).json({ message: "Please enter a category name with at least 3 characters." });
    }

    const slug = slugify(label);

    const [existing] = await pool.query(
      `SELECT id FROM group_categories WHERE slug = ? OR label = ?`,
      [slug, label.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "This category already exists." });
    }

    const [result] = await pool.query(
      `INSERT INTO group_categories (slug, label) VALUES (?, ?)`,
      [slug, label.trim()]
    );

    res.status(201).json({ id: result.insertId, slug, label: label.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Groups: list all groups (with category info + activity counts) ───
app.get("/api/groups", async (req, res) => {
  try {
    const [groups] = await pool.query(
      `SELECT g.id, g.name, g.description, g.icon, g.created_at AS createdAt,
              c.slug AS categorySlug, c.label AS categoryLabel,
              (SELECT COUNT(*) FROM group_messages m WHERE m.group_id = g.id) AS messageCount,
              (SELECT COUNT(DISTINCT m.author_id) FROM group_messages m WHERE m.group_id = g.id AND m.author_id IS NOT NULL) AS participantCount
       FROM groups_table g
       JOIN group_categories c ON c.id = g.category_id
       ORDER BY g.id ASC`
    );
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Groups: create a group inside a category ───
app.post("/api/groups", async (req, res) => {
  try {
    const { categorySlug, name, description, icon } = req.body;
    if (!categorySlug || !name) {
      return res.status(400).json({ message: "Category and group name are required." });
    }

    let [[category]] = await pool.query(
      `SELECT id FROM group_categories WHERE slug = ?`,
      [categorySlug]
    );

    // If the category doesn't exist yet (e.g. a category the frontend
    // offers that hasn't been seeded), create it automatically instead
    // of failing — the label is derived from the slug.
    if (!category) {
      const autoLabel = categorySlug
        .split("-")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      const [insertResult] = await pool.query(
        `INSERT INTO group_categories (slug, label) VALUES (?, ?)`,
        [categorySlug, autoLabel || categorySlug]
      );
      category = { id: insertResult.insertId };
    }

    const [result] = await pool.query(
      `INSERT INTO groups_table (category_id, name, description, icon) VALUES (?, ?, ?, ?)`,
      [category.id, name, description || null, icon || "💬"]
    );

    res.status(201).json({ id: result.insertId, name, description: description || null, icon: icon || "💬", categorySlug });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Groups: get messages for a group ───
// Deliberately does NOT include which real account sent each message —
// group chat is anonymous to other students, so the public endpoint only
// ever returns the nickname. See /api/admin/groups/:id/messages below for
// the admin-only version that resolves nickname -> real account.
app.get("/api/groups/:id/messages", async (req, res) => {
  try {
    const [messages] = await pool.query(
      `SELECT id, author_id AS authorId, nickname, content, created_at AS createdAt
       FROM group_messages
       WHERE group_id = ?
       ORDER BY id ASC`,
      [req.params.id]
    );
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Groups: get messages for a group, WITH the real account behind each
// nickname (admin only). Members stay anonymous to each other, but admins
// need to be able to trace abuse/harassment back to an account. ───
app.get("/api/admin/groups/:id/messages", requireAdmin, async (req, res) => {
  try {
    const [messages] = await pool.query(
      `SELECT m.id, m.author_id AS authorId, m.nickname, m.content, m.created_at AS createdAt,
              u.email AS authorEmail
       FROM group_messages m
       LEFT JOIN users u ON u.id = m.author_id
       WHERE m.group_id = ?
       ORDER BY m.id ASC`,
      [req.params.id]
    );
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Groups: post a message to a group ───
app.post("/api/groups/:id/messages", async (req, res) => {
  try {
    const { authorId, nickname, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Please write a message before sending." });
    }

    const settings = await getSettings();
    if (settings.profanityFilter && containsProfanity(content)) {
      return res.status(400).json({ message: "Your message contains language that isn't allowed here. Please revise it." });
    }

    const [result] = await pool.query(
      `INSERT INTO group_messages (group_id, author_id, nickname, content) VALUES (?, ?, ?, ?)`,
      [req.params.id, authorId || null, nickname || "Anonymous Student", content.trim()]
    );

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Groups: delete a single message (admin moderation) ───
app.delete("/api/groups/:id/messages/:messageId", requireAdmin, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM group_messages WHERE id = ? AND group_id = ?`,
      [req.params.messageId, req.params.id]
    );
    res.json({ message: "Message deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

// ─── Groups: delete an entire group and its messages (admin only) ───
app.delete("/api/groups/:id", requireAdmin, async (req, res) => {
  try {
    // group_messages has ON DELETE CASCADE on group_id, so this also
    // removes every message that belonged to the group.
    const [result] = await pool.query(`DELETE FROM groups_table WHERE id = ?`, [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Group not found." });
    }
    res.json({ message: "Group deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "A server error occurred." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});