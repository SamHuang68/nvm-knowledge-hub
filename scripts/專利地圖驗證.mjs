import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {chromium, webkit} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {validateVendorPatentMaps, renderVendorPatentMaps, vendorPatentMapsMarkdown, patentMapTechnology} from './nvm-vendor-patent-maps-ui.mjs';

const root = path.resolve(import.meta.dirname,'..');
if(process.argv.includes('--stats-only')){await checkStatistics();process.exit(0);}

async function checkStatistics(){
  const baseline=process.argv.includes('--baseline');
  const out=path.join(root,'qa','力旺統計',baseline?'修改前':'修改後');fs.mkdirSync(out,{recursive:true});
  const base=process.env.NVM_QA_BASE;
  const server=base?null:await startTestServer(root);
  const browser=await chromium.launch();const results=[];
  try{
    for(const locale of ['zh','en']){
      const data=JSON.parse(fs.readFileSync(path.join(root,`data/nvm-vendor-patent-maps${locale==='en'?'-en':''}.json`),'utf8'));
      const md=vendorPatentMapsMarkdown(data,()=>'',locale);
      assert.ok(md.includes(baseline?'1,150':'1,370+'));
      if(!baseline){assert.ok(md.includes('2026-08-19'));assert.ok(md.includes('eMemory%20Briefing_eng_20260819.pdf#page=4'));}
      const stats=data.vendors.find(v=>v.id==='ememory').patentStats;
      const keys=['keyJurisdictions','foundryCoverage','waferShipment'];
      if(!baseline){
        for(const key of keys){
          const source=stats.metricSources[key];
          assert.ok(md.includes(stats[key])&&md.includes(source.note)&&md.includes(source.date),'Markdown 保留值、來源日期與適用範圍');
          assert.ok(md.includes(source.url+(source.page?'#page='+source.page:'')));
        }
        const appendix=md.slice(md.indexOf('### '+(locale==='en'?'Appendix: Industry':'附錄：NVM')));
        for(const key of keys.slice(1)){assert.ok(appendix.includes(stats.metricSources[key].note));assert.ok(appendix.includes(stats[key]));}
        assert.ok(!md.includes(locale==='en'?'Over 100 Billion':'超過1,000億'),'原無依據晶片顆數不得殘留');
      }
      for(const width of [1440,390]){
        const page=await browser.newPage({viewport:{width,height:960}});
        await page.goto(`${base||server.base}nvm-technology-atlas${locale==='zh'?'-zh':''}.html?lang=${locale}#vendor-ememory`);
        const vendor=page.locator('#vendor-ememory');await vendor.waitFor();await vendor.scrollIntoViewIfNeeded();
        const cards=vendor.locator('.nvm-vendor-stat-card');assert.equal(await cards.count(),4);
        assert.ok((await cards.first().innerText()).includes(baseline?'1,150':'1,370+'));
        if(!baseline){
          const source=cards.first().locator('a');assert.ok((await source.innerText()).includes('2026-08-19'));
          assert.equal(await source.getAttribute('href'),data.vendors.find(v=>v.id==='ememory').patentStats.grantedSource.url+'#page=4');
          await source.focus();assert.equal(await source.evaluate(n=>document.activeElement===n),true);
          assert.equal(await cards.first().evaluate(n=>n.scrollWidth<=n.clientWidth),true,'來源與數字不得溢出卡片');
          for(const [index,key] of keys.entries()){
            const card=cards.nth(index+1),source=stats.metricSources[key],link=card.locator('a');
            const text=await card.innerText();
            assert.ok(text.includes(stats[key])&&(await card.locator('dt').textContent())===source.label&&text.includes(source.note)&&text.includes(source.date),'卡片保留值、標題、日期與範圍');
            assert.equal(await link.getAttribute('href'),source.url+(source.page?'#page='+source.page:''));
            await link.focus();assert.equal(await link.evaluate(n=>document.activeElement===n),true);
            assert.equal(await card.evaluate(n=>n.scrollWidth<=n.clientWidth),true,'來源不得溢出卡片');
          }
          if(locale==='en')assert.ok(!/[\u3400-\u9fff]/u.test((await cards.allInnerTexts()).join('')));
          const matrix=page.locator('.nvm-vendor-landscape-table tbody tr').first().locator('td').last();
          for(const key of keys.slice(1)){
            const source=stats.metricSources[key],text=await matrix.innerText();
            assert.ok(text.includes(stats[key])&&text.includes(source.note)&&text.includes(source.date),'矩陣沿用同一來源與適用範圍');
            assert.equal(await matrix.locator(`a[href="${source.url+(source.page?'#page='+source.page:'')}"]`).count(),1);
          }
          await matrix.scrollIntoViewIfNeeded();
          await matrix.screenshot({path:path.join(out,`${locale}-${width}-矩陣.png`)});
        }
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
        await cards.first().scrollIntoViewIfNeeded();await vendor.locator('.nvm-vendor-stats-grid').screenshot({path:path.join(out,`${locale}-${width}.png`)});
        results.push({locale,width,passed:true,text:await cards.allInnerTexts(),cards:await cards.count()});await page.close();
      }
    }
  }finally{await browser.close();if(server)await server.close();}
  fs.writeFileSync(path.join(out,'結果.json'),JSON.stringify({results},null,2));console.log(JSON.stringify(results));
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
for(const id of recordIDs(baseline)) assert.ok(recordIDs(data.en).includes(id),'保留 Stage 3 所有原始案卷');
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
