import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startTestServer } from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = new URL(process.env.NVM_QA_BASE || server.base);
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa', '搜尋分類與焦點'));
fs.mkdirSync(output, {recursive:true});
const channel = process.env.NVM_QA_CHANNEL || 'msedge';
const browser = await chromium.launch({headless:true, ...(channel === 'chromium' ? {} : {channel})});
const results = [];
const categories = ['all', 'physics', 'foundry', 'tools', 'security', 'sram'];
const pill = (page, category) => page.locator(`#searchHudPills [data-category="${category}"]`);
const input = page => page.locator('#nvmHubSearchInput');
const urls = page => page.locator('#searchResults a').evaluateAll(links => links.map(link => new URL(link.href).pathname.split('/').at(-1) + new URL(link.href).hash));
const focused = locator => locator.evaluate(element => element === document.activeElement);

async function check(name, options, test) {
  if (process.env.NVM_QA_FILTER && !name.includes(process.env.NVM_QA_FILTER)) return;
  const context = await browser.newContext({serviceWorkers:'block', viewport:{width:options.width || 1440, height:900}});
  await context.route('**/*', route => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
  if (options.mac) await context.addInitScript(() => {
    Object.defineProperty(navigator, 'userAgentData', {configurable:true, value:undefined});
    Object.defineProperty(navigator, 'platform', {configurable:true, value:'MacIntel'});
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await test(page);
    assert.deepEqual(errors, [], '沒有頁面未處理例外');
    results.push({名稱:name, 通過:true});
  } catch (error) {
    results.push({名稱:name, 通過:false, 原因:error.message, 詳細:error.stack, 頁面錯誤:errors});
    await page.screenshot({path:path.join(output, `${name}-失敗.png`)}).catch(() => {});
  } finally { await context.close(); }
}

async function visit(page, file = 'index.html', language = 'zh') {
  await page.goto(new URL(`${file}?lang=${language}`, base).href, {waitUntil:'domcontentloaded'});
  await page.locator('#searchHudPills button').first().waitFor({state:'attached'});
  await page.locator('#searchTrigger').click();
  assert.equal(await focused(input(page)), true, '開啟搜尋聚焦輸入欄位');
}

async function loaded(page) {
  await page.waitForFunction(() => window.NVMHub?.searchIndex.some(item => item.id));
}

try {
  for (const width of [1440, 390]) for (const language of ['zh', 'en']) {
    await check(`分類交集與雙語-${width}-${language}`, {width}, async page => {
      await visit(page, 'index.html', language);
      await loaded(page);
      assert.equal(await page.locator('#searchHudPills button').count(), 6);
      assert.equal(await pill(page, 'all').getAttribute('aria-pressed'), 'true');
      await input(page).fill('TSMC');
      const all = await urls(page);
      await pill(page, 'foundry').click();
      const foundry = await urls(page);
      assert.equal(await input(page).inputValue(), 'TSMC', '分類保留原查詢');
      assert.ok(foundry.includes('technology-comparison.html#foundry-tsmc'), '已知晶圓廠路線可直接搜尋');
      assert.ok(foundry.every(url => all.includes(url)), '分類結果是原查詢的交集');
      assert.ok(foundry.length < all.length, '分類真正縮小既有結果');
      await pill(page, 'all').click();
      assert.equal(await input(page).inputValue(), 'TSMC', '全部只清除分類');
      assert.deepEqual(await urls(page), all, '回到全部保留原排序與完整結果');

      // 用已知主題證明每個分類確有內容，並核對修復不等同所有 SRAM 研究。
      const known = {physics:'memory-physics.html', foundry:'technology-comparison.html#foundry-tsmc', tools:'sram-repair.html', security:'secure-storage.html', sram:'sram-repair.html'};
      await input(page).fill('');
      for (const category of categories.slice(1)) {
        await pill(page, category).click();
        assert.ok((await urls(page)).includes(known[category]), `${category} 包含對應的既有主題`);
        assert.equal(await pill(page, category).getAttribute('aria-pressed'), 'true');
        assert.equal(await page.locator('#searchHudPills [aria-pressed="true"]').count(), 1);
      }
      assert.equal((await urls(page)).includes('memory-evidence.html#evidence-P01'), false, 'SRAM PUF 研究不誤列 SRAM 修復');
      await input(page).fill('P01');
      assert.equal(await page.locator('#searchResults a').count(), 0);
      await pill(page, 'security').click();
      assert.deepEqual(await urls(page), ['memory-evidence.html#evidence-P01'], '分類仍搜尋原總帳，不另建資料');
      const nextLanguage = language === 'zh' ? 'en' : 'zh';
      await page.evaluate(value => window.HubLanguage.set(value), nextLanguage);
      assert.equal(await pill(page, 'security').innerText(), nextLanguage === 'zh' ? '安全與 PUF' : 'Security');
      assert.equal(await input(page).inputValue(), 'P01');
      assert.equal(await pill(page, 'security').getAttribute('aria-pressed'), 'true');
      assert.equal(await focused(pill(page, 'security')), true, '語系更新保留分類焦點');
      assert.deepEqual(await urls(page), ['memory-evidence.html#evidence-P01']);
      await input(page).fill('zzzz987654321無匹配');
      assert.equal(await page.locator('#searchResults a').count(), 0);
      assert.match(await page.locator('#searchStatus').innerText(), nextLanguage === 'zh' ? /安全與 PUF.*找不到/ : /Security.*No matching/);
      await page.screenshot({path:path.join(output, `搜尋分類-${width}-${language}.png`)});
      assert.equal(await page.locator('.search-modal').count(), 1, '沿用唯一的搜尋對話框');
      assert.equal(await page.locator('#searchHudPills').evaluate(element => element.scrollWidth <= element.clientWidth + 1), true, '分類在窄螢幕內重排');
      assert.ok(await pill(page, 'all').evaluate(element => element.getBoundingClientRect().height >= 44), '分類保留觸控範圍');
    });

    await check(`分類鍵盤焦點-${width}-${language}`, {width}, async page => {
      await visit(page, 'index.html', language);
      await loaded(page);
      await input(page).fill('zzzz987654321無匹配');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await focused(pill(page, 'sram')), true, '空結果時反向循環包含最後分類');
      await page.keyboard.press('Tab');
      assert.equal(await focused(input(page)), true, '空結果時分類末端循環回輸入');
      await page.keyboard.press('Tab');
      assert.equal(await focused(page.locator('#searchClose')), true);
      for (const category of categories) {
        await page.keyboard.press('Tab');
        assert.equal(await focused(pill(page, category)), true, `Tab 可到達 ${category}`);
      }
      await pill(page, 'all').focus();
      await page.keyboard.press('Shift+Tab');
      assert.equal(await focused(page.locator('#searchClose')), true);
      await input(page).fill('P01');
      await pill(page, 'all').click();
      await pill(page, 'sram').focus();
      await page.keyboard.press('Tab');
      assert.equal(await focused(page.locator('#searchResults a').first()), true, '分類後接結果');
      await page.keyboard.press('Tab');
      assert.equal(await focused(input(page)), true, '最後結果循環回輸入');
      await page.keyboard.press('Shift+Tab');
      assert.equal(await focused(page.locator('#searchResults a').last()), true);
      await pill(page, 'security').focus();
      await page.keyboard.press('Space');
      assert.equal(await pill(page, 'security').getAttribute('aria-pressed'), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await focused(page.locator('#searchTrigger')), true);
      assert.equal(await page.locator('[inert]').count(), 0);
      assert.equal(await page.locator('#searchOverlay').getAttribute('aria-hidden'), 'true');
    });
  }

  for (const mac of [false, true]) await check(`快捷鍵與返回焦點-${mac ? 'Mac' : 'Windows'}`, {mac}, async page => {
    await visit(page);
    await loaded(page);
    const shortcut = mac ? 'Meta+k' : 'Control+k';
    assert.equal(await page.locator('#searchTrigger kbd').innerText(), mac ? '⌘K' : 'Ctrl+K');
    assert.equal(await page.locator('#searchTrigger').getAttribute('aria-keyshortcuts'), mac ? 'Meta+K' : 'Control+K');
    await page.keyboard.press('Escape');
    await page.evaluate(() => {
      const field = document.createElement('input'); field.id = '驗證原焦點';
      document.body.append(field); field.focus();
    });
    await page.keyboard.press(shortcut);
    assert.equal(await focused(input(page)), true);
    await input(page).fill('P01');
    await pill(page, 'security').click();
    await page.keyboard.press(shortcut);
    assert.equal(await input(page).inputValue(), 'P01', '重複快捷鍵保留查詢');
    assert.equal(await pill(page, 'security').getAttribute('aria-pressed'), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await focused(page.locator('#驗證原焦點')), true, '快捷鍵關閉還原呼叫處焦點');
  });

  await check('載入失敗與分類重試', {}, async page => {
    let attempts = 0, release;
    const gate = new Promise(resolve => {release = resolve;});
    await page.route('**/memory-evidence.html', async route => {
      attempts++;
      if (attempts <= 2) await route.fulfill({status:503, body:'總帳暫時無法讀取'});
      else { await gate; await route.continue(); }
    });
    try {
      await visit(page);
      await page.locator('#searchRetry').waitFor({state:'visible'});
      await input(page).fill('P01');
      await pill(page, 'security').click();
      await page.locator('#searchRetry').click();
      await page.waitForFunction(() => !document.getElementById('searchRetry').disabled && document.getElementById('searchStatus').textContent.includes('總帳載入失敗'));
      assert.equal(await focused(page.locator('#searchRetry')), true, '再次失敗保留可重試焦點');
      assert.equal(await input(page).inputValue(), 'P01');
      assert.equal(await pill(page, 'security').getAttribute('aria-pressed'), 'true');
      await page.locator('#searchRetry').click();
      assert.equal(await page.locator('#searchRetry').isDisabled(), true);
      await page.evaluate(() => window.HubLanguage.set('en'));
      assert.equal(await input(page).inputValue(), 'P01');
      assert.equal(await pill(page, 'security').getAttribute('aria-pressed'), 'true');
      assert.equal(await page.locator('#searchRetry').innerText(), 'Retrying…');
      release();
      await loaded(page);
      await page.locator('#searchRetry').waitFor({state:'hidden'});
      assert.equal(attempts, 3, '重試只重用既有總帳來源');
      assert.deepEqual(await urls(page), ['memory-evidence.html#evidence-P01']);
      assert.equal(await input(page).inputValue(), 'P01');
      assert.equal(await pill(page, 'security').getAttribute('aria-pressed'), 'true');
      assert.equal(await focused(input(page)), true, '重試控制消失後回到有效輸入焦點');
      assert.doesNotMatch(await page.locator('#searchStatus').innerText(), /could not be loaded|Retrying/);
    } finally {release();}
  });

  await check('背景總帳完成保留分類焦點', {}, async page => {
    let release;
    const gate = new Promise(resolve => {release = resolve;});
    await page.route('**/memory-evidence.html', async route => {await gate; await route.continue();});
    try {
      await visit(page);
      await input(page).fill('P01');
      await pill(page, 'security').click();
      assert.equal(await focused(pill(page, 'security')), true);
      release(); await loaded(page);
      assert.equal(await focused(pill(page, 'security')), true, '非同步更新不奪取分類焦點');
      assert.deepEqual(await urls(page), ['memory-evidence.html#evidence-P01']);
    } finally {release();}
  });

  await check('非首頁控制器與頁內欄位隔離', {width:390}, async page => {
    await visit(page, 'secure-storage.html');
    await loaded(page);
    await input(page).fill('P01');
    await pill(page, 'security').click();
    assert.deepEqual(await urls(page), ['memory-evidence.html#evidence-P01']);
    await page.keyboard.press('Escape');
    await page.locator('#searchInput').fill('PUF');
    await page.locator('#searchTrigger').click();
    await pill(page, 'all').click();
    assert.equal(await input(page).inputValue(), 'P01');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#searchInput').inputValue(), 'PUF', '分類不改動頁內搜尋');
  });
} finally {
  await browser.close(); await server?.close();
  fs.writeFileSync(path.join(output, '驗證結果.json'), JSON.stringify({瀏覽器:browser.version(), 通道:channel, 結果:results}, null, 2));
}
const failures = results.filter(result => !result.通過);
console.log(`搜尋分類與焦點驗證：${results.length - failures.length}／${results.length} 通過；證據：${output}`);
for (const failure of failures) console.error(`失敗：${failure.名稱}；原因：${failure.原因}`);
if (failures.length) process.exitCode = 1;
