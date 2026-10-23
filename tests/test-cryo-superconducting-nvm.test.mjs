/**
 * @fileoverview Unit test suite for Cryogenic Superconducting Qubit NVM Simulator (Suite 19B).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCryoSuperconductingNvm, CRYO_SUPERCONDUCTING_PRESETS } from '../cryo-superconducting-qubit-nvm-simulator.js';

test('Suite 19B: Cryo Superconducting NVM - Null Safety & Defaults', () => {
  const def = calculateCryoSuperconductingNvm();
  assert.equal(def.valid, true);
  assert.equal(def.materialKey, 'nb_alox_fjj');
  assert.ok(def.criticalCurrentMicroAmp > 0);
  assert.ok(def.switchingEnergyAttoJoule > 0);
  assert.ok(def.qndFidelityPercent > 90.0);

  const nullRes = calculateCryoSuperconductingNvm(null);
  assert.equal(nullRes.valid, true);
});

test('Suite 19B: Cryo Superconducting NVM - BCS Temperature Scaling & SEU Threshold', () => {
  // At 20 mK vs 4.0 K (Nb has Tc = 9.2K)
  const cold = calculateCryoSuperconductingNvm({ temperatureKelvin: 0.020 });
  const warm = calculateCryoSuperconductingNvm({ temperatureKelvin: 4.0 });

  // Critical current and switching energy must be higher at lower temperature
  assert.ok(cold.criticalCurrentMicroAmp > warm.criticalCurrentMicroAmp);
  assert.ok(cold.switchingEnergyAttoJoule > warm.switchingEnergyAttoJoule);
  assert.ok(cold.microwaveDissipationNw < warm.microwaveDissipationNw);

  // SEU Threshold testing: LET below threshold (20) vs above (50) for Nb-AlOx (letThresh = 28.5)
  const lowLet = calculateCryoSuperconductingNvm({ ionLetMevCm2PerMg: 20.0 });
  const highLet = calculateCryoSuperconductingNvm({ ionLetMevCm2PerMg: 50.0 });
  assert.equal(lowLet.seuCrossSectionUm2, 0.0);
  assert.ok(highLet.seuCrossSectionUm2 > 0.0);
});
