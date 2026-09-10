// 補齊四個既有專題缺少的手機選單事件；語言由 HubLanguage 管理。
document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('#menuToggle');
  const nav = document.querySelector('#primaryNav');
  if (!button || !nav) return;
  const setOpen = open => {
    nav.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    const isChinese = window.HubLanguage?.get() === 'zh';
    button.setAttribute('aria-label', isChinese ? (open ? '關閉選單' : '開啟選單') : (open ? 'Close menu' : 'Open menu'));
  };
  button.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); button.focus(); }
  });
  window.addEventListener('hub:language-change', () => setOpen(nav.classList.contains('open')));
  window.addEventListener('resize', () => { if (innerWidth > 1320) setOpen(false); });
  setOpen(false);
});
