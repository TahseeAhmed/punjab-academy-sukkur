# Punjab Academy Sukkur — Management System

A full-stack MERN academy management system: students, teachers, classes, attendance, fees, assignments, exam results, and notices — with role-based dashboards for Admin, Teacher, and Student.

## Tech stack

- **Frontend:** React 19 (Vite), React Router, Tailwind CSS v4, Axios, lucide-react, react-hot-toast
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcrypt
- **Database:** MongoDB (Atlas recommended for production)

## Project structure

```
punjab-academy/
├── backend/            Express API
│   ├── config/         DB connection
│   ├── models/         Mongoose schemas (User, Student, Teacher, ClassSection,
│   │                   Subject, Attendance, Fee, Assignment, Result, Notice)
│   ├── controllers/    Route handlers / business logic
│   ├── routes/         Express routers
│   ├── middleware/     JWT auth, role-based access, error handling
│   ├── utils/seedAdmin.js   Creates the first admin login
│   └── server.js
└── frontend/           React app
    └── src/
        ├── api/         Axios client (auto-attaches JWT)
        ├── context/      Auth context
        ├── components/   Layout (sidebar/topbar), reusable UI primitives
        └── pages/
            ├── admin/, teacher/, student/   role-specific dashboards
            └── shared/                      pages that adapt by role
                                              (Students, Attendance, Fees, Academics, Notices)
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your MongoDB connection string (Atlas: create a free cluster at mongodb.com/cloud/atlas, add a database user, allow your IP, copy the connection string)
- `JWT_SECRET` — any long random string (e.g. `openssl rand -base64 48`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — credentials for the first admin account

Create the first admin login, then start the server:

```bash
npm run seed   # creates the admin account from .env (run once)
npm run dev    # starts on http://localhost:5000
```

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

The dev server proxies `/api` requests to `http://localhost:5000` (see `vite.config.js`), so just run both servers side by side and open `http://localhost:5173`.

Log in with the admin credentials from your `.env` file. From the admin dashboard you can then:
1. Create classes & sections (**Classes & Subjects**)
2. Add subjects to each class
3. Add teachers and assign them to classes
4. Register students into classes
5. Start marking attendance, creating fee records, posting results and notices

## What's built (mapped to the PRD)

| PRD section | Status |
|---|---|
| 5.1 Authentication & Roles | JWT login, 3 role-based dashboards, password change |
| 5.2 Student Management | Registration, profile, class assignment, search/filter, deactivate |
| 5.3 Attendance | Daily marking by class, student history, monthly class report |
| 5.4 Fee Management | Per-student or per-class fee creation, partial/full payments, auto receipt numbers, monthly collection report |
| 5.5 Academic Management | Subjects, assignments, exam result entry, auto-graded result cards |
| 5.6 Communication | Notices with audience targeting (all / teachers / students / one class), pinning |
| 5.7 Reports & Analytics | Attendance %, fee collection totals, result cards — admin dashboard overview |
| 6 Non-functional | Bcrypt password hashing, JWT + role middleware on every protected route, indexed queries |

**Not built (PRD "Future Enhancements" — intentionally out of scope for v1):** SMS/email integration, online fee payment gateway, parent portal, mobile app, AI performance analysis, live classes. The schema (e.g. `guardianEmail`/`guardianPhone` on Student) leaves room to add a parent portal later without migration.

## Deployment (same pattern as your ShopNova deployment)

- **Backend** → Railway or Render (Node service). Set the same env vars as `.env`.
- **Frontend** → Vercel. Set `VITE_API_URL` if you stop using the dev proxy, or configure a rewrite from `/api/*` to your backend URL in `vercel.json`.
- **Database** → MongoDB Atlas (free M0 tier is enough for 1000+ students).

One difference from a Vercel rewrite setup: in production the frontend won't have Vite's dev proxy, so either:
1. Add a `vercel.json` rewrite (`/api/(.*)` → `https://your-backend.up.railway.app/api/$1`), or
2. Change `frontend/src/api/axios.js` `baseURL` to your full backend URL via an env variable.

## Default login (after seeding)

```
Email:    admin@punjabacademy.com   (or whatever you set in .env)
Password: Admin@123                 (change this immediately after first login)
```
