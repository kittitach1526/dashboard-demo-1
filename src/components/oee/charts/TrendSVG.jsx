"use client";

export default function TrendSVG({ data, metrics, h = 105 }) {
  const w = 400;
  const pad = { t: 7, r: 7, b: 20, l: 26 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const mn = 55;
  const mx = 102;

  const xs = (i) => pad.l + (i / (data.length - 1)) * iw;
  const ys = (v) => pad.t + ih - ((v - mn) / (mx - mn)) * ih;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      {[60, 70, 80, 90, 100].map((v) => (
        <line
          key={v}
          x1={pad.l}
          x2={w - pad.r}
          y1={ys(v)}
          y2={ys(v)}
          stroke="var(--oee-border)"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
      ))}
      {[60, 80, 100].map((v) => (
        <text key={v} x={pad.l - 3} y={ys(v) + 3} textAnchor="end" fill="rgba(148,163,184,0.8)" fontSize="7">
          {v}
        </text>
      ))}
      {metrics.map((m) => {
        const pts = data.map((d, i) => `${xs(i)},${ys(d[m.key])}`).join(" ");
        return (
          <polyline
            key={m.key}
            points={pts}
            fill="none"
            stroke={m.color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}
      {data.map((d, i) => (
        <text key={i} x={xs(i)} y={h - 3} textAnchor="middle" fill="rgba(148,163,184,0.8)" fontSize="7">
          {d.label}
        </text>
      ))}
    </svg>
  );
}
