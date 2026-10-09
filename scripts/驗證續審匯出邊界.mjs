import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {calculateAdvancedFinfetGaa, FOUNDRY_ADVANCED_NODES} from '../advanced-finfet-gaa-simulator.js';
import {calculateCimAnalogMac} from '../cim-analog-mac-simulator.js';
import {calculatePufReconstruction} from '../puf-reconstruction-simulator.js';
import {calculateVertical3dMetrics} from '../vertical-3d-nvm-simulator.js';

const root=path.resolve(import.meta.dirname,'..');
const output=path.resolve(root,process.env.NVM_QA_OUTPUT||'qa/續審匯出邊界');
fs.mkdirSync(output,{recursive:true});
const selected=process.argv.find(arg=>arg.startsWith('--tool='))?.slice(7);
const selectedLang=process.argv.find(arg=>arg.startsWith('--lang='))?.slice(7);
const tools=['FinFET','類比CiM','PUF','3D'];
assert.ok(!selected||tools.includes(selected),'限定工具必須存在');
assert.ok(!selectedLang||['zh','en'].includes(selectedLang),'限定語言必須存在');
const server=process.env.NVM_QA_BASE?null:await startTestServer(root);
const base=process.env.NVM_QA_BASE||server.base;
const origin=new URL(base).origin;
const results=[];
let browser;
const deadline=setTimeout(()=>void browser?.close(),60000);
const rowsToText=rows=>rows.map(row=>row.map(String).join(','));
async function range(page,id,value){
  await page.locator('#'+id).evaluate((element,next)=>{
    element.value=String(next);element.dispatchEvent(new Event('input',{bubbles:true}));
  },value);
  assert.equal(await page.locator('#'+id).inputValue(),String(value),'指定控制值必須生效');
}
async function geometry(page,button){
  const bounds=await button.evaluate(element=>{
    const r=element.getBoundingClientRect();
    return {左:r.left,右:r.right,高:r.height,頁寬:document.documentElement.scrollWidth,窗寬:innerWidth,內容寬:element.scrollWidth,容器寬:element.clientWidth};
  });
  assert.ok(bounds.左>=-1&&bounds.右<=bounds.窗寬+1&&bounds.頁寬<=bounds.窗寬+1,'匯出按鈕及整頁不得超出視窗');
  assert.ok(bounds.高>=44&&bounds.內容寬<=bounds.容器寬+1,'按鈕保留44px操作高度且文字不截斷');
  return bounds;
}
async function download(page,button,expected,label,key){
  await button.focus();
  const [file]=await Promise.all([page.waitForEvent('download'),button.press(key)]);
  assert.equal(await file.failure(),null,'下載必須完成');
  assert.equal(file.suggestedFilename(),expected.filename,'檔名必須忠實描述教學預設或固定輸入');
  const saved=path.join(output,`${label}.csv`);await file.saveAs(saved);
  const lines=fs.readFileSync(saved,'utf8').trim().split(/\r?\n/);
  assert.equal(lines.shift(),expected.header,'欄位契約一致');
  assert.deepEqual(lines,rowsToText(expected.rows),'逐列沿用目前條件及原計算器的結果');
  assert.ok(lines.length>0&&!lines.some(line=>/undefined|NaN|Infinity/.test(line)),'不得交付空表頭或未定義值');
  return {檔名:file.suggestedFilename(),列數:lines.length};
}
const cases=[
  {
    name:'FinFET',page:'technology-comparison.html',button:'finfet-gaa-export-csv-btn',
    async configure(page){
      await page.locator('#finfet-node-select').selectOption('tsmc_n3_gaa');
      await range(page,'finfet-volt-slider',1.2);await range(page,'finfet-temp-slider',150);
      return {nodeId:'tsmc_n3_gaa'};
    },
    expected(config){
      return {header:'AppliedVolt_V,Temp_C,E1D_MVcm,ECorner_MVcm,VbdPredicted_V,PumpStages,AreaSavings_Pct,JdtTotal_Acm2',
        filename:`FinFET_GAA_電壓與溫度掃描_${FOUNDRY_ADVANCED_NODES[config.nodeId].nameZh}.csv`,
        rows:[0.5,0.65,0.7,0.85,1,1.2].flatMap(appliedVolt=>[25,85,125,150,175].map(tempC=>{
          const {metrics:m}=calculateAdvancedFinfetGaa({...config,appliedVolt,tempC});
          return [appliedVolt.toFixed(2),tempC,m.e1dMvCm.toFixed(2),m.eCornerMvCm.toFixed(2),m.vbdPredicted.toFixed(2),m.stagesCalc,m.areaSavingsPct,m.jdtTotalAcm2.toExponential(4)];
        }))};
    }
  },
  {
    name:'類比CiM',page:'ai-nvm-opportunities.html',button:'cim-analog-export-csv-btn',
    async configure(page){
      await page.locator('#cim-mac-workload-select').selectOption('resnet_conv');
      await page.locator('#cim-mac-device-select').selectOption('mram_stt');
      await page.locator('#cim-mac-adc-select').selectOption('8');
      await range(page,'cim-mac-temp-slider',125);await range(page,'cim-mac-ret-slider',5101);
      return {workloadKey:'resnet_conv',deviceKey:'mram_stt'};
    },
    expected(config){
      return {header:'Workload,Device,AdcBits,Temp_C,RetentionHours,SinadDb,RealizedEnob,AccuracyPct,TopsWatt,AdcSharePct',
        filename:`類比CiM_ADC溫度留存掃描_${config.workloadKey}_${config.deviceKey}.csv`,
        rows:[4,6,8].flatMap(nominalAdcBits=>[25,85,125].flatMap(temperatureC=>[1,24,720,8760].map(retentionHours=>{
          const m=calculateCimAnalogMac({...config,nominalAdcBits,temperatureC,retentionHours,clockFreqMHz:100});
          return [config.workloadKey,config.deviceKey,nominalAdcBits,temperatureC,retentionHours,m.sinadDb.toFixed(2),m.realizedEnob.toFixed(2),m.estimatedAccuracy.toFixed(2),m.macroTopsPerWatt.toFixed(2),m.adcOverheadFraction.toFixed(2)];
        })))};
    }
  },
  {
    name:'PUF',page:'oip-secure-storage.html',button:'puf-export-csv-btn',
    async configure(page){
      await page.locator('#puf-keybits-select').selectOption('128');
      await range(page,'puf-temp-slider',85);await range(page,'puf-age-slider',10);
      await range(page,'puf-ecc-slider',18);
      assert.equal(await page.locator('#puf-export-csv-btn').isEnabled(),true,'ECC18邊界仍可匯出');
      return {eccCapabilityT:18,keyBits:128};
    },
    expected(config){
      return {header:'Temp_C,AgingYears,EccT,KeyBits,RawBerPct,KeyFailRate,HelperBytes,ResidualEntropyBits,StatusGrade',
        filename:`PUF_溫度與老化掃描_${config.keyBits}位元_ECC${config.eccCapabilityT}.csv`,
        rows:[-40,-20,0,25,85,105,125].flatMap(tempC=>[0,2,5,10,15,20].map(agingYears=>{
          const m=calculatePufReconstruction({...config,tempC,agingYears});assert.ok(m.valid);
          return [tempC,agingYears,config.eccCapabilityT,config.keyBits,m.rawBerPct,m.pKeyFailScientific,m.helperDataBytes,m.residualMinEntropy,m.statusGrade];
        }))};
    }
  },
  {
    name:'3D',page:'technology-comparison.html',button:'vert3d-export-csv-btn',
    async configure(page){
      await page.locator('#vert3d-preset-select').selectOption('vert_3d_nor_48l');
      await page.locator('#vert3d-conductor-select').selectOption('tungsten_w_ald');
      await range(page,'vert3d-thickness-slider',35);await range(page,'vert3d-length-slider',80);
      return {presetId:'vert_3d_nor_48l',conductorId:'tungsten_w_ald',metalThicknessNm:35,arrayLengthUm:80};
    },
    expected(config){
      return {header:'TierCount_L,EffectiveResistivity_uOhmCm,WorstDelay_ns,DelaySkew_ns,TotalAccessTime_ns,金屬厚度_nm,陣列長度_um',
        filename:`3D_層數掃描_${config.presetId}_${config.conductorId}_厚度${config.metalThicknessNm}nm_長度${config.arrayLengthUm}um.csv`,
        rows:[32,48,64,96,128,192,256].map(tierCount=>{
          const m=calculateVertical3dMetrics({...config,tierCount});
          return [tierCount,m.effectiveResistivityUohmCm.toFixed(2),m.worstWlDelayNs.toFixed(3),m.tierDelaySkewNs.toFixed(3),m.totalAccessTimeNs.toFixed(2),m.metalThicknessNm,m.arrayLengthUm];
        })};
    }
  }
];
try{
  browser=await chromium.launch({headless:true,...(process.env.NVM_QA_BROWSER==='chromium'?{}:{channel:'msedge'})});
  for(const item of cases.filter(c=>!selected||c.name===selected))for(const language of (selectedLang?[selectedLang]:['zh','en'])){
    const record={項目:item.name,初始語言:language,通過:false,下載:[],頁面例外:[]};results.push(record);
    const context=await browser.newContext({serviceWorkers:'block',acceptDownloads:true,viewport:{width:language==='zh'?390:1440,height:1000}});
    await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
    const page=await context.newPage();page.setDefaultTimeout(7000);page.setDefaultNavigationTimeout(10000);
    page.on('pageerror',error=>record.頁面例外.push(error.message));
    let downloadEvents=0;page.on('download',()=>downloadEvents++);
    try{
      await page.goto(`${base}${item.page}?lang=${language}`,{waitUntil:'domcontentloaded'});
      const button=page.locator('#'+item.button);
      const config=await item.configure(page);
      assert.match(await button.innerText(),language==='zh'?/匯出/:/Export/,'初始按鈕語言必須正確');
      if(item.name==='PUF'){
        for(const ecc of [19,20,21,22]){
          await range(page,'puf-ecc-slider',ecc);
          assert.equal(await button.isDisabled(),true,'ECC19–22不得下載沒有估算資料的CSV');
          assert.equal(await button.getAttribute('aria-describedby'),'puf-verdict-summary');
          assert.ok((await page.locator('#puf-verdict-summary').innerText()).includes('128'));
          // 合成事件只檢查守門，不能把停用按鈕當作使用者可操作。
          await button.dispatchEvent('click');
        }
      }
      await page.locator('#languageToggle').click();
      const nextLanguage=language==='zh'?'en':'zh';
      assert.match(await button.innerText(),nextLanguage==='zh'?/匯出/:/Export/,'按鈕必須跟隨網站語言事件');
      assert.match(await button.getAttribute('aria-label'),nextLanguage==='zh'?/匯出/:/Export|export/,'可及名稱必須同步');
      if(item.name==='PUF'){
        assert.equal(await button.isDisabled(),true,'語言切換不應啟用無效匯出');
        assert.match(await button.innerText(),nextLanguage==='zh'?/超出模型/:/Outside Model/);
        await button.evaluate(async el=>{el.scrollIntoView({block:'center',behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
        await geometry(page,button);
        await button.locator('..').screenshot({path:path.join(output,`PUF-${language}-無效狀態.png`)});
        assert.equal(downloadEvents,0,'無效條件不能產生下載');
        await range(page,'puf-ecc-slider',config.eccCapabilityT);
        assert.equal(await button.isEnabled(),true,'回到有效邊界必須恢復匯出');
        assert.equal(await button.getAttribute('aria-describedby'),null,'恢復有效時移除無效原因關聯');
      }
      await button.evaluate(async el=>{el.scrollIntoView({block:'center',behavior:'instant'});await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
      record.按鈕幾何=await geometry(page,button);
      await button.locator('..').screenshot({path:path.join(output,`${item.name}-${language}-控制區.png`)});
      record.下載.push(await download(page,button,item.expected(config),`${item.name}-${language}`,language==='zh'?'Enter':'Space'));
      if(item.name==='3D'){
        await range(page,'vert3d-thickness-slider',45);await range(page,'vert3d-length-slider',140);
        const other={...config,metalThicknessNm:45,arrayLengthUm:140};
        record.下載.push(await download(page,button,item.expected(other),`${item.name}-${language}-另一條件`,'Enter'));
        assert.notEqual(record.下載[0].檔名,record.下載[1].檔名,'不同固定條件的檔名不得相同');
      }
      assert.equal(downloadEvents,record.下載.length,'下載數量符合有效操作次數');
      assert.deepEqual(record.頁面例外,[],'頁面不能丟出例外');record.通過=true;
    }catch(error){record.原因=error.message;process.exitCode=1;}
    finally{await context.close();}
  }
}finally{
  clearTimeout(deadline);await browser?.close();await server?.close();
  const report={通過:results.filter(r=>r.通過).length,總數:results.length,下載:results.flatMap(r=>r.下載).length,資料列:results.flatMap(r=>r.下載).reduce((sum,d)=>sum+d.列數,0),結果:results};
  fs.writeFileSync(path.join(output,`續審匯出結果${selected?'-'+selected:''}${selectedLang?'-'+selectedLang:''}.json`),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({通過:report.通過,總數:report.總數,下載:report.下載,資料列:report.資料列}));
}
