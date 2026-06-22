# Punjab Academy Sukkur — Management System

A web-based management system that digitizes the daily operations of Punjab Academy Sukkur — student records, attendance, fee collection, exam results, and internal communication.

## Live

- **Application:**https://punjab-academy-sukkur-yyl2.vercel.app
- **API:** https://punjab-academy-sukkur.vercel.app

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router, Axios
- **Backend:** Node.js, Express.js, JWT, bcrypt
- **Database:** MongoDB, Mongoose, MongoDB Atlas
- **Hosting:** Vercel

## Modules

- **Authentication** — JWT login, role-based access (Admin, Teacher, Student), password management
- **Student Management** — Registration, profiles, class assignment, search and filter
- **Teacher Management** — Registration, subject and class assignment
- **Attendance** — Daily marking, student history, monthly reports
- **Fee Management** — Fee creation, partial/full payments, auto receipt numbers, monthly collection reports
- **Academics** — Assignments, exam result entry, auto-graded result cards
- **Notices** — Announcements with audience targeting (all, teachers, students, specific class)
- **Dashboards** — Role-specific overview with live statistics

## Local Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
ADMIN_EMAIL=admin@punjabacademy.com
ADMIN_PASSWORD=yourpassword
```

## Deployment

Deployed on **Vercel** (frontend + backend serverless) with **MongoDB Atlas** as the database.

## License

Developed for Punjab Academy Sukkur. All rights reserved.
