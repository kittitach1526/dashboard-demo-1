"use client";

export default function StatusDot({ status }) {
  const c = { running: "#22c55e", idle: "#f59e0b", breakdown: "#ef4444" }[status] || "#64748b";

  return (
    <span
      style={{
        display: "inline-block",
        width: 7,
        height: 7,
        borderRadius: "50%",
        background: c,
        boxShadow: status === "running" ? `0 0 5px ${c}` : "none",
        marginRight: 5,
      }}
    />
  );
}
