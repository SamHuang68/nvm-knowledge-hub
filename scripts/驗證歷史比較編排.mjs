import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'qa/商用編排第八輪_20260911');
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
 if([1440,390].includes(width)&&['comparison-history','comparison-history-table','comparison-corrections','filtered'].includes(route)){
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
  const data=JSON.parse(fs.readFileSync(path.join(root,'data/NVM比較與系統'+(language==='en'?'英文':'')+'.json'),'utf8')),history=data.historicalTable;
  await page.goto(base+encodeURIComponent(language==='en'?'NVM技術全景.html':'NVM技術全景中文.html')+'?lang='+language+'#panorama',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('[data-nvm-panel]:not([hidden])').length===1);
  async function route(id,target){await page.evaluate(id=>location.hash=id,id);await page.waitForFunction(([id,target])=>location.hash==='#'+id&&document.activeElement===document.querySelector(target),[id,target]);}
  for(const [id,target] of [['comparison-history','#comparison-history h3'],['comparison-history-table','#comparison-history-table>summary'],['comparison-corrections','#comparison-corrections>h3']]){
   await route(id,target);await audit(page,language,width,id,'#comparison');
   if([1440,390].includes(width))await page.screenshot({path:path.join(out,`${language}-${id}-${width}.png`)});
  }
  const benchmarks=page.locator('.nvm-benchmark-study');check(await benchmarks.count()===data.benchmarks.length,'六個具名案例完整保留',{language,width});
  for(let i=0;i<data.benchmarks.length;i++){const item=data.benchmarks[i],text=await benchmarks.nth(i).textContent();for(const value of [item.implementation,item.technology,item.level,item.lesson,...item.values,...item.conditions])check(text.includes(value),'具名案例原文數值及條件保持完整',{language,width,id:item.id});}
  check(await page.locator('.nvm-correction').count()===history.corrections.length,'差異校正完整筆數',{language,width});
  for(let i=0;i<history.corrections.length;i++){
   const item=history.corrections[i],block=page.locator('#comparison-correction-'+(i+1));
   check(await block.locator('h4').textContent()===item.old.replace(/[。.!?！？]$/u,''),'待校正說法符合既有標題標點規則',{language,width,i});
   check(await block.locator('.nvm-correction-answer>p').textContent()===item.current,'更新判讀原文完整',{language,width,i});
   check(await block.locator('.nvm-correction-reason p').textContent()===item.reason,'差異原因原文完整',{language,width,i});
   check(await block.locator('.nvm-correction-label').innerText().then(t=>t.includes(language==='en'?'Claim to Correct':'需校正的說法')),'舊說法有明確校正標籤',{language,width,i});
   for(const id of item.sourceIds)check(await block.locator(`a[href="#source-${id}"]`).count()>0,'校正來源保留',{language,width,i,id});
  }
  await route('comparison-correction-11','#comparison-correction-11 h4');
  check(await page.locator('#comparison-correction-11').isVisible(),'單則校正深層定位',{language,width});
  await page.locator('#comparison-correction-11 .nvm-benchmark-return').click();await page.waitForFunction(()=>document.activeElement===document.querySelector('#comparison-corrections>h3'));
  check(true,'返回校正章節恢復語意焦點',{language,width});
  await route('comparison-history-table','#comparison-history-table>summary');
  check(await page.locator('#comparison-history-table').getAttribute('open')!==null,'歷史表深層連結展開內容',{language,width});
  const select=page.locator('#nvm-history-metric');
  check(await select.locator('option').count()===history.rows.length+1,'指標選單由正式資料產生',{language,width});
  for(let i=0;i<history.rows.length;i++){
   const row=history.rows[i];await select.selectOption(String(i));
   check(await page.locator('.nvm-history-table tbody tr:not([hidden])').count()===1,'矩陣只顯示所選指標',{language,width,i});
   check(await page.locator('.nvm-history-cards [data-history-metric]:not([hidden])').count()===history.columns.length,'行動條目顯示相同指標',{language,width,i});
   check(await page.locator('.nvm-history-notes').getAttribute('open')!==null&&await page.locator('.nvm-history-notes [data-history-metric]:not([hidden])').textContent()===row.metric+row.note,'篩選自動顯示完整測量條件',{language,width,i});
   check(JSON.stringify(await page.locator(`.nvm-history-table tr[data-history-metric="${i}"] td`).allTextContents())===JSON.stringify(row.values),'歷史矩陣所有數值逐格保持完整',{language,width,i});
   check(JSON.stringify(await page.locator(`.nvm-history-cards [data-history-metric="${i}"] dd`).allTextContents())===JSON.stringify(row.values),'行動版所有數值逐格保持完整',{language,width,i});
  }
  await audit(page,language,width,'filtered','#comparison-history-table');
  if([1440,390].includes(width))await page.screenshot({path:path.join(out,`${language}-filtered-${width}.png`)});
  const mode=await page.locator('.nvm-history-matrix').isVisible();check(mode===(width>1360),'寬螢幕矩陣與窄螢幕技術條目切換',{language,width});
  await page.locator('#nvm-history-reset').focus();await page.keyboard.press('Enter');
  check(await select.evaluate(e=>document.activeElement===e)&&await select.inputValue()===''&&await page.locator('.nvm-history-table tbody tr:not([hidden])').count()===history.rows.length,'鍵盤重設恢復全部指標與焦點',{language,width});
  const targets=await page.locator('.nvm-history-controls :is(select,button)').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));check(targets.every(h=>h>=44),'指標控制項觸控尺寸',{language,width});
  await page.locator('.language-toggle').click();await page.waitForFunction(lang=>document.documentElement.dataset.contentLanguage!==lang&&document.querySelectorAll('[data-nvm-panel]:not([hidden])').length===1,language);
  check(new URL(page.url()).hash==='#comparison-history-table'&&await page.locator('#comparison-history-table').getAttribute('open')!==null,'雙語切換保留歷史表位置與展開狀態',{language,width});
  await page.close();
 }
}catch(e){errors.push(e.stack);}finally{await browser?.close();server.close();}
const report={time:new Date().toISOString(),widths,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass),errors,checks};fs.writeFileSync(path.join(out,'歷史比較瀏覽器查核.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed,errors},null,2));if(report.failed.length||errors.length)process.exitCode=1;
