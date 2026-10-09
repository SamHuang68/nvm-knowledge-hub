import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {calculateCimMacMetrics} from '../cim-neuromorphic-mac-simulator.js';
import {calculatePqcDpaMetrics, PQC_STORAGE_TOPOLOGIES} from '../pqc-rot-dpa-simulator.js';

// 僅驗證兩個匯出事件：非預設條件、雙向語言切換及實際下載。
const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(root, process.env.NVM_QA_OUTPUT || 'qa/審查匯出修正');
fs.mkdirSync(output, {recursive: true});
const server = await startTestServer(root);
const origin = new URL(server.base).origin;
const results = [];
let browser;
let expired = false;
const deadline = setTimeout(() => { expired = true; void browser?.close(); }, 55000);
const number = (value, digits) => Number(value.toFixed(digits));
const cases = [
  {
    name: 'CiM', page: 'ai-nvm-opportunities.html', button: 'cim-neuromorphic-export-csv-btn',
    header: ['預設','介質','線阻_Ohm','ADC_位元','漂移時間_小時','吞吐量_TOPS','能效_TOPS每W','最差壓降_mV','精度保留率_pct'],
    async configure(page, lang) {
      await page.locator('#cim-preset-select').selectOption('vision_transformer_vit_patch');
      await page.locator('#cim-media-select').selectOption(lang === 'zh' ? 'stt_mram_binary_xbar' : 'analog_reram_crossbar');
      await setRange(page, '#cim-wire-slider', 2.7);
      await setRange(page, '#cim-adc-slider', 7);
      await setRange(page, '#cim-drift-slider', lang === 'zh' ? 5101 : 9101);
      const config = await page.evaluate(() => ({
        presetKey: document.querySelector('#cim-preset-select').value,
        mediaKey: document.querySelector('#cim-media-select').value,
        wireResistanceOhm: Number(document.querySelector('#cim-wire-slider').value),
        adcResolutionBits: Number(document.querySelector('#cim-adc-slider').value),
        driftTimeHours: Number(document.querySelector('#cim-drift-slider').value)
      }));
      assert.equal(config.wireResistanceOhm, 2.7, '非預設線阻必須生效');
      assert.equal(config.adcResolutionBits, 7, '非預設 ADC 必須生效');
      assert.equal(config.driftTimeHours, lang === 'zh' ? 5101 : 9101, '非預設漂移時間必須生效');
      return config;
    },
    expected(config) {
      return [0.5, 1.5, 3, 5].flatMap(wireResistanceOhm => [4, 6, 8].map(adcResolutionBits => {
        const m = calculateCimMacMetrics({...config, wireResistanceOhm, adcResolutionBits});
        assert.equal(m.media.id, config.mediaKey, '計算器必須使用選取介質');
        assert.equal(m.driftHours, config.driftTimeHours, '計算器必須使用目前漂移時間');
        return [m.preset.id, m.media.id, wireResistanceOhm, adcResolutionBits, config.driftTimeHours,
          number(m.throughputTops, 2), number(m.energyEfficiencyTopsPerWatt, 2), number(m.worstCaseIrDropMv, 2), number(m.retainedAccuracyPct, 2)];
      }));
    },
    filename: c => `CiM_線阻與ADC掃描_${c.presetKey}_${c.mediaKey}_漂移${c.driftTimeHours}小時.csv`
  },
  {
    name: 'PQC', page: 'security-assurance.html', button: 'pqc-export-csv-btn',
    header: ['預設','拓撲','差動感測','電流遮蔽','時脈抖動','雜訊標準差','MTD','最高相關係數','內部位元錯誤率_pct','安全分數'],
    async configure(page, lang) {
      const enabled = lang === 'zh';
      await page.locator('#pqc-preset-select').selectOption('iot_commercial_secure');
      await page.locator('#pqc-topology-select').selectOption('sram_puf_helper');
      await page.locator('#pqc-diff-check').setChecked(enabled);
      await page.locator('#pqc-blinding-check').setChecked(!enabled);
      await page.locator('#pqc-jitter-check').setChecked(enabled);
      await setRange(page, '#pqc-noise-slider', enabled ? 2.3 : 6.7);
      const config = await page.evaluate(() => ({
        presetId: document.querySelector('#pqc-preset-select').value,
        topologyId: document.querySelector('#pqc-topology-select').value,
        customDiff: document.querySelector('#pqc-diff-check').checked,
        customBlinding: document.querySelector('#pqc-blinding-check').checked,
        customJitter: document.querySelector('#pqc-jitter-check').checked,
        customNoise: Number(document.querySelector('#pqc-noise-slider').value)
      }));
      assert.deepEqual(config, {presetId: 'iot_commercial_secure', topologyId: 'sram_puf_helper',
        customDiff: enabled, customBlinding: !enabled, customJitter: enabled, customNoise: enabled ? 2.3 : 6.7}, '自訂防護條件必須生效');
      return config;
    },
    expected(config) {
      return Object.keys(PQC_STORAGE_TOPOLOGIES).map(topologyId => {
        const m = calculatePqcDpaMetrics({...config, topologyId});
        return [m.preset.id, topologyId, Number(m.diffSensing), Number(m.blinding), Number(m.jitter),
          number(m.noiseSigma, 1), m.mtd, number(m.rhoMax, 4), number(m.intraBerPercent, 4), m.securityScore];
      });
    },
    filename: c => `PQC_全部拓撲掃描_目前自訂防護_${c.presetId}.csv`
  }
];
async function setRange(page, selector, value) {
  await page.locator(selector).evaluate((element, next) => {
    element.value = String(next);
    element.dispatchEvent(new Event('input', {bubbles: true}));
  }, value);
}
try {
  browser = await chromium.launch({headless: true, ...(process.env.NVM_QA_BROWSER === 'chromium' ? {} : {channel: 'msedge'})});
  for (const item of cases) for (const initialLang of ['zh', 'en']) {
    assert.equal(expired, false, '超過 55 秒驗證上限');
    const context = await browser.newContext({serviceWorkers: 'block', viewport: {width: initialLang === 'zh' ? 390 : 1440, height: 900}});
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(7000);
    page.setDefaultNavigationTimeout(10000);
    try {
      await page.goto(`${server.base}${item.page}?lang=${initialLang}`, {waitUntil: 'domcontentloaded'});
      const button = page.locator(`#${item.button}`);
      assert.match(await button.innerText(), initialLang === 'zh' ? /匯出/ : /Export/, '初始語言必須正確');
      const config = await item.configure(page, initialLang);
      await page.locator('#languageToggle').click();
      assert.match(await button.innerText(), initialLang === 'zh' ? /Export/ : /匯出/, '匯出按鈕必須跟隨語言切換');
      await button.scrollIntoViewIfNeeded();
      const geometry = await button.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return {左界: rect.left, 右界: rect.right, 按鈕寬度: rect.width,
          可視寬度: document.documentElement.clientWidth,
          文件寬度: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)};
      });
      assert.ok(geometry.按鈕寬度 > 0 && geometry.左界 >= 0 && geometry.右界 <= geometry.可視寬度,
        '匯出按鈕必須完整位於水平可見範圍');
      assert.ok(geometry.文件寬度 <= geometry.可視寬度, '頁面不得橫向溢位');
      await button.locator('..').screenshot({path: path.join(output, `${item.name}-${initialLang}-控制區.png`)});
      const pendingDownload = page.waitForEvent('download');
      await button.click();
      const download = await pendingDownload;
      const file = await download.path();
      assert.equal(await download.failure(), null, '實際下載不得失敗');
      assert.equal(download.suggestedFilename(), item.filename(config), '檔名必須明示掃描範圍');
      const lines = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
      assert.deepEqual(lines.shift().split(','), item.header, '匯出欄位必須符合契約');
      const rows = lines.map(line => line.split(',').map((value, index) => index < 2 ? value : Number(value)));
      assert.ok(rows.every(row => row.length === item.header.length && row.slice(2).every(Number.isFinite)), '每列必須完整且數值有限');
      assert.deepEqual(rows, item.expected(config), '全部掃描列必須符合目前條件及原計算器');
      assert.deepEqual(errors, [], '頁面不得出現未捕捉例外');
      fs.copyFileSync(file, path.join(output, `${item.name}-${initialLang}-實際下載.csv`));
      results.push({項目: `${item.name}－${initialLang}切換`, 通過: true, 列數: rows.length, 條件: config, 畫面範圍: geometry, 原下載名稱: download.suggestedFilename()});
    } catch (error) {
      results.push({項目: `${item.name}－${initialLang}切換`, 通過: false, 原因: error.message, 頁面例外: errors});
    } finally {
      await context.close();
    }
  }
} catch (error) {
  results.push({項目: '驗證環境或時間上限', 通過: false, 原因: error.message});
} finally {
  clearTimeout(deadline);
  await browser?.close();
  await server.close();
}
const report = {預期案例: 4, 通過: results.filter(result => result.通過).length, 超時: expired, 結果: results};
fs.writeFileSync(path.join(output, '審查匯出修正結果.json'), JSON.stringify(report, null, 2));
console.log(`兩工具匯出驗證：${report.通過}／${report.預期案例}`);
if (report.通過 !== 4 || expired || results.some(result => !result.通過)) process.exitCode = 1;
