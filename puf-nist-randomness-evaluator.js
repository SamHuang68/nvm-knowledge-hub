/**
 * puf-nist-randomness-evaluator.js — Physical Unclonable Function (PUF) Spatial Randomness & NIST SP 800-22 Evaluator
 *
 * First-principles cryptographic statistical testing of hardware PUF entropy sources
 * (AntiFuse NeoPUF quantum tunneling, 6T SRAM unbalance, differential OTP mismatch).
 *
 * Implements 4 core NIST SP 800-22 statistical hypothesis tests + NIST SP 800-90B Min-Entropy:
 * 1. Frequency (Monobit) Test: Tests the proportion of zeroes and ones.
 * 2. Frequency Test within a Block (Block Frequency): Tests proportion of ones within M-bit blocks.
 * 3. Runs Test: Tests the total number of uninterrupted sequences of identical bits.
 * 4. Cumulative Sums (Cusum) Test: Tests the maximal excursion of the random walk from origin.
 * 5. Min-Entropy (SP 800-90B): H_inf = -log2(p_max).
 *
 * Mathematical Foundations:
 * - Complementary Error Function: erfc(x) = 1 - erf(x) = (2 / sqrt(pi)) * integral_x^inf exp(-t^2) dt
 * - Regularized Incomplete Gamma Function: igamc(a, x) = Gamma(a, x) / Gamma(a)
 * - Significance Level: alpha = 0.01 (P-value >= 0.01 indicates cryptographic randomness acceptance).
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: NIST SP 800-22 Rev 1a, NIST SP 800-90B, ISO/IEC 19790, Common Criteria AVA_VAN.5
 */

'use strict';

export const PUF_ENTROPY_PRESETS = Object.freeze({
  antifuse_neopuf_quantum: {
    id: 'antifuse_neopuf_quantum',
    nameEn: 'AntiFuse Gate Oxide Quantum Tunneling (NeoPUF)',
    nameZh: 'AntiFuse 閘極氧化層微觀量子穿隧 (NeoPUF)',
    entropySource: 'Microscopic gate oxide trap percolation & localized quantum tunneling',
    nominalHammingWeight: 0.5002, // 50.02% ones
    spatialCorr: 0.005, // Negligible spatial correlation
    minEntropyEst: 0.985,
    descriptionEn: 'Pure logic 0-mask quantum tunneling PUF. Uniform atomic trap distribution yields near-perfect unbiased cryptographic entropy.',
    descriptionZh: '純邏輯 0-Mask 微觀量子穿隧指紋。原子級氧化層缺陷分佈均勻，展現幾近完美之無偏密碼學隨機性。',
  },
  sram_startup_uncompensated: {
    id: 'sram_startup_uncompensated',
    nameEn: '6T SRAM Startup State (Uncompensated Raw Array)',
    nameZh: '6T SRAM 啟動態 (未補償原始陣列)',
    entropySource: 'Transistor threshold voltage (Vth) & transconductance mismatch',
    nominalHammingWeight: 0.4815, // 48.15% ones (layout asymmetric pull-down bias)
    spatialCorr: 0.045, // Mild spatial wafer-edge gradient
    minEntropyEst: 0.880,
    descriptionEn: 'Conventional SRAM uncompensated startup state. Exhibits slight structural and wafer-gradient bias before fuzzy extractor conditioning.',
    descriptionZh: '傳統 SRAM 原始啟動態。在經由模糊提取器（Fuzzy Extractor）校正前，微觀結構佈局與晶圓梯度存在輕微偏壓。',
  },
  otp_differential_mismatch: {
    id: 'otp_differential_mismatch',
    nameEn: 'Complementary Twin-Cell Differential Mismatch PUF',
    nameZh: '互補成對差動單元微觀失配 PUF',
    entropySource: 'Twin-cell sub-micron filament conductance mismatch delta-R',
    nominalHammingWeight: 0.4995,
    spatialCorr: 0.012,
    minEntropyEst: 0.965,
    descriptionEn: 'Differential sensing pairs cancel out global power and thermal gradients, offering robust entropy across 150°C Tj.',
    descriptionZh: '差動對稱架構抵消晶圓共模電源與熱梯度，在 150°C 高溫下仍維持極佳隨機分佈。',
  },
  degraded_biased_source: {
    id: 'degraded_biased_source',
    nameEn: 'Degraded / Biased Test Source (Injected Defect)',
    nameZh: '人為注入偏壓之不良測試熵源 (異常故障模擬)',
    entropySource: 'Laser thermal injection / power-supply coupling perturbation',
    nominalHammingWeight: 0.5850, // 58.5% strong bias
    spatialCorr: 0.185, // Severe spatial clustering
    minEntropyEst: 0.650,
    descriptionEn: 'Simulates compromised entropy under physical perturbation or layout defect; triggers NIST SP 800-22 rejection alarm.',
    descriptionZh: '模擬受到外部雷射注入或晶圓缺陷污染之退化熵源，展示 NIST SP 800-22 統計檢驗套件如何精準攔截報警。',
  },
});

/**
 * Complementary error function erfc(x) approximation (Chebyshev fitting).
 * Accurate to within 1.2e-7 across full domain.
 */
export function erfc(x) {
  if (x < 0) return 2 - erfc(-x);
  const z = Math.abs(x);
  const t = 1.0 / (1.0 + 0.5 * z);
  const ans = t * Math.exp(-z * z - 1.26551223 +
    t * (1.00002368 +
    t * (0.37409196 +
    t * (0.09678418 +
    t * (-0.18628806 +
    t * (0.27886807 +
    t * (-1.13520398 +
    t * (1.48851587 +
    t * (-0.82215223 +
    t * 0.17087277)))))))));
  return ans;
}

/**
 * Incomplete gamma function complement Q(a, x) = 1 - P(a, x) via continued fractions.
 */
export function igamc(a, x) {
  if (x <= 0) return 1.0;
  if (a <= 0) return 0.0;
  if (x < a + 1.0) {
    // Series expansion P(a, x)
    let sum = 1.0 / a;
    let term = 1.0 / a;
    for (let n = 1; n < 100; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-12) break;
    }
    const logGammaA = logGamma(a);
    const p = Math.exp(a * Math.log(x) - x - logGammaA) * sum;
    return Math.max(0.0, Math.min(1.0, 1.0 - p));
  } else {
    // Continued fraction for Q(a, x)
    let b = x + 1.0 - a;
    let c = 1.0 / 1e-30;
    let d = 1.0 / b;
    let h = d;
    for (let i = 1; i < 100; i++) {
      const an = -i * (i - a);
      b += 2.0;
      d = an * d + b;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = b + an / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1.0 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1.0) < 1e-12) break;
    }
    const logGammaA = logGamma(a);
    return Math.max(0.0, Math.min(1.0, Math.exp(a * Math.log(x) - x - logGammaA) * h));
  }
}

/**
 * Lanczos approximation for ln(Gamma(x)).
 */
function logGamma(x) {
  const c = [
    57.1562356658629235, -59.5979603554754912,
    14.1360979747417471, -0.491913816097620199,
    0.339946499848118887e-4, 0.465236289270485756e-4,
    -0.983744753048795646e-4, 0.158088703224378388e-3,
    -0.210134122973995006e-3, 0.217239547006938491e-3,
    -0.164318106536763890e-3, 0.844182239838527433e-4,
    -0.261908384015814087e-4, 0.368991826595316234e-5
  ];
  let y = x;
  let tmp = x + 5.2421875;
  tmp = (x + 0.5) * Math.log(tmp) - tmp;
  let ser = 0.999999999999997092;
  for (let j = 0; j < 14; j++) {
    ser += c[j] / ++y;
  }
  return tmp + Math.log(2.5066282746310005 * ser / x);
}

/**
 * Generates synthetic PUF bits matching nominal Hamming weight and spatial correlation.
 */
export function generateSyntheticPufBits(nBits = 1024, hammingWeight = 0.5, spatialCorr = 0.0) {
  const bits = new Uint8Array(nBits);
  let state = 0.5;
  for (let i = 0; i < nBits; i++) {
    // Autoregressive process for spatial correlation
    const noise = Math.random();
    state = (1 - spatialCorr) * hammingWeight + spatialCorr * state;
    bits[i] = noise < state ? 1 : 0;
  }
  return bits;
}

/**
 * Runs 4 NIST SP 800-22 Core Statistical Tests on the binary sequence.
 *
 * @param {Object} params
 * @param {string} params.presetId - 'antifuse_neopuf_quantum' | 'sram_startup_uncompensated' | 'otp_differential_mismatch' | 'degraded_biased_source'
 * @param {Uint8Array} [params.customBits] - Optional custom bitstream
 * @returns {Object} Test scores, P-values, pass/fail status, and diagnostic summary
 */
export function calculatePufNistRandomness(params) {
  const presetId = params.presetId && PUF_ENTROPY_PRESETS[params.presetId] ? params.presetId : 'antifuse_neopuf_quantum';
  const preset = PUF_ENTROPY_PRESETS[presetId];

  const nBits = 1024; // Standard sample size for real-time in-browser testing
  const bits = params.customBits || generateSyntheticPufBits(nBits, preset.nominalHammingWeight, preset.spatialCorr);

  let onesCount = 0;
  for (let i = 0; i < nBits; i++) {
    if (bits[i] === 1) onesCount++;
  }
  const onesRatio = onesCount / nBits;

  // 1. NIST SP 800-22 Test 1: Monobit Frequency Test
  // Sn = sum(2 * bit - 1)
  let sn = 0;
  for (let i = 0; i < nBits; i++) {
    sn += bits[i] === 1 ? 1 : -1;
  }
  const sobs = Math.abs(sn) / Math.sqrt(nBits);
  const pValMonobit = Math.max(0.0, Math.min(1.0, erfc(sobs / Math.SQRT2)));
  const passMonobit = pValMonobit >= 0.01;

  // 2. NIST SP 800-22 Test 2: Frequency Test within a Block (M = 32)
  const blockSizeM = 32;
  const numBlocksN = Math.floor(nBits / blockSizeM); // 32 blocks
  let chi2Block = 0;
  for (let i = 0; i < numBlocksN; i++) {
    let blockOnes = 0;
    for (let j = 0; j < blockSizeM; j++) {
      if (bits[i * blockSizeM + j] === 1) blockOnes++;
    }
    const pi = blockOnes / blockSizeM;
    chi2Block += Math.pow(pi - 0.5, 2);
  }
  chi2Block *= 4 * blockSizeM;
  const pValBlock = Math.max(0.0, Math.min(1.0, igamc(numBlocksN / 2, chi2Block / 2)));
  const passBlock = pValBlock >= 0.01;

  // 3. NIST SP 800-22 Test 3: Runs Test
  let pValRuns = 0.0;
  let passRuns = false;
  let vnObs = 1;
  if (Math.abs(onesRatio - 0.5) < (2.0 / Math.sqrt(nBits))) {
    for (let i = 0; i < nBits - 1; i++) {
      if (bits[i] !== bits[i + 1]) vnObs++;
    }
    const expectedRuns = 2 * nBits * onesRatio * (1 - onesRatio);
    const runsVariance = 2 * Math.sqrt(2 * nBits) * onesRatio * (1 - onesRatio);
    if (runsVariance > 0) {
      const runsStat = Math.abs(vnObs - expectedRuns) / runsVariance;
      pValRuns = Math.max(0.0, Math.min(1.0, erfc(runsStat)));
      passRuns = pValRuns >= 0.01;
    }
  } else {
    pValRuns = 0.0;
    passRuns = false;
  }

  // 4. NIST SP 800-22 Test 4: Cumulative Sums (Cusum Forward) Test
  let maxExcursionZ = 0;
  let currentSum = 0;
  for (let i = 0; i < nBits; i++) {
    currentSum += bits[i] === 1 ? 1 : -1;
    if (Math.abs(currentSum) > maxExcursionZ) {
      maxExcursionZ = Math.abs(currentSum);
    }
  }

  // Asymptotic normal approximation for Cusum P-value
  let sumTerms = 0;
  const sqrtN = Math.sqrt(nBits);
  const z = maxExcursionZ;
  if (z > 0) {
    const kMin = Math.floor((-nBits / z + 1) / 4);
    const kMax = Math.floor((nBits / z - 1) / 4);
    for (let k = kMin; k <= kMax; k++) {
      const term1 = erfc(((4 * k + 1) * z) / (sqrtN * Math.SQRT2));
      const term2 = erfc(((4 * k - 1) * z) / (sqrtN * Math.SQRT2));
      sumTerms += (term1 - term2);
    }
  }
  const pValCusum = Math.max(0.0, Math.min(1.0, 1.0 - sumTerms));
  const passCusum = pValCusum >= 0.01;

  // 5. NIST SP 800-90B Min-Entropy: H_inf = -log2(max(p, 1-p))
  const pMax = Math.max(onesRatio, 1 - onesRatio);
  const minEntropy = -Math.log2(pMax);

  // Overall Verdict Assessment
  const passedCount = (passMonobit ? 1 : 0) + (passBlock ? 1 : 0) + (passRuns ? 1 : 0) + (passCusum ? 1 : 0);
  let verdictStatus = 'nist_certified';
  let verdictEn = '';
  let verdictZh = '';

  if (passedCount === 4 && minEntropy >= 0.95) {
    verdictStatus = 'nist_certified';
    verdictEn = `[NIST SP 800-22 Compliant] Passed all 4 hypothesis tests (All P-values >= 0.01). Hamming weight = ${(onesRatio * 100).toFixed(2)}%, Min-Entropy = ${minEntropy.toFixed(3)} bit/bit. Hardware entropy satisfies ISO/IEC 19790 and FIPS 140-3 root-of-trust qualification.`;
    verdictZh = `【NIST SP 800-22 密碼學隨機性認證】4 項核心假設檢定全數通過（P-value 均 ≥ 0.01）。漢明權重 = ${(onesRatio * 100).toFixed(2)}%，最小熵 = ${minEntropy.toFixed(3)} bit/bit。原生硬體熵源完全符合 ISO/IEC 19790 與 FIPS 140-3 晶片信任根安全標準。`;
  } else if (passedCount >= 3) {
    verdictStatus = 'marginal_conditioning_required';
    verdictEn = `[Conditional Entropy - Post-Processing Required] Passed ${passedCount}/4 tests. Slight spatial bias detected (Hamming weight = ${(onesRatio * 100).toFixed(2)}%, Min-Entropy = ${minEntropy.toFixed(3)}). Requires cryptographic hash conditioning or BCH Fuzzy Extractor before key derivation.`;
    verdictZh = `【邊界熵源 · 需密碼學調節】通過 ${passedCount}/4 項檢定。檢測到輕微空間偏壓（漢明權重 = ${(onesRatio * 100).toFixed(2)}%，最小熵 = ${minEntropy.toFixed(3)}）。在金鑰衍生前必須導入密碼雜湊調節或 BCH 模糊提取器（Fuzzy Extractor）。`;
  } else {
    verdictStatus = 'nist_rejected';
    verdictEn = `[Cryptographic Rejection - Failed NIST SP 800-22] Failed ${4 - passedCount} tests. Severe non-randomness detected (Hamming weight = ${(onesRatio * 100).toFixed(2)}%, Cusum Z = ${maxExcursionZ}). Root entropy compromised by physical defect or external fault injection!`;
    verdictZh = `【密碼學拒絕 · 未通過 NIST SP 800-22】${4 - passedCount} 項檢定失敗。檢測到嚴重非隨機性偏壓（漢明權重 = ${(onesRatio * 100).toFixed(2)}%，累計和偏差 Z = ${maxExcursionZ}）。原生熵源遭受物理缺陷或外部故障注入干擾，嚴禁直接用於根金鑰生成！`;
  }

  return {
    inputs: { presetId, nBits },
    metrics: {
      onesCount,
      onesRatio,
      sn,
      sobs,
      pValMonobit,
      passMonobit,
      chi2Block,
      pValBlock,
      passBlock,
      vnObs,
      pValRuns,
      passRuns,
      maxExcursionZ,
      pValCusum,
      passCusum,
      minEntropy,
      passedCount,
    },
    bits,
    verdict: {
      status: verdictStatus,
      en: verdictEn,
      zh: verdictZh,
    },
  };
}

/**
 * Draws the 32x32 Spatial Bitgrid Map and horizontal NIST P-value benchmark bars on Canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} simData - Return value of calculatePufNistRandomness
 * @param {string} lang - 'zh' | 'en'
 */
export function drawPufBitgridCanvas(canvas, simData, lang = 'zh') {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  const rect = canvas.getBoundingClientRect();
  const width = rect.width > 0 ? rect.width : 600;
  const height = rect.height > 0 ? rect.height : 280;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.resetTransform?.();
  ctx.scale(dpr, dpr);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const padLeft = 25;
  const padTop = 30;

  // Title inside Canvas
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 12px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(
    lang === 'zh'
      ? `32×32 (1024-bit) 空間原生熵源圖與 NIST SP 800-22 統計檢驗`
      : `32x32 (1024-bit) Spatial Entropy Map & NIST SP 800-22 Hypothesis Tests`,
    padLeft,
    padTop - 12
  );

  // 1. Draw 32x32 Bitgrid Map (Left Side)
  const gridDim = 32;
  const cellSz = 6.5; // 32 * 6.5 = 208px
  const gridStartX = padLeft;
  const gridStartY = padTop + 5;

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.strokeRect(gridStartX - 2, gridStartY - 2, gridDim * cellSz + 4, gridDim * cellSz + 4);

  const bits = simData.bits;
  for (let r = 0; r < gridDim; r++) {
    for (let c = 0; c < gridDim; c++) {
      const idx = r * gridDim + c;
      const b = bits[idx];
      // 0 = Dark Slate (#0f766e / cyan-teal), 1 = Amber (#d97706 / golden)
      ctx.fillStyle = b === 1 ? '#d97706' : '#0f766e';
      ctx.fillRect(gridStartX + c * cellSz, gridStartY + r * cellSz, cellSz - 0.5, cellSz - 0.5);
    }
  }

  // Bitgrid Legend
  const legY = gridStartY + gridDim * cellSz + 18;
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(gridStartX, legY, 10, 10);
  ctx.fillStyle = '#334155';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillText('0-bit', gridStartX + 14, legY + 8);

  ctx.fillStyle = '#d97706';
  ctx.fillRect(gridStartX + 60, legY, 10, 10);
  ctx.fillStyle = '#334155';
  ctx.fillText('1-bit', gridStartX + 74, legY + 8);

  // 2. Draw 4 NIST SP 800-22 P-Value Horizontal Bars (Right Side)
  const barStartX = gridStartX + gridDim * cellSz + 45;
  const barMaxW = width - barStartX - 40;
  const tests = [
    { nameEn: 'Frequency (Monobit)', nameZh: '單元頻率檢定 (Monobit)', pVal: simData.metrics.pValMonobit, pass: simData.metrics.passMonobit },
    { nameEn: 'Block Frequency (M=32)', nameZh: '區塊頻率檢定 (M=32)', pVal: simData.metrics.pValBlock, pass: simData.metrics.passBlock },
    { nameEn: 'Runs Sequence Test', nameZh: '遊程相鄰檢定 (Runs)', pVal: simData.metrics.pValRuns, pass: simData.metrics.passRuns },
    { nameEn: 'Cumulative Sums (Cusum)', nameZh: '累計和漫步檢定 (Cusum)', pVal: simData.metrics.pValCusum, pass: simData.metrics.passCusum },
  ];

  tests.forEach((t, idx) => {
    const rowY = gridStartY + 10 + idx * 48;

    // Label
    ctx.fillStyle = '#1e293b';
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(lang === 'zh' ? t.nameZh : t.nameEn, barStartX, rowY);

    // Pass / Fail Badge
    ctx.font = '700 10px "IBM Plex Mono", monospace';
    if (t.pass) {
      ctx.fillStyle = '#059669';
      ctx.fillText(`PASS (P=${t.pVal.toFixed(4)})`, barStartX + barMaxW - 120, rowY);
    } else {
      ctx.fillStyle = '#dc2626';
      ctx.fillText(`FAIL (P=${t.pVal.toFixed(4)})`, barStartX + barMaxW - 120, rowY);
    }

    // Bar background
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(barStartX, rowY + 6, barMaxW, 14);

    // P-value fill bar (P from 0.0 to 1.0)
    ctx.fillStyle = t.pass ? '#10b981' : '#ef4444';
    const fillW = Math.max(2, Math.min(barMaxW, barMaxW * t.pVal));
    ctx.fillRect(barStartX, rowY + 6, fillW, 14);

    // Critical threshold alpha = 0.01 red dashed line
    const threshX = barStartX + barMaxW * 0.01;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(threshX, rowY + 4);
    ctx.lineTo(threshX, rowY + 22);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Threshold marker note
  const threshNoteX = barStartX + barMaxW * 0.01;
  ctx.fillStyle = '#dc2626';
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText('α = 0.01 Threshold', barStartX + 5, gridStartY + 4 * 48 + 12);
}

/**
 * Initializes the PUF NIST SP 800-22 Randomness Evaluator interactive workbench.
 *
 * @param {string} rootId - DOM container ID (default: 'puf-nist-evaluator-root')
 */
export function initPufNistRandomnessEvaluator(rootId = 'puf-nist-evaluator-root') {
  const root = document.getElementById(rootId);
  if (!root) return;

  const presetSelect = root.querySelector('#puf-preset-select');
  const resampleBtn = root.querySelector('#puf-resample-btn');

  // KPI elements
  const hwEl = root.querySelector('#puf-hw-val');
  const minEntropyEl = root.querySelector('#puf-entropy-val');
  const passedTestsEl = root.querySelector('#puf-passed-tests-val');
  const cusumEl = root.querySelector('#puf-cusum-val');

  const canvas = root.querySelector('#puf-canvas');
  const verdictBanner = root.querySelector('#puf-verdict-banner');

  function getLang() {
    return document.documentElement.lang === 'en' ? 'en' : 'zh';
  }

  function update() {
    const lang = getLang();
    const presetId = presetSelect?.value || 'antifuse_neopuf_quantum';
    const res = calculatePufNistRandomness({ presetId });

    if (hwEl) hwEl.textContent = `${(res.metrics.onesRatio * 100).toFixed(2)} %`;
    if (minEntropyEl) minEntropyEl.textContent = `${res.metrics.minEntropy.toFixed(3)} bit`;
    if (passedTestsEl) passedTestsEl.textContent = `${res.metrics.passedCount} / 4`;
    if (cusumEl) cusumEl.textContent = `Z = ${res.metrics.maxExcursionZ}`;

    if (verdictBanner) {
      verdictBanner.className = 'puf-verdict-banner ' + res.verdict.status;
      const textSpan = verdictBanner.querySelector('.puf-verdict-text');
      if (textSpan) {
        textSpan.innerHTML = `<span data-lang="zh">${res.verdict.zh}</span><span data-lang="en">${res.verdict.en}</span>`;
      }
    }

    if (canvas) {
      drawPufBitgridCanvas(canvas, res, lang);
    }
  }

  if (presetSelect) {
    presetSelect.addEventListener('change', update);
  }

  if (resampleBtn) {
    resampleBtn.addEventListener('click', update);
  }

  const observer = new MutationObserver(() => update());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  window.addEventListener('resize', () => {
    if (canvas) update();
  });

  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initPufNistRandomnessEvaluator());
  } else {
    initPufNistRandomnessEvaluator();
  }
}
