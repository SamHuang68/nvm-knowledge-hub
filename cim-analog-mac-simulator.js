import { syncMetricCopy } from './模型數值複製.js';

/**
 * cim-analog-mac-simulator.js — Compute-in-Memory (CiM) Analog MAC Precision & ADC ENOB Trade-off Simulator
 *
 * First-Principles Mathematical Modeling:
 * 1. Kirchhoff's Current Law & Analog Vector-Matrix Multiply:
 *    I_{j} = \sum_{i=1}^{M} V_i \cdot G_{ij}
 * 2. Non-Ideal Conductance Degradation:
 *    - Retention Drift: G(t) = G_0 \cdot (t / t_0)^{-\nu}
 *    - Device Mismatch / C2C Variation: G_{ij} \sim \mathcal{N}(\mu_G, \sigma_G^2)
 *    - Bitline Parasitic IR-Drop: \Delta V_{\text{BL}}(k) \approx \sum_{m=1}^k I_m \cdot R_{\text{wire}}
 * 3. ADC Quantization Noise & Effective Number of Bits (ENOB):
 *    - Ideal SNR: \text{SNR}_{\text{quant}} = 6.02 \cdot B_{\text{nom}} + 1.76\text{ dB}
 *    - Mixed-Signal SINAD: \text{SINAD} = 10 \log_{10}\left(\frac{P_{\text{signal}}}{P_{\text{quant}} + P_{\text{thermal}} + P_{\text{drift}} + P_{\text{IR}}}\right)
 *    - Realized \text{ENOB} = \frac{\text{SINAD} - 1.76}{6.02}
 * 4. Neural Network Inference Accuracy Drop Model (Taylor-series Noise Injection):
 *    \text{Acc}(\text{SINAD}) = \text{Acc}_{\text{base}} \cdot \left[1 - \alpha_{\text{layer}} \cdot \exp\left(-\frac{\text{SINAD} - \text{SINAD}_{\text{crit}}}{\beta_{\text{layer}}}\right)\right]
 * 5. Energy Efficiency & Macro Dissipation:
 *    \text{TOPS/W} = \frac{2 \cdot M \cdot N \cdot f_{\text{clk}}}{P_{\text{array}} + P_{\text{ADC}} + P_{\text{digital}}}
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: IEEE TCAD, IEEE JSSC CiM benchmarks, ISO/IEC 24029 AI Robustness
 */

/**
 * Workload presets for representative neural network layers.
 */
export const CIM_WORKLOAD_PRESETS = Object.freeze({
  transformer_attn: {
    id: "transformer_attn",
    nameZh: "Transformer 自注意力投影 (INT8, 768×768)",
    nameEn: "Transformer Self-Attention Projection (INT8, 768×768)",
    matrixRows: 768,
    matrixCols: 768,
    weightBits: 8,
    inputBits: 8,
    nominalAccuracy: 94.2, // BLEU / Top-1 %
    critSinadDb: 34.0,     // Highly sensitive to analog noise
    sensitivityAlpha: 0.85,
    sensitivityBeta: 4.5,
    targetUnit: "Top-1 Acc %",
  },
  resnet_conv: {
    id: "resnet_conv",
    nameZh: "ResNet-50 卷積層 (INT8, 256×256×3×3)",
    nameEn: "ResNet-50 Conv Layer (INT8, 256×256×3×3)",
    matrixRows: 576,       // 64 * 9
    matrixCols: 256,
    weightBits: 8,
    inputBits: 8,
    nominalAccuracy: 76.8, // ImageNet Top-1 %
    critSinadDb: 28.0,
    sensitivityAlpha: 0.65,
    sensitivityBeta: 6.0,
    targetUnit: "Top-1 Acc %",
  },
  mobilenet_dw: {
    id: "mobilenet_dw",
    nameZh: "MobileNetV2 深度可分離卷積 (INT4, 128×128)",
    nameEn: "MobileNetV2 Depthwise Separable Conv (INT4, 128×128)",
    matrixRows: 128,
    matrixCols: 128,
    weightBits: 4,
    inputBits: 4,
    nominalAccuracy: 72.1,
    critSinadDb: 22.0,
    sensitivityAlpha: 0.55,
    sensitivityBeta: 7.5,
    targetUnit: "Top-1 Acc %",
  },
  bnn_xnor: {
    id: "bnn_xnor",
    nameZh: "Edge TinyML 語音喚醒詞 (1-bit BNN, 512×64)",
    nameEn: "Edge TinyML Keyword Spotting (1-bit BNN, 512×64)",
    matrixRows: 512,
    matrixCols: 64,
    weightBits: 1,
    inputBits: 1,
    nominalAccuracy: 91.5,
    critSinadDb: 14.0,     // High noise tolerance of binary networks
    sensitivityAlpha: 0.35,
    sensitivityBeta: 9.0,
    targetUnit: "Word Acc %",
  },
});

/**
 * Memory cell device physical parameters.
 */
export const CIM_DEVICE_ARCHITECTURES = Object.freeze({
  reram_oxram: {
    id: "reram_oxram",
    nameZh: "ReRAM / 阻變記憶體 (氧化物微絲 4-bit MLC)",
    nameEn: "ReRAM / OxRAM (Filamentary 4-bit MLC)",
    minConductanceUS: 2.0,
    maxConductanceUS: 50.0,
    driftExponentNu: 0.08,    // Notable conductance relaxation
    c2cVariationSigma: 0.08,  // 8% variation
    readVoltageV: 0.30,
    cellWireResistanceOhm: 2.2,
    analogMultiLevel: true,
  },
  mram_stt: {
    id: "mram_stt",
    nameZh: "STT-MRAM (自旋磁阻穿隧 1-bit 二元)",
    nameEn: "STT-MRAM (Spin-Transfer Torque 1-bit Binary)",
    minConductanceUS: 70.0,
    maxConductanceUS: 120.0,  // TMR ~ 70%
    driftExponentNu: 0.001,   // Negligible drift
    c2cVariationSigma: 0.025, // 2.5% variation
    readVoltageV: 0.18,
    cellWireResistanceOhm: 1.5,
    analogMultiLevel: false,
  },
  nor_flash: {
    id: "nor_flash",
    nameZh: "嵌入式 NOR Flash (浮閘電荷 4-bit MLC)",
    nameEn: "Embedded NOR Flash (Floating-Gate 4-bit MLC)",
    minConductanceUS: 1.5,
    maxConductanceUS: 25.0,
    driftExponentNu: 0.025,   // Moderate charge loss over years
    c2cVariationSigma: 0.04,  // 4% variation
    readVoltageV: 0.45,
    cellWireResistanceOhm: 2.5,
    analogMultiLevel: true,
  },
  sram_charge: {
    id: "sram_charge",
    nameZh: "8T SRAM 電荷域 (Capacitive Accumulation 1-bit)",
    nameEn: "8T SRAM Charge-Domain (Capacitive 1-bit)",
    minConductanceUS: 10.0,
    maxConductanceUS: 60.0,
    driftExponentNu: 0.0,     // Volatile zero drift
    c2cVariationSigma: 0.015, // 1.5% transistor mismatch
    readVoltageV: 0.65,
    cellWireResistanceOhm: 1.2,
    analogMultiLevel: false,
  },
});

/**
 * ADC Energy scaling table per conversion (Walden FOM & flash/SAR architectures).
 */
export const ADC_FOM_MAP = Object.freeze({
  4: { energyPj: 0.05, enobOffset: 0.25 },
  6: { energyPj: 0.22, enobOffset: 0.45 },
  7: { energyPj: 0.55, enobOffset: 0.65 },
  8: { energyPj: 1.45, enobOffset: 0.85 },
  9: { energyPj: 3.80, enobOffset: 1.15 },
});

/**
 * Calculates first-principles analog MAC precision, SINAD, realized ENOB, and accuracy drop.
 *
 * @param {Object} options
 * @param {string} options.workloadKey - Key in CIM_WORKLOAD_PRESETS
 * @param {string} options.deviceKey - Key in CIM_DEVICE_ARCHITECTURES
 * @param {number} options.nominalAdcBits - Nominal ADC resolution (4..9)
 * @param {number} options.retentionHours - Retention time in hours (0..87600)
 * @param {number} options.temperatureC - Operating junction temperature (-40..150 °C)
 * @param {number} options.clockFreqMHz - Array operating frequency in MHz (20..500)
 * @returns {Object} Quantitative calculation results
 */
export function calculateCimAnalogMac({
  workloadKey = "transformer_attn",
  deviceKey = "reram_oxram",
  nominalAdcBits = 6,
  retentionHours = 100,
  temperatureC = 85,
  clockFreqMHz = 100,
} = {}) {
  const workload = CIM_WORKLOAD_PRESETS[workloadKey] || CIM_WORKLOAD_PRESETS.transformer_attn;
  const dev = CIM_DEVICE_ARCHITECTURES[deviceKey] || CIM_DEVICE_ARCHITECTURES.reram_oxram;

  const N_rows = Math.max(16, Math.min(1024, Number(workload.matrixRows) || 256));
  const M_cols = Math.max(16, Math.min(1024, Number(workload.matrixCols) || 256));
  const B_adc_nom = Math.max(4, Math.min(9, Math.round(Number(nominalAdcBits) || 6)));
  const t_ret = Math.max(0.1, Number(retentionHours) || 0.1);
  const tempK = Math.max(233.15, Math.min(423.15, (Number(temperatureC) || 85) + 273.15));
  const f_clk = Math.max(10, Math.min(500, Number(clockFreqMHz) || 100)) * 1e6; // Hz

  // 1. Device Conductance & Retention Drift Calculation
  // G(t) = G_0 * (t / t_0)^{-\nu}, reference t_0 = 1 hour
  const driftFactor = Math.pow(Math.max(1.0, t_ret), -dev.driftExponentNu);
  const thermalDegradation = 1.0 + 0.0015 * Math.max(0, tempK - 298.15); // Thermal variance factor
  const sigmaC2C = dev.c2cVariationSigma * thermalDegradation;

  const gMin = dev.minConductanceUS * 1e-6;
  const gMax = dev.maxConductanceUS * 1e-6 * driftFactor;
  const gDynamicRange = Math.max(1e-7, gMax - gMin);
  const vRead = dev.readVoltageV;

  // 2. Average Column Current Summation (50% activation sparsity)
  const activeFraction = 0.5;
  const iCellAvg = vRead * (gMin + 0.5 * gDynamicRange) * activeFraction;
  const iColAvg = N_rows * iCellAvg; // Amperes
  const pSignal = Math.pow(iColAvg, 2);

  // 3. Noise & Distortion Powers:
  // a) Cell Conductance Variation Noise Power:
  const pNoiseC2c = Math.pow(N_rows * activeFraction * vRead * (gDynamicRange * sigmaC2C), 2) / N_rows;

  // b) Parasitic Line IR-Drop Distortion:
  // Cumulative line drop at column midpoint: deltaV = 0.5 * N_rows * I_cell * R_wire
  const rWireTotal = N_rows * dev.cellWireResistanceOhm;
  const maxIrDropV = 0.5 * N_rows * (vRead * gMax) * dev.cellWireResistanceOhm;
  const irDropPercent = Math.min(85, (maxIrDropV / vRead) * 100);
  const pNoiseIr = Math.pow(iColAvg * (irDropPercent / 100) * 0.45, 2);

  // c) ADC Quantization Noise Power:
  // Ideal LSB current: I_LSB = (N_rows * vRead * gDynamicRange) / (2^B_adc_nom)
  const iRangeFull = N_rows * vRead * gDynamicRange;
  const lsbCurrent = iRangeFull / Math.pow(2, B_adc_nom);
  const pNoiseQuant = Math.pow(lsbCurrent, 2) / 12.0;

  // d) Thermal & Jitter Analog Noise Floor:
  const pNoiseThermal = pSignal * 1e-6; // ~-60 dB thermal baseline

  // Total Non-Ideality Noise Power:
  const pTotalNoise = pNoiseQuant + pNoiseC2c + pNoiseIr + pNoiseThermal;

  // 4. Signal-to-Noise-and-Distortion Ratio (SINAD) & Realized ENOB:
  const sinadLinear = Math.max(1.0, pSignal / Math.max(1e-18, pTotalNoise));
  const sinadDb = 10.0 * Math.log10(sinadLinear);
  const realizedEnob = Math.max(1.0, Math.min(B_adc_nom, (sinadDb - 1.76) / 6.02));

  // 5. Neural Network Inference Accuracy Drop Model:
  // Acc(SINAD) = Acc_nom - penalty
  const sinadDiff = sinadDb - workload.critSinadDb;
  let accDropPercent = 0.0;
  if (sinadDiff >= 12.0) {
    accDropPercent = 0.05 * Math.exp(-0.2 * (sinadDiff - 12.0));
  } else if (sinadDiff >= 0.0) {
    accDropPercent = 0.1 + (workload.sensitivityAlpha * 5.0) * Math.exp(-sinadDiff / workload.sensitivityBeta);
  } else {
    // Below critical SINAD: catastrophic accuracy collapse
    accDropPercent = Math.min(
      workload.nominalAccuracy * 0.85,
      (workload.sensitivityAlpha * 5.0) + Math.abs(sinadDiff) * 3.8
    );
  }
  const estimatedAccuracy = Math.max(5.0, workload.nominalAccuracy - accDropPercent);

  // 6. Energy, Power, and Efficiency (TOPS/W):
  const macsPerCycle = N_rows * M_cols;
  const opsPerCycle = 2 * macsPerCycle;
  const throughputTops = (opsPerCycle * f_clk) / 1e12;

  const pArrayWatts = M_cols * (vRead * iColAvg);
  const adcFom = ADC_FOM_MAP[B_adc_nom] || ADC_FOM_MAP[6];
  const pAdcWatts = M_cols * (adcFom.energyPj * 1e-12) * f_clk;
  const pDigitalWatts = (pArrayWatts + pAdcWatts) * 0.18; // Periphery / clock
  const pTotalWatts = pArrayWatts + pAdcWatts + pDigitalWatts;

  const macroTopsPerWatt = throughputTops / Math.max(1e-6, pTotalWatts);
  const arrayOnlyTopsPerWatt = (throughputTops * 1e12) / Math.max(1e-6, pArrayWatts * 1e12);
  const adcOverheadFraction = (pAdcWatts / pTotalWatts) * 100;

  // 7. Dominant Impairment Identification:
  const noiseContributions = [
    { key: "quant", nameZh: "ADC 量化雜訊", nameEn: "ADC Quantization", val: pNoiseQuant },
    { key: "c2c", nameZh: "電導微影失配/漂移", nameEn: "Conductance Variation & Drift", val: pNoiseC2c },
    { key: "ir", nameZh: "位元線金屬 IR-Drop 壓降", nameEn: "Bitline Parasitic IR-Drop", val: pNoiseIr },
  ].sort((a, b) => b.val - a.val);

  return {
    workloadKey: workload.id,
    workloadNameZh: workload.nameZh,
    workloadNameEn: workload.nameEn,
    deviceKey: dev.id,
    deviceNameZh: dev.nameZh,
    deviceNameEn: dev.nameEn,
    matrixDim: `${N_rows}×${M_cols}`,
    nominalAdcBits: B_adc_nom,
    realizedEnob: Number(realizedEnob.toFixed(2)),
    sinadDb: Number(sinadDb.toFixed(1)),
    nominalAccuracy: workload.nominalAccuracy,
    estimatedAccuracy: Number(estimatedAccuracy.toFixed(1)),
    accDropPercent: Number(accDropPercent.toFixed(1)),
    targetUnit: workload.targetUnit,
    throughputTops: Number(throughputTops.toFixed(2)),
    macroTopsPerWatt: Number(macroTopsPerWatt.toFixed(1)),
    arrayOnlyTopsPerWatt: Number(arrayOnlyTopsPerWatt.toFixed(1)),
    adcOverheadFraction: Number(adcOverheadFraction.toFixed(1)),
    irDropPercent: Number(irDropPercent.toFixed(1)),
    dominantImpairment: noiseContributions[0],
    powerWatts: {
      array: pArrayWatts,
      adc: pAdcWatts,
      digital: pDigitalWatts,
      total: pTotalWatts,
    },
    isAccuracySafe: accDropPercent <= 1.5,
  };
}

/**
 * Draws the high-DPI Canvas visualization for the CiM Analog MAC workbench.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} results - Result object from calculateCimAnalogMac
 * @param {string} mode - 'histogram' or 'accuracy_curve'
 * @param {boolean} isZh - Language flag
 */
export function drawCimMacCanvas(canvas, results, mode = "histogram", isZh = true) {
  if (!canvas || !results) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(300, rect.width || 420);
  const height = Math.max(160, rect.height || 190);

  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, "#09131e");
  bgGrad.addColorStop(1, "#03080e");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const padLeft = 44;
  const padRight = 24;
  const padTop = 26;
  const padBottom = 30;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  if (mode === "histogram") {
    // Mode 1: Analog Summed Current Histogram vs ADC Quantization Levels
    const levels = Math.pow(2, Math.min(6, results.nominalAdcBits));
    const stepW = plotW / levels;

    // Draw Quantization Bins
    ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    for (let k = 0; k <= levels; k++) {
      const x = padLeft + k * stepW;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw Simulated Current Distribution (Gaussian bell-curve envelope)
    ctx.beginPath();
    const meanIdx = levels * 0.48;
    const stdIdx = levels * 0.16 * (1.0 + results.irDropPercent / 50);

    for (let px = 0; px <= plotW; px += 2) {
      const binIdx = (px / plotW) * levels;
      const z = (binIdx - meanIdx) / stdIdx;
      const pdf = Math.exp(-0.5 * z * z);
      const y = padTop + plotH - pdf * (plotH * 0.82);
      if (px === 0) ctx.moveTo(padLeft + px, y);
      else ctx.lineTo(padLeft + px, y);
    }

    ctx.strokeStyle = results.isAccuracySafe ? "#34d399" : "#f87171";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    fillGrad.addColorStop(0, results.isAccuracySafe ? "rgba(52, 211, 153, 0.35)" : "rgba(248, 113, 113, 0.35)");
    fillGrad.addColorStop(1, "rgba(15, 23, 42, 0.0)");
    ctx.fillStyle = fillGrad;
    ctx.fill();

    // IR-drop distortion skew line
    const skewX = padLeft + plotW * 0.75;
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(skewX, padTop);
    ctx.lineTo(skewX, padTop + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Text labels
    ctx.font = "600 10px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(isZh ? "位元線類比累加電流 I_BL (μA)" : "Bitline Current I_BL (μA)", padLeft, height - 10);
    ctx.fillStyle = "#fbbf24";
    ctx.fillText(
      isZh ? `IR-Drop 偏移: -${results.irDropPercent}%` : `IR-Drop Skew: -${results.irDropPercent}%`,
      skewX - 45,
      padTop + 14
    );

  } else {
    // Mode 2: Accuracy vs SINAD / ENOB Roll-off Curve
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 1;

    // Draw horizontal grid lines (100%, 75%, 50%, 25%)
    for (let g = 0; g <= 4; g++) {
      const y = padTop + (plotH / 4) * g;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();

      ctx.font = "500 9px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "#64748b";
      const pct = Math.round(100 - g * 25);
      ctx.fillText(`${pct}%`, padLeft - 28, y + 3);
    }

    // Roll-off Curve
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;

    let markerX = 0;
    let markerY = 0;

    for (let b = 2.0; b <= 9.0; b += 0.1) {
      const normX = (b - 2.0) / 7.0;
      const x = padLeft + normX * plotW;

      // Simulated roll-off
      const sinadSim = b * 6.02 + 1.76 - (results.nominalAdcBits * 6.02 + 1.76 - results.sinadDb);
      const deltaSinad = sinadSim - 26.0;
      let accSim = 0;
      if (deltaSinad >= 6) {
        accSim = results.nominalAccuracy;
      } else if (deltaSinad >= 0) {
        accSim = results.nominalAccuracy - 3.0 * Math.exp(-deltaSinad / 3.0);
      } else {
        accSim = Math.max(10, results.nominalAccuracy - 3.0 - Math.abs(deltaSinad) * 5.0);
      }
      const y = padTop + plotH - (accSim / 100.0) * plotH;

      if (b === 2.0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      if (Math.abs(b - results.realizedEnob) < 0.08) {
        markerX = x;
        markerY = y;
      }
    }
    ctx.stroke();

    // Current Operating Point Marker
    if (markerX > 0) {
      ctx.beginPath();
      ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = results.isAccuracySafe ? "#34d399" : "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tooltip above marker
      ctx.font = "700 9.5px 'IBM Plex Mono', monospace";
      ctx.fillStyle = results.isAccuracySafe ? "#34d399" : "#f87171";
      ctx.fillText(
        `${results.realizedEnob} b → ${results.estimatedAccuracy}%`,
        Math.max(padLeft, markerX - 35),
        Math.max(padTop + 12, markerY - 9)
      );
    }

    ctx.font = "600 10px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(isZh ? "實現有效位元 (ENOB)" : "Realized ENOB (bits)", padLeft + plotW * 0.4, height - 10);
  }

  // Title in Canvas
  ctx.font = "700 10.5px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(
    mode === "histogram"
      ? (isZh ? "位元線類比加總電流分佈 vs ADC 量化階梯" : "Bitline Current Distribution vs ADC Levels")
      : (isZh ? "類比推論精準度 vs 實現 ENOB 特性曲線" : "Inference Accuracy vs Realized ENOB Curve"),
    padLeft,
    padTop - 10
  );

  ctx.restore();
}

/**
 * Initializes DOM interactive controls and event listeners for the CiM Analog MAC Simulator.
 */
export function initCimAnalogMacSimulator() {
  const root = document.getElementById("cim-mac-precision-root");
  if (!root) return;

  const workloadSelect = document.getElementById("cim-mac-workload-select");
  const deviceSelect = document.getElementById("cim-mac-device-select");
  const adcSelect = document.getElementById("cim-mac-adc-select");
  const tempSlider = document.getElementById("cim-mac-temp-slider");
  const tempVal = document.getElementById("cim-mac-temp-val");
  const retSlider = document.getElementById("cim-mac-ret-slider");
  const retVal = document.getElementById("cim-mac-ret-val");
  const modeBtnHist = document.getElementById("cim-mac-mode-hist");
  const modeBtnCurve = document.getElementById("cim-mac-mode-curve");
  const canvas = document.getElementById("cim-mac-canvas");

  // Output Elements
  const outEnob = document.getElementById("cim-mac-out-enob");
  const outSinad = document.getElementById("cim-mac-out-sinad");
  const outAccuracy = document.getElementById("cim-mac-out-accuracy");
  const outTopsWatt = document.getElementById("cim-mac-out-topswatt");
  const outAdcShare = document.getElementById("cim-mac-out-adcshare");
  const outVerdict = document.getElementById("cim-mac-out-verdict");

  let currentVisualMode = "histogram";

  function getLang() {
    return (window.HubLanguage?.get() || document.documentElement.lang || "zh").startsWith("zh");
  }

  function update() {
    const isZh = getLang();
    const workloadKey = workloadSelect ? workloadSelect.value : "transformer_attn";
    const deviceKey = deviceSelect ? deviceSelect.value : "reram_oxram";
    const nominalAdcBits = adcSelect ? parseInt(adcSelect.value, 10) : 6;
    const temperatureC = tempSlider ? parseInt(tempSlider.value, 10) : 85;
    const retentionHours = retSlider ? parseInt(retSlider.value, 10) : 1000;

    if (tempVal && tempSlider) {
      tempVal.textContent = `${tempSlider.value} °C`;
    }
    if (retVal && retSlider) {
      const h = parseInt(retSlider.value, 10);
      if (h >= 8760) {
        retVal.textContent = isZh ? `${(h / 8760).toFixed(1)} 年` : `${(h / 8760).toFixed(1)} Yrs`;
      } else {
        retVal.textContent = `${h} hrs`;
      }
    }

    const res = calculateCimAnalogMac({
      workloadKey,
      deviceKey,
      nominalAdcBits,
      retentionHours,
      temperatureC,
      clockFreqMHz: 100,
    });

    if (outEnob) {
      outEnob.textContent = `${res.realizedEnob.toFixed(2)} / ${res.nominalAdcBits} b`;
      outEnob.style.color = res.realizedEnob >= res.nominalAdcBits - 0.8 ? "#059669" : "#dc2626";
    }
    if (outSinad) {
      outSinad.textContent = `${res.sinadDb.toFixed(1)} dB`;
    }
    if (outAccuracy) {
      outAccuracy.textContent = `${res.estimatedAccuracy.toFixed(1)}%`;
      outAccuracy.style.color = res.isAccuracySafe ? "#059669" : "#dc2626";
    }
    if (outTopsWatt) {
      outTopsWatt.textContent = `${res.macroTopsPerWatt.toFixed(1)} TOPS/W`;
    }
    if (outAdcShare) {
      outAdcShare.textContent = `${res.adcOverheadFraction.toFixed(1)}%`;
      outAdcShare.style.color = res.adcOverheadFraction > 65 ? "#dc2626" : "#475569";
    }

    if (outVerdict) {
      const imp = isZh ? res.dominantImpairment.nameZh : res.dominantImpairment.nameEn;
      if (res.isAccuracySafe) {
        outVerdict.innerHTML = isZh
          ? `<strong>【架構健康】</strong> 當前神經網絡推論精度維持在 <strong>${res.estimatedAccuracy.toFixed(1)}%</strong>（精度退化僅 ${res.accDropPercent.toFixed(1)}%），巨集能效達 <strong>${res.macroTopsPerWatt.toFixed(1)} TOPS/W</strong>。主要非理想雜訊源為 <em>${imp}</em>，維持在安全雜訊裕度內。`
          : `<strong>[STABLE ARCHITECTURE]</strong> Inference accuracy maintains at <strong>${res.estimatedAccuracy.toFixed(1)}%</strong> (drop: ${res.accDropPercent.toFixed(1)}%), achieving <strong>${res.macroTopsPerWatt.toFixed(1)} TOPS/W</strong>. Dominant analog impairment is <em>${imp}</em>, staying within safe noise margins.`;
      } else {
        outVerdict.innerHTML = isZh
          ? `<strong>【精度崩潰警訊】</strong> 推論精度嚴重退化至 <strong>${res.estimatedAccuracy.toFixed(1)}%</strong>（較基線驟降 ${res.accDropPercent.toFixed(1)}%）。原因在於 <em>${imp}</em> 導致實現 ENOB 僅 ${res.realizedEnob.toFixed(2)} bit。建議實施<strong>量化感知訓練 (QAT)</strong> 或提升單元 TMR / 縮減陣列規模以壓制 IR-Drop。`
          : `<strong>[ACCURACY COLLAPSE ALERT]</strong> Inference accuracy severely drops to <strong>${res.estimatedAccuracy.toFixed(1)}%</strong> (loss: ${res.accDropPercent.toFixed(1)}%). Dominant impairment <em>${imp}</em> throttles realized ENOB down to ${res.realizedEnob.toFixed(2)} bits. Apply <strong>Quantization-Aware Training (QAT)</strong> or downscale array tiles to mitigate IR-drop.`;
      }
    }

    if (canvas) {
      drawCimMacCanvas(canvas, res, currentVisualMode, isZh);
    }

    // 複製狀態獨立呈現，不改動模型數值。
    syncMetricCopy([outEnob, outSinad, outAccuracy, outTopsWatt, outAdcShare]);
    const exportControl = root.querySelector('#cim-analog-export-csv-btn');
    if (exportControl) {
      exportControl.textContent = isZh ? '📥 匯出 CiM 類比 MAC 精度 CSV' : '📥 Export CiM Analog MAC CSV';
      exportControl.setAttribute('aria-label', isZh ? '匯出神經網路層在不同 eNVM 介質與雜訊條件下的 ENOB 與精度資料集為 CSV 檔案' : 'Export neural network layer ENOB and accuracy dataset under analog CiM impairments as CSV file');
    }
  }

  // Export CSV Action for CiM Analog MAC Simulator
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

  const presetContainer = workloadSelect?.parentNode;
  if (presetContainer && !presetContainer.querySelector('#cim-analog-export-csv-btn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'cim-analog-export-csv-btn';
    exportBtn.type = 'button';
    exportBtn.style.cssText = 'margin-top: 6px; padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.4); background: rgba(15, 23, 42, 0.6); color: #38bdf8; cursor: pointer;';
    const isZhLang = (window.HubLanguage?.get() || document.documentElement.lang || 'en').startsWith('zh');
    exportBtn.textContent = isZhLang ? '📥 匯出 CiM 類比 MAC 精度 CSV' : '📥 Export CiM Analog MAC CSV';
    exportBtn.setAttribute('aria-label', isZhLang ? '匯出神經網路層在不同 eNVM 介質與雜訊條件下的 ENOB 與精度資料集為 CSV 檔案' : 'Export neural network layer ENOB and accuracy dataset under analog CiM impairments as CSV file');
    exportBtn.addEventListener('click', () => {
      const curWorkload = workloadSelect?.value || 'transformer_attn';
      const curDevice = deviceSelect?.value || 'reram_oxram';
      let csv = 'Workload,Device,AdcBits,Temp_C,RetentionHours,SinadDb,RealizedEnob,AccuracyPct,TopsWatt,AdcSharePct\n';
      const testAdcs = [4, 6, 8];
      const testTemps = [25, 85, 125];
      const testRets = [1, 24, 720, 8760];
      for (const b of testAdcs) {
        for (const t of testTemps) {
          for (const r of testRets) {
            const res = calculateCimAnalogMac({
              workloadKey: curWorkload,
              deviceKey: curDevice,
              nominalAdcBits: b,
              temperatureC: t,
              retentionHours: r,
              clockFreqMHz: 100,
            });
            csv += `${curWorkload},${curDevice},${b},${t},${r},${res.sinadDb.toFixed(2)},${res.realizedEnob.toFixed(2)},${res.estimatedAccuracy.toFixed(2)},${res.macroTopsPerWatt.toFixed(2)},${res.adcOverheadFraction.toFixed(2)}\n`;
          }
        }
      }
      downloadCsv(`cim_analog_mac_${curWorkload}_${curDevice}.csv`, csv);
    });
    presetContainer.appendChild(exportBtn);
  }

  // Mode toggles
  if (modeBtnHist && modeBtnCurve) {
    modeBtnHist.addEventListener("click", () => {
      currentVisualMode = "histogram";
      modeBtnHist.classList.add("active");
      modeBtnHist.setAttribute("aria-pressed", "true");
      modeBtnCurve.classList.remove("active");
      modeBtnCurve.setAttribute("aria-pressed", "false");
      update();
    });

    modeBtnCurve.addEventListener("click", () => {
      currentVisualMode = "accuracy_curve";
      modeBtnCurve.classList.add("active");
      modeBtnCurve.setAttribute("aria-pressed", "true");
      modeBtnHist.classList.remove("active");
      modeBtnHist.setAttribute("aria-pressed", "false");
      update();
    });
  }

  // Form controls listeners
  [workloadSelect, deviceSelect, adcSelect, tempSlider, retSlider].forEach((elem) => {
    if (elem) {
      elem.addEventListener("input", update);
      elem.addEventListener("change", update);
    }
  });

  window.addEventListener("languagechange", update);
  window.addEventListener("resize", () => {
    if (canvas) update();
  });

  // Initial calculation
  update();
}

// Auto-init on DOMContentLoaded
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCimAnalogMacSimulator);
  } else {
    initCimAnalogMacSimulator();
  }
}
