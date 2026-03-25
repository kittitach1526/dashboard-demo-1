"use client";

export default function Card({ title, right, children }) {
  return (
    <section className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface)]/90 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      {(title || right) && (
        <div className="mb-3 flex items-center gap-2">
          {title && <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</div>}
          <div className="ml-auto">{right}</div>
        </div>
      )}
      {children}
    </section>
  );
}
