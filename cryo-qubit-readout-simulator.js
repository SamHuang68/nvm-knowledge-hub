/**
 * cryo-qubit-readout-simulator.js — Cryogenic Qubit Readout Interface Spin Decoherence & Microwave RF Simulator
 *
 * First-Principles Semiconductor & Quantum Interface Physics:
 * 1. Magnetic Field Induced TMR Suppression & Magnetization Canting:
 *    TMR(B) = \frac{TMR_0}{1 + \left(\frac{B}{B_{crit}}\right)^2}
 *    For Metallic AntiFuse Filament: \Delta R(B) / R_0 \approx \mu_{Hall}^2 \cdot B^2 \approx 0 (< 0.05% @ 5T)
 * 2. Spin Decoherence Time (T2*) & Transverse Relaxation under Stray B-Field Gradient:
 *    \frac{1}{T_2^*} = \frac{1}{2 T_1} + \frac{1}{T_\phi(B)}
 *    T_\phi(B) \approx \frac{\hbar}{\gamma \cdot \sqrt{\sigma_B^2 + (\Delta B_{stray})^2}}
 * 3. Cryogenic Sense Margin Window (\Delta V_sense) in Qubit Controller:
 *    \Delta V_{sense}(B) = I_{read} \cdot (R_P - R_{AP}) \cdot \frac{TMR(B)}{1 + TMR(B)}
 *    AntiFuse: \Delta V_{sense} = V_{bias} \cdot \left(\frac{R_{unprog}}{R_{unprog} + R_L} - \frac{R_{prog}}{R_{prog} + R_L}\right) \approx V_{bias}
 * 4. Microwave RF (4-8 GHz) Cross-Coupling & Induced Bit Error Rate (BER):
 *    V_{rf} = \sqrt{2 \cdot Z_0 \cdot 10^{(P_{rf} - 30)/10}} \cdot 10^{-Iso_{dB}/20}
 *    \text{BER} = \frac{1}{2} \text{erfc}\left(\frac{\Delta V_{sense} - V_{rf}}{\sqrt{2} \cdot \sigma_{Johnson}}\right)
 *    \sigma_{Johnson} = \sqrt{4 k_B T R_{eff} \Delta f}
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: IEEE Quantum Engineering, IEEE TED Cryogenic Physics, Superconducting Qubit Readout Specs
 */

/**
 * Quantum control stage presets and RF/Magnetic field environments.
 */
export const QUBIT_CONTROL_PRESETS = Object.freeze({
  superconducting_transmon_4k: {
    id: "superconducting_transmon_4k",
    nameZh: "超導量子位元 Transmon 4.2K 控制級 (0.1T 弱磁場 / 5GHz 脈衝)",
    nameEn: "Superconducting Transmon 4.2K Stage (0.1T Stray / 5GHz Pulse)",
    temperatureK: 4.2,
    magneticFieldTesla: 0.1,
    rfFrequencyGhz: 5.0,
    rfPowerDbm: -30.0,
    rfIsolationDb: 45.0,
    qubitType: "Superconducting Transmon (Xmon / Fluxonium)",
  },
  silicon_spin_qubit_1k: {
    id: "silicon_spin_qubit_1k",
    nameZh: "矽量子點自旋位元 1.2K (1.5T 塞曼分裂強磁場 / 14GHz ESR)",
    nameEn: "Silicon Spin Qubit 1.2K (1.5T Zeeman Field / 14GHz ESR)",
    temperatureK: 1.2,
    magneticFieldTesla: 1.5,
    rfFrequencyGhz: 14.0,
    rfPowerDbm: -20.0,
    rfIsolationDb: 35.0,
    qubitType: "Silicon MOS / SiGe Quantum Dot Spin Qubit",
  },
  nv_center_diamond_77k: {
    id: "nv_center_diamond_77k",
    nameZh: "金剛石 NV 色心量子感測 77K (0.5T 偏置磁場 / 2.87GHz 微波)",
    nameEn: "Diamond NV Center 77K (0.5T Bias / 2.87GHz MW Drive)",
    temperatureK: 77.0,
    magneticFieldTesla: 0.5,
    rfFrequencyGhz: 2.87,
    rfPowerDbm: -10.0,
    rfIsolationDb: 30.0,
    qubitType: "Nitrogen-Vacancy (NV) Center in Diamond",
  },
  trapped_ion_magnetic_4k: {
    id: "trapped_ion_magnetic_4k",
    nameZh: "離子阱超導螺線管 4.2K (3.5T 極強磁場 / 1GHz 射頻阱)",
    nameEn: "Trapped Ion Cryo Solenoid 4.2K (3.5T Strong B-Field / 1GHz Trap)",
    temperatureK: 4.2,
    magneticFieldTesla: 3.5,
    rfFrequencyGhz: 1.0,
    rfPowerDbm: -15.0,
    rfIsolationDb: 40.0,
    qubitType: "Cryogenic Trapped Ion Quantum Processor",
  },
});

/**
 * Low-temperature memory cell technology profiles.
 */
export const CRYO_MEMORY_TOPOLOGIES = Object.freeze({
  antifuse_cryo_filament: {
    id: "antifuse_cryo_filament",
    nameZh: "AntiFuse 硬崩潰歐姆微絲 (零磁阻 / 無自旋退相干)",
    nameEn: "AntiFuse Ohmic Filament (Zero MR / Decoherence-Free)",
    storageMechanism: "Metallic Silicon Reconstructed Filament",
    isMagnetic: false,
    nominalTmrPct: 0,
    bFieldCritTesla: 99.0, // Practically infinite immunity
    baseResistanceOhm: 650,
    offResistanceOhm: 1e11,
    spinDecoherenceT2Us: 999999, // Permanent atomic state, infinite T2*
    thermalNoiseResistanceOhm: 650,
    rfPickUpCrossTalkCoeff: 0.005, // Minimal loop area, pure resistive
  },
  perpendicular_stt_mram: {
    id: "perpendicular_stt_mram",
    nameZh: "垂直各向異性 p-STT-MRAM (高保磁力 / 臨界磁場 1.2T)",
    nameEn: "Perpendicular p-STT-MRAM (High Coercivity / Bcrit 1.2T)",
    storageMechanism: "CoFeB-MgO-CoFeB Magnetic Tunnel Junction",
    isMagnetic: true,
    nominalTmrPct: 220,
    bFieldCritTesla: 1.2, // Magnetization cants above 1.2T
    baseResistanceOhm: 3200,
    offResistanceOhm: 10240, // 3200 * (1 + 2.2)
    spinDecoherenceT2Us: 45.0, // Transverse relaxation of macrospin
    thermalNoiseResistanceOhm: 4500,
    rfPickUpCrossTalkCoeff: 0.085, // Ferromagnetic resonance (FMR) coupling
  },
  inplane_stt_mram: {
    id: "inplane_stt_mram",
    nameZh: "面內 In-Plane STT-MRAM (低保磁力 / 臨界磁場 0.35T)",
    nameEn: "In-Plane STT-MRAM (Low Coercivity / Bcrit 0.35T)",
    storageMechanism: "In-Plane Magnetic Tunnel Junction",
    isMagnetic: true,
    nominalTmrPct: 160,
    bFieldCritTesla: 0.35, // Magnetization flips or collapses quickly
    baseResistanceOhm: 2800,
    offResistanceOhm: 7280,
    spinDecoherenceT2Us: 8.5,
    thermalNoiseResistanceOhm: 3800,
    rfPickUpCrossTalkCoeff: 0.140, // Sensitive to planar microwave fields
  },
  cryo_cmos_8t_sram: {
    id: "cryo_cmos_8t_sram",
    nameZh: "低溫 Cryo-CMOS 8T SRAM (非磁性 / 易受射頻門極噪聲擾動)",
    nameEn: "Cryo-CMOS 8T SRAM (Non-Magnetic / RF Gate Noise Sensitive)",
    storageMechanism: "Volatile Cross-Coupled Inverter Latch",
    isMagnetic: false,
    nominalTmrPct: 0,
    bFieldCritTesla: 25.0, // High magnetic tolerance, weak Hall effect
    baseResistanceOhm: 1200,
    offResistanceOhm: 1e8,
    spinDecoherenceT2Us: 999999, // Not a spin state, but volatile
    thermalNoiseResistanceOhm: 1200,
    rfPickUpCrossTalkCoeff: 0.045, // High-impedance gate pickup
  },
});

/**
 * Calculates physical metrics for cryogenic qubit readout interface.
 *
 * @param {Object} params
 * @param {string} params.presetKey
 * @param {string} params.techKey
 * @param {number} [params.customBFieldTesla]
 * @param {number} [params.customRfPowerDbm]
 * @returns {Object} Calculated metrics
 */
export function calculateCryoQubitReadout({
  presetKey = "superconducting_transmon_4k",
  techKey = "antifuse_cryo_filament",
  customBFieldTesla,
  customRfPowerDbm,
} = {}) {
  const preset = QUBIT_CONTROL_PRESETS[presetKey] || QUBIT_CONTROL_PRESETS.superconducting_transmon_4k;
  const tech = CRYO_MEMORY_TOPOLOGIES[techKey] || CRYO_MEMORY_TOPOLOGIES.antifuse_cryo_filament;

  const tempK = preset.temperatureK;
  const bField = customBFieldTesla !== undefined ? customBFieldTesla : preset.magneticFieldTesla;
  const rfPower = customRfPowerDbm !== undefined ? customRfPowerDbm : preset.rfPowerDbm;
  const rfFreqGhz = preset.rfFrequencyGhz;
  const isolationDb = preset.rfIsolationDb;

  // 1. TMR Suppression under external B-Field
  let realizedTmrPct = 0;
  if (tech.isMagnetic) {
    const suppressionFactor = 1.0 / (1.0 + Math.pow(bField / tech.bFieldCritTesla, 2));
    realizedTmrPct = tech.nominalTmrPct * suppressionFactor;
  } else {
    realizedTmrPct = 0;
  }

  // 2. Read Sense Margin Voltage (\Delta V_sense)
  // Standard read bias current: 15 \mu A for MTJ, or 100 mV bias across resistive divider
  let deltaVSenseMv = 0;
  if (tech.isMagnetic) {
    const iReadUa = 15.0; // 15 uA read current to avoid write disturbance
    const rP = tech.baseResistanceOhm;
    const rAp = rP * (1.0 + realizedTmrPct / 100.0);
    const deltaROhm = rAp - rP;
    deltaVSenseMv = (iReadUa * 1e-6 * deltaROhm) * 1e3; // mV
  } else if (tech.id === "antifuse_cryo_filament") {
    // AntiFuse: Differential pair or single-ended against 50k reference
    // With 150 mV sense bias, unprogrammed is >100G, programmed is 650 ohm
    // Sense delta voltage is virtually the entire bias rail
    const vBiasMv = 150.0;
    const rRef = 25000.0; // 25 kOhm reference
    const vProg = (tech.baseResistanceOhm / (tech.baseResistanceOhm + rRef)) * vBiasMv;
    const vUnprog = (tech.offResistanceOhm / (tech.offResistanceOhm + rRef)) * vBiasMv;
    deltaVSenseMv = Math.abs(vUnprog - vProg);
  } else {
    // Cryo-CMOS SRAM
    const vDdmv = 600.0; // Low-voltage cryo SRAM
    // Weak Hall mobility degradation: mu(B) = mu0 / (1 + 0.04 * B^2)
    const hallFactor = 1.0 / (1.0 + 0.03 * Math.pow(bField, 2));
    deltaVSenseMv = 280.0 * hallFactor;
  }

  // 3. Spin Decoherence Time (T2*) & Qubit Interface Compatibility
  let effectiveT2Us = 0;
  if (tech.isMagnetic) {
    // Magnetic noise and external field gradient dephases macrospin
    const bPerturbation = 1.0 + Math.pow(bField / 0.8, 1.5);
    effectiveT2Us = tech.spinDecoherenceT2Us / bPerturbation;
  } else {
    effectiveT2Us = 999999; // Non-magnetic / permanent filament
  }

  // 4. Microwave RF Induced Interference Voltage (V_rf)
  // Power transmitted into read trace via coupling:
  // P_coupled_dBm = P_rf - Isolation_dB
  const pCoupledDbm = rfPower - isolationDb;
  const pCoupledWatts = Math.pow(10, (pCoupledDbm - 30) / 10);
  const z0Ohm = 50.0;
  const vRfRawVolts = Math.sqrt(2 * z0Ohm * pCoupledWatts);
  const vRfMv = (vRfRawVolts * 1e3) * (tech.rfPickUpCrossTalkCoeff / 0.05);

  // 5. Thermal Johnson Noise at Cryogenic Temperature
  // sigma_v = sqrt(4 * kB * T * R * BW)
  const kB = 1.380649e-23;
  const bwHz = 500e6; // 500 MHz sense amp bandwidth
  const noiseVolts = Math.sqrt(4 * kB * tempK * tech.thermalNoiseResistanceOhm * bwHz);
  const sigmaNoiseMv = noiseVolts * 1e3;

  // 6. Signal-to-Interference-Plus-Noise Ratio (SINR) & BER
  const effectiveMarginMv = Math.max(0, deltaVSenseMv - vRfMv);
  const sinrLinear = (effectiveMarginMv / Math.max(sigmaNoiseMv, 0.001));
  const sinrDb = 20 * Math.log10(Math.max(sinrLinear, 0.01));

  // Bit Error Rate: 0.5 * erfc(effectiveMargin / (sqrt(2) * sigma))
  let ber = 0;
  if (sinrLinear > 8.0) {
    ber = 1e-15;
  } else if (sinrLinear <= 0.1) {
    ber = 0.5;
  } else {
    // Analytical approximation of erfc(x)
    const x = sinrLinear / Math.SQRT2;
    const t = 1.0 / (1.0 + 0.3275911 * x);
    const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
    const erfcVal = poly * Math.exp(-x * x);
    ber = Math.max(1e-15, Math.min(0.5, 0.5 * erfcVal));
  }

  // QPU Proximity Rating
  let qpuRatingZh = "";
  let qpuRatingEn = "";
  let isQpuCompatible = false;

  if (tech.id === "antifuse_cryo_filament") {
    qpuRatingZh = "未校準教學分類 A（模型設定：無磁阻項）";
    qpuRatingEn = "Uncalibrated teaching class A (model: no MR term)";
    isQpuCompatible = true;
  } else if (tech.id === "perpendicular_stt_mram") {
    const compatibleFieldLimit = 0.6;
    if (bField < compatibleFieldLimit) {
      qpuRatingZh = `未校準教學分類 B（模型門檻：磁場 <${compatibleFieldLimit}T）`;
      qpuRatingEn = `Uncalibrated teaching class B (model threshold: field <${compatibleFieldLimit}T)`;
      isQpuCompatible = true;
    } else {
      qpuRatingZh = `未校準教學分類 D（模型門檻：磁場 ≥${compatibleFieldLimit}T）`;
      qpuRatingEn = `Uncalibrated teaching class D (model threshold: field ≥${compatibleFieldLimit}T)`;
      isQpuCompatible = false;
    }
  } else if (tech.id === "inplane_stt_mram") {
    qpuRatingZh = "未校準教學分類 F（模型設定：較低磁場臨界值）";
    qpuRatingEn = "Uncalibrated teaching class F (model: lower critical field)";
    isQpuCompatible = false;
  } else {
    // 8T SRAM
    qpuRatingZh = "未校準教學分類 B-（模型設定：揮發性記憶體）";
    qpuRatingEn = "Uncalibrated teaching class B- (model: volatile memory)";
    isQpuCompatible = true;
  }

  return {
    presetKey,
    techKey,
    tempK,
    bFieldTesla: Number(bField.toFixed(2)),
    rfPowerDbm: Number(rfPower.toFixed(1)),
    rfFreqGhz,
    isolationDb,
    realizedTmrPct: Number(realizedTmrPct.toFixed(1)),
    deltaVSenseMv: Number(deltaVSenseMv.toFixed(1)),
    vRfMv: Number(vRfMv.toFixed(2)),
    sigmaNoiseMv: Number(sigmaNoiseMv.toFixed(3)),
    sinrDb: Number(sinrDb.toFixed(1)),
    effectiveT2Us: effectiveT2Us > 9999 ? ">1000" : Number(effectiveT2Us.toFixed(1)),
    berFormatted: ber <= 1e-14 ? "< 10⁻¹⁴" : ber.toExponential(2),
    qpuRatingZh,
    qpuRatingEn,
    isQpuCompatible,
    presetNameZh: preset.nameZh,
    presetNameEn: preset.nameEn,
    techNameZh: tech.nameZh,
    techNameEn: tech.nameEn,
  };
}

/**
 * Draws the Cryogenic Qubit simulation canvas (High-DPI responsive).
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {"bfield_sweep"|"rf_waveform"} mode
 */
export function drawCryoQubitCanvas(canvas, metrics, mode = "bfield_sweep") {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || 420));
  const isZh = (window.HubLanguage?.get() || document.documentElement.lang || "zh").startsWith("zh");
  const wrapText = (text, maxWidth, font) => {
    ctx.font = font;
    const lines = [];
    let line = "";
    for (const character of Array.from(text)) {
      if (line && ctx.measureText(line + character).width > maxWidth) { lines.push(line); line = ""; }
      line += character;
    }
    if (line) lines.push(line);
    return lines;
  };
  const references = [
    {key:"inplane_stt_mram",color:"#ef4444",label:isZh ? "平面 MRAM" : "In-Plane MRAM"},
    {key:"perpendicular_stt_mram",color:"#f59e0b",label:isZh ? "垂直 STT-MRAM" : "p-STT-MRAM"},
    {key:"cryo_cmos_8t_sram",color:"#a855f7",label:"8T SRAM"},
    {key:"antifuse_cryo_filament",color:"#00f0ff",label:isZh ? "AntiFuse 微絲" : "AntiFuse Filament"},
  ];
  const axisLabels = mode === "bfield_sweep"
    ? ["0 T", "2.5 T", "5.0 T (Ext. Field)"]
    : ["0 ns", "10 ns (RF Burst)", "20 ns"];
  const axisLines = axisLabels.map(text => wrapText(text,Math.max(20,(width - 80) / 3 - 4),"10px 'IBM Plex Mono', monospace"));
  const axisHeight = Math.max(...axisLines.map(lines => lines.length)) * 12 + 12;
  const legendItems = mode === "bfield_sweep" ? references : [
    {color:"#00f0ff",label:`Sense Level: +${metrics.deltaVSenseMv} mV`},
    {color:"#f59e0b",label:`RF Cross-Coupled Noise: ±${metrics.vRfMv} mV (freq=${metrics.rfFreqGhz}GHz)`},
  ];
  const legendRows = legendItems.map(item => ({...item,lines:wrapText(item.label,width - 44,"10px 'IBM Plex Mono', monospace")}));
  const legendHeight = legendRows.reduce((sum,item) => sum + item.lines.length * 12 + 6,0);
  const plotY0 = 24;
  const plotY1 = 150;
  const legendTop = plotY1 + axisHeight + 8;
  const height = legendTop + legendHeight + 10;
  // 圖面沿用原高度；圖例與完整字形以新增字列承接。
  canvas.parentElement.style.height = `${height}px`;

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  const w = width;
  const h = height;

  // Background
  ctx.fillStyle = "#08131e";
  ctx.fillRect(0, 0, w, h);

  // Subtle grid
  ctx.strokeStyle = "rgba(30, 41, 59, 0.8)";
  ctx.lineWidth = 1;
  const gridX = 40;
  const gridY = 30;
  for (let x = gridX; x < w; x += gridX) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = gridY; y < h; y += gridY) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const plotX0 = 55;
  const plotX1 = w - 25;
  const plotW = plotX1 - plotX0;
  const plotH = plotY1 - plotY0;
  const drawLabel = (text, x, y, maxWidth = width - 24) => {
    const lines = wrapText(text, Math.max(1,maxWidth),ctx.font);
    const lineWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
    const left = Math.max(12,Math.min(x,width - 12 - lineWidth));
    const top = Math.max(12,Math.min(y,height - 12 - (lines.length - 1) * 12));
    lines.forEach((line,index) => ctx.fillText(line,left,top + index * 12));
  };
  const drawAxisLabels = () => {
    ctx.font = "10px 'IBM Plex Mono', monospace";
    const anchors = [plotX0,(plotX0 + plotX1) / 2,plotX1];
    axisLines.forEach((lines,column) => lines.forEach((line,index) => {
      const lineWidth = ctx.measureText(line).width;
      ctx.fillText(line,Math.max(12,Math.min(anchors[column] - lineWidth / 2,width - 12 - lineWidth)),plotY1 + 16 + index * 12);
    }));
  };

  if (mode === "bfield_sweep") {
    // Mode A: Magnetic Field Sweep (0 to 5 Tesla) vs Sense Margin Window (mV)
    // Draw Axes
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotX0, plotY0);
    ctx.lineTo(plotX0, plotY1);
    ctx.lineTo(plotX1, plotY1);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText("ΔV (mV)", 10, plotY0 + 6);
    drawAxisLabels();

    // 圖軸依同一計算器的四條參考曲線決定，保留超過舊 200 mV 上限的數值。
    const referenceMax = Math.max(...references.map(reference => calculateCryoQubitReadout({presetKey:metrics.presetKey,techKey:reference.key,customBFieldTesla:0,customRfPowerDbm:metrics.rfPowerDbm}).deltaVSenseMv));
    const maxMv = Math.max(200,Math.ceil(Math.max(referenceMax,metrics.deltaVSenseMv) / 50) * 50);
    ctx.fillText(`${maxMv}`, plotX0 - 28, plotY0 + 4);
    ctx.fillText(`${maxMv / 2}`, plotX0 - 28, plotY0 + plotH * 0.5 + 4);
    ctx.fillText("0", plotX0 - 16, plotY1 + 4);

    // Plot Curves for AntiFuse, p-STT-MRAM, and In-plane MRAM
    const drawSweepCurve = (techKey, strokeColor, label, isCurrent) => {
      ctx.beginPath();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isCurrent ? 3 : 1.5;
      if (!isCurrent) ctx.setLineDash([4, 3]);
      else ctx.setLineDash([]);

      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const b = (i / steps) * 5.0; // 0 to 5T
        const sim = calculateCryoQubitReadout({
          presetKey: metrics.presetKey,
          techKey,
          customBFieldTesla: b,
          customRfPowerDbm: metrics.rfPowerDbm,
        });
        const clampedMv = Math.min(maxMv, sim.deltaVSenseMv);
        const px = plotX0 + (b / 5.0) * plotW;
        const py = plotY1 - (clampedMv / maxMv) * plotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // Draw reference technologies
    references.forEach(reference => drawSweepCurve(reference.key,reference.color,reference.label,metrics.techKey === reference.key));

    // Current Operating Point Marker
    const currB = Math.min(5.0, metrics.bFieldTesla);
    const currMv = Math.min(maxMv, metrics.deltaVSenseMv);
    const markerX = plotX0 + (currB / 5.0) * plotW;
    const markerY = plotY1 - (currMv / maxMv) * plotH;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Callout badge
    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 10px 'IBM Plex Mono', monospace";
    drawLabel(`Op: ${currB}T | ΔV: ${metrics.deltaVSenseMv}mV`,markerX + 8,Math.max(markerY - 8,plotY0 + 12));

  } else {
    // Mode B: Microwave RF Pulse & Dynamic Sense Scope (Time-Domain Waveform)
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotX0, plotY0);
    ctx.lineTo(plotX0, plotY1);
    ctx.lineTo(plotX1, plotY1);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    drawLabel("Scope (mV)",6,plotY0 + 6,42);
    drawAxisLabels();

    const centerY = plotY0 + plotH * 0.5;

    // Draw RF Pulse Envelope (4-8 GHz modulation)
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const steps = 120;
    const vRfAmp = Math.min(plotH * 0.35, (metrics.vRfMv / 15.0) * (plotH * 0.35));
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 20.0; // 0 to 20 ns
      const px = plotX0 + (i / steps) * plotW;
      // Pulse envelope centered between 4ns and 16ns
      const envelope = Math.exp(-Math.pow((t - 10) / 4.0, 2));
      const oscillation = Math.sin(t * (metrics.rfFreqGhz * 1.5));
      const py = centerY + envelope * oscillation * vRfAmp;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw Differential Sense Window Rail (Top rail)
    const senseY = centerY - Math.min(plotH * 0.45, (metrics.deltaVSenseMv / 180.0) * (plotH * 0.45));
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(plotX0, senseY);
    ctx.lineTo(plotX1, senseY);
    ctx.stroke();

    // Noise band around sense line
    ctx.fillStyle = "rgba(0, 240, 255, 0.15)";
    const nH = Math.max(2, (metrics.sigmaNoiseMv / 5.0) * 12);
    ctx.fillRect(plotX0, senseY - nH, plotW, nH * 2);

    // Baseline reference (Bottom rail)
    ctx.strokeStyle = "#94a3b8";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(plotX0, centerY);
    ctx.lineTo(plotX1, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

  }

  let legendY = legendTop;
  ctx.font = "10px 'IBM Plex Mono', monospace";
  legendRows.forEach(item => {
    ctx.fillStyle = item.color;
    ctx.fillRect(12,legendY - 6,12,3);
    item.lines.forEach((line,index) => ctx.fillText(line,32,legendY + index * 12));
    legendY += item.lines.length * 12 + 6;
  });

  ctx.restore();
}

/**
 * Initializes the Cryogenic Qubit Readout Simulator UI.
 *
 * @param {HTMLElement} [container]
 */
export function initCryoQubitSimulator(container) {
  const root = container || document.getElementById("cryo-qubit-simulator-root");
  if (!root) return;

  const presetSelect = root.querySelector("#cryo-qubit-preset-select");
  const techSelect = root.querySelector("#cryo-qubit-tech-select");
  const bSlider = root.querySelector("#cryo-qubit-bfield-slider");
  const bVal = root.querySelector("#cryo-qubit-bfield-val");
  const rfSlider = root.querySelector("#cryo-qubit-rf-slider");
  const rfVal = root.querySelector("#cryo-qubit-rf-val");

  const outTmr = root.querySelector("#cryo-qubit-out-tmr");
  const outDeltaV = root.querySelector("#cryo-qubit-out-deltav");
  const outT2 = root.querySelector("#cryo-qubit-out-t2");
  const outSinr = root.querySelector("#cryo-qubit-out-sinr");
  const outBer = root.querySelector("#cryo-qubit-out-ber");
  const outRating = root.querySelector("#cryo-qubit-out-rating");
  const outVerdict = root.querySelector("#cryo-qubit-out-verdict");

  const canvas = root.querySelector("#cryo-qubit-canvas");
  const btnBField = root.querySelector("#cryo-qubit-mode-bfield");
  const btnWaveform = root.querySelector("#cryo-qubit-mode-waveform");

  let currentMode = "bfield_sweep";

  // Populate Preset Options if empty
  if (presetSelect && presetSelect.options.length === 0) {
    Object.values(QUBIT_CONTROL_PRESETS).forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.nameEn}`;
      presetSelect.appendChild(opt);
    });
    presetSelect.value = "superconducting_transmon_4k";
  }

  // Populate Tech Options if empty
  if (techSelect && techSelect.options.length === 0) {
    Object.values(CRYO_MEMORY_TOPOLOGIES).forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.nameEn}`;
      techSelect.appendChild(opt);
    });
    techSelect.value = "antifuse_cryo_filament";
  }

  function syncPresetToSliders() {
    const pKey = presetSelect ? presetSelect.value : "superconducting_transmon_4k";
    const p = QUBIT_CONTROL_PRESETS[pKey] || QUBIT_CONTROL_PRESETS.superconducting_transmon_4k;
    if (bSlider) {
      bSlider.value = String(p.magneticFieldTesla);
    }
    if (rfSlider) {
      rfSlider.value = String(p.rfPowerDbm);
    }
  }

  function update() {
    const presetKey = presetSelect ? presetSelect.value : "superconducting_transmon_4k";
    const techKey = techSelect ? techSelect.value : "antifuse_cryo_filament";
    const bField = bSlider ? Number(bSlider.value) : 0.1;
    const rfPower = rfSlider ? Number(rfSlider.value) : -30.0;

    if (bVal) bVal.textContent = `${bField.toFixed(2)} Tesla`;
    if (bSlider) bSlider.setAttribute("aria-valuetext",`${bField.toFixed(2)} Tesla`);
    if (rfVal) rfVal.textContent = `${rfPower.toFixed(1)} dBm`;
    if (rfSlider) rfSlider.setAttribute("aria-valuetext",`${rfPower.toFixed(1)} dBm`);

    const m = calculateCryoQubitReadout({
      presetKey,
      techKey,
      customBFieldTesla: bField,
      customRfPowerDbm: rfPower,
    });

    if (outTmr) {
      outTmr.textContent = m.realizedTmrPct > 0 ? `${m.realizedTmrPct}%` : "N/A (Non-MTJ)";
    }
    if (outDeltaV) outDeltaV.textContent = `${m.deltaVSenseMv} mV`;
    const isZh = (window.HubLanguage?.get() || document.documentElement.lang || "zh").startsWith("zh");
    if (outT2) outT2.textContent = m.effectiveT2Us === ">1000" ? (isZh ? ">1,000 µs（模型上限）" : ">1,000 µs (Model limit)") : `${m.effectiveT2Us} µs`;
    if (outSinr) outSinr.textContent = `${m.sinrDb} dB`;
    if (outBer) {
      outBer.textContent = m.berFormatted;
      outBer.style.color = m.isQpuCompatible ? "#059669" : "#dc2626";
    }
    if (outRating) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outRating.textContent = isZh ? m.qpuRatingZh : m.qpuRatingEn;
      outRating.style.color = m.isQpuCompatible ? "#059669" : "#dc2626";
    }

    if (canvas) {
      drawCryoQubitCanvas(canvas, m, currentMode);
    }

    if (outVerdict) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outVerdict.innerHTML = isZh
        ? `<strong>未校準量子介面教學試算：</strong> 在 <code>${m.tempK} K</code> 與 <code>${m.bFieldTesla} T</code> 下，記憶體單元 <code>${m.techNameZh}</code> 的模型感測差分電壓為 <strong>${m.deltaVSenseMv} mV</strong>。微波射頻（${m.rfFreqGhz} GHz / ${m.rfPowerDbm} dBm）耦合噪聲為 ±${m.vRfMv} mV，讀取信噪比為 <strong>${m.sinrDb} dB</strong>，高斯近似誤碼率 (BER) 為 <strong>${m.berFormatted}</strong>。<strong style="color:${m.isQpuCompatible ? '#059669' : '#dc2626'};">${m.qpuRatingZh}</strong>。模型以磁阻、自旋去相干與射頻耦合假設區分支路；AntiFuse 支路設定無磁阻項與較低耦合係數，產品介面適用性仍需磁屏蔽、封裝與實測驗證。`
        : `<strong>Uncalibrated Cryo-Quantum Teaching Calculation:</strong> At <code>${m.tempK} K</code> and <code>${m.bFieldTesla} T</code>, the <code>${m.techNameEn}</code> model gives a differential sensing window of <strong>${m.deltaVSenseMv} mV</strong>. RF coupling (${m.rfFreqGhz} GHz / ${m.rfPowerDbm} dBm) gives ±${m.vRfMv} mV noise, read SINR of <strong>${m.sinrDb} dB</strong>, and Gaussian-approximation BER of <strong>${m.berFormatted}</strong>. <strong style="color:${m.isQpuCompatible ? '#059669' : '#dc2626'};">${m.qpuRatingEn}</strong>. Branches use magnetoresistance, spin-decoherence, and RF-coupling assumptions; the AntiFuse branch assumes no MR term and a lower coupling coefficient. Product-interface applicability requires magnetic-shielding, packaging, and measured validation.`;
    }
  }

  if (presetSelect) {
    presetSelect.addEventListener("change", () => {
      syncPresetToSliders();
      update();
    });
  }

  if (techSelect) techSelect.addEventListener("change", update);
  if (bSlider) bSlider.addEventListener("input", update);
  if (rfSlider) rfSlider.addEventListener("input", update);

  if (btnBField) {
    btnBField.addEventListener("click", () => {
      currentMode = "bfield_sweep";
      btnBField.classList.add("active");
      btnBField.setAttribute("aria-pressed", "true");
      btnBField.style.background = "#0284c7";
      btnBField.style.color = "#ffffff";
      btnBField.style.borderColor = "#38bdf8";
      if (btnWaveform) {
        btnWaveform.classList.remove("active");
        btnWaveform.setAttribute("aria-pressed", "false");
        btnWaveform.style.background = "#1e293b";
        btnWaveform.style.color = "#94a3b8";
        btnWaveform.style.borderColor = "#475569";
      }
      update();
    });
  }

  if (btnWaveform) {
    btnWaveform.addEventListener("click", () => {
      currentMode = "rf_waveform";
      btnWaveform.classList.add("active");
      btnWaveform.setAttribute("aria-pressed", "true");
      btnWaveform.style.background = "#0284c7";
      btnWaveform.style.color = "#ffffff";
      btnWaveform.style.borderColor = "#38bdf8";
      if (btnBField) {
        btnBField.classList.remove("active");
        btnBField.setAttribute("aria-pressed", "false");
        btnBField.style.background = "#1e293b";
        btnBField.style.color = "#94a3b8";
        btnBField.style.borderColor = "#475569";
      }
      update();
    });
  }

  window.addEventListener("resize", () => {
    if (canvas) update();
  });
  window.addEventListener("hub:language-change",update);

  syncPresetToSliders();
  update();
}

// Auto-initialize on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initCryoQubitSimulator());
  } else {
    initCryoQubitSimulator();
  }
}
