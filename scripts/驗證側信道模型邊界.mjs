import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {calculateDpaCpaLeakage, DPA_ATTACK_PRESETS, DPA_COUNTERMEASURE_PROFILES} from '../dpa-cpa-leakage-simulator.js';
import {startTestServer} from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'qa', '延伸收斂-側信道');
const baseline = '9d5caa86cef8cdea190fb8b0a39d2009897a08f7';
fs.mkdirSync(output, {recursive: true});
const oldCode = execFileSync('git', ['show', `${baseline}:dpa-cpa-leakage-simulator.js`], {cwd: root, encoding: 'utf8'});
const original = await import('data:text/javascript;base64,' + Buffer.from(oldCode).toString('base64'));
const results = [];
function record(name, verify) {
  try {verify(); results.push({項目: name,通過: true});}
  catch (error) {results.push({項目: name,通過: false,原因: error.message});}
}
for (const presetKey of Object.keys(DPA_ATTACK_PRESETS)) for (const defenseKey of Object.keys(DPA_COUNTERMEASURE_PROFILES)) {
  record(`${presetKey}／${defenseKey} 原始數值與評估邊界`, () => {
    const value = calculateDpaCpaLeakage({presetKey,defenseKey});
    const previous = original.calculateDpaCpaLeakage({presetKey,defenseKey});
    for (const [key,number] of Object.entries(previous).filter(([,number]) => typeof number === 'number')) assert.equal(value[key],number,key);
    assert.equal(value.illustrativeScore,value.scaEquivalentSecurityBits);
    assert.equal(value.isAvaVan5Compliant,false);
    assert.equal(value.isFips140Level3Compliant,false);
    assert.equal(value.assessmentStatus,'not-assessed');
    assert.equal(value.ccAssuranceLevel,'not-assessed');
    assert.equal(value.traceDisplayCapped,value.estimatedMtdTraces === 100000000);
  });
}
record('安全儲存原錨點、來源與全部向量圖保留', () => {
  const previous = execFileSync('git',['show',`${baseline}:secure-storage.html`],{cwd: root,encoding: 'utf8',maxBuffer: 8*1024*1024}).replace(/\r\n/g,'\n');
  const current = fs.readFileSync(path.join(root,'secure-storage.html'),'utf8').replace(/\r\n/g,'\n');
  for (const match of previous.matchAll(/\bid="([^"]+)"/g)) assert.ok(current.includes(`id="${match[1]}"`),match[1]);
  for (const match of previous.matchAll(/\bhref="([^"]+)"/g)) assert.ok(current.includes(`href="${match[1]}"`),match[1]);
  const figures = source => [...source.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map(match => match[0]);
  assert.deepEqual(figures(current),figures(previous));
});
const server = await startTestServer(root);
const browser = await chromium.launch({channel: 'msedge'});
try {
  for (const language of ['zh','en']) for (const width of [320,390,1440]) {
    const context = await browser.newContext({serviceWorkers: 'block',viewport: {width,height: 1000},reducedMotion: 'reduce'});
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(server.base).origin ? route.continue() : route.abort());
    await context.addInitScript(() => {
      window.__dpaLabels = [];
      const original = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function(text,x,y,...args) {
        if (this.canvas.id === 'dpa-canvas') window.__dpaLabels.push({text,x,y,width: this.measureText(text).width,canvasWidth: this.canvas.clientWidth,canvasHeight: this.canvas.clientHeight});
        return original.call(this,text,x,y,...args);
      };
    });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(new URL(`secure-storage.html?lang=${language}#dpa-cpa-simulator-root`,server.base).href,{waitUntil: 'load'});
      const panel = page.locator('#dpa-cpa-simulator-root');
      await panel.scrollIntoViewIfNeeded();
      for (const presetKey of Object.keys(DPA_ATTACK_PRESETS)) {
        await page.locator('#dpa-preset-select').selectOption(presetKey);
        for (const defenseKey of Object.keys(DPA_COUNTERMEASURE_PROFILES)) {
          await page.locator('#dpa-defense-select').selectOption(defenseKey);
          assert.equal(await page.locator('#dpa-out-level').innerText(),language === 'zh' ? '未評估' : 'Not assessed');
          assert.match(await page.locator('#dpa-out-bits').innerText(),language === 'zh' ? /點$/ : /pts$/);
          assert.ok((await page.locator('#dpa-out-verdict').innerText()).includes(language === 'zh' ? '不能預測實際金鑰還原' : 'do not predict actual key recovery'));
        }
      }
      await page.locator('#dpa-noise-slider').evaluate(node => {node.value = '5';node.dispatchEvent(new Event('input',{bubbles: true}));});
      await page.locator('#dpa-rate-slider').evaluate(node => {node.value = '10';node.dispatchEvent(new Event('input',{bubbles: true}));});
      assert.equal(await page.locator('#dpa-noise-slider').getAttribute('aria-valuetext'),'5x');
      assert.equal(await page.locator('#dpa-rate-slider').getAttribute('aria-valuetext'),'10 GSa/s');
      assert.ok((await page.locator('#dpa-out-verdict').innerText()).includes(language === 'zh' ? '顯示上限' : 'display cap reached'));
      for (const defenseKey of Object.keys(DPA_COUNTERMEASURE_PROFILES)) {
        await page.locator('#dpa-defense-select').selectOption(defenseKey);
        for (const mode of ['traces','wave']) {
          await page.evaluate(() => window.__dpaLabels = []);
          await page.locator(`#dpa-mode-${mode}`).click();
          const labels = await page.evaluate(() => window.__dpaLabels);
          assert.ok(labels.length > 0);
          assert.deepEqual(labels.filter(row => row.x < 0 || row.x + row.width > row.canvasWidth + 1 || row.y < 0 || row.y > row.canvasHeight),[],`畫布文字裁切：${language}／${width}／${defenseKey}／${mode}`);
          if (mode === 'wave' && defenseKey === 'boolean_mask_1st') {
            assert.ok(labels.some(row => row.text.includes(language === 'zh' ? '份額' : 'Share')));
            assert.ok(labels.every(row => !row.text.includes('I(/D)')),'遮罩份額不標示成互補實體軌');
          }
        }
      }
      const alternate = language === 'zh' ? 'en' : 'zh';
      await page.evaluate(target => window.HubLanguage.set(target),alternate);
      assert.equal(await page.locator('#dpa-out-level').innerText(),alternate === 'zh' ? '未評估' : 'Not assessed');
      assert.match(await page.locator('#dpa-out-bits').innerText(),alternate === 'zh' ? /點$/ : /pts$/);
      await page.evaluate(target => window.HubLanguage.set(target),language);
      const contained = await panel.evaluate(node => {
        const box = node.getBoundingClientRect();
        return [...node.querySelectorAll('input,select,button')].every(control => {
          const value = control.getBoundingClientRect();
          return value.left >= box.left - 1 && value.right <= box.right + 1;
        });
      });
      assert.ok(contained,'所有控制項位於所屬圖解容器內');
      assert.deepEqual(errors,[]);
      if (language === 'zh' && [320,1440].includes(width)) {
        await panel.screenshot({path: path.join(output,width === 320 ? '修正後-手機.png' : '修正後-桌面.png')});
        const chart = page.locator('#dpa-canvas');
        await chart.evaluate(node => node.scrollIntoView({block: 'center'}));
        await chart.screenshot({path: path.join(output,width === 320 ? '側信道圖例-手機.png' : '側信道圖例-桌面.png')});
      }
      results.push({項目: `${language}／${width}px 中英操作與兩種畫布`,通過: true});
    } catch (error) {results.push({項目: `${language}／${width}px 中英操作與兩種畫布`,通過: false,原因: error.message});}
    finally {await context.close();}
  }
} finally {await browser.close();await server.close();}
fs.writeFileSync(path.join(output,'驗證結果.json'),JSON.stringify({來源基準: baseline,結果: results,限制: '僅本機 Edge 與示意模型；未量測晶片、執行側信道攻擊或認證評估。'},null,2));
console.log(JSON.stringify({項目: results.length,通過: results.filter(row => row.通過).length,失敗: results.filter(row => !row.通過)},null,2));
if (results.some(row => !row.通過)) process.exitCode = 1;
