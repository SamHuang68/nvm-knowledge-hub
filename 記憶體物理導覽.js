// 僅供記憶體物理頁：章節位置、可分享錨點與無障礙標籤。
(() => {
  const rail = document.querySelector('.memory-physics-page .lens-vertical-rail');
  if (!rail) return;
  const toggle = rail.querySelector('.f1-chapter-toggle');
  const links = [...rail.querySelectorAll('.lens-node-item')];
  const panels = links.map(link => document.getElementById(link.hash.slice(1)));
  const compact = matchMedia('(max-width: 1024px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  let scheduled = false;

  function closeChapters() {
    rail.classList.remove('chapters-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function anchorOffset() {
    return (header?.getBoundingClientRect().height || 64) + (compact.matches ? toggle.getBoundingClientRect().height + 24 : 20);
  }

  function updatePosition() {
    scheduled = false;
    const offset = anchorOffset();
    document.documentElement.style.setProperty('--f1-anchor-offset', `${offset}px`);
    let current = 0;
    panels.forEach((panel, index) => {
      if (panel && panel.getBoundingClientRect().top <= offset + 32) current = index;
    });
    links.forEach((link, index) => {
      const active = index === current;
      link.classList.toggle('active', active);
      link.classList.toggle('active-chapter', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    rail.querySelector('.f1-current-chapter').textContent = links[current].querySelector('.lens-badge').textContent;
  }

  function schedulePosition() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updatePosition);
  }

  function jumpTo(hash, smooth = false) {
    const target = document.getElementById(hash.slice(1));
    if (!target) return;
    closeChapters();
    updatePosition();
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - anchorOffset(), behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant' });
    schedulePosition();
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !document.getElementById(link.hash.slice(1))) return;
      event.preventDefault();
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      jumpTo(link.hash, true);
    });
  });
  toggle.addEventListener('click', () => {
    const open = rail.classList.toggle('chapters-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  rail.addEventListener('keydown', event => {
    if (event.key === 'Escape' && rail.classList.contains('chapters-open')) {
      closeChapters();
      toggle.focus();
    }
  });
  compact.addEventListener('change', () => { closeChapters(); schedulePosition(); });
  window.addEventListener('scroll', schedulePosition, { passive: true });
  window.addEventListener('resize', schedulePosition, { passive: true });
  window.addEventListener('hashchange', () => jumpTo(location.hash));
  window.addEventListener('load', () => { if (location.hash) jumpTo(location.hash); });
  if ('ResizeObserver' in window) new ResizeObserver(schedulePosition).observe(header);

  function localize() {
    const zh = document.documentElement.dataset.language === 'zh';
    document.title = zh ? '互補儲存與可驗證差異 · NVM Knowledge Hub' : 'Complementary Storage & Verifiable Difference · NVM Knowledge Hub';
    rail.setAttribute('aria-label', zh ? '章節導覽' : 'Chapter navigation');
    rail.querySelector('nav').setAttribute('aria-label', zh ? '章節跳轉' : 'Jump to a chapter');
    document.querySelector('.f1-reading-routes').setAttribute('aria-label', zh ? '依問題選擇閱讀路徑' : 'Choose a reading path');
    document.querySelectorAll('.table-scroll-container').forEach((region, index) => {
      region.tabIndex = 0;
      region.setAttribute('role', 'region');
      region.setAttribute('aria-label', zh ? (index ? '安全風險矩陣，可左右捲動' : '記憶體分類表，可左右捲動') : (index ? 'Security matrix, horizontally scrollable' : 'Memory taxonomy, horizontally scrollable'));
    });
    schedulePosition();
  }
  document.querySelector('.state-lab-copy').setAttribute('aria-live', 'polite');
  document.querySelector('.state-lab-copy').setAttribute('aria-atomic', 'true');
  window.addEventListener('hub:language-change', localize);
  document.addEventListener('DOMContentLoaded', localize);
  localize();
})();
