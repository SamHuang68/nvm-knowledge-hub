import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startTestServer } from './驗證伺服器.mjs';
import { captureLanguageSurface, assessLanguageSurface } from './雙語畫面契約.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = process.env.NVM_QA_OUTPUT || path.join(root, 'qa', '雙語修正部署', '安全保證語系');
fs.mkdirSync(output, { recursive: true });
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = (process.env.NVM_QA_BASE || server.base).replace(/\/?$/, '/');
const channel = process.env.NVM_QA_BROWSER || 'msedge';
const browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1440, height: 960 } });
await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
const page = await context.newPage();
const result = { base, browser: channel, states: [], switches: [], errors: [], passed: false };
page.on('pageerror', error => result.errors.push(error.message));
await context.tracing.start({ screenshots: true, snapshots: true });
const checkDynamic = async (language, area, state) => {
  const text = await page.locator(area).innerText();
  if (language === 'en') assert.ok(!/[\u3400-\u9fff]/u.test(text), `${area} 英文出現中文`);
  else {
    assert.ok(/[\u3400-\u9fff]/u.test(text), `${area} 缺少繁中`);
    assert.ok(!/[A-Za-z]+(?:[ -]+[A-Za-z]+){3,}/.test(text), `${area} 殘留英文敘述：${text}`);
  }
  result.states.push({ language, area, state, text });
};
try {
  for (const language of ['zh', 'en']) {
    await page.goto(new URL(`security-assurance.html?lang=${language}`, base).href, { waitUntil: 'domcontentloaded' });
    await page.locator('#windowDetail h3').waitFor();
    const initial = await page.evaluate(captureLanguageSurface);
    assert.deepEqual(assessLanguageSurface(initial, language), []);
    for (const phase of ['off', 'boot', 'derive', 'access', 'zeroize']) {
      await page.locator(`[data-phase="${phase}"]`).click();
      assert.equal(await page.locator('.phase-tabs button.active').getAttribute('data-phase'), phase);
      await checkDynamic(language, '.window-layout', phase);
    }
    for (let level = 0; level < 6; level++) {
      await page.locator(`[data-level="${level}"]`).click();
      assert.equal(await page.locator('#evidenceLadder button.active').getAttribute('data-level'), String(level));
      await checkDynamic(language, '#evidenceDetail', level);
    }
    for (const role of ['foundation', 'practitioner', 'evaluator', 'decision']) {
      await page.locator(`[data-role="${role}"]`).click();
      assert.equal(await page.locator('.role-tabs button.active').getAttribute('data-role'), role);
      await checkDynamic(language, '#rolePath', role);
    }
    for (const target of ['ip', 'soc', 'device']) for (const market of ['iot', 'auto', 'payment', 'general']) for (const goal of ['baseline', 'reuse', 'high']) {
      await page.locator('#targetSelect').selectOption(target);
      await page.locator('#marketSelect').selectOption(market);
      await page.locator('#goalSelect').selectOption(goal);
      await checkDynamic(language, '#certResult', { target, market, goal });
      const warning = await page.locator('.cert-warning').innerText();
      assert.ok(warning.includes(language === 'zh' ? '此結果不表示已認證。' : 'This result does not indicate certification.'));
    }
    await page.locator('#windows').screenshot({ path: path.join(output, `${language}-攻擊時窗.png`) });
  }
  const selection = async () => page.evaluate(() => ({ phase: document.querySelector('.phase-tabs button.active').dataset.phase, level: document.querySelector('#evidenceLadder button.active').dataset.level, role: document.querySelector('.role-tabs button.active').dataset.role, target: document.querySelector('#targetSelect').value, market: document.querySelector('#marketSelect').value, goal: document.querySelector('#goalSelect').value }));
  const previous = await selection();
  for (const language of ['zh', 'en', 'zh']) {
    await page.locator('#languageToggle').click();
    assert.equal(await page.evaluate(() => window.HubLanguage.get()), language);
    assert.deepEqual(await selection(), previous, '切換語系不可重設使用者選取');
    assert.deepEqual(assessLanguageSurface(await page.evaluate(captureLanguageSurface), language), []);
    for (const area of ['.window-layout', '#evidenceDetail', '#rolePath', '#certResult']) await checkDynamic(language, area, '往返切換');
    result.switches.push({ language, selection: await selection() });
  }
  assert.deepEqual(result.errors, []);
  result.passed = true;
} catch (error) {
  result.failure = error.stack;
  process.exitCode = 1;
} finally {
  fs.writeFileSync(path.join(output, '安全保證語系驗證.json'), JSON.stringify(result, null, 2));
  await context.tracing.stop({ path: path.join(output, '安全保證語系追蹤.zip') });
  await browser.close();
  await server?.close();
}
if (!result.passed) throw new Error(result.failure);
console.log(`安全保證語系驗證通過：${result.states.length} 個動態畫面與 ${result.switches.length} 次保留選取的語言切換。`);
