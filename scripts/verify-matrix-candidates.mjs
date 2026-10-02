import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startTestServer } from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa/matrix-candidates'));
fs.mkdirSync(output, { recursive: true });
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const channel = process.env.NVM_QA_BROWSER || process.env.NVM_QA_CHANNEL || 'msedge';
const browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
const results = [];
const expectedCandidates = ['efuse', 'maskrom', 'fgotp', 'antifuse', 'ldmtp', 'hdmtp'];

try {
  for (const width of [1440, 390]) for (const language of ['en', 'zh']) {
    const context = await browser.newContext({ viewport: { width, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(new URL(`technology-comparison.html?lang=${language}`, base).href);
      const presets = page.locator('.matrix-view-presets .matrix-view-btn');
      const preset = view => page.locator(`.matrix-view-presets .matrix-view-btn[data-view="${view}"]`);
      const zeroMask = preset('zeromask');
      const visibleTechs = () => page.locator('.matrix-header[data-tech]:not(.is-col-hidden)').evaluateAll(headers => headers.map(header => header.dataset.tech));
      const cellContent = () => page.locator('.matrix-cell[data-tech]').evaluateAll(cells => cells.map(cell => ({ tech: cell.dataset.tech, row: cell.dataset.row, text: cell.textContent })));
      const assertSelection = async selected => {
        for (const button of await presets.all()) {
          const active = await button.getAttribute('data-view') === selected;
          assert.equal(await button.getAttribute('aria-pressed'), String(active), 'preset accessible state matches selection');
          assert.equal(await button.evaluate(element => element.classList.contains('is-active')), active);
        }
      };
      const originalCells = await cellContent();
      assert.equal(originalCells.length, 99, 'eleven existing leaves retain nine data rows');
      await assertSelection('all');
      await zeroMask.focus();
      await zeroMask.press('Space');
      await assertSelection('zeromask');
      assert.equal(await zeroMask.evaluate(element => element === document.activeElement), true);
      assert.deepEqual(await visibleTechs(), expectedCandidates, 'retain all six governed candidate leaves');
      for (let row = 1; row <= 9; row++) {
        assert.equal(await page.locator(`.matrix-cell[data-row="${row}"]:not(.is-col-hidden)`).count(), 6);
      }
      const maskValues = await page.locator('.matrix-cell[data-row="1"]:not(.is-col-hidden) > b').allInnerTexts();
      assert.deepEqual(maskValues.map(value => value.replace(/\s+/g, ' ').trim()), ['+0', '0–1', '+0', '+0', language === 'zh' ? '通常 +0' : 'Typically +0', '+0 ~ +2'], 'retain vendor-dependent mask ranges');
      assert.equal(await zeroMask.innerText(), language === 'zh' ? '零光罩候選 (6)' : '0-Mask Candidates (6)');
      assert.match(await zeroMask.getAttribute('title'), language === 'zh' ? /6.*候選.*供應商.*PDK/ : /6.*candidates.*vendor.*PDK/);
      const toast = await page.locator('.matrix-feedback-toast').innerText();
      assert.match(toast, language === 'zh' ? /6.*候選.*供應商.*PDK/ : /6.*candidates.*vendor.*PDK/);
      assert.match(toast, /TwinBit.*I-fuse.*05/);
      assert.equal(await page.locator('#named-ip-leaves').count(), 1, 'named exceptions retain their existing note');

      await page.locator('.cat-filter-pill[data-cat-id="mtp"]').click();
      await assertSelection(null);
      assert.deepEqual(await visibleTechs(), expectedCandidates.slice(0, 4));
      await page.locator('.cat-filter-pill[data-cat-id="mtp"]').click();
      await assertSelection('zeromask');
      await page.locator('#languageToggle').click();
      await assertSelection('zeromask');
      await page.locator('#languageToggle').click();
      assert.deepEqual(await visibleTechs(), expectedCandidates, 'language round trip preserves selected columns');

      await preset('logic').click();
      await assertSelection('logic');
      assert.deepEqual(await visibleTechs(), ['fgotp', 'antifuse', 'ldmtp', 'hdmtp']);
      await preset('all').click();
      await assertSelection('all');
      assert.equal((await visibleTechs()).length, 11);
      assert.deepEqual(await cellContent(), originalCells, 'preset operations never rewrite technology values or footnotes');
      assert.equal(await page.locator('#resetSelector').getAttribute('aria-pressed'), null, 'constraint reset is not a matrix preset');
      assert.deepEqual(errors, []);
      results.push({ width, language, passed: true, candidates: expectedCandidates, maskValues, toast });
      console.log(`Passed: matrix candidates ${width}px ${language}`);
    } catch (error) {
      results.push({ width, language, passed: false, error: error.stack, errors });
      await page.screenshot({ path: path.join(output, `failure-${width}-${language}.png`) }).catch(() => {});
      console.error(`Failed: matrix candidates ${width}px ${language}: ${error.message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await server?.close();
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ results }, null, 2));
}
const passed = results.filter(result => result.passed).length;
console.log(`Matrix candidate verification: ${passed}/${results.length} passed`);
if (passed !== results.length) process.exitCode = 1;
