import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa/模擬備援驗證'));
fs.mkdirSync(output, { recursive: true });
const results = [];
const pageErrors = [];
let server;
let browser;
let base = process.env.NVM_QA_BASE;
const check = async (label, run) => {
  try { await run(); results.push({ label, passed: true }); }
  catch (error) { results.push({ label, passed: false, detail: error.message }); throw error; }
};
try {
  if (!base) {
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
    server = createServer((request, response) => {
      try {
        const requested = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname).replace(/^\/+/, '');
        const file = path.resolve(root, requested || 'index.html');
        if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) throw new Error('找不到資源。');
        response.writeHead(200, { 'content-type': (types[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8', 'cache-control': 'no-store' });
        response.end(fs.readFileSync(file));
      } catch { response.writeHead(404); response.end(); }
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.address().port}/`;
  }
  const channel = process.env.NVM_QA_BROWSER || 'msedge';
  browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(error.message));
  const open = async (language = 'zh') => {
    await page.goto(new URL(`specialty-nvm.html?lang=${language}`, base).href, { waitUntil: 'load' });
    await page.locator('#canvasMatrix').scrollIntoViewIfNeeded();
  };
  const cell = async (row, column = 0) => {
    const canvas = page.locator('#canvasMatrix');
    const size = await canvas.boundingBox();
    await canvas.click({ position: { x: (12 + (column + 0.5) * 256 / 12) * size.width / 280, y: (12 + (row + 0.5) * 256 / 12) * size.height / 280 } });
  };
  const snapshot = () => page.evaluate(() => ({
    defects: document.getElementById('statDefectCount').textContent,
    spares: document.getElementById('statSparesUsed').textContent,
    status: document.getElementById('lblScanStatus').textContent,
    yield: document.getElementById('statDieYield').textContent,
    burnDisabled: document.getElementById('btnBurnFuse').disabled,
    biraDisabled: document.getElementById('btnRunBIRA').disabled,
    blank: [...document.querySelectorAll('.fuse-state')].every(element => element.textContent === 'BLANK'),
    locked: [...document.querySelectorAll('.fuse-state')].filter(element => element.textContent === 'HARD LOCKED').length,
    log: document.getElementById('terminalLogs').textContent
  }));
  const scan = async () => {
    await page.locator('#btnRunBIST').click();
    await page.waitForFunction(() => document.getElementById('lblScanStatus').textContent === 'BIST COMPLETED');
  };
  const allocate = async () => {
    await scan();
    await page.locator('#btnRunBIRA').click();
    await page.waitForFunction(() => document.getElementById('lblScanStatus').textContent !== 'BIRA SOLVING...');
  };
  const burn = async () => {
    await page.locator('#btnBurnFuse').click();
    await page.waitForFunction(() => document.getElementById('lblScanStatus').textContent === 'REPAIR COMPLETE');
  };
  for (const language of ['zh', 'en']) {
    for (const count of [0, 1, 4, 5]) {
      await check(`${language}：${count} 列缺陷符合容量與燒錄條件`, async () => {
        await open(language);
        for (let row = 0; row < count; row += 1) await cell(row);
        if (count === 0) {
          await scan();
          const state = await snapshot();
          assert.equal(state.spares, '0 / 4');
          assert.equal(state.biraDisabled, true);
          assert.equal(state.burnDisabled, true);
          assert.match(state.yield, /100%/u);
        } else {
          await allocate();
          if (count <= 4) {
            const allocated = await snapshot();
            assert.equal(allocated.spares, `${count} / 4`);
            assert.equal(allocated.burnDisabled, false);
            await burn();
            const state = await snapshot();
            assert.equal(state.yield, 'PASS (100%)');
            assert.equal(state.locked, count);
          } else {
            const state = await snapshot();
            assert.match(state.status, /無法修復|UNREPAIRABLE/u);
            assert.equal(state.yield, 'FAIL (0%)');
            assert.equal(state.spares, '0 / 4');
            assert.equal(state.blank, true);
            assert.equal(state.burnDisabled, true);
            assert.match(state.log, /5.*4/u);
            await page.locator('#btnBurnFuse').evaluate(button => button.dispatchEvent(new MouseEvent('click', { bubbles: true })));
            assert.deepEqual(await snapshot(), state);
            await page.locator('#canvasMatrix').screenshot({ path: path.join(output, `五列缺陷-${language}.png`) });
          }
        }
      });
    }
  }
  await check('同列多個缺陷只使用一列備援', async () => {
    await open(); await cell(1, 0); await cell(1, 4); await allocate();
    assert.equal((await snapshot()).spares, '1 / 4');
    await burn(); assert.equal((await snapshot()).locked, 1);
  });
  await check('配置後新增缺陷清空備援配置並要求重新掃描', async () => {
    await open(); await cell(0); await allocate(); await cell(1);
    const state = await snapshot();
    assert.equal(state.defects, '2');
    assert.equal(state.spares, '0 / 4');
    assert.equal(state.blank, true);
    assert.equal(state.burnDisabled, true);
    assert.equal(state.biraDisabled, true);
    await allocate(); assert.equal((await snapshot()).spares, '2 / 4');
  });
  await check('移除最後一個缺陷清空配置且不需要燒錄', async () => {
    await open(); await cell(0); await allocate(); await cell(0);
    const state = await snapshot();
    assert.equal(state.defects, '0');
    assert.equal(state.spares, '0 / 4');
    assert.equal(state.blank, true);
    assert.equal(state.burnDisabled, true);
    await scan();
  });
  await check('已修復後再編輯會撤銷舊結果與燒錄顯示', async () => {
    await open(); await cell(0); await allocate(); await burn(); await cell(1);
    const state = await snapshot();
    assert.equal(state.yield, 'FAIL (0%)');
    assert.equal(state.blank, true);
    assert.equal(state.spares, '0 / 4');
    assert.equal(state.defects, '2');
  });
  for (const stage of ['btnRunBIST', 'btnRunBIRA', 'btnBurnFuse']) {
    await check(`${stage} 執行中禁止手動與隨機缺陷變更`, async () => {
      await open(); await cell(0);
      if (stage === 'btnRunBIRA') await scan();
      if (stage === 'btnBurnFuse') await allocate();
      const before = await snapshot();
      await page.evaluate(stage => {
        document.getElementById(stage).click();
        const canvas = document.getElementById('canvasMatrix');
        const box = canvas.getBoundingClientRect();
        canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: box.left + (12 + 256 / 24) * box.width / 280, clientY: box.top + (12 + 1.5 * 256 / 12) * box.height / 280 }));
        document.getElementById('btnGenDefect').dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }, stage);
      const during = await snapshot();
      assert.equal(during.defects, before.defects);
      assert.equal(during.spares, before.spares);
      assert.equal(await page.locator('#btnGenDefect').isDisabled(), true);
      const expected = { btnRunBIST: 'BIST COMPLETED', btnRunBIRA: 'BIRA SOLUTION LOCKED', btnBurnFuse: 'REPAIR COMPLETE' }[stage];
      await page.waitForFunction(expected => document.getElementById('lblScanStatus').textContent === expected, expected);
      assert.equal((await snapshot()).defects, '1');
      assert.equal(await page.locator('#btnGenDefect').isEnabled(), true);
    });
  }
  await check('瀏覽器沒有 JavaScript 執行錯誤', async () => assert.deepEqual(pageErrors, []));
} catch (error) {
  if (!results.some(result => !result.passed)) results.push({ label: '完成備援模擬驗證', passed: false, detail: error.message });
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
const passed = results.length > 0 && results.every(result => result.passed);
const report = { passed, checkedAt: new Date().toISOString(), base, checks: results.length, results };
fs.writeFileSync(path.join(output, '模擬備援驗證.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ passed, checks: results.length, failures: results.filter(result => !result.passed) }));
if (!passed) process.exitCode = 1;
