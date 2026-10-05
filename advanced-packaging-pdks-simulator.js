/**
 * @file advanced-packaging-pdks-simulator.js
 * @description First-principles simulator for Advanced Packaging PDKs (TSMC CoWoS-S/L/R, SoIC,
 * Samsung I-Cube/X-Cube, Intel Foveros), Die-to-Die (D2D) interconnect RC latency,
 * micro-bump vs. hybrid-bonding thermal resistance, and Base Die eNVM configuration economics.
 * @version 1.0.0
 * @license MIT
 */

/**
 * @typedef {Object} PackagingPreset
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {string} foundry
 * @property {string} packagingClass - '2.5D_Si_Interposer' | '2.5D_Si_Bridge' | '3D_Hybrid_Bond' | '2.5D_RDL'
 * @property {number} lineSpaceUm - Metal line width & space (um)
 * @property {number} bumpPitchUm - Interconnect contact pitch (um)
 * @property {number} maxHbmCount - Supported HBM stack count (4 - 16)
 * @property {number} baseThermalResistanceKW - Equivalent package thermal resistance (K/W)
 * @property {number} defaultTraceLenMm - Typical D2D trace length (mm)
 * @property {string} probeCardVendor - Key in probe card ecosystem
 * @property {string} descZh
 * @property {string} descEn
 */

/**
 * Standard Advanced Packaging System Presets
 * @type {Record<string, PackagingPreset>}
 */
export const PACKAGING_PRESETS = {
  tsmc_cowos_s_hbm: {
    id: 'tsmc_cowos_s_hbm',
    nameZh: 'TSMC CoWoS-S 2.5D (矽中介層 · HBM4 + AI SoC)',
    nameEn: 'TSMC CoWoS-S 2.5D (Silicon Interposer · HBM4 + SoC)',
    foundry: 'TSMC',
    packagingClass: '2.5D_Si_Interposer',
    lineSpaceUm: 0.4,
    bumpPitchUm: 25.0,
    maxHbmCount: 8,
    baseThermalResistanceKW: 0.18,
    defaultTraceLenMm: 3.5,
    probeCardVendor: 'mpi_taiwan',
    descZh: '台積電經典晶圓級矽中介層 (CoWoS-S)，微米級 0.4/0.4 µm 密集金屬走線，支援 8~12 顆 HBM4 高頻寬互連。',
    descEn: 'TSMC flagship wafer-level passive silicon interposer, 0.4/0.4 µm fine metal lines, supporting up to 12 HBM4 stacks.'
  },
  tsmc_cowos_l_chiplet: {
    id: 'tsmc_cowos_l_chiplet',
    nameZh: 'TSMC CoWoS-L 2.5D (局部矽橋 LSI + 模封中介層)',
    nameEn: 'TSMC CoWoS-L 2.5D (Local Silicon Interconnect LSI Bridge)',
    foundry: 'TSMC',
    packagingClass: '2.5D_Si_Bridge',
    lineSpaceUm: 0.8,
    bumpPitchUm: 20.0,
    maxHbmCount: 8,
    baseThermalResistanceKW: 0.14,
    defaultTraceLenMm: 2.2,
    probeCardVendor: 'chpt_taiwan',
    descZh: '採局部嵌入式高密度矽橋 (LSI) 與有機模封重佈線 (RDL)，面積可超越 3.3 倍光罩極限 (Reticle Size)，兼顧成本與訊號完整度。',
    descEn: 'Embedded Local Silicon Interconnect (LSI) bridges inside organic mold, exceeding 3.3x reticle size for massive AI XPUs.'
  },
  tsmc_soic_x_3d: {
    id: 'tsmc_soic_x_3d',
    nameZh: 'TSMC SoIC-X 3D (晶圓級銅-銅直接混合鍵合)',
    nameEn: 'TSMC SoIC-X 3D (Cu-Cu Direct Wafer Hybrid Bonding)',
    foundry: 'TSMC',
    packagingClass: '3D_Hybrid_Bond',
    lineSpaceUm: 0.2,
    bumpPitchUm: 1.0,
    maxHbmCount: 16,
    baseThermalResistanceKW: 0.03,
    defaultTraceLenMm: 0.05,
    probeCardVendor: 'chpt_taiwan',
    descZh: '無微凸塊 (Bumpless) 銅-銅晶圓直接鍵合，微間距 1µm，垂直熱阻趨近於純銅，TSV 延遲降至皮秒 (ps) 等級。',
    descEn: 'Bumpless Cu-Cu direct hybrid bonding with 1µm pitch; vertical thermal resistance approaches bulk copper with sub-ps TSV latency.'
  },
  samsung_icube_x_2_5d: {
    id: 'samsung_icube_x_2_5d',
    nameZh: 'Samsung I-CubeS / I-CubeE 2.5D (三星先進中介層)',
    nameEn: 'Samsung I-CubeS / I-CubeE 2.5D (Samsung Advanced Interposer)',
    foundry: 'Samsung Foundry',
    packagingClass: '2.5D_Si_Interposer',
    lineSpaceUm: 0.5,
    bumpPitchUm: 28.0,
    maxHbmCount: 8,
    baseThermalResistanceKW: 0.20,
    defaultTraceLenMm: 3.8,
    probeCardVendor: 'technoprobe',
    descZh: '三星晶圓代工高階中介層封裝，整合三星自家 HBM4 與邏輯代工晶片，晶圓測試由三星代工測試生態主導。',
    descEn: 'Samsung Foundry advanced interposer packaging, integrating in-house HBM4 and logic dies with foundry-led test procurement.'
  },
  intel_foveros_direct_3d: {
    id: 'intel_foveros_direct_3d',
    nameZh: 'Intel Foveros Direct 3D (次世代銅對銅直接鍵合)',
    nameEn: 'Intel Foveros Direct 3D (Direct Cu-Cu Hybrid Bonding)',
    foundry: 'Intel Foundry',
    packagingClass: '3D_Hybrid_Bond',
    lineSpaceUm: 0.25,
    bumpPitchUm: 1.2,
    maxHbmCount: 12,
    baseThermalResistanceKW: 0.035,
    defaultTraceLenMm: 0.06,
    probeCardVendor: 'formfactor',
    descZh: '英特爾次世代 3D 堆疊工藝，接點間距 <2µm，實現超高互連密度與極致低接觸熱阻。',
    descEn: 'Intel next-gen 3D stacking with <2µm pitch, providing massive interconnect density and ultra-low contact thermal resistance.'
  }
};

/**
 * Calculate first-principles D2D interconnect parasitics, thermal resistance, and probe testability
 * @param {Object} params
 * @param {string} params.presetId
 * @param {number} params.traceLengthMm - D2D bus trace length (mm)
 * @param {number} params.diePowerWatts - Total thermal power on die stack (W)
 * @param {number} params.dataRateGbps - Per-lane D2D data rate (Gbps)
 * @returns {Object} Calculated metrics
 */
export function calculatePackagingPdkMetrics({
  presetId = 'tsmc_cowos_s_hbm',
  traceLengthMm = 3.5,
  diePowerWatts = 450.0,
  dataRateGbps = 8.0
}) {
  const preset = PACKAGING_PRESETS[presetId] || PACKAGING_PRESETS.tsmc_cowos_s_hbm;

  // 1. Interconnect Density
  const pitchUm = preset.bumpPitchUm;
  const interconnectDensityPerMm2 = Math.round(1e6 / (pitchUm * pitchUm));

  // 2. D2D Interconnect Resistance & Capacitance (First Principles)
  // Fine-pitch metal line: Cu resistivity with barrier/scattering rho = 2.2e-8 ohm-m
  const is3D = preset.packagingClass === '3D_Hybrid_Bond';
  const effectiveTraceMm = is3D ? Math.min(0.2, traceLengthMm * 0.02) : traceLengthMm;
  const traceLengthM = effectiveTraceMm * 1e-3;

  // Line resistance per mm: R_unit = rho / (width * thickness)
  // For CoWoS-S (0.4um L/S, t=0.8um): R_unit ~ 68 ohm/mm
  // For SoIC Cu-Cu (1um pitch TSV): R_unit ~ 2.5 ohm/mm
  const rUnitOhmPerMm = is3D ? 3.2 : (22.0 / (preset.lineSpaceUm * 0.8));
  const rTraceOhm = rUnitOhmPerMm * effectiveTraceMm;

  // Line capacitance per mm: C_unit ~ 0.15 pF/mm (dielectric eps_r = 3.9)
  const cUnitPfPerMm = is3D ? 0.025 : 0.165;
  const cTraceFarads = (cUnitPfPerMm * effectiveTraceMm) * 1e-12;

  // D2D Propagation Delay: tau = 0.5 * R_trace * C_trace + R_driver * (C_trace + C_load)
  const rDriverOhm = 45.0; // standard inverter driver
  const cLoadFarads = (is3D ? 5.0 : 40.0) * 1e-15; // femtofarads
  const tauSec = 0.5 * rTraceOhm * cTraceFarads + rDriverOhm * (cTraceFarads + cLoadFarads);
  const tauPicoSec = Math.max(0.5, tauSec * 1e12);

  // Maximum Eye Bandwidth (Gbps per line): limited by 1 / (2.2 * tau)
  const maxChannelBwGbps = Math.min(64.0, (1.0 / (2.5 * Math.max(1e-12, tauSec))) * 1e-9);

  // 3. Thermal Stack Resistance & Junction Temperature Rise
  // Effective thermal resistance (K/W)
  const effectiveThetaKW = preset.baseThermalResistanceKW;
  const junctionTempRiseC = diePowerWatts * effectiveThetaKW;

  // 4. Base Die eNVM Configuration & Calibration Role
  // Required calibration OTP budget:
  // - Chiplet UID & Crypto RoT: 4 Kb
  // - 2048-bit PHY Skew Trimming & Phase Align: 8 Kb
  // - Dynamic Thermal Management & TDP Limit Table: 4 Kb
  // - Redundancy Row/TSV Remap Tables: 16 Kb
  const totalEnvmBudgetKb = 32;

  // 5. Testability and Probe Ecosystem Status
  let testRating = 'QUALIFIED';
  let ratingColor = '#10b981';

  if (junctionTempRiseC > 85.0) {
    testRating = 'THERMAL THROTTLING RISK';
    ratingColor = '#ef4444';
  } else if (is3D && pitchUm <= 1.0) {
    testRating = 'SUB-MICRON 3D BENCHMARK';
    ratingColor = '#06b6d4';
  } else if (tauPicoSec > 80.0) {
    testRating = 'HIGH D2D LATENCY PENALTY';
    ratingColor = '#f59e0b';
  }

  // Bilingual verdicts
  const isZh = typeof document !== 'undefined' ? document.documentElement.lang.startsWith('zh') : true;
  let verdictZh = '';
  let verdictEn = '';

  if (is3D) {
    verdictZh = `在 ${preset.foundry} ${preset.nameZh.split(' ')[1]} 3D 鍵合下，無微凸塊直接接觸使垂直熱阻降至 ${effectiveThetaKW} K/W，在 ${diePowerWatts}W 超高熱負載下接面溫升僅 ${junctionTempRiseC.toFixed(1)}°C！D2D 互連延遲僅 ${tauPicoSec.toFixed(1)} ps，單線頻寬上限飆升至 ${maxChannelBwGbps.toFixed(1)} Gbps。Base Die 需搭載 ${totalEnvmBudgetKb} Kb 0-mask AntiFuse OTP 進行 2048-bit PHY 偏斜與熱管理鎖定。`;
    verdictEn = `Under ${preset.foundry} 3D bonding, bumpless direct contact slashes thermal resistance to ${effectiveThetaKW} K/W, yielding only ${junctionTempRiseC.toFixed(1)}°C temp rise under ${diePowerWatts}W thermal load! D2D latency is just ${tauPicoSec.toFixed(1)} ps with line bandwidth reaching ${maxChannelBwGbps.toFixed(1)} Gbps. Base die requires ${totalEnvmBudgetKb} Kb 0-mask AntiFuse OTP for PHY skew and thermal calibration.`;
  } else {
    verdictZh = `在 ${preset.foundry} ${preset.nameZh.split(' ')[1]} 2.5D 中介層下，走線長度 ${traceLengthMm}mm 引發 ${tauPicoSec.toFixed(1)} ps 傳輸延遲與 ${rTraceOhm.toFixed(1)}Ω 導線電阻；微凸塊界面熱阻使接面溫升達 ${junctionTempRiseC.toFixed(1)}°C。晶圓測試需倚賴高針數高頻 MEMS 探針卡（旺矽/精測/Technoprobe）進行多晶粒 KGD 篩選。`;
    verdictEn = `Under ${preset.foundry} 2.5D interposer, ${traceLengthMm}mm trace length introduces ${tauPicoSec.toFixed(1)} ps delay and ${rTraceOhm.toFixed(1)}Ω line resistance; micro-bump thermal resistance drives ${junctionTempRiseC.toFixed(1)}°C temp rise. Wafer sort requires high-pin MEMS probe cards (MPI/CHPT/Technoprobe) for multi-die KGD screening.`;
  }

  return {
    preset,
    effectiveTraceMm,
    interconnectDensityPerMm2,
    rTraceOhm,
    cTraceFarads,
    tauPicoSec,
    maxChannelBwGbps,
    effectiveThetaKW,
    junctionTempRiseC,
    totalEnvmBudgetKb,
    testRating,
    ratingColor,
    verdictZh,
    verdictEn
  };
}

/**
 * Draw interactive dual-mode simulation visualization on HTML5 Canvas
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'interconnect_latency_bandwidth'|'thermal_stack_junction_temp'|'thermal_resistance_gradient'} mode
 * @param {boolean} [isZh=true]
 */
export function drawPackagingCanvas(canvas, metrics, mode = 'interconnect_latency_bandwidth', isZh = true) {
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

  if (mode === 'interconnect_latency_bandwidth') {
    // Mode 1: Interconnect Class Comparison Bar Chart (Delay ps vs Bandwidth Gbps)
    const candidates = [
      { name: 'CoWoS-S (2.5D)', tau: 42.0, bw: 18.0, color: '#38bdf8' },
      { name: 'CoWoS-L (LSI)', tau: 28.0, bw: 24.0, color: '#818cf8' },
      { name: 'SoIC-X (3D)', tau: 3.2, bw: 55.0, color: '#06b6d4' },
      { name: 'I-Cube (2.5D)', tau: 45.0, bw: 16.0, color: '#f59e0b' },
      { name: 'Foveros (3D)', tau: 4.1, bw: 52.0, color: '#c084fc' }
    ];

    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText('60 ps', padLeft - 8, padTop + 4);
    ctx.fillText('45 ps', padLeft - 8, padTop + plotH * 0.25 + 4);
    ctx.fillText('30 ps', padLeft - 8, padTop + plotH * 0.50 + 4);
    ctx.fillText('15 ps', padLeft - 8, padTop + plotH * 0.75 + 4);
    ctx.fillText('0 ps', padLeft - 8, padTop + plotH + 4);

    const barW = Math.min(42, plotW / 6);
    candidates.forEach((c, idx) => {
      const x = padLeft + (plotW / 5) * idx + (plotW / 5 - barW) / 2;
      const barH = (c.tau / 60.0) * plotH;
      const y = padTop + plotH - barH;

      ctx.fillStyle = c.color;
      ctx.fillRect(x, y, barW, barH);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.strokeRect(x, y, barW, barH);

      // Value label on top
      ctx.font = '700 10.5px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(`${c.tau}ps`, x + barW / 2, y - 6);

      // Name & Bandwidth below
      ctx.font = '600 9.5px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(c.name.split(' ')[0], x + barW / 2, height - padBottom + 16);
      ctx.fillStyle = '#06b6d4';
      ctx.fillText(`${c.bw}G`, x + barW / 2, height - padBottom + 28);
    });

    ctx.textAlign = 'left';
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(
      isZh ? '■ D2D 傳輸延遲 (ps) 與單線頻寬 (Gbps/wire) 對比' : '■ D2D Interconnect Latency (ps) vs Bandwidth (Gbps/wire)',
      padLeft + 10,
      padTop - 12
    );

  } else {
    // Mode 2: Power (100W to 800W) vs Junction Temp Rise (C)
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText('120°C', padLeft - 8, padTop + 4);
    ctx.fillText('90°C', padLeft - 8, padTop + plotH * 0.25 + 4);
    ctx.fillText('60°C', padLeft - 8, padTop + plotH * 0.50 + 4);
    ctx.fillText('30°C', padLeft - 8, padTop + plotH * 0.75 + 4);
    ctx.fillText('0°C', padLeft - 8, padTop + plotH + 4);

    const pMin = 100;
    const pMax = 800;
    const maxTemp = 120.0;
    const getX = p => padLeft + plotW * ((p - pMin) / (pMax - pMin));
    const getY = t => padTop + plotH * (1.0 - Math.min(maxTemp, t) / maxTemp);

    // Thermal throttling safety limit at 85°C
    const yLimit = getY(85.0);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(padLeft, yLimit);
    ctx.lineTo(padLeft + plotW, yLimit);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '700 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'right';
    ctx.fillText(
      isZh ? '85°C 散熱降頻門檻 (Thermal Throttling Limit)' : '85°C Thermal Throttling Limit',
      padLeft + plotW - 10,
      yLimit - 6
    );

    // 2.5D Micro-bump Curve (Red)
    ctx.beginPath();
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 2.4;
    for (let p = pMin; p <= pMax; p += 50) {
      const t = p * 0.18;
      const x = getX(p);
      const y = getY(t);
      if (p === pMin) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 3D Hybrid Bonding Curve (Cyan)
    ctx.beginPath();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.6;
    for (let p = pMin; p <= pMax; p += 50) {
      const t = p * 0.03;
      const x = getX(p);
      const y = getY(t);
      if (p === pMin) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('200W', getX(200), height - padBottom + 16);
    ctx.fillText('500W', getX(500), height - padBottom + 16);
    ctx.fillText('800W (Die Power)', getX(800), height - padBottom + 16);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#f87171';
    ctx.fillText(
      isZh ? '--- 2.5D 傳統微凸塊 (0.18 K/W)' : '--- 2.5D Micro-bump (0.18 K/W)',
      padLeft + 10,
      padTop - 12
    );
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(
      isZh ? '— 3D Cu-Cu 混合鍵合 (0.03 K/W)' : '— 3D Cu-Cu Hybrid Bonding (0.03 K/W)',
      padLeft + 220,
      padTop - 12
    );
  }

  ctx.restore();
}

/**
 * Initialize Advanced Packaging PDK Simulator DOM bindings
 * @param {string} rootSelector
 */
export function initPackagingPdkSimulator(rootSelector = '#advanced-packaging-simulator-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const presetSelect = root.querySelector('#pkg-preset-select');
  const traceSlider = root.querySelector('#pkg-trace-slider');
  const powerSlider = root.querySelector('#pkg-power-slider');
  const rateSlider = root.querySelector('#pkg-rate-slider');

  const traceVal = root.querySelector('#pkg-trace-val');
  const powerVal = root.querySelector('#pkg-power-val');
  const rateVal = root.querySelector('#pkg-rate-val');

  const outLatency = root.querySelector('#pkg-out-latency');
  const outBandwidth = root.querySelector('#pkg-out-bw');
  const outTemp = root.querySelector('#pkg-out-temp');
  const outEnvm = root.querySelector('#pkg-out-envm');
  const outRating = root.querySelector('#pkg-out-rating');
  const outVerdict = root.querySelector('#pkg-out-verdict');

  const canvas = root.querySelector('#pkg-canvas');
  const modeLatencyBtn = root.querySelector('#pkg-mode-latency');
  const modeThermalBtn = root.querySelector('#pkg-mode-thermal');

  let currentMode = 'interconnect_latency_bandwidth';

  function update() {
    const isZh = document.documentElement.lang.startsWith('zh');
    const presetId = presetSelect ? presetSelect.value : 'tsmc_cowos_s_hbm';
    const traceLengthMm = traceSlider ? parseFloat(traceSlider.value) : 3.5;
    const diePowerWatts = powerSlider ? parseFloat(powerSlider.value) : 450.0;
    const dataRateGbps = rateSlider ? parseFloat(rateSlider.value) : 8.0;

    // Dynamic select option localization
    if (presetSelect) {
      Array.from(presetSelect.options).forEach(opt => {
        const item = PACKAGING_PRESETS[opt.value];
        if (item) opt.textContent = isZh ? item.nameZh : item.nameEn;
      });
    }

    if (traceVal) traceVal.textContent = `${traceLengthMm.toFixed(1)} mm`;
    if (powerVal) powerVal.textContent = `${diePowerWatts.toFixed(0)} W`;
    if (rateVal) rateVal.textContent = `${dataRateGbps.toFixed(1)} Gbps`;

    if (traceSlider) traceSlider.setAttribute('aria-valuetext', `${traceLengthMm.toFixed(1)} mm`);
    if (powerSlider) powerSlider.setAttribute('aria-valuetext', `${diePowerWatts.toFixed(0)} W`);
    if (rateSlider) rateSlider.setAttribute('aria-valuetext', `${dataRateGbps.toFixed(1)} Gbps`);

    const metrics = calculatePackagingPdkMetrics({
      presetId,
      traceLengthMm,
      diePowerWatts,
      dataRateGbps
    });

    if (outLatency) outLatency.textContent = `${metrics.tauPicoSec.toFixed(1)} ps`;
    if (outBandwidth) outBandwidth.textContent = `${metrics.maxChannelBwGbps.toFixed(1)} Gbps/wire`;
    if (outTemp) outTemp.textContent = `+${metrics.junctionTempRiseC.toFixed(1)} °C (${metrics.effectiveThetaKW} K/W)`;
    if (outEnvm) outEnvm.textContent = `${metrics.totalEnvmBudgetKb} Kb OTP`;

    if (outRating) {
      outRating.textContent = metrics.testRating;
      outRating.style.color = metrics.ratingColor;
    }

    if (outVerdict) {
      outVerdict.textContent = isZh ? metrics.verdictZh : metrics.verdictEn;
    }

    if (canvas) {
      drawPackagingCanvas(canvas, metrics, currentMode, isZh);
    }
  }

  // Handle Preset change
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const preset = PACKAGING_PRESETS[presetSelect.value];
      if (preset) {
        if (traceSlider) traceSlider.value = preset.defaultTraceLenMm;
      }
      update();
    });
  }

  if (traceSlider) traceSlider.addEventListener('input', update);
  if (powerSlider) powerSlider.addEventListener('input', update);
  if (rateSlider) rateSlider.addEventListener('input', update);

  if (modeLatencyBtn && modeThermalBtn) {
    modeLatencyBtn.addEventListener('click', () => {
      currentMode = 'interconnect_latency_bandwidth';
      modeLatencyBtn.classList.add('active');
      modeLatencyBtn.setAttribute('aria-pressed', 'true');
      modeThermalBtn.classList.remove('active');
      modeThermalBtn.setAttribute('aria-pressed', 'false');
      modeLatencyBtn.style.background = '#0284c7';
      modeLatencyBtn.style.borderColor = '#38bdf8';
      modeLatencyBtn.style.color = '#ffffff';
      modeThermalBtn.style.background = '#1e293b';
      modeThermalBtn.style.borderColor = '#475569';
      modeThermalBtn.style.color = '#94a3b8';
      update();
    });

    modeThermalBtn.addEventListener('click', () => {
      currentMode = 'thermal_resistance_gradient';
      modeThermalBtn.classList.add('active');
      modeThermalBtn.setAttribute('aria-pressed', 'true');
      modeLatencyBtn.classList.remove('active');
      modeLatencyBtn.setAttribute('aria-pressed', 'false');
      modeThermalBtn.style.background = '#0284c7';
      modeThermalBtn.style.borderColor = '#38bdf8';
      modeThermalBtn.style.color = '#ffffff';
      modeLatencyBtn.style.background = '#1e293b';
      modeLatencyBtn.style.borderColor = '#475569';
      modeLatencyBtn.style.color = '#94a3b8';
      update();
    });
  }

  // Language mutation observer
  const observer = new MutationObserver(() => update());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  window.addEventListener('resize', update);
  update();
}

export { drawPackagingCanvas as drawPackagingPdkCanvas };

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initPackagingPdkSimulator());
  } else {
    initPackagingPdkSimulator();
  }
}
