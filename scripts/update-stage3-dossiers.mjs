import fs from 'node:fs';
import path from 'node:path';

const zhFile = path.resolve('data/nvm-vendor-patent-maps.json');
const enFile = path.resolve('data/nvm-vendor-patent-maps-en.json');
const kdZhFile = path.resolve('data/nvm-knowledge-data.json');
const kdEnFile = path.resolve('data/nvm-knowledge-data-en.json');

const zhData = JSON.parse(fs.readFileSync(zhFile, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
const kdZhData = JSON.parse(fs.readFileSync(kdZhFile, 'utf8'));
const kdEnData = JSON.parse(fs.readFileSync(kdEnFile, 'utf8'));

// ==========================================
// 1. SST / Microchip (SuperFlash®) 擴充資料
// ==========================================

const sstNewPatentsZh = [
  {
    id: 'US8217444B2',
    title: '具自我對準獨立抹除閘之分離閘極快閃記憶體單元結構與製造方法',
    grantDate: '2012-07-10',
    priorityDate: '2010-01-20',
    inventors: 'Xian Liu, Chien-Sheng Su, Bing Yeh',
    assignee: 'Silicon Storage Technology, Inc.',
    url: 'https://patents.google.com/patent/US8217444B2/en',
    coreProblem: '微縮至 55nm/40nm 時，獨立抹除閘 (EG) 與浮動閘尖端之光罩對準誤差會引發劇烈的單元間抹除速度離散。',
    mechanism: '採用化學機械研磨 (CMP) 與自我對準間隔層工藝，使抹除閘極自我對準於浮動閘極上方之多晶矽尖端，消除微影對準偏差，維持一致的穿隧電場。',
    claimFocus: '權利項 1 限定抹除閘極自我對準於浮動閘極上尖端且覆蓋共用源極擴散區之結構與製造方法。',
    productLink: 'SuperFlash® ESF3 55nm/40nm 全球車規 MCU 主力量產平台。',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2030-01-20',
    patentCategory: '裝置與製程項 (Device & Fabrication)',
    patentCategoryEn: 'Device & Fabrication',
    generation: '先進第三代 (Gen-3 ESF3 Self-Aligned)',
    generationEn: 'Gen-3 ESF3 Self-Aligned',
    ftoStatus: '專利權有效維持至 2030 年 1 月。保護具自我對準抹除閘之 1.5T ESF3 單元結構與對準偏差抑制工藝。',
    ftoStatusEn: 'In force through January 2030. Protects self-aligned erase-gate ESF3 1.5T cell structures and overlay-tolerant fabrication methods.'
  },
  {
    id: 'US8946797B2',
    title: '適用於先進金屬閘極製程之分離閘極快閃記憶體單元',
    grantDate: '2015-02-03',
    priorityDate: '2012-07-31',
    inventors: 'Chien-Sheng Su, Xian Liu',
    assignee: 'Silicon Storage Technology, Inc.',
    url: 'https://patents.google.com/patent/US8946797B2/en',
    coreProblem: '在 28nm HKMG (高介電常數金屬閘極) 製程中，多晶矽熱預算受限且金屬置換工藝極易破壞浮動閘極之介電隔離。',
    mechanism: '設計相容於 High-k Metal Gate 置換閘極工藝之嵌入式分離閘單元，以超薄金屬功函數層作為選擇閘，浮閘維持超低漏電多晶矽，實現 28nm HKMG 車規量產。',
    claimFocus: '權利項 1 限定具金屬選擇閘極與多晶矽浮動閘極之混合分離閘結構與 28nm HKMG 整合方法。',
    productLink: 'SuperFlash® 28nm HKMG 車用晶片平台 (台積電 / 聯電量產授權)。',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2032-07-31',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '埃米微縮第四代 (Gen-4 28nm HKMG eFlash)',
    generationEn: 'Gen-4 28nm HKMG eFlash',
    ftoStatus: '專利權有效維持至 2032 年 7 月。具有強力排他權，未獲授權不得於 28nm HKMG 製程中實施該混合金屬閘分離單元。',
    ftoStatusEn: 'In force through July 2032. Enforces exclusivity over hybrid metal-gate/poly-FG split-gate cells in 28nm HKMG foundries.'
  },
  {
    id: 'US10658032B2',
    title: '基於分離閘極浮動閘記憶體單元之類比類神經網路運算陣列',
    grantDate: '2020-05-19',
    priorityDate: '2018-09-19',
    inventors: 'Vipin Tiwari, Mark Reiten',
    assignee: 'Silicon Storage Technology, Inc.',
    url: 'https://patents.google.com/patent/US10658032B2/en',
    coreProblem: '邊緣 AI 運算受制於馮紐曼記憶體牆，數位 SRAM 陣列讀取權重耗費巨額功耗。',
    mechanism: '利用 ESF3 浮動閘極電導的多級精確可調特性，以類比電流直接實現矩陣乘加運算 (Vector-Matrix Multiplication)，將神經網路推理功耗壓低 80% 以上。',
    claimFocus: '權利項 1 限定由多級浮閘分離閘極單元組成之類比神經擬態乘加運算陣列架構與權重調諧操作。',
    productLink: 'Microchip / SST memBrain™ 神經擬態記憶體內運算 (CIM) 處理器 IP。',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2038-09-19',
    patentCategory: '陣列架構項 (Array Architecture)',
    patentCategoryEn: 'Array Architecture',
    generation: '神經擬態第五代 (Gen-5 memBrain CIM AI)',
    generationEn: 'Gen-5 memBrain CIM AI',
    ftoStatus: '專利權有效維持至 2038 年 9 月。保護 ESF3 浮閘電導類比權重儲存與記憶體內計算 (CIM) 陣列技術。',
    ftoStatusEn: 'In force through September 2038. Protects ESF3 multi-level conductance weights and in-memory computing architectures.'
  }
];

const sstNewPatentsEn = [
  {
    id: 'US8217444B2',
    title: 'Split-Gate Non-Volatile Memory Cell with Self-Aligned Erase Gate and Method of Fabrication',
    grantDate: '2012-07-10',
    priorityDate: '2010-01-20',
    inventors: 'Xian Liu, Chien-Sheng Su, Bing Yeh',
    assignee: 'Silicon Storage Technology, Inc.',
    url: 'https://patents.google.com/patent/US8217444B2/en',
    coreProblem: 'Scaling to 55nm/40nm exacerbates lithographic overlay errors between the erase gate (EG) and floating gate tip, causing severe cell-to-cell erase speed variation.',
    mechanism: 'Employs chemical mechanical polishing (CMP) and self-aligned spacer techniques to self-align the erase gate directly over the sharp floating gate poly tip, maintaining uniform tunneling fields across wafer dies.',
    claimFocus: 'Claim 1 defines an erase gate self-aligned over the floating gate tip and overlying the common source diffusion with its fabrication process.',
    productLink: 'SuperFlash® ESF3 55nm/40nm mainstream automotive MCU platform worldwide.',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2030-01-20',
    patentCategory: '裝置與製程項 (Device & Fabrication)',
    patentCategoryEn: 'Device & Fabrication',
    generation: '先進第三代 (Gen-3 ESF3 Self-Aligned)',
    generationEn: 'Gen-3 ESF3 Self-Aligned',
    ftoStatus: '專利權有效維持至 2030 年 1 月。保護具自我對準抹除閘之 1.5T ESF3 單元結構與對準偏差抑制工藝。',
    ftoStatusEn: 'In force through January 2030. Protects self-aligned erase-gate ESF3 1.5T cell structures and overlay-tolerant fabrication methods.'
  },
  {
    id: 'US8946797B2',
    title: 'Split-Gate Flash Memory Cell for Advanced High-k Metal Gate Process Integration',
    grantDate: '2015-02-03',
    priorityDate: '2012-07-31',
    inventors: 'Chien-Sheng Su, Xian Liu',
    assignee: 'Silicon Storage Technology, Inc.',
    url: 'https://patents.google.com/patent/US8946797B2/en',
    coreProblem: 'In 28nm HKMG nodes, tight thermal budgets and replacement metal gate flows degrade floating-gate dielectric isolation.',
    mechanism: 'Engineers an embedded split-gate bitcell compatible with replacement metal gate flows, deploying an ultra-thin work-function metal select gate while preserving polysilicon floating-gate charge retention for 28nm automotive qualifications.',
    claimFocus: 'Claim 1 recites a hybrid split-gate cell with a metal select gate and polysilicon floating gate integrated into 28nm HKMG logic flows.',
    productLink: 'SuperFlash® 28nm HKMG automotive platform (licensed across TSMC and UMC).',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2032-07-31',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '埃米微縮第四代 (Gen-4 28nm HKMG eFlash)',
    generationEn: 'Gen-4 28nm HKMG eFlash',
    ftoStatus: '專利權有效維持至 2032 年 7 月。具有強力排他權，未獲授權不得於 28nm HKMG 製程中實施該混合金屬閘分離單元。',
    ftoStatusEn: 'In force through July 2032. Enforces exclusivity over hybrid metal-gate/poly-FG split-gate cells in 28nm HKMG foundries.'
  },
  {
    id: 'US10658032B2',
    title: 'Analog Neural Network Computing Array Based on Split-Gate Floating-Gate Memory Cells',
    grantDate: '2020-05-19',
    priorityDate: '2018-09-19',
    inventors: 'Vipin Tiwari, Mark Reiten',
    assignee: 'Silicon Storage Technology, Inc.',
    url: 'https://patents.google.com/patent/US10658032B2/en',
    coreProblem: 'Edge AI processing is throttled by the von Neumann memory wall; digital SRAM reads consume excessive dynamic energy.',
    mechanism: 'Utilizes continuous multi-level conductance tuning of ESF3 floating gates to perform vector-matrix multiplication directly via analog current summation, slashing inference power by over 80%.',
    claimFocus: 'Claim 1 defines an analog neuromorphic multiply-accumulate array topology using multi-level split-gate cells and weight-tuning operations.',
    productLink: 'Microchip / SST memBrain™ Neuromorphic In-Memory Computing (CIM) IP.',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2038-09-19',
    patentCategory: '陣列架構項 (Array Architecture)',
    patentCategoryEn: 'Array Architecture',
    generation: '神經擬態第五代 (Gen-5 memBrain CIM AI)',
    generationEn: 'Gen-5 memBrain CIM AI',
    ftoStatus: '專利權有效維持至 2038 年 9 月。保護 ESF3 浮閘電導類比權重儲存與記憶體內計算 (CIM) 陣列技術。',
    ftoStatusEn: 'In force through September 2038. Protects ESF3 multi-level conductance weights and in-memory computing architectures.'
  }
];

const sstLitigationZh = {
  title: '分離閘極 (Split-Gate) 世紀專利壁壘與 ESF1/ESF3 基礎結構之公有領域開放',
  overview: '葉炳 (Bing Yeh) 博士於 1989 年創辦 SST 所發明的「分離閘極 (Split-Gate) 快閃記憶體」，是半導體記憶體歷史上最具決定性的發明之一。傳統 1T 堆疊閘極 (Stacked-Gate) 快閃記憶體長年受「過度抹除 (Over-Erase)」問題困擾，一旦過度抽出電子使浮閘變為正電位，電晶體即轉變為空乏型而永久導通，癱瘓整條位元線。SST 的分離閘極結構徹底消除了此物理致命傷，成為全球車用與微控制器嵌入式快閃記憶體統治三十餘年的事實標準。',
  keyBattles: [
    {
      heading: '擊破 1T 堆疊閘極過度抹除枷鎖 (ESF1 奠基專利 US5029130A)',
      detail: '傳統 Intel/AMD/Toshiba 堆疊閘極為了防止過度抹除，晶片內部必須配置極其龐大的演算法電路，在每次抹除前先執行耗時的預寫入修復 (Pre-programming)。SST 專利限定控制閘極橫向跨接於矽通道表面作為天然串聯選擇開關，即使浮動閘極過度抹除變成負臨界電壓，相鄰的選擇通道依然能受控完全關斷，免除了複雜的修復演算法，使抹除速度躍升百倍。'
    },
    {
      heading: '第三代 ESF3 獨立抹除閘 (EG) 與源極側注入 (SSI) 專利護城河 (US6747310B2)',
      detail: '早期分離閘極仍需向控制閘極施加高壓抹除，限制了電晶體微縮。SST 於 2002 年佈局第三代 ESF3 專利，在 1.5T 架構中獨立出專用抹除閘極 (EG)，並使浮動閘極邊緣形成銳利多晶矽尖端 (Tip)，抹除時利用微觀尖端場發射進行局部 FN 穿隧，大幅降低抹除電壓；同時配合源極側注入 (SSI)，將寫入效率較常規 CHEI 躍升 1,000 倍，達成 100K 次車規耐久度。'
    },
    {
      heading: '全球代工廠授權聯盟與 Microchip 3 億美元收購',
      detail: 'SST 透過將 SuperFlash 技術授權給台積電 (TSMC)、聯電 (UMC)、格芯 (GF)、中芯國際 (SMIC) 與華虹宏力，奠定了全球嵌入式 Flash 的絕對統治地位。2010 年微控制器龍頭 Microchip 以約 3 億美元全資收購 SST，將 SuperFlash 確立為旗下 PIC 與 AVR MCU 產品的核心護城河，累計晶片出貨量超過 1,000 億顆。'
    }
  ],
  ftoVerdict: '【重大產業里程碑】SST 奠基之初代分離閘極專利 US5029130A 早於 2009 年 8 月屆滿 20 年進入公有領域；其 ESF3 四閘極與源極側注入基礎結構專利 US6747310B2 亦已於 2022 年 4 月屆滿進入公有領域！半導體業界現可完全合法、免授權實施「非對稱分離閘極」與「獨立抹除閘尖端穿隧 (Tip Tunneling)」基礎結構；然而，SST 在 55nm/40nm 自我對準工藝 (US8217444B2)、28nm HKMG 金屬閘整合 (US8946797B2) 與 memBrain 類比 CIM 矩陣專利 (US10658032B2) 仍受嚴密保護至 2030–2038 年。'
};

const sstLitigationEn = {
  title: 'Split-Gate Landmark Patent Moat & Public Domain Opening of ESF1/ESF3',
  overview: 'Founded in 1989 by Dr. Bing Yeh, Silicon Storage Technology (SST) introduced the "Split-Gate Flash Memory Cell," one of the most consequential breakthroughs in semiconductor memory history. Conventional 1T stacked-gate flash suffered chronically from "over-erase," where excessive electron extraction converted cells into depletion-mode switches that permanently shorted bitlines. SST\'s split-gate structure eliminated this fatal physics flaw, dominating automotive and microcontroller embedded flash for over three decades.',
  keyBattles: [
    {
      heading: 'Eliminating the 1T Stacked-Gate Over-Erase Bottleneck (ESF1 US5029130A)',
      detail: 'Legacy Intel/AMD/Toshiba stacked-gate architectures required massive on-chip pre-programming state machines before each erase cycle to prevent depletion-mode bitcell leakage. SST patented a split-gate topology where the control gate naturally overlies a dedicated segment of the silicon channel as an integrated access switch. Even if the floating gate is heavily over-erased into negative Vth, the adjacent select channel reliably pinches off, obsoleting complex recovery algorithms.'
    },
    {
      heading: 'Gen-3 ESF3 Dedicated Erase Gate (EG) & Source-Side Injection (SSI) Moat (US6747310B2)',
      detail: 'Early split-gate devices required high erase voltages applied to control gates. In 2002, SST patented the 1.5T ESF3 topology, introducing a dedicated erase gate (EG) coupled with a sharp polysilicon floating-gate tip. Erase operations utilize intense localized tip field emission, drastically cutting erase voltage; simultaneously, source-side injection (SSI) elevated programming efficiency by 1,000x compared to CHEI, yielding 100K-cycle automotive endurance.'
    },
    {
      heading: 'Global Foundry Licensing Consortium & $300M Microchip Acquisition',
      detail: 'By licensing SuperFlash across TSMC, UMC, GlobalFoundries, SMIC, and HHGrace, SST achieved ubiquity in embedded flash. In 2010, microcontroller giant Microchip acquired SST for ~$300M, establishing SuperFlash as the core hardware advantage for PIC/AVR MCUs with lifetime shipments surpassing 100 billion dies.'
    }
  ],
  ftoVerdict: '[FTO Guidance] SST pioneer split-gate patent US5029130A expired in August 2009 after completing its full 20-year term. Foundational ESF3 four-gate source-side injection patent US6747310B2 also entered the public domain in April 2022. The semiconductor industry may freely practice asymmetric split-gate and independent erase-gate tip tunneling structures. However, self-aligned 55nm/40nm manufacturing (US8217444B2), 28nm HKMG integration (US8946797B2), and memBrain analog CIM patents (US10658032B2) remain actively enforceable through 2030–2038.'
};

// ==========================================
// 2. Floadia Corporation 擴充資料
// ==========================================

const floadiaNewPatentsZh = [
  {
    id: 'US6388293B1',
    title: '具側壁分離閘極與電荷捕捉介電層之非揮發性半導體記憶裝置',
    grantDate: '2002-05-14',
    priorityDate: '1999-10-18',
    inventors: 'Shinichi Minami, Kosuke Okuyama 等 (日立製作所 / 瑞薩科技研發團隊)',
    assignee: 'Hitachi, Ltd. / Renesas Electronics Corp.',
    url: 'https://patents.google.com/patent/US6388293B1/en',
    coreProblem: '傳統浮動閘極在深次微米下容易因氧化層應力產生單一缺陷漏電 (SILC)，導致記憶體高溫資料保持力迅速衰退。',
    mechanism: 'Floadia 創辦團隊早期奠基專利。以絕緣氮化矽 (Si3N4) 側壁間隔層作為電荷捕捉介質，將電荷捕獲於微觀分離能階中，徹底免除浮閘導電層全盤漏電隱患。',
    claimFocus: '權利項 1 限定由開關閘極與側壁電荷捕捉分離閘極組成之記憶單元結構與製造方法。',
    productLink: '日立/瑞薩 MONOS 技術奠基專利，Floadia LEE Flash 核心理論起源。',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2019-10-18',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 MONOS Pioneer)',
    generationEn: 'Gen-1 MONOS Pioneer',
    ftoStatus: '已於 2019 年 10 月屆滿 20 年進入公有領域。早期利用側壁氮化矽電荷捕捉層構成分離閘極之基礎單元結構現已開放自由實施。',
    ftoStatusEn: 'Expired in October 2019; entered public domain. Foundational sidewall silicon nitride charge-trapping split-gate architecture is free to operate.'
  },
  {
    id: 'US6853583B2',
    title: '電荷捕捉型非揮發性記憶體之均勻電場雙向穿隧操作方法',
    grantDate: '2005-02-08',
    priorityDate: '2002-09-17',
    inventors: 'Kosuke Okuyama 等 (日立製作所 / 瑞薩科技研發團隊)',
    assignee: 'Renesas Technology Corp.',
    url: 'https://patents.google.com/patent/US6853583B2/en',
    coreProblem: '熱載子注入 (HCI) 寫入會在通道界面產生高能界面缺陷，嚴重縮短電荷捕捉記憶單元之寫抹循環壽命。',
    mechanism: '拋棄破壞性熱載子注入，在整個電荷捕捉區均勻施加雙向低電場 Fowler-Nordheim (FN) 穿隧電壓，消除界面破壞，大幅延長介電層耐久度。',
    claimFocus: '權利項 1 限定在電荷陷阱分離閘單元中以雙向均勻低場 FN 穿隧完成寫入與抹除之偏壓時序。',
    productLink: 'Floadia LEE Flash ZT 與 G1/G2 雙向低場操作法理基礎。',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2022-09-17',
    patentCategory: '操作方法項 (Method / Operation)',
    patentCategoryEn: 'Method / Operation',
    generation: '奠基第一代 (Gen-1 Uniform FN Operation)',
    generationEn: 'Gen-1 Uniform FN Operation',
    ftoStatus: '已於 2022 年 9 月屆滿 20 年進入公有領域。雙向均勻低場 FN 穿隧於側壁電荷捕捉單元之偏壓操作方法已無專利排他權。',
    ftoStatusEn: 'Expired in September 2022; entered public domain. Uniform bidirectional low-field FN tunneling for charge-trap cells is in the public domain.'
  },
  {
    id: 'US10840251B2',
    title: '具微應力抹除之側壁分離閘極電荷陷阱記憶體單元及其操作方法',
    grantDate: '2020-11-17',
    priorityDate: '2018-05-18',
    inventors: 'Kosuke Okuyama, Shintaro Kume',
    assignee: 'Floadia Corp.',
    url: 'https://patents.google.com/patent/US10840251B2/en',
    coreProblem: '車用 175°C 極端環境下，重複高壓抹除引發之介電層微應力會造成軟擊穿，導致車規晶片發生漏電退化。',
    mechanism: 'Floadia 旗艦 µStressFlash 核心專利。採用微應力抹除演算法，將抹除電場精確壓制在介電層彈性極限以下，並以對稱負偏壓輔助抽出電子，達成 175°C 100K 次車規零退化。',
    claimFocus: '權利項 1 限定側壁分離閘 ONO 單元搭配微應力負偏壓階梯脈衝之抹除操作架構。',
    productLink: 'Floadia µStressFlash / LEE Flash G2 車規 Grade-0 核心 IP。',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2038-05-18',
    patentCategory: '裝置與操作項 (Device & Operation)',
    patentCategoryEn: 'Device & Operation',
    generation: '先進第三代 (Gen-3 µStressFlash 175°C)',
    generationEn: 'Gen-3 µStressFlash 175°C',
    ftoStatus: '專利權有效維持至 2038 年 5 月。具有強力排他權，保護 µStressFlash 微應力抹除演算法與側壁 ONO 單元偏壓結構。',
    ftoStatusEn: 'Actively in force through May 2038. Protects µStressFlash low-stress erase algorithms and automotive 175°C retention structures.'
  }
];

const floadiaNewPatentsEn = [
  {
    id: 'US6388293B1',
    title: 'Non-Volatile Semiconductor Memory Device with Sidewall Split Gate and Charge-Trapping Dielectric',
    grantDate: '2002-05-14',
    priorityDate: '1999-10-18',
    inventors: 'Shinichi Minami, Kosuke Okuyama et al. (Hitachi / Renesas R&D Team)',
    assignee: 'Hitachi, Ltd. / Renesas Electronics Corp.',
    url: 'https://patents.google.com/patent/US6388293B1/en',
    coreProblem: 'In sub-micron nodes, floating gates suffer from stress-induced leakage current (SILC) where a single dielectric defect dissipates all stored electrons.',
    mechanism: 'Floadia founders pioneer invention at Hitachi/Renesas. Replaces conductive poly with an insulating silicon nitride (Si3N4) sidewall spacer, trapping electrons within isolated localized potential wells to eliminate global leakage.',
    claimFocus: 'Claim 1 defines a memory cell formed by an access gate and an adjacent sidewall charge-trapping split gate with its manufacturing method.',
    productLink: 'Foundational MONOS pioneer patent; foundational theoretical ancestor of Floadia LEE Flash.',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2019-10-18',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 MONOS Pioneer)',
    generationEn: 'Gen-1 MONOS Pioneer',
    ftoStatus: '已於 2019 年 10 月屆滿 20 年進入公有領域。早期利用側壁氮化矽電荷捕捉層構成分離閘極之基礎單元結構現已開放自由實施。',
    ftoStatusEn: 'Expired in October 2019; entered public domain. Foundational sidewall silicon nitride charge-trapping split-gate architecture is free to operate.'
  },
  {
    id: 'US6853583B2',
    title: 'Operating Method for Charge-Trap Non-Volatile Memory Using Bidirectional Uniform Electric Fields',
    grantDate: '2005-02-08',
    priorityDate: '2002-09-17',
    inventors: 'Kosuke Okuyama et al. (Hitachi / Renesas R&D Team)',
    assignee: 'Renesas Technology Corp.',
    url: 'https://patents.google.com/patent/US6853583B2/en',
    coreProblem: 'Hot carrier injection (HCI) creates interface traps near drain junctions, severely degrading endurance cycling in charge-trap devices.',
    mechanism: 'Replaces damaging hot-carrier injection with uniform bidirectional low-field Fowler-Nordheim (FN) tunneling across the entire trapped region, preventing interface damage and dramatically extending dielectric lifetime.',
    claimFocus: 'Claim 1 recites bias sequences executing programming and erasing via uniform bidirectional low-field FN tunneling in a charge-trap split-gate cell.',
    productLink: 'Theoretical and operational baseline for Floadia LEE Flash ZT and G1/G2.',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2022-09-17',
    patentCategory: '操作方法項 (Method / Operation)',
    patentCategoryEn: 'Method / Operation',
    generation: '奠基第一代 (Gen-1 Uniform FN Operation)',
    generationEn: 'Gen-1 Uniform FN Operation',
    ftoStatus: '已於 2022 年 9 月屆滿 20 年進入公有領域。雙向均勻低場 FN 穿隧於側壁電荷捕捉單元之偏壓操作方法已無專利排他權。',
    ftoStatusEn: 'Expired in September 2022; entered public domain. Uniform bidirectional low-field FN tunneling for charge-trap cells is in the public domain.'
  },
  {
    id: 'US10840251B2',
    title: 'Sidewall Split-Gate Charge-Trap Memory Cell with Micro-Stress Erase and Operating Method',
    grantDate: '2020-11-17',
    priorityDate: '2018-05-18',
    inventors: 'Kosuke Okuyama, Shintaro Kume',
    assignee: 'Floadia Corp.',
    url: 'https://patents.google.com/patent/US10840251B2/en',
    coreProblem: 'Under extreme 175°C automotive conditions, repeated high-voltage erase cycles induce micro-stress and dielectric soft breakdown, degrading memory reliability.',
    mechanism: 'Floadia flagship µStressFlash core patent. Deploys micro-stress erase algorithms capping peak electric fields strictly below dielectric damage thresholds, using negative substrate-assisted extraction to achieve 175°C 100K-cycle zero-degradation endurance.',
    claimFocus: 'Claim 1 recites sidewall split-gate ONO cells operated with micro-stress negative stepped erase pulses.',
    productLink: 'Floadia µStressFlash / LEE Flash G2 automotive Grade-0 flagship IP.',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2038-05-18',
    patentCategory: '裝置與操作項 (Device & Operation)',
    patentCategoryEn: 'Device & Operation',
    generation: '先進第三代 (Gen-3 µStressFlash 175°C)',
    generationEn: 'Gen-3 µStressFlash 175°C',
    ftoStatus: '專利權有效維持至 2038 年 5 月。具有強力排他權，保護 µStressFlash 微應力抹除演算法與側壁 ONO 單元偏壓結構。',
    ftoStatusEn: 'Actively in force through May 2038. Protects µStressFlash low-stress erase algorithms and automotive 175°C retention structures.'
  }
];

const floadiaLitigationZh = {
  title: '超低光罩 SONOS 電荷陷阱壁壘與 µStressFlash 車規 175°C 專利護城河',
  overview: 'Floadia 由前瑞薩科技 (Renesas) 記憶體研發領袖奧山幸祐 (Kosuke Okuyama) 於 2011 年創立，其專利戰略的核心在於終結傳統 eFlash (如 SST SuperFlash) 需追加 6–10 道額外光罩的高昂成本枷鎖。Floadia 創新整合了「側壁分離閘極工藝」與「氮化矽 (Si3N4) 局域電荷陷阱 (Charge-Trap)」，在僅追加 2–3 道光罩的超低成本下，達成耐受 175°C 車規極限與 100,000 次擦寫壽命。',
  keyBattles: [
    {
      heading: '氮化矽電荷陷阱 vs. 傳統浮閘之抗漏電物理壁壘',
      detail: '傳統多晶矽浮動閘極是導電連續體，只要氧化層產生單一穿隧微絲 (SILC)，整顆浮閘的電荷就會瞬間漏光。Floadia 採用絕緣氮化矽薄膜 (ONO 結構)，注入的電子被牢牢束縛在數百萬個分散的奈米級深能階陷阱中；即使氧化層局部受損，其他位置的電子依然完好無損，因此在車用 175°C 極端高溫下展現出浮動閘極無法企及的數據留存能力。'
    },
    {
      heading: 'µStressFlash 專利微應力抹除 (US10840251B2)',
      detail: '傳統快閃記憶體在抹除時施加高達 10–12 MV/cm 的破壞性高場，會撕裂界面並生成界面陷阱。Floadia 專利限定利用低電場對稱 FN 穿隧與微應力電壓調控，使穿隧介電層在 10 萬次擦寫後仍保持極低界面缺陷，順利通過日本車用半導體龍頭嚴苛的 AEC-Q100 Grade-0 認證。'
    },
    {
      heading: '神經擬態類比計算 (CIM) 專利延伸',
      detail: '利用電荷陷阱單元微觀電導連續可調特性，Floadia 將專利網延伸至邊緣 AI 類比乘加運算 (Vector-Matrix Multiplication)，在非揮發單元內部直接完成權重乘法，功耗僅為傳統 GPU/數位加速器的十分之一。'
    }
  ],
  ftoVerdict: '【自由實施建議】早期 1999–2002 年日立/瑞薩提出之基礎側壁 SONOS 分離閘極結構與均勻 FN 穿隧專利（US6388293B1 與 US6853583B2）已於 2019 年與 2022 年屆滿 20 年進入公有領域；但 Floadia 自主之 2–3 道超低光罩側壁製造工藝 (US9847343B2)、0-Mask 10K MTP (US9214470B2) 以及 µStressFlash 微應力抹除方法 (US10840251B2) 仍處於強力保護期（分別有效維持至 2032、2034 與 2038 年）。'
};

const floadiaLitigationEn = {
  title: 'Ultra-Low Mask SONOS Moat & Automotive 175°C µStressFlash Patent Fortress',
  overview: 'Founded in 2011 by former Renesas memory R&D chief Kosuke Okuyama, Floadia engineered an IP strategy to overturn the 6–10 extra mask cost penalty of conventional eFlash. By coupling sidewall split-gate processing with localized silicon nitride (Si3N4) charge-trapping dielectrics, Floadia achieved AEC-Q100 Grade-0 175°C automotive retention and 100K endurance with only 2–3 additional masks.',
  keyBattles: [
    {
      heading: 'Silicon Nitride Trapping vs. Poly Floating Gate Leakage Barrier',
      detail: 'Polysilicon floating gates are conductive equipotential bodies; a single stress-induced leakage path (SILC) catastrophically discharges the entire cell. Floadia uses insulating silicon nitride ONO stacks where electrons are trapped in millions of isolated nanoscopic energy wells. Localized dielectric defects cannot drain neighboring traps, ensuring flawless data retention under 175°C automotive baking.'
    },
    {
      heading: 'µStressFlash Micro-Stress Erase Technology (US10840251B2)',
      detail: 'Conventional flash erases with destructive 10–12 MV/cm electric fields, tearing oxide bonds and generating interface traps. Floadia patented micro-stress uniform low-field FN tunneling that preserves dielectric elasticity across 100,000 cycles, passing rigorous Japanese tier-1 automotive qualifications.'
    },
    {
      heading: 'Neuromorphic Analog In-Memory Computing (CIM) Expansion',
      detail: 'Leveraging continuous analog conductance states in charge-trap cells, Floadia extended its IP moat into analog vector-matrix multiplication (VMM) for edge AI, executing multi-bit weight accumulations directly in flash cells at 1/10th the power of digital accelerators.'
    }
  ],
  ftoVerdict: '[FTO Guidance] Early 1999–2002 Hitachi/Renesas foundational sidewall SONOS split-gate patents (US6388293B1 & US6853583B2) expired in 2019 and 2022, entering the public domain. However, Floadia proprietary 2–3 mask sidewall flows (US9847343B2), 0-mask 10K MTP (US9214470B2), and µStressFlash erase algorithms (US10840251B2) remain actively enforceable through 2032, 2034, and 2038.'
};

// ==========================================
// 3. 執行注入與更新
// ==========================================

function updateDataset(data, isEn) {
  // A. 更新 SST
  const sst = data.vendors.find(v => v.id === 'sst');
  if (sst) {
    const newPatents = isEn ? sstNewPatentsEn : sstNewPatentsZh;
    for (const np of newPatents) {
      if (!sst.families[0].patents.some(p => p.id === np.id)) {
        sst.families[0].patents.push(np);
      }
    }
    sst.families[0].patents.sort((a, b) => a.priorityDate.localeCompare(b.priorityDate));
    sst.litigationDefense = isEn ? sstLitigationEn : sstLitigationZh;
  }

  // B. 更新 Floadia
  const floadia = data.vendors.find(v => v.id === 'floadia');
  if (floadia) {
    const newPatents = isEn ? floadiaNewPatentsEn : floadiaNewPatentsZh;
    // 將新專利加入第 2 個家族 (G1/G2) 或第 1 個家族
    for (const np of newPatents) {
      const targetFamily = np.id === 'US6388293B1' || np.id === 'US6853583B2' || np.id === 'US10840251B2'
        ? floadia.families[1]
        : floadia.families[0];
      if (!targetFamily.patents.some(p => p.id === np.id)) {
        targetFamily.patents.push(np);
      }
    }
    floadia.families[0].patents.sort((a, b) => a.priorityDate.localeCompare(b.priorityDate));
    floadia.families[1].patents.sort((a, b) => a.priorityDate.localeCompare(b.priorityDate));
    floadia.litigationDefense = isEn ? floadiaLitigationEn : floadiaLitigationZh;
  }
}

updateDataset(zhData, false);
updateDataset(enData, true);

// 同步回寫專利地圖檔
fs.writeFileSync(zhFile, JSON.stringify(zhData, null, 2), 'utf8');
fs.writeFileSync(enFile, JSON.stringify(enData, null, 2), 'utf8');

// 同步回寫知識總表檔
kdZhData.vendorPatentMaps = zhData;
kdEnData.vendorPatentMaps = enData;
fs.writeFileSync(kdZhFile, JSON.stringify(kdZhData, null, 2), 'utf8');
fs.writeFileSync(kdEnFile, JSON.stringify(kdEnData, null, 2), 'utf8');

console.log('Stage 3 (SST SuperFlash, Floadia) 專利與深度案卷已成功注入！');
