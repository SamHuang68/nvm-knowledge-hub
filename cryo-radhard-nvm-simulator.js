/**
 * @fileoverview Cryogenic Extreme & Radiation-Hardened Space eNVM Physical Simulator
 * 
 * First-principles simulation of eNVM physical behavior across cryogenic temperatures
 * (4.2K liquid helium to 77K liquid nitrogen) and extreme radiation environments
 * (LEO satellite constellations, Jupiter deep-space missions, and automotive 175°C).
 * 
 * Physics Foundations:
 * 1. Low-temperature carrier freeze-out & incomplete impurity ionization:
 *    n(T) ∝ Nc(T) * exp(-ΔEd / (2*kB*T)), where Nc(T) ∝ T^(3/2).
 * 2. Threshold voltage temperature shift:
 *    Vth(T) = Vth,300K + αT * (300 - T).
 * 3. Total Ionizing Dose (TID) trapped charge accumulation:
 *    ΔVth,tid = -(q * ΔNot) / Cox + (q * ΔNit) / Cox ∝ βtid * ln(1 + TID / D0).
 * 4. Weibull heavy-ion Single Event Upset (SEU) cross-section:
 *    σ(LET) = σsat * [1 - exp(-((LET - LETth) / W)^s)] for LET > LETth; otherwise 0.
 * 5. Physical filament immunity in AntiFuse vs charge neutralization in Floating Gate.
 * 
 * @author SamHuang68
 * @license MIT
 */

/**
 * Extreme Environment Presets
 * @typedef {Object} CryoEnvironmentPreset
 * @property {string} id
 * @property {number} tempK Temperature in Kelvin
 * @property {number} tempC Temperature in Celsius
 * @property {number} tidKrad Total Ionizing Dose in krad(Si)
 * @property {number} peakLet Peak heavy-ion LET in MeV·cm²/mg
 * @property {{name: string, env: string}} zh Traditional Chinese metadata
 * @property {{name: string, env: string}} en English metadata
 */

export const CRYO_ENVIRONMENT_PRESETS = Object.freeze({
  quantum_cryo_4k: {
    id: 'quantum_cryo_4k',
    tempK: 4.2,
    tempC: -268.95,
    tidKrad: 1.0,
    peakLet: 0.0,
    zh: {
      name: '4.2K 液氦量子位元 CMOS 控制器',
      env: '超導量子位元介面 / 稀釋冷凍機低溫 (4.2K, 載子凍結效應顯著)'
    },
    en: {
      name: '4.2K Liquid-Helium Quantum Cryo-CMOS',
      env: 'Superconducting Qubit Interface / Cryostat Environment (4.2K, Severe Freeze-out)'
    }
  },
  leo_satellite: {
    id: 'leo_satellite',
    tempK: 233.15,
    tempC: -40.0,
    tidKrad: 50.0,
    peakLet: 35.0,
    zh: {
      name: '低地球軌道 (LEO) 商業衛星星座',
      env: '軌道高度 550km / 太陽高能質子與範艾倫俘獲輻射帶 (50 krad)'
    },
    en: {
      name: 'LEO Commercial Satellite Constellation',
      env: '550km Altitude / Solar Protons & Van Allen Trapped Belts (50 krad)'
    }
  },
  deep_space_jupiter: {
    id: 'deep_space_jupiter',
    tempK: 153.15,
    tempC: -120.0,
    tidKrad: 500.0,
    peakLet: 75.0,
    zh: {
      name: '木星極限強輻射深空探測器',
      env: '木星強磁層陷阱輻射 / 銀河宇宙線 (GCR) 重離子鐵核 (500 krad)'
    },
    en: {
      name: 'Jupiter Extreme Radiation Deep Space Probe',
      env: 'Jovian Trapped Radiation / Galactic Cosmic Ray Heavy Ions (500 krad)'
    }
  },
  geothermal_underhood: {
    id: 'geothermal_underhood',
    tempK: 448.15,
    tempC: 175.0,
    tidKrad: 0.0,
    peakLet: 0.0,
    zh: {
      name: '車規引擎艙與極限地熱鑽井',
      env: 'AEC-Q100 Grade 0+ / 高溫長時間連續運轉 (175°C, 零游離輻射)'
    },
    en: {
      name: 'Automotive Under-the-Hood / Geothermal Drilling',
      env: 'AEC-Q100 Grade 0+ / High-Temp Continuous Operation (175°C, No Radiation)'
    }
  }
});

/**
 * eNVM Topology Specifications
 * @typedef {Object} CryoNvmTopology
 * @property {string} id
 * @property {number} baseVdd Nominal VDD in Volts
 * @property {boolean} cryoWorkable Whether programming/read is functional at 4.2K
 * @property {number} maxTidKrad Maximum tolerable TID before failure in krad(Si)
 * @property {number} letThreshold Threshold LET for SEU upset in MeV·cm²/mg
 * @property {number} weibullSat Saturation cross-section in cm²/bit
 * @property {number} weibullW Weibull width parameter in MeV·cm²/mg
 * @property {number} weibullS Weibull shape exponent
 * @property {{name: string, type: string, pros: string, cons: string}} zh Traditional Chinese metadata
 * @property {{name: string, type: string, pros: string, cons: string}} en English metadata
 */

export const CRYO_NVM_TOPOLOGIES = Object.freeze({
  antifuse_radhard: {
    id: 'antifuse_radhard',
    baseVdd: 0.75,
    cryoWorkable: true,
    maxTidKrad: 1200.0,
    letThreshold: 999.0, // Physically immune to heavy-ion upsets
    weibullSat: 0.0,
    weibullW: 1.0,
    weibullS: 1.0,
    zh: {
      name: 'Logic AntiFuse OTP (物理微絲硬化)',
      type: '0-Mask 氧化層硬擊穿導電微絲 (歐姆接觸)',
      pros: '微絲無浮動節點電荷，先天免疫重離子 SEU；4.2K 低溫微絲導電不凍結；TID 耐受超過 1 Mrad。',
      cons: '為單次燒寫 (OTP)，不可於低溫環境下任意覆寫更新。'
    },
    en: {
      name: 'Logic AntiFuse OTP (Filament Hardened)',
      type: '0-Mask Oxide Breakdown Conductive Filament (Ohmic)',
      pros: 'Zero floating-gate charge, intrinsically immune to heavy-ion SEU; filament conducts down to 4.2K; TID exceeds 1 Mrad.',
      cons: 'One-Time Programmable (OTP), runtime overwrite not supported at low temperatures.'
    }
  },
  stt_mram_hardened: {
    id: 'stt_mram_hardened',
    baseVdd: 1.0,
    cryoWorkable: true,
    maxTidKrad: 600.0,
    letThreshold: 62.0,
    weibullSat: 1.2e-9,
    weibullW: 28.0,
    weibullS: 2.2,
    zh: {
      name: 'BEOL STT-MRAM (磁自旋抗輻射)',
      type: '後段金屬自旋轉矩磁性穿隧結 (MTJ)',
      pros: '磁化方向儲存，低溫下自旋極化率增強；抗游離輻射達 600 krad；支援百萬次覆寫。',
      cons: '低溫矯頑場增加導致翻轉電流升高 30%；需外加磁場屏蔽以防太空強磁暴干擾。'
    },
    en: {
      name: 'BEOL STT-MRAM (Spin-Torque Hardened)',
      type: 'BEOL Spin-Transfer Torque Magnetic Tunnel Junction (MTJ)',
      pros: 'Magnetization storage, spin polarization improves at cryo; TID tolerant up to 600 krad; high endurance.',
      cons: 'Cryogenic coercive field increases switching current by ~30%; requires magnetic shielding in space.'
    }
  },
  feram_radhard: {
    id: 'feram_radhard',
    baseVdd: 1.2,
    cryoWorkable: false,
    maxTidKrad: 350.0,
    letThreshold: 42.0,
    weibullSat: 3.5e-8,
    weibullW: 24.0,
    weibullS: 1.8,
    zh: {
      name: 'FeRAM (鐵電極化儲存)',
      type: 'HfO2 / 鈣鈦礦鐵電偶極矩',
      pros: '鐵電晶格位移儲存，TID 耐受度達 350 krad；寫入能耗極低。',
      cons: '4.2K 極低溫下晶格偶極凍結，矯頑電壓高達 3.2V 導致標準低壓驅動失效；需破壞性讀取恢復。'
    },
    en: {
      name: 'FeRAM (Ferroelectric Polarization)',
      type: 'HfO2 / Perovskite Ferroelectric Dipole Moment',
      pros: 'Lattice displacement storage, TID resilience up to 350 krad; very low write energy.',
      cons: 'Dipoles freeze at 4.2K cryo, coercive voltage shoots up to 3.2V breaking low-voltage drive; destructive read.'
    }
  },
  eflash_split_gate: {
    id: 'eflash_split_gate',
    baseVdd: 1.8,
    cryoWorkable: false,
    maxTidKrad: 45.0,
    letThreshold: 12.0,
    weibullSat: 4.8e-7,
    weibullW: 16.0,
    weibullS: 1.5,
    zh: {
      name: 'Floating-Gate eFlash (傳統浮閘)',
      type: '多晶矽浮閘穿隧注入電荷儲存',
      pros: '成熟製程庫成熟、百萬次量產經濟規模。',
      cons: '4.2K 載子凍結使高壓電荷泵完全癱瘓；游離輻射在 50 krad 下即因穿隧氧化層電洞捕獲而洩漏丟失位元。'
    },
    en: {
      name: 'Floating-Gate eFlash (Legacy FG)',
      type: 'Poly-Si Floating Gate Charge Storage',
      pros: 'Mature process portfolio, immense mass-production legacy scale.',
      cons: 'Carrier freeze-out cripples high-voltage charge pump at 4.2K; ionizing radiation induces hole traps leaking charge at < 50 krad.'
    }
  },
  radhard_sram_ecc: {
    id: 'radhard_sram_ecc',
    baseVdd: 0.85,
    cryoWorkable: true,
    maxTidKrad: 200.0,
    letThreshold: 3.5,
    weibullSat: 7.2e-6,
    weibullW: 12.0,
    weibullS: 1.4,
    zh: {
      name: '12T DICE SRAM + ECC (對照基準組)',
      type: '雙互鎖防單事件單元 (易失性對照)',
      pros: '4.2K 下可高速讀寫；雙互鎖結構提供基本抗干擾。',
      cons: '重離子 SEU 截面積極大，在低軌與深空高能量環境下軟錯誤率極高；斷電立即遺失所有數據。'
    },
    en: {
      name: '12T DICE SRAM + ECC (Control Baseline)',
      type: 'Dual Interlocked Cell (Volatile Reference)',
      pros: 'High-speed read/write operating down to 4.2K; DICE topology provides baseline protection.',
      cons: 'Huge SEU cross-section leads to high Soft Error Rate (SER) under GCR heavy ions; data volatile on power-off.'
    }
  }
});

/**
 * Calculates Cryo & Radiation Physical Metrics from First Principles
 * 
 * @param {Object} params
 * @param {string} params.presetId
 * @param {string} params.topologyId
 * @param {number} [params.customTempK]
 * @param {number} [params.customTidKrad]
 * @param {number} [params.customLet]
 * @returns {Object} Comprehensive physics metrics
 */
export function calculateCryoRadhardMetrics(params = {}) {
  const preset = CRYO_ENVIRONMENT_PRESETS[params.presetId] || CRYO_ENVIRONMENT_PRESETS.quantum_cryo_4k;
  const topology = CRYO_NVM_TOPOLOGIES[params.topologyId] || CRYO_NVM_TOPOLOGIES.antifuse_radhard;

  const tempK = params.customTempK !== undefined ? Number(params.customTempK) : preset.tempK;
  const tidKrad = params.customTidKrad !== undefined ? Number(params.customTidKrad) : preset.tidKrad;
  const letVal = params.customLet !== undefined ? Number(params.customLet) : preset.peakLet;

  // 1. Incomplete Ionization & Freeze-out Factor (0.0 to 1.0)
  // At 300K, ionization is ~1.0; at 4.2K, thermal excitation is ~0.001
  const kb = 8.617333262145e-5; // eV/K
  const deltaEd = 0.045; // Donor ionization energy in Si (P: 45meV)
  const freezeOutFactor = Math.min(1.0, Math.max(0.002, Math.sqrt((tempK / 300.0) ** 1.5 * Math.exp(-deltaEd / (kb * Math.max(4.0, tempK))))));

  // 2. Threshold Voltage Temperature Shift: ΔVth = αT * (300 - T)
  const alphaT = 0.0011; // ~1.1 mV/K shift
  const deltaVthTemp = alphaT * (300.0 - tempK);

  // 3. TID Trapped Oxide Hole Charge Shift: ΔVth,tid = -βtid * ln(1 + TID / 10)
  const betaTid = topology.id === 'antifuse_radhard' ? 0.005 : (topology.id === 'stt_mram_hardened' ? 0.015 : 0.085);
  const deltaVthTid = betaTid * Math.log(1.0 + tidKrad / 10.0);

  // 4. Effective Read/Sense Margin (V)
  const vthNominal = 0.42;
  const effectiveVth = vthNominal + deltaVthTemp + (topology.id === 'eflash_split_gate' ? deltaVthTid * 3.5 : deltaVthTid);
  const effectiveMargin = Math.max(0.0, topology.baseVdd - effectiveVth);

  // 5. Heavy-Ion Weibull SEU Cross-Section (cm²/bit)
  let seuCrossSection = 0.0;
  if (letVal > topology.letThreshold) {
    const deltaLet = letVal - topology.letThreshold;
    seuCrossSection = topology.weibullSat * (1.0 - Math.exp(-((deltaLet / topology.weibullW) ** topology.weibullS)));
  }

  // 6. Annual Soft Error Rate (SER) Estimation (FIT / Mbit, 1 FIT = 1 failure in 10^9 hours)
  const ionFlux = letVal > 0 ? (letVal > 50 ? 5.2e4 : 1.8e5) : 0.0; // ions/(cm²·year) in orbit
  const annualSerFitPerMbit = seuCrossSection * ionFlux * (1e6) * (1e9 / 8760.0);

  // 7. Overall Radiation & Cryo Resilience Score (0 to 100)
  let resilienceScore = 100.0;
  // Penalty for TID degradation
  if (tidKrad > topology.maxTidKrad) {
    resilienceScore -= 50.0;
  } else {
    resilienceScore -= (tidKrad / topology.maxTidKrad) * 25.0;
  }
  // Penalty for SEU sensitivity
  if (topology.letThreshold < 15.0 && letVal > topology.letThreshold) {
    resilienceScore -= 30.0;
  } else if (topology.letThreshold < 50.0 && letVal > topology.letThreshold) {
    resilienceScore -= 15.0;
  }
  // Penalty for Cryo unviability at T < 50K
  if (tempK < 50.0 && !topology.cryoWorkable) {
    resilienceScore -= 45.0;
  }
  resilienceScore = Math.max(0.0, Math.min(100.0, Math.round(resilienceScore)));

  // 8. Verdict Classification
  let status = 'APPROVED';
  if (resilienceScore >= 80) {
    status = 'OPTIMAL';
  } else if (resilienceScore >= 55) {
    status = 'MARGINAL';
  } else {
    status = 'CRITICAL_RISK';
  }

  return {
    preset,
    topology,
    tempK,
    tempC: tempK - 273.15,
    tidKrad,
    letVal,
    freezeOutFactor,
    deltaVthTemp,
    deltaVthTid,
    effectiveVth,
    effectiveMargin,
    seuCrossSection,
    annualSerFitPerMbit,
    resilienceScore,
    status
  };
}

/**
 * Draws High-Resolution Physical Canvas
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'temp_voltage_window' | 'weibull_seu_cross_section'} mode
 * @param {'zh' | 'en'} lang
 */
export function drawCryoRadhardCanvas(canvas, metrics, mode, lang = 'zh') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 640;
  const height = canvas.clientHeight || 320;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  const padLeft = 70;
  const padRight = 30;
  const padTop = 35;
  const padBottom = 45;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 5; i++) {
    const y = padTop + (plotH / 5) * i;
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
  }
  for (let j = 0; j <= 6; j++) {
    const x = padLeft + (plotW / 6) * j;
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + plotH);
  }
  ctx.stroke();

  if (mode === 'temp_voltage_window') {
    // Mode 1: Temperature (4K to 450K) vs Sense Margin & Threshold Voltage
    const minT = 4.0;
    const maxT = 450.0;

    // Draw Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    for (let j = 0; j <= 6; j++) {
      const t = minT + (maxT - minT) * (j / 6);
      const x = padLeft + (plotW / 6) * j;
      ctx.fillText(`${Math.round(t)}K`, x, height - padBottom + 16);
    }

    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const v = (1.5 * (1 - i / 5)).toFixed(2);
      const y = padTop + (plotH / 5) * i + 4;
      ctx.fillText(`${v} V`, padLeft - 8, y);
    }

    // Axis titles
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lang === 'zh' ? '電壓 (V)' : 'Voltage (V)', padLeft, padTop - 12);

    ctx.textAlign = 'right';
    ctx.fillText(lang === 'zh' ? '溫度 (Kelvin)' : 'Temperature (Kelvin)', width - padRight, height - 12);

    // Plot Curves: Effective Vth & VDD Margin
    // Curve 1: Nominal VDD Line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const vddY = padTop + plotH * (1.0 - metrics.topology.baseVdd / 1.5);
    ctx.moveTo(padLeft, vddY);
    ctx.lineTo(padLeft + plotW, vddY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve 2: Vth(T) profile across temperatures
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let j = 0; j <= 60; j++) {
      const curT = minT + (maxT - minT) * (j / 60);
      const x = padLeft + (plotW / 60) * j;
      const curVth = 0.42 + 0.0011 * (300.0 - curT) + metrics.deltaVthTid;
      const y = padTop + plotH * (1.0 - Math.min(1.5, Math.max(0.0, curVth)) / 1.5);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Curve 3: Sense Margin Window
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let j = 0; j <= 60; j++) {
      const curT = minT + (maxT - minT) * (j / 60);
      const x = padLeft + (plotW / 60) * j;
      const curVth = 0.42 + 0.0011 * (300.0 - curT) + metrics.deltaVthTid;
      const curMargin = Math.max(0.0, metrics.topology.baseVdd - curVth);
      const y = padTop + plotH * (1.0 - Math.min(1.5, curMargin) / 1.5);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current Operating Point Marker
    const opX = padLeft + plotW * ((metrics.tempK - minT) / (maxT - minT));
    const opY = padTop + plotH * (1.0 - Math.min(1.5, metrics.effectiveMargin) / 1.5);

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(opX, opY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Legend Backdrop Card to prevent overlap
    const legBoxW = Math.min(plotW - 20, 390);
    const legBoxH = 24;
    const legBoxX = padLeft + 8;
    const legBoxY = padTop + 6;
    ctx.fillStyle = 'rgba(8, 19, 30, 0.90)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(legBoxX, legBoxY, legBoxW, legBoxH, 4);
    else ctx.rect(legBoxX, legBoxY, legBoxW, legBoxH);
    ctx.fill();
    ctx.stroke();

    // Legend
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(lang === 'zh' ? '— 閾值 Vth(T)' : '— Vth(T)', legBoxX + 8, legBoxY + 16);
    ctx.fillStyle = '#10b981';
    ctx.fillText(lang === 'zh' ? '— 感測裕度 Margin' : '— Margin', legBoxX + 130, legBoxY + 16);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`VDD = ${metrics.topology.baseVdd}V`, legBoxX + 270, legBoxY + 16);

  } else {
    // Mode 2: Heavy-Ion LET (0 to 100 MeV·cm²/mg) vs Weibull SEU Cross-Section (cm²/bit)
    const minLet = 0.0;
    const maxLet = 100.0;

    // Y Axis in Logarithmic Scale: 10^-10 to 10^-5 cm²/bit
    const logMin = -10.0;
    const logMax = -5.0;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    for (let j = 0; j <= 5; j++) {
      const l = minLet + (maxLet - minLet) * (j / 5);
      const x = padLeft + (plotW / 5) * j;
      ctx.fillText(`${l}`, x, height - padBottom + 16);
    }

    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const exp = logMax - i;
      const y = padTop + (plotH / 5) * i + 4;
      ctx.fillText(`10^${exp}`, padLeft - 8, y);
    }

    ctx.fillStyle = '#f43f5e';
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lang === 'zh' ? 'SEU 截面積 (cm²/bit, Log)' : 'SEU Cross-Section (cm²/bit, Log)', padLeft, padTop - 12);

    ctx.textAlign = 'right';
    ctx.fillText('LET (MeV·cm²/mg)', width - padRight, height - 12);

    // Plot Curves: Current Topology vs SRAM Reference
    // Plot Curve 1: Reference SRAM DICE
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let j = 0; j <= 60; j++) {
      const curL = minLet + (maxLet - minLet) * (j / 60);
      const x = padLeft + (plotW / 60) * j;
      let s = 1e-12;
      if (curL > 3.5) {
        s = 7.2e-6 * (1.0 - Math.exp(-(((curL - 3.5) / 12.0) ** 1.4)));
      }
      const logVal = Math.log10(Math.max(1e-10, s));
      const y = padTop + plotH * ((logMax - logVal) / (logMax - logMin));
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot Curve 2: Current Selected Topology
    ctx.strokeStyle = metrics.topology.id === 'antifuse_radhard' ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let j = 0; j <= 60; j++) {
      const curL = minLet + (maxLet - minLet) * (j / 60);
      const x = padLeft + (plotW / 60) * j;
      let s = 0.0;
      if (curL > metrics.topology.letThreshold) {
        s = metrics.topology.weibullSat * (1.0 - Math.exp(-(((curL - metrics.topology.letThreshold) / metrics.topology.weibullW) ** metrics.topology.weibullS)));
      }
      const logVal = s > 0 ? Math.log10(Math.max(1e-10, s)) : -10.0;
      const y = padTop + plotH * ((logMax - logVal) / (logMax - logMin));
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Mark Threshold LET
    if (metrics.topology.letThreshold < 100.0) {
      const thX = padLeft + plotW * ((metrics.topology.letThreshold - minLet) / (maxLet - minLet));
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(thX, padTop);
      ctx.lineTo(thX, padTop + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`LETth=${metrics.topology.letThreshold}`, thX, padTop + 30);
    }

    // Draw Legend Backdrop Card to prevent overlap
    const legBoxW = Math.min(plotW - 20, 390);
    const legBoxH = 24;
    const legBoxX = padLeft + 8;
    const legBoxY = padTop + 6;
    ctx.fillStyle = 'rgba(8, 19, 30, 0.90)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(legBoxX, legBoxY, legBoxW, legBoxH, 4);
    else ctx.rect(legBoxX, legBoxY, legBoxW, legBoxH);
    ctx.fill();
    ctx.stroke();

    // Legend
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = metrics.topology.id === 'antifuse_radhard' ? '#10b981' : '#fbbf24';
    ctx.fillText(`${lang === 'zh' ? '目前技術' : 'Active'}: ${lang === 'zh' ? metrics.topology.zh.name : metrics.topology.en.name}`, legBoxX + 8, legBoxY + 16);
    ctx.fillStyle = '#f87171';
    ctx.fillText(lang === 'zh' ? '— SRAM 對照基準' : '— SRAM Baseline', legBoxX + 230, legBoxY + 16);
  }
}

/**
 * Initializes the Cryogenic & Radiation eNVM Simulator
 * 
 * @param {string} containerId
 */
export function initCryoRadhardSimulator(containerId) {
  const root = document.getElementById(containerId);
  if (!root) return;

  let currentPresetId = 'quantum_cryo_4k';
  let currentTopologyId = 'antifuse_radhard';
  let currentMode = 'temp_voltage_window';

  const presetSelect = root.querySelector('#cryo-preset-select');
  const topologySelect = root.querySelector('#cryo-topology-select');
  const tempSlider = root.querySelector('#cryo-temp-slider');
  const tidSlider = root.querySelector('#cryo-tid-slider');
  const letSlider = root.querySelector('#cryo-let-slider');
  const canvas = root.querySelector('#cryo-radhard-canvas');

  const modeTempBtn = root.querySelector('#cryo-mode-temp-btn');
  const modeSeuBtn = root.querySelector('#cryo-mode-seu-btn');

  function getLang() {
    return document.documentElement.lang === 'zh-TW' || document.documentElement.lang === 'zh' ? 'zh' : 'en';
  }

  function update() {
    const lang = getLang();
    const metrics = calculateCryoRadhardMetrics({
      presetId: currentPresetId,
      topologyId: currentTopologyId,
      customTempK: tempSlider ? Number(tempSlider.value) : undefined,
      customTidKrad: tidSlider ? Number(tidSlider.value) : undefined,
      customLet: letSlider ? Number(letSlider.value) : undefined
    });

    // Update Slider Labels
    const tempValEl = root.querySelector('#cryo-temp-val');
    if (tempValEl) tempValEl.textContent = `${metrics.tempK} K (${metrics.tempC.toFixed(1)}°C)`;

    const tidValEl = root.querySelector('#cryo-tid-val');
    if (tidValEl) tidValEl.textContent = `${metrics.tidKrad} krad`;

    const letValEl = root.querySelector('#cryo-let-val');
    if (letValEl) letValEl.textContent = `${metrics.letVal} MeV·cm²/mg`;

    // Update Metric Badges
    const vthEl = root.querySelector('#cryo-metric-vth');
    if (vthEl) vthEl.textContent = `${metrics.effectiveVth.toFixed(3)} V`;

    const marginEl = root.querySelector('#cryo-metric-margin');
    if (marginEl) marginEl.textContent = `${metrics.effectiveMargin.toFixed(3)} V`;

    const serEl = root.querySelector('#cryo-metric-ser');
    if (serEl) {
      serEl.textContent = metrics.annualSerFitPerMbit === 0.0 ? '0 (Immune)' : `${metrics.annualSerFitPerMbit.toExponential(2)} FIT`;
    }

    const scoreEl = root.querySelector('#cryo-metric-score');
    if (scoreEl) {
      scoreEl.textContent = `${metrics.resilienceScore} / 100`;
      scoreEl.style.color = metrics.resilienceScore >= 80 ? '#10b981' : (metrics.resilienceScore >= 55 ? '#f59e0b' : '#ef4444');
    }

    // Update Verdict Text
    const verdictEl = root.querySelector('#cryo-verdict-banner');
    if (verdictEl) {
      const topoName = lang === 'zh' ? metrics.topology.zh.name : metrics.topology.en.name;
      const pros = lang === 'zh' ? metrics.topology.zh.pros : metrics.topology.en.pros;
      const cons = lang === 'zh' ? metrics.topology.zh.cons : metrics.topology.en.cons;

      verdictEl.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 4px; color: ${metrics.resilienceScore >= 80 ? '#10b981' : (metrics.resilienceScore >= 55 ? '#f59e0b' : '#ef4444')}">
          ${metrics.status === 'OPTIMAL' ? (lang === 'zh' ? '✓ 極限環境驗證通過 (Optimal Qualification)' : '✓ Extreme Environment Qualified') :
            (metrics.status === 'MARGINAL' ? (lang === 'zh' ? '⚠ 臨界工作裕度 (Marginal Window)' : '⚠ Marginal Operating Window') :
             (lang === 'zh' ? '✗ 高風險嚴重失效 (Critical Failure Risk)' : '✗ Critical Physical Failure Risk'))}
        </div>
        <div style="font-size: 0.85rem; line-height: 1.45; color: #cbd5e1;">
          <strong>${topoName}:</strong> ${pros} <span style="opacity: 0.85">${cons}</span>
        </div>
      `;
    }

    // Draw Canvas
    if (canvas) {
      drawCryoRadhardCanvas(canvas, metrics, currentMode, lang);
    }
  }

  // Event Listeners
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      currentPresetId = e.target.value;
      const preset = CRYO_ENVIRONMENT_PRESETS[currentPresetId];
      if (preset) {
        if (tempSlider) tempSlider.value = preset.tempK;
        if (tidSlider) tidSlider.value = preset.tidKrad;
        if (letSlider) letSlider.value = preset.peakLet;
      }
      update();
    });
  }

  if (topologySelect) {
    topologySelect.addEventListener('change', (e) => {
      currentTopologyId = e.target.value;
      update();
    });
  }

  if (tempSlider) tempSlider.addEventListener('input', update);
  if (tidSlider) tidSlider.addEventListener('input', update);
  if (letSlider) letSlider.addEventListener('input', update);

  if (modeTempBtn) {
    modeTempBtn.addEventListener('click', () => {
      currentMode = 'temp_voltage_window';
      modeTempBtn.classList.add('active');
      if (modeSeuBtn) modeSeuBtn.classList.remove('active');
      update();
    });
  }

  if (modeSeuBtn) {
    modeSeuBtn.addEventListener('click', () => {
      currentMode = 'weibull_seu_cross_section';
      modeSeuBtn.classList.add('active');
      if (modeTempBtn) modeTempBtn.classList.remove('active');
      update();
    });
  }

  // Language and resize listeners
  window.addEventListener('hub:language-change', update);
  window.addEventListener('languagechange', update);
  window.addEventListener('resize', update);
  const observer = new MutationObserver(() => update());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // Initial render
  update();
}
