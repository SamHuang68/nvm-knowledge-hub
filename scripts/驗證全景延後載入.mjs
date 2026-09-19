import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './驗證伺服器.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa/全景延後載入'));
fs.mkdirSync(output, {recursive:true});
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const channel = process.env.NVM_QA_BROWSER || 'msedge';
const browser = await chromium.launch({headless:true,...(channel === 'chromium' ? {} : {channel})});
const results = [];
try {
  for (const [language,file] of [['en','NVM技術全景.html'],['zh','NVM技術全景中文.html']]) {
    const html = fs.readFileSync(path.join(root,file),'utf8');
    const placeholders = [...html.matchAll(/data-nvm-diagram="([a-f0-9]+)"><noscript>([\s\S]*?)<\/noscript>/g)];
    for (const [,key,svg] of placeholders) {
      assert.equal(crypto.createHash('sha256').update(svg).digest('hex'), key, '圖解內容必須符合生成時的雜湊');
    }
    const context = await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:960}});
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [], requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if(decodeURIComponent(request.url()).includes('/全景圖解/')) requests.push(request.url()); });
    await page.goto(new URL(`${file}?lang=${language}`,base).href);
    await page.waitForFunction(() => document.documentElement.classList.contains('nvm-enhanced'));
    const initial = await page.evaluate(() => ({elements:document.querySelectorAll('*').length, svg:document.querySelectorAll('svg').length}));
    assert.equal(requests.length,0,'目錄頁不得預載隱藏章節圖解');
    await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
    assert.equal(await page.locator('[data-nvm-diagram]').count(),0,'列印前必須同步展開所有圖解');
    assert.equal(await page.locator('svg').count(),initial.svg+placeholders.length);
    await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
    assert.equal(await page.locator('svg').count(),initial.svg,'列印後還原隱藏章節，避免持續增加DOM');
    const panels = await page.locator('[data-nvm-panel]').evaluateAll(nodes => nodes.map(node => ({id:node.id,count:node.querySelectorAll('[data-nvm-diagram]').length})));
    for (const panel of panels) {
      await page.evaluate(id => {location.hash = id;}, panel.id);
      await page.waitForFunction(id => !document.getElementById(id).hidden, panel.id);
      if(panel.count) {
        await page.waitForFunction(id => document.getElementById(id).dataset.diagramsState === 'ready',panel.id);
        assert.equal(await page.locator(`#${panel.id} [data-nvm-diagram]`).count(),0,'所有章節圖解均應可載入');
      }
    }
    await page.evaluate(() => {location.hash='topic-floating-gate';});
    const figure = page.locator('[data-nvm-panel]:not([hidden]) [data-engineering-figure]').first();
    // 依當前章節契約選用第一個支援下載的圖解，避免測試依賴顯示文案。
    if(!await figure.count()) {
      const target = await page.locator('[data-engineering-download]').first().evaluate(button => button.closest('[data-nvm-panel]').id);
      await page.evaluate(id => {location.hash=id;},target);
    }
    const downloadButton = page.locator('[data-nvm-panel]:not([hidden]) [data-engineering-download]').first();
    const [download] = await Promise.all([page.waitForEvent('download'), downloadButton.click()]);
    const downloaded = await download.path();
    assert.match(fs.readFileSync(downloaded,'utf8'), /<svg\b/);
    await page.locator('[data-nvm-panel]:not([hidden]) [data-engineering-zoom]').first().click();
    assert.equal(await page.locator('dialog[open] svg').count(),1);
    await page.keyboard.press('Escape');
    assert.deepEqual(errors,[]);
    results.push({language,passed:true,panels:panels.length,diagrams:placeholders.length,initial,htmlBytes:Buffer.byteLength(html),diagramRequests:requests.length});
    await context.close();
    const noJS=await browser.newContext({javaScriptEnabled:false,serviceWorkers:'block',viewport:{width:390,height:844}});
    const noJSPage=await noJS.newPage();
    await noJSPage.goto(new URL(`${file}?lang=${language}`,base).href);
    assert.equal(await noJSPage.locator('[data-nvm-diagram] svg').count(),placeholders.length,'停用JavaScript時保留全部向量圖');
    assert.equal(await noJSPage.locator('[data-nvm-diagram] svg').first().isVisible(),true);
    assert.equal(await noJSPage.locator('[data-nvm-diagram] svg').first().evaluate(svg=>svg.namespaceURI),'http://www.w3.org/2000/svg');
    results.push({language,name:'停用JavaScript與390px圖解可見性',passed:true});
    await noJS.close();
  }
  const context = await browser.newContext({serviceWorkers:'block',viewport:{width:390,height:844}});
  const page = await context.newPage();
  await page.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  await page.goto(new URL('NVM技術全景中文.html?lang=zh#topic-fg',base).href);
  const target = await page.locator('[data-nvm-panel]').evaluateAll(nodes=>nodes.find(node=>node.querySelector('[data-nvm-diagram]')).id);
  await page.evaluate(id=>{location.hash=id;},target);
  await page.waitForFunction(id=>document.getElementById(id).dataset.diagramsState==='ready',target);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'手機寬度不得因占位圖解產生橫向溢出');
  results.push({name:'390px版面',passed:true});
  await context.close();
  console.log(`通過：雙語全部章節、原始向量雜湊、下載、放大、列印、停用JavaScript與手機版面（${results.length} 組）。`);
} finally {
  fs.writeFileSync(path.join(output,'驗證結果.json'),JSON.stringify(results,null,2)+'\n');
  await browser.close();
  await server?.close();
}
