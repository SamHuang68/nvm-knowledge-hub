/**
 * @fileoverview Backside Power Delivery Network (BSPDN) Thermal & Retention Simulator.
 * Models thermal dissipation bottlenecks of buried power rails (BPR) and nano-TSVs (nTSV),
 * calculating local NVM hotspot temperature elevation and Arrhenius retention penalties.
 * @module bspdn-backside-power-thermal-simulator
 */

'use strict';

/**
 * Thermal conductivity of bulk silicon in W/(m*K).
 */
export const K_SILICON_BULK = 148;

/**
 * Thermal conductivity of thin dielectric liner (SiO2) in W/(m*K).
 */
export const K_OXIDE_LINER = 1.3;

/**
 * Calculates BSPDN thermal dissipation and NVM hotspot temperature rise.
 *
 * @param {Object} [params={}] - Simulation parameters.
 * @param {number} [params.diePowerDensityWcm2=120] - Die power density in W/cm^2 (50 to 300).
 * @param {number} [params.substrateThicknessUm=15] - Thinned silicon substrate thickness in micrometers (5 to 40).
 * @param {number} [params.ntsvPitchNm=200] - Nano-TSV pitch in nanometers (100 to 500).
 * @param {number} [params.baseJunctionTempC=105] - Nominal chip baseline junction temperature in Celsius (85 to 150).
 * @returns {Object} Calculated thermal resistance, hotspot elevation, and retention penalty.
 */
export function calculateBspdnThermalImpact(params = {}) {
  const safeParams = (typeof params === 'object' && params !== null) ? params : {};

  let powerDensity = Number(safeParams.diePowerDensityWcm2);
  if (!Number.isFinite(powerDensity)) powerDensity = 120;
  powerDensity = Math.min(Math.max(powerDensity, 50), 300);

  let subThickness = Number(safeParams.substrateThicknessUm);
  if (!Number.isFinite(subThickness)) subThickness = 15;
  subThickness = Math.min(Math.max(subThickness, 5), 40);

  let ntsvPitch = Number(safeParams.ntsvPitchNm);
  if (!Number.isFinite(ntsvPitch)) ntsvPitch = 200;
  ntsvPitch = Math.min(Math.max(ntsvPitch, 100), 500);

  let baseTj = Number(safeParams.baseJunctionTempC);
  if (!Number.isFinite(baseTj)) baseTj = 105;
  baseTj = Math.min(Math.max(baseTj, 85), 150);

  // 1. Thermal resistance of thinned substrate and nTSV constriction
  // In BSPDN, buried power rails and dense oxide-lined nTSVs create local thermal constriction
  // Unit thermal impedance in K/(W/cm^2) typically ranges from 0.05 to 0.18 K/(W/cm^2)
  const rthConstrictionKPerWcm2 = 0.08 * (ntsvPitch / 200) * Math.sqrt(20 / subThickness);

  // 2. Hotspot temperature rise over baseline (Delta_T = Power_Density * Rth)
  const deltaTHotspotC = Math.max(1.0, powerDensity * rthConstrictionKPerWcm2);
  const effectiveNvmTempC = baseTj + deltaTHotspotC;

  // 3. Thermal retention penalty on floating gate / charge trap NVM (Arrhenius acceleration)
  // Assuming typical Ea = 1.2 eV
  const kbEv = 8.617333e-5;
  const tBaseK = baseTj + 273.15;
  const tHotspotK = effectiveNvmTempC + 273.15;
  const exponent = (1.2 / kbEv) * ((1 / tBaseK) - (1 / tHotspotK));
  const retentionAccelerationFactor = Math.exp(exponent);

  // Retention lifetime degradation percentage
  const lifetimeRetentionLossPct = Math.min(99.0, (1 - (1 / retentionAccelerationFactor)) * 100);

  return {
    diePowerDensityWcm2: powerDensity,
    substrateThicknessUm: subThickness,
    ntsvPitchNm: ntsvPitch,
    baseJunctionTempC: baseTj,
    deltaTHotspotC: Number(deltaTHotspotC.toFixed(1)),
    effectiveNvmTempC: Number(effectiveNvmTempC.toFixed(1)),
    retentionAccelerationFactor: Number(retentionAccelerationFactor.toFixed(2)),
    lifetimeRetentionLossPct: Number(lifetimeRetentionLossPct.toFixed(1))
  };
}

/**
 * Attaches UI event listeners for the BSPDN Thermal simulator in memory-physics.html.
 */
export function initBspdnThermalUi() {
  const root = document.getElementById('bspdn-thermal-simulator-root');
  if (!root) return;

  const powerInput = /** @type {HTMLInputElement|null} */ (root.querySelector('#bspdn-power-input'));
  const thickInput = /** @type {HTMLInputElement|null} */ (root.querySelector('#bspdn-thick-input'));
  const tempInput = /** @type {HTMLInputElement|null} */ (root.querySelector('#bspdn-temp-input'));

  const deltaOut = root.querySelector('#bspdn-delta-out');
  const tempOut = root.querySelector('#bspdn-temp-out');
  const afOut = root.querySelector('#bspdn-af-out');
  const lossOut = root.querySelector('#bspdn-loss-out');

  const update = () => {
    const res = calculateBspdnThermalImpact({
      diePowerDensityWcm2: powerInput ? parseFloat(powerInput.value) : 120,
      substrateThicknessUm: thickInput ? parseFloat(thickInput.value) : 15,
      baseJunctionTempC: tempInput ? parseFloat(tempInput.value) : 105
    });

    if (deltaOut) deltaOut.textContent = `+${res.deltaTHotspotC} °C`;
    if (tempOut) tempOut.textContent = `${res.effectiveNvmTempC} °C`;
    if (afOut) afOut.textContent = `${res.retentionAccelerationFactor}×`;
    if (lossOut) lossOut.textContent = `-${res.lifetimeRetentionLossPct}%`;
  };

  [powerInput, thickInput, tempInput].forEach(inp => {
    if (inp) inp.addEventListener('input', update);
  });
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBspdnThermalUi);
  } else {
    initBspdnThermalUi();
  }
}
