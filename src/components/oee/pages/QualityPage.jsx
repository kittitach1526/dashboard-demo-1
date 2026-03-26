"use client";

import { useMemo } from "react";

import Card from "@/components/oee/ui/Card";
import MiniBar from "@/components/oee/charts/MiniBar";
import Spark from "@/components/oee/charts/Spark";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";
import { getDefects } from "@/lib/oee/derived";

export default function QualityPage() {
  const { user, ms, kpi } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  const defects = useMemo(() => getDefects(ms), [ms]);

  if (!allowed.includes("quality")) {
    return (
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-10 text-center text-slate-400">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-sm font-semibold text-slate-300">Access Restricted</div>
        <div className="text-xs mt-1">Role: {user?.role}</div>
      </div>
    );
  }

  const totalScrap = ms.reduce((s, m) => s + m.scrapCount, 0);

  return (
    <div className="space-y-3">
      <Card title="✅ Quality Calculation — ISO 22400">
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 p-3">
            <div className="text-[10px] text-slate-500">FORMULA</div>
            <div className="mt-1 font-mono text-xs text-violet-200">Quality = Good Count / Total Count × 100</div>
          </div>

          {[
            { l: "Good Units", v: kpi.totalGood.toLocaleString(), c: "text-emerald-200" },
            { l: "Total Units", v: kpi.totalCount.toLocaleString(), c: "text-slate-200" },
            { l: "Scrap", v: (kpi.totalCount - kpi.totalGood).toLocaleString(), c: "text-red-200" },
            { l: "FPY", v: `${kpi.qual}%`, c: "text-violet-200", big: true },
            { l: "Scrap Rate", v: `${(100 - kpi.qual).toFixed(1)}%`, c: "text-orange-200", big: true },
          ].map((k) => (
            <div key={k.l} className="w-full sm:min-w-[140px] flex-1 rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 p-3">
              <div className="text-[10px] text-slate-500">{k.l}</div>
              <div className={"mt-1 font-mono font-bold " + (k.big ? "text-2xl" : "text-lg") + " " + k.c}>{k.v}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card title="🎯 Quality by Machine">
          <div className="space-y-3">
            {ms.map((m) => (
              <div key={m.id}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-sm text-slate-300">{m.name}</div>
                  <div className="font-mono text-xs">
                    <span className="text-emerald-200">{m.goodCount.toLocaleString()}</span>
                    <span className="text-slate-500">/{m.totalCount.toLocaleString()}</span>
                    <span className="ml-2 font-bold text-violet-200">{Math.round(m.quality)}%</span>
                  </div>
                </div>
                <MiniBar pct={m.quality} color={m.quality >= 97 ? "#22c55e" : m.quality >= 93 ? "#f59e0b" : "#ef4444"} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="❌ Defect Pareto">
          <div className="space-y-3">
            {defects.map((d, i) => {
              const cols = ["#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16"];
              const col = cols[i % cols.length];
              return (
                <div key={d.type}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="text-sm text-slate-300">{d.type}</div>
                    <div className="font-mono text-xs text-slate-200">
                      {d.count} <span className="text-slate-500">({d.pct}%)</span>
                    </div>
                  </div>
                  <div className="h-2 rounded bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)]">
                    <div className="h-2 rounded" style={{ width: `${d.pct}%`, background: col }} />
                  </div>
                </div>
              );
            })}

            <div className="mt-4 rounded-xl bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)] p-3">
              <div className="text-[10px] text-slate-500">TOTAL SCRAP</div>
              <div className="font-mono text-2xl font-bold text-red-300">{totalScrap.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        <Card title="📈 Quality Trends">
          <div className="space-y-3">
            {ms.map((m) => (
              <div key={m.id}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-sm text-slate-300">{m.name}</div>
                  <div className="font-mono text-xs text-violet-200">{Math.round(m.quality)}%</div>
                </div>
                <Spark data={m.qualHist} color="#a78bfa" h={20} w={180} target={95} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
