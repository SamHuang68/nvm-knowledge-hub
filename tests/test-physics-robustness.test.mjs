import { calculateMacroOverhead } from '../ip-architect-macro-overhead-calculator.js';
import { calculateAteTestCost } from '../ip-architect-ate-test-cost-calculator.js';
import { calculateArrheniusRetention } from '../ip-architect-arrhenius-auto-extrapolator.js';
import { calculateGaaTunneling } from '../gaa-nanosheet-tunneling-leakage-simulator.js';
import { calculateBspdnThermalImpact } from '../bspdn-backside-power-thermal-simulator.js';
import { calculateSubthresholdSer } from '../iot-subthreshold-ser-simulator.js';
import { calculateEvBmsLogging } from '../ev-bms-cmti-isolation-journal-simulator.js';

import test from 'node:test';
import assert from 'node:assert/strict';

// Import all 49 physical calculation functions
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
import { calculateCuCuBondingMetrics } from '../cu-cu-hybrid-bonding-stress-simulator.js';
import { calculateAutomotiveHighTempSicGanMetrics } from '../automotive-high-temp-sic-gan-simulator.js';
import { calculateTunnelingBreakdownMetrics } from '../tunneling-breakdown-simulator.js';
import { calculateHardwareTrojanPemMetrics } from '../supply-chain-hardware-trojan-pem-simulator.js';
import { calculatePufNistRandomness } from '../puf-nist-randomness-evaluator.js';
import { calculateAttackPotential } from '../attack-resistance-evaluator.js';
import { calculateWaferCostTco } from '../wafer-cost-tco-calculator.js';
import { calculateBlackboxJournal } from '../automotive-blackbox-journal-calculator.js';
import { calculateCimMetrics } from '../cim-efficiency-calculator.js';
import { calculateDemuraLutStorage } from '../demura-lut-calculator.js';
import { calculateIotEnergyBudget } from '../iot-energy-tradeoff-calculator.js';
import { calculatePqcRotBudget } from '../pqc-rot-budget-calculator.js';
import { calculateUcieInterconnect } from '../ai-chiplet-ucie-interconnect-simulator.js';
import { calculateCryoSuperconductingNvm } from '../cryo-superconducting-qubit-nvm-simulator.js';
import { calculatePqcLfiResistance } from '../pqc-lfi-laser-fault-injection-simulator.js';
import { calculateCpoPhotonicTuning } from '../cpo-photonic-thermal-tuning-nvm-simulator.js';

// 本次契約案例獨立命名，可只執行受影響模型，不重跑整套回歸。
test('模型契約：未知與繼承技術鍵完整備援至 AntiFuse', () => {
  for (const junctionTemp of [125, 175]) {
    const expected = calculateAutomotiveHighTempSicGanMetrics({ tech: 'antifuse', junctionTemp });
    for (const tech of [undefined, null, '', 'unknown', '__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
      assert.deepEqual(calculateAutomotiveHighTempSicGanMetrics({ tech, junctionTemp }), expected,
        `${String(tech)} 在 ${junctionTemp}°C 必須使用同一組有效技術參數與公式`);
    }
  }
});

test('模型契約：四種合法技術保留 125°C 基準', () => {
  const expected = [
    ['antifuse', 12000, 22, null, 1e-18],
    ['mram', 10, 15, 60, 4.37825538134826e-27],
    ['reram', 5, 14, null, 1e-12],
    ['eflash', 15, 18, null, 1e-10],
  ];
  for (const [tech, lifetimeYears, senseMarginUa, deltaBarrier, ber] of expected) {
    const result = calculateAutomotiveHighTempSicGanMetrics({ tech, junctionTemp: 125 });
    assert.equal(result.af, 1);
    assert.equal(result.lifetimeYears, lifetimeYears);
    assert.equal(result.senseMarginUa, senseMarginUa);
    assert.equal(result.deltaBarrier, deltaBarrier);
    assert.ok(Math.abs(result.ber - ber) <= ber * 1e-12, `${tech} 位元錯誤率基準`);
    assert.deepEqual(Object.keys(result).sort(), ['af', 'ber', 'deltaBarrier', 'desatLatencyNs', 'lifetimeYears', 'senseMarginUa', 'snrDb', 'tech'].sort());
  }
});

test('模型契約：合法技術在 125 至 175°C 保留溫度方向性', () => {
  for (const tech of ['antifuse', 'mram', 'reram', 'eflash']) {
    const lower = calculateAutomotiveHighTempSicGanMetrics({ tech, junctionTemp: 125 });
    const higher = calculateAutomotiveHighTempSicGanMetrics({ tech, junctionTemp: 175 });
    assert.ok(higher.lifetimeYears < lower.lifetimeYears, `${tech} 模型壽命隨溫度下降`);
    assert.ok(higher.senseMarginUa < lower.senseMarginUa, `${tech} 模型感測裕度隨溫度下降`);
    assert.ok(higher.desatLatencyNs > lower.desatLatencyNs, `${tech} 模型讀取延遲隨溫度增加`);
    if (tech === 'antifuse') assert.equal(higher.ber, lower.ber);
    else assert.ok(higher.ber > lower.ber, `${tech} 模型位元錯誤率隨溫度增加`);
  }
});

test('模型契約：穿隧數值與公開回傳欄位保留原版基準', () => {
  // 固定值來自 fb2119f64f0fc13ef64ca5623ec46bdaa6dbcfc6 的正常情境；不在測試中重抄公式。
  const cases = [
    [{ tox: 2.2, vox: 3.5 }, 15.909090909090907, 1.7661838751272148],
    [{ tox: 3.5, vox: 1.2 }, 3.428571428571428, -18],
    [{ tox: 2, vox: 4.2 }, 21, 3.6617869066941604],
    [{ tox: 1.8, vox: 7.5 }, 41.666666666666664, 6],
    [{ tox: 10, vox: 1 }, 1, -18],
    [{ tox: 0.1, vox: 15 }, 1500, 6],
  ];
  for (const [input, eox, logJ] of cases) {
    const result = calculateTunnelingBreakdownMetrics(input);
    assert.ok(Math.abs(result.eox - eox) < 1e-10);
    assert.ok(Math.abs(result.logJ - logJ) < 1e-12);
    assert.equal(result.tox, input.tox);
    assert.equal(result.vox, input.vox);
    assert.deepEqual(Object.keys(result).sort(), ['tox', 'vox', 'eox', 'logJ', 'mechanism', 'state'].sort());
  }
});

test('模型契約：穿隧電場分區的公開代碼保留相容性', () => {
  for (const [vox, state] of [[3.999, 'safe'], [4, 'stress'], [9.999, 'stress'], [10, 'injection'], [12.999, 'injection'], [13, 'breakdown']]) {
    assert.equal(calculateTunnelingBreakdownMetrics({ tox: 10, vox }).state, state, `${vox} MV/cm 的分區`);
  }
});

test('模型契約：穿隧機制與低偏壓電流下限保留相容性', () => {
  for (const [vox, mechanism] of [[0, 'retention'], [0.05, 'retention'], [0.050001, 'direct'], [3.149999, 'direct'], [3.15, 'fn']]) {
    const result = calculateTunnelingBreakdownMetrics({ tox: 2.2, vox });
    assert.equal(result.mechanism, mechanism, `${vox} V 的機制`);
    if (vox <= 0.05) assert.equal(result.logJ, -18);
  }
});

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
  { name: 'calculateVertical3dMetrics', fn: calculateVertical3dMetrics },
  { name: 'calculateCuCuBondingMetrics', fn: calculateCuCuBondingMetrics },
  { name: 'calculateAutomotiveHighTempSicGanMetrics', fn: calculateAutomotiveHighTempSicGanMetrics },
  { name: 'calculateTunnelingBreakdownMetrics', fn: calculateTunnelingBreakdownMetrics },
  { name: 'calculateHardwareTrojanPemMetrics', fn: calculateHardwareTrojanPemMetrics },
  { name: 'calculatePufNistRandomness', fn: calculatePufNistRandomness },
  { name: 'calculateAttackPotential', fn: calculateAttackPotential },
  { name: 'calculateWaferCostTco', fn: calculateWaferCostTco },
  { name: 'calculateBlackboxJournal', fn: calculateBlackboxJournal },
  { name: 'calculateCimMetrics', fn: calculateCimMetrics },
  { name: 'calculateDemuraLutStorage', fn: calculateDemuraLutStorage },
  { name: 'calculateIotEnergyBudget', fn: calculateIotEnergyBudget },
  { name: 'calculatePqcRotBudget', fn: calculatePqcRotBudget },
  { name: 'calculateUcieInterconnect', fn: calculateUcieInterconnect },
  { name: 'calculateCryoSuperconductingNvm', fn: calculateCryoSuperconductingNvm },
  { name: 'calculatePqcLfiResistance', fn: calculatePqcLfiResistance },
  { name: 'calculateCpoPhotonicTuning', fn: calculateCpoPhotonicTuning }
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

test('物理計算器：Suite 8－3D 階梯極端層數與既有節點預設邊界', () => {
  const extreme3DConfigs = [
    { tierCount: 32, metalThicknessNm: 40.0, nodeKey: 'tsmc_n2_nanosheet' },
    { tierCount: 64, metalThicknessNm: 25.0, nodeKey: 'tsmc_a16_spr' },
    { tierCount: 128, metalThicknessNm: 15.0, nodeKey: 'intel_18a_powervia' },
    { tierCount: 256, metalThicknessNm: 10.0, nodeKey: 'foundry_14a_advanced' },
    { tierCount: 512, metalThicknessNm: 5.0, nodeKey: 'tsmc_a16_spr' },
    { tierCount: 1024, metalThicknessNm: 2.0, nodeKey: 'foundry_14a_advanced' },
  ];

  for (const { name, fn } of allCalculators) {
    for (const cfg of extreme3DConfigs) {
      try {
        const res = fn({
          tierCount: cfg.tierCount,
          metalThicknessNm: cfg.metalThicknessNm,
          arrayLengthUm: 200.0,
          customArrayMb: 8.0,
          customActivityRatePct: 25.0,
          nodeKey: cfg.nodeKey,
        });
        assert.ok(res !== undefined, `${name} 必須安全處理 ${cfg.tierCount} 層配置`);
        checkNoNaN(res, `${name}_3DTiers_${cfg.tierCount}L`);
      } catch (err) {
        assert.fail(`${name} 處理 ${cfg.tierCount} 層配置時失敗：${err.message}`);
      }
    }
  }
});

test('物理計算器：Suite 9－CiM 漂移、PQC 雜訊與 PUF 熵邊界', () => {
  const extremeSecurityCiMConfigs = [
    { noiseSigma: 0.0, driftTimeHours: 1, eccCapabilityT: 0, agingYears: 0 },
    { noiseSigma: 0.1, driftTimeHours: 10, eccCapabilityT: 4, agingYears: 1 },
    { noiseSigma: 2.5, driftTimeHours: 100, eccCapabilityT: 12, agingYears: 10 },
    { noiseSigma: 10.0, driftTimeHours: 1000, eccCapabilityT: 18, agingYears: 20 },
    { noiseSigma: 50.0, driftTimeHours: 10000, eccCapabilityT: 24, agingYears: 30 },
    { noiseSigma: 100.0, driftTimeHours: 87600, eccCapabilityT: 30, agingYears: 50 },
  ];

  for (const { name, fn } of allCalculators) {
    for (const cfg of extremeSecurityCiMConfigs) {
      try {
        const res = fn({
          customNoise: cfg.noiseSigma,
          eccCapabilityT: cfg.eccCapabilityT,
          agingYears: cfg.agingYears,
          wireResistanceOhm: 5.0,
          ...(name === 'calculateCimAnalogMac' ? { nominalAdcBits: 8 } :
            ['calculateCimMacMetrics', 'calculateCimNnDegradation'].includes(name) ? { adcResolutionBits: 8 } : {}),
          driftTimeHours: cfg.driftTimeHours,
        });
        assert.ok(res !== undefined, `${name} 必須安全處理 Suite 9 邊界條件`);
        checkNoNaN(res, `${name}_Suite9_Noise_${cfg.noiseSigma}`);
      } catch (err) {
        assert.fail(`${name} 處理 Suite 9 邊界條件時失敗：${err.message}`);
      }
    }
  }
});

test('物理計算器：Suite 10－Cu-Cu 混合鍵合、高溫 SiC/GaN、量子穿隧與硬體木馬極限物理應力', () => {
  const extreme3DAndPowerConfigs = [
    { annealTemp: 150, opTemp: -40, cmpDishing: 0.1, padHeight: 0.5, junctionTemp: 125, tox: 0.8, vox: 1.0 },
    { annealTemp: 300, opTemp: 85, cmpDishing: 3.0, padHeight: 1.5, junctionTemp: 175, tox: 1.5, vox: 3.3 },
    { annealTemp: 380, opTemp: 150, cmpDishing: 6.0, padHeight: 3.0, junctionTemp: 225, tox: 2.2, vox: 5.0 },
    { annealTemp: 450, opTemp: 250, cmpDishing: 12.0, padHeight: 5.0, junctionTemp: 280, tox: 3.5, vox: 8.5 },
    { annealTemp: 600, opTemp: 350, cmpDishing: 20.0, padHeight: 10.0, junctionTemp: 350, tox: 5.0, vox: 15.0 },
  ];

  for (const { name, fn } of allCalculators) {
    for (const cfg of extreme3DAndPowerConfigs) {
      try {
        const res = fn({
          annealTemp: cfg.annealTemp,
          opTemp: cfg.opTemp,
          cmpDishing: cfg.cmpDishing,
          padHeight: cfg.padHeight,
          junctionTemp: cfg.junctionTemp,
          tox: cfg.tox,
          vox: cfg.vox,
          substrateThickUm: 5.0,
          opticalShieldDb: 30,
          trojanPayloadPpm: 200,
        });
        assert.ok(res !== undefined, `${name} 必須安全處理 Suite 10 極限應力條件`);
        checkNoNaN(res, `${name}_Suite10_Tanneal_${cfg.annealTemp}`);
      } catch (err) {
        assert.fail(`${name} 處理 Suite 10 極限應力條件時失敗：${err.message}`);
      }
    }
  }
});

test('物理計算器：Suite 11－PUF NIST 統計、AVA_VAN 攻擊潛力與晶圓 TCO 經濟學極值邊界', () => {
  const extremeSecurityAndTcoConfigs = [
    { presetId: 'antifuse_neopuf_quantum', annualWaferVolume: 500, dieAreaMm2: 2.0, customMaskAdders: 0 },
    { presetId: 'sram_startup_uncompensated', annualWaferVolume: 5000, dieAreaMm2: 10.0, customMaskAdders: 2 },
    { presetId: 'otp_differential_mismatch', annualWaferVolume: 30000, dieAreaMm2: 25.0, customMaskAdders: 4 },
    { presetId: 'degraded_biased_source', annualWaferVolume: 100000, dieAreaMm2: 100.0, customMaskAdders: 8 },
    { presetId: 'antifuse_neopuf_quantum', annualWaferVolume: 500000, dieAreaMm2: 200.0, customMaskAdders: 12 },
  ];

  for (const { name, fn } of allCalculators) {
    for (const cfg of extremeSecurityAndTcoConfigs) {
      try {
        const res = fn({
          presetId: cfg.presetId,
          annualWaferVolume: cfg.annualWaferVolume,
          dieAreaMm2: cfg.dieAreaMm2,
          customMaskAdders: cfg.customMaskAdders,
          elapsedTime: 'ext',
          expertise: 'multiple',
          knowledge: 'critical',
          access: 'unlimited',
          equipment: 'multibespoke',
          activeMesh: true,
          zeroization: true,
        });
        assert.ok(res !== undefined, `${name} 必須安全處理 Suite 11 邊界條件`);
        checkNoNaN(res, `${name}_Suite11_TCOVol_${cfg.annualWaferVolume}`);
      } catch (err) {
        assert.fail(`${name} 處理 Suite 11 邊界條件時失敗：${err.message}`);
      }
    }
  }
});

test('物理計算器：Suite 12－車規黑盒子日誌、CIM 陣列效率與 De-Mura 顯示儲存邊界', () => {
  const suite12Configs = [
    { faultPresetKey: 'powertrain_inverter', nvmTechKey: 'logic_mtp_ee', bufferSizeKb: 128 },
    { faultPresetKey: 'adas_radar_fail', nvmTechKey: 'embedded_flash', bufferSizeKb: 256 },
    { faultPresetKey: 'bms_thermal_runaway', nvmTechKey: 'antifuse_otp', bufferSizeKb: 512 },
    { arraySize: 128, deviceKey: 'reram', adcBits: 4, freqMHz: 50 },
    { arraySize: 512, deviceKey: 'mram', adcBits: 8, freqMHz: 200 },
    { width: 1920, height: 1080, planes: 3, binSize: 4, bitsPerChannel: 8 },
    { width: 3840, height: 2160, planes: 4, binSize: 2, bitsPerChannel: 10 },
  ];

  for (const { name, fn } of allCalculators) {
    for (const cfg of suite12Configs) {
      try {
        const res = fn(cfg);
        assert.ok(res !== undefined, `${name} 必須安全處理 Suite 12 邊界條件`);
        checkNoNaN(res, `${name}_Suite12`);
      } catch (err) {
        assert.fail(`${name} 處理 Suite 12 邊界條件時失敗：${err.message}`);
      }
    }
  }
});

test('物理計算器：Suite 13－超低功耗 IoT 節點能耗折衝與 PQC 信任根預算極限', () => {
  const suite13Configs = [
    { profileId: 'tiered_antifuse', batteryId: 'cr2032', wakeIntervalSec: 1.0, activeDurationMs: 2.0 },
    { profileId: 'logic_mtp_heavy', batteryId: 'aa_lithium', wakeIntervalSec: 60.0, activeDurationMs: 10.0 },
    { dsaId: 'ml_dsa_65', kemId: 'ml_kem_768', certDepth: 2, keySlots: 4, rollbackBits: 128 },
    { dsaId: 'slh_dsa_128s', kemId: null, pubKeyMode: 'hash', certDepth: 1, keySlots: 2, pufHelperBytes: 512 },
    { dsaId: 'ml_dsa_87', kemId: 'ml_kem_1024', includeClassical: true, includeStatefulHash: true, keySlots: 8 },
  ];

  for (const { name, fn } of allCalculators) {
    for (const cfg of suite13Configs) {
      try {
        const res = fn(cfg);
        assert.ok(res !== undefined, `${name} 必須安全處理 Suite 13 邊界條件`);
        checkNoNaN(res, `${name}_Suite13`);
      } catch (err) {
        assert.fail(`${name} 處理 Suite 13 邊界條件時失敗：${err.message}`);
      }
    }
  }
});

test('物理計算器：Suite 14－先進封裝異質整合、深低溫量子與極限輻射硬化極限壓力測試', () => {
  const suite14Configs = [
    // 先進封裝與背面供電 (BSPDN, Hetero Chiplet, Nanosheet)
    { interconnectPitchUm: 0.5, powerDensityWcm2: 150.0, layerCount: 4, dieThicknessUm: 20 },
    { interconnectPitchUm: 35.0, powerDensityWcm2: 5.0, layerCount: 16, dieThicknessUm: 150 },
    { bspdnResistanceMohm: 0.05, irDropTargetMv: 5.0, nanosheetWidthNm: 12.0, nanosheetCount: 3 },
    // 深低溫量子與深太空 (Cryo Qubit Readout, Deep Space SEL)
    { temperatureKelvin: 0.015, qubitCount: 128, readoutFrequencyGhz: 6.5, magneticFieldTesla: 0.0 },
    { temperatureKelvin: 4.2, qubitCount: 1024, readoutFrequencyGhz: 8.0, magneticFieldTesla: 2.5 },
    { missionYears: 25.0, heavyIonFluxCm2: 1e8, tidDoseKrad: 2500.0, temperatureKelvin: 40.0 },
    // 後量子密碼硬體信任根 (PQC Key Storage, RoT DPA Defense)
    { algoKey: 'ml_kem_1024', mediaKey: 'antifuse_append_log', customUpdateCycles: 1e6, customArrayCapacityKb: 256 },
    { algoKey: 'slh_dsa_256f', mediaKey: 'embedded_flash_high_wear', customUpdateCycles: 50000, customArrayCapacityKb: 512 },
    { presetId: 'fips140_3_lvl4', topologyId: 'antifuse_rot_puf', customNoise: 5.0, customDiff: true, customBlinding: true },
    // 輻射硬化、超低壓次臨界與 3D 垂直 NVM (Rad-hard, Subthreshold, Vertical 3D)
    { tidDoseKrad: 5000.0, heavyIonLet: 120.0, presetKey: 'deep_space_jupiter', techKey: 'antifuse_ohmic' },
    { customVdd: 0.28, customTempC: -40.0, customCapacityKb: 128, topologyId: 'antifuse_lowvoltage' },
    { customVdd: 1.15, customTempC: 125.0, customCapacityKb: 1024, topologyId: 'sonos_lowvoltage' },
    { tierCount: 192, metalThicknessNm: 15.0, arrayLengthUm: 250.0, conductorId: 'ruthenium_ru_ald' },
    { tierCount: 16, metalThicknessNm: 40.0, arrayLengthUm: 50.0, conductorId: 'molybdenum_mo_pvd' }
  ];

  for (const { name, fn } of allCalculators) {
    for (const cfg of suite14Configs) {
      try {
        const res = fn(cfg);
        assert.ok(res !== undefined, `${name} 必須安全處理 Suite 14 邊界條件`);
        checkNoNaN(res, `${name}_Suite14`);
      } catch (err) {
        assert.fail(`${name} 處理 Suite 14 邊界條件時失敗：${err.message}`);
      }
    }
  }
});

// Suite 15: CPO 矽光子熱漂移、CXL 延遲階層化、CiM 精度衰退與常關閉採集極限壓力測試
test('Suite 15: CPO 矽光子熱漂移、CXL 延遲階層化、CiM 精度衰退與常關閉採集極限壓力測試', () => {
  const suite15Configs = [
    // 1. CPO 矽光子熱漂移與微環失諧極限 (CPO SiPh Wavelength Detuning & Laser Power)
    { presetKey: 'switch_51t_cpo', techKey: 'antifuse_nonvolatile_trim', tempC: -40.0, wavelengthShiftPm: -500.0 },
    { presetKey: 'switch_102t_cpo', techKey: 'thermal_heater_dac', tempC: 150.0, wavelengthShiftPm: 600.0 },
    { presetKey: 'switch_51t_cpo', techKey: '__proto__', tempC: 85.0, wavelengthShiftPm: 0.0 },

    // 2. CXL 記憶體池化階層延遲與頻寬極限 (CXL Memory Pooling Tiered Latency & Bandwidth)
    { presetKey: 'ai_cluster_training', poolSizeTb: 128.0, hotHitRatioPct: 99.9, switchLatencyNs: 35.0 },
    { presetKey: 'in_memory_db_hana', poolSizeTb: 2.0, hotHitRatioPct: 0.1, switchLatencyNs: 120.0 },
    { presetKey: '__proto__', poolSizeTb: 16.0, hotHitRatioPct: 80.0, switchLatencyNs: 65.0 },

    // 3. CiM 類神經推論精度衰退與 ADC 量化雜訊 (CiM NN Accuracy Degradation & Quantization)
    { workloadKey: 'resnet50_imagenet', deviceKey: 'reram_oxram_mlc', adcResolutionBits: 4, retentionHours: 1.0, temperatureC: -40.0 },
    { workloadKey: 'bert_base_nlp', deviceKey: 'pcm_gst_phase_change', adcResolutionBits: 8, retentionHours: 100000.0, temperatureC: 150.0 },
    { workloadKey: 'llama3_edge_7b', deviceKey: '__proto__', adcResolutionBits: 6, retentionHours: 87600.0, temperatureC: 85.0 },

    // 4. 常關閉物聯網能量採集微平衡 (Normally-Off Energy Harvesting Balance)
    { sourceKey: 'indoor_solar_100lux', memoryKey: 'antifuse_normally_off', customCapacitorUf: 220.0, customDutyCyclePct: 0.001 },
    { sourceKey: 'rf_wireless_1m', memoryKey: 'eflash_charge_pump', customCapacitorUf: 10.0, customDutyCyclePct: 50.0 },
    { sourceKey: '__proto__', memoryKey: '__proto__', customCapacitorUf: 47.0, customDutyCyclePct: 1.0 },

    // 5. 深低溫量子 CMOS 與高能重離子防禦 (Cryo-CMOS & Radhard First Principles)
    { presetKey: 'cryo_dilution_fridge_4k', techKey: 'antifuse_ohmic_filament', customTempK: 0.05, readBiasMv: 1200.0 },
    { presetKey: 'cryo_space_deep_orbit', techKey: 'ferroelectric_fet', customTempK: 350.0, readBiasMv: 50.0 },
    { presetId: 'quantum_cryo_4k', topologyId: 'antifuse_radhard', customTempK: 4.2, customTidKrad: 5000.0, customLet: 100.0 },
    { presetId: '__proto__', topologyId: '__proto__', customTempK: 77.0, customTidKrad: 100.0, customLet: 30.0 },

    // 6. 側信道洩漏與抗 DPA/CPA 防禦評估 (DPA/CPA Side-Channel Leakage & MTD)
    { presetKey: 'fpga_unprotected_aes', defenseKey: 'none_single_ended', noiseStd: 0.1, sampleRateGsps: 0.2 },
    { presetKey: 'asic_masked_dual_rail', defenseKey: 'shuffling_jitter', noiseStd: 10.0, sampleRateGsps: 20.0 },
    { presetKey: '__proto__', defenseKey: '__proto__', noiseStd: 1.0, sampleRateGsps: 2.5 },

    // 7. 晶圓製造成本與生命週期 TCO 經濟學 (Wafer Cost & TCO Foundry Economics)
    { processId: '28nm_hpc', envmId: 'antifuse_logic', dieAreaMm2: 1.0, annualWaferVolume: 500 },
    { processId: '16nm_finfet', envmId: 'mram_spin_torque', dieAreaMm2: 200.0, annualWaferVolume: 500000 },
    { processId: '__proto__', envmId: '__proto__', dieAreaMm2: 25.0, annualWaferVolume: 30000 }
  ];

  for (const { name, fn } of allCalculators) {
    for (const cfg of suite15Configs) {
      try {
        const res = fn(cfg);
        assert.ok(res !== undefined, `${name} 必須安全處理 Suite 15 邊界條件`);
        checkNoNaN(res, `${name}_Suite15`);
      } catch (err) {
        assert.fail(`${name} 處理 Suite 15 邊界條件時失敗：${err.message}`);
      }
    }
  }
});





// Suite 16: 先進 GAA 微縮、車用負載突波、極端溫度外插與 Chiplet 異質互連壓力測試
test('Suite 16: 先進 GAA 微縮、車用負載突波、極端溫度外插與 Chiplet 異質互連壓力測試', () => {
  const suite16Configs = [
    // 1. 先進 FinFET / GAA 奈米片電場突波與極端薄膜
    { nodeId: 'tsmc_n3_gaa', appliedVolt: 8.5, tempC: 175.0 },
    { nodeId: 'planar_28hpc', appliedVolt: 0.4, tempC: -40.0 },
    { nodeId: '__proto__', appliedVolt: 12.0, tempC: 250.0 },

    // 2. 先進封裝 PDK D2D 互連與高散熱壓力
    { presetId: 'tsmc_soic_x_3d', traceLengthMm: 50.0, diePowerWatts: 2000.0, dataRateGbps: 64.0 },
    { presetId: 'intel_foveros_direct', traceLengthMm: 0.1, diePowerWatts: 10.0, dataRateGbps: 0.5 },
    { presetId: '__proto__', traceLengthMm: 120.0, diePowerWatts: 5000.0, dataRateGbps: 128.0 },

    // 3. 車規 ISO 16750-2 負載突波鉗位極限
    { pulseKey: 'iso16750_pulse5a_unsuppressed', topologyKey: 'active_fet_surge_stopper', temperatureC: 175, clampLimitV: 65.0 },
    { pulseKey: 'iso7637_pulse5b_clamped', topologyKey: 'hybrid_multistage', temperatureC: -40, clampLimitV: 14.0 },
    { pulseKey: '__proto__', topologyKey: '__proto__', temperatureC: 220, clampLimitV: 80.0 },

    // 4. 800V SiC/GaN 牽引高溫活化能極限外插
    { junctionTemp: 250.0, tech: 'antifuse' },
    { junctionTemp: -40.0, tech: 'mram' },
    { junctionTemp: 300.0, tech: '__proto__' },

    // 5. UCIe 32 GT/s Chiplet 異質互連與熱應力
    { topologyKey: 'chiplet_ucie_advanced', roleKey: 'ai_weight_table', computePowerWatts: 250.0, ambientTempC: 105.0, busWidthLanes: 64 },
    { topologyKey: 'base_die_3d_stack', roleKey: 'secure_boot_rot', computePowerWatts: 5.0, ambientTempC: -40.0, busWidthLanes: 4 },
    { topologyKey: '__proto__', roleKey: '__proto__', computePowerWatts: 500.0, ambientTempC: 150.0, busWidthLanes: 128 },

    // 6. 金星登陸器 460°C 極限保持與重離子 SEL 注入
    { presetId: 'venus_lander_460c', techId: 'sic_widebandgap_envm', targetTempC: 500.0, peakLetMev: 120.0, missionYears: 20.0 },
    { presetId: 'jupiter_icy_moons', techId: 'antifuse_soi_radhard', targetTempC: -150.0, peakLetMev: 15.0, missionYears: 0.1 },
    { presetId: '__proto__', techId: '__proto__', targetTempC: 600.0, peakLetMev: 200.0, missionYears: 100.0 }
  ];

  for (const { name, fn } of allCalculators) {
    for (const cfg of suite16Configs) {
      try {
        const res = fn(cfg);
        assert.ok(res !== undefined, `${name} 必須安全處理 Suite 16 邊界條件`);
        checkNoNaN(res, `${name}_Suite16`);
      } catch (err) {
        assert.fail(`${name} 處理 Suite 16 邊界條件時失敗：${err.message}`);
      }
    }
  }
});
// 混合輸入防護不能代替模型契約；本案以具名有效輸入確認實際路徑。
test('CPO 契約：有效預設、溫度響應與非法鍵回退', () => {
  const heater = calculateCpoSiphMetrics({presetId: 'ai_accelerator_oio', techId: 'active_thermal_heater', ambientTempC: 85, laserPowerMw: 60, channelCount: 32});
  assert.equal(heater.preset.id, 'ai_accelerator_oio');
  assert.equal(heater.tech.id, 'active_thermal_heater');
  assert.equal(heater.actualTechPowerTotalW, heater.baselineHeaterPowerTotalW);
  assert.equal(heater.savedTuningPowerW, 0);
  assert.equal(heater.powerSavingsPercent, 0);
  const base = {presetId: 'hyperscale_cpo_51t', techId: 'antifuse_zero_static', laserPowerMw: 100, channelCount: 64};
  const cool = calculateCpoSiphMetrics({...base, ambientTempC: 85});
  const hot = calculateCpoSiphMetrics({...base, ambientTempC: 105});
  assert.ok(Math.abs(hot.junctionTempC - cool.junctionTempC - 20) < 1e-9);
  assert.equal(hot.deltaT, cool.deltaT);
  assert.equal(hot.wavelengthDriftNm, cool.wavelengthDriftNm);
  assert.ok(hot.accelerationFactor > cool.accelerationFactor);
  assert.ok(hot.estimatedRetentionYears < cool.estimatedRetentionYears);
  for (const key of ['__proto__', 'constructor', '不存在的預設']) {
    assert.deepEqual(calculateCpoSiphMetrics({...base, presetId: key, techId: key, ambientTempC: 85}), cool);
  }
});

// Null-Safety Suite: 驗證所有 50 款物理計算器在接受 null 參數時能安全優雅降級，絕不崩潰且不輸出 NaN/Infinity
test('Physical Calculators: Null Argument Robustness (All 50 Calculators)', () => {
  for (const { name, fn } of allCalculators) {
    let res;
    try {
      res = fn(null);
    } catch (err) {
      assert.fail(`${name}(null) threw an exception: ${err.message}`);
    }
    assert.ok(res !== undefined, `${name}(null) must return a valid result`);
    checkNoNaN(res, `${name}_null`);
  }
});

// Suite 17: 類腦神經形態 CiM、650V/800V DESAT、深低溫量子與 CXL 記憶體池化壓力測試
test('Suite 17: 類腦神經形態 CiM、650V/800V DESAT、深低溫量子與 CXL 記憶體池化壓力測試', () => {
  const suite17Configs = [
    // 1. 類腦神經形態 (Neuromorphic) CiM 與類比 MAC 突波
    { arrayRows: 1024, arrayCols: 1024, cellBits: 4, inputBits: 8, vReadMv: 200, driftCoeff: 0.15, tempC: 125.0 },
    { arrayRows: 64, arrayCols: 64, cellBits: 1, inputBits: 1, vReadMv: 50, driftCoeff: 0.001, tempC: -40.0 },
    { arrayRows: 2048, arrayCols: 2048, cellBits: 8, inputBits: 16, vReadMv: 500, driftCoeff: 0.5, tempC: 175.0 },
    { arrayRows: '__proto__', arrayCols: '__proto__', cellBits: '__proto__', inputBits: '__proto__' },

    // 2. 650V/800V DESAT 去飽和保護與 SiC/GaN 牽引負載突波
    { vBusNominalV: 800, vClampV: 1200, iPeakA: 600, desatBlankingNs: 250, rSenseOhm: 0.05, tempC: 175.0 },
    { vBusNominalV: 400, vClampV: 650, iPeakA: 200, desatBlankingNs: 100, rSenseOhm: 0.01, tempC: -40.0 },
    { vBusNominalV: 1200, vClampV: 1800, iPeakA: 1500, desatBlankingNs: 500, rSenseOhm: 0.1, tempC: 220.0 },
    { vBusNominalV: '__proto__', vClampV: '__proto__', iPeakA: '__proto__' },

    // 3. 深低溫稀釋冷凍機 (10mK-4K) 量子位元讀出與微波共振腔熱噪聲
    { readoutTempK: 0.015, freqGhz: 7.5, photonNumber: 10, ampNoiseTempK: 2.5, integrationTimeNs: 800 },
    { readoutTempK: 4.2, freqGhz: 4.0, photonNumber: 1, ampNoiseTempK: 8.0, integrationTimeNs: 2000 },
    { readoutTempK: 77.0, freqGhz: 10.0, photonNumber: 50, ampNoiseTempK: 30.0, integrationTimeNs: 200 },
    { readoutTempK: '__proto__', freqGhz: '__proto__', photonNumber: '__proto__' },

    // 4. CXL 3.1 記憶體池化 (Multi-Host Pooling) 延遲飽和與熱點命中轉移
    { poolNodes: 16, hostCount: 8, memTech: 'ddr5_optane_cxl', poolCapacityTb: 64, hitRatioPct: 98.5, fabricOverheadNs: 28 },
    { poolNodes: 2, hostCount: 1, memTech: 'nvm_storage_class', poolCapacityTb: 4, hitRatioPct: 5.0, fabricOverheadNs: 120 },
    { poolNodes: 64, hostCount: 32, memTech: 'hbm_hybrid_cxl', poolCapacityTb: 256, hitRatioPct: 85.0, fabricOverheadNs: 45 },
    { poolNodes: '__proto__', hostCount: '__proto__', memTech: '__proto__' },

    // 5. 原型鏈防禦與非預期資料型別混淆 (Fuzzing / Defensive Regression)
    { presetId: 'constructor', techId: 'prototype', faultPresetKey: 'valueOf', deviceKey: 'toString' },
    { presetId: null, techId: null, faultPresetKey: null, deviceKey: null, junctionTemp: null }
  ];

  for (const { name, fn } of allCalculators) {
    for (const cfg of suite17Configs) {
      try {
        const res = fn(cfg);
        assert.ok(res !== undefined, `${name} 必須安全處理 Suite 17 邊界條件`);
        checkNoNaN(res, `${name}_Suite17`);
      } catch (err) {
        assert.fail(`${name} 處理 Suite 17 邊界條件時失敗：${err.message}`);
      }
    }
  }
});

test('Suite 18: 全譜系 IP 決策、2nm GAA 量子穿隧、BSPDN 熱阻、次閾值 SER 與 800V EV BMS 整合壓力測試', () => {
  // 1. Macro Overhead & Dilution stress
  const macroRes = calculateMacroOverhead({ tech: 'antifuse', node: '2nm', capacityKb: 64 });
  assert.equal(macroRes.tech, 'antifuse');
  assert(macroRes.macroAreaMm2 > 0);
  assert(macroRes.dilutionPercent > 0 && macroRes.dilutionPercent < 100);

  // 2. ATE Test Cost stress
  const ateRes = calculateAteTestCost({ tech: 'antifuse', bitsToProgram: 4096, gangSites: 8 });
  assert(ateRes.testTimeSecPerDie > 0);
  assert(ateRes.costSavingsUsd >= 0);

  // 3. Arrhenius AEC-Q100 thermal stress
  const arrRes = calculateArrheniusRetention({ tech: 'antifuse', junctionTempC: 175 });
  assert(arrRes.projectedRetentionYrs >= 15);
  assert.equal(arrRes.smtReflowImmunity, true);

  // 4. 2nm GAA Nanosheet tunneling stress
  const gaaRes = calculateGaaTunneling({ numSheets: 4, sheetWidthNm: 40, sheetThicknessNm: 5, eotNm: 0.7 });
  assert.equal(gaaRes.totalWeffNm, 360);
  assert(gaaRes.quantumConfinementShiftEv > 0);
  assert(gaaRes.subthresholdSwingMvDec >= 60);

  // 5. BSPDN Thermal bottleneck stress
  const bspdnRes = calculateBspdnThermalImpact({ diePowerDensityWcm2: 180, substrateThicknessUm: 12, ntsvPitchNm: 150 });
  assert(bspdnRes.deltaTHotspotC > 0);
  assert(bspdnRes.retentionAccelerationFactor > 1.0);

  // 6. IoT Subthreshold SER stress
  const serRes = calculateSubthresholdSer({ tech: 'antifuse', vddVolts: 0.45, tempC: 85 });
  assert(serRes.ireadNa > 0);
  assert(serRes.serFitPerMbit < 1.0);
  assert.equal(serRes.alphaImmunity, true);

  // 7. 800V EV BMS CMTI & Crash journal stress
  const bmsRes = calculateEvBmsLogging({ tech: 'antifuse', packVoltageVolts: 800, sicDvDtKvUs: 180, snapshotBytes: 128 });
  assert(bmsRes.dispCurrentMa > 0);
  assert(bmsRes.cmtiMarginRatio > 1.0);
  assert(bmsRes.emergencyFreezeLatencyMs <= 2.0);
  assert.equal(bmsRes.asilDQualified, true);
});

test('Suite 19: AI Chiplet UCIe 2.0 互連能耗、深低溫量子 FJJ NVM、PQC LFI 抗雷射注入與 CPO 矽光微調整合壓力測試', () => {
  // 1. AI Chiplet UCIe 1.1/2.0 Interconnect
  const ucieRes = calculateUcieInterconnect({ packageType: 'advanced_cowos', traceLengthMm: 2.0, dataRateGbps: 16.0, laneCount: 64 });
  assert.equal(ucieRes.packageKey, 'advanced_cowos');
  assert(ucieRes.totalBandwidthGBps > 0);
  assert(ucieRes.interconnectEnergyPjPerBit > 0);
  assert(ucieRes.nmcEnergySavingsRatio > 10.0);
  assert.ok(ucieRes.summaryZh.length > 10);
  assert.ok(ucieRes.summaryEn.length > 10);

  // 2. Cryogenic Superconducting Qubit FJJ NVM
  const cryoRes = calculateCryoSuperconductingNvm({ materialType: 'nb_alox_fjj', temperatureKelvin: 0.020, microwaveReadFreqGhz: 6.5 });
  assert.equal(cryoRes.materialKey, 'nb_alox_fjj');
  assert(cryoRes.criticalCurrentMicroAmp > 0);
  assert(cryoRes.switchingEnergyAttoJoule > 0);
  assert(cryoRes.qndFidelityPercent >= 99.0);
  assert.ok(cryoRes.summaryZh.length > 10);
  assert.ok(cryoRes.summaryEn.length > 10);

  // 3. PQC LFI Laser Fault Injection Resistance
  const lfiRes = calculatePqcLfiResistance({ shieldType: 'hardened_antifuse_shield', laserPulseEnergyNj: 0.50, pulseDurationPs: 400 });
  assert.equal(lfiRes.shieldKey, 'hardened_antifuse_shield');
  assert(lfiRes.effectiveIncidentEnergyNj > 0);
  assert(lfiRes.lfiUpsetProbabilityPercent < 1.0);
  assert(lfiRes.securityMarginDb > 0);
  assert(lfiRes.activeZeroizationNs <= 100.0);
  assert.ok(lfiRes.summaryZh.length > 10);
  assert.ok(lfiRes.summaryEn.length > 10);

  // 4. CPO Silicon Photonics Thermal Drift & NVM LUT Trimming
  const cpoRes = calculateCpoPhotonicTuning({ photonicPlatform: 'dwdm_o_band', deltaTempC: 35.0, nvmDacResolutionBits: 10 });
  assert.equal(cpoRes.cpoKey, 'dwdm_o_band');
  assert(cpoRes.rawWavelengthDriftNm > 0);
  assert(cpoRes.tuningPowerPerChannelMw > 0);
  assert(cpoRes.residualWavelengthErrorPm < 1.0);
  assert(cpoRes.opticalCrossTalkDb < -25);
  assert.ok(cpoRes.summaryZh.length > 10);
  assert.ok(cpoRes.summaryEn.length > 10);
});
