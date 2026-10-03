import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, webkit, firefox } from 'playwright';
import { startTestServer } from './test-server.mjs';
import { captureLanguageSurface, assessLanguageSurface } from './bilingual-surface-contract.mjs';
import { DEFAULT, MODEL_VERSION, estimate } from '../sram-repair-model.js';
import { createScenarioFile, createSnapshot, parseScenarioFile, STORAGE_KEY } from '../sram-scenarios.js';

const root = path.resolve(import.meta.dirname, '..');
const engine = process.env.NVM_QA_ENGINE || (process.platform === 'win32' ? 'edge' : 'chromium');
assert.ok(['edge', 'chromium', 'webkit', 'firefox'].includes(engine));
const output = process.env.NVM_QA_OUTPUT || path.join(root, 'qa', 'sram-scenarios', engine);
await fs.mkdir(output, { recursive: true });
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const browserType = { edge: chromium, chromium, webkit, firefox }[engine];
const browser = await browserType.launch({ headless: true,
  ...(process.env.NVM_QA_EXECUTABLE ? { executablePath: process.env.NVM_QA_EXECUTABLE } : engine === 'edge' ? { channel: 'msedge' } : {}) });
const results = [], errors = [];
const stateA = { ...structuredClone(DEFAULT), unit: 'Gib', mode: 'retained', compression: '1', otp: { overhead: '12.5', reserve: '10', block: '1024' }, efuse: { overhead: '3', reserve: '1.3', block: '8192' } };
const stateB = { ...structuredClone(DEFAULT), capacity: '64', mode: 'reduction', compression: '95', otp: { overhead: '20', reserve: '3.14159', block: '256' }, efuse: { overhead: '4', reserve: '2', block: '4096' } };
async function context(options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1050 }, acceptDownloads: true, serviceWorkers: 'block', ...options });
  await ctx.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const page = await ctx.newPage(); page.setDefaultTimeout(8000); page.setDefaultNavigationTimeout(Number(process.env.NVM_QA_NAVIGATION_TIMEOUT_MS || 30000));
  page.on('pageerror', error => errors.push(error.message));
  return { ctx, page };
}
async function readState(page) {
  return page.evaluate(() => {
    const value = id => document.getElementById(id).value;
    return { capacity: value('capacity'), unit: value('unit'), repair: value('repair'), compression: value('compression'), mode: value('mode'),
      otp: Object.fromEntries(['overhead', 'reserve', 'block'].map(key => [key, value('otp-' + key)])),
      efuse: Object.fromEntries(['overhead', 'reserve', 'block'].map(key => [key, value('efuse-' + key)])) };
  });
}
async function fillState(page, state) {
  await page.locator('#unit').selectOption(state.unit);
  await page.locator('#mode').selectOption(state.mode);
  for (const key of ['capacity', 'repair', 'compression']) await page.locator('#' + key).fill(state[key]);
  for (const tech of ['otp', 'efuse']) for (const key of ['overhead', 'reserve', 'block']) await page.locator('#' + tech + '-' + key).fill(state[tech][key]);
}
async function languageCheck(page, lang) {
  assert.deepEqual(assessLanguageSurface(await page.evaluate(captureLanguageSurface), lang), [], lang + ' visible interface');
}
async function download(page, trigger, filename) {
  const waiting = page.waitForEvent('download'); await trigger(); const item = await waiting;
  const file = path.join(output, filename || item.suggestedFilename()); await item.saveAs(file);
  return { text: await fs.readFile(file, 'utf8'), file };
}
const upload = (page, content, name = 'scenario.json') => page.locator('#scenario-file').setInputFiles({ name, mimeType: 'application/json', buffer: Buffer.from(content) });
async function run(name, fn) { await fn(); results.push({ name, passed: true }); console.log('PASS ' + name); }

let ctx, page;
try {
  ({ ctx, page } = await context());
  await page.goto(new URL('sram-repair.html?lang=en#scenarios', base).href);
  await page.locator('#scenario-save-A').waitFor({ state: 'visible' });
  await run('A/B retain all inputs, compression definitions and exact independent allocations', async () => {
    assert.equal(await page.locator('#scenario-summary').isDisabled(), true);
    await fillState(page, stateA); await page.locator('#scenario-save-A').click();
    await fillState(page, stateB); await page.locator('#scenario-save-B').click();
    for (const [id, inputs] of [['A', stateA], ['B', stateB]]) {
      const r = estimate(inputs), text = await page.locator('#scenario-' + id + '-values').innerText();
      for (const value of [r.payload, r.otp.allocated, r.efuse.allocated]) assert.ok(text.includes(value.toLocaleString('en-US') + ' bits'));
    }
    await languageCheck(page, 'en');
    await page.screenshot({ path: path.join(output, 'scenarios-desktop-en.png'), fullPage: true });
  });
  await run('loading A/B and undo preserve even invalid unsaved drafts and bilingual state', async () => {
    await page.locator('#repair').fill('1/0'); const invalid = await readState(page);
    assert.equal(await page.locator('#scenario-save-A').isDisabled(), true);
    await page.locator('#scenario-load-A').click(); assert.deepEqual(await readState(page), stateA);
    await page.locator('#scenario-load-B').click(); assert.deepEqual(await readState(page), stateB);
    await page.locator('#scenario-undo').click(); assert.deepEqual(await readState(page), stateA);
    await page.locator('#scenario-undo').click(); assert.deepEqual(await readState(page), invalid);
    await languageCheck(page, 'en');
    await page.locator('#scenario-load-A').click();
    await page.locator('#languageToggle').click(); await languageCheck(page, 'zh'); assert.deepEqual(await readState(page), stateA);
    await page.locator('#languageToggle').click(); await languageCheck(page, 'en');
  });
  let exported;
  await run('JSON round trip and reload preserve saved scenarios while resetting only the draft', async () => {
    exported = parseScenarioFile((await download(page, () => page.locator('#scenario-export').click())).text);
    assert.deepEqual(exported.scenarios.A.inputs, stateA); assert.deepEqual(exported.scenarios.B.inputs, stateB);
    assert.equal(exported.modelVersion, MODEL_VERSION);
    assert.equal(exported.scenarios.A.source?.canonicalCommit.length, 40);
    await page.reload(); assert.deepEqual(await readState(page), DEFAULT);
    await page.locator('#scenario-load-B').click(); assert.deepEqual(await readState(page), stateB);
    await page.locator('#capacity').fill('23');
  });
  await run('bad, oversized, unsupported and malicious imports leave drafts and saved snapshots unchanged', async () => {
    const draft = await readState(page), stored = await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY);
    const schema = structuredClone(exported); schema.schemaVersion = 9;
    const model = structuredClone(exported); model.modelVersion = 'future-model';
    const script = structuredClone(exported); script.scenarios.A.inputs.repair = '<img src=x onerror=window.injected=true>';
    const extra = structuredClone(exported); extra.results = { payload: 1 };
    for (const text of ['{', ' '.repeat(65537), JSON.stringify(schema), JSON.stringify(model), JSON.stringify(script), JSON.stringify(extra)]) {
      await upload(page, text); await page.locator('#scenario-error').waitFor({ state: 'visible' });
      assert.deepEqual(await readState(page), draft);
      assert.equal(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY), stored);
      assert.equal(await page.locator('#scenario-import-dialog').evaluate(node => node.open), false);
      assert.equal(await page.evaluate(() => window.injected), undefined);
      await languageCheck(page, 'en');
    }
  });
  await run('import preview, Escape, replacement and restored-source metadata are explicit and reversible for the draft', async () => {
    const draft = await readState(page);
    const incoming = createScenarioFile({ A: createSnapshot({ ...structuredClone(DEFAULT), capacity: '4' }), B: createSnapshot({ ...structuredClone(DEFAULT), capacity: '32' }) });
    await upload(page, JSON.stringify(incoming)); await page.locator('#scenario-import-dialog').waitFor({ state: 'visible' });
    assert.deepEqual(await readState(page), draft);
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'scenario-import');
    assert.deepEqual(await readState(page), draft);
    assert.deepEqual(JSON.parse(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).scenarios.A.inputs, stateA);
    await upload(page, JSON.stringify(incoming)); await page.locator('#scenario-import-confirm').click();
    assert.deepEqual(await readState(page), draft);
    await page.locator('#scenario-load-A').click(); assert.equal((await readState(page)).capacity, '4');
    await page.locator('#scenario-undo').click(); assert.deepEqual(await readState(page), draft);
    await upload(page, JSON.stringify(exported)); await page.locator('#scenario-import-confirm').click();
  });
  await run('summary contains complete inputs, exact results, model/source, assumptions and supplier questions', async () => {
    await page.locator('#scenario-summary').focus(); await page.keyboard.press('Enter');
    const content = await page.locator('#scenario-report').innerText();
    for (const term of [MODEL_VERSION, 'Schema 1', '3.14159', '8192', 'PVT', 'yield', 'content commit']) {
      assert.ok(content.includes(term), term);
    }
    assert.equal(await page.locator('#scenario-report table thead th[scope="colgroup"]').count(), 2);
    assert.equal(await page.locator('#scenario-report a[href*="sram-repair.html"]').getAttribute('href'), 'https://hub.samhuang68.org/sram-repair.html?lang=en#method');
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      // Native modal dialogs can pass through browser chrome (BODY is then active), but never background controls.
      assert.equal(await page.evaluate(() => document.activeElement === document.body || Boolean(document.activeElement.closest('#scenario-summary-dialog'))), true);
    }
    await page.evaluate(() => document.getElementById('capacity').focus());
    assert.notEqual(await page.evaluate(() => document.activeElement.id), 'capacity', 'the modal keeps background controls inert');
    await page.keyboard.press('Escape'); assert.equal(await page.evaluate(() => document.activeElement.id), 'scenario-summary');
    await page.locator('#scenario-summary').click(); await page.keyboard.press('Control+k');
    await page.locator('#searchOverlay input[type="search"]').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#scenario-summary-dialog').evaluate(node => node.open), false);
    assert.equal(await page.evaluate(() => document.activeElement.matches('#searchOverlay input[type="search"]')), true);
    await page.keyboard.press('Escape');
  });
  for (const lang of ['en', 'zh']) await run(`${lang} summary download, responsive layout and A4 print rendering`, async () => {
    if (lang === 'zh') await page.locator('#languageToggle').click();
    await page.locator('#scenario-summary').click(); await languageCheck(page, lang);
    const saved = await download(page, () => page.locator('#scenario-report-download').click(), `summary-${lang}.html`);
    assert.ok(!saved.text.includes('<script')); assert.ok(saved.text.includes(MODEL_VERSION));
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    const dialogWidth = await page.locator('#scenario-summary-dialog').evaluate(node => node.getBoundingClientRect().width);
    assert.ok(dialogWidth <= 390);
    assert.ok(await page.locator('#scenario-report .report-scroll').evaluate(node => node.scrollWidth > node.clientWidth), 'table has its own horizontal scroller');
    await page.screenshot({ path: path.join(output, `summary-mobile-${lang}.png`) });
    await page.setViewportSize({ width: 1440, height: 1050 });
    const reportPage = await ctx.newPage(); await reportPage.setContent(saved.text);
    await reportPage.screenshot({ path: path.join(output, `summary-desktop-${lang}.png`), fullPage: true });
    await reportPage.emulateMedia({ media: 'print' });
    const geometry = await reportPage.locator('.scenario-report').boundingBox();
    assert.ok(geometry.height <= 1032, `A4 content height ${geometry.height}`);
    if (['edge', 'chromium'].includes(engine)) {
      for (const [target, suffix] of [[reportPage, 'download'], [page, 'dialog']]) {
        await target.emulateMedia({ media: 'print' });
        const pdf = await target.pdf({ format: 'A4', preferCSSPageSize: true, printBackground: true });
        await fs.writeFile(path.join(output, `summary-${lang}-${suffix}.pdf`), pdf);
        await target.emulateMedia({ media: 'print' });
        await target.screenshot({ path: path.join(output, `print-${lang}-${suffix}.png`), fullPage: true });
        await fs.writeFile(path.join(output, `print-${lang}-${suffix}.json`), JSON.stringify(await target.evaluate(() => ({
          report: (document.querySelector('#scenario-summary-dialog[open] .scenario-report') || document.querySelector('.scenario-report')).getBoundingClientRect().toJSON(),
          body: document.body.getBoundingClientRect().toJSON(),
          dialog: document.querySelector('#scenario-summary-dialog')?.getBoundingClientRect().toJSON(),
          sections: [...document.querySelectorAll('.scenario-report > *')].filter(node => node.getClientRects().length).map(node => ({ tag: node.tagName, className: node.className, rect: node.getBoundingClientRect().toJSON() })),
        })), null, 2));
        assert.equal((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length, 1, `${lang} ${suffix} PDF is one page`);
        if (target === page) await target.emulateMedia({ media: 'screen' });
      }
    }
    await reportPage.close(); await page.locator('#scenario-summary-close').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'scenario-summary');
    await page.setViewportSize({ width: 390, height: 844 }); await languageCheck(page, lang);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: path.join(output, `scenarios-mobile-${lang}.png`), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 1050 });
  });
  await run('largest supported exact capacity and long accepted inputs remain printable in both languages', async () => {
    const long = value => value.padStart(36, '0');
    const extreme = { capacity: '9007.199254740991', unit: 'Tb', repair: '00000000000000000000000000000000001 / 00000000000000000000000000000000001', compression: long('1000'), mode: 'ratio', otp: { overhead: long('1000'), reserve: long('1000'), block: long('1024') }, efuse: { overhead: long('999'), reserve: long('999'), block: long('4096') } };
    assert.equal(estimate(extreme).capacity, 9007199254740991n);
    const incoming = createScenarioFile({ A: createSnapshot(extreme, exported.scenarios.A.source), B: createSnapshot(extreme, exported.scenarios.B.source) });
    await upload(page, JSON.stringify(incoming)); await page.locator('#scenario-import-confirm').click();
    for (const lang of ['en', 'zh']) {
      await page.locator('#languageToggle').click();
      await page.locator('#scenario-summary').click(); await languageCheck(page, lang);
      const saved = await download(page, () => page.locator('#scenario-report-download').click(), `extreme-summary-${lang}.html`);
      const reportPage = await ctx.newPage(); await reportPage.setContent(saved.text); await reportPage.emulateMedia({ media: 'print' });
      const box = await reportPage.locator('.scenario-report').boundingBox();
      assert.ok(box.height <= 1032, `${lang} largest supported scenario fits A4 at ${box.height}px`);
      await reportPage.screenshot({ path: path.join(output, `extreme-print-${lang}.png`), fullPage: true });
      if (['edge', 'chromium'].includes(engine)) for (const [target, suffix] of [[reportPage, 'download'], [page, 'dialog']]) {
        await target.emulateMedia({ media: 'print' });
        const pdf = await target.pdf({ format: 'A4', preferCSSPageSize: true, printBackground: true });
        await fs.writeFile(path.join(output, `extreme-summary-${lang}-${suffix}.pdf`), pdf);
        assert.equal((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length, 1, `${lang} largest supported ${suffix} PDF is one page`);
        if (target === page) await target.emulateMedia({ media: 'screen' });
      }
      await reportPage.close(); await page.locator('#scenario-summary-close').click();
    }
  });
  await ctx.close();
  await run('unavailable browser storage keeps current inputs and offers portable JSON', async () => {
    ({ ctx, page } = await context());
    await ctx.addInitScript(key => { const original = Storage.prototype.setItem; Storage.prototype.setItem = function(name, value) { if (name === key) throw new DOMException('Denied', 'QuotaExceededError'); return original.call(this, name, value); }; }, STORAGE_KEY);
    await page.goto(new URL('sram-repair.html?lang=en', base).href); await fillState(page, stateB);
    await page.locator('#scenario-save-A').click(); assert.deepEqual(await readState(page), stateB);
    assert.match(await page.locator('#scenario-storage-note').innerText(), /unavailable/);
    assert.deepEqual(parseScenarioFile((await download(page, () => page.locator('#scenario-export').click(), 'quota-fallback.json')).text).scenarios.A.inputs, stateB);
    await ctx.close();
  });
  await run('corrupt saved data is not overwritten and unavailable lineage is honestly unknown', async () => {
    ({ ctx, page } = await context());
    await ctx.addInitScript(key => localStorage.setItem(key, '{broken'), STORAGE_KEY);
    await ctx.route('**/data/release-lineage.json', route => route.abort());
    await page.goto(new URL('sram-repair.html?lang=zh', base).href);
    await page.locator('#scenario-error').waitFor({ state: 'visible' });
    assert.equal(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY), '{broken');
    assert.deepEqual(await readState(page), DEFAULT); await languageCheck(page, 'zh');
    await page.locator('#scenario-save-A').click(); await page.locator('#scenario-summary').click();
    assert.match(await page.locator('#scenario-report').innerText(), /來源版本未知/);
    assert.equal(await page.locator('#scenario-report a[href*="github.com"]').count(), 0);
    await ctx.close();
  });
  assert.deepEqual(errors, [], 'runtime errors');
  console.log(`${engine}: ${results.length} SRAM scenario checks passed.`);
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ engine, browserVersion: browser.version(), base, results, runtimeErrors: errors, printPdfVerified: ['edge', 'chromium'].includes(engine), realSafari: false }, null, 2) + '\n');
  await browser.close(); if (server) await server.close();
}
