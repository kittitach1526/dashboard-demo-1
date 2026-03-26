"use client";

import { useState, useEffect } from "react";
import ModalShell from "@/components/oee/modals/ModalShell";

export default function MachineCtrlModal({ machine, onUpdate, onClose }) {
  const [ms, setMs] = useState({ ...machine });
  const [aBase, setABase] = useState(machine.baseAvail || 78);
  const [pBase, setPBase] = useState(machine.basePerf || 78);
  const [qBase, setQBase] = useState(machine.baseQual || 78);
  const [isManual, setIsManual] = useState(ms.forcedStatus ? true : false);
  
  // ดึงสถานะปัจจุบันมา active ปุ่มตอนเปิด modal
  useEffect(() => {
    if (ms.forcedStatus) {
      setIsManual(true);
    } else {
      setIsManual(false);
    }
  }, [ms.forcedStatus]);
  
  // ใน MANUAL mode ถ้ายังไม่ได้เลือกสถานะ ให้ใช้สถานะปัจจุบัน
  const currentManualStatus = ms.forcedStatus || ms.status;

  const apply = () => {
    onUpdate({ 
      ...ms, 
      baseAvail: aBase, 
      basePerf: pBase, 
      baseQual: qBase, 
      forcedStatus: isManual ? ms.forcedStatus : null 
    });
    onClose();
  };

  const statusBtns = [
    { id: "running", label: "RUN", icon: "▶️", color: "#10b981" },
    { id: "idle", label: "IDLE", icon: "⏸️", color: "#f59e0b" },
    { id: "breakdown", label: "STOP", icon: "⛔", color: "#ef4444" },
  ];

  const oeePreview = ((aBase / 100) * (pBase / 100) * (qBase / 100) * 100).toFixed(1);

  const rangeStyles = `
    input[type=range] {
      -webkit-appearance: none;
      width: 100%;
      background: transparent;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      margin: 0;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 18px;
      width: 18px;
      border-radius: 50%;
      background: #ffffff;
      cursor: pointer;
      box-shadow: 0 0 8px rgba(255,255,255,0.8);
      border: 3px solid #0f172a;
      position: relative;
      z-index: 30;
    }
  `;

  return (
    <ModalShell title={`⚙️ ${ms.name}`} onClose={onClose} widthClass="w-[440px]">
      <style>{rangeStyles}</style>
      
      <div className="space-y-5 p-1 relative">
        
        {/* 1. Mode Selector */}
        <div className="flex justify-center">
          <div className="bg-slate-800/80 p-0.5 rounded-lg border border-white/5 flex">
            <button 
              onClick={() => { setIsManual(false); setMs(prev => ({ ...prev, forcedStatus: null })); }}
              className={`px-4 py-2 text-[10px] font-bold rounded-md transition-all ${!isManual ? "bg-blue-600 text-white shadow-md" : "text-slate-500"}`}
            >
              AUTO MODE
            </button>
            <button 
              onClick={() => setIsManual(true)}
              className={`px-4 py-2 text-[10px] font-bold rounded-md transition-all ${isManual ? "bg-blue-600 text-white shadow-md" : "text-slate-500"}`}
            >
              MANUAL MODE
            </button>
          </div>
        </div>

        {/* 2. Status Display */}
        <div className="bg-slate-900/60 rounded-2xl p-6 border border-white/5">
          <div className="text-center mb-4">
            <div className="text-[10px] text-slate-500 tracking-widest uppercase mb-2">Machine Status</div>
            <div className="flex justify-center items-center gap-4">
              {statusBtns.map((st) => {
                const active = isManual ? currentManualStatus === st.id : ms.status === st.id;
                return (
                  <button
                    key={st.id}
                    disabled={!isManual}
                    onClick={() => setMs(prev => ({ ...prev, forcedStatus: st.id }))}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      active ? "scale-105 shadow-lg" : "opacity-60"
                    } ${!isManual ? "cursor-not-allowed" : "hover:scale-105"}`}
                    style={{
                      borderColor: active ? st.color : `${st.color}40`,
                      backgroundColor: active ? `${st.color}20` : `${st.color}08`,
                    }}
                  >
                    <span className="text-2xl mb-2">{st.icon}</span>
                    <span className="text-xs font-bold" style={{ color: active ? st.color : `${st.color}AA` }}>{st.label}</span>
                  </button>
                );
              })}
            </div>
            {!isManual && (
              <div className="mt-3 text-[9px] text-slate-500 text-center">
                Auto-simulated status
              </div>
            )}
          </div>
          
          {/* 3. Sliders Area (Relative Scaling) */}
          <div className="space-y-4">
            <div className="text-[10px] text-slate-500 tracking-widest uppercase text-center mb-3">OEE Parameters</div>
            
            {/* Availability */}
            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Availability</span>
                <span className="text-md font-mono font-bold text-orange-500">{aBase}%</span>
              </div>
              <div className="relative h-1.5 bg-slate-800 rounded-full">
                <div className="absolute h-full bg-orange-500 rounded-full" style={{ width: `${aBase}%` }} />
                <input type="range" min="0" max="100" value={aBase} onChange={(e) => setABase(Number(e.target.value))} />
              </div>
            </div>

            {/* Performance */}
            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Performance</span>
                <span className="text-md font-mono font-bold text-yellow-400">{pBase}%</span>
              </div>
              <div className="relative h-1.5 bg-slate-800/50 rounded-full">
                <div className="absolute h-full bg-slate-700/30 rounded-full" style={{ width: `${aBase}%` }} />
                <div className="absolute h-full bg-yellow-400 rounded-full" style={{ width: `${(pBase * aBase) / 100}%` }} />
                <div className="absolute top-[-6px] h-4" style={{ width: `${aBase}%` }}>
                  <input type="range" min="0" max="100" value={pBase} onChange={(e) => setPBase(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Quality */}
            <div className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">Quality</span>
                <span className="text-md font-mono font-bold text-blue-500">{qBase}%</span>
              </div>
              <div className="relative h-1.5 bg-slate-800/50 rounded-full">
                <div className="absolute h-full bg-slate-700/30 rounded-full" style={{ width: `${(pBase * aBase) / 100}%` }} />
                <div className="absolute h-full bg-blue-500 rounded-full" style={{ width: `${(qBase * pBase * aBase) / 10000}%` }} />
                <div className="absolute top-[-6px] h-4" style={{ width: `${(pBase * aBase) / 100}%` }}>
                  <input type="range" min="0" max="100" value={qBase} onChange={(e) => setQBase(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* OEE Preview (Large Display) */}
            <div className="pt-4 border-t border-white/5 text-center">
              <div className="text-[9px] text-slate-500 tracking-widest mb-1">OEE PREVIEW</div>
              <div className="text-4xl font-black text-emerald-400 font-mono italic">
                {oeePreview}<span className="text-lg ml-0.5 not-italic opacity-40">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 text-[10px] font-bold uppercase">
            Cancel
          </button>
          <button onClick={apply} className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-[10px] uppercase shadow-lg shadow-blue-900/20">
            Confirm Update
          </button>
        </div>
      </div>
    </ModalShell>
  );
}