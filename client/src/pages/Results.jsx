import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";

export default function Results() {
  const { studentId } = useParams();
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(studentId || "");
  const [scores, setScores] = useState([]);
  const [gpa, setGpa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((d) => {
        setStudents(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedId) {
      setLoaded(false);
      Promise.all([
        fetch(`/api/scores/${selectedId}`).then((r) => r.json()),
        fetch(`/api/gpa/${selectedId}`).then((r) => r.json()),
      ])
        .then(([scoresData, gpaData]) => {
          setScores(Array.isArray(scoresData) ? scoresData : []);
          setGpa(gpaData);
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    } else {
      setScores([]);
      setGpa(null);
      setLoaded(true);
    }
  }, [selectedId]);

  const gradeColor = (grade) => {
    const colors = {
      A: "bg-green-100 text-green-800",
      B: "bg-blue-100 text-blue-800",
      C: "bg-yellow-100 text-yellow-800",
      D: "bg-orange-100 text-orange-800",
      E: "bg-red-100 text-red-800",
      F: "bg-red-200 text-red-900",
    };
    return colors[grade] || "bg-gray-100 text-gray-800";
  };

  const grouped = scores.reduce((acc, s) => {
    const key = `${s.session} - ${s.semester} Semester`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const sortedKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-navy-200 border-t-navy-600" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <EmptyState
        icon="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        title="No Students Yet"
        description="Add students and enter scores before viewing results."
        action={
          <a
            href="/students"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium"
          >
            Add Students
          </a>
        }
      />
    );
  }

  const student = students.find((s) => s.id === Number(selectedId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Student Results</h1>
          <p className="text-navy-500 mt-1">View and print academic result sheets</p>
        </div>
        {scores.length > 0 && (
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm no-print"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / PDF
          </button>
        )}
      </div>

      <div className="no-print">
        <label className="block text-sm font-medium text-navy-700 mb-1">Select Student</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full max-w-md px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-800 bg-white"
        >
          <option value="">Choose a student...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.matriculation_number}
            </option>
          ))}
        </select>
      </div>

      {selectedId && !loaded && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-navy-200 border-t-navy-600" />
        </div>
      )}

      {selectedId && loaded && scores.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-100 mb-4">
            <svg className="w-8 h-8 text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-navy-700 mb-2">No Scores Yet</h3>
          <p className="text-navy-500">
            {student?.name} has no scores recorded. Go to the Scores page to enter them.
          </p>
          <a
            href="/scores"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm"
          >
            Enter Scores
          </a>
        </div>
      )}

      {selectedId && loaded && scores.length > 0 && student && (
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden print:shadow-none print:border">
          <div className="bg-navy-800 text-white px-6 py-5 print:bg-navy-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">🎓</span>
              <span className="text-xs text-navy-300 uppercase tracking-wider">Academic Result Sheet</span>
            </div>
            <h2 className="text-xl font-bold mb-1">{student.name}</h2>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-navy-200">
              <span>Matric: {student.matriculation_number}</span>
              <span>Department: {student.department}</span>
              <span>Level: {student.level}</span>
            </div>
          </div>

          {sortedKeys.map((key) => {
            const semesterScores = grouped[key];
            const semTotalGP = semesterScores.reduce((sum, s) => sum + s.grade_point * s.credit_unit, 0);
            const semTotalCU = semesterScores.reduce((sum, s) => sum + s.credit_unit, 0);
            const semGPA = semTotalCU > 0 ? (semTotalGP / semTotalCU).toFixed(2) : "0.00";

            return (
              <div key={key}>
                <div className="bg-navy-100 px-4 py-2 border-b border-navy-200">
                  <h3 className="font-semibold text-navy-800 text-sm">{key}</h3>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-navy-50 text-left text-navy-600">
                      <th className="px-4 py-2.5 font-semibold">Course Code</th>
                      <th className="px-4 py-2.5 font-semibold">Course Name</th>
                      <th className="px-4 py-2.5 font-semibold text-center">CU</th>
                      <th className="px-4 py-2.5 font-semibold text-center">Score</th>
                      <th className="px-4 py-2.5 font-semibold text-center">Grade</th>
                      <th className="px-4 py-2.5 font-semibold text-center">GP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semesterScores.map((s) => (
                      <tr key={s.id} className="border-t border-navy-50 hover:bg-navy-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-mono font-medium text-navy-800">{s.course_code}</td>
                        <td className="px-4 py-2.5 text-navy-700">{s.course_name}</td>
                        <td className="px-4 py-2.5 text-center text-navy-600">{s.credit_unit}</td>
                        <td className="px-4 py-2.5 text-center font-semibold text-navy-800">{s.score}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${gradeColor(s.grade)}`}>
                            {s.grade}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold text-navy-800">{s.grade_point}</td>
                      </tr>
                    ))}
                    <tr className="bg-navy-50 border-t border-navy-200">
                      <td colSpan={2} className="px-4 py-2.5 text-right font-semibold text-navy-700 text-xs uppercase tracking-wider">
                        Semester GPA
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-navy-700">{semTotalCU}</td>
                      <td colSpan={2} />
                      <td className="px-4 py-2.5 text-center">
                        <span className="font-bold text-navy-800">{semGPA}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}

          <div className="bg-navy-800 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 print:bg-navy-800">
            <div className="text-sm text-navy-200 space-y-1">
              <p>Total Credit Units: <span className="font-semibold text-white">{gpa?.total_credit_units || 0}</span></p>
              <p>Total Grade Points: <span className="font-semibold text-white">{gpa?.total_grade_points || 0}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-navy-300 uppercase tracking-wider">Weighted GPA</p>
              <p className="text-3xl font-bold text-gold-400">
                {gpa?.gpa !== undefined && gpa?.gpa !== null ? Number(gpa.gpa).toFixed(2) : "0.00"}
              </p>
            </div>
          </div>
        </div>
      )}

      {!selectedId && (
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy-100 mb-4">
            <svg className="w-8 h-8 text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-navy-700 mb-2">Select a Student</h3>
          <p className="text-navy-500">Choose a student from the dropdown above to view their complete academic result sheet.</p>
        </div>
      )}
    </div>
  );
}
