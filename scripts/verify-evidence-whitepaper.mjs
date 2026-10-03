import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import { startTestServer } from './test-server.mjs';
import { countEvidence } from './sync-evidence-summary.mjs';
import { nvmIpSpecs } from '../tools/whitepaper-studio/src/data/nvm_specs.js';
import { localizeProfile } from '../tools/whitepaper-studio/src/data/profile-locale.js';
import { selectProfiles, serializeCSV } from '../tools/whitepaper-studio/src/js/modules/matrix.js';

const root = path.resolve(import.meta.dirname, '..');
const engine = process.env.NVM_QA_ENGINE || 'chromium';
assert.ok(['chromium', 'firefox', 'webkit'].includes(engine));
const channel = process.env.NVM_QA_BROWSER || process.env.NVM_QA_CHANNEL || 'msedge';
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, `qa/evidence-whitepaper-${engine}`));
await fs.mkdir(output, { recursive: true });
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = (process.env.NVM_QA_BASE || server.base).replace(/\/?$/, '/');
const expectedCounts = countEvidence(await fs.readFile(path.join(root, 'memory-evidence.html'), 'utf8'));
const browser = await ({ chromium, firefox, webkit })[engine].launch({ headless: true, ...(engine === 'chromium' && channel !== 'chromium' ? { channel } : {}) });
const result = { base, engine, browser: browser.version(), checks: [], filters: [], downloads: [], errors: [], passed: false };
const reviewedIds = ['V14', 'V15', 'V16', 'V17', 'V19'];

async function check(name, language, run, javaScriptEnabled = true) {
  const context = await browser.newContext({ javaScriptEnabled, acceptDownloads: true, serviceWorkers: 'block', reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(Number(process.env.NVM_QA_NAVIGATION_TIMEOUT_MS || 30000));
  page.on('pageerror', error => result.errors.push(error.message));
  try { await run(page); result.checks.push({ name, language, passed: true }); }
  catch (error) { result.checks.push({ name, language, passed: false, error: error.stack }); }
  finally { await context.close(); }
}

async function assertCounts(page) {
  const actual = await page.locator('[data-evidence-count]').evaluateAll(elements => Object.fromEntries(elements.map(element => [element.dataset.evidenceCount, Number(element.textContent)])));
  assert.deepEqual(actual, expectedCounts);
}

try {
  for (const language of ['en', 'zh']) {
    await check('Static ledger summary is complete without JavaScript', language, async page => {
      await page.goto(new URL(`memory-evidence.html?lang=${language}`, base).href);
      await assertCounts(page);
      assert.equal(Number(await page.locator('#evidenceCount').textContent()), expectedCounts.total);
      assert.equal(await page.locator('.source-card').count(), expectedCounts.total);
    }, false);

    await check('Ledger filters and global search use the canonical DOM', language, async page => {
      await page.goto(new URL(`memory-evidence.html?lang=${language}`, base).href);
      await page.waitForFunction(lang => window.HubLanguage?.get() === lang, language);
      await assertCounts(page);
      for (const type of ['all', 'paper', 'patent', 'vendor', 'case']) {
        await page.locator(`#evidenceFilters [data-type="${type}"]`).click();
        const expected = expectedCounts[type === 'all' ? 'total' : type];
        assert.equal(await page.locator('.source-card:not([hidden])').count(), expected);
        assert.equal(Number(await page.locator('#evidenceCount').textContent()), expected);
        await assertCounts(page);
        result.filters.push({ language, type, expected });
      }
      for (const id of reviewedIds) {
        const card = page.locator(`#evidence-${id}`);
        assert.match(await card.locator('.source-meta').textContent(), /\bE3\b/u);
        assert.match(await card.locator('.source-proof').textContent(), /DOES NOT PROVE/u);
      }
      assert.ok((await page.locator('#evidence-V16 .source-content a').getAttribute('href')).endsWith('#page=8'));
      assert.ok((await page.locator('#evidence-V17 .source-content a').getAttribute('href')).endsWith('#page=8'));
      await page.locator('#evidenceFilters [data-type="all"]').click();
      await page.locator('#evidenceSearch').fill('TC4x');
      assert.equal(await page.locator('.source-card:not([hidden])').count(), 1);
      assert.equal(await page.locator('#evidence-V16').isVisible(), true);
      await page.locator('#evidenceSearch').fill('');
      await page.locator('.research-hero').screenshot({ path: path.join(output, `ledger-${language}.png`) });
      // Compare the fetched ledger index with the complete canonical card DOM.
      // The controller parses a fresh HTML response; it does not index live mutations.
      const title = await page.locator('#evidence-V16 h3').textContent();
      await page.locator('#searchTrigger').click();
      await page.locator('#nvmHubSearchInput').fill('V16');
      const hit = page.locator('#searchResults a[href*="#evidence-V16"]');
      await hit.waitFor({ state: 'visible' });
      assert.ok((await hit.innerText()).includes(title));
      const indexed = await page.evaluate(() => window.NVMHub.searchIndex.filter(item => item.id).map(item => ({ id: item.id, title_en: item.title_en, title_zh: item.title_zh, summary_en: item.summary_en, summary_zh: item.summary_zh })));
      const cards = await page.locator('.source-card').evaluateAll(elements => elements.map(card => ({
        id: card.querySelector('.source-index b').textContent.trim(),
        title_en: (card.querySelector('h3 [data-lang="en"]') || card.querySelector('h3')).textContent.trim(),
        title_zh: (card.querySelector('h3 [data-lang="zh"]') || card.querySelector('h3')).textContent.trim(),
        summary_en: card.querySelector('.source-content > p:not(.source-meta) [data-lang="en"]')?.textContent.trim() || '',
        summary_zh: card.querySelector('.source-content > p:not(.source-meta) [data-lang="zh"]')?.textContent.trim() || ''
      })));
      assert.deepEqual(indexed, cards, 'all indexed evidence titles and both summaries match the canonical ledger DOM');
      await page.keyboard.press('Escape');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    });

    await check('Whitepaper conditional wording matches both real export formats', language, async page => {
      await page.goto(new URL(`whitepaper/?lang=${language}`, base).href);
      await page.waitForFunction(lang => window.HubLanguage?.get() === lang, language);
      for (const view of ['overview', 'whitepaper']) {
        await page.locator(`.view-tab[data-view="${view}"]`).click();
        const text = await page.locator(view === 'overview' ? '.node-lens-grid' : '#chap-node-boundary').innerText();
        assert.match(text, language === 'en' ? /not a universal physical cutoff/u : /不是嵌入式 Flash 的普遍物理截止線/u);
        assert.match(text, language === 'en' ? /named foundry process and memory macro/u : /具名晶圓代工製程與記憶體巨集/u);
      }
      await page.locator('.view-tab[data-view="selector"]').click();
      const flash = nvmIpSpecs.find(profile => profile.id === 'embedded_flash');
      for (const family of ['ALL', flash.family]) {
        await page.locator('#filter-family').selectOption(family);
        const profiles = selectProfiles(family);
        const expected = profiles.map(profile => localizeProfile(profile, language));
        assert.deepEqual(await page.locator('#decision-body tr').evaluateAll(rows => rows.map(row => row.dataset.profileId)), expected.map(profile => profile.id));
        const visible = await page.locator('[data-profile-id="embedded_flash"]').innerText();
        const localized = localizeProfile(flash, language);
        for (const field of ['strongestFit', 'bomCost', 'evidenceStatus']) assert.ok(visible.includes(localized[field]), field);
        assert.ok(visible.includes(localized.evidenceReview.scope));
        for (const format of ['csv', 'json']) {
          const pending = page.waitForEvent('download');
          await page.locator(`#btn-export-${format}`).click();
          const download = await pending;
          const bytes = await fs.readFile(await download.path(), 'utf8');
          if (format === 'json') assert.deepEqual(JSON.parse(bytes), expected);
          else assert.equal(bytes, serializeCSV(profiles, language));
          const filename = `${language}-${family === 'ALL' ? 'all' : 'embedded-flash'}.${format}`;
          await download.saveAs(path.join(output, filename));
          result.downloads.push({ language, family, format, profiles: expected.length, filename });
        }
      }
      await page.locator('#panel-selector').screenshot({ path: path.join(output, `whitepaper-${language}.png`) });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    });

    await check('IoT introduction and executive slide retain the same named-process boundary', language, async page => {
      await page.goto(new URL(`iot-mcu-envm.html?lang=${language}`, base).href);
      await page.waitForFunction(lang => window.HubLanguage?.get() === lang, language);
      const hero = await page.locator('section.hero').innerText();
      assert.match(hero, language === 'en' ? /not a universal physical cutoff/u : /不是 eFlash 的普遍物理截止線/u);
      assert.match(hero, language === 'en' ? /named MCU or memory macro/u : /具名 MCU 或記憶體巨集/u);
      assert.doesNotMatch(hero, /hard physics cliff|economically extinct|30[-–]50%/iu);
      await page.goto(new URL(`briefing/index.html?lang=${language}#slide-07`, base).href);
      await page.waitForFunction(lang => window.HubLanguage?.get() === lang, language);
      const slide = await page.locator('#slide-07').innerText();
      assert.match(slide, language === 'en' ? /not a universal physical cutoff/u : /不是 eFlash 的普遍物理截止線/u);
      assert.match(slide, language === 'en' ? /named process and memory macro/u : /具名製程和記憶體巨集/u);
      assert.doesNotMatch(slide, /hard physics cliff|economically extinct|30[-–]50%/iu);
    });
  }
  assert.deepEqual(result.errors, [], 'page errors');
  assert.ok(result.checks.every(check => check.passed), 'one or more focused checks failed');
  result.passed = true;
} catch (error) {
  result.failure = error.stack;
  process.exitCode = 1;
} finally {
  await fs.writeFile(path.join(output, 'verification.json'), JSON.stringify(result, null, 2));
  await browser.close();
  await server?.close();
}
console.log(JSON.stringify({ engine, checks: result.checks.length, filters: result.filters.length, downloads: result.downloads.length, passed: result.passed }));
if (!result.passed) throw new Error(result.checks.filter(check => !check.passed).map(check => `${check.name} (${check.language}): ${check.error}`).join('\n') || result.failure);
