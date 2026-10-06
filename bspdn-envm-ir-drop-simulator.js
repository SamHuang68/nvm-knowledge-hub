/**
 * @file bspdn-envm-ir-drop-simulator.js
 * @description Lumped-Parameter Circuit & Thermal Microarchitectural Simulator for Backside Power Delivery Network
 *              (BSPDN / PowerVia / Super Power Rail) eNVM Parasitic Coupling, Dynamic IR-Drop Mitigation,
 *              and Thermal Reliability Trade-offs.
 *
 * @version 1.0.0 (2026-10-06)
 * @author High-Performance Semiconductor Architecture Team
 * @license Grounded in published semiconductor literature and lumped-parameter circuit approximations.
 */

/**
 * @typedef {Object} BspdnPreset
 * @property {string} id - Unique preset identifier
 * @property {string} nameZh - Traditional Chinese name
 * @property {string} nameEn - English name
 * @property {number} rPdn - PDN effective loop resistance in Ohms (R_PDN)
 * @property {number} lPdn - PDN effective loop inductance in nH (L_PDN)
 * @property {number} cCoupling - TSC / TSV parasitic substrate coupling capacitance in fF
 * @property {number} thermalResistance - Thermal resistance theta_th in K/W
 * @property {number} nominalVdd - Nominal macro operating / write voltage in Volts
 * @property {number} targetVwriteMin - Minimum breakdown requirement threshold in Volts
 * @property {string} descriptionZh - Architecture description in Traditional Chinese
 * @property {string} descriptionEn - Architecture description in English
 */

/**
 * Sub-2nm Foundry BSPDN & FSPDN Architectural Presets
 * @type {Record<string, BspdnPreset>}
 */
export const BSPDN_PRESETS = {
  tsmc_a16_spr: {
    id: 'tsmc_a16_spr',
    nameZh: 'TSMC A16 NanoFlex SPR (1.6nm 超級電軌)',
    nameEn: 'TSMC A16 NanoFlex SPR (1.6nm Super Power Rail)',
    rPdn: 1.85, // Backside direct contact to source/drain, minimal thick Cu sheet resistance
    lPdn: 0.14, // Ultra-short Nano-TSV via loop (<200nm deep)
    cCoupling: 1.25, // Nano-TSV to GAA channel parasitic capacitance
    thermalResistance: 64.0, // Wafer thinning and dielectric oxide liner cause thermal trapping (+16 K/W vs bulk Si); partially mitigated by backside thick Cu rails
    nominalVdd: 1.65, // Programming target bias
    targetVwriteMin: 1.52, // Threshold to guarantee permanent hard breakdown filament
    descriptionZh: '台積電 A16 埃米級製程，背面超級電軌 (SPR) 直觸源極/汲極，將寫入壓降降低約 87%，但晶圓極度減薄與介電隔離使局部熱阻略增，需仰賴先進封裝協同散熱。',
    descriptionEn: 'TSMC A16 Angstrom class node. Direct backside S/D contact cuts write IR-drop by ~87%, while extreme wafer thinning and oxide liners slightly elevate local thermal resistance, requiring package-level co-design.'
  },
  intel_14a_powervia: {
    id: 'intel_14a_powervia',
    nameZh: 'Intel 14A PowerVia (1.4nm RibbonFET)',
    nameEn: 'Intel 14A PowerVia (1.4nm RibbonFET)',
    rPdn: 2.10, // Dual-side via stacking with relaxed backside metal pitch
    lPdn: 0.18, // Nano-TSV loop inductance
    cCoupling: 1.45,
    thermalResistance: 68.0,
    nominalVdd: 1.65,
    targetVwriteMin: 1.52,
    descriptionZh: '英特爾 14A 先進背面供電技術，分離信號與電源走線，消除高階金屬層 RC 擁擠與壓降 Sag，熱管理需評估晶圓減薄後的熱累積效應。',
    descriptionEn: 'Intel 14A PowerVia architecture separating power and signal wiring, eliminating RC congestion and voltage sag, with thermal management addressing wafer-thinning heat accumulation.'
  },
  samsung_sf14_bspdn: {
    id: 'samsung_sf14_bspdn',
    nameZh: 'Samsung SF1.4 BS-PDN (MBCFET GAA)',
    nameEn: 'Samsung SF1.4 BS-PDN (MBCFET GAA)',
    rPdn: 2.35, // Buried power rail with backside micro-bump interconnect
    lPdn: 0.22,
    cCoupling: 1.60,
    thermalResistance: 72.0,
    nominalVdd: 1.65,
    targetVwriteMin: 1.52,
    descriptionZh: '三星 SF1.4 埋入式電源軌 (BPR) 結合背面通孔技術，為高密度 eNVM 巨集單元提供穩定瞬態功率，並需配合散熱通孔管理背面介電熱阻。',
    descriptionEn: 'Samsung SF1.4 Buried Power Rail with Backside Vias, providing stable transient current for dense eNVM macros, requiring thermal vias to mitigate backside dielectric resistance.'
  },
  fspdn_3nm_baseline: {
    id: 'fspdn_3nm_baseline',
    nameZh: '傳統正面 3nm 供電網基準 (FSPDN Baseline)',
    nameEn: 'Conventional 3nm Front-Side PDN (FSPDN Baseline)',
    rPdn: 14.8, // 18 layers of thin Cu interconnects with high via contact resistance
    lPdn: 1.35, // High loop inductance from multi-tier frontside metal stacks
    cCoupling: 0.45, // Lower substrate coupling but congested signal coupling
    thermalResistance: 48.0, // Bulk silicon substrate facilitates lower base thermal resistance
    nominalVdd: 1.65,
    targetVwriteMin: 1.52,
    descriptionZh: '傳統正面金屬供電網，大電流編程時經歷劇烈動態 IR-Drop 與 L(di/dt) 振鈴噪聲；但厚矽基底提供較佳之基板熱傳導路徑。',
    descriptionEn: 'Conventional front-side PDN suffering severe dynamic IR-drop and L(di/dt) ringing under high write current, though thick bulk silicon maintains lower base thermal resistance.'
  }
};

/**
 * Calculates physical BSPDN vs FSPDN metrics using lumped-parameter models.
 *
 * Governing Equations:
 * 1. Peak Dynamic IR-Drop:
 *    ΔV_IR = I_peak * R_PDN
 * 2. Inductive Switching Noise:
 *    ΔV_L = L_PDN * (dI / dt), where dI/dt = I_peak / t_rise
 * 3. Total Voltage Drop at Macro:
 *    V_drop_total = ΔV_IR + ΔV_L
 * 4. Effective Macro Voltage:
 *    V_macro_effective = V_nominal - V_drop_total
 * 5. Write Margin Headroom:
 *    Margin = V_macro_effective - V_target_min
 * 6. Local Junction Thermal Rise:
 *    ΔT_j = P_avg * theta_th, where P_avg = (I_peak * V_nominal) * dutyCycle
 * 7. Arrhenius TDDB Reliability Acceleration Factor:
 *    AF_Arrhenius = exp( (E_a / k_B) * (1 / (T_ref + 273.15) - 1 / (T_actual + 273.15)) )
 *
 * @param {Object} params
 * @param {string} params.presetKey - Key from BSPDN_PRESETS
 * @param {number} params.peakWriteCurrent - Peak pulse programming current in mA (e.g. 5 to 25 mA)
 * @param {number} params.pulseRiseTime - Pulse rise time in ns (e.g. 0.2 to 2.0 ns)
 * @param {number} params.ambientTemp - Ambient / Junction base temperature in °C (e.g. 25 to 175 °C)
 * @param {number} params.macroBitCapacity - Macro capacity in Kb (e.g. 16 to 1024 Kb)
 * @returns {Object} Calculated metrics
 */
export function calculateBspdnMetrics(params) {
  const preset = BSPDN_PRESETS[params.presetKey] || BSPDN_PRESETS.tsmc_a16_spr;
  const fspdnBaseline = BSPDN_PRESETS.fspdn_3nm_baseline;

  const iPeak = params.peakWriteCurrent * 1e-3; // Convert mA to A
  const tRise = Math.max(0.05, params.pulseRiseTime) * 1e-9; // Convert ns to s
  const diDt = iPeak / tRise; // A/s

  // 1. Current Preset IR-Drop & Inductive Noise
  const irDropCurrent = iPeak * preset.rPdn; // Volts
  const indNoiseCurrent = preset.lPdn * 1e-9 * diDt; // Volts
  const totalDropCurrent = irDropCurrent + indNoiseCurrent; // Volts
  const effectiveVddCurrent = Math.max(0, preset.nominalVdd - totalDropCurrent);
  const writeMarginCurrent = (effectiveVddCurrent - preset.targetVwriteMin) * 1000; // mV

  // 2. FSPDN Baseline IR-Drop & Inductive Noise for Comparison
  const irDropBaseline = iPeak * fspdnBaseline.rPdn;
  const indNoiseBaseline = fspdnBaseline.lPdn * 1e-9 * diDt;
  const totalDropBaseline = irDropBaseline + indNoiseBaseline;
  const effectiveVddBaseline = Math.max(0, fspdnBaseline.nominalVdd - totalDropBaseline);
  const writeMarginBaseline = (effectiveVddBaseline - fspdnBaseline.targetVwriteMin) * 1000; // mV

  // 3. Thermal Analysis
  const dutyCycle = 0.05; // 5% active programming duty cycle during burst write
  const pDissCurrent = (iPeak * preset.nominalVdd) * dutyCycle; // Watts
  const deltaTCurrent = pDissCurrent * preset.thermalResistance; // °C
  const tjActualCurrent = params.ambientTemp + deltaTCurrent;

  const pDissBaseline = (iPeak * fspdnBaseline.nominalVdd) * dutyCycle;
  const deltaTBaseline = pDissBaseline * fspdnBaseline.thermalResistance;
  const tjActualBaseline = params.ambientTemp + deltaTBaseline;

  // 4. Arrhenius Lifetime Factor (Ea = 0.7 eV, kB = 8.617333262145e-5 eV/K)
  const kB = 8.617333262145e-5;
  const Ea = 0.70; // Dielectric breakdown activation energy
  const tKCurrent = tjActualCurrent + 273.15;
  const tKBaseline = tjActualBaseline + 273.15;
  const lifetimeRatio = Math.exp((Ea / kB) * ((1 / tKCurrent) - (1 / tKBaseline)));

  // 5. RC Interconnect Bitline Propagation Delay (Substrate Coupling)
  // Higher C_coupling slightly increases propagation delay, but eliminated frontside wiring lowers overall RC
  const rBitline = 350; // Ohms per bitline column
  const cBitlineFrontside = 45; // fF
  const tauCurrent = rBitline * (cBitlineFrontside * 0.65 + preset.cCoupling) * 1e-15 * 1e12; // in picoseconds
  const tauBaseline = rBitline * (cBitlineFrontside * 1.0 + fspdnBaseline.cCoupling) * 1e-15 * 1e12; // in ps

  // 6. Write Yield Assessment (Lumped model based on voltage margin above programming threshold)
  let writeYield = 99.95; // Idealized upper-bound estimate under typical process variation
  if (effectiveVddCurrent < preset.targetVwriteMin) {
    const deficitRatio = (preset.targetVwriteMin - effectiveVddCurrent) / preset.targetVwriteMin;
    writeYield = Math.max(50.0, 99.0 - deficitRatio * 450);
  } else {
    const marginRatio = (effectiveVddCurrent - preset.targetVwriteMin) / 0.15;
    writeYield = Math.min(99.98, 98.0 + marginRatio * 1.95);
  }

  // 7. Executive Rating & Architectural Verdict
  let architectureRating = 'OPTIMAL_EXCELLENT';
  let verdictZh = '';
  let verdictEn = '';

  const irDropSavingPct = Math.round((1 - (totalDropCurrent / totalDropBaseline)) * 100);

  if (params.presetKey === 'fspdn_3nm_baseline') {
    architectureRating = effectiveVddCurrent >= preset.targetVwriteMin ? 'MARGINAL_RISK' : 'CRITICAL_VIOLATION';
    verdictZh = `【正面供電極限瓶頸】在 ${params.peakWriteCurrent.toFixed(1)} mA 瞬態寫入下，正面 18 層金屬產生高達 ${(totalDropCurrent * 1000).toFixed(1)} mV 總壓降 (IR-Drop: ${(irDropCurrent * 1000).toFixed(1)} mV, L·di/dt: ${(indNoiseCurrent * 1000).toFixed(1)} mV)。宏單元內部有效偏壓萎縮至 ${effectiveVddCurrent.toFixed(3)} V，${effectiveVddCurrent < preset.targetVwriteMin ? '跌破硬崩潰臨界值，預估寫入良率驟降至 ' + writeYield.toFixed(2) + '%' : '裕度僅剩 ' + writeMarginCurrent.toFixed(1) + ' mV，存在嚴重製程變異風險'}。厚矽基底熱阻為 ${preset.thermalResistance.toFixed(1)} K/W。`;
    verdictEn = `[Front-Side PDN Bottleneck] Under ${params.peakWriteCurrent.toFixed(1)} mA pulse write, 18-tier front metal incurs ${(totalDropCurrent * 1000).toFixed(1)} mV total sag (IR-Drop: ${(irDropCurrent * 1000).toFixed(1)} mV, L·di/dt: ${(indNoiseCurrent * 1000).toFixed(1)} mV). Internal macro voltage collapses to ${effectiveVddCurrent.toFixed(3)} V, ${effectiveVddCurrent < preset.targetVwriteMin ? 'breaching breakdown threshold with estimated write yield dropping to ' + writeYield.toFixed(2) + '%' : 'leaving only ' + writeMarginCurrent.toFixed(1) + ' mV headroom'}. Bulk silicon base thermal resistance is ${preset.thermalResistance.toFixed(1)} K/W.`;
  } else {
    architectureRating = 'SUPERIOR_BSPDN';
    verdictZh = `【背面供電優勢與熱折衷分析】${preset.nameZh} 透過直接背部電晶體通孔，將供電網總壓降壓抑至僅 ${(totalDropCurrent * 1000).toFixed(1)} mV（相較傳統正面供電壓降縮減 ${irDropSavingPct}%）。有效寫入偏壓充裕達 ${effectiveVddCurrent.toFixed(3)} V（裕度 +${writeMarginCurrent.toFixed(1)} mV，預估良率上限約 ${writeYield.toFixed(2)}%）。熱物理分析顯示：晶圓減薄與介電隔離層使局部熱阻微幅上升至 ${preset.thermalResistance.toFixed(1)} K/W（接面溫升 +${deltaTCurrent.toFixed(1)}°C vs 正面基準 +${deltaTBaseline.toFixed(1)}°C），需透過背面厚銅電軌與先進封裝協同散熱。`;
    verdictEn = `[BSPDN Analysis & Thermal Trade-off] ${preset.nameEn} leverages direct backside vias, shrinking total supply sag to just ${(totalDropCurrent * 1000).toFixed(1)} mV (${irDropSavingPct}% reduction vs FSPDN). Effective programming bias reaches ${effectiveVddCurrent.toFixed(3)} V (+${writeMarginCurrent.toFixed(1)} mV headroom, idealized yield estimate ~${writeYield.toFixed(2)}%). Thermal analysis indicates that wafer thinning and dielectric liners slightly elevate local thermal resistance to ${preset.thermalResistance.toFixed(1)} K/W (+${deltaTCurrent.toFixed(1)}°C vs +${deltaTBaseline.toFixed(1)}°C under pulsed write), underscoring the need for package-level co-design.`;
  }

  return {
    preset,
    fspdnBaseline,
    inputs: params,
    irDropCurrentMv: irDropCurrent * 1000,
    indNoiseCurrentMv: indNoiseCurrent * 1000,
    totalDropCurrentMv: totalDropCurrent * 1000,
    effectiveVddCurrent,
    writeMarginCurrentMv: writeMarginCurrent,
    irDropBaselineMv: irDropBaseline * 1000,
    indNoiseBaselineMv: indNoiseBaseline * 1000,
    totalDropBaselineMv: totalDropBaseline * 1000,
    effectiveVddBaseline,
    writeMarginBaselineMv: writeMarginBaseline,
    irDropSavingPct,
    deltaTCurrent,
    tjActualCurrent,
    deltaTBaseline,
    tjActualBaseline,
    lifetimeRatio,
    tauCurrentPs: tauCurrent,
    tauBaselinePs: tauBaseline,
    writeYield,
    architectureRating,
    verdictZh,
    verdictEn
  };
}

/**
 * Draws high-precision physical curves on HTML5 Canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics - Output from calculateBspdnMetrics
 * @param {string} mode - 'transient_waveform' | 'thermal_tddb'
 */
export function drawBspdnCanvas(canvas, metrics, mode = 'transient_waveform') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width > 0 ? rect.width : canvas.width;
  const height = rect.height > 0 ? rect.height : canvas.height;

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = '#08131e';
  ctx.fillRect(0, 0, width, height);

  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  if (plotWidth <= 0 || plotHeight <= 0) {
    ctx.restore();
    return;
  }

  // Draw Grid Lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  const numXGrids = 6;
  const numYGrids = 4;
  for (let i = 0; i <= numXGrids; i++) {
    const gx = padLeft + (i / numXGrids) * plotWidth;
    ctx.beginPath();
    ctx.moveTo(gx, padTop);
    ctx.lineTo(gx, padTop + plotHeight);
    ctx.stroke();
  }
  for (let j = 0; j <= numYGrids; j++) {
    const gy = padTop + (j / numYGrids) * plotHeight;
    ctx.beginPath();
    ctx.moveTo(padLeft, gy);
    ctx.lineTo(padLeft + plotWidth, gy);
    ctx.stroke();
  }
  ctx.setLineDash([]); // Reset dashed

  // Axis Labels Helper
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#64748b';

  if (mode === 'transient_waveform') {
    // Mode 1: Transient Voltage Waveform (0 to 6 ns)
    const tMax = 6.0; // ns
    const vMin = 1.30; // V
    const vMax = 1.75; // V

    // Y Axis Ticks
    for (let j = 0; j <= numYGrids; j++) {
      const vVal = vMax - (j / numYGrids) * (vMax - vMin);
      const gy = padTop + (j / numYGrids) * plotHeight;
      ctx.fillText(vVal.toFixed(2) + ' V', 12, gy + 3);
    }

    // X Axis Ticks
    for (let i = 0; i <= numXGrids; i++) {
      const tVal = (i / numXGrids) * tMax;
      const gx = padLeft + (i / numXGrids) * plotWidth;
      ctx.fillText(tVal.toFixed(1) + ' ns', gx - 14, padTop + plotHeight + 18);
    }

    // Minimum Breakdown Threshold Line
    const yVcrit = padTop + ((vMax - metrics.preset.targetVwriteMin) / (vMax - vMin)) * plotHeight;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, yVcrit);
    ctx.lineTo(padLeft + plotWidth, yVcrit);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.fillText('Min V_write (' + metrics.preset.targetVwriteMin.toFixed(2) + 'V)', padLeft + 10, yVcrit - 5);

    // Waveform Simulation:
    // Voltage drop formula vs time: V(t) = V_nom - Drop * f_transient(t)
    // f_transient(t): Rise from 0 to 1 with overshoot/ringing then steady state
    const pointsFspdn = [];
    const pointsBspdn = [];
    const tRise = metrics.inputs.pulseRiseTime;

    const sampleSteps = 120;
    for (let s = 0; s <= sampleSteps; s++) {
      const t = (s / sampleSteps) * tMax;
      let shapeFspdn = 0;
      let shapeBspdn = 0;

      if (t < 0.5) {
        shapeFspdn = 0;
        shapeBspdn = 0;
      } else {
        const tau = t - 0.5;
        if (tau < tRise) {
          const norm = tau / tRise;
          shapeFspdn = norm + 0.35 * Math.sin(norm * Math.PI); // Strong inductive ringing
          shapeBspdn = norm + 0.08 * Math.sin(norm * Math.PI); // Damped ringing
        } else {
          const decay = Math.exp(-(tau - tRise) / 0.8);
          shapeFspdn = 1.0 + 0.28 * Math.cos((tau - tRise) * 12) * decay;
          shapeBspdn = 1.0 + 0.05 * Math.cos((tau - tRise) * 16) * decay;
        }
      }

      // Convert to voltage
      const vFspdn = metrics.fspdnBaseline.nominalVdd - (metrics.totalDropBaselineMv / 1000) * shapeFspdn;
      const vBspdn = metrics.preset.nominalVdd - (metrics.totalDropCurrentMv / 1000) * shapeBspdn;

      const px = padLeft + (t / tMax) * plotWidth;
      const pyF = padTop + Math.max(0, Math.min(plotHeight, ((vMax - vFspdn) / (vMax - vMin)) * plotHeight));
      const pyB = padTop + Math.max(0, Math.min(plotHeight, ((vMax - vBspdn) / (vMax - vMin)) * plotHeight));

      pointsFspdn.push({ x: px, y: pyF });
      pointsBspdn.push({ x: px, y: pyB });
    }

    // Draw FSPDN Baseline Curve (Amber / Warning Red)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    pointsFspdn.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Draw Current BSPDN Curve (Cyan / Emerald)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    pointsBspdn.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Legend
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(padLeft + plotWidth - 220, padTop + 10, 12, 4);
    ctx.fillText('FSPDN Baseline (-' + metrics.totalDropBaselineMv.toFixed(0) + 'mV)', padLeft + plotWidth - 200, padTop + 14);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(padLeft + plotWidth - 220, padTop + 26, 12, 4);
    ctx.fillText('Active BSPDN (-' + metrics.totalDropCurrentMv.toFixed(0) + 'mV)', padLeft + plotWidth - 200, padTop + 30);

  } else {
    // Mode 2: Thermal Junction Profile & Thermal Trapping Analysis
    // X-axis: Ambient Temp (25 to 175 °C)
    // Y-axis: Junction Operating Temperature T_j (25 to 200 °C)
    const tempMin = 25;
    const tempMax = 175;
    const tjMin = 25;
    const tjMax = 200;

    // Y Axis Ticks
    for (let j = 0; j <= numYGrids; j++) {
      const gVal = tjMax - (j / numYGrids) * (tjMax - tjMin);
      const gy = padTop + (j / numYGrids) * plotHeight;
      ctx.fillText(gVal.toFixed(0) + '°C', 16, gy + 3);
    }

    // X Axis Ticks
    for (let i = 0; i <= numXGrids; i++) {
      const tVal = tempMin + (i / numXGrids) * (tempMax - tempMin);
      const gx = padLeft + (i / numXGrids) * plotWidth;
      ctx.fillText(tVal.toFixed(0) + '°C', gx - 10, padTop + plotHeight + 18);
    }

    // Plot FSPDN Baseline Curve (Amber: lower theta_th from bulk Si)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let i = 0; i <= numXGrids; i++) {
      const tAmb = tempMin + (i / numXGrids) * (tempMax - tempMin);
      const tjFspdn = tAmb + metrics.deltaTBaseline;
      const gx = padLeft + (i / numXGrids) * plotWidth;
      const gy = padTop + ((tjMax - tjFspdn) / (tjMax - tjMin)) * plotHeight;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot Active BSPDN Curve (Cyan: slight thermal trapping from wafer thinning)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= numXGrids; i++) {
      const tAmb = tempMin + (i / numXGrids) * (tempMax - tempMin);
      const tjBspdn = tAmb + metrics.deltaTCurrent;
      const gx = padLeft + (i / numXGrids) * plotWidth;
      const gy = padTop + ((tjMax - tjBspdn) / (tjMax - tjMin)) * plotHeight;
      if (i === 0) ctx.moveTo(gx, gy);
      else ctx.lineTo(gx, gy);
    }
    ctx.stroke();

    // Legend
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(padLeft + 10, padTop + 10, 12, 4);
    ctx.fillText('FSPDN Baseline (+ ' + metrics.deltaTBaseline.toFixed(1) + '°C, θth=' + metrics.fspdnBaseline.thermalResistance + ' K/W)', padLeft + 28, padTop + 14);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(padLeft + 10, padTop + 24, 12, 4);
    ctx.fillText('Active BSPDN (+ ' + metrics.deltaTCurrent.toFixed(1) + '°C, θth=' + metrics.preset.thermalResistance + ' K/W)', padLeft + 28, padTop + 28);

    // Mark current operating point
    const currTemp = metrics.inputs.ambientTemp;
    const currTj = metrics.tjActualCurrent;
    const currX = padLeft + ((currTemp - tempMin) / (tempMax - tempMin)) * plotWidth;
    const currY = padTop + ((tjMax - currTj) / (tjMax - tjMin)) * plotHeight;

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(currX, currY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('Current Operating: Tj=' + currTj.toFixed(1) + '°C @ Tamb=' + currTemp + '°C', Math.min(currX + 8, padLeft + plotWidth - 180), currY - 8);
  }

  ctx.restore();
}

/**
 * Initializes the BSPDN eNVM simulator UI in the DOM.
 */
export function initBspdnSimulator() {
  if (typeof document === 'undefined') return;

  const root = document.getElementById('bspdn-envm-simulator-root');
  if (!root) return;

  const presetSelect = document.getElementById('bspdn-preset-select');
  const currentSlider = document.getElementById('bspdn-current-slider');
  const currentVal = document.getElementById('bspdn-current-val');
  const riseSlider = document.getElementById('bspdn-rise-slider');
  const riseVal = document.getElementById('bspdn-rise-val');
  const tempSlider = document.getElementById('bspdn-temp-slider');
  const tempVal = document.getElementById('bspdn-temp-val');

  // Outputs
  const outIrdrop = document.getElementById('bspdn-out-irdrop');
  const outIndnoise = document.getElementById('bspdn-out-indnoise');
  const outEffvdd = document.getElementById('bspdn-out-effvdd');
  const outTempdrop = document.getElementById('bspdn-out-tempdrop');
  const outGain = document.getElementById('bspdn-out-gain');
  const outYield = document.getElementById('bspdn-out-yield');
  const outVerdict = document.getElementById('bspdn-out-verdict');

  // Visualization Mode Buttons & Canvas
  const canvas = document.getElementById('bspdn-canvas');
  const btnModeTransient = document.getElementById('bspdn-mode-transient');
  const btnModeThermal = document.getElementById('bspdn-mode-thermal');

  let activeMode = 'transient_waveform';

  function update() {
    const config = {
      presetKey: presetSelect ? presetSelect.value : 'tsmc_a16_spr',
      peakWriteCurrent: currentSlider ? parseFloat(currentSlider.value) : 12.0,
      pulseRiseTime: riseSlider ? parseFloat(riseSlider.value) : 0.5,
      ambientTemp: tempSlider ? parseFloat(tempSlider.value) : 125.0,
      macroBitCapacity: 64
    };

    if (currentVal && currentSlider) currentVal.textContent = currentSlider.value + ' mA';
    if (riseVal && riseSlider) riseVal.textContent = riseSlider.value + ' ns';
    if (tempVal && tempSlider) tempVal.textContent = tempSlider.value + ' °C';

    const metrics = calculateBspdnMetrics(config);

    if (outIrdrop) outIrdrop.textContent = metrics.irDropCurrentMv.toFixed(1) + ' mV';
    if (outIndnoise) outIndnoise.textContent = metrics.indNoiseCurrentMv.toFixed(1) + ' mV';
    if (outEffvdd) {
      outEffvdd.textContent = metrics.effectiveVddCurrent.toFixed(3) + ' V';
      outEffvdd.style.color = metrics.effectiveVddCurrent >= metrics.preset.targetVwriteMin ? '#059669' : '#dc2626';
    }
    if (outTempdrop) outTempdrop.textContent = '+' + metrics.deltaTCurrent.toFixed(1) + ' °C';
    if (outGain) outGain.textContent = metrics.irDropSavingPct + '%';
    if (outYield) {
      outYield.textContent = metrics.writeYield.toFixed(2) + '%';
      outYield.style.color = metrics.writeYield >= 99.5 ? '#059669' : '#d97706';
    }

    if (outVerdict) {
      outVerdict.innerHTML = `
        <span data-lang="zh">${metrics.verdictZh}</span>
        <span data-lang="en">${metrics.verdictEn}</span>
      `;
    }

    if (canvas) {
      drawBspdnCanvas(canvas, metrics, activeMode);
    }
  }

  if (presetSelect) presetSelect.addEventListener('change', update);
  if (currentSlider) currentSlider.addEventListener('input', update);
  if (riseSlider) riseSlider.addEventListener('input', update);
  if (tempSlider) tempSlider.addEventListener('input', update);

  if (btnModeTransient) {
    btnModeTransient.addEventListener('click', () => {
      activeMode = 'transient_waveform';
      btnModeTransient.classList.add('active');
      btnModeTransient.setAttribute('aria-pressed', 'true');
      btnModeTransient.style.background = '#0284c7';
      btnModeTransient.style.color = '#ffffff';

      if (btnModeThermal) {
        btnModeThermal.classList.remove('active');
        btnModeThermal.setAttribute('aria-pressed', 'false');
        btnModeThermal.style.background = '#1e293b';
        btnModeThermal.style.color = '#94a3b8';
      }
      update();
    });
  }

  if (btnModeThermal) {
    btnModeThermal.addEventListener('click', () => {
      activeMode = 'thermal_tddb';
      btnModeThermal.classList.add('active');
      btnModeThermal.setAttribute('aria-pressed', 'true');
      btnModeThermal.style.background = '#0284c7';
      btnModeThermal.style.color = '#ffffff';

      if (btnModeTransient) {
        btnModeTransient.classList.remove('active');
        btnModeTransient.setAttribute('aria-pressed', 'false');
        btnModeTransient.style.background = '#1e293b';
        btnModeTransient.style.color = '#94a3b8';
      }
      update();
    });
  }

  // Handle window resize
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      if (canvas) update();
    });
  }

  update();
}

// Auto-run if running in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBspdnSimulator);
  } else {
    initBspdnSimulator();
  }
}
