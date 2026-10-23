/**
 * @fileoverview Unit test suite for CPO Photonic Thermal Drift & NVM Trimming Simulator (Suite 19D).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCpoPhotonicTuning, CPO_PHOTONIC_PRESETS } from '../cpo-photonic-thermal-tuning-nvm-simulator.js';

test('Suite 19D: CPO Photonic Tuning Simulator - Null Safety & Defaults', () => {
  const def = calculateCpoPhotonicTuning();
  assert.equal(def.valid, true);
  assert.equal(def.cpoKey, 'dwdm_o_band');
  assert.ok(def.rawWavelengthDriftNm > 0);
  assert.ok(def.tuningPowerPerChannelMw > 0);
  assert.ok(def.residualWavelengthErrorPm > 0);

  const nullRes = calculateCpoPhotonicTuning(null);
  assert.equal(nullRes.valid, true);
});

test('Suite 19D: CPO Photonic Tuning Simulator - DAC Resolution & Thermal Monotonicity', () => {
  // Higher DAC resolution (12-bit vs 8-bit) must yield smaller residual wavelength error
  const res8 = calculateCpoPhotonicTuning({ dacResolutionBits: 8 });
  const res12 = calculateCpoPhotonicTuning({ dacResolutionBits: 12 });
  assert.ok(res12.residualWavelengthErrorPm < res8.residualWavelengthErrorPm);

  // Larger temperature delta must increase raw drift and required heater tuning power
  const lowT = calculateCpoPhotonicTuning({ temperatureDeltaC: 10.0 });
  const highT = calculateCpoPhotonicTuning({ temperatureDeltaC: 50.0 });
  assert.ok(highT.rawWavelengthDriftNm > lowT.rawWavelengthDriftNm);
  assert.ok(highT.tuningPowerPerChannelMw > lowT.tuningPowerPerChannelMw);
});
