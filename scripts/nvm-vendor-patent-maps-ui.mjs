/**
 * @fileoverview NVM 廠商專利地圖 UI 渲染器 (Vendor Patent Maps UI Renderer)
 * 支援雙語（繁體中文／英文）、第一性原理權利項解析、晶圓代工製程相容性與歷史時序演進。
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
  const title = en ? 'Global NVM Vendor Patent Landscape and Portfolios' : '涵蓋廠商與核心專利地圖全景盤點';
  const intro = en
    ? 'Systematic tracking of core patent families, first-principles claims, foundry process compatibility, and commercial product lineage for leading NVM IP vendors. Every patent trace links back to authoritative patent gazettes, excluding unverified marketing claims.'
    : '系統性追蹤全球具名 NVM IP 供應商與記憶體晶圓廠商的核心專利家族、第一性原理權利項、晶圓代工製程相容性與商用產品承接脈絡。每一項專利均回溯至原始專利公報，排除未經驗證的行銷宣稱。';
  const totalPatents = data.vendors.reduce((acc, v) => acc + v.families.reduce((fAcc, f) => fAcc + f.patents.length, 0), 0);
  const totalFamilies = data.vendors.reduce((acc, v) => acc + v.families.length, 0);

  return `<header class="nvm-editorial-header"><div><p class="nvm-kicker">${en ? 'NVM · VENDOR PATENT LANDSCAPE' : 'NVM · 廠商專利全景盤點'}</p><h2 tabindex="-1">${esc(title)}</h2><div class="nvm-lede">${paragraphs(intro)}</div></div><aside class="nvm-editorial-stat" aria-label="${en ? 'Editorial coverage' : '編輯涵蓋範圍'}"><strong>${String(data.vendors.length).padStart(2, '0')}</strong><span>${en ? 'Leading Vendors' : '具名領導廠商'}</span><small>${en ? `${totalFamilies} Families · ${totalPatents} Key Patents` : `${totalFamilies} 個專利家族 · ${totalPatents} 件核心專利`}</small></aside></header>`;
}

/**
 * 渲染單一專利卡片
 */
function renderPatentRecord(patent, familyId, en) {
  const labels = en
    ? {
        problem: 'Core Physical & Engineering Problem',
        mechanism: 'First-Principles Solution & Mechanism',
        claim: 'Independent Claim Reading & Legal Scope',
        product: 'Commercial Silicon Product Linkage',
        priority: 'Priority Date',
        grant: 'Grant Date',
        inventors: 'Inventors',
        assignee: 'Assignee',
        viewFull: 'View Full Patent Gazette at Google Patents'
      }
    : {
        problem: '欲解決之核心物理與工程問題',
        mechanism: '第一性原理物理機制與實施手段',
        claim: '獨立權利項導讀與法律保護邊界',
        product: '商用產品承接與量產晶片實作',
        priority: '優先權日',
        grant: '核准日',
        inventors: '發明人',
        assignee: '受讓機構',
        viewFull: '開啟 Google Patents 原始專利公報全文'
      };

  return `<details class="nvm-disclosure nvm-vendor-patent-record" id="vendor-patent-${esc(familyId)}-${esc(patent.id)}"><summary><span class="nvm-patent-id">${esc(patent.id)}</span><strong>${esc(patent.title)}</strong><span class="nvm-patent-meta">${esc(patent.grantDate)} · ${esc(patent.assignee)}</span></summary><div class="nvm-patent-details-body"><div class="nvm-vendor-patent-grid"><div><dt>${labels.problem}</dt><dd>${esc(patent.coreProblem)}</dd></div><div><dt>${labels.mechanism}</dt><dd>${esc(patent.mechanism)}</dd></div><div><dt>${labels.claim}</dt><dd>${esc(patent.claimFocus)}</dd></div><div><dt>${labels.product}</dt><dd>${esc(patent.productLink)}</dd></div><div class="nvm-patent-link-row"><dt>${labels.assignee}</dt><dd>${esc(patent.inventors)} · ${labels.priority}: ${esc(patent.priorityDate)} · ${labels.grant}: ${esc(patent.grantDate)} · <a href="${esc(patent.url)}" target="_blank" rel="noopener noreferrer">${labels.viewFull} <span aria-hidden="true">↗</span></a></dd></div></div></div></details>`;
}

/**
 * 渲染專利家族區塊
 */
function renderPatentFamily(family, en) {
  const specs = en
    ? [
        { label: 'Technology Type', value: family.technologyType },
        { label: 'Cell Topology', value: family.cellTopology },
        { label: 'Physical Mechanism', value: family.physicalMechanism },
        { label: 'Process Compatibility', value: family.processNode }
      ]
    : [
        { label: '技術類型', value: family.technologyType },
        { label: '單元拓撲結構', value: family.cellTopology },
        { label: '第一性原理物理機制', value: family.physicalMechanism },
        { label: '晶圓製程相容性', value: family.processNode }
      ];

  const patentCountLabel = en
    ? `${family.patents.length} Representative Milestone Patents`
    : `${family.patents.length} 件代表性里程碑專利`;

  return `<article class="nvm-patent-family" id="family-${esc(family.id)}"><header class="nvm-family-header"><p class="nvm-family-tagline">${esc(family.tagline)}</p><h4>${esc(family.name)}</h4></header><div class="nvm-family-specs"><dl>${specs.map(item => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join('')}</dl></div><div class="nvm-family-summary"><p>${esc(family.summary)}</p></div><h5 class="nvm-family-patents-title">${patentCountLabel}</h5><div class="nvm-family-patent-records">${family.patents.map(patent => renderPatentRecord(patent, family.id, en)).join('')}</div></article>`;
}

/**
 * 渲染歷史演進里程碑時序圖
 */
function renderMilestones(milestones, en) {
  const sectionTitle = en ? 'Patent Strategy & Technology Evolution Timeline' : '專利戰略佈局與技術演進時序線';
  const introText = en
    ? 'From 0.5µm legacy nodes to 2nm GAA nanosheets: A 25-year timeline illustrating how patent claims co-evolved alongside foundry manufacturing breakthroughs.'
    : '從 0.5µm 成熟微米節點跨越至 2nm GAA 埃米世代：回顧力旺 25 年專利權利項如何與全球晶圓代工先進製程同頻共振。';

  return `<section class="nvm-patent-timeline-section"><h4>${sectionTitle}</h4><p class="nvm-timeline-intro">${introText}</p><div class="nvm-patent-timeline">${milestones.map(node => `<article class="nvm-timeline-node"><div class="nvm-timeline-period"><span>${esc(node.period)}</span><small>${esc(node.era)}</small></div><div class="nvm-timeline-content"><h5>${esc(node.theme)}</h5><p>${esc(node.summary)}</p><dl><dt>${en ? 'Foundry Node' : '代表節點'}</dt><dd>${esc(node.nodes)}</dd><dt>${en ? 'Key Patents' : '代表專利'}</dt><dd>${esc(node.keyPatents)}</dd></dl></div></article>`).join('')}</div></section>`;
}

/**
 * 渲染單一廠商專利地圖卡片
 */
function renderVendorStudy(vendor, en, cite) {
  const stats = vendor.patentStats;
  const statLabels = en
    ? [
        { label: 'Global Granted Patents', value: stats.totalGrantedWorldwide },
        { label: 'Key Jurisdictions', value: stats.keyJurisdictions },
        { label: 'Foundry Integration', value: stats.foundryCoverage },
        { label: 'Cumulative Silicon Shipment', value: stats.waferShipment }
      ]
    : [
        { label: '全球核准專利', value: stats.totalGrantedWorldwide },
        { label: '核心申請國別', value: stats.keyJurisdictions },
        { label: '代工平台驗證', value: stats.foundryCoverage },
        { label: '累計晶片出貨量', value: stats.waferShipment }
      ];

  const metaLabels = en
    ? {
        headquarters: 'Headquarters',
        founded: 'Founded',
        founders: 'Leadership / R&D',
        businessModel: 'Business Model',
        strategy: 'Patent Strategy & Zero-Mask Philosophy',
        familiesNav: 'Explore Patent Families'
      }
    : {
        headquarters: '總部位置',
        founded: '創立年份',
        founders: '研發領軍團隊',
        businessModel: '商業營運模式',
        strategy: '專利戰略與零額外光罩哲學',
        familiesNav: '專利家族快速索引'
      };

  return `<section id="vendor-${esc(vendor.id)}" class="nvm-vendor-study" tabindex="-1"><header class="nvm-vendor-profile-header"><p class="nvm-kicker">${esc(vendor.businessModel)}</p><h3>${esc(vendor.name)}</h3><div class="nvm-vendor-meta-strip"><span><strong>${metaLabels.headquarters}:</strong> ${esc(vendor.headquarters)}</span><span><strong>${metaLabels.founded}:</strong> ${esc(vendor.founded)}</span><span><strong>${metaLabels.founders}:</strong> ${esc(vendor.founders)}</span></div></header><dl class="nvm-vendor-stats-grid">${statLabels.map(item => `<div class="nvm-vendor-stat-card"><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join('')}</dl><div class="nvm-vendor-strategy"><h4>${metaLabels.strategy}</h4><p>${esc(vendor.strategy)}</p></div><nav class="nvm-family-jump-nav" aria-label="${metaLabels.familiesNav}">${vendor.families.map(f => `<a href="#family-${esc(f.id)}">${esc(f.name.split(' ')[0])} (${f.patents.length})</a>`).join('')}</nav><div class="nvm-patent-families">${vendor.families.map(f => renderPatentFamily(f, en)).join('')}</div>${renderMilestones(vendor.milestones, en)}</section>`;
}

/**
 * 渲染涵蓋廠商與核心專利地圖全景盤點一覽表
 */
function renderVendorPatentLandscape(data, en) {
  const sectionTitle = en
    ? 'Comprehensive Vendor Patent Landscape & Cross-Comparison'
    : '涵蓋廠商與核心專利地圖全景盤點一覽';
  const sectionIntro = en
    ? 'Cross-comparison of core technology families, first-principles physical mechanisms, milestone patent gazettes, and foundry process compatibility across all 11 leading NVM IP vendors.'
    : '橫向綜合盤點全球 11 家 NVM 領導廠商的核心技術類型、代表性專利家族、第一性原理物理機制、關鍵專利公報與晶圓代工製程相容性。';

  const colLabels = en
    ? [
        'Vendor & Business Model',
        'Technology & Key Families',
        'First-Principles Physics & Mechanism',
        'Milestone Patents & Gazettes',
        'Foundry Compatibility & Volume'
      ]
    : [
        '具名廠商與營運模式',
        '核心技術與代表家族',
        '第一性原理物理機制與實施手段',
        '代表性里程碑專利公報',
        '晶圓代工覆蓋與出貨實績'
      ];

  const rows = data.vendors.map((vendor, index) => {
    const no = String(index + 1).padStart(2, '0');
    const familiesSummary = vendor.families.map(f => `<span class="nvm-landscape-family-item"><strong>${esc(f.name.split(' ')[0])}</strong> <small>(${esc(f.technologyType)})</small></span>`).join('<br>');
    const physicsSummary = vendor.families.map(f => `<p class="nvm-landscape-physics-p"><strong>${esc(f.name.split(' ')[0])}：</strong>${esc(f.physicalMechanism)}</p>`).join('');
    const patentsSummary = vendor.families.flatMap(f => f.patents).map(p => `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" class="nvm-landscape-patent-badge" title="${esc(p.title)}">${esc(p.id)} <span aria-hidden="true">↗</span></a>`).join(' ');
    const foundrySummary = `<p class="nvm-landscape-foundry-p"><strong>${en ? 'Foundries:' : '代工平台：'}</strong>${esc(vendor.patentStats.foundryCoverage)}</p><p class="nvm-landscape-foundry-p"><strong>${en ? 'Shipment:' : '量產實績：'}</strong>${esc(vendor.patentStats.waferShipment)}</p>`;

    return `<tr><td data-label="${colLabels[0]}"><span class="nvm-landscape-vendor-no">${no}</span><a href="#vendor-${esc(vendor.id)}" class="nvm-landscape-vendor-link"><strong>${esc(vendor.shortName)}</strong></a><p class="nvm-landscape-vendor-sub">${esc(vendor.name)}</p><small class="nvm-landscape-model">${esc(vendor.businessModel)}</small></td><td data-label="${colLabels[1]}">${familiesSummary}</td><td data-label="${colLabels[2]}">${physicsSummary}</td><td data-label="${colLabels[3]}"><div class="nvm-landscape-patents">${patentsSummary}</div></td><td data-label="${colLabels[4]}">${foundrySummary}</td></tr>`;
  }).join('');

  return `<section id="vendor-patent-landscape-overview" class="nvm-vendor-landscape-overview" tabindex="-1"><header class="nvm-landscape-header"><p class="nvm-kicker">${en ? 'CROSS-VENDOR BENCHMARK' : '全行業橫向對比總表'}</p><h3>${esc(sectionTitle)}</h3><p class="nvm-landscape-lede">${esc(sectionIntro)}</p></header><div class="nvm-landscape-table-wrap"><table class="nvm-table nvm-tech-table nvm-vendor-landscape-table"><caption class="nvm-small">${esc(sectionTitle)}</caption><thead><tr>${colLabels.map(l => `<th scope="col">${esc(l)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
}

/**
 * 渲染全頁廠商專利地圖面板
 * @param {object} data 專利資料物件
 * @param {string} language 語系 ('zh' | 'en')
 * @param {function} cite 引用輔助函式
 */
export function renderVendorPatentMaps(data, language, cite) {
  const en = language === 'en';
  validateVendorPatentMaps(data);

  return `<article id="patent-maps" class="nvm-panel nvm-patent-maps-editorial" data-nvm-panel>${editorialHeader(data, en)}${renderVendorPatentLandscape(data, en)}<nav class="nvm-vendor-nav" aria-label="${en ? 'Vendor Directory' : '廠商目錄'}"><span class="nvm-vendor-nav-title">${en ? 'Vendors:' : '廠商專題：'}</span>${data.vendors.map(v => `<a href="#vendor-${esc(v.id)}"><strong>${esc(v.shortName)}</strong><span>(${v.families.length} ${en ? 'families' : '大家族'})</span></a>`).join('')}</nav><div class="nvm-vendor-studies">${data.vendors.map(v => renderVendorStudy(v, en, cite)).join('')}</div><nav class="nvm-bottom-nav" aria-label="${en ? 'Patent Maps Navigation' : '專利地圖章節導覽'}"><a href="#panorama">${en ? 'Return to the Atlas Overview' : '回到技術全景目錄'}</a><a href="#ip-directory">${en ? 'Continue to IP Cells Directory' : '接著讀：IP 單元與操作原理'}</a></nav></article>`;
}

/**
 * 匯出專利地圖為 Markdown 格式
 */
export function vendorPatentMapsMarkdown(data, sourceMarkdown, language) {
  const en = language === 'en';
  let md = `\n\n## ${en ? data.title : data.title}\n\n${data.intro}\n\n`;

  md += `### ${en ? 'Comprehensive Vendor Patent Landscape Table' : '涵蓋廠商與核心專利地圖全景盤點一覽表'}\n\n`;
  md += `| ${en ? 'No. & Vendor' : '序號與廠商'} | ${en ? 'Technology & Key Families' : '核心技術與代表家族'} | ${en ? 'First-Principles Physics & Mechanism' : '第一性原理物理機制'} | ${en ? 'Milestone Patents' : '代表專利公報'} | ${en ? 'Foundry & Shipment' : '代工平台與量產實績'} |\n`;
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

  for (const v of data.vendors) {
    md += `### ${v.name} (${v.shortName})\n\n`;
    md += `- **${en ? 'Headquarters' : '總部'}**: ${v.headquarters}\n`;
    md += `- **${en ? 'Founded' : '創立年份'}**: ${v.founded}\n`;
    md += `- **${en ? 'Leadership' : '研發領導'}**: ${v.founders}\n`;
    md += `- **${en ? 'Business Model' : '商業模式'}**: ${v.businessModel}\n`;
    md += `- **${en ? 'Global Patents' : '全球專利'}**: ${v.patentStats.totalGrantedWorldwide}\n`;
    md += `- **${en ? 'Foundry Platforms' : '晶圓代工平台'}**: ${v.patentStats.foundryCoverage}\n`;
    md += `- **${en ? 'Silicon Shipment' : '累計晶片出貨'}**: ${v.patentStats.waferShipment}\n\n`;
    md += `#### ${en ? 'Patent Strategy' : '專利戰略哲學'}\n\n${v.strategy}\n\n`;

    for (const f of v.families) {
      md += `#### ${f.name}\n\n`;
      md += `*${f.tagline}*\n\n`;
      md += `- **${en ? 'Topology' : '單元拓撲'}**: ${f.cellTopology}\n`;
      md += `- **${en ? 'Mechanism' : '物理機制'}**: ${f.physicalMechanism}\n`;
      md += `- **${en ? 'Process Nodes' : '製程相容節點'}**: ${f.processNode}\n\n`;
      md += `${f.summary}\n\n`;

      for (const p of f.patents) {
        md += `##### [${p.id}](${p.url}): ${p.title}\n\n`;
        md += `- **${en ? 'Priority / Grant' : '優先權日 / 核准日'}**: ${p.priorityDate} / ${p.grantDate}\n`;
        md += `- **${en ? 'Inventors' : '發明人'}**: ${p.inventors}\n`;
        md += `- **${en ? 'Assignee' : '受讓機構'}**: ${p.assignee}\n`;
        md += `- **${en ? 'Core Problem' : '核心問題'}**: ${p.coreProblem}\n`;
        md += `- **${en ? 'Mechanism' : '第一性原理手段'}**: ${p.mechanism}\n`;
        md += `- **${en ? 'Claim Focus' : '權利項導讀'}**: ${p.claimFocus}\n`;
        md += `- **${en ? 'Product Linkage' : '商用產品承接'}**: ${p.productLink}\n\n`;
      }
    }

    md += `#### ${en ? 'Evolution Milestones' : '技術演進時序線'}\n\n`;
    for (const m of v.milestones) {
      md += `- **${m.period} (${m.era})** - ${m.theme}: ${m.summary} (${en ? 'Nodes' : '節點'}: ${m.nodes} / ${en ? 'Patents' : '代表專利'}: ${m.keyPatents})\n`;
    }
    md += '\n';
  }

  return md;
}
