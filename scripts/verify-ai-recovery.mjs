import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startTestServer } from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa/ai-recovery'));
fs.mkdirSync(output, { recursive: true });
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const channel = process.env.NVM_QA_BROWSER || 'msedge';
const browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
const results = [];
const errors = [];
async function scenario(name, run) {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  try { await run(page); results.push({ name, passed: true }); }
  catch (error) { results.push({ name, passed: false, error: error.message }); }
  finally { await context.close(); }
}
const state = (page, value) => page.waitForFunction(value => document.querySelector('.ai-nvm-page')?.dataset.knowledgeState === value, value);
try {
  for (const language of ['en', 'zh']) {
    await scenario(`${language}: HTTP failure, keyboard retry and duplicate-request guard`, async page => {
      let requests = 0;
      let releaseRetry;
      const retryGate = new Promise(resolve => { releaseRetry = resolve; });
      await page.route('**/data/ai-nvm-opportunities-knowledge.json', async route => {
        requests += 1;
        if (requests === 1) return route.fulfill({ status: 503, body: 'Service unavailable' });
        await retryGate;
        return route.continue();
      });
      await page.goto(new URL(`ai-nvm-opportunities.html?lang=${language}#opportunities`, base).href);
      await state(page, 'error');
      assert.equal(await page.locator('.opportunity-record:not([hidden])').count(), 0, 'failed loads must remain closed');
      assert.equal(await page.locator('#opportunityEmpty').getAttribute('role'), 'status', 'failure must be exposed as a status');
      const retry = page.locator('#opportunityRetry');
      assert.ok(await retry.isVisible(), 'a local retry must be available');
      assert.match(await retry.innerText(), language === 'en' ? /Retry/ : /重試/);
      await retry.scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `retry-${language}.png`), fullPage: false });
      await retry.focus(); await page.keyboard.press('Enter');
      await state(page, 'loading');
      assert.equal(await page.locator('#opportunityList').getAttribute('aria-busy'), 'true');
      assert.equal(await page.locator('.opportunity-record:not([hidden])').count(), 0);
      await page.evaluate(() => { const button = document.getElementById('opportunityRetry'); button.dispatchEvent(new Event('click')); button.dispatchEvent(new Event('click')); });
      await page.waitForTimeout(100);
      assert.equal(requests, 2, 'a retry in flight must not start duplicate fetches');
      releaseRetry();
      await state(page, 'canonical');
      assert.ok(await page.locator('.opportunity-record:not([hidden])').count() > 0);
      assert.equal(await page.locator('#opportunityList').getAttribute('aria-busy'), 'false');
      assert.equal(await retry.isVisible(), false);
      assert.equal(await page.evaluate(() => document.activeElement?.dataset.opportunityView), 'source-grounded', 'successful keyboard retry restores focus to the view controls');
      assert.equal(await page.locator('.record-decision-grid').count(), await page.locator('.opportunity-record').count());
    });
    await scenario(`${language}: fresh tab anchor, hash navigation, language and desktop resize`, async page => {
      await page.goto(new URL(`ai-nvm-opportunities.html?lang=${language}#selection-panel-mtp`, base).href);
      await state(page, 'canonical');
      assert.equal(await page.locator('#selection-panel-mtp').isVisible(), true, 'fresh mobile deep link must reveal its panel');
      assert.equal(await page.locator('#selection-tab-mtp').getAttribute('aria-selected'), 'true');
      await page.evaluate(() => { location.hash = 'assurance-panel-attestation'; });
      await page.waitForFunction(() => !document.getElementById('assurance-panel-attestation').hidden);
      assert.equal(await page.locator('#assurance-tab-attestation').getAttribute('aria-selected'), 'true');
      assert.equal(await page.evaluate(() => document.activeElement?.id), 'assurance-panel-attestation');
      await page.locator('#languageToggle').click();
      assert.equal(await page.locator('#assurance-panel-attestation').isVisible(), true);
      assert.equal(await page.locator('#assurance-tab-attestation').getAttribute('aria-selected'), 'true');
      await page.setViewportSize({ width: 1440, height: 960 });
      assert.equal(await page.locator('[data-selection-panel]:visible').count(), 4);
      assert.equal(await page.locator('[data-assurance-panel]:visible').count(), 4);
      await page.setViewportSize({ width: 390, height: 844 });
      assert.equal(await page.locator('#assurance-panel-attestation').isVisible(), true);
      await page.evaluate(() => { location.hash = 'selection-panel-volatile'; });
      await page.waitForFunction(() => !document.getElementById('selection-panel-volatile').hidden);
      assert.equal(await page.locator('#selection-tab-volatile').getAttribute('aria-selected'), 'true');
      await page.screenshot({ path: path.join(output, `deep-link-${language}.png`), fullPage: false });
    });
  }
  await scenario('Stalled response times out and recovers without reloading the page', async page => {
    let requests = 0;
    await page.route('**/data/ai-nvm-opportunities-knowledge.json', route => {
      requests += 1;
      if (requests > 1) return route.continue();
      // Hold the real browser request until its AbortController deadline.
    });
    await page.goto(new URL('ai-nvm-opportunities.html?lang=en#opportunities', base).href);
    await state(page, 'loading');
    await state(page, 'error');
    assert.equal(await page.locator('.opportunity-record:not([hidden])').count(), 0);
    await page.locator('#opportunityRetry').click();
    await state(page, 'canonical');
    assert.equal(requests, 2);
  });
  await scenario('Malformed package fails closed and can be retried', async page => {
    let requests = 0;
    await page.route('**/data/ai-nvm-opportunities-knowledge.json', route => ++requests === 1
      ? route.fulfill({ status: 200, contentType: 'application/json', body: '{broken' }) : route.continue());
    await page.goto(new URL('ai-nvm-opportunities.html?lang=en#opportunities', base).href);
    await state(page, 'error');
    assert.equal(await page.locator('.opportunity-record:not([hidden])').count(), 0);
    await page.locator('#opportunityRetry').click();
    await state(page, 'canonical');
  });
} finally {
  await browser.close(); await server?.close();
  fs.writeFileSync(path.join(output, 'verification-results.json'), JSON.stringify({ results, errors }, null, 2) + '\n');
}
assert.deepEqual(errors, [], 'no unhandled browser errors');
assert.ok(results.every(result => result.passed), JSON.stringify(results.filter(result => !result.passed), null, 2));
console.log(`Passed ${results.length} AI recovery and deep-link scenarios.`);
