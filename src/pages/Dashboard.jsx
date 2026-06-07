import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { getDashboard } from "../db";
import seedData from "../seed";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState(null);

  useEffect(() => {
    getDashboard()
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSeed = () => {
    setSeeding(true);
    setSeedMsg(null);
    seedData()
      .then(() => {
        setSeedMsg({ type: "success", text: "Sample data loaded! Refreshing..." });
        return getDashboard();
      })
      .then((d) => {
        setData(d);
        setSeeding(false);
      })
      .catch(() => {
        setSeedMsg({ type: "error", text: "Seeding failed. Data may already exist." });
        setSeeding(false);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-navy-200 border-t-navy-600" />
      </div>
    );
  }

  if (!data || data.totalStudents === 0) {
    return (
      <EmptyState
        icon="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        title="Welcome to GradeTracker"
        description="Start by adding your students and courses. Once you have data entered, this dashboard will show you a complete overview at a glance."
        action={
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/students"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors font-medium"
            >
              Add Students
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-navy-300 text-navy-700 rounded-lg hover:border-navy-500 transition-colors font-medium"
            >
              Add Courses
            </Link>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 text-white rounded-lg hover:bg-gold-600 disabled:opacity-50 transition-colors font-medium"
            >
              {seeding ? "Loading..." : "Load Sample Data"}
            </button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-navy-500 mt-1">Overview of your academic records</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 disabled:opacity-50 transition-colors font-medium text-sm"
        >
          {seeding ? "Loading..." : "Load Sample Data"}
        </button>
      </div>
      {seedMsg && (
        <div className={`p-3 rounded-lg border text-sm ${seedMsg.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {seedMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500">Total Students</p>
              <p className="text-3xl font-bold text-navy-800 mt-1">{data.totalStudents}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-navy-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500">Total Courses</p>
              <p className="text-3xl font-bold text-navy-800 mt-1">{data.totalCourses}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-navy-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500">Scores Entered</p>
              <p className="text-3xl font-bold text-navy-800 mt-1">{data.totalScores}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-navy-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-navy-500">Departments</p>
              <p className="text-3xl font-bold text-navy-800 mt-1">{data.departmentCount.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-navy-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <h2 className="text-lg font-semibold text-navy-800 mb-4">Level Distribution</h2>
          <div className="space-y-3">
            {data.levelDistribution.length === 0 ? (
              <p className="text-navy-400 text-sm">No students added yet</p>
            ) : (
              data.levelDistribution.map((l) => {
                const maxCount = Math.max(...data.levelDistribution.map((x) => x.count));
                const pct = (l.count / maxCount) * 100;
                return (
                  <div key={l.level}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-navy-700">{l.level} Level</span>
                      <span className="text-navy-500">{l.count} student{l.count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="w-full bg-navy-100 rounded-full h-2.5">
                      <div
                        className="bg-navy-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <h2 className="text-lg font-semibold text-navy-800 mb-4">Departments</h2>
          {data.departmentCount.length === 0 ? (
            <p className="text-navy-400 text-sm">No departments added yet</p>
          ) : (
            <div className="space-y-3">
              {data.departmentCount.map((d) => (
                <div key={d.department} className="flex items-center justify-between p-3 bg-navy-50 rounded-lg">
                  <span className="font-medium text-navy-700">{d.department}</span>
                  <span className="text-sm text-navy-500 bg-white px-2.5 py-0.5 rounded-full border border-navy-200">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data.recentStudents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-navy-800">Recently Added Students</h2>
            <Link to="/students" className="text-sm text-gold-600 hover:text-gold-700 font-medium">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-navy-500 border-b border-navy-100">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Matric No.</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Level</th>
                </tr>
              </thead>
              <tbody>
                {data.recentStudents.map((s) => (
                  <tr key={s.id} className="border-b border-navy-50 hover:bg-navy-50/50 transition-colors">
                    <td className="py-3 text-navy-800 font-medium">{s.name}</td>
                    <td className="py-3 text-navy-600">{s.matriculation_number}</td>
                    <td className="py-3 text-navy-600">{s.department}</td>
                    <td className="py-3">
                      <span className="bg-navy-100 text-navy-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {s.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
