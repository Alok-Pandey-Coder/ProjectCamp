# Project Camp Backend
![Live](https://img.shields.io/badge/Live-Deployed-success?style=for-the-badge&logo=render)
![Status](https://img.shields.io/badge/Status-Production-brightgreen?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)
![Database](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb)
![Auth](https://img.shields.io/badge/Auth-JWT-blue?style=for-the-badge&logo=jsonwebtokens)
![Security](https://img.shields.io/badge/Security-RBAC-red?style=for-the-badge)
![API](https://img.shields.io/badge/API-REST-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

Live URL: https://projectcamp-backend.onrender.com

A RESTful API service for collaborative project management, enabling teams to organize projects, manage tasks with subtasks, maintain project notes, and handle user authentication with role-based access control.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Support](#support)

## Overview

**Project Camp Backend** is designed to support collaborative project management with:
- Secure user authentication and JWT-based authorization
- Role-based access control (Admin, Project Admin, Member)
- Complete project lifecycle management
- Hierarchical task and subtask organization
- Project notes and file attachment support
- Email verification and password management

## 🌐 Live Deployment

The Project Camp Backend is live and accessible at:

**Base URL:**
https://projectcamp-backend.onrender.com/api/v1

**Health Check:**
https://projectcamp-backend.onrender.com/api/v1/healthcheck

**Example:**
```bash
curl https://projectcamp-backend.onrender.com/api/v1/healthcheck
```


## Prerequisites

- **Node.js** v12 or higher
- **MongoDB** v4 or higher
- **Express.js** v4 or higher
- **npm** or **yarn**

## Installation & Setup

### 1. Clone the repository:
```bash
git clone https://github.com/Alok-Pandey-Coder/ProjectCamp.git
cd ProjectCamp
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Configure environment variables:
```bash
cp .env.example .env
```
Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectcamp
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
EMAIL_SERVICE=your_email_service
EMAIL_USER=your_email
EMAIL_PASSWORD=your_password
```

### 4. Start the application:
```bash
npm start
```

The server will run on `http://localhost:5000` (or your configured PORT).

## Features

### 🔐 Authentication & Authorization
- User registration with email verification
- Secure login with JWT tokens
- Password management (change, forgot, reset)
- Token refresh mechanism
- Three-tier role-based access control

### 📊 Project Management
- Create, read, update, and delete projects
- View all accessible projects with member count
- Project information access and modification
- Role-based project access

### 👥 Team Member Management
- Invite users to projects via email
- List and manage team members
- Update member roles within projects
- Remove team members

### ✅ Task Management
- Create tasks with title, description, and assignee
- List and view task details
- Update task information and status
- Delete tasks
- Support for multiple file attachments
- Three-state status system: `todo`, `in_progress`, `done`

### 📝 Subtask Management
- Add subtasks to existing tasks
- Update subtask details and completion status
- Delete subtasks
- Allow members to mark subtasks as complete

### 📌 Project Notes
- Create notes for projects
- List and view note content
- Update and delete notes
- Role-based note access

## API Documentation

### Authentication Routes (`/api/v1/auth/`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---|
| POST | `/register` | User registration | ❌ |
| POST | `/login` | User authentication | ❌ |
| POST | `/logout` | User logout | ✅ |
| GET | `/current-user` | Get current user info | ✅ |
| POST | `/change-password` | Change password | ✅ |
| POST | `/refresh-token` | Refresh access token | ❌ |
| GET | `/verify-email/:verificationToken` | Email verification | ❌ |
| POST | `/forgot-password` | Request password reset | ❌ |
| POST | `/reset-password/:resetToken` | Reset forgotten password | ❌ |
| POST | `/resend-email-verification` | Resend verification email | ✅ |

### Project Routes (`/api/v1/projects/`)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|---|
| GET | `/` | List user projects | Any authenticated |
| POST | `/` | Create project | Any authenticated |
| GET | `/:projectId` | Get project details | Role-based |
| PUT | `/:projectId` | Update project | Admin only |
| DELETE | `/:projectId` | Delete project | Admin only |
| GET | `/:projectId/members` | List project members | Any authenticated |
| POST | `/:projectId/members` | Add project member | Admin only |
| PUT | `/:projectId/members/:userId` | Update member role | Admin only |
| DELETE | `/:projectId/members/:userId` | Remove member | Admin only |

### Task Routes (`/api/v1/tasks/`)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|---|
| GET | `/:projectId` | List project tasks | Role-based |
| POST | `/:projectId` | Create task | Admin/Project Admin |
| GET | `/:projectId/t/:taskId` | Get task details | Role-based |
| PUT | `/:projectId/t/:taskId` | Update task | Admin/Project Admin |
| DELETE | `/:projectId/t/:taskId` | Delete task | Admin/Project Admin |
| POST | `/:projectId/t/:taskId/subtasks` | Create subtask | Admin/Project Admin |
| PUT | `/:projectId/st/:subTaskId` | Update subtask | Role-based |
| DELETE | `/:projectId/st/:subTaskId` | Delete subtask | Admin/Project Admin |

### Note Routes (`/api/v1/notes/`)

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|---|
| GET | `/:projectId` | List project notes | Role-based |
| POST | `/:projectId` | Create note | Admin only |
| GET | `/:projectId/n/:noteId` | Get note details | Role-based |
| PUT | `/:projectId/n/:noteId` | Update note | Admin only |
| DELETE | `/:projectId/n/:noteId` | Delete note | Admin only |

### Health Check (`/api/v1/healthcheck/`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | System health status |

## Permission Matrix

| Feature | Admin | Project Admin | Member |
|---------|-------|---------------|--------|
| Create Project | ✅ | ❌ | ❌ |
| Update/Delete Project | ✅ | ❌ | ❌ |
| Manage Project Members | ✅ | ❌ | ❌ |
| Create/Update/Delete Tasks | ✅ | ✅ | ❌ |
| View Tasks | ✅ | ✅ | ✅ |
| Update Subtask Status | ✅ | ✅ | ✅ |
| Create/Delete Subtasks | ✅ | ✅ | ❌ |
| Create/Update/Delete Notes | ✅ | ❌ | ❌ |
| View Notes | ✅ | ✅ | ✅ |

## Security

### Implementation Features
- **JWT-based Authentication** with refresh token mechanism
- **Role-Based Authorization Middleware** enforcing permission matrix
- **Input Validation** on all API endpoints
- **Email Verification** for account security
- **Secure Password Reset** with token-based verification
- **File Upload Security** with Multer middleware
- **CORS Configuration** for cross-origin requests

### Best Practices
- Store sensitive information in environment variables
- Implement rate limiting on API endpoints to prevent abuse
- Use HTTPS in production environments
- Regularly update dependencies for security patches
- Validate and sanitize all user inputs

## Project Structure

```
ProjectCamp/
│
├── config/
│   └── config.js              # Configuration settings
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── projectController.js   # Project management
│   ├── taskController.js      # Task management
│   ├── noteController.js      # Note management
│   └── userController.js      # User management
├── models/
│   ├── User.js                # User schema
│   ├── Project.js             # Project schema
│   ├── Task.js                # Task schema
│   ├── Subtask.js             # Subtask schema
│   └── Note.js                # Note schema
├── routes/
│   ├── auth.js                # Auth routes
│   ├── projects.js            # Project routes
│   ├── tasks.js               # Task routes
│   ├── notes.js               # Note routes
│   └── healthcheck.js         # Health check routes
├── middleware/
│   ├── auth.js                # Authentication middleware
│   └── rbac.js                # Role-based access control
├── public/
│   └── images/                # Uploaded file storage
├── .env.example               # Environment variables template
├── server.js                  # Application entry point
├── package.json               # Project dependencies
└── README.md                  # Documentation
```

## Contributing

We welcome contributions! Follow these steps:

1. Fork the repository
2. Create a new branch for your feature:
   ```bash
   git checkout -b feature/YourFeatureName
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to your branch:
   ```bash
   git push origin feature/YourFeatureName
   ```
5. Open a Pull Request with a clear description of your changes

### Code Style
- Use consistent naming conventions
- Write clear, descriptive commit messages
- Add comments for complex logic
- Follow the existing code structure

## Support

For issues, questions, or suggestions:
- Open an issue in the [GitHub repository](https://github.com/Alok-Pandey-Coder/ProjectCamp/issues)
- Contact the project maintainers
- Check existing documentation in PRD.md

---

**Version:** 1.0.0  
**Last Updated:** March 2026  
**License:** MIT
