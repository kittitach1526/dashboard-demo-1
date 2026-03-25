"use client";

export default function OutputBar({ data }) {
  const mx = Math.max(...data.map((d) => Math.max(d.output, d.target))) + 20;
  const w = 400;
  const h = 82;
  const bw = 26;
  const gap = 11;
  const pL = 22;
  const pB = 17;
  const pT = 5;
  const ih = h - pT - pB;
  const tot = data.length * (bw + gap);
  const sx = pL + (w - pL - tot) / 2;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`}>
      {data.map((d, i) => {
        const x = sx + i * (bw + gap);
        const bh = (d.output / mx) * ih;
        const th = (d.target / mx) * ih;
        const col = d.output >= d.target ? "#22c55e" : "#ef4444";

        return (
          <g key={i}>
            <rect x={x} y={h - pB - bh} width={bw} height={bh} rx="2" fill={col} opacity="0.85" />
            <line
              x1={x - 2}
              x2={x + bw + 2}
              y1={h - pB - th}
              y2={h - pB - th}
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
            <text x={x + bw / 2} y={h - 2} textAnchor="middle" fill="rgba(148,163,184,0.85)" fontSize="7">
              {d.hour}
            </text>
            <text x={x + bw / 2} y={h - pB - bh - 2} textAnchor="middle" fill={col} fontSize="7">
              {d.output}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
