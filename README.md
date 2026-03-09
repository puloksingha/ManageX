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
- `VITE_API_BASE_URL` (use your backend URL, for example `https://api.example.com/api`; use `/api` only if frontend and backend are served from the same origin)

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

## Deployment Notes

### Recommended demo deployment
- Frontend: deploy `client/` as a static site
- Backend: deploy `server/` as a Node web service
- Database: MongoDB Atlas

### Required production environment setup

Backend:
- set `NODE_ENV=production`
- set `MONGO_URI` to your hosted MongoDB connection string
- set `CLIENT_URL` to your frontend URL
- optionally set `CLIENT_URLS` as a comma-separated allowlist if you use multiple frontend URLs
- replace `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `ADMIN_SECURITY_KEY`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` with fresh values
- keep `EMAIL_MOCK=true` for demo deployments without real email delivery, or configure SMTP and set `EMAIL_MOCK=false`

Frontend:
- set `VITE_API_BASE_URL` to your deployed backend URL ending with `/api`

### SPA routing support
- `client/vercel.json` is included for Vercel deployments
- `client/public/_redirects` is included for Netlify-style static hosting

### Important limitations
- Uploaded files are stored in `server/uploads/`; use a host with persistent disk if you need uploaded files to survive restarts
- The tracked secrets in local `.env` files must be rotated before any public deployment
- For teacher/demo access, you can keep email mocking enabled and use pre-verified accounts

## License
This project is licensed under the MIT License.

See the [LICENSE](./LICENSE) file for full terms.
