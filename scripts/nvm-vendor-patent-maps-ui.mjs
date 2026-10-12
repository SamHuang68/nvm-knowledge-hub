/**
 * @fileoverview NVM 廠商核心專利地圖 UI 渲染器 (Vendor Patent Maps UI Renderer)
 * 嚴格遵循 Patent Map 定義：以專利申請機構 (By Filing Company / Assignee) 為主體展開分析，
 * 扁平化架構杜絕多層過度嵌套，直觀呈現公司專利佈局、第一性原理獨立權利項 (Claim 1) 邊界、
 * 晶圓製程相容性與商用產品承接脈絡。
 */

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const paragraphs = value => (Array.isArray(value) ? value : [value]).filter(Boolean).flatMap(text => String(text).split(/\n\s*\n/u)).map(text => `<p>${esc(text)}</p>`).join('');

/**
 * 驗證廠商專利地圖資料契約之完整性
 * @param {object} data 專利地圖資料物件
 */
export function validateVendorPatentMaps(data) {
  if (!data || !Array.isArray(data.vendors) || !data.vendors.length) {
    throw new Error('廠商專利地圖缺少 vendors 陣列');
  }
  for (const vendor of data.vendors) {
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
      for (const fkey of ['id', 'name', 'tagline', 'technologyType', 'cellTopology', 'physicalMechanism', 'processNode', 'summary']) {
        if (!family[fkey]) throw new Error(`專利家族 ${family.id || '未知'} 缺少必要欄位：${fkey}`);
      }
      if (!Array.isArray(family.patents) || !family.patents.length) {
        throw new Error(`專利家族 ${family.id} 缺少 patents 列表`);
      }
      for (const patent of family.patents) {
        for (const pkey of ['id', 'title', 'grantDate', 'priorityDate', 'inventors', 'assignee', 'url', 'coreProblem', 'mechanism', 'claimFocus', 'productLink']) {
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
  const title = en ? 'NVM Patent Maps · By Filing Company' : '具名機構核心專利地圖（By Filing Company 分析）';
  const intro = en
    ? 'Rigorous patent landscape analyses structured by filing entity (patent assignee). Decoupled from generic competitor matrices to examine actual patent portfolios, first-principles independent claim (Claim 1) protective moats, and commercial foundry integration across leading semiconductor IP proprietors.'
    : '嚴格以專利申請機構（Filing Company / Assignee）為主體開展的專利地圖深度分析。剝離泛用競爭關係圖，直接剖析各專利所有權人的專利組合樹、第一性原理獨立權利項（Claim 1）法律保護壁壘、製程相容性與商用量產晶片承接。';
  const totalPatents = data.vendors.reduce((acc, v) => acc + v.families.reduce((fAcc, f) => fAcc + f.patents.length, 0), 0);
  const totalFamilies = data.vendors.reduce((acc, v) => acc + v.families.length, 0);

  return `<header class="nvm-editorial-header"><div><p class="nvm-kicker">${en ? 'NVM · PATENT MAP BY FILING ENTITY' : 'NVM · 專利地圖（BY FILING COMPANY 分析）'}</p><h2 tabindex="-1">${esc(title)}</h2><div class="nvm-lede">${paragraphs(intro)}</div></div><aside class="nvm-editorial-stat" aria-label="${en ? 'Editorial coverage' : '專利地圖收錄規模'}"><strong>${String(data.vendors.length).padStart(2, '0')}</strong><span>${en ? 'Filing Entities' : '專利所有機構'}</span><small>${en ? `${totalFamilies} Portfolios · ${totalPatents} Milestone Patents` : `${totalFamilies} 個專利組合 · ${totalPatents} 件核心專利`}</small></aside></header>`;
}

/**
 * 渲染單一專利分析卡片（扁平化直接呈現，不搞多層嵌套折疊）
 */
function renderPatentRecord(patent, familyId, en) {
  const labels = en
    ? {
        problem: 'Technical & Physical Problem Addressed',
        mechanism: 'First-Principles Solution & Device Structure',
        claim: 'Independent Claim 1 Reading & Legal Protective Moat',
        product: 'Commercial Silicon Product Linkage & Foundry Integration',
        priority: 'Priority Date',
        grant: 'Grant Date',
        inventors: 'Inventors',
        assignee: 'Assignee',
        viewFull: 'View Full Patent Gazette at Google Patents'
      }
    : {
        problem: '欲解決之核心物理與工程問題',
        mechanism: '第一性原理實施機制與單元結構',
        claim: '獨立權利項 (Claim 1) 導讀與法律保護壁壘',
        product: '商用產品承接與晶圓代工量產落地',
        priority: '優先權日',
        grant: '核准日',
        inventors: '發明人',
        assignee: '專利受讓權人',
        viewFull: '開啟 Google Patents 原始專利公報全文'
      };

  return `<div class="nvm-vendor-patent-card" id="vendor-patent-${esc(familyId)}-${esc(patent.id)}"><div class="nvm-patent-card-head"><div class="nvm-patent-card-identity"><a href="${esc(patent.url)}" target="_blank" rel="noopener noreferrer" class="nvm-patent-id-badge">${esc(patent.id)} <span aria-hidden="true">↗</span></a><h6 class="nvm-patent-card-title">${esc(patent.title)}</h6></div><div class="nvm-patent-card-meta"><span><strong>${labels.grant}:</strong> ${esc(patent.grantDate)}</span><span><strong>${labels.assignee}:</strong> ${esc(patent.assignee)}</span></div></div><div class="nvm-patent-card-body"><div class="nvm-patent-grid-row nvm-patent-claim-row"><dt>${labels.claim}</dt><dd class="nvm-patent-claim-text">${esc(patent.claimFocus)}</dd></div><div class="nvm-patent-grid-row"><dt>${labels.mechanism}</dt><dd>${esc(patent.mechanism)}</dd></div><div class="nvm-patent-grid-row"><dt>${labels.problem}</dt><dd>${esc(patent.coreProblem)}</dd></div><div class="nvm-patent-grid-row"><dt>${labels.product}</dt><dd><strong>${esc(patent.productLink)}</strong></dd></div><div class="nvm-patent-footer-meta"><dt>${labels.inventors}</dt><dd>${esc(patent.inventors)} · ${labels.priority}: ${esc(patent.priorityDate)} · <a href="${esc(patent.url)}" target="_blank" rel="noopener noreferrer">${labels.viewFull} <span aria-hidden="true">↗</span></a></dd></div></div></div>`;
}

/**
 * 渲染單一專利組合群組 (Patent Portfolio Group)
 */
function renderPatentFamily(family, en) {
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

  const patentCountLabel = en
    ? `${family.patents.length} Filed Milestone Patents & Claims Analysis`
    : `${family.patents.length} 件核心申請專利與獨立權利項解析`;

  return `<section class="nvm-patent-portfolio-group" id="family-${esc(family.id)}"><header class="nvm-portfolio-group-header"><div class="nvm-portfolio-group-title"><span class="nvm-portfolio-tagline">${esc(family.tagline)}</span><h4>${esc(family.name)}</h4></div><div class="nvm-portfolio-specs"><dl>${specs.map(item => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join('')}</dl></div></header><div class="nvm-portfolio-summary"><p>${esc(family.summary)}</p></div><div class="nvm-portfolio-patents-section"><h5 class="nvm-portfolio-patents-heading">${patentCountLabel}</h5><div class="nvm-patent-cards-stack">${family.patents.map(patent => renderPatentRecord(patent, family.id, en)).join('')}</div></div></section>`;
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

  return `<section id="vendor-${esc(vendor.id)}" class="nvm-vendor-study nvm-patent-dossier" tabindex="-1"><header class="nvm-vendor-profile-header"><div class="nvm-dossier-kicker-strip"><span class="nvm-dossier-kicker">${en ? 'PATENT FILING ENTITY' : '專利申請機構專題'}</span><span class="nvm-dossier-model">${esc(vendor.businessModel)}</span></div><h3 class="nvm-dossier-title">${esc(vendor.name)} <small>(${esc(vendor.shortName)})</small></h3><div class="nvm-vendor-meta-strip"><span><strong>${metaLabels.headquarters}:</strong> ${esc(vendor.headquarters)}</span><span><strong>${metaLabels.founded}:</strong> ${esc(vendor.founded)}</span><span><strong>${metaLabels.founders}:</strong> ${esc(vendor.founders)}</span></div></header><dl class="nvm-vendor-stats-grid">${statLabels.map(item => `<div class="nvm-vendor-stat-card"><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join('')}</dl><div class="nvm-vendor-strategy"><h4>${metaLabels.strategy}</h4><p>${esc(vendor.strategy)}</p></div><nav class="nvm-family-jump-nav" aria-label="${metaLabels.portfoliosNav}"><span class="nvm-family-jump-title">${metaLabels.portfoliosNav}：</span>${vendor.families.map(f => `<a href="#family-${esc(f.id)}">${esc(f.name.split(' ')[0])} (${f.patents.length})</a>`).join('')}</nav><div class="nvm-patent-families">${vendor.families.map(f => renderPatentFamily(f, en)).join('')}</div>${renderMilestones(vendor.milestones, en)}</section>`;
}

/**
 * 渲染橫向產業競爭格局與商業矩陣（作為獨立附錄，不冒充 Patent Map）
 */
function renderCompetitiveMatrix(data, en) {
  const sectionTitle = en
    ? 'Appendix: NVM Industry Competitive Landscape & Business Matrix'
    : '附錄：NVM 全球產業競爭格局與營運矩陣';
  const sectionIntro = en
    ? 'High-level cross-comparison of commercial business models, key IP families, physical mechanisms, and foundry process compatibility across the 11 analyzed semiconductor IP providers.'
    : '橫向綜覽 11 家具名半導體 IP 供應商的商業模式、代表技術群組、物理機制與晶圓代工覆蓋，作為專利地圖之產業背景參考對照。';

  const colLabels = en
    ? [
        'Proprietor & Business Model',
        'Key IP Families',
        'Physical Mechanism',
        'Representative Gazettes',
        'Foundry Platform & Scale'
      ]
    : [
        '專利所有權人與商業模式',
        '代表技術群組',
        '儲存物理機制',
        '代表專利公報',
        '代工平台覆蓋與量產規模'
      ];

  const rows = data.vendors.map((vendor, index) => {
    const no = String(index + 1).padStart(2, '0');
    const familiesSummary = vendor.families.map(f => `<span class="nvm-landscape-family-item"><strong>${esc(f.name.split(' ')[0])}</strong> <small>(${esc(f.technologyType)})</small></span>`).join('<br>');
    const physicsSummary = vendor.families.map(f => `<p class="nvm-landscape-physics-p"><strong>${esc(f.name.split(' ')[0])}：</strong>${esc(f.physicalMechanism)}</p>`).join('');
    const patentsSummary = vendor.families.flatMap(f => f.patents).map(p => `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="nvm-landscape-patent-badge" title="${esc(p.title)}">${esc(p.id)} <span aria-hidden="true">↗</span></a>`).join(' ');
    const foundrySummary = `<p class="nvm-landscape-foundry-p"><strong>${en ? 'Foundries:' : '代工平台：'}</strong>${esc(vendor.patentStats.foundryCoverage)}</p><p class="nvm-landscape-foundry-p"><strong>${en ? 'Shipment:' : '量產實績：'}</strong>${esc(vendor.patentStats.waferShipment)}</p>`;

    return `<tr><td data-label="${colLabels[0]}"><span class="nvm-landscape-vendor-no">${no}</span><a href="#vendor-${esc(vendor.id)}" class="nvm-landscape-vendor-link"><strong>${esc(vendor.shortName)}</strong></a><p class="nvm-landscape-vendor-sub">${esc(vendor.name)}</p><small class="nvm-landscape-model">${esc(vendor.businessModel)}</small></td><td data-label="${colLabels[1]}">${familiesSummary}</td><td data-label="${colLabels[2]}">${physicsSummary}</td><td data-label="${colLabels[3]}"><div class="nvm-landscape-patents">${patentsSummary}</div></td><td data-label="${colLabels[4]}">${foundrySummary}</td></tr>`;
  }).join('');

  return `<section id="vendor-patent-landscape-overview" class="nvm-vendor-landscape-overview nvm-competitive-appendix" tabindex="-1"><header class="nvm-landscape-header"><p class="nvm-kicker">${en ? 'INDUSTRY COMPETITIVE MATRIX' : '產業競爭關係對照'}</p><h3>${esc(sectionTitle)}</h3><p class="nvm-landscape-lede">${esc(sectionIntro)}</p></header><div class="nvm-landscape-table-wrap"><table class="nvm-table nvm-vendor-landscape-table"><caption class="nvm-small">${esc(sectionTitle)}</caption><thead><tr>${colLabels.map(l => `<th scope="col">${esc(l)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
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

  const vendorNavTitle = en ? 'Select Patent Filing Entity:' : '選擇專利申請機構（By Filing Company）：';

  return `<article id="patent-maps" class="nvm-panel nvm-patent-maps-editorial" data-nvm-panel>${editorialHeader(data, en)}<nav class="nvm-vendor-nav nvm-entity-nav" aria-label="${en ? 'Patent Filing Entities' : '專利申請機構選單'}"><span class="nvm-vendor-nav-title">${vendorNavTitle}</span><div class="nvm-entity-pills">${data.vendors.map(v => `<a href="#vendor-${esc(v.id)}" class="nvm-entity-pill"><strong>${esc(v.shortName)}</strong><span>(${v.families.reduce((acc, f) => acc + f.patents.length, 0)} ${en ? 'patents' : '件專利'})</span></a>`).join('')}</div></nav><div class="nvm-vendor-studies">${data.vendors.map(v => renderVendorStudy(v, en, cite)).join('')}</div>${renderCompetitiveMatrix(data, en)}<nav class="nvm-bottom-nav" aria-label="${en ? 'Patent Maps Navigation' : '專利地圖章節導覽'}"><a href="#panorama">${en ? 'Return to the Atlas Overview' : '回到技術全景目錄'}</a><a href="#ip-directory">${en ? 'Continue to IP Cells Directory' : '接著讀：IP 單元與操作原理'}</a></nav></article>`;
}

/**
 * 匯出專利地圖為 Markdown 格式
 */
export function vendorPatentMapsMarkdown(data, sourceMarkdown, language) {
  const en = language === 'en';
  let md = `\n\n## ${en ? 'NVM Patent Maps · By Filing Company' : '具名機構核心專利地圖（By Filing Company 分析）'}\n\n`;
  md += `${en ? 'Rigorous patent landscape analyses structured by patent filing entity (assignee).' : '嚴格以專利申請機構（Filing Company / Assignee）為主體開展的專利地圖深度分析。'}\n\n`;

  for (const v of data.vendors) {
    md += `### ${v.name} (${v.shortName})\n\n`;
    md += `- **${en ? 'Headquarters' : '總部'}**: ${v.headquarters}\n`;
    md += `- **${en ? 'Founded' : '創立年份'}**: ${v.founded}\n`;
    md += `- **${en ? 'Leadership' : '核心研發/發明人'}**: ${v.founders}\n`;
    md += `- **${en ? 'Business Model' : '商業模式'}**: ${v.businessModel}\n`;
    md += `- **${en ? 'Global Patents' : '全球核准專利'}**: ${v.patentStats.totalGrantedWorldwide}\n`;
    md += `- **${en ? 'Patent Strategy' : '專利護城河戰略'}**: ${v.strategy}\n\n`;

    for (const f of v.families) {
      md += `#### ${f.name} (${f.technologyType})\n\n`;
      md += `*${f.tagline}*\n\n`;
      md += `- **${en ? 'Cell Topology' : '單元拓撲'}**: ${f.cellTopology}\n`;
      md += `- **${en ? 'Physical Mechanism' : '儲存物理'}**: ${f.physicalMechanism}\n`;
      md += `- **${en ? 'Process Node' : '製程節點'}**: ${f.processNode}\n\n`;

      for (const p of f.patents) {
        md += `##### [${p.id}](${p.url}) · ${p.title}\n\n`;
        md += `- **${en ? 'Priority / Grant' : '優先權日 / 核准日'}**: ${p.priorityDate} / ${p.grantDate}\n`;
        md += `- **${en ? 'Inventors' : '發明人'}**: ${p.inventors}\n`;
        md += `- **${en ? 'Claim 1 Reading' : '獨立權利項導讀'}**: ${p.claimFocus}\n`;
        md += `- **${en ? 'Physical Solution' : '物理機制'}**: ${p.mechanism}\n`;
        md += `- **${en ? 'Commercial Silicon' : '商用產品承接'}**: ${p.productLink}\n\n`;
      }
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
    const pat = v.families.flatMap(f => f.patents).map(p => `[${p.id}](${p.url})`).join(', ');
    const fnd = `${v.patentStats.foundryCoverage} (${v.patentStats.waferShipment})`;
    md += `| ${no}. ${v.shortName} | ${fam} | ${phy} | ${pat} | ${fnd} |\n`;
  }
  md += '\n\n';

  return md;
}
