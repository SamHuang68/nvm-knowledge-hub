import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import { startTestServer } from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const engine = process.env.NVM_QA_ENGINE || 'chromium';
const browserType = { chromium, firefox, webkit }[engine];
assert.ok(browserType, `Unsupported browser engine: ${engine}`);
const channel = engine === 'chromium' ? process.env.NVM_QA_CHANNEL || process.env.NVM_QA_BROWSER || 'msedge' : null;
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa/shell-accessibility', `${engine}-${channel || 'bundled'}`));
fs.mkdirSync(output, { recursive: true });
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const browser = await browserType.launch({ headless: true, ...(channel && channel !== 'chromium' ? { channel } : {}) });
const results = [];
const copy = {
  en: { search: 'Search the knowledge hub', input: 'Search topics and evidence', close: 'Close search', categories: 'Search categories', openMenu: 'Open menu', closeMenu: 'Close menu' },
  zh: { search: '搜尋知識中心', input: '搜尋主題與證據', close: '關閉搜尋', categories: '搜尋分類', openMenu: '開啟選單', closeMenu: '關閉選單' }
};
// 固定公開分類順序與名稱，不從控制器的可聚焦元素清單推導預期。
const categories = [
  {id:'all',en:'All',zh:'全部'},
  {id:'physics',en:'Physics',zh:'物理模型'},
  {id:'foundry',en:'Foundry',zh:'晶圓廠路線'},
  {id:'tools',en:'Tools',zh:'工程工具'},
  {id:'security',en:'Security',zh:'安全與 PUF'},
  {id:'sram',en:'SRAM Repair',zh:'SRAM 修復'}
];

async function check(scenario, file, width, language, test) {
  const name = `${scenario}_${file}_${width}_${language}`;
  if (process.env.NVM_QA_FILTER && !name.includes(process.env.NVM_QA_FILTER)) return;
  const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [];
  const evidence = {};
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(new URL(`${file}?lang=${language}`, base).href);
    await page.locator('#nvmHubSearchInput').waitFor({ state: 'attached' });
    const cdp = engine === 'chromium' ? await context.newCDPSession(page) : null;
    const axNodes = async () => cdp ? (await cdp.send('Accessibility.getFullAXTree')).nodes.filter(node => !node.ignored) : null;
    await test(page, evidence, axNodes);
    assert.deepEqual(errors, []);
    results.push({ name, passed: true, evidence });
    console.log(`Passed: ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: error.stack, errors, evidence });
    console.error(`Failed: ${name}: ${error.message}`);
  } finally {
    await context.close();
  }
}

try {
  for (const width of [1440, 390]) for (const language of ['en', 'zh']) {
    for (const file of ['index.html', 'automotive-nvm.html']) {
      await check('search-dialog', file, width, language, async (page, evidence, axNodes) => {
        const trigger = page.locator('#searchTrigger');
        const input = page.locator('#nvmHubSearchInput');
        const close = page.locator('#searchClose');
        await trigger.click();
        assert.equal(await page.getByRole('dialog', { name: copy[language].search, exact: true }).count(), 1);
        assert.equal(await page.getByRole('searchbox', { name: copy[language].input, exact: true }).count(), 1);
        assert.equal(await page.getByRole('button', { name: copy[language].close, exact: true }).count(), 1);
        assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
        await input.fill('no-matching-hub-result-907621');
        assert.equal(await page.locator('#searchResults a').count(), 0, '空結果情境不包含結果連結');
        const categoryGroup = page.getByRole('group', { name: copy[language].categories, exact: true });
        assert.equal(await categoryGroup.count(), 1, '搜尋分類群組有公開可及名稱');
        assert.equal(await categoryGroup.getByRole('button').count(), 6, '六個公開分類都保留');
        for (const category of categories) {
          const button = categoryGroup.getByRole('button', { name: category[language], exact: true });
          assert.equal(await button.count(), 1, `${category.id} 分類有正確名稱`);
          assert.equal(await button.getAttribute('data-category'), category.id);
          assert.equal(await button.isEnabled(), true, `${category.id} 分類可操作`);
        }
        await page.locator('header a[href]').first().evaluate(element => element.focus());
        assert.equal(await input.evaluate(element => element === document.activeElement), true, 'inert background rejects focus');
        const nodes = await axNodes();
        if (nodes) {
          const dialog = nodes.find(node => node.role?.value === 'dialog');
          evidence.openDialogAX = { role: dialog?.role?.value, name: dialog?.name?.value, properties: dialog?.properties };
          assert.equal(dialog?.name?.value, copy[language].search);
          assert.equal(dialog?.properties?.find(property => property.name === 'modal')?.value?.value, true);
          assert.equal(nodes.some(node => node.role?.value === 'main' || node.role?.value === 'banner'), false, 'background landmarks excluded from Chromium AX');
        }
        evidence.focusCycle = [];
        const expectFocus = async (locator, direction) => {
          assert.equal(await locator.evaluate(element => element === document.activeElement), true, `${direction} 到達公開契約的控制項`);
          const focus = await page.evaluate(() => ({id:document.activeElement.id,category:document.activeElement.dataset.category||null,inSearch:Boolean(document.activeElement.closest('#searchOverlay'))}));
          assert.equal(focus.inSearch, true, '正反焦點循環不能逃脫搜尋對話框');
          evidence.focusCycle.push({方向:direction,...focus});
        };
        await page.keyboard.press('Tab');
        await expectFocus(close, '正向');
        for (const category of categories) {
          await page.keyboard.press('Tab');
          await expectFocus(categoryGroup.getByRole('button', { name: category[language], exact: true }), '正向');
        }
        await page.keyboard.press('Tab');
        await expectFocus(input, '正向循環');
        for (const category of [...categories].reverse()) {
          await page.keyboard.press('Shift+Tab');
          await expectFocus(categoryGroup.getByRole('button', { name: category[language], exact: true }), '反向');
        }
        await page.keyboard.press('Shift+Tab');
        await expectFocus(close, '反向');
        await page.keyboard.press('Shift+Tab');
        await expectFocus(input, '反向循環');
        await page.keyboard.press('Escape');
        evidence.closedFocus = await page.evaluate(() => ({ id: document.activeElement.id, tag: document.activeElement.tagName, inHiddenSearch: Boolean(document.activeElement.closest('#searchOverlay[aria-hidden="true"]')) }));
        assert.equal(await trigger.evaluate(element => element === document.activeElement), true, 'pointer-opened search returns focus to its trigger');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
        assert.equal(await page.getByRole('dialog', { name: copy[language].search, exact: true }).count(), 0);
        assert.equal(await page.locator('[inert]').count(), 0);
        await page.keyboard.press('Control+k');
        assert.equal(await input.evaluate(element => element === document.activeElement), true);
        await page.keyboard.press('Escape');
        assert.equal(await trigger.evaluate(element => element === document.activeElement), true, 'keyboard-opened search preserves the prior control');
      });
    }
  }
  for (const language of ['en', 'zh']) for (const file of ['automotive-nvm.html', 'secure-storage.html']) {
    await check('menu-language', file, 390, language, async (page, evidence, axNodes) => {
      const menu = page.locator('#menuToggle');
      const nextLanguage = language === 'en' ? 'zh' : 'en';
      await menu.click();
      assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      assert.equal(await menu.getAttribute('aria-label'), copy[language].closeMenu);
      await page.locator('#languageToggle').click();
      evidence.afterLanguageChange = { expanded: await menu.getAttribute('aria-expanded'), name: await menu.getAttribute('aria-label') };
      const nodes = await axNodes();
      if (nodes) {
        const button = nodes.find(node => node.role?.value === 'button' && node.properties?.some(property => property.name === 'controls' && property.value?.value === 'primaryNav'));
        evidence.menuAX = { role: button?.role?.value, name: button?.name?.value, expanded: button?.properties?.find(property => property.name === 'expanded')?.value?.value };
        assert.equal(evidence.menuAX.name, copy[nextLanguage].closeMenu);
        assert.equal(evidence.menuAX.expanded, true);
      }
      assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      assert.equal(await page.getByRole('button', { name: copy[nextLanguage].closeMenu, exact: true }).count(), 1);
      await page.keyboard.press('Escape');
      assert.equal(await menu.getAttribute('aria-expanded'), 'false');
      assert.equal(await menu.getAttribute('aria-label'), copy[nextLanguage].openMenu);
      assert.equal(await menu.evaluate(element => element === document.activeElement), true);
    });
  }
} finally {
  await browser.close();
  await server?.close();
  const report = { engine, channel, version: browser.version(), evidenceScope: 'Headless browser keyboard and role/name behavior; Chromium CDP AX only. No screen-reader audio or real Safari/iPhone validation.', results };
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
}
const passed = results.filter(result => result.passed).length;
console.log(`Shell accessibility: ${passed}/${results.length} passed`);
if (!results.length || passed !== results.length) process.exitCode = 1;
