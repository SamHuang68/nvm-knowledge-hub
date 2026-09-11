import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'qa/商用編排第九輪_20260911');
fs.mkdirSync(out,{recursive:true});
const widths=process.argv.includes('--quick')?[1440,390]:[1440,1361,1360,1280,1101,1100,901,900,800,768,621,620,390,312];
const checks=[],errors=[],copy=[];
const check=(pass,label,details={})=>checks.push({pass:Boolean(pass),label,...details});
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}/`;let browser;
async function audit(page,language,width,route,scope){
 const geometry=await page.evaluate(selector=>{
  const root=document.querySelector(selector);const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
  const clips=[...root.querySelectorAll('header,p,h1,h2,h3,h4,h5,button,figcaption,td,dd')].filter(e=>visible(e)&&e.clientWidth>0&&e.scrollWidth>e.clientWidth+2).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,80),delta:e.scrollWidth-e.clientWidth}));
  return{overflow:document.documentElement.scrollWidth-innerWidth,clips,headings:[...root.querySelectorAll('h1,h2')].filter(visible).map(e=>({tag:e.tagName,size:parseFloat(getComputedStyle(e).fontSize)}))};
 },scope);
 check(geometry.overflow<=1,'頁面無水平溢出',{language,width,route,overflow:geometry.overflow});check(geometry.clips.length===0,'語意區塊內部沒有裁切',{language,width,route,clips:geometry.clips});
 if(language==='en'){const text=await page.locator(scope).innerText();check(!/[\u3400-\u9fff]/u.test(text),'英文主要內容沒有中文漏譯',{width,route,hits:text.match(/[\u3400-\u9fff]+/gu)?.slice(0,8)});}
 check(geometry.headings.every(h=>h.size<=(width<=600?44:h.tag==='H1'?72:56)),'主要標題尺度受控',{language,width,route,headings:geometry.headings});
 if([1440,390].includes(width)&&['ip-lineage','lineage-kilopass','lineage-aeon','lineage-aeon-context','lineage-aeon-event-2'].includes(route)){
  const contrast=await page.evaluate(selector=>{
   const rgb=c=>c.match(/[\d.]+/g)?.slice(0,3).map(Number)||[255,255,255];
   const lum=c=>rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
   const background=e=>{for(let p=e;p;p=p.parentElement){const c=getComputedStyle(p).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent')return c;}return 'rgb(255,255,255)';};
   const failures=[];let count=0;
   for(const e of document.querySelector(selector).querySelectorAll('p,h1,h2,h3,h4,h5,dt,dd,a,button,small,figcaption,strong,span')){
    if(!e.getClientRects().length||!Array.from(e.childNodes).some(n=>n.nodeType===3&&n.textContent.trim()))continue;
    const s=getComputedStyle(e);if(s.visibility==='hidden')continue;const bg=background(e),l1=lum(s.color),l2=lum(bg),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05),size=parseFloat(s.fontSize),threshold=size>=24||size>=18.66&&parseFloat(s.fontWeight)>=700?3:4.5;
    count++;if(ratio+.01<threshold)failures.push({tag:e.tagName,class:e.className,text:e.textContent.trim().slice(0,60),ratio:Number(ratio.toFixed(2)),threshold,color:s.color,bg});
   }return{count,failures};
  },scope);
  check(contrast.failures.length===0,'實際文字與承載底色符合 AA 對比',{language,width,route,...contrast});
 }
}
try {
 browser=await chromium.launch({headless:true});
 for(const language of ['zh','en'])for(const width of widths){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
  const data=JSON.parse(fs.readFileSync(path.join(root,'data/NVM知識資料'+(language==='en'?'英文':'')+'.json'),'utf8')).ipCurriculum.lineage;
  await page.goto(base+encodeURIComponent(language==='en'?'NVM技術全景.html':'NVM技術全景中文.html')+'?lang='+language+'#panorama',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelectorAll('[data-nvm-panel]:not([hidden])').length===1);
  async function route(id,target){await page.evaluate(id=>location.hash=id,id);await page.waitForFunction(([id,target])=>location.hash==='#'+id&&document.activeElement===document.querySelector(target),[id,target]);}
  await route('ip-lineage','#ip-lineage h2');
  check(await page.locator('.nvm-lineage-index a').count()===data.entries.length,'三個家族入口完整',{language,width});
  check(JSON.stringify(await page.locator('.nvm-lineage-cover dd').allTextContents())===JSON.stringify([String(data.entries.length),String(data.entries.reduce((a,e)=>a+e.events.length,0))]),'家族及事件數由正式資料產生',{language,width});
  await audit(page,language,width,'ip-lineage','#ip-lineage');
  if([1440,390].includes(width))await page.screenshot({path:path.join(out,`${language}-ip-lineage-${width}.png`)});
  for(const entry of data.entries){
   const id='lineage-'+entry.id,section=page.locator('#'+id);
   await page.locator(`.nvm-lineage-index a[href="#${id}"]`).click();await page.waitForFunction(id=>document.activeElement===document.querySelector('#'+id+' h3'),id);
   check(await section.isVisible(),'家族入口與標題焦點',{language,width,id});
   check(await section.locator('.nvm-lineage-summary').textContent()===entry.summary,'家族摘要原文完整',{language,width,id});
   check(await section.locator('.nvm-lineage-current p').textContent()===entry.currentContext,'後續產品與查核範圍原文完整',{language,width,id});
   check(await section.locator('.nvm-lineage-boundary p').textContent()===entry.cellBoundary,'單元圖解證據邊界原文完整',{language,width,id});
   check(await section.locator('.nvm-lineage-event').count()===entry.events.length,'家族事件筆數完整',{language,width,id});
   for(let i=0;i<entry.events.length;i++){
    const event=entry.events[i],block=section.locator('.nvm-lineage-event').nth(i);
    check(await block.locator('time').textContent()===event.date&&await block.locator('time').getAttribute('datetime')===event.date,'事件日期與機讀日期一致',{language,width,id,i});
    check(await block.locator('h5').textContent()===event.title.replace(/[。.!?！？]$/u,''),'事件標題保持既有標點規則',{language,width,id,i});
    check(await block.locator('.nvm-lineage-event-body>p').textContent()===event.body,'事件範圍原文完整',{language,width,id,i});
    for(const source of event.sourceIds)check(await block.locator(`a[href="#source-${source}"]`).count()>0,'事件來源完整',{language,width,id,i,source});
    check(await block.locator('.nvm-lineage-date').evaluate(e=>e.getBoundingClientRect().height)>=44,'事件日期連結觸控尺寸',{language,width,id,i});
   }
   for(const source of entry.sourceIds)check(await section.locator(`.nvm-lineage-context-sources a[href="#source-${source}"]`).count()>0,'後續產品及圖解來源完整',{language,width,id,source});
   for(const suffix of ['events','context','boundary']){
    await section.locator(`.nvm-lineage-section-links a[href="#${id}-${suffix}"]`).click();await page.waitForFunction(id=>document.activeElement===document.querySelector('#'+id+' h4'),id+'-'+suffix);
    check(true,'章節定位聚焦語意標題',{language,width,id,suffix});
   }
   await section.locator('.nvm-lineage-date').first().focus();await page.keyboard.press('Enter');await page.waitForFunction(id=>document.activeElement===document.querySelector('#'+id+' h5'),id+'-event-1');
   check(true,'鍵盤日期連結定位事件標題',{language,width,id});
   await section.locator('.nvm-lineage-cell-link').click();await page.waitForFunction(unit=>document.activeElement===document.querySelector('#ip-'+unit+' h2'),entry.unitId);
   check(await page.locator('#ip-'+entry.unitId+' .nvm-ip-structure-figure').isVisible(),'家族接續至正確單元圖解',{language,width,id});
   await route(id,'#'+id+' h3');
   await audit(page,language,width,id,'#ip-lineage');
   if([1440,390].includes(width))await page.screenshot({path:path.join(out,`${language}-${id}-${width}.png`)});
   await section.locator('.nvm-lineage-family-actions a[href="#lineage-contents"]').click();await page.waitForFunction(()=>document.activeElement===document.querySelector('#lineage-contents a'));
   check(true,'返回家族索引並恢復第一入口焦點',{language,width,id});
  }
  await route('lineage-aeon-context','#lineage-aeon-context h4');await audit(page,language,width,'lineage-aeon-context','#ip-lineage');
  if([1440,390].includes(width))await page.screenshot({path:path.join(out,`${language}-lineage-aeon-context-${width}.png`)});
  await route('lineage-aeon-event-2','#lineage-aeon-event-2 h5');await audit(page,language,width,'lineage-aeon-event-2','#ip-lineage');
  await page.locator('.language-toggle').click();await page.waitForFunction(lang=>document.documentElement.dataset.contentLanguage!==lang&&document.querySelectorAll('[data-nvm-panel]:not([hidden])').length===1,language);
  check(new URL(page.url()).hash==='#lineage-aeon-event-2'&&await page.locator('#ip-lineage').isVisible(),'雙語切換保留具體事件位置',{language,width});
  await page.close();
 }
}catch(e){errors.push(e.stack);}finally{await browser?.close();server.close();}
const report={time:new Date().toISOString(),widths,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass),errors,checks};fs.writeFileSync(path.join(out,'技術沿革瀏覽器查核.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed,errors},null,2));if(report.failed.length||errors.length)process.exitCode=1;
