# Iteration 3

## Objective

The objective of Iteration 3 was to complete the remaining core features of the Anonymous Student Support Platform while continuing to apply Test-Driven Development (TDD). During this iteration, the team focused on bug tracking, system testing, improving software quality, and preparing the project for the final demonstration.

---

## User Stories

| User Story | Priority | Effort |
|------------|:--------:|:------:|
| Reporting Harmful Content | 10 | 3 days |
| Add Groups| 20 | 2 days |
| Search and Filter Posts | 20 | 3 days |
| Administrator Dashboard | 30 | 3 days |

**Total: 11 person-days**

---

## Task Breakdown

### User Story 1 – Reporting Harmful Content

| Task | Estimation | Status |
|------|:----------:|--------|
| Design report interface | 1 day | Done |
| Validate report submission | 1 day | Done |
| Store report information | 1 day | Done |

---

### User Story 2 – Add Groups

| Task | Estimation | Status |
|------|:----------:|--------|
| Add "Create Group" button | 1 day | Done |
| Save group information | 1 day | Done |

---

### User Story 3 – Search and Filter Posts

| Task | Estimation | Status |
|------|:----------:|--------|
| Search posts | 1 day | Done |
| Filter by category | 1 day | Done |
| Improve search performance | 1 day | Done |

---

### User Story 4 – Administrator Dashboard

| Task | Estimation | Status |
|------|:----------:|--------|
| Display reported posts | 1 day | Done |
| Review reports | 1 day | Done |
| Remove inappropriate posts | 1 day | Done |

---

# GitHub Task Tracking

## User Stories

| User Story | Status |
|------------|--------|
| Reporting Harmful Content | Done |
| Group Creation | Done |
| Search and Filter Posts | Done |
| Administrator Dashboard | Done |

### Labels

- Todo
- In Progress
- Done

---

## Daily Commit History

| Day | Commit Message |
|-----|----------------|
| Day 1 | Implement reporting feature |
| Day 2 | Implement group creation feature |
| Day 3 | Develop search function |
| Day 4 | Implement category filter |
| Day 5 | Create administrator dashboard |
| Day 6 | Improve system testing |
| Day 7 | Fix reported bugs |
| Day 8 | Refactor project structure |
| Day 9 | Improve UI and responsiveness |
| Day 10 | Final testing |
| Day 11 | Final merge and documentation |

---

## Pull Request

### Title

```
Complete Iteration 3 and final project features
```

### Description

```
Completed Iteration 3.

Implemented:

- Reporting System
- Group Creation
- Search and Filter
- Administrator Dashboard
- Bug fixes
- Final system testing

Reviewed and merged successfully.
```

---

# Burndown

## Iteration 3 Burndown Data

| Day | Ideal Remaining Effort | Actual Remaining Effort |
|---:|---:|---:|
|0|11|11|
|1|10|11|
|2|9|10|
|3|8|9|
|4|7|7|
|5|6|6|
|6|5|5|
|7|4|4|
|8|3|3|
|9|2|2|
|10|1|1|
|11|0|0|

---

## Burndown Chart

<img width="681" height="450" alt="Iteration_3" src="https://github.com/user-attachments/assets/4196e259-58f9-410d-867b-4452a79c6662" />


---

# Iteration 3 Planning

## Previous Velocity

| Iteration | Velocity |
|-----------|---------:|
| Iteration 1 | 0.3333 |
| Iteration 2 | 0.3667 |

The team used the Iteration 2 velocity to estimate the workload for Iteration 3.

### Iteration 3 Backlog

**11 person-days**

---

# Mock Object Research

To improve unit testing efficiency, a Mock Object Framework was researched and applied.

A mock login service was created to simulate user authentication without connecting to the database.

Additional mock objects were created for:

- User registration
- Anonymous posting
- Group creation
- Report submission
- Administrator approval

Benefits:

- Faster unit testing
- Independent testing
- Easier simulation of exceptions
- Better code isolation

---

# Bug Tracking

Bug tracking was managed using GitHub Issues and Pull Requests.

## Bug Report Categories

| ID | Bug | Priority | Status |
|----|-----|----------|--------|
| BUG-001 | Login validation failed | High | Fixed |
| BUG-002 | Empty post accepted | High | Fixed |
| BUG-003 | Search returned incorrect results | Medium | Fixed |
| BUG-004 | Group creation failed | Medium | Fixed |
| BUG-005 | Report submission error | Low | Fixed |

---

# System Testing Plan

| Test Area | Description | Expected Result |
|-----------|-------------|-----------------|
| Registration | Create account | Account created |
| Login | Login with valid account | Login successful |
| Anonymous Post | Publish post | Post displayed |
| Comment | Submit comment | Comment displayed |
| Search | Search keyword | Correct results |
| Report | Report inappropriate content | Report submitted |
| Administrator | Review reports | Report processed |

---

# Reflection

## What went well

- Remaining core features were completed successfully.
- System testing identified and resolved several bugs.
- Mock objects improved unit testing efficiency.
- GitHub Issues and Pull Requests helped track development progress.

## What could be improved

- Increase integration testing.
- Improve administrator interface usability.
- Expand automated testing coverage.

## Final Improvements

- Improve application performance.
- Enhance security.
- Optimise database queries.
- Continue refactoring duplicated code.

---

# Completed User Stories

- Reporting Harmful Content
- Add Groups
- Search and Filter Posts
- Administrator Dashboard
  
---

# Remaining Future Enhancements

- Email notification
- Mobile optimisation
- AI content moderation
- User profile customisation

---

# SRP Review

## Satisfied

- Reporting module handles reports only.
- Group module manages group creation only.
- Search module manages searching only.
- Administrator module manages moderation only.

## Needs Improvement

- Further separate business logic from controllers.
- Reduce dependencies between service classes.

---

# DRY Review

## Satisfied

- Shared validation methods.
- Reused UI components.
- Common JavaScript utilities.
- Shared CSS styles.

## Needs Improvement

- Extract additional helper methods.
- Increase reusable backend services.
