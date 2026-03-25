"use client";

import { useMemo } from "react";

import Card from "@/components/oee/ui/Card";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

export default function AlertsPage() {
  const { user, ms, time } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  const critical = useMemo(() => ms.filter((m) => m.status === "breakdown"), [ms]);
  const warnings = useMemo(() => ms.filter((m) => m.status !== "breakdown" && m.oee < 70), [ms]);
  const qIssues = useMemo(() => ms.filter((m) => m.quality < 95), [ms]);

  if (!allowed.includes("alerts")) {
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
      <Card title="🔔 Live Alert Feed">
        <div className="space-y-3">
          {critical.map((m) => (
            <div key={m.id + "-b"} className="flex items-center gap-3 rounded-xl border-l-4 border-red-500 bg-red-950/20 p-3">
              <div className="text-xl">🚨</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-red-100">{m.name} — Breakdown</div>
                  <div className="text-[10px] text-slate-500">{time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div className="mt-1 text-xs text-slate-400">OEE:{m.oee}% Avail:{Math.round(m.availability)}% Est.repair:{Math.round(m.repairTicksLeft)}s</div>
              </div>
              <button className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200">ACK</button>
            </div>
          ))}

          {warnings.map((m) => (
            <div key={m.id + "-w"} className="flex items-center gap-3 rounded-xl border-l-4 border-amber-400 bg-amber-950/10 p-3">
              <div className="text-xl">⚠️</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-amber-100">{m.name} — Low OEE ({m.oee}%)</div>
                  <div className="text-[10px] text-slate-500">{time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                <div className="mt-1 text-xs text-slate-400">Avail:{Math.round(m.availability)}% Perf:{Math.round(m.performance)}% Qual:{Math.round(m.quality)}%</div>
              </div>
              <button className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200">ACK</button>
            </div>
          ))}

          {qIssues.map((m) => (
            <div key={m.id + "-q"} className="rounded-xl border-l-4 border-blue-400 bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)] p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-blue-100">{m.name} — Quality below 95%</div>
                <div className="text-[10px] text-slate-500">{time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <div className="mt-1 text-xs text-slate-400">Qual:{Math.round(m.quality)}% Scrap:{m.scrapCount} units</div>
            </div>
          ))}

          {critical.length === 0 && warnings.length === 0 && qIssues.length === 0 && (
            <div className="rounded-xl border-l-4 border-emerald-400 bg-emerald-950/10 p-3 text-sm text-emerald-200">
              ✓ No active alerts — All systems normal
            </div>
          )}
        </div>
      </Card>

      <Card title="📅 PM Schedule + Health">
        <div className="space-y-2">
          {[
            { machine: "CNC-01", task: "Spindle Lubrication", due: "Mar 27", st: "upcoming" },
            { machine: "Press-02", task: "Die Inspection", due: "Apr 01", st: "scheduled" },
            { machine: "Lathe-03", task: "Bearing Replacement", due: "Today", st: "overdue" },
            { machine: "Weld-04", task: "Electrode Cleaning", due: "Apr 05", st: "scheduled" },
            { machine: "Assy-05", task: "Conveyor Check", due: "Mar 29", st: "upcoming" },
          ].map((p, i) => {
            const col = p.st === "overdue" ? "text-red-300" : p.st === "upcoming" ? "text-amber-300" : "text-emerald-300";
            const badge = p.st === "overdue" ? "border-red-500/30 bg-red-500/10" : p.st === "upcoming" ? "border-amber-500/30 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/10";
            return (
              <div key={i} className="flex items-center justify-between rounded-xl bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)] p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-200">{p.machine}</div>
                  <div className="text-xs text-slate-500">{p.task}</div>
                </div>
                <div className="text-right">
                  <div className={"font-mono text-xs " + col}>{p.due}</div>
                  <div className={"mt-1 inline-flex rounded-full border px-2 py-0.5 font-mono text-[10px] " + badge}>{p.st}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-[10px] uppercase tracking-wider text-slate-500">MACHINE HEALTH INDEX</div>
        <div className="mt-2 space-y-2">
          {ms.map((m) => {
            const col = m.oee >= 85 ? "#22c55e" : m.oee >= 70 ? "#f59e0b" : "#ef4444";
            return (
              <div key={m.id} className="flex items-center gap-3">
                <div className="w-20 text-[11px] text-slate-400">{m.name}</div>
                <div className="h-2 flex-1 rounded bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)]">
                  <div className="h-2 rounded" style={{ width: `${m.oee}%`, background: col }} />
                </div>
                <div className="w-10 text-right font-mono text-[11px] font-bold" style={{ color: col }}>
                  {m.oee}%
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
