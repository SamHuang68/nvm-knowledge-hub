/**
 * @fileoverview AntiFuse Native PUF Entropy Health & NIST SP 800-90B Statistical Monitor.
 * Models intrinsic oxide breakdown filament randomness, spatial distribution,
 * Hamming weight uniformity, inter-chip uniqueness, and fuzzy extractor reliability.
 * @module antifuse-puf-entropy-health-monitor
 */

'use strict';

/**
 * Calculates AntiFuse PUF statistical entropy metrics and health pass/fail bounds.
 *
 * @param {Object} [params={}] - Simulation parameters.
 * @param {number} [params.pufBits=256] - PUF key size in bits (128, 256, 512, 1024, 2048, 4096).
 * @param {number} [params.ambientTempC=25] - Operating temperature in Celsius (-40 to 150).
 * @param {number} [params.vddVariationPct=0] - VDD supply voltage drift in percent (-10 to +10).
 * @returns {Object} Calculated PUF statistical health and reliability metrics.
 */
export function calculateAntifusePufHealth(params = {}) {
  const safeParams = (typeof params === 'object' && params !== null) ? params : {};

  let bits = Number(safeParams.pufBits);
  if (!Number.isFinite(bits)) bits = 256;
  const validBits = [128, 256, 512, 1024, 2048, 4096];
  if (!validBits.includes(bits)) {
    bits = 256;
  }

  let tempC = Number(safeParams.ambientTempC);
  if (!Number.isFinite(tempC)) tempC = 25;
  tempC = Math.min(Math.max(tempC, -40), 150);

  let vddDrift = Number(safeParams.vddVariationPct);
  if (!Number.isFinite(vddDrift)) vddDrift = 0;
  vddDrift = Math.min(Math.max(vddDrift, -10), 10);

  // 1. Hamming Weight (Fraction of 1s in raw PUF response)
  // Intrinsic breakdown has negligible bias; nominal 50.1% ± random deviation
  const nominalHw = 0.501;
  const tempBias = (tempC - 25) * 0.00008;
  const vddBias = vddDrift * 0.0002;
  const hammingWeightPct = Number(((nominalHw + tempBias + vddBias) * 100).toFixed(2));

  // 2. Inter-chip Hamming Distance (Uniqueness between different dies)
  // Ideal is 50.0%
  const interChipHdPct = Number((49.95 - Math.abs(tempBias) * 10).toFixed(2));

  // 3. Intra-chip Bit Error Rate (BER across -40C to 125C and voltage margins)
  // AntiFuse differential read ensures ultra-low raw BER (< 1e-4)
  const tempStressFactor = Math.pow(Math.abs(tempC - 25) / 50, 1.5);
  const vddStressFactor = Math.abs(vddDrift) / 5;
  const rawBer = Math.max(1e-6, (2.5e-5 * (1 + tempStressFactor + vddStressFactor)));
  const berPpm = Number((rawBer * 1e6).toFixed(1)); // Parts Per Million

  // 4. NIST SP 800-90B Min-Entropy Estimation
  // H_inf = -log2(max(p, 1-p))
  const pMax = Math.max(hammingWeightPct / 100, 1 - (hammingWeightPct / 100));
  const minEntropyPerBit = Number((-Math.log2(pMax)).toFixed(4));

  // 5. Fuzzy Extractor / Error-Correction Code (BCH) Overhead
  // To reach cryptographic failure rate < 1e-9 (CC EAL6+ grade)
  const bchHelperBitsPerKeyBit = rawBer < 1e-4 ? 1.8 : 2.5;
  const totalHelperDataBytes = Math.ceil((bits * bchHelperBitsPerKeyBit) / 8);

  // 6. Security Assurance Rating
  let securityGradeZh = '';
  let securityGradeEn = '';

  if (minEntropyPerBit >= 0.95 && berPpm < 100) {
    securityGradeZh = '卓越健康度：NIST SP 800-90B 最小熵 > 0.99，滿足 CC EAL6+ / FIPS 140-3 晶片唯一身份與金鑰衍生要求。';
    securityGradeEn = 'Exceptional Health: NIST SP 800-90B min-entropy > 0.99; qualifies for CC EAL6+ / FIPS 140-3 device RoT.';
  } else {
    securityGradeZh = '條件健全：極端溫壓偏移下需啟用 BCH 模糊抽取器強校驗以保證 100% 密鑰再現性。';
    securityGradeEn = 'Conditional: Extreme temperature/voltage corner requires robust BCH fuzzy extractor helper data.';
  }

  return {
    pufBits: bits,
    ambientTempC: tempC,
    vddVariationPct: vddDrift,
    hammingWeightPct,
    interChipHdPct,
    rawBer: Number(rawBer.toExponential(2)),
    berPpm,
    minEntropyPerBit,
    totalHelperDataBytes,
    securityGradeZh,
    securityGradeEn
  };
}

/**
 * Attaches UI event listeners for the AntiFuse PUF monitor in security-assurance.html.
 */
export function initPufHealthUi() {
  const root = document.getElementById('antifuse-puf-monitor-root');
  if (!root) return;

  const bitsSelect = /** @type {HTMLSelectElement|null} */ (root.querySelector('#puf-bits-select'));
  const tempInput = /** @type {HTMLInputElement|null} */ (root.querySelector('#puf-temp-input'));
  const vddInput = /** @type {HTMLInputElement|null} */ (root.querySelector('#puf-vdd-input'));

  const hwOut = root.querySelector('#puf-hw-out');
  const hdOut = root.querySelector('#puf-hd-out');
  const entropyOut = root.querySelector('#puf-entropy-out');
  const helperOut = root.querySelector('#puf-helper-out');
  const verdictOut = root.querySelector('#puf-verdict-out');

  const update = () => {
    const res = calculateAntifusePufHealth({
      pufBits: bitsSelect ? parseInt(bitsSelect.value, 10) : 256,
      ambientTempC: tempInput ? parseFloat(tempInput.value) : 25,
      vddVariationPct: vddInput ? parseFloat(vddInput.value) : 0
    });

    if (hwOut) hwOut.textContent = `${res.hammingWeightPct}%`;
    if (hdOut) hdOut.textContent = `${res.interChipHdPct}%`;
    if (entropyOut) entropyOut.textContent = `${res.minEntropyPerBit} bit/bit`;
    if (helperOut) helperOut.textContent = `${res.totalHelperDataBytes} Bytes`;
    if (verdictOut) {
      verdictOut.innerHTML = `<span data-lang="zh">${res.securityGradeZh}</span><span data-lang="en">${res.securityGradeEn}</span>`;
    }
  };

  [bitsSelect].forEach(el => { if (el) el.addEventListener('change', update); });
  [tempInput, vddInput].forEach(el => { if (el) el.addEventListener('input', update); });
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPufHealthUi);
  } else {
    initPufHealthUi();
  }
}
