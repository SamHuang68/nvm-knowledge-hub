// 示意動態層驗收：標記契約（來源、主張、路徑）、6 組試點範圍，以及鍵盤、減少動態效果、
// motion=static、列印、離開畫面與暫停時都會停下，原始比較圖不動。
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const results = [];
const errors = [];
const note = (passed, label, detail = {}) => results.push({passed: Boolean(passed), label, ...detail});

// 試點範圍：NeoBit 寫入、NeoFuse 寫入、NeoEE 完整 MTP 循環、STT 與 VCM、FeRAM 的雙向操作。
const PILOTS = ['ip-neobit-write', 'ip-neofuse-write', 'ip-neoee-write', 'ip-neoee-erase', 'ip-neoee-read', 'stt-write', 'stt-erase', 'vcm-write', 'vcm-erase', 'feram-write', 'feram-erase'];
const CLAIMS = {along: 'direction', pulse: 'direction', appear: 'state-change'};

// 一、靜態契約：直接讀發布的 atlas HTML。
for (const file of ['nvm-technology-atlas.html', 'nvm-technology-atlas-zh.html']) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const operations = html.split('<div class="nvm-engineering-operation" data-engineering-operation="').slice(1);
  const withMotion = [];
  const problems = [];
  for (const body of operations) {
    const id = body.slice(0, body.indexOf('"'));
    const sources = new Set([...body.matchAll(/href="#source-([^"]+)"/g)].map(match => match[1]));
    const svgs = body.match(/<svg[\s\S]*?<\/svg>/g) || [];
    let tagged = 0;
    for (const svg of svgs) {
      for (const match of svg.matchAll(/<[a-z]+ ([^>]*?)data-motion="([a-z]+)"([^>]*)>/g)) {
        tagged++;
        const attributes = match[1] + match[3];
        const kind = match[2];
        const source = attributes.match(/data-motion-source="([^"]+)"/)?.[1];
        const claim = attributes.match(/data-motion-claim="([^"]+)"/)?.[1];
        const along = attributes.match(/data-motion-along="([^"]+)"/)?.[1];
        if (!CLAIMS[kind]) problems.push({id, kind, issue: '未知的動態種類'});
        if (claim !== CLAIMS[kind]) problems.push({id, kind, claim, issue: '主張等級不符'});
        if (!source || !sources.has(source)) problems.push({id, source, issue: '來源不在這組圖的來源清單'});
        if (kind === 'along' && (!along || !svg.includes(`data-motion-track="${along}"`))) problems.push({id, along, issue: '沿路徑移動但同一張圖沒有該路徑'});
      }
    }
    if (tagged) withMotion.push(id);
  }
  note(!problems.length, `標記契約：來源、主張與路徑（${file}）`, {problems: problems.slice(0, 10)});
  note(JSON.stringify([...new Set(withMotion)].sort()) === JSON.stringify([...PILOTS].sort()), `動態只出現在試點範圍（${file}）`, {withMotion: [...new Set(withMotion)]});
}

// 二、瀏覽器行為。
const server = await startTestServer(root);
const browser = await chromium.launch({headless: true});
const atlas = (language, query = '') => `${server.base}nvm-technology-atlas${language === 'zh' ? '-zh' : ''}.html?lang=${language}${query}`;
const motionState = demo => demo.evaluate(root => {
  // 只認圖內標記元素自己的動畫；演示框外層也帶 data-motion，換步的 CSS 淡入不算示意動態。
  const animations = document.getAnimations().filter(animation => !(animation instanceof CSSAnimation) && animation.effect?.target?.matches?.('.nvm-step-stage [data-motion]'));
  const properties = new Set(animations.flatMap(animation => animation.effect.getKeyframes().flatMap(frame => Object.keys(frame))));
  return {
    running: animations.filter(animation => animation.playState === 'running').length,
    insideStage: animations.every(animation => animation.effect.target.closest('.nvm-step-stage') && root.contains(animation.effect.target)),
    sourced: animations.every(animation => animation.effect.target.dataset.motionSource),
    properties: [...properties].filter(name => !['offset', 'easing', 'composite', 'computedOffset'].includes(name)),
    originalsStill: document.getAnimations().filter(animation => animation.effect?.target?.closest?.('.nvm-op-frames')).length === 0
  };
});

async function openOperation(page, language, id, query = '') {
  await page.goto(atlas(language, query) + '#panorama', {waitUntil: 'networkidle'});
  if (id.startsWith('ip-')) {
    const [, cell, operation] = id.match(/^ip-(.+)-(write|erase|read)$/);
    await page.evaluate(hash => { location.hash = hash; }, `ip-${cell}`);
    await page.locator(`#ip-${cell} [data-operation-select="${operation}"]`).click();
    return page.locator(`#ip-op-${cell}-${operation} .nvm-op-variant`).first();
  }
  await page.evaluate(hash => { location.hash = hash; }, `op-${id}`);
  return page.locator(`#op-${id} .nvm-op-variant`).first();
}

try {
  // 2a. 主要流程：STT 寫入，中英 × 1440／390。
  for (const language of ['en', 'zh']) for (const width of [1440, 390]) {
    const context = await browser.newContext({viewport: {width, height: 1000}, reducedMotion: 'no-preference'});
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const variant = await openOperation(page, language, 'stt-write');
    const demo = variant.locator('[data-nvm-step-root]');
    await demo.waitFor();
    await demo.scrollIntoViewIfNeeded();
    const noteInfo = await demo.evaluate(root => {
      const motionNote = root.querySelector('.nvm-step-motion-note');
      const links = [...motionNote.querySelectorAll('a')];
      return {mode: root.dataset.motion, visible: motionNote.checkVisibility(), text: motionNote.textContent, links: links.length, targets: links.every(link => document.querySelector(link.getAttribute('href')))};
    });
    note(noteInfo.mode === 'illustrative' && noteInfo.visible && noteInfo.links > 0 && noteInfo.targets && /示意動態|Illustrative motion/.test(noteInfo.text), '演示框註明示意動態並連到來源條目', {language, width, ...noteInfo});
    note((await motionState(demo)).running === 0, '載入頁面時不自行動', {language, width});
    await demo.locator('[data-nvm-step-action="next"]').click();
    const stepped = await motionState(demo);
    note(stepped.running > 0 && stepped.insideStage && stepped.sourced && stepped.properties.every(name => ['transform', 'opacity'].includes(name)) && stepped.originalsStill, '切到有動態的步次：只在演示框內、只動 transform 與 opacity、原圖不動', {language, width, ...stepped});
    await demo.locator('[data-nvm-step-action="prev"]').click();
    const stage = demo.locator('.nvm-step-stage');
    await stage.focus();
    await page.keyboard.press('ArrowRight');
    const keyed = await motionState(demo);
    note(await demo.getAttribute('data-step-current') === '2' && keyed.running > 0, '鍵盤方向鍵切步並啟動動態', {language, width});
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    note(await demo.getAttribute('data-playing') === 'false' && (await motionState(demo)).running === 0, '空白鍵暫停時動態一併停止', {language, width});
    await demo.locator('[data-nvm-step-action="reset"]').click();
    await demo.locator('[data-nvm-step-action="next"]').click();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(400);
    note((await motionState(demo)).running === 0, '捲出畫面後動態停止', {language, width});
    await demo.scrollIntoViewIfNeeded();
    await demo.locator('[data-nvm-step-action="reset"]').click();
    await demo.locator('[data-nvm-step-action="next"]').click();
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    note((await motionState(demo)).running === 0, '列印前動態停止', {language, width});
    await page.emulateMedia({media: 'print'});
    note(!await demo.isVisible() && await variant.locator('.nvm-op-frames .nvm-op-frame').first().isVisible(), '列印只保留原始比較圖', {language, width});
    await page.emulateMedia({media: 'screen'});
    if (width === 1440) {
      await demo.locator('[data-nvm-step-action="reset"]').click();
      await demo.locator('[data-nvm-step-action="next"]').click();
      await page.waitForTimeout(3600);
      note((await motionState(demo)).running === 0, '動態有限次數後自行結束，回到原圖', {language});
    }
    await context.close();
  }

  // 2b. 減少動態效果與 motion=static：不建立動態，保留完整比較圖。
  for (const [label, options, query] of [['減少動態效果', {reducedMotion: 'reduce'}, ''], ['motion=static', {reducedMotion: 'no-preference'}, '&motion=static']]) {
    const context = await browser.newContext({viewport: {width: 1440, height: 1000}, ...options});
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const variant = await openOperation(page, 'en', 'stt-write', query);
    const demo = variant.locator('[data-nvm-step-root]');
    await demo.waitFor({state: 'attached'});
    const state = await motionState(demo);
    note(await demo.getAttribute('data-step-mode') === 'static' && !await demo.locator('.nvm-step-motion-note').isVisible() && state.running === 0 && await variant.locator('.nvm-op-frames .nvm-op-frame').count() === 3, `${label}：沒有動態，原圖完整`, state);
    await context.close();
  }

  // 2c. 11 個試點操作逐步走完：每組至少一格有動態，沿路徑的載子確實有位移。
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}, reducedMotion: 'no-preference'});
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  for (const id of PILOTS) {
    const variant = await openOperation(page, 'en', id);
    const demo = variant.locator('[data-nvm-step-root]');
    await demo.waitFor();
    await demo.scrollIntoViewIfNeeded();
    const total = Number(await demo.getAttribute('data-step-count'));
    const perFrame = [];
    for (let step = 2; step <= total; step++) {
      await demo.locator('[data-nvm-step-action="next"]').click();
      await page.waitForTimeout(450);
      perFrame.push(await demo.evaluate(root => {
        const animations = document.getAnimations().filter(animation => !(animation instanceof CSSAnimation) && animation.effect?.target?.matches?.('.nvm-step-stage [data-motion]') && root.contains(animation.effect.target));
        const moved = animations.filter(animation => animation.effect.target.dataset.motion === 'along').map(animation => getComputedStyle(animation.effect.target).transform).filter(value => value !== 'none');
        return {step: Number(root.dataset.stepCurrent), running: animations.length, along: root.querySelectorAll('.nvm-step-stage [data-motion="along"]').length, moved: moved.length};
      }));
    }
    const animated = perFrame.filter(frame => frame.running > 0);
    note(animated.length > 0 && perFrame.every(frame => frame.along === 0 || frame.moved > 0), `試點逐步：${id}`, {perFrame});
  }
  await context.close();
} finally {
  await browser.close();
  await server.close();
}

note(!errors.length, '沒有頁面錯誤', {errors});
const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({passed: results.length - failed.length, total: results.length, failed}, null, 2));
process.exitCode = failed.length ? 1 : 0;
