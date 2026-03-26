"use client";

import { useState } from "react";
import ModalShell from "@/components/oee/modals/ModalShell";

export default function MachineCtrlModal({ machine, onUpdate, onClose }) {
  const [ms, setMs] = useState({ ...machine });
  const [aBase, setABase] = useState(machine.baseAvail || 78);
  const [pBase, setPBase] = useState(machine.basePerf || 78);
  const [qBase, setQBase] = useState(machine.baseQual || 78);
  const [isManual, setIsManual] = useState(ms.forcedStatus ? true : false);

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
        
        {/* 1. Mode Selector (Top Right) */}
        <div className="absolute -top-12 right-0 flex bg-slate-800/80 p-0.5 rounded-lg border border-white/5 scale-90">
          <button 
            onClick={() => { setIsManual(false); setMs(prev => ({ ...prev, forcedStatus: null })); }}
            className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${!isManual ? "bg-blue-600 text-white shadow-md" : "text-slate-500"}`}
          >
            AUTO
          </button>
          <button 
            onClick={() => setIsManual(true)}
            className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${isManual ? "bg-blue-600 text-white shadow-md" : "text-slate-500"}`}
          >
            MANUAL
          </button>
        </div>

        {/* 2. Status Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {statusBtns.map((st) => {
            const active = ms.forcedStatus === st.id;
            return (
              <button
                key={st.id}
                disabled={!isManual}
                onClick={() => setMs(prev => ({ ...prev, forcedStatus: st.id }))}
                className={`flex flex-col items-center py-3 rounded-xl border-2 transition-all ${
                  active ? "scale-105" : "opacity-30 grayscale"
                } ${!isManual ? "cursor-not-allowed" : "hover:opacity-100"}`}
                style={{
                  borderColor: active ? st.color : "transparent",
                  backgroundColor: active ? `${st.color}15` : "#1e293b50",
                }}
              >
                <span className="text-xl mb-1">{st.icon}</span>
                <span className="text-[10px] font-black" style={{ color: active ? st.color : "#94a3b8" }}>{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Sliders Area (Relative Scaling) */}
        <div className="bg-[#0f172a]/60 rounded-2xl p-5 space-y-6 border border-white/5">
          
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