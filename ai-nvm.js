(() => {
  const page = document.querySelector(".ai-nvm-page");
  const list = document.querySelector("#opportunityList");
  if (!page || !list) return;

  const records = [...list.querySelectorAll(".opportunity-record")];
  const viewButtons = [...document.querySelectorAll("[data-opportunity-view]")].filter(button => button.tagName === "BUTTON");
  const filterButtons = [...document.querySelectorAll("button[data-write-filter]")];
  const count = document.querySelector("#opportunityCount");
  const empty = document.querySelector("#opportunityEmpty");
  const navLinks = [...document.querySelectorAll("#primaryNav a[href^='#']")];
  const navSections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  let activeView = page.dataset.opportunityView === "source-grounded" ? "source-grounded" : "all";
  let activeFilter = "all";
  let knowledgeById = new Map();
  page.dataset.knowledgeState = "loading";
  const emptyCopy = {
    zh: empty?.querySelector('[data-lang="zh"]')?.textContent || "",
    en: empty?.querySelector('[data-lang="en"]')?.textContent || ""
  };

  const initialCardLimits = new Map(records.map(record => {
    const limit = record.querySelector(".record-fit > em");
    return [record, {
      zh: limit?.querySelector('[data-lang="zh"]')?.textContent.trim() || "",
      en: limit?.querySelector('[data-lang="en"]')?.textContent.trim() || ""
    }];
  }));

  const splitIds = value => (value || "").trim().split(/\s+/u).filter(Boolean);
  const unique = values => [...new Set(values.filter(Boolean))];
  const localizedField = (record, stem) => record?.[`${stem}${page.dataset.language === "en" ? "En" : "Zh"}`] || "";
  const localized = (en, zh) => page.dataset.language === "en" ? en : zh;

  const evidenceDisplay = record => {
    const labels = {
      DIRECT_REQUIREMENT: localized("DIRECT REQUIREMENT", "直接需求"),
      FIRST_PARTY_CASE: localized("OFFICIAL PRODUCT CASE", "官方產品案例"),
      TECHNICAL_EVIDENCE: localized("TECHNICAL EVIDENCE", "技術證據"),
      VENDOR_CAPABILITY: localized("VENDOR DISCLOSURE", "供應商揭露"),
      INFERRED_OPPORTUNITY: localized("BOUNDED INFERENCE", "有界推論"),
      VALIDATION_NEEDED: localized("VALIDATION GATE", "驗證條件")
    };
    return labels[record?.evidenceClass] || record?.evidenceClass || localized("UNCLASSIFIED", "尚未分類");
  };
  const maturityDisplay = value => ({
    'Vendor-stated': localized('Vendor-stated', '供應商陳述'),
    Specified: localized('Specified', '已有規格'),
    Demonstrated: localized('Demonstrated', '已示範'),
    Hypothesis: localized('Hypothesis', '假設'),
    Open: localized('Open', '尚待確認'),
  })[value] || value;
  const candidateDisplay = value => ({
    'OTP / Fuse': localized('OTP / Fuse', 'OTP／熔絲'),
    'EEPROM / Managed NVM': localized('EEPROM / Managed NVM', 'EEPROM／受管理的 NVM'),
    'MTP / Managed NVM': localized('MTP / Managed NVM', 'MTP／受管理的 NVM'),
    'PUF-derived Root': localized('PUF-derived Root', '由 PUF 衍生的信任根'),
    'External Flash / Host Storage': localized('External Flash / Host Storage', '外接 Flash／主機儲存'),
    'Volatile State': localized('Volatile State', '揮發性狀態'),
    'Embedded Flash': localized('Embedded Flash', '嵌入式 Flash'),
    'Embedded MRAM / RRAM': localized('Embedded MRAM / RRAM', '嵌入式 MRAM／RRAM'),
  })[value] || value;

  function createBoundaryField(label, value, { derived = false, field = "" } = {}) {
    const wrapper = document.createElement("section");
    wrapper.className = "record-boundary-field";
    if (derived) wrapper.dataset.derived = "true";
    if (field) wrapper.dataset.sourceField = field;
    const heading = document.createElement("small");
    heading.textContent = label;
    const copy = document.createElement("p");
    copy.textContent = value;
    wrapper.append(heading, copy);
    return wrapper;
  }

  function createLineageRow(label, value) {
    const row = document.createElement("p");
    const heading = document.createElement("b");
    heading.textContent = label;
    row.append(heading, document.createTextNode(value));
    return row;
  }

  function renderOpportunityBoundaries() {
    if (!knowledgeById.size) return;
    const zh = page.dataset.language !== "en";
    for (const recordElement of records) {
      const sourceIds = splitIds(recordElement.dataset.recordIds || recordElement.dataset.recordId);
      const fitIds = splitIds(recordElement.dataset.fitRecordIds);
      const sourceRecords = sourceIds.map(id => knowledgeById.get(id)).filter(record => record && !record.isInference);
      const fitRecords = fitIds.map(id => knowledgeById.get(id)).filter(Boolean);
      const sourceClaims = unique(sourceRecords.map(record => `${evidenceDisplay(record)} · ${record.sourceOwner} — ${localizedField(record, "claim")}`));
      const sourceCopy = recordElement.querySelector(".record-copy p");

      let sourceLabel = recordElement.querySelector(".record-copy .record-source-label");
      if (!sourceLabel) {
        sourceLabel = document.createElement("small");
        sourceLabel.className = "record-source-label";
        sourceCopy?.before(sourceLabel);
      }
      sourceLabel.textContent = localized("EXECUTIVE SUMMARY", "重點摘要");

      const candidateEvidence = [];
      for (const record of fitRecords) {
        const explicitProvenance = Array.isArray(record.storageCandidateProvenance)
          ? record.storageCandidateProvenance
          : [];
        if (explicitProvenance.length) {
          candidateEvidence.push(...explicitProvenance);
          continue;
        }
        const basis = record.isInference || !sourceIds.includes(record.recordId)
          ? "BOUNDED_IMPLEMENTATION_CANDIDATE"
          : "SOURCE_DEFINED_FUNCTION";
        for (const candidate of record.storageCandidate || []) candidateEvidence.push({ candidate, basis });
      }
      const candidateEvidenceByKey = new Map(candidateEvidence
        .filter(item => item.candidate && item.candidate !== "Not Specified")
        .map(item => [`${item.candidate}\u0000${item.basis}`, item]));
      const candidates = [...candidateEvidenceByKey.values()];
      const inferredFit = candidates.some(item => item.basis === "BOUNDED_IMPLEMENTATION_CANDIDATE");
      const candidateText = candidates.length
        ? unique(candidates.map(item => candidateDisplay(item.candidate))).join(" · ")
        : (zh ? "來源未揭露 NVM 技術" : "NVM technology is not source-disclosed");
      const consequence = unique(fitRecords.map(record => localizedField(record, "applicability"))).join(" ") || (zh ? "尚未建立有界推論" : "No bounded inference has been established");
      const question = unique(fitRecords.map(record => localizedField(record, "openQuestion")))[0]
        || unique(sourceRecords.map(record => localizedField(record, "openQuestion")))[0]
        || (zh ? "目標實作仍需確認" : "Target implementation remains to be confirmed");
      const sourceLimitations = unique([...sourceRecords, ...fitRecords].map(record => localizedField(record, "limitation")));
      const conciseLimit = initialCardLimits.get(recordElement)?.[zh ? "zh" : "en"] || sourceLimitations[0] || question;
      const evidenceClasses = unique(sourceRecords.map(evidenceDisplay));
      const sourceOwners = unique(sourceRecords.map(record => record.sourceOwner));
      const maturities = unique(sourceRecords.map(record => maturityDisplay(record.assuranceMaturity)));
      const evidenceText = sourceOwners.length <= 2
        ? [...evidenceClasses, ...sourceOwners, ...maturities].join(" · ")
        : `${sourceRecords.length} ${localized('GOVERNED SOURCES', '筆受治理的來源')} · ${evidenceClasses.join(" + ")} · ${maturities.join(" + ")}`;

      const boundary = document.createElement("div");
      boundary.className = "record-fit record-decision-grid";
      boundary.dataset.copyRevision = recordElement.dataset.copyRevision;
      boundary.dataset.povContractId = page.dataset.povContractId;
      boundary.append(
        createBoundaryField(localized("EVIDENCE / MATURITY", "證據／成熟度"), evidenceText || (zh ? "來源分類待確認" : "Evidence classification pending"), { field: "evidenceClass assuranceMaturity sourceOwner" }),
        createBoundaryField(localized("CANDIDATE NVM FIT", "候選 NVM 適配"), candidateText, { derived: inferredFit, field: "storageCandidateProvenance" }),
        createBoundaryField(localized("VALIDATION GATE", "驗證條件"), question, { field: "openQuestion" }),
        createBoundaryField(localized("LIMIT / BOUNDARY", "限制／界線"), conciseLimit, { field: "limitation" })
      );
      const lineage = document.createElement("details");
      lineage.className = "record-lineage";
      const lineageSummary = document.createElement("summary");
      lineageSummary.textContent = localized("RECORD LINEAGE / WHY IT MATTERS", "紀錄來源與意義");
      const lineageDetail = document.createElement("div");
      lineageDetail.className = "record-lineage-detail";
      const sourceDetail = createLineageRow(localized("SOURCE ESTABLISHES", "來源已建立的事實"), sourceClaims.join(" ") || (zh ? "沒有額外的來源支持主張" : "No additional source-grounded claim"));
      const consequenceDetail = createLineageRow(localized("BOUNDED CONSEQUENCE", "有界推論結果"), consequence);
      const idDetail = createLineageRow(localized("RECORD IDS", "紀錄識別碼"), `${sourceIds.join(" + ")} · ${fitIds.join(" + ")}`);
      lineageDetail.append(sourceDetail, consequenceDetail, idDetail);
      lineage.append(lineageSummary, lineageDetail);
      boundary.append(lineage);
      recordElement.querySelector(".record-fit")?.replaceWith(boundary);
    }
  }

  async function loadKnowledge() {
    try {
      const response = await fetch("data/ai-nvm-opportunities-knowledge.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`knowledge HTTP ${response.status}`);
      const knowledge = await response.json();
      if (!Array.isArray(knowledge.records) || !knowledge.records.length) throw new Error("正式知識資料缺少紀錄");
      knowledgeById = new Map(knowledge.records.map(record => [record.recordId, record]));
      renderOpportunityBoundaries();
      page.dataset.knowledgeState = "canonical";
    } catch (error) {
      page.dataset.knowledgeState = "error";
      knowledgeById.clear();
      console.error("Canonical opportunity view could not be loaded", error);
    } finally {
      render();
    }
  }

  function initTabs(buttonSelector, panelSelector, keyName) {
    const buttons = [...document.querySelectorAll(buttonSelector)];
    const panels = [...document.querySelectorAll(panelSelector)];
    if (!buttons.length || !panels.length) return;
    const tablist = buttons[0].parentElement;
    const mobileTabs = window.matchMedia("(max-width: 620px)");
    let activeValue = buttons.find(button => button.classList.contains("active"))?.dataset[keyName] || buttons[0].dataset[keyName];
    const activate = value => {
      activeValue = value;
      buttons.forEach(button => {
        const active = button.dataset[keyName] === value;
        button.classList.toggle("active", active);
        if (mobileTabs.matches) {
          button.setAttribute("aria-selected", String(active));
          button.tabIndex = active ? 0 : -1;
        }
      });
      panels.forEach(panel => {
        const active = panel.dataset[`${keyName.replace("Tab", "")}Panel`] === value;
        panel.classList.toggle("active", active);
        panel.hidden = mobileTabs.matches && !active;
      });
    };
    const syncSemantics = () => {
      if (mobileTabs.matches) {
        tablist.setAttribute("role", "tablist");
        buttons.forEach(button => {
          button.setAttribute("role", "tab");
          button.setAttribute("aria-controls", button.id.replace("tab", "panel"));
        });
        panels.forEach(panel => {
          panel.setAttribute("role", "tabpanel");
          panel.setAttribute("aria-labelledby", panel.id.replace("panel", "tab"));
        });
      } else {
        tablist.removeAttribute("role");
        buttons.forEach(button => {
          button.removeAttribute("role");
          button.removeAttribute("aria-selected");
          button.removeAttribute("aria-controls");
          button.removeAttribute("tabindex");
        });
        panels.forEach(panel => {
          panel.hidden = false;
          panel.removeAttribute("role");
          panel.removeAttribute("aria-labelledby");
        });
      }
      activate(activeValue);
    };
    buttons.forEach((button, index) => {
      button.addEventListener("click", () => activate(button.dataset[keyName]));
      button.addEventListener("keydown", event => {
        let next = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % buttons.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + buttons.length) % buttons.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = buttons.length - 1;
        else return;
        event.preventDefault();
        activate(buttons[next].dataset[keyName]);
        buttons[next].focus();
      });
    });
    mobileTabs.addEventListener?.("change", syncSemantics);
    syncSemantics();
  }

  initTabs("[data-selection-tab]", "[data-selection-panel]", "selectionTab");
  initTabs("[data-assurance-tab]", "[data-assurance-panel]", "assuranceTab");

  function render() {
    const state = page.dataset.knowledgeState;
    const ready = state === "canonical";
    list.setAttribute("aria-busy", String(state === "loading"));
    let visible = 0;
    records.forEach(record => {
      const evidenceMatch = activeView === "all" || record.dataset.evidence === "source-grounded";
      const writeMatch = activeFilter === "all" || record.dataset.write === activeFilter;
      const show = ready && evidenceMatch && writeMatch;
      record.hidden = !show;
      if (show) visible += 1;
    });

    page.dataset.opportunityView = activeView;
    viewButtons.forEach(button => {
      const active = button.dataset.opportunityView === activeView;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    filterButtons.forEach(button => {
      const active = button.dataset.writeFilter === activeFilter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (count) count.textContent = String(visible).padStart(2, "0");
    if (empty) {
      empty.hidden = visible !== 0;
      const message = state === "error" ? {
        zh: "正式知識資料無法載入；為避免混合證據與推論，本區塊已安全關閉。",
        en: "The canonical knowledge package could not be loaded. This section is closed rather than mixing evidence with inference."
      } : state === "loading" ? {
        zh: "正在載入正式知識資料…",
        en: "Loading the canonical knowledge package…"
      } : emptyCopy;
      for (const language of ["zh", "en"]) {
        const copy = empty.querySelector(`[data-lang="${language}"]`);
        if (copy) copy.textContent = message[language];
      }
    }
  }

  function localizeControls() {
    const zh = page.dataset.language !== "en";
    document.querySelector(".view-switch")?.setAttribute("aria-label", zh ? "證據顯示範圍" : "Opportunity evidence view");
    document.querySelector(".write-filters")?.setAttribute("aria-label", zh ? "持久狀態寫入類型" : "Persistent-state write profile");
    document.querySelector(".map-planes")?.setAttribute("aria-label", zh ? "持久狀態契約平面" : "Persistent-state contract planes");
    document.querySelector(".photonics-state-model")?.setAttribute("aria-label", zh ? "光引擎持久基線與揮發控制狀態契約" : "Optical-engine persistent-baseline and volatile-control state contract");
    document.querySelector(".selection-matrix")?.setAttribute("aria-label", zh ? "依狀態更新頻率與斷電保存需求選擇儲存層" : "Storage-layer selection by state cadence and power-off retention");
    document.querySelector(".node-transition")?.setAttribute("aria-label", zh ? "依公開產品與晶圓代工路線圖整理的先進節點嵌入式 NVM 轉換路徑" : "Advanced-node embedded-NVM transition across public products and foundry roadmaps");
    document.querySelector(".read-domain-diagram")?.setAttribute("aria-label", zh ? "TSMC N5 OTP 的核心供電讀取平面與受控寫入電源域分離" : "TSMC N5 OTP core-supply read plane separated from the controlled programming domain");
    document.querySelector(".sharepoint-extension")?.setAttribute("aria-label", zh ? "公司 SharePoint 內部產品契約補充區" : "Internal product-contract completion area for SharePoint");
    document.querySelector(".abstraction-system")?.setAttribute("aria-label", zh ? "受保護狀態轉移與四個保證平面" : "Protected state transition with four assurance planes");
    document.querySelector(".selection-tabs")?.setAttribute("aria-label", zh ? "NVM 選型層級" : "NVM selection layers");
    document.querySelector(".assurance-tabs")?.setAttribute("aria-label", zh ? "Secure Storage 保證平面" : "Secure Storage assurance planes");
  }

  function setActiveNav(sectionId) {
    navLinks.forEach(link => {
      const active = link.getAttribute("href") === `#${sectionId}`;
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  if (navSections.length) {
    let navFrame = 0;
    const updateActiveNav = () => {
      navFrame = 0;
      const marker = window.scrollY + Math.min(window.innerHeight * .32, 320);
      let current = navSections[0];
      navSections.forEach(section => {
        if (section.offsetTop <= marker) current = section;
      });
      setActiveNav(current.id);
    };
    const requestNavUpdate = () => {
      if (!navFrame) navFrame = requestAnimationFrame(updateActiveNav);
    };
    navLinks.forEach(link => link.addEventListener("click", () => setActiveNav(link.hash.slice(1))));
    window.addEventListener("scroll", requestNavUpdate, { passive: true });
    window.addEventListener("resize", requestNavUpdate);
    setActiveNav(location.hash.slice(1) || navSections[0].id);
    requestNavUpdate();
  }

  viewButtons.forEach(button => button.addEventListener("click", () => {
    activeView = button.dataset.opportunityView === "source-grounded" ? "source-grounded" : "all";
    render();
  }));
  filterButtons.forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.writeFilter || "all";
    render();
  }));

  new MutationObserver(mutations => {
    if (mutations.some(mutation => mutation.attributeName === "data-language")) {
      localizeControls();
      renderOpportunityBoundaries();
      render();
    }
  }).observe(page, { attributes: true });

  localizeControls();
  render();
  loadKnowledge();
})();
