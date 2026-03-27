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

  const liveAlerts = useMemo(() => {
    const ts = time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    const items = [];

    for (const m of ms) {
      if (m.status === "breakdown") {
        items.push({
          id: `${m.id}-bd`,
          sev: "CRITICAL",
          icon: "🚨",
          title: `${m.name} — Breakdown`,
          detail: `OEE:${m.oee}% Avail:${Math.round(m.availability)}%`,
          time: ts,
        });
      }
      if (m.status !== "breakdown" && m.oee < 70) {
        items.push({
          id: `${m.id}-oee`,
          sev: "WARNING",
          icon: "⚠️",
          title: `${m.name} — Low OEE (${m.oee}%)`,
          detail: `Avail:${Math.round(m.availability)}% Perf:${Math.round(m.performance)}% Qual:${Math.round(m.quality)}%`,
          time: ts,
        });
      }
      if (m.quality < 95) {
        items.push({
          id: `${m.id}-qual`,
          sev: "WARNING",
          icon: "🧪",
          title: `${m.name} — Quality below 95% (${Math.round(m.quality)}%)`,
          detail: `Scrap:${m.scrapCount} units`,
          time: ts,
        });
      }
    }

    const infoPool = ms
      .filter((m) => m.status !== "breakdown")
      .slice()
      .sort((a, b) => b.oee - a.oee)
      .slice(0, 2);

    for (const m of infoPool) {
      items.push({
        id: `${m.id}-info`,
        sev: "INFO",
        icon: "ℹ️",
        title: `${m.name} — Status Update`,
        detail: `Status:${m.status} OEE:${m.oee}% Good:${m.goodCount.toLocaleString()}/${m.totalCount.toLocaleString()}`,
        time: ts,
      });
    }

    const hasCrit = items.some((x) => x.sev === "CRITICAL");
    const hasWarn = items.some((x) => x.sev === "WARNING");
    const hasInfo = items.some((x) => x.sev === "INFO");

    const sample = ms[0];
    const sampleName = sample?.name || "Machine";
    const sampleLine = sample?.line ?? "-";

    if (!hasCrit) {
      items.unshift({
        id: `demo-crit`,
        sev: "CRITICAL",
        icon: "🚨",
        title: `${sampleName} — (Demo) Breakdown`,
        detail: `Line:${sampleLine} Demo critical alert for presentation.`,
        time: ts,
      });
    }

    if (!hasWarn) {
      items.push({
        id: `demo-warn`,
        sev: "WARNING",
        icon: "⚠️",
        title: `${sampleName} — (Demo) Warning`,
        detail: `Demo warning alert for presentation.`,
        time: ts,
      });
    }

    if (!hasInfo) {
      items.push({
        id: `demo-info`,
        sev: "INFO",
        icon: "ℹ️",
        title: `${sampleName} — (Demo) Info`,
        detail: `Demo info alert for presentation.`,
        time: ts,
      });
    }

    const rank = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    const sorted = items.sort((a, b) => (rank[a.sev] ?? 9) - (rank[b.sev] ?? 9) || a.title.localeCompare(b.title));

    const firstCrit = sorted.find((x) => x.sev === "CRITICAL");
    const firstWarn = sorted.find((x) => x.sev === "WARNING");
    const firstInfo = sorted.find((x) => x.sev === "INFO");

    const must = [firstCrit, firstWarn, firstInfo].filter(Boolean);
    const mustIds = new Set(must.map((m) => m.id));
    const rest = sorted.filter((x) => !mustIds.has(x.id));

    return [...must, ...rest].slice(0, 6);
  }, [ms, time]);

  const alertsCount = useMemo(() => {
    return liveAlerts.length;
  }, [liveAlerts]);

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
                    responsive
                    className="w-full"
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
          <div className="space-y-3">
            {ms.map((m) => {
              const stCol = m.status === "running" ? "#22c55e" : m.status === "idle" ? "#f59e0b" : "#ef4444";
              return (
                <div
                  key={m.id}
                  className="rounded-xl border-2 p-4 transition"
                  style={{
                    borderColor: m.status === "breakdown" 
                      ? "rgba(239, 68, 68, 0.5)" 
                      : m.status === "idle" 
                        ? "rgba(245, 158, 11, 0.5)" 
                        : "rgba(34, 197, 94, 0.5)",
                    backgroundColor: m.status === "breakdown"
                      ? "rgba(239, 68, 68, 0.25)"
                      : m.status === "idle"
                        ? "rgba(245, 158, 11, 0.25)"
                        : "rgba(34, 197, 94, 0.25)",
                    boxShadow: m.status === "breakdown"
                      ? "0 0 30px rgba(239, 68, 68, 0.3)"
                      : m.status === "idle"
                        ? "0 0 30px rgba(245, 158, 11, 0.3)"
                        : "0 0 30px rgba(34, 197, 94, 0.3)"
                  }}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <button onClick={() => setSelectedM(m)} className="text-left text-base font-bold hover:underline">
                      {m.name}
                    </button>
                    <div className="flex items-center gap-2">
                      <Badge color={stCol}>
                        <StatusDot status={m.status} />
                        {m.status.slice(0, 3).toUpperCase()}
                      </Badge>
                      <div 
                        className="rounded-full border px-2 py-0.5 text-[9px] font-bold flex items-center gap-1.5"
                        style={{
                          borderColor: m.forcedStatus ? '#3b82f6' : '#64748b',
                          backgroundColor: m.forcedStatus ? '#3b82f620' : '#64748b20',
                          color: m.forcedStatus ? '#3b82f6' : '#64748b'
                        }}
                      >
                        <span 
                          className="w-2 h-2 rounded-full shadow-sm" 
                          style={{
                            backgroundColor: m.forcedStatus ? '#3b82f6' : '#64748b',
                            boxShadow: `0 0 4px ${m.forcedStatus ? '#3b82f6' : '#64748b'}80`
                          }}
                        ></span>
                        {m.forcedStatus ? "MANUAL" : "AUTO"}
                      </div>
                      <button
                        onClick={() => setCtrlM(m)}
                        className="rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        ⚙
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div
                        className={
                          "font-mono text-2xl font-extrabold " +
                          (m.oee >= 85 ? "text-sky-300" : m.oee >= 70 ? "text-amber-300" : "text-red-300")
                        }
                      >
                        {m.oee}%
                      </div>
                      <div className="text-[9px] text-slate-500">OEE</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[
                        ["Availability", m.availability, "#22c55e"],
                        ["Performance", m.performance, "#f59e0b"],
                        ["Quality", m.quality, "#a78bfa"],
                        ["OEE", m.oee, "#06b6d4"],
                      ].map(([label, val, color]) => (
                        <div key={label} className="flex items-center gap-3">
                          <div className="w-20 text-[10px] text-slate-500">{label}</div>
                          <div className="flex-1">
                            <MiniBar pct={val} color={color} />
                          </div>
                          <div className="w-12 text-right font-mono text-sm font-bold" style={{ color }}>
                            {Math.round(val)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[var(--oee-border)] flex justify-between items-center">
                    <div className="text-[11px] text-slate-500">
                      Line {m.line} · Good {m.goodCount.toLocaleString()}/{m.totalCount.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Scrap: {(m.totalCount - m.goodCount).toLocaleString()}
                    </div>
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
            {liveAlerts.map((a) => {
              const left = a.sev === "CRITICAL" ? "border-red-500" : a.sev === "WARNING" ? "border-amber-400" : "border-sky-400";
              const bg = a.sev === "CRITICAL" ? "bg-red-950/20" : a.sev === "WARNING" ? "bg-amber-950/10" : "bg-sky-950/10";
              const col = a.sev === "CRITICAL" ? "text-red-200" : a.sev === "WARNING" ? "text-amber-200" : "text-sky-200";
              return (
                <div key={a.id} className={`rounded-xl border-l-4 ${left} ${bg} p-3`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className={`text-[10px] font-semibold ${col}`}>{a.sev}</div>
                    <div className="text-[10px] text-slate-500">{a.time}</div>
                  </div>
                  <div className="mt-1 text-sm text-slate-100">
                    {a.icon} {a.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{a.detail}</div>
                </div>
              );
            })}

            {liveAlerts.length === 0 && (
              <div className="rounded-xl border-l-4 border-emerald-400 bg-emerald-950/10 p-3 text-sm text-emerald-200">
                ✓ No active alerts
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
