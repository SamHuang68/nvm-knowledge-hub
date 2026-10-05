/**
 * dpa-cpa-leakage-simulator.js — Side-Channel DPA/CPA Trace Complexity & High-Order Masking Simulator
 *
 * First-Principles Mathematical Modeling:
 * 1. Hamming Weight (HW) Power Leakage Model:
 *    P(t) = P_{\text{baseline}}(t) + \kappa \cdot \text{HW}(D(t) \oplus R(t)) + \mathcal{N}(0, \sigma_{\text{noise}}^2)
 * 2. Signal-to-Noise Ratio (SNR) in Side-Channel Domain:
 *    \text{SNR}_{\text{leakage}} = \frac{\kappa^2 \cdot \text{Var}(\text{HW})}{\sigma_{\text{noise}}^2}
 * 3. Pearson Correlation Coefficient:
 *    \rho = \frac{1}{\sqrt{1 + \frac{1}{\text{SNR}_{\text{leakage}}}}} = \frac{\kappa \cdot \sigma_{\text{HW}}}{\sqrt{\kappa^2 \cdot \sigma_{\text{HW}}^2 + \sigma_{\text{noise}}^2}}
 * 4. Measurements to Disclosure (MTD) — Mangard's First-Order Rule:
 *    N_{\text{traces}}^{(1st)} \approx 3 + 8 \cdot \left(\frac{z_{1-\alpha}}{\rho}\right)^2 \approx \frac{c_{\alpha}}{\text{SNR}_{\text{leakage}}}
 * 5. Higher-Order Masking & Hardware Dual-Rail Differential Attenuation:
 *    - Unmasked (1st Order): N_{\text{traces}} \propto \text{SNR}^{-1}
 *    - 1st-Order Boolean Masking / Complementary Dual-Rail:
 *      First-order correlation \rho^{(1st)} \approx 0.
 *      Attacker must use 2nd-order centered product traces:
 *      N_{\text{traces}}^{(2nd)} \approx c_2 \cdot \left(\frac{1}{\text{SNR}_{\text{leakage}}}\right)^2
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: ISO/IEC 17825 (Test methods for non-invasive attacks), Common Criteria AVA_VAN.5, NIST FIPS 140-3
 */

/**
 * Side-channel attack target scenarios and baseline physical configurations.
 */
export const DPA_ATTACK_PRESETS = Object.freeze({
  fpga_unprotected_aes: {
    id: "fpga_unprotected_aes",
    nameZh: "FPGA / 原生微控制器未防護 AES-256 (無遮罩單端讀取)",
    nameEn: "Unprotected AES-256 (Single-Rail CMOS / No Masking)",
    cryptoPrimitive: "AES-256 Key Schedule",
    baseSnrDb: 6.0,             // High leakage SNR ~4.0 linear
    clockJitterStdNs: 0.1,      // Minimal jitter
    shufflingFactor: 1.0,       // No instruction shuffling
    maskingOrder: 0,            // Unprotected 1st order
    targetMtdFloor: 120,        // Discloses in ~120 traces
    ccAssuranceLevel: "No Assurance (Breakable in minutes)",
  },
  smartcard_jitter_masked: {
    id: "smartcard_jitter_masked",
    nameZh: "28nm 金融晶片防護 (時脈抖動 + 假隨機預充電)",
    nameEn: "28nm Smart Card (Clock Jitter + Precharge Noise)",
    cryptoPrimitive: "Hardware AES Engine",
    baseSnrDb: -6.0,            // Attenuated SNR ~0.25 linear
    clockJitterStdNs: 1.8,      // Significant desynchronization
    shufflingFactor: 3.5,       // Random op shuffling
    maskingOrder: 0,            // Obfuscated 1st order
    targetMtdFloor: 8500,       // Needs thousands of aligned traces
    ccAssuranceLevel: "EAL4+ / SESIP 2",
  },
  boolean_masked_core: {
    id: "boolean_masked_core",
    nameZh: "一階布林遮罩密碼協同處理器 (1st-Order Boolean Masking)",
    nameEn: "1st-Order Boolean Masking Core (S = X ^ M)",
    cryptoPrimitive: "Masked AES S-Box",
    baseSnrDb: -14.0,           // 1st order eliminated, residual leakage SNR
    clockJitterStdNs: 0.8,
    shufflingFactor: 2.0,
    maskingOrder: 1,            // Requires 2nd-order CPA
    targetMtdFloor: 350000,     // 350k+ traces required
    ccAssuranceLevel: "EAL5+ (High-Attack Potential Resistant)",
  },
  dual_rail_neopuf_diff: {
    id: "dual_rail_neopuf_diff",
    nameZh: "互補雙軌差動單元 + NeoPUF 信任根 (Hardware Inherent Cancellation)",
    nameEn: "Complementary Dual-Rail + NeoPUF RoT (Inherent Diff Cancellation)",
    cryptoPrimitive: "Silicon RoT Key Bus",
    baseSnrDb: -26.0,           // Severe differential attenuation (<0.0025 linear)
    clockJitterStdNs: 2.5,
    shufflingFactor: 4.0,
    maskingOrder: 1,            // Inherent differential pair + 2nd order barrier
    targetMtdFloor: 2800000,    // Millions of traces needed
    ccAssuranceLevel: "EAL6+ / SESIP 3 (Nation-State Grade)",
  },
});

/**
 * NVM storage and memory bus physical countermeasure topologies.
 */
export const DPA_COUNTERMEASURE_PROFILES = Object.freeze({
  none_single_ended: {
    id: "none_single_ended",
    nameZh: "01 · 無防護單端感測 (Single-Ended Flash / eFuse)",
    nameEn: "01 · Unprotected Single-Ended (Flash / eFuse)",
    leakageScaleFactor: 1.0,
    differentialCancellationDb: 0.0,
    orderMultiplier: 1,
    siliconOverheadPct: 0,
    notesZh: "位元線對地直接充放電，漢明重量與電流痕跡具備強一階線性關聯。",
    notesEn: "Direct bitline charge/discharge creates strong 1st-order correlation with Hamming Weight.",
  },
  dummy_precharge: {
    id: "dummy_precharge",
    nameZh: "02 · 隨機預充電與噪聲注入 (Random Precharge + Noise Injection)",
    nameEn: "02 · Random Precharge & Active Noise Injection",
    leakageScaleFactor: 0.45,
    differentialCancellationDb: 6.5,
    orderMultiplier: 1,
    siliconOverheadPct: 15,
    notesZh: "於讀取週期前注入偽隨機電流尖峰，打亂瞬態波形，使 SNR 下降 ~6.5 dB。",
    notesEn: "Injects pseudo-random current spikes before read cycle, degrading SNR by ~6.5 dB.",
  },
  boolean_mask_1st: {
    id: "boolean_mask_1st",
    nameZh: "03 · 一階演算法布林遮罩 (1st-Order Algorithmic Masking)",
    nameEn: "03 · 1st-Order Algorithmic Boolean Masking",
    leakageScaleFactor: 0.12,
    differentialCancellationDb: 18.0,
    orderMultiplier: 2,         // Forces 2nd-order attack
    siliconOverheadPct: 45,
    notesZh: "密文與金鑰隨機拆分為 (Share1 ^ Share2)，迫使攻擊者進入高階相關分析。",
    notesEn: "Splits key and state into shares (S1 ^ S2), mathematically eliminating 1st-order correlation.",
  },
  complementary_dual_rail: {
    id: "complementary_dual_rail",
    nameZh: "04 · 硬體互補差動雙軌單元 (Dual-Rail Differential AntiFuse)",
    nameEn: "04 · Hardware Complementary Dual-Rail (Differential AntiFuse)",
    leakageScaleFactor: 0.02,
    differentialCancellationDb: 32.0,
    orderMultiplier: 2,         // Inherent differential symmetry + 2nd order
    siliconOverheadPct: 110,    // 2x bitcell area + diff sense amplifier
    notesZh: "真值與補值雙軌對稱抽載，一階電流自洽對消，大幅提高物理側信道防禦邊界。",
    notesEn: "True and complementary rails draw current simultaneously, self-canceling dynamic radiation.",
  },
});

/**
 * Calculates DPA/CPA trace complexity, SNR, and measurements to disclosure (MTD).
 *
 * @param {Object} options
 * @param {string} [options.presetKey="fpga_unprotected_aes"]
 * @param {string} [options.defenseKey="none_single_ended"]
 * @param {number} [options.noiseStd=1.0] - Additive analog/physical noise factor (0.2x to 5.0x)
 * @param {number} [options.sampleRateGsps=2.5] - Oscilloscope sampling rate (0.5 to 10.0 GSa/s)
 * @returns {Object} Comprehensive calculation metrics
 */
export function calculateDpaCpaLeakage({
  presetKey = "fpga_unprotected_aes",
  defenseKey = "none_single_ended",
  noiseStd = 1.0,
  sampleRateGsps = 2.5,
} = {}) {
  const preset = DPA_ATTACK_PRESETS[presetKey] || DPA_ATTACK_PRESETS.fpga_unprotected_aes;
  const defense = DPA_COUNTERMEASURE_PROFILES[defenseKey] || DPA_COUNTERMEASURE_PROFILES.none_single_ended;

  const noiseScale = Math.max(0.1, Math.min(10.0, Number(noiseStd) || 1.0));
  const sampleRate = Math.max(0.2, Math.min(20.0, Number(sampleRateGsps) || 2.5));

  // 1. Effective SNR calculation (dB and linear):
  // SNR_eff = baseSnrDb - differentialCancellationDb - 20*log10(noiseScale)
  const noisePenaltyDb = 20.0 * Math.log10(noiseScale);
  const effectiveSnrDb = preset.baseSnrDb - defense.differentialCancellationDb - noisePenaltyDb;
  const effectiveSnrLinear = Math.pow(10.0, effectiveSnrDb / 10.0);

  // 2. Pearson Correlation Coefficient (\rho):
  // For 1st order: \rho \approx 1 / \sqrt{1 + 1 / SNR}
  // For 2nd order (higher-order masking / dual-rail): \rho^{(2nd)} \approx \rho^2 \approx SNR
  const effectiveOrder = Math.max(preset.maskingOrder, defense.orderMultiplier === 2 ? 1 : 0) + 1;
  let pearsonCorrelation = 0.0;
  if (effectiveOrder === 1) {
    pearsonCorrelation = Math.sqrt(effectiveSnrLinear / (1.0 + effectiveSnrLinear));
  } else {
    // 2nd-order correlation scales quadratically with SNR in the low-SNR regime
    const rho1 = Math.sqrt(effectiveSnrLinear / (1.0 + effectiveSnrLinear));
    pearsonCorrelation = Math.pow(rho1, 2) * 0.85; // Empirical higher-order attenuation factor
  }
  pearsonCorrelation = Math.max(0.0001, Math.min(0.9999, pearsonCorrelation));

  // 3. Measurements to Disclosure (MTD):
  // Mangard's rule with 99.99% confidence (z_{1-\alpha} = 3.719 for \alpha = 10^-4):
  const zAlpha = 3.719;
  let estimatedMtdTraces = 0;
  if (effectiveOrder === 1) {
    estimatedMtdTraces = Math.ceil(3.0 + 8.0 * Math.pow(zAlpha / pearsonCorrelation, 2));
  } else {
    // 2nd-order MTD: N \propto (zAlpha / \rho^{(2nd)})^2
    const baseMtd2nd = Math.ceil(8.0 * Math.pow(zAlpha / pearsonCorrelation, 2));
    // Additional penalty for temporal desynchronization / clock jitter:
    const jitterPenalty = 1.0 + Math.pow(preset.clockJitterStdNs * sampleRate, 1.5) * 0.4;
    estimatedMtdTraces = Math.ceil(baseMtd2nd * jitterPenalty);
  }

  // Cap MTD for realistic physical bounds (up to 100M traces):
  estimatedMtdTraces = Math.max(50, Math.min(100000000, estimatedMtdTraces));

  // 4. Security Margin Evaluation (Equivalent Security Bits Against SCA):
  // Full DPA protection for CC AVA_VAN.5 typically requires MTD > 1,000,000 traces
  const scaEquivalentSecurityBits = Math.min(128, Math.round(16.0 + Math.log2(estimatedMtdTraces) * 5.6));
  const isAvaVan5Compliant = estimatedMtdTraces >= 1000000;
  const isFips140Level3Compliant = estimatedMtdTraces >= 250000;

  return {
    presetKey: preset.id,
    presetNameZh: preset.nameZh,
    presetNameEn: preset.nameEn,
    defenseKey: defense.id,
    defenseNameZh: defense.nameZh,
    defenseNameEn: defense.nameEn,
    effectiveSnrDb: Number(effectiveSnrDb.toFixed(1)),
    pearsonCorrelation: Number(pearsonCorrelation.toFixed(4)),
    estimatedMtdTraces,
    effectiveOrder,
    scaEquivalentSecurityBits,
    isAvaVan5Compliant,
    isFips140Level3Compliant,
    ccAssuranceLevel: preset.ccAssuranceLevel,
    siliconOverheadPct: defense.siliconOverheadPct,
  };
}

/**
 * Draws the high-DPI Canvas visualization for the DPA/CPA Leakage Simulator.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} results - Calculation output from calculateDpaCpaLeakage
 * @param {string} mode - 'correlation_traces' or 'power_waveform'
 * @param {boolean} isZh - Language flag
 */
export function drawDpaCpaCanvas(canvas, results, mode = "correlation_traces", isZh = true) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const displayWidth = canvas.clientWidth || 420;
  const displayHeight = canvas.clientHeight || 180;

  if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  // Background gradient:
  const bgGrad = ctx.createLinearGradient(0, 0, displayWidth, displayHeight);
  bgGrad.addColorStop(0, "#08101a");
  bgGrad.addColorStop(1, "#03070d");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, displayWidth, displayHeight);

  // Grid Lines:
  ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
  ctx.lineWidth = 1;
  const gridRows = 4;
  const gridCols = 6;
  for (let r = 1; r < gridRows; r++) {
    const y = (displayHeight / gridRows) * r;
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(displayWidth - 15, y);
    ctx.stroke();
  }
  for (let c = 1; c < gridCols; c++) {
    const x = 35 + ((displayWidth - 50) / gridCols) * c;
    ctx.beginPath();
    ctx.moveTo(x, 15);
    ctx.lineTo(x, displayHeight - 25);
    ctx.stroke();
  }

  const plotLeft = 40;
  const plotRight = displayWidth - 15;
  const plotTop = 20;
  const plotBottom = displayHeight - 28;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  if (mode === "correlation_traces") {
    // ----------------------------------------------------
    // Mode A: Correlation vs. Traces Convergence Plot
    // ----------------------------------------------------
    // Draws candidate key correlation lines: 254 phantom keys in faint gray, correct key in bright amber/green
    const mtd = results.estimatedMtdTraces;
    const maxTracesAxis = Math.max(1000, mtd * 1.6);

    // Phantom noise envelopes (random walk noise):
    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.lineWidth = 1;
    for (let k = 0; k < 8; k++) {
      ctx.beginPath();
      const seed = k * 13.37;
      for (let i = 0; i <= 60; i++) {
        const t = (i / 60) * maxTracesAxis;
        const x = plotLeft + (i / 60) * plotWidth;
        // Noise envelope shrinks as 1 / sqrt(N)
        const envelope = (0.28 / Math.sqrt(Math.max(10, t / 40.0))) * Math.sin(seed + i * 0.7);
        const y = plotBottom - (plotHeight * 0.5) - envelope * (plotHeight * 0.45);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Correct Key Correlation Curve (builds up as N increases):
    ctx.beginPath();
    ctx.strokeStyle = results.isAvaVan5Compliant ? "#10b981" : "#f59e0b";
    ctx.lineWidth = 2.4;
    const targetRho = results.pearsonCorrelation;

    for (let i = 0; i <= 80; i++) {
      const frac = i / 80;
      const t = frac * maxTracesAxis;
      const x = plotLeft + frac * plotWidth;
      // Signal emerges from noise as sqrt(t / mtd):
      const progress = Math.min(1.0, Math.sqrt(t / Math.max(1, mtd)));
      const noise = (0.15 / Math.sqrt(Math.max(10, t / 20.0))) * Math.cos(i * 1.2);
      const currentRho = (targetRho * progress) + noise;
      const y = plotBottom - (plotHeight * 0.5) - (Math.min(0.95, currentRho) * (plotHeight * 0.45));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw MTD Marker Line:
    const mtdFrac = mtd / maxTracesAxis;
    if (mtdFrac <= 1.0) {
      const mtdX = plotLeft + mtdFrac * plotWidth;
      ctx.strokeStyle = "#ef4444";
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(mtdX, plotTop);
      ctx.lineTo(mtdX, plotBottom);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#ef4444";
      ctx.font = "700 9.5px 'IBM Plex Mono', monospace";
      ctx.fillText(`MTD: ${mtd >= 1e6 ? (mtd / 1e6).toFixed(1) + "M" : mtd.toLocaleString()}`, Math.max(plotLeft + 5, mtdX - 45), plotTop + 12);
    }

    // Zero Axis line:
    ctx.strokeStyle = "rgba(226, 232, 240, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotLeft, plotBottom - plotHeight * 0.5);
    ctx.lineTo(plotRight, plotBottom - plotHeight * 0.5);
    ctx.stroke();

    // Axis Labels:
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 9px 'IBM Plex Mono', monospace";
    ctx.fillText("ρ = +1.0", 5, plotTop + 8);
    ctx.fillText("ρ = 0.0", 5, plotBottom - plotHeight * 0.5 + 3);
    ctx.fillText("ρ = -1.0", 5, plotBottom - 2);

    const xLabel = isZh
      ? `痕跡採樣量 N (traces) → [${results.effectiveOrder} 階 CPA 攻擊]`
      : `Trace Samples N (traces) → [${results.effectiveOrder}${results.effectiveOrder === 1 ? "st" : "nd"}-Order CPA]`;
    ctx.fillText(xLabel, plotLeft + plotWidth * 0.22, displayHeight - 8);

  } else {
    // ----------------------------------------------------
    // Mode B: Time-Domain Power Profile & Differential Residual
    // ----------------------------------------------------
    // Draws True Rail, Comp Rail, and Differential Residual current
    const points = 100;
    const isDiff = results.defenseKey === "complementary_dual_rail" || results.defenseKey === "boolean_mask_1st";

    // True Rail Waveform (Blue):
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.6;
    for (let i = 0; i <= points; i++) {
      const x = plotLeft + (i / points) * plotWidth;
      const phase = (i / points) * Math.PI * 4;
      const hwPulse = Math.exp(-Math.pow((i - 45) / 8.0, 2)) * 1.8;
      const noise = (Math.sin(i * 1.8) + Math.cos(i * 3.4)) * 0.15;
      const yVal = 0.4 + 0.2 * Math.sin(phase) + hwPulse * 0.35 + noise;
      const y = plotBottom - yVal * plotHeight;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (isDiff) {
      // Complementary Rail Waveform (Amber):
      ctx.beginPath();
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.6;
      for (let i = 0; i <= points; i++) {
        const x = plotLeft + (i / points) * plotWidth;
        const phase = (i / points) * Math.PI * 4;
        const compHwPulse = Math.exp(-Math.pow((i - 45) / 8.0, 2)) * 1.7; // complementary draw
        const noise = (Math.sin(i * 1.8 + 1) + Math.cos(i * 3.4 + 2)) * 0.15;
        const yVal = 0.4 + 0.2 * Math.sin(phase) + compHwPulse * 0.35 + noise;
        const y = plotBottom - yVal * plotHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Differential Residual Waveform (Green / Low Ripple):
      ctx.beginPath();
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2.2;
      for (let i = 0; i <= points; i++) {
        const x = plotLeft + (i / points) * plotWidth;
        const residual = (Math.sin(i * 4.2) * 0.04) + (Math.random() - 0.5) * 0.03;
        const yVal = 0.18 + residual;
        const y = plotBottom - yVal * plotHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Legend:
    ctx.font = "600 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(isZh ? "真值軌電流 I(D)" : "True Rail I(D)", plotLeft + 10, plotTop + 10);
    if (isDiff) {
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(isZh ? "補值軌電流 I(/D)" : "Comp Rail I(/D)", plotLeft + 120, plotTop + 10);
      ctx.fillStyle = "#10b981";
      ctx.fillText(isZh ? "差動殘差 ΔI (對消後)" : "Diff Residual ΔI", plotLeft + 240, plotTop + 10);
    }

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 9px 'IBM Plex Mono', monospace";
    ctx.fillText("I(t) mA", 5, plotTop + 8);
    ctx.fillText(isZh ? "時域採樣點 (Time Samples) →" : "Time Samples (t) →", plotLeft + plotWidth * 0.35, displayHeight - 8);
  }

  ctx.restore();
}

/**
 * Initializes DOM event listeners and state binding for the DPA/CPA simulator.
 */
export function initDpaCpaSimulator() {
  const root = document.getElementById("dpa-cpa-simulator-root");
  if (!root) return;

  const presetSelect = document.getElementById("dpa-preset-select");
  const defenseSelect = document.getElementById("dpa-defense-select");
  const noiseSlider = document.getElementById("dpa-noise-slider");
  const noiseVal = document.getElementById("dpa-noise-val");
  const rateSlider = document.getElementById("dpa-rate-slider");
  const rateVal = document.getElementById("dpa-rate-val");

  // Output Cards
  const outSnr = document.getElementById("dpa-out-snr");
  const outMtd = document.getElementById("dpa-out-mtd");
  const outRho = document.getElementById("dpa-out-rho");
  const outBits = document.getElementById("dpa-out-bits");
  const outLevel = document.getElementById("dpa-out-level");
  const outVerdict = document.getElementById("dpa-out-verdict");

  // View Mode Buttons & Canvas
  const modeBtnTraces = document.getElementById("dpa-mode-traces");
  const modeBtnWave = document.getElementById("dpa-mode-wave");
  const canvas = document.getElementById("dpa-canvas");

  let currentVisualMode = "correlation_traces";

  function getLang() {
    return (window.HubLanguage?.get() || document.documentElement.lang || "zh").startsWith("zh");
  }

  function update() {
    const isZh = getLang();
    const presetKey = presetSelect ? presetSelect.value : "fpga_unprotected_aes";
    const defenseKey = defenseSelect ? defenseSelect.value : "none_single_ended";
    const noiseStd = noiseSlider ? parseFloat(noiseSlider.value) : 1.0;
    const sampleRateGsps = rateSlider ? parseFloat(rateSlider.value) : 2.5;

    if (noiseVal && noiseSlider) {
      noiseVal.textContent = `${noiseSlider.value}x`;
    }
    if (rateVal && rateSlider) {
      rateVal.textContent = `${rateSlider.value} GSa/s`;
    }

    const res = calculateDpaCpaLeakage({
      presetKey,
      defenseKey,
      noiseStd,
      sampleRateGsps,
    });

    if (outSnr) {
      outSnr.textContent = `${res.effectiveSnrDb} dB`;
      outSnr.style.color = res.effectiveSnrDb < -15.0 ? "#059669" : res.effectiveSnrDb < -5.0 ? "#0284c7" : "#dc2626";
    }
    if (outMtd) {
      outMtd.textContent = res.estimatedMtdTraces >= 1000000
        ? `${(res.estimatedMtdTraces / 1000000).toFixed(1)}M`
        : res.estimatedMtdTraces.toLocaleString();
      outMtd.style.color = res.isAvaVan5Compliant ? "#059669" : res.isFips140Level3Compliant ? "#d97706" : "#dc2626";
    }
    if (outRho) {
      outRho.textContent = `${res.pearsonCorrelation.toFixed(4)}`;
    }
    if (outBits) {
      outBits.textContent = isZh ? `${res.scaEquivalentSecurityBits} 位元` : `${res.scaEquivalentSecurityBits} b`;
    }
    if (outLevel) {
      outLevel.textContent = res.isAvaVan5Compliant
        ? "AVA_VAN.5"
        : res.isFips140Level3Compliant
        ? "FIPS L3"
        : "Unrated";
      outLevel.style.color = res.isAvaVan5Compliant ? "#059669" : "#b45309";
    }

    if (outVerdict) {
      if (res.isAvaVan5Compliant) {
        outVerdict.innerHTML = isZh
          ? `<strong>【Common Criteria AVA_VAN.5 / 高潛在攻擊者防護達成】</strong> 一階漢明重量洩漏已藉由<strong>互補差動或二階遮罩</strong>徹底消除（相關係數 ρ ≈ ${res.pearsonCorrelation.toFixed(4)}）。估算攻破密鑰需 <strong>${res.estimatedMtdTraces.toLocaleString()} 條痕跡</strong>，已遠超標準實驗室採樣物理極限，具備國家級硬體安全抵抗力。`
          : `<strong>[COMMON CRITERIA AVA_VAN.5 RESISTANT]</strong> 1st-order Hamming Weight leakage is completely neutralized via <strong>differential dual-rail or 2nd-order masking</strong> (ρ ≈ ${res.pearsonCorrelation.toFixed(4)}). Estimated MTD is <strong>${res.estimatedMtdTraces.toLocaleString()} traces</strong>, exceeding certification sampling windows.`;
      } else if (res.isFips140Level3Compliant) {
        outVerdict.innerHTML = isZh
          ? `<strong>【NIST FIPS 140-3 Level 3 / 商用金融安全防護】</strong> 在時脈抖動與偽隨機預充電保護下，能量外洩被大幅雜湊平滑。攻破所需痕跡量達 <strong>${res.estimatedMtdTraces.toLocaleString()} 條</strong>（信噪比 ${res.effectiveSnrDb} dB）。足以防禦常規非侵入式探測。`
          : `<strong>[NIST FIPS 140-3 LEVEL 3 COMPLIANT]</strong> Active precharging and clock jitter smooth power traces to ${res.effectiveSnrDb} dB SNR. Disclosing keys requires <strong>${res.estimatedMtdTraces.toLocaleString()} traces</strong>, deterring standard non-invasive attacks.`;
      } else {
        outVerdict.innerHTML = isZh
          ? `<strong>【側信道物理脆弱性警訊】</strong> 未防護單端陣列呈現強烈一階漢明重量洩漏（信噪比高達 <strong>${res.effectiveSnrDb} dB</strong>，相關係數 ρ = ${res.pearsonCorrelation.toFixed(4)}）。攻擊者僅需 <strong>${res.estimatedMtdTraces} 條功耗痕跡</strong> 即可在數分鐘內完全還原 AES 密鑰。強烈建議導入<strong>互補差動單元或一階布林遮罩</strong>。`
          : `<strong>[SIDE-CHANNEL VULNERABILITY ALERT]</strong> Unprotected single-ended bitcells exhibit prominent Hamming Weight leakage (${res.effectiveSnrDb} dB SNR, ρ = ${res.pearsonCorrelation.toFixed(4)}). A standard CPA attack reveals the secret key in just <strong>${res.estimatedMtdTraces} traces</strong>. Dual-rail or masked architecture required.`;
      }
    }

    if (canvas) {
      drawDpaCpaCanvas(canvas, res, currentVisualMode, isZh);
    }
  }

  // Populate Presets if empty
  if (presetSelect && presetSelect.options.length === 0) {
    Object.values(DPA_ATTACK_PRESETS).forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = getLang() ? p.nameZh : p.nameEn;
      opt.setAttribute("data-opt-zh", p.nameZh);
      opt.setAttribute("data-opt-en", p.nameEn);
      presetSelect.appendChild(opt);
    });
  }

  if (defenseSelect && defenseSelect.options.length === 0) {
    Object.values(DPA_COUNTERMEASURE_PROFILES).forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d.id;
      opt.textContent = getLang() ? d.nameZh : d.nameEn;
      opt.setAttribute("data-opt-zh", d.nameZh);
      opt.setAttribute("data-opt-en", d.nameEn);
      defenseSelect.appendChild(opt);
    });
  }

  presetSelect?.addEventListener("change", update);
  defenseSelect?.addEventListener("change", update);
  noiseSlider?.addEventListener("input", update);
  rateSlider?.addEventListener("input", update);

  if (modeBtnTraces && modeBtnWave) {
    modeBtnTraces.addEventListener("click", () => {
      currentVisualMode = "correlation_traces";
      modeBtnTraces.classList.add("active");
      modeBtnTraces.setAttribute("aria-pressed", "true");
      modeBtnTraces.style.background = "#0284c7";
      modeBtnTraces.style.borderColor = "#38bdf8";
      modeBtnTraces.style.color = "#ffffff";

      modeBtnWave.classList.remove("active");
      modeBtnWave.setAttribute("aria-pressed", "false");
      modeBtnWave.style.background = "#1e293b";
      modeBtnWave.style.borderColor = "#475569";
      modeBtnWave.style.color = "#94a3b8";
      update();
    });

    modeBtnWave.addEventListener("click", () => {
      currentVisualMode = "power_waveform";
      modeBtnWave.classList.add("active");
      modeBtnWave.setAttribute("aria-pressed", "true");
      modeBtnWave.style.background = "#0284c7";
      modeBtnWave.style.borderColor = "#38bdf8";
      modeBtnWave.style.color = "#ffffff";

      modeBtnTraces.classList.remove("active");
      modeBtnTraces.setAttribute("aria-pressed", "false");
      modeBtnTraces.style.background = "#1e293b";
      modeBtnTraces.style.borderColor = "#475569";
      modeBtnTraces.style.color = "#94a3b8";
      update();
    });
  }

  window.addEventListener("hub:language-change", () => {
    const isZh = getLang();
    if (presetSelect) {
      Array.from(presetSelect.options).forEach((opt) => {
        opt.textContent = isZh ? opt.getAttribute("data-opt-zh") : opt.getAttribute("data-opt-en");
      });
    }
    if (defenseSelect) {
      Array.from(defenseSelect.options).forEach((opt) => {
        opt.textContent = isZh ? opt.getAttribute("data-opt-zh") : opt.getAttribute("data-opt-en");
      });
    }
    update();
  });

  window.addEventListener("resize", () => {
    update();
  });

  // Initial Calculation
  update();
}

// Auto-boot on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDpaCpaSimulator);
  } else {
    initDpaCpaSimulator();
  }
}
