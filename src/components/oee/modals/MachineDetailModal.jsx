"use client";

import StatusDot from "@/components/oee/charts/StatusDot";
import ModalShell from "@/components/oee/modals/ModalShell";

export default function MachineDetailModal({ machine, onClose, onControl }) {
  const m = machine;
  return (
    <ModalShell title={`${m.name} — Line ${m.line}`} onClose={onClose} widthClass="w-[420px]">
      <div className="space-y-3">
        <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-3 font-mono text-xs">
          <span className="font-bold text-sky-400">{m.oee}%</span>
          <span className="mx-2 text-slate-700">=</span>
          <span className="text-emerald-400">{Math.round(m.availability)}%</span>
          <span className="mx-1 text-slate-700">×</span>
          <span className="text-amber-400">{Math.round(m.performance)}%</span>
          <span className="mx-1 text-slate-700">×</span>
          <span className="text-violet-400">{Math.round(m.quality)}%</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            ["OEE", `${m.oee}%`, "#22d3ee"],
            ["Availability", `${Math.round(m.availability)}%`, "#22c55e"],
            ["Performance", `${Math.round(m.performance)}%`, "#f59e0b"],
            ["Quality", `${Math.round(m.quality)}%`, "#a78bfa"],
          ].map(([l, v, c]) => (
            <div key={l} className="rounded-xl bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)] p-3">
              <div className="text-[10px] text-slate-500">{l}</div>
              <div className="font-mono text-lg font-bold" style={{ color: c }}>
                {v}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)] p-3 text-sm">
          {[
            ["Status", <span key="s"><StatusDot status={m.status} />{m.status}</span>],
            ["Good/Total", `${m.goodCount.toLocaleString()}/${m.totalCount.toLocaleString()}`],
            ["Scrap", `${m.scrapCount.toLocaleString()} units`],
            ["Run Time", `${m.runMins}/${m.plannedMins} min`],
          ].map(([l, v]) => (
            <div key={l} className="mb-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">{l}</span>
              <span className="font-mono text-slate-200">{v}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/30 px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
          >
            ปิด
          </button>
          <button
            onClick={() => {
              onControl();
              onClose();
            }}
            className="flex-1 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm font-bold text-sky-200"
          >
            ⚙ Control
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
