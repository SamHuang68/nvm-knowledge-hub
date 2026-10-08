/**
 * dpa-cpa-leakage-simulator.js — Side-Channel DPA/CPA Trace Complexity & High-Order Masking Simulator
 *
 * 未校準的教學模型：原公式、固定係數與預設值保留，不能推論產品安全或認證。
 * 以下公式用於比較示意趨勢，非特定硬體量測：
 * 1. Hamming Weight (HW) Power Leakage Model:
 *    P(t) = P_{\text{baseline}}(t) + \kappa \cdot \text{HW}(D(t) \oplus R(t)) + \mathcal{N}(0, \sigma_{\text{noise}}^2)
 * 2. Signal-to-Noise Ratio (SNR) in Side-Channel Domain:
 *    \text{SNR}_{\text{leakage}} = \frac{\kappa^2 \cdot \text{Var}(\text{HW})}{\sigma_{\text{noise}}^2}
 * 3. Pearson Correlation Coefficient:
 *    \rho = \frac{1}{\sqrt{1 + \frac{1}{\text{SNR}_{\text{leakage}}}}} = \frac{\kappa \cdot \sigma_{\text{HW}}}{\sqrt{\kappa^2 \cdot \sigma_{\text{HW}}^2 + \sigma_{\text{noise}}^2}}
 * 4. Measurements to Disclosure (MTD) — Mangard's First-Order Rule:
 *    N_{\text{traces}}^{(1st)} \approx 3 + 8 \cdot \left(\frac{z_{1-\alpha}}{\rho}\right)^2 \approx \frac{c_{\alpha}}{\text{SNR}_{\text{leakage}}}
 * 5. 教學假設：將選定遮罩／雙軌映射為二階計算；不表示兩種拓撲必然有相同洩漏行為。
 *    - Unmasked (1st Order): N_{\text{traces}} \propto \text{SNR}^{-1}
 *    - 1st-Order Boolean Masking / Complementary Dual-Rail:
 *      First-order correlation \rho^{(1st)} \approx 0.
 *      此分支假設使用二階乘積模型，不推定實作的一階洩漏完全消除：
 *      N_{\text{traces}}^{(2nd)} \approx c_2 \cdot \left(\frac{1}{\text{SNR}_{\text{leakage}}}\right)^2
 *
 * Author: NVM Knowledge Hub Editorial Board
 * ISO/IEC 17825、Common Criteria 與 FIPS 140-3 僅為評估背景；此模型未執行其測試。
 */

/**
 * Side-channel attack target scenarios and baseline physical configurations.
 */
export const DPA_ATTACK_PRESETS = Object.freeze({
  fpga_unprotected_aes: {
    id: "fpga_unprotected_aes",
    nameZh: "未遮罩 AES-256 · 單端教學預設",
    nameEn: "Unmasked AES-256 · Single-Rail Teaching Preset",
    cryptoPrimitive: "AES-256 Key Schedule",
    baseSnrDb: 6.0,             // High leakage SNR ~4.0 linear
    clockJitterStdNs: 0.1,      // Minimal jitter
    shufflingFactor: 1.0,       // No instruction shuffling
    maskingOrder: 0,            // Unprotected 1st order
    targetMtdFloor: 120,        // Discloses in ~120 traces
    ccAssuranceLevel: "not-assessed",
  },
  smartcard_jitter_masked: {
    id: "smartcard_jitter_masked",
    nameZh: "28nm 智慧卡 · 抖動與預充電教學預設",
    nameEn: "28nm Smart Card · Jitter / Precharge Teaching Preset",
    cryptoPrimitive: "Hardware AES Engine",
    baseSnrDb: -6.0,            // Attenuated SNR ~0.25 linear
    clockJitterStdNs: 1.8,      // Significant desynchronization
    shufflingFactor: 3.5,       // Random op shuffling
    maskingOrder: 0,            // Obfuscated 1st order
    targetMtdFloor: 8500,       // Needs thousands of aligned traces
    ccAssuranceLevel: "not-assessed",
  },
  boolean_masked_core: {
    id: "boolean_masked_core",
    nameZh: "一階布林遮罩 · 教學預設 (S = X ^ M)",
    nameEn: "1st-Order Boolean Masking · Teaching Preset (S = X ^ M)",
    cryptoPrimitive: "Masked AES S-Box",
    baseSnrDb: -14.0,           // 1st order eliminated, residual leakage SNR
    clockJitterStdNs: 0.8,
    shufflingFactor: 2.0,
    maskingOrder: 1,            // Requires 2nd-order CPA
    targetMtdFloor: 350000,     // 350k+ traces required
    ccAssuranceLevel: "not-assessed",
  },
  dual_rail_neopuf_diff: {
    id: "dual_rail_neopuf_diff",
    nameZh: "互補雙軌 + NeoPUF 信任根 · 未量測教學假設",
    nameEn: "Dual-Rail + NeoPUF RoT · Unmeasured Teaching Assumption",
    cryptoPrimitive: "Silicon RoT Key Bus",
    baseSnrDb: -26.0,           // Severe differential attenuation (<0.0025 linear)
    clockJitterStdNs: 2.5,
    shufflingFactor: 4.0,
    maskingOrder: 1,            // Inherent differential pair + 2nd order barrier
    targetMtdFloor: 2800000,    // Millions of traces needed
    ccAssuranceLevel: "not-assessed",
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
    notesZh: "以份額 (Share1 ^ Share2) 為教學假設；實際洩漏與遮罩效果仍取決於具體實作。",
    notesEn: "Illustrates an idealized share model (S1 ^ S2); actual leakage also depends on implementation.",
  },
  complementary_dual_rail: {
    id: "complementary_dual_rail",
    nameZh: "04 · 硬體互補差動雙軌單元 (Dual-Rail Differential AntiFuse)",
    nameEn: "04 · Hardware Complementary Dual-Rail (Differential AntiFuse)",
    leakageScaleFactor: 0.02,
    differentialCancellationDb: 32.0,
    orderMultiplier: 2,         // Inherent differential symmetry + 2nd order
    siliconOverheadPct: 110,    // 2x bitcell area + diff sense amplifier
    notesZh: "以真值與補值雙軌平衡為教學假設；版圖失配與實作洩漏仍須量測。",
    notesEn: "Illustrates balanced rails; routing mismatch and implementation leakage require measurement.",
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

  // 100M 是本工具顯示上限，非量測極限或防禦實績。
  const traceDisplayCapped = estimatedMtdTraces >= 100000000;
  estimatedMtdTraces = Math.max(50, Math.min(100000000, estimatedMtdTraces));

  // 原 16 + 5.6 × log2(N) 分數保留為無單位教學指標，非金鑰熵或安全位元。
  const illustrativeScore = Math.min(128, Math.round(16.0 + Math.log2(estimatedMtdTraces) * 5.6));
  // 相容舊欄位以 false 阻止舊呼叫端授予認證；不代表評估失敗。
  // 真正評估狀態由 assessmentStatus 表示，任何預設皆為未評估。
  const scaEquivalentSecurityBits = illustrativeScore;
  const isAvaVan5Compliant = false;
  const isFips140Level3Compliant = false;

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
    illustrativeScore,
    traceDisplayCapped,
    assessmentStatus: "not-assessed",
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
  // 字寬決定圖例與軸標籤換列，保持圖形原有的可讀高度。
  function wrapLabel(text, maxWidth) {
    const tokens = text.includes(" ") ? text.split(/\s+/) : [...text];
    const lines = []; let line = "";
    for (const token of tokens) {
      const separator = text.includes(" ") && line ? " " : "";
      const next = line + separator + token;
      if (line && ctx.measureText(next).width > maxWidth) {lines.push(line); line = token;}
      else line = next;
      if (ctx.measureText(line).width > maxWidth) {
        let fragment = "";
        for (const character of line) {
          if (fragment && ctx.measureText(fragment + character).width > maxWidth) {lines.push(fragment); fragment = "";}
          fragment += character;
        }
        line = fragment;
      }
    }
    if (line) lines.push(line);
    return lines;
  }
  ctx.font = "600 11px 'IBM Plex Mono', monospace";
  const paired = ["complementary_dual_rail", "boolean_mask_1st"].includes(results.defenseKey);
  const masked = results.defenseKey === "boolean_mask_1st";
  const legend = mode === "correlation_traces" ? [] : [
    {color: "#38bdf8", text: isZh ? (masked ? "份額 A 示意" : "真值軌示意 I(D)") : (masked ? "Share A schematic" : "True rail schematic I(D)")},
    ...(paired ? [
      {color: "#fbbf24", text: isZh ? (masked ? "份額 B 示意" : "補值軌示意 I(/D)") : (masked ? "Share B schematic" : "Complement schematic I(/D)")},
      {color: "#10b981", text: isZh ? "合成殘差示意" : "Residual schematic"},
    ] : []),
  ];
  let legendY = 16;
  const legendRows = legend.map(item => {
    const lines = wrapLabel(item.text, Math.max(40, displayWidth - 16));
    const row = {...item, lines, y: legendY}; legendY += lines.length * 15 + 5; return row;
  });
  const xLabel = mode === "correlation_traces"
    ? (isZh ? `示意痕跡量 N · ${results.effectiveOrder} 階模型` : `Illustrative traces N · Order ${results.effectiveOrder}`)
    : (isZh ? "示意採樣點 t" : "Illustrative samples t");
  const axisLines = wrapLabel(xLabel, Math.max(40, displayWidth - 16));
  const plotLeft = 60;
  const plotRight = displayWidth - 10;
  const plotTop = mode === "correlation_traces" ? 20 : legendY + 12;
  const displayHeight = Math.max(180, plotTop + 132 + axisLines.length * 15 + 13);
  canvas.style.height = `${displayHeight}px`;
  if (canvas.width !== Math.round(displayWidth * dpr) || canvas.height !== Math.round(displayHeight * dpr)) {
    canvas.width = Math.round(displayWidth * dpr); canvas.height = Math.round(displayHeight * dpr);
  }
  ctx.save(); ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, displayWidth, displayHeight);
  const bgGrad = ctx.createLinearGradient(0, 0, displayWidth, displayHeight);
  bgGrad.addColorStop(0, "#08101a"); bgGrad.addColorStop(1, "#03070d");
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, displayWidth, displayHeight);
  const plotBottom = displayHeight - axisLines.length * 15 - 12;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;
  ctx.strokeStyle = "rgba(148, 163, 184, 0.12)"; ctx.lineWidth = 1;
  for (let r = 1; r < 4; r++) {
    const y = plotTop + plotHeight * r / 4;
    ctx.beginPath(); ctx.moveTo(plotLeft, y); ctx.lineTo(plotRight, y); ctx.stroke();
  }
  for (let c = 1; c < 6; c++) {
    const x = plotLeft + plotWidth * c / 6;
    ctx.beginPath(); ctx.moveTo(x, plotTop); ctx.lineTo(x, plotBottom); ctx.stroke();
  }
  ctx.font = "600 11px 'IBM Plex Mono', monospace";
  for (const row of legendRows) {
    ctx.fillStyle = row.color;
    row.lines.forEach((line, i) => ctx.fillText(line, 8, row.y + i * 15));
  }
  ctx.fillStyle = "#94a3b8";
  axisLines.forEach((line, i) => ctx.fillText(line, Math.max(8, (displayWidth - ctx.measureText(line).width) / 2), plotBottom + 17 + i * 15));

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
    ctx.strokeStyle = "#38bdf8";
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
      ctx.font = "700 11px 'IBM Plex Mono', monospace";
      const marker = `N: ${mtd >= 1e6 ? (mtd / 1e6).toFixed(1) + "M" : mtd.toLocaleString()}`;
      const markerX = Math.max(8, Math.min(displayWidth - 8 - ctx.measureText(marker).width, mtdX - 35));
      ctx.fillText(marker, markerX, plotTop + 12);
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
    ctx.font = "600 11px 'IBM Plex Mono', monospace";
    ctx.fillText("ρ = +1.0", 5, plotTop + 8);
    ctx.fillText("ρ = 0.0", 5, plotBottom - plotHeight * 0.5 + 3);
    ctx.fillText("ρ = -1.0", 5, plotBottom - 2);



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
      const y = plotBottom - (yVal / 1.5) * plotHeight;
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
        const y = plotBottom - (yVal / 1.5) * plotHeight;
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
        const residual = (Math.sin(i * 4.2) * 0.04) + Math.sin(i * 2.7) * 0.015;
        const yVal = 0.18 + residual;
        const y = plotBottom - (yVal / 1.5) * plotHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 11px 'IBM Plex Mono', monospace";
    ctx.fillText("I(t) a.u.", 5, plotTop + 8);
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
      noiseSlider.setAttribute("aria-valuetext", noiseVal.textContent);
    }
    if (rateVal && rateSlider) {
      rateVal.textContent = `${rateSlider.value} GSa/s`;
      rateSlider.setAttribute("aria-valuetext", rateVal.textContent);
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
      outMtd.style.color = "#0284c7";
    }
    if (outRho) {
      outRho.textContent = `${res.pearsonCorrelation.toFixed(4)}`;
    }
    if (outBits) {
      outBits.textContent = isZh ? `${res.illustrativeScore} 點` : `${res.illustrativeScore} pts`;
    }
    if (outLevel) {
      outLevel.textContent = isZh ? "未評估" : "Not assessed";
      outLevel.style.color = "#475569";
    }
    if (outVerdict) {
      const traces = res.estimatedMtdTraces.toLocaleString();
      const capped = res.traceDisplayCapped ? (isZh ? "（已達 100M 顯示上限）" : " (100M display cap reached)") : "";
      outVerdict.innerHTML = isZh
        ? `<strong>【未校準教學比較】</strong> 此 ${res.effectiveOrder} 階示意模型得到 SNR ${res.effectiveSnrDb} dB、ρ = ${res.pearsonCorrelation.toFixed(4)}、痕跡量指標 <strong>${traces}${capped}</strong>。曲線與分數不能預測實際金鑰還原、攻擊時間、金鑰安全位元或認證結果；須依具體實作、量測痕跡與獨立評估判定。`
        : `<strong>[UNCALIBRATED TEACHING COMPARISON]</strong> This order-${res.effectiveOrder} model gives SNR ${res.effectiveSnrDb} dB, ρ = ${res.pearsonCorrelation.toFixed(4)}, and an illustrative trace count of <strong>${traces}${capped}</strong>. Curves and scores do not predict actual key recovery, attack time, security bits, or certification; implementation-specific measurements and independent evaluation are required.`;
    }

    if (canvas) {
      drawDpaCpaCanvas(canvas, res, currentVisualMode, isZh);
      canvas.setAttribute("aria-label", isZh
        ? `未校準側信道示意圖；${res.effectiveOrder} 階模型，SNR ${res.effectiveSnrDb} dB，相關係數 ${res.pearsonCorrelation}，痕跡量指標 ${res.estimatedMtdTraces}，認證未評估。`
        : `Uncalibrated side-channel schematic; order ${res.effectiveOrder}, SNR ${res.effectiveSnrDb} dB, correlation ${res.pearsonCorrelation}, illustrative traces ${res.estimatedMtdTraces}; certification not assessed.`);
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
