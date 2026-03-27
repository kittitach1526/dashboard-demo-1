"use client";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

export default function DataDailyPage() {
  const { user, ms, kpi } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  if (!allowed.includes("data")) {
    return (
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-10 text-center text-slate-400">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-sm font-semibold text-slate-300">Access Restricted</div>
      </div>
    );
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100">📅 ข้อมูลรายวัน</h1>
            <p className="text-sm text-slate-400 mt-1">ข้อมูลการผลิตประจำวันที่ {dateStr}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
        <div className="grid grid-cols-4 gap-4 p-5 border-b border-[var(--oee-border)]">
          <div className="rounded-xl bg-[var(--oee-surface)]/50 border border-[var(--oee-border)] p-4 text-center">
            <div className="text-xs text-slate-400 mb-1">OEE</div>
            <div className="font-mono text-3xl font-bold text-sky-300">{kpi.oee}%</div>
          </div>
          <div className="rounded-xl bg-[var(--oee-surface)]/50 border border-[var(--oee-border)] p-4 text-center">
            <div className="text-xs text-slate-400 mb-1">Availability</div>
            <div className="font-mono text-3xl font-bold text-emerald-300">{kpi.avail}%</div>
          </div>
          <div className="rounded-xl bg-[var(--oee-surface)]/50 border border-[var(--oee-border)] p-4 text-center">
            <div className="text-xs text-slate-400 mb-1">Performance</div>
            <div className="font-mono text-3xl font-bold text-amber-300">{kpi.perf}%</div>
          </div>
          <div className="rounded-xl bg-[var(--oee-surface)]/50 border border-[var(--oee-border)] p-4 text-center">
            <div className="text-xs text-slate-400 mb-1">Quality</div>
            <div className="font-mono text-3xl font-bold text-violet-300">{kpi.qual}%</div>
          </div>
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
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Status</th>
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
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      m.status === "running" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : m.status === "breakdown" ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
