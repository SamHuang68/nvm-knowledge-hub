let currentLanguage = "en";
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
    text: localized("上電時量測 SRAM startup variation，經 PUF processing 重建穩定、裝置唯一的 root；根金鑰不作為 powered reconstructed key 永久存放。", "SRAM startup variation is measured at power-up and processed into a stable device-unique root. The reconstructed root is not kept as a permanently stored powered key."),
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
    tag: localized("靜態", "AT REST"),
    title: localized("Power-off 的核心安全優勢：沒有永久保存的 reconstructed root", "Core power-off advantage: no intentionally stored or powered reconstructed root remains"),
    text: localized("在已驗證的 shutdown 條件下，OTP 保留 ciphertext、helper material 與 lifecycle state；transistor mismatch 仍可能存在，remanence 與 zeroization 仍須驗證。", "Under validated shutdown conditions, OTP retains ciphertext, helper material and lifecycle state. Transistor mismatch may persist; remanence and zeroization remain assurance targets."),
    power: "POWER OFF",
    keySmall: localized("重建根金鑰", "RECONSTRUCTED ROOT"),
    key: localized("沒有 powered reconstructed root", "NO POWERED RECONSTRUCTED ROOT"),
    readoutSmall: localized("攻擊者 recover", "ATTACKER RECOVERS"),
    result: localized("控制鏈成立時預期為密文", "EXPECTED CIPHERTEXT IF CONTROLS HOLD")
  },
  on: {
    tag: localized("受控窗口", "CONTROLLED WINDOW"),
    title: localized("Root key 已重建", "Root key is reconstructed"),
    text: localized("上電後，同一顆晶片在 secure boundary 內重建相同 root，再衍生工作金鑰保護 OTP 存取。", "At power-up, the same device reconstructs the same root inside the secure boundary and derives working keys to protect OTP access."),
    power: "POWER UP",
    keySmall: localized("重建根金鑰", "RECONSTRUCTED ROOT"),
    key: localized("已重建", "RECONSTRUCTED"),
    readoutSmall: localized("攻擊者 recover", "ATTACKER RECOVERS"),
    result: localized("授權存取", "AUTHORIZED ACCESS")
  }
};

function setBilingual(el, zh, en) {
  if (!el) return;
  el.innerHTML = `<span data-lang="zh">${zh}</span><span data-lang="en">${en}</span>`;
}

const STATIC_I18N = {
  heroProofSource: localized(
    "供應商公開的 portfolio context · 非 target-configuration assurance。Helper material、transistor mismatch 與 lifecycle state 可能持續存在；remanence 與 zeroization 仍是 assurance target。",
    "VENDOR-REPORTED PORTFOLIO CONTEXT · NOT TARGET-CONFIGURATION ASSURANCE. Helper material, transistor mismatch and lifecycle state may persist; remanence and zeroization remain assurance targets."
  ),
  nodeCopyTitle: localized("公開的先進節點 OTP 脈絡", "Published advanced-node OTP context"),
  nodeCopyBody: localized(
    "Synopsys 報告所列 TSMC 製程已完成 OTP silicon verification。節點可用性不能證明每個配置的 Secure Storage release、PUF 整合或攻擊評估。",
    "Synopsys reports OTP silicon-verified in the listed TSMC processes. Node availability does not prove Secure Storage release, PUF integration or attack evaluation for each configuration."
  ),
  portfolioScope: localized(
    "來源範圍 · Synopsys 報告的 portfolio 數字 · 非交付配置的 independent assurance",
    "SOURCE SCOPE · SYNOPSYS-REPORTED PORTFOLIO FIGURES · NOT INDEPENDENT ASSURANCE OF THE DELIVERED CONFIGURATION"
  ),
  compareSramP: localized(
    "上電的 SRAM logic state 會消失；process mismatch 仍可能存在，但不會有 reconstructed root。",
    "The powered SRAM logic state disappears; process mismatch remains, but no reconstructed root is present."
  ),
  compareSramPhy: localized("SRAM startup 的 transistor mismatch", "Transistor mismatch at SRAM startup"),
  compareSramRecon: localized("Response + 公開 helper data → 穩定 root", "Response + public helper data → stable root"),
  compareSramSec: localized("縮短 key residency 與受保護的 reconstruction", "Short key residency and protected reconstruction"),
  compareVersusSmall: localized(
    "持久 physical state 不等於 plaintext key storage。",
    "Persistent physical state is not the same as plaintext key storage."
  ),
  compareNeoP: localized(
    "Enrollment 形成永久的 quantum-tunneling conduction path。",
    "Enrollment forms a permanent quantum-tunneling conduction path."
  ),
  compareNeoPhy: localized("高壓 enrolled NMOS cell pair", "High-voltage enrolled NMOS cell pair"),
  compareNeoRecon: localized("Sense current；供應商表示無 helper data", "Sense current; vendor states no helper data"),
  compareNeoSec: localized("保護 enrolled state 的可觀測性與完整性", "Protect observability and integrity of enrolled state"),
  matrixPufRootSyn: localized("SRAM PUF；reconstructed root 不作為 stored powered key 保留", "SRAM PUF; reconstructed root not kept as a stored powered key"),
  matrixPufRootNeo: localized("NeoPUF；1024-bit physical PUF", "NeoPUF; 1024-bit physical PUF"),
  matrixDataSyn: localized("AES-256 encryption/decryption + address scrambling", "AES-256 encryption/decryption + address scrambling"),
  matrixDataNeo: localized("Instant hardware encryption + address/IO scrambling；公開文件未命名 algorithm", "Instant hardware encryption + address/IO scrambling; algorithm not named publicly"),
  matrixIntSyn: localized("AMBA APB、simple API、auto provisioning 與 initialization", "AMBA APB, simple API, auto provisioning and initialization"),
  matrixIntNeo: localized("AMBA APB、firmware/API、autoload、locks 與 zeroization", "AMBA APB, firmware/API, autoload, locks and zeroization"),
  matrixPortSyn: localized(
    "Synopsys 報告 &gt;1.5B 裝置使用 SRAM PUF、&gt;15 年 proven SRAM PUF 與 &gt;10B antifuse OTP NVM 出貨；target configuration 仍須關閉",
    "Synopsys reports &gt;1.5B devices using its SRAM PUF technology, &gt;15 years of proven SRAM PUF technology, and &gt;10B antifuse OTP NVM units shipped; target configuration still requires closure"
  ),
  matrixPortNeo: localized(
    "公開平台可用性；精確產品證據與 assurance scope 仍待確認",
    "Public platform availability; exact product evidence and assurance scope remain to be confirmed"
  ),
  compareConclusion: localized(
    "以 absent-at-rest root key、可歸屬的 portfolio context 與 pre-integrated subsystem 為主；仍須確認 configuration 與 ownership。",
    "Lead with an absent-at-rest root key, attributed portfolio context and a pre-integrated subsystem; confirm configuration and ownership."
  ),
  evidenceDev1: localized("使用 Synopsys SRAM PUF 技術的裝置", "devices using Synopsys SRAM PUF technology"),
  evidenceDev2: localized("年 proven SRAM PUF 技術", "years of proven SRAM PUF technology"),
  evidenceDev3: localized("Synopsys antifuse OTP NVM 出貨單位", "Synopsys antifuse OTP NVM units shipped"),
  ribbon1: localized("供應商報告的 PUF 範圍 350 nm → 2 nm", "350 nm → 2 nm vendor-reported PUF range"),
  ribbon2: localized("供應商報告的 characterization −40°C → 150°C", "−40°C → 150°C vendor-reported characterization"),
  ribbon3: localized("portfolio 層級 automotive lineage ISO 26262 / 21434", "ISO 26262 / 21434 portfolio-level automotive lineage"),
  ribbon4: localized("PSA · SESIP · NIST scope 須逐產品確認", "PSA · SESIP · NIST scope must be checked per product"),
  attackH3Fault: localized("Fault 可能破壞 assumptions", "Fault can collapse assumptions"),
  attackH3Fib: localized("FIB/PVC 可能暴露 physical state", "FIB/PVC can expose physical state"),
  attackH3Encrypt: localized("Encrypt、scramble 與 govern", "Encrypt, scramble and govern"),
  attackH3Close: localized("關閉 target configuration", "Close the target configuration"),
  appAiP: localized("Firmware anti-rollback · 模型/權重 keys · 平台 identity", "Firmware anti-rollback · model/weight keys · platform identity"),
  appAutoP: localized("Calibration · configuration · secure boot · lifecycle 狀態", "Calibration · configuration · secure boot · lifecycle state"),
  appAeroP: localized("任務演算法 · 永久 identity · 防克隆 credentials", "Mission algorithms · permanent identity · anti-cloning credentials"),
  appIotP: localized("Protocol keys · ROM patches · 防偽 identity", "Protocol keys · ROM patches · anti-counterfeit identity"),
  chapterMetaWafer: localized("架構 · 介面 · lifecycle · 交付物", "Architecture · interface · lifecycle · deliverables"),
  chapterMetaProbe: localized("PVT · BER · retention · 攻擊評估", "PVT · BER · retention · attack evaluation"),
  chapterMetaSilicon: localized("Root · 保護 · 控制 · 偵測 · 舉證", "Root · protect · control · detect · prove"),
  caseIntroSpan: localized("REFERENCE ARCHITECTURE · 非 turnkey Okta 整合", "REFERENCE ARCHITECTURE · NOT A TURNKEY OKTA INTEGRATION"),
  caseFlow1: localized("使用者 · posture · policy · revoke", "user · posture · policy · revoke"),
  caseFlow2: localized("reconstruct · derive · zeroize 流程", "reconstruct · derive · zeroize"),
  caseFlow3: localized("可攜 data protection", "portable data protection"),
  stackSrc1: localized("OpenPGP 私鑰 packet", "OpenPGP Secret Key Packet"),
  stackSrc2: localized("FastPass 驗證流程", "FastPass authentication flow"),
  stackSrc3: localized("Device registration 與 key storage", "Device registration & key storage"),
  stackSrc4: localized("PUF-based Key Vault 架構", "PUF-based Key Vault"),
  sourceSm1: localized("架構 · AES-256 · APB · provisioning", "Architecture · AES-256 · APB · provisioning"),
  sourceSm2: localized("Root-key reconstruction · helper data · 場域 evidence", "Root-key reconstruction · helper data · field evidence"),
  sourceSm3: localized("NeoPUF enrollment · 持久 conduction path", "NeoPUF enrollment · persistent conduction path"),
  sourceSm4: localized("Taxonomy · 商業 vendor index", "Taxonomy · commercial vendor index"),
  sourceSm5: localized("Fault injection · side-channel analysis · assurance 服務", "Fault injection · side-channel analysis · assurance services"),
  learningPathTitle: localized("Secure Storage 決策路徑", "Secure Storage Decision Path"),
  researchAiStrong: localized("跨 AI Silicon 的 Persistent State", "Persistent State Across AI Silicon"),
  researchAiSpan: localized("Proof → state contract → NVM 機會", "Proof → state contract → NVM opportunity"),
  researchPhysStrong: localized("Sense Mode × Bit-cell Economics", "Sense Mode × Bit-cell Economics"),
  researchPhysSpan: localized("SRAM PUF · OTP · differential read", "SRAM PUF · OTP · differential read"),
  researchOipBrief: localized("OIP Secure Storage Brief", "OIP Secure Storage Brief"),
  readoutProtected: localized("受保護資料", "PROTECTED DATA"),
  otpContentSmall: localized("OTP 內容", "OTP CONTENT"),
  otpContentBold: localized("AES-256 密文", "AES-256 CIPHERTEXT")
};

function hydrateStaticI18n() {
  document.querySelectorAll("[data-i18n-key]").forEach((el) => {
    const copy = STATIC_I18N[el.dataset.i18nKey];
    if (copy) setBilingual(el, copy.zh, copy.en);
  });
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
  setBilingual(document.querySelector("#stateTag"), copy.tag.zh, copy.tag.en);
  setBilingual(document.querySelector("#stateTitle"), copy.title.zh, copy.title.en);
  setBilingual(document.querySelector("#stateText"), copy.text.zh, copy.text.en);
  document.querySelector("#stagePower").textContent = copy.power;
  setBilingual(document.querySelector("#keyPresence small"), copy.keySmall.zh, copy.keySmall.en);
  setBilingual(document.querySelector("#keyPresence b"), copy.key.zh, copy.key.en);
  setBilingual(document.querySelector(".readout-result small"), copy.readoutSmall.zh, copy.readoutSmall.en);
  setBilingual(document.querySelector("#readoutResult"), copy.result.zh, copy.result.en);
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
  setBilingual(document.querySelector("#archTitle"), detail.title.zh, detail.title.en);
  setBilingual(document.querySelector("#archText"), detail.text.zh, detail.text.en);
  document.querySelector("#archIcon use").setAttribute("href", `#${detail.icon}`);
  setBilingual(document.querySelector(".detail-visual span"), detail.label.zh, detail.label.en);
  const zhList = detail.list.zh;
  const enList = detail.list.en;
  document.querySelector("#archList").innerHTML = zhList.map((zh, index) =>
    `<li><span data-lang="zh">${zh}</span><span data-lang="en">${enList[index]}</span></li>`
  ).join("");
}

function updatePhase(index = activePhase) {
  activePhase = Number(index);
  const detail = lifecycleDetails[activePhase];
  document.querySelectorAll(".phase").forEach(item => {
    const active = Number(item.dataset.phase) === activePhase;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", active ? "true" : "false");
  });
  setBilingual(document.querySelector("#phaseIndex"), detail.index.zh, detail.index.en);
  setBilingual(document.querySelector("#phaseTitle"), detail.title.zh, detail.title.en);
  setBilingual(document.querySelector("#phaseText"), detail.text.zh, detail.text.en);
}

function getLanguage() {
  return window.HubLanguage ? window.HubLanguage.get() : currentLanguage;
}

function syncAppLanguage(nextLanguage) {
  if (!["zh", "en"].includes(nextLanguage)) return;
  currentLanguage = nextLanguage;
  document.querySelector("#searchInput").value = "";
  activeType = "all";
  document.querySelector("#emptyState").textContent = nextLanguage === "zh"
    ? "找不到符合條件的內容。"
    : "No matching learning content.";
  hydrateStaticI18n();
  renderLearningPath();
  renderFilters();
  renderArticles();
  updatePowerState();
  updateArchitecture();
  updatePhase();
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
  const lang = getLanguage();
  menuButton.setAttribute("aria-expanded", open ? "true" : "false");
  menuButton.setAttribute("aria-label", open
    ? (lang === "zh" ? "關閉選單" : "Close menu")
    : (lang === "zh" ? "開啟選單" : "Open menu"));
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
hydrateStaticI18n();
updatePowerState("off");
updateArchitecture("puf");
updatePhase(0);
const activeLang = window.HubLanguage ? window.HubLanguage.get() : "en";
syncAppLanguage(activeLang);
updateScrollUI();

window.addEventListener("hub:language-change", (e) => {
  syncAppLanguage(e.detail.language);
  syncMenuState(document.querySelector(".primary-nav").classList.contains("open"));
});
