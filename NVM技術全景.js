document.documentElement.classList.add('nvm-enhanced');
const panels = [...document.querySelectorAll('[data-nvm-panel]')];
const contents = document.querySelector('.nvm-sidebar');
const contentsButton = document.querySelector('#nvm-contents-toggle');
const baseTitle = document.title;
const isEnglish = document.documentElement.lang === 'en';

function showRoute({ focus = false } = {}) {
  let target;
  try { target = decodeURIComponent(location.hash.slice(1)) || 'panorama'; } catch { target = 'panorama'; }
  const anchor = document.getElementById(target);
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
    widget.querySelectorAll('[data-operation-detail]').forEach(item => { item.hidden = item !== operation; });
    widget.querySelectorAll('[data-operation-select]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.operationSelect===operation.dataset.operationDetail)));
  }
  document.querySelectorAll('.nvm-sidebar a').forEach(link => {
    if (link.hash === `#${next.id}`) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = next.id === 'panorama' ? baseTitle : `${next.querySelector('h2')?.textContent || (isEnglish ? 'NVM Study' : 'NVM 專題')} · NVM Knowledge Hub`;
  contents.classList.remove('open');
  contentsButton.setAttribute('aria-expanded', 'false');
  if (anchor?.closest('details')) anchor.closest('details').open = true;
  if (focus) {
    const destination = anchor || next;
    const heading = destination.matches('[data-nvm-panel]') ? destination.querySelector('h2') : destination;
    heading?.setAttribute('tabindex', '-1');
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
  widget.querySelectorAll('[data-operation-detail]').forEach((item, index) => { item.hidden = index > 0; });
  widget.querySelectorAll('[data-operation-select]').forEach(button => {
    button.addEventListener('click', () => {
      widget.querySelectorAll('[data-operation-select]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      widget.querySelectorAll('[data-operation-detail]').forEach(item => { item.hidden = item.dataset.operationDetail !== button.dataset.operationSelect; });
      history.replaceState(null,'',`#${button.getAttribute('aria-controls')}`);
    });
  });
});
showRoute({ focus: Boolean(location.hash) });

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
  document.querySelector('#nvm-count').textContent = isEnglish ? `Showing ${count} of ${rows.length} technology studies` : `顯示 ${count}／${rows.length} 個技術專題`;
  document.querySelector('#nvm-empty').hidden = count > 0;
}
filters.forEach(input => input.addEventListener(input.tagName === 'INPUT' ? 'input' : 'change', filterTopics));
document.querySelector('#nvm-reset').addEventListener('click', () => { filters.forEach(input => { input.value = ''; }); filterTopics(); document.querySelector('#nvm-search').focus(); });
filterTopics();

const foundryFilter = document.querySelector('#nvm-foundry-filter');
foundryFilter?.addEventListener('change', () => {
  document.querySelectorAll('[data-foundry]').forEach(item => { item.hidden = Boolean(foundryFilter.value) && item.dataset.foundry !== foundryFilter.value; });
});

const sourceSearch = document.querySelector('#nvm-source-search');
sourceSearch?.addEventListener('input', () => {
  const query = sourceSearch.value.normalize('NFKC').toLocaleLowerCase().trim();
  let count = 0;
  document.querySelectorAll('[data-source-record]').forEach(item => {
    item.hidden = Boolean(query) && !item.textContent.normalize('NFKC').toLocaleLowerCase().includes(query);
    if (!item.hidden) count++;
  });
  document.querySelector('#nvm-source-count').textContent = isEnglish ? `Showing ${count} source records` : `顯示 ${count} 筆來源`;
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
diagramDialog.innerHTML = `<div class="bc-zoom-heading"><h2 id="bc-zoom-title"></h2><button type="button" aria-label="${isEnglish ? 'Close enlarged diagram' : '關閉放大元件圖'}">×</button></div><div class="bc-zoom-canvas"><p class="bc-pan-hint">${isEnglish ? 'Drag or scroll sideways to inspect the complete diagram.' : '左右拖曳或水平捲動，查看完整元件圖。'}</p><div class="bc-zoom-scroll" tabindex="0" aria-label="${isEnglish ? 'Enlarged diagram; scroll horizontally' : '放大元件圖，可水平捲動'}"></div><div class="bc-zoom-notes"></div></div>`;
document.body.append(diagramDialog);
const diagramCanvas = diagramDialog.querySelector('.bc-zoom-canvas');
diagramDialog.querySelector('button').addEventListener('click', () => diagramDialog.close());
diagramDialog.addEventListener('click', event => { if (event.target === diagramDialog) diagramDialog.close(); });
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
    diagramDialog.querySelector('h2').textContent = figure.querySelector('.bc-figure-head>span').textContent;
    const scroller = diagramCanvas.querySelector('.bc-zoom-scroll');
    scroller.replaceChildren(svg);
    diagramCanvas.querySelector('.bc-zoom-notes').replaceChildren(figure.querySelector('.bc-legend').cloneNode(true), figure.querySelector('.bc-mechanism').cloneNode(true));
    diagramDialog.showModal();
    diagramCanvas.scrollTop = 0;
    scroller.scrollLeft = Math.max(0, (scroller.scrollWidth-scroller.clientWidth)/2);
  });
});
