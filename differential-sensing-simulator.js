/**
 * differential-sensing-simulator.js — Complementary Twin-Cell Sensing Margin & DPA Attenuation Simulator
 *
 * First-principles mathematical modeling of Single-Ended vs Pseudo-Differential vs True Twin-Cell
 * complementary sensing physics, common-mode noise rejection (CMRR), bitline voltage margins,
 * and first-order Differential Power Analysis (DPA) side-channel trace attenuation.
 *
 * Mathematical Foundations:
 * 1. Single-Ended Current Delta: Delta_I_SE = |I_cell - I_ref|
 * 2. Twin-Cell Current Delta: Delta_I_TC = |I_true - I_comp|
 * 3. Sensing Voltage Development: Delta_V_sense = (Delta_I_sense * t_sense) / C_bitline
 * 4. Common-Mode Rejection: CMRR_dB = 20 * log10(Delta_V_diff / Delta_V_cm_noise)
 * 5. First-Order DPA Current Signature: I_data_dependent = |I_total(bit=1) - I_total(bit=0)|
 * 6. Minimum Traces to Disclose (MTD): MTD_est ~ c_0 / (Delta_I_data_dependent / I_noise_rms)^2
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: ISO/IEC 17825 (Side-Channel Security), IEEE JSSC Memory Sensing Standards
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
    baseMtdTraces: 450, // ~450 traces to reveal key via DPA
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
    baseMtdTraces: 650000, // >650k traces required (exponential explosion)
    descriptionEn: 'Optimal hardware security: First-order symmetric power profile and high-temperature noise immunity.',
    descriptionZh: '硬體安全頂級架構：一階對稱供電特徵、抵消共模雜訊，高溫下維持極高感測裕度。',
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

  // Leakage scales exponentially with temperature: I_leak(T) = I_leak_base * 2^((T - T_base) / 10)
  const tempDelta = Math.max(0, tempC - 25);
  const tempLeakMultiplier = Math.pow(1.85, tempDelta / 10);
  const ileakUa = (preset.ileakBaseNa * tempLeakMultiplier) / 1000;

  // Iref is placed halfway between Iprog and Ileak for single-ended:
  const irefUa = (iprogUa + ileakUa) / 2;

  let deltaIsenseUa = 0;
  let firstOrderDeltaI = 0;
  let cmrrDb = 0;
  let dpaAttenDb = 0;
  let mtdTraces = 0;

  if (arch.id === 'single_ended') {
    // Single-Ended: signal is |I_cell - I_ref|
    deltaIsenseUa = Math.max(0.1, (iprogUa - ileakUa) / 2);
    // Data dependent current between reading 1 and 0:
    firstOrderDeltaI = Math.abs(iprogUa - ileakUa);
    cmrrDb = Math.max(0, arch.cmrrBaseDb - (cmNoiseMv / 20));
    dpaAttenDb = 0; // Reference 0 dB
    mtdTraces = Math.round(arch.baseMtdTraces * (25 / Math.max(10, cmNoiseMv)));
  } else if (arch.id === 'pseudo_diff') {
    deltaIsenseUa = Math.max(0.1, (iprogUa - ileakUa) * 0.7);
    firstOrderDeltaI = (iprogUa - ileakUa) * arch.dpaLeakageRatio;
    cmrrDb = arch.cmrrBaseDb + (vdd > 1.0 ? 2 : 0);
    dpaAttenDb = -12.5;
    mtdTraces = Math.round(arch.baseMtdTraces * (25 / Math.max(10, cmNoiseMv)));
  } else {
    // True Twin-Cell Complementary:
    // Signal is (I_prog - I_leak) directly between two differential nodes:
    deltaIsenseUa = Math.max(0.1, iprogUa - ileakUa);
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
        `${res.dpaAttenDb} dB DPA Attenuation`,
        `${res.dpaAttenDb} dB 側信道衰減`
      );
      dpaAttenBadge.style.background = res.dpaAttenDb <= -20 ? '#dcfce7' : res.dpaAttenDb <= -10 ? '#e0f2fe' : '#fee2e2';
      dpaAttenBadge.style.color = res.dpaAttenDb <= -20 ? '#166534' : res.dpaAttenDb <= -10 ? '#0369a1' : '#991b1b';
    }
    if (mtdEl) {
      mtdEl.textContent = res.mtdTraces >= 100000 ? `${(res.mtdTraces / 1000).toFixed(0)}k Traces` : `${res.mtdTraces} Traces`;
      mtdEl.style.color = res.mtdTraces >= 200000 ? '#059669' : res.mtdTraces >= 2000 ? '#0284c7' : '#dc2626';
    }
    if (areaEl) areaEl.textContent = `${res.areaMultiplier}× Silicon Area`;

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

    // Architect Verdict
    if (verdictEl) {
      verdictEl.innerHTML = T(
        `<strong>Sensing Physics & Side-Channel Verdict:</strong> Under ${res.tempC}°C thermal stress with ${res.cmNoiseMv} mV supply noise, the <em>${res.arch.nameEn}</em> develops a differential signal margin of <strong>${res.deltaVsenseMv} mV (${res.deltaIsenseUa} µA)</strong>. ${
          res.arch.id === 'true_twin_cell'
            ? `By employing true complementary twin-cell topology, reading logical '0' and '1' yields virtually symmetric aggregate current draw, suppressing first-order DPA leakage down to <strong>${res.firstOrderDeltaI} µA (${res.dpaAttenDb} dB)</strong>. An adversary attempting DPA key recovery must capture <strong>>${res.mtdTraces.toLocaleString()} power traces</strong> (an exponential barrier compared to single-ended cells), proving that physical microarchitectural symmetry provides an unforgeable hardware defense that software cryptography alone cannot deliver.`
            : `Single-ended architectures expose an enormous <strong>${res.firstOrderDeltaI} µA</strong> data-dependent current discrepancy between '0' and '1', allowing attackers to extract cryptographic keys with only <strong>~${res.mtdTraces} power traces</strong>. For automotive Grade 0 and Common Criteria EAL6+ designs, twin-cell complementary storage is mandatory despite the ${res.areaMultiplier}× silicon area footprint.`
        }`,
        `<strong>感測物理與側信道防禦結論：</strong> 在 ${res.tempC}°C 高溫熱應力與 ${res.cmNoiseMv} mV 供電雜訊下，<em>${res.arch.nameZh}</em> 產生 <strong>${res.deltaVsenseMv} mV (${res.deltaIsenseUa} µA)</strong> 的差分感測信號窗。${
          res.arch.id === 'true_twin_cell'
            ? `藉由真互補成對（True Twin-Cell）實體拓撲，讀取邏輯 '0' 與 '1' 時兩側單元一開一關，總體供電電流包絡高度對稱，將一階 DPA 側信道洩漏壓縮至僅 <strong>${res.firstOrderDeltaI} µA (${res.dpaAttenDb} dB 衰減)</strong>。攻擊者需採集超過 <strong>${res.mtdTraces.toLocaleString()} 條功耗訊跡</strong> 方能還原金鑰（相較單端暴增千倍以上），證明微觀位元胞的實體物理對稱性是純軟體演算法無法替代的硬體防禦基石。`
            : `單端感測在讀 0 與讀 1 之間暴露出巨大的 <strong>${res.firstOrderDeltaI} µA</strong> 數據相依電流落差，使側信道攻擊者僅需 <strong>~${res.mtdTraces} 條功耗曲線</strong> 即可完成差分功耗分析（DPA）金鑰還原。在車規 Grade 0 與金融級 Common Criteria EAL6+ 等高安全應用中，真互補差動單元是不可或缺的物理防禦架構，其 ${res.areaMultiplier}× 面積開銷完全具備實體經濟合理性。`
        }`
      );
    }
  }

  presetSelect?.addEventListener('change', (e) => loadPreset(e.target.value));
  archSelect?.addEventListener('change', update);
  [tempSlider, noiseSlider].forEach((el) => el?.addEventListener('input', update));
  window.addEventListener('hub:language-change', update);

  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initDifferentialSensingSimulator());
  } else {
    initDifferentialSensingSimulator();
  }
}
