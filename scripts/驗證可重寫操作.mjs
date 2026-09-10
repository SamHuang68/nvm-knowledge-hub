import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {validateRewriteCycle} from './NVM寫抹循環.mjs';

const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'qa/可重寫操作_20260910');
fs.mkdirSync(output,{recursive:true});
const results=[],failures=[],errors=[];
const note=(passed,label,details={})=>{const row={passed:Boolean(passed),label,...details};results.push(row);if(!passed)failures.push(row);};
const datasets=['','英文'].map(suffix=>JSON.parse(fs.readFileSync(path.join(root,`data/NVM知識資料${suffix}.json`),'utf8')));
for(const [index,data] of datasets.entries()){
 const records=[...data.topics.filter(topic=>!['efuse','antifuse'].includes(topic.id)),...data.ipCurriculum.units.filter(unit=>unit.group!=='otp')];
 note(records.length===22,'14 個技術章節與 8 個 IP 具備完整可重寫循環',{language:index?'en':'zh'});
 for(const record of records){
  validateRewriteCycle(record);
  note(record.eraseCycle.sourceIds.every(id=>data.sources.some(source=>source.id===id)),'循環說明引用有效來源',{id:record.id});
  const missing=structuredClone(record);missing.operations=missing.operations.filter(operation=>(operation.operationId||operation.id)!=='erase');
  assert.throws(()=>validateRewriteCycle(missing),/缺少抹除或反向更新/);
  const incomplete=structuredClone(record);incomplete.eraseCycle.verification='';
  assert.throws(()=>validateRewriteCycle(incomplete),/verification/);
 }
 for(const id of ['toggle','stt','sot'])note(data.topics.find(topic=>topic.id===id).eraseCycle.kind==='magnetic','MRAM 保留直接磁態覆寫分類',{id});
 for(const id of ['vcm','ecm'])note(data.topics.find(topic=>topic.id===id).eraseCycle.kind==='resistance','ReRAM 保留 SET／RESET 分類',{id});
 note(data.topics.find(topic=>topic.id==='pcm').eraseCycle.kind==='thermal','PCM 使用熱歷程，不套用反向偏壓模板');
 const sonos=data.topics.find(topic=>topic.id==='sonos');
 note(sonos.eraseCycle.sourceIds.includes('op-pat-nrom-hhi')&&/US6664588B2/.test(sonos.operations.find(operation=>operation.id==='erase').stimulus),'NROM 抹除有獨立具名專利，正文與圖解一致');
 note(data.ipCurriculum.units.filter(unit=>unit.group==='otp').every(unit=>!unit.eraseCycle),'OTP 不被誤加可循環抹除能力');
 const mtpRecords=[data.topics.find(topic=>topic.id==='mtp'),...data.ipCurriculum.units.filter(unit=>unit.group==='mtp')];
 note(mtpRecords.every(record=>/浮動閘極|Floating-Gate/u.test(record.eraseCycle.title)),'PGM／ERS 標題限定浮動閘極教材，不泛化所有可重寫 NVM');
 const ymc=data.ipCurriculum.units.find(unit=>unit.id==='ymc-mtp');
 note(/未證明現行 ymtp 版本採 BBHH|do not establish BBHH for a current ymtp version/u.test(ymc.eraseCycle.limits)&&!/CHI.*BBHH/u.test(ymc.title),'YMC 章名與正文保留未證明商品採 BBHH 的界線');
 const synopsys=data.topics.find(topic=>topic.id==='mtp').implementations.find(item=>item.vendor==='Synopsys');
 note(/已確認支援 PGM|PGM is supported/u.test(synopsys.program)&&/已確認支援電性 ERS|Electrical ERS is supported/u.test(synopsys.erase),'Synopsys 已確認功能與未公開載子路徑分開陳述');
}

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let file;
 try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);res.end();return;}
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}/`;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const [index,language] of ['zh','en'].entries())for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  const data=datasets[index],file=language==='en'?'NVM技術全景.html':'NVM技術全景中文.html';
  await page.goto(new URL(file+'?lang='+language,base).href,{waitUntil:'networkidle'});
  await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  const records=[...data.topics.filter(topic=>topic.eraseCycle).map(topic=>({id:topic.id,panel:'topic-'+topic.id,prefix:'op-'+topic.id})),...data.ipCurriculum.units.filter(unit=>unit.eraseCycle).map(unit=>({id:unit.id,panel:'ip-'+unit.id,prefix:'ip-op-'+unit.id}))];
  for(const record of records){
   await page.evaluate(id=>{location.hash=id;},record.panel);
   await page.waitForFunction(id=>document.getElementById(id)?.checkVisibility(),record.panel);
   const panel=page.locator('#'+record.panel);
   note(await panel.locator('[data-cycle-summary]').isVisible()&&await panel.locator('[data-operation-detail]:visible').count()===3,'進入章節就能閱讀完整三種操作',{language,width,id:record.id});
   for(const operation of ['erase','write','read']){
    await panel.locator(`[data-operation-select="${operation}"]`).click();
    note(await panel.locator('[data-operation-detail]:visible').count()===3&&await page.evaluate(id=>document.activeElement.id===id,record.prefix+'-'+operation),'操作按鈕定位且保留其他操作，焦點同步',{language,width,id:record.id,operation});
   }
   const audit=await panel.evaluate(element=>({overflow:document.documentElement.scrollWidth-innerWidth,clipped:[...element.querySelectorAll('[data-cycle-summary] p,[data-cycle-summary] dd,[data-cycle-summary] h3')].filter(item=>item.scrollWidth>item.clientWidth+2).map(item=>item.textContent),frames:element.querySelector('[data-operation-detail="erase"]').querySelectorAll('.nvm-op-frame').length}));
   note(audit.overflow<=1&&!audit.clipped.length&&audit.frames>=3,'抹除圖格存在，新增正文與行動版無截斷',{language,width,id:record.id,...audit});
   if(language==='en')note(!/[\u3400-\u9fff]/u.test(await panel.locator('[data-cycle-summary]').innerText()),'英文版新增循環說明沒有未翻譯中文',{width,id:record.id});
   if(language==='zh'&&width===1440&&['mtp','sonos','stt','vcm','pcm','ymc-mtp'].includes(record.id))await panel.locator('[data-cycle-summary]').screenshot({path:path.join(output,record.id+'-循環.png'),style:'.nvm-header{visibility:hidden}'});
   if(language==='zh'&&width===390&&record.id==='neomtp')await panel.locator('[data-cycle-summary]').screenshot({path:path.join(output,'NeoMTP-手機循環.png'),style:'.nvm-header{visibility:hidden}'});
  }
  for(const record of records){
   await page.goto(new URL(file+'?lang='+language+'#'+record.prefix+'-erase',base).href,{waitUntil:'domcontentloaded'});
   note(await page.locator('#'+record.prefix+'-erase').isVisible()&&await page.locator('#'+record.panel+' [data-operation-detail]:visible').count()===3,'抹除直達網址與重新載入保留完整操作',{language,width,id:record.id});
  }
  await page.goto(new URL(file+'?lang='+language+'#topic-antifuse',base).href,{waitUntil:'domcontentloaded'});
  note(await page.locator('#topic-antifuse [data-operation-detail]:visible').count()===1&&await page.locator('#topic-antifuse [data-cycle-summary]').count()===0,'OTP 維持原操作切換及不可逆界線',{language,width});
  await page.goto(new URL(file+'?lang='+language+'#ip-op-neoee-erase',base).href,{waitUntil:'domcontentloaded'});
  await page.locator('.language-toggle, #languageToggle').first().click();
  await page.waitForFunction(expected=>document.documentElement.lang===expected,language==='en'?'zh-Hant':'en');
  note(await page.locator('#ip-op-neoee-erase').isVisible()&&await page.locator('#ip-neoee [data-operation-detail]:visible').count()===3&&new URL(page.url()).hash==='#ip-op-neoee-erase','實際語言切換保留 ERS 定位與三種操作',{language,width});
  await context.close();
 }
}catch(error){note(false,'瀏覽器驗證執行完成',{error:error.stack});}
finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
note(errors.length===0,'瀏覽器執行錯誤為零',{errors});
const report={passed:failures.length===0,checkedAt:new Date().toISOString(),checks:results.length,failures,results};
fs.writeFileSync(path.join(output,'可重寫操作查核.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({通過:report.passed,檢查數:report.checks,失敗:failures}));
if(!report.passed)process.exitCode=1;
