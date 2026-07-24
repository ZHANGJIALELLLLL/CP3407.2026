-- Hello Dear database schema
-- How to run: mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS hello_dear
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hello_dear;

-- Regular users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin table (kept separate from users)
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author_id INT NOT NULL,
  title VARCHAR(200),
  category VARCHAR(50),
  content TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  author_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Reports table (users reporting a post)
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  reporter_id INT,
  reason VARCHAR(255),
  status ENUM('pending', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Feedback table (suggestions submitted via the feedback form)
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author_id INT,
  content TEXT NOT NULL,
  status ENUM('new', 'reviewed', 'archived') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Support resources shown on the Resources page / managed by admins
CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(300),
  contact_email VARCHAR(190),
  location VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform settings (simple key/value toggles managed from the admin dashboard)
CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  setting_value BOOLEAN NOT NULL DEFAULT TRUE
);