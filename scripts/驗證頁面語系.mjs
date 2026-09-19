import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startTestServer } from './驗證伺服器.mjs';

const root = path.resolve(import.meta.dirname, '..');
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = new URL(process.env.NVM_QA_BASE || server.base);
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa/雙語修正部署/頁面語系'));
fs.mkdirSync(output, { recursive: true });
const browserName = process.env.NVM_QA_BROWSER || 'msedge';
const browser = await chromium.launch({ headless: true, ...(browserName === 'chromium' ? {} : { channel: browserName }) });
const results = [];

async function check(name, test) {
  const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.setDefaultTimeout(15000);
  try {
    const evidence = await test(page);
    assert.deepEqual(errors, [], '頁面不得出現未處理例外');
    results.push({ name, passed: true, evidence });
    console.log(`通過：${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.message, errors });
    await page.screenshot({ path: path.join(output, `${name}_失敗.png`) }).catch(() => {});
    console.error(`失敗：${name}：${error.message}`);
  } finally { await context.close(); }
}

async function visit(page, route) {
  await page.goto(new URL(route, base).href, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.HubLanguage && document.body.dataset.language);
  await page.locator('#nvmHubSearchInput').waitFor({ state: 'attached' });
}

async function selectLanguage(page, language) {
  if (await page.evaluate(() => window.HubLanguage.get()) !== language) await page.locator('#languageToggle, .language-toggle').first().click();
  await page.waitForFunction(expected => document.documentElement.lang === (expected === 'zh' ? 'zh-Hant' : 'en'), language);
}

try {
  await check('物理卡片雙向實際顯示', async page => {
    await visit(page, 'memory-physics.html?lang=en');
    const records = [];
    for (const language of ['en', 'zh', 'en']) {
      await selectLanguage(page, language);
      const cards = page.locator('.correction-card, .claim-rung');
      assert.equal(await cards.count(), 7, '保留原有七張卡片');
      const visible = await cards.locator('[data-lang]').evaluateAll(nodes => nodes.filter(node => {
        const style = getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden' && node.getClientRects().length;
      }).map(node => ({ language: node.dataset.lang, text: node.textContent.trim() })));
      records.push({ language, visible });
      assert.equal(visible.length, 21, '每張卡片三個語系文字節點完整顯示');
      assert.ok(visible.every(item => item.language === language), '只顯示目前語言的卡片內容');
    }
    await page.locator('#correction').screenshot({ path: path.join(output, '英文物理卡片.png') });
    return records;
  });

  for (const [route, minimum] of [['ai-nvm-opportunities.html', 7], ['secure-storage.html', 4], ['briefing/index.html', 1]]) {
    await check(`外部連結可及性_${route.replaceAll('/', '_')}`, async page => {
      await visit(page, `${route}?lang=en`);
      const links = page.locator('a[target="_blank"]').filter({ has: page.locator('[data-lang]') });
      assert.ok(await links.count() >= minimum, '受審連結數量不得減少');
      const records = [];
      for (const language of ['en', 'zh', 'en']) {
        await selectLanguage(page, language);
        const snapshot = (await Promise.all((await links.all()).map(link => link.ariaSnapshot()))).join('\n');
        const labels = await links.evaluateAll(nodes => nodes.map(node => ({ label: node.getAttribute('aria-label'), description: (node.getAttribute('aria-describedby') || '').split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ') })));
        if (language === 'en') {
          assert.doesNotMatch(snapshot, /[\u3400-\u9fff]/u, '英文可及性樹不得含隱藏中文');
          assert.ok(labels.every(item => !/[\u3400-\u9fff]/u.test(item.label || '')), '實際 aria-label 不得混入中文');
        } else {
          assert.match(snapshot, /[\u3400-\u9fff]/u, '繁中連結名稱應包含對應中文');
        }
        assert.ok(labels.every(item => item.description.includes(language === 'zh' ? '另開新分頁' : 'opens in a new tab')), '新分頁說明依語言同步');
        records.push({ language, snapshot, labels });
      }
      return records;
    });
  }

  await check('安全儲存首屏與限制雙語', async page => {
    await visit(page, 'secure-storage.html?lang=zh');
    const records = [];
    for (const language of ['zh', 'en', 'zh']) {
      await selectLanguage(page, language);
      const text = await page.locator('.hero').innerText();
      if (language === 'zh') {
        for (const phrase of ['採用 SRAM PUF 技術的裝置', '供應商報告的背景資料', '並非本組態', '已公開的 OTP 資料保護', '探索斷電狀態', '開啟 OIP 簡報']) assert.ok(text.includes(phrase), `缺少繁中文案：${phrase}`);
        assert.doesNotMatch(text, /devices using|vendor-reported|of proven|disclosed OTP|Power-off State|OIP Brief|device-unique root key|reconstructed root/i);
      } else {
        assert.match(text, /vendor-reported CONTEXT — not this config/);
        assert.doesNotMatch(text, /[\u3400-\u9fff]/u);
      }
      records.push({ language, text });
    }
    await page.screenshot({ path: path.join(output, '繁中安全儲存首屏.png') });
    return records;
  });

  await check('繁中導覽與功能名稱', async page => {
    await visit(page, 'ai-nvm-opportunities.html?lang=zh');
    assert.equal((await page.locator('.home-pill').innerText()).trim(), '全部主題');
    assert.equal((await page.locator('.rail-title').innerText()).trim(), '章節導覽');
    assert.match(await page.locator('.hero-actions, .research-hero').first().innerText(), /機會地圖/);
    assert.doesNotMatch(await page.locator('a[href="#opportunities"]').first().innerText(), /Map/i);
    await visit(page, 'memory-physics.html?lang=zh');
    assert.equal((await page.locator('a.button[href="memory-evidence.html"]').first().innerText()).trim(), '開啟證據總帳');
    return { navigation: '全部主題／章節導覽／機會地圖／開啟證據總帳' };
  });

  await check('安全儲存數值樣式與手機首屏', async page => {
    const records = [];
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const language of ['zh', 'en']) {
        await visit(page, `secure-storage.html?lang=${language}`);
        const values = await page.locator('.hero-proof strong, .stat-val').evaluateAll(nodes => nodes.map(node => {
          const own = getComputedStyle(node);
          const localized = [...node.querySelectorAll(':scope > [data-lang]')].find(child => getComputedStyle(child).display !== 'none');
          const child = localized ? getComputedStyle(localized) : own;
          return { text: node.innerText, size: own.fontSize, localizedSize: child.fontSize, color: own.color, localizedColor: child.color };
        }));
        assert.ok(values.every(value => value.size === value.localizedSize && value.color === value.localizedColor), '語系包裝不得改變原數值的字級或顏色');
        const bounds = await page.locator('.hero-content').evaluate(node => ({ width: node.clientWidth, scrollWidth: node.scrollWidth }));
        assert.ok(bounds.scrollWidth <= bounds.width + 1, '首屏不得因文案增加產生水平溢出');
        records.push({ width, language, values, bounds });
        await page.screenshot({ path: path.join(output, `安全儲存_${width}_${language}.png`) });
      }
    }
    return records;
  });

  await check('白皮書歷史返回與前進同步', async page => {
    await visit(page, 'whitepaper/index.html?lang=en');
    const records = [];
    async function capture(expectedLanguage, expectedPanel) {
      await page.waitForFunction(language => document.documentElement.lang === (language === 'zh' ? 'zh-Hant' : 'en'), expectedLanguage);
      const state = await page.evaluate(() => ({ url: location.href, query: new URL(location.href).searchParams.get('lang'), html: document.documentElement.lang, language: window.HubLanguage.get(), preference: localStorage.getItem(window.HubLanguage.STORAGE_KEY), title: document.title, panel: document.querySelector('.studio-panel:not([hidden])')?.id, heading: document.querySelector('.studio-panel:not([hidden]) h1, .studio-panel:not([hidden]) h2')?.innerText }));
      records.push(state);
      assert.equal(state.query, expectedLanguage);
      assert.equal(state.language, expectedLanguage);
      assert.equal(state.preference, expectedLanguage);
      assert.equal(state.panel, expectedPanel);
      assert.equal(/[\u3400-\u9fff]/u.test(state.title), expectedLanguage === 'zh');
      assert.equal(/[\u3400-\u9fff]/u.test(state.heading || ''), expectedLanguage === 'zh');
    }
    await capture('en', 'panel-overview');
    await page.locator('.view-tab[data-view="selector"]').click();
    await capture('en', 'panel-selector');
    await selectLanguage(page, 'zh');
    await capture('zh', 'panel-selector');
    await page.goBack();
    await capture('en', 'panel-overview');
    await page.goForward();
    await capture('zh', 'panel-selector');
    return records;
  });
} finally {
  fs.writeFileSync(path.join(output, '頁面語系驗證.json'), JSON.stringify({ base: base.href, browser: browserName, passed: results.filter(item => item.passed).length, total: results.length, results }, null, 2) + '\n');
  await browser.close();
  await server?.close();
}
if (results.some(item => !item.passed)) process.exitCode = 1;
