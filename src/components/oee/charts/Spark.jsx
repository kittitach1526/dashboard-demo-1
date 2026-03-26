"use client";

export default function Spark({ data, color = "#22d3ee", h = 34, w = 100, target, responsive = false, className = "" }) {
  if (!data || data.length < 2) return null;

  const mn = Math.min(...data) - 1;
  const mx = Math.max(...data, target || 0) + 1;
  const px = (i) => (i / (data.length - 1)) * w;
  const py = (v) => h - ((v - mn) / (mx - mn)) * h;
  const pts = data.map((v, i) => `${px(i)},${py(v)}`).join(" ");
  const ty = target ? py(target) : null;

  return (
    <svg
      width={responsive ? "100%" : w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio={responsive ? "none" : "xMidYMid meet"}
      className={className}
    >
      {target && (
        <line x1="0" x2={w} y1={ty} y2={ty} stroke="#f59e0b35" strokeWidth="1" strokeDasharray="2 2" />
      )}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={px(data.length - 1)} cy={py(data[data.length - 1])} r="2.5" fill={color} />
    </svg>
  );
}
