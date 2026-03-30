"use client";

import { useState } from "react";

import ModalShell from "@/components/oee/modals/ModalShell";

const DEFAULT_SHIFT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];
const SHIFT_COLOR_SWATCHES = [
  "#3b82f6",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#6366f1",
  "#8b5cf6",
  "#a78bfa",
  "#f59e0b",
  "#f97316",
  "#ef4444",
];

export default function ShiftModal({ shifts, onSave, onClose }) {
  const [local, setLocal] = useState(
    shifts.map((s, i) => ({ 
      ...s, 
      color: s.color || DEFAULT_SHIFT_COLORS[i] || "#3b82f6" 
    }))
  );

  const upd = (i, k, v) => setLocal((prev) => prev.map((s, idx) => (idx === i ? { ...s, [k]: v } : s)));

  return (
    <ModalShell title="⏰ กำหนดการทำงานกะ (4 กะ)" onClose={onClose} widthClass="w-[560px]">
      <div className="space-y-3">
        {local.map((s, i) => (
          <div
            key={s.id}
            className={
              "rounded-xl border p-4 " +
              (s.active
                ? "border-[var(--oee-border-2)] bg-[var(--oee-surface-2)]/60"
                : "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40")
            }
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={
                    "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold " +
                    (s.active
                      ? "border-sky-500 text-sky-200"
                      : "border-[var(--oee-border)] text-slate-500")
                  }
                  style={{
                    backgroundColor: s.active ? `${s.color}20` : 'var(--oee-surface-2)',
                    borderColor: s.active ? s.color : undefined
                  }}
                >
                  {i + 1}
                </div>
                <div className={"text-sm font-semibold " + (s.active ? "text-slate-100" : "text-slate-500")}>{s.name}</div>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={s.active}
                    onChange={() => upd(i, "active", !s.active)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" 
                  style={{
                    backgroundColor: s.active ? s.color : '#4b5563'
                  }}></div>
                </label>
                <span className={"text-xs font-medium " + (s.active ? "text-green-400" : "text-gray-500")}>
                  {s.active ? "เปิดใช้งาน" : "ปิด"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">ชื่อกะ</div>
                <input
                  value={s.name}
                  onChange={(e) => upd(i, "name", e.target.value)}
                  className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">เวลาเริ่ม</div>
                <input
                  type="time"
                  value={s.start}
                  onChange={(e) => upd(i, "start", e.target.value)}
                  className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">เวลาสิ้นสุด</div>
                <input
                  type="time"
                  value={s.end}
                  onChange={(e) => upd(i, "end", e.target.value)}
                  className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">สีประจำกะ</div>
                <div className="flex flex-wrap items-center gap-2">
                  {SHIFT_COLOR_SWATCHES.map((c) => {
                    const active = (s.color || "").toLowerCase() === c.toLowerCase();
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => upd(i, "color", c)}
                        className={
                          "h-7 w-7 rounded-full border transition-all " +
                          (active
                            ? "border-white/70 ring-2 ring-white/20"
                            : "border-white/10 hover:border-white/30")
                        }
                        style={{ backgroundColor: c }}
                        title={c}
                        aria-label={`Select color ${c}`}
                      />
                    );
                  })}
                </div>
                <div className="mt-2 font-mono text-[10px] text-slate-500">{s.color || "#3b82f6"}</div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => {
              onSave(local);
              onClose();
            }}
            className="flex-[2] rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 px-3 py-2 text-sm font-bold text-white"
          >
            💾 บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
