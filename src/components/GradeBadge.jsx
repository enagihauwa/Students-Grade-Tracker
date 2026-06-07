const colors = {
  A: "bg-green-100 text-green-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-orange-100 text-orange-800",
  E: "bg-red-100 text-red-800",
  F: "bg-red-200 text-red-900",
};

export default function GradeBadge({ grade, gradePoint, size }) {
  const cls = colors[grade] || "bg-gray-100 text-gray-800";
  const s = size === "lg" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-bold ${cls} ${s}`}>
      {grade}
      {gradePoint !== undefined && <span className="opacity-75">({gradePoint})</span>}
    </span>
  );
}
