import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium,firefox,webkit} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root=path.resolve(import.meta.dirname,'..');
const server=process.env.NVM_QA_BASE?null:await startTestServer(root);
const base=process.env.NVM_QA_BASE||server.base;
const engine=process.env.NVM_QA_ENGINE||'chromium';
const type={chromium,firefox,webkit}[engine];
assert.ok(type,`Unsupported test engine: ${engine}`);
const channel=process.env.NVM_QA_CHANNEL||process.env.NVM_QA_BROWSER||(process.platform==='win32'?'msedge':'chromium');
const browser=await type.launch({headless:true,...(engine==='chromium'&&channel!=='chromium'?{channel}:{})});
const output=path.resolve(process.env.NVM_QA_OUTPUT||path.join(root,'qa','language-entry',engine));
fs.mkdirSync(output,{recursive:true});
const results=[];
try{
 for(const entry of ['whitepaper/index.html','tools/whitepaper-studio/index.html'])for(const language of ['en','zh']){
  const context=await browser.newContext({viewport:{width:320,height:900},serviceWorkers:'block',reducedMotion:'reduce'});
  await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push({message:error.message,stack:error.stack}));
  const result={entry,language,engine,version:browser.version(),passed:false,errors};
  try{
   await page.goto(new URL(`${entry}?view=whitepaper&lang=${language}#chap-state-contract`,base).href,{waitUntil:'networkidle'});
   const destination=new URL(page.url());
   // Pages providers may canonicalize index.html to its directory URL.
   assert.equal(destination.pathname.replace(/\/index\.html$/,'/'),new URL('whitepaper/index.html',base).pathname.replace(/\/index\.html$/,'/'));
   assert.equal(destination.searchParams.get('lang'),language);
   assert.equal(destination.searchParams.get('view'),'whitepaper');
   assert.equal(destination.hash,'#chap-state-contract');
   assert.equal(await page.locator('html').getAttribute('lang'),language==='zh'?'zh-Hant':'en');
   assert.equal(await page.locator('.studio-panel:not([hidden])').getAttribute('id'),'panel-whitepaper');
   assert.equal(await page.locator('#hubExternalLinkNotice').count(),1,'Only the destination document owns the external-link description');
   await page.locator('#languageToggle').click();
   assert.equal(await page.locator('html').getAttribute('lang'),language==='zh'?'en':'zh-Hant');
   await page.locator('#tab-selector').focus();
   await page.keyboard.press('Enter');
   assert.equal(await page.locator('.studio-panel:not([hidden])').getAttribute('id'),'panel-selector');
   assert.ok(await page.locator('#filter-family').isVisible());
   assert.deepEqual(errors,[],'Entry redirect and destination language changes must not throw');
   result.passed=true;
  }catch(error){result.failure=error.message;await page.screenshot({path:path.join(output,`${entry.startsWith('tools')?'alias':'canonical'}-${language}-failure.png`)}).catch(()=>{});}
  finally{results.push(result);await context.close();}
 }
}finally{await browser.close();if(server)await server.close();}
fs.writeFileSync(path.join(output,'verification-results.json'),JSON.stringify({coverage:'Automated engine/keyboard verification, not Safari or screen-reader audio',results},null,2)+'\n');
console.log(`Language entry (${engine}): ${results.filter(x=>x.passed).length}/${results.length} passed`);
if(results.some(x=>!x.passed)){console.error(JSON.stringify(results.filter(x=>!x.passed),null,2));process.exitCode=1;}
