import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import { startTestServer } from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const engine = process.env.NVM_QA_ENGINE || 'chromium';
const type = { chromium, firefox, webkit }[engine];
assert.ok(type, `Unsupported browser engine: ${engine}`);
const channel = engine === 'chromium' ? process.env.NVM_QA_CHANNEL || process.env.NVM_QA_BROWSER || 'msedge' : null;
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa/task-search', `${engine}-${channel || 'bundled'}`));
fs.mkdirSync(output, { recursive: true });
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const browser = await type.launch({ headless: true, ...(channel && channel !== 'chromium' ? { channel } : {}) });
const results = [];
const tasks = [
  { id: 'choose-nvm', url: 'technology-comparison.html#hub-decision-flow', target: '#hub-decision-flow' },
  { id: 'estimate-sram', url: 'sram-repair.html', target: '.sram-repair-page' },
  { id: 'prepare-briefing', url: 'briefing/index.html', target: '.slide-card' }
];

try {
  for (const width of [1440, 390]) for (const language of ['en', 'zh']) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(Number(process.env.NVM_QA_NAVIGATION_TIMEOUT_MS || 30000));
    const errors = [];
    const evidence = { destinations: [] };
    page.on('pageerror', error => errors.push(error.message));
    const home = () => page.goto(new URL(`index.html?lang=${language}`, base).href);
    try {
      await home();
      const links = page.locator('.knowledge-task-path');
      assert.equal(await links.count(), 3);
      assert.equal(await page.getByRole('navigation', { name: language === 'zh' ? '選擇你的任務' : 'Start with Your Task', exact: true }).count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'home fits viewport');
      for (const link of await links.all()) {
        const box = await link.boundingBox();
        assert.ok(box.width > 0 && box.x >= 0 && box.x + box.width <= width + 1, 'task control fits viewport');
      }
      await page.screenshot({ path: path.join(output, `home-${width}-${language}.png`) });
      for (const task of tasks) {
        const link = page.locator(`[data-task-path="${task.id}"]`);
        assert.equal(await link.getAttribute('href'), task.url);
        await link.focus();
        await page.keyboard.press('Enter');
        const destination = new URL(task.url, base);
        await page.waitForURL(url => url.pathname.replace(/\.html$/, '') === destination.pathname.replace(/\.html$/, '') && url.hash === destination.hash);
        await page.locator(task.target).first().waitFor({ state: 'visible' });
        if (task.id === 'choose-nvm') {
          await page.waitForFunction(() => {
            const box = document.getElementById('hub-decision-flow').getBoundingClientRect();
            return box.top < innerHeight && box.bottom > 0;
          });
          assert.equal(await page.locator('#hub-decision-flow .hub-story-step').count(), 5, 'NVM task starts at the evidence gates, not the heuristic radar');
        }
        evidence.destinations.push({ task: task.id, url: page.url() });
        await home();
      }

      await page.locator('#searchTrigger').click();
      const input = page.locator('#nvmHubSearchInput');
      await page.waitForFunction(() => window.NVMHub?.searchIndex.some(item => item.id));
      const query = async value => {
        await input.fill(value);
        return page.locator('#searchResults a').evaluateAll(items => items.map(item => item.href));
      };
      const pvt = await query('PVT');
      assert.ok(pvt.length > 0);
      assert.equal(pvt[0], new URL('security-assurance.html#windows', base).href);
      assert.equal(await page.locator('#searchResults a').first().getAttribute('data-result-kind'), 'topic');
      assert.deepEqual(await query('製程／電壓／溫度'), pvt);
      assert.deepEqual(await query('process voltage temperature'), pvt);
      const retention = await query('retention');
      assert.ok(retention.length > 1);
      for (const synonym of ['資料保持', '資料留存', '資料保存']) assert.deepEqual(await query(synonym), retention, `${synonym} preserves retention result order`);
      const node28 = await query('28nm');
      assert.ok(node28.length > 1);
      for (const unit of ['28 nm', '28 NM', '２８ｎｍ']) assert.deepEqual(await query(unit), node28, `${unit} preserves node result order`);
      const bare28 = await query('28');
      assert.ok(node28.every(url => bare28.includes(url)), 'bare numeric search still includes its qualified quantities');
      assert.equal((await query('28nn')).length, 0, 'numeric unit tokens do not fuzzy-match a different unit');
      const secure = await query('安全儲存架構');
      assert.equal(secure[0], new URL('secure-storage.html', base).href, 'existing exact-title match stays first');
      for (const name of ['STM32U575', 'MSP430FR5994']) assert.equal((await query(name))[0], new URL('technology-comparison.html#named-implementations', base).href, 'named implementation is directly discoverable');
      const record = await query('P01');
      assert.equal(record[0], new URL('memory-evidence.html#evidence-P01', base).href, 'existing evidence ID match stays first');
      assert.equal(await page.locator('#searchResults a').first().getAttribute('data-result-kind'), 'evidence');
      await query('SRAM Repair Capacity');
      assert.equal(await page.locator('#searchResults a').first().getAttribute('data-result-kind'), 'tool');
      await page.keyboard.press('ArrowDown');
      assert.equal(await page.locator('#searchResults a').first().evaluate(element => element === document.activeElement), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#searchTrigger').evaluate(element => element === document.activeElement), true, 'search focus returns to trigger');
      assert.equal(await page.locator('[inert]').count(), 0);
      assert.deepEqual(errors, []);
      evidence.search = { pvt, retention, node28, secure, record };
      results.push({ width, language, passed: true, evidence });
      console.log(`Passed: task paths and engineering search ${width}px ${language}`);
    } catch (error) {
      results.push({ width, language, passed: false, error: error.stack, errors, evidence });
      await page.screenshot({ path: path.join(output, `failure-${width}-${language}.png`) }).catch(() => {});
      console.error(`Failed: ${width}px ${language}: ${error.message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await server?.close();
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ engine, channel, version: browser.version(), results }, null, 2));
}
const passed = results.filter(result => result.passed).length;
console.log(`Task and search verification: ${passed}/${results.length} passed`);
if (passed !== results.length) process.exitCode = 1;
