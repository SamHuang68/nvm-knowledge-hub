(function () {
  'use strict';
  function hubPagePath(pathname) {
    let value = pathname || '/';
    try { value = decodeURIComponent(value); } catch {}
    if (value.endsWith('/')) return value;
    if (/\.[a-z0-9]+$/i.test(value)) return value;
    return value + '.html';
  }
  const path = hubPagePath(location.pathname);
  function replaceText(map) {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);
    nodes.forEach(node => {
      let value = node.nodeValue;
      if (!value) return;
      map.forEach(([from, to]) => {
        if (value.includes(from)) value = value.split(from).join(to);
      });
      if (value !== node.nodeValue) node.nodeValue = value;
    });
  }
  const originalMetaTitles = new Map([...document.querySelectorAll('meta[property="og:title"], meta[name="twitter:title"]')].map(el => [el, el.getAttribute('content')]));
  function softenTitle() {
    const zh = document.documentElement.lang.startsWith('zh');
    const soften = value => {
      const result = value
        .replace(/ISO 26262 ASIL-D/g, zh ? 'ISO 26262 ASIL 範圍' : 'ISO 26262 ASIL context')
        .replace(/Zero Erase Penalty/g, zh ? '無額外抹除電壓路徑' : 'No extra erase-voltage path');
      return zh ? result.replace(/(?<=[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]) +(?=[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef])/g, '') : result;
    };
    const title = soften(zh
      ? (document.documentElement.dataset.titleZh || document.title) : document.title);
    if (title !== document.title) document.title = title;
    originalMetaTitles.forEach((original, el) => {
      const v = zh ? (document.documentElement.dataset.titleZh || original) : original;
      if (!v) return;
      el.setAttribute('content', soften(v));
    });
  }
  if (/automotive-nvm\.html|iot-mcu-envm\.html/i.test(path)) window.addEventListener('hub:language-change', () => {
    if (document.documentElement.lang.startsWith('zh')) softenTitle();
  });
  const sc3OverloadDemote = [
      ['ISO 26262 ASIL-D Ready (SEooC) · SC3 Systematic Capability', 'ISO 26262 ASIL context (SEooC) · not a certification'],
      ['ISO 26262 ASIL-D Ready (SEooC) · SC3 系統化能力', 'ISO 26262 ASIL 語境（SEooC）· 非認證'],
      ['ISO 26262 ASIL-D Ready (SEooC SC3)', 'ISO 26262 ASIL context (SEooC) · not certified Ready'],
      ['ISO 26262 ASIL context · SEooC SC3 capability (not a certification)', 'ISO 26262 ASIL context (SEooC) · not a certification'],
      ['ISO 26262 ASIL 語境 · SEooC SC3 能力（非認證）', 'ISO 26262 ASIL 語境（SEooC）· 非認證'],
      ['ISO 26262 ASIL context (SEooC SC3) · not certified Ready', 'ISO 26262 ASIL context (SEooC) · not certified Ready'],
      ['ASIL context (SEooC SC3)', 'ASIL context (SEooC)'],
      ['ASIL 脈絡（SEooC SC3）', 'ASIL 脈絡（SEooC）'],
      ['ASIL-D (SEooC SC3)', 'ASIL (SEooC)'],
      ['ASIL-D vocabulary / SEooC SC3 (not READY cert)', 'ISO 26262 ASIL-D vocab (SEooC · not cert)'],
      ['ASIL-D vocabulary / SC3 (not READY cert)', 'ISO 26262 ASIL-D vocab (SEooC)'],
      ['FUNCTIONAL SAFETY (SEooC SC3 CAPABILITY)', 'ISO 26262 SEooC vocabulary (not cert)'],
      ['車載最高安全等級 (SEooC SC3 能力支援)', 'ISO 26262 SEooC 語境（非認證）'],
      ['ASIL-D／SC3', 'ISO 26262 ASIL'],
      ['ASIL-D/SC3', 'ISO 26262 ASIL'],
      ['SEooC SC3', 'SEooC']
  ];
  replaceText(sc3OverloadDemote);
  if (/automotive-nvm\.html/i.test(path)) {
    replaceText([
      ['ISO 26262 ASIL-D Ready', 'ASIL CONTEXT (SEooC)'],
      ['Low-defectivity mission-profile rigor', 'mission-profile defectivity (VERIFY)'],
      ['低缺陷任務載記可靠度', '任務條件缺陷密度（待驗證）'],
      ['0.0% DRIFT', 'DRIFT CLASS (VERIFY)'],
      ['Zero Resistance Drift', 'Named-condition filament ohmic stability (VERIFY)'],
      ['Zero Infant Mortality', 'infant-mortality screening (VERIFY)'],
      ['WAFER-LEVEL ZERO-DEFECT RIGOR', 'WAFER-LEVEL DEFECTIVITY (VERIFY)'],
      ['RULE #04 · ZERO DEFECT', 'RULE #04 · DEFECTIVITY (VERIFY)']
    ]);
    softenTitle();
  }
  if (/iot-mcu-envm\.html/i.test(path)) {
    replaceText([
      ['Zero Erase Penalty', 'No extra erase-voltage path (VERIFY)'],
      ['Pure Near-Threshold Agility', 'Near-threshold option at a named node'],
      ['28nm 以下沒有抹除負擔', '28nm 以下：無額外抹除電壓路徑（待驗證）'],
      ['只有極致輕盈的近臨界電壓運算', '特定節點的近臨界電壓選項'],
      ['cutting dynamic power by >75% at TSMC 0.5V near-threshold voltage for 15-year battery-free edge intelligence.', 'Named pure-logic AntiFuse OTP is an architecture option with zero extra mask adders in standard CMOS. Near-threshold and long-retention figures stay bound to the cited node and document version — not target-configuration assurance.'],
      ['在 TSMC 0.5V 近臨界電壓 (NTV) 下大幅降低 75% 動態功耗，實現長達 15 年免換電池的超低功耗邊緣運算。', '特定 Pure-Logic AntiFuse OTP 路線以標準邏輯製程、0 道額外光罩為架構選項；公開資料中的近臨界電壓與長期資料保存數據須綁定同一節點與文件版本，不能直接當成目標組態保證。']
    ]);
    softenTitle();
    const proof = document.querySelector('.hero-proof, .hero-content');
    if (proof && !document.querySelector('.hero-scope')) {
      const note = document.createElement('p');
      note.className = 'hero-scope';
      note.style.cssText = 'margin:12px 0 0;max-width:72ch;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:rgba(196,165,116,.85);';
      note.innerHTML = '<span data-lang="en">Vendor-reported / named-node context · not target-configuration assurance. >75% NTV power and 15-year battery-free figures remain VERIFY against the cited source.</span><span data-lang="zh">供應商／特定節點脈絡，不是目標組態保證。近臨界電壓功耗降幅與 15 年免電池數字仍須依同一來源驗證。</span>';
      (document.querySelector('.hero-proof') || proof).insertAdjacentElement('afterend', note);
      if (window.HubLanguage) window.HubLanguage.set(window.HubLanguage.get(), false);
    }
  }
  if (/specialty-nvm\.html/i.test(path)) {
    replaceText([
      ['SYSTEM READY. WAITING FOR DEFECT INJECTION', 'SIMULATION IDLE. WAITING FOR DEFECT INJECTION']
    ]);
  }
})();
