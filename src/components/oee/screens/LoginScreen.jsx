"use client";

import { useEffect, useState } from "react";
import { USERS, ROLE_COLOR } from "@/lib/oee/constants";

export default function LoginScreen({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [load, setLoad] = useState(false);
  const [users, setUsers] = useState(USERS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("oee:users");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      setUsers(parsed);
    } catch {
      // ignore
    }
  }, []);

  const go = () => {
    setLoad(true);
    setErr("");
    setTimeout(() => {
      const user = users.find((x) => x.username === u && x.password === p);
      if (user) onLogin(user);
      else {
        setErr("Invalid username or password");
        setLoad(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex items-center justify-center relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "linear-gradient(#0ea5e907 1px,transparent 1px),linear-gradient(90deg,#0ea5e907 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-[95vw] sm:w-[400px]">
        <div className="bg-[var(--oee-surface)]/85 border border-[var(--oee-border-2)] rounded-2xl p-6 sm:p-9 shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/Logo.png"
              alt="FOSTEC"
              className="h-16 object-contain mb-3"
            />
            <div className="text-[10px] tracking-[0.18em] text-slate-500 uppercase font-mono">OEE Monitor Platform</div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-5" />

          <div className="space-y-3">
            <div>
              <div className="text-[10px] text-slate-500 mb-1 tracking-wider">USERNAME</div>
              <input
                type="text"
                value={u}
                onChange={(e) => setU(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
                placeholder="Enter username…"
                className="w-full box-border bg-[var(--oee-surface-2)]/80 border border-[var(--oee-border)] rounded-lg px-3 py-2 text-slate-100 text-sm font-mono outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <div className="text-[10px] text-slate-500 mb-1 tracking-wider">PASSWORD</div>
              <input
                type="password"
                value={p}
                onChange={(e) => setP(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
                placeholder="Enter password…"
                className="w-full box-border bg-[var(--oee-surface-2)]/80 border border-[var(--oee-border)] rounded-lg px-3 py-2 text-slate-100 text-sm font-mono outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {err && (
            <div className="mt-3 rounded-lg border border-red-500/20 bg-red-950/40 px-3 py-2 text-center text-sm text-red-300">
              {err}
            </div>
          )}

          <button
            onClick={go}
            disabled={load}
            className={
              "mt-3 w-full rounded-lg px-3 py-2.5 text-sm font-bold text-white transition-colors " +
              (load
                ? "bg-[var(--oee-surface-2)]/70 border border-[var(--oee-border)] cursor-not-allowed"
                : "bg-gradient-to-br from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 shadow-[0_10px_30px_rgba(0,0,0,0.35)]")
            }
          >
            {load ? "Authenticating…" : "Sign In →"}
          </button>

          <div className="mt-4 rounded-lg bg-[var(--oee-surface-2)]/60 border border-[var(--oee-border)] p-3">
            <div className="text-[9px] text-slate-500 mb-2 tracking-wider">DEMO ACCOUNTS</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {users.map((us) => (
                <button
                  key={us.id}
                  onClick={() => {
                    setU(us.username);
                    setP(us.password);
                  }}
                  className="rounded-md bg-[var(--oee-surface-2)]/60 border px-2 py-1 text-left hover:bg-[var(--oee-surface-2)]/80"
                  style={{ borderColor: `${ROLE_COLOR[us.role]}30` }}
                >
                  <span className="block font-mono text-[10px]" style={{ color: ROLE_COLOR[us.role] }}>
                    {us.username}
                  </span>
                  <span className="text-[9px] text-slate-500">{us.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
