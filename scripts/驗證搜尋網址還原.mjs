import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
const root=path.resolve(import.meta.dirname,'..'),output=path.join(root,'qa','搜尋網址還原');fs.mkdirSync(output,{recursive:true});
const server=await startTestServer(root),browser=await chromium.launch({channel:'msedge',headless:true}),results=[];
async function check(name,options,run){const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:900},...options});await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(server.base).origin?route.continue():route.abort());const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));try{await run(page);assert.deepEqual(errors,[]);results.push({項目:name,通過:true});}catch(error){results.push({項目:name,通過:false,原因:error.message});await page.screenshot({path:path.join(output,`${name}-失敗.png`)}).catch(()=>{});}finally{await context.close();}}
const field=page=>page.locator('#nvmHubSearchInput'),category=page=>page.locator('#searchHudPills [aria-pressed=true]');
const visit=(page,params)=>page.goto(new URL(`index.html?${params}#storage-explorer`,server.base).href,{waitUntil:'domcontentloaded'});
try{
 for(const width of [1440,390])for(const lang of ['zh','en'])await check(`查詢分類重新載入-${width}-${lang}`,{viewport:{width,height:900}},async page=>{
  await visit(page,`lang=${lang}&motion=step&storage=magnetic&storage-step=1`);await page.locator('#searchTrigger').click();
  const length=await page.evaluate(()=>history.length);await field(page).fill('TSMC');await page.locator('[data-category=foundry]').click();
  const state=new URL(page.url());assert.equal(state.searchParams.get('search'),'TSMC');assert.equal(state.searchParams.get('search-category'),'foundry');assert.equal(state.searchParams.get('storage'),'magnetic');assert.equal(state.searchParams.get('lang'),lang);assert.equal(state.hash,'#storage-explorer');assert.equal(await page.evaluate(()=>history.length),length,'每字不建立歷史項目');
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#searchOverlay.is-open').waitFor();
  assert.equal(await field(page).inputValue(),'TSMC');assert.equal(await category(page).getAttribute('data-category'),'foundry');assert.equal(await field(page).evaluate(node=>document.activeElement===node),true);
  await page.waitForFunction(()=>window.NVMHub.searchIndex.some(item=>item.id));assert.ok((await page.locator('#searchResults a').evaluateAll(nodes=>nodes.map(node=>node.href))).some(url=>url.includes('foundry-tsmc')));
  await page.keyboard.press('Escape');assert.equal(new URL(page.url()).searchParams.has('search-open'),false);
  await page.reload({waitUntil:'domcontentloaded'});await page.locator('#searchHudPills button').first().waitFor({state:'attached'});assert.equal(await page.locator('#searchOverlay').getAttribute('aria-hidden'),'true');await page.locator('#searchTrigger').click();assert.equal(await field(page).inputValue(),'TSMC');assert.equal(await category(page).getAttribute('data-category'),'foundry');
  await page.screenshot({path:path.join(output,`搜尋還原-${width}-${lang}.png`)});
 });
 await check('搜尋與跨章節返回共同還原',{},async page=>{
  await page.goto(new URL('nvm-technology-atlas-zh.html?lang=zh#research',server.base).href,{waitUntil:'domcontentloaded'});
  await page.locator('#nvm-current-chapter').waitFor();await page.locator('#searchHudPills button').first().waitFor({state:'attached'});
  await page.evaluate(()=>window.scrollTo({top:1800,behavior:'instant'}));await page.waitForTimeout(250);
  const y=await page.evaluate(()=>scrollY);await page.keyboard.press('Control+k');await field(page).fill('TSMC');await page.locator('[data-category=foundry]').click();await page.keyboard.press('Escape');
  assert.ok(Math.abs(await page.evaluate(()=>scrollY)-y)<5,'搜尋關閉保留章內位置');assert.equal(await page.evaluate(()=>history.state.__nvmReadingPosition.y),y,'搜尋寫網址保留閱讀名稱空間');
  const button=await page.locator('[data-chapter-next]').boundingBox();await page.mouse.click(button.x+button.width/2,button.y+button.height/2);await page.waitForFunction(()=>location.hash==='#topic-efuse');
  await page.goBack();await page.waitForFunction(value=>location.hash==='#research'&&Math.abs(scrollY-value)<5,y);
  await page.keyboard.press('Control+k');assert.equal(await field(page).inputValue(),'TSMC');assert.equal(await category(page).getAttribute('data-category'),'foundry');await page.keyboard.press('Escape');assert.ok(Math.abs(await page.evaluate(()=>scrollY)-y)<5);
 });
 await check('錯誤分類安全字串與語系',{},async page=>{
  const query='<img src=x onerror=alert(1)> 28eHV 0.5';await visit(page,`lang=zh&search=${encodeURIComponent(query)}&search-category=unknown&search-open=1`);await page.locator('#searchOverlay.is-open').waitFor();assert.equal(await field(page).inputValue(),query);assert.equal(await category(page).getAttribute('data-category'),'all');assert.equal(await page.locator('#searchOverlay img').count(),0);
  await page.evaluate(()=>window.HubLanguage.set('en'));assert.equal(await field(page).inputValue(),query);assert.equal(new URL(page.url()).searchParams.get('lang'),'en');
 });
 await check('返回條件與外部歷史狀態',{},async page=>{
  await visit(page,'lang=zh&search=PUF&search-category=security');await page.locator('#searchHudPills button').first().waitFor({state:'attached'});
  await page.evaluate(()=>{history.replaceState({other:'原始'},'',location.href);history.pushState({other:'第二'},'','?lang=zh&search=TSMC&search-category=foundry&search-open=1#storage-explorer');window.dispatchEvent(new PopStateEvent('popstate',{state:history.state}));});await page.locator('#searchOverlay.is-open').waitFor();assert.equal(await field(page).inputValue(),'TSMC');await field(page).fill('UMC');assert.equal(await page.evaluate(()=>history.state.other),'第二');
  await page.goBack();assert.equal(await field(page).inputValue(),'PUF');assert.equal(await category(page).getAttribute('data-category'),'security');assert.equal(await page.locator('#searchOverlay').getAttribute('aria-hidden'),'true');assert.equal(await page.locator('[inert]').count(),0);
 });
}finally{fs.writeFileSync(path.join(output,'結果.json'),JSON.stringify(results,null,2));await browser.close();await server.close();}
console.log(JSON.stringify({項目:results.length,通過:results.filter(row=>row.通過).length,失敗:results.filter(row=>!row.通過)},null,2));if(results.some(row=>!row.通過))process.exitCode=1;
