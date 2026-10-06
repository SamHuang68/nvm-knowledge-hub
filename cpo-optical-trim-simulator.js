/**
 * @file cpo-optical-trim-simulator.js
 * @description First-principles simulator for Co-Packaged Optics (CPO) and Silicon Photonics
 * thermal drift phase trimming, micro-ring resonator (MRR) / Mach-Zehnder interferometer (MZI)
 * thermo-optic tuning, Low-Disturbance MTP (LD-MTP) closed-loop DAC offset calibration,
 * extinction ratio (ER) retention, and optical eye jitter degradation.
 * @version 1.0.0
 * @license MIT
 */

/**
 * System presets for CPO and Silicon Photonics architectures.
 */
export const CPO_TRIM_SYSTEM_PRESETS = {
  cpo_switch_51t_coupe: {
    id: 'cpo_switch_51t_coupe',
    nameEn: '51.2T Switch 3D COUPE Optical Engine (TSMC COUPE 3D PIC+EIC)',
    nameZh: '51.2T 交換器 3D COUPE 光引擎 (TSMC COUPE 3D PIC+EIC)',
    centerWavelengthNm: 1310.0,
    effectiveIndex: 2.45,
    thermoOpticCoeff: 1.86e-4, // dn/dT in K^-1
    armLengthUm: 350.0, // MZI arm length
    defaultDeltaTC: 45.0, // ASIC heavy thermal load
    defaultDacBits: 10,
    defaultChannels: 64,
    heaterBasePowerMw: 28.0, // active continuous heater mW/channel
    descZh: '3D 晶圓級光電共封裝，64 通道 CW-WDM，ASIC 800W 散熱環境下矽光波導熱漂移極其劇烈。',
    descEn: '3D wafer-scale CPO with 64-ch CW-WDM under 800W ASIC thermal load with severe thermo-optic waveguide drift.'
  },
  oci_chiplet_ai_cluster: {
    id: 'oci_chiplet_ai_cluster',
    nameEn: 'AI Cluster Optical I/O Chiplet (2.5D CoWoS/EMIB OCI)',
    nameZh: 'AI 叢集光互連小晶片 (2.5D CoWoS/EMIB OCI)',
    centerWavelengthNm: 1310.0,
    effectiveIndex: 2.45,
    thermoOpticCoeff: 1.86e-4,
    armLengthUm: 250.0,
    defaultDeltaTC: 35.0,
    defaultDacBits: 10,
    defaultChannels: 32,
    heaterBasePowerMw: 25.0,
    descZh: '2.5D 異質整合光互連小晶片，突發計算負載導致溫度快速震盪，需動態可覆寫 NVM 追蹤校準。',
    descEn: '2.5D heterogeneous optical chiplet under bursty compute thermal swings requiring dynamic rewritable NVM tracking.'
  },
  neuromorphic_mzi_mesh: {
    id: 'neuromorphic_mzi_mesh',
    nameEn: 'Photonic Neuromorphic GEMM Mesh (High-Density MZI Mesh)',
    nameZh: '光子神經形態計算矩陣 (高密度相干 MZI 網絡)',
    centerWavelengthNm: 1550.0,
    effectiveIndex: 2.42,
    thermoOpticCoeff: 1.86e-4,
    armLengthUm: 500.0,
    defaultDeltaTC: 25.0,
    defaultDacBits: 12,
    defaultChannels: 128,
    heaterBasePowerMw: 32.0,
    descZh: '128 通道超密集相干光學計算網絡，對相位漂移極端敏感，容許殘留相位誤差小於 0.02 rad。',
    descEn: '128-ch ultra-dense coherent optical compute mesh highly sensitive to phase drifts with <0.02 rad tolerance.'
  },
  els_fp_external_laser: {
    id: 'els_fp_external_laser',
    nameEn: 'External Laser Source Decoupled (ELS-FP Blind-Mate 16-ch)',
    nameZh: '遠端雷射模組實體解耦 (ELS-FP 盲插式外部光源 16 通道)',
    centerWavelengthNm: 1310.0,
    effectiveIndex: 2.45,
    thermoOpticCoeff: 1.86e-4,
    armLengthUm: 200.0,
    defaultDeltaTC: 15.0,
    defaultDacBits: 8,
    defaultChannels: 16,
    heaterBasePowerMw: 20.0,
    descZh: '雷射光源與運算主機實體分離，工作溫差較小，適合標準出廠校準與定期巡檢維護。',
    descEn: 'Laser decoupled from compute ASIC with low thermal gradient, ideal for factory baseline with periodic checkups.'
  }
};

/**
 * Optical trim & NVM storage technology policies.
 */
export const CPO_TRIM_TECH_POLICIES = {
  ld_mtp_closed_loop: {
    id: 'ld_mtp_closed_loop',
    nameEn: 'Low-Disturbance MTP (LD-MTP 10K~100K Dynamic Closed-Loop)',
    nameZh: '低擾動單層多晶矽 MTP (LD-MTP 10K~100K 動態閉迴路補償)',
    staticPowerPerChannelMw: 1.1,
    dacAccuracyFactor: 0.98,
    maskAdders: 0,
    rewritable: true,
    enduranceClass: '10K - 100K Cycles',
    gradeText: 'HIGH-PRECISION DYNAMIC',
    descZh: '原生 CMOS 0-Mask 邏輯製程相容，可線上重複燒寫 10K~100K 次，支援現場全生命週期溫漂即時校準。',
    descEn: 'Native 0-mask logic CMOS compatible, supporting 10K-100K cycles for real-time lifecycle thermal tracking.'
  },
  antifuse_factory_lock: {
    id: 'antifuse_factory_lock',
    nameEn: '0-Mask AntiFuse OTP (Single-Write Factory Waveguide Lock)',
    nameZh: '0-Mask AntiFuse OTP (出廠單次寫入固化波長/相位鎖定)',
    staticPowerPerChannelMw: 0.05,
    dacAccuracyFactor: 0.88,
    maskAdders: 0,
    rewritable: false,
    enduranceClass: 'OTP (1 Time Write)',
    gradeText: 'ZERO-STATIC FACTORY',
    descZh: '出廠單次高精準永久燒錄，運行時零靜態漏電與零待機功耗，但無法適應工作溫度動態偏移。',
    descEn: 'One-time factory calibration with zero static leakage, but unable to track in-field dynamic thermal swings.'
  },
  active_heater_continuous: {
    id: 'active_heater_continuous',
    nameEn: 'Active Thermal Micro-Heater (Continuous Power, No NVM)',
    nameZh: '傳統連續熱加熱器 (Active Thermal Micro-Heater, 無 NVM 靜態大功耗)',
    staticPowerPerChannelMw: 26.5,
    dacAccuracyFactor: 0.70,
    maskAdders: 2,
    rewritable: false,
    enduranceClass: 'Volatile Continuous Heat',
    gradeText: 'HIGH-POWER VOLATILE',
    descZh: '依賴高電流金屬加熱器持續發熱維持相位，額外增加 1~2 道金屬光罩且大幅推升散熱負擔。',
    descEn: 'Requires continuous high current heating, adding 1-2 specialized masks and exacerbating thermal hotspots.'
  }
};

/**
 * First-principles mathematical calculation of CPO thermal drift and phase trim metrics.
 * @param {string} presetKey - Selected system preset key.
 * @param {string} policyKey - Selected NVM trim policy key.
 * @param {number} deltaTC - Operating thermal gradient (10°C to 80°C).
 * @param {number} dacBits - DAC trim resolution (6 to 14 bits).
 * @param {number} channels - Number of optical channels (8 to 128).
 * @returns {Object} Calculated physical & economic metrics.
 */
export function calculateCpoTrimMetrics(presetKey, policyKey, deltaTC, dacBits, channels) {
  const preset = CPO_TRIM_SYSTEM_PRESETS[presetKey] || CPO_TRIM_SYSTEM_PRESETS.cpo_switch_51t_coupe;
  const policy = CPO_TRIM_TECH_POLICIES[policyKey] || CPO_TRIM_TECH_POLICIES.ld_mtp_closed_loop;

  const dt = Math.max(5.0, Math.min(100.0, deltaTC));
  const nDac = Math.max(6, Math.min(14, Math.round(dacBits)));
  const nCh = Math.max(4, Math.min(256, Math.round(channels)));

  // 1. Thermo-Optic Effect Physics
  // Delta n = (dn/dT) * Delta T
  const deltaN = preset.thermoOpticCoeff * dt;

  // Center Wavelength Drift: Delta lambda_0 = lambda_0 * (Delta n / n_eff)
  const wavelengthDriftNm = preset.centerWavelengthNm * (deltaN / preset.effectiveIndex);

  // MZI Phase Drift: Delta phi = (2 * pi / lambda_0) * Delta n * L_arm
  const lambda0Um = preset.centerWavelengthNm * 1e-3;
  const rawPhaseDriftRad = (2.0 * Math.PI / lambda0Um) * deltaN * preset.armLengthUm;

  // 2. DAC Quantization Resolution & Residual Error
  // Total phase range to compensate is typically 2*pi modulo
  const fullPhaseSpan = 2.0 * Math.PI;
  const dacSteps = Math.pow(2, nDac);
  const dacQuantizationStepRad = fullPhaseSpan / dacSteps;

  // Effective residual phase error after NVM DAC calibration
  let residualPhaseErrorRad = (dacQuantizationStepRad / 2.0);
  if (!policy.rewritable && dt > 20.0) {
    // If not rewritable, temperature drift outside factory calibration point causes untracked offset
    residualPhaseErrorRad += (rawPhaseDriftRad * 0.18);
  }
  residualPhaseErrorRad = Math.min(Math.PI * 0.95, residualPhaseErrorRad / policy.dacAccuracyFactor);

  // 3. Extinction Ratio (ER) & Optical Eye Jitter
  // MZI normalized transmission T = cos^2(Delta phi / 2) = (1 + cos(Delta phi)) / 2
  // ER = 10 * log10( (1 + cos(residual)) / (1 - cos(residual) + eps) )
  const eps = 1e-4;
  const cosTerm = Math.cos(residualPhaseErrorRad);
  const pMax = (1.0 + cosTerm) / 2.0;
  const pMin = Math.max(eps, (1.0 - cosTerm) / 2.0);
  const extinctionRatioDb = Math.max(2.0, Math.min(30.0, 10.0 * Math.log10(pMax / pMin)));

  // Jitter Degradation (ps): Higher residual phase error degrades transition sharpness
  const jitterDegradationPs = 0.65 + (residualPhaseErrorRad * 3.8);

  // 4. Power Consumption Economics
  // Total static power saved vs continuous active heating
  const activeHeaterPowerTotalW = (preset.heaterBasePowerMw * nCh) / 1000.0;
  const techPowerTotalW = (policy.staticPowerPerChannelMw * nCh) / 1000.0;
  const savedTuningPowerW = Math.max(0.0, activeHeaterPowerTotalW - techPowerTotalW);
  const powerSavingsPct = (savedTuningPowerW / (activeHeaterPowerTotalW || 1.0)) * 100.0;

  // Architecture Rating
  let rating = 'OPTIMAL';
  if (extinctionRatioDb < 8.0 || residualPhaseErrorRad > 0.15) {
    rating = 'CRITICAL';
  } else if (extinctionRatioDb < 12.0 || residualPhaseErrorRad > 0.06) {
    rating = 'VIABLE';
  }

  // Bilingual Verdict
  let verdictZh = '';
  let verdictEn = '';

  if (policy.id === 'ld_mtp_closed_loop') {
    verdictZh = `採用 LD-MTP 閉迴路補償：在 ${dt.toFixed(0)}°C 溫升下，${nDac}-bit DAC 精準抑制殘留相位誤差至 ${(residualPhaseErrorRad * 1000).toFixed(1)} mrad，消光比高達 ${extinctionRatioDb.toFixed(1)} dB，省下 ${savedTuningPowerW.toFixed(2)} W (${powerSavingsPct.toFixed(0)}%) 熱調諧功耗，且具備 10K~100K 次現場覆寫能力。`;
    verdictEn = `LD-MTP closed-loop architecture: Under ${dt.toFixed(0)}°C thermal delta, ${nDac}-bit DAC suppresses residual phase error to ${(residualPhaseErrorRad * 1000).toFixed(1)} mrad, achieving ${extinctionRatioDb.toFixed(1)} dB ER and saving ${savedTuningPowerW.toFixed(2)} W (${powerSavingsPct.toFixed(0)}%) power with 10K-100K in-field rewrites.`;
  } else if (policy.id === 'antifuse_factory_lock') {
    verdictZh = `採用 0-Mask AntiFuse 出廠鎖定：靜態功耗接近 0 W，但在 ${dt.toFixed(0)}°C 動態熱漂移下缺乏線上可覆寫能力，波長偏移達 ${wavelengthDriftNm.toFixed(2)} nm，消光比退化至 ${extinctionRatioDb.toFixed(1)} dB，建議適用於外置 ELS 等低溫差模組。`;
    verdictEn = `0-Mask AntiFuse factory lock: Near-zero static power, but lacks in-field rewritability under ${dt.toFixed(0)}°C dynamic delta, suffering ${wavelengthDriftNm.toFixed(2)} nm drift and ${extinctionRatioDb.toFixed(1)} dB ER degradation; suitable for decoupled ELS sources.`;
  } else {
    verdictZh = `傳統連續熱加熱器方案：全通道熱調諧總功耗高達 ${activeHeaterPowerTotalW.toFixed(2)} W，額外加劇 CPO 封裝散熱熱阻負擔，需額外金屬薄膜電阻光罩 (+2 Masks)，能效與可靠度均不具備量產競爭力。`;
    verdictEn = `Active continuous micro-heater: Consumes ${activeHeaterPowerTotalW.toFixed(2)} W total static heat, worsening CPO thermal bottlenecks and requiring +2 specialized resistor masks; non-competitive in energy efficiency.`;
  }

  return {
    deltaTC: dt,
    dacBits: nDac,
    channelCount: nCh,
    wavelengthDriftNm,
    rawPhaseDriftRad,
    residualPhaseErrorRad,
    extinctionRatioDb,
    jitterDegradationPs,
    activeHeaterPowerTotalW,
    techPowerTotalW,
    savedTuningPowerW,
    powerSavingsPct,
    rating,
    verdictZh,
    verdictEn
  };
}

/**
 * Draws the CPO thermal drift and phase trim canvas visualization.
 * @param {HTMLCanvasElement} canvas - Target HTML canvas element.
 * @param {Object} metrics - Calculated metrics.
 * @param {string} mode - Visualization mode ('spectrum_shift' | 'dac_er_tradeoff').
 * @param {string} lang - 'zh' or 'en'.
 */
export function drawCpoTrimCanvas(canvas, metrics, mode = 'spectrum_shift', lang = 'en') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || canvas.width || 420;
  const height = rect.height || canvas.height || 200;

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#020617');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const padding = { top: 30, right: 30, bottom: 35, left: 55 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (mode === 'spectrum_shift') {
    // Mode 1: Optical Resonance Spectrum & Drift Shift
    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
    }

    const driftNorm = Math.min(0.4, Math.max(-0.4, (metrics.wavelengthDriftNm / 5.0) * 0.4));
    const compNorm = driftNorm * (1.0 - (metrics.residualPhaseErrorRad / (Math.PI * 0.5)));

    function drawPeak(centerRatio, color, label, isDashed = false) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      if (isDashed) ctx.setLineDash([4, 3]);
      else ctx.setLineDash([]);

      const peakX = padding.left + chartW * centerRatio;
      for (let px = 0; px <= chartW; px++) {
        const x = padding.left + px;
        const dist = (x - peakX) / (chartW * 0.08);
        // Lorentzian transmission curve
        const trans = 1.0 / (1.0 + dist * dist);
        const y = padding.top + chartH - (trans * (chartH - 10));
        if (px === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Peak label
      ctx.fillStyle = color;
      ctx.font = "600 9.5px 'IBM Plex Mono', monospace";
      ctx.fillText(label, peakX - 22, padding.top + 12);
    }

    // 1. Nominal Cold Peak (Ideal center 0.5)
    drawPeak(0.5, '#38bdf8', lang === 'zh' ? '理想諧振' : 'Nominal', true);

    // 2. Uncompensated Thermal Drift Peak (Drifted)
    const driftCenter = 0.5 + driftNorm;
    drawPeak(driftCenter, '#ef4444', lang === 'zh' ? '熱漂移未校' : 'Drifted');

    // 3. NVM DAC Compensated Peak (Restored near nominal)
    const compCenter = driftCenter - compNorm;
    drawPeak(compCenter, '#10b981', lang === 'zh' ? 'NVM 校準後' : 'Trimmed');

    // Axes
    ctx.fillStyle = '#64748b';
    ctx.font = "500 9px 'IBM Plex Mono', monospace";
    ctx.fillText('0.0 (T)', padding.left - 45, padding.top + chartH);
    ctx.fillText('1.0 (T)', padding.left - 45, padding.top + 8);

    ctx.fillText('-2.5 nm', padding.left, height - 12);
    ctx.fillText('λ0 (1310 nm)', padding.left + chartW * 0.5 - 28, height - 12);
    ctx.fillText('+2.5 nm', padding.left + chartW - 35, height - 12);

  } else {
    // Mode 2: DAC Resolution vs Extinction Ratio & Power Tradeoff
    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();
    }

    // Draw ER Curve (dB, Y: 0 to 30 dB)
    ctx.beginPath();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.5;

    const points = [];
    for (let b = 6; b <= 14; b++) {
      const m = calculateCpoTrimMetrics('cpo_switch_51t_coupe', 'ld_mtp_closed_loop', metrics.deltaTC, b, metrics.channelCount);
      const x = padding.left + ((b - 6) / 8.0) * chartW;
      const yRatio = Math.max(0, Math.min(1, m.extinctionRatioDb / 30.0));
      const y = padding.top + chartH - (yRatio * chartH);
      points.push({ x, y, b, er: m.extinctionRatioDb });
      if (b === 6) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(34, 211, 238, 0.08)';
    ctx.fill();

    // Plot current operating point
    const currX = padding.left + ((metrics.dacBits - 6) / 8.0) * chartW;
    const currYRatio = Math.max(0, Math.min(1, metrics.extinctionRatioDb / 30.0));
    const currY = padding.top + chartH - (currYRatio * chartH);

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(currX, currY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = "700 10px 'IBM Plex Mono', monospace";
    ctx.fillText(`${metrics.extinctionRatioDb.toFixed(1)} dB`, currX + 8, currY - 6);

    // Y Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = "500 9px 'IBM Plex Mono', monospace";
    ctx.fillText('30 dB', padding.left - 38, padding.top + 8);
    ctx.fillText('15 dB', padding.left - 38, padding.top + chartH * 0.5);
    ctx.fillText('0 dB', padding.left - 32, padding.top + chartH);

    // X Axis Labels
    ctx.fillText('6-bit', padding.left, height - 12);
    ctx.fillText('10-bit', padding.left + chartW * 0.5 - 12, height - 12);
    ctx.fillText('14-bit', padding.left + chartW - 24, height - 12);
  }

  ctx.restore();
}

/**
 * Initializes the CPO optical trim simulator inside its DOM container.
 * @param {string} rootId - Container element ID.
 */
export function initCpoTrimSimulator(rootId = 'cpo-optical-trim-simulator-root') {
  const container = document.getElementById(rootId);
  if (!container) return;

  const presetSelect = container.querySelector('#cpo-trim-preset-select');
  const policySelect = container.querySelector('#cpo-trim-policy-select');
  const tempSlider = container.querySelector('#cpo-trim-temp-slider');
  const dacSlider = container.querySelector('#cpo-trim-dac-slider');
  const channelsSlider = container.querySelector('#cpo-trim-channels-slider');

  const tempVal = container.querySelector('#cpo-trim-temp-val');
  const dacVal = container.querySelector('#cpo-trim-dac-val');
  const channelsVal = container.querySelector('#cpo-trim-channels-val');

  const outDrift = container.querySelector('#cpo-trim-out-drift');
  const outPhase = container.querySelector('#cpo-trim-out-phase');
  const outEr = container.querySelector('#cpo-trim-out-er');
  const outPower = container.querySelector('#cpo-trim-out-power');
  const outRating = container.querySelector('#cpo-trim-out-rating');
  const outVerdict = container.querySelector('#cpo-trim-out-verdict');

  const canvas = container.querySelector('#cpo-trim-canvas');
  const modeSpectrumBtn = container.querySelector('#cpo-trim-mode-spectrum');
  const modeDacBtn = container.querySelector('#cpo-trim-mode-dac');

  let currentMode = 'spectrum_shift';

  function getLanguage() {
    return document.documentElement.getAttribute('data-language') === 'zh' ? 'zh' : 'en';
  }

  function update() {
    const presetKey = presetSelect ? presetSelect.value : 'cpo_switch_51t_coupe';
    const policyKey = policySelect ? policySelect.value : 'ld_mtp_closed_loop';
    const deltaTC = tempSlider ? parseFloat(tempSlider.value) : 45.0;
    const dacBits = dacSlider ? parseInt(dacSlider.value, 10) : 10;
    const channels = channelsSlider ? parseInt(channelsSlider.value, 10) : 64;

    if (tempVal) tempVal.textContent = `${deltaTC.toFixed(0)} °C`;
    if (dacVal) dacVal.textContent = `${dacBits} bits`;
    if (channelsVal) channelsVal.textContent = `${channels} ch`;

    const metrics = calculateCpoTrimMetrics(presetKey, policyKey, deltaTC, dacBits, channels);

    if (outDrift) {
      outDrift.textContent = `+${metrics.wavelengthDriftNm.toFixed(2)} nm`;
      outDrift.style.color = metrics.wavelengthDriftNm <= 1.5 ? '#22d3ee' : '#f87171';
    }
    if (outPhase) {
      outPhase.textContent = `${metrics.rawPhaseDriftRad.toFixed(2)} rad`;
    }
    if (outEr) {
      outEr.textContent = `${metrics.extinctionRatioDb.toFixed(1)} dB`;
      outEr.style.color = metrics.extinctionRatioDb >= 12.0 ? '#34d399' : (metrics.extinctionRatioDb >= 8.0 ? '#fbbf24' : '#f87171');
    }
    if (outPower) {
      outPower.textContent = `${metrics.savedTuningPowerW.toFixed(2)} W (${metrics.powerSavingsPct.toFixed(0)}%)`;
      outPower.style.color = '#38bdf8';
    }
    if (outRating) {
      outRating.textContent = metrics.rating;
      outRating.style.color = metrics.rating === 'OPTIMAL' ? '#34d399' : (metrics.rating === 'VIABLE' ? '#fbbf24' : '#f87171');
    }
    if (outVerdict) {
      const lang = getLanguage();
      outVerdict.textContent = lang === 'zh' ? metrics.verdictZh : metrics.verdictEn;
    }

    if (canvas) {
      drawCpoTrimCanvas(canvas, metrics, currentMode, getLanguage());
    }
  }

  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const p = CPO_TRIM_SYSTEM_PRESETS[presetSelect.value];
      if (p) {
        if (tempSlider) tempSlider.value = p.defaultDeltaTC;
        if (dacSlider) dacSlider.value = p.defaultDacBits;
        if (channelsSlider) channelsSlider.value = p.defaultChannels;
      }
      update();
    });
  }

  if (policySelect) policySelect.addEventListener('change', update);
  if (tempSlider) tempSlider.addEventListener('input', update);
  if (dacSlider) dacSlider.addEventListener('input', update);
  if (channelsSlider) channelsSlider.addEventListener('input', update);

  if (modeSpectrumBtn && modeDacBtn) {
    modeSpectrumBtn.addEventListener('click', () => {
      currentMode = 'spectrum_shift';
      modeSpectrumBtn.classList.add('active');
      modeSpectrumBtn.setAttribute('aria-pressed', 'true');
      modeSpectrumBtn.style.background = '#0284c7';
      modeSpectrumBtn.style.color = '#ffffff';
      modeSpectrumBtn.style.borderColor = '#38bdf8';

      modeDacBtn.classList.remove('active');
      modeDacBtn.setAttribute('aria-pressed', 'false');
      modeDacBtn.style.background = '#1e293b';
      modeDacBtn.style.color = '#94a3b8';
      modeDacBtn.style.borderColor = '#475569';
      update();
    });

    modeDacBtn.addEventListener('click', () => {
      currentMode = 'dac_er_tradeoff';
      modeDacBtn.classList.add('active');
      modeDacBtn.setAttribute('aria-pressed', 'true');
      modeDacBtn.style.background = '#059669';
      modeDacBtn.style.color = '#ffffff';
      modeDacBtn.style.borderColor = '#34d399';

      modeSpectrumBtn.classList.remove('active');
      modeSpectrumBtn.setAttribute('aria-pressed', 'false');
      modeSpectrumBtn.style.background = '#1e293b';
      modeSpectrumBtn.style.color = '#94a3b8';
      modeSpectrumBtn.style.borderColor = '#475569';
      update();
    });
  }

  const observer = new MutationObserver(() => update());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-language'] });
  window.addEventListener('resize', update);

  update();
}

// Auto boot
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initCpoTrimSimulator());
  } else {
    initCpoTrimSimulator();
  }
}
