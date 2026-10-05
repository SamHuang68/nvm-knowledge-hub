/**
 * cim-nn-accuracy-degradation-simulator.js — Compute-in-Memory (CiM) Analog MAC Accuracy Degradation Simulator
 *
 * First-Principles Mathematical Modeling:
 * 1. Conductance Drift & Structural Relaxation:
 *    G(t) = G_0 \cdot \left(\frac{t}{t_0}\right)^{-\nu(T)}
 *    \nu(T) = \nu_0 \cdot [1 + \beta_T \cdot (T - 300\,\text{K})]
 * 2. Bitline IR-Drop Attenuation & Linearity Distortion:
 *    \alpha_{\text{ir}} \approx 1 - \frac{N_{\text{rows}} \cdot \overline{G} \cdot R_{\text{wire}}}{2}
 *    \sigma_{\text{ir}} \approx \gamma_{\text{ir}} \cdot (1 - \alpha_{\text{ir}})
 * 3. Multi-Bit ADC Quantization & Dynamic Range Clipping Noise:
 *    \Delta_{\text{adc}} = \frac{V_{\text{ref}}}{2^{b_{\text{adc}}} - 1}
 *    \sigma_{\text{quant}}^2 = \frac{\Delta_{\text{adc}}^2}{12}
 * 4. Weight Pair Differential Asymmetry (G+ - G-):
 *    \sigma_{\text{weight\_eff}} = \sqrt{\sigma_{\text{device}}^2 + \sigma_{\text{quant}}^2 + \sigma_{\text{drift}}^2(t) + \sigma_{\text{ir}}^2}
 * 5. Analytical Neural Network Accuracy Degradation (Sakr et al. / IBM CiM Model):
 *    \text{SNR}_{\text{weight}} = 20 \log_{10}\left(\frac{\sigma_W}{\sigma_{\text{noise\_total}}}\right)
 *    \text{Acc}_{\text{Top1}}(t) = \text{Acc}_{\text{baseline}} \cdot \frac{1}{1 + \left(\frac{\sigma_{\text{noise\_total}}(t)}{\sigma_{\text{crit}}}\right)^2}
 *    \Delta \text{Acc} = \text{Acc}_{\text{baseline}} - \text{Acc}_{\text{Top1}}(t)
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: IEEE Transactions on Electron Devices (TED), IEDM CiM Benchmarks, MLPerf Tiny
 */

/**
 * Neural Network workload presets and accuracy sensitivity profiles.
 */
export const CIM_NN_WORKLOAD_PRESETS = Object.freeze({
  resnet50_imagenet: {
    id: "resnet50_imagenet",
    nameZh: "ResNet-50 卷積神經網絡 (ImageNet-1K, 50 層)",
    nameEn: "ResNet-50 CNN (ImageNet-1K, 50 Layers)",
    modelDomain: "Computer Vision / Image Classification",
    baselineTop1Pct: 76.13,
    baselineTop5Pct: 92.86,
    criticalNoiseSigma: 0.078,    // Medium sensitivity to weight noise
    nominalWeightBits: 8,
    arrayDimension: 576,          // 3x3x64 filter footprint
    wireResistanceOhm: 0.35,      // Cu wire per bitcell
    computeDensityTopsPerMm2: 24.5,
  },
  mobilenet_v2: {
    id: "mobilenet_v2",
    nameZh: "MobileNetV2 邊緣視覺網絡 (深度可分離卷積)",
    nameEn: "MobileNetV2 Edge Vision (Depthwise Separable)",
    modelDomain: "Ultra-Low-Power Edge Vision",
    baselineTop1Pct: 72.04,
    baselineTop5Pct: 90.45,
    criticalNoiseSigma: 0.042,    // High sensitivity due to low parameter redundancy
    nominalWeightBits: 6,
    arrayDimension: 144,          // 3x3x16 depthwise block
    wireResistanceOhm: 0.28,
    computeDensityTopsPerMm2: 38.2,
  },
  vit_base_patch16: {
    id: "vit_base_patch16",
    nameZh: "Vision Transformer ViT-Base (自注意力投影權重)",
    nameEn: "Vision Transformer ViT-Base (Multi-Head Self-Attention)",
    modelDomain: "Cloud AI / High-Capacity Transformer",
    baselineTop1Pct: 84.52,
    baselineTop5Pct: 97.20,
    criticalNoiseSigma: 0.062,    // Softmax & attention sensitive
    nominalWeightBits: 8,
    arrayDimension: 768,          // Attention matrix dim
    wireResistanceOhm: 0.42,
    computeDensityTopsPerMm2: 18.0,
  },
  kws_tinyml_bnn: {
    id: "kws_tinyml_bnn",
    nameZh: "TinyML 語音喚醒網絡 KWS (1-bit 二值化 BNN)",
    nameEn: "TinyML Keyword Spotting (1-bit XNOR BNN)",
    modelDomain: "Always-On Voice Wakeup (<1 mW)",
    baselineTop1Pct: 95.20,
    baselineTop5Pct: 99.10,
    criticalNoiseSigma: 0.145,    // High robustness to noise due to binary quantization
    nominalWeightBits: 1,
    arrayDimension: 256,          // Compact fully connected layer
    wireResistanceOhm: 0.20,
    computeDensityTopsPerMm2: 65.0,
  },
});

/**
 * Compute-in-Memory memory cell technology models.
 */
export const CIM_DEVICE_TECHNOLOGIES = Object.freeze({
  reram_oxram_mlc: {
    id: "reram_oxram_mlc",
    nameZh: "氧化物阻變記憶體 (OxRAM / ReRAM 4-bit MLC)",
    nameEn: "Oxide ReRAM (OxRAM 4-bit Multi-Level Cell)",
    nominalCellBits: 4,
    driftExponentBase: 0.075,     // Conductance drift ν ~ 0.075
    thermalCoeffDrift: 0.0018,    // 1/K
    deviceDeviceMismatchPct: 8.5, // Cycle-to-cycle & device variation
    readDisturbRatePer10k: 0.015,
    energyPerMacFj: 12.5,
    requiresPeriodicRefresh: true,
  },
  pcm_analog_synapse: {
    id: "pcm_analog_synapse",
    nameZh: "相變記憶體類比突觸 (PCM Phase Change, 高漂移)",
    nameEn: "Analog PCM Synapse (Phase Change, High Drift)",
    nominalCellBits: 4,
    driftExponentBase: 0.120,     // Strong amorphous phase relaxation ν ~ 0.12
    thermalCoeffDrift: 0.0025,
    deviceDeviceMismatchPct: 6.2,
    readDisturbRatePer10k: 0.008,
    energyPerMacFj: 18.0,
    requiresPeriodicRefresh: true,
  },
  nor_flash_embedded: {
    id: "nor_flash_embedded",
    nameZh: "嵌入式浮閘 eFlash (4-bit MLC, 極低漂移 / 邏輯相容)",
    nameEn: "Embedded NOR Flash (4-bit MLC, Ultra-Low Drift)",
    nominalCellBits: 4,
    driftExponentBase: 0.018,     // Minimal drift ν ~ 0.018 (tunnel oxide leakage)
    thermalCoeffDrift: 0.0008,
    deviceDeviceMismatchPct: 4.5,
    readDisturbRatePer10k: 0.002,
    energyPerMacFj: 28.0,
    requiresPeriodicRefresh: false,
  },
  sram_charge_domain: {
    id: "sram_charge_domain",
    nameZh: "8T SRAM 電荷域存算 (8-bit 等效, 零電導漂移 / 揮發性)",
    nameEn: "8T SRAM Charge-Domain CiM (Zero Drift / Volatile)",
    nominalCellBits: 1,           // Weighted capacitor binary slice
    driftExponentBase: 0.000,     // Mathematically zero drift
    thermalCoeffDrift: 0.0000,
    deviceDeviceMismatchPct: 2.1, // Capacitor ratio mismatch
    readDisturbRatePer10k: 0.000,
    energyPerMacFj: 8.5,
    requiresPeriodicRefresh: false,
  },
});

/**
 * Calculates CiM neural network accuracy degradation, effective SNR, and recommended recalibration schedule.
 *
 * @param {Object} options
 * @param {string} [options.workloadKey="resnet50_imagenet"]
 * @param {string} [options.deviceKey="reram_oxram_mlc"]
 * @param {number} [options.adcResolutionBits=6] - 4, 6, 7, 8 bits
 * @param {number} [options.retentionHours=720] - 1 hr to 87600 hrs (10 yrs)
 * @param {number} [options.temperatureC=85] - -40°C to 150°C
 * @returns {Object} Comprehensive degradation calculation metrics
 */
export function calculateCimNnDegradation({
  workloadKey = "resnet50_imagenet",
  deviceKey = "reram_oxram_mlc",
  adcResolutionBits = 6,
  retentionHours = 720,
  temperatureC = 85,
} = {}) {
  const workload = CIM_NN_WORKLOAD_PRESETS[workloadKey] || CIM_NN_WORKLOAD_PRESETS.resnet50_imagenet;
  const device = CIM_DEVICE_TECHNOLOGIES[deviceKey] || CIM_DEVICE_TECHNOLOGIES.reram_oxram_mlc;

  const bAdc = Math.max(3, Math.min(10, Number(adcResolutionBits) || 6));
  const tHours = Math.max(0.1, Math.min(87600, Number(retentionHours) || 720));
  const tempK = (Number(temperatureC) || 85) + 273.15;

  // 1. Conductance Drift Noise \sigma_drift:
  // t_0 = 1 sec = 1/3600 hour. Ratio = (tHours * 3600).
  const tRatio = Math.max(1.0, tHours * 3600.0);
  const tempDeltaK = Math.max(-50.0, tempK - 300.15);
  const effectiveNu = device.driftExponentBase * (1.0 + device.thermalCoeffDrift * tempDeltaK);
  // Drift standard deviation across weights: \sigma_drift \propto |1 - (t/t_0)^{-\nu}|
  const meanConductanceShift = Math.abs(1.0 - Math.pow(tRatio, -effectiveNu));
  const sigmaDrift = meanConductanceShift * 0.45; // Empirical dispersion of drift exponent across array

  // 2. Hardware Mismatch Noise \sigma_mismatch:
  const sigmaMismatch = (device.deviceDeviceMismatchPct / 100.0) * 0.5;

  // 3. Bitline IR-Drop Noise \sigma_ir:
  // Array dimension N, wire resistance R_wire, average conductance ~20 uS
  const gMeanSiemens = 20e-6;
  const totalWireResistance = (workload.arrayDimension / 2.0) * workload.wireResistanceOhm;
  const irDropVoltageFactor = Math.min(0.25, (workload.arrayDimension * gMeanSiemens * totalWireResistance) * 0.15);
  const sigmaIr = irDropVoltageFactor * 0.35;

  // 4. ADC Quantization & Distortion Noise \sigma_quant:
  // For b_adc bits, ideal quantization noise relative to full scale:
  // \sigma_{quant} \approx 1 / (\sqrt{12} \cdot 2^{b_{adc}})
  const sigmaQuant = 1.0 / (Math.sqrt(12.0) * Math.pow(2.0, bAdc));

  // 5. Total Compound Noise Standard Deviation \sigma_total:
  const totalNoiseVariance = Math.pow(sigmaDrift, 2) + Math.pow(sigmaMismatch, 2) + Math.pow(sigmaIr, 2) + Math.pow(sigmaQuant, 2);
  const sigmaTotal = Math.sqrt(totalNoiseVariance);

  // 6. Effective Weight SNR (dB) and Realized MAC Precision (ENOB):
  // Signal amplitude \sigma_W \approx 0.35 (normalized weight std dev)
  const sigmaW = 0.35;
  const weightSnrDb = Math.max(2.0, Math.min(50.0, 20.0 * Math.log10(sigmaW / Math.max(1e-4, sigmaTotal))));
  // ENOB = (SNR - 1.76) / 6.02
  const realizedMacBits = Math.max(1.5, Math.min(workload.nominalWeightBits, Number(((weightSnrDb - 1.76) / 6.02).toFixed(2))));

  // 7. Analytical Neural Network Top-1 Accuracy:
  // Acc(t) = Acc_baseline / [1 + (\sigma_total / \sigma_crit)^2]
  const noiseRatio = sigmaTotal / workload.criticalNoiseSigma;
  const degradationFactor = 1.0 / (1.0 + Math.pow(noiseRatio, 2.0));
  const realizedTop1Pct = Number((workload.baselineTop1Pct * degradationFactor).toFixed(2));
  const top1DropPct = Number((workload.baselineTop1Pct - realizedTop1Pct).toFixed(2));

  // Top-5 Accuracy degradation (typically more resilient than Top-1):
  const top5DegradationFactor = 1.0 / (1.0 + Math.pow(noiseRatio * 0.65, 2.0));
  const realizedTop5Pct = Number((workload.baselineTop5Pct * top5DegradationFactor).toFixed(2));

  // 8. Recommended Recalibration / Refresh Schedule:
  // Find time t_crit where Top-1 drop exceeds 1.5%
  let recommendedRefreshHours = 87600; // default 10 years
  if (device.requiresPeriodicRefresh && effectiveNu > 0.001) {
    // Solve for noiseRatio = sqrt(1.5 / (Acc_baseline - 1.5))
    const targetNoise = workload.criticalNoiseSigma * Math.sqrt(1.5 / Math.max(0.1, workload.baselineTop1Pct - 1.5));
    const allowedDriftVar = Math.max(1e-6, Math.pow(targetNoise, 2) - Math.pow(sigmaMismatch, 2) - Math.pow(sigmaIr, 2) - Math.pow(sigmaQuant, 2));
    const allowedDriftSigma = Math.sqrt(allowedDriftVar);
    const allowedShift = allowedDriftSigma / 0.45;
    if (allowedShift < 1.0) {
      const allowedRatio = Math.pow(Math.max(0.01, 1.0 - allowedShift), -1.0 / effectiveNu);
      recommendedRefreshHours = Math.max(1, Math.min(87600, Math.round(allowedRatio / 3600.0)));
    } else {
      recommendedRefreshHours = 24; // severe drift
    }
  }

  // 9. Energy Efficiency TOPS/W Calculation:
  // Base energy per MAC includes cell, ADC conversion, and wire dissipation
  const adcEnergyFactor = Math.pow(2.0, Math.max(0, bAdc - 4)) * 0.8;
  const totalEnergyPerMacFj = device.energyPerMacFj + adcEnergyFactor + (workload.arrayDimension * 0.02);
  const energyEfficiencyTopsPerWatt = Number((1e15 / (totalEnergyPerMacFj * 1e-15 * 1e12)).toFixed(1)); // 1 TOPS/W = 1 pJ/OP = 1000 fJ/OP -> TOPS/W = 1000 / fJ

  return {
    workloadKey: workload.id,
    workloadNameZh: workload.nameZh,
    workloadNameEn: workload.nameEn,
    deviceKey: device.id,
    deviceNameZh: device.nameZh,
    deviceNameEn: device.nameEn,
    bAdc,
    tHours,
    tempC: Number(temperatureC) || 85,
    weightSnrDb: Number(weightSnrDb.toFixed(1)),
    realizedMacBits,
    realizedTop1Pct,
    top1DropPct,
    realizedTop5Pct,
    baselineTop1Pct: workload.baselineTop1Pct,
    recommendedRefreshHours,
    energyEfficiencyTopsPerWatt,
    sigmaDrift: Number(sigmaDrift.toFixed(4)),
    sigmaQuant: Number(sigmaQuant.toFixed(4)),
    sigmaTotal: Number(sigmaTotal.toFixed(4)),
    isAccuracyAcceptable: top1DropPct <= 2.0,
  };
}

/**
 * Renders high-DPI dual-mode Canvas visualization for CiM accuracy degradation.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics - Output from calculateCimNnDegradation
 * @param {string} [mode="curve"] - "curve" (Accuracy vs Time) or "distribution" (Weight Error Histogram)
 */
export function drawCimDegradationCanvas(canvas, metrics, mode = "curve") {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const width = (canvas.width = (rect.width || 420) * (window.devicePixelRatio || 1));
  const height = (canvas.height = 180 * (window.devicePixelRatio || 1));
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

  const w = width / (window.devicePixelRatio || 1);
  const h = height / (window.devicePixelRatio || 1);

  // Background
  ctx.fillStyle = "#040914";
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 40; x < w - 20; x += 50) {
    ctx.moveTo(x, 20);
    ctx.lineTo(x, h - 30);
  }
  for (let y = 30; y < h - 25; y += 30) {
    ctx.moveTo(40, y);
    ctx.lineTo(w - 20, y);
  }
  ctx.stroke();

  if (mode === "curve") {
    // Mode 1: Accuracy vs. Retention Time (Log scale 1 hr to 100,000 hrs)
    const logMin = 0; // 10^0 = 1 hr
    const logMax = 5; // 10^5 = 100,000 hrs
    const plotX0 = 45;
    const plotX1 = w - 25;
    const plotY0 = h - 35;
    const plotYTop = 25;

    // Draw baseline threshold line (95% of baseline)
    const baseAcc = metrics.baselineTop1Pct;
    const thresholdAcc = baseAcc - 2.0; // 2% drop limit
    const yBaseline = plotY0 - (baseAcc / 100.0) * (plotY0 - plotYTop);
    const yThreshold = plotY0 - (thresholdAcc / 100.0) * (plotY0 - plotYTop);

    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(plotX0, yBaseline);
    ctx.lineTo(plotX1, yBaseline);
    ctx.stroke();

    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    ctx.beginPath();
    ctx.moveTo(plotX0, yThreshold);
    ctx.lineTo(plotX1, yThreshold);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve: compute points across log time
    ctx.beginPath();
    ctx.strokeStyle = metrics.isAccuracyAcceptable ? "#10b981" : "#f59e0b";
    ctx.lineWidth = 2.5;

    const points = 60;
    for (let i = 0; i <= points; i++) {
      const logT = logMin + (i / points) * (logMax - logMin);
      const hours = Math.pow(10, logT);
      const pt = calculateCimNnDegradation({
        workloadKey: metrics.workloadKey,
        deviceKey: metrics.deviceKey,
        adcResolutionBits: metrics.bAdc,
        retentionHours: hours,
        temperatureC: metrics.tempC,
      });
      const px = plotX0 + (i / points) * (plotX1 - plotX0);
      const py = plotY0 - (pt.realizedTop1Pct / 100.0) * (plotY0 - plotYTop);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Mark current operating point
    const currLogT = Math.log10(Math.max(1, metrics.tHours));
    const currX = plotX0 + Math.min(1.0, Math.max(0.0, currLogT / logMax)) * (plotX1 - plotX0);
    const currY = plotY0 - (metrics.realizedTop1Pct / 100.0) * (plotY0 - plotYTop);

    ctx.fillStyle = metrics.isAccuracyAcceptable ? "#10b981" : "#ef4444";
    ctx.beginPath();
    ctx.arc(currX, currY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // X and Y axis labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px 'IBM Plex Mono', monospace";
    ctx.fillText("1h", plotX0 - 6, h - 20);
    ctx.fillText("24h", plotX0 + 0.28 * (plotX1 - plotX0) - 8, h - 20);
    ctx.fillText("1mo", plotX0 + 0.57 * (plotX1 - plotX0) - 8, h - 20);
    ctx.fillText("1yr", plotX0 + 0.79 * (plotX1 - plotX0) - 8, h - 20);
    ctx.fillText("10yr", plotX1 - 18, h - 20);

    ctx.fillText(`${baseAcc}%`, 8, Math.max(15, yBaseline + 3));
    ctx.fillText(`${(baseAcc * 0.8).toFixed(0)}%`, 14, plotY0);

    // Callout text
    ctx.fillStyle = "#38bdf8";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText(`Top-1: ${metrics.realizedTop1Pct}% (Δ -${metrics.top1DropPct}%)`, currX + 8, Math.max(30, currY - 6));
  } else {
    // Mode 2: Weight Error Distribution & ADC Quantization Binning
    const plotX0 = 45;
    const plotX1 = w - 25;
    const plotMidY = (h - 20) / 2;
    const numBins = 32;
    const binWidth = (plotX1 - plotX0) / numBins;

    ctx.fillStyle = "rgba(2, 132, 199, 0.4)";
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.2;

    const sigma = Math.max(0.01, metrics.sigmaTotal);
    for (let i = 0; i < numBins; i++) {
      const xVal = -3.0 + (i / (numBins - 1)) * 6.0; // -3 sigma to +3 sigma
      const prob = (1.0 / (Math.sqrt(2 * Math.PI) * sigma)) * Math.exp(-0.5 * Math.pow(xVal * 0.1 / sigma, 2));
      const barH = Math.min(55, prob * 35);
      const bx = plotX0 + i * binWidth;
      ctx.fillRect(bx, plotMidY - barH, binWidth - 2, barH * 2);
      ctx.strokeRect(bx, plotMidY - barH, binWidth - 2, barH * 2);
    }

    // Zero-error center line
    const centerX = plotX0 + 0.5 * (plotX1 - plotX0);
    ctx.strokeStyle = "#10b981";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX, h - 25);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px 'IBM Plex Mono', monospace";
    ctx.fillText("-3σ Error", plotX0, h - 10);
    ctx.fillText("0 (Target)", centerX - 24, h - 10);
    ctx.fillText("+3σ Error", plotX1 - 45, h - 10);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText(`Quant Noise: ${metrics.sigmaQuant} | Drift: ${metrics.sigmaDrift}`, plotX0, 20);
  }
}

/**
 * Initializes the CiM NN Accuracy Degradation simulator UI.
 *
 * @param {HTMLElement} [container]
 */
export function initCimNnDegradationSimulator(container) {
  const root = container || document.getElementById("cim-nn-degradation-simulator-root");
  if (!root) return;

  const workloadSelect = root.querySelector("#cim-nn-workload-select");
  const deviceSelect = root.querySelector("#cim-nn-device-select");
  const adcSelect = root.querySelector("#cim-nn-adc-select");
  const retSlider = root.querySelector("#cim-nn-ret-slider");
  const retVal = root.querySelector("#cim-nn-ret-val");
  const tempSlider = root.querySelector("#cim-nn-temp-slider");
  const tempVal = root.querySelector("#cim-nn-temp-val");

  const outSnr = root.querySelector("#cim-nn-out-snr");
  const outMacBits = root.querySelector("#cim-nn-out-macbits");
  const outTop1 = root.querySelector("#cim-nn-out-top1");
  const outDrop = root.querySelector("#cim-nn-out-drop");
  const outRefresh = root.querySelector("#cim-nn-out-refresh");
  const outVerdict = root.querySelector("#cim-nn-out-verdict");

  const canvas = root.querySelector("#cim-nn-canvas");
  const btnCurve = root.querySelector("#cim-nn-mode-curve");
  const btnDist = root.querySelector("#cim-nn-mode-dist");

  let currentMode = "curve";

  // Populate Select Options if empty
  if (workloadSelect && workloadSelect.options.length === 0) {
    Object.values(CIM_NN_WORKLOAD_PRESETS).forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = `${item.nameEn}`;
      workloadSelect.appendChild(opt);
    });
    workloadSelect.value = "resnet50_imagenet";
  }

  if (deviceSelect && deviceSelect.options.length === 0) {
    Object.values(CIM_DEVICE_TECHNOLOGIES).forEach((item) => {
      const opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = `${item.nameEn}`;
      deviceSelect.appendChild(opt);
    });
    deviceSelect.value = "reram_oxram_mlc";
  }

  function update() {
    const workloadKey = workloadSelect ? workloadSelect.value : "resnet50_imagenet";
    const deviceKey = deviceSelect ? deviceSelect.value : "reram_oxram_mlc";
    const adcBits = adcSelect ? Number(adcSelect.value) : 6;
    const hours = retSlider ? Number(retSlider.value) : 720;
    const temp = tempSlider ? Number(tempSlider.value) : 85;

    if (retVal) {
      if (hours < 24) retVal.textContent = `${hours} hrs`;
      else if (hours < 8760) retVal.textContent = `${(hours / 24).toFixed(0)} days (${hours} h)`;
      else retVal.textContent = `${(hours / 8760).toFixed(1)} yrs (${hours} h)`;
    }
    if (tempVal) tempVal.textContent = `${temp} °C`;

    const m = calculateCimNnDegradation({
      workloadKey,
      deviceKey,
      adcResolutionBits: adcBits,
      retentionHours: hours,
      temperatureC: temp,
    });

    if (outSnr) outSnr.textContent = `${m.weightSnrDb} dB`;
    if (outMacBits) outMacBits.textContent = `${m.realizedMacBits} Bits`;
    if (outTop1) {
      outTop1.textContent = `${m.realizedTop1Pct}%`;
      outTop1.style.color = m.isAccuracyAcceptable ? "#059669" : "#dc2626";
    }
    if (outDrop) {
      outDrop.textContent = `-${m.top1DropPct}%`;
      outDrop.style.color = m.isAccuracyAcceptable ? "#059669" : "#dc2626";
    }
    if (outRefresh) {
      if (m.recommendedRefreshHours >= 87600) {
        outRefresh.textContent = "> 10 Years";
      } else if (m.recommendedRefreshHours > 24) {
        outRefresh.textContent = `Every ${(m.recommendedRefreshHours / 24).toFixed(0)} Days`;
      } else {
        outRefresh.textContent = `Every ${m.recommendedRefreshHours} Hrs`;
      }
    }

    if (canvas) {
      drawCimDegradationCanvas(canvas, m, currentMode);
    }

    if (outVerdict) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outVerdict.innerHTML = isZh
        ? `<strong>存算一體推論判定：</strong> 在 <code>${m.deviceKey}</code> 於 <code>${m.tempC}°C</code> 運行 <code>${m.tHours} 小時</code> 下，累積電導漂移 (ν=${m.sigmaDrift}) 與 ${m.bAdc}-bit ADC 量化雜訊造成有效信噪比為 <strong>${m.weightSnrDb} dB</strong>。神經網路 <code>${m.workloadNameZh}</code> Top-1 準確率自基準 <strong>${m.baselineTop1Pct}%</strong> 衰退至 <strong>${m.realizedTop1Pct}%</strong> (相對降幅 -${m.top1DropPct}%)。建議設定每隔 <strong>${outRefresh ? outRefresh.textContent : ''}</strong> 執行一次片上權重再校準 (On-Chip Recalibration) 以維持分類可靠度。`
        : `<strong>CiM Inference Verdict:</strong> Under <code>${m.deviceKey}</code> operating at <code>${m.tempC}°C</code> for <code>${m.tHours} hrs</code>, conductance drift (ν=${m.sigmaDrift}) combined with ${m.bAdc}-bit ADC quantization yields an effective weight SNR of <strong>${m.weightSnrDb} dB</strong>. Top-1 accuracy for <code>${m.workloadNameEn}</code> degrades from baseline <strong>${m.baselineTop1Pct}%</strong> to <strong>${m.realizedTop1Pct}%</strong> (Δ -${m.top1DropPct}%). On-chip recalibration is recommended <strong>${outRefresh ? outRefresh.textContent : ''}</strong> to preserve target inference confidence.`;
    }
  }

  if (workloadSelect) workloadSelect.addEventListener("change", update);
  if (deviceSelect) deviceSelect.addEventListener("change", update);
  if (adcSelect) adcSelect.addEventListener("change", update);
  if (retSlider) retSlider.addEventListener("input", update);
  if (tempSlider) tempSlider.addEventListener("input", update);

  if (btnCurve) {
    btnCurve.addEventListener("click", () => {
      currentMode = "curve";
      btnCurve.classList.add("active");
      btnCurve.setAttribute("aria-pressed", "true");
      btnCurve.style.background = "#0284c7";
      btnCurve.style.color = "#ffffff";
      btnCurve.style.borderColor = "#38bdf8";
      if (btnDist) {
        btnDist.classList.remove("active");
        btnDist.setAttribute("aria-pressed", "false");
        btnDist.style.background = "#1e293b";
        btnDist.style.color = "#94a3b8";
        btnDist.style.borderColor = "#475569";
      }
      update();
    });
  }

  if (btnDist) {
    btnDist.addEventListener("click", () => {
      currentMode = "distribution";
      btnDist.classList.add("active");
      btnDist.setAttribute("aria-pressed", "true");
      btnDist.style.background = "#0284c7";
      btnDist.style.color = "#ffffff";
      btnDist.style.borderColor = "#38bdf8";
      if (btnCurve) {
        btnCurve.classList.remove("active");
        btnCurve.setAttribute("aria-pressed", "false");
        btnCurve.style.background = "#1e293b";
        btnCurve.style.color = "#94a3b8";
        btnCurve.style.borderColor = "#475569";
      }
      update();
    });
  }

  window.addEventListener("resize", () => {
    if (canvas) update();
  });

  update();
}

// Auto-initialize on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initCimNnDegradationSimulator());
  } else {
    initCimNnDegradationSimulator();
  }
}
