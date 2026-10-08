import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {calculateAdvancedFinfetGaa, FOUNDRY_ADVANCED_NODES} from '../advanced-finfet-gaa-simulator.js';
import {startTestServer} from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'qa', '持續收斂-進階節點模型');
const results = [];

// 在文案修改前擷取原函式的十二組結果；預期值不由受測公式重算。
const baseline = [
  {
    鍵: 'tsmc_n3_gaa',
    預設: {id:'tsmc_n3_gaa',archType:'gaa',eotNm:1.15,tphysNm:2.1,dielectricK:22,rcCornerNm:1.2,cornerEnhanceFactor:1.22,vddNominal:0.7,vbdBase:3.95,vreadNominal:0.6,barrierHeightEv:2.1,pumpStages:2,footprintRel:0.28},
    固定指標: {archType:'gaa',eotNm:1.15,tphysNm:2.1,dielectricK:22,rcCornerNm:1.2,cornerEnhanceFactor:1.22,vbdPredicted:2.84,vprogTarget:3.2659999999999996,stagesCalc:6,areaRatio:0.28,areaSavingsPct:72,vddNominal:0.7},
    案例: [
      {電壓:0.7,溫度:125,電場:3.3333333333333326,角隅電場:4.0666666666666655,漏電:37012.35440173538},
      {電壓:3.95,溫度:25,電場:18.80952380952381,角隅電場:22.94761904761905,漏電:9756.350695222467},
      {電壓:0.4,溫度:175,電場:1.9047619047619047,角隅電場:2.3238095238095235,漏電:22335.553960795292},
    ],
  },
  {
    鍵: 'tsmc_n5_finfet',
    預設: {id:'tsmc_n5_finfet',archType:'finfet',eotNm:1.5,tphysNm:2.6,dielectricK:20.5,rcCornerNm:1.8,cornerEnhanceFactor:1.28,vddNominal:0.75,vbdBase:4.85,vreadNominal:0.7,barrierHeightEv:2.2,pumpStages:3,footprintRel:0.42},
    固定指標: {archType:'finfet',eotNm:1.5,tphysNm:2.6,dielectricK:20.5,rcCornerNm:1.8,cornerEnhanceFactor:1.28,vbdPredicted:3.35,vprogTarget:3.8524999999999996,stagesCalc:7,areaRatio:0.42,areaSavingsPct:58,vddNominal:0.75},
    案例: [
      {電壓:0.75,溫度:125,電場:2.8846153846153846,角隅電場:3.6923076923076925,漏電:15556.667356873397},
      {電壓:4.85,溫度:25,電場:18.653846153846153,角隅電場:23.876923076923077,漏電:9756.350695222467},
      {電壓:0.4,溫度:175,電場:1.5384615384615385,角隅電場:1.9692307692307693,漏電:7493.77207567625},
    ],
  },
  {
    鍵: 'foundry_16ffc',
    預設: {id:'foundry_16ffc',archType:'finfet',eotNm:2,tphysNm:3.2,dielectricK:18,rcCornerNm:2.5,cornerEnhanceFactor:1.2,vddNominal:0.85,vbdBase:5.8,vreadNominal:0.8,barrierHeightEv:2.4,pumpStages:4,footprintRel:0.65},
    固定指標: {archType:'finfet',eotNm:2,tphysNm:3.2,dielectricK:18,rcCornerNm:2.5,cornerEnhanceFactor:1.2,vbdPredicted:4.4,vprogTarget:5.06,stagesCalc:8,areaRatio:0.65,areaSavingsPct:35,vddNominal:0.85},
    案例: [
      {電壓:0.85,溫度:125,電場:2.6562499999999996,角隅電場:3.1874999999999996,漏電:5711.826279413682},
      {電壓:5.8,溫度:25,電場:18.124999999999996,角隅電場:21.749999999999996,漏電:9756.350695222467},
      {電壓:0.4,溫度:175,電場:1.2499999999999998,角隅電場:1.4999999999999998,漏電:1993.303977094281},
    ],
  },
  {
    鍵: 'planar_28hpc',
    預設: {id:'planar_28hpc',archType:'planar',eotNm:2.6,tphysNm:3.8,dielectricK:16,rcCornerNm:999,cornerEnhanceFactor:1,vddNominal:0.9,vbdBase:7.2,vreadNominal:0.85,barrierHeightEv:2.6,pumpStages:5,footprintRel:1},
    固定指標: {archType:'planar',eotNm:2.6,tphysNm:3.8,dielectricK:16,rcCornerNm:999,cornerEnhanceFactor:1,vbdPredicted:6.27,vprogTarget:7.210499999999999,stagesCalc:10,areaRatio:1,areaSavingsPct:0,vddNominal:0.9},
    案例: [
      {電壓:0.9,溫度:125,電場:2.3684210526315788,角隅電場:2.3684210526315788,漏電:1821.3702281201115},
      {電壓:7.2,溫度:25,電場:18.94736842105263,角隅電場:18.94736842105263,漏電:9756.350695222467},
      {電壓:0.4,溫度:175,電場:1.0526315789473684,角隅電場:1.0526315789473684,漏電:536.1241786290304},
    ],
  },
];
const originalIds = ['finfet-gaa-simulator-root','finfet-sim-title','finfet-node-select','finfet-volt-slider','finfet-volt-val','finfet-temp-slider','finfet-temp-val','finfet-e1d-val','finfet-ecorner-val','finfet-vbd-val','finfet-pump-stages-val','finfet-area-savings-val','finfet-jdt-val','finfet-canvas','finfet-verdict-banner'];
const oldClaims = [/without I\/O device breakdown risk/i,/徹底免除周邊高壓破壞風險/,/proven 15-year zero-disturb qualification/i,/15 年零讀取擾動量產實績/,/qualified for automotive Grade 0/i,/fully overcoming the 28nm planar scaling barrier/i,/徹底突破 eFlash 停滯於 28nm/,/physical proof for AntiFuse scaling/i,/3nm GAA/i,/N3E\s*\/\s*N2\s*GAA/i];
function checkClaims(text, name) {
  for (const claim of oldClaims) assert.equal(claim.test(text),false,`${name}不殘留未經證據支持的舊主張：${claim}`);
}
async function record(name, verify) {
  try {const evidence=await verify();results.push({項目:name,通過:true,...(evidence?{狀態:evidence}:{})});}
  catch (error) {results.push({項目:name,通過:false,原因:error.message});}
}
await record('保留四個原始場景鍵', () => assert.deepEqual(Object.keys(FOUNDRY_ADVANCED_NODES),baseline.map(value=>value.鍵)));
for (const fixture of baseline) {
  await record(`${fixture.鍵} 預設數值與識別不變`, () => {
    const node = FOUNDRY_ADVANCED_NODES[fixture.鍵];
    const nonCopy = Object.fromEntries(Object.entries(node).filter(([key])=>!['nameEn','nameZh','descriptionEn','descriptionZh'].includes(key)));
    assert.deepEqual(nonCopy,fixture.預設);
  });
  for (const scenario of fixture.案例) await record(`${fixture.鍵}／${scenario.電壓}V／${scenario.溫度}°C 計算基準`, () => {
    const inputs = {nodeId:fixture.鍵,appliedVolt:scenario.電壓,tempC:scenario.溫度};
    const value = calculateAdvancedFinfetGaa(inputs);
    assert.deepEqual(value.inputs,inputs);
    assert.deepEqual(value.metrics,{...fixture.固定指標,e1dMvCm:scenario.電場,eCornerMvCm:scenario.角隅電場,jdtTotalAcm2:scenario.漏電});
  });
  await record(`${fixture.鍵} 教學名稱與模型邊界`, () => {
    const node = FOUNDRY_ADVANCED_NODES[fixture.鍵];
    assert.match(node.nameZh,/教學預設/);
    assert.match(node.nameEn,/Teaching Preset/i);
    if (node.archType==='gaa') {
      assert.match(node.nameZh,/GAA.*N2/);
      assert.match(node.nameEn,/GAA.*N2/i);
      assert.doesNotMatch(`${node.nameZh} ${node.nameEn}`,/N3E/i);
    }
    checkClaims(`${node.descriptionZh} ${node.descriptionEn}`,fixture.鍵);
    for (const scenario of fixture.案例) {
      const value=calculateAdvancedFinfetGaa({nodeId:fixture.鍵,appliedVolt:scenario.電壓,tempC:scenario.溫度});
      checkClaims(`${value.verdict.zh} ${value.verdict.en}`,fixture.鍵);
      assert.match(value.verdict.zh,/教學|示意|假設/);
      assert.match(value.verdict.en,/illustrative|teaching|assum/i);
    }
  });
}

fs.mkdirSync(output,{recursive:true});
const server=await startTestServer(root);
const browser=await chromium.launch({channel:'msedge'});
async function verifyPanel(page,language,nodeId) {
  const panel=page.locator('#finfet-gaa-simulator-root');
  const text=await panel.innerText();
  assert.match(text,language==='zh'?/教學|示意/:/illustrative|teaching/i);
  assert.match(text,language==='zh'?/未.*校準|尚未校準|非.*實測/:/uncalibrated|not.*calibrat|not.*measured/i);
  assert.match(text,language==='zh'?/不能.*保證|不.*保證|不.*認證|不能.*認證|不.*量產|不能.*量產/:/does not|cannot|not.*certif|not.*qualif/i);
  checkClaims(text,`${language} 畫面`);
  const areaText=await page.locator('#finfet-area-savings-val').locator('..').innerText();
  assert.match(areaText,language==='zh'?/假設/:/assum/i);
  const links=await panel.locator('a[href]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
  assert.ok(links.some(href=>/memory-evidence\.html#|https:\/\/(?:[^/]+\.)?(?:tsmc\.com|samsung\.com)\//i.test(href)),'模型提供既有證據或一級來源連結');
  const selected=await page.locator('#finfet-node-select').evaluate(node=>node.selectedOptions[0].textContent);
  assert.match(selected,/教學預設|Teaching Preset/i);
  if (nodeId==='tsmc_n3_gaa') {assert.match(selected,/GAA.*N2/i);assert.doesNotMatch(selected,/N3E/i);}
  const inputs=await panel.evaluate(node=>({nodeId:node.querySelector('#finfet-node-select').value,appliedVolt:Number(node.querySelector('#finfet-volt-slider').value),tempC:Number(node.querySelector('#finfet-temp-slider').value)}));
  const value=calculateAdvancedFinfetGaa(inputs);
  assert.equal(inputs.nodeId,nodeId);
  const numbers=await panel.evaluate(node=>Object.fromEntries(['finfet-e1d-val','finfet-ecorner-val','finfet-vbd-val','finfet-area-savings-val','finfet-jdt-val'].map(id=>[id,node.querySelector('#'+id).textContent])));
  assert.equal(numbers['finfet-e1d-val'],`${value.metrics.e1dMvCm.toFixed(2)} MV/cm`);
  assert.equal(numbers['finfet-ecorner-val'],`${value.metrics.eCornerMvCm.toFixed(2)} MV/cm`);
  assert.equal(numbers['finfet-vbd-val'],`${value.metrics.vbdPredicted.toFixed(2)} V`);
  assert.equal(parseFloat(numbers['finfet-area-savings-val']),-value.metrics.areaSavingsPct);
  assert.equal(numbers['finfet-jdt-val'],`${value.metrics.jdtTotalAcm2.toExponential(2)} A/cm²`);
  const verdict=await page.locator('#finfet-verdict-banner').innerText();
  assert.ok(verdict.includes(language==='zh'?value.verdict.zh:value.verdict.en),'動態結論沿用同一計算來源與語言');
  assert.equal(await panel.locator(`[data-lang=${language==='zh'?'en':'zh'}]:visible`).count(),0,'另一語言文字不可見');
  const canvasText=await page.evaluate(()=>window.進階畫布文字.join(''));
  assert.ok(canvasText.length>0,'畫布仍繪製模型資料');
  checkClaims(canvasText,`${language} 畫布`);
  assert.match(canvasText,language==='zh'?/假設|示意/:/assum|illustrative/i);
  return {節點:nodeId,語言:language,選項:selected,數值:numbers};
}
try {
  for (const language of ['zh','en']) for (const width of [320,1440]) {
    await record(`${language}／${width}px 標籤與動態切換`,async()=>{
      const context=await browser.newContext({serviceWorkers:'block',viewport:{width,height:1000},reducedMotion:'reduce'});
      await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(server.base).origin?route.continue():route.abort());
      await context.addInitScript(()=>{
        window.進階畫布文字=[];
        const original=CanvasRenderingContext2D.prototype.fillText;
        CanvasRenderingContext2D.prototype.fillText=function(text,...args){if(this.canvas.id==='finfet-canvas')window.進階畫布文字.push(String(text));return original.call(this,text,...args);};
      });
      const page=await context.newPage(),errors=[],states=[];
      page.on('pageerror',error=>errors.push(error.message));
      try {
        await page.goto(new URL(`technology-comparison.html?lang=${language}#finfet-gaa-simulator-root`,server.base).href,{waitUntil:'load'});
        const panel=page.locator('#finfet-gaa-simulator-root');
        await panel.scrollIntoViewIfNeeded();
        for (const id of originalIds) assert.equal(await page.locator('#'+id).count(),1,`保留原識別：${id}`);
        assert.deepEqual(await page.locator('#finfet-node-select option').evaluateAll(nodes=>nodes.map(node=>node.value)),baseline.map(value=>value.鍵));
        for (const fixture of baseline) {
          await page.evaluate(()=>{window.進階畫布文字=[];});
          await page.locator('#finfet-node-select').selectOption(fixture.鍵);
          states.push(await verifyPanel(page,language,fixture.鍵));
        }
        const before=await page.locator('#finfet-e1d-val').innerText();
        await page.locator('#finfet-volt-slider').press('End');
        await page.locator('#finfet-temp-slider').press('End');
        assert.notEqual(await page.locator('#finfet-e1d-val').innerText(),before,'鍵盤調整偏壓會更新計算');
        states.push(await verifyPanel(page,language,'planar_28hpc'));
        const other=language==='zh'?'en':'zh';
        await page.evaluate(value=>{window.進階畫布文字=[];window.HubLanguage.set(value);},other);
        await page.waitForFunction(value=>document.documentElement.lang===(value==='zh'?'zh-Hant':'en'),other);
        states.push(await verifyPanel(page,other,'planar_28hpc'));
        await page.evaluate(value=>{window.進階畫布文字=[];window.HubLanguage.set(value);},language);
        await page.waitForFunction(value=>document.documentElement.lang===(value==='zh'?'zh-Hant':'en'),language);
        await page.locator('#finfet-node-select').selectOption('tsmc_n3_gaa');
        states.push(await verifyPanel(page,language,'tsmc_n3_gaa'));
        const box=await panel.boundingBox();
        const controls=await panel.locator('input,select').evaluateAll(nodes=>nodes.map(node=>({左:node.getBoundingClientRect().left,右:node.getBoundingClientRect().right})));
        assert.ok(controls.every(value=>value.左>=0&&value.右<=width+1&&value.左>=box.x&&value.右<=box.x+box.width+1),'控制項位於視窗及所屬容器內');
        assert.deepEqual(errors,[]);
        await panel.screenshot({path:path.join(output,`${language==='zh'?'繁中':'英文'}-${width}-進階節點.png`)});
        return states;
      } finally {await context.close();}
    });
  }
} finally {
  fs.writeFileSync(path.join(output,'驗證結果.json'),JSON.stringify({瀏覽器:browser.version(),結果:results,限制:'僅驗證既有公式數值不變、模型文案與介面操作；外部請求已阻擋，未進行晶片量測或認證測試。'},null,2));
  await browser.close();await server.close();
}
console.log(JSON.stringify({項目:results.length,通過:results.filter(value=>value.通過).length,失敗:results.filter(value=>!value.通過)},null,2));
if(results.some(value=>!value.通過))process.exitCode=1;
