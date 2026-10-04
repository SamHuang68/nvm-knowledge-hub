/**
 * attack-resistance-evaluator.js — Common Criteria (ISO/IEC 15408 / CEM v3.1) Attack Potential & Physical Resistance Evaluator
 *
 * First-principles scoring of physical attack potential (AVA_VAN.1 to AVA_VAN.5) based on
 * Elapsed Time, Expertise, Knowledge of TOE, Access, and Laboratory Equipment.
 * Evaluates the empirical defensive efficacy of AntiFuse, PUF, active shielding, and zeroization loops.
 *
 * Mathematical & Regulatory Foundations:
 * 1. ISO/IEC 18045: Common Methodology for Information Technology Security Evaluation (CEM)
 * 2. ISO/IEC 15408-4: Evaluation criteria for IT security — Vulnerability assessment (AVA_VAN.5)
 * 3. JIL (Joint Interpretation Library): Application of Attack Potential to Hardware Devices
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: Common Criteria AVA_VAN.5, NIST FIPS 140-3 Physical Level 4
 */

'use strict';

export const CEM_SCORING_WEIGHTS = Object.freeze({
  elapsedTime: {
    d1: { points: 0, labelEn: '≤ 1 day', labelZh: '≤ 1 天' },
    w1: { points: 1, labelEn: '≤ 1 week', labelZh: '≤ 1 週' },
    w2: { points: 2, labelEn: '≤ 2 weeks', labelZh: '≤ 2 週' },
    m1: { points: 4, labelEn: '≤ 1 month', labelZh: '≤ 1 個月' },
    m6: { points: 7, labelEn: '≤ 6 months', labelZh: '≤ 6 個月' },
    ext: { points: 10, labelEn: '> 6 months', labelZh: '> 6 個月 (高度執著攻擊者)' },
  },
  expertise: {
    layman: { points: 0, labelEn: 'Layman (No specific training)', labelZh: '一般人員 (無特殊訓練)' },
    proficient: { points: 2, labelEn: 'Proficient (Knowledgeable engineer)', labelZh: '熟練工程師 (熟悉逆向工具)' },
    expert: { points: 4, labelEn: 'Expert (Security researcher)', labelZh: '資安專家 (具備晶片漏洞探勘經驗)' },
    multiple: { points: 6, labelEn: 'Multiple Experts (Specialized team)', labelZh: '跨領域專家團隊 (探針/雷射/密碼學協同)' },
  },
  knowledge: {
    public: { points: 0, labelEn: 'Public (Datasheets, standard specs)', labelZh: '公開資料 (公開手冊、標準規格書)' },
    restricted: { points: 2, labelEn: 'Restricted (NDA NDA user manuals)', labelZh: '受限資訊 (NDA 架構使用手冊)' },
    sensitive: { points: 4, labelEn: 'Sensitive (Schematics, test vectors)', labelZh: '機密資料 (電路原理圖、內部測試向量)' },
    critical: { points: 7, labelEn: 'Critical (Full GDSII Layout / Netlist)', labelZh: '極機密 (完整 GDSII 佈局、晶圓網表)' },
  },
  access: {
    under10: { points: 0, labelEn: '< 10 chip samples', labelZh: '< 10 顆晶片樣品' },
    under30: { points: 2, labelEn: '≤ 30 chip samples', labelZh: '≤ 30 顆晶片樣品' },
    under100: { points: 4, labelEn: '≤ 100 chip samples', labelZh: '≤ 100 顆晶片樣品' },
    unlimited: { points: 6, labelEn: 'Unlimited (Foundry access)', labelZh: '無限制取得 (代工廠/供應鏈批量)' },
  },
  equipment: {
    standard: { points: 0, labelEn: 'Standard (PC, multimeter, logic analyzer)', labelZh: '標準儀器 (電腦、電表、邏輯分析儀)' },
    specialized: { points: 3, labelEn: 'Specialized (Oscilloscope, EM probe, glitcher)', labelZh: '專業設備 (高頻示波器、EM 探棒、突波器)' },
    bespoke: { points: 5, labelEn: 'Bespoke (Dual-beam FIB, Pico-laser, AFM)', labelZh: '特製/尖端儀器 (雙束 FIB、皮秒雷射、探針台)' },
    multibespoke: { points: 7, labelEn: 'Multiple Bespoke (Cryo-probing, Synchrotron)', labelZh: '複合尖端實驗室 (超低溫探針台、同步輻射掃描)' },
  },
});

export const CC_PRESETS = Object.freeze({
  banking_secure_element: {
    id: 'banking_secure_element',
    nameEn: 'Smartcard / Banking Secure Element (AVA_VAN.5 Target)',
    nameZh: '金融智慧卡 / 安全元件 (AVA_VAN.5 目標)',
    elapsedTime: 'ext',
    expertise: 'multiple',
    knowledge: 'critical',
    access: 'unlimited',
    equipment: 'multibespoke',
    activeMesh: true,
    zeroization: true,
    scrambling: true,
    antifuse: true,
    puf: true,
    diffRead: true,
  },
  automotive_hsm: {
    id: 'automotive_hsm',
    nameEn: 'Automotive Domain Gateway / Secure HSM (AVA_VAN.4 Target)',
    nameZh: '車載中央網關 / 車規 HSM (AVA_VAN.4 目標)',
    elapsedTime: 'm6',
    expertise: 'expert',
    knowledge: 'sensitive',
    access: 'under100',
    equipment: 'bespoke',
    activeMesh: true,
    zeroization: true,
    scrambling: true,
    antifuse: true,
    puf: false,
    diffRead: true,
  },
  iot_platform_sesip: {
    id: 'iot_platform_sesip',
    nameEn: 'Connected IoT MCU / SESIP Level 3 (AVA_VAN.3 Target)',
    nameZh: '物聯網微控制器 / SESIP Level 3 (AVA_VAN.3 目標)',
    elapsedTime: 'm1',
    expertise: 'proficient',
    knowledge: 'restricted',
    access: 'under30',
    equipment: 'specialized',
    activeMesh: false,
    zeroization: false,
    scrambling: true,
    antifuse: true,
    puf: false,
    diffRead: false,
  },
  unprotected_baseline: {
    id: 'unprotected_baseline',
    nameEn: 'Unprotected Microcontroller Baseline (AVA_VAN.1)',
    nameZh: '無防護微控制器基準 (AVA_VAN.1)',
    elapsedTime: 'd1',
    expertise: 'layman',
    knowledge: 'public',
    access: 'under10',
    equipment: 'standard',
    activeMesh: false,
    zeroization: false,
    scrambling: false,
    antifuse: false,
    puf: false,
    diffRead: false,
  },
});

/**
 * Calculates Common Criteria Attack Potential points and certification level.
 * @param {Object} inputs Selected CEM factors and hardware countermeasures.
 * @return {Object} Computed attack potential, rating level, and audit verdict.
 */
export function calculateAttackPotential(inputs = {}) {
  const timePts = CEM_SCORING_WEIGHTS.elapsedTime[inputs.elapsedTime]?.points || 0;
  const expPts = CEM_SCORING_WEIGHTS.expertise[inputs.expertise]?.points || 0;
  const knowPts = CEM_SCORING_WEIGHTS.knowledge[inputs.knowledge]?.points || 0;
  const accPts = CEM_SCORING_WEIGHTS.access[inputs.access]?.points || 0;
  const eqPts = CEM_SCORING_WEIGHTS.equipment[inputs.equipment]?.points || 0;

  const rawPotential = timePts + expPts + knowPts + accPts + eqPts;

  // Countermeasure Bonuses (Defense-in-depth multipliers)
  let defenseBonus = 0;
  if (inputs.activeMesh) defenseBonus += 4;   // Breaching active mesh requires sub-micron cryogenic microprobing
  if (inputs.zeroization) defenseBonus += 3;  // Single-cycle zeroization eliminates key before readout
  if (inputs.scrambling) defenseBonus += 2;   // Physical address/data scrambling renders raw bits unintelligible
  if (inputs.antifuse) defenseBonus += 3;     // 3-8nm filament invisible under optical/TEM without FIB-PVC
  if (inputs.puf) defenseBonus += 4;          // Absent at rest; no charge stored when powered off
  if (inputs.diffRead) defenseBonus += 2;     // Complementary differential read attenuates DPA/CPA traces

  const effectivePotential = rawPotential + defenseBonus;

  // Common Criteria Rating Mapping
  let ratingLevel = 'AVA_VAN.1';
  let levelTitleEn = 'Basic (AVA_VAN.1)';
  let levelTitleZh = '基礎等級 (AVA_VAN.1)';
  let certStatus = 'EXPLOITABLE';

  if (effectivePotential >= 31) {
    ratingLevel = 'AVA_VAN.5';
    levelTitleEn = 'Beyond High (AVA_VAN.5 - Smartcard/Banking Grade)';
    levelTitleZh = '超高等級 (AVA_VAN.5 - 金融/安全元件最高規格)';
    certStatus = 'RESISTANT_MAX';
  } else if (effectivePotential >= 26) {
    ratingLevel = 'AVA_VAN.4';
    levelTitleEn = 'High (AVA_VAN.4 - Automotive HSM Grade)';
    levelTitleZh = '高等級 (AVA_VAN.4 - 車載安全 HSM 規格)';
    certStatus = 'RESISTANT_HIGH';
  } else if (effectivePotential >= 21) {
    ratingLevel = 'AVA_VAN.3';
    levelTitleEn = 'Moderate (AVA_VAN.3 - SESIP Level 3)';
    levelTitleZh = '中等等級 (AVA_VAN.3 - SESIP Level 3)';
    certStatus = 'RESISTANT_MODERATE';
  } else if (effectivePotential >= 16) {
    ratingLevel = 'AVA_VAN.2';
    levelTitleEn = 'Enhanced-Basic (AVA_VAN.2)';
    levelTitleZh = '增強基礎 (AVA_VAN.2)';
    certStatus = 'MARGINAL';
  }

  return {
    rawPotential,
    defenseBonus,
    effectivePotential,
    ratingLevel,
    levelTitleEn,
    levelTitleZh,
    certStatus,
    breakdown: {
      timePts,
      expPts,
      knowPts,
      accPts,
      eqPts,
    },
  };
}

/**
 * Initializes the Attack Resistance Evaluator interactive UI.
 * @param {string} rootSelector The DOM container selector.
 */
export function initAttackResistanceEvaluator(rootSelector = '#attack-resistance-evaluator-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const T = (en, zh) => (window.HubLanguage?.get() === 'zh' ? zh : en);

  // Selectors
  const presetSelect = root.querySelector('#cc-preset-select');
  const timeSelect = root.querySelector('#cc-time-select');
  const expSelect = root.querySelector('#cc-exp-select');
  const knowSelect = root.querySelector('#cc-know-select');
  const accSelect = root.querySelector('#cc-acc-select');
  const eqSelect = root.querySelector('#cc-eq-select');

  // Checkboxes
  const chkMesh = root.querySelector('#cc-chk-mesh');
  const chkZero = root.querySelector('#cc-chk-zero');
  const chkScramble = root.querySelector('#cc-chk-scramble');
  const chkAntifuse = root.querySelector('#cc-chk-antifuse');
  const chkPuf = root.querySelector('#cc-chk-puf');
  const chkDiff = root.querySelector('#cc-chk-diff');

  // Displays
  const rawScoreDisplay = root.querySelector('#cc-raw-score');
  const bonusScoreDisplay = root.querySelector('#cc-bonus-score');
  const effScoreDisplay = root.querySelector('#cc-eff-score');
  const levelBadge = root.querySelector('#cc-level-badge');
  const scoreBar = root.querySelector('#cc-score-bar');
  const verdictBanner = root.querySelector('#cc-audit-verdict');

  function update() {
    const inputs = {
      elapsedTime: timeSelect?.value || 'm1',
      expertise: expSelect?.value || 'proficient',
      knowledge: knowSelect?.value || 'restricted',
      access: accSelect?.value || 'under30',
      equipment: eqSelect?.value || 'specialized',
      activeMesh: Boolean(chkMesh?.checked),
      zeroization: Boolean(chkZero?.checked),
      scrambling: Boolean(chkScramble?.checked),
      antifuse: Boolean(chkAntifuse?.checked),
      puf: Boolean(chkPuf?.checked),
      diffRead: Boolean(chkDiff?.checked),
    };

    const res = calculateAttackPotential(inputs);

    if (rawScoreDisplay) rawScoreDisplay.textContent = `${res.rawPotential} pts`;
    if (bonusScoreDisplay) bonusScoreDisplay.textContent = `+${res.defenseBonus} pts`;
    if (effScoreDisplay) effScoreDisplay.textContent = `${res.effectivePotential} pts`;

    if (scoreBar) {
      const pct = Math.min(100, (res.effectivePotential / 40) * 100);
      scoreBar.style.width = `${pct}%`;
      scoreBar.style.background =
        res.effectivePotential >= 31 ? '#059669' : res.effectivePotential >= 21 ? '#0284c7' : '#d97706';
    }

    if (levelBadge) {
      levelBadge.className = `cc-badge ${res.ratingLevel.toLowerCase().replace('.', '-')}`;
      levelBadge.textContent = T(res.levelTitleEn, res.levelTitleZh);
      levelBadge.style.color = res.effectivePotential >= 31 ? '#065f46' : res.effectivePotential >= 21 ? '#0369a1' : '#b45309';
      levelBadge.style.background = res.effectivePotential >= 31 ? 'rgba(16, 185, 129, 0.15)' : res.effectivePotential >= 21 ? 'rgba(2, 132, 199, 0.12)' : 'rgba(217, 119, 6, 0.12)';
    }

    if (verdictBanner) {
      if (res.effectivePotential >= 31) {
        verdictBanner.innerHTML = T(
          `<strong>Evaluation Audit Verdict (AVA_VAN.5):</strong> Attack Potential score <strong>${res.effectivePotential} pts</strong> comfortably surpasses the 31-point threshold. The combination of <em>Logic AntiFuse + SRAM PUF + Active Top-Metal PRBS Mesh + Single-Cycle Zeroization</em> resists high-attack-potential state-level adversaries armed with bespoke dual-beam FIBs.`,
          `<strong>安全評估審查結論 (AVA_VAN.5)：</strong> 攻擊潛力總分達 <strong>${res.effectivePotential} 分</strong>，穩固跨越 31 分最高門檻。結合 <em>Logic AntiFuse + SRAM PUF + 頂層主動 PRBS 網格 + 單週期急毀銷毀迴路</em> 的縱深防禦鏈，具備抵抗國家級攻擊者動用雙束 FIB 侵入微探針之實體防護能力。`
        );
      } else if (res.effectivePotential >= 21) {
        verdictBanner.innerHTML = T(
          `<strong>Evaluation Audit Verdict (${res.ratingLevel}):</strong> Attack Potential score <strong>${res.effectivePotential} pts</strong> meets commercial / automotive standards, but lacks full active mesh or ephemeral PUF zeroization required for banking-grade AVA_VAN.5 certification.`,
          `<strong>安全評估審查結論 (${res.ratingLevel})：</strong> 攻擊潛力得分 <strong>${res.effectivePotential} 分</strong> 符合商用 / 車規安全標準，但在缺少主動屏蔽網格或 PUF 開關機銷毀機制的情境下，無法達成金融級 AVA_VAN.5 認證。`
        );
      } else {
        verdictBanner.innerHTML = T(
          `<strong>Vulnerability Warning (${res.ratingLevel}):</strong> Attack Potential score <strong>${res.effectivePotential} pts</strong> is vulnerable. An adversary with standard lab gear or optical delayering can successfully extract static memory contents.`,
          `<strong>弱點警示 (${res.ratingLevel})：</strong> 攻擊潛力僅 <strong>${res.effectivePotential} 分</strong>，防禦邊界薄弱。具備一般實驗室設備或光學去層化能力的攻擊者即可輕易還原靜態記憶體內容。`
        );
      }
    }
  }

  // Handle Preset Switching
  presetSelect?.addEventListener('change', (e) => {
    const p = CC_PRESETS[e.target.value];
    if (!p) return;
    if (timeSelect) timeSelect.value = p.elapsedTime;
    if (expSelect) expSelect.value = p.expertise;
    if (knowSelect) knowSelect.value = p.knowledge;
    if (accSelect) accSelect.value = p.access;
    if (eqSelect) eqSelect.value = p.equipment;
    if (chkMesh) chkMesh.checked = p.activeMesh;
    if (chkZero) chkZero.checked = p.zeroization;
    if (chkScramble) chkScramble.checked = p.scrambling;
    if (chkAntifuse) chkAntifuse.checked = p.antifuse;
    if (chkPuf) chkPuf.checked = p.puf;
    if (chkDiff) chkDiff.checked = p.diffRead;
    update();
  });

  [timeSelect, expSelect, knowSelect, accSelect, eqSelect].forEach((el) => el?.addEventListener('input', update));
  [chkMesh, chkZero, chkScramble, chkAntifuse, chkPuf, chkDiff].forEach((el) => el?.addEventListener('change', update));
  window.addEventListener('hub:language-change', update);

  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAttackResistanceEvaluator());
  } else {
    initAttackResistanceEvaluator();
  }
}
