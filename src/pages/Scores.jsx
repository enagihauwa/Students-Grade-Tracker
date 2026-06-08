import { useState, useEffect } from "react";
import StudentTable from "../components/StudentTable";
import ScoreForm from "../components/ScoreForm";
import { getStudents, updateScores } from "../utils/storage";

export default function Scores() {
  const [students, setStudents] = useState([]);
  const [courseFilter, setCourseFilter] = useState("all");
  const [scoringStudent, setScoringStudent] = useState(null);
  const [message, setMessage] = useState(null);

  const refresh = () => setStudents(getStudents());

  useEffect(() => { refresh(); }, []);

  const allCourses = [...new Set(students.map((s) => s.course))].sort();
  const filtered = courseFilter === "all" ? students : students.filter((s) => s.course === courseFilter);

  const handleSaveScores = ({ assignment, test, exam }) => {
    try {
      updateScores(scoringStudent.id, { assignment, test, exam });
      setMessage({ type: "success", text: `Scores saved for ${scoringStudent.name}` });
      setScoringStudent(null);
      refresh();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Score Entry</h1>
        <p className="text-navy-500 mt-1">Enter and update student assessment scores</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border text-sm ${message.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {/* Score Form Modal */}
      {scoringStudent && (
        <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto" onClick={() => setScoringStudent(null)}>
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-navy-800">Enter Scores</h2>
                <button onClick={() => setScoringStudent(null)} className="text-navy-400 hover:text-navy-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ScoreForm student={scoringStudent} onSubmit={handleSaveScores} onCancel={() => setScoringStudent(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-navy-700">Course:</label>
          <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="px-3 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800 bg-white text-sm">
            <option value="all">All Courses</option>
            {allCourses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="text-sm text-navy-500 self-center ml-auto">
          {filtered.length} student{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Students Table with inline edit button */}
      <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
        <StudentTable students={filtered} onScoreEdit={setScoringStudent} />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
        <h2 className="text-sm font-semibold text-navy-700 mb-3">Nigerian University Grading Scale</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { grade: "A", range: "70–100", gp: "5.0", color: "bg-green-100 text-green-800" },
            { grade: "B", range: "60–69", gp: "4.0", color: "bg-blue-100 text-blue-800" },
            { grade: "C", range: "50–59", gp: "3.0", color: "bg-yellow-100 text-yellow-800" },
            { grade: "D", range: "45–49", gp: "2.0", color: "bg-orange-100 text-orange-800" },
            { grade: "E", range: "40–44", gp: "1.0", color: "bg-red-100 text-red-800" },
            { grade: "F", range: "0–39", gp: "0.0", color: "bg-red-200 text-red-900" },
          ].map((g) => (
            <div key={g.grade} className={`${g.color} rounded-lg p-3 text-center`}>
              <div className="text-lg font-bold">{g.grade}</div>
              <div className="text-xs opacity-75">{g.range}</div>
              <div className="text-xs font-medium mt-0.5">{g.gp} point{g.gp !== "1.0" ? "s" : ""}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
