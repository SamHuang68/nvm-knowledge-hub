import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {getIPStudy as emerging} from './nvm-emerging-ip-diagrams.mjs';
import {getIPStudy as supplement} from './nvm-supplement-ip-diagrams.mjs';
import {startTestServer} from './test-server.mjs';

// 僅驗證本輪五個修正單元；不呼叫建置、全站掃描或其他 runner。
const root=path.resolve(import.meta.dirname,'..');
const output=path.resolve(root,process.env.NVM_QA_OUTPUT||'qa/審查圖解狀態');
const supportedIds=['crocus-mram','tetramem-reram','4ds-reram','sst-superflash','chingis-pfusion'];
const selected=process.argv.find(argument=>argument.startsWith('--unit='))?.slice(7);
if(selected&&!supportedIds.includes(selected))throw new Error('指定單元不在本輪修正範圍');
const ids=selected?[selected]:supportedIds;
const results=[];
const check=(condition,label,detail={})=>{results.push({passed:Boolean(condition),label,...detail});assert.ok(condition,`${label} ${JSON.stringify(detail)}`);};
const study=(id,language)=>emerging(id,language)||supplement(id,language);
const frames=(s,op)=>s.operations.find(item=>item.operationId===op).variants[0].frames;
const value=(frame,key)=>frame.svg.match(new RegExp(`data-${key}="([^"]+)"`))?.[1];
const shape=frame=>frame.svg.match(/<g data-state="(?:analog-conductance|interface-barrier|fg-charge)"[^>]*>([\s\S]*?)<\/g>/)?.[1];
fs.mkdirSync(output,{recursive:true});
let browser,server;
const errors=[];
try {
  for(const language of ['zh','en']) {
    for(const id of ids) {
      const s=study(id,language);
      for(const operation of ['write','erase','read']) {
        const f=frames(s,operation);
        check(f.every(item=>item.svg.includes('role="img"')&&item.svg.includes('<desc')&&item.title&&item.caption),'狀態標題與可及說明完整',{id,language,operation});
        if(language==='en')check(f.every(item=>!/[\u3400-\u9fff]/.test([item.title,item.caption,item.state,item.stimulus,item.svg].join(''))),'英文圖序未漏入中文',{id,operation});
        if(id==='tetramem-reram'||id==='4ds-reram'||id==='chingis-pfusion') {
          const states=f.map(shape);
          check(states.every(Boolean),'核心幾何群組存在',{id,operation});
          check(operation==='read'?new Set(states).size===1:new Set(states).size>=3,'核心幾何依操作變化，讀取保留原狀態',{id,operation});
        }
      }
      if(id==='crocus-mram') {
        const w=frames(s,'write'),e=frames(s,'erase');
        check(w.length===5&&w.map(f=>value(f,'temperature')).join(',')==='below-tb,above-tb,above-tb,below-tb,below-tb','TAS 加熱、帶場冷卻與撤場順序');
        check(w.map(f=>value(f,'field')).join(',')==='off,off,forward,forward,off'&&e[2].svg.includes('data-field="reverse"'),'TAS 外加場方向與冷卻持場');
        check(!w.some(f=>f.svg.includes('τSTT'))&&frames(s,'read').every(f=>value(f,'temperature')==='below-tb'),'TAS 不畫 STT 轉矩，讀取不加熱');
      }
      if(id==='sst-superflash')check(value(frames(s,'erase')[1],'sg-on')==='false'&&value(frames(s,'write')[1],'sg-on')==='true'&&value(frames(s,'read')[1],'sg-on')==='true','ESF3 抹除 SG 關閉，寫入與讀取選通');
      if(id==='chingis-pfusion') {
        check(!/BBHH|BBHE|microamp|11\.5/.test(JSON.stringify(s)),'pFusion 不宣稱未核實載子機制或數值');
        check(!/P-Channel|N-well|P\+/.test(JSON.stringify(s)),'pFusion 不將未核實井型或通道歸屬於產品');
      }
    }
  }
  if(!process.argv.includes('--static-only')) {
    const {chromium}=await import('playwright');
    server=await startTestServer(root);
    browser=await chromium.launch({headless:true,...(process.env.NVM_QA_BROWSER==='chromium'?{}:{channel:'msedge'})});
    for(const language of ['zh','en'])for(const width of [390,1440]) {
      const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'no-preference'});
      const page=await context.newPage();page.setDefaultTimeout(5000);page.on('pageerror',e=>errors.push(e.message));
      await page.goto(`${server.base}nvm-technology-atlas${language==='zh'?'-zh':''}.html?lang=${language}#ip-op-crocus-mram-write`,{waitUntil:'domcontentloaded'});
      await page.addStyleTag({content:'html{scroll-behavior:auto!important}'});
      for(const id of ids)for(const operation of ['write','erase']) {
        const anchor=`ip-op-${id}-${operation}`;
        await page.evaluate(anchor=>{location.hash=anchor;},anchor);
        const variant=page.locator(`#${anchor} .nvm-op-variant`).first();
        const demo=variant.locator('[data-nvm-step-root]');
        await demo.waitFor({state:'visible'});
        await demo.locator('[data-nvm-step-action="reset"]').click();
        const stage=demo.locator('.nvm-step-stage');
        const core=()=>stage.evaluate(el=>[...el.querySelectorAll('svg rect,svg path,svg text')].map(n=>n.outerHTML).join(''));
        const before=await core();
        await demo.locator('[data-nvm-step-action="next"]').click();
        await page.waitForFunction(({anchor})=>document.querySelector(`#${anchor} [data-nvm-step-root]`)?.dataset.stepCurrent==='2',{anchor});
        check(await core()!==before,'正常點擊切換 SVG 可見狀態',{id,operation,language,width});
        if(id==='crocus-mram') {
          await demo.locator('[data-nvm-step-action="next"]').click();
          await stage.locator('[data-field]').waitFor();
        }
        const expectedFrame=frames(study(id,language),operation)[id==='crocus-mram'?2:1];
        const coreGroup=await stage.locator('g[data-state]').first().evaluate(el=>el.outerHTML);
        const expectedGroup=expectedFrame.svg.match(/<g data-state="[^"]+"[^>]*>[\s\S]*?<\/g>/)?.[0];
        // SVG 序列化可能改寫自閉合標記，直接比較狀態屬性及核心幾何座標。
        const expectedAttributes=[...expectedGroup.matchAll(/data-[a-z-]+="[^"]+"/g)].map(m=>m[0]);
        check(expectedAttributes.every(attribute=>coreGroup.includes(attribute)),'畫面核心狀態符合指定步次',{id,operation,language,width});
        const audit=await variant.evaluate(el=>({overflow:document.documentElement.scrollWidth-innerWidth,clipped:[...el.querySelectorAll('h6,p,dd,button')].filter(n=>n.checkVisibility()&&n.scrollWidth>n.clientWidth+2).map(n=>n.textContent.slice(0,80)),chinese:/[\u3400-\u9fff]/.test(el.innerText),svgClipped:[...el.querySelectorAll('.nvm-step-stage svg text')].filter(n=>{const b=n.getBBox();return b.x < -1 || b.x+b.width > 561;}).map(n=>n.textContent)}));
        check(audit.overflow<=1&&!audit.clipped.length&&!audit.svgClipped.length&&(language==='zh'||!audit.chinese),'代表步次無水平溢位、圖內截字或英文漏中文',{id,operation,language,width,...audit});
        if(operation==='write'&&((language==='zh'&&width===390)||(language==='en'&&width===1440)))await demo.screenshot({path:path.join(output,`${id}-${language}-${width}.png`)});
      }
      await context.close();
    }
    check(errors.length===0,'瀏覽器無未處理例外',{errors});
  }
} catch(error) {
  results.push({passed:false,label:'驗證中止',error:error.stack});
  process.exitCode=1;
} finally {
  await browser?.close();await server?.close();
  const reportPath=path.join(output,selected?`結果-${selected}.json`:'結果.json');
  fs.writeFileSync(reportPath,JSON.stringify({scope:ids,mode:process.argv.includes('--static-only')?'靜態狀態':'靜態狀態與代表操作',results,errors},null,2));
  console.log(JSON.stringify({通過:results.filter(r=>r.passed).length,失敗:results.filter(r=>!r.passed).length,報告:reportPath}));
}
