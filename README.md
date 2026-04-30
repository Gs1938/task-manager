# TaskFlow - Team Task Manager

A full-stack web application for managing projects, tasks, and team members with role-based access control.

## Tech Stack
- Frontend: React.js
- Backend: Node.js + Express.js
- Database: SQLite (via lowdb)
- Auth: JWT (JSON Web Tokens)

## Features
- User Authentication (Signup/Login)
- Role-based access: Admin and Member
- Project creation and management
- Task assignment with deadlines and priority
- Task status tracking (Todo / In Progress / Done)
- Overdue task detection
- Dashboard with stats
- Admin: full access to all tasks and users
- Member: can only view and update their own assigned tasks

## How to Run Locally

### Backend
```
cd backend
npm install
npm start
```
Backend runs on http://localhost:5000

### Frontend
```
cd frontend
npm install
npm start
```
Frontend runs on http://localhost:3000

## Role Permissions

| Feature | Admin | Member |
|---|---|---|
| Create Project | Yes | No |
| Delete Project | Yes | No |
| Add Members | Yes | No |
| Create Task | Yes | No |
| Delete Task | Yes | No |
| Update own task status | Yes | Yes |
| Update other task status | Yes | No |
| View all tasks | Yes | No |
| View own tasks only | Yes | Yes |
| Manage Users | Yes | No |

## Deployment
Deployed on Railway with PostgreSQL database.
