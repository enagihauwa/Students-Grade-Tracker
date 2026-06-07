import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatsCard from "../components/StatsCard";
import GradeBadge from "../components/GradeBadge";
import { getStudents, seedStudents, clearStudents } from "../utils/storage";
import { computeStats, calculateGrade } from "../utils/grading";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const allCourses = ["Introduction to Computer Science", "Introduction to Programming"];
  const [courseFilter, setCourseFilter] = useState(allCourses[0]);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const refresh = () => setStudents(getStudents());

  useEffect(() => {
    setStudents(getStudents());
  }, []);

  const handleSeed = () => {
    if (!window.confirm(
      "This will replace ALL existing data with 130 sample students (50 in 100 Level, 80 in 200 Level) with realistic scores. Continue?"
    )) return;
    setSeeding(true);
    seedStudents();
    refresh();
    setSeeding(false);
  };

  const handleClear = () => {
    if (!window.confirm("Delete ALL student data permanently? This cannot be undone.")) return;
    setClearing(true);
    clearStudents();
    refresh();
    setClearing(false);
  };

  const filtered = students.filter((s) => s.course === courseFilter);
  const stats = computeStats(filtered);
  const gradeDist = stats.gradeDistribution;
  const totalGradeCount = Object.values(gradeDist).reduce((a, b) => a + b, 0);

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
          <button onClick={handleSeed} disabled={seeding} className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-gold-500 text-gold-700 rounded-lg hover:bg-gold-50 transition-colors font-medium text-sm disabled:opacity-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {seeding ? "Seeding..." : "Seed Sample Data"}
          </button>
          {students.length > 0 && (
            <button onClick={handleClear} disabled={clearing} className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-red-400 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {clearing ? "Clearing..." : "Clear All Data"}
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

      {/* Course Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-navy-700">Filter by course:</label>
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="px-3 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800 bg-white text-sm"
        >
          {allCourses.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

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

        {/* Best & Worst Students */}
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <h2 className="text-lg font-semibold text-navy-800 mb-4">Best & Worst Performers</h2>
          {stats.totalStudents > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Highest</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy-800">{stats.bestStudent?.name}</p>
                    <p className="text-sm text-navy-500">{stats.bestStudent?.matric_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-700">{stats.highestScore}</p>
                    {stats.bestStudent && <GradeBadge {...calculateGrade(stats.highestScore)} />}
                  </div>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-1">Lowest</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-navy-800">{stats.worstStudent?.name}</p>
                    <p className="text-sm text-navy-500">{stats.worstStudent?.matric_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-700">{stats.lowestScore}</p>
                    {stats.worstStudent && <GradeBadge {...calculateGrade(stats.lowestScore)} />}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-navy-400 text-sm">No data available</p>
          )}
        </div>
      </div>

      {/* Course Averages */}
      <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
        <h2 className="text-lg font-semibold text-navy-800 mb-4">Course Averages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allCourses.map((course) => {
            const courseStudents = students.filter((s) => s.course === course);
            const courseStats = computeStats(courseStudents);
            const totalMax = courseStudents.reduce((s, st) => s + (st.total ?? 0), 0);
            const avg = courseStudents.length > 0 ? (totalMax / courseStudents.length).toFixed(1) : "—";
            return (
              <div key={course} className="p-4 bg-navy-50 rounded-lg border border-navy-100">
                <p className="font-semibold text-navy-800 text-sm">{course}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-navy-500">Students:</span> <span className="font-medium">{courseStats.totalStudents}</span></div>
                  <div><span className="text-navy-500">Average:</span> <span className="font-medium">{avg}%</span></div>
                  <div><span className="text-navy-500">Highest:</span> <span className="font-medium">{courseStats.highestScore}</span></div>
                  <div><span className="text-navy-500">Lowest:</span> <span className="font-medium">{courseStats.lowestScore}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
