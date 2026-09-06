// theme.js · NVM Knowledge Hub dual-theme SSOT
// Default: Light Paper. Storage key: nvm-hub-theme. Ignores prefers-color-scheme on first paint.

(function () {
  const STORAGE_KEY = "nvm-hub-theme";

  function resolveSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") return saved;
    } catch (_) {
      /* localStorage unavailable */
    }
    return "light";
  }

  function applyTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    syncToggleState(next);
    return next;
  }

  function syncToggleState(theme) {
    const isDark = theme === "dark";
    document.querySelectorAll(".theme-toggle, #themeToggle").forEach((btn) => {
      btn.setAttribute("aria-pressed", isDark ? "true" : "false");
      const lang = document.documentElement.dataset.language === "zh" ? "zh" : "en";
      btn.setAttribute(
        "aria-label",
        lang === "zh"
          ? isDark ? "切換至淺色主題" : "切換至深色主題"
          : isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark ? "#0b0b0b" : "#f3f7f8");
  }

  applyTheme(resolveSavedTheme());

  window.HubTheme = {
    STORAGE_KEY,
    get() {
      return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    },
    set(theme) {
      const next = applyTheme(theme);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch (_) {
        /* ignore */
      }
      return next;
    },
    toggle() {
      return this.set(this.get() === "dark" ? "light" : "dark");
    },
    syncToggleState,
  };

  function wireToggles() {
    document.querySelectorAll(".theme-toggle, #themeToggle").forEach((btn) => {
      if (btn.dataset.themeBound === "1") return;
      btn.dataset.themeBound = "1";
      btn.addEventListener("click", () => window.HubTheme.toggle());
    });
    syncToggleState(window.HubTheme.get());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireToggles);
  } else {
    wireToggles();
  }
})();
