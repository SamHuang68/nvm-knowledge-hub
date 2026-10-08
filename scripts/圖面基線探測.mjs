import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'qa','圖面演示驗證');
fs.mkdirSync(out,{recursive:true});
const server=await startTestServer(root);
const browser=await chromium.launch({headless:true});
const baseline=process.argv.includes('--baseline');
try {
 const page=await browser.newPage({viewport:{width:1440,height:1100}});
 if(baseline) for(const file of ['nvm-engineering-diagrams.js','nvm-engineering-diagrams.css','nvm-bitcell-figures.css','literature-paper.js','literature-editorial.css']) {
  const body=execFileSync('git',['show',`HEAD:${file}`],{cwd:root,encoding:'utf8'});
  await page.route(`**/${file}*`,route=>route.fulfill({body,contentType:file.endsWith('css')?'text/css':'application/javascript'}));
 }
 await page.goto(server.base+'nvm-technology-atlas.html?lang=en#op-stt-read',{waitUntil:'networkidle'});
 const audit=await page.locator('#op-stt-read').evaluate(el=>({labels:[...el.querySelectorAll('.nvm-op-drawing svg text')].filter(t=>['P','AP','Vread'].includes(t.textContent)).map(t=>({text:t.textContent,fill:t.getAttribute('fill'),computed:getComputedStyle(t).fill})),materials:[...el.querySelectorAll('.nvm-op-drawing svg rect[width="66"]')].slice(0,8).map(t=>({fill:t.getAttribute('fill'),computed:getComputedStyle(t).fill,stroke:t.getAttribute('stroke'),strokeComputed:getComputedStyle(t).stroke,style:t.getAttribute('style')})),whiteStrokes:[...el.querySelectorAll('.nvm-op-drawing svg [stroke="#ffffff"]')].length,frames:el.querySelectorAll('.nvm-op-frame').length}));
 const prefix=baseline?'修改前':'修改後';
 await page.locator('#op-stt-read .nvm-op-variant').first().screenshot({path:path.join(out,prefix+'-STT讀取-桌面.png')});
 fs.writeFileSync(path.join(out,prefix+'圖面摘要.json'),JSON.stringify(audit,null,2));
 console.log(JSON.stringify(audit));
} finally {await browser.close(); await server.close();}
