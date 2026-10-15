import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

// 只驗本次新增區段、首頁入口保全與其實際目的地；不呼叫全站案例。
const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(root, process.env.NVM_QA_OUTPUT || 'qa/網站整合內容');
fs.mkdirSync(output, {recursive: true});
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data/nvm-knowledge-catalog.json'), 'utf8'));
const baseline = execFileSync('git', ['show', '14906df934820f94a6aeabb6823b632779faa179:index.html'], {cwd: root, encoding: 'utf8'});
const baselineStyle = execFileSync('git', ['show', '14906df934820f94a6aeabb6823b632779faa179:儲存狀態導讀.css'], {cwd: root, encoding: 'utf8'});
const selectedCase = process.argv.find(arg => arg.startsWith('--case='))?.slice(7);
assert.ok(!selectedCase || ['首頁與修補版面', '修補表格'].includes(selectedCase), '未知案例；拒絕略過驗證');
const patchOnly = selectedCase === '修補表格';
const baselineCatalog = JSON.parse(execFileSync('git', ['show', '14906df934820f94a6aeabb6823b632779faa179:data/nvm-knowledge-catalog.json'], {cwd: root, encoding: 'utf8'}));
assert.deepEqual(catalog.sections, baselineCatalog.sections, '保留原目錄與主題入口');
assert.deepEqual(catalog.taskPaths, baselineCatalog.taskPaths, '保留原任務入口');
assert.deepEqual(catalog.experiments.slice(0, 3), baselineCatalog.experiments, '保留原三群互動入口與文字');
assert.equal(catalog.experiments.length, 4, '第四群由同一 catalog 生成');
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const origin = new URL(base).origin;
const browser = await chromium.launch({headless: true, ...(process.env.NVM_QA_BROWSER === 'chromium' ? {} : {channel: 'msedge'})});
const results = [];
const allSections = [
  ['ai-nvm-opportunities.html', '#hbm4-bonding-power-evidence'],
  ['technology-comparison.html', '#hbm4-hybrid-evidence'],
  ['automotive-nvm.html', '#automotive-s32-memory-evidence'],
  ['iot-mcu-envm.html', '#cam-patch-timing-model'],
  ['secure-storage.html', '#spdm-ide-key-protection'],
  ['secure-storage.html', '#puf-helper-data-protection'],
  ['security-assurance.html', '#hybrid-rot-assurance']
];
const sections = selectedCase ? allSections.filter(([file]) => file === 'iot-mcu-envm.html') : allSections;
let expired = false;
const deadline = setTimeout(() => {expired = true; void browser.close();}, 140000);
async function capture(page, node, name) {
  await node.evaluate(element => {
    document.activeElement?.blur();
    window.scrollTo({top: window.scrollY + element.getBoundingClientRect().top - 180, behavior: 'instant'});
  });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await page.screenshot({path: path.join(output, name)});
}
async function geometry(page, node) {
  await node.scrollIntoViewIfNeeded();
  const measurement = await node.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return {左: rect.left, 右: rect.right, 寬: rect.width, 可視寬: document.documentElement.clientWidth,
      文件寬: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)};
  });
  assert.ok(measurement.寬 > 0 && measurement.左 >= -1 && measurement.右 <= measurement.可視寬 + 1, '區段必須完整位於可視水平範圍');
  assert.ok(measurement.文件寬 <= measurement.可視寬 + 1, '頁面不得水平溢位');
  return measurement;
}
try {
  for (const width of (patchOnly ? [390, 1440] : [390, 768, 1440])) for (const lang of ['zh', 'en']) {
    assert.equal(expired, false, '局部驗證不得逾時');
    const context = await browser.newContext({viewport: {width, height: 900}, serviceWorkers: 'block'});
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    page.setDefaultTimeout(7000);
    page.setDefaultNavigationTimeout(12000);
    let errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      if (!patchOnly) {
      if (!process.env.NVM_QA_BASE) {
        await page.route('**/index.html?*', route => route.fulfill({body: baseline, contentType: 'text/html'}));
        await page.route(url => decodeURIComponent(url.pathname).endsWith('/儲存狀態導讀.css'), route => route.fulfill({body: baselineStyle, contentType: 'text/css'}));
        await page.goto(`${base}index.html?lang=${lang}`, {waitUntil: 'load'});
        await capture(page, page.locator('.knowledge-experiments'), `首頁導覽-基準-${width}-${lang}.png`);
        await page.unrouteAll();
      }
      errors = [];
      await page.goto(`${base}index.html?lang=${lang}`, {waitUntil: 'load'});
      const groups = page.locator('.knowledge-experiment-groups > div');
      assert.equal(await groups.count(), 4);
      const expected = catalog.experiments.flatMap(group => group.links.map(link => link.url));
      assert.deepEqual(await page.locator('.knowledge-experiment-groups a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), expected);
      const homeGeometry = await geometry(page, page.locator('.knowledge-experiments'));
      const columns = await page.locator('.knowledge-experiment-groups').evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length);
      assert.equal(columns, width === 390 ? 1 : width === 768 ? 2 : 4, '首頁依視窗提供一、二、四欄且不遺落分群');
      await capture(page, page.locator('.knowledge-experiments'), `首頁導覽-整合-${width}-${lang}.png`);
      assert.equal(await groups.locator(`[data-lang=${lang === 'en' ? 'zh' : 'en'}]:visible`).count(), 0);
      assert.deepEqual(errors, [], '首頁不得出現頁面例外');
      // 各語言在窄螢幕實際以鍵盤啟動四個新入口，確認目的地區段可見。
      if (width === 390) for (const link of catalog.experiments[3].links) {
        await page.goto(`${base}index.html?lang=${lang}`, {waitUntil: 'load'});
        const anchor = page.locator(`.knowledge-experiment-groups a[href="${link.url}"]`);
        await anchor.focus();
        await Promise.all([page.waitForURL(url => url.hash === new URL(link.url, base).hash), anchor.press('Enter')]);
        await page.waitForLoadState('load');
        const id = new URL(link.url, base).hash;
        assert.ok(await page.locator(id).isVisible(), `首頁入口必須到達可見區段：${link.url}`);
      }
      results.push({項目: '首頁四群導覽', 寬度: width, 語言: lang, 通過: true, 畫面範圍: homeGeometry});
      }
      for (const [file, selector] of (width === 768 ? [] : sections)) {
        errors = [];
        await page.goto(`${base}${file}?lang=${lang}${selector}`, {waitUntil: 'load'});
        const node = page.locator(selector);
        assert.equal(await page.locator('body').getAttribute('data-language'), lang);
        assert.ok(await node.isVisible(), '新增內容必須可見');
        assert.equal(await node.locator(`[data-lang=${lang === 'en' ? 'zh' : 'en'}]:visible`).count(), 0, '另一語言不可混入');
        const content = await node.innerText();
        assert.ok(content.length > 100, '須呈現實際內容');
        if (lang === 'en') assert.doesNotMatch(content, /[\p{Script=Han}]/u, '英文區段不應混入繁中文字');
        assert.ok(await node.locator('a[href^="https://"]').count() > 0, '新增技術內容須有原始來源連結');
        for (const href of await node.locator('a').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')).filter(Boolean))) {
          if (/^https?:/.test(href)) continue;
          const url = new URL(href, new URL(file, base));
          const local = fs.readFileSync(path.join(root, decodeURIComponent(url.pathname.split('/').pop() || file)), 'utf8');
          if (url.hash) assert.ok(local.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `內部引用錨點須存在：${href}`);
        }
        const size = await geometry(page, node);
        if (selector === '#cam-patch-timing-model' && width === 390) {
          const scroller = page.locator('#cam-patch-table-scroll');
          const columnsFit = await scroller.evaluate(el => [...el.querySelectorAll('tr')][1].cells[2].getBoundingClientRect().width <= el.clientWidth);
          assert.ok(columnsFit, '手機水平捲動區必須容納完整單一比較欄，不能讓左右字句同時裁切');
          await scroller.focus();
          await page.keyboard.press('ArrowRight');
          await page.waitForFunction(() => document.querySelector('#cam-patch-table-scroll').scrollLeft > 0);
          await scroller.evaluate(el => { el.scrollLeft = el.scrollWidth; });
          await capture(page, scroller, `修補比較表-最右欄-${width}-${lang}.png`);
          await scroller.evaluate(el => { el.scrollLeft = 0; el.blur(); });
        }
        await capture(page, node, `${selector.slice(1)}-${width}-${lang}.png`);
        assert.deepEqual(errors, [], '修改頁面不得出現頁面例外');
        results.push({項目: `${file}${selector}`, 寬度: width, 語言: lang, 通過: true, 畫面範圍: size});
      }
    } catch (error) {
      results.push({項目: page.url(), 寬度: width, 語言: lang, 通過: false, 原因: error.message, 頁面例外: errors});
    } finally { await context.close(); }
  }
} finally {
  clearTimeout(deadline);
  fs.writeFileSync(path.join(output, '整合內容驗證結果.json'), JSON.stringify({瀏覽器: browser.version(), 超時: expired, 結果: results}, null, 2));
  await browser.close();
  await server?.close();
}
console.log(JSON.stringify({項目: results.length, 通過: results.filter(item => item.通過).length, 失敗: results.filter(item => !item.通過)}, null, 2));
if (expired || results.length !== sections.length * 4 + (patchOnly ? 0 : 6) || results.some(item => !item.通過)) process.exitCode = 1;
