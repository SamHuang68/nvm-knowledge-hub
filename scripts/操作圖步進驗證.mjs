import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'qa', '圖面演示驗證');
fs.mkdirSync(output, {recursive: true});
const results = [];
const errors = [];
const note = (passed, label, detail = {}) => results.push({passed: Boolean(passed), label, ...detail});
const server = await startTestServer(root);
const browser = await chromium.launch({headless: true});
const url = (language, anchor = 'op-stt-read', query = '') => `${server.base}nvm-technology-atlas${language === 'zh' ? '-zh' : ''}.html?lang=${language}${query}#${anchor}`;
const attachErrors = page => page.on('pageerror', error => errors.push(error.message));
const samePalette = async locator => locator.evaluate(el => {
  const colored = [...el.querySelectorAll('svg [fill],svg [stroke],svg stop[stop-color]')];
  return colored.filter(node => node.getAttribute('fill') === '#147e82' || node.getAttribute('fill') === '#435b89' || node.getAttribute('stroke') === '#196daf').map(node => ({tag:node.localName,fill:node.getAttribute('fill'),computedFill:getComputedStyle(node).fill,stroke:node.getAttribute('stroke'),computedStroke:getComputedStyle(node).stroke}));
});
const layoutAudit = locator => locator.evaluate(el => {
  const problems = [...el.querySelectorAll('h6,p,dd,button')].filter(node => node.checkVisibility()).filter(node => node.scrollWidth > node.clientWidth + 2).map(node => node.textContent.slice(0,90));
  const svg=el.querySelector('.nvm-step-stage>svg');
  const minimumStageLabel=Math.min(...[...svg.querySelectorAll('text')].map(node=>parseFloat(getComputedStyle(node).fontSize)*svg.getBoundingClientRect().width/svg.viewBox.baseVal.width));
  return {overflow:document.documentElement.scrollWidth-innerWidth,problems,minimumStageLabel,originalFrames:el.querySelectorAll(':scope > .nvm-op-frames > .nvm-op-frame').length,originalVisible:[...el.querySelectorAll(':scope > .nvm-op-frames > .nvm-op-frame')].every(node => node.checkVisibility()),sourcesVisible:el.querySelector('.nvm-op-sources').checkVisibility(),legendVisible:el.querySelector('.nvm-op-legend').checkVisibility(),unintendedChinese:/[\u3400-\u9fff]/.test(el.innerText),demoBounds:el.querySelector('.nvm-step-stage').getBoundingClientRect().toJSON()};
});
const contrastAudit = locator => locator.evaluate(el => {
  const lum = color => {
    const rgb = color.startsWith('#') ? color.slice(1).match(/../g).map(s => parseInt(s,16)) : color.match(/[\d.]+/g).slice(0,3).map(Number);
    const c = rgb.map(s => (s/=255) <= .04045 ? s/12.92 : ((s+.055)/1.055)**2.4);
    return c[0]*.2126+c[1]*.7152+c[2]*.0722;
  };
  const ratio = (a,b) => {const x=lum(a), y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  const labels = [...el.querySelectorAll('.nvm-op-drawing svg text')].filter(node => ['P','AP','Vread'].includes(node.textContent)).map(node => ({text:node.textContent,fill:getComputedStyle(node).fill,ratio:ratio(getComputedStyle(node).fill,'#f8fbfd')}));
  const materials = [...el.querySelectorAll('.nvm-op-drawing svg rect')].filter(node => ['#147e82','#435b89'].includes(node.getAttribute('fill'))).map(node => ({fill:node.getAttribute('fill'),whiteArrowRatio:ratio('#ffffff',getComputedStyle(node).fill)}));
  return {labels,materials};
});

try {
  for (const language of ['en','zh']) for (const width of [1440,390,320]) {
    const context = await browser.newContext({viewport:{width,height:1000},acceptDownloads:true,reducedMotion:'no-preference'});
    const page = await context.newPage();
    attachErrors(page);
    await page.goto(url(language,'panorama'), {waitUntil:'networkidle'});
    note(await page.locator('#topic-stt [data-nvm-step-root]').count() === 0, '未啟用章節不建立演示', {language,width});
    await page.evaluate(() => {location.hash='op-stt-read';});
    const variant = page.locator('#op-stt-read .nvm-op-variant').first();
    const demo = variant.locator('[data-nvm-step-root]');
    await demo.waitFor();
    await page.waitForTimeout(200);
    const layout = await layoutAudit(variant);
    note(layout.overflow<=1&&!layout.problems.length&&layout.minimumStageLabel>=13&&layout.originalFrames===3&&layout.originalVisible&&layout.legendVisible&&layout.sourcesVisible&&(language==='zh'||!layout.unintendedChinese), '演示與原圖、來源、圖例完整重排', {language,width,...layout});
    const initialPalette = await samePalette(variant);
    await demo.locator('[data-nvm-step-action="next"]').click();
    await page.waitForTimeout(230);
    const afterClickPalette = await samePalette(variant);
    note(initialPalette.length>0&&afterClickPalette.every(node=>node.fill==='#147e82'?node.computedFill==='rgb(20, 126, 130)':node.fill==='#435b89'?node.computedFill==='rgb(67, 91, 137)':node.computedStroke==='rgb(25, 109, 175)'), '原點擊觸發後保留材料、讀取與載子語意色', {language,width});
    const contrast = await contrastAudit(variant);
    note(contrast.labels.length>0&&contrast.labels.every(item=>item.ratio>=4.5)&&contrast.materials.length>0&&contrast.materials.every(item=>item.whiteArrowRatio>=3), '圖內標籤與白色磁矩通過對比', {language,width,...contrast});
    const stepTwoBounds = await demo.locator('.nvm-step-stage').boundingBox();
    note(stepTwoBounds.width===layout.demoBounds.width&&stepTwoBounds.height===layout.demoBounds.height, '步次切換保持同一圖框', {language,width});
    await demo.locator('[data-nvm-step-action="play"]').click();
    await page.waitForTimeout(180);
    await demo.locator('[data-nvm-step-action="play"]').click();
    const pausedStep = await demo.getAttribute('data-step-current');
    await page.waitForTimeout(1300);
    note(await demo.getAttribute('data-playing')==='false'&&await demo.getAttribute('data-step-current')===pausedStep, '暫停清除計時器且不偷跑', {language,width});
    await demo.locator('[data-nvm-step-action="reset"]').click();
    note(await demo.getAttribute('data-step-current')==='1'&&await demo.getAttribute('data-playing')==='false', '重設回首步並停止播放', {language,width});
    const hash = new URL(page.url()).hash;
    await demo.locator('.nvm-step-stage').focus();
    await page.keyboard.press('ArrowRight');
    const stepWithKeyboard = await demo.getAttribute('data-step-current');
    await page.keyboard.press('End');
    note(stepWithKeyboard==='2'&&await demo.getAttribute('data-step-current')==='3'&&new URL(page.url()).hash===hash&&await demo.locator('.nvm-step-stage').evaluate(node=>node===document.activeElement), '方向鍵與首末步保留焦點及舊錨點', {language,width});
    await page.keyboard.press('Home');
    await demo.locator('[data-nvm-step-action="play"]').click();
    await page.waitForTimeout(2650);
    const atEnd = await demo.getAttribute('data-frame');
    await page.waitForTimeout(1300);
    note(atEnd==='end'&&await demo.getAttribute('data-step-current')==='3'&&await demo.getAttribute('data-playing')==='false', '播放到最後一格立即停止且不循環', {language,width});
    await demo.locator('[data-nvm-step-action="reset"]').click();
    await demo.locator('[data-nvm-step-action="play"]').click();
    await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
    note(await demo.getAttribute('data-playing')==='false', '視窗失焦事件暫停播放', {language,width});
    await demo.locator('[data-nvm-step-action="play"]').click();
    const beforeLeaving=await demo.getAttribute('data-step-current');
    await demo.evaluate(el=>window.scrollTo({top:window.scrollY+el.getBoundingClientRect().bottom+80,behavior:'instant'}));
    await page.waitForTimeout(200);
    const outside=await demo.evaluate(el=>el.getBoundingClientRect().bottom<0);
    const stoppedOutside=await demo.getAttribute('data-playing')==='false';
    await page.waitForTimeout(1400);
    const afterLeaving=await demo.getAttribute('data-step-current');
    await demo.scrollIntoViewIfNeeded();
    await page.waitForTimeout(120);
    note(outside&&stoppedOutside&&afterLeaving===beforeLeaving&&await demo.getAttribute('data-playing')==='false', '實際捲出畫面立即暫停，步次不前進且返回不自動播放', {language,width,beforeLeaving,afterLeaving,outside,stoppedOutside});
    await demo.locator('[data-nvm-step-action="play"]').click();
    await page.evaluate(()=>{location.hash='panorama';});
    await page.waitForTimeout(150);
    note(await demo.getAttribute('data-playing')==='false', '切換章節暫停隱藏演示', {language,width});
    await page.evaluate(()=>{location.hash='op-stt-read';});
    await demo.waitFor();
    await variant.locator('[data-engineering-zoom]').nth(1).click();
    const dialog = page.locator('.nvm-engineering-dialog');
    note(await dialog.isVisible()&&await dialog.locator('.nvm-op-legend').isVisible(), '原放大對話框保留圖例', {language,width});
    const zoomPalette = await samePalette(dialog);
    note(zoomPalette.length>0&&zoomPalette.every(node=>node.fill==='#147e82'?node.computedFill==='rgb(20, 126, 130)':node.fill==='#435b89'?node.computedFill==='rgb(67, 91, 137)':node.computedStroke==='rgb(25, 109, 175)'), '放大後保留工程語意色', {language,width});
    await dialog.locator('[data-engineering-fit]').click();
    note(await dialog.locator('.nvm-engineering-zoom-scroll').getAttribute('data-fit')==='true', '保留完整圖面檢視', {language,width});
    await page.keyboard.press('Escape');
    note(!await dialog.isVisible()&&await variant.locator('[data-engineering-zoom]').nth(1).evaluate(node=>node===document.activeElement), '關閉對話框返回原按鈕焦點', {language,width});
    const count = await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(node=>node.id);return {count:ids.length,unique:new Set(ids).size};});
    note(count.count===count.unique, '投影與放大 SVG 識別碼唯一', {language,width});
    await demo.locator('[data-nvm-step-action="next"]').click();
    await page.waitForTimeout(220);
    // 圖面證據使用足夠高度，避免長圖截圖被固定頁首覆蓋；互動測試仍在 1000px 高度。
    await page.setViewportSize({width,height:3600});
    await demo.screenshot({path:path.join(output,`${language}-${width}-STT第2步.png`)});
    await variant.locator(':scope > .nvm-op-frames').screenshot({path:path.join(output,`${language}-${width}-原始比較圖.png`)});
    await page.setViewportSize({width,height:1000});
    if(width===1440&&language==='en') {
      const downloadPromise=page.waitForEvent('download');
      await variant.locator('[data-engineering-download]').nth(1).click();
      const download=await downloadPromise;
      const target=path.join(output,'下載-STT讀取.svg');
      await download.saveAs(target);
      const svg=fs.readFileSync(target,'utf8');
      note(svg.includes('#147e82')&&svg.includes('#435b89')&&svg.includes('fill: rgb(25, 109, 175)')&&svg.includes('font-size: 20px')&&svg.includes('stroke: rgb(255, 255, 255)'), '下載 SVG 內嵌實際配色、文字與向量樣式');
      const exportPage=await context.newPage();
      await exportPage.goto(server.base+'qa/'+encodeURIComponent('圖面演示驗證')+'/'+encodeURIComponent('下載-STT讀取.svg'));
      const exportContrast=await exportPage.locator('svg').evaluate(svg=>({free:getComputedStyle(svg.querySelector('rect[fill="#147e82"]')).fill,read:getComputedStyle([...svg.querySelectorAll('text')].find(node=>node.textContent==='Vread')).fill}));
      note(exportContrast.free==='rgb(20, 126, 130)'&&exportContrast.read==='rgb(25, 109, 175)', 'SVG 獨立開啟保留深色磁層與讀取色',{...exportContrast});
      await exportPage.close();
      for(const anchor of ['op-nor-write','op-pcm-write','op-feram-read']) {
        await page.evaluate(anchor=>{location.hash=anchor;},anchor);
        await page.locator(`#${anchor} [data-nvm-step-root]`).first().waitFor();
        const operation=page.locator('#'+anchor);
        const counts=await operation.evaluate(el=>({demos:el.querySelectorAll('[data-nvm-step-root]').length,variants:el.querySelectorAll('.nvm-op-variant').length,frames:el.querySelectorAll('.nvm-op-frame').length}));
        note(counts.demos===counts.variants&&counts.frames>=3,'其他物理機制沿用同源圖序',{anchor,...counts});
        await operation.locator('[data-nvm-step-root]').first().screenshot({path:path.join(output,`${anchor}-桌面.png`)});
      }
    }
    if(width===390) {
      await page.evaluate(()=>{location.hash='op-stt-read';});
      await page.locator('.language-toggle').click();
      await page.waitForURL(url(language==='en'?'zh':'en'));
      note(new URL(page.url()).hash==='#op-stt-read'&&await page.locator('#op-stt-read [data-nvm-step-root]').isVisible(), '中英語言切換保留圖組與舊錨點',{language,width});
    }
    await context.close();
  }
  const context=await browser.newContext({viewport:{width:390,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  attachErrors(page);
  await page.goto(url('zh'),{waitUntil:'networkidle'});
  const demo=page.locator('#op-stt-read [data-nvm-step-root]');
  note(await demo.getAttribute('data-frame')==='static'&&!await demo.locator('.nvm-step-controls').isVisible()&&!await demo.locator('.nvm-step-stage').isVisible()&&await page.locator('#op-stt-read .nvm-op-frames').isVisible(),'減少動態效果保留完整靜態比較，隱藏播放');
  await page.screenshot({path:path.join(output,'減少動態效果-390.png')});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await demo.locator('[data-nvm-step-action="play"]').click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('#op-stt-read [data-nvm-step-root]')?.dataset.frame==='static');
  note(await demo.getAttribute('data-playing')==='false'&&await demo.getAttribute('data-frame')==='static','執行中切換減少動態效果立即暫停');
  await context.close();
  const staticPage=await browser.newPage();
  await staticPage.goto(url('en','op-stt-read','&motion=static'),{waitUntil:'networkidle'});
  note(await staticPage.locator('#op-stt-read [data-nvm-step-root]').getAttribute('data-frame')==='static'&&await staticPage.locator('#op-stt-read .nvm-op-frame').count()===3,'明示靜態網址保留完整圖序');
  await staticPage.emulateMedia({media:'print'});
  note(!await staticPage.locator('#op-stt-read [data-nvm-step-root]').isVisible()&&await staticPage.locator('#op-stt-read .nvm-op-frame').first().isVisible(),'列印保留原比較圖而移除操作控制');
  await staticPage.close();
  const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:1000}});
  const noJSPage=await noJS.newPage();
  await noJSPage.goto(url('en'),{waitUntil:'networkidle'});
  note(await noJSPage.locator('#op-stt-read .nvm-op-drawing svg').count()===3&&await noJSPage.locator('[data-nvm-step-root]').count()===0,'停用 JavaScript 仍保留三張原圖');
  await noJS.close();
} catch(error) {note(false,'驗證流程中斷',{message:error.message});}
finally {await browser.close();await server.close();}
note(errors.length===0,'無瀏覽器程式錯誤',{errors});
const report={passed:results.every(item=>item.passed),checks:results.length,checkedAt:new Date().toISOString(),results};
fs.writeFileSync(path.join(output,'操作圖步進驗證.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:report.passed,checks:report.checks,failures:results.filter(item=>!item.passed),output}));
if(!report.passed) process.exitCode=1;
