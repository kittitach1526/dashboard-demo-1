"use client";

import { useState, useMemo, useEffect } from "react";
import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

// Helper function to generate deterministic historical data (no real-time random)
const generateHistoricalData = (machineId, dateOffset, baseValue) => {
  // Use fixed seed for historical data - ข้อมูลคงที่สำหรับข้อมูลย้อนหลัง
  const seed = machineId.charCodeAt(0) + dateOffset + 20240327; // Fixed date seed
  const deterministicRandom = Math.abs(Math.sin(seed) * 100) % 100;
  
  // Use fixed base value instead of real-time ms.oee - ข้อมูลคงที่
  const fixedBaseValue = 75 + (machineId.charCodeAt(0) % 20); // Fixed base OEE 75-95
  
  // Simulate realistic patterns: weekends lower OEE, some deterministic breakdowns
  const date = new Date();
  date.setDate(date.getDate() - dateOffset);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Weekend penalty
  const weekendMultiplier = isWeekend ? 0.85 : 1.0;
  
  // Deterministic breakdown events (10% chance based on seed)
  const hasBreakdown = deterministicRandom < 10;
  const breakdownMultiplier = hasBreakdown ? 0.6 : 1.0;
  
  // Generate OEE with deterministic variation - ใช้ค่าคงที่
  let oee = fixedBaseValue * weekendMultiplier * breakdownMultiplier;
  oee += (deterministicRandom - 50) * 0.5; // Add deterministic variation
  oee = Math.max(15, Math.min(95, oee)); // Clamp to realistic range
  
  // Determine status based on OEE
  let status;
  if (hasBreakdown) {
    status = "breakdown";
  } else if (oee > 70) {
    status = "running";
  } else if (oee > 40) {
    status = "idle";
  } else {
    status = "breakdown";
  }
  
  // Generate deterministic KPI values (no Math.random)
  const availSeed = seed + 1;
  const perfSeed = seed + 2;
  const qualSeed = seed + 3;
  
  return {
    oee: Math.round(oee),
    availability: Math.round(oee * (0.92 + (Math.abs(Math.sin(availSeed) * 100) % 100) * 0.0008)),
    performance: Math.round(oee * (0.88 + (Math.abs(Math.sin(perfSeed) * 100) % 100) * 0.0012)),
    quality: Math.round(oee * (0.85 + (Math.abs(Math.sin(qualSeed) * 100) % 100) * 0.0015)),
    status
  };
};

export default function DataHistoryPage() {
  const { user, ms, kpi } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];
  const [tab, setTab] = useState("daily");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!allowed.includes("data")) {
    return (
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-10 text-center text-slate-400">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-sm font-semibold text-slate-300">Access Restricted</div>
      </div>
    );
  }

  const thMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const data = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Use deterministic random based on date to avoid hydration mismatch
    const seededRandom = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const weeks = Array.from({ length: 4 }, (_, i) => {
      const weekNum = i + 1;
      // Calculate week start and end dates
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));
      
      // Aggregate data from all machines for this week
      let totalOee = 0;
      let totalAvail = 0;
      let totalPerf = 0;
      let totalQual = 0;
      let dataPoints = 0;
      
      ms.forEach((m) => {
        for (let day = 0; day < 7; day++) {
          const dayData = generateHistoricalData(m.id, i * 7 + day, Number(m.oee));
          totalOee += dayData.oee;
          totalAvail += dayData.availability;
          totalPerf += dayData.performance;
          totalQual += dayData.quality;
          dataPoints++;
        }
      });
      
      return {
        label: `สัปดาห์ที่ ${weekNum} (${weekStart.getDate()}-${weekEnd.getDate()})`,
        oee: Math.round(totalOee / dataPoints),
        avail: Math.round(totalAvail / dataPoints),
        perf: Math.round(totalPerf / dataPoints),
        qual: Math.round(totalQual / dataPoints)
      };
    });

    // Generate yearly data from actual historical data
    const yearlyData = thMonths.slice(0, currentMonth + 1).map((month, i) => {
      // Calculate month start and end
      const monthStart = new Date(today.getFullYear(), i, 1);
      const monthEnd = new Date(today.getFullYear(), i + 1, 0);
      const daysInMonth = monthEnd.getDate();
      
      // Only include days up to today for current month
      const maxDays = (i === currentMonth) ? today.getDate() : daysInMonth;
      
      // Aggregate data from all machines for this month
      let totalOee = 0;
      let totalAvail = 0;
      let totalPerf = 0;
      let totalQual = 0;
      let dataPoints = 0;
      
      ms.forEach((m) => {
        for (let day = 0; day < maxDays; day++) {
          const dayOffset = (currentMonth - i) * 30 + day;
          const dayData = generateHistoricalData(m.id, dayOffset, Number(m.oee));
          totalOee += dayData.oee;
          totalAvail += dayData.availability;
          totalPerf += dayData.performance;
          totalQual += dayData.quality;
          dataPoints++;
        }
      });
      
      return {
        name: month,
        oee: Math.round(totalOee / dataPoints),
        avail: Math.round(totalAvail / dataPoints),
        perf: Math.round(totalPerf / dataPoints),
        qual: Math.round(totalQual / dataPoints)
      };
    });

    return {
      today,
      year,
      currentMonth,
      weeks,
      yearlyData
    };
  }, [ms]);

  const tabs = [
    { key: "daily", label: "📅 รายวัน" },
    { key: "monthly", label: "📆 รายเดือน" },
    { key: "yearly", label: "📊 รายปี" },
  ];

  // Don't render date-dependent content until client-side
  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-4 shadow-xl">
          <h1 className="text-xl font-bold text-slate-100">📋 ข้อมูลย้อนหลัง</h1>
          <p className="text-sm text-slate-400 mt-1">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  const { today, year, weeks, yearlyData } = data;
  const dateStr = today.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
  const monthStr = today.toLocaleDateString("th-TH", { year: "numeric", month: "long" });

  return (
    <div className="space-y-4">
      {/* Header + Tab Switcher */}
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-100">📋 ข้อมูลย้อนหลัง</h1>
            <p className="text-sm text-slate-400 mt-1">ข้อมูลการผลิตย้อนหลัง</p>
          </div>
        </div>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                "px-4 py-2 rounded-lg text-sm font-bold transition-all " +
                (tab === t.key
                  ? "bg-sky-500/20 text-sky-200 border border-sky-500/50"
                  : "bg-[var(--oee-surface)]/30 text-slate-400 border border-transparent hover:border-[var(--oee-border)] hover:text-slate-200")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-4 text-center shadow-xl">
          <div className="text-xs text-slate-400 mb-1">OEE</div>
          <div className="font-mono text-3xl font-bold text-sky-300">{kpi.oee}%</div>
        </div>
        <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-4 text-center shadow-xl">
          <div className="text-xs text-slate-400 mb-1">Availability</div>
          <div className="font-mono text-3xl font-bold text-emerald-300">{kpi.avail}%</div>
        </div>
        <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-4 text-center shadow-xl">
          <div className="text-xs text-slate-400 mb-1">Performance</div>
          <div className="font-mono text-3xl font-bold text-amber-300">{kpi.perf}%</div>
        </div>
        <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-4 text-center shadow-xl">
          <div className="text-xs text-slate-400 mb-1">Quality</div>
          <div className="font-mono text-3xl font-bold text-violet-300">{kpi.qual}%</div>
        </div>
      </div>

      {/* Daily Tab */}
      {tab === "daily" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--oee-border)]">
              <p className="text-base text-slate-300">ข้อมูลประจำวันที่ <span className="text-sky-300">{dateStr}</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-[var(--oee-border)] bg-[var(--oee-surface)]/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Machine</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Line</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">OEE%</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Avail%</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Perf%</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Qual%</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Good</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Total</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ms.map((m) => (
                    <tr key={m.id} className="border-b border-[var(--oee-border)]/50 hover:bg-[var(--oee-surface)]/30 transition">
                      <td className="px-6 py-4 font-semibold text-slate-100 text-base">{m.name}</td>
                      <td className="px-6 py-4 text-slate-400 text-base">{m.line}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-sky-300 text-lg">{m.oee}%</td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-300 text-lg">{Math.round(m.availability)}%</td>
                      <td className="px-6 py-4 text-right font-mono text-amber-300 text-lg">{Math.round(m.performance)}%</td>
                      <td className="px-6 py-4 text-right font-mono text-violet-300 text-lg">{Math.round(m.quality)}%</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-300 text-lg">{m.goodCount}</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-300 text-lg">{m.totalCount}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                          m.status === "running" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : m.status === "breakdown" ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}>{m.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hourly Summary Table for Day */}
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--oee-border)]">
              <p className="text-base text-slate-300">สรุปข้อมูลรายชั่วโมง - วันนี้ <span className="text-sky-300">{dateStr}</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--oee-border)] bg-[var(--oee-surface)]/50">
                    <th className="px-3 py-2 text-left font-semibold text-slate-400">ชม.</th>
                    {ms.map((m) => (
                      <th key={m.id} className="px-3 py-2 text-center font-semibold text-slate-400">
                        <div className="text-xs">{m.name}</div>
                        <div className="text-xs text-slate-500">Line {m.line}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const currentHour = new Date().getHours();
                    const rows = [];
                    
                    for (let hour = 0; hour <= currentHour; hour++) {
                      const rowCells = [];
                      rowCells.push(
                        <td key={`hour-${hour}`} className="px-3 py-2 font-semibold text-slate-100 border-r border-[var(--oee-border)]/30">
                          {hour}:00
                        </td>
                      );
                      
                      ms.forEach((m) => {
                        // Use historical data function for hourly data
                        const dayData = generateHistoricalData(m.id, 0, Number(m.oee));
                        // Add machine-specific variation for more diversity
                        const machineSeed = m.id.charCodeAt(0) + m.id.charCodeAt(1) || 1;
                        const hourVariation = (Math.sin(hour / 24 * Math.PI * 2 + machineSeed) * 20) + 
                                             (Math.sin(machineSeed + hour * 3) * 12) + 
                                             (Math.cos(machineSeed * 3 + hour * 2) * 8) +
                                             (Math.sin(machineSeed * 2 + hour * 4) * 6);
                        const hourOee = Math.max(15, Math.min(95, dayData.oee + hourVariation));
                        
                        rowCells.push(
                          <td key={`${hour}-${m.id}`} className="px-3 py-2 text-center">
                            <div className="font-mono text-sm font-bold text-sky-300">{Math.round(hourOee)}%</div>
                          </td>
                        );
                      });
                      
                      rows.push(
                        <tr key={`row-${hour}`} className="border-b border-[var(--oee-border)]/20 hover:bg-[var(--oee-surface)]/20 transition">
                          {rowCells}
                        </tr>
                      );
                    }
                    
                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Hourly Charts */}
          <div className="space-y-6">
            {ms.map((m) => {
              const currentHour = new Date().getHours();
              const hourlyData = Array.from({ length: 24 }, (_, i) => {
                if (i > currentHour) {
                  return { hour: i, oee: 0, status: "future" };
                }
                // Use historical data function for hourly data (no real-time random)
                const dayData = generateHistoricalData(m.id, 0, Number(m.oee));
                // Add machine-specific variation for more diversity
                const machineSeed = m.id.charCodeAt(0) + m.id.charCodeAt(1) || 1;
                const hourVariation = (Math.sin(i / 24 * Math.PI * 2 + machineSeed) * 20) + 
                                     (Math.sin(machineSeed + i * 3) * 12) + 
                                     (Math.cos(machineSeed * 3 + i * 2) * 8) +
                                     (Math.sin(machineSeed * 2 + i * 4) * 6);
                const hourOee = Math.max(15, Math.min(95, dayData.oee + hourVariation));
                
                let status;
                if (hourOee > 70) {
                  status = "running";
                } else if (hourOee > 40) {
                  status = "idle";
                } else {
                  status = "breakdown";
                }
                
                return {
                  hour: i,
                  oee: Math.round(hourOee),
                  status
                };
              });

              const getBarColor = (status) => {
                switch (status) {
                  case "running": return "#22c55e";
                  case "idle": return "#f59e0b";
                  case "breakdown": return "#ef4444";
                  default: return "rgba(148, 163, 184, 0.3)";
                }
              };

              const CustomTooltip = ({ active, payload, label }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/90 p-3 shadow-lg">
                      <p className="text-sm font-semibold text-slate-100">{label}:00</p>
                      <p className="text-sm text-slate-300">OEE: {data.oee}%</p>
                      <p className="text-sm text-slate-400 capitalize">{data.status}</p>
                    </div>
                  );
                }
                return null;
              };

              return (
                <div key={m.id} className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{m.name}</h3>
                      <p className="text-sm text-slate-400">Line {m.line}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-lg font-bold text-sky-300">{m.oee}%</span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                        m.status === "running" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : m.status === "breakdown" ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>{m.status}</span>
                    </div>
                  </div>
                  
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={hourlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                        <XAxis 
                          dataKey="hour" 
                          stroke="#94a3b8"
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          tickFormatter={(value) => `${value}:00`}
                        />
                        <YAxis 
                          stroke="#94a3b8"
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="oee" radius={[4, 4, 0, 0]}>
                          {hourlyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex items-center gap-6 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-emerald-500" />
                      <span>Running</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-500" />
                      <span>Idle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span>Breakdown</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-slate-400/30" />
                      <span>Future</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly Tab */}
      {tab === "monthly" && (
        <>
          {/* Daily Summary Table for Month */}
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--oee-border)]">
              <p className="text-base text-slate-300">สรุปข้อมูลรายวัน - เดือน <span className="text-sky-300">{monthStr}</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--oee-border)] bg-[var(--oee-surface)]/50">
                    <th className="px-3 py-2 text-left font-semibold text-slate-400">วัน</th>
                    {ms.map((m) => (
                      <th key={m.id} className="px-3 py-2 text-center font-semibold text-slate-400">
                        <div className="text-xs">{m.name}</div>
                        <div className="text-xs text-slate-500">Line {m.line}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const currentDay = new Date().getDate();
                    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                    const rows = [];
                    
                    for (let day = 1; day <= currentDay; day++) {
                      const rowCells = [];
                      rowCells.push(
                        <td key={`day-${day}`} className="px-3 py-2 font-semibold text-slate-100 border-r border-[var(--oee-border)]/30">
                          {day}
                        </td>
                      );
                      
                      ms.forEach((m) => {
                        const dayOffset = daysInMonth - day;
                        const dayData = generateHistoricalData(m.id, dayOffset, Number(m.oee));
                        
                        rowCells.push(
                          <td key={`${day}-${m.id}`} className="px-3 py-2 text-center">
                            <div className="font-mono text-sm font-bold text-sky-300">{dayData.oee}%</div>
                          </td>
                        );
                      });
                      
                      rows.push(
                        <tr key={`row-${day}`} className="border-b border-[var(--oee-border)]/20 hover:bg-[var(--oee-surface)]/20 transition">
                          {rowCells}
                        </tr>
                      );
                    }
                    
                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily Charts for Month */}
          <div className="space-y-6">
            {ms.map((m) => {
              const currentDay = new Date().getDate();
              const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
              const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
                const dayNum = i + 1;
                if (dayNum > currentDay) {
                  return { day: dayNum, oee: 0, status: "future" };
                }
                // Use historical data function for daily data
                const dayOffset = daysInMonth - dayNum;
                const dayData = generateHistoricalData(m.id, dayOffset, Number(m.oee));
                
                return {
                  day: dayNum,
                  oee: dayData.oee,
                  status: dayData.status
                };
              });

              const getBarColor = (status) => {
                switch (status) {
                  case "running": return "#22c55e";
                  case "idle": return "#f59e0b";
                  case "breakdown": return "#ef4444";
                  default: return "rgba(148, 163, 184, 0.3)";
                }
              };

              const CustomTooltip = ({ active, payload, label }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/90 p-3 shadow-lg">
                      <p className="text-sm font-semibold text-slate-100">Day {label}</p>
                      <p className="text-sm text-slate-300">OEE: {data.oee}%</p>
                      <p className="text-sm text-slate-400 capitalize">{data.status}</p>
                    </div>
                  );
                }
                return null;
              };

              return (
                <div key={m.id} className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{m.name}</h3>
                      <p className="text-sm text-slate-400">Line {m.line}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-lg font-bold text-sky-300">{m.oee}%</span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                        m.status === "running" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : m.status === "breakdown" ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>{m.status}</span>
                    </div>
                  </div>
                  
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dailyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                        <XAxis 
                          dataKey="day" 
                          stroke="#94a3b8"
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          interval={Math.floor(daysInMonth / 10)}
                        />
                        <YAxis 
                          stroke="#94a3b8"
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="oee" radius={[4, 4, 0, 0]}>
                          {dailyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex items-center gap-6 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-emerald-500" />
                      <span>Running</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-500" />
                      <span>Idle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span>Breakdown</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-slate-400/30" />
                      <span>Future</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Daily Details for Month */}
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--oee-border)]">
              <p className="text-base text-slate-300">รายละเอียดรายวัน - เดือน <span className="text-sky-300">{monthStr}</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--oee-border)] bg-[var(--oee-surface)]/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">วันที่</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Machine</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">OEE%</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Avail%</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Perf%</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Qual%</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const currentDay = new Date().getDate();
                    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
                    const rows = [];
                    
                    for (let day = 1; day <= daysInMonth; day++) {
                      if (day > currentDay) break;
                      
                      ms.forEach((m) => {
                        // Use historical data function for daily details
                        const dayOffset = daysInMonth - day;
                        const dayData = generateHistoricalData(m.id, dayOffset, Number(m.oee));
                        
                        rows.push(
                          <tr key={`${day}-${m.id}`} className="border-b border-[var(--oee-border)]/30 hover:bg-[var(--oee-surface)]/20 transition">
                            <td className="px-4 py-2 font-semibold text-slate-100">{day}</td>
                            <td className="px-4 py-2 text-slate-300">
                              <div>
                                <p className="font-medium">{m.name}</p>
                                <p className="text-xs text-slate-500">Line {m.line}</p>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right font-mono font-bold text-sky-300">{dayData.oee}%</td>
                            <td className="px-4 py-2 text-right font-mono text-emerald-300">{dayData.availability}%</td>
                            <td className="px-4 py-2 text-right font-mono text-amber-300">{dayData.performance}%</td>
                            <td className="px-4 py-2 text-right font-mono text-violet-300">{dayData.quality}%</td>
                          </tr>
                        );
                      });
                    }
                    
                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--oee-border)]">
              <p className="text-base text-slate-300">สรุปรายสัปดาห์ - เดือน <span className="text-sky-300">{monthStr}</span></p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 p-6">
              {weeks.map((w, i) => (
                <div key={i} className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface)]/30 p-5">
                  <h3 className="text-base font-bold text-slate-100 mb-4">{w.label}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="text-sm text-slate-400">OEE</div>
                      <div className="font-mono text-2xl font-bold text-sky-300">{w.oee}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-400">Avail</div>
                      <div className="font-mono text-2xl font-bold text-emerald-300">{w.avail}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-400">Perf</div>
                      <div className="font-mono text-2xl font-bold text-amber-300">{w.perf}%</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-400">Qual</div>
                      <div className="font-mono text-2xl font-bold text-violet-300">{w.qual}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Machine Data */}
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--oee-border)]">
              <p className="text-base text-slate-300">สรุปรายเครื่องจักร - เดือน <span className="text-sky-300">{monthStr}</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-[var(--oee-border)] bg-[var(--oee-surface)]/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Machine</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">Line</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">OEE%</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Avail%</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Perf%</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Qual%</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Good</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ms.map((m) => (
                    <tr key={m.id} className="border-b border-[var(--oee-border)]/50 hover:bg-[var(--oee-surface)]/30 transition">
                      <td className="px-6 py-4 font-semibold text-slate-100 text-base">{m.name}</td>
                      <td className="px-6 py-4 text-slate-400 text-base">{m.line}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-sky-300 text-lg">{m.oee}%</td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-300 text-lg">{Math.round(m.availability)}%</td>
                      <td className="px-6 py-4 text-right font-mono text-amber-300 text-lg">{Math.round(m.performance)}%</td>
                      <td className="px-6 py-4 text-right font-mono text-violet-300 text-lg">{Math.round(m.quality)}%</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-300 text-lg">{m.goodCount}</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-300 text-lg">{m.totalCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Yearly Tab */}
      {tab === "yearly" && (
        <>
          {/* Monthly Summary Table for Year */}
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--oee-border)]">
              <p className="text-base text-slate-300">สรุปข้อมูลรายเดือน - ปี <span className="text-sky-300">{year + 543}</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--oee-border)] bg-[var(--oee-surface)]/50">
                    <th className="px-3 py-2 text-left font-semibold text-slate-400">เดือน</th>
                    {ms.map((m) => (
                      <th key={m.id} className="px-3 py-2 text-center font-semibold text-slate-400">
                        <div className="text-xs">{m.name}</div>
                        <div className="text-xs text-slate-500">Line {m.line}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const currentMonth = new Date().getMonth();
                    const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
                    const rows = [];
                    
                    for (let month = 0; month <= currentMonth; month++) {
                      const rowCells = [];
                      rowCells.push(
                        <td key={`month-${month}`} className="px-3 py-2 font-semibold text-slate-100 border-r border-[var(--oee-border)]/30">
                          {monthNames[month]}
                        </td>
                      );
                      
                      ms.forEach((m) => {
                        // Use historical data function for monthly data
                        const monthOffset = (currentMonth - month) * 30;
                        const monthData = generateHistoricalData(m.id, monthOffset, Number(m.oee));
                        
                        // Add same simple variation as yearly charts for consistency - เหมาะสมดูง่าย
                        const machineSeed = m.id.charCodeAt(0) || 1;
                        const yearVariation = (Math.sin(machineSeed + month * 2) * 12) + 
                                            (Math.cos(machineSeed + month) * 8);
                        const yearOee = Math.max(20, Math.min(90, monthData.oee + yearVariation));
                        
                        rowCells.push(
                          <td key={`${month}-${m.id}`} className="px-3 py-2 text-center">
                            <div className="font-mono text-sm font-bold text-sky-300">{Math.round(yearOee)}%</div>
                          </td>
                        );
                      });
                      
                      rows.push(
                        <tr key={`row-${month}`} className="border-b border-[var(--oee-border)]/20 hover:bg-[var(--oee-surface)]/20 transition">
                          {rowCells}
                        </tr>
                      );
                    }
                    
                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Charts for Year */}
          <div className="space-y-6">
            {ms.map((m) => {
              const currentMonth = new Date().getMonth();
              const monthlyData = Array.from({ length: 12 }, (_, i) => {
                if (i > currentMonth) {
                  return { month: i, oee: 0, status: "future" };
                }
                // Use historical data function for monthly data with more variation
                const monthOffset = (currentMonth - i) * 30; // Approximate days per month
                const monthData = generateHistoricalData(m.id, monthOffset, Number(m.oee));
                
                // Add simple variation for yearly charts - เหมาะสมดูง่าย
                const machineSeed = m.id.charCodeAt(0) || 1;
                const yearVariation = (Math.sin(machineSeed + i * 2) * 12) + 
                                    (Math.cos(machineSeed + i) * 8);
                const yearOee = Math.max(20, Math.min(90, monthData.oee + yearVariation));
                
                return {
                  month: i,
                  oee: Math.round(yearOee),
                  status: monthData.status
                };
              });

              const getBarColor = (status) => {
                switch (status) {
                  case "running": return "#22c55e";
                  case "idle": return "#f59e0b";
                  case "breakdown": return "#ef4444";
                  default: return "rgba(148, 163, 184, 0.3)";
                }
              };

              const CustomTooltip = ({ active, payload, label }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  return (
                    <div className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/90 p-3 shadow-lg">
                      <p className="text-sm font-semibold text-slate-100">{monthNames[label]}</p>
                      <p className="text-sm text-slate-300">OEE: {data.oee}%</p>
                      <p className="text-sm text-slate-400 capitalize">{data.status}</p>
                    </div>
                  );
                }
                return null;
              };

              return (
                <div key={m.id} className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{m.name}</h3>
                      <p className="text-sm text-slate-400">Line {m.line}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-lg font-bold text-sky-300">{m.oee}%</span>
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                        m.status === "running" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : m.status === "breakdown" ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>{m.status}</span>
                    </div>
                  </div>
                  
                  <div className="h-64 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthlyData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#94a3b8"
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          tickFormatter={(value) => {
                            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            return monthNames[value];
                          }}
                        />
                        <YAxis 
                          stroke="#94a3b8"
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="oee" radius={[4, 4, 0, 0]}>
                          {monthlyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="flex items-center gap-6 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-emerald-500" />
                      <span>Running</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-amber-500" />
                      <span>Idle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span>Breakdown</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-slate-400/30" />
                      <span>Future</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Monthly Details for Year */}
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--oee-border)]">
              <p className="text-base text-slate-300">รายละเอียดรายเดือน - ปี <span className="text-sky-300">{year + 543}</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--oee-border)] bg-[var(--oee-surface)]/50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">เดือน</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Machine</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">OEE%</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Avail%</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Perf%</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400">Qual%</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const currentMonth = new Date().getMonth();
                    const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
                    const rows = [];
                    
                    for (let month = 0; month <= currentMonth; month++) {
                      ms.forEach((m) => {
                        // Use historical data function for monthly details
                        const monthOffset = (currentMonth - month) * 30;
                        const monthData = generateHistoricalData(m.id, monthOffset, Number(m.oee));
                        
                        rows.push(
                          <tr key={`${month}-${m.id}`} className="border-b border-[var(--oee-border)]/30 hover:bg-[var(--oee-surface)]/20 transition">
                            <td className="px-4 py-2 font-semibold text-slate-100">{monthNames[month]}</td>
                            <td className="px-4 py-2 text-slate-300">
                              <div>
                                <p className="font-medium">{m.name}</p>
                                <p className="text-xs text-slate-500">Line {m.line}</p>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right font-mono font-bold text-sky-300">{monthData.oee}%</td>
                            <td className="px-4 py-2 text-right font-mono text-emerald-300">{monthData.availability}%</td>
                            <td className="px-4 py-2 text-right font-mono text-amber-300">{monthData.performance}%</td>
                            <td className="px-4 py-2 text-right font-mono text-violet-300">{monthData.quality}%</td>
                          </tr>
                        );
                      });
                    }
                    
                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Yearly Summary Table */}
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--oee-border)]">
              <p className="text-base text-slate-300">สรุปรายเดือน - ปี <span className="text-sky-300">{year + 543}</span></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-[var(--oee-border)] bg-[var(--oee-surface)]/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">เดือน</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">OEE%</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Availability%</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Performance%</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">Quality%</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyData.map((m, i) => (
                    <tr key={i} className="border-b border-[var(--oee-border)]/50 hover:bg-[var(--oee-surface)]/30 transition">
                      <td className="px-6 py-4 font-semibold text-slate-100 text-base">{m.name}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-sky-300 text-lg">{m.oee}%</td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-300 text-lg">{m.avail}%</td>
                      <td className="px-6 py-4 text-right font-mono text-amber-300 text-lg">{m.perf}%</td>
                      <td className="px-6 py-4 text-right font-mono text-violet-300 text-lg">{m.qual}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
