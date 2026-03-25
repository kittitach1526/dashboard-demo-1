"use client";

import { useState } from "react";

import ModalShell from "@/components/oee/modals/ModalShell";

export default function MachineCtrlModal({ machine, onUpdate, onClose }) {
  const [ms, setMs] = useState({ ...machine });
  const [aBase, setABase] = useState(machine.baseAvail);
  const [pBase, setPBase] = useState(machine.basePerf);
  const [qBase, setQBase] = useState(machine.baseQual);

  const apply = () => {
    onUpdate({ ...ms, baseAvail: aBase, basePerf: pBase, baseQual: qBase, forcedStatus: ms.forcedStatus });
    onClose();
  };

  const statusBtns = [
    ["running", "▶ RUN", "#22c55e"],
    ["idle", "⏸ IDLE", "#f59e0b"],
    ["breakdown", "■ DOWN", "#ef4444"],
  ];

  return (
    <ModalShell title={`⚙ ${ms.name} — Line ${ms.line}`} onClose={onClose} widthClass="w-[480px]">
      <div className="space-y-4">
        <div>
          <div className="mb-2 text-[11px] font-semibold text-slate-400">🎮 จำลองสถานะเครื่องจักร</div>
          <div className="flex gap-2">
            {statusBtns.map(([st, lbl, col]) => {
              const active = ms.forcedStatus === st;
              return (
                <button
                  key={st}
                  onClick={() =>
                    setMs((p) => ({
                      ...p,
                      forcedStatus: p.forcedStatus === st ? null : st,
                      status: p.forcedStatus === st ? p.status : st,
                    }))
                  }
                  className="flex-1 rounded-xl border-2 px-2 py-2 text-xs font-semibold transition"
                  style={{
                    borderColor: active ? col : `${col}40`,
                    background: active ? `${col}25` : "transparent",
                    color: active ? col : `${col}AA`,
                  }}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
          {ms.forcedStatus ? (
            <div className="mt-2 text-center text-xs text-amber-300">
              ⚠ Manual override: <span className="font-bold">{ms.forcedStatus.toUpperCase()}</span>
            </div>
          ) : (
            <div className="mt-2 text-center text-xs text-emerald-300">✓ Auto-simulate mode</div>
          )}
        </div>

        <div className="rounded-xl bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)] p-3">
          <div className="mb-2 text-[11px] font-semibold text-slate-400">📊 ปรับค่าพื้นฐาน (Base Values)</div>
          {["Availability", "Performance", "Quality"].map((label, idx) => {
            const val = idx === 0 ? aBase : idx === 1 ? pBase : qBase;
            const set = idx === 0 ? setABase : idx === 1 ? setPBase : setQBase;
            const col = idx === 0 ? "#22c55e" : idx === 1 ? "#f59e0b" : "#a78bfa";
            return (
              <div key={label} className="mb-3">
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-xs text-slate-300">{label} Base</div>
                  <div className="font-mono text-sm font-bold" style={{ color: col }}>
                    {val}%
                  </div>
                </div>
                <input
                  type="range"
                  min="20"
                  max="99"
                  step="1"
                  value={val}
                  onChange={(e) => set(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: "#0ea5e9" }}
                />
              </div>
            );
          })}

          <div className="rounded-lg bg-[var(--oee-surface)]/70 border border-[var(--oee-border)] p-2 text-center font-mono text-xs">
            <span className="font-bold text-sky-300">OEE Preview: {Math.round((aBase * pBase * qBase) / 100) / 100}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)] p-3">
            <div className="text-[10px] text-slate-500">CURRENT OEE</div>
            <div className="font-mono text-xl font-bold text-sky-400">{ms.oee || machine.oee}%</div>
          </div>
          <div className="rounded-xl bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)] p-3">
            <div className="text-[10px] text-slate-500">GOOD / TOTAL</div>
            <div className="font-mono text-base font-bold text-emerald-400">
              {(ms.goodCount || 0).toLocaleString()}/{(ms.totalCount || 0).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
          >
            ยกเลิก
          </button>
          <button
            onClick={apply}
            className="flex-[2] rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 px-3 py-2 text-sm font-bold text-white"
          >
            ✓ Apply การตั้งค่า
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
