"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ROLE_ACCESS, ROLE_COLOR } from "@/lib/oee/constants";
import { useOEE } from "@/components/oee/OEEContext";
import RefreshSelector from "@/components/oee/ui/RefreshSelector";
import ExportModal from "@/components/oee/modals/ExportModal";
import ShiftModal from "@/components/oee/modals/ShiftModal";
import DataEntryModal from "@/components/oee/modals/DataEntryModal";
import { getActiveShift } from "@/lib/oee/derived";

export default function OEEFrame({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, ms, kpi, time, shifts, setShifts, refreshInt, setRefreshInt } = useOEE();

  const [showExport, setShowExport] = useState(false);
  const [showShift, setShowShift] = useState(false);
  const [showEntry, setShowEntry] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [router, user]);

  if (!user) return null;

  const allowed = ROLE_ACCESS[user.role] || ["overview"];

  const activeShift = getActiveShift(shifts, time);

  const tabs = [
    { key: "overview", label: "Overview", icon: "⬡" },
    { key: "equipment", label: "Equipment", icon: "⚙️" },
    { key: "availability", label: "Availability", icon: "⏱" },
    { key: "performance", label: "Performance", icon: "🚀" },
    { key: "quality", label: "Quality", icon: "✅" },
    { key: "analytics", label: "Analytics", icon: "📈" },
    { key: "alerts", label: "Alerts", icon: "🔔" },
    { key: "data-entry", label: "Data Entry", icon: "📝" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-20 border-b border-[var(--oee-border)] bg-gradient-to-r from-[#0b1426] via-[#0d1b35] to-[#0b1426] px-4 py-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-sm font-bold tracking-tight">OEE Monitor</div>
            <div className="hidden sm:block h-5 w-px bg-[var(--oee-border)]" />
            <div className="hidden sm:block text-[10px] uppercase tracking-[0.12em] text-slate-500">Factory Intelligence</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[10px]">
              <span className="text-emerald-400"> {ms.filter((m) => m.status === "running").length} Run</span>
              <span className="ml-2 text-red-400"> {ms.filter((m) => m.status === "breakdown").length} Down</span>
              <span className="ml-2 text-amber-400"> {ms.filter((m) => m.status === "idle").length} Idle</span>
            </div>

            <div className="rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 px-2 py-1 font-mono text-[10px]">
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

            <div className="min-w-[180px] rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 px-2 py-1 text-center font-mono text-[11px] text-sky-300">
              {time.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}{" "}
              {time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setShowEntry(true)}
                className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-[11px] font-semibold text-sky-200"
              >
                📝 Data Entry
              </button>
              <button
                onClick={() => setShowShift(true)}
                className="rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-slate-100"
              >
                ⏰ Shift
              </button>
              <button
                onClick={() => setShowExport(true)}
                className="rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-slate-100"
              >
                📤 Export
              </button>
              <RefreshSelector interval={refreshInt} onChange={setRefreshInt} />
            </div>

            <div className="flex items-center gap-2 rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 px-2 py-1">
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--oee-border)] text-[10px] font-bold"
                style={{
                  background: `${ROLE_COLOR[user.role]}25`,
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

        <nav className="mt-2 flex items-center gap-1 overflow-x-auto border-t border-[var(--oee-border)]/70 pt-2">
          {tabs.map((t) => {
            const ok = allowed.includes(t.key);
            const href = `/${t.key}`;
            const active = pathname === href;
            return (
              <Link
                key={t.key}
                href={ok ? href : pathname}
                aria-disabled={!ok}
                className={
                  "whitespace-nowrap rounded-md px-3 py-1 text-[11px] border-b-2 transition " +
                  (active
                    ? "bg-[var(--oee-surface-2)]/70 text-sky-200 border-sky-500"
                    : ok
                      ? "bg-transparent text-slate-500 hover:bg-[var(--oee-surface-2)]/40 border-transparent"
                      : "bg-transparent text-slate-700 border-transparent opacity-50 pointer-events-none")
                }
              >
                {t.icon} {t.label}
                {!ok && <span className="ml-1 text-[10px]">🔒</span>}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto flex max-w-[1440px] flex-col gap-3 p-4">{children}</main>

      {showShift && <ShiftModal shifts={shifts} onSave={setShifts} onClose={() => setShowShift(false)} />}
      {showEntry && (
        <DataEntryModal
          machines={ms}
          shifts={shifts}
          onSave={(data) => console.log("Saved:", data)}
          onClose={() => setShowEntry(false)}
        />
      )}
      {showExport && <ExportModal onClose={() => setShowExport(false)} machines={ms} kpi={kpi} />}
    </div>
  );
}
