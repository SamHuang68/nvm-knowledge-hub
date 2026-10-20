# NVM-Hub Round 9–12 唯讀審查報告（同供應商隔離審查）

本審查針對 Round 9–12 新增之四組模擬器與相關 HTML/總帳內容進行逐行審查。審查聚焦於：偏袒寫死 (A)、無來源定量宣稱 (B)、標準/認證套錯 (C)、物理/工程公式錯誤 (D)、證據紀律矛盾 (E) 以及實作與註解不一致 (F)。

---

## 第一組：後量子密碼信任根與金鑰儲存總帳 (Round 12)
**審查檔案**：
- `pqc-hardware-rot-ledger-simulator.js`
- `security-assurance.html` (`#pqc-storage-section`)
- `memory-evidence.html` (`#evidence-V21`)

### 具體發現清單
1. **`pqc-hardware-rot-ledger-simulator.js:138-148`**
   - **原文摘錄**：`if (isSeedExpansion) { mtdTraces *= twinCellFactor; } else { mtdTraces *= 0.25; }` (twinCellFactor=45)
   - **問題類別**：A（偏袒特定技術／結果人為灌水）
   - **嚴重度**：中
   - **建議修正方向**：應改由實體 SNR 與漏洩模型計算，或註明為示意對比權重而非第一性原理 MTD。

2. **`pqc-hardware-rot-ledger-simulator.js:156-158`**
   - **原文摘錄**：`完全符合 NIST FIPS 203/204 與 FIPS 140-3 信任根標準。`
   - **問題類別**：B、C（標準套錯對象、無來源宣稱完全符合）
   - **嚴重度**：高
   - **建議修正方向**：移除「完全符合 FIPS 140-3」之絕對宣稱，修正為密碼模組層級評估考量。

3. **`pqc-hardware-rot-ledger-simulator.js:127-130`**
   - **原文摘錄**：`const fSquareUm2 = Math.pow(node * 1e-3, 2); const bitcellAreaUm2 = 25 * fSquareUm2;`
   - **問題類別**：D（物理或工程錯誤公式）
   - **嚴重度**：中
   - **建議修正方向**：先進節點（<7nm）Feature Size 不再等於節點名稱，應改用 CPP×MMP 估算或明確標註為理想微縮示意模型。

4. **`pqc-hardware-rot-ledger-simulator.js:136-140`**
   - **原文摘錄**：註解 `~40x`、`10^(2 * order)`；實作 `twinCellFactor = 45;`、`1.8 * maskingOrder`
   - **問題類別**：F（方程式實作與註解描述不一致）
   - **嚴重度**：低
   - **建議修正方向**：同步註解之理論倍率與實作指數常數。

5. **`security-assurance.html:834-835, 879-880`**
   - **原文摘錄**：`第一性原理 PQC 密碼工程 · 信任根金鑰儲存試算器`
   - **問題類別**：E（缺少免責橫幅、誇大第一性原理）
   - **嚴重度**：中
   - **建議修正方向**：補上「示意模擬模型與技術邊界說明」免責橫幅，移除第一性原理誇大措辭。

6. **`security-assurance.html:858-860`**
   - **原文摘錄**：`晶圓測試時間 (CP) < 15 ms / die vs > 850 ms / die`、`FIPS 140-3 Level 4 / SESIP L5`
   - **問題類別**：B、C（無來源定量數字、認證標準套錯對象）
   - **嚴重度**：高
   - **建議修正方向**：移除 Level 4 與 SESIP L5 標籤，將 CP 時間改為典型估算範圍並註明測試條件。

7. **`memory-evidence.html:541-573` (evidence-V21)**
   - **原文摘錄**：`全同態種子解封裝 + 雙胞差動 (MTD > 1.0e8)`、`MTD > 1.5e7`
   - **問題類別**：B、D（無來源定量數字、術語混亂錯誤）
   - **嚴重度**：中
   - **建議修正方向**：修正 ML-DSA 數位簽章術語（非解封裝，非全同態），並將精確 MTD 標註為理論估算上限。

8. **`memory-evidence.html:519` (evidence-V21)**
   - **原文摘錄**：`本總帳實證揭露業界主流的「混合分層金鑰封裝架構」...`
   - **問題類別**：B、E（宣稱實證揭露但無實際晶片測量報告）
   - **嚴重度**：中
   - **建議修正方向**：將「實證揭露」修訂為「架構模型評估」以符合證據紀律。

### 第一組總結
- **問題數量**：8 項（高嚴重度 2 項、中嚴重度 5 項、低嚴重度 1 項）
- **建議處置**：**改寫為示意模型並加註未驗證**（需修正 FIPS/SESIP 套錯認證、修正 ML-DSA 術語、補齊免責橫幅並平實化 MTD 權重計算）。

---

## 第二組：極限航太抗輻照與 AntiFuse 歐姆微絲模擬器 (Round 11)
**審查檔案**：
- `rad-hard-nvm-simulator.js`
- `security-assurance.html` (`#rad-hard-nvm-section`)

### 具體發現清單
1. **`rad-hard-nvm-simulator.js:85-86, 197-201`**
   - **原文摘錄**：`if (tech.id === 'antifuse_ohmic') { orbitFitPerMbit = 0.0; }`、`sigmaSat: 0.0`
   - **問題類別**：A、D（結果直接寫死、忽視周邊電路物理）
   - **嚴重度**：高
   - **建議修正方向**：移除 `orbitFitPerMbit = 0.0` 寫死邏輯，納入周邊存取與控制 CMOS 電路之非零輻照截面積與失效率。

2. **`rad-hard-nvm-simulator.js:211-214`**
   - **原文摘錄**：`assuranceRating = 'CLASS_S_HERMETIC_IMMUNE'; verdictZh = '【極限航太 Class-S 認證】... 完全免疫（SEU 截面積 = 0，失效率 0.0 FIT）'`
   - **問題類別**：A、C、E（結果寫死、認證套錯對象、宣稱完全免疫）
   - **嚴重度**：高
   - **建議修正方向**：移除 Class-S 認證宣稱，將「完全免疫」修訂為「位元單元本體無電荷流失，巨集整體仍受周邊電路牽制」。

3. **`rad-hard-nvm-simulator.js:170-173`**
   - **原文摘錄**：`remainingMarginMv = initialSenseMarginMv * (1.0 - (dose / 10000) * 0.01);`
   - **問題類別**：A、D（偏袒特定技術、公式缺乏物理依據）
   - **嚴重度**：中
   - **建議修正方向**：標明為唯象示意比較公式，不可包裝為第一性原理實測數據。

4. **`rad-hard-nvm-simulator.js:142 vs 200`**
   - **原文摘錄**：註解宣稱能譜積分 `Integral[ σ(LET) * dΦ/dLET ]`，實作卻為單點乘積 `seuCrossSection * preset.protonFlux * 1e6 * 3600 * 1e9 * 1e-4`
   - **問題類別**：F（方程式實作與註解描述不一致）
   - **嚴重度**：低
   - **建議修正方向**：將註解改為單點能通量近似說明，或落實微分離子譜積分計算。

5. **`security-assurance.html:613-614, 636-640`**
   - **原文摘錄**：`提供真正的零位元軟錯誤（SEU-Immune）與兆拉德級抗電離生存保證。`、`完全免疫 (σ = 0)`、`Class-S 宇航級（深空任務首選）`
   - **問題類別**：B、C、E（無來源定量宣稱、認證套錯對象、宣稱完全免疫）
   - **嚴重度**：高
   - **建議修正方向**：刪除「完全免疫」與「Class-S 認證」宣稱，客觀闡述微絲物理優勢與巨集級抗輻邊界。

6. **`security-assurance.html:663`**
   - **原文摘錄**：商用浮閘 eFlash 標示為 `地面商規（禁止航太飛行）`
   - **問題類別**：C、E（措辭過強、虛構禁用標準）
   - **嚴重度**：低
   - **建議修正方向**：改寫為客觀陳述「未抗輻加固之商規標準（高輻射軌道易早期失效）」。

7. **`security-assurance.html:674-676, 683-685`**
   - **原文摘錄**：`第一性原理輻照物理 · 歐姆微絲抗電離模擬器`、`MIL-STD-883 / ESA 5010 標準驗證`
   - **問題類別**：C、E（標準套錯、缺少免責橫幅）
   - **嚴重度**：高
   - **建議修正方向**：移除標準驗證宣稱，補上「示意模擬模型與技術邊界說明」免責橫幅。

### 第二組總結
- **問題數量**：7 項（高嚴重度 4 項、中嚴重度 1 項、低嚴重度 2 項）
- **建議處置**：**需要較大重寫**（此組重蹈 Round 13「0% 凍結率」覆轍，將 AntiFuse 軌道失效率寫死為 0.0 FIT 並套用 Class-S 認證，必須重構模型以考量周邊 CMOS 電路之真實輻射脆弱性）。

---

## 第三組：次 2nm BSPDN eNVM IR-Drop 與熱物理模擬器 (Round 10)
**審查檔案**：
- `bspdn-envm-ir-drop-simulator.js`
- `memory-physics.html` (`#bspdn-envm-simulator-root`)

### 具體發現清單
1. **`bspdn-envm-ir-drop-simulator.js:39, 179` ＋ `memory-physics.html:2654, 2678`**
   - **原文摘錄**：`晶圓減薄與厚銅散熱使接面熱點降低 ... 熱阻壓抑 22 K/W`、`Backside massive Cu layer acts as integrated heat sink`、`48.5 K/W (-28 K/W)` vs `76.5 K/W (Thermal trapping)`
   - **問題類別**：D（物理上嚴重錯誤的陳述與顛倒事實）
   - **嚴重度**：高
   - **建議修正方向**：修正熱物理陳述；業界與文獻已知 BSPDN 因移除厚矽基板並引入背面介電層，其主要瓶頸為**熱阻增加與散熱惡化**，絕非宣稱之熱阻降低 28 K/W。

2. **`bspdn-envm-ir-drop-simulator.js:160-164`**
   - **原文摘錄**：`let writeYield = 99.9999; // 6-sigma default`
   - **問題類別**：A、B（結果寫死、虛構 6-Sigma 良率保證）
   - **嚴重度**：中
   - **建議修正方向**：註明為無製程變異下的理想上限值，移除寫死的 99.9999% 與 6-Sigma 絕對宣稱。

3. **`bspdn-envm-ir-drop-simulator.js:101 vs 137-138`**
   - **原文摘錄**：註解宣稱 `(I_rms^2 * R_macro + P_switching) * theta_th`，實作僅為 `(iPeak * Vdd) * dutyCycle * thermalResistance`
   - **問題類別**：F（方程式實作與註解描述不一致）
   - **嚴重度**：低
   - **建議修正方向**：修改註解公式為簡化平均功耗模型。

4. **`memory-physics.html:2654, 2673-2704`**
   - **原文摘錄**：表格直接將 TSMC A16 (1.85Ω, 48.5K/W)、Intel 14A、Samsung SF1.4 等未量產埃米製程數據列為已確定之精確數值（-87%, 22.2mV 等）
   - **問題類別**：B（無公開來源定量數字被當作事實）
   - **嚴重度**：中
   - **建議修正方向**：表格顯著標示為「業界論文與公開演講推估示意值，非代工廠保證規範」。

5. **`memory-physics.html:2644-2651`**
   - **原文摘錄**：`物理模型 09`、`第一性原理數值求解`
   - **問題類別**：E（缺少免責橫幅、誇大第一性原理）
   - **嚴重度**：中
   - **建議修正方向**：補齊「示意模擬模型與技術邊界說明」免責橫幅，說明本模型為集總參數 (Lumped RLC) 示意試算。

### 第三組總結
- **問題數量**：5 項（高嚴重度 1 項、中嚴重度 3 項、低嚴重度 1 項）
- **建議處置**：**需要較大重寫**（散熱與熱阻的物理因果完全相反，將 BSPDN 已知的散熱劣勢扭曲為熱阻下降 28 K/W 與整合熱沉，屬於嚴重的半導體物理事實錯誤，必須徹底重寫熱分析模型）。

---

## 第四組：CPO 矽光波導熱漂移與 MTP 相位微調模擬器 (Round 9)
**審查檔案**：
- `cpo-optical-trim-simulator.js`
- `specialty-nvm.html` (`#cpo-optical-trim-simulator-root`)

### 具體發現清單
1. **`cpo-optical-trim-simulator.js:86, 99, 112, 157-163`**
   - **原文摘錄**：`dacAccuracyFactor`（MTP=0.98, AntiFuse=0.88, Active Heater=0.70）；`if (!policy.rewritable && dt > 20.0) { residualPhaseErrorRad += (rawPhaseDriftRad * 0.18); }`
   - **問題類別**：A、D（偏袒特定技術、假造 DAC 精度係數）
   - **嚴重度**：高
   - **建議修正方向**：移除人為假造的 NVM DAC 精度因子（DAC 精度由類比電路決定，非 NVM 種類），並將預設值設定客觀化。

2. **`cpo-optical-trim-simulator.js:111, 178-180 vs 26`**
   - **原文摘錄**：選擇傳統加熱器時，`activeHeaterPower (28.0) - techPower (26.5) = savedTuningPower (0.10 W)`
   - **問題類別**：D、F（邏輯矛盾與代數漏洞）
   - **嚴重度**：中
   - **建議修正方向**：修正功耗計算邏輯，當選擇傳統加熱器基準時，節省功耗應嚴格歸零 (0.0 W / 0%)。

3. **`specialty-nvm.html:3930-3932, 3939-3940`**
   - **原文摘錄**：`第一性原理物理模型`、`可杜絕傳統加熱器...靜態發熱死鎖，確保極限溫差下消光比 > 12 dB 與次皮秒級眼圖抖動。`
   - **問題類別**：B、E（措辭過強、宣稱絕對杜絕與保證、缺少免責橫幅）
   - **嚴重度**：高
   - **建議修正方向**：刪除「杜絕」、「確保」等絕對保證詞彙，補齊「示意模擬模型與技術邊界說明」免責橫幅。

4. **`specialty-nvm.html:4070`**
   - **原文摘錄**：`TSMC COUPE 3D · 10K~100K 閉迴路校準`
   - **問題類別**：C（標準／晶圓廠商標套錯對象）
   - **嚴重度**：中
   - **建議修正方向**：修訂為「參考 TSMC COUPE 3D 封裝熱架構情境」，避免引人誤解為晶圓廠官方校準背書。

5. **`cpo-optical-trim-simulator.js:174`**
   - **原文摘錄**：`jitterDegradationPs = 0.65 + (residualPhaseErrorRad * 3.8);`
   - **問題類別**：D（工程經驗公式未加標註）
   - **嚴重度**：低
   - **建議修正方向**：加註「簡化經驗推估模型」註解。

### 第四組總結
- **問題數量**：5 項（高嚴重度 2 項、中嚴重度 2 項、低嚴重度 1 項）
- **建議處置**：**改寫為示意模型並加註未驗證**（需修復傳統加熱器自身相減省電的代數 Bug、統一各技術 DAC 精度因子，並補齊免責橫幅）。

---

## 全局審查總結與建議行動順位
1. **急迫重寫（高物理/工程真實性風險）**：
   - **第 3 組 BSPDN 模擬器**：散熱物理因果反轉（將熱阻惡化寫成降低 28 K/W），建議重新定義為電氣 IR-drop 增益與熱阻挑戰之折衷模型。
   - **第 2 組 Rad-Hard 模擬器**：再度發生將 AntiFuse 寫死為 0 FIT、宣稱 Class-S 認證與完全免疫，需將周邊 CMOS 控制電路之敏感性納入考量。
2. **模型規格與邏輯修訂**：
   - **第 4 組 CPO 模擬器**：修復加熱器省電漏洞，移除依 NVM 假造之 DAC 精度因子。
   - **第 1 組 PQC 模擬器**：移除 FIPS 140-3 Level 4 / SESIP L5 標籤，修正 ML-DSA 術語並平實化 MTD 倍率。
3. **全局橫幅補齊**：
   - 四組頁面皆缺少標準的「示意模擬模型與技術邊界說明」免責橫幅，應統一比照 Round 13–16 修復模式補齊。