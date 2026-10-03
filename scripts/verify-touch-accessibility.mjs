import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,webkit} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root=path.resolve(import.meta.dirname,'..');
const server=process.env.NVM_QA_BASE?null:await startTestServer(root);
const base=process.env.NVM_QA_BASE||server.base;
const engine=process.env.NVM_QA_ENGINE||'chromium';
assert.ok(['chromium','webkit'].includes(engine),'This test requires an engine that supports mobile-context emulation');
const channel=process.env.NVM_QA_CHANNEL||process.env.NVM_QA_BROWSER||(process.platform==='win32'?'msedge':'chromium');
const browser=await ({chromium,webkit}[engine]).launch({headless:true,...(engine==='chromium'&&channel!=='chromium'?{channel}:{})});
const output=path.resolve(process.env.NVM_QA_OUTPUT||path.join(root,'qa','touch-accessibility',`${engine}-${engine==='chromium'?channel:'bundled'}`));
fs.mkdirSync(output,{recursive:true});
const results=[];
try{for(const language of ['en','zh']){
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2,serviceWorkers:'block',reducedMotion:'reduce'});
 await context.addInitScript(()=>{window.__touchStarts=0;window.addEventListener('touchstart',()=>window.__touchStarts++,{passive:true});});
 await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 const result={engine,version:browser.version(),language,scope:'Synthetic touch events and viewport rotation; not a physical phone, Safari, or on-screen keyboard test',passed:false,errors};
 try{
  await page.goto(new URL(`secure-storage.html?lang=${language}`,base).href,{waitUntil:'networkidle'});
  result.touchMedia=await page.evaluate(()=>({maxTouchPoints:navigator.maxTouchPoints,coarse:matchMedia('(pointer: coarse)').matches}));
  await page.locator('#menuToggle').tap();
  assert.ok(await page.evaluate(()=>window.__touchStarts>0),'The interaction must dispatch a touch event');
  assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'),'true');
  await page.locator('#searchTrigger').tap();
  assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'),'false');
  assert.equal(await page.locator('#searchOverlay').getAttribute('aria-hidden'),'false');
  await page.locator('#searchClose').tap();
  assert.equal(await page.locator('#searchOverlay').getAttribute('aria-hidden'),'true');
  assert.equal(await page.evaluate(()=>document.activeElement.id),'searchTrigger');
  await page.locator('#filters [data-type="product"]').tap();
  assert.equal(await page.locator('#filters [data-type="product"]').getAttribute('aria-pressed'),'true');
  assert.ok((await page.locator('#learningResultStatus').textContent()).trim());
  await page.goto(new URL(`technology-comparison.html?lang=${language}`,base).href,{waitUntil:'networkidle'});
  await page.locator('.matrix-cat-tag').first().tap();
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.matrix-header[data-category="foundry"]')).display==='none');
  await page.locator('.cat-filter-pill[data-cat-id="foundry"]').tap();
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.matrix-header[data-category="foundry"]')).display!=='none');
  await page.locator('.matrix-view-presets [data-view="zeromask"]').tap();
  await page.waitForFunction(()=>document.querySelector('.matrix-view-presets [data-view="zeromask"]').getAttribute('aria-pressed')==='true');
  assert.equal(await page.locator('.matrix-header[data-tech]:visible').count(),6,'Touch preset shows exactly the six qualified columns');
  await page.locator('.matrix-view-presets').screenshot({path:path.join(output,`matrix-portrait-${language}.png`)});
  await page.setViewportSize({width:844,height:390});
  await page.locator('#menuToggle').tap();
  assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'),'true');
  await page.locator('#searchTrigger').tap();
  await page.locator('#searchClose').tap();
  assert.equal(await page.evaluate(()=>document.activeElement.id),'searchTrigger');
  assert.equal(await page.locator('[inert]').count(),0);
  assert.deepEqual(errors,[]);
  result.passed=true;
 }catch(error){result.failure=error.message;await page.screenshot({path:path.join(output,`failure-${language}.png`)}).catch(()=>{});}
 finally{results.push(result);await context.close();}
}}finally{await browser.close();if(server)await server.close();}
fs.writeFileSync(path.join(output,'verification-results.json'),JSON.stringify({results},null,2)+'\n');
console.log(`Touch/orientation emulation (${engine}): ${results.filter(x=>x.passed).length}/${results.length} passed`);
if(results.some(x=>!x.passed)){console.error(JSON.stringify(results.filter(x=>!x.passed),null,2));process.exitCode=1;}
