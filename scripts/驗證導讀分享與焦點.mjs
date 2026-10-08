import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {storageStates} from './儲存狀態圖解.mjs';
const root=path.resolve(import.meta.dirname,'..'), output=path.join(root,'qa','導讀分享與焦點');
fs.mkdirSync(output,{recursive:true});
const server=await startTestServer(root), browser=await chromium.launch({channel:'msedge',headless:true}), results=[];
async function check(name,options,run){
 const context=await browser.newContext({serviceWorkers:'block',viewport:{width:options.width||1440,height:1000},...options});
 await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(server.base).origin?route.continue():route.abort());
 await context.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.__copiedGuide=value;}}}));
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{await run(page);assert.deepEqual(errors,[]);results.push({項目:name,通過:true});}
 catch(error){results.push({項目:name,通過:false,原因:error.message});await page.screenshot({path:path.join(output,`${name}-失敗.png`)}).catch(()=>{});}
 finally{await context.close();}
}
const visit=(page,params='lang=zh')=>page.goto(new URL(`index.html?${params}`,server.base).href,{waitUntil:'domcontentloaded'});
const active=page=>page.locator('[data-storage-panel]:visible');
try{
 const atlas=fs.readFileSync(path.join(root,'nvm-technology-atlas.html'),'utf8');
 for(const entry of storageStates)for(const key of ['target','writeTarget','readTarget'])assert.ok(atlas.includes(`id="${entry[key]}"`),`${entry.id} 沿用既有操作錨點`);
 for(const width of [1440,390,320])for(const lang of ['zh','en'])await check(`雙語尺寸與分享-${width}-${lang}`,{viewport:{width,height:1000}},async page=>{
  await visit(page,`lang=${lang}&motion=step&storage=magnetic&storage-step=1#storage-explorer`);
  await page.locator('.storage-explorer-ready').waitFor();
  assert.equal(await active(page).getAttribute('data-storage-panel'),'magnetic');
  assert.equal(await page.locator('[data-storage-play]').getAttribute('aria-pressed'),'false','還原不自動播放');
  assert.equal(await page.locator('[data-storage-focus][data-current=true]').getAttribute('data-storage-focus'),'1');
  assert.equal(await active(page).locator('svg').count(),2,'A／B 保留完整圖面');
  const before=await active(page).locator('svg').evaluateAll(nodes=>nodes.map(node=>node.innerHTML));
  await page.locator('[data-storage-next]').click();
  assert.deepEqual(await active(page).locator('svg').evaluateAll(nodes=>nodes.map(node=>node.innerHTML)),before,'階段不改寫物理形狀');
  assert.equal(await active(page).locator('li:visible').count(),3,'所有因果文字保留');
  await page.locator('[data-storage-share]').click();
  const copied=new URL(await page.evaluate(()=>window.__copiedGuide));
  assert.equal(copied.searchParams.get('lang'),lang);assert.equal(copied.searchParams.get('motion'),'step');
  assert.equal(copied.searchParams.get('storage'),'magnetic');assert.equal(copied.searchParams.get('storage-step'),'2');assert.equal(copied.hash,'#storage-explorer');
  await page.goto(copied.href,{waitUntil:'domcontentloaded'});await page.locator('.storage-explorer-ready').waitFor();
  assert.match(await page.locator('[data-storage-status]').innerText(),/^3 \/ 3/);
  await page.locator('[data-storage-mode=charge]').focus();await page.keyboard.press('End');
  assert.equal(await active(page).getAttribute('data-storage-panel'),'polarization');
  assert.equal(await page.locator('[data-storage-mode=polarization]').evaluate(node=>document.activeElement===node),true);
  assert.equal(await page.locator('.storage-explorer').evaluate(node=>node.scrollWidth<=node.clientWidth+1),true,'圖解不水平溢出');
  await page.screenshot({path:path.join(output,`因果導讀-${width}-${lang}.png`)});
 });
 await check('錯誤參數與返回還原',{},async page=>{
  await visit(page,'lang=zh&storage=bad&storage-step=2.5');await page.locator('.storage-explorer-ready').waitFor();
  assert.equal(await active(page).getAttribute('data-storage-panel'),'charge');assert.match(await page.locator('[data-storage-status]').innerText(),/^1 \/ 3/);
  await page.evaluate(()=>{history.replaceState({other:'保留'},'',location.href);history.pushState({other:'新項目'},'','?lang=zh&storage=resistance&storage-step=2');window.dispatchEvent(new PopStateEvent('popstate',{state:history.state}));});
  assert.equal(await active(page).getAttribute('data-storage-panel'),'resistance');
  await page.locator('[data-storage-prev]').click();assert.equal(await page.evaluate(()=>history.state.other),'新項目');
  await page.goBack();assert.equal(await active(page).getAttribute('data-storage-panel'),'charge');
  assert.equal(await page.locator('[data-storage-play]').getAttribute('aria-pressed'),'false');
 });
 await check('剪貼簿拒絕可手動複製',{},async page=>{
  await visit(page);await page.locator('.storage-explorer-ready').waitFor();
  await page.evaluate(()=>history.replaceState({other:'保留'},'',location.href+'#layer-tools'));
  await page.locator('[data-storage-share]').click();assert.equal(new URL(await page.evaluate(()=>window.__copiedGuide)).hash,'#layer-tools','保留既有非導讀錨點');
  await page.evaluate(()=>navigator.clipboard.writeText=async()=>{throw new Error('拒絕');});
  await page.locator('[data-storage-share]').click();const field=page.locator('[data-storage-share-url]');
  assert.equal(await field.isVisible(),true);assert.equal(await field.evaluate(node=>document.activeElement===node),true);assert.match(await field.inputValue(),/storage=charge/);
 });
 for(const mode of ['無程式','靜態','列印','減少動態'])await check(`完整閱讀-${mode}`,mode==='無程式'?{javaScriptEnabled:false}:mode==='減少動態'?{reducedMotion:'reduce'}:{},async page=>{
  await visit(page,`lang=zh${mode==='靜態'?'&motion=static':''}`);
  if(mode==='列印'){await page.locator('.knowledge-physics summary').click();await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await page.emulateMedia({media:'print'});}
  if(mode==='減少動態'){await page.locator('.storage-explorer-ready').waitFor();assert.equal(await page.locator('[data-storage-play]').isDisabled(),true);await page.locator('[data-storage-next]').click();assert.match(await page.locator('[data-storage-status]').innerText(),/^2 \/ 3/);}
  else{assert.equal(await page.locator('[data-storage-panel]:visible').count(),4);assert.equal(await page.locator('[data-storage-panel] li:visible').count(),12);}
 });
}finally{fs.writeFileSync(path.join(output,'結果.json'),JSON.stringify(results,null,2));await browser.close();await server.close();}
console.log(JSON.stringify({項目:results.length,通過:results.filter(row=>row.通過).length,失敗:results.filter(row=>!row.通過)},null,2));
if(results.some(row=>!row.通過))process.exitCode=1;
