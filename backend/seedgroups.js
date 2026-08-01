// Script to load the anonymous support groups that were originally
// hardcoded in group.html into the database, so every student (and every
// device/browser) sees and can chat in the same groups.
// Run: node seed-groups.js

require("dotenv").config();
const pool = require("./db");

const CATEGORIES = [
  { slug: "academic", label: "Academic" },
  { slug: "friendship", label: "Friendship" },
  { slug: "mental-health", label: "Mental Health" },
  { slug: "international-students", label: "International Students" },
  { slug: "another", label: "Another" }
];

const GROUPS = [
  {
    categorySlug: "academic",
    name: "Exam Stress Circle",
    description: "Talk about exam pressure, deadlines and study worries.",
    icon: "📚",
    messages: [
      { nickname: "Moonlight Fox", content: "I have two assignments due this week and I feel overwhelmed." },
      { nickname: "Blue Panda", content: "You are not alone. I am dealing with the same thing." },
      { nickname: "Soft Cloud", content: "Breaking everything into smaller tasks has helped me." }
    ]
  },
  {
    categorySlug: "international-students",
    name: "Lonely Overseas Students",
    description: "Share experiences and find comfort while studying away from home.",
    icon: "🌏",
    messages: [
      { nickname: "Gentle Koala", content: "Weekends feel especially quiet when everyone I know is back home." },
      { nickname: "Sunny Otter", content: "I felt that too. Joining a campus activity helped me meet people slowly." }
    ]
  },
  {
    categorySlug: "friendship",
    name: "Making Friends Safely",
    description: "Discuss safe and meaningful ways to build new friendships.",
    icon: "🤝",
    messages: [
      { nickname: "Bright Rabbit", content: "How do you start conversations without feeling awkward?" },
      { nickname: "Kind Penguin", content: "I usually ask something simple about class or the assignment." }
    ]
  },
  {
    categorySlug: "mental-health",
    name: "Quiet Support Space",
    description: "A calm group for listening, reflecting and encouraging one another.",
    icon: "🌙",
    messages: [
      { nickname: "Quiet Star", content: "Taking short breaks helps me reset when everything feels too much." },
      { nickname: "Calm Fox", content: "Today I am trying to be patient with myself." }
    ]
  },
  {
    categorySlug: "another",
    name: "General Chat Corner",
    description: "For anything else on your mind that does not fit the other groups.",
    icon: "💬",
    messages: [
      { nickname: "Wandering Otter", content: "Feel free to drop in here for anything that does not fit elsewhere." },
      { nickname: "Paper Crane", content: "Glad this space exists for the in-between topics." }
    ]
  }
];

async function seedGroups() {
  try {
    const [[{ count }]] = await pool.query(`SELECT COUNT(*) AS count FROM groups_table`);
    if (count > 0) {
      console.log(`groups_table already has ${count} row(s). Skipping to avoid duplicates.`);
      return;
    }

    const categoryIds = {};
    for (const c of CATEGORIES) {
      const [result] = await pool.query(
        `INSERT INTO group_categories (slug, label) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE label = VALUES(label)`,
        [c.slug, c.label]
      );
      const [[row]] = await pool.query(`SELECT id FROM group_categories WHERE slug = ?`, [c.slug]);
      categoryIds[c.slug] = row.id;
    }

    for (const g of GROUPS) {
      const [result] = await pool.query(
        `INSERT INTO groups_table (category_id, name, description, icon) VALUES (?, ?, ?, ?)`,
        [categoryIds[g.categorySlug], g.name, g.description, g.icon]
      );
      const groupId = result.insertId;

      for (const m of g.messages) {
        await pool.query(
          `INSERT INTO group_messages (group_id, author_id, nickname, content) VALUES (?, NULL, ?, ?)`,
          [groupId, m.nickname, m.content]
        );
      }
    }

    console.log(`Inserted ${CATEGORIES.length} categories and ${GROUPS.length} groups.`);
  } catch (error) {
    console.error("Failed to seed groups:", error);
  } finally {
    await pool.end();
  }
}

seedGroups();