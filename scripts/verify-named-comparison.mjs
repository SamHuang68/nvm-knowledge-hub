import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { chromium, firefox, webkit } from 'playwright';
import { startTestServer } from './test-server.mjs';
import { buildNamedComparison, validateNamedComparison } from './build-named-comparison.mjs';

const root = path.resolve(import.meta.dirname, '..');
const engine = process.env.NVM_QA_ENGINE || 'chromium';
assert.ok(['chromium', 'firefox', 'webkit'].includes(engine));
const channel = process.env.NVM_QA_BROWSER || process.env.NVM_QA_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chromium');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, `qa/named-comparison-${engine}`));
fs.mkdirSync(output, { recursive: true });
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/named-nvm-comparison.json'), 'utf8'));
const results = [];

function dataChecks() {
  buildNamedComparison({ check: true });
  const missingConditions = structuredClone(data);
  delete missingConditions.cases[0].metrics[1].conditions;
  assert.throws(() => validateNamedComparison(missingConditions), /conditions/, 'a retention value without conditions must fail');
  const missingUnknownReason = structuredClone(data);
  delete missingUnknownReason.cases[0].context.processNode.reason;
  assert.throws(() => validateNamedComparison(missingUnknownReason), /reason/, 'unknown must preserve its reason');
  const missingSource = structuredClone(data);
  missingSource.cases[0].sourceId = 'unverified';
  assert.throws(() => validateNamedComparison(missingSource), /source/, 'a case cannot fall back to family values');
  assert.deepEqual(data.sources.map(source => new URL(source.url).hostname).sort(), ['www.st.com', 'www.ti.com']);
  const st = data.cases.find(item => item.id === 'stm32u575');
  const ti = data.cases.find(item => item.id === 'msp430fr5994');
  assert.match(st.metrics[0].conditions.en, /Whole bank/);
  assert.match(st.metrics[0].basis.en, /256 KB per bank/);
  assert.match(st.metrics[1].conditions.en, /TA = 85.*10,000 cycles/);
  assert.match(ti.metrics[1].conditions.en, /TJ = 85.*prior cycle history not stated/);
  assert.match(st.metrics[2].value.en, /128 bits.*typ and max/);
  assert.match(ti.metrics[2].conditions.en, /NWAITSx = 0.*8 MHz/);

  // Check mode must fail on stale output and leave both source and page untouched.
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'nvm-named-check-'));
  fs.mkdirSync(path.join(fixture, 'data'));
  const fixtureData = path.join(fixture, 'data/named-nvm-comparison.json');
  const fixturePage = path.join(fixture, 'technology-comparison.html');
  fs.writeFileSync(fixtureData, JSON.stringify(data));
  fs.writeFileSync(fixturePage, '<!-- NAMED-COMPARISON:START -->stale<!-- NAMED-COMPARISON:END -->');
  const before = [fs.readFileSync(fixtureData), fs.readFileSync(fixturePage)];
  try {
    assert.throws(() => buildNamedComparison({ check: true, projectRoot: fixture }), /stale/);
    assert.deepEqual(fs.readFileSync(fixtureData), before[0]);
    assert.deepEqual(fs.readFileSync(fixturePage), before[1]);
  } finally {
    // Remove only the three exact fixture paths created above; no recursive deletion.
    fs.unlinkSync(fixtureData); fs.unlinkSync(fixturePage);
    fs.rmdirSync(path.join(fixture, 'data')); fs.rmdirSync(fixture);
  }
  results.push({ name: 'source conditions and read-only stale-output guard', passed: true });
}

dataChecks();
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const browser = await ({ chromium, firefox, webkit })[engine].launch({ headless: true, ...(engine === 'chromium' && channel !== 'chromium' ? { channel } : {}) });

async function check(name, options, run) {
  const context = await browser.newContext({ serviceWorkers: 'block', reducedMotion: 'reduce', ...options });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(Number(process.env.NVM_QA_NAVIGATION_TIMEOUT_MS || 30000));
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await run(page);
    assert.deepEqual(errors, []);
    results.push({ name, passed: true });
    console.log(`Passed: ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.stack, errors });
    console.error(`Failed: ${name}: ${error.message}`);
  } finally { await context.close(); }
}

try {
  for (const width of [1440, 390]) for (const language of ['en', 'zh']) {
    await check(`named cases ${width}px ${language}`, { viewport: { width, height: 1000 } }, async page => {
      await page.goto(new URL(`technology-comparison.html?lang=${language}#named-implementations`, base).href);
      const section = page.locator('#named-implementations');
      await section.waitFor();
      assert.match(await section.locator('h2').innerText(), language === 'en' ? /conditions differ, no ranking/i : /條件不同，不作排名/);
      assert.equal(await section.locator('table tbody tr').count(), 3);
      assert.equal(await section.locator('table td[data-case]').count(), 6);
      assert.equal(await section.locator('thead th[scope="col"]').count(), 3);
      assert.equal(await section.locator('tbody th[scope="row"]').count(), 3);
      for (const item of data.cases) {
        const summary = section.locator(`[data-named-case="${item.id}"] summary`);
        await summary.focus(); await page.keyboard.press('Enter');
        assert.equal(await summary.evaluate(element => element.parentElement.open), true);
        assert.equal(await summary.evaluate(element => element === document.activeElement), true);
        assert.equal(await section.locator(`[data-named-case="${item.id}"] .named-unknown:visible`).count(), 3);
        for (const metric of item.metrics) {
          const cell = section.locator(`td[data-case="${item.id}"][data-metric="${metric.id}"]`);
          assert.ok((await cell.innerText()).includes(metric.conditions[language]));
          for (const ref of metric.refs) {
            const source = data.sources.find(source => source.id === item.sourceId);
            assert.equal(await cell.locator(`a[href="${source.url}#page=${ref.page}"]`).count(), 1);
          }
        }
      }
      const scroll = section.locator('.named-table-scroll');
      await scroll.focus();
      assert.equal(await scroll.evaluate(element => element === document.activeElement), true);
      if (width === 390) {
        const before = await scroll.evaluate(element => element.scrollLeft);
        await page.keyboard.press('ArrowRight');
        await page.waitForFunction(() => document.querySelector('.named-table-scroll').scrollLeft > 0);
        assert.ok(await scroll.evaluate(element => element.scrollLeft) > before);
      }
      await page.locator('#languageToggle').click();
      assert.match(await section.locator('h2').innerText(), language === 'en' ? /條件不同，不作排名/ : /conditions differ, no ranking/i);
      assert.equal(await section.locator('details[open]').count(), 2, 'language change keeps expanded context');
      await page.locator('#languageToggle').click();
      const response = await contextRequest(page, base, 'data/named-nvm-comparison.json');
      assert.deepEqual(response, data, 'download contains the same source conditions as the page');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      await section.screenshot({ path: path.join(output, `named-${width}-${language}.png`) });
      await section.locator('h2').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `named-top-${width}-${language}.png`) });
      if (width === 1440) {
        await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
        assert.equal(await section.evaluate(element => element.getBoundingClientRect().right > innerWidth + 1), false, 'section remains within page at 200% text sizing');
      }
    });
  }
  await check('static content and native disclosure without JavaScript', { viewport: { width: 390, height: 844 }, javaScriptEnabled: false }, async page => {
    await page.goto(new URL('technology-comparison.html#named-implementations', base).href);
    const section = page.locator('#named-implementations');
    assert.equal(await section.locator('table td').count(), 6);
    const summary = section.locator('summary').first();
    await summary.focus(); await page.keyboard.press('Space');
    assert.equal(await section.locator('details[open]').count(), 1);
    assert.match(await section.locator('details[open]').innerText(), /Unknown/);
  });
} finally {
  await browser.close(); await server?.close();
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ engine, channel, results }, null, 2));
}

async function contextRequest(page, origin, file) {
  const response = await page.request.get(new URL(file, origin).href);
  assert.equal(response.status(), 200);
  return response.json();
}
const passed = results.filter(result => result.passed).length;
console.log(`Named comparison: ${passed}/${results.length} passed`);
if (passed !== results.length) process.exitCode = 1;
