function hydrate(placeholder) {
  const source = placeholder.querySelector('noscript')?.textContent;
  if (!source) return null;
  // 沿用原頁 HTML 解析規則；XML 會拒絕原稿中瀏覽器容許的重複屬性。
  const template = document.createElement('template');
  template.innerHTML = source;
  const svg = template.content.firstElementChild;
  if (template.content.childElementCount !== 1 || svg?.localName !== 'svg' || svg.namespaceURI !== 'http://www.w3.org/2000/svg') return null;
  placeholder.replaceWith(svg);
  return svg;
}

export function ensureDiagrams(container) {
  if (!container) return true;
  const ready = [...container.querySelectorAll('[data-nvm-diagram]')].map(hydrate).every(Boolean);
  container.dataset.diagramsState = ready ? 'ready' : 'error';
  return ready;
}

// 瀏覽器選單及 Ctrl+P 都會先發送同步事件，列印前須完整展開所有章節。
const printReplacements = new Map();
window.addEventListener('beforeprint', () => {
  for (const placeholder of document.querySelectorAll('[data-nvm-diagram]')) {
    const svg = hydrate(placeholder);
    if (svg) printReplacements.set(svg, placeholder);
  }
});
window.addEventListener('afterprint', () => {
  for (const [svg, placeholder] of printReplacements) {
    const panel = svg.closest('[data-nvm-panel]');
    if (panel?.hidden) {
      svg.replaceWith(placeholder);
      panel.dataset.diagramsState = 'deferred';
    }
  }
  printReplacements.clear();
});
