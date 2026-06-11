import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StatsCard from "../components/StatsCard";
import GradeBadge from "../components/GradeBadge";
import { getStudents, clearStudents, clearCourses, seedStudents, getCourses, addCourse } from "../utils/storage";
import sampleStudents from "../utils/seed";
import { computeStats, calculateGrade } from "../utils/grading";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [clearing, setClearing] = useState(false);
  const [showCoursePrompt, setShowCoursePrompt] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [courseLevel, setCourseLevel] = useState("100");
  const [pendingCourses, setPendingCourses] = useState([]);
  const [courseError, setCourseError] = useState("");
  const navigate = useNavigate();

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

  const handleAddStudent = () => {
    const existing = getCourses();
    if (existing.length === 0) {
      setShowCoursePrompt(true);
      setPendingCourses([]);
      setCourseName("");
      setCourseError("");
    } else {
      navigate("/students");
    }
  };

  const handleAddCourse = () => {
    const trimmed = courseName.trim();
    if (!trimmed) { setCourseError("Course name is required"); return; }
    setCourseError("");
    addCourse(trimmed, courseLevel);
    setPendingCourses([...pendingCourses, { name: trimmed, level: courseLevel }]);
    setCourseName("");
  };

  const handleProceedAfterCourses = () => {
    setShowCoursePrompt(false);
    navigate("/students");
  };

  const stats = computeStats(students);
  const gradeDist = stats.gradeDistribution;
  const totalGradeCount = Object.values(gradeDist).reduce((a, b) => a + b, 0);

  const gradeMeta = {
    A: { label: "Excellent", color: "bg-green-500", bar: "bg-green-500", text: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
    B: { label: "Very Good", color: "bg-blue-500", bar: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
    C: { label: "Good", color: "bg-yellow-500", bar: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
    D: { label: "Fair", color: "bg-orange-500", bar: "bg-orange-500", text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
    E: { label: "Poor", color: "bg-red-500", bar: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
    F: { label: "Fail", color: "bg-red-700", bar: "bg-red-700", text: "text-red-900", bg: "bg-red-100", border: "border-red-300" },
  };

  const passCount = (gradeDist.A || 0) + (gradeDist.B || 0) + (gradeDist.C || 0);
  const failCount = (gradeDist.D || 0) + (gradeDist.E || 0) + (gradeDist.F || 0);
  const passRate = totalGradeCount > 0 ? Math.round((passCount / totalGradeCount) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Academic Dashboard</h1>
          <p className="text-navy-500 mt-1">Lecturer: Abubakar Sani · Department of Computer Science — Performance Overview</p>
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
          <button onClick={handleAddStudent} className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </button>
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
          color="from-navy-500 to-navy-700"
        />
        <StatsCard
          title="Class Average"
          value={stats.totalStudents > 0 ? `${stats.averageScore}%` : "—"}
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          color="from-blue-500 to-blue-700"
        />
        <StatsCard
          title="Highest Score"
          value={stats.totalStudents > 0 ? stats.highestScore : "—"}
          subtitle={stats.bestStudent?.name || ""}
          icon="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          color="from-green-500 to-green-700"
        />
        <StatsCard
          title="Lowest Score"
          value={stats.totalStudents > 0 ? stats.lowestScore : "—"}
          subtitle={stats.worstStudent?.name || ""}
          icon="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          color="from-red-500 to-red-700"
        />
      </div>

      {/* Academic Summary Bar */}
      {totalGradeCount > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <h2 className="text-lg font-semibold text-navy-800">Class Performance Summary</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-green-500"></span>
                <span className="text-navy-600">Pass ({passCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-red-500"></span>
                <span className="text-navy-600">Fail ({failCount})</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-4 bg-navy-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                style={{ width: `${passRate}%` }}
              />
            </div>
            <span className="text-sm font-bold text-navy-700 tabular-nums">{passRate}%</span>
            <span className="text-xs text-navy-400">pass rate</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <h2 className="text-lg font-semibold text-navy-800 mb-5">Grade Distribution</h2>
          {totalGradeCount > 0 ? (
            <div className="space-y-3">
              {["A", "B", "C", "D", "E", "F"].map((g) => {
                const count = gradeDist[g] || 0;
                const pct = totalGradeCount > 0 ? Math.round((count / totalGradeCount) * 100) : 0;
                const meta = gradeMeta[g];
                return (
                  <div key={g} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${meta.bg} ${meta.border} border flex items-center justify-center shrink-0`}>
                      <span className={`font-bold text-sm ${meta.text}`}>{g}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-navy-500">{meta.label}</span>
                        <span className="text-xs font-semibold text-navy-600 tabular-nums">{count} student{count !== 1 ? "s" : ""}</span>
                      </div>
                      <div className="h-2.5 bg-navy-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${meta.bar} rounded-full transition-all duration-500`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-navy-400 mt-0.5 block tabular-nums">{pct}% of class</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-navy-100 mb-4">
                <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-navy-500 text-sm font-medium">No scores recorded yet</p>
              <p className="text-navy-400 text-xs mt-1">Enter scores to view grade distribution.</p>
            </div>
          )}
        </div>

        {/* Performance by Level */}
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <h2 className="text-lg font-semibold text-navy-800 mb-5">Performance by Level</h2>
          {stats.totalStudents > 0 ? (
            <div className="space-y-6">
              {[...new Set(students.map((s) => s.level).filter(Boolean))].sort().map((level) => {
                const levelStudents = students.filter((s) => s.level === level);
                const levelTotals = levelStudents.map((s) => s.total ?? 0);
                const levelAvg = levelTotals.length > 0 ? Math.round(levelTotals.reduce((a, b) => a + b, 0) / levelTotals.length) : 0;
                const high = Math.max(...levelTotals);
                const low = Math.min(...levelTotals);
                const best = levelStudents.find((s) => s.total === high);
                const worst = levelStudents.find((s) => s.total === low);
                const levelPass = levelStudents.filter((s) => s.total >= 50).length;
                const levelPassRate = levelStudents.length > 0 ? Math.round((levelPass / levelStudents.length) * 100) : 0;

                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">{level} Level</p>
                      <span className="text-xs text-navy-400 tabular-nums">{levelStudents.length} student{levelStudents.length !== 1 ? "s" : ""}</span>
                    </div>
                    {/* Level Average Bar */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-medium text-navy-500 w-16 shrink-0">Avg: {levelAvg}%</span>
                      <div className="flex-1 h-2 bg-navy-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            levelAvg >= 70 ? "bg-green-500" : levelAvg >= 50 ? "bg-yellow-500" : "bg-red-500"
                          }`}
                          style={{ width: `${levelAvg}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-navy-500 shrink-0">
                        <span className="text-green-600 font-medium">Pass {levelPassRate}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Highest</p>
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-navy-800 truncate">{best?.name}</p>
                            <p className="text-xs text-navy-500 truncate">{best?.matric_number}</p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="text-xl font-bold text-green-700 tabular-nums">{high}</p>
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
                            <p className="text-xl font-bold text-red-700 tabular-nums">{low}</p>
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
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-navy-100 mb-4">
                <svg className="w-7 h-7 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-navy-500 text-sm font-medium">No data available</p>
              <p className="text-navy-400 text-xs mt-1">Add students and scores to view level performance.</p>
            </div>
          )}
        </div>
      </div>

      {/* Courses Offered */}
      {courses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-navy-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-navy-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy-800">Courses Offered by Level</h2>
                <p className="text-xs text-navy-400 mt-0.5">{courses.length} course{courses.length !== 1 ? "s" : ""} across {new Set(courses.map(c => c.level)).size} level{new Set(courses.map(c => c.level)).size !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <Link to="/courses" className="text-xs font-medium text-navy-500 hover:text-navy-700 transition-colors">
              Manage Courses
            </Link>
          </div>
          <div className="divide-y divide-navy-50">
            {[...new Set(courses.map((c) => c.level).filter(Boolean))].sort().map((level) => {
              const levelCourses = courses.filter((c) => c.level === level);
              const totalEnrolled = students.filter((s) => s.level === level).length;
              return (
                <div key={level} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1.5 bg-navy-900 text-gold-400 rounded-md text-sm font-bold tracking-wider">
                        {level}
                      </div>
                      <span className="text-sm font-medium text-navy-700">{level} Level</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-navy-500">
                      <span className="tabular-nums">{levelCourses.length} course{levelCourses.length !== 1 ? "s" : ""}</span>
                      <span className="tabular-nums">{totalEnrolled} student{totalEnrolled !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {levelCourses.map((c) => {
                      const enrolled = students.filter((s) => s.course === c.name && s.level === level);
                      const count = enrolled.length;
                      const avgScore = count > 0 ? Math.round(enrolled.reduce((sum, s) => sum + (s.total ?? 0), 0) / count) : 0;
                      const passCount = enrolled.filter((s) => s.total >= 50).length;
                      const passRate = count > 0 ? Math.round((passCount / count) * 100) : 0;
                      return (
                        <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-navy-50 border border-navy-200 hover:bg-navy-100 hover:border-navy-300 transition-all">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-navy-800 truncate">{c.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-navy-500 tabular-nums">
                                <span className="font-medium text-navy-600">{count}</span> enrolled
                              </span>
                              {count > 0 && (
                                <>
                                  <span className="text-xs text-navy-300">|</span>
                                  <span className="text-xs tabular-nums">
                                    <span className={`font-medium ${avgScore >= 70 ? "text-green-600" : avgScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>{avgScore}%</span>
                                    <span className="text-navy-400"> avg</span>
                                  </span>
                                  <span className="text-xs text-navy-300">|</span>
                                  <span className={`text-xs font-medium tabular-nums ${passRate >= 75 ? "text-green-600" : passRate >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                                    {passRate}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {count > 0 && (
                            <div className="w-1 h-8 rounded-full shrink-0 self-center" style={{
                              backgroundColor: avgScore >= 70 ? "#22c55e" : avgScore >= 50 ? "#eab308" : "#ef4444"
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Course Registration Prompt */}
      {showCoursePrompt && (
        <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto" onClick={() => setShowCoursePrompt(false)}>
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-navy-800">Courses Required</h2>
                    <p className="text-sm text-navy-500">Register a course before adding students</p>
                  </div>
                </div>
                <button onClick={() => setShowCoursePrompt(false)} className="text-navy-400 hover:text-navy-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                <p className="text-sm text-amber-800">
                  No courses have been registered yet. Please add at least one course before registering a student.
                </p>
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Course Name</label>
                  <input
                    type="text" value={courseName}
                    onChange={(e) => { setCourseName(e.target.value); setCourseError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCourse())}
                    className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800"
                    placeholder="e.g., Calculus"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1">Level</label>
                  <select value={courseLevel} onChange={(e) => setCourseLevel(e.target.value)} className="w-full px-3 py-2.5 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-navy-800 bg-white">
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                  </select>
                </div>
                {courseError && <p className="text-sm text-red-600">{courseError}</p>}
                <button onClick={handleAddCourse} className="w-full px-4 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Course
                </button>
              </div>

              {pendingCourses.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider mb-2">Added Courses</p>
                  <div className="space-y-1.5">
                    {pendingCourses.map((pc, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                        <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-medium text-navy-800">{pc.name}</span>
                        <span className="text-xs text-navy-500">({pc.level} Level)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowCoursePrompt(false)} className="flex-1 px-4 py-2.5 border border-navy-200 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors font-medium text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleProceedAfterCourses}
                  disabled={pendingCourses.length === 0}
                  className="flex-1 px-4 py-2.5 bg-gold-500 text-navy-900 rounded-lg hover:bg-gold-400 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Proceed to Student
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
