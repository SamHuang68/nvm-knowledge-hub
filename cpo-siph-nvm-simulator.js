/**
 * @file cpo-siph-nvm-simulator.js
 * @description First-principles simulator for Co-Packaged Optics (CPO) and Silicon Photonics (SiPh)
 * optical engine calibration, micro-ring resonator (MRR) wavelength drift, laser self-heating thermal
 * crosstalk, and non-volatile optical weight/trim retention economics.
 * @version 1.0.0
 * @license MIT
 */

/**
 * @typedef {Object} CpoPreset
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {number} laserPowerMw - Optical power per channel (mW)
 * @property {number} channelCount - Number of optical WDM channels
 * @property {number} laserWallPlugEff - Laser wall-plug efficiency (0.10 - 0.35)
 * @property {number} asicThermalPowerW - ASIC thermal load in CPO substrate (W)
 * @property {number} thermalResistanceKPerW - Thermal cross-resistance from ELS/OE to NVM (K/W)
 * @property {string} descZh
 * @property {string} descEn
 */

/**
 * @typedef {Object} OpticalNvmTech
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {number} staticPowerMw - Static tuning power consumption (mW per channel)
 * @property {number} activationEnergyEv - Arrhenius thermal retention activation energy (eV)
 * @property {number} baseRetentionYears85C - Base retention years at 85°C (years)
 * @property {number} tuningResolutionBits - Trim resolution (bits)
 * @property {number} writeEndurance - Write cycle endurance
 * @property {string} trimMechanismZh
 * @property {string} trimMechanismEn
 */

/**
 * Standard CPO and Silicon Photonics system presets
 * @type {Record<string, CpoPreset>}
 */
export const CPO_SYSTEM_PRESETS = {
  hyperscale_cpo_51t: {
    id: 'hyperscale_cpo_51t',
    nameZh: '51.2T 超算交換機 CPO (TSMC COUPE 3D)',
    nameEn: '51.2T Switch CPO (TSMC COUPE 3D)',
    laserPowerMw: 100,
    channelCount: 64,
    laserWallPlugEff: 0.18,
    asicThermalPowerW: 800,
    thermalResistanceKPerW: 0.045,
    descZh: '3D 晶圓級光電共封裝 (COUPE)，64 通道 CW-WDM，ASIC 高功耗密集散熱環境。',
    descEn: '3D wafer-scale Co-Packaged Optics (COUPE) with 64-ch CW-WDM in dense 800W ASIC thermal environment.'
  },
  ai_accelerator_oio: {
    id: 'ai_accelerator_oio',
    nameZh: 'AI 加速器光學 I/O 小晶片 (2.5D CPO)',
    nameEn: 'AI Accelerator Optical I/O Chiplet (2.5D)',
    laserPowerMw: 60,
    channelCount: 32,
    laserWallPlugEff: 0.22,
    asicThermalPowerW: 450,
    thermalResistanceKPerW: 0.065,
    descZh: '2.5D 中介層光學小晶片，高頻寬晶片間光互連，雷射熱沉局部聚集。',
    descEn: '2.5D interposer optical chiplet for D2D optical interconnect with localized laser thermal concentration.'
  },
  external_laser_els: {
    id: 'external_laser_els',
    nameZh: '遠端雷射模組 (ELS-FP 外部雷射光纖耦合)',
    nameEn: 'External Laser Source (ELS-FP Fiber-Coupled)',
    laserPowerMw: 150,
    channelCount: 16,
    laserWallPlugEff: 0.20,
    asicThermalPowerW: 120,
    thermalResistanceKPerW: 0.020,
    descZh: '盲插式外部可插拔雷射模組 (ELS)，雷射發熱與主 PIC 實體隔離，熱串擾大幅降低。',
    descEn: 'Blind-mate External Laser Source (ELS-FP) module with thermal decoupling from primary PIC.'
  },
  neuromorphic_photonic_gemm: {
    id: 'neuromorphic_photonic_gemm',
    nameZh: '神經形態光子計算矩陣 (Photonic GEMM)',
    nameEn: 'Neuromorphic Photonic GEMM Engine',
    laserPowerMw: 40,
    channelCount: 128,
    laserWallPlugEff: 0.25,
    asicThermalPowerW: 250,
    thermalResistanceKPerW: 0.050,
    descZh: '超密集光學張量矩陣乘法器，微環權重陣列對溫度微漂移極度敏感。',
    descEn: 'Ultra-dense optical tensor matrix multiplier with micro-ring weights sensitive to micro-thermal drift.'
  }
};

/**
 * Optical trim & weighting non-volatile technology profiles
 * @type {Record<string, OpticalNvmTech>}
 */
export const OPTICAL_NVM_TECHS = {
  antifuse_zero_static: {
    id: 'antifuse_zero_static',
    nameZh: 'AntiFuse OTP (零待機靜態功耗波長校準鎖定)',
    nameEn: 'AntiFuse OTP (Zero-Static Laser Trim Lock)',
    staticPowerMw: 0.0,
    activationEnergyEv: 1.85,
    baseRetentionYears85C: 50.0,
    tuningResolutionBits: 12,
    writeEndurance: 1,
    trimMechanismZh: '高溫金屬/矽化物導電微絲永久寫入，完全零靜態漏能，抗雷射高溫退化。',
    trimMechanismEn: 'Permanent silicided ohmic filament, zero static leakage, immune to laser thermal degradation.'
  },
  optical_pcm_gst: {
    id: 'optical_pcm_gst',
    nameZh: 'Optical PCM (波導整合 GSST 非揮發光相變權重)',
    nameEn: 'Optical PCM (Waveguide GSST Non-Volatile Weight)',
    staticPowerMw: 0.0,
    activationEnergyEv: 1.45,
    baseRetentionYears85C: 15.0,
    tuningResolutionBits: 8,
    writeEndurance: 100000,
    trimMechanismZh: '波導上方沉積非晶態/結晶態相變材料，直接調制光折射率與吸收率，零持續熱能。',
    trimMechanismEn: 'Waveguide-integrated amorphous/crystalline phase change, direct optical refractive tuning.'
  },
  active_thermal_heater: {
    id: 'active_thermal_heater',
    nameZh: '傳統主動式微加熱器 (TiN/NiCr Micro-Heater)',
    nameEn: 'Active Micro-Heater (TiN/NiCr Continuous Tuning)',
    staticPowerMw: 24.0,
    activationEnergyEv: 0.90,
    baseRetentionYears85C: 10.0,
    tuningResolutionBits: 16,
    writeEndurance: 1e9,
    trimMechanismZh: '傳統電阻加熱調諧：必須持續通電加熱以鎖定共振峰，產生巨大靜態熱功耗。',
    trimMechanismEn: 'Resistive micro-heater: requires continuous static heating power to hold resonance peak.'
  },
  reram_analog_trim: {
    id: 'reram_analog_trim',
    nameZh: 'BEOL ReRAM OxRAM (類比阻變連續偏壓微調)',
    nameEn: 'BEOL ReRAM OxRAM (Analog Conductance Trim)',
    staticPowerMw: 0.02,
    activationEnergyEv: 1.25,
    baseRetentionYears85C: 10.0,
    tuningResolutionBits: 6,
    writeEndurance: 1000000,
    trimMechanismZh: '後段金屬化氧化物導電微絲，多級阻值記憶，可重構但具熱擾動隨機漂移。',
    trimMechanismEn: 'Back-end metal oxide filament, multi-level analog states, reconfigurable with thermal drift.'
  }
};

/**
 * Constants for Silicon Photonics physical calculations
 */
export const SIPH_CONSTANTS = {
  LAMBDA_0_NM: 1310.0, // Center wavelength (nm)
  THERMO_OPTIC_DN_DT: 1.86e-4, // Silicon thermo-optic coefficient (1/K)
  GROUP_INDEX_NG: 4.10, // Silicon strip waveguide group index
  BOLTZMANN_EV: 8.617333262145e-5 // eV/K
};

/**
 * Calculate CPO optical engine, thermal crosstalk, and eNVM retention metrics
 * @param {Object} params
 * @param {string} params.presetId
 * @param {string} params.techId
 * @param {number} params.ambientTempC
 * @param {number} params.laserPowerMw
 * @param {number} params.channelCount
 * @returns {Object} Comprehensive calculation metrics
 */
export function calculateCpoSiphMetrics({
  presetId = 'hyperscale_cpo_51t',
  techId = 'antifuse_zero_static',
  ambientTempC = 45.0,
  laserPowerMw = 100.0,
  channelCount = 64
}) {
  const preset = CPO_SYSTEM_PRESETS[presetId] || CPO_SYSTEM_PRESETS.hyperscale_cpo_51t;
  const tech = OPTICAL_NVM_TECHS[techId] || OPTICAL_NVM_TECHS.antifuse_zero_static;

  // 1. Laser self-heating power calculation
  // Total optical power = channelCount * laserPowerMw (mW)
  const totalOpticalPowerMw = channelCount * laserPowerMw;
  const totalOpticalPowerW = totalOpticalPowerMw / 1000.0;
  // Electrical input power to laser = OpticalPower / WallPlugEfficiency
  const laserElectricalInputW = totalOpticalPowerW / preset.laserWallPlugEff;
  // Dissipated heat power by laser = ElectricalPower - OpticalPower
  const laserDissipatedHeatW = laserElectricalInputW - totalOpticalPowerW;

  // 2. Thermal coupling to eNVM / PIC junction
  // Combined heat flow into substrate
  const totalHeatLoadW = laserDissipatedHeatW + (preset.asicThermalPowerW * 0.15); // 15% local coupling
  const deltaT = totalHeatLoadW * preset.thermalResistanceKPerW;
  const junctionTempC = ambientTempC + deltaT;
  const junctionTempK = junctionTempC + 273.15;
  const baseTempK = 85.0 + 273.15; // 85°C in Kelvin

  // 3. Silicon Micro-Ring Resonator (MRR) Wavelength Thermal Drift
  // Delta lambda_res = lambda_0 * (dn/dT / n_g) * deltaT (nm)
  const driftRateNmPerK = (SIPH_CONSTANTS.LAMBDA_0_NM * SIPH_CONSTANTS.THERMO_OPTIC_DN_DT) / SIPH_CONSTANTS.GROUP_INDEX_NG;
  const wavelengthDriftNm = driftRateNmPerK * deltaT;

  // 4. Static tuning power comparison
  // Traditional active heater power = channelCount * 24 mW
  const baselineHeaterPowerTotalW = (channelCount * 24.0) / 1000.0;
  // Non-volatile / tech static power = channelCount * tech.staticPowerMw
  const actualTechPowerTotalW = (channelCount * tech.staticPowerMw) / 1000.0;
  const savedTuningPowerW = Math.max(0, baselineHeaterPowerTotalW - actualTechPowerTotalW);
  const powerSavingsPercent = baselineHeaterPowerTotalW > 0
    ? (savedTuningPowerW / baselineHeaterPowerTotalW) * 100.0
    : 0.0;

  // 5. Arrhenius NVM Thermal Retention Degradation
  // AF = exp[ (Ea / k) * (1/T_base - 1/T_j) ]
  // Retention(T_j) = BaseRetention / AF
  const arrheniusExponent = (tech.activationEnergyEv / SIPH_CONSTANTS.BOLTZMANN_EV) * ((1.0 / baseTempK) - (1.0 / junctionTempK));
  const accelerationFactor = Math.exp(arrheniusExponent);
  const estimatedRetentionYears = tech.baseRetentionYears85C / Math.max(0.001, accelerationFactor);

  // 6. Overall CPO Optical System Grade
  let systemRating = 'Tier-1 Hyperscale Co-Design';
  let ratingColor = '#10b981';
  let verdictZh = '';
  let verdictEn = '';

  if (junctionTempC > 115.0 || estimatedRetentionYears < 5.0) {
    systemRating = 'Thermal Redline Warning';
    ratingColor = '#ef4444';
    verdictZh = `警報：雷射發熱疊加 ASIC 熱阻使接面溫度達 ${junctionTempC.toFixed(1)}°C！光學諧振漂移達 ${wavelengthDriftNm.toFixed(2)} nm，eNVM 預估留存衰減至 ${estimatedRetentionYears.toFixed(1)} 年。建議改採 ELS 外部解耦或強化熱沉。`;
    verdictEn = `Warning: Combined laser and ASIC heat drives junction temp to ${junctionTempC.toFixed(1)}°C. MRR drift reaches ${wavelengthDriftNm.toFixed(2)} nm, reducing eNVM retention to ${estimatedRetentionYears.toFixed(1)} yrs. Recommend external ELS decoupling.`;
  } else if (junctionTempC > 95.0 || estimatedRetentionYears < 10.0) {
    systemRating = 'Qualified CPO Deployment';
    ratingColor = '#f59e0b';
    verdictZh = `合規：接面溫度 ${junctionTempC.toFixed(1)}°C 處於邊界，微環漂移 ${wavelengthDriftNm.toFixed(2)} nm。${tech.nameZh} 實現 ${powerSavingsPercent.toFixed(0)}% 靜態調諧功耗節省，預估壽命 ${estimatedRetentionYears.toFixed(1)} 年。`;
    verdictEn = `Qualified: Junction temp ${junctionTempC.toFixed(1)}°C at margin, MRR drift ${wavelengthDriftNm.toFixed(2)} nm. ${tech.nameEn} achieves ${powerSavingsPercent.toFixed(0)}% static power savings with ${estimatedRetentionYears.toFixed(1)} yrs retention.`;
  } else {
    systemRating = 'Optimal Photonic Co-Design';
    ratingColor = '#10b981';
    verdictZh = `優異：接面溫升控制於 ${junctionTempC.toFixed(1)}°C。${tech.nameZh} 徹底消除微加熱器靜態熱功耗（省下 ${savedTuningPowerW.toFixed(2)} W），留存壽命 ${estimatedRetentionYears.toFixed(1)} 年完全符合 15 年資料中心服務期。`;
    verdictEn = `Optimal: Junction temp well-controlled at ${junctionTempC.toFixed(1)}°C. ${tech.nameEn} eliminates static micro-heater power (saving ${savedTuningPowerW.toFixed(2)} W) with ${estimatedRetentionYears.toFixed(1)} yrs data retention.`;
  }

  return {
    preset,
    tech,
    ambientTempC,
    laserPowerMw,
    channelCount,
    totalOpticalPowerW,
    laserDissipatedHeatW,
    totalHeatLoadW,
    deltaT,
    junctionTempC,
    driftRateNmPerK,
    wavelengthDriftNm,
    baselineHeaterPowerTotalW,
    actualTechPowerTotalW,
    savedTuningPowerW,
    powerSavingsPercent,
    accelerationFactor,
    estimatedRetentionYears,
    systemRating,
    ratingColor,
    verdictZh,
    verdictEn
  };
}

/**
 * Draw CPO and Silicon Photonics visualization onto HTML Canvas
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'mrr_resonance_shift' | 'laser_thermal_retention'} mode
 */
export function drawCpoSiphCanvas(canvas, metrics, mode = 'mrr_resonance_shift') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.width || 480;
  const height = rect.height || canvas.height || 200;

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }
  ctx.save();
  ctx.scale(dpr, dpr);

  // Background
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#060d17';
  ctx.fillRect(0, 0, width, height);

  const padLeft = 48;
  const padRight = 24;
  const padTop = 24;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i++) {
    const y = padTop + (plotH / 4) * i;
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
  }
  for (let i = 0; i <= 4; i++) {
    const x = padLeft + (plotW / 4) * i;
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + plotH);
  }
  ctx.stroke();

  if (mode === 'mrr_resonance_shift') {
    // Mode 1: MRR Transmission Spectrum Shift (Lorentzian drop vs Wavelength)
    // Center at 1310nm, sweep +/- 3nm (1307 to 1313 nm)
    const lambdaMin = 1308.0;
    const lambdaMax = 1312.0;
    const peak0 = 1310.0;
    const peakShifted = 1310.0 + metrics.wavelengthDriftNm;
    const fwhm = 0.25; // 0.25 nm FWHM for high-Q ring resonator

    const getTransmission = (lambda, center) => {
      // Lorentzian notch filter (MRR drop port / thru port)
      const gamma = fwhm / 2.0;
      const notch = (gamma * gamma) / ((lambda - center) * (lambda - center) + gamma * gamma);
      return 1.0 - (0.85 * notch);
    };

    // Draw baseline spectrum (Cold / Nominal)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let xPix = 0; xPix <= plotW; xPix++) {
      const lam = lambdaMin + (xPix / plotW) * (lambdaMax - lambdaMin);
      const trans = getTransmission(lam, peak0);
      const yPix = padTop + plotH * (1.0 - trans);
      if (xPix === 0) ctx.moveTo(padLeft + xPix, yPix);
      else ctx.lineTo(padLeft + xPix, yPix);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw shifted spectrum (Hot / Drifted)
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let xPix = 0; xPix <= plotW; xPix++) {
      const lam = lambdaMin + (xPix / plotW) * (lambdaMax - lambdaMin);
      const trans = getTransmission(lam, peakShifted);
      const yPix = padTop + plotH * (1.0 - trans);
      if (xPix === 0) ctx.moveTo(padLeft + xPix, yPix);
      else ctx.lineTo(padLeft + xPix, yPix);
    }
    ctx.stroke();

    // Mark drift offset arrow
    const x0 = padLeft + ((peak0 - lambdaMin) / (lambdaMax - lambdaMin)) * plotW;
    const x1 = padLeft + ((Math.min(lambdaMax, peakShifted) - lambdaMin) / (lambdaMax - lambdaMin)) * plotW;
    const yArrow = padTop + 20;

    ctx.strokeStyle = '#10b981';
    ctx.fillStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x0, yArrow);
    ctx.lineTo(x1, yArrow);
    ctx.stroke();

    // Draw arrowheads
    ctx.beginPath();
    ctx.arc(x1, yArrow, 3, 0, Math.PI * 2);
    ctx.fill();

    // Text labels
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('1308nm', padLeft, height - 10);
    ctx.fillText('1310nm', padLeft + plotW * 0.5 - 18, height - 10);
    ctx.fillText('1312nm', padLeft + plotW - 36, height - 10);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Cold (25°C)', padLeft + 6, padTop + 14);
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(`Hot (+${metrics.deltaT.toFixed(0)}°C, Δλ=${metrics.wavelengthDriftNm.toFixed(2)}nm)`, padLeft + 80, padTop + 14);

  } else {
    // Mode 2: Laser Power vs Junction Temp & Arrhenius Retention
    // Sweep laser power from 20mW to 200mW
    const pMin = 20;
    const pMax = 200;

    // Draw Temp line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let xPix = 0; xPix <= plotW; xPix++) {
      const p = pMin + (xPix / plotW) * (pMax - pMin);
      const testTotalOptW = (metrics.channelCount * p) / 1000.0;
      const testElecW = testTotalOptW / metrics.preset.laserWallPlugEff;
      const testDissW = testElecW - testTotalOptW;
      const testTotalHeatW = testDissW + (metrics.preset.asicThermalPowerW * 0.15);
      const testTj = metrics.ambientTempC + (testTotalHeatW * metrics.preset.thermalResistanceKPerW);

      // Map 40°C - 140°C to plotH
      const normY = Math.max(0, Math.min(1, (testTj - 40.0) / 100.0));
      const yPix = padTop + plotH * (1.0 - normY);
      if (xPix === 0) ctx.moveTo(padLeft + xPix, yPix);
      else ctx.lineTo(padLeft + xPix, yPix);
    }
    ctx.stroke();

    // Draw current operating point
    const currentX = padLeft + ((metrics.laserPowerMw - pMin) / (pMax - pMin)) * plotW;
    const currentNormY = Math.max(0, Math.min(1, (metrics.junctionTempC - 40.0) / 100.0));
    const currentY = padTop + plotH * (1.0 - currentNormY);

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('20mW', padLeft, height - 10);
    ctx.fillText('100mW (Laser/Ch)', padLeft + plotW * 0.4, height - 10);
    ctx.fillText('200mW', padLeft + plotW - 32, height - 10);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`Junction Temp: ${metrics.junctionTempC.toFixed(1)}°C (Retention ~ ${metrics.estimatedRetentionYears.toFixed(1)} yrs)`, padLeft + 6, padTop + 14);
  }

  ctx.restore();
}

/**
 * Initialize CPO and Silicon Photonics eNVM simulator DOM bindings
 * @param {string} rootSelector
 */
export function initCpoSiphSimulator(rootSelector = '#cpo-siph-simulator-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const presetSelect = root.querySelector('#cpo-preset-select');
  const techSelect = root.querySelector('#cpo-tech-select');
  const ambientSlider = root.querySelector('#cpo-ambient-slider');
  const laserSlider = root.querySelector('#cpo-laser-slider');
  const channelSlider = root.querySelector('#cpo-channel-slider');

  const ambientVal = root.querySelector('#cpo-ambient-val');
  const laserVal = root.querySelector('#cpo-laser-val');
  const channelVal = root.querySelector('#cpo-channel-val');

  const outJunction = root.querySelector('#cpo-out-junction');
  const outDrift = root.querySelector('#cpo-out-drift');
  const outPowerSave = root.querySelector('#cpo-out-powersave');
  const outRetention = root.querySelector('#cpo-out-retention');
  const outRating = root.querySelector('#cpo-out-rating');
  const outVerdict = root.querySelector('#cpo-out-verdict');

  const canvas = root.querySelector('#cpo-siph-canvas');
  const modeMrrBtn = root.querySelector('#cpo-mode-mrr');
  const modeLaserBtn = root.querySelector('#cpo-mode-laser');

  let currentMode = 'mrr_resonance_shift';

  function update() {
    const isZh = document.documentElement.lang.startsWith('zh');
    const presetId = presetSelect ? presetSelect.value : 'hyperscale_cpo_51t';
    const techId = techSelect ? techSelect.value : 'antifuse_zero_static';
    const ambientTempC = ambientSlider ? parseFloat(ambientSlider.value) : 45.0;
    const laserPowerMw = laserSlider ? parseFloat(laserSlider.value) : 100.0;
    const channelCount = channelSlider ? parseInt(channelSlider.value, 10) : 64;

    if (ambientVal) ambientVal.textContent = `${ambientTempC}°C`;
    if (laserVal) laserVal.textContent = `${laserPowerMw} mW`;
    if (channelVal) channelVal.textContent = `${channelCount} ch`;

    if (ambientSlider) ambientSlider.setAttribute('aria-valuetext', `${ambientTempC}°C`);
    if (laserSlider) laserSlider.setAttribute('aria-valuetext', `${laserPowerMw} mW`);
    if (channelSlider) channelSlider.setAttribute('aria-valuetext', `${channelCount} ch`);

    const metrics = calculateCpoSiphMetrics({
      presetId,
      techId,
      ambientTempC,
      laserPowerMw,
      channelCount
    });

    if (outJunction) outJunction.textContent = `${metrics.junctionTempC.toFixed(1)} °C`;
    if (outDrift) outDrift.textContent = `+${metrics.wavelengthDriftNm.toFixed(2)} nm`;
    if (outPowerSave) outPowerSave.textContent = `${metrics.powerSavingsPercent.toFixed(0)} %`;
    if (outRetention) outRetention.textContent = `${metrics.estimatedRetentionYears >= 100 ? '>100' : metrics.estimatedRetentionYears.toFixed(1)} yrs`;

    if (outRating) {
      outRating.textContent = metrics.systemRating;
      outRating.style.color = metrics.ratingColor;
    }

    if (outVerdict) {
      outVerdict.textContent = isZh ? metrics.verdictZh : metrics.verdictEn;
    }

    if (canvas) {
      drawCpoSiphCanvas(canvas, metrics, currentMode);
    }
  }

  if (presetSelect) presetSelect.addEventListener('change', update);
  if (techSelect) techSelect.addEventListener('change', update);
  if (ambientSlider) ambientSlider.addEventListener('input', update);
  if (laserSlider) laserSlider.addEventListener('input', update);
  if (channelSlider) channelSlider.addEventListener('input', update);

  if (modeMrrBtn && modeLaserBtn) {
    modeMrrBtn.addEventListener('click', () => {
      currentMode = 'mrr_resonance_shift';
      modeMrrBtn.classList.add('active');
      modeMrrBtn.setAttribute('aria-pressed', 'true');
      modeLaserBtn.classList.remove('active');
      modeLaserBtn.setAttribute('aria-pressed', 'false');
      modeMrrBtn.style.background = '#0284c7';
      modeMrrBtn.style.borderColor = '#38bdf8';
      modeMrrBtn.style.color = '#ffffff';
      modeLaserBtn.style.background = '#1e293b';
      modeLaserBtn.style.borderColor = '#475569';
      modeLaserBtn.style.color = '#94a3b8';
      update();
    });

    modeLaserBtn.addEventListener('click', () => {
      currentMode = 'laser_thermal_retention';
      modeLaserBtn.classList.add('active');
      modeLaserBtn.setAttribute('aria-pressed', 'true');
      modeMrrBtn.classList.remove('active');
      modeMrrBtn.setAttribute('aria-pressed', 'false');
      modeLaserBtn.style.background = '#0284c7';
      modeLaserBtn.style.borderColor = '#38bdf8';
      modeLaserBtn.style.color = '#ffffff';
      modeMrrBtn.style.background = '#1e293b';
      modeMrrBtn.style.borderColor = '#475569';
      modeMrrBtn.style.color = '#94a3b8';
      update();
    });
  }

  // Language mutation observer
  const observer = new MutationObserver(() => update());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  window.addEventListener('resize', update);
    window.addEventListener('hub:language-change', () => update());
  window.addEventListener('languagechange', () => update());
  window.addEventListener('resize', () => update());
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initCpoSiphSimulator());
  } else {
    initCpoSiphSimulator();
  }
}
