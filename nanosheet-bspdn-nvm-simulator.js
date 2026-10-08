import { syncMetricCopy } from './模型數值複製.js';

/**
 * nanosheet-bspdn-nvm-simulator.js — 2nm/A16 GAA Nanosheet & Backside Power Delivery (BSPDN) eNVM Simulator
 *
 * First-Principles Semiconductor Physics & Advanced Packaging Models:
 * 1. Backside Power Delivery Network (BSPDN / PowerVia) & Nano-TSV Model:
 *    R_{bspdn} = R_{backside\_metal} + R_{nano\_tsv} + R_{frontside\_via}
 *    IR-Drop reduction: \Delta V_{IR} \approx I_{transient} \cdot R_{bspdn} (30% - 45% lower than FSPDN).
 * 2. 3D Thermal Resistance & Local Hotspot Joule Heating:
 *    Thinning substrate to 5-10 um degrades lateral heat spreading:
 *    R_{th\_eff} = \frac{1}{\frac{1}{R_{th\_front}} + \frac{1}{R_{th\_back}}} + R_{th\_thin\_sub}
 *    \Delta T_{junction} = P_{density} \cdot R_{th\_eff}
 *    For eMRAM/ReRAM: High write current density triggers severe thermal degradation (PMA & retention drop).
 *    For AntiFuse: Single short breakdown pulse; read power in nano-watts produces zero thermal penalty.
 * 3. Frontside BEOL Wiring Congestion & Interconnect RC Delay:
 *    Removing power rails from frontside unlocks 100% of M0-M2 routing tracks for signal bitlines:
 *    t_{read\_latency} \approx 0.69 \cdot R_{BL} \cdot C_{BL\_eff} + t_{sense\_amp}
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: TSMC A16 / N2 Roadmap, Intel PowerVia Technology, IEDM Advanced GAA Nanosheet Papers
 */

/**
 * Advanced foundry process nodes with Backside Power Delivery.
 */
export const ADVANCED_NODE_PRESETS = Object.freeze({
  tsmc_n2_nanosheet: {
    id: "tsmc_n2_nanosheet",
    nameZh: "TSMC N2 奈米片 (GAA Nanosheet / 傳統正面供電 FSPDN 基準)",
    nameEn: "TSMC N2 Nanosheet (GAA / Conventional Frontside FSPDN Baseline)",
    foundryNode: "2nm Class GAA Nanosheet",
    hasBspdn: false,
    nominalVddV: 0.70,
    irDropMvBaseline: 48.0,
    thermalResistanceCPerW: 18.5,
    beolTrackDensityFactor: 1.0,
    substrateThicknessUm: 775.0,
  },
  tsmc_a16_spr: {
    id: "tsmc_a16_spr",
    nameZh: "TSMC A16 Super Power Rail (奈米片 + 背面供電 Nano-TSV)",
    nameEn: "TSMC A16 Super Power Rail (GAA + BSPDN Nano-TSV)",
    foundryNode: "1.6nm Class GAA with SPR",
    hasBspdn: true,
    nominalVddV: 0.65,
    irDropMvBaseline: 24.0, // 50% IR-drop reduction
    thermalResistanceCPerW: 27.5, // Thin wafer increases thermal resistance
    beolTrackDensityFactor: 1.25, // Frontside routing congestion relieved
    substrateThicknessUm: 8.0,
  },
  intel_18a_powervia: {
    id: "intel_18a_powervia",
    nameZh: "Intel 18A RibbonFET (背面供電 PowerVia + 60nm 奈米片)",
    nameEn: "Intel 18A RibbonFET (PowerVia BSPDN + 60nm RibbonFET)",
    foundryNode: "1.8nm Class RibbonFET with PowerVia",
    hasBspdn: true,
    nominalVddV: 0.68,
    irDropMvBaseline: 26.5,
    thermalResistanceCPerW: 26.0,
    beolTrackDensityFactor: 1.22,
    substrateThicknessUm: 10.0,
  },
  foundry_14a_advanced: {
    id: "foundry_14a_advanced",
    nameZh: "次世代 1.4nm (High-NA EUV + 雙面主動熱消散結構)",
    nameEn: "Next-Gen 1.4nm (High-NA EUV + Dual-Side Micro-Cooling)",
    foundryNode: "1.4nm Class Advanced GAA",
    hasBspdn: true,
    nominalVddV: 0.55,
    irDropMvBaseline: 18.0,
    thermalResistanceCPerW: 22.0, // Mitigated by backside heat spreading
    beolTrackDensityFactor: 1.35,
    substrateThicknessUm: 5.0,
  },
});

/**
 * Advanced NVM bitcell topologies in Nanosheet nodes.
 */
export const NANOSHEET_NVM_TOPOLOGIES = Object.freeze({
  antifuse_nanosheet_logic: {
    id: "antifuse_nanosheet_logic",
    nameZh: "奈米片純邏輯 AntiFuse (0 光罩 / 正面超薄介電質崩潰 / 零熱阻負擔)",
    nameEn: "Nanosheet Logic AntiFuse (0-Mask / Ultrathin Oxide / Zero Thermal Load)",
    integrationClass: "Frontside Logic Gate Dielectric Hard Breakdown",
    maskAdders: 0,
    readCurrentUa: 1.2,
    writeCurrentMa: 0.8, // Single 5us write pulse
    writeDurationUs: 5.0,
    readLatencyNs: 0.65,
    thermalImpactLevel: "Negligible (Zero static heat generation in read)",
    isThermalImmune: true,
  },
  embedded_stt_mram_beol: {
    id: "embedded_stt_mram_beol",
    nameZh: "BEOL 嵌入式 STT-MRAM (4~6 光罩 / M4-M5 夾層 / 寫入熱點累積)",
    nameEn: "BEOL Embedded STT-MRAM (4-6 Masks / M4-M5 Stack / Write Hotspot)",
    integrationClass: "Back-End Magnetic Tunnel Junction Stack",
    maskAdders: 5,
    readCurrentUa: 15.0,
    writeCurrentMa: 0.045, // Continuous write switching
    writeDurationUs: 0.02, // 20ns
    readLatencyNs: 3.2,
    thermalImpactLevel: "High (High local hotspot degrades PMA retention)",
    isThermalImmune: false,
  },
  embedded_reram_oxram: {
    id: "embedded_reram_oxram",
    nameZh: "BEOL 氧化物 ReRAM (2~3 光罩 / 氧空缺微絲熱擴散鬆弛風險)",
    nameEn: "BEOL Oxide ReRAM (2-3 Masks / Vacancy Thermal Dissolution Risk)",
    integrationClass: "Back-End Metal-Oxide Resistive Layer",
    maskAdders: 3,
    readCurrentUa: 8.5,
    writeCurrentMa: 0.08,
    writeDurationUs: 0.05,
    readLatencyNs: 4.5,
    thermalImpactLevel: "Medium (Thermal relaxation of conductive filament)",
    isThermalImmune: false,
  },
  nanosheet_sram_macro: {
    id: "nanosheet_sram_macro",
    nameZh: "6T/8T 奈米片 SRAM (揮發性 / 0 光罩 / 背面供電消除噪聲 / 漏電高)",
    nameEn: "6T/8T Nanosheet SRAM (Volatile / 0-Mask / Clean Vdd / High Leakage)",
    integrationClass: "Standard Frontside GAA Cell",
    maskAdders: 0,
    readCurrentUa: 28.0,
    writeCurrentMa: 0.025,
    writeDurationUs: 0.001,
    readLatencyNs: 0.45,
    thermalImpactLevel: "Low (Distributed switching, high static leakage)",
    isThermalImmune: true,
  },
});

/**
 * Calculates Nanosheet & BSPDN physical metrics for eNVM integration.
 *
 * @param {Object} params
 * @param {string} params.nodeKey
 * @param {string} params.techKey
 * @param {number} [params.customArrayMb]
 * @param {number} [params.customActivityRatePct]
 * @returns {Object} Calculated metrics
 */
export function calculateNanosheetBspdnNvm({
  nodeKey = "tsmc_a16_spr",
  techKey = "antifuse_nanosheet_logic",
  customArrayMb,
  customActivityRatePct,
} = {}) {
  const node = ADVANCED_NODE_PRESETS[nodeKey] || ADVANCED_NODE_PRESETS.tsmc_a16_spr;
  const tech = NANOSHEET_NVM_TOPOLOGIES[techKey] || NANOSHEET_NVM_TOPOLOGIES.antifuse_nanosheet_logic;

  const arrayMb = customArrayMb !== undefined ? customArrayMb : 1.0; // 1 Mb macro
  const activityPct = customActivityRatePct !== undefined ? customActivityRatePct : 15.0; // 15% write/read activity

  // 1. IR-Drop under Backside Power Delivery Network
  const irDropFactor = node.hasBspdn ? 0.55 : 1.0;
  const realizedIrDropMv = node.irDropMvBaseline * (1.0 + (activityPct / 100.0) * 0.4) * irDropFactor;

  // 2. Local Junction Temperature Rise \Delta T
  // Power density estimation based on active cell current and macro footprint
  const cellAreaUm2 = tech.id === "antifuse_nanosheet_logic" ? 0.045 : (tech.id === "nanosheet_sram_macro" ? 0.021 : 0.038);
  const totalMacroAreaMm2 = (arrayMb * 1024 * 1024 * cellAreaUm2) * 1e-6;

  let powerDensityWPerMm2 = 0;
  if (tech.id === "embedded_stt_mram_beol") {
    // High write current density during write cycles
    powerDensityWPerMm2 = 1.45 * (activityPct / 10.0);
  } else if (tech.id === "embedded_reram_oxram") {
    powerDensityWPerMm2 = 1.10 * (activityPct / 10.0);
  } else if (tech.id === "nanosheet_sram_macro") {
    powerDensityWPerMm2 = 0.85;
  } else {
    // AntiFuse: Only read in operation (few uW total)
    powerDensityWPerMm2 = 0.02;
  }

  // Thin substrate increases thermal resistance in BSPDN
  const junctionTempRiseC = powerDensityWPerMm2 * (node.thermalResistanceCPerW * 0.35);
  const junctionTempC = 25.0 + 40.0 + junctionTempRiseC; // 25 ambient + 40 typical SoC active + local hotspot

  // 3. Read Latency (Benefiting from frontside routing track release)
  const routingRelief = 1.0 / node.beolTrackDensityFactor;
  const realizedReadLatencyNs = tech.readLatencyNs * (node.nominalVddV / 0.70) * routingRelief;

  // 4. Feasibility Verdict & Compatibility
  let bspdnCompatibilityZh = "";
  let bspdnCompatibilityEn = "";
  let isOptimal = false;

  if (tech.id === "antifuse_nanosheet_logic") {
    bspdnCompatibilityZh = "極致適配 (Optimal · 零金屬層衝突 · 零熱阻聚集 · 原生相容背面供電)";
    bspdnCompatibilityEn = "Optimal (Zero Metal Conflict · No Hotspot · Native BSPDN Fit)";
    isOptimal = true;
  } else if (tech.id === "nanosheet_sram_macro") {
    bspdnCompatibilityZh = "高度適配 (High Fit · 受益於乾淨背面供電 · 但有靜態漏電負擔)";
    bspdnCompatibilityEn = "High Fit (Clean Backside Vdd Rails · High Standby Leakage)";
    isOptimal = true;
  } else if (tech.id === "embedded_stt_mram_beol") {
    if (node.hasBspdn) {
      bspdnCompatibilityZh = "挑戰嚴峻 (Severe Hotspot · 薄化晶圓散熱受阻引發 MTJ 磁熱翻轉)";
      bspdnCompatibilityEn = "Challenging (Thin Substrate Hotspot Causes MTJ Thermal Canting)";
      isOptimal = false;
    } else {
      bspdnCompatibilityZh = "可行但複雜 (Feasible · 需 5 道額外光罩與厚基板散熱)";
      bspdnCompatibilityEn = "Feasible (5 Mask Adders & Thick Substrate Cooling Needed)";
      isOptimal = false;
    }
  } else {
    bspdnCompatibilityZh = "中度風險 (Moderate Risk · 局部空缺微絲受熱機械應力干擾)";
    bspdnCompatibilityEn = "Moderate Risk (Filament Affected by Thermo-Mechanical Stress)";
    isOptimal = false;
  }

  return {
    nodeKey,
    techKey,
    arrayMb,
    activityPct,
    nominalVddV: node.nominalVddV,
    hasBspdn: node.hasBspdn,
    realizedIrDropMv: Number(realizedIrDropMv.toFixed(1)),
    junctionTempRiseC: Number(junctionTempRiseC.toFixed(1)),
    junctionTempC: Number(junctionTempC.toFixed(1)),
    realizedReadLatencyNs: Number(realizedReadLatencyNs.toFixed(2)),
    maskAdders: tech.maskAdders,
    isOptimal,
    bspdnCompatibilityZh,
    bspdnCompatibilityEn,
    nodeNameZh: node.nameZh,
    nodeNameEn: node.nameEn,
    techNameZh: tech.nameZh,
    techNameEn: tech.nameEn,
  };
}

/**
 * Draws the Nanosheet BSPDN simulation canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {"thermal_ir_profile"|"interconnect_rc_delay"} mode
 */
export function drawNanosheetBspdnCanvas(canvas, metrics, mode = "thermal_ir_profile") {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(rect.width, 320);
  const height = Math.max(rect.height, 180);

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.scale(dpr, dpr);

  const w = width;
  const h = height;

  ctx.fillStyle = "#070e17";
  ctx.fillRect(0, 0, w, h);

  // Subtle grid
  ctx.strokeStyle = "rgba(30, 41, 59, 0.6)";
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
  const plotY0 = 24;
  const plotY1 = h - 30;
  const plotW = plotX1 - plotX0;
  const plotH = plotY1 - plotY0;

  if (mode === "thermal_ir_profile") {
    // Mode A: Cross-Section Silicon Stack & Thermal / IR-Drop Profile
    // Visualizing Backside Metal -> Substrate -> GAA Nanosheet Channels -> Frontside BEOL
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotX0, plotY0);
    ctx.lineTo(plotX0, plotY1);
    ctx.lineTo(plotX1, plotY1);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText("Temp (°C)", 6, plotY0 + 6);
    ctx.fillText("Backside", plotX0, plotY1 + 16);
    ctx.fillText("Nano-TSV", plotX0 + plotW * 0.35, plotY1 + 16);
    ctx.fillText("Nanosheet Ch.", plotX0 + plotW * 0.65 - 20, plotY1 + 16);
    ctx.fillText("Frontside", plotX1 - 45, plotY1 + 16);

    const maxTemp = 140.0;
    ctx.fillText("140°C", plotX0 - 32, plotY0 + 4);
    ctx.fillText("80°C", plotX0 - 28, plotY0 + plotH * 0.5 + 4);
    ctx.fillText("25°C", plotX0 - 28, plotY1 + 4);

    // Draw Temperature Gradient Across Stack
    const drawTempStack = (techKey, color, label, isCurrent) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = isCurrent ? 3 : 1.5;
      if (!isCurrent) ctx.setLineDash([4, 3]);
      else ctx.setLineDash([]);

      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const frac = i / steps; // 0 to 1 across stack
        const sim = calculateNanosheetBspdnNvm({
          nodeKey: metrics.nodeKey,
          techKey,
          customArrayMb: metrics.arrayMb,
          customActivityRatePct: metrics.activityPct,
        });
        // Peak temperature is at the channel layer (frac ~ 0.65)
        const peakT = sim.junctionTempC;
        const baseT = 55.0;
        let layerT = baseT;
        if (frac < 0.65) {
          layerT = baseT + (peakT - baseT) * Math.pow(frac / 0.65, 1.8);
        } else {
          layerT = peakT - (peakT - (baseT + 10)) * ((frac - 0.65) / 0.35);
        }

        const clampedT = Math.min(maxTemp, layerT);
        const px = plotX0 + frac * plotW;
        const py = plotY1 - ((clampedT - 25.0) / (maxTemp - 25.0)) * plotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawTempStack("embedded_stt_mram_beol", "#ef4444", "STT-MRAM", metrics.techKey === "embedded_stt_mram_beol");
    drawTempStack("embedded_reram_oxram", "#f59e0b", "ReRAM", metrics.techKey === "embedded_reram_oxram");
    drawTempStack("nanosheet_sram_macro", "#a855f7", "SRAM", metrics.techKey === "nanosheet_sram_macro");
    drawTempStack("antifuse_nanosheet_logic", "#00f0ff", "AntiFuse", metrics.techKey === "antifuse_nanosheet_logic");

    // Current Operating Peak Callout
    const markerX = plotX0 + 0.65 * plotW;
    const markerY = plotY1 - ((metrics.junctionTempC - 25.0) / (maxTemp - 25.0)) * plotH;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 10px 'IBM Plex Mono', monospace";
    ctx.fillText(`Peak Tj: ${metrics.junctionTempC}°C | IR-Drop: ${metrics.realizedIrDropMv}mV`, Math.min(markerX + 8, plotX1 - 180), Math.max(markerY - 8, plotY0 + 12));

  } else {
    // Mode B: Interconnect RC Read Latency (ns) vs Macro Array Size (0.1Mb to 16Mb)
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotX0, plotY0);
    ctx.lineTo(plotX0, plotY1);
    ctx.lineTo(plotX1, plotY1);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText("Latency (ns)", 4, plotY0 + 6);
    ctx.fillText("0.1 Mb", plotX0, plotY1 + 16);
    ctx.fillText("8.0 Mb", plotX0 + plotW * 0.5 - 15, plotY1 + 16);
    ctx.fillText("16 Mb", plotX1 - 30, plotY1 + 16);

    const maxLat = 6.0;
    ctx.fillText(`${maxLat} ns`, plotX0 - 32, plotY0 + 4);
    ctx.fillText(`${maxLat / 2} ns`, plotX0 - 32, plotY0 + plotH * 0.5 + 4);
    ctx.fillText("0 ns", plotX0 - 24, plotY1 + 4);

    const maxMb = 16.0;

    const drawLatencyCurve = (techKey, color, label, isCurrent) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = isCurrent ? 3 : 1.5;
      if (!isCurrent) ctx.setLineDash([4, 3]);
      else ctx.setLineDash([]);

      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const mb = 0.1 + (i / steps) * (maxMb - 0.1);
        const sim = calculateNanosheetBspdnNvm({
          nodeKey: metrics.nodeKey,
          techKey,
          customArrayMb: mb,
          customActivityRatePct: metrics.activityPct,
        });
        // RC delay scales with sqrt(arrayMb) due to wirelength
        const totalLat = sim.realizedReadLatencyNs * (1.0 + 0.35 * Math.sqrt(mb / 1.0));
        const clampedLat = Math.min(maxLat, totalLat);
        const px = plotX0 + (mb / maxMb) * plotW;
        const py = plotY1 - (clampedLat / maxLat) * plotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawLatencyCurve("embedded_reram_oxram", "#f59e0b", "ReRAM", metrics.techKey === "embedded_reram_oxram");
    drawLatencyCurve("embedded_stt_mram_beol", "#ef4444", "STT-MRAM", metrics.techKey === "embedded_stt_mram_beol");
    drawLatencyCurve("antifuse_nanosheet_logic", "#00f0ff", "AntiFuse", metrics.techKey === "antifuse_nanosheet_logic");
    drawLatencyCurve("nanosheet_sram_macro", "#a855f7", "SRAM", metrics.techKey === "nanosheet_sram_macro");

    // Current Operating Point
    const currMb = Math.min(maxMb, metrics.arrayMb);
    const currLat = metrics.realizedReadLatencyNs * (1.0 + 0.35 * Math.sqrt(currMb / 1.0));
    const markerX = plotX0 + (currMb / maxMb) * plotW;
    const markerY = plotY1 - (Math.min(maxLat, currLat) / maxLat) * plotH;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#00f0ff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 10px 'IBM Plex Mono', monospace";
    ctx.fillText(`Latency: ${currLat.toFixed(2)} ns @ ${currMb} Mb`, Math.min(markerX + 8, plotX1 - 150), Math.max(markerY - 8, plotY0 + 12));
  }

  ctx.restore();
}

/**
 * Initializes the Nanosheet & BSPDN Simulator UI.
 *
 * @param {HTMLElement} [container]
 */
export function initNanosheetBspdnSimulator(container) {
  const root = container || document.getElementById("bspdn-nvm-simulator-root");
  if (!root) return;

  const nodeSelect = root.querySelector("#bspdn-node-select");
  const techSelect = root.querySelector("#bspdn-tech-select");
  const arraySlider = root.querySelector("#bspdn-array-slider");
  const arrayVal = root.querySelector("#bspdn-array-val");
  const actSlider = root.querySelector("#bspdn-act-slider");
  const actVal = root.querySelector("#bspdn-act-val");

  const outVdd = root.querySelector("#bspdn-out-vdd");
  const outIrDrop = root.querySelector("#bspdn-out-irdrop");
  const outTemp = root.querySelector("#bspdn-out-temp");
  const outLatency = root.querySelector("#bspdn-out-latency");
  const outMask = root.querySelector("#bspdn-out-mask");
  const outRating = root.querySelector("#bspdn-out-rating");
  const outVerdict = root.querySelector("#bspdn-out-verdict");

  const canvas = root.querySelector("#bspdn-canvas");
  const btnThermal = root.querySelector("#bspdn-mode-thermal");
  const btnDelay = root.querySelector("#bspdn-mode-delay");

  let currentMode = "thermal_ir_profile";

  // Populate Selects if empty
  if (nodeSelect && nodeSelect.options.length === 0) {
    Object.values(ADVANCED_NODE_PRESETS).forEach((n) => {
      const opt = document.createElement("option");
      opt.value = n.id;
      opt.textContent = `${n.nameEn}`;
      nodeSelect.appendChild(opt);
    });
    nodeSelect.value = "tsmc_a16_spr";
  }

  if (techSelect && techSelect.options.length === 0) {
    Object.values(NANOSHEET_NVM_TOPOLOGIES).forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.nameEn}`;
      techSelect.appendChild(opt);
    });
    techSelect.value = "antifuse_nanosheet_logic";
  }

  function update() {
    const nodeKey = nodeSelect ? nodeSelect.value : "tsmc_a16_spr";
    const techKey = techSelect ? techSelect.value : "antifuse_nanosheet_logic";
    const arrayMb = arraySlider ? Number(arraySlider.value) : 1.0;
    const actPct = actSlider ? Number(actSlider.value) : 15.0;

    if (arrayVal) arrayVal.textContent = `${arrayMb.toFixed(1)} Mb`;
    if (actVal) actVal.textContent = `${actPct.toFixed(0)}%`;

    const m = calculateNanosheetBspdnNvm({
      nodeKey,
      techKey,
      customArrayMb: arrayMb,
      customActivityRatePct: actPct,
    });

    if (outVdd) outVdd.textContent = `${m.nominalVddV} V`;
    if (outIrDrop) outIrDrop.textContent = `${m.realizedIrDropMv} mV`;
    if (outTemp) {
      outTemp.textContent = `${m.junctionTempC} °C`;
      outTemp.style.color = m.junctionTempC < 85 ? "#059669" : (m.junctionTempC < 105 ? "#f59e0b" : "#dc2626");
    }
    if (outLatency) outLatency.textContent = `${m.realizedReadLatencyNs} ns`;
    if (outMask) outMask.textContent = m.maskAdders === 0 ? "0 Masks (Pure Logic)" : `+${m.maskAdders} Masks`;
    if (outRating) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outRating.textContent = isZh ? m.bspdnCompatibilityZh : m.bspdnCompatibilityEn;
      outRating.style.color = m.isOptimal ? "#059669" : "#dc2626";
    }

    if (canvas) {
      drawNanosheetBspdnCanvas(canvas, m, currentMode);
    }

    // 複製狀態獨立呈現，不改動模型數值。
    syncMetricCopy([outVdd, outIrDrop, outTemp, outLatency, outMask, outRating]);
    const exportControl = root.querySelector('#nanosheet-bspdn-export-csv-btn');
    if (exportControl) {
      const isZh = (window.HubLanguage?.get() || document.documentElement.lang || 'en').startsWith('zh');
      exportControl.textContent = isZh ? '📥 匯出 2nm/A16 背面供電 CSV' : '📥 Export 2nm/A16 BSPDN CSV';
      exportControl.setAttribute('aria-label', isZh ? '匯出 2nm/A16 奈米片與背面供電數值資料集為 CSV 檔案' : 'Export 2nm/A16 Nanosheet & BSPDN metrics dataset as CSV file');
    }

    if (outVerdict) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outVerdict.innerHTML = isZh
        ? `<strong>2nm/A16 奈米片與背面供電整合判定：</strong> 在 <code>${m.nodeNameZh}</code> (Vdd=${m.nominalVddV}V) 下，背面供電將壓降 (IR-Drop) 壓抑至 <strong>${m.realizedIrDropMv} mV</strong>。然而晶圓薄化使 <code>${m.techNameZh}</code> 峰值熱點溫度達 <strong>${m.junctionTempC} °C</strong> (溫升 +${m.junctionTempRiseC}°C)。正面繞線釋放使讀取延遲降至 <strong>${m.realizedReadLatencyNs} ns</strong>。節點相容評級：<strong style="color:${m.isOptimal ? '#059669' : '#dc2626'};">${m.bspdnCompatibilityZh}</strong>。本模擬係依據一階集總參數熱阻與 RC 延遲模型推算，實際晶片須依據各代工廠 PDK 與先進封裝散熱方案量測校驗。`
        : `<strong>2nm/A16 Nanosheet &amp; BSPDN Integration Verdict:</strong> Under <code>${m.nodeNameEn}</code> (Vdd=${m.nominalVddV}V), Backside Power Delivery curbs IR-Drop to <strong>${m.realizedIrDropMv} mV</strong>. However, substrate thinning drives <code>${m.techNameEn}</code> peak junction temperature to <strong>${m.junctionTempC} °C</strong> (ΔT +${m.junctionTempRiseC}°C). Frontside track relief reduces read latency to <strong>${m.realizedReadLatencyNs} ns</strong>. Node rating: <strong style="color:${m.isOptimal ? '#059669' : '#dc2626'};">${m.bspdnCompatibilityEn}</strong>. Illustrative first-order lumped model; validate against specific foundry PDK and package thermal solutions.`;
    }
  }

  // Export CSV Action for 2nm/A16 Nanosheet BSPDN
  function downloadCsv(filename, csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const presetContainer = nodeSelect?.parentNode;
  if (presetContainer && !presetContainer.querySelector('#nanosheet-bspdn-export-csv-btn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'nanosheet-bspdn-export-csv-btn';
    exportBtn.type = 'button';
    exportBtn.style.cssText = 'margin-top: 6px; padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.4); background: rgba(15, 23, 42, 0.6); color: #38bdf8; cursor: pointer;';
    const isZhLang = (window.HubLanguage?.get() || document.documentElement.lang || 'en').startsWith('zh');
    exportBtn.textContent = isZhLang ? '📥 匯出 2nm/A16 背面供電 CSV' : '📥 Export 2nm/A16 BSPDN CSV';
    exportBtn.setAttribute('aria-label', isZhLang ? '匯出 2nm/A16 奈米片與背面供電數值資料集為 CSV 檔案' : 'Export 2nm/A16 Nanosheet & BSPDN metrics dataset as CSV file');
    exportBtn.addEventListener('click', () => {
      const nKey = nodeSelect ? nodeSelect.value : 'tsmc_a16_spr';
      const tKey = techSelect ? techSelect.value : 'antifuse_nanosheet_logic';
      let csv = 'ArraySize_Mb,ActivityRate_Pct,NominalVdd_V,IRDrop_mV,JunctionTemp_C,TempRise_C,ReadLatency_ns,MaskAdders\n';
      const arraySizes = [0.25, 0.5, 1.0, 2.0, 4.0, 8.0, 16.0];
      const actPcts = [5, 15, 30, 50];
      for (const sz of arraySizes) {
        for (const act of actPcts) {
          const res = calculateNanosheetBspdnNvm({
            nodeKey: nKey,
            techKey: tKey,
            customArrayMb: sz,
            customActivityRatePct: act,
          });
          csv += `${sz},${act},${res.nominalVddV},${res.realizedIrDropMv},${res.junctionTempC},${res.junctionTempRiseC},${res.realizedReadLatencyNs},${res.maskAdders}\n`;
        }
      }
      downloadCsv(`nanosheet_bspdn_${nKey}_${tKey}.csv`, csv);
    });
    presetContainer.appendChild(exportBtn);
  }

  if (nodeSelect) nodeSelect.addEventListener("change", update);
  if (techSelect) techSelect.addEventListener("change", update);
  if (arraySlider) arraySlider.addEventListener("input", update);
  if (actSlider) actSlider.addEventListener("input", update);

  if (btnThermal) {
    btnThermal.addEventListener("click", () => {
      currentMode = "thermal_ir_profile";
      btnThermal.classList.add("active");
      btnThermal.setAttribute("aria-pressed", "true");
      btnThermal.style.background = "#0284c7";
      btnThermal.style.color = "#ffffff";
      btnThermal.style.borderColor = "#38bdf8";
      if (btnDelay) {
        btnDelay.classList.remove("active");
        btnDelay.setAttribute("aria-pressed", "false");
        btnDelay.style.background = "#1e293b";
        btnDelay.style.color = "#94a3b8";
        btnDelay.style.borderColor = "#475569";
      }
      update();
    });
  }

  if (btnDelay) {
    btnDelay.addEventListener("click", () => {
      currentMode = "interconnect_rc_delay";
      btnDelay.classList.add("active");
      btnDelay.setAttribute("aria-pressed", "true");
      btnDelay.style.background = "#0284c7";
      btnDelay.style.color = "#ffffff";
      btnDelay.style.borderColor = "#38bdf8";
      if (btnThermal) {
        btnThermal.classList.remove("active");
        btnThermal.setAttribute("aria-pressed", "false");
        btnThermal.style.background = "#1e293b";
        btnThermal.style.color = "#94a3b8";
        btnThermal.style.borderColor = "#475569";
      }
      update();
    });
  }

  window.addEventListener("resize", () => {
    if (canvas) update();
  });
  window.addEventListener('hub:language-change', () => update());
  window.addEventListener('languagechange', () => update());
  update();
}

// Auto-initialize on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initNanosheetBspdnSimulator());
  } else {
    initNanosheetBspdnSimulator();
  }
}
