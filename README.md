# 🚀 Project Camp Backend API

> **Enterprise-Grade Project Management Backend** | RESTful API | JWT Authentication | Role-Based Access Control | Production-Ready

[![GitHub](https://img.shields.io/badge/GitHub-ProjectCamp-blue?logo=github)](https://github.com/Alok-Pandey-Coder/ProjectCamp)
[![License](https://img.shields.io/badge/License-MIT-green)]()
[![API Version](https://img.shields.io/badge/API-v1.0.0-blue)]()
[![Node.js](https://img.shields.io/badge/Node.js-16+-green)]()

---

## 📖 Quick Navigation

- [Overview](#overview)
- [Target Users](#target-users)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Permission Matrix](#permission-matrix)
- [Project Structure](#project-structure)
- [Security](#security)
- [Installation & Setup](#installation--setup)
- [Contributing](#contributing)
- [Support](#support)

---

## 🎯 Overview

**Project Camp Backend** is a RESTful API service designed to support collaborative project management. The system enables teams to organize projects, manage tasks with subtasks, maintain project notes, and handle user authentication with role-based access control.

### Key Capabilities
✅ Secure JWT-based authentication with email verification
✅ Three-tier role-based access control (Admin, Project Admin, Member)
✅ Complete project lifecycle management
✅ Hierarchical task and subtask organization
✅ File attachment support for enhanced collaboration
✅ Email notification system for verification and password reset
✅ Production-grade security and scalability

---

## 👥 Target Users

| User Role | Capabilities |
|-----------|--------------|
| **Project Administrators** | Create and manage projects, assign roles, oversee all project activities, manage team members |
| **Project Admins** | Manage tasks and project content within assigned projects, create and update tasks |
| **Team Members** | View projects, update task completion status, access project information, update subtask status |

---

## ⭐ Core Features

### 🔐 3.1 User Authentication & Authorization
- ✓ User Registration with email verification
- ✓ Secure Login with JWT tokens
- ✓ Password Management (change, forgot, reset)
- ✓ Email Verification via token links
- ✓ Access Token Refresh Mechanism
- ✓ Three-tier Role-Based Access Control (Admin, Project Admin, Member)

### 📊 3.2 Project Management
- ✓ Project Creation with name and description
- ✓ Project Listing with member count
- ✓ Project Details retrieval
- ✓ Project Updates (Admin only)
- ✓ Project Deletion (Admin only)

### 👥 3.3 Team Member Management
- ✓ Member Addition via email invitation
- ✓ Member Listing for projects
- ✓ Role Management and updates (Admin only)
- ✓ Member Removal from projects (Admin only)

### ✅ 3.4 Task Management
- ✓ Task Creation with title, description, and assignee
- ✓ Task Listing within projects
- ✓ Task Details retrieval
- ✓ Task Updates and status changes
- ✓ Task Deletion
- ✓ File Attachments (multiple per task)
- ✓ Task Assignment to team members
- ✓ Three-state Status System (Todo, In Progress, Done)

### 📋 3.5 Subtask Management
- ✓ Subtask Creation within tasks
- ✓ Subtask Updates and completion status
- ✓ Subtask Deletion (Admin/Project Admin only)
- ✓ Member Completion marking

### 📝 3.6 Project Notes
- ✓ Note Creation (Admin only)
- ✓ Note Listing per project
- ✓ Note Details retrieval
- ✓ Note Updates (Admin only)
- ✓ Note Deletion (Admin only)

### 🏥 3.7 System Health
- ✓ Health Check endpoint for system status monitoring

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js v16+ |
| **Framework** | Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens) |
| **Validation** | Joi Schema Validation |
| **Password Security** | bcrypt |
| **File Upload** | Multer |
| **HTTP Security** | CORS |
| **Email Service** | Nodemailer |
| **API Testing** | Postman/Jest |

---

## 🚀 Quick Start

### Prerequisites
