import { useState, useEffect } from "react";
import StudentForm from "../components/StudentForm";
import { getStudents, addStudent, updateStudent, deleteStudent, getCourses, addCourse } from "../utils/storage";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [levelFilter, setLevelFilter] = useState("all");
  const [showCoursePrompt, setShowCoursePrompt] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseLevel, setCourseLevel] = useState("100");
  const [pendingCourses, setPendingCourses] = useState([]);
  const [courseError, setCourseError] = useState("");

  const refresh = () => setStudents(getStudents());

  useEffect(() => { refresh(); }, []);

  const handleAddClick = () => {
    const courses = getCourses();
    if (courses.length === 0) {
      setShowCoursePrompt(true);
      setPendingCourses([]);
    } else {
      setEditing(null);
      setShowForm(true)
    }
  };

  const handleAddCourse = () => {
    const trimmed = courseName.trim();
    if (!trimmed) { setCourseError("Course name is required"); return; }
    setCourseError("");
    const updated = addCourse(trimmed, courseLevel);
    setPendingCourses([...pendingCourses, { name: trimmed, level: courseLevel }]);
    setCourseName("");
  };

  const handleProceedAfterCourses = () => {
    setShowCoursePrompt(false);
    setEditing(null);
    setShowForm(true);
  };

  const handleSubmit = (data) => {
    if (editing) {
      updateStudent(editing.id, data);
    } else {
      addStudent(data);
    }
    setShowForm(false);
    setEditing(null);
    refresh();
  };

  const handleDelete = (s) => {
    if (window.confirm(`Delete ${s.name}?`)) {
      deleteStudent(s.id);
      refresh();
    }
  };

  const lvl100 = students.filter((s) => Number(s.level) === 100);
  const lvl200 = students.filter((s) => Number(s.level) === 200);
  const filtered = levelFilter === "all" ? students : students.filter((s) => s.level === levelFilter);

  function StudentTable({ list, level, color }) {
    if (list.length === 0) return null;
    return (
      <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
        <div className={`px-4 py-3 font-semibold text-sm flex items-center justify-between ${color}`}>
          <span>{level} Level</span>
          <span className="font-normal opacity-75">{list.length} student{list.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy-50 text-left text-navy-600">
                <th className="px-4 py-3 font-semibold">S/N</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Matric No</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => (
                <tr key={s.id} className="border-t border-navy-50 hover:bg-navy-50/50">
                  <td className="px-4 py-3 text-navy-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-navy-800">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-navy-600">{s.matric_number}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(s); setShowForm(true); }} className="text-navy-500 hover:text-navy-700 p-1.5 rounded-lg hover:bg-navy-50" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(s)} className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Students</h1>
          <p className="text-navy-500 mt-1">Manage student records</p>
        </div>
        <button onClick={handleAddClick} className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Student
        </button>
      </div>

      {students.length > 0 && (
        <div className="flex flex-wrap gap-3 text-sm">
          {[
            { key: "all", label: `All Levels`, count: students.length, color: "bg-gold-500", activeColor: "bg-gold-500" },
            { key: "100", label: "100 Level", count: lvl100.length, color: "bg-navy-600", activeColor: "bg-navy-600" },
            { key: "200", label: "200 Level", count: lvl200.length, color: "bg-navy-800", activeColor: "bg-navy-800" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setLevelFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full font-medium transition-all ${levelFilter === tab.key
                  ? `${tab.activeColor} text-white ring-2 ring-offset-1 ring-navy-300`
                  : `${tab.color}/20 text-navy-600 hover:${tab.color}/30`
                }`}
            >
              {tab.label}: {tab.count}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-navy-800">{editing ? "Edit Student" : "Register New Student"}</h2>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-navy-400 hover:text-navy-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <StudentForm
                key={editing?.id || "new"}
                initial={editing ? { name: editing.name, matric_number: editing.matric_number, level: String(editing.level), course: editing.course || "" } : null}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Course Registration Prompt */}
      {showCoursePrompt && (
        <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto" onClick={() => setShowCoursePrompt(false)}>
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-navy-800">Courses Required</h2>
                    <p className="text-sm text-navy-500">Register a course before adding students</p>
                  </div>
                </div>
                <button onClick={() => setShowCoursePrompt(false)} className="text-navy-400 hover:text-navy-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                <p className="text-sm text-amber-800">
                  No courses have been registered yet. Please add at least one course before registering a student.
                </p>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Course Name</label>
                  <input
                    type="text" value={courseName}
                    onChange={(e) => { setCourseName(e.target.value); setCourseError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCourse())}
                    className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800"
                    placeholder="e.g., Calculus"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Level</label>
                  <select value={courseLevel} onChange={(e) => setCourseLevel(e.target.value)} className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800 bg-white">
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                  </select>
                </div>
                {courseError && <p className="text-sm text-red-600">{courseError}</p>}
                <button onClick={handleAddCourse} className="w-full px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Course
                </button>
              </div>

              {pendingCourses.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-2">Added Courses</p>
                  <div className="space-y-1.5">
                    {pendingCourses.map((pc, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                        <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium text-navy-800">{pc.name}</span>
                        <span className="text-xs text-navy-500">({pc.level} Level)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowCoursePrompt(false)} className="flex-1 px-4 py-2.5 border border-navy-200 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors font-medium text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleProceedAfterCourses}
                  disabled={pendingCourses.length === 0}
                  className="flex-1 px-4 py-2.5 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-400 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Proceed to Student
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {students.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-navy-100">
          <div className="text-center py-16 text-navy-500">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-100 mb-4">
              <svg className="w-8 h-8 text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <p className="font-semibold text-navy-700 mb-1">No Students Yet</p>
            <p className="text-sm">Click "Add Student" to register the first one.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {levelFilter === "all" ? (
            <>
              {lvl100.length > 0 && <StudentTable list={lvl100} level="100" color="bg-navy-600 text-white" />}
              {lvl200.length > 0 && <StudentTable list={lvl200} level="200" color="bg-navy-800 text-white" />}
            </>
          ) : (
            <StudentTable
              list={filtered}
              level={levelFilter}
              color={levelFilter === "100" ? "bg-navy-600 text-white" : "bg-navy-800 text-white"}
            />
          )}
        </div>
      )}
    </div>
  );
}
