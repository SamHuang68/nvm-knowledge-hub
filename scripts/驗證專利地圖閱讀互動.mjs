import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium, webkit} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root=path.resolve(import.meta.dirname,'..');
const engine=process.argv.find(arg=>arg.startsWith('--engine='))?.split('=')[1] || 'webkit';
const filter=process.argv.find(arg=>arg.startsWith('--filter='))?.slice('--filter='.length);
const out=path.join(root,'qa','專利地圖閱讀互動',engine);
fs.mkdirSync(out,{recursive:true});
const server=await startTestServer(root);
const browser=await ({chromium,webkit}[engine]).launch();
const results=[];
const snapshot=page=>page.evaluate(()=>({ready:document.readyState,url:location.href,focus:document.activeElement?.outerHTML.slice(0,350),scrollY,trace:window.__readingTrace}));
async function check(name,run) {
  if(filter && !name.includes(filter))return;
  const context=await browser.newContext({viewport:{width:390,height:960},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(server.base).origin ? route.continue() : route.abort());
  const page=await context.newPage();page.setDefaultTimeout(10000);
  const errors=[],trace=[];page.on('pageerror',error=>errors.push(error.message));
  try {
    await run(page,trace);assert.deepEqual(errors,[],'沒有頁面例外');
    await page.screenshot({path:path.join(out,`${name}.png`)});
    results.push({name,passed:true,trace});
  } catch(error) {
    trace.push({step:'失敗當下',...await snapshot(page)});
    await page.screenshot({path:path.join(out,`${name}-失敗.png`)});
    results.push({name,passed:false,error:error.message,trace,errors});
  } finally {await context.close();}
}
async function delayedPage(page) {
  let release,releaseCSS;
  const held=new Promise(resolve=>{release=resolve;});
  const cssHeld=new Promise(resolve=>{releaseCSS=resolve;});
  const cleanup=()=>{releaseCSS();release();};
  await page.route(url=>url.pathname.endsWith('/global-search.css'),async route=>{
    const response=await route.fetch();await cssHeld;
    await route.fulfill({response}).catch(()=>{});
  });
  await page.route(url=>decodeURIComponent(url.pathname).endsWith('/閱讀延遲.svg'),async route=>{await held;await route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'}).catch(()=>{});});
  await page.route('**/nvm-technology-atlas-zh.html*',async route=>{
    const response=await route.fetch();
    const html=(await response.text()).replace('</body>','<img src="閱讀延遲.svg" width="1" height="1" alt="" aria-hidden="true" style="position:fixed;pointer-events:none;opacity:0"></body>');
    await route.fulfill({response,body:html});
  });
  await page.addInitScript(()=>{
    window.__readingTrace=[];window.__readingCSSReady=false;
    document.addEventListener('load',event=>{
      if(event.target?.tagName==='LINK' && new URL(event.target.href).pathname.endsWith('/global-search.css'))window.__readingCSSReady=true;
    },true);
    for(const name of ['focusin','focusout','keydown','pointerdown','load','hashchange','input']) window.addEventListener(name,event=>{
      if(window.__readingTrace.length<40)window.__readingTrace.push({event:name,time:performance.now(),focus:document.activeElement?.tagName,id:document.activeElement?.id,hash:location.hash});
    },true);
  });
  try {
    await page.goto(`${server.base}nvm-technology-atlas-zh.html?lang=zh#patent-maps`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.querySelector('link[href*="global-search.css"]'));
    await page.locator('#nvm-map-query').waitFor({state:'visible'});
    assert.equal(await page.evaluate(()=>window.__readingCSSReady),false,'搜尋樣式保持待完成');
    assert.equal(await page.evaluate(()=>document.readyState),'interactive','保持真實 load 尚未完成的邊界');
    return {release,cleanup,settleCSS:async()=>{
      releaseCSS();await page.waitForFunction(()=>window.__readingCSSReady);
      // 動態樣式完成後，讓初始原生錨點完成排版；不等待圖片或整頁 load。
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      assert.equal(await page.evaluate(()=>document.readyState),'interactive','樣式完成時圖片仍待載入');
    }};
  } catch(error) {cleanup();throw error;}
}
async function finishLoad(page,release) {
  release();await page.waitForLoadState('load');
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
}
try {
  await check('手機矩陣點擊範圍',async(page,trace)=>{
    await page.goto(`${server.base}nvm-technology-atlas-zh.html?lang=zh#patent-maps`);
    await page.locator('#nvm-map-company').selectOption('ememory');
    const link=page.locator('[data-map-vendor-row="ememory"] [data-map-cell="otp"] a');
    await link.scrollIntoViewIfNeeded();
    const box=await link.boundingBox();
    const table=await page.locator('.nvm-map-matrix').boundingBox(),caption=await page.locator('.nvm-map-matrix caption').boundingBox();
    trace.push({step:'數字連結與矩陣說明大小',box,table,caption});
    assert.ok(box.width>=40 && box.height>=40,'手機數字連結至少保留舊版 40 × 40 點擊範圍');
    assert.ok(caption.width>=table.width-4,'矩陣說明使用整個容器寬度，不形成垂直窄欄');
    assert.ok((await page.locator('.nvm-map-matrix').ariaSnapshot()).includes('columnheader'),'手機保留可及性表格欄位標題');
    await page.screenshot({path:path.join(out,'手機矩陣點擊範圍-矩陣.png')});
    await link.tap();
    await page.waitForFunction(()=>location.hash.startsWith('#family-') && document.activeElement?.tagName==='H4');
    assert.equal(await page.locator('#nvm-map-company').inputValue(),'ememory');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  });
  for(const method of ['直接填值','觸控','Tab'])await check(`延遲載入保留搜尋焦點-${method}`,async(page,trace)=>{
    const delayed=await delayedPage(page);
    try {
      const query=page.locator('#nvm-map-query');
      if(method==='直接填值') {
        await delayed.settleCSS();await query.fill('US6678190');
      } else if(method==='觸控') {
        await query.scrollIntoViewIfNeeded();
        const box=await query.boundingBox();
        trace.push({step:'捲至搜尋框後的觸控位置',box});
        assert.ok(box && box.y>=0 && box.y+box.height<=960 && box.x>=0 && box.x+box.width<=390,'搜尋框在可觸控視窗內');
        await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
        await page.keyboard.type('US6678190');
      } else {
        for(let count=0;count<30 && await page.evaluate(()=>document.activeElement?.id)!=='nvm-map-query';count++)await page.keyboard.press('Tab');
        assert.equal(await page.evaluate(()=>document.activeElement?.id),'nvm-map-query','Tab 可到達搜尋框');
        await page.keyboard.type('US6678190');
      }
      assert.equal(await page.evaluate(()=>document.readyState),'interactive','使用者操作完成時仍未觸發 load');
      assert.equal(await query.inputValue(),'US6678190');
      assert.equal(await page.evaluate(()=>document.activeElement?.id),'nvm-map-query','操作後焦點在搜尋框');
      trace.push({step:'使用者已開始輸入',...await snapshot(page)});
      if(method!=='直接填值') {
        assert.equal(await page.evaluate(()=>window.__readingCSSReady),false,'真實觸控與 Tab 發生於搜尋樣式完成前');
        await delayed.settleCSS();
        assert.equal(await page.evaluate(()=>document.activeElement?.id),'nvm-map-query','搜尋樣式完成不能搶走真實操作焦點');
      }
      trace.push({step:'搜尋樣式完成、圖片仍待載入',...await snapshot(page)});
      await finishLoad(page,delayed.release);
      trace.push({step:'延遲資源完成',...await snapshot(page)});
      assert.equal(await page.evaluate(()=>document.activeElement?.id),'nvm-map-query','完成載入不能搶走已開始操作的搜尋焦點');
      await page.keyboard.type('B2');
      assert.equal(await query.inputValue(),'US6678190B2','載入前後可連續輸入完整公報號');
    } finally {delayed.cleanup();}
  });
  await check('延遲載入保留初始定位',async(page,trace)=>{
    const delayed=await delayedPage(page);
    try {
      await delayed.settleCSS();
      await finishLoad(page,delayed.release);trace.push({step:'無使用者操作的初始定位',...await snapshot(page)});
      assert.equal(await page.evaluate(()=>document.activeElement?.tagName),'H2');
      assert.equal(await page.locator('#patent-maps').isVisible(),true);
      assert.equal(await page.evaluate(()=>location.hash),'#patent-maps');
    } finally {delayed.cleanup();}
  });
} finally {await browser.close();await server.close();}
fs.writeFileSync(path.join(out,'結果.json'),JSON.stringify({engine,results},null,2));
console.log(JSON.stringify({engine,results:results.map(({name,passed,error})=>({name,passed,error}))}));
if(!results.length || results.some(result=>!result.passed))process.exitCode=1;
