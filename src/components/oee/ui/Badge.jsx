"use client";

export default function Badge({ color = "#64748b", children }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold"
      style={{ background: `${color}20`, color, borderColor: `${color}40` }}
    >
      {children}
    </span>
  );
}
