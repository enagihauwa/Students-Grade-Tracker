import { useState, useEffect } from "react";
import { getCourses, addCourse, deleteCourse, clearCourses } from "../utils/storage";
import ConfirmModal from "./ConfirmModal";

const gradeColor = (score) => {
  if (score >= 70) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
  if (score >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  if (score >= 45) return "text-orange-600 bg-orange-50 border-orange-200";
  if (score >= 40) return "text-red-600 bg-red-50 border-red-200";
  return "text-red-700 bg-red-100 border-red-300";
};

const gradeLetter = (score) => {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
};

export default function CourseTracker() {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const refresh = () => setCourses(getCourses());

  useEffect(() => { refresh(); }, []);

  const total = courses.reduce((s, c) => s + c.score, 0);
  const average = courses.length > 0 ? (total / courses.length).toFixed(1) : 0;
  const maxScore = courses.length > 0 ? Math.max(...courses.map((c) => c.score)) : 0;
  const minScore = courses.length > 0 ? Math.min(...courses.map((c) => c.score)) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) { setError("Course name is required"); return; }
    const scoreNum = Number(score);
    if (score === "" || isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      setError("Score must be between 0 and 100"); return;
    }
    addCourse(trimmed, scoreNum);
    setName("");
    setScore("");
    refresh();
  };

  const handleDelete = (id) => {
    setCourses(deleteCourse(id));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-navy-800">Course Scores</h2>
        {courses.length > 0 && (
          <button onClick={() => setConfirmClear(true)} className="text-xs text-red-500 hover:text-red-700 font-medium">
            Clear All
          </button>
        )}
      </div>

      <ConfirmModal
        open={confirmClear}
        title="Clear All Courses?"
        message="This will permanently delete all course entries."
        confirmLabel="Clear All"
        onConfirm={() => { clearCourses(); refresh(); setConfirmClear(false); }}
        onCancel={() => setConfirmClear(false)}
        danger
      />

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <input
            type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Course name (e.g., Calculus)"
            className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800 text-sm"
          />
        </div>
        <div className="w-full sm:w-28">
          <input
            type="number" min="0" max="100" value={score} onChange={(e) => setScore(e.target.value)}
            placeholder="Score"
            className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800 text-sm"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm whitespace-nowrap">
          Add Course
        </button>
      </form>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {courses.length === 0 ? (
        <div className="text-center py-8 text-navy-400 text-sm">
          No courses added yet. Enter a course name and score above.
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-3 rounded-lg bg-navy-50 border border-navy-100">
              <p className="text-xs text-navy-500 font-medium">Courses</p>
              <p className="text-xl font-bold text-navy-800">{courses.length}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-navy-50 border border-navy-100">
              <p className="text-xs text-navy-500 font-medium">Average</p>
              <p className="text-xl font-bold text-navy-800">{average}%</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-navy-50 border border-navy-100">
              <p className="text-xs text-navy-500 font-medium">Grade</p>
              <p className="text-xl font-bold" style={average >= 70 ? {color: '#16a34a'} : average >= 60 ? {color: '#2563eb'} : average >= 50 ? {color: '#ca8a04'} : average >= 45 ? {color: '#ea580c'} : average >= 40 ? {color: '#dc2626'} : {color: '#991b1b'}}>{gradeLetter(Number(average))}</p>
            </div>
          </div>

          {/* Course list */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {[...courses].reverse().map((c) => (
              <div key={c.id} className={`flex items-center justify-between p-3 rounded-lg border ${gradeColor(c.score)}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${gradeColor(c.score).split(' ').slice(0,2).join(' ')}`}>
                    {gradeLetter(c.score)}
                  </span>
                  <span className="font-medium text-sm text-navy-800 truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-lg font-bold">{c.score}</span>
                  <button onClick={() => handleDelete(c.id)} className="text-navy-400 hover:text-red-500 transition-colors" title="Remove">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Grade scale reference */}
          <div className="mt-4 pt-4 border-t border-navy-100">
            <div className="grid grid-cols-6 gap-1 text-center text-[10px]">
              {[
                { grade: "A", range: "70–100", color: "bg-green-100 text-green-700" },
                { grade: "B", range: "60–69", color: "bg-blue-100 text-blue-700" },
                { grade: "C", range: "50–59", color: "bg-yellow-100 text-yellow-700" },
                { grade: "D", range: "45–49", color: "bg-orange-100 text-orange-700" },
                { grade: "E", range: "40–44", color: "bg-red-100 text-red-700" },
                { grade: "F", range: "0–39", color: "bg-red-200 text-red-800" },
              ].map((g) => (
                <div key={g.grade} className={`${g.color} rounded py-1 font-medium`}>
                  {g.grade}: {g.range}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
