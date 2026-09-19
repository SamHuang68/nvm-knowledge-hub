import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';
import { startTestServer } from '../../../scripts/驗證伺服器.mjs';
import { nvmIpSpecs } from '../src/data/nvm_specs.js';
import { localizeProfile } from '../src/data/設定檔語系.js';
import { serializeCSV, selectProfiles } from '../src/js/modules/matrix.js';

const root = path.resolve(fileURLToPath(new URL('../../../', import.meta.url)));
const output = process.env.NVM_QA_OUT || path.join(root, 'qa', '雙語修正部署', '白皮書語系');
await mkdir(output, { recursive: true });
const localServer = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = (process.env.NVM_QA_BASE || localServer.base).replace(/\/?$/, '/');
const channel = process.env.NVM_QA_BROWSER || 'msedge';
const browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
const context = await browser.newContext({ viewport: { width: 1440, height: 960 }, serviceWorkers: 'block', acceptDownloads: true });
const page = await context.newPage();
const result = { base, browser: channel, sourcePreview: process.env.NVM_QA_SOURCE === '1', views: [], filters: [], downloads: [], languageRoundTrips: [], errors: [], passed: false };
page.on('pageerror', error => result.errors.push(error.message));

// 可在最終統一建置前驗證來源，全部覆寫只存在於本次瀏覽器記憶體。
if (process.env.NVM_QA_SOURCE === '1') {
  assert.ok(!process.env.NVM_QA_BASE, '來源預覽僅能在本機使用');
  const { build } = await import('vite');
  const studioRoot = new URL('../', import.meta.url);
  let html = await readFile(new URL('公開入口樣板.html.tpl', studioRoot), 'utf8');
  const modules = { overview: ['phase1_kb_view', 'renderPhase1KB'], whitepaper: ['phase2_reader', 'renderPhase2Reader'], selector: ['matrix', 'renderMatrix'], taxonomy: ['phase4_meta_view', 'renderPhase4Metadata'], templates: ['phase3_template_view', 'renderPhase3Templates'] };
  for (const [name, [module, renderName]] of Object.entries(modules)) {
    const container = { innerHTML: '', querySelector: () => null };
    (await import(`../src/js/modules/${module}.js`))[renderName](container);
    html = html.replace(`{{${name}}}`, () => container.innerHTML);
  }
  const compiled = await build({ root: fileURLToPath(studioRoot), configFile: fileURLToPath(new URL('vite.config.js', studioRoot)), logLevel: 'silent' });
  const responses = new Map([['index.html', { contentType: 'text/html', body: html }], ['assets/whitepaper_i18n.js', { contentType: 'text/javascript', body: await readFile(new URL('src/js/白皮書語系.js', studioRoot), 'utf8') }]]);
  for (const chunk of (Array.isArray(compiled) ? compiled : [compiled]).flatMap(item => item.output)) responses.set(`assets/${chunk.fileName}`, { contentType: chunk.fileName.endsWith('.css') ? 'text/css' : 'text/javascript', body: chunk.type === 'chunk' ? chunk.code : chunk.source });
  await page.route('**/whitepaper/**', route => {
    const resource = responses.get(decodeURIComponent(new URL(route.request().url()).pathname).split('/whitepaper/')[1]);
    return resource ? route.fulfill(resource) : route.continue();
  });
}

await context.tracing.start({ screenshots: true, snapshots: true });
const visibleStrings = () => page.evaluate(() => {
  const texts = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const element = node.parentElement;
    if (!element || element.closest('script,style,noscript,.language-toggle,#languageToggle,option')) continue;
    const value = node.nodeValue.trim();
    if (!value) continue;
    const range = document.createRange(); range.selectNodeContents(node);
    if (!range.getClientRects().length || getComputedStyle(element).visibility === 'hidden') continue;
    texts.push(value);
  }
  return texts;
});

try {
  for (const language of ['en', 'zh']) {
    await page.goto(new URL(`whitepaper/index.html?lang=${language}`, base).href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(lang => window.HubLanguage?.get() === lang && !!document.querySelector('#filter-family'), language);
    for (const view of ['overview', 'whitepaper', 'selector', 'taxonomy', 'templates']) {
      await page.locator(`.view-tab[data-view="${view}"]`).click();
      await page.waitForFunction(id => !document.querySelector(`#panel-${id}`).hidden, view);
      const strings = await visibleStrings();
      const cjk = strings.filter(value => /[\u3400-\u9fff]/u.test(value));
      if (language === 'en') assert.deepEqual(cjk, [], `英文 ${view} 出現中文`);
      const wrongLanguage = await page.locator(`#panel-${view} [data-lang="${language === 'en' ? 'zh' : 'en'}"]`).evaluateAll(elements => elements.filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden').map(element => element.textContent));
      assert.deepEqual(wrongLanguage, [], `${view} 顯示了另一語系內容`);
      const englishCandidates = language === 'zh' ? strings.filter(value => /[A-Za-z]+(?:[ -]+[A-Za-z]+){3,}/.test(value) && !/[\u3400-\u9fff]/u.test(value)) : [];
      assert.deepEqual(englishCandidates, [], `繁中 ${view} 出現英文敘述`);
      result.views.push({ language, view, strings, englishCandidates, wrongLanguage });
    }
    await page.locator('.view-tab[data-view="selector"]').click();
    for (const family of ['ALL', ...new Set(nvmIpSpecs.map(item => item.family))]) {
      await page.locator('#filter-family').selectOption(family);
      const expected = selectProfiles(family).map(profile => localizeProfile(profile, language));
      assert.deepEqual(await page.locator('#decision-body tr').evaluateAll(rows => rows.map(row => row.dataset.profileId)), expected.map(profile => profile.id));
      const selectedLabel = await page.locator('#filter-family option:checked').textContent();
      assert.equal(selectedLabel, family === 'ALL' ? language === 'zh' ? '全部公開設定檔（12）' : 'All public profiles (12)' : expected[0].family);
      for (const profile of expected) {
        const rowText = await page.locator(`[data-profile-id="${profile.id}"]`).innerText();
        for (const field of ['profile', 'family', 'contract', 'updateModel', 'strongestFit', 'evidenceStatus', 'latency', 'busExposure', 'bomCost']) assert.ok(rowText.includes(profile[field]), `${language} ${profile.id}.${field} 未顯示正確語系`);
        assert.ok(rowText.includes(profile.evidenceReview.scope));
      }
      result.filters.push({ language, family, selectedLabel, ids: expected.map(profile => profile.id) });
      for (const format of ['csv', 'json']) {
        const pending = page.waitForEvent('download');
        await page.locator(`#btn-export-${format}`).click();
        const download = await pending;
        const bytes = await readFile(await download.path(), 'utf8');
        if (format === 'json') assert.deepEqual(JSON.parse(bytes), expected);
        else assert.equal(bytes, serializeCSV(selectProfiles(family), language));
        const filename = `${language}-${family === 'ALL' ? '全部' : expected[0].id}.${format}`;
        await download.saveAs(path.join(output, filename));
        assert.equal(download.suggestedFilename(), language === 'zh' ? `NVM_決策矩陣.${format}` : `NVM_Decision_Matrix.${format}`);
        result.downloads.push({ language, family, format, profiles: expected.length, filename });
      }
    }
    await page.locator('#filter-family').selectOption('ALL');
    const contrast = await page.locator('#decision-body tr:first-child td').first().evaluate(cell => {
      const rgb = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
      const luminance = value => rgb(value).map(channel => channel / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [.2126, .7152, .0722][index], 0);
      const foreground = getComputedStyle(cell).color;
      const background = getComputedStyle(cell.closest('tr')).backgroundColor;
      const a = luminance(foreground), b = luminance(background);
      return { foreground, background, ratio: (Math.max(a, b) + .05) / (Math.min(a, b) + .05) };
    });
    assert.ok(contrast.ratio >= 4.5, `決策矩陣文字對比不足：${contrast.ratio}`);
    result.views.push({ language, view: 'selector-contrast', contrast });
    await page.locator('#panel-selector').screenshot({ path: path.join(output, `${language}-矩陣.png`) });
  }
  await page.locator('#filter-family').selectOption(nvmIpSpecs[10].family);
  for (const language of ['en', 'zh', 'en']) {
    if (await page.evaluate(() => window.HubLanguage.get()) !== language) await page.locator('#languageToggle').click();
    await page.waitForFunction(lang => window.HubLanguage.get() === lang, language);
    const profile = localizeProfile(nvmIpSpecs[10], language);
    assert.equal(await page.locator('#filter-family option:checked').textContent(), profile.family);
    assert.ok((await page.locator('#decision-body').innerText()).includes(profile.updateModel));
    result.languageRoundTrips.push({ language, id: profile.id, selectedLabel: profile.family });
  }
  assert.deepEqual(result.errors, [], '瀏覽器發生程式錯誤');
  result.passed = true;
} catch (error) {
  result.failure = error.stack;
  process.exitCode = 1;
} finally {
  await writeFile(path.join(output, '白皮書雙語驗證.json'), JSON.stringify(result, null, 2));
  await context.tracing.stop({ path: path.join(output, '白皮書雙語追蹤.zip') });
  await browser.close();
  await localServer?.close();
}
if (!result.passed) throw new Error(result.failure);
console.log(`白皮書雙語驗證通過：${result.views.length} 個視圖狀態、${result.filters.length} 組篩選、${result.downloads.length} 個實際下載與 ${result.languageRoundTrips.length} 次往返語系。`);
