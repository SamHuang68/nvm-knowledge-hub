// 以穩定設定檔 ID 與欄位維護繁中；數值與證據界線沿用工程原稿。
export const profileZh = {
  "sram_puf_secure_storage": {
    "profile": "SRAM PUF 安全儲存",
    "family": "SRAM PUF + 1T OTP + AES-256",
    "contract": "靜態時不保留根金鑰；運作時重新產生暫時性根金鑰；OTP 儲存加密密文",
    "nodeLens": "相容邏輯 CMOS；原稿列為已驗證的 TSMC 節點：N7、N6、N5、N4P、N3P、N2 GAA、N7A、N5A",
    "updateModel": "開機時動態產生＋線速 AES-256-XTS 執行＋即時清除",
    "strongestFit": "AI 加速器、LLM KV 快取加密、小晶片晶粒間信任根、車用 ADAS",
    "boundary": "需要輔助資料完整性檢查與硬體信任邊界防護",
    "evidenceStatus": "1.5B+ 台裝置（供應商彙總的產品組合聲稱）· PSA L3 · SESIP L3 · AEC-Q100 G1",
    "latency": "次微秒等級 (<1 µs)",
    "busExposure": "無（單晶粒內部邊界）",
    "bomCost": "無額外光罩（標準 CMOS）",
    "evidenceReview": {
      "scope": "1.5B+ 為供應商彙總的產品組合聲稱，不代表此安全儲存實作的出貨量。節點可用性、認證、延遲與組合架構，均需另附特定產品證據。",
      "sources": []
    }
  },
  "conventional_otp": {
    "profile": "傳統純 AntiFuse OTP",
    "family": "反熔絲 OTP（原始／未加密）",
    "contract": "永久性氧化層物理崩潰；施加偏壓時可讀取靜態位元值",
    "nodeLens": "廣泛適用於晶圓代工邏輯節點；原稿主流範圍為 180nm 至 3nm",
    "updateModel": "單次寫入（不可逆物理崩潰）；無法輪替金鑰",
    "strongestFit": "晶圓識別碼、類比微調、非敏感功能組態、基本開機指標",
    "boundary": "可能受到 FIB／PVC 探測（RP2350 威脅模型）與功耗側通道分析影響",
    "evidenceStatus": "累計出貨超過 100 億顆 · 晶圓代工基準",
    "latency": "低 (10-50 ns)",
    "busExposure": "晶片內匯流排（暫存器可能受突波攻擊）",
    "bomCost": "低（標準巨集）",
    "evidenceReview": {
      "scope": "出貨總量、節點範圍與時序均屬技術家族的示意比較。必須指定巨集與驗證報告；單一 RP2350 攻擊不能證明所有 OTP 實作都存在相同弱點。",
      "sources": []
    }
  },
  "otp_puf_tunneling": {
    "profile": "量子穿隧型 OTP-PUF",
    "family": "量子穿隧／高電壓 OTP-PUF",
    "contract": "永久介電質擊穿穿隧路徑；啟動無須輔助資料（無電荷捕捉）",
    "nodeLens": "需要依晶圓代工廠與節點進行專屬高電壓寫入特性驗證",
    "updateModel": "於晶圓測試時單次註冊；無須模糊擷取器的靜態物理回應",
    "strongestFit": "完全不允許儲存輔助資料時的晶粒唯一身分",
    "boundary": "永久物理導電性需要熱與 FIB 竄改驗證",
    "evidenceStatus": "100M+ 出貨 · PSA L3 · SESIP L3 · AEC-Q100 G0/G1 沿革",
    "latency": "低 (20-100 ns)",
    "busExposure": "晶片內匯流排",
    "bomCost": "低至中等（依晶圓代工平台而異）",
    "evidenceReview": {
      "scope": "介電層崩潰穿隧是本原稿描述的機制，並非對所有 OTP PUF 的已驗證判定。出貨總量、輔助資料需求與認證沿革，均需指定產品的來源。",
      "sources": []
    }
  },
  "discrete_secure_element": {
    "profile": "獨立安全元件 (SE)",
    "family": "專用安全晶片（例如 NXP SE050）",
    "contract": "內含防竄改屏蔽 EEPROM／Flash 的安全智慧卡微控制器",
    "nodeLens": "獨立外部封裝；安裝於主 SoC 旁的 PCB",
    "updateModel": "透過序列匯流排執行安全命令 APDU 交易",
    "strongestFit": "IoT 閘道器、支付 POS 終端、智慧電表、低頻寬密碼運算卸載",
    "boundary": "外部 I2C／SPI 匯流排暴露於板級探測、中間人與重放攻擊",
    "evidenceStatus": "共同準則 EAL6+ · FIPS 140-3",
    "latency": "高（10-50 ms 序列傳輸額外延遲）",
    "busExposure": "高（外部 PCB 走線側錄）",
    "bomCost": "高（專用晶片＋PCB 面積＋組裝）",
    "evidenceReview": {
      "scope": "SE050 是具名範例，不能據此認定所有獨立安全元件均具有相同認證、記憶體技術或延遲。應核對確切元件、證書與安全通道威脅模型。",
      "sources": []
    }
  },
  "dedicated_hsm": {
    "profile": "硬體安全模組 (HSM)",
    "family": "板級／PCIe HSM 模組",
    "contract": "主動實體竄改偵測防護範圍內的電池備援 SRAM 金鑰儲存庫",
    "nodeLens": "具有專用密碼處理器的 PCIe 擴充卡或機架式設備",
    "updateModel": "經 mTLS/SPDM 驗證的網路／PCIe PKCS#11／KMIP 服務請求",
    "strongestFit": "資料中心根憑證機構、雲端金鑰管理服務 (KMS)、銀行核心系統證明",
    "boundary": "無法整合至單晶粒 SoC；PCIe 延遲不利於記憶體加密",
    "evidenceStatus": "FIPS 140-2 第 4 級 · PCI-PTS",
    "latency": "中高（每次 RPC 為 1-10 ms）",
    "busExposure": "PCIe／網路 TLS 邊界",
    "bomCost": "極高（每顆 $1,000 - $20,000 以上）",
    "evidenceReview": {
      "scope": "電池備援儲存、實體整合、認證、RPC 延遲與價格均屬情境假設，不能視為所有 HSM 產品的共同特性。",
      "sources": []
    }
  },
  "embedded_flash": {
    "profile": "嵌入式快閃記憶體 (eFlash)",
    "family": "浮動閘極／電荷捕捉式 eFlash",
    "contract": "受控韌體更新；區塊抹除與磁區寫入",
    "nodeLens": "在 ≤28nm 時因高光罩數（10-15 層）受到經濟與物理限制",
    "updateModel": "具簽章的系統內韌體更新，並搭配可復原的雙儲存區分割",
    "strongestFit": "成熟製程 (40nm-180nm) 的車用 MCU 與 IoT 微控制器",
    "boundary": "不可將 28nm 商業化邊界視為物理定律，但光罩成本占主導因素",
    "evidenceStatus": "AEC-Q100 · 成熟製程主流",
    "latency": "中等（讀取 15-30 ns、寫入為 ms 等級）",
    "busExposure": "內部匯流排",
    "bomCost": "高光罩成本（增加 10-15 層光罩）",
    "evidenceReview": {
      "scope": "節點經濟性、額外光罩、時序與車規驗證取決於晶圓代工製程和巨集。28nm 的比較不能當作普遍的技術限制。",
      "sources": []
    }
  },
  "mram_reram": {
    "profile": "新興非揮發性記憶體 (MRAM / ReRAM)",
    "family": "新興 BEOL NVM（STT-MRAM／OxRAM ReRAM）",
    "contract": "具高耐寫能力、可依位元組定址的快速持久狀態",
    "nodeLens": "先進晶圓代工後段模組（部分代工廠可提供 22nm、16nm、12nm、N7）",
    "updateModel": "無須區塊抹除的直接記憶體映射寫入",
    "strongestFit": "低延遲持久快取、AI 邊緣推論權重儲存、無電池感測器",
    "boundary": "MRAM 的磁場敏感度與 ReRAM 資料保存分布尾端需要資格驗證",
    "evidenceStatus": "晶圓代工資格驗證 (22nm/16nm)",
    "latency": "極低（讀取／寫入 10-30 ns）",
    "busExposure": "內部匯流排",
    "bomCost": "中等（增加 3-5 層 BEOL 光罩）",
    "evidenceReview": {
      "scope": "節點可用性、晶圓代工驗證、光罩數與時序，需要分別核對 MRAM／ReRAM 及各代工廠的證據。路線圖目標或可供設計公告不等於量產。",
      "sources": []
    }
  },
  "cpo_chiplet_nvm": {
    "profile": "CPO 與 3D 小晶片 NVM 微調",
    "family": "晶粒內受控 MTP／反熔絲 OTP",
    "contract": "有限次可變的光學相位／加熱器校準與 UCIe 晶粒間工作階段金鑰",
    "nodeLens": "CoWoS／SoIC／COUPE 異質先進封裝與 TSMC 3DFabric",
    "updateModel": "原子性校準提交＋冷啟動即時清除",
    "strongestFit": "51.2T/102.4T CPO 交換器、UCIe 2.0 晶粒間連結、光學運算互連 (OCI)",
    "boundary": "需要 DAC 精度校準與高溫熱循環裕量",
    "evidenceStatus": "800G/1.6T 晶圓代工驗證 · OCP OIF · UCIe 2.0",
    "latency": "讀取低於 10 ns，原子性寫入",
    "busExposure": "無（晶粒內類比／互連邊界）",
    "bomCost": "標準 CMOS 無須增加光罩",
    "evidenceReview": {
      "scope": "封裝名稱與介面標準僅提供應用背景，不能證明此 NVM 微調架構、吞吐量、時序或零額外光罩聲稱已通過晶圓代工驗證。",
      "sources": []
    }
  },
  "bcd_power_pmic_trim": {
    "profile": "BCD 電源 PMIC 與 LED 電性微調",
    "family": "AntiFuse OTP（固定）／NeoMTP（浮動閘 MTP）",
    "contract": "OTP 固定或 NeoMTP 可更新的類比 Vref 能隙（±0.5%）與振盪器校準；多通道 LED 平衡",
    "nodeLens": "0.18µm、0.13µm、90nm、55nm BCD 晶圓代工平臺（VIS、TSMC、PSMC、UMC）",
    "updateModel": "晶圓測試（CP）與最終測試（FT）微調；OTP 寫入後固定；NeoMTP 依已驗證 IP 預算更新",
    "strongestFit": "PMIC、USB-PD 3.1 240W EPR 控制器、BLDC 馬達驅動器、BMIC 16-24 電芯 AFE",
    "boundary": "需要驗證高達 150°C-175°C 車用接面溫度下的高溫資料保存",
    "evidenceStatus": "AEC-Q100 Grade 0 · 多家晶圓代工 BCD 基準",
    "latency": "低（讀取 15-30 ns）",
    "busExposure": "無（內部類比電阻梯微調邊界）",
    "bomCost": "零額外光罩（省去 10-15 層 eFlash 光罩，節省 30-50%）",
    "evidenceReview": {
      "scope": "所列力旺頁面支援 NeoMTP 的浮動閘與可改寫記憶體機制，並未證明本原稿列出的所有 BCD 平臺、微調精度、Grade 0 驗證、時序或節省成本百分比。",
      "sources": [
        {
          "claim": "浮動閘寫入與抹除支援可改寫的 NeoMTP 機制；確切操作預算取決於選定 IP。",
          "limitation": "此來源未證實原稿的平臺清單、認證等級、精度、延遲或節省成本。"
        }
      ]
    }
  },
  "cis_dram_matrix_repair": {
    "profile": "CIS 與 DRAM 矩陣缺陷修復",
    "family": "AntiFuse OTP 硬體 FuseBox 與 PPR",
    "contract": "將缺陷位元單元／像素位址非揮發性重新映射至備援列／行",
    "nodeLens": "先進 DRAM（DDR5、HBM3e）與 3D 堆疊 CIS（TSMC 3DFabric、Cu-Cu 混合接合）",
    "updateModel": "BIST 自主掃描＋BIRA 最小頂點覆蓋＋FuseBox OTP 燒錄",
    "strongestFit": "JEDEC 硬體封裝後修復（hPPR）、200MP 行動裝置 CIS、資料中心 AI 伺服器記憶體",
    "boundary": "受實體備援列／行數量與巨集高度（<250µm）限制",
    "evidenceStatus": "JEDEC JESD79-5 DDR5 · JESD238 HBM3e · 原稿聲稱已量產驗證",
    "latency": "晶粒內零週期位址重新導向",
    "busExposure": "內部記憶體位址解碼器覆寫",
    "bomCost": "極低矽面積額外成本（總晶粒面積 <0.5%）",
    "evidenceReview": {
      "scope": "標準名稱僅描述應用背景；容量、尺寸、時序、面積額外成本與量產狀態，需要確切記憶體元件、標準版本及實作證據。",
      "sources": []
    }
  },
  "hv_display_ddic_demura": {
    "profile": "高壓顯示驅動晶片 (OLED / LCD DDIC)",
    "family": "高密度嵌入式 MTP／純邏輯 OTP",
    "contract": "多點 Gamma 2.2 R-DAC 校準、Vcom 5mV 抗閃爍、2D De-Mura 增益 LUT",
    "nodeLens": "80nm-55nm HV、40nm-28nm eHV、16nm FinFET eHV（TSMC、UMC、VIS、Nexchip）",
    "updateModel": "工廠光學相機校準寫入；動態更新率自適應索引",
    "strongestFit": "AMOLED 智慧型手機 DDIC、車用座艙顯示器、Micro-OLED AR／VR 系統",
    "boundary": "必須承受高電壓擺幅（+20V/-15V 閘極電壓軌、8V-12V 源極線）",
    "evidenceStatus": "商用 AMOLED 標準 · 原稿聲稱 120Hz-144Hz 量產",
    "latency": "次微秒影格層級 LUT 讀取",
    "busExposure": "內部顯示管線像素串流",
    "bomCost": "專用 eHV 平臺零額外光罩",
    "evidenceReview": {
      "scope": "電壓軌、解析度、更新率、製程可用性與光罩假設均屬設計範例；此設定檔未確立具名 DDIC 的驗證或量產結果。",
      "sources": []
    }
  },
  "eink_ultra_hv_mtp_otp": {
    "profile": "電子紙超高壓驅動晶片 (40V-50V / 110HV)",
    "family": "演進階段採 MTP ➔ 成熟階段採純邏輯 AntiFuse OTP",
    "contract": "多維電泳驅動波形 LUT 與溫度補償",
    "nodeLens": "110HV、90HV、80eHV 特種 CMOS（VIS、UMC、Nexchip；原稿因漏電排除 BCD）",
    "updateModel": "色彩配方演進時採 MTP（32Kb-64Kb）；量產成熟時採 OTP（高度 <250µm）",
    "strongestFit": "電子貨架標籤（ESL）、全彩電子紙（Spectra 6、Kaleido 3）、戶外看板",
    "boundary": "5-10 年鈕扣電池壽命嚴格要求零待機耗電；晶粒高度嚴格小於 250µm",
    "evidenceStatus": "電子紙面板夥伴標準 · Fitipower／UltraChip／Solomon 基準",
    "latency": "快速多影格波形索引（<50 ns）",
    "busExposure": "內部驅動波形產生引擎",
    "bomCost": "零額外光罩；省去獨立外部 SPI Flash 以降低 BOM 成本",
    "evidenceReview": {
      "scope": "驅動平臺、記憶體容量、電池壽命、高度限制與具名供應商均屬應用假設，需要特定產品來源。這些敘述不能確立通用的面板夥伴標準。",
      "sources": []
    }
  }
};
