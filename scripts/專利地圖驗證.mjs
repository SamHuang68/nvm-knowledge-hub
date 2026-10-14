import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {chromium, webkit} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {validateVendorPatentMaps, renderVendorPatentMaps, vendorPatentMapsMarkdown, patentMapTechnology} from './nvm-vendor-patent-maps-ui.mjs';

const root = path.resolve(import.meta.dirname,'..');
if(process.argv.includes('--vendors-only')){await checkReviewedVendors();process.exit(0);}
if(process.argv.includes('--name-only')||process.argv.includes('--dossier-only')){await checkCompanyName();process.exit(0);}
if(process.argv.includes('--stats-only')){await checkStatistics();process.exit(0);}

async function checkReviewedVendors(){
  const exportsOnly=process.argv.includes('--exports-only');
  const out=path.join(root,'qa','十一家案卷',process.env.NVM_QA_BASE?'正式站':'本機');fs.mkdirSync(out,{recursive:true});
  const base=process.env.NVM_QA_BASE,server=base||exportsOnly?null:await startTestServer(root);
  const browser=exportsOnly?null:await chromium.launch();const results=[];
  try {
    for(const locale of ['zh','en']){
      const data=JSON.parse(fs.readFileSync(path.join(root,`data/nvm-vendor-patent-maps${locale==='en'?'-en':''}.json`),'utf8'));
      const selected=data.vendors.filter(v=>v.id!=='attopsemi');
      validateVendorPatentMaps(data);
      for(const mutate of [p=>delete p.researchSources,p=>p.researchSources[0].page=1,p=>delete p.researchSources[0].pdfSHA256,p=>delete p.correctedFrom.note,p=>p.publicationType='application',p=>p.claimFocus='']){
        const broken=structuredClone(data);mutate(broken.vendors.find(v=>v.id==='ememory').families[0].patents[0]);assert.throws(()=>validateVendorPatentMaps(broken));
      }
      const broken=structuredClone(data),application=broken.vendors.flatMap(v=>v.families.flatMap(f=>f.patents)).find(p=>p.publicationType==='application');
      application.legalStatus='active';assert.throws(()=>validateVendorPatentMaps(broken),/申請公開案/);
      const md=vendorPatentMapsMarkdown(data,()=>'',locale);
      for(const v of selected){
        for(const text of [v.founders,v.personnelSource.note,v.attributionNote])assert.ok(md.includes(text));
        for(const f of v.families)for(const p of f.patents){
          for(const text of [p.title,p.inventors,p.assignee,p.claimFocus,p.mechanism,p.correctedFrom.note,...p.researchSources.flatMap(s=>[s.note,s.url])])assert.ok(md.includes(text),p.id);
          if(p.publicationType==='application')assert.ok(md.includes(`${p.priorityDate} / ${p.publicationDate}`));
        }
      }
      if(locale==='en')assert.ok(!/[\u3400-\u9fff]/u.test(md),'英文匯出不含中文殘留');
      if(exportsOnly){results.push({locale,records:59,exportPassed:true});continue;}
      const url=`${base||server.base}nvm-technology-atlas${locale==='zh'?'-zh':''}.html?lang=${locale}`;
      for(const width of [1440,390]){
        const page=await browser.newPage({viewport:{width,height:960}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
        await page.goto(`${url}#patent-maps`);await page.locator('#nvm-map-company').waitFor();
        const findings=await page.evaluate(({selected,locale})=>{
          const failures=[],check=(ok,label)=>{if(!ok)failures.push(label);};
          const ids=[...document.querySelectorAll('#patent-maps [id]')].map(n=>n.id);check(new Set(ids).size===ids.length,'重複錨點');
          for(const v of selected){
            const vendor=document.getElementById('vendor-'+v.id),matrix=[...document.querySelectorAll('.nvm-vendor-landscape-table tbody tr')].find(row=>row.querySelector(`a[href="#vendor-${v.id}"]`));
            check(vendor&&matrix,v.id+'兩個呈現入口');if(!vendor||!matrix)continue;
            check(vendor.innerText.includes(v.personnelSource.note),v.id+'人員界線');
            check(vendor.innerText.includes(locale==='en'?'Selected Publication Timeline':'選錄公報時間序列'),v.id+'時間序列界線');
            check(vendor.querySelectorAll('.nvm-vendor-stat-card').length===4,v.id+'四項統計');
            check(Number(document.querySelector(`[data-map-vendor-row="${v.id}"] [data-map-row-total]`).textContent)===v.families.flatMap(f=>f.patents).length,v.id+'矩陣計數');
            for(const f of v.families)for(const p of f.patents){
              const card=document.getElementById(`vendor-patent-${f.id}-${p.id}`);check(card,p.id+'案卷');if(!card)continue;
              for(const text of [p.title,p.assignee,p.inventors,p.claimFocus,p.correctedFrom.note])check(card.innerText.includes(text),p.id+'原件導讀');
              for(const area of [card,matrix])for(const source of p.researchSources){
                check(area.innerText.includes(source.note),p.id+'來源說明');
                const href=source.url+(source.page?'#page='+source.page:'');check([...area.querySelectorAll('a')].some(a=>a.getAttribute('href')===href),p.id+'來源頁碼');
              }
              check(document.getElementById(`vendor-patent-${f.id}-${p.correctedFrom.id}`),p.id+'舊錨點');
              if(p.publicationType==='application'){
                check(card.innerText.includes(locale==='en'?'Application Publication Date':'申請公開日'),p.id+'公開種類');
                check(card.innerText.includes(p.publicationDate),p.id+'公開日期');
                check(card.dataset.mapStatus==='unverified',p.id+'待核對');
              }
            }
          }
          check(document.documentElement.scrollWidth<=innerWidth,'頁面橫向溢出');return failures;
        },{selected,locale});
        assert.deepEqual(findings,[]);
        const search=page.locator('#nvm-map-query');
        for(const v of selected){
          const f=v.families[0],p=f.patents[0];
          for(const id of new Set([p.id,p.correctedFrom.id])){
            await search.fill(id);assert.equal(await page.locator(`#vendor-patent-${f.id}-${p.id}`).isVisible(),true);
            assert.ok((await page.locator('#nvm-map-results').innerText()).includes(p.id));
          }
        }
        await search.fill('');await page.locator('#nvm-map-status').selectOption('unverified');
        const expected=selected.flatMap(v=>v.families.flatMap(f=>f.patents)).filter(p=>p.legalStatus==='unverified').length;
        assert.equal(await page.locator('[data-map-record]:visible').count(),expected);
        assert.equal(await page.locator('[data-map-record]:visible[data-map-status=active]').count(),0);
        await page.locator('.nvm-map-explorer').screenshot({path:path.join(out,`${locale}-${width}-待核對篩選.png`)});
        await page.locator('#nvm-map-status').selectOption('');
        await page.locator('#vendor-patent-neofuse-family-US20250024668A1 .nvm-patent-claim-row').screenshot({path:path.join(out,`${locale}-${width}-申請案權利項.png`)});
        const alias='vendor-patent-pufsecurity-rot-family-US7243236B2';
        await page.goto(`${url}&pm_company=everspin#${alias}`);const anchor=page.locator('#'+alias);await anchor.waitFor({state:'visible'});
        assert.equal(await page.locator('#nvm-map-company').inputValue(),'');assert.equal(await anchor.evaluate(n=>document.activeElement===n),true);
        await page.reload();await anchor.waitFor({state:'visible'});
        const pathname=new URL(page.url()).pathname;
        await Promise.all([page.waitForURL(u=>u.pathname!==pathname),page.locator('.language-toggle, #languageToggle').first().click()]);
        await page.locator('#'+alias).waitFor({state:'visible'});assert.equal(new URL(page.url()).hash,'#'+alias);
        assert.deepEqual(errors,[]);results.push({locale,width,records:59,passed:true,sources:true,corrections:true,matrix:true,search:true,applicationFilter:true,deepLink:true});await page.close();
      }
      const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(`${url}#patent-maps`);
      assert.equal(await nojs.locator('[data-map-record]').count(),61);
      assert.equal(await nojs.locator('#vendor-patent-neofuse-family-US20250024668A1').isVisible(),true);await nojs.close();
    }
  }finally{if(browser)await browser.close();if(server)await server.close();}
  fs.writeFileSync(path.join(out,exportsOnly?'匯出結果.json':'結果.json'),JSON.stringify({results,noJavaScript:!exportsOnly},null,2));console.log(JSON.stringify({cases:results.length,recordsPerCase:59,exportsOnly,passed:true}));
}

async function checkCompanyName(){
  const out=path.join(root,'qa','上峰案卷',process.env.NVM_QA_BASE?'正式站':'本機');fs.mkdirSync(out,{recursive:true});
  const base=process.env.NVM_QA_BASE;
  const server=base?null:await startTestServer(root);
  const browser=await chromium.launch();const results=[];
  try{
    for(const locale of ['zh','en']){
      const data=JSON.parse(fs.readFileSync(path.join(root,`data/nvm-vendor-patent-maps${locale==='en'?'-en':''}.json`),'utf8'));
      const record=data.vendors.find(v=>v.id==='attopsemi'),family=record.families[0],patents=family.patents;
      const md=vendorPatentMapsMarkdown(data,()=>'',locale);
      validateVendorPatentMaps(data);
      for(const [mutate,pattern] of [
        [v=>delete v.nameSource.note,/名稱來源不完整/],
        [v=>delete v.personnelSource,/人員與研究來源不完整/],
        [v=>v.founders='鍾世緯',/人員與研究來源不完整/],
        [v=>v.families[0].patents[0].id='US9165979B2',/公報或更正對應不正確/],
        [v=>delete v.families[0].patents[0].researchSources,/權利項來源不完整/],
        [v=>v.families[0].patents[0].researchSources[0].page=1,/權利項來源不完整/],
        [v=>v.families[0].patents[1].assignee='Micron',/首頁身分不正確/]
      ]){
        const broken=structuredClone(data);mutate(broken.vendors.find(v=>v.id==='attopsemi'));assert.throws(()=>validateVendorPatentMaps(broken),pattern);
      }
      assert.deepEqual(patents.map(p=>p.id),['US9711237B2','US10923204B2']);
      for(const text of [record.name,record.nameSource.note,record.founders,record.personnelSource.note,...record.researchSources.map(s=>s.note)])assert.ok(md.includes(text));
      for(const p of patents)for(const text of [p.claimFocus,p.mechanism,p.assignee,p.correctedFrom.id,p.correctedFrom.note,...p.researchSources.flatMap(s=>[s.note,s.url])])assert.ok(md.includes(text));
      if(locale==='en')assert.ok(!/[\u3400-\u9fff]/u.test(md));
      const url=`${base||server.base}nvm-technology-atlas${locale==='zh'?'-zh':''}.html?lang=${locale}`;
      for(const width of [1440,390]){
        const page=await browser.newPage({viewport:{width,height:960}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
        await page.goto(`${url}#vendor-attopsemi`);
        const vendor=page.locator('#vendor-attopsemi');await vendor.waitFor();
        const matrix=page.locator('.nvm-vendor-landscape-table tbody tr').nth(data.vendors.indexOf(record));
        assert.ok((await vendor.locator('h3').innerText()).includes(record.name));
        assert.equal(await page.locator('#nvm-map-company option[value=attopsemi]').innerText(),record.shortName);
        assert.ok((await page.locator('[data-map-vendor-row=attopsemi] th').innerText()).includes(record.shortName));
        assert.equal(await vendor.locator('[data-map-record]').count(),2);
        assert.equal(await vendor.locator('.nvm-vendor-stat-card').count(),4);
        for(const area of [vendor.locator('.nvm-vendor-profile-header'),matrix.locator('td').first()]){
          for(const source of [record.nameSource,record.personnelSource]){
            assert.ok((await area.innerText()).includes(source.note));
            const link=area.locator(`a[href="${source.url}"]`).first();await link.focus();assert.equal(await link.evaluate(n=>document.activeElement===n),true);
          }
        }
        const search=page.locator('#nvm-map-query');
        for(const p of patents){
          const card=vendor.locator(`[data-map-record][id$="-${p.id}"]`);
          for(const text of [p.assignee,p.inventors,p.claimFocus,p.correctedFrom.note])assert.ok((await card.innerText()).includes(text));
          for(const area of [card,matrix]){
            for(const source of p.researchSources){
              assert.ok((await area.innerText()).includes(source.note));
              assert.equal(await area.locator(`.nvm-stat-source a[href="${source.url}${source.page?'#page='+source.page:''}"]`).count(),1);
            }
            assert.equal(await area.locator(`a[href="${p.correctedFrom.url}"]`).count(),1);
          }
          for(const id of [p.id,p.correctedFrom.id]){
            await search.fill(id);assert.equal(await vendor.locator('[data-map-record]:visible').count(),1);
            assert.equal(await card.isVisible(),true);
            assert.ok((await page.locator('#nvm-map-results').innerText()).includes(p.id));
          }
          await search.fill('');
          await card.locator('.nvm-patent-claim-row').screenshot({path:path.join(out,`${locale}-${width}-${p.id}-權利項.png`)});
        }
        await search.fill(locale==='zh'?'上峰科技':'Attopsemi');assert.equal(await vendor.locator('[data-map-record]:visible').count(),2);
        await search.fill('寬緯科技');assert.equal(await vendor.locator('[data-map-record]:visible').count(),0);await search.fill('');
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        await vendor.locator('.nvm-vendor-profile-header').screenshot({path:path.join(out,`${locale}-${width}-公司.png`)});
        await matrix.screenshot({path:path.join(out,`${locale}-${width}-矩陣.png`)});
        for(const p of patents){
          const alias=`vendor-patent-${family.id}-${p.correctedFrom.id}`;
          await page.goto(`${url}&pm_company=everspin#${alias}`);
          const anchor=page.locator(`#${alias}`);await anchor.waitFor({state:'visible'});
          assert.ok((await anchor.innerText()).includes(p.correctedFrom.note));
          assert.equal(await page.locator('#nvm-map-company').inputValue(),'');
          assert.equal(await anchor.evaluate(n=>document.activeElement===n),true);
          await page.reload();await anchor.waitFor({state:'visible'});
          assert.ok((await anchor.innerText()).includes(p.correctedFrom.id));
          const pathname=new URL(page.url()).pathname;
          await Promise.all([page.waitForURL(u=>u.pathname!==pathname),page.locator('.language-toggle, #languageToggle').first().click()]);
          await page.locator(`#${alias}`).waitFor({state:'visible'});
          assert.equal(new URL(page.url()).hash,'#'+alias);
        }
        assert.deepEqual(errors,[]);results.push({locale,width,passed:true,records:2,claims:true,sources:true,correctionLinks:true,search:true,reload:true,language:true});await page.close();
      }
      const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(`${url}#vendor-attopsemi`);
      for(const p of patents)for(const id of [p.id,p.correctedFrom.id])assert.equal(await nojs.locator(`#vendor-patent-${family.id}-${id}`).isVisible(),true);
      await nojs.close();
    }
  }finally{await browser.close();if(server)await server.close();}
  fs.writeFileSync(path.join(out,'結果.json'),JSON.stringify({results,noJavaScript:true},null,2));console.log(JSON.stringify({views:results.length,passed:true}));
}

async function checkStatistics(){
  const baseline=process.argv.includes('--baseline');
  const selected=process.argv.find(arg=>arg.startsWith('--vendors='))?.slice(10).split(',');
  const out=path.join(root,'qa','其他廠商統計',baseline?'修改前':selected?'範圍文字補驗':'修改後');fs.mkdirSync(out,{recursive:true});
  const base=process.env.NVM_QA_BASE;
  const server=base?null:await startTestServer(root);
  const browser=await chromium.launch();const results=[];
  const keys=['totalGrantedWorldwide','keyJurisdictions','foundryCoverage','waferShipment'];
  try{
    for(const locale of ['zh','en']){
      const data=JSON.parse(fs.readFileSync(path.join(root,`data/nvm-vendor-patent-maps${locale==='en'?'-en':''}.json`),'utf8'));
      const md=vendorPatentMapsMarkdown(data,()=>'',locale);
      if(!baseline){
        validateVendorPatentMaps(data);
        const broken=structuredClone(data);delete broken.vendors[1].patentStats.metricSources.totalGrantedWorldwide.note;
        assert.throws(()=>validateVendorPatentMaps(broken),/統計來源不完整/,'來源缺範圍時阻擋生成');
      }
      const appendix=md.slice(md.indexOf('### '+(locale==='en'?'Appendix: Industry':'附錄：NVM')));
      assert.ok(md.includes('1,370+')&&md.includes('2026-08-19'),'力旺已核對的統計保持');
      for(const width of [1440,390]){
        const page=await browser.newPage({viewport:{width,height:960}});
        await page.goto(`${base||server.base}nvm-technology-atlas${locale==='zh'?'-zh':''}.html?lang=${locale}#patent-maps`);
        if(selected)for(const id of selected)assert.ok(data.vendors.some(v=>v.id===id),'指定廠商必須存在');
        for(const [vendorIndex,record] of data.vendors.entries()){
          if(selected&&!selected.includes(record.id))continue;
          const stats=record.patentStats;
          const vendor=page.locator('#vendor-'+record.id);await vendor.waitFor();
          const cards=vendor.locator('.nvm-vendor-stat-card');assert.equal(await cards.count(),4);
          for(const [index,key] of keys.entries()){
            const card=cards.nth(index),source=stats.metricSources?.[key];
            assert.ok((await card.innerText()).includes(stats[key]));
            assert.equal(await card.evaluate(n=>n.scrollWidth<=n.clientWidth),true,'四卡不得橫向溢出');
            if(!baseline&&source){
              const text=await card.innerText(),url=source.url+(source.page?'#page='+source.page:'');
              assert.equal(await card.locator('dt').textContent(),source.label);
              assert.ok(text.includes(source.note)&&text.includes(source.date),'卡片顯示日期與適用範圍');
              for(const ref of source.references||[]){
                const href=ref.url+(ref.page?'#page='+ref.page:'');
                assert.ok(text.includes(ref.date)&&text.includes(ref.note)&&md.includes(href)&&md.includes(ref.note));
                assert.equal(await card.locator(`a[href="${href}"]`).count(),1);
              }
              const link=card.locator('a').first();assert.equal(await link.getAttribute('href'),url);
              await link.focus();assert.equal(await link.evaluate(n=>document.activeElement===n),true);
              assert.ok(md.includes(stats[key])&&md.includes(source.note)&&md.includes(source.date)&&md.includes(url),'匯出與來源契約同步');
              if(index>=2){
                const matrix=page.locator('.nvm-vendor-landscape-table tbody tr').nth(vendorIndex).locator('td').last();
                const text=await matrix.innerText();
                assert.ok(text.includes(stats[key])&&text.includes(source.note)&&text.includes(source.date),'矩陣與卡片同步');
                assert.ok(await matrix.locator(`a[href="${url}"]`).count()>=1);
                assert.ok(appendix.includes(stats[key])&&appendix.includes(source.note),'匯出矩陣同步');
              }
            }
            if(!baseline&&record.id!=='ememory')assert.ok(source?.date&&source?.note&&source?.url,'其他十一家四卡均有來源與範圍');
          }
          if(locale==='en')assert.ok(!/[\u3400-\u9fff]/u.test((await cards.allInnerTexts()).join('')));
          assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
          await vendor.locator('.nvm-vendor-stats-grid').screenshot({path:path.join(out,`${locale}-${width}-${record.id}.png`)});
          results.push({locale,width,vendor:record.id,passed:true,cards:await cards.count(),text:await cards.allInnerTexts()});
        }
        await page.close();
      }
    }
  }finally{await browser.close();if(server)await server.close();}
  fs.writeFileSync(path.join(out,'結果.json'),JSON.stringify({results},null,2));console.log(JSON.stringify({views:results.length,cards:results.length*4,passed:true}));
}

const engine = process.argv.find(arg=>arg.startsWith('--engine='))?.split('=')[1] || 'chromium';
assert.ok(['chromium','webkit'].includes(engine), '僅驗證明列的瀏覽器引擎');
const out = path.join(root,'qa','專利地圖',engine);
fs.mkdirSync(out,{recursive:true});
const data = Object.fromEntries(['en','zh'].map(locale=>[locale,JSON.parse(fs.readFileSync(path.join(root,`data/nvm-vendor-patent-maps${locale==='en'?'-en':''}.json`),'utf8'))]));
const recordIDs = value=>value.vendors.flatMap(v=>v.families.flatMap(f=>f.patents.map(p=>`vendor-patent-${f.id}-${p.id}`)));
const totalRecords=recordIDs(data.en).length;
const uniquePublications=new Set(data.en.vendors.flatMap(v=>v.families.flatMap(f=>f.patents.map(p=>p.id)))).size;
const baseline=JSON.parse(execFileSync('git',['show','3374f2a064815f0dc96e850c469b0710b19db828:data/nvm-vendor-patent-maps.json'],{cwd:root,encoding:'utf8'}));
const compatibleIDs=[...recordIDs(data.en),...data.en.vendors.flatMap(v=>v.families.flatMap(f=>f.patents.filter(p=>p.correctedFrom).map(p=>`vendor-patent-${f.id}-${p.correctedFrom.id}`)))];
for(const id of recordIDs(baseline)) assert.ok(compatibleIDs.includes(id),'保留 Stage 3 入口；已核准的誤歸案卷重建以更正錨點承接');
assert.deepEqual(recordIDs(data.en),recordIDs(data.zh),'雙語案卷識別一致');
for (const [locale,value] of Object.entries(data)) {
  validateVendorPatentMaps(value);
  const html=renderVendorPatentMaps(value,locale,()=>''), md=vendorPatentMapsMarkdown(value,()=>'',locale);
  assert.ok(recordIDs(value).length>=52,'保留 Stage 3 收錄並容納後續新增');
  assert.equal(new Set(value.vendors.flatMap(v=>v.families.flatMap(f=>f.patents.map(p=>p.id)))).size,uniquePublications);
  for (const vendor of value.vendors) for (const family of vendor.families) for (const patent of family.patents) {
    assert.ok(html.includes(`id="vendor-patent-${family.id}-${patent.id}"`),'保留既有公報錨點');
    for (const field of ['id','title','claimFocus','mechanism','coreProblem','productLink','assignee']) assert.ok(md.includes(patent[field]),`匯出保留 ${field}`);
  }
  assert.ok(md.includes(locale==='en'?'Requires Case Review':'待個案核對'));
  if (locale==='en') assert.ok(!/[\u3400-\u9fff]/u.test(md),'英文專利地圖匯出無繁中標籤殘留');
  const broken=structuredClone(value); broken.vendors[0].families[0].id='unclassified';
  assert.throws(()=>validateVendorPatentMaps(broken),/尚未分類/,'新增未分類組合會阻擋生成');
}
const server=await startTestServer(root);
const browser=await ({chromium,webkit}[engine]).launch();
const observations=[];
try {
  for (const locale of ['en','zh']) for (const width of [1440,390]) {
    const context=await browser.newContext({viewport:{width,height:960},isMobile:width===390,hasTouch:width===390});
    const page=await context.newPage(); page.setDefaultTimeout(10000);
    const errors=[]; page.on('pageerror',error=>errors.push(error.message));
    const pathname=`nvm-technology-atlas${locale==='zh'?'-zh':''}.html`;
    await page.goto(`${server.base}${pathname}?lang=${locale}#patent-maps`);
    const map=page.locator('#patent-maps');
    await map.waitFor({state:'visible'});
    await map.locator('[data-map-controls]').waitFor({state:'visible'});
    assert.equal(await page.locator('html').getAttribute('lang'),locale==='en'?'en':'zh-Hant');
    const visible=()=>map.locator('[data-map-record]:visible').count();
    assert.equal(await visible(),totalRecords);
    assert.equal(await map.locator('[data-map-vendor]:visible').count(),12);
    assert.equal(await map.locator('[data-map-family]:visible').count(),19);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'整頁不得橫向溢位');
    await page.screenshot({path:path.join(out,`${locale}-${width}-總覽.png`)});
    assert.deepEqual(await map.locator('[data-map-record]').evaluateAll(nodes=>nodes.map(n=>n.id)),recordIDs(data[locale]));
    fs.writeFileSync(path.join(out,`${locale}-${width}-可見文字.txt`),await map.innerText());
    // 閱讀案卷後改篩選，分享／重整必須保留新的結果，不能被舊錨點清空。
    await map.locator('#nvm-map-technology').selectOption('mram');
    await map.locator('#nvm-map-results li:visible a').first().click();
    await page.waitForFunction(()=>location.hash.startsWith('#vendor-patent-'));
    await map.locator('#nvm-map-technology').selectOption('eflash');
    await page.reload();
    await map.locator('[data-map-controls]').waitFor({state:'visible'});
    assert.equal(await map.locator('#nvm-map-technology').inputValue(),'eflash','更改篩選後重整不得被舊案卷錨點清空');
    assert.equal(await visible(),9);
    await map.locator('button[type=reset]').click();
    const company=map.locator('#nvm-map-company');
    await company.selectOption('ememory');
    const companyRecords=data[locale].vendors.find(v=>v.id==='ememory').families.flatMap(f=>f.patents);
    assert.equal(await visible(),companyRecords.length,'廠商篩選僅取所屬分組，不混入正文提及的其他廠商');
    assert.equal(await map.locator('[data-map-vendor]:visible').count(),1);
    assert.equal(new URL(page.url()).searchParams.get('pm_company'),'ememory');
    await map.locator('#nvm-map-technology').selectOption('otp');
    await map.locator('#nvm-map-status').selectOption('active');
    const companyExpected=data[locale].vendors.find(v=>v.id==='ememory').families.filter(f=>patentMapTechnology(f)==='otp').flatMap(f=>f.patents.filter(p=>p.legalStatus==='active')).length;
    assert.equal(await visible(),companyExpected,'廠商、技術與狀態共同篩選');
    const matrixLink=map.locator('[data-map-vendor-row="ememory"] [data-map-cell="otp"] a');
    assert.equal(new URL(await matrixLink.evaluate(n=>n.href)).search,page.url().split('?')[1].split('#')[0] ? new URL(page.url()).search : '', '矩陣連結沿用當前查詢參數');
    await matrixLink.click();
    await page.waitForFunction(()=>location.hash.startsWith('#family-') && document.activeElement?.tagName==='H4');
    assert.equal(await company.inputValue(),'ememory','矩陣跳轉不改動篩選');
    assert.equal(await visible(),companyExpected);
    const chosen=map.locator('#nvm-map-results li:visible a').first();
    const chosenID=(await chosen.getAttribute('href')).slice(1);
    await chosen.click();
    await page.locator(`[id="${chosenID}"] [data-map-return]`).click();
    await page.waitForFunction(()=>location.hash==='#nvm-map-results' && document.activeElement?.id==='nvm-map-results');
    assert.equal(await company.inputValue(),'ememory','返回結果不清除廠商篩選');
    assert.equal(await visible(),companyExpected);
    const resultBox=await map.locator('#nvm-map-results').boundingBox();
    const navigationBottom=await page.locator('.nvm-reading-position').evaluate(n=>n.getBoundingClientRect().bottom);
    assert.ok(resultBox.y>=navigationBottom-1,'結果入口不被固定導覽遮住');
    await page.screenshot({path:path.join(out,`${locale}-${width}-廠商結果.png`)});
    await page.goBack();
    await page.waitForFunction(id=>location.hash===`#${id}`,chosenID);
    assert.equal(await company.inputValue(),'ememory');
    await page.goForward();
    await page.waitForFunction(()=>location.hash==='#nvm-map-results');
    await page.reload();
    await map.locator('[data-map-controls]').waitFor({state:'visible'});
    assert.equal(await company.inputValue(),'ememory','重整保留廠商篩選');
    await Promise.all([page.waitForURL(url=>!url.pathname.endsWith('/'+pathname)),page.locator('.language-toggle, #languageToggle').first().click()]);
    await map.locator('[data-map-controls]').waitFor({state:'visible'});
    assert.equal(await company.inputValue(),'ememory','切換語系保留廠商篩選');
    assert.equal(await visible(),companyExpected);
    await page.goto(`${server.base}${pathname}?lang=${locale}&pm_company=unknown&keep=1#patent-maps`);
    await map.locator('[data-map-controls]').waitFor({state:'visible'});
    assert.equal(await company.inputValue(),'','未知廠商不造成空白狀態');
    await company.selectOption('ememory');
    assert.equal(new URL(page.url()).searchParams.get('keep'),'1','保留其他控制器的查詢參數');
    await map.locator('button[type=reset]').click();
    assert.equal(new URL(page.url()).searchParams.has('pm_company'),false);
    await page.goto(`${server.base}${pathname}?lang=${locale}&pm_company=everspin#vendor-patent-neobit-family-US6678190B2`);
    await map.locator('[data-map-controls]').waitFor({state:'visible'});
    await page.waitForFunction(()=>document.querySelector('#nvm-map-company').value==='');
    assert.ok(await page.locator('#vendor-patent-neobit-family-US6678190B2').isVisible(),'外部直接案卷連結仍能揭露不相容廠商篩選');
    await page.locator('#vendor-patent-neobit-family-US6678190B2 [data-map-return]').click();
    await page.waitForFunction(()=>location.hash==='#nvm-map-heading' && document.activeElement?.id==='nvm-map-heading');
    const search=map.locator('#nvm-map-query');
    await search.fill('US10651268B2');
    assert.equal(await visible(),2,'同一公報跨組合收錄不漏列');
    assert.ok((await map.locator('#nvm-map-count').innerText()).includes(locale==='en'?'1 distinct':'1 個不同'));
    await search.fill('eMeMoRy');
    assert.ok(await visible()>=14,'大小寫不影響搜尋，涵蓋 eMemory 與其他提及它的紀錄');
    assert.equal(await map.locator('#vendor-ememory [data-map-record]:visible').count(),14);
    await search.fill('');
    await map.locator('#nvm-map-technology').selectOption('mram');
    assert.equal(await visible(),data[locale].vendors.find(v=>v.id==='everspin').families.reduce((sum,f)=>sum+f.patents.length,0),'MRAM 含主分支新增案卷');
    await map.locator('#nvm-map-status').selectOption('active');
    const expected=data[locale].vendors.flatMap(v=>v.families.filter(f=>patentMapTechnology(f)==='mram').flatMap(f=>f.patents.filter(p=>p.legalStatus==='active'))).length;
    assert.equal(await visible(),expected,'技術與狀態可交集篩選');
    await page.screenshot({path:path.join(out,`${locale}-${width}-篩選.png`)});
    const first=map.locator('#nvm-map-results li:visible a').first();
    const target=(await first.getAttribute('href')).slice(1);
    await first.click();
    await page.waitForFunction(id=>location.hash===`#${id}` && document.activeElement?.tagName==='H6',target);
    assert.ok(await page.locator(`[id="${target}"]`).isVisible());
    await page.goBack();
    await map.locator('#nvm-map-query').waitFor({state:'visible'});
    assert.equal(await map.locator('#nvm-map-technology').inputValue(),'mram','歷史返回保留篩選');
    await search.fill('找不到的公報-zzzz');
    assert.equal(await visible(),0);
    assert.ok(await map.locator('#nvm-map-empty').isVisible());
    await map.locator('button[type=reset]').click();
    assert.equal(await visible(),totalRecords);
    await search.focus(); await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'nvm-map-company','鍵盤順序可達廠商篩選');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'nvm-map-technology','鍵盤順序可達技術篩選');
    await map.locator('#nvm-map-status').selectOption('active');
    await page.goto(`${server.base}${pathname}?lang=${locale}&pm_status=active#vendor-patent-neobit-family-US6678190B2`);
    await page.waitForFunction(()=>document.querySelector('#nvm-map-status').value==='');
    assert.ok(await page.locator('#vendor-patent-neobit-family-US6678190B2').isVisible(),'不相容篩選不能隱藏直接連結');
    await page.goto(`${server.base}${pathname}?lang=${locale}&pm_tech=eflash#patent-maps`);
    await map.locator('#nvm-map-technology').waitFor({state:'visible'});
    assert.equal(await visible(),9,'eFlash 共九筆，保留 Stage 3');
    await Promise.all([page.waitForURL(url=>!url.pathname.endsWith('/'+pathname)),page.locator('.language-toggle, #languageToggle').first().click()]);
    await map.locator('[data-map-controls]').waitFor({state:'visible'});
    await page.waitForFunction(previous=>document.documentElement.lang!==previous,locale==='en'?'en':'zh-Hant');
    assert.equal(await map.locator('#nvm-map-technology').inputValue(),'eflash','切換語系保留分類');
    assert.equal(await visible(),9);
    const aria=await map.locator('[data-map-controls]').ariaSnapshot();
    assert.ok(aria.includes('searchbox') && aria.includes('combobox') && aria.includes('button'),'搜尋與篩選具有原生讀屏語意');
    fs.writeFileSync(path.join(out,`${locale}-${width}-語意.txt`),aria);
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'200% 文字放大沒有整頁橫向溢位');
    assert.deepEqual(errors,[],'專利地圖流程無瀏覽器例外');
    observations.push({locale,width,engine,records:totalRecords,uniquePublications,search:true,filters:true,companyFilter:true,returnToResults:true,filterReload:true,deepLinks:true,history:true,language:true,keyboard:true,semantics:true,textZoom:true});
    await context.close();
  }
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto(`${server.base}nvm-technology-atlas.html#${recordIDs(data.en)[0]}`);
  assert.equal(await page.locator('#patent-maps [data-map-record]').count(),totalRecords,'未啟用 JS 仍保留全案卷');
  assert.ok(await page.locator('[data-map-controls]').isHidden(),'無 JS 不顯示不可操作的搜尋');
  await page.locator('[data-map-return]').first().click();
  assert.equal(new URL(page.url()).hash,'#nvm-map-heading','無 JS 的返回入口仍指向可見總覽');
  assert.ok(await page.locator('#nvm-map-heading').isVisible());
  await context.close();
} finally { await browser.close(); await server.close(); }
fs.writeFileSync(path.join(out,'結果.json'),JSON.stringify(observations,null,2));
console.log(`專利地圖局部驗證通過：${engine}，雙語 × 桌面／手機共 ${observations.length} 組，${totalRecords} 筆案卷與 ${uniquePublications} 個公報完整保留。`);
