# NVM Hub 模擬器與專題章節隔離審查報告（TEST 76 ~ TEST 79 & TEST 82）

**審查員身分**：唯讀審查員（同供應商隔離審查 Same-Vendor Isolated Review）  
**審查目標**：
1. `cxl-memory-pooling-simulator.js` ＋ `ai-nvm-opportunities.html` (cxl-memory-pooling-section / TEST 82)
2. `automotive-hbm4-scrubbing-simulator.js` ＋ `automotive-nvm.html` (auto-hbm4-scrubbing-simulator-root / TEST 79)
3. `advanced-packaging-pdks-simulator.js` ＋ `technology-comparison.html` (advanced-packaging-simulator-root / TEST 78)
4. `hybrid-bonding-tsv-kgd-simulator.js` ＋ `specialty-nvm.html` (hybrid-bonding-tsv-simulator-root / TEST 77)
5. `hbm4-base-die-repair-probe-simulator.js` ＋ `ai-nvm-opportunities.html` (hbm4-repair-probe-simulator-root) ＋ `memory-evidence.html` (evidence-V20 / TEST 76 & TEST 80)

---

## 第一組：CXL 記憶體池化模擬器與 AI 機會章節 (TEST 82)

### 具體發現清單

1. **`cxl-memory-pooling-simulator.js:3, 25` / `ai-nvm-opportunities.html:1508, 1512, 1523`**
   - **原文摘錄**：「0-Mask AntiFuse Tag Cache」／「0-Mask AntiFuse OTP 扮演了極速硬體 CAM 標籤快取...角色」
   - **問題類別**：D（物理/工程錯誤）、A（偏袒特定技術）
   - **嚴重度**：高
   - **問題說明**：AntiFuse OTP 為一次性可編程非揮發性記憶體（One-Time Programmable），寫入不可逆且無擦除功能。記憶體池化（Memory Pooling）之 Tag Cache / CAM 必須隨主機記憶體分派、動態頁面置換與快取一致性進行高頻實時讀寫，在硬體架構上係由晶片內 SRAM / 暫存器（Register CAM）實現，物理上絕不可能由 OTP 擔任動態標籤快取。此處將動態 CAM 快取冠以 AntiFuse 純屬技術硬套。
   - **建議修正方向**：將動態快取正名為晶片內硬體 CAM/SRAM，AntiFuse OTP 僅限於儲存 SPDM 1.3 根憑證或開機靜態組態。

2. **`cxl-memory-pooling-simulator.js:77-101`**
   - **原文摘錄**：`CXL_POLICIES` 僅提供 `antifuse_hardware_tag` vs `pure_software_kernel` vs `broadcast_snooping_nop`
   - **問題類別**：A（偏袒特定技術）、D（工程陳述失真）
   - **嚴重度**：中
   - **問題說明**：策略清單設置假性三分法，硬體過濾選項唯一指定 AntiFuse，對比項刻意設為極度劣化的軟體中斷（850ns）與全匯流排遍歷（240ns），完全排除產業標準 ASIC/SoC 控制器內建之 SRAM/暫存器硬體快取。
   - **建議修正方向**：將選項中立化為「晶片內硬體 CAM 標籤快取」，移除專屬技術繫結。

3. **`cxl-memory-pooling-simulator.js:159-160, 168-169` / `ai-nvm-opportunities.html:1666, 1748`**
   - **原文摘錄**：「次 20ns 零崩潰保證 (Zero-Panic SLA)」／「在主機暫存器提交前於 8.5 ns 內完成毒化故障隔離」
   - **問題類別**：D（工程錯誤）、B（未證實定量斷言）
   - **嚴重度**：高
   - **問題說明**：在 CXL 3.1 規範中，Poison（資料錯誤標記）隨 PCIe/CXL Flit 標頭在協定層傳遞，由記憶體控制器硬體記錄於 AER/RAS 暫存器。跨網絡 Fabric 存取延遲本身已高達 130~185ns，晶片端不可能在遠端記憶體讀取完成前「於 8.5ns 內完成毒化隔離」，更無法做出絕對性的「Zero-Panic Guaranteed（零崩潰保證）」。
   - **建議修正方向**：刪除「零崩潰保證」與「次 20ns 隔離」之誇大陳述，改為描述 CXL.mem 協定層 Poison 標記轉發與控制器阻斷機制。

4. **`cxl-memory-pooling-simulator.js:176-177`**
   - **原文摘錄**：「Lack of hardware AntiFuse tag cache causes excessive OS kernel interrupts, risking PCIe LTSSM timeouts. / 缺少硬體 AntiFuse 標籤快取導致龐大 OS 核心中斷，面臨 PCIe LTSSM 超時斷鏈風險。」
   - **問題類別**：D（工程/協定錯誤）
   - **嚴重度**：高
   - **問題說明**：PCIe LTSSM（Link Training and Status State Machine）是實體層（PHY）鏈路訓練狀態機（Detect, Polling, Configuration, Recovery, L0/L1），管理實體訊號握手與鏈路電氣狀態。上層軟體查表或 OS 中斷過長，頂多觸發交易層完成逾時（Completion Timeout, CTO），絕對不會造成實體層 LTSSM 超時斷鏈。此陳述在計算機架構與 PCIe/CXL 協定規範上為嚴重概念錯誤。
   - **建議修正方向**：將 LTSSM 超時斷鏈修正為交易層 Completion Timeout (CTO) 或應用層延遲抖動。

5. **`cxl-memory-pooling-simulator.js:361, 375`**
   - **原文摘錄**：`const util = 0.94 - ((0.94 - 0.55) * Math.exp(-0.45 * ratio));` / `const unpooledY = padding.top + chartH - ((0.55 - 0.4) / 0.6) * chartH;`
   - **問題類別**：F（公式實作與註解/物件描述不一致）
   - **嚴重度**：中
   - **問題說明**：Canvas Mode 2 曲線繪製中，未池化基準利用率被寫死為常數 `0.55`，然而 `CXL_SYSTEM_PRESETS` 各預設物件之 `directUnpooledUtilization` 分別為 0.58、0.65、0.52、0.50，導致畫布繪製之基準線與實際計算數據脫鉤。
   - **建議修正方向**：將寫死常數 `0.55` 改為引用 `preset.directUnpooledUtilization`。

6. **`ai-nvm-opportunities.html:1504-1795`**
   - **原文摘錄**：整區宣稱為「第一性原理互動工作台 (FIRST-PRINCIPLES WORKBENCH)」
   - **問題類別**：E（違背網站證據紀律）、B（未標示假設模型）
   - **嚴重度**：中
   - **問題說明**：缺少全站規範之「⚠️ 示意模擬模型與技術邊界說明」免責橫幅，把簡化的經驗指數衰減公式包裝為第一性原理保證。
   - **建議修正方向**：於工作台頂部補上標準 `model-disclaimer-banner`。

7. **`ai-nvm-opportunities.html:1601` / `cxl-memory-pooling-simulator.js:155`**
   - **原文摘錄**：「動態提升至 88%–94% (挽回近 40% 雲端資本支出)」／「DRAM at ~$4.5 per GB」
   - **問題類別**：B（無來源定量數字被當作事實）
   - **嚴重度**：低
   - **問題說明**：40% 資本支出節省與 $4.5/GB 定量數字未附帶業界調研或雲端 TCO 模型來源標註。
   - **建議修正方向**：加註「業界雲端 TCO 估算模型參考值」。

### 第一組總結
- **發現數量**：7 項（高嚴重度 3 項、中嚴重度 3 項、低嚴重度 1 項）
- **處置建議**：**需要較大重寫**。
- **總結說明**：本組存在嚴重的概念置換——將不能動態擦寫的 AntiFuse OTP 硬套至動態 CAM 標籤快取，且捏造「缺少 AntiFuse 導致實體層 PCIe LTSSM 斷鏈」之錯誤工程陳述。必須重構快取架構定義，修正協定層錯誤，並補齊免責橫幅。

---

## 第二組：車用 HBM4 巡檢清洗模擬器與車用章節 (TEST 79)

### 具體發現清單

1. **`automotive-hbm4-scrubbing-simulator.js:214, 219` / `automotive-nvm.html:1522, 1652`**
   - **原文摘錄**：「完美達到 ${asilRating} 認證規格」／「achieving ${asilRating}」／「ASIL-D QUALIFIED」／「ISO 26262 ASIL-D Verified」
   - **問題類別**：C（認證/標準套錯對象）、B（未證實定量斷言）
   - **嚴重度**：高
   - **問題說明**：ISO 26262 為車輛系統級功能安全標準，ASIL-D 評定需經完整安全生命週期（Part 2/4/5/8）、FMEDA 失效模式與診斷分析。單一記憶體元件或純前端 JS 數值模擬器，絕不能逕自宣告「完美達到 ASIL-D 認證規格」或「ASIL-D QUALIFIED」；業界規範應表述為「符合 ASIL-D 目標度量設計（Target SPFM ≥ 99%）」或「ASIL-D Ready」。
   - **建議修正方向**：將「ASIL-D QUALIFIED / 完美達到認證規格」降額改寫為「符合 ASIL-D 目標度量設計（ASIL-D Target Metric Met）」，並註明非第三方官方認證。

2. **`automotive-hbm4-scrubbing-simulator.js:185-186`**
   - **原文摘錄**：`const spfmPercent = Math.min(99.99, Math.max(80.0, 100.0 * (1.0 - (totalResidualFit / totalRawFailures))));`
   - **問題類別**：C（標準計算公式套錯）、D（工程簡化失真）
   - **嚴重度**：中
   - **問題說明**：ISO 26262-5 定義之單點故障度量（SPFM）反映安全機制對單點危險故障之診斷覆蓋率（Diagnostic Coverage）。此處直接用 `1 - 殘餘總FIT / 原始總FIT` 作為 SPFM，將所有失效視為單點危險失效，略過了安全失效（Safe faults）與多點失效的標準架構劃分。
   - **建議修正方向**：在註解與界面中明確註明此式為簡化 Heuristic 指標，非標準 FMEDA 計算。

3. **`automotive-hbm4-scrubbing-simulator.js:88-128`**
   - **原文摘錄**：`REPAIR_ARCHITECTURES` 中 `hybrid_tier_scrubbing.repairEfficiency = 0.998`，而 `dynamic_sppr_only` 為 0.940，`legacy_ecc_unmanaged` 為 0.720
   - **問題類別**：A（偏袒特定技術）、B（無來源定量數字）
   - **嚴重度**：中
   - **問題說明**：修復效率數值寫死 0.998，且僅將 AntiFuse hPPR 納為唯一硬體重映射途徑，刻意使 AntiFuse 混合架構在評估中始終勝出。
   - **建議修正方向**：標明修復效率為經驗假設參數，並中立命名硬體修復機制。

4. **`automotive-hbm4-scrubbing-simulator.js:174-175`**
   - **原文摘錄**：`const collisionRate = Math.pow(rawSerFit * 1e-4, 2) * (scrubbingPeriodSec / 1.0);` / `const residualSerFit = collisionRate * (1.0 - arch.repairEfficiency) * 8.5;`
   - **問題類別**：D（數值模型缺乏推導）、B（無來源係數）
   - **嚴重度**：中
   - **問題說明**：雙錯碰撞機率公式中直接人為乘入 `1e-4` 與 `8.5` 縮放因數，缺乏物理與統計推導，屬於純粹的數值湊數（Fudge factors）。
   - **建議修正方向**：註明此公式為雙位元碰撞機率之示意 Heuristic 模型。

5. **`automotive-hbm4-scrubbing-simulator.js:329, 342, 395`**
   - **原文摘錄**：Canvas Mode 1：`fit = (metrics.rawSerFit * 0.08) * s * 0.28;` / `fit = (metrics.rawSerFit * 0.08) * s * 0.002 + metrics.residualHardFit;`；Mode 2：`1.8 * 64 * accel * 0.05`
   - **問題類別**：F（方程式實作與主計算引擎不一致）
   - **嚴重度**：中
   - **問題說明**：Canvas 繪圖中的失效率計算與主計算函式 `calculateAutomotiveHbm4Metrics` 脫鉤。主函式中雙錯碰撞率為 `(rawSerFit)^2 * Ts` 之二次方關係，而 Canvas 繪圖卻採用了一次方線性計算；Mode 2 亦寫死 64GB 容量，忽略使用者所選容量。
   - **建議修正方向**：重構 Canvas 繪圖邏輯，直接調用主計算函式產出之數據。

6. **`automotive-nvm.html:1536, 1639`**
   - **原文摘錄**：「ISO 26262 ASIL-D & AEC-Q100 Grade 2 Analyzer」
   - **問題類別**：C（標準套錯對象）
   - **嚴重度**：中
   - **問題說明**：AEC-Q100 Grade 2 環境溫度定義為 -40°C 至 +105°C。但模擬器中的預設任務情境（如 `l4_robotaxi_extreme` Tj 為 115°C，`heavy_truck_powertrain` Tj 達 125°C、環境 105°C，若加上晶粒溫升已突破 Grade 2 上限，屬 Grade 1 或更高）。標題聲稱為「AEC-Q100 Grade 2」存在溫度規範與情境定義不匹配。
   - **建議修正方向**：更名為「AEC-Q100 車規溫度等級參照分析」並釐清環境與接面溫度界限。

7. **`automotive-nvm.html:1529-1656`**
   - **原文摘錄**：旗艦實驗室 05 章節缺乏免責橫幅
   - **問題類別**：E（違背網站證據紀律）
   - **嚴重度**：中
   - **問題說明**：缺少「⚠️ 示意模擬模型與技術邊界說明」免責橫幅。
   - **建議修正方向**：於章節開頭補上 `model-disclaimer-banner`。

### 第二組總結
- **發現數量**：7 項（高嚴重度 1 項、中嚴重度 6 項）
- **處置建議**：**改寫為示意模型並加註未驗證（局部公式修復）**。
- **總結說明**：基礎物理架構（Arrhenius 與 Coffin-Manson 疲勞）出發點合理，但有「自行宣稱 ASIL-D 認證合格」的標準誤用、AEC-Q100 等級定義模糊，以及 Canvas 繪圖模型與核心計算引擎存在線性 vs 二次方脫鉤的問題。修正認證措辭與 Canvas 繪圖公式即可修復。

---

## 第三組：先進封裝 PDK 模擬器與技術對比章節 (TEST 78)

### 具體發現清單

1. **`advanced-packaging-pdks-simulator.js:267-273`**
   - **原文摘錄**：Mode 1 Canvas：`const candidates = [ { name: 'CoWoS-S (2.5D)', tau: 42.0, bw: 18.0 }, ... { name: 'SoIC-X (3D)', tau: 3.2, bw: 55.0 } ];`
   - **問題類別**：A（結果預先寫死）、F（實作與輸入參數無關）
   - **嚴重度**：高
   - **問題說明**：Canvas Mode 1（D2D 延遲與頻寬圖）完全寫死候選技術清單的固定 tau (ps) 與 bw (Gbps)！使用者在介面上拖曳走線長度或傳輸速率滑桿，Canvas 柱狀圖高度完全不會產生任何改變，純粹繪製靜態死數據，誤導使用者為動態模擬。
   - **建議修正方向**：重寫 Canvas 繪圖常式，使其依據滑桿當前參數動態計算並繪製候選架構數值。

2. **`advanced-packaging-pdks-simulator.js:166` / `technology-comparison.html:3493-3496`**
   - **原文摘錄**：`const totalEnvmBudgetKb = 32;` ／「Base Die 0-Mask eNVM 預算: 32 Kb OTP」
   - **問題類別**：A（結果寫死）、B（無來源定量數字）
   - **嚴重度**：中
   - **問題說明**：無論選擇 CoWoS-S、CoWoS-L、SoIC-X、I-Cube 或 Foveros，也不論堆疊層數與 HBM 數量（4 至 16 顆），Base Die 的 eNVM 預算全部寫死為固定常數 32 Kb，且強制指名 0-Mask AntiFuse OTP，未參與任何參數化計算。
   - **建議修正方向**：改為隨 HBM 堆疊顆數與 PHY 寬度動態加權估算，或明確標示為「典型 32 Kb 參考配置」。

3. **`advanced-packaging-pdks-simulator.js:152-153`**
   - **原文摘錄**：`// Maximum Eye Bandwidth (Gbps per line): limited by 1 / (2.2 * tau)` 對比程式碼 `const maxChannelBwGbps = Math.min(64.0, (1.0 / (2.5 * Math.max(1e-12, tauSec))) * 1e-9);`
   - **問題類別**：F（方程式實作與註解描述不一致）
   - **嚴重度**：低
   - **問題說明**：註解描述為除以 `2.2 * tau`，程式碼實作中卻除以 `2.5 * tau`，存在係數不一致。
   - **建議修正方向**：統一註解與程式碼之常數定義。

4. **`advanced-packaging-pdks-simulator.js:133`**
   - **原文摘錄**：`const effectiveTraceMm = is3D ? Math.min(0.2, traceLengthMm * 0.02) : traceLengthMm;`
   - **問題類別**：D（物理/工程幾何失真）
   - **嚴重度**：中
   - **問題說明**：在 SoIC 3D 銅-銅混合鍵合中，垂直互連為厚度約 10~50 µm（0.01~0.05 mm）之 TSV/Pad，此處直接將水平走線長度滑桿（最高 10mm）乘上 `0.02` 得到最高 0.2 mm（200 µm），幾何維度物理模型不合常理。
   - **建議修正方向**：在 3D 鍵合情境下將垂直連線長度固定為 TSV 實際厚度物理常數（如 20~40 µm）。

5. **`advanced-packaging-pdks-simulator.js:360, 373`**
   - **原文摘錄**：Canvas Mode 2：`const t = p * 0.18;` (2.5D) / `const t = p * 0.03;` (3D)
   - **問題類別**：F（繪圖實作與預設物件不一致）
   - **嚴重度**：中
   - **問題說明**：Canvas Mode 2 溫升曲線直接將熱阻寫死為 0.18 與 0.03，忽略了使用者所選 preset 物件中的 `baseThermalResistanceKW`（例如 CoWoS-L 為 0.14，I-Cube 為 0.20，Foveros 為 0.035）。
   - **建議修正方向**：改為動態引用當前所選 preset 之熱阻參數。

6. **`advanced-packaging-pdks-simulator.js:192-193` / `technology-comparison.html:3517-3518`**
   - **原文摘錄**：「封裝後微凸塊修復高度仰賴 Base Die 內建之 0-Mask AntiFuse OTP 儲存 BIRA 修復向量；晶圓測試需求正由記憶體探針卡廠（如 MJC）向台積電邏輯探針卡供應鏈（如旺矽 MPI、精測 CHPT、Technoprobe）轉移。」
   - **問題類別**：B（商業供應鏈斷言未附來源）、E（偏離中立原則）
   - **嚴重度**：中
   - **問題說明**：將商業採購轉單與特定廠商名單當作技術定論，缺乏權威產業研究或公開文獻支撐。
   - **建議修正方向**：改為客觀技術趨勢描述（如「需由高針數邏輯測試介面支援」），刪除特定廠商轉單斷言。

7. **`technology-comparison.html:3397-3520`**
   - **原文摘錄**：缺少免責橫幅，且 HTML 3412 行預設標籤為 `<strong id="pkg-out-rating">KGD PASS</strong>`
   - **問題類別**：E（違背網站證據紀律）、F（靜態內容與 JS 評級集合不匹配）
   - **嚴重度**：中
   - **問題說明**：缺少 `model-disclaimer-banner`；靜態評級 `KGD PASS` 在 JS 計算結果中根本不存在（JS 返回 `QUALIFIED`、`THERMAL THROTTLING RISK` 等）。
   - **建議修正方向**：補上免責橫幅並校正靜態預設標籤。

### 第三組總結
- **發現數量**：7 項（高嚴重度 1 項、中嚴重度 5 項、低嚴重度 1 項）
- **處置建議**：**需要較大重寫**。
- **總結說明**：Canvas Mode 1 繪圖完全寫死靜態數據、無視滑桿輸入，屬於嚴重的互動功能失效；eNVM 預算寫死 32 Kb 且強套 AntiFuse，走線長度幾何模型存在物理扭曲。需重新綁定畫布資料流與動態計算邏輯。

---

## 第四組：混合鍵合 TSV KGD 模擬器與特殊 NVM 章節 (TEST 77)

### 具體發現清單

1. **`hybrid-bonding-tsv-kgd-simulator.js:104-168, 262-263` / `specialty-nvm.html:2212-2213, 2237`**
   - **原文摘錄**：「必須改用旺矽 (MPI 6223) 或精測 (CHPT 6510) 之無痕微接觸 MEMS 探針卡」／「Switch immediately to MPI (6223) or CHPT (6510) zero-mark MEMS cards.」／「為邏輯測試業者帶來全新且龐大的 HBM 成長動能」
   - **問題類別**：A（偏袒特定廠商）、B（未證實定量宣稱）、E（違背技術百科中立原則）
   - **嚴重度**：高
   - **問題說明**：模擬器直接在結論判定中下達商業指示（「必須立即改用旺矽或精測」），並置入大量台股股票代號（6223.TW、6510.TW）與證券投顧分析用語（「帶來全新且龐大成長動能」）。這完全違背技術知識庫的中立性原則，演變成商業廣告與個股推薦。
   - **建議修正方向**：全面剔除股票代號與「必須改用特定廠商」等商業拉抬文字，改以通用技術分類（如「超低接觸力微懸臂 MEMS 探針架構」）呈現。

2. **`hybrid-bonding-tsv-kgd-simulator.js:224-225`**
   - **原文摘錄**：`const attenuationDb = -20.0 * Math.log10(Math.max(0.01, 1.0 / (1.0 + 2.0 * Math.PI * freqHz * (rAcOhm * cOxFarads))));`
   - **問題類別**：D（物理與電路公式嚴重錯誤）
   - **嚴重度**：高
   - **問題說明**：一階 RC 電路之交流頻率響應振幅應為 $|H(f)| = \frac{1}{\sqrt{1 + (2\pi f RC)^2}}$。此處程式碼存在雙重錯誤：(1) 分母寫成 $1 + 2\pi f RC$，缺少平方與開根號；(2) 衰減量公式前加負號 `-20 * log10(1 / (1 + ...))`，因為真數小於 1 取對數為負，再乘負號後計算出的 `attenuationDb` 變成「正值」（代表增益而非衰減）。
   - **建議修正方向**：修正為標準交流幅頻響應公式：`attenuationDb = 20.0 * Math.log10(1.0 / Math.sqrt(1.0 + Math.pow(2.0 * Math.PI * freqHz * (rAcOhm * cOxFarads), 2)));`（計算結果為負數 dB）。

3. **`hybrid-bonding-tsv-kgd-simulator.js:225`**
   - **原文摘錄**：`const eyeOpeningPercent = Math.max(5.0, Math.min(98.0, 100.0 * Math.exp(-2.0 * Math.PI * freqHz * (rAcOhm * cOxFarads))));`
   - **問題類別**：D（工程簡化失真）
   - **嚴重度**：中
   - **問題說明**：高速眼高開展率在物理上取決於脈衝響應、符號間干擾（ISI）與時脈抖動，直接以指數衰減 $\exp(-2\pi f RC)$ 表述屬於粗略經驗模型，不應稱為第一性原理計算。
   - **建議修正方向**：加註此項為「一階頻寬裕度經驗近似指標」。

4. **`hybrid-bonding-tsv-kgd-simulator.js:231, 238`**
   - **原文摘錄**：`actualMarkDepthNm = probe.scrubMarkDepthNm * Math.pow(forceScaling, 0.75);` / `bondingVoidPpm = Math.min(50000, 2.0 + Math.pow(excessNm, 2.8) * 8.5);`
   - **問題類別**：B（無來源定量公式）、D（未驗證力學模型）
   - **嚴重度**：中
   - **問題說明**：針痕深度按 $0.75$ 次方擴展、空隙率按 $2.8$ 次方飆升，純屬開發者自創之經驗常數，無公開力學文獻或測量數據支撐。
   - **建議修正方向**：標明為幾何力學簡化示意模型，未經實測標定。

5. **`hybrid-bonding-tsv-kgd-simulator.js:440-467`**
   - **原文摘錄**：Canvas Mode 2 `probePoints` 陣列固定寫死五家廠商之接觸力與深度常數
   - **問題類別**：F（實作與使用者輸入脫鉤）
   - **嚴重度**：中
   - **問題說明**：Canvas Mode 2 僅畫出寫死的五家廠商常數點，使用者拖曳接觸力滑桿（`forceSlider`），畫面上既無動態更新點位，亦未顯示使用者當前配置在圖表上的落點。
   - **建議修正方向**：在 Canvas Mode 2 上繪製使用者當前接觸力與針痕深度的動態標記點。

6. **`specialty-nvm.html:2218-2368`**
   - **原文摘錄**：缺少免責橫幅，且 2268 行宣稱「實現零空洞完美鍵合 (flawless zero-void bonding)」
   - **問題類別**：E（違背網站證據紀律）、B（過度承諾）
   - **嚴重度**：中
   - **問題說明**：缺少 `model-disclaimer-banner`；宣稱「零空洞完美鍵合」措辭過強。
   - **建議修正方向**：補上免責橫幅並將宣稱修正為「符合 CMP 凹陷容限預算」。

### 第四組總結
- **發現數量**：6 項（高嚴重度 2 項、中嚴重度 4 項）
- **處置建議**：**需要較大重寫**。
- **總結說明**：本組存在明顯的電路物理公式錯誤（RC 交流幅頻響應公式算錯、dB 符號顛倒），Canvas Mode 2 圖表完全靜態，且正文與結論嚴重充斥商業拉抬與股票代號。必須重寫物理公式並徹底淨化商業廣告語言。

---

## 第五組：HBM4 Base Die 修復探針模擬器與證據卡片 V20 (TEST 76 & TEST 80)

### 具體發現清單

1. **`memory-evidence.html:448-512` (evidence-V20 卡片)**
   - **原文摘錄**：「HBM4 PROBE CARD CONSORTIUM SPECIFICATIONS & FOUNDRY PROCUREMENT SHIFT」／「HBM4 探針卡五大聯盟規格」／表格列出精確針數（>85k, >100k, >110k）、微接觸力（0.28~0.40 gf）、針痕（1.2~1.8 nm）與代工關係（「台積電 12nm/3nm 邏輯 Base Die 認證核心夥伴」）
   - **問題類別**：B（無來源定量數字寫成事實）、C（虛構標準組織）、E（嚴重違背證據紀律）
   - **嚴重度**：高
   - **問題說明**：
     1. **虛構組織**：半導體國際標準組織（IEEE、JEDEC、SEMI）中根本不存在所謂的「HBM4 探針卡聯盟（HBM4 Probe Card Consortium）」，冠以此名誤導讀者為正式產業規範。
     2. **數據缺乏公開佐證**：表格聲稱萬針容量與奈米針痕，整張卡片僅在底部附上旺矽的一件專利（US 10845392B2），該專利純為微懸臂結構專利，完全未提及 >85,000 pins、1.8nm 針痕或台積電 12nm/3nm 認證！其餘四家廠商完全沒有列出任何公開規格出處，直接把推測值偽裝為「已查核原廠催告（VENDOR DISCLOSURE E3）」。
     3. **違背證據紀律**：網站 E3 級證據要求原廠白皮書或產品規格書，此處卻以虛構聯盟名稱拼湊未驗證數據，嚴重違反全站證據準則。
   - **建議修正方向**：將卡片重構為「業界公開專利技術與高密度測試架構趨勢研析」，刪除虛構聯盟名稱，數據明確標記為「模型估算值」，並移除未經原廠證實之排他性代工合作宣稱。

2. **`hbm4-base-die-repair-probe-simulator.js:223, 226`**
   - **原文摘錄**：`const repairEfficiency = preset.baseDieTech === 'dram_base' ? 0.65 : 0.84;` / `const retentionThermalFactor = preset.baseDieTech === 'dram_base' ? 0.88 : 1.00;`
   - **問題類別**：A（結果預先寫死特權）、B（未標示假設參數）
   - **嚴重度**：高
   - **問題說明**：堆疊良率修復計算中，人為給予 DRAM Base Die 0.65 的修復效率與 0.88 的熱留存衰退，而台積電/三星邏輯 Base Die 則給予 0.84 與 1.00。這是標準的硬編碼技術特權，人為拉大 AntiFuse 邏輯 Base Die 的挽回優勢，缺乏實測對照依據。
   - **建議修正方向**：取消依預設字串硬編碼的二元特權數值，改為由可配置之參數計算，並標註為假設情境對比。

3. **`hbm4-base-die-repair-probe-simulator.js:458-464`**
   - **原文摘錄**：Canvas Mode 2 寫死五家廠商之固定曝險比例（Micronics 15%, 旺矽 88%, 精測 92%, Technoprobe 85%, FormFactor 80%）
   - **問題類別**：A（硬編碼偏袒）、F（實作與使用者輸入無關）
   - **嚴重度**：中
   - **問題說明**：Canvas Mode 2 僅繪製硬編碼之固定市佔比例陣列，完全不隨使用者調整針數或良率滑桿變化，且人為大幅偏袒特定台廠（88%~92%）並打壓日廠（15%）。
   - **建議修正方向**：使圖表動態反映針數與架構輸入，移除固定的主觀比例繪圖。

4. **`hbm4-base-die-repair-probe-simulator.js:46-188, 277-281` / `ai-nvm-opportunities.html:1340, 1368`**
   - **原文摘錄**：「全球資本市場與半導體分析師正密切聚焦 FormFactor、Technoprobe、旺矽 (6223) 與中華精測 (6510) 在下一次法說會中對『HBM4 Base Die 邏輯測試』的進度論述...直接享有高速起飛的 HBM 資本支出紅利。」
   - **問題類別**：B（未經證實之商業宣稱）、E（違背中立教學定位）
   - **嚴重度**：中
   - **問題說明**：章節與程式碼註解充斥股票代號、法說會與資本支出紅利等投顧炒股措辭，偏離半導體技術百科的中立教學宗旨。
   - **建議修正方向**：清除法說會、資本支出紅利等金融語言，回歸訊號完整度與測試介面工程挑戰的技術討論。

5. **`ai-nvm-opportunities.html:1349-1500`**
   - **原文摘錄**：缺少免責橫幅，且 1443 行宣稱「0-Mask 260°C 零回彈」
   - **問題類別**：E（違背網站證據紀律）、B（絕對化措辭）
   - **嚴重度**：中
   - **問題說明**：未依照全站規範放置 `model-disclaimer-banner`，且宣稱「零回彈」缺乏附帶封裝條件說明。
   - **建議修正方向**：補上免責橫幅並將宣稱客觀化為「高溫熱預算具備較佳金屬微絲穩定性」。

### 第五組總結
- **發現數量**：5 項（高嚴重度 2 項、中嚴重度 3 項）
- **處置建議**：**需要較大重寫**。
- **總結說明**：evidence-V20 卡片虛構「HBM4 探針卡聯盟規格」，將未公開的萬針與針痕規格偽裝為已查核催告，嚴重牴觸網站證據紀律；模擬器程式碼中亦存在對 DRAM Base Die 的人為特權懲罰，且圖表寫死固定偏袒比例。必須對 evidence-V20 與模擬器核心進行較大幅度的重寫與中立化修復。

---

## 全域總結對照表

| 組別 | 涉及檔案 / 章節 | 問題數量 | 關鍵核心問題 | 處置建議 |
| :--- | :--- | :---: | :--- | :--- |
| **組 1 (TEST 82)** | `cxl-memory-pooling-simulator.js` ＋ `ai-nvm-opportunities.html` | 7 | AntiFuse OTP 錯當動態 Tag Cache；訛稱缺 AntiFuse 觸發 PCIe LTSSM 斷鏈；誇大 20ns 零崩潰保證。 | **需要較大重寫** |
| **組 2 (TEST 79)** | `automotive-hbm4-scrubbing-simulator.js` ＋ `automotive-nvm.html` | 7 | 模擬器自封「ASIL-D QUALIFIED」；SPFM 簡化失真；Canvas 繪圖公式與主計算引擎脫鉤（一次方 vs 二次方）。 | **改寫為示意模型並加註未驗證**（局部公式修復） |
| **組 3 (TEST 78)** | `advanced-packaging-pdks-simulator.js` ＋ `technology-comparison.html` | 7 | Canvas Mode 1 完全寫死常數無視滑桿互動；OTP 預算硬編碼 32 Kb 且指定 AntiFuse；3D 走線長度幾何失真。 | **需要較大重寫** |
| **組 4 (TEST 77)** | `hybrid-bonding-tsv-kgd-simulator.js` ＋ `specialty-nvm.html` | 6 | RC 交流幅頻響應公式分母漏平方且 dB 算成正增益；Canvas Mode 2 靜態死碼；充斥股票代號與「必須改用特定廠商」商業偏袒。 | **需要較大重寫** |
| **組 5 (TEST 76/80)** | `hbm4-base-die-repair-probe-simulator.js` ＋ `ai-nvm-opportunities.html` ＋ `evidence-V20` | 5 | evidence-V20 虛構「HBM4 探針卡聯盟規格」違反證據紀律；DRAM Base Die 遭人為特權懲罰；充斥證券投顧炒股用語。 | **需要較大重寫** |

以上報告供接案主控端審閱及後續重構規劃。本報告維持唯讀審查紀律，未修改任何專案檔案。