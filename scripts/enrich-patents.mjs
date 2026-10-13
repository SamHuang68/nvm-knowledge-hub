import fs from 'node:fs';
import path from 'node:path';

const file = path.resolve('data/nvm-vendor-patent-maps.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// 專利詳細狀態與分類對照表
const patentEnrichments = {
  // === 力旺 eMemory ===
  'US6678190B2': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2022-12-19',
    patentCategory: '操作方法項 (Method / Operation)',
    patentCategoryEn: 'Method / Operation',
    generation: '奠基第一代 (Gen-1 Foundational)',
    generationEn: 'Gen-1 Foundational',
    ftoStatus: '本專利保護期已於 2022 年 12 月屆滿 20 年，其核心技術已進入公有領域 (Public Domain)。全球晶圓代工廠與晶片設計商可自由實施其無控制閘極串聯 PMOS 之 CHEI 編程架構，無侵權風險。',
    ftoStatusEn: 'Expired in December 2022 after full 20-year term; entered the public domain. Semiconductor foundries and IC designers may freely practice the 2-PMOS CHEI programming methodology without patent infringement liability.'
  },
  'US6914825B2': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2022-12-19',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 Foundational)',
    generationEn: 'Gen-1 Foundational',
    ftoStatus: '已於 2022 年 12 月屆滿過期進入公有領域。其利用 PMOS 浮動閘極保留負電荷以降低臨界電壓之單元結構特徵，已不受專利排他權約束。',
    ftoStatusEn: 'Expired in December 2022; entered public domain. The structural claim defining negative charge storage in PMOS floating gate to lower threshold voltage is now open for public implementation.'
  },
  'US6920067B2': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2023-05-23',
    patentCategory: '製程整合項 (Process Integration)',
    patentCategoryEn: 'Process Integration',
    generation: '奠基第一代 (Gen-1 Foundational)',
    generationEn: 'Gen-1 Foundational',
    ftoStatus: '已於 2023 年 5 月屆滿過期進入公有領域。其「共用標準 CMOS I/O 電晶體氧化層達成 0-Mask」之製程特徵已無專利排他權。',
    ftoStatusEn: 'Expired in May 2023; entered public domain. The zero-mask fabrication concept sharing standard CMOS I/O gate oxide is now free to operate.'
  },
  'US8514614B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2031-09-29',
    patentCategory: '操作方法項 (Method / Operation)',
    patentCategoryEn: 'Method / Operation',
    generation: '先進第二代 (Gen-2 Advanced)',
    generationEn: 'Gen-2 Advanced',
    ftoStatus: '專利權有效維持至 2031 年 9 月。具有強力排他權，任何利用低壓感測閘極穿隧漏電流 (I_GATE) 判定反熔絲軟崩潰狀態之操作方法均受此專利保護。',
    ftoStatusEn: 'Actively in force through September 2031. Grants enforceable exclusivity over methods reading antifuse soft-breakdown state via sub-breakdown gate leakage current (I_GATE).'
  },
  'US8982637B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2033-03-15',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '先進第二代 (Gen-2 Advanced)',
    generationEn: 'Gen-2 Advanced',
    ftoStatus: '專利權有效維持至 2033 年 3 月。保護 3T 反熔絲單元之串聯調壓架構，防止先進節點漏電，未獲授權不得於 28nm 以下代工 PDK 中採用該結構。',
    ftoStatusEn: 'In force through March 2033. Protects the 3T antifuse cell structure with intermediate regulator transistor to suppress leakage in advanced nodes.'
  },
  'US10410712B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2037-06-20',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '微縮第三代 (Gen-3 FinFET/GAA)',
    generationEn: 'Gen-3 FinFET/GAA',
    ftoStatus: '專利權有效維持至 2037 年 6 月。保護 3D FinFET 三維鰭片架構下之反熔絲電容器與選擇管結構，覆蓋 16nm/7nm/5nm/3nm PDK。',
    ftoStatusEn: 'In force through June 2037. Protects antifuse cell structures implemented on 3D FinFET architectures across 16nm down to 3nm nodes.'
  },
  'US20250024668A1': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (申請/公開審查中 In-Force)',
    legalStatusEn: 'Pending Application / In-Force Rights',
    expirationDate: '2043-07-14',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '埃米第四代 (Gen-4 2nm GAA)',
    generationEn: 'Gen-4 2nm GAA',
    ftoStatus: '公開審查中，鎖定 2nm GAA 環繞式閘極奈米片 (Nanosheet) 反熔絲，預期將延續力旺在埃米世代之排他性保護至 2043 年。',
    ftoStatusEn: 'Published patent application targeting 2nm GAA nanosheet antifuse structures; expected to secure exclusivity into 2043.'
  },
  'US6788574B2': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2022-12-30',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 Foundational)',
    generationEn: 'Gen-1 Foundational',
    ftoStatus: '已於 2022 年 12 月屆滿過期進入公有領域。單層多晶矽利用井區電容作為控制閘極之單元架構現已可自由合法實施。',
    ftoStatusEn: 'Expired in December 2022; entered public domain. Single-poly EEPROM structures employing well capacitors as control gates are free to implement.'
  },
  'US6950342B2': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2023-12-30',
    patentCategory: '操作方法項 (Method / Operation)',
    patentCategoryEn: 'Method / Operation',
    generation: '奠基第一代 (Gen-1 Foundational)',
    generationEn: 'Gen-1 Foundational',
    ftoStatus: '已於 2023 年 12 月屆滿過期進入公有領域。雙向 FN 穿隧之寫入與抹除偏壓控制方法已不受專利限制。',
    ftoStatusEn: 'Expired in December 2023; entered public domain. Bi-directional FN tunneling write/erase bias sequences are now open technology.'
  },
  'US6853583B2': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2022-06-21',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 Foundational)',
    generationEn: 'Gen-1 Foundational',
    ftoStatus: '已於 2022 年 6 月屆滿過期進入公有領域。利用獨立抹除閘極 (Erase Gate) 進行邊緣場穿隧之單元結構可自由實施。',
    ftoStatusEn: 'Expired in June 2022; entered public domain. Dedicated erase gate topology for edge FN tunneling is in the public domain.'
  },
  'US7158412B2': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2024-03-08',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '演進第二代 (Gen-2 Evolutionary)',
    generationEn: 'Gen-2 Evolutionary',
    ftoStatus: '已於 2024 年 3 月屆滿過期進入公有領域。高密度 NeoMTP 陣列結構與多晶矽佈局已完全開放。',
    ftoStatusEn: 'Expired in March 2024; entered public domain. High-density single-poly MTP array layout configurations are now free to operate.'
  },
  'US10204981B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2036-09-08',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '先進安全代 (Gen-3 Security)',
    generationEn: 'Gen-3 Security',
    ftoStatus: '有效維持至 2036 年 9 月。保護利用薄閘極氧化層不可預測微觀缺陷產生隨機靜態識別碼之物理結構，具極高排他壁壘。',
    ftoStatusEn: 'In force through September 2036. Strictly protects PUF hardware structures exploiting microscopic oxide variations for static key generation.'
  },
  'US10651268B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2037-09-29',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '先進安全代 (Gen-3 Security)',
    generationEn: 'Gen-3 Security',
    ftoStatus: '有效維持至 2037 年 9 月。保護具自參考追蹤之 PUF 差動感測放大器電路，能免疫溫度與電壓飄移。',
    ftoStatusEn: 'In force through September 2037. Protects differential PUF sensing circuitry with tracking reference against PVT variations.'
  },
  'US10769300B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2037-06-30',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '先進安全代 (Gen-3 Security)',
    generationEn: 'Gen-3 Security',
    ftoStatus: '有效維持至 2037 年 6 月。保護利用閘氧直接量子穿隧散粒雜訊 (Shot Noise) 生成不可預測隨機數之硬體電路。',
    ftoStatusEn: 'In force through June 2037. Covers hardware true random number generators (TRNG) based on direct quantum tunneling shot noise.'
  },

  // === Kilopass (Synopsys) ===
  'US6992925B2': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2023-03-07',
    patentCategory: '裝置結構與方法項 (Device & Method)',
    patentCategoryEn: 'Device & Method',
    generation: '奠基第一代 (Gen-1 1T-Antifuse)',
    generationEn: 'Gen-1 1T-Antifuse',
    ftoStatus: '【重大產業里程碑】Kilopass 早期用以控告 Sidense 侵權之 1T 反熔絲交叉點核心專利，已於 2023 年 3 月屆滿 20 年進入公有領域！半導體業界現在可自由合法實施該 1T cross-point 閘氧擊穿基本結構。',
    ftoStatusEn: '[Landmark Milestone] The foundational 1T antifuse cross-point patent asserted in the historic Kilopass v. Sidense litigation expired in March 2023. The 1T antifuse cross-point structure is now free to operate globally.'
  },
  'US6777766B2': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2022-04-18',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 1T-Antifuse)',
    generationEn: 'Gen-1 1T-Antifuse',
    ftoStatus: '已於 2022 年 4 月屆滿過期進入公有領域。利用薄閘極氧化層降低崩潰電壓之雙氧化層單元結構已無排他約束。',
    ftoStatusEn: 'Expired in April 2022; entered public domain. The dual-oxide structure leveraging thin gate oxide for reduced breakdown voltage is free to implement.'
  },
  'US7643333B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force · 2026 年底屆滿)',
    legalStatusEn: 'In-Force (Expires late 2026)',
    expirationDate: '2026-11-20',
    patentCategory: '操作方法項 (Method / Operation)',
    patentCategoryEn: 'Method / Operation',
    generation: '演進第二代 (Gen-2 High-Voltage Control)',
    generationEn: 'Gen-2 High-Voltage Control',
    ftoStatus: '專利權有效至 2026 年 11 月（即將屆滿）。保護利用分割井區 (Split-Well) 施加逆向偏壓以限制漏電與基板電流之高壓編程方法。',
    ftoStatusEn: 'In force until November 2026 (near term completion). Covers high-voltage programming sequences using split-well biasing to suppress substrate disturbance.'
  },

  // === Sidense (Synopsys) ===
  'US7402855B2': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2025-09-02',
    patentCategory: '裝置結構與方法項 (Device & Method)',
    patentCategoryEn: 'Device & Method',
    generation: '奠基第一代 (Gen-1 Split-Channel)',
    generationEn: 'Gen-1 Split-Channel',
    ftoStatus: '【重大產業里程碑】Sidense 於訴訟中成功擊潰 Kilopass 侵權主張之 Split-Channel 1T-Fuse 核心專利，已於 2025 年 9 月屆滿 20 年進入公有領域！Split-channel 1T 反熔絲結構現已可自由實施。',
    ftoStatusEn: '[Landmark Milestone] Sidense foundational Split-Channel 1T antifuse patent—which successfully defended against Kilopass claims in CAFC—expired in September 2025 and entered the public domain.'
  },
  'US7880216B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2027-06-29',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '微縮第二代 (Gen-2 Non-Junction)',
    generationEn: 'Gen-2 Non-Junction',
    ftoStatus: '專利權有效維持至 2027 年 6 月。保護無接面 (Non-Junction) 與非對稱擴散之微型反熔絲單元，具排他性。',
    ftoStatusEn: 'In force through June 2027. Enforces exclusivity over non-junction asymmetric diffusion antifuse bitcells for enhanced density.'
  },
  'US8325516B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2029-03-31',
    patentCategory: '操作與感測項 (Sensing Method)',
    patentCategoryEn: 'Sensing Method',
    generation: '微縮第二代 (Gen-2 Differential Sensing)',
    generationEn: 'Gen-2 Differential Sensing',
    ftoStatus: '專利權有效維持至 2029 年 3 月。保護低電壓差動感測與雙反熔絲位元互補讀取架構。',
    ftoStatusEn: 'In force through March 2029. Protects low-voltage differential sensing and complementary twin-antifuse cell reading architectures.'
  },

  // === 億而得 YMC ===
  'US7835188B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2027-07-27',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 Logic MTP)',
    generationEn: 'Gen-1 Logic MTP',
    ftoStatus: '專利權有效維持至 2027 年 7 月。保護無額外光罩之差動式單層多晶矽 MTP 單元結構。',
    ftoStatusEn: 'In force through July 2027. Covers zero-mask differential single-poly MTP cell topologies.'
  },
  'US8184485B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2029-08-25',
    patentCategory: '裝置結構與方法項 (Device & Method)',
    patentCategoryEn: 'Device & Method',
    generation: '微縮第二代 (Gen-2 Enhanced Erase)',
    generationEn: 'Gen-2 Enhanced Erase',
    ftoStatus: '專利權有效維持至 2029 年 8 月。保護具淺溝槽隔離 (STI) 電容耦合與高效抹除閘極之 MTP 架構。',
    ftoStatusEn: 'In force through August 2029. Protects STI capacitor-coupled MTP structures with enhanced erase efficiency.'
  },

  // === AEON (Synopsys / Impinj) ===
  'US6166953A': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2019-04-30',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 RFID NVM)',
    generationEn: 'Gen-1 RFID NVM',
    ftoStatus: '已於 2019 年 4 月屆滿過期進入公有領域。早期利用 CMOS 井區電容達成無控制閘極浮閘單元之專利已完全開放。',
    ftoStatusEn: 'Expired in April 2019; entered public domain. Pioneer patent on well-capacitance-coupled floating gate NVM for RFID is free to operate.'
  },
  'US6388918B1': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2020-06-20',
    patentCategory: '操作方法項 (Method / Operation)',
    patentCategoryEn: 'Method / Operation',
    generation: '奠基第一代 (Gen-1 RFID NVM)',
    generationEn: 'Gen-1 RFID NVM',
    ftoStatus: '已於 2020 年 6 月屆滿過期進入公有領域。微弱電流穿隧寫入與接面電容耦合偏壓序列已無排他約束。',
    ftoStatusEn: 'Expired in June 2020; entered public domain. Ultra-low power tunneling write algorithms are in the public domain.'
  },

  // === 寬緯 Attopsemi ===
  'US9165979B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2032-07-26',
    patentCategory: '裝置結構與方法項 (Device & Method)',
    patentCategoryEn: 'Device & Method',
    generation: '奠基第一代 (Gen-1 Sub-Thermal I-fuse)',
    generationEn: 'Gen-1 Sub-Thermal I-fuse',
    ftoStatus: '專利權有效維持至 2032 年 7 月。保護非爆炸性電遷移（亞熱凝聚）0.4V 超低電壓可讀取之熔絲單元與操作。',
    ftoStatusEn: 'In force through July 2032. Enforces exclusivity over non-explosive electromigration (silicide agglomeration) 0.4V-readable fuse structures.'
  },
  'US9613943B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2035-05-08',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '演進第二代 (Gen-2 Metal Gate Contact)',
    generationEn: 'Gen-2 Metal Gate Contact',
    ftoStatus: '專利權有效維持至 2035 年 5 月。保護金屬閘極 HKMG 與接觸插塞 (Contact Plug) 界面受控電遷移反熔絲單元。',
    ftoStatusEn: 'In force through May 2035. Protects controlled electromigration fuses implemented at HKMG metal-gate contact plug interfaces.'
  },

  // === Floadia ===
  'US9214470B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2032-06-21',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 SONOS Split-Gate)',
    generationEn: 'Gen-1 SONOS Split-Gate',
    ftoStatus: '專利權有效維持至 2032 年 6 月。保護側壁 ONO 電荷捕捉分離閘記憶單元，減少 3 道光罩之特徵受此專利排他保護。',
    ftoStatusEn: 'In force through June 2032. Protects sidewall ONO charge-trap split-gate flash cell architecture reducing 3 masks compared to traditional eFlash.'
  },
  'US9847343B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2034-07-29',
    patentCategory: '製程整合與方法項 (Process & Method)',
    patentCategoryEn: 'Process & Method',
    generation: '演進第二代 (Gen-2 Low-Power FN CFX)',
    generationEn: 'Gen-2 Low-Power FN CFX',
    ftoStatus: '專利權有效維持至 2034 年 7 月。保護超低功耗 FN 穿隧 SONOS 製程整合與偏壓控制方法。',
    ftoStatusEn: 'In force through July 2034. Covers ultra-low power FN tunneling SONOS fabrication flow and operating methods.'
  },

  // === SST (Microchip) ===
  'US5029130A': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2009-08-07',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 SuperFlash)',
    generationEn: 'Gen-1 SuperFlash',
    ftoStatus: '已於 2009 年 8 月屆滿過期進入公有領域。初代 SuperFlash 非對稱分離閘極基本結構已屬開放技術。',
    ftoStatusEn: 'Expired in August 2009; entered public domain. Pioneer asymmetric split-gate flash cell topology is open technology.'
  },
  'US6747310B2': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2022-04-18',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '微縮第二代 (Gen-2 ESF1 Self-Aligned)',
    generationEn: 'Gen-2 ESF1 Self-Aligned',
    ftoStatus: '已於 2022 年 4 月屆滿過期進入公有領域。自我對準分離閘極與源極側注入結構已無專利排他性。',
    ftoStatusEn: 'Expired in April 2022; entered public domain. Self-aligned split-gate structure with source-side injection is in the public domain.'
  },

  // === Everspin ===
  'US6545906B1': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2021-11-21',
    patentCategory: '裝置結構與方法項 (Device & Method)',
    patentCategoryEn: 'Device & Method',
    generation: '奠基第一代 (Gen-1 Toggle MRAM)',
    generationEn: 'Gen-1 Toggle MRAM',
    ftoStatus: '已於 2021 年 11 月屆滿過期進入公有領域。雙軸正交磁場誘導合成反鐵磁 (SAF) 翻轉之 Toggle MRAM 結構現已可自由實施。',
    ftoStatusEn: 'Expired in November 2021; entered public domain. Toggle MRAM SAF free-layer rotation under orthogonal magnetic fields is now public domain technology.'
  },
  'US7599207B2': {
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2025-09-30',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '演進第二代 (Gen-2 In-Plane STT-MRAM)',
    generationEn: 'Gen-2 In-Plane STT-MRAM',
    ftoStatus: '【重大里程碑】早期自旋轉矩傳遞 (STT-MRAM) 平面磁化翻轉母案已於 2025 年 9 月屆滿過期進入公有領域！基礎 STT 注入架構無專利侵權風險。',
    ftoStatusEn: '[Major Milestone] Foundational STT-MRAM in-plane spin transfer torque patent expired in September 2025; entered the public domain.'
  },
  'US8488373B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2030-06-25',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '先進第三代 (Gen-3 Perpendicular pMTJ)',
    generationEn: 'Gen-3 Perpendicular pMTJ',
    ftoStatus: '專利權有效維持至 2030 年 6 月。保護具垂直磁各向異性 (pMTJ) 與 CoFeB/MgO/CoFeB 高 TMR 多層膜界面結構，具嚴密排他性。',
    ftoStatusEn: 'In force through June 2030. Strongly protects high-TMR perpendicular MTJ (pMTJ) multi-layer stack structures.'
  },

  // === Weebit Nano ===
  'US10141505B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2034-06-20',
    patentCategory: '材料結構與方法項 (Material & Method)',
    patentCategoryEn: 'Material & Method',
    generation: '奠基第一代 (Gen-1 SiOx ReRAM)',
    generationEn: 'Gen-1 SiOx ReRAM',
    ftoStatus: '專利權有效維持至 2034 年 6 月。保護以多孔二氧化矽 (SiOx) 作為阻變層之電阻式記憶體元件與成絲偏壓方法。',
    ftoStatusEn: 'In force through June 2034. Covers porous silicon oxide (SiOx) switching layer ReRAM devices and conductive filament forming methods.'
  },
  'US10580980B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2037-08-31',
    patentCategory: '操作方法項 (Method / Operation)',
    patentCategoryEn: 'Method / Operation',
    generation: '先進第二代 (Gen-2 Neuromorphic ReRAM)',
    generationEn: 'Gen-2 Neuromorphic ReRAM',
    ftoStatus: '專利權有效維持至 2037 年 8 月。保護利用 ReRAM 多階電導 (Multi-level Cell) 特性進行類神經網路突觸乘累加 (MAC) 運算之操作方法。',
    ftoStatusEn: 'In force through August 2037. Protects neuromorphic in-memory computing synaptic analog weight updating methods on ReRAM arrays.'
  },

  // === 熵碼 PUFsecurity ===
  'US10651268B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2038-03-12',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '先進安全代 (Gen-1 Quantum PUFrt)',
    generationEn: 'Gen-1 Quantum PUFrt',
    ftoStatus: '專利權有效維持至 2038 年 3 月。保護微觀量子穿隧實體不可複製函數裝置及其具自適應追蹤參考之差分感測電路。',
    ftoStatusEn: 'In force through March 2038. Protects quantum tunneling physical unclonable function devices with tracking differential sensing circuitry.'
  },
  'US10769300B2': {
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2038-09-14',
    patentCategory: '裝置結構與方法項 (Device & Method)',
    patentCategoryEn: 'Device & Method',
    generation: '先進安全代 (Gen-1 Quantum TRNG)',
    generationEn: 'Gen-1 Quantum TRNG',
    ftoStatus: '專利權有效維持至 2038 年 9 月。保護利用介電層直接穿隧量子散粒雜訊產生高熵隨機數之真隨機亂數產生器 (TRNG)。',
    ftoStatusEn: 'In force through September 2038. Protects true random number generators harvesting entropy from direct quantum tunneling shot noise.'
  }
};

function enrichFile(filePath) {
  const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updatedCount = 0;
  for (const v of fileData.vendors) {
    for (const f of v.families) {
      for (const p of f.patents) {
        const match = patentEnrichments[p.id];
        if (match) {
          Object.assign(p, match);
          updatedCount++;
        } else {
          console.warn(`未找到專利對照: ${p.id}`);
        }
      }
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2), 'utf8');
  console.log(`成功注入 ${updatedCount} 件專利至 ${filePath}！`);
}

enrichFile(path.resolve('data/nvm-vendor-patent-maps.json'));
enrichFile(path.resolve('data/nvm-vendor-patent-maps-en.json'));

