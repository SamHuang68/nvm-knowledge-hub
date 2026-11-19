# 交接單：Grok Bot (Host) NVM patent map Claim 1 轉寫（2026-11-17）

## 範圍
- 基準：Codex 分支 `codex/patent-source-integrity` @ `d04ca42`（845 = 462 legacy + 383 source-reviewed；261 有 Claim 1 審查；122 缺）。
- 122 件中先擱置 11 件，沒有處理：
  - 排除 1 件：US10910561B1
  - 延後 5 件：US6770950B2、US6788595B2、US6654284B2、US6740556B1、US6768678B1
  - 舊缺口表 5 件：US6570809B1、US6590825B2、US6566706B1、US7259410B2、US10964388B2
- 實際處理 111 件，分 4 批，全部完成、未解決 0：

| 批次 | 件數 | 公司 |
|---|---|---|
| batch-1 | 29 | Crossbar 22、Kilopass 5、NSCore 1、PUFsecurity 1 |
| batch-2 | 28 | eMemory 17、Macronix 7、Sidense 3、Adesto 1 |
| batch-3 | 27 | SST 19、Everspin 8 |
| batch-4 | 27 | Nantero 19、Everspin 8 |

## 方法與限制
- 來源：2026-11-17 從 USPTO image-ppubs 重新下載的官方 PDF，Claim 1 依頁面影像逐字轉寫，Google 版只用來定位。
- 雜湊：官方 PDF 的雜湊和 R 綁定的 Google 版指紋不同（USPTO 每次下載都重新產生檔案），兩組都保留，沒有覆寫 R 的值。
- 原樣保留的印刷錯字：例如 US7248507B2 的「voltaae / ehanae」、US8750019B2 的「rovided」。
- 書目不符只有 1 件：US8659933B2，扉頁印成「HERETO」，紀錄為「HETERO」；更正證書只改標題。
- 審查人數：都是單一審查者。只有 batch-1 另外做過一次獨立覆核，結果 29 件 PASS 或 PASS_WITH_NOTES，0 FAIL。batch-2、batch-4 的覆核依 Sam 的 KISS 指示中止，batch-3 沒有覆核。
- 草稿中的稽核路徑指向 Grok Bot 主機的 `/workspace/nvm-claim1/...`，不能直接用。
- 沒有經過 root、AGY、OpenAI 三方比對，也沒有寫進 R、沒有推送、沒有部署。

## 檔案位置
- NucBox：`C:\Users\Sam\AI-Workspace\docs\nvm-claim1-host\nvm-claim1-backup-b{1,2,3,4}.tgz`
  - 內含每案 JSON、`reviews.jsonl`、`summary.json`、官方 PDF。
  - b3、b4 是 11/19 補傳的。
- GitHub 備份分支（只有 JSON，不合併）：`SamHuang68/nvm-knowledge-hub` 的 `host/claim1-reviews-2026-11-17` @ `f3fb74d`
  - 內含 `batch-{1..4}/reviews.jsonl`、`summary.json`、`audit/batch-1-audit.json`。

## 建議
- 把 111 件當作另一位獨立觀察者的轉寫，用腳本和 root 的讀取逐字比對，先找出兩邊一致和有差異的案子。
- ClaimReview 草稿先不要採用。
- 和 Claim60 重疊的案子，以寫入端為準。
