import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {captureLanguageSurface, assessLanguageSurface} from './bilingual-surface-contract.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'qa/restored-reading-ui');
await fs.mkdir(output, {recursive:true});
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const channel = process.env.NVM_QA_BROWSER || 'msedge';
const browser = await chromium.launch({headless:true, ...(channel === 'chromium' ? {} : {channel})});
const errors = [];
const results = [];
const headerBounds = [];
try {
  for (const language of ['en','zh']) {
    const context = await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:1000},reducedMotion:'reduce'});
    await context.route('**/*',route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    const open = async (file,hash='') => page.goto(new URL(`${file}?lang=${language}${hash}`,base).href);
    const locale = async () => assert.deepEqual(assessLanguageSurface(await page.evaluate(captureLanguageSurface),language),[]);
    const fits = async () => assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'page must fit viewport');
    const atlas = language === 'en' ? 'nvm-technology-atlas.html' : 'nvm-technology-atlas-zh.html';
    await open(atlas,'#patents');
    await page.locator('#nvm-patent-search').fill('no-such-patent-000');
    assert.equal(await page.locator('#nvm-patent-empty').isVisible(),true);
    const patent = await page.locator('[data-patent-record]').first().getAttribute('id');
    await page.evaluate(id => { location.hash=id; },patent);
    await page.waitForFunction(id => document.getElementById(id).checkVisibility() && document.getElementById(id).open,patent);
    assert.equal(await page.locator('#nvm-patent-search').inputValue(),'');
    await locale();
    await page.evaluate(()=>{location.hash='glossary';});
    await page.locator('#nvm-glossary-search').fill('no-such-term-000');
    assert.equal(await page.locator('#nvm-glossary-empty').isVisible(),true);
    await page.locator('#nvm-glossary-reset').click();
    assert.equal(await page.locator('#nvm-glossary-search').evaluate(el=>el===document.activeElement),true);
    await page.evaluate(()=>{location.hash='comparison-history-table';});
    await page.locator('#nvm-history-metric').selectOption('0');
    assert.equal(await page.locator('.nvm-history-table tbody tr:not([hidden])').count(),1);
    assert.equal(await page.locator('.nvm-history-notes').getAttribute('open'),'');
    await page.locator('#nvm-history-reset').click();
    assert.ok(await page.locator('.nvm-history-table tbody tr:not([hidden])').count()>1);
    await locale();
    await page.evaluate(()=>{location.hash='ip-lineage';});
    const eventLink=page.locator('.nvm-lineage-date').first();
    const eventHash=await eventLink.getAttribute('href');
    await eventLink.click();
    await page.waitForFunction(hash=>location.hash===hash && document.activeElement === document.querySelector(hash+' h5'),eventHash);
    assert.equal(await page.evaluate(()=>document.activeElement.tagName),'H5');
    await locale();
    await page.screenshot({path:path.join(output,`lineage-${language}.png`)});
    await open(atlas,'#op-feram-read');
    await page.locator('#op-feram-read [data-engineering-zoom]').first().click();
    const dialog=page.locator('.nvm-engineering-dialog');
    await dialog.locator('[data-engineering-fit]').click();
    assert.equal(await dialog.locator('select').inputValue(),'fit');
    const fit=()=>dialog.locator('.nvm-engineering-zoom-scroll').evaluate(el=>el.scrollWidth<=el.clientWidth+2);
    assert.equal(await fit(),true);
    await page.setViewportSize({width:390,height:844});
    await page.waitForFunction(()=>{const el=document.querySelector('.nvm-engineering-zoom-scroll');return el.scrollWidth<=el.clientWidth+2;});
    await page.screenshot({path:path.join(output,`figure-mobile-${language}.png`)});
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(),false);
    assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-engineering-zoom')),true);
    await fits();
    await open('memory-evidence.html');
    const totalEvidence = await page.locator('.source-card').count();
    await page.locator('#evidenceSearch').fill('no-such-source-000');
    await page.locator('#evidenceJump').selectOption('evidence-P01');
    await page.waitForFunction(()=>document.activeElement.id==='evidence-P01');
    assert.equal(await page.locator('#evidenceSearch').inputValue(),'');
    assert.equal(await page.locator('#clearEvidence').isVisible(),false,'the jump already cleared the filter');
    await page.locator('#evidenceSearch').fill('no-such-source-000');
    assert.equal(await page.locator('.source-card:not([hidden])').count(),0);
    await page.locator('#clearEvidence').click();
    assert.equal(await page.locator('#evidenceSearch').inputValue(),'');
    assert.equal(await page.locator('.source-card:not([hidden])').count(),totalEvidence);
    assert.equal(await page.locator('#evidenceSearch').evaluate(el=>el===document.activeElement),true);
    await locale(); await fits();
    await open('briefing/index.html');
    const total=await page.locator('.slide-card').count();
    await page.locator('.filter-btn:not([data-filter="all"])').first().click();
    assert.ok(await page.locator('.slide-card:not([hidden])').count()<total);
    const hidden=await page.locator('.slide-card[hidden]').first().getAttribute('id');
    await page.locator('#slideJump').selectOption(hidden);
    await page.waitForFunction(id=>document.activeElement.id===id,hidden);
    assert.equal(await page.locator('.slide-card:not([hidden])').count(),total);
    await page.locator('#toggleNotes').click();
    assert.equal(await page.locator('.slide-notes:not([hidden])').count(),0);
    await page.locator('#toggleNotes').click();
    assert.ok(await page.locator('.slide-notes:not([hidden])').count()>0);
    await locale(); await fits();
    await open('sram-repair.html');
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://hub.samhuang68.org/sram-repair.html');
    assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'),'https://hub.samhuang68.org/sram-repair.html');
    assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('hub-apps-page')),true);
    for (const width of [390,320]) {
      await page.setViewportSize({width,height:844});
      for (const fallback of [false,true]) {
        // 在 QA 文件套用較寬後備字型，驗證排版不依賴單一平台的字寬。
        const fontProbe = fallback ? await page.addStyleTag({content:'.sram-repair-page .site-header .brand{font-family:"Courier New","Liberation Mono","DejaVu Sans Mono",monospace!important}'}) : null;
        const bounds = await page.locator('.site-header .brand, .site-header .header-actions > :is(a,button)').evaluateAll(nodes=>nodes.filter(node=>node.checkVisibility()).map(node=>{
          const rect=node.getBoundingClientRect();
          return {識別:node.id||node.className,x:rect.x,y:rect.y,右:rect.right,下:rect.bottom,寬:rect.width,高:rect.height,視窗寬:innerWidth,視窗高:innerHeight};
        }));
        assert.deepEqual(bounds.filter(item=>item.識別!=='brand').map(item=>item.識別),['home-pill','searchTrigger','languageToggle','menuToggle'],'全部主題、搜尋、語言與選單皆可見');
        for (const item of bounds) {
          assert.ok(item.x>=0&&item.右<=item.視窗寬&&item.y>=0&&item.下<=item.視窗高,`${language}/${width}/${fallback?'較寬後備字型':'原字型'}：${item.識別} 完整位於視窗內，x=${item.x}，右=${item.右}`);
        }
        headerBounds.push({語言:language,視窗寬:width,較寬後備字型:fallback,元素:bounds});
        for (const selector of ['.home-pill','#searchTrigger','#languageToggle','#menuToggle']) await page.locator(selector).click({trial:true});
        await page.locator('#menuToggle').click();
        assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'),'true');
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'),'false');
        assert.equal(await page.locator('#menuToggle').evaluate(el=>el===document.activeElement),true);
        await locale(); await fits();
        await page.screenshot({path:path.join(output,`SRAM手機-${language==='en'?'英文':'繁體中文'}-${width}-${fallback?'較寬後備字型':'原字型'}.png`)});
        if (fontProbe) await fontProbe.evaluate(node=>node.remove());
      }
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.screenshot({path:path.join(output,`sram-desktop-${language}.png`)});
    await page.locator('.brand').click();
    assert.equal(await page.locator('#layer-sram').getAttribute('href'),'sram-repair.html');
    results.push({language,passed:true,viewports:['1440x1000','390x844','320x844'],checks:['reference filters and deep links','history filters','lineage focus','figure fitting and Escape','evidence reset and jump','briefing filters, notes and jump','SRAM metadata, mobile menu and anchor','手機標頭全部操作與較寬後備字型完整位於視窗內']});
    await context.close();
  }
  assert.deepEqual(errors,[]);
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify({results,errors,標頭幾何:headerBounds},null,2));
  console.log('閱讀介面驗證通過：中英文、桌面與 390／320 像素手機；原字型與較寬後備字型的全部標頭操作完整可點。');
} finally { await browser.close(); if(server) await server.close(); }
