# ManageX - College Assignment Management System

ManageX is a MERN-style assignment management platform with role-based workflows for students, departments/teachers, and administrators.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB (Mongoose)
- Authentication: JWT access + refresh tokens, email verification (OTP), password reset
- Uploads: Multer-based file uploads for assignments/submissions and profile avatars

## Core Features
- Public landing page with role-focused onboarding
- Registration + email verification flow
- Secure login with role-based access control
- Refresh-token rotation and logout-all session invalidation
- Student dashboard for assignment viewing and submission uploads
- Department dashboard for assignment creation, submission review, and grading
- Admin dashboard for users, departments, batches, subjects, and audit logs
- Profile management with avatar upload

## Roles
- `student`
- `department` (primary teacher workflow role)
- `teacher` (supported alias in auth/admin flows)
- `admin`

## Repository Structure
- `client/` - React frontend
- `server/` - Express API
- `server/uploads/` - uploaded files (served from `/uploads`)

## Local Setup

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB running locally or remotely

### 1) Configure environment files

Backend:
```bash
cd server
copy .env.example .env
```

Frontend:
```bash
cd client
copy .env.example .env
```

### 2) Install dependencies

Backend:
```bash
cd server
npm install
```

Frontend:
```bash
cd client
npm install
```

### 3) Seed initial data (admin + departments)

Set these in `server/.env` before seeding:
- `MONGO_URI`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Then run:
```bash
cd server
npm run seed
```

### 4) Run in development

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

Frontend default: `http://localhost:5173`  
Backend default: `http://localhost:5000`

## Environment Variables

### Backend (`server/.env`)
Required for normal operation:
- `PORT` (default `5000`)
- `MONGO_URI`
- `CLIENT_URL`
- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRES` (default `15m`)
- `REFRESH_TOKEN_EXPIRES` (default `7d`)
- `ADMIN_SECURITY_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`
- `EMAIL_MOCK` (`true` for local email mocking)
- `ADMIN_EMAIL` (required for `npm run seed`)
- `ADMIN_PASSWORD` (required for `npm run seed`)
- `ADMIN_NAME` (optional, defaults to `System Admin`)
- `SEED_DEPARTMENTS` (optional comma-separated list)

### Frontend (`client/.env`)
- `VITE_API_BASE_URL` (default `http://localhost:5000/api`)

## NPM Scripts

### Server (`server/package.json`)
- `npm run dev` - Start API with nodemon
- `npm run start` - Start API with node
- `npm run seed` - Bootstrap admin + departments

### Client (`client/package.json`)
- `npm run dev` - Start Vite dev server
- `npm run build` - Build production assets
- `npm run preview` - Preview built app

## API Overview
- Health: `GET /api/health`
- Auth: `/api/auth/register`, `/api/auth/verify-email`, `/api/auth/resend-verification`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/logout-all`, `/api/auth/me`, `/api/auth/forgot-password`, `/api/auth/reset-password`
- Profiles: `/api/profiles/me`, `/api/profiles/me/avatar`
- Assignments: `/api/assignments`
- Submissions: `/api/submissions`, `/api/submissions/:id/grade`
- Admin: `/api/admin/dashboard`, `/api/admin/users`, `/api/admin/departments`, `/api/admin/batches`, `/api/admin/subjects`, `/api/admin/audit-logs`
- Meta: `/api/meta/departments`, `/api/meta/public-batches`, `/api/meta/batches`, `/api/meta/subjects`

## Upload Rules
- Assignment/submission files: PDF, DOCX, ZIP (max 10 MB)
- Avatar files: JPG, PNG, WEBP (max 5 MB)

## License
This project is licensed under the MIT License.

See the [LICENSE](./LICENSE) file for full terms.
