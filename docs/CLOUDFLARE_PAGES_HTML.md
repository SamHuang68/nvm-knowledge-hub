# Cloudflare Pages 與 `.html` 路徑

專案 `hub-samhuang68`（自訂網域 `https://hub.samhuang68.org/`）是靜態 Cloudflare Pages：沒有 build command，輸出目錄是倉庫根目錄。

## 平台行為

[Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)（2026-04-21）寫明：Pages 會把 HTML 導向無副檔名路徑。例如 `/memory-physics.html` 回 **308** 到 `/memory-physics`，`/NVM技術全景.html` 回 **308** 到 `/NVM技術全景`。`/about/index.html` 則導向 `/about/`。

這不是檔案遺失。GitHub Pages 仍把 `.html` 留在網址裡。

## 為什麼沒有放 `wrangler.toml`

`html_handling = "none"` 只屬於 [Workers static assets](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/)。Pages 的 Wrangler 設定（`name`、`pages_build_output_dir`、綁定）**不會**讀取 `html_handling`，也沒有儀表板開關可關掉這段 308。

若在這個倉庫加上帶 `pages_build_output_dir` 的 `wrangler.toml`，Pages 會把該檔當成正式設定來源，卻仍然做 pretty URL。因此這個修正不新增該檔。

`_redirects` 也無法取消這段平台 308；把無副檔名再指回 `.html` 會和內建導向互相循環。

要讓網址保留 `.html`，必須把這個專案從 Pages 遷到 Workers static assets，並設定 `html_handling = "none"`。那是另一次部署變更，不在本次修正範圍。

## 這次怎麼讓子頁恢復

客戶端用 `hubPagePath()` 判斷目前頁面：路徑沒有副檔名時補上 `.html` 再比對；結尾是 `/` 的目錄（`/briefing/`、`/whitepaper/`、`/tools/whitepaper-studio/`）保持不變。GitHub Pages 的 `/nvm-knowledge-hub/memory-physics.html` 與 Cloudflare 的 `/memory-physics` 都會命中同一組頁面 CSS／JS。

## Service worker 與 308

`site-language.js` 會註冊 `sw.js`。導覽請求的 redirect 模式是 `manual`。若把 Cloudflare 跟隨 308 之後、`redirected === true` 的回應放進 Cache，或直接交給 `FetchEvent`，Chrome 會讓該次導覽變成 `ERR_FAILED`（主控台：redirected response was used for a request whose redirect mode is not `follow`）。`curl` 仍看得到 200，因為它不經過 service worker。GitHub Pages 不對 `.html` 做這段 308，所以同一支 worker 在那邊原本就能開啟。

安裝與執行時改為跟隨**同來源**最終網址，把內文複製成新的 `Response`（`redirected` 為 false）之後，才做原本的 SHA-256 比對與 `cache.put`。雜湊不符仍整次拒絕安裝，執行中也不把不符的內文交回頁面。跨來源轉址不會被當成站內文件。尚未進快取的導覽若最終路徑不同（例如 `/briefing` → `/briefing/`），改回 308，讓網址列與相對路徑跟平台一致。

## Service worker 與 Web Analytics beacon

Cloudflare Web Analytics／Insights 會在**看起來像瀏覽器文件**的 HTML 回應裡、`</body>` 之前注入：

```html
<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js/…" data-cf-beacon='…'></script>
```

實測（2026-09-24，`https://hub.samhuang68.org/`）：`Accept` 含 `text/html` 就會注入，約多 367 bytes；`Accept: */*`（一般 `curl`）則與倉庫雜湊一致。Service worker 的導覽 `fetch(request)` 會帶上文件的 `Accept`，因此內文不再等於 `data/offline-manifest.js`。`verifyResponse` 若直接比對，安裝失敗，或導覽落到離線 503（「此頁尚未下載」／「Page not downloaded」）。返回 `index.html` 的連結會再走同一條失敗路徑。

`sw.js` 在計算 SHA-256 與 `cache.put` 之前，只移除 `static.cloudflareinsights.com/beacon.min.js` 這支已知指令碼（含它緊接的一個換行）。其餘位元組仍須符合清單。快取保存的是作者內文，不是帶 beacon 的複本。GitHub Pages 沒有這段注入，移除結果與原文相同，雜湊行為不變。這不是關掉 Analytics 的替代說明；主機可以繼續開著，完整性檢查也不整段關閉。

`hubPagePath('/')` 對結尾是 `/` 的路徑維持原樣（根目錄與 `/briefing/` 同一規則），不會改成 `index.html`。首頁判斷不靠這個函式把 `/` 收成檔名。Service worker 的 `keyFor` 才把目錄補上 `index.html`，因此 `/`、`/index.html` 與 Cloudflare 對 `index.html` 的 308 都對到同一份首頁快取。站內「返回知識中心」仍使用 `index.html`，GitHub Pages 網址維持附檔名。

## 合併後如何查

1. 確認 Cloudflare Pages 專案 `hub-samhuang68` 已從 `main` 重新部署（儀表板沒有額外開關）。Pages 可能有短暫快取。
2. 若這個瀏覽器已經註冊過舊的 `sw.js`，新的 worker 會先進入等待，不會強制換掉使用中的分頁。請硬重新載入，或到 DevTools → Application → Service Workers 按 Unregister，關掉本站分頁再打開。
3. 開啟 `https://hub.samhuang68.org/memory-physics.html`。頁面應出現內容，而不是空白或 `ERR_FAILED`。網址可以留在 `.html`，也可以是 `/memory-physics`。DevTools 應看到 `memory-physics-contrast.css`，或 `document.querySelector('link[href*="memory-physics-contrast"]')`。
4. 開啟 `https://hub.samhuang68.org/memory-physics`。同樣應顯示該頁。
5. 開啟 `https://hub.samhuang68.org/NVM技術全景.html`。頁面應正常顯示。語言切換仍指向 `NVM技術全景.html`／`NVM技術全景中文.html`。
6. `https://samhuang68.github.io/nvm-knowledge-hub/memory-physics.html` 應維持 200，且網址仍含 `.html`。
