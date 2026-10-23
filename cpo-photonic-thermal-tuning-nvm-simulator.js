/**
 * @fileoverview Co-Packaged Optics (CPO) Silicon Photonics Thermal-Optic Drift & NVM Trimming Simulator.
 * Computes micro-ring resonator (MRR) wavelength thermo-optic drift, NVM multi-channel DAC lookup table (LUT)
 * precision, micro-heater thermal tuning power dissipation, and optical eye-diagram Q-factor penalty.
 * @module cpo-photonic-thermal-tuning-nvm-simulator
 */

'use strict';

/**
 * Silicon photonics platform presets for CPO transceivers.
 * @type {Record<string, { nameZh: string, nameEn: string, thermoOpticCoeffNmPerC: number, tuningEffNmPerMw: number, channelSpacingNm: number, laserWavelengthNm: number }>}
 */
export const CPO_PHOTONIC_PRESETS = Object.freeze({
  dwdm_o_band: Object.freeze({
    nameZh: 'O-Band 高密度波分多工 (1310nm 8-Lane DWDM)',
    nameEn: 'O-Band Dense WDM Co-Packaged Optics (1310nm 8-Lane DWDM)',
    thermoOpticCoeffNmPerC: 0.082,
    tuningEffNmPerMw: 0.28,
    channelSpacingNm: 0.80, // ~100 GHz
    laserWavelengthNm: 1310.0
  }),
  cwdm_c_band: Object.freeze({
    nameZh: 'C-Band 長距波分多工 (1550nm 4-Lane CWDM)',
    nameEn: 'C-Band Coarse WDM Interconnect (1550nm 4-Lane CWDM)',
    thermoOpticCoeffNmPerC: 0.096,
    tuningEffNmPerMw: 0.22,
    channelSpacingNm: 1.60, // ~200 GHz
    laserWavelengthNm: 1550.0
  }),
  ultra_compact_mrr: Object.freeze({
    nameZh: '超微型矽光微環矩陣 (Ultra-Compact Resonator with TiN Heaters)',
    nameEn: 'Ultra-Compact Silicon Micro-Ring Resonator Array with Embedded TiN Heaters',
    thermoOpticCoeffNmPerC: 0.075,
    tuningEffNmPerMw: 0.35,
    channelSpacingNm: 0.40, // ~50 GHz ultra-dense
    laserWavelengthNm: 1310.0
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
 * Calculates Co-Packaged Optics (CPO) thermo-optic drift, NVM trim table accuracy, and power consumption.
 * 
 * @param {Object} [params={}]
 * @param {string} [params.cpoType='dwdm_o_band'] - Photonic platform key.
 * @param {number} [params.temperatureDeltaC=35.0] - Junction temperature variation from calibration point (-40 to +85 °C).
 * @param {number} [params.dacResolutionBits=10] - NVM Trim DAC resolution bits (8, 10, or 12 bits).
 * @param {number} [params.channelCount=8] - Number of parallel optical WDM channels (4 to 32).
 * @returns {{
 *   valid: boolean,
 *   cpoKey: string,
 *   temperatureDeltaC: number,
 *   dacResolutionBits: number,
 *   channelCount: number,
 *   rawWavelengthDriftNm: number,
 *   tuningPowerPerChannelMw: number,
 *   totalModuleTuningPowerMw: number,
 *   residualWavelengthErrorPm: number,
 *   opticalCrossTalkDb: number,
 *   eyeQFactorPenaltyDb: number,
 *   summaryZh: string,
 *   summaryEn: string
 * }}
 */
export function calculateCpoPhotonicTuning(params = {}) {
  const safeParams = (typeof params === 'object' && params !== null) ? params : {};
  const cpoKey = (typeof safeParams.cpoType === 'string' && safeParams.cpoType in CPO_PHOTONIC_PRESETS)
    ? safeParams.cpoType
    : 'dwdm_o_band';
  const platform = CPO_PHOTONIC_PRESETS[cpoKey];

  const tempDeltaC = clamp(safeParams.temperatureDeltaC, -50.0, 85.0, 35.0);
  const dacBits = Math.floor(clamp(safeParams.dacResolutionBits, 8, 12, 10));
  const channelCount = Math.floor(clamp(safeParams.channelCount, 4, 32, 8));

  // 1. Raw Thermo-Optic Wavelength Drift Delta_lambda (nm)
  // Delta_lambda = (dlambda/dT) * Delta_T
  const absTempDelta = Math.abs(tempDeltaC);
  const rawDriftNm = platform.thermoOpticCoeffNmPerC * absTempDelta;

  // 2. Micro-heater Thermal Tuning Power per Channel (mW)
  // Required thermal shift to restore alignment: P_heater = Delta_lambda / eta_tuning
  const powerPerChannelMw = rawDriftNm / platform.tuningEffNmPerMw;
  const totalModulePowerMw = powerPerChannelMw * channelCount;

  // 3. NVM DAC Quantization & Residual Wavelength Error in picometers (pm)
  // Full scale DAC tuning range ~ 1.5 * channelSpacingNm
  const fullScaleNm = platform.channelSpacingNm * 1.5;
  const dacSteps = Math.pow(2, dacBits);
  const dacLsbNm = fullScaleNm / dacSteps;
  const residualErrorPm = (dacLsbNm / 2.0) * 1000.0; // half LSB error in pm

  // 4. Optical Crosstalk Degradation (dB)
  // Spectral Lorentzian profile: Crosstalk = -10 * log10( 1 + 4 * (spacing / FWHM)^2 )
  // With residual error:
  const baselineCrosstalkDb = -32.0;
  const errorPenaltyDb = (residualErrorPm / 50.0) * 2.2;
  const opticalCrossTalkDb = baselineCrosstalkDb + errorPenaltyDb;

  // 5. Optical Eye Q-Factor Penalty (dB)
  const qFactorPenaltyDb = 0.15 + (residualErrorPm / 100.0) * 0.45;

  const summaryZh = `${platform.nameZh}（溫差 ΔT = ${tempDeltaC.toFixed(1)}°C）：熱光波長漂移達 ${rawDriftNm.toFixed(3)} nm。經由 NVM ${dacBits}-bit LUT 校準微調，各通道微加熱器功耗 ${powerPerChannelMw.toFixed(1)} mW（模組總補償功耗 ${totalModulePowerMw.toFixed(0)} mW），殘餘對準誤差僅 ${residualErrorPm.toFixed(1)} pm，相鄰光通道串擾為 ${opticalCrossTalkDb.toFixed(1)} dB（眼圖 Q-Factor 懲罰 ${qFactorPenaltyDb.toFixed(2)} dB）。`;
  const summaryEn = `${platform.nameEn} (ΔT = ${tempDeltaC.toFixed(1)}°C): Raw thermo-optic drift reaches ${rawDriftNm.toFixed(3)} nm. Governed by embedded NVM ${dacBits}-bit LUT trimming, micro-heater power is ${powerPerChannelMw.toFixed(1)} mW/channel (${totalModulePowerMw.toFixed(0)} mW total module), achieving ultra-fine residual error of ${residualErrorPm.toFixed(1)} pm, optical crosstalk of ${opticalCrossTalkDb.toFixed(1)} dB (Q-factor penalty = ${qFactorPenaltyDb.toFixed(2)} dB).`;

  return Object.freeze({
    valid: true,
    cpoKey,
    temperatureDeltaC: tempDeltaC,
    dacResolutionBits: dacBits,
    channelCount,
    rawWavelengthDriftNm: Number(rawDriftNm.toFixed(4)),
    tuningPowerPerChannelMw: Number(powerPerChannelMw.toFixed(2)),
    totalModuleTuningPowerMw: Number(totalModulePowerMw.toFixed(1)),
    residualWavelengthErrorPm: Number(residualErrorPm.toFixed(2)),
    opticalCrossTalkDb: Number(opticalCrossTalkDb.toFixed(2)),
    eyeQFactorPenaltyDb: Number(qFactorPenaltyDb.toFixed(3)),
    summaryZh,
    summaryEn
  });
}
