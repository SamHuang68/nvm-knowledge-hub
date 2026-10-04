/**
 * automotive-mission-profile.js — Automotive Mission Profile Cumulative Thermal Aging & Lifetime Reliability Calculator
 *
 * First-principles Arrhenius damage accumulation (Miner's Rule) across automotive thermal envelopes
 * (AEC-Q100 Grade 0/1/2, ISO 26262 ASIL-D, JESD22-A103 HTSL, AEC-Q100-005 NVM qualification).
 *
 * Mathematical Foundations:
 * 1. Arrhenius Acceleration Factor: AF(T_ref, T_i) = exp[(E_a / k_B) * (1 / T_ref - 1 / T_i)]
 * 2. Equivalent Operating Time: t_equiv(T_ref) = sum(t_i * AF(T_ref, T_i))
 * 3. Required HTSL Qualification Bake: t_qual = t_equiv(T_ref) / AF(T_ref, T_bake)
 * 4. Thermal Retention Margin: Margin = t_qual_standard / t_qual_required
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: AEC-Q100 Rev H, ISO 26262 ASIL-D, JESD22-A103E, AEC-Q100-005
 */

'use strict';

export const KB_EV = 8.617333262e-5; // Boltzmann constant in eV/K

export const AUTOMOTIVE_NVM_PHYSICS = Object.freeze({
  antifuse_otp: {
    id: 'antifuse_otp',
    nameEn: 'Logic AntiFuse OTP (Recrystallized Filament)',
    nameZh: '邏輯 AntiFuse OTP (微絲再結晶結構)',
    eaEV: 1.85,
    mechanismEn: 'Permanent localized gate-oxide dielectric breakdown filament; zero thermionic charge decay.',
    mechanismZh: '閘氧化層永久局部擊穿微絲，無電荷儲存熱游離衰減，高溫熱穩定性極高。',
    gradeCompliance: 'Grade 0 (175°C Tj, >20 Yrs)',
  },
  floating_gate_eflash: {
    id: 'floating_gate_eflash',
    nameEn: 'Floating-Gate eFlash (Charge Trap / Poly)',
    nameZh: '浮閘 eFlash (多晶矽電荷儲存)',
    eaEV: 1.15,
    mechanismEn: 'Isolated poly island subject to thermionic emission and trap-assisted leakage at high Tj.',
    mechanismZh: '多晶矽浮閘電荷在高溫下受熱電子發射與陷阱輔助穿隧 (TAT) 洩漏，高溫留存衰退顯著。',
    gradeCompliance: 'Grade 1 (125°C Tj) / Marginal Grade 0',
  },
  stt_emram: {
    id: 'stt_emram',
    nameEn: 'Embedded STT-MRAM (Perpendicular MTJ)',
    nameZh: '嵌入式 STT-MRAM (垂直磁阻式 MTJ)',
    eaEV: 1.35,
    mechanismEn: 'Thermal stability factor Delta = Ku*V / (k_B*T) governs thermal reversal of magnetic moment.',
    mechanismZh: '熱穩定性因數 Delta = Ku*V / (k_B*T) 決定磁矩熱翻轉機率，高溫環境需特殊耐溫 MTJ 材料。',
    gradeCompliance: 'Grade 1 (125°C Tj) / Qualified Grade 0',
  },
});

export const AUTOMOTIVE_MISSION_PRESETS = Object.freeze({
  powertrain_grade0: {
    id: 'powertrain_grade0',
    nameEn: 'Powertrain / Engine Compartment ECU (AEC-Q100 Grade 0)',
    nameZh: '動力總成 / 引擎艙控制單元 ECU (AEC-Q100 Grade 0)',
    totalHours: 15000,
    tempBins: [
      { tempC: 175, hours: 400 },
      { tempC: 150, hours: 2600 },
      { tempC: 125, hours: 5000 },
      { tempC: 105, hours: 4000 },
      { tempC: 85, hours: 2000 },
      { tempC: 40, hours: 1000 },
    ],
    refTempC: 150,
    testBakeTempC: 175,
    standardBakeHours: 1008, // Standard 1008h (~6 weeks) qualification bake
    descriptionEn: 'Extreme under-the-hood thermal environment with 175°C peak junction temperatures.',
    descriptionZh: '引擎室極端熱環境，峰值接面溫度高達 175°C，要求 15 年以上零缺陷安全留存。',
  },
  braking_chassis_grade1: {
    id: 'braking_chassis_grade1',
    nameEn: 'Braking / Chassis ESC Safety Domain (ISO 26262 ASIL-D / Grade 1)',
    nameZh: '煞車 / 車身動態穩定 ESC 系統 (ISO 26262 ASIL-D / Grade 1)',
    totalHours: 12000,
    tempBins: [
      { tempC: 175, hours: 0 },
      { tempC: 150, hours: 400 },
      { tempC: 125, hours: 2600 },
      { tempC: 105, hours: 5000 },
      { tempC: 85, hours: 3000 },
      { tempC: 40, hours: 1000 },
    ],
    refTempC: 125,
    testBakeTempC: 150,
    standardBakeHours: 1008,
    descriptionEn: 'Critical chassis control requiring sub-0.1 FIT rates and robust retention over 15 years.',
    descriptionZh: '底盤安全攸關節點，要求失效率低於 0.1 FIT，且 15 年全時運作保持安全完整性。',
  },
  adas_domain_grade1: {
    id: 'adas_domain_grade1',
    nameEn: 'ADAS Central Compute / Domain Controller (Grade 1 / High TDP)',
    nameZh: 'ADAS 智駕中央運算 / 網關控制器 (Grade 1 / 高 TDP)',
    totalHours: 20000,
    tempBins: [
      { tempC: 175, hours: 0 },
      { tempC: 150, hours: 100 },
      { tempC: 125, hours: 1900 },
      { tempC: 105, hours: 8000 },
      { tempC: 85, hours: 7000 },
      { tempC: 40, hours: 3000 },
    ],
    refTempC: 125,
    testBakeTempC: 150,
    standardBakeHours: 1008,
    descriptionEn: 'High active duty-cycle autonomous driving platform with sustained 105°C–125°C junction heat.',
    descriptionZh: '長時間高負載自駕運算平台，持續處於 105°C~125°C 接面高溫，累計運算時間長達 20,000 小時。',
  },
  ev_bms_grade2: {
    id: 'ev_bms_grade2',
    nameEn: 'EV Battery Management System (BMS / Grade 2)',
    nameZh: '電動車電池管理系統 (BMS / Grade 2)',
    totalHours: 18000,
    tempBins: [
      { tempC: 175, hours: 0 },
      { tempC: 150, hours: 0 },
      { tempC: 125, hours: 500 },
      { tempC: 105, hours: 4500 },
      { tempC: 85, hours: 8000 },
      { tempC: 40, hours: 5000 },
    ],
    refTempC: 105,
    testBakeTempC: 125,
    standardBakeHours: 1008,
    descriptionEn: 'Pack-level battery monitoring with multi-decade electrochemical state retention requirement.',
    descriptionZh: '電池包級電量監控節點，要求跨十年精準保存電芯健康狀態 (SOH) 與校準金鑰。',
  },
});

/**
 * Calculates cumulative Arrhenius thermal aging and retention margin.
 * @param {Object} inputs Parameters including preset or custom tempBins and target NVM.
 * @return {Object} Computed thermal equivalent hours, required bake, and safety margin.
 */
export function calculateMissionProfileAging(inputs = {}) {
  const preset = AUTOMOTIVE_MISSION_PRESETS[inputs.presetId] || AUTOMOTIVE_MISSION_PRESETS.powertrain_grade0;
  const tempBins = inputs.tempBins || preset.tempBins;
  const refTempC = parseFloat(inputs.refTempC) || preset.refTempC;
  const testBakeTempC = parseFloat(inputs.testBakeTempC) || preset.testBakeTempC;
  const standardBakeHours = parseFloat(inputs.standardBakeHours) || preset.standardBakeHours;

  const tRefK = refTempC + 273.15;
  const tBakeK = testBakeTempC + 273.15;

  const results = {};

  Object.entries(AUTOMOTIVE_NVM_PHYSICS).forEach(([techId, tech]) => {
    let tEquivRefHours = 0;
    const binBreakdown = [];

    tempBins.forEach((bin) => {
      const tBinK = bin.tempC + 273.15;
      // AF relative to T_ref: exp[(Ea / kB) * (1/T_ref - 1/T_bin)]
      // Note: If T_bin > T_ref, (1/T_ref - 1/T_bin) > 0, AF > 1 (accelerates)
      const af = Math.exp((tech.eaEV / KB_EV) * (1 / tRefK - 1 / tBinK));
      const equivHrs = bin.hours * af;
      tEquivRefHours += equivHrs;
      binBreakdown.push({
        tempC: bin.tempC,
        hours: bin.hours,
        af: parseFloat(af.toFixed(3)),
        equivHours: parseFloat(equivHrs.toFixed(1)),
      });
    });

    // AF between test bake and T_ref:
    const afBake = Math.exp((tech.eaEV / KB_EV) * (1 / tRefK - 1 / tBakeK));
    // Required test bake hours to cover the entire mission profile:
    const requiredBakeHours = tEquivRefHours / afBake;
    // Retention margin = standard test bake hours / required bake hours
    const retentionMargin = standardBakeHours / Math.max(1, requiredBakeHours);

    // Qualitative assessment
    let status = 'ROBUST_PASS';
    if (retentionMargin < 1.0) {
      status = 'FAIL_INSUFFICIENT_MARGIN';
    } else if (retentionMargin < 1.5) {
      status = 'MARGINAL_RISK';
    }

    results[techId] = {
      tech,
      tEquivRefHours: parseFloat(tEquivRefHours.toFixed(1)),
      afBake: parseFloat(afBake.toFixed(2)),
      requiredBakeHours: parseFloat(requiredBakeHours.toFixed(1)),
      retentionMargin: parseFloat(retentionMargin.toFixed(2)),
      status,
      binBreakdown,
    };
  });

  return {
    preset,
    refTempC,
    testBakeTempC,
    standardBakeHours,
    results,
  };
}

/**
 * Initializes the Automotive Mission Profile interactive UI.
 * @param {string} rootSelector The DOM container selector.
 */
export function initAutomotiveMissionProfile(rootSelector = '#automotive-mission-profile-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const T = (en, zh) => (window.HubLanguage?.get() === 'zh' ? zh : en);

  const presetSelect = root.querySelector('#auto-preset-select');
  const bakeTempSelect = root.querySelector('#auto-baketemp-select');
  const bakeHoursInput = root.querySelector('#auto-bakehours-input');

  // Temp bin sliders / inputs
  const slider175 = root.querySelector('#bin-hours-175');
  const slider150 = root.querySelector('#bin-hours-150');
  const slider125 = root.querySelector('#bin-hours-125');
  const slider105 = root.querySelector('#bin-hours-105');
  const slider85 = root.querySelector('#bin-hours-85');
  const slider40 = root.querySelector('#bin-hours-40');

  // Display badges
  const val175 = root.querySelector('#bin-val-175');
  const val150 = root.querySelector('#bin-val-150');
  const val125 = root.querySelector('#bin-val-125');
  const val105 = root.querySelector('#bin-val-105');
  const val85 = root.querySelector('#bin-val-85');
  const val40 = root.querySelector('#bin-val-40');

  const totalHoursBadge = root.querySelector('#auto-total-hours');

  // Cards
  const cardAntifuse = root.querySelector('#card-antifuse-margin');
  const cardEflash = root.querySelector('#card-eflash-margin');
  const cardMram = root.querySelector('#card-mram-margin');
  const verdictBox = root.querySelector('#auto-mission-verdict');

  function loadPreset(presetKey) {
    const p = AUTOMOTIVE_MISSION_PRESETS[presetKey] || AUTOMOTIVE_MISSION_PRESETS.powertrain_grade0;
    p.tempBins.forEach((b) => {
      if (b.tempC === 175 && slider175) slider175.value = b.hours;
      if (b.tempC === 150 && slider150) slider150.value = b.hours;
      if (b.tempC === 125 && slider125) slider125.value = b.hours;
      if (b.tempC === 105 && slider105) slider105.value = b.hours;
      if (b.tempC === 85 && slider85) slider85.value = b.hours;
      if (b.tempC === 40 && slider40) slider40.value = b.hours;
    });
    if (bakeTempSelect) bakeTempSelect.value = String(p.testBakeTempC);
    if (bakeHoursInput) bakeHoursInput.value = String(p.standardBakeHours);
    update();
  }

  function update() {
    const h175 = parseFloat(slider175?.value || 0);
    const h150 = parseFloat(slider150?.value || 0);
    const h125 = parseFloat(slider125?.value || 0);
    const h105 = parseFloat(slider105?.value || 0);
    const h85 = parseFloat(slider85?.value || 0);
    const h40 = parseFloat(slider40?.value || 0);

    if (val175) val175.textContent = `${h175} hrs`;
    if (val150) val150.textContent = `${h150} hrs`;
    if (val125) val125.textContent = `${h125} hrs`;
    if (val105) val105.textContent = `${h105} hrs`;
    if (val85) val85.textContent = `${h85} hrs`;
    if (val40) val40.textContent = `${h40} hrs`;

    const totalH = h175 + h150 + h125 + h105 + h85 + h40;
    if (totalHoursBadge) totalHoursBadge.textContent = `${totalH.toLocaleString()} hrs (~${(totalH / 8760).toFixed(1)} yrs operating)`;

    const tempBins = [
      { tempC: 175, hours: h175 },
      { tempC: 150, hours: h150 },
      { tempC: 125, hours: h125 },
      { tempC: 105, hours: h105 },
      { tempC: 85, hours: h85 },
      { tempC: 40, hours: h40 },
    ];

    const testBakeTempC = parseFloat(bakeTempSelect?.value || 175);
    const standardBakeHours = parseFloat(bakeHoursInput?.value || 1008);

    const data = calculateMissionProfileAging({
      presetId: presetSelect?.value || 'powertrain_grade0',
      tempBins,
      refTempC: 150,
      testBakeTempC,
      standardBakeHours,
    });

    // Populate Cards
    const renderCard = (el, res, isZeroMask) => {
      if (!el) return;
      const margin = res.retentionMargin;
      const isPass = margin >= 1.0;
      const isRobust = margin >= 2.0;

      el.querySelector('.margin-val').textContent = `${margin}×`;
      el.querySelector('.margin-val').style.color = isRobust ? '#059669' : isPass ? '#0284c7' : '#dc2626';
      el.querySelector('.equiv-hours').textContent = `${res.tEquivRefHours.toLocaleString()} hrs`;
      el.querySelector('.bake-req').textContent = `${res.requiredBakeHours.toLocaleString()} hrs`;

      const badge = el.querySelector('.status-badge');
      if (badge) {
        if (isRobust) {
          badge.textContent = T('ROBUST QUALIFIED (PASS)', '嚴格達標 (PASS)');
          badge.style.background = 'rgba(16, 185, 129, 0.15)';
          badge.style.color = '#065f46';
          badge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        } else if (isPass) {
          badge.textContent = T('MARGINAL PASS', '邊際通過 (MARGINAL)');
          badge.style.background = 'rgba(2, 132, 199, 0.15)';
          badge.style.color = '#0369a1';
          badge.style.borderColor = 'rgba(2, 132, 199, 0.3)';
        } else {
          badge.textContent = T('AT RISK / FAIL', '存在留存風險 (FAIL)');
          badge.style.background = 'rgba(239, 68, 68, 0.15)';
          badge.style.color = '#991b1b';
          badge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        }
      }
    };

    renderCard(cardAntifuse, data.results.antifuse_otp, true);
    renderCard(cardEflash, data.results.floating_gate_eflash, false);
    renderCard(cardMram, data.results.stt_emram, false);

    // Architectural Verdict
    if (verdictBox) {
      const afMargin = data.results.antifuse_otp.retentionMargin;
      const fgMargin = data.results.floating_gate_eflash.retentionMargin;

      if (h175 > 0 || h150 > 1500) {
        verdictBox.innerHTML = T(
          `<strong>AEC-Q100 Grade 0 Mission Verdict:</strong> Under extreme thermal stress (150°C–175°C peak), Logic AntiFuse retains a robust <strong>${afMargin}× safety margin</strong> due to its high activation energy (Ea = 1.85 eV, permanent silicon filament). Conversely, Floating-Gate eFlash drops to a <strong>${fgMargin}× margin</strong> (${fgMargin < 1.0 ? 'FAIL: data corruption risk prior to 15 years' : 'tight margin requiring heavy ECC/derating'}). STT-MRAM requires certified high-temperature MTJ stacks to prevent magnetic domain relaxation.`,
          `<strong>AEC-Q100 Grade 0 車規任務審查結論：</strong> 在極端熱應力（150°C~175°C 峰值）下，邏輯 AntiFuse 憑藉超高活化能（Ea = 1.85 eV 與永久矽微絲物理）保有高達 <strong>${afMargin} 倍的安全留存餘裕</strong>。相形之下，浮閘 eFlash 餘裕大幅壓縮至 <strong>${fgMargin} 倍</strong>（${fgMargin < 1.0 ? '未達標：15 年使用期內存在電荷流失導致位元毀損風險' : '邊際達標，需依賴高階 ECC 與頻繁刷新'}）。STT-MRAM 則需經過高溫熱穩定性優化的垂直 MTJ 材料方能抵禦熱翻轉。`
        );
      } else {
        verdictBox.innerHTML = T(
          `<strong>AEC-Q100 Grade 1 Mission Verdict:</strong> For cabin/ADAS thermal profiles (<125°C), all three technologies satisfy standard 1,008-hour qualification bake requirements. Logic AntiFuse provides <strong>${afMargin}× margin</strong> (zero-mask cost advantage), while STT-MRAM offers high-speed in-place execution for real-time sensor processing.`,
          `<strong>AEC-Q100 Grade 1 任務審查結論：</strong> 在座艙與智駕溫區（<125°C）下，三種技術均能通過標準 1,008 小時認證烘烤。AntiFuse 提供 <strong>${afMargin} 倍的高餘裕</strong>且具備 0 光罩成本優勢；STT-MRAM 則為即時感測器融合提供高速原地執行 (XIP) 能力。`
        );
      }
    }
  }

  presetSelect?.addEventListener('change', (e) => loadPreset(e.target.value));
  [bakeTempSelect, bakeHoursInput, slider175, slider150, slider125, slider105, slider85, slider40].forEach((el) => {
    el?.addEventListener('input', update);
  });
  window.addEventListener('hub:language-change', update);

  // Initialize
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAutomotiveMissionProfile());
  } else {
    initAutomotiveMissionProfile();
  }
}
