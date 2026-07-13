# Practical 7 – Iteration 2

## 1. Testing Plan

The following testing will be conducted for the Anonymous Student Support Platform.

- **Unit Testing** – Test individual functions such as creating posts, comments, and reports.
- **Integration Testing** – Ensure different components work together correctly.
- **Validation Testing** – Check invalid inputs such as empty titles, comments, and report reasons.

---

## 2. User Stories and Test Cases

### User Story 1
**As a student, I want to create an anonymous post so that I can share my concerns safely.**

**Test Cases**
- Create a post with valid title and content.
- Submit a post with an empty title.
- Submit a post with empty content.

---

### User Story 2
**As a student, I want to comment on a post so that I can support other students.**

**Test Cases**
- Add a valid comment.
- Submit an empty comment.
- Verify the comment appears under the correct post.

---

### User Story 3
**As a student, I want to report inappropriate content to keep the platform safe.**

**Test Cases**
- Submit a valid report.
- Submit a report without a reason.
- Prevent duplicate reports.

---

### User Story 4
**As a student, I want to use an anonymous nickname to protect my identity.**

**Test Cases**
- Display an anonymous nickname.
- Hide the user's real identity.
- Ensure the nickname is not empty.

---

### User Story 5
**As a student, I want to view posts so that I can read other students' experiences.**

**Test Cases**
- Display existing posts.
- Show a message when no posts exist.
- Open a selected post successfully.

---

## 3. Automated Tests

Implement at least **15 automated tests** based on the test cases above.

- 3 tests for Post
- 3 tests for Comment
- 3 tests for Report
- 3 tests for Anonymous Nickname
- 3 tests for Viewing Posts
