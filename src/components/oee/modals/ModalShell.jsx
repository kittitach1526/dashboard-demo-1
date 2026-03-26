"use client";

export default function ModalShell({ title, onClose, children, widthClass = "w-[560px]" }) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className={`w-[97vw] sm:${widthClass} max-w-[97vw] max-h-[92vh] overflow-y-auto rounded-2xl border border-[var(--oee-border-2)] bg-[var(--oee-surface)]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.75)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="text-sm font-bold text-slate-100">{title}</div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 text-slate-400 hover:text-slate-200"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
