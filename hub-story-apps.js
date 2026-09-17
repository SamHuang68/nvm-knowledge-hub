(function () {
  'use strict';
  if (document.getElementById('hub-fail-closed')) return;
  const path = location.pathname;
  if (!/specialty-nvm\.html|ai-nvm-opportunities\.html/i.test(path)) return;
  const T = (en, zh) => '<span data-lang="en">' + en + '</span><span data-lang="zh">' + zh + '</span>';
  function langSync() { if (window.HubLanguage) window.HubLanguage.set(window.HubLanguage.get(), false); }
  const host = document.getElementById('main-content');
  if (!host) return;
  const box = document.createElement('section');
  box.id = 'hub-fail-closed';
  box.className = 'hub-story';
  const spec = /specialty-nvm\.html/i.test(path);
  const titleEn = spec ? 'Four use-classes, not one product Ready.' : 'Candidate fit is not a design win.';
  const titleZh = spec ? '四種用途，不是一張產品 Ready。' : '候選適配不是 design win。';
  const states = spec ? [
    { n: '01', en: 'Name the use', zh: '先點用途', hintEn: 'Trim · HV · repair · e-ink', hintZh: '修調 · 高壓 · 修復 · 電子紙', bodyEn: 'Analog trim, HV display, matrix repair and e-ink drivers are separate constraints.', bodyZh: '類比修調、高壓顯示、矩陣修復與電子紙驅動是四種約束，不是同一張合格證。' },
    { n: '02', en: 'Bind the node', zh: '綁定節點', hintEn: 'Process + document', hintZh: '製程 + 文件', bodyEn: 'Mask adder, height and retention stay with the cited specialty node.', bodyZh: '光罩加價、高度與留存必須跟著被引用的特種節點。' },
    { n: '03', en: 'Vocabulary only', zh: '只是語彙', hintEn: 'Not READY cert', hintZh: '不是 READY 認證', bodyEn: 'Grade / ASIL words on this page are vocabulary. They are not a shipped certification.', bodyZh: '本頁的 Grade／ASIL 字樣是語彙，不是已出貨認證。' }
  ] : [
    { n: '01', en: 'Candidate fit', zh: '候選適配', hintEn: 'Where NVM can sit', hintZh: 'NVM 可以放哪', bodyEn: 'The page names places a persistent state may belong. That is a candidate, not a win.', bodyZh: '本頁標出持久狀態可能出現的位置。那是候選，不是得標。' },
    { n: '02', en: 'Limitation', zh: '限制', hintEn: 'Where it does not belong', hintZh: '哪裡不該放', bodyEn: 'NVM does not belong everywhere in an AI system. Endurance, latency and node cliff still bind.', bodyZh: 'NVM 不是 AI 系統的萬用件。耐久、延遲與節點斷崖仍在。' },
    { n: '03', en: 'Stop at the gate', zh: '停在閘門', hintEn: 'No royalty claim', hintZh: '不出貨主張', bodyEn: 'Design win, shipment and royalty stay off this public hub.', bodyZh: 'design win、出貨與權利金不屬於本公開中心。' }
  ];
  box.innerHTML = '<p class="hub-story-kicker">' + T('FAIL CLOSED', '失敗即關閉') + '</p><h3>' + T(titleEn, titleZh) + '</h3><p class="hub-story-lead">' + T('Named-condition figures do not upgrade themselves into a certification.', '具名條件下的數字，不會自行升級成認證。') + '</p>';
  const nav = document.createElement('div');
  nav.className = 'hub-story-steps';
  const note = document.createElement('p');
  note.className = 'hub-story-note';
  states.forEach(function (s, i) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hub-story-step' + (i === 0 ? ' is-on' : '');
    b.innerHTML = '<span class="n">' + s.n + '</span><strong>' + T(s.en, s.zh) + '</strong><small>' + T(s.hintEn, s.hintZh) + '</small>';
    b.addEventListener('click', function () {
      nav.querySelectorAll('.hub-story-step').forEach(function (el) { el.classList.toggle('is-on', el === b); });
      note.innerHTML = T(s.bodyEn, s.bodyZh);
      langSync();
    });
    nav.appendChild(b);
  });
  note.innerHTML = T(states[0].bodyEn, states[0].bodyZh);
  box.appendChild(nav);
  box.appendChild(note);
  const hero = document.querySelector('h1');
  if (hero && hero.parentElement) hero.parentElement.insertAdjacentElement('afterend', box);
  else host.insertAdjacentElement('afterbegin', box);
  langSync();
})();
