## Iteration 1

| User Story | Priority | Effort |
|------------|:--------:|:------:|
| Browse Website (Home & Navigation) | 10 | 4 days |
| Learn About the Platform | 20 | 2 days |
| View Mental Health Resources | 10 | 4 days |

**Total: 10 days**

---

## Iteration 1 Actual Velocity

The planned effort for Iteration 1 was **10 days**.

All three planned user stories were completed during the iteration.

**Actual Velocity: 10 days**

---

## Iteration 1 Reflection

### What went well

- The basic website structure was completed successfully.
- The homepage and navigation were implemented, allowing users to move between pages easily.
- The "About" page introduced the purpose and objectives of the platform.
- The Mental Health Resources page was completed to provide useful support information.
- Team members collaborated using GitHub and committed code regularly.

### What could be improved

- The website currently provides mainly front-end functionality.
- Some pages still use static content and are not connected to a backend database.
- More testing should have been completed before finishing the iteration.
- GitHub Issues and task labels could have been updated more consistently.

### Improvements for Iteration 2

- Implement anonymous posting functionality.
- Develop the community page for viewing posts.
- Connect the frontend with the Java backend and MySQL database.
- Improve responsive design for different screen sizes.
- Increase testing and code reviews before merging pull requests.

---

## Iteration 1 Burndown Data

| Day | Ideal Remaining Effort | Actual Remaining Effort |
|---:|---:|---:|
| 0 | 10 | 10 |
| 1 | 9 | 10 |
| 2 | 8 | 9 |
| 3 | 7 | 8 |
| 4 | 6 | 6 |
| 5 | 5 | 5 |
| 6 | 4 | 4 |
| 7 | 3 | 3 |
| 8 | 2 | 2 |
| 9 | 1 | 1 |
| 10 | 0 | 0 |

---

## Iteration 1 Burndown Chart



---

## GitHub Task Tracking

| User Story | Status |
|------------|--------|
| Browse Website (Home & Navigation) | Done |
| Learn About the Platform | Done |
| View Mental Health Resources | Done |

### Labels

- Done
- In Progress
- Todo

---

## Daily Commit History

| Day | Commit Message |
|-----|----------------|
| Day 1 | Create project structure and homepage |
| Day 2 | Add navigation between pages |
| Day 3 | Create About page |
| Day 4 | Improve homepage layout and styling |
| Day 5 | Develop Mental Health Resources page |
| Day 6 | Add support resource links |
| Day 7 | Improve responsive layout |
| Day 8 | Fix navigation issues |
| Day 9 | Update documentation |
| Day 10 | Final testing and merge Iteration 1 |

---

## Pull Request

**Title**

```
Implement Iteration 1 website foundation
```

**Description**

```
Completed the first iteration of the Anonymous Student Support Platform.

Implemented:
- Home page
- Navigation
- About page
- Mental Health Resources page
- UI improvements
- Documentation updates

All changes were reviewed before merging into the main branch.
```

---

## Completed User Stories

- Browse Website (Home & Navigation)
- Learn About the Platform
- View Mental Health Resources

---

## Unfinished User Stories

- Anonymous Account Registration
- User Login
- Anonymous Posting
- Community Posts
- Comments and Replies
- Helpful Votes
- Reporting System
- Administrator Dashboard
- Search and Filter
- Database Integration

---

## SRP Review

### Satisfied

- The Home page is responsible only for navigation.
- The About page only introduces the platform.
- The Resources page only displays support information.

### Needs Improvement

- JavaScript functions should be further modularised.
- Backend logic should be separated from the presentation layer.

---

## DRY Review

### Satisfied

- Navigation menu is reused across all pages.
- Common CSS styles are shared.

### Needs Improvement

- Some repeated HTML sections can be converted into reusable components.
- Repeated JavaScript code should be extracted into utility files.
