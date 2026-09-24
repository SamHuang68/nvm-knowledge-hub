(function () {
  'use strict';
  function hubPagePath(pathname) {
    let value = pathname || '/';
    try { value = decodeURIComponent(value); } catch {}
    if (value.endsWith('/')) return value;
    if (/\.[a-z0-9]+$/i.test(value)) return value;
    return value + '.html';
  }
  if (!/automotive-nvm\.html/i.test(hubPagePath(location.pathname))) return;
  const T = (en, zh) => '<span data-lang="en">' + en + '</span><span data-lang="zh">' + zh + '</span>';
  function langSync() {
    if (window.HubLanguage) window.HubLanguage.set(window.HubLanguage.get(), false);
  }
  const h1 = document.getElementById('hero-title');
  if (h1) {
    h1.innerHTML = T(
      'Automotive NVM: Grade 0 ambient and 175°C junction are not the same claim.',
      '車規 NVM：Grade 0 環境溫度與 175°C 結溫不是同一項主張。'
    );
  }
  const lead = document.querySelector('.lead-desc');
  if (lead) {
    lead.innerHTML = T(
      'This page uses the mission profile to pick the test gate. It does not issue a certification. AEC-Q100 Grade 0 is an ambient range (−40°C to +150°C Ta). Junction limits stay on the named datasheet.',
      '這頁用任務載記選測試門，不簽認證。AEC-Q100 Grade 0 是環境溫度（−40°C 至 +150°C Ta）。結溫以具名 datasheet 為準。'
    );
  }
  const hero = document.querySelector('.m3-hero-container') || document.querySelector('.m3-hero');
  const fail = document.getElementById('hub-fail-closed');
  if (hero && fail && fail.parentElement === hero) {
    hero.insertAdjacentElement('afterend', fail);
    fail.classList.add('hub-auto-moved');
  }
  if (fail) {
    const title = fail.querySelector('h3');
    if (title) title.innerHTML = T('Four gates before any ASIL sentence.', '任何 ASIL 句子之前先走四關。');
    const kicker = fail.querySelector('.hub-story-kicker');
    if (kicker) kicker.innerHTML = T('READING PATH', '閱讀路徑');
    const leadP = fail.querySelector('.hub-story-lead');
    if (leadP) leadP.innerHTML = T(
      'Domain and mission profile first. Then Ta versus Tj. Then Q100-005 into HTOL / HTDR / ELFR. Stop at SEooC vocabulary and VERIFY.',
      '先定域與任務載記，再分 Ta 與 Tj，再走 Q100-005 到 HTOL／HTDR／ELFR。停在 SEooC 語彙與 VERIFY。'
    );
    const steps = [
      { n: '01', en: 'Domain', zh: '域', hintEn: 'Cabin · under-hood · safety', hintZh: '船內 · 引擎艙 · 安全',
        bodyEn: 'Name the ECU domain and the time-at-temperature budget. That selects the grade conversation.',
        bodyZh: '先點 ECU 域與溫度時間預算。那才決定要談哪一等 Grade。' },
      { n: '02', en: 'Ta vs Tj', zh: 'Ta 對 Tj', hintEn: 'Grade is ambient', hintZh: 'Grade 是環境溫',
        bodyEn: 'Grade 0 is −40°C to +150°C ambient. 175°C is a junction figure. Do not write them as one claim.',
        bodyZh: 'Grade 0 是 −40°C 至 +150°C 環境溫。175°C 是結溫數字。不得寫成同一項主張。' },
      { n: '03', en: 'Q100-005 first', zh: '先 Q100-005', hintEn: 'NVM precondition', hintZh: 'NVM 預處理',
        bodyEn: 'Devices with NVM take endurance preconditioning per Q100-005 before HTOL, HTDR or LTDR. Sample counts stay VERIFY.',
        bodyZh: '含 NVM 的棵心要先依 Q100-005 做耐久預處理，再進 HTOL、HTDR 或 LTDR。樣品數仍是 VERIFY。' },
      { n: '04', en: 'Stop at VERIFY', zh: '停在 VERIFY', hintEn: 'SEooC vocabulary', hintZh: 'SEooC 語彙',
        bodyEn: 'SPFM, LFM and FIT on this page are architectural vocabulary. They do not become ASIL-D Ready.',
        bodyZh: '本頁的 SPFM、LFM、FIT 是架構語彙，不會變成 ASIL-D Ready。' }
    ];
    const nav = fail.querySelector('.hub-story-steps');
    const note = fail.querySelector('.hub-story-note');
    if (nav && note) {
      nav.innerHTML = '';
      steps.forEach(function (s, i) {
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
      note.innerHTML = T(steps[0].bodyEn, steps[0].bodyZh);
    }
  }
  const gatesTitle = document.getElementById('gates-sec-title');
  if (gatesTitle) {
    gatesTitle.innerHTML = T(
      'Three wafer gates, read as a checklist — not a certificate.',
      '三道晶圓門，當清單讀，不當證書。'
    );
  }
  const stepper = document.getElementById('gate-stepper');
  if (stepper && !document.getElementById('hub-auto-gate-table')) {
    const wrap = document.createElement('div');
    wrap.className = 'hub-auto-table-wrap';
    wrap.id = 'hub-auto-gate-table';
    wrap.innerHTML =
      '<table class="hub-auto-table">' +
      '<caption>' + T('Named-condition checklist. Figures stay VERIFY against AEC-Q100 / Q100-005 / Q100-008 and the cited revision.', '具名條件清單。數字須對 AEC-Q100／Q100-005／Q100-008 及被引版本做 VERIFY。') + '</caption>' +
      '<thead><tr>' +
      '<th>' + T('Gate', '門') + '</th>' +
      '<th>' + T('Test', '測試') + '</th>' +
      '<th>' + T('Sample class', '樣品') + '</th>' +
      '<th>' + T('Condition class', '條件') + '</th>' +
      '<th>' + T('NVM note', 'NVM 註') + '</th>' +
      '<th>' + T('Source', '來源') + '</th>' +
      '</tr></thead><tbody>' +
      '<tr><td>01</td><td>HTOL</td><td>3 lots × 77 <span class="hub-auto-verify">VERIFY</span></td><td>Grade Ta 1000 h; Tj if stated on the datasheet</td><td>Endurance precondition first</td><td>Q100 B1 + Q100-005</td></tr>' +
      '<tr><td>02</td><td>ELFR + thermal cycle</td><td>ELFR 3-lot class <span class="hub-auto-verify">VERIFY</span></td><td>Grade ambient extremes; cycle count per cited flow</td><td>Does not replace EDR</td><td>Q100-008 + Q100 A/B</td></tr>' +
      '<tr><td>03</td><td>HTDR / bake / reflow class</td><td>Per cited EDR cell <span class="hub-auto-verify">VERIFY</span></td><td>Retention bake ≠ operating life</td><td>OTP and Flash do not share one EDR cell</td><td>Q100-005 EDR</td></tr>' +
      '</tbody></table>';
    stepper.parentNode.insertBefore(wrap, stepper);
  }
  function assume(afterId, id, en, zh) {
    if (document.getElementById(id)) return;
    const h = document.getElementById(afterId);
    if (!h) return;
    const p = document.createElement('p');
    p.id = id;
    p.className = 'hub-auto-assume';
    p.innerHTML = T(en, zh);
    h.insertAdjacentElement('afterend', p);
  }
  assume(
    'lab-thermal-title',
    'hub-auto-assume-thermal',
    'Assumption: the Arrhenius canvas is a teaching model. Ea, Tuse and Tstress must be named before any acceleration factor is treated as evidence.',
    '假設：Arrhenius 畫布是教學模型。Ea、Tuse、Tstress 未具名前，加速因子不得當作證據。'
  );
  assume(
    'lab-ecc-title',
    'hub-auto-assume-ecc',
    'Assumption: SECDED (72,64) here is a code-distance demonstration. It is not an ISO 26262 metric and does not become ASIL-D Ready.',
    '假設：此處 SECDED (72,64) 是碼距示範，不是 ISO 26262 度量，也不會變成 ASIL-D Ready。'
  );
  const chainTitle = document.getElementById('auto-value-chain-title');
  if (chainTitle && !document.getElementById('hub-auto-domain-table')) {
    chainTitle.innerHTML = T(
      'Domain × physics: which persistent state belongs where.',
      '域 × 物理：哪一種持久狀態落在哪裡。'
    );
    const wrap = document.createElement('div');
    wrap.className = 'hub-auto-table-wrap';
    wrap.id = 'hub-auto-domain-table';
    wrap.innerHTML =
      '<table class="hub-auto-table">' +
      '<caption>' + T('Fit class only. Named public examples stay VERIFY. This is not a design-win matrix.', '只標適配等級。具名公開例仍須 VERIFY。不是 design-win 矩陣。') + '</caption>' +
      '<thead><tr>' +
      '<th>' + T('Domain', '域') + '</th>' +
      '<th>OTP / AF</th><th>eFlash</th><th>RRAM</th><th>PCM</th>' +
      '</tr></thead><tbody>' +
      '<tr><td>BMS AFE LUT</td><td>few-write factory table</td><td>if endurance budget is named</td><td>candidate at a named node</td><td>only with a named Tj class</td></tr>' +
      '<tr><td>' + T('Vehicle ID / keys', '車輛 ID／鍵') + '</td><td>one-time root</td><td>not the root</td><td>not a substitute for OTP root</td><td>not a substitute for OTP root</td></tr>' +
      '<tr><td>' + T('Sensor calibration', '感測校準') + '</td><td>end-of-line trim</td><td>field update if cycles exist</td><td>candidate if retention is named</td><td>candidate if thermal class is named</td></tr>' +
      '<tr><td>' + T('ADAS recovery vector', 'ADAS 復原') + '</td><td>immutable fallback</td><td>maps / firmware class</td><td>candidate, not Ready</td><td>candidate, not Ready</td></tr>' +
      '<tr><td>Advanced-node XiP</td><td>config / lock bits</td><td>code store if the node has it</td><td>named 28 nm class only</td><td>named FD-SOI class only</td></tr>' +
      '</tbody></table>';
    const bar = chainTitle.closest('.panel-hero-bar') || chainTitle.parentElement;
    const grid = bar && bar.nextElementSibling;
    if (bar) bar.insertAdjacentElement('afterend', wrap);
    if (grid && grid.querySelector) {
      grid.classList.add('hub-auto-poster');
      grid.setAttribute('hidden', '');
    }
  }
  langSync();
})();
