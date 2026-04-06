"use client";

import { useMemo, useState } from "react";

import ModalShell from "@/components/oee/modals/ModalShell";

function createInitialForm(machines, shifts) {
  return {
    machine: machines[0]?.id || "M01",
    shift: shifts.find((s) => s.active)?.id || 1,
    date: new Date().toISOString().slice(0, 10),
    plannedMins: 480,
    downtimeMins: 0,
    downtimeReason: "mechanical",
    totalCount: 0,
    goodCount: 0,
    idealCT: 0.5,
    availability: 92,
    performance: 85,
    quality: 80,
    notes: "",
    dtMachine: machines[0]?.id || "M01",
    dtStart: "",
    dtEnd: "",
    dtReason: "mechanical",
    dtNotes: "",
  };
}

function computeDerived(form) {
  const runMins = form.plannedMins - (form.downtimeMins || 0);
  const avail = form.availability || 0;
  const perf = form.performance || 0;
  const qual = form.quality || 0;
  const oee = (avail * perf * qual) / 10000;
  return { runMins, avail, perf, qual, oeeDisp: Math.round(oee * 10) / 10 };
}

export default function DataEntryModal({ machines, shifts, onSave, onClose }) {
  const [tab, setTab] = useState("production");
  const [status, setStatus] = useState("running");

  const [form, setForm] = useState(() => createInitialForm(machines, shifts));

  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const derived = useMemo(() => computeDerived(form), [form]);

  const [saved, setSaved] = useState(false);
  const save = () => {
    onSave({ ...form, ...derived, scrap: form.totalCount - form.goodCount });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const TabBtn = ({ k, label }) => (
    <button
      onClick={() => setTab(k)}
      className={
        "w-full sm:flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition " +
        (tab === k
          ? "bg-[var(--oee-surface-2)]/70 text-sky-200"
          : "bg-transparent text-slate-400 hover:bg-[var(--oee-surface-2)]/40")
      }
    >
      {label}
    </button>
  );

  const inputClass =
    "w-full rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500";

  return (
    <ModalShell title="📝 กรอกข้อมูลการผลิต" onClose={onClose} widthClass="w-[720px]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 p-2">
          <TabBtn k="production" label="📦 ข้อมูลการผลิต" />
          <TabBtn k="downtime" label="⚠️ บันทึก Downtime" />
          <TabBtn k="quality" label="✅ ข้อมูลคุณภาพ" />
        </div>

        {tab === "production" && (
          <div className="space-y-3">
            {/* Machine Status Buttons */}
            <div>
              <div className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">⚙️ สถานะเครื่องจักร (เลือก 1 สถานะ)</div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <button
                  onClick={() => setStatus("running")}
                  className={
                    "group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 " +
                    (status === "running"
                      ? "border-emerald-500 bg-emerald-500/20 shadow-lg shadow-emerald-500/20"
                      : "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 hover:border-emerald-500/50 hover:bg-emerald-500/10")
                  }
                >
                  <div className="relative z-10">
                    <div className="mb-2 text-3xl">▶️</div>
                    <div className={"text-sm font-bold " + (status === "running" ? "text-emerald-300" : "text-slate-400 group-hover:text-emerald-400")}>RUN</div>
                    <div className="text-[10px] text-slate-500">เดินเครื่อง</div>
                  </div>
                  {status === "running" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                  )}
                </button>

                <button
                  onClick={() => setStatus("idle")}
                  className={
                    "group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 " +
                    (status === "idle"
                      ? "border-amber-500 bg-amber-500/20 shadow-lg shadow-amber-500/20"
                      : "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 hover:border-amber-500/50 hover:bg-amber-500/10")
                  }
                >
                  <div className="relative z-10">
                    <div className="mb-2 text-3xl">⏸️</div>
                    <div className={"text-sm font-bold " + (status === "idle" ? "text-amber-300" : "text-slate-400 group-hover:text-amber-400")}>IDLE</div>
                    <div className="text-[10px] text-slate-500">รอดำเนินการ</div>
                  </div>
                  {status === "idle" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                  )}
                </button>

                <button
                  onClick={() => setStatus("breakdown")}
                  className={
                    "group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 " +
                    (status === "breakdown"
                      ? "border-red-500 bg-red-500/20 shadow-lg shadow-red-500/20"
                      : "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 hover:border-red-500/50 hover:bg-red-500/10")
                  }
                >
                  <div className="relative z-10">
                    <div className="mb-2 text-3xl">⛔</div>
                    <div className={"text-sm font-bold " + (status === "breakdown" ? "text-red-300" : "text-slate-400 group-hover:text-red-400")}>DOWN</div>
                    <div className="text-[10px] text-slate-500">เครื่องหยุด</div>
                  </div>
                  {status === "breakdown" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent" />
                  )}
                </button>

                <button
                  onClick={() => setStatus("setup")}
                  className={
                    "group relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 " +
                    (status === "setup"
                      ? "border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20"
                      : "border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 hover:border-blue-500/50 hover:bg-blue-500/10")
                  }
                >
                  <div className="relative z-10">
                    <div className="mb-2 text-3xl">🔧</div>
                    <div className={"text-sm font-bold " + (status === "setup" ? "text-blue-300" : "text-slate-400 group-hover:text-blue-400")}>SETUP</div>
                    <div className="text-[10px] text-slate-500">ตั้งค่า/เปลี่ยนรุ่น</div>
                  </div>
                  {status === "setup" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                  )}
                </button>
              </div>
              {status === "running" && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                  <span className="text-lg">⚠️</span>
                  <span className="text-[11px] text-emerald-200">Manual override: RUNNING</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">เครื่องจักร</div>
                <select value={form.machine} onChange={(e) => upd("machine", e.target.value)} className={inputClass}>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (L{m.line})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">กะการทำงาน</div>
                <select value={form.shift} onChange={(e) => upd("shift", Number(e.target.value))} className={inputClass}>
                  {shifts
                    .filter((s) => s.active)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">วันที่</div>
                <input type="date" value={form.date} onChange={(e) => upd("date", e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">เวลาวางแผน (นาที)</div>
                <input type="number" value={form.plannedMins} onChange={(e) => upd("plannedMins", Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">เวลาหยุด (นาที)</div>
                <input type="number" value={form.downtimeMins} onChange={(e) => upd("downtimeMins", Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">Ideal CT (นาที/ชิ้น)</div>
                <input type="number" step="0.01" value={form.idealCT} onChange={(e) => upd("idealCT", Number(e.target.value))} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">จำนวนผลิตทั้งหมด (ชิ้น)</div>
                <input type="number" value={form.totalCount} onChange={(e) => upd("totalCount", Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">จำนวนของดี (ชิ้น)</div>
                <input type="number" value={form.goodCount} onChange={(e) => upd("goodCount", Number(e.target.value))} className={inputClass} />
              </div>
            </div>

            {/* OEE Sliders */}
            <div className="space-y-4 rounded-xl border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/40 p-4">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">📊 ปรับค่า OEE (เลื่อนได้ตามหลัก OEE)</div>
              
              {/* Availability Slider */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-300">Availability Base</span>
                  <span className="font-mono text-lg font-bold text-emerald-300">{form.availability}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.availability}
                  onChange={(e) => upd("availability", Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${form.availability}%, #1e293b ${form.availability}%, #1e293b 100%)`
                  }}
                />
                <div className="mt-1 text-[10px] text-slate-500">Run Time ÷ Planned Production Time</div>
              </div>

              {/* Performance Slider */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-300">Performance Base</span>
                  <span className="font-mono text-lg font-bold text-amber-300">{form.performance}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={form.availability}
                  value={Math.min(form.performance, form.availability)}
                  onChange={(e) => upd("performance", Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${form.availability > 0 ? (Math.min(form.performance, form.availability) / form.availability) * 100 : 0}%, #1e293b ${form.availability > 0 ? (Math.min(form.performance, form.availability) / form.availability) * 100 : 0}%, #1e293b 100%)`
                  }}
                />
                <div className="mt-1 text-[10px] text-slate-500">(Ideal Cycle Time × Total Count) ÷ Run Time • Max: {form.availability}%</div>
              </div>

              {/* Quality Slider */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-300">Quality Base</span>
                  <span className="font-mono text-lg font-bold text-violet-300">{form.quality}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={Math.min(form.performance, form.availability)}
                  value={Math.min(form.quality, form.performance, form.availability)}
                  onChange={(e) => upd("quality", Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${Math.min(form.performance, form.availability) > 0 ? (Math.min(form.quality, form.performance, form.availability) / Math.min(form.performance, form.availability)) * 100 : 0}%, #1e293b ${Math.min(form.performance, form.availability) > 0 ? (Math.min(form.quality, form.performance, form.availability) / Math.min(form.performance, form.availability)) * 100 : 0}%, #1e293b 100%)`
                  }}
                />
                <div className="mt-1 text-[10px] text-slate-500">Good Count ÷ Total Count • Max: {Math.min(form.performance, form.availability)}%</div>
              </div>
            </div>

            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">หมายเหตุ</div>
              <input value={form.notes} onChange={(e) => upd("notes", e.target.value)} className={inputClass} placeholder="กรอกหมายเหตุ…" />
            </div>

            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">⚡ คำนวณ OEE แบบ Real-Time (ISO 22400)</div>
              <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-sm">
                <span className="text-lg font-bold text-sky-300">{derived.oeeDisp}%</span>
                <span className="text-slate-600">=</span>
                <span className="text-emerald-300">{derived.avail}%</span>
                <span className="text-slate-600">×</span>
                <span className="text-amber-300">{derived.perf}%</span>
                <span className="text-slate-600">×</span>
                <span className="text-violet-300">{derived.qual}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                {[
                  ["Run Time", `${derived.runMins}m`, "text-emerald-300"],
                  ["Availability", `${derived.avail}%`, "text-emerald-300"],
                  ["Performance", `${derived.perf}%`, "text-amber-300"],
                  ["Quality", `${derived.qual}%`, "text-violet-300"],
                  ["Scrap", `${(form.totalCount || 0) - (form.goodCount || 0)}`, "text-red-300"],
                ].map(([l, v, c]) => (
                  <div key={l} className="rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/50 p-2">
                    <div className="text-[10px] text-slate-500">{l}</div>
                    <div className={`font-mono text-base font-bold ${c}`}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "downtime" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">เครื่องจักร</div>
                <select value={form.dtMachine} onChange={(e) => upd("dtMachine", e.target.value)} className={inputClass}>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">วันที่</div>
                <input type="date" value={form.date} onChange={(e) => upd("date", e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">เวลาเริ่มหยุด</div>
                <input type="time" value={form.dtStart} onChange={(e) => upd("dtStart", e.target.value)} className={inputClass} />
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">เวลาเดินเครื่องใหม่</div>
                <input type="time" value={form.dtEnd} onChange={(e) => upd("dtEnd", e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">สาเหตุการหยุด</div>
              <select value={form.dtReason} onChange={(e) => upd("dtReason", e.target.value)} className={inputClass}>
                <option value="mechanical">Mechanical Failure — ชำรุดทางกล</option>
                <option value="material">Material Shortage — วัตถุดิบขาด</option>
                <option value="changeover">Changeover — เปลี่ยนรุ่นผลิต</option>
                <option value="operator">Operator Absence — พนักงานขาด</option>
                <option value="quality">Quality Check — ตรวจสอบคุณภาพ</option>
                <option value="planned_pm">Planned PM — บำรุงรักษาตามแผน</option>
                <option value="breakdown">Breakdown — เสียกะทันหัน</option>
                <option value="utility">Utility Failure — ระบบสาธารณูปโภค</option>
              </select>
            </div>

            <div>
              <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">รายละเอียด</div>
              <input value={form.dtNotes} onChange={(e) => upd("dtNotes", e.target.value)} className={inputClass} placeholder="อธิบายสาเหตุเพิ่มเติม…" />
            </div>
          </div>
        )}

        {tab === "quality" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">เครื่องจักร</div>
                <select value={form.machine} onChange={(e) => upd("machine", e.target.value)} className={inputClass}>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">กะ</div>
                <select value={form.shift} onChange={(e) => upd("shift", Number(e.target.value))} className={inputClass}>
                  {shifts
                    .filter((s) => s.active)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">วันที่</div>
                <input type="date" value={form.date} onChange={(e) => upd("date", e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">ผลิตทั้งหมด</div>
                <input type="number" value={form.totalCount} onChange={(e) => upd("totalCount", Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">ของดี (Good)</div>
                <input type="number" value={form.goodCount} onChange={(e) => upd("goodCount", Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">ของเสีย (Scrap)</div>
                <input readOnly value={Math.max(0, (form.totalCount || 0) - (form.goodCount || 0))} className={inputClass + " text-red-300 bg-red-950/20"} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">ประเภทของเสียหลัก</div>
                <select value={form.dtReason} onChange={(e) => upd("dtReason", e.target.value)} className={inputClass}>
                  <option value="dimensional">Dimensional Error</option>
                  <option value="surface">Surface Defect</option>
                  <option value="assembly">Assembly Error</option>
                  <option value="material">Material Defect</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <div className="mb-1 text-[10px] uppercase tracking-wider text-slate-500">FPY (คำนวณอัตโนมัติ)</div>
                <input readOnly value={`${derived.qual}%`} className={inputClass + " text-violet-300 bg-violet-950/10"} />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-[var(--oee-border)] bg-[var(--oee-surface-2)]/30 px-3 py-2 text-sm text-slate-400 hover:text-slate-200"
          >
            ยกเลิก
          </button>
          <button
            onClick={save}
            className={
              "flex-[2] rounded-lg px-3 py-2 text-sm font-bold text-white transition " +
              (saved ? "bg-emerald-700" : "bg-gradient-to-br from-sky-500 to-indigo-500")
            }
          >
            {saved ? "✓ บันทึกแล้ว!" : "💾 บันทึกข้อมูล"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
