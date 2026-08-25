const hubLanguage = localStorage.getItem("nvm-language") === "en" ? "en" : "zh";
const hubBody = document.body;
const hubMenuButton = document.querySelector("#menuToggle");
const hubNav = document.querySelector("#primaryNav");

function setHubLanguage(language, persist = true) {
  const next = language === "en" ? "en" : "zh";
  hubBody.dataset.language = next;
  document.documentElement.lang = next === "zh" ? "zh-Hant" : "en";
  document.querySelector("#languageToggle")?.setAttribute("aria-label", next === "zh" ? "Switch to English" : "Switch to Traditional Chinese");
  hubMenuButton?.setAttribute("aria-label", hubNav?.classList.contains("open") ? (next === "zh" ? "關閉選單" : "Close menu") : (next === "zh" ? "開啟選單" : "Open menu"));
  document.querySelector(".brand")?.setAttribute("aria-label", next === "zh" ? "NVM Knowledge Hub 首頁" : "NVM Knowledge Hub home");
  if (persist) localStorage.setItem("nvm-language", next);
}

function closeHubMenu(restoreFocus = false) {
  hubNav?.classList.remove("open");
  hubMenuButton?.setAttribute("aria-expanded", "false");
  setHubLanguage(hubBody.dataset.language, false);
  if (restoreFocus) hubMenuButton?.focus();
}

hubMenuButton?.addEventListener("click", () => {
  const open = hubNav.classList.toggle("open");
  hubMenuButton.setAttribute("aria-expanded", open ? "true" : "false");
  setHubLanguage(hubBody.dataset.language, false);
  if (open) hubNav.querySelector("a")?.focus();
});
hubNav?.addEventListener("click", event => { if (event.target.closest("a")) closeHubMenu(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && hubNav?.classList.contains("open")) closeHubMenu(true); });
document.querySelector("#languageToggle")?.addEventListener("click", () => setHubLanguage(hubBody.dataset.language === "zh" ? "en" : "zh"));

function syncHubMenuToLayout() {
  if (hubMenuButton && getComputedStyle(hubMenuButton).display === "none") closeHubMenu();
}
window.addEventListener("resize", syncHubMenuToLayout, { passive: true });

function updateHubScroll() {
  const doc = document.documentElement;
  const distance = doc.scrollHeight - doc.clientHeight;
  const progress = document.querySelector("#readingProgress");
  if (progress) progress.style.width = `${distance > 0 ? Math.min(100, doc.scrollTop / distance * 100) : 0}%`;
  document.querySelector(".site-header")?.classList.toggle("scrolled", doc.scrollTop > 28);
}
window.addEventListener("scroll", updateHubScroll, { passive: true });

const legacySecureStorageHashes = new Set(["#thesis", "#architecture", "#assurance", "#compare", "#evidence", "#learn", "#research-topics", "#power-lab", "#lifecycle"]);
if (legacySecureStorageHashes.has(location.hash)) location.replace(`secure-storage.html${location.hash}`);

setHubLanguage(hubLanguage, false);
syncHubMenuToLayout();
updateHubScroll();
