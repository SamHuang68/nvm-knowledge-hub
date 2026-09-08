/* 錨點導覽共用一個狀態；滑動指示線跟隨實際位置。 */
(() => {
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
    pending = link;
    select(link);
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    const target = document.getElementById(link.dataset.target);
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll: true});
    target.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
    clearTimeout(release.timer);
    release.timer = setTimeout(release, 1200);
  }));
  function track() {
    if (pending) return;
    const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 3;
    const index = atEnd ? links.length-1 : Math.max(0, sections.findLastIndex(section => section.getBoundingClientRect().top <= 150));
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
  window.addEventListener('hashchange', () => select(links.find(link => link.hash === location.hash) || links[0]));
  new ResizeObserver(() => select(active)).observe(nav);
  select(active);
})();
