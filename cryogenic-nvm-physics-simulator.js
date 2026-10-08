/**
 * cryogenic-nvm-physics-simulator.js — Cryogenic (4K / 77K) Quantum Computing NVM Physics & Read Margin Simulator
 *
 * First-Principles Mathematical Modeling:
 * 1. Carrier Freeze-Out in Bulk Silicon:
 *    f_{\text{ion}}(T) = \frac{1}{1 + 2 \cdot \exp\left(\frac{\Delta E_d}{k_B T}\right)}
 * 2. STT-MRAM Spin-Wave Excitation & TMR Temperature Scaling (Bloch T^{3/2} Law):
 *    \text{TMR}(T) = \frac{\text{TMR}_0}{1 + \alpha_{\text{sw}} \cdot T^{1.5}}
 *    I_c(T) = I_{c0} \cdot \left[1 - \left(\frac{T}{T_C}\right)^{1.5}\right]
 *    \Delta(T) = \frac{E_b}{k_B T} \quad (\text{Thermal Stability Factor})
 * 3. AntiFuse Metallic Filament Conduction & Breakdown Voltage Cryogenic Shift:
 *    V_{\text{bd}}(T) = V_{\text{bd0}} \cdot \left[1 + \beta_{\text{ph}} \cdot (300 - T)\right]
 *    \sigma_{\text{fil}}(T) = \frac{\sigma_0}{1 + \alpha_{\text{res}} \cdot T} \quad (\text{Degenerate metallic ohmic filament})
 * 4. Thermal Johnson-Nyquist Noise Power Drop:
 *    \overline{v_n^2} = 4 k_B T R \Delta f \implies \Delta P_{\text{noise}}(T) = 10 \log_{10}\left(\frac{T}{300}\right)\text{ dB}
 * 5. Sense Amplifier Dynamic Current Margin:
 *    \Delta I_{\text{read}}(T) = I_{\text{ON}}(T) - I_{\text{OFF}}(T)
 *    \text{SNR}_{\text{margin}}(T) = 20 \log_{10}\left(\frac{\Delta I_{\text{read}}(T)}{i_{n,\text{thermal}}(T)}\right)
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: IEEE Quantum Week, IEEE Transactions on Electron Devices (TED) Cryo-CMOS Benchmarks
 */

/**
 * Operating temperature environment presets.
 */
export const CRYO_ENV_PRESETS = Object.freeze({
  cryo_4k: {
    id: "cryo_4k",
    nameZh: "4.2 K 液氦浸潤環境 (量子位元基帶控制級)",
    nameEn: "4.2 K Liquid Helium (Quantum Qubit Control Stage)",
    tempKelvin: 4.2,
    thermalNoiseFactor: 4.2 / 300.0, // ~-18.5 dB thermal noise reduction
    carrierFreezeoutSevere: true,
    coolingCategory: "Dilution Stage 4K",
  },
  cryo_77k: {
    id: "cryo_77k",
    nameZh: "77 K 液氮冷卻環境 (高溫超導 / 深空探索)",
    nameEn: "77 K Liquid Nitrogen (High-Tc / Deep-Space)",
    tempKelvin: 77.0,
    thermalNoiseFactor: 77.0 / 300.0, // ~-5.9 dB thermal noise reduction
    carrierFreezeoutSevere: false,
    coolingCategory: "LN2 77K",
  },
  cryo_200k: {
    id: "cryo_200k",
    nameZh: "200 K 極地低溫極限 (-73°C 車規/航太下限)",
    nameEn: "200 K Deep Cold (-73°C Automotive/Aerospace)",
    tempKelvin: 200.0,
    thermalNoiseFactor: 200.0 / 300.0,
    carrierFreezeoutSevere: false,
    coolingCategory: "Chamber Cold 200K",
  },
  ambient_300k: {
    id: "ambient_300k",
    nameZh: "300 K 常溫基準對照 (+27°C 室溫)",
    nameEn: "300 K Room Temperature (+27°C Baseline)",
    tempKelvin: 300.0,
    thermalNoiseFactor: 1.0,
    carrierFreezeoutSevere: false,
    coolingCategory: "Room Temp 300K",
  },
});

/**
 * NVM cell technologies under cryogenic physics.
 */
export const CRYO_TECH_PROFILES = Object.freeze({
  antifuse_cryo: {
    id: "antifuse_cryo",
    nameZh: "AntiFuse 局域再結晶金屬化微絲 (Ohmic Filament)",
    nameEn: "AntiFuse Degenerate Ohmic Filament",
    baseVbdV: 5.5,
    tempVbdCoeff: 0.00018,       // Vbd rises ~5% due to longer mean free path
    filamentOhmicMetallic: true, // Degenerate Si metallic filament, immune to freeze-out
    nominalIonUa: 45.0,          // 45 uA programmed current
    nominalIoffNa: 0.05,         // Pure direct tunneling
    freezeoutSensitivity: "Teaching model: no freeze-out term (Metallic Ohmic Core)",
    cryoStabilityRating: "Uncalibrated teaching class: metallic read path",
  },
  mram_stt_cryo: {
    id: "mram_stt_cryo",
    nameZh: "STT-MRAM 垂直磁穿隧接面 (pMTJ Spintronics)",
    nameEn: "STT-MRAM Perpendicular MTJ (pMTJ)",
    baseVbdV: 1.2,
    baseTmrPercent: 150.0,       // 150% TMR @ 300K
    spinWaveAlpha: 0.000085,     // TMR expansion at 4K (>220%)
    curieTempK: 750.0,
    baseIcUa: 35.0,              // Critical switching current
    nominalIonUa: 25.0,
    nominalIoffNa: 10000.0,      // 10 uA (RP state)
    freezeoutSensitivity: "Teaching model: no freeze-out term (Metallic / Ferromagnetic Leads)",
    cryoStabilityRating: "Uncalibrated teaching class: temperature-scaled TMR",
  },
  eflash_cryo: {
    id: "eflash_cryo",
    nameZh: "傳統浮閘 eFlash (Bulk Silicon Carrier Freeze-Out)",
    nameEn: "Floating-Gate eFlash (Bulk Si Freeze-Out)",
    baseVbdV: 14.5,
    tempVbdCoeff: 0.0006,
    filamentOhmicMetallic: false,
    nominalIonUa: 18.0,
    nominalIoffNa: 0.001,
    freezeoutSensitivity: "Severe (Bulk Access Transistors High-R)",
    cryoStabilityRating: "Uncalibrated teaching class: peripheral freeze-out sensitivity",
  },
  reram_cryo: {
    id: "reram_cryo",
    nameZh: "OxRAM / 阻變記憶體 (Oxygen Vacancy Hopping)",
    nameEn: "OxRAM / ReRAM (Vacancy Hopping Freeze-Out)",
    baseVbdV: 2.8,
    tempVbdCoeff: 0.00035,
    filamentOhmicMetallic: false,
    nominalIonUa: 30.0,
    nominalIoffNa: 50.0,
    freezeoutSensitivity: "Moderate (Ion Hopping Energy Barrier Freezes)",
    cryoStabilityRating: "Uncalibrated teaching class: assumed hopping sensitivity",
  },
});

/**
 * Calculates first-principles cryogenic semiconductor and spintronic physics metrics.
 *
 * @param {Object} options
 * @param {string} options.envKey - Key in CRYO_ENV_PRESETS
 * @param {string} options.techKey - Key in CRYO_TECH_PROFILES
 * @param {number} options.senseTimeNs - Sense integration time in nanoseconds (1..50 ns)
 * @param {number} options.readBiasMv - Applied read voltage in mV (50..800 mV)
 * @returns {Object} Quantitative calculation metrics
 */
export function calculateCryogenicPhysics({
  envKey = "cryo_4k",
  techKey = "antifuse_cryo",
  senseTimeNs = 10,
  readBiasMv = 200,
} = {}) {
  const env = CRYO_ENV_PRESETS[envKey] || CRYO_ENV_PRESETS.cryo_4k;
  const tech = CRYO_TECH_PROFILES[techKey] || CRYO_TECH_PROFILES.antifuse_cryo;

  const T = Math.max(1.0, Math.min(350.0, Number(env.tempKelvin) || 4.2));
  const t_sense = Math.max(0.5, Math.min(100.0, Number(senseTimeNs) || 10.0)) * 1e-9;
  const v_read = Math.max(0.02, Math.min(1.2, (Number(readBiasMv) || 200) * 1e-3));

  const kB = 1.380649e-23; // J/K
  const q = 1.602176634e-19; // C

  // 1. Bulk Silicon Dopant Ionization Fraction (Carrier Freeze-out):
  // Donor ionization energy Delta E_d ~ 45 meV (Phosphorus in Si)
  const deltaEdJoules = 0.045 * q;
  const expIonArg = Math.min(80.0, deltaEdJoules / (kB * T));
  const ionizationFractionPercent = 100.0 / (1.0 + 2.0 * Math.exp(expIonArg));

  // 2. STT-MRAM Spintronic Scaling:
  // TMR(T) = TMR_0 / (1 + alpha * T^1.5)
  let tmrActualPercent = 0.0;
  let criticalCurrentActualUa = 0.0;
  let thermalStabilityDelta = 0.0;

  if (tech.id === "mram_stt_cryo") {
    const tmr0 = tech.baseTmrPercent * (1.0 + tech.spinWaveAlpha * Math.pow(300.0, 1.5));
    tmrActualPercent = tmr0 / (1.0 + tech.spinWaveAlpha * Math.pow(T, 1.5));

    // Bloch T^1.5 law for critical switching current:
    const curieFactor = Math.max(0.0, 1.0 - Math.pow(T / tech.curieTempK, 1.5));
    criticalCurrentActualUa = (tech.baseIcUa * 1.38) * curieFactor;

    // Thermal stability factor Delta = E_b / (kB * T)
    const EbJoules = 60.0 * (kB * 300.0); // 60 kBT at 300K
    thermalStabilityDelta = EbJoules / (kB * T);
  }

  // 3. AntiFuse & Dielectric Breakdown Shift:
  // Phonon scattering reduction increases electron mean free path
  // 缺少既有擊穿係數時明示模型未定義，不補造係數或將缺值當成零。
  const hasVbdModel = Number.isFinite(tech.baseVbdV) && Number.isFinite(tech.tempVbdCoeff);
  const vbdActualV = hasVbdModel
    ? tech.baseVbdV * (1.0 + tech.tempVbdCoeff * (300.0 - T))
    : null;

  // 4. Current Margins and Sense Signals:
  let iOnUa = tech.nominalIonUa;
  let iOffNa = tech.nominalIoffNa;

  if (tech.id === "antifuse_cryo") {
    // Metallic filament: resistance decreases slightly with cold (conductivity up ~20%)
    const metalScale = 1.0 + 0.0008 * (300.0 - T);
    iOnUa = tech.nominalIonUa * metalScale * (v_read / 0.2);
    // Unprogrammed cell: direct tunneling remains flat, thermionic emission freezes to 0
    iOffNa = tech.nominalIoffNa * 0.1;
  } else if (tech.id === "mram_stt_cryo") {
    // Current margin derived from TMR
    const rP_kOhm = 10.0; // 10 kOhm
    const rAP_kOhm = rP_kOhm * (1.0 + tmrActualPercent / 100.0);
    iOnUa = (v_read / (rP_kOhm * 1e3)) * 1e6;
    iOffNa = (v_read / (rAP_kOhm * 1e3)) * 1e9;
  } else if (tech.id === "eflash_cryo") {
    // Access transistors freeze out, series resistance increases
    const freezeScale = Math.max(0.08, ionizationFractionPercent / 100.0);
    iOnUa = tech.nominalIonUa * Math.pow(freezeScale, 0.45);
    iOffNa = 1e-6; // Absolute zero subthreshold leakage
  }

  const deltaIreadUa = Math.max(0.01, iOnUa - (iOffNa * 1e-3));

  // 5. Thermal Johnson-Nyquist Noise Power:
  // P_noise(T) / P_noise(300) = T / 300
  const noisePowerDropDb = 10.0 * Math.log10(Math.max(1e-4, T / 300.0));

  // Equivalent integrated noise charge over sense window:
  const rEquiv = v_read / (Math.max(1e-6, iOnUa * 1e-6));
  const bw = 1.0 / (2.0 * t_sense);
  const rmsThermalNoiseVoltage = Math.sqrt(4.0 * kB * T * rEquiv * bw);
  const rmsThermalNoiseCurrentUa = (rmsThermalNoiseVoltage / rEquiv) * 1e6;

  // Signal-to-Noise Ratio (SNR) of sense integration:
  const snrDb = 20.0 * Math.log10(Math.max(1.0, deltaIreadUa / Math.max(1e-6, rmsThermalNoiseCurrentUa)));

  return {
    envKey: env.id,
    envNameZh: env.nameZh,
    envNameEn: env.nameEn,
    tempKelvin: T,
    techKey: tech.id,
    techNameZh: tech.nameZh,
    techNameEn: tech.nameEn,
    vbdActualV: hasVbdModel ? Number(vbdActualV.toFixed(2)) : null,
    vbdModelStatus: hasVbdModel ? "defined" : "not_defined",
    deltaIreadUa: Number(deltaIreadUa.toFixed(1)),
    noisePowerDropDb: Number(noisePowerDropDb.toFixed(1)),
    ionizationFractionPercent: Number(ionizationFractionPercent.toFixed(2)),
    tmrActualPercent: Number(tmrActualPercent.toFixed(1)),
    thermalStabilityDelta: Math.round(thermalStabilityDelta),
    snrDb: Number(snrDb.toFixed(1)),
    freezeoutSensitivity: tech.freezeoutSensitivity,
    cryoStabilityRating: tech.cryoStabilityRating,
    isCryoViable: tech.id === "antifuse_cryo" || tech.id === "mram_stt_cryo",
  };
}

/**
 * Draws the high-DPI Canvas visualization for the Cryogenic NVM Physics workbench.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} results - Result object from calculateCryogenicPhysics
 * @param {string} mode - 'current_window' or 'temp_spectrum'
 * @param {boolean} isZh - Language flag
 */
export function drawCryoCanvas(canvas, results, mode = "current_window", isZh = true) {
  if (!canvas || !results) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || 420));
  const wrapText = (text, maxWidth, font) => {
    ctx.font = font;
    const lines = [];
    let line = "";
    for (const character of Array.from(text)) {
      if (line && ctx.measureText(line + character).width > maxWidth) { lines.push(line); line = ""; }
      line += character;
    }
    if (line) lines.push(line);
    return lines;
  };
  const titleFont = "700 10.5px 'IBM Plex Mono', monospace";
  const labelFont = "600 9px 'IBM Plex Mono', monospace";
  const title = mode === "current_window"
    ? (isZh ? `低溫感測裕度窗 (${results.tempKelvin} K · SNR: ${results.snrDb} dB)` : `Cryo Sense Window (${results.tempKelvin} K · SNR: ${results.snrDb} dB)`)
    : (isZh ? `熱噪聲功率衰減譜 (${results.noisePowerDropDb} dB @ ${results.tempKelvin} K)` : `Thermal Noise Floor vs Temp (${results.noisePowerDropDb} dB @ ${results.tempKelvin} K)`);
  const titleLines = wrapText(title, width - 24, titleFont);
  const footerLabels = mode === "current_window"
    ? [isZh ? "未編程 / 高阻態 '0'" : "State '0' (High-R)", isZh ? "導通 / 低阻態 '1'" : "State '1' (Low-R)"]
    : ["4.2K (LHe)", "77K (LN2)", "300K (Room)"];
  const footerStacked = width < 420;
  const footerColumnWidth = footerStacked ? width - 18 : Math.max(20,(width - 68) / footerLabels.length - 6);
  const footerLines = footerLabels.map(text => wrapText(text, footerColumnWidth - 6, labelFont));
  const padLeft = 44;
  const padRight = 24;
  const padTop = Math.max(26, 12 + titleLines.length * 13);
  const footerHeight = footerStacked ? footerLines.reduce((sum,lines) => sum + lines.length * 12 + 4,0) : Math.max(...footerLines.map(lines => lines.length)) * 12;
  const padBottom = Math.max(26,12 + footerHeight);
  // 保留原圖面高度，額外字列由畫布與既有容器共同承接，避免縮小字形。
  const plotH = 128;
  const height = padTop + plotH + padBottom;
  canvas.parentElement.style.height = `${height}px`;

  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, "#08131e");
  bgGrad.addColorStop(1, "#03080e");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const plotW = width - padLeft - padRight;
  const drawFooter = (lines,column) => {
    const ratio = mode === "current_window" ? [0.22,0.72][column] : [0,0.42,1][column];
    const center = padLeft + plotW * ratio;
    const offset = footerStacked ? footerLines.slice(0,column).reduce((sum,item) => sum + item.length * 12 + 4,0) : 0;
    lines.forEach((line,index) => {
      const lineWidth = ctx.measureText(line).width;
      ctx.fillText(line,Math.max(12,Math.min(center - lineWidth / 2,width - 12 - lineWidth)),padTop + plotH + 16 + offset + index * 12);
    });
  };
  const drawLabel = (text, x, y, maxWidth = width - 24) => {
    const lines = wrapText(text, Math.max(1, maxWidth), ctx.font);
    const lineWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
    const left = Math.max(12, Math.min(x, width - 12 - lineWidth));
    const top = Math.max(12, Math.min(y, height - 12 - (lines.length - 1) * 12));
    const align = ctx.textAlign;
    ctx.textAlign = "left";
    lines.forEach((line, index) => ctx.fillText(line, left, top + index * 12));
    ctx.textAlign = align;
  };

  if (mode === "current_window") {
    // Mode 1: Read Sensing Current Window (Distribution of State '0' vs '1')
    // At Cryo 4K, distribution sharpens dramatically due to suppressed thermal broadening
    const stdDev4K = 1.2;
    const stdDev300K = 4.8;
    const isCold = results.tempKelvin <= 77;
    const currentStd = isCold ? stdDev4K : stdDev300K;

    const centerOff = padLeft + plotW * 0.22;
    const centerOn = padLeft + plotW * 0.72;

    // Draw OFF state distribution (State '0')
    ctx.beginPath();
    for (let px = padLeft; px <= centerOff + 45; px += 2) {
      const z = (px - centerOff) / currentStd;
      const pdf = Math.exp(-0.5 * z * z);
      const y = padTop + plotH - pdf * (plotH * 0.75);
      if (px === padLeft) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw ON state distribution (State '1')
    ctx.beginPath();
    for (let px = centerOn - 45; px <= padLeft + plotW; px += 2) {
      const z = (px - centerOn) / currentStd;
      const pdf = Math.exp(-0.5 * z * z);
      const y = padTop + plotH - pdf * (plotH * 0.75);
      if (px === centerOn - 45) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Sense Window Bracket between the two states
    const bracketY = padTop + plotH * 0.35;
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerOff + 10, bracketY);
    ctx.lineTo(centerOn - 10, bracketY);
    ctx.moveTo(centerOff + 10, bracketY - 6);
    ctx.lineTo(centerOff + 10, bracketY + 6);
    ctx.moveTo(centerOn - 10, bracketY - 6);
    ctx.lineTo(centerOn - 10, bracketY + 6);
    ctx.stroke();

    ctx.font = "700 9.5px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#fbbf24";
    ctx.textAlign = "center";
    const windowText = isZh ? `感測裕度窗 ΔI: ${results.deltaIreadUa} μA` : `Sense Window ΔI: ${results.deltaIreadUa} μA`;
    drawLabel(windowText, padLeft, bracketY - 8, plotW);
    ctx.textAlign = "left";

    // Labels
    ctx.font = "600 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#38bdf8";
    drawFooter(footerLines[0],0);
    ctx.fillStyle = "#34d399";
    drawFooter(footerLines[1],1);

  } else {
    // Mode 2: Temperature Spectrum Curve (Thermal Noise vs Temp 4K -> 300K)
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 1;

    // Horizontal grid
    for (let g = 0; g <= 4; g++) {
      const y = padTop + (plotH / 4) * g;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();
    }

    // Thermal noise drop curve: y(T) = 10 * log10(T / 300)
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;

    let markerX = 0;
    let markerY = 0;

    for (let px = 0; px <= plotW; px += 2) {
      // Log scale for temperature from 4K to 300K
      const logMin = Math.log10(4.0);
      const logMax = Math.log10(300.0);
      const logT = logMin + (px / plotW) * (logMax - logMin);
      const T = Math.pow(10, logT);

      const dropDb = 10.0 * Math.log10(T / 300.0); // 0 dB at 300K down to -18.7 dB at 4K
      const normY = (dropDb - (-20.0)) / 20.0; // 0 to 1
      const y = padTop + plotH - normY * plotH;

      if (px === 0) ctx.moveTo(padLeft + px, y);
      else ctx.lineTo(padLeft + px, y);

      if (Math.abs(T - results.tempKelvin) < (results.tempKelvin * 0.12)) {
        markerX = padLeft + px;
        markerY = y;
      }
    }
    ctx.stroke();

    // Operating Temperature Point Marker
    if (markerX > 0) {
      ctx.beginPath();
      ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#34d399";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "700 9px 'IBM Plex Mono', monospace";
      ctx.fillStyle = "#34d399";
      drawLabel(
        `${results.tempKelvin}K (${results.noisePowerDropDb} dB)`,
        Math.max(padLeft, markerX - 25),
        Math.max(padTop + 14, markerY - 8)
      );
    }

    ctx.font = "600 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    footerLines.forEach(drawFooter);
  }

  // Canvas Title
  ctx.font = "700 10.5px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#f8fafc";
  titleLines.forEach((line, index) => ctx.fillText(line, 12, 16 + index * 13));

  ctx.restore();
}

/**
 * Initializes DOM interactive controls and event listeners for the Cryogenic NVM Physics workbench.
 */
export function initCryogenicNvmSimulator() {
  const root = document.getElementById("cryogenic-nvm-simulator-root");
  if (!root) return;

  const envSelect = document.getElementById("cryo-env-select");
  const techSelect = document.getElementById("cryo-tech-select");
  const biasSlider = document.getElementById("cryo-bias-slider");
  const biasVal = document.getElementById("cryo-bias-val");
  const timeSlider = document.getElementById("cryo-time-slider");
  const timeVal = document.getElementById("cryo-time-val");

  const modeBtnWin = document.getElementById("cryo-mode-win");
  const modeBtnSpec = document.getElementById("cryo-mode-spec");
  const canvas = document.getElementById("cryo-canvas");

  // Output Elements
  const outWindow = document.getElementById("cryo-out-window");
  const outNoise = document.getElementById("cryo-out-noise");
  const outVbd = document.getElementById("cryo-out-vbd");
  const outFreeze = document.getElementById("cryo-out-freeze");
  const outSnr = document.getElementById("cryo-out-snr");
  const outVerdict = document.getElementById("cryo-out-verdict");

  let currentVisualMode = "current_window";

  function getLang() {
    return (window.HubLanguage?.get() || document.documentElement.lang || "zh").startsWith("zh");
  }

  function update() {
    const isZh = getLang();
    const envKey = envSelect ? envSelect.value : "cryo_4k";
    const techKey = techSelect ? techSelect.value : "antifuse_cryo";
    const readBiasMv = biasSlider ? parseInt(biasSlider.value, 10) : 200;
    const senseTimeNs = timeSlider ? parseInt(timeSlider.value, 10) : 10;

    if (biasVal && biasSlider) {
      biasVal.textContent = `${biasSlider.value} mV`;
      biasSlider.setAttribute("aria-valuetext", biasVal.textContent);
    }
    if (timeVal && timeSlider) {
      timeVal.textContent = `${timeSlider.value} ns`;
      timeSlider.setAttribute("aria-valuetext", timeVal.textContent);
    }

    const res = calculateCryogenicPhysics({
      envKey,
      techKey,
      readBiasMv,
      senseTimeNs,
    });

    if (outWindow) {
      outWindow.textContent = `${res.deltaIreadUa} μA`;
      outWindow.style.color = res.deltaIreadUa >= 10.0 ? "#059669" : "#d97706";
    }
    if (outNoise) {
      outNoise.textContent = `${res.noisePowerDropDb} dB`;
    }
    if (outVbd) {
      outVbd.textContent = res.vbdModelStatus === "defined"
        ? `${res.vbdActualV} V`
        : (isZh ? "N/A · 未定義" : "N/A · Undefined");
    }
    if (outFreeze) {
      outFreeze.textContent = `${res.ionizationFractionPercent}%`;
      outFreeze.style.color = res.ionizationFractionPercent < 5.0 ? "#dc2626" : "#475569";
    }
    if (outSnr) {
      outSnr.textContent = `${res.snrDb} dB`;
      outSnr.style.color = res.snrDb >= 30.0 ? "#059669" : "#0284c7";
    }

    if (outVerdict) {
      if (res.vbdModelStatus === "not_defined") {
        outVerdict.innerHTML = isZh
          ? `<strong>【未校準教學模型適用範圍】</strong> <strong>${res.techNameZh}</strong> 在 ${res.tempKelvin} K 下的讀取電流裕度為 <strong>${res.deltaIreadUa} μA</strong>，熱噪聲功率變化為 <strong>${res.noisePowerDropDb} dB</strong>，讀取信噪比為 <strong>${res.snrDb} dB</strong>。既有參數未定義此技術的溫度擊穿係數，因此擊穿／編程電壓模型顯示 <strong>N/A · 未定義</strong>；讀取數值僅為本模型試算，產品適用性仍需完整模型及實測證據。`
          : `<strong>[UNCALIBRATED TEACHING MODEL APPLICABILITY]</strong> At ${res.tempKelvin} K, <strong>${res.techNameEn}</strong> has a modeled read-current margin of <strong>${res.deltaIreadUa} μA</strong>, thermal-noise power change of <strong>${res.noisePowerDropDb} dB</strong>, and read SNR of <strong>${res.snrDb} dB</strong>. The existing parameters leave its temperature-dependent breakdown coefficient undefined, so the breakdown/programming voltage model displays <strong>N/A · Undefined</strong>. Read outputs are illustrative; product applicability requires complete models and measured evidence.`;
      } else if (res.isCryoViable) {
        outVerdict.innerHTML = isZh
          ? `<strong>【未校準教學分類：低溫讀取支路】</strong> <strong>${res.techNameZh}</strong> 在 ${res.tempKelvin} K 下的模型熱噪聲功率變化為 <strong>${res.noisePowerDropDb} dB</strong>，讀取信噪比為 <strong>${res.snrDb} dB</strong>。金屬化微絲／磁性接面支路採用不含矽載子凍結衰減項的假設，用於示意低溫感測機制；實際低溫控制器的記憶體適用性仍需周邊電路、封裝與實測驗證。`
          : `<strong>[UNCALIBRATED TEACHING CLASS: CRYOGENIC READ PATH]</strong> At ${res.tempKelvin} K, <strong>${res.techNameEn}</strong> has a modeled thermal-noise power change of <strong>${res.noisePowerDropDb} dB</strong> and read SNR of <strong>${res.snrDb} dB</strong>. The metallic-filament / magnetic-junction path assumes no silicon carrier freeze-out attenuation term to illustrate the sensing mechanism. Applicability to cryogenic controllers requires peripheral-circuit, packaging, and measured validation.`;
      } else {
        outVerdict.innerHTML = isZh
          ? `<strong>【未校準教學分類：載子凍結敏感支路】</strong> 在 ${res.tempKelvin} K 下，簡化矽基底模型的雜質電離率為 <strong>${res.ionizationFractionPercent}%</strong>。此分類用於示意載子凍結可能影響存取電晶體導通電阻與電荷泵升壓路徑；本工具未計算完整周邊電路，實際失效與使用範圍仍需產品參數及實測證據。`
          : `<strong>[UNCALIBRATED TEACHING CLASS: FREEZE-OUT-SENSITIVE PATH]</strong> At ${res.tempKelvin} K, the simplified bulk-silicon model gives an ionization fraction of <strong>${res.ionizationFractionPercent}%</strong>. This class illustrates how carrier freeze-out may affect access-transistor resistance and charge-pump drive. Complete peripheral circuits are outside this calculation; actual failure and operating limits require product parameters and measured evidence.`;
      }
    }

    if (canvas) {
      drawCryoCanvas(canvas, res, currentVisualMode, isZh);
    }
  }

  // Visual mode buttons
  if (modeBtnWin && modeBtnSpec) {
    modeBtnWin.addEventListener("click", () => {
      currentVisualMode = "current_window";
      modeBtnWin.classList.add("active");
      modeBtnWin.setAttribute("aria-pressed", "true");
      modeBtnSpec.classList.remove("active");
      modeBtnSpec.setAttribute("aria-pressed", "false");
      update();
    });

    modeBtnSpec.addEventListener("click", () => {
      currentVisualMode = "temp_spectrum";
      modeBtnSpec.classList.add("active");
      modeBtnSpec.setAttribute("aria-pressed", "true");
      modeBtnWin.classList.remove("active");
      modeBtnWin.setAttribute("aria-pressed", "false");
      update();
    });
  }

  // Form controls listeners
  [envSelect, techSelect, biasSlider, timeSlider].forEach((ctrl) => {
    if (ctrl) {
      ctrl.addEventListener("input", update);
      ctrl.addEventListener("change", update);
    }
  });

  window.addEventListener("hub:language-change", update);
  window.addEventListener("resize", () => {
    if (canvas) update();
  });

  // Initial calculation
  update();
}

// Auto-boot
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCryogenicNvmSimulator);
  } else {
    initCryogenicNvmSimulator();
  }
}
