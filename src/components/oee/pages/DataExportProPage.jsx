"use client";

import { useEffect, useMemo, useState } from "react";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

import Card from "@/components/oee/ui/Card";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toISODate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(startISO, endISO) {
  const s = new Date(`${startISO}T00:00:00`);
  const e = new Date(`${endISO}T00:00:00`);
  return Math.round((e - s) / (1000 * 60 * 60 * 24));
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function minutesToHHMM(mins) {
  const m = clamp(Math.round(mins), 0, 1439);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${pad2(h)}:${pad2(mm)}`;
}

function downloadBlob(name, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function seededUnit(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function genDayMachineRow(machine, isoDate) {
  const seed0 = hashSeed(`${isoDate}:${machine.id}:${machine.line}`) + 20240406;
  const r0 = seededUnit(seed0);
  const r1 = seededUnit(seed0 + 1);
  const r2 = seededUnit(seed0 + 2);
  const r3 = seededUnit(seed0 + 3);

  const d = new Date(`${isoDate}T00:00:00`);
  const dow = d.getDay();
  const isWeekend = dow === 0 || dow === 6;

  const base = 78 + (hashSeed(String(machine.id)) % 14);
  const weekendMul = isWeekend ? 0.88 : 1.0;

  const hasBreakdown = r0 < 0.08;
  const breakdownMul = hasBreakdown ? 0.62 : 1.0;
  const drift = (r1 - 0.5) * 14;

  const oee = clamp(Math.round(base * weekendMul * breakdownMul + drift), 12, 96);
  const availability = clamp(Math.round(oee * (0.92 + r2 * 0.06)), 10, 100);
  const performance = clamp(Math.round(oee * (0.90 + r3 * 0.08)), 10, 100);
  const quality = clamp(Math.round(oee * (0.94 + r1 * 0.04)), 10, 100);

  const status = hasBreakdown ? "breakdown" : oee >= 70 ? "running" : "idle";

  const total = Math.round(900 + r2 * 1800);
  const good = Math.max(0, Math.round(total * clamp(quality, 0, 100) / 100));
  const downtimeMins = hasBreakdown ? Math.round(120 + r3 * 260) : Math.round(r0 * 60);

  return {
    isoDate,
    machineName: machine.name,
    line: machine.line,
    oee,
    availability,
    performance,
    quality,
    status,
    good,
    total,
    downtimeMins,
  };
}

function eachISODateInclusive(startISO, endISO) {
  const out = [];
  if (!startISO || !endISO) return out;
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return out;
  const dir = start <= end ? 1 : -1;
  const cur = new Date(start);
  while ((dir === 1 && cur <= end) || (dir === -1 && cur >= end)) {
    out.push(toISODate(cur));
    cur.setDate(cur.getDate() + dir);
  }
  return out;
}

function buildRows(ms, startISO, endISO) {
  const header = [
    "Date",
    "Machine",
    "Line",
    "OEE%",
    "Avail%",
    "Perf%",
    "Qual%",
    "Status",
    "Good",
    "Total",
    "Downtime(min)",
  ];

  const dates = eachISODateInclusive(startISO, endISO);
  const rows = [];

  for (const iso of dates) {
    for (const m of ms) {
      const r = genDayMachineRow(m, iso);
      rows.push([
        r.isoDate,
        r.machineName,
        r.line,
        r.oee,
        r.availability,
        r.performance,
        r.quality,
        r.status,
        r.good,
        r.total,
        r.downtimeMins,
      ]);
    }
  }

  return { header, rows };
}

function toCSV(header, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    if (/[\n\r,\"]/g.test(s)) return `"${s.replace(/\"/g, '""')}"`;
    return s;
  };
  return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}

function openPrintWindow({ title, subtitle, header, rows }) {
  const trs = rows
    .map((r) => `<tr>${r.map((c) => `<td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:12px">${String(c)}</td>`).join("")}</tr>`)
    .join("");

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>
  body{font-family:Arial,sans-serif;padding:32px;color:#0f172a}
  h1{margin:0;color:#0284c7;font-size:22px}
  p{margin:8px 0 0;color:#64748b;font-size:11px}
  table{width:100%;border-collapse:collapse;margin-top:18px}
  th{background:#0f172a;color:#fff;padding:9px;text-align:left;font-size:11px;position:sticky;top:0}
  td{vertical-align:top}
  @media print{body{padding:18px} }
  </style></head><body>
  <h1>${title}</h1>
  <p>${subtitle}</p>
  <table><thead><tr>${header.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${trs}</tbody></table>
  </body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

function AccessRestricted() {
  return (
    <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-10 text-center text-slate-400">
      <div className="text-4xl mb-2">🔒</div>
      <div className="text-sm font-semibold text-slate-300">Access Restricted</div>
    </div>
  );
}

export default function DataExportProPage() {
  const { user, ms, kpi } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];
  const hasAccess = allowed.includes("data");

  const [todayISO, setTodayISO] = useState("");
  const isReady = Boolean(todayISO);

  const [fmt, setFmt] = useState("csv");
  const [preset, setPreset] = useState("7d");

  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [startMin, setStartMin] = useState(0);
  const [endMin, setEndMin] = useState(1439);

  const [rangeDays, setRangeDays] = useState(7);
  const [endOffsetDays, setEndOffsetDays] = useState(0);

  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const iso = new Date().toISOString().slice(0, 10);
    setTodayISO(iso);
    setCustomStart((v) => v || iso);
    setCustomEnd((v) => v || iso);
  }, []);

  const computed = useMemo(() => {
    if (!todayISO) return { start: "", end: "", len: 0, mode: "slider" };
    const today = new Date(`${todayISO}T00:00:00`);

    if (preset === "custom") {
      const start = customStart;
      const end = customEnd;
      const len = Math.max(1, daysBetween(start, end) + 1);
      return { start, end, len, mode: "custom" };
    }

    const len = preset === "today" ? 1 : preset === "30d" ? 30 : preset === "15d" ? 15 : 7;
    const end = toISODate(addDays(today, -endOffsetDays));
    const start = toISODate(addDays(today, -endOffsetDays - (len - 1)));
    return { start, end, len, mode: "slider" };
  }, [customEnd, customStart, endOffsetDays, preset, todayISO]);

  const axis = useMemo(() => {
    const ticks = [365, 270, 180, 90, 0];
    const labels = ["-12m", "-9m", "-6m", "-3m", "Today"]; 
    return ticks.map((v, i) => ({ v, label: labels[i] }));
  }, []);

  const { header, rows } = useMemo(() => buildRows(ms, computed.start, computed.end), [computed.end, computed.start, ms]);

  const startTime = minutesToHHMM(startMin);
  const endTime = minutesToHHMM(endMin);

  const timeOptions = useMemo(() => {
    return Array.from({ length: 96 }, (_, i) => {
      const mins = i * 15;
      return { mins, label: minutesToHHMM(mins) };
    });
  }, []);

  const timeLabel = `${startTime}-${endTime}`;
  const timeLabelSafe = timeLabel.replace(/:/g, "");
  const rangeLabel = `${computed.start}_to_${computed.end}_${timeLabelSafe}`;

  const previewRows = useMemo(() => rows.slice(0, 8), [rows]);
  const csvPreview = useMemo(() => toCSV(header, previewRows), [header, previewRows]);

  const shiftEnd = (dir) => {
    const step = computed.len;
    setEndOffsetDays((v) => clamp(v + dir * step, 0, 365));
  };

  const exportNow = () => {
    setBusy(true);
    setTimeout(() => {
      const ts = new Date().toISOString().slice(0, 10);

      if (fmt === "csv") {
        const csv = toCSV(header, rows);
        downloadBlob(`FOSTEC_OEE_${rangeLabel}_${ts}.csv`, new Blob([csv], { type: "text/csv" }));
      } else if (fmt === "pdf") {
        openPrintWindow({
          title: "FOSTEC OEE Monitor — Export",
          subtitle: `Generated: ${new Date().toLocaleString()} | Range: ${computed.start} → ${computed.end} (${computed.len} days) | Time: ${timeLabel} | OEE: ${kpi.oee}%`,
          header,
          rows,
        });
      }

      setBusy(false);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    }, 450);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-4">
        {!hasAccess ? (
          <AccessRestricted />
        ) : !isReady ? (
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-10 text-center text-slate-400">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Loading</div>
            <div className="mt-2 text-sm text-slate-300">Preparing export options…</div>
          </div>
        ) : (
          <Card
            title="📤 Data Export (Pro)"
            right={
              <div className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 px-3 py-2 text-[11px] text-slate-400">
                Range: <span className="font-mono text-slate-200">{computed.start}</span> → <span className="font-mono text-slate-200">{computed.end}</span> <span className="text-slate-500">({computed.len} days)</span>
                <span className="mx-2 text-slate-600">|</span>
                Time: <span className="font-mono text-slate-200">{startTime}</span> → <span className="font-mono text-slate-200">{endTime}</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-1">
              <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Format</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFmt("csv")}
                    className={
                      "rounded-lg border px-3 py-2 text-sm font-black transition " +
                      (fmt === "csv"
                        ? "border-sky-500/40 bg-sky-500/10 text-sky-200"
                        : "border-[var(--oee-border)] bg-[var(--oee-surface)]/30 text-slate-400 hover:text-slate-200")
                    }
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => setFmt("pdf")}
                    className={
                      "rounded-lg border px-3 py-2 text-sm font-black transition " +
                      (fmt === "pdf"
                        ? "border-sky-500/40 bg-sky-500/10 text-sky-200"
                        : "border-[var(--oee-border)] bg-[var(--oee-surface)]/30 text-slate-400 hover:text-slate-200")
                    }
                  >
                    PDF
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Range</div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {["today", "7d", "15d", "30d"].map((k) => (
                    <button
                      key={k}
                      onClick={() => {
                        setPreset(k);
                        if (k === "today") setRangeDays(1);
                        else if (k === "7d") setRangeDays(7);
                        else if (k === "15d") setRangeDays(15);
                        else if (k === "30d") setRangeDays(30);
                      }}
                      className={
                        "rounded-lg border px-3 py-2 text-xs font-black transition " +
                        (preset === k
                          ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-200"
                          : "border-[var(--oee-border)] bg-[var(--oee-surface)]/30 text-slate-400 hover:text-slate-200")
                      }
                    >
                      {k === "today" ? "วันนี้" : k === "7d" ? "ย้อนหลัง 7 วัน" : k === "15d" ? "ย้อนหลัง 15 วัน" : "ย้อนหลัง 30 วัน"}
                    </button>
                  ))}
                  <button
                    onClick={() => setPreset("custom")}
                    className={
                      "col-span-3 rounded-lg border px-3 py-2 text-xs font-black transition " +
                      (preset === "custom"
                        ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-200"
                        : "border-[var(--oee-border)] bg-[var(--oee-surface)]/30 text-slate-400 hover:text-slate-200")
                    }
                  >
                    กำหนดเอง
                  </button>
                </div>

                {preset === "custom" ? (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Start</div>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/40 px-3 py-2 text-sm font-mono text-slate-200 outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">End</div>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/40 px-3 py-2 text-sm font-mono text-slate-200 outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/30 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Timeline</div>
                        <div className="font-mono text-[11px] text-slate-300">{computed.start} → {computed.end}</div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => shiftEnd(1)}
                          className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/30 px-3 py-2 text-sm font-black text-slate-300 hover:text-white"
                          title={`ย้อนกลับอีก ${computed.len} วัน`}
                        >
                          ◀
                        </button>

                        <div className="flex-1">
                          <input
                            type="range"
                            min={0}
                            max={365}
                            value={endOffsetDays}
                            onChange={(e) => setEndOffsetDays(Number(e.target.value))}
                            className="w-full"
                          />

                          <div className="relative mt-2 h-6">
                            <div className="absolute inset-x-0 top-2 h-[2px] bg-slate-700/70" />
                            {axis.map((t) => (
                              <div
                                key={t.v}
                                className="absolute -translate-x-1/2"
                                style={{ left: `${(1 - t.v / 365) * 100}%` }}
                              >
                                <div className="h-2 w-[2px] bg-slate-500" />
                                <div className="mt-1 text-[10px] font-bold text-slate-500">{t.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => shiftEnd(-1)}
                          className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/30 px-3 py-2 text-sm font-black text-slate-300 hover:text-white"
                          title={`เลื่อนกลับมาข้างหน้า ${computed.len} วัน`}
                        >
                          ▶
                        </button>
                      </div>

                      <div className="mt-2 text-[10px] text-slate-500">
                        ใช้ลูกศรเพื่อเลื่อนช่วงเวลาเป็นช่วงๆ และใช้แกนด้านล่างเพื่อเลือกตำแหน่งเวลา
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Time Range</div>
                <div className="mt-3 rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/30 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Time</div>
                    <div className="font-mono text-[11px] text-slate-300">{startTime} → {endTime}</div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Start</div>
                      <select
                        value={startMin}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          setStartMin(Math.min(next, endMin));
                        }}
                        className="mt-2 w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/40 px-3 py-2 text-sm font-mono text-slate-200 outline-none focus:border-sky-500"
                      >
                        {timeOptions.map((t) => (
                          <option key={t.mins} value={t.mins}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">End</div>
                      <select
                        value={endMin}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          setEndMin(Math.max(next, startMin));
                        }}
                        className="mt-2 w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/40 px-3 py-2 text-sm font-mono text-slate-200 outline-none focus:border-sky-500"
                      >
                        {timeOptions.map((t) => (
                          <option key={t.mins} value={t.mins}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-2 text-[10px] text-slate-500">เลือกเวลาเป็นช่วงละ 15 นาที และจะล็อคไม่ให้ Start มากกว่า End</div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Snapshot</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/30 p-3">
                    <div className="text-slate-500">OEE</div>
                    <div className="mt-1 font-mono text-lg font-black text-sky-300">{kpi.oee}%</div>
                  </div>
                  <div className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/30 p-3">
                    <div className="text-slate-500">Good / Total</div>
                    <div className="mt-1 font-mono text-sm font-black text-emerald-300">
                      {kpi.totalGood.toLocaleString()} / {kpi.totalCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={exportNow}
                disabled={busy}
                className={
                  "w-full rounded-xl px-4 py-4 text-sm font-black text-white transition " +
                  (done
                    ? "bg-emerald-700"
                    : busy
                      ? "bg-[var(--oee-surface-2)]/70 border border-[var(--oee-border)] cursor-not-allowed"
                      : "bg-gradient-to-r from-sky-600 to-indigo-600 hover:brightness-110")
                }
              >
                {done ? "✓ Export สำเร็จ" : busy ? "กำลังเตรียมไฟล์…" : `Export ${fmt.toUpperCase()}`}
              </button>
            </div>

            <div className="space-y-4 lg:col-span-2">
              <Card title={`Preview (${fmt.toUpperCase()})`}>
                {fmt === "csv" ? (
                  <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/30 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-slate-300">ตัวอย่างไฟล์ CSV</div>
                      <div className="text-[10px] text-slate-500">First 8 rows</div>
                    </div>

                    <div className="mt-3 rounded-lg border border-[var(--oee-border)] bg-black/20 p-3">
                      <pre className="max-h-[420px] overflow-auto whitespace-pre text-[11px] leading-5 text-slate-200 font-mono">{csvPreview}</pre>
                    </div>

                    <div className="mt-2 text-[10px] text-slate-500">แสดงตัวอย่างรูปแบบไฟล์ (ค่าจริงจะดึงตามข้อมูลที่ export)</div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/30 p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-bold text-slate-300">ตัวอย่างหน้าตา PDF</div>
                      <div className="text-[10px] text-slate-500">Paper preview</div>
                    </div>

                    <div className="mt-3 overflow-auto">
                      <div className="mx-auto w-full max-w-[900px] rounded-xl bg-white p-6 text-slate-900 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-xl font-black" style={{ color: "#0284c7" }}>
                              FOSTEC OEE Monitor — Export
                            </div>
                            <div className="mt-1 text-[11px] text-slate-600">
                              Range: <span className="font-mono">{computed.start}</span> → <span className="font-mono">{computed.end}</span> ({computed.len} days)
                              <span className="mx-2">|</span>
                              Time: <span className="font-mono">{startTime}</span> → <span className="font-mono">{endTime}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">KPI</div>
                            <div className="font-mono text-lg font-black" style={{ color: "#0284c7" }}>
                              {kpi.oee}%
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 overflow-auto">
                          <table className="min-w-[860px] w-full border-collapse text-left">
                            <thead>
                              <tr>
                                {header.map((h) => (
                                  <th key={h} className="border-b border-slate-200 bg-slate-900 px-3 py-2 text-[10px] uppercase tracking-wider text-white">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {previewRows.map((r, idx) => (
                                <tr key={idx}>
                                  {r.map((c, j) => (
                                    <td key={j} className="border-b border-slate-200 px-3 py-2 text-[11px] font-mono text-slate-800">
                                      {String(c)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 text-[10px] text-slate-500">
                          Preview only — ตอนกด Export PDF จะเปิดหน้าพิมพ์เพื่อ Save as PDF
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card title="Export Notes">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/30 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">CSV</div>
                    <div className="mt-2 text-[12px] text-slate-400">เหมาะสำหรับเปิดใน Excel / วิเคราะห์ต่อ</div>
                    <div className="mt-3 rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/30 p-3 font-mono text-[11px] text-slate-300">
                      FOSTEC_OEE_{rangeLabel}_YYYY-MM-DD.csv
                    </div>
                  </div>
                  <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/30 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">PDF</div>
                    <div className="mt-2 text-[12px] text-slate-400">จะเปิดหน้าพิมพ์เพื่อ Save เป็น PDF</div>
                    <div className="mt-3 rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface)]/30 p-3 text-[11px] text-slate-300">
                      Tip: เลือก Destination เป็น <span className="font-mono">Save as PDF</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
