import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { startTestServer } from './test-server.mjs';

// 僅驗證三個物理工作台；舊版只載入記憶體，本機頁面阻擋外部資源。
const root=process.cwd(),baseline='9d5caa86cef8cdea190fb8b0a39d2009897a08f7';
const evidence=path.join(root,'qa','延伸收斂-物理工具');
fs.mkdirSync(evidence,{recursive:true});
const report={基準版本:baseline,外部阻擋:true,案例:[],純函式組數:0,圖面組數:0,鍵盤組數:0};
const oldSource=file=>execFileSync('git',['show',`${baseline}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
const original=async file=>import('data:text/javascript;base64,'+Buffer.from(oldSource(file)).toString('base64'));
const current=async file=>import(pathToFileURL(path.join(root,file)).href);
const files=['cryogenic-nvm-physics-simulator.js','cryo-qubit-readout-simulator.js','bspdn-envm-ir-drop-simulator.js'];
const modules=await Promise.all(files.map(current)),oldModules=await Promise.all(files.map(original));
const numeric=value=>Object.fromEntries(Object.entries(value).filter(([,v])=>typeof v==='number'));
function compareNumbers(newResult,oldResult) {
  for(const [key,value] of Object.entries(numeric(oldResult))) {
    if(Number.isFinite(value))assert.equal(newResult[key],value,`原有限數值改變：${key}`);
    else {assert.equal(key,'vbdActualV');assert.equal(newResult[key],null);assert.equal(newResult.vbdModelStatus,'not_defined');}
  }
  for(const key of ['isCryoViable','isQpuCompatible','architectureRating'])if(key in oldResult)assert.equal(newResult[key],oldResult[key],`原分類公式改變：${key}`);
  report.純函式組數++;
}
for(const envKey of Object.keys(modules[0].CRYO_ENV_PRESETS))for(const techKey of Object.keys(modules[0].CRYO_TECH_PROFILES))for(const [readBiasMv,senseTimeNs] of [[200,10],[50,2],[600,50]]) {
  const input={envKey,techKey,readBiasMv,senseTimeNs};
  const fresh=modules[0].calculateCryogenicPhysics(input); compareNumbers(fresh,oldModules[0].calculateCryogenicPhysics(input));
  assert.equal(fresh.vbdModelStatus,techKey==='mram_stt_cryo'?'not_defined':'defined');
}
const failedInput={envKey:'cryo_4k',techKey:'mram_stt_cryo',readBiasMv:200,senseTimeNs:10};
assert.equal(Number.isNaN(oldModules[0].calculateCryogenicPhysics(failedInput).vbdActualV),true);
report.案例.push({名稱:'MRAM 原失敗與四技術有限數值',通過:true,舊版擊穿值:'NaN',修正版擊穿值:null,修正版狀態:'not_defined',代表輸入:failedInput});
for(const presetKey of Object.keys(modules[1].QUBIT_CONTROL_PRESETS))for(const techKey of Object.keys(modules[1].CRYO_MEMORY_TOPOLOGIES))for(const [customBFieldTesla,customRfPowerDbm] of [[0,-40],[5,0]]) {
  const input={presetKey,techKey,customBFieldTesla,customRfPowerDbm}; compareNumbers(modules[1].calculateCryoQubitReadout(input),oldModules[1].calculateCryoQubitReadout(input));
}
for(const field of [.5,.55,.6]) {
  const input={presetKey:'superconducting_transmon_4k',techKey:'perpendicular_stt_mram',customBFieldTesla:field,customRfPowerDbm:-30};
  const result=modules[1].calculateCryoQubitReadout(input); compareNumbers(result,oldModules[1].calculateCryoQubitReadout(input));
  assert.equal(result.isQpuCompatible,field<.6);assert.match(result.qpuRatingZh,field<.6?/<0\.6T/:/≥0\.6T/);
}
const margins=[];
for(const presetKey of Object.keys(modules[2].BSPDN_PRESETS))for(const [peakWriteCurrent,pulseRiseTime,ambientTemp] of [[5,2,25],[25,.1,175]]) {
  const input={presetKey,peakWriteCurrent,pulseRiseTime,ambientTemp,macroBitCapacity:64};
  const result=modules[2].calculateBspdnMetrics(input); compareNumbers(result,oldModules[2].calculateBspdnMetrics(input));
  if(peakWriteCurrent===25)margins.push({預設:presetKey,有效電壓:result.effectiveVddCurrent,裕度:result.writeMarginCurrentMv,分類:result.architectureRating});
}
report.案例.push({名稱:'量子位元與供電原有限數值、分類及合法負裕度',通過:true,最嚴苛輸入裕度:margins});
const html=fs.readFileSync(path.join(root,'memory-physics.html'),'utf8'),oldHtml=oldSource('memory-physics.html');
const values=(source,regexp)=>[...source.matchAll(regexp)].map(m=>m[1]);
const ids=values(html,/\bid="([^"]+)"/g),links=values(html,/\bhref="([^"]+)"/g),svgs=values(html,/(<svg\b[\s\S]*?<\/svg>)/g);
assert.deepEqual(ids,values(oldHtml,/\bid="([^"]+)"/g));assert.deepEqual(links,values(oldHtml,/\bhref="([^"]+)"/g));
assert.deepEqual(svgs.map(v=>v.replace(/\r\n/g,'\n')),values(oldHtml,/(<svg\b[\s\S]*?<\/svg>)/g).map(v=>v.replace(/\r\n/g,'\n')));
assert.equal(html.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(),oldHtml.replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim());
report.案例.push({名稱:'原 ID／連結／SVG 與全文保留',通過:true,ID:ids.length,連結:links.length,SVG:svgs.length});

const roots=['cryogenic-nvm-simulator-root','cryo-qubit-simulator-root','bspdn-envm-simulator-root'];
const canvasIds=['cryo-canvas','cryo-qubit-canvas','bspdn-canvas'];
const sliders=[['cryo-bias-slider','cryo-bias-val'],['cryo-time-slider','cryo-time-val'],['cryo-qubit-bfield-slider','cryo-qubit-bfield-val'],['cryo-qubit-rf-slider','cryo-qubit-rf-val'],['bspdn-current-slider','bspdn-current-val'],['bspdn-rise-slider','bspdn-rise-val'],['bspdn-temp-slider','bspdn-temp-val']];
const server=await startTestServer(root),browser=await chromium.launch({headless:true,channel:'msedge'});
try {
  for(const width of [320,390,1440])for(const language of ['zh','en']) {
    const errors=[],timers=[];
    const context=await browser.newContext({viewport:{width,height:960},serviceWorkers:'block',hasTouch:true,reducedMotion:'reduce'});
    await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(server.base).origin?route.continue():route.abort());
    await context.exposeBinding('記錄物理工具計時器',(_,event)=>timers.push(event));
    await context.addInitScript(()=>{
      const source=/cryogenic-nvm-physics-simulator|cryo-qubit-readout-simulator|bspdn-envm-ir-drop-simulator/;
      for(const name of ['setTimeout','setInterval','requestAnimationFrame']) {
        const native=window[name];window[name]=function(callback,...args){if(source.test(new Error().stack||''))window.記錄物理工具計時器({種類:name});return native.call(this,callback,...args);};
      }
      window.__物理文字=new Map();window.__物理曲線=new Map();
      const p=CanvasRenderingContext2D.prototype,fill=p.fillRect,clear=p.clearRect,text=p.fillText,begin=p.beginPath,move=p.moveTo,line=p.lineTo,stroke=p.stroke;
      const reset=ctx=>{window.__物理文字.set(ctx.canvas.id,[]);window.__物理曲線.set(ctx.canvas.id,[]);};
      p.fillRect=function(x,y,w,h){if(x===0&&y===0&&w>=this.canvas.width/devicePixelRatio-1&&h>=this.canvas.height/devicePixelRatio-1)reset(this);return fill.apply(this,arguments);};
      p.clearRect=function(x,y,w,h){if(x===0&&y===0&&w>=this.canvas.width/devicePixelRatio-1)reset(this);return clear.apply(this,arguments);};
      p.beginPath=function(){this.__點數=0;return begin.apply(this,arguments);};
      p.moveTo=function(){this.__點數=(this.__點數||0)+1;return move.apply(this,arguments);};
      p.lineTo=function(){this.__點數=(this.__點數||0)+1;return line.apply(this,arguments);};
      p.stroke=function(){const rows=window.__物理曲線.get(this.canvas.id)||[];rows.push({顏色:this.strokeStyle,點數:this.__點數||0});window.__物理曲線.set(this.canvas.id,rows);return stroke.apply(this,arguments);};
      p.fillText=function(value,x,y){
        const m=this.measureText(value),t=this.getTransform();
        const corners=[[x-m.actualBoundingBoxLeft,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y+m.actualBoundingBoxDescent],[x-m.actualBoundingBoxLeft,y+m.actualBoundingBoxDescent]].map(([a,b])=>({x:t.a*a+t.c*b+t.e,y:t.b*a+t.d*b+t.f}));
        const bounds={左:Math.min(...corners.map(v=>v.x)),右:Math.max(...corners.map(v=>v.x)),上:Math.min(...corners.map(v=>v.y)),下:Math.max(...corners.map(v=>v.y))};
        const rows=window.__物理文字.get(this.canvas.id)||[];rows.push({文字:String(value),邊界:bounds,裁切:bounds.左<-.75||bounds.上<-.75||bounds.右>this.canvas.width+.75||bounds.下>this.canvas.height+.75});window.__物理文字.set(this.canvas.id,rows);
        return text.apply(this,arguments);
      };
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${server.base}memory-physics.html?lang=${language}`,{waitUntil:'load'});
    await page.waitForFunction(()=>document.getElementById('cryo-out-window')?.textContent!=='—'&&document.getElementById('cryo-qubit-out-deltav')?.textContent!=='—'&&document.getElementById('bspdn-out-effvdd')?.textContent!=='—');
    const row={名稱:`${width}px ${language} 必要代表情境`,通過:false,圖面:[],鍵盤:[],錯誤:errors,計時器:timers};
    async function set(id,value){await page.locator('#'+id).evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));},value);}
    async function mode(id){await page.locator('#'+id).evaluate(el=>el.click());}
    async function capture(name){
      const state=await page.evaluate(({roots,canvasIds})=>{
        const overflow=roots.flatMap(id=>{const root=document.getElementById(id),r=root.getBoundingClientRect(),s=getComputedStyle(root),left=r.left+parseFloat(s.paddingLeft)+parseFloat(s.borderLeftWidth),right=r.right-parseFloat(s.paddingRight)-parseFloat(s.borderRightWidth);return [...root.querySelectorAll('select,input,button,h3,[role="group"]')].filter(el=>el.getBoundingClientRect().width>0).map(el=>{const e=el.getBoundingClientRect();return {識別:el.id||el.tagName,左:e.left,右:e.right,容器左:left,容器右:right,超出:e.left<left-.75||e.right>right+.75};}).filter(v=>v.超出);});
        const charts=canvasIds.map(id=>{const c=document.getElementById(id),r=c.getBoundingClientRect();return {識別:id,寬:r.width,高:r.height,文字:window.__物理文字.get(id)||[],曲線:window.__物理曲線.get(id)||[]};});
        return {溢位:overflow,畫布:charts};
      },{roots,canvasIds});
      assert.deepEqual(state.溢位,[],`${name} 控制項超出自己的容器`);
      for(const chart of state.畫布){assert.deepEqual(chart.文字.filter(v=>v.裁切),[],`${name} ${chart.識別} 字形裁切`);assert.equal(chart.文字.some(v=>/NaN|Infinity/.test(v.文字)),false);}
      row.圖面.push({情境:name,...state});report.圖面組數+=3;return state;
    }
    await capture('預設');
    await set('cryo-tech-select','mram_stt_cryo');await set('cryo-env-select','ambient_300k');
    await set('cryo-qubit-tech-select','cryo_cmos_8t_sram');await set('cryo-qubit-bfield-slider',0);
    const sram=await capture('MRAM 未定義與 SRAM 280 mV 操作點');
    assert.equal(await page.locator('#cryo-out-vbd').innerText(),language==='zh'?'N/A · 未定義':'N/A · Undefined');
    const qubit=sram.畫布.find(v=>v.識別==='cryo-qubit-canvas'),joined=qubit.文字.map(v=>v.文字).join('').replace(/\s+/g,'');
    assert.match(joined,/ΔV:280mV/);assert.equal(await page.locator('#cryo-qubit-out-deltav').innerText(),'280 mV');
    for(const color of ['#ef4444','#f59e0b','#a855f7','#00f0ff'])assert.equal(qubit.曲線.some(v=>v.顏色===color&&v.點數===51),true,'四條參考曲線必須完整');
    for(const label of language==='zh'?['平面MRAM','垂直STT-MRAM','8TSRAM','AntiFuse微絲']:['In-PlaneMRAM','p-STT-MRAM','8TSRAM','AntiFuseFilament'])assert.equal(joined.includes(label),true,'四技術圖例必須完整');
    await set('bspdn-preset-select','fspdn_3nm_baseline');await set('bspdn-current-slider',25);await set('bspdn-rise-slider',.1);await set('bspdn-temp-slider',175);
    await mode('cryo-mode-spec');await mode('cryo-qubit-mode-waveform');
    const transient=await capture('300 K 右端、RF 圖例與合法負裕度');
    assert.equal(await page.locator('#bspdn-out-effvdd').innerText(),'0.942 V');
    for(const color of ['#f59e0b','#38bdf8'])assert.equal(transient.畫布.find(v=>v.識別==='bspdn-canvas').曲線.some(v=>v.顏色===color&&v.點數===121),true);
    await set('bspdn-preset-select','samsung_sf14_bspdn');await mode('bspdn-mode-thermal');
    await set('cryo-qubit-preset-select','nv_center_diamond_77k');await set('cryo-qubit-rf-slider',0);
    const thermal=await capture('175°C 熱操作點與最長 RF 圖例');
    for(const color of ['#f59e0b','#38bdf8'])assert.equal(thermal.畫布.find(v=>v.識別==='bspdn-canvas').曲線.some(v=>v.顏色===color&&v.點數===7),true);
    for(const id of canvasIds)await page.locator('#'+id).screenshot({path:path.join(evidence,`修正-${width}-${language}-${id}.png`)});
    for(const [id,label] of sliders){const input=page.locator('#'+id);await input.focus();for(const key of ['Home','End']){await page.keyboard.press(key);assert.equal(await input.getAttribute('aria-valuetext'),await page.locator('#'+label).innerText());}row.鍵盤.push(id);report.鍵盤組數++;}
    await page.evaluate(()=>window.HubLanguage.set(window.HubLanguage.get()==='zh'?'en':'zh',false));
    const flipped=language==='zh'?'en':'zh';
    assert.equal(await page.locator('#cryo-out-vbd').innerText(),flipped==='zh'?'N/A · 未定義':'N/A · Undefined');
    await capture('語系切換即時重新繪圖');
    for(const tech of Object.keys(modules[0].CRYO_TECH_PROFILES)){await set('cryo-tech-select',tech);assert.match(await page.locator('#cryo-out-verdict').innerText(),flipped==='zh'?/未校準教學/:/UNCALIBRATED TEACHING/);}
    for(const tech of Object.keys(modules[1].CRYO_MEMORY_TOPOLOGIES)){await set('cryo-qubit-tech-select',tech);assert.match(await page.locator('#cryo-qubit-out-rating').innerText(),flipped==='zh'?/未校準教學分類/:/Uncalibrated teaching class/);}
    for(const id of ['cryo-out-verdict','cryo-qubit-out-verdict','bspdn-out-verdict'])assert.doesNotMatch(await page.locator('#'+id).innerText(),/QUANTUM CRYO-READY|uniquely qualified|完全相容|可直接貼裝|天然免疫|首選|完全免疫/i);
    assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
    await page.goto('about:blank');await page.waitForTimeout(100);assert.deepEqual(errors,[]);assert.deepEqual(timers,[]);
    row.通過=true;report.案例.push(row);await context.close();console.log(`${row.名稱}：通過`);
  }
} finally {await browser.close();await server.close();}
report.全部通過=report.案例.every(v=>v.通過);
fs.writeFileSync(path.join(evidence,'物理工具修正驗證結果.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({通過:report.案例.filter(v=>v.通過).length,總數:report.案例.length,純函式:report.純函式組數,圖面:report.圖面組數,鍵盤:report.鍵盤組數,保留:report.案例.find(v=>v.名稱.startsWith('原 ID'))}));
