/**
 * @file deep-space-sel-retention-simulator.js
 * @description First-principles simulator for Deep Space exploration missions, evaluating Heavy Ion
 * Single Event Latchup (SEL) immunity threshold, high-temperature (up to 460°C) Arrhenius data retention,
 * and 20-year extreme mission lifetime degradation.
 * @version 1.0.0
 * @license MIT
 */

/**
 * @typedef {Object} DeepSpaceMissionPreset
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {number} targetTempC - Mission operating temperature (°C)
 * @property {number} peakLetMev - Cosmic ray / solar flare peak heavy ion LET (MeV*cm2/mg)
 * @property {number} missionYears - Mission design duration (years)
 * @property {string} descZh
 * @property {string} descEn
 */

/**
 * @typedef {Object} DeepSpaceTechProfile
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {number} letThreshold - Critical LET threshold for SEL onset (MeV*cm2/mg)
 * @property {number} satCrossSection - Saturated SEL cross-section (cm2/device)
 * @property {number} activationEnergyEv - Arrhenius thermal retention activation energy (eV)
 * @property {number} maxSafeTempC - Maximum continuous operating temperature limit (°C)
 * @property {number} baseRetentionYears125C - Retention at 125°C qualification point (years)
 * @property {boolean} isImmuneToSel - Architectural immunity to parasitic PNPN latchup
 * @property {string} physicsZh
 * @property {string} physicsEn
 */

/**
 * Standard Deep Space mission profile presets
 * @type {Record<string, DeepSpaceMissionPreset>}
 */
export const DEEP_SPACE_MISSION_PRESETS = {
  venus_lander_460c: {
    id: 'venus_lander_460c',
    nameZh: '金星地表著陸探測器 (Venus Lander 460°C)',
    nameEn: 'Venus Surface Lander (460°C Extreme)',
    targetTempC: 460.0,
    peakLetMev: 75.0,
    missionYears: 1.0, // Short duration due to brutal atmospheric conditions
    descZh: '金星地表 460°C 超臨界高溫、92 bar 壓力與無磁層防護之高能宇宙射線環境。',
    descEn: 'Venus surface 460°C supercritical heat, 92 bar pressure, and unshielded cosmic heavy ions.'
  },
  jupiter_europa_belt: {
    id: 'jupiter_europa_belt',
    nameZh: '木衛二歐羅巴強輻射帶探測 (Europa Clipper)',
    nameEn: 'Europa Deep Radiation Belt (Jovian Magnetosphere)',
    targetTempC: -140.0,
    peakLetMev: 85.0,
    missionYears: 10.0,
    descZh: '木星磁層捕捉之高能重離子與相對論性電子暴，峰值重離子 LET 高達 85 MeV*cm2/mg。',
    descEn: 'Jovian trapped relativistic electrons and heavy ions with peak LET up to 85 MeV*cm2/mg.'
  },
  artemis_lunar_20yr: {
    id: 'artemis_lunar_20yr',
    nameZh: '阿提米絲月球永久極地基地 (Artemis 20-Year Base)',
    nameEn: 'Artemis Lunar South Pole Base (20-Year Life)',
    targetTempC: 110.0,
    peakLetMev: 60.0,
    missionYears: 20.0,
    descZh: '月球南極永久基地，20 年長期任務，日夜溫差 -180°C ~ +125°C 與太陽質子事件 (SPE)。',
    descEn: 'Lunar permanent habitat, 20-year life, -180°C to +125°C thermal swings and solar flares.'
  },
  downhole_geothermal_300c: {
    id: 'downhole_geothermal_300c',
    nameZh: '深層地熱探勘與天體採樣鑽具 (Geothermal 300°C)',
    nameEn: 'Deep Geothermal & Astrobiology Drill (300°C)',
    targetTempC: 300.0,
    peakLetMev: 40.0,
    missionYears: 5.0,
    descZh: '300°C 井下地熱超高溫、劇烈震動與中子通量，要求極高數據留存活化能。',
    descEn: '300°C downhole geothermal heat and severe vibration demanding high activation energy.'
  }
};

/**
 * Deep Space memory technology profiles
 * @type {Record<string, DeepSpaceTechProfile>}
 */
export const DEEP_SPACE_TECH_PROFILES = {
  antifuse_soi_radhard: {
    id: 'antifuse_soi_radhard',
    nameZh: 'AntiFuse on SOI (介電隔離完全免疫 SEL / 450°C 導電微絲)',
    nameEn: 'AntiFuse on SOI (Dielectric SEL-Immune / 450°C Filament)',
    letThreshold: 100.0, // Immune > 100 MeV*cm2/mg
    satCrossSection: 0.0,
    activationEnergyEv: 2.10, // Extreme activation energy of metallic/silicided filament
    maxSafeTempC: 475.0,
    baseRetentionYears125C: 1000.0,
    isImmuneToSel: true,
    physicsZh: '埋氧層 (BOX) 徹底截斷體矽寄生 PNPN 閘流管迴路，完全免疫 SEL；微絲具超高活化能 (2.1 eV)。',
    physicsEn: 'Buried oxide (BOX) isolates parasitic PNPN thyristors, zero SEL; filament has 2.1 eV activation energy.'
  },
  sic_widebandgap_envm: {
    id: 'sic_widebandgap_envm',
    nameZh: 'SiC 寬能隙耐高溫 eNVM (4H-SiC 500°C 極限架構)',
    nameEn: 'SiC Wide-Bandgap eNVM (4H-SiC 500°C Platform)',
    letThreshold: 90.0,
    satCrossSection: 1e-7,
    activationEnergyEv: 2.40,
    maxSafeTempC: 500.0,
    baseRetentionYears125C: 5000.0,
    isImmuneToSel: true,
    physicsZh: '3.26 eV 超寬能隙使高溫本質載子濃度極低，耐受 500°C 連續工作與極高重離子撞擊。',
    physicsEn: '3.26 eV wide bandgap maintains minimal intrinsic carrier density at 500°C with severe ion resilience.'
  },
  radhard_stt_mram: {
    id: 'radhard_stt_mram',
    nameZh: '航太強化 STT-MRAM (垂直磁穿隧 MTJ / 居禮溫度限制)',
    nameEn: 'Rad-Hard STT-MRAM (Perpendicular MTJ / Curie Bound)',
    letThreshold: 45.0,
    satCrossSection: 5e-5,
    activationEnergyEv: 1.35,
    maxSafeTempC: 220.0, // Magnetic state flips as T approaches Curie temp
    baseRetentionYears125C: 25.0,
    isImmuneToSel: false,
    physicsZh: '純自旋磁矩無介電電荷流失，但高溫逼近居禮溫度 (Tc) 導致熱擾動翻轉；體矽結構有微弱 SEL 風險。',
    physicsEn: 'Spin magnetic storage has no charge loss, but heat near Curie temp flips bits; bulk CMOS has SEL risk.'
  },
  bulk_cmos_eflash: {
    id: 'bulk_cmos_eflash',
    nameZh: '常規 Bulk CMOS eFlash (浮閘/電荷陷阱 / 易引發破壞性 SEL)',
    nameEn: 'Commercial Bulk CMOS eFlash (Charge Trap / Catastrophic SEL)',
    letThreshold: 14.0, // Vulnerable to heavy ions
    satCrossSection: 1e-3,
    activationEnergyEv: 1.10,
    maxSafeTempC: 150.0,
    baseRetentionYears125C: 10.0,
    isImmuneToSel: false,
    physicsZh: '體矽三阱結構存在寄生 SCR 通路，高溫大幅提高雙極增益使 SEL 劇烈惡化；>200°C 電荷秒級漏失。',
    physicsEn: 'Bulk triple-well has parasitic SCR paths; high temp amplifies bipolar gain triggering SEL burn-out.'
  }
};

/**
 * Constants for Deep Space physics
 */
export const DEEP_SPACE_CONSTANTS = {
  BOLTZMANN_EV: 8.617333262145e-5, // eV/K
  WEIBULL_WIDTH_W: 25.0, // Weibull slope parameter for SEL cross-section
  WEIBULL_EXPONENT_S: 2.2
};

/**
 * Calculate Deep Space heavy-ion SEL immunity, Arrhenius retention, and 20-year survival
 * @param {Object} params
 * @param {string} params.presetId
 * @param {string} params.techId
 * @param {number} params.targetTempC
 * @param {number} params.peakLetMev
 * @param {number} params.missionYears
 * @returns {Object} Comprehensive calculation metrics
 */
export function calculateDeepSpaceMetrics({
  presetId = 'venus_lander_460c',
  techId = 'antifuse_soi_radhard',
  targetTempC = 460.0,
  peakLetMev = 75.0,
  missionYears = 1.0
} = {}) {
  const preset = DEEP_SPACE_MISSION_PRESETS[presetId] || DEEP_SPACE_MISSION_PRESETS.venus_lander_460c;
  const tech = DEEP_SPACE_TECH_PROFILES[techId] || DEEP_SPACE_TECH_PROFILES.antifuse_soi_radhard;

  // 1. Single Event Latchup (SEL) Cross-Section Calculation
  // sigma_SEL = sigma_sat * [ 1 - exp( -((LET - LET_th) / W)^s ) ]
  let selCrossSection = 0.0;
  let selMarginMev = tech.letThreshold - peakLetMev;
  let isSelLatching = false;

  if (tech.isImmuneToSel || peakLetMev <= tech.letThreshold) {
    selCrossSection = 0.0;
    isSelLatching = false;
  } else {
    isSelLatching = true;
    const deltaLet = peakLetMev - tech.letThreshold;
    const weibullTerm = Math.pow(deltaLet / DEEP_SPACE_CONSTANTS.WEIBULL_WIDTH_W, DEEP_SPACE_CONSTANTS.WEIBULL_EXPONENT_S);
    selCrossSection = tech.satCrossSection * (1.0 - Math.exp(-weibullTerm));
  }

  // 2. High-Temperature Arrhenius Data Retention Calculation
  // T in Kelvin
  const tempK = Math.max(1.0, targetTempC + 273.15);
  const refTempK = 125.0 + 273.15; // 125°C ref

  // Acceleration Factor AF = exp[ (Ea / k) * (1/T_ref - 1/T) ]
  // Retention(T) = BaseRetention(125°C) / AF
  const arrheniusExponent = (tech.activationEnergyEv / DEEP_SPACE_CONSTANTS.BOLTZMANN_EV) * ((1.0 / refTempK) - (1.0 / tempK));
  const accelerationFactor = Math.exp(Math.max(-50, Math.min(50, arrheniusExponent)));
  const estimatedRetentionYears = tech.baseRetentionYears125C / Math.max(1e-12, accelerationFactor);

  // 3. Mission Lifetime Survival Probability (Poisson/Weibull decay)
  // Fraction remaining after missionYears: R(t) = exp( - missionYears / tau_retention )
  let retentionSurvPct = 100.0;
  if (estimatedRetentionYears < missionYears) {
    retentionSurvPct = Math.max(0.0, Math.exp(-missionYears / estimatedRetentionYears) * 100.0);
  } else {
    retentionSurvPct = Math.min(100.0, (1.0 - (missionYears / (estimatedRetentionYears * 2.0))) * 100.0);
  }

  // Check temperature safety boundary
  const isThermalExceeded = targetTempC > tech.maxSafeTempC;

  // 4. Overall Aerospace & Deep Space Rating
  let rating = 'NASA Class-S Deep Space Certified';
  let ratingColor = '#10b981';
  let verdictZh = '';
  let verdictEn = '';

  if (isSelLatching || isThermalExceeded || estimatedRetentionYears < (missionYears * 0.5)) {
    rating = 'Mission Fatal Failure Unqualified';
    ratingColor = '#ef4444';
    verdictZh = `致死故障：在 ${targetTempC}°C 及峰值 LET ${peakLetMev} MeV·cm²/mg 下，${isSelLatching ? '引發破壞性重離子單粒子閂鎖 (SEL 燒毀)！' : ''}${isThermalExceeded ? ` 超過架構耐溫極限 (${tech.maxSafeTempC}°C)！` : ''} 數據留存崩塌至 ${estimatedRetentionYears < 0.01 ? '<0.01' : estimatedRetentionYears.toFixed(2)} 年。`;
    verdictEn = `Fatal Failure: Under ${targetTempC}°C and LET ${peakLetMev} MeV·cm²/mg, ${isSelLatching ? 'catastrophic Heavy-Ion SEL burnout triggered!' : ''}${isThermalExceeded ? ` Exceeds safe temp limit (${tech.maxSafeTempC}°C)!` : ''} Data retention collapses to ${estimatedRetentionYears < 0.01 ? '<0.01' : estimatedRetentionYears.toFixed(2)} yrs.`;
  } else if (selMarginMev < 15.0 || estimatedRetentionYears < (missionYears * 2.0)) {
    rating = 'Planetary Marginal Clearance';
    ratingColor = '#f59e0b';
    verdictZh = `邊界合規：重離子閂鎖安全餘裕 ${selMarginMev.toFixed(1)} MeV·cm²/mg 偏低，留存壽命 ${estimatedRetentionYears.toFixed(1)} 年高於任務期 (${missionYears} 年)，具備行星任務邊界通行資格但需監控。`;
    verdictEn = `Marginal Clearance: SEL threshold margin ${selMarginMev.toFixed(1)} MeV·cm²/mg is narrow; retention ${estimatedRetentionYears.toFixed(1)} yrs clears mission (${missionYears} yrs). Recommend radiation mitigation.`;
  } else {
    rating = 'NASA Class-S Deep Space Certified';
    ratingColor = '#10b981';
    verdictZh = `頂級航太：具備完全介電隔離或超寬能隙，免疫重離子 SEL (閾值 > ${tech.letThreshold} MeV·cm²/mg)。高活化能 (${tech.activationEnergyEv} eV) 保障在 ${targetTempC}°C 下數據留存達 ${estimatedRetentionYears >= 100 ? '>100' : estimatedRetentionYears.toFixed(1)} 年，完美通過 ${missionYears} 年深空任務。`;
    verdictEn = `NASA Class-S: Complete dielectric/wide-bandgap SEL immunity (threshold > ${tech.letThreshold} MeV·cm²/mg). High activation energy (${tech.activationEnergyEv} eV) ensures ${estimatedRetentionYears >= 100 ? '>100' : estimatedRetentionYears.toFixed(1)} yrs retention at ${targetTempC}°C, fully surviving ${missionYears}-yr mission.`;
  }

  return {
    preset,
    tech,
    targetTempC,
    peakLetMev,
    missionYears,
    selCrossSection,
    selMarginMev,
    isSelLatching,
    accelerationFactor,
    estimatedRetentionYears,
    retentionSurvPct,
    isThermalExceeded,
    rating,
    ratingColor,
    verdictZh,
    verdictEn
  };
}

/**
 * Draw Deep Space SEL and High-Temp Arrhenius Canvas
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'sel_cross_section_let' | 'arrhenius_high_temp_retention'} mode
 */
export function drawDeepSpaceCanvas(canvas, metrics, mode = 'sel_cross_section_let') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.width || 480;
  const height = rect.height || canvas.height || 200;

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }
  ctx.save();
  ctx.scale(dpr, dpr);

  // Background
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#060d17';
  ctx.fillRect(0, 0, width, height);

  const padLeft = 52;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const y = padTop + (plotH / 4) * i;
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
  }
  for (let i = 0; i <= 4; i++) {
    const x = padLeft + (plotW / 4) * i;
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + plotH);
  }
  ctx.stroke();

  if (mode === 'sel_cross_section_let') {
    // Mode 1: Heavy Ion LET (0 to 100 MeV*cm2/mg) vs SEL Cross Section
    const letMin = 0.0;
    const letMax = 100.0;

    // Draw curve
    ctx.strokeStyle = metrics.tech.isImmuneToSel ? '#10b981' : '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let xPix = 0; xPix <= plotW; xPix++) {
      const letVal = letMin + (xPix / plotW) * (letMax - letMin);
      let sigmaNorm = 0.0;

      if (!metrics.tech.isImmuneToSel && letVal > metrics.tech.letThreshold) {
        const deltaLet = letVal - metrics.tech.letThreshold;
        const weibullTerm = Math.pow(deltaLet / DEEP_SPACE_CONSTANTS.WEIBULL_WIDTH_W, DEEP_SPACE_CONSTANTS.WEIBULL_EXPONENT_S);
        sigmaNorm = 1.0 - Math.exp(-weibullTerm); // 0 to 1 normalized
      }

      const yPix = padTop + plotH * (1.0 - sigmaNorm);
      if (xPix === 0) ctx.moveTo(padLeft + xPix, yPix);
      else ctx.lineTo(padLeft + xPix, yPix);
    }
    ctx.stroke();

    // Mark current mission LET vertical line
    const xCurrent = padLeft + ((metrics.peakLetMev - letMin) / (letMax - letMin)) * plotW;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(xCurrent, padTop);
    ctx.lineTo(xCurrent, padTop + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Mark current point
    let currentSigmaNorm = 0.0;
    if (!metrics.tech.isImmuneToSel && metrics.peakLetMev > metrics.tech.letThreshold) {
      const deltaLet = metrics.peakLetMev - metrics.tech.letThreshold;
      const weibullTerm = Math.pow(deltaLet / DEEP_SPACE_CONSTANTS.WEIBULL_WIDTH_W, DEEP_SPACE_CONSTANTS.WEIBULL_EXPONENT_S);
      currentSigmaNorm = 1.0 - Math.exp(-weibullTerm);
    }
    const yCurrent = padTop + plotH * (1.0 - currentSigmaNorm);

    ctx.fillStyle = metrics.isSelLatching ? '#ef4444' : '#10b981';
    ctx.beginPath();
    ctx.arc(xCurrent, yCurrent, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text labels
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('0', padLeft, height - 10);
    ctx.fillText('50 MeV', padLeft + plotW * 0.5 - 16, height - 10);
    ctx.fillText('100 MeV·cm²/mg', padLeft + plotW - 74, height - 10);

    ctx.fillStyle = metrics.tech.isImmuneToSel ? '#10b981' : '#f43f5e';
    ctx.fillText(metrics.tech.isImmuneToSel ? 'Immune: SEL Cross Section = 0' : `SEL Threshold: ${metrics.tech.letThreshold} MeV·cm²/mg`, padLeft + 6, padTop + 14);

  } else {
    // Mode 2: Temperature (-50°C to 475°C) vs Arrhenius Retention Years (Log scale 0.001 to 1000 yrs)
    const tMin = -50.0;
    const tMax = 475.0;

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const getLogNormY = (years) => {
      // Log10 span from -3 (0.001 yr = ~8 hrs) to 4 (10,000 yrs) -> total 7 decades
      const clamped = Math.max(0.001, Math.min(10000.0, years));
      const logVal = Math.log10(clamped); // -3 to 4
      return (logVal - (-3.0)) / 7.0; // 0 to 1
    };

    for (let xPix = 0; xPix <= plotW; xPix++) {
      const t = tMin + (xPix / plotW) * (tMax - tMin);
      const tK = Math.max(1.0, t + 273.15);
      const refK = 125.0 + 273.15;
      const expTerm = (metrics.tech.activationEnergyEv / DEEP_SPACE_CONSTANTS.BOLTZMANN_EV) * ((1.0 / refK) - (1.0 / tK));
      const af = Math.exp(Math.max(-50, Math.min(50, expTerm)));
      const retYrs = metrics.tech.baseRetentionYears125C / Math.max(1e-12, af);

      const normY = getLogNormY(retYrs);
      const yPix = padTop + plotH * (1.0 - normY);
      if (xPix === 0) ctx.moveTo(padLeft + xPix, yPix);
      else ctx.lineTo(padLeft + xPix, yPix);
    }
    ctx.stroke();

    // Mission line (e.g. 20 years line)
    const missionNormY = getLogNormY(metrics.missionYears);
    const missionY = padTop + plotH * (1.0 - missionNormY);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, missionY);
    ctx.lineTo(padLeft + plotW, missionY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current operating point
    const currentX = padLeft + ((metrics.targetTempC - tMin) / (tMax - tMin)) * plotW;
    const currentNormY = getLogNormY(metrics.estimatedRetentionYears);
    const currentY = padTop + plotH * (1.0 - currentNormY);

    ctx.fillStyle = metrics.estimatedRetentionYears >= metrics.missionYears ? '#10b981' : '#ef4444';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('-50°C', padLeft, height - 10);
    ctx.fillText('200°C', padLeft + plotW * 0.47, height - 10);
    ctx.fillText('460°C (Venus)', padLeft + plotW - 74, height - 10);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`Mission: ${metrics.missionYears} yrs | Retention @ ${metrics.targetTempC}°C: ${metrics.estimatedRetentionYears >= 100 ? '>100' : metrics.estimatedRetentionYears.toFixed(2)} yrs`, padLeft + 6, padTop + 14);
  }

  ctx.restore();
}

/**
 * Initialize Deep Space SEL and High-Temp simulator DOM bindings
 * @param {string} rootSelector
 */
export function initDeepSpaceSimulator(rootSelector = '#deep-space-simulator-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const presetSelect = root.querySelector('#deep-space-preset-select');
  const techSelect = root.querySelector('#deep-space-tech-select');
  const tempSlider = root.querySelector('#deep-space-temp-slider');
  const letSlider = root.querySelector('#deep-space-let-slider');
  const missionSlider = root.querySelector('#deep-space-mission-slider');

  const tempVal = root.querySelector('#deep-space-temp-val');
  const letVal = root.querySelector('#deep-space-let-val');
  const missionVal = root.querySelector('#deep-space-mission-val');

  const outSelStatus = root.querySelector('#deep-space-out-sel');
  const outRetention = root.querySelector('#deep-space-out-retention');
  const outSurvival = root.querySelector('#deep-space-out-survival');
  const outEa = root.querySelector('#deep-space-out-ea');
  const outRating = root.querySelector('#deep-space-out-rating');
  const outVerdict = root.querySelector('#deep-space-out-verdict');

  const canvas = root.querySelector('#deep-space-canvas');
  const modeSelBtn = root.querySelector('#deep-space-mode-sel');
  const modeTempBtn = root.querySelector('#deep-space-mode-temp');

  let currentMode = 'sel_cross_section_let';

  function update() {
    const isZh = document.documentElement.lang.startsWith('zh');
    const presetId = presetSelect ? presetSelect.value : 'venus_lander_460c';
    const techId = techSelect ? techSelect.value : 'antifuse_soi_radhard';
    const targetTempC = tempSlider ? parseFloat(tempSlider.value) : 460.0;
    const peakLetMev = letSlider ? parseFloat(letSlider.value) : 75.0;
    const missionYears = missionSlider ? parseFloat(missionSlider.value) : 1.0;

    if (tempVal) tempVal.textContent = `${targetTempC} °C`;
    if (letVal) letVal.textContent = `${peakLetMev} MeV·cm²/mg`;
    if (missionVal) missionVal.textContent = `${missionYears} yr`;

    if (tempSlider) tempSlider.setAttribute('aria-valuetext', `${targetTempC}°C`);
    if (letSlider) letSlider.setAttribute('aria-valuetext', `${peakLetMev} MeV*cm2/mg`);
    if (missionSlider) missionSlider.setAttribute('aria-valuetext', `${missionYears} yr`);

    const metrics = calculateDeepSpaceMetrics({
      presetId,
      techId,
      targetTempC,
      peakLetMev,
      missionYears
    });

    if (outSelStatus) {
      if (metrics.tech.isImmuneToSel) {
        outSelStatus.textContent = isZh ? '完全免疫 (SOI)' : 'Immune (SOI)';
        outSelStatus.style.color = '#10b981';
      } else if (metrics.isSelLatching) {
        outSelStatus.textContent = isZh ? '發生閂鎖 (致命)' : 'Latching (Fatal)';
        outSelStatus.style.color = '#ef4444';
      } else {
        outSelStatus.textContent = `${metrics.selMarginMev.toFixed(0)} MeV margin`;
        outSelStatus.style.color = '#f59e0b';
      }
    }

    if (outRetention) {
      outRetention.textContent = `${metrics.estimatedRetentionYears >= 100 ? '>100' : metrics.estimatedRetentionYears.toFixed(2)} yr`;
    }

    if (outSurvival) {
      outSurvival.textContent = `${metrics.retentionSurvPct.toFixed(1)} %`;
      outSurvival.style.color = metrics.retentionSurvPct > 90 ? '#10b981' : (metrics.retentionSurvPct > 50 ? '#f59e0b' : '#ef4444');
    }

    if (outEa) {
      outEa.textContent = `${metrics.tech.activationEnergyEv.toFixed(2)} eV`;
    }

    if (outRating) {
      outRating.textContent = metrics.rating;
      outRating.style.color = metrics.ratingColor;
    }

    if (outVerdict) {
      outVerdict.textContent = isZh ? metrics.verdictZh : metrics.verdictEn;
    }

    if (canvas) {
      drawDeepSpaceCanvas(canvas, metrics, currentMode);
    }
  }

  if (presetSelect) presetSelect.addEventListener('change', () => {
    const preset = DEEP_SPACE_MISSION_PRESETS[presetSelect.value];
    if (preset) {
      if (tempSlider) tempSlider.value = preset.targetTempC;
      if (letSlider) letSlider.value = preset.peakLetMev;
      if (missionSlider) missionSlider.value = preset.missionYears;
    }
    update();
  });

  if (techSelect) techSelect.addEventListener('change', update);
  if (tempSlider) tempSlider.addEventListener('input', update);
  if (letSlider) letSlider.addEventListener('input', update);
  if (missionSlider) missionSlider.addEventListener('input', update);

  if (modeSelBtn && modeTempBtn) {
    modeSelBtn.addEventListener('click', () => {
      currentMode = 'sel_cross_section_let';
      modeSelBtn.classList.add('active');
      modeSelBtn.setAttribute('aria-pressed', 'true');
      modeTempBtn.classList.remove('active');
      modeTempBtn.setAttribute('aria-pressed', 'false');
      modeSelBtn.style.background = '#0284c7';
      modeSelBtn.style.borderColor = '#38bdf8';
      modeSelBtn.style.color = '#ffffff';
      modeTempBtn.style.background = '#1e293b';
      modeTempBtn.style.borderColor = '#475569';
      modeTempBtn.style.color = '#94a3b8';
      update();
    });

    modeTempBtn.addEventListener('click', () => {
      currentMode = 'arrhenius_high_temp_retention';
      modeTempBtn.classList.add('active');
      modeTempBtn.setAttribute('aria-pressed', 'true');
      modeSelBtn.classList.remove('active');
      modeSelBtn.setAttribute('aria-pressed', 'false');
      modeTempBtn.style.background = '#0284c7';
      modeTempBtn.style.borderColor = '#38bdf8';
      modeTempBtn.style.color = '#ffffff';
      modeSelBtn.style.background = '#1e293b';
      modeSelBtn.style.borderColor = '#475569';
      modeSelBtn.style.color = '#94a3b8';
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
    document.addEventListener('DOMContentLoaded', () => initDeepSpaceSimulator());
  } else {
    initDeepSpaceSimulator();
  }
}
