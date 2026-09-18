import { useState, useEffect } from "react";
import StudentTable from "../components/StudentTable";
import GradeBadge from "../components/GradeBadge";
import { getStudents } from "../utils/storage";
import { calculateGrade, computeStats } from "../utils/grading";

export default function Reports() {
  const [students, setStudents] = useState([]);
  const [sortField, setSortField] = useState("total");
  const [sortDir, setSortDir] = useState("desc");
  const [levelFilter, setLevelFilter] = useState("All");

  useEffect(() => {
    setStudents(getStudents());
  }, []);

  const levels = [...new Set(students.map((s) => s.level).filter(Boolean))].sort();
  const filtered = levelFilter === "All" ? students : students.filter((s) => s.level === levelFilter);
  const stats = computeStats(filtered);

  const sorted = [...filtered].sort((a, b) => {
    const va = a[sortField] ?? 0;
    const vb = b[sortField] ?? 0;
    if (typeof va === "string") {
      if (sortDir === "asc") return va.localeCompare(vb);
      return vb.localeCompare(va);
    }
    return sortDir === "asc" ? va - vb : vb - va;
  });

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-navy-300 ml-1">↕</span>;
    return <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const gradeColors = {
    A: "bg-green-100 text-green-800",
    B: "bg-blue-100 text-blue-800",
    C: "bg-yellow-100 text-yellow-800",
    D: "bg-orange-100 text-orange-800",
    E: "bg-red-100 text-red-800",
    F: "bg-red-200 text-red-900",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Reports</h1>
          <p className="text-navy-500 dark:text-navy-400 mt-1">Performance summaries and analytics</p>
        </div>
      </div>

      {/* Level Filter Buttons */}
      {levels.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider mr-1">Level:</span>
          <button onClick={() => setLevelFilter("All")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${levelFilter === "All" ? "bg-navy-600 text-white" : "bg-navy-50 dark:bg-navy-900 dark:bg-navy-950/50 text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:bg-navy-700 border border-navy-200 dark:border-navy-700"}`}>
            All
          </button>
          {levels.map((level) => (
            <button key={level} onClick={() => setLevelFilter(level)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${levelFilter === level ? "bg-navy-600 text-white" : "bg-navy-50 dark:bg-navy-900 dark:bg-navy-950/50 text-navy-700 dark:text-navy-200 hover:bg-navy-100 dark:bg-navy-700 border border-navy-200 dark:border-navy-700"}`}>
              {level} Level
            </button>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      {students.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-navy-100 dark:border-navy-700 p-4 text-center">
            <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider">Students</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-navy-100 mt-1">{stats.totalStudents}</p>
          </div>
          <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-navy-100 dark:border-navy-700 p-4 text-center">
            <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider">Course Average</p>
            <p className="text-2xl font-bold text-navy-800 dark:text-navy-100 mt-1">{stats.gradedCount > 0 ? `${stats.averageScore}%` : "—"}</p>
          </div>
          <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-navy-100 dark:border-navy-700 p-4 text-center">
            <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider">Highest</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{stats.gradedCount > 0 ? stats.highestScore : "—"}</p>
          </div>
          <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-navy-100 dark:border-navy-700 p-4 text-center">
            <p className="text-xs font-medium text-navy-500 dark:text-navy-400 uppercase tracking-wider">Lowest</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{stats.gradedCount > 0 ? stats.lowestScore : "—"}</p>
          </div>
        </div>
      )}

      {/* Grade Distribution Summary */}
      {students.length > 0 && (
        <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-navy-100 dark:border-navy-700 p-6">
          <h2 className="text-sm font-semibold text-navy-700 dark:text-navy-200 mb-3">Grade Category Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {["A", "B", "C", "D", "E", "F"].map((g) => {
              const count = stats.gradeDistribution[g];
              const pct = students.length > 0 ? Math.round((count / students.length) * 100) : 0;
              return (
                <div key={g} className={`${gradeColors[g]} rounded-lg p-3 text-center`}>
                  <div className="text-lg font-bold">{g}</div>
                  <div className="text-2xl font-bold mt-1">{count}</div>
                  <div className="text-xs opacity-75">{pct}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Student Performance Table */}
      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-navy-100 dark:border-navy-700 overflow-hidden">
        {students.length > 0 ? (
          <>
            <div className="bg-navy-50 dark:bg-navy-900 dark:bg-navy-950/50 px-4 py-3 border-b border-navy-100 dark:border-navy-700 flex items-center justify-between">
              <h2 className="font-semibold text-navy-800 dark:text-navy-100 text-sm">Student Performance</h2>
              <span className="text-xs text-navy-500 dark:text-navy-400">{filtered.length} student{filtered.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-50 dark:bg-navy-900 dark:bg-navy-950/50 text-left text-navy-600 dark:text-navy-300">
                    <th className="px-3 py-3 font-semibold">S/N</th>
                    <th className="px-3 py-3 font-semibold cursor-pointer hover:text-navy-800 dark:text-navy-100" onClick={() => handleSort("name")}>
                      Name <SortIcon field="name" />
                    </th>
                    <th className="px-3 py-3 font-semibold">Matric No</th>
                    <th className="px-3 py-3 font-semibold">Level</th>
                    <th className="px-3 py-3 font-semibold text-center cursor-pointer hover:text-navy-800 dark:text-navy-100" onClick={() => handleSort("assignment")}>
                      Assign (10) <SortIcon field="assignment" />
                    </th>
                    <th className="px-3 py-3 font-semibold text-center cursor-pointer hover:text-navy-800 dark:text-navy-100" onClick={() => handleSort("test")}>
                      Test (20) <SortIcon field="test" />
                    </th>
                    <th className="px-3 py-3 font-semibold text-center cursor-pointer hover:text-navy-800 dark:text-navy-100" onClick={() => handleSort("exam")}>
                      Exam (70) <SortIcon field="exam" />
                    </th>
                    <th className="px-3 py-3 font-semibold text-center cursor-pointer hover:text-navy-800 dark:text-navy-100" onClick={() => handleSort("total")}>
                      Total (100) <SortIcon field="total" />
                    </th>
                    <th className="px-3 py-3 font-semibold text-center">Grade</th>
                    <th className="px-3 py-3 font-semibold text-center">Average (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((s, i) => {
                    const isGraded = s.total != null;
                    const { grade, gradePoint } = isGraded ? calculateGrade(s.total) : {};
                    return (
                      <tr key={s.id} className="border-t border-navy-50 hover:bg-navy-50 dark:bg-navy-900 dark:bg-navy-950/50/50 transition-colors">
                        <td className="px-3 py-3 text-navy-400 text-xs">{i + 1}</td>
                        <td className="px-3 py-3 font-medium text-navy-800 dark:text-navy-100">{s.name}</td>
                        <td className="px-3 py-3 font-mono text-navy-600 dark:text-navy-300">{s.matric_number}</td>
                        <td className="px-3 py-3"><span className="bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-200 px-2 py-0.5 rounded-full text-xs font-medium">{s.level}</span></td>
                        <td className="px-3 py-3 text-center text-navy-700 dark:text-navy-200">{s.assignment ?? "—"}</td>
                        <td className="px-3 py-3 text-center text-navy-700 dark:text-navy-200">{s.test ?? "—"}</td>
                        <td className="px-3 py-3 text-center text-navy-700 dark:text-navy-200">{s.exam ?? "—"}</td>
                        <td className="px-3 py-3 text-center font-semibold text-navy-800 dark:text-navy-100">{s.total ?? "—"}</td>
                        <td className="px-3 py-3 text-center">
                          {isGraded ? <GradeBadge grade={grade} gradePoint={gradePoint} /> : <span className="text-navy-400 text-xs italic">Ungraded</span>}
                        </td>
                        <td className="px-3 py-3 text-center font-semibold text-navy-800 dark:text-navy-100">
                          {isGraded ? `${s.total}%` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-navy-500 dark:text-navy-400">
            <p className="font-semibold text-navy-700 dark:text-navy-200 mb-1">No Data Available</p>
            <p className="text-sm">Add students and enter scores to generate reports.</p>
          </div>
        )}
      </div>
    </div>
  );
}
