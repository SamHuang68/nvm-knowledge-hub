/**
 * @fileoverview 3D Chiplet & 2.5D CoWoS Heterogeneous Integration eNVM Physical Simulator
 * 
 * First-principles simulation of 3D Chiplet / 2.5D Advanced Packaging (TSMC CoWoS, SoIC,
 * Intel Foveros) thermal-mechanical stress, CTE mismatch delamination, and vertical D2D
 * micro-bump / Cu-Cu hybrid bonding parasitic RC read latency.
 * 
 * Physics Foundations:
 * 1. Thermal-Mechanical Shear Stress from CTE Mismatch:
 *    τ_interface = G_eff * (α_Cu - α_Si) * ΔT * L / (2 * t_joint).
 *    Where α_Cu ≈ 16.5 ppm/K, α_Si ≈ 2.6 ppm/K, Low-k dielectric delamination threshold.
 * 2. 3D Vertical Interconnect Parasitic RC & Read Latency:
 *    C_interconnect = C_tsv + C_bump (or C_bond), R_interconnect = R_tsv + R_contact.
 *    t_D2D_latency = 0.69 * (R_drv + R_interconnect) * (C_load + C_interconnect).
 * 3. Thermal Stacking Junction Temperature:
 *    T_j = T_ambient + P_compute * θ_TIM + P_eNVM * θ_silicon.
 * 4. Micro-Filament Retention Integrity under 150°C Thermal Stacking.
 * 
 * @author SamHuang68
 * @license MIT
 */

/**
 * Advanced Packaging Presets
 * @typedef {Object} ChipletPackagingPreset
 * @property {string} id
 * @property {string} packagingClass Packaging Technology Class
 * @property {number} pitchUm Interconnect Pitch in micrometers
 * @property {number} capFf Interconnect Parasitic Capacitance in fF
 * @property {number} resMOhm Interconnect Contact Resistance in mΩ
 * @property {number} thermalResistanceCPerW Effective Packaging Thermal Resistance in °C/W
 * @property {{name: string, desc: string}} zh Traditional Chinese metadata
 * @property {{name: string, desc: string}} en English metadata
 */

export const CHIPLET_PACKAGING_PRESETS = Object.freeze({
  tsmc_soic_hybrid: {
    id: 'tsmc_soic_hybrid',
    packagingClass: '3D Wafer-on-Wafer (SoIC)',
    pitchUm: 2.5,
    capFf: 1.2,
    resMOhm: 8.5,
    thermalResistanceCPerW: 0.18,
    zh: {
      name: 'TSMC SoIC 3D 無凸塊晶圓級混合鍵合 (Cu-Cu Hybrid)',
      desc: '間距 < 3µm，超微電容 (< 1.5 fF)，近原生矽互連延遲，面接觸高熱傳導'
    },
    en: {
      name: 'TSMC SoIC 3D Bumpless Cu-Cu Hybrid Bonding',
      desc: 'Pitch < 3µm, ultra-low capacitance (< 1.5 fF), near-monolithic latency, high thermal conduction'
    }
  },
  tsmc_cowos_s: {
    id: 'tsmc_cowos_s',
    packagingClass: '2.5D Silicon Interposer (CoWoS-S)',
    pitchUm: 40.0,
    capFf: 22.0,
    resMOhm: 45.0,
    thermalResistanceCPerW: 0.32,
    zh: {
      name: 'TSMC CoWoS-S 2.5D 矽中介層 (Silicon Interposer)',
      desc: '典型微凸塊 (40µm 間距)，具備 TSV 垂直通路與中介層微細金屬走線，橫向散熱均勻'
    },
    en: {
      name: 'TSMC CoWoS-S 2.5D Silicon Interposer',
      desc: 'Typical micro-bump (40µm pitch) with TSV pathways and fine-pitch RDL, balanced lateral heat spreading'
    }
  },
  intel_foveros_3d: {
    id: 'intel_foveros_3d',
    packagingClass: '3D Face-to-Face Stacking (Foveros)',
    pitchUm: 25.0,
    capFf: 14.0,
    resMOhm: 28.0,
    thermalResistanceCPerW: 0.26,
    zh: {
      name: 'Intel Foveros 3D 面對面堆疊 (Direct F2F Stacking)',
      desc: '微凸塊間距 25µm，計算晶粒直接壓合於基礎底座 (Base Die)，垂直熱沉積顯著'
    },
    en: {
      name: 'Intel Foveros 3D Face-to-Face Direct Stacking',
      desc: 'Micro-bump pitch 25µm, compute tile directly bonded over base die, pronounced vertical heat accumulation'
    }
  },
  organic_substrate_mcm: {
    id: 'organic_substrate_mcm',
    packagingClass: 'Organic MCM Multi-Chip Module',
    pitchUm: 110.0,
    capFf: 85.0,
    resMOhm: 120.0,
    thermalResistanceCPerW: 0.58,
    zh: {
      name: '傳統有機基板多晶片模組 (Organic MCM BGA)',
      desc: '常規覆晶 BGA 凸塊 (110µm)，寄生電容與走線電阻高，熱機械界面易受熱應力形變'
    },
    en: {
      name: 'Conventional Organic Substrate Multi-Chip Module (MCM)',
      desc: 'Standard flip-chip BGA bumps (110µm), high parasitic RC, thermal expansion induces significant warpage'
    }
  }
});

/**
 * Chiplet eNVM Topology Specifications
 * @typedef {Object} ChipletNvmTopology
 * @property {string} id
 * @property {string} placementLocation Physical Placement Layer
 * @property {number} baseLatencyNs Native Read Latency in ns
 * @property {number} maxJunctionTempC Maximum Safe Junction Temperature in °C
 * @property {number} shearStressToleranceMpa Maximum Tolerable Interface Shear Stress in MPa
 * @property {number} thermalConductivityWPerMK Thermal Conductivity in W/(m·K)
 * @property {{name: string, type: string, pros: string, cons: string}} zh Traditional Chinese metadata
 * @property {{name: string, type: string, pros: string, cons: string}} en English metadata
 */

export const CHIPLET_NVM_TOPOLOGIES = Object.freeze({
  antifuse_base_die: {
    id: 'antifuse_base_die',
    placementLocation: 'Base Die / Active Interposer',
    baseLatencyNs: 4.5,
    maxJunctionTempC: 175.0,
    shearStressToleranceMpa: 220.0,
    thermalConductivityWPerMK: 130.0,
    zh: {
      name: 'AntiFuse 安全信任根底座晶粒 (Base Die / 0-Mask)',
      type: '0-Mask 氧化層擊穿導電微絲 (位於底層或主動中介層)',
      pros: '微絲經熱退火後熱穩定性極高，耐受 175°C 熱堆疊；可整合於低成本底層晶粒，零光罩光阻污染。',
      cons: '為單次燒寫 (OTP)，不支援動態高頻資料覆寫快取。'
    },
    en: {
      name: 'AntiFuse RoT Base Die (Active Interposer / 0-Mask)',
      type: '0-Mask Oxide Breakdown Filament in Base Die',
      pros: 'Filament annealing provides exceptional thermal stability up to 175°C; integrates into cost-effective base die with 0 extra masks.',
      cons: 'One-Time Programmable (OTP), does not support runtime dynamic data cache.'
    }
  },
  beol_mram_top_cache: {
    id: 'beol_mram_top_cache',
    placementLocation: 'Top Cache Chiplet',
    baseLatencyNs: 9.8,
    maxJunctionTempC: 125.0,
    shearStressToleranceMpa: 95.0,
    thermalConductivityWPerMK: 45.0,
    zh: {
      name: 'BEOL STT-MRAM 高速快取晶粒 (Top Chiplet)',
      type: '後段自旋轉矩磁性穿隧結 (MTJ 陣列)',
      pros: '讀寫速度接近 SRAM，支援百萬次非揮發權重記憶，非常適合大模型權重就近暫存。',
      cons: '磁穿隧薄膜 (MgO) 對晶片封裝壓應力極為敏感；溫度 > 125°C 時磁熱擾動加劇，數據保留急劇劣化。'
    },
    en: {
      name: 'BEOL STT-MRAM Top Cache Chiplet',
      type: 'BEOL Spin-Transfer Torque MTJ Array',
      pros: 'Near-SRAM speed, unlimited endurance for AI weight caching next to compute core.',
      cons: 'MgO barrier susceptible to package packaging stress; thermal agitation degrades retention severely above 125°C.'
    }
  },
  embedded_flash_sidecar: {
    id: 'embedded_flash_sidecar',
    placementLocation: 'Sidecar Companion Die (28nm/40nm)',
    baseLatencyNs: 22.0,
    maxJunctionTempC: 105.0,
    shearStressToleranceMpa: 110.0,
    thermalConductivityWPerMK: 85.0,
    zh: {
      name: '獨立 eFlash 安全小晶粒 (28nm Sidecar Die)',
      type: '浮閘穿隧儲存晶粒 (經 D2D 匯流排連接)',
      pros: '成熟製程容量大 (可達 64MB)，便於多方代工採購。',
      cons: '跨晶粒走線帶來高延遲；高壓電荷泵在 2.5D 微凸塊寄生電容下產生電源波動；高溫留存限於 105°C。'
    },
    en: {
      name: 'Discrete eFlash Companion Chiplet (28nm Sidecar)',
      type: 'Floating-Gate Tunneling Die via D2D Bus',
      pros: 'Mature process high density (up to 64MB), flexible multi-foundry procurement.',
      cons: 'Long D2D trace incurs latency; charge pump induces supply ripples over micro-bumps; retention capped at 105°C.'
    }
  },
  sram_cache_stack: {
    id: 'sram_cache_stack',
    placementLocation: 'Direct 3D Stacked Cache (L3/V-Cache)',
    baseLatencyNs: 1.8,
    maxJunctionTempC: 110.0,
    shearStressToleranceMpa: 140.0,
    thermalConductivityWPerMK: 110.0,
    zh: {
      name: '3D 垂直堆疊 SRAM 快取晶粒 (V-Cache 对照組)',
      type: '6T/8T 靜態揮發性暫存單元 (對照基準)',
      pros: '超低延遲 (< 2ns)，讀寫頻寬極高。',
      cons: '高溫下次閾值靜態漏電流爆炸，堆疊在 200W 算力晶粒下方會產生巨大熱失控風險；斷電即失。'
    },
    en: {
      name: '3D Stacked SRAM Cache Tile (V-Cache Control Baseline)',
      type: '6T/8T Static Volatile RAM Cell (Reference Baseline)',
      pros: 'Ultra-low latency (< 2ns), enormous read/write bandwidth.',
      cons: 'Static leakage spikes exponentially under high thermal stacking; volatile upon power loss.'
    }
  }
});

/**
 * Calculates 3D Chiplet & Heterogeneous Packaging eNVM Metrics from First Principles
 * 
 * @param {Object} params
 * @param {string} params.presetId
 * @param {string} params.topologyId
 * @param {number} [params.customComputePowerW] Compute Die Heat Dissipation (W)
 * @param {number} [params.customD2dLengthMm] D2D Trace Length (mm)
 * @param {number} [params.customDeltaTempC] Thermal Cycling Temperature Delta (°C)
 * @returns {Object} Comprehensive packaging and electrical metrics
 */
export function calculateChipletHeteroMetrics(params = {}) {
  const preset = CHIPLET_PACKAGING_PRESETS[params.presetId] || CHIPLET_PACKAGING_PRESETS.tsmc_soic_hybrid;
  const topology = CHIPLET_NVM_TOPOLOGIES[params.topologyId] || CHIPLET_NVM_TOPOLOGIES.antifuse_base_die;

  const computePowerW = params.customComputePowerW !== undefined ? Number(params.customComputePowerW) : 120.0;
  const d2dLengthMm = params.customD2dLengthMm !== undefined ? Number(params.customD2dLengthMm) : 3.5;
  const deltaTempC = params.customDeltaTempC !== undefined ? Number(params.customDeltaTempC) : 110.0;

  // 1. Thermal Stacking Junction Temperature:
  // Tj = Tambient + P_compute * θ_eff + P_eNVM * θ_silicon (Tambient = 45°C)
  const tAmbient = 45.0;
  const eNvmPowerW = topology.id === 'sram_cache_stack' ? 12.0 : 0.8;
  const deltaTCompute = computePowerW * preset.thermalResistanceCPerW;
  const deltaTeNvm = eNvmPowerW * (1.0 / topology.thermalConductivityWPerMK * 12.0);
  const totalJunctionTempC = tAmbient + deltaTCompute + deltaTeNvm;

  // 2. Thermal-Mechanical Interface Shear Stress (MPa):
  // τ = G_eff * ΔCTE * ΔT * L / (2 * t_joint)
  // Cu = 16.5 ppm/K, Si = 2.6 ppm/K -> ΔCTE = 13.9 ppm/K
  const deltaCte = 13.9e-6;
  const gEffGpa = 24.0; // Effective shear modulus of bonding interface in GPa
  const jointThicknessUm = Math.max(0.8, preset.pitchUm * 0.4);
  const dieDiagonalMm = 14.0;
  const interfaceShearStressMpa = (gEffGpa * 1000.0) * deltaCte * deltaTempC * (dieDiagonalMm * 1000.0) / (2.0 * jointThicknessUm * 1000.0) * 0.08;

  // 3. Vertical & Lateral D2D Interconnect Parasitics:
  // Trace RDL: ~15 mΩ/mm, C: ~0.12 pF/mm
  const rdlResistanceMOhm = d2dLengthMm * 16.0;
  const rdlCapacitanceFf = d2dLengthMm * 130.0;
  const totalD2dCapFf = preset.capFf + rdlCapacitanceFf;
  const totalD2dResMOhm = preset.resMOhm + rdlResistanceMOhm;

  // 4. End-to-End Read Latency (ns):
  // t_read = t_base + 0.69 * (R_drv + R_d2d) * (C_load + C_d2d)
  const rDrvOhm = 80.0;
  const cLoadFf = 25.0;
  const totalR = rDrvOhm + (totalD2dResMOhm / 1000.0);
  const totalC = (cLoadFf + totalD2dCapFf) * 1e-15;
  const d2dFlightLatencyNs = 0.69 * totalR * totalC * 1e9;
  const effectiveReadLatencyNs = topology.baseLatencyNs + d2dFlightLatencyNs;

  // 5. High-Temperature Retention Degradation Factor (Arrhenius Model):
  // Lifetime AF = exp(Ea/kB * (1/T_nom - 1/T_actual))
  const eaEv = 1.1;
  const kb = 8.617e-5;
  const tNomK = 300.0 + 85.0;
  const tActK = 300.0 + totalJunctionTempC;
  const retentionAccelerationFactor = Math.exp((eaEv / kb) * ((1.0 / tNomK) - (1.0 / tActK)));
  const nominalRetentionYears = topology.id === 'antifuse_base_die' ? 20.0 : (topology.id === 'beol_mram_top_cache' ? 10.0 : 5.0);
  const actualRetentionYears = Math.max(0.1, nominalRetentionYears / Math.max(1.0, retentionAccelerationFactor));

  // 6. Overall 3D Packaging Reliability Index (0 to 100):
  let packagingScore = 100.0;
  if (totalJunctionTempC > topology.maxJunctionTempC) {
    packagingScore -= 45.0;
  } else if (totalJunctionTempC > topology.maxJunctionTempC - 15.0) {
    packagingScore -= 20.0;
  }

  if (interfaceShearStressMpa > topology.shearStressToleranceMpa) {
    packagingScore -= 40.0;
  } else if (interfaceShearStressMpa > topology.shearStressToleranceMpa * 0.7) {
    packagingScore -= 18.0;
  }

  if (effectiveReadLatencyNs > 20.0) {
    packagingScore -= 15.0;
  }
  packagingScore = Math.max(0.0, Math.min(100.0, Math.round(packagingScore)));

  // 7. Status Verdict
  let verdictStatus = 'QUALIFIED';
  if (packagingScore >= 80) verdictStatus = 'OPTIMAL';
  else if (packagingScore >= 55) verdictStatus = 'MARGINAL';
  else verdictStatus = 'DELAMINATION_RISK';

  return {
    preset,
    topology,
    computePowerW,
    d2dLengthMm,
    deltaTempC,
    totalJunctionTempC,
    interfaceShearStressMpa,
    totalD2dCapFf,
    totalD2dResMOhm,
    effectiveReadLatencyNs,
    d2dFlightLatencyNs,
    actualRetentionYears,
    packagingScore,
    verdictStatus
  };
}

/**
 * Draws High-Resolution 3D Chiplet & Heterogeneous Canvas
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'thermal_stress_profile' | 'd2d_rc_latency'} mode
 * @param {'zh' | 'en'} lang
 */
export function drawChipletHeteroCanvas(canvas, metrics, mode, lang = 'zh') {
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
  ctx.fillStyle = '#0b1120';
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

  if (mode === 'thermal_stress_profile') {
    // Mode 1: Compute Die Power (0W to 300W) vs Junction Temperature (°C) & Shear Stress (MPa)
    const minP = 0.0;
    const maxP = 300.0;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    for (let j = 0; j <= 6; j++) {
      const p = Math.round(minP + (maxP - minP) * (j / 6));
      const x = padLeft + (plotW / 6) * j;
      ctx.fillText(`${p} W`, x, height - padBottom + 16);
    }

    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const t = Math.round(200 * (1 - i / 5)); // 0 to 200°C
      const y = padTop + (plotH / 5) * i + 4;
      ctx.fillText(`${t} °C`, padLeft - 8, y);
    }

    ctx.fillStyle = '#f59e0b';
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lang === 'zh' ? '接面溫度 Tj (°C)' : 'Junction Temp Tj (°C)', padLeft, padTop - 12);

    ctx.textAlign = 'right';
    ctx.fillText(lang === 'zh' ? '頂層算力功耗 (Watts)' : 'Compute Power (Watts)', width - padRight, height - 12);

    // Safe Temp Ceiling Line
    const safeCeilY = padTop + plotH * (1.0 - metrics.topology.maxJunctionTempC / 200.0);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, safeCeilY);
    ctx.lineTo(padLeft + plotW, safeCeilY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve 1: Junction Temperature vs Power
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let j = 0; j <= 60; j++) {
      const curP = minP + (maxP - minP) * (j / 60);
      const curTj = 45.0 + curP * metrics.preset.thermalResistanceCPerW + 1.5;
      const x = padLeft + (plotW / 60) * j;
      const y = padTop + plotH * (1.0 - Math.min(200.0, curTj) / 200.0);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Curve 2: Shear Stress (scaled to 0-200 MPa range)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    for (let j = 0; j <= 60; j++) {
      const curP = minP + (maxP - minP) * (j / 60);
      const deltaT = 40.0 + curP * 0.35;
      const curStress = metrics.interfaceShearStressMpa * (deltaT / Math.max(1.0, metrics.deltaTempC));
      const x = padLeft + (plotW / 60) * j;
      const y = padTop + plotH * (1.0 - Math.min(200.0, curStress) / 200.0);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current Operating Point Marker
    const opX = padLeft + plotW * ((metrics.computePowerW - minP) / (maxP - minP));
    const opY = padTop + plotH * (1.0 - Math.min(200.0, metrics.totalJunctionTempC) / 200.0);

    ctx.fillStyle = metrics.totalJunctionTempC > metrics.topology.maxJunctionTempC ? '#ef4444' : '#10b981';
    ctx.beginPath();
    ctx.arc(opX, opY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Legend
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(lang === 'zh' ? '— 接面溫升 Tj' : '— Junction Temp Tj', padLeft + 10, padTop + 16);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(lang === 'zh' ? '— 界面剪切應力 τ' : '— Shear Stress τ', padLeft + 130, padTop + 16);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.fillText(`${lang === 'zh' ? '最高上限' : 'Max Limit'}: ${metrics.topology.maxJunctionTempC}°C`, padLeft + 260, padTop + 16);

  } else {
    // Mode 2: D2D Interconnect Trace Length (0 to 10mm) vs Read Latency (ns)
    const minL = 0.0;
    const maxL = 10.0;

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    for (let j = 0; j <= 5; j++) {
      const l = (minL + (maxL - minL) * (j / 5)).toFixed(1);
      const x = padLeft + (plotW / 5) * j;
      ctx.fillText(`${l} mm`, x, height - padBottom + 16);
    }

    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const ns = (30 * (1 - i / 5)).toFixed(0);
      const y = padTop + (plotH / 5) * i + 4;
      ctx.fillText(`${ns} ns`, padLeft - 8, y);
    }

    ctx.fillStyle = '#10b981';
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lang === 'zh' ? '讀取存取延遲 (ns)' : 'Total Read Latency (ns)', padLeft, padTop - 12);

    ctx.textAlign = 'right';
    ctx.fillText(lang === 'zh' ? 'D2D 走線長度 (mm)' : 'D2D Trace Length (mm)', width - padRight, height - 12);

    // Plot Latency Curves for Selected Preset vs Others
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let j = 0; j <= 50; j++) {
      const curL = minL + (maxL - minL) * (j / 50);
      const rdlCap = curL * 130.0;
      const rdlRes = curL * 16.0;
      const totalR = 80.0 + ((metrics.preset.resMOhm + rdlRes) / 1000.0);
      const totalC = (25.0 + metrics.preset.capFf + rdlCap) * 1e-15;
      const lat = metrics.topology.baseLatencyNs + 0.69 * totalR * totalC * 1e9;
      const x = padLeft + (plotW / 50) * j;
      const y = padTop + plotH * (1.0 - Math.min(30.0, lat) / 30.0);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Operating point
    const opX = padLeft + plotW * ((metrics.d2dLengthMm - minL) / (maxL - minL));
    const opY = padTop + plotH * (1.0 - Math.min(30.0, metrics.effectiveReadLatencyNs) / 30.0);

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(opX, opY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw Legend Backdrop Card to prevent overlap
    const legBoxW = Math.min(plotW - 20, 420);
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
    ctx.fillStyle = '#10b981';
    ctx.fillText(`${lang === 'zh' ? '目前架構' : 'Active'}: ${lang === 'zh' ? metrics.preset.zh.name : metrics.preset.en.name}`, legBoxX + 8, legBoxY + 16);
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`Latency = ${metrics.effectiveReadLatencyNs.toFixed(2)} ns`, legBoxX + 260, legBoxY + 16);
  }
}

/**
 * Initializes the 3D Chiplet & Heterogeneous eNVM Simulator
 * 
 * @param {string} containerId
 */
export function initChipletHeteroSimulator(containerId) {
  const root = document.getElementById(containerId);
  if (!root) return;

  let currentPresetId = 'tsmc_soic_hybrid';
  let currentTopologyId = 'antifuse_base_die';
  let currentMode = 'thermal_stress_profile';

  const presetSelect = root.querySelector('#chiplet-preset-select');
  const topologySelect = root.querySelector('#chiplet-topology-select');
  const powerSlider = root.querySelector('#chiplet-power-slider');
  const lengthSlider = root.querySelector('#chiplet-length-slider');
  const deltaTSlider = root.querySelector('#chiplet-deltat-slider');
  const canvas = root.querySelector('#chiplet-hetero-canvas');

  const modeThermalBtn = root.querySelector('#chiplet-mode-thermal-btn');
  const modeLatencyBtn = root.querySelector('#chiplet-mode-latency-btn');

  function getLang() {
    return document.documentElement.lang === 'zh-TW' || document.documentElement.lang === 'zh' ? 'zh' : 'en';
  }

  function update() {
    const lang = getLang();
    const metrics = calculateChipletHeteroMetrics({
      presetId: currentPresetId,
      topologyId: currentTopologyId,
      customComputePowerW: powerSlider ? Number(powerSlider.value) : undefined,
      customD2dLengthMm: lengthSlider ? Number(lengthSlider.value) : undefined,
      customDeltaTempC: deltaTSlider ? Number(deltaTSlider.value) : undefined
    });

    // Update Slider Labels
    const powerValEl = root.querySelector('#chiplet-power-val');
    if (powerValEl) powerValEl.textContent = `${metrics.computePowerW} W`;

    const lengthValEl = root.querySelector('#chiplet-length-val');
    if (lengthValEl) lengthValEl.textContent = `${metrics.d2dLengthMm.toFixed(1)} mm`;

    const deltaTValEl = root.querySelector('#chiplet-deltat-val');
    if (deltaTValEl) deltaTValEl.textContent = `ΔT = ${metrics.deltaTempC}°C`;

    // Update Metric Badges
    const tempEl = root.querySelector('#chiplet-metric-temp');
    if (tempEl) {
      tempEl.textContent = `${metrics.totalJunctionTempC.toFixed(1)} °C`;
      tempEl.style.color = metrics.totalJunctionTempC <= metrics.topology.maxJunctionTempC ? '#10b981' : '#ef4444';
    }

    const stressEl = root.querySelector('#chiplet-metric-stress');
    if (stressEl) {
      stressEl.textContent = `${metrics.interfaceShearStressMpa.toFixed(1)} MPa`;
      stressEl.style.color = metrics.interfaceShearStressMpa <= metrics.topology.shearStressToleranceMpa ? '#38bdf8' : '#ef4444';
    }

    const latencyEl = root.querySelector('#chiplet-metric-latency');
    if (latencyEl) latencyEl.textContent = `${metrics.effectiveReadLatencyNs.toFixed(2)} ns`;

    const scoreEl = root.querySelector('#chiplet-metric-score');
    if (scoreEl) {
      scoreEl.textContent = `${metrics.packagingScore} / 100`;
      scoreEl.style.color = metrics.packagingScore >= 80 ? '#10b981' : (metrics.packagingScore >= 55 ? '#f59e0b' : '#ef4444');
    }

    // Update Verdict Text
    const verdictEl = root.querySelector('#chiplet-verdict-banner');
    if (verdictEl) {
      const topoName = lang === 'zh' ? metrics.topology.zh.name : metrics.topology.en.name;
      const pros = lang === 'zh' ? metrics.topology.zh.pros : metrics.topology.en.pros;
      const cons = lang === 'zh' ? metrics.topology.zh.cons : metrics.topology.en.cons;

      verdictEl.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 4px; color: ${metrics.packagingScore >= 80 ? '#10b981' : (metrics.packagingScore >= 55 ? '#f59e0b' : '#ef4444')}">
          ${metrics.verdictStatus === 'OPTIMAL' ? (lang === 'zh' ? '✓ 異質整合熱應力與互連合格 (3D Packaging Optimal)' : '✓ 3D Packaging Qualified & Optimal') :
            (metrics.verdictStatus === 'MARGINAL' ? (lang === 'zh' ? '⚠ 接近熱應力臨界點 (Marginal Thermal Stress)' : '⚠ Marginal Thermal-Mechanical Boundary') :
             (lang === 'zh' ? '✗ 界面剝離或熱失控高風險 (Critical Delamination Risk)' : '✗ Critical Delamination & Thermal Failure Risk'))}
        </div>
        <div style="font-size: 0.85rem; line-height: 1.45; color: #cbd5e1;">
          <strong>${topoName}:</strong> ${pros} <span style="opacity: 0.85">${cons}</span>
        </div>
      `;
    }

    // Draw Canvas
    if (canvas) {
      drawChipletHeteroCanvas(canvas, metrics, currentMode, lang);
    }
  }

  // Event Listeners
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      currentPresetId = e.target.value;
      update();
    });
  }

  if (topologySelect) {
    topologySelect.addEventListener('change', (e) => {
      currentTopologyId = e.target.value;
      update();
    });
  }

  if (powerSlider) powerSlider.addEventListener('input', update);
  if (lengthSlider) lengthSlider.addEventListener('input', update);
  if (deltaTSlider) deltaTSlider.addEventListener('input', update);

  if (modeThermalBtn) {
    modeThermalBtn.addEventListener('click', () => {
      currentMode = 'thermal_stress_profile';
      modeThermalBtn.classList.add('active');
      if (modeLatencyBtn) modeLatencyBtn.classList.remove('active');
      update();
    });
  }

  if (modeLatencyBtn) {
    modeLatencyBtn.addEventListener('click', () => {
      currentMode = 'd2d_rc_latency';
      modeLatencyBtn.classList.add('active');
      if (modeThermalBtn) modeThermalBtn.classList.remove('active');
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
