"use client";

import { useState, useMemo } from "react";
import { useOEE } from "@/components/oee/OEEContext";
import { ROLE_ACCESS } from "@/lib/oee/constants";

// Helper function to generate deterministic historical data (same as DataHistoryPage)
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

export default function DataRangePage() {
  const { user, ms, kpi } = useOEE();
  const allowed = ROLE_ACCESS[user?.role] || ["overview"];

  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [searched, setSearched] = useState(false);

  // Add CSS for date input calendar icon
  const dateInputStyles = `
    input[type="date"]::-webkit-calendar-picker-indicator {
      filter: invert(1);
      cursor: pointer;
    }
    input[type="date"]::-webkit-inner-spin-button,
    input[type="date"]::-webkit-clear-button {
      filter: invert(1);
    }
  `;

  const rangeData = useMemo(() => {
    if (!searched || !startDate || !endDate) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = [];
    
    // Generate all dates in range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days.map((date, index) => {
      const dateStr = date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate - date) / (1000 * 60 * 60 * 24));
      
      return {
        date: dateStr,
        dayData: ms.map((m) => {
          const data = generateHistoricalData(m.id, daysDiff, Number(m.oee));
          return {
            id: m.id,
            name: m.name,
            line: m.line,
            ...data
          };
        })
      };
    });
  }, [searched, startDate, endDate, ms, today]);

  // Calculate aggregated KPI for the range
  const rangeKPI = useMemo(() => {
    if (!rangeData.length) return { oee: 0, avail: 0, perf: 0, qual: 0 };

    let totalOee = 0, totalAvail = 0, totalPerf = 0, totalQual = 0;
    let count = 0;

    rangeData.forEach(({ dayData }) => {
      dayData.forEach((data) => {
        totalOee += data.oee;
        totalAvail += data.availability;
        totalPerf += data.performance;
        totalQual += data.quality;
        count++;
      });
    });

    return {
      oee: Math.round(totalOee / count),
      avail: Math.round(totalAvail / count),
      perf: Math.round(totalPerf / count),
      qual: Math.round(totalQual / count)
    };
  }, [rangeData]);

  if (!allowed.includes("data")) {
    return (
      <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/60 p-10 text-center text-slate-400">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-sm font-semibold text-slate-300">Access Restricted</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <style>{dateInputStyles}</style>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-slate-100">🔍 ดูข้อมูลตามช่วงเวลา</h1>
          <p className="text-base text-slate-400 mt-2">เลือกช่วงวันที่ที่ต้องการดูข้อมูล</p>
        </div>

        {/* Date Selection */}
        <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">วันที่เริ่มต้น</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/80 px-4 py-3 text-base text-slate-100 font-mono outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">วันที่สิ้นสุด</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/80 px-4 py-3 text-base text-slate-100 font-mono outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition"
              />
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setSearched(true)}
                className="w-full max-w-xs rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 px-6 py-3 text-base font-bold text-white hover:from-sky-400 hover:to-indigo-400 transition shadow-lg shadow-sky-500/25"
              >
                ค้นหา
              </button>
            </div>
          </div>
        </div>

        {searched && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-6 text-center shadow-xl">
                <div className="text-sm font-medium text-slate-400 mb-2">OEE</div>
                <div className="font-mono text-3xl font-bold text-sky-300">{rangeKPI.oee}%</div>
              </div>
              <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-6 text-center shadow-xl">
                <div className="text-sm font-medium text-slate-400 mb-2">Availability</div>
                <div className="font-mono text-3xl font-bold text-emerald-300">{rangeKPI.avail}%</div>
              </div>
              <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-6 text-center shadow-xl">
                <div className="text-sm font-medium text-slate-400 mb-2">Performance</div>
                <div className="font-mono text-3xl font-bold text-amber-300">{rangeKPI.perf}%</div>
              </div>
              <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-6 text-center shadow-xl">
                <div className="text-sm font-medium text-slate-400 mb-2">Quality</div>
                <div className="font-mono text-3xl font-bold text-violet-300">{rangeKPI.qual}%</div>
              </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--oee-border)]">
                <p className="text-base text-slate-300">
                  ข้อมูลช่วง <span className="font-mono text-sky-300">{startDate}</span> ถึง <span className="font-mono text-sky-300">{endDate}</span>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b border-[var(--oee-border)] bg-[var(--oee-surface)]/50">
                      <th className="px-4 py-3 text-left font-semibold text-slate-400">วันที่</th>
                      {ms.map((m) => (
                        <th key={m.id} className="px-4 py-3 text-center font-semibold text-slate-400 min-w-[100px]">
                          <div className="text-sm">{m.name}</div>
                          <div className="text-xs text-slate-500">Line {m.line}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rangeData.map(({ date, dayData }, index) => {
                      const rowCells = [];
                      rowCells.push(
                        <td key={`date-${index}`} className="px-4 py-3 font-semibold text-slate-100 border-r border-[var(--oee-border)]/30 min-w-[80px]">
                          {date}
                        </td>
                      );
                      
                      dayData.forEach((m) => {
                        rowCells.push(
                          <td key={`${index}-${m.id}`} className="px-4 py-3 text-center min-w-[100px]">
                            <div className="font-mono text-base font-bold text-sky-300">{m.oee}%</div>
                          </td>
                        );
                      });
                      
                      return (
                        <tr key={`row-${index}`} className="border-b border-[var(--oee-border)]/20 hover:bg-[var(--oee-surface)]/20 transition">
                          {rowCells}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {!searched && (
          <div className="rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 p-10 text-center shadow-xl">
            <div className="text-5xl mb-4">🔍</div>
            <div className="text-lg font-bold text-slate-300">เลือกช่วงเวลาที่ต้องการ</div>
            <div className="text-sm text-slate-400 mt-1">กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด แล้วกดค้นหา</div>
          </div>
        )}
      </div>
    </div>
  );
}
