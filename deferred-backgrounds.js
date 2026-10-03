(() => {
  'use strict';

  const root = document.documentElement;
  if (!('IntersectionObserver' in window)) return;
  const selector = '[data-deferred-background]';
  let observer;
  const failOpen = () => {
    root.removeAttribute('data-deferred-backgrounds');
    observer?.disconnect();
  };
  const reveal = element => {
    element.setAttribute('data-background-ready', '');
    observer.unobserve(element);
  };
  const revealAll = () => document.querySelectorAll(selector).forEach(reveal);
  const revealHash = () => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const section = document.getElementById(id)?.closest(selector);
    if (section) reveal(section);
  };
  const start = () => {
    try {
      document.querySelectorAll(selector).forEach(element => observer.observe(element));
      // Hash navigation may run before the observer's first callback.
      revealHash();
      if (matchMedia('print').matches) revealAll();
    } catch { failOpen(); }
  };

  try {
    observer = new IntersectionObserver(entries => {
      try { entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); }); }
      catch { failOpen(); }
    }, { rootMargin: '300px 0px' });
    window.addEventListener('hashchange', revealHash);
    window.addEventListener('beforeprint', revealAll);
    matchMedia('print').addEventListener('change', event => { if (event.matches) revealAll(); });
    // Execute before styles: if this script fails to load, CSS stays eager.
    root.setAttribute('data-deferred-backgrounds', '');
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  } catch { failOpen(); }
})();
