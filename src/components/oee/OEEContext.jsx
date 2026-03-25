"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_SHIFTS, MACHINE_DEFS } from "@/lib/oee/constants";
import { calcKPI, createMachineState, tickMachine } from "@/lib/oee/sim";

const OEEContext = createContext(null);

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const parts = document.cookie.split(";").map((p) => p.trim());
  const hit = parts.find((p) => p.startsWith(`${name}=`));
  if (!hit) return null;
  return decodeURIComponent(hit.slice(name.length + 1));
}

function writeCookie(name, value) {
  if (typeof document === "undefined") return;
  const v = encodeURIComponent(value);
  document.cookie = `${name}=${v}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

function clearCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function OEEProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("oee:user");
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    try {
      const raw = readCookie("oee_user");
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  });
  const [ms, setMs] = useState(() => MACHINE_DEFS.map(createMachineState));
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
    try {
      if (user) {
        const raw = JSON.stringify(user);
        localStorage.setItem("oee:user", raw);
        writeCookie("oee_user", raw);
      } else {
        localStorage.removeItem("oee:user");
        clearCookie("oee_user");
      }
    } catch {
      // ignore
    }
  }, [user]);

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

  const kpi = useMemo(() => calcKPI(ms), [ms]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      ms,
      setMs,
      refreshInt,
      setRefreshInt,
      time,
      trendHist,
      heatData,
      shiftHours,
      shifts,
      setShifts,
      kpi,
    }),
    [user, ms, refreshInt, time, trendHist, heatData, shiftHours, shifts, kpi]
  );

  return <OEEContext.Provider value={value}>{children}</OEEContext.Provider>;
}

export function useOEE() {
  const ctx = useContext(OEEContext);
  if (!ctx) throw new Error("useOEE must be used within OEEProvider");
  return ctx;
}
