document.documentElement.classList.add('nvm-enhanced');
const panels = [...document.querySelectorAll('[data-nvm-panel]')];
const contents = document.querySelector('.nvm-sidebar');
const contentsButton = document.querySelector('#nvm-contents-toggle');
const baseTitle = document.title;
const isEnglish = () => (window.HubLanguage?.get() || document.documentElement.lang) === 'en';
document.addEventListener('keydown', event => {
  if (['Tab','Enter',' ','ArrowUp','ArrowDown','Home','End'].includes(event.key)) document.documentElement.classList.add('nvm-keyboard-navigation');
});
document.addEventListener('pointerdown', () => document.documentElement.classList.remove('nvm-keyboard-navigation'));
const pageHeader = document.querySelector('.nvm-header');
const measureHeader = () => document.documentElement.style.setProperty('--nvm-anchor-top', `${(pageHeader?.getBoundingClientRect().height || 76) + 24}px`);
if (pageHeader) new ResizeObserver(measureHeader).observe(pageHeader);
measureHeader();

function showRoute({ focus = false } = {}) {
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
  if (target === 'main-content') {
    const current = panels.find(item => !item.hidden) || panels[0];
    panels.forEach(item => { item.hidden = item !== current; });
    const heading = current.querySelector('h2');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: 'start' });
    return;
  }
  const panel = anchor?.matches('[data-nvm-panel]') ? anchor : anchor?.closest('[data-nvm-panel]');
  const next = panel || document.getElementById('panorama');
  panels.forEach(item => { item.hidden = item !== next; });
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
  document.title = next.id === 'panorama' ? baseTitle : `${next.querySelector('h2')?.textContent || (isEnglish() ? 'NVM Study' : 'NVM 專題')} · NVM Knowledge Hub`;
  contents.classList.remove('open');
  contentsButton.setAttribute('aria-expanded', 'false');
  for (let disclosure = anchor?.closest('details'); disclosure; disclosure = disclosure.parentElement?.closest('details')) disclosure.open = true;
  if (focus) {
    const destination = anchor || next;
    const heading = destination.matches('[data-nvm-panel]') ? destination.querySelector('h2') : destination.matches('.nvm-research-study,.nvm-benchmark-study,.nvm-topic-section,.nvm-ip-group,.nvm-system-section,.nvm-system-end,.nvm-history-editorial,.nvm-corrections,.nvm-lineage-entry,[data-foundry-year]') ? destination.querySelector('h3') : destination.matches('[data-foundry],.nvm-correction,.nvm-lineage-events-block,.nvm-lineage-current,.nvm-lineage-boundary') ? destination.querySelector('h4') : destination.matches('.nvm-lineage-event') ? destination.querySelector('h5') : destination.matches('.nvm-system-index,.nvm-lineage-index') ? destination.querySelector('a') : destination.matches('[data-source-record],[data-patent-record],.nvm-history-disclosure') ? destination.querySelector('summary') : destination.matches('[data-glossary-record]') ? destination.querySelector('dt') : destination;
    heading?.setAttribute('tabindex', '-1');
    if (heading?.matches('h2,h3,h4,h5')) heading.dataset.routeHeading = '';
    heading?.focus({ preventScroll: true });
    destination.scrollIntoView({ block: 'start' });
  }
}

contentsButton.addEventListener('click', () => {
  const open = contents.classList.toggle('open');
  contentsButton.setAttribute('aria-expanded', String(open));
});

contents.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (link && link.hash === location.hash) {
    event.preventDefault();
    showRoute({ focus: true });
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && contents.classList.contains('open')) {
    contents.classList.remove('open');
    contentsButton.setAttribute('aria-expanded', 'false');
    contentsButton.focus();
  }
});
window.addEventListener('hashchange', () => showRoute({ focus: true }));

document.querySelectorAll('[data-operation-widget]').forEach(widget => {
  const completeCycle = widget.hasAttribute('data-complete-cycle');
  widget.querySelectorAll('[data-operation-detail]').forEach((item, index) => { item.hidden = !completeCycle && index > 0; });
  widget.querySelectorAll('[data-operation-select]').forEach(button => {
    button.addEventListener('click', () => {
      widget.querySelectorAll('[data-operation-select]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      widget.querySelectorAll('[data-operation-detail]').forEach(item => { item.hidden = !completeCycle && item.dataset.operationDetail !== button.dataset.operationSelect; });
      history.replaceState(null,'',`#${button.getAttribute('aria-controls')}`);
      if (completeCycle) {
        const destination = document.getElementById(button.getAttribute('aria-controls'));
        destination.setAttribute('tabindex', '-1');
        destination.focus({preventScroll:true});
        destination.scrollIntoView({block:'start'});
      }
    });
  });
});
showRoute({ focus: Boolean(location.hash) });

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
    const match = (!query || row.dataset.search.normalize('NFKC').toLocaleLowerCase().includes(query)) && (!family || row.dataset.family === family) && (!stage || row.dataset.stage === stage);
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
    row.hidden = Boolean(query && !row.dataset.search.normalize('NFKC').toLocaleLowerCase().includes(query)) || Boolean(landscapeFamily.value && row.dataset.family !== landscapeFamily.value);
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
  button.addEventListener('click', () => {
    const figure = button.closest('.nvm-cell');
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
    diagramDialog.showModal();
    diagramCanvas.scrollTop = 0;
    scroller.scrollLeft = Math.max(0, (scroller.scrollWidth-scroller.clientWidth)/2);
  });
});
