require("dotenv").config();
const mysql = require("mysql2/promise");

// 커넥션 풀 생성 (매번 새로 연결하지 않고 재사용)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
