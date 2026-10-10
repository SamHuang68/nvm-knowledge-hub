import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {calculateTunnelingBreakdownMetrics as tunneling} from '../tunneling-breakdown-simulator.js';
import {calculateAutomotiveHighTempSicGanMetrics as highTemp} from '../automotive-high-temp-sic-gan-simulator.js';

// 只操作兩個受影響模型；不呼叫完整回歸或其他模型的驗收入口。
const root=path.resolve(import.meta.dirname,'..');
const output=path.resolve(process.env.NVM_QA_OUTPUT || path.join(root,'qa','穿隧與高溫模型契約'));
fs.mkdirSync(output,{recursive:true});
const selected=process.env.NVM_QA_MODEL || '全部';
assert.ok(['全部','穿隧'].includes(selected),'局部範圍限全部或穿隧');
const report={範圍:selected==='穿隧'?'穿隧模型契約':'穿隧與高溫模型契約',案例:[],通過:false,開始:new Date().toISOString()};
let server,browser;
const deadline=setTimeout(()=>browser?.close().catch(()=>{}),70000);
const hardLimit=setTimeout(()=>{console.error('兩模型局部驗收超過 75 秒上限。');process.exit(1);},75000);
const sameNumber=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<1e-6,`${label}：${actual} / ${expected}`);
const fields={safe:'retention',stress:'tunneling',injection:'soft-breakdown',breakdown:'hard-breakdown'};
const setRange=(page,id,value)=>page.locator(`#${id}`).evaluate((e,v)=>{e.value=String(v);e.dispatchEvent(new Event('input',{bubbles:true}));},value);

async function observeTunneling(page,record,label,language) {
  const actual=await page.evaluate(()=>{
    const canvas=document.getElementById('tunneling-canvas');
    const container=document.getElementById('tunneling-simulator-root').getBoundingClientRect();
    return {tox:Number(document.getElementById('sim-tox-slider').value),vox:Number(document.getElementById('sim-vox-slider').value),
      電場:document.getElementById('sim-eox-val').textContent,電流:document.getElementById('sim-current-val').textContent,
      機制:document.getElementById('sim-mech-val').textContent,判讀:document.getElementById('sim-verdict-banner').textContent.trim(),
      分區:document.getElementById('sim-verdict-banner').className,圖面:window.__模型圖面,畫布寬:canvas.clientWidth,
      控制項:[...document.querySelectorAll('#tunneling-simulator-root input,#tunneling-simulator-root button')].map(e=>{
        const box=e.getBoundingClientRect();return {id:e.id,preset:e.dataset.preset,type:e.type,min:e.min,max:e.max,step:e.step,
          可用:!e.disabled&&box.width>0&&box.height>0,容器內:box.left>=container.left-1&&box.right<=container.right+1};
      })};
  });
  const expected=tunneling({tox:actual.tox,vox:actual.vox});
  assert.equal(actual.電場,`${expected.eox.toFixed(2)} MV/cm`);
  assert.equal(actual.電流,expected.logJ<=-14?'< 10⁻¹⁴ A/cm²':`10^(${expected.logJ.toFixed(1)}) A/cm²`);
  assert.equal(actual.分區,`verdict-banner verdict-${fields[expected.state]}`);
  const transport={retention:language==='zh'?'低偏壓電流下限':'Low-Bias Current Floor',direct:language==='zh'?'直接穿隧 (Direct Tunneling)':'Direct Tunneling',fn:language==='zh'?'FN 穿隧 (Fowler–Nordheim)':'Fowler–Nordheim Tunneling'};
  assert.equal(actual.機制,transport[expected.mechanism]);
  assert.match(actual.判讀,language==='zh'?/教學|模型/:/Model|modeled/);
  assert.doesNotMatch(actual.判讀,/可保證\s*>?\s*10|retention guaranteed|completing permanent AntiFuse write/i);
  if(expected.state==='safe')assert.match(actual.判讀,language==='zh'?/未計算溫度、時間與老化/:/Temperature, time and aging are not modeled/);
  assert.ok(actual.控制項.every(item=>item.可用&&item.容器內),'原有控制項必須可用並留在容器內');
  const curve=actual.圖面.曲線.find(item=>item.顏色==='#38bdf8'&&item.座標.length===151);
  assert.ok(curve,'保留完整 151 點曲線');
  const {寬,高}=actual.圖面;
  for(let i=0;i<151;i++) {
    const voltage=i/150*10,metrics=tunneling({tox:actual.tox,vox:voltage});
    sameNumber(curve.座標[i][0],60+voltage/10*(寬-90),`${label} 第 ${i} 點電壓`);
    sameNumber(curve.座標[i][1],30+(4-metrics.logJ)/20*(高-75),`${label} 第 ${i} 點電流`);
  }
  const point=actual.圖面.操作點.find(item=>item[2]===4);
  assert.ok(point,'保留目前操作點');
  sameNumber(point[0],60+actual.vox/10*(寬-90),`${label} 操作點電壓`);
  sameNumber(point[1],30+(4-expected.logJ)/20*(高-75),`${label} 操作點電流`);
  record.穿隧.push({情境:label,...actual});
}

try {
  server=process.env.NVM_QA_BASE?null:await startTestServer(root);
  const base=process.env.NVM_QA_BASE || server.base;
  report.目標=base;
  const channel=process.env.NVM_QA_BROWSER || 'msedge';
  browser=await chromium.launch({headless:true,...(channel==='chromium'?{}:{channel})});
  for(const [width,language] of [[390,'zh'],[1440,'en']]) {
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',serviceWorkers:'block'});
    await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
    await context.addInitScript(()=>{
      window.__模型圖面={};
      const p=CanvasRenderingContext2D.prototype;
      for(const name of ['clearRect','beginPath','moveTo','lineTo','stroke','arc','fillText']) {
        const original=p[name];
        p[name]=function(...args) {
          if(this.canvas.id==='tunneling-canvas') {
            if(name==='clearRect')window.__模型圖面={寬:args[2],高:args[3],曲線:[],操作點:[],文字:[]};
            if(name==='beginPath')this.__路徑=[];
            if(name==='moveTo'||name==='lineTo')(this.__路徑??=[]).push(args.slice(0,2));
            if(name==='stroke')window.__模型圖面.曲線?.push({顏色:this.strokeStyle,座標:this.__路徑?.slice()??[]});
            if(name==='arc')window.__模型圖面.操作點?.push(args.slice(0,3));
            if(name==='fillText')window.__模型圖面.文字?.push(String(args[0]));
          }
          return original.apply(this,args);
        };
      }
    });
    const page=await context.newPage();page.setDefaultTimeout(7000);page.setDefaultNavigationTimeout(15000);
    const record={寬度:width,語言:language,穿隧:[],高溫:[],鍵盤操作:0,頁面例外:[],通過:false};
    report.案例.push(record);
    page.on('pageerror',error=>record.頁面例外.push(error.message));
    try {
      await page.goto(new URL(`memory-physics.html?lang=${language}`,base).href,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.__模型圖面.曲線?.some(row=>row.座標.length===151));
      const title=await page.locator('.tunneling-sim-title-group').evaluate(e=>{const box=e.getBoundingClientRect(),parent=e.parentElement.getBoundingClientRect();return {寬:box.width,內容寬:e.scrollWidth,右:box.right,容器右:parent.right};});
      assert.ok(title.右<=title.容器右+1&&title.內容寬<=Math.ceil(title.寬)+1,'標題與說明必須完整換行且不超出容器');
      record.標題版面=title;
      assert.deepEqual(await page.locator('.tunneling-preset-btn').evaluateAll(items=>items.map(e=>e.dataset.preset)),['retention','injection','breakdown']);
      assert.deepEqual(await page.locator('#tunneling-simulator-root input').evaluateAll(items=>items.map(e=>[e.id,e.min,e.max,e.step])),[['sim-tox-slider','1.0','6.0','0.1'],['sim-vox-slider','0.1','10.0','0.1']]);
      assert.equal(await page.locator('#sim-verdict-banner').getAttribute('aria-live'),'polite');
      await observeTunneling(page,record,'初始',language);
      for(const preset of ['retention','injection','breakdown']) {
        await page.locator(`.tunneling-preset-btn[data-preset="${preset}"]`).focus();
        await page.keyboard.press('Enter');record.鍵盤操作++;
        await observeTunneling(page,record,preset,language);
        if(preset==='retention')await page.locator('#tunneling-simulator-root').screenshot({path:path.join(output,`修正-穿隧-${width}-${language}.png`)});
      }
      for(const [id,minimum,maximum] of [['sim-tox-slider',1,6],['sim-vox-slider',0.1,10]]) {
        await page.locator(`#${id}`).focus();await page.keyboard.press('Home');record.鍵盤操作++;
        assert.equal(Number(await page.locator(`#${id}`).inputValue()),minimum);
        await observeTunneling(page,record,`${id} 最小值`,language);
        await page.keyboard.press('End');record.鍵盤操作++;
        assert.equal(Number(await page.locator(`#${id}`).inputValue()),maximum);
        await observeTunneling(page,record,`${id} 最大值`,language);
      }
      await setRange(page,'sim-tox-slider',2);
      for(const voltage of [0.7,0.8,1.9,2,2.5,2.6,3.1,3.2]) {
        await setRange(page,'sim-vox-slider',voltage);
        await observeTunneling(page,record,`電場／機制分界 ${voltage}V`,language);
      }
      const other=language==='zh'?'en':'zh';
      await page.locator('#languageToggle').click();
      await page.waitForFunction(lang=>window.HubLanguage?.get()===lang,other);
      await observeTunneling(page,record,'語言切換',other);
      if(width===1440) {
        await page.emulateMedia({reducedMotion:'no-preference'});
        await page.locator('#tunneling-canvas').scrollIntoViewIfNeeded();
        await page.locator('.tunneling-preset-btn[data-preset="retention"]').click();
        await page.waitForFunction(()=>document.getElementById('sim-tox-slider').value==='3.5'&&document.getElementById('sim-vox-slider').value==='1.2');
        await page.waitForFunction(()=>{const f=window.__模型圖面,p=f.操作點?.find(item=>item[2]===4);return p&&Math.abs(p[0]-(60+0.12*(f.寬-90)))<1e-7;});
        await observeTunneling(page,record,'正常動畫終值',other);
        await page.emulateMedia({reducedMotion:'reduce'});
      }
      if(selected==='全部') {
      await page.goto(new URL(`automotive-nvm.html?lang=${language}`,base).href,{waitUntil:'domcontentloaded'});
      await page.locator('#sic-sel-tech').waitFor();
      assert.deepEqual(await page.locator('#sic-sel-tech option').evaluateAll(items=>items.map(e=>e.value)),['antifuse','mram','reram','eflash']);
      for(const tech of ['antifuse','mram','reram','eflash'])for(const temperature of [125,175]) {
        await page.locator('#sic-sel-tech').selectOption(tech);await setRange(page,'sic-slide-temp',temperature);
        const expected=highTemp({tech,junctionTemp:temperature});
        assert.equal(await page.locator('#sic-out-margin').innerText(),`${expected.senseMarginUa.toFixed(1)} μA`);
        assert.equal(await page.locator('#sic-out-ber').innerText(),`BER ~ ${expected.ber.toExponential(1)}`);
        record.高溫.push({技術:tech,結溫:temperature,輸出:await page.locator('#sic-gan-simulator-root [id^="sic-out-"]').evaluateAll(items=>items.map(e=>({id:e.id,text:e.innerText.trim()})))});
      }
      await page.locator('#sic-gan-simulator-root').screenshot({path:path.join(output,`修正-高溫-${width}-${language}.png`)});
      }
      assert.deepEqual(record.頁面例外,[],'兩頁操作不應產生執行期例外');record.通過=true;
    } catch(error) {record.錯誤=error.message;throw error;}
    finally {await context.close();}
  }
  report.通過=true;
} catch(error) {report.錯誤=error.message;console.error(error.stack);process.exitCode=1;}
finally {
  clearTimeout(deadline);clearTimeout(hardLimit);await browser?.close();await server?.close();
  fs.writeFileSync(path.join(output,'模型契約操作結果.json'),JSON.stringify(report,null,2)+'\n');
}
console.log(JSON.stringify({通過:report.通過,畫面組:report.案例.length,穿隧狀態:report.案例.reduce((n,r)=>n+r.穿隧.length,0),高溫狀態:report.案例.reduce((n,r)=>n+r.高溫.length,0),鍵盤操作:report.案例.reduce((n,r)=>n+r.鍵盤操作,0)}));
