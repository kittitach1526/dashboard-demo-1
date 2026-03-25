"use client";

import { useMemo } from "react";

import Card from "@/components/oee/ui/Card";

import TrendSVG from "@/components/oee/charts/TrendSVG";
import HeatMap from "@/components/oee/charts/HeatMap";
import OutputBar from "@/components/oee/charts/OutputBar";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

export default function AnalyticsPage() {
  const { user, ms, kpi, trendHist, heatData, shiftHours } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  const tMets = useMemo(
    () => [
      { key: "oee", color: "#22d3ee" },
      { key: "avail", color: "#22c55e" },
      { key: "perf", color: "#f59e0b" },
      { key: "qual", color: "#a78bfa" },
    ],
    []
  );

  const td = trendHist.length > 1 ? trendHist : ms.map((m) => ({ label: m.name, oee: m.oee, avail: Math.round(m.availability), perf: Math.round(m.performance), qual: Math.round(m.quality) }));

  if (!allowed.includes("analytics")) {
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
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card title={`📈 Live OEE Trend (${td.length} samples)`}>
          <TrendSVG data={td} metrics={tMets} />
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            {[
              ["OEE", "#22d3ee", kpi.oee],
              ["Avail", "#22c55e", kpi.avail],
              ["Perf", "#f59e0b", kpi.perf],
              ["Qual", "#a78bfa", kpi.qual],
            ].map(([l, c, v]) => (
              <div key={l} className="flex items-center gap-2">
                <div className="h-0.5 w-5 rounded" style={{ background: c }} />
                <span className="text-slate-500">{l}</span>
                <span className="font-mono font-bold" style={{ color: c }}>
                  {v}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="🌡 OEE Heat Map">
          <HeatMap data={heatData} days={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} shifts={["Day", "Aft", "Night"]} />
        </Card>
      </div>

      <Card title="📦 Hourly Output vs Target">
        {shiftHours.length > 0 && <OutputBar data={shiftHours} />}
        <div className="mt-2 flex gap-6 text-xs text-slate-500">
          {[
            ["≥Target", "#22c55e", "h-2"],
            ["<Target", "#ef4444", "h-2"],
            ["Target", "#f59e0b", "h-[2px]"],
          ].map(([l, c, h]) => (
            <div key={l} className="flex items-center gap-2">
              <div className={"w-4 rounded " + h} style={{ background: c }} />
              {l}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
