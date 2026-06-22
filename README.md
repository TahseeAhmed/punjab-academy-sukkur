Punjab Academy Sukkur — Management System

A web-based academy management system built for Punjab Academy Sukkur to digitize student records, attendance, fee collection, academics, and internal communication.

Live
URLApphttps://punjab-academy-sukkur.vercel.appAPIhttps://punjab-academy-sukkur-yyl2.vercel.app
Stack
LayerTechnologyFrontendReact 19, Vite, Tailwind CSS v4, React RouterBackendNode.js, Express, JWT, bcryptDatabaseMongoDB AtlasHostingVercel
Features

Role-based dashboards — Admin, Teacher, Student
Student registration, profiles, class assignment
Daily attendance marking with monthly reports
Fee management — per-student or per-class, partial/full payments, auto receipts
Assignments and exam results with auto-graded result cards
Notices with audience targeting (all / teachers / students / class)
Password management for all roles

Local Setup
bash# Backend
cd backend && npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run seed           # creates first admin (run once)
npm run dev            # http://localhost:5000

# Frontend (new terminal)
cd frontend && npm install
npm run dev            # http://localhost:5173
Default Login
Email:    admin@punjabacademy.com
Password: Admin@123

Change the password immediately after first login.

Project Structure
punjab-academy/
├── backend/
│   ├── config/         Database connection
│   ├── controllers/    Business logic
│   ├── middleware/     Auth, roles, error handling
│   ├── models/         Mongoose schemas
│   ├── routes/         API routes
│   ├── utils/          Seed script
│   └── server.js
└── frontend/
    └── src/
        ├── api/        Axios client
        ├── components/ UI primitives, layout
        ├── context/    Auth context
        └── pages/      Role-based pages
API Health Check
GET /api/health

Built with the MERN stack. Deployed on Vercel + MongoDB Atlas.
