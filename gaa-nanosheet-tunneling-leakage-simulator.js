/**
 * @fileoverview 2nm GAA Nanosheet Quantum Tunneling & Dielectric Leakage Simulator.
 * Models gate-all-around multi-bridge channel FET (MBCFET) nanosheet geometries,
 * quantum confinement energy shifts, subthreshold leakage, and oxide tunneling limits.
 * @module gaa-nanosheet-tunneling-leakage-simulator
 */

'use strict';

/**
 * Physical constants.
 */
export const H_PLANCK_EV_S = 4.135667696e-15;
export const HBAR_EV_S = H_PLANCK_EV_S / (2 * Math.PI);
export const M_ELECTRON_KG = 9.1093837e-31;
export const Q_ELEC_C = 1.602176634e-19;
export const EPS_0 = 8.8541878128e-14; // F/cm

/**
 * Calculates 2nm GAA nanosheet physical dimensions and tunneling current.
 *
 * @param {Object} [params={}] - Simulation parameters.
 * @param {number} [params.numSheets=3] - Number of stacked nanosheets (2 to 5).
 * @param {number} [params.sheetWidthNm=35] - Nanosheet width in nm (15 to 60).
 * @param {number} [params.sheetThicknessNm=5] - Nanosheet thickness in nm (3 to 8).
 * @param {number} [params.eotNm=0.8] - Equivalent Oxide Thickness in nm (0.6 to 1.5).
 * @param {number} [params.vGate=0.7] - Gate voltage in Volts (0.4 to 1.2).
 * @returns {Object} Calculated GAA quantum and tunneling metrics.
 */
export function calculateGaaTunneling(params = {}) {
  const safeParams = (typeof params === 'object' && params !== null) ? params : {};

  let nSheets = Number(safeParams.numSheets);
  if (!Number.isFinite(nSheets)) nSheets = 3;
  nSheets = Math.min(Math.max(Math.round(nSheets), 2), 5);

  let wNs = Number(safeParams.sheetWidthNm);
  if (!Number.isFinite(wNs)) wNs = 35;
  wNs = Math.min(Math.max(wNs, 15), 60);

  let tNs = Number(safeParams.sheetThicknessNm);
  if (!Number.isFinite(tNs)) tNs = 5;
  tNs = Math.min(Math.max(tNs, 3), 8);

  let eot = Number(safeParams.eotNm);
  if (!Number.isFinite(eot)) eot = 0.8;
  eot = Math.min(Math.max(eot, 0.6), 1.5);

  let vg = Number(safeParams.vGate);
  if (!Number.isFinite(vg)) vg = 0.7;
  vg = Math.min(Math.max(vg, 0.4), 1.2);

  // 1. Effective channel width Weff (all 4 sides of each nanosheet surrounded by gate)
  // Weff = N_sheets * 2 * (W_ns + T_ns)
  const weffPerSheetNm = 2 * (wNs + tNs);
  const totalWeffNm = nSheets * weffPerSheetNm;

  // 2. Quantum confinement energy subband shift (1D box approximation)
  // Delta_E1 = (hbar^2 * pi^2) / (2 * m* * T_ns^2)
  const effMass = 0.26 * M_ELECTRON_KG; // Si conduction band effective mass
  const tNsM = tNs * 1e-9;
  const deltaE1Joules = (Math.pow(1.054571817e-34, 2) * Math.pow(Math.PI, 2)) / (2 * effMass * Math.pow(tNsM, 2));
  const deltaE1Ev = deltaE1Joules / Q_ELEC_C;

  // 3. Direct tunneling through ultra-thin EOT
  // J_direct ~ A * exp(-2 * sqrt(2 * m* * Phi_B) * Tox / hbar)
  const phiB = 3.15; // Si-SiO2 barrier height in eV
  const phiBJoules = phiB * Q_ELEC_C;
  const toxM = eot * 1e-9;
  const decayConst = 2 * Math.sqrt(2 * effMass * phiBJoules) * toxM / 1.054571817e-34;
  const directTunnelingDensityAcm2 = Math.exp(12 - decayConst) * (vg / 0.7);

  // Total leakage current per transistor in picoAmperes (pA)
  const totalGateAreaCm2 = (totalWeffNm * 1e-7) * (15e-7); // assuming 15nm gate length
  const igateTotalPa = Math.max(0.01, directTunnelingDensityAcm2 * totalGateAreaCm2 * 1e12);

  // Subthreshold swing SS (ideal GAA limit ~62 mV/dec at 300K)
  const subthresholdSwingMvDec = 60 + (eot / 0.8) * 3.5 + (tNs / 5) * 2.0;

  return {
    numSheets: nSheets,
    sheetWidthNm: wNs,
    sheetThicknessNm: tNs,
    eotNm: eot,
    vGate: vg,
    weffPerSheetNm,
    totalWeffNm,
    quantumConfinementShiftEv: Number(deltaE1Ev.toFixed(3)),
    directTunnelingDensityAcm2: Number(directTunnelingDensityAcm2.toExponential(3)),
    igateTotalPa: Number(igateTotalPa.toFixed(2)),
    subthresholdSwingMvDec: Number(subthresholdSwingMvDec.toFixed(1))
  };
}

/**
 * Attaches UI event listeners for the GAA simulator in memory-physics.html.
 */
export function initGaaSimulatorUi() {
  const root = document.getElementById('gaa-nanosheet-simulator-root');
  if (!root) return;

  const sheetsInput = /** @type {HTMLInputElement|null} */ (root.querySelector('#gaa-sheets-input'));
  const widthInput = /** @type {HTMLInputElement|null} */ (root.querySelector('#gaa-width-input'));
  const thickInput = /** @type {HTMLInputElement|null} */ (root.querySelector('#gaa-thick-input'));
  const eotInput = /** @type {HTMLInputElement|null} */ (root.querySelector('#gaa-eot-input'));

  const weffOut = root.querySelector('#gaa-weff-out');
  const shiftOut = root.querySelector('#gaa-shift-out');
  const leakageOut = root.querySelector('#gaa-leakage-out');
  const ssOut = root.querySelector('#gaa-ss-out');

  const update = () => {
    const res = calculateGaaTunneling({
      numSheets: sheetsInput ? parseInt(sheetsInput.value, 10) : 3,
      sheetWidthNm: widthInput ? parseInt(widthInput.value, 10) : 35,
      sheetThicknessNm: thickInput ? parseInt(thickInput.value, 10) : 5,
      eotNm: eotInput ? parseFloat(eotInput.value) : 0.8
    });

    if (weffOut) weffOut.textContent = `${res.totalWeffNm} nm`;
    if (shiftOut) shiftOut.textContent = `+${res.quantumConfinementShiftEv} eV`;
    if (leakageOut) leakageOut.textContent = `${res.igateTotalPa} pA`;
    if (ssOut) ssOut.textContent = `${res.subthresholdSwingMvDec} mV/dec`;
  };

  [sheetsInput, widthInput, thickInput, eotInput].forEach(inp => {
    if (inp) inp.addEventListener('input', update);
  });
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGaaSimulatorUi);
  } else {
    initGaaSimulatorUi();
  }
}
