let researchLanguage = localStorage.getItem("nvm-language") === "en" ? "en" : "zh";
let activeEvidenceType = "all";

const researchPhaseCopy = {
  off: {
    zh: ["01", "斷電：差異先出現在『狀態是否仍可被表達』。", "SRAM latch 沒有供電，不再維持 0/1 邏輯狀態；但製程 mismatch 仍存在。已 enrollment 的 antifuse／NeoPUF 導通路徑則是永久實體狀態。"],
    en: ["01", "Power-off: the first divide is whether a state remains expressible.", "An unpowered SRAM latch no longer maintains a logical 0/1, although process mismatch remains. An enrolled antifuse or NeoPUF conduction path is a persistent physical state."]
  },
  express: {
    zh: ["02", "上電：兩者都把物理差異轉成電訊號。", "SRAM PUF 在 power-up 競爭中表達 startup preference；persistent OTP／OTP-PUF 則以電阻、導通或閾值差異回應。這一層還不是安全結論。"],
    en: ["02", "Power-up: both translate physical variation into an electrical signal.", "An SRAM PUF expresses startup preference through a power-up race. Persistent OTP or OTP-PUF responds through resistance, conduction or threshold differences. This layer alone is not a security conclusion."]
  },
  read: {
    zh: ["03", "讀取：安全差異先看 representation，再看 sense mode。", "高速 6T SRAM 主流以 BL／BLB 的小擺幅 ΔV 讀取。Antifuse 可做 reference differential 或 twin-cell complementary read；後者能否商品化，取決於 bit-cell economics，而非電路圖上是否有 differential sense amplifier。"],
    en: ["03", "Read: inspect representation before sense mode.", "Mainstream high-speed 6T SRAM reads a small ΔV across BL/BLB. Antifuse may use reference differential or twin-cell complementary read; commercial viability of the latter depends on bit-cell economics, not merely the presence of a differential sense amplifier."]
  }
};

function setResearchLanguage(nextLanguage, persist = true) {
  researchLanguage = nextLanguage === "en" ? "en" : "zh";
  document.body.dataset.language = researchLanguage;
  document.documentElement.lang = researchLanguage === "zh" ? "zh-Hant" : "en";
  const toggle = document.querySelector("#languageToggle");
  if (toggle) toggle.setAttribute("aria-label", researchLanguage === "zh" ? "Switch to English" : "Switch to Traditional Chinese");
  document.querySelector(".brand")?.setAttribute("aria-label", researchLanguage === "zh" ? "NVM Knowledge Hub 首頁" : "NVM Knowledge Hub home");
  const navigationLabel = document.body.classList.contains("ai-nvm-page")
    ? (researchLanguage === "zh" ? "AI 與 NVM 主題導覽" : "AI and NVM topic navigation")
    : document.body.classList.contains("oip-page")
    ? (researchLanguage === "zh" ? "OIP 主題導覽" : "OIP topic navigation")
    : document.body.classList.contains("evidence-page")
      ? (researchLanguage === "zh" ? "證據頁導覽" : "Evidence navigation")
      : (researchLanguage === "zh" ? "研究頁導覽" : "Research navigation");
  document.querySelector(".primary-nav")?.setAttribute("aria-label", navigationLabel);
  document.querySelector("#evidenceFilters")?.setAttribute("aria-label", researchLanguage === "zh" ? "證據來源類型" : "Evidence source type");
  document.querySelector(".state-lab-controls")?.setAttribute("aria-label", researchLanguage === "zh" ? "記憶體狀態階段" : "Memory-state phase");
  document.querySelector(".oip-closure-strip")?.setAttribute("aria-label", researchLanguage === "zh" ? "Lifecycle、helper data 與 accountability 封閉重點" : "Lifecycle, helper-data and accountability closure points");
  document.querySelectorAll("[data-alt-zh][data-alt-en]").forEach(image => image.alt = researchLanguage === "zh" ? image.dataset.altZh : image.dataset.altEn);
  syncResearchMenuState(document.querySelector(".primary-nav")?.classList.contains("open") || false);
  const search = document.querySelector("#evidenceSearch");
  if (search) {
    search.placeholder = researchLanguage === "zh" ? "搜尋作者、技術、攻擊或 DOI…" : "Search author, technology, attack or DOI…";
    search.setAttribute("aria-label", researchLanguage === "zh" ? "搜尋證據" : "Search evidence");
  }
  document.title = document.body.classList.contains("ai-nvm-page")
    ? (researchLanguage === "zh" ? "AI Systems 與 NVM 機會 · NVM Knowledge Hub" : "AI Systems & NVM Opportunities · NVM Knowledge Hub")
    : document.body.classList.contains("oip-page")
    ? "OIP Secure Storage Brief · NVM Knowledge Hub"
    : document.body.classList.contains("evidence-page")
      ? "Evidence Ledger · NVM Knowledge Hub"
      : (researchLanguage === "zh" ? "記憶體物理與安全 · NVM Knowledge Hub" : "Memory Physics & Security · NVM Knowledge Hub");
  const activePhase = document.querySelector(".state-lab-controls button.active");
  if (activePhase) updateResearchPhase(activePhase.dataset.phase);
  renderEvidenceCards();
  if (persist) localStorage.setItem("nvm-language", researchLanguage);
}

function updateResearchPhase(phase) {
  const lab = document.querySelector("#stateLab");
  if (!lab || !researchPhaseCopy[phase]) return;
  lab.dataset.phase = phase;
  document.querySelectorAll(".state-lab-controls button").forEach(button => {
    const active = button.dataset.phase === phase;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
  const [number, title, text] = researchPhaseCopy[phase][researchLanguage];
  document.querySelector("#labNumber").textContent = number;
  document.querySelector("#labTitle").textContent = title;
  document.querySelector("#labText").textContent = text;
  const readings = {
    off: {
      zh: ["無邏輯狀態", "永久導通路徑"],
      en: ["NO LOGIC STATE", "PERSISTENT PATH"]
    },
    express: {
      zh: ["STARTUP RESPONSE", "導通位置"],
      en: ["STARTUP RESPONSE", "PATH LOCATION"]
    },
    read: {
      zh: ["BITLINE ΔV／ΔI", "ICELL 與 IREF"],
      en: ["BITLINE ΔV / ΔI", "ICELL VS IREF"]
    }
  };
  const laneReadings = document.querySelectorAll(".lane-reading strong");
  if (laneReadings.length === 2) {
    laneReadings[0].textContent = readings[phase][researchLanguage][0];
    laneReadings[1].textContent = readings[phase][researchLanguage][1];
  }
}

function renderEvidenceCards() {
  const cards = [...document.querySelectorAll(".source-card")];
  if (!cards.length) return;
  const search = document.querySelector("#evidenceSearch");
  const query = (search?.value || "").trim().toLowerCase();
  let visible = 0;
  cards.forEach(card => {
    const typeMatch = activeEvidenceType === "all" || card.dataset.type === activeEvidenceType;
    const textMatch = card.textContent.toLowerCase().includes(query) || (card.dataset.keywords || "").toLowerCase().includes(query);
    const show = typeMatch && textMatch;
    card.hidden = !show;
    if (show) visible += 1;
  });
  const count = document.querySelector("#evidenceCount");
  if (count) count.textContent = String(visible).padStart(2, "0");
  const empty = document.querySelector("#evidenceEmpty");
  if (empty) empty.hidden = visible !== 0;
}

document.querySelector("#languageToggle")?.addEventListener("click", () => setResearchLanguage(researchLanguage === "zh" ? "en" : "zh"));
document.querySelectorAll(".state-lab-controls button").forEach(button => button.addEventListener("click", () => updateResearchPhase(button.dataset.phase)));
document.querySelector("#evidenceSearch")?.addEventListener("input", renderEvidenceCards);
document.querySelector("#evidenceFilters")?.addEventListener("click", event => {
  const button = event.target.closest("button[data-type]");
  if (!button) return;
  activeEvidenceType = button.dataset.type;
  document.querySelectorAll("#evidenceFilters button").forEach(item => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", active ? "true" : "false");
  });
  renderEvidenceCards();
});

const researchMenuButton = document.querySelector("#menuToggle");
const researchNav = document.querySelector(".primary-nav");
function syncResearchMenuState(open) {
  researchMenuButton?.setAttribute("aria-expanded", open ? "true" : "false");
  researchMenuButton?.setAttribute("aria-label", open ? (researchLanguage === "zh" ? "關閉選單" : "Close menu") : (researchLanguage === "zh" ? "開啟選單" : "Open menu"));
}
function closeResearchMenu(restoreFocus = false) {
  researchNav?.classList.remove("open");
  syncResearchMenuState(false);
  if (restoreFocus) researchMenuButton?.focus();
}
researchMenuButton?.addEventListener("click", () => {
  const open = researchNav.classList.toggle("open");
  syncResearchMenuState(open);
  if (open) researchNav.querySelector("a")?.focus();
});
researchNav?.addEventListener("click", event => {
  if (event.target.closest("a")) closeResearchMenu();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && researchNav?.classList.contains("open")) closeResearchMenu(true);
});
window.matchMedia("(min-width: 1181px)").addEventListener("change", event => {
  if (event.matches) closeResearchMenu();
});
function syncResearchMenuToLayout() {
  if (researchMenuButton && getComputedStyle(researchMenuButton).display === "none") closeResearchMenu();
}
window.addEventListener("resize", syncResearchMenuToLayout, { passive: true });

const researchRevealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      researchRevealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .06, rootMargin: "0px 0px -32px" });
document.querySelectorAll(".reveal").forEach(section => researchRevealObserver.observe(section));

function updateResearchScroll() {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - doc.clientHeight;
  const ratio = scrollable > 0 ? doc.scrollTop / scrollable : 0;
  const bar = document.querySelector("#readingProgress");
  if (bar) bar.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  document.querySelector(".site-header")?.classList.toggle("scrolled", doc.scrollTop > 30);
}
window.addEventListener("scroll", updateResearchScroll, { passive: true });
window.addEventListener("resize", updateResearchScroll);

setResearchLanguage(researchLanguage, false);
updateResearchPhase("off");
updateResearchScroll();
