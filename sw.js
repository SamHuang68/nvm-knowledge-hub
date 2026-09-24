/* 本站快取由建置清單綁定；不清除同來源其他專案的資料。 */
importScripts('./data/離線資源清單.js');
const CACHE_PREFIX = 'nvm-knowledge-hub-';
const CACHE_NAME = CACHE_PREFIX + self.NVMOfflineManifest.version;
const ROOT = new URL('./', self.location.href);
const LEGACY_CACHES = new Set(['nvm-hub-r4-20260917']);
const assetURLs = new Set(self.NVMOfflineManifest.assets.map(file => new URL(file, ROOT).href));
const digests = new Map(Object.entries(self.NVMOfflineManifest.digests).map(([file, digest]) => [new URL(file, ROOT).href, digest]));

function offlineDocument(request) {
  const requested = new URL(request.url).searchParams.get('lang');
  const language = requested === 'zh' || requested === 'en' ? requested : null;
  const messages = {
    en: {
      title: 'Page not downloaded',
      heading: 'This page is unavailable offline or while resources are updating',
      description: 'Reconnect, then close all tabs for this site and reopen it to download the complete version.',
      home: 'Return to the Knowledge Hub',
    },
    zh: {
      title: '此頁尚未下載',
      heading: '目前離線或資源更新中，此頁尚未下載',
      description: '重新連線後，關閉本站所有分頁再重新開啟，即可取得完整版本。',
      home: '返回知識中心首頁',
    },
  };
  const copy = messages[language || 'en'];
  const home = new URL('index.html', ROOT);
  home.searchParams.set('lang', language || 'en');
  // SW 無法讀取 localStorage；無明確 query 時由同來源的備援文件同步偏好。
  // 初始回應仍有完整內容，即使 JavaScript 不可用也能返回已快取首頁。
  return `<!doctype html><html lang="${language === 'zh' ? 'zh-Hant' : 'en'}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${copy.title}</title><main><h1 id="offlineHeading">${copy.heading}</h1><p id="offlineDescription">${copy.description}</p><a id="offlineHome" href="${home.href}">${copy.home}</a></main><script>
    (() => {
      const messages = ${JSON.stringify(messages)};
      let language = ${JSON.stringify(language)};
      if (!language) {
        try {
          const saved = localStorage.getItem('nvm-hub-language') || localStorage.getItem('nvm-language') || localStorage.getItem('hub-lang');
          language = saved === 'zh' ? 'zh' : 'en';
        } catch { language = 'en'; }
      }
      const copy = messages[language];
      document.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en';
      document.title = copy.title;
      document.getElementById('offlineHeading').textContent = copy.heading;
      document.getElementById('offlineDescription').textContent = copy.description;
      const home = document.getElementById('offlineHome');
      home.textContent = copy.home;
      const address = new URL(home.href);
      address.searchParams.set('lang', language);
      home.href = address.href;
    })();
  </script></html>`;
}

// Cloudflare Web Analytics 在 Accept 含 text/html 的 HTML 回應、</body> 前注入 beacon。
// 版本路徑與 token 會變；只移除這支已知指令碼，其餘位元組仍須符合清單雜湊。
const CLOUDFLARE_INSIGHTS_BEACON = /<script\b[^>]*\bsrc\s*=\s*(["'])https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js[^"']*\1[^>]*>\s*<\/script>\n?/gi;

function authorHtml(text) {
  return text.replaceAll('\r\n', '\n').replace(CLOUDFLARE_INSIGHTS_BEACON, '');
}

function responseWithBody(response, body) {
  const headers = new Headers(response.headers);
  headers.delete('content-encoding');
  headers.delete('content-length');
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
}

async function verifyResponse(key, response) {
  if (!response.ok || response.type === 'opaque') throw new Error('離線資源下載失敗');
  const expected = digests.get(key);
  const pathname = new URL(key).pathname;
  const textual = /\.(?:html|css|js|json|svg|webmanifest)$/.test(pathname);
  let bodyResponse = response;
  let bytes;
  if (textual && pathname.endsWith('.html')) {
    const cleaned = authorHtml(await response.clone().text());
    bytes = new TextEncoder().encode(cleaned);
    const original = (await response.clone().text()).replaceAll('\r\n', '\n');
    if (cleaned !== original) bodyResponse = responseWithBody(response, cleaned);
  } else if (textual) {
    bytes = new TextEncoder().encode((await response.clone().text()).replaceAll('\r\n', '\n'));
  } else {
    bytes = await response.clone().arrayBuffer();
  }
  if (!expected) return bodyResponse;
  const actual = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(byte => byte.toString(16).padStart(2, '0')).join('');
  if (actual !== expected) throw new Error('離線資源版本不一致，保留既有版本');
  return bodyResponse;
}

function keyFor(request) {
  const url = new URL(request.url);
  url.search = ''; url.hash = '';
  if (url.pathname.endsWith('/')) url.pathname += 'index.html';
  if (!assetURLs.has(url.href) && assetURLs.has(url.href+'.html')) url.pathname += '.html';
  return url.href;
}

// Cloudflare Pages 對 /file.html 回 308，最終文件在無副檔名路徑。
// 導覽請求的 redirect 模式是 manual。Cache 或 FetchEvent 若交出帶 redirected
// 旗標的回應，Chrome 會把導覽變成 ERR_FAILED（redirect mode is not follow）。
// 跟到同來源最終網址後，複製成新的 Response（redirected 為 false）再驗證雜湊。
async function followForBody(request, cacheMode) {
  let response = await fetch(request);
  if (response.type !== 'opaqueredirect') return response;
  const init = { redirect: 'follow', credentials: 'same-origin' };
  if (cacheMode) init.cache = cacheMode;
  return fetch(request.url, init);
}

async function responseWithoutRedirectFlag(response) {
  if (!response.redirected) return response;
  if (response.type === 'opaque' || response.type === 'opaqueredirect') throw new Error('無法讀取轉址後的回應');
  const finalURL = new URL(response.url);
  if (finalURL.origin !== ROOT.origin) throw new Error('離線資源轉址離開本站');
  const headers = new Headers(response.headers);
  // 內文已由 fetch 解壓；保留 content-encoding 會讓瀏覽器再解一次。
  headers.delete('content-encoding');
  headers.delete('content-length');
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function navigationRedirect(request, fetched) {
  if (request.mode !== 'navigate' || !fetched?.redirected || !fetched.url) return null;
  let finalURL;
  try { finalURL = new URL(fetched.url); } catch { return null; }
  if (finalURL.origin !== ROOT.origin) return null;
  const requested = new URL(request.url);
  if (finalURL.pathname === requested.pathname && finalURL.search === requested.search) return null;
  if (requested.hash) finalURL.hash = requested.hash;
  return Response.redirect(finalURL.href, 308);
}
self.addEventListener('install', event => {
  // 每個 HTML、程式與資料都須符合本版本雜湊；部署中途混版則整次安裝失敗。
  // 新版本等待舊分頁關閉，不強制切換仍在使用舊文件的控制器。
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const outcomes = await Promise.allSettled([...assetURLs].map(async key => {
      const fetched = await followForBody(new Request(key, {cache:'reload', redirect:'follow'}));
      const response = await responseWithoutRedirectFlag(fetched);
      const verified = await verifyResponse(key, response);
      await cache.put(key, verified);
    }));
    if (outcomes.some(outcome => outcome.status === 'rejected')) {
      await caches.delete(CACHE_NAME);
      throw new Error('必要離線資源未完整安裝');
    }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key !== CACHE_NAME && (key.startsWith(CACHE_PREFIX) || LEGACY_CACHES.has(key)))
    .map(key => caches.delete(key)))));
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  const key = keyFor(request);
  const network = async cache => {
    const fetched = await followForBody(request);
    let response = await responseWithoutRedirectFlag(fetched);
    if (assetURLs.has(key)) response = await verifyResponse(key, response);
    // 執行期間若儲存空間不足，仍交付已成功取得的回應；安裝階段則維持完整性要求。
    // 寫入前已去掉 redirected 與 Cloudflare Insights beacon，快取只留作者內文。
    if (response.ok && response.type !== 'opaque') await cache.put(key, response.clone()).catch(() => {});
    return navigationRedirect(request, fetched) || response;
  };
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // HTML 與其程式、樣式、圖解和正式資料均取同版快取，不以新版 HTML 混用舊腳本。
    if (assetURLs.has(key)) {
      const cached = await cache.match(key);
      if (cached) return cached;
    }
    try { return await network(cache); }
    catch {
      const cached = await cache.match(key);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        return new Response(offlineDocument(request), {status:503,headers:{'Content-Type':'text/html; charset=utf-8'}});
      }
      return new Response('離線資源尚未下載', {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
    }
  })());
});
