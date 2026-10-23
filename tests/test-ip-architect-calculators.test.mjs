/**
 * @fileoverview Unit Test Suite for IP Architect Calculators (Suite 18A).
 * Tests extreme bounds, null-safety, type coercion, and physical monotonicity
 * across Macro Overhead, ATE Test Economics, and Arrhenius AEC-Q100 Extrapolator.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMacroOverhead, TECH_MACRO_PROFILES } from '../ip-architect-macro-overhead-calculator.js';
import { calculateAteTestCost, TECH_TEST_PROFILES } from '../ip-architect-ate-test-cost-calculator.js';
import { calculateArrheniusRetention, TECH_THERMAL_PROFILES } from '../ip-architect-arrhenius-auto-extrapolator.js';

test('Suite 18A: Macro Overhead Calculator - Null & Type Safety', () => {
  // Empty arguments
  const def = calculateMacroOverhead();
  assert.equal(def.tech, 'antifuse');
  assert.equal(def.node, '28nm');
  assert.equal(def.capacityKb, 64);
  assert(def.macroAreaMm2 > 0);
  assert(def.dilutionPercent > 0 && def.dilutionPercent < 100);

  // Null & invalid inputs
  const nullRes = calculateMacroOverhead(null);
  assert.equal(nullRes.tech, 'antifuse');

  // String coercion & bounds clamping
  const coerced = calculateMacroOverhead({ tech: 'sst', node: '16nm', capacityKb: '256' });
  assert.equal(coerced.capacityKb, 256);
  assert.equal(coerced.tech, 'sst');
  assert.equal(coerced.node, '16nm');

  // Extreme negative capacity clamped to 1Kb
  const neg = calculateMacroOverhead({ capacityKb: -500 });
  assert.equal(neg.capacityKb, 1);

  // Extreme giant capacity clamped to 64Mb (65536Kb)
  const giant = calculateMacroOverhead({ capacityKb: 9999999 });
  assert.equal(giant.capacityKb, 65536);
});

test('Suite 18A: Macro Overhead Calculator - Technology Crossover Physics', () => {
  // At small capacity (64Kb), AntiFuse macro area should be substantially smaller than eFlash due to pump overhead
  const antifuseSmall = calculateMacroOverhead({ tech: 'antifuse', capacityKb: 64 });
  const eflashSmall = calculateMacroOverhead({ tech: 'sst', capacityKb: 64 });
  assert(antifuseSmall.macroAreaMm2 < eflashSmall.macroAreaMm2, 'At 64Kb, 0-mask AntiFuse must have smaller macro footprint than eFlash');

  // Dilution percentage must be higher for small capacity than large capacity
  const antifuseLarge = calculateMacroOverhead({ tech: 'antifuse', capacityKb: 16384 });
  assert(antifuseSmall.dilutionPercent > antifuseLarge.dilutionPercent, 'Peripheral dilution must decrease as array capacity increases');
});

test('Suite 18A: ATE Test Cost Calculator - Null Safety & Tester Scalability', () => {
  // Empty call
  const defAte = calculateAteTestCost();
  assert.equal(defAte.tech, 'antifuse');
  assert(defAte.testTimeSecPerDie > 0);
  assert(defAte.totalVolumeCostUsd > 0);

  // Gang parallel scaling: 8 sites must be faster than 1 site
  const singleSite = calculateAteTestCost({ tech: 'antifuse', gangSites: 1 });
  const octalSite = calculateAteTestCost({ tech: 'antifuse', gangSites: 8 });
  assert(octalSite.testTimeSecPerDie < singleSite.testTimeSecPerDie, '8-site probe must be faster than single site');

  // Cost savings benchmark must be non-negative
  assert(defAte.costSavingsUsd >= 0);
});

test('Suite 18A: Arrhenius High-Temp Extrapolator - Physics Monotonicity & AEC-Q100', () => {
  // Empty call
  const defArr = calculateArrheniusRetention();
  assert.equal(defArr.tech, 'antifuse');
  assert.equal(defArr.junctionTempC, 150);
  assert(defArr.projectedRetentionYrs > 0);

  // Temperature monotonicity: retention at 150°C must be less than retention at 85°C
  const ret85 = calculateArrheniusRetention({ tech: 'fgotp', junctionTempC: 85 });
  const ret150 = calculateArrheniusRetention({ tech: 'fgotp', junctionTempC: 150 });
  assert(ret150.projectedRetentionYrs < ret85.projectedRetentionYrs, 'Retention must degrade monotonically with increasing junction temperature');

  // AntiFuse filament (Ea ~ 2.1eV) must have 100% SMT reflow immunity
  assert.equal(defArr.smtReflowImmunity, true);
  assert(defArr.projectedRetentionYrs >= 15, 'AntiFuse at 150°C must sustain >15 years lifetime for AEC-Q100 Grade 0');
});
