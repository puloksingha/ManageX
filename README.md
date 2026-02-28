# ManageX - College Assignment Management System

Production-style full-stack app with role-based panels for `student`, `teacher`, and `admin`.

## Stack
- Client: React + Vite + Tailwind CSS
- Server: Node.js + Express + MongoDB (Mongoose)
- Auth: JWT access + refresh tokens + email verification (OTP)
- Uploads: Multer (PDF/DOCX/ZIP for assignments, image avatar uploads)

## Features Implemented
- Public home page
- Student self-registration
- Real-email verification workflow (register -> OTP -> verify -> login)
- Password recovery workflow (forgot password email + secure reset)
- Secure login with role-based routing
- Refresh-token rotation with reuse detection and logout-all support
- Student dashboard: view assignments + upload submissions
- Teacher dashboard: create assignments + grade submissions
- Admin dashboard: full user control + batch/subject management + user table filter/pagination
- Profile page for all roles (edit profile + avatar upload)
- Audit logging and protected APIs

## Project Structure
- `client/` React frontend
- `server/` Express backend

## Environment Setup

### Backend (`server/.env`)
Use `.env.example` and fill values:
- `MONGO_URI`
- `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`
- `CLIENT_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `MAIL_FROM`
- `EMAIL_MOCK=true` for local development (prints verification code in server logs)

### Frontend (`client/.env`)
- `VITE_API_BASE_URL=http://localhost:5000/api`

## Run Locally

### 1) Backend
```bash
cd server
npm install
npm run seed
npm run dev
```

### 2) Frontend
```bash
cd client
npm install
npm run dev
```

## Default Seed Users
- `admin@college.edu` / `Admin@123`
- `teacher@college.edu` / `Teacher@123`
- `student@college.edu` / `Student@123`

## API Overview
- Auth: `/api/auth/register`, `/api/auth/verify-email`, `/api/auth/resend-verification`, `/api/auth/login`, `/api/auth/refresh`
- Auth recovery/session: `/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/auth/logout-all`
- Profiles: `/api/profiles/me`, `/api/profiles/me/avatar`
- Assignments: `/api/assignments`
- Submissions: `/api/submissions`
- Admin: `/api/admin/dashboard`, `/api/admin/users`, `/api/admin/batches`, `/api/admin/subjects`
- Meta: `/api/meta/subjects`, `/api/meta/batches`
