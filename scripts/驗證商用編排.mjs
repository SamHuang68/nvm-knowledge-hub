import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'qa/商用編排第六輪_20260910');
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
  const clips=[...root.querySelectorAll('header,p,h1,h2,h3,h4,button,figcaption,td,dd')].filter(e=>visible(e)&&e.clientWidth>0&&e.scrollWidth>e.clientWidth+2).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.slice(0,80),delta:e.scrollWidth-e.clientWidth}));
  return{overflow:document.documentElement.scrollWidth-innerWidth,clips,headings:[...root.querySelectorAll('h1,h2')].filter(visible).map(e=>({tag:e.tagName,size:parseFloat(getComputedStyle(e).fontSize)}))};
 },scope);
 check(geometry.overflow<=1,'頁面無水平溢出',{language,width,route,overflow:geometry.overflow});check(geometry.clips.length===0,'語意區塊內部沒有裁切',{language,width,route,clips:geometry.clips});
 if(language==='en'){const text=await page.locator(scope).innerText();check(!/[\u3400-\u9fff]/u.test(text),'英文主要內容沒有中文漏譯',{width,route,hits:text.match(/[\u3400-\u9fff]+/gu)?.slice(0,8)});}
 check(geometry.headings.every(h=>h.size<=(width<=600?44:h.tag==='H1'?72:56)),'主要標題尺度受控',{language,width,route,headings:geometry.headings});
 if([1440,390].includes(width)&&['首頁','ecosystem','research','panorama','physics-library','comparison','foundry','sources','topic-stt','topic-stt-tradeoffs','topic-stt-ceilings','ip-directory','ip-group-mtp','system-array','system-array-section-3','system-scm'].includes(route)){
  const contrast=await page.evaluate(selector=>{
   const rgb=c=>c.match(/[\d.]+/g)?.slice(0,3).map(Number)||[255,255,255];
   const lum=c=>rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
   const background=e=>{for(let p=e;p;p=p.parentElement){const c=getComputedStyle(p).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent')return c;}return 'rgb(255,255,255)';};
   const failures=[];let count=0;
   for(const e of document.querySelector(selector).querySelectorAll('p,h1,h2,h3,h4,dt,dd,a,button,small,figcaption,strong,span')){
    if(!e.getClientRects().length||!Array.from(e.childNodes).some(n=>n.nodeType===3&&n.textContent.trim()))continue;
    const s=getComputedStyle(e);if(s.visibility==='hidden')continue;const bg=background(e),l1=lum(s.color),l2=lum(bg),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05),size=parseFloat(s.fontSize),threshold=size>=24||size>=18.66&&parseFloat(s.fontWeight)>=700?3:4.5;
    count++;if(ratio+.01<threshold)failures.push({tag:e.tagName,class:e.className,text:e.textContent.trim().slice(0,60),ratio:Number(ratio.toFixed(2)),threshold,color:s.color,bg});
   }return{count,failures};
  },scope);
  check(contrast.failures.length===0,'實際文字與承載底色符合 AA 對比',{language,width,route,...contrast});
 }
}
try{
 browser=await chromium.launch({headless:true});
 for(const language of ['zh','en'])for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'index.html?lang='+language,{waitUntil:'networkidle'});
  await audit(page,language,width,'首頁','#main-content');
  const physicsLinks=page.locator('.knowledge-physics-index a');
  check(await physicsLinks.count()===4,'四個物理符號有實際導讀入口',{language,width});
  const chargeCopy=await physicsLinks.nth(0).evaluate(e=>e.textContent);
  const resistanceCopy=await physicsLinks.nth(2).evaluate(e=>e.textContent);
  const physicsNote=await page.locator('.knowledge-physics>p').evaluate(e=>e.textContent);
  check(/FG OTP/.test(chargeCopy),'電荷列含 Floating-Gate OTP，而非僅 EEPROM／Flash',{language,width});
  check(await physicsLinks.nth(0).getAttribute('href').then(h=>h.endsWith('#ip-neobit')),'電荷列進入 NeoBit 浮動閘 OTP 單元',{language,width});
  check(/AntiFuse OTP/.test(resistanceCopy),'電阻列含 AntiFuse OTP，而非僅多次寫入電阻記憶體',{language,width});
  check(await physicsLinks.nth(2).getAttribute('href').then(h=>h.endsWith('#topic-antifuse')),'電阻列進入 AntiFuse OTP 專題',{language,width});
  check(/OTP/.test(physicsNote),'物理索引註記 OTP 不是單一物理',{language,width});
  if(width>=1181)check(await physicsLinks.nth(0).locator('small').evaluate(e=>getComputedStyle(e).display!=='none'),'桌面寬度可見電荷／電阻範例標籤',{language,width});
  check(await page.locator('.knowledge-coverage dd').first().innerText()==='74','首頁涵蓋數由正式資料產生',{language,width});
  if([1440,390].includes(width)){await page.screenshot({path:path.join(out,`${language}-首頁-${width}.png`)});if(width===1440)copy.push(await page.locator('#main-content').innerText());}
  check(await page.locator('.knowledge-features a').count()===5,'首頁五篇專題有完整導讀入口',{language,width});
  if([1440,390].includes(width))await page.locator('.knowledge-features').screenshot({path:path.join(out,`${language}-專題導讀-${width}.png`),style:'.knowledge-header,.hub-rail-nav,.skip-link{visibility:hidden}'});
  if(width===390){
   const details=page.locator('.knowledge-physics');
   check(await details.getAttribute('open')===null,'手機物理索引預設收合',{language});
   await details.locator('summary').focus();await page.keyboard.press('Enter');
   check(await details.locator('.knowledge-physics-index a').first().isVisible(),'鍵盤可展開物理索引',{language});
   check(await details.locator('small').first().isVisible(),'展開後可見 FG OTP／AntiFuse OTP 範例',{language});
   await page.keyboard.press('Space');check(await details.getAttribute('open')===null,'鍵盤可收合物理索引',{language});
   await page.keyboard.press('Control+k');check(await page.locator('#searchOverlay').getAttribute('aria-hidden')==='false','手機版鍵盤搜尋可用',{language});await page.keyboard.press('Escape');
  }
  const atlas=language==='zh'?'NVM技術全景中文.html':'NVM技術全景.html';await page.goto(new URL(atlas+'?lang='+language+'#ecosystem',base).href,{waitUntil:'networkidle'});
  for(const route of ['panorama','physics-library','comparison','benchmark-CMP-BENCH-FRAM','benchmark-CMP-BENCH-OPTANE','comparison-history','ecosystem','research','research-everspin','research-panasonic','research-itri','ip-neoee','topic-stt','topic-stt-storage','topic-stt-tradeoffs','topic-stt-ceilings','topic-vcm','topic-eeprom','ip-directory','ip-group-mtp','system-array','system-array-section-3','system-scm','system-scm-section-5','foundry','foundry-year-2026','sources']){
   await page.evaluate(hash=>{location.hash=hash;},route);await page.waitForFunction(id=>document.getElementById(id)?.checkVisibility(),route);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   await audit(page,language,width,route,'#'+route);
   if(route.startsWith('research-')){const bounds=await page.evaluate(id=>{const a=document.getElementById(id).getBoundingClientRect(),h=document.querySelector('.nvm-header').getBoundingClientRect();return{top:a.top,headerBottom:h.bottom};},route);check(bounds.top>=bounds.headerBottom&&bounds.top<=bounds.headerBottom+40,'專題錨點緊接固定頁首且不被遮擋',{language,width,route,...bounds});check(await page.evaluate(()=>document.activeElement.tagName==='H3'),'專題焦點落在標題而非整章外框',{language,width,route});}
   if([1440,390].includes(width)&&['ecosystem','research','research-everspin','research-panasonic','research-itri'].includes(route)){await page.screenshot({path:path.join(out,`${language}-${route}-${width}.png`)});if(width===1440&&['ecosystem','research'].includes(route))copy.push(await page.locator('#'+route).innerText());}
   if([1440,390].includes(width)&&['panorama','physics-library','comparison','benchmark-CMP-BENCH-FRAM'].includes(route)){await page.screenshot({path:path.join(out,`${language}-${route}-${width}.png`)});if(width===1440)copy.push(await page.locator('#'+route).innerText());}
   if([1440,390].includes(width)&&['foundry','foundry-year-2026','sources'].includes(route)){await page.screenshot({path:path.join(out,`${language}-${route}-${width}.png`)});if(width===1440)copy.push(await page.locator('#'+route).innerText());}
  }
  if([1440,390].includes(width))for(const route of ['topic-stt','topic-stt-storage','topic-stt-tradeoffs','topic-stt-ceilings']){await page.evaluate(hash=>location.hash=hash,route);await page.waitForFunction(id=>document.activeElement===document.getElementById(id).querySelector(id==='topic-stt'?'h2':'h3'),route);await page.screenshot({path:path.join(out,language+'-'+route+'-'+width+'.png')});if(width===1440)copy.push(await page.locator('#'+route).innerText());}
  for(const id of ['ip-directory','ip-group-mtp','system-array','system-array-section-3','system-scm','system-scm-section-5']){
   await page.evaluate(hash=>location.hash=hash,id);await page.waitForFunction(id=>document.getElementById(id)?.checkVisibility(),id);
   if([1440,390].includes(width)){await page.screenshot({path:path.join(out,language+'-'+id+'-'+width+'.png')});if(width===1440)copy.push(await page.locator('#'+id).innerText());}
  }
  await page.evaluate(()=>location.hash='ip-directory');
  check(await page.locator('.nvm-ip-family-index a').count()===4&&await page.locator('[data-ip-entry]:visible').count()===12,'IP家族入口及具名單元完整',{language,width});
  const ipData=JSON.parse(fs.readFileSync(path.join(root,'data/NVMIP單元導論'+(language==='en'?'英文':'')+'.json'),'utf8'));
  if(width===1440)for(const unit of ipData.units){const text=await page.locator('[data-ip-entry="'+unit.id+'"]').innerText();check([unit.vendor,unit.shortTitle,unit.program,unit.reverse,unit.readout].every(value=>text.includes(value)),'IP操作名錄保留正式文字',{language,id:unit.id});}
  await page.locator('.nvm-ip-family-index a[href="#ip-group-mtp"]').click();await page.waitForFunction(()=>document.activeElement===document.querySelector('#ip-group-mtp h3'));check(await page.locator('#ip-group-mtp [data-ip-entry]').count()===4,'家族定位聚焦標題並顯示完整單元',{language,width});
  await page.locator('[data-ip-entry="neoee"] .nvm-ip-entry-link').click();await page.waitForFunction(()=>location.hash==='#ip-neoee'&&document.activeElement===document.querySelector('#ip-neoee h2'));check(await page.locator('#ip-neoee').isVisible(),'操作圖入口可實際開啟具名單元',{language,width});
  const systems=JSON.parse(fs.readFileSync(path.join(root,'data/NVM比較與系統'+(language==='en'?'英文':'')+'.json'),'utf8')).systems;
  for(const system of systems){const prefix='system-'+system.id;await page.evaluate(hash=>location.hash=hash,prefix);check(await page.locator('#'+prefix+' .nvm-system-index a').count()===system.sections.length,'系統索引涵蓋全部正式章節',{language,width,id:system.id});if(width===1440)for(const [i,section] of system.sections.entries()){const text=await page.locator('#'+prefix+'-section-'+(i+1)).innerText();check([section.title,...section.body.split('\n\n')].every(value=>text.includes(value)),'系統段落保留原始正文及條件',{language,id:system.id,index:i+1});}
   await page.locator('#'+prefix+' .nvm-system-index a').first().click();await page.waitForFunction(id=>document.activeElement===document.querySelector('#'+id+'-section-1 h3'),prefix);check(await page.locator('#'+prefix+'-section-1').isVisible(),'系統章節定位至標題',{language,width,id:system.id});await page.locator('#'+prefix+'-section-1 .nvm-system-return').click();await page.waitForFunction(id=>document.activeElement===document.querySelector('#'+id+' .nvm-system-index a'),prefix);check(await page.locator('#'+prefix+'-contents').isVisible(),'返回索引聚焦第一個閱讀入口',{language,width,id:system.id});
  }
  if(width===1440){
   const ids=await page.locator('.nvm-topic-editorial').evaluateAll(es=>es.map(e=>e.id));
   check(ids.length===16,'十六個物理背景專題均使用一致編排',{language});
   for(const id of ids){
    await page.evaluate(hash=>location.hash=hash,id);await page.locator('#'+id).waitFor();
    const links=await page.locator('#'+id+' .nvm-topic-index a').evaluateAll(es=>es.map(e=>e.hash.slice(1)));
    check(links.length===9,'專題保留九個閱讀章節',{language,id});
    for(const target of links){await page.locator('#'+id+' .nvm-topic-index a[href="#'+target+'"]').click();await page.waitForFunction(t=>document.activeElement===document.getElementById(t).querySelector('h3'),target);check(await page.locator('#'+target).isVisible(),'章節連結展開並聚焦正確標題',{language,id,target});}
   }
  }
  await page.evaluate(()=>location.hash='topic-eeprom');await page.locator('#eeprom-reference').evaluate(e=>e.open=false);await page.locator('#topic-eeprom .nvm-topic-index a').first().click();await page.waitForFunction(()=>document.activeElement===document.querySelector('#topic-eeprom-storage h3'));check(await page.locator('#eeprom-reference').getAttribute('open')!==null,'EEPROM章節連結可展開收合背景內容',{language,width});
  await page.evaluate(()=>location.hash='foundry');
  const foundry=JSON.parse(fs.readFileSync(path.join(root,`data/NVM晶圓代工路線圖${language==='en'?'英文':''}.json`),'utf8'));
  const expectedYears=[...new Set(foundry.milestones.map(r=>r.year))].sort((a,b)=>b-a);
  check(JSON.stringify(await page.locator('[data-foundry-year]').evaluateAll(es=>es.map(e=>Number(e.dataset.foundryYear))))===JSON.stringify(expectedYears),'年度由近至遠且涵蓋原有全部年份',{language,width});
  if(width===1440)for(const record of foundry.milestones){const content=await page.locator('#milestone-'+record.id).innerText();check(content.includes(record.claim)&&content.includes(record.limit),'重新分組後保留原始主張與限制',{language,id:record.id});}
  await page.locator('#nvm-foundry-filter').selectOption('UMC');
  check(await page.locator('[data-foundry]:visible').count()===5&&await page.locator('[data-foundry-year]:visible').count()===5&&await page.locator('[data-foundry-year-link]:visible').count()===5,'公司篩選同步事件與可用年度',{language,width});
  await page.evaluate(()=>location.hash='foundry-year-2026');await page.locator('#foundry-year-2026').waitFor();
  check(await page.locator('#nvm-foundry-filter').inputValue()===''&&await page.locator('[data-foundry]:visible').count()===foundry.milestones.length,'直達被篩除年度可解除衝突條件',{language,width});
  check(await page.evaluate(()=>document.activeElement.matches('#foundry-year-2026>h3')),'年度跳轉聚焦標題',{language,width});
  check(await page.locator('.nvm-sidebar details[open]').count()===0,'離開單元分類後收合無關側欄',{language,width});
  await page.evaluate(()=>location.hash='sources');await page.locator('#nvm-source-search').fill('unmatched_source_20260910');
  check(await page.locator('#nvm-source-empty').isVisible()&&await page.locator('[data-source-record]:visible').count()===0,'來源查無結果有明確狀態',{language,width});
  await page.locator('#nvm-source-reset').focus();await page.keyboard.press('Enter');
  check(await page.locator('[data-source-record]:visible').count()===262&&await page.evaluate(()=>document.activeElement.id==='nvm-source-search'),'鍵盤清除恢復來源並返回搜尋焦點',{language,width});
  await page.locator('#nvm-source-search').fill('unmatched_source_20260910');await page.evaluate(()=>location.hash='source-INTRO-COURSE');await page.locator('#source-INTRO-COURSE').waitFor();
  check(await page.locator('#nvm-source-search').inputValue()===''&&await page.locator('#source-INTRO-COURSE').getAttribute('open')!==null,'來源深層連結解除衝突搜尋並展開',{language,width});
  await audit(page,language,width,'來源詳細內容','#source-INTRO-COURSE');
  if([1440,390].includes(width))await page.locator('#source-INTRO-COURSE').screenshot({path:path.join(out,`${language}-來源展開-${width}.png`),style:'.nvm-header{visibility:hidden}'});
  await page.evaluate(()=>location.hash='comparison');
  const comparison=JSON.parse(fs.readFileSync(path.join(root,`data/NVM比較與系統${language==='en'?'英文':''}.json`),'utf8'));
  check(await page.locator('.nvm-benchmark-index a').count()===comparison.benchmarks.length,'比較索引涵蓋全部具名實作',{language,width});
  for(const record of comparison.benchmarks){const study=page.locator('#benchmark-'+record.id);check(JSON.stringify(await study.locator('.nvm-benchmark-values li').allTextContents())===JSON.stringify(record.values)&&JSON.stringify(await study.locator('.nvm-benchmark-conditions li').allTextContents())===JSON.stringify(record.conditions),'數值與全部測量條件逐筆保留',{language,width,id:record.id});}
  await page.locator('.nvm-benchmark-index a').first().click();await page.waitForFunction(()=>location.hash==='#benchmark-CMP-BENCH-FRAM'&&document.activeElement.matches('#benchmark-CMP-BENCH-FRAM h3'));
  check(await page.evaluate(()=>document.activeElement.tagName==='H3'),'具名比較案例連結聚焦標題',{language,width});
  await page.locator('#benchmark-CMP-BENCH-FRAM .nvm-benchmark-return').click();await page.waitForFunction(()=>location.hash==='#comparison');
  await page.locator('.nvm-comparison-history-link a').click();await page.locator('#comparison-history details>summary').click();
  check(await page.locator('#comparison-history details').getAttribute('open')!==null&&await page.locator('.nvm-history-table tbody tr').count()===comparison.historicalTable.rows.length,'歷史表完整保留並可展開',{language,width});
  await audit(page,language,width,'歷史表展開','#comparison-history');
  await page.evaluate(()=>location.hash='ecosystem');await page.locator('[data-landscape-family-shortcut="MRAM"]').click();check(await page.locator('[data-landscape-row]:visible').count()===19&&await page.locator('#nvm-landscape-family').inputValue()==='MRAM','家族快捷按鈕與原生選單同步',{language,width});
  await page.locator('#nvm-landscape-reset').click();check(await page.locator('[data-landscape-row]:visible').count()===74&&await page.locator('[data-landscape-family-shortcut=""]').getAttribute('aria-pressed')==='true','重設同步全部家族狀態',{language,width});
  const entry=page.locator('#company-everspin-toggle'),drawer=entry.locator('.nvm-evidence-drawer');
  check(await drawer.getAttribute('open')===null&&await entry.locator('.nvm-maturity-limit').isVisible(),'來源收合時適用邊界仍直接可見',{language,width});
  await drawer.locator('summary').focus();await page.keyboard.press('Enter');
  check(await drawer.locator('a').first().isVisible(),'鍵盤可展開原始來源',{language,width});
  await audit(page,language,width,'來源展開','#company-everspin-toggle');
  if([1440,390].includes(width))await entry.screenshot({path:path.join(out,`${language}-來源分層-${width}.png`),style:'.nvm-header{visibility:hidden}'});
  const target=await drawer.locator('a').first().getAttribute('href');await drawer.locator('a').first().click();await page.locator(target).waitFor({state:'visible'});
  check(await page.locator(target).isVisible(),'展開來源連結可回到具名來源記錄',{language,width});
  await page.evaluate(()=>location.hash='research-everspin');await page.locator('#research-everspin .nvm-study-pagination a').last().click();
  check(await page.locator('#research-umc').isVisible()&&await page.evaluate(()=>location.hash==='#research-umc'),'下一篇導覽進入 UMC 專題',{language,width});
  await page.locator('#research-umc .nvm-study-pagination a').first().click();
  check(await page.evaluate(()=>location.hash==='#research-everspin'),'上一篇導覽返回 Everspin 專題',{language,width});
  await page.evaluate(()=>location.hash='research-everspin');await page.locator('#research-everspin [data-zoom-diagram]').click();check(await page.locator('dialog[open]').isVisible(),'圖形放大按鈕可操作',{language,width});await page.keyboard.press('Escape');
  await page.keyboard.press('Tab');await page.evaluate(()=>location.hash='research-panasonic');check(await page.evaluate(()=>getComputedStyle(document.activeElement).outlineStyle!=='none'),'鍵盤導覽後標題仍有可見焦點',{language,width});
  await context.close();
 }
 check(errors.length===0,'沒有未處理的瀏覽器腳本錯誤',{errors});
}catch(e){check(false,'驗收執行完整',{error:e.stack});}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
const failures=checks.filter(c=>!c.pass);fs.writeFileSync(path.join(out,'編排瀏覽器查核.json'),JSON.stringify({date:'2026-09-10',checks:checks.length,failures,errors,results:checks},null,2)+'\n');fs.writeFileSync(path.join(out,'可見文案.txt'),copy.join('\n\n'));
console.log(JSON.stringify({checks:checks.length,failed:failures.length,failures},null,2));if(failures.length)process.exitCode=1;
