export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-navy-100 mb-6">
        <svg className="w-10 h-10 text-navy-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-navy-800 mb-2">{title}</h3>
      <p className="text-navy-500 max-w-md mx-auto mb-6">{description}</p>
      {action}
    </div>
  );
}
