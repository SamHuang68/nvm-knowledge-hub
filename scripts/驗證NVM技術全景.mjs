import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'qa', 'NVM技術全景_20260910');
fs.mkdirSync(output, { recursive: true });
const base = 'http://127.0.0.1:8765/NVM技術全景中文.html?lang=zh';
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'NVM知識資料.json'), 'utf8'));
const failures = [];
const audits = [];
const browser = await chromium.launch({ headless: true });
const routes = ['panorama','comparison','foundry',...data.topics.map(topic=>'topic-'+topic.id),...data.comparison.systems.map(system=>'system-'+system.id),'patents','glossary','sources'];
const widths = [1440,1361,1360,1280,1101,1100,901,900,800,768,621,620,390,312];

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 960 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('requestfailed', request => errors.push(request.url()+' '+request.failure()?.errorText));
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(base, { waitUntil: 'networkidle' });
    for (const route of routes) {
      await page.evaluate(id => { location.hash = id; }, route);
      await page.waitForFunction(id => !document.getElementById(id).hidden, route);
      const audit = await page.evaluate(() => {
        const active = [...document.querySelectorAll('[data-nvm-panel]')].filter(item => !item.hidden);
        const doc = document.documentElement;
        const overflow = Math.max(doc.scrollWidth-doc.clientWidth,document.body.scrollWidth-document.body.clientWidth);
        const svgTextOutside = [];
        const svgTextOverlap = [];
        for (const svg of document.querySelectorAll('.nvm-cell svg')) {
          if (!svg.getClientRects().length) continue;
          const frame = svg.getBoundingClientRect();
          const texts = [...svg.querySelectorAll('text')].filter(item => getComputedStyle(item).display !== 'none');
          for (const text of texts) {
            const box = text.getBoundingClientRect();
            if (box.left < frame.left-1 || box.right > frame.right+1) svgTextOutside.push(text.textContent);
          }
          for (let i=0;i<texts.length;i++) for (let j=i+1;j<texts.length;j++) {
            const a=texts[i].getBoundingClientRect(),b=texts[j].getBoundingClientRect();
            if (Math.min(a.right,b.right)-Math.max(a.left,b.left)>2 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2) svgTextOverlap.push(texts[i].textContent+'／'+texts[j].textContent);
          }
        }
        const clipped = [...document.querySelectorAll('main input,main select,main button,main td,main p,main summary')].filter(item=>item.getClientRects().length).filter(item=>{
          const box=item.getBoundingClientRect();
          return box.left < -1 || box.right > innerWidth+1 || item.scrollWidth > item.clientWidth+2;
        }).map(item=>item.tagName+':'+item.textContent.trim().slice(0,35));
        return { active: active.map(item=>item.id), overflow, clipped, svgTextOutside, svgTextOverlap };
      });
      audits.push({width,route,...audit});
      if (audit.active.length!==1 || audit.active[0]!==route || audit.overflow>1 || audit.clipped.length || audit.svgTextOutside.length || audit.svgTextOverlap.length) failures.push({width,route,...audit});
      if ([1440,390].includes(width) && ['panorama','topic-stt','topic-nand','foundry','comparison'].includes(route)) await page.screenshot({path:path.join(output,`${width}-${route}.png`),fullPage:route==='topic-stt'});
    }
    if (errors.length) failures.push({width,errors});
    await page.close();
  }

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(base, { waitUntil:'networkidle' });
  const sourceAudit = await page.evaluate(() => {
    const ids=[...document.querySelectorAll('[id]')].map(item=>item.id);
    return {
      duplicateIds:ids.filter((id,index)=>ids.indexOf(id)!==index),
      missingTargets:[...document.querySelectorAll('a[href^="#"]')].filter(link=>!document.getElementById(decodeURIComponent(link.hash.slice(1)))).map(link=>link.hash),
      h1:document.querySelectorAll('h1').length
    };
  });
  if (sourceAudit.duplicateIds.length || sourceAudit.missingTargets.length || sourceAudit.h1!==1) failures.push({sourceAudit});
  await page.locator('#nvm-search').fill('SOT');
  if (await page.locator('[data-topic-row]:visible').count()!==1) failures.push('SOT 搜尋未精確得到一個專題');
  await page.locator('#nvm-family').selectOption('charge');
  if (await page.locator('[data-topic-row]:visible').count()!==0) failures.push('交集篩選未顯示空結果');
  await page.locator('#nvm-reset').click();
  if (await page.locator('[data-topic-row]:visible').count()!==data.topics.length) failures.push('清除篩選未恢復全部正式專題');
  await page.locator('#nvm-stage').selectOption('研究展示');
  if (!await page.locator('[data-topic-row]:visible').count()) failures.push('研究展示篩選無結果');
  await page.goto(base+'#topic-stt',{waitUntil:'networkidle'});
  await page.locator('#topic-stt [data-operation-select="read"]').click();
  if (await page.locator('#topic-stt [data-operation-detail]:visible').getAttribute('data-operation-detail')!=='read') failures.push('操作切換未顯示讀取');
  await page.locator('.nvm-skip').focus();
  await page.keyboard.press('Enter');
  if (await page.locator('[data-nvm-panel]:visible').getAttribute('id')!=='topic-stt') failures.push('跳至主內容改變目前專題');
  await page.goto(base+'#foundry',{waitUntil:'networkidle'});
  await page.locator('#nvm-foundry-filter').selectOption('GF');
  if (await page.locator('[data-foundry]:visible').evaluateAll(items=>items.some(item=>item.dataset.foundry!=='GF'))) failures.push('晶圓代工篩選顯示其他公司');
  const patentId=data.topics.find(topic=>topic.id==='stt').patents[0].id;
  await page.goto(base+'#patent-'+patentId,{waitUntil:'networkidle'});
  if (await page.locator('[data-nvm-panel]:visible').getAttribute('id')!=='patents' || !await page.locator('#patent-'+patentId).evaluate(item=>item.open)) failures.push('專利深層連結未展開');
  const sourceId=data.sources[0].id;
  await page.goto(base+'#source-'+sourceId,{waitUntil:'networkidle'});
  if (await page.locator('[data-nvm-panel]:visible').getAttribute('id')!=='sources' || !await page.locator('#source-'+sourceId).evaluate(item=>item.open)) failures.push('來源深層連結未展開');
  await page.goto(base+'#topic-sonos',{waitUntil:'networkidle'});
  await page.reload({waitUntil:'networkidle'});
  if (await page.locator('[data-nvm-panel]:visible').getAttribute('id')!=='topic-sonos') failures.push('重新載入遺失專題');
  await page.locator('.nvm-sidebar a[href="#topic-stt"]').click();
  await page.goBack();
  await page.waitForFunction(()=>!document.getElementById('topic-sonos').hidden);

  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await mobile.goto(base,{waitUntil:'networkidle'});
  await mobile.locator('#nvm-contents-toggle').click();
  await mobile.locator('.nvm-sidebar a[href="#topic-ecm"]').click();
  await mobile.waitForFunction(()=>!document.getElementById('topic-ecm').hidden);
  if (await mobile.locator('[data-nvm-panel]:visible').getAttribute('id')!=='topic-ecm' || await mobile.locator('#nvm-contents-toggle').getAttribute('aria-expanded')!=='false') failures.push('手機目錄未正確選題並收合');
  await mobile.locator('#nvm-contents-toggle').click();
  await mobile.locator('.nvm-sidebar a[href="#topic-ecm"]').click();
  if (await mobile.locator('#nvm-contents-toggle').getAttribute('aria-expanded')!=='false') failures.push('手機重選目前專題未收合目錄');
  if (!await mobile.locator('#topic-ecm h2').evaluate(item=>item===document.activeElement)) failures.push('手機重選目前專題未將焦點留在標題');
  await mobile.close();
  const nojs=await browser.newPage({javaScriptEnabled:false});
  await nojs.goto(base,{waitUntil:'networkidle'});
  if (await nojs.locator('[data-operation-detail][hidden]').count()) failures.push('無 JavaScript 仍有隱藏操作文字');
  if (await nojs.locator('[data-nvm-panel]:visible').count()!==routes.length) failures.push('無 JavaScript 未顯示全部專題');
  await nojs.close();
  await page.emulateMedia({media:'print'});
  if (await page.locator('[data-operation-detail]').count()!==await page.locator('[data-operation-detail]:visible').count()) failures.push('列印未顯示全部操作');
  const report={date:data.revision,viewports:widths,routeCount:routes.length,renderCount:audits.length,sourceAudit,failures,audits};
  fs.writeFileSync(path.join(output,'檢查結果.json'),JSON.stringify(report,null,2)+'\n','utf8');
  if (failures.length) {
    console.error(`NVM 網站檢查未通過：${failures.length} 項\n${JSON.stringify(failures.slice(0,30),null,2)}`);
    process.exitCode=1;
  } else console.log(`通過：${audits.length} 組路由／寬度檢查、十六個技術與 IP 專題、來源與專利深層連結、搜尋篩選、操作切換、手機目錄、重新載入、返回、無 JavaScript 與列印可讀性。`);
} finally { await browser.close(); }
