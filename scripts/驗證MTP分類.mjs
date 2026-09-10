import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'qa/MTP分類拆分_20260910');
fs.mkdirSync(output,{recursive:true});
const base=process.env.NVM_QA_BASE||'http://127.0.0.1:8765/';
const data=JSON.parse(fs.readFileSync(path.join(root,'data/NVM知識資料英文.json'),'utf8'));
const results=[],failures=[],errors=[];
const note=(passed,label,details={})=>{const item={passed:Boolean(passed),label,...details};results.push(item);if(!passed)failures.push(item);};
const eeprom=data.topics.find(topic=>topic.id==='eeprom'),mtp=data.topics.find(topic=>topic.id==='mtp');
note(data.topics.length===16&&eeprom&&mtp,'獨立式 EEPROM 與 MTP IP 分成兩個正式專題');
note(/standalone/i.test(eeprom.title)&&!eeprom.patents.some(patent=>patent.id==='US5844271A'),'EEPROM 主題保留成品邊界，單層多晶矽專利移至 MTP');
note(mtp.integrationRoutes.length===2&&mtp.integrationRoutes.map(route=>route.id).sort().join(',')==='foundry-double-poly,third-party-single-poly','MTP 具備 foundry 雙層與第三方單層兩條整合路徑');
note(mtp.patents.some(patent=>patent.id==='US5844271A')&&!mtp.patents.some(patent=>patent.id==='US4115914A'),'專利單一歸屬保留穩定深層連結');
note(mtp.implementations.length>=3,'MTP 以具名 IP 比較層數、儲存與寫抹機制');
note(data.engineering.operations.filter(study=>study.topicId==='mtp').length===3,'MTP 三種操作都有圖解');
for(const study of data.engineering.operations.filter(study=>['mtp','eeprom'].includes(study.topicId))){
 note(study.variants.length===(study.topicId==='mtp'?2:1),'操作變體隨分類拆分',{topic:study.topicId,operation:study.operationId});
}
const browser=await chromium.launch({headless:true});
try{
 for(const language of ['en','zh'])for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1100},reducedMotion:'reduce'});
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  const file=language==='en'?'NVM技術全景.html':'NVM技術全景中文.html';
  for(const topic of ['eeprom','mtp'])for(const operation of ['write','erase','read']){
   await page.goto(base+file+`?lang=${language}#op-${topic}-${operation}`,{waitUntil:'networkidle'});
   await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
   const state=await page.evaluate(({topic,operation})=>{
    const panel=document.querySelector('#topic-'+topic),detail=document.querySelector(`#op-${topic}-${operation}`);
    const ids=[...document.querySelectorAll('[id]')].map(element=>element.id);
    return{active:!panel.hidden&&detail.checkVisibility(),variants:detail.querySelectorAll('.nvm-op-variant').length,frames:detail.querySelectorAll('.nvm-op-frame').length,duplicates:ids.filter((id,index)=>ids.indexOf(id)!==index),overflow:document.documentElement.scrollWidth-innerWidth,title:panel.querySelector('h2').innerText};
   },{topic,operation});
   note(state.active&&state.variants===(topic==='mtp'?2:1)&&state.frames>=3&&!state.duplicates.length&&state.overflow<=1,'舊 EEPROM 與新 MTP 操作連結均可直接載入',{language,width,topic,operation,...state});
  }
  await page.goto(base+file+`?lang=${language}#topic-mtp`,{waitUntil:'networkidle'});
  note(await page.locator('#mtp-integration-routes tbody tr').count()===2&&await page.locator('#mtp-implementations tbody tr').count()>=3,'兩語皆顯示製程路徑及具名 IP 比較表',{language,width});
  if(width===1440){
   await page.locator('#mtp-integration-routes').screenshot({path:path.join(output,`MTP整合路徑-${language}.png`)});
   await page.locator('#mtp-implementations').screenshot({path:path.join(output,`MTP具名方案-${language}.png`)});
   await page.locator('#topic-mtp .nvm-cell').screenshot({path:path.join(output,`MTP正式元件圖-${language}.png`)});
  }
  await page.goto(base+file+`?lang=${language}#patent-US5844271A`,{waitUntil:'networkidle'});
  note(await page.locator('#patent-US5844271A').getAttribute('open')!==null&&await page.locator('#patent-US5844271A a[href="#topic-mtp"]').count()>0,'單層多晶矽專利原連結仍有效並歸屬 MTP',{language,width});
  await page.goto(base+'index.html?lang='+language,{waitUntil:'networkidle'});
  await page.locator('#searchTrigger').click();await page.locator('#searchInput').fill('NeoEE');
  const result=page.locator('#searchResults a[href*="#topic-mtp"]').first();
  await result.waitFor({state:'visible'});await result.click();
  await page.waitForFunction(()=>location.hash==='#topic-mtp'&&!document.querySelector('#topic-mtp').hidden);
  note(await page.evaluate(()=>document.documentElement.lang)===(language==='en'?'en':'zh-Hant'),'全站搜尋具名 IP 可進入 MTP 並保留語言',{language,width});
  await context.close();
 }
}catch(error){note(false,'分類互動查核執行完成',{error:error.message});}
finally{await browser.close();}
note(errors.length===0,'分類頁 JavaScript 錯誤為零',{errors});
const report={passed:failures.length===0,base,checkedAt:new Date().toISOString(),checks:results.length,failures,results};
fs.writeFileSync(path.join(output,'MTP分類查核.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,checks:report.checks,failures}));
if(!report.passed)process.exitCode=1;
