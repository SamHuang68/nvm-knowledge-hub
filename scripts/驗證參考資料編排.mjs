import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'qa/商用編排第七輪_20260911');
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
 if([1440,390].includes(width)&&['patents','glossary','patent-open'].includes(route)){
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
try {
 browser=await chromium.launch({headless:true});
 for(const language of ['zh','en']) for(const width of widths) {
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));
  const suffix=language==='en'?'英文':'';
  const read=name=>JSON.parse(fs.readFileSync(path.join(root,'data',name+suffix+'.json'),'utf8'));
  const topics=[...read('NVM電荷專題').topics,...read('NVM新興專題').topics];
  const patents=topics.flatMap(t=>t.patents),terms=read('NVM比較與系統').glossary;
  await page.goto(base+encodeURIComponent(language==='en'?'NVM技術全景.html':'NVM技術全景中文.html')+'?lang='+language+'#panorama',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelectorAll('[data-nvm-panel]:not([hidden])').length===1);
  async function route(id,focus){await page.evaluate(id=>location.hash=id,id);await page.waitForFunction(([id,focus])=>location.hash==='#'+id&&document.activeElement===document.querySelector(focus),[id,focus]);}
  for(const kind of ['patent','glossary']) {
   const panel=kind==='patent'?'patents':'glossary',selector=`[data-${kind}-record]`,items=kind==='patent'?patents:terms;
   await route(panel,'#'+panel+' h2');
   check(await page.locator(selector).count()===items.length,'正式資料筆數完整',{language,width,kind});
   await audit(page,language,width,panel,'#'+panel);
   const targets=await page.locator(`#${panel} .nvm-reference-controls :is(input,select,button)`).evaluateAll(nodes=>nodes.map(n=>({id:n.id,h:n.getBoundingClientRect().height,w:n.getBoundingClientRect().width})));
   check(targets.every(n=>n.h>=44&&n.w>=44),'查找控制具備觸控尺寸',{language,width,kind,targets});
   if([1440,390].includes(width)) await page.screenshot({path:path.join(out,`${language}-${panel}-${width}.png`)});
   for(let i=0;i<items.length;i++) {
    const record=page.locator(selector).nth(i),item=items[i];
    if(kind==='glossary') {
     check(await record.locator('dt a').textContent()===item.term&&await record.locator('dd').textContent()===item.definition,'術語與定義逐筆保持完整',{language,width,i});
    } else {
     const text=await record.textContent();
     for(const field of ['id','problem','priority','assignee','figures','mechanism','claimReading','limit'])check(text.includes(item[field]),'專利原始欄位保持完整',{language,width,id:item.id,field});
     check(await record.locator(`a[href="${item.url}"]`).count()>0,'專利原始來源保留',{language,width,id:item.id});
    }
   }
   const input=page.locator(`#nvm-${kind}-search`),reset=page.locator(`#nvm-${kind}-reset`);
   await input.fill('無此結果ZXQ987');
   check(await page.locator(selector+':not([hidden])').count()===0&&await page.locator(`#nvm-${kind}-empty`).isVisible(),'零結果有清楚提示',{language,width,kind});
   const firstId=await page.locator(selector).first().getAttribute('id');
   await route(firstId,'#'+firstId+(kind==='patent'?' summary':' dt'));
   check(await input.inputValue()===''&&await page.locator(selector+':not([hidden])').count()===items.length,'深層連結清除衝突篩選並恢復焦點',{language,width,kind});
   if(kind==='patent') {
    check(await page.locator('#'+firstId).getAttribute('open')!==null,'專利深層連結展開內容',{language,width});
    await audit(page,language,width,'patent-open','#patents');
    if([1440,390].includes(width))await page.screenshot({path:path.join(out,`${language}-patent-open-${width}.png`)});
    const zoom=page.locator('#'+firstId+' [data-engineering-zoom]').first();
    if(await zoom.count()) {
     await zoom.click();
     check(await page.locator('.nvm-engineering-dialog[open]').count()===1,'專利原圖放大入口正常',{language,width});
     await page.locator('.nvm-engineering-dialog select').selectOption('2');
     check(await page.locator('.nvm-engineering-zoom-scroll svg').evaluate(e=>e.getBoundingClientRect().width)>=1800,'放大圖倍率可調整',{language,width});
     await page.keyboard.press('Escape');
     check(await zoom.evaluate(e=>document.activeElement===e),'關閉放大圖後焦點回到入口',{language,width});
    }
    await page.locator('#'+firstId+' summary').click();
    const topic=topics.find(t=>t.patents.length);
    await page.locator('#nvm-patent-topic').selectOption(topic.id);
    check(await page.locator(selector+':not([hidden])').count()===topic.patents.length,'技術篩選僅顯示所選專利',{language,width});
    check(await page.locator('[data-patent-group]:not([hidden])').count()===1,'空白技術分組同步隱藏',{language,width});
    await input.fill(patents[0].id.toLowerCase());
    check(await page.locator(selector+':not([hidden])').count()===1,'專利編號搜尋不區分大小寫',{language,width});
   } else {
    await input.fill(terms[0].term);
    check(await page.locator(selector+':not([hidden])').count()>0,'術語名稱可查得結果',{language,width});
   }
   await reset.focus();await page.keyboard.press('Enter');
   check(await input.evaluate(e=>document.activeElement===e)&&await page.locator(selector+':not([hidden])').count()===items.length,'鍵盤清除後恢復完整資料與搜尋焦點',{language,width,kind});
  }
  await page.locator('.language-toggle').click();
  await page.waitForFunction(language=>document.documentElement.dataset.contentLanguage!==language&&document.querySelectorAll('[data-nvm-panel]:not([hidden])').length===1,language);
  check(await page.locator('#glossary').isVisible()&&new URL(page.url()).hash==='#glossary-term-01','語系切換保持術語深層位置',{language,width});
  await page.close();
 }
} catch(e) {errors.push(e.stack);} finally {await browser?.close();server.close();}
const report={time:new Date().toISOString(),widths,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass),errors,checks};
fs.writeFileSync(path.join(out,'參考資料瀏覽器查核.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({passed:report.passed,failed:report.failed,errors},null,2));
if(report.failed.length||errors.length)process.exitCode=1;
