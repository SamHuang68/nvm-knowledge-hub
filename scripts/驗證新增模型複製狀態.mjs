import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

// 僅覆蓋本次八個新工具及共用元件的必要邊界，不重跑舊工具矩陣。
const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(root, process.env.NVM_QA_OUTPUT || 'qa/新增模型複製狀態');
const args = process.argv.slice(2);
assert.ok(args.every(v => /^--group=(normal|puf|legacy)$/.test(v) || /^--tool=.+$/.test(v)), '僅接受 --group=normal|puf|legacy 及 --tool=工具名稱');
assert.ok(args.filter(v => v.startsWith('--group=')).length <= 1 && args.filter(v => v.startsWith('--tool=')).length <= 1,'篩選參數不得重複');
const group = args.find(v => v.startsWith('--group='))?.slice('--group='.length);
const tool = args.find(v => v.startsWith('--tool='))?.slice('--tool='.length);
const selected = name => !group || group === name;
const resultPath = path.join(output, `新增模型複製結果${group ? `-${group}` : ''}.json`);
fs.mkdirSync(output, {recursive:true});
const targets = [
  {name:'FinFET',page:'technology-comparison.html',root:'finfet-gaa-simulator-root',id:'finfet-e1d-val'},
  {name:'類比 CiM',page:'ai-nvm-opportunities.html',root:'cim-mac-precision-root',id:'cim-mac-out-enob'},
  {name:'神經形態 CiM',page:'ai-nvm-opportunities.html',root:'cim-neuromorphic-simulator-root',id:'cim-out-energy'},
  {name:'奈米片',page:'ai-nvm-opportunities.html',root:'bspdn-nvm-simulator-root',id:'bspdn-out-irdrop'},
  {name:'能量採集',page:'iot-mcu-envm.html',root:'normally-off-simulator-root',id:'norm-out-avgpower'},
  {name:'PQC',page:'security-assurance.html',root:'pqc-dpa-simulator-root',id:'pqc-metric-mtd'},
  {name:'PUF',page:'oip-secure-storage.html',root:'puf-reconstruction-root',id:'puf-ber-display'},
  {name:'垂直堆疊',page:'technology-comparison.html',root:'vertical-3d-simulator-root',id:'vert3d-out-worstdelay'}
];
assert.ok(!tool || targets.some(t => t.name === tool),`未知工具名稱：${tool}；可用名稱：${targets.map(t => t.name).join('、')}`);
const normalTargets = targets.filter(t => !tool || t.name === tool);
const pufIds = ['puf-ber-display','puf-fer-display','puf-helper-display','puf-entropy-display'];
const pufTarget = targets.find(t => t.name === 'PUF');
const legacyTarget = {name:'BSPDN',page:'memory-physics.html',root:'bspdn-envm-simulator-root',id:'bspdn-out-irdrop'};
const results = [], started = Date.now();
let server, browser, base, expired = false, nativeCopies = 0;
const planned = (selected('normal') ? normalTargets.length : 0) + (selected('puf') ? 2 : 0) + (selected('legacy') ? 3 : 0);
function writeReport() {
  const report = {範圍:group || '三組',正常組工具:tool || '八個工具',案例:planned,已執行:results.length,通過:results.filter(r => r.通過).length,
    真實複製數:nativeCopies,剪貼簿說明:'正常組使用原生剪貼簿寫入與讀回；PUF 與相容組使用受控測試替身。',
    目標:base || process.env.NVM_QA_BASE || '本機測試伺服器',總上限秒:90,等待上限秒:7,逾時:expired,
    耗時秒:Number(((Date.now()-started)/1000).toFixed(2)),結果:results.map(({context,page,...record}) => record)};
  fs.writeFileSync(resultPath, JSON.stringify(report,null,2)+'\n');
  return report;
}
// 先停止自己開啟的瀏覽器，讓目前操作收到拒絕並進入既有 catch；保留兩秒關閉資源。
const shutdown = setTimeout(() => {expired=true; void browser?.close().catch(() => {});}, 88000);
const deadline = setTimeout(() => {expired=true; writeReport(); console.error('新增模型複製驗證已達 90 秒上限。'); process.exit(1);}, 90000);
const metric = (page,id) => page.locator(`#${id}`);
const button = (page,id) => page.locator(`[data-copy-value="${id}"]`);
const status = (page,id) => metric(page,id).locator('..').locator('.model-value-copy-status');
const currentValue = (page,id) => metric(page,id).evaluate(e => e.textContent.trim());
const requestCount = page => page.evaluate(() => window.複製請求.length);

async function open(target,lang,width,mode,record) {
  const context = await browser.newContext({serviceWorkers:'block',viewport:{width,height:1000},reducedMotion:'reduce'});
  record.context = context;
  const origin = new URL(base).origin;
  await context.route('**/*',route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  if (mode === 'native') await context.grantPermissions(['clipboard-read','clipboard-write'],{origin});
  await context.addInitScript(clipboardMode => {
    window.複製未處理拒絕 = [];
    window.addEventListener('unhandledrejection',event => window.複製未處理拒絕.push(String(event.reason)));
    if (clipboardMode === 'native') return;
    window.複製請求 = [];
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:clipboardMode === 'missing' ? undefined : {
      writeText:value => new Promise((resolve,reject) => window.複製請求.push({value,resolve,reject}))
    }});
  },mode);
  const page = await context.newPage();
  page.on('pageerror',error => record.頁面例外.push(error.message));
  page.setDefaultTimeout(7000);
  page.setDefaultNavigationTimeout(7000);
  await page.goto(`${base}${target.page}?lang=${lang}`,{waitUntil:'domcontentloaded'});
  await button(page,target.id).waitFor({state:'attached'});
  record.page = page;
  return page;
}
async function runCase(name,target,lang,width,mode,run) {
  const record = {項目:name,通過:false,頁面:target.page,初始語言:lang,寬度:width,
    剪貼簿:mode === 'native' ? '原生寫入與讀回' : mode === 'missing' ? '缺少介面測試替身' : '受控 Promise 測試替身',觀測:[],頁面例外:[],未處理拒絕:[]};
  results.push(record);
  if (expired) {record.錯誤='因總時間上限而未執行'; return;}
  try {
    const page = await open(target,lang,width,mode,record);
    await run(page,record);
    record.未處理拒絕 = await page.evaluate(() => window.複製未處理拒絕);
    assert.deepEqual(record.頁面例外,[],'不得出現頁面例外');
    assert.deepEqual(record.未處理拒絕,[],'不得出現未處理的非同步拒絕');
    record.通過 = true;
  } catch (error) {
    record.錯誤 = error.message;
    record.錯誤類型 = error.name;
    if (record.page && !record.page.isClosed()) {
      record.未處理拒絕 = await record.page.evaluate(() => window.複製未處理拒絕).catch(() => []);
    }
  } finally {
    await record.context?.close().catch(error => {record.通過=false; record.關閉例外=error.message;});
    delete record.context;
    delete record.page;
    writeReport();
  }
}
async function snapshot(page,rootId) {
  return page.locator(`#${rootId} .model-value-copy-button`).evaluateAll(nodes => nodes.map(b => {
    const e=document.getElementById(b.dataset.copyValue),s=b.parentElement.querySelector('.model-value-copy-status');
    const box=b.getBoundingClientRect(),parent=b.parentElement.getBoundingClientRect();
    return {id:e.id,值:e.textContent.trim(),名稱:b.getAttribute('aria-label'),停用:b.disabled,
      忙碌:b.getAttribute('aria-busy'),描述:b.getAttribute('aria-describedby'),回饋:s.textContent,
      按鈕數:document.querySelectorAll(`[data-copy-value="${e.id}"]`).length,
      容器數:(() => {let n=0;for(let p=e.parentElement;p;p=p.parentElement)if(p.classList.contains('model-value-copy'))n++;return n;})(),
      幾何:{左:box.left,右:box.right,寬:box.width,高:box.height,容器左:parent.left,容器右:parent.right,視窗:innerWidth}};
  }));
}
function checkGeometry(rows) {
  assert.ok(rows.length > 0,'模型必須有複製按鈕');
  for (const r of rows) {
    const g=r.幾何;
    assert.equal(r.按鈕數,1,`${r.id} 按鈕唯一`);
    assert.equal(r.容器數,1,`${r.id} 不重複包裝`);
    assert.ok(g.寬 >= 44 && g.高 >= 44,`${r.id} 觸控區至少 44px`);
    assert.ok(g.左 >= -.5 && g.右 <= g.視窗+.5 && g.左 >= g.容器左-.5 && g.右 <= g.容器右+.5,`${r.id} 不超出容器與畫面`);
  }
}
function checkAvailable(rows,lang,{busy=false}={}) {
  checkGeometry(rows);
  for (const r of rows) {
    assert.notEqual(r.值,'—',`${r.id} 應有有效值`);
    assert.equal(r.停用,busy,`${r.id} 停用狀態由可用性及待完成狀態決定`);
    assert.equal(r.忙碌,String(busy));
    assert.equal(r.描述,null,`${r.id} 恢復後移除無效描述`);
    assert.equal(r.名稱,`${lang === 'zh' ? busy ? '正在複製' : '複製數值' : busy ? 'Copying' : 'Copy value'}: ${r.值}`,`${r.id} 名稱包含目前值及語言`);
  }
}
const values = rows => rows.map(r => ({id:r.id,值:r.值}));
async function waitIdle(page,ids) {
  await page.waitForFunction(keys => keys.every(id => document.querySelector(`[data-copy-value="${id}"]`)?.getAttribute('aria-busy') === 'false'),ids);
}
async function settle(page,indices,success=true) {
  await page.evaluate(({indices,success}) => {
    for (const index of indices) {
      const request=window.複製請求[index];
      if (!request) throw new Error(`找不到受控請求 ${index}`);
      success ? request.resolve() : request.reject(new Error('模擬剪貼簿拒絕'));
    }
  },{indices,success});
}
async function controlledStart(page,ids) {
  const before = await requestCount(page);
  const expected = await Promise.all(ids.map(id => currentValue(page,id)));
  // 合成事件亦受正式事件處理器的可用性檢查約束。
  await page.evaluate(keys => keys.forEach(id => document.querySelector(`[data-copy-value="${id}"]`).click()),ids);
  assert.equal(await requestCount(page),before+ids.length,'每個有效輸出只送出一次請求');
  const indices=ids.map((_,i) => before+i);
  assert.deepEqual(await page.evaluate(keys => keys.map(i => window.複製請求[i].value),indices),expected,'送出的數值與目前畫面一致');
  return indices;
}
async function nativeCopy(page,target,lang,action,record) {
  const before = await currentValue(page,target.id);
  if (action === '數值點擊') await metric(page,target.id).click();
  else await button(page,target.id).press(action);
  await waitIdle(page,[target.id]);
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  assert.equal(copied,before,'原生剪貼簿內容等於觸發當下數值');
  nativeCopies++;
  assert.equal(await currentValue(page,target.id),before,'複製回饋不得改寫模型數值');
  assert.equal(await status(page,target.id).innerText(),`${lang === 'zh' ? '已複製' : 'Copied'}: ${before}`);
  record.觀測.push({操作:action,語言:lang,數值:before,原生剪貼簿:copied});
}
async function setEcc(page,n) {
  await page.locator('#puf-ecc-slider').evaluate((e,value) => {e.value=String(value);e.dispatchEvent(new Event('input',{bubbles:true}));},n);
}
async function checkInvalid(page,lang,record,label) {
  const rows=await snapshot(page,pufTarget.root);
  assert.equal(rows.length,4,'PUF 四個輸出均有複製控制');
  checkGeometry(rows);
  for (const r of rows) {
    assert.equal(r.值,'—');
    assert.equal(r.停用,true,`${r.id} 無效時停用`);
    assert.equal(r.描述,'puf-verdict-summary');
    assert.equal(r.名稱,lang === 'zh' ? '無法複製：目前沒有有效數值' : 'Copy unavailable: no valid value');
    assert.equal(r.回饋,'','無效狀態清除舊成功、失敗及忙碌回饋');
  }
  const summary=await page.locator('#puf-verdict-summary').innerText();
  assert.match(summary,lang === 'zh' ? /此示意近似要求資訊長度/ : /The illustrative information length/);
  record.觀測.push({情境:label,語言:lang,描述內容:summary,輸出:rows});
  return rows;
}
async function invalidAttempts(page) {
  const before=await requestCount(page);
  await page.evaluate(keys => keys.forEach(id => document.querySelector(`[data-copy-value="${id}"]`).dispatchEvent(new MouseEvent('click',{bubbles:true}))),pufIds);
  for (const id of pufIds) await metric(page,id).click();
  assert.equal(await requestCount(page),before,'無效時合成按鈕點擊及原數值點擊都不得新增寫入');
}
async function copyPufAndFinish(page,lang,success=true) {
  const before=await snapshot(page,pufTarget.root),indices=await controlledStart(page,pufIds);
  await settle(page,indices,success);
  await waitIdle(page,pufIds);
  const after=await snapshot(page,pufTarget.root);
  checkAvailable(after,lang);
  assert.deepEqual(values(after),values(before),'四個模型輸出均不受複製回饋改寫');
  for (const r of after) assert.ok(success ? r.回饋 === `${lang === 'zh' ? '已複製' : 'Copied'}: ${r.值}` : (lang === 'zh' ? /無法複製/ : /Unable to copy/).test(r.回饋),'完成回饋符合目前語言');
}

try {
  if (process.env.NVM_QA_BASE) {
    const url=new URL(process.env.NVM_QA_BASE);
    assert.ok(['http:','https:'].includes(url.protocol) && url.pathname.endsWith('/') && !url.search && !url.hash,'NVM_QA_BASE 必須是以 / 結尾的 HTTP(S) 基底網址');
    base=url.href;
  } else {server=await startTestServer(root);base=server.base;}
  browser=await chromium.launch({headless:true,timeout:7000,...(process.env.NVM_QA_BROWSER === 'chromium' ? {} : {channel:'msedge'})});
  if (selected('normal')) for (const target of normalTargets) {
    await runCase(`${target.name} 原生複製`,target,'zh',390,'native',async (page,record) => {
      const initial=await snapshot(page,target.root);
      checkAvailable(initial,'zh');
      record.觀測.push({情境:'初始',輸出:initial});
      await nativeCopy(page,target,'zh','Enter',record);
      const updates=await page.locator(`#${target.root} input[type="range"]`).evaluateAll(sliders => sliders.map(e => {
        const before=e.value,min=Number(e.min),max=Number(e.max),step=Number(e.step)||1;
        e.value=String(e.id === 'puf-ecc-slider' ? 10 : min+Math.floor((max-min)*.7/step)*step);
        e.dispatchEvent(new Event('input',{bubbles:true}));
        return {id:e.id,原輸入:before,新輸入:e.value};
      }));
      assert.ok(updates.some(r => r.原輸入 !== r.新輸入),'至少一個參數確實更新');
      const updated=await snapshot(page,target.root);
      checkAvailable(updated,'zh');
      // CiM 能量與 PQC 飽和值可能不變；驗證目前值契約，不捏造變化要求。
      record.觀測.push({情境:'參數更新',輸入:updates,輸出:updated});
      await nativeCopy(page,target,'zh','Space',record);
      await page.locator('#languageToggle').click();
      const english=await snapshot(page,target.root);
      checkAvailable(english,'en');
      record.觀測.push({情境:'切換英文',輸出:english});
      await nativeCopy(page,target,'en','數值點擊',record);
    });
  }
  if (selected('puf')) for (const [initialLang,width] of [['zh',390],['en',1440]]) {
    await runCase(`PUF 邊界與競態 ${initialLang} ${width}`,pufTarget,initialLang,width,'controlled',async (page,record) => {
      let lang=initialLang;
      await setEcc(page,18);
      const valid=await snapshot(page,pufTarget.root);
      assert.equal(valid.length,4);
      checkAvailable(valid,lang);
      record.觀測.push({情境:'ECC 18 有效',輸出:valid});
      await copyPufAndFinish(page,lang);
      for (const ecc of [19,20,21,22]) {
        await setEcc(page,ecc);
        await checkInvalid(page,lang,record,`ECC ${ecc}`);
        await invalidAttempts(page);
      }
      await page.locator('#languageToggle').click();
      lang=lang === 'zh' ? 'en' : 'zh';
      await checkInvalid(page,lang,record,'無效時切換語言');
      await invalidAttempts(page);
      const invalidImage=`PUF無效-${initialLang}-${width}.png`;
      await page.locator(`#${pufTarget.root}`).screenshot({path:path.join(output,invalidImage),timeout:7000});
      record.無效截圖=invalidImage;
      await setEcc(page,18);
      checkAvailable(await snapshot(page,pufTarget.root),lang);
      await copyPufAndFinish(page,lang,false);
      await setEcc(page,19);
      await checkInvalid(page,lang,record,'無效時清除舊失敗回饋');
      await setEcc(page,18);
      const pending=await controlledStart(page,pufIds);
      checkAvailable(await snapshot(page,pufTarget.root),lang,{busy:true});
      await setEcc(page,22);
      await checkInvalid(page,lang,record,'待完成時失效');
      await invalidAttempts(page);
      await settle(page,pending);
      await waitIdle(page,pufIds);
      await checkInvalid(page,lang,record,'舊請求完成後仍無效');
      await setEcc(page,18);
      await copyPufAndFinish(page,lang);
      const restored=await snapshot(page,pufTarget.root);
      record.觀測.push({情境:'無效恢復後可重新複製',輸出:restored});
      const restoredImage=`PUF恢復-${initialLang}-${width}.png`;
      await page.locator(`#${pufTarget.root}`).screenshot({path:path.join(output,restoredImage),timeout:7000});
      record.恢復截圖=restoredImage;
      const stale=await controlledStart(page,pufIds);
      await setEcc(page,22);
      await setEcc(page,18);
      checkAvailable(await snapshot(page,pufTarget.root),lang,{busy:true});
      await settle(page,stale);
      await waitIdle(page,pufIds);
      const completed=await snapshot(page,pufTarget.root);
      checkAvailable(completed,lang);
      assert.ok(completed.every(r => r.回饋 === ''),'待完成→無效→有效後舊成功不得出現');
      assert.deepEqual(values(completed),values(restored),'競態不改寫模型四個輸出');
      record.觀測.push({情境:'待完成期間失效又恢復，舊請求完成',輸出:completed});
      await copyPufAndFinish(page,lang);
      record.受控寫入請求數=await requestCount(page);
    });
  }
  if (selected('legacy')) for (const mode of ['reject','missing','timeout']) {
    const name={reject:'預設 API 相容與拒絕',missing:'剪貼簿介面缺少',timeout:'八秒逾時及晚到結果'}[mode];
    await runCase(`BSPDN ${name}`,legacyTarget,'zh',1440,mode === 'missing' ? 'missing' : 'controlled',async (page,record) => {
      const id=legacyTarget.id;
      checkAvailable(await snapshot(page,legacyTarget.root),'zh');
      if (mode === 'reject') {
        const first=await controlledStart(page,[id]);
        await settle(page,first);
        await waitIdle(page,[id]);
        assert.match(await status(page,id).innerText(),/已複製/,'未傳 options 的舊呼叫端保持可用');
      }
      const before=await currentValue(page,id);
      const index=mode === 'missing' ? null : await requestCount(page);
      await metric(page,id).click();
      if (mode === 'reject') await settle(page,[index],false);
      if (mode === 'timeout') {
        assert.equal(await button(page,id).isDisabled(),true);
        // 這是唯一超過七秒的明示時間推進：驗證產品既有八秒逾時契約。
        await page.waitForTimeout(8100);
      }
      await waitIdle(page,[id]);
      assert.match(await status(page,id).innerText(),/無法複製/);
      assert.equal(await currentValue(page,id),before,'錯誤回饋保留數值');
      checkAvailable(await snapshot(page,legacyTarget.root),'zh');
      if (mode === 'timeout') {
        await settle(page,[index]);
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve,0)));
        assert.match(await status(page,id).innerText(),/無法複製/,'逾時後晚到結果不得改成成功');
        const fresh=await controlledStart(page,[id]);
        await settle(page,fresh);
        await waitIdle(page,[id]);
        assert.match(await status(page,id).innerText(),/已複製/,'逾時後仍可再次複製');
      }
      record.觀測.push({情境:name,原數值:before,最後數值:await currentValue(page,id),輸出:await snapshot(page,legacyTarget.root)});
    });
  }
} catch (error) {
  results.push({項目:'執行入口',通過:false,錯誤:error.message,錯誤類型:error.name});
} finally {
  await browser?.close().catch(error => results.push({項目:'關閉瀏覽器',通過:false,錯誤:error.message}));
  await server?.close().catch(error => results.push({項目:'關閉伺服器',通過:false,錯誤:error.message}));
  clearTimeout(shutdown);
  clearTimeout(deadline);
  const report=writeReport();
  console.log(`新增模型複製：${report.通過}／${report.案例}；原生讀回 ${report.真實複製數} 次；證據：${resultPath}`);
  if (expired || results.length !== planned || results.some(r => !r.通過)) process.exitCode=1;
}
