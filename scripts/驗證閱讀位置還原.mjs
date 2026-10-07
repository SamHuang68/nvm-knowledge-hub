import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = new URL(process.env.NVM_QA_BASE || server.base);
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa', '閱讀位置還原'));
fs.mkdirSync(output, {recursive:true});
const browser = await chromium.launch({headless:true, channel:process.env.NVM_QA_CHANNEL || 'msedge'});
const results = [];
const stateKey = '__nvmReadingPosition';

const snapshot = page => page.evaluate(() => ({
  網址:location.pathname + location.search + location.hash,
  章節:[...document.querySelectorAll('[data-nvm-panel]')].find(panel => !panel.hidden)?.id,
  垂直位置:scrollY, 水平位置:scrollX,
  焦點:document.activeElement?.tagName,
  狀態:history.state,
  原生還原模式:history.scrollRestoration
}));

async function check(name, options, test) {
  if (process.env.NVM_QA_FILTER && !name.includes(process.env.NVM_QA_FILTER)) return;
  const context = await browser.newContext({serviceWorkers:'block', viewport:{width:options.width || 1440, height:options.height || 900}});
  await context.route('**/*', route => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [], trace = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await test(page, trace);
    assert.deepEqual(errors, [], '沒有頁面未處理例外');
    await page.screenshot({path:path.join(output, `${name}.png`)});
    results.push({名稱:name, 通過:true, 軌跡:trace});
  } catch (error) {
    trace.push({動作:'失敗當下', ...await snapshot(page).catch(() => ({}))});
    results.push({名稱:name, 通過:false, 原因:error.message, 軌跡:trace, 頁面錯誤:errors});
    await page.screenshot({path:path.join(output, `${name}-失敗.png`)}).catch(() => {});
  } finally {await context.close();}
}

async function visit(page, hash = 'research', language = 'zh') {
  await page.goto(new URL(`nvm-technology-atlas${language === 'zh' ? '-zh' : ''}.html?lang=${language}#${hash}`, base).href);
  await page.locator('.nvm-reading-position').waitFor();
  await page.waitForFunction(id => document.getElementById(id)?.hidden === false, hash.startsWith('research-') ? 'research' : hash);
  await page.waitForTimeout(180);
}

async function readFurther(page, distance = 1700) {
  await page.evaluate(amount => scrollBy({top:amount, behavior:'instant'}), distance);
  await page.waitForTimeout(200);
  return snapshot(page);
}

async function activateChapterButton(page, selector) {
  // locator.click 會對 sticky 控制項先捲動文件；用使用者所見位置點擊，保留真實閱讀座標。
  const box = await page.locator(selector).boundingBox();
  assert.ok(box && box.y >= 0 && box.y + box.height <= page.viewportSize().height, '章節按鈕在有效視窗內');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function restored(page, expected) {
  await page.waitForFunction(value => {
    const active = [...document.querySelectorAll('[data-nvm-panel]')].find(panel => !panel.hidden);
    return active?.id === value.章節 && Math.abs(scrollY - value.垂直位置) <= 3;
  }, expected);
  assert.ok(Math.abs((await snapshot(page)).垂直位置 - expected.垂直位置) <= 3, '還原原閱讀位置');
}

try {
  for (const width of [1440, 390]) await check(`前後章與選章返回-${width}`, {width}, async (page, trace) => {
    await visit(page);
    const first = await readFurther(page);
    trace.push({動作:'章內閱讀', ...first});
    await activateChapterButton(page, '[data-chapter-next]');
    await page.waitForFunction(() => location.hash === '#topic-efuse' && !document.getElementById('topic-efuse').hidden);
    const second = await readFurther(page, 650);
    trace.push({動作:'下一章閱讀', ...second});
    await page.goBack(); await restored(page, first);
    trace.push({動作:'返回第一章', ...await snapshot(page)});
    await page.goForward(); await restored(page, second);
    trace.push({動作:'前進第二章', ...await snapshot(page)});
    await page.locator('#nvm-current-chapter').selectOption('research');
    await page.waitForFunction(() => location.hash === '#research' && !document.getElementById('research').hidden);
    assert.ok((await snapshot(page)).垂直位置 < first.垂直位置 - 500, '主動選章定位章首');
    await page.goBack(); await restored(page, second);
    assert.equal((await snapshot(page)).原生還原模式, 'auto', '不改全域原生還原模式');
    if (width === 390) assert.ok(await page.locator('.nvm-reading-position label').evaluate(element => element.getBoundingClientRect().height > 10), '窄螢幕仍可讀章序');
  });

  await check('同章深層錨點與鍵盤返回', {}, async (page, trace) => {
    await visit(page, 'research-everspin');
    assert.equal(await page.locator('#research-everspin h3').evaluate(element => element === document.activeElement), true, '初次深層連結聚焦節標題');
    const first = await readFurther(page, 450);
    trace.push({動作:'第一子節閱讀', ...first});
    await page.evaluate(() => document.querySelector('#research a[href="#research-ibm"]').click());
    await page.waitForFunction(() => location.hash === '#research-ibm' && document.activeElement === document.querySelector('#research-ibm h3'));
    const second = await readFurther(page, 300);
    trace.push({動作:'第二子節閱讀', ...second});
    await page.goBack(); await restored(page, first);
    await page.goForward(); await restored(page, second);
    const link = page.locator('.nvm-sidebar a[href="#foundry"]');
    await link.focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(() => !document.getElementById('foundry').hidden && document.activeElement === document.querySelector('#foundry h2'));
    trace.push({動作:'鍵盤側欄定位', ...await snapshot(page)});
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.closest('#foundry')?.id), 'foundry', '定位後 Tab 留在目的章可互動內容');
    await page.locator('a[href="#main-content"]').focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(() => location.hash === '#main-content' && document.activeElement === document.querySelector('#foundry h2'));
    const skipped = await readFurther(page, 400);
    await activateChapterButton(page, '[data-chapter-next]');
    await page.waitForFunction(() => location.hash !== '#main-content');
    await page.goBack(); await restored(page, skipped);
    assert.equal(await page.locator('#nvm-current-chapter').inputValue(), 'foundry', '略過導覽歷史項目還原原章節');
    trace.push({動作:'略過導覽返回原章', ...await snapshot(page)});
  });

  await check('外來與無效歷史狀態', {}, async (page, trace) => {
    await visit(page);
    await page.evaluate(key => history.replaceState({外來資料:{值:'保留'}, [key]:{version:1, route:location.pathname + '#research-ibm', panelId:'research', x:0, y:'無效'}}, '', '#research-ibm'), stateKey);
    await page.evaluate(() => history.pushState({外來資料:{值:'下一項'}}, '', '#topic-efuse'));
    await page.evaluate(() => dispatchEvent(new HashChangeEvent('hashchange')));
    await page.goBack();
    await page.waitForFunction(() => !document.getElementById('research').hidden && document.activeElement === document.querySelector('#research-ibm h3'));
    const invalid = await snapshot(page); trace.push({動作:'無效狀態回到錨點', ...invalid});
    assert.deepEqual(invalid.狀態.外來資料, {值:'保留'}, '保留其他名稱空間的狀態');
    assert.ok(Number.isFinite(invalid.垂直位置), '無效座標不造成例外');
    const deep = await readFurther(page, 250);
    await activateChapterButton(page, '[data-chapter-next]');
    await page.waitForFunction(() => location.hash !== '#research-ibm');
    await page.goBack(); await restored(page, deep);
    assert.deepEqual((await snapshot(page)).狀態.外來資料, {值:'保留'}, '保存閱讀位置仍保留外來資料');
    await page.evaluate(() => {history.pushState('外來純量', '', '#research-panasonic'); history.pushState(null, '', '#topic-efuse'); dispatchEvent(new HashChangeEvent('hashchange'));});
    await page.goBack();
    await page.waitForFunction(() => !document.getElementById('research').hidden && document.activeElement === document.querySelector('#research-panasonic h3'));
    assert.equal((await snapshot(page)).狀態, '外來純量', '不改寫外來純量狀態');
    trace.push({動作:'純量狀態定位', ...await snapshot(page)});
    for (const invalid of [
      {名稱:'缺少章節識別', 欄位:{}},
      {名稱:'空字串章節識別', 欄位:{panelId:''}},
      {名稱:'空值章節識別', 欄位:{panelId:null}},
      {名稱:'未知章節識別', 欄位:{panelId:'unknown-panel'}}
    ]) {
      await visit(page, 'topic-efuse');
      await page.evaluate(({key, fields}) => {
        history.replaceState({外來資料:{值:'略過導覽保留'}, [key]:{version:1, route:location.pathname + '#main-content', x:0, y:900, ...fields}}, '', '#main-content');
        history.pushState(null, '', '#research');
        dispatchEvent(new HashChangeEvent('hashchange'));
      }, {key:stateKey, fields:invalid.欄位});
      await page.waitForFunction(() => !document.getElementById('research').hidden && document.activeElement === document.querySelector('#research h2'));
      const fallback = await snapshot(page);
      await page.goBack();
      await page.waitForFunction(() => location.hash === '#main-content' && document.activeElement === document.querySelector('#research h2'));
      await page.waitForTimeout(180);
      const returned = await snapshot(page);
      trace.push({動作:`${invalid.名稱}略過導覽定位`, ...returned});
      assert.equal(returned.章節, 'research', `${invalid.名稱}維持目前閱讀章節`);
      assert.ok(Math.abs(returned.垂直位置 - fallback.垂直位置) <= 3, `${invalid.名稱}回原略過導覽定位，不採用無效項目的座標`);
      assert.deepEqual(returned.狀態.外來資料, {值:'略過導覽保留'}, `${invalid.名稱}保留外來狀態`);
    }
  });

  await check('語言轉向保留深層連結', {}, async (page, trace) => {
    await visit(page, 'research-ibm');
    await page.locator('#languageToggle').click();
    await page.waitForURL(url => url.pathname.endsWith('/nvm-technology-atlas.html') && url.searchParams.get('lang') === 'en' && url.hash === '#research-ibm');
    await page.waitForFunction(() => !document.getElementById('research').hidden && document.activeElement === document.querySelector('#research-ibm h3'));
    assert.equal(await page.locator('#nvm-current-chapter').inputValue(), 'research');
    trace.push({動作:'英文深層連結', ...await snapshot(page)});
    await page.locator('#languageToggle').click();
    await page.waitForURL(url => url.pathname.endsWith('/nvm-technology-atlas-zh.html') && url.searchParams.get('lang') === 'zh' && url.hash === '#research-ibm');
    await page.waitForFunction(() => document.activeElement === document.querySelector('#research-ibm h3'));
  });

  await check('百分之二百有效視窗章序', {width:720, height:450}, async (page, trace) => {
    await page.addInitScript(() => {history.scrollRestoration = 'manual';});
    await page.goto(new URL('nvm-technology-atlas-zh.html?lang=zh', base).href);
    await page.locator('.nvm-reading-position').waitFor();
    await page.waitForTimeout(180);
    assert.equal((await snapshot(page)).垂直位置, 0, '沒有錨點的初次開啟維持頁首');
    assert.equal(await page.evaluate(() => document.activeElement === document.body), true, '沒有錨點的初次開啟不搶焦點');
    await visit(page);
    assert.equal((await snapshot(page)).原生還原模式, 'manual', '保留呼叫端原生還原模式');
    const label = page.locator('.nvm-reading-position label');
    assert.ok(await label.evaluate(element => element.getBoundingClientRect().height > 10), '有效窄視窗保留章序');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, '章節列不引起全頁水平溢出');
    const first = await readFurther(page, 700);
    await activateChapterButton(page, '[data-chapter-next]');
    await page.waitForFunction(() => location.hash === '#topic-efuse');
    await page.goBack(); await restored(page, first);
    trace.push({動作:'有效視窗返回', ...await snapshot(page)});
  });
} finally {
  await browser.close(); await server?.close();
  fs.writeFileSync(path.join(output, '驗證結果.json'), JSON.stringify({瀏覽器:browser.version(), 註記:'720 × 450 為 1440 × 900 在百分之二百縮放時的有效 CSS 視窗，未操作瀏覽器原生縮放。', 結果:results}, null, 2));
}
const failures = results.filter(result => !result.通過);
console.log(`閱讀位置還原驗證：${results.length - failures.length}／${results.length} 通過；證據：${output}`);
for (const failure of failures) console.error(`失敗：${failure.名稱}；原因：${failure.原因}`);
if (failures.length) process.exitCode = 1;
