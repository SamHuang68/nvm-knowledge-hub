import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startTestServer } from './驗證伺服器.mjs';

const root = path.resolve(import.meta.dirname, '..');
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = new URL(process.env.NVM_QA_BASE || server.base);
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa', '搜尋與狀態修正'));
fs.mkdirSync(output, { recursive: true });
const channel = process.env.NVM_QA_CHANNEL || 'msedge';
const browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
const results = [];

async function captureNativeIdLookup(page) {
  await page.addInitScript(() => {
    window.__qaNativeIdLookup = document.getElementById;
    window.__qaIdLookupOwnProperty = Object.hasOwn(document, 'getElementById');
  });
}

async function assertNativeIdLookup(page) {
  assert.deepEqual(await page.evaluate(() => ({
    sameFunction: document.getElementById === window.__qaNativeIdLookup,
    sameOwnership: Object.hasOwn(document, 'getElementById') === window.__qaIdLookupOwnProperty,
    missingIsNull: document.getElementById('不存在的搜尋驗證元素') === null,
  })), { sameFunction: true, sameOwnership: true, missingIsNull: true }, '保留原生 ID 查詢函式及語意');
}

async function check(name, test) {
  if (process.env.NVM_QA_FILTER && !name.includes(process.env.NVM_QA_FILTER)) return;
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await test(page, context);
    assert.deepEqual(errors, [], '頁面不得出現未處理例外');
    results.push({ name, passed: true });
    console.log(`通過：${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.message, stack: error.stack, errors });
    await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: false }).catch(() => {});
    console.error(`失敗：${name}：${error.message}`);
  } finally {
    await context.close();
  }
}

async function visit(page, url) {
  await page.goto(new URL(url, base).href, { waitUntil: 'domcontentloaded' });
  await page.locator('#nvmHubSearchInput').waitFor({ state: 'attached' });
}

async function openSearch(page, query) {
  await page.locator('#searchTrigger').click();
  const input = page.locator('#searchOverlay input[type="search"]');
  await input.fill(query);
  return input;
}

async function closedKnowledge(page) {
  assert.equal(await page.locator('.ai-nvm-page').getAttribute('data-knowledge-state'), 'error');
  assert.equal(await page.locator('.opportunity-record:visible').count(), 0);
  assert.equal(await page.locator('#opportunityCount').innerText(), '00');
  assert.equal(await page.locator('#opportunityEmpty').isVisible(), true);
}

for (const language of ['zh', 'en']) {
  for (const file of ['index.html', 'secure-storage.html']) {
    await check(`搜尋鍵盤與欄位隔離_${file}_${language}`, async page => {
      await captureNativeIdLookup(page);
      await visit(page, `${file}?lang=${language}`);
      await assertNativeIdLookup(page);
      const pageSearch = page.locator('#searchInput');
      if (file === 'secure-storage.html') await pageSearch.fill('PUF');
      const input = await openSearch(page, 'zzzz987654321完全無匹配');
      assert.equal(await input.evaluate(element => element === document.activeElement), true);
      assert.equal(await page.locator('#nvmHubSearchInput').count(), 1);
      assert.equal(await page.locator('#searchResults a').count(), 0);
      await page.keyboard.press('Shift+Tab');
      assert.equal(await page.locator('#searchClose').evaluate(element => element === document.activeElement), true);
      await page.keyboard.press('Tab');
      assert.equal(await input.evaluate(element => element === document.activeElement), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#searchOverlay').getAttribute('aria-hidden'), 'true');
      assert.equal(await page.locator('#searchTrigger').evaluate(element => element === document.activeElement), true);
      if (file === 'secure-storage.html') assert.equal(await pageSearch.inputValue(), 'PUF');
      await openSearch(page, '安全儲存架構');
      const first = page.locator('#searchResults a').first();
      await first.waitFor();
      assert.match(await first.getAttribute('href'), /secure-storage\.html/);
      await page.keyboard.press('Enter');
      await page.waitForURL(url => url.pathname.endsWith('secure-storage.html'));
      await page.waitForFunction(() => document.getElementById('searchOverlay')?.getAttribute('aria-hidden') === 'true');
    });
  }
  await check(`資料失敗後維持關閉_${language}`, async page => {
    await page.route('**/data/ai-nvm-opportunities-knowledge.json', route => route.fulfill({ status: 503, body: '{}' }));
    await visit(page, `ai-nvm-opportunities.html?lang=${language}`);
    await page.waitForFunction(() => document.querySelector('.ai-nvm-page').dataset.knowledgeState === 'error');
    await closedKnowledge(page);
    for (const selector of ['button[data-write-filter]', 'button[data-opportunity-view]']) {
      for (const button of await page.locator(selector).all()) {
        await button.click();
        await closedKnowledge(page);
      }
    }
    await page.locator('#languageToggle').click();
    await closedKnowledge(page);
  });
}

for (const inputId of ['nvmHubSearchInput', 'searchInput']) {
  for (const order of ['hub先載入', '控制器先載入']) {
    await check(`搜尋相容與原生API_${inputId}_${order}`, async (page, context) => {
      await captureNativeIdLookup(page);
      await context.route('**/*', route => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
      await page.route('**/index.html?lang=zh', async route => {
        const response = await route.fetch();
        let html = await response.text();
        const hubTag = html.match(/<script src="hub\.js[^\"]*"><\/script>/)?.[0];
        const controllerTag = html.match(/<script src="搜尋控制器\.js[^\"]*"><\/script>/)?.[0];
        assert.ok(hubTag && controllerTag, '首頁保留兩個真正的搜尋程式來源');
        const scripts = order === 'hub先載入' ? [hubTag, controllerTag] : [controllerTag, hubTag];
        const replacement = scripts.map((tag, index) => `${tag}<script>window.__qaSearchScriptOrder=(window.__qaSearchScriptOrder||[]);window.__qaSearchScriptOrder.push(${JSON.stringify(index === 0 ? order : '第二個程式已執行')});</script>`).join('');
        html = html.replace(hubTag, '').replace(controllerTag, replacement);
        html = html.replace('<input id="nvmHubSearchInput"', `<input id="${inputId}"`);
        html = html.replace('<main ', '<section data-qa-page-search><label>頁內查詢<input id="searchInput" type="search" placeholder="頁內固定提示" value="頁內保留值"></label></section><main ');
        await route.fulfill({ response, body: html });
      });
      await visit(page, 'index.html?lang=zh');
      const pageInput = page.locator('[data-qa-page-search] input');
      const overlayInput = page.locator('#searchOverlay input[type="search"]');
      await assertNativeIdLookup(page);
      assert.deepEqual(await page.evaluate(() => window.__qaSearchScriptOrder), [order, '第二個程式已執行'], '確實執行指定的程式載入順序');
      assert.equal(await overlayInput.getAttribute('id'), 'nvmHubSearchInput', '舊 overlay ID 正規化為專用 ID');
      assert.equal(await page.locator('#searchInput').count(), 1, '頁內欄位保留原 ID，沒有重複 ID');
      assert.equal(await page.locator('#nvmHubSearchInput').count(), 1, '全站搜尋只有一個專用欄位');
      assert.equal(await page.evaluate(() => document.getElementById('searchInput') === document.querySelector('[data-qa-page-search] input')), true, '原生 ID 查詢取得真正的頁內欄位');
      assert.equal(await pageInput.inputValue(), '頁內保留值');
      assert.equal(await pageInput.getAttribute('placeholder'), '頁內固定提示');
      await page.evaluate(() => {
        window.__qaInputEvents = { page: 0, overlay: 0 };
        document.querySelector('[data-qa-page-search] input').addEventListener('input', () => window.__qaInputEvents.page++);
        document.querySelector('#searchOverlay input').addEventListener('input', () => window.__qaInputEvents.overlay++);
      });
      await pageInput.fill('頁內更新值');
      assert.deepEqual(await page.evaluate(() => window.__qaInputEvents), { page: 1, overlay: 0 });
      await page.keyboard.press('Control+k');
      assert.equal(await overlayInput.evaluate(element => element === document.activeElement), true, '快捷鍵把焦點交給 overlay');
      await overlayInput.fill('zzzz987654321');
      assert.equal(await page.locator('#searchResults a').count(), 0, 'overlay 事件只更新全站搜尋結果');
      assert.equal(await pageInput.inputValue(), '頁內更新值', '開啟與輸入全站搜尋不清空頁內值');
      assert.deepEqual(await page.evaluate(() => window.__qaInputEvents), { page: 1, overlay: 1 }, '事件不互相觸發');
      await page.keyboard.press('Escape');
      assert.equal(await pageInput.evaluate(element => element === document.activeElement), true, '關閉後還原頁內欄位焦點');
      assert.equal(await page.locator('[inert]').count(), 0, '清除搜尋使用的背景隔離');
      await page.locator('#languageToggle').click();
      assert.equal(await pageInput.getAttribute('placeholder'), '頁內固定提示', '語系同步不改寫頁內欄位提示');
      assert.equal(await pageInput.inputValue(), '頁內更新值');
      assert.equal(await overlayInput.getAttribute('placeholder'), 'Technology, mechanism, company, or source ID');
      const input = await openSearch(page, '安全儲存架構');
      await page.locator('#searchResults a[href$="secure-storage.html"]').waitFor();
      assert.equal(await input.evaluate(element => element === document.activeElement), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#searchTrigger').evaluate(element => element === document.activeElement), true, '按鈕開啟後還原至按鈕');
      assert.equal(await pageInput.inputValue(), '頁內更新值');
      await assertNativeIdLookup(page);
    });
  }
}

await check('資料載入中不顯示待核對卡片', async page => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/data/ai-nvm-opportunities-knowledge.json', async route => { await gate; await route.continue(); });
  try {
    await visit(page, 'ai-nvm-opportunities.html');
    assert.equal(await page.locator('.ai-nvm-page').getAttribute('data-knowledge-state'), 'loading');
    assert.equal(await page.locator('.opportunity-record:visible').count(), 0);
    await page.locator('button[data-write-filter="all"]').click();
    assert.equal(await page.locator('.opportunity-record:visible').count(), 0);
  } finally { release(); }
  await page.waitForFunction(() => document.querySelector('.ai-nvm-page').dataset.knowledgeState === 'canonical');
  assert.ok(await page.locator('.opportunity-record:visible').count() > 0);
});

for (const selector of ['[data-engineering-zoom]', '[data-zoom-diagram]']) {
  await check(`放大圖與搜尋互斥_${selector.replace(/[^a-z-]/g, '')}`, async page => {
    await visit(page, 'NVM技術全景.html?lang=en#ip-kilopass-xpm');
    const target = page.locator(selector).first();
    const panelId = await target.evaluate(element => element.closest('[data-nvm-panel]')?.id);
    if (panelId) await page.evaluate(id => { location.hash = id; }, panelId);
    await page.waitForFunction(selector => Boolean(document.querySelector(selector)?.closest('[data-engineering-figure], .nvm-cell')?.querySelector('svg')), selector);
    await target.click();
    assert.equal(await page.locator('dialog:modal').count(), 1);
    await page.keyboard.press('Control+k');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    assert.equal(await page.locator('#nvmHubSearchInput').evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[inert]').count(), 0);
    assert.equal(await target.evaluate(element => element === document.activeElement), true);
    await target.click();
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    assert.equal(await target.evaluate(element => element === document.activeElement), true);
  });
}

await check('總帳深層連結解除篩選與相同錨點', async page => {
  await visit(page, 'memory-evidence.html#evidence-P01');
  const record = page.locator('#evidence-P01');
  assert.equal(await record.isVisible(), true);
  assert.equal(await record.evaluate(element => element === document.activeElement), true);
  await page.locator('#evidenceSearch').fill('zzzz987654321無匹配');
  assert.equal(await record.isHidden(), true);
  await openSearch(page, 'P01');
  await page.locator('#searchResults a[href$="#evidence-P01"]').click();
  assert.equal(await record.isVisible(), true);
  assert.equal(await page.locator('#evidenceSearch').inputValue(), '');
  assert.equal(await record.evaluate(element => element === document.activeElement), true);
  await page.locator('#evidenceFilters button:not([data-type="all"])').last().click();
  await page.locator('#evidenceSearch').fill('zzzz987654321無匹配');
  await openSearch(page, 'P02');
  await page.locator('#searchResults a[href$="#evidence-P02"]').click();
  await page.waitForURL(url => url.hash === '#evidence-P02');
  await page.waitForFunction(() => document.activeElement?.id === 'evidence-P02');
  assert.equal(await page.locator('#evidence-P02').isVisible(), true);
  await page.goBack();
  await page.waitForURL(url => url.hash === '#evidence-P01');
  await page.waitForFunction(() => document.activeElement?.id === 'evidence-P01');
  assert.equal(await record.isVisible(), true);
  assert.equal(await record.evaluate(element => element === document.activeElement), true);
  await page.goForward();
  await page.waitForURL(url => url.hash === '#evidence-P02');
  await page.waitForFunction(() => document.activeElement?.id === 'evidence-P02');
  assert.equal(await page.locator('#evidence-P02').isVisible(), true);
});

for (const mode of ['成功', '拒絕', '缺少API']) {
  await check(`複製清單_${mode}`, async (page, context) => {
    await context.addInitScript(mode => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: mode === '缺少API' ? undefined : {
        writeText: async text => {
          if (mode === '拒絕') throw new DOMException('測試拒絕', 'NotAllowedError');
          window.__copiedChecklist = text;
        }
      } });
    }, mode);
    await visit(page, 'technology-comparison.html?lang=zh');
    const button = page.locator('.hub-verify-copy');
    await button.click();
    const manual = page.locator('#hub-decision-flow textarea');
    if (mode === '成功') {
      assert.match(await button.innerText(), /已複製/);
      assert.match(await page.evaluate(() => window.__copiedChecklist), /VERIFY checklist/);
      assert.equal(await manual.isHidden(), true);
    } else {
      assert.match(await button.innerText(), /重試複製/);
      assert.doesNotMatch(await button.innerText(), /Copied|已複製/);
      assert.equal(await manual.isVisible(), true);
      assert.match(await manual.inputValue(), /VERIFY checklist/);
      assert.equal(await manual.evaluate(element => element.selectionEnd - element.selectionStart === element.value.length), true);
    }
  });
}

await browser.close();
if (server) await server.close();
fs.writeFileSync(path.join(output, '驗證結果.json'), JSON.stringify({ base: base.href, results }, null, 2));
const failures = results.filter(result => !result.passed);
console.log(`搜尋與狀態驗證：${results.length - failures.length}/${results.length} 通過`);
if (failures.length) process.exitCode = 1;
