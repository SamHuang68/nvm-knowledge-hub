import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa/閱讀樣式套用'));
const source = fs.readFileSync(path.join(root, 'site-language.js'), 'utf8');
const oldSource = source.replace('.test(pageFile);', '.test(hubPagePath(location.pathname));');
assert.notEqual(oldSource, source, '舊條件重現必須確實替換路徑判斷，不能測到相同版本');
fs.mkdirSync(output, {recursive:true});
const server = await startTestServer(root);
const base = new URL(server.base);
const channel = process.env.NVM_QA_BROWSER || 'msedge';
const browser = await chromium.launch({headless:true, ...(channel === 'chromium' ? {} : {channel})});
const results = [];

// 使用本機實際文件；副目錄與無副檔名網址只在測試伺服器端映射，不另建內容。
const cases = [
  {name:'根目錄首頁', route:'/?lang=en', language:'en', paper:false, screenshot:'首頁修正後.png'},
  {name:'無副檔名首頁', route:'/index?lang=en', language:'en', paper:false},
  {name:'英文全景', route:'/nvm-technology-atlas.html?lang=en#panorama', language:'en', paper:false, screenshot:'全景修正後.png'},
  {name:'繁體中文全景', route:'/nvm-technology-atlas-zh.html?lang=zh#panorama', language:'zh', paper:false},
  {name:'SRAM 修復頁', route:'/sram-repair.html?lang=zh', language:'zh', paper:false},
  {name:'無副檔名英文全景', route:'/nvm-technology-atlas?lang=en#panorama', language:'en', paper:false},
  {name:'副目錄首頁', route:'/驗證副目錄/?lang=en', language:'en', paper:false},
  {name:'副目錄明確首頁', route:'/驗證副目錄/index.html?lang=en', language:'en', paper:false},
  {name:'副目錄英文全景', route:'/驗證副目錄/nvm-technology-atlas?lang=en#panorama', language:'en', paper:false},
  {name:'副目錄繁體中文全景', route:'/驗證副目錄/nvm-technology-atlas-zh?lang=zh#panorama', language:'zh', paper:false},
  {name:'副目錄 SRAM 修復頁', route:'/驗證副目錄/sram-repair?lang=zh', language:'zh', paper:false},
  {name:'證據總帳', route:'/memory-evidence.html?lang=zh', language:'zh', paper:true, screenshot:'證據總帳修正後.png', toggle:true},
  {name:'OIP 文獻頁', route:'/oip-secure-storage.html?lang=zh', language:'zh', paper:true},
  {name:'副目錄物理文獻頁', route:'/驗證副目錄/memory-physics?lang=zh', language:'zh', paper:true}
];

async function verify(item, legacy = false) {
  const context = await browser.newContext({serviceWorkers:'block', viewport:{width:1440,height:960}});
  const errors = [];
  let paperRequests = 0;
  try {
    await context.route('**/*', async route => {
      const address = new URL(route.request().url());
      if (address.origin !== base.origin) return route.abort();
      const pathname = decodeURIComponent(address.pathname);
      if (pathname.endsWith('/literature-paper.js')) paperRequests++;
      if (pathname.endsWith('/site-language.js')) {
        return route.fulfill({body:legacy ? oldSource : source, contentType:'text/javascript; charset=utf-8'});
      }
      let mapped = pathname.replace(/^\/驗證副目錄(?=\/)/, '');
      if (mapped.endsWith('/')) mapped += 'index.html';
      else if (!path.extname(mapped)) mapped += '.html';
      if (mapped !== pathname) {
        const local = new URL(encodeURI(mapped), base);
        local.search = address.search;
        return route.fulfill({response:await route.fetch({url:local.href})});
      }
      return route.continue();
    });
    await context.addInitScript(() => {
      window.__readingTrace = {styleCalls:0, lifts:[], registrations:[]};
      const originalStyle = window.getComputedStyle;
      window.getComputedStyle = function (...args) {
        window.__readingTrace.styleCalls++;
        return originalStyle.apply(this, args);
      };
      const originalTimeout = window.setTimeout;
      window.setTimeout = function (callback, delay, ...args) {
        if (typeof callback === 'function' && callback.name === 'lift') {
          return originalTimeout.call(this, () => {
            const before = window.__readingTrace.styleCalls;
            const started = performance.now();
            const result = callback(...args);
            window.__readingTrace.lifts.push({delay, styleCalls:window.__readingTrace.styleCalls - before, durationMs:performance.now() - started});
            return result;
          }, delay);
        }
        return originalTimeout.call(this, callback, delay, ...args);
      };
      // 觀察原註冊入口而不安裝整站資源；完整離線功能仍由既有離線回歸驗證。
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register = function (address) {
          window.__readingTrace.registrations.push(new URL(address, location.href).href);
          return Promise.resolve({});
        };
      }
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(new URL(item.route, base).href);
    await page.waitForFunction(() => Boolean(window.HubLanguage));
    await page.waitForTimeout(250);
    const initial = await page.evaluate(() => ({
      paper:document.body.classList.contains('hub-literature-paper'),
      language:window.HubLanguage.get(),
      elements:document.querySelectorAll('*').length,
      registrations:window.__readingTrace.registrations
    }));
    assert.equal(initial.language, item.language, `${item.name}須保留原語言入口`);
    assert.deepEqual(initial.registrations, [new URL('sw.js', page.url()).href], `${item.name}須保留既有 Service Worker 註冊入口`);
    await page.evaluate(() => {
      window.__readingTrace.lifts = [];
      window.__readingTrace.styleCalls = 0;
      document.querySelector('h1').dispatchEvent(new MouseEvent('click', {bubbles:true}));
    });
    await page.waitForTimeout(100);
    const click = await page.evaluate(() => window.__readingTrace);
    if (legacy) {
      assert.equal(initial.paper, true, '舊條件必須重現全景誤套文獻樣式');
      assert.equal(paperRequests, 1, '舊條件必須重現調色程式載入');
      assert.equal(click.lifts.length, 1, '舊條件必須重現單次點擊觸發全頁調色');
      assert.ok(click.lifts[0].styleCalls > 0, '舊條件必須重現實際樣式讀取成本');
    } else {
      assert.equal(initial.paper, item.paper, `${item.name}須套用正確閱讀樣式`);
      assert.equal(paperRequests, item.paper ? 1 : 0, `${item.name}須維持正確調色資源請求`);
      assert.equal(click.lifts.length, item.paper ? 1 : 0, `${item.name}須維持正確點擊後調色行為`);
      if (item.toggle) {
        await page.evaluate(() => window.HubLanguage.toggle());
        assert.equal(await page.evaluate(() => window.HubLanguage.get()), 'en', '文獻頁須保留語言切換');
        assert.equal(new URL(page.url()).searchParams.get('lang'), 'en', '語言切換須同步原網址');
        assert.equal(await page.evaluate(() => document.body.classList.contains('hub-literature-paper')), true, '切換語言後須保留文獻樣式');
        await page.evaluate(() => window.HubLanguage.set('zh'));
      }
      if (item.screenshot) await page.screenshot({path:path.join(output, item.screenshot)});
    }
    assert.deepEqual(errors, [], `${item.name}不得產生瀏覽器執行錯誤`);
    return {
      頁面:item.name,
      網址:item.route,
      舊條件重現:legacy,
      通過:true,
      文獻樣式:initial.paper,
      語言:initial.language,
      元素數:initial.elements,
      調色資源請求:paperRequests,
      點擊後調色回呼:click.lifts.map(sample => ({延遲毫秒:sample.delay, 樣式讀取次數:sample.styleCalls, 執行毫秒:Number(sample.durationMs.toFixed(2))})),
      離線註冊路徑:initial.registrations.map(address => new URL(address).pathname),
      ...(item.screenshot && !legacy ? {畫面:item.screenshot} : {})
    };
  } finally {
    await context.close();
  }
}

try {
  results.push(await verify(cases.find(item => item.name === '英文全景'), true));
  for (const item of cases) results.push(await verify(item));
  console.log(`通過：舊條件重現 1 組、修正後路由與文獻閱讀 ${cases.length} 組；排除頁面無調色回呼，文獻頁保留語言與離線註冊入口。毫秒數僅為本機量測樣本。`);
} finally {
  fs.writeFileSync(path.join(output, '驗證結果.json'), JSON.stringify({
    驗證範圍:'本機實際文件、舊條件記憶體重現、根目錄與副目錄、明確與無副檔名路由、文獻閱讀、語言切換及離線註冊入口',
    限制:'外部請求一律阻擋；Service Worker 只觀察原註冊入口，不以此替代完整離線回歸。時間僅為本機量測樣本，不作速度承諾。',
    結果:results
  }, null, 2) + '\n');
  await browser.close();
  await server.close();
}
