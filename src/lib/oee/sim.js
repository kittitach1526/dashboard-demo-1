export function createMachineState(def) {
  const plannedMins = 480;
  const downtimeMins = Math.round(((100 - def.baseAvail) / 100) * plannedMins);
  const runMins = plannedMins - downtimeMins;
  const idealCT = 0.5;
  const totalCount = Math.round((runMins / idealCT) * (def.basePerf / 100));
  const goodCount = Math.round(totalCount * (def.baseQual / 100));
  return {
    ...def,
    status: def.baseAvail > 70 ? "running" : "breakdown",
    plannedMins,
    downtimeMins,
    runMins,
    totalCount,
    goodCount,
    scrapCount: totalCount - goodCount,
    idealCT,
    availability: def.baseAvail,
    performance: def.basePerf,
    quality: def.baseQual,
    oee: Math.round((def.baseAvail * def.basePerf * def.baseQual) / 10000),
    speed: def.baseAvail > 70 ? def.basePerf : 0,
    repairTicksLeft: 0,
    forcedStatus: null,
    oeeHist: [Math.round((def.baseAvail * def.basePerf * def.baseQual) / 10000)],
    availHist: [def.baseAvail],
    perfHist: [def.basePerf],
    qualHist: [def.baseQual],
    downReasons: { mechanical: 0, material: 0, changeover: 0, operator: 0, quality: 0 },
  };
}

export function tickMachine(m, dtSec) {
  let {
    status,
    forcedStatus,
    availability,
    performance,
    quality,
    plannedMins,
    idealCT,
    repairTicksLeft,
    baseAvail,
    basePerf,
    baseQual,
    failRate,
    repairMin,
    repairMax,
    speed,
  } = m;

  const dtMin = dtSec / 60;

  // ถ้า speed = 0 แสดงว่าเป็น MANUAL mode ให้ใช้ค่าคงที่
  if (speed === 0) {
    // MANUAL mode: ใช้ค่าจาก baseAvail, basePerf, baseQual โดยตรง
    const runMins = Math.round(plannedMins * (baseAvail / 100));
    const downMins = plannedMins - runMins;
    const total = Math.max(0, Math.round((runMins / idealCT) * (basePerf / 100)));
    const good = Math.round(total * (baseQual / 100));
    const oeeVal = Math.round(baseAvail * basePerf * baseQual) / 10000;
    const oeeR = Math.round(oeeVal * 10) / 10;

    return {
      ...m,
      status: forcedStatus || status,
      availability: baseAvail,
      performance: basePerf,
      quality: baseQual,
      oee: oeeR,
      runMins,
      downtimeMins: downMins,
      totalCount: total,
      goodCount: good,
      scrapCount: total - good,
      downReasons: {
        mechanical: Math.round(downMins * 0.38),
        material: Math.round(downMins * 0.26),
        changeover: Math.round(downMins * 0.2),
        operator: Math.round(downMins * 0.11),
        quality: Math.round(downMins * 0.05),
      },
    };
  }

  // AUTO mode: ทำงานแบบสุ่มตามเดิม
  if (forcedStatus) status = forcedStatus;
  else {
    if (status === "running") {
      if (Math.random() < failRate * dtMin) {
        status = "breakdown";
        repairTicksLeft = repairMin + Math.random() * (repairMax - repairMin);
      }
    } else if (status === "breakdown") {
      repairTicksLeft -= dtSec;
      if (repairTicksLeft <= 0) {
        status = "running";
        repairTicksLeft = 0;
      }
    } else if (status === "idle") {
      if (Math.random() < 0.12 * dtMin) status = "running";
    }
  }

  const noise = (r) => (Math.random() - 0.5) * r;

  let newAvail =
    status === "breakdown"
      ? Math.max(20, availability - Math.abs(noise(6)) - 2)
      : status === "idle"
        ? Math.max(baseAvail - 20, availability + noise(2))
        : Math.min(99, Math.max(baseAvail - 12, availability + noise(2.5) + (baseAvail - availability) * 0.05));

  let newPerf =
    status !== "running"
      ? Math.max(0, performance - Math.abs(noise(3)))
      : Math.min(99, Math.max(basePerf - 18, performance + noise(2) + (basePerf - performance) * 0.04));

  let newQual = Math.min(99.9, Math.max(baseQual - 8, quality + noise(1) + (baseQual - quality) * 0.03));

  newAvail = Math.round(newAvail * 10) / 10;
  newPerf = Math.round(newPerf * 10) / 10;
  newQual = Math.round(newQual * 10) / 10;

  const runMins = Math.round(plannedMins * (newAvail / 100));
  const downMins = plannedMins - runMins;
  const total = Math.max(0, Math.round((runMins / idealCT) * (newPerf / 100)));
  const good = Math.round(total * (newQual / 100));

  const oeeVal = Math.round(newAvail * newPerf * newQual) / 10000;
  const oeeR = Math.round(oeeVal * 10) / 10;

  const push = (arr, v) => [...arr.slice(-23), Math.round(v * 10) / 10];

  return {
    ...m,
    status,
    repairTicksLeft,
    forcedStatus,
    availability: newAvail,
    performance: newPerf,
    quality: newQual,
    oee: oeeR,
    speed: status === "running" ? Math.round(newPerf) : 0,
    runMins,
    downtimeMins: downMins,
    totalCount: total,
    goodCount: good,
    scrapCount: total - good,
    downReasons: {
      mechanical: Math.round(downMins * 0.38),
      material: Math.round(downMins * 0.26),
      changeover: Math.round(downMins * 0.2),
      operator: Math.round(downMins * 0.11),
      quality: Math.round(downMins * 0.05),
    },
    oeeHist: push(m.oeeHist, oeeR),
    availHist: push(m.availHist, newAvail),
    perfHist: push(m.perfHist, newPerf),
    qualHist: push(m.qualHist, newQual),
  };
}

export function calcKPI(machines) {
  const n = machines.length || 1;
  const avail = Math.round((machines.reduce((s, m) => s + m.availability, 0) / n) * 10) / 10;
  const perf = Math.round((machines.reduce((s, m) => s + m.performance, 0) / n) * 10) / 10;
  const qual = Math.round((machines.reduce((s, m) => s + m.quality, 0) / n) * 10) / 10;
  const oee = Math.round(avail * perf * qual) / 10000;

  const totalGood = machines.reduce((s, m) => s + m.goodCount, 0);
  const totalCount = machines.reduce((s, m) => s + m.totalCount, 0);
  const totalDown = machines.reduce((s, m) => s + m.downtimeMins, 0);
  const planned = machines.reduce((s, m) => s + m.plannedMins, 0);

  return {
    avail,
    perf,
    qual,
    oee: Math.round(oee * 10) / 10,
    totalGood,
    totalCount,
    totalDown,
    planned,
  };
}
