import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'qa/商用編排第十輪_20260911');
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
 if([1440,390].includes(width)&&['ip-neobit','ip-op-neomtp-write','patent-US7417300B2'].includes(route)){
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
const baseline=process.argv.includes('--baseline');
const routes=[['ip-neobit','#ip-neobit [data-engineering-zoom]'],['ip-op-neomtp-write','#ip-op-neomtp-write [data-engineering-zoom]'],['patent-US7417300B2','#patent-US7417300B2 [data-engineering-zoom]']];
try {
 browser=await chromium.launch({headless:true});
 for(const language of ['zh','en'])for(const width of baseline?[390]:widths){
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+encodeURIComponent(language==='en'?'NVM技術全景.html':'NVM技術全景中文.html')+'?lang='+language+'#panorama',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelectorAll('[data-nvm-panel]:not([hidden])').length===1);
  for(const [route,selector] of routes){
   await page.evaluate(id=>location.hash=id,route);await page.waitForFunction(id=>location.hash==='#'+id&&!document.getElementById(id)?.closest('[data-nvm-panel]').hidden,route);
   const button=page.locator(selector).first();await button.waitFor();
   const original=await button.evaluate(b=>b.closest('[data-engineering-figure]').querySelector('svg').outerHTML);
   await button.click();const dialog=page.locator('.nvm-engineering-dialog'),svg=dialog.locator('.nvm-engineering-zoom-scroll svg'),select=dialog.locator('select');
   check(await dialog.isVisible(),'放大圖視窗開啟',{language,width,route});
   check(await select.inputValue()==='1','保留預設一倍檢視',{language,width,route});
   if(baseline){check(true,'原始檢視尺寸',{language,width,route,geometry:await svg.evaluate(e=>({figure:e.getBoundingClientRect().width,viewport:e.parentElement.clientWidth}))});await page.screenshot({path:path.join(out,`${language}-調整前-${route}-${width}.png`)});await page.keyboard.press('Escape');continue;}
   const notes=await dialog.locator('.nvm-engineering-zoom-notes').textContent();check(notes.length>30,'放大圖保留說明與圖例',{language,width,route});
   const fit=dialog.locator('[data-engineering-fit]');await fit.focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.querySelector('.nvm-engineering-zoom-scroll').scrollWidth<=document.querySelector('.nvm-engineering-zoom-scroll').clientWidth+1);
   check(await select.inputValue()==='fit','完整圖面操作同步倍率選單',{language,width,route});
   const geometry=await svg.evaluate(e=>({svg:e.getBoundingClientRect().width,container:e.parentElement.clientWidth,scroll:e.parentElement.scrollWidth}));check(geometry.svg>0&&geometry.scroll<=geometry.container+1,'完整圖面不產生水平裁切',{language,width,route,geometry});
   await audit(page,language,width,route,'.nvm-engineering-dialog');
   if([1440,390].includes(width))await page.screenshot({path:path.join(out,`${language}-${route}-完整圖面-${width}.png`)});
   await page.setViewportSize({width:Math.max(312,width-70),height:900});await page.waitForFunction(()=>document.querySelector('.nvm-engineering-zoom-scroll').scrollWidth<=document.querySelector('.nvm-engineering-zoom-scroll').clientWidth+1);
   check(true,'調整視窗後維持完整圖面',{language,width,route});await page.setViewportSize({width,height:1000});
   await select.selectOption('2');check(await svg.evaluate(e=>e.getBoundingClientRect().width)>=1800,'仍可切換兩倍詳細檢視',{language,width,route});
   check(await dialog.locator('.nvm-engineering-zoom-notes').textContent()===notes,'倍率切換不改變說明與圖例',{language,width,route});
   await dialog.locator('.nvm-engineering-dialog-body').evaluate(e=>e.scrollTop=e.scrollHeight);
   const toolbar=await dialog.locator('.nvm-engineering-zoom-toolbar').boundingBox(),box=await dialog.boundingBox();check(toolbar.y>=box.y&&toolbar.y+toolbar.height<=box.y+box.height,'捲動圖例時控制列仍在視窗內',{language,width,route});
   await fit.click();check(await dialog.locator('.nvm-engineering-dialog-body').evaluate(e=>e.scrollTop)===0,'從圖例返回完整圖面時移回圖面起點',{language,width,route});
   const sizes=await dialog.locator('.nvm-engineering-zoom-toolbar :is(button,select)').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));check(sizes.every(h=>h>=44),'圖解控制項觸控尺寸',{language,width,route});
   await page.keyboard.press('Escape');check(await button.evaluate(e=>document.activeElement===e),'關閉後焦點回到原始入口',{language,width,route});
   check(await button.evaluate(b=>b.closest('[data-engineering-figure]').querySelector('svg').outerHTML)===original,'原始SVG完整保持不變',{language,width,route});
  }await page.close();
 }
}catch(e){errors.push(e.stack);}finally{await browser?.close();server.close();}
const report={time:new Date().toISOString(),widths,passed:checks.filter(c=>c.pass).length,failed:checks.filter(c=>!c.pass),errors,checks};fs.writeFileSync(path.join(out,baseline?'圖解基準查核.json':'圖解閱讀瀏覽器查核.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed,errors},null,2));if(report.failed.length||errors.length)process.exitCode=1;
