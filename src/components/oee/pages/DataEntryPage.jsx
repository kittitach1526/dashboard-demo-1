"use client";

import { useMemo, useState } from "react";

import Card from "@/components/oee/ui/Card";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";
import { getActiveShift } from "@/lib/oee/derived";

import DataEntryModal from "@/components/oee/modals/DataEntryModal";
import ShiftModal from "@/components/oee/modals/ShiftModal";

export default function DataEntryPage() {
  const { user, ms, shifts, setShifts, time } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  const [showShift, setShowShift] = useState(false);
  const [showEntry, setShowEntry] = useState(false);

  const activeShift = useMemo(() => getActiveShift(shifts, time), [shifts, time]);

  if (!allowed.includes("data-entry")) {
    return (
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-10 text-center text-slate-400">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-sm font-semibold text-slate-300">Access Restricted</div>
        <div className="text-xs mt-1">Role: {user?.role}</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <div className="text-center">
          <div className="text-5xl mb-4">📝</div>
          <div className="text-xl font-bold text-slate-100">Data Entry Center</div>
          <div className="mt-2 text-sm text-slate-400">กรอกข้อมูลการผลิต Downtime และคุณภาพเข้าสู่ระบบ</div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowEntry(true)}
              className="rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 px-6 py-3 text-sm font-bold text-white"
            >
              📦 กรอกข้อมูลการผลิต
            </button>
            <button
              onClick={() => setShowShift(true)}
              className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-6 py-3 text-sm font-bold text-sky-200"
            >
              ⏰ ตั้งค่ากะการทำงาน
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {shifts.map((s, i) => (
              <div
                key={s.id}
                className={
                  "rounded-xl border p-4 text-left " +
                  (s.active
                    ? "border-[var(--oee-border-2)] bg-[var(--oee-surface-2)]/60"
                    : "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40")
                }
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className={"text-xs font-bold " + (s.active ? "text-sky-200" : "text-slate-500")}>กะ {i + 1}</div>
                  <div
                    className={
                      "rounded-full border px-2 py-0.5 font-mono text-[10px] " +
                      (s.active
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                        : "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 text-slate-400")
                    }
                  >
                    {s.active ? "เปิด" : "ปิด"}
                  </div>
                </div>
                <div className={"text-sm font-semibold " + (s.active ? "text-slate-100" : "text-slate-500")}>{s.name}</div>
                <div className="mt-1 font-mono text-xs text-slate-500">
                  {s.start} – {s.end}
                </div>
                {activeShift?.id === s.id && <div className="mt-2 text-xs font-semibold text-sky-300">● กะปัจจุบัน</div>}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {showShift && <ShiftModal shifts={shifts} onSave={setShifts} onClose={() => setShowShift(false)} />}
      {showEntry && (
        <DataEntryModal
          machines={ms}
          shifts={shifts}
          onSave={(data) => console.log("Saved:", data)}
          onClose={() => setShowEntry(false)}
        />
      )}
    </div>
  );
}
