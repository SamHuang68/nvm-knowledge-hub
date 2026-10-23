/**
 * @fileoverview Unit Test Suite for EV BMS CMTI Isolation & Crash Journal Simulator (Suite 18D).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateEvBmsLogging, TECH_BMS_PROFILES } from '../ev-bms-cmti-isolation-journal-simulator.js';

test('Suite 18D: EV BMS CMTI Simulator - Null Safety & Input Clamping', () => {
  // Empty call default
  const def = calculateEvBmsLogging();
  assert.equal(def.tech, 'antifuse');
  assert.equal(def.packVoltageVolts, 800);
  assert.equal(def.sicDvDtKvUs, 150);
  assert(def.dispCurrentMa > 0);
  assert(def.cmtiMarginRatio > 0);
  assert(def.emergencyFreezeLatencyMs > 0);
  assert.equal(def.asilDQualified, true);

  // Pack voltage clamping
  const lowPack = calculateEvBmsLogging({ packVoltageVolts: 100 });
  assert.equal(lowPack.packVoltageVolts, 300);

  const highPack = calculateEvBmsLogging({ packVoltageVolts: 2000 });
  assert.equal(highPack.packVoltageVolts, 1200);
});

test('Suite 18D: EV BMS CMTI Simulator - Physical CMTI & Freeze Latency Scaling', () => {
  // Slew rate scaling: 200 kV/us must generate 2x displacement current vs 100 kV/us
  const slew100 = calculateEvBmsLogging({ sicDvDtKvUs: 100 });
  const slew200 = calculateEvBmsLogging({ sicDvDtKvUs: 200 });
  assert.equal(slew200.dispCurrentMa, Number((slew100.dispCurrentMa * 2).toFixed(2)));
  assert(slew200.cmtiMarginRatio < slew100.cmtiMarginRatio, 'CMTI margin ratio must decrease as slew rate increases');

  // AntiFuse fast write must be substantially faster than eFlash sector erase cycle
  const antifuseRes = calculateEvBmsLogging({ tech: 'antifuse', snapshotBytes: 128 });
  const eflashRes = calculateEvBmsLogging({ tech: 'sst', snapshotBytes: 128 });
  assert(antifuseRes.emergencyFreezeLatencyMs < eflashRes.emergencyFreezeLatencyMs, 'AntiFuse single-pulse must complete freeze-frame faster than eFlash');
  assert(antifuseRes.emergencyFreezeLatencyMs <= 2.0, 'AntiFuse must meet 2ms emergency power-hold window');
});
