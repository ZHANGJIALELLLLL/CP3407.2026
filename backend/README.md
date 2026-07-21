# Hello Dear Backend (Node.js + Express + MySQL)

Backend server that connects to the frontend (login.html, etc).

## 1. Requirements
- Node.js installed (https://nodejs.org)
- MySQL installed and running

## 2. Install

```bash
cd backend
npm install
```

## 3. Environment variables

Copy `.env.example` to `.env` and fill in your own MySQL info.

```bash
cp .env.example .env
```

Example `.env` content:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hello_dear
PORT=3000
INITIAL_ADMIN_ID=admin
INITIAL_ADMIN_PASSWORD=Admin123!
```

## 4. Create the database

Connect to MySQL and run the schema.

```bash
mysql -u root -p < db/schema.sql
```

This creates the `hello_dear` database and the `users`, `admins`, `posts`, and `comments` tables.

## 5. Create the admin account

```bash
npm run seed-admin
```

This creates an admin account using `INITIAL_ADMIN_ID` / `INITIAL_ADMIN_PASSWORD`
from `.env`, with the password **hashed (bcrypt)** before being stored in the
`admins` table. (The password is never stored as plain text.)

## 6. Start the server

```bash
npm start
```

The server runs at `http://localhost:3000`.

## 7. API endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/signup | Sign up (email, password, nickname) |
| POST | /api/login | User login (email, password) |
| POST | /api/admin/login | Admin login (adminId, password) |

## 8. Frontend connection

`login.html` is already configured to call `http://localhost:3000/api/login`
and `http://localhost:3000/api/admin/login`. With the server running, opening
`login.html` in a browser will work immediately.

## Note
- This is a minimal implementation for learning/coursework purposes. A real
  production deployment would also need HTTPS, session/token-based auth,
  and a proper CORS policy.
