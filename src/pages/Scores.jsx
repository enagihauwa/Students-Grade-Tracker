import { useState, useEffect } from "react";
import EmptyState from "../components/EmptyState";
import { getStudents, getCourses, getScores, saveScore } from "../db";

const INITIAL = { assignment: "", test: "", practical: "", exam: "" };

function calculateGrade(score) {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}

export default function Scores() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [components, setComponents] = useState({ ...INITIAL });
  const [message, setMessage] = useState(null);
  const [editingScoreId, setEditingScoreId] = useState(null);

  const total = Object.values(components).reduce((s, v) => s + (Number(v) || 0), 0);
  const grade = total > 0 ? calculateGrade(total) : "—";

  const fetchData = () => {
    Promise.all([getStudents(), getCourses()])
      .then(([studentsData, coursesData]) => {
        setStudents(studentsData);
        setCourses(coursesData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedStudent) {
      getScores(selectedStudent).then((d) => setScores(d));
    } else {
      setScores([]);
    }
  }, [selectedStudent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedStudent) {
      setMessage({ type: "error", text: "Please select a student." });
      return;
    }
    if (!selectedCourse) {
      setMessage({ type: "error", text: "Please select a course." });
      return;
    }

    const vals = {};
    let hasAny = false;
    for (const key of Object.keys(components)) {
      const v = components[key];
      if (v !== "") {
        const n = Number(v);
        if (isNaN(n) || n < 0 || n > 100) {
          setMessage({ type: "error", text: `Invalid ${key}. Must be 0–100.` });
          return;
        }
        vals[key] = n;
        hasAny = true;
      } else {
        vals[key] = 0;
      }
    }

    if (!hasAny) {
      setMessage({ type: "error", text: "Enter at least one score component." });
      return;
    }

    saveScore({
      student_id: Number(selectedStudent),
      course_id: Number(selectedCourse),
      ...vals,
    })
      .then((d) => {
        setMessage({
          type: "success",
          text: `Saved: ${d.course_code} — Total ${d.score} (${d.grade})`,
        });
        setComponents({ ...INITIAL });
        setSelectedCourse("");
        setEditingScoreId(null);
        getScores(selectedStudent).then((d) => setScores(d));
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to save score." });
      });
  };

  const startEdit = (sc) => {
    setSelectedCourse(String(sc.course_id));
    setComponents({
      assignment: sc.assignment !== undefined ? String(sc.assignment) : "",
      test: sc.test !== undefined ? String(sc.test) : "",
      practical: sc.practical !== undefined ? String(sc.practical) : "",
      exam: sc.exam !== undefined ? String(sc.exam) : "",
    });
    setEditingScoreId(sc.id);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setSelectedCourse("");
    setComponents({ ...INITIAL });
    setEditingScoreId(null);
  };

  const handleComponentChange = (key, value) => {
    setComponents((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-navy-200 border-t-navy-600" />
      </div>
    );
  }

  if (students.length === 0 || courses.length === 0) {
    return (
      <EmptyState
        icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        title="Cannot Enter Scores Yet"
        description={students.length === 0 ? "Add at least one student first." : "Add at least one course first."}
        action={
          <a
            href={students.length === 0 ? "/students" : "/courses"}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium"
          >
            {students.length === 0 ? "Go to Students" : "Go to Courses"}
          </a>
        }
      />
    );
  }

  const compFields = [
    { key: "assignment", label: "Assignment", max: 10 },
    { key: "test", label: "Test", max: 20 },
    { key: "practical", label: "Practical", max: 20 },
    { key: "exam", label: "Exam", max: 50 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Enter Scores</h1>
        <p className="text-navy-500 mt-1">Record assessment scores for students</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg border text-sm ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(e.target.value);
                  setMessage(null);
                  cancelEdit();
                }}
                className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800 bg-white"
              >
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.matriculation_number}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setMessage(null);
                }}
                className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800 bg-white"
              >
                <option value="">Select a course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course_code} — {c.course_name} ({c.credit_unit} CU)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {compFields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-navy-700 mb-1">
                  {f.label} <span className="text-navy-400">(max {f.max})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={f.max}
                  value={components[f.key]}
                  onChange={(e) => handleComponentChange(f.key, e.target.value)}
                  className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-navy-600">
              Total: <strong className="text-navy-800 text-base">{total}</strong>
            </span>
            {total > 0 && (
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(grade)}`}>
                {grade}
              </span>
            )}
            {total > 100 && (
              <span className="text-red-600 text-xs font-medium">Total exceeds 100!</span>
            )}
          </div>

          <div className="flex justify-end gap-2">
            {editingScoreId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2.5 border border-navy-200 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors font-medium text-sm"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              disabled={total > 100}
              className="px-6 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors font-medium text-sm"
            >
              {editingScoreId ? "Update Score" : "Save Score"}
            </button>
          </div>
        </form>
      </div>

      {selectedStudent && (
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
          <div className="bg-navy-50 px-4 py-3 border-b border-navy-100">
            <h2 className="font-semibold text-navy-800">
              Scores for {students.find((s) => s.id === Number(selectedStudent))?.name || "Selected Student"}
            </h2>
          </div>
          {scores.length === 0 ? (
            <div className="p-8 text-center text-navy-500">
              <p>No scores recorded yet for this student.</p>
              <p className="text-sm mt-1">Use the form above to enter scores.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-50 text-left text-navy-600">
                    <th className="px-3 py-3 font-semibold">Session</th>
                    <th className="px-3 py-3 font-semibold">Sem</th>
                    <th className="px-3 py-3 font-semibold">Course</th>
                    <th className="px-3 py-3 font-semibold text-center">Assign</th>
                    <th className="px-3 py-3 font-semibold text-center">Test</th>
                    <th className="px-3 py-3 font-semibold text-center">Pract</th>
                    <th className="px-3 py-3 font-semibold text-center">Exam</th>
                    <th className="px-3 py-3 font-semibold text-center">Total</th>
                    <th className="px-3 py-3 font-semibold text-center">Grade</th>
                    <th className="px-3 py-3 font-semibold text-center w-20">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((sc) => (
                    <tr key={sc.id} className={`border-t border-navy-50 hover:bg-navy-50/50 transition-colors ${editingScoreId === sc.id ? "bg-navy-50" : ""}`}>
                      <td className="px-3 py-3 text-navy-600 whitespace-nowrap">{sc.session}</td>
                      <td className="px-3 py-3 text-navy-600">{sc.semester}</td>
                      <td className="px-3 py-3 font-medium text-navy-800 whitespace-nowrap">{sc.course_code}</td>
                      <td className="px-3 py-3 text-center text-navy-700">{sc.assignment ?? "—"}</td>
                      <td className="px-3 py-3 text-center text-navy-700">{sc.test ?? "—"}</td>
                      <td className="px-3 py-3 text-center text-navy-700">{sc.practical ?? "—"}</td>
                      <td className="px-3 py-3 text-center text-navy-700">{sc.exam ?? "—"}</td>
                      <td className="px-3 py-3 text-center font-semibold text-navy-800">{sc.score}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(sc.grade)}`}>
                          {sc.grade}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => startEdit(sc)}
                          className="text-navy-500 hover:text-navy-700 transition-colors p-1.5 rounded-lg hover:bg-navy-100"
                          title="Edit score"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
        <h2 className="text-sm font-semibold text-navy-700 mb-3">Nigerian University Grading Scale</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { grade: "A", range: "70–100", gp: "5", color: "bg-green-100 text-green-800" },
            { grade: "B", range: "60–69", gp: "4", color: "bg-blue-100 text-blue-800" },
            { grade: "C", range: "50–59", gp: "3", color: "bg-yellow-100 text-yellow-800" },
            { grade: "D", range: "45–49", gp: "2", color: "bg-orange-100 text-orange-800" },
            { grade: "E", range: "40–44", gp: "1", color: "bg-red-100 text-red-800" },
            { grade: "F", range: "0–39", gp: "0", color: "bg-red-200 text-red-900" },
          ].map((g) => (
            <div key={g.grade} className={`${g.color} rounded-lg p-3 text-center`}>
              <div className="text-lg font-bold">{g.grade}</div>
              <div className="text-xs opacity-75">{g.range}</div>
              <div className="text-xs font-medium mt-0.5">{g.gp} point{g.gp !== "1" ? "s" : ""}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
