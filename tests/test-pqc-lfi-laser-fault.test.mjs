/**
 * @fileoverview Unit test suite for PQC Key Storage Laser Fault Injection (LFI) Simulator (Suite 19C).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePqcLfiResistance, LFI_PROTECTION_PRESETS } from '../pqc-lfi-laser-fault-injection-simulator.js';

test('Suite 19C: PQC LFI Simulator - Null Safety & Defaults', () => {
  const def = calculatePqcLfiResistance();
  assert.equal(def.valid, true);
  assert.equal(def.shieldKey, 'hardened_antifuse_shield');
  assert.ok(def.laserPulseEnergyNj > 0);
  assert.ok(def.peakPhotoCurrentMilliAmp >= 0);
  assert.ok(def.activeZeroizationNs > 0);

  const nullRes = calculatePqcLfiResistance(null);
  assert.equal(nullRes.valid, true);
});

test('Suite 19C: PQC LFI Simulator - Shield Attenuation & Upset Resistance', () => {
  const hardened = calculatePqcLfiResistance({ shieldType: 'hardened_antifuse_shield', laserPulseEnergyNj: 0.5 });
  const unshielded = calculatePqcLfiResistance({ shieldType: 'standard_unshielded_nvm', laserPulseEnergyNj: 0.5 });

  // Hardened mesh must attenuate effective energy drastically
  assert.ok(hardened.effectiveIncidentEnergyNj < unshielded.effectiveIncidentEnergyNj);
  // Unshielded must have much higher upset probability
  assert.ok(unshielded.lfiUpsetProbabilityPercent > hardened.lfiUpsetProbabilityPercent);
  // Hardened has positive security margin under moderate pulse, unshielded is compromised (negative margin)
  assert.ok(hardened.securityMarginDb > unshielded.securityMarginDb);
});
