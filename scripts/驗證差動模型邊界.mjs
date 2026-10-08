import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {calculateDifferentialSensing, DIFF_SENSING_PRESETS, SENSING_ARCHITECTURES} from '../differential-sensing-simulator.js';
import {startTestServer} from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'qa', '持續收斂-差動模型');
fs.mkdirSync(output, {recursive: true});
const results = [];
function record(name, verify) {
  try {verify(); results.push({項目: name,通過: true});}
  catch (error) {results.push({項目: name,通過: false,原因: error.message});}
}
for (const preset of Object.values(DIFF_SENSING_PRESETS)) {
  for (const arch of Object.values(SENSING_ARCHITECTURES)) {
    record(`${preset.id}／${arch.id} 基準溫度`, () => {
      const value = calculateDifferentialSensing({presetId: preset.id,archId: arch.id});
      assert.equal(value.leakageReferenceTempC, preset.tempC);
      assert.ok(Math.abs(value.ileakUa - preset.ileakBaseNa / 1000) <= 0.0005);
      assert.ok(value.modelValid && value.deltaVsenseMv > 0);
      assert.ok(value.firstOrderDeltaI >= 0);
    });
  }
}
record('升溫沿用原示意倍率', () => {
  assert.equal(calculateDifferentialSensing({tempC: 160}).ileakUa, 0.083);
});
record('降溫可低於基準漏電', () => {
  assert.equal(calculateDifferentialSensing({tempC: 140}).ileakUa, 0.024);
});
for (const arch of Object.values(SENSING_ARCHITECTURES)) {
  record(`${arch.id} 漏電超限不偽造正裕度`, () => {
    const value = calculateDifferentialSensing({presetId: 'banking_smartcard_40nm',archId: arch.id,tempC: 250});
    assert.equal(value.modelValid, false);
    assert.equal(value.deltaIsenseUa, 0);
    assert.equal(value.deltaVsenseMv, 0);
    assert.ok(value.firstOrderDeltaI >= 0);
  });
}
const server = await startTestServer(root);
const browser = await chromium.launch({channel: 'msedge'});
try {
  for (const language of ['zh','en']) for (const width of [320,1440]) {
    const name = `${language}／${width}px 操作與模型標示`;
    const context = await browser.newContext({serviceWorkers: 'block',viewport: {width,height: 1000},reducedMotion: 'reduce'});
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(server.base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(new URL(`memory-physics.html?lang=${language}#differential-sensing-root`,server.base).href,{waitUntil: 'load'});
      const panel = page.locator('#differential-sensing-root');
      await panel.scrollIntoViewIfNeeded();
      assert.ok((await page.locator('#diff-verdict').innerText()).includes(language === 'zh' ? '不能預測金鑰還原' : 'does not predict key recovery'));
      assert.ok((await page.locator('#diff-mtd-traces').innerText()).includes(language === 'zh' ? '示意曲線' : 'Illustrative Traces'));
      for (const arch of Object.keys(SENSING_ARCHITECTURES)) {
        await page.locator('#diff-arch-select').selectOption(arch);
        assert.ok(parseFloat(await page.locator('#diff-dpa-delta').innerText()) >= 0);
      }
      const controls = await panel.locator('input,select').evaluateAll(nodes => nodes.map(node => ({左: node.getBoundingClientRect().left,右: node.getBoundingClientRect().right})));
      assert.ok(controls.every(box => box.左 >= 0 && box.右 <= width + 1),'模型控制項完整位於視窗內');
      const panelBox = await panel.boundingBox();
      assert.ok(controls.every(box => box.左 >= panelBox.x && box.右 <= panelBox.x + panelBox.width + 1),'模型控制項位於所屬圖解容器內');
      const otherControls = await page.locator('#tddb-weibull-root').evaluate(node => {
        const box = node.getBoundingClientRect();
        return [...node.querySelectorAll('input,select')].every(control => {
          const value = control.getBoundingClientRect();
          return value.left >= box.left && value.right <= box.right + 1;
        });
      });
      assert.ok(otherControls,'同類 TDDB 圖解控制項不超出容器');
      assert.deepEqual(errors,[]);
      if (width === 320 && language === 'zh') await panel.screenshot({path: path.join(output,'差動模型-手機.png')});
      results.push({項目: name,通過: true});
    } catch (error) {results.push({項目: name,通過: false,原因: error.message});}
    finally {await context.close();}
  }
} finally {await browser.close(); await server.close();}
fs.writeFileSync(path.join(output,'驗證結果.json'),JSON.stringify({結果: results,限制: '此為示意計算與介面驗證，未進行晶片量測或側信道攻擊。'},null,2));
console.log(JSON.stringify({項目: results.length,通過: results.filter(value => value.通過).length,失敗: results.filter(value => !value.通過)},null,2));
if (results.some(value => !value.通過)) process.exitCode = 1;
