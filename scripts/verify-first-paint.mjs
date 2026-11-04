// 首屏內容靜態化驗收：「失敗即關閉」區塊（5 頁）、atlas 的章節導覽列與搜尋按鈕直接寫在 HTML，
// 和拿掉靜態內容後由腳本建立的結果一致（內容、位置、每個步驟按下後的說明），
// 而且靜態版本在 DOMContentLoaded 時就已在最終位置（載入後不再插入而推動版面）。
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const results = [];
const errors = [];
const note = (passed, label, detail = {}) => results.push({passed: Boolean(passed), label, ...detail});
const FAIL_PAGES = ['security-assurance.html', 'iot-mcu-envm.html', 'automotive-nvm.html', 'ai-nvm-opportunities.html', 'specialty-nvm.html'];
const ATLAS_PAGES = ['nvm-technology-atlas.html', 'nvm-technology-atlas-zh.html'];
// 拿掉靜態內容，還原成由腳本建立的舊頁面。
const legacy = html => html
  .replace(/<!-- hub-fail-closed:static:start -->[\s\S]*?<!-- hub-fail-closed:static:end -->\n?/, '')
  .replace(/<button id="searchTrigger"[\s\S]*?<\/button>(?=<button type="button" id="languageToggle")/, '')
  .replace(/<nav class="nvm-reading-position"[\s\S]*?<\/nav>/, '');
// 比對最終狀態用：靜態按鈕多帶的 data-note-* 不算差異。
const capture = `document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('hub-fail-closed'), nav = document.querySelector('.nvm-reading-position'), trigger = document.getElementById('searchTrigger');
  window.__atReady = {box: Boolean(box), boxParent: box?.parentElement?.className || '', boxPrevious: box?.previousElementSibling?.className || '', nav: nav?.previousElementSibling?.className || null, trigger: trigger?.nextElementSibling?.id || null};
}, {once: true, capture: true});`;
const snapshot = () => {
  const strip = html => html.replace(/ data-note-(?:en|zh)="[^"]*"/g, '');
  const box = document.getElementById('hub-fail-closed'), nav = document.querySelector('.nvm-reading-position'), trigger = document.getElementById('searchTrigger');
  return {
    box: box ? strip(box.outerHTML) : null, boxParent: box?.parentElement?.className || '', boxPrevious: box?.previousElementSibling?.className || '',
    nav: nav ? nav.outerHTML.replace(/<option[\s\S]*?<\/option>/g, '') : null, options: nav?.querySelectorAll('option').length || 0, navPrevious: nav?.previousElementSibling?.className || null,
    trigger: trigger?.outerHTML || null, triggerNext: trigger?.nextElementSibling?.id || null,
    title: document.getElementById('hero-title')?.innerHTML || null, lead: document.querySelector('.lead-desc')?.innerHTML || null,
  };
};

const server = await startTestServer(root);
const browser = await chromium.launch({headless: true});
try {
  for (const page of [...FAIL_PAGES, ...ATLAS_PAGES]) {
    const language = page === 'nvm-technology-atlas.html' ? 'en' : 'zh';
    const states = {};
    for (const mode of ['static', 'legacy']) {
      const context = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
      const tab = await context.newPage();
      tab.on('pageerror', error => errors.push(`${page} ${mode}: ${error.message}`));
      await tab.addInitScript({content: capture});
      if (mode === 'legacy') await tab.route(address => decodeURIComponent(address.pathname) === '/' + page, async route => {
        const response = await route.fetch();
        route.fulfill({response, body: legacy(await response.text())});
      });
      await tab.goto(`${server.base}${page}?lang=${language}`, {waitUntil: 'load'});
      await tab.waitForTimeout(1500);
      const final = await tab.evaluate(snapshot);
      // 依序按下每個步驟，記錄說明（最後回到第一步）。
      const notes = await tab.evaluate(async () => {
        const box = document.getElementById('hub-fail-closed');
        if (!box) return [];
        const out = [];
        for (const button of box.querySelectorAll('.hub-story-step')) {
          button.click();
          await new Promise(resolve => setTimeout(resolve, 30));
          out.push({note: box.querySelector('.hub-story-note')?.innerHTML, on: [...box.querySelectorAll('.hub-story-step')].map(el => el.classList.contains('is-on') + '/' + el.getAttribute('aria-pressed')).join(',')});
        }
        return out;
      });
      states[mode] = {final, notes, atReady: await tab.evaluate(() => window.__atReady)};
      await context.close();
    }
    const {static: now, legacy: before} = states;
    if (FAIL_PAGES.includes(page)) {
      note(now.final.box && now.final.box === before.final.box, `失敗即關閉區塊的最終內容與腳本建立的相同（${page}）`, {static: now.final.box?.slice(0, 160), legacy: before.final.box?.slice(0, 160)});
      note(now.final.boxParent === before.final.boxParent && now.final.boxPrevious === before.final.boxPrevious, `區塊位置與腳本插入處相同（${page}）`, {static: [now.final.boxParent, now.final.boxPrevious], legacy: [before.final.boxParent, before.final.boxPrevious]});
      note(now.notes.length >= 3 && JSON.stringify(now.notes) === JSON.stringify(before.notes), `每個步驟按下後的說明與切換狀態相同（${page}）`, {static: now.notes.map(item => item.on), legacy: before.notes.map(item => item.on)});
      note(now.atReady.box && now.atReady.boxParent === now.final.boxParent && now.atReady.boxPrevious === now.final.boxPrevious, `DOMContentLoaded 時區塊已在最終位置（${page}）`, now.atReady);
    } else {
      note(now.final.nav && now.final.nav === before.final.nav && now.final.options === before.final.options && now.final.options > 0 && now.final.navPrevious === before.final.navPrevious, `章節導覽列的最終內容、選項數與位置與腳本建立的相同（${page}）`, {static: now.final.nav?.slice(0, 200), legacy: before.final.nav?.slice(0, 200), options: [now.final.options, before.final.options]});
      note(now.final.trigger && now.final.trigger === before.final.trigger && now.final.triggerNext === 'languageToggle', `搜尋按鈕與腳本建立的相同、位在語言切換之前（${page}）`);
      note(now.atReady.nav === 'nvm-header' && now.atReady.trigger === 'languageToggle', `DOMContentLoaded 時導覽列與搜尋按鈕已在最終位置（${page}）`, now.atReady);
      // atlas 的腳本是 module，會在 DOMContentLoaded 前執行，上一項分辨不出是否寫在 HTML；直接看伺服器回傳的原始碼。
      const source = await (await fetch(`${server.base}${page}`)).text();
      note(/<\/header><nav class="nvm-reading-position"/.test(source) && /<button id="searchTrigger"[^]*?<\/button><button type="button" id="languageToggle"/.test(source), `原始 HTML 已含導覽列（頁首之後）與搜尋按鈕（語言切換之前）（${page}）`);
    }
  }
  // 車用頁的主標題與導言就是 hub-auto-tune.js 的最終文字：靜態版本載入當下與腳本跑完後相同。
  const context = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
  const tab = await context.newPage();
  await tab.addInitScript({content: `document.addEventListener('DOMContentLoaded', () => { window.__title = document.getElementById('hero-title')?.innerHTML; window.__lead = document.querySelector('.lead-desc')?.innerHTML; }, {once: true, capture: true});`});
  await tab.goto(`${server.base}automotive-nvm.html?lang=zh`, {waitUntil: 'load'});
  await tab.waitForTimeout(1500);
  const heading = await tab.evaluate(() => ({before: [window.__title, window.__lead], after: [document.getElementById('hero-title')?.innerHTML, document.querySelector('.lead-desc')?.innerHTML]}));
  note(heading.before[0] && JSON.stringify(heading.before) === JSON.stringify(heading.after), '車用頁主標題與導言載入當下就是最終文字', heading);
  await context.close();
  // 安全保證頁：區塊放在主圖之後（放進主圖格線會佔滿兩欄，把訊號面板擠到下方）；1440 寬時面板與文案同一列、在右側。
  const assurance = await browser.newContext({viewport: {width: 1440, height: 900}, serviceWorkers: 'block'});
  const view = await assurance.newPage();
  await view.goto(`${server.base}security-assurance.html?lang=zh`, {waitUntil: 'load'});
  await view.waitForTimeout(1500);
  const hero = await view.evaluate(() => {
    const rect = selector => document.querySelector(selector)?.getBoundingClientRect();
    const copy = rect('.hero-copy'), panel = rect('.signal-panel'), box = document.getElementById('hub-fail-closed');
    return {sameRow: panel.top < copy.bottom && panel.bottom > copy.top, rightOfCopy: panel.left >= copy.right, boxAfterHero: box?.previousElementSibling?.classList.contains('hero') && box.parentElement.tagName === 'MAIN'};
  });
  note(hero.sameRow && hero.rightOfCopy && hero.boxAfterHero, '安全保證頁 1440：訊號面板在文案右側同一列，失敗即關閉區塊在主圖之後', hero);
  await assurance.close();
} finally {
  await browser.close();
  await server.close();
}
note(!errors.length, '沒有頁面錯誤', {errors: errors.slice(0, 5)});
const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({passed: results.length - failed.length, total: results.length, failed: failed.slice(0, 12)}, null, 2));
process.exitCode = failed.length ? 1 : 0;
