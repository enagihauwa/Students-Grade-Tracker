import { useState, useEffect } from "react";
import EmptyState from "../components/EmptyState";
import { getCourses, getScoresByCourse } from "../db";

export default function CourseReport() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getCourses()
      .then((d) => {
        setCourses(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      setLoaded(false);
      getScoresByCourse(selectedCourse)
        .then((d) => {
          setScores(d);
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    } else {
      setScores([]);
      setLoaded(true);
    }
  }, [selectedCourse]);

  const gradeColor = (g) => {
    const colors = {
      A: "bg-green-100 text-green-800",
      B: "bg-blue-100 text-blue-800",
      C: "bg-yellow-100 text-yellow-800",
      D: "bg-orange-100 text-orange-800",
      E: "bg-red-100 text-red-800",
      F: "bg-red-200 text-red-900",
    };
    return colors[g] || "bg-gray-100 text-gray-800";
  };

  const course = courses.find((c) => c.id === Number(selectedCourse));
  const avg = (field) =>
    scores.length > 0 ? (scores.reduce((sum, s) => sum + (s[field] || 0), 0) / scores.length).toFixed(1) : "—";

  const gradeDist = {};
  scores.forEach((s) => {
    gradeDist[s.grade] = (gradeDist[s.grade] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-navy-200 border-t-navy-600" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        title="No Courses Yet"
        description="Add courses before viewing performance reports."
        action={
          <a href="/courses" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium">
            Add Courses
          </a>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Course Performance</h1>
        <p className="text-navy-500 mt-1">View assessment breakdown and averages per course</p>
      </div>

      <div className="no-print">
        <label className="block text-sm font-medium text-navy-700 mb-1">Select Course</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full max-w-md px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800 bg-white"
        >
          <option value="">Choose a course...</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.course_code} — {c.course_name}
            </option>
          ))}
        </select>
      </div>

      {selectedCourse && !loaded && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-navy-200 border-t-navy-600" />
        </div>
      )}

      {selectedCourse && loaded && scores.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-12 text-center">
          <h3 className="text-lg font-semibold text-navy-700 mb-2">No Scores Yet</h3>
          <p className="text-navy-500">
            No scores recorded for {course?.course_code}. Visit the Scores page to enter them.
          </p>
        </div>
      )}

      {selectedCourse && loaded && scores.length > 0 && course && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
            <div className="bg-navy-50 px-4 py-3 border-b border-navy-100">
              <h2 className="font-semibold text-navy-800">
                {course.course_code} — {course.course_name} ({course.credit_unit} CU)
              </h2>
              <p className="text-xs text-navy-500 mt-0.5">
                {course.session} | {course.semester} Semester | {course.department || "No department"} | {scores.length} student{scores.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-50 text-left text-navy-600">
                    <th className="px-3 py-2.5 font-semibold">#</th>
                    <th className="px-3 py-2.5 font-semibold">Student</th>
                    <th className="px-3 py-2.5 font-semibold">Matric</th>
                    <th className="px-3 py-2.5 font-semibold">Level</th>
                    <th className="px-3 py-2.5 font-semibold text-center">Assign</th>
                    <th className="px-3 py-2.5 font-semibold text-center">Test</th>
                    <th className="px-3 py-2.5 font-semibold text-center">Pract</th>
                    <th className="px-3 py-2.5 font-semibold text-center">Exam</th>
                    <th className="px-3 py-2.5 font-semibold text-center">Total</th>
                    <th className="px-3 py-2.5 font-semibold text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s, idx) => (
                    <tr key={s.id} className="border-t border-navy-50 hover:bg-navy-50/50 transition-colors">
                      <td className="px-3 py-2.5 text-navy-400">{idx + 1}</td>
                      <td className="px-3 py-2.5 font-medium text-navy-800">{s.student_name}</td>
                      <td className="px-3 py-2.5 font-mono text-navy-600">{s.matriculation_number}</td>
                      <td className="px-3 py-2.5 text-navy-600">{s.level}</td>
                      <td className="px-3 py-2.5 text-center text-navy-700">{s.assignment ?? "—"}</td>
                      <td className="px-3 py-2.5 text-center text-navy-700">{s.test ?? "—"}</td>
                      <td className="px-3 py-2.5 text-center text-navy-700">{s.practical ?? "—"}</td>
                      <td className="px-3 py-2.5 text-center text-navy-700">{s.exam ?? "—"}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-navy-800">{s.score}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(s.grade)}`}>
                          {s.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-navy-50 border-t-2 border-navy-200 font-semibold">
                    <td colSpan={4} className="px-3 py-2.5 text-right text-navy-700 text-xs uppercase tracking-wider">
                      Course Average
                    </td>
                    <td className="px-3 py-2.5 text-center text-navy-800">{avg("assignment")}</td>
                    <td className="px-3 py-2.5 text-center text-navy-800">{avg("test")}</td>
                    <td className="px-3 py-2.5 text-center text-navy-800">{avg("practical")}</td>
                    <td className="px-3 py-2.5 text-center text-navy-800">{avg("exam")}</td>
                    <td className="px-3 py-2.5 text-center text-navy-800">{avg("score")}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
            <h2 className="text-sm font-semibold text-navy-700 mb-3">Grade Distribution</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {["A", "B", "C", "D", "E", "F"].map((g) => (
                <div key={g} className={`${gradeColor(g)} rounded-lg p-3 text-center`}>
                  <div className="text-lg font-bold">{g}</div>
                  <div className="text-2xl font-bold mt-1">{gradeDist[g] || 0}</div>
                  <div className="text-xs opacity-75 mt-0.5">
                    {scores.length > 0 ? ((gradeDist[g] || 0) / scores.length * 100).toFixed(0) : 0}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!selectedCourse && (
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-100 mb-4">
            <svg className="w-8 h-8 text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-navy-700 mb-2">Select a Course</h3>
          <p className="text-navy-500">Choose a course from the dropdown to view its performance report.</p>
        </div>
      )}
    </div>
  );
}
