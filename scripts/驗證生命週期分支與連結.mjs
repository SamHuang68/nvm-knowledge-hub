import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { startTestServer } from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa', '生命週期分支與連結'));
fs.mkdirSync(output, {recursive:true});
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = new URL(process.env.NVM_QA_BASE || server.base);
const channel = process.env.NVM_QA_CHANNEL || 'msedge';
const browser = await chromium.launch({headless:true, ...(channel === 'chromium' ? {} : {channel})});
const results = [], phases = ['off','reconstruct','access','zeroize'];

async function check(name, run, options = {}) {
  if(process.env.NVM_QA_FILTER&&!name.includes(process.env.NVM_QA_FILTER))return;
  const context = await browser.newContext({serviceWorkers:'block', viewport:{width:1440,height:1000}, ...options});
  await context.route('**/*', route => new URL(route.request().url()).origin === base.origin ? route.continue() : route.abort());
  await context.addInitScript(() => {
    // 測試覆寫剪貼簿介面；不觸及使用者的真實剪貼簿。
    Object.defineProperty(navigator, 'clipboard', {configurable:true, value:{writeText:async text => {
      if (window.__qaClipboardDenied) throw new Error('測試模擬：剪貼簿拒絕');
      window.__qaCopiedLink = text;
    }}});
  });
  const page = await context.newPage(), errors = [];
  page.setDefaultTimeout(12000);
  page.on('pageerror', error => errors.push(error.message));
  try {
    const evidence = await run(page);
    assert.deepEqual(errors, [], '沒有頁面未處理例外');
    results.push({名稱:name,通過:true,證據:evidence});
  } catch (error) {
    results.push({名稱:name,通過:false,原因:error.message,頁面錯誤:errors});
    await page.screenshot({path:path.join(output, `${name}-失敗.png`)}).catch(() => {});
  } finally { await context.close(); }
}

async function visit(page, query = 'lang=zh&lifecycle-phase=off', hash = 'architecture') {
  await page.goto(new URL(`oip-secure-storage.html?${query}#${hash}`, base).href, {waitUntil:'load'});
  await page.locator('.lifecycle-reader').waitFor({state:'attached'});
}
async function phase(page, expected) {
  await page.waitForFunction(expected => document.querySelector('.lifecycle-diagram').dataset.phase === expected, expected);
  assert.equal(await page.locator(`.lifecycle-controls [data-phase="${expected}"]`).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('[data-life-play]').getAttribute('aria-pressed'), 'false', '連結與手動選擇保持暫停');
}
async function screenshot(page, name) {
  // 僅擷取時將固定頁首留在文件頂端，避免頁首蓋住長圖解；正式樣式不變。
  await page.evaluate(()=>{const style=document.createElement('style');style.id='life-qa-capture-style';style.textContent='.site-header{position:absolute!important;top:0!important}';document.head.appendChild(style);});
  try {
    const clip=await page.locator('.lifecycle-reader').evaluate(element=>{const rect=element.getBoundingClientRect();return {x:rect.x+scrollX,y:rect.y+scrollY,width:rect.width,height:rect.height};});
    // 直接以文件座標擷取；無 JavaScript 情境不依賴元素穩定等待的動畫回呼。
    await page.screenshot({path:path.join(output, `${name}.png`),fullPage:true,clip,animations:'disabled'});
  } finally {await page.evaluate(()=>document.getElementById('life-qa-capture-style')?.remove());}
}
async function layout(page) {
  return page.locator('.lifecycle-reader').evaluate(root => {
    const branches = [...root.querySelectorAll('.life-data-link')].map(branch => {
      const source=branch.querySelector('.life-link-source').getBoundingClientRect();
      const arrow=branch.querySelector('.life-link-arrow').getBoundingClientRect();
      const target=branch.querySelector('.life-link-target').getBoundingClientRect();
      return {來源與箭頭間距:arrow.left-source.right,箭頭與目標間距:target.left-arrow.right};
    });
    return {內容寬度:root.scrollWidth,容器寬度:root.clientWidth,分支:branches,暫存節點數:root.querySelectorAll('.life-node').length,持久資料數:root.querySelectorAll('.life-record').length};
  });
}

try {
  await check('中英文階段連結還原', async page => {
    const restored=[];
    for (const lang of ['zh','en']) for (const expected of phases) {
      await visit(page, `lang=${lang}&lifecycle-phase=${expected}&motion=step`, 'helper-data');
      await phase(page, expected);
      const link=new URL(await page.locator('[data-life-share-link]').inputValue());
      assert.equal(link.searchParams.get('lang'),lang);
      assert.equal(link.searchParams.get('motion'),'step');
      assert.equal(link.searchParams.get('lifecycle-phase'),expected);
      assert.equal(link.hash,'#helper-data');
      await page.waitForTimeout(1900);
      await phase(page,expected);
      restored.push({語言:lang,階段:expected,保持暫停:true});
    }
    return restored;
  });

  await check('非法參數與瀏覽器返回', async page => {
    for (const value of ['unknown','__proto__','']) {
      await visit(page,`lang=zh&lifecycle-phase=${value}`,'helper-data');
      await phase(page,'off');
      assert.equal(new URL(await page.locator('[data-life-share-link]').inputValue()).searchParams.get('lifecycle-phase'),'off');
    }
    await visit(page,'lang=zh&lifecycle-phase=off&motion=step','helper-data');
    await page.locator('[data-phase="reconstruct"]').click();
    await page.locator('[data-phase="access"]').click();
    await phase(page,'access');
    await page.goBack(); await phase(page,'reconstruct');
    await page.goForward(); await phase(page,'access');
    const url=new URL(page.url());
    assert.equal(url.searchParams.get('lang'),'zh');
    assert.equal(url.searchParams.get('motion'),'step');
    assert.equal(url.hash,'#helper-data');
    return {非法值回退:'off',返回還原:'reconstruct',前進還原:'access',保留語言與錨點:true};
  });

  await check('分支焦點與原錨點', async page => {
    await visit(page);
    assert.equal(await page.locator('.life-data-link').count(),2);
    for (const expected of phases) {
      await page.locator(`.lifecycle-controls [data-phase="${expected}"]`).click();
      const focus=await page.locator('.life-link-focus').evaluateAll(items=>items.map(item=>getComputedStyle(item).visibility));
      assert.deepEqual(focus,expected==='reconstruct'?['visible','hidden']:expected==='access'?['hidden','visible']:['hidden','hidden']);
      assert.equal(await page.locator('.life-node:visible').count(),3);
      assert.equal(await page.locator('.life-record:visible').count(),3);
    }
    for (const anchor of ['lifecycle','helper-data']) {
      assert.equal(await page.locator(`#${anchor}`).count(),1);
      await page.locator(`.life-source-nav a[href="#${anchor}"]`).click();
      assert.equal(new URL(page.url()).hash,`#${anchor}`);
      assert.equal(new URL(await page.locator('[data-life-share-link]').inputValue()).hash,`#${anchor}`);
    }
    assert.equal(await page.locator('.life-source-nav a[target="_blank"]').getAttribute('href'),'https://www.synopsys.com/designware-ip/memories-logic-libraries/secure-storage-otp-ip.html');
    return {分支數:2,節點完整:true,原錨點可定位:true,外部來源:'僅核對原連結，未開啟網路'};
  });

  await check('剪貼簿成功與拒絕復原', async page => {
    await visit(page,'lang=zh&lifecycle-phase=access','helper-data');
    await page.locator('[data-life-copy]').click();
    await page.waitForFunction(()=>document.querySelector('[data-life-share-status]').textContent.includes('已複製'));
    assert.equal(await page.evaluate(()=>window.__qaCopiedLink),await page.locator('[data-life-share-link]').inputValue());
    await page.locator('#languageToggle').click();
    await page.waitForFunction(()=>window.HubLanguage.get()==='en');
    const switchedURL=new URL(await page.locator('[data-life-share-link]').inputValue());
    assert.equal(switchedURL.searchParams.get('lang'),'en');
    assert.equal(switchedURL.searchParams.get('lifecycle-phase'),'access');
    assert.equal(switchedURL.hash,'#helper-data');
    assert.equal(new URL(await page.evaluate(()=>window.__qaCopiedLink)).searchParams.get('lang'),'zh','測試剪貼簿仍只有先前的繁中連結');
    assert.equal(await page.locator('[data-life-share-status]').innerText(),'Opening the link restores this phase and stays paused.','語系改變後的英文連結回到待複製狀態');
    await phase(page,'access');
    await page.evaluate(()=>window.__qaClipboardDenied=true);
    await page.locator('[data-life-copy]').click();
    await page.waitForFunction(()=>document.querySelector('[data-life-share-status]').textContent.includes('manual copying'));
    const fallback=await page.locator('[data-life-share-link]').evaluate(input=>({唯讀:input.readOnly,取得焦點:document.activeElement===input,完整選取:input.selectionStart===0&&input.selectionEnd===input.value.length}));
    assert.deepEqual(fallback,{唯讀:true,取得焦點:true,完整選取:true});
    await screenshot(page,'桌面-手動複製');
    return {剪貼簿:'使用測試替身，未改動真實剪貼簿',語系切換:{欄位語言:'en',已複製語言:'zh',狀態:'待複製',階段:'access',錨點:'#helper-data'},失敗復原:fallback};
  });

  await check('鍵盤操作與減少動態', async page => {
    await visit(page);
    await page.locator('.lifecycle-controls [data-phase="off"]').focus();
    await page.keyboard.press('ArrowRight'); await phase(page,'reconstruct');
    assert.equal(await page.evaluate(()=>document.activeElement.dataset.phase),'reconstruct');
    await page.keyboard.press('End'); await phase(page,'zeroize');
    await page.keyboard.press('Home'); await phase(page,'off');
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForFunction(()=>document.querySelector('[data-life-play]').disabled);
    assert.equal(await page.locator('[data-life-play]').isDisabled(),true);
    await page.locator('[data-life-next]').click(); await phase(page,'reconstruct');
    const durations=await page.locator('.life-data-link,.life-node').evaluateAll(items=>items.map(item=>getComputedStyle(item).transitionDuration));
    assert.ok(durations.every(value=>value.split(',').every(duration=>parseFloat(duration)<=0.001)));
    await page.locator('[data-life-copy]').focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(()=>document.querySelector('[data-life-share-status]').textContent.includes('已複製'));
    return {方向鍵與HomeEnd:true,減少動態禁用播放:true,手動步進:true,Enter複製:true};
  });

  await check('播放一次與返回停止',async page=>{
    await visit(page);
    await page.locator('[data-life-play]').click();
    assert.equal(await page.locator('[data-life-play]').getAttribute('aria-pressed'),'true');
    await page.waitForFunction(()=>document.querySelector('.lifecycle-diagram').dataset.phase==='zeroize');
    await page.waitForFunction(()=>document.querySelector('[data-life-play]').getAttribute('aria-pressed')==='false');
    await page.waitForTimeout(1900);await phase(page,'zeroize');
    await page.locator('.lifecycle-controls [data-phase="off"]').click();
    await page.locator('[data-life-play]').click();
    await page.goBack();await phase(page,'zeroize');
    return {自然結束:'zeroize，保持暫停',返回停止播放:true};
  });

  await check('靜態與列印完整閱讀', async page => {
    for (const lang of ['zh','en']) {
      await visit(page,`lang=${lang}&lifecycle-phase=access&motion=static`);
      assert.equal(await page.locator('.lifecycle-diagram').getAttribute('data-phase'),'access');
      assert.equal(await page.locator('.life-phase-status [data-life-phase]:visible').count(),4);
      assert.equal(await page.locator('.lifecycle-controls:visible,.life-playback:visible,.life-share:visible').count(),0);
      assert.equal(await page.locator('.life-node:visible').count(),3);
      await screenshot(page,`靜態-${lang==='zh'?'中文':'英文'}`);
    }
    await visit(page,'lang=zh&lifecycle-phase=reconstruct');
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('.life-phase-status [data-life-phase]:visible').count(),4);
    assert.equal(await page.locator('.lifecycle-controls:visible,.life-playback:visible,.life-share:visible').count(),0);
    assert.equal(await page.locator('#lifecycleOutput').isVisible(),true,'列印保留原本當前階段的完整說明與所需證據');
    await screenshot(page,'列印樣式');
    return {中英文靜態:'四階段可見',列印:'四階段與原當前階段證據可見，操作控制隱藏'};
  });

  await check('無JavaScript完整閱讀', async page => {
    await visit(page,'lang=en&lifecycle-phase=zeroize','helper-data');
    assert.equal(await page.locator('.life-phase-status [data-life-phase]:visible').count(),4);
    assert.equal(await page.locator('.life-node:visible').count(),3);
    assert.equal(await page.locator('.life-record:visible').count(),3);
    assert.equal(await page.locator('#architecture').evaluate(section=>getComputedStyle(section).opacity),'1');
    assert.equal(await page.locator('.lifecycle-controls:visible,.life-playback:visible,.life-share:visible,#lifecycleOutput:visible').count(),0);
    await screenshot(page,'無JavaScript');
    return {預設語言:'沿用原頁面英文',四階段可見:true,全部資料與節點可見:true};
  },{javaScriptEnabled:false});

  for (const lang of ['zh','en']) for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
    const name=`${viewport.width===390?'手機':'桌面'}-${lang==='zh'?'中文':'英文'}`;
    await check(name,async page=>{
      await visit(page,`lang=${lang}&lifecycle-phase=reconstruct`);
      const evidence=await layout(page);
      assert.ok(evidence.內容寬度<=evidence.容器寬度+1,'圖解容器沒有水平溢位');
      assert.ok(evidence.分支.every(branch=>branch.來源與箭頭間距>=-1&&branch.箭頭與目標間距>=-1),'分支標籤與箭頭不重疊');
      await screenshot(page,name);
      return evidence;
    },{viewport});
  }

  await check('百分之二百縮放',async page=>{
    await visit(page,'lang=zh&lifecycle-phase=access');
    await page.evaluate(()=>document.documentElement.style.zoom='2');
    const evidence=await layout(page);
    assert.ok(evidence.內容寬度<=evidence.容器寬度+1,'200% CSS 縮放後圖解沒有水平溢位');
    assert.ok(evidence.分支.every(branch=>branch.來源與箭頭間距>=-1&&branch.箭頭與目標間距>=-1));
    await screenshot(page,'百分之二百縮放');
    return {方法:'瀏覽器 CSS zoom=2，未冒稱原生選單縮放',...evidence};
  });
} finally {
  await browser.close(); await server?.close();
  fs.writeFileSync(path.join(output,'驗證結果.json'),JSON.stringify({瀏覽器:browser.version(),通道:channel,結果:results,限制:['外部來源僅核對既有連結；所有對外請求均阻擋。','剪貼簿以測試替身驗證成功與拒絕，不改動使用者真實剪貼簿。','無 JavaScript 沿用原頁面英文預設；無法以查詢參數執行語言切換。','200% 縮放使用 CSS zoom=2；未操作原生瀏覽器縮放選單。','長圖解截圖僅在擷取時將固定頁首留在文件頂端，避免截圖被頁首遮住；正式樣式未變。','未執行原生讀屏與實體安全驗證。']},null,2));
}
const failures=results.filter(result=>!result.通過);
console.log(`生命週期分支與連結：${results.length-failures.length}／${results.length} 通過；證據：${output}`);
for(const failure of failures)console.error(`失敗：${failure.名稱}；原因：${failure.原因}`);
if(failures.length)process.exitCode=1;
