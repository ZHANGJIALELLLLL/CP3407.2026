# Iteration 2

## Objective

The objective of Iteration 2 was to implement the core functionality of the Anonymous Student Support Platform using Test-Driven Development (TDD). During this iteration, the team focused on developing user interaction features, writing automated tests before implementation, and improving software quality through continuous testing.

---

## User Stories

| User Story | Priority | Priority Justification | Effort |
|------------|:--------:|-------------------------|:------:|
| Create an Anonymous Account | 10 | Prerequisite for login and posting; all downstream features depend on it | 2 days |
| Create an Anonymous Post | 10 | Core value proposition of the platform; without posting there is no community content | 3 days |
| User Login | 20 | Required to access account-linked features, but depends on registration being done first | 2 days |
| Browse Community Posts | 20 | Needed so users can see the value of posting, but only meaningful once posts exist | 2 days |
| Comment on a Post | 30 | Enhances engagement but is not essential for the platform's minimum viable functionality | 2 days |

**Total: 11 person-days**

---

## Task Breakdown

### User Story 1 – Create an Anonymous Account

| Task | Estimation | Status |
|------|:----------:|--------|
| Design registration form | 0.5 day | Done |
| Validate user input | 0.5 day | Done |
| Store account information | 1 day | Done |

---

### User Story 2 – User Login

| Task | Estimation | Status |
|------|:----------:|--------|
| Design login page | 0.5 day | Done |
| Validate credentials | 0.5 day | Done |
| Redirect after login | 1 day | Done |

---

### User Story 3 – Create an Anonymous Post

| Task | Estimation | Status |
|------|:----------:|--------|
| Create posting interface | 1 day | Done |
| Validate post content | 1 day | Done |
| Save post | 1 day | Done |

---

### User Story 4 – Browse Community Posts

| Task | Estimation | Status |
|------|:----------:|--------|
| Display post list | 1 day | Done |
| Improve page layout | 1 day | Done |

---

### User Story 5 – Comment on a Post

| Task | Estimation | Status |
|------|:----------:|--------|
| Create comment form | 1 day | Done |
| Display comments | 1 day | Done |

---

# Backend & Database Integration

Following the Iteration 1 reflection, the frontend was connected to the Java backend and a MySQL database during this iteration:

- Account, login, post and comment data are now persisted in MySQL rather than being static/front-end only.
- Java backend services were implemented to handle registration, authentication, post creation and comment storage.
- Frontend pages were updated to call the backend endpoints instead of using placeholder data.

This resolves the "not yet connected to Java backend or MySQL database" issue raised in the Iteration 1 reflection.

---

# Test Planning

Testing was planned according to Chapter 7 of the textbook. Each user story includes positive, negative, and boundary test cases to ensure reliability and correctness before implementation.

---

## Test Cases

### User Story 1 – Create an Anonymous Account

- Register with valid information.
- Register with an existing nickname.
- Register with empty required fields.

### User Story 2 – User Login

- Login with valid credentials.
- Login with an incorrect password.
- Login with empty username or password.

### User Story 3 – Create an Anonymous Post

- Create a valid anonymous post.
- Submit an empty post.
- Submit a post exceeding the character limit.

### User Story 4 – Browse Community Posts

- View all available posts.
- Display posts after refresh.
- Browse when no posts exist.

### User Story 5 – Comment on a Post

- Submit a valid comment.
- Submit an empty comment.
- View newly added comments.

---

# Automated Tests

A total of **15 automated tests** were implemented.

| User Story | Automated Tests |
|------------|----------------:|
| Anonymous Account | 3 |
| User Login | 3 |
| Anonymous Post | 3 |
| Community Posts | 3 |
| Comments | 3 |

**Total Automated Tests: 15**

---

# GitHub Task Tracking

## User Stories

| User Story | Status |
|------------|--------|
| Anonymous Account | Done |
| User Login | Done |
| Anonymous Posting | Done |
| Community Posts | Done |
| Comments | Done |

### Labels

- Todo
- In Progress
- Done

---

## Daily Commit History

| Day | Commit Message |
|-----|----------------|
| Day 1 | Create registration page |
| Day 2 | Implement login feature |
| Day 3 | Develop anonymous posting |
| Day 4 | Implement community page |
| Day 5 | Develop comment feature |
| Day 6 | Write automated tests |
| Day 7 | Refactor project structure |
| Day 8 | Improve UI and testing |
| Day 9 | Fix bugs from testing |
| Day 10 | Final testing and merge |
| Day 11 | Update documentation |

---

## Pull Request

### Title

```
Implement Iteration 2 core application features
```

### Description

```
Completed Iteration 2 using Test-Driven Development.

Implemented:

- Anonymous Account
- User Login
- Anonymous Posting
- Community Page
- Comments
- Automated Tests

Reviewed and merged successfully.
```

---

# Burndown

## Iteration 2 Burndown Data

| Day | Ideal Remaining Effort | Actual Remaining Effort |
|---:|---:|---:|
|0|11|11|
|1|10|11|
|2|9|10|
|3|8|9|
|4|7|8|
|5|6|6|
|6|5|5|
|7|4|4|
|8|3|3|
|9|2|2|
|10|1|1|
|11|0|0|

---

## Burndown Chart

<img width="681" height="450" alt="Iteration 2" src="https://github.com/user-attachments/assets/edffe8d8-dee2-4498-a56a-8d09d9487868" />


---

# Velocity

## Iteration 2 Velocity

### Project Backlog

| Iteration | Backlog |
|-----------|---------:|
| Iteration 1 | 10 person-days |
| Iteration 2 | 11 person-days |
| Iteration 3 | 11 person-days |

**Total Project Backlog = 32 person-days**

### Velocity Calculation

Completed Work = **11 person-days**

Velocity = Completed Work ÷ Total Project Backlog

Velocity = **11 ÷ 32**

Velocity = **0.3438**
