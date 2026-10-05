import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium, firefox, webkit } from 'playwright';
import { startTestServer } from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const engine = process.env.NVM_QA_ENGINE || 'chromium';
const type = { chromium, firefox, webkit }[engine];
assert.ok(type, `Unsupported engine: ${engine}`);
const channel = engine === 'chromium' ? process.env.NVM_QA_CHANNEL || process.env.NVM_QA_BROWSER || 'msedge' : null;
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa/evidence-workbench', `${engine}-${channel || 'bundled'}`));
await fs.mkdir(output, { recursive: true });
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const sourceHtml = await fs.readFile(path.join(root, 'memory-evidence.html'), 'utf8');
const TOTAL_EVIDENCE_RECORDS = [...sourceHtml.matchAll(/<article\b(?=[^>]*\bclass="source-card")(?=[^>]*\bid="([^"]+)")[^>]*>/g)].length;
const browser = await type.launch({ headless: true, ...(channel && channel !== 'chromium' ? { channel } : {}) });
const results = [];
const baseline = [];
let canonicalIntegrity = null;

async function isolatedPage(width, language, origin = base, javaScriptEnabled = true, reducedMotion = javaScriptEnabled ? 'reduce' : 'no-preference') {
  const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled, acceptDownloads: true, reducedMotion, serviceWorkers: 'block' });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(origin).origin ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(Number(process.env.NVM_QA_NAVIGATION_TIMEOUT_MS || 30000));
  const open = suffix => page.goto(new URL(`memory-evidence.html?lang=${language}${suffix || ''}`, origin).href);
  return { context, page, open };
}

async function screenshot(page, selector, name) {
  await page.locator(selector).first().evaluate(element => {
    // Reset sticky controls to their natural document position before framing.
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: element.getBoundingClientRect().top + scrollY - 110, behavior: 'instant' });
  });
  // Avoid callback-based page waits: no-JavaScript contexts suppress callbacks.
  await page.screenshot({ path: path.join(output, `${name}.png`) });
}

const visibleIds = page => page.locator('.source-card:not([hidden])').evaluateAll(cards => cards.map(card => card.id));
const focused = (page, selector) => page.locator(selector).evaluate(element => document.activeElement === element);
const input = page => page.locator('#evidenceSearch');
const filter = (page, name) => page.locator(`#evidenceFilters [data-type="${name}"]`).click();
async function count(page, expected) {
  assert.equal((await visibleIds(page)).length, expected);
  assert.equal(Number(await page.locator('#evidenceCount').textContent()), expected);
}
async function keyboardActivate(page, selector) {
  await page.locator(selector).focus();
  await page.keyboard.press('Enter');
}
async function printState(page) {
  return page.evaluate(() => ({
    url: location.href,
    query: document.querySelector('#evidenceSearch').value,
    active: document.querySelector('#evidenceFilters [aria-pressed="true"]').dataset.type,
    cards: [...document.querySelectorAll('.source-card')].map(card => ({ id: card.id, hidden: card.hidden })),
    details: [...document.querySelectorAll('details')].map((detail, index) => ({ index, open: detail.open }))
  }));
}

try {
  if (process.env.NVM_QA_CANONICAL_BEFORE) {
    const expected = JSON.parse(await fs.readFile(process.env.NVM_QA_CANONICAL_BEFORE, 'utf8'));
    const source = await fs.readFile(path.join(root, 'memory-evidence.html'), 'utf8');
    const actual = [...source.matchAll(/<article\b(?=[^>]*\bclass="source-card")(?=[^>]*\bid="([^"]+)")[^>]*>[\s\S]*?<\/article>/g)].map(match => ({ id: match[1], sha256: createHash('sha256').update(match[0].replace(/\r\n/g, '\n')).digest('hex') }));
    assert.equal(actual.length, TOTAL_EVIDENCE_RECORDS);
    assert.deepEqual(actual, expected, `the pilot preserves all ${TOTAL_EVIDENCE_RECORDS} canonical source-card IDs, metadata, claims, limits and links verbatim`);
    canonicalIntegrity = { records: TOTAL_EVIDENCE_RECORDS, passed: true, fixture: process.env.NVM_QA_CANONICAL_BEFORE };
  }
  // Optional read-only comparison fixture. Old count text is recorded separately;
  // the before/after screenshots compare chips, metadata sorting and disclosure.
  if (process.env.NVM_QA_BEFORE_ROOT) {
    const beforeServer = await startTestServer(path.resolve(process.env.NVM_QA_BEFORE_ROOT));
    try {
      for (const width of [1440, 390]) for (const language of ['en', 'zh']) {
        const { context, page, open } = await isolatedPage(width, language, beforeServer.base);
        try {
          await open();
          await filter(page, 'vendor');
          await screenshot(page, '.evidence-toolbar', `before-toolbar-${width}-${language}`);
          await screenshot(page, '#evidence-V01', `before-source-${width}-${language}`);
          baseline.push({ width, language, sourceRoot: process.env.NVM_QA_BEFORE_ROOT, cards: await page.locator('.source-card').count(), summary: await page.locator('.research-hero-meta b').allTextContents(), workbench: await page.locator('#evidenceWorkbench').count(), countNote: 'Baseline static summary says 31; the separate evidence-count fix updates the current 37-record corpus. UI comparison concerns chips, sorting and disclosure.' });
        } finally { await context.close(); }
      }
    } finally { await beforeServer.close(); }
  }

  for (const width of [1440, 390]) for (const language of ['en', 'zh']) {
    const { context, page, open } = await isolatedPage(width, language);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const scenario = { width, language, checks: [], errors };
    const check = async (name, run) => {
      try { await open(); await page.locator('#evidenceWorkbench').waitFor(); await run(); scenario.checks.push({ name, passed: true }); }
      catch (error) { scenario.checks.push({ name, passed: false, error: error.stack }); await page.screenshot({ path: path.join(output, `failure-${width}-${language}-${scenario.checks.length}.png`) }).catch(() => {}); }
    };
    try {
      await check(`${TOTAL_EVIDENCE_RECORDS} records, visible claim boundaries and localized native controls`, async () => {
        await count(page, TOTAL_EVIDENCE_RECORDS);
        assert.equal(await page.locator('.source-card').count(), TOTAL_EVIDENCE_RECORDS);
        assert.equal(Number(await page.locator('[data-evidence-count="total"]').textContent()), TOTAL_EVIDENCE_RECORDS);
        assert.equal(await page.locator('#evidenceWorkbenchStatus').getAttribute('role'), 'status');
        assert.equal(await page.locator('#evidenceIndexWrap').isVisible(), false, 'cross-category metadata sorting is not offered');
        assert.equal(await page.locator('#evidenceSortHint').isVisible(), true);
        assert.equal(await page.locator('.source-proof details, details .source-proof, details .source-meta').count(), 0, 'limitations and metadata remain outside disclosure');
        assert.equal(await page.locator('.source-card details.evidence-source-details').count(), TOTAL_EVIDENCE_RECORDS);
        const first = page.locator('.source-card').first();
        assert.equal(await first.locator('details').getAttribute('open'), null);
        assert.equal(await first.locator('.source-proof').isVisible(), true);
        assert.equal(await first.locator('.source-content > p:not(.source-meta)').first().isVisible(), true);
        const summary = first.locator('details > summary');
        await summary.focus(); await page.keyboard.press('Enter');
        assert.equal(await first.locator('details').evaluate(element => element.open), true);
        assert.equal(await first.locator('details a').first().isVisible(), true);
        await page.keyboard.press('Enter');
        assert.equal(await first.locator('details').evaluate(element => element.open), false);
        assert.equal(await focused(page, '.source-card:first-child details > summary'), true);
        await filter(page, 'vendor');
        await screenshot(page, '.evidence-toolbar', `after-toolbar-${width}-${language}`);
        await screenshot(page, '#evidence-V01', `after-source-${width}-${language}`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, 'document fits viewport');
      });

      await check('Removable filter chips preserve keyboard focus; empty and clear recover', async () => {
        await filter(page, 'vendor'); await input(page).fill('TC4x'); await count(page, 1);
        assert.deepEqual(await visibleIds(page), ['evidence-V16']);
        assert.equal(await page.locator('#evidenceChips [data-remove-filter]:visible').count(), 2);
        for (const kind of ['type', 'query']) assert.match(await page.locator(`[data-remove-filter="${kind}"]`).getAttribute('aria-label'), language === 'en' ? /Remove/ : /移除/);
        await page.locator('#languageToggle').click();
        await count(page, 1);
        for (const kind of ['type', 'query']) assert.match(await page.locator(`[data-remove-filter="${kind}"]`).getAttribute('aria-label'), language === 'en' ? /移除/ : /Remove/);
        await page.locator('#languageToggle').click();
        await count(page, 1);
        await keyboardActivate(page, '[data-remove-filter="query"]');
        assert.equal(await focused(page, '[data-remove-filter="type"]'), true);
        await keyboardActivate(page, '[data-remove-filter="type"]');
        assert.equal(await focused(page, '#evidenceSearch'), true); await count(page, TOTAL_EVIDENCE_RECORDS);
        await filter(page, 'vendor'); await input(page).fill('TC4x');
        await keyboardActivate(page, '[data-remove-filter="type"]');
        assert.equal(await focused(page, '[data-remove-filter="query"]'), true); await count(page, 1);
        await keyboardActivate(page, '[data-remove-filter="query"]');
        assert.equal(await focused(page, '#evidenceSearch'), true); await count(page, TOTAL_EVIDENCE_RECORDS);
        await filter(page, 'paper'); await input(page).fill('no_such_evidence_778811'); await count(page, 0);
        assert.equal(await page.locator('#evidenceEmpty').isVisible(), true);
        const emptyStatus = (await page.locator('#evidenceWorkbenchStatus').textContent()).trim();
        assert.ok(!emptyStatus || /\b0\b/.test(emptyStatus), 'an earlier action announcement must not retain a stale result count');
        await keyboardActivate(page, '#clearEvidence');
        assert.equal(await focused(page, '#evidenceSearch'), true); await count(page, TOTAL_EVIDENCE_RECORDS);
        assert.equal(await input(page).inputValue(), '');
        assert.equal(await page.locator('#evidenceChips [data-remove-filter]:visible').count(), 0);
        assert.equal(await page.locator('#evidenceEmpty').isVisible(), false);
        assert.equal(await page.locator('#evidenceFilters [data-type="all"]').getAttribute('aria-pressed'), 'true');
        const newSummary = await page.locator('.evidence-source-details > summary').first().innerText();
        for (const uiOnly of [newSummary, 'Metadata sorting', '中繼資料排序']) {
          await input(page).fill(uiOnly.trim());
          await count(page, 0);
        }
        await input(page).fill('DOI 10.1109/TC.2008.212');
        assert.deepEqual(await visibleIds(page), ['evidence-P01'], 'original DOI source-link text stays in the searchable corpus');
      });

      await check('Within-category year/ID sorting, unknown last, aria-sort and URL restoration', async () => {
        const originalOrder = await page.locator('.source-card').evaluateAll(cards => cards.map(card => card.id));
        await filter(page, 'vendor');
        assert.equal(await page.locator('#evidenceIndexWrap').isVisible(), true);
        const table = page.locator('#evidenceIndex');
        const rows = () => table.locator('tbody tr[data-record-id]').evaluateAll(items => items.map(item => ({ id: item.dataset.recordId, year: item.dataset.year })));
        const expectedCount = await page.locator('.source-card[data-type="vendor"]').count();
        assert.equal((await rows()).length, expectedCount);
        const directionOrder = [];
        for (const direction of ['ascending', 'descending']) {
          await keyboardActivate(page, '[data-evidence-sort="year"]');
          assert.equal(await focused(page, '[data-evidence-sort="year"]'), true);
          assert.equal(await table.locator('th[data-sort="year"]').getAttribute('aria-sort'), direction);
          assert.equal(await table.locator('th[data-sort="id"]').getAttribute('aria-sort'), 'none');
          const actual = await rows();
          const known = actual.filter(item => item.year !== '');
          const unknown = actual.filter(item => item.year === '');
          assert.ok(known.length > 1 && unknown.length > 0, 'test corpus exercises known and unknown years');
          assert.deepEqual(actual.slice(-unknown.length), unknown, 'unknown years remain last in either direction');
          for (let i = 1; i < known.length; i++) {
            const previous = known[i - 1], next = known[i];
            if (previous.year === next.year) assert.ok(previous.id.localeCompare(next.id, 'en', { numeric: true }) <= 0, 'equal years use stable ID order');
            else assert.ok(direction === 'ascending' ? Number(previous.year) < Number(next.year) : Number(previous.year) > Number(next.year));
          }
          const metadata = await page.locator('.source-card[data-type="vendor"]').evaluateAll(cards => Object.fromEntries(cards.map(card => [card.id.replace('evidence-', ''), card.querySelector('.source-meta').textContent.split('·')[0].trim()])));
          for (const row of actual) {
            const token = metadata[row.id.replace('evidence-', '')];
            assert.ok(token !== undefined, `row ${row.id} belongs to this category`);
            if (/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(token)) assert.equal(row.year, token.slice(0, 4));
            else assert.equal(row.year, '', 'ranges, absent years and checked dates are not publication years');
          }
          directionOrder.push(actual);
        }
        const savedRows = await rows();
        const stateUrl = new URL(page.url());
        assert.equal(stateUrl.searchParams.get('type'), 'vendor');
        assert.equal(stateUrl.searchParams.get('sort'), 'year');
        assert.equal(stateUrl.searchParams.get('dir'), 'desc');
        await page.reload();
        assert.deepEqual(await rows(), savedRows);
        assert.equal(await table.locator('th[data-sort="year"]').getAttribute('aria-sort'), 'descending');
        await keyboardActivate(page, '[data-evidence-sort="id"]');
        assert.equal(await table.locator('th[data-sort="id"]').getAttribute('aria-sort'), 'ascending');
        const ids = (await rows()).map(item => item.id);
        assert.deepEqual(ids, [...ids].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })));
        await keyboardActivate(page, '[data-evidence-sort="id"]');
        assert.equal(await table.locator('th[data-sort="id"]').getAttribute('aria-sort'), 'descending');
        assert.deepEqual((await rows()).map(item => item.id), [...ids].reverse());
        assert.deepEqual(await page.locator('.source-card').evaluateAll(cards => cards.map(card => card.id)), originalOrder, 'sorting the metadata table does not reorder evidence cards');
        await input(page).fill('TC4x');
        assert.equal(await page.evaluate(() => new URL(location.href).searchParams.get('q')), 'TC4x');
        await page.reload(); await count(page, 1);
        assert.equal(await input(page).inputValue(), 'TC4x');
        scenario.sortEvidence = directionOrder;
      });

      await check('Print expands all records and restores screen state; HTML export is complete', async () => {
        await filter(page, 'vendor'); await input(page).fill('OTP');
        const ids = await visibleIds(page);
        assert.ok(ids.length > 0 && ids.length < TOTAL_EVIDENCE_RECORDS);
        await page.locator('.source-card:not([hidden]) summary').first().click();
        const before = await printState(page);
        await page.emulateMedia({ media: 'print' });
        await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
        assert.equal(await page.locator('.source-card').count(), TOTAL_EVIDENCE_RECORDS);
        assert.equal(await page.locator('.source-card').evaluateAll(cards => cards.every(card => getComputedStyle(card).display !== 'none' && card.getBoundingClientRect().height > 0)), true);
        assert.equal(await page.locator('details').evaluateAll(items => items.every(item => item.open)), true);
        await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
        await page.emulateMedia({ media: 'screen' });
        assert.deepEqual(await printState(page), before, 'afterprint restores filters, URL, hidden records and every disclosure');
        const downloadPromise = page.waitForEvent('download');
        await page.locator('#evidenceExport').click();
        const download = await downloadPromise;
        const saved = path.join(output, `export-${width}-${language}.html`);
        await download.saveAs(saved);
        const html = await fs.readFile(saved, 'utf8');
        const exported = await page.evaluate(source => {
          const document = new DOMParser().parseFromString(source, 'text/html');
          return [...document.querySelectorAll('.source-card')].map(card => ({ id: card.id, hidden: card.hidden, proof: card.querySelector('.source-proof')?.textContent.trim(), meta: card.querySelector('.source-meta')?.textContent.trim(), links: card.querySelectorAll('a[href]').length, en: card.querySelectorAll('[data-lang="en"]').length, zh: card.querySelectorAll('[data-lang="zh"]').length, closed: card.querySelectorAll('details:not([open])').length }));
        }, html);
        assert.deepEqual(exported.map(item => item.id), ids);
        for (const card of exported) assert.ok(!card.hidden && card.proof && card.meta && card.links && card.en && card.zh && !card.closed, `export preserves complete bilingual ${card.id}`);
        assert.deepEqual(await printState(page), before, 'export does not alter the screen');
        await keyboardActivate(page, '[data-evidence-sort="year"]');
        await keyboardActivate(page, '[data-evidence-sort="year"]');
        assert.equal(await page.locator('th[data-sort="year"]').getAttribute('aria-sort'), 'descending');
        await keyboardActivate(page, '#clearEvidence');
        await count(page, TOTAL_EVIDENCE_RECORDS);
        const allDownloadPromise = page.waitForEvent('download');
        await page.locator('#evidenceExport').click();
        const allDownload = await allDownloadPromise;
        const allPath = path.join(output, `export-all-${width}-${language}.html`);
        await allDownload.saveAs(allPath);
        const allHtml = await fs.readFile(allPath, 'utf8');
        const allExported = await page.evaluate(source => [...new DOMParser().parseFromString(source, 'text/html').querySelectorAll('.source-card')].map(card => card.id), allHtml);
        assert.deepEqual(allExported, await page.locator('.source-card').evaluateAll(cards => cards.map(card => card.id)), `clearing the category restores canonical order in the complete ${TOTAL_EVIDENCE_RECORDS}-record export`);
        scenario.printEvidence = { records: TOTAL_EVIDENCE_RECORDS, restored: true, exportedIds: ids, method: 'print media plus beforeprint/afterprint lifecycle events; no OS print dialog' };
      });

      await check('Deep links reveal filtered evidence and source disclosure; global search stays complete', async () => {
        await filter(page, 'paper'); await input(page).fill('no_such_evidence_778811'); await count(page, 0);
        await page.evaluate(() => { location.hash = 'evidence-V16'; });
        await page.waitForFunction(() => document.activeElement?.id === 'evidence-V16');
        await count(page, TOTAL_EVIDENCE_RECORDS);
        assert.equal(await input(page).inputValue(), '');
        assert.equal(await page.locator('#evidence-V16 details').evaluate(element => element.open), true);
        assert.equal(await page.locator('#evidenceChips [data-remove-filter]:visible').count(), 0);
        assert.equal(new URL(page.url()).searchParams.has('q'), false);
        const box = await page.locator('#evidence-V16').boundingBox();
        assert.ok(box.y < 900 && box.y + box.height > 0, 'fragment is actually in the viewport');
        await open('&type=vendor&q=TC4x#evidence-P01');
        await page.waitForFunction(() => document.activeElement?.id === 'evidence-P01');
        await count(page, TOTAL_EVIDENCE_RECORDS);
        assert.equal(await page.locator('#evidence-P01 details').evaluate(element => element.open), true);
        await page.evaluate(() => document.querySelectorAll('.evidence-source-details').forEach(detail => { detail.open = false; }));
        await filter(page, 'paper');
        const original = await page.locator('.source-card').evaluateAll(cards => cards.map(card => ({ id: card.id.replace('evidence-', ''), summary_en: card.querySelector('.source-content > p:not(.source-meta) [data-lang="en"]')?.textContent.trim() || '', summary_zh: card.querySelector('.source-content > p:not(.source-meta) [data-lang="zh"]')?.textContent.trim() || '' })));
        await page.locator('#searchTrigger').click();
        await page.waitForFunction((expected) => window.NVMHub?.searchIndex.filter(item => item.id).length === expected, TOTAL_EVIDENCE_RECORDS);
        const indexed = await page.evaluate(() => window.NVMHub.searchIndex.filter(item => item.id).map(item => ({ id: item.id, summary_en: item.summary_en, summary_zh: item.summary_zh })));
        assert.deepEqual(indexed, original, 'collapsed source links and active screen filters do not change the canonical index');
        await page.locator('#nvmHubSearchInput').fill('TC4x');
        assert.equal(await page.locator('#searchResults a[href*="#evidence-V16"]').count(), 1);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('[inert]').count(), 0);
      });

      await check('Normal-motion no-JavaScript content and initial-viewport printing remain readable', async () => {
        const readonly = await isolatedPage(width, language, base, false);
        const readable = target => target.locator('.source-card').evaluateAll(cards => cards.every(card => {
          for (let item = card; item; item = item.parentElement) {
            const style = getComputedStyle(item);
            if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
          }
          return card.getBoundingClientRect().height > 0;
        }));
        try {
          await readonly.open();
          assert.equal(await readonly.page.locator('.source-card').count(), TOTAL_EVIDENCE_RECORDS);
          assert.equal(await readable(readonly.page), true, 'no-JS normal-motion ancestors do not hide the ledger');
          assert.equal(await readonly.page.locator('.evidence-toolbar').isVisible(), false, 'nonfunctional filter controls are hidden without JavaScript');
          assert.equal(await readonly.page.locator('#evidenceWorkbench').isVisible(), false);
          assert.equal(await readonly.page.locator('.source-card details').count(), 0);
          assert.ok(await readonly.page.locator('.source-content > a').count() >= TOTAL_EVIDENCE_RECORDS);
          for (const lang of ['en', 'zh']) assert.equal(await readonly.page.locator(`.source-card .source-proof [data-lang="${lang}"]`).first().isVisible(), true, 'static fallback retains both languages');
          await screenshot(readonly.page, '.source-card', `nojs-source-${width}-${language}`);
          await readonly.page.emulateMedia({ media: 'print' });
          assert.equal(await readable(readonly.page), true, `no-JS print retains all ${TOTAL_EVIDENCE_RECORDS} cards`);
        } finally { await readonly.context.close(); }
        const initialPrint = await isolatedPage(width, language, base, true, 'no-preference');
        try {
          await initialPrint.open();
          assert.equal(await initialPrint.page.evaluate(() => scrollY), 0, 'print starts at the hero before scrolling through the ledger');
          await initialPrint.page.emulateMedia({ media: 'print' });
          await initialPrint.page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
          assert.equal(await readable(initialPrint.page), true, 'initial-viewport printing reveals offscreen animation sections');
          assert.equal(await initialPrint.page.locator('.source-card details').evaluateAll((items, expected) => items.length === expected && items.every(item => item.open), TOTAL_EVIDENCE_RECORDS), true);
          await initialPrint.page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
          await initialPrint.page.emulateMedia({ media: 'screen' });
        } finally { await initialPrint.context.close(); }
      });
      scenario.passed = scenario.checks.every(item => item.passed) && errors.length === 0;
      results.push(scenario);
      console.log(`${scenario.passed ? 'Passed' : 'Failed'}: evidence workbench ${width}px ${language} (${scenario.checks.filter(item => item.passed).length}/${scenario.checks.length})`);
    } finally { await context.close(); }
  }
} finally {
  await browser.close();
  await server?.close();
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ base, engine, channel, version: browser.version(), baseline, canonicalIntegrity, results, evidenceScope: 'Isolated headless browser interactions and DOM/ARIA/print-media assertions; no assistive-technology audio or OS print dialog.' }, null, 2));
}
const checks = results.flatMap(result => result.checks);
console.log(`Evidence workbench: ${checks.filter(check => check.passed).length}/${checks.length} checks passed`);
if (!results.length || results.some(result => !result.passed)) process.exitCode = 1;
