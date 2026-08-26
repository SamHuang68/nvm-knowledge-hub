/**
 * @fileoverview Automated tests for Silicon IP Engineering Interactive Suite calculators:
 * 1. Arrhenius FIT Rate & Lifetime Extrapolator
 * 2. PQC Memory Footprint & Latency Tradeoff Simulator
 * 3. UCIe 2.0 D2D Flit Security & Pipeline Latency Calculator
 */

import assert from 'node:assert/strict';
import {
  ArrheniusCalculator,
  PqcTradeoffSimulator,
  UcieFlitCalculator
} from '../engineering-suite.js';

console.log('--- RUNNING SILICON IP ENGINEERING CALCULATOR TESTS ---');

// ============================================================================
// 1. ArrheniusCalculator Tests
// ============================================================================
console.log('[TEST] ArrheniusCalculator: Temperature & Voltage Acceleration & FIT Rate');
const arrhenius = new ArrheniusCalculator();

// Test AFT with Ea = 1.1 eV, Tstress = 150°C (423.15K), Tuse = 55°C (328.15K)
const afTemp = arrhenius.calcTempAcceleration(150, 55, 1.1);
assert.ok(afTemp > 1000, `Expected AFT > 1000, got ${afTemp}`);

// Test AFV with Vstress = 1.10V, Vuse = 0.75V, gamma = 3.5
const afVolt = arrhenius.calcVoltageAcceleration(1.10, 0.75);
assert.ok(afVolt > 3.0 && afVolt < 4.0, `Expected AFV around 3.4, got ${afVolt}`);

// Test Full Evaluation
const resultA = arrhenius.evaluate({
  tStress: 150,
  tUse: 55,
  vStress: 1.10,
  vUse: 0.75,
  ea: 1.1,
  stressHours: 1000,
  sampleSize: 231,
  failures: 0,
  confidence: 0.60
});

assert.ok(resultA.afTotal > 3000, `Total AF should be > 3000, got ${resultA.afTotal}`);
assert.ok(resultA.equivMillionHours > 500, `Equivalent million device hours should be > 500M, got ${resultA.equivMillionHours}`);
assert.ok(resultA.fitRate < 1.0, `FIT Rate should be < 1.0 FIT for automotive qualification, got ${resultA.fitRate}`);
assert.ok(resultA.projectedYears > 15, `Projected retention lifetime should exceed 15 years, got ${resultA.projectedYears}`);
assert.strictEqual(resultA.grade, 'AEC-Q100 GRADE 0 / ASIL-D');
console.log('✓ ArrheniusCalculator passed. FIT =', resultA.fitRate.toFixed(4), 'FIT, Lifetime =', resultA.projectedYears.toFixed(1), 'Years');

// Test Degraded Stress Condition (lower temp/sample size, higher FIT)
const resultA_Degraded = arrhenius.evaluate({
  tStress: 85,
  tUse: 85,
  vStress: 0.75,
  vUse: 0.75,
  ea: 0.7,
  stressHours: 100,
  sampleSize: 77,
  failures: 1,
  confidence: 0.90
});
assert.ok(resultA_Degraded.fitRate > 100, `Degraded test should have higher FIT rate, got ${resultA_Degraded.fitRate}`);
assert.strictEqual(resultA_Degraded.grade, 'COMMERCIAL');
console.log('✓ ArrheniusCalculator edge case passed. Degraded FIT =', resultA_Degraded.fitRate.toFixed(2));

// ============================================================================
// 2. PqcTradeoffSimulator Tests
// ============================================================================
console.log('\n[TEST] PqcTradeoffSimulator: Area Footprint & Latency Scaling');
const pqc = new PqcTradeoffSimulator();

// Test Classical AES-256
const aesRes = pqc.evaluate({
  algorithm: 'AES-256',
  node: 'N5',
  strategy: 'hybrid',
  clockMhz: 500
});
assert.strictEqual(aesRes.effectiveBytes, 32);
assert.strictEqual(aesRes.physicalAreaUm2, 32 * 8 * 0.080); // 20.48 µm²
assert.ok(aesRes.latencyUs < 0.1, `AES-256 latency should be sub-microsecond, got ${aesRes.latencyUs}`);

// Test ML-KEM-768 with Raw OTP vs Hybrid PUF Seed Strategy
const pqcRaw = pqc.evaluate({
  algorithm: 'ML-KEM-768',
  node: 'N5',
  strategy: 'raw',
  clockMhz: 500,
  operation: 'decaps'
});
assert.strictEqual(pqcRaw.effectiveBytes, 2400); // 2400 Bytes
assert.ok(pqcRaw.physicalAreaUm2 > 1500, `Raw ML-KEM-768 bitcell area should be > 1500 µm², got ${pqcRaw.physicalAreaUm2}`);

const pqcHybrid = pqc.evaluate({
  algorithm: 'ML-KEM-768',
  node: 'N5',
  strategy: 'hybrid',
  clockMhz: 500,
  operation: 'decaps'
});
assert.strictEqual(pqcHybrid.effectiveBytes, 32); // 32 Bytes seed
assert.ok(pqcHybrid.physicalAreaUm2 < 25, `Hybrid ML-KEM-768 bitcell area should be ~20.48 µm², got ${pqcHybrid.physicalAreaUm2}`);
assert.ok(pqcHybrid.areaSavingsPercent > 98.0, `Hybrid area savings should exceed 98%, got ${pqcHybrid.areaSavingsPercent}%`);
assert.ok(pqcHybrid.latencyUs > 10 && pqcHybrid.latencyUs < 25, `Decapsulation latency @ 500MHz should be ~17.8 µs, got ${pqcHybrid.latencyUs}`);

// Test Node Density Scaling from N16 down to N2
const pqcN16 = pqc.evaluate({ algorithm: 'ML-KEM-1024', node: 'N16', strategy: 'raw' });
const pqcN2 = pqc.evaluate({ algorithm: 'ML-KEM-1024', node: 'N2', strategy: 'raw' });
assert.ok(pqcN16.physicalAreaUm2 > pqcN2.physicalAreaUm2 * 5, `N16 area should be ~6x larger than N2 area`);

// Test compareAll method
const allAlgos = pqc.compareAll('N5', 'hybrid', 500);
assert.strictEqual(allAlgos.length, 4);
console.log('✓ PqcTradeoffSimulator passed. ML-KEM-768 Hybrid Area Savings =', pqcHybrid.areaSavingsPercent.toFixed(2), '%');

// ============================================================================
// 3. UcieFlitCalculator Tests
// ============================================================================
console.log('\n[TEST] UcieFlitCalculator: UCIe 2.0 D2D Flit Security & Pipeline Latency');
const ucie = new UcieFlitCalculator();

// Standard 16 Lanes @ 32 Gbps with AES-GCM-256 Full MAC (128-bit)
const ucie16 = ucie.evaluate({
  lanes: 16,
  dataRateGbps: 32,
  flitSizeBytes: 256,
  secMode: 'gcm256',
  coreClockGhz: 1.5,
  pipelineStages: 3
});

assert.strictEqual(ucie16.rawBandwidthGbps, 512); // 16 * 32 = 512 Gbps
assert.strictEqual(ucie16.rawBandwidthGBs, 64); // 64 GB/s
assert.strictEqual(ucie16.rawBandwidthTbps, 0.512); // 0.512 Tbps
assert.strictEqual(ucie16.flitDurationNs, 4.0); // (256 * 8) / 512 = 4.0 ns
assert.strictEqual(ucie16.totalOverheadBytes, 32); // 8 header + 8 crc + 16 mac = 32B
assert.strictEqual(ucie16.netPayloadBytes, 224); // 256 - 32 = 224B
assert.strictEqual(ucie16.securityEfficiencyPercent, (224 / 256) * 100); // 87.5%
assert.strictEqual(ucie16.effectiveGoodputGBs, 64 * 0.875); // 56 GB/s
assert.strictEqual(ucie16.macPipelineLatencyNs, 2.20); // (3 / 1.5) + 0.20 = 2.20 ns (< 2.5ns line-rate target!)
assert.ok(ucie16.macPipelineLatencyNs < 2.50, `MAC pipeline latency must be under 2.5ns`);

// Advanced 64 Lanes @ 48 Gbps (UCIe 2.0 Max Bandwidth)
const ucie64 = ucie.evaluate({
  lanes: 64,
  dataRateGbps: 48,
  flitSizeBytes: 256,
  secMode: 'gcm256',
  coreClockGhz: 2.0,
  pipelineStages: 3
});

assert.strictEqual(ucie64.rawBandwidthGbps, 3072); // 64 * 48 = 3072 Gbps = 3.072 Tbps
assert.strictEqual(ucie64.rawBandwidthGBs, 384); // 384 GB/s
assert.strictEqual(ucie64.flitDurationNs, (256 * 8) / 3072); // ~0.667 ns
assert.ok(ucie64.macPipelineLatencyNs <= 1.70, `Pipelined AES at 2.0 GHz should be ~1.7 ns`);
console.log('✓ UcieFlitCalculator passed. 64 Lanes Raw Bandwidth =', ucie64.rawBandwidthTbps.toFixed(3), 'Tbps, MAC Latency =', ucie64.macPipelineLatencyNs.toFixed(2), 'ns');

console.log('\n========================================');
console.log('ALL SILICON IP CALCULATOR TESTS PASSED!');
console.log('========================================');
