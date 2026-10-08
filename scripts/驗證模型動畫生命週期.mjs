import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startTestServer } from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa', '模型動畫生命週期'));
fs.mkdirSync(output, {recursive:true});
const models = [
  {name:'穿隧', file:'tunneling-breakdown-simulator.js', page:'memory-physics.html', root:'tunneling-simulator-root', canvas:'tunneling-canvas'},
  {name:'差動感測', file:'differential-sensing-simulator.js', page:'memory-physics.html', root:'differential-sensing-root', input:'diff-temp-slider', value:'diff-temp-val'},
  {name:'低溫 NVM', file:'cryogenic-nvm-physics-simulator.js', page:'memory-physics.html', root:'cryogenic-nvm-simulator-root', canvas:'cryo-canvas', input:'cryo-bias-slider', value:'cryo-bias-val'},
  {name:'低溫 Qubit', file:'cryo-qubit-readout-simulator.js', page:'memory-physics.html', root:'cryo-qubit-simulator-root', canvas:'cryo-qubit-canvas', input:'cryo-qubit-bfield-slider', value:'cryo-qubit-bfield-val'},
  {name:'BSPDN', file:'bspdn-envm-ir-drop-simulator.js', page:'memory-physics.html', root:'bspdn-envm-simulator-root', canvas:'bspdn-canvas', input:'bspdn-current-slider', value:'bspdn-current-val'},
  {name:'Chiplet', file:'chiplet-3d-hetero-nvm-simulator.js', page:'oip-secure-storage.html', root:'chiplet-simulator-root', canvas:'chiplet-hetero-canvas', input:'chiplet-power-slider', value:'chiplet-power-val'}
];
const sources = models.map(model => {
  const source = fs.readFileSync(path.join(root, model.file), 'utf8');
  return {模型:model.name, 檔案:model.file, rAF呼叫數:(source.match(/\brequestAnimationFrame\s*\(/g) || []).length, 計時器呼叫數:(source.match(/\bset(?:Timeout|Interval)\s*\(/g) || []).length};
});
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = new URL(process.env.NVM_QA_BASE || server.base);
const channel = process.env.NVM_QA_CHANNEL || 'msedge';
const browser = await chromium.launch({headless:true, ...(channel === 'chromium' ? {} : {channel})});
const results = [];

async function check(name, run, reducedMotion = 'no-preference') {
  if (process.env.NVM_QA_FILTER && !name.includes(process.env.NVM_QA_FILTER)) return;
  const context = await browser.newContext({serviceWorkers:'block', viewport:{width:1440, height:1000}, reducedMotion});
  await context.route('**/*', route => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
  await context.addInitScript(files => {
    const frames = window.__qaModelFrames = {};
    const draws = window.__qaModelDraws = {};
    const owners = new Map();
    const nativeRequest = window.requestAnimationFrame.bind(window);
    const nativeCancel = window.cancelAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => {
      const stack = new Error().stack || '';
      const file = files.find(file => stack.includes(file));
      if (!file) return nativeRequest(callback);
      const record = frames[file] ||= {scheduled:0, callbacks:0, pending:0, cancelled:0};
      record.scheduled++; record.pending++;
      const id = nativeRequest(time => {
        owners.delete(id); record.pending--; record.callbacks++;
        callback(time);
      });
      owners.set(id, record);
      return id;
    };
    window.cancelAnimationFrame = id => {
      const record = owners.get(id);
      if (record) { record.pending--; record.cancelled++; owners.delete(id); }
      return nativeCancel(id);
    };
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      draws[this.canvas.id] = (draws[this.canvas.id] || 0) + 1;
      return clear.apply(this, args);
    };
  }, models.map(model => model.file));
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    const evidence = await run(page);
    assert.deepEqual(errors, [], '沒有頁面未處理例外');
    results.push({名稱:name, 通過:true, 證據:evidence});
  } catch (error) {
    results.push({名稱:name, 通過:false, 原因:error.message, 詳細:error.stack, 頁面錯誤:errors});
    await page.screenshot({path:path.join(output, `${name}-失敗.png`)}).catch(() => {});
  } finally { await context.close(); }
}

const stats = (page, model) => page.evaluate(model => ({
  frames:window.__qaModelFrames[model.file] || {scheduled:0, callbacks:0, pending:0, cancelled:0},
  draws:model.canvas ? window.__qaModelDraws[model.canvas] || 0 : 0
}), model);
async function idle(page, model) {
  const before = await stats(page, model);
  await page.waitForTimeout(380);
  const after = await stats(page, model);
  assert.equal(after.frames.pending, 0, '沒有待執行的模型動畫');
  assert.deepEqual(after, before, '沒有持續重繪或動畫回呼');
  return after;
}

async function visit(page, model) {
  await page.goto(new URL(`${model.page}?lang=zh`, base).href, {waitUntil:'load'});
  await page.locator(`#${model.root}`).waitFor({state:'attached'});
}

const tunnel = models[0];
async function prepareTunnel(page) {
  await visit(page, tunnel);
  await page.locator('#tunneling-canvas').scrollIntoViewIfNeeded();
  await page.evaluate(() => {
    // 擷取原入口既有實例；不重建模型，也不改動公式或預設參數。
    const animate = TunnelingSimulator.prototype.animateTo;
    TunnelingSimulator.prototype.animateTo = function (...args) {
      window.__qaTunnelingInstance = this;
      return animate.apply(this, args);
    };
    document.querySelector('[data-preset="retention"]').click();
  });
  await page.waitForTimeout(320);
}
async function longTransition(page) {
  await page.locator('#tunneling-canvas').scrollIntoViewIfNeeded();
  // 使用原 class 的 duration 參數延長觀測窗口，降低跨程序時序誤差。
  await page.evaluate(() => window.__qaTunnelingInstance.animateTo(1.8, 7.5, 1500));
  await page.waitForFunction(() => window.__qaModelFrames['tunneling-breakdown-simulator.js']?.callbacks > 0);
  assert.ok((await stats(page, tunnel)).frames.pending > 0, '可見且無減少動態偏好時有實際動畫');
}
async function assertTarget(page) {
  assert.deepEqual(await page.evaluate(() => ({tox:document.getElementById('sim-tox-slider').value, vox:document.getElementById('sim-vox-slider').value})), {tox:'1.8', vox:'7.5'}, '停止轉場仍顯示原目標終值');
  assert.match(await page.locator('#sim-eox-val').innerText(), /41\.67/);
}

try {
  for (const model of models.slice(1)) await check(`${model.name}靜態生命週期`, async page => {
    assert.equal(sources.find(source => source.檔案 === model.file).rAF呼叫數, 0);
    assert.equal(sources.find(source => source.檔案 === model.file).計時器呼叫數, 0);
    await visit(page, model);
    const initial = await idle(page, model);
    await page.locator(`#${model.input}`).scrollIntoViewIfNeeded();
    const beforeValue = await page.locator(`#${model.value}`).innerText();
    await page.locator(`#${model.input}`).evaluate(element => {
      const step = Number(element.step || 1), current = Number(element.value), min = Number(element.min), max = Number(element.max);
      element.value = String(current + step <= max ? current + step : Math.max(min, current - step));
      element.dispatchEvent(new Event('input', {bubbles:true}));
    });
    assert.notEqual(await page.locator(`#${model.value}`).innerText(), beforeValue, '實際輸入仍更新既有讀出');
    const visible = await idle(page, model);
    await page.evaluate(() => window.scrollTo({top:0, behavior:'instant'}));
    const offscreen = await idle(page, model);
    await page.locator(`#${model.root}`).evaluate(element => element.style.setProperty('display', 'none', 'important'));
    const hiddenElement = await idle(page, model);
    await page.locator(`#${model.root}`).evaluate(element => element.style.removeProperty('display'));
    await page.emulateMedia({reducedMotion:'reduce'});
    const reduced = await idle(page, model);
    return {初始:initial, 可見:visible, 離開畫面:offscreen, 隱藏元件:hiddenElement, 減少動態:reduced};
  });

  await check('差動訊號條減少動態樣式', async page => {
    await visit(page, models[1]);
    await page.locator('#diff-arch-select').scrollIntoViewIfNeeded();
    await page.locator('#diff-arch-select').selectOption('single_ended');
    const durations = await page.locator('#diff-bar-bit0, #diff-bar-bit1').evaluateAll(bars => bars.map(bar => getComputedStyle(bar).transitionDuration));
    assert.ok(durations.every(duration => duration.split(',').every(value => parseFloat(value) <= 0.001)), '既有全站樣式會抑制訊號條轉場');
    await page.waitForTimeout(40);
    assert.equal(await page.locator('#diff-bar-bit0, #diff-bar-bit1').evaluateAll(bars => bars.flatMap(bar => bar.getAnimations()).filter(animation => animation.playState === 'running').length), 0);
    return {計算後轉場時間:durations};
  }, 'reduce');

  await check('穿隧可見轉場與自然完成', async page => {
    await prepareTunnel(page);
    const before = await stats(page, tunnel);
    await page.evaluate(() => document.querySelector('[data-preset="breakdown"]').click());
    await page.waitForTimeout(350);
    await assertTarget(page);
    const after = await idle(page, tunnel);
    assert.ok(after.frames.callbacks > before.frames.callbacks, '原預設轉場確實執行可見動畫');
    return after;
  });

  for (const mode of ['離開畫面', '隱藏元件', '減少動態']) await check(`穿隧轉場中${mode}`, async page => {
    await prepareTunnel(page); await longTransition(page);
    if (mode === '離開畫面') await page.evaluate(() => window.scrollTo({top:0, behavior:'instant'}));
    if (mode === '隱藏元件') await page.locator('#tunneling-simulator-root').evaluate(element => element.style.setProperty('display', 'none', 'important'));
    if (mode === '減少動態') await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(() => window.__qaModelFrames['tunneling-breakdown-simulator.js'].pending === 0);
    await assertTarget(page);
    return idle(page, tunnel);
  });

  await check('穿隧離開畫面不啟動轉場', async page => {
    await prepareTunnel(page);
    await page.evaluate(() => window.scrollTo({top:0, behavior:'instant'}));
    const before = await stats(page, tunnel);
    await page.evaluate(() => document.querySelector('[data-preset="breakdown"]').click());
    await assertTarget(page);
    const after = await idle(page, tunnel);
    assert.equal(after.frames.scheduled, before.frames.scheduled, '不可見畫布不排程動畫');
    return after;
  });

  await check('穿隧減少動態不啟動轉場', async page => {
    await prepareTunnel(page);
    const before = await stats(page, tunnel);
    await page.evaluate(() => document.querySelector('[data-preset="breakdown"]').click());
    await assertTarget(page);
    const after = await idle(page, tunnel);
    assert.equal(after.frames.scheduled, before.frames.scheduled);
    return after;
  }, 'reduce');

  await check('穿隧頁籤隱藏事件模擬', async page => {
    await prepareTunnel(page); await longTransition(page);
    // Edge headless 不提供真實分頁隱藏；此案例只驗證可見度事件分支。
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', {configurable:true, get:() => true});
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await assertTarget(page);
    const result = await idle(page, tunnel);
    await page.evaluate(() => document.querySelector('[data-preset="retention"]').click());
    assert.equal((await stats(page, tunnel)).frames.scheduled, result.frames.scheduled, '模擬隱藏頁籤不啟動新轉場');
    return {方法:'可見度事件模擬，未冒稱原生分頁隱藏', ...result};
  });
} finally {
  await browser.close(); await server?.close();
  fs.writeFileSync(path.join(output, '驗證結果.json'), JSON.stringify({瀏覽器:browser.version(), 通道:channel, 來源檢查:sources, 結果:results, 限制:['原生分頁隱藏未能由目前 Edge 自動化環境產生；頁籤隱藏分支採事件模擬。','靜態模型仍做一次初始計算，本次沒有改為延遲初始化。']}, null, 2));
}
const failures = results.filter(result => !result.通過);
console.log(`模型動畫生命週期：${results.length - failures.length}／${results.length} 通過；證據：${output}`);
for (const failure of failures) console.error(`失敗：${failure.名稱}；原因：${failure.原因}`);
if (failures.length) process.exitCode = 1;
