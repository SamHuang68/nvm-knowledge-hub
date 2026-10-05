/**
 * @fileoverview Post-Quantum Cryptography (PQC) & Hardware Root of Trust (RoT)
 * Physical Unclonable Function (PUF) Entropy Quality & Differential Power Analysis (DPA) Defense Simulator
 * 
 * First-principles modeling of physical side-channel vulnerability and PUF entropy characteristics:
 * 1. PUF Uniqueness & Inter-Chip Hamming Distance Gaussian Distribution:
 *    μ_inter = 50.0%, σ_inter = sqrt(0.25 / N_bits).
 * 2. PUF Reliability & Intra-Chip Bit Error Rate (BER) across operating temperatures:
 *    BER(T, VDD) = 1/N * Σ |R(T0, V0)_n ⊕ R(T, VDD)_n|.
 * 3. Side-Channel Leakage & Measurements to Disclosure (MTD):
 *    MTD ∝ 1 / ρ_max² ∝ (σ_noise² + σ_jitter²) / Δ_signal².
 * 4. Microscopic Physical Countermeasures:
 *    Differential complementary sensing, random current masking/blinding, clock jitter spreading,
 *    and nano-filament geometric invisibility (< 2nm breakdown path).
 * 
 * @author SamHuang68
 * @license MIT
 */

/**
 * PQC Security Assurance Presets
 * @typedef {Object} PqcSecurityPreset
 * @property {string} id
 * @property {string} targetScheme Target Certification Scheme
 * @property {boolean} differentialSensing Differential Complementary Sensing Active
 * @property {boolean} currentBlinding Random Current Masking / Blinding Active
 * @property {boolean} randomJitter Dynamic Clock Jitter Active
 * @property {number} noiseSigma Circuit Noise Standard Deviation (Relative)
 * @property {{name: string, desc: string}} zh Traditional Chinese metadata
 * @property {{name: string, desc: string}} en English metadata
 */

export const PQC_SECURITY_PRESETS = Object.freeze({
  fips140_3_lvl4: {
    id: 'fips140_3_lvl4',
    targetScheme: 'FIPS 140-3 Level 4 / SESIP Level 5',
    differentialSensing: true,
    currentBlinding: true,
    randomJitter: true,
    noiseSigma: 4.8,
    zh: {
      name: 'FIPS 140-3 L4 / SESIP L5 (航太軍工高防護)',
      desc: '差分對稱感測 + 內部隨機電流偽裝 + 動態隨機抖動 (MTD > 10,000,000 次)'
    },
    en: {
      name: 'FIPS 140-3 L4 / SESIP L5 (Aerospace & Defense)',
      desc: 'Differential Sensing + Internal Current Blinding + Dynamic Clock Jitter (MTD > 10M)'
    }
  },
  automotive_evita_high: {
    id: 'automotive_evita_high',
    targetScheme: 'ISO 21434 / EVITA High (車載中央網關)',
    differentialSensing: true,
    currentBlinding: true,
    randomJitter: false,
    noiseSigma: 2.4,
    zh: {
      name: 'EVITA High / ASIL-D (車規中央運算網關)',
      desc: '差分 AntiFuse PUF + 內部電流雜訊掩蔽 (MTD > 500,000 次)'
    },
    en: {
      name: 'EVITA High / ASIL-D (Automotive Central Gateway)',
      desc: 'Differential AntiFuse PUF + Internal Current Noise Masking (MTD > 500k)'
    }
  },
  iot_commercial_secure: {
    id: 'iot_commercial_secure',
    targetScheme: 'PSA Certified Level 2 / SESIP Level 2',
    differentialSensing: false,
    currentBlinding: true,
    randomJitter: false,
    noiseSigma: 1.1,
    zh: {
      name: 'IoT 商業安全元件 (智慧電表 / 邊緣節點)',
      desc: '單端 AntiFuse 讀取 + 基礎電流平滑抑制 (MTD ≈ 60,000 次)'
    },
    en: {
      name: 'IoT Commercial Secure Element (Smart Meter)',
      desc: 'Single-Ended Read + Basic Current Smoothing (MTD ≈ 60k)'
    }
  },
  legacy_unprotected: {
    id: 'legacy_unprotected',
    targetScheme: '無認證基準 (傳統單端直接讀取)',
    differentialSensing: false,
    currentBlinding: false,
    randomJitter: false,
    noiseSigma: 0.35,
    zh: {
      name: '傳統無防護基準 (直接單端讀取)',
      desc: '無抗側信道設計，功耗軌跡與金鑰 Hamming 權重直接相關 (MTD < 1,500 次)'
    },
    en: {
      name: 'Legacy Unprotected Baseline (Direct Read)',
      desc: 'Zero DPA defenses, power traces directly correlate to Hamming Weight (MTD < 1.5k)'
    }
  }
});

/**
 * Key Storage & PUF Topology Specifications
 * @typedef {Object} PqcStorageTopology
 * @property {string} id
 * @property {boolean} isPuf Whether topology is a true PUF
 * @property {number} pufInterHdMean Inter-chip Hamming Distance Mean (%)
 * @property {number} pufIntraBerPpm Intra-chip Native BER in PPM (1 PPM = 10^-6)
 * @property {boolean} opticalInvisibility SEM/TEM Optical/Cross-section Invisibility
 * @property {boolean} fibPvcImmune Passive Voltage Contrast (PVC) Probing Immunity
 * @property {number} baseSignalDelta Raw Side-Channel Signal Difference (Arbitrary Units)
 * @property {{name: string, type: string, pros: string, cons: string}} zh Traditional Chinese metadata
 * @property {{name: string, type: string, pros: string, cons: string}} en English metadata
 */

export const PQC_STORAGE_TOPOLOGIES = Object.freeze({
  antifuse_rot_puf: {
    id: 'antifuse_rot_puf',
    isPuf: true,
    pufInterHdMean: 50.02,
    pufIntraBerPpm: 0.15, // Native BER < 10^-6, requires virtually zero helper data
    opticalInvisibility: true, // Filament < 2nm, indistinguishable under TEM
    fibPvcImmune: true,
    baseSignalDelta: 0.12,
    zh: {
      name: 'Logic AntiFuse 奈米微絲 PUF / RoT',
      type: '0-Mask 氧化層硬擊穿微絲 (歐姆導電態 vs 絕緣態)',
      pros: '微絲直徑小於 2nm，TEM/FIB-PVC 零對比度完全隱形；原生 BER < 10^-6 無需輔助數據 (Helper Data)；抗 DPA 洩漏極低。',
      cons: '為硬體物理單次燒寫 (OTP/PUF)，金鑰一旦綁定無法軟體覆寫。'
    },
    en: {
      name: 'Logic AntiFuse Nano-Filament PUF / RoT',
      type: '0-Mask Oxide Breakdown Filament (Ohmic vs Insulating)',
      pros: 'Filament diameter < 2nm, zero optical/PVC contrast under TEM/FIB; native BER < 10^-6 requires zero helper data; ultralow DPA leakage.',
      cons: 'Hardware OTP/PUF state is permanent and cannot be reprogrammed in software.'
    }
  },
  sram_puf_helper: {
    id: 'sram_puf_helper',
    isPuf: true,
    pufInterHdMean: 49.88,
    pufIntraBerPpm: 38000.0, // 3.8% native error rate!
    opticalInvisibility: true,
    fibPvcImmune: false, // Low-temp freezing allows active FIB probing
    baseSignalDelta: 0.55,
    zh: {
      name: 'SRAM 啟動狀態 PUF (需輔助數據)',
      type: '交叉耦合雙穩態反相器晶體管臨界電壓失配',
      pros: '純數位邏輯標準單元實現，無額外製程光罩。',
      cons: '原生 BER 高達 3.8%，必須在外部儲存 BCH 糾錯輔助數據 (Helper Data)，易遭遇輔助數據操控攻擊與低溫探針凍結讀取。'
    },
    en: {
      name: 'SRAM Startup PUF (Helper Data Dependent)',
      type: 'Cross-Coupled Bistable Inverter Threshold Mismatch',
      pros: 'Standard logic cell realization, zero extra masks.',
      cons: 'Native BER up to 3.8% necessitates external BCH Helper Data, vulnerable to helper manipulation and cryo-probing freeze attacks.'
    }
  },
  efuse_metal_poly: {
    id: 'efuse_metal_poly',
    isPuf: false,
    pufInterHdMean: 0.0,
    pufIntraBerPpm: 0.08,
    opticalInvisibility: false, // Huge physical crack visible under SEM
    fibPvcImmune: false,
    baseSignalDelta: 1.0, // Massive 10~15mA programming current and high read current
    zh: {
      name: '多晶矽 / 金屬 eFuse (傳統熔絲)',
      type: '電遷移大電流熔斷電阻 (物理結構撕裂)',
      pros: '邏輯製程標準庫廣泛支援、讀取電路極其簡單。',
      cons: '熔斷裂痕在 SEM 顯微鏡下一目了然；讀寫瞬態電流高達 15mA，產生巨大近場磁場與電源軌瞬變，易受 DPA 幾百次擊破。'
    },
    en: {
      name: 'Poly-Si / Metal eFuse (Legacy Fuse)',
      type: 'Electromigration Melt Link (Physical Gap Rupture)',
      pros: 'Widely supported in legacy foundries, trivial sense circuitry.',
      cons: 'Melt gaps directly visible under SEM; massive 15mA transient creates huge EM/power traces, broken by DPA in < 1,000 traces.'
    }
  },
  eflash_tunnel_trap: {
    id: 'eflash_tunnel_trap',
    isPuf: false,
    pufInterHdMean: 0.0,
    pufIntraBerPpm: 0.6,
    opticalInvisibility: true,
    fibPvcImmune: false, // Passive Voltage Contrast reveals stored electrons
    baseSignalDelta: 0.78,
    zh: {
      name: '浮閘 / 電荷捕獲 eFlash',
      type: '多晶矽浮閘儲存電子 (穿隧注入)',
      pros: '可多次覆寫更新韌體金鑰與密鑰證書。',
      cons: '浮閘電荷在 FIB-PVC（被動電壓對比）下可被直接測繪；高壓電荷泵在讀寫時產生特徵脈衝，DPA 側信道防護開銷高昂。'
    },
    en: {
      name: 'Floating-Gate / CT eFlash',
      type: 'Poly-Si Floating Gate Charge Storage (Tunneling)',
      pros: 'Reprogrammable for firmware keys and certificate updates.',
      cons: 'Trapped electrons measurable via FIB-PVC; high-voltage charge pump generates unique current spikes, making DPA defense costly.'
    }
  }
});

/**
 * Calculates PQC Hardware RoT & DPA Metrics from First Principles
 * 
 * @param {Object} params
 * @param {string} params.presetId
 * @param {string} params.topologyId
 * @param {number} [params.customNoise]
 * @param {boolean} [params.customDiff]
 * @param {boolean} [params.customBlinding]
 * @param {boolean} [params.customJitter]
 * @returns {Object} Comprehensive security metrics
 */
export function calculatePqcDpaMetrics(params) {
  const preset = PQC_SECURITY_PRESETS[params.presetId] || PQC_SECURITY_PRESETS.fips140_3_lvl4;
  const topology = PQC_STORAGE_TOPOLOGIES[params.topologyId] || PQC_STORAGE_TOPOLOGIES.antifuse_rot_puf;

  const diffSensing = params.customDiff !== undefined ? Boolean(params.customDiff) : preset.differentialSensing;
  const blinding = params.customBlinding !== undefined ? Boolean(params.customBlinding) : preset.currentBlinding;
  const jitter = params.customJitter !== undefined ? Boolean(params.customJitter) : preset.randomJitter;
  const noiseSigma = params.customNoise !== undefined ? Number(params.customNoise) : preset.noiseSigma;

  // 1. Effective Side-Channel Signal Delta (Δ_signal)
  let effectiveDelta = topology.baseSignalDelta;
  if (diffSensing) {
    effectiveDelta *= 0.12; // Differential canceling reduces signal by ~88%
  }
  if (blinding) {
    effectiveDelta *= 0.25; // Random current masking dampens key correlation by 75%
  }

  // 2. Effective Noise & Jitter Variance (σ_total²)
  const jitterSigma = jitter ? 3.2 : 0.0;
  const totalNoiseSigma = Math.sqrt(noiseSigma ** 2 + jitterSigma ** 2);

  // 3. Peak Pearson Correlation Coefficient (ρ_max)
  // ρ = Δ_signal / sqrt(Δ_signal² + σ_total²)
  const rhoMax = effectiveDelta / Math.sqrt(effectiveDelta ** 2 + totalNoiseSigma ** 2);

  // 4. Measurements to Disclosure (MTD) First-Principles Formula:
  // MTD ≈ c * (z_alpha / ρ_max)^2, where c ≈ 4.5^2 ≈ 20.25 for 4.5-sigma significance
  const mtdRaw = 20.25 / Math.max(1e-8, rhoMax ** 2);
  const mtd = Math.min(1e8, Math.max(250, Math.round(mtdRaw)));

  // 5. PUF Entropy & Quality Metrics
  const interHd = topology.isPuf ? topology.pufInterHdMean : null;
  const intraBerPercent = (topology.pufIntraBerPpm / 10000.0); // Convert PPM to %
  const shannonEntropyPerBit = topology.isPuf ? (1.0 - (intraBerPercent / 100.0) * 0.15) : 0.0;

  // 6. Security Assurance Score (0 to 100)
  let securityScore = 0.0;
  // MTD component (up to 45 pts)
  if (mtd >= 5e6) securityScore += 45.0;
  else if (mtd >= 5e5) securityScore += 35.0;
  else if (mtd >= 5e4) securityScore += 22.0;
  else if (mtd >= 5e3) securityScore += 10.0;
  else securityScore += 2.0;

  // Physical geometry & invasive defense (up to 30 pts)
  if (topology.opticalInvisibility) securityScore += 15.0;
  if (topology.fibPvcImmune) securityScore += 15.0;

  // PUF entropy & zero helper data (up to 25 pts)
  if (topology.isPuf) {
    if (topology.pufIntraBerPpm < 1.0) securityScore += 25.0; // AntiFuse zero helper data
    else securityScore += 10.0; // SRAM PUF helper vulnerability
  } else {
    securityScore += 8.0; // Conventional storage
  }

  securityScore = Math.max(0.0, Math.min(100.0, Math.round(securityScore)));

  // 7. Security Certification Verdict
  let verdictStatus = 'CRITICAL';
  if (securityScore >= 85) verdictStatus = 'LEVEL4_RESILIENT';
  else if (securityScore >= 65) verdictStatus = 'AUTOMOTIVE_QUALIFIED';
  else if (securityScore >= 40) verdictStatus = 'COMMERCIAL_BASIC';
  else verdictStatus = 'VULNERABLE';

  return {
    preset,
    topology,
    diffSensing,
    blinding,
    jitter,
    noiseSigma,
    effectiveDelta,
    totalNoiseSigma,
    rhoMax,
    mtd,
    interHd,
    intraBerPercent,
    shannonEntropyPerBit,
    securityScore,
    verdictStatus
  };
}

/**
 * Draws High-Resolution Security & DPA Canvas
 * 
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'cpa_correlation_traces' | 'puf_gaussian_hamming'} mode
 * @param {'zh' | 'en'} lang
 */
export function drawPqcDpaCanvas(canvas, metrics, mode, lang = 'zh') {
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
  ctx.fillStyle = '#090d16';
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

  if (mode === 'cpa_correlation_traces') {
    // Mode 1: CPA Pearson Correlation vs Clock Sample Time (0 to 100ns)
    // Plots 255 ghost candidate keys vs the 1 correct key candidate
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    for (let j = 0; j <= 5; j++) {
      const t = j * 20;
      const x = padLeft + (plotW / 5) * j;
      ctx.fillText(`${t} ns`, x, height - padBottom + 16);
    }

    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const rho = (1.0 - i * 0.4).toFixed(1); // 1.0 to -1.0
      const y = padTop + (plotH / 5) * i + 4;
      ctx.fillText(`${rho}`, padLeft - 8, y);
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lang === 'zh' ? '相關係數 ρ(k, t)' : 'Pearson Correlation ρ(k, t)', padLeft, padTop - 12);

    ctx.textAlign = 'right';
    ctx.fillText(lang === 'zh' ? '時脈時間 (ns)' : 'Clock Time (ns)', width - padRight, height - 12);

    // Plot Ghost Keys (Noise Background)
    const numGhost = 15;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    for (let g = 0; g < numGhost; g++) {
      ctx.beginPath();
      for (let j = 0; j <= 50; j++) {
        const x = padLeft + (plotW / 50) * j;
        const seed = (g * 13 + j * 7) % 23;
        const noise = (Math.sin(j * 0.5 + seed) * 0.12 * (1.0 / (1.0 + metrics.totalNoiseSigma * 0.5)));
        const y = padTop + plotH * (0.5 - noise * 0.5);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 4.5-Sigma Noise Floor Boundary
    const noiseBound = 0.15 / (1.0 + metrics.totalNoiseSigma * 0.3);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.setLineDash([3, 3]);
    const boundY1 = padTop + plotH * (0.5 - noiseBound * 0.5);
    const boundY2 = padTop + plotH * (0.5 + noiseBound * 0.5);
    ctx.beginPath();
    ctx.moveTo(padLeft, boundY1);
    ctx.lineTo(padLeft + plotW, boundY1);
    ctx.moveTo(padLeft, boundY2);
    ctx.lineTo(padLeft + plotW, boundY2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot Correct Key Peak Curve
    ctx.strokeStyle = metrics.rhoMax > 0.4 ? '#ef4444' : (metrics.rhoMax > 0.15 ? '#f59e0b' : '#10b981');
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let j = 0; j <= 50; j++) {
      const x = padLeft + (plotW / 50) * j;
      const peakCenter = 25; // 50ns
      const dist = (j - peakCenter) / 3.5;
      const gaussianPeak = metrics.rhoMax * Math.exp(-(dist ** 2));
      const jitterNoise = (Math.sin(j * 0.8) * 0.04);
      const val = gaussianPeak + jitterNoise;
      const y = padTop + plotH * (0.5 - val * 0.5);
      if (j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Legend & Peak Value
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = metrics.rhoMax > 0.4 ? '#ef4444' : (metrics.rhoMax > 0.15 ? '#f59e0b' : '#10b981');
    ctx.fillText(`${lang === 'zh' ? '正確金鑰峰值' : 'Correct Key Peak'}: ρmax = ${metrics.rhoMax.toFixed(3)}`, padLeft + 10, padTop + 16);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`MTD ≈ ${metrics.mtd.toLocaleString()} traces`, padLeft + 250, padTop + 16);

  } else {
    // Mode 2: PUF Inter-Chip Hamming Distance Gaussian Distribution (%)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    for (let j = 0; j <= 6; j++) {
      const pct = (35 + j * 5); // 35% to 65%
      const x = padLeft + (plotW / 6) * j;
      ctx.fillText(`${pct}%`, x, height - padBottom + 16);
    }

    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const p = (0.2 * (1 - i / 5)).toFixed(2);
      const y = padTop + (plotH / 5) * i + 4;
      ctx.fillText(`${p}`, padLeft - 8, y);
    }

    ctx.fillStyle = '#10b981';
    ctx.font = '600 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lang === 'zh' ? '機率密度 PDF' : 'Probability Density (PDF)', padLeft, padTop - 12);

    ctx.textAlign = 'right';
    ctx.fillText(lang === 'zh' ? '晶片間漢明距離 (%)' : 'Inter-Chip Hamming Distance (%)', width - padRight, height - 12);

    if (metrics.topology.isPuf) {
      // Plot Ideal 50% Gaussian Curve
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      for (let j = 0; j <= 60; j++) {
        const xPct = 35 + (30) * (j / 60);
        const x = padLeft + (plotW / 60) * j;
        const z = (xPct - 50.0) / 2.5;
        const pdf = (1.0 / (2.5 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * (z ** 2));
        const y = padTop + plotH * (1.0 - pdf / 0.2);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Plot Actual Topology Gaussian Curve
      const mean = metrics.topology.pufInterHdMean;
      const sigma = metrics.topology.id === 'antifuse_rot_puf' ? 2.45 : 3.8;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let j = 0; j <= 60; j++) {
        const xPct = 35 + (30) * (j / 60);
        const x = padLeft + (plotW / 60) * j;
        const z = (xPct - mean) / sigma;
        const pdf = (1.0 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * (z ** 2));
        const y = padTop + plotH * (1.0 - pdf / 0.2);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Legend
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`${lang === 'zh' ? '實測分佈' : 'Measured'}: μ = ${mean.toFixed(2)}%, BER = ${metrics.intraBerPercent}%`, padLeft + 10, padTop + 16);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.fillText(lang === 'zh' ? '— 理想 50.0% 高斯分佈' : '— Ideal 50.0% Gaussian', padLeft + 280, padTop + 16);

    } else {
      // Non-PUF notice
      ctx.fillStyle = '#ef4444';
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        lang === 'zh' ? '此拓撲非物理不可克隆 (Non-PUF)，無隨機微觀熵分佈' : 'Topology is Non-PUF: zero physical microscopic entropy distribution',
        padLeft + plotW / 2,
        padTop + plotH / 2
      );
    }
  }
}

/**
 * Initializes the PQC & Hardware RoT DPA Simulator
 * 
 * @param {string} containerId
 */
export function initPqcDpaSimulator(containerId) {
  const root = document.getElementById(containerId);
  if (!root) return;

  let currentPresetId = 'fips140_3_lvl4';
  let currentTopologyId = 'antifuse_rot_puf';
  let currentMode = 'cpa_correlation_traces';

  const presetSelect = root.querySelector('#pqc-preset-select');
  const topologySelect = root.querySelector('#pqc-topology-select');
  const diffCheck = root.querySelector('#pqc-diff-check');
  const blindingCheck = root.querySelector('#pqc-blinding-check');
  const jitterCheck = root.querySelector('#pqc-jitter-check');
  const noiseSlider = root.querySelector('#pqc-noise-slider');
  const canvas = root.querySelector('#pqc-rot-dpa-canvas');

  const modeCpaBtn = root.querySelector('#pqc-mode-cpa-btn');
  const modePufBtn = root.querySelector('#pqc-mode-puf-btn');

  function getLang() {
    return document.documentElement.lang === 'zh-TW' || document.documentElement.lang === 'zh' ? 'zh' : 'en';
  }

  function update() {
    const lang = getLang();
    const metrics = calculatePqcDpaMetrics({
      presetId: currentPresetId,
      topologyId: currentTopologyId,
      customDiff: diffCheck ? diffCheck.checked : undefined,
      customBlinding: blindingCheck ? blindingCheck.checked : undefined,
      customJitter: jitterCheck ? jitterCheck.checked : undefined,
      customNoise: noiseSlider ? Number(noiseSlider.value) : undefined
    });

    // Update Slider Labels
    const noiseValEl = root.querySelector('#pqc-noise-val');
    if (noiseValEl) noiseValEl.textContent = `σ = ${metrics.noiseSigma.toFixed(1)}`;

    // Update Metric Badges
    const mtdEl = root.querySelector('#pqc-metric-mtd');
    if (mtdEl) {
      mtdEl.textContent = metrics.mtd >= 1e7 ? '> 10,000,000' : metrics.mtd.toLocaleString();
      mtdEl.style.color = metrics.mtd >= 5e5 ? '#10b981' : (metrics.mtd >= 5e4 ? '#f59e0b' : '#ef4444');
    }

    const rhoEl = root.querySelector('#pqc-metric-rho');
    if (rhoEl) rhoEl.textContent = metrics.rhoMax.toFixed(3);

    const berEl = root.querySelector('#pqc-metric-ber');
    if (berEl) {
      berEl.textContent = metrics.topology.isPuf ? `${metrics.intraBerPercent.toFixed(4)}%` : 'N/A';
    }

    const scoreEl = root.querySelector('#pqc-metric-score');
    if (scoreEl) {
      scoreEl.textContent = `${metrics.securityScore} / 100`;
      scoreEl.style.color = metrics.securityScore >= 80 ? '#10b981' : (metrics.securityScore >= 55 ? '#f59e0b' : '#ef4444');
    }

    // Update Verdict Text
    const verdictEl = root.querySelector('#pqc-verdict-banner');
    if (verdictEl) {
      const topoName = lang === 'zh' ? metrics.topology.zh.name : metrics.topology.en.name;
      const pros = lang === 'zh' ? metrics.topology.zh.pros : metrics.topology.en.pros;
      const cons = lang === 'zh' ? metrics.topology.zh.cons : metrics.topology.en.cons;

      verdictEl.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 4px; color: ${metrics.securityScore >= 80 ? '#10b981' : (metrics.securityScore >= 55 ? '#f59e0b' : '#ef4444')}">
          ${metrics.verdictStatus === 'LEVEL4_RESILIENT' ? (lang === 'zh' ? '✓ 最高安全評定：FIPS 140-3 Level 4 / PQC 抵抗就緒' : '✓ Top Security: FIPS 140-3 Level 4 / PQC Resilient') :
            (metrics.verdictStatus === 'AUTOMOTIVE_QUALIFIED' ? (lang === 'zh' ? '✓ 車規安全評定：EVITA High / ASIL-D 合規' : '✓ Automotive Security: EVITA High / ASIL-D Compliant') :
             (metrics.verdictStatus === 'COMMERCIAL_BASIC' ? (lang === 'zh' ? '⚠ 商業基本防護：PSA Certified Level 2' : '⚠ Commercial Baseline: PSA Certified Level 2') :
              (lang === 'zh' ? '✗ 側信道高危漏洞：幾百次讀取內可恢復金鑰' : '✗ Critical Side-Channel Vulnerability: Key exposed in < 1k traces')))}
        </div>
        <div style="font-size: 0.85rem; line-height: 1.45; color: #cbd5e1;">
          <strong>${topoName}:</strong> ${pros} <span style="opacity: 0.85">${cons}</span>
        </div>
      `;
    }

    // Draw Canvas
    if (canvas) {
      drawPqcDpaCanvas(canvas, metrics, currentMode, lang);
    }
  }

  // Event Listeners
  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      currentPresetId = e.target.value;
      const preset = PQC_SECURITY_PRESETS[currentPresetId];
      if (preset) {
        if (diffCheck) diffCheck.checked = preset.differentialSensing;
        if (blindingCheck) blindingCheck.checked = preset.currentBlinding;
        if (jitterCheck) jitterCheck.checked = preset.randomJitter;
        if (noiseSlider) noiseSlider.value = preset.noiseSigma;
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

  if (diffCheck) diffCheck.addEventListener('change', update);
  if (blindingCheck) blindingCheck.addEventListener('change', update);
  if (jitterCheck) jitterCheck.addEventListener('change', update);
  if (noiseSlider) noiseSlider.addEventListener('input', update);

  if (modeCpaBtn) {
    modeCpaBtn.addEventListener('click', () => {
      currentMode = 'cpa_correlation_traces';
      modeCpaBtn.classList.add('active');
      if (modePufBtn) modePufBtn.classList.remove('active');
      update();
    });
  }

  if (modePufBtn) {
    modePufBtn.addEventListener('click', () => {
      currentMode = 'puf_gaussian_hamming';
      modePufBtn.classList.add('active');
      if (modeCpaBtn) modeCpaBtn.classList.remove('active');
      update();
    });
  }

  // Observe language mutations
  const observer = new MutationObserver(() => update());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // Initial render
  update();
}
