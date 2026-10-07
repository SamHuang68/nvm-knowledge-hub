/**
 * puf-reconstruction-simulator.js — SRAM PUF Key Reconstruction & Fuzzy Extractor Dynamic Simulator
 *
 * Illustrative modeling of silicon mismatch, thermal drift, NBTI/PBTI aging,
 * and BCH error-correction code (ECC) boundaries for hardware cryptographic root keys.
 *
 * Mathematical Foundations:
 * 1. Physical Bit Error Rate (BER): p_total(T, t_age) = p_0 * (1 + alpha*(T-25)/100) + beta * t_age^0.25
 * 2. Block Error Probability (Binomial Tail): P_fail = \sum_{k=t+1}^n \binom{n}{k} p^k (1-p)^{n-k}
 * 3. Overall Key Reconstruction Failure Rate (FER): 1 - (1 - P_fail)^M
 * 4. Helper Data Syndrome Leakage: L_syndrome = n - k (BCH parity constraints)
 * 5. Residual Min-Entropy: H_residual = n * H_inf - L_syndrome
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: NIST SP 800-90B, ISO/IEC 20897 (Physically Unclonable Functions)
 */

'use strict';

/**
 * Binomial coefficient C(n, k).
 * @param {number} n Total elements.
 * @param {number} k Selected elements.
 * @return {number} Combination count.
 */
function binomialCoeff(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let c = 1;
  const m = Math.min(k, n - k);
  for (let i = 1; i <= m; i++) {
    c = (c * (n - i + 1)) / i;
  }
  return c;
}

/**
 * Computes SRAM PUF error rate and reconstruction metrics.
 * @param {Object} params Configuration parameters.
 * @return {Object} Computed BER, failure rates, entropy, and distributions.
 */
export function calculatePufReconstruction(params = {}) {
  const tempC = typeof params.tempC === 'number' ? params.tempC : 25;
  const agingYears = typeof params.agingYears === 'number' ? params.agingYears : 0;
  const eccCapabilityT = typeof params.eccCapabilityT === 'number' ? params.eccCapabilityT : 12; // correctable bits
  const blockSizeN = 128; // standard BCH block size
  const keyBits = params.keyBits === 128 ? 128 : 256;
  // k = 128 - 7t 是示意近似；保留全部輸入，明示非正碼率時無法外推。
  const approximateInfoBits = blockSizeN - eccCapabilityT * 7;
  if (!Number.isFinite(tempC) || !Number.isFinite(agingYears) || agingYears < 0
      || !Number.isInteger(eccCapabilityT) || eccCapabilityT < 0 || approximateInfoBits <= 0) {
    return { valid: false, statusGrade: 'OUTSIDE_MODEL', keyBits, approximateInfoBits };
  }
  const numBlocksM = Math.ceil(keyBits / approximateInfoBits);

  // 1. Intrinsic Physical BER Modeling
  // Base room temperature (25°C) threshold voltage mismatch flip probability
  const p0 = 0.038; // 教學假設：室溫 BER，非產品規格
  const alphaTemp = 0.45; // thermal acceleration factor
  const pTemp = p0 * (1 + alphaTemp * ((tempC - 25) / 100));

  // NBTI / PBTI Aging degradation: power-law threshold shift (\Delta Vth \propto t^0.25)
  const betaAge = 0.012; // aging coefficient
  const pAge = betaAge * Math.pow(Math.max(0, agingYears), 0.25);

  const rawBer = Math.min(0.35, Math.max(0.01, pTemp + pAge));

  // 2. Binomial CDF for Block Failure Probability P(K > t)
  let pBlockSuccess = 0;
  for (let k = 0; k <= eccCapabilityT; k++) {
    const term = binomialCoeff(blockSizeN, k) * Math.pow(rawBer, k) * Math.pow(1 - rawBer, blockSizeN - k);
    pBlockSuccess += term;
  }
  const pBlockFail = Math.max(0, 1 - pBlockSuccess);

  // 3. Overall Key Frame Error Rate (FER)
  const pKeySuccess = Math.pow(Math.max(0, pBlockSuccess), numBlocksM);
  const pKeyFail = Math.max(1e-15, 1 - pKeySuccess);

  // 4. Min-Entropy & Helper Data Sizing
  // 教學假設每個原始單元 0.82 bit 最小熵，不代表具名產品量測。
  const minEntropyPerCell = 0.82;
  const syndromeBitsPerBlock = eccCapabilityT * 7; // BCH parity bits (m=7 for n=127/128)
  const helperDataBytes = Math.ceil((syndromeBitsPerBlock * numBlocksM) / 8);

  const rawEntropyTotal = blockSizeN * numBlocksM * minEntropyPerCell;
  const leakageTotal = syndromeBitsPerBlock * numBlocksM;
  const residualMinEntropy = Math.max(0, Math.round(rawEntropyTotal - leakageTotal));

  // 只依試算 FER 分區，門檻不是資格認證或密碼安全判定。
  let statusGrade = 'LOW_FER_ESTIMATE';
  if (pKeyFail > 1e-3) {
    statusGrade = 'HIGH_FER_ESTIMATE';
  } else if (pKeyFail > 1e-6) {
    statusGrade = 'INTERMEDIATE_FER_ESTIMATE';
  }

  return {
    valid: true,
    keyBits,
    approximateInfoBits,
    rawBerPct: parseFloat((rawBer * 100).toFixed(2)),
    pBlockFail,
    pKeyFail,
    pKeyFailScientific: pKeyFail < 1e-4 ? pKeyFail.toExponential(2) : pKeyFail.toFixed(4),
    numBlocksM,
    helperDataBytes,
    residualMinEntropy,
    statusGrade,
    eccThresholdPct: parseFloat(((eccCapabilityT / blockSizeN) * 100).toFixed(1)),
  };
}

/**
 * Initializes the SRAM PUF Reconstruction Simulator interactive widget.
 * @param {string} rootSelector The DOM container selector.
 */
export function initPufReconstructionSimulator(rootSelector = '#puf-reconstruction-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const T = (en, zh) => (window.HubLanguage?.get() === 'zh' ? zh : en);

  const tempSlider = root.querySelector('#puf-temp-slider');
  const tempVal = root.querySelector('#puf-temp-val');
  const ageSlider = root.querySelector('#puf-age-slider');
  const ageVal = root.querySelector('#puf-age-val');
  const eccSlider = root.querySelector('#puf-ecc-slider');
  const eccVal = root.querySelector('#puf-ecc-val');
  const keyBitsSelect = root.querySelector('#puf-keybits-select');

  const berDisplay = root.querySelector('#puf-ber-display');
  const ferDisplay = root.querySelector('#puf-fer-display');
  const helperDisplay = root.querySelector('#puf-helper-display');
  const entropyDisplay = root.querySelector('#puf-entropy-display');
  const gradeBadge = root.querySelector('#puf-grade-badge');
  const canvas = root.querySelector('#puf-dist-canvas');
  const verdictElem = root.querySelector('#puf-verdict-summary');

  let ctx = null;
  if (canvas) {
    ctx = canvas.getContext('2d');
  }

  function drawDistributions(rawBer, eccThresholdPct) {
    if (!ctx || !canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background & Grid
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(196, 165, 116, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const paddingLeft = 45;
    const paddingRight = 25;
    const plotW = w - paddingLeft - paddingRight;
    const plotH = h - 60;
    const baseY = h - 30;

    // Normal PDF helper
    const normalPdf = (x, mean, sigma) => {
      const z = (x - mean) / sigma;
      return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
    };

    // 1. Intra-chip HD curve (Noise / BER distribution)
    // Mean = rawBer * 100%, sigma ~ 2.5%
    const meanIntra = rawBer;
    const sigmaIntra = 2.4;

    // 2. Inter-chip HD curve (Silicon Uniqueness distribution)
    // Mean = 50.0%, sigma ~ 2.8%
    const meanInter = 50.0;
    const sigmaInter = 2.8;

    // Scale Y: maximum peak of intra
    const maxDensity = Math.max(normalPdf(meanIntra, meanIntra, sigmaIntra), 0.2);

    const getX = (pct) => paddingLeft + (pct / 70) * plotW; // x axis: 0% to 70% HD
    const getY = (val) => baseY - (val / maxDensity) * (plotH * 0.85);

    // Draw Inter-Chip HD (Uniqueness) Area in Slate/Blue
    ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(getX(35), baseY);
    for (let p = 35; p <= 65; p += 0.5) {
      ctx.lineTo(getX(p), getY(normalPdf(p, meanInter, sigmaInter)));
    }
    ctx.lineTo(getX(65), baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw Intra-Chip HD (Noise / Errors) Area in Amber/Gold
    ctx.fillStyle = 'rgba(217, 119, 6, 0.18)';
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(getX(0), baseY);
    for (let p = 0; p <= 30; p += 0.4) {
      ctx.lineTo(getX(p), getY(normalPdf(p, meanIntra, sigmaIntra)));
    }
    ctx.lineTo(getX(30), baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw ECC Capability Threshold Marker
    const eccX = getX(eccThresholdPct);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(eccX, 15);
    ctx.lineTo(eccX, baseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // ECC Threshold Label
    ctx.fillStyle = '#dc2626';
    ctx.font = '700 11px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(T(`Model t/n = ${eccThresholdPct}%`, `模型 t/n = ${eccThresholdPct}%`), eccX, 12);

    // Curve Labels
    ctx.fillStyle = '#d97706';
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillText(T(`Intra-Die Noise (BER = ${rawBer}%)`, `晶片內部噪訊 (BER = ${rawBer}%)`), getX(meanIntra), getY(normalPdf(meanIntra, meanIntra, sigmaIntra)) - 10);

    ctx.fillStyle = '#0f172a';
    ctx.fillText(T('Inter-Die Uniqueness (50% Ideal)', '跨晶片獨立性 (50% 理想高斯)'), getX(meanInter), getY(normalPdf(meanInter, meanInter, sigmaInter)) - 10);

    // Axes & Ticks
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, baseY);
    ctx.lineTo(w - paddingRight, baseY);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '10px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    for (let t = 0; t <= 70; t += 10) {
      const tx = getX(t);
      ctx.fillText(`${t}%`, tx, baseY + 16);
      ctx.beginPath();
      ctx.moveTo(tx, baseY);
      ctx.lineTo(tx, baseY + 4);
      ctx.stroke();
    }
  }

  function update() {
    const tempC = parseFloat(tempSlider?.value || 25);
    const agingYears = parseFloat(ageSlider?.value || 0);
    const eccCapabilityT = parseInt(eccSlider?.value || 12, 10);
    const keyBits = parseInt(keyBitsSelect?.value || 256, 10);

    if (tempVal) tempVal.textContent = `${tempC} °C`;
    if (ageVal) ageVal.textContent = T(`${agingYears} Yrs`, `${agingYears} 年`);
    if (eccVal) eccVal.textContent = `${eccCapabilityT} bits / 128b`;
    if (eccSlider) eccSlider.setAttribute('aria-valuetext', T(`${eccCapabilityT} bits / 128b`, `${eccCapabilityT} 位元／128 位元區塊`));

    const res = calculatePufReconstruction({
      tempC,
      agingYears,
      eccCapabilityT,
      keyBits,
    });

    if (!res.valid) {
      [berDisplay, ferDisplay, helperDisplay, entropyDisplay].forEach(el => { if (el) el.textContent = '—'; });
      if (gradeBadge) {
        gradeBadge.className = 'puf-badge marginal';
        gradeBadge.textContent = T('OUTSIDE THIS MODEL', '超出此簡化模型');
      }
      if (verdictElem) verdictElem.textContent = T(
        'The illustrative information length k = 128 − 7t must be positive. This input is retained but cannot produce FER, helper-data or entropy estimates with this approximation. Use a named BCH code and measured PUF data.',
        '此示意近似要求資訊長度 k = 128 − 7t 為正。輸入選項保留，但本近似不能輸出此條件的 FER、輔助資料或熵；須改用具名 BCH 碼與 PUF 量測資料。');
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    if (berDisplay) berDisplay.textContent = `≈ ${res.rawBerPct}%`;
    if (ferDisplay) {
      ferDisplay.textContent = `≈ ${res.pKeyFailScientific}`;
      ferDisplay.style.color = res.statusGrade === 'LOW_FER_ESTIMATE' ? '#15803d' : res.statusGrade === 'INTERMEDIATE_FER_ESTIMATE' ? '#b45309' : '#b91c1c';
    }
    if (helperDisplay) helperDisplay.textContent = T(`≈ ${res.helperDataBytes} Bytes`, `≈ ${res.helperDataBytes} 位元組`);
    if (entropyDisplay) entropyDisplay.textContent = T(`≈ ${res.residualMinEntropy} bits`, `≈ ${res.residualMinEntropy} 位元`);

    if (gradeBadge) {
      if (res.statusGrade === 'LOW_FER_ESTIMATE') {
        gradeBadge.className = 'puf-badge secure';
        gradeBadge.textContent = T('LOW FER ESTIMATE', '較低 FER 試算');
      } else if (res.statusGrade === 'INTERMEDIATE_FER_ESTIMATE') {
        gradeBadge.className = 'puf-badge marginal';
        gradeBadge.textContent = T('INTERMEDIATE FER ESTIMATE', '中間 FER 試算');
      } else {
        gradeBadge.className = 'puf-badge fail';
        gradeBadge.textContent = T('HIGH FER ESTIMATE', '較高 FER 試算');
      }
    }

    if (verdictElem) verdictElem.innerHTML = T(
      `Under the illustrative assumptions at <strong>${tempC}°C</strong> and <strong>${agingYears} years</strong>, BER is approximately <strong>${res.rawBerPct}%</strong> and key FER approximately <strong>${res.pKeyFailScientific}</strong>. The approximation k = 128 − 7t gives <strong>${res.residualMinEntropy} bits</strong> of residual min-entropy for a requested <strong>${keyBits}-bit</strong> key. A lower FER does not establish key security or qualification; HKDF cannot create additional entropy. Confirm the actual BCH code, correlated errors, measured entropy, leakage and aging on target silicon.`,
      `在 <strong>${tempC}°C</strong>、老化 <strong>${agingYears} 年</strong> 的教學假設下，BER 約 <strong>${res.rawBerPct}%</strong>、金鑰 FER 約 <strong>${res.pKeyFailScientific}</strong>。以 k = 128 − 7t 近似得到殘餘最小熵約 <strong>${res.residualMinEntropy} 位元</strong>，要求金鑰長度為 <strong>${keyBits} 位元</strong>。較低 FER 不等於金鑰安全或資格驗證通過；HKDF 不能產生額外熵。須確認實際 BCH 碼、誤碼相關性、量測熵、洩漏與目標晶片老化。`);

    drawDistributions(res.rawBerPct, res.eccThresholdPct);
  }

  [tempSlider, ageSlider, eccSlider, keyBitsSelect].forEach((el) => el?.addEventListener('input', update));
  window.addEventListener('hub:language-change', update);
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initPufReconstructionSimulator());
  } else {
    initPufReconstructionSimulator();
  }
}
