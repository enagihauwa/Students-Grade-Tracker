import CourseTracker from "../components/CourseTracker";

export default function Courses() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Courses</h1>
        <p className="text-navy-500 dark:text-navy-400 mt-1">Manage courses offered</p>
      </div>
      <CourseTracker />
    </div>
  );
}
