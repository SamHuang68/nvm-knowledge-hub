import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startTestServer } from './驗證伺服器.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa/雙語修正部署/模擬語系'));
fs.mkdirSync(output, { recursive: true });
const results = [];
const snapshots = [];
const errors = [];
let server;
let browser;
let base = process.env.NVM_QA_BASE;
const cjk = /[\u3400-\u9fff]/u;
const labels = {
  standby: ['待命狀態', 'STANDBY'], idle: ['系統待命', 'SYSTEM IDLE'],
  defect: ['偵測到缺陷', 'DEFECT DETECTED'], scanning: ['BIST 掃描中…', 'BIST SCANNING...'],
  scanned: ['BIST 掃描完成', 'BIST COMPLETED'], solving: ['BIRA 解算中…', 'BIRA SOLVING...'],
  allocated: ['BIRA 備援配置已確認', 'BIRA SOLUTION LOCKED'], burning: ['反熔絲燒錄中…', 'BURNING ANTIFUSE...'],
  repaired: ['修復完成', 'REPAIR COMPLETE'], insufficient: ['備援不足：無法修復', 'UNREPAIRABLE: INSUFFICIENT SPARES']
};
const check = async (label, run) => {
  try { await run(); results.push({ label, passed: true }); }
  catch (error) { results.push({ label, passed: false, detail: error.message }); throw error; }
};
try {
  if (!base) { server = await startTestServer(root); base = server.base; }
  const channel = process.env.NVM_QA_BROWSER || 'msedge';
  browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  await context.addInitScript(() => {
    window.__labCanvasText = {};
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    const fill = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      window.__labCanvasText[this.canvas.id] = [];
      return clear.apply(this, args);
    };
    CanvasRenderingContext2D.prototype.fillText = function (...args) {
      (window.__labCanvasText[this.canvas.id] ||= []).push(String(args[0]));
      return fill.apply(this, args);
    };
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const read = () => page.evaluate(() => ({
    language: window.HubLanguage.get(), status: document.querySelector('#lblScanStatus').textContent,
    state: document.querySelector('#lblScanStatus').dataset.state,
    defects: document.querySelector('#statDefectCount').textContent,
    spares: document.querySelector('#statSparesUsed').textContent,
    log: [...document.querySelectorAll('#terminalLogs .term-line')].map(el => el.textContent),
    registers: [...document.querySelectorAll('.fuse-state')].map(el => ({ state: el.dataset.state, text: el.textContent })),
    fusebox: document.querySelector('#lblFuseboxStatus').textContent,
    yield: document.querySelector('#statDieYield').textContent,
    canvas: window.__labCanvasText,
    mura: ['statUniformity', 'statDeltaE', 'statLutStatus'].map(id => document.getElementById(id).textContent),
    muraState: document.querySelector('#canvasMura').dataset.state,
    muraBoundary: document.querySelector('#lab-display-tuner .lab-header > p').innerText.trim(),
    muraLabels: ['statUniformity', 'statDeltaE'].map(id => document.getElementById(id).closest('.stat-box').querySelector('.stat-label').innerText.trim()),
    trim: ['statTrimVar', 'statYield'].map(id => document.getElementById(id).textContent),
    tooltip: document.querySelector('#btnToggleTrimView').title,
    timing: document.querySelector('#waveformTimingTrack').textContent,
    eink: document.querySelector('#lblEinkMode').textContent
  }));
  const assertLanguage = (state, language, status) => {
    assert.equal(state.language, language);
    assert.equal(state.state, status);
    assert.equal(state.status, labels[status][language === 'zh' ? 0 : 1]);
    assert.ok(state.log.length > 0);
    for (const text of [...state.log, ...state.registers.map(reg => reg.text), state.fusebox]) {
      assert.equal(cjk.test(text), language === 'zh', `日誌或暫存器語系錯誤：${text}`);
      if (language === 'zh') assert.doesNotMatch(text, /MANUAL|DEFECT|INJECTION|SCANNING|COMPLETED|SOLVING|ALLOCATE|UNREPAIRABLE|APPLYING|HARDWARE|REGISTER|LOCKED|SIMULATION|WAITING|FAULT|ADDRESSES|CAPTURED|GATE OXIDE|ROW-REPAIR MODEL|Counting distinct/iu);
    }
  };
  const switchLanguage = async () => page.locator('.language-toggle').first().click();
  const roundTrip = async (language, status) => {
    const before = await read();
    assertLanguage(before, language, status);
    await switchLanguage();
    const other = await read();
    assertLanguage(other, language === 'zh' ? 'en' : 'zh', status);
    assert.equal(other.log.length, before.log.length);
    assert.equal(other.defects, before.defects);
    assert.equal(other.spares, before.spares);
    assert.deepEqual(other.registers.map(reg => reg.state), before.registers.map(reg => reg.state));
    await switchLanguage();
    assert.deepEqual(await read(), before);
    snapshots.push(before, other);
  };
  const open = async language => {
    await page.goto(new URL(`specialty-nvm.html?lang=${language}`, base).href, { waitUntil: 'load' });
    await page.waitForFunction(() => document.querySelector('#lblScanStatus').dataset.state === 'standby');
  };
  const cell = async (row, col = 0) => {
    const canvas = page.locator('#canvasMatrix');
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    await canvas.click({ position: { x: (12 + (col + .5) * 256 / 12) * box.width / 280, y: (12 + (row + .5) * 256 / 12) * box.height / 280 } });
  };
  const waitState = state => page.waitForFunction(expected => document.querySelector('#lblScanStatus').dataset.state === expected, state);
  const transient = async (button, state, language) => {
    // 同一個瀏覽器工作內切換兩次，避免 400–600ms 的模擬計時器在測試滾動時完成。
    const views = await page.evaluate(({ button }) => {
      const capture = () => ({ state: document.querySelector('#lblScanStatus').dataset.state, text: document.querySelector('#lblScanStatus').textContent, language: HubLanguage.get(), log: document.querySelector('#terminalLogs').textContent });
      document.getElementById(button).click();
      const initial = capture();
      document.querySelector('.language-toggle').click();
      const switched = capture();
      document.querySelector('.language-toggle').click();
      return [initial, switched, capture()];
    }, { button });
    views.forEach((view, index) => {
      const lang = index === 1 ? (language === 'zh' ? 'en' : 'zh') : language;
      assert.equal(view.state, state);
      assert.equal(view.language, lang);
      assert.equal(view.text, labels[state][lang === 'zh' ? 0 : 1]);
      assert.equal(cjk.test(view.log), lang === 'zh');
    });
    snapshots.push(...views);
  };
  for (const language of ['zh', 'en']) {
    await check(`${language}：待命與缺陷操作的雙向語言切換`, async () => {
      await open(language); await roundTrip(language, 'standby');
      await cell(0); await roundTrip(language, 'defect');
      await cell(0); await roundTrip(language, 'idle');
      await page.locator('#btnGenDefect').click(); await roundTrip(language, 'defect');
    });
    await check(`${language}：掃描、解算、燒錄進行中與完成後文案`, async () => {
      await transient('btnRunBIST', 'scanning', language); await waitState('scanned'); await roundTrip(language, 'scanned');
      await transient('btnRunBIRA', 'solving', language); await waitState('allocated'); await roundTrip(language, 'allocated');
      await transient('btnBurnFuse', 'burning', language); await waitState('repaired'); await roundTrip(language, 'repaired');
      const state = await read();
      assert.equal(state.yield, language === 'zh' ? '通過 (100%)' : 'PASS (100%)');
      assert.ok(state.registers.some(reg => reg.state === 'burned'));
      await page.locator('#lab-repair-simulator').screenshot({ path: path.join(output, `備援完成-${language}.png`) });
    });
    await check(`${language}：備援不足狀態及歷史日誌切換`, async () => {
      await open(language);
      for (let row = 0; row < 5; row++) await cell(row);
      await page.locator('#btnRunBIST').click(); await waitState('scanned');
      await page.locator('#btnRunBIRA').click(); await waitState('insufficient');
      await roundTrip(language, 'insufficient');
      assert.equal((await read()).yield, language === 'zh' ? '未通過 (0%)' : 'FAIL (0%)');
    });
    await check(`${language}：De-Mura 補償前後與還原保留雙語固定假設、非量測界線`, async () => {
      let wasCorrected = false;
      for (const corrected of [false, true, false]) {
        if (corrected !== wasCorrected) await page.locator('#btnToggleMura').click();
        wasCorrected = corrected;
        for (const lang of [language, language === 'zh' ? 'en' : 'zh', language]) {
          if ((await read()).language !== lang) await switchLanguage();
          const state = await read();
          const expected = lang === 'zh'
            ? (corrected ? ['99.4%（固定假設 · 非量測）', '0.45（固定假設 · 非量測）', '已啟用 (64Kb)'] : ['74.2%（固定假設 · 非量測）', '3.8（固定假設 · 非量測）', '未啟用補償'])
            : (corrected ? ['99.4% (fixed assumption · not measured)', '0.45 (fixed assumption · not measured)', 'ACTIVE (64Kb)'] : ['74.2% (fixed assumption · not measured)', '3.8 (fixed assumption · not measured)', 'BYPASS']);
          assert.deepEqual(state.mura, expected);
          assert.equal(state.muraState, corrected ? 'corrected' : 'raw');
          assert.deepEqual(state.muraLabels, lang === 'zh'
            ? ['光學均勻度（固定假設）', '色偏 ΔE（固定假設）']
            : ['UNIFORMITY (FIXED ASSUMPTION)', 'ΔE (FIXED ASSUMPTION)']);
          assert.equal(state.muraBoundary, lang === 'zh'
            ? '左側滑動調節 Gamma 曲線與觀察色階輸出；右側 De-Mura 均勻度／ΔE 為固定假設示意（74.2%→99.4%、3.8→0.45），非光學量測。'
            : 'Left: Gamma curve tuner. Right: De-Mura uniformity/ΔE uses fixed teaching assumptions (74.2%→99.4%, 3.8→0.45) — not optical measurement.');
          assert.equal(state.canvas.canvasMura.length, 1);
          assert.equal(cjk.test(state.canvas.canvasMura.join(' ')), lang === 'zh');
          assert.deepEqual(state.canvas.canvasMura, [lang === 'zh'
            ? (corrected ? '✓ 已套用 De-Mura LUT（亮度均勻）' : '⚠ 偵測到原始 Mura 亮度不均')
            : (corrected ? '✓ DE-MURA LUT APPLIED (UNIFORM)' : '⚠ RAW MURA UNEVENNESS DETECTED')]);
          snapshots.push(state);
        }
      }
      await page.locator('#canvasMura').screenshot({ path: path.join(output, `顯示補償-${language}.png`) });
    });
    await check(`${language}：微調數值、提示與圖例保持語系`, async () => {
      for (const trimmed of [false, true]) {
        if (trimmed) { await page.locator('#btnRunTrim').click(); await page.waitForFunction(() => !document.querySelector('#btnRunTrim').disabled); }
        for (const lang of [language, language === 'zh' ? 'en' : 'zh', language]) {
          if ((await read()).language !== lang) await switchLanguage();
          const state = await read();
          assert.equal(state.tooltip, lang === 'zh' ? '切換微調前後的比較畫面' : 'Toggle Raw vs Post-Trim View');
          assert.equal(state.trim[1], trimmed ? (lang === 'zh' ? '99.8% 通過' : '99.8% PASS') : (lang === 'zh' ? '83.5%（未達標）' : '83.5% (Reject)'));
          assert.equal(state.canvas.canvasVref.length, 3);
          assert.equal(cjk.test(state.canvas.canvasVref.join(' ')), lang === 'zh');
          snapshots.push(state);
        }
      }
    });
    await check(`${language}：電子紙三模式的電極圖例與階段說明`, async () => {
      for (const mode of ['mono', 'esl', 'color']) {
        await page.locator(`.mode-btn[data-mode="${mode}"]`).click();
        for (const lang of [language, language === 'zh' ? 'en' : 'zh', language]) {
          if ((await read()).language !== lang) await switchLanguage();
          const state = await read();
          assert.equal(cjk.test(state.eink), lang === 'zh');
          assert.equal(cjk.test(state.timing), lang === 'zh');
          assert.equal(state.canvas.canvasCapsule.length, 2);
          assert.equal(cjk.test(state.canvas.canvasCapsule.join(' ')), lang === 'zh');
          snapshots.push(state);
        }
      }
      await page.locator('#canvasCapsule').screenshot({ path: path.join(output, `電子紙電極-${language}.png`) });
    });
  }
  await check('瀏覽器未發生程式執行錯誤', async () => assert.deepEqual(errors, []));
} catch (error) {
  if (!results.some(result => !result.passed)) results.push({ label: '完成模擬雙語驗證', passed: false, detail: error.stack });
} finally {
  await browser?.close();
  await server?.close();
}
const passed = results.length > 0 && results.every(result => result.passed);
fs.writeFileSync(path.join(output, '模擬雙語驗證.json'), JSON.stringify({ passed, checkedAt: new Date().toISOString(), base, results, snapshots, errors }, null, 2) + '\n');
console.log(JSON.stringify({ passed, checks: results.length, failures: results.filter(result => !result.passed) }));
if (!passed) process.exitCode = 1;
