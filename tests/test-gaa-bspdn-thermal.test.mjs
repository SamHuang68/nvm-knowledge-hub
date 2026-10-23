/**
 * @fileoverview Unit Test Suite for GAA Nanosheet & BSPDN Thermal Simulators (Suite 18B).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGaaTunneling } from '../gaa-nanosheet-tunneling-leakage-simulator.js';
import { calculateBspdnThermalImpact } from '../bspdn-backside-power-thermal-simulator.js';

test('Suite 18B: GAA Nanosheet Simulator - Null Safety & Physics Scaling', () => {
  // Empty call default
  const def = calculateGaaTunneling();
  assert.equal(def.numSheets, 3);
  assert.equal(def.sheetWidthNm, 35);
  assert.equal(def.totalWeffNm, 240);
  assert(def.quantumConfinementShiftEv > 0);
  assert(def.igateTotalPa > 0);
  assert(def.subthresholdSwingMvDec >= 60);

  // Sheet scaling: 5 sheets must yield 5/3x of 3 sheets Weff
  const threeSheets = calculateGaaTunneling({ numSheets: 3, sheetWidthNm: 30, sheetThicknessNm: 5 });
  const fiveSheets = calculateGaaTunneling({ numSheets: 5, sheetWidthNm: 30, sheetThicknessNm: 5 });
  assert.equal(fiveSheets.totalWeffNm, 350);
  assert(fiveSheets.totalWeffNm > threeSheets.totalWeffNm);

  // EOT thinning must increase tunneling leakage exponentially
  const thickEot = calculateGaaTunneling({ eotNm: 1.2 });
  const thinEot = calculateGaaTunneling({ eotNm: 0.6 });
  assert(thinEot.directTunnelingDensityAcm2 > thickEot.directTunnelingDensityAcm2);
});

test('Suite 18B: BSPDN Thermal Simulator - Thermal Monotonicity & Retention Degradation', () => {
  // Empty call default
  const def = calculateBspdnThermalImpact();
  assert.equal(def.diePowerDensityWcm2, 120);
  assert(def.deltaTHotspotC > 0);
  assert(def.effectiveNvmTempC > def.baseJunctionTempC);
  assert(def.retentionAccelerationFactor > 1.0);
  assert(def.lifetimeRetentionLossPct > 0 && def.lifetimeRetentionLossPct < 100);

  // Power density scaling: Higher power density must create higher hotspot elevation
  const lowPower = calculateBspdnThermalImpact({ diePowerDensityWcm2: 60 });
  const highPower = calculateBspdnThermalImpact({ diePowerDensityWcm2: 240 });
  assert(highPower.deltaTHotspotC > lowPower.deltaTHotspotC);
  assert(highPower.retentionAccelerationFactor > lowPower.retentionAccelerationFactor);
});
