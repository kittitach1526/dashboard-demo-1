"use client";

export default function GaugeChart({ value, target = 85, color, size = 100 }) {
  const cx = size / 2;
  const cy = size / 2;
  const sw = Math.max(7, Math.round(size * 0.09));
  const r = Math.max(10, cx - sw - 2);
  const circ = 2 * Math.PI * r;
  const dash = (v) => (Math.min(v, 100) / 100) * circ * 0.75;
  const rot = -225;
  const col = color;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--oee-border)"
        strokeWidth={sw}
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
        strokeLinecap="round"
        transform={`rotate(${rot} ${cx} ${cy})`}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={col}
        strokeWidth={sw}
        strokeDasharray={`${dash(value)} ${circ - dash(value)}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.7s ease" }}
        transform={`rotate(${rot} ${cx} ${cy})`}
      />
      <line
        x1={cx}
        y1={cy - r + Math.max(10, Math.round(size * 0.14))}
        x2={cx}
        y2={cy - r + Math.max(4, Math.round(size * 0.06))}
        stroke="#f59e0b70"
        strokeWidth="2"
        strokeLinecap="round"
        transform={`rotate(${rot + (target / 100) * 270} ${cx} ${cy})`}
      />
      <text
        x={cx}
        y={cy + Math.round(size * 0.06)}
        textAnchor="middle"
        fill="white"
        fontSize={Math.max(12, Math.round(size * 0.17))}
        fontWeight="700"
        fontFamily="monospace"
      >
        {value}%
      </text>
      <text
        x={cx}
        y={cy + Math.round(size * 0.2)}
        textAnchor="middle"
        fill="rgba(148,163,184,0.7)"
        fontSize={Math.max(7, Math.round(size * 0.08))}
        fontFamily="sans-serif"
      >
        TGT {target}%
      </text>
    </svg>
  );
}
