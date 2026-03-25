"use client";

import { useMemo, useState } from "react";

import { REFRESH_OPTIONS } from "@/lib/oee/constants";

export default function RefreshSelector({ interval, onChange }) {
  const [open, setOpen] = useState(false);

  const cur = useMemo(() => REFRESH_OPTIONS.find((o) => o.ms === interval) || REFRESH_OPTIONS[1], [interval]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-md border border-[var(--oee-border-2)] bg-[var(--oee-surface-2)]/70 px-2 py-1 font-mono text-[10px] text-sky-200 hover:border-sky-500/40"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
        ⟳ Live·{cur.label} ▾
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[140px] rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface)]/95 p-2 shadow-[0_16px_60px_rgba(0,0,0,0.75)]">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500">Interval</div>
          {REFRESH_OPTIONS.map((o) => (
            <button
              key={o.ms}
              onClick={() => {
                onChange(o.ms);
                setOpen(false);
              }}
              className={
                "block w-full rounded-lg px-2 py-1.5 text-left font-mono text-[10px] transition " +
                (o.ms === interval
                  ? "bg-[var(--oee-surface-2)]/70 text-sky-200"
                  : "bg-transparent text-slate-400 hover:bg-[var(--oee-surface-2)]/50")
              }
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
