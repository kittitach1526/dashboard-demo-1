"use client";

import { useState } from "react";

import ModalShell from "@/components/oee/modals/ModalShell";

export default function ExportModal({ onClose, machines, kpi }) {
  const [fmt, setFmt] = useState("csv");
  const [rng, setRng] = useState("today");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const dl = (name, blob) => {
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = name;
    a.click();
    URL.revokeObjectURL(u);
  };

  const go = () => {
    setBusy(true);
    setTimeout(() => {
      const ts = new Date().toISOString().slice(0, 10);
      if (fmt === "csv") {
        const h = ["Machine", "Line", "OEE%", "Avail%", "Perf%", "Qual%", "Status", "Good", "Total", "Downtime(min)"];
        const rows = machines.map((m) => [m.name, m.line, m.oee, Math.round(m.availability), Math.round(m.performance), Math.round(m.quality), m.status, m.goodCount, m.totalCount, m.downtimeMins]);
        dl(`FOSTEC_OEE_${rng}_${ts}.csv`, new Blob([[h, ...rows].map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
      } else if (fmt === "json") {
        dl(`FOSTEC_OEE_${rng}_${ts}.json`, new Blob([JSON.stringify({ exported: new Date().toISOString(), range: rng, kpi, machines }, null, 2)], { type: "application/json" }));
      } else {
        const rows = machines
          .map(
            (m) =>
              `<tr><td>${m.name}</td><td>${m.line}</td><td style=\"color:#22d3ee;font-weight:700\">${m.oee}%</td><td>${Math.round(m.availability)}%</td><td>${Math.round(m.performance)}%</td><td>${Math.round(m.quality)}%</td><td>${m.goodCount}</td><td>${m.totalCount}</td><td style=\"color:${m.status === "running" ? "#22c55e" : m.status === "breakdown" ? "#ef4444" : "#f59e0b"}\">${m.status}</td></tr>`
          )
          .join("");
        dl(
          `FOSTEC_OEE_${rng}_${ts}.html`,
          new Blob(
            [
              `<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>FOSTEC OEE Report</title><style>body{font-family:Arial,sans-serif;background:#070d19;color:#e2e8f0;padding:32px}h1{color:#22d3ee}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#1e293b;padding:9px;text-align:left;font-size:11px;color:#94a3b8}td{padding:8px;border-bottom:1px solid #1e293b;font-size:12px}</style></head><body><h1>FOSTEC OEE Monitor — Report</h1><p style=\"color:#64748b;font-size:11px\">Generated: ${new Date().toLocaleString()} | Range: ${rng}</p><table><thead><tr><th>Machine</th><th>Line</th><th>OEE</th><th>Avail</th><th>Perf</th><th>Qual</th><th>Good</th><th>Total</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></body></html>`,
            ],
            { type: "text/html" }
          )
        );
      }
      setBusy(false);
      setDone(true);
      setTimeout(() => setDone(false), 2200);
    }, 600);
  };

  return (
    <ModalShell title="📤 Export Report" onClose={onClose} widthClass="w-[420px]">
      <div className="space-y-4">
        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">FORMAT</div>
          <div className="flex gap-2">
            {["csv", "json", "html"].map((f) => (
              <button
                key={f}
                onClick={() => setFmt(f)}
                className={
                  "flex-1 rounded-lg border px-3 py-2 font-mono text-xs " +
                  (fmt === f
                    ? "border-sky-500 bg-sky-500/10 text-sky-200"
                    : "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/20 text-slate-400")
                }
              >
                .{f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">DATE RANGE</div>
          <select
            value={rng}
            onChange={(e) => setRng(e.target.value)}
            className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 px-3 py-2 font-mono text-xs text-slate-100 outline-none focus:border-sky-500"
          >
            {["today", "yesterday", "this-week", "last-week", "this-month", "last-month"].map((r) => (
              <option key={r} value={r}>
                {r.replace(/-/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 p-3 text-xs text-slate-400">
          Snapshot: OEE=<span className="font-mono text-sky-300">{kpi.oee}%</span> | Good=
          <span className="font-mono text-emerald-300">{kpi.totalGood.toLocaleString()}</span> / {kpi.totalCount.toLocaleString()}
        </div>

        <button
          onClick={go}
          disabled={busy}
          className={
            "w-full rounded-lg px-3 py-2.5 text-sm font-bold text-white transition " +
            (done
              ? "bg-emerald-700"
              : busy
                ? "bg-[var(--oee-surface-2)]/70 border border-[var(--oee-border)] cursor-not-allowed"
                : "bg-gradient-to-br from-sky-500 to-indigo-500")
          }
        >
          {done ? "✓ Downloaded!" : busy ? "Generating…" : `Export ${fmt.toUpperCase()}`}
        </button>
      </div>
    </ModalShell>
  );
}
