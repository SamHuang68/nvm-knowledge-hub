/**
 * @fileoverview IP Architect Macro Overhead & Cell Dilution Calculator.
 * Models bit-cell area versus macro peripheral overhead across NVM technologies
 * and process nodes, calculating peripheral dilution ratio and silicon area crossover.
 * @module ip-architect-macro-overhead-calculator
 */

'use strict';

/**
 * Technology base configurations for macro modeling.
 * @typedef {Object} TechMacroProfile
 * @property {string} name - Technology display name.
 * @property {number} cellF2 - Cell area in units of F^2.
 * @property {number} pumpOverheadMm2 - Baseline charge pump & high-voltage area in mm^2 (at 28nm).
 * @property {number} basePeripMm2 - Baseline decoders & sense amps area in mm^2 (at 28nm).
 * @property {number} maskAdders - Typical foundry mask adder count.
 * @property {boolean} zeroMask - Whether technology is 100% logic compatible.
 */

/**
 * Technology macro configuration registry.
 * @type {Record<string, TechMacroProfile>}
 */
export const TECH_MACRO_PROFILES = Object.freeze({
  antifuse: Object.freeze({
    name: 'Logic AntiFuse OTP',
    cellF2: 70,
    pumpOverheadMm2: 0.008,
    basePeripMm2: 0.005,
    maskAdders: 0,
    zeroMask: true
  }),
  efuse: Object.freeze({
    name: 'Foundry eFuse',
    cellF2: 250,
    pumpOverheadMm2: 0.002,
    basePeripMm2: 0.004,
    maskAdders: 0,
    zeroMask: true
  }),
  fgotp: Object.freeze({
    name: 'Logic FG-OTP',
    cellF2: 95,
    pumpOverheadMm2: 0.012,
    basePeripMm2: 0.006,
    maskAdders: 0,
    zeroMask: true
  }),
  ldmtp: Object.freeze({
    name: 'Logic LD-MTP',
    cellF2: 120,
    pumpOverheadMm2: 0.015,
    basePeripMm2: 0.008,
    maskAdders: 0,
    zeroMask: true
  }),
  sst: Object.freeze({
    name: 'Split-Gate eFlash (SST)',
    cellF2: 20,
    pumpOverheadMm2: 0.045,
    basePeripMm2: 0.018,
    maskAdders: 10,
    zeroMask: false
  }),
  mram: Object.freeze({
    name: 'Embedded STT-MRAM',
    cellF2: 35,
    pumpOverheadMm2: 0.010,
    basePeripMm2: 0.022,
    maskAdders: 4,
    zeroMask: false
  }),
  reram: Object.freeze({
    name: 'Embedded OxRAM (ReRAM)',
    cellF2: 25,
    pumpOverheadMm2: 0.014,
    basePeripMm2: 0.016,
    maskAdders: 3,
    zeroMask: false
  })
});

/**
 * Node feature sizes (F in nanometers).
 * @type {Record<string, number>}
 */
export const NODE_FEATURE_SIZES = Object.freeze({
  '28nm': 28,
  '22nm': 22,
  '16nm': 16,
  '7nm': 7,
  '3nm': 3,
  '2nm': 2
});

/**
 * Calculates macro area metrics and peripheral dilution.
 *
 * @param {Object} [params={}] - Calculation parameters.
 * @param {string} [params.tech='antifuse'] - Technology key.
 * @param {string} [params.node='28nm'] - Process node key.
 * @param {number} [params.capacityKb=64] - Memory capacity in Kilobits.
 * @returns {Object} Calculated architectural metrics.
 */
export function calculateMacroOverhead(params = {}) {
  const safeParams = (typeof params === 'object' && params !== null) ? params : {};
  const techKey = typeof safeParams.tech === 'string' && TECH_MACRO_PROFILES[safeParams.tech]
    ? safeParams.tech
    : 'antifuse';
  const nodeKey = typeof safeParams.node === 'string' && NODE_FEATURE_SIZES[safeParams.node]
    ? safeParams.node
    : '28nm';
  
  let rawKb = safeParams.capacityKb !== undefined ? Number(safeParams.capacityKb) : 64;
  if (!Number.isFinite(rawKb)) {
    rawKb = 64;
  }
  const capacityKb = Math.min(Math.max(rawKb, 1), 65536); // 1Kb to 64Mb

  const profile = TECH_MACRO_PROFILES[techKey];
  const fNm = NODE_FEATURE_SIZES[nodeKey];
  const fUm = fNm / 1000; // in micrometers

  // Scaling factor relative to 28nm
  const scalingFactor = Math.pow(fNm / 28, 1.6); // Slightly sub-quadratic scaling for peripherals

  // 1. Bit-cell array area (mm^2)
  const totalBits = capacityKb * 1024;
  const singleCellAreaUm2 = profile.cellF2 * Math.pow(fUm, 2);
  const arrayAreaUm2 = totalBits * singleCellAreaUm2;
  const arrayAreaMm2 = arrayAreaUm2 / 1e6;

  // 2. Peripheral overhead (mm^2)
  // Scale pumps and decoders by technology node
  const scaledPumpMm2 = profile.pumpOverheadMm2 * (profile.zeroMask ? scalingFactor : Math.max(scalingFactor, 0.35));
  const scaledDecodersMm2 = profile.basePeripMm2 * Math.pow(Math.log2(Math.max(capacityKb, 4)) / 6, 0.7) * scalingFactor;
  const peripheralAreaMm2 = scaledPumpMm2 + scaledDecodersMm2;

  // 3. Total macro footprint
  const macroAreaMm2 = arrayAreaMm2 + peripheralAreaMm2;

  // 4. Peripheral dilution ratio (overhead fraction of total area)
  const dilutionRatio = macroAreaMm2 > 0 ? peripheralAreaMm2 / macroAreaMm2 : 0;
  const dilutionPercent = (dilutionRatio * 100).toFixed(1);

  // 5. Compare against eFlash baseline (at 28nm)
  let crossoverVerdictZh = '';
  let crossoverVerdictEn = '';

  if (profile.zeroMask) {
    if (capacityKb <= 256) {
      crossoverVerdictZh = '極度優勢：小容量下 0-Mask 省去龐大高壓幫浦與光罩費，總成本與面積全面碾壓 eFlash。';
      crossoverVerdictEn = 'Dominant: At &le;256Kb, zero-mask eliminates massive charge pump & mask fees, vastly outperforming eFlash.';
    } else if (capacityKb <= 1024) {
      crossoverVerdictZh = '合理平衡：巨集面積周邊稀釋率降至 40% 左右，仍享零光罩晶圓成本優勢。';
      crossoverVerdictEn = 'Balanced: Peripheral dilution drops to ~40%, retaining zero-mask wafer economics.';
    } else {
      crossoverVerdictZh = '密度受限：大於 2Mb 時，較大之單元 F² 開始推高晶粒面積，建議評估 eFlash 或 MRAM。';
      crossoverVerdictEn = 'Density Bound: Above 2Mb, larger cell F² elevates total die area; evaluate eFlash or MRAM.';
    }
  } else {
    if (capacityKb <= 256) {
      crossoverVerdictZh = '不具效益：小容量下高達 70%+ 面積為周邊幫浦所佔據，加上 8~12 道額外光罩極不划算。';
      crossoverVerdictEn = 'Inefficient: Under 256Kb, 70%+ of footprint is consumed by peripherals; 8~12 extra masks are uneconomic.';
    } else {
      crossoverVerdictZh = '密度甜區：大容量（>4Mb）下微小單元 F² 顯現威力，陣列佔比主導晶片經濟性。';
      crossoverVerdictEn = 'Sweet Spot: At &gt;4Mb, ultra-compact cell F² dominates, realizing superior array density.';
    }
  }

  return {
    tech: techKey,
    techName: profile.name,
    node: nodeKey,
    capacityKb,
    singleCellAreaUm2: Number(singleCellAreaUm2.toExponential(4)),
    arrayAreaMm2: Number(arrayAreaMm2.toFixed(5)),
    peripheralAreaMm2: Number(peripheralAreaMm2.toFixed(5)),
    macroAreaMm2: Number(macroAreaMm2.toFixed(5)),
    dilutionRatio: Number(dilutionRatio.toFixed(4)),
    dilutionPercent: Number(dilutionPercent),
    maskAdders: profile.maskAdders,
    zeroMask: profile.zeroMask,
    crossoverVerdictZh,
    crossoverVerdictEn
  };
}
