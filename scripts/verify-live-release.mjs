import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {chromium} from 'playwright';

const root = path.resolve(import.meta.dirname,'..');
const userAgent = 'NVM-Knowledge-Hub-Verification/1.0 (+https://hub.samhuang68.org/)';
const args = process.argv.slice(2);
assert.ok(args.every(arg=>arg.startsWith('--asset=') && arg.slice(8)), '局部模式只接受非空的 --asset=相對檔案路徑；可重複指定。');
const assetsOnly = args.length>0;
const base = process.env.NVM_QA_BASE || 'https://samhuang68.github.io/nvm-knowledge-hub/';
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root,'qa','bilingual-release','live-release'));
fs.mkdirSync(output,{recursive:true});
const scope = {self:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data/offline-manifest.js'),'utf8'),scope);
const manifest = scope.self.NVMOfflineManifest;
const files = [...new Set(assetsOnly ? args.map(arg=>arg.slice(8)) : [...manifest.assets,'sw.js','data/offline-manifest.js','data/release-lineage.json'])];
for (const file of files) {
  assert.ok(!/[\\?#:\u0000]/u.test(file) && file.split('/').every(part=>part && part!=='.' && part!=='..'), '資源必須是專案內的相對檔案路徑。');
  const relative = path.relative(fs.realpathSync(root),fs.realpathSync(path.join(root,file)));
  assert.ok(relative && !relative.startsWith('..'+path.sep) && !path.isAbsolute(relative), '資源不可透過連結越出專案。');
  assert.ok(fs.statSync(path.join(root,file)).isFile(), '資源必須是檔案。');
}
const hash = (file,bytes) => crypto.createHash('sha256').update(/\.(?:html|css|js|json|svg|webmanifest)$/.test(file)
  ? bytes.toString('utf8').replace(/^\uFEFF/,'').replaceAll('\r\n','\n') : bytes).digest('hex');
const result = {base,checkedAt:new Date().toISOString(),version:manifest.version,userAgent,
  scope:assetsOnly?'指定資源':'完整流程',offlineRequested:!assetsOnly,assets:[],offline:[]};
let browser;
try {
  // 限制同時連線數；每個結果都與本機已提交的產物逐檔比對。
  for (let offset=0;offset<files.length;offset+=6) {
    const batch = await Promise.all(files.slice(offset,offset+6).map(async file => {
      const response = await fetch(new URL(file.split('/').map(encodeURIComponent).join('/'),base),{
        headers:{'User-Agent':userAgent},cache:'no-store',signal:AbortSignal.timeout(30000)});
      const live = Buffer.from(await response.arrayBuffer());
      const local = fs.readFileSync(path.join(root,file));
      const expected=hash(file,local),actual=hash(file,live);
      const clientDenied=response.status===403 && (response.headers.has('cf-ray') || /cloudflare/iu.test(response.headers.get('server')||''))
        && /\berror(?:\s+code)?\s*:?\s*1010\b/iu.test(live.toString('utf8'));
      const classification=clientDenied?'用戶端特徵遭拒；未取得正式資源':response.status!==200?'HTTP 請求失敗；未取得正式資源':expected!==actual?'內容不一致':'一致';
      return {file,status:response.status,expected,actual,classification,
        errorCode:clientDenied?1010:null,cfRay:response.headers.get('cf-ray')};
    }));
    result.assets.push(...batch);
    console.log(`線上產物比對：${result.assets.length}/${files.length}`);
  }
  assert.ok(result.assets.every(item=>item.status===200&&item.expected===item.actual),
    '線上內容必須全部符合本機發布產物：'+result.assets.filter(item=>item.status!==200||item.expected!==item.actual).map(item=>`${item.file}：${item.classification}（HTTP ${item.status}）`).join('；'));
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
  if(browser) await browser.close();
  fs.writeFileSync(path.join(output,'live-release-verification.json'),JSON.stringify(result,null,2)+'\n');
}
console.log(`${assetsOnly?'指定來源核對':'線上發布驗證'}：${result.passed?'通過':'失敗'}；${result.assets.length} 個產物、${result.offline.length} 個真實離線語言情境。`);
