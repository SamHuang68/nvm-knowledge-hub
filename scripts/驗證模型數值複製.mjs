import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
const root=path.resolve(import.meta.dirname,'..'),output=path.resolve(root,process.env.NVM_QA_OUTPUT||'qa/後續改善-20261008/複製驗證');
fs.mkdirSync(output,{recursive:true});
const server=await startTestServer(root),origin=new URL(server.base).origin;
const browser=await chromium.launch({headless:true,...(process.env.NVM_QA_BROWSER==='chromium'?{}:{channel:'msedge'})});
const targets=[
  {page:'memory-physics.html',id:'bspdn-out-irdrop',root:'bspdn-envm-simulator-root'},
  {page:'memory-physics.html',id:'diff-margin-mv',root:'differential-sensing-root'},
  {page:'memory-physics.html',id:'tddb-eox-val',root:'tddb-weibull-root'},
  {page:'specialty-nvm.html',id:'cryo-out-ss',root:'cryo-cmos-simulator-root'},
  {page:'specialty-nvm.html',id:'chiplet-out-energy',root:'chiplet-ucie-simulator-root'},
  {page:'specialty-nvm.html',id:'deep-space-out-retention',root:'deep-space-simulator-root'},
  {page:'iot-mcu-envm.html',id:'subvt-metric-energy',root:'subvt-simulator-root'},
  {page:'ai-nvm-opportunities.html',id:'cpo-out-junction',root:'cpo-siph-simulator-root'},
  {page:'automotive-nvm.html',id:'hbm4-scrub-out-raw-fit',root:'auto-hbm4-scrubbing-simulator-root'}
];
const results=[];
let boundsCount=0;
async function open(file,lang='zh',width=1440,clipboard='controlled') {
  const context=await browser.newContext({serviceWorkers:'block',viewport:{width,height:1000},reducedMotion:'reduce'});
  await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
  if (clipboard==='native') await context.grantPermissions(['clipboard-read','clipboard-write'],{origin});
  else await context.addInitScript(mode=>{
    window.複製請求=[];
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:mode==='missing'?undefined:{writeText:value=>new Promise((resolve,reject)=>window.複製請求.push({value,resolve,reject}))}});
  },clipboard);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.setDefaultTimeout(10000);
  await page.goto(`${server.base}${file}?lang=${lang}`);
  return {context,page,errors};
}
const button=(page,id)=>page.locator(`[data-copy-value="${id}"]`);
const metric=(page,id)=>page.locator(`#${id}`);
const status=(page,id)=>metric(page,id).locator('..').locator('.model-value-copy-status');
async function complete(page,index,success=true) {
  await page.evaluate(({index,success})=>{const r=window.複製請求[index];success?r.resolve():r.reject(new Error('模擬剪貼簿拒絕'));},{index,success});
}
async function eventually(run,check,label) {
  for(let i=0;i<40;i++){const actual=await run();if(check(actual))return actual;await new Promise(r=>setTimeout(r,25));}
  assert.fail(label);
}
try {
  for (const lang of ['zh','en']) for (const width of [320,390,1440]) for (const file of [...new Set(targets.map(t=>t.page))]) {
    const {context,page,errors}=await open(file,lang,width);
    try {
      for(const target of targets.filter(t=>t.page===file)) {
        const value=await metric(page,target.id).innerText(),copy=button(page,target.id);
        assert.equal(await copy.count(),1,'每個代表數值只有一個原生複製按鈕');
        assert.equal(await copy.evaluate(e=>e.tagName),'BUTTON');
        assert.match(await copy.getAttribute('aria-label'),lang==='zh'?/複製數值/:/Copy value/);
        const geometry=await page.locator(`#${target.root} .model-value-copy-button`).evaluateAll(elements=>elements.map(e=>{
          const b=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();
          return {id:e.dataset.copyValue,x:b.left,right:b.right,width:b.width,height:b.height,parentLeft:p.left,parentRight:p.right,viewport:innerWidth};
        }));
        for(const b of geometry) {
          assert.ok(b.width>=44&&b.height>=44,`觸控按鈕尺寸：${b.id}`);
          assert.ok(b.x>=b.parentLeft-.5&&b.right<=b.parentRight+.5&&b.x>=-.5&&b.right<=b.viewport+.5,`按鈕完整位於容器與畫面內：${b.id}`);
          boundsCount++;
        }
        const requestIndex=await page.evaluate(()=>window.複製請求.length);
        await copy.press('Enter');
        assert.equal(await metric(page,target.id).innerText(),value,'等待期間保留計算數值');
        assert.equal(await copy.isDisabled(),true,'等待時阻止重複啟動');
        assert.equal(await page.evaluate(i=>window.複製請求[i].value,requestIndex),value,'複製的是觸發當下的完整數值');
        await complete(page,requestIndex);
        await eventually(()=>copy.isDisabled(),v=>v===false,'完成後恢復按鈕');
        assert.equal(await metric(page,target.id).innerText(),value,'成功回饋不取代模型數值');
        assert.match(await status(page,target.id).innerText(),lang==='zh'?/已複製/:/Copied/);
        assert.ok((await status(page,target.id).innerText()).includes(value));
        results.push({項目:`${target.id}－${lang}－${width}`,通過:true,按鈕幾何:geometry,原數值:value});
      }
      assert.deepEqual(errors,[],'本次頁面操作沒有未處理例外');
      if(lang==='zh'&&[320,1440].includes(width)&&['memory-physics.html','specialty-nvm.html','iot-mcu-envm.html'].includes(file)) {
        const target=targets.find(t=>t.page===file);
        const name={'memory-physics.html':'背面供電','specialty-nvm.html':'低溫介面','iot-mcu-envm.html':'低電壓'}[file];
        await page.locator(`#${target.root}`).screenshot({path:path.join(output,`圖表操作-${name}-${width}.png`)});
      }
    } catch(error) {results.push({項目:`${file}－${lang}－${width}`,通過:false,原因:error.message});}
    finally {await context.close();}
  }
  for(const mode of ['race','reject','missing','timeout','native']) {
    const {context,page,errors}=await open('memory-physics.html','zh',390,mode==='missing'?'missing':mode==='native'?'native':'controlled');
    const id='bspdn-out-irdrop',value=metric(page,id),copy=button(page,id),trace=[];
    try {
      const before=await value.innerText();await value.click();trace.push({動作:'點擊原數值',數值:await value.innerText()});
      if(mode==='race') {
        await page.locator('#bspdn-current-slider').press('End');
        const updated=await eventually(()=>value.innerText(),v=>v!==before,'滑桿應更新數值');
        await page.locator('#languageToggle').click();
        await complete(page,0);
        await eventually(()=>copy.isDisabled(),v=>v===false,'延遲完成後恢復');
        assert.equal(await value.innerText(),updated);
        assert.match(await status(page,id).innerText(),/Copied/,'完成時使用目前語言');
        await page.waitForTimeout(1300);assert.equal(await value.innerText(),updated,'原1200ms失敗情境不得寫回舊值');
        await copy.press('Space');await complete(page,1);await eventually(()=>copy.isDisabled(),v=>v===false,'Space可操作');
        assert.equal(await page.evaluate(()=>window.複製請求[1].value),updated);
        trace.push({動作:'回饋計時器到期後',原數值:before,新數值:await value.innerText()});
      } else if(mode==='native') {
        await eventually(()=>copy.isDisabled(),v=>v===false,'原生剪貼簿完成');
        assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),before,'原生瀏覽器剪貼簿內容一致');
      } else {
        if(mode==='reject') await complete(page,0,false);
        if(mode==='timeout') await page.waitForTimeout(8100);
        await eventually(()=>copy.isDisabled(),v=>v===false,'失敗後恢復操作');
        assert.match(await status(page,id).innerText(),/無法複製/);
        assert.equal(await value.innerText(),before,'錯誤回饋保留模型數值');
        if(mode==='timeout') {await complete(page,0);await page.waitForTimeout(50);assert.match(await status(page,id).innerText(),/無法複製/,'逾時後晚到結果不能覆寫錯誤回饋');}
      }
      assert.deepEqual(errors,[]);
      results.push({項目:`非同步與剪貼簿－${mode}`,通過:true,軌跡:trace});
    } catch(error){results.push({項目:`非同步與剪貼簿－${mode}`,通過:false,原因:error.message});}
    finally{await context.close();}
  }
  for(const target of [
    {page:'automotive-nvm.html',id:'hbm4-scrub-out-rating'},
    {page:'ai-nvm-opportunities.html',id:'cpo-out-rating'},
    {page:'specialty-nvm.html',id:'deep-space-out-rating'}
  ]) {
    const {context,page,errors}=await open(target.page,'en',320);
    try {
      await button(page,target.id).click();await complete(page,0,false);
      await eventually(()=>button(page,target.id).isDisabled(),v=>v===false,'錯誤回饋完成');
      const geometry=await status(page,target.id).evaluate(e=>{const b=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();return {whiteSpace:getComputedStyle(e).whiteSpace,x:b.left,right:b.right,parentLeft:p.left,parentRight:p.right,viewport:innerWidth};});
      assert.equal(geometry.whiteSpace,'normal','錯誤訊息不可繼承評級的不換行設定');
      assert.ok(geometry.x>=geometry.parentLeft-.5&&geometry.right<=geometry.parentRight+.5&&geometry.right<=geometry.viewport+.5,'完整錯誤訊息留在目前徽章與畫面內');
      assert.deepEqual(errors,[]);
      results.push({項目:`錯誤回饋換列－${target.id}`,通過:true,幾何:geometry});
    }catch(error){results.push({項目:`錯誤回饋換列－${target.id}`,通過:false,原因:error.message});}
    finally{await context.close();}
  }
} finally {await browser.close();await server.close();}
const report={案例:results.length,通過:results.filter(r=>r.通過).length,按鈕邊界檢查:boundsCount,結果:results};
fs.writeFileSync(path.join(output,'模型數值複製結果.json'),JSON.stringify(report,null,2));
console.log(`模型數值複製：${report.通過}／${report.案例}；按鈕邊界 ${boundsCount} 次；證據：${output}`);
if(report.通過!==report.案例){console.log(JSON.stringify(results.filter(r=>!r.通過)));process.exitCode=1;}
