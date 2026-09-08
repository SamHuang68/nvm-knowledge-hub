/* 搜尋直接讀取公開總帳，避免維護另一份紀錄清單。 */
(() => {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const status = document.getElementById('searchStatus');
  const trigger = document.getElementById('searchTrigger');
  const close = document.getElementById('searchClose');
  if (!overlay || !input || !results) return;
  const index = [...SEARCH_INDEX];
  const labels = {
    zh: {
      topic: '深入主題', ledger: '證據總帳',
      count: (hits, records) => `${hits} 筆結果 · ${SEARCH_INDEX.length} 個主題${records === null ? '' : `、${records} 筆總帳`}。↑ ↓ 選擇，Enter 開啟，Esc 關閉。`,
      empty: '找不到符合的結果，請試試技術名稱、紀錄編號或較短的關鍵字。',
      loading: ' 正在載入總帳…',
      failed: ' 總帳載入失敗；目前僅搜尋主題。重新開啟搜尋可重試。'
    },
    en: {
      topic: 'Explore topic', ledger: 'Evidence Ledger',
      count: (hits, records) => `${hits} results · ${SEARCH_INDEX.length} topics${records === null ? '' : `, ${records} ledger records`}. ↑ ↓ select, Enter open, Esc close.`,
      empty: 'No matching results. Try a technology name, record ID, or shorter keyword.',
      loading: ' Loading the evidence ledger…',
      failed: ' The ledger could not be loaded; topic search remains available. Reopen search to retry.'
    }
  };
  function syncInterfaceLabels() {
    const language = window.HubLanguage?.get() === 'zh' ? 'zh' : 'en';
    document.querySelectorAll('[data-aria-zh][data-aria-en]').forEach(element => {
      element.setAttribute('aria-label', element.dataset[language === 'zh' ? 'ariaZh' : 'ariaEn']);
    });
  }
  let loading = null, loaded = false, failed = false, previousFocus, previousOverflow;
  let background = [];
  const isOpen = () => overlay.classList.contains('is-open');
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  function near(a, b) {
    if (a.length < 4 || Math.abs(a.length-b.length) > 1) return false;
    let i=0, j=0, edits=0;
    while (i<a.length && j<b.length) {
      if (a[i]===b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (a.length >= b.length) i++;
      if (b.length >= a.length) j++;
    }
    return edits + (a.length-i) + (b.length-j) <= 1;
  }
  function score(item, query) {
    const title = normalize(`${item.title_zh} ${item.title_en} ${item.id || ''}`);
    const text = normalize(`${title} ${item.tags}`);
    if (!query) return 1;
    if (title.includes(query)) return 100;
    const words = text.split(' ');
    return query.split(' ').every(token => text.includes(token) || words.some(word => near(token, word))) ? 10 : 0;
  }
  function render() {
    const q = normalize(input.value);
    const items = index.map(item => ({item, score:score(item,q)})).filter(hit => hit.score).sort((a,b)=>b.score-a.score);
    results.replaceChildren();
    const language = window.HubLanguage?.get() === 'zh' ? 'zh' : 'en';
    const copy = labels[language];
    for (const {item} of items) {
      const link = document.createElement('a');
      link.className = 'search-result-item'; link.href = item.url;
      const title = document.createElement('div'); title.className = 'sr-title';
      title.textContent = language === 'zh' ? item.title_zh : item.title_en;
      const desc = document.createElement('div'); desc.className = 'sr-desc';
      const summary = item[`summary_${language}`] || '';
      desc.textContent = item.id ? `${copy.ledger} · ${item.id}${summary ? ` · ${summary}` : ''}` : copy.topic;
      link.append(title, desc); results.append(link);
    }
    status.textContent = items.length ? copy.count(items.length, loaded ? index.length-SEARCH_INDEX.length : null) : copy.empty;
    if (loading && !loaded) status.textContent += copy.loading;
    if (failed) status.textContent += copy.failed;
  }
  async function loadLedger() {
    if (loaded || loading) return loading;
    failed = false;
    loading = (async () => {
      try {
        const response = await fetch('memory-evidence.html', {signal: AbortSignal.timeout(10000)});
        if (!response.ok) throw new Error('總帳讀取失敗');
        const document = new DOMParser().parseFromString(await response.text(), 'text/html');
        const cards = [...document.querySelectorAll('.source-card')];
        if (!cards.length) throw new Error('總帳沒有可搜尋紀錄');
        const records = cards.map(card => {
          const id = card.querySelector('.source-index b').textContent.trim();
          if (card.id !== `evidence-${id}`) throw new Error('總帳缺少穩定錨點');
          const title = card.querySelector('h3').textContent.trim();
          const summary = card.querySelector('.source-content > p:not(.source-meta) [data-lang="zh"]')?.textContent.trim() || '';
          const summary_en = card.querySelector('.source-content > p:not(.source-meta) [data-lang="en"]')?.textContent.trim() || '';
          return {id, title_zh: title, title_en: title, summary, summary_zh: summary, summary_en, url:`memory-evidence.html#${card.id}`, tags:`${card.dataset.keywords} ${card.textContent}`};
        });
        index.push(...records); loaded = true;
      } catch { failed = true; }
      finally { loading = null; if (isOpen()) render(); }
    })();
    return loading;
  }
  function openSearch() {
    if (isOpen()) { input.focus(); return; }
    previousFocus = document.activeElement; previousOverflow = document.body.style.overflow;
    background = [...document.body.children].filter(element => element !== overlay && !['SCRIPT','STYLE'].includes(element.tagName)).map(element => [element,element.inert]);
    background.forEach(([element]) => {element.inert = true;});
    document.body.style.overflow = 'hidden';
    overlay.classList.add('is-open'); overlay.setAttribute('aria-hidden','false');
    trigger?.setAttribute('aria-expanded','true');
    input.value = ''; loadLedger(); render(); input.focus();
  }
  function closeSearch() {
    if (!isOpen()) return;
    overlay.classList.remove('is-open'); overlay.setAttribute('aria-hidden','true');
    trigger?.setAttribute('aria-expanded','false');
    document.body.style.overflow = previousOverflow;
    background.forEach(([element,inert]) => {element.inert = inert;});
    if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true});
  }
  trigger?.addEventListener('click',openSearch); close?.addEventListener('click',closeSearch);
  overlay.addEventListener('click',event => {if (event.target === overlay) closeSearch();});
  input.addEventListener('input',render);
  results.addEventListener('click',event => {if (event.target.closest('a')) closeSearch();});
  window.addEventListener('hub:language-change',() => {syncInterfaceLabels(); if (isOpen()) render();});
  const mac = /Mac|iPhone|iPad/.test(navigator.userAgentData?.platform || navigator.platform || navigator.userAgent);
  if (trigger?.querySelector('kbd')) trigger.querySelector('kbd').textContent = mac ? '⌘K' : 'Ctrl+K';
  trigger?.setAttribute('aria-keyshortcuts',mac ? 'Meta+K' : 'Control+K');
  document.addEventListener('keydown',event => {
    if (event.isComposing) return;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault(); openSearch(); return;
    }
    if (!isOpen()) return;
    if (event.key === 'Escape') {event.preventDefault(); closeSearch(); return;}
    const links = [...results.querySelectorAll('a')];
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!links.length) return;
      const current = links.indexOf(document.activeElement);
      const next = current < 0 ? (event.key === 'ArrowDown' ? 0 : links.length-1) : (current + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links[next].focus(); links[next].scrollIntoView({block:'nearest'}); return;
    }
    if (event.key === 'Enter' && document.activeElement === input && links.length) {event.preventDefault(); links[0].click();}
    if (event.key === 'Tab') {
      const focusable = [input, close, ...links].filter(Boolean);
      const current = focusable.indexOf(document.activeElement);
      if (event.shiftKey && current <= 0) {event.preventDefault(); focusable.at(-1).focus();}
      else if (!event.shiftKey && current === focusable.length-1) {event.preventDefault(); input.focus();}
    }
  });
  syncHubLanguage();
  syncInterfaceLabels();
  window.NVMHub = {syncLanguage:syncHubLanguage, searchIndex:index};
})();
