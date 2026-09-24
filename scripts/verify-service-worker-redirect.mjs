import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const workerSource = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const digest = body => crypto.createHash('sha256').update(body).digest('hex');
const pages = {
  'index.html': '<!doctype html><meta charset="utf-8"><title>Home</title><p id="marker">home-ok</p><script>navigator.serviceWorker.register("./sw.js")</script></body>',
  'memory-physics.html': '<!doctype html><meta charset="utf-8"><title>MP</title><h1 id="marker">memory-physics-ok</h1><a id="returnHome" href="index.html">Return to Knowledge Hub</a><a id="returnSibling" href="secure-storage.html">Return to Secure Storage</a></body>',
  'secure-storage.html': '<!doctype html><meta charset="utf-8"><title>SS</title><h1 id="marker">secure-storage-ok</h1><a id="returnHome" href="index.html">知識中心</a></body>',
  'iot-mcu-envm.html': '<!doctype html><meta charset="utf-8"><title>IoT</title><h1 id="marker">iot-ok</h1><a id="returnHome" href="index.html">返回知識中心</a></body>',
  'briefing/index.html': '<!doctype html><meta charset="utf-8"><title>Briefing</title><h1 id="marker">briefing-ok</h1><script src="probe.js"></script></body>',
  'briefing/probe.js': 'document.documentElement.dataset.probe = "ready";\n',
  'notes.html': '<!doctype html><meta charset="utf-8"><title>Notes</title><h1 id="marker">notes-ok</h1></body>',
  'boot.html': '<!doctype html><meta charset="utf-8"><title>Boot</title><p id="marker">boot-ok</p></body>',
};
const version = 'sw-redirect-fixture';
const assets = ['index.html', 'memory-physics.html', 'secure-storage.html', 'iot-mcu-envm.html', 'briefing/index.html', 'briefing/probe.js'];
const manifest = `self.NVMOfflineManifest = ${JSON.stringify({
  version,
  assets,
  digests: Object.fromEntries(assets.map(file => [file, digest(pages[file])])),
  totalBytes: assets.reduce((sum, file) => sum + Buffer.byteLength(pages[file]), 0),
})};\n`;
const files = new Map(Object.entries({ ...pages, 'sw.js': workerSource, 'data/offline-manifest.js': manifest }));
const tamperMark = '<!--TAMPER-->';
const beaconTag = '<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js/vfixture" integrity="sha512-fixture" data-cf-beacon=\'{"version":"2024.11.0","token":"fixture","r":1}\' crossorigin="anonymous"></script>\n';
let pretty = false;
let tamper = false;
let beacon = false;
let foreignOrigin = '';

function redirectTarget(pathname, search) {
  if (!pretty) return null;
  if (pathname === '/leave.html') return foreignOrigin + '/' + search;
  if (pathname.endsWith('/index.html')) return (pathname.slice(0, -'index.html'.length) || '/') + search;
  if (pathname.endsWith('.html')) return pathname.slice(0, -'.html'.length) + search;
  const relative = pathname.replace(/^\//, '');
  if (relative && !relative.includes('.') && files.has(relative + '/index.html')) return pathname + '/' + search;
  return null;
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const pathname = decodeURIComponent(url.pathname);
  const target = redirectTarget(pathname, url.search);
  if (target) {
    response.writeHead(308, { Location: target, 'Cache-Control': 'no-store' });
    response.end();
    return;
  }
  let relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
  if (relative.endsWith('/')) relative += 'index.html';
  if (!files.has(relative) && files.has(relative + '.html')) relative += '.html';
  const body = files.get(relative);
  if (!body) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end('missing');
    return;
  }
  let payload = tamper && relative === 'memory-physics.html' ? body + tamperMark : body;
  if (beacon && relative.endsWith('.html') && payload.includes('</body>')) payload = payload.replace('</body>', beaconTag + '</body>');
  const type = relative.endsWith('.js') ? 'text/javascript' : 'text/html';
  response.writeHead(200, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store' });
  response.end(payload);
});
const foreign = http.createServer((_request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  });
  response.end('<!doctype html><h1 id="marker">foreign-ok</h1>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
await new Promise(resolve => foreign.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
foreignOrigin = `http://127.0.0.1:${foreign.address().port}`;
const channel = process.env.NVM_QA_BROWSER || 'msedge';
const cacheName = 'nvm-knowledge-hub-' + version;
let browser;
const warnings = [];
const check = (condition, name, detail = {}) => {
  assert.ok(condition, `${name} ${JSON.stringify(detail)}`);
  console.log(`通過：${name}`);
};

async function waitUntil(predicate, message, timeout = 15000) {
  const deadline = Date.now() + timeout;
  let last = null;
  while (Date.now() < deadline) {
    last = await predicate();
    if (last) return last;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`${message}：${JSON.stringify(last)}`);
}

async function openControlled(context) {
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.on('console', message => {
    const text = message.text();
    if (/redirect mode is not/i.test(text) || /ERR_FAILED/.test(text)) warnings.push(text);
  });
  await page.goto(origin + '/index.html', { waitUntil: 'domcontentloaded' });
  await waitUntil(async () => {
    const state = await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.state || null);
    return state === 'activated';
  }, 'service worker 未啟用');
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    await page.reload({ waitUntil: 'domcontentloaded' });
  }
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  return page;
}

try {
  browser = await chromium.launch({ headless: true, ...(channel === 'chromium' ? {} : { channel }) });

  pretty = false;
  tamper = false;
  {
    const context = await browser.newContext({ serviceWorkers: 'allow' });
    const page = await openControlled(context);
    const response = await page.goto(origin + '/memory-physics.html', { waitUntil: 'domcontentloaded' });
    check(response.status() === 200 && page.url().endsWith('/memory-physics.html'), 'GitHub Pages 模式維持 .html 並載入頁面', { status: response.status(), url: page.url() });
    check(await page.locator('#marker').textContent() === 'memory-physics-ok', 'GitHub Pages 模式顯示頁面內容');
    await context.close();
  }

  pretty = true;
  {
    const context = await browser.newContext({ serviceWorkers: 'allow' });
    const page = await openControlled(context);
    const htmlResponse = await page.goto(origin + '/memory-physics.html', { waitUntil: 'domcontentloaded' });
    check(htmlResponse.status() === 200, 'Cloudflare .html 導覽不被 308 回應弄成失敗', { status: htmlResponse.status(), url: page.url() });
    check(await page.locator('#marker').textContent() === 'memory-physics-ok' && await page.evaluate(() => Boolean(navigator.serviceWorker.controller)), 'Cloudflare .html 由 service worker 顯示真正頁面', { url: page.url() });
    const prettyResponse = await page.goto(origin + '/memory-physics', { waitUntil: 'domcontentloaded' });
    check(prettyResponse.status() === 200 && new URL(page.url()).pathname === '/memory-physics', '無副檔名網址載入同一頁', { status: prettyResponse.status(), url: page.url() });
    check(await page.locator('#marker').textContent() === 'memory-physics-ok', '無副檔名網址顯示頁面內容');
    const cached = await page.evaluate(async name => {
      const cache = await caches.open(name);
      const match = (await cache.keys()).find(request => request.url.endsWith('/memory-physics.html'));
      const stored = await cache.match(match);
      return { redirected: stored.redirected, text: await stored.text(), count: (await cache.keys()).length };
    }, cacheName);
    check(cached.redirected === false && cached.text.includes('memory-physics-ok') && !cached.text.includes(tamperMark) && cached.count === assets.length, '快取保存的是通過雜湊的最終內文', cached);

    const briefing = await page.goto(origin + '/briefing', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.documentElement.dataset.probe === 'ready');
    check(briefing.status() === 200 && new URL(page.url()).pathname === '/briefing/' && await page.locator('#marker').textContent() === 'briefing-ok', '目錄轉址後相對路徑仍指向該目錄', { status: briefing.status(), url: page.url() });

    const notes = await page.goto(origin + '/notes.html#part', { waitUntil: 'domcontentloaded' });
    check(notes.status() === 200 && new URL(page.url()).pathname === '/notes' && new URL(page.url()).hash === '#part', '未進清單的 .html 跟隨同來源轉址並保留片段', { status: notes.status(), url: page.url() });
    check(await page.locator('#marker').textContent() === 'notes-ok', '未進清單的頁面仍顯示最終內容');

    const foreignPage = await page.goto(origin + '/leave.html', { waitUntil: 'domcontentloaded' });
    const foreignText = await page.locator('body').innerText();
    check(foreignPage.status() === 503 && !foreignText.includes('foreign-ok'), '跨來源轉址不會被包裝成站內文件', { status: foreignPage.status(), text: foreignText });

    await context.setOffline(true);
    const offlineHtml = await page.goto(origin + '/memory-physics.html', { waitUntil: 'domcontentloaded' });
    check(offlineHtml.status() === 200 && await page.locator('#marker').textContent() === 'memory-physics-ok', '離線仍可開啟已驗證的 .html');
    const offlinePretty = await page.goto(origin + '/memory-physics', { waitUntil: 'domcontentloaded' });
    check(offlinePretty.status() === 200 && await page.locator('#marker').textContent() === 'memory-physics-ok', '離線仍可開啟已驗證的無副檔名網址');
    await context.setOffline(false);

    await page.evaluate(async name => {
      const cache = await caches.open(name);
      const match = (await cache.keys()).find(request => request.url.endsWith('/memory-physics.html'));
      await cache.delete(match);
    }, cacheName);
    tamper = true;
    const rejected = await page.goto(origin + '/memory-physics.html', { waitUntil: 'domcontentloaded' });
    const rejectedText = await page.locator('body').innerText();
    const storedAfter = await page.evaluate(async name => {
      const cache = await caches.open(name);
      const match = (await cache.keys()).find(request => request.url.endsWith('/memory-physics.html'));
      if (!match) return '';
      return (await (await cache.match(match)).text());
    }, cacheName);
    check(rejected.status() === 503 && !rejectedText.includes(tamperMark) && !storedAfter.includes(tamperMark), '執行中雜湊不符時不交付也不寫入轉址後的內文', { status: rejected.status(), storedAfter });
    await context.close();
  }

  pretty = true;
  tamper = true;
  {
    const context = await browser.newContext({ serviceWorkers: 'allow' });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    await page.goto(origin + '/boot.html', { waitUntil: 'domcontentloaded' });
    const install = await page.evaluate(async name => {
      let registration;
      try { registration = await navigator.serviceWorker.register('./sw.js'); }
      catch (error) { return { state: 'rejected', message: error.message, caches: await caches.keys() }; }
      const worker = registration.installing || registration.waiting || registration.active;
      const state = await new Promise(resolve => {
        const finish = () => {
          if (!worker) return resolve('missing');
          if (worker.state === 'activated' || worker.state === 'redundant') resolve(worker.state);
        };
        finish();
        worker?.addEventListener('statechange', finish);
        setTimeout(() => resolve('timeout'), 8000);
      });
      return { state, caches: await caches.keys(), hasCache: (await caches.keys()).includes(name) };
    }, cacheName);
    check((install.state === 'redundant' || install.state === 'rejected') && !install.hasCache, '安裝時轉址後的雜湊不符會整組拒絕', install);
    await context.close();
  }

  pretty = true;
  tamper = false;
  beacon = true;
  {
    const context = await browser.newContext({ serviceWorkers: 'allow' });
    await context.route('https://static.cloudflareinsights.com/**', route => route.fulfill({ status: 200, contentType: 'text/javascript', body: '/* fixture */' }));
    const page = await openControlled(context);
    const home = await page.goto(origin + '/', { waitUntil: 'domcontentloaded' });
    check(home.status() === 200 && await page.locator('#marker').textContent() === 'home-ok', 'Cloudflare beacon 注入後首頁仍是知識中心', { status: home.status(), url: page.url() });
    const article = await page.goto(origin + '/memory-physics', { waitUntil: 'domcontentloaded' });
    const articleText = await page.locator('body').innerText();
    check(article.status() === 200 && await page.locator('#marker').textContent() === 'memory-physics-ok' && !articleText.includes('Page not downloaded') && !articleText.includes('尚未下載'), 'beacon 注入後 /memory-physics 是文章而不是離線頁', { status: article.status(), url: page.url() });
    await page.locator('#returnHome').click();
    await page.locator('#marker').waitFor();
    const homeText = await page.locator('body').innerText();
    check(await page.locator('#marker').textContent() === 'home-ok' && !homeText.includes('Page not downloaded') && !homeText.includes('尚未下載'), '文章品牌與麵包屑 index.html 回到真正首頁', { url: page.url(), text: homeText });
    await page.goto(origin + '/memory-physics', { waitUntil: 'domcontentloaded' });
    await page.locator('#returnSibling').click();
    await page.locator('#marker').waitFor();
    const siblingText = await page.locator('body').innerText();
    check(await page.locator('#marker').textContent() === 'secure-storage-ok' && !siblingText.includes('Page not downloaded') && !siblingText.includes('尚未下載'), 'Return to Secure Storage 開啟同站 HTML 而不是離線頁', { url: page.url(), text: siblingText });
    const apps = await page.goto(origin + '/iot-mcu-envm', { waitUntil: 'domcontentloaded' });
    check(apps.status() === 200 && await page.locator('#marker').textContent() === 'iot-ok', '無副檔名應用頁在 beacon 下可開啟', { status: apps.status(), url: page.url() });
    await page.locator('#returnHome').click();
    await page.locator('#marker').waitFor();
    check(await page.locator('#marker').textContent() === 'home-ok', '應用頁返回知識中心到達首頁', { url: page.url() });
    const cached = await page.evaluate(async name => {
      const cache = await caches.open(name);
      const bodies = await Promise.all((await cache.keys()).map(async request => (await (await cache.match(request)).text())));
      return bodies.join('\n');
    }, cacheName);
    check(!cached.includes('cloudflareinsights') && cached.includes('home-ok') && cached.includes('memory-physics-ok'), '快取保存去掉 beacon 的作者內文', { hasBeacon: cached.includes('cloudflareinsights') });
    await context.close();
  }

  pretty = true;
  tamper = true;
  beacon = true;
  {
    const context = await browser.newContext({ serviceWorkers: 'allow' });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    await page.goto(origin + '/boot.html', { waitUntil: 'domcontentloaded' });
    const install = await page.evaluate(async name => {
      try { await navigator.serviceWorker.register('./sw.js'); }
      catch (error) { return { state: 'rejected', message: error.message, hasCache: false }; }
      const registration = await navigator.serviceWorker.getRegistration();
      const worker = registration?.installing || registration?.waiting || registration?.active;
      const state = await new Promise(resolve => {
        const finish = () => {
          if (!worker) return resolve('missing');
          if (worker.state === 'activated' || worker.state === 'redundant') resolve(worker.state);
        };
        finish();
        worker?.addEventListener('statechange', finish);
        setTimeout(() => resolve('timeout'), 8000);
      });
      return { state, hasCache: (await caches.keys()).includes(name) };
    }, cacheName);
    check((install.state === 'redundant' || install.state === 'rejected') && !install.hasCache, 'beacon 以外的內容被改仍拒絕安裝', install);
    await context.close();
  }

  check(warnings.length === 0, '主控台沒有 redirected response 警告', { warnings });
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  await new Promise(resolve => foreign.close(resolve));
}
