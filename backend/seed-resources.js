// Script to load the resources originally hardcoded in resources.html
// into the database, so they show up in the admin dashboard.
// Run: node seed-resources.js

require("dotenv").config();
const pool = require("./db");

const resources = [
  {
    category: "Counselling",
    title: "Student Counselling Service",
    description: "Confidential support for personal concerns, stress, adjustment, and student well-being.",
    contactEmail: "counselling@university.edu",
    location: "Student Services Building"
  },
  {
    category: "Academic",
    title: "Academic Support Centre",
    description: "Study skills, assignment planning, academic writing, workshops, and learning support.",
    contactEmail: "academicsupport@university.edu",
    location: "University Library, Level 2"
  },
  {
    category: "Career",
    title: "Career Development Centre",
    description: "Career planning, resume feedback, interview preparation, internships, and graduate opportunities.",
    contactEmail: "careers@university.edu",
    location: "Campus Hub, Room 104"
  },
  {
    category: "International",
    title: "International Student Support",
    description: "Support for cultural adjustment, student services, language concerns, and studying away from home.",
    contactEmail: "international@university.edu",
    location: "International Student Centre"
  },
  {
    category: "Accessibility",
    title: "Accessibility Support",
    description: "Assistance with reasonable adjustments, inclusive learning, and accessibility needs.",
    contactEmail: "accessibility@university.edu",
    location: "Student Services Building"
  },
  {
    category: "Academic",
    title: "Library Learning Support",
    description: "Research assistance, referencing guidance, database access, and study-space information.",
    contactEmail: "libraryhelp@university.edu",
    location: "Main University Library"
  }
];

async function seedResources() {
  try {
    const [[{ count }]] = await pool.query(`SELECT COUNT(*) AS count FROM resources`);
    if (count > 0) {
      console.log(`resources table already has ${count} row(s). Skipping to avoid duplicates.`);
      return;
    }

    for (const r of resources) {
      await pool.query(
        `INSERT INTO resources (category, title, description, contact_email, location) VALUES (?, ?, ?, ?, ?)`,
        [r.category, r.title, r.description, r.contactEmail, r.location]
      );
    }

    console.log(`Inserted ${resources.length} resources.`);
  } catch (error) {
    console.error("Failed to seed resources:", error);
  } finally {
    await pool.end();
  }
}

seedResources();
