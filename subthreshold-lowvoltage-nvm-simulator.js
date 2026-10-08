/**
 * @fileoverview Sub-Threshold & Near-Threshold Ultra-Low-Voltage eNVM Physical Simulator
 * 
 * First-principles simulation of eNVM energy and timing behavior across sub-threshold
 * and near-threshold supply voltages (0.3V to 0.7V VDD) for battery-less energy-harvesting
 * edge IoT nodes, smart medical implants, and passive sensor telemetry.
 * 
 * Physics Foundations:
 * 1. Sub-threshold carrier diffusion current:
 *    I_sub(VGS) = I0 * (W/L) * exp((VGS - Vth) / (m * kB * T / q)) * [1 - exp(-q * VDS / (kB * T))].
 *    Subthreshold slope factor S = m * (kB * T / q) * ln(10) ≈ 75 mV/decade.
 * 2. Minimum Energy Point (MEP) active vs leakage trade-off:
 *    E_total = E_active + E_leakage = α * C_eff * VDD² + I_leak * VDD * t_sense(VDD).
 *    Lower VDD reduces quadratic active energy but exponentially inflates sensing latency,
 *    triggering a leakage energy surge at ultra-low voltages.
 * 3. Pelgrom threshold voltage mismatch & sense margin failure rate:
 *    σ_Vth = Avth / sqrt(W * L), current variation σ_I / μ_I ≈ σ_Vth / (m * kB * T / q).
 * 4. Microscopic filament resistance stability in AntiFuse vs low-voltage transconductance collapse in Flash.
 * 
 * @author SamHuang68
 * @license MIT
 */

/**
 * Low-Voltage Supply Presets
 * @typedef {Object} LowVoltageSupplyPreset
 * @property {string} id
 * @property {number} nominalVdd Nominal Supply Voltage in Volts
 * @property {number} targetClockKhz Operating Frequency in kHz
 * @property {number} ambientTempC Ambient Temperature in °C
 * @property {string} applicationDomain Application Profile
 * @property {{name: string, desc: string}} zh Traditional Chinese metadata
 * @property {{name: string, desc: string}} en English metadata
 */

export const LOW_VOLTAGE_SUPPLY_PRESETS = Object.freeze({
  subthreshold_0_35v: {
    id: 'subthreshold_0_35v',
    nominalVdd: 0.35,
    targetClockKhz: 50.0,
    ambientTempC: 25.0,
    applicationDomain: 'Indoor Light Harvesting / Smart Dust',
    zh: {
      name: '0.35V 極限次閾值微光採集 (Indoor Solar Harvesting)',
      desc: '室內弱光太陽能電池直接驅動，VDD 遠低於晶體管閾值電壓 (0.42V)，感測電流呈對數擴散'
    },
    en: {
      name: '0.35V Sub-Threshold Indoor Solar Harvesting',
      desc: 'Indoor weak-light solar cell drive, VDD far below transistor Vth (0.42V), diffusion-dominated sensing'
    }
  },
  nearthreshold_0_50v: {
    id: 'nearthreshold_0_50v',
    nominalVdd: 0.50,
    targetClockKhz: 500.0,
    ambientTempC: 37.0,
    applicationDomain: 'Bio-Medical Implant / Wearable',
    zh: {
      name: '0.50V 近閾值醫療植入體 (Bio-Implantable Capsule)',
      desc: '人體 37°C 恆溫膠囊，處於最小能耗點 (MEP) 最優平衡區，兼顧極致能效與可靠感測'
    },
    en: {
      name: '0.50V Near-Threshold Bio-Implantable Capsule',
      desc: 'Human 37°C body capsule at Minimum Energy Point (MEP) sweet spot, balancing efficiency & read fidelity'
    }
  },
  ultralow_0_70v: {
    id: 'ultralow_0_70v',
    nominalVdd: 0.70,
    targetClockKhz: 4000.0,
    ambientTempC: 85.0,
    applicationDomain: 'Automotive TPMS / Industrial Sensor',
    zh: {
      name: '0.70V 超低壓輪胎胎壓感測 (TPMS Piezo Harvester)',
      desc: '壓電/振動採集，工作電壓 0.7V，高溫 85°C 漏電流顯著增加，需強固感測電路'
    },
    en: {
      name: '0.70V Ultra-Low-Voltage Tire Pressure (TPMS Piezo)',
      desc: 'Piezoelectric/vibration harvesting at 0.7V, elevated 85°C temp increases leakage, requiring robust sense margins'
    }
  },
  nominal_1_00v: {
    id: 'nominal_1_00v',
    nominalVdd: 1.00,
    targetClockKhz: 24000.0,
    ambientTempC: 25.0,
    applicationDomain: 'Standard Low-Power IoT Baseline',
    zh: {
      name: '1.00V 標稱低壓對照組 (Standard Low-Power MCU)',
      desc: '傳統數位邏輯低壓供電基準，MOSFET 處於強反轉區，延遲低但動態能量高'
    },
    en: {
      name: '1.00V Nominal Low-Power Control Baseline',
      desc: 'Conventional digital logic low-voltage baseline, strong inversion operation with low delay but high CV²'
    }
  }
});

/**
 * Low-Voltage eNVM Topology Specifications
 * @typedef {Object} LowVoltageNvmTopology
 * @property {string} id
 * @property {number} minFunctionalVdd Minimum Operable VDD in Volts
 * @property {number} cellCapacitanceFf Bitcell Capacitance in fF
 * @property {number} subthresholdIonNa On-state Current at 0.4V in nA
 * @property {number} offStateLeakagePa Off-state Bit Leakage in pA
 * @property {number} pelgromMismatchMv Transconductance Mismatch σ_Vth in mV
 * @property {{name: string, type: string, pros: string, cons: string}} zh Traditional Chinese metadata
 * @property {{name: string, type: string, pros: string, cons: string}} en English metadata
 */

export const LOW_VOLTAGE_NVM_TOPOLOGIES = Object.freeze({
  antifuse_lowvoltage: {
    id: 'antifuse_lowvoltage',
    minFunctionalVdd: 0.32,
    cellCapacitanceFf: 1.8,
    subthresholdIonNa: 1450.0, // Solid ohmic conduction even at 0.35V!
    offStateLeakagePa: 0.05,
    pelgromMismatchMv: 4.2,
    zh: {
      name: 'Logic AntiFuse OTP (極限低壓感測 / 0-Mask)',
      type: '0-Mask 氧化層擊穿導電微絲 (幾百歐姆歐姆態 vs Giga-Ω 阻斷態)',
      pros: '微絲為純歐姆導電體，無 MOSFET 跨導塌陷問題；0.35V 下導通電流超過 1.4µA，最小能耗點 (MEP) 最低。',
      cons: '為單次燒寫 (OTP)，不支援執行期間狀態覆寫。'
    },
    en: {
      name: 'Logic AntiFuse OTP (Sub-Vt Sensing / 0-Mask)',
      type: '0-Mask Oxide Breakdown Filament (Ohmic ~500Ω vs Giga-Ω Off)',
      pros: 'Filament is a purely ohmic link immune to gate transconductance collapse; delivers > 1.4µA at 0.35V, lowest MEP.',
      cons: 'One-Time Programmable (OTP), does not support runtime state rewrite.'
    }
  },
  reram_lowcurrent: {
    id: 'reram_lowcurrent',
    minFunctionalVdd: 0.42,
    cellCapacitanceFf: 3.5,
    subthresholdIonNa: 480.0,
    offStateLeakagePa: 12.0,
    pelgromMismatchMv: 8.5,
    zh: {
      name: 'BEOL OxRAM ReRAM (低電流阻變)',
      type: '後段金屬氧化物導電微絲 (LRS ~20kΩ vs HRS ~1MΩ)',
      pros: '支援百萬次覆寫，可在 0.5V 進行非揮發狀態更新；待機靜態零漏電。',
      cons: '低壓下形成電壓裕度不足；電導漂移 (Relaxation Drift) 易導致近閾值讀取窗口收窄。'
    },
    en: {
      name: 'BEOL OxRAM ReRAM (Low-Current Resistive)',
      type: 'BEOL Metal-Oxide Conductive Filament (LRS ~20kΩ vs HRS ~1MΩ)',
      pros: 'Supports 1M write cycles with non-volatile updates at 0.5V; zero standby power loss.',
      cons: 'Insufficient forming voltage margins at ultra-low VDD; conductance drift narrows read margins.'
    }
  },
  eflash_charge_sensing: {
    id: 'eflash_charge_sensing',
    minFunctionalVdd: 0.65,
    cellCapacitanceFf: 8.2,
    subthresholdIonNa: 45.0, // Severe current collapse under 0.6V
    offStateLeakagePa: 2.5,
    pelgromMismatchMv: 18.0,
    zh: {
      name: 'Floating-Gate eFlash (傳統浮閘電荷感測)',
      type: '多晶矽浮閘穿隧注入電荷',
      pros: '成熟製程存儲密度高，技術標準庫完備。',
      cons: '在 0.5V 以下 MOSFET 跨導完全崩跌，讀取延遲高達數微秒引發漏電反噬；低於 0.65V 感測放大器無法翻轉。'
    },
    en: {
      name: 'Floating-Gate eFlash (Legacy Charge Sensing)',
      type: 'Poly-Si Floating Gate Charge Storage',
      pros: 'Mature foundry portfolio with high memory capacity.',
      cons: 'Transconductance collapses below 0.5V, causing multi-microsecond sense latency and leakage surge; unviable < 0.65V.'
    }
  },
  sram_subvt_10t: {
    id: 'sram_subvt_10t',
    minFunctionalVdd: 0.30,
    cellCapacitanceFf: 5.5,
    subthresholdIonNa: 320.0,
    offStateLeakagePa: 185.0, // High standby leakage in sub-vt SRAM
    pelgromMismatchMv: 6.8,
    zh: {
      name: '10T 次閾值 SRAM (緩衝讀取埠 / 對照組)',
      type: '10-Transistor 分離式讀取緩衝靜態單元 (揮發性對照)',
      pros: '可於 0.3V 正常翻轉，分離式讀取埠避免破壞內部靜態雜訊裕度 (SNM)。',
      cons: '單元面積為 6T SRAM 的 1.7 倍；陣列靜態次閾值漏電隨溫度與容量指數增加，等待週期能耗極大。'
    },
    en: {
      name: '10T Sub-Threshold SRAM (Buffered Read Control)',
      type: '10-Transistor Decoupled Read Buffer (Volatile Reference)',
      pros: 'Operates down to 0.3V without disturbing Static Noise Margin (SNM) during read.',
      cons: 'Area is 1.7x of 6T SRAM; static subthreshold leakage explodes over array capacity and temperature.'
    }
  }
});

/**
 * Calculates Sub-Threshold & Near-Threshold eNVM Metrics from First Principles
 * 
 * @param {Object} params
 * @param {string} params.presetId
 * @param {string} params.topologyId
 * @param {number} [params.customVdd] Supply Voltage in Volts
 * @param {number} [params.customTempC] Operating Temperature in °C
 * @param {number} [params.customCapacityKb] Macro Capacity in Kbits
 * @returns {Object} Comprehensive electrical and energy metrics
 */
export function calculateSubthresholdMetrics(params = {}) {
  const preset = LOW_VOLTAGE_SUPPLY_PRESETS[params.presetId] || LOW_VOLTAGE_SUPPLY_PRESETS.nearthreshold_0_50v;
  const topology = LOW_VOLTAGE_NVM_TOPOLOGIES[params.topologyId] || LOW_VOLTAGE_NVM_TOPOLOGIES.antifuse_lowvoltage;

  const vdd = params.customVdd !== undefined ? Number(params.customVdd) : preset.nominalVdd;
  const tempC = params.customTempC !== undefined ? Number(params.customTempC) : preset.ambientTempC;
  const capacityKb = params.customCapacityKb !== undefined ? Number(params.customCapacityKb) : 64.0;

  const tempK = tempC + 273.15;
  const kb = 8.617e-5;
  const ut = (tempK * 8.617e-5); // Thermal voltage in V (~25.9mV at 300K)

  // 1. Effective Sensing Drive Current (I_drive in nA)
  // Sub-threshold exponential relation: I ∝ exp((VDD - Vth) / (m * Ut))
  const vthNominal = 0.42;
  const mFactor = 1.35;
  const deltaV = vdd - vthNominal;
  let driveCurrentNa = 0.0;
  if (topology.id === 'antifuse_lowvoltage') {
    // Ohmic filament: I = VDD / R_filament (R ≈ 500Ω ~ 1kΩ)
    driveCurrentNa = (vdd / 850.0) * 1e9 * 0.0012; // In nA range (e.g. ~1.4µA at 0.35V)
  } else if (deltaV < 0) {
    // Sub-threshold region
    const subFactor = Math.exp(deltaV / (mFactor * ut));
    driveCurrentNa = topology.subthresholdIonNa * subFactor;
  } else {
    // Near-threshold / Strong inversion transition
    driveCurrentNa = topology.subthresholdIonNa * (1.0 + (deltaV / 0.15) ** 1.5);
  }

  // 2. Sense Latency (t_sense in ns)
  // t_sense ≈ (C_bitline * ΔV_sense) / I_drive
  const bitlineCapFf = (capacityKb * 0.08) * 10.0 + topology.cellCapacitanceFf;
  const deltaVsenseMv = 60.0; // 60mV sense threshold
  const senseLatencyNs = Math.max(1.2, (bitlineCapFf * 1e-15 * (deltaVsenseMv * 1e-3)) / (Math.max(1e-12, driveCurrentNa * 1e-9)) * 1e9);

  // 3. Active vs Static Leakage Energy per Bit Read (fJ / bit):
  // E_active = α * C_eff * VDD²
  const alphaSwitching = 0.25;
  const activeEnergyFj = alphaSwitching * (bitlineCapFf * 1e-15) * (vdd ** 2) * 1e15;

  // Array Leakage: total bits * I_leak_per_bit * VDD * t_sense
  const tempLeakMultiplier = Math.exp((tempC - 25.0) / 18.0);
  const totalArrayLeakageNa = (capacityKb * 1024.0) * (topology.offStateLeakagePa * 1e-12 * tempLeakMultiplier) * 1e9;
  const leakageEnergyFj = (totalArrayLeakageNa * 1e-9) * vdd * (senseLatencyNs * 1e-9) * 1e15;
  const totalEnergyFj = activeEnergyFj + leakageEnergyFj;
  const leakageEnergyRatioPercent = (leakageEnergyFj / totalEnergyFj) * 100.0;

  // 4. Pelgrom Statistical Read Margin Failure Rate (PPM):
  // σ_I / μ_I ≈ σ_Vth / (m * Ut)
  const currentVarianceRatio = (topology.pelgromMismatchMv * 1e-3) / (mFactor * ut);
  const zScore = Math.max(0.1, (deltaVsenseMv / (deltaVsenseMv * currentVarianceRatio)));
  // Gaussian Q-function approximation: Q(x) ≈ 1/2 * exp(-x² / 2)
  const failureProb = 0.5 * Math.exp(-0.5 * (zScore ** 2));
  const failureRatePpm = Math.min(1e6, Math.max(0.01, failureProb * 1e6));

  // 5. Overall Low-Voltage Energy Efficiency Score (0 to 100):
  let efficiencyScore = 100.0;
  if (vdd < topology.minFunctionalVdd) {
    efficiencyScore -= 65.0; // Voltage below operational cliff
  }
  if (totalEnergyFj > 50.0) {
    efficiencyScore -= 30.0;
  } else if (totalEnergyFj > 20.0) {
    efficiencyScore -= 15.0;
  }
  if (failureRatePpm > 1000.0) {
    efficiencyScore -= 30.0;
  } else if (failureRatePpm > 100.0) {
    efficiencyScore -= 12.0;
  }
  efficiencyScore = Math.max(0.0, Math.min(100.0, Math.round(efficiencyScore)));

  // 6. Verdict Classification
  let verdictStatus = 'OPTIMAL_MEP';
  if (efficiencyScore >= 80) verdictStatus = 'OPTIMAL_MEP';
  else if (efficiencyScore >= 50) verdictStatus = 'MARGINAL_WINDOW';
  else verdictStatus = 'VOLTAGE_CLIFF_FAILURE';

  return {
    preset,
    topology,
    vdd,
    tempC,
    capacityKb,
    driveCurrentNa,
    senseLatencyNs,
    activeEnergyFj,
    leakageEnergyFj,
    totalEnergyFj,
    leakageEnergyRatioPercent,
    failureRatePpm,
    efficiencyScore,
    verdictStatus
  };
}

/**
 * Draws High-Resolution Subthreshold Canvas
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'voltage_energy_curve' | 'read_latency_failure'} mode
 * @param {'zh' | 'en'} lang
 */
export function drawSubthresholdCanvas(canvas, metrics, mode, lang = 'zh') {
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
  ctx.fillStyle = '#0a101d';
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

  if (mode === 'voltage_energy_curve') {
    // Mode 1: Supply Voltage VDD (0.25V to 1.20V) vs Total Energy per Read (fJ/bit)
    const minV = 0.25;
    const maxV = 1.20;
    const maxE = 60.0; // 0 to 60 fJ/bit

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    for (let j = 0; j <= 6; j++) {
      const v = (minV + (maxV - minV) * (j / 6)).toFixed(2);
      const x = padLeft + (plotW / 6) * j;
      ctx.fillText(`${v} V`, x, height - padBottom + 16);
    }

    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const e = (maxE * (1 - i / 5)).toFixed(0);
      const y = padTop + (plotH / 5) * i + 4;
      ctx.fillText(`${e} fJ`, padLeft - 8, y);
    }

    ctx.fillStyle = '#10b981';
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lang === 'zh' ? '讀取能耗 (fJ/bit)' : 'Read Energy (fJ/bit)', padLeft, padTop - 12);

    ctx.textAlign = 'right';
    ctx.fillText(lang === 'zh' ? '工作電壓 VDD (V)' : 'Supply Voltage VDD (V)', width - padRight, height - 12);

    // Operational cliff boundary (min functional VDD)
    const cliffX = padLeft + plotW * ((metrics.topology.minFunctionalVdd - minV) / (maxV - minV));
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(cliffX, padTop);
    ctx.lineTo(cliffX, padTop + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve 1: Active Energy (E_active = α * C * VDD²)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let j = 0; j <= 60; j++) {
      const curV = minV + (maxV - minV) * (j / 60);
      const eAct = 0.25 * 18.0 * (curV ** 2);
      const x = padLeft + (plotW / 60) * j;
      const y = padTop + plotH * (1.0 - Math.min(maxE, eAct) / maxE);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Curve 2: Total Energy (Active + Leakage Surge at low VDD)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let minEnergyVal = 999.0;
    let minEnergyVdd = 0.5;
    for (let j = 0; j <= 60; j++) {
      const curV = minV + (maxV - minV) * (j / 60);
      const eAct = 0.25 * 18.0 * (curV ** 2);
      const iDrive = metrics.topology.id === 'antifuse_lowvoltage' ? (curV / 850.0) * 1e9 * 0.0012 : Math.max(0.1, metrics.topology.subthresholdIonNa * Math.exp((curV - 0.42) / (1.35 * 0.026)));
      const lat = Math.max(1.0, 1500.0 / iDrive);
      const eLeak = 0.08 * curV * lat * 0.08;
      const totalE = eAct + eLeak;
      if (totalE < minEnergyVal) {
        minEnergyVal = totalE;
        minEnergyVdd = curV;
      }
      const x = padLeft + (plotW / 60) * j;
      const y = padTop + plotH * (1.0 - Math.min(maxE, totalE) / maxE);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Operating point
    const opX = padLeft + plotW * ((metrics.vdd - minV) / (maxV - minV));
    const opY = padTop + plotH * (1.0 - Math.min(maxE, metrics.totalEnergyFj) / maxE);

    ctx.fillStyle = metrics.vdd < metrics.topology.minFunctionalVdd ? '#ef4444' : '#10b981';
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

    // Legend items
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`${lang === 'zh' ? '— 總能耗' : '— Total'} (MEP ≈ ${minEnergyVdd.toFixed(2)}V)`, legBoxX + 8, legBoxY + 16);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(lang === 'zh' ? '— 動態 CV²' : '— Dynamic CV²', legBoxX + 175, legBoxY + 16);
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`E = ${metrics.totalEnergyFj.toFixed(1)} fJ`, legBoxX + 285, legBoxY + 16);

  } else {
    // Mode 2: Supply Voltage VDD (0.25V to 1.20V) vs Sense Latency (ns, Log Scale 1ns to 10µs)
    const minV = 0.25;
    const maxV = 1.20;

    // Log Scale: 10^0 (1ns) to 10^4 (10,000ns)
    const logMin = 0.0;
    const logMax = 4.0;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    for (let j = 0; j <= 6; j++) {
      const v = (minV + (maxV - minV) * (j / 6)).toFixed(2);
      const x = padLeft + (plotW / 6) * j;
      ctx.fillText(`${v} V`, x, height - padBottom + 16);
    }

    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const exp = logMax - i;
      const y = padTop + (plotH / 4) * i + 4;
      ctx.fillText(`10^${exp} ns`, padLeft - 8, y);
    }

    ctx.fillStyle = '#f59e0b';
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lang === 'zh' ? '感測讀取延遲 (ns, Log)' : 'Sense Latency (ns, Log)', padLeft, padTop - 12);

    ctx.textAlign = 'right';
    ctx.fillText(lang === 'zh' ? '工作電壓 VDD (V)' : 'Supply Voltage VDD (V)', width - padRight, height - 12);

    // Plot Latency Curve
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let j = 0; j <= 60; j++) {
      const curV = minV + (maxV - minV) * (j / 60);
      const iDrive = metrics.topology.id === 'antifuse_lowvoltage' ? (curV / 850.0) * 1e9 * 0.0012 : Math.max(0.1, metrics.topology.subthresholdIonNa * Math.exp((curV - 0.42) / (1.35 * 0.026)));
      const lat = Math.max(1.0, 1500.0 / iDrive);
      const logVal = Math.log10(Math.max(1.0, lat));
      const x = padLeft + (plotW / 60) * j;
      const y = padTop + plotH * ((logMax - logVal) / (logMax - logMin));
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Operating point
    const opLatLog = Math.log10(Math.max(1.0, metrics.senseLatencyNs));
    const opX = padLeft + plotW * ((metrics.vdd - minV) / (maxV - minV));
    const opY = padTop + plotH * ((logMax - opLatLog) / (logMax - logMin));

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(opX, opY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Legend Backdrop Card to prevent overlap
    const legBoxW = Math.min(plotW - 20, 360);
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

    // Legend items
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fbbf24';
    ctx.fillText(`${lang === 'zh' ? '目前延遲' : 'Active Delay'}: ${metrics.senseLatencyNs.toFixed(1)} ns`, legBoxX + 8, legBoxY + 16);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`Pelgrom BER ≈ ${metrics.failureRatePpm.toFixed(1)} PPM`, legBoxX + 185, legBoxY + 16);
  }
}

/**
 * Initializes the Subthreshold & Near-Threshold eNVM Simulator
 * 
 * @param {string} containerId
 */
export function initSubthresholdSimulator(containerId) {
  const root = document.getElementById(containerId);
  if (!root) return;

  let currentPresetId = 'nearthreshold_0_50v';
  let currentTopologyId = 'antifuse_lowvoltage';
  let currentMode = 'voltage_energy_curve';

  const presetSelect = root.querySelector('#subvt-preset-select');
  const topologySelect = root.querySelector('#subvt-topology-select');
  const vddSlider = root.querySelector('#subvt-vdd-slider');
  const tempSlider = root.querySelector('#subvt-temp-slider');
  const capacitySlider = root.querySelector('#subvt-capacity-slider');
  const canvas = root.querySelector('#subvt-lowvoltage-canvas');

  const modeEnergyBtn = root.querySelector('#subvt-mode-energy-btn');
  const modeLatencyBtn = root.querySelector('#subvt-mode-latency-btn');

  function getLang() {
    return document.documentElement.lang === 'zh-TW' || document.documentElement.lang === 'zh' ? 'zh' : 'en';
  }

  function update() {
    const lang = getLang();
    const metrics = calculateSubthresholdMetrics({
      presetId: currentPresetId,
      topologyId: currentTopologyId,
      customVdd: vddSlider ? Number(vddSlider.value) : undefined,
      customTempC: tempSlider ? Number(tempSlider.value) : undefined,
      customCapacityKb: capacitySlider ? Number(capacitySlider.value) : undefined
    });

    // Update Slider Labels
    const vddValEl = root.querySelector('#subvt-vdd-val');
    if (vddValEl) vddValEl.textContent = `${metrics.vdd.toFixed(2)} V`;

    const tempValEl = root.querySelector('#subvt-temp-val');
    if (tempValEl) tempValEl.textContent = `${metrics.tempC} °C`;

    const capacityValEl = root.querySelector('#subvt-capacity-val');
    if (capacityValEl) capacityValEl.textContent = `${metrics.capacityKb} Kb`;

    // Update Metric Badges
    const energyEl = root.querySelector('#subvt-metric-energy');
    if (energyEl) energyEl.textContent = `${metrics.totalEnergyFj.toFixed(2)} fJ/b`;

    const latencyEl = root.querySelector('#subvt-metric-latency');
    if (latencyEl) latencyEl.textContent = metrics.senseLatencyNs >= 1000 ? `${(metrics.senseLatencyNs / 1000).toFixed(2)} µs` : `${metrics.senseLatencyNs.toFixed(1)} ns`;

    const leakageEl = root.querySelector('#subvt-metric-leakage');
    if (leakageEl) leakageEl.textContent = `${metrics.leakageEnergyRatioPercent.toFixed(1)}%`;

    const scoreEl = root.querySelector('#subvt-metric-score');
    if (scoreEl) {
      scoreEl.textContent = `${metrics.efficiencyScore} / 100`;
      scoreEl.style.color = metrics.efficiencyScore >= 80 ? '#10b981' : (metrics.efficiencyScore >= 50 ? '#f59e0b' : '#ef4444');
    }

    // Update Verdict Text
    const verdictEl = root.querySelector('#subvt-verdict-banner');
    if (verdictEl) {
      const topoName = lang === 'zh' ? metrics.topology.zh.name : metrics.topology.en.name;
      const pros = lang === 'zh' ? metrics.topology.zh.pros : metrics.topology.en.pros;
      const cons = lang === 'zh' ? metrics.topology.zh.cons : metrics.topology.en.cons;

      verdictEl.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 4px; color: ${metrics.efficiencyScore >= 80 ? '#10b981' : (metrics.efficiencyScore >= 50 ? '#f59e0b' : '#ef4444')}">
          ${metrics.verdictStatus === 'OPTIMAL_MEP' ? (lang === 'zh' ? '✓ 處於最小能耗點 MEP 最優能效區 (Optimal Energy Point)' : '✓ Minimum Energy Point (MEP) Qualified') :
            (metrics.verdictStatus === 'MARGINAL_WINDOW' ? (lang === 'zh' ? '⚠ 接近次閾值漏電激增或感測臨界 (Marginal Window)' : '⚠ Marginal Sensing & Leakage Window') :
             (lang === 'zh' ? '✗ 低於電壓臨界斷崖，感測失效 (Voltage Cliff Failure)' : '✗ Voltage Cliff: Sense Amplifier Failure'))}
        </div>
        <div style="font-size: 0.85rem; line-height: 1.45; color: #cbd5e1;">
          <strong>${topoName}:</strong> ${pros} <span style="opacity: 0.85">${cons}</span>
        </div>
      `;
    }

    // Draw Canvas
    if (canvas) {
      drawSubthresholdCanvas(canvas, metrics, currentMode, lang);
    }
  }

  // Event Listeners
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      currentPresetId = e.target.value;
      const preset = LOW_VOLTAGE_SUPPLY_PRESETS[currentPresetId];
      if (preset) {
        if (vddSlider) vddSlider.value = preset.nominalVdd;
        if (tempSlider) tempSlider.value = preset.ambientTempC;
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

  if (vddSlider) vddSlider.addEventListener('input', update);
  if (tempSlider) tempSlider.addEventListener('input', update);
  if (capacitySlider) capacitySlider.addEventListener('input', update);

  if (modeEnergyBtn) {
    modeEnergyBtn.addEventListener('click', () => {
      currentMode = 'voltage_energy_curve';
      modeEnergyBtn.classList.add('active');
      if (modeLatencyBtn) modeLatencyBtn.classList.remove('active');
      update();
    });
  }

  if (modeLatencyBtn) {
    modeLatencyBtn.addEventListener('click', () => {
      currentMode = 'read_latency_failure';
      modeLatencyBtn.classList.add('active');
      if (modeEnergyBtn) modeEnergyBtn.classList.remove('active');
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
