import { useState } from "react";
import GradeBadge from "./GradeBadge";
import { calculateGrade } from "../utils/grading";

export default function ScoreForm({ student, onSubmit, onCancel }) {
  const [scores, setScores] = useState({
    assignment: student.assignment ?? "",
    test: student.test ?? "",
    exam: student.exam ?? "",
  });
  const [error, setError] = useState("");

  const MAX = { assignment: 10, test: 20, exam: 70 };

  const assignment = Number(scores.assignment) || 0;
  const test = Number(scores.test) || 0;
  const exam = Number(scores.exam) || 0;
  const total = assignment + test + exam;
  const remaining = 100 - (assignment + test + exam);
  const exceeded = total > 100;
  const { grade, gradePoint } = total > 0 ? calculateGrade(total) : { grade: "—", gradePoint: null };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (exceeded) { setError("Total exceeds 100 marks"); return; }
    if (!scores.assignment && !scores.test && !scores.exam) {
      setError("Enter at least one score");
      return;
    }
    onSubmit({ assignment, test, exam });
  };

  const handleChange = (field, value) => {
    const n = Number(value);
    if (value !== "" && (isNaN(n) || n < 0 || n > MAX[field])) return;
    setScores({ ...scores, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
      <div className="bg-navy-50 rounded-lg p-3">
        <p className="font-semibold text-navy-800">{student.name}</p>
        <p className="text-sm text-navy-500">{student.matric_number} — {student.level} Level {student.course ? `— ${student.course}` : ""}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-navy-700 mb-1">Assignment (max {MAX.assignment})</label>
          <input type="number" min="0" max={MAX.assignment} value={scores.assignment} onChange={(e) => handleChange("assignment", e.target.value)} className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800" placeholder="0" />
        </div>
        <div>
          <label className="block text-xs font-medium text-navy-700 mb-1">Test (max {MAX.test})</label>
          <input type="number" min="0" max={MAX.test} value={scores.test} onChange={(e) => handleChange("test", e.target.value)} className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800" placeholder="0" />
        </div>
        <div>
          <label className="block text-xs font-medium text-navy-700 mb-1">Exam (max {MAX.exam})</label>
          <input type="number" min="0" max={MAX.exam} value={scores.exam} onChange={(e) => handleChange("exam", e.target.value)} className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800" placeholder="0" />
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-navy-600">Total: <strong className={`text-base ${exceeded ? "text-red-600" : "text-navy-800"}`}>{total}</strong> / 100</span>
        {remaining > 0 && <span className="text-navy-400">({remaining} remaining)</span>}
        {total > 0 && !exceeded && <GradeBadge grade={grade} gradePoint={gradePoint} />}
        {exceeded && <span className="text-red-600 text-xs font-medium">Exceeds 100!</span>}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={exceeded} className="flex-1 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 disabled:opacity-50 transition-colors font-medium">Save Scores</button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 border border-navy-200 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors">Cancel</button>
      </div>
    </form>
  );
}
