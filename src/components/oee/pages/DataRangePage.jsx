"use client";

import { useState } from "react";
import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

export default function DataRangePage() {
  const { user, ms, kpi } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [searched, setSearched] = useState(false);

  if (!allowed.includes("data")) {
    return (
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-10 text-center text-slate-400">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-sm font-semibold text-slate-300">Access Restricted</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-5 shadow-xl">
        <h1 className="text-xl font-bold text-slate-100">🔍 ดูข้อมูลตามช่วงเวลา</h1>
        <p className="text-sm text-slate-400 mt-1">เลือกช่วงวันที่ที่ต้องการดูข้อมูล</p>

        <div className="flex flex-wrap items-end gap-4 mt-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">วันที่เริ่มต้น</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/80 px-3 py-2 text-sm text-slate-100 font-mono outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">วันที่สิ้นสุด</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/80 px-3 py-2 text-sm text-slate-100 font-mono outline-none focus:border-sky-500"
            />
          </div>
          <button
            onClick={() => setSearched(true)}
            className="rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 px-5 py-2 text-sm font-bold text-white hover:from-sky-400 hover:to-indigo-400 transition"
          >
            ค้นหา
          </button>
        </div>
      </div>

      {searched && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-4 text-center shadow-xl">
              <div className="text-xs text-slate-400 mb-1">OEE</div>
              <div className="font-mono text-3xl font-bold text-sky-300">{kpi.oee}%</div>
            </div>
            <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-4 text-center shadow-xl">
              <div className="text-xs text-slate-400 mb-1">Availability</div>
              <div className="font-mono text-3xl font-bold text-emerald-300">{kpi.avail}%</div>
            </div>
            <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-4 text-center shadow-xl">
              <div className="text-xs text-slate-400 mb-1">Performance</div>
              <div className="font-mono text-3xl font-bold text-amber-300">{kpi.perf}%</div>
            </div>
            <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-4 text-center shadow-xl">
              <div className="text-xs text-slate-400 mb-1">Quality</div>
              <div className="font-mono text-3xl font-bold text-violet-300">{kpi.qual}%</div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[var(--oee-border)]">
              <p className="text-sm text-slate-300">
                ข้อมูลช่วง <span className="font-mono text-sky-300">{startDate}</span> ถึง <span className="font-mono text-sky-300">{endDate}</span>
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--oee-border)] bg-[var(--oee-surface)]/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Machine</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Line</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">OEE%</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Avail%</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Perf%</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Qual%</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Good</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ms.map((m) => (
                    <tr key={m.id} className="border-b border-[var(--oee-border)]/50 hover:bg-[var(--oee-surface)]/30 transition">
                      <td className="px-4 py-3 font-semibold text-slate-100">{m.name}</td>
                      <td className="px-4 py-3 text-slate-400">{m.line}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-sky-300">{m.oee}%</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-300">{Math.round(m.availability)}%</td>
                      <td className="px-4 py-3 text-right font-mono text-amber-300">{Math.round(m.performance)}%</td>
                      <td className="px-4 py-3 text-right font-mono text-violet-300">{Math.round(m.quality)}%</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">{m.goodCount}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300">{m.totalCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!searched && (
        <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-10 text-center shadow-xl">
          <div className="text-5xl mb-4">🔍</div>
          <div className="text-lg font-bold text-slate-300">เลือกช่วงเวลาที่ต้องการ</div>
          <div className="text-sm text-slate-400 mt-1">กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด แล้วกดค้นหา</div>
        </div>
      )}
    </div>
  );
}
