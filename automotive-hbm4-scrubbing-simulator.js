/**
 * @file automotive-hbm4-scrubbing-simulator.js
 * @description First-principles simulator for Automotive ASIL-D Autonomous HPC HBM4 extreme mission profiles,
 * dynamic sPPR (Soft PPR) vs. permanent hPPR (Hard AntiFuse PPR) scrubbing cycles, and FIT rate degradation.
 * @version 1.0.0
 * @license MIT
 */

/**
 * @typedef {Object} AutomotiveMissionPreset
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {number} ambientTempC - Ambient operating temperature (-40 to 125 C)
 * @property {number} defaultJunctionTempC - Base die junction temperature (Tj)
 * @property {number} thermalCycles - Thermal stress cycles per operational year
 * @property {number} altitudeMeters - Operating altitude in meters (cosmic neutron flux scaling)
 * @property {number} hbmLayers - HBM4 stack height (8, 12, 16)
 * @property {string} asilTarget - 'ASIL-D' | 'ASIL-B' | 'QM'
 * @property {string} descZh
 * @property {string} descEn
 */

/**
 * Standard Automotive Mission Presets
 * @type {Record<string, AutomotiveMissionPreset>}
 */
export const AUTOMOTIVE_MISSION_PRESETS = {
  l4_robotaxi_extreme: {
    id: 'l4_robotaxi_extreme',
    nameZh: 'L4/L5 無人自駕計程車 (24/7 連續極限運轉 · 115°C Tj)',
    nameEn: 'L4/L5 Robo-Taxi Autonomous HPC (24/7 Continuous · 115°C Tj)',
    ambientTempC: 85,
    defaultJunctionTempC: 115,
    thermalCycles: 1800,
    altitudeMeters: 500,
    hbmLayers: 16,
    asilTarget: 'ASIL-D',
    descZh: '全天候連續載客自駕計算晶片，高負載 650W TDP，Base Die 長期處於 115°C 高溫，需藉由極致巡檢抑制雙錯。',
    descEn: '24/7 continuous autonomous driving HPC at 650W TDP; Base Die operates at 115°C, demanding rigorous scrubbing.'
  },
  highway_adas_pilot: {
    id: 'highway_adas_pilot',
    nameZh: '高速領航自駕 ADAS 晶片 (高海拔巡航 · 95°C Tj)',
    nameEn: 'Highway Pilot Autonomous ADAS (High Altitude · 95°C Tj)',
    ambientTempC: 65,
    defaultJunctionTempC: 95,
    thermalCycles: 1200,
    altitudeMeters: 2200,
    hbmLayers: 12,
    asilTarget: 'ASIL-D',
    descZh: '高原高速公路自動導航駕駛，高海拔快中子通量增長達 4.3 倍，著重抗單粒子翻轉 (SEU) 與軟硬混合修復。',
    descEn: 'High-altitude highway autopilot where fast neutron flux scales 4.3x; emphasizes SEU mitigation and hybrid PPR.'
  },
  in_cabin_ai_cockpit: {
    id: 'in_cabin_ai_cockpit',
    nameZh: '智慧座艙多模態 AI 晶片 (智慧娛樂與駕駛監控 · 85°C Tj)',
    nameEn: 'Intelligent AI Cockpit (Infotainment & DMS · 85°C Tj)',
    ambientTempC: 50,
    defaultJunctionTempC: 85,
    thermalCycles: 800,
    altitudeMeters: 200,
    hbmLayers: 8,
    asilTarget: 'ASIL-B',
    descZh: '座艙大型語言模型 (LLM) 與視線即時監控，要求高性價比與低修復開銷，以 sPPR 軟體修復為主。',
    descEn: 'Cabin LLM and driver monitoring with cost-optimized repair overhead, primarily utilizing soft PPR.'
  },
  heavy_truck_powertrain: {
    id: 'heavy_truck_powertrain',
    nameZh: '重型商用卡車自駕大腦 (極限震動與熱衝擊 · 125°C Tj)',
    nameEn: 'Heavy Commercial Truck Brain (Severe Shock & Thermal · 125°C Tj)',
    ambientTempC: 105,
    defaultJunctionTempC: 125,
    thermalCycles: 2500,
    altitudeMeters: 1200,
    hbmLayers: 16,
    asilTarget: 'ASIL-D',
    descZh: '40 噸重卡無人幹線物流，引擎艙近端熱輻射與持續振動，TSV 焊點熱疲勞硬失效率顯著攀升，必須具備永久 AntiFuse hPPR 備援。',
    descEn: '40-ton commercial truck logistics near engine compartment; high vibration accelerates TSV fatigue, requiring permanent hPPR.'
  }
};

/**
 * Scrubbing and PPR Architecture Presets
 * @type {Record<string, { id: string, nameZh: string, nameEn: string, repairEfficiency: number, spprLatencyNs: number, hpprCyclesMax: number, descZh: string, descEn: string }>}
 */
export const REPAIR_ARCHITECTURES = {
  hybrid_tier_scrubbing: {
    id: 'hybrid_tier_scrubbing',
    nameZh: '分層混合修復 (動態 sPPR 快取 + 永久 0-Mask AntiFuse hPPR)',
    nameEn: 'Tiered Hybrid (Dynamic sPPR Cache + 0-Mask AntiFuse hPPR)',
    repairEfficiency: 0.998,
    spprLatencyNs: 0.8,
    hpprCyclesMax: 512,
    descZh: '即時運行時以片上 sPPR 暫存器零等待遮蔽單一位元故障；累計多位元嚴重異常時，觸發片內幫浦永久燒斷 AntiFuse 歐姆矽微絲。',
    descEn: 'Runtime single-bit faults are instantaneously masked by sPPR registers; severe multi-bit errors trigger permanent AntiFuse hPPR.'
  },
  dynamic_sppr_only: {
    id: 'dynamic_sppr_only',
    nameZh: '純動態軟體修復 (sPPR Register-Based Only)',
    nameEn: 'Dynamic Soft PPR Only (Register-Based)',
    repairEfficiency: 0.940,
    spprLatencyNs: 0.8,
    hpprCyclesMax: 0,
    descZh: '每次開機重置由 BIST 填入暫存器，無永久非揮發性熔斷能力，斷電後需重新掃描重映射。',
    descEn: 'Registers populated on every boot; lacks non-volatile retention and requires complete rescan upon power loss.'
  },
  hard_anti_fuse_only: {
    id: 'hard_anti_fuse_only',
    nameZh: '純硬體永久反熔絲修復 (Hard AntiFuse hPPR Only)',
    nameEn: 'Permanent AntiFuse Hard PPR Only (hPPR)',
    repairEfficiency: 0.985,
    spprLatencyNs: 45.0,
    hpprCyclesMax: 512,
    descZh: '每次修復均進行晶片內非揮發性反熔絲熔斷，耐溫 260°C 零回彈，但單次熔斷需毫秒級電荷幫浦編程脈衝。',
    descEn: 'Direct non-volatile AntiFuse programming with 260°C zero-rebound; requires millisecond-scale on-chip charge pump pulses.'
  },
  legacy_ecc_unmanaged: {
    id: 'legacy_ecc_unmanaged',
    nameZh: '無修復純 ECC (Baseline SEC-DED without PPR)',
    nameEn: 'Baseline SEC-DED ECC Only (No PPR Remapping)',
    repairEfficiency: 0.720,
    spprLatencyNs: 0,
    hpprCyclesMax: 0,
    descZh: '僅依賴 DRAM 內部 On-Die ECC 與控制器 SEC-DED，無壞列/壞道替換備援，累積雙錯率隨時間急劇劣化。',
    descEn: 'Relies solely on on-die ECC without row redundancy; multi-bit error accumulation degrades drastically over time.'
  }
};

/**
 * First-principles Automotive Mission and Scrubbing FIT calculations
 * @param {Object} params
 * @param {string} params.missionId
 * @param {string} params.repairArchId
 * @param {number} params.junctionTempC - 80 to 135 C
 * @param {number} params.scrubbingPeriodSec - 0.01 to 60.0 s
 * @param {number} params.stackDensityGb - 32, 64, 96 GB
 * @returns {Object}
 */
export function calculateAutomotiveHbm4Metrics({
  missionId = 'l4_robotaxi_extreme',
  repairArchId = 'hybrid_tier_scrubbing',
  junctionTempC = 115.0,
  scrubbingPeriodSec = 1.0,
  stackDensityGb = 64
}) {
  const mission = AUTOMOTIVE_MISSION_PRESETS[missionId] || AUTOMOTIVE_MISSION_PRESETS.l4_robotaxi_extreme;
  const arch = REPAIR_ARCHITECTURES[repairArchId] || REPAIR_ARCHITECTURES.hybrid_tier_scrubbing;

  // 1. Cosmic Fast-Neutron Altitude Factor: F_alt = exp(altitude / 1500m)
  const altitudeFactor = Math.exp(mission.altitudeMeters / 1500.0);

  // 2. Arrhenius Thermal Acceleration for Soft-Errors:
  // Ea = 0.65 eV, kB = 8.617333e-5 eV/K, Tref = 298.15 K (25 C)
  const kB = 8.617333e-5;
  const Ea = 0.65;
  const tKelvin = junctionTempC + 273.15;
  const tRefKelvin = 298.15;
  const thermalAccel = Math.exp((-Ea / kB) * (1.0 / tKelvin - 1.0 / tRefKelvin));

  // Base soft-error rate (FIT/Gb at sea-level 25C)
  const baseSerPerGb = 1.8;
  const rawSerFit = baseSerPerGb * stackDensityGb * altitudeFactor * thermalAccel;

  // 3. TSV / Micro-bump Solder Fatigue Hard Failure Rate (Coffin-Manson model approximation)
  // Scaled with thermal cycles and junction temperature
  const deltaT = Math.max(10, junctionTempC - mission.ambientTempC);
  const fatigueFactor = Math.pow(deltaT / 45.0, 2.2) * (mission.thermalCycles / 1000.0);
  const baseHardFailureFit = 0.45 * (mission.hbmLayers / 8.0) * fatigueFactor;

  // 4. Scrubbing Elimination of Dual-Bit Failure (MBF)
  // Two single-bit events colliding within scrubbing interval Ts
  // Residual dual-bit FIT = (Raw_SER)^2 * Ts * (1 - RepairEfficiency) [Statistical Heuristic Model]
  const collisionRate = Math.pow(rawSerFit * 1e-4, 2) * (scrubbingPeriodSec / 1.0);
  const residualSerFit = collisionRate * (1.0 - arch.repairEfficiency) * 8.5;

  // Residual Hard Failure FIT after PPR row remapping
  const residualHardFit = baseHardFailureFit * (1.0 - arch.repairEfficiency);

  // Total Residual FIT Rate
  const totalResidualFit = Math.max(0.01, residualSerFit + residualHardFit);

  // 5. ISO 26262 ASIL Metrics (Simplified Diagnostic Coverage Heuristic)
  const totalRawFailures = rawSerFit + baseHardFailureFit;
  const spfmPercent = Math.min(99.99, Math.max(80.0, 100.0 * (1.0 - (totalResidualFit / totalRawFailures))));
  const lfmPercent = Math.min(99.5, Math.max(70.0, 100.0 * (1.0 - (totalResidualFit * 0.45 / totalRawFailures))));

  // AntiFuse OTP hPPR Row Allocation Budget
  const estimatedBadRowsPerStack = Math.round(mission.hbmLayers * 12 * (fatigueFactor * 0.4 + 1.0));
  const maxAvailableHpprRows = arch.hpprCyclesMax;
  const hpprUsagePercent = maxAvailableHpprRows > 0
    ? Math.min(100.0, (estimatedBadRowsPerStack / maxAvailableHpprRows) * 100.0)
    : 0.0;

  // ASIL Rating Qualification Target Assessment
  let asilRating = 'ASIL-D TARGET MET';
  let ratingColor = '#10b981';

  if (spfmPercent < 90.0 || totalResidualFit > 100.0) {
    asilRating = 'QM / NON-COMPLIANT';
    ratingColor = '#ef4444';
  } else if (spfmPercent < 97.0 || totalResidualFit > 50.0) {
    asilRating = 'ASIL-B TARGET MET';
    ratingColor = '#f59e0b';
  } else if (spfmPercent < 99.0 || totalResidualFit > 10.0) {
    asilRating = 'ASIL-C TARGET MET';
    ratingColor = '#38bdf8';
  }

  // Verdict Narrative
  const verdictZh = `在 ${mission.nameZh} 極限任務剖面 (${junctionTempC}°C Tj, 海拔 ${mission.altitudeMeters}m) 下，` +
    `週期性清洗 (${scrubbingPeriodSec.toFixed(2)}s) 與 ${arch.nameZh} 協同運作：` +
    `將未修復之 ${totalRawFailures.toFixed(0)} FIT 壓制至殘餘 ${totalResidualFit.toFixed(2)} FIT (SPFM: ${spfmPercent.toFixed(2)}%)，` +
    `Base Die 0-Mask AntiFuse OTP 累積修復預算佔比 ${hpprUsagePercent.toFixed(1)}%，達成 ${asilRating} 目標設計度量 (SPFM ≥ 99%, 系統級完整認證需另依 ISO 26262 流程實施)。`;

  const verdictEn = `Under ${mission.nameEn} extreme mission profile (${junctionTempC}°C Tj, ${mission.altitudeMeters}m altitude), ` +
    `periodic scrubbing (${scrubbingPeriodSec.toFixed(2)}s) paired with ${arch.nameEn} ` +
    `suppresses raw ${totalRawFailures.toFixed(0)} FIT down to residual ${totalResidualFit.toFixed(2)} FIT (SPFM: ${spfmPercent.toFixed(2)}%), ` +
    `utilizing ${hpprUsagePercent.toFixed(1)}% of Base Die AntiFuse hPPR budget, meeting ${asilRating} design targets (formal system-level qualification requires full ISO 26262 lifecycle execution).`;

  return {
    rawSerFit,
    baseHardFailureFit,
    totalRawFailures,
    residualSerFit,
    residualHardFit,
    totalResidualFit,
    spfmPercent,
    lfmPercent,
    estimatedBadRowsPerStack,
    hpprUsagePercent,
    asilRating,
    ratingColor,
    verdictZh,
    verdictEn
  };
}

/**
 * Draw interactive dual-mode simulation visualization on HTML5 Canvas
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'scrubbing_period_vs_residual_fit'|'junction_temp_mission_lifetime'} mode
 * @param {boolean} [isZh=true]
 */
export function drawAutomotiveHbm4Canvas(canvas, metrics, mode = 'scrubbing_period_vs_residual_fit', isZh = true) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#09131e');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const padLeft = 56;
  const padRight = 32;
  const padTop = 32;
  const padBottom = 48;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Grid
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padTop + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
    ctx.stroke();
  }

  if (mode === 'scrubbing_period_vs_residual_fit') {
    // Mode 1: Scrubbing Interval (0.01s to 10s) vs Residual Dual-Bit FIT
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText('100 FIT', padLeft - 8, padTop + 4);
    ctx.fillText('50 FIT', padLeft - 8, padTop + plotH * 0.25 + 4);
    ctx.fillText('20 FIT', padLeft - 8, padTop + plotH * 0.50 + 4);
    ctx.fillText('10 FIT', padLeft - 8, padTop + plotH * 0.75 + 4);
    ctx.fillText('0 FIT', padLeft - 8, padTop + plotH + 4);

    const getX = sec => padLeft + plotW * (sec / 10.0);
    const getY = fit => padTop + plotH * (1.0 - Math.min(100.0, fit) / 100.0);

    // ASIL-D 10 FIT Safety Limit Line
    const yAsilD = getY(10.0);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(padLeft, yAsilD);
    ctx.lineTo(padLeft + plotW, yAsilD);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '700 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'right';
    ctx.fillText(
      isZh ? 'ASIL-D 門檻 (< 10 FIT)' : 'ASIL-D Target (< 10 FIT)',
      padLeft + plotW - 10,
      yAsilD - 6
    );

    // Unmanaged Curve (Red)
    ctx.beginPath();
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2.0;
    for (let s = 0.1; s <= 10.0; s += 0.5) {
      const collision = Math.pow(metrics.rawSerFit * 1e-4, 2) * s;
      const fit = Math.min(250.0, collision * (1.0 - 0.72) * 8.5 + (metrics.baseHardFailureFit * (1.0 - 0.72)));
      const x = getX(s);
      const y = getY(fit);
      if (s === 0.1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Hybrid sPPR + AntiFuse hPPR Curve (Emerald Cyan)
    ctx.beginPath();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    for (let s = 0.1; s <= 10.0; s += 0.5) {
      const collision = Math.pow(metrics.rawSerFit * 1e-4, 2) * s;
      const fit = Math.min(250.0, collision * (1.0 - 0.998) * 8.5 + metrics.residualHardFit);
      const x = getX(s);
      const y = getY(fit);
      if (s === 0.1) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('1s', getX(1.0), height - padBottom + 16);
    ctx.fillText('5s', getX(5.0), height - padBottom + 16);
    ctx.fillText('10s (Scrub Interval)', getX(10.0), height - padBottom + 16);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#f87171';
    ctx.fillText(
      isZh ? '--- 無修復純 ECC' : '--- Baseline ECC Only',
      padLeft + 10,
      padTop - 12
    );
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(
      isZh ? '— sPPR + AntiFuse hPPR 混合修復' : '— Hybrid sPPR + AntiFuse hPPR',
      padLeft + 200,
      padTop - 12
    );

  } else {
    // Mode 2: Junction Temp (70C to 135C) vs Lifetime Failure Rate
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText('500 FIT', padLeft - 8, padTop + 4);
    ctx.fillText('375 FIT', padLeft - 8, padTop + plotH * 0.25 + 4);
    ctx.fillText('250 FIT', padLeft - 8, padTop + plotH * 0.50 + 4);
    ctx.fillText('125 FIT', padLeft - 8, padTop + plotH * 0.75 + 4);
    ctx.fillText('0 FIT', padLeft - 8, padTop + plotH + 4);

    const tMin = 70;
    const tMax = 135;
    const getX = t => padLeft + plotW * ((t - tMin) / (tMax - tMin));
    const getY = fit => padTop + plotH * (1.0 - Math.min(500.0, fit) / 500.0);

    // Temperature degradation curve (Amber)
    ctx.beginPath();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    for (let t = tMin; t <= tMax; t += 5) {
      const ea = 0.65;
      const kb = 8.617e-5;
      const accel = Math.exp((-ea / kb) * (1.0 / (t + 273.15) - 1.0 / 298.15));
      const fit = Math.min(500.0, 1.8 * 64 * accel * 0.05);
      const x = getX(t);
      const y = getY(fit);
      if (t === tMin) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('85°C', getX(85), height - padBottom + 16);
    ctx.fillText('105°C', getX(105), height - padBottom + 16);
    ctx.fillText('125°C', getX(125), height - padBottom + 16);
    ctx.fillText('135°C (Tj)', getX(135), height - padBottom + 16);

    ctx.textAlign = 'left';
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(
      isZh ? '■ Arrhenius 接面溫度熱活化失效率加速曲線 (Ea = 0.65 eV)' : '■ Arrhenius Thermal Acceleration vs Junction Temp (Ea = 0.65 eV)',
      padLeft + 10,
      padTop - 12
    );
  }

  ctx.restore();
}

/**
 * Initialize Automotive HBM4 Scrubbing Simulator DOM bindings
 * @param {string} rootSelector
 */
export function initAutomotiveHbm4Simulator(rootSelector = '#auto-hbm4-scrubbing-simulator-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const missionSelect = root.querySelector('#hbm4-scrub-mission-select');
  const repairSelect = root.querySelector('#hbm4-scrub-repair-select');
  const tempSlider = root.querySelector('#hbm4-scrub-temp-slider');
  const periodSlider = root.querySelector('#hbm4-scrub-period-slider');
  const densitySlider = root.querySelector('#hbm4-scrub-density-slider');

  const tempVal = root.querySelector('#hbm4-scrub-temp-val');
  const periodVal = root.querySelector('#hbm4-scrub-period-val');
  const densityVal = root.querySelector('#hbm4-scrub-density-val');

  const outRawFit = root.querySelector('#hbm4-scrub-out-raw-fit');
  const outResFit = root.querySelector('#hbm4-scrub-out-res-fit');
  const outSpfm = root.querySelector('#hbm4-scrub-out-spfm');
  const outHppr = root.querySelector('#hbm4-scrub-out-hppr');
  const outRating = root.querySelector('#hbm4-scrub-out-rating');
  const outVerdict = root.querySelector('#hbm4-scrub-out-verdict');

  const canvas = root.querySelector('#hbm4-scrub-canvas');
  const modeScrubBtn = root.querySelector('#hbm4-scrub-mode-interval');
  const modeTempBtn = root.querySelector('#hbm4-scrub-mode-temp');

  let currentMode = 'scrubbing_period_vs_residual_fit';

  function update() {
    const isZh = document.documentElement.lang.startsWith('zh');
    const missionId = missionSelect ? missionSelect.value : 'l4_robotaxi_extreme';
    const repairArchId = repairSelect ? repairSelect.value : 'hybrid_tier_scrubbing';
    const junctionTempC = tempSlider ? parseFloat(tempSlider.value) : 115.0;
    const scrubbingPeriodSec = periodSlider ? parseFloat(periodSlider.value) : 1.0;
    const stackDensityGb = densitySlider ? parseInt(densitySlider.value, 10) : 64;

    // Dynamic select option localization
    if (missionSelect) {
      Array.from(missionSelect.options).forEach(opt => {
        const item = AUTOMOTIVE_MISSION_PRESETS[opt.value];
        if (item) opt.textContent = isZh ? item.nameZh : item.nameEn;
      });
    }
    if (repairSelect) {
      Array.from(repairSelect.options).forEach(opt => {
        const item = REPAIR_ARCHITECTURES[opt.value];
        if (item) opt.textContent = isZh ? item.nameZh : item.nameEn;
      });
    }

    if (tempVal) tempVal.textContent = `${junctionTempC.toFixed(0)} °C`;
    if (periodVal) periodVal.textContent = `${scrubbingPeriodSec.toFixed(2)} s`;
    if (densityVal) densityVal.textContent = `${stackDensityGb} GB`;

    if (tempSlider) tempSlider.setAttribute('aria-valuetext', `${junctionTempC.toFixed(0)} °C`);
    if (periodSlider) periodSlider.setAttribute('aria-valuetext', `${scrubbingPeriodSec.toFixed(2)} s`);
    if (densitySlider) densitySlider.setAttribute('aria-valuetext', `${stackDensityGb} GB`);

    const metrics = calculateAutomotiveHbm4Metrics({
      missionId,
      repairArchId,
      junctionTempC,
      scrubbingPeriodSec,
      stackDensityGb
    });

    if (outRawFit) outRawFit.textContent = `${metrics.totalRawFailures.toFixed(0)} FIT`;
    if (outResFit) outResFit.textContent = `${metrics.totalResidualFit.toFixed(2)} FIT`;
    if (outSpfm) outSpfm.textContent = `${metrics.spfmPercent.toFixed(2)} %`;
    if (outHppr) outHppr.textContent = `${metrics.hpprUsagePercent.toFixed(1)}% (${metrics.estimatedBadRowsPerStack} bad rows)`;

    if (outRating) {
      outRating.textContent = metrics.asilRating;
      outRating.style.color = metrics.ratingColor;
    }

    if (outVerdict) {
      outVerdict.textContent = isZh ? metrics.verdictZh : metrics.verdictEn;
    }

    if (canvas) {
      drawAutomotiveHbm4Canvas(canvas, metrics, currentMode, isZh);
    }
  }

  // Handle Preset change
  if (missionSelect) {
    missionSelect.addEventListener('change', () => {
      const preset = AUTOMOTIVE_MISSION_PRESETS[missionSelect.value];
      if (preset) {
        if (tempSlider) tempSlider.value = preset.defaultJunctionTempC;
      }
      update();
    });
  }

  if (repairSelect) repairSelect.addEventListener('change', update);
  if (tempSlider) tempSlider.addEventListener('input', update);
  if (periodSlider) periodSlider.addEventListener('input', update);
  if (densitySlider) densitySlider.addEventListener('input', update);

  if (modeScrubBtn && modeTempBtn) {
    modeScrubBtn.addEventListener('click', () => {
      currentMode = 'scrubbing_period_vs_residual_fit';
      modeScrubBtn.classList.add('active');
      modeScrubBtn.setAttribute('aria-pressed', 'true');
      modeTempBtn.classList.remove('active');
      modeTempBtn.setAttribute('aria-pressed', 'false');
      modeScrubBtn.style.background = '#0284c7';
      modeScrubBtn.style.borderColor = '#38bdf8';
      modeScrubBtn.style.color = '#ffffff';
      modeTempBtn.style.background = '#1e293b';
      modeTempBtn.style.borderColor = '#475569';
      modeTempBtn.style.color = '#94a3b8';
      update();
    });

    modeTempBtn.addEventListener('click', () => {
      currentMode = 'junction_temp_mission_lifetime';
      modeTempBtn.classList.add('active');
      modeTempBtn.setAttribute('aria-pressed', 'true');
      modeScrubBtn.classList.remove('active');
      modeScrubBtn.setAttribute('aria-pressed', 'false');
      modeTempBtn.style.background = '#0284c7';
      modeTempBtn.style.borderColor = '#38bdf8';
      modeTempBtn.style.color = '#ffffff';
      modeScrubBtn.style.background = '#1e293b';
      modeScrubBtn.style.borderColor = '#475569';
      modeScrubBtn.style.color = '#94a3b8';
      update();
    });
  }

  // Language mutation observer
  const observer = new MutationObserver(() => update());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  window.addEventListener('resize', update);
    window.addEventListener('hub:language-change', () => update());
  window.addEventListener('languagechange', () => update());
  window.addEventListener('resize', () => update());
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAutomotiveHbm4Simulator());
  } else {
    initAutomotiveHbm4Simulator();
  }
}
