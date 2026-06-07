import { useState, useEffect, useMemo, useRef } from "react";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";
import { getStudents, addStudent, updateStudent, deleteStudent, getDepartments, checkMatricExists } from "../db";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    matriculation_number: "",
    department: "",
    level: "100",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [sortColumn, setSortColumn] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("asc");
  const [departments, setDepartments] = useState([]);
  const [matricStatus, setMatricStatus] = useState(null);
  const matricTimer = useRef(null);

  const sortedStudents = useMemo(() => {
    const sorted = [...students];
    sorted.sort((a, b) => {
      let valA, valB;
      switch (sortColumn) {
        case "name":
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case "matriculation_number":
          valA = a.matriculation_number.toLowerCase();
          valB = b.matriculation_number.toLowerCase();
          break;
        case "department":
          valA = a.department.toLowerCase();
          valB = b.department.toLowerCase();
          break;
        case "level":
          valA = Number(a.level);
          valB = Number(b.level);
          break;
        default:
          valA = new Date(a.created_at);
          valB = new Date(b.created_at);
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [students, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) {
      return (
        <svg className="w-3 h-3 inline-block ml-1 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return (
      <svg className="w-3 h-3 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {sortDirection === "asc" ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        )}
      </svg>
    );
  };

  const fetchStudents = () => {
    getStudents(search || undefined)
      .then((d) => {
        setStudents(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, [search]);

  useEffect(() => {
    getDepartments().then(setDepartments);
  }, []);

  const handleMatricChange = (value) => {
    setForm((prev) => ({ ...prev, matriculation_number: value }));
    setFieldErrors((prev) => ({ ...prev, matriculation_number: "" }));
    setMatricStatus(null);
    if (matricTimer.current) clearTimeout(matricTimer.current);
    if (!value.trim()) return;
    if (editingStudent && value.trim() === editingStudent.matriculation_number) {
      setMatricStatus("same");
      return;
    }
    matricTimer.current = setTimeout(() => {
      checkMatricExists(value).then((exists) => {
        setMatricStatus(exists ? "exists" : "available");
      });
    }, 500);
  };

  const openAddForm = () => {
    setEditingStudent(null);
    setForm({ name: "", matriculation_number: "", department: departments.length > 0 ? departments[0].name : "", level: "100" });
    setError("");
    setFieldErrors({});
    setMatricStatus(null);
    setShowForm(true);
  };

  const openEditForm = (s) => {
    setEditingStudent(s);
    setForm({
      name: s.name,
      matriculation_number: s.matriculation_number,
      department: s.department,
      level: s.level,
    });
    setError("");
    setFieldErrors({});
    setMatricStatus(null);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    const errors = {};
    if (!form.name.trim()) errors.name = "Full name is required";
    if (!form.matriculation_number.trim()) errors.matriculation_number = "Matriculation number is required";
    if (!form.department.trim()) errors.department = "Department is required";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    if (matricStatus === "exists") {
      setError("Matriculation number already exists");
      return;
    }

    const action = editingStudent
      ? updateStudent(editingStudent.id, form)
      : addStudent(form);

    action
      .then(() => {
        setForm({ name: "", matriculation_number: "", department: departments.length > 0 ? departments[0].name : "", level: "100" });
        setShowForm(false);
        setEditingStudent(null);
        setMatricStatus(null);
        fetchStudents();
      })
      .catch((err) => {
        if (err?.message?.includes("key already exists")) {
          setError("Matriculation number already exists");
        } else {
          setError("Failed to save student.");
        }
      });
  };

  const handleDelete = () => {
    if (!deletingStudent) return;
    deleteStudent(deletingStudent.id)
      .then(() => {
        setDeletingStudent(null);
        fetchStudents();
      })
      .catch(() => {
        setDeletingStudent(null);
        setError("Failed to delete student.");
      });
  };

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
          <h1 className="text-2xl font-bold text-navy-900">Students</h1>
          <p className="text-navy-500 mt-1">Manage all registered students</p>
        </div>
        {students.length > 0 && (
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto" onClick={() => { setShowForm(false); setEditingStudent(null); }}>
          <div className="min-h-full flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-navy-800">
                {editingStudent ? "Edit Student" : "Register New Student"}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingStudent(null); }} className="text-navy-400 hover:text-navy-600">
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
                <label className="block text-sm font-medium text-navy-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); setFieldErrors((prev) => ({ ...prev, name: "" })); }}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800 ${fieldErrors.name ? "border-red-400 bg-red-50" : "border-navy-200"}`}
                  placeholder="e.g., John Okafor"
                />
                {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Matriculation Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.matriculation_number}
                    onChange={(e) => handleMatricChange(e.target.value)}
                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800 pr-10 ${fieldErrors.matriculation_number ? "border-red-400 bg-red-50" : "border-navy-200"}`}
                    placeholder="e.g., 2023/1/12345"
                  />
                  {matricStatus === "available" && (
                    <svg className="absolute right-3 top-3 w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {matricStatus === "exists" && (
                    <svg className="absolute right-3 top-3 w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                {matricStatus === "exists" && (
                  <p className="text-red-500 text-xs mt-1">This matriculation number is already in use</p>
                )}
                {fieldErrors.matriculation_number && <p className="text-red-500 text-xs mt-1">{fieldErrors.matriculation_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => { setForm({ ...form, department: e.target.value }); setFieldErrors((prev) => ({ ...prev, department: "" })); }}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800 bg-white ${fieldErrors.department ? "border-red-400 bg-red-50" : "border-navy-200"}`}
                >
                  <option value="">Select a department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
                {fieldErrors.department && <p className="text-red-500 text-xs mt-1">{fieldErrors.department}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">Level</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800 bg-white"
                >
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium"
                >
                  {editingStudent ? "Update Student" : "Register Student"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingStudent(null); }}
                  className="px-4 py-2.5 border border-navy-200 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}

      {students.length === 0 && !showForm ? (
        <EmptyState
          icon="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          title="No Students Yet"
          description="Register your first student to get started with grade tracking."
          action={
            <button
              onClick={openAddForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Register First Student
            </button>
          }
        />
      ) : (
        <>
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <div className="relative">
            <svg className="absolute left-3 top-3.5 w-4 h-4 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or matriculation number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-50 text-left text-navy-600">
                    <th className="px-4 py-3 font-semibold w-10">S/N</th>
                    {[
                      { key: "name", label: "Name" },
                      { key: "matriculation_number", label: "Matric No." },
                      { key: "department", label: "Department" },
                      { key: "level", label: "Level" },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        className="px-4 py-3 font-semibold cursor-pointer select-none hover:text-navy-800 transition-colors"
                        onClick={() => handleSort(key)}
                      >
                        {label}
                        <SortIcon column={key} />
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map((s, i) => (
                    <tr key={s.id} className="border-t border-navy-50 hover:bg-navy-50/50 transition-colors">
                      <td className="px-4 py-3 text-navy-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-navy-800">{s.name}</td>
                      <td className="px-4 py-3 text-navy-600">{s.matriculation_number}</td>
                      <td className="px-4 py-3 text-navy-600">{s.department}</td>
                      <td className="px-4 py-3">
                        <span className="bg-navy-100 text-navy-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                          {s.level}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditForm(s)}
                            className="text-navy-500 hover:text-navy-700 transition-colors p-1.5 rounded-lg hover:bg-navy-50"
                            title="Edit student"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingStudent(s)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                            title="Delete student"
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
            <div className="px-4 py-3 bg-navy-50 text-sm text-navy-500 border-t border-navy-100">
              Showing {students.length} student{students.length !== 1 ? "s" : ""}
              {search && " matching your search"}
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        open={!!deletingStudent}
        title="Delete Student"
        message={`Are you sure you want to delete ${deletingStudent?.name}? This will also remove all their scores.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingStudent(null)}
      />
    </div>
  );
}
