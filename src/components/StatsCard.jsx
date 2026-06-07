export default function StatsCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-navy-500">{title}</p>
          <p className="text-3xl font-bold text-navy-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-navy-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color || "bg-navy-100"}`}>
            <svg className={`w-6 h-6 ${color ? "text-white" : "text-navy-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
