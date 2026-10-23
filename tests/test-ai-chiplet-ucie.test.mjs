/**
 * @fileoverview Unit test suite for AI Chiplet UCIe Interconnect & NMC Simulator (Suite 19A).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateUcieInterconnect, PACKAGING_PRESETS } from '../ai-chiplet-ucie-interconnect-simulator.js';

test('Suite 19A: UCIe Interconnect Simulator - Null Safety & Defaults', () => {
  const def = calculateUcieInterconnect();
  assert.equal(def.valid, true);
  assert.equal(def.packageKey, 'advanced_cowos');
  assert.equal(def.laneCount, 64);
  assert.ok(def.totalBandwidthGBps > 0);
  assert.ok(def.interconnectEnergyPjPerBit > 0);
  assert.ok(def.transmissionLatencyNs > 0);
  assert.ok(def.nmcEnergySavingsRatio > 1.0);

  // Null & undefined inputs
  const nullRes = calculateUcieInterconnect(null);
  assert.equal(nullRes.valid, true);
  const undefRes = calculateUcieInterconnect(undefined);
  assert.equal(undefRes.valid, true);
});

test('Suite 19A: UCIe Interconnect Simulator - Physical Scaling Across Packaging', () => {
  const cowos = calculateUcieInterconnect({ packageType: 'advanced_cowos', traceLengthMm: 2.0 });
  const standard = calculateUcieInterconnect({ packageType: 'standard_substrate', traceLengthMm: 20.0 });
  const direct3d = calculateUcieInterconnect({ packageType: 'hybrid_bonding_3d', traceLengthMm: 0.1 });

  // 3D Direct hybrid bonding must have lowest energy & latency
  assert.ok(direct3d.interconnectEnergyPjPerBit < cowos.interconnectEnergyPjPerBit);
  assert.ok(cowos.interconnectEnergyPjPerBit < standard.interconnectEnergyPjPerBit);
  assert.ok(direct3d.transmissionLatencyNs < cowos.transmissionLatencyNs);
  assert.ok(cowos.transmissionLatencyNs < standard.transmissionLatencyNs);

  // Bandwidth density must be highest for hybrid bonding (smallest pitch)
  assert.ok(direct3d.linearBwDensityGBpsPerMm > cowos.linearBwDensityGBpsPerMm);
  assert.ok(cowos.linearBwDensityGBpsPerMm > standard.linearBwDensityGBpsPerMm);
});
