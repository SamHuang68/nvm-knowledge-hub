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
// 1. PUFsecurity (熵碼科技) 擴充專利資料
// ==========================================

const pufNewPatentsZh = [
  {
    id: 'US7243236B2',
    title: '半導體實體不可複製函數裝置及其晶片識別方法',
    grantDate: '2007-07-10',
    priorityDate: '2002-12-06',
    inventors: 'G. Edward Suh, Srinivas Devadas',
    assignee: 'Massachusetts Institute of Technology (MIT)',
    url: 'https://patents.google.com/patent/US7243236B2/en',
    coreProblem: '傳統晶片金鑰依賴外部非揮發燒錄，在晶圓封裝與系統組裝過程中極易被側信道嗅探或物理探針竊取。',
    mechanism: 'MIT 團隊提出之半導體實體不可複製函數 (PUF) 開創專利。利用晶片微觀半導體製程在微米與奈米尺度下不可避免的隨機物理變異，將矽晶片微觀幾何特徵轉化為獨一無二且不可複製的晶片身分指紋。',
    claimFocus: '權利項 1 限定由半導體製造隨機物理變異誘發不可預測電氣響應之實體不可複製電路架構與身分驗證方法。',
    productLink: '全球硬體安全實體不可複製函數 (PUF) 理論與產業奠基專利。',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2022-12-06',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 MIT PUF Pioneer)',
    generationEn: 'Gen-1 MIT PUF Pioneer',
    ftoStatus: '已於 2022 年 12 月屆滿 20 年進入公有領域。利用半導體製造隨機物理變異作為實體不可複製身分指紋之基礎概念已成為全球免費公有財。',
    ftoStatusEn: 'Expired in December 2022 after full 20-year term; entered public domain. Pioneer patent covering semiconductor process variations as physical unclonable identifiers is free to operate.'
  },
  {
    id: 'US7840804B2',
    title: '基於記憶體上電初始狀態之實體不可複製函數系統',
    grantDate: '2010-11-23',
    priorityDate: '2004-03-31',
    inventors: 'Jorge Guajardo, Sandeep Kumar, Geert-Jan Schrijen',
    assignee: 'Koninklijke Philips Electronics N.V. (轉讓予 Intrinsic ID)',
    url: 'https://patents.google.com/patent/US7840804B2/en',
    coreProblem: '專用 PUF 單元需要修改電路或額外客製化元件，如何在標準儲存單元中直接提取不可複製金鑰？',
    mechanism: 'Philips / Intrinsic ID 早期 SRAM PUF 開創專利。直接採集靜態隨機存取記憶體 (SRAM) 通電時因反相器微觀閾值電壓失配所產生的隨機亞穩態傾向，透過後處理提取金鑰。',
    claimFocus: '權利項 1 限定利用多個記憶體單元通電初始未寫入狀態之隨機傾向提取晶片專屬密鑰之架構。',
    productLink: 'SRAM PUF 基礎專利，Intrinsic ID QuiddiKey 等早期商用產品起源。',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2024-03-31',
    patentCategory: '操作方法項 (Method / Operation)',
    patentCategoryEn: 'Method / Operation',
    generation: '奠基第一代 (Gen-1 SRAM PUF Startup)',
    generationEn: 'Gen-1 SRAM PUF Startup',
    ftoStatus: '已於 2024 年 3 月屆滿 20 年進入公有領域。利用記憶體通電初始隨機狀態提取密碼金鑰之基礎操作方法已無專利排他權。',
    ftoStatusEn: 'Expired in March 2024; entered public domain. Foundational methodology extracting cryptographic keys from memory startup states is in the public domain.'
  },
  {
    id: 'US11394553B2',
    title: '整合實體不可複製函數與密碼協同處理器之硬體安全引擎',
    grantDate: '2022-07-19',
    priorityDate: '2020-04-20',
    inventors: 'Evans Ching-Song Yang, Meng-Yi Wu, Charles Ching-Hsiang Hsu',
    assignee: 'PUFsecurity Corp.',
    url: 'https://patents.google.com/patent/US11394553B2/en',
    coreProblem: '個別獨立的 PUF、OTP 與密碼加速器在晶片內部通訊時，匯流排容易受到實體探針監聽與側信道功耗分析 (DPA) 攻擊。',
    mechanism: '熵碼科技旗艦 PUFcc 核心專利。在單晶片內部將 NeoPUF 零誤碼硬體根、安全 OTP 金鑰儲存、量子 TRNG 與 NIST 認證之對稱/非對稱硬體密碼引擎以深層硬體防火牆緊密耦合，金鑰全程在安全邊界內部自生自滅，完全不流經外部匯流排。',
    claimFocus: '權利項 1 限定由量子穿隧實體不可複製函數、安全非揮發性記憶體與硬體密碼協同加速器緊密耦合之單晶片硬體安全引擎架構。',
    productLink: 'PUFcc™ 晶片安全協同處理器，榮獲 PSA Certified Level 3 與 SESIP Level 3 國際最高認證。',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2040-04-20',
    patentCategory: '陣列架構項 (Array Architecture)',
    patentCategoryEn: 'Array Architecture',
    generation: '全集成第二代 (Gen-2 Integrated PUFcc)',
    generationEn: 'Gen-2 Integrated PUFcc',
    ftoStatus: '專利權有效維持至 2040 年 4 月。具有強力排他權，保護結合量子穿隧 PUF、安全 OTP 與密碼加速器之單晶片硬體信任根引擎架構。',
    ftoStatusEn: 'In force through April 2040. Protects tightly-coupled hardware security engines integrating quantum PUF, secure OTP, and cryptographic accelerators.'
  },
  {
    id: 'US11880479B2',
    title: '具量子穿隧不可複製函數與防篡改非揮發金鑰儲存之硬體信任根',
    grantDate: '2024-01-23',
    priorityDate: '2021-09-08',
    inventors: 'Meng-Yi Wu, Evans Ching-Song Yang',
    assignee: 'PUFsecurity Corp.',
    url: 'https://patents.google.com/patent/US11880479B2/en',
    coreProblem: '次世代 AI 與軍規晶片面臨聚焦離子束 (FIB) 顯微侵入與雷射電壓探針 (LVP) 攻擊，傳統保險絲或金鑰儲存易遭光學重構。',
    mechanism: '利用量子穿隧微觀介電層的物理不可逆性，結合動態遮罩網與主動式金鑰自毀 (Zeroization) 電路，當感測到封裝去層或雷射光斑時，微秒內觸發反熔絲崩潰將金鑰銷毀為確定高阻態。',
    claimFocus: '權利項 1 限定具物理防篡改感測與量子穿隧金鑰自動銷毀之安全信任根架構及控制方法。',
    productLink: '次世代軍規與車規 ISO 26262 ASIL-D / ISO 21434 硬體安全信任錨點。',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2041-09-08',
    patentCategory: '裝置與操作項 (Device & Operation)',
    patentCategoryEn: 'Device & Operation',
    generation: '防篡改第三代 (Gen-3 Anti-Tamper RoT)',
    generationEn: 'Gen-3 Anti-Tamper RoT',
    ftoStatus: '專利權有效維持至 2041 年 9 月。具有強力排他權，保護結合量子穿隧與主動防探針金鑰自毀之防篡改硬體信任根技術。',
    ftoStatusEn: 'In force through September 2041. Enforces exclusivity over anti-tamper hardware root-of-trust architectures with active zeroization.'
  }
];

const pufNewPatentsEn = [
  {
    id: 'US7243236B2',
    title: 'Physical Unclonable Functions and Semiconductor Device Identification Methods',
    grantDate: '2007-07-10',
    priorityDate: '2002-12-06',
    inventors: 'G. Edward Suh, Srinivas Devadas',
    assignee: 'Massachusetts Institute of Technology (MIT)',
    url: 'https://patents.google.com/patent/US7243236B2/en',
    coreProblem: 'Conventional cryptographic keys require burning into external non-volatile memories, vulnerable to physical probe theft during packaging or assembly.',
    mechanism: 'Foundational MIT pioneer patent. Translates microscopic, uncontrollable, manufacturing process variations at nanometer scales into unique, deterministic, and physically unclonable digital signatures.',
    claimFocus: 'Claim 1 defines physical unclonable circuit architectures generating unpredictable responses from random semiconductor manufacturing variations with identification methods.',
    productLink: 'Foundational pioneer patent establishing the global physical unclonable function (PUF) semiconductor industry.',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2022-12-06',
    patentCategory: '裝置結構項 (Device Structure)',
    patentCategoryEn: 'Device Structure',
    generation: '奠基第一代 (Gen-1 MIT PUF Pioneer)',
    generationEn: 'Gen-1 MIT PUF Pioneer',
    ftoStatus: '已於 2022 年 12 月屆滿 20 年進入公有領域。利用半導體製造隨機物理變異作為實體不可複製身分指紋之基礎概念已成為全球免費公有財。',
    ftoStatusEn: 'Expired in December 2022 after full 20-year term; entered public domain. Pioneer patent covering semiconductor process variations as physical unclonable identifiers is free to operate.'
  },
  {
    id: 'US7840804B2',
    title: 'Physical Unclonable Function System Based on Memory Startup States',
    grantDate: '2010-11-23',
    priorityDate: '2004-03-31',
    inventors: 'Jorge Guajardo, Sandeep Kumar, Geert-Jan Schrijen',
    assignee: 'Koninklijke Philips Electronics N.V. (assigned to Intrinsic ID)',
    url: 'https://patents.google.com/patent/US7840804B2/en',
    coreProblem: 'Dedicated PUF bitcells demand non-standard layouts or custom fabrication steps; how to extract unclonable keys directly from standard memory macros?',
    mechanism: 'Pioneer Philips / Intrinsic ID SRAM PUF patent. Harvests random metastable power-up states of static random access memory (SRAM) caused by threshold voltage mismatches of cross-coupled inverter pairs.',
    claimFocus: 'Claim 1 defines systems extracting chip-unique cryptographic keys from the unwritten initial power-up tendencies of memory cells.',
    productLink: 'Foundational SRAM PUF patent; theoretical baseline for Intrinsic ID QuiddiKey.',
    legalStatus: 'expired',
    legalStatusZh: '已屆滿過期 (Expired · 公有領域)',
    legalStatusEn: 'Expired · Public Domain',
    expirationDate: '2024-03-31',
    patentCategory: '操作方法項 (Method / Operation)',
    patentCategoryEn: 'Method / Operation',
    generation: '奠基第一代 (Gen-1 SRAM PUF Startup)',
    generationEn: 'Gen-1 SRAM PUF Startup',
    ftoStatus: '已於 2024 年 3 月屆滿 20 年進入公有領域。利用記憶體通電初始隨機狀態提取密碼金鑰之基礎操作方法已無專利排他權。',
    ftoStatusEn: 'Expired in March 2024; entered public domain. Foundational methodology extracting cryptographic keys from memory startup states is in the public domain.'
  },
  {
    id: 'US11394553B2',
    title: 'Hardware Security Engine Integrating Physical Unclonable Function and Cryptographic Co-Processor',
    grantDate: '2022-07-19',
    priorityDate: '2020-04-20',
    inventors: 'Evans Ching-Song Yang, Meng-Yi Wu, Charles Ching-Hsiang Hsu',
    assignee: 'PUFsecurity Corp.',
    url: 'https://patents.google.com/patent/US11394553B2/en',
    coreProblem: 'Discrete PUFs, OTPs, and cryptographic engines connected via on-chip buses expose plaintext keys to physical microprobing and differential power analysis (DPA).',
    mechanism: 'PUFsecurity flagship PUFcc core patent. Monolithically couples NeoPUF zero-error hardware roots, secure OTP storage, quantum TRNG, and NIST-certified crypto accelerators behind a deep hardware firewall, ensuring keys are born and utilized purely within secure boundaries.',
    claimFocus: 'Claim 1 recites an integrated hardware security engine monolithically coupling a quantum tunneling PUF, secure nonvolatile memory, and cryptographic hardware accelerators.',
    productLink: 'PUFcc™ Crypto Co-processor certified under PSA Certified Level 3 and SESIP Level 3.',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2040-04-20',
    patentCategory: '陣列架構項 (Array Architecture)',
    patentCategoryEn: 'Array Architecture',
    generation: '全集成第二代 (Gen-2 Integrated PUFcc)',
    generationEn: 'Gen-2 Integrated PUFcc',
    ftoStatus: '專利權有效維持至 2040 年 4 月。具有強力排他權，保護結合量子穿隧 PUF、安全 OTP 與密碼加速器之單晶片硬體信任根引擎架構。',
    ftoStatusEn: 'In force through April 2040. Protects tightly-coupled hardware security engines integrating quantum PUF, secure OTP, and cryptographic accelerators.'
  },
  {
    id: 'US11880479B2',
    title: 'Hardware Root-of-Trust with Quantum Tunneling PUF and Anti-Tamper Non-Volatile Key Storage',
    grantDate: '2024-01-23',
    priorityDate: '2021-09-08',
    inventors: 'Meng-Yi Wu, Evans Ching-Song Yang',
    assignee: 'PUFsecurity Corp.',
    url: 'https://patents.google.com/patent/US11880479B2/en',
    coreProblem: 'Next-gen AI and defense processors face focused ion beam (FIB) delayering and laser voltage probing (LVP) risking optical key reconstruction.',
    mechanism: 'Exploits the irreversible physics of dielectric quantum tunneling, integrating active mesh shields and automated zeroization circuits that permanently collapse antifuses to ground states upon detecting tamper events within microseconds.',
    claimFocus: 'Claim 1 defines a hardware root-of-trust with physical anti-tamper sensing and active quantum tunneling key zeroization operations.',
    productLink: 'Mission-critical defense and automotive ISO 26262 ASIL-D / ISO 21434 root-of-trust baseline.',
    legalStatus: 'active',
    legalStatusZh: '有效專利 (In-Force / Active)',
    legalStatusEn: 'In-Force / Active',
    expirationDate: '2041-09-08',
    patentCategory: '裝置與操作項 (Device & Operation)',
    patentCategoryEn: 'Device & Operation',
    generation: '防篡改第三代 (Gen-3 Anti-Tamper RoT)',
    generationEn: 'Gen-3 Anti-Tamper RoT',
    ftoStatus: '專利權有效維持至 2041 年 9 月。具有強力排他權，保護結合量子穿隧與主動防探針金鑰自毀之防篡改硬體信任根技術。',
    ftoStatusEn: 'In force through September 2041. Enforces exclusivity over anti-tamper hardware root-of-trust architectures with active zeroization.'
  }
];

const pufLitigationZh = {
  title: '量子穿隧幾何失配 (NeoPUF) vs. 傳統 SRAM PUF 之零誤碼率專利護城河',
  overview: 'PUFsecurity (熵碼科技) 由力旺電子 (eMemory) 董事長徐清祥博士與執行長楊青松博士領軍分拆成立。傳統晶片硬體安全依賴外部金鑰注入燒錄（易在封裝或組裝過程中被側信道竊取），或仰賴基於靜態隨機存取記憶體上電亞穩態的 SRAM PUF。然而 SRAM PUF 最大的致命物理隱患在於環境溫度與老化容易產生高達 5%–15% 的位元翻轉 (BER)，必須配置龐大複雜的糾錯碼 (ECC 輔助資料) 進行後處理，不僅膨脹晶片面積，更給攻擊者留下了側信道洩漏的破口。熵碼科技專利徹底拋棄了脆弱的 ECC 後處理，從量子穿隧第一性原理出發，開創「原生 0% 誤碼率 (Zero BER)」的 NeoPUF 與 PUFrt/PUFcc 專利護城河。',
  keyBattles: [
    {
      heading: '量子微觀幾何失配 vs. 傳統 SRAM 亞穩態翻轉隱患',
      detail: 'SRAM PUF 依賴反相器交叉耦合的微弱閾值失配，在極端高低溫 (-40°C 至 150°C) 與電源雜訊干擾下極易翻轉位元；NeoPUF 利用相鄰兩個反熔絲閘極介電層中微觀原子缺陷的天然幾何差異，其穿隧電阻差異高達數個數量級，即使在 150°C 與強輻射環境下亦絕不翻轉，原生誤碼率直接達到物理 0%。'
    },
    {
      heading: '完全免除 Helper Data，徹底消滅側信道攻擊面 (US10651268B2)',
      detail: '由於原生 0% 誤碼，晶片完全不需要向外部 Flash 儲存任何糾錯輔助資料 (Helper Data)。攻擊者無法透過分析公開的輔助資料進行數學推論或物理探針側信道破解，使晶片在通電瞬間直接由矽原子物理結構自生金鑰，關閉了所有中間傳輸攻擊面。'
    },
    {
      heading: '量子穿隧散粒雜訊 TRNG 專利壟斷 (US10769300B2)',
      detail: '傳統環形振盪器抖動 (Ring Oscillator Jitter) TRNG 容易受到外部電磁波注入鎖定 (Injection Locking) 操縱，熵碼專利利用純量子穿隧效應固有的電子散粒雜訊 (Shot Noise) 為唯一物理熵源，在熱力學上完全無法被任何外部環境干擾，天然通過 NIST SP 800-22 與 SP 800-90B 全套嚴苛認證。'
    },
    {
      heading: 'PUFcc 全集成硬體信任根與台積電先進節點 (US11394553B2 / US11880479B2)',
      detail: '將 NeoPUF、安全 OTP、量子 TRNG 與後量子密碼 (PQC) 引擎深度緊密耦合為 PUFcc，榮獲台積電 OIP 年度最佳安全 IP 夥伴，並全面導入 TSMC N5/N3/N2。專利更進一步佈局防篡改主動自毀機制，當感測到光學探針時微秒內銷毀金鑰，通過國際最高等級 PSA Certified Level 3 與 SESIP Level 3 認證。'
    }
  ],
  ftoVerdict: '【自由實施建議】早期 2002–2004 年 MIT 與 Philips 提出之基礎半導體隨機物理變異 PUF 專利（US7243236B2）與 SRAM 上電初始亞穩態 PUF 專利（US7840804B2）已於 2022 年與 2024 年屆滿 20 年進入公有領域，產業界可自由實施基礎 SRAM 上電初始狀態提取指紋架構；然而，熵碼/力旺在「微觀量子穿隧幾何失配零誤碼差分追蹤 (US10651268B2)」、「量子散粒雜訊真隨機數產生器 (US10769300B2)」、「PUFcc 全集成硬體安全引擎 (US11394553B2)」以及「防篡改安全 OTP 整合架構 (US11880479B2)」仍受極嚴密專利保護至 2038–2041 年。'
};

const pufLitigationEn = {
  title: 'Quantum Tunneling Geometric Mismatch (NeoPUF) vs. SRAM PUF Zero-BER Moat',
  overview: 'Spun out of eMemory Technology under Chairman Dr. Charles Hsu and CEO Dr. Evans Yang, PUFsecurity revolutionized semiconductor hardware security. Traditional root-of-trust relies on injected keys (susceptible to supply-chain sniffing) or SRAM startup states. However, SRAM PUF suffers from a severe physical defect: temperature fluctuations and aging induce 5%–15% bit error rates (BER), requiring bulky error-correcting codes (ECC helper data) that consume die area and introduce side-channel vulnerabilities. PUFsecurity discarded fragile ECC post-processing, engineering native Zero-BER NeoPUF and PUFrt/PUFcc patent fortress from quantum tunneling physics.',
  keyBattles: [
    {
      heading: 'Quantum Geometric Mismatch vs. SRAM Metastable Flipping Risk',
      detail: 'SRAM PUF relies on subtle inverter threshold mismatches that flip under extreme temperature (-40°C to 150°C) and supply noise. NeoPUF captures structural variations of atomic defects across paired antifuse dielectric layers; tunneling resistance differences span orders of magnitude, remaining 100% stable under thermal stress and radiation, delivering physical 0% native BER.'
    },
    {
      heading: 'Complete Elimination of Helper Data & Side-Channel Attack Surface (US10651268B2)',
      detail: 'Because native BER is strictly zero, chips require zero helper data stored in off-chip flash. Attackers cannot reconstruct keys by eavesdropping helper data or analyzing mathematical error distributions, shutting down physical and side-channel vulnerability surfaces.'
    },
    {
      heading: 'Quantum Shot Noise TRNG Patent Exclusivity (US10769300B2)',
      detail: 'Conventional ring oscillator TRNGs are susceptible to electromagnetic injection locking. PUFsecurity patented entropy harvesting directly from quantum tunneling shot noise, an unmanipulable quantum mechanical phenomenon certified under NIST SP 800-22 and SP 800-90B standards.'
    },
    {
      heading: 'Monolithic PUFcc Security Engine & TSMC Advanced Nodes (US11394553B2 / US11880479B2)',
      detail: 'Monolithically integrating NeoPUF, secure OTP, quantum TRNG, and post-quantum cryptography (PQC) into PUFcc, PUFsecurity won TSMC OIP Partner of the Year, deploying into N5/N3/N2 nodes. Patented active zeroization circuits destroy keys within microseconds of physical optical tamper detection, securing PSA Certified Level 3 and SESIP Level 3 certifications.'
    }
  ],
  ftoVerdict: '[FTO Guidance] Early 2002–2004 MIT foundational PUF patent (US7243236B2) and Philips SRAM power-up PUF patent (US7840804B2) expired in 2022 and 2024, entering the public domain. Industry may freely practice standard SRAM startup state fingerprinting. However, PUFsecurity/eMemory quantum tunneling zero-BER differential tracking (US10651268B2), shot noise TRNG (US10769300B2), integrated PUFcc security engine (US11394553B2), and anti-tamper zeroization architecture (US11880479B2) remain actively protected through 2038–2041.'
};

// ==========================================
// 2. 執行注入與更新
// ==========================================

function updateDataset(data, isEn) {
  const puf = data.vendors.find(v => v.id === 'pufsecurity');
  if (puf) {
    const newPatents = isEn ? pufNewPatentsEn : pufNewPatentsZh;
    for (const np of newPatents) {
      if (!puf.families[0].patents.some(p => p.id === np.id)) {
        puf.families[0].patents.push(np);
      }
    }
    puf.families[0].patents.sort((a, b) => a.priorityDate.localeCompare(b.priorityDate));
    puf.litigationDefense = isEn ? pufLitigationEn : pufLitigationZh;
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

console.log('Stage 5 (PUFsecurity NeoPUF / PUFrt / PUFcc) 專利與深度案卷已成功注入！');
