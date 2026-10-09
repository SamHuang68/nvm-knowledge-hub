import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

// 僅檢查四個受影響頁面；不執行純函式、剪貼簿或匯出矩陣。
const root=path.resolve(import.meta.dirname,'..');
const output=path.resolve(root,process.env.NVM_QA_OUTPUT || 'qa/資料來源與模型判讀');
fs.mkdirSync(output,{recursive:true});
const selectedPage=process.env.NVM_QA_PAGE;
assert.ok(!selectedPage || ['圖譜','安全','特種製程','白皮書'].includes(selectedPage),'指定頁面須在既有四頁範圍內');
const expectedCases=selectedPage?2:8;
const results=[],started=Date.now();
let server,browser,base,expired=false;
const reportPath=path.join(output,'資料來源與模型判讀結果.json');
function report() {
  const data={範圍:`1.2.7 ${selectedPage || '四頁'}資料來源與模型判讀局部驗證`,案例:expectedCases,通過:results.filter(r=>r.通過).length,
    錯誤:results.filter(r=>!r.通過).map(r=>({項目:r.項目,原因:r.錯誤 || '未完成',頁面例外:r.頁面例外})),
    目標:base,逾時:expired,耗時秒:Number(((Date.now()-started)/1000).toFixed(2)),結果:results};
  fs.writeFileSync(reportPath,JSON.stringify(data,null,2)+'\n');
  return data;
}
const shutdown=setTimeout(()=>{expired=true;void browser?.close().catch(()=>{});},88000);
const hardLimit=setTimeout(()=>{expired=true;report();console.error('資料來源與模型判讀已達 90 秒上限。');process.exit(1);},90000);
async function checkText(locator,record,label,required=[],forbidden=[]) {
  await locator.waitFor({state:'visible'});
  const text=(await locator.innerText()).trim();
  record.實際檢查文字.push({項目:label,文字:text});
  assert.ok(text,`${label} 不得空白`);
  for(const pattern of required) assert.match(text,pattern,`${label} 缺少必要資料或界線`);
  for(const pattern of forbidden) assert.doesNotMatch(text,pattern,`${label} 仍出現已撤下主張`);
  return text;
}
async function screenshot(page,selector,record,label) {
  const filename=`${record.類別}-${record.語言}-${label}.png`;
  await page.locator(selector).screenshot({path:path.join(output,filename),timeout:7000});
  record.截圖.push(filename);
}
async function setRange(page,id,value) {
  await page.locator(`#${id}`).evaluate((element,next)=>{
    element.value=String(next);element.dispatchEvent(new Event('input',{bubbles:true}));
  },value);
}
async function switchLanguage(page,language) {
  await page.locator('#languageToggle').click();
  await page.waitForFunction(lang=>window.HubLanguage?.get()===lang,language);
}
async function atlas(page,record) {
  const zh=record.語言==='zh';
  await page.waitForFunction(()=>document.documentElement.classList.contains('nvm-enhanced'));
  await checkText(page.locator('#milestone-INTC-2019'),record,'Intel 18.1 研究展示',[/18\.1/,/2018/,/7\.2\s?Mbit/,zh?/研究/:/research/i]);
  await checkText(page.locator('#milestone-INTC-2019 .nvm-maturity-limit'),record,'Intel 生產就緒界線',[zh?/不作.*生產就緒/:/not proof of.*production readiness/i]);
  await checkText(page.locator('#milestone-SEC-2024'),record,'Samsung GAA 邏輯背景',[zh?/邏輯/:/logic/i,zh?/不.*eMRAM|未.*eMRAM/:/not evidence.*eMRAM/i]);
  const samsung=page.locator('#foundry .nvm-benchmark').filter({has:page.locator('h4').filter({hasText:'14LPU'})});
  assert.equal(await samsung.count(),1,'14LPU 性能段落唯一');
  await checkText(samsung,record,'Samsung 14LPU 現況與 5nm 計畫',[/14LPU/,/8LPU/,/5nm/,zh?/規畫|計畫/:/plan/i,/FinFET/]);
  await checkText(page.locator('#milestone-INTC-2024'),record,'Intel 18A 範圍',[/18A/,zh?/邏輯/:/logic/i,zh?/未建立特定/:/establishes no/i],[/native\s+(?:AntiFuse|OTP)/i,/原生\s*(?:AntiFuse|OTP)/]);
  await screenshot(page,'#milestone-INTC-2019',record,'Intel研究');
  // 產業來源透過既有章節路由呈現，不以全頁搜尋取代來源條目。
  await page.evaluate(()=>{location.hash='company-everspin-plp-sttmram';});
  const industrial=page.locator('#company-everspin-plp-sttmram');
  await checkText(industrial,record,'Everspin 產業研究界線',[/Everspin/,zh?/12nm.*(?:不|未)|(?:不|未).*12nm|共同開發/:/12nm|joint development/i]);
}
async function security(page,record) {
  const zh=record.語言==='zh',puf=page.locator('#puf-nist-evaluator-root');
  await checkText(puf.locator('.simulation-disclaimer-banner'),record,'PUF 統計界線',[/SP 800-90B/,zh?/不等同|不能/:/not an|does not/i]);
  const inspectPuf=async label=>checkText(page.locator('#puf-verdict-banner'),record,label,
    [zh?/教學樣本/:/Illustrative Sample/,zh?/不能/:/do not|does not/i],[/NIST Certified|FIPS Certified|通過 NIST 認證|已取得.*認證/i]);
  await inspectPuf('PUF 初始結果');
  // 只重採樣一次；觀察 DOM 更新，不要求隨機樣本碰巧命中特定分支。
  await page.evaluate(()=>{
    window.統計更新次數=0;
    window.統計更新觀察器=new MutationObserver(()=>window.統計更新次數++);
    window.統計更新觀察器.observe(document.querySelector('#puf-verdict-banner'),{childList:true,subtree:true});
  });
  await page.locator('#puf-resample-btn').click();
  await page.waitForFunction(()=>window.統計更新次數>0);
  await inspectPuf('PUF 一次重採樣');
  await page.locator('#puf-preset-select').selectOption('degraded_biased_source');
  assert.equal(await page.locator('#puf-preset-select').inputValue(),'degraded_biased_source');
  await inspectPuf('PUF 有偏樣本');
  await checkText(page.locator('#puf-hw-val'),record,'有偏樣本漢明權重',[/\d/]);
  await page.evaluate(()=>window.統計更新觀察器.disconnect());
  await screenshot(page,'#puf-nist-evaluator-root',record,'PUF統計');
  const presets=await page.locator('#pqc-preset-select option').evaluateAll(nodes=>nodes.map(e=>e.value));
  assert.equal(presets.length,4,'PQC 保留四個預設');
  for(const preset of presets) {
    await page.locator('#pqc-preset-select').selectOption(preset);
    await checkText(page.locator('#pqc-verdict-banner'),record,`PQC 預設 ${preset}`,
      [zh?/模型|教學|示意/:/model|illustrative|teaching/i,zh?/不代表|不構成|不能/:/does not|do not|not .*certif/i],
      [/Top Security:|Automotive Security:|ASIL-D Compliant|PSA Certified Level 2|最高安全評定|車規安全評定/i]);
  }
  const verdictBody=page.locator('#pqc-verdict-banner > div').nth(1);
  assert.equal(await verdictBody.evaluate(node=>getComputedStyle(node).color),'rgb(51, 65, 85)','模型限制說明使用可讀的深色文字');
  await screenshot(page,'#pqc-dpa-simulator-root',record,'PQC判讀');
}
async function specialty(page,record) {
  let lang=record.語言;
  const pFusion=page.locator('a[href="https://www.chingistek.com"]:visible').first().locator('xpath=ancestor::div[2]');
  await checkText(pFusion,record,'pFusion 文件界線',[lang==='zh'?/未取得.*核實|待核實/:/not obtained|unverified/i],[/BBHH|P-Channel|微安培/i]);
  const silvo=page.locator('a[href="https://www.iotmemory.com/en/technology/4"]:visible').filter({hasText:'iotmemory.com'}).first().locator('xpath=ancestor::div[2]');
  await checkText(silvo,record,'SilvoFlash 公開結構與採用界線',
    [/Vdd/,lang==='zh'?/浮閘/:/floating.gate/i,lang==='zh'?/未確認 DDR5 SPD 採用或量產/:/does not establish DDR5 SPD adoption or volume production/i],
    [/40\s?nm|0\.9\s?[–-]\s?1\.2\s?V|single.poly/i]);
  const techs=await page.locator('#deep-space-tech-select option').evaluateAll(nodes=>nodes.map(e=>e.value));
  assert.equal(techs.length,4,'深空保留四種技術');
  const observe=async label=>{
    await checkText(page.locator('#deep-space-out-rating'),record,`${label} 分類`,[lang==='zh'?/模型/:/model/i],[/NASA|Certified|合格|認證/i]);
    await checkText(page.locator('#deep-space-out-verdict'),record,`${label} 判讀`,
      [lang==='zh'?/模型|教學|假設/:/model|teaching|assum/i,lang==='zh'?/不代表|不構成/:/does not|do not/i],[/NASA Class.S Certified/i]);
    await checkText(page.locator('#deep-space-out-sel'),record,`${label} SEL`,[lang==='zh'?/模型|假設|MeV margin/:/model|assum|MeV margin/i],[/immune|certified/i]);
  };
  for(const tech of techs) {
    await page.locator('#deep-space-tech-select').selectOption(tech);
    for(const temperature of [125,460]) {
      await setRange(page,'deep-space-temp-slider',temperature);
      await observe(`${tech} ${temperature}°C`);
    }
  }
  await screenshot(page,'#deep-space-simulator-root',record,'深空模型');
  lang=lang==='zh'?'en':'zh';
  await switchLanguage(page,lang);
  await observe('切換語言後');
}
async function whitepaper(page,record) {
  await page.locator('.view-tab[data-view="selector"]').click();
  const row=page.locator('#decision-body tr[data-profile-id="hbm4_logic_base_die_repair"]');
  await checkText(row,record,'HBM4 標準編號',[/HBM4/,/JESD270-4/],[/JESD238/]);
  await row.screenshot({path:path.join(output,`白皮書-${record.語言}-HBM4.png`),timeout:7000});
  record.截圖.push(`白皮書-${record.語言}-HBM4.png`);
}
const pages=[
  {name:'圖譜',file:lang=>lang==='zh'?'nvm-technology-atlas-zh.html':'nvm-technology-atlas.html',hash:'#foundry',run:atlas},
  {name:'安全',file:()=> 'security-assurance.html',run:security},
  {name:'特種製程',file:()=> 'specialty-nvm.html',run:specialty},
  {name:'白皮書',file:()=> 'whitepaper/index.html',run:whitepaper}
];
try {
  if(process.env.NVM_QA_BASE) {
    const url=new URL(process.env.NVM_QA_BASE);
    assert.ok(['http:','https:'].includes(url.protocol)&&url.pathname.endsWith('/')&&!url.search&&!url.hash,'基底網址須為以 / 結尾的 HTTP(S) 網址');base=url.href;
  } else {server=await startTestServer(root);base=server.base;}
  browser=await chromium.launch({headless:true,timeout:7000,...(process.env.NVM_QA_BROWSER==='chromium'?{}:{channel:'msedge'})});
  for(const [lang,width] of [['zh',390],['en',1440]]) for(const target of pages.filter(p=>!selectedPage||p.name===selectedPage)) {
    const record={項目:`${target.name} ${lang} ${width}`,類別:target.name,語言:lang,寬度:width,通過:false,實際檢查文字:[],頁面例外:[],截圖:[]};
    results.push(record);
    if(expired){record.錯誤='已達總執行上限';continue;}
    let context;
    try {
      context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});
      await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
      const page=await context.newPage();page.setDefaultTimeout(7000);page.setDefaultNavigationTimeout(7000);
      page.on('pageerror',e=>record.頁面例外.push(e.message));
      const response=await page.goto(`${base}${target.file(lang)}?lang=${lang}${target.hash || ''}`,{waitUntil:'domcontentloaded'});
      assert.ok(response?.ok(),'頁面 HTTP 回應成功');
      await target.run(page,record);
      assert.deepEqual(record.頁面例外,[],'頁面不得有未處理例外');record.通過=true;
    } catch(error) {record.錯誤=error.message;record.錯誤類型=error.name;}
    finally {await context?.close().catch(e=>{record.通過=false;record.關閉錯誤=e.message;});report();}
  }
} catch(error) {results.push({項目:'驗證入口',通過:false,錯誤:error.message,頁面例外:[]});}
finally {
  await browser?.close().catch(()=>{});await server?.close().catch(()=>{});
  clearTimeout(shutdown);clearTimeout(hardLimit);const result=report();
  console.log(`資料來源與模型判讀：${result.通過}／${expectedCases}；證據：${reportPath}`);
  if(expired||results.length!==expectedCases||results.some(r=>!r.通過))process.exitCode=1;
}
