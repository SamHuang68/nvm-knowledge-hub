import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import vm from 'node:vm';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa', '離線快取'));
fs.mkdirSync(output, { recursive: true });
const manifestScope = { self: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/offline-manifest.js'), 'utf8'), manifestScope);
const sourceManifest = JSON.parse(JSON.stringify(manifestScope.self.NVMOfflineManifest));
const canonical = (file, bytes) => /\.(?:html|css|js|json|svg|webmanifest)$/.test(file)
  ? Buffer.from(bytes.toString('utf8').replace(/^\uFEFF/,'').replaceAll('\r\n', '\n')) : bytes;
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const snapshot = new Map(sourceManifest.assets.map(file => [file, fs.readFileSync(path.join(root, file))]));
for (const [file, bytes] of snapshot) {
  assert.equal(digest(canonical(file, bytes)), sourceManifest.digests[file], `執行前清單必須同步：${file}`);
}
const worker = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
function fixture(label) {
  const files = new Map(snapshot);
  files.set('index.html', Buffer.from(files.get('index.html').toString().replace('</head>', `<meta name="離線測試版本" content="${label}"></head>`)));
  files.set('site-language.js', Buffer.from(files.get('site-language.js').toString()+`\nwindow.__offlineFixtureVersion = ${JSON.stringify(label)};\n`));
  const manifest = structuredClone(sourceManifest);
  for (const file of ['index.html', 'site-language.js']) manifest.digests[file] = digest(canonical(file, files.get(file)));
  manifest.version = digest(Buffer.from(JSON.stringify(manifest.digests))).slice(0,20);
  files.set('data/offline-manifest.js', Buffer.from('self.NVMOfflineManifest = '+JSON.stringify(manifest)+';\n'));
  files.set('sw.js', Buffer.from(worker+`\n/* ${label}：測試伺服器模擬版本更新。 */\n`));
  return { label, files, manifest };
}
const first = fixture('第一版');
const second = fixture('第二版');
const broken = fixture('不完整第三版');
broken.files.set('site-language.js', second.files.get('site-language.js'));
let current = first;
const scope = '/nvm-knowledge-hub/';
const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.webmanifest':'application/manifest+json' };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  if (pathname === '/隔離種子.html') {
    response.writeHead(200, { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store' });
    response.end('<!doctype html><html lang="zh-Hant"><title>離線驗證隔離種子</title><p>隔離的快取測試頁。</p></html>');
    return;
  }
  let file = pathname.startsWith(scope) ? pathname.slice(scope.length) : '';
  if (!file || file.endsWith('/')) file += 'index.html';
  const bytes = pathname.startsWith(scope) ? current.files.get(file) : undefined;
  response.writeHead(bytes ? 200 : 404, { 'Content-Type':`${mime[path.extname(file)] || 'text/plain'}; charset=utf-8`, 'Cache-Control':'no-store' });
  response.end(bytes || '測試伺服器未提供此附件');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const base = origin+scope;
const channel = process.env.NVM_QA_BROWSER || 'msedge';
let browser, context, page;
const results = [];
const check = (condition, name, detail = {}) => {
  assert.ok(condition, name);
  results.push({ name, passed:true, ...detail });
  console.log(`通過：${name}`);
};
const cacheName = version => 'nvm-knowledge-hub-'+version;
async function waitUntil(condition, message, timeout = 45000) {
  // 安裝狀態需等待 Promise 的實際值，避免非同步 predicate 被當成 truthy 而提前完成。
  const deadline = Date.now()+timeout;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise(resolve => setTimeout(resolve,100));
  }
  throw new Error(message);
}
async function controlledPage() {
  const next = await context.newPage();
  next.setDefaultTimeout(30000);
  await next.goto(base+'index.html', { waitUntil:'domcontentloaded' });
  await waitUntil(() => next.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated'), '首次安裝未於期限內啟用');
  if (!await next.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    await next.goto(origin+'/隔離種子.html');
    await next.goto(base+'index.html', { waitUntil:'domcontentloaded' });
  }
  try { await next.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, {timeout:10000}); }
  catch (error) {
    const state = await next.evaluate(async () => ({ url:location.href, controller:navigator.serviceWorker.controller?.scriptURL, registrations:(await navigator.serviceWorker.getRegistrations()).map(registration => ({scope:registration.scope, active:registration.active?.state, script:registration.active?.scriptURL})),cacheKeys:await caches.keys() }));
    state.workers = await Promise.all(context.serviceWorkers().map(worker => worker.evaluate(async () => ({href:self.location.href,clients:(await self.clients.matchAll({includeUncontrolled:true})).map(client => ({url:client.url,type:client.type}))}))));
    throw new Error(`控制器尚未接管：${JSON.stringify(state)}；${error.message}`);
  }
  return next;
}
async function requestUpdate() {
  return page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const outcome = new Promise(resolve => {
      registration.addEventListener('updatefound', () => {
        const candidate = registration.installing;
        candidate.addEventListener('statechange', () => {
          if (candidate.state === 'installed' || candidate.state === 'redundant') resolve(candidate.state);
        });
      }, { once:true });
    });
    await registration.update();
    return outcome;
  });
}
try {
  browser = await chromium.launch({ headless:true, ...(channel === 'chromium' ? {} : { channel }) });
  context = await browser.newContext({ serviceWorkers:'allow', viewport:{ width:1280,height:900 } });
  page = await context.newPage();
  await page.goto(origin+'/隔離種子.html');
  await page.evaluate(async () => {
    for (const name of ['其他專案離線資料', 'nvm-hub-未確認舊版', 'nvm-knowledge-hub-舊版測試', 'nvm-hub-r4-20260917']) {
      await (await caches.open(name)).put('/快取保留證據', new Response('保留內容'));
    }
  });
  // 保留 scope 外的種子頁；升版時仍會關閉全部受本站 SW 控制的分頁。
  page = await controlledPage();
  const keys = await page.evaluate(() => caches.keys());
  check(keys.includes('其他專案離線資料') && keys.includes('nvm-hub-未確認舊版'), '啟用保留同來源其他專案與未確認舊快取');
  check(await page.evaluate(async () => (await (await caches.open('其他專案離線資料')).match('/快取保留證據')).text()) === '保留內容', '其他專案的快取內容保持完整');
  check(!keys.includes('nvm-knowledge-hub-舊版測試') && !keys.includes('nvm-hub-r4-20260917'), '只清理本站前綴與明確列出的歷史快取');
  const installed = await page.evaluate(async name => {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    let bytes = 0;
    for (const request of requests) bytes += (await (await cache.match(request)).arrayBuffer()).byteLength;
    return { count:requests.length, bytes };
  }, cacheName(first.manifest.version));
  check(installed.count === first.manifest.assets.length, '首次安裝完整取得所有必要資源', installed);

  await context.setOffline(true);
  const offlineHome = await page.reload({ waitUntil:'domcontentloaded' });
  check(offlineHome.status() === 200, '首次安裝後離線重新載入首頁');
  await page.locator('#searchTrigger').click();
  await page.locator('#nvmHubSearchInput').fill('P01');
  await page.locator('#searchResults a[href$="#evidence-P01"]').waitFor();
  check(await page.locator('#searchResults a[href$="#evidence-P01"]').count() === 1, '離線全站搜尋可取得證據總帳');
  await page.locator('#searchResults a[href$="#evidence-P01"]').click();
  await page.waitForFunction(() => document.activeElement?.id === 'evidence-P01');
  check(await page.locator('#evidence-P01').isVisible(), '離線總帳導覽與焦點可用');
  const whitepaperResponse = await page.goto(base+'whitepaper/?view=selector', { waitUntil:'domcontentloaded' });
  await page.locator('#decision-body tr').first().waitFor();
  check(whitepaperResponse.status() === 200 && await page.locator('#decision-body tr').count() === 12, '離線白皮書目錄入口與同版建置產物可用');
  await page.goto(base+'ai-nvm-opportunities.html', { waitUntil:'domcontentloaded' });
  await page.waitForFunction(() => document.body.dataset.knowledgeState === 'canonical');
  check(await page.locator('.opportunity-record:visible').count() > 0, '離線正式 AI 資料可完成驗證');
  await page.goto(base+'NVM技術全景.html?lang=en#ip-kilopass-xpm', { waitUntil:'domcontentloaded' });
  const zoom = page.locator('#ip-kilopass-xpm [data-engineering-zoom]').first();
  await zoom.click();
  await page.locator('.nvm-engineering-dialog[open] svg').waitFor();
  check(await page.locator('.nvm-engineering-dialog[open] svg').count() > 0, '離線全景可載入同版圖解並放大');
  await page.keyboard.press('Escape');
  for (const scenario of [
    { query:'en', saved:'zh', expected:'en' },
    { query:'zh', saved:'en', expected:'zh' },
    { query:null, saved:'en', expected:'en' },
    { query:null, saved:'zh', expected:'zh' },
    { query:'invalid', saved:'zh', expected:'zh' },
  ]) {
    await page.evaluate(saved => localStorage.setItem('nvm-hub-language',saved),scenario.saved);
    const query = scenario.query === null ? '' : '?lang='+scenario.query;
    const missing = await page.goto(base+'未下載附件.html'+query,{waitUntil:'domcontentloaded'});
    const actual = await page.evaluate(() => ({
      language:document.documentElement.lang,title:document.title,text:document.querySelector('main').innerText,
      home:document.querySelector('main a').href,
    }));
    const expectedLanguage = scenario.expected === 'zh' ? 'zh-Hant' : 'en';
    check(missing.status() === 503 && actual.language === expectedLanguage
      && (scenario.expected === 'zh' ? actual.text.includes('尚未下載') : !/[\u3400-\u9fff]/u.test(actual.text)),
    '離線例外依明確 query 或儲存偏好選擇語言',{scenario,...actual});
    check(new URL(actual.home).searchParams.get('lang') === scenario.expected,'離線返回連結保留目前語言',{scenario});
    if (scenario.query === scenario.expected) await page.screenshot({path:path.join(output,`離線錯誤-${scenario.expected}.png`)});
    await page.locator('main a').click();
    await page.locator('#searchTrigger').waitFor();
    check(new URL(page.url()).pathname.endsWith('/index.html') && await page.locator('html').getAttribute('lang') === expectedLanguage,
      '離線錯誤頁返回同語言的已快取首頁',{scenario});
  }
  await context.setOffline(false);

  current = second;
  check(await requestUpdate() === 'installed', '新版資源完整安裝並進入等待');
  await page.reload({ waitUntil:'domcontentloaded' });
  check(await page.evaluate(() => window.__offlineFixtureVersion) === '第一版' && await page.locator('meta[name="離線測試版本"]').getAttribute('content') === '第一版', '舊分頁重新載入仍保持 HTML 與腳本同版');
  check(await page.evaluate(async () => Boolean((await navigator.serviceWorker.ready).waiting)), '不以強制接管切換使用中的控制器');
  await page.close();
  page = await context.newPage();
  await page.goto(origin+'/隔離種子.html');
  await waitUntil(() => page.evaluate(async base => {
    const registration = await navigator.serviceWorker.getRegistration(base);
    return registration?.active?.state === 'activated' && !registration.waiting;
  }, base), '關閉舊分頁後新版未於期限內啟用');
  await page.goto(base+'index.html', {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => window.__offlineFixtureVersion === '第二版');
  check(await page.locator('meta[name="離線測試版本"]').getAttribute('content') === '第二版', '關閉舊分頁後新版 HTML 與腳本一併啟用');
  const upgradedKeys = await page.evaluate(() => caches.keys());
  check(upgradedKeys.includes(cacheName(second.manifest.version)) && !upgradedKeys.includes(cacheName(first.manifest.version)) && upgradedKeys.includes('其他專案離線資料'), '升版只移除本站舊版快取');

  current = broken;
  check(await requestUpdate() === 'redundant', '部署中途任一資源雜湊不符即拒絕安裝');
  const failedKeys = await page.evaluate(() => caches.keys());
  check(!failedKeys.includes(cacheName(broken.manifest.version)) && failedKeys.includes(cacheName(second.manifest.version)), '失敗的新快取移除且保留可用舊版本');
  await context.setOffline(true);
  await page.reload({ waitUntil:'domcontentloaded' });
  check(await page.evaluate(() => window.__offlineFixtureVersion) === '第二版', '升版失敗後仍可離線使用已驗證版本');
  await page.screenshot({ path:path.join(output,'離線首頁.png'),fullPage:false });
} catch (error) {
  results.push({ name:'離線驗證中斷',passed:false,error:error.message,stack:error.stack });
  console.error(error.stack);
  if (page && !page.isClosed()) await page.screenshot({path:path.join(output,'失敗畫面.png'),fullPage:false}).catch(() => {});
  process.exitCode = 1;
} finally {
  if (context) await context.close();
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  fs.writeFileSync(path.join(output,'驗證結果.json'), JSON.stringify({ sourceVersion:sourceManifest.version,assetCount:sourceManifest.assets.length,canonicalBytes:sourceManifest.totalBytes,results },null,2));
}
console.log(`離線快取驗證：${results.filter(result => result.passed).length}/${results.length} 通過`);
