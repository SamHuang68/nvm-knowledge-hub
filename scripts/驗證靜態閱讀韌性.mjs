import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
const root=path.resolve(import.meta.dirname,'..'),output=path.join(root,'qa','持續收斂-靜態閱讀');fs.mkdirSync(output,{recursive:true});
const server=await startTestServer(root),browser=await chromium.launch({channel:'msedge'}),results=[];
const files=['index.html','oip-secure-storage.html','memory-physics.html','technology-comparison.html','secure-storage.html','security-assurance.html','memory-evidence.html','ai-nvm-opportunities.html'];
async function check(file,options){const context=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:900},...options});await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(server.base).origin?route.continue():route.abort());const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{await page.goto(new URL(file,server.base).href,{waitUntil:'load'});
  const state=await page.evaluate(()=>({標題:[...document.querySelectorAll('h1,h2,h3')].filter(node=>node.getClientRects().length).map(node=>node.innerText.trim()),隱藏區段:[...document.querySelectorAll('.reveal')].filter(node=>Number(getComputedStyle(node).opacity)===0).length,英文:[...document.querySelectorAll('[data-lang=en]')].filter(node=>node.getClientRects().length).length,繁中:[...document.querySelectorAll('[data-lang=zh]')].filter(node=>node.getClientRects().length).length}));
  assert.ok(state.標題.length>1);assert.ok(state.標題.every(Boolean),'靜態章節標題有文字');assert.equal(state.隱藏區段,0,'核心內容不依賴入場腳本');assert.ok(state.英文>0);if(file==='memory-evidence.html')assert.ok(state.繁中>0,'保留總帳既有雙語靜態備援');else assert.equal(state.繁中,0,'維持原英文預設');assert.deepEqual(errors,[]);
  if(file==='memory-physics.html')await page.screenshot({path:path.join(output,'物理專題-靜態修正後.png')});results.push({頁面:file,模式:'無JavaScript',通過:true,狀態:state});
 }catch(error){results.push({頁面:file,模式:'無JavaScript',通過:false,原因:error.message});}finally{await context.close();}}
try{
 for(const file of files)await check(file,{javaScriptEnabled:false});
 // 同一樣式的正常中英閱讀不受靜態備援干擾。
 for(const file of ['memory-physics.html','secure-storage.html'])for(const language of ['zh','en']){const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:900}});await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(server.base).origin?route.continue():route.abort());const page=await context.newPage();try{await page.goto(new URL(`${file}?lang=${language}`,server.base).href,{waitUntil:'load'});assert.equal(await page.locator('body').getAttribute('data-language'),language);assert.ok((await page.locator('h1').innerText()).length>10);assert.equal(await page.locator(`[data-lang=${language==='zh'?'en':'zh'}]:visible`).count(),0);results.push({頁面:file,模式:language,通過:true});}catch(error){results.push({頁面:file,模式:language,通過:false,原因:error.message});}finally{await context.close();}}
}finally{fs.writeFileSync(path.join(output,'驗證結果.json'),JSON.stringify({瀏覽器:browser.version(),結果:results,限制:'無JavaScript保持原英文預設；不執行互動計算或語言切換。'},null,2));await browser.close();await server.close();}
console.log(JSON.stringify({項目:results.length,通過:results.filter(row=>row.通過).length,失敗:results.filter(row=>!row.通過)},null,2));if(results.some(row=>!row.通過))process.exitCode=1;
