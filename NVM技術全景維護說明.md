# NVM 技術全景維護說明

此專題直接整合於 NVM Knowledge Hub 主站，入口為 `NVM技術全景.html`。受眾為有半導體背景、尚未熟悉各類 NVM 元件的讀者。網站採中立教學觀點；新內容統一使用臺灣繁體中文。

資料與簡報共用同一來源。`data` 內五個 JSON 檔分別保存導論、電荷專題、新興專題、比較與系統，以及晶圓代工路線圖。`scripts/建立NVM技術全景.mjs` 驗證來源與主題欄位，生成靜態網頁、完整資料包、可下載的專題文字及首頁搜尋索引。編修時修改來源 JSON 或產生程式，再重新產生，避免直接編輯衍生 HTML。

```powershell
node scripts/建立NVM技術全景.mjs
node scripts/建立NVM技術全景.mjs --check
npm.cmd run check:nvm
npm.cmd run serve
# 在另一個終端機執行瀏覽器檢查
npm.cmd run qa:nvm
```

後續製作簡報時，從 `data/NVM知識資料.json` 選取同一主題、來源識別碼、日期與限制；亦可使用 `data/NVM技術專題.md` 閱讀全文。簡報圖可依網站 SVG 原理圖重新編排，需保留圖的抽象層級與技術限制。

每個技術紀錄保留儲存狀態、結構、操作前後、選擇條件、變異、優缺點、四層限制、成熟度、專利、來源與理解題。商用階段綁定具名實作；公開路線圖中的目標與完成事件分列。歷史課程表供對照，不當作現行規格。來源類別、商用成熟度與系統用途是獨立欄位。

路由使用穩定錨點，例如 `#topic-stt`、`#topic-vcm`、`#foundry`、`#comparison`、`#system-scm`。直接連結、重新載入、上一頁與下一頁均須保留正確主題。手機將比較列轉為直向資訊，歷史表改為逐技術卡片，避免依賴水平拖曳。

公開入口為 `https://samhuang68.github.io/nvm-knowledge-hub/NVM技術全景.html`。發布採主站既有的 GitHub Pages 流程：先提交內容，再產生並提交發行來源紀錄，推送至 `main` 後核對部署結果與公開檔案。`data/release-lineage.json` 提供內容提交與檔案樹的版本對應；實際上線需另以 GitHub Pages 成功部署及公開頁面驗證。

完整主站檢查使用 `npm.cmd run check`。基準版本既有資訊架構檢查與新版首頁不一致，並含既有頁面的錨點問題；本輪檢查另以 `check:nvm`、`qa:nvm` 及首頁入口／搜尋驗證記錄新增內容。完整主站檢查的結果需與基準紀錄比較，不能把專題通過當成整站通過。
