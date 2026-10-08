/**
 * @file automotive-asild-ecc-simulator.js
 * @description First-principles simulator for ISO 26262 ASIL-D transient soft-error FIT rate,
 * cosmic neutron flux scaling with altitude, ECC syndrome diagnostic coverage (SPFM/LFM),
 * and periodic memory scrubbing optimization.
 * @version 1.0.0
 * @license MIT
 */

/**
 * @typedef {Object} AutomotiveMissionProfile
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {number} altitudeM - Altitude above sea level (meters)
 * @property {number} ambientTempC - Ambient operating temperature (°C)
 * @property {number} targetFitBudget - ASIL hardware metric FIT budget
 * @property {string} asilTarget - Target ASIL level (ASIL-D, ASIL-C, ASIL-B)
 * @property {string} descZh
 * @property {string} descEn
 */

/**
 * @typedef {Object} AutomotiveNvmProfile
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {number} rawNeutronFitPerMb - Base sea-level neutron soft error rate (FIT/Mb)
 * @property {number} rawAlphaFitPerMb - Package alpha particle soft error rate (FIT/Mb)
 * @property {number} thermalActivationEv - Thermal failure activation energy (eV)
 * @property {string} physicalNatureZh
 * @property {string} physicalNatureEn
 */

/**
 * Standard Automotive Mission Profiles (ISO 26262 ASIL targets)
 * @type {Record<string, AutomotiveMissionProfile>}
 */
export const AUTO_MISSION_PROFILES = {
  powertrain_inverter_asild: {
    id: 'powertrain_inverter_asild',
    nameZh: '電動車動力主驅逆變器 (ASIL-D / 高溫苛刻)',
    nameEn: 'EV Main Traction Inverter (ASIL-D High-Temp)',
    altitudeM: 1500, // Alpine highway
    ambientTempC: 125,
    targetFitBudget: 10, // < 10 FIT for ASIL-D PMHF
    asilTarget: 'ASIL-D',
    descZh: '主驅馬達反饋控制，最高功能安全要求，125°C 接面溫升與高山公路中子通量。',
    descEn: 'Traction motor servo control, highest safety target, 125°C junction temp and alpine neutron flux.'
  },
  adas_domain_controller: {
    id: 'adas_domain_controller',
    nameZh: '自駕 ADAS 集中式運算網關 (ASIL-D / 航太高空測試)',
    nameEn: 'Autonomous ADAS Domain Controller (ASIL-D)',
    altitudeM: 3000, // High mountain test pass
    ambientTempC: 85,
    targetFitBudget: 10,
    asilTarget: 'ASIL-D',
    descZh: 'L3/L4 自動駕駛感知決策單元，大容量神經網路與高海拔大氣宇宙射線中子通量。',
    descEn: 'L3/L4 perception and fusion brain, large model footprint under high-altitude cosmic neutron flux.'
  },
  battery_management_asild: {
    id: 'battery_management_asild',
    nameZh: '車載電池管理系統 BMS (ASIL-D / 長效待命)',
    nameEn: 'Battery Management System BMS (ASIL-D)',
    altitudeM: 500,
    ambientTempC: 65,
    targetFitBudget: 10,
    asilTarget: 'ASIL-D',
    descZh: '電芯電壓電流監控與安全關斷，要求極低潛伏故障 (LFM > 90%) 與高週期巡檢。',
    descEn: 'Cell voltage monitoring and emergency disconnect, requiring low latent faults and scrubbing.'
  },
  gateway_telematics_asilb: {
    id: 'gateway_telematics_asilb',
    nameZh: '車載中央網關與車聯網 (ASIL-B 控制組)',
    nameEn: 'Central Gateway & Telematics (ASIL-B Baseline)',
    altitudeM: 100,
    ambientTempC: 50,
    targetFitBudget: 100, // < 100 FIT for ASIL-B
    asilTarget: 'ASIL-B',
    descZh: '車聯網 OTA 路由與通訊網關，ASIL-B 基準對比，容許較高殘餘 FIT。',
    descEn: 'V2X OTA routing and body gateway, ASIL-B comparative control with relaxed FIT.'
  }
};

/**
 * Memory Bitcell Soft Error Profiles
 * @type {Record<string, AutomotiveNvmProfile>}
 */
export const AUTO_NVM_PROFILES = {
  antifuse_charge_free: {
    id: 'antifuse_charge_free',
    nameZh: 'AntiFuse OTP (無電荷儲存 / 固態微絲天然抗中子翻轉)',
    nameEn: 'AntiFuse OTP (Zero-Charge / Ohmic Filament SEU Immune)',
    rawNeutronFitPerMb: 0.05, // Negligible: no dielectric charge packet to flip
    rawAlphaFitPerMb: 0.01,
    thermalActivationEv: 1.95,
    physicalNatureZh: '破壞性崩潰歐姆微絲：無電容電荷封包，宇宙射線重離子與中子完全無法翻轉位元。',
    physicalNatureEn: 'Permanent ohmic filament: zero floating charge, virtually immune to cosmic neutron SEU.'
  },
  radhard_stt_mram: {
    id: 'radhard_stt_mram',
    nameZh: '車用 STT-MRAM (磁穿隧接面 MTJ / 極低 SER)',
    nameEn: 'Automotive STT-MRAM (MTJ Magnetic / Low SER)',
    rawNeutronFitPerMb: 2.5,
    rawAlphaFitPerMb: 0.5,
    thermalActivationEv: 1.30,
    physicalNatureZh: '自旋磁矩狀態記憶：介電層電荷游離不影響磁化方向，僅外圍 CMOS 電路有微弱翻轉機率。',
    physicalNatureEn: 'Spin magnetic states: ionization does not flip magnetization; only peripheral CMOS is prone.'
  },
  embedded_flash_sg: {
    id: 'embedded_flash_sg',
    nameZh: '車規 Split-Gate eFlash (電荷穿隧浮閘 / 中度敏感)',
    nameEn: 'Split-Gate eFlash (Charge Tunneling / Moderate SER)',
    rawNeutronFitPerMb: 45.0,
    rawAlphaFitPerMb: 15.0,
    thermalActivationEv: 1.10,
    physicalNatureZh: '多晶矽浮閘儲存電荷：高能中子次級核反應產生游離電洞，中度機率中和浮閘電荷。',
    physicalNatureEn: 'Polysilicon floating gate: nuclear spallation generates holes neutralizing stored electrons.'
  },
  embedded_sram_sub20nm: {
    id: 'embedded_sram_sub20nm',
    nameZh: '先進節點 eSRAM 緩存 (微小節點電容 / 高度中子翻轉敏感)',
    nameEn: 'Advanced eSRAM (Sub-20nm / Highly Sensitive to SEU)',
    rawNeutronFitPerMb: 650.0, // High raw SER per megabit
    rawAlphaFitPerMb: 120.0,
    thermalActivationEv: 0.85,
    physicalNatureZh: '6T 正回授反相器：極微小節點電容 Qcrit，大氣快中子碰撞矽核釋放離子極易翻轉邏輯態。',
    physicalNatureEn: '6T cross-coupled inverter: tiny Qcrit charge, highly vulnerable to atmospheric fast neutrons.'
  }
};

/**
 * ECC Diagnostic Architectures
 * @type {Record<string, { id: string, nameZh: string, nameEn: string, spfmBase: number, mcuProtectionRatio: number, descZh: string, descEn: string }>}
 */
export const ECC_ARCHITECTURES = {
  secded_72_64: {
    id: 'secded_72_64',
    nameZh: 'SEC-DED (72, 64) 延伸漢明碼 (單錯糾正 / 雙錯中斷)',
    nameEn: 'SEC-DED (72, 64) Extended Hamming (1-Bit Correct / 2-Bit Detect)',
    spfmBase: 99.4, // SPFM ~ 99.4%
    mcuProtectionRatio: 0.008, // Residual Multi-Cell Upset leak
    descZh: '單一位元翻轉 100% 硬體自動糾正；雙位元翻轉 100% 觸發安全中斷；殘餘未檢出率極低。',
    descEn: '1-bit flips 100% corrected; 2-bit flips detected as safety trap; minimal undetected residual.'
  },
  chipkill_reed_solomon: {
    id: 'chipkill_reed_solomon',
    nameZh: 'Chipkill / Reed-Solomon (多符號糾正 / 超級安全)',
    nameEn: 'Chipkill / Reed-Solomon (Multi-Symbol Burst Correction)',
    spfmBase: 99.98,
    mcuProtectionRatio: 0.0001,
    descZh: '符號級（4-bit / 8-bit Symbol）錯誤糾正，可容忍相鄰多單元爆發性翻轉（MCU）。',
    descEn: 'Symbol-based burst error correction, tolerating clustered Multi-Cell Upsets (MCU).'
  },
  parity_only: {
    id: 'parity_only',
    nameZh: '單純同位檢查 (Parity Only / 僅單錯檢測無糾正)',
    nameEn: 'Parity Only (Detection Only / Zero Correction)',
    spfmBase: 91.0,
    mcuProtectionRatio: 0.50,
    descZh: '僅能檢測奇數錯誤，無法糾錯且雙錯完全失效，通常難以單獨達成 ASIL-D 要求。',
    descEn: 'Detects odd-bit errors only; zero correction; fails on even errors; inadequate for ASIL-D.'
  },
  none: {
    id: 'none',
    nameZh: '無硬體 ECC (No ECC / 未防護基準組)',
    nameEn: 'No Hardware ECC (Unprotected Baseline)',
    spfmBase: 0.0,
    mcuProtectionRatio: 1.0,
    descZh: '無任何防護，所有翻轉直接演化為單點故障，殘餘 FIT 等同 Raw FIT。',
    descEn: 'Zero protection; all raw flips manifest as Single Point Faults (SPF).'
  }
};

/**
 * First-principles constants for atmospheric neutrons
 */
export const ATMOSPHERIC_NEUTRON_CONSTANTS = {
  SEA_LEVEL_FLUX: 14.0, // n / (cm2 * h) for E > 10 MeV at sea level NYC
  SCALE_HEIGHT_M: 1500.0, // Atmospheric attenuation scale height (m)
  BOLTZMANN_EV: 8.617333262145e-5
};

/**
 * Calculate ISO 26262 ASIL-D soft error FIT, SPFM, LFM, and scrubbing metrics
 * @param {Object} params
 * @param {string} params.missionId
 * @param {string} params.nvmId
 * @param {string} params.eccId
 * @param {number} params.arrayCapacityMb - Memory capacity in Megabits (Mb)
 * @param {number} params.scrubbingPeriodSec - Memory scrubbing interval (seconds)
 * @param {number} params.customAltitudeM - Altitude in meters
 * @returns {Object} Comprehensive calculation results
 */
export function calculateAutomotiveAsilMetrics({
  missionId = 'powertrain_inverter_asild',
  nvmId = 'antifuse_charge_free',
  eccId = 'secded_72_64',
  arrayCapacityMb = 16.0,
  scrubbingPeriodSec = 60.0,
  customAltitudeM = 1500.0
}) {
  const mission = AUTO_MISSION_PROFILES[missionId] || AUTO_MISSION_PROFILES.powertrain_inverter_asild;
  const nvm = AUTO_NVM_PROFILES[nvmId] || AUTO_NVM_PROFILES.antifuse_charge_free;
  const ecc = ECC_ARCHITECTURES[eccId] || ECC_ARCHITECTURES.secded_72_64;

  const altitudeM = customAltitudeM !== undefined ? customAltitudeM : mission.altitudeM;

  // 1. Cosmic Ray Fast Neutron Flux Scaling
  // Neutron flux increases exponentially with altitude: Flux(h) / Flux(0) ~ exp(h / 1500m)
  const neutronFluxFactor = Math.min(350.0, Math.exp(altitudeM / ATMOSPHERIC_NEUTRON_CONSTANTS.SCALE_HEIGHT_M));

  // 2. Raw Soft Error Rate Calculation
  // Raw FIT = (rawNeutron * FluxFactor + rawAlpha) * capacityMb
  const rawNeutronFit = nvm.rawNeutronFitPerMb * neutronFluxFactor * arrayCapacityMb;
  const rawAlphaFit = nvm.rawAlphaFitPerMb * arrayCapacityMb;
  const rawTotalFit = rawNeutronFit + rawAlphaFit;

  // 3. ECC Protection & Residual Single Point Fault (SPF) FIT
  // Residual FIT = RawFIT * mcuProtectionRatio + Double-accumulation during scrub interval
  // Rate of double bit accumulation = 0.5 * (RawFIT_per_bit)^2 * t_scrub
  const rawFitPerWord = (rawTotalFit / arrayCapacityMb) * (64.0 / (1024.0 * 1024.0)); // FIT per 64-bit word
  const accumulationDoubleFit = 0.5 * rawFitPerWord * rawFitPerWord * (scrubbingPeriodSec / 3600.0) * (arrayCapacityMb * 1024.0 * 1024.0 / 64.0);

  let residualFit = 0.0;
  let spfmMetric = 0.0;

  if (ecc.id === 'none') {
    residualFit = rawTotalFit;
    spfmMetric = 0.0;
  } else if (ecc.id === 'parity_only') {
    // Parity detects odd errors, but cannot correct
    residualFit = rawTotalFit * 0.09; // 91% SPFM
    spfmMetric = 91.0;
  } else {
    residualFit = (rawTotalFit * ecc.mcuProtectionRatio) + accumulationDoubleFit;
    spfmMetric = Math.min(99.999, Math.max(0, 100.0 - (residualFit / Math.max(1e-4, rawTotalFit)) * 100.0));
  }

  // 4. Latent Fault Metric (LFM) determined by scrubbing frequency
  // Long scrubbing interval allows single faults to accumulate into undetectable multi-faults
  // LFM drops if scrubbing > 3600 seconds
  const scrubHours = scrubbingPeriodSec / 3600.0;
  const lfmDegradation = Math.min(30.0, scrubHours * 5.0);
  const lfmMetric = ecc.id === 'none' ? 0.0 : Math.max(50.0, Math.min(98.5, 96.5 - lfmDegradation));

  // 5. ASIL-D Compliance Evaluation
  // ASIL-D criteria: SPFM >= 99%, LFM >= 90%, Residual PMHF FIT < 10
  const isSpfmCompliant = spfmMetric >= 99.0;
  const isLfmCompliant = lfmMetric >= 90.0;
  const isFitCompliant = residualFit <= mission.targetFitBudget;

  let achievedAsil = 'QM (Unmet)';
  let asilColor = '#ef4444';
  let verdictZh = '';
  let verdictEn = '';

  if (isSpfmCompliant && isLfmCompliant && isFitCompliant) {
    achievedAsil = 'ISO 26262 ASIL-D Verified';
    asilColor = '#10b981';
    verdictZh = `合規：殘餘 FIT 僅 ${residualFit.toFixed(2)} (< ${mission.targetFitBudget})，單點故障度量 SPFM 達 ${spfmMetric.toFixed(2)}% (≥ 99%)，潛伏故障度量 LFM 達 ${lfmMetric.toFixed(1)}% (≥ 90%)。完全符合 ISO 26262 ASIL-D 汽車最高安全完整性。`;
    verdictEn = `Compliant: Residual FIT is ${residualFit.toFixed(2)} (< ${mission.targetFitBudget}), SPFM reaches ${spfmMetric.toFixed(2)}% (≥ 99%), and LFM reaches ${lfmMetric.toFixed(1)}% (≥ 90%). Fully satisfies ISO 26262 ASIL-D safety requirements.`;
  } else if (spfmMetric >= 90.0 && residualFit <= 100.0) {
    achievedAsil = 'ISO 26262 ASIL-B Qualified';
    asilColor = '#f59e0b';
    verdictZh = `降級合規：殘餘 FIT 為 ${residualFit.toFixed(1)}，SPFM 為 ${spfmMetric.toFixed(1)}%，未達 ASIL-D 嚴苛門檻 (SPFM ≥ 99%, FIT < 10)，但符合 ASIL-B 要求。建議縮短巡檢週期或採用更高等級 ECC。`;
    verdictEn = `Marginal: Residual FIT is ${residualFit.toFixed(1)}, SPFM is ${spfmMetric.toFixed(1)}%, failing ASIL-D threshold (SPFM ≥ 99%, FIT < 10) but passing ASIL-B. Recommend faster scrubbing or advanced ECC.`;
  } else {
    achievedAsil = 'Safety Violation Unmet';
    asilColor = '#ef4444';
    verdictZh = `違規：殘餘 FIT 高達 ${residualFit.toFixed(1)} (預算 < ${mission.targetFitBudget})！SPFM 僅 ${spfmMetric.toFixed(1)}%，大氣中子翻轉引發嚴重單點故障 (SPF)，無法部署於車載動力或自駕系統。`;
    verdictEn = `Violation: Residual FIT is ${residualFit.toFixed(1)} (budget < ${mission.targetFitBudget})! SPFM is only ${spfmMetric.toFixed(1)}%, causing unacceptable Single Point Faults (SPF). Unsuitable for automotive safety.`;
  }

  return {
    mission,
    nvm,
    ecc,
    altitudeM,
    arrayCapacityMb,
    scrubbingPeriodSec,
    neutronFluxFactor,
    rawNeutronFit,
    rawAlphaFit,
    rawTotalFit,
    accumulationDoubleFit,
    residualFit,
    spfmMetric,
    lfmMetric,
    isSpfmCompliant,
    isLfmCompliant,
    isFitCompliant,
    achievedAsil,
    asilColor,
    verdictZh,
    verdictEn
  };
}

/**
 * Draw Automotive ASIL-D soft error and ECC curves onto Canvas
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'scrub_period_vs_residual_fit' | 'altitude_neutron_fit_curve'} mode
 */
export function drawAutomotiveAsilCanvas(canvas, metrics, mode = 'scrub_period_vs_residual_fit') {
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

  // Background - Essential clearRect to ensure clean redraw and no accumulation
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#060d17';
  ctx.fillRect(0, 0, width, height);

  const padLeft = 52;
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

  if (mode === 'scrub_period_vs_residual_fit') {
    // Mode 1: Memory Scrubbing Period (1s to 3600s, log scale) vs Residual FIT Rate
    const tMinLog = 0.0; // 10^0 = 1 sec
    const tMaxLog = 3.6; // 10^3.6 ~ 4000 sec

    // ASIL-D threshold line at 10 FIT
    const asilDY = padTop + plotH * (1.0 - Math.min(1.0, 10.0 / 100.0));
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, asilDY);
    ctx.lineTo(padLeft + plotW, asilDY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve
    ctx.strokeStyle = metrics.residualFit <= 10 ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let xPix = 0; xPix <= plotW; xPix++) {
      const logSec = tMinLog + (xPix / plotW) * (tMaxLog - tMinLog);
      const sec = Math.pow(10, logSec);

      const testRes = calculateAutomotiveAsilMetrics({
        missionId: metrics.mission.id,
        nvmId: metrics.nvm.id,
        eccId: metrics.ecc.id,
        arrayCapacityMb: metrics.arrayCapacityMb,
        scrubbingPeriodSec: sec,
        customAltitudeM: metrics.altitudeM
      });

      // Map 0 to 50 FIT
      const normY = Math.max(0, Math.min(1, testRes.residualFit / 50.0));
      const yPix = padTop + plotH * (1.0 - normY);
      if (xPix === 0) ctx.moveTo(padLeft + xPix, yPix);
      else ctx.lineTo(padLeft + xPix, yPix);
    }
    ctx.stroke();

    // Current point
    const currentLog = Math.log10(Math.max(1, metrics.scrubbingPeriodSec));
    const currentX = padLeft + ((currentLog - tMinLog) / (tMaxLog - tMinLog)) * plotW;
    const currentNormY = Math.max(0, Math.min(1, metrics.residualFit / 50.0));
    const currentY = padTop + plotH * (1.0 - currentNormY);

    ctx.fillStyle = metrics.residualFit <= 10 ? '#10b981' : '#ef4444';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('1s', padLeft, height - 10);
    ctx.fillText('60s (Scrub)', padLeft + plotW * 0.45 - 20, height - 10);
    ctx.fillText('3600s (1h)', padLeft + plotW - 55, height - 10);

    ctx.fillStyle = '#ef4444';
    ctx.fillText('ASIL-D Gate (10 FIT)', padLeft + 6, asilDY - 4);
    ctx.fillStyle = '#10b981';
    ctx.fillText(`Residual: ${metrics.residualFit.toFixed(2)} FIT (SPFM: ${metrics.spfmMetric.toFixed(2)}%)`, padLeft + 140, padTop + 14);

  } else {
    // Mode 2: Altitude (0m to 12,000m) vs Raw Neutron Soft Error FIT Rate
    const altMin = 0.0;
    const altMax = 12000.0;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let xPix = 0; xPix <= plotW; xPix++) {
      const alt = altMin + (xPix / plotW) * (altMax - altMin);
      const testRes = calculateAutomotiveAsilMetrics({
        missionId: metrics.mission.id,
        nvmId: metrics.nvm.id,
        eccId: metrics.ecc.id,
        arrayCapacityMb: metrics.arrayCapacityMb,
        scrubbingPeriodSec: metrics.scrubbingPeriodSec,
        customAltitudeM: alt
      });

      // Map 0 to max FIT scale
      const maxFitScale = Math.max(100.0, metrics.rawTotalFit * 1.5);
      const normY = Math.max(0, Math.min(1, testRes.rawTotalFit / maxFitScale));
      const yPix = padTop + plotH * (1.0 - normY);
      if (xPix === 0) ctx.moveTo(padLeft + xPix, yPix);
      else ctx.lineTo(padLeft + xPix, yPix);
    }
    ctx.stroke();

    // Current point
    const currentX = padLeft + ((metrics.altitudeM - altMin) / (altMax - altMin)) * plotW;
    const maxFitScale = Math.max(100.0, metrics.rawTotalFit * 1.5);
    const currentNormY = Math.max(0, Math.min(1, metrics.rawTotalFit / maxFitScale));
    const currentY = padTop + plotH * (1.0 - currentNormY);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('0m (Sea Level)', padLeft, height - 10);
    ctx.fillText('4000m (Alpine)', padLeft + plotW * 0.33, height - 10);
    ctx.fillText('12,000m (Aviation)', padLeft + plotW - 90, height - 10);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Raw SER @ ${metrics.altitudeM}m: ${metrics.rawTotalFit.toFixed(1)} FIT (${metrics.neutronFluxFactor.toFixed(1)}x Neutron Flux)`, padLeft + 6, padTop + 14);
  }

  ctx.restore();
}

/**
 * Initialize Automotive ASIL-D Soft Error & ECC Simulator DOM bindings
 * @param {string} rootSelector
 */
export function initAutomotiveAsilSimulator(rootSelector = '#auto-asild-simulator-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const missionSelect = root.querySelector('#asild-mission-select');
  const nvmSelect = root.querySelector('#asild-nvm-select');
  const eccSelect = root.querySelector('#asild-ecc-select');
  const altitudeSlider = root.querySelector('#asild-altitude-slider');
  const capacitySlider = root.querySelector('#asild-capacity-slider');
  const scrubSlider = root.querySelector('#asild-scrub-slider');

  const altitudeVal = root.querySelector('#asild-altitude-val');
  const capacityVal = root.querySelector('#asild-capacity-val');
  const scrubVal = root.querySelector('#asild-scrub-val');

  const outRawFit = root.querySelector('#asild-out-rawfit');
  const outResidualFit = root.querySelector('#asild-out-residualfit');
  const outSpfm = root.querySelector('#asild-out-spfm');
  const outLfm = root.querySelector('#asild-out-lfm');
  const outAsilRating = root.querySelector('#asild-out-rating');
  const outVerdict = root.querySelector('#asild-out-verdict');

  const canvas = root.querySelector('#asild-canvas');
  const modeScrubBtn = root.querySelector('#asild-mode-scrub');
  const modeAltBtn = root.querySelector('#asild-mode-altitude');

  let currentMode = 'scrub_period_vs_residual_fit';

  function update() {
    const isZh = document.documentElement.lang.startsWith('zh');
    const missionId = missionSelect ? missionSelect.value : 'powertrain_inverter_asild';
    const nvmId = nvmSelect ? nvmSelect.value : 'antifuse_charge_free';
    const eccId = eccSelect ? eccSelect.value : 'secded_72_64';
    const customAltitudeM = altitudeSlider ? parseFloat(altitudeSlider.value) : 1500.0;
    const arrayCapacityMb = capacitySlider ? parseFloat(capacitySlider.value) : 16.0;
    const scrubbingPeriodSec = scrubSlider ? parseFloat(scrubSlider.value) : 60.0;

    if (altitudeVal) altitudeVal.textContent = `${customAltitudeM} m`;
    if (capacityVal) capacityVal.textContent = `${arrayCapacityMb} Mb`;
    if (scrubVal) scrubVal.textContent = `${scrubbingPeriodSec} s`;

    if (altitudeSlider) altitudeSlider.setAttribute('aria-valuetext', `${customAltitudeM} m`);
    if (capacitySlider) capacitySlider.setAttribute('aria-valuetext', `${arrayCapacityMb} Mb`);
    if (scrubSlider) scrubSlider.setAttribute('aria-valuetext', `${scrubbingPeriodSec} s`);

    const metrics = calculateAutomotiveAsilMetrics({
      missionId,
      nvmId,
      eccId,
      arrayCapacityMb,
      scrubbingPeriodSec,
      customAltitudeM
    });

    if (outRawFit) outRawFit.textContent = `${metrics.rawTotalFit.toFixed(1)} FIT`;
    if (outResidualFit) {
      outResidualFit.textContent = `${metrics.residualFit.toFixed(2)} FIT`;
      outResidualFit.style.color = metrics.residualFit <= 10 ? '#10b981' : '#ef4444';
    }
    if (outSpfm) {
      outSpfm.textContent = `${metrics.spfmMetric.toFixed(2)} %`;
      outSpfm.style.color = metrics.spfmMetric >= 99.0 ? '#10b981' : '#f59e0b';
    }
    if (outLfm) {
      outLfm.textContent = `${metrics.lfmMetric.toFixed(1)} %`;
      outLfm.style.color = metrics.lfmMetric >= 90.0 ? '#10b981' : '#f59e0b';
    }

    if (outAsilRating) {
      outAsilRating.textContent = metrics.achievedAsil;
      outAsilRating.style.color = metrics.asilColor;
    }

    if (outVerdict) {
      outVerdict.textContent = isZh ? metrics.verdictZh : metrics.verdictEn;
    }

    if (canvas) {
      drawAutomotiveAsilCanvas(canvas, metrics, currentMode);
    }
  }

  if (missionSelect) missionSelect.addEventListener('change', () => {
    const prof = AUTO_MISSION_PROFILES[missionSelect.value];
    if (prof && altitudeSlider) {
      altitudeSlider.value = prof.altitudeM;
    }
    update();
  });

  if (nvmSelect) nvmSelect.addEventListener('change', update);
  if (eccSelect) eccSelect.addEventListener('change', update);
  if (altitudeSlider) altitudeSlider.addEventListener('input', update);
  if (capacitySlider) capacitySlider.addEventListener('input', update);
  if (scrubSlider) scrubSlider.addEventListener('input', update);

  if (modeScrubBtn && modeAltBtn) {
    modeScrubBtn.addEventListener('click', () => {
      currentMode = 'scrub_period_vs_residual_fit';
      modeScrubBtn.classList.add('active');
      modeScrubBtn.setAttribute('aria-pressed', 'true');
      modeAltBtn.classList.remove('active');
      modeAltBtn.setAttribute('aria-pressed', 'false');
      modeScrubBtn.style.background = '#0284c7';
      modeScrubBtn.style.borderColor = '#38bdf8';
      modeScrubBtn.style.color = '#ffffff';
      modeAltBtn.style.background = '#1e293b';
      modeAltBtn.style.borderColor = '#475569';
      modeAltBtn.style.color = '#94a3b8';
      update();
    });

    modeAltBtn.addEventListener('click', () => {
      currentMode = 'altitude_neutron_fit_curve';
      modeAltBtn.classList.add('active');
      modeAltBtn.setAttribute('aria-pressed', 'true');
      modeScrubBtn.classList.remove('active');
      modeScrubBtn.setAttribute('aria-pressed', 'false');
      modeAltBtn.style.background = '#0284c7';
      modeAltBtn.style.borderColor = '#38bdf8';
      modeAltBtn.style.color = '#ffffff';
      modeScrubBtn.style.background = '#1e293b';
      modeScrubBtn.style.borderColor = '#475569';
      modeScrubBtn.style.color = '#94a3b8';
      update();
    });
  }

  // Language observer
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
    document.addEventListener('DOMContentLoaded', () => initAutomotiveAsilSimulator());
  } else {
    initAutomotiveAsilSimulator();
  }
}
