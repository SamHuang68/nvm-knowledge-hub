let currentLanguage = "zh";
let activeType = "all";
let activeArchitecture = "puf";
let activePhase = 0;

const localized = (zh, en) => ({ zh, en });
const pick = value => typeof value === "string" ? value : value[currentLanguage];

const navigationLabels = {
  why: localized("Why", "Why"),
  architecture: localized("Architecture", "Architecture"),
  assurance: localized("Assurance", "Assurance"),
  compare: localized("Compare", "Compare"),
  evidence: localized("Evidence", "Evidence"),
  learn: localized("Learn", "Learn"),
  research: localized("Research", "Research")
};

const lessons = [
  { title: localized("NVM 與 OTP 的安全邊界", "The security boundary of NVM and OTP"), summary: localized("永久保存不等於機密保存", "Permanent storage is not confidential storage"), status: "READY" },
  { title: localized("Secure Storage 四層架構", "The four-layer Secure Storage architecture"), summary: localized("PUF、AES、OTP、Controller", "PUF, AES, OTP and controller"), status: "READY" },
  { title: localized("Power-off State", "The power-off state"), summary: localized("用斷電狀態判斷靜態攻擊面", "Evaluate the at-rest physical attack surface"), status: "READY" },
  { title: localized("Physical Security Assurance", "Physical Security Assurance"), summary: localized("FI、SCA、證據成熟度與認證範圍", "FI, SCA, evidence maturity and certification scope"), status: "READY" },
  { title: localized("SRAM PUF 與 NeoPUF", "SRAM PUF and NeoPUF"), summary: localized("比較物理 response 的承載位置", "Compare where the physical response resides"), status: "READY" },
  { title: localized("量產證據與 Qualification", "Field evidence and qualification"), summary: localized("PVT、aging、認證與攻擊證據", "PVT, aging, certification and attack evidence"), status: "NEXT" },
  { title: localized("TSMC OIP 整合對話", "The TSMC OIP integration conversation"), summary: localized("節點、APB、provisioning、責任", "Nodes, APB, provisioning and accountability"), status: "NEXT" }
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
  { type: "concept", level: "Foundation", title: localized("OTP durability ≠ confidentiality", "OTP durability ≠ confidentiality"), summary: localized("了解為什麼永久儲存的 bits 仍可能成為物理擷取目標。", "Why permanently stored bits can still become a physical extraction target."), tags: ["OTP", "Threat model"], icon: "i-memory" },
  { type: "architecture", level: "Foundation", title: localized("Secure Storage 四個安全 block", "The four security blocks of Secure Storage"), summary: localized("SRAM PUF、AES-256、antifuse OTP 與 controller 如何形成同一邊界。", "How SRAM PUF, AES-256, antifuse OTP and the controller form one security boundary."), tags: ["Architecture", "APB"], icon: "i-layers" },
  { type: "technology", level: "Practitioner", title: localized("SRAM PUF root-key lifecycle", "SRAM PUF root-key lifecycle"), summary: localized("從 power-off、重建、authorized use 到 zeroization 的完整路徑。", "The complete path from power-off and reconstruction to authorized use and zeroization."), tags: ["SRAM PUF", "Key lifecycle"], icon: "i-fingerprint" },
  { type: "technology", level: "Expert", title: localized("Helper data 不是 root key 備份", "Helper data is not a root-key backup"), summary: localized("以 error correction、privacy amplification 與 leakage proof 正確理解公開輔助資料。", "Understand public helper data through error correction, privacy amplification and leakage proof."), tags: ["Helper data", "Reliability"], icon: "i-cipher" },
  { type: "comparison", level: "Practitioner", title: localized("SRAM PUF vs. NeoPUF", "SRAM PUF vs. NeoPUF"), summary: localized("以 power-off physical state 比較 volatile startup response 與 persistent enrolled path。", "Compare a volatile startup response with a persistent enrolled path through the power-off physical state."), tags: ["NeoPUF", "Comparison"], icon: "i-power" },
  { type: "product", level: "Executive", title: localized("Secure Storage vs. Secure OTP", "Secure Storage vs. Secure OTP"), summary: localized("從 PUF root、資料保護、整合、擴充與量產證據進行 like-for-like 比較。", "A like-for-like comparison across the PUF root, data protection, integration, scale and field evidence."), tags: ["Positioning", "Product"], icon: "i-evidence" },
  { type: "case", level: "Practitioner", title: localized("RP2350：物理存取後還剩什麼？", "RP2350: what remains after physical access?"), summary: localized("把 fault、wrapper、detector 與 bit-cell 攻擊轉成產品需求。", "Turn fault, wrapper, detector and bit-cell attacks into product requirements."), tags: ["Fault", "Physical attack"], icon: "i-probe" },
  { type: "integration", level: "Executive", title: localized("TSMC OIP readiness", "TSMC OIP readiness"), summary: localized("節點驗證、PVT、provisioning、認證 collateral 與供應商責任。", "Node validation, PVT, provisioning, certification collateral and supplier accountability."), tags: ["TSMC", "Qualification"], icon: "i-wafer" }
];

const architectureDetails = {
  puf: {
    number: "BLOCK 01", label: localized("DEVICE-UNIQUE", "DEVICE-UNIQUE"), icon: "i-fingerprint",
    title: localized("沒有永久地址的根金鑰。", "A root key with no permanent address."),
    text: localized("上電時量測 SRAM startup variation，經 PUF processing 重建穩定、裝置唯一的 root；根金鑰從不儲存在晶片中。", "SRAM startup variation is measured at power-up and processed into a stable device-unique root. The root key is never stored on-chip."),
    list: localized(["上電重建", "公開 helper data", "縮短 key residency"], ["Power-up reconstruction", "Public helper data", "Short key residency"])
  },
  crypto: {
    number: "BLOCK 02", label: localized("AES-256", "AES-256"), icon: "i-cipher",
    title: localized("把記憶體讀取轉成密碼學問題。", "Transform a memory read into a cryptographic problem."),
    text: localized("密碼引擎在受控 subsystem 內，以 PUF root 衍生的 256-bit key 加解密 OTP 資料。", "The cryptographic engine encrypts and decrypts OTP data with 256-bit keys derived from the PUF root inside the controlled subsystem."),
    list: localized(["AES-256 加解密", "衍生工作金鑰", "受控 crypto boundary"], ["AES-256 encryption/decryption", "Derived working keys", "Controlled crypto boundary"])
  },
  otp: {
    number: "BLOCK 03", label: localized("永久密文", "PERMANENT CIPHERTEXT"), icon: "i-memory",
    title: localized("永久保存資料，而不是 root secret。", "Keep the data permanent, not the root secret."),
    text: localized("Antifuse OTP 保存加密後的 code、device data、keys 與 security configuration，同時維持一次性可編程的 lifecycle 特性。", "Antifuse OTP holds encrypted code, device data, keys and security configuration while retaining its one-time-programmable lifecycle properties."),
    list: localized(["靜態加密資料", "可配置安全區域", "永久 lifecycle state"], ["Encrypted data at rest", "Configurable secure regions", "Permanent lifecycle state"])
  },
  controller: {
    number: "BLOCK 04", label: localized("單一安全邊界", "ONE SECURITY BOUNDARY"), icon: "i-control",
    title: localized("讓跨 block 假設有明確責任。", "Own the cross-block assumptions."),
    text: localized("Secure Controller 統一協調 PUF initialization、crypto operations、provisioning、access policy 與 host SoC 的 AMBA APB 通訊。", "The Secure Controller coordinates PUF initialization, crypto operations, provisioning, access policy and AMBA APB communication with the host SoC."),
    list: localized(["AMBA APB 整合", "自動 provisioning", "Address scrambling 與 policy"], ["AMBA APB integration", "Automatic provisioning", "Address scrambling and policy"])
  }
};

const lifecycleDetails = [
  { index: localized("01 / 靜態", "01 / AT REST"), title: localized("Power-off 的核心安全優勢：Root key 不存在。", "Core power-off security advantage: no root key is present."), text: localized("OTP 保留密文與永久 lifecycle state；沒有 powered SRAM response，也沒有 reconstructed root key。", "OTP retains ciphertext and permanent lifecycle state. There is no powered SRAM response and no reconstructed root key.") },
  { index: localized("02 / 重建", "02 / RECONSTRUCTION"), title: localized("同一顆裝置重建相同 root。", "The same device rebuilds the same root."), text: localized("上電時，裝置量測 SRAM startup response，使用受保護的 PUF processing 與公開 helper data 重建穩定 root。", "At power-up, the device measures its SRAM startup response and uses protected PUF processing plus public helper data to reconstruct a stable root.") },
  { index: localized("03 / 授權窗口", "03 / AUTHORIZED WINDOW"), title: localized("衍生金鑰保護正在進行的工作。", "Derived keys protect the work in progress."), text: localized("在 secure boundary 內，衍生金鑰授權 OTP 存取並保護系統資產；目標是短暫、受控的 key-residency window。", "Inside the secure boundary, derived keys authorize OTP reads and writes and protect system assets. The goal is a short, controlled key-residency window.") },
  { index: localized("04 / 移除", "04 / REMOVE"), title: localized("敏感金鑰材料被清除。", "Sensitive key material is cleared."), text: localized("工作完成後，依 implementation lifecycle 移除 working key material；精確 zeroization 行為應由產品文件確認。", "When no longer needed, working key material is removed according to the implementation lifecycle. Exact zeroization behavior should be confirmed in product documentation.") }
];

const powerStates = {
  off: {
    tag: localized("靜態", "AT REST"), title: localized("Power-off 的核心安全優勢：Root key 不存在。", "Core power-off security advantage: no root key is present."),
    text: localized("OTP 保留 AES-256 ciphertext；SRAM startup state 與衍生根金鑰皆不存在。", "OTP retains AES-256 ciphertext; neither the SRAM startup state nor the derived root key is present."),
    power: "POWER OFF", key: localized("不存在", "NOT PRESENT"), result: localized("受保護資料", "PROTECTED DATA")
  },
  on: {
    tag: localized("受控窗口", "CONTROLLED WINDOW"), title: localized("Root key 已重建。", "Root key is reconstructed."),
    text: localized("上電後，同一顆晶片在 secure boundary 內重建相同 root，再衍生工作金鑰保護 OTP 存取。", "At power-up, the same device reconstructs the same root inside the secure boundary and derives working keys to protect OTP access."),
    power: "POWER UP", key: localized("已重建", "RECONSTRUCTED"), result: localized("授權存取", "AUTHORIZED ACCESS")
  }
};

const staticTextPairs = [
  ["永久保存資料，", "Protect permanent data,"],
  ["不永久保存根金鑰。", "with a root key that is not permanent."],
  ["以 SRAM PUF 每次上電重建 device-unique root key，再由 AES-256 保護 OTP 內容。斷電時，晶片只留下密文。", "Reconstruct a device-unique root key from SRAM PUF at every power-up, then protect OTP contents with AES-256. At power-off, only ciphertext remains."],
  ["探索 Power-off State", "Explore the power-off state"],
  ["查看整合架構", "Explore the architecture"],
  ["安全不是由資料能保存多久決定，", "Security is not decided by how long data can remain,"],
  ["而是由攻擊發生時，", "but by what is still on the device"],
  ["晶片裡還剩下什麼", "when an attack occurs"],
  ["決定。", "."],
  ["OTP 解決永久性；Secure Storage 解決機密性。即使攻擊者成功觀察記憶體狀態，他取得的也應該是受保護資料，而不是可直接使用的 root secret。", "OTP solves permanence; Secure Storage solves confidentiality. Even if an attacker observes the memory state, the result should be protected data rather than a directly usable root secret."],
  ["用 Power-off State 檢驗設計", "Evaluate the design through its power-off state"],
  ["斷電後沒有 powered SRAM response，也沒有 root key。", "At power-off there is no powered SRAM response and no root key."],
  ["OTP 永久保存的是 AES-256 密文與安全狀態。", "OTP permanently retains AES-256 ciphertext and security state."],
  ["PUF、crypto、OTP 與 controller 共同構成安全子系統。", "PUF, crypto, OTP and the controller form one security subsystem."],
  ["先看斷電時", "Start with what an attacker faces"],
  ["攻擊者面對什麼。", "when the power is off."],
  ["切換狀態，觀察 root key 的存在窗口。Secure Storage 的主張不是物理攻擊會消失，而是成功讀取後能揭露的內容被限制。", "Switch states to observe the root key's residency window. Secure Storage does not make physical attacks disappear; it limits what a successful readout can reveal."],
  ["把物理攻擊的「因」，轉成 Secure Storage 的「果」。", "Turn the cause—physical attack—into the product response."],
  ["RP2350 的關鍵教訓是：當 OTP 直接承載可用 secret，繞過 lock 或讀出 cell 就接近攻擊終點。Secure Storage 以 PUF root、AES-256、address scrambling 與 controller 改寫成功 readout 的後果。", "The central RP2350 lesson is that when OTP directly carries a usable secret, bypassing a lock or reading cells approaches the end of the attack. Secure Storage uses a PUF root, AES-256, address scrambling and a controller to change the consequence of a successful readout."],
  ["電壓與啟動時序可能改變鎖定狀態。", "Voltage and boot timing can alter lock state."],
  ["侵入式分析可能直接觀察 OTP 結構。", "Invasive analysis may directly observe OTP structures."],
  ["讓 OTP reverse engineering 只得到 scrambled ciphertext。", "Make OTP reverse engineering yield only scrambled ciphertext."],
  ["controller、lifecycle 與 evidence 同時納入交付。", "Deliver the controller, lifecycle and evidence as one outcome."],
  ["產品源頭不是「消滅 physical analysis」，而是讓 physical analysis 不再直接等於 secret disclosure。", "The product origin is not to eliminate physical analysis, but to ensure physical analysis no longer directly equals secret disclosure."],
  ["四個 block，", "Four blocks."],
  ["一個安全結果。", "One security outcome."],
  ["客戶買的不是四個各自正確的 primitive，而是從 root、crypto、storage、control 到 lifecycle 都有清楚責任邊界的 subsystem。", "Customers are not buying four individually correct primitives. They are buying a subsystem with clear accountability from root and crypto to storage, control and lifecycle."],
  ["金鑰只在需要工作的時候存在。", "The key exists only for the work it must perform."],
  ["不是「把 key 藏得更好」，而是把存在時間縮短成受控窗口。", "The objective is not to hide the key better, but to reduce its residency to a controlled window."],
  ["公平比較，", "Compare fairly"],
  ["才能凸顯真正差異。", "to expose the real difference."],
  ["成熟度本身，", "Maturity itself"],
  ["就是安全功能。", "is a security feature."],
  ["攻擊面被發現、修補、認證與長期量產驗證的累積，會直接降低 unknown unknowns。", "The accumulated discovery, remediation, certification and field validation of attack surfaces directly reduces unknown unknowns."],
  ["技術價值，最終必須落在要保護的資產。", "Technical value must ultimately protect a recognizable asset."],
  ["相同的 root-key lifecycle，因應不同市場中最昂貴、最敏感、最難替換的資料。", "The same root-key lifecycle protects the most expensive, sensitive and difficult-to-replace data across markets."],
  ["保護模型價值與平台完整性。", "Protect model value and platform integrity."],
  ["把安全資料綁定到正確裝置。", "Bind security data to the intended device."],
  ["降低靜態金鑰擷取目標。", "Reduce static key-extraction targets."],
  ["大規模建立 device-unique trust。", "Scale device-unique trust."],
  ["客戶購買的是一個", "Customers buy"],
  ["有人負責的安全結果。", "one accountable security outcome."],
  ["從技術名詞，走到可以做決策。", "Move from technical vocabulary to informed decisions."],
  ["從 sense mode 到商業壁壘：", "From sense mode to the commercial moat:"],
  ["真正差異是可量產的 complementary storage。", "the real difference is economical complementary storage."],
  ["比較 6T SRAM、Synopsys 1T OTP 與傳統 2-device antifuse，串起 bit-cell economics、差動讀取、光熱側信道與 Secure Storage 系統防線。", "Compare 6T SRAM, Synopsys 1T OTP and conventional two-device antifuse across bit-cell economics, differential read, optical/thermal side channels and the Secure Storage system defense."],
  ["開啟論文級探討", "Open the research paper"],
  ["查看 Evidence Ledger", "View the Evidence Ledger"],
  ["知道什麼，也清楚標示什麼還不知道。", "State what is known—and clearly mark what is not."],
  ["永久保存資料。", "Protect permanent data."],
  ["根金鑰不永久留存。", "Keep the root key ephemeral."],
  ["安全不只取決於資料能保存多久。", "Security is not defined only by data retention."],
  ["更取決於攻擊發生時，晶片裡還留下什麼。", "It also depends on what remains on silicon when an attack occurs."],
  ["好的矽智財，必須定義清楚。", "Strong silicon IP starts with a clearly defined boundary."],
  ["整合邊界也必須可以驗證。", "That integration boundary must also be verifiable."],
  ["先關掉電源。", "Start by removing power."],
  ["再看攻擊者能取得什麼。", "Then examine what an attacker can obtain."],
  ["四個功能區塊協同運作。", "Four functional blocks work together."],
  ["共同交付一個安全結果。", "They deliver one security outcome."],
  ["提出技術宣稱。", "Make the technical claim."],
  ["也要提出可以驗證的方法。", "Then define how it can be verified."],
  ["先建立公平的比較基準。", "Begin with a fair comparison baseline."],
  ["再判斷真正的技術差異。", "Then identify the material technical difference."],
  ["信任不只存在於單一功能。", "Trust does not reside in a single function."],
  ["它必須落實在系統邊界之內。", "It must hold across the system boundary."],
  ["成熟度來自長期驗證。", "Maturity is earned through sustained validation."],
  ["驗證結果會轉化成安全能力。", "Validation becomes a security capability."],
  ["客戶購買的不只是功能。", "Customers purchase more than functionality."],
  ["還包括有人負責的安全結果。", "They purchase an accountable security outcome."],
  ["從感測方式看見技術差異。", "Use sensing architecture to expose technical differences."],
  ["從量產能力判斷商業壁壘。", "Use production viability to judge the commercial moat."],
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
      <span class="lesson-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="lesson-copy"><strong>${pick(lesson.title)}</strong><small>${pick(lesson.summary)}</small></span>
      <span class="lesson-status">${lesson.status}</span>
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
    <article class="article-card">
      <svg aria-hidden="true"><use href="#${article.icon}"/></svg>
      <div class="card-meta"><span>${pick(typeLabels[article.type])}</span><span>${article.level}</span></div>
      <h3>${pick(article.title)}</h3>
      <p>${pick(article.summary)}</p>
      <div class="card-bottom">${article.tags.map(tag => `#${tag}`).join(" · ")}</div>
    </article>`).join("");
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
    item.setAttribute("aria-selected", active ? "true" : "false");
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
  document.querySelector("#languageToggle").setAttribute("aria-label", nextLanguage === "zh" ? "Switch to English" : "切換為中文");
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
      item.setAttribute("aria-selected", active ? "true" : "false");
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
});
nav.addEventListener("click", event => {
  if (event.target.matches("a")) closeMenu();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && nav.classList.contains("open")) closeMenu(true);
});
window.matchMedia("(min-width: 1181px)").addEventListener("change", event => {
  if (event.matches) closeMenu();
});

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
