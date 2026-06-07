const express = require("express");
const cors = require("cors");
const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3002;
const DB_PATH = path.join(__dirname, "database.db");

app.use(cors());
app.use(express.json());

let db;

function calculateGrade(score) {
  if (score >= 70) return { grade: "A", grade_point: 5 };
  if (score >= 60) return { grade: "B", grade_point: 4 };
  if (score >= 50) return { grade: "C", grade_point: 3 };
  if (score >= 45) return { grade: "D", grade_point: 2 };
  if (score >= 40) return { grade: "E", grade_point: 1 };
  return { grade: "F", grade_point: 0 }
}

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function query(sql, params = []) {
  const stmt = db.prepare(sql);
  if (sql.trim().toUpperCase().startsWith("SELECT") || sql.trim().toUpperCase().startsWith("WITH")) {
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } else {
    const result = stmt.run(params);
    stmt.free();
    return result;
  }
}

function getLastInsertId() {
  const rows = query("SELECT last_insert_rowid() as id");
  return rows[0].id;
}

async function initDb() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON");

  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      matriculation_number TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      level TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_name TEXT NOT NULL,
      course_code TEXT UNIQUE NOT NULL,
      credit_unit INTEGER NOT NULL CHECK(credit_unit > 0),
      semester TEXT NOT NULL CHECK(semester IN ('First', 'Second')),
      session TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      score REAL NOT NULL CHECK(score >= 0 AND score <= 100),
      grade TEXT NOT NULL,
      grade_point INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE(student_id, course_id)
    )
  `);

  saveDb();
}

app.get("/api/students", (req, res) => {
  try {
    const students = query("SELECT * FROM students ORDER BY name ASC");
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/students", (req, res) => {
  try {
    const { name, matriculation_number, department, level } = req.body;
    if (!name || !matriculation_number || !department || !level) {
      return res.status(400).json({ error: "All fields are required" });
    }
    query(
      "INSERT INTO students (name, matriculation_number, department, level) VALUES (?, ?, ?, ?)",
      [name, matriculation_number, department, level]
    );
    saveDb();
    const id = getLastInsertId();
    const student = query("SELECT * FROM students WHERE id = ?", [id])[0];
    res.status(201).json(student);
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE constraint")) {
      return res.status(409).json({ error: "Matriculation number already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/students/:id", (req, res) => {
  try {
    const { name, matriculation_number, department, level } = req.body;
    if (!name || !matriculation_number || !department || !level) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existing = query("SELECT id FROM students WHERE id = ?", [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    query(
      "UPDATE students SET name = ?, matriculation_number = ?, department = ?, level = ? WHERE id = ?",
      [name, matriculation_number, department, level, req.params.id]
    );
    saveDb();
    const student = query("SELECT * FROM students WHERE id = ?", [req.params.id])[0];
    res.json(student);
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE constraint")) {
      return res.status(409).json({ error: "Matriculation number already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/students/:id", (req, res) => {
  try {
    query("DELETE FROM scores WHERE student_id = ?", [req.params.id]);
    query("DELETE FROM students WHERE id = ?", [req.params.id]);
    saveDb();
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/courses", (req, res) => {
  try {
    const courses = query("SELECT * FROM courses ORDER BY session DESC, semester ASC");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/courses", (req, res) => {
  try {
    const { course_name, course_code, credit_unit, semester, session } = req.body;
    if (!course_name || !course_code || !credit_unit || !semester || !session) {
      return res.status(400).json({ error: "All fields are required" });
    }
    query(
      "INSERT INTO courses (course_name, course_code, credit_unit, semester, session) VALUES (?, ?, ?, ?, ?)",
      [course_name, course_code, Number(credit_unit), semester, session]
    );
    saveDb();
    const id = getLastInsertId();
    const course = query("SELECT * FROM courses WHERE id = ?", [id])[0];
    res.status(201).json(course);
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE constraint")) {
      return res.status(409).json({ error: "Course code already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/courses/:id", (req, res) => {
  try {
    const { course_name, course_code, credit_unit, semester, session } = req.body;
    if (!course_name || !course_code || !credit_unit || !semester || !session) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existing = query("SELECT id FROM courses WHERE id = ?", [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    query(
      "UPDATE courses SET course_name = ?, course_code = ?, credit_unit = ?, semester = ?, session = ? WHERE id = ?",
      [course_name, course_code, Number(credit_unit), semester, session, req.params.id]
    );
    saveDb();
    const course = query("SELECT * FROM courses WHERE id = ?", [req.params.id])[0];
    res.json(course);
  } catch (err) {
    if (err.message && err.message.includes("UNIQUE constraint")) {
      return res.status(409).json({ error: "Course code already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/courses/:id", (req, res) => {
  try {
    query("DELETE FROM scores WHERE course_id = ?", [req.params.id]);
    query("DELETE FROM courses WHERE id = ?", [req.params.id]);
    saveDb();
    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/scores", (req, res) => {
  try {
    const { student_id, course_id, score } = req.body;
    if (!student_id || !course_id || score === undefined || score === null) {
      return res.status(400).json({ error: "student_id, course_id, and score are required" });
    }
    const parsedScore = Number(score);
    if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
      return res.status(400).json({ error: "Score must be a number between 0 and 100" });
    }
    const { grade, grade_point } = calculateGrade(parsedScore);

    const existing = query(
      "SELECT id FROM scores WHERE student_id = ? AND course_id = ?",
      [student_id, course_id]
    );

    if (existing.length > 0) {
      query(
        "UPDATE scores SET score = ?, grade = ?, grade_point = ? WHERE student_id = ? AND course_id = ?",
        [parsedScore, grade, grade_point, student_id, course_id]
      );
    } else {
      query(
        "INSERT INTO scores (student_id, course_id, score, grade, grade_point) VALUES (?, ?, ?, ?, ?)",
        [student_id, course_id, parsedScore, grade, grade_point]
      );
    }
    saveDb();

    const updated = query(
      `SELECT s.*, c.course_name, c.course_code, c.credit_unit, c.semester, c.session
       FROM scores s
       JOIN courses c ON s.course_id = c.id
       WHERE s.student_id = ? AND s.course_id = ?`,
      [student_id, course_id]
    );
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/scores/:student_id", (req, res) => {
  try {
    const scores = query(
      `SELECT s.*, c.course_name, c.course_code, c.credit_unit, c.semester, c.session
       FROM scores s
       JOIN courses c ON s.course_id = c.id
       WHERE s.student_id = ?
       ORDER BY c.session DESC, c.semester ASC, c.course_name ASC`,
      [req.params.student_id]
    );
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/gpa/:student_id", (req, res) => {
  try {
    const scores = query(
      `SELECT s.grade_point, c.credit_unit
       FROM scores s
       JOIN courses c ON s.course_id = c.id
       WHERE s.student_id = ?`,
      [req.params.student_id]
    );

    if (scores.length === 0) {
      return res.json({ gpa: 0, total_credit_units: 0, total_grade_points: 0 });
    }

    let totalGradePoints = 0;
    let totalCreditUnits = 0;

    scores.forEach((s) => {
      totalGradePoints += s.grade_point * s.credit_unit;
      totalCreditUnits += s.credit_unit;
    });

    const gpa = totalCreditUnits > 0 ? (totalGradePoints / totalCreditUnits).toFixed(2) : 0;

    res.json({
      gpa: Number(gpa),
      total_credit_units: totalCreditUnits,
      total_grade_points: totalGradePoints,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/students/search", (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    const students = query(
      "SELECT * FROM students WHERE name LIKE ? OR matriculation_number LIKE ? ORDER BY name ASC",
      [`%${q}%`, `%${q}%`]
    );
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/dashboard", (req, res) => {
  try {
    const totalStudents = query("SELECT COUNT(*) as count FROM students")[0];
    const totalCourses = query("SELECT COUNT(*) as count FROM courses")[0];
    const totalScores = query("SELECT COUNT(*) as count FROM scores")[0];
    const departmentCount = query(
      "SELECT department, COUNT(*) as count FROM students GROUP BY department ORDER BY count DESC"
    );
    const levelDistribution = query(
      "SELECT level, COUNT(*) as count FROM students GROUP BY level ORDER BY level ASC"
    );
    const sessionBreakdown = query(
      `SELECT c.session, c.semester, COUNT(s.id) as score_count
       FROM scores s
       JOIN courses c ON s.course_id = c.id
       GROUP BY c.session, c.semester
       ORDER BY c.session DESC, c.semester ASC`
    );
    const recentStudents = query(
      "SELECT * FROM students ORDER BY created_at DESC LIMIT 5"
    );

    res.json({
      totalStudents: totalStudents.count,
      totalCourses: totalCourses.count,
      totalScores: totalScores.count,
      departmentCount,
      levelDistribution,
      sessionBreakdown,
      recentStudents,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
