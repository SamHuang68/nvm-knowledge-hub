const hubLanguage = localStorage.getItem("nvm-language") === "en" ? "en" : "zh";
const hubBody = document.body;
const hubMenuButton = document.querySelector("#menuToggle");
const hubNav = document.querySelector("#primaryNav");
const hubNavLinks = [...document.querySelectorAll("#primaryNav a[href^='#']")];

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

function setHubCurrentSection(id) {
  for (const link of hubNavLinks) {
    const current = link.getAttribute("href") === `#${id}`;
    if (current) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
}

const hubSections = hubNavLinks
  .map(link => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
if (hubSections.length) {
  const hubSectionObserver = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setHubCurrentSection(visible.target.id);
  }, { rootMargin: "-22% 0px -58%", threshold: [0.08, 0.3, 0.6] });
  hubSections.forEach(section => hubSectionObserver.observe(section));
  const initialSection = location.hash.slice(1);
  setHubCurrentSection(hubSections.some(section => section.id === initialSection) ? initialSection : hubSections[0].id);
}

const legacySecureStorageHashes = new Set(["#thesis", "#architecture", "#assurance", "#compare", "#evidence", "#learn", "#research-topics", "#power-lab", "#lifecycle"]);
if (legacySecureStorageHashes.has(location.hash)) location.replace(`secure-storage.html${location.hash}`);

setHubLanguage(hubLanguage, false);
syncHubMenuToLayout();
updateHubScroll();
