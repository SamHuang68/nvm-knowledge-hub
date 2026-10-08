/**
 * @file vertical-3d-nvm-simulator.js
 * @description First-principles simulator for 3D vertical stacked eNVM (3D OTP, 3D NOR, 3D NAND),
 * modeling High Aspect Ratio (HAR) staircase contact etch, thin-film word-line conductor resistivity
 * size-effects, distributed RC tier propagation delay, and access latency bottlenecks.
 * @version 1.0.0
 * @license MIT
 */

/**
 * @typedef {Object} Vertical3dArchitecturePreset
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {number} tierCount - Number of stacked vertical word-line tiers (32 - 256)
 * @property {number} tierThicknessNm - Physical thickness per tier layer (nm)
 * @property {number} arrayLengthUm - Word-line array physical length (um)
 * @property {number} baseSenseLatencyNs - Intrinsic bitcell sensing delay (ns)
 * @property {string} descZh
 * @property {string} descEn
 */

/**
 * @typedef {Object} WordlineConductorProfile
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {number} bulkResistivityUohmCm - Bulk metal resistivity (uOhm*cm)
 * @property {number} electronMeanFreePathNm - Electron mean free path (nm)
 * @property {number} surfaceSpecularityP - Surface specularity parameter (0 - 1)
 * @property {number} grainBoundaryReflectivityR - Grain boundary reflection coefficient (0 - 1)
 * @property {string} materialNatureZh
 * @property {string} materialNatureEn
 */

/**
 * 3D Vertical NVM Architecture Presets
 * @type {Record<string, Vertical3dArchitecturePreset>}
 */
export const VERTICAL_3D_PRESETS = {
  vert_3d_antifuse_64l: {
    id: 'vert_3d_antifuse_64l',
    nameZh: '64 層垂直 AntiFuse OTP (晶片根信任 / 零漏電微絲)',
    nameEn: '64-Tier Vertical AntiFuse OTP (RoT / Charge-Free)',
    tierCount: 64,
    tierThicknessNm: 40.0,
    arrayLengthUm: 120.0,
    baseSenseLatencyNs: 4.5,
    descZh: '垂直通孔穿透式反熔絲陣列，3D 高深寬比微絲擊穿，極低漏電與最高實體防護。',
    descEn: 'Vertical through-array antifuse array with HAR filament breakdown, ultra-low leakage.'
  },
  vert_3d_nor_48l: {
    id: 'vert_3d_nor_48l',
    nameZh: '48 層垂直 3D NOR (車用高頻寬即時開機代碼)',
    nameEn: '48-Tier Vertical 3D NOR (Automotive Fast Boot Code)',
    tierCount: 48,
    tierThicknessNm: 45.0,
    arrayLengthUm: 80.0,
    baseSenseLatencyNs: 8.0,
    descZh: '低延遲隨機讀取架構，取代微縮停滯之平面 eFlash，突破 28nm 以下密度極限。',
    descEn: 'Low-latency random read architecture replacing planar eFlash beyond 28nm scaling limits.'
  },
  vert_3d_nand_128l: {
    id: 'vert_3d_nand_128l',
    nameZh: '128 層 3D CTF NAND (高密度資料記錄大容量)',
    nameEn: '128-Tier 3D CTF NAND (Ultra-High-Density Storage)',
    tierCount: 128,
    tierThicknessNm: 35.0,
    arrayLengthUm: 250.0,
    baseSenseLatencyNs: 25.0,
    descZh: '電荷陷阱型高堆疊陣列，垂直階梯走線極長，字元線電阻電容延遲顯著。',
    descEn: 'Dense charge-trap 3D NAND array with long staircase routing, severe WL RC delay.'
  },
  vert_3d_reram_64l: {
    id: 'vert_3d_reram_64l',
    nameZh: '64 層 3D 交叉陣列 ReRAM (BEOL 神經網路權重)',
    nameEn: '64-Tier 3D Crossbar ReRAM (BEOL Synaptic Tensor)',
    tierCount: 64,
    tierThicknessNm: 30.0,
    arrayLengthUm: 60.0,
    baseSenseLatencyNs: 6.0,
    descZh: '後段金屬化奈米雙向阻變微絲，微縮厚度引發金屬薄膜表面強烈散射。',
    descEn: 'BEOL nanoscale memristive filaments, severe thin-film surface scattering under scaling.'
  }
};

/**
 * Word-Line Conductor Metallization Profiles
 * @type {Record<string, WordlineConductorProfile>}
 */
export const WORDLINE_CONDUCTORS = {
  molybdenum_mo_pvd: {
    id: 'molybdenum_mo_pvd',
    nameZh: '低電阻率金屬鉬 (Advanced Molybdenum Mo)',
    nameEn: 'Advanced Molybdenum (Mo / Low Size Effect)',
    bulkResistivityUohmCm: 5.2,
    electronMeanFreePathNm: 10.0,
    surfaceSpecularityP: 0.35,
    grainBoundaryReflectivityR: 0.25,
    materialNatureZh: '先進 3D 替代金屬：比鎢具備更低電阻率與更平滑界面，薄膜厚度 20nm 下延遲大幅縮減。',
    materialNatureEn: 'Advanced 3D replacement: lower resistivity and smoother interface than W, reducing RC.'
  },
  tungsten_w_ald: {
    id: 'tungsten_w_ald',
    nameZh: 'ALD 沉積金屬鎢 (Conventional ALD Tungsten W)',
    nameEn: 'Conventional ALD Tungsten (W / Mainstream)',
    bulkResistivityUohmCm: 5.6,
    electronMeanFreePathNm: 15.5,
    surfaceSpecularityP: 0.10,
    grainBoundaryReflectivityR: 0.45,
    materialNatureZh: '業界量產成熟材料：高階梯覆蓋率，但在超薄膜厚下晶界反射導致電阻率暴增 2.5 倍。',
    materialNatureEn: 'Mass-production standard: excellent step coverage, but resistivity spikes 2.5x under scaling.'
  },
  ruthenium_ru_subnm: {
    id: 'ruthenium_ru_subnm',
    nameZh: '微縮耐散射金屬釕 (Ultra-Scaled Ruthenium Ru)',
    nameEn: 'Ultra-Scaled Ruthenium (Ru / Short Mean Free Path)',
    bulkResistivityUohmCm: 7.1,
    electronMeanFreePathNm: 4.9, // Very short MFP
    surfaceSpecularityP: 0.40,
    grainBoundaryReflectivityR: 0.20,
    materialNatureZh: '極短電子平均自由程：在 15nm 以下微縮厚度幾乎不發生尺寸電阻暴增，適用於高層數 3D。',
    materialNatureEn: 'Very short MFP (4.9nm): minimal resistivity surge below 15nm, ideal for high tier counts.'
  },
  doped_poly_silicon: {
    id: 'doped_poly_silicon',
    nameZh: '重摻雜多晶矽 (Doped Poly-Si / 低成本基準)',
    nameEn: 'Doped Polysilicon (Poly-Si / Legacy Baseline)',
    bulkResistivityUohmCm: 850.0,
    electronMeanFreePathNm: 2.0,
    surfaceSpecularityP: 0.0,
    grainBoundaryReflectivityR: 0.85,
    materialNatureZh: '傳統低成本製程：電阻率極高，僅適用於少量層數（<16層）或極低頻讀取。',
    materialNatureEn: 'Legacy low-cost process: extreme resistivity, causing intolerable RC delay in high tiers.'
  }
};

/**
 * 3D Geometry and Physical Constants
 */
export const VERTICAL_3D_CONSTANTS = {
  STAIRCASE_STEP_PITCH_UM: 0.14, // Horizontal length per staircase tier step (um)
  WORDLINE_WIDTH_NM: 35.0, // Litho width of wordline (nm)
  DIELECTRIC_PERMITTIVITY_K: 3.9, // SiO2 inter-tier dielectric
  EPSILON_0: 8.854e-12, // F/m
  DRIVER_RESISTANCE_OHM: 350.0 // Word-line driver transistor resistance (Ohm)
};

/**
 * Calculate 3D vertical stacked eNVM RC delay, staircase resistance, and access time
 * @param {Object} params
 * @param {string} params.presetId
 * @param {string} params.conductorId
 * @param {number} params.tierCount - Number of vertical layers
 * @param {number} params.metalThicknessNm - Word-line conductor thickness (nm)
 * @param {number} params.arrayLengthUm - Array horizontal length (um)
 * @returns {Object} Comprehensive calculation results
 */
export function calculateVertical3dMetrics({
  presetId = 'vert_3d_antifuse_64l',
  conductorId = 'molybdenum_mo_pvd',
  tierCount = 64,
  metalThicknessNm = 25.0,
  arrayLengthUm = 120.0
} = {}) {
  const preset = VERTICAL_3D_PRESETS[presetId] || VERTICAL_3D_PRESETS.vert_3d_antifuse_64l;
  const conductor = WORDLINE_CONDUCTORS[conductorId] || WORDLINE_CONDUCTORS.molybdenum_mo_pvd;

  // 1. Thin-Film Metal Resistivity Size-Effect (Fuchs-Sondheimer & Mayadas-Shatzkes)
  // rho_eff = rho_0 * [ 1 + (3/8)*(1-p)*(lambda / t) + 1.5*(R / (1-R))*(lambda / d_grain) ]
  // Assume grain size d_grain ~ metalThicknessNm
  const lambda = conductor.electronMeanFreePathNm;
  const t = Math.max(5.0, metalThicknessNm);
  const p = conductor.surfaceSpecularityP;
  const R = conductor.grainBoundaryReflectivityR;

  const fuchsTerm = (3.0 / 8.0) * (1.0 - p) * (lambda / t);
  const mayadasTerm = 1.5 * (R / (1.0 - R)) * (lambda / t);
  const sizeEffectFactor = 1.0 + fuchsTerm + mayadasTerm;
  const effectiveResistivityUohmCm = conductor.bulkResistivityUohmCm * sizeEffectFactor;
  const effectiveResistivityOhmM = effectiveResistivityUohmCm * 1e-8; // 1 uOhm*cm = 1e-8 Ohm*m

  // 2. Staircase Contact Etch Geometry
  // Bottom tier (Tier 1) traverses the full array PLUS the entire staircase contact run
  // Top tier (Tier N) only traverses the array
  const totalStackHeightUm = (tierCount * preset.tierThicknessNm) / 1000.0;
  const maxStaircaseLengthUm = tierCount * VERTICAL_3D_CONSTANTS.STAIRCASE_STEP_PITCH_UM;

  // Word-line cross-sectional area (m2)
  const crossSectionAreaM2 = (VERTICAL_3D_CONSTANTS.WORDLINE_WIDTH_NM * 1e-9) * (metalThicknessNm * 1e-9);

  // Resistance per meter (Ohm / m)
  const resistancePerMeter = effectiveResistivityOhmM / crossSectionAreaM2;

  // Capacitance per meter (inter-tier parallel plate + fringing)
  // C = epsilon * (Width / Thickness) + fringing
  const dielectricThicknessM = (preset.tierThicknessNm - metalThicknessNm) * 1e-9;
  const capPerMeter = (VERTICAL_3D_CONSTANTS.DIELECTRIC_PERMITTIVITY_K * VERTICAL_3D_CONSTANTS.EPSILON_0 * (VERTICAL_3D_CONSTANTS.WORDLINE_WIDTH_NM * 1e-9) / Math.max(5e-9, dielectricThicknessM)) * 2.0; // Both top and bottom sides

  // 3. Worst-Case Tier (Bottom Tier 1) RC Delay
  const worstLengthUm = arrayLengthUm + maxStaircaseLengthUm;
  const worstLengthM = worstLengthUm * 1e-6;
  const worstResistanceOhm = resistancePerMeter * worstLengthM;
  const worstCapacitanceF = capPerMeter * worstLengthM;

  // Distributed RC propagation delay: t_rc = 0.5 * R * C + R_driver * C
  const worstWlDelaySec = (0.5 * worstResistanceOhm * worstCapacitanceF) + (VERTICAL_3D_CONSTANTS.DRIVER_RESISTANCE_OHM * worstCapacitanceF);
  const worstWlDelayNs = worstWlDelaySec * 1e9;

  // Best-Case Tier (Top Tier N) RC Delay
  const bestLengthUm = arrayLengthUm;
  const bestLengthM = bestLengthUm * 1e-6;
  const bestResistanceOhm = resistancePerMeter * bestLengthM;
  const bestCapacitanceF = capPerMeter * bestLengthM;
  const bestWlDelaySec = (0.5 * bestResistanceOhm * bestCapacitanceF) + (VERTICAL_3D_CONSTANTS.DRIVER_RESISTANCE_OHM * bestCapacitanceF);
  const bestWlDelayNs = bestWlDelaySec * 1e9;

  // RC Delay Gradient (Skew) between top and bottom tiers
  const tierDelaySkewNs = worstWlDelayNs - bestWlDelayNs;

  // 4. Overall Read Access Time
  const totalAccessTimeNs = preset.baseSenseLatencyNs + worstWlDelayNs;

  // 5. Tier Architectural Grade Evaluation
  let tierGrade = 'High-Speed 3D Fabric';
  let gradeColor = '#10b981';
  let verdictZh = '';
  let verdictEn = '';

  if (totalAccessTimeNs > 50.0 || worstWlDelayNs > 25.0) {
    tierGrade = 'Severe RC Bottle-neck';
    gradeColor = '#ef4444';
    verdictZh = `警告：${tierCount} 層堆疊使底層字元線長達 ${worstLengthUm.toFixed(0)} µm！薄膜尺寸效應使電阻率擴增 ${sizeEffectFactor.toFixed(1)} 倍，字元線 RC 延遲達 ${worstWlDelayNs.toFixed(1)} ns（總存取延遲 ${totalAccessTimeNs.toFixed(1)} ns）。強烈建議改採先進金屬鉬 (Mo) 或加入中央字元線驅動中繼器 (WL Driver Repeater)。`;
    verdictEn = `Warning: ${tierCount}-tier stack extends bottom WL to ${worstLengthUm.toFixed(0)} µm. Thin-film size effect increases resistivity by ${sizeEffectFactor.toFixed(1)}x, driving WL RC delay to ${worstWlDelayNs.toFixed(1)} ns (total access ${totalAccessTimeNs.toFixed(1)} ns). Recommend low-resistivity Mo or center-placed WL repeaters.`;
  } else if (totalAccessTimeNs > 20.0 || worstWlDelayNs > 10.0) {
    tierGrade = 'Qualified 3D Tier Architecture';
    gradeColor = '#f59e0b';
    verdictZh = `合規：${tierCount} 層垂直階梯走線延遲梯差為 ${tierDelaySkewNs.toFixed(1)} ns，最差層 RC 延遲 ${worstWlDelayNs.toFixed(1)} ns，端到端讀取存取時間 ${totalAccessTimeNs.toFixed(1)} ns，符合車用代碼即時啟動標準。`;
    verdictEn = `Qualified: ${tierCount}-tier staircase delay skew is ${tierDelaySkewNs.toFixed(1)} ns; worst WL delay is ${worstWlDelayNs.toFixed(1)} ns, yielding ${totalAccessTimeNs.toFixed(1)} ns total access time, clearing automotive fast-boot specifications.`;
  } else {
    tierGrade = 'High-Speed 3D Fabric';
    gradeColor = '#10b981';
    verdictZh = `優異：${conductor.nameZh} 展現卓越微縮抗散射能力（尺寸效應僅 ${sizeEffectFactor.toFixed(2)} 倍）。最差字元線 RC 延遲壓低至 ${worstWlDelayNs.toFixed(2)} ns，總存取延遲 ${totalAccessTimeNs.toFixed(1)} ns，提供極高隨機讀取頻寬吞吐。`;
    verdictEn = `Optimal: ${conductor.nameEn} exhibits exceptional scattering resistance (size effect only ${sizeEffectFactor.toFixed(2)}x). Worst WL RC delay suppressed to ${worstWlDelayNs.toFixed(2)} ns, total access ${totalAccessTimeNs.toFixed(1)} ns, delivering high random read bandwidth.`;
  }

  return {
    preset,
    conductor,
    tierCount,
    metalThicknessNm,
    arrayLengthUm,
    totalStackHeightUm,
    maxStaircaseLengthUm,
    worstLengthUm,
    sizeEffectFactor,
    effectiveResistivityUohmCm,
    worstResistanceOhm,
    worstCapacitanceF,
    worstWlDelayNs,
    bestWlDelayNs,
    tierDelaySkewNs,
    totalAccessTimeNs,
    tierGrade,
    gradeColor,
    verdictZh,
    verdictEn
  };
}

/**
 * Draw 3D vertical stacked NVM visualization onto Canvas
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'tier_count_vs_rc_delay' | 'tier_delay_gradient_profile'} mode
 */
export function drawVertical3dCanvas(canvas, metrics, mode = 'tier_count_vs_rc_delay') {
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

  // Background - Essential clearRect
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

  if (mode === 'tier_count_vs_rc_delay') {
    // Mode 1: Tier count (16 to 192 layers) vs Worst WL RC Delay (ns)
    const tMin = 16;
    const tMax = 192;

    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let xPix = 0; xPix <= plotW; xPix++) {
      const tc = Math.round(tMin + (xPix / plotW) * (tMax - tMin));
      const testRes = calculateVertical3dMetrics({
        presetId: metrics.preset.id,
        conductorId: metrics.conductor.id,
        tierCount: tc,
        metalThicknessNm: metrics.metalThicknessNm,
        arrayLengthUm: metrics.arrayLengthUm
      });

      // Map 0 to 40 ns delay
      const normY = Math.max(0, Math.min(1, testRes.worstWlDelayNs / 40.0));
      const yPix = padTop + plotH * (1.0 - normY);
      if (xPix === 0) ctx.moveTo(padLeft + xPix, yPix);
      else ctx.lineTo(padLeft + xPix, yPix);
    }
    ctx.stroke();

    // 20ns latency limit line
    const limitY = padTop + plotH * (1.0 - (20.0 / 40.0));
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, limitY);
    ctx.lineTo(padLeft + plotW, limitY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current point
    const currentX = padLeft + ((metrics.tierCount - tMin) / (tMax - tMin)) * plotW;
    const currentNormY = Math.max(0, Math.min(1, metrics.worstWlDelayNs / 40.0));
    const currentY = padTop + plotH * (1.0 - currentNormY);

    ctx.fillStyle = metrics.worstWlDelayNs <= 20.0 ? '#10b981' : '#ef4444';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('16 Tiers', padLeft, height - 10);
    ctx.fillText('96 Tiers', padLeft + plotW * 0.45, height - 10);
    ctx.fillText('192 Tiers', padLeft + plotW - 55, height - 10);

    ctx.fillStyle = '#ef4444';
    ctx.fillText('20ns Latency Bound', padLeft + 6, limitY - 4);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillText(`Worst RC Delay: ${metrics.worstWlDelayNs.toFixed(2)} ns (Total Access: ${metrics.totalAccessTimeNs.toFixed(1)} ns)`, padLeft + 140, padTop + 14);

  } else {
    // Mode 2: Tier gradient profile (Bar / Step profile from Tier 1 to Tier N)
    const count = metrics.tierCount;
    const barW = Math.max(2, plotW / count);

    for (let tier = 1; tier <= count; tier++) {
      // Calculate delay for this specific tier
      const stairLenUm = (count - tier) * VERTICAL_3D_CONSTANTS.STAIRCASE_STEP_PITCH_UM;
      const tierLenUm = metrics.arrayLengthUm + stairLenUm;
      const tierLenM = tierLenUm * 1e-6;

      const crossSecM2 = (VERTICAL_3D_CONSTANTS.WORDLINE_WIDTH_NM * 1e-9) * (metrics.metalThicknessNm * 1e-9);
      const rM = (metrics.effectiveResistivityUohmCm * 1e-8) / crossSecM2;
      const dThickM = (metrics.preset.tierThicknessNm - metrics.metalThicknessNm) * 1e-9;
      const cM = (VERTICAL_3D_CONSTANTS.DIELECTRIC_PERMITTIVITY_K * VERTICAL_3D_CONSTANTS.EPSILON_0 * (VERTICAL_3D_CONSTANTS.WORDLINE_WIDTH_NM * 1e-9) / Math.max(5e-9, dThickM)) * 2.0;

      const rTot = rM * tierLenM;
      const cTot = cM * tierLenM;
      const delayNs = ((0.5 * rTot * cTot) + (VERTICAL_3D_CONSTANTS.DRIVER_RESISTANCE_OHM * cTot)) * 1e9;

      const normY = Math.max(0, Math.min(1, delayNs / Math.max(10, metrics.worstWlDelayNs * 1.2)));
      const x = padLeft + ((tier - 1) / count) * plotW;
      const y = padTop + plotH * (1.0 - normY);
      const h = plotH * normY;

      // Color from purple to cyan
      ctx.fillStyle = tier === 1 ? '#f43f5e' : (tier === count ? '#38bdf8' : '#8b5cf6');
      ctx.fillRect(x, y, barW - 0.5, h);
    }

    // Labels
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Tier 1 (Bottom / Longest)', padLeft, height - 10);
    ctx.fillText(`Tier ${count} (Top)`, padLeft + plotW - 80, height - 10);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`Delay Skew: ${metrics.tierDelaySkewNs.toFixed(2)} ns (Top: ${metrics.bestWlDelayNs.toFixed(2)}ns → Bottom: ${metrics.worstWlDelayNs.toFixed(2)}ns)`, padLeft + 6, padTop + 14);
  }

  ctx.restore();
}

/**
 * Initialize 3D vertical stacked NVM simulator DOM bindings
 * @param {string} rootSelector
 */
export function initVertical3dSimulator(rootSelector = '#vertical-3d-simulator-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const presetSelect = root.querySelector('#vert3d-preset-select');
  const conductorSelect = root.querySelector('#vert3d-conductor-select');
  const tierSlider = root.querySelector('#vert3d-tier-slider');
  const thicknessSlider = root.querySelector('#vert3d-thickness-slider');
  const arrayLengthSlider = root.querySelector('#vert3d-length-slider');

  const tierVal = root.querySelector('#vert3d-tier-val');
  const thicknessVal = root.querySelector('#vert3d-thickness-val');
  const arrayLengthVal = root.querySelector('#vert3d-length-val');

  const outResistivity = root.querySelector('#vert3d-out-resistivity');
  const outWorstDelay = root.querySelector('#vert3d-out-worstdelay');
  const outDelaySkew = root.querySelector('#vert3d-out-delayskew');
  const outAccessTime = root.querySelector('#vert3d-out-accesstime');
  const outTierGrade = root.querySelector('#vert3d-out-grade');
  const outVerdict = root.querySelector('#vert3d-out-verdict');

  const canvas = root.querySelector('#vert3d-canvas');
  const modeTiersBtn = root.querySelector('#vert3d-mode-tiers');
  const modeGradientBtn = root.querySelector('#vert3d-mode-gradient');

  let currentMode = 'tier_count_vs_rc_delay';

  function update() {
    const isZh = document.documentElement.lang.startsWith('zh');
    const presetId = presetSelect ? presetSelect.value : 'vert_3d_antifuse_64l';
    const conductorId = conductorSelect ? conductorSelect.value : 'molybdenum_mo_pvd';
    const tierCount = tierSlider ? parseInt(tierSlider.value, 10) : 64;
    const metalThicknessNm = thicknessSlider ? parseFloat(thicknessSlider.value) : 25.0;
    const arrayLengthUm = arrayLengthSlider ? parseFloat(arrayLengthSlider.value) : 120.0;

    if (tierVal) tierVal.textContent = `${tierCount} L`;
    if (thicknessVal) thicknessVal.textContent = `${metalThicknessNm} nm`;
    if (arrayLengthVal) arrayLengthVal.textContent = `${arrayLengthUm} µm`;

    if (tierSlider) tierSlider.setAttribute('aria-valuetext', `${tierCount} Tiers`);
    if (thicknessSlider) thicknessSlider.setAttribute('aria-valuetext', `${metalThicknessNm} nm`);
    if (arrayLengthSlider) arrayLengthSlider.setAttribute('aria-valuetext', `${arrayLengthUm} µm`);

    const metrics = calculateVertical3dMetrics({
      presetId,
      conductorId,
      tierCount,
      metalThicknessNm,
      arrayLengthUm
    });

    if (outResistivity) outResistivity.textContent = `${metrics.effectiveResistivityUohmCm.toFixed(2)} µΩ·cm`;
    if (outWorstDelay) {
      outWorstDelay.textContent = `${metrics.worstWlDelayNs.toFixed(2)} ns`;
      outWorstDelay.style.color = metrics.worstWlDelayNs <= 20.0 ? '#10b981' : '#ef4444';
    }
    if (outDelaySkew) outDelaySkew.textContent = `${metrics.tierDelaySkewNs.toFixed(2)} ns`;
    if (outAccessTime) {
      outAccessTime.textContent = `${metrics.totalAccessTimeNs.toFixed(1)} ns`;
      outAccessTime.style.color = metrics.totalAccessTimeNs <= 30.0 ? '#10b981' : '#f59e0b';
    }

    if (outTierGrade) {
      outTierGrade.textContent = metrics.tierGrade;
      outTierGrade.style.color = metrics.gradeColor;
    }

    if (outVerdict) {
      outVerdict.textContent = isZh ? metrics.verdictZh : metrics.verdictEn;
    }

    if (canvas) {
      drawVertical3dCanvas(canvas, metrics, currentMode);
    }
  }

  if (presetSelect) presetSelect.addEventListener('change', () => {
    const p = VERTICAL_3D_PRESETS[presetSelect.value];
    if (p) {
      if (tierSlider) tierSlider.value = p.tierCount;
      if (arrayLengthSlider) arrayLengthSlider.value = p.arrayLengthUm;
    }
    update();
  });

  if (conductorSelect) conductorSelect.addEventListener('change', update);
  if (tierSlider) tierSlider.addEventListener('input', update);
  if (thicknessSlider) thicknessSlider.addEventListener('input', update);
  if (arrayLengthSlider) arrayLengthSlider.addEventListener('input', update);

  if (modeTiersBtn && modeGradientBtn) {
    modeTiersBtn.addEventListener('click', () => {
      currentMode = 'tier_count_vs_rc_delay';
      modeTiersBtn.classList.add('active');
      modeTiersBtn.setAttribute('aria-pressed', 'true');
      modeGradientBtn.classList.remove('active');
      modeGradientBtn.setAttribute('aria-pressed', 'false');
      modeTiersBtn.style.background = '#8b5cf6';
      modeTiersBtn.style.borderColor = '#a78bfa';
      modeTiersBtn.style.color = '#ffffff';
      modeGradientBtn.style.background = '#1e293b';
      modeGradientBtn.style.borderColor = '#475569';
      modeGradientBtn.style.color = '#94a3b8';
      update();
    });

    modeGradientBtn.addEventListener('click', () => {
      currentMode = 'tier_delay_gradient_profile';
      modeGradientBtn.classList.add('active');
      modeGradientBtn.setAttribute('aria-pressed', 'true');
      modeTiersBtn.classList.remove('active');
      modeTiersBtn.setAttribute('aria-pressed', 'false');
      modeGradientBtn.style.background = '#8b5cf6';
      modeGradientBtn.style.borderColor = '#a78bfa';
      modeGradientBtn.style.color = '#ffffff';
      modeTiersBtn.style.background = '#1e293b';
      modeTiersBtn.style.borderColor = '#475569';
      modeTiersBtn.style.color = '#94a3b8';
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
    document.addEventListener('DOMContentLoaded', () => initVertical3dSimulator());
  } else {
    initVertical3dSimulator();
  }
}
