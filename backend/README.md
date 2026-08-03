# Hello Dear Backend (Node.js + Express + MySQL)

Backend server that connects to the frontend (login.html, community.html, group.html, admin.html, etc). For the full project overview, architecture, testing, and rubric-mapped documentation, see the [root README](../README.md).

## 1. Requirements
- Node.js installed (https://nodejs.org)
- MySQL (or MariaDB) installed and running

## 2. Install

```bash
cd backend
npm install
```

## 3. Environment variables

Copy `env.example` to `.env` and fill in your own values.

```bash
cp env.example .env
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
ADMIN_TOKEN_SECRET=replace-with-a-long-random-value
FRONTEND_ORIGIN=http://127.0.0.1:5500,http://localhost:5500
```

## 4. Create and migrate the database

```bash
mysql -u root -p < db/schema.sql
npm run migrate
```

`schema.sql` creates the core tables (`users`, `admins`, `posts`, `comments`, `reports`, `feedback`, `resources`, `settings`). `npm run migrate` then adds `post_likes` and the group-chat tables (`group_categories`, `groups_table`, `group_messages`) — see `design.md` §7.3 for why this is a separate step.

## 5. Seed initial data

```bash
npm run seed-admin       # creates the admin account from INITIAL_ADMIN_ID / INITIAL_ADMIN_PASSWORD (bcrypt-hashed)
npm run seed-resources   # sample support-resource entries
npm run seed-groups      # the 4 approved group categories (academic, friendship, mental-health, another)
```

## 6. Start the server

```bash
npm start
```

The server runs at `http://localhost:3000`.

## 7. Run the tests

```bash
cd ../test
node unit.test.js                                    # 19 unit tests, no server/DB needed
ADMIN_ID=admin ADMIN_PASSWORD='Admin123!' node test.js  # 36 system tests, server from step 6 must be running
```

See `test/test.md` for the full testing strategy and traceability.

## 8. API surface

The full route list lives in `server.js`; the major groups are:

| Area | Example routes |
|---|---|
| Auth | `POST /api/signup`, `POST /api/login`, `POST /api/admin/login` |
| Posts & comments | `GET/POST /api/posts`, `POST /api/posts/:id/comments`, `POST /api/posts/:id/likes` |
| Reports | `POST /api/reports`, `GET/PATCH /api/reports/:id` (admin) |
| Resources | `GET /api/resources`, `POST/PUT/DELETE /api/resources` (admin) |
| Feedback | `POST /api/feedback`, `GET/PATCH/DELETE /api/feedback` (admin) |
| Groups & chat | `GET/POST /api/groups`, `GET/POST /api/groups/:id/messages`, `GET /api/admin/groups/:id/messages` (admin) |
| Admin | `GET /api/admin/stats`, `PATCH /api/admin/users/:id`, `GET/PUT /api/settings` |

Routes marked "(admin)" require `Authorization: Bearer <token>` from `POST /api/admin/login`.

## Note
This is a coursework implementation. A production deployment would also need HTTPS, real session/token-based auth for normal users (see `design.md` §9), and a CORS policy restricted to known origins rather than allowing all.
