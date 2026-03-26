"use client";

import { useEffect, useMemo, useState } from "react";

import Card from "@/components/oee/ui/Card";

import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

export default function AlertsPage() {
  const { user, alertLog } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  const pageSize = 10;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil((alertLog?.length || 0) / pageSize));

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
    return alertLog.slice(start, start + pageSize);
  }, [alertLog, page]);

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
    <div className="grid grid-cols-1 gap-3">
      <Card
        title="🧾 Alert Log"
        right={
          <div className="flex items-center gap-2">
            <span className="inline-flex rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[9px] text-red-200">C:{counts.critical}</span>
            <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] text-amber-200">W:{counts.warning}</span>
            <span className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono text-[9px] text-sky-200">I:{counts.info}</span>
          </div>
        }
      >
        <div className="space-y-3">
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
              <div key={a.id} className={`flex items-center gap-3 rounded-xl border-l-4 ${left} ${bg} p-3`}>
                <div className="text-xl">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex rounded-full border px-2 py-0.5 font-mono text-[9px] ${badge}`}>{sevLbl}</span>
                        <div className="truncate text-sm font-semibold text-slate-200">{a.title}</div>
                      </div>
                    </div>
                    <div className="shrink-0 text-[10px] text-slate-500">{ts}</div>
                  </div>
                  <div className="mt-1 text-xs text-slate-400 break-words">{a.event} · {a.detail}</div>
                </div>
              </div>
            );
          })}

          {alertLog.length === 0 && (
            <div className="rounded-xl border-l-4 border-emerald-400 bg-emerald-950/10 p-3 text-sm text-emerald-200">
              No alerts logged yet
            </div>
          )}

          {alertLog.length > 0 && (
            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={
                  "rounded-lg border px-3 py-1.5 text-xs font-semibold " +
                  (page <= 1
                    ? "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/30 text-slate-600 cursor-not-allowed"
                    : "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 text-slate-300 hover:text-slate-100")
                }
              >
                ← Prev
              </button>

              <div className="text-[11px] text-slate-500">
                Page <span className="font-mono text-slate-200">{page}</span> / {totalPages}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={
                  "rounded-lg border px-3 py-1.5 text-xs font-semibold " +
                  (page >= totalPages
                    ? "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/30 text-slate-600 cursor-not-allowed"
                    : "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 text-slate-300 hover:text-slate-100")
                }
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
