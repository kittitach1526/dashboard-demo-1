"use client";

import { useState } from "react";
import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

export default function DataExportPage() {
  const { user, ms, kpi } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  const [fmt, setFmt] = useState("csv");
  const [rng, setRng] = useState("today");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [customStart, setCustomStart] = useState(today);
  const [customEnd, setCustomEnd] = useState(today);

  if (!allowed.includes("data")) {
    return (
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-10 text-center text-slate-400">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-sm font-semibold text-slate-300">Access Restricted</div>
      </div>
    );
  }

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
      const rangeLabel = rng === "custom" ? `${customStart}_to_${customEnd}` : rng;
      const h = ["Machine", "Line", "OEE%", "Avail%", "Perf%", "Qual%", "Status", "Good", "Total", "Downtime(min)"];
      const dataRows = ms.map((m) => [m.name, m.line, m.oee, Math.round(m.availability), Math.round(m.performance), Math.round(m.quality), m.status, m.goodCount, m.totalCount, m.downtimeMins]);

      if (fmt === "csv") {
        dl(`FOSTEC_OEE_${rangeLabel}_${ts}.csv`, new Blob([[h, ...dataRows].map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
      } else if (fmt === "xls") {
        const trs = dataRows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("");
        const table = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>OEE Report</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table><thead><tr>${h.map((c) => `<th style="background:#1e293b;color:#e2e8f0;font-weight:bold;padding:6px">${c}</th>`).join("")}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
        dl(`FOSTEC_OEE_${rangeLabel}_${ts}.xls`, new Blob([table], { type: "application/vnd.ms-excel" }));
      } else if (fmt === "pdf") {
        const trs = dataRows.map((r) => `<tr>${r.map((c) => `<td style="padding:8px;border-bottom:1px solid #ddd;font-size:12px">${c}</td>`).join("")}</tr>`).join("");
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>FOSTEC OEE Report</title><style>body{font-family:Arial,sans-serif;padding:32px}h1{color:#0ea5e9}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#1e293b;color:#fff;padding:9px;text-align:left;font-size:11px}td{padding:8px;border-bottom:1px solid #ddd;font-size:12px}</style></head><body><h1>FOSTEC OEE Monitor — Report</h1><p style="color:#64748b;font-size:11px">Generated: ${new Date().toLocaleString()} | Range: ${rangeLabel} | OEE: ${kpi.oee}%</p><table><thead><tr>${h.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${trs}</tbody></table></body></html>`;
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
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-slate-100">📤 Export ข้อมูล</h1>
          <p className="text-base text-slate-400 mt-2">ส่งออกข้อมูลการผลิตในรูปแบบต่างๆ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-8 shadow-xl space-y-6">
            <div>
              <div className="mb-3 text-sm uppercase tracking-wider text-slate-400">รูปแบบไฟล์</div>
              <div className="flex gap-3">
                {["csv", "xls", "pdf"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFmt(f)}
                    className={
                      "flex-1 rounded-lg border px-4 py-3 font-mono text-base font-bold " +
                      (fmt === f
                        ? "border-sky-500 bg-sky-500/10 text-sky-200"
                        : "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/20 text-slate-400 hover:text-slate-200")
                    }
                  >
                    .{f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm uppercase tracking-wider text-slate-400">ช่วงข้อมูล</div>
              <select
                value={rng}
                onChange={(e) => setRng(e.target.value)}
                className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 px-4 py-3 text-base text-slate-100 outline-none focus:border-sky-500"
              >
                {["today", "yesterday", "this-week", "last-week", "this-month", "last-month", "custom"].map((r) => (
                  <option key={r} value={r}>
                    {r === "custom" ? "กำหนดเอง" : r.replace(/-/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {rng === "custom" && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-2">วันที่เริ่มต้น</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/80 px-4 py-3 text-base text-slate-100 font-mono outline-none focus:border-sky-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-2">วันที่สิ้นสุด</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/80 px-4 py-3 text-base text-slate-100 font-mono outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            <div className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/50 p-4 text-base text-slate-400">
              OEE=<span className="font-mono text-sky-300">{kpi.oee}%</span> | Good=
              <span className="font-mono text-emerald-300">{kpi.totalGood.toLocaleString()}</span> / {kpi.totalCount.toLocaleString()}
            </div>

            <button
              onClick={go}
              disabled={busy}
              className={
                "w-full rounded-lg px-4 py-4 text-base font-bold text-white transition " +
                (done
                  ? "bg-emerald-700"
                  : busy
                    ? "bg-[var(--oee-surface-2)]/70 border border-[var(--oee-border)] cursor-not-allowed"
                    : "bg-gradient-to-br from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400")
              }
            >
              {done ? "✓ ดาวน์โหลดสำเร็จ!" : busy ? "กำลังสร้างไฟล์…" : `Export ${fmt.toUpperCase()}`}
            </button>
          </div>

          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-8 shadow-xl">
            <h2 className="text-xl font-bold text-slate-100 mb-4">📊 ข้อมูลที่จะส่งออก</h2>
            <div className="space-y-4">
              <div className="text-sm text-slate-400">
                <p className="mb-2">• ข้อมูลเครื่องจักรทั้งหมด ({ms.length} เครื่อง)</p>
                <p className="mb-2">• ค่า KPI ทั้งหมด (OEE, Availability, Performance, Quality)</p>
                <p className="mb-2">• จำนวนสินค้าที่ผลิต (Good/Total)</p>
                <p className="mb-2">• เวลา Downtime</p>
                <p className="mb-2">• สถานะปัจจุบันของเครื่องจักร</p>
              </div>
              <div className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/30 p-4">
                <div className="text-xs text-slate-500 mb-2">ตัวอย่างข้อมูล</div>
                <div className="text-xs font-mono text-slate-300">
                  {ms.slice(0, 3).map((m) => (
                    <div key={m.id} className="mb-1">
                      {m.name} - OEE: {m.oee}% | Line: {m.line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
