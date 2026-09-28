// 補齊四個既有專題缺少的手機選單事件；語言由 HubLanguage 管理。
document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('#menuToggle');
  const nav = document.querySelector('#primaryNav');
  if (!button || !nav || button._hubNavBound) return;
  button._hubNavBound = true;
  const setOpen = (open, restoreFocus = false) => {
    nav.classList.toggle('open', open);
    button.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    const isChinese = window.HubLanguage?.get() === 'zh';
    button.setAttribute('aria-label', isChinese ? (open ? '關閉選單' : '開啟選單') : (open ? 'Close menu' : 'Open menu'));
    if (open) {
      const firstLink = nav.querySelector('a, button, [tabindex="0"]');
      if (firstLink) firstLink.focus();
    } else if (restoreFocus) {
      button.focus();
    }
  };
  button.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', event => {
    if (!nav.classList.contains('open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false, true);
      return;
    }
    if (event.key === 'Tab') {
      const focusable = [button, ...nav.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')].filter(Boolean);
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
  window.addEventListener('hub:language-change', () => setOpen(nav.classList.contains('open')));
  window.addEventListener('resize', () => { if (innerWidth > 960) setOpen(false); });
  setOpen(false);
});
