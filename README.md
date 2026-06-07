# Student Grade Tracker

A purpose-built academic management tool for Nigerian university lecturers. Manage students, courses, scores, and GPA calculations — all offline, all local.

Built for lecturers at the University of Abuja, Ahmadu Bello University Zaria, University of Lagos, and every other Nigerian university where grade computation needs to be fast, accurate, and professional.

## Features

- **Student Management** — Register students with name, matriculation number, department, and level
- **Course Management** — Add courses with course codes, credit units, semester, and academic session
- **Score Entry** — Enter scores per student per course with automatic grade assignment using the Nigerian university grading scale
- **GPA Calculation** — Weighted GPA computed automatically using credit units
- **Result Sheets** — Printable academic result sheets per student with full course breakdown and final GPA
- **Dashboard** — Overview of all students, courses, departments, and level distribution
- **Offline** — Everything runs locally. No internet required after installation.

## Nigerian University Grading Scale

| Score   | Grade | Grade Point |
| ------- | ----- | ----------- |
| 70–100  | A     | 5           |
| 60–69   | B     | 4           |
| 50–59   | C     | 3           |
| 45–49   | D     | 2           |
| 40–44   | E     | 1           |
| 0–39    | F     | 0           |

**GPA Formula**: Weighted GPA = Sum(Grade Point × Credit Unit) / Sum(Credit Unit)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

## Setup Instructions

### 1. Install Server Dependencies

Open a terminal in the project root and run:

```bash
cd server
npm install
```

### 2. Install Client Dependencies

Open a second terminal in the project root and run:

```bash
cd client
npm install
```

### 3. Start the Backend Server

```bash
cd server
npm start
```

The server will start on `http://localhost:5000`. The SQLite database file (`database.db`) is created automatically the first time the server runs.

### 4. Start the React Frontend

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:3000` and automatically proxy API requests to the backend.

### 5. Open the App

Visit **http://localhost:3000** in your browser.

## Usage Guide

1. **Dashboard** — See an overview of students, courses, departments, and levels at a glance
2. **Students** — Add new students, search by name or matric number, delete students
3. **Courses** — Add courses organized by academic session and semester
4. **Scores** — Select a student and course, enter a score (0–100), and the grade is assigned automatically
5. **Results** — View a full, printable result sheet per student with all courses, scores, grades, and GPA

## Project Structure

```
student-grade-tracker/
├── client/                  # React frontend (Vite + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── components/      # Navbar, EmptyState
│   │   └── pages/           # Dashboard, Students, Courses, Scores, Results
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                  # Node.js + Express backend
│   ├── index.js             # API routes and SQLite database setup
│   ├── database.db          # SQLite database (auto-created)
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint                | Description                         |
| ------ | ----------------------- | ----------------------------------- |
| GET    | `/api/students`         | Fetch all students                  |
| POST   | `/api/students`         | Add a new student                   |
| DELETE | `/api/students/:id`     | Remove a student                    |
| GET    | `/api/courses`          | Fetch all courses                   |
| POST   | `/api/courses`          | Add a new course                    |
| DELETE | `/api/courses/:id`      | Remove a course                     |
| POST   | `/api/scores`           | Enter/update a score                |
| GET    | `/api/scores/:student_id` | Fetch scores for a student        |
| GET    | `/api/gpa/:student_id`  | Calculate weighted GPA for a student |
| GET    | `/api/students/search?q=` | Search students by name or matric |
| GET    | `/api/dashboard`        | Get dashboard overview data         |

## Technology Stack

- **Frontend**: React, React Router, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Database**: SQLite3 (via better-sqlite3)
