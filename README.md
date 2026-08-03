# Hello Dear — Anonymous Student Support Platform

Hello Dear is a web-based anonymous community support and communication platform for university students, allowing students to safely share concerns, communicate with peers, and access university support resources. Built with Node.js, Express and MySQL, and developed using Scrum across three iterations.

**Repository:** https://github.com/ZHANGJIALELLLLL/CP3407.2026

For a full feature overview, see the [Software Introduction](./SOFTWARE_INTRODUCTION.md) page.

## Team Members
| Role | Student |
|------|---------|
| Product Owner, Programmer, Initial Design | Zhang Jiale |
| Database Development, Initial Design, Programmer | Park Haewon |
| Scrum Master, Overall Design, Programmer | Lu Chuanjun |

Team size: 3 (within the maximum of 4 students per team as required).

## Project Goals
- Provide a safe, anonymous platform for students.
- Allow students to publish anonymous posts.
- Encourage peer support through comments and group chats.
- Protect student privacy.
- Allow reporting of harmful content.
- Provide university support resources.
- Build a simple and user-friendly web application.

## Main Features
- Anonymous registration and login
- Anonymous posting, community browsing, and comments
- Support group creation and anonymous group chat
- Search and filter posts/resources
- Reporting system for harmful content
- Mental health / support resource directory
- Administrator dashboard

## Development Process
Developed using Scrum across three iterations.

| Iteration | Main Focus | Status |
|-----------|------------|--------|
| Iteration 1 | Website foundation and navigation | Completed |
| Iteration 2 | Core functionality and Test-Driven Development | Completed |
| Iteration 3 | Final features, bug tracking and system testing | Completed |

### Velocity Summary
| Iteration | Velocity |
|-----------|---------:|
| Iteration 1 | 0.3333 |
| Iteration 2 | 0.3667 |
| Iteration 3 | Planned using Iteration 2 velocity |

## Tech Stack
| Layer | Technology / Tool | Purpose |
|---|---|---|
| Frontend | HTML / CSS / JavaScript | Client-side UI rendering (static pages, no framework) |
| Backend | Node.js + Express (^4.19.2) | Web framework for server-side routing and API logic |
| Database | MySQL, via mysql2 (^3.10.0) | Stores users, posts, comments, reports, feedback, resources, groups, and messages |
| Password security | bcrypt (^5.1.1) | Password hashing before storing in the database |
| Cross-origin handling | cors (^2.8.5) | Allows the separately-served frontend to call the backend API (restricted to known origins — see `docs/Design.md` §9) |
| Environment config | dotenv (^16.4.5) | Manages environment variables (DB credentials, admin token secret, etc.) |
| Authentication (user) | No server-side session/token yet — login returns `{id, email, nickname}`, stored client-side | Login-state display only; see `docs/Design.md` §9 for this known limitation |
| Authentication (admin) | Custom HMAC-SHA256 signed token (Node built-in `crypto`, 8h expiry, `Authorization: Bearer` header, `requireAdmin` middleware) | Protects admin-only API routes |
| Version control | Git + GitHub | Source control and team collaboration |
| Development tools | GitHub Issues, Labels, Pull Requests, Project Board | Task tracking and code review (see `docs/Tools.md`) |

## Testing
Testing activities included unit, functional, boundary, negative, automated, mock-object, and system testing. **15 automated tests** were implemented during Iteration 2 (Test-Driven Development). Iteration 3 continued system testing and bug tracking via GitHub Issues.


## How to Run
Full setup instructions (environment variables, database creation, seeding, starting the server) are in [`backend/README.md`](./backend/README.md).

Quick start:
```bash
git clone https://github.com/ZHANGJIALELLLLL/CP3407.2026.git
cd CP3407.2026/backend
npm install
cp env.example .env   # then fill in your MySQL credentials
mysql -u root -p < db/schema.sql
npm run seed-admin
npm start
```
The backend API runs at `http://localhost:3000`. Open the frontend pages (`index.html`, `login.html`, `signup.html`, `community.html`, `create-post.html`, `group.html`, `resources.html`, `admin.html`, `about.html`) directly in a browser — they call the API at port 3000.

## UML / Design Evidence
Class Diagram and Sequence Diagram were developed during Iteration 1 and updated throughout development; Architecture, ERD, and Interface Prototype diagrams are in [`docs/Design.md`](./docs/Design.md).


## Future Improvements
- Real session/token-based authentication for normal users
- Mobile-responsive optimisation
- AI-assisted content moderation
- Email notifications
- Database optimisation and performance improvements

## References
- Scrum Guide (2020)
- Head First Software Development
- GitHub Documentation
- Node.js / Express Documentation
- MySQL Documentation
