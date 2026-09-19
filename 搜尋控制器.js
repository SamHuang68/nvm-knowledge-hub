/* 搜尋直接讀取公開總帳，避免維護另一份紀錄清單。全站由 site-language 掛載。 */
if (!window.__NVM_SEARCH_ENHANCED) {
window.__NVM_SEARCH_ENHANCED = true;
(() => {
  const ROOT = new URL('.', document.currentScript.src);
  const PAGE_CATALOG = [
    {title_zh:'知識中心首頁',title_en:'NVM Knowledge Hub home',url:'index.html',tags:'home knowledge hub 首頁'},
    {title_zh:'位元胞物理與可靠度',title_en:'Bitcell Physics & Reliability',url:'memory-physics.html',tags:'antifuse gate oxide filament physics fowler nordheim 175 drift evidence'},
    {title_zh:'NVM 技術對比矩陣',title_en:'NVM Technology Comparison Matrix',url:'technology-comparison.html',tags:'comparison matrix eflash emram efuse selection guide foundry tsmc umc TwinBit I-fuse Floadia Actt CFX SST Samsung SF4A',summary_zh:'11 葉選型矩陣、雷達演示與四大晶圓廠。',summary_en:'11-leaf selection matrix, radar demo, and four foundries.'},
    {title_zh:'具名 IP 對應 11 葉',title_en:'Named IPs under the 11 leaves',url:'technology-comparison.html#named-ip-leaves',tags:'named IP TwinBit I-fuse Floadia ZA ZT G1 G2 Actt LogicFlash CFX SST SuperFlash PermSRAM',summary_zh:'OTP／MTP／eFlash 具名 IP 對應既有葉，機制不同者不併欄。',summary_en:'Named OTP / MTP / eFlash IPs map onto existing leaves; distinct physics stay unmerged.'},
    {title_zh:'TSMC 製程路線',title_en:'TSMC process roadmap',url:'technology-comparison.html#foundry-tsmc',tags:'TSMC foundry 28eHV 22ULL N2 eFlash eMRAM eRRAM',summary_zh:'40/28 eFlash、28eHV 校準 OTP、22ULL 與 N2 信任根。',summary_en:'40/28 eFlash, 28eHV trim OTP, 22ULL, and N2 Root of Trust.'},
    {title_zh:'TSMC 28eHV 0-mask OTP 分流',title_en:'TSMC 28eHV 0-mask OTP split',url:'technology-comparison.html#foundry-tsmc-28ehv',tags:'TSMC 28eHV OLED Gamma De-Mura AntiFuse ZA I-fuse trim OTP',summary_zh:'OLED 校準常見閘氧 AntiFuse；同節點仍須分流 ZA 類與 I-fuse。',summary_en:'OLED trim often uses GOX AntiFuse; still split ZA-class and I-fuse.'},
    {title_zh:'TSMC N2 信任根 OTP 分流',title_en:'TSMC N2 Root-of-Trust OTP split',url:'technology-comparison.html#foundry-tsmc-n2',tags:'TSMC N2 GAA nanosheet 0-mask OTP AntiFuse ZA I-fuse RoT',summary_zh:'N2 公開敘事常以 0-mask OTP 作信任根，不得預設單一機制。',summary_en:'N2 public narratives often use 0-mask OTP as RoT; do not assume one mechanism.'},
    {title_zh:'Samsung Foundry',title_en:'Samsung Foundry',url:'technology-comparison.html#foundry-samsung',tags:'Samsung Foundry eMRAM 28FDS 14LPP SF4A SF3 SF2',summary_zh:'28FDS／FinFET eMRAM 與 SF4A／SF3／SF2 次世代路線。',summary_en:'28FDS / FinFET eMRAM and the SF4A / SF3 / SF2 next-gen path.'},
    {title_zh:'Samsung SF4A／SF3／SF2 0-mask OTP 分流',title_en:'Samsung SF4A / SF3 / SF2 0-mask OTP split',url:'technology-comparison.html#foundry-samsung-sf4a',tags:'Samsung SF4A SF3 SF2 SFF 2024 eMRAM AntiFuse ZA I-fuse MBCFET GAA',summary_zh:'同節點若另採 0-mask OTP，須分流閘氧 AntiFuse、ZA 類與 I-fuse。',summary_en:'If the same node also uses 0-mask OTP, split GOX AntiFuse, ZA-class, and I-fuse.'},
    {title_zh:'TSMC 22ULL 0-mask OTP 分流',title_en:'TSMC 22ULL 0-mask OTP split',url:'technology-comparison.html#foundry-tsmc-22ull',tags:'TSMC 22ULL 22ULP eRRAM eMRAM AntiFuse ZA I-fuse',summary_zh:'22ULL 標配 0-mask OTP 時仍須分流閘氧 AntiFuse、ZA 類與 I-fuse。',summary_en:'When 22ULL ships 0-mask OTP, still split GOX AntiFuse, ZA-class, and I-fuse.'},
    {title_zh:'UMC 製程路線',title_en:'UMC process roadmap',url:'technology-comparison.html#foundry-umc',tags:'UMC SuperFlash 40eHV 28eHV TwinBit YMC NeoBit',summary_zh:'SST SuperFlash、40/28eHV 校準 OTP 與邏輯 0-mask 生態。',summary_en:'SST SuperFlash, 40/28eHV trim OTP, and logic 0-mask ecosystem.'},
    {title_zh:'UMC 40/28eHV 校準 OTP 分流',title_en:'UMC 40/28eHV trim OTP split',url:'technology-comparison.html#foundry-umc-ehv',tags:'UMC 40eHV 28eHV SuperFlash trim OTP AntiFuse ZA I-fuse',summary_zh:'高壓校準 OTP 仍須分流閘氧 AntiFuse、ZA 類與 I-fuse。',summary_en:'HV trim OTP still requires a GOX AntiFuse vs ZA-class vs I-fuse split.'},
    {title_zh:'GlobalFoundries 製程路線',title_en:'GlobalFoundries process roadmap',url:'technology-comparison.html#foundry-gf',tags:'GlobalFoundries 22FDX AutoPro150 I-fuse eMRAM 12LP',summary_zh:'22FDX eMRAM、I-fuse 資格與 12LP FinFET 路線。',summary_en:'22FDX eMRAM, I-fuse qualification, and the 12LP FinFET path.'},
    {title_zh:'GF 22FDX I-fuse 資格',title_en:'GF 22FDX I-fuse qualification',url:'technology-comparison.html#foundry-gf-22fdx',tags:'GlobalFoundries 22FDX I-fuse Attopsemi AutoPro150 eMRAM OxRAM',summary_zh:'I-fuse 是熱輔助電遷移 OTP，不是 22FDX eMRAM。',summary_en:'I-fuse is heat-assisted-EM OTP, not 22FDX eMRAM.'},
    {title_zh:'安全儲存架構',title_en:'Secure Storage Architecture',url:'secure-storage.html',tags:'sram puf aes 256 gcm otp zero rest key security'},
    {title_zh:'安全保證與信任根',title_en:'Security Assurance & Root of Trust',url:'security-assurance.html',tags:'fips 140 caliptra dpa fault injection root trust nist'},
    {title_zh:'AI 系統與先進節點',title_en:'AI Systems & Advanced Nodes',url:'ai-nvm-opportunities.html',tags:'xpu ddr5 pmic spd soic chiplet ucie pqc boot accelerator'},
    {title_zh:'超低功耗 IoT 與 MCU eNVM',title_en:'ULP IoT & Edge MCU eNVM',url:'iot-mcu-envm.html',tags:'iot mcu 22ull n4e eflash cliff 0.5v ntv vector patch'},
    {title_zh:'車規級 NVM',title_en:'Automotive-Grade NVM',url:'automotive-nvm.html',tags:'automotive aec q100 iso 26262 grade 0 175 secded ecc ppm adas ev'},
    {title_zh:'特種矽與 BCD 製程',title_en:'Specialty Silicon & BCD',url:'specialty-nvm.html',tags:'bcd pmic hv ddi gamma mura eink 110hv cis dram hbm ppr bist bira trim'},
    {title_zh:'白皮書決策工作台',title_en:'Whitepaper Decision Studio',url:'whitepaper/',tags:'whitepaper reader evidence ledger phase search'},
    {title_zh:'高階技術簡報',title_en:'Executive Briefing Deck',url:'briefing/index.html',tags:'briefing deck pptx speaker notes executive v19'},
    {title_zh:'矽驗證證據總帳',title_en:'Evidence Ledger',url:'memory-evidence.html',tags:'evidence 31 claims ledger silicon verified'},
    {title_zh:'OIP Secure Storage Brief (展會版)',title_en:'OIP Secure Storage Brief (Event Edition)',url:'oip-secure-storage.html',tags:'oip tsmc secure storage brief event'}
  ];
  const labels = {
    zh: {
      topic: '深入主題', ledger: '證據總帳',
      count: (hits, records) => `${hits} 筆結果 · ${baseCount()} 個主題${records === null ? '' : `、${records} 筆總帳`}。↑ ↓ 選擇，Enter 開啟，Esc 關閉。`,
      empty: '找不到符合的結果，請試試技術名稱、紀錄編號或較短的關鍵字。',
      loading: ' 正在載入總帳…',
      failed: ' 總帳載入失敗；目前僅搜尋主題。重新開啟搜尋可重試。'
    },
    en: {
      topic: 'Explore topic', ledger: 'Evidence Ledger',
      count: (hits, records) => `${hits} results · ${baseCount()} topics${records === null ? '' : `, ${records} ledger records`}. ↑ ↓ select, Enter open, Esc close.`,
      empty: 'No matching results. Try a technology name, record ID, or shorter keyword.',
      loading: ' Loading the evidence ledger…',
      failed: ' The ledger could not be loaded; topic search remains available. Reopen search to retry.'
    }
  };
  const index = [];
  const seen = new Set();
  function addItem(item) {
    if (!item?.url || seen.has(item.url)) return;
    seen.add(item.url);
    index.push(item);
  }
  function seedIndex() {
    (window.NVMTopicIndex || []).forEach(addItem);
    PAGE_CATALOG.forEach(addItem);
    (typeof SEARCH_INDEX !== 'undefined' ? SEARCH_INDEX : []).forEach(addItem);
  }
  function baseCount() {
    return index.filter(item => !item.id).length;
  }
  function ensureStyles() {
    if (document.querySelector('link[href*="全站搜尋.css"]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = new URL('全站搜尋.css?v=20260920-spot', ROOT).href;
    document.head.append(link);
  }
  function ensureShell() {
    if (!document.getElementById('searchOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'searchOverlay';
      overlay.className = 'search-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-hidden', 'true');
      overlay.setAttribute('aria-label', 'Search the knowledge hub');
      overlay.dataset.ariaEn = 'Search the knowledge hub';
      overlay.dataset.ariaZh = '搜尋知識中心';
      overlay.innerHTML = '<div class="search-modal"><div class="search-input-row"><input id="nvmHubSearchInput" type="search" autocomplete="off" aria-label="Search topics and evidence" data-aria-en="Search topics and evidence" data-aria-zh="搜尋主題與證據" aria-describedby="searchStatus" data-placeholder-en="Technology, mechanism, company, or source ID" data-placeholder-zh="技術、機制、公司或來源編號"><button type="button" id="searchClose" aria-label="Close search" data-aria-en="Close search" data-aria-zh="關閉搜尋">×</button></div><p id="searchStatus" class="search-status" role="status" aria-live="polite"></p><div id="searchResults" class="search-results"></div></div>';
      document.body.append(overlay);
    }
    if (!document.getElementById('searchTrigger')) {
      const trigger = document.createElement('button');
      trigger.id = 'searchTrigger';
      trigger.className = 'search-trigger';
      trigger.type = 'button';
      trigger.setAttribute('aria-label', 'Search the knowledge hub');
      trigger.dataset.ariaEn = 'Search the knowledge hub';
      trigger.dataset.ariaZh = '搜尋知識中心';
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', 'searchOverlay');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span><span data-lang="en">Search</span><span data-lang="zh">搜尋</span></span><kbd>Ctrl+K</kbd>';
      const langBtn = document.getElementById('languageToggle') || document.querySelector('.language-toggle');
      const host = langBtn?.parentElement || document.querySelector('.header-actions, .knowledge-controls, .hub-header-ctrls, .nvm-header nav');
      if (host && langBtn) host.insertBefore(trigger, langBtn);
      else if (host) host.append(trigger);
      else document.body.prepend(trigger);
    }
  }
  function start() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', start, {once: true});
      return;
    }
    ensureStyles();
    seedIndex();
    ensureShell();
    bind();
  }
  function resolveSearchInput(root) {
    if (!root) return null;
    return root.querySelector('#nvmHubSearchInput')
      || root.querySelector('#searchInput')
      || root.querySelector('input[type="search"]');
  }

  function bind() {
    const overlay = document.getElementById('searchOverlay');
    const input = resolveSearchInput(overlay);
    const results = overlay?.querySelector('#searchResults');
    const status = overlay?.querySelector('#searchStatus');
    const trigger = document.getElementById('searchTrigger');
    const close = overlay?.querySelector('#searchClose');
    if (!overlay || !input || !results) return;
    // 新舊搜尋欄位 ID 相容：升級後仍接受舊版快取的 searchInput 綁定。
    if (input.id !== 'nvmHubSearchInput') input.id = 'nvmHubSearchInput';
    function syncInterfaceLabels() {
      const language = window.HubLanguage?.get() === 'zh' ? 'zh' : 'en';
      input.placeholder = input.dataset[language === 'zh' ? 'placeholderZh' : 'placeholderEn'] || '';
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
    function resolveUrl(url) {
      return new URL(url, ROOT).href;
    }
    function render() {
      const q = normalize(input.value);
      const items = index.map(item => ({item, score:score(item,q)})).filter(hit => hit.score).sort((a,b)=>b.score-a.score);
      results.replaceChildren();
      const language = window.HubLanguage?.get() === 'zh' ? 'zh' : 'en';
      const copy = labels[language];
      for (const {item} of items) {
        const link = document.createElement('a');
        link.className = 'search-result-item';
        link.href = resolveUrl(item.url);
        if (item.language) link.lang = item.language;
        const title = document.createElement('div'); title.className = 'sr-title';
        title.textContent = language === 'zh' ? item.title_zh : item.title_en;
        const desc = document.createElement('div'); desc.className = 'sr-desc';
        const summary = item[`summary_${language}`] || '';
        desc.textContent = item.id
          ? `${copy.ledger} · ${item.id}${summary ? ` · ${summary}` : ''}`
          : (summary || copy.topic);
        link.append(title, desc); results.append(link);
      }
      status.textContent = items.length ? copy.count(items.length, loaded ? index.length-baseCount() : null) : copy.empty;
      if (loading && !loaded) status.textContent += copy.loading;
      if (failed) status.textContent += copy.failed;
    }
    async function loadLedger() {
      if (loaded || loading) return loading;
      failed = false;
      loading = (async () => {
        try {
          const response = await fetch(new URL('memory-evidence.html', ROOT), {signal: AbortSignal.timeout(10000)});
          if (!response.ok) throw new Error('總帳讀取失敗');
          const document = new DOMParser().parseFromString(await response.text(), 'text/html');
          const cards = [...document.querySelectorAll('.source-card')];
          if (!cards.length) throw new Error('總帳沒有可搜尋紀錄');
          const records = cards.map(card => {
            const id = card.querySelector('.source-index b').textContent.trim();
            if (card.id !== `evidence-${id}`) throw new Error('總帳缺少穩定錨點');
            const heading = card.querySelector('h3');
            const title_zh = (heading.querySelector('[data-lang="zh"]') || heading).textContent.trim();
            const title_en = (heading.querySelector('[data-lang="en"]') || heading).textContent.trim();
            const summary = card.querySelector('.source-content > p:not(.source-meta) [data-lang="zh"]')?.textContent.trim() || '';
            const summary_en = card.querySelector('.source-content > p:not(.source-meta) [data-lang="en"]')?.textContent.trim() || '';
            return {id, title_zh, title_en, summary, summary_zh: summary, summary_en, url:`memory-evidence.html#${card.id}`, tags:`${card.dataset.keywords} ${card.textContent}`};
          });
          records.forEach(addItem);
          loaded = true;
        } catch { failed = true; }
        finally { loading = null; if (isOpen()) render(); }
      })();
      return loading;
    }
    function openSearch() {
      if (isOpen()) { input.focus(); return; }
      // 原生 modal 位於 top layer；先關閉並讓瀏覽器恢復觸發按鈕的焦點。
      // 搜尋關閉時再回到該按鈕，不保留已關閉視窗內的無效焦點。
      [...document.querySelectorAll('dialog:modal')].reverse().forEach(dialog => dialog.close());
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
      const restoreFocus = previousFocus?.isConnected && !previousFocus.closest('dialog:not([open]), [inert]') ? previousFocus : trigger;
      restoreFocus?.focus({preventScroll:true});
    }
    trigger?.addEventListener('click',openSearch); close?.addEventListener('click',closeSearch);
    overlay.addEventListener('click',event => {if (event.target === overlay) closeSearch();});
    input.addEventListener('input',render);
    results.addEventListener('click',event => {
      const link = event.target.closest('a');
      if (!link) return;
      closeSearch();
      const url = new URL(link.href);
      if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash === location.hash) {
        // 相同 hash 不會再觸發 hashchange，仍須解除本頁篩選造成的遮蔽。
        window.dispatchEvent(new CustomEvent('hub:reveal-anchor'));
      }
    });
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href*="searchTrigger"]');
      if (!link) return;
      event.preventDefault();
      openSearch();
    });
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
    if (typeof syncHubLanguage === 'function') syncHubLanguage();
    syncInterfaceLabels();
    window.NVMHub = Object.assign(window.NVMHub || {}, {syncLanguage: typeof syncHubLanguage === 'function' ? syncHubLanguage : window.NVMHub?.syncLanguage || (() => {}), searchIndex:index});
  }
  start();
})();
}
