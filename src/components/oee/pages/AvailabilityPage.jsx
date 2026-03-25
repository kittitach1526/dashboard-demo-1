"use client";

import { useMemo } from "react";

import Card from "@/components/oee/ui/Card";
import StatusDot from "@/components/oee/charts/StatusDot";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

export default function AvailabilityPage() {
  const { user, ms, kpi } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  const timeline = useMemo(() => {
    return ms.slice(0, 4).map((m) => {
      const r = m.availability / 100;
      const bl = [
        { t: "run", w: Math.round(r * 55) },
        { t: "down", w: Math.round((1 - r) * 20) },
        { t: "run", w: Math.round(r * 15) },
        { t: "idle", w: 10 },
      ];
      return { m, bl };
    });
  }, [ms]);

  if (!allowed.includes("availability")) {
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
      <Card title="⏱ Availability by Machine">
        <div className="space-y-3">
          {ms.map((m) => (
            <div key={m.id}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <StatusDot status={m.status} />
                  <span>{m.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-emerald-300">{Math.round(m.availability)}%</span>
                  <span className="text-[11px] text-slate-500">({m.runMins}/{m.plannedMins}m)</span>
                </div>
              </div>
              <div className="relative h-3 rounded bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)]">
                <div
                  className="h-3 rounded bg-gradient-to-r from-emerald-700 to-emerald-400"
                  style={{ width: `${m.availability}%` }}
                />
                <div className="absolute -top-0.5 h-4 w-px bg-amber-400/60" style={{ left: "85%" }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-slate-500">Yellow mark = 85% target</div>
      </Card>

      <Card title="📋 Shift Timeline">
        <div className="space-y-3">
          {timeline.map(({ m, bl }) => (
            <div key={m.id}>
              <div className="mb-1 flex items-center justify-between text-[12px]">
                <span className="text-slate-300">{m.name}</span>
                <span className="font-mono text-emerald-300">{m.runMins}m run</span>
              </div>
              <div className="flex h-3 gap-1 overflow-hidden rounded">
                {bl.map((b, i) => (
                  <div
                    key={i}
                    className="rounded"
                    style={{
                      flex: b.w,
                      background: b.t === "run" ? "#166534" : b.t === "down" ? "#991b1b" : "#78350f",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="mt-2 flex gap-4 text-[11px] text-slate-500">
            {["Running", "Downtime", "Idle"].map((l, i) => (
              <div key={l} className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded"
                  style={{ background: i === 0 ? "#166534" : i === 1 ? "#991b1b" : "#78350f" }}
                />
                {l}
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)] p-3">
            <div>
              <div className="text-[10px] text-slate-500">FACTORY AVAIL</div>
              <div className="font-mono text-lg font-bold text-sky-300">{kpi.avail}%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">RUN TIME</div>
              <div className="font-mono text-lg font-bold text-emerald-300">{kpi.planned - kpi.totalDown}m</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">DOWNTIME</div>
              <div className="font-mono text-lg font-bold text-red-300">{kpi.totalDown}m</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
