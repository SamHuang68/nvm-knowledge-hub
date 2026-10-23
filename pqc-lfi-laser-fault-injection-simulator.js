/**
 * @fileoverview Post-Quantum Cryptography (PQC) Key Storage & Laser Fault Injection (LFI) Physical Simulator.
 * Computes silicon photoelectric current surge, optical tamper detection thresholds,
 * protective light-shielding efficacy, and active zeroization latency under 1064nm near-IR laser attack.
 * @module pqc-lfi-laser-fault-injection-simulator
 */

'use strict';

/**
 * Storage cell and security shield presets against Laser Fault Injection (LFI).
 * @type {Record<string, { nameZh: string, nameEn: string, baseUpsetEnergyNj: number, photoEfficiency: number, shieldAttenuationDb: number, zeroizationLatencyNs: number }>}
 */
export const LFI_PROTECTION_PRESETS = Object.freeze({
  hardened_antifuse_shield: Object.freeze({
    nameZh: '金屬主動網格加固型 Anti-fuse OTP (Active Mesh Shield)',
    nameEn: 'Hardened Anti-fuse OTP with Active Top-Metal Mesh Shield',
    baseUpsetEnergyNj: 1.25,
    photoEfficiency: 0.12,
    shieldAttenuationDb: 32.0,
    zeroizationLatencyNs: 4.5
  }),
  differential_puf_sensing: Object.freeze({
    nameZh: '差動感測量子穿隧 PUF 密鑰陣列 (Differential Sensing PUF)',
    nameEn: 'Differential Sensing Quantum Tunneling PUF Key Array',
    baseUpsetEnergyNj: 0.95,
    photoEfficiency: 0.18,
    shieldAttenuationDb: 24.0,
    zeroizationLatencyNs: 6.0
  }),
  standard_unshielded_nvm: Object.freeze({
    nameZh: '無金屬屏蔽之傳統浮閘/電荷型 NVM (Standard Unshielded)',
    nameEn: 'Standard Unshielded Floating-Gate / Charge-Trap NVM',
    baseUpsetEnergyNj: 0.08,
    photoEfficiency: 0.75,
    shieldAttenuationDb: 0.0,
    zeroizationLatencyNs: 85.0
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
 * Calculates Laser Fault Injection (LFI) physical upset parameters and active defense response.
 * 
 * @param {Object} [params={}]
 * @param {string} [params.shieldType='hardened_antifuse_shield'] - Shield preset key.
 * @param {number} [params.laserPulseEnergyNj=0.50] - Incident laser pulse energy in nanoJoules (0.01 to 5.00 nJ).
 * @param {number} [params.spotDiameterUm=1.5] - Focused beam spot diameter in µm (0.5 to 10.0 µm).
 * @param {number} [params.pulseDurationPs=400.0] - Laser pulse duration in picoseconds (50 to 5000 ps).
 * @param {number} [params.siliconSubstrateThickUm=100.0] - Backside thinned silicon thickness (10 to 300 µm).
 * @returns {{
 *   valid: boolean,
 *   shieldKey: string,
 *   laserPulseEnergyNj: number,
 *   spotDiameterUm: number,
 *   pulseDurationPs: number,
 *   effectiveIncidentEnergyNj: number,
 *   peakPhotoCurrentMilliAmp: number,
 *   lfiUpsetProbabilityPercent: number,
 *   tamperSensorTriggered: boolean,
 *   activeZeroizationNs: number,
 *   securityMarginDb: number,
 *   summaryZh: string,
 *   summaryEn: string
 * }}
 */
export function calculatePqcLfiResistance(params = {}) {
  const safeParams = (typeof params === 'object' && params !== null) ? params : {};
  const shieldKey = (typeof safeParams.shieldType === 'string' && safeParams.shieldType in LFI_PROTECTION_PRESETS)
    ? safeParams.shieldType
    : 'hardened_antifuse_shield';
  const preset = LFI_PROTECTION_PRESETS[shieldKey];

  const pulseEnergyNj = clamp(safeParams.laserPulseEnergyNj, 0.01, 5.0, 0.50);
  const spotDiaUm = clamp(safeParams.spotDiameterUm, 0.5, 10.0, 1.5);
  const pulseDurPs = clamp(safeParams.pulseDurationPs, 50.0, 5000.0, 400.0);
  const subThickUm = clamp(safeParams.siliconSubstrateThickUm, 10.0, 300.0, 100.0);

  // 1. Silicon 1064nm absorption & Shield attenuation
  // In silicon at 1064nm, absorption coefficient alpha ~ 10 cm^-1 (0.001 um^-1)
  const siliconTransmission = Math.exp(-0.001 * subThickUm);
  // Shield transmission = 10^(-attenuation_dB / 10)
  const shieldTransmission = Math.pow(10, -preset.shieldAttenuationDb / 10.0);
  const effectiveEnergyNj = pulseEnergyNj * siliconTransmission * shieldTransmission;

  // 2. Peak Photoelectric Current Pulse (mA)
  // I_peak ~ (Q_gen / pulse_duration) = (E_effective / (h*nu)) * q * eta / tau
  // At 1064nm, photon energy h*nu = 1.165 eV = 1.866e-19 J
  // 1 nJ = 5.36e9 photons
  const photonsCount = (effectiveEnergyNj * 1e-9) / 1.866e-19;
  const chargeCoulomb = photonsCount * 1.602e-19 * preset.photoEfficiency;
  const peakCurrentMa = (chargeCoulomb / (pulseDurPs * 1e-12)) * 1000.0; // in mA

  // 3. LFI Fault Injection Probability (Sigmoid threshold model)
  // Normalized ratio of effective energy to the cell upset threshold
  const upsetRatio = effectiveEnergyNj / preset.baseUpsetEnergyNj;
  const upsetProb = 100.0 / (1.0 + Math.exp(-12.0 * (upsetRatio - 1.0)));

  // 4. Tamper Detection & Active Key Zeroization
  // Active mesh sensors trigger when photo current exceeds 0.25 mA
  const tamperTriggered = (peakCurrentMa > 0.25 && preset.shieldAttenuationDb > 0.0);
  const zeroizationLatency = tamperTriggered ? preset.zeroizationLatencyNs : preset.zeroizationLatencyNs * 12.0;

  // 5. Security Margin in dB
  const securityMarginDb = 10.0 * Math.log10(Math.max(0.001, preset.baseUpsetEnergyNj / Math.max(1e-6, effectiveEnergyNj)));

  const summaryZh = `${preset.nameZh}（雷射脈衝 ${pulseEnergyNj.toFixed(2)} nJ / ${pulseDurPs.toFixed(0)} ps）：透射等效能量 ${effectiveEnergyNj.toFixed(4)} nJ，光生電流峰值 ${peakCurrentMa.toFixed(2)} mA。金鑰翻轉竄改機率為 ${upsetProb.toFixed(1)}%（安全裕度 ${securityMarginDb.toFixed(1)} dB），防禦感測器觸發狀態：${tamperTriggered ? '已鎖定觸發' : '未觸發'}，主動安全熔斷反應延遲 ${zeroizationLatency.toFixed(1)} ns。`;
  const summaryEn = `${preset.nameEn} (Laser Pulse ${pulseEnergyNj.toFixed(2)} nJ / ${pulseDurPs.toFixed(0)} ps): Effective incident energy = ${effectiveEnergyNj.toFixed(4)} nJ with peak photocurrent = ${peakCurrentMa.toFixed(2)} mA. Bit-flip upset probability = ${upsetProb.toFixed(1)}% (Security margin: ${securityMarginDb.toFixed(1)} dB). Tamper trigger: ${tamperTriggered ? 'ARMED & ACTIVE' : 'QUIESCENT'}, active zeroization latency = ${zeroizationLatency.toFixed(1)} ns.`;

  return Object.freeze({
    valid: true,
    shieldKey,
    laserPulseEnergyNj: pulseEnergyNj,
    spotDiameterUm: spotDiaUm,
    pulseDurationPs: pulseDurPs,
    effectiveIncidentEnergyNj: Number(effectiveEnergyNj.toFixed(5)),
    peakPhotoCurrentMilliAmp: Number(peakCurrentMa.toFixed(3)),
    lfiUpsetProbabilityPercent: Number(upsetProb.toFixed(2)),
    tamperSensorTriggered: tamperTriggered,
    activeZeroizationNs: Number(zeroizationLatency.toFixed(1)),
    securityMarginDb: Number(securityMarginDb.toFixed(2)),
    summaryZh,
    summaryEn
  });
}
