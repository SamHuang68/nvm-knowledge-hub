// ==========================================================================
// 2026 NVM KNOWLEDGE HUB MONOREPO · PRODUCTION HUB ENGINE
// Architecture Forum · Paginated Deck Stage · Silicon State Engine · Keyboard Nav
// ==========================================================================

// 1. TOP-LEVEL LANGUAGE GOVERNANCE
function syncHubLanguage() {
  const lang = window.HubLanguage ? window.HubLanguage.get() : (localStorage.getItem("nvm-language") || "en");
  document.body.dataset.language = lang;
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  renderSubmodules(currentSlide);
}
window.addEventListener("hub:language-change", syncHubLanguage);
document.addEventListener("DOMContentLoaded", syncHubLanguage);

function setHubLanguage(language, persist = true) {
  const next = language === "en" ? "en" : "zh";
  document.body.dataset.language = next;
  document.documentElement.lang = next === "zh" ? "zh-Hant" : "en";
  document.querySelector("#languageToggle")?.setAttribute("aria-label", next === "zh" ? "Switch to English" : "Switch to Traditional Chinese");
  if (persist) {
    localStorage.setItem("nvm-language", next);
    window.HubLanguage?.set(next);
  }
  renderSubmodules(currentSlide);
}

document.querySelector("#languageToggle")?.addEventListener("click", () => {
  const current = document.body.dataset.language || "en";
  setHubLanguage(current === "zh" ? "en" : "zh");
});

// 2. PAGINATED SLIDE STAGE & TAB STRIP
let currentSlide = 1;
const TOTAL_SLIDES = 7;

function renderSubmodules(slideId) {
  const subContainer = document.getElementById("submoduleList");
  if (!subContainer || !window.HUB_SUBMODULES) return;
  
  const currentLang = document.body.dataset.language || "en";
  const subList = window.HUB_SUBMODULES[slideId] || [];
  
  let html = `<span class="submodule-prefix">${currentLang === "zh" ? "次級模組：" : "SUB-MODULES:"}</span>`;
  subList.forEach((sub, idx) => {
    const label = currentLang === "zh" ? sub.zh : sub.en;
    html += `<button class="submodule-pill ${idx === 0 ? 'is-active' : ''}" data-sub-id="${sub.id}" type="button">${label}</button>`;
  });
  subContainer.innerHTML = html;
}

function switchSlide(targetId) {
  if (targetId < 1 || targetId > TOTAL_SLIDES) return;
  currentSlide = targetId;

  // Update tabs
  document.querySelectorAll(".module-tab-btn").forEach(btn => {
    const modId = parseInt(btn.dataset.module, 10);
    btn.classList.toggle("is-active", modId === currentSlide);
  });

  // Update slides
  document.querySelectorAll(".deck-slide").forEach(slide => {
    const sId = parseInt(slide.dataset.slideId, 10);
    slide.classList.toggle("is-active", sId === currentSlide);
  });

  // Update indicators in all slide controllers
  document.querySelectorAll(".deck-indicator-bar").forEach(bar => {
    const gotoId = parseInt(bar.dataset.goto, 10);
    bar.classList.toggle("is-active", gotoId === currentSlide);
  });

  // Render submodules
  renderSubmodules(currentSlide);
}

// Module Tabs Click
document.querySelectorAll(".module-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const modId = parseInt(btn.dataset.module, 10);
    switchSlide(modId);
  });
});

// Stepper Buttons inside Submodule Ribbon
document.getElementById("subPrevBtn")?.addEventListener("click", () => {
  switchSlide(currentSlide === 1 ? TOTAL_SLIDES : currentSlide - 1);
});
document.getElementById("subNextBtn")?.addEventListener("click", () => {
  switchSlide(currentSlide === TOTAL_SLIDES ? 1 : currentSlide + 1);
});

// Deck Controller Ribbon Buttons
document.addEventListener("click", (e) => {
  const ctrlBtn = e.target.closest(".deck-ctrl-btn");
  if (ctrlBtn && ctrlBtn.dataset.target) {
    switchSlide(parseInt(ctrlBtn.dataset.target, 10));
    return;
  }
  const indBtn = e.target.closest(".deck-indicator-bar");
  if (indBtn && indBtn.dataset.goto) {
    switchSlide(parseInt(indBtn.dataset.goto, 10));
    return;
  }
  const subPill = e.target.closest(".submodule-pill");
  if (subPill) {
    document.querySelectorAll(".submodule-pill").forEach(p => p.classList.remove("is-active"));
    subPill.classList.add("is-active");
  }
});

// 3. SILICON STATE ENGINE INTERACTIVE SIMULATORS
document.addEventListener("click", (e) => {
  const triggerBtn = e.target.closest(".engine-trigger-btn");
  if (!triggerBtn) return;

  const slideId = triggerBtn.dataset.slide;
  const slideElem = document.getElementById(`deckSlide${slideId}`);
  if (!slideElem) return;

  const statePill = document.getElementById(`engineStatePill${slideId}`);
  const isAlt = triggerBtn.dataset.activeState === "alt";

  // Toggle rows
  slideElem.querySelectorAll(".engine-row-val").forEach(row => {
    const initVal = row.dataset.init;
    const altVal = row.dataset.alt;
    const classInit = row.dataset.classInit;
    const classAlt = row.dataset.classAlt;

    if (!isAlt) {
      row.textContent = altVal;
      row.className = `engine-row-val ${classAlt}`;
    } else {
      row.textContent = initVal;
      row.className = `engine-row-val ${classInit}`;
    }
  });

  // Toggle state pill
  if (statePill) {
    const pillInit = statePill.dataset.init;
    const pillAlt = statePill.dataset.alt;
    statePill.textContent = isAlt ? pillInit : pillAlt;
    statePill.style.borderColor = isAlt ? "#334155" : "#0891b2";
    statePill.style.color = isAlt ? "#38bdf8" : "#22d3ee";
  }

  // Toggle button state attribute
  triggerBtn.dataset.activeState = isAlt ? "init" : "alt";
});

// 4. ARCHITECT KEYBOARD NAVIGATION (← / →, 1-7, ESC)
document.addEventListener("keydown", (e) => {
  // Ignore when typing in input/textarea
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;

  if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    switchSlide(currentSlide === 1 ? TOTAL_SLIDES : currentSlide - 1);
  } else if (e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    switchSlide(currentSlide === TOTAL_SLIDES ? 1 : currentSlide + 1);
  } else if (e.key >= "1" && e.key <= "7") {
    switchSlide(parseInt(e.key, 10));
  } else if (e.key === "Escape") {
    const drawer = document.getElementById("specDrawerContent");
    const drawerBtn = document.getElementById("specDrawerBtn");
    if (drawer && drawer.classList.contains("is-open")) {
      drawer.classList.remove("is-open");
      drawerBtn?.setAttribute("aria-expanded", "false");
    }
  }
});

// Keyboard hint button click shows notification / jumps focus
document.getElementById("kbdHintBtn")?.addEventListener("click", () => {
  const currentLang = document.body.dataset.language || "en";
  alert(currentLang === "zh" 
    ? "架構師快捷鍵導覽：\n• 按鍵盤數字鍵 [1 - 7] 可直接跳轉至對應核心模組\n• 按方向鍵 [←] / [→] 可向左/向右翻頁"
    : "Architect Keyboard Navigation:\n• Press numeric keys [1 - 7] to directly jump to any core module\n• Press [←] / [→] arrow keys to navigate slides");
});

// 5. SPEC DRAWER / EVIDENCE MATRIX ACCORDION
document.getElementById("specDrawerBtn")?.addEventListener("click", () => {
  const drawer = document.getElementById("specDrawerContent");
  const btn = document.getElementById("specDrawerBtn");
  if (!drawer || !btn) return;
  const isOpen = drawer.classList.toggle("is-open");
  btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

// Initial boot
renderSubmodules(1);
syncHubLanguage();
