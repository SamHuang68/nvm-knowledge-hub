/**
 * bcd-trimming-simulator.js — BCD Power Management Analog Trimming & Yield Optimizer
 *
 * First-principles statistical modeling of raw silicon process variation, DAC trim step quantization,
 * post-trim yield recovery, and NVM technology trade-offs in high-voltage BCD PMIC applications.
 *
 * Mathematical Foundations:
 * 1. Raw Distribution: V_raw ~ Normal(mu_raw, sigma_raw^2), where 3*sigma = spread * V_target
 * 2. Pre-trim Yield: Y_raw = Phi((V_high - mu) / sigma) - Phi((V_low - mu) / sigma)
 * 3. DAC Quantization Step: Delta_V = (2 * Range * V_target) / (2^N - 1)
 * 4. Post-trim Residual Variance: sigma_post = sqrt((Delta_V^2 / 12) + sigma_temp^2 + sigma_package^2)
 * 5. Post-trim Yield: Y_post = Phi((V_high - V_target) / sigma_post) - Phi((V_low - V_target) / sigma_post)
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: JEDEC, TSMC/UMC/VIS 0.18µm/0.13µm/90nm BCD PMIC Standards
 */

'use strict';

export const BCD_TRIM_PRESETS = Object.freeze({
  pmic_bandgap: {
    id: 'pmic_bandgap',
    nameEn: 'Precision 1.200V Bandgap Reference (Automotive PMIC)',
    nameZh: '高精度 1.200V 帶隙基準電壓 (車規級 PMIC)',
    targetVal: 1.200,
    unit: 'V',
    specTolPct: 0.5, // ±0.5% required
    rawSpreadPct: 4.0, // ±4.0% raw 3-sigma wafer spread
    trimBits: 6, // 6-bit trim DAC (64 levels)
    trimRangePct: 5.0, // ±5.0% DAC adjustment range
    descriptionEn: 'Tight ±0.5% automotive VREF specification requires 6-bit non-volatile trimming.',
    descriptionZh: '車規嚴苛的 ±0.5% 帶隙基準要求，必須透過 6 位元非揮發修調消除晶圓製程漂移。',
  },
  buck_oscillator: {
    id: 'buck_oscillator',
    nameEn: 'DC-DC Switching Regulator 2.0 MHz Oscillator',
    nameZh: '同步降壓轉換器 2.0 MHz 內部振盪器',
    targetVal: 2.000,
    unit: 'MHz',
    specTolPct: 1.5,
    rawSpreadPct: 8.0,
    trimBits: 7,
    trimRangePct: 10.0,
    descriptionEn: 'Minimizes EMI filter component size by locking switching frequency to ±1.5%.',
    descriptionZh: '將開關頻率鎖定於 ±1.5% 內，縮減外部 EMI 濾波電感與電容體積。',
  },
  gate_driver_ocp: {
    id: 'gate_driver_ocp',
    nameEn: 'SiC/GaN Gate Driver DESAT / OCP Threshold (8.0V)',
    nameZh: 'SiC/GaN 閘極驅動器 DESAT 去飽和保護閾值 (8.0V)',
    targetVal: 8.000,
    unit: 'V',
    specTolPct: 2.0,
    rawSpreadPct: 6.0,
    trimBits: 5,
    trimRangePct: 7.5,
    descriptionEn: 'Trims high-voltage short-circuit trip threshold to protect expensive power modules.',
    descriptionZh: '精確微調去飽和短路跳脫閾值，確保在 2µs 內安全關斷以保護昂貴 SiC 模組。',
  },
  ldo_quiescent: {
    id: 'ldo_quiescent',
    nameEn: 'Automotive Low-Dropout Regulator (LDO) 3.300V Rail',
    nameZh: '車規級超低靜態功耗 LDO 3.300V 輸出軌',
    targetVal: 3.300,
    unit: 'V',
    specTolPct: 0.8,
    rawSpreadPct: 4.5,
    trimBits: 6,
    trimRangePct: 5.5,
    descriptionEn: 'Regulates sensor supply rail with minimal dropout across -40°C to +150°C.',
    descriptionZh: '於 -40°C~+150°C 寬溫範圍內提供高精準感測器供電軌。',
  },
});

export const BCD_TRIM_TECHNOLOGIES = Object.freeze({
  antifuse_otp: {
    id: 'antifuse_otp',
    nameEn: 'Logic AntiFuse OTP',
    nameZh: '邏輯 AntiFuse OTP',
    maskAdder: 0,
    packageTrim: true, // Supports post-packaging trim to eliminate packaging shift
    retentionGrade0: true, // 175°C Tj qualified
    thermalImpactOnLdmos: 'None (Pure CMOS)',
    programmingCurrentMA: '< 1 mA',
    verdictEn: 'Optimal: 0 masks, post-packaging trim capability, zero degradation of HV LDMOS breakdown.',
    verdictZh: '最佳方案：0 道光罩、支援封裝後修調（消弭打線熱應力漂移）、完全不損及高壓 LDMOS 崩潰電壓。',
  },
  laser_trim: {
    id: 'laser_trim',
    nameEn: 'Thin-Film Laser Trimming',
    nameZh: '薄膜電阻雷射修調',
    maskAdder: 0,
    packageTrim: false, // Wafer sort only
    retentionGrade0: true,
    thermalImpactOnLdmos: 'Moderate localized stress',
    programmingCurrentMA: '0 mA (Optical)',
    verdictEn: 'High machine cost; wafer-level only, cannot compensate for packaging thermal shifts.',
    verdictZh: '設備昂貴；僅能於晶圓階段修調，無法補償封裝打線與環氧樹脂固化帶來的應力漂移。',
  },
  poly_efuse: {
    id: 'poly_efuse',
    nameEn: 'Poly eFuse',
    nameZh: '多晶矽電子熔絲 eFuse',
    maskAdder: 0,
    packageTrim: true,
    retentionGrade0: false, // Electromigration regrowth risk at >125°C
    thermalImpactOnLdmos: 'None',
    programmingCurrentMA: '10–15 mA (High current pump)',
    verdictEn: 'High 15mA programming current requires large driver transistors; risk of fuse regrowth at high Tj.',
    verdictZh: '燒錄需 10~15mA 大電流需龐大驅動管；高溫環境下存在金屬離子電遷移回填（Regrowth）風險。',
  },
  embedded_eflash: {
    id: 'embedded_eflash',
    nameEn: 'Embedded eFlash',
    nameZh: '嵌入式 eFlash',
    maskAdder: 12, // 10-15 extra masks
    packageTrim: true,
    retentionGrade0: false,
    thermalImpactOnLdmos: 'Severe (Thermal budget destroys LDMOS)',
    programmingCurrentMA: '< 1 mA',
    verdictEn: 'Economically & physically incompatible: +12 masks doubles wafer cost; thermal budget degrades LDMOS 85V breakdown.',
    verdictZh: '經濟與物理雙重不可行：增加 10~15 道光罩使成本翻倍；多道高溫熱退火嚴重破壞 85V LDMOS 結深與耐壓。',
  },
});

/**
 * Standard normal cumulative distribution function approximation (Abramowitz & Stegun).
 * @param {number} x
 * @return {number} CDF value in [0, 1].
 */
export function normalCdf(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422804014327 * Math.exp((-x * x) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

/**
 * Calculates raw vs trimmed analog parameter distributions and yield recovery.
 * @param {Object} inputs Parameters.
 * @return {Object} Computed yields, DAC quantization metrics, and comparison.
 */
export function calculateBcdTrimming(inputs = {}) {
  const preset = BCD_TRIM_PRESETS[inputs.presetId] || BCD_TRIM_PRESETS.pmic_bandgap;
  const targetVal = parseFloat(inputs.targetVal) || preset.targetVal;
  const specTolPct = parseFloat(inputs.specTolPct) || preset.specTolPct;
  const rawSpreadPct = parseFloat(inputs.rawSpreadPct) || preset.rawSpreadPct;
  const trimBits = parseInt(inputs.trimBits, 10) || preset.trimBits;
  const trimRangePct = parseFloat(inputs.trimRangePct) || preset.trimRangePct;

  // Spec limits:
  const vHigh = targetVal * (1 + specTolPct / 100);
  const vLow = targetVal * (1 - specTolPct / 100);
  const specDelta = vHigh - targetVal;

  // Raw wafer process distribution (Assume 3*sigma = rawSpreadPct * targetVal):
  const rawSigma = (targetVal * (rawSpreadPct / 100)) / 3;
  // Raw yield:
  const zHighRaw = (vHigh - targetVal) / rawSigma;
  const zLowRaw = (vLow - targetVal) / rawSigma;
  const rawYield = normalCdf(zHighRaw) - normalCdf(zLowRaw);

  // DAC Quantization step:
  const numLevels = Math.pow(2, trimBits);
  const fullTrimRange = 2 * targetVal * (trimRangePct / 100);
  const deltaV = fullTrimRange / (numLevels - 1);
  const lsbPct = (deltaV / targetVal) * 100;

  // Post-trim residual distribution:
  // Quantization error variance = deltaV^2 / 12 (uniform distribution between -deltaV/2 and +deltaV/2)
  // Packaging shift variance and thermal drift residual:
  const packagingShiftSigma = targetVal * 0.0008; // ~0.08% residual drift
  const postTrimSigma = Math.sqrt(Math.pow(deltaV, 2) / 12 + Math.pow(packagingShiftSigma, 2));

  // Post-trim yield:
  const zHighPost = (vHigh - targetVal) / postTrimSigma;
  const zLowPost = (vLow - targetVal) / postTrimSigma;
  const postTrimYield = normalCdf(zHighPost) - normalCdf(zLowPost);

  const deltaYieldPct = (postTrimYield - rawYield) * 100;

  return {
    targetVal,
    unit: preset.unit,
    specTolPct,
    rawSpreadPct,
    trimBits,
    numLevels,
    trimRangePct,
    deltaV: parseFloat(deltaV.toFixed(5)),
    lsbPct: parseFloat(lsbPct.toFixed(3)),
    rawYieldPct: parseFloat((rawYield * 100).toFixed(2)),
    postTrimYieldPct: parseFloat((postTrimYield * 100).toFixed(2)),
    deltaYieldPct: parseFloat(deltaYieldPct.toFixed(2)),
    preset,
  };
}

/**
 * Initializes the BCD Trimming Simulator interactive UI.
 * @param {string} rootSelector The DOM container selector.
 */
export function initBcdTrimmingSimulator(rootSelector = '#bcd-trimming-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const T = (en, zh) => (window.HubLanguage?.get() === 'zh' ? zh : en);

  const presetSelect = root.querySelector('#trim-preset-select');
  const bitsSelect = root.querySelector('#trim-bits-select');
  const specSlider = root.querySelector('#trim-spec-slider');
  const specVal = root.querySelector('#trim-spec-val');
  const spreadSlider = root.querySelector('#trim-spread-slider');
  const spreadVal = root.querySelector('#trim-spread-val');

  const rawYieldEl = root.querySelector('#trim-raw-yield');
  const postYieldEl = root.querySelector('#trim-post-yield');
  const deltaYieldBadge = root.querySelector('#trim-delta-yield');
  const lsbStepEl = root.querySelector('#trim-lsb-step');
  const dacLevelsEl = root.querySelector('#trim-dac-levels');

  const barRaw = root.querySelector('#trim-bar-raw');
  const barPost = root.querySelector('#trim-bar-post');
  const verdictEl = root.querySelector('#trim-verdict');

  function loadPreset(key) {
    const p = BCD_TRIM_PRESETS[key] || BCD_TRIM_PRESETS.pmic_bandgap;
    if (bitsSelect) bitsSelect.value = String(p.trimBits);
    if (specSlider) specSlider.value = String(p.specTolPct);
    if (spreadSlider) spreadSlider.value = String(p.rawSpreadPct);
    update();
  }

  function update() {
    const specTolPct = parseFloat(specSlider?.value || 0.5);
    const rawSpreadPct = parseFloat(spreadSlider?.value || 4.0);
    const trimBits = parseInt(bitsSelect?.value || '6', 10);

    if (specVal) specVal.textContent = `±${specTolPct}%`;
    if (spreadVal) spreadVal.textContent = `±${rawSpreadPct}%`;

    const res = calculateBcdTrimming({
      presetId: presetSelect?.value || 'pmic_bandgap',
      specTolPct,
      rawSpreadPct,
      trimBits,
    });

    if (rawYieldEl) rawYieldEl.textContent = `${res.rawYieldPct}%`;
    if (postYieldEl) postYieldEl.textContent = `${res.postTrimYieldPct}%`;
    if (deltaYieldBadge) deltaYieldBadge.textContent = `+${res.deltaYieldPct}%`;
    if (lsbStepEl) lsbStepEl.textContent = `${res.deltaV} ${res.unit} (±${res.lsbPct}%)`;
    if (dacLevelsEl) dacLevelsEl.textContent = `${res.numLevels} levels (${res.trimBits}-bit)`;

    // Bars
    if (barRaw) {
      barRaw.style.width = `${res.rawYieldPct}%`;
      barRaw.title = T(`Pre-trim Raw Yield: ${res.rawYieldPct}%`, `修調前原始良率: ${res.rawYieldPct}%`);
    }
    if (barPost) {
      barPost.style.width = `${res.postTrimYieldPct}%`;
      barPost.title = T(`Post-trim Optimized Yield: ${res.postTrimYieldPct}%`, `修調後最佳化良率: ${res.postTrimYieldPct}%`);
    }

    // Verdict Callout
    if (verdictEl) {
      verdictEl.innerHTML = T(
        `<strong>BCD Trimming Architecture Finding:</strong> Raw silicon process spread (±${res.rawSpreadPct}%) causes <strong>${(100 - res.rawYieldPct).toFixed(1)}% wafer fallout</strong> under a tight ±${res.specTolPct}% target. Employing a <strong>${res.trimBits}-bit DAC (${res.numLevels} steps, LSB = ${res.deltaV} ${res.unit})</strong> programmed via <em>0-mask Logic AntiFuse OTP</em> compresses parameter deviation and rescues yield to <strong>${res.postTrimYieldPct}% (+${res.deltaYieldPct}% yield boost)</strong>. Unlike laser trimming, AntiFuse supports post-packaging calibration to cancel packaging mechanical shifts.`,
        `<strong>BCD 修調架構審查結論：</strong> 矽晶圓原始製程漂移（±${res.rawSpreadPct}%）在嚴苛的 ±${res.specTolPct}% 規格下導致高達 <strong>${(100 - res.rawYieldPct).toFixed(1)}% 的晶圓報廢率</strong>。導入由 <em>0 光罩 Logic AntiFuse OTP</em> 驅動的 <strong>${res.trimBits} 位元修調 DAC（${res.numLevels} 階，LSB = ${res.deltaV} ${res.unit}）</strong>，成功將參數離散度精準收斂，使良率大幅躍升至 <strong>${res.postTrimYieldPct}%（良率純增益 +${res.deltaYieldPct}%）</strong>。相較於雷射修調，AntiFuse 具備封裝後終端測試修調能力，可徹底消除打線與封膠應力漂移。`
      );
    }
  }

  presetSelect?.addEventListener('change', (e) => loadPreset(e.target.value));
  [bitsSelect, specSlider, spreadSlider].forEach((el) => el?.addEventListener('input', update));
  window.addEventListener('hub:language-change', update);

  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initBcdTrimmingSimulator());
  } else {
    initBcdTrimmingSimulator();
  }
}
