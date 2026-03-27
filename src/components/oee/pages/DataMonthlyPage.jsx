"use client";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

export default function DataMonthlyPage() {
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
  const monthStr = today.toLocaleDateString("th-TH", { year: "numeric", month: "long" });

  const weeks = Array.from({ length: 4 }, (_, i) => {
    // Use deterministic variation based on week number
    const deterministicRandom = Math.abs(Math.sin(i * 100) * 100) % 100;
    return {
      label: `สัปดาห์ที่ ${i + 1}`,
      oee: Math.max(50, Math.min(99, Math.round(Number(kpi.oee) + (deterministicRandom / 100 - 0.5) * 10))),
      avail: Math.max(50, Math.min(99, Math.round(Number(kpi.avail) + (deterministicRandom / 100 - 0.5) * 8))),
      perf: Math.max(50, Math.min(99, Math.round(Number(kpi.perf) + (deterministicRandom / 100 - 0.5) * 8))),
      qual: Math.max(50, Math.min(99, Math.round(Number(kpi.qual) + (deterministicRandom / 100 - 0.5) * 5))),
    };
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-5 shadow-xl">
        <h1 className="text-xl font-bold text-slate-100">📆 ข้อมูลรายเดือน</h1>
        <p className="text-sm text-slate-400 mt-1">ข้อมูลการผลิตประจำเดือน {monthStr}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {weeks.map((w, i) => (
          <div key={i} className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-5 shadow-xl">
            <h2 className="text-base font-bold text-slate-100 mb-3">{w.label}</h2>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-xs text-slate-400">OEE</div>
                <div className="font-mono text-xl font-bold text-sky-300">{w.oee}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Avail</div>
                <div className="font-mono text-xl font-bold text-emerald-300">{w.avail}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Perf</div>
                <div className="font-mono text-xl font-bold text-amber-300">{w.perf}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-slate-400">Qual</div>
                <div className="font-mono text-xl font-bold text-violet-300">{w.qual}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
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
    </div>
  );
}
