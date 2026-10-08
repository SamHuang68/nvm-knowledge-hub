import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import { startTestServer } from './test-server.mjs';
import * as sub from '../subthreshold-lowvoltage-nvm-simulator.js';
import * as tddb from '../tddb-weibull-simulator.js';

// 僅覆核兩個控制器；舊版在記憶體載入，外部資源及 Service Worker 阻擋。
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseline = 'bb6e755b0031760f7b371f41722708a5acbff62a';
const evidence = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa/後續改善-20261008/資源審核'));
const channel = process.env.NVM_QA_BROWSER || 'msedge';
await fs.mkdir(evidence, {recursive: true});
const report = {基準: baseline, 瀏覽器: channel, 輸出目錄: evidence, 外部阻擋: true, 案例: [], 數值案例: 0, 圖面: 0, 匯出列: 0, 鍵盤: 0};
const check = (名稱, condition, 證據) => report.案例.push({名稱, 通過: Boolean(condition), 證據});
const oldSources = [];
for (const [name, calculator] of [['subthreshold-lowvoltage-nvm-simulator.js', 'calculateSubthresholdMetrics'], ['tddb-weibull-simulator.js', 'calculateTddbWeibull']]) {
  const oldSource = execFileSync('git', ['show', `${baseline}:${name}`], {cwd: root, encoding: 'utf8'}).replace(/\r\n/g, '\n');
  const fresh = (await fs.readFile(path.join(root, name), 'utf8')).replace(/\r\n/g, '\n');
  const functionPattern = new RegExp(`export function ${calculator}\\([\\s\\S]*?\\n}\\n`);
  assert.equal(fresh.match(functionPattern)?.[0], oldSource.match(functionPattern)?.[0]);
  assert.equal(fresh.includes('copyAttached'), false);
  oldSources.push(oldSource);
}
const oldSub = await import('data:text/javascript;base64,' + Buffer.from(oldSources[0]).toString('base64'));
const oldTddb = await import('data:text/javascript;base64,' + Buffer.from(oldSources[1]).toString('base64'));
assert.deepEqual(sub.LOW_VOLTAGE_SUPPLY_PRESETS, oldSub.LOW_VOLTAGE_SUPPLY_PRESETS);
assert.deepEqual(sub.LOW_VOLTAGE_NVM_TOPOLOGIES, oldSub.LOW_VOLTAGE_NVM_TOPOLOGIES);
for (const topologyId of Object.keys(sub.LOW_VOLTAGE_NVM_TOPOLOGIES)) for (const [customVdd, customTempC, customCapacityKb] of [[.5,37,64],[.25,-20,8],[1.2,105,512]]) {
  const inputs = {topologyId,customVdd,customTempC,customCapacityKb};
  assert.deepEqual(sub.calculateSubthresholdMetrics(inputs), oldSub.calculateSubthresholdMetrics(inputs));
  report.數值案例++;
}
for (const modelId of Object.keys(tddb.ACCELERATION_MODELS)) for (const toxNm of [2.8,4.8]) {
  const inputs = {toxNm, modelId};
  assert.deepEqual(tddb.calculateTddbWeibull(inputs), oldTddb.calculateTddbWeibull(inputs));
  report.數值案例++;
}
check('原計算函式、係數、預設及分類逐字／數值保留', true, {組數: report.數值案例});
// 歷史診斷僅作可選參照；新輸出目錄或乾淨 CI 無此檔案仍完整驗證產品行為。
const diagnosis = path.join(evidence, '匯出與曲線診斷結果.json');
report.歷史診斷 = {參照: diagnosis, 存在: await fs.stat(diagnosis).then(stat => stat.isFile()).catch(() => false)};

const server = await startTestServer(root), browser = await chromium.launch({headless:true,...(channel === 'chromium' ? {} : {channel})});
try {
  for (const width of [320,390,1440]) for (const language of ['zh','en']) {
    const context = await browser.newContext({viewport:{width,height:960},serviceWorkers:'block',reducedMotion:'reduce',hasTouch:true,acceptDownloads:true});
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(server.base).origin ? route.continue() : route.abort());
    await context.addInitScript(() => {
      window.__圖面 = new Map();
      window.__複製內容 = [];
      Object.defineProperty(navigator, 'clipboard', {configurable:true,value:{writeText: value => {window.__複製內容.push(value); return new Promise(resolve => {window.__完成複製 = resolve;});}}});
      const p=CanvasRenderingContext2D.prototype;
      const clear=p.clearRect,begin=p.beginPath,move=p.moveTo,line=p.lineTo,stroke=p.stroke,text=p.fillText,arc=p.arc;
      p.clearRect=function(){window.__圖面.set(this.canvas.id,{文字:[],曲線:[],操作點:[]});return clear.apply(this,arguments);};
      p.beginPath=function(){this.__座標=[];return begin.apply(this,arguments);};
      p.moveTo=function(x,y){this.__座標.push([x,y]);return move.apply(this,arguments);};
      p.lineTo=function(x,y){this.__座標.push([x,y]);return line.apply(this,arguments);};
      p.stroke=function(){window.__圖面.get(this.canvas.id)?.曲線.push({顏色:this.strokeStyle,座標:this.__座標.slice()});return stroke.apply(this,arguments);};
      p.arc=function(x,y,r){window.__圖面.get(this.canvas.id)?.操作點.push({x,y,r});return arc.apply(this,arguments);};
      p.fillText=function(value,x,y){
        const m=this.measureText(value),t=this.getTransform();
        const corners=[[x-m.actualBoundingBoxLeft,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y+m.actualBoundingBoxDescent],[x-m.actualBoundingBoxLeft,y+m.actualBoundingBoxDescent]].map(([a,b])=>({x:t.a*a+t.c*b+t.e,y:t.b*a+t.d*b+t.f}));
        const bounds={左:Math.min(...corners.map(p=>p.x)),右:Math.max(...corners.map(p=>p.x)),上:Math.min(...corners.map(p=>p.y)),下:Math.max(...corners.map(p=>p.y))};
        window.__圖面.get(this.canvas.id)?.文字.push({文字:String(value),邊界:bounds,裁切:bounds.左<-.75||bounds.上<-.75||bounds.右>this.canvas.width+.75||bounds.下>this.canvas.height+.75});
        return text.apply(this,arguments);
      };
    });
    const page = await context.newPage(), errors=[];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {if(message.type()==='warning' && /drawSubthresholdCanvas|drawWeibullCanvas/.test(message.text())) errors.push(message.text());});
    const set = async (id,value) => page.locator('#'+id).evaluate((element,value) => {element.value=String(value);element.dispatchEvent(new Event(element.tagName==='SELECT'?'change':'input',{bubbles:true}));},value);
    const snapshot = async (rootId,canvasId) => page.evaluate(({rootId,canvasId}) => {
      const root=document.getElementById(rootId),canvas=document.getElementById(canvasId),r=root.getBoundingClientRect();
      const controls=[...root.querySelectorAll('input,select,button')].filter(element=>element.getClientRects().length).map(element=>{const b=element.getBoundingClientRect(),p=element.parentElement.getBoundingClientRect();return {識別:element.id||element.className,左:b.left,右:b.right,容器左:p.left,容器右:p.right};});
      return {寬:canvas.clientWidth,高:canvas.clientHeight,根邊界:{左:r.left,右:r.right},控制項:controls,圖面:window.__圖面.get(canvasId)};
    },{rootId,canvasId});
    const checkFrame = (tag,state,legend) => {
      report.圖面++;
      const clipped=state.圖面.文字.filter(row=>row.裁切);
      const overflow=state.控制項.filter(row=>row.左<row.容器左-1||row.右>row.容器右+1||row.左<state.根邊界.左-1||row.右>state.根邊界.右+1);
      const joined=state.圖面.文字.map(row=>row.文字).join('').replace(/\s/g,'');
      check(`${tag}：字形、圖例及控制項容器`, !clipped.length&&!overflow.length&&legend.every(label=>joined.includes(label.replace(/\s/g,''))), {裁切:clipped,溢位:overflow,畫布寬:state.寬,畫布高:state.高});
    };
    const screenshot = async (id,name) => {
      const canvas=page.locator('#'+id);
      await canvas.evaluate(element=>element.scrollIntoView({block:'center',inline:'nearest'}));
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(resolve)));
      await canvas.screenshot({path:path.join(evidence,name)});
    };
    const download = async (button,name) => {
      const event=page.waitForEvent('download');
      await page.locator('#'+button).focus();await page.keyboard.press('Enter');
      const file=await event;report.鍵盤++;
      await file.saveAs(path.join(evidence,name));
      return {檔名:file.suggestedFilename(),文字:await fs.readFile(path.join(evidence,name),'utf8')};
    };

    await page.goto(server.base+`iot-mcu-envm.html?lang=${language}`,{waitUntil:'load'});
    await page.locator('#subvt-export-csv-btn').waitFor({state:'attached'});
    const curves=[];
    for (const [temperature,capacity] of [[37,64],[85,512]]) {
      await set('subvt-vdd-slider',.5);await set('subvt-temp-slider',temperature);await set('subvt-capacity-slider',capacity);
      const inputs={topologyId:'antifuse_lowvoltage',customVdd:.5,customTempC:temperature,customCapacityKb:capacity};
      const expected=sub.calculateSubthresholdMetrics(inputs);
      const kpi=await page.locator('#subvt-metric-energy').textContent();
      check(`${width}/${language}/${temperature}°C：KPI`, kpi===`${expected.totalEnergyFj.toFixed(2)} fJ/b`, {實際:kpi,預期:expected.totalEnergyFj});
      const energy=await snapshot('subvt-simulator-root','subvt-lowvoltage-canvas');
      checkFrame(`${width}/${language}/${temperature}°C／${capacity}Kb 能耗`,energy,language==='zh'?['總能耗','動態CV²','MEP','E =']:['Total','DynamicCV²','MEP','E =']);
      const sample=Array.from({length:61},(_,j)=>sub.calculateSubthresholdMetrics({...inputs,customVdd:.25+.95*j/60}));
      const maximum=Math.max(60,Math.ceil(Math.max(expected.totalEnergyFj,...sample.map(m=>m.totalEnergyFj))/10)*10);
      const green=energy.圖面.曲線.find(row=>row.顏色==='#10b981'&&row.座標.length===61);
      const blue=energy.圖面.曲線.find(row=>row.座標.length===61&&row.顏色!== '#10b981');
      const top=green?.座標[0][1]-200*(1-sample[0].totalEnergyFj/maximum);
      const correct=green&&blue&&sample.every((m,j)=>Math.abs(green.座標[j][1]-(top+200*(1-m.totalEnergyFj/maximum)))<1e-6&&Math.abs(blue.座標[j][1]-(top+200*(1-m.activeEnergyFj/maximum)))<1e-6);
      const point=energy.圖面.操作點.find(p=>p.r===5);
      check(`${width}/${language}/${temperature}°C：61 點雙曲線及操作點同契約`,correct&&Math.abs(point.y-(top+200*(1-expected.totalEnergyFj/maximum)))<1e-6&&Math.abs(point.x-(70+(energy.寬-94)*(.5-.25)/.95))<1e-6,{掃描點:green?.座標.length,操作點:point,能耗上界:maximum});
      await page.locator('#subvt-mode-latency-btn').focus();await page.keyboard.press('Space');report.鍵盤++;
      const latency=await snapshot('subvt-simulator-root','subvt-lowvoltage-canvas');
      checkFrame(`${width}/${language}/${temperature}°C／${capacity}Kb 延遲`,latency,['Pelgrom BER',language==='zh'?'目前延遲':'Active Delay']);
      const yellow=latency.圖面.曲線.find(row=>row.顏色==='#f59e0b'&&row.座標.length===61);
      const logMax=Math.max(4,Math.ceil(Math.log10(Math.max(expected.senseLatencyNs,...sample.map(m=>m.senseLatencyNs)))));
      const latencyTop=yellow?.座標[0][1]-200*(1-Math.log10(sample[0].senseLatencyNs)/logMax);
      const op=latency.圖面.操作點.find(p=>p.r===5);
      check(`${width}/${language}/${temperature}°C：61 點延遲與操作點同契約`,yellow&&sample.every((m,j)=>Math.abs(yellow.座標[j][1]-(latencyTop+200*(1-Math.log10(m.senseLatencyNs)/logMax)))<1e-6)&&Math.abs(op.y-(latencyTop+200*(1-Math.log10(expected.senseLatencyNs)/logMax)))<1e-6,{掃描點:yellow?.座標.length,操作點:op});
      curves.push({能耗:green?.座標,延遲:yellow?.座標});
      if(temperature===85) await screenshot('subvt-lowvoltage-canvas',`修正-${width}-${language}-低電壓延遲.png`);
      await page.locator('#subvt-mode-energy-btn').focus();await page.keyboard.press('Enter');report.鍵盤++;
      if(temperature===85||width===1440&&language==='en') {
        const csv=await download('subvt-export-csv-btn',`修正-${width}-${language}-${temperature}度-低電壓.csv`);
        const rows=csv.文字.trim().split('\n'),columns=rows.shift();
        const equal=rows.length===61&&rows.every((line,j)=>{const actual=line.split(',').map(Number),m=sample[j],expected=[m.vdd,m.activeEnergyFj,m.leakageEnergyFj,m.totalEnergyFj,m.senseLatencyNs];return actual.every((value,i)=>Number.isFinite(value)&&Math.abs(value-expected[i])<=(i===4?.00500001:.00050001));});
        report.匯出列+=rows.length;
        check(`${width}/${language}/${temperature}°C：真實下載與 61 列欄位契約`,equal&&columns==='VDD_V,DynamicEnergy_fJ,LeakageEnergy_fJ,TotalEnergy_fJ,SenseLatency_ns'&&csv.檔名==='subthreshold_simulation_antifuse_lowvoltage.csv',{檔名:csv.檔名,列數:rows.length});
      }
    }
    check(`${width}/${language}：兩模式隨溫度／容量更新`,JSON.stringify(curves[0].能耗)!==JSON.stringify(curves[1].能耗)&&JSON.stringify(curves[0].延遲)!==JSON.stringify(curves[1].延遲));
    await screenshot('subvt-lowvoltage-canvas',`修正-${width}-${language}-低電壓能耗.png`);
    for(const id of ['subvt-vdd-slider','subvt-temp-slider','subvt-capacity-slider']) {
      await page.locator('#'+id).focus();await page.keyboard.press('Home');await page.keyboard.press('End');report.鍵盤+=2;
      const state=await page.locator('#'+id).evaluate(element=>({值:element.value,最大:element.max,朗讀:element.getAttribute('aria-valuenow')}));
      check(`${width}/${language}：${id} 鍵盤與朗讀值`,Number(state.值)===Number(state.最大)&&Number(state.值)===Number(state.朗讀),state);
    }
    if(width===1440&&language==='en') {
      await set('subvt-vdd-slider',.5);await set('subvt-temp-slider',37);await set('subvt-capacity-slider',64);
      await page.locator('#subvt-metric-energy').evaluate(element=>element.click());
      await set('subvt-temp-slider',85);await set('subvt-capacity-slider',512);
      const expected=await page.locator('#subvt-metric-energy').textContent();
      await page.evaluate(()=>window.__完成複製());await page.waitForTimeout(1300);
      check('低電壓複製完成後不還原舊 KPI',await page.locator('#subvt-metric-energy').textContent()===expected,{新數值:expected,複製內容:await page.evaluate(()=>window.__複製內容)});
      for(const language of ['zh','en','zh']) {
        await page.evaluate(language=>window.HubLanguage.set(language),language);
        const button=await page.locator('#subvt-export-csv-btn').evaluate(element=>({文字:element.textContent,朗讀:element.getAttribute('aria-label')}));
        check(`低電壓執行期語系 ${language} 與匯出按鈕同步`,button.文字===(language==='zh'?'📥 匯出 CSV':'📥 Export CSV')&&button.朗讀===(language==='zh'?'匯出 CSV':'Export CSV'),button);
      }
    }

    await page.goto(server.base+`memory-physics.html?lang=${language}`,{waitUntil:'load'});
    await page.locator('#tddb-export-csv-btn').waitFor({state:'attached'});
    for(const tox of [2.8,4.8]) {
      await set('tddb-tox-slider',tox);
      const inputs=await page.evaluate(()=>({toxNm:Number(document.getElementById('tddb-tox-slider').value),voxV:Number(document.getElementById('tddb-vox-slider').value),tempC:Number(document.getElementById('tddb-temp-slider').value),modelId:document.getElementById('tddb-model-select').value,arraySizeKey:document.getElementById('tddb-array-select').value,dutyCycleKey:document.getElementById('tddb-duty-select').value}));
      const result=tddb.calculateTddbWeibull(inputs),state=await snapshot('tddb-weibull-root','tddb-canvas');
      checkFrame(`${width}/${language}/${tox}nm TDDB`,state,language==='zh'?['單元基準','陣列']:['Cell Baseline','Array']);
      const csv=await download('tddb-export-csv-btn',`修正-${width}-${language}-${tox}nm-TDDB.csv`),rows=csv.文字.trim().split('\n');
      rows.shift();report.匯出列+=rows.length;
      const correct=rows.length===65&&rows.every((line,j)=>{const [logT,w,time,cell,array]=line.split(',').map(Number),pt=result.curves.cell[j],arr=result.curves.array[j];return logT===Number(pt.logT.toFixed(3))&&w===Number(pt.w.toFixed(3))&&time===Number((10**pt.logT).toExponential(2))&&Math.abs(cell-pt.f*100)<=.00006&&Math.abs(array-arr.f*100)<=.00006;});
      check(`${width}/${language}/${tox}nm：TDDB 真實下載檔名與 65 列`,correct&&csv.檔名===`tddb_weibull_${result.inputs.modelId}_${result.inputs.tox}nm.csv`,{檔名:csv.檔名,列數:rows.length});
    }
    await screenshot('tddb-canvas',`修正-${width}-${language}-TDDB.png`);
    for(const id of ['tddb-tox-slider','tddb-vox-slider','tddb-temp-slider']) {
      await page.locator('#'+id).focus();await page.keyboard.press('Home');await page.keyboard.press('End');report.鍵盤+=2;
      const state=await page.locator('#'+id).evaluate(element=>({值:element.value,最大:element.max,朗讀:element.getAttribute('aria-valuenow')}));
      check(`${width}/${language}：${id} 鍵盤與朗讀值`,Number(state.值)===Number(state.最大)&&Number(state.值)===Number(state.朗讀),state);
    }
    if(width===1440&&language==='en') {
      await set('tddb-tox-slider',2.8);await page.locator('#tddb-eox-val').evaluate(element=>element.click());await set('tddb-tox-slider',4.8);
      const expected=await page.locator('#tddb-eox-val').textContent();await page.evaluate(()=>window.__完成複製());await page.waitForTimeout(1300);
      check('TDDB 複製完成後不還原舊 KPI',await page.locator('#tddb-eox-val').textContent()===expected,{新數值:expected,複製內容:await page.evaluate(()=>window.__複製內容)});
      for(const language of ['zh','en','zh']) {
        await page.evaluate(language=>window.HubLanguage.set(language),language);
        const button=await page.locator('#tddb-export-csv-btn').evaluate(element=>({文字:element.textContent,朗讀:element.getAttribute('aria-label')}));
        check(`TDDB 執行期語系 ${language} 與匯出按鈕同步`,button.文字===(language==='zh'?'📥 匯出 Weibull 曲線 (CSV)':'📥 Export Weibull Curve (CSV)')&&button.朗讀===(language==='zh'?'匯出 Weibull 曲線 CSV':'Export Weibull Curve CSV'),button);
      }
    }
    check(`${width}/${language}：無執行期例外及繪圖警告`,errors.length===0,errors);
    await context.close();
  }
} finally {await browser.close();await server.close();}
const failed=report.案例.filter(row=>!row.通過);
report.結果={通過:report.案例.length-failed.length,總數:report.案例.length,失敗:failed};
await fs.writeFile(path.join(evidence,'模型曲線與匯出驗證結果.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({結果:report.結果,數值案例:report.數值案例,圖面:report.圖面,匯出列:report.匯出列,鍵盤:report.鍵盤}));
assert.equal(failed.length,0,'模型曲線與匯出窄回歸存在失敗，詳見本機證據');
