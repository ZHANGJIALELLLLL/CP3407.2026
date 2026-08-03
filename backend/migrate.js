// Creates database objects added by later fixes that the original schema
// didn't have yet:
//   - post_likes: backs persisted "helpful" likes on community posts.
//   - group_categories / groups_table / group_messages: back the group
//     chat feature (group.html). These are already in schema.sql, but a
//     database created before group.html existed may not have them yet.
//
// Safe to run multiple times — every statement is idempotent.
// Run: npm run migrate

require("dotenv").config();
const pool = require("./db");

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        post_id INT NOT NULL,
        liker_id VARCHAR(64) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (post_id, liker_id),
        CONSTRAINT fk_post_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      )
    `);
    console.log("post_likes table is ready.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS group_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(60) NOT NULL UNIQUE,
        label VARCHAR(60) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("group_categories table is ready.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS groups_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(120) NOT NULL,
        description VARCHAR(200),
        icon VARCHAR(10) DEFAULT '💬',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES group_categories(id) ON DELETE CASCADE
      )
    `);
    console.log("groups_table table is ready.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS group_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        author_id INT,
        nickname VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES groups_table(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log("group_messages table is ready.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();