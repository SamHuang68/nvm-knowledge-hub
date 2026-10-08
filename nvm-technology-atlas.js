import {ensureDiagrams} from './atlas-diagram-loader.js';
document.documentElement.classList.add('nvm-enhanced');
const panels = [...document.querySelectorAll('[data-nvm-panel]')];
const contents = document.querySelector('.nvm-sidebar');
const contentsButton = document.querySelector('#nvm-contents-toggle');
const baseTitle = document.title;
const isEnglish = () => (window.HubLanguage?.get() || document.documentElement.lang) === 'en';
function updatePanelTitle(next) {
  document.title = next.id === 'panorama' ? (isEnglish() ? baseTitle : (document.documentElement.dataset.titleZh || baseTitle.replace('NVM Knowledge Hub', 'NVM 知識中心'))) : `${next.querySelector('h2')?.textContent || (isEnglish() ? 'NVM Study' : 'NVM 專題')} · ${isEnglish() ? 'NVM Knowledge Hub' : 'NVM 知識中心'}`;
}
window.addEventListener('hub:language-change', () => {
  const active = panels.find(panel => !panel.hidden);
  if (active) updatePanelTitle(active);
});
document.addEventListener('keydown', event => {
  if (['Tab','Enter',' ','ArrowUp','ArrowDown','Home','End'].includes(event.key)) document.documentElement.classList.add('nvm-keyboard-navigation');
});
document.addEventListener('pointerdown', () => document.documentElement.classList.remove('nvm-keyboard-navigation'));
const pageHeader = document.querySelector('.nvm-header');
// 章節位置與前後章由既有側欄／panel 契約產生，沒有第二份目錄。
const chapterNav = document.createElement('nav');
chapterNav.className = 'nvm-reading-position';
const chapterSelect = document.createElement('select');
chapterSelect.id = 'nvm-current-chapter';
const chapterLabel = document.createElement('label');
chapterLabel.htmlFor = chapterSelect.id;
const chapterPrevious = document.createElement('button');
const chapterNext = document.createElement('button');
chapterPrevious.type = chapterNext.type = 'button';
chapterPrevious.textContent = '←'; chapterNext.textContent = '→';
chapterPrevious.dataset.chapterPrevious = ''; chapterNext.dataset.chapterNext = '';
const chapterLinks = panels.map(panel => [...contents.querySelectorAll('a[href^="#"]')].find(link => link.hash === `#${panel.id}`));
panels.forEach((panel,index) => { const option = document.createElement('option'); option.value = panel.id; option.textContent = chapterLinks[index]?.textContent.trim() || panel.querySelector('h2')?.textContent.trim(); chapterSelect.append(option); });
chapterNav.append(chapterLabel, chapterSelect, chapterPrevious, chapterNext);
pageHeader?.insertAdjacentElement('afterend', chapterNav);
function updatePosition(panel) {
  const index = panels.indexOf(panel);
  chapterSelect.value = panel.id;
  chapterLabel.textContent = `${isEnglish() ? 'Chapter' : '章節'} ${index + 1}/${panels.length}`;
  chapterNav.setAttribute('aria-label', isEnglish() ? 'Current chapter and chapter navigation' : '目前章節與前後章導覽');
  chapterPrevious.setAttribute('aria-label', isEnglish() ? 'Previous chapter' : '上一章');
  chapterNext.setAttribute('aria-label', isEnglish() ? 'Next chapter' : '下一章');
  chapterPrevious.disabled = index <= 0; chapterNext.disabled = index >= panels.length - 1;
}
chapterSelect.addEventListener('change', () => navigateHash(`#${chapterSelect.value}`));
function goChapter(offset) { const index = panels.findIndex(panel => !panel.hidden); const panel = panels[index + offset]; if (panel) navigateHash(`#${panel.id}`); }
chapterPrevious.addEventListener('click', () => goChapter(-1));
chapterNext.addEventListener('click', () => goChapter(1));
window.addEventListener('hub:language-change', () => { const active = panels.find(panel => !panel.hidden); if (active) updatePosition(active); });
const measureHeader = () => {
  const height = pageHeader?.getBoundingClientRect().height || 76;
  document.documentElement.style.setProperty('--nvm-header-height', `${height}px`);
  document.documentElement.style.setProperty('--nvm-anchor-top', `${height + chapterNav.getBoundingClientRect().height + 24}px`);
};
if (pageHeader) new ResizeObserver(measureHeader).observe(pageHeader);
new ResizeObserver(measureHeader).observe(chapterNav);
measureHeader();

// 只保存本頁各歷史項目的座標；查詢參數由各自控制器管理，不改全域 scrollRestoration。
const readingStateKey = '__nvmReadingPosition';
const readingRoute = () => location.pathname + location.hash;
let readingTimer, restoreFrame, pendingRoute, poppedRoute, routedReadingRoute = readingRoute();
function recordReadingPosition() {
  clearTimeout(readingTimer);
  readingTimer = null;
  if (restoreFrame) return;
  const state = history.state;
  // 外來純量、陣列與特殊物件維持原型態，不為了加名稱空間改寫呼叫端的契約。
  if (state !== null && Object.prototype.toString.call(state) !== '[object Object]') return;
  const panel = panels.find(item => !item.hidden);
  if (!panel) return;
  history.replaceState({...state, [readingStateKey]:{version:1, route:readingRoute(), panelId:panel.id, x:Math.round(scrollX), y:Math.round(scrollY)}}, '');
}
function savedReadingPosition(state) {
  const position = state?.[readingStateKey];
  let target;
  try { target = decodeURIComponent(location.hash.slice(1)) || 'panorama'; } catch { return null; }
  const anchor = document.getElementById(target);
  const panel = target === 'main-content' ? panels.find(item => item.id === position?.panelId) : anchor?.closest('[data-nvm-panel]') || document.getElementById('panorama');
  return Boolean(panel) && position?.version === 1 && position.route === readingRoute()
    && typeof position.panelId === 'string' && position.panelId.length > 0 && position.panelId === panel.id
    && Number.isSafeInteger(position.x) && position.x >= 0 && Number.isSafeInteger(position.y) && position.y >= 0 ? position : null;
}
function routeReadingPosition(position = null) {
  clearTimeout(readingTimer);
  cancelAnimationFrame(restoreFrame);
  restoreFrame = null;
  const heading = showRoute({focus:true, scroll:!position, readingPanel:position?.panelId});
  routedReadingRoute = readingRoute();
  if (!position) { recordReadingPosition(); return; }
  const route = readingRoute();
  // 等原生歷史還原與 panel 顯示完成，再套用該項目座標，不讓 hash 定位蓋掉閱讀位置。
  restoreFrame = requestAnimationFrame(() => {
    restoreFrame = null;
    if (readingRoute() !== route) return;
    heading?.focus({preventScroll:true});
    window.scrollTo({left:position.x, top:position.y, behavior:'instant'});
    recordReadingPosition();
  });
}
function navigateHash(hash) {
  recordReadingPosition();
  pendingRoute = location.pathname + hash;
  if (hash === location.hash) { pendingRoute = null; routeReadingPosition(); }
  else location.hash = hash;
}
window.addEventListener('scroll', () => {
  if (!restoreFrame && !readingTimer) readingTimer = setTimeout(recordReadingPosition, 120);
}, {passive:true});
window.addEventListener('scrollend', recordReadingPosition);
window.addEventListener('pagehide', recordReadingPosition);
window.addEventListener('pageshow', event => {
  if (event.persisted) routeReadingPosition(savedReadingPosition(history.state));
});

function showRoute({ focus = false, scroll = true, readingPanel = null } = {}) {
  let target;
  try { target = decodeURIComponent(location.hash.slice(1)) || 'panorama'; } catch { target = 'panorama'; }
  const anchor = document.getElementById(target);
  for (const kind of ['patent', 'glossary']) {
    if (anchor?.matches(`[data-${kind}-record]`) && anchor.hidden) {
      document.querySelector(`#nvm-${kind}-search`).value = '';
      const topic = document.querySelector(`#nvm-${kind}-topic`);
      if (topic) topic.value = '';
      filterReference(kind);
    }
  }
  if (anchor?.matches('[data-landscape-row]') && anchor.hidden) {
    document.querySelector('#nvm-landscape-family').value = '';
    const query = document.querySelector('#nvm-landscape-search');
    query.value = '';
    query.dispatchEvent(new Event('input'));
  }
  if (anchor?.matches('[data-foundry],[data-foundry-year]') && (anchor.hidden || anchor.closest('[data-foundry-year]')?.hidden)) {
    const select = document.querySelector('#nvm-foundry-filter');
    select.value = '';
    select.dispatchEvent(new Event('change'));
  }
  const panel = target === 'main-content' ? panels.find(item => item.id === readingPanel) || panels.find(item => !item.hidden) || panels[0] : anchor?.matches('[data-nvm-panel]') ? anchor : anchor?.closest('[data-nvm-panel]');
  const next = panel || document.getElementById('panorama');
  panels.forEach(item => { item.hidden = item !== next; });
  void ensureDiagrams(next);
  const operation = anchor?.matches('[data-operation-detail]') ? anchor : anchor?.closest('[data-operation-detail]');
  if (operation) {
    const widget = operation.closest('[data-operation-widget]');
    widget.querySelectorAll('[data-operation-detail]').forEach(item => { item.hidden = !widget.hasAttribute('data-complete-cycle') && item !== operation; });
    widget.querySelectorAll('[data-operation-select]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.operationSelect===operation.dataset.operationDetail)));
  }
  document.querySelectorAll('.nvm-sidebar details').forEach(detail => {
    detail.open=[...detail.querySelectorAll('a')].some(link=>link.hash===`#${next.id}`);
  });
  document.querySelectorAll('.nvm-sidebar a').forEach(link => {
    if (link.hash === `#${next.id}`) {
      link.setAttribute('aria-current', 'page');
      const parentDisclosure = link.closest('details');
      if (parentDisclosure) parentDisclosure.open = true;
    }
    else link.removeAttribute('aria-current');
  });
  updatePanelTitle(next);
  updatePosition(next);
  contents.classList.remove('open');
  contentsButton.setAttribute('aria-expanded', 'false');
  for (let disclosure = anchor?.closest('details'); disclosure; disclosure = disclosure.parentElement?.closest('details')) disclosure.open = true;
  if (focus) {
    const destination = target === 'main-content' ? next : anchor || next;
    const heading = destination.matches('[data-nvm-panel]') ? destination.querySelector('h2') : destination.matches('.nvm-research-study,.nvm-benchmark-study,.nvm-topic-section,.nvm-ip-group,.nvm-system-section,.nvm-system-end,.nvm-history-editorial,.nvm-corrections,.nvm-lineage-entry,[data-foundry-year]') ? destination.querySelector('h3') : destination.matches('[data-foundry],.nvm-correction,.nvm-lineage-events-block,.nvm-lineage-current,.nvm-lineage-boundary') ? destination.querySelector('h4') : destination.matches('.nvm-lineage-event') ? destination.querySelector('h5') : destination.matches('.nvm-system-index,.nvm-lineage-index') ? destination.querySelector('a') : destination.matches('[data-source-record],[data-patent-record],.nvm-history-disclosure') ? destination.querySelector('summary') : destination.matches('[data-glossary-record]') ? destination.querySelector('dt') : destination;
    heading?.setAttribute('tabindex', '-1');
    if (heading?.matches('h2,h3,h4,h5')) heading.dataset.routeHeading = '';
    heading?.focus({ preventScroll: true });
    if (scroll) destination.scrollIntoView({ block: 'start', behavior:'instant' });
    return heading;
  }
}

contentsButton.addEventListener('click', () => {
  const open = contents.classList.toggle('open');
  contentsButton.setAttribute('aria-expanded', String(open));
});

document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
  let anchor;
  try { anchor = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
  if (!anchor?.closest('[data-nvm-panel]') && anchor?.id !== 'main-content') return;
  event.preventDefault();
  navigateHash(url.hash);
}, {capture:true});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && contents.classList.contains('open')) {
    contents.classList.remove('open');
    contentsButton.setAttribute('aria-expanded', 'false');
    contentsButton.focus();
  }
});
window.addEventListener('popstate', event => {
  poppedRoute = readingRoute();
  const activeNavigation = pendingRoute === poppedRoute;
  pendingRoute = null;
  // 新的 hash 導航仍會收到 popstate；讓後續 hashchange 在原生定位之後處理。
  if (activeNavigation) { poppedRoute = null; return; }
  // 搜尋等控制器只改查詢參數時，不移動閱讀焦點或捲動位置。
  if (poppedRoute === routedReadingRoute) return;
  const position = savedReadingPosition(event.state);
  if (position) routeReadingPosition(position);
  else poppedRoute = null;
});
window.addEventListener('hashchange', () => {
  const alreadyRouted = poppedRoute === readingRoute();
  poppedRoute = pendingRoute = null;
  if (!alreadyRouted) routeReadingPosition();
});

document.querySelectorAll('[data-operation-widget]').forEach(widget => {
  const completeCycle = widget.hasAttribute('data-complete-cycle');
  widget.querySelectorAll('[data-operation-detail]').forEach((item, index) => { item.hidden = !completeCycle && index > 0; });
  widget.querySelectorAll('[data-operation-select]').forEach(button => {
    button.addEventListener('click', () => {
      widget.querySelectorAll('[data-operation-select]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      widget.querySelectorAll('[data-operation-detail]').forEach(item => { item.hidden = !completeCycle && item.dataset.operationDetail !== button.dataset.operationSelect; });
      history.replaceState(history.state,'',`#${button.getAttribute('aria-controls')}`);
      if (completeCycle) {
        const destination = document.getElementById(button.getAttribute('aria-controls'));
        destination.setAttribute('tabindex', '-1');
        destination.focus({preventScroll:true});
        destination.scrollIntoView({block:'start'});
      }
      recordReadingPosition();
      routedReadingRoute = readingRoute();
    });
  });
});
showRoute({ focus: Boolean(location.hash) });
recordReadingPosition();
if (document.readyState !== 'complete') window.addEventListener('load', () => {
  requestAnimationFrame(() => {
    if (location.hash) routeReadingPosition();
    else recordReadingPosition();
  });
}, {once:true});

function filterHistoricalMetrics() {
  const select = document.querySelector('#nvm-history-metric');
  const total = select.options.length - 1;
  document.querySelectorAll('[data-history-metric]').forEach(item => { item.hidden = select.value !== '' && item.dataset.historyMetric !== select.value; });
  document.querySelector('.nvm-history-notes').open = select.value !== '';
  document.querySelector('#nvm-history-count').textContent = isEnglish() ? `Showing ${select.value === '' ? total : 1} of ${total} historical metrics. These are course values, not current product specifications.` : `顯示 ${select.value === '' ? total : 1}／${total} 個歷史指標。數值僅供課程對照，不是現行產品規格。`;
}
document.querySelector('#nvm-history-metric').addEventListener('change', filterHistoricalMetrics);
document.querySelector('#nvm-history-reset').addEventListener('click', () => {
  const select = document.querySelector('#nvm-history-metric');
  select.value = '';
  filterHistoricalMetrics();
  select.focus();
});
filterHistoricalMetrics();

function filterReference(kind) {
  const query = document.querySelector(`#nvm-${kind}-search`).value.normalize('NFKC').toLocaleLowerCase().trim();
  const topic = document.querySelector(`#nvm-${kind}-topic`)?.value || '';
  const records = [...document.querySelectorAll(`[data-${kind}-record]`)];
  let count = 0;
  records.forEach(record => {
    record.hidden = Boolean(query && !record.dataset.referenceSearch.normalize('NFKC').toLocaleLowerCase().includes(query)) || Boolean(topic && record.dataset.patentTopic !== topic);
    if (!record.hidden) count++;
  });
  if (kind === 'patent') document.querySelectorAll('[data-patent-group]').forEach(group => { group.hidden = ![...group.querySelectorAll('[data-patent-record]')].some(record => !record.hidden); });
  document.querySelector(`#nvm-${kind}-count`).textContent = isEnglish() ? `Showing ${count} of ${records.length} ${kind === 'patent' ? 'patent studies' : 'terms'}` : `顯示 ${count}／${records.length} ${kind === 'patent' ? '件研究專利' : '個詞彙'}`;
  document.querySelector(`#nvm-${kind}-empty`).hidden = count > 0;
}
for (const kind of ['patent', 'glossary']) {
  const search = document.querySelector(`#nvm-${kind}-search`);
  const topic = document.querySelector(`#nvm-${kind}-topic`);
  search.addEventListener('input', () => filterReference(kind));
  topic?.addEventListener('change', () => filterReference(kind));
  document.querySelector(`#nvm-${kind}-reset`).addEventListener('click', () => {
    search.value = '';
    if (topic) topic.value = '';
    filterReference(kind);
    search.focus();
  });
  filterReference(kind);
}

const filters = [...document.querySelectorAll('[data-topic-filter]')];
const rows = [...document.querySelectorAll('[data-topic-row]')];
function filterTopics() {
  const query = document.querySelector('#nvm-search').value.normalize('NFKC').toLocaleLowerCase().trim();
  const family = document.querySelector('#nvm-family').value;
  const stage = document.querySelector('#nvm-stage').value;
  let count = 0;
  rows.forEach(row => {
    const families = (row.dataset.family || '').split(',').map(item => item.trim()).filter(Boolean);
    const match = (!query || row.dataset.search.normalize('NFKC').toLocaleLowerCase().includes(query)) && (!family || families.includes(family)) && (!stage || row.dataset.stage === stage);
    row.hidden = !match;
    if (match) count++;
  });
  document.querySelector('#nvm-count').textContent = isEnglish() ? `Showing ${count} of ${rows.length} technology studies` : `顯示 ${count}／${rows.length} 個技術專題`;
  document.querySelector('#nvm-empty').hidden = count > 0;
}
filters.forEach(input => input.addEventListener(input.tagName === 'INPUT' ? 'input' : 'change', filterTopics));
document.querySelector('#nvm-reset').addEventListener('click', () => { filters.forEach(input => { input.value = ''; }); filterTopics(); document.querySelector('#nvm-search').focus(); });
filterTopics();

const foundryFilter = document.querySelector('#nvm-foundry-filter');
foundryFilter?.addEventListener('change', () => {
  document.querySelectorAll('[data-foundry]').forEach(item => { item.hidden = Boolean(foundryFilter.value) && item.dataset.foundry !== foundryFilter.value; });
  document.querySelectorAll('[data-foundry-year]').forEach(group => {
    const count=[...group.querySelectorAll('[data-foundry]')].filter(item=>!item.hidden).length;
    group.hidden=count===0;
    const link=document.querySelector(`[data-foundry-year-link="${group.dataset.foundryYear}"]`);
    if(link){link.hidden=count===0;link.querySelector('span').textContent=count;}
  });
});

const landscapeSearch = document.querySelector('#nvm-landscape-search');
const landscapeFamily = document.querySelector('#nvm-landscape-family');
const landscapeRows = [...document.querySelectorAll('[data-landscape-row]')];
function filterLandscape() {
  if (!landscapeSearch || !landscapeFamily) return;
  const query = landscapeSearch.value.normalize('NFKC').toLocaleLowerCase().trim();
  let count = 0;
  for (const row of landscapeRows) {
    const families = (row.dataset.family || '').split(',').map(item => item.trim()).filter(Boolean);
    row.hidden = Boolean(query && !row.dataset.search.normalize('NFKC').toLocaleLowerCase().includes(query)) || Boolean(landscapeFamily.value && !families.includes(landscapeFamily.value));
    if (!row.hidden) count++;
  }
  document.querySelector('#nvm-landscape-count').textContent = isEnglish() ? `Showing ${count} of ${landscapeRows.length} named routes` : `顯示 ${count}／${landscapeRows.length} 條具名路線`;
  document.querySelector('#nvm-landscape-empty').hidden = count !== 0;
  document.querySelectorAll('[data-landscape-family-shortcut]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.landscapeFamilyShortcut === landscapeFamily.value));
  });
}
landscapeSearch?.addEventListener('input', filterLandscape);
landscapeFamily?.addEventListener('change', filterLandscape);
document.querySelectorAll('[data-landscape-family-shortcut]').forEach(button => {
  button.addEventListener('click', () => {
    landscapeFamily.value = button.dataset.landscapeFamilyShortcut;
    filterLandscape();
  });
});
document.querySelector('#nvm-landscape-reset')?.addEventListener('click', () => {
  landscapeSearch.value = '';
  landscapeFamily.value = '';
  filterLandscape();
  landscapeSearch.focus();
});
filterLandscape();

const sourceSearch = document.querySelector('#nvm-source-search');
function filterSources() {
  const query = sourceSearch.value.normalize('NFKC').toLocaleLowerCase().trim();
  let count = 0;
  document.querySelectorAll('[data-source-record]').forEach(item => {
    item.hidden = Boolean(query) && !item.textContent.normalize('NFKC').toLocaleLowerCase().includes(query);
    if (!item.hidden) count++;
  });
  document.querySelector('#nvm-source-count').textContent = isEnglish() ? `Showing ${count} source records` : `顯示 ${count} 筆來源`;
  const empty=document.querySelector('#nvm-source-empty');
  if(empty)empty.hidden=count!==0;
}
sourceSearch?.addEventListener('input', filterSources);
document.querySelector('#nvm-source-reset')?.addEventListener('click',()=>{
  sourceSearch.value='';filterSources();sourceSearch.focus();
});

// 來源的深層連結需優先顯示目標，避免先前的搜尋條件隱藏它。
window.addEventListener('hashchange', () => {
  const id = location.hash.slice(1);
  if (id.startsWith('source-') && sourceSearch.value) {
    sourceSearch.value = '';
    sourceSearch.dispatchEvent(new Event('input'));
    showRoute({ focus: true });
  }
});

// 保留可縮放向量與完整圖例；手機可在大圖中水平移動檢視材料接點。
const diagramDialog = document.createElement('dialog');
diagramDialog.className = 'bc-zoom-dialog';
diagramDialog.setAttribute('aria-labelledby', 'bc-zoom-title');
diagramDialog.innerHTML = `<div class="bc-zoom-heading"><h2 id="bc-zoom-title"></h2><button type="button" aria-label="${isEnglish() ? 'Close enlarged diagram' : '關閉放大元件圖'}">×</button></div><div class="bc-zoom-canvas"><p class="bc-pan-hint">${isEnglish() ? 'Drag or scroll sideways to inspect the complete diagram.' : '左右拖曳或水平捲動，查看完整元件圖。'}</p><div class="bc-zoom-scroll" tabindex="0" aria-label="${isEnglish() ? 'Enlarged diagram; scroll horizontally' : '放大元件圖，可水平捲動'}"></div><div class="bc-zoom-notes"></div></div>`;
document.body.append(diagramDialog);
const diagramCanvas = diagramDialog.querySelector('.bc-zoom-canvas');
diagramDialog.querySelector('button').addEventListener('click', () => diagramDialog.close());
diagramDialog.addEventListener('click', event => { if (event.target === diagramDialog) diagramDialog.close(); });

window.addEventListener('hub:language-change', () => {
  filterHistoricalMetrics();
  filterReference('patent');
  filterReference('glossary');
  filterTopics();
  filterLandscape();
  filterSources();
  diagramDialog.querySelector('.bc-zoom-heading button')?.setAttribute('aria-label', isEnglish() ? 'Close enlarged diagram' : '關閉放大元件圖');
  const panHint = diagramDialog.querySelector('.bc-pan-hint');
  if (panHint) panHint.textContent = isEnglish() ? 'Drag or scroll sideways to inspect the complete diagram.' : '左右拖曳或水平捲動，查看完整元件圖。';
  diagramDialog.querySelector('.bc-zoom-scroll')?.setAttribute('aria-label', isEnglish() ? 'Enlarged diagram; scroll horizontally' : '放大元件圖，可水平捲動');
});

document.querySelectorAll('[data-zoom-diagram]').forEach(button => {
  button.addEventListener('click', async () => {
    const figure = button.closest('.nvm-cell');
    if (!await ensureDiagrams(figure)) return;
    if (!figure.querySelector('svg')) return;
    const svg = figure.querySelector('svg').cloneNode(true);
    const ids = new Map([...svg.querySelectorAll('[id]')].map(element => [element.id, `${element.id}--zoom`]));
    for (const element of [svg, ...svg.querySelectorAll('*')]) {
      if (ids.has(element.id)) element.id = ids.get(element.id);
      for (const attribute of [...element.attributes]) {
        let value = attribute.value;
        for (const [oldId,newId] of ids) value = value.replaceAll(`url(#${oldId})`, `url(#${newId})`);
        if (['aria-labelledby','aria-describedby'].includes(attribute.name)) value = value.split(' ').map(id => ids.get(id) || id).join(' ');
        if (value !== attribute.value) element.setAttribute(attribute.name, value);
      }
    }
    diagramDialog.querySelector('h2').textContent = figure.querySelector('.bc-figure-head>span')?.textContent || '';
    const scroller = diagramCanvas.querySelector('.bc-zoom-scroll');
    scroller.replaceChildren(svg);
    const legend = figure.querySelector('.bc-legend');
    const mechanism = figure.querySelector('.bc-mechanism');
    const notesChildren = [];
    if (legend) notesChildren.push(legend.cloneNode(true));
    if (mechanism) notesChildren.push(mechanism.cloneNode(true));
    diagramCanvas.querySelector('.bc-zoom-notes').replaceChildren(...notesChildren);
    // Preserve the actual opener for native focus restoration, including pointer activation in WebKit.
    button.focus({preventScroll:true});
    diagramDialog.showModal();
    diagramCanvas.scrollTop = 0;
    scroller.scrollLeft = Math.max(0, (scroller.scrollWidth-scroller.clientWidth)/2);
  });
});
