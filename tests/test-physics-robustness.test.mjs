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
