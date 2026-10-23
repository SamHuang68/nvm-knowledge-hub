/**
 * @fileoverview AI Chiplet UCIe 1.1/2.0 & Near-Memory Computing (NMC) Physical Interconnect Simulator.
 * Computes interconnect bandwidth density, transmission latency, eye-diagram jitter,
 * energy-per-bit (pJ/bit), and near-memory compute efficiency for 2.5D/3D heterogeneous NVM chiplets.
 * @module ai-chiplet-ucie-interconnect-simulator
 */

'use strict';

/**
 * Packaging technology presets for UCIe chiplet interconnects.
 * @type {Record<string, { nameZh: string, nameEn: string, maxTraceLenMm: number, bumpPitchUm: number, basePjPerBit: number, baseLatencyNs: number, maxDataRateGbps: number }>}
 */
export const PACKAGING_PRESETS = Object.freeze({
  advanced_cowos: Object.freeze({
    nameZh: '3D/2.5D 先進封裝 (CoWoS / SoIC / InFO-R)',
    nameEn: 'Advanced Packaging (CoWoS / SoIC / InFO-R)',
    maxTraceLenMm: 3.0,
    bumpPitchUm: 25.0,
    basePjPerBit: 0.35,
    baseLatencyNs: 0.8,
    maxDataRateGbps: 32.0
  }),
  standard_substrate: Object.freeze({
    nameZh: '標準有機基板封裝 (Standard Organic Substrate)',
    nameEn: 'Standard Substrate (Organic PCB / MCM)',
    maxTraceLenMm: 25.0,
    bumpPitchUm: 110.0,
    basePjPerBit: 1.85,
    baseLatencyNs: 3.5,
    maxDataRateGbps: 16.0
  }),
  hybrid_bonding_3d: Object.freeze({
    nameZh: '超高密度 Cu-Cu 晶圓級混合鍵合 (Direct Cu-Cu Bonding)',
    nameEn: 'High-Density Cu-Cu Direct 3D Hybrid Bonding',
    maxTraceLenMm: 0.1,
    bumpPitchUm: 4.0,
    basePjPerBit: 0.12,
    baseLatencyNs: 0.3,
    maxDataRateGbps: 64.0
  })
});

/**
 * Clamps a number to a bounded range.
 * @param {number} val 
 * @param {number} min 
 * @param {number} max 
 * @param {number} fallback 
 * @returns {number}
 */
function clamp(val, min, max, fallback) {
  if (typeof val !== 'number' || Number.isNaN(val) || !Number.isFinite(val)) {
    return fallback;
  }
  return Math.min(Math.max(val, min), max);
}

/**
 * Calculates UCIe interconnect metrics and Near-Memory Computing (NMC) energy savings.
 * 
 * @param {Object} [params={}]
 * @param {string} [params.packageType='advanced_cowos'] - Packaging technology key.
 * @param {number} [params.traceLengthMm=2.0] - Physical interconnect trace length (0.01 to 30 mm).
 * @param {number} [params.dataRateGbps=16.0] - Per-lane data rate (2.0 to 64.0 Gbps).
 * @param {number} [params.laneCount=64] - Channel lane count (e.g. 16, 32, 64, 128 lanes).
 * @param {number} [params.traditionalExtPjPerBit=35.0] - Traditional off-chip DRAM transmission energy (pJ/bit).
 * @param {number} [params.macOpsPerTransfer=16] - Arithmetic intensity (MAC operations per transferred parameter).
 * @returns {{
 *   valid: boolean,
 *   packageKey: string,
 *   traceLengthMm: number,
 *   dataRateGbps: number,
 *   laneCount: number,
 *   totalBandwidthGBps: number,
 *   linearBwDensityGBpsPerMm: number,
 *   interconnectEnergyPjPerBit: number,
 *   totalInterconnectPowerMw: number,
 *   transmissionLatencyNs: number,
 *   nmcEnergySavingsRatio: number,
 *   nmcSystemTdpSavedMw: number,
 *   eyeJitterPs: number,
 *   summaryZh: string,
 *   summaryEn: string
 * }}
 */
export function calculateUcieInterconnect(params = {}) {
  const safeParams = (typeof params === 'object' && params !== null) ? params : {};
  const pkgKey = (typeof safeParams.packageType === 'string' && safeParams.packageType in PACKAGING_PRESETS)
    ? safeParams.packageType
    : 'advanced_cowos';
  const pkg = PACKAGING_PRESETS[pkgKey];

  const traceLen = clamp(safeParams.traceLengthMm, 0.05, 30.0, 2.0);
  const dataRate = clamp(safeParams.dataRateGbps, 2.0, pkg.maxDataRateGbps, 16.0);
  const laneCount = Math.floor(clamp(safeParams.laneCount, 8, 256, 64));
  const extEnergy = clamp(safeParams.traditionalExtPjPerBit, 10.0, 80.0, 35.0);
  const macOps = clamp(safeParams.macOpsPerTransfer, 1, 128, 16);

  // 1. Total Raw Bandwidth in GB/s
  // Total bits/sec = laneCount * dataRate * 1e9; in bytes = bits / 8
  const totalBwGBps = (laneCount * dataRate) / 8.0;

  // 2. Linear Shoreline Bandwidth Density (GB/s per mm)
  // Shoreline width in mm = (laneCount * pkg.bumpPitchUm) / 1000
  const shorelineWidthMm = Math.max(0.1, (laneCount * pkg.bumpPitchUm) / 1000.0);
  const linearBwDensity = totalBwGBps / shorelineWidthMm;

  // 3. Energy per bit (pJ/bit)
  // Dynamic capacitive line loss scaling with trace length
  const lineLengthFactor = Math.sqrt(traceLen / Math.max(0.1, pkg.maxTraceLenMm));
  const energyPjPerBit = pkg.basePjPerBit * (0.6 + 0.4 * lineLengthFactor) * (0.8 + 0.2 * (dataRate / 16.0));

  // 4. Total Interconnect Power (mW)
  // Power (mW) = (Bandwidth in bps * Energy in J/bit) * 1000 = (Gbps * pJ/bit)
  const totalPowerMw = (laneCount * dataRate) * energyPjPerBit;

  // 5. Total Latency (ns)
  // Speed of signal on silicon interposer / organic substrate: ~6 to 7 ps/mm
  const propagationDelayNs = traceLen * 0.0068;
  const serializationDelayNs = 1.0 / dataRate; // 1 UI
  const totalLatencyNs = pkg.baseLatencyNs + propagationDelayNs + serializationDelayNs;

  // 6. Eye Jitter (ps)
  const eyeJitterPs = 2.5 + 0.8 * traceLen + 0.05 * dataRate;

  // 7. Near-Memory Computing (NMC) Energy Savings Ratio
  // Ratio comparing off-chip DRAM transfer energy vs on-package UCIe NVM transfer
  const nmcSavingsRatio = extEnergy / Math.max(0.01, energyPjPerBit);
  const extTotalPowerMw = (laneCount * dataRate) * extEnergy;
  const systemTdpSavedMw = Math.max(0, extTotalPowerMw - totalPowerMw);

  const summaryZh = `${pkg.nameZh}：線寬總頻寬達 ${totalBwGBps.toFixed(1)} GB/s，傳輸能耗僅 ${energyPjPerBit.toFixed(2)} pJ/bit（延遲 ${totalLatencyNs.toFixed(2)} ns）。相較傳統離片 DRAM，NMC 架構節省 ${nmcSavingsRatio.toFixed(1)} 倍傳輸功耗（降低 ${systemTdpSavedMw.toFixed(0)} mW 散熱負擔）。`;
  const summaryEn = `${pkg.nameEn}: Aggregate BW reaches ${totalBwGBps.toFixed(1)} GB/s with ultra-low ${energyPjPerBit.toFixed(2)} pJ/bit energy (${totalLatencyNs.toFixed(2)} ns latency). Delivers ${nmcSavingsRatio.toFixed(1)}x transmission energy savings vs discrete DRAM, reducing ${systemTdpSavedMw.toFixed(0)} mW of thermal dissipation.`;

  return Object.freeze({
    valid: true,
    packageKey: pkgKey,
    traceLengthMm: traceLen,
    dataRateGbps: dataRate,
    laneCount,
    totalBandwidthGBps: Number(totalBwGBps.toFixed(2)),
    linearBwDensityGBpsPerMm: Number(linearBwDensity.toFixed(2)),
    interconnectEnergyPjPerBit: Number(energyPjPerBit.toFixed(3)),
    totalInterconnectPowerMw: Number(totalPowerMw.toFixed(2)),
    transmissionLatencyNs: Number(totalLatencyNs.toFixed(3)),
    nmcEnergySavingsRatio: Number(nmcSavingsRatio.toFixed(1)),
    nmcSystemTdpSavedMw: Number(systemTdpSavedMw.toFixed(1)),
    eyeJitterPs: Number(eyeJitterPs.toFixed(2)),
    summaryZh,
    summaryEn
  });
}
