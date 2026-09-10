// IoT 專題只初始化本頁導覽、主題與閱讀進度；語言狀態由 HubLanguage 管理。
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('#menuToggle');
  const nav = document.querySelector('#primaryNav');
  const theme = document.querySelector('#themeToggle');
  const language = () => window.HubLanguage?.get() || 'en';
  const setMenu = open => {
    nav?.classList.toggle('open', open);
    menu?.setAttribute('aria-expanded', String(open));
    menu?.setAttribute('aria-label', language() === 'zh' ? (open ? '關閉選單' : '開啟選單') : (open ? 'Close menu' : 'Open menu'));
  };
  if (menu && nav && !menu._hubNavBound) {
    menu._hubNavBound = true;
    menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
    nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
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
