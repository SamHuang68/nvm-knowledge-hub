import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';
const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'qa/操作與專利圖解_20260910');fs.mkdirSync(output,{recursive:true});
const base=process.env.NVM_QA_BASE||'http://127.0.0.1:8765/';
const data=JSON.parse(fs.readFileSync(path.join(root,'data/NVM知識資料英文.json'),'utf8'));
const checks=[],errors=[],failures=[];
const note=(passed,label,detail={})=>{const result={passed:Boolean(passed),label,...detail};checks.push(result);if(!passed)failures.push(result);};
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
note(data.engineering?.operations.length===48,'十六個技術與 IP 專題各有三種完整操作');
const frameCount=data.engineering.operations.reduce((n,study)=>n+study.variants.reduce((v,item)=>v+item.frames.length,0),0);
const variantCount=data.engineering.operations.reduce((n,study)=>n+study.variants.length,0);
const sources=new Set(data.sources.map(source=>source.id));
for(const study of data.engineering.operations)for(const variant of study.variants){
 const geometries=variant.frames.map(frame=>hash(frame.svg.replace(/<(?:title|desc|text)\b[^>]*>[\s\S]*?<\/(?:title|desc|text)>/g,'').replace(/(?:id|aria-labelledby|aria-describedby)="[^"]*"/g,'').replace(/url\(#[^)]+\)/g,'url(#marker)')));
 note(variant.frames.length>=3&&new Set(geometries).size>=2,'連續圖包含實際幾何或狀態變化',{topic:study.topicId,operation:study.operationId,variant:variant.id,frames:variant.frames.length});
 note((variant.sources||study.sources).every(source=>sources.has(source.id)),'操作附圖來源存在於共用資料',{topic:study.topicId,variant:variant.id});
}
note(data.engineering.patents.length===19,'十九件專利皆有圖解導讀');
for(const study of data.engineering.patents){
 note(study.figures.length>=1&&study.callouts.length>=3&&study.claim&&study.bridge,'專利保留附圖、編號、權利項與操作關聯',{id:study.id});
 for(const figure of study.figures){
  const bytes=fs.readFileSync(path.join(root,figure.asset));
  note(hash(bytes)===figure.sha256&&figure.page>=1&&/^https:\/\//.test(figure.pdfUrl),'附圖檔案與原始公報定位一致',{id:study.id,figure:figure.label});
 }
}
const browser=await chromium.launch({headless:true});
try{
 for(const language of ['en','zh'])for(const width of [1440,1024,768,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',acceptDownloads:true});
  const page=await context.newPage();page.on('pageerror',error=>errors.push({language,width,message:error.message}));
  page.on('response',response=>{if(response.status()>=400&&new URL(response.url()).origin===new URL(base).origin)errors.push({language,width,url:response.url(),status:response.status()});});
  const file=language==='en'?'NVM技術全景.html':'NVM技術全景中文.html';
  await page.goto(new URL(file+'?lang='+language,base).href,{waitUntil:'networkidle'});
  await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  note(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);return new Set(ids).size===ids.length;}),'完整頁面識別碼不重複',{language,width});
  for(const study of data.engineering.operations){
   const id=`op-${study.topicId}-${study.operationId}`;
   await page.evaluate(id=>{location.hash=id;},id);
   await page.waitForFunction(id=>{const el=document.getElementById(id);return el&&!el.hidden&&!el.closest('[data-nvm-panel]').hidden;},id);
   const audit=await page.locator('#'+id).evaluate(el=>{
    const drawingProblems=[];let minimumText=Infinity;
    for(const svg of el.querySelectorAll('.nvm-op-drawing>svg')){
     const r=svg.getBoundingClientRect();for(const text of svg.querySelectorAll('text')){
      const box=text.getBoundingClientRect();if(!box.width||!box.height)continue;
      const size=parseFloat(getComputedStyle(text).fontSize)*r.width/svg.viewBox.baseVal.width;minimumText=Math.min(minimumText,size);
      if(box.left<r.left-2||box.right>r.right+2||box.top<r.top-2||box.bottom>r.bottom+2)drawingProblems.push({text:text.textContent,kind:'圖內字超出畫布'});
     }
    }
    const clipped=[...el.querySelectorAll('h4,h5,h6,p,dd,button')].filter(e=>e.checkVisibility({checkVisibilityCSS:true})).filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.textContent.slice(0,80));
    return{overflow:document.documentElement.scrollWidth-innerWidth,frames:el.querySelectorAll('.nvm-op-frame').length,variants:el.querySelectorAll('[data-operation-variant]').length,drawingProblems,minimumText:Number(minimumText.toFixed(2)),clipped,cjk:/[\u3400-\u9fff]/.test(el.innerText)};
   });
   const expected=study.variants.reduce((n,v)=>n+v.frames.length,0);
   note(audit.overflow<=1&&audit.frames===expected&&audit.variants===study.variants.length&&!audit.drawingProblems.length&&!audit.clipped.length&&audit.minimumText>=13&&(language==='zh'||!audit.cjk),'所有操作格、字級與手機邊界',{language,width,id,...audit});
   if(width===1440&&language==='en'&&['nor','stt','feram','pcm','sonos'].includes(study.topicId)&&study.operationId==='write'){await page.setViewportSize({width,height:2400});await page.locator('#'+id+' .nvm-op-variant').first().screenshot({path:path.join(output,`${study.topicId}-寫入-1440.png`)});await page.setViewportSize({width,height:1000});}
   if(width===390&&['nor','stt','feram','ftj'].includes(study.topicId)&&study.operationId==='read'){
    await page.locator('#'+id+' [data-engineering-zoom]').first().click();const visible=await page.locator('.nvm-engineering-dialog').isVisible();
    note(visible&&(await page.locator('.nvm-engineering-dialog svg').evaluate(el=>el.getBoundingClientRect().width))>=900,'手機可放大操作圖',{language,width,id});
    note(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);return new Set(ids).size===ids.length;}),'放大圖的根與內部識別碼均獨立',{language,width,id});
    await page.locator('.nvm-engineering-dialog select').selectOption('2');
    note((await page.locator('.nvm-engineering-dialog svg').evaluate(el=>el.getBoundingClientRect().width))>=1800,'二倍檢視保留向量解析度',{language,width,id});
    note(await page.locator('.nvm-engineering-zoom-notes .nvm-op-legend').isVisible(),'放大操作圖保留符號圖例',{language,width,id});
    await page.keyboard.press('Escape');note(!await page.locator('.nvm-engineering-dialog').isVisible(),'鍵盤可關閉大圖',{language,width,id});
   }
  }
  for(const study of data.engineering.patents){
   const id='patent-'+study.id;await page.evaluate(id=>{location.hash=id;},id);await page.waitForFunction(id=>document.getElementById(id)?.open,id);
   const audit=await page.locator('#'+id).evaluate(el=>({overflow:document.documentElement.scrollWidth-innerWidth,figures:el.querySelectorAll('.nvm-patent-originals [data-patent-figure]').length,cjk:/[\u3400-\u9fff]/.test(el.innerText)}));
   note(audit.overflow<=1&&audit.figures===study.figures.length&&(language==='zh'||!audit.cjk),'專利原圖與導讀可定位',{language,width,id,...audit});
   if(width===390&&study.id==='US7417300B2'){
    await page.locator('#'+id+' [data-engineering-zoom]').first().click();
    await page.locator('.nvm-engineering-dialog select').selectOption('3');
    note((await page.locator('.nvm-engineering-dialog svg').evaluate(el=>el.getBoundingClientRect().width))>=3600,'原始專利附圖支援三倍細部檢視',{language,width,id});
    note(await page.locator('.nvm-engineering-zoom-notes .nvm-patent-callouts').isVisible(),'放大專利原圖保留編號導讀',{language,width,id});
    await page.keyboard.press('Escape');
   }
  }
  if(width===390){
   await page.goto(new URL(file+'?lang='+language+'#op-feram-read',base).href,{waitUntil:'networkidle'});
   note(await page.locator('#op-feram-read').isVisible()&&await page.locator('#topic-feram [data-operation-select="read"]').getAttribute('aria-pressed')==='true','直接進入非預設操作會展開正確圖組',{language,width});
   await page.locator('.language-toggle').click();await page.waitForFunction(()=>document.querySelector('#op-feram-read')?.checkVisibility());
   note(locationSafe(page.url()).hash==='#op-feram-read','切換語言保留操作圖位置',{language,width});
  }
  if(width===1440&&language==='en'){
   await page.evaluate(()=>{location.hash='op-nor-write';});await page.waitForFunction(()=>document.querySelector('#op-nor-write').checkVisibility());
   const downloadEvent=page.waitForEvent('download');await page.locator('#op-nor-write [data-engineering-download]').first().click();const download=await downloadEvent;
   const target=path.join(output,'下載操作圖.svg');await download.saveAs(target);const svg=fs.readFileSync(target,'utf8');
   note(svg.includes('<svg')&&svg.includes('<path')&&svg.includes('<text')&&svg.includes('xmlns='),'SVG 下載保留可編輯文字與向量路徑');
  }
  await context.close();
 }
}catch(error){failures.push({label:'工程圖解驗證流程中斷',message:error.message});}
finally{await browser.close();}
function locationSafe(url){return new URL(url);}
if(errors.length)failures.push({label:'網頁或資源錯誤',errors});
const report={passed:failures.length===0,base,checkedAt:new Date().toISOString(),operations:45,variants:variantCount,framesPerLanguage:frameCount,patents:19,checks:checks.length,failures,results:checks};
fs.writeFileSync(path.join(output,'工程圖解查核.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,checks:checks.length,framesPerLanguage:frameCount,failures:failures.map(f=>({label:f.label,id:f.id,width:f.width,language:f.language,message:f.message,drawingProblems:f.drawingProblems,minimumText:f.minimumText,clipped:f.clipped,cjk:f.cjk})).slice(0,20)}));if(!report.passed)process.exitCode=1;
