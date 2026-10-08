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
export function calculateHbm4ProbeMetrics({
  presetId = 'sk_hynix_tsmc_12nm_16hi',
  probeCardId = 'mpi_taiwan',
  coreDieYield = 0.955,
  stackLayers = 16,
  pinCount = 8192
} = {}) {
  const preset = HBM4_SYSTEM_PRESETS[presetId] || HBM4_SYSTEM_PRESETS.sk_hynix_tsmc_12nm_16hi;
  const probeCard = PROBE_CARD_ARCHITECTURES[probeCardId] || PROBE_CARD_ARCHITECTURES.mpi_taiwan;

  // Base die wafer sort yield
  const yBase = preset.baseDieYield;

  // Bonding yield per layer (TCB/MR-MUF/Hybrid)
  const yBondPerLayer = preset.baseDieTech === 'tsmc_3nm' ? 0.998 : 0.996;

  // Raw unrepaired stack compound yield: Y_raw = Y_base * (Y_core)^N * (Y_bond)^N
  const rawCoreStackYield = Math.pow(coreDieYield, stackLayers);
  const rawBondStackYield = Math.pow(yBondPerLayer, stackLayers);
  const rawStackYield = yBase * rawCoreStackYield * rawBondStackYield;

  // Redundancy allocation and post-package repair (hPPR) recovery model
  // Redundancy allocation efficiency: logic base die provides dedicated spare line decoders and independent charge pumps (est. 0.82-0.85);
  // whereas legacy DRAM base die is constrained by peripheral routing and high-voltage supply routing (est. 0.70-0.75).
  const isDramBase = preset.baseDieTech === 'dram_base';
  const repairEfficiency = isDramBase ? 0.72 : (preset.baseDieTech === 'tsmc_3nm' ? 0.86 : 0.82);
  
  // High-temperature packaging thermal budget factor (reflow stability heuristic: AntiFuse metal filament ~0.98, planar polysilicon fuse ~0.92)
  const retentionThermalFactor = isDramBase ? 0.92 : 0.98;

  // Repaired effective core die yield
  const effectiveCoreDieYield = coreDieYield + (1.0 - coreDieYield) * repairEfficiency * retentionThermalFactor;
  const repairedCoreStackYield = Math.pow(effectiveCoreDieYield, stackLayers);
  const repairedStackYield = Math.min(0.96, yBase * repairedCoreStackYield * rawBondStackYield);

  // Absolute yield recovery delta
  const yieldDelta = Math.max(0, repairedStackYield - rawStackYield);
  const yieldDeltaPercent = yieldDelta * 100.0;

  // Typical module cost/ASP for HBM module (4-Hi: $200, 8-Hi: $320, 12-Hi: $420, 16-Hi: $520 USD)
  const hbmModuleAspUsd = 160 + stackLayers * 22.5;
  const valueRecoveryPerHbm = yieldDelta * hbmModuleAspUsd;

  // Probe card economics
  const pinScalingFactor = Math.max(0.2, (pinCount - 2048) / 10000);
  const probeCardAsp = probeCard.baseAspUsd * (1 + pinScalingFactor * 0.70);

  // Wafer sort test time per wafer (seconds): Base scan + 2048-bit PHY trim + TSV BIST
  const testTimePerWaferSec = 140 + (pinCount / 1000.0) * 11.5;

  // Touchdown count required per wafer (lower is faster)
  const touchdownsPerWafer = pinCount >= 8192 ? 1 : (pinCount >= 4096 ? 2 : 4);

  // Logic probe card HBM exposure index (0 - 100)
  const hbmExposureIndex = Math.min(
    100,
    probeCard.foundryExposureFactor * 100 * (0.75 + (pinCount / 8192.0) * 0.25)
  );

  // Rating and dynamic verdict
  let systemRating = 'OPTIMAL';
  let ratingColor = '#10b981'; // green

  if (yieldDeltaPercent < 15.0 && stackLayers >= 12) {
    systemRating = 'SUB-OPTIMAL RECOVERY';
    ratingColor = '#f59e0b';
  } else if (probeCard.type === 'memory_legacy' && pinCount > 4096) {
    systemRating = 'PIN OVERFLOW / HIGH RISK';
    ratingColor = '#ef4444';
  } else if (stackLayers >= 16 && repairedStackYield >= 0.75) {
    systemRating = 'TIER-1 EXCELLENCE';
    ratingColor = '#06b6d4';
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
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const padLeft = 56;
  const padRight = 32;
  const padTop = 32;
  const padBottom = 48;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Grid lines
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
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
    ctx.fillStyle = '#64748b';
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
    ctx.fillStyle = 'rgba(6, 182, 212, 0.14)';
    ctx.fill();

    // Red dashed line: Raw unrepaired yield
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#ef4444';
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
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.6;
    for (let i = 0; i < 4; i++) {
      const x = getX(i);
      const y = getY(repYields[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Points & text
    for (let i = 0; i < 4; i++) {
      const x = getX(i);
      const yRaw = getY(rawYields[i]);
      const yRep = getY(repYields[i]);

      // Dots
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x, yRaw, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(x, yRep, 5, 0, Math.PI * 2);
      ctx.fill();

      // X labels
      ctx.font = '700 11px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.fillText(`${layerPoints[i]}-Hi`, x, height - padBottom + 18);

      // Delta label
      const delta = repYields[i] - rawYields[i];
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`+${delta.toFixed(1)}%`, x, (yRaw + yRep) / 2 + 3);
    }

    // Legend
    ctx.textAlign = 'left';
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('--- 未修復原始良率 (Raw Stack Yield)', padLeft + 10, padTop - 12);
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('— 0-Mask AntiFuse 修復後良率 (Repaired Stack Yield)', padLeft + 230, padTop - 12);

  } else {
    // Mode 2: Probe Card Market Procurement Shift & Exposure
    // Mode 2: High-Density Wafer Sort Capability & Parallel Test Index
    const archKeys = ['micronics_japan', 'mpi_taiwan', 'chpt_taiwan', 'technoprobe', 'formfactor'];
    const currentCardId = metrics.probeCard ? metrics.probeCard.id : 'mpi_taiwan';

    ctx.font = '600 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';
    ctx.fillText('100', padLeft - 8, padTop + 4);
    ctx.fillText('75', padLeft - 8, padTop + plotH * 0.25 + 4);
    ctx.fillText('50', padLeft - 8, padTop + plotH * 0.50 + 4);
    ctx.fillText('25', padLeft - 8, padTop + plotH * 0.75 + 4);
    ctx.fillText('0', padLeft - 8, padTop + plotH + 4);

    const barW = Math.min(48, plotW / 6);
    archKeys.forEach((key, idx) => {
      const card = PROBE_CARD_ARCHITECTURES[key];
      if (!card) return;
      const isSelected = card.id === currentCardId;
      const score = Math.round(card.foundryExposureFactor * 100);

      const x = padLeft + (plotW / 5) * idx + (plotW / 5 - barW) / 2;
      const barH = (score / 100.0) * plotH;
      const y = padTop + plotH - barH;

      const grad = ctx.createLinearGradient(0, y, 0, y + barH);
      if (card.type === 'memory_legacy') {
        grad.addColorStop(0, '#64748b');
        grad.addColorStop(1, '#334155');
      } else if (key === 'mpi_taiwan') {
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(1, '#0284c7');
      } else if (key === 'chpt_taiwan') {
        grad.addColorStop(0, '#818cf8');
        grad.addColorStop(1, '#4f46e5');
      } else if (key === 'technoprobe') {
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(1, '#d97706');
      } else {
        grad.addColorStop(0, '#c084fc');
        grad.addColorStop(1, '#9333ea');
      }

      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);
      ctx.strokeStyle = isSelected ? '#f59e0b' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = isSelected ? 2.5 : 1;
      ctx.strokeRect(x, y, barW, barH);

      // Score label on top of bar
      ctx.font = isSelected ? '700 11px "IBM Plex Mono", monospace' : '600 10.5px "IBM Plex Mono", monospace';
      ctx.fillStyle = isSelected ? '#f59e0b' : '#f8fafc';
      ctx.textAlign = 'center';
      ctx.fillText(isSelected ? `★ ${score}` : `${score}`, x + barW / 2, y - 6);

      // Technical short label below
      const labelMap = {
        micronics_japan: 'Cantilever',
        mpi_taiwan: 'VPC/MEMS',
        chpt_taiwan: 'MLO/MEMS',
        technoprobe: 'MLC/MEMS',
        formfactor: 'Spring/MEMS'
      };
      ctx.font = '600 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = isSelected ? '#38bdf8' : '#94a3b8';
      ctx.fillText(labelMap[key] || key, x + barW / 2, height - padBottom + 16);
      ctx.fillText(`$${(card.baseAspUsd / 1000).toFixed(0)}k`, x + barW / 2, height - padBottom + 28);
    });

    ctx.textAlign = 'left';
    ctx.font = '600 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('■ 高密度晶圓測試探針卡並行能力指數模型 (High-Density Wafer Sort Index)', padLeft + 10, padTop - 12);
  }

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
      modeProbeBtn.style.background = '#1e293b';
      modeProbeBtn.style.borderColor = '#475569';
      modeProbeBtn.style.color = '#94a3b8';
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
      modeYieldBtn.style.background = '#1e293b';
      modeYieldBtn.style.borderColor = '#475569';
      modeYieldBtn.style.color = '#94a3b8';
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
