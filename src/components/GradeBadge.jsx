const colors = {
  A: "bg-green-100 text-green-800 border-green-300",
  B: "bg-blue-100 text-blue-800 border-blue-300",
  C: "bg-yellow-100 text-yellow-800 border-yellow-300",
  D: "bg-orange-100 text-orange-800 border-orange-300",
  E: "bg-red-100 text-red-800 border-red-300",
  F: "bg-red-200 text-red-900 border-red-400",
};

export default function GradeBadge({ grade, gradePoint, size }) {
  const cls = colors[grade] || "bg-gray-100 text-gray-800 border-gray-300";
  const s = size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-bold border ${cls} ${s}`}>
      {grade}
      {gradePoint !== undefined && <span className="opacity-75 font-normal">({gradePoint.toFixed(1)})</span>}
    </span>
  );
}
