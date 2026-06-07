# Student Grade Tracker

A full-stack academic management tool for Nigerian university lecturers. Manage 130 students across two courses, handle score entry, auto-calculate grades using the Nigerian grading system, and generate reports.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite3 (via sql.js)

## Features

### Student Management
- Add, edit, delete students
- Filter by level (100 / 200)
- Search by name or matric number

### Score Entry
- Input scores per student: Assignment (10), Test (20), Practical (20), Exam (50)
- Auto-calculates total score, letter grade, and grade point
- Edit existing scores

### Live Dashboard
- Total number of students per level
- Class average score per course
- Grade distribution breakdown (A, B, C, D, E, F)
- Top 5 performing students per course
- Pass/fail rate (pass = score ≥ 40)

### Reports
- Full result table per course/level with columns: Matric No, Name, Assignment, Test, Practical, Exam, Total, Grade, Grade Point
- Sort by total score, name, grade
- Filter by grade
- Export to CSV

## Nigerian University Grading Scale

| Score   | Grade | Grade Point |
|---------|-------|-------------|
| 70–100  | A     | 5.0         |
| 60–69   | B     | 4.0         |
| 50–59   | C     | 3.0         |
| 45–49   | D     | 2.0         |
| 40–44   | E     | 1.0         |
| 0–39    | F     | 0.0         |

## Score Breakdown

| Assessment | Max Score |
|------------|-----------|
| Assignment | 10        |
| Test       | 20        |
| Practical  | 20        |
| Exam       | 50        |
| **Total**  | **100**   |

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm

### Install & Run

```bash
# Install all dependencies
npm install

# Start both Express (port 5000) and Vite (port 5173)
npm run dev
```

The database is auto-created and seeded with:
- **50 students** for 100 Level — Introduction to Computer Science
- **80 students** for 200 Level — Introduction to Programming
- Random but realistic scores for all students

Vite proxies `/api` requests to Express, so there are no CORS issues.

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint                     | Description                        |
|--------|------------------------------|------------------------------------|
| GET    | `/api/students`              | List all students (?level=100\|200) |
| POST   | `/api/students`              | Add new student                    |
| PUT    | `/api/students/:id`          | Update student                     |
| DELETE | `/api/students/:id`          | Delete student                     |
| GET    | `/api/scores`                | List all scores (?level=100\|200)  |
| GET    | `/api/scores/:studentId`     | Get scores for one student         |
| POST   | `/api/scores/:studentId`     | Add/update scores for a student    |
| DELETE | `/api/scores/:id`            | Delete a score entry               |
| GET    | `/api/reports/summary`       | Dashboard stats                    |
| GET    | `/api/reports/:level`        | Full result table for a level      |
| GET    | `/api/reports/export?level=` | Export CSV for a level             |

## Project Structure

```
student-grade-tracker/
├── server/
│   ├── index.js           # Express entry point
│   ├── db.js              # SQLite3 setup, schema init & seed
│   ├── db-helpers.js      # Query helpers for sql.js
│   ├── grading.js         # Nigerian grading logic
│   └── routes/
│       ├── students.js
│       ├── scores.js
│       └── reports.js
├── src/                   # React frontend (Vite)
│   ├── App.jsx
│   ├── api.js             # Fetch wrapper for all endpoints
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Students.jsx
│   │   ├── Scores.jsx
│   │   └── Reports.jsx
│   └── components/
│       ├── Navbar.jsx
│       ├── ConfirmModal.jsx
│       └── EmptyState.jsx
├── package.json           # Root — runs both server + client via concurrently
├── vite.config.js
└── README.md
```
