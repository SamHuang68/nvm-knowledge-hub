import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root=path.resolve(import.meta.dirname,'..'), output=path.join(root,'qa','導讀非同步分享');
fs.mkdirSync(output,{recursive:true});
const server=await startTestServer(root), origin=new URL(server.base).origin;
const browser=await chromium.launch({headless:true,channel:'msedge'}), results=[];
const share=page=>page.locator('[data-storage-share]'), field=page=>page.locator('[data-storage-share-url]'), message=page=>page.locator('[data-storage-share-status]');
const snapshot=page=>page.evaluate(()=>({
 網址:location.pathname+location.search+location.hash,語言:window.HubLanguage?.get(),
 機制:document.querySelector('[data-storage-mode][aria-pressed=true]')?.dataset.storageMode,
 階段:document.querySelector('.storage-explorer')?.dataset.frame,
 忙碌:document.querySelector('[data-storage-share]')?.disabled,
 訊息:document.querySelector('[data-storage-share-status]')?.textContent,
 備援可見:document.querySelector('[data-storage-share-url]')?.hidden===false,
 備援連結:document.querySelector('[data-storage-share-url]')?.value,
 備援焦點:document.activeElement?.matches('[data-storage-share-url]'),
 請求數:window.複製請求?.length
}));
async function check(name,run,{clipboard=true,language='zh'}={}){
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:900}});
 await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
 await context.addInitScript(enabled=>{
  window.複製請求=[];
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:enabled?{writeText:value=>new Promise((resolve,reject)=>window.複製請求.push({連結:value,resolve,reject}))}:undefined});
 },clipboard);
 const page=await context.newPage(), errors=[],trace=[];page.setDefaultTimeout(10000);page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto(new URL(`index.html?lang=${language}&storage=charge&storage-step=0#storage-explorer`,server.base).href);
  await page.locator('.storage-explorer-ready').waitFor();
  await run(page,trace);
  assert.deepEqual(errors,[],'沒有頁面未處理例外');
  trace.push({動作:'完成情境',...await snapshot(page)});
  await page.screenshot({path:path.join(output,`${name}.png`)});
  results.push({項目:name,通過:true,軌跡:trace});
 }catch(error){trace.push({動作:'失敗當下',...await snapshot(page).catch(()=>({}))});results.push({項目:name,通過:false,原因:error.message,軌跡:trace,頁面例外:errors});await page.screenshot({path:path.join(output,`${name}-失敗.png`)}).catch(()=>{});}
 finally{await context.close();}
}
async function complete(page,index,success){
 await page.evaluate(({index,success})=>{const request=window.複製請求[index];if(success)request.resolve();else request.reject(new Error('模擬剪貼簿拒絕'));},{index,success});
 await page.waitForTimeout(50);
}
async function ready(page){assert.equal(await share(page).isDisabled(),false,'分享按鈕恢復可用');assert.equal(await share(page).getAttribute('aria-busy'),'false','忙碌狀態已解除');}
async function busy(page){assert.equal(await share(page).isDisabled(),true,'等待完成時停用重複分享');assert.equal(await share(page).getAttribute('aria-busy'),'true');assert.match(await message(page).innerText(),/正在複製|Copying/);}
async function unchanged(page){await ready(page);assert.equal(await field(page).isVisible(),false,'失效結果不顯示舊備援');assert.equal(await field(page).inputValue(),'','失效結果不留下舊連結');assert.equal(await message(page).innerText(),'','失效結果不覆寫目前訊息');assert.equal(await field(page).evaluate(node=>node===document.activeElement),false,'失效結果不搶焦點');}

try{
 await check('模式切換使舊分享失效',async(page,trace)=>{
  await share(page).click();await busy(page);
  await page.evaluate(()=>document.querySelector('[data-storage-share]').dispatchEvent(new MouseEvent('click',{bubbles:true})));
  assert.equal(await page.evaluate(()=>window.複製請求.length),1,'忙碌時也拒絕重複事件');
  await page.locator('[data-storage-mode=magnetic]').click();trace.push({動作:'切換機制',...await snapshot(page)});
  await complete(page,0,false);await unchanged(page);
  assert.equal(await page.locator('[data-storage-mode=magnetic]').evaluate(node=>node===document.activeElement),true,'保留使用者最新機制焦點');
 });
 await check('較舊失敗不覆寫較新成功',async(page,trace)=>{
  await share(page).click();await page.locator('[data-storage-mode=magnetic]').click();await share(page).click();await busy(page);
  await complete(page,1,true);trace.push({動作:'較新分享先成功',...await snapshot(page)});
  await complete(page,0,false);await ready(page);assert.equal(await message(page).innerText(),'導讀連結已複製');assert.equal(await field(page).isVisible(),false);assert.equal(await field(page).evaluate(node=>node===document.activeElement),false);
  assert.equal(new URL(await page.evaluate(()=>window.複製請求[1].連結)).searchParams.get('storage'),'magnetic');
 });
 await check('較舊成功不覆寫較新拒絕',async(page,trace)=>{
  await share(page).click();await page.locator('[data-storage-mode=magnetic]').click();await share(page).click();
  await complete(page,1,false);trace.push({動作:'較新分享被拒絕',...await snapshot(page)});
  await complete(page,0,true);await ready(page);assert.equal(await field(page).isVisible(),true);assert.equal(await field(page).evaluate(node=>node===document.activeElement),true);assert.match(await message(page).innerText(),/手動複製/);assert.equal(new URL(await field(page).inputValue()).searchParams.get('storage'),'magnetic');
 });
 await check('階段切換使舊分享失效',async(page)=>{
  await share(page).click();await page.locator('[data-storage-next]').click();await complete(page,0,false);await unchanged(page);assert.equal((await snapshot(page)).階段,'1');
 });
 await check('語言切換使舊分享失效',async(page)=>{
  await share(page).click();await page.locator('#languageToggle').click();await complete(page,0,true);await unchanged(page);assert.equal((await snapshot(page)).語言,'en');
 });
 await check('返回狀態使舊分享失效',async(page,trace)=>{
  await page.evaluate(()=>{history.pushState({外來資料:'保留'},'','?lang=zh&storage=magnetic&storage-step=1#storage-explorer');dispatchEvent(new PopStateEvent('popstate',{state:history.state}));});
  await share(page).click();await busy(page);await page.goBack();trace.push({動作:'返回原狀態',...await snapshot(page)});await complete(page,0,false);await unchanged(page);assert.equal((await snapshot(page)).機制,'charge');assert.equal((await snapshot(page)).階段,'0');
 });
 await check('成功拒絕與備援恢復可用',async(page)=>{
  await share(page).click();await busy(page);await complete(page,0,true);await ready(page);assert.equal(await message(page).innerText(),'導讀連結已複製');
  await share(page).click();await busy(page);await complete(page,1,false);await ready(page);assert.equal(await field(page).isVisible(),true);assert.equal(await field(page).evaluate(node=>node===document.activeElement),true);assert.equal(new URL(await field(page).inputValue()).searchParams.get('storage'),'charge');assert.equal(await field(page).evaluate(node=>node.selectionEnd-node.selectionStart===node.value.length),true,'備援連結可直接複製');
 });
 await check('沒有剪貼簿仍可手動複製',async(page)=>{
  await share(page).click();await ready(page);assert.equal(await field(page).isVisible(),true);assert.equal(await field(page).evaluate(node=>node===document.activeElement),true);assert.match(await message(page).innerText(),/手動複製/);
 },{clipboard:false});
 await check('實際連點只送出一次分享',async(page)=>{
  await share(page).click();await busy(page);const box=await share(page).boundingBox();await page.mouse.click(box.x+box.width/2,box.y+box.height/2);assert.equal(await page.evaluate(()=>window.複製請求.length),1);await complete(page,0,true);await ready(page);
 });
 await check('英文忙碌與手動備援',async(page)=>{
  await share(page).click();await busy(page);await complete(page,0,false);await ready(page);assert.equal(await field(page).isVisible(),true);assert.match(await message(page).innerText(),/Copy the link manually/);
 },{language:'en'});
}finally{
 fs.writeFileSync(path.join(output,'結果.json'),JSON.stringify({瀏覽器:browser.version(),註記:'所有剪貼簿呼叫均為模擬，沒有寫入作業系統剪貼簿。',結果:results},null,2));
 await browser.close();await server.close();
}
const failures=results.filter(item=>!item.通過);
console.log(JSON.stringify({項目:results.length,通過:results.length-failures.length,失敗:failures.map(item=>({項目:item.項目,原因:item.原因})),證據:output},null,2));
if(failures.length)process.exitCode=1;
