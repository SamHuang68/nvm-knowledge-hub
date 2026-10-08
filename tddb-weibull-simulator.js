import { syncMetricCopy } from './模型數值複製.js';

/**
 * TDDB／Weibull 教學試算：保留既有係數、情境與面積／佔空比近似。
 * 輸出不是具名產品規格、HTOL 實測、AEC-Q100 或 JESD85 資格驗證。
 * 各加速係數尚未綁定目標製程量測；結論只適用於所選假設。
 */

'use strict';

export const TDDB_PRESETS = Object.freeze({
  automotive_read_disturb_28nm: {
    id: 'automotive_read_disturb_28nm',
    nameEn: 'Automotive Read-Stress Scenario (28nm target, 150°C Tj, 0.75V)',
    nameZh: '車用讀取應力試算（28nm 目標、150°C Tj、0.75V）',
    toxNm: 2.8,
    voxV: 0.75,
    tempC: 150,
    modelId: 'e_model',
    arraySizeKey: '64_kb',
    dutyCycleKey: 'array_multiplexed',
    descriptionEn: 'Illustrates 15-year read stress at a 150°C junction temperature; temperature grade and qualification require separate evidence.',
    descriptionZh: '在 150°C 接面溫度假設下試算 15 年讀取應力；溫度分級與資格驗證須另有證據。',
  },
  antifuse_hard_breakdown_write: {
    id: 'antifuse_hard_breakdown_write',
    nameEn: 'AntiFuse Transient Hard Breakdown Write (28nm, 125°C, 7.2V)',
    nameZh: 'AntiFuse 瞬態高壓硬擊穿編程 (28nm, 125°C, 7.2V)',
    toxNm: 2.4,
    voxV: 7.2,
    tempC: 125,
    modelId: 'inv_e_model',
    arraySizeKey: '1_bit',
    dutyCycleKey: 'dc_continuous',
    descriptionEn: 'Illustrative high-field pulse; the model estimates breakdown probability, not filament morphology or programming yield.',
    descriptionZh: '高電場脈衝示意；模型估算擊穿機率，不推定微絲形貌或編程良率。',
  },
  iot_lowpower_retention_55nm: {
    id: 'iot_lowpower_retention_55nm',
    nameEn: 'IoT Low-Power Standby Retention (55nm, 85°C, 1.2V)',
    nameZh: '物聯網待機應力情境（55nm 目標、85°C、1.2V）',
    toxNm: 3.2,
    voxV: 1.2,
    tempC: 85,
    modelId: 'e_model',
    arraySizeKey: '1_mb',
    dutyCycleKey: 'standby_retention',
    descriptionEn: '10-year continuous operating lifetime under battery-powered edge microcontroller conditions.',
    descriptionZh: '評估電池供電邊緣微控制器在 85°C、1.2V 供電下連續運作 10 年之巨量陣列可靠度。',
  },
  advanced_gaa_thin_dielectric_3nm: {
    id: 'advanced_gaa_thin_dielectric_3nm',
    nameEn: 'Advanced 3nm GAA Ultrathin Dielectric Limit (1.5nm, 105°C, 0.75V)',
    nameZh: '先進 3nm GAA 超薄介電質極限 (1.5nm, 105°C, 0.75V)',
    toxNm: 1.5,
    voxV: 0.75,
    tempC: 105,
    modelId: 'power_law',
    arraySizeKey: '32_mb',
    dutyCycleKey: 'array_multiplexed',
    descriptionEn: 'Sub-2nm high-k dielectric exhibiting reduced Weibull slope (beta ~ 1.05) and severe quantum tunneling.',
    descriptionZh: '次 2nm 高介電常數（High-k）薄膜，展現微觀滲透理論預測之低 Weibull 斜率（beta ~ 1.05）與嚴峻面積縮放效應。',
  },
});

export const ACCELERATION_MODELS = Object.freeze({
  e_model: {
    id: 'e_model',
    nameEn: 'E-Model (Thermochemical Bond Breakage)',
    nameZh: 'E-Model（熱化學化學鍵斷裂模型）',
    formulaLatex: '\\ln(\\eta) = \\ln(t_{\\text{ref}}) - \\gamma (E_{\\text{ox}} - E_{\\text{ref}}) + \\frac{E_a}{k_B} \\left(\\frac{1}{T} - \\frac{1}{T_{\\text{ref}}}\\right)',
    gamma: 4.6, // cm/MV
    ea: 0.88, // eV
    tRefSec: 100.0,
    eRefMvCm: 8.5,
    tempRefK: 398.15, // 125°C
    descriptionEn: 'Standard conservative model for thick dielectrics (>2.5nm) in low-to-medium field regimes (JESD85).',
    descriptionZh: '厚氧化層（>2.5nm）中低電場外推之標準保守模型，廣泛應用於 JEDEC 與車規可靠度評估。',
  },
  inv_e_model: {
    id: 'inv_e_model',
    nameEn: '1/E-Model (Anode Hole Injection)',
    nameZh: '1/E-Model（陽極電洞注入模型）',
    formulaLatex: '\\ln(\\eta) = \\ln(t_{\\text{ref}}) + G \\left(\\frac{1}{E_{\\text{ox}}} - \\frac{1}{E_{\\text{ref}}}\\right) + \\frac{E_a}{k_B} \\left(\\frac{1}{T} - \\frac{1}{T_{\\text{ref}}}\\right)',
    gFactor: 280.0, // MV/cm
    ea: 0.80, // eV
    tRefSec: 50.0,
    eRefMvCm: 11.0,
    tempRefK: 398.15, // 125°C
    descriptionEn: 'Illustrative high-field acceleration model; coefficients require target-process measurements.',
    descriptionZh: '高電場加速模型示意；係數須依目標製程量測確認。',
  },
  power_law: {
    id: 'power_law',
    nameEn: 'Power-Law Model (Ultrathin High-k/Oxide)',
    nameZh: 'Power-Law 伏特模型（超薄介電質）',
    formulaLatex: '\\ln(\\eta) = \\ln(t_{\\text{ref}}) - n \\ln\\left(\\frac{V_{\\text{ox}}}{V_{\\text{ref}}}\\right) + \\frac{E_a}{k_B} \\left(\\frac{1}{T} - \\frac{1}{T_{\\text{ref}}}\\right)',
    nExponent: 36.0,
    ea: 0.85, // eV
    tRefSec: 100.0,
    vRefV: 2.2,
    tempRefK: 378.15, // 105°C
    descriptionEn: 'Illustrative voltage power-law model for ultrathin dielectrics; not calibrated to a named FinFET/GAA process.',
    descriptionZh: '超薄介電質電壓乘冪次示意模型；尚未以具名 FinFET／GAA 製程量測校正。',
  },
});

export const ARRAY_SIZES = Object.freeze({
  '1_bit': { key: '1_bit', bits: 1, nameEn: 'Single Test Device (1 Cell)', nameZh: '單顆測試元件 (1 Cell)' },
  '1_kb': { key: '1_kb', bits: 1024, nameEn: '1 Kbit (Security Key / Trimming)', nameZh: '1 Kbit (安全密鑰 / 校準區塊)' },
  '64_kb': { key: '64_kb', bits: 65536, nameEn: '64 Kbit (Secure Boot / HSM Code)', nameZh: '64 Kbit (安全啟動 / HSM 韌體)' },
  '1_mb': { key: '1_mb', bits: 1048576, nameEn: '1 Mbit (Standard eNVM Macro)', nameZh: '1 Mbit (標準嵌入式 NVM Macro)' },
  '32_mb': { key: '32_mb', bits: 33554432, nameEn: '32 Mbit (High-Density Storage)', nameZh: '32 Mbit (高容量代碼儲存陣列)' },
});

export const STRESS_DUTY_CYCLES = Object.freeze({
  dc_continuous: {
    key: 'dc_continuous',
    factor: 1.0,
    nameEn: '100% Continuous DC Stress (Accelerated Test)',
    nameZh: '100% 連續直流應力 (加速測試)',
  },
  array_multiplexed: {
    key: 'array_multiplexed',
    factor: 0.005, // 0.5% effective row multiplexing
    nameEn: '0.5% Array Multiplexed Read (200:1 Wordline Mux)',
    nameZh: '0.5% 陣列多工讀取 (200:1 字元線分時多工)',
  },
  standby_retention: {
    key: 'standby_retention',
    factor: 0.0001, // 0.01% Ultra-low standby
    nameEn: '0.01% Low-Power Standby (IoT Duty Cycle)',
    nameZh: '0.01% 超低功耗待機 (IoT 週期喚醒)',
  },
});

export const BOLTZMANN_EV = 8.617333262e-5; // eV / K

/**
 * Calculates TDDB and Weibull reliability metrics from first principles.
 *
 * @param {Object} params
 * @param {number} params.toxNm - Dielectric thickness in nanometers (1.2 to 5.0)
 * @param {number} params.voxV - Applied voltage across oxide in Volts (0.4 to 8.5)
 * @param {number} params.tempC - Junction temperature in Celsius (25 to 175)
 * @param {string} params.modelId - Acceleration model ('e_model' | 'inv_e_model' | 'power_law')
 * @param {string} params.arraySizeKey - Array size key ('1_bit' | '1_kb' | '64_kb' | '1_mb' | '32_mb')
 * @param {string} params.dutyCycleKey - Stress duty cycle ('dc_continuous' | 'array_multiplexed' | 'standby_retention')
 * @returns {Object} Reliability inference results, Weibull curve points, and verdict
 */
export function calculateTddbWeibull(params = {}) {
  const tox = Math.max(1.0, Math.min(6.0, Number(params.toxNm) || 2.8));
  const vox = Math.max(0.2, Math.min(10.0, Number(params.voxV) || 0.85));
  const tempC = Math.max(20, Math.min(200, Number(params.tempC) || 150));
  const modelId = params.modelId && ACCELERATION_MODELS[params.modelId] ? params.modelId : 'e_model';
  const model = ACCELERATION_MODELS[modelId];
  const arrayConfig = params.arraySizeKey && ARRAY_SIZES[params.arraySizeKey] ? ARRAY_SIZES[params.arraySizeKey] : ARRAY_SIZES['64_kb'];
  const dutyConfig = params.dutyCycleKey && STRESS_DUTY_CYCLES[params.dutyCycleKey] ? STRESS_DUTY_CYCLES[params.dutyCycleKey] : STRESS_DUTY_CYCLES['array_multiplexed'];

  // 1. Oxide electric field (MV/cm)
  // E_ox = V_ox / (t_ox * 1e-7 cm) / 1e6 = V_ox / (t_ox * 0.1)
  const eoxMvCm = vox / (tox * 0.1);

  // 2. Microscopic percolation Weibull slope beta = c * t_ox
  // In SiO2/HfO2, percolation theory gives c ~ 0.62 nm^-1, bounded by min beta >= 1.05
  const beta = Math.max(1.05, Number((0.62 * tox).toFixed(2)));

  // 3. Absolute temperature in Kelvin & thermal acceleration term
  const tempK = tempC + 273.15;
  const tempFactor = (model.ea / BOLTZMANN_EV) * ((1 / tempK) - (1 / model.tempRefK));

  // 4. Characteristic lifetime eta_cell (seconds) from acceleration model
  let lnEtaSec = 0;
  if (modelId === 'e_model') {
    // ln(eta) = ln(t_ref) - gamma * (Eox - Eref) + tempFactor
    lnEtaSec = Math.log(model.tRefSec) - (model.gamma * (eoxMvCm - model.eRefMvCm)) + tempFactor;
  } else if (modelId === 'inv_e_model') {
    // ln(eta) = ln(t_ref) + G * (1/Eox - 1/Eref) + tempFactor
    const effectiveEox = Math.max(0.5, eoxMvCm);
    lnEtaSec = Math.log(model.tRefSec) + (model.gFactor * ((1 / effectiveEox) - (1 / model.eRefMvCm))) + tempFactor;
  } else if (modelId === 'power_law') {
    // ln(eta) = ln(t_ref) - n * ln(Vox / Vref) + tempFactor
    const safeVox = Math.max(0.1, vox);
    lnEtaSec = Math.log(model.tRefSec) - (model.nExponent * Math.log(safeVox / model.vRefV)) + tempFactor;
  }

  // Bound numerical range to prevent overflow / underflow
  const clampedLnEta = Math.max(-28, Math.min(42, lnEtaSec));
  const etaCellSec = Math.exp(clampedLnEta);
  const etaCellHours = etaCellSec / 3600;

  // 5. Area scaling to full array via weakest-link Poisson statistics:
  // eta_array = eta_cell * N^(-1 / beta)
  const nBits = arrayConfig.bits;
  const etaArraySec = etaCellSec * Math.pow(nBits, -1 / beta);
  const etaArrayHours = etaArraySec / 3600;

  // 6. Cumulative failure probability at target times
  // Target: 15 years = 15 * 365.25 * 24 = 131,490 hours = 4.7336e8 seconds
  // Scaled by duty cycle factor: t_effective = 15_years * duty_factor
  const base15YSec = 15 * 365.25 * 24 * 3600;
  const target15YSec = base15YSec * dutyConfig.factor;
  const target15YHours = target15YSec / 3600;

  // AntiFuse programming pulse = 10 microseconds = 1e-5 seconds (always 100% pulse)
  const pulsePgmSec = 10e-6;

  // Failure probability: F(t) = 1 - exp(-(t / eta_array)^beta)
  const calcF = (tSec, etaSec, b) => {
    if (etaSec <= 0 || !Number.isFinite(etaSec)) return 1.0;
    const ratio = tSec / etaSec;
    if (ratio > 30) return 1.0; // Saturated
    if (ratio < 1e-12) return Math.pow(ratio, b); // Linear Taylor approx for small values
    return 1 - Math.exp(-Math.pow(ratio, b));
  };

  const f15YCell = calcF(target15YSec, etaCellSec, beta);
  const f15YArray = calcF(target15YSec, etaArraySec, beta);
  const fPulsePgm = calcF(pulsePgmSec, etaCellSec, beta);

  // 7. Hazard Rate lambda(t) and FIT Rate (Failures in 10^9 hours)
  // lambda(t) = (beta / eta_hours) * (t_hours / eta_hours)^(beta - 1)
  // FIT = lambda(t) * 1e9
  let fitRate15Y = 0;
  if (etaArrayHours > 0 && Number.isFinite(etaArrayHours)) {
    const ratioHours = target15YHours / etaArrayHours;
    if (ratioHours < 20) {
      const lambdaPerHour = (beta / etaArrayHours) * Math.pow(ratioHours, beta - 1);
      fitRate15Y = Math.min(1e9, lambdaPerHour * 1e9);
    } else {
      fitRate15Y = 1e9; // Saturated failure
    }
  }

  // 8. Human-readable lifetime formatting
  const formatLifetime = (sec) => {
    if (!Number.isFinite(sec) || sec <= 0) return { valEn: '< 1 µs', valZh: '< 1 微秒', numSec: 0 };
    if (sec < 1e-3) return { valEn: `${(sec * 1e6).toFixed(1)} µs`, valZh: `${(sec * 1e6).toFixed(1)} 微秒`, numSec: sec };
    if (sec < 1.0) return { valEn: `${(sec * 1e3).toFixed(1)} ms`, valZh: `${(sec * 1e3).toFixed(1)} 毫秒`, numSec: sec };
    if (sec < 3600) return { valEn: `${sec.toFixed(1)} s`, valZh: `${sec.toFixed(1)} 秒`, numSec: sec };
    const hours = sec / 3600;
    if (hours < 24) return { valEn: `${hours.toFixed(1)} hrs`, valZh: `${hours.toFixed(1)} 小時`, numSec: sec };
    const days = hours / 24;
    if (days < 365) return { valEn: `${days.toFixed(1)} days`, valZh: `${days.toFixed(1)} 天`, numSec: sec };
    const years = days / 365.25;
    if (years < 1e6) return { valEn: `${years >= 1000 ? years.toExponential(2) : years.toFixed(1)} yrs`, valZh: `${years >= 1000 ? years.toExponential(2) : years.toFixed(1)} 年`, numSec: sec };
    return { valEn: `${years.toExponential(2)} yrs`, valZh: `${years.toExponential(2)} 年`, numSec: sec };
  };

  const formattedEtaCell = formatLifetime(etaCellSec);
  const formattedEtaArray = formatLifetime(etaArraySec);

  // 只判讀教學模型區間；門檻不是產品規格或資格驗證要求。
  let verdictStatus;
  let verdictEn;
  let verdictZh;
  const estimateEn = `At the selected ${tempC}°C junction temperature and ${(dutyConfig.factor * 100).toFixed(2)}% stress duty, the illustrative 15-year array failure estimate is ${(f15YArray * 1e6).toPrecision(4)} ppm and the effective-stress-time hazard estimate is ${fitRate15Y.toPrecision(4)} FIT.`;
  const estimateZh = `在所選 ${tempC}°C 接面溫度與 ${(dutyConfig.factor * 100).toFixed(2)}% 應力佔空比下，示意 15 年陣列累積失效試算約 ${(f15YArray * 1e6).toPrecision(4)} ppm，有效應力時間的危險率試算約 ${fitRate15Y.toPrecision(4)} FIT。`;
  if (eoxMvCm >= 12.0 || etaCellSec <= 1e-4) {
    verdictStatus = 'hard_breakdown_active';
    verdictEn = `[High-Field Model Region] Eox ≈ ${eoxMvCm.toFixed(1)} MV/cm and characteristic breakdown time ≈ ${formattedEtaCell.valEn}; the model estimates F(10 µs) ≈ ${(fPulsePgm * 100).toFixed(4)}%. This does not establish filament structure, resistance or programming yield.`;
    verdictZh = `【高電場模型區間】Eox 約 ${eoxMvCm.toFixed(1)} MV/cm，特性擊穿時間約 ${formattedEtaCell.valZh}；模型估算 F(10 微秒) 約 ${(fPulsePgm * 100).toFixed(4)}%。此結果不證明微絲結構、電阻或編程良率。`;
  } else if (f15YArray < 1e-5 && fitRate15Y < 1.0) {
    verdictStatus = 'low_failure_estimate';
    verdictEn = `[Lower Failure Estimate] ${estimateEn} The example comparison thresholds are <10 ppm and <1 FIT; passing them does not establish AEC-Q100 qualification, retention or immunity to read disturb.`;
    verdictZh = `【較低失效試算】${estimateZh}教學比較門檻為 <10 ppm 與 <1 FIT；低於門檻不代表 AEC-Q100 資格驗證、保持或抗讀取擾動已通過。`;
  } else if (f15YArray < 1e-3) {
    verdictStatus = 'intermediate_failure_estimate';
    verdictEn = `[Intermediate Failure Estimate] ${estimateEn} This is a model comparison region, not a consumer or industrial product qualification.`;
    verdictZh = `【中間失效試算】${estimateZh}此為模型比較區間，不是消費級或工業級產品資格判定。`;
  } else {
    verdictStatus = 'higher_failure_estimate';
    verdictEn = `[Higher Failure Estimate] ${estimateEn} Investigate the selected voltage, temperature and acceleration assumptions; the model alone does not establish actual device failure.`;
    verdictZh = `【較高失效試算】${estimateZh}請核對所選偏壓、溫度與加速假設；模型本身不能確立實際元件失效。`;
  }

  // 10. Generate Weibull Plot Series for Canvas
  // X-axis: log10(time in seconds) from 1e-6 (1µs) to 1e10 (317 years)
  // Y-axis: Weibull scale W = ln(-ln(1 - F))
  const curveCell = [];
  const curveArray = [];
  const logMin = -6; // 1 µs
  const logMax = 10; // ~317 years
  const steps = 64;

  for (let i = 0; i <= steps; i++) {
    const logT = logMin + (i / steps) * (logMax - logMin);
    const tSec = Math.pow(10, logT);

    const fCell = calcF(tSec, etaCellSec, beta);
    const fArr = calcF(tSec, etaArraySec, beta);

    // Weibull W = ln(-ln(1 - F))
    // Clamp F to [1e-7, 1 - 1e-7] for valid log math
    const safeFCell = Math.max(1e-7, Math.min(1 - 1e-7, fCell));
    const safeFArr = Math.max(1e-7, Math.min(1 - 1e-7, fArr));

    const wCell = Math.log(-Math.log(1 - safeFCell));
    const wArr = Math.log(-Math.log(1 - safeFArr));

    curveCell.push({ logT, tSec, f: fCell, w: wCell });
    curveArray.push({ logT, tSec, f: fArr, w: wArr });
  }

  return {
    inputs: { tox, vox, tempC, modelId, arraySizeKey: arrayConfig.key, dutyCycleKey: dutyConfig.key },
    metrics: {
      eoxMvCm,
      beta,
      tempK,
      etaCellSec,
      etaCellHours,
      etaArraySec,
      etaArrayHours,
      formattedEtaCell,
      formattedEtaArray,
      f15YCell,
      f15YArray,
      fPulsePgm,
      fitRate15Y,
      nBits,
      dutyFactor: dutyConfig.factor,
    },
    verdict: {
      status: verdictStatus,
      en: verdictEn,
      zh: verdictZh,
    },
    curves: {
      cell: curveCell,
      array: curveArray,
      logMin,
      logMax,
      wMin: -7.0, // F ~ 0.09%
      wMax: 2.0, // F ~ 99.9%
    },
  };
}

/**
 * Renders the interactive Weibull Probability Plot on an HTML5 canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} simData - Return value of calculateTddbWeibull
 * @param {string} lang - 'zh' | 'en'
 */
export function drawWeibullCanvas(canvas, simData, lang = 'zh', hoverPos = null) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  try {
    const dpr = window.devicePixelRatio || 1;

  const rect = canvas.getBoundingClientRect();
  const width = rect.width > 0 ? rect.width : 600;
  // 標示與圖例依實際字寬換列，不截字、不縮減曲線資料。
  const wrap = (text, maxWidth) => {
    const lines = [];
    let line = '';
    for (const character of text) {
      if (line && ctx.measureText(line + character).width > maxWidth) {
        lines.push(line);
        line = character;
      } else line += character;
    }
    if (line) lines.push(line);
    return lines;
  };
  ctx.font = '10px "IBM Plex Mono", monospace';
  const header = [
    {color: '#ea580c', text: lang === 'zh' ? 'AntiFuse 編程窗' : 'AntiFuse Pgm Window'},
    {color: '#059669', text: lang === 'zh' ? '15 年標準' : '15-Year Target'},
  ].flatMap(item => wrap(item.text, width - 16).map(text => ({...item, text})));
  const padLeft = 65, padRight = 20;
  const padTop = 12 + header.length * 14, plotH = 250;
  const plotW = Math.max(1, width - padLeft - padRight);
  const xMilestones = [
    { logT: -6, labelEn: '1 µs', labelZh: '1 微秒' },
    { logT: -3, labelEn: '1 ms', labelZh: '1 毫秒' },
    { logT: 0, labelEn: '1 s', labelZh: '1 秒' },
    { logT: 3.556, labelEn: '1 hr', labelZh: '1 小時' },
    { logT: 7.497, labelEn: '1 yr', labelZh: '1 年' },
    { logT: 8.673, labelEn: '15 yrs', labelZh: '15 年' },
  ];
  const lanes = [];
  xMilestones.forEach(item => {
    const text = lang === 'zh' ? item.labelZh : item.labelEn;
    const textWidth = ctx.measureText(text).width;
    const x = padLeft + (item.logT - simData.curves.logMin) / (simData.curves.logMax - simData.curves.logMin) * plotW;
    item.left = Math.max(4, Math.min(width - textWidth - 4, x - textWidth / 2));
    item.lane = lanes.findIndex(right => right + 6 <= item.left);
    if (item.lane < 0) item.lane = lanes.length;
    lanes[item.lane] = item.left + textWidth;
  });
  const legendY = padTop + plotH + lanes.length * 15 + 12;
  let nextLegendY = legendY + 15;
  const legend = [
    {color: '#2563eb', dashed: false, text: lang === 'zh' ? '單元基準 (1 Cell)' : 'Cell Baseline'},
    {color: '#9333ea', dashed: true, text: lang === 'zh' ? `陣列 (${simData.inputs.arraySizeKey.toUpperCase()})` : `Array (${simData.inputs.arraySizeKey.toUpperCase()})`},
  ].flatMap(item => wrap(item.text, width - 52).map((text, i) => {
    const row = {...item, text, swatch: i === 0, y: nextLegendY};
    nextLegendY += 15;
    return row;
  }));
  const height = nextLegendY + 8;
  canvas.parentElement.style.height = `${height}px`;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.resetTransform?.();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const isDark = typeof document !== 'undefined' && (
    document.documentElement.dataset.theme === 'dark' ||
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && document.documentElement.dataset.theme !== 'light')
  );
  ctx.fillStyle = isDark ? '#0b1329' : '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  header.forEach((row, i) => {
    ctx.fillStyle = row.color;
    ctx.fillText(row.text, 8, 15 + i * 14);
  });

  const { logMin, logMax, wMin, wMax } = simData.curves;

  const toX = (logT) => padLeft + ((logT - logMin) / (logMax - logMin)) * plotW;
  const toY = (w) => padTop + plotH - ((w - wMin) / (wMax - wMin)) * plotH;

  // Grid Lines & Labels
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.10)' : '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';

  xMilestones.forEach((m) => {
    const x = toX(m.logT);
    ctx.beginPath();
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + plotH);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillText(lang === 'zh' ? m.labelZh : m.labelEn, m.left, padTop + plotH + 15 + m.lane * 15);
  });

  // Y-Axis Grid & Cumulative Failure Percentages
  const yMilestones = [
    { f: 0.001, label: '0.1%' },
    { f: 0.01, label: '1%' },
    { f: 0.1, label: '10%' },
    { f: 0.632, label: '63.2% (η)' },
    { f: 0.99, label: '99%' },
  ];

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  yMilestones.forEach((m) => {
    const w = Math.log(-Math.log(1 - m.f));
    const y = toY(w);
    if (y >= padTop && y <= padTop + plotH) {
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();

      ctx.fillText(m.label, padLeft - 8, y);
    }
  });

  // Highlight AntiFuse Programming Window (1 µs to 50 µs)
  const xPgmStart = toX(-6); // 1 µs
  const xPgmEnd = toX(-4.3); // ~50 µs
  ctx.fillStyle = 'rgba(234, 88, 12, 0.08)';
  ctx.fillRect(xPgmStart, padTop, xPgmEnd - xPgmStart, plotH);
  ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)';
  ctx.setLineDash([2, 2]);
  ctx.strokeRect(xPgmStart, padTop, xPgmEnd - xPgmStart, plotH);
  ctx.setLineDash([]);

  ctx.fillStyle = '#ea580c';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';


  // Highlight 15-Year Lifetime Benchmark Line
  const x15Y = toX(8.673);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(x15Y, padTop);
  ctx.lineTo(x15Y, padTop + plotH);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#059669';
  ctx.textAlign = 'right';


  // Plot Curve 1: Single Cell Baseline (Blue)
  const cellPts = simData.curves.cell;
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  let firstCell = true;
  cellPts.forEach((pt) => {
    const x = toX(pt.logT);
    const y = toY(pt.w);
    if (x >= padLeft && x <= padLeft + plotW && y >= padTop && y <= padTop + plotH) {
      if (firstCell) {
        ctx.moveTo(x, y);
        firstCell = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
  });
  ctx.stroke();

  // Plot Curve 2: Array Scaled (Magenta/Purple)
  const arrPts = simData.curves.array;
  ctx.strokeStyle = '#9333ea';
  ctx.lineWidth = 2.2;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  let firstArr = true;
  arrPts.forEach((pt) => {
    const x = toX(pt.logT);
    const y = toY(pt.w);
    if (x >= padLeft && x <= padLeft + plotW && y >= padTop && y <= padTop + plotH) {
      if (firstArr) {
        ctx.moveTo(x, y);
        firstArr = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
  });
  ctx.stroke();
  ctx.setLineDash([]);

  // Plot Border Box
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.20)' : '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.strokeRect(padLeft, padTop, plotW, plotH);

  // 圖例移至曲線外，保留線色、虛線及全部文字。
  ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff';
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.20)' : '#cbd5e1';
  ctx.fillRect(8, legendY, width - 16, nextLegendY - legendY + 2);
  ctx.strokeRect(8, legendY, width - 16, nextLegendY - legendY + 2);
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  legend.forEach(row => {
    if (row.swatch) {
      ctx.strokeStyle = row.color;
      ctx.lineWidth = 2;
      ctx.setLineDash(row.dashed ? [4, 2] : []);
      ctx.beginPath();
      ctx.moveTo(14, row.y - 3);
      ctx.lineTo(30, row.y - 3);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = isDark ? '#f1f5f9' : '#1e293b';
    ctx.fillText(row.text, 36, row.y);
  });

  // Interactive Crosshair Probe Snapping
  if (hoverPos && hoverPos.x >= padLeft && hoverPos.x <= padLeft + plotW && hoverPos.y >= padTop && hoverPos.y <= padTop + plotH) {
    const hx = hoverPos.x;
    const hy = hoverPos.y;
    ctx.save();
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.75)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    // Vertical line
    ctx.beginPath();
    ctx.moveTo(hx, padTop);
    ctx.lineTo(hx, padTop + plotH);
    ctx.stroke();

    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(padLeft, hy);
    ctx.lineTo(padLeft + plotW, hy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sample probed logT and Weibull W
    const probedLogT = logMin + ((hx - padLeft) / plotW) * (logMax - logMin);
    const probedW = wMin + (1.0 - (hy - padTop) / plotH) * (wMax - wMin);
    const probedF = Math.max(0, Math.min(1.0, 1.0 - Math.exp(-Math.exp(probedW))));

    // Format probed time
    let timeStr = `${Math.pow(10, probedLogT).toFixed(1)}s`;
    if (probedLogT < -3) timeStr = `${(Math.pow(10, probedLogT) * 1e6).toFixed(0)}µs`;
    else if (probedLogT < 0) timeStr = `${(Math.pow(10, probedLogT) * 1e3).toFixed(1)}ms`;
    else if (probedLogT > 7.497) timeStr = `${(Math.pow(10, probedLogT) / 3.1536e7).toFixed(1)}y`;
    else if (probedLogT > 3.556) timeStr = `${(Math.pow(10, probedLogT) / 3600).toFixed(1)}h`;

    const fStr = probedF < 0.001 ? `${(probedF * 1e6).toFixed(1)} ppm` : `${(probedF * 100).toFixed(2)}%`;
    const sampleText = `t: ${timeStr} | F(t): ${fStr}`;

    ctx.font = 'bold 9.5px "IBM Plex Mono", monospace';
    const lines = wrap(sampleText, width - 32);
    const pillW = width - 16, pillH = lines.length * 14 + 10, pillX = 8;
    const pillY = Math.min(padTop + plotH - pillH, Math.max(padTop, hy - pillH - 8));
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff';
    ctx.strokeStyle = isDark ? '#38bdf8' : '#2563eb';
    ctx.lineWidth = 1;
    ctx.fillRect(pillX, pillY, pillW, pillH);
    ctx.strokeRect(pillX, pillY, pillW, pillH);
    ctx.fillStyle = isDark ? '#38bdf8' : '#1e40af';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    lines.forEach((line, i) => ctx.fillText(line, 16, pillY + 15 + i * 14));
    ctx.restore();
  }
  } catch (err) {
    console.warn('drawWeibullCanvas caught rendering error:', err);
  }
}

/**
 * Initializes the TDDB & Weibull Reliability Inference Simulator interactive workbench.
 *
 * @param {string} rootId - DOM container ID (default: 'tddb-weibull-root')
 */
export function initTddbWeibullSimulator(rootId = 'tddb-weibull-root') {
  const root = document.getElementById(rootId);
  if (!root) return;

  const presetSelect = root.querySelector('#tddb-preset-select');
  const modelSelect = root.querySelector('#tddb-model-select');
  const arraySelect = root.querySelector('#tddb-array-select');
  const dutySelect = root.querySelector('#tddb-duty-select');

  const toxSlider = root.querySelector('#tddb-tox-slider');
  const toxVal = root.querySelector('#tddb-tox-val');

  const voxSlider = root.querySelector('#tddb-vox-slider');
  const voxVal = root.querySelector('#tddb-vox-val');

  const tempSlider = root.querySelector('#tddb-temp-slider');
  const tempVal = root.querySelector('#tddb-temp-val');

  // KPI Elements
  const eoxValEl = root.querySelector('#tddb-eox-val');
  const betaValEl = root.querySelector('#tddb-beta-val');
  const etaCellEl = root.querySelector('#tddb-eta-cell-val');
  const etaArrayEl = root.querySelector('#tddb-eta-array-val');
  const fitRateEl = root.querySelector('#tddb-fit-val');
  const f15YEl = root.querySelector('#tddb-f15y-val');

  const canvas = root.querySelector('#tddb-canvas');
  const verdictBanner = root.querySelector('#tddb-verdict-banner');

  root.querySelectorAll('input[type=range]').forEach(element => { element.style.margin = '0'; });
  root.querySelectorAll('[style]').forEach(element => {
    if (element.style.gridTemplateColumns.includes('minmax(')) {
      element.style.gridTemplateColumns = element.style.gridTemplateColumns.replace(/minmax\((\d+px),/g, 'minmax(min(100%, $1),');
    }
    if (element.style.display === 'flex') element.style.flexWrap = 'wrap';
  });
  root.querySelectorAll('select, button, h4').forEach(element => {
    element.style.minWidth = '0';
    element.style.maxWidth = '100%';
    element.style.overflowWrap = 'anywhere';
  });

  function getLang() {
    return (window.HubLanguage?.get() || document.documentElement.dataset.language || 'en') === 'zh' ? 'zh' : 'en';
  }

  function update() {
    const lang = getLang();
    const exportBtn = root.querySelector('#tddb-export-csv-btn');
    if (exportBtn) {
      exportBtn.textContent = lang === 'zh' ? '📥 匯出 Weibull 曲線 (CSV)' : '📥 Export Weibull Curve (CSV)';
      exportBtn.setAttribute('aria-label', lang === 'zh' ? '匯出 Weibull 曲線 CSV' : 'Export Weibull Curve CSV');
    }
    const params = {
      toxNm: parseFloat(toxSlider?.value || '2.8'),
      voxV: parseFloat(voxSlider?.value || '0.85'),
      tempC: parseFloat(tempSlider?.value || '150'),
      modelId: modelSelect?.value || 'e_model',
      arraySizeKey: arraySelect?.value || '64_kb',
      dutyCycleKey: dutySelect?.value || 'array_multiplexed',
    };

    if (toxVal) toxVal.textContent = `${params.toxNm.toFixed(1)} nm`;
    if (toxSlider) {
      toxSlider.setAttribute('aria-valuenow', params.toxNm.toFixed(1));
      toxSlider.setAttribute('aria-valuetext', `${params.toxNm.toFixed(1)} nm`);
    }

    if (voxVal) voxVal.textContent = `${params.voxV.toFixed(2)} V`;
    if (voxSlider) {
      voxSlider.setAttribute('aria-valuenow', params.voxV.toFixed(2));
      voxSlider.setAttribute('aria-valuetext', `${params.voxV.toFixed(2)} V`);
    }

    if (tempVal) tempVal.textContent = `${params.tempC} °C`;
    if (tempSlider) {
      tempSlider.setAttribute('aria-valuenow', String(params.tempC));
      tempSlider.setAttribute('aria-valuetext', `${params.tempC} °C`);
    }

    const res = calculateTddbWeibull(params);

    if (eoxValEl) eoxValEl.textContent = `${res.metrics.eoxMvCm.toFixed(2)} MV/cm`;
    if (betaValEl) betaValEl.textContent = `≈ ${res.metrics.beta.toFixed(2)}`;

    if (etaCellEl) {
      etaCellEl.textContent = '≈ ' + (lang === 'en' ? res.metrics.formattedEtaCell.valEn : res.metrics.formattedEtaCell.valZh);
    }
    if (etaArrayEl) {
      etaArrayEl.textContent = '≈ ' + (lang === 'en' ? res.metrics.formattedEtaArray.valEn : res.metrics.formattedEtaArray.valZh);
    }

    if (fitRateEl) {
      fitRateEl.textContent = res.metrics.fitRate15Y < 0.001
        ? '< 0.001 FIT'
        : res.metrics.fitRate15Y > 1e6
        ? '> 10⁶ FIT'
        : `≈ ${res.metrics.fitRate15Y.toFixed(2)} FIT`;
    }

    if (f15YEl) {
      const fVal = res.metrics.f15YArray;
      if (fVal < 1e-6) {
        f15YEl.textContent = `≈ ${(fVal * 1e6).toFixed(4)} ppm`;
      } else if (fVal < 0.01) {
        f15YEl.textContent = `≈ ${(fVal * 1e6).toFixed(1)} ppm`;
      } else {
        f15YEl.textContent = `≈ ${(fVal * 100).toFixed(2)} %`;
      }
    }

    syncMetricCopy([eoxValEl, betaValEl, etaCellEl, etaArrayEl, fitRateEl, f15YEl]);

    // Update Verdict
    if (verdictBanner) {
      verdictBanner.className = 'tddb-verdict-banner ' + res.verdict.status;
      const iconSpan = verdictBanner.querySelector('.tddb-verdict-icon');
      const textSpan = verdictBanner.querySelector('.tddb-verdict-text');
      
      let bg = '#ecfdf5';
      let border = '1px solid #a7f3d0';
      let color = '#065f46';
      let icon = '🛡️';

      if (res.verdict.status === 'hard_breakdown_active') {
        bg = '#fff7ed';
        border = '1px solid #fed7aa';
        color = '#9a3412';
        icon = '⚡';
      } else if (res.verdict.status === 'intermediate_failure_estimate') {
        bg = '#eff6ff';
        border = '1px solid #bfdbfe';
        color = '#1e40af';
        icon = 'ℹ️';
      } else if (res.verdict.status === 'higher_failure_estimate') {
        bg = '#fef2f2';
        border = '1px solid #fecaca';
        color = '#991b1b';
        icon = '⚠️';
      }

      verdictBanner.style.background = bg;
      verdictBanner.style.border = border;
      verdictBanner.style.color = color;
      if (iconSpan) iconSpan.textContent = icon;

      if (textSpan) {
        textSpan.textContent = lang === 'zh' ? res.verdict.zh : res.verdict.en;
      }
    }

    // Redraw Canvas
    if (canvas) {
      drawWeibullCanvas(canvas, res, lang, hoverPos);
    }
  }

  function syncPresetDropdown() {
    if (!presetSelect) return;
    const curTox = parseFloat(toxSlider?.value);
    const curVox = parseFloat(voxSlider?.value);
    const curTemp = parseFloat(tempSlider?.value);
    const curModel = modelSelect?.value;
    const curArray = arraySelect?.value;
    const curDuty = dutySelect?.value;

    const matchedPreset = Object.entries(TDDB_PRESETS).find(([_, p]) =>
      Math.abs(p.toxNm - curTox) < 0.01 &&
      Math.abs(p.voxV - curVox) < 0.01 &&
      Math.abs(p.tempC - curTemp) < 0.1 &&
      p.modelId === curModel &&
      p.arraySizeKey === curArray &&
      p.dutyCycleKey === curDuty
    );

    let customOpt = presetSelect.querySelector('option[value="custom"]');
    if (!matchedPreset) {
      if (!customOpt) {
        customOpt = document.createElement('option');
        customOpt.value = 'custom';
        customOpt.setAttribute('data-lang-zh', '自訂應力參數 (Custom)');
        customOpt.setAttribute('data-lang-en', 'Custom Parameters');
        presetSelect.appendChild(customOpt);
      }
      const lang = getLang();
      customOpt.textContent = lang === 'zh' ? '自訂應力參數 (Custom)' : 'Custom Parameters';
      presetSelect.value = 'custom';
    } else {
      presetSelect.value = matchedPreset[0];
    }
  }

  // Pointer interactions for Canvas Crosshair Probe
  let hoverPos = null;
  if (canvas) {
    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      hoverPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      const lang = getLang();
      const res = calculateTddbWeibull({
        toxNm: parseFloat(toxSlider?.value || 2.8),
        voxV: parseFloat(voxSlider?.value || 0.75),
        tempC: parseFloat(tempSlider?.value || 150),
        modelId: modelSelect?.value || 'e_model',
        arraySizeKey: arraySelect?.value || '64_kb',
        dutyCycleKey: dutySelect?.value || 'array_multiplexed',
      });
      drawWeibullCanvas(canvas, res, lang, hoverPos);
    });

    canvas.addEventListener('pointerleave', () => {
      hoverPos = null;
      update();
    });
  }

  // Presets Handler
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      if (presetSelect.value === 'custom') return;
      const p = TDDB_PRESETS[presetSelect.value];
      if (!p) return;
      if (toxSlider) toxSlider.value = p.toxNm;
      if (voxSlider) voxSlider.value = p.voxV;
      if (tempSlider) tempSlider.value = p.tempC;
      if (modelSelect) modelSelect.value = p.modelId;
      if (arraySelect) arraySelect.value = p.arraySizeKey;
      if (dutySelect) dutySelect.value = p.dutyCycleKey;
      update();
    });
  }

  const handleControlInput = () => {
    syncPresetDropdown();
    update();
  };

  [toxSlider, voxSlider, tempSlider, modelSelect, arraySelect, dutySelect].forEach((ctrl) => {
    if (ctrl) {
      ctrl.addEventListener('input', handleControlInput);
      ctrl.addEventListener('change', handleControlInput);
    }
  });

  // Export CSV Action for Weibull
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

  const presetParent = presetSelect?.parentNode;
  if (presetParent && !presetParent.querySelector('#tddb-export-csv-btn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'tddb-export-csv-btn';
    exportBtn.type = 'button';
    exportBtn.style.cssText = 'margin-top: 6px; padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 4px; border: 1px solid rgba(59, 130, 246, 0.4); background: rgba(15, 23, 42, 0.6); color: #3b82f6; cursor: pointer;';
    const lang = getLang();
    exportBtn.textContent = lang === 'zh' ? '📥 匯出 Weibull 曲線 (CSV)' : '📥 Export Weibull Curve (CSV)';
    exportBtn.addEventListener('click', () => {
      const res = calculateTddbWeibull({
        toxNm: parseFloat(toxSlider?.value || 2.8),
        voxV: parseFloat(voxSlider?.value || 0.75),
        tempC: parseFloat(tempSlider?.value || 150),
        modelId: modelSelect?.value || 'e_model',
        arraySizeKey: arraySelect?.value || '64_kb',
        dutyCycleKey: dutySelect?.value || 'array_multiplexed',
      });
      let csv = 'logT_sec,Weibull_W,Time_sec,FailureProb_Pct_Cell,FailureProb_Pct_Array\n';
      res.curves.cell.forEach((pt, idx) => {
        const arrPt = res.curves.array[idx] || pt;
        const timeSec = Math.pow(10, pt.logT);
        const fCellPct = Math.max(0, Math.min(100, (1 - Math.exp(-Math.exp(pt.w))) * 100));
        const fArrayPct = Math.max(0, Math.min(100, (1 - Math.exp(-Math.exp(arrPt.w))) * 100));
        csv += `${pt.logT.toFixed(3)},${pt.w.toFixed(3)},${timeSec.toExponential(2)},${fCellPct.toFixed(4)},${fArrayPct.toFixed(4)}\n`;
      });
      downloadCsv(`tddb_weibull_${res.inputs.modelId}_${res.inputs.tox}nm.csv`, csv);
    });
    presetParent.appendChild(exportBtn);
  }

  // Observe language and theme mutations
  const observer = new MutationObserver(() => update());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-theme'] });

  if (typeof ResizeObserver !== 'undefined' && canvas) {
    const ro = new ResizeObserver(() => update());
    ro.observe(canvas);
  }

  window.addEventListener('resize', () => {
    if (canvas) update();
  });

  window.addEventListener('hub:language-change', () => update());
  window.addEventListener('languagechange', () => update());
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initTddbWeibullSimulator());
  } else {
    initTddbWeibullSimulator();
  }
}
