import {
  addDepartment,
  addStudent,
  addCourse,
  saveScore,
  getStudents,
  getCourses,
  checkMatricExists,
  checkCourseCodeExists,
  checkDepartmentExists,
} from "./db";

const departments = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "English",
  "Biology",
];

const students = [
  { name: "Sarah Mohammed", matric: "2022/1/12345", dept: "Computer Science", level: "500" },
  { name: "John Okafor", matric: "2023/1/23456", dept: "Computer Science", level: "300" },
  { name: "Amina Bello", matric: "2023/1/23457", dept: "Computer Science", level: "300" },
  { name: "Oluwaseun Adeyemi", matric: "2023/1/23458", dept: "Mathematics", level: "300" },
  { name: "Ibrahim Danjuma", matric: "2023/1/23459", dept: "Physics", level: "400" },
  { name: "Grace Osei", matric: "2023/1/23460", dept: "English", level: "300" },
  { name: "Peter Obi", matric: "2023/1/23461", dept: "Biology", level: "400" },
  { name: "Chidi Eze", matric: "2024/1/34567", dept: "Computer Science", level: "200" },
  { name: "Fatima Usman", matric: "2024/1/34568", dept: "Mathematics", level: "200" },
  { name: "Esther Mensah", matric: "2024/1/34569", dept: "Chemistry", level: "200" },
  { name: "Daniel Kofi", matric: "2024/1/34570", dept: "Biology", level: "200" },
  { name: "David Adeleke", matric: "2024/1/34571", dept: "Computer Science", level: "200" },
  { name: "Ngozi Okonkwo", matric: "2025/1/45678", dept: "Physics", level: "100" },
  { name: "Samuel Nyarko", matric: "2025/1/45679", dept: "Chemistry", level: "100" },
  { name: "Mercy Akpan", matric: "2025/1/45680", dept: "English", level: "100" },
];

const courses = [
  { name: "Intro to Programming", code: "CSC 101", cu: 3, sem: "First", sess: "2024/2025", dept: "Computer Science" },
  { name: "Discrete Mathematics", code: "CSC 103", cu: 3, sem: "First", sess: "2024/2025", dept: "Computer Science" },
  { name: "General Mathematics I", code: "MTH 101", cu: 3, sem: "First", sess: "2024/2025", dept: "Mathematics" },
  { name: "General Physics I", code: "PHY 101", cu: 3, sem: "First", sess: "2024/2025", dept: "Physics" },
  { name: "General Chemistry I", code: "CHM 101", cu: 2, sem: "First", sess: "2024/2025", dept: "Chemistry" },
  { name: "English Composition", code: "ENG 101", cu: 2, sem: "First", sess: "2024/2025", dept: "English" },
  { name: "Object-Oriented Programming", code: "CSC 102", cu: 3, sem: "Second", sess: "2024/2025", dept: "Computer Science" },
  { name: "General Mathematics II", code: "MTH 102", cu: 3, sem: "Second", sess: "2024/2025", dept: "Mathematics" },
  { name: "General Physics II", code: "PHY 102", cu: 3, sem: "Second", sess: "2024/2025", dept: "Physics" },
  { name: "General Biology", code: "BIO 101", cu: 2, sem: "Second", sess: "2024/2025", dept: "Biology" },
  { name: "Data Structures", code: "CSC 201", cu: 3, sem: "First", sess: "2023/2024", dept: "Computer Science" },
  { name: "Computer Organization", code: "CSC 203", cu: 3, sem: "First", sess: "2023/2024", dept: "Computer Science" },
  { name: "Linear Algebra", code: "MTH 201", cu: 3, sem: "First", sess: "2023/2024", dept: "Mathematics" },
  { name: "Algorithms", code: "CSC 202", cu: 3, sem: "Second", sess: "2023/2024", dept: "Computer Science" },
  { name: "Database Systems", code: "CSC 204", cu: 3, sem: "Second", sess: "2023/2024", dept: "Computer Science" },
];

const scores = [
  { s: "2023/1/23456", c: "CSC 101", sc: 72 },
  { s: "2023/1/23456", c: "CSC 103", sc: 65 },
  { s: "2023/1/23456", c: "MTH 101", sc: 58 },
  { s: "2023/1/23456", c: "PHY 101", sc: 71 },
  { s: "2023/1/23456", c: "CSC 102", sc: 68 },
  { s: "2023/1/23456", c: "MTH 102", sc: 55 },
  { s: "2023/1/23456", c: "CSC 201", sc: 80 },
  { s: "2023/1/23456", c: "CSC 203", sc: 74 },
  { s: "2023/1/23456", c: "CSC 202", sc: 78 },
  { s: "2023/1/23456", c: "CSC 204", sc: 82 },
  { s: "2023/1/23457", c: "CSC 101", sc: 85 },
  { s: "2023/1/23457", c: "CSC 103", sc: 70 },
  { s: "2023/1/23457", c: "MTH 101", sc: 62 },
  { s: "2023/1/23457", c: "PHY 101", sc: 45 },
  { s: "2023/1/23457", c: "CSC 102", sc: 90 },
  { s: "2023/1/23457", c: "MTH 102", sc: 48 },
  { s: "2023/1/23457", c: "CSC 201", sc: 76 },
  { s: "2023/1/23457", c: "CSC 203", sc: 88 },
  { s: "2023/1/23457", c: "CSC 202", sc: 72 },
  { s: "2023/1/23457", c: "CSC 204", sc: 91 },
  { s: "2024/1/34567", c: "CSC 101", sc: 56 },
  { s: "2024/1/34567", c: "CSC 103", sc: 60 },
  { s: "2024/1/34567", c: "MTH 101", sc: 42 },
  { s: "2024/1/34567", c: "ENG 101", sc: 75 },
  { s: "2024/1/34571", c: "CSC 101", sc: 88 },
  { s: "2024/1/34571", c: "CSC 103", sc: 79 },
  { s: "2024/1/34571", c: "MTH 101", sc: 81 },
  { s: "2024/1/34571", c: "ENG 101", sc: 67 },
  { s: "2024/1/34568", c: "MTH 101", sc: 73 },
  { s: "2024/1/34568", c: "PHY 101", sc: 54 },
  { s: "2024/1/34569", c: "CHM 101", sc: 77 },
  { s: "2024/1/34569", c: "MTH 101", sc: 63 },
  { s: "2025/1/45678", c: "PHY 101", sc: 70 },
  { s: "2025/1/45678", c: "MTH 101", sc: 66 },
  { s: "2025/1/45679", c: "CHM 101", sc: 82 },
  { s: "2025/1/45680", c: "ENG 101", sc: 91 },
];

export default function seedData() {
  let studentMap = {};
  let courseMap = {};

  function addIfMissing(checkFn, addFn, item, map, keyField) {
    return checkFn(item.key).then((exists) => {
      if (exists) {
        return Promise.resolve(null);
      }
      return addFn(item.data).then((result) => {
        if (result) {
          map[result[keyField]] = result.id;
        }
        return result;
      });
    });
  }

  function departmentAdds() {
    return departments.reduce(
      (chain, name) =>
        chain.then(() =>
          addIfMissing(
            (n) => checkDepartmentExists(n),
            (n) => addDepartment(n),
            { key: name, data: name },
            {},
            "name"
          )
        ),
      Promise.resolve()
    );
  }

  function studentAdds() {
    return students.reduce((chain, s) => {
      const matric = s.matric;
      return chain.then(() =>
        addIfMissing(
          (m) => checkMatricExists(m),
          (d) => addStudent(d),
          {
            key: matric,
            data: {
              name: s.name,
              matriculation_number: matric,
              department: s.dept,
              level: s.level,
            },
          },
          studentMap,
          "matriculation_number"
        )
      );
    }, Promise.resolve());
  }

  function courseAdds() {
    return courses.reduce((chain, c) => {
      const code = c.code;
      return chain.then(() =>
        addIfMissing(
          (co) => checkCourseCodeExists(co),
          (d) => addCourse(d),
          {
            key: code,
            data: {
              course_name: c.name,
              course_code: code,
              credit_unit: c.cu,
              semester: c.sem,
              session: c.sess,
              department: c.dept,
            },
          },
          courseMap,
          "course_code"
        )
      );
    }, Promise.resolve());
  }

  function scoreAdds() {
    return scores.reduce((chain, sc) => {
      const studentId = studentMap[sc.s];
      const courseId = courseMap[sc.c];
      if (!studentId || !courseId) return chain;
      return chain.then(() => saveScore({ student_id: studentId, course_id: courseId, score: sc.sc }));
    }, Promise.resolve());
  }

  function lookupExistingStudents() {
    return getStudents().then((existing) => {
      existing.forEach((s) => {
        studentMap[s.matriculation_number] = s.id;
      });
    });
  }

  function lookupExistingCourses() {
    return getCourses().then((existing) => {
      existing.forEach((c) => {
        courseMap[c.course_code] = c.id;
      });
    });
  }

  return (
    departmentAdds()
      .then(lookupExistingStudents)
      .then(studentAdds)
      .then(lookupExistingCourses)
      .then(courseAdds)
      .then(scoreAdds)
  );
}
