/**
 * sram-yield-bira-simulator.js — Advanced SoC SRAM Yield Recovery & BIRA Economics Simulator
 *
 * First-principles mathematical modeling of random defect statistics (Poisson & Murphy yield models),
 * Built-In Redundancy Analysis (BIRA) repair allocation, and wafer-level economic value recovery.
 *
 * Mathematical Foundations:
 * 1. Die Critical Defect Average: lambda_die = (D_0 / 100) * A_die
 * 2. Baseline Unrepaired Yield: Y_base = exp(-lambda_die)
 * 3. Bank-level Poisson Defect Repair: P_bank = sum(k=0..R_spare, lambda_bank^k * exp(-lambda_bank) / k!)
 * 4. Repaired Chip Yield: Y_repaired = exp(-lambda_logic) * (P_bank)^N_banks
 * 5. Gross Die Per Wafer (300mm): GDPW = floor(pi*(d/2)^2 / A_die - pi*d / sqrt(2*A_die))
 * 6. Financial Recovery per Wafer: Delta_Revenue = (Y_repaired - Y_base) * GDPW * ASP
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: IEEE TSM, Sematech Yield Models, TSMC OIP BIRA Specifications
 */

'use strict';

export const SRAM_YIELD_PRESETS = Object.freeze({
  n3_ai_accelerator: {
    id: 'n3_ai_accelerator',
    nameEn: '3nm FinFET/GAA AI Training Accelerator (Large Die)',
    nameZh: '3nm FinFET/GAA AI 訓練加速器 (超大晶片)',
    dieAreaMm2: 360,
    sramAreaPct: 65, // 65% SRAM cache
    defectDensityD0: 0.08, // 0.08 defects / cm^2
    numBanks: 32,
    sparePerBank: 3, // 3 redundant rows/cols
    dieAspUsd: 380,
    waferCostUsd: 20000,
    descriptionEn: 'Massive SRAM array with 65% silicon footprint; without BIRA, yield drops below 50%.',
    descriptionZh: '巨量 SRAM 快取佔據 65% 晶片面積；若無 BIRA 備援修復，原始良率將跌破 50%。',
  },
  n5_flagship_soc: {
    id: 'n5_flagship_soc',
    nameEn: '5nm Mobile Flagship AP / Modem SoC',
    nameZh: '5nm 手機旗艦處理器 / 數據機 SoC',
    dieAreaMm2: 115,
    sramAreaPct: 52,
    defectDensityD0: 0.06,
    numBanks: 16,
    sparePerBank: 2,
    dieAspUsd: 95,
    waferCostUsd: 14000,
    descriptionEn: 'Mainstream advanced node AP balancing CPU/GPU SRAM cache yield and fuse area.',
    descriptionZh: '主流先進節點旗艦處理器，在 CPU/GPU 快取良率與 NVM 熔絲面積間取得最佳平衡。',
  },
  n16_automotive_mcu: {
    id: 'n16_automotive_mcu',
    nameEn: '16nm Automotive Domain Controller MCU',
    nameZh: '16nm 車載網關 / 域控制器 MCU',
    dieAreaMm2: 55,
    sramAreaPct: 40,
    defectDensityD0: 0.04,
    numBanks: 8,
    sparePerBank: 2,
    dieAspUsd: 32,
    waferCostUsd: 6500,
    descriptionEn: 'Automotive microcontroller demanding near-zero defectivity and reliable OTP repair.',
    descriptionZh: '車規級微控制器，要求極低瑕疵率與高可靠 AntiFuse 熔絲位址固化。',
  },
});

/**
 * Calculates factorial helper for Poisson terms.
 * @param {number} n
 * @return {number}
 */
function factorial(n) {
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

/**
 * Calculates Poisson cumulative probability for repairable defect count.
 * @param {number} lambda Defect expectation in block.
 * @param {number} maxSpares Maximum redundant repair elements.
 * @return {number} Probability of bank repair.
 */
function poissonCdf(lambda, maxSpares) {
  let prob = 0;
  for (let k = 0; k <= maxSpares; k++) {
    prob += (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
  }
  return Math.min(1.0, prob);
}

/**
 * Calculates Gross Die Per Wafer (GDPW) for 300mm wafer.
 * @param {number} dieAreaMm2
 * @return {number} Gross dies per wafer.
 */
export function calculateGdpw300mm(dieAreaMm2) {
  const d = 300; // mm
  const r = d / 2;
  const waferArea = Math.PI * r * r;
  const edgeExclusionPenalty = (Math.PI * d) / Math.sqrt(2 * dieAreaMm2);
  const rawGdpw = waferArea / dieAreaMm2 - edgeExclusionPenalty;
  return Math.max(1, Math.floor(rawGdpw));
}

/**
 * Calculates SRAM yield recovery and financial value per wafer.
 * @param {Object} inputs Parameters.
 * @return {Object} Computed yield metrics and dollar savings.
 */
export function calculateSramYieldRecovery(inputs = {}) {
  const preset = SRAM_YIELD_PRESETS[inputs.presetId] || SRAM_YIELD_PRESETS.n3_ai_accelerator;
  const dieAreaMm2 = Math.max(10, parseFloat(inputs.dieAreaMm2) || preset.dieAreaMm2);
  const sramAreaPct = Math.min(90, Math.max(10, parseFloat(inputs.sramAreaPct) || preset.sramAreaPct));
  const defectDensityD0 = Math.max(0.01, parseFloat(inputs.defectDensityD0) || preset.defectDensityD0);
  const numBanks = Math.max(1, parseInt(inputs.numBanks, 10) || preset.numBanks);
  const sparePerBank = Math.max(0, parseInt(inputs.sparePerBank, 10) || preset.sparePerBank);
  const dieAspUsd = Math.max(1, parseFloat(inputs.dieAspUsd) || preset.dieAspUsd);

  // Unit conversion: D0 is in defects/cm^2, 1 cm^2 = 100 mm^2
  const d0Mm2 = defectDensityD0 / 100;

  const sramFraction = sramAreaPct / 100;
  const logicFraction = 1 - sramFraction;

  const aSramMm2 = dieAreaMm2 * sramFraction;
  const aLogicMm2 = dieAreaMm2 * logicFraction;

  const lambdaDie = d0Mm2 * dieAreaMm2;
  const lambdaLogic = d0Mm2 * aLogicMm2;
  const lambdaSram = d0Mm2 * aSramMm2;

  // 1. Baseline Yield (Without Redundancy Repair)
  // Poisson:
  const yBasePoisson = Math.exp(-lambdaDie);
  // Murphy (Clustering):
  const yBaseMurphy = lambdaDie > 0 ? Math.pow((1 - Math.exp(-lambdaDie)) / lambdaDie, 2) : 1;

  // Logic base yield:
  const yLogic = Math.exp(-lambdaLogic);
  // SRAM base yield:
  const ySramBase = Math.exp(-lambdaSram);

  // 2. BIRA Repaired Yield
  const lambdaBank = lambdaSram / numBanks;
  const pBankRepair = poissonCdf(lambdaBank, sparePerBank);
  const ySramRepaired = Math.pow(pBankRepair, numBanks);
  const yRepaired = yLogic * ySramRepaired;

  // 3. Wafer Economics (300mm)
  const gdpw = calculateGdpw300mm(dieAreaMm2);
  const goodDieBase = Math.round(gdpw * yBasePoisson);
  const goodDieRepaired = Math.round(gdpw * yRepaired);
  const extraGoodDies = Math.max(0, goodDieRepaired - goodDieBase);

  const deltaYieldPct = (yRepaired - yBasePoisson) * 100;
  const valueRecoveredPerWafer = extraGoodDies * dieAspUsd;
  const annualRun10kWafersUsd = valueRecoveredPerWafer * 10000;

  return {
    dieAreaMm2,
    sramAreaPct,
    defectDensityD0,
    numBanks,
    sparePerBank,
    dieAspUsd,
    gdpw,
    yields: {
      baselinePct: parseFloat((yBasePoisson * 100).toFixed(2)),
      murphyPct: parseFloat((yBaseMurphy * 100).toFixed(2)),
      repairedPct: parseFloat((yRepaired * 100).toFixed(2)),
      deltaYieldPct: parseFloat(deltaYieldPct.toFixed(2)),
      sramBasePct: parseFloat((ySramBase * 100).toFixed(2)),
      sramRepairedPct: parseFloat((ySramRepaired * 100).toFixed(2)),
      logicPct: parseFloat((yLogic * 100).toFixed(2)),
    },
    dies: {
      goodDieBase,
      goodDieRepaired,
      extraGoodDies,
    },
    economics: {
      valueRecoveredPerWafer: Math.round(valueRecoveredPerWafer),
      annualRun10kWafersUsd: Math.round(annualRun10kWafersUsd),
    },
    preset,
  };
}

/**
 * Initializes the SRAM Yield Recovery interactive UI.
 * @param {string} rootSelector The DOM container selector.
 */
export function initSramYieldBiraSimulator(rootSelector = '#sram-yield-bira-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const T = (en, zh) => (window.HubLanguage?.get() === 'zh' ? zh : en);

  const presetSelect = root.querySelector('#bira-preset-select');
  const dieAreaInput = root.querySelector('#bira-diearea-input');
  const sramPctSlider = root.querySelector('#bira-srampict-slider');
  const sramPctVal = root.querySelector('#bira-srampct-val');
  const d0Slider = root.querySelector('#bira-d0-slider');
  const d0Val = root.querySelector('#bira-d0-val');
  const spareSelect = root.querySelector('#bira-spare-select');
  const aspInput = root.querySelector('#bira-asp-input');

  const baselineYieldEl = root.querySelector('#bira-base-yield');
  const repairedYieldEl = root.querySelector('#bira-repaired-yield');
  const deltaYieldBadge = root.querySelector('#bira-delta-yield');
  const extraDiesEl = root.querySelector('#bira-extra-dies');
  const waferValEl = root.querySelector('#bira-wafer-value');
  const annualValEl = root.querySelector('#bira-annual-value');

  const barBase = root.querySelector('#bira-bar-base');
  const barRepair = root.querySelector('#bira-bar-repair');
  const verdictBox = root.querySelector('#bira-yield-verdict');

  function loadPreset(key) {
    const p = SRAM_YIELD_PRESETS[key] || SRAM_YIELD_PRESETS.n3_ai_accelerator;
    if (dieAreaInput) dieAreaInput.value = String(p.dieAreaMm2);
    if (sramPctSlider) sramPctSlider.value = String(p.sramAreaPct);
    if (d0Slider) d0Slider.value = String(p.defectDensityD0);
    if (spareSelect) spareSelect.value = String(p.sparePerBank);
    if (aspInput) aspInput.value = String(p.dieAspUsd);
    update();
  }

  function update() {
    const dieAreaMm2 = parseFloat(dieAreaInput?.value || 360);
    const sramAreaPct = parseFloat(sramPctSlider?.value || 65);
    const defectDensityD0 = parseFloat(d0Slider?.value || 0.08);
    const sparePerBank = parseInt(spareSelect?.value || '3', 10);
    const dieAspUsd = parseFloat(aspInput?.value || 380);

    if (sramPctVal) sramPctVal.textContent = `${sramAreaPct}%`;
    if (d0Val) d0Val.textContent = `${defectDensityD0} /cm²`;

    const res = calculateSramYieldRecovery({
      presetId: presetSelect?.value || 'n3_ai_accelerator',
      dieAreaMm2,
      sramAreaPct,
      defectDensityD0,
      sparePerBank,
      dieAspUsd,
    });

    if (baselineYieldEl) baselineYieldEl.textContent = `${res.yields.baselinePct}%`;
    if (repairedYieldEl) repairedYieldEl.textContent = `${res.yields.repairedPct}%`;
    if (deltaYieldBadge) deltaYieldBadge.textContent = `+${res.yields.deltaYieldPct}%`;
    if (extraDiesEl) extraDiesEl.textContent = `+${res.dies.extraGoodDies.toLocaleString()} dies`;
    if (waferValEl) waferValEl.textContent = `+$${res.economics.valueRecoveredPerWafer.toLocaleString()}`;
    if (annualValEl) annualValEl.textContent = `+$${(res.economics.annualRun10kWafersUsd / 1e6).toFixed(1)}M USD`;

    // Progress Bars
    if (barBase) {
      barBase.style.width = `${res.yields.baselinePct}%`;
      barBase.title = T(`Unrepaired Yield: ${res.yields.baselinePct}%`, `未修復原始良率: ${res.yields.baselinePct}%`);
    }
    if (barRepair) {
      barRepair.style.width = `${res.yields.repairedPct}%`;
      barRepair.title = T(`Repaired Yield: ${res.yields.repairedPct}%`, `BIRA 修復後良率: ${res.yields.repairedPct}%`);
    }

    // Verdict Callout
    if (verdictBox) {
      verdictBox.innerHTML = T(
        `<strong>BIRA Yield Economics Verdict:</strong> On a 300mm wafer (${res.gdpw} GDPW), allocating <strong>${res.sparePerBank} redundant spare rows/columns</strong> per bank recovers die yield from <strong>${res.yields.baselinePct}% to ${res.yields.repairedPct}%</strong> (+${res.yields.deltaYieldPct}% absolute recovery). This yields <strong>+${res.dies.extraGoodDies} good dies per wafer</strong>, recovering <strong>$${res.economics.valueRecoveredPerWafer.toLocaleString()}</strong> in gross wafer value ($${(res.economics.annualRun10kWafersUsd / 1e6).toFixed(1)}M across 10k wafers). Logic AntiFuse 0-mask OTP permanently locks repair addresses at zero wafer cost adder.`,
        `<strong>BIRA 良率經濟學審查結論：</strong> 在 300mm 晶圓（${res.gdpw} GDPW）架構下，每記憶體區塊配置 <strong>${res.sparePerBank} 組備援修復行列</strong>，成功將整體良率從 <strong>${res.yields.baselinePct}% 巨幅拉升至 ${res.yields.repairedPct}%</strong>（良率絕對提升 +${res.yields.deltaYieldPct}%）。每片晶圓實質挽救 <strong>+${res.dies.extraGoodDies} 顆可用晶片</strong>，每片晶圓創造 <strong>$${res.economics.valueRecoveredPerWafer.toLocaleString()} 美元</strong> 的額外產值（萬片量產規模累計挽救 <strong>$${(res.economics.annualRun10kWafersUsd / 1e6).toFixed(1)}M 美元</strong>）。搭配 0 光罩 Logic AntiFuse OTP 進行缺陷位址永久重定向，不增加任何晶圓代工光罩成本。`
      );
    }
  }

  presetSelect?.addEventListener('change', (e) => loadPreset(e.target.value));
  [dieAreaInput, sramPctSlider, d0Slider, spareSelect, aspInput].forEach((el) => {
    el?.addEventListener('input', update);
  });
  window.addEventListener('hub:language-change', update);

  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initSramYieldBiraSimulator());
  } else {
    initSramYieldBiraSimulator();
  }
}
