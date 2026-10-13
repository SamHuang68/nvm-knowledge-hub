/**
 * @fileoverview NVM 廠商核心專利地圖 UI 渲染器 (Vendor Patent Maps UI Renderer)
 * 嚴格遵循 Patent Map 定義：以專利申請機構 (By Filing Company / Assignee) 為主體展開分析，
 * 扁平化架構杜絕多層過度嵌套，直觀呈現公司專利佈局、第一性原理獨立權利項 (Claim 1) 邊界、
 * 晶圓製程相容性與商用產品承接脈絡。
 */

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const paragraphs = value => (Array.isArray(value) ? value : [value]).filter(Boolean).flatMap(text => String(text).split(/\n\s*\n/u)).map(text => `<p>${esc(text)}</p>`).join('');

// 分類只引用既有技術組合 ID；新增組合必須明確分類，不能靜默猜測。
export const patentMapTechnologies = {
  otp: {label: 'OTP', families: ['neobit-family', 'neofuse-family', 'kilopass-xpm-family', 'kilopass-secretcode-family', 'sidense-1tfuse-family', 'attopsemi-ifuse-family']},
  mtp: {label: 'MTP', families: ['neoee-family', 'neomtp-family', 'ymc-mtp-family', 'aeon-fnfn-family', 'nscore-spacer-family', 'floadia-zt-family']},
  eflash: {label: 'eFlash', families: ['floadia-g1g2-family', 'sst-superflash-family']},
  mram: {label: 'MRAM', families: ['everspin-toggle-family', 'everspin-stt-family']},
  reram: {label: 'ReRAM', families: ['weebit-oxram-family']},
  security: {label: 'PUF / RoT', families: ['neopuf-family', 'pufsecurity-rot-family']}
};
export function patentMapTechnology(family) {
  const key = Object.keys(patentMapTechnologies).find(key => patentMapTechnologies[key].families.includes(family.id));
  if (!key) throw new Error(`技術組合尚未分類：${family.id}`);
  return key;
}
const recordedStatus = (status, en) => status === 'active'
  ? (en ? 'Recorded active' : '資料標示有效') : status === 'expired'
  ? (en ? 'Recorded expired' : '資料標示屆滿') : (en ? 'Needs verification' : '待核對');
const evidenceNote = en => en
  ? 'Status and term dates are recorded research data, not current legal determinations. Expiration of one patent does not establish freedom to operate: jurisdiction, related rights, claim scope, maintenance and term adjustments require case-specific review.'
  : '狀態與期滿日是收錄資料，並非即時法律查證。單一專利屆滿不能直接判定可自由實施；仍須按司法管轄地、相關權利、權利項、維持費與期間調整逐案核對。';
const evidenceLinks = en => `<a href="https://www.uspto.gov/patents/basics/essentials" target="_blank" rel="noopener noreferrer">${en ? 'USPTO: scope of patent rights' : 'USPTO：專利權範圍'}</a> · <a href="https://www.uspto.gov/patents/laws/patent-term-calculator" target="_blank" rel="noopener noreferrer">${en ? 'Patent term calculation' : '專利期間計算'}</a>`;

function renderMapExplorer(data, en) {
  const entries = Object.entries(patentMapTechnologies);
  return `<section class="nvm-map-explorer" aria-labelledby="nvm-map-heading">
    <header><p class="nvm-kicker">${en ? '01 · FIND → COMPARE → READ' : '01 · 查找 → 比較 → 讀案卷'}</p><h3 id="nvm-map-heading">${en ? 'Explore the Patent Map' : '探索專利地圖'}</h3><p>${en ? 'Search a publication number, company, product or mechanism. Combine filters to narrow the dossiers below.' : '以公報號、廠商、產品或物理機制查找，搭配篩選縮小下方案卷範圍。'}</p></header>
    <form class="nvm-map-controls" role="search" aria-label="${en ? 'Search patent map' : '搜尋專利地圖'}" data-map-controls hidden>
      <label for="nvm-map-query">${en ? 'Search the map' : '搜尋地圖'}<input id="nvm-map-query" type="search" placeholder="${en ? 'e.g. US6678190B2, NeoBit, tunneling' : '例如 US6678190B2、NeoBit、穿隧'}" autocomplete="off" aria-controls="nvm-map-results nvm-map-dossiers"></label>
      <label for="nvm-map-company">${en ? 'Company / IP lineage' : '廠商／IP 沿革'}<select id="nvm-map-company"><option value="">${en ? 'All companies / lineages' : '全部廠商／沿革'}</option>${data.vendors.map(v=>`<option value="${esc(v.id)}">${esc(v.shortName)}</option>`).join('')}</select></label>
      <label for="nvm-map-technology">${en ? 'Technology' : '技術分類'}<select id="nvm-map-technology"><option value="">${en ? 'All technologies' : '全部技術'}</option>${entries.map(([key,value]) => `<option value="${key}">${value.label}</option>`).join('')}</select></label>
      <label for="nvm-map-status">${en ? 'Recorded status' : '收錄狀態'}<select id="nvm-map-status"><option value="">${en ? 'All statuses' : '全部狀態'}</option><option value="active">${recordedStatus('active',en)}</option><option value="expired">${recordedStatus('expired',en)}</option></select></label>
      <button type="reset">${en ? 'Reset filters' : '清除篩選'}</button>
    </form>
    <p id="nvm-map-count" role="status" aria-live="polite" aria-atomic="true"></p>
    <div class="nvm-map-matrix-wrap" role="region" tabindex="0" aria-label="${en ? 'Company and technology matrix; scroll horizontally on small screens' : '廠商與技術矩陣；窄螢幕可橫向捲動'}"><table class="nvm-map-matrix"><caption>${en ? 'Company × technology · counts are curated records, not portfolio size. Select a cell to read its first matching portfolio.' : '廠商 × 技術；數字為收錄紀錄數，非廠商專利總量。選取數字可前往首個符合的技術組合。'}</caption><thead><tr><th scope="col">${en ? 'Company / IP lineage' : '廠商／IP 沿革'}</th>${entries.map(([,value])=>`<th scope="col">${value.label}</th>`).join('')}<th scope="col">${en ? 'Records' : '紀錄'}</th></tr></thead><tbody>${data.vendors.map(v=>`<tr data-map-vendor-row="${esc(v.id)}"><th scope="row"><a href="#vendor-${esc(v.id)}">${esc(v.shortName)}</a></th>${entries.map(([key,value])=>{
      const families = v.families.filter(f=>patentMapTechnology(f)===key);
      const count = families.reduce((sum,f)=>sum+f.patents.length,0);
      return `<td data-map-cell="${key}" data-label="${esc(value.label)}">${count ? `<a href="#family-${esc(families[0].id)}" aria-label="${esc(v.shortName)} · ${value.label} · ${count} ${en?'records':'筆紀錄'}">${count}</a>` : '<span aria-label="'+(en?'Not covered':'未收錄')+'">—</span>'}</td>`;
    }).join('')}<td data-map-row-total data-label="${en ? 'Total Records' : '總收錄'}">${v.families.reduce((sum,f)=>sum+f.patents.length,0)}</td></tr>`).join('')}</tbody></table></div>
    <p class="nvm-map-empty" id="nvm-map-empty" hidden>${en ? 'No matching records. Try a shorter search or reset the filters.' : '沒有符合的紀錄。請縮短關鍵字或清除篩選。'} <button type="button" class="nvm-map-reset-btn" data-map-reset>${en ? 'Clear all filters' : '清除所有篩選'}</button></p>
    <div id="nvm-map-results" hidden><h4>${en ? 'Matching Publications' : '符合的公報紀錄'}</h4><ul>${data.vendors.flatMap(v=>v.families.flatMap(f=>f.patents.map(p=>`<li data-map-result="vendor-patent-${esc(f.id)}-${esc(p.id)}"><a href="#vendor-patent-${esc(f.id)}-${esc(p.id)}"><strong>${esc(p.id)}</strong> · ${esc(v.shortName)} · ${esc(f.name)}</a><span>${esc(p.title)}</span></li>`))).join('')}</ul></div>
    <nav class="nvm-map-reading-links" aria-label="${en ? 'Map reading paths' : '專利地圖閱讀路徑'}"><a href="#nvm-map-dossiers">${en ? 'Read all company dossiers' : '閱讀廠商案卷'}</a><a href="#vendor-patent-landscape-overview">${en ? 'Business comparison appendix' : '商業比較附錄'}</a><a href="#nvm-map-evidence">${en ? 'Sources and reading boundaries' : '來源與判讀界線'}</a></nav>
  </section>`;
}

/**
 * 驗證廠商專利地圖資料契約之完整性
 * @param {object} data 專利地圖資料物件
 */
export function validateVendorPatentMaps(data) {
  if (!data || !Array.isArray(data.vendors) || !data.vendors.length) {
    throw new Error('廠商專利地圖缺少 vendors 陣列');
  }
  const ids = new Set();
  for (const vendor of data.vendors) {
    if (ids.has(vendor.id)) throw new Error(`重複廠商 ID：${vendor.id}`);
    ids.add(vendor.id);
    for (const key of ['id', 'name', 'shortName', 'headquarters', 'founded', 'founders', 'businessModel', 'strategy']) {
      if (!vendor[key]) throw new Error(`廠商 ${vendor.id || '未知'} 缺少必要欄位：${key}`);
    }
    if (!vendor.patentStats || !vendor.patentStats.totalGrantedWorldwide) {
      throw new Error(`廠商 ${vendor.id} 缺少專利統計數據`);
    }
    if (!Array.isArray(vendor.families) || !vendor.families.length) {
      throw new Error(`廠商 ${vendor.id} 缺少 families 專利家族`);
    }
    for (const family of vendor.families) {
      patentMapTechnology(family);
      if (ids.has(family.id)) throw new Error(`重複技術組合 ID：${family.id}`);
      ids.add(family.id);
      const patentIds = new Set();
      for (const fkey of ['id', 'name', 'tagline', 'technologyType', 'cellTopology', 'physicalMechanism', 'processNode', 'summary']) {
        if (!family[fkey]) throw new Error(`專利家族 ${family.id || '未知'} 缺少必要欄位：${fkey}`);
      }
      if (!Array.isArray(family.patents) || !family.patents.length) {
        throw new Error(`專利家族 ${family.id} 缺少 patents 列表`);
      }
      for (const patent of family.patents) {
        if (patentIds.has(patent.id)) throw new Error(`同組合重複公報：${patent.id}`);
        patentIds.add(patent.id);
        if (!['active','expired'].includes(patent.legalStatus)) throw new Error(`未支援的收錄狀態：${patent.id}`);
        if (!/^https:\/\/patents\.google\.com\/patent\//u.test(patent.url)) throw new Error(`專利來源網址無效：${patent.id}`);
        for (const pkey of ['id', 'title', 'grantDate', 'priorityDate', 'inventors', 'assignee', 'url', 'coreProblem', 'mechanism', 'claimFocus', 'productLink', 'legalStatus', 'expirationDate', 'patentCategory', 'generation', 'ftoStatus']) {
          if (!patent[pkey]) throw new Error(`專利 ${patent.id || '未知'} 缺少必要欄位：${pkey}`);
        }
      }
    }
    if (!Array.isArray(vendor.milestones) || !vendor.milestones.length) {
      throw new Error(`廠商 ${vendor.id} 缺少 milestones 演進里程碑`);
    }
  }
}

/**
 * 產生編輯式面板標頭
 */
function editorialHeader(data, en) {
  const records = data.vendors.flatMap(v=>v.families.flatMap(f=>f.patents));
  const unique = new Set(records.map(p=>p.id)).size;
  const families = data.vendors.reduce((sum,v)=>sum+v.families.length,0);
  return `<header class="nvm-editorial-header nvm-map-header"><div><p class="nvm-kicker">NVM · PATENT MAP</p><h2 tabindex="-1">${en ? 'From Technology to Patent Evidence' : '從技術路線讀懂專利布局'}</h2><p class="nvm-lede">${en ? 'Compare companies and technology portfolios, then trace each publication to its technical mechanism, claim reading and source.' : '先比較廠商與技術組合，再追到每份公報的物理機制、權利項導讀與來源。'}</p><p class="nvm-map-asof">${en?'Dataset date':'資料日期'}：<time datetime="${esc(data.asOf)}">${esc(data.asOf)}</time> · ${en?'Curated coverage; not an exhaustive patent search.':'選錄研究，非完整專利檢索。'}</p></div><dl class="nvm-map-stats"><div><dt>${en?'Companies':'廠商'}</dt><dd>${data.vendors.length}</dd></div><div><dt>${en?'Technology portfolios':'技術組合'}</dt><dd>${families}</dd></div><div><dt>${en?'Distinct publications':'不同公報'}</dt><dd>${unique}</dd></div><div><dt>${en?'Curated records':'收錄紀錄'}</dt><dd>${records.length}</dd></div></dl></header>`;
}

/**
 * 渲染單一專利分析卡片（扁平化直接呈現，包含法律狀態與詳細分類）
 */
function renderPatentRecord(patent, family, vendor, en) {
  const labels = en
    ? {
        problem: 'Technical & Physical Problem Addressed',
        mechanism: 'First-Principles Solution & Device Structure',
        claim: 'Independent Claim Reading · Editorial Interpretation',
        fto: 'Existing FTO Research Note · Requires Case Review',
        product: 'Product / Foundry Linkage · Recorded Research',
        priority: 'Priority Date',
        grant: 'Grant Date',
        expiry: 'Term Completion',
        inventors: 'Inventors',
        assignee: 'Assignee',
        viewFull: 'View Full Patent Gazette at Google Patents'
      }
    : {
        problem: '欲解決之核心物理與工程問題',
        mechanism: '第一性原理實施機制與單元結構',
        claim: '獨立權利項導讀・編輯解讀',
        fto: '既有 FTO 研究筆記・待個案核對',
        product: '產品／代工承接・收錄研究',
        priority: '優先權日',
        grant: '核准日',
        expiry: '專利期滿日',
        inventors: '發明人',
        assignee: '專利受讓權人',
        viewFull: '開啟 Google Patents 原始專利公報全文'
      };

  const familyId = family.id;
  const searchText = [vendor.name,vendor.shortName,family.name,family.technologyType,family.physicalMechanism,patent.id,patent.title,patent.assignee,patent.coreProblem,patent.mechanism,patent.claimFocus,patent.productLink].join(' ').normalize('NFKC').toLocaleLowerCase();
  const isActive = patent.legalStatus === 'active';
  const statusBadge = `<span class="nvm-patent-badge-status ${isActive?'nvm-status-active':'nvm-status-expired'}"><span class="nvm-status-indicator" aria-hidden="true"></span>${recordedStatus(patent.legalStatus,en)}</span>`;
  const expiryText = `${en?'Recorded term date':'收錄期滿日'}: ${esc(patent.expirationDate)}`;

  const categoryBadge = `<span class="nvm-patent-badge-pill nvm-badge-cat" title="${en ? 'Claim Scope Type' : '權利項範疇類型'}">${esc(en ? patent.patentCategoryEn : patent.patentCategory)}</span>`;
  const genBadge = `<span class="nvm-patent-badge-pill nvm-badge-gen" title="${en ? 'Technology Generation' : '技術世代分類'}">${esc(en ? patent.generationEn : patent.generation)}</span>`;

  return `<div data-map-record data-map-status="${esc(patent.legalStatus)}" data-map-search="${esc(searchText)}" class="nvm-vendor-patent-card ${isActive ? 'nvm-card-active' : 'nvm-card-expired'}" id="vendor-patent-${esc(familyId)}-${esc(patent.id)}"><div class="nvm-patent-card-head"><div class="nvm-patent-card-identity"><a href="${esc(patent.url)}" target="_blank" rel="noopener noreferrer" class="nvm-patent-id-badge">${esc(patent.id)} <span aria-hidden="true">↗</span></a><h6 class="nvm-patent-card-title" tabindex="-1">${esc(patent.title)}</h6></div><div class="nvm-patent-card-badges">${statusBadge}<span class="nvm-patent-expiry-tag">${expiryText}</span>${categoryBadge}${genBadge}</div></div><div class="nvm-map-record-actions"><a data-map-return href="#nvm-map-heading">${en ? 'Back to map search' : '返回地圖搜尋'}</a></div><dl class="nvm-patent-card-body"><div class="nvm-patent-grid-row nvm-patent-claim-row"><dt>${labels.claim}</dt><dd class="nvm-patent-claim-text">${esc(patent.claimFocus)}</dd></div><div class="nvm-patent-grid-row nvm-patent-fto-row"><dt>${labels.fto}</dt><dd class="nvm-patent-fto-text"><p>${esc(en ? patent.ftoStatusEn : patent.ftoStatus)}</p></dd></div><div class="nvm-patent-grid-row"><dt>${labels.mechanism}</dt><dd>${esc(patent.mechanism)}</dd></div><div class="nvm-patent-grid-row"><dt>${labels.problem}</dt><dd>${esc(patent.coreProblem)}</dd></div><div class="nvm-patent-grid-row"><dt>${labels.product}</dt><dd><strong>${esc(patent.productLink)}</strong></dd></div><div class="nvm-patent-footer-meta"><dt>${labels.assignee}</dt><dd>${esc(patent.assignee)}</dd><dt>${labels.inventors}</dt><dd>${esc(patent.inventors)} · ${labels.priority}: ${esc(patent.priorityDate)} · ${labels.grant}: ${esc(patent.grantDate)} · <a href="${esc(patent.url)}" target="_blank" rel="noopener noreferrer">${labels.viewFull} <span aria-hidden="true">↗</span></a></dd></div></dl></div>`;
}

/**
 * 渲染單一專利組合群組 (Patent Portfolio Group)
 */
function renderPatentFamily(family, vendor, en) {
  const specs = en
    ? [
        { label: 'Technology Type', value: family.technologyType },
        { label: 'Bitcell Topology', value: family.cellTopology },
        { label: 'Physical Mechanism', value: family.physicalMechanism },
        { label: 'Process Compatibility', value: family.processNode }
      ]
    : [
        { label: '技術類型', value: family.technologyType },
        { label: '單元拓撲結構', value: family.cellTopology },
        { label: '第一性原理儲存物理', value: family.physicalMechanism },
        { label: '晶圓代工節點相容性', value: family.processNode }
      ];

  const activePatents = family.patents.filter(p => p.legalStatus === 'active').length;
  const expiredPatents = family.patents.filter(p => p.legalStatus === 'expired').length;

  const patentCountLabel = en
    ? `${family.patents.length} Curated Records (${activePatents} Recorded active, ${expiredPatents} Recorded expired)`
    : `${family.patents.length} 筆收錄紀錄（${activePatents} 筆標示有效，${expiredPatents} 筆標示屆滿）`;

  return `<section class="nvm-patent-portfolio-group" id="family-${esc(family.id)}" data-map-family data-map-technology="${patentMapTechnology(family)}"><header class="nvm-portfolio-group-header"><div class="nvm-portfolio-group-title"><span class="nvm-portfolio-tagline">${esc(family.tagline)}</span><h4>${esc(family.name)}</h4></div><div class="nvm-portfolio-specs"><dl>${specs.map(item => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join('')}</dl></div></header><div class="nvm-portfolio-summary"><p>${esc(family.summary)}</p></div><div class="nvm-portfolio-patents-section"><h5 class="nvm-portfolio-patents-heading">${patentCountLabel}</h5><div class="nvm-patent-cards-stack">${family.patents.map(patent => renderPatentRecord(patent, family, vendor, en)).join('')}</div></div></section>`;
}

/**
 * 渲染專利攻防、訴訟爭點與 FTO 深度案卷 (Patent Litigation & Defense Dossier)
 */
function renderLitigationDefense(lit, en) {
  if (!lit) return '';
  const title = lit.title || (en ? 'Patent Defense Strategy & Landmark Litigation' : '專利防禦戰略與指標訴訟攻防');
  return `<section class="nvm-vendor-litigation-section"><header class="nvm-litigation-header"><span class="nvm-litigation-kicker">${en ? 'PATENT DEFENSE & LITIGATION DOSSIER' : '專利攻防與訴訟案卷'}</span><h4>${esc(title)}</h4><p class="nvm-litigation-overview">${esc(lit.overview)}</p></header><div class="nvm-litigation-battles">${(lit.keyBattles || []).map(b => `<article class="nvm-battle-card"><h5>${esc(b.heading)}</h5><p>${esc(b.detail)}</p></article>`).join('')}</div><div class="nvm-litigation-fto-box"><strong>${en ? 'Existing FTO Research Note · Requires Case Review:' : '既有 FTO 研究筆記・待個案核對：'}</strong><p>${esc(lit.ftoVerdict)}</p></div></section>`;
}

/**
 * 渲染專利戰略演進時序線 (Patent Roadmap & Evolution Timeline)
 */
function renderMilestones(milestones, en) {
  const sectionTitle = en ? 'Patent Strategy & Technology Evolution Roadmap' : '專利戰略佈局與技術演進時序線';
  const introText = en
    ? 'Multi-decade tracking of how patent claims and application boundaries co-evolved alongside foundry process technology breakthroughs.'
    : '追蹤該專利申請機構數十年專利權利項如何與全球晶圓代工先進製程同頻演進。';

  return `<section class="nvm-patent-timeline-section"><h4>${sectionTitle}</h4><p class="nvm-timeline-intro">${introText}</p><div class="nvm-patent-timeline">${milestones.map(node => `<article class="nvm-timeline-node"><div class="nvm-timeline-period"><span>${esc(node.period)}</span><small>${esc(node.era)}</small></div><div class="nvm-timeline-content"><h5>${esc(node.theme)}</h5><p>${esc(node.summary)}</p><dl><dt>${en ? 'Foundry Node' : '代表節點'}</dt><dd>${esc(node.nodes)}</dd><dt>${en ? 'Key Patents' : '代表專利'}</dt><dd>${esc(node.keyPatents)}</dd></dl></div></article>`).join('')}</div></section>`;
}

/**
 * 渲染以申請機構為核心的專利地圖檔案 (Patent Map Dossier by Filing Company)
 */
function renderVendorStudy(vendor, en, cite) {
  const stats = vendor.patentStats;
  const statLabels = en
    ? [
        { label: 'Global Granted Patents', value: stats.totalGrantedWorldwide },
        { label: 'Key Filing Jurisdictions', value: stats.keyJurisdictions },
        { label: 'Foundry Integration', value: stats.foundryCoverage },
        { label: 'Silicon Production Track Record', value: stats.waferShipment }
      ]
    : [
        { label: '全球核准專利總量', value: stats.totalGrantedWorldwide },
        { label: '主要專利申請管轄地', value: stats.keyJurisdictions },
        { label: '晶圓代工驗證平台', value: stats.foundryCoverage },
        { label: '商用晶片量產規模', value: stats.waferShipment }
      ];

  const metaLabels = en
    ? {
        headquarters: 'Headquarters',
        founded: 'Founded',
        founders: 'Key R&D Leadership / Inventors',
        businessModel: 'Business Model',
        strategy: 'Patent Moat & IP Strategy',
        portfoliosNav: 'Patent Portfolios by Technology'
      }
    : {
        headquarters: '全球總部',
        founded: '創立年份',
        founders: '核心研發與專利發明人團隊',
        businessModel: '商業營運模式',
        strategy: '專利護城河與佈局戰略',
        portfoliosNav: '專利組合群組導航'
      };

  const allPatents = vendor.families.flatMap(f => f.patents);
  const activeCount = allPatents.filter(p => p.legalStatus === 'active').length;
  const expiredCount = allPatents.filter(p => p.legalStatus === 'expired').length;

  return `<section id="vendor-${esc(vendor.id)}" data-map-vendor="${esc(vendor.id)}" class="nvm-vendor-study nvm-patent-dossier" tabindex="-1"><header class="nvm-vendor-profile-header"><div class="nvm-dossier-kicker-strip"><span class="nvm-dossier-kicker">${en ? 'COMPANY / IP LINEAGE DOSSIER' : '廠商／IP 沿革案卷'}</span><span class="nvm-dossier-model">${esc(vendor.businessModel)}</span></div><h3 class="nvm-dossier-title">${esc(vendor.name)} <small>(${esc(vendor.shortName)})</small></h3><div class="nvm-vendor-meta-strip"><span><strong>${metaLabels.headquarters}:</strong> ${esc(vendor.headquarters)}</span><span><strong>${metaLabels.founded}:</strong> ${esc(vendor.founded)}</span><span><strong>${metaLabels.founders}:</strong> ${esc(vendor.founders)}</span><span class="nvm-meta-status-pill"><strong>${en ? 'Recorded Status:' : '收錄狀態：'}</strong> <span class="nvm-meta-active">${activeCount} ${en ? 'Recorded active' : '筆標示有效'}</span> · <span class="nvm-meta-expired">${expiredCount} ${en ? 'Recorded expired' : '筆標示屆滿'}</span></span></div></header><dl class="nvm-vendor-stats-grid">${statLabels.map(item => `<div class="nvm-vendor-stat-card"><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join('')}</dl><div class="nvm-vendor-strategy"><h4>${metaLabels.strategy}</h4><p>${esc(vendor.strategy)}</p></div><nav class="nvm-family-jump-nav" aria-label="${metaLabels.portfoliosNav}"><span class="nvm-family-jump-title">${metaLabels.portfoliosNav}：</span>${vendor.families.map(f => `<a href="#family-${esc(f.id)}">${esc(f.name.split(' ')[0])} (${f.patents.length})</a>`).join('')}</nav><div class="nvm-patent-families">${vendor.families.map(f => renderPatentFamily(f, vendor, en)).join('')}</div>${renderLitigationDefense(vendor.litigationDefense, en)}${renderMilestones(vendor.milestones, en)}</section>`;
}

/**
 * 渲染橫向產業競爭格局與商業矩陣（作為獨立附錄，不冒充 Patent Map）
 */
function renderCompetitiveMatrix(data, en) {
  const sectionTitle = en
    ? 'Appendix: NVM Industry Competitive Landscape & Business Matrix'
    : '附錄：NVM 全球產業競爭格局與營運矩陣';
  const sectionIntro = en
    ? `Compare the ${data.vendors.length} curated companies by business model, technology, mechanism and recorded foundry linkage. Company totals and production claims are contextual research, not counts of the publications covered here.`
    : `橫向比較 ${data.vendors.length} 家收錄廠商的商業模式、技術組合、物理機制與代工承接。公司總量與量產主張屬背景研究，並非本地圖所收錄公報的數量。`;

  const colLabels = en
    ? [
        'Company / IP Lineage & Business Model',
        'Technology Portfolios',
        'Physical Mechanism',
        'Publications (Recorded Status)',
        'Foundry Platform & Scale'
      ]
    : [
        '廠商／IP 沿革與商業模式',
        '代表技術群組',
        '儲存物理機制',
        '代表公報（資料收錄狀態）',
        '代工平台覆蓋與量產規模'
      ];

  const rows = data.vendors.map((vendor, index) => {
    const no = String(index + 1).padStart(2, '0');
    const familiesSummary = vendor.families.map(f => `<span class="nvm-landscape-family-item"><strong>${esc(f.name.split(' ')[0])}</strong> <small>(${esc(f.technologyType)})</small></span>`).join('<br>');
    const physicsSummary = vendor.families.map(f => `<p class="nvm-landscape-physics-p"><strong>${esc(f.name.split(' ')[0])}：</strong>${esc(f.physicalMechanism)}</p>`).join('');
    const patentsSummary = vendor.families.flatMap(f => f.patents).map(p => {
      const isActive = p.legalStatus === 'active';
      const statusClass = isActive ? 'nvm-patent-tag-active' : 'nvm-patent-tag-expired';
      const tooltip = `${esc(p.title)} · ${recordedStatus(p.legalStatus,en)}`;
      return `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="nvm-landscape-patent-badge ${statusClass}" title="${tooltip}"><span class="nvm-status-dot" aria-hidden="true">${isActive ? '●' : '○'}</span> ${esc(p.id)} <span aria-hidden="true">↗</span></a>`;
    }).join(' ');
    const foundrySummary = `<p class="nvm-landscape-foundry-p"><strong>${en ? 'Foundries:' : '代工平台：'}</strong>${esc(vendor.patentStats.foundryCoverage)}</p><p class="nvm-landscape-foundry-p"><strong>${en ? 'Shipment:' : '量產實績：'}</strong>${esc(vendor.patentStats.waferShipment)}</p>`;

    return `<tr><td data-label="${colLabels[0]}"><span class="nvm-landscape-vendor-no">${no}</span><a href="#vendor-${esc(vendor.id)}" class="nvm-landscape-vendor-link"><strong>${esc(vendor.shortName)}</strong></a><p class="nvm-landscape-vendor-sub">${esc(vendor.name)}</p><small class="nvm-landscape-model">${esc(vendor.businessModel)}</small></td><td data-label="${colLabels[1]}">${familiesSummary}</td><td data-label="${colLabels[2]}">${physicsSummary}</td><td data-label="${colLabels[3]}"><div class="nvm-landscape-patents">${patentsSummary}</div></td><td data-label="${colLabels[4]}">${foundrySummary}</td></tr>`;
  }).join('');

  const legend = `<p class="nvm-map-status-note">${esc(evidenceNote(en))}</p>`;

  return `<section id="vendor-patent-landscape-overview" class="nvm-vendor-landscape-overview nvm-competitive-appendix" tabindex="-1"><header class="nvm-landscape-header"><p class="nvm-kicker">${en ? 'INDUSTRY COMPETITIVE MATRIX' : '產業競爭關係對照'}</p><h3>${esc(sectionTitle)}</h3><p class="nvm-landscape-lede">${esc(sectionIntro)}</p>${legend}</header><div class="nvm-landscape-table-wrap" role="region" tabindex="0" aria-label="${esc(sectionTitle)}"><table class="nvm-table nvm-vendor-landscape-table"><caption class="nvm-small">${esc(sectionTitle)}</caption><thead><tr>${colLabels.map(l => `<th scope="col">${esc(l)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

/**
 * 渲染全頁廠商專利地圖面板
 * 扁平化結構：標頭 ➔ Filing Company 快速導覽 ➔ 各公司專利地圖案卷 ➔ 競爭關係附錄
 * @param {object} data 專利資料物件
 * @param {string} language 語系 ('zh' | 'en')
 * @param {function} cite 引用輔助函式
 */
export function renderVendorPatentMaps(data, language, cite) {
  const en = language === 'en';
  validateVendorPatentMaps(data);

  const vendorNavTitle = en ? 'Company dossier shortcuts:' : '廠商案卷快速連結：';

  return `<article id="patent-maps" class="nvm-panel nvm-patent-maps-editorial" data-nvm-panel>${editorialHeader(data, en)}${renderMapExplorer(data,en)}<section id="nvm-map-evidence" class="nvm-map-evidence" tabindex="-1"><h3>${en?'How to Read This Map':'如何判讀這張地圖'}</h3><p>${esc(evidenceNote(en))} ${evidenceLinks(en)}</p><p>${en?'Technology portfolios are editorial groupings, not legal patent families. One publication may appear in several portfolios. Company headings follow product lineage; the assignee on each record remains separate.':'技術組合是編輯分類，不等於法律上的專利家族；同一公報可能跨組合收錄。廠商標題沿產品承接脈絡整理，各筆公報的受讓人另行列示。'}</p></section><nav class="nvm-vendor-nav nvm-entity-nav" aria-label="${en ? 'Company Dossiers' : '廠商案卷選單'}"><span class="nvm-vendor-nav-title">${vendorNavTitle}</span><div class="nvm-entity-pills">${data.vendors.map(v => {
    const vPatents = v.families.flatMap(f => f.patents);
    return `<a href="#vendor-${esc(v.id)}" class="nvm-entity-pill"><strong>${esc(v.shortName)}</strong><span>(${vPatents.length} ${en ? 'records' : '筆'})</span></a>`;
  }).join('')}</div></nav><div class="nvm-vendor-studies" id="nvm-map-dossiers" tabindex="-1">${data.vendors.map(v => renderVendorStudy(v, en, cite)).join('')}</div>${renderCompetitiveMatrix(data, en)}<nav class="nvm-bottom-nav" aria-label="${en ? 'Patent Maps Navigation' : '專利地圖章節導覽'}"><a href="#panorama">${en ? 'Return to the Atlas Overview' : '回到技術全景目錄'}</a><a href="#ip-directory">${en ? 'Continue to IP Cells Directory' : '接著讀：IP 單元與操作原理'}</a></nav></article>`;
}

/**
 * 匯出專利地圖為 Markdown 格式
 */
export function vendorPatentMapsMarkdown(data, sourceMarkdown, language) {
  const en = language === 'en';
  let md = `\n\n## ${en ? 'NVM Patent Maps · By Filing Company' : '具名機構核心專利地圖（By Filing Company 分析）'}\n\n`;
  md += `${en?'Dataset date':'資料日期'}: ${data.asOf}\n\n${evidenceNote(en)}\n\n[USPTO](https://www.uspto.gov/patents/basics/essentials) · [${en?'Patent term':'專利期間'}](https://www.uspto.gov/patents/laws/patent-term-calculator)\n\n`;

  for (const v of data.vendors) {
    const vPatents = v.families.flatMap(f => f.patents);
    const vActive = vPatents.filter(p => p.legalStatus === 'active').length;
    const vExpired = vPatents.filter(p => p.legalStatus === 'expired').length;

    md += `### ${v.name} (${v.shortName})\n\n`;
    md += `- **${en ? 'Headquarters' : '總部'}**: ${v.headquarters}\n`;
    md += `- **${en ? 'Founded' : '創立年份'}**: ${v.founded}\n`;
    md += `- **${en ? 'Leadership' : '核心研發/發明人'}**: ${v.founders}\n`;
    md += `- **${en ? 'Business Model' : '商業模式'}**: ${v.businessModel}\n`;
    md += `- **${en ? 'Recorded Portfolio Status' : '組合收錄狀態'}**: ${en ? `${vActive} Recorded active · ${vExpired} Recorded expired` : `資料標示有效 ${vActive} 筆 · 資料標示屆滿 ${vExpired} 筆`}\n`;
    md += `- **${en ? 'Global Patents' : '全球核准專利'}**: ${v.patentStats.totalGrantedWorldwide}\n`;
    md += `- **${en ? 'Patent Strategy' : '專利護城河戰略'}**: ${v.strategy}\n\n`;

    for (const f of v.families) {
      md += `#### ${f.name} (${f.technologyType})\n\n`;
      md += `*${f.tagline}*\n\n`;
      md += `- **${en ? 'Cell Topology' : '單元拓撲'}**: ${f.cellTopology}\n`;
      md += `- **${en ? 'Physical Mechanism' : '儲存物理'}**: ${f.physicalMechanism}\n`;
      md += `- **${en ? 'Process Node' : '製程節點'}**: ${f.processNode}\n\n${f.summary}\n\n`;

      for (const p of f.patents) {
        md += `##### [${p.id}](${p.url}) · ${p.title}\n\n`;
        md += `- **${en ? 'Recorded Status' : '收錄狀態'}**: ${recordedStatus(p.legalStatus,en)} (${en ? 'Recorded term date:' : '收錄期滿日:'} ${p.expirationDate})\n`;
        md += `- **${en ? 'Category & Generation' : '分類與世代'}**: ${en ? p.patentCategoryEn : p.patentCategory} · ${en ? p.generationEn : p.generation}\n`;
        md += `- **${en ? 'Priority / Grant' : '優先權日 / 核准日'}**: ${p.priorityDate} / ${p.grantDate}\n`;
        md += `- **${en ? 'Assignee' : '收錄受讓人'}**: ${p.assignee}\n`;
        md += `- **${en ? 'Technical Problem' : '技術問題'}**: ${p.coreProblem}\n`;
        md += `- **${en ? 'Product Linkage' : '產品承接'}**: ${p.productLink}\n`;
        md += `- **${en ? 'Inventors' : '發明人'}**: ${p.inventors}\n`;
        md += `- **${en ? 'Claim 1 Reading' : '獨立權利項導讀'}**: ${p.claimFocus}\n`;
        md += `- **${en ? 'Existing FTO Note · Requires Case Review' : '既有 FTO 筆記・待個案核對'}**: ${en ? p.ftoStatusEn : p.ftoStatus}\n`;
        md += `- **${en ? 'Physical Solution' : '物理機制'}**: ${p.mechanism}\n`;
      }
    }

    md += `#### ${en?'Technology Milestones':'技術里程碑'}\n\n`;
    for (const m of v.milestones) md += `- **${m.period} · ${m.theme}** (${m.era}) — ${m.summary} ${m.nodes} · ${m.keyPatents}\n`;

    if (v.litigationDefense) {
      const lit = v.litigationDefense;
      md += `#### ${en ? 'Patent Defense Strategy & Landmark Litigation' : '專利防禦戰略與指標訴訟攻防'}: ${lit.title}\n\n`;
      md += `${lit.overview}\n\n`;
      for (const b of (lit.keyBattles || [])) {
        md += `##### ${b.heading}\n\n${b.detail}\n\n`;
      }
      md += `> **${en ? 'Existing FTO Note · Requires Case Review' : '既有 FTO 筆記・待個案核對'}**: ${lit.ftoVerdict}\n\n`;
    }
  }

  md += `### ${en ? 'Appendix: Industry Competitive Landscape Matrix' : '附錄：NVM 全球產業競爭格局與營運矩陣'}\n\n`;
  md += `| ${en ? 'No. & Filing Entity' : '序號與專利申請機構'} | ${en ? 'Key Portfolios' : '代表專利組合'} | ${en ? 'Physical Mechanism' : '儲存物理機制'} | ${en ? 'Milestone Patents' : '代表專利公報'} | ${en ? 'Foundry & Scale' : '代工平台與量產規模'} |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  for (let i = 0; i < data.vendors.length; i++) {
    const v = data.vendors[i];
    const no = String(i + 1).padStart(2, '0');
    const fam = v.families.map(f => `${f.name.split(' ')[0]} (${f.technologyType})`).join('；');
    const phy = v.families.map(f => `${f.name.split(' ')[0]}: ${f.physicalMechanism}`).join('；');
    const pat = v.families.flatMap(f => f.patents).map(p => `[${p.id} (${recordedStatus(p.legalStatus,en)})](${p.url})`).join(', ');
    const fnd = `${v.patentStats.foundryCoverage} (${v.patentStats.waferShipment})`;
    md += `| ${no}. ${v.shortName} | ${fam} | ${phy} | ${pat} | ${fnd} |\n`;
  }
  md += '\n\n';

  return md;
}
