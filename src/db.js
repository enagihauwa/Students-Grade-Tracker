function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("GradeTracker", 3);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("students")) {
        const store = db.createObjectStore("students", { keyPath: "id", autoIncrement: true });
        store.createIndex("name", "name", { unique: false });
        store.createIndex("matriculation_number", "matriculation_number", { unique: true });
      }
      if (!db.objectStoreNames.contains("courses")) {
        const store = db.createObjectStore("courses", { keyPath: "id", autoIncrement: true });
        store.createIndex("course_code", "course_code", { unique: true });
        store.createIndex("session", "session", { unique: false });
        store.createIndex("department", "department", { unique: false });
      } else if (e.oldVersion < 3) {
        const courseStore = request.transaction.objectStore("courses");
        if (!courseStore.indexNames.contains("department")) {
          courseStore.createIndex("department", "department", { unique: false });
        }
      }
      if (!db.objectStoreNames.contains("scores")) {
        const store = db.createObjectStore("scores", { keyPath: "id", autoIncrement: true });
        store.createIndex("student_id", "student_id", { unique: false });
        store.createIndex("course_id", "course_id", { unique: false });
        store.createIndex("student_course", ["student_id", "course_id"], { unique: true });
      }
      if (!db.objectStoreNames.contains("departments")) {
        const store = db.createObjectStore("departments", { keyPath: "id", autoIncrement: true });
        store.createIndex("name", "name", { unique: true });
      }
    };
  });
}

function getAll(storeName) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onerror = () => { db.close(); reject(request.error); };
      request.onsuccess = () => { db.close(); resolve(request.result); };
    });
  });
}

function getByIndex(storeName, indexName, value) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const index = tx.objectStore(storeName).index(indexName);
      const request = index.getAll(value);
      request.onerror = () => { db.close(); reject(request.error); };
      request.onsuccess = () => { db.close(); resolve(request.result); };
    });
  });
}

function getByCompositeIndex(storeName, indexName, values) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const index = tx.objectStore(storeName).index(indexName);
      const request = index.getAll(values);
      request.onerror = () => { db.close(); reject(request.error); };
      request.onsuccess = () => { db.close(); resolve(request.result); };
    });
  });
}

function addRecord(storeName, data) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const request = store.add({ ...data, created_at: new Date().toISOString() });
      request.onerror = () => { db.close(); reject(request.error); };
      request.onsuccess = () => {
        const newId = request.result;
        const getRequest = store.get(newId);
        getRequest.onerror = () => { db.close(); reject(getRequest.error); };
        getRequest.onsuccess = () => { db.close(); resolve(getRequest.result); };
      };
    });
  });
}

function updateRecord(storeName, id, data) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const getRequest = store.get(id);
      getRequest.onerror = () => { db.close(); reject(getRequest.error); };
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) { db.close(); reject(new Error("Not found")); return; }
        const updated = { ...existing, ...data, id };
        const putRequest = store.put(updated);
        putRequest.onerror = () => { db.close(); reject(putRequest.error); };
        putRequest.onsuccess = () => { db.close(); resolve(updated); };
      };
    });
  });
}

function deleteRecord(storeName, id) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      const request = store.delete(id);
      request.onerror = () => { db.close(); reject(request.error); };
      request.onsuccess = () => { db.close(); resolve(); };
    });
  });
}

function calculateGrade(score) {
  if (score >= 70) return { grade: "A", grade_point: 5 };
  if (score >= 60) return { grade: "B", grade_point: 4 };
  if (score >= 50) return { grade: "C", grade_point: 3 };
  if (score >= 45) return { grade: "D", grade_point: 2 };
  if (score >= 40) return { grade: "E", grade_point: 1 };
  return { grade: "F", grade_point: 0 };
}

export function getStudents(search) {
  if (search) {
    const q = search.toLowerCase();
    return getAll("students").then((students) =>
      students
        .filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.matriculation_number.toLowerCase().includes(q)
        )
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    );
  }
  return getAll("students").then((students) =>
    students.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  );
}

export function addStudent(data) {
  return addRecord("students", {
    name: data.name.trim(),
    matriculation_number: data.matriculation_number.trim(),
    department: data.department.trim(),
    level: data.level,
  });
}

export function updateStudent(id, data) {
  return updateRecord("students", id, {
    name: data.name.trim(),
    matriculation_number: data.matriculation_number.trim(),
    department: data.department.trim(),
    level: data.level,
  });
}

export function deleteStudent(id) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["students", "scores"], "readwrite");
      const scoreIndex = tx.objectStore("scores").index("student_id");
      const scoreRequest = scoreIndex.getAll(id);
      scoreRequest.onsuccess = () => {
        const scoreStore = tx.objectStore("scores");
        scoreRequest.result.forEach((s) => scoreStore.delete(s.id));
        tx.objectStore("students").delete(id);
      };
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  });
}

export function getCourses() {
  return getAll("courses").then((courses) =>
    courses.sort((a, b) => {
      if (a.session !== b.session) return b.session.localeCompare(a.session);
      return a.semester === "First" ? -1 : 1;
    })
  );
}

export function addCourse(data) {
  return addRecord("courses", {
    course_name: data.course_name.trim(),
    course_code: data.course_code.trim(),
    credit_unit: Number(data.credit_unit),
    semester: data.semester,
    session: data.session.trim(),
    department: data.department || "",
  });
}

export function updateCourse(id, data) {
  return updateRecord("courses", id, {
    course_name: data.course_name.trim(),
    course_code: data.course_code.trim(),
    credit_unit: Number(data.credit_unit),
    semester: data.semester,
    session: data.session.trim(),
    department: data.department || "",
  });
}

export function getDepartments() {
  return getAll("departments").then((departments) =>
    departments.sort((a, b) => a.name.localeCompare(b.name))
  );
}

export function addDepartment(name) {
  return addRecord("departments", { name: name.trim() });
}

export function updateDepartment(id, name) {
  return updateRecord("departments", id, { name: name.trim() });
}

export function deleteDepartment(id) {
  return deleteRecord("departments", id);
}

export function checkMatricExists(matric) {
  if (!matric.trim()) return Promise.resolve(false);
  return getByIndex("students", "matriculation_number", matric.trim()).then(
    (result) => result.length > 0
  );
}

export function deleteCourse(id) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(["courses", "scores"], "readwrite");
      const scoreIndex = tx.objectStore("scores").index("course_id");
      const scoreRequest = scoreIndex.getAll(id);
      scoreRequest.onsuccess = () => {
        const scoreStore = tx.objectStore("scores");
        scoreRequest.result.forEach((s) => scoreStore.delete(s.id));
        tx.objectStore("courses").delete(id);
      };
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  });
}

export function getScores(studentId) {
  return getByIndex("scores", "student_id", Number(studentId)).then((scores) =>
    getAll("courses").then((courses) => {
      const courseMap = {};
      courses.forEach((c) => { courseMap[c.id] = c; });
      return scores
        .map((s) => ({
          ...s,
          course_name: courseMap[s.course_id]?.course_name || "",
          course_code: courseMap[s.course_id]?.course_code || "",
          credit_unit: courseMap[s.course_id]?.credit_unit || 0,
          department: courseMap[s.course_id]?.department || "",
          semester: courseMap[s.course_id]?.semester || "",
          session: courseMap[s.course_id]?.session || "",
        }))
        .sort((a, b) => {
          if (a.session !== b.session) return b.session.localeCompare(a.session);
          if (a.semester !== b.semester) return a.semester === "First" ? -1 : 1;
          return (a.course_name || "").localeCompare(b.course_name || "");
        });
    })
  );
}

export function saveScore(data) {
  const parsedScore = Number(data.score);
  const { grade, grade_point } = calculateGrade(parsedScore);
  const studentId = Number(data.student_id);
  const courseId = Number(data.course_id);

  return getByCompositeIndex("scores", "student_course", [studentId, courseId]).then(
    (existing) => {
      if (existing.length > 0) {
        return openDb().then((db) => {
          return new Promise((resolve, reject) => {
            const tx = db.transaction("scores", "readwrite");
            const store = tx.objectStore("scores");
            const score = existing[0];
            score.score = parsedScore;
            score.grade = grade;
            score.grade_point = grade_point;
            store.put(score);
            tx.oncomplete = () => {
              const courseRequest = tx.objectStore("courses").get(courseId);
              courseRequest.onsuccess = () => {
                db.close();
                resolve({
                  ...score,
                  course_name: courseRequest.result?.course_name || "",
                  course_code: courseRequest.result?.course_code || "",
                  credit_unit: courseRequest.result?.credit_unit || 0,
                  semester: courseRequest.result?.semester || "",
                  session: courseRequest.result?.session || "",
                });
              };
            };
            tx.onerror = () => { db.close(); reject(tx.error); };
          });
        });
      } else {
        return addRecord("scores", {
          student_id: studentId,
          course_id: courseId,
          score: parsedScore,
          grade,
          grade_point,
        }).then((newScore) =>
          getCourses().then((courses) => {
            const c = courses.find((co) => co.id === courseId);
            return {
              ...newScore,
              course_name: c?.course_name || "",
              course_code: c?.course_code || "",
              credit_unit: c?.credit_unit || 0,
              semester: c?.semester || "",
              session: c?.session || "",
            };
          })
        );
      }
    }
  );
}

export function getGpa(studentId) {
  return getScores(studentId).then((scores) => {
    if (scores.length === 0) {
      return { gpa: 0, total_credit_units: 0, total_grade_points: 0 };
    }
    let totalGradePoints = 0;
    let totalCreditUnits = 0;
    scores.forEach((s) => {
      totalGradePoints += s.grade_point * s.credit_unit;
      totalCreditUnits += s.credit_unit;
    });
    const gpa = totalCreditUnits > 0 ? Number((totalGradePoints / totalCreditUnits).toFixed(2)) : 0;
    return { gpa, total_credit_units: totalCreditUnits, total_grade_points: totalGradePoints };
  });
}

export function getDashboard() {
  return Promise.all([
    getAll("students"),
    getAll("courses"),
    getAll("scores"),
  ]).then(([students, courses, scores]) => {
    const departmentMap = {};
    students.forEach((s) => {
      departmentMap[s.department] = (departmentMap[s.department] || 0) + 1;
    });
    const departmentCount = Object.entries(departmentMap)
      .map(([department, count]) => ({ department, count }))
      .sort((a, b) => b.count - a.count);

    const levelMap = {};
    students.forEach((s) => {
      levelMap[s.level] = (levelMap[s.level] || 0) + 1;
    });
    const levelDistribution = Object.entries(levelMap)
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => Number(a.level) - Number(b.level));

    const sessionMap = {};
    scores.forEach((s) => {
      const course = courses.find((c) => c.id === s.course_id);
      if (course) {
        const key = `${course.session}-${course.semester}`;
        sessionMap[key] = (sessionMap[key] || 0) + 1;
      }
    });
    const sessionBreakdown = Object.entries(sessionMap)
      .map(([key, score_count]) => {
        const [session, semester] = key.split("-");
        return { session, semester, score_count };
      })
      .sort((a, b) => b.session.localeCompare(a.session) || (a.semester === "First" ? -1 : 1));

    const recentStudents = students
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return {
      totalStudents: students.length,
      totalCourses: courses.length,
      totalScores: scores.length,
      departmentCount,
      levelDistribution,
      sessionBreakdown,
      recentStudents,
    };
  });
}
