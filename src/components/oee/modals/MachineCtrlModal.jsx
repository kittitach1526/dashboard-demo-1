"use client";

import { useState, useEffect } from "react";
import ModalShell from "@/components/oee/modals/ModalShell";

export default function MachineCtrlModal({ machine, onUpdate, onClose }) {
  const [ms, setMs] = useState({ ...machine });
  const [aBase, setABase] = useState(machine.baseAvail || 78);
  const [pBase, setPBase] = useState(machine.basePerf || 78);
  const [qBase, setQBase] = useState(machine.baseQual || 78);
  const [oeeBase, setOeeBase] = useState(100); 
  const [isManual, setIsManual] = useState(!!ms.forcedStatus);

  useEffect(() => {
    setIsManual(!!ms.forcedStatus);
  }, [ms.forcedStatus]);

  const currentManualStatus = ms.forcedStatus || ms.status;

  // การคำนวณความกว้างหลอด (Relative Scaling)
  const availWidth = aBase;
  const perfWidth = (pBase * aBase) / 100;
  const qualWidth = (qBase * pBase * aBase) / 10000;
  const finalOeeWidth = (oeeBase * qBase * pBase * aBase) / 1000000;

  const apply = () => {
    if (isManual) {
      const updateData = {
        ...ms,
        baseAvail: aBase,
        basePerf: pBase,
        baseQual: qBase,
        forcedStatus: ms.forcedStatus || currentManualStatus,
        availability: aBase,
        performance: pBase,
        quality: qBase,
        oee: finalOeeWidth.toFixed(1),
        speed: 0,
        repairTicksLeft: 0
      };
      onUpdate(updateData);
    } else {
      // โหมด Auto: ส่งค่า null กลับไปเพื่อให้ระบบจำลอง (Simulation) ทำงานต่อเอง
      onUpdate({ ...ms, forcedStatus: null, speed: 1 });
    }
    onClose();
  };

  const statusBtns = [
    { id: "running", label: "RUN", icon: "▶️", color: "#10b981" },
    { id: "idle", label: "IDLE", icon: "⏸️", color: "#f59e0b" },
    { id: "breakdown", label: "STOP", icon: "⛔", color: "#ef4444" },
  ];

  const rangeStyles = `
    input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; position: absolute; top: 0; left: 0; height: 100%; margin: 0; }
    input[type=range]:disabled { cursor: not-allowed; opacity: 0; } /* ซ่อน thumb เมื่อ disabled */
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: #ffffff; box-shadow: 0 0 10px rgba(255,255,255,0.5); border: 2px solid #0f172a; position: relative; z-index: 50; cursor: pointer; }
    input[type=range]:disabled::-webkit-slider-thumb { display: none; }
  `;

  return (
    <ModalShell title={`⚙️ Machine Control: ${ms.name}`} onClose={onClose} widthClass="w-[460px]">
      <style>{rangeStyles}</style>

      <div className="space-y-6 p-1">
        {/* Mode Selector */}
        <div className="flex justify-center">
          <div className="bg-slate-800/80 p-1 rounded-xl border border-white/5 flex gap-1">
            <button 
              onClick={() => { setIsManual(false); setMs(prev => ({ ...prev, forcedStatus: null })); }}
              className={`px-6 py-2 text-[10px] font-black rounded-lg transition-all ${!isManual ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-400"}`}
            >
              AUTO MODE
            </button>
            <button 
              onClick={() => setIsManual(true)}
              className={`px-6 py-2 text-[10px] font-black rounded-lg transition-all ${isManual ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-400"}`}
            >
              MANUAL MODE
            </button>
          </div>
        </div>

        {/* Status Area */}
        <div className={`bg-slate-900/40 rounded-3xl p-6 border border-white/5 shadow-inner transition-opacity ${!isManual ? 'opacity-80' : 'opacity-100'}`}>
          <div className="flex justify-around items-center mb-8">
            {statusBtns.map((st) => {
              const active = isManual ? currentManualStatus === st.id : ms.status === st.id;
              return (
                <button
                  key={st.id}
                  disabled={!isManual}
                  onClick={() => setMs(prev => ({ ...prev, forcedStatus: st.id }))}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 ${active ? "scale-110" : "opacity-20 grayscale"} ${!isManual ? "cursor-not-allowed" : "hover:border-white/20"}`}
                  style={{ borderColor: active ? st.color : "transparent", backgroundColor: active ? `${st.color}15` : "transparent" }}
                >
                  <span className="text-2xl mb-1">{st.icon}</span>
                  <span className="text-[10px] font-black" style={{ color: st.color }}>{st.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sliders Area */}
          <div className="space-y-5">
            {/* Availability */}
            <div className={`space-y-2 transition-all ${!isManual ? 'grayscale opacity-50' : ''}`}>
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-orange-500">
                <span>Availability</span> <span>{aBase}%</span>
              </div>
              <div className="relative h-2 bg-slate-800 rounded-full">
                <div className="absolute h-full bg-orange-500 rounded-full" style={{ width: `${aBase}%` }} />
                <input type="range" min="0" max="100" value={aBase} disabled={!isManual} onChange={(e) => setABase(Number(e.target.value))} />
              </div>
            </div>

            {/* Performance */}
            <div className={`space-y-2 transition-all ${!isManual ? 'grayscale opacity-50' : ''}`}>
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-yellow-400">
                <span>Performance</span> <span>{pBase}%</span>
              </div>
              <div className="relative h-2 bg-slate-800/50 rounded-full">
                <div className="absolute h-full bg-slate-700/20 rounded-full" style={{ width: `${availWidth}%` }} />
                <div className="absolute h-full bg-yellow-400 rounded-full" style={{ width: `${perfWidth}%` }} />
                <div className="absolute inset-0" style={{ width: `${availWidth}%` }}>
                  <input type="range" min="0" max="100" value={pBase} disabled={!isManual} onChange={(e) => setPBase(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Quality */}
            <div className={`space-y-2 transition-all ${!isManual ? 'grayscale opacity-50' : ''}`}>
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-blue-500">
                <span>Quality</span> <span>{qBase}%</span>
              </div>
              <div className="relative h-2 bg-slate-800/50 rounded-full">
                <div className="absolute h-full bg-slate-700/20 rounded-full" style={{ width: `${perfWidth}%` }} />
                <div className="absolute h-full bg-blue-500 rounded-full" style={{ width: `${qualWidth}%` }} />
                <div className="absolute inset-0" style={{ width: `${perfWidth}%` }}>
                  <input type="range" min="0" max="100" value={qBase} disabled={!isManual} onChange={(e) => setQBase(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* OEE Slider */}
            <div className={`space-y-2 transition-all ${!isManual ? 'grayscale opacity-50' : ''}`}>
              <div className="flex justify-between text-[12px] font-black uppercase tracking-widest text-emerald-400">
                <span>OEE = <span className="text-[9px] text-slate-500"> ({aBase}% × {pBase}% × {qBase}%)/10,000 = {(!isManual ? ms.oee : finalOeeWidth.toFixed(1))}</span></span> <span>{oeeBase}%</span>
              </div>
              <div className="relative h-2 bg-slate-800/50 rounded-full">
                <div className="absolute h-full bg-slate-700/20 rounded-full" style={{ width: `${qualWidth}%` }} />
                <div className="absolute h-full bg-emerald-500 rounded-full" style={{ width: `${finalOeeWidth}%` }} />
                <div className="absolute inset-0" style={{ width: `${qualWidth}%` }}>
                  <input type="range" min="0" max="100" value={oeeBase} disabled={!isManual} onChange={(e) => setOeeBase(Number(e.target.value))} />
                </div>
              </div>
            </div>

            {/* Preview Value */}
            <div className="pt-6 border-t border-white/5 text-center">
              <div className="text-[10px] text-slate-500 tracking-[0.3em] font-bold mb-1 uppercase">Calculated OEE Index</div>
              <div className={`text-5xl font-black font-mono tracking-tighter italic transition-colors ${!isManual ? 'text-slate-600' : 'text-emerald-400'}`}>
                {(!isManual ? ms.oee : finalOeeWidth.toFixed(1))}<span className="text-xl not-italic opacity-30 ml-1">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-4 rounded-2xl bg-slate-800 text-slate-400 text-xs font-bold uppercase hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={apply} className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
            Confirm Settings
          </button>
        </div>
      </div>
    </ModalShell>
  );
}