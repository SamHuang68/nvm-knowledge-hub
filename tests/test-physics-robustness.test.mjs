import test from 'node:test';
import assert from 'node:assert/strict';

// Import all 38 physical calculation functions
import { calculateAdvancedFinfetGaa } from '../advanced-finfet-gaa-simulator.js';
import { calculatePackagingPdkMetrics } from '../advanced-packaging-pdks-simulator.js';
import { calculateAutomotiveAsilMetrics } from '../automotive-asild-ecc-simulator.js';
import { calculateAutomotiveHbm4Metrics } from '../automotive-hbm4-scrubbing-simulator.js';
import { calculateAutomotiveLoadDumpClamp } from '../automotive-load-dump-clamp-simulator.js';
import { calculateBcdTrimming } from '../bcd-trimming-simulator.js';
import { calculateBspdnMetrics } from '../bspdn-envm-ir-drop-simulator.js';
import { calculateChipletHeteroMetrics } from '../chiplet-3d-hetero-nvm-simulator.js';
import { calculateChipletUcieNvm } from '../chiplet-ucie-nvm-simulator.js';
import { calculateCimAnalogMac } from '../cim-analog-mac-simulator.js';
import { calculateCimMacMetrics } from '../cim-neuromorphic-mac-simulator.js';
import { calculateCimNnDegradation } from '../cim-nn-accuracy-degradation-simulator.js';
import { calculateCpoTrimMetrics } from '../cpo-optical-trim-simulator.js';
import { calculateCpoSiphMetrics } from '../cpo-siph-nvm-simulator.js';
import { calculateCryoNvmMetrics } from '../cryo-cmos-quantum-nvm-simulator.js';
import { calculateCryoQubitReadout } from '../cryo-qubit-readout-simulator.js';
import { calculateCryoRadhardMetrics } from '../cryo-radhard-nvm-simulator.js';
import { calculateCryogenicPhysics } from '../cryogenic-nvm-physics-simulator.js';
import { calculateCxlPoolingMetrics } from '../cxl-memory-pooling-simulator.js';
import { calculateDeepSpaceMetrics } from '../deep-space-sel-retention-simulator.js';
import { calculateDifferentialSensing } from '../differential-sensing-simulator.js';
import { calculateDpaCpaLeakage } from '../dpa-cpa-leakage-simulator.js';
import { calculateHbm4ProbeMetrics } from '../hbm4-base-die-repair-probe-simulator.js';
import { calculateHybridBondingMetrics } from '../hybrid-bonding-tsv-kgd-simulator.js';
import { calculateMcuVectorPatch } from '../mcu-vector-patch-simulator.js';
import { calculateNanosheetBspdnNvm } from '../nanosheet-bspdn-nvm-simulator.js';
import { calculateNormallyOffEnergy } from '../normally-off-energy-harvesting-simulator.js';
import { calculatePqcStorageMetrics } from '../pqc-hardware-rot-ledger-simulator.js';
import { calculatePqcKeyStorage } from '../pqc-key-storage-simulator.js';
import { calculatePqcDpaMetrics } from '../pqc-rot-dpa-simulator.js';
import { calculatePufReconstruction } from '../puf-reconstruction-simulator.js';
import { calculateRadMetrics } from '../rad-hard-nvm-simulator.js';
import { calculateSpaceRadiationHardening } from '../space-radiation-hardening-simulator.js';
import { calculateGdpw300mm, calculateSramYieldRecovery } from '../sram-yield-bira-simulator.js';
import { calculateSubthresholdMetrics } from '../subthreshold-lowvoltage-nvm-simulator.js';
import { calculateTddbWeibull } from '../tddb-weibull-simulator.js';
import { calculateVertical3dMetrics } from '../vertical-3d-nvm-simulator.js';

const allCalculators = [
  { name: 'calculateAdvancedFinfetGaa', fn: calculateAdvancedFinfetGaa },
  { name: 'calculatePackagingPdkMetrics', fn: calculatePackagingPdkMetrics },
  { name: 'calculateAutomotiveAsilMetrics', fn: calculateAutomotiveAsilMetrics },
  { name: 'calculateAutomotiveHbm4Metrics', fn: calculateAutomotiveHbm4Metrics },
  { name: 'calculateAutomotiveLoadDumpClamp', fn: calculateAutomotiveLoadDumpClamp },
  { name: 'calculateBcdTrimming', fn: calculateBcdTrimming },
  { name: 'calculateBspdnMetrics', fn: calculateBspdnMetrics },
  { name: 'calculateChipletHeteroMetrics', fn: calculateChipletHeteroMetrics },
  { name: 'calculateChipletUcieNvm', fn: calculateChipletUcieNvm },
  { name: 'calculateCimAnalogMac', fn: calculateCimAnalogMac },
  { name: 'calculateCimMacMetrics', fn: calculateCimMacMetrics },
  { name: 'calculateCimNnDegradation', fn: calculateCimNnDegradation },
  { name: 'calculateCpoTrimMetrics', fn: calculateCpoTrimMetrics },
  { name: 'calculateCpoSiphMetrics', fn: calculateCpoSiphMetrics },
  { name: 'calculateCryoNvmMetrics', fn: calculateCryoNvmMetrics },
  { name: 'calculateCryoQubitReadout', fn: calculateCryoQubitReadout },
  { name: 'calculateCryoRadhardMetrics', fn: calculateCryoRadhardMetrics },
  { name: 'calculateCryogenicPhysics', fn: calculateCryogenicPhysics },
  { name: 'calculateCxlPoolingMetrics', fn: calculateCxlPoolingMetrics },
  { name: 'calculateDeepSpaceMetrics', fn: calculateDeepSpaceMetrics },
  { name: 'calculateDifferentialSensing', fn: calculateDifferentialSensing },
  { name: 'calculateDpaCpaLeakage', fn: calculateDpaCpaLeakage },
  { name: 'calculateHbm4ProbeMetrics', fn: calculateHbm4ProbeMetrics },
  { name: 'calculateHybridBondingMetrics', fn: calculateHybridBondingMetrics },
  { name: 'calculateMcuVectorPatch', fn: calculateMcuVectorPatch },
  { name: 'calculateNanosheetBspdnNvm', fn: calculateNanosheetBspdnNvm },
  { name: 'calculateNormallyOffEnergy', fn: calculateNormallyOffEnergy },
  { name: 'calculatePqcStorageMetrics', fn: calculatePqcStorageMetrics },
  { name: 'calculatePqcKeyStorage', fn: calculatePqcKeyStorage },
  { name: 'calculatePqcDpaMetrics', fn: calculatePqcDpaMetrics },
  { name: 'calculatePufReconstruction', fn: calculatePufReconstruction },
  { name: 'calculateRadMetrics', fn: calculateRadMetrics },
  { name: 'calculateSpaceRadiationHardening', fn: calculateSpaceRadiationHardening },
  { name: 'calculateGdpw300mm', fn: () => calculateGdpw300mm(10.0, 10.0) },
  { name: 'calculateSramYieldRecovery', fn: calculateSramYieldRecovery },
  { name: 'calculateSubthresholdMetrics', fn: calculateSubthresholdMetrics },
  { name: 'calculateTddbWeibull', fn: calculateTddbWeibull },
  { name: 'calculateVertical3dMetrics', fn: calculateVertical3dMetrics }
];

function checkNoNaN(obj, prefix = '') {
  if (obj === null || obj === undefined) return;
  if (typeof obj === 'number') {
    assert.ok(!Number.isNaN(obj), `NaN detected at ${prefix}`);
    assert.ok(Number.isFinite(obj), `Infinite number detected at ${prefix}`);
    return;
  }
  if (typeof obj === 'object') {
    for (const [key, val] of Object.entries(obj)) {
      checkNoNaN(val, `${prefix}.${key}`);
    }
  }
}

test('Physical Calculators: Empty Object Default Invocation', () => {
  for (const { name, fn } of allCalculators) {
    let res;
    try {
      res = fn({});
    } catch (err) {
      assert.fail(`${name}({}) threw an exception: ${err.message}`);
    }
    assert.ok(res !== undefined, `${name}({}) must return a result object`);
    checkNoNaN(res, name);
  }
});

test('Physical Calculators: Undefined Argument Invocation', () => {
  for (const { name, fn } of allCalculators) {
    let res;
    try {
      res = fn();
    } catch (err) {
      assert.fail(`${name}() threw an exception: ${err.message}`);
    }
    assert.ok(res !== undefined, `${name}() must return a result object`);
    checkNoNaN(res, name);
  }
});

test('Physical Calculators: Extreme Values & Boundary Fuzzing', () => {
  const extremeValues = [
    -1000, -273.15, -100, -1, 0, 0.000001, 1, 100, 300, 500, 1000, 1e6, 1e12,
    Number.MIN_VALUE, Number.MAX_VALUE, Number.EPSILON
  ];

  for (const { name, fn } of allCalculators) {
    for (const val of extremeValues) {
      try {
        const res = fn({
          tempC: val,
          junctionTempC: val,
          vdd: val,
          voltage: val,
          tempK: val,
          missionYears: val,
          capacityKb: Math.abs(val) || 1,
          frequencyGhz: val,
        });
        assert.ok(res !== undefined, `${name} returned undefined for value ${val}`);
      } catch (err) {
        assert.fail(`${name} crashed on extreme value ${val}: ${err.message}`);
      }
    }
  }
});

test('Physical Calculators: 10,000 Random Float Noise Invocations (No Crashes)', () => {
  const noiseGenerators = [
    () => (Math.random() - 0.5) * 1000,
    () => Math.random() * 1e8,
    () => -Math.random() * 500,
    () => Math.random() < 0.1 ? 0 : Math.random(),
    () => NaN,
    () => Infinity,
    () => -Infinity,
  ];

  for (let iter = 0; iter < 10000; iter++) {
    const calcIndex = iter % allCalculators.length;
    const { name, fn } = allCalculators[calcIndex];
    const gen = noiseGenerators[iter % noiseGenerators.length];

    const payload = {
      tempC: gen(),
      junctionTempC: gen(),
      vdd: gen(),
      voltage: gen(),
      tempK: gen(),
      capacityKb: Math.abs(gen()) || 256,
      missionYears: gen(),
      frequencyGhz: gen(),
    };

    try {
      const res = fn(payload);
      assert.ok(res !== undefined, `${name} returned undefined during fuzz iteration ${iter}`);
    } catch (err) {
      assert.fail(`${name} crashed during fuzz iteration ${iter}: ${err.message}`);
    }
  }
});

test('Physical Calculators: Structural Mutation & String Coercion Fuzzing (1,000 runs)', () => {
  const mutationSamples = [
    { tempC: '125', voltage: '0.85', vdd: '1.2' },
    { tempC: true, voltage: false, missionYears: '10' },
    { tempC: '', vdd: '', capacityKb: '512' },
    { tempC: '  ', voltage: '  ', dutyCycleKey: 'invalid_duty' },
    { tempC: -0, voltage: 0, missionYears: 0 },
    { tempC: 85, voltage: 1.0, presetId: 'unknown_preset_key_test' },
    { tempC: 25, voltage: 0.5, topologyId: 'nonexistent_topology' },
    { tempC: 150, voltage: 1.5, modelId: 'nonexistent_model' },
  ];

  for (const { name, fn } of allCalculators) {
    for (const sample of mutationSamples) {
      try {
        const res = fn(sample);
        assert.ok(res !== undefined, `${name} must return result on structural mutation`);
      } catch (err) {
        assert.fail(`${name} crashed on mutation sample: ${err.message}`);
      }
    }
  }
});

test('Physical Calculators: Suite 6 - Gb-Scale Capacity & Terabit Memory Boundary Stress', () => {
  const gbCapacities = [
    1024 * 1024,        // 1 Gb
    4 * 1024 * 1024,    // 4 Gb
    16 * 1024 * 1024,   // 16 Gb
    64 * 1024 * 1024,   // 64 Gb
    128 * 1024 * 1024,  // 128 Gb (HBM4/CXL scale)
    1024 * 1024 * 1024, // 1 Tb (Extrapolation boundary)
  ];

  for (const { name, fn } of allCalculators) {
    for (const cap of gbCapacities) {
      try {
        const res = fn({
          capacityKb: cap,
          macroBitCapacity: cap,
          arraySizeKb: cap,
          dieSizeMm2: 120.0,
          channelCount: 128,
        });
        assert.ok(res !== undefined, `${name} must handle ${cap} Kb without crashing`);
        checkNoNaN(res, `${name}_GbCap_${cap}`);
      } catch (err) {
        assert.fail(`${name} crashed on capacity ${cap} Kb: ${err.message}`);
      }
    }
  }
});

test('Physical Calculators: Suite 7 - Sub-Kelvin & Extreme Plasma Temperature Boundaries', () => {
  const extremeTemperatures = [
    { tempK: 0.001, tempC: -273.149 }, // 1 mK Sub-Kelvin
    { tempK: 0.1, tempC: -273.05 },    // 100 mK Dilution Mixing Chamber
    { tempK: 4.2, tempC: -268.95 },    // 4.2 K Liquid Helium
    { tempK: 77.0, tempC: -196.15 },   // 77 K Liquid Nitrogen
    { tempK: 733.15, tempC: 460.0 },   // Venus surface
    { tempK: 1273.15, tempC: 1000.0 }, // SiC processing plasma
    { tempK: 5273.15, tempC: 5000.0 }, // Ultra-extreme thermal redline
  ];

  for (const { name, fn } of allCalculators) {
    for (const { tempK, tempC } of extremeTemperatures) {
      try {
        const res = fn({
          tempK,
          tempC,
          ambientTempC: tempC,
          operatingTempK: tempK,
          targetTempC: tempC,
        });
        assert.ok(res !== undefined, `${name} must return valid object at ${tempK} K / ${tempC} °C`);
        checkNoNaN(res, `${name}_Temp_${tempK}K`);
      } catch (err) {
        assert.fail(`${name} crashed at temperature ${tempK} K / ${tempC} °C: ${err.message}`);
      }
    }
  }
});



