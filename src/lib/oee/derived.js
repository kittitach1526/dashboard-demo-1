export function getActiveShift(shifts, time) {
  const nowMins = time.getHours() * 60 + time.getMinutes();
  return (
    shifts.find((s) => {
      if (!s.active) return false;
      const [sh, sm] = s.start.split(":").map(Number);
      const [eh, em] = s.end.split(":").map(Number);
      const st = sh * 60 + sm;
      const en = eh * 60 + em;
      if (en > st) return nowMins >= st && nowMins < en;
      return nowMins >= st || nowMins < en;
    }) || shifts.find((s) => s.active)
  );
}

export function getAggregatedDowntime(ms) {
  const tot = ms.reduce((s, m) => s + m.downtimeMins, 0) || 1;
  const rows = [
    { reason: "Mechanical Failure", mins: ms.reduce((s, m) => s + m.downReasons.mechanical, 0) },
    { reason: "Material Shortage", mins: ms.reduce((s, m) => s + m.downReasons.material, 0) },
    { reason: "Changeover", mins: ms.reduce((s, m) => s + m.downReasons.changeover, 0) },
    { reason: "Operator Absence", mins: ms.reduce((s, m) => s + m.downReasons.operator, 0) },
    { reason: "Quality Check", mins: ms.reduce((s, m) => s + m.downReasons.quality, 0) },
  ];
  return rows.map((d) => ({ ...d, pct: Math.round((d.mins / tot) * 100) }));
}

export function getDefects(ms) {
  const totalScrap = ms.reduce((s, m) => s + m.scrapCount, 0) || 1;
  return [
    { type: "Dimensional Error", count: Math.round(totalScrap * 0.42), pct: 42 },
    { type: "Surface Defect", count: Math.round(totalScrap * 0.27), pct: 27 },
    { type: "Assembly Error", count: Math.round(totalScrap * 0.17), pct: 17 },
    { type: "Material Defect", count: Math.round(totalScrap * 0.1), pct: 10 },
    { type: "Other", count: Math.round(totalScrap * 0.04), pct: 4 },
  ];
}
