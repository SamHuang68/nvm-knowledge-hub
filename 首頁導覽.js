/* 錨點導覽共用一個狀態；滑動指示線跟隨實際位置。 */
(() => {
  const physicsIndex = document.querySelector('.knowledge-physics');
  if (physicsIndex) physicsIndex.open = !matchMedia('(max-width:900px)').matches;
  const nav = document.querySelector('.hub-rail-nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('.hub-rail-btn')];
  const sections = links.map(link => document.getElementById(link.dataset.target));
  const indicator = document.createElement('span');
  indicator.className = 'hub-rail-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  nav.append(indicator);
  let active = links.find(link => link.hash === location.hash) || links[0];
  let pending = null;
  let anchorTop = 145;
  function measureAnchor() {
    const header = document.querySelector('.knowledge-header');
    anchorTop = Math.max(header?.offsetHeight || 0, parseFloat(getComputedStyle(nav).top) || 0) + nav.offsetHeight + 12;
    document.documentElement.style.setProperty('--home-anchor-top', `${anchorTop}px`);
  }
  function resolveAnchor() {
    try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); }
    catch { return null; }
  }
  function alignTarget(target, {focus = false, smooth = false} = {}) {
    const section = target?.closest('.knowledge-section');
    const link = links.find(item => item.dataset.target === section?.id);
    if (!target || !link) { track(); return; }
    measureAnchor();
    pending = link;
    select(link);
    if (focus) {
      target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
    }
    target.scrollIntoView({behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant', block: 'start'});
    clearTimeout(release.timer);
    release.timer = setTimeout(release, 1200);
  }
  function restoreAnchor() {
    requestAnimationFrame(() => requestAnimationFrame(() => alignTarget(resolveAnchor())));
  }
  function select(link) {
    active = link;
    links.forEach(item => {
      item.classList.toggle('active', item === link);
      if (item === link) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
    const box = link.getBoundingClientRect(), parent = nav.getBoundingClientRect();
    indicator.style.width = `${box.width}px`;
    indicator.style.transform = `translate(${box.left-parent.left+nav.scrollLeft}px, ${box.bottom-parent.top+nav.scrollTop-2}px)`;
  }
  links.forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    alignTarget(document.getElementById(link.dataset.target), {focus:true, smooth:true});
  }));
  function track() {
    if (pending) return;
    const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 3;
    const index = atEnd ? links.length-1 : Math.max(0, sections.findLastIndex(section => section.getBoundingClientRect().top <= anchorTop + 2));
    select(links[index]);
  }
  function release() { pending = null; track(); }
  window.addEventListener('scrollend', release);
  window.addEventListener('wheel', release, {passive:true});
  window.addEventListener('touchstart', release, {passive:true});
  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (!scheduled) requestAnimationFrame(() => { scheduled = false; track(); });
    scheduled = true;
  }, {passive:true});
  window.addEventListener('hashchange', restoreAnchor);
  window.addEventListener('hub:language-change', restoreAnchor);
  window.addEventListener('load', restoreAnchor);
  const resize = new ResizeObserver(() => { measureAnchor(); select(active); });
  resize.observe(nav);
  resize.observe(document.querySelector('.knowledge-header'));
  measureAnchor();
  select(active);
})();
