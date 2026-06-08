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

export function clearStudents() {
  save([]);
}

export function seedStudents(data) {
  const existing = load();
  const students = data.map((s) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const total = s.assignment + s.test + s.exam;
    return { id, assignment: 0, test: 0, exam: 0, total: 0, ...s, assignment: s.assignment, test: s.test, exam: s.exam, total };
  });
  const merged = [...existing, ...students];
  save(merged);
  return merged;
}

const COURSES_KEY = "gradeTrackerCourses";

export function getCourses() {
  try {
    const raw = localStorage.getItem(COURSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCourses(data) {
  localStorage.setItem(COURSES_KEY, JSON.stringify(data));
}

export function addCourse(name) {
  const courses = getCourses();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  courses.push({ id, name });
  saveCourses(courses);
  return courses;
}

export function updateCourse(id, name) {
  const courses = getCourses();
  const idx = courses.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Course not found");
  courses[idx] = { ...courses[idx], name };
  saveCourses(courses);
  return courses;
}

export function deleteCourse(id) {
  const courses = getCourses().filter((c) => c.id !== id);
  saveCourses(courses);
  return courses;
}

export function clearCourses() {
  saveCourses([]);
}

