"use client";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

export default function DataYearlyPage() {
  const { user, kpi } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  if (!allowed.includes("data")) {
    return (
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-10 text-center text-slate-400">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-sm font-semibold text-slate-300">Access Restricted</div>
      </div>
    );
  }

  const year = new Date().getFullYear();
  const months = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const currentMonth = new Date().getMonth();
  const monthlyData = months.slice(0, currentMonth + 1).map((name, i) => {
    // Use deterministic variation based on month number
    const deterministicRandom = Math.abs(Math.sin(i * 100) * 100) % 100;
    return {
      name,
      oee: Math.max(50, Math.min(99, Math.round(Number(kpi.oee) + (deterministicRandom / 100 - 0.5) * 15))),
      avail: Math.max(50, Math.min(99, Math.round(Number(kpi.avail) + (deterministicRandom / 100 - 0.5) * 10))),
      perf: Math.max(50, Math.min(99, Math.round(Number(kpi.perf) + (deterministicRandom / 100 - 0.5) * 10))),
      qual: Math.max(50, Math.min(99, Math.round(Number(kpi.qual) + (deterministicRandom / 100 - 0.5) * 5))),
    };
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-5 shadow-xl">
        <h1 className="text-xl font-bold text-slate-100">📊 ข้อมูลรายปี</h1>
        <p className="text-sm text-slate-400 mt-1">ข้อมูลการผลิตประจำปี {year + 543}</p>
      </div>

      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--oee-border)] bg-[var(--oee-surface)]/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">เดือน</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">OEE%</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Availability%</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Performance%</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Quality%</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((m, i) => (
                <tr key={i} className="border-b border-[var(--oee-border)]/50 hover:bg-[var(--oee-surface)]/30 transition">
                  <td className="px-4 py-3 font-semibold text-slate-100">{m.name}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-sky-300">{m.oee}%</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-300">{m.avail}%</td>
                  <td className="px-4 py-3 text-right font-mono text-amber-300">{m.perf}%</td>
                  <td className="px-4 py-3 text-right font-mono text-violet-300">{m.qual}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
