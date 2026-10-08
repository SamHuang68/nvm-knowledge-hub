import {syncMetricCopy} from './模型數值複製.js';

/**
 * differential-sensing-simulator.js — Complementary Twin-Cell Sensing Margin & DPA Attenuation Simulator
 *
 * 教學示意：沿用感測電壓公式與預設架構係數，比較單端、虛擬差動與互補成對感測。
 * CMRR、衰減與曲線指標未以實測資料校準，不能預測金鑰還原或認證結果。
 *
 * Mathematical Foundations:
 * 1. Single-Ended Current Delta: Delta_I_SE = |I_cell - I_ref|
 * 2. Twin-Cell Current Delta: Delta_I_TC = |I_true - I_comp|
 * 3. Sensing Voltage Development: Delta_V_sense = (Delta_I_sense * t_sense) / C_bitline
 * 4. Common-Mode Rejection: CMRR_dB = 20 * log10(Delta_V_diff / Delta_V_cm_noise)
 * 5. First-Order DPA Current Signature: I_data_dependent = |I_total(bit=1) - I_total(bit=0)|
 * 6. 曲線比較指標：保留既有示意係數，不代表攻擊所需的最少曲線數。
 *
 * Author: NVM Knowledge Hub Editorial Board
 * 邊界：本試算器不執行 ISO/IEC 17825 的非侵入式攻擊測試。
 */

'use strict';

export const DIFF_SENSING_PRESETS = Object.freeze({
  automotive_grade0_28nm: {
    id: 'automotive_grade0_28nm',
    nameEn: 'Automotive Grade 0 Secure MCU (28nm, 150°C Tj)',
    nameZh: '車規 Grade 0 安全微控制器 (28nm, 150°C Tj)',
    vdd: 0.9, // Volts
    iprog: 22.0, // microAmperes (filament conduction)
    tempC: 150, // Junction temp
    ileakBaseNa: 45.0, // nanoAmperes at 150°C
    leakageReferenceTempC: 150,
    cellMismatchPct: 7.5, // 3-sigma transistor mismatch
    cmNoiseMv: 45.0, // Power distribution network common-mode ripple (mV)
    cBitlineFf: 45.0, // femtoFarads
    tsenseNs: 2.2, // nanoseconds
    descriptionEn: 'High-temperature automotive environment with substantial leakage and supply ripple.',
    descriptionZh: '車規高溫環境（150°C 接面溫度），漏電增大且電源分佈網絡雜訊顯著。',
  },
  banking_smartcard_40nm: {
    id: 'banking_smartcard_40nm',
    nameEn: 'Banking Smartcard Secure Element (40nm, CC EAL6+)',
    nameZh: '金融智慧卡高防護安全晶片 (40nm, CC EAL6+)',
    vdd: 1.1,
    iprog: 26.0,
    tempC: 25,
    ileakBaseNa: 0.2, // sub-nA at room temp
    leakageReferenceTempC: 25,
    cellMismatchPct: 5.0,
    cmNoiseMv: 25.0,
    cBitlineFf: 50.0,
    tsenseNs: 2.5,
    descriptionEn: 'Ultra-secure financial smartcard prioritizing maximum side-channel resistance against DPA.',
    descriptionZh: '極致安全的金融智慧卡，將抵抗差分功耗分析 (DPA) 的物理抗性列為最高優先級。',
  },
  iot_ultralow_55nm: {
    id: 'iot_ultralow_55nm',
    nameEn: 'IoT Ultra-Low Power eNVM (55nm, 85°C)',
    nameZh: '物聯網超低功耗 eNVM (55nm, 85°C)',
    vdd: 1.2,
    iprog: 32.0,
    tempC: 85,
    ileakBaseNa: 3.5,
    leakageReferenceTempC: 85,
    cellMismatchPct: 6.0,
    cmNoiseMv: 30.0,
    cBitlineFf: 60.0,
    tsenseNs: 3.0,
    descriptionEn: 'Battery-powered edge node balancing sensing reliability with low active read current.',
    descriptionZh: '電池供電邊緣節點，在可靠讀取裕度與超低動態讀取能耗間取得平衡。',
  },
  industrial_extreme_175c: {
    id: 'industrial_extreme_175c',
    nameEn: 'Extreme Industrial / Geothermal Sensor (0.18µm, 175°C)',
    nameZh: '極端工業高溫／地熱井下感測器 (0.18µm, 175°C)',
    vdd: 1.8,
    iprog: 55.0,
    tempC: 175,
    ileakBaseNa: 380.0, // High junction leakage
    leakageReferenceTempC: 175,
    cellMismatchPct: 11.0,
    cmNoiseMv: 85.0,
    cBitlineFf: 90.0,
    tsenseNs: 4.5,
    descriptionEn: 'Hostile geothermal sensor subject to severe thermal noise and parametric drift.',
    descriptionZh: '惡劣地熱高溫環境，承受劇烈熱雜訊與極大參數漂移挑戰。',
  },
});

export const SENSING_ARCHITECTURES = Object.freeze({
  single_ended: {
    id: 'single_ended',
    nameEn: 'Single-Ended 1T (Fixed Reference Iref)',
    nameZh: '單端模式 1T (固定參考源 Iref)',
    cellDeviceFactor: 1.0, // 1T base
    areaMultiplier: 1.0,
    cmrrBaseDb: 2.0, // Near-zero common mode rejection
    dpaLeakageRatio: 0.95, // Almost 100% data-dependent current signature
    baseMtdTraces: 450, // 教學曲線指標係數，未校準至金鑰還原實驗。
    descriptionEn: 'Lowest area cost, but maximal power-supply signature and zero common-mode noise cancellation.',
    descriptionZh: '矽面積成本最低，但供電軌一階訊跡最大且幾乎無共模雜訊抵消能力。',
  },
  pseudo_diff: {
    id: 'pseudo_diff',
    nameEn: 'Pseudo-Differential (Reference Array Averaging)',
    nameZh: '虛擬差動模式 (參考陣列均值比較)',
    cellDeviceFactor: 1.25,
    areaMultiplier: 1.2,
    cmrrBaseDb: 14.0,
    dpaLeakageRatio: 0.52,
    baseMtdTraces: 4200,
    descriptionEn: 'Moderate supply noise rejection using averaged dummy bitlines; partial signature suppression.',
    descriptionZh: '透過虛擬位元線平均抵消部分電源雜訊；提供中度訊跡衰減。',
  },
  true_twin_cell: {
    id: 'true_twin_cell',
    nameEn: 'True Twin-Cell Complementary (1T True + 1T Comp)',
    nameZh: '真互補成對差動 (1T True + 1T Comp)',
    cellDeviceFactor: 2.0, // 1T + 1T
    areaMultiplier: 1.65, // Layout sharing reduces macro penalty to ~1.65x
    cmrrBaseDb: 38.0, // Superior common-mode rejection
    dpaLeakageRatio: 0.04, // >96% first-order DPA signal suppression
    baseMtdTraces: 650000, // 教學曲線指標係數，不能作為安全門檻。
    descriptionEn: 'Illustrative first-order power symmetry and common-mode rejection; implementation requires validation.',
    descriptionZh: '一階供電對稱性與共模抑制的教學示意；實際實作仍須驗證。',
  },
});

/**
 * Calculates sensing margins, CMRR, and DPA side-channel attenuation.
 * @param {Object} inputs Parameters.
 * @return {Object} Computed electrical and side-channel metrics.
 */
export function calculateDifferentialSensing(inputs = {}) {
  const preset = DIFF_SENSING_PRESETS[inputs.presetId] || DIFF_SENSING_PRESETS.automotive_grade0_28nm;
  const arch = SENSING_ARCHITECTURES[inputs.archId] || SENSING_ARCHITECTURES.true_twin_cell;

  const vdd = parseFloat(inputs.vdd) || preset.vdd;
  const iprogUa = Math.max(5.0, parseFloat(inputs.iprog) || preset.iprog);
  const tempC = parseFloat(inputs.tempC) || preset.tempC;
  const cmNoiseMv = Math.max(5.0, parseFloat(inputs.cmNoiseMv) || preset.cmNoiseMv);
  const tsenseNs = Math.max(0.5, parseFloat(inputs.tsenseNs) || preset.tsenseNs);
  const cBitlineFf = Math.max(10.0, parseFloat(inputs.cBitlineFf) || preset.cBitlineFf);

  // 每個預設的漏電量對應其標示溫度；1.85 倍／10°C 為既有示意係數。
  const tempDelta = tempC - preset.leakageReferenceTempC;
  const tempLeakMultiplier = Math.pow(1.85, tempDelta / 10);
  const ileakUa = (preset.ileakBaseNa * tempLeakMultiplier) / 1000;

  // Iref is placed halfway between Iprog and Ileak for single-ended:
  const irefUa = (iprogUa + ileakUa) / 2;
  const modelValid = ileakUa < iprogUa;
  const availableSenseUa = Math.max(0, iprogUa - ileakUa);

  let deltaIsenseUa = 0;
  let firstOrderDeltaI = 0;
  let cmrrDb = 0;
  let dpaAttenDb = 0;
  let mtdTraces = 0;

  if (arch.id === 'single_ended') {
    // Single-Ended: signal is |I_cell - I_ref|
    deltaIsenseUa = availableSenseUa / 2;
    // Data dependent current between reading 1 and 0:
    firstOrderDeltaI = Math.abs(iprogUa - ileakUa);
    cmrrDb = Math.max(0, arch.cmrrBaseDb - (cmNoiseMv / 20));
    dpaAttenDb = 0; // Reference 0 dB
    mtdTraces = Math.round(arch.baseMtdTraces * (25 / Math.max(10, cmNoiseMv)));
  } else if (arch.id === 'pseudo_diff') {
    deltaIsenseUa = availableSenseUa * 0.7;
    firstOrderDeltaI = Math.abs(iprogUa - ileakUa) * arch.dpaLeakageRatio;
    cmrrDb = arch.cmrrBaseDb + (vdd > 1.0 ? 2 : 0);
    dpaAttenDb = -12.5;
    mtdTraces = Math.round(arch.baseMtdTraces * (25 / Math.max(10, cmNoiseMv)));
  } else {
    // True Twin-Cell Complementary:
    // Signal is (I_prog - I_leak) directly between two differential nodes:
    deltaIsenseUa = availableSenseUa;
    // Data dependent current delta is limited strictly to physical mismatch:
    const mismatchFactor = (preset.cellMismatchPct / 100);
    firstOrderDeltaI = iprogUa * mismatchFactor * arch.dpaLeakageRatio;
    cmrrDb = arch.cmrrBaseDb + 4.0;
    dpaAttenDb = -32.8;
    // MTD scales inversely with square of firstOrderDeltaI:
    const snrSuppression = Math.pow(iprogUa / Math.max(0.01, firstOrderDeltaI), 1.8);
    mtdTraces = Math.round(Math.min(2000000, arch.baseMtdTraces * (snrSuppression / 80)));
  }

  // Bitline differential voltage development: Delta_V = (I * t) / C
  const deltaVsenseMv = (deltaIsenseUa * 1e-6 * tsenseNs * 1e-9) / (cBitlineFf * 1e-15) * 1000;

  // Signal-to-Noise Ratio (SNR) of sensing margin:
  const snrSensing = deltaVsenseMv / Math.max(1.0, cmNoiseMv);

  return {
    preset,
    arch,
    modelValid,
    leakageReferenceTempC: preset.leakageReferenceTempC,
    vdd,
    tempC,
    iprogUa: parseFloat(iprogUa.toFixed(1)),
    ileakUa: parseFloat(ileakUa.toFixed(3)),
    irefUa: parseFloat(irefUa.toFixed(1)),
    deltaIsenseUa: parseFloat(deltaIsenseUa.toFixed(2)),
    deltaVsenseMv: parseFloat(deltaVsenseMv.toFixed(1)),
    cmNoiseMv: parseFloat(cmNoiseMv.toFixed(1)),
    cmrrDb: parseFloat(cmrrDb.toFixed(1)),
    firstOrderDeltaI: parseFloat(firstOrderDeltaI.toFixed(2)),
    dpaAttenDb: parseFloat(dpaAttenDb.toFixed(1)),
    mtdTraces: Math.max(100, mtdTraces),
    snrSensing: parseFloat(snrSensing.toFixed(2)),
    areaMultiplier: arch.areaMultiplier,
  };
}

/**
 * Initializes the Differential Sensing Simulator interactive UI.
 * @param {string} rootSelector The DOM container selector.
 */
export function initDifferentialSensingSimulator(rootSelector = '#differential-sensing-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const T = (en, zh) => (window.HubLanguage?.get() === 'zh' ? zh : en);

  const presetSelect = root.querySelector('#diff-preset-select');
  const archSelect = root.querySelector('#diff-arch-select');
  const tempSlider = root.querySelector('#diff-temp-slider');
  const tempVal = root.querySelector('#diff-temp-val');
  const noiseSlider = root.querySelector('#diff-noise-slider');
  const noiseVal = root.querySelector('#diff-noise-val');

  const deltaVEl = root.querySelector('#diff-margin-mv');
  const cmrrEl = root.querySelector('#diff-cmrr-db');
  const dpaDeltaEl = root.querySelector('#diff-dpa-delta');
  const dpaAttenBadge = root.querySelector('#diff-atten-badge');
  const mtdEl = root.querySelector('#diff-mtd-traces');
  const areaEl = root.querySelector('#diff-area-penalty');

  const barSig0 = root.querySelector('#diff-bar-bit0');
  const barSig1 = root.querySelector('#diff-bar-bit1');
  const verdictEl = root.querySelector('#diff-verdict');

  function loadPreset(key) {
    const p = DIFF_SENSING_PRESETS[key] || DIFF_SENSING_PRESETS.automotive_grade0_28nm;
    if (tempSlider) tempSlider.value = String(p.tempC);
    if (noiseSlider) noiseSlider.value = String(p.cmNoiseMv);
    update();
  }

  function update() {
    const isZh = (window.HubLanguage?.get() || document.documentElement.dataset.language || document.documentElement.lang || 'zh').startsWith('zh');
    const tempC = parseFloat(tempSlider?.value || 150);
    const cmNoiseMv = parseFloat(noiseSlider?.value || 45);

    if (tempVal) tempVal.textContent = `${tempC}°C`;
    if (noiseVal) noiseVal.textContent = `${cmNoiseMv} mV`;

    const res = calculateDifferentialSensing({
      presetId: presetSelect?.value || 'automotive_grade0_28nm',
      archId: archSelect?.value || 'true_twin_cell',
      tempC,
      cmNoiseMv,
    });

    if (deltaVEl) {
      deltaVEl.textContent = `${res.deltaVsenseMv} mV`;
      deltaVEl.style.color = res.deltaVsenseMv >= 100 ? '#059669' : res.deltaVsenseMv >= 40 ? '#0284c7' : '#dc2626';
    }
    if (cmrrEl) cmrrEl.textContent = `${res.cmrrDb} dB`;
    if (dpaDeltaEl) dpaDeltaEl.textContent = `${res.firstOrderDeltaI} µA`;
    if (dpaAttenBadge) {
      dpaAttenBadge.textContent = T(
        `${res.dpaAttenDb} dB Assumed Attenuation`,
        `${res.dpaAttenDb} dB 假設衰減`
      );
      dpaAttenBadge.style.background = res.dpaAttenDb <= -20 ? '#dcfce7' : res.dpaAttenDb <= -10 ? '#e0f2fe' : '#fee2e2';
      dpaAttenBadge.style.color = res.dpaAttenDb <= -20 ? '#166534' : res.dpaAttenDb <= -10 ? '#0369a1' : '#991b1b';
    }
    if (mtdEl) {
      mtdEl.textContent = !res.modelValid ? T('Outside Model Domain', '超出模型範圍') : `${res.mtdTraces.toLocaleString()} ${T('Illustrative Traces', '示意曲線')}`;
      mtdEl.style.color = res.modelValid ? '#7e22ce' : '#b45309';
    }
    if (areaEl) areaEl.textContent = `${res.areaMultiplier}× ${T('Assumed Area', '假設面積')}`;

    // Visual Signal Symmetry Bars
    if (barSig0 && barSig1) {
      if (res.arch.id === 'single_ended') {
        barSig0.style.width = '12%';
        barSig1.style.width = '95%';
      } else if (res.arch.id === 'pseudo_diff') {
        barSig0.style.width = '35%';
        barSig1.style.width = '82%';
      } else {
        // True twin-cell: almost identical power envelope
        barSig0.style.width = '88%';
        barSig1.style.width = '90%';
      }
    }

    // 使用同一結果說明假設與定義域，不把示意曲線指標當成安全判定。
    // 複製狀態獨立呈現，不改動模型數值。
    syncMetricCopy([deltaVEl, cmrrEl, dpaDeltaEl, dpaAttenBadge, mtdEl, areaEl]);
    const exportControl=root.querySelector('#diff-export-csv-btn');
    if (exportControl) {
      const chinese=(window.HubLanguage?.get() || document.documentElement.lang || 'en').startsWith('zh');
      exportControl.textContent=chinese ? '📥 匯出差分感測 CSV' : '📥 Export Diff-Sense CSV';
      exportControl.setAttribute('aria-label',chinese ? '匯出差分感測 CSV' : 'Export Diff-Sense CSV');
    }

    if (verdictEl) {
      verdictEl.innerHTML = T(
        `<strong>Illustrative Sensing Comparison:</strong> At ${res.tempC}°C and ${res.cmNoiseMv} mV supply noise, <em>${res.arch.nameEn}</em> produces <strong>${res.deltaVsenseMv} mV (${res.deltaIsenseUa} µA)</strong> under the model assumptions. Leakage is <strong>${res.ileakUa} µA</strong>, referenced to ${res.leakageReferenceTempC}°C. ${res.modelValid ? `The illustrative current discrepancy is ${res.firstOrderDeltaI} µA; CMRR, attenuation, area and trace index use uncalibrated architecture coefficients.` : `<strong>Leakage equals or exceeds programmed-cell current. The assumed read polarity is no longer valid; the sensing margin is shown as zero and the trace index is unavailable.</strong>`} This does not predict key recovery, establish ISO/IEC 17825 or Common Criteria conformance, or prescribe a mandatory bitcell topology. Validate the complete implementation, leakage measurements and attack setup.`,
        `<strong>感測示意比較：</strong> 在 ${res.tempC}°C 與 ${res.cmNoiseMv} mV 供電雜訊下，<em>${res.arch.nameZh}</em> 依本模型假設產生 <strong>${res.deltaVsenseMv} mV (${res.deltaIsenseUa} µA)</strong>。漏電為 <strong>${res.ileakUa} µA</strong>，基準溫度為 ${res.leakageReferenceTempC}°C。${res.modelValid ? `示意電流差為 ${res.firstOrderDeltaI} µA；共模抑制、衰減、面積與曲線指標使用尚未校準的架構係數。` : `<strong>漏電已達到或超過已編程單元電流，原讀取極性假設失效；感測裕度顯示為零，曲線指標不適用。</strong>`} 本結果不能預測金鑰還原、證明 ISO/IEC 17825 或 Common Criteria 符合性，也不能推導特定單元拓撲為認證必備條件；須以完整實作、漏電量測與攻擊條件驗證。`
      );
    }
  }

  // Export CSV Action for Differential Sensing
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
  if (presetContainer && !presetContainer.querySelector('#diff-export-csv-btn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'diff-export-csv-btn';
    exportBtn.type = 'button';
    exportBtn.style.cssText = 'margin-top: 6px; padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.4); background: rgba(15, 23, 42, 0.6); color: #38bdf8; cursor: pointer;';
    const isZh = (window.HubLanguage?.get() || document.documentElement.dataset.language || 'zh') === 'zh';
    exportBtn.textContent = isZh ? '📥 匯出差分感測 CSV' : '📥 Export Diff-Sense CSV';
    exportBtn.addEventListener('click', () => {
      const archId = archSelect?.value || 'true_twin_cell';
      const presetId = presetSelect?.value || 'automotive_grade0_28nm';
      let csv = 'Temp_C,SupplyNoise_mV,DeltaVsense_mV,DeltaIsense_uA,CMRR_dB,Ileak_uA\n';
      for (let t = -40; t <= 175; t += 10) {
        const r = calculateDifferentialSensing({
          presetId,
          archId,
          tempC: t,
          cmNoiseMv: noiseSlider ? Number(noiseSlider.value) : 80,
        });
        csv += `${t},${r.cmNoiseMv},${r.deltaVsenseMv},${r.deltaIsenseUa},${r.cmrrDb},${r.ileakUa}\n`;
      }
      downloadCsv(`differential_sensing_${archId}_${presetId}.csv`, csv);
    });
    presetContainer.appendChild(exportBtn);
  }

  presetSelect?.addEventListener('change', (e) => loadPreset(e.target.value));
  archSelect?.addEventListener('change', update);
  [tempSlider, noiseSlider].forEach((el) => el?.addEventListener('input', update));
  window.addEventListener('hub:language-change', update);
  window.addEventListener('languagechange', update);

  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initDifferentialSensingSimulator());
  } else {
    initDifferentialSensingSimulator();
  }
}
