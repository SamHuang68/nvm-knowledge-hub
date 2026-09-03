import { renderPhase1KB } from './modules/phase1_kb_view.js';
import { renderPhase2Reader } from './modules/phase2_reader.js';
import { renderPhase3Templates } from './modules/phase3_template_view.js';
import { renderPhase4Metadata } from './modules/phase4_meta_view.js';
import { renderMatrix } from './modules/matrix.js';

const views = ['overview', 'whitepaper', 'selector', 'taxonomy', 'templates'];
const legacyViewMap = { phase1: 'overview', phase2: 'whitepaper', matrix: 'selector', phase4: 'taxonomy', phase3: 'templates' };

function requestedView() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('view') || 'overview';
  return views.includes(raw) ? raw : (legacyViewMap[raw] || 'overview');
}

function setView(view, { updateHistory = true, focus = false } = {}) {
  const next = views.includes(view) ? view : 'overview';
  document.querySelectorAll('.view-tab').forEach((tab) => {
    const active = tab.dataset.view === next;
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
    tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus();
  });
  document.querySelectorAll('.studio-panel').forEach((panel) => {
    panel.hidden = panel.id !== `panel-${next}`;
  });

  if (updateHistory) {
    const url = new URL(window.location.href);
    if (next === 'overview') url.searchParams.delete('view');
    else url.searchParams.set('view', next);
    if (next !== 'whitepaper' && url.hash.startsWith('#chap-')) url.hash = '';
    window.history.pushState({ view: next }, '', `${url.pathname}${url.search}${url.hash}`);
  }
}

function routeFromLocation({ scrollChapter = false } = {}) {
  const url = new URL(window.location.href);
  const chapterRoute = url.hash.startsWith('#chap-');
  const hasExplicitView = url.searchParams.has('view');
  let next = requestedView();

  if (chapterRoute && !hasExplicitView) next = 'whitepaper';
  if (chapterRoute && next !== 'whitepaper') {
    url.hash = '';
    window.history.replaceState({ view: next }, '', `${url.pathname}${url.search}`);
  }

  setView(next, { updateHistory: false });
  if (chapterRoute && next === 'whitepaper' && scrollChapter) {
    requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView({ block: 'start' }));
  }
}

function initTabs() {
  const tabs = [...document.querySelectorAll('.view-tab')];
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setView(tab.dataset.view));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let target = index;
      if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index - 1 + tabs.length) % tabs.length;
      else target = (index + 1) % tabs.length;
      setView(tabs[target].dataset.view, { focus: true });
    });
  });
  window.addEventListener('popstate', () => routeFromLocation({ scrollChapter: true }));
}

function initMobileNavigation() {
  const button = document.querySelector('#menuToggle');
  const nav = document.querySelector('#globalNav');
  const close = (restoreFocus = false) => {
    nav?.classList.remove('open');
    button?.setAttribute('aria-expanded', 'false');
    button?.setAttribute('aria-label', 'Open navigation');
    if (restoreFocus) button?.focus();
  };

  button?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) nav.querySelector('a')?.focus();
  });
  nav?.addEventListener('click', (event) => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && nav?.classList.contains('open')) close(true); });
  window.addEventListener('resize', () => { if (window.matchMedia('(min-width: 1081px)').matches) close(); }, { passive: true });
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2400);
}

function initCopyActions() {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-outline]');
    if (!button) return;
    const text = button.dataset.copyOutline || '';
    try {
      await navigator.clipboard.writeText(text);
      showToast('Template outline copied');
    } catch {
      const fallback = document.createElement('textarea');
      fallback.value = text;
      fallback.setAttribute('readonly', '');
      fallback.className = 'clipboard-fallback';
      document.body.appendChild(fallback);
      fallback.select();
      document.execCommand('copy');
      fallback.remove();
      showToast('Template outline copied');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderPhase1KB(document.querySelector('#panel-overview'));
  renderPhase2Reader(document.querySelector('#panel-whitepaper'));
  renderMatrix(document.querySelector('#panel-selector'));
  renderPhase4Metadata(document.querySelector('#panel-taxonomy'));
  renderPhase3Templates(document.querySelector('#panel-templates'));
  initTabs();
  initMobileNavigation();
  initCopyActions();
  routeFromLocation({ scrollChapter: true });
});

function initLanguageToggle() {
  const btn = document.getElementById("languageToggle");
  let currentLang = localStorage.getItem("nvm-language") || "en";

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem("nvm-language", lang);
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    if (btn) {
      btn.setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切換至繁體中文");
    }
  }

  btn?.addEventListener("click", () => {
    applyLang(currentLang === "zh" ? "en" : "zh");
  });

  applyLang(currentLang);
}

document.addEventListener('DOMContentLoaded', initLanguageToggle);
