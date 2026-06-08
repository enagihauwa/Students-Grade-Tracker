import { useState, useEffect } from "react";
import { getCourses, addCourse } from "../utils/storage";

export default function StudentForm({ onSubmit, initial, onCancel }) {
  const [form, setForm] = useState(
    initial || { name: "", matric_number: "", level: "100", course: "" }
  );
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [addingCourse, setAddingCourse] = useState(false);
  const [newCourse, setNewCourse] = useState("");

  useEffect(() => { setCourses(getCourses()); }, []);

  const handleAddCourse = () => {
    const trimmed = newCourse.trim();
    if (!trimmed) return;
    const updated = addCourse(trimmed);
    setCourses(updated);
    setForm({ ...form, course: trimmed });
    setNewCourse("");
    setAddingCourse(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.matric_number.trim()) {
      setError("Name and matric number are required");
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">Full Name</label>
        <input
          type="text" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800"
          placeholder="e.g., John Okafor"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">Matric Number</label>
        <input
          type="text" value={form.matric_number}
          onChange={(e) => setForm({ ...form, matric_number: e.target.value })}
          className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800"
          placeholder="e.g., CSC/100/2024/001"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">Level</label>
        <select
          value={form.level}
          onChange={(e) => setForm({ ...form, level: e.target.value })}
          className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800 bg-white"
        >
          <option value="100">100 Level</option>
          <option value="200">200 Level</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">Course</label>
        <div className="flex gap-2">
          <select
            value={form.course}
            onChange={(e) => setForm({ ...form, course: e.target.value })}
            className="flex-1 px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800 bg-white"
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <button type="button" onClick={() => setAddingCourse(!addingCourse)} className="px-3 py-2.5 border border-navy-200 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors" title="Add Course">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        {addingCourse && (
          <div className="flex gap-2 mt-2">
            <input
              type="text" value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCourse())}
              className="flex-1 px-3 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800 text-sm"
              placeholder="Course name"
            />
            <button type="button" onClick={handleAddCourse} className="px-3 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors text-sm font-medium">
              Add
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium">
          {initial ? "Update" : "Register"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2.5 border border-navy-200 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
