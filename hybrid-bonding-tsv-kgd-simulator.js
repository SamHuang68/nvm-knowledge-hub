/**
 * @file hybrid-bonding-tsv-kgd-simulator.js
 * @description First-principles simulator for HBM4 and 3D heterogeneous chiplet
 * Cu-Cu Direct Hybrid Bonding (DBI / SoIC), high-aspect-ratio (HAR) TSV parasitic RC latency,
 * and wafer-level KGD probe-card contact force vs. copper surface dishing/voiding physics.
 * @version 1.0.0
 * @license MIT
 */

/**
 * @typedef {Object} HybridBondingPreset
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {number} pitchUm - Interconnect pitch in micrometers (0.8 - 40.0)
 * @property {number} tsvDiameterUm - TSV diameter in micrometers (1.0 - 6.0)
 * @property {number} tsvHeightUm - TSV height in micrometers (20.0 - 60.0)
 * @property {number} toxNm - TSV oxide liner thickness (nm)
 * @property {number} defaultFrequencyGhz - Operating PHY frequency (GHz)
 * @property {string} probeVendorDefault - Default probe vendor key
 * @property {string} descZh
 * @property {string} descEn
 */

/**
 * @typedef {Object} KgdProbeCard
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {number} contactForceGrams - Contact force per pin (grams, 0.2 - 3.5)
 * @property {number} scrubMarkDepthNm - Probe scrub mark penetration depth (nm)
 * @property {number} maxBandwidthGhz - Max RF/digital signal frequency (GHz)
 * @property {number} pitchLimitUm - Minimum supportable pitch (um)
 * @property {number} cardAspUsd - Probe card ASP (USD)
 * @property {string} vendorName
 * @property {string} descZh
 * @property {string} descEn
 */

/**
 * Standard 3D Interconnect Presets
 * @type {Record<string, HybridBondingPreset>}
 */
export const HYBRID_BONDING_PRESETS = {
  hbm4_hybrid_bonding_1um: {
    id: 'hbm4_hybrid_bonding_1um',
    nameZh: 'HBM4 Cu-Cu 晶圓級混合鍵合 (1.0µm Pitch, TSMC SoIC)',
    nameEn: 'HBM4 Cu-Cu Direct Hybrid Bonding (1.0µm Pitch, SoIC)',
    pitchUm: 1.0,
    tsvDiameterUm: 1.2,
    tsvHeightUm: 30.0,
    toxNm: 50.0,
    defaultFrequencyGhz: 3.2,
    probeVendorDefault: 'mpi_zero_mark_mems',
    descZh: '次世代無焊料 (Solderless) 銅-銅直接混合鍵合，微間距 1µm，完全消除微凸塊橋接短路與金屬間隙脆化。',
    descEn: 'Next-gen solderless Cu-Cu direct hybrid bonding with 1µm pitch, eliminating bump bridging and intermetallic embrittlement.'
  },
  hbm4_microbump_20um: {
    id: 'hbm4_microbump_20um',
    nameZh: 'HBM4 先進微間距微凸塊 (20.0µm Pitch, TCB-NCF)',
    nameEn: 'HBM4 Advanced Micro-Bump (20.0µm Pitch, TCB-NCF)',
    pitchUm: 20.0,
    tsvDiameterUm: 3.5,
    tsvHeightUm: 45.0,
    toxNm: 120.0,
    defaultFrequencyGhz: 2.0,
    probeVendorDefault: 'chpt_submicron_mems',
    descZh: '過渡期極限微凸塊工藝，採非導電膠膜熱壓鍵合 (TCB-NCF)，凸塊高度 10µm，界面熱阻較高。',
    descEn: 'Transitional micro-bump technology using TCB-NCF with 20µm pitch and 10µm standoff height.'
  },
  hbm3e_microbump_35um: {
    id: 'hbm3e_microbump_35um',
    nameZh: '傳統 HBM3E 微凸塊 (35.0µm Pitch, MR-MUF 對照組)',
    nameEn: 'Legacy HBM3E Micro-Bump (35.0µm Pitch, MR-MUF Baseline)',
    pitchUm: 35.0,
    tsvDiameterUm: 5.5,
    tsvHeightUm: 55.0,
    toxNm: 200.0,
    defaultFrequencyGhz: 1.2,
    probeVendorDefault: 'legacy_cantilever',
    descZh: 'HBM3E 成熟量產標準：35µm 微凸塊與批量回熔毛細底部填充，TSV 寄生電容與尺寸偏大。',
    descEn: 'HBM3E baseline: 35µm micro-bump with mass reflow molded underfill, higher TSV parasitics.'
  },
  chiplet_soic_0_8um: {
    id: 'chiplet_soic_0_8um',
    nameZh: '3D 超高密度 SoC 晶粒鍵合 (0.8µm Pitch, Sub-micron DBI)',
    nameEn: '3D Ultra-Dense SoC Chiplet (0.8µm Pitch, Sub-micron DBI)',
    pitchUm: 0.8,
    tsvDiameterUm: 0.9,
    tsvHeightUm: 25.0,
    toxNm: 35.0,
    defaultFrequencyGhz: 4.5,
    probeVendorDefault: 'mpi_zero_mark_mems',
    descZh: '極致 3D 異質整合，微間距次微米 0.8µm，每平方毫米百萬級垂直互連，極致考驗化學機械研磨 (CMP) 平整度。',
    descEn: 'Ultra-dense 3D heterogeneous bonding with 0.8µm pitch, >1M interconnects/mm², extreme CMP flatness tolerance.'
  }
};

/**
 * KGD Probe Card Technologies
 * @type {Record<string, KgdProbeCard>}
 */
export const KGD_PROBE_ARCHITECTURES = {
  mpi_zero_mark_mems: {
    id: 'mpi_zero_mark_mems',
    nameZh: '低接觸力微懸臂 MEMS 探針架構 (Low-Force Micro-Cantilever)',
    nameEn: 'Low-Force Micro-Cantilever MEMS Probe Card',
    contactForceGrams: 0.35,
    scrubMarkDepthNm: 1.8,
    maxBandwidthGhz: 45.0,
    pitchLimitUm: 0.8,
    cardAspUsd: 195000,
    vendorName: 'Low-Force MEMS',
    descZh: '專為 Cu-Cu 混合鍵合研發之微懸臂彈性探針，接觸力 <0.4g，針痕深度 <2nm，降低鍵合界面空洞 (Void) 形成風險。',
    descEn: 'Micro-cantilever MEMS engineered for Cu-Cu hybrid bonding: <0.4g force, <2nm mark depth, minimizing bond void risks.'
  },
  chpt_submicron_mems: {
    id: 'chpt_submicron_mems',
    nameZh: '微間距薄膜多層載板高頻 MEMS 探針 (Thin-Film Space Transformer)',
    nameEn: 'Micro-Pitch Thin-Film High-Frequency MEMS',
    contactForceGrams: 0.45,
    scrubMarkDepthNm: 2.2,
    maxBandwidthGhz: 50.0,
    pitchLimitUm: 0.9,
    cardAspUsd: 210000,
    vendorName: 'Thin-Film MEMS',
    descZh: '先進封裝高密度互連測試，多層薄膜有機載板結合微探針，具備 40GHz+ 頻寬與較低針痕深度。',
    descEn: 'High-density packaging test substrate with multi-layer thin film, providing 40GHz+ bandwidth and low scrub depth.'
  },
  technoprobe_tplus: {
    id: 'technoprobe_tplus',
    nameZh: '垂直微彈性奈米接觸 MEMS 探針 (Vertical Compliant Tip)',
    nameEn: 'Vertical Compliant Tip MEMS Probe',
    contactForceGrams: 0.40,
    scrubMarkDepthNm: 2.0,
    maxBandwidthGhz: 42.0,
    pitchLimitUm: 0.85,
    cardAspUsd: 225000,
    vendorName: 'Vertical MEMS',
    descZh: '垂直 MEMS 奈米彈性針尖結構，支援高密度微間距焊墊直接晶圓級測試。',
    descEn: 'Vertical compliant MEMS nano-tips supporting high-density micro-pitch wafer sort.'
  },
  formfactor_touch: {
    id: 'formfactor_touch',
    nameZh: '高針數混訊懸臂複合探針 (High-Density Mixed-Signal Probe)',
    nameEn: 'High-Density Mixed-Signal Probe Card',
    contactForceGrams: 0.55,
    scrubMarkDepthNm: 2.8,
    maxBandwidthGhz: 38.0,
    pitchLimitUm: 1.2,
    cardAspUsd: 185000,
    vendorName: 'Mixed-Signal Probe',
    descZh: '高針數邏輯與記憶體混合測試架構，針尖平整度與高溫測試穩定性良好。',
    descEn: 'High-pin mixed-signal probe architecture with balanced thermal stability and coplanarity.'
  },
  legacy_cantilever: {
    id: 'legacy_cantilever',
    nameZh: '傳統垂直/懸臂探針卡 (對照組 · 高針痕破壞)',
    nameEn: 'Legacy Cantilever / Standard VPC (Baseline · High Damage)',
    contactForceGrams: 2.80,
    scrubMarkDepthNm: 18.5,
    maxBandwidthGhz: 6.0,
    pitchLimitUm: 30.0,
    cardAspUsd: 55000,
    vendorName: 'Legacy Vendors',
    descZh: '傳統記憶體探針卡：接觸力達 2.8g，針痕深度 >15nm，直接刮傷銅接面導致 CMP 平整度破壞，引發嚴重鍵合剝離與空洞。',
    descEn: 'Traditional memory probe cards: >2.5g contact force gouges copper pads (>15nm), causing fatal hybrid bonding delamination and voids.'
  }
};

/**
 * Calculate first-principles TSV parasitic RC, interconnect density, and KGD contact-surface mechanics
 * @param {Object} params
 * @param {string} params.presetId
 * @param {string} params.probeId
 * @param {number} params.pitchUm - Micro-bump / Hybrid pitch (um)
 * @param {number} params.operatingFreqGhz - Signal frequency (GHz)
 * @param {number} params.contactForceGrams - Contact force per pin (grams)
 * @returns {Object} Calculated metrics
 */
export function calculateHybridBondingMetrics({
  presetId = 'hbm4_hybrid_bonding_1um',
  probeId = 'mpi_zero_mark_mems',
  pitchUm = 1.0,
  operatingFreqGhz = 3.2,
  contactForceGrams = 0.35
}) {
  const preset = HYBRID_BONDING_PRESETS[presetId] || HYBRID_BONDING_PRESETS.hbm4_hybrid_bonding_1um;
  const probe = KGD_PROBE_ARCHITECTURES[probeId] || KGD_PROBE_ARCHITECTURES.mpi_zero_mark_mems;

  // 1. Interconnect Density (connections per mm^2)
  // Hexagonal or square pitch: Density = 1 / (pitch * 10^-3 mm)^2
  const effectivePitchUm = Math.max(0.6, pitchUm);
  const interconnectDensityPerMm2 = Math.round(1e6 / (effectivePitchUm * effectivePitchUm));

  // 2. TSV Parasitic Resistance & Capacitance (First Principles)
  // Copper resistivity: rho_Cu = 1.68e-8 ohm-m (size-corrected for thin TSV)
  const rhoCu = 1.85e-8; // including barrier/seed layer effect
  const tsvRadiusM = (preset.tsvDiameterUm * 1e-6) / 2.0;
  const tsvHeightM = preset.tsvHeightUm * 1e-6;
  const tsvAreaM2 = Math.PI * Math.pow(tsvRadiusM, 2);

  // DC Resistance: R = rho * L / A
  const rDcOhm = (rhoCu * tsvHeightM) / tsvAreaM2;

  // High-frequency skin effect: skin depth delta = sqrt(rho / (pi * f * mu0))
  const mu0 = 4.0 * Math.PI * 1e-7;
  const freqHz = operatingFreqGhz * 1e9;
  const skinDepthM = Math.sqrt(rhoCu / (Math.PI * freqHz * mu0));
  const skinCorrection = tsvRadiusM > skinDepthM ? (tsvRadiusM / (2.0 * skinDepthM)) : 1.0;
  const rAcOhm = rDcOhm * Math.max(1.0, skinCorrection);

  // TSV Oxide Liner Capacitance: Cox = (2 * pi * eps_ox * h) / ln((r + tox) / r)
  const eps0 = 8.854e-12;
  const epsOx = 3.9 * eps0; // SiO2 dielectric
  const toxM = preset.toxNm * 1e-9;
  const cOxFarads = (2.0 * Math.PI * epsOx * tsvHeightM) / Math.log((tsvRadiusM + toxM) / tsvRadiusM);
  const cTsvFemtofarads = cOxFarads * 1e15;

  // TSV RC Time Constant (ps): tau = R * C
  const tauRcPicoSec = (rAcOhm * cOxFarads) * 1e12;

  // Signal Attenuation / Eye Height Degradation:
  // First-order RC low-pass filter amplitude response: |H(f)| = 1 / sqrt(1 + (2 * pi * f * R * C)^2)
  const omegaTau = 2.0 * Math.PI * freqHz * (rAcOhm * cOxFarads);
  const magnitude = 1.0 / Math.sqrt(1.0 + Math.pow(omegaTau, 2));
  const attenuationDb = 20.0 * Math.log10(Math.max(0.001, magnitude));
  // Eye opening estimation based on first-order bandwidth margin heuristic:
  const eyeOpeningPercent = Math.max(5.0, Math.min(98.0, 100.0 * Math.exp(-omegaTau)));

  // 3. KGD Wafer Sort Probe Contact Surface Mechanics
  // Scrub mark depth scales with contact force: Dishing budget is typically 3.0 nm for Cu-Cu Hybrid Bonding
  const nominalForce = probe.contactForceGrams;
  const forceScaling = contactForceGrams / nominalForce;
  const actualMarkDepthNm = probe.scrubMarkDepthNm * Math.pow(forceScaling, 0.75);

  // Bonding Void Defect Rate (PPM) based on pad damage exceeding 3.0 nm CMP dishing window
  const dishingThresholdNm = 3.0;
  let bondingVoidPpm = 0.5;
  if (actualMarkDepthNm > dishingThresholdNm) {
    const excessNm = actualMarkDepthNm - dishingThresholdNm;
    bondingVoidPpm = Math.min(50000, 2.0 + Math.pow(excessNm, 2.8) * 8.5);
  }

  // Probe card compatibility verdict
  let probeStatus = 'QUALIFIED';
  let statusColor = '#10b981'; // green

  if (actualMarkDepthNm > 8.0 || effectivePitchUm < probe.pitchLimitUm) {
    probeStatus = 'FATAL INTERACTION';
    statusColor = '#ef4444'; // red
  } else if (actualMarkDepthNm > dishingThresholdNm) {
    probeStatus = 'HIGH VOID RISK';
    statusColor = '#f59e0b'; // amber
  } else if (effectivePitchUm <= 1.0 && actualMarkDepthNm <= 2.2) {
    probeStatus = 'ULTRA-CLEAN ZERO-VOID';
    statusColor = '#06b6d4'; // cyan
  }

  // Bilingual verdicts
  const isZh = typeof document !== 'undefined' ? document.documentElement.lang.startsWith('zh') : true;
  let verdictZh = '';
  let verdictEn = '';

  if (probeStatus === 'FATAL INTERACTION') {
    verdictZh = `警告：探針接觸力 (${contactForceGrams.toFixed(2)}g) 導致銅表面針痕深度達到 ${actualMarkDepthNm.toFixed(1)} nm（超過 CMP 平整度容許上限 3.0 nm）！Cu-Cu 混合鍵合退火時界面微孔洞風險劇增（估算達 ${bondingVoidPpm.toFixed(0)} PPM），可能引發介面剝離。建議改採超低接觸力微懸臂 MEMS 探針架構或降低接觸超行程 (Overdrive)。`;
    verdictEn = `CRITICAL: Probe contact force (${contactForceGrams.toFixed(2)}g) causes ${actualMarkDepthNm.toFixed(1)} nm scrub depth, exceeding the 3.0 nm CMP dishing limit! Cu-Cu hybrid bonding interface void risk escalates significantly (est. ${bondingVoidPpm.toFixed(0)} PPM). Recommend switching to ultra-low-force micro-cantilever MEMS probes or reducing overdrive.`;
  } else if (probeStatus === 'HIGH VOID RISK') {
    verdictZh = `注意：針痕深度 (${actualMarkDepthNm.toFixed(1)} nm) 略高於 3.0 nm 混合鍵合預算，可能增加熱壓鍵合之界面缺陷率。建議微調探針接觸壓力至 0.35g 以下，或導入化學自修復退火工藝。`;
    verdictEn = `CAUTION: Scrub depth (${actualMarkDepthNm.toFixed(1)} nm) marginally exceeds the 3.0 nm hybrid bonding budget, risking elevated void defects. Lower contact pressure below 0.35g or apply post-test chemical planarization.`;
  } else {
    verdictZh = `最佳化：在 ${effectivePitchUm.toFixed(1)}µm 混合鍵合間距下，互連密度高達 ${(interconnectDensityPerMm2 / 1000).toFixed(0)}k/mm²；TSV 寄生電容僅 ${cTsvFemtofarads.toFixed(1)} fF，高頻眼高開展率估算為 ${eyeOpeningPercent.toFixed(1)}%。${probe.vendorName} 探針卡針痕深度僅 ${actualMarkDepthNm.toFixed(1)} nm（符合 3.0 nm CMP 預算），有助於降低混合鍵合界面空洞率。`;
    verdictEn = `OPTIMAL: At ${effectivePitchUm.toFixed(1)}µm hybrid bonding pitch, density reaches ${(interconnectDensityPerMm2 / 1000).toFixed(0)}k/mm²; TSV capacitance is only ${cTsvFemtofarads.toFixed(1)} fF with ${eyeOpeningPercent.toFixed(1)}% estimated eye opening. ${probe.vendorName} scrub mark is ${actualMarkDepthNm.toFixed(1)} nm (within 3.0 nm budget), minimizing bonding void risks.`;
  }

  return {
    preset,
    probe,
    effectivePitchUm,
    interconnectDensityPerMm2,
    contactForceGrams,
    rAcOhm,
    cTsvFemtofarads,
    tauRcPicoSec,
    eyeOpeningPercent,
    attenuationDb,
    actualMarkDepthNm,
    dishingThresholdNm,
    bondingVoidPpm,
    probeStatus,
    statusColor,
    verdictZh,
    verdictEn
  };
}

/**
 * Draw interactive dual-mode simulation visualization on HTML5 Canvas
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'tsv_rc_frequency_response'|'probe_force_surface_damage'} mode
 */
export function drawHybridBondingCanvas(canvas, metrics, mode = 'tsv_rc_frequency_response') {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#09131e');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const padLeft = 56;
  const padRight = 32;
  const padTop = 32;
  const padBottom = 48;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Grid
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padTop + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
    ctx.stroke();
  }

  if (mode === 'tsv_rc_frequency_response') {
    // Mode 1: Frequency (0.5 to 10 GHz) vs Eye Opening (%)
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText('100%', padLeft - 8, padTop + 4);
    ctx.fillText('75%', padLeft - 8, padTop + plotH * 0.25 + 4);
    ctx.fillText('50%', padLeft - 8, padTop + plotH * 0.50 + 4);
    ctx.fillText('25%', padLeft - 8, padTop + plotH * 0.75 + 4);
    ctx.fillText('0%', padLeft - 8, padTop + plotH + 4);

    const fMin = 0.5;
    const fMax = 8.0;
    const pts = 50;

    // Draw curve for current configuration
    ctx.beginPath();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.6;

    for (let i = 0; i <= pts; i++) {
      const f = fMin + (fMax - fMin) * (i / pts);
      const tau = (metrics.rAcOhm * (metrics.cTsvFemtofarads * 1e-15));
      const eye = Math.max(2.0, 100.0 * Math.exp(-2.0 * Math.PI * (f * 1e9) * tau));
      const x = padLeft + plotW * (i / pts);
      const y = padTop + plotH * (1.0 - eye / 100.0);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Fill under curve
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
    ctx.fill();

    // Mark current operating point
    const currF = 3.2; // default
    const currX = padLeft + plotW * ((currF - fMin) / (fMax - fMin));
    const currY = padTop + plotH * (1.0 - metrics.eyeOpeningPercent / 100.0);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(currX, currY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.textAlign = 'center';
    ctx.font = '600 10.5px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('1 GHz', padLeft + plotW * ((1.0 - fMin) / (fMax - fMin)), height - padBottom + 16);
    ctx.fillText('3.2 GHz (HBM4 PHY)', currX, height - padBottom + 16);
    ctx.fillText('8 GHz', padLeft + plotW, height - padBottom + 16);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`— 2048-bit PHY 高頻眼高開展率 (Eye Height: ${metrics.eyeOpeningPercent.toFixed(1)}% @ 3.2GHz, τ = ${metrics.tauRcPicoSec.toFixed(1)} ps)`, padLeft + 10, padTop - 12);

  } else {
    // Mode 2: Probe Contact Force (0.1g to 3.0g) vs Scrub Mark Depth (nm) & Void Budget
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText('20nm', padLeft - 8, padTop + 4);
    ctx.fillText('15nm', padLeft - 8, padTop + plotH * 0.25 + 4);
    ctx.fillText('10nm', padLeft - 8, padTop + plotH * 0.50 + 4);
    ctx.fillText('5nm', padLeft - 8, padTop + plotH * 0.75 + 4);
    ctx.fillText('0nm', padLeft - 8, padTop + plotH + 4);

    const maxDepth = 20.0;
    const getY = d => padTop + plotH * (1.0 - Math.min(maxDepth, d) / maxDepth);

    // CMP Dishing safe limit line at 3.0nm
    const yThreshold = getY(metrics.dishingThresholdNm);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(padLeft, yThreshold);
    ctx.lineTo(padLeft + plotW, yThreshold);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = '700 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'right';
    ctx.fillText('3.0nm CMP 容許上限 (Bonding Void Threshold)', padLeft + plotW - 10, yThreshold - 6);

    // Green safe zone below 3.0nm
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.fillRect(padLeft, yThreshold, plotW, padTop + plotH - yThreshold);

    // Plot probe architecture baseline marks
    const probePoints = [
      { name: 'Low-Force MEMS', force: 0.35, depth: 1.8, color: '#38bdf8' },
      { name: 'Thin-Film MEMS', force: 0.45, depth: 2.2, color: '#818cf8' },
      { name: 'Vertical MEMS', force: 0.40, depth: 2.0, color: '#f59e0b' },
      { name: 'Mixed-Signal', force: 0.55, depth: 2.8, color: '#c084fc' },
      { name: 'Legacy VPC', force: 2.80, depth: 18.5, color: '#ef4444' }
    ];

    const getX = force => padLeft + plotW * (force / 3.0);

    probePoints.forEach(p => {
      const x = getX(p.force);
      const y = getY(p.depth);

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.font = '600 9.5px "IBM Plex Mono", monospace';
      ctx.fillStyle = p.color;
      ctx.textAlign = 'center';
      ctx.fillText(`${p.name}`, x, y - 8);
      ctx.fillText(`${p.depth}nm`, x, y + 15);
    });

    // Plot dynamic user operating point
    const userForce = typeof metrics.contactForceGrams === 'number' ? metrics.contactForceGrams : 0.35;
    const userDepth = typeof metrics.actualMarkDepthNm === 'number' ? metrics.actualMarkDepthNm : 1.8;
    const curX = getX(Math.min(3.0, Math.max(0.1, userForce)));
    const curY = getY(userDepth);

    // Glowing halo
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(curX, curY, 9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = '700 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText(`當前條件 (${userForce.toFixed(2)}g, ${userDepth.toFixed(1)}nm)`, curX, curY - 14);

    ctx.textAlign = 'left';
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('■ 探針接觸力 vs 銅表面刮痕深度 (CMP Dishing Boundary Model)', padLeft + 10, padTop - 12);
  }

  ctx.restore();
}

/**
 * Initialize Hybrid Bonding & TSV KGD Simulator DOM bindings
 * @param {string} rootSelector
 */
export function initHybridBondingSimulator(rootSelector = '#hybrid-bonding-tsv-simulator-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const presetSelect = root.querySelector('#hb-preset-select');
  const probeSelect = root.querySelector('#hb-probe-select');
  const pitchSlider = root.querySelector('#hb-pitch-slider');
  const freqSlider = root.querySelector('#hb-freq-slider');
  const forceSlider = root.querySelector('#hb-force-slider');

  const pitchVal = root.querySelector('#hb-pitch-val');
  const freqVal = root.querySelector('#hb-freq-val');
  const forceVal = root.querySelector('#hb-force-val');

  const outDensity = root.querySelector('#hb-out-density');
  const outCapacitance = root.querySelector('#hb-out-cap');
  const outDepth = root.querySelector('#hb-out-depth');
  const outEye = root.querySelector('#hb-out-eye');
  const outStatus = root.querySelector('#hb-out-status');
  const outVerdict = root.querySelector('#hb-out-verdict');

  const canvas = root.querySelector('#hb-canvas');
  const modeTsvBtn = root.querySelector('#hb-mode-tsv');
  const modeScrubBtn = root.querySelector('#hb-mode-scrub');

  let currentMode = 'tsv_rc_frequency_response';

  function update() {
    const isZh = document.documentElement.lang.startsWith('zh');
    const presetId = presetSelect ? presetSelect.value : 'hbm4_hybrid_bonding_1um';
    const probeId = probeSelect ? probeSelect.value : 'mpi_zero_mark_mems';
    const pitchUm = pitchSlider ? parseFloat(pitchSlider.value) : 1.0;
    const operatingFreqGhz = freqSlider ? parseFloat(freqSlider.value) : 3.2;
    const contactForceGrams = forceSlider ? parseFloat(forceSlider.value) : 0.35;

    // Dynamic select option localization
    if (presetSelect) {
      Array.from(presetSelect.options).forEach(opt => {
        const item = HYBRID_BONDING_PRESETS[opt.value];
        if (item) opt.textContent = isZh ? item.nameZh : item.nameEn;
      });
    }
    if (probeSelect) {
      Array.from(probeSelect.options).forEach(opt => {
        const item = KGD_PROBE_ARCHITECTURES[opt.value];
        if (item) opt.textContent = isZh ? item.nameZh : item.nameEn;
      });
    }

    if (pitchVal) pitchVal.textContent = `${pitchUm.toFixed(1)} µm`;
    if (freqVal) freqVal.textContent = `${operatingFreqGhz.toFixed(1)} GHz`;
    if (forceVal) forceVal.textContent = `${contactForceGrams.toFixed(2)} g`;

    if (pitchSlider) pitchSlider.setAttribute('aria-valuetext', `${pitchUm.toFixed(1)} µm`);
    if (freqSlider) freqSlider.setAttribute('aria-valuetext', `${operatingFreqGhz.toFixed(1)} GHz`);
    if (forceSlider) forceSlider.setAttribute('aria-valuetext', `${contactForceGrams.toFixed(2)} grams`);

    const metrics = calculateHybridBondingMetrics({
      presetId,
      probeId,
      pitchUm,
      operatingFreqGhz,
      contactForceGrams
    });

    if (outDensity) outDensity.textContent = `${(metrics.interconnectDensityPerMm2 / 1000).toLocaleString()} k/mm²`;
    if (outCapacitance) outCapacitance.textContent = `${metrics.cTsvFemtofarads.toFixed(1)} fF (τ = ${metrics.tauRcPicoSec.toFixed(1)} ps)`;
    if (outDepth) outDepth.textContent = `${metrics.actualMarkDepthNm.toFixed(1)} nm (<${metrics.dishingThresholdNm} nm)`;
    if (outEye) outEye.textContent = `${metrics.eyeOpeningPercent.toFixed(1)} %`;

    if (outStatus) {
      outStatus.textContent = metrics.probeStatus;
      outStatus.style.color = metrics.statusColor;
    }

    if (outVerdict) {
      outVerdict.textContent = isZh ? metrics.verdictZh : metrics.verdictEn;
    }

    if (canvas) {
      drawHybridBondingCanvas(canvas, metrics, currentMode);
    }
  }

  // Handle Preset change
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const preset = HYBRID_BONDING_PRESETS[presetSelect.value];
      if (preset) {
        if (pitchSlider) pitchSlider.value = preset.pitchUm;
        if (freqSlider) freqSlider.value = preset.defaultFrequencyGhz;
        if (probeSelect) probeSelect.value = preset.probeVendorDefault;
      }
      update();
    });
  }

  if (probeSelect) probeSelect.addEventListener('change', update);
  if (pitchSlider) pitchSlider.addEventListener('input', update);
  if (freqSlider) freqSlider.addEventListener('input', update);
  if (forceSlider) forceSlider.addEventListener('input', update);

  if (modeTsvBtn && modeScrubBtn) {
    modeTsvBtn.addEventListener('click', () => {
      currentMode = 'tsv_rc_frequency_response';
      modeTsvBtn.classList.add('active');
      modeTsvBtn.setAttribute('aria-pressed', 'true');
      modeScrubBtn.classList.remove('active');
      modeScrubBtn.setAttribute('aria-pressed', 'false');
      modeTsvBtn.style.background = '#0284c7';
      modeTsvBtn.style.borderColor = '#38bdf8';
      modeTsvBtn.style.color = '#ffffff';
      modeScrubBtn.style.background = '#1e293b';
      modeScrubBtn.style.borderColor = '#475569';
      modeScrubBtn.style.color = '#94a3b8';
      update();
    });

    modeScrubBtn.addEventListener('click', () => {
      currentMode = 'probe_force_surface_damage';
      modeScrubBtn.classList.add('active');
      modeScrubBtn.setAttribute('aria-pressed', 'true');
      modeTsvBtn.classList.remove('active');
      modeTsvBtn.setAttribute('aria-pressed', 'false');
      modeScrubBtn.style.background = '#0284c7';
      modeScrubBtn.style.borderColor = '#38bdf8';
      modeScrubBtn.style.color = '#ffffff';
      modeTsvBtn.style.background = '#1e293b';
      modeTsvBtn.style.borderColor = '#475569';
      modeTsvBtn.style.color = '#94a3b8';
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
    document.addEventListener('DOMContentLoaded', () => initHybridBondingSimulator());
  } else {
    initHybridBondingSimulator();
  }
}
