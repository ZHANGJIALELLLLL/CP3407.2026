# Hello Dear — System Testing Plan

**Project:** Hello Dear (anonymous peer-support platform for university students)
**Prepared for:** Week 10 Demo
**Stack under test:** Node.js / Express backend (`server.js`) + MySQL (`schema.sql`) + static HTML/CSS/JS frontend (`index.html`, `signup.html`, `login.html`, `community.html`, `create-post.html`, `resources.html`, `about.html`, `admin.html`)

---

## 1. Purpose and Scope

This document defines how the team plans, executes, and tracks system-level testing of Hello Dear before the Week 10 demo. "System testing" here means testing the application as a whole, end-to-end, through its real interfaces (HTTP API and browser UI) — not unit tests of isolated functions.

**In scope**

- All REST endpoints exposed by `server.js` (signup, login, admin login, posts, comments, reports, resources, settings, feedback, admin dashboards).
- The user-facing flows on every page: `index.html`, `signup.html`, `login.html`, `community.html`, `create-post.html`, `resources.html`, `about.html`.
- The admin flows on `admin.html`.
- Cross-page consistency (e.g. logged-in state must be reflected identically in the nav bar on every page — this was itself a bug found during earlier testing, see §6).

**Out of scope**

- Load/performance testing.
- Penetration testing beyond basic input-validation checks.
- Browser-compatibility matrix testing (tested on latest Chrome only for the demo).

---

## 2. Test Environment

| Item        | Value                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| Backend     | `node server.js` (Express, port 3000, `.env` configured per `db.js`)                                 |
| Database    | MySQL, schema loaded from `schema.sql`, seeded via `seed-admin.js` and `seed-resources.js`           |
| Frontend    | Static HTML files served directly / via local server, calling `http://localhost:3000`                |
| Browser     | Latest Chrome (desktop), manual pass also on latest Firefox and mobile viewport (DevTools emulation) |
| Test runner | `node test.js` (API-level automated tests, Node ≥ 18 for built-in `fetch`)                           |
| Bug tracker | GitHub Issues + GitHub Projects board (see §6)                                                       |

**Preconditions before any test run**

1. Fresh or known-state database (re-run `schema.sql`, then `npm run seed-admin`, then `npm run seed-resources`).
2. `npm start` running with no errors in the console.
3. `.env` contains valid `INITIAL_ADMIN_ID` / `INITIAL_ADMIN_PASSWORD` and DB credentials.

**Repository structure**

Testing code is kept out of the production codebase, in its own directory, so the app can be deployed without shipping test artifacts and so it is obvious at a glance what is "the product" vs. "how we verified the product":

```
hello-dear/
├── server.js            # production backend
├── db.js
├── seed-admin.js
├── seed-resources.js
├── schema.sql
├── package.json
├── index.html            # production frontend
├── login.html
├── signup.html
├── community.html
├── create-post.html
├── resources.html
├── about.html
├── admin.html
└── test/                 # <- all testing code lives here, nowhere else
    ├── test.js            # automated system/API tests
    └── test.md            # this document
```

Nothing under `test/` is required at runtime for the live app — it is only ever invoked manually (or by CI) against a running instance of the app, and can be excluded from any production build/deploy step.

---

## 3. Test Strategy

Two layers, both required before sign-off on a feature:

1. **Automated API tests** (`test.js`) — fast, repeatable, run before every demo rehearsal and before merging any PR that touches `server.js`. Covers the "happy path" plus key negative cases (duplicate signup, wrong password, missing fields) for every endpoint.
2. **Manual exploratory/UI tests** (checklist in §5) — covers things the API script cannot see: rendering, nav-bar state, modals, responsive layout, form validation messages, accessibility basics. Performed by a teammate who did **not** write the feature, to catch assumptions the author might not question.

**Entry criteria:** feature's PR is open against `main`/`dev` and the branch builds/starts without errors.
**Exit criteria:** all automated tests in `test.js` pass, all manual checklist items for that feature pass or have a linked, triaged GitHub Issue.

---

## 4. Traceability: User Stories → Test Cases

| ID    | User story                                                                                         | Automated (test.js) | Manual (checklist §5)      |
| ----- | -------------------------------------------------------------------------------------------------- | ------------------- | -------------------------- |
| US-01 | As a student, I can sign up with an email, nickname and password.                                  | TC-01, TC-02        | M-01                       |
| US-02 | As a student, I can log in with my email/password.                                                 | TC-03, TC-04        | M-02                       |
| US-03 | As an admin, I can log in with a separate admin ID/password.                                       | TC-05, TC-06        | M-03                       |
| US-04 | As a suspended user, I cannot log in.                                                              | TC-07               | —                          |
| US-05 | As a student, I can create a post (public or private) while logged in.                             | TC-08, TC-09        | M-04                       |
| US-06 | As a visitor, I cannot create a post while logged out.                                             | TC-10               | M-04                       |
| US-07 | As a student, I can browse public posts; private posts are only visible to their author.           | TC-11, TC-12        | M-05                       |
| US-08 | As a student, I can comment on a post.                                                             | TC-13               | M-06                       |
| US-09 | As a student, I can report a post.                                                                 | TC-14               | M-07                       |
| US-10 | As a student/visitor, I can browse the resources directory.                                        | TC-15               | M-08                       |
| US-11 | As a visitor, I can submit platform feedback.                                                      | TC-16               | M-09                       |
| US-12 | As an admin, I can view live dashboard stats.                                                      | TC-17               | M-10                       |
| US-13 | As an admin, I can view/resolve/dismiss reports and remove reported content.                       | TC-18, TC-19        | M-11                       |
| US-14 | As an admin, I can suspend/restore a user.                                                         | TC-20               | M-12                       |
| US-15 | As an admin, I can add/edit/delete a resource.                                                     | TC-21, TC-22, TC-23 | M-13                       |
| US-16 | As an admin, I can view/mark-reviewed/archive/delete feedback.                                     | TC-24               | M-14                       |
| US-17 | As an admin, I can toggle and save platform settings.                                              | TC-25               | M-15                       |
| US-18 | As a logged-in student, my nickname is shown in the nav bar **on every page**, not only Community. | —                   | M-16 (regression — see §6) |

---

## 5. Manual Test Checklist (UI layer)

Run in a real browser, one row = one pass/fail entered by tester + date. Any failure becomes a GitHub Issue (see §6) linked back to its row.

| ID   | Page(s)                                                         | Step                                                      | Expected result                                            |
| ---- | --------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| M-01 | signup.html                                                     | Submit form with mismatched passwords                     | Inline error shown, no request sent                        |
| M-02 | login.html                                                      | Submit with wrong password                                | Error banner shown, stays on page                          |
| M-03 | login.html                                                      | Submit valid admin ID/password                            | Redirects to `admin.html`                                  |
| M-04 | create-post.html                                                | Visit while logged out                                    | "Members only" gate shown, cannot submit                   |
| M-05 | community.html                                                  | Create a private post, log out, view as guest             | Private post is not visible                                |
| M-06 | community.html                                                  | Add a comment, refresh page                               | Comment persists and count updates                         |
| M-07 | community.html                                                  | Click Report, enter reason                                | Button shows "✓ Reported", disabled                        |
| M-08 | resources.html                                                  | Filter by category + search keyword together              | Grid narrows correctly, empty state shows when no match    |
| M-09 | about.html                                                      | Submit feedback < 5 characters                            | Inline validation message, no request sent                 |
| M-10 | admin.html                                                      | Open dashboard                                            | User/post counts match DB row counts                       |
| M-11 | admin.html                                                      | Resolve a pending report                                  | Row badge updates to "Resolved" without page reload        |
| M-12 | admin.html                                                      | Suspend a user, then try logging in as that user          | Login blocked with "account suspended" message             |
| M-13 | admin.html                                                      | Add a resource, check it appears on resources.html        | New card visible after refresh                             |
| M-14 | admin.html                                                      | Archive a feedback item                                   | Badge updates, item excluded from "New" count              |
| M-15 | admin.html                                                      | Toggle a setting off, save, reload page                   | Toggle stays off after reload                              |
| M-16 | index.html, resources.html, login.html, signup.html, about.html | Log in, then visit each page directly (not via Community) | Nav shows "Hi, <nickname>" and "Log out" on **every** page |

---

## 6. Bug/Error Tracking Process

### 6.1 Previous approach (before this review)

Bugs were written as free text directly inside the relevant GitHub Wiki / user-story page. This was reviewed and found insufficient because:

- No status field (open/in-progress/fixed) — text edits get overwritten or lost.
- No way to assign an owner or due date.
- No link between a bug and the commit/PR that fixed it.
- No overview of how many bugs are open vs. resolved.

### 6.2 Minimum requirement

Every bug is still recorded on its relevant user-story GitHub page (issue reference pasted into the story's "Testing notes" section), so the story-level history stays intact.

### 6.3 Adopted tracking tools

- **GitHub Issues** — one issue per bug. Template fields: *Steps to reproduce*, *Expected result*, *Actual result*, *Test case ID* (from §4/§5), *Severity* (Blocker/Major/Minor/Cosmetic), *Linked user story*.
  Labels used: `bug`, `severity:blocker`, `severity:major`, `severity:minor`, `needs-triage`, `regression`.
- **GitHub Projects** (Kanban board: *Backlog → Triaged → In Progress → In Review → Done*) — every bug issue is added to the board so status is visible at a glance during standups and before the demo.
- **Pull Requests** — every fix references its issue with `Fixes #<issue-number>` so the issue auto-closes on merge and the fix is traceable to a commit.

### 6.4 Example (real bug found during this cycle)

- **Issue title:** Nickname not shown in nav bar outside Community page
- **Steps to reproduce:** Log in → navigate to `index.html`, `resources.html`, `login.html`, `signup.html`, or `about.html` directly
- **Expected:** Nav shows "Hi, <nickname>" / "Log out", same as `community.html`
- **Actual:** Nav still shows "Log in" / "Sign up"
- **Root cause:** `updateNavForLoginState()` existed only in `community.html` and `create-post.html`; other pages never called it and lacked the `loginNavLink`/`signupNavLink` IDs.
- **Severity:** Major (visible on every page, confusing for users)
- **Linked user story:** US-18 / M-16
- **Status:** Fixed — ported the function and IDs to all five remaining pages; verified manually against M-16.

---

## 7. Schedule (toward Week 10 demo)

| Week    | Activity                                                                                                                            |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 8       | Finalize `test.js`/`test.md`, open GitHub Issues for all currently known bugs, set up Projects board                                |
| 9       | Run full automated + manual pass, fix Blocker/Major issues, re-test                                                                 |
| 9 (end) | Freeze scope for demo; only Blocker fixes allowed after this point                                                                  |
| 10      | Final automated run (`node test.js`) the morning of the demo; demo walks through §4 traceability table live from the Projects board |

---

## 8. How the Automated Testing Code Works

`test/test.js` is a standalone Node.js script (no test framework required — only the built-in `fetch`, available from Node 18 onward) that drives the live REST API exposed by `server.js` and checks the responses against what each user story promises. It is **black-box system testing**: the script never imports or calls any production code directly — it only talks to the app the same way the real frontend does, over HTTP, against a running server and a real MySQL database.

**Structure of the script**

1. **Configuration** — `BASE_URL`, `ADMIN_ID` and `ADMIN_PASSWORD` are read from environment variables (with `http://localhost:3000` as the default base URL). This lets the same script run against a local machine, a teammate's machine, or a CI runner without any code changes.

2. **`api(path, options)` helper** — wraps `fetch` so every test case can make a request in one line and get back a consistent `{ status, ok, body }` object, with the JSON response already parsed (and safely ignored if a given endpoint returns no body).

3. **`test(id, name, fn)` runner** — a minimal, hand-rolled substitute for a framework like Jest/Mocha. It runs the async function `fn`, catches any thrown error, and records a `PASS` or `FAIL` entry (with the `id` matching the TC-xx codes in §4, so a failure can be traced straight back to the traceability table and turned into a GitHub Issue). A companion `skip(id, name, reason)` records tests that could not run (e.g. admin tests when no admin credentials were supplied) without counting them as failures.

4. **`assert(condition, message)`** — a tiny assertion helper; throwing inside a `test()` callback is how a test case fails, and the thrown message becomes the printed failure reason.

5. **Shared `state` object** — because system tests are not independent (you cannot comment on a post that does not exist yet), the script keeps a single mutable `state` object that later test cases read from earlier ones — e.g. `state.userId` is set by the login test (TC-03) and reused by every test case that needs to act "as" that user (create a post, comment, report, etc.), and `state.publicPostId` created in TC-08 is reused by the comment and report test cases. A timestamp-based `stamp` is used to generate a unique email/nickname per run, so the script can be re-run repeatedly against the same database without hitting duplicate-signup errors.

6. **Sequential execution** — test cases run in a fixed order with `await`, deliberately mirroring a real user's journey through the app: sign up → log in → get suspended/restored → post → comment → report → admin reviews the report → admin manages users/resources/feedback/settings → cleanup. This ordering is what allows state to be threaded through, and also doubles as an integration check that these features work correctly *together*, not just in isolation.

7. **Cleanup step (`TC-99`)** — deletes the posts the script created, so repeated runs do not permanently pollute the community feed used for manual/demo testing.

8. **Summary and exit code** — after all test cases run, the script prints a `Total / Passed / Failed / Skipped` count and, if anything failed, lists each failing TC-xx ID with its error message. It sets `process.exitCode = 1` on any failure, which is what allows it to be plugged into a CI pipeline later (a CI job simply fails the build if `node test.js` exits non-zero) even though no CI is wired up for this submission.

**Why this design was chosen over a full test framework**

- Zero extra dependencies to install — anyone can clone the repo and run `node test.js` immediately.
- Matches the "black-box, real HTTP request" nature of system testing better than a framework's usual mocked/unit style.
- The IDs and pass/fail output map 1:1 onto the traceability table in §4, so results can be read directly against the user stories during the Week 10 demo without any extra translation step.

---

## 9. How to Run

```bash
# 1. Reset DB (optional, for a clean run)
mysql -u root -p < schema.sql
npm run seed-admin
npm run seed-resources

# 2. Start backend
npm start

# 3. In a second terminal, run automated system tests
cd test
node test.js
```

`test.js` prints a PASS/FAIL line per test case (matching the TC-xx IDs in §4) and exits with a non-zero code if any test fails, so it can also be wired into CI later.