import {syncMetricCopy} from './模型數值複製.js';

/**
 * @file deep-space-sel-retention-simulator.js
 * @description 深空環境教學模型；SEL、活化能、高溫與保持時間配置均為假設，非產品規格或認證。
 * 模型內符合條件不代表實際任務存活；NASA SiC JFET-R NVRAM 開發目標不支持本表 AntiFuse 數值。
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
 * @property {boolean} isImmuneToSel - 相容欄位；表示模型將 SEL 截面積設為零的假設
 * @property {string} physicsZh
 * @property {string} physicsEn
 */

/**
 * 深空與高溫任務教學情境；全部數值為既有假設，不是具名任務規格。
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
    nameZh: 'AntiFuse on SOI（零 SEL／450°C 情境假設）',
    nameEn: 'AntiFuse on SOI (Assumed Zero SEL / 450°C Scenario)',
    letThreshold: 100.0, // 教學假設，非實測 SEL 門檻
    satCrossSection: 0.0,
    activationEnergyEv: 2.10, // 教學假設，非特定微絲的量測活化能
    maxSafeTempC: 475.0,
    baseRetentionYears125C: 1000.0,
    isImmuneToSel: true,
    physicsZh: '教學假設：SEL 截面積設為零，保持模型採 2.1 eV、125°C 時 1000 年與 475°C 溫度界線；均非 AntiFuse 產品量測或太空認證。',
    physicsEn: 'Teaching assumptions: zero SEL cross-section, 2.1 eV activation energy, 1000 years at 125°C, and a 475°C model boundary; not AntiFuse measurements or space qualification.'
  },
  sic_widebandgap_envm: {
    id: 'sic_widebandgap_envm',
    nameZh: 'SiC 寬能隙 eNVM（500°C 教學情境）',
    nameEn: 'SiC Wide-Bandgap eNVM (500°C Teaching Scenario)',
    letThreshold: 90.0,
    satCrossSection: 1e-7,
    activationEnergyEv: 2.40,
    maxSafeTempC: 500.0,
    baseRetentionYears125C: 5000.0,
    isImmuneToSel: true,
    physicsZh: 'SiC 寬能隙提供高溫元件研究背景；本模型的零 SEL、2.4 eV 保持活化能、125°C 時 5000 年及 500°C 界線都是教學假設，不能由材料能隙推定。',
    physicsEn: 'SiC wide bandgap motivates high-temperature device research. Zero SEL, 2.4 eV retention activation energy, 5000 years at 125°C, and the 500°C boundary are teaching assumptions, not consequences established by bandgap alone.'
  },
  radhard_stt_mram: {
    id: 'radhard_stt_mram',
    nameZh: 'STT-MRAM（磁性保持／SEL 教學情境）',
    nameEn: 'STT-MRAM (Magnetic Retention / SEL Teaching Scenario)',
    letThreshold: 45.0,
    satCrossSection: 5e-5,
    activationEnergyEv: 1.35,
    maxSafeTempC: 220.0, // 教學溫度界線，不代表特定材料居禮溫度
    baseRetentionYears125C: 25.0,
    isImmuneToSel: false,
    physicsZh: '磁性保持與周邊 SEL 需依具體實作量測；本表 1.35 eV、125°C 時 25 年、220°C 界線與 SEL 參數僅為教學假設。',
    physicsEn: 'Magnetic retention and peripheral SEL require implementation-specific measurements. The 1.35 eV value, 25 years at 125°C, 220°C boundary, and SEL parameters are teaching assumptions.'
  },
  bulk_cmos_eflash: {
    id: 'bulk_cmos_eflash',
    nameZh: 'Bulk CMOS eFlash（電荷保持／SEL 教學情境）',
    nameEn: 'Bulk CMOS eFlash (Charge Retention / SEL Teaching Scenario)',
    letThreshold: 14.0, // Vulnerable to heavy ions
    satCrossSection: 1e-3,
    activationEnergyEv: 1.10,
    maxSafeTempC: 150.0,
    baseRetentionYears125C: 10.0,
    isImmuneToSel: false,
    physicsZh: '電荷保持與寄生閂鎖路徑依製程與設計而異；本表 1.1 eV、125°C 時 10 年、150°C 界線及 SEL 參數是教學假設，不預測特定晶片燒毀。',
    physicsEn: 'Charge retention and parasitic latchup paths vary by process and design. The 1.1 eV value, 10 years at 125°C, 150°C boundary, and SEL parameters are teaching assumptions, not a prediction of device burnout.'
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

  // 3. 教學指數衰減；不包含整體任務或系統可靠度。
  // Fraction remaining after missionYears: R(t) = exp( - missionYears / tau_retention )
  const retentionSurvPct = Math.exp(-Math.max(0, missionYears) / estimatedRetentionYears) * 100.0;

  // Check temperature safety boundary
  const isThermalExceeded = targetTempC > tech.maxSafeTempC;

  // 4. 僅依既有教學條件分類，不產生任務資格或認證。
  let rating = 'Within Model Conditions';
  let ratingColor = '#10b981';
  let verdictZh = '';
  let verdictEn = '';

  if (isSelLatching || isThermalExceeded || estimatedRetentionYears < (missionYears * 0.5)) {
    rating = 'Outside Model Conditions';
    ratingColor = '#ef4444';
    verdictZh = `超出模型條件：${targetTempC}°C、LET ${peakLetMev} MeV·cm²/mg 下，${isSelLatching ? '計算得到非零 SEL 截面積；' : ''}${isThermalExceeded ? `超出假設溫度界線 ${tech.maxSafeTempC}°C；` : ''}保持時間估計為 ${estimatedRetentionYears < 0.01 ? '<0.01' : estimatedRetentionYears.toFixed(2)} 年。這是教學參數的結果，不代表已發生閂鎖、晶片毀壞或任務失敗。`;
    verdictEn = `Outside model conditions at ${targetTempC}°C and LET ${peakLetMev} MeV·cm²/mg: ${isSelLatching ? 'nonzero modeled SEL cross-section; ' : ''}${isThermalExceeded ? `above the assumed ${tech.maxSafeTempC}°C boundary; ` : ''}estimated retention ${estimatedRetentionYears < 0.01 ? '<0.01' : estimatedRetentionYears.toFixed(2)} yrs. Teaching assumptions do not establish an actual latchup, device destruction, or mission failure.`;
  } else if (selMarginMev < 15.0 || estimatedRetentionYears < (missionYears * 2.0)) {
    rating = 'Near Model Boundary';
    ratingColor = '#f59e0b';
    verdictZh = `接近模型邊界：假設 SEL 門檻餘裕 ${selMarginMev.toFixed(1)} MeV·cm²/mg，保持時間估計 ${estimatedRetentionYears.toFixed(1)} 年，輸入任務期 ${missionYears} 年。此分類不代表保持時間必定涵蓋任務期，也不構成認證。`;
    verdictEn = `Near model boundary: assumed SEL threshold margin ${selMarginMev.toFixed(1)} MeV·cm²/mg, estimated retention ${estimatedRetentionYears.toFixed(1)} yrs, requested mission ${missionYears} yrs. This category does not guarantee retention through the mission or establish qualification.`;
  } else {
    rating = 'Within Model Conditions';
    ratingColor = '#10b981';
    verdictZh = `模型內符合條件：以假設活化能 ${tech.activationEnergyEv} eV 計算，在 ${targetTempC}°C 的保持時間估計為 ${estimatedRetentionYears >= 100 ? '>100' : estimatedRetentionYears.toFixed(1)} 年，輸入任務期 ${missionYears} 年。零 SEL 計算值受預設或門檻模型控制，不代表物理免疫、任務保證或 NASA 認證。`;
    verdictEn = `Within model conditions: assumed activation energy ${tech.activationEnergyEv} eV gives estimated retention ${estimatedRetentionYears >= 100 ? '>100' : estimatedRetentionYears.toFixed(1)} yrs at ${targetTempC}°C for a requested ${missionYears}-yr mission. Zero modeled SEL follows a preset or threshold; it does not establish physical immunity, mission assurance, or NASA certification.`;
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
    const isZh = (window.HubLanguage?.get() || document.documentElement.lang || 'en').startsWith('zh');
    ctx.fillText(metrics.tech.isImmuneToSel
      ? (isZh ? '模型假設：SEL 截面積 = 0' : 'Model Assumption: SEL Cross Section = 0')
      : `${isZh ? '假設 SEL 門檻' : 'Assumed SEL Threshold'}: ${metrics.tech.letThreshold} MeV·cm²/mg`, padLeft + 6, padTop + 14);

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
    const isZh = (window.HubLanguage?.get() || document.documentElement.lang || 'en').startsWith('zh');
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
        outSelStatus.textContent = isZh ? '零 SEL（模型假設）' : 'Zero SEL (Model Assumption)';
        outSelStatus.style.color = '#10b981';
      } else if (metrics.isSelLatching) {
        outSelStatus.textContent = isZh ? '非零 SEL 截面積（模型）' : 'Nonzero SEL Cross Section (Model)';
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
      outRating.textContent = isZh ? ({
        'Within Model Conditions': '模型內符合條件',
        'Near Model Boundary': '接近模型邊界',
        'Outside Model Conditions': '超出模型條件'
      }[metrics.rating] || metrics.rating) : metrics.rating;
      outRating.style.color = metrics.ratingColor;
    }

    if (outVerdict) {
      outVerdict.textContent = isZh ? metrics.verdictZh : metrics.verdictEn;
    }

    if (canvas) {
      drawDeepSpaceCanvas(canvas, metrics, currentMode);
    }

    // 複製狀態獨立呈現，不改動模型數值。
    syncMetricCopy([outSelStatus, outRetention, outSurvival, outEa, outRating]);
    const exportControl=root.querySelector('#deep-space-export-csv-btn');
    if (exportControl) {
      const chinese=(window.HubLanguage?.get() || document.documentElement.lang || 'en').startsWith('zh');
      exportControl.textContent=chinese ? '📥 匯出深空輻照與存活率 CSV' : '📥 Export Deep Space CSV';
      exportControl.setAttribute('aria-label',chinese ? '匯出深空單一事件閂鎖 (SEL) 門檻與數據留存率資料集為 CSV 檔案' : 'Export deep space SEL threshold and retention dataset as CSV file');
    }
  }

  // Export CSV Action for Deep Space Radiation & Retention
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

  const presetContainer = presetSelect?.parentNode;
  if (presetContainer && !presetContainer.querySelector('#deep-space-export-csv-btn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'deep-space-export-csv-btn';
    exportBtn.type = 'button';
    exportBtn.style.cssText = 'margin-top: 6px; padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.4); background: rgba(15, 23, 42, 0.6); color: #38bdf8; cursor: pointer;';
    const isZhLang = (window.HubLanguage?.get() || document.documentElement.dataset.language || document.documentElement.lang || 'zh').startsWith('zh');
    exportBtn.textContent = isZhLang ? '📥 匯出深空輻照與存活率 CSV' : '📥 Export Deep Space CSV';
    exportBtn.setAttribute('aria-label', isZhLang ? '匯出深空單一事件閂鎖 (SEL) 門檻與數據留存率資料集為 CSV 檔案' : 'Export deep space SEL threshold and retention dataset as CSV file');
    exportBtn.addEventListener('click', () => {
      const pid = presetSelect ? presetSelect.value : 'venus_lander_460c';
      const tid = techSelect ? techSelect.value : 'antifuse_soi_radhard';
      const missionY = missionSlider ? parseFloat(missionSlider.value) : 10.0;
      let csv = 'Temp_C,PeakLET_MeVcm2mg,MissionYears,SelImmune,SelMargin_MeV,EstimatedRetention_Years,SurvivalPct,Ea_eV\n';
      const testTemps = [-140, -55, 25, 85, 125, 200, 300, 460];
      for (const t of testTemps) {
        for (let letVal = 10; letVal <= 100; letVal += 15) {
          const m = calculateDeepSpaceMetrics({
            presetId: pid,
            techId: tid,
            targetTempC: t,
            peakLetMev: letVal,
            missionYears: missionY
          });
          csv += `${t},${letVal},${missionY},${m.tech.isImmuneToSel ? 'YES' : 'NO'},${m.selMarginMev.toFixed(1)},${m.estimatedRetentionYears.toFixed(2)},${m.retentionSurvPct.toFixed(1)},${m.tech.activationEnergyEv.toFixed(2)}\n`;
        }
      }
      downloadCsv(`deep_space_rad_${pid}_${tid}.csv`, csv);
    });
    presetContainer.appendChild(exportBtn);
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
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initDeepSpaceSimulator());
  } else {
    initDeepSpaceSimulator();
  }
}
