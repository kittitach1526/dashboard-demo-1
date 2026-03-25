"use client";

export default function HeatMap({ data, days, shifts }) {
  const gc = (v) => (v >= 85 ? "#166534" : v >= 75 ? "#15803d" : v >= 65 ? "#ca8a04" : "#dc2626");
  const labelColor = "rgba(148,163,184,0.85)";

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `54px repeat(${days.length},1fr)`,
          gap: 2,
          marginBottom: 3,
        }}
      >
        <div />
        {days.map((d) => (
          <div key={d} style={{ textAlign: "center", fontSize: 9, color: labelColor }}>
            {d}
          </div>
        ))}
      </div>

      {shifts.map((s, si) => (
        <div
          key={s}
          style={{
            display: "grid",
            gridTemplateColumns: `54px repeat(${days.length},1fr)`,
            gap: 2,
            marginBottom: 2,
          }}
        >
          <div style={{ fontSize: 9, color: labelColor, display: "flex", alignItems: "center" }}>{s}</div>
          {days.map((d, di) => (
            <div
              key={d}
              style={{
                background: gc(data[si][di]),
                borderRadius: 2,
                padding: "3px 1px",
                textAlign: "center",
                fontSize: 8,
                color: "rgba(255,255,255,0.9)",
                fontFamily: "monospace",
              }}
            >
              {data[si][di]}
            </div>
          ))}
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 5 }}>
        {[
          ["≥85", "#166534"],
          ["75-84", "#15803d"],
          ["65-74", "#ca8a04"],
          ["<65", "#dc2626"],
        ].map(([l, c]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ width: 9, height: 9, borderRadius: 1, background: c }} />
            <span style={{ fontSize: 8, color: "rgba(148,163,184,0.75)" }}>{l}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
