"use client";

export default function MiniBar({ pct, color }) {
  return (
    <div
      style={{
        background: "var(--oee-surface-2)",
        borderRadius: 3,
        height: 5,
        width: "100%",
        overflow: "hidden",
        border: "1px solid var(--oee-border)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(pct, 100)}%`,
          background: color,
          borderRadius: 3,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}
