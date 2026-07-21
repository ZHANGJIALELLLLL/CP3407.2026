# Hello Dear Project Proposal

## 1. Project Overview

Hello Dear is a web-based anonymous peer-support platform designed for university students.

The platform allows students to anonymously share concerns related to academic pressure, stress, relationships, career planning, international student life, and general campus issues.

Other students can provide support through comments and helpful votes. Users can report inappropriate content, while administrators can review reports, manage posts and users, maintain university support resources, and review user feedback.

The project will use HTML, CSS, and JavaScript for the frontend, Java Spring Boot for the backend, and MySQL for the database.

## 2. Objectives

- Develop a modern and user-friendly student peer-support website.
- Allow students to publish posts using anonymous nicknames.
- Allow students to comment and support one another.
- Provide reporting and administrator moderation functions.
- Provide a searchable directory of university support resources.
- Protect private account information.
- Store platform data in a relational SQL database.
- Apply iterative Agile software development practices.

## 3. Main Features

### User Account

- Student registration
- Secure login and logout
- University email validation
- Anonymous public nickname

### Community

- Anonymous posting
- Categories
- Comments and replies
- Helpful votes
- Search and filtering

### Community Safety

- Profanity filtering
- Report posts and comments
- Administrator report review
- Remove inappropriate content
- Suspend and restore users

### Student Resources

- Counselling services
- Academic support
- Career services
- International student services
- Accessibility services

### Feedback

- Students can submit feedback.
- Administrators can review and archive feedback.

## 4. Technology Stack

- Frontend: HTML, JavaScript
- Backend: Java
- Database: MySQL
- Version Control: Git and GitHub
- Database Design: MySQL Workbench 

## 5. Data and Privacy

Private account information such as email addresses and password hashes will not be displayed publicly.

Posts and comments will use generated anonymous nicknames.

Passwords will be stored using secure password hashing rather than plain text.

Only users with the ADMIN role will be allowed to access administrator functions.

The platform will validate user input and use database access methods that reduce SQL injection risks.