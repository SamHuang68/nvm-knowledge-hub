import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { startTestServer } from './test-server.mjs';

// 僅驗證本輪五檔的既有公式、來源保留、輸入及窄螢幕呈現；阻擋所有外部請求。
const root = process.cwd();
const baseline = 'cb25d0706cc26c1117bd8dd39db1c48339096e24';
const evidence = path.join(root, 'qa', '持續收斂-工具');
fs.mkdirSync(evidence, {recursive:true});
const results = {基準版本:baseline,瀏覽器:'本機 Microsoft Edge',外部阻擋:true,觸控:'合成觸控手勢，未使用實體裝置',案例:[]};
const oldSource = file => execFileSync('git',['show',`${baseline}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024});
const oldModule = async file => import('data:text/javascript;base64,'+Buffer.from(oldSource(file)).toString('base64'));
const localModule = async file => import(pathToFileURL(path.join(root,file)).href);
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const widgets = ['wafer-tco-calculator-root','finfet-gaa-simulator-root','advanced-packaging-simulator-root','cu-bonding-simulator-root'];
let browser, server;

function numericFields(value, prefix='', output={}) {
  for (const [key,item] of Object.entries(value || {})) {
    const field = `${prefix}/${key}`;
    if (typeof item === 'number') output[field] = item;
    else if (item && typeof item === 'object') numericFields(item,field,output);
  }
  return output;
}

async function canvasState(page) {
  return page.evaluate(ids=>ids.map(id=>{
    const canvas=document.getElementById(id),rect=canvas.getBoundingClientRect();
    const labels=window.__labels.get(canvas)||[];
    return {識別碼:id,寬:rect.width,高:rect.height,文字:labels.map(row=>row.文字),裁切:labels.filter(row=>row.裁切)};
  }),['tco-canvas','finfet-canvas','pkg-canvas','cu-canvas-cross','cu-canvas-stress']);
}

async function assertLayout(page, name, row) {
  const canvas = await canvasState(page);
  const clipping = canvas.flatMap(item=>item.裁切.map(label=>({畫布:item.識別碼,...label})));
  const overflow = await page.evaluate(ids=>{
    const visible = el=>Boolean(el.getClientRects().length)&&getComputedStyle(el).visibility!=='hidden';
    const scrollAncestor = el=>{
      for(let node=el.parentElement;node;node=node.parentElement) {
        const css=getComputedStyle(node);
        if(['auto','scroll'].includes(css.overflowX)&&node.scrollWidth>node.clientWidth)return node;
      }
      return null;
    };
    return ids.flatMap(id=>[...document.getElementById(id).querySelectorAll('*')].filter(visible).filter(el=>{
      const rect=el.getBoundingClientRect();return rect.width>0&&(rect.right>innerWidth+2||rect.left<-2)&&!scrollAncestor(el);
    }).map(el=>({識別碼:el.id,標籤:el.tagName,文字:(el.innerText||'').slice(0,70),左:el.getBoundingClientRect().left,右:el.getBoundingClientRect().right})));
  },widgets);
  row.呈現.push({情境:name,畫布:canvas,溢位:overflow});
  assert.equal(clipping.length,0,`${name}：畫布文字被裁切 ${JSON.stringify(clipping)}`);
  assert.equal(overflow.length,0,`${name}：內容超出視窗 ${JSON.stringify(overflow)}`);
}

try {
  const sram = await localModule('sram-yield-bira-simulator.js');
  const oldSram = await oldModule('sram-yield-bira-simulator.js');
  const zeroCases=[];
  for (const presetId of Object.keys(sram.SRAM_YIELD_PRESETS)) {
    const defaults=sram.calculateSramYieldRecovery({presetId});
    for(const sparePerBank of [0,'0']) {
      const result=sram.calculateSramYieldRecovery({presetId,sparePerBank});
      assert.equal(result.sparePerBank,0);assert.equal(result.yields.repairedPct,result.yields.baselinePct);
      assert.equal(Math.abs(result.yields.deltaYieldPct),0);assert.equal(result.dies.extraGoodDies,0);
      assert.equal(result.economics.valueRecoveredPerWafer,0);assert.equal(result.economics.annualRun10kWafersUsd,0);
      zeroCases.push({預設:presetId,輸入:sparePerBank,未修復良率:result.yields.baselinePct,修復後良率:result.yields.repairedPct,額外產值:0});
    }
    for(const sparePerBank of [undefined,null,'','無效',Infinity]) {
      assert.deepEqual(sram.calculateSramYieldRecovery({presetId,sparePerBank}),defaults);
    }
    for(const sparePerBank of [1,2,3,4]) {
      assert.deepEqual(sram.calculateSramYieldRecovery({presetId,sparePerBank}),oldSram.calculateSramYieldRecovery({presetId,sparePerBank}));
    }
  }
  assert.notEqual(oldSram.calculateSramYieldRecovery({sparePerBank:0}).sparePerBank,0);
  results.案例.push({名稱:'零備援、缺省／無效值及非零公式',通過:true,舊版確定重現:true,零備援:zeroCases});

  for(const [file,calculator,inputs] of [
    ['advanced-finfet-gaa-simulator.js','calculateAdvancedFinfetGaa',[{}, {nodeId:'tsmc_n3_gaa',appliedVolt:0.4,tempC:25},{nodeId:'tsmc_n5_finfet',appliedVolt:8.5,tempC:175},{nodeId:'foundry_16ffc',appliedVolt:0.7,tempC:125}]],
    ['wafer-cost-tco-calculator.js','calculateWaferCostTco',[{}, {envmId:'beol_reram',dieAreaMm2:2,annualWaferVolume:1000},{envmId:'beol_emram',dieAreaMm2:60,annualWaferVolume:80000},{envmId:'eflash_split_gate',dieAreaMm2:25,annualWaferVolume:30000}]]
  ]) {
    const current=await localModule(file),original=await oldModule(file);
    for(const input of inputs)assert.deepEqual(numericFields(current[calculator](input)),numericFields(original[calculator](input)));
  }
  results.案例.push({名稱:'FinFET 與 TCO 原有數值公式保存',通過:true});

  const oldHtml=oldSource('technology-comparison.html'),html=fs.readFileSync(path.join(root,'technology-comparison.html'),'utf8');
  const attributes=(source,name)=>[...source.matchAll(new RegExp(`\\b${name}=["']([^"']+)["']`,'g'))].map(match=>match[1]).sort();
  assert.deepEqual(attributes(html,'id'),attributes(oldHtml,'id'));
  const addedSources = ['https://www.tsmc.com/chinese/dedicatedFoundry/technology/logic/l_3nm','https://research.tsmc.com/page/transistor-structure/59.html'];
  assert.deepEqual(attributes(html,'href'),[...attributes(oldHtml,'href'),...addedSources].sort());
  const figures=source=>[...source.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map(match=>hash(match[0].replace(/\r\n/g,'\n')));
  assert.deepEqual(figures(html),figures(oldHtml));
  const outsideFinfet = source => {const start=source.indexOf('<article id="finfet-gaa-simulator-root"'),end=source.indexOf('<article id="advanced-packaging-simulator-root"',start);return (source.slice(0,start)+source.slice(end)).replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();};
  assert.equal(outsideFinfet(html),outsideFinfet(oldHtml),'FinFET 以外正文保持完整');
  results.來源保留={識別碼:attributes(html,'id').length,既有連結:attributes(oldHtml,'href').length,新增架構來源:addedSources.length,原始向量圖:figures(html).length,FinFET以外正文相同:true,修訂說明:'FinFET 必要模型與節點文案由另一支邊界驗證覆核；只准新增兩個官方架構來源。'};
  results.案例.push({名稱:'原有識別碼、連結與向量圖保存',通過:true});

  server=await startTestServer(root);browser=await chromium.launch({headless:true,channel:'msedge'});
  for(const width of [320,390,1440])for(const language of ['zh','en']) {
    const context=await browser.newContext({viewport:{width,height:960},hasTouch:true,serviceWorkers:'block',reducedMotion:'reduce'});
    await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(server.base).origin?route.continue():route.abort());
    await context.addInitScript(()=>{
      // 僅記錄原繪圖文字的實際像素邊界，不改變畫布呈現。
      window.__labels=new Map();
      const proto=CanvasRenderingContext2D.prototype,fillText=proto.fillText,fillRect=proto.fillRect,clearRect=proto.clearRect;
      const reset=function(x,y,w,h){if(x===0&&y===0&&w>=this.canvas.width/(devicePixelRatio||1)-1&&h>=this.canvas.height/(devicePixelRatio||1)-1)window.__labels.set(this.canvas,[]);};
      proto.clearRect=function(...args){reset.apply(this,args);return clearRect.apply(this,args);};
      proto.fillRect=function(...args){reset.apply(this,args);return fillRect.apply(this,args);};
      proto.fillText=function(text,x,y,maxWidth){
        const m=this.measureText(String(text)),t=this.getTransform();
        const points=[[x-m.actualBoundingBoxLeft,y-m.actualBoundingBoxAscent],[x+m.actualBoundingBoxRight,y-m.actualBoundingBoxDescent]].map(([px,py])=>({x:t.a*px+t.c*py+t.e,y:t.b*px+t.d*py+t.f}));
        const list=window.__labels.get(this.canvas)||[];
        list.push({文字:String(text),左:Math.min(...points.map(p=>p.x)),右:Math.max(...points.map(p=>p.x)),上:Math.min(...points.map(p=>p.y)),下:Math.max(...points.map(p=>p.y)),裁切:points.some(p=>p.x<-1||p.x>this.canvas.width+1||p.y<-1||p.y>this.canvas.height+1)});
        window.__labels.set(this.canvas,list);return maxWidth===undefined?fillText.call(this,text,x,y):fillText.call(this,text,x,y,maxWidth);
      };
    });
    const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
    const row={名稱:`技術比較 ${width} 像素 ${language==='zh'?'繁體中文':'英文'}`,寬度:width,語系:language,呈現:[],鍵盤:[],局部捲動:[]};
    results.案例.push(row);
    await page.goto(new URL(`technology-comparison.html?lang=${language}`,server.base).href,{waitUntil:'load'});
    const regionLabels = await page.locator('#advanced-packaging-simulator-root [role="region"][data-aria-en], #cu-bonding-simulator-root [role="region"][data-aria-en]').evaluateAll((nodes, language) => nodes.map(node => ({實際:node.getAttribute('aria-label'),預期:node.getAttribute(`data-aria-${language}`)})), language);
    assert.equal(regionLabels.length,3,'三個局部圖解捲動區均有語意標籤');
    assert.ok(regionLabels.every(value => value.實際 === value.預期),'初始捲動區名稱使用當前語言');
    assert.ok((await page.locator('#cu-bonding-simulator-root').innerText()).includes(language==='zh'?'工程示意模型':'Engineering Teaching Model'));
    await page.evaluate(language=>window.HubLanguage.set(language,false),language);
    assert.equal(await page.evaluate(()=>{const a=document.getElementById('finfet-gaa-simulator-root'),b=document.getElementById('advanced-packaging-simulator-root');return a.parentElement===b.parentElement&&!a.contains(b);}),true);
    await assertLayout(page,'預設',row);
    for(const mode of ['vol','yield']) {
      await page.locator(`#tco-chart-mode-${mode}`).click();await assertLayout(page,`TCO ${mode==='vol'?'投片':'良品成本'}模式`,row);
      const text=(await canvasState(page)).find(canvas=>canvas.識別碼==='tco-canvas').文字.join('');
      for(const name of ['AntiFuse','ReRAM','eMRAM','eFlash'])assert.ok(text.includes(name),`缺少 ${name} 圖例`);
    }
    await page.locator('#tco-chart-mode-vol').click();
    const sliders=await page.locator(widgets.map(id=>`#${id} input[type=range]`).join(',')).evaluateAll(elements=>elements.map(el=>({id:el.id,value:el.value,min:el.min,max:el.max})));
    for(const slider of sliders) {
      const input=page.locator(`#${slider.id}`);await input.focus();await input.press('Home');assert.equal(Number(await input.inputValue()),Number(slider.min));
      await input.press('ArrowRight');assert.ok(Number(await input.inputValue())>Number(slider.min));
      await input.press('End');assert.equal(Number(await input.inputValue()),Number(slider.max));
      await input.evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},slider.value);row.鍵盤.push(slider.id);
    }
    for(const bound of ['min','max']) {
      await page.locator(widgets.map(id=>`#${id} input[type=range]`).join(',')).evaluateAll((elements,bound)=>elements.forEach(el=>{el.value=el[bound];el.dispatchEvent(new Event('input',{bubbles:true}));}),bound);
      await assertLayout(page,bound==='min'?'滑桿合法下限':'滑桿合法上限',row);
    }
    for(const slider of sliders)await page.locator(`#${slider.id}`).evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},slider.value);
    const cdp=await context.newCDPSession(page);
    for(const id of ['pkg-canvas','cu-canvas-cross','cu-canvas-stress']) {
      const host=page.locator(`#${id}`).locator('..');await host.scrollIntoViewIfNeeded();
      const scrollable=await host.evaluate(el=>el.scrollWidth>el.clientWidth+1);
      if(scrollable) {
        await host.focus();await host.press('ArrowRight');await page.waitForTimeout(100);const keyboard=await host.evaluate(el=>el.scrollLeft);
        await host.evaluate(el=>el.scrollLeft=0);const rect=await host.boundingBox();
        await cdp.send('Input.synthesizeScrollGesture',{x:Math.round(rect.x+rect.width*.75),y:Math.round(rect.y+Math.min(100,rect.height/2)),xDistance:-100,yDistance:0,gestureSourceType:'touch',speed:600});
        const touch=await host.evaluate(el=>el.scrollLeft);assert.ok(keyboard>0&&touch>0,`${id} 局部捲動無法操作`);
        row.局部捲動.push({畫布:id,鍵盤位移:keyboard,合成觸控位移:touch});await host.evaluate(el=>el.scrollLeft=0);
      }
    }
    await cdp.detach();await assertLayout(page,'還原預設與局部捲動',row);
    for(const id of widgets)await page.locator(`#${id}`).screenshot({path:path.join(evidence,`修正-${width}-${language}-${id}.png`)});
    assert.equal(errors.length,0,JSON.stringify(errors));row.通過=true;
    const sramPage=await context.newPage(),sramErrors=[];sramPage.on('pageerror',error=>sramErrors.push(error.message));
    await sramPage.goto(new URL(`sram-repair.html?lang=${language}`,server.base).href,{waitUntil:'load'});
    await sramPage.selectOption('#bira-spare-select','0');
    assert.equal(await sramPage.locator('#bira-base-yield').innerText(),await sramPage.locator('#bira-repaired-yield').innerText());
    assert.equal(await sramPage.locator('#bira-delta-yield').innerText(),'+0%');assert.equal(await sramPage.locator('#bira-wafer-value').innerText(),'+$0');
    await sramPage.locator('#sram-yield-bira-root').screenshot({path:path.join(evidence,`修正-${width}-${language}-零備援.png`)});
    assert.equal(sramErrors.length,0,JSON.stringify(sramErrors));results.案例.push({名稱:`零備援 ${width} 像素 ${language==='zh'?'繁體中文':'英文'}`,通過:true});
    await context.close();console.log(`${row.名稱} 與零備援：通過`);
  }
} catch(error) {
  results.失敗=error.message;console.error(`工具驗證失敗：${error.message}`);process.exitCode=1;
} finally {
  results.通過數=results.案例.filter(row=>row.通過).length;results.總數=results.案例.length;
  fs.writeFileSync(path.join(evidence,'工具修正驗證結果.json'),JSON.stringify(results,null,2)+'\n');
  if(browser)await browser.close();if(server)await server.close();
  console.log(`工具驗證：${results.通過數}/${results.總數} 通過。`);
}
