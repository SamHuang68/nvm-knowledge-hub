// ==========================================================================
// 2026 NVM KNOWLEDGE HUB MONOREPO · PRODUCTION HUB ENGINE
// Architecture Forum · Paginated Deck Stage · Silicon State Engine · Keyboard Nav
// ==========================================================================

// 1. TOP-LEVEL LANGUAGE GOVERNANCE (SINGLE SOURCE OF TRUTH: site-language.js)
function syncHubLanguage() {
  const lang = window.HubLanguage ? window.HubLanguage.get() : "en";
  document.documentElement.dataset.language = lang;
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  if (document.body) {
    document.body.dataset.language = lang;
  }
}
window.addEventListener("hub:language-change", syncHubLanguage);
document.addEventListener("DOMContentLoaded", syncHubLanguage);


// 2. PAGINATED SLIDE STAGE & TAB STRIP (5 CORE KNOWLEDGE DOMAINS)
let currentSlide = 1;
const TOTAL_SLIDES = 5;

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
}

// Module Tabs Click
document.querySelectorAll(".module-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const modId = parseInt(btn.dataset.module, 10);
    switchSlide(modId);
  });
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
});

// Slide 04: Sub-Application Focus Tabs (Array Repair / Analog Trim / Automotive RAS)
document.addEventListener("click", (e) => {
  const appBtn = e.target.closest(".spec-app-btn");
  if (!appBtn) return;
  const appType = appBtn.dataset.app;
  document.querySelectorAll(".spec-app-btn").forEach(b => b.classList.toggle("is-active", b === appBtn));
  
  const targetId = (appType === "repair") ? "paneRepair" : (appType === "trim") ? "paneTrim" : "paneAuto";
  document.querySelectorAll(".spec-app-pane").forEach(p => {
    p.classList.toggle("is-active", p.id === targetId);
  });
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

// 4. ARCHITECT KEYBOARD NAVIGATION (← / →, 1-5, ESC)
document.addEventListener("keydown", (e) => {
  // Ignore when typing in input/textarea
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;

  if (e.key === "ArrowLeft" || e.key === "PageUp") {
    e.preventDefault();
    switchSlide(currentSlide === 1 ? TOTAL_SLIDES : currentSlide - 1);
  } else if (e.key === "ArrowRight" || e.key === "PageDown") {
    e.preventDefault();
    switchSlide(currentSlide === TOTAL_SLIDES ? 1 : currentSlide + 1);
  } else if (e.key >= "1" && e.key <= "5") {
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
  const currentLang = window.HubLanguage ? window.HubLanguage.get() : "en";
  alert(currentLang === "zh" 
    ? "架構師快捷鍵導覽：\n• 按鍵盤數字鍵 [1 - 5] 可直接跳轉至 5 大核心知識領域\n• 按方向鍵 [←] / [→] 可向左/向右翻頁"
    : "Architect Keyboard Navigation:\n• Press numeric keys [1 - 5] to directly jump to any of the 5 core knowledge domains\n• Press [←] / [→] arrow keys to navigate slides");
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
syncHubLanguage();
