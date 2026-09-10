import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..'),output=path.join(root,'qa/入口與技術譜系_20260910');
fs.mkdirSync(output,{recursive:true});
const base=process.env.NVM_QA_BASE||'http://127.0.0.1:8765/';
const catalog=JSON.parse(fs.readFileSync(path.join(root,'data/NVM知識目錄.json'),'utf8'));
const data=JSON.parse(fs.readFileSync(path.join(root,'data/NVM知識資料英文.json'),'utf8'));
const results=[],failures=[],errors=[];
const note=(passed,label,detail={})=>{const row={passed:Boolean(passed),label,...detail};results.push(row);if(!passed)failures.push(row);};
const required=['foundations','ip-process','applications','resources'];
note(catalog.sections.map(section=>section.id).join(',')===required.join(','),'首頁具備四類明確主題');
note(catalog.sections.find(section=>section.id==='ip-process').items.some(item=>item.url.endsWith('#ip-directory')),'IP 單元為 IP 與製程下的項目');
note(data.ipCurriculum.lineage.entries.length===3,'技術沿革包含 Kilopass、Sidense 與 Impinj／Virage 三條家族');
const browser=await chromium.launch({headless:true});
try{
for(const language of ['en','zh'])for(const width of [1440,1024,768,390,320]){
 const context=await browser.newContext({viewport:{width,height:940},reducedMotion:'reduce'}),page=await context.newPage();
 page.on('pageerror',error=>errors.push({language,width,message:error.message}));
 await page.goto(new URL('index.html?lang='+language,base).href,{waitUntil:'load'});await page.locator('.hub-rail-btn.active').waitFor();
 const first=await page.evaluate(()=>{const nav=document.querySelector('.hub-rail-nav'),title=document.querySelector('h1');return{title:title.innerText,headingHeight:title.getBoundingClientRect().height,directoryBottom:nav.getBoundingClientRect().bottom,buttons:[...nav.querySelectorAll('a')].map(a=>({text:a.innerText,width:a.getBoundingClientRect().width,height:a.getBoundingClientRect().height})),overflow:document.documentElement.scrollWidth-innerWidth,heroFigures:document.querySelectorAll('.knowledge-hero-art,.knowledge-facts').length};});
 note(first.title===(language==='en'?'NVM Knowledge Hub':'NVM 知識中心')&&first.heroFigures===0&&first.directoryBottom<=940&&first.buttons.length===4&&first.buttons.every(button=>button.width>=120&&button.height>=40)&&first.overflow<=1,'首頁第一屏為知識中心及四類目錄',{language,width,...first});
 note(await page.locator('.knowledge-row').count()===catalog.sections.reduce((total,section)=>total+section.items.length,0),'完整目錄保留全部主題入口',{language,width});
 for(const section of catalog.sections){
  await page.locator(`.hub-rail-btn[data-target="layer-${section.id}"]`).click();
  await page.waitForFunction(id=>document.querySelector(`[data-target="layer-${id}"]`)?.getAttribute('aria-current')==='location',section.id);
  if(width===390)await page.waitForTimeout(1350);
  const location=await page.locator('#layer-'+section.id).evaluate(element=>{const box=element.getBoundingClientRect(),nav=document.querySelector('.hub-rail-nav').getBoundingClientRect();return{top:box.top,navBottom:nav.bottom,overflow:document.documentElement.scrollWidth-innerWidth};});
  note(location.top>=location.navBottom-3&&location.overflow<=1,'類別導覽顯示正確區塊且標題不被遮蔽',{language,width,id:section.id,...location});
  note(await page.locator(`.hub-rail-btn[data-target="layer-${section.id}"]`).getAttribute('aria-current')==='location','捲動完成後分類標示仍對應目的地',{language,width,id:section.id});
  for(const item of section.items)note(await page.locator(`#layer-${section.id} .knowledge-row[href="${item.url}"]`).count()===1,'主題位於正確目錄階層',{language,width,id:item.id});
 }
 note(await page.locator('#layer-applications #layer-architecture[href="secure-storage.html"]').count()===1,'舊安全架構錨點保留正確內容',{language,width});
 if([1440,390,320].includes(width)){
  await page.goto(new URL('index.html?lang='+language,base).href,{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(output,`首頁目錄-${language}-${width}.png`),fullPage:false});
 }
 await page.locator('.hub-rail-btn[data-target="layer-ip-process"]').click();
 await page.locator('#layer-ip-process .knowledge-row[href$="#ip-directory"]').click();
 await page.waitForFunction(()=>document.getElementById('ip-directory')?.checkVisibility());
 note(await page.locator('[data-ip-entry]:visible').count()===data.ipCurriculum.units.length&&(await page.locator('html').getAttribute('lang'))===(language==='en'?'en':'zh-Hant'),'首頁 IP 項目直接進入完整名錄並保留語言',{language,width});
 await page.locator('#ip-directory a[href="#ip-kilopass-xpm"]').click();
 await page.waitForFunction(()=>document.getElementById('ip-kilopass-xpm')?.checkVisibility());
 note(await page.locator('#ip-kilopass-xpm .nvm-ip-structure-figure').isVisible(),'IP 名錄可直接開啟 Kilopass 結構與操作',{language,width});
 const file=language==='en'?'NVM技術全景.html':'NVM技術全景中文.html';
 await page.goto(new URL(file+'?lang='+language+'#panorama',base).href,{waitUntil:'load'});await page.locator('#panorama').waitFor();
 note(await page.locator('#panorama .nvm-library-entries>a').count()===7&&await page.locator('[data-ip-entry]:visible').count()===0,'全景預設顯示中性章節目錄',{language,width});
 if([1440,390].includes(width))await page.screenshot({path:path.join(output,`全景目錄-${language}-${width}.png`),fullPage:false});
 await page.locator('#panorama a[href="#ip-lineage"]').click();await page.locator('#ip-lineage').waitFor();
 const lineage=await page.locator('#ip-lineage').evaluate(element=>({entries:element.querySelectorAll('.nvm-lineage-entry').length,events:element.querySelectorAll('.nvm-lineage-events li').length,overflow:document.documentElement.scrollWidth-innerWidth,clipped:[...element.querySelectorAll('h2,h3,h4,p,time')].filter(item=>item.checkVisibility()&&item.scrollWidth>item.clientWidth+2).map(item=>item.textContent)}));
 note(lineage.entries===3&&lineage.events>=6&&lineage.overflow<=1&&!lineage.clipped.length,'技術沿革的事件、後續產品及單元對應可讀',{language,width,...lineage});
 if([1440,390].includes(width))await page.locator('#ip-lineage').screenshot({path:path.join(output,`技術沿革-${language}-${width}.png`),style:'.nvm-header{visibility:hidden}'});
 if(width===390){
  await page.goto(new URL('index.html?lang='+language+'#layer-architecture',base).href,{waitUntil:'networkidle'});
  await page.waitForTimeout(1350);
  note(await page.locator('.hub-rail-btn[data-target="layer-applications"]').getAttribute('aria-current')==='location'&&await page.locator('#layer-architecture').isVisible(),'舊安全入口冷開後仍標示應用與系統',{language,width});
  await page.goto(new URL('index.html?lang='+language,base).href,{waitUntil:'networkidle'});
  for(const [query,id] of [['Kilopass','kilopass-xpm'],['Sidense','sidense-1t-fuse'],['Impinj','impinj-aeon']]){
   await page.locator('#searchTrigger').click();await page.locator('#searchInput').fill(query);
   const hit=page.locator(`#searchResults a[href$="#ip-${id}"]`).first();await hit.waitFor({state:'visible'});await hit.click();
   await page.waitForFunction(id=>document.getElementById('ip-'+id)?.checkVisibility(),id);
   note(new URL(page.url()).hash==='#ip-'+id,'搜尋歷史品牌可進入正確單元',{language,query,id});
   await page.goto(new URL('index.html?lang='+language,base).href,{waitUntil:'networkidle'});
  }
 }
 await context.close();
}
const context=await browser.newContext({viewport:{width:1440,height:940},reducedMotion:'reduce'}),page=await context.newPage();
const pages=['memory-physics.html','technology-comparison.html','secure-storage.html','security-assurance.html','ai-nvm-opportunities.html','iot-mcu-envm.html','automotive-nvm.html','specialty-nvm.html','memory-evidence.html','oip-secure-storage.html','whitepaper/index.html','briefing/index.html','tools/whitepaper-studio/index.html'];
for(const file of pages){
 await page.goto(new URL(file+'?lang=en',base).href,{waitUntil:'networkidle'});
 const links=await page.locator('[data-hub-category]').evaluateAll(nodes=>nodes.map(node=>new URL(node.href).hash));
 note(required.every(id=>links.includes('#layer-'+id))&&links.length===4,'周邊頁共用四類主導覽',{file,links});
}
await context.close();
}catch(error){note(false,'入口目錄查核完成',{error:error.stack});}finally{await browser.close();}
note(errors.length===0,'入口與目錄互動無腳本錯誤',{errors});
const report={passed:failures.length===0,base,checkedAt:new Date().toISOString(),checks:results.length,failures,results};
fs.writeFileSync(path.join(output,'入口目錄查核.json'),JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({passed:report.passed,checks:report.checks,failures:failures.slice(0,12)}));
if(!report.passed)process.exitCode=1;
