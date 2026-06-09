import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatsCard from "../components/StatsCard";
import GradeBadge from "../components/GradeBadge";
import { getStudents, clearStudents, clearCourses, seedStudents, getCourses } from "../utils/storage";
import sampleStudents from "../utils/seed";
import { computeStats, calculateGrade } from "../utils/grading";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [clearing, setClearing] = useState(false);

  const refresh = () => {
    setStudents(getStudents());
    setCourses(getCourses());
  };

  useEffect(() => {
    setStudents(getStudents());
    setCourses(getCourses());
  }, []);

  const handleClear = () => {
    if (!window.confirm("Delete ALL student data permanently? This cannot be undone.")) return;
    setClearing(true);
    clearStudents();
    clearCourses();
    refresh();
    setClearing(false);
  };

  const stats = computeStats(students);
  const gradeDist = stats.gradeDistribution;
  const totalGradeCount = Object.values(gradeDist).reduce((a, b) => a + b, 0);

  const coursesOffered = [...new Set(students.map((s) => s.course).filter(Boolean))];

  const gradeColors = {
    A: "bg-green-100 text-green-800 border-green-200",
    B: "bg-blue-100 text-blue-800 border-blue-200",
    C: "bg-yellow-100 text-yellow-800 border-yellow-200",
    D: "bg-orange-100 text-orange-800 border-orange-200",
    E: "bg-red-100 text-red-800 border-red-200",
    F: "bg-red-200 text-red-900 border-red-300",
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-navy-500 mt-1">Lecturer performance overview</p>
        </div>
        <div className="flex items-center gap-2">
          {students.length > 0 && (
            <button onClick={handleClear} disabled={clearing} className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-red-400 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {clearing ? "Clearing..." : "Clear All Data"}
            </button>
          )}
          {students.length === 0 && (
            <button onClick={() => { seedStudents(sampleStudents); refresh(); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-400 transition-colors font-medium text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Seed Sample Data
            </button>
          )}
          <Link to="/students" className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </Link>
        </div>
      </div>

      {/* No Courses Notification */}
      {courses.length === 0 && students.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="font-medium">Courses required:</span> Please register courses first before adding students.{" "}
            <Link to="/courses" className="underline font-medium hover:text-amber-900">Go to Courses</Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={stats.totalStudents}
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          color="bg-navy-600"
        />
        <StatsCard
          title="Average Score"
          value={stats.totalStudents > 0 ? `${stats.averageScore}%` : "—"}
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          color="bg-blue-600"
        />
        <StatsCard
          title="Highest Score"
          value={stats.totalStudents > 0 ? stats.highestScore : "—"}
          subtitle={stats.bestStudent?.name || ""}
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          color="bg-green-600"
        />
        <StatsCard
          title="Lowest Score"
          value={stats.totalStudents > 0 ? stats.lowestScore : "—"}
          subtitle={stats.worstStudent?.name || ""}
          icon="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          color="bg-red-600"
        />
      </div>

      {coursesOffered.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <h2 className="text-lg font-semibold text-navy-800 mb-4">Courses Offered by Level</h2>
          <div className="space-y-3">
            {[...new Set(students.map((s) => s.level).filter(Boolean))].sort().map((level) => {
              const levelCourses = [...new Set(students.filter((s) => s.level === level).map((s) => s.course).filter(Boolean))];
              if (levelCourses.length === 0) return null;
              return (
                <div key={level}>
                  <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-2">{level} Level</p>
                  <div className="flex flex-wrap gap-2">
                    {levelCourses.map((course) => {
                      const count = students.filter((s) => s.course === course && s.level === level).length;
                      return (
                        <span key={course} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-50 border border-navy-200 text-sm font-medium text-navy-700">
                          {course}
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-navy-600 text-white text-xs font-bold">{count}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <h2 className="text-lg font-semibold text-navy-800 mb-4">Grade Distribution</h2>
          {totalGradeCount > 0 ? (
            <div className="grid grid-cols-6 gap-2">
              {["A", "B", "C", "D", "E", "F"].map((g) => {
                const count = gradeDist[g] || 0;
                const pct = totalGradeCount > 0 ? Math.round((count / totalGradeCount) * 100) : 0;
                return (
                  <div key={g} className={`${gradeColors[g]} rounded-lg p-3 text-center border`}>
                    <div className="text-lg font-bold">{g}</div>
                    <div className="text-lg font-bold mt-1">{count}</div>
                    <div className="text-xs opacity-75">{pct}%</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-navy-400 text-sm">No scores recorded yet</p>
          )}
        </div>

        {/* Performance by Level */}
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <h2 className="text-lg font-semibold text-navy-800 mb-4">Performance by Level</h2>
          {stats.totalStudents > 0 ? (
            <div className="space-y-4">
              {[...new Set(students.map((s) => s.level).filter(Boolean))].sort().map((level) => {
                const levelStudents = students.filter((s) => s.level === level);
                const levelTotals = levelStudents.map((s) => s.total ?? 0);
                const high = Math.max(...levelTotals);
                const low = Math.min(...levelTotals);
                const best = levelStudents.find((s) => s.total === high);
                const worst = levelStudents.find((s) => s.total === low);
                return (
                  <div key={level}>
                    <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-2">{level} Level</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Highest</p>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-navy-800 truncate">{best?.name}</p>
                            <p className="text-xs text-navy-500 truncate">{best?.matric_number}</p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="text-xl font-bold text-green-700">{high}</p>
                            {best && <GradeBadge {...calculateGrade(high)} />}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">Lowest</p>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-navy-800 truncate">{worst?.name}</p>
                            <p className="text-xs text-navy-500 truncate">{worst?.matric_number}</p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="text-xl font-bold text-red-700">{low}</p>
                            {worst && <GradeBadge {...calculateGrade(low)} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-navy-400 text-sm">No data available</p>
          )}
        </div>
      </div>


    </div>
  );
}
