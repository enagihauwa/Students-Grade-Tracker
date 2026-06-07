import { useState, useEffect } from "react";
import EmptyState from "../components/EmptyState";
import { getDepartments, addDepartment, updateDepartment, deleteDepartment } from "../db";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const fetchDepartments = () => {
    getDepartments()
      .then(setDepartments)
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartments();
    setLoading(false);
  }, []);

  const openAdd = () => {
    setEditingDept(null);
    setName("");
    setError("");
    setShowForm(true);
  };

  const openEdit = (d) => {
    setEditingDept(d);
    setName(d.name);
    setError("");
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Department name is required"); return; }

    const action = editingDept
      ? updateDepartment(editingDept.id, name)
      : addDepartment(name);

    action
      .then(() => {
        setName("");
        setShowForm(false);
        setEditingDept(null);
        fetchDepartments();
      })
      .catch((err) => {
        if (err?.message?.includes("key already exists")) {
          setError("Department already exists");
        } else {
          setError("Failed to save department.");
        }
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
          <h1 className="text-2xl font-bold text-navy-900">Departments</h1>
          <p className="text-navy-500 mt-1">Manage departments for students and courses</p>
        </div>
        {departments.length > 0 && (
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Department
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto" onClick={() => { setShowForm(false); setEditingDept(null); }}>
          <div className="min-h-full flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-navy-800">
                {editingDept ? "Edit Department" : "Add Department"}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingDept(null); }} className="text-navy-400 hover:text-navy-600">
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
                <label className="block text-sm font-medium text-navy-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800"
                  placeholder="e.g., Computer Science"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium"
                >
                  {editingDept ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingDept(null); }}
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

      {departments.length === 0 && !showForm ? (
        <EmptyState
          icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          title="No Departments Yet"
          description="Add departments that students and courses will reference."
          action={
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add First Department
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-50 text-left text-navy-600">
                  <th className="px-4 py-3 font-semibold">S/N</th>
                  <th className="px-4 py-3 font-semibold">Department Name</th>
                  <th className="px-4 py-3 font-semibold text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d, i) => (
                  <tr key={d.id} className="border-t border-navy-50 hover:bg-navy-50/50 transition-colors">
                    <td className="px-4 py-3 text-navy-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-navy-800">{d.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(d)}
                          className="text-navy-500 hover:text-navy-700 transition-colors p-1.5 rounded-lg hover:bg-navy-50"
                          title="Edit department"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${d.name}"?`)) {
                              deleteDepartment(d.id).then(fetchDepartments);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                          title="Delete department"
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
            {departments.length} department{departments.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
