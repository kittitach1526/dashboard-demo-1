"use client";

import { useMemo, useState } from "react";

import Card from "@/components/oee/ui/Card";
import GaugeChart from "@/components/oee/charts/GaugeChart";
import Spark from "@/components/oee/charts/Spark";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

import MachineCtrlModal from "@/components/oee/modals/MachineCtrlModal";

export default function PerformancePage() {
  const { user, ms, setMs, kpi } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];
  const [ctrlM, setCtrlM] = useState(null);

  const idealCT = ms[0]?.idealCT ?? 0.5;

  const perfBanner = useMemo(
    () => [
      { l: "Ideal CT", v: `${idealCT} min/unit`, c: "text-sky-200" },
      { l: "Total Count", v: kpi.totalCount.toLocaleString(), c: "text-amber-200" },
      { l: "Run Time", v: `${kpi.planned - kpi.totalDown} min`, c: "text-emerald-200" },
      { l: "Performance", v: `${kpi.perf}%`, c: "text-amber-200", big: true },
      { l: "OEE", v: `${kpi.oee}%`, c: "text-sky-200", big: true },
    ],
    [idealCT, kpi]
  );

  if (!allowed.includes("performance")) {
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
      <Card title="🔗 Performance Calculation — ISO 22400">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl bg-[var(--oee-surface-2)]/70 border border-[var(--oee-border)] p-3">
            <div className="text-[10px] text-slate-500">FORMULA</div>
            <div className="mt-1 font-mono text-xs text-amber-200">Perf = (ICT × Count) / Run Time × 100</div>
            <div className="mt-1 text-[11px] text-slate-500">ICT = Ideal Cycle Time = {idealCT} min/unit</div>
          </div>

          {perfBanner.map((k) => (
            <div key={k.l} className="w-full sm:min-w-[140px] flex-1 rounded-xl bg-[var(--oee-surface-2)]/70 border border-[var(--oee-border)] p-3">
              <div className="text-[10px] text-slate-500">{k.l}</div>
              <div className={"mt-1 font-mono font-bold " + (k.big ? "text-2xl" : "text-lg") + " " + k.c}>{k.v}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {ms.map((m) => {
          const perfCalc = m.runMins > 0 ? ((m.idealCT * m.totalCount) / m.runMins * 100).toFixed(1) : "0.0";
          return (
            <Card key={m.id} title={`⚙ ${m.name} — Line ${m.line}`}>
              <div className="flex items-center gap-3">
                <GaugeChart value={Math.round(m.performance)} color="#f59e0b" size={78} />
                <div>
                  <div className="text-[11px] text-slate-500">Performance</div>
                  <div className="font-mono text-2xl font-extrabold text-amber-300">{Math.round(m.performance)}%</div>
                  <Spark data={m.perfHist} color="#f59e0b" h={26} w={90} />
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-[var(--oee-surface-2)]/70 border border-[var(--oee-border)] p-3 font-mono text-xs text-slate-300">
                <div className="text-[10px] text-slate-500">CALCULATION</div>
                <div className="mt-2 space-y-1">
                  <div>
                    ICT × Count = <span className="text-amber-200">{m.idealCT} × {m.totalCount.toLocaleString()} = {(m.idealCT * m.totalCount).toFixed(0)} min</span>
                  </div>
                  <div>
                    ÷ Run Time = <span className="text-emerald-200">{m.runMins} min</span>
                  </div>
                  <div className="mt-2 border-t border-[var(--oee-border)] pt-2">
                    = <span className="text-sm font-bold text-amber-200">{perfCalc}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                {[
                  ["Output", `${m.totalCount.toLocaleString()} units`, "text-slate-200"],
                  ["Run Time", `${m.runMins} min`, "text-emerald-200"],
                  ["OEE", `${m.oee}%`, "text-sky-200"],
                ].map(([l, v, c]) => (
                  <div key={l} className="flex items-center justify-between">
                    <span className="text-slate-500">{l}</span>
                    <span className={"font-mono " + c}>{v}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setCtrlM(m)}
                className="mt-3 w-full rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs font-bold text-sky-200"
              >
                ⚙ Control Panel
              </button>
            </Card>
          );
        })}
      </div>

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
