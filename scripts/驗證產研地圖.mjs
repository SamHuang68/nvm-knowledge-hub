import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..'),output=path.join(root,'qa/產研擴充_20260910');
fs.mkdirSync(output,{recursive:true});
const results=[],errors=[],failures=[];
const check=(ok,label,details={})=>{const item={ok:Boolean(ok),label,...details};results.push(item);if(!ok)failures.push(item);};
const data=['','英文'].map(s=>JSON.parse(fs.readFileSync(path.join(root,`data/NVM知識資料${s}.json`),'utf8')));
check(data[0].research.landscape.length===data[1].research.landscape.length,'雙語具名路線數量一致');
for(const [index,d]of data.entries()){
 const r=d.research,ids=new Set(d.sources.map(s=>s.id));
 check(r.landscape.length>=60&&new Set(r.landscape.map(x=>x.family)).size>=8,'具名路線涵蓋主要技術家族',{language:index?'en':'zh',routes:r.landscape.length});
 check(new Set(r.landscape.map(x=>x.id)).size===r.landscape.length,'具名路線 ID 不重複');
 check(r.landscape.every(x=>x.sourceIds.length&&x.sourceIds.every(id=>ids.has(id))),'所有具名路線有可解析來源');
 for(const name of ['Everspin','Samsung','Renesas','TSMC','GlobalFoundries','UMC','Panasonic','IBM','ITRI','Weebit','Infineon','Micron','Kioxia','TI','Texas Instruments'])check(r.landscape.some(x=>(x.name+' '+x.search).toLowerCase().includes(name.toLowerCase())),'代表廠商／機構有入口',{language:index?'en':'zh',name});
 check(r.landscape.filter(x=>x.id.startsWith('everspin')).length>=3,'Everspin 三條產品路線分開');
 check(d.foundry.milestones.filter(x=>x.foundry==='UMC').length===5,'UMC 五個里程碑已納入正式年表');
}
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400);res.end();return;}if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}res.writeHead(200,{'content-type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}/`;let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const [index,language]of ['zh','en'].entries())for(const width of [1440,1024,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const file=language==='zh'?'NVM技術全景中文.html':'NVM技術全景.html';
  await page.goto(new URL(file+'?lang='+language+'#ecosystem',base).href,{waitUntil:'networkidle'});await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
  check(await page.locator('#ecosystem').isVisible(),'深層連結顯示產業地圖',{language,width});
  const all=data[index].research.landscape.length;
  check(await page.locator('[data-landscape-row]:visible').count()===all,'預設顯示全部具名路線',{language,width});
  await page.locator('#nvm-landscape-search').fill('Everspin');
  check(await page.locator('[data-landscape-row]:visible').count()>=3&&await page.locator('#company-everspin-toggle').isVisible()&&await page.locator('#company-everspin-1gb-ddr').isVisible()&&await page.locator('#company-everspin-xspi').isVisible(),'搜尋可找齊 Everspin 產品線',{language,width});
  await page.locator('#nvm-landscape-family').selectOption('NAND');
  check(await page.locator('#nvm-landscape-empty').isVisible(),'無結果狀態可辨識',{language,width});
  await page.evaluate(()=>{location.hash='company-everspin-xspi';});await page.waitForFunction(()=>document.getElementById('company-everspin-xspi').checkVisibility());
  check(await page.locator('#nvm-landscape-search').inputValue()===''&&await page.locator('#nvm-landscape-family').inputValue()===''&&await page.evaluate(()=>document.activeElement.id==='company-everspin-xspi'),'深層連結解除衝突篩選並同步焦點',{language,width});
  await page.locator('#nvm-landscape-family').selectOption('MRAM');
  check(await page.locator('[data-landscape-row]:visible').evaluateAll(rows=>rows.every(r=>r.dataset.family==='MRAM')),'技術家族篩選精準',{language,width});
  await page.locator('#nvm-landscape-reset').focus();await page.keyboard.press('Enter');
  check(await page.locator('[data-landscape-row]:visible').count()===all&&await page.evaluate(()=>document.activeElement.id==='nvm-landscape-search'),'鍵盤重設與焦點返回搜尋',{language,width});
  for(const route of ['ecosystem','research',...data[index].research.profiles.map(p=>'research-'+p.id),'foundry']){
   await page.evaluate(hash=>{location.hash=hash;},route);await page.waitForFunction(id=>document.getElementById(id)?.checkVisibility(),route);
   const audit=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth}));check(audit.overflow<=1,'新頁與專題沒有頁面水平溢出',{language,width,route,...audit});
   if(language==='en'&&['ecosystem','research'].includes(route)){const copy=await page.locator('#'+route).innerText();check(!/[\u3400-\u9fff]/u.test(copy),'英文可見內容沒有未翻譯中文',{width,route,hits:copy.match(/[\u3400-\u9fff]+/gu)});}
   if(width===1440&&language==='zh'&&['ecosystem','research','research-everspin','research-panasonic','research-itri'].includes(route)||width===390&&['ecosystem','research-everspin'].includes(route))await page.screenshot({path:path.join(output,`${language}-${width}-${route}.png`)});
  }
  await page.evaluate(()=>{location.hash='research-everspin';});await page.locator('#research-everspin [data-zoom-diagram]').click();
  check(await page.locator('dialog[open]').isVisible()&&await page.locator('dialog[open] svg').count()===1,'機制圖可放大閱讀',{language,width});await page.keyboard.press('Escape');check(await page.locator('dialog[open]').count()===0,'Escape 關閉放大圖',{language,width});
  const source=data[index].research.profiles.find(p=>p.id==='everspin').sections[2].sourceIds[0];
  await page.locator('#research-everspin .nvm-source-links a[href="#source-'+source+'"]').first().click();await page.waitForFunction(id=>document.getElementById(id)?.checkVisibility(),'source-'+source);check(await page.locator('#sources').isVisible(),'專題引用可回到來源記錄',{language,width});
  await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();
 await page.goto(base+'index.html?lang=zh',{waitUntil:'networkidle'});await page.keyboard.press('Control+k');await page.locator('#searchInput').fill('Everspin');await page.waitForTimeout(300);check((await page.locator('#searchResults').innerText()).includes('Everspin'),'首頁全站搜尋可以找到 Everspin');await page.screenshot({path:path.join(output,'首頁搜尋-Everspin.png')});await context.close();
 check(errors.length===0,'瀏覽器無未處理腳本錯誤',{errors});
}catch(e){check(false,'瀏覽器驗收執行成功',{error:e.stack});}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
fs.writeFileSync(path.join(output,'瀏覽器查核.json'),JSON.stringify({date:'2026-09-10',checks:results.length,failures,errors,results},null,2)+'\n');
console.log(JSON.stringify({checks:results.length,failed:failures.length,errors,failures},null,2));if(failures.length)process.exitCode=1;
