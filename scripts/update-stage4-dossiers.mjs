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
// 1. Everspin Technologies 擴充資料
// ==========================================

const everspinNewPatentsZh = [
  {
    id: 'US9087588B2',
    title: '具自旋軌道矩與自旋轉矩輔助翻轉之磁記憶體元件',
    grantDate: '2015-07-21',
    priorityDate: '2013-03-14',
    inventors: 'Sanjeev Aggarwal, Dmytro Apalkov',
    assignee: 'Everspin Technologies, Inc.',
    url: 'https://patents.google.com/patent/US9087588B2/en',
    coreProblem: '純 STT 翻轉在高寫入速度 (<10ns) 時需要施加極高電壓，容易引發超薄 MgO 穿隧障壁之電應力擊穿。',
    mechanism: '結合自旋軌道矩 (SOT) 重金屬底層與垂直 STT 穿隧接面，以平面 SOT 電流提供初始大角度翻轉力矩，再以微弱 STT 電流完成確定性翻轉，將寫入電壓降低 60% 並突破 2ns 極限寫入速度。',
    claimFocus: '權利項 1 限定由自旋軌道矩 (SOT) 重金屬線路與垂直自旋轉矩 (STT) 穿隧接面複合構成之超高速磁記憶單元結構與操作方法。',
    productLink: 'Everspin PERSYST™ 超高速下一代低延遲 MRAM 系列。',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2033-03-14',
    patentCategory: '裝置與操作項 (Device & Operation)',
    patentCategoryEn: 'Device & Operation',
    generation: '先進第四代 (Gen-4 SOT/STT Hybrid)',
    generationEn: 'Gen-4 SOT/STT Hybrid',
    ftoStatus: '專利權有效維持至 2033 年 3 月。具有強力排他權，保護 SOT 重金屬線路與垂直 MTJ 複合結構之雙重自旋輔助翻轉技術。',
    ftoStatusEn: 'In force through March 2033. Grants exclusivity over hybrid spin-orbit torque (SOT) and spin-transfer torque (STT) magnetic memory cells.'
  },
  {
    id: 'US10886461B2',
    title: '具雙 MgO 穿隧障壁與合成反鐵磁釘選之垂直磁性穿隧接面',
    grantDate: '2021-01-05',
    priorityDate: '2018-08-20',
    inventors: 'Dmytro Apalkov, Mohamad Krounbi',
    assignee: 'Everspin Technologies, Inc.',
    url: 'https://patents.google.com/patent/US10886461B2/en',
    coreProblem: '節點微縮至 28nm/22nm 以下時，單一 MgO 界面之垂直磁各向異性 (PMA) 不足以抵抗微縮熱擾動，導致資料保存壽命急劇下降。',
    mechanism: '在自由層兩側配置上下雙層 MgO 穿隧介電層，形成對稱雙界面垂直磁各向異性強化結構，使熱穩定性係數 (Delta) 提升逾 50%，同時將讀取信號比 (TMR) 穩定維持於 200% 以上。',
    claimFocus: '權利項 1 限定由合成反鐵磁參考層、第一 MgO 障壁、自由層與第二 MgO 障壁構成之雙界面垂直 pMTJ 多層膜結構。',
    productLink: 'Everspin 1Gb STT-MRAM 與格芯 (GlobalFoundries) 22FDX eMRAM 量產架構。',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2038-08-20',
    patentCategory: '材料結構項 (Material Structure)',
    patentCategoryEn: 'Material Structure',
    generation: '埃米第五代 (Gen-5 Dual-MgO pMTJ)',
    generationEn: 'Gen-5 Dual-MgO pMTJ',
    ftoStatus: '專利權有效維持至 2038 年 8 月。保護雙 MgO 界面垂直磁各向異性強化多層膜結構，覆蓋 22nm 及以下代工 PDK。',
    ftoStatusEn: 'In force through August 2038. Protects dual-MgO interface perpendicular MTJ stacks across sub-22nm foundry nodes.'
  }
];

const everspinNewPatentsEn = [
  {
    id: 'US9087588B2',
    title: 'Magnetic Memory Element with Enhanced Spin-Orbit Torque and Spin Transfer Torque Switching',
    grantDate: '2015-07-21',
    priorityDate: '2013-03-14',
    inventors: 'Sanjeev Aggarwal, Dmytro Apalkov',
    assignee: 'Everspin Technologies, Inc.',
    url: 'https://patents.google.com/patent/US9087588B2/en',
    coreProblem: 'Pure STT switching at sub-10ns write speeds requires excessive tunnel-barrier voltages, risking dielectric breakdown of ultra-thin MgO layers.',
    mechanism: 'Integrates a heavy-metal spin-orbit torque (SOT) underlayer with a perpendicular STT MTJ, using planar SOT current for rapid initial torque and low-voltage STT current for deterministic final alignment, slashing write voltage by 60% and enabling sub-2ns speeds.',
    claimFocus: 'Claim 1 defines a magnetic memory cell combining a spin-orbit torque heavy-metal line with a perpendicular spin-transfer torque junction and its operating method.',
    productLink: 'Everspin PERSYST™ ultra-high-speed low-latency MRAM architecture.',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2033-03-14',
    patentCategory: '裝置與操作項 (Device & Operation)',
    patentCategoryEn: 'Device & Operation',
    generation: '先進第四代 (Gen-4 SOT/STT Hybrid)',
    generationEn: 'Gen-4 SOT/STT Hybrid',
    ftoStatus: '專利權有效維持至 2033 年 3 月。具有強力排他權，保護 SOT 重金屬線路與垂直 MTJ 複合結構之雙重自旋輔助翻轉技術。',
    ftoStatusEn: 'In force through March 2033. Grants exclusivity over hybrid spin-orbit torque (SOT) and spin-transfer torque (STT) magnetic memory cells.'
  },
  {
    id: 'US10886461B2',
    title: 'Perpendicular MTJ Stack with Dual MgO Tunneling Barrier and Synthetic Antiferromagnetic Pinning',
    grantDate: '2021-01-05',
    priorityDate: '2018-08-20',
    inventors: 'Dmytro Apalkov, Mohamad Krounbi',
    assignee: 'Everspin Technologies, Inc.',
    url: 'https://patents.google.com/patent/US10886461B2/en',
    coreProblem: 'In sub-22nm nodes, single-interface perpendicular magnetic anisotropy (PMA) degrades under thermal agitation, impairing 10-year retention.',
    mechanism: 'Configures dual MgO dielectric layers flanking the free layer, creating symmetrical double-interface PMA boosting thermal stability (Delta) by >50% while stabilizing TMR >200%.',
    claimFocus: 'Claim 1 recites a perpendicular pMTJ stack comprising a synthetic antiferromagnetic reference layer, a first MgO barrier, a free layer, and a second MgO barrier.',
    productLink: 'Everspin 1Gb STT-MRAM and GlobalFoundries 22FDX eMRAM volume baseline.',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2038-08-20',
    patentCategory: '材料結構項 (Material Structure)',
    patentCategoryEn: 'Material Structure',
    generation: '埃米第五代 (Gen-5 Dual-MgO pMTJ)',
    generationEn: 'Gen-5 Dual-MgO pMTJ',
    ftoStatus: '專利權有效維持至 2038 年 8 月。保護雙 MgO 界面垂直磁各向異性強化多層膜結構，覆蓋 22nm 及以下代工 PDK。',
    ftoStatusEn: 'In force through August 2038. Protects dual-MgO interface perpendicular MTJ stacks across sub-22nm foundry nodes.'
  }
];

const everspinLitigationZh = {
  title: 'Toggle 磁場翻轉壁壘與垂直 STT-MRAM (pMTJ) 之專利代際更迭',
  overview: 'Everspin Technologies 是全球首家實現 MRAM 商業量產的半導體公司（源自摩托羅拉 Motorola 實驗室與飛思卡爾半導體 Freescale 分拆）。早期 MRAM 長年受「半選干擾 (Half-Select Disturb)」困擾，摩托羅拉物理學家 Leonid Savtchenko 發明了著名的「Toggle MRAM (US6545906B1)」，以合成反鐵磁 (SAF) 雙軸旋轉翻轉徹底解決了半選干擾；隨後 Everspin 透過收購 Grandis 垂直自旋轉矩 (STT) 專利池，成功跨入垂直磁性穿隧接面 (pMTJ) 時代，成為全球高可靠 MRAM 絕對領導者。',
  keyBattles: [
    {
      heading: 'Savtchenko Toggle 專利高牆與抗干擾壟斷 (US6545906B1)',
      detail: '傳統磁場翻轉 MRAM 在交叉點讀寫時，同一字元線或位元線上的未選取單元極易被單軸磁場誤觸發翻轉。Savtchenko 專利限定利用 45 度微小時差正交脈衝引導三層 SAF (磁層/Ru/磁層) 進行 180 度旋轉翻轉，半選單元在脈衝結束後自然彈回原位，徹底消除了半選干擾，封鎖了磁場翻轉 MRAM 的最佳商業路徑達二十年。'
    },
    {
      heading: 'Grandis 垂直 STT 專利收購與 pMTJ 突破 (US7599207B2)',
      detail: '由於磁場翻轉所需的電流線無法隨微影節點微縮，Everspin 於 2011 年收購自旋電子學先鋒 Grandis 公司及其核心專利，轉向利用自旋極化電流直接傳遞角動量的 STT 機制。透過 CoFeB/MgO/CoFeB 垂直磁各向異性 (pMTJ)，消除了平面退磁場能量損耗，將翻轉電流降低 80%，實現了 1Gb 容量與格芯 (GlobalFoundries) 22FDX 代工平台量產。'
    },
    {
      heading: '雙 MgO 穿隧障壁與 400°C BEOL 熱預算整合 (US8488373B2 / US10886461B2)',
      detail: '將磁性多層膜整合進晶圓代工廠後端金屬層 (BEOL) 必須耐受 400°C 長時間退火。Everspin 專利限定的高耐熱擴散阻擋層與雙 MgO 界面結構，使 pMTJ 在承受退火後仍維持大於 180% 的 TMR 讀取信號比，奠定車規 Grade-1 與航太防輻射的絕對優勢。'
    }
  ],
  ftoVerdict: '【重大產業里程碑】Everspin 奠基之初代 Toggle 磁場翻轉 MRAM 專利 US6545906B1 已於 2021 年 11 月屆滿 20 年進入公有領域！早期平面 STT-MRAM 翻轉母案 US7599207B2 亦於 2025 年 9 月屆滿進入公有領域！這代表全球半導體業界現已可合法免費實施「合成反鐵磁 Toggle 翻轉」與「基礎 STT 電流穿隧注入」架構；然而，Everspin 在 400°C BEOL 耐溫多層膜 (US8488373B2)、SOT/STT 混合翻轉 (US9087588B2) 與雙 MgO 垂直 pMTJ 先進結構 (US10886461B2) 仍受專利保護至 2030–2038 年。'
};

const everspinLitigationEn = {
  title: 'Toggle Magnetic Switching Moat & Perpendicular STT-MRAM Patent Evolution',
  overview: 'Everspin Technologies stands as the first semiconductor company to achieve commercial volume production of MRAM (spun out of Motorola Laboratories and Freescale Semiconductor). Early MRAM was chronically plagued by "half-select disturb," which Motorola physicist Leonid Savtchenko resolved through the landmark "Toggle MRAM (US6545906B1)" using synthetic antiferromagnetic (SAF) rotation. Everspin subsequently acquired pioneer Grandis to master perpendicular magnetic tunnel junctions (pMTJ), dominating high-reliability mission-critical non-volatile markets.',
  keyBattles: [
    {
      heading: 'Savtchenko Toggle Patent Fortress & Half-Select Immunity (US6545906B1)',
      detail: 'Conventional magnetic field-switched MRAM suffered unintended bit-flips on half-selected cells along common bitlines or wordlines. Savtchenko patented timed orthogonal magnetic pulses driving 180-degree rotation of a 3-layer SAF stack (ferromagnet/Ru/ferromagnet); unselected cells spring back elastically after pulses subside, securing flawless half-select immunity and locking down the field-switched MRAM roadmap for two decades.'
    },
    {
      heading: 'Grandis Acquisition & Perpendicular STT-MRAM Transition (US7599207B2)',
      detail: 'Because field-switched line currents could not scale beyond 90nm, Everspin acquired spintronics pioneer Grandis and its patent estate in 2011, transitioning to spin-transfer torque where spin-polarized currents flip states via angular momentum transfer. CoFeB/MgO/CoFeB perpendicular magnetic anisotropy (pMTJ) eliminated in-plane demagnetization penalties, cutting switching currents by 80% and enabling 1Gb densities across GlobalFoundries 22FDX.'
    },
    {
      heading: 'Dual-MgO Tunneling Barriers & 400°C BEOL Thermal Budget (US8488373B2 / US10886461B2)',
      detail: 'Integrating magnetic MTJs into standard CMOS back-end-of-line (BEOL) metal stacks requires surviving harsh 400°C sintering. Everspin patented high-temperature diffusion barriers and dual-MgO interfaces, sustaining TMR ratios >180% post-anneal to certify automotive Grade-1 and radiation-hard aerospace qualifications.'
    }
  ],
  ftoVerdict: '[FTO Guidance] Everspin pioneer Toggle MRAM patent US6545906B1 expired in November 2021 after its 20-year term. Foundational STT-MRAM switching patent US7599207B2 also entered the public domain in September 2025. The semiconductor industry may freely practice synthetic antiferromagnetic Toggle switching and foundational STT tunneling injection. However, 400°C BEOL stacks (US8488373B2), hybrid SOT/STT switching (US9087588B2), and dual-MgO perpendicular pMTJ architectures (US10886461B2) remain actively enforceable through 2030–2038.'
};

// ==========================================
// 2. Weebit Nano Limited 擴充資料
// ==========================================

const weebitNewPatentsZh = [
  {
    id: 'US6815781B2',
    title: '具過渡金屬氧化物之電阻式記憶體元件及其操作方法',
    grantDate: '2004-11-09',
    priorityDate: '2002-09-17',
    inventors: 'David R. Evans et al.',
    assignee: 'Sharp Laboratories of America, Inc.',
    url: 'https://patents.google.com/patent/US6815781B2/en',
    coreProblem: '傳統浮閘快閃記憶體需要高壓穿隧，如何利用薄膜材料在極低電壓下實現可逆電阻非揮發切換？',
    mechanism: '早期過渡金屬氧化物電阻切換奠基專利。金屬/金屬氧化物/金屬 (MIM) 三明治薄膜在外加雙極性電壓下，電場驅動氧缺陷遷移局部形成或熔斷奈米導電細絲 (Conductive Filament)，在低阻態 (LRS) 與高阻態 (HRS) 間可逆轉換。',
    claimFocus: '權利項 1 限定由底電極、過渡金屬氧化物阻變層與頂電極組成之薄膜電阻切換結構及其雙向電壓寫抹方法。',
    productLink: '全球金屬氧化物電阻式記憶體 (OxRAM / ReRAM) 核心理論與結構奠基專利。',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2022-09-17',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 Metal-Oxide ReRAM Pioneer)',
    generationEn: 'Gen-1 Metal-Oxide ReRAM Pioneer',
    ftoStatus: '已於 2022 年 9 月屆滿 20 年進入公有領域。早期金屬氧化物雙極性奈米導電細絲電阻切換單元結構已成為免費公有技術。',
    ftoStatusEn: 'Expired in September 2022; entered public domain. Pioneer metal-oxide bipolar conductive filament switching topology is free to operate.'
  },
  {
    id: 'US6849891B1',
    title: '電脈衝誘導電阻可逆切換之非揮發性記憶裝置',
    grantDate: '2005-02-01',
    priorityDate: '2003-04-15',
    inventors: 'Shangqing Liu, Alex Ignatiev',
    assignee: 'University of Houston',
    url: 'https://patents.google.com/patent/US6849891B1/en',
    coreProblem: '如何以非破壞性的短脈衝電場精確調控氧化物薄膜內部阻值，免除傳統介電層硬擊穿之疲乏失效？',
    mechanism: '早期電脈衝誘導阻變 (EPIR) 開創專利。限定在室溫下施加短時微秒級正負電脈衝，誘發薄膜界面局部氧離子遷移與能障重塑，實現非破壞性可逆電阻調節。',
    claimFocus: '權利項 1 限定利用室溫短電脈衝誘導薄膜非揮發電阻可逆切換之操作方法。',
    productLink: '電脈衝誘導阻變 (EPIR) 核心方法，ReRAM 脈衝調控演算法前案。',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2023-04-15',
    patentCategory: '操作方法項 (Method / Operation)',
    patentCategoryEn: 'Method / Operation',
    generation: '奠基第一代 (Gen-1 Electric-Pulse ReRAM)',
    generationEn: 'Gen-1 Electric-Pulse ReRAM',
    ftoStatus: '已於 2023 年 4 月屆滿 20 年進入公有領域。利用正負短脈衝電場調控薄膜氧化物電阻狀態之操作演算法已無專利排他權。',
    ftoStatusEn: 'Expired in April 2023; entered public domain. Electric pulse induced resistance switching methods are in the public domain.'
  },
  {
    id: 'US11171286B2',
    title: '適用於交叉點電阻式記憶體陣列之雙向選擇器及其整合製造方法',
    grantDate: '2021-11-09',
    priorityDate: '2019-05-10',
    inventors: 'Alon Malek, Amir Regev',
    assignee: 'Weebit Nano Ltd.',
    url: 'https://patents.google.com/patent/US11171286B2/en',
    coreProblem: '高密度交叉點 (Cross-Point) ReRAM 陣列中，未選取單元之微弱漏電流疊加 (Sneak-Path Leakage) 會嚴重縮減讀取裕度並導致寫入癱瘓。',
    mechanism: '設計雙向對稱臨限開關選擇器 (Bidirectional Threshold Switch Selector)，在低電壓下具備超高電阻比 (>10^5)，僅在達到臨限電壓時瞬間導通，徹底封鎖交叉陣列漏電途徑，實現 1S1R 超高密度堆疊。',
    claimFocus: '權利項 1 限定由雙向非線性臨限選擇器與氧化物阻變層串聯構成之 1S1R 交叉單元結構與後端金屬層整合製造工藝。',
    productLink: 'Weebit Nano 1S1R 高密度離散式與嵌入式 ReRAM 架構。',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2039-05-10',
    patentCategory: '裝置與製程項 (Device & Fabrication)',
    patentCategoryEn: 'Device & Fabrication',
    generation: '先進第三代 (Gen-3 1S1R Cross-Point)',
    generationEn: 'Gen-3 1S1R Cross-Point',
    ftoStatus: '專利權有效維持至 2039 年 5 月。保護具雙向非線性選擇器之 1S1R 交叉點 ReRAM 單元結構與 BEOL 整合工藝。',
    ftoStatusEn: 'Actively in force through May 2039. Protects bidirectional threshold selector 1S1R cross-point architectures and BEOL integration flows.'
  }
];

const weebitNewPatentsEn = [
  {
    id: 'US6815781B2',
    title: 'Resistive Memory Element with Transition Metal Oxide and Operation Method',
    grantDate: '2004-11-09',
    priorityDate: '2002-09-17',
    inventors: 'David R. Evans et al.',
    assignee: 'Sharp Laboratories of America, Inc.',
    url: 'https://patents.google.com/patent/US6815781B2/en',
    coreProblem: 'Conventional flash requires high-voltage tunneling; how to achieve reversible non-volatile resistance switching at low voltages in thin films?',
    mechanism: 'Pioneer transition metal-oxide switching patent. A metal/oxide/metal (MIM) thin-film stack forms or dissolves localized conductive filaments under bipolar electric fields, switching between low-resistance (LRS) and high-resistance (HRS) states.',
    claimFocus: 'Claim 1 recites a thin-film resistive switching cell comprising a bottom electrode, a transition metal oxide layer, and a top electrode with bipolar switching operations.',
    productLink: 'Core foundational patent for transition metal-oxide ReRAM / OxRAM physics.',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2022-09-17',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 Metal-Oxide ReRAM Pioneer)',
    generationEn: 'Gen-1 Metal-Oxide ReRAM Pioneer',
    ftoStatus: '已於 2022 年 9 月屆滿 20 年進入公有領域。早期金屬氧化物雙極性奈米導電細絲電阻切換單元結構已成為免費公有技術。',
    ftoStatusEn: 'Expired in September 2022; entered public domain. Pioneer metal-oxide bipolar conductive filament switching topology is free to operate.'
  },
  {
    id: 'US6849891B1',
    title: 'Nonvolatile Memory Device with Electric-Pulse-Induced Resistance Change',
    grantDate: '2005-02-01',
    priorityDate: '2003-04-15',
    inventors: 'Shangqing Liu, Alex Ignatiev',
    assignee: 'University of Houston',
    url: 'https://patents.google.com/patent/US6849891B1/en',
    coreProblem: 'How to reliably modulate thin-film resistance states using non-destructive short electric pulses without dielectric breakdown wearout?',
    mechanism: 'Foundational electric-pulse induced resistance (EPIR) patent. Applies microsecond-scale bipolar electric pulses at room temperature to drive interfacial oxygen vacancy migrations, altering resistance states non-destructively.',
    claimFocus: 'Claim 1 defines methods of reversibly altering thin-film nonvolatile resistance via room-temperature electric pulse trains.',
    productLink: 'Electric-pulse induced resistance switching (EPIR) foundational operation baseline.',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2023-04-15',
    patentCategory: '操作方法項 (Method / Operation)',
    patentCategoryEn: 'Method / Operation',
    generation: '奠基第一代 (Gen-1 Electric-Pulse ReRAM)',
    generationEn: 'Gen-1 Electric-Pulse ReRAM',
    ftoStatus: '已於 2023 年 4 月屆滿 20 年進入公有領域。利用正負短脈衝電場調控薄膜氧化物電阻狀態之操作演算法已無專利排他權。',
    ftoStatusEn: 'Expired in April 2023; entered public domain. Electric pulse induced resistance switching methods are in the public domain.'
  },
  {
    id: 'US11171286B2',
    title: 'Bidirectional Selector Device for Cross-Point Resistive Memory Array and Integration Method',
    grantDate: '2021-11-09',
    priorityDate: '2019-05-10',
    inventors: 'Alon Malek, Amir Regev',
    assignee: 'Weebit Nano Ltd.',
    url: 'https://patents.google.com/patent/US11171286B2/en',
    coreProblem: 'In high-density cross-point ReRAM arrays, cumulative sneak-path leakage from unselected cells collapses sense margins and corrupts programming.',
    mechanism: 'Engineers a bidirectional threshold switch selector exhibiting extreme off-state non-linearity (>10^5) that turns on only above threshold voltages, suppressing sneak-path currents in dense 1S1R arrays.',
    claimFocus: 'Claim 1 recites a 1S1R cross-point cell comprising a bidirectional non-linear threshold selector in series with an oxide switching layer and its BEOL integration process.',
    productLink: 'Weebit Nano high-density 1S1R cross-point discrete and embedded ReRAM portfolio.',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2039-05-10',
    patentCategory: '裝置與製程項 (Device & Fabrication)',
    patentCategoryEn: 'Device & Fabrication',
    generation: '先進第三代 (Gen-3 1S1R Cross-Point)',
    generationEn: 'Gen-3 1S1R Cross-Point',
    ftoStatus: '專利權有效維持至 2039 年 5 月。保護具雙向非線性選擇器之 1S1R 交叉點 ReRAM 單元結構與 BEOL 整合工藝。',
    ftoStatusEn: 'Actively in force through May 2039. Protects bidirectional threshold selector 1S1R cross-point architectures and BEOL integration flows.'
  }
];

const weebitLitigationZh = {
  title: '矽基氧化物 (SiOx/OxRAM) 後端整合壁壘與金屬微絲公有領域 FTO',
  overview: 'Weebit Nano 由以色列與澳洲半導體資深團隊創立，其專利戰略的核心在於終結傳統金屬氧化物 ReRAM（如 TaOx、TiO2、HfOx）對「特殊外來重金屬化學前驅物」的依賴。傳統晶圓代工廠極度畏懼外來重金屬污染前端 CMOS 電晶體；Weebit 獨家取得萊斯大學 (Rice University) James Tour 教授專利授權，直接採用標準 CMOS 既有多孔二氧化矽 (SiOx)，在後端金屬層 (BEOL) 僅需增加 2 道低溫光罩即可達成 100% 零污染相容，順利獲得 SkyWater 與 DB HiTek 商業晶圓代工授權。',
  keyBattles: [
    {
      heading: '多孔富矽氧化物 (SiOx) 奈米細絲 vs. 傳統重金屬氧化物污染風險 (US10141505B2)',
      detail: '傳統 ReRAM 需引進未經驗證的貴金屬或特殊過渡金屬，晶圓廠需設置昂貴的防污染隔離區。Weebit 核心專利限定以受控孔隙率的二氧化矽薄膜為阻變介質，在外加電壓下利用矽原子在奈米缺陷中可逆凝聚形成導電細絲，代工廠可直接沿用現有標準 PECVD 機台與材料量產，晶圓成本較傳統 eFlash 驟降 70%。'
    },
    {
      heading: '神經擬態 CIM 類比電導校準專利 (US10580980B2)',
      detail: '電阻式記憶體在類比乘加運算 (Vector-Matrix Multiplication) 中容易受到氧空缺自發弛豫引發的「電導漂移 (Drift)」，破壞神經網路權重精度。Weebit 專利保護了在陣列運算前以微弱探測電流感測漂移、並施加自適應微脈衝動態補償之方法，確保邊緣 AI 類比運算的確定性精度。'
    },
    {
      heading: '雙向臨限選擇器 1S1R 交叉點陣列專利 (US11171286B2)',
      detail: '為突破 1T1R 結構中電晶體面積對微縮的限制，Weebit 佈局了高非線性雙向臨限選擇器 (Selector)，在未達到寫入閾值時呈現百萬倍超高阻態，徹底消除交叉陣列的偷漏電流 (Sneak-Path Leakage)，支援高密度三維堆疊。'
    }
  ],
  ftoVerdict: '【自由實施建議】早期 2002–2003 年提出之基礎金屬氧化物電阻切換與電脈衝誘導導電細絲專利（US6815781B2 與 US6849891B1）已於 2022 年與 2023 年相繼屆滿進入公有領域，業界可自由實施基礎 1T1R 雙極性電阻切換機制；但 Weebit 獨家多孔二氧化矽 SiOx 專利 (US10141505B2)、神經擬態動態電導校準 (US10580980B2) 以及 1S1R 雙向選擇器架構 (US11171286B2) 仍處於強力有效保護期（分別保護至 2034、2037 與 2039 年）。'
};

const weebitLitigationEn = {
  title: 'Silicon-Oxide ReRAM BEOL Moat & Conductive Filament Public Domain FTO',
  overview: 'Founded by Israeli and Australian semiconductor veterans, Weebit Nano constructed its IP strategy to overturn the heavy-metal precursor contamination barriers of legacy ReRAM (TaOx, TiO2, HfOx). Traditional foundries dread foreign metals migrating into front-end CMOS gates; Weebit secured exclusive rights to Rice University Professor James Tour\'s foundational patents, directly utilizing standard CMOS-native porous silicon oxide (SiOx) requiring only 2 low-temperature BEOL masks for 100% zero-contamination foundry qualification across SkyWater and DB HiTek.',
  keyBattles: [
    {
      heading: 'Porous Silicon Oxide (SiOx) vs. Exotic Metal Contamination (US10141505B2)',
      detail: 'Conventional ReRAM demands unproven noble metals and exotic targets, forcing foundries to establish costly segregated fabrication lines. Weebit\'s core patent confines switching to porosity-tuned silicon oxide, electro-forming and dissolving reversible silicon nanofilaments using standard foundry PECVD tools, reducing wafer cost by ~70% compared to eFlash.'
    },
    {
      heading: 'Neuromorphic Analog Conductance Calibration Moat (US10580980B2)',
      detail: 'Analog in-memory computing (CIM) using ReRAM synapses suffers from spontaneous oxygen vacancy relaxation known as conductance drift, corrupting neural network inference accuracy. Weebit patented closed-loop sensing that detects drift with micro-probes before vector-matrix multiplications, applying dynamic restore pulses to preserve inference precision.'
    },
    {
      heading: 'Bidirectional Threshold Selector 1S1R Cross-Point Array (US11171286B2)',
      detail: 'To bypass the scaling area limit of 1T1R select transistors, Weebit patented highly non-linear bidirectional threshold selectors (>10^5 selectivity), completely suffocating sneak-path leakage in dense cross-point matrices and enabling dense 3D stacking.'
    }
  ],
  ftoVerdict: '[FTO Guidance] Early 2002–2003 foundational metal-oxide resistance switching and electric pulse-induced filament patents (US6815781B2 & US6849891B1) expired in 2022 and 2023, entering the public domain. Industry may freely practice standard 1T1R bipolar switching physics. However, Weebit\'s proprietary porous SiOx patent (US10141505B2), neuromorphic dynamic conductance calibration (US10580980B2), and 1S1R threshold selector topologies (US11171286B2) remain actively enforceable through 2034, 2037, and 2039.'
};

// ==========================================
// 3. 執行注入與更新
// ==========================================

function updateDataset(data, isEn) {
  // A. 更新 Everspin
  const everspin = data.vendors.find(v => v.id === 'everspin');
  if (everspin) {
    const newPatents = isEn ? everspinNewPatentsEn : everspinNewPatentsZh;
    // 加入到第 2 個家族 (pMTJ)
    for (const np of newPatents) {
      if (!everspin.families[1].patents.some(p => p.id === np.id)) {
        everspin.families[1].patents.push(np);
      }
    }
    everspin.families[0].patents.sort((a, b) => a.priorityDate.localeCompare(b.priorityDate));
    everspin.families[1].patents.sort((a, b) => a.priorityDate.localeCompare(b.priorityDate));
    everspin.litigationDefense = isEn ? everspinLitigationEn : everspinLitigationZh;
  }

  // B. 更新 Weebit Nano
  const weebit = data.vendors.find(v => v.id === 'weebit');
  if (weebit) {
    const newPatents = isEn ? weebitNewPatentsEn : weebitNewPatentsZh;
    for (const np of newPatents) {
      if (!weebit.families[0].patents.some(p => p.id === np.id)) {
        weebit.families[0].patents.push(np);
      }
    }
    weebit.families[0].patents.sort((a, b) => a.priorityDate.localeCompare(b.priorityDate));
    weebit.litigationDefense = isEn ? weebitLitigationEn : weebitLitigationZh;
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

console.log('Stage 4 (Everspin MRAM, Weebit ReRAM) 專利與深度案卷已成功注入！');
