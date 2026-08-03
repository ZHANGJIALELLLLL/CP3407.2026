// Seeds the fixed set of approved group categories used by group.html.
// package.json already referenced "npm run seed-groups" for this, but the
// script file itself was missing from the repository — `npm run migrate`
// creates the group_categories TABLE, this script fills it with the rows
// the frontend's hard-coded category dropdown (group.html) expects.
// Run: node seed-groups.js

require("dotenv").config();
const pool = require("./db");

// Must match the <option value="..."> list and the client-side `categories`
// array in group.html exactly, or newly created groups will "auto-create"
// a duplicate, differently-worded category instead of using these.
const categories = [
  { slug: "academic", label: "Academic" },
  { slug: "friendship", label: "Friendship" },
  { slug: "mental-health", label: "Mental Health" },
  { slug: "another", label: "Another" }
];

async function seedGroupCategories() {
  try {
    for (const c of categories) {
      await pool.query(
        `INSERT INTO group_categories (slug, label) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE label = VALUES(label)`,
        [c.slug, c.label]
      );
    }
    console.log(`group_categories seeded/updated (${categories.length} categories).`);
  } catch (error) {
    console.error("Failed to seed group categories:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seedGroupCategories();