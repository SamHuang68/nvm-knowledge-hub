import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {headings,section,syncPatentReferenceCorpus} from './跨章節引用同步.mjs';
import {startTestServer} from './test-server.mjs';
const root=path.resolve(import.meta.dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8').replaceAll('\r\n','\n');
const before=f=>execFileSync('git',['show',`177056b0c21186f0aa9e8ca1c0f7bc08cf1ebdd2:${f}`],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024}).replaceAll('\r\n','\n');
if(process.argv.includes('--browser')) await browserCheck();
else {
 const normalize=value=>{
  if(Array.isArray(value))return value.map(normalize);
  if(!value||typeof value!=='object')return value;
  const copy=Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normalize(v)]));
  const fields=copy.id==='ip-neofuse-pat'?['label','kind','locator','limit']:copy.id==='EMG-P-TOGGLE'?['locator']:copy.id==='US6545906B1'?['claim','claimReading','verifiedAt']:[];
  for(const field of fields)delete copy[field];return copy;
 };
 for(const suffix of ['','-en']){
  const file=`data/nvm-knowledge-data${suffix}.json`,actual=JSON.parse(read(file)),old=JSON.parse(before(file));
  assert.deepEqual(normalize(actual),normalize(old),'僅指定公報來源及權利項文字可變，全部圖形與案卷保全');
  assert.deepEqual(actual.vendorPatentMaps,old.vendorPatentMaps,'十二家案卷與統計不變');
  const source=actual.sources.find(s=>s.id==='ip-neofuse-pat');
  assert.match(source.label,/A1/);assert.match(source.kind,/A1/);assert.match(source.limit,/鰭|fin/);assert.match(source.locator,/21/);
  const topic=actual.topics.find(t=>t.id==='toggle');assert.match(topic.patents[0].claimReading,/0≤\|Mbr\|≤0.1/);assert.match(topic.patents[0].claimReading,/21/);
  const md=read(`data/nvm-technology-topics${suffix}.md`);assert.ok(md.includes(source.limit));assert.ok(md.includes(topic.patents[0].claimReading));
  const html=read(suffix?'nvm-technology-atlas.html':'nvm-technology-atlas-zh.html'),oldHtml=before(suffix?'nvm-technology-atlas.html':'nvm-technology-atlas-zh.html');
  assert.deepEqual([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]),[...oldHtml.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]),'原有入口保全');
  assert.deepEqual([...html.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map(m=>m[0]),[...oldHtml.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map(m=>m[0]),'圖解原始幾何保全');
 }
 const corpus=read('llms-full.txt'),md=read('data/nvm-technology-topics-en.md');
 assert.equal(syncPatentReferenceCorpus(corpus,md),corpus,'索引同步冪等');
 assert.equal(syncPatentReferenceCorpus(before('llms-full.txt'),md),corpus,'未選章節保全');
 for(const heading of headings)assert.equal(section(corpus,heading),section(md,heading));
 assert.ok(!corpus.includes('That I/O FG HCI pairing is public literature / architecture-class'));
 assert.ok(corpus.includes('author-defined'));
 assert.throws(()=>syncPatentReferenceCorpus('缺少章節',md),/章節缺漏/);
 const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
 assert.equal(pkg.version,'1.6.1');assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);
 console.log('通過：指定引用及匯出一致；其他章節、十二家案卷、圖形與入口保全；文字索引缺章拒絕及同步冪等。');
}
async function browserCheck(){
 const {chromium}=await import('playwright');
 const live=process.env.NVM_QA_BASE,server=live?null:await startTestServer(root),browser=await chromium.launch();
 const output=path.join(root,'qa','跨章節引用',live?'正式站':'本機');fs.mkdirSync(output,{recursive:true});const results=[];
 try{
  for(const locale of ['zh','en'])for(const width of [1440,390]){
   const page=await browser.newPage({viewport:{width,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`${live||server.base}nvm-technology-atlas${locale==='zh'?'-zh':''}.html?lang=${locale}#source-ip-neofuse-pat`);
   const source=page.locator('#source-ip-neofuse-pat');await source.waitFor({state:'visible'});
   assert.match(await source.innerText(),/A1/);assert.match(await source.innerText(),/鰭|fin/);
   await source.scrollIntoViewIfNeeded();await source.screenshot({path:path.join(output,`${locale}-${width}-申請公開.png`)});
   await page.goto(`${live||server.base}nvm-technology-atlas${locale==='zh'?'-zh':''}.html?lang=${locale}#patent-US6545906B1`);
   const patent=page.locator('#patent-US6545906B1');await patent.waitFor({state:'visible'});
   assert.match(await patent.innerText(),/0≤\|Mbr\|≤0.1/);assert.match(await patent.innerText(),/21/);
   const links=patent.locator('a[href*="#page="]');assert.ok(await links.count()>=2);
   const zoom=patent.locator('[data-engineering-zoom]').first();await zoom.waitFor({state:'visible'});await zoom.click();
   const dialog=page.locator('dialog[open]');await dialog.waitFor();await page.keyboard.press('Escape');
   await patent.locator('.nvm-patent-reading').screenshot({path:path.join(output,`${locale}-${width}-權利項.png`)});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'頁面沒有水平溢位');assert.deepEqual(errors,[]);
   results.push({locale,width,source:true,claims:true,zoom:true});await page.close();
  }
  fs.writeFileSync(path.join(output,'結果.json'),JSON.stringify(results,null,2)+'\n');console.log('通過：雙語桌面與手機四案；申請公開界線、權利項原文連結與原圖放大。');
 }finally{await browser.close();await server?.close();}
}
