export default function StatsCard({ title, value, subtitle, icon, color, trend }) {
  return (
    <div className="group bg-white rounded-xl shadow-sm border border-navy-100 p-6 hover:shadow-md hover:border-navy-200 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-navy-900 mt-1.5 tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-sm text-navy-400 mt-1.5 truncate">{subtitle}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center gap-1 mt-2 text-xs font-medium ${trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={trend.direction === 'up' ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
              </svg>
              {trend.label}
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ml-4 bg-gradient-to-br ${color || 'from-navy-500 to-navy-600'} shadow-sm`}>
            <svg className={`w-6 h-6 text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
