import { useState, useEffect } from "react";
import { getCourses, addCourse, updateCourse, deleteCourse, clearCourses } from "../utils/storage";
import ConfirmModal from "./ConfirmModal";

const LEVELS = ["100", "200"];

export default function CourseTracker() {
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("100");
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState("");

  const refresh = () => setCourses(getCourses());

  useEffect(() => { refresh(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) { setError("Course name is required"); return; }
    addCourse(trimmed, level);
    setName("");
    refresh();
  };

  const handleDelete = (id) => {
    setCourses(deleteCourse(id));
  };

  const startEdit = (course) => {
    setEditingId(course.id);
    setEditName(course.name);
    setEditLevel(course.level || "100");
  };

  const saveEdit = (id) => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    setCourses(updateCourse(id, trimmed, editLevel));
    setEditingId(null);
    setEditName("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const byLevel = {};
  courses.forEach((c) => {
    const l = c.level || "Unassigned";
    if (!byLevel[l]) byLevel[l] = [];
    byLevel[l].push(c);
  });

  const sortedLevels = Object.keys(byLevel).sort();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-navy-800">Courses</h2>
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
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-3 py-2.5 border border-navy-200 rounded-lg bg-white text-navy-800 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500">
          {LEVELS.map((l) => <option key={l} value={l}>{l} Level</option>)}
        </select>
        <button type="submit" className="px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm whitespace-nowrap">
          Add Course
        </button>
      </form>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {courses.length === 0 ? (
        <div className="text-center py-8 text-navy-400 text-sm">
          No courses added yet. Enter a course name above.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLevels.map((l) => (
            <div key={l}>
              <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-2">{l} Level</p>
              <div className="space-y-2">
                {byLevel[l].map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-navy-100 bg-white">
                    {editingId === c.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text" value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(c.id)}
                          className="flex-1 px-2 py-1.5 border border-navy-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                          autoFocus
                        />
                        <select value={editLevel} onChange={(e) => setEditLevel(e.target.value)} className="px-2 py-1.5 border border-navy-200 rounded-lg bg-white text-navy-800 text-sm">
                          {LEVELS.map((lvl) => <option key={lvl} value={lvl}>{lvl} Level</option>)}
                        </select>
                        <button onClick={() => saveEdit(c.id)} className="text-green-600 hover:text-green-800 p-1" title="Save">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button onClick={cancelEdit} className="text-navy-400 hover:text-navy-600 p-1" title="Cancel">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-navy-100 text-navy-600 text-xs font-bold">{byLevel[l].length}</span>
                          <span className="font-medium text-sm text-navy-800 truncate">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-3">
                          <button onClick={() => startEdit(c)} className="text-navy-400 hover:text-navy-600 p-1" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="text-navy-400 hover:text-red-500 transition-colors" title="Remove">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
