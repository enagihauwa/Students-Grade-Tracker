import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Scores from "./pages/Scores";
import Results from "./pages/Results";
import Departments from "./pages/Departments";
import CourseReport from "./pages/CourseReport";

export default function App() {
  return (
    <div className="min-h-screen bg-navy-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/scores" element={<Scores />} />
          <Route path="/results" element={<Results />} />
          <Route path="/results/:studentId" element={<Results />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/course-report" element={<CourseReport />} />
        </Routes>
      </main>
    </div>
  );
}
