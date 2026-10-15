import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {calculateCimAnalogMac} from '../cim-analog-mac-simulator.js';
import {calculateCimMacMetrics} from '../cim-neuromorphic-mac-simulator.js';

// 只驗證三個受影響模型；基準以相同尺寸、語言、參數載入原始五個檔案。
const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(root, process.env.NVM_QA_OUTPUT || 'qa/CiM判讀與導覽');
fs.mkdirSync(output, {recursive:true});
const baselineSha = 'dbb8d92ebe20d04535abfc615779e1092e31466c';
const changed = ['ai-nvm-opportunities.html','ai-nvm.css','cim-analog-mac-simulator.js','cim-nn-accuracy-degradation-simulator.js','cim-neuromorphic-mac-simulator.js'];
const baselineFiles = Object.fromEntries(changed.map(file => [file, execFileSync('git',['show',`${baselineSha}:${file}`],{cwd:root})]));
const models = [
  {name:'類比',root:'cim-mac-precision-root',guide:'cim-mac-reading-guide',canvas:'cim-mac-canvas',modes:['cim-mac-mode-hist','cim-mac-mode-curve'],copy:'cim-mac-out-topswatt',csv:'cim-analog-export-csv-btn'},
  {name:'留存',root:'cim-nn-degradation-simulator-root',guide:'cim-nn-reading-guide',canvas:'cim-nn-canvas',modes:['cim-nn-mode-curve','cim-nn-mode-dist']},
  {name:'線阻',root:'cim-neuromorphic-simulator-root',guide:'cim-neuro-reading-guide',canvas:'cim-neuro-mac-canvas',modes:['cim-mode-heatmap','cim-mode-tradeoff'],copy:'cim-out-energy',csv:'cim-neuromorphic-export-csv-btn'}
];
const results=[];
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = (process.env.NVM_QA_BASE || server.base).replace(/\/?$/, '/');
const origin=new URL(base).origin;
let browser;
let expired=false;
const deadline=setTimeout(()=>{expired=true;void browser?.close();},180000);
async function check(name, work) {
  try { const detail=await work(); results.push({項目:name,通過:true,...(detail||{})}); }
  catch(error) {results.push({項目:name,通過:false,原因:error.message});}
}
async function setRange(page,id,value) {
  await page.locator(`#${id}`).evaluate((node,value)=>{node.value=String(value);node.dispatchEvent(new Event('input',{bubbles:true}));},value);
}
async function configure(page) {
  for(const id of ['cim-mac-workload-select','cim-mac-device-select','cim-nn-workload-select','cim-nn-device-select','cim-preset-select','cim-media-select']) {
    const options=await page.locator(`#${id}`).evaluate(node=>Array.from(node.options).map(option=>option.value));
    await page.locator(`#${id}`).selectOption(options[1]);
  }
  for(const id of ['cim-mac-adc-select','cim-nn-adc-select']) await page.locator(`#${id}`).selectOption('8');
  for(const id of ['cim-mac-temp-slider','cim-nn-temp-slider']) await setRange(page,id,125);
  for(const id of ['cim-mac-ret-slider','cim-nn-ret-slider']) await setRange(page,id,87501);
  await setRange(page,'cim-wire-slider',2.7);
  await setRange(page,'cim-adc-slider',7);
  await setRange(page,'cim-drift-slider',9101);
}
async function controls(page) {
  return page.evaluate(ids=>ids.flatMap(id=>Array.from(document.querySelectorAll(`#${id} input, #${id} select, #${id} button`)).map(node=>({
    id:node.id || node.dataset.copyValue,tag:node.tagName,type:node.type,value:node.matches('input,select')?node.value:null,
    min:node.getAttribute('min'),max:node.getAttribute('max'),step:node.getAttribute('step'),
    options:node.tagName==='SELECT'?Array.from(node.options).map(option=>option.value):null
  }))),models.map(model=>model.root));
}
async function newPage(width,lang,baseline=false) {
  const context=await browser.newContext({viewport:{width,height:900},permissions:['clipboard-read','clipboard-write'],serviceWorkers:'block',reducedMotion:'reduce'});
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.origin!==origin)return route.abort();
    let file=decodeURIComponent(url.pathname.split('/').pop());
    if(file==='ai-nvm-opportunities')file+='.html';
    if(baseline && baselineFiles[file])return route.fulfill({body:baselineFiles[file],contentType:file.endsWith('.html')?'text/html':file.endsWith('.css')?'text/css':'text/javascript'});
    return route.continue();
  });
  await context.addInitScript(()=>{
    window.__cimText=[];
    const original=CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...rest){
      if(['cim-mac-canvas','cim-nn-canvas','cim-neuro-mac-canvas'].includes(this.canvas.id)) {
        const m=this.measureText(String(text)),t=this.getTransform();
        // actualBoundingBox 已包含 textAlign 與 textBaseline，換算至實體像素。
        const left=(x-m.actualBoundingBoxLeft)*t.a+t.e,right=(x+m.actualBoundingBoxRight)*t.a+t.e;
        const top=(y-m.actualBoundingBoxAscent)*t.d+t.f,bottom=(y+m.actualBoundingBoxDescent)*t.d+t.f;
        window.__cimText.push({canvas:this.canvas.id,text:String(text),left,right,top,bottom,width:this.canvas.width,height:this.canvas.height,
          clipped:left < -1 || right > this.canvas.width+1 || top < -1 || bottom > this.canvas.height+1});
      }
      return original.call(this,text,x,y,...rest);
    };
  });
  const page=await context.newPage();
  page.setDefaultTimeout(6000);
  page.setDefaultNavigationTimeout(15000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${base}ai-nvm-opportunities.html?lang=${lang}&cimqa=preserve#cim-model-guide`,{waitUntil:'domcontentloaded'});
  await page.locator('#cim-neuromorphic-export-csv-btn').waitFor();
  await configure(page);
  return {context,page,errors};
}
async function keyboardLink(page,selector,target,lang) {
  const link=page.locator(selector).first();
  await link.focus();
  await page.keyboard.press('Tab');await page.keyboard.press('Shift+Tab');
  assert.equal(await link.evaluate(node=>node===document.activeElement),true,'Tab 往返必須回到連結');
  const visibleFocus=await link.evaluate(node=>{const s=getComputedStyle(node);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0||s.boxShadow!=='none';});
  assert.ok(visibleFocus,'鍵盤焦點必須可見');
  await page.keyboard.press('Enter');
  await page.waitForFunction(target=>location.hash===`#${target}`,target);
  assert.equal(await page.evaluate(()=>document.activeElement.id),target,'錨點目標必須取得焦點');
  assert.equal(new URL(page.url()).searchParams.get('lang'),lang,'導覽必須保留語言查詢參數');
  assert.equal(new URL(page.url()).searchParams.get('cimqa'),'preserve','導覽必須保留既有查詢參數');
  await targetVisible(page,target);
}
async function targetVisible(page,target) {
  await page.waitForFunction(target=>{
    const node=document.getElementById(target),r=node.getBoundingClientRect();
    if(r.top<0||r.top>innerHeight-30)return false;
    const hit=document.elementFromPoint(Math.max(1,Math.min(innerWidth-1,r.left+r.width/2)),r.top+Math.min(16,r.height/2));
    return hit&&(node.contains(hit)||hit.contains(node));
  },target,{timeout:3000});
}
async function geometry(page,model) {
  return page.locator(`#${model.root}`).evaluate(root=>{
    const issues=[];
    for(const node of [root,...root.querySelectorAll('input,select,button,canvas,.cim-reading-guide,.cim-reading-links a,.cim-reading-guide a')]) {
      const r=node.getBoundingClientRect();if(!r.width||!r.height)continue;
      if(r.left < -1 || r.right > innerWidth+1) issues.push({元素:node.id||node.tagName,原因:'超出視窗',左:r.left,右:r.right});
      for(let parent=node.parentElement;parent&&parent!==document.body;parent=parent.parentElement) {
        const s=getComputedStyle(parent),p=parent.getBoundingClientRect();
        if(/hidden|clip/.test(s.overflowX)&& (r.left<p.left-1||r.right>p.right+1))issues.push({元素:node.id||node.tagName,祖先:parent.id||parent.className,原因:'祖先水平裁切'});
        if(/hidden|clip/.test(s.overflowY)&& (r.top<p.top-1||r.bottom>p.bottom+1))issues.push({元素:node.id||node.tagName,祖先:parent.id||parent.className,原因:'祖先垂直裁切'});
      }
    }
    for(const node of root.querySelectorAll('.cim-reading-links a,.cim-reading-guide a'))if(node.getBoundingClientRect().height<43.9)issues.push({元素:node.getAttribute('href'),原因:'新增連結高度不足44px'});
    for(const node of root.querySelectorAll('.cim-reading-guide p,.cim-reading-guide li,.cim-reading-guide dt,.cim-reading-guide dd,.cim-reading-guide a'))if(parseFloat(getComputedStyle(node).fontSize)<15)issues.push({元素:node.tagName,原因:'判讀內文小於15px'});
    return issues;
  });
}
function expectedCsv(model,config) {
  if(model.name==='類比')return [4,6,8].flatMap(nominalAdcBits=>[25,85,125].flatMap(temperatureC=>[1,24,720,8760].map(retentionHours=>{
    const m=calculateCimAnalogMac({...config,nominalAdcBits,temperatureC,retentionHours,clockFreqMHz:100});
    return [config.workloadKey,config.deviceKey,nominalAdcBits,temperatureC,retentionHours,...[m.sinadDb,m.realizedEnob,m.estimatedAccuracy,m.macroTopsPerWatt,m.adcOverheadFraction].map(n=>Number(n.toFixed(2)))];
  })));
  return [0.5,1.5,3,5].flatMap(wireResistanceOhm=>[4,6,8].map(adcResolutionBits=>{
    const m=calculateCimMacMetrics({...config,wireResistanceOhm,adcResolutionBits});
    return [m.preset.id,m.media.id,wireResistanceOhm,adcResolutionBits,config.driftTimeHours,...[m.throughputTops,m.energyEfficiencyTopsPerWatt,m.worstCaseIrDropMv,m.retainedAccuracyPct].map(n=>Number(n.toFixed(2)))];
  }));
}
async function exportAndCopy(page,model,label) {
  const value=await page.locator(`#${model.copy}`).innerText();
  await page.locator(`[data-copy-value="${model.copy}"]`).click();
  await page.waitForFunction(value=>document.querySelector('.model-value-copy-status')!==null,value);
  const clipboard=await page.evaluate(()=>navigator.clipboard.readText());
  assert.equal(clipboard,value,'真實剪貼簿必須與畫面數值一致');
  assert.equal(await page.locator(`#${model.copy}`).innerText(),value,'複製不得覆寫畫面數值');
  const config=await page.evaluate(name=>name==='類比'?{
    workloadKey:document.querySelector('#cim-mac-workload-select').value,deviceKey:document.querySelector('#cim-mac-device-select').value
  }:{presetKey:document.querySelector('#cim-preset-select').value,mediaKey:document.querySelector('#cim-media-select').value,driftTimeHours:Number(document.querySelector('#cim-drift-slider').value)},model.name);
  const pending=page.waitForEvent('download');await page.locator(`#${model.csv}`).click();const download=await pending;
  assert.equal(await download.failure(),null,'實際 CSV 下載不得失敗');
  const file=await download.path();const lines=fs.readFileSync(file,'utf8').trim().split(/\r?\n/);
  assert.equal(lines.shift(),model.name==='類比'
    ? 'Workload,Device,AdcBits,Temp_C,RetentionHours,SinadDb,RealizedEnob,AccuracyPct,TopsWatt,AdcSharePct'
    : '預設,介質,線阻_Ohm,ADC_位元,漂移時間_小時,吞吐量_TOPS,能效_TOPS每W,最差壓降_mV,精度保留率_pct','CSV 欄位名稱與順序必須保全');
  const rows=lines.map(line=>line.split(',').map((v,i)=>i<2?v:Number(v)));
  assert.deepEqual(rows,expectedCsv(model,config),'CSV 全部掃描列必須符合原計算器及非預設條件');
  fs.copyFileSync(file,path.join(output,`${label}-${model.name}-實際下載.csv`));
  return {列數:rows.length,剪貼簿:clipboard,原下載名稱:download.suggestedFilename()};
}
try {
  browser=await chromium.launch({headless:true,...(process.env.NVM_QA_BROWSER==='chromium'?{}:{channel:'msedge'})});
  for(const width of [390,1440])for(const lang of ['zh','en']) {
    const label=`${width}-${lang}`;
    const baseline=await newPage(width,lang,true);
    const oldControls=await controls(baseline.page);
    const oldGeometry={};
    for(const model of models) {
      oldGeometry[model.name]=await geometry(baseline.page,model);
      await baseline.page.locator(`#${model.root}`).screenshot({path:path.join(output,`${label}-${model.name}-基準.png`)});
    }
    const current=await newPage(width,lang);
    const {page}=current;
    await check(`${label}原控制契約保全`,async()=>{assert.deepEqual(await controls(page),oldControls);return {控制項數:oldControls.length};});
    for(const model of models) {
      await check(`${label}-${model.name}-鍵盤導覽往返`,async()=>{
        await keyboardLink(page,`#cim-model-guide a[href="#${model.root}"]`,model.root,lang);
        await keyboardLink(page,`#${model.root} .cim-reading-links a[href="#${model.guide}"]`,model.guide,lang);
        await keyboardLink(page,`#${model.guide} a`,model.root,lang);
        await keyboardLink(page,`#${model.root} .cim-reading-links a[href="#cim-model-guide"]`,'cim-model-guide',lang);
      });
      await check(`${label}-${model.name}-版面及字級`,async()=>{const issues=await geometry(page,model);assert.deepEqual(issues,[]);return {基準問題:oldGeometry[model.name]};});
      for(const mode of model.modes)await check(`${label}-${model.name}-${mode}-畫布`,async()=>{
        await page.evaluate(()=>{window.__cimText=[];});
        const before=await page.locator(`#${model.canvas}`).evaluate(node=>node.toDataURL());
        await page.locator(`#${mode}`).click();
        assert.equal(await page.locator(`#${mode}`).getAttribute('aria-pressed'),'true','模式按鈕必須啟用');
        const after=await page.locator(`#${model.canvas}`).evaluate(node=>node.toDataURL());
        if(mode===model.modes[1])assert.notEqual(after,before,'第二模式必須重繪圖形');
        const labels=await page.evaluate(id=>window.__cimText.filter(item=>item.canvas===id),model.canvas);
        fs.writeFileSync(path.join(output,`${label}-${mode}-畫布文字.json`),JSON.stringify(labels,null,2));
        await page.locator(`#${model.canvas}`).screenshot({path:path.join(output,`${label}-${mode}.png`)});
        assert.ok(labels.length,'模式切換必須繪製文字');
        if(lang==='en')assert.deepEqual(labels.filter(item=>/[\u3400-\u9fff]/u.test(item.text)),[],'英文畫布不得殘留中文');
        assert.deepEqual(labels.filter(item=>item.clipped),[],'畫布文字必須完整顯示');
        return {文字數:labels.length};
      });
      await page.locator(`#${model.modes[0]}`).click();
      await page.locator(`#${model.root}`).screenshot({path:path.join(output,`${label}-${model.name}-新版.png`)});
      if(model.csv)await check(`${label}-${model.name}-實際複製與CSV`,()=>exportAndCopy(page,model,label));
    }
    await check(`${label}-語言切換保留參數與定位`,async()=>{
      const before=await controls(page);const hash=new URL(page.url()).hash;
      await page.locator('#languageToggle').click();
      const next=lang==='zh'?'en':'zh';
      assert.equal(new URL(page.url()).searchParams.get('lang'),next);
      assert.equal(new URL(page.url()).hash,hash);
      assert.deepEqual(await controls(page),before,'語言切換必須保留非預設參數');
      if(next==='en')for(const model of models)assert.doesNotMatch(await page.locator(`#${model.root}`).innerText(),/[\u3400-\u9fff]/u,'英文模型不得殘留中文');
      await page.locator('#languageToggle').click();
      assert.deepEqual(await controls(page),before,'雙向語言切換必須保留非預設參數');
      if(lang==='en')for(const model of models)assert.doesNotMatch(await page.locator(`#${model.root}`).innerText(),/[\u3400-\u9fff]/u);
    });
    await check(`${label}-索引與頁面例外`,async()=>{
      const links=await page.locator('#cim-model-guide a').evaluateAll(nodes=>nodes.map(node=>({href:node.getAttribute('href'),height:node.getBoundingClientRect().height,exists:!!document.querySelector(node.getAttribute('href'))})));
      assert.ok(links.every(link=>link.exists&&link.height>=43.9),'索引連結目標須存在且高度至少44px');
      assert.deepEqual(current.errors,[]);assert.deepEqual(baseline.errors,[]);
      await page.locator('#cim-model-guide').screenshot({path:path.join(output,`${label}-導覽索引.png`)});
      return {連結:links};
    });
    await check(`${label}-首屏入口與歷史定位`,async()=>{
      const before=await controls(page);
      await keyboardLink(page,'a.button[href="#cim-model-guide"]','cim-model-guide',lang);
      await keyboardLink(page,'#cim-model-guide a[href="#cim-mac-precision-root"]','cim-mac-precision-root',lang);
      await page.goBack();assert.equal(new URL(page.url()).hash,'#cim-model-guide');await targetVisible(page,'cim-model-guide');
      await page.goForward();assert.equal(new URL(page.url()).hash,'#cim-mac-precision-root');await targetVisible(page,'cim-mac-precision-root');
      assert.deepEqual(await controls(page),before,'歷史往返必須保留非預設參數');
      const direct=await current.context.newPage();
      try {
        await direct.goto(`${base}ai-nvm-opportunities.html?lang=${lang}&cimqa=preserve#cim-nn-reading-guide`,{waitUntil:'load'});
        await direct.locator('#cim-neuromorphic-export-csv-btn').waitFor();
        await targetVisible(direct,'cim-nn-reading-guide');
        assert.equal(new URL(direct.url()).searchParams.get('lang'),lang);
        assert.equal(new URL(direct.url()).hash,'#cim-nn-reading-guide');
      } finally {await direct.close();}
    });
    await current.context.close();await baseline.context.close();
  }
} catch(error) {results.push({項目:'環境或執行上限',通過:false,原因:error.message});}
finally {clearTimeout(deadline);await browser?.close();await server?.close();}
const report={基準:baselineSha,目的地:base,瀏覽器:process.env.NVM_QA_BROWSER||'msedge',超時:expired,總數:results.length,通過:results.filter(r=>r.通過).length,結果:results};
fs.writeFileSync(path.join(output,'CiM判讀與導覽結果.json'),JSON.stringify(report,null,2));
console.log(`CiM 判讀與導覽局部驗證：${report.通過}／${report.總數}；證據：${output}`);
for(const item of results.filter(item=>!item.通過))console.error(`${item.項目}：${item.原因.slice(0,1000)}`);
if(expired||results.some(item=>!item.通過))process.exitCode=1;
