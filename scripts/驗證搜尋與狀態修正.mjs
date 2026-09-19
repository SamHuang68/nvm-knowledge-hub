import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const base = new URL(process.env.NVM_QA_BASE || 'http://127.0.0.1:8765/');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa', '搜尋與狀態修正'));
fs.mkdirSync(output, { recursive: true });
const channel = process.env.NVM_QA_CHANNEL || 'msedge';
const browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
const results = [];

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
      await visit(page, `${file}?lang=${language}`);
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
fs.writeFileSync(path.join(output, '驗證結果.json'), JSON.stringify({ base: base.href, results }, null, 2));
const failures = results.filter(result => !result.passed);
console.log(`搜尋與狀態驗證：${results.length - failures.length}/${results.length} 通過`);
if (failures.length) process.exitCode = 1;
