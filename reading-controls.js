/* Selected reading interactions from the N02–N12 candidate, on current content. */
(() => {
  const say = (zh, en) => window.HubLanguage?.get() === 'zh' ? zh : en;
  const controls = document.createElement('div');
  controls.className = 'reading-controls';
  const label = document.createElement('label');
  const labelText = document.createElement('span');
  const jump = document.createElement('select');
  jump.append(new Option('', ''));
  label.append(labelText, jump);
  const action = document.createElement('button');
  action.type = 'button';
  controls.append(label, action);

  const search = document.getElementById('evidenceSearch');
  if (search) {
    jump.id = 'evidenceJump';
    action.id = 'clearEvidence';
    const cards = [...document.querySelectorAll('#sourceGrid > .source-card')];
    cards.forEach(card => jump.append(new Option(card.id.replace('evidence-', ''), card.id)));
    document.querySelector('.evidence-toolbar').after(controls);
    action.addEventListener('click', () => {
      search.value = '';
      search.dispatchEvent(new Event('input', {bubbles: true}));
      document.querySelector('#evidenceFilters [data-type="all"]').click();
      search.focus();
    });
    jump.addEventListener('change', () => {
      if (!jump.value) return;
      if (location.hash === '#' + jump.value) window.dispatchEvent(new Event('hub:reveal-anchor'));
      else location.hash = jump.value;
    });
    const syncHash = () => { jump.value = cards.some(card => '#' + card.id === location.hash) ? location.hash.slice(1) : ''; };
    const sync = () => {
      labelText.textContent = say('依紀錄編號跳轉', 'Jump to a Record');
      jump.options[0].textContent = say('選擇紀錄編號', 'Choose a record');
      action.textContent = say('清除全部篩選', 'Clear All Filters');
      syncHash();
    };
    window.addEventListener('hashchange', syncHash);
    window.addEventListener('hub:language-change', sync);
    sync();
    return;
  }

  const cards = [...document.querySelectorAll('.slide-card')];
  const filters = [...document.querySelectorAll('.filter-btn')];
  if (!cards.length) return;
  jump.id = 'slideJump';
  action.id = 'toggleNotes';
  const status = document.createElement('p');
  status.id = 'filterStatus';
  status.setAttribute('role', 'status');
  controls.append(status);
  document.querySelector('.briefing-filter-bar').after(controls);
  cards.forEach(card => { card.tabIndex = -1; jump.append(new Option('', card.id)); });
  let notesVisible = true;
  function sync() {
    labelText.textContent = say('依頁次跳轉', 'Jump to a Slide');
    jump.options[0].textContent = say('選擇導讀頁', 'Choose a reading card');
    cards.forEach((card, index) => {
      const title = card.querySelector(`h3 [data-lang="${window.HubLanguage?.get() === 'zh' ? 'zh' : 'en'}"]`);
      jump.options[index + 1].textContent = `${String(index + 1).padStart(2, '0')} · ${title.textContent.trim()}`;
    });
    const count = cards.filter(card => !card.hidden).length;
    status.textContent = say(`顯示 ${count}／${cards.length} 頁`, `Showing ${count} of ${cards.length} slides`);
    action.textContent = notesVisible ? say('收起全部講稿', 'Hide All Notes') : say('展開全部講稿', 'Show All Notes');
    action.setAttribute('aria-pressed', String(notesVisible));
  }
  function filter(value) {
    filters.forEach(button => { const active = button.dataset.filter === value; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    cards.forEach(card => { card.hidden = value !== 'all' && card.dataset.filterGroup !== value; card.classList.toggle('hidden', card.hidden); });
    sync();
  }
  filters.forEach(button => button.addEventListener('click', () => filter(button.dataset.filter)));
  action.addEventListener('click', () => {
    notesVisible = !notesVisible;
    document.querySelectorAll('.slide-notes').forEach(notes => { notes.hidden = !notesVisible; });
    sync();
  });
  function visit() {
    const card = cards.find(item => '#' + item.id === location.hash);
    if (!card) { jump.value = ''; return; }
    if (card.hidden) filter('all');
    jump.value = card.id;
    card.focus({preventScroll: true});
    card.scrollIntoView({block: 'start'});
  }
  jump.addEventListener('change', () => { if (jump.value) { if (location.hash === '#' + jump.value) visit(); else location.hash = jump.value; } });
  window.addEventListener('hashchange', visit);
  window.addEventListener('hub:language-change', sync);
  document.getElementById('btnPrintBriefing')?.addEventListener('click', () => window.print());
  filter('all');
  requestAnimationFrame(visit);
})();
