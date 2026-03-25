"use client";

import { useMemo, useState } from "react";

import GaugeChart from "@/components/oee/charts/GaugeChart";
import MiniBar from "@/components/oee/charts/MiniBar";
import Spark from "@/components/oee/charts/Spark";
import StatusDot from "@/components/oee/charts/StatusDot";
import Badge from "@/components/oee/ui/Badge";
import Card from "@/components/oee/ui/Card";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

import MachineCtrlModal from "@/components/oee/modals/MachineCtrlModal";
import MachineDetailModal from "@/components/oee/modals/MachineDetailModal";

export default function OverviewPage() {
  const { user, ms, setMs, kpi, trendHist, time } = useOEE();

  const [selectedM, setSelectedM] = useState(null);
  const [ctrlM, setCtrlM] = useState(null);

  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  const alertsCount = useMemo(
    () => ms.filter((m) => m.status === "breakdown").length + ms.filter((m) => m.oee < 65).length,
    [ms]
  );

  const losses = useMemo(
    () => [
      { name: "Breakdowns", val: Math.round((kpi.totalDown / kpi.planned) * 100 * 0.38 * 10) / 10, cat: "Availability", c: "#ef4444" },
      { name: "Changeover", val: Math.round((kpi.totalDown / kpi.planned) * 100 * 0.26 * 10) / 10, cat: "Availability", c: "#f97316" },
      { name: "Small Stops", val: Math.round((100 - kpi.perf) * 0.55 * 10) / 10, cat: "Performance", c: "#f59e0b" },
      { name: "Reduced Speed", val: Math.round((100 - kpi.perf) * 0.45 * 10) / 10, cat: "Performance", c: "#eab308" },
      { name: "Startup Rejects", val: Math.round((100 - kpi.qual) * 0.55 * 10) / 10, cat: "Quality", c: "#a78bfa" },
      { name: "Prod. Rejects", val: Math.round((100 - kpi.qual) * 0.45 * 10) / 10, cat: "Quality", c: "#8b5cf6" },
    ],
    [kpi]
  );

  if (!allowed.includes("overview")) {
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
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Overall OEE", val: kpi.oee, color: "#22d3ee", key: "oee", sub: `${kpi.oee >= 85 ? "✓ On Target" : "↓ Below Target"} · Target 85%` },
          { label: "Availability", val: kpi.avail, color: "#22c55e", key: "avail", sub: `Downtime ${kpi.totalDown}m / Planned ${kpi.planned}m` },
          { label: "Performance", val: kpi.perf, color: "#f59e0b", key: "perf", sub: `Output ${kpi.totalCount.toLocaleString()} units` },
          { label: "Quality / FPY", val: kpi.qual, color: "#a78bfa", key: "qual", sub: `Good ${kpi.totalGood.toLocaleString()} · Scrap ${(kpi.totalCount - kpi.totalGood).toLocaleString()}` },
        ].map((k) => (
          <Card key={k.label} title={`● ${k.label}`}>
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <GaugeChart value={k.val} color={k.color} size={76} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-mono text-3xl font-extrabold leading-none" style={{ color: k.color }}>
                  {k.val}%
                </div>
                <div className="mt-1 text-[11px] text-slate-500 leading-snug">{k.sub}</div>
                <div className="mt-2">
                  <Spark
                    data={
                      trendHist.length > 1
                        ? trendHist.map((t) => t[k.key])
                        : ms.map((m) =>
                            k.key === "oee" ? m.oee : k.key === "avail" ? m.availability : k.key === "perf" ? m.performance : m.quality
                          )
                    }
                    color={k.color}
                    target={85}
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 px-4 py-2 text-xs shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <span className="text-slate-500">OEE =</span>{" "}
        <span className="font-mono text-emerald-300">{kpi.avail}%</span> <span className="text-slate-700">×</span>{" "}
        <span className="font-mono text-amber-300">{kpi.perf}%</span> <span className="text-slate-700">×</span>{" "}
        <span className="font-mono text-violet-300">{kpi.qual}%</span> <span className="text-slate-700">÷ 10000 =</span>{" "}
        <span className="font-mono font-bold text-sky-300">{kpi.oee}%</span>
        <span className="ml-3 text-slate-500">
          Good <span className="text-emerald-300">{kpi.totalGood.toLocaleString()}</span> / {kpi.totalCount.toLocaleString()} · Scrap{" "}
          <span className="text-red-300">{(kpi.totalCount - kpi.totalGood).toLocaleString()}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
        <Card title="⚙ Machine Status Board" right={<span className="text-[11px] text-slate-500">คลิกชื่อเพื่อดูรายละเอียด</span>}>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {ms.map((m) => {
              const stCol = m.status === "running" ? "#22c55e" : m.status === "idle" ? "#f59e0b" : "#ef4444";
              return (
                <div
                  key={m.id}
                  className={
                    "rounded-xl border p-3 transition " +
                    (m.status === "breakdown"
                      ? "border-red-500/20 bg-red-950/20"
                      : m.status === "idle"
                        ? "border-amber-500/20 bg-amber-950/10"
                        : "border-emerald-500/10 bg-emerald-950/10")
                  }
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <button onClick={() => setSelectedM(m)} className="text-left text-sm font-bold hover:underline">
                      {m.name}
                    </button>
                    <div className="flex items-center gap-2">
                      <Badge color={stCol}>
                        <StatusDot status={m.status} />
                        {m.status.slice(0, 3).toUpperCase()}
                      </Badge>
                      <button
                        onClick={() => setCtrlM(m)}
                        className="rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        ⚙
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div>
                      <div
                        className={
                          "font-mono text-2xl font-extrabold " +
                          (m.oee >= 85 ? "text-sky-300" : m.oee >= 70 ? "text-amber-300" : "text-red-300")
                        }
                      >
                        {m.oee}%
                      </div>
                      <div className="text-[10px] text-slate-500">OEE</div>
                    </div>
                    <div className="flex-1">
                      {[
                        ["A", m.availability, "#22c55e"],
                        ["P", m.performance, "#f59e0b"],
                        ["Q", m.quality, "#a78bfa"],
                      ].map(([l, v, c]) => (
                        <div key={l} className="mb-2">
                          <div className="mb-1 flex items-center justify-between font-mono text-[10px]">
                            <span className="text-slate-500">{l}</span>
                            <span style={{ color: c }}>{Math.round(v)}%</span>
                          </div>
                          <MiniBar pct={v} color={c} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500">
                    L{m.line} · Good {m.goodCount.toLocaleString()}/{m.totalCount.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="📉 Six Big Losses">
          <div className="space-y-3">
            {losses.map((l) => (
              <div key={l.name}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="text-xs text-slate-300">{l.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] text-slate-500">{l.cat}</div>
                    <div className="font-mono text-xs font-bold" style={{ color: l.c }}>
                      {l.val}%
                    </div>
                  </div>
                </div>
                <div className="h-2 rounded border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60">
                  <div className="h-2 rounded" style={{ width: `${Math.min(l.val * 3, 100)}%`, background: l.c }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 p-3">
            <div>
              <div className="text-[10px] text-slate-500">MTBF</div>
              <div className="font-mono text-lg font-bold text-emerald-300">{(kpi.avail / 100 * 8).toFixed(1)}h</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">MTTR</div>
              <div className="font-mono text-lg font-bold text-red-300">
                {Math.round(kpi.totalDown / Math.max(1, ms.filter((m) => m.status === "breakdown").length || 1))}m
              </div>
            </div>
          </div>
        </Card>

        <Card title="🔔 Alerts" right={<Badge color="#ef4444">{alertsCount}</Badge>}>
          <div className="space-y-2">
            {ms
              .filter((m) => m.status === "breakdown")
              .map((m) => (
                <div key={m.id} className="rounded-xl border-l-4 border-red-500 bg-red-950/20 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-semibold text-red-200">CRITICAL</div>
                    <div className="text-[10px] text-slate-500">{time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <div className="mt-1 text-sm text-red-100">{m.name} — Breakdown</div>
                  <div className="mt-1 text-xs text-slate-500">OEE:{m.oee}% Avail:{Math.round(m.availability)}%</div>
                </div>
              ))}

            {ms
              .filter((m) => m.status !== "breakdown" && m.oee < 70)
              .slice(0, 3)
              .map((m) => (
                <div key={m.id} className="rounded-xl border-l-4 border-amber-400 bg-amber-950/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-semibold text-amber-200">WARNING</div>
                    <div className="text-[10px] text-slate-500">{time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                  <div className="mt-1 text-sm text-amber-100">{m.name} — Low OEE {m.oee}%</div>
                </div>
              ))}

            {ms.every((m) => m.status !== "breakdown" && m.oee >= 70) && (
              <div className="rounded-xl border-l-4 border-emerald-400 bg-emerald-950/10 p-3 text-sm text-emerald-200">
                ✓ All systems normal
              </div>
            )}
          </div>
        </Card>
      </div>

      {selectedM && (
        <MachineDetailModal
          machine={selectedM}
          onClose={() => setSelectedM(null)}
          onControl={() => setCtrlM(selectedM)}
        />
      )}

      {ctrlM && (
        <MachineCtrlModal
          machine={ctrlM}
          onUpdate={(updated) => {
            setMs((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
          }}
          onClose={() => setCtrlM(null)}
        />
      )}
    </div>
  );
}
