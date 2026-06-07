import { useState, useEffect } from "react";
import StudentForm from "../components/StudentForm";
import { getStudents, addStudent, updateStudent, deleteStudent } from "../utils/storage";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const refresh = () => setStudents(getStudents());

  useEffect(() => { refresh(); }, []);

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
                <th className="px-4 py-3 font-semibold">Course</th>
                <th className="px-4 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => (
                <tr key={s.id} className="border-t border-navy-50 hover:bg-navy-50/50">
                  <td className="px-4 py-3 text-navy-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-navy-800">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-navy-600">{s.matric_number}</td>
                  <td className="px-4 py-3 text-navy-600 text-xs max-w-[250px] truncate">{s.course}</td>
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
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Student
        </button>
      </div>

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
                initial={editing ? { name: editing.name, matric_number: editing.matric_number, level: String(editing.level), course: editing.course } : null}
                onSubmit={handleSubmit}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
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
          <StudentTable list={lvl100} level="100" color="bg-navy-600 text-white" />
          <StudentTable list={lvl200} level="200" color="bg-navy-800 text-white" />
        </div>
      )}
    </div>
  );
}
