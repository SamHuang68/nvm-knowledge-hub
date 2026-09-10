# NVM 知識中心

以非揮發性記憶體為主題的中性工程知識庫，涵蓋技術基礎、IP 與製程、應用與系統，以及文獻與工具。讀者可依問題直接進入原理、具名實作、設計條件或公開來源；安全儲存、AI 系統與 IP 單元都是其中的項目。

## 本機執行

在 site 目錄使用 Node.js：

```powershell
npm ci
npm run serve
```

開啟 [本機知識中心](http://127.0.0.1:8765/)。

## 目錄與閱讀路徑

正式目錄來源為 `data/NVM知識目錄.json`。首頁由 `scripts/建立知識中心首頁.mjs` 產生，使用緊湊站名、範圍說明與分類條目；不要直接修改生成的首頁。

| 類別 | 首頁入口 | 內容範圍 |
| --- | --- | --- |
| 技術基礎 | `index.html#layer-foundations` | 位元單元物理、儲存機制與技術家族、選型比較。 |
| IP 與製程 | `index.html#layer-ip-process` | 具名 IP 單元、操作原理、技術沿革與晶圓代工路線圖。 |
| 應用與系統 | `index.html#layer-applications` | 安全架構、安全保證、AI、IoT／MCU、車用及特種製程應用。 |
| 文獻與工具 | `index.html#layer-resources` | 證據總帳、白皮書決策工作台、簡報講稿及 OIP 專頁。 |

品牌連結回到根目錄 `index.html`；`index.html#topics` 指向完整目錄。原 `#layer-architecture` 錨點保留在應用與系統中的安全架構入口附近。

先由四類目錄找到問題，再直接開啟專題。不需要先讀某個產品或特定物理家族，才能使用其他內容。

## 技術全景與深層連結

技術全景有英文 `NVM技術全景.html` 與繁體中文 `NVM技術全景中文.html`，兩者共用相同章節識別碼：

| 路由 | 角色 |
| --- | --- |
| `#panorama` | 中性章節目錄。 |
| `#ip-directory` | 具名 IP 單元及操作名錄。 |
| `#physics-library` | 儲存物理、獨立式元件與技術背景。 |
| `#nvm-physics-overview` | 物理總表的既有直達錨點。 |
| `#ip-lineage` | 公司／業務承接與技術機制對應的證據。 |
| `#foundry`、`#comparison` | 晶圓代工進度與有條件的技術比較。 |
| `#system-array`、`#system-scm` | 陣列選擇／感測、持久性與系統責任。 |
| `#patents`、`#glossary`、`#sources` | 代表專利、共同詞彙及來源下載。 |

原 `#topic-<id>`、`#ip-<id>`、`#op-<topic>-<operation>`、`#ip-op-<id>-<operation>` 與 `#source-<id>` 仍是可引用的深層連結。公司承接事件、專利受讓資訊、具名產品與 cell 機制須分別保留來源，不能互相代替。

`site-language.js` 管理全站語言。首次造訪預設英文；讀者可切換繁體中文，技術全景跨語言頁切換會保留原 hash。每頁主導覽提供同一套四類入口；麵包屑表達所在位置，本頁章節列及少量相關閱讀負責局部跳轉。

## 來源、生成物與工作台

- `data/NVM知識目錄.json`：首頁分類、資源標題、簡介與目的地。
- `data/NVM全景導論*.json`、`data/NVM電荷專題*.json`、`data/NVM新興專題*.json`、`data/NVM比較與系統*.json`、`data/NVM晶圓代工路線圖*.json`：技術、操作、比較、年度證據及雙語內容的來源資料。
- `data/NVMIP單元導論*.json` 與對應的 IP 圖解模組：具名單元、操作及來源界線；公司沿革資料依正式全景生成器所引用的來源維護。
- `scripts/建立NVM技術全景.mjs`：生成兩語全景、整合知識資料、專題文字及搜尋索引。
- `data/NVM知識資料*.json`、`data/NVM技術專題*.md`、`data/NVM搜尋索引.js`：共同生成輸出，供網站搜尋、資料下載及後續簡報取材。
- `whitepaper/index.html`：公開白皮書與決策工作台；`tools/whitepaper-studio/index.html` 是同一網站內的另一個工作台入口。兩者目前共用 `whitepaper/assets/` 的部署資產。
- `briefing/index.html`：既有簡報與講稿入口；`memory-evidence.html` 提供逐筆公開來源及支持範圍。

白皮書來源位於 `tools/whitepaper-studio/src/`。修改來源後應核對實際載入的部署資產與靜態備援，不能只因來源檔改動就宣稱執行版已更新，也不要為了同步導覽而重新加入未經核對的舊資料。

## 生成與驗證

```powershell
npm run build:nvm
npm run check:nvm
node scripts/check-site-ia.mjs
```

`build:nvm` 會更新生成物；`check:nvm` 檢查語法與生成同步。資訊架構檢查涵蓋公開頁面、目的地、品牌首頁與章節參照。

版面、雙語及操作改動另執行與改動相符的瀏覽器驗證：

```powershell
npm run qa:render
npm run qa:bilingual
npm run qa:ip
```

驗證須使用最新正式目錄與路由，不能把過期的固定產品數量、首屏內容或折疊狀態保留成驗收條件。桌面與手機都應檢查焦點、語言切換、返回／前進、深層連結及橫向溢出。

## 應用資料與 SharePoint 匯出

OIP 的正式論點資料為 `data/oip-secure-storage-knowledge.json`。修改資料後重新生成並核對匯出：

```powershell
node scripts/build-oip-sharepoint.mjs
node scripts/build-oip-sharepoint.mjs --check
```

AI 系統的應用資料與獨立驗證流程：

```powershell
node scripts/build-ai-nvm-sharepoint.mjs
node scripts/build-ai-nvm-sharepoint.mjs --check
node scripts/check-ai-nvm-integrity.mjs
```

AI 資料位於 `data/ai-nvm-opportunities-knowledge.json`，結構由 `data/ai-nvm-opportunities-schema.json` 約束。共用安全知識結構及 SharePoint 欄位映射分別位於 `data/assurance-knowledge-schema.json` 與 `data/sharepoint-field-map.md`。

來源類別 `EvidenceClass` 與驗證成熟度 `AssuranceMaturity` 是不同維度。重用到 SharePoint、Copilot 或簡報時，保留每筆主張的範圍、限制、來源、查閱日期及尚未封閉的問題。

## 專業風格與證據邊界

沿用深藍、紙色、青色與節制銅色的企業技術風格。用分類、條目、表格及具體物理圖承載內容；精確圖解保留標籤、材料界面、載子方向與圖例。首頁不因某次新增研究而改成單一產品的宣傳頁。

公開資料依原始文件區分標準要求、原作者研究、供應商主張、具名量測與有限推論。未公開的實作、跨條件性能、認證與量產狀態不得自行補足。網站提供工程理解與可追溯材料，不把候選適配直接寫成已完成設計導入或量產。

本機驗證、提交與對外發布是不同操作；實際對外狀態以發布流程及當次線上證據為準。
