import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const root=path.resolve(import.meta.dirname,'..');
const output=path.join(root,'qa','全站雙語與圖解改版_20260910');
fs.mkdirSync(output,{recursive:true});
const base=process.env.NVM_QA_BASE || 'http://127.0.0.1:8765/';
const data=JSON.parse(fs.readFileSync(path.join(root,'data/NVM知識資料英文.json'),'utf8'));
const routes=['panorama','comparison','foundry',...data.topics.map(t=>'topic-'+t.id),...data.comparison.systems.map(s=>'system-'+s.id),'patents','glossary','sources'];
const failures=[],checks=[],errors=[];
const browser=await chromium.launch({headless:true});
const note=(condition,description,detail={})=>{checks.push({description,passed:Boolean(condition),...detail});if(!condition)failures.push({description,...detail});};
const inspect=()=>{
  const visible=e=>e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true});
  const content=document.querySelector('[data-nvm-panel]:not([hidden])') || document.querySelector('main');
  const text=(content?.innerText || '').trim();
  const chinese=text.match(/[\u3400-\u9fff]+/gu) || [];
  const clipped=[...document.querySelectorAll('main p,main h1,main h2,main h3,main button,main input,main select')].filter(e=>visible(e)).filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.textContent.slice(0,80));
  const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
  return {language:document.documentElement.lang,overflow:document.documentElement.scrollWidth-innerWidth,clipped,chinese:[...new Set(chinese)],duplicateIds:ids.filter((id,i)=>ids.indexOf(id)!==i),active:[...document.querySelectorAll('[data-nvm-panel]')].filter(e=>!e.hidden).map(e=>e.id)};
};
try {
  for(const language of ['en','zh']) for(const width of [1440,1024,768,390,320]) {
    const context=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push({language,width,message:error.message}));
    const file=language==='en'?'NVM技術全景.html':'NVM技術全景中文.html';
    await page.goto(new URL(file+'?lang='+language,base).href,{waitUntil:'networkidle'});
    for(const route of routes) {
      await page.evaluate(id=>{location.hash=id;},route);
      await page.waitForFunction(id=>document.querySelector('[data-nvm-panel]:not([hidden])')?.id===id,route);
      const audit=await page.evaluate(inspect);
      note(audit.language===(language==='en'?'en':'zh-Hant') && audit.overflow<=1 && !audit.clipped.length && !audit.duplicateIds.length && (language==='zh'||!audit.chinese.length),'專題語言、版面與識別碼',{language,width,route,...audit});
      if(width===390 && route==='topic-stt') {
        await page.locator('#topic-stt [data-zoom-diagram]').click();
        note(await page.locator('.bc-zoom-dialog').isVisible(),'手機元件圖可放大',{language,width});
        note(await page.locator('.bc-zoom-dialog svg').evaluate(e=>e.getBoundingClientRect().width>=850),'放大向量保留可讀寬度',{language,width});
        await page.keyboard.press('Escape');
        note(!await page.locator('.bc-zoom-dialog').isVisible(),'大圖可用 Escape 關閉',{language,width});
      }
    }
    await context.close();
  }
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push({message:error.message}));
  await page.goto(base,{waitUntil:'networkidle'});
  note(await page.locator('html').getAttribute('lang')==='en','首次造訪首頁預設英文');
  note(!/[\u3400-\u9fff]/u.test(await page.locator('main').innerText()),'英文首頁無中文正文殘留');
  await page.locator('#searchTrigger').click();
  await page.locator('#searchInput').fill('SOT');
  await page.waitForFunction(()=>document.querySelectorAll('.search-result-item').length===1);
  note((await page.locator('.search-result-item').innerText()).includes('SOT-MRAM'),'全站搜尋顯示英文專題標題');
  await page.locator('#searchInput').press('Enter');
  await page.waitForURL(/#topic-sot$/);
  note(await page.locator('html').getAttribute('lang')==='en','英文搜尋保留專題語言');
  await page.locator('.language-toggle').click();
  await page.waitForFunction(()=>document.documentElement.lang==='zh-Hant');
  note(decodeURIComponent(page.url()).includes('NVM技術全景中文.html') && page.url().endsWith('#topic-sot'),'切換中文版保留原專題');
  await page.locator('.nvm-header .brand').click();
  await page.waitForLoadState('networkidle');
  note(await page.locator('html').getAttribute('lang')==='zh-Hant','返回首頁保留中文偏好');
  await page.locator('#searchTrigger').click();
  await page.locator('#searchInput').fill('GLOBALFOUNDRIES');
  await page.locator('.search-result-item[href$="#foundry"]').click();
  await page.waitForFunction(()=>document.documentElement.lang==='zh-Hant' && location.hash==='#foundry');
  note(decodeURIComponent(page.url()).includes('NVM技術全景中文.html'),'中文搜尋保留路線圖語言');
  await page.locator('.language-toggle').click();
  await page.waitForFunction(()=>document.documentElement.lang==='en' && location.hash==='#foundry');
  note(decodeURIComponent(page.url()).includes('NVM技術全景.html'),'切換英文保留路線圖');
  await page.reload({waitUntil:'networkidle'});
  note(await page.locator('html').getAttribute('lang')==='en','重新載入保留語言');
  await page.goto(new URL('NVM技術全景.html?lang=en#sources',base).href,{waitUntil:'networkidle'});
  const downloads=await page.locator('.nvm-actions a').evaluateAll(links=>links.map(a=>a.href));
  for(const url of downloads) {
    const response=await context.request.get(url); note(response.ok(),'英文教材下載檔可讀取',{url:new URL(url).pathname});
    if(url.endsWith('.json'))note((await response.json()).language==='en','英文資料匯出語言正確');
  }
  for(const width of [1440,1024,768,390,320]) {
    await page.setViewportSize({width,height:1000});
    await page.goto(new URL('index.html?lang=en',base).href,{waitUntil:'networkidle'});
    const audit=await page.evaluate(inspect);
    note(audit.overflow<=1&&!audit.clipped.length&&!audit.duplicateIds.length&&!audit.chinese.length,'首頁響應式版面',{width,...audit});
    if([1440,390].includes(width))await page.screenshot({path:path.join(output,`首頁-英文-${width}.png`),fullPage:true});
  }
  await context.close();
} catch(error) { failures.push({description:'驗證流程中斷',message:error.message}); }
finally {await browser.close();}
if(errors.length)failures.push({description:'頁面 JavaScript 錯誤',errors});
const result={passed:failures.length===0,checks:checks.length,routes:routes.length,languages:['en','zh-Hant'],widths:[1440,1024,768,390,320],failures,results:checks};
fs.writeFileSync(path.join(output,'全站雙語查核.json'),JSON.stringify(result,null,2)+'\n');
console.log(`雙語查核：${checks.length} 項，${failures.length} 個失敗`);
if(failures.length){console.error(JSON.stringify(failures.slice(0,8),null,2));process.exitCode=1;}
