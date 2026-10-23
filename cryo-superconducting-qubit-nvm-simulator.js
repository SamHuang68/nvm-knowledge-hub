/**
 * @fileoverview Cryogenic Superconducting Quantum Qubit NVM & Deep-Space Radiation Simulator.
 * Computes Ferromagnetic Josephson Junction (FJJ) critical current, phase shift energy (sub-aJ/bit),
 * quantum non-demolition readout backaction, and heavy-ion SEE/SEU orbital cross-sections.
 * @module cryo-superconducting-qubit-nvm-simulator
 */

'use strict';

/**
 * Superconducting material technology presets for Cryo-Qubit storage.
 * @type {Record<string, { nameZh: string, nameEn: string, tcKelvin: number, ic0MicroAmp: number, fjjBarrier: string, letThreshMev: number }>}
 */
export const CRYO_SUPERCONDUCTING_PRESETS = Object.freeze({
  nb_alox_fjj: Object.freeze({
    nameZh: '鈮基鐵磁約瑟夫森接面 (Nb/AlOx/PdNi/Nb FJJ)',
    nameEn: 'Niobium-based Ferromagnetic Josephson Junction (Nb/AlOx/PdNi/Nb)',
    tcKelvin: 9.2,
    ic0MicroAmp: 45.0,
    fjjBarrier: 'PdNi (Ferromagnetic)',
    letThreshMev: 28.5
  }),
  nbn_magnetic_spin: Object.freeze({
    nameZh: '氮化鈮高溫超導自旋閥 (NbN/GdN/NbN Spin-Valve)',
    nameEn: 'Niobium Nitride Spin-Valve (NbN/GdN/NbN Superconducting Valve)',
    tcKelvin: 16.0,
    ic0MicroAmp: 85.0,
    fjjBarrier: 'GdN (Insulating Ferromagnet)',
    letThreshMev: 42.0
  }),
  al_transmon_coupled: Object.freeze({
    nameZh: '超導透射子微波諧振耦合 (Al/AlOx Transmon Coupled Memory)',
    nameEn: 'Aluminum Transmon Coupled Microwave Cavity Memory',
    tcKelvin: 1.2,
    ic0MicroAmp: 12.0,
    fjjBarrier: 'AlOx (Tunnel Barrier)',
    letThreshMev: 18.0
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
 * Calculates cryogenic superconducting qubit NVM physics and radiation upset metrics.
 * 
 * @param {Object} [params={}]
 * @param {string} [params.materialType='nb_alox_fjj'] - Superconducting material system key.
 * @param {number} [params.temperatureKelvin=0.020] - Cryogenic operating temperature (0.010K to 4.2K).
 * @param {number} [params.microwaveReadFreqGhz=6.5] - Readout microwave cavity frequency (4.0 to 12.0 GHz).
 * @param {number} [params.ionLetMevCm2PerMg=35.0] - Cosmic ray heavy-ion LET in MeV·cm²/mg (1.0 to 100.0).
 * @param {number} [params.qubitCouplingCapFf=15.0] - Quantum coupling capacitance in fF (1.0 to 50.0).
 * @returns {{
 *   valid: boolean,
 *   materialKey: string,
 *   temperatureKelvin: number,
 *   criticalCurrentMicroAmp: number,
 *   switchingEnergyAttoJoule: number,
 *   readoutBackactionPhotons: number,
 *   microwaveDissipationNw: number,
 *   seuCrossSectionUm2: number,
 *   qndFidelityPercent: number,
 *   summaryZh: string,
 *   summaryEn: string
 * }}
 */
export function calculateCryoSuperconductingNvm(params = {}) {
  const safeParams = (typeof params === 'object' && params !== null) ? params : {};
  const matKey = (typeof safeParams.materialType === 'string' && safeParams.materialType in CRYO_SUPERCONDUCTING_PRESETS)
    ? safeParams.materialType
    : 'nb_alox_fjj';
  const mat = CRYO_SUPERCONDUCTING_PRESETS[matKey];

  const tempK = clamp(safeParams.temperatureKelvin, 0.010, 4.2, 0.020);
  const freqGhz = clamp(safeParams.microwaveReadFreqGhz, 4.0, 12.0, 6.5);
  const letVal = clamp(safeParams.ionLetMevCm2PerMg, 1.0, 100.0, 35.0);
  const cCoupleFf = clamp(safeParams.qubitCouplingCapFf, 1.0, 50.0, 15.0);

  // 1. BCS Temperature-dependent critical current Ic(T)
  // At sub-Kelvin T << Tc, Ic approaches Ic0 with quadratic BCS suppression: Ic0 * (1 - (T/Tc)^2)^0.5
  const tempRatio = Math.min(0.999, tempK / mat.tcKelvin);
  const bcsFactor = Math.sqrt(Math.max(0.001, 1.0 - Math.pow(tempRatio, 2)));
  const icMicroAmp = mat.ic0MicroAmp * bcsFactor;

  // 2. Josephson Switching Energy Ej = (h_bar * Ic) / (2 * e)
  // h_bar / 2e = Phi_0 / 2pi = 3.291e-16 Wb
  // Energy in Joules = (3.291e-16) * (Ic in Amperes)
  // in attoJoules (1 aJ = 1e-18 J)
  const ejAttoJoule = (3.291e-16 * (icMicroAmp * 1e-6)) * 1e18;

  // 3. Microwave Readout Backaction (Residual Cavity Intracavity Photons n_cav)
  // Higher frequency and higher coupling increase measurement backaction noise
  const cavityPhotonNoise = (freqGhz / 6.0) * (cCoupleFf / 15.0) * (0.05 + 0.02 * tempK);
  const qndFidelity = Math.max(90.0, 99.95 - cavityPhotonNoise * 1.8);

  // 4. Microwave Static Heat Dissipation (nW per macro)
  // In dilution refrigerators, cooling capacity at 20mK is typically < 10~20 uW.
  // FJJ dissipation is in the nanoWatt regime (nW).
  const dissipationNw = (icMicroAmp * 0.015) + (freqGhz * 0.08) * (1.0 + tempK);

  // 5. Heavy-Ion Single Event Upset (SEU) Cross-Section (Weibull Model)
  // sigma = sigma_0 * (1 - exp(-((LET - LET_th) / W)^s))
  let seuCrossSection = 0.0;
  if (letVal > mat.letThreshMev) {
    const deltaLet = letVal - mat.letThreshMev;
    const weibullW = 25.0;
    const weibullS = 1.6;
    const sigma0 = 0.045; // um²
    seuCrossSection = sigma0 * (1.0 - Math.exp(-Math.pow(deltaLet / weibullW, weibullS)));
  }

  const summaryZh = `${mat.nameZh}（${tempK.toFixed(3)} K）：臨界電流 $I_c$ 為 ${icMicroAmp.toFixed(1)} µA，單通量量子脈衝寫入能耗僅 ${ejAttoJoule.toFixed(2)} aJ（微波功率耗散 ${dissipationNw.toFixed(2)} nW）。高能重離子 SEU 翻轉截面為 ${seuCrossSection.toFixed(4)} µm²，QND 非破壞讀取保真度達 ${qndFidelity.toFixed(2)}%。`;
  const summaryEn = `${mat.nameEn} at ${tempK.toFixed(3)} K: Critical current $I_c$ = ${icMicroAmp.toFixed(1)} µA, single-flux-quantum write energy = ${ejAttoJoule.toFixed(2)} aJ (dissipating only ${dissipationNw.toFixed(2)} nW). Cosmic heavy-ion SEU cross-section = ${seuCrossSection.toFixed(4)} µm² with QND readout fidelity of ${qndFidelity.toFixed(2)}%.`;

  return Object.freeze({
    valid: true,
    materialKey: matKey,
    temperatureKelvin: tempK,
    criticalCurrentMicroAmp: Number(icMicroAmp.toFixed(2)),
    switchingEnergyAttoJoule: Number(ejAttoJoule.toFixed(3)),
    readoutBackactionPhotons: Number(cavityPhotonNoise.toFixed(4)),
    microwaveDissipationNw: Number(dissipationNw.toFixed(3)),
    seuCrossSectionUm2: Number(seuCrossSection.toFixed(5)),
    qndFidelityPercent: Number(qndFidelity.toFixed(2)),
    summaryZh,
    summaryEn
  });
}
