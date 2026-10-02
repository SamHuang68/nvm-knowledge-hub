import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root=path.resolve(import.meta.dirname,'..');
const output=path.resolve(process.env.NVM_READING_OUTPUT || path.join(root,'qa/responsive-reading'));
fs.mkdirSync(output,{recursive:true});
const server=process.env.NVM_QA_BASE?null:await startTestServer(root);
const base=process.env.NVM_QA_BASE||server.base;
const channel=process.env.NVM_QA_BROWSER||process.env.NVM_QA_CHANNEL||'msedge';
const browser=await chromium.launch({headless:true,...(channel==='chromium'?{}:{channel})});
const results=[],errors=[];
const cases=[
  {file:'iot-mcu-envm.html',selectors:['.hero-content','#hub-fail-closed','#hub-fail-closed .hub-story-step']},
  {file:'secure-storage.html',selectors:['.enterprise-signing-case','.case-intro','.case-flow','.case-flow article','.threat-coverage','.threat-coverage > div']},
  {file:'technology-comparison.html',selectors:['.matrix-view-presets','.matrix-view-presets .matrix-view-btn']},
  {file:'briefing/index.html',selectors:['.site-breadcrumb','.site-header','.header-actions']}
];
try{
  for(const width of [1440,720,390,320])for(const language of ['en','zh'])for(const test of cases){
    const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block',reducedMotion:'reduce'});
    await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
    const page=await context.newPage();
    page.on('pageerror',error=>errors.push({file:test.file,width,language,error:error.message}));
    try{
      await page.goto(new URL(`${test.file}?lang=${language}`,base).href,{waitUntil:'load'});
      await page.locator(test.selectors.at(-1)).first().waitFor();
      const clipped=await page.evaluate(selectors=>selectors.flatMap(selector=>[...document.querySelectorAll(selector)].flatMap(el=>{
        const rect=el.getBoundingClientRect();
        if(!rect.width||!rect.height)return [];
        const clippedBy=[];
        let parent=el.parentElement;
        while(parent&&parent!==document.body){
          const p=parent.getBoundingClientRect(),style=getComputedStyle(parent);
          if(['hidden','clip'].includes(style.overflowX)&&(rect.left<p.left-1||rect.right>p.right+1))clippedBy.push(parent.id||parent.className||parent.tagName);
          parent=parent.parentElement;
        }
        const overflow=el.scrollWidth>el.clientWidth+2;
        return rect.left < -1 || rect.right>document.documentElement.clientWidth+1 || clippedBy.length || overflow
          ? [{selector,left:rect.left,right:rect.right,viewport:document.documentElement.clientWidth,scroll:el.scrollWidth,client:el.clientWidth,clippedBy}] : [];
      })),test.selectors);
      assert.deepEqual(clipped,[],`${test.file}: content clipped instead of reflowed`);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'document horizontal overflow');
      if(test.file==='iot-mcu-envm.html'){
        const buttons=page.locator('#hub-fail-closed .hub-story-step');
        for(let i=0;i<3;i++){
          await buttons.nth(i).focus();await buttons.nth(i).press('Enter');
          assert.equal(await buttons.nth(i).getAttribute('aria-pressed'),'true');
          assert.equal(await page.locator('#hub-fail-closed [aria-pressed=true]').count(),1);
          assert.equal(await buttons.nth(i).evaluate(el=>el===document.activeElement),true);
          assert.ok((await page.locator('#hub-fail-closed .hub-story-note').innerText()).trim().length>0);
        }
      }
      if(test.file==='technology-comparison.html'){
        for(const button of await page.locator('.matrix-view-presets .matrix-view-btn').all()){
          await button.click();
          await page.waitForFunction(view=>document.querySelector(`.matrix-view-btn[data-view="${view}"]`)?.classList.contains('is-active'),await button.getAttribute('data-view'));
        }
      }
      if(test.file==='briefing/index.html'&&width<=600){
        const menu=page.locator('#menuToggle');
        assert.ok(await menu.locator('i').first().evaluate(el=>el.getBoundingClientRect().width>=18&&el.getBoundingClientRect().height>=2),'menu icon is visibly rendered');
        assert.ok(await menu.locator('i').first().evaluate(el=>getComputedStyle(el).backgroundColor.match(/\d+/g)?.slice(0,3).every(value=>Number(value)<120)),'menu foreground is not recolored as a pale paper panel');
        await menu.focus();await menu.press('Enter');
        assert.equal(await menu.getAttribute('aria-expanded'),'true');
        await page.keyboard.press('Escape');
        assert.equal(await menu.getAttribute('aria-expanded'),'false');
        assert.equal(await menu.evaluate(el=>el===document.activeElement),true);
      }
      if(width===390||width===320){
        await page.locator(test.file==='iot-mcu-envm.html'?'#hub-fail-closed':test.selectors[0]).first().scrollIntoViewIfNeeded();
        await page.screenshot({path:path.join(output,`${test.file.replaceAll('/','-')}-${language}-${width}.png`)});
      }
      results.push({file:test.file,width,language,passed:true});
    }catch(error){results.push({file:test.file,width,language,passed:false,error:error.message});}
    finally{await context.close();}
  }
}finally{await browser.close();await server?.close();}
fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({results,errors},null,2));
console.log(JSON.stringify({passed:results.filter(x=>x.passed).length,total:results.length,pageErrors:errors.length,output}));
assert.equal(results.filter(x=>!x.passed).length,0,JSON.stringify(results.filter(x=>!x.passed)));
assert.equal(errors.length,0,JSON.stringify(errors));
