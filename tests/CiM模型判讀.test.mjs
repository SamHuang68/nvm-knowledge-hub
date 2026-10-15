import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import * as analog from '../cim-analog-mac-simulator.js';
import * as neural from '../cim-nn-accuracy-degradation-simulator.js';
import * as neuro from '../cim-neuromorphic-mac-simulator.js';

const root = path.resolve(import.meta.dirname, '..');
const baseline = 'dbb8d92ebe20d04535abfc615779e1092e31466c';
const definitions = [
  ['cim-analog-mac-simulator.js', analog, 'calculateCimAnalogMac', 'CIM_WORKLOAD_PRESETS', 'CIM_DEVICE_ARCHITECTURES'],
  ['cim-nn-accuracy-degradation-simulator.js', neural, 'calculateCimNnDegradation', 'CIM_NN_WORKLOAD_PRESETS', 'CIM_DEVICE_TECHNOLOGIES'],
  ['cim-neuromorphic-mac-simulator.js', neuro, 'calculateCimMacMetrics', 'CIM_SYSTEM_PRESETS', 'CIM_MEMORY_MEDIA']
];
const numeric = value => {
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([,v]) => v && typeof v === 'object' || ['number','boolean'].includes(typeof v))
    .map(([key,v]) => [key,numeric(v)]));
};

test('CiM 能效單位：每 MAC 兩次運算，fJ 轉 TOPS/W', () => {
  // 既有參數的能量預算，與「每秒運算數 / 每秒耗能」獨立換算核對。
  // 這是量綱驗證，不是晶片能量校準；ADC、配線及單元係數維持原值。
  const cases = [
    [{workloadKey:'resnet50_imagenet',deviceKey:'reram_oxram_mlc',adcResolutionBits:6}, 27.22],
    [{workloadKey:'kws_tinyml_bnn',deviceKey:'sram_charge_domain',adcResolutionBits:4}, 14.42],
    [{workloadKey:'vit_base_patch16',deviceKey:'pcm_analog_synapse',adcResolutionBits:8}, 46.16]
  ];
  for (const [config,energyFjPerMac] of cases) for (const macsPerSecond of [1e9, 2e9]) {
    const watts = macsPerSecond * energyFjPerMac * 1e-15;
    const expected = Number(((macsPerSecond * 2 / 1e12) / watts).toFixed(1));
    assert.equal(neural.calculateCimNnDegradation(config).energyEfficiencyTopsPerWatt, expected);
  }
});

test('CiM 判讀改版：保留預設、輸出契約與既有數值', async () => {
  let count = 0;
  for (const [file,current,calculate,presets,media] of definitions) {
    const source = execFileSync('git', ['show', `${baseline}:${file}`], {cwd:root,encoding:'utf8'});
    const original = source.replace(/from ['"](.\/[^'"]+)['"]/g, (_,relative) => `from '${pathToFileURL(path.join(root,relative)).href}'`);
    const old = await import('data:text/javascript;base64,' + Buffer.from(original).toString('base64'));
    assert.deepEqual(Object.keys(current), Object.keys(old), '公開匯出保留');
    for (const registry of [presets,media]) {
      assert.deepEqual(Object.keys(current[registry]), Object.keys(old[registry]), '預設選項保留');
      assert.deepEqual(numeric(current[registry]), numeric(old[registry]), '預設數值與係數保留');
    }
    const keys = Object.keys(current[presets]), devices = Object.keys(current[media]);
    for (let index = 0; index < keys.length; index++) {
      const config = calculate === 'calculateCimMacMetrics'
        ? {presetKey:keys[index],mediaKey:devices[index % devices.length],wireResistanceOhm:2.7,adcResolutionBits:index % 2 ? 4 : 8,driftTimeHours:5101}
        : {workloadKey:keys[index],deviceKey:devices[index % devices.length],nominalAdcBits:index % 2 ? 4 : 8,adcResolutionBits:index % 2 ? 4 : 8,retentionHours:5101,temperatureC:105};
      const actual = current[calculate](config), previous = old[calculate](config);
      assert.deepEqual(Object.keys(actual), Object.keys(previous), '回傳欄位保留');
      const a = numeric(actual), b = numeric(previous);
      if (calculate === 'calculateCimNnDegradation') {
        // 唯一批准修正：原 fJ→TOPS/W 單位錯誤，由上方獨立量綱案例驗證。
        delete a.energyEfficiencyTopsPerWatt;
        delete b.energyEfficiencyTopsPerWatt;
      }
      assert.deepEqual(a,b,'判讀文字更新不得改變其他數值或門檻');
      count++;
    }
    const csvLines = text => text.split(/\r?\n/).filter(line => /(?:csvContent|csv)\s*(?:\+?=)|const header\s*=/.test(line));
    assert.deepEqual(csvLines(fs.readFileSync(path.join(root,file),'utf8')),csvLines(source),'既有 CSV 欄名與資料列公式保留');
  }
  assert.equal(count,12);
});
