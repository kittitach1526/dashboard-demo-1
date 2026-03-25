"use client";

import { useEffect, useRef, useState } from "react";

import { DEFAULT_SHIFTS, MACHINE_DEFS, ROLE_ACCESS, ROLE_COLOR } from "@/lib/oee/constants";
import { calcKPI, createMachineState, tickMachine } from "@/lib/oee/sim";

import LoginScreen from "@/components/oee/screens/LoginScreen";

export default function OEEApp() {
  const [user, setUser] = useState(null);
  const [ms, setMs] = useState(() => MACHINE_DEFS.map(createMachineState));
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshInt, setRefreshInt] = useState(3000);
  const [time, setTime] = useState(new Date());
  const [trendHist, setTrendHist] = useState([]);
  const [heatData, setHeatData] = useState([
    [88, 82, 75, 91, 87, 72, 79],
    [84, 79, 81, 88, 92, 68, 75],
    [76, 71, 65, 85, 89, 64, 72],
  ]);
  const [shiftHours, setShiftHours] = useState([]);
  const [shifts, setShifts] = useState(DEFAULT_SHIFTS);

  const tickRef = useRef(0);

  useEffect(() => {
    const idealHr = Math.round(ms.reduce((s, m) => s + (60 / m.idealCT) * (m.basePerf / 100), 0));
    setShiftHours(
      Array.from({ length: 8 }, (_, i) => {
        const h = 6 + i;
        return {
          hour: `${h.toString().padStart(2, "0")}`,
          output: Math.round(idealHr * (0.82 + Math.random() * 0.22)),
          target: idealHr,
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      tickRef.current++;
      const now = new Date();
      setTime(now);
      setMs((prev) => {
        const next = prev.map((m) => tickMachine(m, refreshInt / 1000));

        if (tickRef.current % 8 === 0) {
          const idealHr = Math.round(next.reduce((s, m) => s + (60 / m.idealCT) * (m.basePerf / 100), 0));
          setShiftHours((sh) =>
            [...sh.slice(1), { hour: `${(6 + sh.length) % 24}`.padStart(2, "0"), output: Math.round(idealHr * (0.78 + Math.random() * 0.26)), target: idealHr }]
              .slice(-8)
          );
        }

        if (tickRef.current % 4 === 0) {
          const k = calcKPI(next);
          setTrendHist((th) => [
            ...th.slice(-23),
            {
              label: now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
              oee: k.oee,
              avail: k.avail,
              perf: k.perf,
              qual: k.qual,
            },
          ]);
        }

        if (tickRef.current % 12 === 0) {
          setHeatData((hd) =>
            hd.map((row) => row.map((v) => Math.round(Math.max(50, Math.min(99, v + (Math.random() - 0.5) * 2)) * 10) / 10))
          );
        }

        return next;
      });
    }, refreshInt);

    return () => clearInterval(t);
  }, [refreshInt]);

  if (!user) return <LoginScreen onLogin={setUser} />;

  const kpi = calcKPI(ms);
  const allowed = ROLE_ACCESS[user.role] || ["overview"];

  const now = time;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const activeShift =
    shifts.find((s) => {
      if (!s.active) return false;
      const [sh, sm] = s.start.split(":").map(Number);
      const [eh, em] = s.end.split(":").map(Number);
      const st = sh * 60 + sm;
      const en = eh * 60 + em;
      if (en > st) return nowMins >= st && nowMins < en;
      return nowMins >= st || nowMins < en;
    }) || shifts.find((s) => s.active);

  const tabs = ["overview", "equipment", "availability", "performance", "quality", "analytics", "alerts", "data-entry"];
  const tabIcons = {
    overview: "⬡",
    equipment: "⚙️",
    availability: "⏱",
    performance: "🚀",
    quality: "✅",
    analytics: "📈",
    alerts: "🔔",
    "data-entry": "📝",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-gradient-to-r from-slate-950 to-slate-900 px-4 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold tracking-tight">OEE Monitor</div>
            <div className="hidden sm:block h-5 w-px bg-slate-800" />
            <div className="hidden sm:block text-[10px] uppercase tracking-[0.12em] text-slate-500">Factory Intelligence</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[10px]">
              <span className="text-emerald-400">● {ms.filter((m) => m.status === "running").length} Run</span>
              <span className="ml-2 text-red-400">● {ms.filter((m) => m.status === "breakdown").length} Down</span>
              <span className="ml-2 text-amber-400">● {ms.filter((m) => m.status === "idle").length} Idle</span>
            </div>

            <div className="rounded-md border border-slate-800 bg-slate-950/40 px-2 py-1 font-mono text-[10px]">
              <span className="font-bold text-sky-400">{kpi.oee}%</span>
              <span className="mx-1 text-slate-700">=</span>
              <span className="text-emerald-400">{kpi.avail}</span>
              <span className="text-slate-700">×</span>
              <span className="text-amber-400">{kpi.perf}</span>
              <span className="text-slate-700">×</span>
              <span className="text-violet-400">{kpi.qual}</span>
            </div>

            {activeShift && (
              <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 font-mono text-[9px] text-sky-200">
                {activeShift.name} · {activeShift.start}–{activeShift.end}
              </span>
            )}

            <div className="min-w-[180px] rounded-md border border-slate-800 bg-slate-950/40 px-2 py-1 text-center font-mono text-[11px] text-sky-300">
              {time.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}{" "}
              {time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>

            <div className="flex items-center gap-2 rounded-md bg-slate-800/60 px-2 py-1">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold"
                style={{
                  background: `${ROLE_COLOR[user.role]}25`,
                  borderColor: `${ROLE_COLOR[user.role]}50`,
                  color: ROLE_COLOR[user.role],
                }}
              >
                {user.avatar}
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-semibold">{user.name}</div>
                <div className="text-[8px] uppercase" style={{ color: ROLE_COLOR[user.role] }}>
                  {user.role}
                </div>
              </div>
              <button
                onClick={() => setUser(null)}
                className="ml-1 rounded px-1 text-slate-500 hover:bg-slate-700/50 hover:text-slate-300"
                title="Sign out"
              >
                ⏻
              </button>
            </div>
          </div>
        </div>

        <nav className="mt-2 flex items-center gap-1 overflow-x-auto">
          {tabs.map((t) => {
            const ok = allowed.includes(t);
            const active = activeTab === t;
            return (
              <button
                key={t}
                disabled={!ok}
                onClick={() => ok && setActiveTab(t)}
                className={
                  "whitespace-nowrap rounded-md px-3 py-1 text-[11px] border-b-2 transition " +
                  (active
                    ? "bg-slate-800/70 text-sky-200 border-sky-500"
                    : ok
                      ? "bg-transparent text-slate-500 hover:bg-slate-800/50 border-transparent"
                      : "bg-transparent text-slate-700 border-transparent opacity-50 cursor-not-allowed")
                }
              >
                {tabIcons[t]} {t === "data-entry" ? "Data Entry" : t.charAt(0).toUpperCase() + t.slice(1)}
                {!ok && <span className="ml-1 text-[10px]">🔒</span>}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto flex max-w-[1440px] flex-col gap-3 p-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-sm font-semibold">ยังอยู่ระหว่างแยกหน้าจอ + แปลงเป็น Tailwind</div>
          <div className="mt-1 text-xs text-slate-400">
            ตอนนี้ผมพอร์ตโค้ดเข้า Next + แยกไฟล์ (lib + charts + login) เรียบร้อยแล้ว ขั้นต่อไปจะย้าย Dashboard/Modals
            ออกเป็นไฟล์ย่อย และแทนที่ UI ทั้งหมดด้วย Tailwind
          </div>
          <div className="mt-3 text-xs font-mono text-slate-300">Current tab: {activeTab}</div>
        </div>
      </main>
    </div>
  );
}
