// site-language.js · Top-Level Global Single Source of Truth for Language
// Default Language: English ("en")

(function() {
  const STORAGE_KEY = "nvm-hub-language";
  const LEGACY_KEY_1 = "nvm-language";
  const LEGACY_KEY_2 = "hub-lang";
  function resolveSavedLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY_1) || localStorage.getItem(LEGACY_KEY_2);
      return (saved === "zh") ? "zh" : "en";
    } catch (e) { return "en"; }
  }
  const initialLang = resolveSavedLanguage();
  document.documentElement.lang = (initialLang === "zh") ? "zh-Hant" : "en";
  document.documentElement.dataset.language = initialLang;
  window.HubLanguage = {
    STORAGE_KEY: STORAGE_KEY,
    get: function() { return document.documentElement.dataset.language || "en"; },
    set: function(lang, persist) {
      if (persist === undefined) persist = true;
      const target = (lang === "zh") ? "zh" : "en";
      document.documentElement.lang = (target === "zh") ? "zh-Hant" : "en";
      document.documentElement.dataset.language = target;
      if (document.body) document.body.dataset.language = target;
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
      window.dispatchEvent(new CustomEvent("hub:language-change", { detail: { language: target } }));
    },
    toggle: function() {
      const next = (this.get() === "zh") ? "en" : "zh";
      this.set(next, true);
      return next;
    }
  };
  function initDOM() {
    if (document.body) document.body.dataset.language = window.HubLanguage.get();
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
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initDOM);
  else initDOM();
})();

(function loadFlagshipSurface(){
  if (document.querySelector("link[data-flagship-surface]")) return;
  var l=document.createElement("link");
  l.rel="stylesheet";
  l.href="flagship-surface.css?v=20260906-s2";
  l.setAttribute("data-flagship-surface","true");
  document.head.appendChild(l);
})();

(function flagshipPointerGlow(){
  function bind(){
    document.querySelectorAll(".km-card,.claim-rung,.rule-card").forEach(function(el){
      if (el._fsGlow) return;
      el._fsGlow = true;
      el.addEventListener("pointermove", function(e){
        var r = el.getBoundingClientRect();
        el.style.setProperty("--fs-mx", ((e.clientX - r.left) / r.width * 100).toFixed(2) + "%");
        el.style.setProperty("--fs-my", ((e.clientY - r.top) / r.height * 100).toFixed(2) + "%");
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();

(function loadFlagshipShader(){
  if (document.querySelector("script[data-flagship-shader]")) return;
  var s=document.createElement("script");
  s.src="flagship-shader.js?v=20260906-s3";
  s.defer=true;
  s.setAttribute("data-flagship-shader","true");
  document.head.appendChild(s);
})();

(function loadPhysicsFlagship(){
  if (document.querySelector("link[data-physics-flagship]")) return;
  var l=document.createElement("link");
  l.rel="stylesheet";
  l.href="memory-physics-flagship.css?v=20260906-p2";
  l.setAttribute("data-physics-flagship","true");
  document.head.appendChild(l);
})();
