export default function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${danger ? "bg-red-100" : "bg-navy-100"}`}>
          <svg className={`w-6 h-6 ${danger ? "text-red-600" : "text-navy-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {danger ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-center text-navy-800 mb-2">{title}</h3>
        <p className="text-sm text-center text-navy-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-navy-200 text-navy-600 rounded-lg hover:bg-navy-50 transition-colors font-medium text-sm"
          >
            {cancelLabel || "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm text-white ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-navy-600 hover:bg-navy-700"
            }`}
          >
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
