import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..'),output=path.join(root,'qa/IP單元主線_20260910');
fs.mkdirSync(output,{recursive:true});
const base=process.env.NVM_QA_BASE||'http://127.0.0.1:8765/';
const data=JSON.parse(fs.readFileSync(path.join(root,'data/NVM知識資料英文.json'),'utf8'));
const units=data.ipCurriculum.units,results=[],failures=[],errors=[];
const note=(passed,label,details={})=>{const row={passed:Boolean(passed),label,...details};results.push(row);if(!passed)failures.push(row);};
note(units.length===9&&units.map(unit=>unit.id).join(',')==='neobit,neofuse,neoee,neomtp,ymc-mtp,numem-mram,gf-emram,weebit-reram,crossbar-reram','九款 IP 依 OTP、MTP、MRAM 與 ReRAM 構成主線');
const sourceIds=new Set(data.sources.map(source=>source.id));
for(const unit of units)note(unit.operations.length===3&&unit.structure.sourceIds.every(id=>sourceIds.has(id))&&unit.operations.every(operation=>operation.variants.every(variant=>variant.frames.length>=3&&variant.frames.every(frame=>frame.sourceIds.every(id=>sourceIds.has(id))))),'單元結構與所有逐格操作綁定有效來源',{id:unit.id});
const browser=await chromium.launch({headless:true});
try{
 for(const language of ['en','zh'])for(const width of [1440,1024,768,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce',acceptDownloads:true});
  const page=await context.newPage();page.on('pageerror',error=>errors.push({language,width,error:error.message}));
  const file=language==='en'?'NVM技術全景.html':'NVM技術全景中文.html';
  await page.goto(new URL(file+'?lang='+language,base).href,{waitUntil:'networkidle'});
  await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  note(await page.locator('[data-ip-entry]:visible').count()===9&&!await page.locator('#nvm-physics-overview').evaluate(element=>element.open),'首次閱讀顯示九款 IP，物理背景預設收合',{language,width});
  for(const unit of units){
   await page.evaluate(id=>{location.hash='ip-'+id;},unit.id);await page.waitForFunction(id=>!document.getElementById('ip-'+id).hidden,unit.id);
   const panel=page.locator('#ip-'+unit.id);
   const auditStructure=await panel.locator('.nvm-ip-structure-drawing').evaluate(inspect);
   note(auditStructure.overflow<=1&&!auditStructure.outside.length&&!auditStructure.overlap.length&&auditStructure.minimumText>=13,'單元結構圖文字、圖面與頁面邊界',{language,width,id:unit.id,...auditStructure});
   for(const operation of unit.operations){
    await panel.locator(`[data-operation-select="${operation.operationId}"]`).click();
    const detail=page.locator(`#ip-op-${unit.id}-${operation.operationId}`);
    const audit=await detail.evaluate(inspect);
    const count=await detail.locator('.nvm-op-frame').count();
    note(audit.overflow<=1&&!audit.outside.length&&!audit.overlap.length&&!audit.clipped.length&&audit.minimumText>=13&&(language==='zh'||!audit.cjk)&&count===operation.variants.reduce((total,variant)=>total+variant.frames.length,0),'操作切換、逐格圖面與文字可讀',{language,width,id:unit.id,operation:operation.operationId,frames:count,...audit});
   }
   if(width===390){
    await panel.locator('.nvm-ip-structure-figure [data-engineering-zoom]').click();
    note(await page.locator('.nvm-engineering-dialog').isVisible()&&await page.locator('.nvm-engineering-zoom-notes .nvm-op-legend').count()===1,'手機放大單元圖保留圖例',{language,id:unit.id});
    await page.locator('.nvm-engineering-dialog select').selectOption('2');
    note(await page.locator('.nvm-engineering-dialog svg').evaluate(svg=>svg.getBoundingClientRect().width>=1800),'IP 單元可二倍放大與水平閱讀',{language,id:unit.id});
    await page.keyboard.press('Escape');
   }
   if(width===1440){
    await panel.locator('.nvm-ip-structure-figure').screenshot({path:path.join(output,`正式單元-${unit.id}-${language}.png`),style:'.nvm-header{visibility:hidden}'});
    await panel.locator('[data-operation-select="write"]').click();
    await panel.locator('[data-operation-detail="write"] .nvm-op-variant').first().screenshot({path:path.join(output,`正式寫入-${unit.id}-${language}.png`),style:'.nvm-header{visibility:hidden}'});
   }
  }
  note(await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(element=>element.id);return ids.length===new Set(ids).size;}),'IP 與背景內容、放大圖識別碼均唯一',{language,width});
  await page.goto(new URL(file+'?lang='+language+'#topic-eeprom',base).href,{waitUntil:'networkidle'});
  note(!await page.locator('#eeprom-reference').evaluate(element=>element.open)&&await page.locator('.nvm-reference-intro').isVisible(),'獨立式 EEPROM 為簡要背景，詳細教材預設收合',{language,width});
  if(width===390){
   await page.goto(new URL(file+'?lang='+language+'#ip-op-neoee-erase',base).href,{waitUntil:'networkidle'});
   await page.reload({waitUntil:'networkidle'});
   note(await page.locator('#ip-op-neoee-erase').isVisible(),'IP 非預設操作可直接開啟與重新載入',{language,width});
   await page.locator('.language-toggle').click();await page.waitForFunction(()=>document.getElementById('ip-op-neoee-erase')?.checkVisibility());
   note(new URL(page.url()).hash==='#ip-op-neoee-erase','切換語言保留具名 IP 與操作',{language,width});
   await page.goto(new URL('index.html?lang='+language,base).href,{waitUntil:'networkidle'});
   await page.locator('#searchTrigger').click();await page.locator('#searchInput').fill('NeoBit');
   const searchResult=page.locator('#searchResults a[href*="#ip-neobit"]').first();
   await searchResult.waitFor({state:'visible'});await searchResult.click();
   await page.waitForFunction(()=>location.hash==='#ip-neobit'&&!document.getElementById('ip-neobit').hidden);
   note(await page.evaluate(()=>document.documentElement.lang)===(language==='en'?'en':'zh-Hant'),'首頁搜尋直接進入具名 IP 並保留語言',{language,width});
   const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#ip-neobit .nvm-ip-structure-figure [data-engineering-download]').click()]);
   const downloadFile=await download.path();
   const downloaded=fs.readFileSync(downloadFile,'utf8');
   note(download.suggestedFilename().endsWith('.svg')&&downloaded.includes('<svg')&&downloaded.includes('FG')&&!downloaded.includes('<script'),'單元圖可下載可編輯 SVG',{language,width});
  }
  await context.close();
 }
}catch(error){note(false,'IP 瀏覽器查核完成',{error:error.stack});}finally{await browser.close();}
note(errors.length===0,'IP 頁面 JavaScript 無錯誤',{errors});
const report={passed:failures.length===0,checkedAt:new Date().toISOString(),base,units:units.length,operations:units.reduce((n,unit)=>n+unit.operations.length,0),framesPerLanguage:units.reduce((n,unit)=>n+unit.operations.reduce((sum,op)=>sum+op.variants.reduce((v,variant)=>v+variant.frames.length,0),0),0),checks:results.length,failures,results};
fs.writeFileSync(path.join(output,'IP單元查核.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,checks:report.checks,framesPerLanguage:report.framesPerLanguage,failures:failures.slice(0,12)}));
if(!report.passed)process.exitCode=1;
function inspect(element){
 const outside=[],overlap=[];let minimumText=Infinity;
 for(const svg of element.querySelectorAll('svg')){
  if(!svg.checkVisibility())continue;
  const bounds=svg.getBoundingClientRect(),texts=[...svg.querySelectorAll('text')].filter(text=>text.getBoundingClientRect().width);
  for(const text of texts){const box=text.getBoundingClientRect();minimumText=Math.min(minimumText,parseFloat(getComputedStyle(text).fontSize)*bounds.width/svg.viewBox.baseVal.width);if(box.left<bounds.left-2||box.right>bounds.right+2||box.top<bounds.top-2||box.bottom>bounds.bottom+2)outside.push(text.textContent);}
  for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){const a=texts[i].getBoundingClientRect(),b=texts[j].getBoundingClientRect();if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2)overlap.push(texts[i].textContent+' / '+texts[j].textContent);}
 }
 const clipped=[...element.querySelectorAll('h4,h5,h6,p,dd,button')].filter(item=>item.checkVisibility()).filter(item=>item.scrollWidth>item.clientWidth+2).map(item=>item.textContent.slice(0,60));
 return {overflow:document.documentElement.scrollWidth-innerWidth,minimumText:Number(minimumText.toFixed(2)),outside,overlap,clipped,cjk:/[\u3400-\u9fff]/.test(element.innerText)};
}
