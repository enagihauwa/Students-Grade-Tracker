import { useState } from "react";

export default function StudentForm({ onSubmit, initial, onCancel }) {
  const [form, setForm] = useState(
    initial || { name: "", matric_number: "", level: "100", course: "Introduction to Computer Science" }
  );
  const [error, setError] = useState("");

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
          onChange={(e) => {
            const course = e.target.value === "100" ? "Introduction to Computer Science" : "Introduction to Programming";
            setForm({ ...form, level: e.target.value, course });
          }}
          className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800 bg-white"
        >
          <option value="100">100 Level</option>
          <option value="200">200 Level</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1">Course</label>
        <input type="text" value={form.course} readOnly className="w-full px-3 py-2.5 border border-navy-200 rounded-lg bg-navy-50 text-navy-600 cursor-not-allowed" />
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
