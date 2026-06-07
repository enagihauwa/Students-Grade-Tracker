const STORAGE_KEY = "gradeTracker";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getStudents() {
  return load();
}

export function addStudent(student) {
  const students = load();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const newStudent = { id, ...student, assignment: 0, test: 0, exam: 0, total: 0 };
  students.push(newStudent);
  save(students);
  return newStudent;
}

export function updateStudent(id, data) {
  const students = load();
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Student not found");
  students[idx] = { ...students[idx], ...data };
  save(students);
  return students[idx];
}

export function deleteStudent(id) {
  const students = load().filter((s) => s.id !== id);
  save(students);
}

export function updateScores(id, scores) {
  const students = load();
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Student not found");
  const assignment = Number(scores.assignment) || 0;
  const test = Number(scores.test) || 0;
  const exam = Number(scores.exam) || 0;
  const total = assignment + test + exam;
  students[idx] = { ...students[idx], assignment, test, exam, total };
  save(students);
  return students[idx];
}
