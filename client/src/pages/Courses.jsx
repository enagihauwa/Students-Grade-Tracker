import { useState, useEffect } from "react";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [form, setForm] = useState({
    course_name: "",
    course_code: "",
    credit_unit: "3",
    semester: "First",
    session: "",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadError, setLoadError] = useState("");

  const fetchCourses = () => {
    setLoadError("");
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => {
        setCourses(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setLoadError("Could not load courses. Is the backend server running?");
      });
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openAddForm = () => {
    setEditingCourse(null);
    setForm({ course_name: "", course_code: "", credit_unit: "3", semester: "First", session: "" });
    setError("");
    setFieldErrors({});
    setShowForm(true);
  };

  const openEditForm = (c) => {
    setEditingCourse(c);
    setForm({
      course_name: c.course_name,
      course_code: c.course_code,
      credit_unit: String(c.credit_unit),
      semester: c.semester,
      session: c.session,
    });
    setError("");
    setFieldErrors({});
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    const errors = {};
    if (!form.course_name.trim()) errors.course_name = "Course name is required";
    if (!form.course_code.trim()) errors.course_code = "Course code is required";
    if (!form.session.trim()) errors.session = "Academic session is required";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const url = editingCourse ? `/api/courses/${editingCourse.id}` : "/api/courses";
    const method = editingCourse ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(d));
        return r.json();
      })
      .then(() => {
        setForm({ course_name: "", course_code: "", credit_unit: "3", semester: "First", session: "" });
        setShowForm(false);
        setEditingCourse(null);
        fetchCourses();
      })
      .catch((err) => {
        if (err?.error) {
          setError(err.error);
        } else if (err instanceof TypeError) {
          setError("Cannot connect to the server. Make sure the backend is running (cd server && npm start).");
        } else {
          setError("Failed to save course. Please check your connection and try again.");
        }
      });
  };

  const handleDelete = () => {
    if (!deletingCourse) return;
    fetch(`/api/courses/${deletingCourse.id}`, { method: "DELETE" })
      .then((r) => {
        if (!r.ok) return Promise.reject();
        setDeletingCourse(null);
        fetchCourses();
      })
      .catch(() => {
        setDeletingCourse(null);
        setError("Failed to delete course. Please try again.");
      });
  };

  const grouped = courses.reduce((acc, c) => {
    const key = `${c.session} - ${c.semester} Semester`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(c);
    return acc;
  }, {});

  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-navy-200 border-t-navy-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Courses</h1>
          <p className="text-navy-500 mt-1">Manage courses across semesters and sessions</p>
        </div>
        {courses.length > 0 && (
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Course
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => { setShowForm(false); setEditingCourse(null); }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-navy-800">
                {editingCourse ? "Edit Course" : "Add New Course"}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingCourse(null); }} className="text-navy-400 hover:text-navy-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Course Name</label>
                <input
                  type="text"
                  value={form.course_name}
                  onChange={(e) => { setForm({ ...form, course_name: e.target.value }); setFieldErrors((prev) => ({ ...prev, course_name: "" })); }}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800 ${fieldErrors.course_name ? "border-red-400 bg-red-50" : "border-navy-200"}`}
                  placeholder="e.g., Introduction to Programming"
                />
                {fieldErrors.course_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.course_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Course Code</label>
                <input
                  type="text"
                  value={form.course_code}
                  onChange={(e) => { setForm({ ...form, course_code: e.target.value }); setFieldErrors((prev) => ({ ...prev, course_code: "" })); }}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800 ${fieldErrors.course_code ? "border-red-400 bg-red-50" : "border-navy-200"}`}
                  placeholder="e.g., CSC 101"
                />
                {fieldErrors.course_code && <p className="text-red-500 text-xs mt-1">{fieldErrors.course_code}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Credit Unit</label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={form.credit_unit}
                  onChange={(e) => setForm({ ...form, credit_unit: e.target.value })}
                  className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Semester</label>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800 bg-white"
                >
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Academic Session</label>
                <input
                  type="text"
                  value={form.session}
                  onChange={(e) => { setForm({ ...form, session: e.target.value }); setFieldErrors((prev) => ({ ...prev, session: "" })); }}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800 ${fieldErrors.session ? "border-red-400 bg-red-50" : "border-navy-200"}`}
                  placeholder="e.g., 2024/2025"
                />
                {fieldErrors.session && <p className="text-red-500 text-xs mt-1">{fieldErrors.session}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium"
                >
                  {editingCourse ? "Update Course" : "Add Course"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingCourse(null); }}
                  className="px-4 py-2.5 border border-navy-200 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {courses.length === 0 && !showForm ? (
        <EmptyState
          icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          title="No Courses Yet"
          description="Add courses for each semester and academic session."
          action={
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add First Course
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {loadError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{loadError}</div>
          )}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          {sortedKeys.map((key) => (
            <div key={key} className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
              <div className="bg-navy-700 px-4 py-3">
                <h2 className="text-white font-semibold text-sm">{key}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-navy-50 text-left text-navy-600">
                      <th className="px-4 py-3 font-semibold">Course Code</th>
                      <th className="px-4 py-3 font-semibold">Course Name</th>
                      <th className="px-4 py-3 font-semibold text-center">Credit Unit</th>
                      <th className="px-4 py-3 font-semibold text-right w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[key].map((c) => (
                      <tr key={c.id} className="border-t border-navy-50 hover:bg-navy-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-navy-800">{c.course_code}</td>
                        <td className="px-4 py-3 text-navy-700">{c.course_name}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="bg-navy-100 text-navy-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            {c.credit_unit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditForm(c)}
                              className="text-navy-500 hover:text-navy-700 transition-colors p-1.5 rounded-lg hover:bg-navy-50"
                              title="Edit course"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeletingCourse(c)}
                              className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                              title="Delete course"
                            >
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
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deletingCourse}
        title="Delete Course"
        message={`Are you sure you want to delete ${deletingCourse?.course_code} — ${deletingCourse?.course_name}? This will also remove all associated scores.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingCourse(null)}
      />
    </div>
  );
}
