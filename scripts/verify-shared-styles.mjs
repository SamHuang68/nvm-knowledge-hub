// 共用樣式靜態化驗收：每個載入 site-language.js 的頁面，靜態寫入的樣式表與 body 類別，
// 和還原舊 HTML 後由 site-language.js 插入的結果完全一致（最終 <head> 樣式表順序、body 類別），
// 而且靜態版本在 DOMContentLoaded 前就已是最終狀態（之後不再插入或搬移）、沒有重複載入。
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {MANAGED_BODY_CLASSES, SHARED_STYLE_EXCLUDED} from './hub-shared-styles.mjs';

const root = path.resolve(import.meta.dirname, '..');
const results = [];
const errors = [];
const note = (passed, label, detail = {}) => results.push({passed: Boolean(passed), label, ...detail});
const pages = execFileSync('git', ['-c', 'core.quotepath=false', 'ls-files', '*.html'], {cwd: root, encoding: 'utf8'}).trim().split('\n')
  .filter(page => /<script src="(?:\.\.\/)*site-language\.js\?v=/.test(fs.readFileSync(path.join(root, page), 'utf8')));
// 還原成靜態化之前的 HTML：拿掉兩個區塊、標記與受管 body 類別。
const legacy = html => html
  .replace(/<!-- hub-shared-styles:(head|tail):start -->[\s\S]*?<!-- hub-shared-styles:\1:end -->/g, '')
  .replace('<html data-hub-static-styles', '<html')
  .replace(/(<body\b[^>]*\sclass=")([^"]*)(")/, (all, start, value, end) => start + value.split(' ').filter(name => !MANAGED_BODY_CLASSES.includes(name)).join(' ').trim() + end);
const capture = `document.addEventListener('DOMContentLoaded', () => {
  window.__beforeReady = [...document.head.querySelectorAll('link[rel=stylesheet], style')].map(node => node.tagName === 'STYLE' ? '<style>' : new URL(node.href).pathname + new URL(node.href).search);
  window.__classesBeforeReady = [...document.body.classList].sort();
}, {once: true, capture: true});`;

const server = await startTestServer(root);
const browser = await chromium.launch({headless: true});
try {
  for (const page of pages) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    const excluded = SHARED_STYLE_EXCLUDED.has(page);
    note(excluded !== html.includes('<html data-hub-static-styles'), `${excluded ? '排除頁不加' : '頁面帶'}靜態樣式標記（${page}）`);
    if (excluded) continue;
    const language = page === 'nvm-technology-atlas.html' ? 'en' : 'zh';
    const states = {};
    for (const mode of ['static', 'legacy']) {
      const tab = await browser.newPage({viewport: {width: 1440, height: 900}});
      tab.on('pageerror', error => errors.push(`${page} ${mode}: ${error.message}`));
      await tab.addInitScript({content: capture});
      if (mode === 'legacy') await tab.route(address => decodeURIComponent(address.pathname) === '/' + page, async route => {
        const response = await route.fetch();
        route.fulfill({response, body: legacy(await response.text())});
      });
      await tab.goto(`${server.base}${page}?lang=${language}`, {waitUntil: 'load'});
      await tab.waitForTimeout(800);
      states[mode] = await tab.evaluate(() => ({
        final: [...document.head.querySelectorAll('link[rel=stylesheet], style')].map(node => node.tagName === 'STYLE' ? '<style>' : new URL(node.href).pathname + new URL(node.href).search),
        classes: [...document.body.classList].sort(),
        beforeReady: window.__beforeReady,
        classesBeforeReady: window.__classesBeforeReady,
      }));
      await tab.close();
    }
    const {static: now, legacy: before} = states;
    note(now.final.length > 0 && JSON.stringify(now.final) === JSON.stringify(before.final), `最終樣式表順序與原本相同（${page}）`, {static: now.final.slice(-8), legacy: before.final.slice(-8)});
    note(JSON.stringify(now.classes) === JSON.stringify(before.classes), `body 類別與原本相同（${page}）`, {static: now.classes, legacy: before.classes});
    note(JSON.stringify(now.beforeReady) === JSON.stringify(now.final) && JSON.stringify(now.classesBeforeReady) === JSON.stringify(now.classes), `DOMContentLoaded 前已是最終樣式表與類別（${page}）`, {beforeReady: now.beforeReady?.slice(-8)});
    const hrefs = now.final.filter(href => href !== '<style>');
    note(new Set(hrefs).size === hrefs.length, `沒有重複載入的樣式表（${page}）`);
  }
  // site-language.js 插入的腳本依插入順序執行：讓 hub-story-maps.js 晚 1 秒到，hub-auto-tune.js 仍須在它之後改寫「失敗即關閉」區塊。
  const tab = await browser.newPage({viewport: {width: 1440, height: 900}});
  await tab.route(address => address.pathname.endsWith('/hub-story-maps.js'), async route => { await new Promise(resolve => setTimeout(resolve, 1000)); route.continue(); });
  await tab.goto(`${server.base}automotive-nvm.html?lang=zh`, {waitUntil: 'load'});
  await tab.waitForTimeout(1500);
  const block = await tab.evaluate(() => { const fail = document.getElementById('hub-fail-closed'); return {moved: fail?.classList.contains('hub-auto-moved'), title: fail?.querySelector('h3')?.textContent.trim()}; });
  note(block.moved && block.title?.includes('任何 ASIL 句子之前先走四關'),'插入的腳本依序執行：hub-story-maps.js 晚到時，車用頁仍由 hub-auto-tune.js 改寫失敗即關閉區塊', block);
  await tab.close();
} finally {
  await browser.close();
  await server.close();
}
note(!errors.length, '沒有頁面錯誤', {errors: errors.slice(0, 5)});
const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({passed: results.length - failed.length, total: results.length, failed: failed.slice(0, 12)}, null, 2));
process.exitCode = failed.length ? 1 : 0;
