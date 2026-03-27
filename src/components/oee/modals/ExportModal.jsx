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
      const h = ["Machine", "Line", "OEE%", "Avail%", "Perf%", "Qual%", "Status", "Good", "Total", "Downtime(min)"];
      const dataRows = machines.map((m) => [m.name, m.line, m.oee, Math.round(m.availability), Math.round(m.performance), Math.round(m.quality), m.status, m.goodCount, m.totalCount, m.downtimeMins]);

      if (fmt === "csv") {
        dl(`FOSTEC_OEE_${rng}_${ts}.csv`, new Blob([[h, ...dataRows].map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
      } else if (fmt === "xls") {
        const trs = dataRows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
        const table = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>OEE Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table><thead><tr>${h.map((c) => `<th style="background:#1e293b;color:#e2e8f0;font-weight:bold;padding:6px">${c}</th>`).join("")}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
        dl(`FOSTEC_OEE_${rng}_${ts}.xls`, new Blob([table], { type: "application/vnd.ms-excel" }));
      } else if (fmt === "pdf") {
        const trs = dataRows.map((r) => `<tr>${r.map((c) => `<td style="padding:8px;border-bottom:1px solid #ddd;font-size:12px">${c}</td>`).join("")}</tr>`).join("");
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FOSTEC OEE Report</title><style>body{font-family:Arial,sans-serif;padding:32px}h1{color:#0ea5e9}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#1e293b;color:#fff;padding:9px;text-align:left;font-size:11px}td{padding:8px;border-bottom:1px solid #ddd;font-size:12px}</style></head><body><h1>FOSTEC OEE Monitor — Report</h1><p style="color:#64748b;font-size:11px">Generated: ${new Date().toLocaleString()} | Range: ${rng} | OEE: ${kpi.oee}%</p><table><thead><tr>${h.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
        const w = window.open("", "_blank");
        w.document.write(html);
        w.document.close();
        w.print();
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
            {["csv", "xls", "pdf"].map((f) => (
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
