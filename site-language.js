// site-language.js
(function() {
  const STORAGE_KEY = "nvm-hub-language";
  function resolveSavedLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("nvm-language") || localStorage.getItem("hub-lang");
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
      if (persist) { try { localStorage.setItem(STORAGE_KEY, target); } catch (e) {} }
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
        btn.addEventListener("click", function(e) { e.preventDefault(); window.HubLanguage.toggle(); });
      }
    });
    window.HubLanguage.set(window.HubLanguage.get(), false);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initDOM);
  else initDOM();
})();
(function loadPhysicsContrast(){
  if (!/memory-physics\.html/i.test(location.pathname)) return;
  if (document.querySelector("link[data-physics-contrast]")) return;
  var l=document.createElement("link"); l.rel="stylesheet"; l.href="memory-physics-contrast.css?v=20260907-f1";
  l.setAttribute("data-physics-contrast","true"); document.head.appendChild(l);
})();
(function loadF1CardAlign(){
  if (document.querySelector("script[data-f1-align]")) return;
  var s=document.createElement("script"); s.src="f1-card-align.js?v=20260907-f1"; s.defer=true;
  s.setAttribute("data-f1-align","true"); document.head.appendChild(s);
})();
(function loadSurfaceRadius(){
  if (document.querySelector("link[data-surface-radius]")) return;
  var l=document.createElement("link"); l.rel="stylesheet"; l.href="surface-radius.css?v=20260908-r3";
  l.setAttribute("data-surface-radius","true"); document.head.appendChild(l);
})();
(function loadChapterLens(){
  if (document.querySelector("link[data-chapter-lens]")) return;
  var l=document.createElement("link"); l.rel="stylesheet"; l.href="chapter-lens.css?v=20260908-l4";
  l.setAttribute("data-chapter-lens","true"); document.head.appendChild(l);
})();
(function loadAiNvmTune(){
  if (!/ai-nvm-opportunities\.html/i.test(location.pathname)) return;
  if (document.querySelector("link[data-ai-nvm-tune]")) return;
  var l=document.createElement("link"); l.rel="stylesheet"; l.href="ai-nvm-tune.css?v=20260908-a9";
  l.setAttribute("data-ai-nvm-tune","true"); document.head.appendChild(l);
})();
(function loadAiNvmNode(){
  if (!/ai-nvm-opportunities\.html/i.test(location.pathname)) return;
  if (document.querySelector("link[data-ai-nvm-node]")) return;
  var l=document.createElement("link"); l.rel="stylesheet"; l.href="ai-nvm-node.css?v=20260908-n9";
  l.setAttribute("data-ai-nvm-node","true"); document.head.appendChild(l);
})();
