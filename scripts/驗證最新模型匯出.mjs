import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {calculateBspdnMetrics} from '../bspdn-envm-ir-drop-simulator.js';
import {calculateCpoSiphMetrics} from '../cpo-siph-nvm-simulator.js';
import {calculateDeepSpaceMetrics} from '../deep-space-sel-retention-simulator.js';
const root=path.resolve(import.meta.dirname,'..'),output=path.resolve(root,process.env.NVM_QA_OUTPUT||'qa/後續改善-20261008/最新匯出');
fs.mkdirSync(output,{recursive:true});
const server=await startTestServer(root),origin=new URL(server.base).origin,browser=await chromium.launch({headless:true,...(process.env.NVM_QA_BROWSER==='chromium'?{}:{channel:'msedge'})});
const cases=[
  {name:'背面供電',page:'memory-physics.html',button:'bspdn-export-csv-btn',rows:13,
    read:page=>page.evaluate(()=>({presetKey:document.querySelector('#bspdn-preset-select').value,pulseRiseTime:Number(document.querySelector('#bspdn-rise-slider').value),ambientTemp:Number(document.querySelector('#bspdn-temp-slider').value)})),
    expected:(r,c)=>{const m=calculateBspdnMetrics({...c,peakWriteCurrent:r[0],macroBitCapacity:64});return [r[0],c.pulseRiseTime,c.ambientTemp,Number(m.irDropCurrentMv.toFixed(2)),Number(m.indNoiseCurrentMv.toFixed(2)),Number(m.effectiveVddCurrent.toFixed(4)),Number(m.deltaTCurrent.toFixed(2)),m.irDropSavingPct,Number(m.writeYield.toFixed(2))];}},
  {name:'光子調諧',page:'ai-nvm-opportunities.html',button:'cpo-export-csv-btn',rows:72,
    read:page=>page.evaluate(()=>({presetId:document.querySelector('#cpo-preset-select').value,techId:document.querySelector('#cpo-tech-select').value,channelCount:Number(document.querySelector('#cpo-channel-slider').value)})),
    expected:(r,c)=>{const m=calculateCpoSiphMetrics({...c,ambientTempC:r[0],laserPowerMw:r[1]});return [r[0],r[1],c.channelCount,Number(m.junctionTempC.toFixed(2)),Number(m.wavelengthDriftNm.toFixed(4)),Number(m.savedTuningPowerW.toFixed(2)),Number(m.estimatedRetentionYears.toFixed(2))];}},
  {name:'深空保持',page:'specialty-nvm.html',button:'deep-space-export-csv-btn',rows:56,
    read:page=>page.evaluate(()=>({presetId:document.querySelector('#deep-space-preset-select').value,techId:document.querySelector('#deep-space-tech-select').value,missionYears:Number(document.querySelector('#deep-space-mission-slider').value)})),
    expected:(r,c)=>{const m=calculateDeepSpaceMetrics({...c,targetTempC:r[0],peakLetMev:r[1]});return [r[0],r[1],c.missionYears,m.tech.isImmuneToSel?'YES':'NO',Number(m.selMarginMev.toFixed(1)),Number(m.estimatedRetentionYears.toFixed(2)),Number(m.retentionSurvPct.toFixed(1)),Number(m.tech.activationEnergyEv.toFixed(2))];}}
];
const results=[];
try {
  for(const item of cases) for(const initialLang of ['zh','en']) {
    const context=await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:1000}});
    await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
    const page=await context.newPage(),errors=[],trace=[];page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(10000);
    try {
      await page.goto(`${server.base}${item.page}?lang=${initialLang}`);
      const control=page.locator(`#${item.button}`),initial=await control.innerText();
      await page.locator('#languageToggle').click();
      const current=await control.innerText(),lang=initialLang==='zh'?'en':'zh';
      trace.push({原語言:initialLang,原名稱:initial,目前語言:lang,目前名稱:current});
      assert.match(current,lang==='zh'?/匯出/:/Export/,'動態匯出按鈕必須跟隨目前語言');
      const config=await item.read(page),downloadPromise=page.waitForEvent('download');await control.click();
      const download=await downloadPromise,file=await download.path();
      const csv=fs.readFileSync(file,'utf8').trim().split(/\r?\n/),header=csv.shift().split(','),rows=csv.map(line=>line.split(',').map(x=>x==='YES'||x==='NO'?x:Number(x)));
      assert.equal(rows.length,item.rows,'固定掃描網格保留全部資料列');
      for(const row of rows) {
        assert.equal(row.length,header.length);
        assert.ok(row.every(x=>typeof x==='string'||Number.isFinite(x)),'不能輸出非有限值');
        assert.deepEqual(row,item.expected(row,config),'資料列使用目前條件與原計算器');
      }
      assert.deepEqual(errors,[]);
      fs.copyFileSync(file,path.join(output,`${item.name}-${initialLang}-實際下載.csv`));
      results.push({項目:`${item.name}－${initialLang}切換`,通過:true,列數:rows.length,原下載名稱:download.suggestedFilename(),條件:config,語言軌跡:trace});
    }catch(error){results.push({項目:`${item.name}－${initialLang}切換`,通過:false,原因:error.message,語言軌跡:trace,頁面例外:errors});}
    finally{await context.close();}
  }
}finally{await browser.close();await server.close();}
const report={案例:results.length,通過:results.filter(r=>r.通過).length,結果:results};
fs.writeFileSync(path.join(output,process.argv.includes('--before')?'修正前最新匯出結果.json':'最新匯出結果.json'),JSON.stringify(report,null,2));
console.log(`最新三工具匯出：${report.通過}／${report.案例}`);
if(report.通過!==report.案例){console.log(JSON.stringify(results.filter(r=>!r.通過)));process.exitCode=1;}
