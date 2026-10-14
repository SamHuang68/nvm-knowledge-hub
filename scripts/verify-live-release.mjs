import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {chromium} from 'playwright';

const root = path.resolve(import.meta.dirname,'..');
const userAgent = 'NVM-Knowledge-Hub-Verification/1.0 (+https://hub.samhuang68.org/)';
const originalArgs = process.argv.slice(2);
const recoverOutput = originalArgs.includes('--recover-output');
const args = originalArgs.filter(arg=>arg!=='--recover-output');
const assetsOnly = recoverOutput || args.length>0;
const base = process.env.NVM_QA_BASE || 'https://samhuang68.github.io/nvm-knowledge-hub/';
const runId=crypto.randomUUID();
const requestedOutput = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root,'qa','bilingual-release','live-release'));
// 恢復只建立新目錄，不判定 PID 存活、不移除原鎖，也不讀取舊成功作為本次結果。
const output = recoverOutput ? path.join(requestedOutput,`恢復-${runId}`) : requestedOutput;
const reportPath=path.join(output,'live-release-verification.json');
const lockPath=path.join(output,'正式來源驗證.lock');
const temporaryPath=path.join(output,`正式來源驗證-${runId}.tmp`);
const result = {base,checkedAt:new Date().toISOString(),version:null,userAgent,
  scope:assetsOnly?'指定資源':'完整流程',offlineRequested:!assetsOnly,assets:[],offline:[],passed:false,
  runId,pid:process.pid,state:'執行中',finishedAt:null,output,recoveryFrom:recoverOutput?requestedOutput:null};
let browser,ownsLock=false,started=false,finished=false,lockIdentity;
function assertLockOwner() {
  const stat=fs.lstatSync(lockPath);
  const owner=JSON.parse(fs.readFileSync(lockPath,'utf8'));
  assert.ok(ownsLock&&stat.isFile()&&stat.dev===lockIdentity?.dev&&stat.ino===lockIdentity?.ino&&owner.runId===runId&&owner.pid===process.pid,
    '執行鎖已變更；停止寫入與清理，保留現有鎖及報告。');
}
function writeReport() {
  let descriptor;
  try {
    assertLockOwner();
    descriptor=fs.openSync(temporaryPath,'wx',0o600);
    fs.writeFileSync(descriptor,JSON.stringify(result,null,2)+'\n');
    fs.fsyncSync(descriptor);fs.closeSync(descriptor);descriptor=undefined;
    assertLockOwner();fs.renameSync(temporaryPath,reportPath);
  } finally {
    if(descriptor!==undefined)fs.closeSync(descriptor);
    if(fs.existsSync(temporaryPath))fs.unlinkSync(temporaryPath);
  }
}
function reportWriteFailure(error) {
  result.passed=false;process.exitCode=1;
  console.error(`本次結果無法寫入：${reportPath}；執行識別 ${runId}；${error.message}。既有報告不得當成本次完成證據。`);
}
function releaseLock() {
  if(!ownsLock)return;
  try {
    assertLockOwner();fs.unlinkSync(lockPath);
  } catch(error) {console.error(`執行鎖未能清理：${lockPath}；${error.message}。請確認程序與報告識別後處理，勿直接覆寫其他執行。`);}
  ownsLock=false;
}
function interrupted(reason) {
  if(!ownsLock||finished)return;
  result.passed=false;result.state='已中斷';result.error=reason;result.finishedAt=new Date().toISOString();
  if(started){try{writeReport();}catch(error){reportWriteFailure(error);}}
  finished=true;releaseLock();
}
process.once('uncaughtExceptionMonitor',error=>{result.error=`未處理例外：${error.message}`;});
process.once('exit',code=>{interrupted(result.error||`程序提前結束，退出碼 ${code}`);});
for(const [signal,code] of [['SIGINT',130],['SIGTERM',143]])process.once(signal,()=>{
  interrupted(`收到 ${signal}，本次驗證未完成`);process.exit(code);
});
try {
try {fs.mkdirSync(output,{recursive:true});}catch(error){reportWriteFailure(error);throw error;}
let lockDescriptor;
try {
  lockDescriptor=fs.openSync(lockPath,'wx',0o600);ownsLock=true;lockIdentity=fs.fstatSync(lockDescriptor);
} catch(error) {
  if(error.code==='EEXIST')throw new Error(`輸出目錄已有執行鎖：${lockPath}。本次 ${runId} 未啟動，既有報告不是本次結果；可加 --recover-output 並明列 --asset，在獨立目錄重新核對。原鎖與原報告會保留。`);
  reportWriteFailure(error);
  throw error;
}
try {
  fs.writeFileSync(lockDescriptor,JSON.stringify({runId,pid:process.pid,startedAt:result.checkedAt}));
} catch(error){reportWriteFailure(error);throw error;}finally {fs.closeSync(lockDescriptor);}
try {
  assertLockOwner();
  let previousStat;
  try{previousStat=fs.lstatSync(reportPath);}catch(error){if(error.code!=='ENOENT')throw error;}
  if(previousStat) {
    assert.ok(previousStat.isFile(),'既有報告路徑必須是一般檔案，不移動資料夾或符號連結。');
    result.previousReport=`歷史結果-${runId}.json`;
    fs.renameSync(reportPath,path.join(output,result.previousReport));
  }
  writeReport();started=true;
  console.log(`正式來源驗證啟動：${runId}；報告 ${reportPath}`);
} catch(error) {reportWriteFailure(error);throw error;}
assert.ok(args.every(arg=>arg.startsWith('--asset=') && arg.slice(8)), '局部模式只接受非空的 --asset=相對檔案路徑；可重複指定。');
assert.ok(!recoverOutput||(args.length>0&&originalArgs.filter(arg=>arg==='--recover-output').length===1),'恢復模式必須明列至少一個 --asset，且只指定一次 --recover-output；不自動啟動完整流程。');
const baseURL=new URL(base);
assert.ok(['http:','https:'].includes(baseURL.protocol)&&baseURL.pathname.endsWith('/')&&!baseURL.search&&!baseURL.hash&&!baseURL.username&&!baseURL.password,
  '來源必須是以 / 結尾、不含帳密、查詢或片段的 HTTP(S) 基底網址。');
const timeoutMs=Number(process.env.NVM_QA_TIMEOUT_MS??30000);
assert.ok(Number.isInteger(timeoutMs)&&timeoutMs>0&&timeoutMs<=30000,'請求逾時須為 1 至 30000 毫秒的整數。');
result.timeoutMs=timeoutMs;
const scope = {self:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data/offline-manifest.js'),'utf8'),scope);
const manifest = scope.self.NVMOfflineManifest;
result.version=manifest.version;
const files = [...new Set(assetsOnly ? args.map(arg=>arg.slice(8)) : [...manifest.assets,'sw.js','data/offline-manifest.js','data/release-lineage.json'])];
for (const file of files) {
  assert.ok(!/[\\?#:\u0000]/u.test(file) && file.split('/').every(part=>part && part!=='.' && part!=='..'), '資源必須是專案內的相對檔案路徑。');
  const relative = path.relative(fs.realpathSync(root),fs.realpathSync(path.join(root,file)));
  assert.ok(relative && !relative.startsWith('..'+path.sep) && !path.isAbsolute(relative), '資源不可透過連結越出專案。');
  assert.ok(fs.statSync(path.join(root,file)).isFile(), '資源必須是檔案。');
}
const hash = (file,bytes) => crypto.createHash('sha256').update(/\.(?:html|css|js|json|svg|webmanifest)$/.test(file)
  ? bytes.toString('utf8').replace(/^\uFEFF/,'').replaceAll('\r\n','\n') : bytes).digest('hex');
  // 限制同時連線數；每個結果都與本機已提交的產物逐檔比對。
  for (let offset=0;offset<files.length;offset+=6) {
    const batch = await Promise.all(files.slice(offset,offset+6).map(async file => {
      const started=Date.now();
      const initialURL=new URL(file.split('/').map(encodeURIComponent).join('/'),baseURL);
      const entry={file,status:null,expected:hash(file,fs.readFileSync(path.join(root,file))),actual:null,
        classification:null,errorCode:null,cfRay:null,url:initialURL.href,finalURL:null,redirects:[]};
      const signal=AbortSignal.timeout(timeoutMs);
      let url=initialURL;
      try {
      let response;
      for (;;) {
        response=await fetch(url,{headers:{'User-Agent':userAgent},cache:'no-store',signal,redirect:'manual'});
        entry.status=response.status;entry.cfRay=response.headers.get('cf-ray');entry.finalURL=response.url;
        if(![301,302,303,307,308].includes(response.status))break;
        const location=response.headers.get('location');
        await response.body?.cancel();
        if(!location){entry.classification='重新導向缺少位置；未取得正式資源';return entry;}
        const destination=new URL(location,url);
        entry.redirects.push({status:response.status,from:url.href,to:destination.href});
        if(destination.origin!==baseURL.origin||destination.username||destination.password){
          entry.classification='重新導向超出來源；未取得正式資源';return entry;
        }
        if(entry.redirects.length>5){entry.classification='重新導向超過上限；未取得正式資源';return entry;}
        url=destination;
      }
      const live = Buffer.from(await response.arrayBuffer());
      const expected=entry.expected,actual=hash(file,live);
      const clientDenied=response.status===403 && (response.headers.has('cf-ray') || /cloudflare/iu.test(response.headers.get('server')||''))
        && /\berror(?:\s+code)?\s*:?\s*1010\b/iu.test(live.toString('utf8'));
      const classification=clientDenied?'用戶端特徵遭拒；未取得正式資源':response.status!==200?'HTTP 請求失敗；未取得正式資源':expected!==actual?'內容不一致':'一致';
      return Object.assign(entry,{actual,classification,errorCode:clientDenied?1010:null});
      } catch(error) {
        entry.classification=signal.aborted?'請求逾時；未取得完整正式資源':'傳輸失敗；未取得完整正式資源';
        entry.error=error.message;
        return entry;
      } finally {entry.elapsedMs=Date.now()-started;}
    }));
    result.assets.push(...batch);
    console.log(`線上產物比對：${result.assets.length}/${files.length}`);
  }
  assert.ok(result.assets.every(item=>item.classification==='一致'&&item.status===200&&item.expected===item.actual),
    '線上內容必須全部符合本機發布產物：'+result.assets.filter(item=>item.classification!=='一致').map(item=>`${item.file}：${item.classification}（HTTP ${item.status??'未取得'}）`).join('；'));
  if (!assetsOnly) {
  const channel = process.env.NVM_QA_BROWSER || 'msedge';
  browser = await chromium.launch({headless:true,...(channel==='chromium'?{}:{channel})});
  const context = await browser.newContext({serviceWorkers:'allow',viewport:{width:1280,height:900}});
  const page = await context.newPage();
  await page.goto(new URL('index.html?lang=en',base).href,{waitUntil:'domcontentloaded'});
  const deadline = Date.now()+120000;
  let active=false;
  while(Date.now()<deadline) {
    active = await page.evaluate(async()=> (await navigator.serviceWorker.getRegistration())?.active?.state==='activated');
    if(active) break;
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  assert.ok(active,'線上 Service Worker 必須真正啟用');
  if (!await page.evaluate(()=>Boolean(navigator.serviceWorker.controller))) {
    await page.goto('about:blank');
    await page.goto(new URL('index.html?lang=en',base).href,{waitUntil:'domcontentloaded'});
  }
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
  const caches = await page.evaluate(()=>window.caches.keys());
  assert.ok(caches.includes('nvm-knowledge-hub-'+manifest.version),'瀏覽器必須安裝本次發布的離線版本');
  await context.setOffline(true);
  for (const scenario of [
    {query:'en',stored:'zh',expected:'en'},
    {query:'zh',stored:'en',expected:'zh'},
    {query:null,stored:'zh',expected:'zh'},
  ]) {
    await page.evaluate(value=>localStorage.setItem('nvm-hub-language',value),scenario.stored);
    const destination = new URL('未快取語系驗收.html',base);
    if(scenario.query) destination.searchParams.set('lang',scenario.query);
    const response = await page.goto(destination.href,{waitUntil:'domcontentloaded'});
    const actual = await page.evaluate(()=>({language:document.documentElement.lang,title:document.title,
      text:document.querySelector('main').innerText,home:document.querySelector('main a').href}));
    assert.equal(response.status(),503);
    assert.equal(actual.language,scenario.expected==='zh'?'zh-Hant':'en');
    assert.equal(new URL(actual.home).searchParams.get('lang'),scenario.expected);
    assert.ok(scenario.expected==='zh'?actual.text.includes('尚未下載'):!/[\u3400-\u9fff]/u.test(actual.text));
    result.offline.push({scenario,status:response.status(),...actual,passed:true});
    await page.screenshot({path:path.join(output,`offline-${scenario.query||'saved'}.png`)});
    await page.locator('main a').click();
    await page.locator('#searchTrigger').waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'),scenario.expected==='zh'?'zh-Hant':'en');
  }
  await context.close();
  }
  result.passed=true;
} catch(error) {
  result.passed=false;
  result.error=error.message;
  console.error(error.stack);
  process.exitCode=1;
} finally {
  if(browser) {
    try {await browser.close();}
    catch(error){result.passed=false;result.error=`瀏覽器清理失敗：${error.message}`;process.exitCode=1;}
  }
  if(started) {
    result.state=result.passed?'通過':'失敗';result.finishedAt=new Date().toISOString();
    try {writeReport();}
    catch(error){reportWriteFailure(error);result.state='報告寫入失敗';result.error=error.message;try{writeReport();}catch{ /* 保留啟動時的未完成紀錄。 */ }}
  }
  finished=true;releaseLock();
}
console.log(`${assetsOnly?'指定來源核對':'線上發布驗證'}：${result.passed?'通過':'失敗'}；${result.assets.length} 個產物、${result.offline.length} 個真實離線語言情境。`);
