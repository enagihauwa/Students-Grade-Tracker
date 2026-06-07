import { useState, useEffect } from "react";
import EmptyState from "../components/EmptyState";

export default function Scores() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [scoreValue, setScoreValue] = useState("");
  const [message, setMessage] = useState(null);
  const [editingScoreId, setEditingScoreId] = useState(null);

  const fetchData = () => {
    Promise.all([
      fetch("/api/students").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
    ])
      .then(([studentsData, coursesData]) => {
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetch(`/api/scores/${selectedStudent}`)
        .then((r) => r.json())
        .then((d) => setScores(Array.isArray(d) ? d : []));
    } else {
      setScores([]);
    }
  }, [selectedStudent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedStudent) {
      setMessage({ type: "error", text: "Please select a student from the list." });
      return;
    }
    if (!selectedCourse) {
      setMessage({ type: "error", text: "Please select a course from the list." });
      return;
    }
    if (scoreValue === "") {
      setMessage({ type: "error", text: "Please enter a score between 0 and 100." });
      return;
    }

    const score = Number(scoreValue);
    if (isNaN(score) || score < 0 || score > 100) {
      setMessage({ type: "error", text: "Score must be between 0 and 100." });
      return;
    }

    fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: Number(selectedStudent),
        course_id: Number(selectedCourse),
        score,
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        return r.json();
      })
      .then((d) => {
        setMessage({
          type: "success",
          text: `Score saved: ${d.course_code} — ${score} (${d.grade})`,
        });
        setScoreValue("");
        setSelectedCourse("");
        setEditingScoreId(null);
        fetch(`/api/scores/${selectedStudent}`)
          .then((r) => r.json())
          .then((d) => setScores(Array.isArray(d) ? d : []));
      })
      .catch((err) => {
        if (err?.error) {
          setMessage({ type: "error", text: err.error });
        } else if (err instanceof TypeError) {
          setMessage({ type: "error", text: "Cannot connect to the server. Make sure the backend is running (cd server && npm start)." });
        } else {
          setMessage({ type: "error", text: "Failed to save score. Please try again." });
        }
      });
  };

  const startEdit = (sc) => {
    setSelectedCourse(String(sc.course_id));
    setScoreValue(String(sc.score));
    setEditingScoreId(sc.id);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setSelectedCourse("");
    setScoreValue("");
    setEditingScoreId(null);
  };

  const gradeColor = (grade) => {
    const colors = {
      A: "bg-green-100 text-green-800",
      B: "bg-blue-100 text-blue-800",
      C: "bg-yellow-100 text-yellow-800",
      D: "bg-orange-100 text-orange-800",
      E: "bg-red-100 text-red-800",
      F: "bg-red-200 text-red-900",
    };
    return colors[grade] || "bg-gray-100 text-gray-800";
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
        description={students.length === 0 ? "You need to add at least one student first." : "You need to add at least one course first."}
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Enter Scores</h1>
        <p className="text-navy-500 mt-1">Record scores for students across courses</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">Score (0–100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={scoreValue}
                onChange={(e) => {
                  setScoreValue(e.target.value);
                  setMessage(null);
                }}
                className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800"
                placeholder="Enter score..."
              />
            </div>
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
              className="px-6 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm"
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
                    <th className="px-4 py-3 font-semibold">Session</th>
                    <th className="px-4 py-3 font-semibold">Semester</th>
                    <th className="px-4 py-3 font-semibold">Course</th>
                    <th className="px-4 py-3 font-semibold">Code</th>
                    <th className="px-4 py-3 font-semibold text-center">CU</th>
                    <th className="px-4 py-3 font-semibold text-center">Score</th>
                    <th className="px-4 py-3 font-semibold text-center">Grade</th>
                    <th className="px-4 py-3 font-semibold text-center">GP</th>
                    <th className="px-4 py-3 font-semibold text-center w-20">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((sc) => (
                    <tr key={sc.id} className={`border-t border-navy-50 hover:bg-navy-50/50 transition-colors ${editingScoreId === sc.id ? "bg-navy-50" : ""}`}>
                      <td className="px-4 py-3 text-navy-600">{sc.session}</td>
                      <td className="px-4 py-3 text-navy-600">{sc.semester}</td>
                      <td className="px-4 py-3 font-medium text-navy-800">{sc.course_name}</td>
                      <td className="px-4 py-3 font-mono text-navy-600">{sc.course_code}</td>
                      <td className="px-4 py-3 text-center text-navy-600">{sc.credit_unit}</td>
                      <td className="px-4 py-3 text-center font-semibold text-navy-800">{sc.score}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(sc.grade)}`}>
                          {sc.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-navy-800">{sc.grade_point}</td>
                      <td className="px-4 py-3 text-center">
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
