(function () {
  'use strict';
  const rootURL = new URL('.', document.currentScript.src);
  const STORAGE_KEY = 'nvm-hub-language';
  const html = document.documentElement;
  const requested = new URL(location.href).searchParams.get('lang');
  function savedLanguage() {
    try { return localStorage.getItem(STORAGE_KEY) || localStorage.getItem('nvm-language') || localStorage.getItem('hub-lang'); }
    catch { return null; }
  }
  const initial = requested === 'zh' || requested === 'en' ? requested : savedLanguage() === 'zh' ? 'zh' : 'en';
  if (requested === 'zh' || requested === 'en') { try { localStorage.setItem(STORAGE_KEY, requested); } catch {} }
  function routeToLanguage(language) {
    const file = html.dataset[language === 'zh' ? 'languageZh' : 'languageEn'];
    if (!html.dataset.contentLanguage || !file || html.dataset.contentLanguage === language) return false;
    const destination = new URL(file, location.href);
    destination.search = location.search;
    destination.searchParams.set('lang', language);
    destination.hash = location.hash;
    location.replace(destination.href);
    return true;
  }
  function syncInterface(language) {
    const title = html.dataset[language === 'zh' ? 'titleZh' : 'titleEn'];
    const description = html.dataset[language === 'zh' ? 'descriptionZh' : 'descriptionEn'];
    if (title) document.title = title;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    document.querySelectorAll('[data-aria-en], [data-aria-zh]').forEach(element => {
      const label = element.dataset[language === 'zh' ? 'ariaZh' : 'ariaEn'];
      if (label) element.setAttribute('aria-label', label);
    });
    document.querySelectorAll('[data-placeholder-en], [data-placeholder-zh]').forEach(element => {
      const value = element.dataset[language === 'zh' ? 'placeholderZh' : 'placeholderEn'];
      if (value) element.setAttribute('placeholder', value);
    });
    document.querySelectorAll('.language-toggle, #languageToggle').forEach(button => {
      button.setAttribute('aria-label', language === 'en' ? 'Switch to Traditional Chinese' : '切換為英文');
      button.setAttribute('title', language === 'en' ? 'Switch to Traditional Chinese' : '切換為英文');
      button.querySelectorAll('[data-lang-option]').forEach(option => option.classList.toggle('is-active', option.dataset.langOption === language));
    });
  }
  window.HubLanguage = {
    STORAGE_KEY,
    get() { return html.dataset.language || 'en'; },
    set(language, persist = true) {
      const target = language === 'zh' ? 'zh' : 'en';
      if (persist) { try { localStorage.setItem(STORAGE_KEY, target); } catch {} }
      if (routeToLanguage(target)) return;
      if (persist && new URL(location.href).searchParams.has('lang')) {
        const address = new URL(location.href); address.searchParams.set('lang', target);
        history.replaceState(history.state, '', address.href);
      }
      html.lang = target === 'zh' ? 'zh-Hant' : 'en'; html.dataset.language = target;
      if (document.body) document.body.dataset.language = target;
      syncInterface(target);
      window.dispatchEvent(new CustomEvent('hub:language-change', {detail:{language:target}}));
    },
    toggle() { const next = this.get() === 'en' ? 'zh' : 'en'; this.set(next); return next; }
  };
  if (routeToLanguage(initial)) return;
  html.lang = initial === 'zh' ? 'zh-Hant' : 'en'; html.dataset.language = initial;
  const sheets = [
    ['surface-radius.css?v=20260908-r3', true],
    ['chapter-lens.css?v=20260908-l5', true],
    ['memory-physics-contrast.css?v=20260907-f1', /memory-physics\.html/i.test(location.pathname)],
    ['ai-nvm-node.css?v=20260908-n30', /ai-nvm-opportunities\.html/i.test(location.pathname)],
    ['ai-nvm-tune.css?v=20260908-n31', /ai-nvm-opportunities\.html/i.test(location.pathname)],
    ['全站閱讀系統.css?v=20260910-bilingual', true]
  ];
  for (const [href, enabled] of sheets) {
    if (!enabled) continue;
    const link = document.createElement('link'); link.rel = 'stylesheet';
    link.href = new URL(href, rootURL).href; link.dataset.hubSharedStyle = href.split('?')[0]; document.head.append(link);
  }
  // 增強程式僅用於記憶體物理頁；資源根目錄由控制器自身位置解析。
  if (/memory-physics\.html/i.test(location.pathname)) {
    const script = document.createElement('script'); script.src = new URL('f1-card-align.js?v=20260907-f1', rootURL).href;
    script.defer = true; document.head.append(script);
  }
  function ready() {
    const readingStyle = document.querySelector('link[data-hub-shared-style="全站閱讀系統.css"]');
    if (readingStyle) document.head.append(readingStyle);
    document.querySelectorAll('.language-toggle, #languageToggle').forEach(button => {
      if (button._hubLangBound) return;
      button._hubLangBound = true;
      button.addEventListener('click', event => { event.preventDefault(); window.HubLanguage.toggle(); });
    });
    window.HubLanguage.set(initial, false);

    // 行動端漢堡選單全域監聽與 WCAG 2.1 AA 焦點管理
    const menuBtn = document.querySelector('#menuToggle');
    const nav = document.querySelector('#primaryNav, #globalNav, .primary-nav');
    if (menuBtn && nav && !menuBtn._hubNavBound) {
      menuBtn._hubNavBound = true;
      const closeNav = (restoreFocus = false) => {
        nav.classList.remove('open');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        const isChinese = window.HubLanguage?.get() === 'zh';
        menuBtn.setAttribute('aria-label', isChinese ? '開啟選單' : 'Open menu');
        if (restoreFocus) menuBtn.focus();
      };
      menuBtn.addEventListener('click', e => {
        e.preventDefault();
        const isOpen = nav.classList.toggle('open');
        menuBtn.classList.toggle('open', isOpen);
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        const isChinese = window.HubLanguage?.get() === 'zh';
        menuBtn.setAttribute('aria-label', isChinese ? (isOpen ? '關閉選單' : '開啟選單') : (isOpen ? 'Close menu' : 'Open menu'));
        if (isOpen) {
          const firstLink = nav.querySelector('a');
          if (firstLink) firstLink.focus();
        }
      });
      nav.addEventListener('click', e => {
        if (e.target.closest('a')) closeNav();
      });
      document.addEventListener('keydown', e => {
        if (!nav.classList.contains('open')) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          closeNav(true);
          return;
        }
        if (e.key === 'Tab') {
          const focusable = [menuBtn, ...nav.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')].filter(Boolean);
          if (!focusable.length) return;
          const index = focusable.indexOf(document.activeElement);
          if (e.shiftKey) {
            if (index <= 0) {
              e.preventDefault();
              focusable[focusable.length - 1].focus();
            }
          } else {
            if (index === focusable.length - 1 || index === -1) {
              e.preventDefault();
              focusable[0].focus();
            }
          }
        }
      });
      window.addEventListener('resize', () => {
        if (window.innerWidth > 960) closeNav();
      }, { passive: true });
      window.addEventListener('hub:language-change', () => {
        const isOpen = nav.classList.contains('open');
        const isChinese = window.HubLanguage?.get() === 'zh';
        menuBtn.setAttribute('aria-label', isChinese ? (isOpen ? '關閉選單' : '開啟選單') : (isOpen ? 'Close menu' : 'Open menu'));
      });
    }

    document.querySelectorAll('a[href]').forEach(link => {
      if (link.getAttribute('href')?.startsWith('#')) return;
      let target; try { target = new URL(link.href); } catch { return; }
      if (target.origin !== location.origin || !decodeURIComponent(target.pathname).endsWith('/NVM技術全景.html')) return;
      link.addEventListener('click', () => {
        const name = window.HubLanguage.get() === 'zh' ? 'NVM技術全景中文.html' : 'NVM技術全景.html';
        target.pathname = target.pathname.replace(/[^/]+$/, encodeURIComponent(name));
        target.searchParams.set('lang', window.HubLanguage.get()); link.href = target.href;
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
