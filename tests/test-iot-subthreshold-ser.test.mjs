/**
 * @fileoverview Unit Test Suite for IoT Subthreshold Sense Margin & SER Simulator (Suite 18C).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSubthresholdSer, TECH_SER_PROFILES } from '../iot-subthreshold-ser-simulator.js';

test('Suite 18C: IoT Subthreshold SER Simulator - Null Safety & Voltage Clamping', () => {
  // Empty call default
  const def = calculateSubthresholdSer();
  assert.equal(def.tech, 'antifuse');
  assert.equal(def.vddVolts, 0.5);
  assert(def.ireadNa > 0);
  assert(def.netSenseMarginMv > 0);
  assert(def.qcritFc > 0);
  assert.equal(def.alphaImmunity, true);
  assert(def.serFitPerMbit < 1.0);

  // Voltage clamping: 0.2V clamped to 0.4V, 3.3V clamped to 1.2V
  const lowVdd = calculateSubthresholdSer({ vddVolts: 0.1 });
  assert.equal(lowVdd.vddVolts, 0.4);

  const highVdd = calculateSubthresholdSer({ vddVolts: 3.3 });
  assert.equal(highVdd.vddVolts, 1.2);
});

test('Suite 18C: IoT Subthreshold SER Simulator - Physical SER & Margin Scaling', () => {
  // Subthreshold voltage scaling: 0.4V read current must be lower than 1.0V read current
  const subVdd = calculateSubthresholdSer({ tech: 'fgotp', vddVolts: 0.4 });
  const nomVdd = calculateSubthresholdSer({ tech: 'fgotp', vddVolts: 1.0 });
  assert(subVdd.ireadNa < nomVdd.ireadNa, 'Subthreshold read current must be lower than nominal VDD');
  assert(subVdd.netSenseMarginMv < nomVdd.netSenseMarginMv, 'Sense margin must shrink in subthreshold');

  // Critical charge Qcrit must decrease with lower VDD
  assert(subVdd.qcritFc < nomVdd.qcritFc, 'Qcrit must scale linearly with VDD');

  // For charge-storage FG-OTP, lower Qcrit must result in higher soft error rate (SER)
  assert(subVdd.serFitPerMbit > nomVdd.serFitPerMbit, 'SER must increase exponentially as Qcrit decreases');

  // AntiFuse filament must sustain ~0 SER regardless of voltage drop
  const antifuseSub = calculateSubthresholdSer({ tech: 'antifuse', vddVolts: 0.4 });
  assert(antifuseSub.serFitPerMbit < 0.1, 'AntiFuse must retain near-zero SER under subthreshold');
});
