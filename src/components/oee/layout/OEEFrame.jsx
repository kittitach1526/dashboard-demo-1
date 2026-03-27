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
import UserSettingsModal from "@/components/oee/modals/UserSettingsModal";

export default function OEEFrame({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, ms, kpi, time, shifts, setShifts, refreshInt, setRefreshInt } = useOEE();

  const [showExport, setShowExport] = useState(false);
  const [showShift, setShowShift] = useState(false);
  const [showEntry, setShowEntry] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dataMenuOpen, setDataMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [router, user]);

  if (!user) return null;

  const allowed = ROLE_ACCESS[user.role] || ["overview"];

  const dayShift =
    shifts.find((s) => s.active && s.id === 1) ||
    shifts.find((s) => s.active && (s.start === "06:00" || s.name.toLowerCase().includes("day"))) ||
    shifts.find((s) => s.active) ||
    null;

  const tabs = [
    { key: "overview", label: "Overview", icon: "⬡" },
    { key: "equipment", label: "Equipment", icon: "🏭" },
    { key: "availability", label: "Availability", icon: "⏱️" },
    { key: "performance", label: "Performance", icon: "🚀" },
    { key: "quality", label: "Quality", icon: "✅" },
    { key: "analytics", label: "Analytics", icon: "📈" },
    { key: "alerts", label: "Alerts", icon: "🔔" },
    { key: "settings", label: "Setting", icon: "⚙️" },
  ];

  const dataSubMenus = [
    { key: "data/history", label: "ข้อมูลย้อนหลัง", icon: "�" },
    { key: "data/range", label: "ตามช่วงเวลา", icon: "🔍" },
    { key: "data/export", label: "Export", icon: "📤" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:fixed inset-y-0 left-0 z-30 ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'} border-r border-[var(--oee-border)] bg-gradient-to-b from-[#0b1426] to-[#0d1b35] transition-all duration-300 ease-in-out h-screen`}>
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--oee-border)]">
            <div className={`${sidebarCollapsed ? 'lg:flex' : 'lg:hidden'} hidden items-center justify-center`}>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-1 text-slate-400 hover:text-slate-200"
                title="Expand sidebar"
              >
                ☰
              </button>
            </div>
            <div className={`${sidebarCollapsed ? 'lg:hidden' : ''} flex items-center gap-3`}>
              <img src="/Logo.png" alt="FOSTEC" className="h-8 object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`${sidebarCollapsed ? 'lg:hidden' : ''} hidden lg:block rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-1 text-slate-400 hover:text-slate-200`}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? '☰' : '◀'}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-1 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {tabs.filter((t) => allowed.includes(t.key)).map((t) => {
                const href = `/${t.key}`;
                const active = pathname === href;
                return (
                  <Link
                    key={t.key}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={
                      "flex items-center justify-center rounded-lg px-3 py-2 text-[11px] transition " +
                      (active
                        ? "bg-[var(--oee-surface-2)]/70 text-sky-200 border border-sky-500/30"
                        : "text-slate-400 hover:bg-[var(--oee-surface-2)]/40 hover:text-slate-200")
                    }
                    title={sidebarCollapsed ? t.label : undefined}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className={`${sidebarCollapsed ? 'lg:hidden' : ''} flex-1 ml-3`}>{t.label}</span>
                  </Link>
                );
              })}

              {/* Data Menu with Sub-menus */}
              {allowed.includes("data") && (
                <>
                  <button
                    onClick={() => setDataMenuOpen(!dataMenuOpen)}
                    className={
                      "flex items-center justify-center rounded-lg px-3 py-2 text-[11px] transition w-full " +
                      (pathname.startsWith("/data")
                        ? "bg-[var(--oee-surface-2)]/70 text-sky-200 border border-sky-500/30"
                        : "text-slate-400 hover:bg-[var(--oee-surface-2)]/40 hover:text-slate-200")
                    }
                    title={sidebarCollapsed ? "Data" : undefined}
                  >
                    <span className="text-lg">💾</span>
                    <span className={`${sidebarCollapsed ? 'lg:hidden' : ''} flex-1 ml-3 text-left`}>Data</span>
                    <span className={`${sidebarCollapsed ? 'lg:hidden' : ''} text-[10px] text-slate-500 transition-transform ${dataMenuOpen ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {dataMenuOpen && !sidebarCollapsed && (
                    <div className="ml-4 space-y-1 border-l border-[var(--oee-border)] pl-3">
                      {dataSubMenus.map((sub) => {
                        const href = `/${sub.key}`;
                        const active = pathname === href;
                        return (
                          <Link
                            key={sub.key}
                            href={href}
                            onClick={() => setSidebarOpen(false)}
                            className={
                              "flex items-center rounded-lg px-3 py-1.5 text-[11px] transition " +
                              (active
                                ? "bg-[var(--oee-surface-2)]/70 text-sky-200 border border-sky-500/30"
                                : "text-slate-400 hover:bg-[var(--oee-surface-2)]/40 hover:text-slate-200")
                            }
                          >
                            <span className="text-sm">{sub.icon}</span>
                            <span className="flex-1 ml-2">{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-10 border-b border-[var(--oee-border)] bg-gradient-to-r from-[#0b1426] via-[#0d1b35] to-[#0b1426] px-4 py-2 lg:ml-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-2 text-slate-400 hover:text-slate-200"
              >
                ☰
              </button>
              {sidebarCollapsed && <img src="/Logo.png" alt="FOSTEC" className="hidden lg:block h-7 object-contain" />}
              <div className="hidden lg:block h-5 w-px bg-[var(--oee-border)]" />
              <div className="hidden lg:block text-[10px] uppercase tracking-[0.12em] text-slate-500">Factory Intelligence</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-[10px] hidden sm:block">
                <span className="text-emerald-400"> {ms.filter((m) => m.status === "running").length} Run</span>
                <span className="ml-2 text-amber-400"> {ms.filter((m) => m.status === "idle").length} Idle</span>
                <span className="ml-2 text-red-400"> {ms.filter((m) => m.status === "breakdown").length} Down</span>
              </div>

              <div className="rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 px-2 py-1 font-mono text-[10px] hidden sm:block">
                <span className="font-bold text-sky-400">{kpi.oee}%</span>
                <span className="mx-1 text-slate-700">=</span>
                <span className="text-emerald-400">{kpi.avail}</span>
                <span className="text-slate-700">×</span>
                <span className="text-amber-400">{kpi.perf}</span>
                <span className="text-slate-700">×</span>
                <span className="text-violet-400">{kpi.qual}</span>
              </div>

              {dayShift && (
                <button
                  onClick={() => setShowShift(true)}
                  className="rounded-full border px-2 py-0.5 font-mono text-[9px] hidden sm:flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer"
                  title="Click to configure shifts"
                  style={{
                    borderColor: dayShift.color || '#3b82f6',
                    backgroundColor: `${dayShift.color || '#3b82f6'}20`,
                    color: '#e2e8f0'
                  }}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shadow-sm" 
                    style={{
                      backgroundColor: dayShift.color || '#3b82f6',
                      boxShadow: `0 0 4px ${dayShift.color || '#3b82f6'}80`
                    }}
                  ></span>
                  {dayShift.name} · {dayShift.start}–{dayShift.end}
                </button>
              )}

              <div className="hidden lg:flex items-center gap-2">
                <RefreshSelector interval={refreshInt} onChange={setRefreshInt} />
              </div>

              <div className="w-full sm:w-auto sm:min-w-[180px] rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 px-2 py-1 text-center font-mono text-[10px] sm:text-[11px] text-sky-300">
                {time.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}{" "}
                {time.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 px-2 py-1 hover:bg-[var(--oee-surface-2)] transition-colors"
                >
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
                  <div className="ml-1 text-slate-500">
                    {showUserMenu ? "▲" : "▼"}
                  </div>
                </button>

                {showUserMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface)] shadow-xl z-50">
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowUserSettings(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
                        >
                          <span>⚙️</span>
                          <span>User Settings</span>
                        </button>
                        <div className="border-t border-[var(--oee-border)] my-1" />
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setUser(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm text-red-400 hover:bg-red-950/20 transition-colors"
                        >
                          <span>⏻</span>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => setMobileActionsOpen((v) => !v)}
                  className="rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 px-2 py-1 text-[11px] font-semibold text-slate-300 hover:text-slate-100"
                  aria-expanded={mobileActionsOpen}
                  aria-controls="oee-mobile-actions"
                  title="Actions"
                >
                  ⋯
                </button>
              </div>
            </div>
          </div>

          {mobileActionsOpen && (
            <div
              id="oee-mobile-actions"
              className="md:hidden mt-2 rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface)]/70 p-2"
            >
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setShowEntry(true);
                    setMobileActionsOpen(false);
                  }}
                  className="flex-1 rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-2 text-[11px] font-semibold text-sky-200"
                >
                  📝 Data Entry
                </button>
                <button
                  onClick={() => {
                    setShowShift(true);
                    setMobileActionsOpen(false);
                  }}
                  className="flex-1 rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 px-2 py-2 text-[11px] font-semibold text-slate-300 hover:text-slate-100"
                >
                  ⏰ Shift
                </button>
                <button
                  onClick={() => {
                    setShowExport(true);
                    setMobileActionsOpen(false);
                  }}
                  className="flex-1 rounded-md border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 px-2 py-2 text-[11px] font-semibold text-slate-300 hover:text-slate-100"
                >
                  📤 Export
                </button>
                <div className="w-full">
                  <RefreshSelector interval={refreshInt} onChange={setRefreshInt} />
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 mx-auto flex max-w-[1440px] flex-col gap-3 p-4 pt-4">{children}</main>
      </div>

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
      {showUserSettings && (
        <UserSettingsModal
          user={{ ...user, roleColor: ROLE_COLOR[user.role] }}
          onUpdate={(updatedUser) => setUser(updatedUser)}
          onClose={() => setShowUserSettings(false)}
        />
      )}
    </div>
  );
}
