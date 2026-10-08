import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { startTestServer } from './test-server.mjs';
const root=path.resolve(import.meta.dirname,'..'), out=path.join(root,'qa','圖解與章節導覽');
fs.mkdirSync(out,{recursive:true});
const server=await startTestServer(root), browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
try {
 for(const width of [1440,390,320])for(const lang of ['zh','en']){
  const context=await browser.newContext({viewport:{width,height:1000},deviceScaleFactor:1});
  const page=await context.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${server.base}index.html?lang=${lang}`,{waitUntil:'networkidle'});
  await page.waitForSelector('.storage-explorer-ready');
  if(width===1440&&lang==='zh')await page.screenshot({path:path.join(out,'首頁預覽-1440.png')});
  assert.equal(await page.locator('[data-storage-mode]').count(),4);
  for(const mode of ['charge','magnetic','resistance','polarization']){
   await page.locator(`[data-storage-mode=${mode}]`).click();
   assert.equal(await page.locator(`[data-storage-panel=${mode}]`).isVisible(),true);
   assert.equal(await page.locator('[data-storage-panel]:visible').count(),1);
  }
  await page.locator('[data-storage-reset]').click();await page.locator('[data-storage-next]').click();
  assert.match(await page.locator('[data-storage-status]').textContent(),/^2 \/ 3/);
  await page.locator('[data-storage-prev]').click();
  assert.match(await page.locator('[data-storage-status]').textContent(),/^1 \/ 3/);
  assert.equal(await page.locator('[data-probe-candidate]').count()>0,true);
  const candidate=await page.locator('#probeResultDisplay').innerText();
  assert.equal(candidate.includes(lang==='zh'?'成立前提':'Prerequisites'),true);
  for(const button of await page.locator('.probe-btn').all()){
   await button.click();assert.equal(await button.getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('.probe-btn[aria-pressed=true]').count(),1);
   const labelledBy=await page.locator('#probeResultDisplay').getAttribute('aria-labelledby');
   assert.equal(labelledBy,await button.getAttribute('id'));
  }
  await page.locator('.knowledge-experiments').scrollIntoViewIfNeeded();assert.equal(await page.locator('.knowledge-experiments a').count(),9);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await page.locator('.storage-explorer').scrollIntoViewIfNeeded();
  await page.locator('.storage-explorer').screenshot({path:path.join(out,`儲存狀態-${width}-${lang}.png`),style:'.knowledge-header,.hub-rail-nav{visibility:hidden}'});
  await page.screenshot({path:path.join(out,`首頁-${width}-${lang}.png`),fullPage:true});
  await page.goto(`${server.base}oip-secure-storage.html?lang=${lang}#lifecycle-reader-title`,{waitUntil:'networkidle'});
  await page.waitForSelector('.life-playback:not([hidden])');
  for(const phase of ['off','reconstruct','access','zeroize']){
   await page.locator(`.lifecycle-controls [data-phase=${phase}]`).click();
   assert.equal(await page.locator('.lifecycle-diagram').getAttribute('data-phase'),phase);
   assert.equal(await page.locator('.life-phase-status p:visible').count(),1);
  }
  await page.locator('[data-life-reset]').click();await page.locator('[data-life-next]').click();
  assert.equal(await page.locator('.lifecycle-diagram').getAttribute('data-phase'),'reconstruct');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await page.locator('.lifecycle-diagram').screenshot({path:path.join(out,`生命週期-${width}-${lang}.png`),style:'body>header{visibility:hidden}'});
  await page.goto(`${server.base}nvm-technology-atlas.html?lang=${lang}#ip-directory`,{waitUntil:'networkidle'});
  await page.waitForSelector('.nvm-reading-position');
  assert.equal(await page.locator('#nvm-current-chapter').inputValue(),'ip-directory');
  const count=await page.locator('#nvm-current-chapter option').count();assert.equal(count>10,true);
  await page.locator('[data-chapter-next]').click();await page.waitForTimeout(150);
  assert.notEqual(await page.locator('#nvm-current-chapter').inputValue(),'ip-directory');
  await page.locator('[data-chapter-previous]').click();await page.waitForTimeout(150);
  assert.equal(await page.locator('#nvm-current-chapter').inputValue(),'ip-directory');
  await page.locator('#nvm-current-chapter').selectOption('panorama');await page.waitForTimeout(150);
  assert.equal(await page.locator('[data-chapter-previous]').isDisabled(),true);
  await page.locator('#nvm-current-chapter').selectOption('physics-library');await page.waitForTimeout(150);
  assert.equal(await page.locator('[data-nvm-panel]:visible').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  await page.screenshot({path:path.join(out,`章節導覽-${width}-${lang}.png`)});
  assert.deepEqual(errors,[]);
  results.push({項目:`${width}px／${lang} 圖解、生命週期、章節導覽`,通過:true});
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:1000}}), page=await context.newPage();
 await page.goto(`${server.base}index.html?lang=zh`,{waitUntil:'networkidle'});
 await page.locator('[data-storage-reset]').click();await page.locator('[data-storage-play]').click();
 await page.waitForFunction(()=>document.querySelector('[data-storage-status]')?.textContent.startsWith('3 / 3')&&document.querySelector('[data-storage-play]')?.textContent==='播放導讀',null,{timeout:6500});
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('[data-storage-play]')?.disabled);assert.equal(await page.locator('[data-storage-play]').isDisabled(),true);
 await page.locator('[data-storage-reset]').click();await page.locator('[data-storage-next]').click();assert.match(await page.locator('[data-storage-status]').textContent(),/^2 \/ 3/);
 await page.goto(`${server.base}oip-secure-storage.html?lang=zh`,{waitUntil:'networkidle'});assert.equal(await page.locator('[data-life-play]').isDisabled(),true);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('[data-life-reset]').click();await page.locator('[data-life-play]').click();
 await page.waitForFunction(()=>document.querySelector('.lifecycle-diagram')?.dataset.phase==='zeroize'&&document.querySelector('[data-life-play]')?.textContent==='播放一次',null,{timeout:9000});
 results.push({項目:'播放一次、末步停止與減少動態偏好',通過:true});await context.close();
 const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:1000}}), staticPage=await staticContext.newPage();
 await staticPage.goto(`${server.base}index.html?lang=zh`);
 assert.equal(await staticPage.locator('[data-storage-panel]:visible').count(),4);
 assert.equal(await staticPage.locator('[data-probe-candidate]').count()>0,true);
 await staticPage.goto(`${server.base}oip-secure-storage.html`);assert.equal(await staticPage.locator('.life-node:visible').count(),3);
 results.push({項目:'沒有 JavaScript 時的完整圖面與初始候選',通過:true});await staticContext.close();
 fs.writeFileSync(path.join(out,'驗證結果.json'),JSON.stringify({通過:results.length,結果:results},null,2)+'\n');
 console.log(`通過：${results.length} 組圖解與章節導覽驗證；證據位於 qa/圖解與章節導覽。`);
} catch(error){fs.writeFileSync(path.join(out,'驗證失敗.json'),JSON.stringify({已完成:results,錯誤:error.message},null,2)+'\n');throw error;}
finally{await browser.close();await server.close();}
