# Iteration 1

## Objective

The objective of Iteration 1 was to establish the foundation of the Anonymous Student Support Platform by developing the basic website structure and delivering the highest-priority user stories. During this iteration, the team focused on creating the core pages, tracking progress using GitHub, and monitoring development with a Burndown Chart.

---

## User Stories

| User Story | Priority | Effort |
|------------|:--------:|:------:|
| Browse Website (Home & Navigation) | 10 | 4 days |
| Learn About the Platform | 20 | 2 days |
| View Mental Health Resources | 10 | 4 days |

**Total: 10 person-days**

---

## Task Breakdown

### User Story 1 – Browse Website (Home & Navigation)

| Task | Estimation | Status |
|------|:----------:|--------|
| Design homepage | 1 day | Done |
| Build homepage layout | 1 day | Done |
| Create navigation menu | 1 day | Done |
| Test page navigation | 1 day | Done |

### User Story 2 – Learn About the Platform

| Task | Estimation | Status |
|------|:----------:|--------|
| Design About page | 1 day | Done |
| Implement About page content | 1 day | Done |

### User Story 3 – View Mental Health Resources

| Task | Estimation | Status |
|------|:----------:|--------|
| Create Resources page | 2 days | Done |
| Add university support information | 1 day | Done |
| Improve page layout and testing | 1 day | Done |

---

## GitHub Task Tracking

### User Stories

| User Story | Status |
|------------|--------|
| Browse Website (Home & Navigation) | Done |
| Learn About the Platform | Done |
| View Mental Health Resources | Done |

### Task Labels

- Todo
- In Progress
- Done

---

## Daily Commit History

| Day | Commit Message |
|-----|----------------|
| Day 1 | Create project structure |
| Day 2 | Build homepage |
| Day 3 | Add navigation menu |
| Day 4 | Create About page |
| Day 5 | Develop Mental Health Resources page |
| Day 6 | Improve page styling |
| Day 7 | Fix navigation issues |
| Day 8 | Improve responsive layout |
| Day 9 | Update documentation |
| Day 10 | Final testing and merge Iteration 1 |

---

## Pull Request

### Title

```
Implement Iteration 1 website foundation
```

### Description

```
Completed Iteration 1 of the Anonymous Student Support Platform.

Implemented:

- Homepage
- Navigation
- About page
- Mental Health Resources page
- UI improvements
- Documentation updates

All changes were reviewed and merged successfully.
```

---

# Burndown

## Iteration 1 Burndown Data

| Day | Ideal Remaining Effort | Actual Remaining Effort |
|---:|---:|---:|
|0|10|10|
|1|9|10|
|2|8|9|
|3|7|8|
|4|6|6|
|5|5|5|
|6|4|4|
|7|3|3|
|8|2|2|
|9|1|1|
|10|0|0|

---

## Burndown Chart

<img width="931" height="324" alt="Burndown_Chart_Iteration_1" src="https://github.com/user-attachments/assets/df8b497d-83e3-4856-879e-876bb5a6d429" />

---

# Velocity

## Iteration 1 Velocity

### Project Backlog

| Iteration | Backlog |
|-----------|---------:|
| Iteration 1 | 10 person-days |
| Iteration 2 | 11 person-days |
| Iteration 3 | 9 person-days |

**Total Project Backlog = 30 person-days**

### Velocity Calculation

Completed Work = **10 person-days**

Velocity = Completed Work ÷ Total Project Backlog

Velocity = **10 ÷ 30**

Velocity = **0.3333**

---

## Reflection

### What went well

- The basic website structure was successfully completed.
- The homepage and navigation provide a simple and consistent user experience.
- The About page clearly explains the purpose of the platform.
- The Mental Health Resources page provides useful support information for students.
- GitHub Issues, commits and pull requests were used to manage the team's work.

### What could be improved

- Most features currently provide only front-end functionality.
- The application is not yet connected to the Java backend or MySQL database.
- More testing should be completed before merging code.
- GitHub Issues and labels should be updated more consistently throughout the iteration.

### Improvements for Iteration 2

- Develop anonymous posting functionality.
- Implement the community page for displaying posts.
- Connect the frontend with the backend.
- Store application data in MySQL.
- Improve responsive design.
- Increase unit testing and peer code reviews.

---

# Completed User Stories

- Browse Website (Home & Navigation)
- Learn About the Platform
- View Mental Health Resources

---

# Unfinished User Stories

- Anonymous Account Registration
- User Login
- Anonymous Posting
- Community Posts
- Comments and Replies
- Helpful Votes
- Reporting System
- Administrator Dashboard
- Search and Filter
- Feedback Submission
- Database Integration

---

# SRP Review

## Satisfied

- Home page is responsible only for navigation.
- About page is responsible only for introducing the platform.
- Resources page is responsible only for displaying support information.

## Needs Improvement

- Some JavaScript functions can be further modularised.
- Backend logic should be separated from the presentation layer.

---

# DRY Review

## Satisfied

- Navigation menu is reused across all pages.
- Common CSS styles are shared.

## Needs Improvement

- Some repeated HTML structures can be converted into reusable components.
- Repeated JavaScript functions should be extracted into utility files.

---

# Class Diagram

<img width="423" height="283" alt="Class_Diagram_Iteration_1" src="https://github.com/user-attachments/assets/64da7382-1848-4e72-b4c4-6f20d265a90c" />


---

# Sequence Diagram

<img width="497" height="285" alt="Sequence_Diagram_Iteration_1" src="https://github.com/user-attachments/assets/a1cb2260-4421-4569-a948-9276cdb801e7" />

