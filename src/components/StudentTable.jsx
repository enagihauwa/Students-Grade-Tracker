import GradeBadge from "./GradeBadge";
import { calculateGrade } from "../utils/grading";

export default function StudentTable({ students, onEdit, onDelete, onScoreEdit }) {
  if (!students || students.length === 0) {
    return (
      <div className="text-center py-12 text-navy-500">
        <p>No students found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-navy-50 text-left text-navy-600">
            <th className="px-3 py-3 font-semibold">S/N</th>
            <th className="px-3 py-3 font-semibold">Name</th>
            <th className="px-3 py-3 font-semibold">Matric No</th>
            <th className="px-3 py-3 font-semibold">Level</th>
            <th className="px-3 py-3 font-semibold">Course</th>
            <th className="px-3 py-3 font-semibold text-center">Assign (10)</th>
            <th className="px-3 py-3 font-semibold text-center">Test (20)</th>
            <th className="px-3 py-3 font-semibold text-center">Exam (70)</th>
            <th className="px-3 py-3 font-semibold text-center">Total (100)</th>
            <th className="px-3 py-3 font-semibold text-center">Grade</th>
            <th className="px-3 py-3 font-semibold text-center w-24">Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => {
            const { grade, gradePoint } = calculateGrade(s.total ?? 0);
            return (
              <tr key={s.id} className="border-t border-navy-50 hover:bg-navy-50/50 transition-colors">
                <td className="px-3 py-3 text-navy-400 text-xs">{i + 1}</td>
                <td className="px-3 py-3 font-medium text-navy-800">{s.name}</td>
                <td className="px-3 py-3 font-mono text-navy-600">{s.matric_number}</td>
                <td className="px-3 py-3"><span className="bg-navy-100 text-navy-700 px-2 py-0.5 rounded-full text-xs font-medium">{s.level}</span></td>
                <td className="px-3 py-3 text-navy-600 text-xs max-w-[160px] truncate">{s.course || "—"}</td>
                <td className="px-3 py-3 text-center text-navy-700">{s.assignment ?? "—"}</td>
                <td className="px-3 py-3 text-center text-navy-700">{s.test ?? "—"}</td>
                <td className="px-3 py-3 text-center text-navy-700">{s.exam ?? "—"}</td>
                <td className="px-3 py-3 text-center font-semibold text-navy-800">{s.total ?? "—"}</td>
                <td className="px-3 py-3 text-center"><GradeBadge grade={grade} gradePoint={gradePoint} /></td>
                <td className="px-3 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {onScoreEdit && (
                      <button onClick={() => onScoreEdit(s)} className="text-navy-500 hover:text-navy-700 p-1.5 rounded-lg hover:bg-navy-50" title="Enter scores">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onEdit && (
                      <button onClick={() => onEdit(s)} className="text-navy-500 hover:text-navy-700 p-1.5 rounded-lg hover:bg-navy-50" title="Edit student">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(s)} className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50" title="Delete student">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
