// 최초 관리자 계정을 데이터베이스에 만드는 스크립트
// 실행: npm run seed-admin
// (비밀번호를 평문으로 저장하지 않고 bcrypt로 해시해서 저장합니다)

require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("./db");

async function seedAdmin() {
  const adminId = process.env.INITIAL_ADMIN_ID;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (!adminId || !adminPassword) {
    console.error("INITIAL_ADMIN_ID / INITIAL_ADMIN_PASSWORD 가 .env에 설정되어 있어야 합니다.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  try {
    await pool.query(
      `INSERT INTO admins (admin_id, password_hash)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [adminId, passwordHash]
    );
    console.log(`관리자 계정(${adminId})이 생성/갱신되었습니다.`);
  } catch (error) {
    console.error("관리자 계정 생성 실패:", error);
  } finally {
    await pool.end();
  }
}

seedAdmin();
