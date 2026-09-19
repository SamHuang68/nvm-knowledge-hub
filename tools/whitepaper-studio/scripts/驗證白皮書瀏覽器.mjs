import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { nvmIpSpecs } from '../src/data/nvm_specs.js';
import { localizeProfile } from '../src/data/設定檔語系.js';

const base = (process.env.NVM_QA_BASE || process.env.WHITEPAPER_QA_URL || 'http://127.0.0.1:8765').replace(/\/+$/, '');
const output = new URL('../../../qa/白皮書驗證/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.NVM_QA_BROWSER === 'chromium' ? undefined : (process.env.NVM_QA_BROWSER || (process.platform === 'win32' ? 'msedge' : undefined)) });
const results = [];
const readDownload = async download => {
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
};
try {
  for (const entry of ['whitepaper/index.html', 'tools/whitepaper-studio/index.html']) {
    for (const language of ['en', 'zh']) {
      for (const width of [320, 390, 768, 1440]) {
        const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`${base}/${entry}?view=selector&lang=${language}`, { waitUntil: 'networkidle' });
        await page.waitForFunction(lang => document.documentElement.dataset.language === lang, language);
        assert.equal(new URL(page.url()).pathname, new URL(`${base}/whitepaper/index.html`).pathname);
        assert.deepEqual(await page.locator('#decision-body tr').evaluateAll(rows => rows.map(row => row.dataset.profileId)), nvmIpSpecs.map(item => item.id));
        const family = nvmIpSpecs.find(item => item.id === 'bcd_power_pmic_trim').family;
        await page.locator('#filter-family').selectOption(family);
        assert.equal(await page.locator('#decision-body tr').count(), 1);
        const jsonEvent = page.waitForEvent('download');
        await page.locator('#btn-export-json').click();
        const json = JSON.parse(await readDownload(await jsonEvent));
        assert.deepEqual(json, nvmIpSpecs.filter(item => item.family === family).map(item => localizeProfile(item, language)));
        const csvEvent = page.waitForEvent('download');
        await page.locator('#btn-export-csv').click();
        const csv = await readDownload(await csvEvent);
        assert.ok(csv.includes('bcd_power_pmic_trim'));
        assert.ok(!csv.includes('sram_puf_secure_storage'));
        assert.ok(csv.includes(language === 'zh' ? '待補來源' : 'source-needed'));
        await page.locator('#filter-family').selectOption('ALL');
        for (const view of ['overview', 'whitepaper', 'selector', 'taxonomy', 'templates']) {
          await page.locator(`#tab-${view}`).click();
          assert.equal(await page.locator('.studio-panel:not([hidden])').getAttribute('id'), `panel-${view}`);
          const geometry = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth - innerWidth,
            cells: [...document.querySelectorAll('.studio-panel:not([hidden]) td, .studio-panel:not([hidden]) th')].filter(cell => cell.getClientRects().length && cell.scrollWidth > cell.clientWidth + 1).map(cell => cell.dataset.label),
          }));
          assert.ok(geometry.overflow <= 1, `${entry}/${language}/${width}/${view} 頁面超寬 ${geometry.overflow}`);
          assert.deepEqual(geometry.cells, [], `${entry}/${language}/${width}/${view} 儲存格超寬`);
          results.push({ entry, language, width, view, ...geometry });
        }
        if (width === 390) {
          await page.locator('#menuToggle').click();
          assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'), 'true');
          assert.ok(await page.evaluate(() => document.activeElement?.closest('#primaryNav')));
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'), 'false');
          assert.ok(await page.locator('#menuToggle').evaluate(el => el === document.activeElement));
          await page.locator('#tab-selector').click();
          await page.locator('.matrix-evidence-boundary').scrollIntoViewIfNeeded();
          await page.screenshot({ path: fileURLToPath(new URL(`${entry.startsWith('tools') ? '次入口' : '正式入口'}_${language}_390.png`, output)) });
        }
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
  }
  const page = await browser.newPage();
  await page.goto(`${base}/tools/whitepaper-studio/index.html?view=whitepaper&lang=zh#chap-state-contract`, { waitUntil: 'networkidle' });
  assert.equal(new URL(page.url()).hash, '#chap-state-contract');
  assert.equal(await page.locator('.studio-panel:not([hidden])').getAttribute('id'), 'panel-whitepaper');
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('測試拒絕'); } } });
    document.execCommand = () => false;
  });
  await page.goto(`${base}/whitepaper/index.html?view=templates&lang=zh`, { waitUntil: 'networkidle' });
  await page.locator('[data-copy-outline]').first().click();
  await page.locator('#manual-copy-outline textarea').waitFor();
  assert.ok((await page.locator('#manual-copy-outline textarea').inputValue()).length > 100);
  assert.ok((await page.locator('#toast').textContent()).includes('複製失敗'));
  await writeFile(new URL('驗證結果.json', output), JSON.stringify({ cases: results, downloads: 32, redirectChapter: true, failedClipboardFallback: true }, null, 2));
  console.log(`白皮書瀏覽器驗證通過：${results.length} 個情境、32 份實際下載、雙入口章節與複製失敗備援。`);
} finally { await browser.close(); }
