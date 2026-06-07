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

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const firstNames = [
  "Chioma", "Chidi", "Ngozi", "Emeka", "Aminat", "Tunde", "Oluwaseun", "Fatima",
  "Ibrahim", "Yetunde", "Chinwe", "Obinna", "Zainab", "Segun", "Adaeze", "Musa",
  "Folake", "Uchenna", "Hauwa", "Kayode", "Ifeanyi", "Rashidat", "Temitope",
  "Chukwudi", "Khadijat", "Femi", "Nnenna", "Sadiq", "Tolani", "Ekene",
  "Aisha", "Babajide", "Chiamaka", "Dauda", "Efe", "Gambo", "Ikenna", "Jumoke",
  "Kelechi", "Laitan", "Mariam", "Nnamdi", "Ogechi", "Pamilerin", "Rebecca",
  "Sikiru", "Tariah", "Ugonna", "Wale", "Yakubu", "Zarah", "Adaobi",
  "Babatunde", "Chikodi", "Damilola", "Ebuka", "Funmilayo", "Garba",
  "Halima", "Ijeoma", "Jibril", "Kosiso", "Ladi", "Mfon", "Ndidi",
  "Olumide", "Patrick", "Queen", "Rotimi", "Sokari", "Tokunbo", "Uzoma",
  "Victor", "Waziri", "Yemi", "Abdul", "Bukola", "Chibueze"
];

const lastNames = [
  "Okafor", "Abubakar", "Adebayo", "Okonkwo", "Suleiman", "Ogunleye",
  "Eze", "Mohammed", "Nwachukwu", "Bello", "Ugwu", "Danjuma",
  "Adeyemi", "Okoro", "Yusuf", "Ibekwe", "Olawale", "Usman",
  "Nwosu", "Aliyu", "Ekwueme", "Ojo", "Ogundele", "Garba",
  "Maduabuchi", "Afolabi", "Onuoha", "Dikko", "Amadi", "Balogun",
  "Nkwocha", "Ogunbiyi", "Udeh", "Jega", "Chukwu", "Ogunsanya",
  "Nwafor", "Abdullahi", "Okafor", "Bamidele", "Okeke", "Sule",
  "Ogbu", "Kazeem", "Nnabuike", "Adegoke", "Ugwuanyi", "Adamu",
  "Obasi", "Akintola", "Ezeh", "Gombe", "Onwuka", "Salihu",
  "Onyema", "Adebisi"
];

const courses = {
  "100": "Introduction to Computer Science",
  "200": "Introduction to Programming",
};

const levelPrefix = { "100": "CSC", "200": "CPT" };

function generateMatricNumber(level, index) {
  const prefix = levelPrefix[level] || "CSC";
  return `${prefix}/${level}/${2024}/${String(index + 1).padStart(3, "0")}`;
}

function pickRandom(arr) {
  return arr[rand(0, arr.length - 1)];
}

function weightedGradeIndex() {
  const r = Math.random();
  if (r < 0.10) return rand(0, 1);      // F (0–39)
  if (r < 0.25) return rand(40, 44);    // E (40–44)
  if (r < 0.40) return rand(45, 49);    // D (45–49)
  if (r < 0.70) return rand(50, 59);    // C (50–59)
  if (r < 0.90) return rand(60, 69);    // B (60–69)
  return rand(70, 100);                  // A (70–100)
}

function generateScore() {
  const total = weightedGradeIndex();
  const assignment = rand(0, 10);
  const test = rand(0, 20);
  const exam = Math.max(0, Math.min(70, total - assignment - test));
  const actualTotal = assignment + test + exam;
  return { assignment, test, exam, total: actualTotal };
}

function generateStudentsForLevel(level, count) {
  const course = courses[level];
  const students = [];
  for (let i = 0; i < count; i++) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6) + String(i).padStart(4, "0");
    const name = `${pickRandom(firstNames)} ${pickRandom(lastNames)}`;
    const matric_number = generateMatricNumber(level, i);
    const { assignment, test, exam, total } = generateScore();
    students.push({
      id,
      name,
      matric_number,
      level,
      course,
      assignment,
      test,
      exam,
      total,
    });
  }
  return students;
}

export function seedStudents() {
  const l100 = generateStudentsForLevel("100", 50);
  const l200 = generateStudentsForLevel("200", 80);
  save([...l100, ...l200]);
  return { total: 130, l100: 50, l200: 80 };
}
