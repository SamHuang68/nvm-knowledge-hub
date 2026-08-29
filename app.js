let currentLanguage = "zh";
let activeType = "all";
let activeArchitecture = "puf";
let activePhase = 0;

const localized = (zh, en) => ({ zh, en });
const pick = value => typeof value === "string" ? value : value[currentLanguage];

const navigationLabels = {
  hub: localized("All Topics", "All Topics"),
  why: localized("Why", "Why"),
  architecture: localized("Architecture", "Architecture"),
  assurance: localized("Assurance", "Assurance"),
  compare: localized("Compare", "Compare"),
  evidence: localized("Evidence", "Evidence"),
  learn: localized("Learn", "Learn"),
  oip: localized("OIP Brief", "OIP Brief"),
  research: localized("Research", "Research")
};

const lessons = [
  { title: localized("NVM 與 OTP 的安全邊界", "The security boundary of NVM and OTP"), summary: localized("永久保存不等於機密保存", "Permanent storage is not confidential storage"), status: "READY", href: "memory-physics.html#abstract" },
  { title: localized("Secure Storage 四層架構", "The four-layer Secure Storage architecture"), summary: localized("PUF、AES、OTP、Controller", "PUF, AES, OTP and controller"), status: "READY", href: "#architecture", recordId: "OIP-ARCH-001" },
  { title: localized("Power-off State", "The power-off state"), summary: localized("用斷電狀態判斷靜態攻擊面", "Evaluate the at-rest physical attack surface"), status: "READY", href: "#lifecycle", recordId: "OIP-PUF-001" },
  { title: localized("Physical Security Assurance", "Physical Security Assurance"), summary: localized("FI、SCA、證據成熟度與認證範圍", "FI, SCA, evidence maturity and certification scope"), status: "READY", href: "security-assurance.html#evidence", recordId: "OIP-VAL-001" },
  { title: localized("SRAM PUF 與 NeoPUF", "SRAM PUF and NeoPUF"), summary: localized("比較物理 response 的承載位置", "Compare where the physical response resides"), status: "READY", href: "memory-physics.html#positioning" },
  { title: localized("量產證據與 Qualification", "Field evidence and qualification"), summary: localized("PVT、aging、認證與攻擊證據", "PVT, aging, certification and attack evidence"), status: "READY", href: "oip-secure-storage.html#evidence", recordId: "OIP-NODE-001" },
  { title: localized("TSMC OIP 整合對話", "The TSMC OIP integration conversation"), summary: localized("節點、APB、provisioning、責任", "Nodes, APB, provisioning and accountability"), status: "READY", href: "oip-secure-storage.html#oip", recordId: "OIP-VAL-001" },
  { title: localized("AI Silicon 的 Persistent State", "Persistent state across AI silicon"), summary: localized("Identity、repair、calibration 與 RAS 的 NVM 邊界", "NVM boundaries for identity, repair, calibration and RAS"), status: "NEW", href: "ai-nvm-opportunities.html", recordId: "AI-NVM-INF-001" }
];

const typeLabels = {
  all: localized("全部", "All"),
  concept: localized("觀念", "Concept"),
  architecture: localized("架構", "Architecture"),
  technology: localized("技術", "Technology"),
  comparison: localized("比較", "Comparison"),
  product: localized("產品", "Product"),
  case: localized("案例", "Case study"),
  integration: localized("整合", "Integration")
};

const articles = [
  { type: "concept", level: "Foundation", title: localized("OTP durability ≠ confidentiality", "OTP durability ≠ confidentiality"), summary: localized("了解為什麼永久儲存的 bits 仍可能成為物理擷取目標。", "Why permanently stored bits can still become a physical extraction target."), tags: ["OTP", "Threat model"], icon: "i-memory", href: "memory-physics.html#abstract" },
  { type: "architecture", level: "Foundation", title: localized("Secure Storage 四個安全 block", "The four security blocks of Secure Storage"), summary: localized("SRAM PUF、AES-256、antifuse OTP 與 controller 如何形成同一邊界。", "How SRAM PUF, AES-256, antifuse OTP and the controller form one security boundary."), tags: ["Architecture", "APB"], icon: "i-layers", href: "#architecture", recordId: "OIP-ARCH-001" },
  { type: "technology", level: "Practitioner", title: localized("SRAM PUF root-key lifecycle", "SRAM PUF root-key lifecycle"), summary: localized("從 power-off、重建、authorized use 到 zeroization 的完整路徑。", "The complete path from power-off and reconstruction to authorized use and zeroization."), tags: ["SRAM PUF", "Key lifecycle"], icon: "i-fingerprint", href: "oip-secure-storage.html#lifecycle", recordId: "OIP-PUF-001" },
  { type: "technology", level: "Expert", title: localized("Helper data 不是 root key 備份", "Helper data is not a root-key backup"), summary: localized("以 error correction、privacy amplification 與 leakage proof 正確理解公開輔助資料。", "Understand public helper data through error correction, privacy amplification and leakage proof."), tags: ["Helper data", "Reliability"], icon: "i-cipher", href: "oip-secure-storage.html#helper-data", recordId: "OIP-PUF-001" },
  { type: "comparison", level: "Practitioner", title: localized("SRAM PUF vs. NeoPUF", "SRAM PUF vs. NeoPUF"), summary: localized("以 power-off physical state 比較 volatile startup response 與 persistent enrolled path。", "Compare a volatile startup response with a persistent enrolled path through the power-off physical state."), tags: ["NeoPUF", "Comparison"], icon: "i-power", href: "memory-physics.html#positioning" },
  { type: "product", level: "Executive", title: localized("Secure Storage vs. Secure OTP", "Secure Storage vs. Secure OTP"), summary: localized("從 PUF root、資料保護、整合、擴充與量產證據進行 like-for-like 比較。", "A like-for-like comparison across the PUF root, data protection, integration, scale and field evidence."), tags: ["Positioning", "Product"], icon: "i-evidence", href: "#compare", recordId: "OIP-SYS-001" },
  { type: "case", level: "Practitioner", title: localized("RP2350：物理存取後仍可觀察的狀態", "RP2350: observable state after physical access"), summary: localized("把 fault、wrapper、detector 與 bit-cell 攻擊轉成產品需求。", "Turn fault, wrapper, detector and bit-cell attacks into product requirements."), tags: ["Fault", "Physical attack"], icon: "i-probe", href: "oip-secure-storage.html#threat", recordId: "OIP-OTP-001" },
  { type: "integration", level: "Executive", title: localized("TSMC OIP readiness", "TSMC OIP readiness"), summary: localized("節點驗證、PVT、provisioning、認證 collateral 與供應商責任。", "Node validation, PVT, provisioning, certification collateral and supplier accountability."), tags: ["TSMC", "Qualification"], icon: "i-wafer", href: "oip-secure-storage.html#oip", recordId: "OIP-NODE-001" },
  { type: "integration", level: "Executive", title: localized("AI Systems × NVM Opportunity Map", "AI Systems × NVM Opportunity Map"), summary: localized("以 primary evidence 區分 immutable trust、bounded lifecycle、live adaptation 與 operational evidence。", "Use primary evidence to separate immutable trust, bounded lifecycle, live adaptation and operational evidence."), tags: ["AI Systems", "Persistent state"], icon: "i-chip", href: "ai-nvm-opportunities.html", recordId: "AI-NVM-INF-001" }
];

const architectureDetails = {
  puf: {
    number: "BLOCK 01", label: localized("DEVICE-UNIQUE", "DEVICE-UNIQUE"), icon: "i-fingerprint",
    title: localized("沒有永久地址的根金鑰", "A root key with no permanent address"),
    text: localized("上電時量測 SRAM startup variation，經 PUF processing 重建穩定、裝置唯一的 root；根金鑰從不儲存在晶片中。", "SRAM startup variation is measured at power-up and processed into a stable device-unique root. The root key is never stored on-chip."),
    list: localized(["上電重建", "公開 helper data", "縮短 key residency"], ["Power-up reconstruction", "Public helper data", "Short key residency"])
  },
  crypto: {
    number: "BLOCK 02", label: localized("AES-256", "AES-256"), icon: "i-cipher",
    title: localized("把記憶體讀取轉成密碼學問題", "Transform a memory read into a cryptographic problem"),
    text: localized("密碼引擎在受控 subsystem 內，以 PUF root 衍生的 256-bit key 加解密 OTP 資料。", "The cryptographic engine encrypts and decrypts OTP data with 256-bit keys derived from the PUF root inside the controlled subsystem."),
    list: localized(["AES-256 加解密", "衍生工作金鑰", "受控 crypto boundary"], ["AES-256 encryption/decryption", "Derived working keys", "Controlled crypto boundary"])
  },
  otp: {
    number: "BLOCK 03", label: localized("永久密文", "PERMANENT CIPHERTEXT"), icon: "i-memory",
    title: localized("永久保存資料，而不是 root secret", "Keep the data permanent, not the root secret"),
    text: localized("Antifuse OTP 保存加密後的 code、device data、keys 與 security configuration，同時維持一次性可編程的 lifecycle 特性。", "Antifuse OTP holds encrypted code, device data, keys and security configuration while retaining its one-time-programmable lifecycle properties."),
    list: localized(["靜態加密資料", "可配置安全區域", "永久 lifecycle state"], ["Encrypted data at rest", "Configurable secure regions", "Permanent lifecycle state"])
  },
  controller: {
    number: "BLOCK 04", label: localized("單一安全邊界", "ONE SECURITY BOUNDARY"), icon: "i-control",
    title: localized("協調跨 block 的安全假設", "Coordinate the cross-block assumptions"),
    text: localized("Secure Controller 統一協調 PUF initialization、crypto operations、provisioning、access policy 與 host SoC 的 AMBA APB 通訊。", "The Secure Controller coordinates PUF initialization, crypto operations, provisioning, access policy and AMBA APB communication with the host SoC."),
    list: localized(["AMBA APB 整合", "自動 provisioning", "Address scrambling 與 policy"], ["AMBA APB integration", "Automatic provisioning", "Address scrambling and policy"])
  }
};

const lifecycleDetails = [
  { index: localized("01 / 靜態", "01 / AT REST"), title: localized("Power-off 的核心安全優勢：沒有永久保存的 reconstructed root", "Core power-off advantage: no intentionally stored or powered reconstructed root remains"), text: localized("在已驗證的 shutdown 條件下，OTP 保留 ciphertext、helper material 與 lifecycle state；transistor mismatch 仍可能存在，remanence 與 zeroization 仍須驗證。", "Under validated shutdown conditions, OTP retains ciphertext, helper material and lifecycle state. Transistor mismatch may persist; remanence and zeroization remain assurance targets.") },
  { index: localized("02 / 重建", "02 / RECONSTRUCTION"), title: localized("同一顆裝置重建相同 root", "The same device rebuilds the same root"), text: localized("上電時，裝置量測 SRAM startup response，使用受保護的 PUF processing 與公開 helper data 重建穩定 root。", "At power-up, the device measures its SRAM startup response and uses protected PUF processing plus public helper data to reconstruct a stable root.") },
  { index: localized("03 / 授權窗口", "03 / AUTHORIZED WINDOW"), title: localized("衍生金鑰保護正在進行的工作", "Derived keys protect the work in progress"), text: localized("在 secure boundary 內，衍生金鑰授權 OTP 存取並保護系統資產；目標是短暫、受控的 key-residency window。", "Inside the secure boundary, derived keys authorize OTP reads and writes and protect system assets. The goal is a short, controlled key-residency window.") },
  { index: localized("04 / 移除", "04 / REMOVE"), title: localized("敏感金鑰材料被清除", "Sensitive key material is cleared"), text: localized("工作完成後，依 implementation lifecycle 移除 working key material；精確 zeroization 行為應由產品文件確認。", "When no longer needed, working key material is removed according to the implementation lifecycle. Exact zeroization behavior should be confirmed in product documentation.") }
];

const powerStates = {
  off: {
    tag: localized("靜態", "AT REST"), title: localized("Power-off 的核心安全優勢：沒有永久保存的 reconstructed root", "Core power-off advantage: no intentionally stored or powered reconstructed root remains"),
    text: localized("在已驗證的 shutdown 條件下，OTP 保留 ciphertext、helper material 與 lifecycle state；transistor mismatch 仍可能存在，remanence 與 zeroization 仍須驗證。", "Under validated shutdown conditions, OTP retains ciphertext, helper material and lifecycle state. Transistor mismatch may persist; remanence and zeroization remain assurance targets."),
    power: "POWER OFF", key: localized("沒有 powered reconstructed root", "NO POWERED RECONSTRUCTED ROOT"), result: localized("控制鏈成立時預期為密文", "EXPECTED CIPHERTEXT IF CONTROLS HOLD")
  },
  on: {
    tag: localized("受控窗口", "CONTROLLED WINDOW"), title: localized("Root key 已重建", "Root key is reconstructed"),
    text: localized("上電後，同一顆晶片在 secure boundary 內重建相同 root，再衍生工作金鑰保護 OTP 存取。", "At power-up, the same device reconstructs the same root inside the secure boundary and derives working keys to protect OTP access."),
    power: "POWER UP", key: localized("已重建", "RECONSTRUCTED"), result: localized("授權存取", "AUTHORIZED ACCESS")
  }
};

const staticTextPairs = [
  ["永久保存資料，", "Protect permanent data,"],
  ["不永久保存根金鑰。", "with a root key that is not permanent."],
  ["以 SRAM PUF 每次上電重建 device-unique root key，再由 AES-256 保護 OTP 內容。在已驗證的 shutdown 條件下，不保留刻意儲存或仍由電源維持的 reconstructed root。SRAM device mismatch、helper material 與 lifecycle state 可能持續存在；只有在 composed controls 成立時，sensitive payload 才應以 ciphertext 留存。", "Reconstruct a device-unique root key from SRAM PUF at every power-up, then protect OTP contents with AES-256. Under validated shutdown conditions, no intentionally stored or powered reconstructed root remains. SRAM device mismatch, helper material and lifecycle state may persist; sensitive payload should remain only as ciphertext when the composed controls hold."],
  ["探索 Power-off State", "Explore the power-off state"],
  ["開啟 OIP Brief", "Open the OIP brief"],
  ["安全不是由資料能保存多久決定，", "Security is not decided by how long data can remain,"],
  ["而是由攻擊發生時，", "but by what is still on the device"],
  ["晶片裡還剩下什麼", "when an attack occurs"],
  ["決定。", "."],
  ["OTP 解決永久性；Secure Storage 解決機密性。即使攻擊者成功觀察記憶體狀態，他取得的也應該是受保護資料，而不是可直接使用的 root secret。", "OTP solves permanence; Secure Storage solves confidentiality. Even if an attacker observes the memory state, the result should be protected data rather than a directly usable root secret."],
  ["用 Power-off State 檢驗設計", "Evaluate the design through its power-off state"],
  ["在已驗證的 shutdown 條件下，不保留 powered reconstructed root；transistor mismatch 與 helper material 仍可能存在。", "Under validated shutdown conditions, no powered reconstructed root remains; transistor mismatch and helper material may persist."],
  ["在已驗證的 shutdown 條件下，不保留刻意儲存或已重建、仍由電源維持的 root；transistor mismatch 與 helper material 仍可能存在。", "Under validated shutdown conditions, no intentionally stored, reconstructed or powered root remains; transistor mismatch and helper material may persist."],
  ["OTP 永久保存的是 AES-256 密文與安全狀態。", "OTP permanently retains AES-256 ciphertext and security state."],
  ["PUF、crypto、OTP 與 controller 共同構成安全子系統。", "PUF, crypto, OTP and the controller form one security subsystem."],
  ["先看斷電時", "Start with what an attacker faces"],
  ["攻擊者面對什麼。", "when the power is off."],
  ["切換狀態，觀察 root key 的存在窗口。Secure Storage 的主張不是物理攻擊會消失，而是成功讀取後能揭露的內容被限制。", "Switch states to observe the root key's residency window. Secure Storage does not make physical attacks disappear; it limits what a successful readout can reveal."],
  ["用公開攻擊界定 threat model，", "Use public attacks to define the threat model—"],
  ["再把它轉成產品要求", "then translate it into product requirements"],
  ["RP2350 是特定實作的公開 case，不代表所有 OTP 都同樣可攻。它揭示兩條平行路徑：fault 可能破壞 control assumptions；FIB／PVC 則接近 physical bit-state recovery。產品要求因此是：即使 readout 成功，也不應直接得到 usable secret。", "RP2350 is a public case for one implementation, not proof that every OTP is equally exploitable. It exposes two parallel paths: faults can collapse control assumptions, while FIB/PVC can approach physical bit-state recovery. The product requirement is that even a successful readout should not directly yield a usable secret."],
  ["電壓、laser 或 EM disturbance 可能改變 boot、permission 或 lock 行為。", "Voltage, laser or EM disturbance can alter boot, permission or lock behavior."],
  ["公開案例已讀出相鄰 bit pair 的 OR；完整逐 bit recovery 仍未被示範。", "The public case recovered the OR of adjacent bit pairs; complete per-bit recovery was not demonstrated."],
  ["只有在所有 composed controls 成立時，readout 才應停在 scrambled ciphertext。", "Only when every composed control holds should readout stop at scrambled ciphertext."],
  ["以 target node、macro、integration 與 FI／SCA／invasive evidence 驗證結果。", "Validate the outcome with evidence for the target node, macro, integration and FI/SCA/invasive scope."],
  ["這個案例用來界定 threat model；它不構成任何 target Secure Storage configuration 的 resistance evidence。", "This case defines a threat model; it is not resistance evidence for any target Secure Storage configuration."],
  ["四個 block，", "Four blocks."],
  ["一個安全結果。", "One security outcome."],
  ["產品決策不只評估四個各自正確的 primitives，而是評估從 root、crypto、storage、control 到 lifecycle 是否形成責任邊界清楚的 subsystem。", "A product decision evaluates more than four individually correct primitives; it evaluates whether root, crypto, storage, control and lifecycle form one subsystem with clear accountability."],
  ["架構目標是把 reconstructed 與 derived key residency 限制在受控工作窗口。", "The architecture targets a bounded residency window for reconstructed and derived key material."],
  ["這是 lifecycle objective；reset、remanence 與 zeroization 行為仍須證據支持。", "This is a lifecycle objective whose reset, remanence and zeroization behavior still requires evidence."],
  ["公平比較，", "Compare fairly"],
  ["才能凸顯真正差異。", "to expose the real difference."],
  ["供應商揭露的成熟度證據，", "Vendor-reported maturity evidence"],
  ["可縮小不確定性。", "can narrow uncertainty."],
  ["但仍不能取代目標節點與配置的驗證。", "It does not replace validation on the target node and configuration."],
  ["金鑰只在需要工作的時候存在", "Keys exist only while authorized work is in progress"],
  ["不是「把 key 藏得更好」，而是把存在時間縮短成受控窗口。", "The goal is not to hide the key better, but to bound its residency to a controlled window."],
  ["技術價值，最終必須落在要保護的資產", "Technical value must ultimately protect a recognizable asset"],
  ["相同的 root-key lifecycle，因應不同市場中最昂貴、最敏感、最難替換的資料。", "The same root-key lifecycle protects the most expensive, sensitive and difficult-to-replace data across markets."],
  ["保護模型價值與平台完整性", "Protect model value and platform integrity"],
  ["把安全資料綁定到正確裝置", "Bind security data to the intended device"],
  ["降低靜態金鑰擷取目標", "Reduce static key-extraction targets"],
  ["大規模建立 device-unique trust", "Scale device-unique trust"],
  ["產品決策必須涵蓋", "The product decision must cover"],
  ["一個可歸責的安全結果。", "one accountable security outcome."],
  ["從技術名詞，走到可以做決策", "Move from technical vocabulary to informed decisions"],
  ["從記憶體物理，走到 AI 系統邊界", "From memory physics to AI-system boundaries"],
  ["證據先於機會推論", "Evidence comes before opportunity inference"],
  ["一條研究線拆解 bit-cell 與 sensing；另一條把 identity、repair、calibration、firmware 與 RAS evidence 映射到正確的 persistent-state contract。", "One research track examines bit-cells and sensing; another maps identity, repair, calibration, firmware and RAS evidence to the right persistent-state contract."],
  ["探索 AI × NVM 機會", "Explore AI × NVM opportunities"],
  ["開啟 Memory Physics", "Open Memory Physics"],
  ["查看 Evidence Ledger", "View the Evidence Ledger"],
  ["知道什麼，也清楚標示什麼還不知道", "State what is known—and clearly mark what is not"],
  ["永久保存資料", "Protect permanent data"],
  ["根金鑰不永久留存", "Keep the root key ephemeral"],
  ["安全不只取決於資料能保存多久", "Security is not defined only by data retention"],
  ["更取決於攻擊發生時，晶片裡還留下什麼", "It also depends on what remains on silicon when an attack occurs"],
  ["好的矽智財，必須定義清楚", "Strong silicon IP starts with a clearly defined boundary"],
  ["整合邊界也必須可以驗證", "That integration boundary must also be verifiable"],
  ["先關掉電源", "Start by removing power"],
  ["再看攻擊者能取得什麼", "Then examine what an attacker can obtain"],
  ["四個功能區塊協同運作", "Four functional blocks work together"],
  ["共同交付一個安全結果", "They deliver one security outcome"],
  ["提出技術宣稱", "Make the technical claim"],
  ["也要提出可以驗證的方法", "Then define how it can be verified"],
  ["先建立公平的比較基準", "Begin with a fair comparison baseline"],
  ["再判斷真正的技術差異", "Then identify the material technical difference"],
  ["信任不只存在於單一功能", "Trust does not reside in a single function"],
  ["它必須落實在系統邊界之內", "It must hold across the system boundary"],
  ["成熟度能縮小不確定性", "Maturity can narrow uncertainty"],
  ["Target evidence 才能決定適用性", "Target evidence determines applicability"],
  ["長期 deployment、PVT、aging、認證與修補紀錄可降低起始風險；但不會自動轉移到 licensed Secure Storage configuration。", "Long-running deployment, PVT, aging, certification and remediation records can reduce initial risk, but they do not automatically transfer to the licensed Secure Storage configuration."],
  ["產品決策不只涵蓋功能", "The product decision covers more than functionality"],
  ["也必須涵蓋可歸責的安全結果", "It must also cover an accountable security outcome"],
  ["從感測方式看見技術差異", "Use sensing architecture to expose technical differences"],
  ["從量產條件檢視商業差異", "Use production constraints to evaluate commercial differentiation"],
  ["本頁的證據原則：", "EVIDENCE PRINCIPLE"],
  ["對已知內容提供可追溯的證據；", "Provide traceable evidence for what is known."],
  ["對尚未確認的部分清楚標示限制。", "Clearly state the limits of what remains unconfirmed."],
  ["回到開頭", "Back to top"]
];

const zhToEn = new Map(staticTextPairs);
const enToZh = new Map(staticTextPairs.map(([zh, en]) => [en, zh]));

function translateStaticText(nextLanguage) {
  const map = nextLanguage === "en" ? zhToEn : enToZh;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style") || parent.closest("#learningPath, #filters, #articleGrid, #stateTitle, #stateText, #stateTag, #archDetail, #phaseDetail")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let node;
  while ((node = walker.nextNode())) {
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    if (!map.has(trimmed)) continue;
    node.nodeValue = raw.replace(trimmed, map.get(trimmed));
  }
}

function renderLearningPath() {
  const path = document.querySelector("#learningPath");
  path.innerHTML = lessons.map((lesson, index) => `
    <li>
      <a href="${lesson.href}"${lesson.recordId ? ` data-record-id="${lesson.recordId}"` : ""}>
        <span class="lesson-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="lesson-copy"><strong>${pick(lesson.title)}</strong><small>${pick(lesson.summary)}</small></span>
        <span class="lesson-status">${lesson.status}</span>
      </a>
    </li>`).join("");
}

function renderFilters() {
  const filters = document.querySelector("#filters");
  filters.innerHTML = Object.entries(typeLabels).map(([key, label]) => `<button class="filter${key === activeType ? " active" : ""}" data-type="${key}" type="button" aria-pressed="${key === activeType}">${pick(label)}</button>`).join("");
}

function renderArticles() {
  const query = document.querySelector("#searchInput").value.trim().toLowerCase();
  const results = articles.filter(article => {
    const matchesType = activeType === "all" || article.type === activeType;
    const haystack = [pick(article.title), pick(article.summary), article.level, ...article.tags].join(" ").toLowerCase();
    return matchesType && haystack.includes(query);
  });
  document.querySelector("#articleGrid").innerHTML = results.map(article => `
    <a class="article-card" href="${article.href}"${article.recordId ? ` data-record-id="${article.recordId}"` : ""}>
      <svg aria-hidden="true"><use href="#${article.icon}"/></svg>
      <div class="card-meta"><span>${pick(typeLabels[article.type])}</span><span>${article.level}</span></div>
      <h3>${pick(article.title)}</h3>
      <p>${pick(article.summary)}</p>
      <div class="card-bottom">${article.tags.map(tag => `#${tag}`).join(" · ")}</div>
    </a>`).join("");
  document.querySelector("#emptyState").hidden = results.length > 0;
}

function updatePowerState(state = document.querySelector("#power-lab").dataset.state) {
  const copy = powerStates[state];
  document.querySelector("#power-lab").dataset.state = state;
  document.querySelectorAll("[data-power]").forEach(item => {
    const active = item.dataset.power === state;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", active ? "true" : "false");
  });
  document.querySelector("#stateTag").textContent = pick(copy.tag);
  document.querySelector("#stateTitle").textContent = pick(copy.title);
  document.querySelector("#stateText").textContent = pick(copy.text);
  document.querySelector("#stagePower").textContent = copy.power;
  document.querySelector("#keyPresence b").textContent = pick(copy.key);
  document.querySelector("#readoutResult").textContent = pick(copy.result);
}

function updateArchitecture(nodeKey = activeArchitecture) {
  activeArchitecture = nodeKey;
  const detail = architectureDetails[nodeKey];
  document.querySelectorAll(".arch-node").forEach(item => {
    const active = item.dataset.node === nodeKey;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", active ? "true" : "false");
  });
  document.querySelector("#archNumber").textContent = detail.number;
  document.querySelector("#archTitle").textContent = pick(detail.title);
  document.querySelector("#archText").textContent = pick(detail.text);
  document.querySelector("#archIcon use").setAttribute("href", `#${detail.icon}`);
  document.querySelector(".detail-visual span").textContent = pick(detail.label);
  document.querySelector("#archList").innerHTML = pick(detail.list).map(item => `<li>${item}</li>`).join("");
}

function updatePhase(index = activePhase) {
  activePhase = Number(index);
  const detail = lifecycleDetails[activePhase];
  document.querySelectorAll(".phase").forEach(item => {
    const active = Number(item.dataset.phase) === activePhase;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", active ? "true" : "false");
  });
  document.querySelector("#phaseIndex").textContent = pick(detail.index);
  document.querySelector("#phaseTitle").textContent = pick(detail.title);
  document.querySelector("#phaseText").textContent = pick(detail.text);
}

function setLanguage(nextLanguage, persist = true) {
  if (!['zh', 'en'].includes(nextLanguage)) return;
  if (nextLanguage !== currentLanguage) translateStaticText(nextLanguage);
  currentLanguage = nextLanguage;
  document.documentElement.lang = nextLanguage === "zh" ? "zh-Hant" : "en";
  document.body.dataset.language = nextLanguage;
  document.querySelectorAll(".primary-nav [data-nav-key]").forEach(link => {
    link.textContent = navigationLabels[link.dataset.navKey][nextLanguage];
  });
  document.querySelector(".primary-nav").setAttribute("aria-label", nextLanguage === "zh" ? "主要導覽" : "Primary navigation");
  document.querySelector(".brand").setAttribute("aria-label", nextLanguage === "zh" ? "NVM Knowledge Hub 首頁" : "NVM Knowledge Hub home");
  document.querySelector(".hero-proof").setAttribute("aria-label", nextLanguage === "zh" ? "供應商公開的產品組合數據" : "Vendor-reported portfolio figures");
  document.querySelector(".signal-strip").setAttribute("aria-label", nextLanguage === "zh" ? "核心產品構成" : "Core product composition");
  document.querySelector(".state-switch").setAttribute("aria-label", nextLanguage === "zh" ? "切換電源狀態" : "Switch power state");
  document.querySelector(".silicon-stage").setAttribute("aria-label", nextLanguage === "zh" ? "Secure Storage 電源狀態示意" : "Secure Storage power-state model");
  document.querySelector(".architecture-flow").setAttribute("aria-label", nextLanguage === "zh" ? "Secure Storage 架構" : "Secure Storage architecture");
  document.querySelector(".compare-switch").setAttribute("aria-label", nextLanguage === "zh" ? "比較層級" : "Comparison level");
  document.querySelector("#filters").setAttribute("aria-label", nextLanguage === "zh" ? "內容類型篩選" : "Content-type filters");
  document.querySelector(".case-flow").setAttribute("aria-label", nextLanguage === "zh" ? "分層企業簽署參考架構" : "Layered enterprise-signing reference architecture");
  document.querySelector(".stack-sources").setAttribute("aria-label", nextLanguage === "zh" ? "分層安全案例的主要來源" : "Primary sources for the layered security case study");
  document.querySelector("#languageToggle").setAttribute("aria-label", nextLanguage === "zh" ? "Switch to English" : "Switch to Traditional Chinese");
  document.querySelector("#searchInput").setAttribute("aria-label", nextLanguage === "zh" ? "搜尋學習內容" : "Search learning content");
  document.querySelector("#themeToggle").setAttribute("aria-label", nextLanguage === "zh" ? "切換顯示主題" : "Toggle display theme");
  syncMenuState(document.querySelector(".primary-nav").classList.contains("open"));
  document.querySelector("#searchInput").placeholder = nextLanguage === "zh" ? "搜尋 OTP、PUF、retention、fault…" : "Search OTP, PUF, retention, fault…";
  document.querySelector("#emptyState").textContent = nextLanguage === "zh" ? "找不到符合條件的內容。" : "No matching learning content.";
  document.querySelector('meta[name="description"]').content = nextLanguage === "zh" ? "NVM Knowledge Hub：以 SRAM PUF、AES-256 與 OTP 為核心的 Secure Storage executive learning experience。" : "NVM Knowledge Hub: an executive Secure Storage learning experience built around SRAM PUF, AES-256 and OTP.";
  document.querySelector("#searchInput").value = "";
  activeType = "all";
  renderLearningPath();
  renderFilters();
  renderArticles();
  updatePowerState();
  updateArchitecture();
  updatePhase();
  if (persist) localStorage.setItem("nvm-language", nextLanguage);
}

document.querySelector("#filters").addEventListener("click", event => {
  const button = event.target.closest("button[data-type]");
  if (!button) return;
  activeType = button.dataset.type;
  renderFilters();
  renderArticles();
});
document.querySelector("#searchInput").addEventListener("input", renderArticles);

document.querySelectorAll("[data-power]").forEach(button => button.addEventListener("click", () => updatePowerState(button.dataset.power)));
document.querySelectorAll(".arch-node").forEach(button => button.addEventListener("click", () => updateArchitecture(button.dataset.node)));
document.querySelectorAll(".phase").forEach(button => button.addEventListener("click", () => updatePhase(button.dataset.phase)));

document.querySelectorAll(".compare-switch button").forEach(button => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;
    document.querySelectorAll(".compare-switch button").forEach(item => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", active ? "true" : "false");
    });
    document.querySelectorAll(".comparison-view").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === view));
  });
});

const menuButton = document.querySelector("#menuToggle");
const nav = document.querySelector(".primary-nav");
function syncMenuState(open) {
  menuButton.setAttribute("aria-expanded", open ? "true" : "false");
  menuButton.setAttribute("aria-label", open ? (currentLanguage === "zh" ? "關閉選單" : "Close menu") : (currentLanguage === "zh" ? "開啟選單" : "Open menu"));
}
function closeMenu(restoreFocus = false) {
  nav.classList.remove("open");
  syncMenuState(false);
  if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  syncMenuState(open);
  if (open) nav.querySelector("a")?.focus();
});
nav.addEventListener("click", event => {
  if (event.target.closest("a")) closeMenu();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && nav.classList.contains("open")) closeMenu(true);
});
window.matchMedia("(min-width: 1181px)").addEventListener("change", event => {
  if (event.matches) closeMenu();
});
function syncMenuToLayout() {
  if (getComputedStyle(menuButton).display === "none") closeMenu();
}
window.addEventListener("resize", syncMenuToLayout, { passive: true });

document.querySelector("#themeToggle").addEventListener("click", event => {
  const active = document.body.classList.toggle("light-mode");
  event.currentTarget.setAttribute("aria-pressed", active ? "true" : "false");
});
document.querySelector("#languageToggle").addEventListener("click", () => setLanguage(currentLanguage === "zh" ? "en" : "zh"));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .08, rootMargin: "0px 0px -40px" });
document.querySelectorAll(".reveal").forEach(section => revealObserver.observe(section));

const navLinks = [...document.querySelectorAll(".primary-nav a")];
const sections = navLinks.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-35% 0px -55%", threshold: 0 });
sections.forEach(section => navObserver.observe(section));

function updateScrollUI() {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  const ratio = scrollable > 0 ? doc.scrollTop / scrollable : 0;
  document.querySelector("#readingProgress").style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  document.querySelector(".site-header").classList.toggle("scrolled", doc.scrollTop > 30);
}
window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("resize", updateScrollUI);

renderLearningPath();
renderFilters();
renderArticles();
updatePowerState("off");
updateArchitecture("puf");
updatePhase(0);
const savedLanguage = localStorage.getItem("nvm-language");
if (savedLanguage === "en") setLanguage("en", false);
else setLanguage("zh", false);
updateScrollUI();
