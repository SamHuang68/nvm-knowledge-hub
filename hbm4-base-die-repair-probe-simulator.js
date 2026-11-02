/**
 * @file hbm4-base-die-repair-probe-simulator.js
 * @description First-principles simulator for HBM4 logic base die stacked compound yield,
 * AntiFuse OTP post-package repair (hPPR) recovery, 2048-bit PHY skew trimming,
 * and wafer-sort logic probe card test economics (Micronics Japan vs. MPI, CHPT, Technoprobe, FormFactor).
 * @version 1.0.0
 * @license MIT
 */

/**
 * @typedef {Object} Hbm4Preset
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {string} baseDieTech - 'tsmc_12nm' | 'tsmc_3nm' | 'samsung_4nm' | 'dram_base'
 * @property {number} baseDieYield - Base die wafer sort yield (0.80 - 0.98)
 * @property {number} defaultStackLayers - 4, 8, 12, or 16
 * @property {number} defaultCoreDieYield - DRAM core die KGD yield (0.90 - 0.99)
 * @property {number} defaultPinCount - Probe card pin count (2048 - 12800)
 * @property {string} foundryVendor - 'tsmc' | 'samsung_foundry' | 'hybrid' | 'idm_internal'
 * @property {string} probeCardVendor - key in PROBE_CARD_ARCHITECTURES
 * @property {string} descZh
 * @property {string} descEn
 */

/**
 * @typedef {Object} ProbeCardArch
 * @property {string} id
 * @property {string} nameZh
 * @property {string} nameEn
 * @property {string} type - 'logic_mems' | 'memory_legacy'
 * @property {string} vendorName
 * @property {number} baseAspUsd - Base probe card ASP (USD)
 * @property {number} maxPinCount - Maximum supported pin count
 * @property {number} foundryExposureFactor - Foundry procurement alignment (0.1 - 1.0)
 * @property {number} hbmGrossMarginEst - Estimated gross margin for HBM probe card
 * @property {string} descZh
 * @property {string} descEn
 */

/**
 * Standard HBM4 Base Die system presets
 * @type {Record<string, Hbm4Preset>}
 */
export const HBM4_SYSTEM_PRESETS = {
  sk_hynix_tsmc_12nm_16hi: {
    id: 'sk_hynix_tsmc_12nm_16hi',
    nameZh: 'SK 海力士 16-Hi (台積電 12nm Base Die, 2048-bit PHY)',
    nameEn: 'SK Hynix 16-Hi (TSMC 12nm Base Die, 2048-bit PHY)',
    baseDieTech: 'tsmc_12nm',
    baseDieYield: 0.945,
    defaultStackLayers: 16,
    defaultCoreDieYield: 0.955,
    defaultPinCount: 8192,
    foundryVendor: 'tsmc',
    probeCardVendor: 'mpi_taiwan',
    descZh: '委託台積電 12nm 邏輯代工 Base Die，16 層 DRAM Core 堆疊，AntiFuse 0-Mask 2048-bit PHY 偏斜校正，旺矽/精測/Technoprobe 邏輯測試生態。',
    descEn: 'Outsourced to TSMC 12nm logic base die, 16-Hi DRAM stack with AntiFuse 0-mask 2048-bit PHY skew trim, MPI/CHPT/Technoprobe logic probe cards.'
  },
  samsung_foundry_4nm_12hi: {
    id: 'samsung_foundry_4nm_12hi',
    nameZh: '三星電子 12-Hi (自家晶圓代工 4nm SF4A, 2048-bit PHY)',
    nameEn: 'Samsung 12-Hi (In-house SF4A 4nm Base Die, 2048-bit PHY)',
    baseDieTech: 'samsung_4nm',
    baseDieYield: 0.910,
    defaultStackLayers: 12,
    defaultCoreDieYield: 0.950,
    defaultPinCount: 7168,
    foundryVendor: 'samsung_foundry',
    probeCardVendor: 'technoprobe',
    descZh: '三星自家代工 4nm 先進邏輯 Base Die，12 層 DRAM 堆疊，晶圓測試採購權移至自家晶圓代工部門，Technoprobe/FormFactor 邏輯探針卡。',
    descEn: 'Samsung in-house 4nm logic base die, 12-Hi DRAM stack, wafer test procurement shifted to foundry division, Technoprobe/FormFactor probe cards.'
  },
  sk_hynix_tsmc_3nm_nextgen: {
    id: 'sk_hynix_tsmc_3nm_nextgen',
    nameZh: '次世代 HBM4E 16-Hi (台積電 3nm N3P Base Die, 2048-bit PHY)',
    nameEn: 'Next-Gen HBM4E 16-Hi (TSMC 3nm N3P Base Die, 2048-bit PHY)',
    baseDieTech: 'tsmc_3nm',
    baseDieYield: 0.895,
    defaultStackLayers: 16,
    defaultCoreDieYield: 0.960,
    defaultPinCount: 10240,
    foundryVendor: 'tsmc',
    probeCardVendor: 'chpt_taiwan',
    descZh: '邁入 3 奈米級極致密度邏輯 Base Die，極高針數微間距測試，微凸塊直接鍵合，中華精測/旺矽 MEMS 探針卡。',
    descEn: 'Next-gen 3nm logic base die with ultra-dense micro-pitch testing, direct hybrid bonding, CHPT/MPI MEMS probe cards.'
  },
  micron_advanced_eval_8hi: {
    id: 'micron_advanced_eval_8hi',
    nameZh: '美光 8-Hi 評估代工邏輯 (12nm 先進邏輯, 2048-bit PHY)',
    nameEn: 'Micron 8-Hi Logic Evaluation (12nm Advanced Logic, 2048-bit PHY)',
    baseDieTech: 'tsmc_12nm',
    baseDieYield: 0.940,
    defaultStackLayers: 8,
    defaultCoreDieYield: 0.965,
    defaultPinCount: 5120,
    foundryVendor: 'hybrid',
    probeCardVendor: 'formfactor',
    descZh: '美光由自研 DRAM 製程評估轉向晶圓代工先進邏輯 Base Die，FormFactor/旺矽混合測試評估。',
    descEn: 'Micron evaluating transition from proprietary DRAM base die to outsourced advanced logic foundry, FormFactor/MPI hybrid testing.'
  },
  hbm3e_legacy_dram_base: {
    id: 'hbm3e_legacy_dram_base',
    nameZh: '傳統 HBM3E 8-Hi (DRAM 製程 Base Die 對照組, 1024-bit PHY)',
    nameEn: 'Legacy HBM3E 8-Hi (DRAM Process Base Die Baseline, 1024-bit PHY)',
    baseDieTech: 'dram_base',
    baseDieYield: 0.925,
    defaultStackLayers: 8,
    defaultCoreDieYield: 0.945,
    defaultPinCount: 2560,
    foundryVendor: 'idm_internal',
    probeCardVendor: 'micronics_japan',
    descZh: '前代 HBM3E 標準：記憶體廠內部生產 DRAM 製程 Base Die，日本 Micronics Japan 傳統記憶體探針卡採購。',
    descEn: 'Legacy HBM3E baseline: in-house DRAM base die, Micronics Japan memory probe cards purchased directly by memory IDMs.'
  }
};

/**
 * Probe card vendor and architecture profiles
 * @type {Record<string, ProbeCardArch>}
 */
export const PROBE_CARD_ARCHITECTURES = {
  mpi_taiwan: {
    id: 'mpi_taiwan',
    nameZh: '垂直微懸臂梁 MEMS 探針卡架構 (VPC / MEMS)',
    nameEn: 'Vertical Cantilever MEMS Probe Architecture (VPC / MEMS)',
    type: 'logic_mems',
    vendorName: 'Vertical VPC/MEMS',
    baseAspUsd: 145000,
    maxPinCount: 12000,
    foundryExposureFactor: 0.88,
    hbmGrossMarginEst: 0.54,
    descZh: '專利垂直微懸臂導向結構，支援高針數高頻小間距晶圓級測試，降低多次接觸損傷。',
    descEn: 'Patented micro-cantilever vertical guide architecture for high-pin fine-pitch wafer sort.'
  },
  chpt_taiwan: {
    id: 'chpt_taiwan',
    nameZh: '薄膜多層測試載板高頻 MEMS 探針 (MLO / MEMS)',
    nameEn: 'Thin-Film Multi-Layer Organic MEMS Architecture (MLO / MEMS)',
    type: 'logic_mems',
    vendorName: 'Thin-Film MEMS',
    baseAspUsd: 165000,
    maxPinCount: 14000,
    foundryExposureFactor: 0.92,
    hbmGrossMarginEst: 0.56,
    descZh: '多層有機薄膜載板與超微細間距 MEMS 探針，支援高速高頻寬晶粒介面測試。',
    descEn: 'Multi-layer organic thin-film substrate with fine-pitch MEMS supporting high-speed PHY wafer sort.'
  },
  technoprobe: {
    id: 'technoprobe',
    nameZh: '多層陶瓷空間轉換垂直 MEMS 探針 (MLC / MEMS)',
    nameEn: 'Multi-Layer Ceramic Space Transformer MEMS (MLC / MEMS)',
    type: 'logic_mems',
    vendorName: 'Ceramic MEMS',
    baseAspUsd: 180000,
    maxPinCount: 16000,
    foundryExposureFactor: 0.85,
    hbmGrossMarginEst: 0.58,
    descZh: '多層陶瓷垂直空間轉換技術，支援超高針數極限密度並行測試。',
    descEn: 'Multi-layer ceramic vertical space transformer supporting ultra-high-pin dense parallel sort.'
  },
  formfactor: {
    id: 'formfactor',
    nameZh: '彈性微針陣列與高頻屏蔽探針 (MicroSpring™ / RF MEMS)',
    nameEn: 'Compliant MicroSpring™ & RF Shielded MEMS Architecture',
    type: 'logic_mems',
    vendorName: 'Spring MEMS',
    baseAspUsd: 175000,
    maxPinCount: 15000,
    foundryExposureFactor: 0.80,
    hbmGrossMarginEst: 0.55,
    descZh: '彈性微針陣列與高頻屏蔽結構，支援高速混訊小晶片介面測試。',
    descEn: 'Compliant micro-spring arrays with RF shielding supporting high-speed chiplet interfaces.'
  },
  micronics_japan: {
    id: 'micronics_japan',
    nameZh: '傳統記憶體垂直接觸懸臂探針 (Vertical Cantilever Baseline)',
    nameEn: 'Traditional Memory Vertical Cantilever Architecture (Baseline)',
    type: 'memory_legacy',
    vendorName: 'Cantilever Baseline',
    baseAspUsd: 65000,
    maxPinCount: 4096,
    foundryExposureFactor: 0.15,
    hbmGrossMarginEst: 0.38,
    descZh: '傳統垂直懸臂針架構，適用於標準記憶體晶粒測試，面對數萬針超寬介面測試受限於並行針數密度。',
    descEn: 'Traditional vertical cantilever architecture for standard memory, with pin-density limits in ultra-wide PHY sort.'
  }
};

// 量測斷行：英文在空白處斷開，中日韓字元可逐字斷開；閉合標點不放在行首。
const CANVAS_WRAP_TOKENS = /[⺀-鿿豈-﫿！-｠]|[^\s⺀-鿿豈-﫿！-｠]+|\s+/g;
function wrapCanvasText(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  (String(text).match(CANVAS_WRAP_TOKENS) || []).forEach(token => {
    const candidate = line + token;
    if (!line.trim() || /^[)）,，、。:：;；]/.test(token) || ctx.measureText(candidate.trim()).width <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line.trim());
      line = /^\s+$/.test(token) ? '' : token;
    }
  });
  if (line.trim()) lines.push(line.trim());
  return lines;
}

// 圖例逐項排列：同列放不下就換列，單項比可用寬度還長才斷行。回傳各段位置與最後一列基線。
function layoutCanvasLegend(ctx, items, x0, y0, maxWidth, lineHeight, gap = 16) {
  const placed = [];
  let x = x0;
  let y = y0;
  items.forEach(({ text, color }) => {
    const w = ctx.measureText(text).width;
    if (x > x0 && x + w > x0 + maxWidth) { x = x0; y += lineHeight; }
    if (x + w <= x0 + maxWidth) {
      placed.push({ text, color, x, y });
      x += w + gap;
      return;
    }
    const lines = wrapCanvasText(ctx, text, maxWidth);
    lines.forEach((line, i) => placed.push({ text: line, color, x: x0, y: y + i * lineHeight }));
    y += (lines.length - 1) * lineHeight;
    x = x0 + ctx.measureText(lines[lines.length - 1] || '').width + gap;
  });
  return { placed, lastY: y };
}

// x 軸刻度標籤：夾在 [minX, maxX] 內；與同列已放標籤重疊時改放下一列。
function drawCanvasTickLabels(ctx, ticks, baseline, rowHeight, minX, maxX, maxRows = 2) {
  const rows = [];
  ctx.textAlign = 'left';
  ticks.forEach(({ text, x }) => {
    const w = ctx.measureText(text).width;
    const left = Math.max(minX, Math.min(x - w / 2, maxX - w));
    let row = 0;
    while (row < maxRows - 1 && (rows[row] || []).some(([l, r]) => left < r + 6 && left + w > l - 6)) row++;
    (rows[row] = rows[row] || []).push([left, left + w]);
    ctx.fillText(text, left, baseline + row * rowHeight);
  });
}

// 依序嘗試候選位置，取第一個落在邊界內、且不與既有障礙（文字、圓點、線段）重疊的位置；
// 都不完美時，取「超出邊界」最少、其次重疊面積最小的候選。
function pickLabelSpot(ctx, text, candidates, obstacles, bounds) {
  const m = ctx.measureText(text);
  const ascent = m.actualBoundingBoxAscent || 8;
  const descent = m.actualBoundingBoxDescent || 2;
  const rectOf = ({ x, y, align }) => {
    const l = align === 'right' ? x - m.width : align === 'center' ? x - m.width / 2 : x;
    return { l, r: l + m.width, t: y - ascent, b: y + descent };
  };
  const overlap = (a, b) => Math.max(0, Math.min(a.r, b.r) - Math.max(a.l, b.l)) * Math.max(0, Math.min(a.b, b.b) - Math.max(a.t, b.t));
  let best = null;
  for (const candidate of candidates) {
    const rect = rectOf(candidate);
    const outside = Math.max(0, bounds.l - rect.l) + Math.max(0, rect.r - bounds.r) + Math.max(0, bounds.t - rect.t) + Math.max(0, rect.b - bounds.b);
    const covered = obstacles.reduce((sum, o) => sum + overlap(rect, o), 0);
    if (outside === 0 && covered === 0) return { ...candidate, rect };
    if (!best || outside < best.outside || (outside === best.outside && covered < best.covered)) best = { ...candidate, rect, outside, covered };
  }
  return best;
}

// 把折線切成小方塊，當作文字避讓的障礙物。
function polylineObstacles(points, halfWidth) {
  const boxes = [];
  for (let i = 1; i < points.length; i++) {
    const [x1, y1] = points[i - 1];
    const [x2, y2] = points[i];
    const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 3));
    for (let s = 0; s <= steps; s++) {
      const x = x1 + (x2 - x1) * (s / steps);
      const y = y1 + (y2 - y1) * (s / steps);
      boxes.push({ l: x - halfWidth, r: x + halfWidth, t: y - halfWidth, b: y + halfWidth });
    }
  }
  return boxes;
}

/**
 * Calculate first-principles compound stacked yield, eNVM hPPR recovery, and probe card economics
 * @param {Object} params
 * @param {string} params.presetId
 * @param {string} params.probeCardId
 * @param {number} params.coreDieYield - DRAM core die yield (e.g. 0.955)
 * @param {number} params.stackLayers - Stack count (4, 8, 12, 16)
 * @param {number} params.pinCount - Probe card pin count (2048 - 12800)
 * @returns {Object} Calculated metrics
 */
export function calculateHbm4ProbeMetrics(params = {}) {
  const safeParams = params && typeof params === 'object' ? params : {};
  const presetId = typeof safeParams.presetId === 'string' ? safeParams.presetId : 'sk_hynix_tsmc_12nm_16hi';
  const probeCardId = typeof safeParams.probeCardId === 'string' ? safeParams.probeCardId : 'mpi_taiwan';
  const preset = (presetId && Object.prototype.hasOwnProperty.call(HBM4_SYSTEM_PRESETS, presetId))
    ? HBM4_SYSTEM_PRESETS[presetId]
    : HBM4_SYSTEM_PRESETS.sk_hynix_tsmc_12nm_16hi;
  const probeCard = (probeCardId && Object.prototype.hasOwnProperty.call(PROBE_CARD_ARCHITECTURES, probeCardId))
    ? PROBE_CARD_ARCHITECTURES[probeCardId]
    : PROBE_CARD_ARCHITECTURES.mpi_taiwan;

  const validCoreDieYield = Number.isFinite(Number(safeParams.coreDieYield)) ? Number(safeParams.coreDieYield) : 0.955;
  const validStackLayers = Number.isFinite(Number(safeParams.stackLayers)) ? Number(safeParams.stackLayers) : 16;
  const validPinCount = Number.isFinite(Number(safeParams.pinCount)) ? Number(safeParams.pinCount) : 8192;
  const coreDieYield = validCoreDieYield;
  const stackLayers = validStackLayers;
  const pinCount = validPinCount;

  // Base die wafer sort yield
  const yBase = preset.baseDieYield;

  // Bonding yield per layer (TCB/MR-MUF/Hybrid)
  const yBondPerLayer = preset.baseDieTech === 'tsmc_3nm' ? 0.998 : 0.996;

  // Raw unrepaired stack compound yield: Y_raw = Y_base * (Y_core)^N * (Y_bond)^N
  const rawCoreStackYield = Math.pow(validCoreDieYield, validStackLayers);
  const rawBondStackYield = Math.pow(yBondPerLayer, validStackLayers);
  const rawStackYield = yBase * rawCoreStackYield * rawBondStackYield;

  // Redundancy allocation and post-package repair (hPPR) recovery model
  // Redundancy allocation efficiency: logic base die provides dedicated spare line decoders and independent charge pumps (est. 0.82-0.85);
  // whereas legacy DRAM base die is constrained by peripheral routing and high-voltage supply routing (est. 0.70-0.75).
  const isDramBase = preset.baseDieTech === 'dram_base';
  const repairEfficiency = isDramBase ? 0.72 : (preset.baseDieTech === 'tsmc_3nm' ? 0.86 : 0.82);
  
  // High-temperature packaging thermal budget factor (reflow stability heuristic: AntiFuse metal filament ~0.98, planar polysilicon fuse ~0.92)
  const retentionThermalFactor = isDramBase ? 0.92 : 0.98;

  // Repaired effective core die yield
  const effectiveCoreDieYield = validCoreDieYield + (1.0 - validCoreDieYield) * repairEfficiency * retentionThermalFactor;
  const repairedCoreStackYield = Math.pow(effectiveCoreDieYield, validStackLayers);
  const repairedStackYield = Math.min(0.96, yBase * repairedCoreStackYield * rawBondStackYield);

  // Absolute yield recovery delta
  const yieldDelta = Math.max(0, repairedStackYield - rawStackYield);
  const yieldDeltaPercent = yieldDelta * 100.0;

  // Typical module cost/ASP for HBM module (4-Hi: $200, 8-Hi: $320, 12-Hi: $420, 16-Hi: $520 USD)
  const hbmModuleAspUsd = 160 + validStackLayers * 22.5;
  const valueRecoveryPerHbm = yieldDelta * hbmModuleAspUsd;

  // Probe card economics
  const pinScalingFactor = Math.max(0.2, (validPinCount - 2048) / 10000);
  const probeCardAsp = probeCard.baseAspUsd * (1 + pinScalingFactor * 0.70);

  // Wafer sort test time per wafer (seconds): Base scan + 2048-bit PHY trim + TSV BIST
  const testTimePerWaferSec = 140 + (validPinCount / 1000.0) * 11.5;

  // Touchdown count required per wafer (lower is faster)
  const touchdownsPerWafer = validPinCount >= 8192 ? 1 : (validPinCount >= 4096 ? 2 : 4);

  // Logic probe card HBM exposure index (0 - 100)
  const hbmExposureIndex = Math.min(
    100,
    probeCard.foundryExposureFactor * 100 * (0.75 + (pinCount / 8192.0) * 0.25)
  );

  // Rating and dynamic verdict
  let systemRating = 'OPTIMAL';
  let ratingColor = '#047857'; // green

  if (yieldDeltaPercent < 15.0 && stackLayers >= 12) {
    systemRating = 'SUB-OPTIMAL RECOVERY';
    ratingColor = '#b45309';
  } else if (probeCard.type === 'memory_legacy' && pinCount > 4096) {
    systemRating = 'PIN OVERFLOW / HIGH RISK';
    ratingColor = '#b91c1c';
  } else if (stackLayers >= 16 && repairedStackYield >= 0.75) {
    systemRating = 'TIER-1 EXCELLENCE';
    ratingColor = '#0e7490';
  }

  // Dual-language verdicts
  let verdictZh = '';
  let verdictEn = '';

  if (probeCard.type === 'memory_legacy') {
    verdictZh = `測試架構注意：傳統記憶體懸臂探針卡並行針數密度較低，若無法單次涵蓋 HBM4 2048-bit PHY 與 BIST 接點，需透過多次 Touchdown 完成，增加測試時間與熱應力。高密度微間距測試建議評估高針數垂直 MEMS 探針架構。`;
    verdictEn = `TEST CAUTION: Traditional cantilever probe cards have lower pin density; covering HBM4 2048-bit PHY & BIST contacts requires multiple touchdowns, increasing test cycle time. High-density vertical MEMS probe architectures are recommended for single-pass sort.`;
  } else {
    verdictZh = `在 ${stackLayers}-Hi 堆疊下，未修復原始複合良率估算為 ${(rawStackYield * 100).toFixed(1)}%；透過邏輯 Base Die 規劃 AntiFuse OTP 進行封裝後壞列重映射 (hPPR) 與 PHY 偏移微調，模型估算良率提升至 ${(repairedStackYield * 100).toFixed(1)}% (+${yieldDeltaPercent.toFixed(1)}%)，每顆模組挽回價值估算約 $${valueRecoveryPerHbm.toFixed(1)} 美元。${probeCard.nameZh} 具備高針數並行支援能力（指數模型值：${hbmExposureIndex.toFixed(0)}）。`;
    verdictEn = `In a ${stackLayers}-Hi stack, unassisted raw yield is modeled at ${(rawStackYield * 100).toFixed(1)}%; utilizing logic Base Die AntiFuse OTP for post-package repair (hPPR) and PHY skew trim raises modeled yield to ${(repairedStackYield * 100).toFixed(1)}% (+${yieldDeltaPercent.toFixed(1)}%), recovering ~$${valueRecoveryPerHbm.toFixed(1)} per module. ${probeCard.nameEn} offers high-pin parallel test capability (index: ${hbmExposureIndex.toFixed(0)}).`;
  }

  return {
    preset,
    probeCard,
    rawStackYield: rawStackYield * 100.0,
    repairedStackYield: repairedStackYield * 100.0,
    yieldDeltaPercent,
    valueRecoveryPerHbm,
    probeCardAsp,
    testTimePerWaferSec,
    touchdownsPerWafer,
    hbmExposureIndex,
    hbmModuleAspUsd,
    systemRating,
    ratingColor,
    verdictZh,
    verdictEn
  };
}

/**
 * Draw interactive dual-mode simulation visualization on HTML5 Canvas
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'compound_yield_curve'|'probe_card_capex_economics'} mode
 */
export function drawHbm4ProbeCanvas(canvas, metrics, mode = 'compound_yield_curve') {
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

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#f8fafc');
  bgGrad.addColorStop(1, '#f8fafc');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 手機寬度（畫布 < 360px）縮小左右留白與字級；圖例／標題量測後換列，plot 上緣跟著下移。
  const narrow = width < 360;
  const padLeft = narrow ? 44 : 56;
  const padRight = narrow ? 16 : 32;
  const plotW = width - padLeft - padRight;
  const textPx = narrow ? 9 : 10;
  const headerFont = `600 ${textPx}px "IBM Plex Mono", monospace`;
  const headerItems = mode === 'compound_yield_curve'
    ? [
      { text: '--- 未修復原始良率 (Raw Stack Yield)', color: '#dc2626' },
      { text: '— 0-Mask AntiFuse 修復後良率 (Repaired Stack Yield)', color: '#0e7490' }
    ]
    : [{ text: '■ 高密度晶圓測試探針卡並行能力指數模型 (High-Density Wafer Sort Index)', color: '#0369a1' }];
  const headerX = width < 480 ? 8 : padLeft + 10;
  ctx.font = headerFont;
  const header = layoutCanvasLegend(ctx, headerItems, headerX, 20, width - headerX - 8, narrow ? 11 : 13, 24);
  const padTop = 32 + (header.lastY - 20);
  const headerBottom = header.lastY + 3;

  // 模式 2 長條標籤：每格放不下時改成 45° 斜排單行（名稱＋價格），底部留白依標籤長度加大。
  const archKeys = ['micronics_japan', 'mpi_taiwan', 'chpt_taiwan', 'technoprobe', 'formfactor'];
  const labelMap = {
    micronics_japan: 'Cantilever',
    mpi_taiwan: 'VPC/MEMS',
    chpt_taiwan: 'MLO/MEMS',
    technoprobe: 'MLC/MEMS',
    formfactor: 'Spring/MEMS'
  };
  const barLabelFont = `600 ${narrow ? 8.5 : 10}px "IBM Plex Mono", monospace`;
  ctx.font = barLabelFont;
  const barLabels = archKeys.map(key => {
    const card = PROBE_CARD_ARCHITECTURES[key];
    return { name: labelMap[key] || key, cost: card ? `$${(card.baseAspUsd / 1000).toFixed(0)}k` : '' };
  });
  const slotW = plotW / 5;
  const rotateBarLabels = mode !== 'compound_yield_curve' &&
    barLabels.some(l => Math.max(ctx.measureText(l.name).width, ctx.measureText(l.cost).width) > slotW - 6);
  const rotatedLabelSpan = rotateBarLabels
    ? Math.max(...barLabels.map(l => ctx.measureText(`${l.name} ${l.cost}`).width)) * Math.SQRT1_2
    : 0;
  const padBottom = rotateBarLabels ? Math.max(48, Math.ceil(rotatedLabelSpan) + 22) : 48;
  const plotH = height - padTop - padBottom;

  // Grid lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padTop + (plotH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
    ctx.stroke();
  }

  if (mode === 'compound_yield_curve') {
    // Mode 1: 3D Stack Compound Yield Curve (Layers 4 to 16)
    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'right';
    ctx.fillText('100%', padLeft - 8, padTop + 4);
    ctx.fillText('75%', padLeft - 8, padTop + plotH * 0.25 + 4);
    ctx.fillText('50%', padLeft - 8, padTop + plotH * 0.50 + 4);
    ctx.fillText('25%', padLeft - 8, padTop + plotH * 0.75 + 4);
    ctx.fillText('0%', padLeft - 8, padTop + plotH + 4);

    const layerPoints = [4, 8, 12, 16];
    const rawYields = [];
    const repYields = [];

    layerPoints.forEach(layers => {
      const m = calculateHbm4ProbeMetrics({
        presetId: metrics.preset.id,
        probeCardId: metrics.probeCard.id,
        coreDieYield: 0.955,
        stackLayers: layers,
        pinCount: 8192
      });
      rawYields.push(m.rawStackYield);
      repYields.push(m.repairedStackYield);
    });

    const getX = idx => padLeft + (plotW / 3) * idx;
    const getY = yVal => padTop + plotH * (1.0 - yVal / 100.0);

    // Shaded recovery gap polygon
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(repYields[0]));
    for (let i = 1; i < 4; i++) ctx.lineTo(getX(i), getY(repYields[i]));
    for (let i = 3; i >= 0; i--) ctx.lineTo(getX(i), getY(rawYields[i]));
    ctx.closePath();
    ctx.fillStyle = 'rgba(8, 145, 178, 0.14)';
    ctx.fill();

    // Red dashed line: Raw unrepaired yield
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 4; i++) {
      const x = getX(i);
      const y = getY(rawYields[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Cyan solid line: Repaired yield
    ctx.beginPath();
    ctx.strokeStyle = '#0891b2';
    ctx.lineWidth = 2.6;
    for (let i = 0; i < 4; i++) {
      const x = getX(i);
      const y = getY(repYields[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Points（先畫完圓點，差值標籤再避開圓點、兩條線與彼此）
    const obstacles = [
      ...polylineObstacles(layerPoints.map((_, i) => [getX(i), getY(rawYields[i])]), 2),
      ...polylineObstacles(layerPoints.map((_, i) => [getX(i), getY(repYields[i])]), 2)
    ];
    for (let i = 0; i < 4; i++) {
      const x = getX(i);
      const yRaw = getY(rawYields[i]);
      const yRep = getY(repYields[i]);

      // Dots
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(x, yRaw, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0891b2';
      ctx.beginPath();
      ctx.arc(x, yRep, 5, 0, Math.PI * 2);
      ctx.fill();
      obstacles.push({ l: x - 6, r: x + 6, t: yRaw - 6, b: yRaw + 6 }, { l: x - 7, r: x + 7, t: yRep - 7, b: yRep + 7 });
    }

    // X labels（夾在畫布內，相鄰重疊時錯列）
    ctx.font = `700 ${narrow ? 10 : 11}px "IBM Plex Mono", monospace`;
    ctx.fillStyle = '#334155';
    drawCanvasTickLabels(ctx, layerPoints.map((layers, i) => ({ text: `${layers}-Hi`, x: getX(i) })), height - padBottom + 18, 12, 2, width - 2);

    // Delta label：原位置（兩點中間）會壓到圓點或線時，依序改放右側、左側、紅點下方、藍點上方。
    ctx.font = `600 ${textPx}px "IBM Plex Mono", monospace`;
    ctx.fillStyle = '#047857';
    const deltaBounds = { l: padLeft - 2, r: width - 2, t: headerBottom, b: padTop + plotH - 2 };
    for (let i = 0; i < 4; i++) {
      const x = getX(i);
      const yRaw = getY(rawYields[i]);
      const yRep = getY(repYields[i]);
      const mid = (yRaw + yRep) / 2 + 3;
      const text = `+${(repYields[i] - rawYields[i]).toFixed(1)}%`;
      const between = [
        { x, y: mid, align: 'center' },
        { x: x + 9, y: mid, align: 'left' },
        { x: x - 9, y: mid, align: 'right' }
      ];
      // 手機寬度相鄰點只隔約 30px，優先放在紅點正下方（各點高度不同，自然錯開）。
      const belowRaw = [
        { x, y: yRaw + 16, align: 'center' },
        { x: x - 2, y: yRaw + 16, align: 'left' },
        { x: x + 4, y: yRaw + 16, align: 'right' }
      ];
      const aboveRep = [
        { x, y: yRep - 10, align: 'center' },
        { x: x - 2, y: yRep - 10, align: 'left' },
        { x: x + 4, y: yRep - 10, align: 'right' }
      ];
      const spot = pickLabelSpot(ctx, text, [
        ...(narrow ? [...belowRaw, ...between] : [...between, ...belowRaw]),
        ...aboveRep
      ], obstacles, deltaBounds);
      ctx.textAlign = spot.align;
      ctx.fillText(text, spot.x, spot.y);
      obstacles.push(spot.rect);
    }

  } else {
    // Mode 2: Probe Card Market Procurement Shift & Exposure
    // Mode 2: High-Density Wafer Sort Capability & Parallel Test Index
    const currentCardId = metrics.probeCard ? metrics.probeCard.id : 'mpi_taiwan';

    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'right';
    ctx.fillText('100', padLeft - 8, padTop + 4);
    ctx.fillText('75', padLeft - 8, padTop + plotH * 0.25 + 4);
    ctx.fillText('50', padLeft - 8, padTop + plotH * 0.50 + 4);
    ctx.fillText('25', padLeft - 8, padTop + plotH * 0.75 + 4);
    ctx.fillText('0', padLeft - 8, padTop + plotH + 4);

    const barW = Math.min(48, plotW / 6);
    const barRects = archKeys.map((key, idx) => {
      const card = PROBE_CARD_ARCHITECTURES[key];
      const barH = card ? (Math.round(card.foundryExposureFactor * 100) / 100.0) * plotH : 0;
      const x = padLeft + slotW * idx + (slotW - barW) / 2;
      return { l: x, r: x + barW, t: padTop + plotH - barH, b: padTop + plotH };
    });
    const scoreObstacles = [...barRects];
    const scoreJobs = [];
    archKeys.forEach((key, idx) => {
      const card = PROBE_CARD_ARCHITECTURES[key];
      if (!card) return;
      const isSelected = card.id === currentCardId;
      const score = Math.round(card.foundryExposureFactor * 100);

      const x = padLeft + slotW * idx + (slotW - barW) / 2;
      const barH = (score / 100.0) * plotH;
      const y = padTop + plotH - barH;

      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      if (card.type === 'memory_legacy') {
        grad.addColorStop(0, '#64748b');
        grad.addColorStop(1, '#334155');
      } else if (key === 'mpi_taiwan') {
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(1, '#0369a1');
      } else if (key === 'chpt_taiwan') {
        grad.addColorStop(0, '#4f46e5');
        grad.addColorStop(1, '#4338ca');
      } else if (key === 'technoprobe') {
        grad.addColorStop(0, '#d97706');
        grad.addColorStop(1, '#b45309');
      } else {
        grad.addColorStop(0, '#9333ea');
        grad.addColorStop(1, '#7e22ce');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);
      ctx.strokeStyle = isSelected ? '#d97706' : 'rgba(15,23,42,0.2)';
      ctx.lineWidth = isSelected ? 2.5 : 1;
      ctx.strokeRect(x, y, barW, barH);

      // Score label on top of bar：等全部長條畫完再由高到低放置，見下方。
      scoreJobs.push({
        text: isSelected ? `★ ${score}` : `${score}`,
        font: isSelected ? `700 ${narrow ? 9.5 : 11}px "IBM Plex Mono", monospace` : `600 ${narrow ? 9 : 10.5}px "IBM Plex Mono", monospace`,
        color: isSelected ? '#b45309' : '#0f172a',
        x,
        y
      });

      // Technical short label below
      const { name, cost } = barLabels[idx];
      ctx.font = barLabelFont;
      ctx.fillStyle = isSelected ? '#0369a1' : '#475569';
      if (rotateBarLabels) {
        ctx.save();
        ctx.translate(x + barW / 2 + 3, padTop + plotH + 10);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'right';
        ctx.fillText(`${name} ${cost}`, 0, 0);
        ctx.restore();
      } else {
        ctx.textAlign = 'center';
        ctx.fillText(name, x + barW / 2, height - padBottom + 16);
        ctx.fillText(cost, x + barW / 2, height - padBottom + 28);
      }
    });

    // 分數標籤由最高的長條先放；與相鄰分數或長條重疊時改靠右緣、靠左緣或逐級上移。
    scoreJobs.sort((a, b) => a.y - b.y).forEach(job => {
      ctx.font = job.font;
      ctx.fillStyle = job.color;
      const spot = pickLabelSpot(ctx, job.text, [
        { x: job.x + barW / 2, y: job.y - 6, align: 'center' },
        { x: job.x + barW, y: job.y - 6, align: 'right' },
        { x: job.x, y: job.y - 6, align: 'left' },
        { x: job.x + barW / 2, y: job.y - 17, align: 'center' },
        { x: job.x + barW / 2, y: job.y - 28, align: 'center' }
      ], scoreObstacles, { l: padLeft - 4, r: width - 2, t: headerBottom, b: padTop + plotH });
      ctx.textAlign = spot.align;
      ctx.fillText(job.text, spot.x, spot.y);
      scoreObstacles.push(spot.rect);
    });
  }

  ctx.textAlign = 'left';
  ctx.font = headerFont;
  header.placed.forEach(entry => {
    ctx.fillStyle = entry.color;
    ctx.fillText(entry.text, entry.x, entry.y);
  });

  ctx.restore();
}

/**
 * Initialize HBM4 Logic Base Die Repair & Probe Card Simulator DOM bindings
 * @param {string} rootSelector
 */
export function initHbm4ProbeSimulator(rootSelector = '#hbm4-repair-probe-simulator-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const presetSelect = root.querySelector('#hbm4-preset-select');
  const probeSelect = root.querySelector('#hbm4-probe-select');
  const coreYieldSlider = root.querySelector('#hbm4-core-yield-slider');
  const layerSlider = root.querySelector('#hbm4-layer-slider');
  const pinSlider = root.querySelector('#hbm4-pin-slider');

  const coreYieldVal = root.querySelector('#hbm4-core-yield-val');
  const layerVal = root.querySelector('#hbm4-layer-val');
  const pinVal = root.querySelector('#hbm4-pin-val');

  const outRawYield = root.querySelector('#hbm4-out-raw-yield');
  const outRepYield = root.querySelector('#hbm4-out-rep-yield');
  const outValueRecovery = root.querySelector('#hbm4-out-value-recovery');
  const outExposure = root.querySelector('#hbm4-out-exposure');
  const outRating = root.querySelector('#hbm4-out-rating');
  const outVerdict = root.querySelector('#hbm4-out-verdict');

  const canvas = root.querySelector('#hbm4-probe-canvas');
  const modeYieldBtn = root.querySelector('#hbm4-mode-yield');
  const modeProbeBtn = root.querySelector('#hbm4-mode-probe');

  let currentMode = 'compound_yield_curve';

  function update() {
    const isZh = document.documentElement.lang.startsWith('zh');
    const presetId = presetSelect ? presetSelect.value : 'sk_hynix_tsmc_12nm_16hi';
    const probeCardId = probeSelect ? probeSelect.value : 'mpi_taiwan';
    const coreDieYield = coreYieldSlider ? parseFloat(coreYieldSlider.value) / 100.0 : 0.955;
    const stackLayers = layerSlider ? parseInt(layerSlider.value, 10) : 16;
    const pinCount = pinSlider ? parseInt(pinSlider.value, 10) : 8192;

    if (presetSelect) {
      Array.from(presetSelect.options).forEach(opt => {
        const item = HBM4_SYSTEM_PRESETS[opt.value];
        if (item) opt.textContent = isZh ? item.nameZh : item.nameEn;
      });
    }
    if (probeSelect) {
      Array.from(probeSelect.options).forEach(opt => {
        const item = PROBE_CARD_ARCHITECTURES[opt.value];
        if (item) opt.textContent = isZh ? item.nameZh : item.nameEn;
      });
    }

    if (coreYieldVal) coreYieldVal.textContent = `${(coreDieYield * 100).toFixed(1)}%`;
    if (layerVal) layerVal.textContent = `${stackLayers}-Hi`;
    if (pinVal) pinVal.textContent = `${pinCount.toLocaleString()} pins`;

    if (coreYieldSlider) coreYieldSlider.setAttribute('aria-valuetext', `${(coreDieYield * 100).toFixed(1)}%`);
    if (layerSlider) layerSlider.setAttribute('aria-valuetext', `${stackLayers} layers`);
    if (pinSlider) pinSlider.setAttribute('aria-valuetext', `${pinCount} pins`);

    const metrics = calculateHbm4ProbeMetrics({
      presetId,
      probeCardId,
      coreDieYield,
      stackLayers,
      pinCount
    });

    if (outRawYield) outRawYield.textContent = `${metrics.rawStackYield.toFixed(1)} %`;
    if (outRepYield) outRepYield.textContent = `${metrics.repairedStackYield.toFixed(1)} % (+${metrics.yieldDeltaPercent.toFixed(1)}%)`;
    if (outValueRecovery) outValueRecovery.textContent = `$${metrics.valueRecoveryPerHbm.toFixed(1)} USD`;
    if (outExposure) outExposure.textContent = `${metrics.hbmExposureIndex.toFixed(0)} %`;

    if (outRating) {
      outRating.textContent = metrics.systemRating;
      outRating.style.color = metrics.ratingColor;
    }

    if (outVerdict) {
      outVerdict.textContent = isZh ? metrics.verdictZh : metrics.verdictEn;
    }

    if (canvas) {
      drawHbm4ProbeCanvas(canvas, metrics, currentMode);
    }
  }

  // Handle Preset change
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      const preset = HBM4_SYSTEM_PRESETS[presetSelect.value];
      if (preset) {
        if (layerSlider) layerSlider.value = preset.defaultStackLayers;
        if (coreYieldSlider) coreYieldSlider.value = (preset.defaultCoreDieYield * 100).toFixed(1);
        if (pinSlider) pinSlider.value = preset.defaultPinCount;
        if (probeSelect) probeSelect.value = preset.probeCardVendor;
      }
      update();
    });
  }

  if (probeSelect) probeSelect.addEventListener('change', update);
  if (coreYieldSlider) coreYieldSlider.addEventListener('input', update);
  if (layerSlider) layerSlider.addEventListener('input', update);
  if (pinSlider) pinSlider.addEventListener('input', update);

  if (modeYieldBtn && modeProbeBtn) {
    modeYieldBtn.addEventListener('click', () => {
      currentMode = 'compound_yield_curve';
      modeYieldBtn.classList.add('active');
      modeYieldBtn.setAttribute('aria-pressed', 'true');
      modeProbeBtn.classList.remove('active');
      modeProbeBtn.setAttribute('aria-pressed', 'false');
      modeYieldBtn.style.background = '#0284c7';
      modeYieldBtn.style.borderColor = '#38bdf8';
      modeYieldBtn.style.color = '#ffffff';
      modeProbeBtn.style.background = '#ffffff';
      modeProbeBtn.style.borderColor = '#cbd5e1';
      modeProbeBtn.style.color = '#334155';
      update();
    });

    modeProbeBtn.addEventListener('click', () => {
      currentMode = 'probe_card_capex_economics';
      modeProbeBtn.classList.add('active');
      modeProbeBtn.setAttribute('aria-pressed', 'true');
      modeYieldBtn.classList.remove('active');
      modeYieldBtn.setAttribute('aria-pressed', 'false');
      modeProbeBtn.style.background = '#0284c7';
      modeProbeBtn.style.borderColor = '#38bdf8';
      modeProbeBtn.style.color = '#ffffff';
      modeYieldBtn.style.background = '#ffffff';
      modeYieldBtn.style.borderColor = '#cbd5e1';
      modeYieldBtn.style.color = '#334155';
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
    document.addEventListener('DOMContentLoaded', () => initHbm4ProbeSimulator());
  } else {
    initHbm4ProbeSimulator();
  }
}
