import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import { startTestServer } from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const engine = process.env.NVM_QA_ENGINE || 'chromium';
assert.ok(['chromium', 'firefox', 'webkit'].includes(engine));
const channel = process.env.NVM_QA_BROWSER || process.env.NVM_QA_CHANNEL || 'msedge';
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, `qa/content-accessibility-${engine}`));
fs.mkdirSync(output, { recursive: true });
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const browser = await ({ chromium, firefox, webkit })[engine].launch({ headless: true, ...(engine === 'chromium' && channel !== 'chromium' ? { channel } : {}) });
const results = [];
const errors = [];
async function assertMatrixAlignment(page) {
  const layout = await page.evaluate(() => {
    const errors = [];
    const headers = [...document.querySelectorAll('.matrix-header[data-tech]')].filter(element => getComputedStyle(element).display !== 'none');
    for (const header of headers) {
      const head = header.getBoundingClientRect();
      if (head.width < 104) errors.push(`${header.dataset.tech}: column narrower than the reading minimum`);
      for (const cell of document.querySelectorAll(`.matrix-cell[data-tech="${header.dataset.tech}"]`)) {
        const rect = cell.getBoundingClientRect();
        const row = document.querySelector(`.matrix-row-header[data-row="${cell.dataset.row}"]`).getBoundingClientRect();
        if (Math.abs(rect.left - head.left) > 1 || Math.abs(rect.width - head.width) > 1 || Math.abs(rect.top - row.top) > 1 || rect.top < head.bottom) errors.push(`${header.dataset.tech}, row ${cell.dataset.row}: header/cell misalignment`);
      }
    }
    return { errors, cells: document.querySelectorAll('.matrix-cell[data-tech]').length, pageOverflow: document.documentElement.scrollWidth > innerWidth + 1 };
  });
  assert.equal(layout.cells, 99, 'all original technical data cells remain in the DOM');
  assert.equal(layout.pageOverflow, false, 'wide matrix scrolling stays inside its wrapper');
  assert.deepEqual(layout.errors, [], 'visible data cells align with their row and technology headers');
}
async function check(name, language, run) {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  page.on('pageerror', error => errors.push(error.message));
  try { await run(page); results.push({ name, language, passed: true }); }
  catch (error) { results.push({ name, language, passed: false, error: error.stack }); }
  finally { await context.close(); }
}
try {
  for (const language of ['en', 'zh']) {
    await check('Learning filters keep keyboard focus and publish result counts', language, async page => {
      await page.goto(new URL(`secure-storage.html?lang=${language}#learn`, base).href);
      const filter = page.locator('#filters button[data-type="product"]');
      await filter.waitFor();
      await filter.focus(); await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.type), 'product', 'filter activation must not detach the focused button');
      assert.equal(await filter.getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('#filters').getAttribute('role'), 'group');
      const count = await page.locator('#articleGrid .article-card').count();
      assert.equal(await page.locator('#learningResultStatus').getAttribute('role'), 'status');
      assert.match(await page.locator('#learningResultStatus').innerText(), new RegExp(String(count)));
      const query = page.locator('#searchInput');
      await query.fill('no-matching-learning-content-123');
      assert.equal(await page.locator('#articleGrid .article-card').count(), 0);
      assert.equal(await page.locator('#emptyState').isVisible(), true);
      assert.match(await page.locator('#learningResultStatus').innerText(), language === 'en' ? /0 matching/ : /0 筆/);
      assert.equal(await query.evaluate(element => document.activeElement === element), true);
      await query.fill('');
      await page.locator('#filters button[data-type="all"]').focus(); await page.keyboard.press('Space');
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.type), 'all');
      assert.ok(await page.locator('#articleGrid .article-card').count() > count);
      fs.writeFileSync(path.join(output, `learning-${language}.aria.txt`), await page.locator('.library').ariaSnapshot());
    });
    await check('Matrix header controls support keyboard collapse and focus recovery', language, async page => {
      await page.goto(new URL(`technology-comparison.html?lang=${language}#matrix`, base).href);
      const tag = page.locator('.matrix-header[data-tech="efuse"] .matrix-cat-tag');
      assert.equal(await tag.evaluate(element => element.tagName), 'BUTTON', 'interactive category labels must use native button semantics');
      assert.equal(await tag.getAttribute('aria-pressed'), 'true');
      assert.match(await tag.ariaSnapshot(), /button/);
      await tag.focus(); await page.keyboard.press('Enter');
      const collapsedHeader = page.locator('.matrix-header[data-tech="efuse"]');
      assert.equal(await collapsedHeader.isVisible(), false, JSON.stringify(await collapsedHeader.evaluate(element => ({ className: element.className, display: getComputedStyle(element).display, visibleHeaders: [...document.querySelectorAll('.matrix-header[data-tech]')].filter(header => getComputedStyle(header).display !== 'none').length }))));
      assert.equal(await page.locator('.matrix-header[data-tech]:visible').count(), 8);
      assert.equal(await page.locator('.matrix-cell[data-tech="efuse"]:visible').count(), 0);
      assert.equal(await page.getByRole('button', { name: language === 'en' ? 'Foundry' : '晶圓製程', exact: true }).count(), 0, 'collapsed controls must not remain in the accessible tree');
      await assertMatrixAlignment(page);
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.catId), 'foundry', 'collapsed header focus must move to the persistent category control');
      const pill = page.locator('.cat-filter-pill[data-cat-id="foundry"]');
      assert.equal(await pill.getAttribute('aria-pressed'), 'false');
      await page.keyboard.press('Space');
      assert.equal(await page.locator('.matrix-header[data-tech="efuse"]').isVisible(), true);
      assert.equal(await pill.getAttribute('aria-pressed'), 'true');
      assert.equal(await pill.evaluate(element => document.activeElement === element), true);
      await tag.focus(); await page.keyboard.press('Space');
      assert.equal(await page.locator('.matrix-header[data-tech="efuse"]').isVisible(), false);
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.catId), 'foundry');
      await page.locator('.matrix-view-btn[data-view="logic"]').click();
      await page.locator('.cat-filter-pill[data-cat-id="mtp"]').click();
      const last = page.locator('.matrix-header[data-tech="fgotp"] .matrix-cat-tag');
      await last.focus(); await page.keyboard.press('Enter');
      assert.equal(await last.isVisible(), true, 'the final visible category must not collapse');
      assert.equal(await last.evaluate(element => document.activeElement === element), true);
      assert.match(await page.locator('.matrix-feedback-toast').innerText(), language === 'en' ? /at least one/ : /至少保留/);
      await page.setViewportSize({ width: 1440, height: 960 });
      await page.locator('.matrix-view-btn[data-view="all"]').click();
      assert.equal(await page.locator('.matrix-header[data-tech]:visible').count(), 11);
      await page.locator('.matrix-view-btn[data-view="zeromask"]').click();
      assert.equal(await page.locator('.matrix-header[data-category="foundry"]:visible').count(), 2);
      assert.equal(await pill.getAttribute('aria-pressed'), 'mixed', 'a partial category must not be announced as fully selected');
      assert.equal(await tag.getAttribute('aria-pressed'), 'mixed');
      assert.match(await pill.ariaSnapshot(), /pressed=mixed/);
      fs.writeFileSync(path.join(output, `matrix-partial-${language}.aria.txt`), await pill.ariaSnapshot());
      await tag.focus(); await page.keyboard.press('Space');
      assert.equal(await pill.getAttribute('aria-pressed'), 'true');
      assert.equal(await tag.getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('.matrix-header[data-category="foundry"]:visible').count(), 3);
      fs.writeFileSync(path.join(output, `matrix-${language}.aria.txt`), await tag.ariaSnapshot());
      for (const width of [390, 1440]) {
        await page.setViewportSize({ width, height: width === 390 ? 844 : 960 });
        for (const preset of ['all', 'zeromask', 'logic', 'highdensity']) {
          await page.locator(`.matrix-view-btn[data-view="${preset}"]`).click();
          await assertMatrixAlignment(page);
        }
        await page.locator('#btnToggleFitScreen').click();
        await assertMatrixAlignment(page);
        await page.locator('#btnToggleFitScreen').click();
        await assertMatrixAlignment(page);
        await page.evaluate(() => {
          const wrapper = document.querySelector('.compare-matrix-wrapper');
          wrapper.scrollLeft = 0;
          window.scrollTo({ top: wrapper.getBoundingClientRect().top + scrollY - 80, behavior: 'instant' });
        });
        await page.screenshot({ path: path.join(output, `matrix-${width}-${language}.png`), fullPage: false });
      }
    });
  }
} finally {
  fs.writeFileSync(path.join(output, 'verification-results.json'), JSON.stringify({ engine, channel: engine === 'chromium' ? channel : null, browserVersion: browser.version(), results, errors }, null, 2) + '\n');
  await browser.close(); await server?.close();
}
assert.deepEqual(errors, [], 'no unhandled browser errors');
assert.ok(results.every(result => result.passed), JSON.stringify(results.filter(result => !result.passed), null, 2));
console.log(`Passed ${results.length} content accessibility scenarios on ${engine} ${browser.version()}.`);
