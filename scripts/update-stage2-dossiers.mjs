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
// 1. YMC (億而得微電子) 擴充資料
// ==========================================

const ymcNewPatentsZh = [
  {
    id: 'US6950342B2',
    title: '單層多晶矽非揮發性記憶體單元之對稱井電容耦合結構',
    grantDate: '2005-09-27',
    priorityDate: '2003-09-02',
    inventors: 'Hsi-Pin Kuo, Ching-Yuan Lin',
    assignee: 'Yield Microelectronics Corp.',
    url: 'https://patents.google.com/patent/US6950342B2/en',
    coreProblem: '標準純邏輯製程中缺乏第二層多晶矽 (Poly2)，如何在不增加專用光罩條件下於單一多晶矽層建立高效井電容耦合？',
    mechanism: '在標準 CMOS N 井與 P 井擴散區上方跨置單層浮動多晶矽條，形成對稱的接面電容耦合對，大幅降低寄生接面漏電並提供穩定的寫入穿隧電場。',
    claimFocus: '權利項 1 限定單層多晶矽浮閘跨越雙井擴散接面之電容耦合單元架構與 0-Mask 製造方法。',
    productLink: 'YMC 初代 0.35µm / 0.25µm 邏輯 MTP IP 奠基架構。',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2023-09-02',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 Logic MTP)',
    generationEn: 'Gen-1 Logic MTP',
    ftoStatus: '已於 2023 年 9 月屆滿 20 年進入公有領域。早期利用 CMOS 井區擴散電容耦合浮動閘極之 0-Mask 單元結構已不受排他權限制。',
    ftoStatusEn: 'Expired in September 2023; entered public domain. Pioneer single-poly well capacitance coupling topology is free to operate.'
  },
  {
    id: 'US7119394B2',
    title: '具高電容耦合率之單層多晶矽非揮發性記憶體單元',
    grantDate: '2006-10-10',
    priorityDate: '2004-10-14',
    inventors: 'Hsi-Pin Kuo, Ching-Yuan Lin',
    assignee: 'Yield Microelectronics Corp.',
    url: 'https://patents.google.com/patent/US7119394B2/en',
    coreProblem: '微縮節點下擴散區電容佔用晶片面積過大，導致成熟 MCU 難以在有限成本下整合大容量非揮發性儲存。',
    mechanism: '利用淺溝槽隔離 (STI) 介電層邊緣邊界延伸多晶矽側向電容，並配合深 N 井隔離，使單元耦合率突破 0.70，大幅縮小單元尺寸。',
    claimFocus: '權利項 1 限定由淺溝槽隔離 (STI) 結構界定之電容耦合電極與浮動閘極相對位置特徵。',
    productLink: 'YMC 0.18µm / 0.15µm 主流 MCU MTP 巨集。',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2024-10-14',
    patentCategory: '裝置與製程項 (Device & Fabrication)',
    patentCategoryEn: 'Device & Fabrication',
    generation: '奠基第一代 (Gen-1 Logic MTP)',
    generationEn: 'Gen-1 Logic MTP',
    ftoStatus: '已於 2024 年 10 月屆滿 20 年進入公有領域。利用 STI 側向邊界形成電容耦合電極之製程結構現已開放自由實施。',
    ftoStatusEn: 'Expired in October 2024; entered public domain. STI boundary-assisted capacitance enhancement structure is in the public domain.'
  },
  {
    id: 'US9691784B2',
    title: '非揮發性記憶體陣列及其操作方法',
    grantDate: '2017-06-27',
    priorityDate: '2014-11-20',
    inventors: 'Hsi-Pin Kuo, Ching-Yuan Lin',
    assignee: 'Yield Microelectronics Corp.',
    url: 'https://patents.google.com/patent/US9691784B2/en',
    coreProblem: '高壓 BCD 製程在車用 150°C 寬溫操作時，相鄰單元漏電嚴重且寫入干擾 (Write Disturb) 劇烈，影響車規可靠度。',
    mechanism: '在陣列中導入隔離高壓井與差動虛擬行線偏壓控制，動態箝位未選取單元之閘極-汲極壓差，徹底隔絕高溫寄生漏電流。',
    claimFocus: '權利項 1 限定高壓 BCD 製程中具抗干擾虛擬偏壓線之單層多晶矽記憶體陣列結構與擦寫方法。',
    productLink: 'YMC 車規 AEC-Q100 Grade-0 BCD PMIC 修調 MTP 巨集。',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2034-11-20',
    patentCategory: '陣列架構項 (Array Architecture)',
    patentCategoryEn: 'Array Architecture',
    generation: '車規第三代 (Gen-3 BCD & High-Voltage)',
    generationEn: 'Gen-3 BCD & High-Voltage',
    ftoStatus: '專利權有效維持至 2034 年 11 月。具有強力排他權，未獲授權不得於 BCD 製程中採用該抗干擾車規陣列偏壓架構。',
    ftoStatusEn: 'Actively in force through November 2034. Protects automotive-grade high-voltage BCD array bias topologies against write disturb.'
  }
];

const ymcNewPatentsEn = [
  {
    id: 'US6950342B2',
    title: 'Single Poly Non-Volatile Memory Cell with Balanced Well Coupling',
    grantDate: '2005-09-27',
    priorityDate: '2003-09-02',
    inventors: 'Hsi-Pin Kuo, Ching-Yuan Lin',
    assignee: 'Yield Microelectronics Corp.',
    url: 'https://patents.google.com/patent/US6950342B2/en',
    coreProblem: 'Standard pure logic CMOS lacks a second polysilicon layer (Poly2); how to establish high coupling capacitance without extra masks?',
    mechanism: 'Extends a single-poly floating strip across adjacent CMOS N-well and P-well active regions, creating balanced junction coupling pairs that suppress parasitic leakage and establish stable tunneling fields.',
    claimFocus: 'Claim 1 recites a single-poly floating gate spanning complementary well diffusions with a zero-mask logic fabrication process.',
    productLink: 'YMC Gen-1 0.35µm / 0.25µm logic MTP IP baseline.',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2023-09-02',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 Logic MTP)',
    generationEn: 'Gen-1 Logic MTP',
    ftoStatus: '已於 2023 年 9 月屆滿 20 年進入公有領域。早期利用 CMOS 井區擴散電容耦合浮動閘極之 0-Mask 單元結構已不受排他權限制。',
    ftoStatusEn: 'Expired in September 2023; entered public domain. Pioneer single-poly well capacitance coupling topology is free to operate.'
  },
  {
    id: 'US7119394B2',
    title: 'Single Poly Non-Volatile Memory Cell with Enhanced Coupling Ratio',
    grantDate: '2006-10-10',
    priorityDate: '2004-10-14',
    inventors: 'Hsi-Pin Kuo, Ching-Yuan Lin',
    assignee: 'Yield Microelectronics Corp.',
    url: 'https://patents.google.com/patent/US7119394B2/en',
    coreProblem: 'Large diffusion capacitor footprint hinders dense embedded non-volatile memory integration in cost-sensitive MCU dies.',
    mechanism: 'Utilizes shallow trench isolation (STI) dielectric boundaries to extend lateral poly sidewall capacitance, pushing coupling ratios above 0.70 with deep N-well isolation.',
    claimFocus: 'Claim 1 defines the structural relationship between STI-bounded capacitive electrodes and the floating gate in standard CMOS.',
    productLink: 'YMC 0.18µm / 0.15µm mainstream MCU MTP macro.',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2024-10-14',
    patentCategory: '裝置與製程項 (Device & Fabrication)',
    patentCategoryEn: 'Device & Fabrication',
    generation: '奠基第一代 (Gen-1 Logic MTP)',
    generationEn: 'Gen-1 Logic MTP',
    ftoStatus: '已於 2024 年 10 月屆滿 20 年進入公有領域。利用 STI 側向邊界形成電容耦合電極之製程結構現已開放自由實施。',
    ftoStatusEn: 'Expired in October 2024; entered public domain. STI boundary-assisted capacitance enhancement structure is in the public domain.'
  },
  {
    id: 'US9691784B2',
    title: 'Non-Volatile Memory Cell Array and Operating Method Thereof',
    grantDate: '2017-06-27',
    priorityDate: '2014-11-20',
    inventors: 'Hsi-Pin Kuo, Ching-Yuan Lin',
    assignee: 'Yield Microelectronics Corp.',
    url: 'https://patents.google.com/patent/US9691784B2/en',
    coreProblem: 'Automotive 150°C operation in BCD processes induces catastrophic junction leakage and intense write disturbance across adjacent unselected cells.',
    mechanism: 'Introduces isolated high-voltage wells with differential dummy bitline biasing, dynamically clamping unselected gate-to-drain stress to eliminate leakage at high temperatures.',
    claimFocus: 'Claim 1 recites a single-poly MTP array in high-voltage BCD with disturbance-mitigating dummy bias lines and erase operations.',
    productLink: 'YMC Automotive AEC-Q100 Grade-0 BCD PMIC trimming macro.',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2034-11-20',
    patentCategory: '陣列架構與操作方法項 (Array Architecture & Method)',
    patentCategoryEn: 'Array Architecture & Method',
    generation: '車規第三代 (Gen-3 BCD & High-Voltage)',
    generationEn: 'Gen-3 BCD & High-Voltage',
    ftoStatus: '專利權有效維持至 2034 年 11 月。具有強力排他權，未獲授權不得於 BCD 製程中採用該抗干擾車規陣列偏壓架構。',
    ftoStatusEn: 'Actively in force through November 2034. Protects automotive-grade high-voltage BCD array bias topologies against write disturb.'
  }
];

const ymcLitigationZh = {
  title: '單層多晶矽共面耦合專利壁壘與 0-Mask MTP 之公有領域 FTO',
  overview: '億而得 (YMC) 面對力旺電子 (eMemory NeoBit) 於雙 PMOS 浮閘領域築起的專利壁壘，開闢了一條完全自主的「純 NMOS 單層多晶矽共面水平指狀耦合 (Interdigitated In-Plane Capacitance)」專利道路。其專利組合牢牢掌握了標準純邏輯製程中無 Poly2 條件下實現高耦合率與 10,000 次擦寫的關鍵技術。',
  keyBattles: [
    {
      heading: '技術迴避與專利邊界：NMOS 共面耦合 vs. 力旺 PMOS 浮閘',
      detail: '力旺早期奠基專利 (US6678190B2 等) 嚴密鎖定「串聯 PMOS 二次電子注入 (CHEI)」技術。YMC 創辦團隊徹底繞開 PMOS 架構，完全採用標準 CMOS NMOS 搭配井區/共面多晶矽電容耦合，物理機制與單元電路均不落入力旺專利權利項涵蓋範圍，成功在大中華區各大代工廠建立自主 IP 陣營。'
    },
    {
      heading: '0-Mask 突破：指狀交錯水平電容 (US7835188B2) 與轉角尖端抹除 (US8184485B2)',
      detail: '傳統單層多晶矽 MTP 單元因耦合率不足導致面積龐大 (>60 F²)。YMC 以專利 US7835188B2 發明指狀交錯水平共面電容，將耦合率提升至 0.75 以上，面積壓縮至 30 F² 內；隨後更以專利 US8184485B2 提出多晶矽邊界轉角尖端場發射 (Corner Tip Field Emission) 抹除，將擦寫耐久度提升至 10K，奠定車用 MCU 與 PMIC 的競爭力。'
    }
  ],
  ftoVerdict: '【自由實施建議】YMC 早期 2003–2004 年申請之基礎單層多晶矽井電容結構專利（US6950342B2 與 US7119394B2）已於 2023 年與 2024 年屆滿 20 年進入公有領域，業界可自由採用其基礎 0-mask 井電容單元；但其指狀交錯水平共面耦合 (US7835188B2) 與幾何轉角尖端抹除專利 (US8184485B2) 仍分別有效保護至 2027 年與 2029 年，車規高壓 BCD 陣列專利更維持至 2034 年。'
};

const ymcLitigationEn = {
  title: 'Single-Poly Interdigitated Moat & Public Domain FTO Landscape',
  overview: 'Confronted by eMemory\'s dual-PMOS NeoBit patent ring, Yield Microelectronics Corp. (YMC) carved out an independent IP trajectory anchored in NMOS-based interdigitated in-plane single-poly capacitance. YMC\'s portfolio secures high coupling ratios and 10,000-cycle endurance in standard logic without second polysilicon masks.',
  keyBattles: [
    {
      heading: 'Design-Around Distinction: NMOS Interdigitated vs. eMemory PMOS',
      detail: 'eMemory foundational patents (US6678190B2 etc.) monopolized 2-PMOS CHEI injection. YMC completely bypassed PMOS by adopting NMOS channels with in-plane poly-to-poly capacitive coupling, ensuring non-infringement under literal and equivalence doctrines while securing independent tape-out rights across major Asian foundries.'
    },
    {
      heading: 'Zero-Mask Innovation: Interdigitated Poly (US7835188B2) & Corner Tip Erase (US8184485B2)',
      detail: 'Overcoming legacy single-poly area penalties (>60 F²), YMC US7835188B2 introduced interdigitated finger electrodes achieving >0.75 coupling ratios within <30 F² footprints. US8184485B2 further patented corner tip field emission for localized tunneling, pushing MTP endurance to 10K cycles for automotive PMICs.'
    }
  ],
  ftoVerdict: '[FTO Guidance] Foundational single-poly well-coupling patents (US6950342B2 & US7119394B2) expired in 2023 and 2024, entering the public domain. However, interdigitated horizontal coupling (US7835188B2) and corner field emission erase (US8184485B2) remain enforceable through 2027 and 2029, with automotive BCD array protections extending into 2034.'
};

// ==========================================
// 2. Impinj / Synopsys AEON 擴充資料
// ==========================================

const aeonNewPatentsZh = [
  {
    id: 'US7787304B2',
    title: '具低壓差動感測之非揮發性記憶體單元及其操作方法',
    grantDate: '2010-08-31',
    priorityDate: '2007-06-05',
    inventors: 'Christopher J. Todd, Chris Diorio',
    assignee: 'Virage Logic Corp. (原 Impinj, Inc.)',
    url: 'https://patents.google.com/patent/US7787304B2/en',
    coreProblem: '深次微米與奈米級節點下臨界電壓離散加劇且工作電壓降至 1.0V 以下，傳統單端讀取感測裕度極易受溫度與製程漂移衝擊。',
    mechanism: '採用成對互補浮閘單元結構與自平衡低壓差動感測放大器，直接比較兩互補節點微弱位移穿隧電流，在 0.8V 核心電壓下實現穩定超低功耗讀取。',
    claimFocus: '權利項 1 限定成對互補浮閘單元結構與超低工作電壓差動感測電路。',
    productLink: 'Synopsys DesignWare AEON ULP 差動高可靠度 IP 巨集。',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2027-06-05',
    patentCategory: '裝置與感測項 (Device & Sensing)',
    patentCategoryEn: 'Device & Sensing',
    generation: '先進微縮第二代 (Gen-2 ULP Differential)',
    generationEn: 'Gen-2 ULP Differential',
    ftoStatus: '專利權有效維持至 2027 年 6 月。保護成對互補浮閘差動讀取單元，防止競爭者於低壓節點無償複製該差動拓撲。',
    ftoStatusEn: 'In force through June 2027. Protects paired complementary floating-gate differential readout structures in sub-1V logic nodes.'
  },
  {
    id: 'US8264887B2',
    title: '具自適應穿隧脈衝調控之非揮發性邏輯記憶體',
    grantDate: '2012-09-11',
    priorityDate: '2009-08-14',
    inventors: 'Michael Pesavento, Christopher J. Todd',
    assignee: 'Synopsys, Inc. (承接 Virage Logic / Impinj)',
    url: 'https://patents.google.com/patent/US8264887B2/en',
    coreProblem: '重覆全 FN 穿隧會導致穿隧氧化層逐漸產生界面陷阱，固定脈衝寬度會加速氧化層電應力擊穿並縮短耐磨損壽命。',
    mechanism: '導入片上自適應穿隧脈衝回饋電路，感測前次擦寫之穿隧位移電荷量，動態調節後續編程高壓脈衝之寬度與上升斜率，大幅延緩介電層疲乏。',
    claimFocus: '權利項 1 限定依介電層疲乏程度自適應調整穿隧電壓脈衝波形與時序之操作電路。',
    productLink: 'Synopsys DesignWare AEON 10K/100K 高耐久度物聯網 IP。',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2029-08-14',
    patentCategory: '控制電路項 (Control Circuit)',
    patentCategoryEn: 'Control Circuit',
    generation: '高可靠度第二代 (Gen-2 Pulse Regulation)',
    generationEn: 'Gen-2 Pulse Regulation',
    ftoStatus: '專利權有效維持至 2029 年 8 月。具有強力排他權，保護全 FN 穿隧自適應脈衝寬度回饋控制技術。',
    ftoStatusEn: 'In force through August 2029. Grants exclusivity over adaptive tunneling pulse-width feedback regulation circuits.'
  }
];

const aeonNewPatentsEn = [
  {
    id: 'US7787304B2',
    title: 'Non-Volatile Memory Cell with Low-Voltage Differential Sensing',
    grantDate: '2010-08-31',
    priorityDate: '2007-06-05',
    inventors: 'Christopher J. Todd, Chris Diorio',
    assignee: 'Virage Logic Corp. (originally Impinj, Inc.)',
    url: 'https://patents.google.com/patent/US7787304B2/en',
    coreProblem: 'Sub-micron scaling exacerbates threshold voltage spread while operating voltages drop below 1.0V, degrading single-ended sense margins.',
    mechanism: 'Employs paired complementary floating-gate cells with a self-balanced low-voltage differential sense amplifier, comparing minute tunneling displacement currents at 0.8V VDD.',
    claimFocus: 'Claim 1 defines paired complementary floating-gate topologies with ultra-low-voltage differential sensing circuitry.',
    productLink: 'Synopsys DesignWare AEON ULP differential high-reliability macro.',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2027-06-05',
    patentCategory: '裝置與感測項 (Device & Sensing)',
    patentCategoryEn: 'Device & Sensing',
    generation: '先進微縮第二代 (Gen-2 ULP Differential)',
    generationEn: 'Gen-2 ULP Differential',
    ftoStatus: '專利權有效維持至 2027 年 6 月。保護成對互補浮閘差動讀取單元，防止競爭者於低壓節點無償複製該差動拓撲。',
    ftoStatusEn: 'In force through June 2027. Protects paired complementary floating-gate differential readout structures in sub-1V logic nodes.'
  },
  {
    id: 'US8264887B2',
    title: 'Non-Volatile Logic Semiconductor Memory with Adaptive Tunnel Pulse Regulation',
    grantDate: '2012-09-11',
    priorityDate: '2009-08-14',
    inventors: 'Michael Pesavento, Christopher J. Todd',
    assignee: 'Synopsys, Inc. (acquired from Virage Logic / Impinj)',
    url: 'https://patents.google.com/patent/US8264887B2/en',
    coreProblem: 'Repeated bidirectional Fowler-Nordheim stress creates interface traps, accelerating dielectric breakdown under fixed high-voltage pulse trains.',
    mechanism: 'Integrates on-chip closed-loop feedback sensing tunnel displacement charge per cycle to dynamically modulate subsequent programming pulse width and slew rate.',
    claimFocus: 'Claim 1 recites control circuitry adaptively shaping tunneling voltage pulse parameters based on accumulated oxide fatigue.',
    productLink: 'Synopsys DesignWare AEON 10K/100K high-endurance IoT IP.',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2029-08-14',
    patentCategory: '控制電路項 (Control Circuit)',
    patentCategoryEn: 'Control Circuit',
    generation: '高可靠度第二代 (Gen-2 Pulse Regulation)',
    generationEn: 'Gen-2 Pulse Regulation',
    ftoStatus: '專利權有效維持至 2029 年 8 月。具有強力排他權，保護全 FN 穿隧自適應脈衝寬度回饋控制技術。',
    ftoStatusEn: 'In force through August 2029. Grants exclusivity over adaptive tunneling pulse-width feedback regulation circuits.'
  }
];

const aeonLitigationZh = {
  title: '全 FN 穿隧零通道功耗壁壘與無源 RFID/ULP 物聯網專利護城河',
  overview: 'AEON® (Impinj / Virage Logic / Synopsys) 的專利戰略是超低功耗半導體 IP 的經典範本。傳統 NVM 技術（如 Flash/EEPROM）普遍仰賴通道熱電子注入 (CHEI)，寫入時需要毫安培級通道導通電流；AEON 創辦人 Chris Diorio 團隊則從量子第一性原理出發，徹底揚棄通道直流電流，開創了「純量子雙向全 FN 穿隧 (FN/FN)」專利護城河，奠定全球無源 RFID 標籤與鈕扣電池物聯網晶片的產業標準。',
  keyBattles: [
    {
      heading: '解決 RFID 致命痛點：零通道電流全 FN 穿隧專利 (US6166953A)',
      detail: '無源射頻標籤 (Passive RFID) 完全依靠天線收集微弱電磁波供電，任何超過微安培的瞬間負載都會導致晶片掉電。Impinj 專利限定浮動閘極跨越對稱的獨立雙井結構，寫入與抹除均依賴微弱量子穿隧位移電流 (<100pA)，使晶片能在僅由射頻能量採集供電的極端條件下完成資料燒寫，徹底壟斷了 EPC Gen2 RFID 標籤的技術路線。'
    },
    {
      heading: '企業併購與專利承接：從 Impinj、Virage Logic 到 Synopsys DesignWare',
      detail: '2008 年矽智財大廠 Virage Logic 斥資收購 Impinj NVM 事業部及其 80 餘件專利；2010 年 EDA 霸主 Synopsys 再以 3.15 億美元收購 Virage Logic。經過兩輪重大整合，AEON 專利池被完全納入 Synopsys DesignWare 核心 IP 庫，並陸續申請了差動讀取 (US7787304B2) 與自適應脈衝調控 (US8264887B2) 專利，建構了覆蓋 0.18µm 至 28nm/22ULL 超低功耗 SoC 的嚴密專利網。'
    }
  ],
  ftoVerdict: '【自由實施建議】Impinj 初代兩大標誌性奠基專利（US6166953A 與 US6388918B1）已分別於 2019 年 4 月與 2020 年 6 月屆滿 20 年進入公有領域！這代表全球半導體產業界現已可合法、免授權實施「標準 CMOS 雙井電容耦合與純 FN 穿隧無通道直流電流」之基礎 MTP 架構；但 Synopsys 在低壓差動感測與自適應脈衝微調之後續專利仍分別有效維持至 2027 年與 2029 年。'
};

const aeonLitigationEn = {
  title: 'All-FN Zero-Channel-Current Moat & Passive RFID Patent Fortress',
  overview: 'AEON® represents the ultimate IP paradigm for ultra-low-power logic NVM. While conventional Flash and EEPROM designs rely on channel hot-electron injection (CHEI) drawing milliamperes of DC current, Dr. Chris Diorio\'s team engineered pure quantum bidirectional Fowler-Nordheim (FN/FN) tunneling displacement currents (<100pA), establishing the global standard for passive RFID and battery-free IoT nodes.',
  keyBattles: [
    {
      heading: 'Overcoming the RFID Power Cliff: Zero-DC-Current Tunneling (US6166953A)',
      detail: 'Passive RF tags harvest energy strictly from weak ambient electromagnetic fields; milliampere surges collapse tag power supplies. Impinj patented dual-well balanced capacitive structures where floating gates couple across isolated wells, restricting programming power to picoampere displacement currents and dominating the EPC Gen2 UHF RFID standard.'
    },
    {
      heading: 'Strategic Acquisitions & IP Consolidation: Impinj to Virage Logic to Synopsys',
      detail: 'In 2008, Virage Logic acquired Impinj\'s NVM business and 80+ patents; in 2010, EDA titan Synopsys acquired Virage Logic for $315M. Fully integrated into Synopsys DesignWare, AEON continued expanding into sub-1V differential sensing (US7787304B2) and adaptive pulse modulation (US8264887B2), spanning mature logic down to 28nm/22ULL IoT nodes.'
    }
  ],
  ftoVerdict: '[FTO Guidance] Impinj foundational pioneer patents (US6166953A & US6388918B1) expired in April 2019 and June 2020, entering the public domain. Industry may freely practice standard CMOS dual-well capacitance coupling and all-FN tunneling zero-channel current structures. However, Synopsys low-voltage differential sensing and adaptive pulse shaping patents remain active through 2027 and 2029.'
};

// ==========================================
// 3. NSCore, Inc. (TwinBit®) 全新廠商檔案
// ==========================================

const nscoreVendorZh = {
  id: 'nscore',
  name: 'NSCore, Inc. (株式会社エヌエスコア)',
  shortName: 'NSCore (TwinBit®)',
  headquarters: '日本神奈川縣川崎市 (Kawasaki, Kanagawa, Japan)',
  founded: '2001 年',
  founders: 'Satoshi Seo (CEO / 創辦人), Kenji Hokazono 等 NEC 記憶體核心研發團隊',
  businessModel: '標準 CMOS 邏輯製程原生側壁間隔層 (Sidewall Spacer) 電荷捕捉 1.5T/2T MTP IP 授權',
  patentStats: {
    totalGrantedWorldwide: '50+ 件全球核准專利',
    keyJurisdictions: '日本 (JPO)、美國 (USPTO)、台灣 (TIPO)、中國 (CNIPA)',
    foundryCoverage: '台積電 (TSMC)、聯電 (UMC)、格芯 (GlobalFoundries)、中芯國際 (SMIC)、東部高科 (DB HiTek)',
    waferShipment: '累計授權導入逾數百款車用微控制器、智慧卡與工業物聯網晶片，量產規模達數十億顆'
  },
  strategy: 'NSCore 專利戰略的核心為徹底顛覆傳統邏輯 NVM 對「專用浮動閘極多晶矽層」或「專屬額外光罩」之依賴。NSCore 創辦團隊敏銳地發現：標準 CMOS 邏輯製程中，電晶體閘極兩側原本就必須沈積的氮化矽/氧化矽側壁間隔層 (Sidewall Spacer)，本質上就是天然的深能階電荷捕捉介質 (Charge-Trapping Medium)。透過精準控制熱載子注入，在完全 0 額外光罩、0 製程改動的極致相容條件下，在同一電晶體兩端 Spacer 分別儲存獨立電荷實現 2-bit/cell (TwinBit®)，並在 40nm 至 22nm 節點進一步演進出 Pch Schottky MTP 專利架構。',
  families: [
    {
      id: 'nscore-spacer-family',
      name: 'NSCore TwinBit® 原生側壁電荷捕捉 MTP 專利家族',
      tagline: '標準邏輯原生側壁間隔層 (Spacer) · 2-bit/cell 雙位元 · 0-Mask 高溫車規 MTP',
      technologyType: 'Charge-Trapping MTP (電荷捕捉多次可程式化)',
      cellTopology: 'Native Sidewall Spacer Split-Storage (原生側壁間隔層分離儲存單元)',
      physicalMechanism: '順向通道熱電子/熱電洞注入 (CHEI/CHHI) 於側壁間隔層捕捉陷阱；逆向偏壓感測臨界電壓漂移',
      processNode: '0.18µm / 0.13µm / 90nm / 65nm / 55nm / 40nm / 28nm / 22nm 標準 CMOS',
      summary: '極致利用標準 CMOS 原生結構之非揮發技術代表作。完全無需任何額外光罩或熱製程，直接以天然電晶體側壁間隔層作為電荷儲存層，每顆電晶體左右兩側可分別獨立儲存 1 個位元 (TwinBit)，使記憶體核心面積縮小達 40%，且深能階陷阱在 150°C 高溫下展現極佳的車規資料保存能力。',
      patents: [
        {
          id: 'US6930349B2',
          title: '非揮發性半導體記憶裝置及其製造方法',
          grantDate: '2005-08-16',
          priorityDate: '2002-12-05',
          inventors: 'Satoshi Seo, Kenji Hokazono',
          assignee: 'NSCore, Inc.',
          url: 'https://patents.google.com/patent/US6930349B2/en',
          coreProblem: '傳統嵌入式 Flash 需要 3 至 8 道額外光罩，導致成熟與先進邏輯晶片晶圓成本巨幅暴增。',
          mechanism: '利用標準 CMOS 閘極側壁之氮化矽/氧化矽間隔層 (Spacer) 作為非揮發電荷儲存層，在標準邏輯製程流程完全不作任何修改之條件下實現非揮發儲存。',
          claimFocus: '權利項 1 限定利用標準邏輯電晶體之側壁間隔層 (Sidewall Spacer) 作為非揮發電荷捕捉層之單元結構與製造方法。',
          productLink: 'NSCore 初代 TwinBit® Gen-1 0.18µm / 0.13µm 邏輯 MTP IP。',
          legalStatus: 'expired',
          legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
          legalStatusEn: 'Expired · Public Domain',
          expirationDate: '2022-12-05',
          patentCategory: '裝置結構與製造項 (Device Structure & Fabrication)',
          patentCategoryEn: 'Device Structure & Fabrication',
          generation: '奠基第一代 (Gen-1 Spacer Trapping)',
          generationEn: 'Gen-1 Spacer Trapping',
          ftoStatus: '已於 2022 年 12 月屆滿 20 年進入公有領域。利用標準 CMOS 電晶體天然閘極側壁間隔層 (Spacer) 作為電荷捕捉介質之基礎結構已開放自由實施。',
          ftoStatusEn: 'Expired in December 2022 after full 20-year term; entered public domain. Pioneer patent covering native CMOS sidewall spacer as charge-trapping medium is free to operate.'
        },
        {
          id: 'US7245532B2',
          title: '每單元具兩個電荷儲存區之非揮發性半導體記憶裝置',
          grantDate: '2007-07-17',
          priorityDate: '2004-03-24',
          inventors: 'Satoshi Seo, Tomoya Saito',
          assignee: 'NSCore, Inc.',
          url: 'https://patents.google.com/patent/US7245532B2/en',
          coreProblem: '如何使單一標準邏輯電晶體儲存 2 個以上位元，以在成熟節點進一步降低位元成本？',
          mechanism: '利用非對稱順向通道熱電子注入 (CHEI) 分別對電晶體 Source 側與 Drain 側 Spacer 獨立寫入電荷，並以逆向讀取 (Reverse Read) 消除互鎖干擾，達成物理雙位元 (TwinBit) 儲存。',
          claimFocus: '權利項 1 限定單一電晶體兩端側壁各自獨立捕捉電荷之雙位元寫入偏壓與逆向讀取操作方法。',
          productLink: 'NSCore 主流 TwinBit 2-bit/cell 高密度 MCU 巨集。',
          legalStatus: 'expired',
          legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
          legalStatusEn: 'Expired · Public Domain',
          expirationDate: '2024-03-24',
          patentCategory: '操作方法項 (Method / Operation)',
          patentCategoryEn: 'Method / Operation',
          generation: '奠基第一代 (Gen-1 TwinBit 2-bit/cell)',
          generationEn: 'Gen-1 TwinBit 2-bit/cell',
          ftoStatus: '已於 2024 年 3 月屆滿 20 年進入公有領域。單晶體雙側壁獨立注入與逆向讀取達成 2-bit/cell 之操作方法已無專利排他權。',
          ftoStatusEn: 'Expired in March 2024; entered public domain. 2-bit/cell independent spacer programming and reverse-read operations are in the public domain.'
        },
        {
          id: 'US7768832B2',
          title: '具改進干擾抑制之非揮發性半導體記憶裝置',
          grantDate: '2010-08-03',
          priorityDate: '2007-06-15',
          inventors: 'Satoshi Seo, Tomoya Saito',
          assignee: 'NSCore, Inc.',
          url: 'https://patents.google.com/patent/US7768832B2/en',
          coreProblem: '大規模陣列重複寫入時，未選取字元線之高電壓會引發非預期的側壁電荷洩漏或軟寫入干擾 (Soft Disturb)。',
          mechanism: '導入三段式字元線階梯偏壓與基板反向偏壓控制技術，在程式化期間動態拉高未選取單元之表面電位，將陣列干擾裕度提高 10 倍以上。',
          claimFocus: '權利項 1 限定側壁電荷捕捉陣列中抑制相鄰未選取單元讀寫干擾之分段偏壓電路與控制方法。',
          productLink: 'NSCore 工業級與車規 AEC-Q100 Grade-1 TwinBit 陣列。',
          legalStatus: 'active',
          legalStatusZh: '有效專利 (In-Force / Active)',
          legalStatusEn: 'In-Force / Active',
          expirationDate: '2027-06-15',
          patentCategory: '陣列架構項 (Array Architecture)',
          patentCategoryEn: 'Array Architecture',
          generation: '微縮第二代 (Gen-2 Anti-Disturb)',
          generationEn: 'Gen-2 Anti-Disturb',
          ftoStatus: '專利權有效維持至 2027 年 6 月。具有強力排他權，保護側壁電荷捕捉陣列之防干擾分段偏壓控制技術。',
          ftoStatusEn: 'In force through June 2027. Protects array bias regulation topologies suppressing soft-disturb in spacer charge-trapping matrices.'
        },
        {
          id: 'US8760927B2',
          title: '具肖特基勢壘或 P 通道載子捕捉之非揮發性半導體記憶裝置',
          grantDate: '2014-06-24',
          priorityDate: '2013-05-15',
          inventors: 'Satoshi Seo, Kenji Hokazono',
          assignee: 'NSCore, Inc.',
          url: 'https://patents.google.com/patent/US8760927B2/en',
          coreProblem: '微縮至 40nm/28nm 先進節點時，NMOS 高壓熱電子注入會嚴重破壞超薄氧化層；如何在更薄介電層下維持高擦寫耐久度？',
          mechanism: '演進為 TwinBit Gen-2 架構，採用 Pch Schottky 電晶體為儲存元件，以熱電洞 (Hot Hole) 寫入、熱電子 (Hot Electron) 抹除，徹底消除氧化層高場疲乏，實現 40–22nm 零額外光罩超高可靠度 MTP。',
          claimFocus: '權利項 1 限定 P 通道 Schottky 接面單元搭配熱電洞寫入/熱電子抹除之非揮發性記憶體結構與操作方法。',
          productLink: 'NSCore TwinBit Gen-2 40nm–22nm 先進節點標準產品庫。',
          legalStatus: 'active',
          legalStatusZh: '有效專利 (In-Force / Active)',
          legalStatusEn: 'In-Force / Active',
          expirationDate: '2033-05-15',
          patentCategory: '裝置與操作項 (Device & Operation)',
          patentCategoryEn: 'Device & Operation',
          generation: '先進第三代 (Gen-3 Schottky MTP)',
          generationEn: 'Gen-3 Schottky MTP',
          ftoStatus: '專利權有效維持至 2033 年 5 月。保護 TwinBit Gen-2 Pch Schottky 熱電洞寫入/熱電子抹除架構，覆蓋 40nm 至 22nm 節點。',
          ftoStatusEn: 'Actively in force through May 2033. Protects TwinBit Gen-2 P-channel Schottky hot-hole write and hot-electron erase architecture across 40nm–22nm nodes.'
        }
      ]
    }
  ],
  litigationDefense: {
    title: '天然側壁間隔層 (Spacer) 電荷捕捉專利壁壘與 2-bit/cell 公有領域開放',
    overview: 'NSCore 創辦於 2001 年，由原 NEC 記憶體技術研發主管 Satoshi Seo 領軍。NSCore 走出了一條完全顛覆傳統浮動閘極思維的純邏輯 NVM 道路：一般標準邏輯製程中，電晶體閘極兩側原本就必須沈積氮化矽/氧化矽間隔層 (Spacer) 來阻擋輕摻雜汲極 (LDD) 離子注入；NSCore 敏銳地發現 Spacer 本身就是天然的氮化矽電荷捕捉層 (SiN Trap Layer)，徹底打破傳統需要專用浮閘多晶矽的思維。',
    keyBattles: [
      {
        heading: '0 額外光罩與 0 製程改動之極限相容：Spacer 電荷捕捉 vs. 傳統 eFlash',
        detail: '傳統嵌入式快閃記憶體 (如 SST SuperFlash 或 Infineon SONOS) 雖然具備優異性能，但需額外增加 3 至 8 道光罩與專屬高溫熱製程，嚴重延誤先進邏輯節點移轉。NSCore 奠基專利 (US6930349B2) 限定直接利用標準 CMOS 原生 Spacer 作為物理儲存節點，晶圓代工廠完全無需修改任何設計規則 (DRC) 或 SPICE 模型，實現了真正的 100% 邏輯製程相容。'
      },
      {
        heading: '左右對稱雙位元 (TwinBit) 物理分離讀寫 (US7245532B2)',
        detail: '相較於傳統 OTP/MTP 一顆電晶體僅能儲存一個位元，NSCore 專利利用順向通道熱電子注入 (CHEI) 分別對 Source 側與 Drain 側 Spacer 獨立注入電子，並利用逆向讀取 (Reverse Read) 判定臨界電壓，在單一標準電晶體中實現 2 個獨立位元儲存 (TwinBit)，使晶片核心面積較傳統 OTP 縮小 40% 以上。'
      },
      {
        heading: 'Gen-2 Pch Schottky 演進 (US8760927B2) 與車規高溫留存',
        detail: '為突破微縮至 40nm/28nm/22nm 時 NMOS 穿隧氧化層疲乏極限，NSCore 演進出 TwinBit Gen-2，以 Pch Schottky 電晶體為基礎，採熱電洞寫入、熱電子抹除。深能階陷阱緊密束縛電子與電洞，局部介電層缺陷不致造成全域電荷洩漏，在車用 150°C 高溫下展現極佳的資料留存特性。'
      }
    ],
    ftoVerdict: '【自由實施建議】NSCore 奠基之「原生電晶體側壁間隔層作為電荷捕捉儲存單元」核心結構專利 US6930349B2 已於 2022 年 12 月屆滿 20 年進入公有領域；其單元雙位元獨立讀寫方法專利 US7245532B2 亦於 2024 年 3 月屆滿進入公有領域！半導體業界現可免授權實施此原生 Spacer 儲存基礎架構；但其抗干擾陣列偏壓 (US7768832B2) 與 Gen-2 Pch Schottky MTP 核心專利 (US8760927B2) 仍分別維持有效至 2027 年與 2033 年。'
  },
  milestones: [
    {
      period: '2001–2005',
      era: '創立與原生 Spacer 儲存技術發明',
      theme: '0 額外光罩 TwinBit 奠基',
      summary: '原 NEC 團隊發明利用標準 CMOS 天然側壁間隔層捕捉電荷之 TwinBit 技術，取得 US6930349B2 等核心奠基專利。',
      nodes: '0.18µm / 0.13µm',
      keyPatents: 'US6930349B2, US7245532B2'
    },
    {
      period: '2006–2012',
      era: '全球代工廠普及與 TwinBit 商用量產',
      theme: '全面登陸台積電、聯電與格芯',
      summary: 'TwinBit MTP 與 PermSRAM OTP 導入 TSMC、UMC、GF、SMIC、Dongbu 等代工平台，廣泛授權智慧卡與微控制器。',
      nodes: '90nm / 65nm / 55nm',
      keyPatents: 'US7768832B2'
    },
    {
      period: '2013–2026',
      era: 'Gen-2 Pch Schottky 突破與先進節點深耕',
      theme: '微縮至 40nm/28nm/22nm 與車規高可靠度',
      summary: '推出 TwinBit Gen-2 Pch Schottky 架構，以熱電洞寫入、熱電子抹除克服奈米節點氧化層疲乏，深耕車規 150°C 市場。',
      nodes: '40nm / 28nm / 22nm',
      keyPatents: 'US8760927B2'
    }
  ]
};

const nscoreVendorEn = {
  id: 'nscore',
  name: 'NSCore, Inc.',
  shortName: 'NSCore (TwinBit®)',
  headquarters: 'Kawasaki, Kanagawa, Japan',
  founded: '2001',
  founders: 'Satoshi Seo (CEO / Founder), Kenji Hokazono and former NEC memory R&D core engineering team',
  businessModel: 'Native Sidewall Spacer Charge-Trapping 1.5T/2T Logic MTP IP Licensing (Zero-Mask Standard CMOS)',
  patentStats: {
    totalGrantedWorldwide: '50+ Granted Worldwide Patents',
    keyJurisdictions: 'Japan (JPO), United States (USPTO), Taiwan (TIPO), China (CNIPA)',
    foundryCoverage: 'TSMC, UMC, GlobalFoundries, SMIC, DB HiTek',
    waferShipment: 'Licensed across hundreds of automotive MCUs, smartcards, and industrial IoT designs; billions of units in volume shipment'
  },
  strategy: 'NSCore\'s patent strategy fundamentally eliminates reliance on dedicated floating-gate poly masks or expensive thermal steps. The founding team recognized that the native silicon nitride/oxide sidewall spacers inherently deposited on standard CMOS gates serve naturally as deep-level charge-trapping media. By controlling localized hot-carrier injection under 100% standard CMOS compatibility (zero extra masks, zero process changes), NSCore stores independent charges on both spacers of a single transistor to deliver 2-bit/cell (TwinBit®), advancing to P-channel Schottky MTP architectures in 40nm to 22nm nodes.',
  families: [
    {
      id: 'nscore-spacer-family',
      name: 'NSCore TwinBit® Native Spacer Charge-Trapping Patent Portfolio',
      tagline: 'Standard CMOS Native Sidewall Spacer · 2-bit/cell Storage · Zero-Mask High-Temperature Automotive MTP',
      technologyType: 'Charge-Trapping MTP (Multiple-Time Programmable)',
      cellTopology: 'Native Sidewall Spacer Split-Storage (1.5T/2T)',
      physicalMechanism: 'Forward channel hot carrier injection (CHEI/CHHI) localized in spacer dielectric traps; reverse read threshold voltage sensing',
      processNode: '0.18µm / 0.13µm / 90nm / 65nm / 55nm / 40nm / 28nm / 22nm Standard CMOS',
      summary: 'Masterpiece of native CMOS non-volatile memory engineering. Completely eliminates extra mask layers by directly utilizing native transistor sidewall spacers as non-volatile charge traps. Independent 2-bit/cell (TwinBit) storage reduces bitcell silicon area by up to 40%, while deep traps provide superior 150°C automotive data retention.',
      patents: [
        {
          id: 'US6930349B2',
          title: 'Nonvolatile Semiconductor Memory Device and Method of Manufacturing the Same',
          grantDate: '2005-08-16',
          priorityDate: '2002-12-05',
          inventors: 'Satoshi Seo, Kenji Hokazono',
          assignee: 'NSCore, Inc.',
          url: 'https://patents.google.com/patent/US6930349B2/en',
          coreProblem: 'Embedded flash traditionally requires 3 to 8 additional masks, drastically escalating wafer costs in advanced and mature logic chips.',
          mechanism: 'Utilizes standard CMOS transistor gate sidewall spacers (silicon nitride/oxide) as non-volatile charge storage layers without altering foundry process flows.',
          claimFocus: 'Claim 1 recites a non-volatile memory cell using standard transistor sidewall spacers as charge-trapping layers and its zero-extra-mask fabrication method.',
          productLink: 'NSCore Gen-1 TwinBit® 0.18µm / 0.13µm logic MTP IP baseline.',
          legalStatus: 'expired',
          legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
          legalStatusEn: 'Expired · Public Domain',
          expirationDate: '2022-12-05',
          patentCategory: '裝置結構與製造項 (Device Structure & Fabrication)',
          patentCategoryEn: 'Device Structure & Fabrication',
          generation: '奠基第一代 (Gen-1 Spacer Trapping)',
          generationEn: 'Gen-1 Spacer Trapping',
          ftoStatus: '已於 2022 年 12 月屆滿 20 年進入公有領域。利用標準 CMOS 電晶體天然閘極側壁間隔層 (Spacer) 作為電荷捕捉介質之基礎結構已開放自由實施。',
          ftoStatusEn: 'Expired in December 2022 after full 20-year term; entered public domain. Pioneer patent covering native CMOS sidewall spacer as charge-trapping medium is free to operate.'
        },
        {
          id: 'US7245532B2',
          title: 'Nonvolatile Semiconductor Memory Device Having Two Charge Storage Regions per Cell',
          grantDate: '2007-07-17',
          priorityDate: '2004-03-24',
          inventors: 'Satoshi Seo, Tomoya Saito',
          assignee: 'NSCore, Inc.',
          url: 'https://patents.google.com/patent/US7245532B2/en',
          coreProblem: 'How to achieve multi-bit storage in a single standard CMOS transistor to reduce silicon cost in mature geometries?',
          mechanism: 'Employs asymmetric channel hot-electron injection (CHEI) into Source-side and Drain-side spacers independently, reading via reverse-bias sensing to achieve 2-bit/cell (TwinBit) without cross-talk.',
          claimFocus: 'Claim 1 defines independent two-charge storage region programming and reverse-read operations in a single transistor.',
          productLink: 'NSCore mainstream TwinBit 2-bit/cell dense MCU macro.',
          legalStatus: 'expired',
          legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
          legalStatusEn: 'Expired · Public Domain',
          expirationDate: '2024-03-24',
          patentCategory: '操作方法項 (Method / Operation)',
          patentCategoryEn: 'Method / Operation',
          generation: '奠基第一代 (Gen-1 TwinBit 2-bit/cell)',
          generationEn: 'Gen-1 TwinBit 2-bit/cell',
          ftoStatus: '已於 2024 年 3 月屆滿 20 年進入公有領域。單晶體雙側壁獨立注入與逆向讀取達成 2-bit/cell 之操作方法已無專利排他權。',
          ftoStatusEn: 'Expired in March 2024; entered public domain. 2-bit/cell independent spacer programming and reverse-read operations are in the public domain.'
        },
        {
          id: 'US7768832B2',
          title: 'Nonvolatile Semiconductor Memory Device with Improved Disturb Immunity',
          grantDate: '2010-08-03',
          priorityDate: '2007-06-15',
          inventors: 'Satoshi Seo, Tomoya Saito',
          assignee: 'NSCore, Inc.',
          url: 'https://patents.google.com/patent/US7768832B2/en',
          coreProblem: 'High-voltage pulses during massive array cycling induce unexpected charge leakage or soft disturb on unselected wordlines.',
          mechanism: 'Implements three-level stepped wordline biasing and substrate reverse-biasing to dynamically boost surface potential of unselected cells, improving disturb margin tenfold.',
          claimFocus: 'Claim 1 recites segmented bias circuitry and methods suppressing disturb in spacer charge-trapping memory arrays.',
          productLink: 'NSCore Industrial and Automotive AEC-Q100 Grade-1 TwinBit array.',
          legalStatus: 'active',
          legalStatusZh: '有效專利 (In-Force / Active)',
          legalStatusEn: 'In-Force / Active',
          expirationDate: '2027-06-15',
          patentCategory: '陣列架構項 (Array Architecture)',
          patentCategoryEn: 'Array Architecture',
          generation: '微縮第二代 (Gen-2 Anti-Disturb)',
          generationEn: 'Gen-2 Anti-Disturb',
          ftoStatus: '專利權有效維持至 2027 年 6 月。具有強力排他權，保護側壁電荷捕捉陣列之防干擾分段偏壓控制技術。',
          ftoStatusEn: 'In force through June 2027. Protects array bias regulation topologies suppressing soft-disturb in spacer charge-trapping matrices.'
        },
        {
          id: 'US8760927B2',
          title: 'Nonvolatile Semiconductor Memory Device Using Schottky Barrier Diode or P-Channel Carrier Trapping',
          grantDate: '2014-06-24',
          priorityDate: '2013-05-15',
          inventors: 'Satoshi Seo, Kenji Hokazono',
          assignee: 'NSCore, Inc.',
          url: 'https://patents.google.com/patent/US8760927B2/en',
          coreProblem: 'Scaling to 40nm/28nm thin oxides degrades under NMOS hot-electron stress; how to sustain high cycling endurance in sub-40nm?',
          mechanism: 'Advances into TwinBit Gen-2, utilizing P-channel Schottky transistors with hot-hole write and hot-electron erase, eliminating high-field oxide fatigue for zero-mask 40nm–22nm MTP.',
          claimFocus: 'Claim 1 defines a P-channel Schottky junction cell with hot-hole write and hot-electron erase nonvolatile operation.',
          productLink: 'NSCore TwinBit Gen-2 40nm–22nm advanced PDK portfolio.',
          legalStatus: 'active',
          legalStatusZh: '有效專利 (In-Force / Active)',
          legalStatusEn: 'In-Force / Active',
          expirationDate: '2033-05-15',
          patentCategory: '裝置與操作項 (Device & Operation)',
          patentCategoryEn: 'Device & Operation',
          generation: '先進第三代 (Gen-3 Schottky MTP)',
          generationEn: 'Gen-3 Schottky MTP',
          ftoStatus: '專利權有效維持至 2033 年 5 月。保護 TwinBit Gen-2 Pch Schottky 熱電洞寫入/熱電子抹除架構，覆蓋 40nm 至 22nm 節點。',
          ftoStatusEn: 'Actively in force through May 2033. Protects TwinBit Gen-2 P-channel Schottky hot-hole write and hot-electron erase architecture across 40nm–22nm nodes.'
        }
      ]
    }
  ],
  litigationDefense: {
    title: 'Native Sidewall Spacer Trapping Moat & 2-bit/cell Public Domain Opening',
    overview: 'Founded in 2001 by former NEC memory technology leader Satoshi Seo, NSCore established a revolutionary logic NVM route that overturned conventional floating-gate paradigms. Standard logic CMOS intrinsically deposits silicon nitride/oxide sidewall spacers to block LDD implants; NSCore discovered that spacers naturally act as deep-level silicon nitride charge traps (SiN Trap Layer), eliminating specialized floating gate poly masks.',
    keyBattles: [
      {
        heading: 'Zero-Extra-Mask Extreme Compatibility: Spacer Trapping vs. eFlash',
        detail: 'Conventional embedded flash (e.g., SST SuperFlash, Infineon SONOS) requires 3 to 8 additional masks and specialized high-temperature annealing, stalling logic node migration. NSCore pioneer patent US6930349B2 strictly utilizes native CMOS spacers as physical storage nodes, requiring zero DRC modifications or SPICE model changes from silicon foundries.'
      },
      {
        heading: 'Symmetric Dual-Bit Physical Separation (TwinBit US7245532B2)',
        detail: 'Unlike traditional 1-bit OTP/MTP bitcells, NSCore patented forward CHEI injection into source-side and drain-side spacers independently, combined with reverse-bias sensing to evaluate threshold shifts. This achieves 2 independent bits per single standard transistor (TwinBit), shrinking core cell area by over 40%.'
      },
      {
        heading: 'Gen-2 Pch Schottky Evolution (US8760927B2) & Automotive High-Temp Retention',
        detail: 'Overcoming oxide wearout in sub-40nm scaling, NSCore engineered TwinBit Gen-2 with Pch Schottky bitcells using hot-hole write and hot-electron erase. Deep dielectric traps tightly confine charges, preventing global charge leakage and delivering outstanding 150°C automotive data retention.'
      }
    ],
    ftoVerdict: '[FTO Guidance] NSCore foundational patent US6930349B2 (native CMOS sidewall spacer charge storage) expired in December 2022 after its 20-year term. Dual-bit independent reverse-read patent US7245532B2 also expired in March 2024. The semiconductor industry may freely practice native spacer storage topologies. However, array anti-disturb bias (US7768832B2) and Gen-2 Pch Schottky MTP (US8760927B2) remain actively protected through 2027 and 2033.'
  },
  milestones: [
    {
      period: '2001–2005',
      era: 'Founding & Native Spacer Storage Invention',
      theme: 'Zero-Mask TwinBit Pioneer',
      summary: 'Former NEC engineers invent TwinBit utilizing native CMOS sidewall spacers, securing foundational patents US6930349B2 and US7245532B2.',
      nodes: '0.18µm / 0.13µm',
      keyPatents: 'US6930349B2, US7245532B2'
    },
    {
      period: '2006–2012',
      era: 'Foundry Proliferation & Volume Tape-outs',
      theme: 'Qualification across TSMC, UMC, and GF',
      summary: 'TwinBit MTP and PermSRAM OTP proliferate across TSMC, UMC, GlobalFoundries, SMIC, and DB HiTek for smartcards and MCU designs.',
      nodes: '90nm / 65nm / 55nm',
      keyPatents: 'US7768832B2'
    },
    {
      period: '2013–2026',
      era: 'Gen-2 Pch Schottky Breakthrough & Automotive Nodes',
      theme: 'Scaling to 40nm/28nm/22nm and Automotive 150°C',
      summary: 'Launches TwinBit Gen-2 Pch Schottky architecture using hot-hole write and hot-electron erase to overcome nanometer oxide wearout.',
      nodes: '40nm / 28nm / 22nm',
      keyPatents: 'US8760927B2'
    }
  ]
};

// ==========================================
// 4. 執行注入與更新
// ==========================================

function updateDataset(data, isEn) {
  // A. 更新 YMC
  const ymc = data.vendors.find(v => v.id === 'ymc');
  if (ymc) {
    const newPatents = isEn ? ymcNewPatentsEn : ymcNewPatentsZh;
    for (const np of newPatents) {
      if (!ymc.families[0].patents.some(p => p.id === np.id)) {
        ymc.families[0].patents.push(np);
      }
    }
    // 依申請日或期滿日排序：先 expired 再 active，按優先權日排序
    ymc.families[0].patents.sort((a, b) => a.priorityDate.localeCompare(b.priorityDate));
    ymc.litigationDefense = isEn ? ymcLitigationEn : ymcLitigationZh;
  }

  // B. 更新 Impinj/Synopsys AEON
  const aeon = data.vendors.find(v => v.id === 'impinj-aeon');
  if (aeon) {
    const newPatents = isEn ? aeonNewPatentsEn : aeonNewPatentsZh;
    for (const np of newPatents) {
      if (!aeon.families[0].patents.some(p => p.id === np.id)) {
        aeon.families[0].patents.push(np);
      }
    }
    aeon.families[0].patents.sort((a, b) => a.priorityDate.localeCompare(b.priorityDate));
    aeon.litigationDefense = isEn ? aeonLitigationEn : aeonLitigationZh;
  }

  // C. 加入 NSCore
  const existingNscoreIdx = data.vendors.findIndex(v => v.id === 'nscore');
  const targetNscore = isEn ? nscoreVendorEn : nscoreVendorZh;
  if (existingNscoreIdx >= 0) {
    data.vendors[existingNscoreIdx] = targetNscore;
  } else {
    // 插入在 impinj-aeon 之後，保持邏輯 MTP 陣容群聚
    const aeonIdx = data.vendors.findIndex(v => v.id === 'impinj-aeon');
    if (aeonIdx >= 0) {
      data.vendors.splice(aeonIdx + 1, 0, targetNscore);
    } else {
      data.vendors.push(targetNscore);
    }
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

console.log('Stage 2 (YMC, Impinj AEON, NSCore) 專利與深度案卷已成功注入！');
