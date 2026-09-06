// site-language.js · Top-Level Global Single Source of Truth for Language
// Default Language: English ("en")
// Single Source of Truth Key: "nvm-hub-language" (with legacy key backward compatibility)

(function() {
  const STORAGE_KEY = "nvm-hub-language";
  const LEGACY_KEY_1 = "nvm-language";
  const LEGACY_KEY_2 = "hub-lang";

  function resolveSavedLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || 
                    localStorage.getItem(LEGACY_KEY_1) || 
                    localStorage.getItem(LEGACY_KEY_2);
      return (saved === "zh") ? "zh" : "en";
    } catch (e) {
      return "en";
    }
  }

  const initialLang = resolveSavedLanguage();

  document.documentElement.lang = (initialLang === "zh") ? "zh-Hant" : "en";
  document.documentElement.dataset.language = initialLang;

  window.HubLanguage = {
    STORAGE_KEY: STORAGE_KEY,
    get: function() {
      return document.documentElement.dataset.language || "en";
    },
    set: function(lang, persist) {
      if (persist === undefined) persist = true;
      const target = (lang === "zh") ? "zh" : "en";
      
      document.documentElement.lang = (target === "zh") ? "zh-Hant" : "en";
      document.documentElement.dataset.language = target;
      if (document.body) {
        document.body.dataset.language = target;
      }

      if (persist) {
        try {
          localStorage.setItem(STORAGE_KEY, target);
          localStorage.setItem(LEGACY_KEY_1, target);
          localStorage.setItem(LEGACY_KEY_2, target);
        } catch (e) {}
      }

      document.querySelectorAll(".language-toggle, #languageToggle").forEach(btn => {
        btn.setAttribute("aria-label", target === "zh" ? "Switch to English" : "切換至繁體中文");
        const zhOpt = btn.querySelector('[data-lang-option="zh"]');
        const enOpt = btn.querySelector('[data-lang-option="en"]');
        if (zhOpt && enOpt) {
          zhOpt.style.color = (target === "zh") ? "#c4a574" : "#8ea9b3";
          enOpt.style.color = (target === "en") ? "#c4a574" : "#8ea9b3";
        }
      });

      window.dispatchEvent(new CustomEvent("hub:language-change", {
        detail: { language: target }
      }));
    },
    toggle: function() {
      const next = (this.get() === "zh") ? "en" : "zh";
      this.set(next, true);
      return next;
    }
  };

  function initDOM() {
    if (document.body) {
      document.body.dataset.language = window.HubLanguage.get();
    }
    document.querySelectorAll(".language-toggle, #languageToggle").forEach(btn => {
      if (!btn._hubLangBound) {
        btn._hubLangBound = true;
        btn.addEventListener("click", function(e) {
          e.preventDefault();
          window.HubLanguage.toggle();
        });
      }
    });
    window.HubLanguage.set(window.HubLanguage.get(), false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDOM);
  } else {
    initDOM();
  }
})();

(function loadBrandSystem(){
  if (document.querySelector("link[data-brand-system]")) return;
  var l=document.createElement("link");
  l.rel="stylesheet";
  l.href="brand-system.css?v=20260906-b1";
  l.setAttribute("data-brand-system","true");
  document.head.appendChild(l);
})();
