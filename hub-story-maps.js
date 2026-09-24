(function () {
  'use strict';
  function hubPagePath(pathname) {
    let path = pathname || '/';
    try { path = decodeURIComponent(path); } catch {}
    if (path.endsWith('/')) return path;
    if (/\.[a-z0-9]+$/i.test(path)) return path;
    return path + '.html';
  }
  const path = hubPagePath(location.pathname);
  const T = (en, zht) => `<span data-lang="en">${en}</span><span data-lang="zh">${zht}</span>`;
  function langSync() {
    if (window.HubLanguage) window.HubLanguage.set(window.HubLanguage.get(), false);
  }
  function storyShell(id, kickerEn, kickerZh, titleEn, titleZh, leadEn, leadZh) {
    const box = document.createElement('section');
    box.id = id;
    box.className = 'hub-story';
    box.innerHTML = `\n      <p class="hub-story-kicker">${T(kickerEn, kickerZh)}</p>\n      <h3>${T(titleEn, titleZh)}</h3>\n      <p class="hub-story-lead">${T(leadEn, leadZh)}</p>`;
    return box;
  }
  if (/technology-comparison\.html/i.test(path)) {
    const matrix = document.getElementById('sec-matrix');
    if (matrix) {
      const box = storyShell(
        'hub-decision-flow',
        'DECISION PATH · TABLE STAYS',
        '決策路徑 · 表格仍是證據',
        'Choose the constraint first, then read the matrix.',
        '先選約束，再讀矩陣。',
        'Five gates. Each gate lights the matching dimension row. Figures stay architecture-class ranges — not a datasheet.',
        '五道關卡。每一關只點亮對應維度列。數字仍是架構量級，不是 datasheet。'
      );
      const steps = [
        { n: '01', en: 'Need class', zh: '需求類型', hintEn: 'OTP · MTP · density', hintZh: '一次性／可重寫／密度', rows: ['7'] },
        { n: '02', en: 'Physics family', zh: '物理家族', hintEn: 'How it writes and holds', hintZh: '寫入與保持機制', rows: ['3', '4'] },
        { n: '03', en: 'Mask & thermal', zh: '光罩與熱預算', hintEn: 'Adders and retention class', hintZh: '加價道數與留存等級', rows: ['1', '5'] },
        { n: '04', en: 'Node cliff', zh: '節點斷崖', hintEn: 'Planar stop vs BEOL', hintZh: '平面止點對 BEOL', rows: ['8'] },
        { n: '05', en: 'VERIFY source', zh: '核對來源', hintEn: 'Named node and document', hintZh: '具名節點與文件版本', rows: ['9'] }
      ];
      const nav = document.createElement('div');
      nav.className = 'hub-story-steps';
      nav.setAttribute('role', 'tablist');
      steps.forEach((s, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'hub-story-step' + (i === 0 ? ' is-on' : '');
        b.setAttribute('aria-pressed', String(i === 0));
        b.innerHTML = `<span class="n">${s.n}</span><strong>${T(s.en, s.zh)}</strong><small>${T(s.hintEn, s.hintZh)}</small>`;
        b.addEventListener('click', () => {
          nav.querySelectorAll('.hub-story-step').forEach(el => {
            el.classList.toggle('is-on', el === b);
            el.setAttribute('aria-pressed', String(el === b));
          });
          highlightRows(s.rows);
          const note = box.querySelector('.hub-story-note');
          if (note) note.innerHTML = T('Matrix rows ' + s.rows.join(', ') + ' are the evidence for this gate.', '矩陣第 ' + s.rows.join('、') + ' 列是這一關的證據。');
          langSync();
        });
        nav.appendChild(b);
      });
      const note = document.createElement('p');
      note.className = 'hub-story-note';
      note.innerHTML = T('Start at need class. The 11\u00d79 table below does not move.', '從需求類型開始。下方 11\u00d79 表不改動。');
      box.appendChild(nav);
      box.appendChild(note);
      const pack = document.createElement('button');
      pack.type = 'button';
      pack.className = 'hub-verify-copy';
      pack.innerHTML = T('Copy VERIFY checklist', '複製 VERIFY 清單');
      const copyStatus = document.createElement('p');
      copyStatus.className = 'hub-story-note';
      copyStatus.setAttribute('role', 'status');
      const manualCopy = document.createElement('textarea');
      manualCopy.readOnly = true;
      manualCopy.rows = 6;
      manualCopy.hidden = true;
      manualCopy.style.width = '100%';
      manualCopy.setAttribute('aria-label', 'VERIFY checklist for manual copying');
      manualCopy.dataset.ariaEn = 'VERIFY checklist for manual copying';
      manualCopy.dataset.ariaZh = '可手動複製的 VERIFY 清單';
      let resetCopyLabel;
      pack.addEventListener('click', async () => {
        clearTimeout(resetCopyLabel);
        pack.disabled = true;
        copyStatus.textContent = '';
        manualCopy.hidden = true;
        const gate = nav.querySelector('.hub-story-step.is-on');
        const text = [
          'NVM Knowledge Hub — VERIFY checklist',
          'Page: technology-comparison.html',
          'Class: architecture-range, not datasheet',
          'Active gate: ' + (gate ? gate.innerText.replace(/\s+/g, ' ').trim() : 'need class'),
          'Still VERIFY: named node, document revision, PDK, qualification evidence'
        ].join('\n');
        try {
          if (!navigator.clipboard?.writeText) throw new Error('剪貼簿 API 無法使用');
          await navigator.clipboard.writeText(text);
          pack.innerHTML = T('Copied', '已複製');
          copyStatus.innerHTML = T('The VERIFY checklist was copied.', '已複製 VERIFY 清單。');
          resetCopyLabel = setTimeout(() => { pack.innerHTML = T('Copy VERIFY checklist', '複製 VERIFY 清單'); langSync(); }, 1200);
        } catch {
          pack.innerHTML = T('Retry copying', '重試複製');
          copyStatus.innerHTML = T('Automatic copying is unavailable. Select the checklist below and use your device’s copy command.', '無法自動複製。請選取下方清單，使用裝置的複製功能。');
          manualCopy.value = text;
          manualCopy.hidden = false;
          manualCopy.focus();
          manualCopy.select();
        } finally {
          pack.disabled = false;
          langSync();
        }
      });
      box.appendChild(pack);
      box.appendChild(copyStatus);
      box.appendChild(manualCopy);
      matrix.parentNode.insertBefore(box, matrix);
      function highlightRows(ids) {
        document.querySelectorAll('.matrix-row-header, .matrix-cell').forEach(el => {
          el.classList.toggle('is-dim-hot', ids.includes(el.getAttribute('data-row')));
        });
      }
      highlightRows(['7']);
      document.querySelectorAll('.matrix-row-header').forEach(header => {
        header.style.cursor = 'pointer';
        header.tabIndex = 0;
        header.addEventListener('mouseenter', () => highlightRows([header.getAttribute('data-row')]));
        header.addEventListener('focus', () => highlightRows([header.getAttribute('data-row')]));
      });
    }
  }
  if (/secure-storage\.html/i.test(path)) {
    const lab = document.getElementById('power-lab') || document.getElementById('thesis');
    if (lab) {
      const box = storyShell(
        'hub-secure-life',
        'LIFECYCLE · THREE VERBS',
        '生命週期 · 三個動詞',
        'Keep the Payload · Reconstruct the Root · Prove the Boundary',
        '保存載荷 · 重建根鑰 · 證明邊界',
        'Walk the power window. OTP keeps ciphertext. The reconstructed root is present only while powered under the closed configuration.',
        '走一遍供電窗口。OTP 保存密文。重建根只在已關閉配置且上電時存在。'
      );
      const stages = [
        { id: 'keep', en: 'Keep the Payload', zh: '保存載荷', bodyEn: 'At rest the array holds AES-256 ciphertext and lifecycle state. That is the payload.', bodyZh: '斷電時陣列保存的是 AES-256 密文與生命週期狀態。這就是載荷。' },
        { id: 'root', en: 'Reconstruct the Root', zh: '重建根鑰', bodyEn: 'At power-up, SRAM PUF reconstructs a device-unique root. It is not a permanently stored powered key.', bodyZh: '上電時 SRAM PUF 重建裝置獨有根。它不是永久存放、仍由電源維持的金鑰。' },
        { id: 'bound', en: 'Prove the Boundary', zh: '證明邊界', bodyEn: 'A successful readout should stop at protected content. Remanence and zeroization remain VERIFY targets.', bodyZh: '成功讀取後應停在受保護內容。殘留與清除仍是 VERIFY 目標。' }
      ];
      const wrap = document.createElement('div');
      wrap.className = 'hub-life';
      const nav = document.createElement('div');
      nav.className = 'hub-life-nav';
      const pane = document.createElement('div');
      pane.className = 'hub-life-stage';
      function show(i) {
        const s = stages[i];
        [...nav.children].forEach((b, n) => b.classList.toggle('is-on', n === i));
        pane.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b><h4>${T(s.en, s.zh)}</h4><p>${T(s.bodyEn, s.bodyZh)}</p>`;
        langSync();
      }
      stages.forEach((s, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.innerHTML = T(s.en, s.zh);
        b.addEventListener('click', () => show(i));
        nav.appendChild(b);
      });
      wrap.appendChild(nav);
      wrap.appendChild(pane);
      box.appendChild(wrap);
      lab.insertAdjacentElement('afterbegin', box);
      show(0);
    }
  }
  if (/memory-physics\.html/i.test(path)) {
    const cards = document.querySelectorAll('.topology-card');
    cards.forEach((card, i) => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      const draw = card.querySelector('.topology-drawing');
      if (draw && !draw.querySelector('.hs-trace')) {
        const ring = document.createElement('i');
        ring.className = 'hs-trace';
        ring.setAttribute('aria-hidden', 'true');
        draw.appendChild(ring);
      }
      const activate = () => { cards.forEach(c => c.classList.toggle('is-on', c === card)); };
      card.addEventListener('click', activate);
      card.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); activate(); }
      });
      if (i === 0) card.classList.add('is-on');
    });
  }
  function failClosed(titleEn, titleZh, states) {
    const host = document.getElementById('main-content');
    if (!host || document.getElementById('hub-fail-closed')) return;
    const box = storyShell('hub-fail-closed', 'FAIL CLOSED', '失敗即關閉', titleEn, titleZh,
      'Named-condition figures do not upgrade themselves into a certification.',
      '具名條件下的數字，不會自行升級成認證。');
    const nav = document.createElement('div');
    nav.className = 'hub-story-steps';
    const note = document.createElement('p');
    note.className = 'hub-story-note';
    states.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hub-story-step' + (i === 0 ? ' is-on' : '');
      b.innerHTML = `<span class="n">${s.n}</span><strong>${T(s.en, s.zh)}</strong><small>${T(s.hintEn, s.hintZh)}</small>`;
      b.addEventListener('click', () => {
        nav.querySelectorAll('.hub-story-step').forEach(el => el.classList.toggle('is-on', el === b));
        note.innerHTML = T(s.bodyEn, s.bodyZh);
        langSync();
      });
      nav.appendChild(b);
    });
    note.innerHTML = T(states[0].bodyEn, states[0].bodyZh);
    box.appendChild(nav);
    box.appendChild(note);
    const hero = document.getElementById('hero-title') || document.querySelector('h1');
    if (hero && hero.parentElement) hero.parentElement.insertAdjacentElement('afterend', box);
    else host.insertAdjacentElement('afterbegin', box);
  }
  if (/automotive-nvm\.html/i.test(path)) {
    failClosed('ASIL context does not become Ready.', 'ASIL 語境不會變成 Ready。', [
      { n: '01', en: 'Named condition', zh: '具名條件', hintEn: 'SEooC · ISO 26262', hintZh: 'SEooC · ISO 26262', bodyEn: 'Start from the named safety-element context. That is the input, not a certificate.', bodyZh: '從具名安全元件語境開始。那是輸入，不是證書。' },
      { n: '02', en: 'VERIFY the figure', zh: '核對數字', hintEn: 'Drift · screening', hintZh: '漂移 · 篩選', bodyEn: 'Retention and screening numbers stay bound to the cited condition. They are VERIFY items.', bodyZh: '留存與篩選數字綁定被引用的條件。它們是 VERIFY 項目。' },
      { n: '03', en: 'Fail closed', zh: '失敗即關閉', hintEn: 'No silent upgrade', hintZh: '不靜默升級', bodyEn: 'If the configuration is not closed, the page must not say ASIL-D Ready or zero-defect.', bodyZh: '組態未關閉時，頁面不得寫 ASIL-D Ready 或零缺陷。' }
    ]);
  }
  if (/iot-mcu-envm\.html/i.test(path)) {
    failClosed('Zero extra masks is an option, not a promise.', '零額外光罩是選項，不是承諾。', [
      { n: '01', en: 'Architecture option', zh: '架構選項', hintEn: '0 extra mask adders', hintZh: '0 道額外光罩', bodyEn: 'Pure-logic AntiFuse OTP can be a zero-adder route in standard CMOS.', bodyZh: '純邏輯 AntiFuse OTP 可以是標準 CMOS 的零加價路線。' },
      { n: '02', en: 'Bind the document', zh: '綁定文件', hintEn: 'Node + revision', hintZh: '節點 + 版本', bodyEn: 'NTV power and long-retention figures stay with the cited node and document version.', bodyZh: '近閾值功耗與長保持數字必須跟著被引用的節點與文件版本。' },
      { n: '03', en: 'Not target assurance', zh: '不是目標保證', hintEn: 'Vendor-reported', hintZh: '供應商報告', bodyEn: 'Portfolio numbers are context. They do not assure the shipped configuration.', bodyZh: '組合數字是脈絡，不能保證出貨組態。' }
    ]);
  }
  if (/security-assurance\.html/i.test(path)) {
    failClosed('Claims stay testable, or they stay unmarked.', '主張必須可測，否則維持未標。', [
      { n: '01', en: 'Observe', zh: '觀察', hintEn: 'Power · EM · timing', hintZh: '功耗 · 電磁 · 時序', bodyEn: 'Side-channel evidence is a measurement problem. It does not name a product defect by itself.', bodyZh: '旁路證據是量測問題，本身不構成產品缺陷名稱。' },
      { n: '02', en: 'Disturb', zh: '擾動', hintEn: 'Voltage · clock · laser', hintZh: '電壓 · 時脈 · 雷射', bodyEn: 'Disturbance tests ask whether the reconstructed root or payload leaks under a named stress.', bodyZh: '擾動測試問的是：具名應力下，重建根或載荷會不會外洩。' },
      { n: '03', en: 'Fail secure', zh: '失敗即安全', hintEn: 'No key disclosure', hintZh: '不洩漏金鑰', bodyEn: 'Expected outcome is fail-secure with no key disclosure. Unclosed tests remain UNKNOWN.', bodyZh: '預期結果是失敗即安全、不洩漏金鑰。未關閉的測試維持 UNKNOWN。' }
    ]);
  }
  if (!document.getElementById('readingProgress') && !document.querySelector('.hub-progress')) {
    const bar = document.createElement('div');
    bar.className = 'hub-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = max > 0 ? `${Math.min(100, (window.scrollY / max) * 100)}%` : '0';
    };
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }
})();
