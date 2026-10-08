import { syncMetricCopy } from './模型數值複製.js';

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
  const tempLeakMultiplier = Math.exp(Math.max(-50, Math.min(50, (tempC - 25.0) / 18.0)));
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
export function drawSubthresholdCanvas(canvas, metrics, mode, lang = 'zh', hoverPos = null) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  try {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 640;
    const minV = 0.25, maxV = 1.20;
    const energyMode = mode === 'voltage_energy_curve';
    // 掃描點、操作點、探針與匯出沿用同一計算契約及目前溫度／容量。
    const sampleAtVoltage = customVdd => calculateSubthresholdMetrics({
      presetId: metrics.preset.id,
      topologyId: metrics.topology.id,
      customVdd,
      customTempC: metrics.tempC,
      customCapacityKb: metrics.capacityKb,
    });
    const samples = Array.from({ length: 61 }, (_, j) => sampleAtVoltage(minV + (maxV - minV) * j / 60));
    const minimum = samples.reduce((best, sample) => sample.totalEnergyFj < best.totalEnergyFj ? sample : best);
    const maxE = Math.max(60, Math.ceil(Math.max(metrics.totalEnergyFj, ...samples.map(sample => sample.totalEnergyFj)) / 10) * 10);
    const logMax = Math.max(4, Math.ceil(Math.log10(Math.max(metrics.senseLatencyNs, ...samples.map(sample => sample.senseLatencyNs)))));

    // 字寬決定標題、刻度與圖例換列；畫布高度不以先前畫布高度累加。
    const wrap = (text, maxWidth) => {
      const lines = [];
      let line = '';
      for (const character of text) {
        if (line && ctx.measureText(line + character).width > maxWidth) {
          lines.push(line);
          line = character;
        } else line += character;
      }
      if (line) lines.push(line);
      return lines;
    };
    ctx.font = '600 11px sans-serif';
    const title = energyMode
      ? (lang === 'zh' ? '讀取能耗 (fJ/bit)' : 'Read Energy (fJ/bit)')
      : (lang === 'zh' ? '感測讀取延遲 (ns, Log)' : 'Sense Latency (ns, Log)');
    const titleLines = wrap(title, width - 16);
    const padLeft = 70, padRight = 24;
    const padTop = 12 + titleLines.length * 15;
    const plotW = Math.max(1, width - padLeft - padRight), plotH = 200;
    const toX = v => padLeft + plotW * (v - minV) / (maxV - minV);
    const toY = value => padTop + plotH * (energyMode ? 1 - value / maxE : 1 - Math.log10(Math.max(1, value)) / logMax);
    ctx.font = '10px "IBM Plex Mono", monospace';
    const lanes = [];
    const ticks = Array.from({ length: 7 }, (_, j) => {
      const text = `${(minV + (maxV - minV) * j / 6).toFixed(2)} V`;
      const textWidth = ctx.measureText(text).width;
      const left = Math.max(4, Math.min(width - textWidth - 4, toX(minV + (maxV - minV) * j / 6) - textWidth / 2));
      let lane = lanes.findIndex(right => right + 6 <= left);
      if (lane < 0) lane = lanes.length;
      lanes[lane] = left + textWidth;
      return { text, left, lane };
    });
    const caption = lang === 'zh' ? '工作電壓 VDD (V)' : 'Supply Voltage VDD (V)';
    const captionLines = wrap(caption, width - 16);
    const captionY = padTop + plotH + lanes.length * 15 + 19;
    const legendY = captionY + captionLines.length * 15 + 6;
    const legend = energyMode ? [
      { color: '#10b981', text: `${lang === 'zh' ? '— 總能耗' : '— Total'} (MEP ≈ ${minimum.vdd.toFixed(2)}V)` },
      { color: '#38bdf8', text: lang === 'zh' ? '— 動態 CV²' : '— Dynamic CV²' },
      { color: '#fbbf24', text: `E = ${metrics.totalEnergyFj.toFixed(1)} fJ` },
    ] : [
      { color: '#fbbf24', text: `${lang === 'zh' ? '目前延遲' : 'Active Delay'}: ${metrics.senseLatencyNs.toFixed(1)} ns` },
      { color: '#cbd5e1', text: `Pelgrom BER ≈ ${metrics.failureRatePpm.toFixed(1)} PPM` },
    ];
    let nextY = legendY + 16;
    const legendLines = legend.flatMap(item => wrap(item.text, width - 32).map(text => {
      const row = { ...item, text, y: nextY };
      nextY += 15;
      return row;
    }));
    const height = nextY + 10;
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0a101d';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const y = padTop + plotH * i / 5;
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
    }
    for (let j = 0; j <= 6; j++) {
      const x = padLeft + plotW * j / 6;
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotH);
    }
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    ticks.forEach(tick => ctx.fillText(tick.text, tick.left, padTop + plotH + 16 + tick.lane * 15));
    ctx.textAlign = 'right';
    const tickCount = energyMode ? 5 : logMax;
    for (let i = 0; i <= tickCount; i++) {
      const value = maxE * (1 - i / tickCount);
      const text = energyMode ? `${value < 10000 ? value.toFixed(0) : value.toExponential(1)} fJ` : `10^${logMax - i} ns`;
      ctx.fillText(text, padLeft - 8, padTop + plotH * i / tickCount + 4);
    }
    ctx.fillStyle = energyMode ? '#10b981' : '#f59e0b';
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'left';
    titleLines.forEach((text, i) => ctx.fillText(text, 8, 15 + i * 15));
    captionLines.forEach((text, i) => ctx.fillText(text, 8, captionY + i * 15));

    if (energyMode) {
      const cliffX = toX(metrics.topology.minFunctionalVdd);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cliffX, padTop);
      ctx.lineTo(cliffX, padTop + plotH);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const drawCurve = (key, color, lineWidth) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      samples.forEach((sample, j) => {
        const x = toX(sample.vdd), y = toY(sample[key]);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };
    if (energyMode) {
      drawCurve('activeEnergyFj', 'rgba(56, 189, 248, 0.45)', 1.8);
      drawCurve('totalEnergyFj', '#10b981', 2.5);
    } else drawCurve('senseLatencyNs', '#f59e0b', 2.5);
    ctx.fillStyle = energyMode ? (metrics.vdd < metrics.topology.minFunctionalVdd ? '#ef4444' : '#10b981') : '#f59e0b';
    ctx.beginPath();
    ctx.arc(toX(metrics.vdd), toY(energyMode ? metrics.totalEnergyFj : metrics.senseLatencyNs), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = 'rgba(8, 19, 30, 0.90)';
    ctx.fillRect(8, legendY, width - 16, nextY - legendY + 2);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.85)';
    ctx.strokeRect(8, legendY, width - 16, nextY - legendY + 2);
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'left';
    legendLines.forEach(row => {
      ctx.fillStyle = row.color;
      ctx.fillText(row.text, 16, row.y);
    });

    if (hoverPos && hoverPos.x >= padLeft && hoverPos.x <= padLeft + plotW && hoverPos.y >= padTop && hoverPos.y <= padTop + plotH) {
      const probedVdd = minV + (maxV - minV) * (hoverPos.x - padLeft) / plotW;
      const sample = sampleAtVoltage(probedVdd);
      const value = energyMode ? sample.totalEnergyFj : sample.senseLatencyNs;
      const hx = toX(probedVdd), hy = toY(value);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hx, padTop);
      ctx.lineTo(hx, padTop + plotH);
      ctx.moveTo(padLeft, hy);
      ctx.lineTo(padLeft + plotW, hy);
      ctx.stroke();
      ctx.setLineDash([]);
      const text = energyMode ? `VDD: ${probedVdd.toFixed(2)}V | E: ${value.toFixed(1)}fJ`
        : (value >= 1000 ? `VDD: ${probedVdd.toFixed(2)}V | ${(value / 1000).toFixed(2)}µs` : `VDD: ${probedVdd.toFixed(2)}V | ${value.toFixed(0)}ns`);
      ctx.font = 'bold 9.5px "IBM Plex Mono", monospace';
      const lines = wrap(text, width - 32), pillH = lines.length * 14 + 10;
      const pillY = Math.min(padTop + plotH - pillH, Math.max(padTop, hy - pillH - 8));
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.fillRect(8, pillY, width - 16, pillH);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(8, pillY, width - 16, pillH);
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      lines.forEach((line, i) => ctx.fillText(line, 16, pillY + 15 + i * 14));
    }
  } catch (err) {
    console.warn('drawSubthresholdCanvas caught rendering error:', err);
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

  root.querySelectorAll('[style]').forEach(element => {
    if (element.style.gridTemplateColumns.includes('minmax(')) {
      element.style.gridTemplateColumns = element.style.gridTemplateColumns.replace(/minmax\((\d+px),/g, 'minmax(min(100%, $1),');
    }
    if (element.style.display === 'flex') element.style.flexWrap = 'wrap';
  });
  root.querySelectorAll('input[type=range]').forEach(element => { element.style.margin = '0'; });
  root.querySelectorAll('select, button, h3').forEach(element => {
    element.style.minWidth = '0';
    element.style.maxWidth = '100%';
    element.style.overflowWrap = 'anywhere';
  });


  function getLang() {
    return (window.HubLanguage?.get() || document.documentElement.dataset.language || document.documentElement.lang || 'en').startsWith('zh') ? 'zh' : 'en';
  }

  function update() {
    const lang = getLang();
    const exportBtn = root.querySelector('#subvt-export-csv-btn');
    if (exportBtn) {
      exportBtn.textContent = lang === 'zh' ? '📥 匯出 CSV' : '📥 Export CSV';
      exportBtn.setAttribute('aria-label', lang === 'zh' ? '匯出 CSV' : 'Export CSV');
    }
    modeEnergyBtn?.setAttribute('aria-pressed', String(currentMode === 'voltage_energy_curve'));
    modeLatencyBtn?.setAttribute('aria-pressed', String(currentMode === 'read_latency_failure'));
    const metrics = calculateSubthresholdMetrics({
      presetId: currentPresetId,
      topologyId: currentTopologyId,
      customVdd: vddSlider ? Number(vddSlider.value) : undefined,
      customTempC: tempSlider ? Number(tempSlider.value) : undefined,
      customCapacityKb: capacitySlider ? Number(capacitySlider.value) : undefined
    });

    // Update Slider Labels & A11y Attributes
    const vddValEl = root.querySelector('#subvt-vdd-val');
    if (vddValEl) vddValEl.textContent = `${metrics.vdd.toFixed(2)} V`;
    if (vddSlider) {
      vddSlider.setAttribute('aria-valuenow', metrics.vdd.toFixed(2));
      vddSlider.setAttribute('aria-valuetext', `${metrics.vdd.toFixed(2)} V`);
    }

    const tempValEl = root.querySelector('#subvt-temp-val');
    if (tempValEl) tempValEl.textContent = `${metrics.tempC} °C`;
    if (tempSlider) {
      tempSlider.setAttribute('aria-valuenow', String(metrics.tempC));
      tempSlider.setAttribute('aria-valuetext', `${metrics.tempC} °C`);
    }

    const capacityValEl = root.querySelector('#subvt-capacity-val');
    if (capacityValEl) capacityValEl.textContent = `${metrics.capacityKb} Kb`;
    if (capacitySlider) {
      capacitySlider.setAttribute('aria-valuenow', String(metrics.capacityKb));
      capacitySlider.setAttribute('aria-valuetext', `${metrics.capacityKb} Kb`);
    }

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

    syncMetricCopy([energyEl, latencyEl, leakageEl, scoreEl]);

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
      drawSubthresholdCanvas(canvas, metrics, currentMode, lang, hoverPos);
    }
  }

  function syncPresetDropdown() {
    if (!presetSelect) return;
    const currentVdd = parseFloat(vddSlider?.value);
    const currentTemp = parseFloat(tempSlider?.value);
    const matchedPreset = Object.entries(LOW_VOLTAGE_SUPPLY_PRESETS).find(([_, p]) =>
      Math.abs(p.nominalVdd - currentVdd) < 0.001 && Math.abs(p.ambientTempC - currentTemp) < 0.1
    );
    let customOpt = presetSelect.querySelector('option[value="custom"]');
    if (!matchedPreset) {
      if (!customOpt) {
        customOpt = document.createElement('option');
        customOpt.value = 'custom';
        customOpt.setAttribute('data-lang-zh', '自訂規格參數 (Custom)');
        customOpt.setAttribute('data-lang-en', 'Custom Parameters');
        presetSelect.appendChild(customOpt);
      }
      const lang = (window.HubLanguage?.get() || document.documentElement.dataset.language || 'en') === 'zh' ? 'zh' : 'en';
      customOpt.textContent = lang === 'zh' ? '自訂規格參數 (Custom)' : 'Custom Parameters';
      presetSelect.value = 'custom';
    } else {
      presetSelect.value = matchedPreset[0];
    }
  }

  // Pointer interactions for Canvas Crosshair Probe
  let hoverPos = null;
  if (canvas) {
    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      hoverPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      const lang = getLang();
      const metrics = calculateSubthresholdMetrics({
        presetId: currentPresetId,
        customVdd: vddSlider ? Number(vddSlider.value) : undefined,
        customTempC: tempSlider ? Number(tempSlider.value) : undefined,
        customCapacityKb: capacitySlider ? Number(capacitySlider.value) : undefined,
        topologyId: currentTopologyId,
      });
      drawSubthresholdCanvas(canvas, metrics, currentMode, lang, hoverPos);
    });

    canvas.addEventListener('pointerleave', () => {
      hoverPos = null;
      update();
    });
  }

  // Event Listeners
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      currentPresetId = e.target.value;
      if (currentPresetId === 'custom') return;
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

  const handleSliderInput = () => {
    syncPresetDropdown();
    update();
  };

  if (vddSlider) vddSlider.addEventListener('input', handleSliderInput);
  if (tempSlider) tempSlider.addEventListener('input', handleSliderInput);
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

  // Export CSV Action
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

  const btnContainer = modeLatencyBtn?.parentNode;
  if (btnContainer && !btnContainer.querySelector('#subvt-export-csv-btn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'subvt-export-csv-btn';
    exportBtn.type = 'button';
    exportBtn.style.cssText = 'margin-left: auto; padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.4); background: rgba(15, 23, 42, 0.6); color: #38bdf8; cursor: pointer;';
    const lang = (window.HubLanguage?.get() || document.documentElement.dataset.language || 'en') === 'zh' ? 'zh' : 'en';
    exportBtn.textContent = lang === 'zh' ? '📥 匯出 CSV' : '📥 Export CSV';
    exportBtn.addEventListener('click', () => {
      const curTemp = tempSlider ? Number(tempSlider.value) : undefined;
      let csv = 'VDD_V,DynamicEnergy_fJ,LeakageEnergy_fJ,TotalEnergy_fJ,SenseLatency_ns\n';
      for (let j = 0; j <= 60; j++) {
        const v = 0.25 + (1.20 - 0.25) * (j / 60);
        const m = calculateSubthresholdMetrics({
          presetId: currentPresetId,
          customVdd: v,
          customTempC: curTemp,
          customCapacityKb: capacitySlider ? Number(capacitySlider.value) : undefined,
          topologyId: currentTopologyId,
        });
        csv += `${v.toFixed(3)},${m.activeEnergyFj.toFixed(3)},${m.leakageEnergyFj.toFixed(3)},${m.totalEnergyFj.toFixed(3)},${m.senseLatencyNs.toFixed(2)}\n`;
      }
      downloadCsv(`subthreshold_simulation_${currentTopologyId}.csv`, csv);
    });
    btnContainer.appendChild(exportBtn);
  }

  // Language, mutation and responsive ResizeObserver listeners
  window.addEventListener('hub:language-change', update);
  window.addEventListener('languagechange', update);
  window.addEventListener('resize', update);

  if (typeof ResizeObserver !== 'undefined' && canvas) {
    const ro = new ResizeObserver(() => update());
    ro.observe(canvas);
  }

  const observer = new MutationObserver(() => update());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-theme'] });

  // Initial render
  update();
}
