// IoT 專題只初始化本頁導覽、主題與閱讀進度；語言狀態由 HubLanguage 管理。
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('#menuToggle');
  const nav = document.querySelector('#primaryNav');
  const theme = document.querySelector('#themeToggle');
  const language = () => window.HubLanguage?.get() || 'en';
  const setMenu = (open, restoreFocus = false) => {
    nav?.classList.toggle('open', open);
    menu?.classList.toggle('open', open);
    menu?.setAttribute('aria-expanded', String(open));
    menu?.setAttribute('aria-label', language() === 'zh' ? (open ? '關閉選單' : '開啟選單') : (open ? 'Close menu' : 'Open menu'));
    if (open) {
      const first = nav?.querySelector('a, button, [tabindex="0"]');
      if (first) first.focus();
    } else if (restoreFocus && menu) {
      menu.focus();
    }
  };
  if (menu && nav && !menu._hubNavBound) {
    menu._hubNavBound = true;
    menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', event => {
      if (!nav.classList.contains('open')) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenu(false, true);
        return;
      }
      if (event.key === 'Tab') {
        const focusable = [menu, ...nav.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')].filter(Boolean);
        if (!focusable.length) return;
        const index = focusable.indexOf(document.activeElement);
        if (event.shiftKey) {
          if (index <= 0) {
            event.preventDefault();
            focusable[focusable.length - 1].focus();
          }
        } else {
          if (index === focusable.length - 1 || index === -1) {
            event.preventDefault();
            focusable[0].focus();
          }
        }
      }
    });
  }
  theme?.addEventListener('click', () => theme.setAttribute('aria-pressed', String(document.body.classList.toggle('light-mode'))));
  const syncLanguage = () => {
    setMenu(nav?.classList.contains('open') || false);
    theme?.setAttribute('aria-label', language() === 'zh' ? '切換顯示主題' : 'Toggle display theme');
  };
  window.addEventListener('hub:language-change', syncLanguage);
  const progress = document.querySelector('#readingProgress');
  const updateProgress = () => {
    const range = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = `${range > 0 ? Math.min(100, Math.max(0, scrollY / range * 100)) : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', () => { if (innerWidth >= 1181) setMenu(false); updateProgress(); });
  syncLanguage();
  updateProgress();
});
