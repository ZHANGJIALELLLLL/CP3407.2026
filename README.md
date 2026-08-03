# Hello Dear — Anonymous Student Support Platform

Hello Dear is a web-based anonymous peer-support platform for university students. It lets students share concerns anonymously, support one another through comments and support groups, report harmful content, and access university support resources — while administrators moderate the platform and review feedback.

**Repository:** https://github.com/ZHANGJIALELLLLL/CP3407.2026

> Testing strategy, automated test suite, and test evidence are documented separately in [`test/test.md`](./test/test.md) and are not repeated in this page.

---

## Table of Contents

1. [Team Members](#team-members)
2. [Requirements](#1-requirements)
3. [Design](#2-design)
4. [Implementation / Delivered Solution](#3-implementation--delivered-solution)
5. [Version Control](#5-version-control)
6. [Development & Build Tools](#6-development--build-tools)
7. [Agile Software Engineering (Scrum)](#7-agile-software-engineering-scrum)
8. [Project Technical Writing](#8-project-technical-writing)
9. [How to Run](#how-to-run)
10. [Repository Structure](#repository-structure)
11. [Known Limitations & Future Improvements](#known-limitations--future-improvements)
12. [References](#references)

---

## Team Members

| Role | Student |
|------|---------|
| Product Owner, Programmer, Initial Design | Zhang Jiale |
| Database Development, Initial Design, Programmer | Park Haewon |
| Scrum Master, Overall Design, Programmer | Lu Chuanjun |

Team size: 3 (within the maximum of 4 students per team).

---

## 1. Requirements

*Rubric criterion: "All requirements (user stories) are correct and correctly estimated with justified priorities. Exemplary set of features are correctly planned for implementation in justified order and within given budget."*

### Project Goals
- Provide a safe, anonymous platform for students.
- Allow students to publish anonymous posts and comment on others'.
- Encourage peer support through community posts and anonymous support groups.
- Protect student privacy at all times.
- Allow reporting and administrator moderation of harmful content.
- Provide a directory of university support resources.
- Build a simple, user-friendly web application, deliverable within a 3-person team's realistic scope.

### Requirements Gathering
Requirements were derived from structured user interviews with six students across three programmes (Human Resource Management, Accounting, Information Technology).  Key findings that shaped requirements: anonymity was the most-requested feature across all groups, users wanted post categories, and IT students specifically flagged the need for reporting/moderation and hiding personally identifying information.

### Prioritised Product Backlog

| # | User Story | Priority | Priority Justification | Effort |
|---|---|:---:|---|:---:|
| 1 | Browse Website (Home & Navigation) | 10 | Core entry point; no other page is reachable without it | 4 days |
| 2 | View Mental Health / Support Resources | 10 | Directly supports the platform's core wellbeing mission | 4 days |
| 3 | Learn About the Platform | 20 | Builds trust and explains anonymity, but doesn't block core use | 2 days |
| 4 | Create an Anonymous Account | 10 | Prerequisite for login and posting; everything downstream depends on it | 2 days |
| 5 | User Login | 20 | Needed for account-linked features, but depends on registration | 2 days |
| 6 | Create an Anonymous Post | 10 | Core value proposition of the platform | 3 days |
| 7 | Browse Community Posts | 20 | Only meaningful once posts exist | 2 days |
| 8 | Comment on a Post | 30 | Enhances engagement; not essential to MVP | 2 days |
| 9 | Reporting Harmful Content | 10 | Critical for user safety before the platform is safe to use | 3 days |
| 10 | Create / Join Support Groups | 20 | Improves organisation, not required for core anonymous-support use case | 2 days |
| 11 | Search and Filter Posts/Resources | 20 | Improves usability at scale; platform works without it | 3 days |
| 12 | Administrator Dashboard | 30 | Depends on Reporting existing first; used by staff, not students | 3 days |
| 13 | Submit Platform Feedback | 30 | Supports continuous improvement, not core functionality | included above |

**Total backlog: 32 person-days across 3 iterations** (Iteration 1: 10, Iteration 2: 11, Iteration 3: 11). Full task breakdowns are in [`Iteration_1.md`](./Iteration_1.md), [`Iteration_2.md`](./Iteration_2.md), and [`Iteration_3.md`](./Iteration_3.md).

### Delivery Against Plan
All 32 planned person-days of backlog were marked complete across the three iterations (see the Velocity figures in [§7](#7-agile-software-engineering-scrum)). One planning change occurred during the project: **the backend was originally scoped as Java Spring Boot** in the initial [project proposal](./docs/prac%201%20project%20proposal.md), but the team migrated to **Node.js + Express** early in development for faster iteration within the team's skillset. This is the one place delivered implementation diverges from the original written plan, and it is disclosed here rather than left unreconciled.

---

## 2. Design

*Rubric criterion: "Architectural, database, user interface designs are exemplary and justified."*

Full architectural design, database design (with ER diagram), UI design, and design-decision justifications for every major component are documented in **[`design.md`](./design.md)**. That page covers:

- **Architecture** — a three-layer design (presentation / application / data), with a Mermaid architecture diagram and justification for the separation of concerns.
- **Database design** — an 11-table MySQL schema with a reverse-engineered ER diagram (MySQL Workbench) and relationship table.
- **UI design** — visual identity, responsive design approach, and accessibility considerations.
- **Component-by-component design decisions** for all 10 major components (navigation, home, registration, authentication, community posts, groups/group chat, resources, feedback, admin dashboard, backend API).

---

## 3. Implementation / Delivered Solution

*Rubric criterion: "Your IT solution delivered 'what is needed, on time and on budget' for each iteration... Exemplary UI, database and deployment choices."*

### Tech Stack (as delivered)

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | HTML5, CSS3, vanilla JavaScript | Static pages, no framework |
| Backend | Node.js + Express (^4.19.2) | REST API, validation, auth logic |
| Database | MySQL, via mysql2 (^3.10.0) | Persistent storage for users, posts, comments, reports, feedback, resources, groups, messages |
| Password security | bcrypt (^5.1.1) | Password hashing |
| Cross-origin handling | cors (^2.8.5) | Allows the separately-served frontend to call the API |
| Configuration | dotenv (^16.4.5) | Keeps DB credentials and secrets out of source code |

### Iteration-by-Iteration Delivery

| Iteration | Focus | Backlog | Status |
|---|---|:---:|---|
| Iteration 1 | Website foundation, navigation, static pages | 10 person-days | Completed |
| Iteration 2 | Core interaction features (accounts, posts, comments) connected to MySQL | 11 person-days | Completed |
| Iteration 3 | Reporting, groups, admin dashboard, search/filter, bug tracking | 11 person-days | Completed |

Iteration reflections, task boards, and burndown charts are in [`Iteration_1.md`](./Iteration_1.md), [`Iteration_2.md`](./Iteration_2.md), [`Iteration_3.md`](./Iteration_3.md).

### UI, Database and Deployment Choices
- **UI:** consistent purple-accent visual identity, card-based layouts, responsive Grid/Flexbox, reused navigation and form components across all pages (see [`design.md` §8](./design.md)).
- **Database:** relational MySQL schema chosen for referential integrity between users/posts/comments/reports/groups; connection pooling centralised in `backend/db.js` (see [`design.md` §7](./design.md)).
- **Deployment:** `[TODO — team to add: where the app is deployed/hosted, or state "run locally for demo" if not deployed, plus the reasoning for that choice]`

### Demonstration Evidence
`[TODO — team to add: deployed link and/or screenshots or a short demo GIF/video for each iteration, and a short note on client/instructor feedback received after each iteration demo]`

---

## 5. Version Control

*Rubric criterion: "Exemplary use of GitHub/git or equivalent."*

The project is version-controlled with Git and hosted on GitHub. The team's workflow:

- **Single shared `main` branch** with direct, frequent commits from all three team members throughout the project (94 commits at time of writing).
- **GitHub Issues** used for bug tracking, with a structured template ([`.github/ISSUE_TEMPLATE/bug_report.md`](./.github/ISSUE_TEMPLATE/bug_report.md)) capturing steps to reproduce, expected/actual result, severity, and linked user story — see [`test/test.md` §6](./test/test.md) for the full process and a worked example.
- Commit messages are generally task-descriptive (e.g. `connect admin and sql`, `add the group chatting page`).

**Planned improvement before final submission:** feature branches and Pull Requests are not yet part of the workflow — all commits currently go directly to `main`. Introducing at least a lightweight PR step (open a branch → PR → merge) for the remaining changes would strengthen this criterion and bring the workflow in line with standard collaborative Git practice.

`.gitignore` is currently only present under `backend/` (excluding `.env`, `node_modules/`). `[TODO — add a root-level .gitignore to exclude IDE folders such as .idea/ and any unreferenced local image exports before final submission]`

---

## 6. Development & Build Tools

*Rubric criterion: "Exemplary use of software development tools, building tools and external libraries."*

| Category | Tool | How it was used |
|---|---|---|
| Runtime | Node.js | Runs the Express backend |
| Package manager | npm | Dependency management (`backend/package.json`, `package-lock.json`) |
| Web framework | Express ^4.19.2 | REST API routing and middleware |
| Database driver | mysql2 ^3.10.0 | Node ↔ MySQL connectivity, connection pooling |
| Password hashing | bcrypt ^5.1.1 | Secure password storage |
| CORS handling | cors ^2.8.5 | Enables the static frontend to call the API cross-origin |
| Environment config | dotenv ^16.4.5 | Loads DB credentials/secrets from `.env` (never committed; see `backend/env.example`) |
| Database design/administration | MySQL Workbench | Schema creation, and reverse-engineering the live database into the ER diagram in `design.md` |
| IDE | JetBrains IDE | Primary development environment (project-level config under `.idea/`) |
| Version control | Git + GitHub | Source control; GitHub Issues + Issue templates for bug tracking |
| Seeding scripts | `seed-admin.js`, `seed-resources.js`, `seed-groups.js` | Repeatable, known-state test data for demos and manual testing |

---

## 7. Agile Software Engineering (Scrum)

*Rubric criterion: "Exemplary application of the agile iterative development as per textbook."*

The project was developed using Scrum across three iterations (sprints), with the roles above (Product Owner, Scrum Master, Development Team) and standard Scrum artifacts: product backlog, sprint backlog, burndown charts, and sprint reflections (see each `Iteration_N.md`).

### Velocity

| Iteration | Completed Work | Total Backlog | Velocity |
|---|:---:|:---:|:---:|
| Iteration 1 | 10 person-days | 32 person-days | 0.3125 |
| Iteration 2 | 11 person-days | 32 person-days | 0.3438 |
| Iteration 3 | 11 person-days | 32 person-days | 0.3438 (planned using Iteration 2 velocity; actual matched plan) |

*(These figures are taken directly from the velocity calculations shown in each `Iteration_N.md` file, so the headline number here matches the working shown there.)*

### Reflections
Each iteration document includes a "What went well" / "What could be improved" retrospective and concrete improvements carried into the next iteration (e.g. Iteration 1 → 2: connect frontend to backend/MySQL, increase unit testing; Iteration 2 → 3: continue system testing and bug tracking). SRP and DRY reviews were also performed at the end of each iteration.

---

## 8. Project Technical Writing

*Rubric criterion: "Exemplary technical writing in your project GitHub pages and project report."*

Project documentation is split across purpose-specific pages so each rubric area has a clear, single source of truth:

| Page | Covers |
|---|---|
| `README.md` (this page) | Project overview, requirements, delivery summary, tools, Scrum process |
| [`design.md`](./design.md) | Architecture, database, UI design and justification |
| [`test/test.md`](./test/test.md) | Testing strategy, traceability, bug tracking, test evidence |
| [`Iteration_1.md`](./Iteration_1.md) / [`Iteration_2.md`](./Iteration_2.md) / [`Iteration_3.md`](./Iteration_3.md) | Sprint planning, task breakdown, burndown, velocity, retrospectives |
| [`docs/prac 1 project proposal.md`](./docs/prac%201%20project%20proposal.md) | Original project proposal |
| [`docs/Prac02-User-Research-and-User-Stories.md`](./docs/Prac02-User-Research-and-User-Stories.md) | User interviews and derived requirements |
| [`backend/README.md`](./backend/README.md) | Backend setup instructions |

---

## How to Run

Full setup instructions (environment variables, database creation, seeding, starting the server) are in [`backend/README.md`](./backend/README.md).

Quick start:
```bash
git clone https://github.com/ZHANGJIALELLLLL/CP3407.2026.git
cd CP3407.2026/backend
npm install
cp env.example .env   # fill in your MySQL credentials
mysql -u root -p < db/schema.sql
npm run migrate         # adds post_likes + guarantees the group tables exist — see design.md §7.3
npm run seed-admin
npm run seed-resources
npm run seed-groups
npm start
```
The backend API runs at `http://localhost:3000`. Open the frontend pages (`index.html`, `login.html`, `signup.html`, `community.html`, `create-post.html`, `group.html`, `resources.html`, `admin.html`, `about.html`) directly in a browser — they call the API at port 3000.

---

## Repository Structure

```
CP3407.2026/
├── README.md
├── design.md
├── Iteration_1.md / Iteration_2.md / Iteration_3.md
├── index.html, login.html, signup.html, community.html,
│   create-post.html, group.html, resources.html, admin.html, about.html
├── backend/
│   ├── server.js, db.js, package.json, env.example
│   ├── seed-admin.js, seed-resources.js, seed-groups.js
│   └── db/schema.sql
├── docs/
│   ├── prac 1 project proposal.md
│   └── Prac02-User-Research-and-User-Stories.md
├── test/
│   ├── test.js
│   └── test.md
└── .github/
    └── ISSUE_TEMPLATE/bug_report.md
```

---

## Known Limitations & Future Improvements

- Real session/token-based authentication for normal users (currently login state is client-stored only; see `design.md` §6.4 and §9).
- Restrict CORS to known origins rather than allowing all.
- Feature-branch + Pull Request workflow for remaining development (see [§5](#5-version-control)).
- Mobile-responsive optimisation and further accessibility testing.
- AI-assisted content moderation.
- Email notifications and email verification.
- Database performance optimisation.

---

## References

- Scrum Guide (2020)
- Head First Software Development
- GitHub Documentation
- Node.js / Express Documentation
- MySQL Documentation
