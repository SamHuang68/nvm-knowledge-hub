/* Native enhancement only: the static ledger remains the evidence/search source. */
(() => {
  const hub = window.HubEvidence;
  const workbench = document.querySelector('#evidenceWorkbench');
  if (!hub || !workbench) return;
  const cards = [...document.querySelectorAll('.source-card')];
  const chips = document.querySelector('#evidenceChips');
  const clear = document.querySelector('#clearEvidence');
  if (!clear) return;
  workbench.querySelector('.evidence-actions').prepend(clear);
  const exportButton = document.querySelector('#evidenceExport');
  const status = document.querySelector('#evidenceWorkbenchStatus');
  const indexSection = document.querySelector('#evidenceIndexSection');
  const indexWrap = document.querySelector('#evidenceIndexWrap');
  const index = document.querySelector('#evidenceIndex');
  const hint = document.querySelector('#evidenceSortHint');
  const search = document.querySelector('#evidenceSearch');
  const types = ['all', 'paper', 'patent', 'vendor', 'case'];
  let sort = 'id';
  let direction = 'asc';
  let applyingUrl = false;
  let printSnapshot = null;
  const typeLabels = {
    en: { all: 'All sources', paper: 'Papers', patent: 'Patents', vendor: 'Vendor / official sources', case: 'Official cases' },
    zh: { all: '全部來源', paper: '論文', patent: '專利', vendor: '供應商／官方來源', case: '官方案例' }
  };
  const copy = {
    en: { active: 'Active evidence filters', removeType: 'Remove source type filter', removeQuery: 'Remove search filter', query: 'Search', clear: 'Clear all filters', export: 'Export full results (HTML)', id: 'Record ID', year: 'Source year', title: 'Open full record', ascending: 'ascending', descending: 'descending', unknown: 'Not stated', source: 'Sources and reading notes', note: 'Source links support the scope stated above. Metadata sorting is for navigation, not an evidence-quality score; unspecified dates remain unknown. Keep the original units and conditions when citing a record.', choose: 'Choose one source type to sort comparable record metadata. Full claims, original units and conclusion limits remain in the cards below.', same: 'Sort this source type by ID or stated source year. Date ranges and unstated years stay last in either direction; checked dates are not publication dates.', index: 'Record index', removed: 'Filter removed.', cleared: 'All filters cleared.', matches: 'records match.', exported: 'Full result text exported, including source links and conclusion limits.', empty: 'No records match this source type and search.' },
    zh: { active: '使用中的證據條件', removeType: '移除來源類型條件', removeQuery: '移除搜尋條件', query: '搜尋', clear: '清除所有條件', export: '匯出完整結果（HTML）', id: '紀錄編號', year: '來源年份', title: '開啟完整紀錄', ascending: '遞增', descending: '遞減', unknown: '未列明', source: '來源與閱讀說明', note: '來源連結的支持範圍以上方敘述為準。中繼資料排序僅供導覽，不是證據品質評分；未列日期仍屬未知。引用時請保留原始單位與條件。', choose: '選擇單一來源類型後，可依同類紀錄的中繼資料排序。完整主張、原始單位與結論限制仍列於下方卡片。', same: '同類紀錄可依編號或已列明來源年份排序。日期區間與未知年份在兩個方向都排最後；查閱日期不當作出版日期。', index: '紀錄索引', removed: '已移除條件。', cleared: '已清除所有條件。', matches: '筆符合條件。', exported: '已匯出結果全文，包含來源連結與結論限制。', empty: '此來源類型與搜尋沒有符合的紀錄。' }
  };
  const language = () => hub.getState().language === 'zh' ? 'zh' : 'en';
  const strings = () => copy[language()];
  const metadata = new Map(cards.map(card => {
    const element = card.querySelector('.source-meta');
    const text = (element?.querySelector('[data-lang="en"]') || element)?.textContent.trim() || '';
    const first = text.split('·')[0].trim();
    const single = first.match(/^((?:19|20)\d{2})(?:[-/]\d{2}(?:[-/]\d{2})?)?$/u);
    const range = first.match(/^(?:19|20)\d{2}\s*[–—-]\s*(?:19|20)\d{2}$/u);
    return [card, { id: card.querySelector('.source-index b').textContent.trim(), year: single ? Number(single[1]) : null, yearLabel: single || range ? first : null }];
  }));

  // Only supporting links and a secondary reading note collapse. Claim, evidence
  // class, SUPPORTS and DOES NOT PROVE remain directly visible outside details.
  for (const card of cards) {
    const content = card.querySelector('.source-content');
    const links = [...content.children].filter(child => child.matches('a'));
    if (!links.length) continue;
    const details = document.createElement('details');
    details.className = 'evidence-source-details';
    const summary = document.createElement('summary');
    const note = document.createElement('p');
    note.className = 'evidence-reading-note';
    details.append(summary, ...links, note);
    content.append(details);
  }

  const visibleCards = () => cards.filter(card => !card.hidden);
  function sortedCards() {
    if (hub.getState().type === 'all') return visibleCards();
    return visibleCards().sort((left, right) => {
      const a = metadata.get(left), b = metadata.get(right);
      const id = a.id.localeCompare(b.id, 'en', { numeric: true });
      if (sort === 'id') return direction === 'asc' ? id : -id;
      if (a.year === null || b.year === null) return a.year === b.year ? id : a.year === null ? 1 : -1;
      return (direction === 'asc' ? a.year - b.year : b.year - a.year) || id;
    });
  }
  function syncUrl() {
    if (applyingUrl || printSnapshot) return;
    const state = hub.getState();
    const url = new URL(location.href);
    for (const [key, value, fallback] of [['type', state.type, 'all'], ['q', state.query, ''], ['sort', sort, 'id'], ['dir', direction, 'asc']]) {
      if (value === fallback) url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    }
    if (url.href !== location.href) history.replaceState(history.state, '', url);
  }
  function announce(text) {
    status.textContent = `${text} ${visibleCards().length} ${strings().matches}`;
  }
  function update() {
    if (printSnapshot) return;
    status.textContent = '';
    const state = hub.getState();
    const lang = language(), text = strings();
    chips.setAttribute('aria-label', text.active);
    for (const name of ['type', 'query']) {
      const button = chips.querySelector(`[data-remove-filter="${name}"]`);
      const value = name === 'type' ? state.type !== 'all' ? typeLabels[lang][state.type] : '' : state.query.trim();
      button.hidden = !value;
      button.textContent = `${name === 'query' ? `${text.query}: ` : ''}${value} ×`;
      button.setAttribute('aria-label', `${name === 'type' ? text.removeType : text.removeQuery}: ${value}`);
    }
    clear.hidden = state.type === 'all' && !state.query.trim();
    clear.textContent = text.clear;
    exportButton.textContent = text.export;
    exportButton.disabled = visibleCards().length === 0;
    const oneType = state.type !== 'all';
    hint.textContent = oneType ? text.same : text.choose;
    indexWrap.hidden = !oneType;
    indexWrap.setAttribute('aria-label', `${typeLabels[lang][state.type]} — ${text.index}`);
    index.querySelector('caption').textContent = `${typeLabels[lang][state.type]} — ${text.index} (${visibleCards().length})`;
    index.querySelector('[data-column="title"]').textContent = text.title;
    for (const th of index.querySelectorAll('th[data-sort]')) {
      const field = th.dataset.sort;
      const current = field === sort;
      th.setAttribute('aria-sort', current ? direction === 'asc' ? 'ascending' : 'descending' : 'none');
      const button = th.querySelector('button');
      button.textContent = `${text[field]} ${current ? direction === 'asc' ? '↑' : '↓' : '↕'}`;
      const next = current && direction === 'asc' ? text.descending : text.ascending;
      const now = current ? direction === 'asc' ? text.ascending : text.descending : lang === 'en' ? 'not sorted' : '未排序';
      button.setAttribute('aria-label', lang === 'en' ? `${text[field]}, currently ${now}. Sort ${next}` : `${text[field]}，目前${now}；改為${next}排序`);
    }
    const body = index.querySelector('tbody');
    body.replaceChildren();
    if (oneType) {
      for (const card of sortedCards()) {
        const item = metadata.get(card);
        const row = document.createElement('tr');
        row.dataset.recordId = item.id;
        row.dataset.year = item.year ?? '';
        const id = document.createElement('td'); id.textContent = item.id;
        const year = document.createElement('td'); year.textContent = item.yearLabel || text.unknown;
        const title = document.createElement('td');
        const link = document.createElement('a');
        link.href = `#${card.id}`;
        const heading = card.querySelector('h3');
        link.textContent = (heading.querySelector(`[data-lang="${lang}"]`) || heading).textContent.trim();
        title.append(link); row.append(id, year, title); body.append(row);
      }
      if (!body.children.length) {
        const row = document.createElement('tr'), cell = document.createElement('td');
        cell.colSpan = 3; cell.textContent = text.empty; row.append(cell); body.append(row);
      }
    }
    for (const details of document.querySelectorAll('.evidence-source-details')) {
      details.querySelector('summary').textContent = text.source;
      details.querySelector('.evidence-reading-note').textContent = text.note;
    }
    syncUrl();
  }
  function restoreUrl() {
    const params = new URL(location.href).searchParams;
    sort = params.get('sort') === 'year' ? 'year' : 'id';
    direction = params.get('dir') === 'desc' ? 'desc' : 'asc';
    applyingUrl = true;
    hub.setState({ type: types.includes(params.get('type')) ? params.get('type') : 'all', query: params.get('q') || '' });
    applyingUrl = false;
    hub.revealAnchor();
    syncUrl();
  }
  chips.addEventListener('click', event => {
    const button = event.target.closest('[data-remove-filter]');
    if (!button) return;
    hub.setState(button.dataset.removeFilter === 'type' ? { type: 'all' } : { query: '' });
    announce(strings().removed);
    (chips.querySelector('button:not([hidden])') || search).focus();
  });
  clear.addEventListener('click', () => {
    announce(strings().cleared); search.focus();
  });
  index.addEventListener('click', event => {
    const button = event.target.closest('[data-evidence-sort]');
    if (button) {
      const next = button.dataset.evidenceSort;
      direction = sort === next && direction === 'asc' ? 'desc' : 'asc'; sort = next;
      update();
      const text = strings(); announce(`${text[sort]}: ${direction === 'asc' ? text.ascending : text.descending}.`);
    }
    const link = event.target.closest('a[href^="#"]');
    if (link && link.hash === location.hash) hub.revealAnchor();
  });
  window.addEventListener('hub:evidence-render', update);
  window.addEventListener('hub:evidence-anchor', event => {
    document.getElementById(event.detail.id)?.querySelectorAll('.evidence-source-details').forEach(details => { details.open = true; });
  });
  window.addEventListener('popstate', restoreUrl);
  window.addEventListener('hub:language-change', () => { status.textContent = ''; update(); });
  window.addEventListener('beforeprint', () => {
    if (printSnapshot) return;
    printSnapshot = { cards: cards.map(card => [card, card.hidden]), details: [...document.querySelectorAll('.evidence-source-details')].map(details => [details, details.open]) };
    cards.forEach(card => { card.hidden = false; });
    printSnapshot.details.forEach(([details]) => { details.open = true; });
  });
  window.addEventListener('afterprint', () => {
    if (!printSnapshot) return;
    printSnapshot.cards.forEach(([card, hidden]) => { card.hidden = hidden; });
    printSnapshot.details.forEach(([details, open]) => { details.open = open; });
    printSnapshot = null;
  });
  exportButton.addEventListener('click', () => {
    const exported = document.implementation.createHTMLDocument(language() === 'zh' ? '證據總帳完整結果' : 'Evidence ledger — full results');
    exported.documentElement.lang = language() === 'zh' ? 'zh-Hant' : 'en';
    const charset = exported.createElement('meta'); charset.setAttribute('charset', 'utf-8'); exported.head.prepend(charset);
    const style = exported.createElement('style');
    style.textContent = 'body{max-width:960px;margin:2rem auto;padding:0 1rem;font:16px/1.7 system-ui;color:#173d4b}article{border-top:1px solid #ccd;padding:1rem 0;break-inside:avoid}h3{font-size:1.2rem}a{overflow-wrap:anywhere}[data-lang]{display:block}details>summary{font-weight:bold}';
    exported.head.append(style);
    const heading = exported.createElement('h1'); heading.textContent = exported.title;
    const description = exported.createElement('p');
    const orderNote = hub.getState().type === 'all'
      ? language() === 'zh' ? '保留原總帳順序；每筆紀錄包含完整原文、來源及結論限制。' : 'Original ledger order is preserved, with full record text, sources and conclusion limits.'
      : strings().same;
    description.textContent = `${visibleCards().length} ${strings().matches} ${orderNote}`;
    const source = exported.createElement('a'); source.href = location.href; source.textContent = location.href;
    exported.body.append(heading, description, source);
    for (const card of sortedCards()) {
      const clone = card.cloneNode(true); clone.hidden = false; clone.removeAttribute('tabindex');
      clone.querySelectorAll('details').forEach(details => { details.open = true; });
      exported.body.append(exported.importNode(clone, true));
    }
    const url = URL.createObjectURL(new Blob(['<!doctype html>\n', exported.documentElement.outerHTML], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'nvm-evidence-results.html'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    announce(strings().exported);
  });
  workbench.hidden = false;
  indexSection.hidden = false;
  restoreUrl();
})();
