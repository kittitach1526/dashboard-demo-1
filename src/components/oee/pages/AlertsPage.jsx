"use client";

import { useEffect, useMemo, useState } from "react";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

export default function AlertsPage() {
  const { user, alertLog } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  const pageSize = 10;
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("ALL");

  const filteredLog = useMemo(() => {
    if (filter === "ALL") return alertLog;
    return alertLog.filter(a => a.severity === filter);
  }, [alertLog, filter]);

  const totalPages = Math.max(1, Math.ceil((filteredLog?.length || 0) / pageSize));

  useEffect(() => {
    setPage(1);
  }, [filter]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const counts = useMemo(() => {
    let c = 0;
    let w = 0;
    let i = 0;
    for (const a of alertLog) {
      if (a.severity === "CRITICAL") c++;
      else if (a.severity === "WARNING") w++;
      else i++;
    }
    return { critical: c, warning: w, info: i };
  }, [alertLog]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLog.slice(start, start + pageSize);
  }, [filteredLog, page]);

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
    <div className="h-full flex flex-col gap-3">
      {/* Header Section */}
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🔔</div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Alert Management</h1>
              <p className="text-xs text-slate-400">Real-time system alerts and notifications</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === "ALL" 
                    ? "bg-slate-700 text-slate-100 border border-slate-600" 
                    : "bg-slate-800/50 text-slate-400 border border-transparent hover:border-slate-700"
                }`}
              >
                ALL ({alertLog.length})
              </button>
              <button
                onClick={() => setFilter("CRITICAL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === "CRITICAL" 
                    ? "bg-red-500/20 text-red-200 border border-red-500/50" 
                    : "bg-red-950/20 text-red-400/60 border border-transparent hover:border-red-500/30"
                }`}
              >
                🚨 CRITICAL ({counts.critical})
              </button>
              <button
                onClick={() => setFilter("WARNING")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === "WARNING" 
                    ? "bg-amber-500/20 text-amber-200 border border-amber-500/50" 
                    : "bg-amber-950/20 text-amber-400/60 border border-transparent hover:border-amber-500/30"
                }`}
              >
                ⚠️ WARNING ({counts.warning})
              </button>
              <button
                onClick={() => setFilter("INFO")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === "INFO" 
                    ? "bg-sky-500/20 text-sky-200 border border-sky-500/50" 
                    : "bg-sky-950/20 text-sky-400/60 border border-transparent hover:border-sky-500/30"
                }`}
              >
                ℹ️ INFO ({counts.info})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert List Section */}
      <div className="flex-1 rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {pageItems.map((a) => {
            const sevLbl = a.severity;
            const left = a.severity === "CRITICAL" ? "border-red-500" : a.severity === "WARNING" ? "border-amber-400" : "border-sky-400";
            const bg = a.severity === "CRITICAL" ? "bg-red-950/20" : a.severity === "WARNING" ? "bg-amber-950/10" : "bg-sky-950/10";
            const badge =
              a.severity === "CRITICAL"
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : a.severity === "WARNING"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                  : "border-sky-500/30 bg-sky-500/10 text-sky-200";
            const icon = a.severity === "CRITICAL" ? "🚨" : a.severity === "WARNING" ? "⚠️" : "ℹ️";
            const ts = new Date(a.ts).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

            return (
              <div key={a.id} className={`flex items-center gap-4 rounded-xl border-l-4 ${left} ${bg} p-4 hover:brightness-110 transition-all`}>
                <div className="text-2xl">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[9px] ${badge}`}>{sevLbl}</span>
                      <div className="text-sm font-bold text-slate-100">{a.title}</div>
                    </div>
                    <div className="shrink-0 text-[10px] text-slate-400 font-mono">{ts}</div>
                  </div>
                  <div className="text-xs text-slate-300">{a.event}</div>
                  <div className="text-xs text-slate-400 mt-1">{a.detail}</div>
                </div>
              </div>
            );
          })}

          {filteredLog.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">📭</div>
                <div className="text-lg font-bold text-slate-300">No alerts found</div>
                <div className="text-sm text-slate-400 mt-1">
                  {filter === "ALL" ? "No alerts logged yet" : `No ${filter} alerts`}
                </div>
              </div>
            </div>
          )}
        </div>

        {filteredLog.length > 0 && (
          <div className="border-t border-[var(--oee-border)] bg-[var(--oee-surface)]/50 p-4">
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={
                  "rounded-lg border px-4 py-2 text-xs font-semibold transition-all " +
                  (page <= 1
                    ? "border-slate-700 bg-slate-800/30 text-slate-600 cursor-not-allowed"
                    : "border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600")
                }
              >
                ← Previous
              </button>

              <div className="text-sm text-slate-300">
                Page <span className="font-mono font-bold text-slate-100">{page}</span> of <span className="font-mono">{totalPages}</span>
                <span className="text-slate-500 ml-2">({filteredLog.length} alerts)</span>
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={
                  "rounded-lg border px-4 py-2 text-xs font-semibold transition-all " +
                  (page >= totalPages
                    ? "border-slate-700 bg-slate-800/30 text-slate-600 cursor-not-allowed"
                    : "border-slate-600 bg-slate-700/50 text-slate-200 hover:bg-slate-600")
                }
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
