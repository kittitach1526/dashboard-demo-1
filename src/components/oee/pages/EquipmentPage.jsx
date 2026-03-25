"use client";

import { useMemo, useState } from "react";

import Card from "@/components/oee/ui/Card";
import StatusDot from "@/components/oee/charts/StatusDot";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";
import { getAggregatedDowntime } from "@/lib/oee/derived";

import MachineCtrlModal from "@/components/oee/modals/MachineCtrlModal";
import MachineDetailModal from "@/components/oee/modals/MachineDetailModal";

export default function EquipmentPage() {
  const { user, ms, setMs, kpi } = useOEE();
  const [selectedM, setSelectedM] = useState(null);
  const [ctrlM, setCtrlM] = useState(null);

  const allowed = ROLE_ACCESS[user?.role] || ["overview"];
  const aggDT = useMemo(() => getAggregatedDowntime(ms), [ms]);

  if (!allowed.includes("equipment")) {
    return (
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-10 text-center text-slate-400">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-sm font-semibold text-slate-300">Access Restricted</div>
        <div className="text-xs mt-1">Role: {user?.role}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      <Card title="📊 Downtime Pareto">
        <div className="space-y-3">
          {aggDT.map((d, i) => {
            const cols = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16"];
            const col = cols[i % cols.length];
            return (
              <div key={d.reason}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-sm text-slate-300">{d.reason}</div>
                  <div className="font-mono text-sm text-slate-200">
                    {d.mins}m <span className="text-slate-500">({d.pct}%)</span>
                  </div>
                </div>
                <div className="h-2 rounded bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)]">
                  <div className="h-2 rounded" style={{ width: `${d.pct}%`, background: col }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[var(--oee-surface-2)]/70 border border-[var(--oee-border)] p-3">
            <div className="text-[10px] text-slate-500">TOTAL DOWNTIME</div>
            <div className="font-mono text-xl font-bold text-red-300">{kpi.totalDown}m</div>
            <div className="text-[11px] text-slate-500">{Math.round((kpi.totalDown / kpi.planned) * 100)}% of planned</div>
          </div>
          <div className="rounded-xl bg-[var(--oee-surface-2)]/70 border border-[var(--oee-border)] p-3">
            <div className="text-[10px] text-slate-500">TOTAL RUN TIME</div>
            <div className="font-mono text-xl font-bold text-emerald-300">{kpi.planned - kpi.totalDown}m</div>
            <div className="text-[11px] text-slate-500">{Math.round(((kpi.planned - kpi.totalDown) / kpi.planned) * 100)}% utilised</div>
          </div>
        </div>
      </Card>

      <Card title="📋 Equipment Live Table" right={<span className="text-[11px] text-slate-500">คลิก ⚙ เพื่อควบคุม</span>}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-[11px] text-slate-500">
                {["Machine", "L", "OEE", "Avail", "Perf", "Qual", "Good", "Total", "Status", ""].map((h) => (
                  <th key={h} className="border-b border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 px-2 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ms.map((m) => (
                <tr key={m.id} className="border-b border-[var(--oee-border)]/70 hover:bg-[var(--oee-surface-2)]/30">
                  <td className="px-2 py-2 font-semibold">
                    <button onClick={() => setSelectedM(m)} className="hover:underline">
                      {m.name}
                    </button>
                  </td>
                  <td className="px-2 py-2 text-slate-500">{m.line}</td>
                  <td className={"px-2 py-2 font-mono font-bold " + (m.oee >= 85 ? "text-sky-300" : m.oee >= 70 ? "text-amber-300" : "text-red-300")}>
                    {m.oee}%
                  </td>
                  <td className="px-2 py-2 font-mono text-emerald-300">{Math.round(m.availability)}%</td>
                  <td className="px-2 py-2 font-mono text-amber-300">{Math.round(m.performance)}%</td>
                  <td className="px-2 py-2 font-mono text-violet-300">{Math.round(m.quality)}%</td>
                  <td className="px-2 py-2 font-mono text-emerald-200">{m.goodCount.toLocaleString()}</td>
                  <td className="px-2 py-2 font-mono text-slate-200">{m.totalCount.toLocaleString()}</td>
                  <td className="px-2 py-2 text-slate-300">
                    <StatusDot status={m.status} />
                    <span className="text-[11px] text-slate-400">{m.status}</span>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => setCtrlM(m)}
                      className="rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      ⚙
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedM && <MachineDetailModal machine={selectedM} onClose={() => setSelectedM(null)} onControl={() => setCtrlM(selectedM)} />}

      {ctrlM && (
        <MachineCtrlModal
          machine={ctrlM}
          onUpdate={(updated) => setMs((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)))}
          onClose={() => setCtrlM(null)}
        />
      )}
    </div>
  );
}
