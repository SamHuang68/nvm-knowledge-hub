import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'data', name), 'utf8'));
const intro = read('NVM全景導論.json');
const charge = read('NVM電荷專題.json');
const emerging = read('NVM新興專題.json');
const comparison = read('NVM比較與系統.json');
const foundry = read('NVM晶圓代工路線圖.json');
const topics = [...charge.topics, ...emerging.topics];
const sources = [...intro.sources, ...charge.sources, ...emerging.sources, ...comparison.sources, ...foundry.sources];
const sourceMap = new Map(sources.map(item => [item.id, item]));
const sourceDate = source => `${source.date ?? '未標示發布日期'}${source.accessedAt ? '；查閱 '+source.accessedAt : ''}`;
const familyFor = id => intro.families.find(family => family.topics.includes(id));
const patents = topics.flatMap(topic => topic.patents.map(patent => ({ ...patent, topicId: topic.id, topicTitle: topic.title })));
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const list = value => Array.isArray(value) ? value : [value];
const paras = value => list(value).filter(Boolean).flatMap(text => String(text).split(/\n\s*\n/u)).map(text => `<p>${esc(text)}</p>`).join('');
const bullets = value => `<ul>${list(value).filter(Boolean).map(text => `<li>${esc(text)}</li>`).join('')}</ul>`;
const cite = ids => `<div class="nvm-source-links">${(ids || []).map(id => `<a href="#source-${esc(id)}">${esc(id)} · ${esc(sourceMap.get(id)?.label ?? id)}</a>`).join('')}</div>`;
const tag = stage => `<span class="nvm-tag" data-stage="${esc(stage)}">${esc(stage)}</span>`;
const panelHeader = (kicker, title, body) => `<header><p class="nvm-kicker">${esc(kicker)}</p><h2 tabindex="-1">${esc(title)}</h2><div class="nvm-lede">${paras(body)}</div></header>`;
const failures = [];

if (sourceMap.size !== sources.length) failures.push('來源識別碼重複');
if (new Set(topics.map(topic => topic.id)).size !== 15) failures.push('十五個技術主題識別碼不完整');
for (const source of sources) {
  if (!source.id || !source.label || !/^https:\/\//u.test(source.url || '') || !source.kind || !source.locator || (!source.date && !source.accessedAt) || !source.limit) failures.push(`來源欄位不完整：${source.id}`);
}
const validateRefs = (value, location) => {
  if (Array.isArray(value)) return value.forEach((item, index) => validateRefs(item, `${location}[${index}]`));
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (key === 'sourceIds') for (const id of child) if (!sourceMap.has(id)) failures.push(`${location} 的來源不存在：${id}`);
    validateRefs(child, `${location}.${key}`);
  }
};
validateRefs({ topics, comparison, foundry }, '內容');
for (const topic of topics) {
  for (const field of ['title', 'storage', 'structure', 'summary', 'selection', 'variability', 'fit', 'avoid']) if (!String(topic[field] || '').trim()) failures.push(`${topic.id} 缺少 ${field}`);
  for (const field of ['device', 'array', 'process', 'system']) if (!topic.ceilings?.[field]) failures.push(`${topic.id} 缺少 ${field} 限制`);
  if (!familyFor(topic.id) || !topic.sourceIds?.length || !topic.patents?.length || !topic.quiz?.answer || !topic.maturity?.sourceIds?.length) failures.push(`${topic.id} 的專題契約不完整`);
  if (!topic.operations?.some(item => item.id === 'read') || !topic.operations?.some(item => item.id === 'write')) failures.push(`${topic.id} 缺少讀寫操作`);
  if (new Set(topic.operations.map(item => item.id)).size !== topic.operations.length) failures.push(`${topic.id} 操作識別碼重複`);
}
const serialized = JSON.stringify({ intro, topics, sources, comparison, foundry });
if (/[A-Z]:[\\/]Users[\\/]|INTERNAL\s+CONFIDENTIAL|Customer\s+Restricted\s+NDA/iu.test(serialized)) failures.push('內容帶有不應公開的路徑或標記');
if (failures.length) throw new Error(`NVM 內容驗證失敗：\n${failures.join('\n')}`);

function cellSvg(id, title) {
  const rect = (x,y,w,h,cls='cell-state') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" class="${cls}"/>`;
  const text = (x,y,content,cls='',anchor='middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${esc(content)}</text>`;
  const wire = d => `<path d="${d}" class="cell-wire"/>`;
  const arrow = (x,y,direction='right') => wire(direction === 'right' ? `M${x} ${y}h54m-12 -8 12 8-12 8` : `M${x} ${y}v-40m-8 12 8-12 8 12`);
  const chargeDots = y => [210,240,270,300].map(x => `<circle cx="${x}" cy="${y}" r="4" class="cell-charge"/>`).join('');
  let drawing;
  if (id === 'efuse') drawing = text(260,32,'eFuse 與選擇電晶體') + wire('M50 115H150M370 115H420V182H335M335 227H420V252M402 252h36m-29 7h22m-16 7h10') + rect(150,101,220,28,'cell-metal') + rect(244,101,32,28) + text(260,79,'局部導體／頸部') + wire('M270 182v45M250 182v45M270 182h65M270 227h65M220 204h30') + text(95,151,'位元線') + text(345,244,'選擇管') + text(123,213,'字元線') + text(260,270,'寫入使指定導體區域的電阻永久改變','small-label');
  else if (id === 'antifuse') drawing = text(260,32,'薄介電層反熔絲示意') + rect(170,80,180,40,'cell-metal') + rect(170,123,180,18,'cell-oxide') + rect(170,144,180,48,'cell-metal') + wire('M260 50v30M260 192v35') + text(260,107,'電極') + text(260,176,'通道／下電極') + text(411,139,'介電層') + wire('M350 132h18') + text(260,262,'局部介電崩潰後建立導通路徑','small-label');
  else if (['eeprom','nor','sonos','fefet'].includes(id)) {
    const isNor = id === 'nor', isTrap = id === 'sonos', isFe = id === 'fefet';
    drawing = text(260,29,isNor?'分離閘極概念剖面':isFe?'FeFET 概念剖面':isTrap?'SONOS 概念剖面':'浮動閘極概念剖面') + rect(70,195,380,54,'cell-oxide') + rect(82,198,67,23,'cell-metal') + rect(371,198,67,23,'cell-metal') + text(116,188,'源極') + text(406,188,'汲極') + text(260,234,'半導體通道') + rect(isNor?212:160,154,isNor?143:200,16,'cell-oxide') + rect(isNor?212:160,117,isNor?143:200,34) + rect(isNor?212:160,99,isNor?143:200,15,'cell-oxide') + rect(isNor?212:160,60,isNor?143:200,35,'cell-metal') + text(isNor?283:260,84,'控制閘極') + text(isNor?283:260,141,isFe?'鐵電層':isTrap?'捕捉層':'浮動閘極') + text(260,276,isFe?'極化與界面電荷共同影響臨界電壓':'儲存狀態透過通道電流讀出','small-label');
    if (isNor) drawing += rect(106,137,88,34,'cell-metal') + text(148,129,'選擇閘');
    if (isFe) drawing += arrow(390,146,'up');
  } else if (id === 'nand') {
    drawing = text(260,30,'垂直 NAND 串列概念') + rect(244,66,32,170,'cell-oxide') + wire('M260 45v21M260 236v24');
    [92,140,188].forEach((y,i) => { drawing += rect(176,y,61,23,'cell-metal')+rect(283,y,61,23,'cell-metal')+rect(238,y,5,23)+rect(277,y,5,23)+text(100,y+18,`字元線 ${i+1}`)+wire(`M143 ${y+11}h33`); });
    drawing += wire('M344 103h12v-21h9M280 163v12h76v-33h9M260 236v17h100v-40h5') + text(426,90,'環繞閘極')+text(426,150,'儲存介質')+text(426,221,'垂直通道')+text(260,280,'多個單元串聯；外側選擇閘與周邊電路另計','small-label');
  } else if (['toggle','stt','sot'].includes(id)) {
    drawing = text(260,30,`${id==='sot'?'SOT-MRAM':id==='toggle'?'磁場切換 MRAM':'STT-MRAM'} 磁穿隧接面`) + rect(140,84,240,36) + rect(140,123,240,15,'cell-oxide') + rect(140,141,240,36,'cell-metal') + text(260,108,'自由層') + text(432,137,'障壁') + text(260,165,'參考層') + arrow(60,102) + arrow(60,159);
    if (id === 'sot') drawing += rect(97,66,326,18,'cell-metal')+wire('M38 75h59M423 75h58M260 177v25')+text(260,224,'橫向寫入路徑與垂直讀取路徑')+text(260,269,'SOT 通道接觸自由層；此處只畫拓撲','small-label');
    else if (id === 'stt') drawing += wire('M260 48v34M260 177v56')+text(260,258,'寫入電流與讀取電流皆穿過接面','small-label');
    else drawing += wire('M60 61h390M60 200h390')+text(260,253,'外部字元線／位元線電流產生磁場','small-label');
  } else if (['vcm','ecm','pcm','ftj','feram'].includes(id)) {
    const labels = { vcm:['上電極','氧化物與缺陷','下電極'], ecm:['活性金屬電極','離子導體','惰性電極'], pcm:['上電極','相變材料','局部加熱器'], ftj:['上電極','超薄鐵電障壁','下電極'], feram:['極板','鐵電電容','儲存節點'] }[id];
    drawing = text(260,30,`${({vcm:'VCM ReRAM',ecm:'ECM／CBRAM',pcm:'PCM',ftj:'FTJ',feram:'電容式 FeRAM'})[id]} 概念結構`) + rect(142,66,236,37,'cell-metal') + rect(142,107,236,80) + rect(id==='pcm'?224:142,191,id==='pcm'?72:236,30,'cell-metal') + wire('M260 42v24M260 221v29') + text(260,91,labels[0]) + text(['vcm','ecm'].includes(id)?236:260,155,labels[1]) + text(260,215,labels[2]);
    if (['vcm','ecm'].includes(id)) drawing += wire('M346 103l-8 15 12 15-9 14 9 14-5 15 5 15') + text(260,279,'局部導電路徑形成與斷裂受限流及材料控制','small-label');
    if (id === 'pcm') drawing += text(260,279,'加熱器把電能集中成改變晶相的熱脈衝','small-label');
    if (['feram','ftj'].includes(id)) drawing += arrow(410,170,'up') + text(260,279,id==='feram'?'電容需選擇電晶體與感測／回寫電路':'極化改變穿隧障壁，讀取電流差','small-label');
  }
  return `<svg viewBox="0 0 520 300" role="img" aria-labelledby="cell-title-${esc(id)}"><title id="cell-title-${esc(id)}">${esc(title)} 的原理結構示意</title>${drawing}</svg>`;
}

function patentDetail(patent, topic) {
  return `<details class="nvm-disclosure" id="patent-${esc(patent.id)}"><summary>${esc(patent.id)} · ${esc(patent.problem)}</summary><div><dl><dt>專題</dt><dd><a href="#topic-${esc(topic.id)}">${esc(topic.title)}</a></dd><dt>優先權日</dt><dd>${esc(patent.priority)}</dd><dt>受讓紀錄</dt><dd>${esc(patent.assignee)}</dd><dt>代表圖／段落</dt><dd>${esc(patent.figures)}</dd><dt>解法與物理</dt><dd>${esc(patent.mechanism)}</dd><dt>權利項導讀</dt><dd>${esc(patent.claimReading)}</dd><dt>可支持的範圍</dt><dd>${esc(patent.limit)}</dd><dt>原始文件</dt><dd><a href="${esc(patent.url)}" target="_blank" rel="noopener noreferrer">開啟 ${esc(patent.id)} 專利全文</a></dd></dl></div></details>`;
}

function topicPanel(topic, index) {
  const family = familyFor(topic.id);
  return `<article id="topic-${esc(topic.id)}" class="nvm-panel" data-nvm-panel>
  ${panelHeader(`技術專題 ${String(index+1).padStart(2,'0')} · ${family.title}`, topic.title, topic.summary)}
  <div>${tag(topic.maturity.stage)}<span class="nvm-meta">${esc(topic.maturity.claim)}</span></div>${cite(topic.maturity.sourceIds)}
  <p class="nvm-maturity-limit">${esc(topic.maturity.limit)}</p>
  <section><h3>狀態存在哪裡</h3><div class="nvm-prose">${paras(topic.storage)}</div><figure class="nvm-cell">${cellSvg(topic.id,topic.title)}<figcaption>原理重畫，非比例剖面或特定產品版圖。${esc(topic.structure)}</figcaption></figure></section>
  <section><h3>寫入、反向操作與讀取</h3><div class="nvm-operation" data-operation-widget><div class="nvm-operation-buttons" role="group" aria-label="${esc(topic.title)} 操作選擇">${topic.operations.map((operation,i) => `<button type="button" data-operation-select="${esc(operation.id)}" aria-controls="op-${esc(topic.id)}-${esc(operation.id)}" aria-pressed="${i===0}">${esc(operation.title)}</button>`).join('')}</div>
  ${topic.operations.map((operation,i) => `<div id="op-${esc(topic.id)}-${esc(operation.id)}" data-operation-detail="${esc(operation.id)}"><h4>${esc(operation.title)}</h4><dl class="nvm-state-sequence"><div><dt>操作前</dt><dd>${esc(operation.before)}</dd></div><div><dt>施加的刺激</dt><dd>${esc(operation.stimulus)}</dd></div><div><dt>操作後</dt><dd>${esc(operation.after)}</dd></div></dl>${paras(operation.explanation)}</div>`).join('')}</div></section>
  <section><h3>選中、半選與變異</h3><div class="nvm-prose"><h4>陣列如何選擇</h4>${paras(topic.selection)}<h4>哪些分布會拉近讀取邊界</h4>${paras(topic.variability)}</div></section>
  <section><h3>優勢所交換的代價</h3><div class="nvm-two"><article><h4>主要優勢</h4>${bullets(topic.advantages)}</article><article><h4>代價與弱點</h4>${bullets(topic.tradeoffs)}</article></div></section>
  <section><h3>四層天花板</h3><p class="nvm-subheading">從單一元件可切換，走到完整系統可靠運作，中間還有四層限制。</p><div class="nvm-four">${[['device','單元：物理與材料'],['array','陣列：選擇與感測'],['process','製程：整合與成本'],['system','系統：可用性與生命週期']].map(([key,title])=>`<article><h4>${title}</h4>${paras(topic.ceilings[key])}</article>`).join('')}</div></section>
  <section><h3>適合承擔的資料</h3><div class="nvm-prose"><h4>適用情境</h4>${paras(topic.fit)}<h4>先排除的誤用</h4>${paras(topic.avoid)}</div></section>
  <section><h3>從專利讀回設計問題</h3><p>以下提供代表性研究入口。優先權日與受讓紀錄依文件書目；實施例與權利項的範圍分開閱讀。</p>${topic.patents.map(patent=>`<p><a href="#patent-${esc(patent.id)}">${esc(patent.id)} · ${esc(patent.problem)}</a></p>`).join('')}</section>
  <section><h3>來源與解讀範圍</h3>${cite(topic.sourceIds)}<p class="nvm-small">原理示意由所列來源綜合整理；性能、量產與專利主張分別綁定其原始文件。未公開的偏壓、材料配方與製程條件，保留為實作缺口。</p></section>
  <section class="nvm-quiz"><h3>檢查理解</h3><p>${esc(topic.quiz.question)}</p><details><summary>展開推理</summary>${paras(topic.quiz.answer)}</details></section>
  <nav class="nvm-bottom-nav" aria-label="專題接續"><a href="#${index?'topic-'+topics[index-1].id:'panorama'}">${index?'上一題：'+esc(topics[index-1].title):'回到技術全景'}</a><a href="#${index<topics.length-1?'topic-'+topics[index+1].id:'system-array'}">${index<topics.length-1?'下一題：'+esc(topics[index+1].title):'接著讀：陣列與系統'}</a></nav>
  </article>`;
}

function comparisonPanel() {
  const historical = comparison.historicalTable;
  return `<article id="comparison" class="nvm-panel" data-nvm-panel>${panelHeader('比較方法與歷史更新','把舊表更新成有條件的比較','同一個家族沒有一組能代表所有世代的最快、最省電與最耐久數字。先保留課程表的歷史脈絡，再用具名實作與共同條件補上現在的證據。')}
  <section><h3>從 2016 文獻到 2021 課程表</h3>${paras(historical.intro)}<details class="nvm-disclosure"><summary>展開歷史表：只供課程對照</summary><div><table class="nvm-table nvm-history-table"><caption>課程截圖的歷史比較，非現行產品規格</caption><thead><tr><th scope="col">比較項目</th>${historical.columns.map(column=>`<th scope="col">${esc(column)}</th>`).join('')}</tr></thead><tbody>${historical.rows.map(row=>`<tr><th scope="row">${esc(row.metric)}</th>${row.values.map(value=>`<td>${esc(value)}</td>`).join('')}</tr>`).join('')}</tbody></table><div class="nvm-history-cards">${historical.columns.map((column,i)=>`<article><h4>${esc(column)}</h4><dl>${historical.rows.map(row=>`<dt>${esc(row.metric)}</dt><dd>${esc(row.values[i])}</dd>`).join('')}</dl></article>`).join('')}</div>${historical.rows.filter(row=>row.note).map(row=>`<p class="nvm-small">${esc(row.metric)}：${esc(row.note)}</p>`).join('')}</div></details>
  ${historical.corrections.map(item=>`<div class="nvm-benchmark"><h4>${esc(item.old)}</h4>${paras(item.current)}<p class="nvm-small">${esc(item.reason)}</p>${cite(item.sourceIds)}</div>`).join('')}</section>
  <section><h3>六個保留條件的實作案例</h3><p>下列案例分屬成品、研究巨集、晶粒與系統裝置層級。數值用於理解測量邊界，不做跨層級排名。</p>${comparison.benchmarks.map(item=>`<article class="nvm-benchmark" id="benchmark-${esc(item.id)}"><p class="nvm-kicker">${esc(item.technology)} · ${esc(item.level)}</p><h3>${esc(item.implementation)}</h3><div class="nvm-two"><div><h4>原文數值</h4>${bullets(item.values)}</div><div><h4>必須一起保留的條件</h4>${bullets(item.conditions)}</div></div><div class="nvm-lesson">${esc(item.lesson)}</div>${cite(item.sourceIds)}</article>`).join('')}</section></article>`;
}

function foundryPanel() {
  const companies = [...new Set(foundry.milestones.map(item => item.foundry))];
  return `<article id="foundry" class="nvm-panel" data-nvm-panel>${panelHeader('晶圓代工公開證據 · '+intro.revision,'MRAM 與 ReRAM 的年度路線圖','同一節點可以有消費、車用、高保持、高耐久或高速版本。年度論壇的宣布與目標，透過後續年報、技術頁或產品文件核對後，才更新為已完成狀態。')}
  <aside class="nvm-note">${bullets(foundry.takeaways)}</aside><div class="nvm-filters"><label>選擇晶圓代工公司<select id="nvm-foundry-filter"><option value="">全部公司</option>${companies.map(company=>`<option>${esc(company)}</option>`).join('')}</select></label></div>
  <div class="nvm-roadmap">${foundry.milestones.map(item=>`<article class="nvm-milestone" id="milestone-${esc(item.id)}" data-foundry="${esc(item.foundry)}"><span class="nvm-year">${esc(item.year)} · ${esc(item.foundry)}</span><h3>${esc(item.technology)} · ${esc(item.node)}</h3>${tag(item.stage)}${paras(item.claim)}<p class="nvm-maturity-limit">${esc(item.limit)}</p>${cite(item.sourceIds)}</article>`).join('')}</div>
  <section><h3>各年度論壇資料取得範圍</h3><p>論壇公開主稿未必附上每個 eNVM 巨集的完整圖表。以下逐年交代已取得的資料，完成事件另以年報與產品文件交叉核對。</p>${foundry.annualForumCoverage.map(item=>`<details class="nvm-disclosure"><summary>${esc(item.year)} 年公開論壇與平台資料</summary><div>${paras(item.finding)}${cite([item.tsmcSourceId,item.gfSourceId])}</div></details>`).join('')}</section>
  <section><h3>性能與可靠度條件</h3>${foundry.performanceBoundaries.map(item=>`<article class="nvm-benchmark"><h4>${esc(item.platform)}</h4>${paras(item.values)}${paras(item.conditions)}<p class="nvm-maturity-limit">${esc(item.limit)}</p>${cite(item.sourceIds)}</article>`).join('')}</section>
  <section><h3>閱讀路線圖容易混淆的地方</h3>${foundry.corrections.map(item=>`<details class="nvm-disclosure"><summary>${esc(item.issue)}</summary><div>${paras(item.replacement)}${cite(item.sourceIds)}</div></details>`).join('')}</section></article>`;
}

function systemPanel(system) {
  return `<article id="system-${esc(system.id)}" class="nvm-panel" data-nvm-panel>${panelHeader('整合專題',system.title,system.summary)}${system.sections.map(section=>`<section class="nvm-prose"><h3>${esc(section.title)}</h3>${paras(section.body)}</section>`).join('')}<section><h3>來源</h3>${cite(system.sourceIds)}</section><section class="nvm-quiz"><h3>檢查理解</h3><p>${esc(system.quiz.question)}</p><details><summary>展開推理</summary>${paras(system.quiz.answer)}</details></section><nav class="nvm-bottom-nav"><a href="#panorama">回到全景</a><a href="#comparison">查看有條件的比較</a></nav></article>`;
}

const panorama = `<article id="panorama" class="nvm-panel" data-nvm-panel>${panelHeader('共同導論 · 全景先行','用三個互相獨立的視角看 NVM',intro.intro)}
<aside class="nvm-note">${esc(intro.terminology)}</aside><div class="nvm-axes">${intro.axes.map(axis=>`<article><h3>${esc(axis.title)}</h3>${paras(axis.body)}</article>`).join('')}</div>
<section><h3>十五個技術，同一套問題</h3><p>表內成熟度對應已查核的具名實作；進入專題可查看完整限制。搜尋也涵蓋操作、用途與來源關鍵字。</p><div class="nvm-filters"><label>搜尋技術或機制<input type="search" id="nvm-search" data-topic-filter placeholder="例如：磁化、穿隧、鐵電、校準"></label><label>儲存物理<select id="nvm-family" data-topic-filter><option value="">全部家族</option>${intro.families.map(family=>`<option value="${family.id}">${esc(family.title)}</option>`).join('')}</select></label><label>具名實作成熟度<select id="nvm-stage" data-topic-filter><option value="">全部狀態</option>${[...new Set(topics.map(topic=>topic.maturity.stage))].map(stage=>`<option>${esc(stage)}</option>`).join('')}</select></label></div><p id="nvm-count" class="nvm-results" role="status">十五個技術專題</p>
<table class="nvm-table nvm-tech-table"><caption class="nvm-small">儲存物理、具名商用狀態與主要代價</caption><thead><tr><th scope="col">技術與物理家族</th><th scope="col">儲存狀態</th><th scope="col">現況與主要取捨</th></tr></thead><tbody>${topics.map(topic=>`<tr data-topic-row data-family="${familyFor(topic.id).id}" data-stage="${esc(topic.maturity.stage)}" data-search="${esc(JSON.stringify(topic))}"><td data-label="技術"><a href="#topic-${topic.id}">${esc(topic.title)}</a><p class="nvm-small">${esc(familyFor(topic.id).title)}</p></td><td data-label="儲存狀態">${esc(topic.storage)}</td><td data-label="現況與主要取捨">${tag(topic.maturity.stage)}<p>${esc(topic.maturity.claim)}</p><p class="nvm-maturity-limit">${esc(topic.tradeoffs[0])}</p></td></tr>`).join('')}</tbody></table><div class="nvm-empty" id="nvm-empty" hidden><p>沒有符合條件的專題。可縮短關鍵字，或清除家族與成熟度篩選。</p><button type="button" id="nvm-reset">清除篩選</button></div></section>
<section><h3>建議閱讀順序</h3><ol class="nvm-reading-list">${intro.reading.map(item=>`<li><div><b>${esc(item.title)}</b>${paras(item.body)}</div></li>`).join('')}</ol></section>
<section><h3>把技術看完，再看系統</h3><div class="nvm-two">${comparison.systems.map(system=>`<article><h4><a href="#system-${esc(system.id)}">${esc(system.title)}</a></h4>${paras(system.summary)}</article>`).join('')}</div></section>
<aside class="nvm-note"><b>本輪範圍</b>${paras(intro.scope)}</aside>${cite(['INTRO-COURSE','INTRO-2016','INTRO-IRDS'])}</article>`;

const sourcePanel = `<article id="sources" class="nvm-panel" data-nvm-panel>${panelHeader('可追溯來源與共用資料','每一個結論，都能回到它的證據','這個網站以結構化專題資料為共同來源，包含位元單元、操作、天花板、專利、比較條件與年度紀錄。後續簡報可由同一批資料取材，保留來源與限制。')}<div class="nvm-note">${bullets(intro.evidenceRules)}</div><div class="nvm-actions"><a href="data/NVM知識資料.json" download>下載完整結構化資料</a><a href="data/NVM技術專題.md" download>下載完整專題文字</a></div><p class="nvm-small">研究版本：${intro.revision}。資料檔的分類、來源、成熟度與限制保留獨立欄位；正式簡報的版面與取材可另外編排。</p><div class="nvm-filters"><label>搜尋來源<input id="nvm-source-search" type="search" placeholder="公司、技術、專利、年份或來源編號"></label></div><p id="nvm-source-count" role="status" class="nvm-results">${sources.length} 筆來源紀錄</p>${sources.map(source=>`<details class="nvm-disclosure" id="source-${esc(source.id)}" data-source-record><summary>${esc(source.id)} · ${esc(source.label)}</summary><div><dl><dt>來源類別</dt><dd>${esc(source.kind)}</dd><dt>日期／查閱基準</dt><dd>${esc(sourceDate(source))}</dd><dt>定位</dt><dd>${esc(source.locator)}</dd><dt>支持範圍與限制</dt><dd>${esc(source.limit)}</dd><dt>原始連結</dt><dd><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">開啟原始來源</a></dd></dl></div></details>`).join('')}</article>`;
const patentPanel = `<article id="patents" class="nvm-panel" data-nvm-panel>${panelHeader('代表專利導讀',`${patents.length} 件專利，回到具體設計問題`,'每件先看它要解決的問題，再讀結構、操作與權利項。這裡是種子專利研究索引，未完成全家族法律狀態與自由實施分析。')}<aside class="nvm-note">優先權日、公開日與核准日不同。專利中的偏壓、材料、圖例與尺寸只屬於該實施例；專利受讓公司與其量產產品採用的實作，須另有證據連結。</aside>${topics.map(topic=>`<section><h3>${esc(topic.title)}</h3>${topic.patents.map(patent=>patentDetail(patent,topic)).join('')}</section>`).join('')}</article>`;
const glossaryPanel = `<article id="glossary" class="nvm-panel" data-nvm-panel>${panelHeader('共同語言','讀懂跨技術比較需要的詞彙','先辨別數字的物理意義與測量層級，才能比較其成本與適用範圍。')}<dl class="nvm-glossary">${comparison.glossary.map(item=>`<div><dt>${esc(item.term)}</dt><dd>${esc(item.definition)}</dd></div>`).join('')}</dl></article>`;

let html = `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${esc(intro.subtitle)}：十五個 NVM 技術專題、位元單元操作、比較表、專利與 GLOBALFOUNDRIES／TSMC MRAM、ReRAM 年度路線圖。"><meta name="theme-color" content="#0a1118"><title>${esc(intro.title)} · NVM Knowledge Hub</title><link rel="icon" href="assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="NVM技術全景.css"></head>
<body data-language="zh" data-pov-contract-id="POV-NVM-WEB-2026-08-29" data-pov-scope-id="POV-NVM-HUB-NEUTRAL-2026-08-29" data-artifact-mode="neutral-editorial" data-accountable-owner-key="sam-huang"><a class="nvm-skip" href="#main-content">跳至主要內容</a>
<header class="nvm-header"><a class="brand" href="index.html" aria-label="NVM 知識中心首頁"><strong>NVM</strong><span>知識中心<br>物理與技術全景</span></a><nav aria-label="知識中心導覽"><a href="index.html">知識中心首頁</a><a href="#panorama">技術全景</a><a href="#foundry">晶圓代工路線圖</a><a href="#sources">來源與下載</a></nav></header>
<section class="nvm-hero"><div><p class="nvm-kicker">NVM 技術全景 · 研究版本 ${intro.revision}</p><h1>從位元單元<br><em>看懂資料如何留下來</em></h1><p>十五個技術專題，從儲存物理、操作與專利，走向可量產的陣列與系統。每項優勢，都連著一項必須理解的代價。</p></div><div class="nvm-hero-map" aria-label="六個物理家族">${intro.families.map(family=>`<div><b>${esc(family.title)}</b><span>${esc(family.state)}</span></div>`).join('')}</div></section>
<nav class="nvm-breadcrumb" aria-label="麵包屑導覽"><a href="index.html">NVM 知識中心</a> ／ <span>NVM 技術全景</span></nav>
<div class="nvm-layout"><aside class="nvm-sidebar"><button type="button" class="nvm-contents-button" id="nvm-contents-toggle" aria-expanded="false" aria-controls="nvm-contents">選擇閱讀主題 <span aria-hidden="true">＋</span></button><nav id="nvm-contents" aria-label="專題目錄"><a href="#panorama">全景與共同導論</a><a href="#comparison">歷史表與現行比較</a><a href="#foundry">GF／TSMC 年度路線圖</a>${intro.families.map(family=>`<h3>${esc(family.title)}</h3>${family.topics.map(id=>`<a class="nvm-topic-link" href="#topic-${id}">${esc(topics.find(topic=>topic.id===id).title)}</a>`).join('')}`).join('')}<h3>陣列、系統與證據</h3>${comparison.systems.map(system=>`<a href="#system-${esc(system.id)}">${esc(system.title)}</a>`).join('')}<a href="#patents">${patents.length} 件代表專利</a><a href="#glossary">共同詞彙</a><a href="#sources">來源與資料下載</a></nav></aside>
<main class="nvm-main" id="main-content"><noscript><p class="nvm-nojs">此頁已包含全部專題文字。啟用 JavaScript 可使用分頁閱讀、篩選與操作切換。</p></noscript>${panorama}${comparisonPanel()}${foundryPanel()}${topics.map(topicPanel).join('')}${comparison.systems.map(systemPanel).join('')}${patentPanel}${glossaryPanel}${sourcePanel}</main></div>
<footer class="nvm-footer"><p>NVM 知識中心 · 公開來源研究 · ${intro.revision}</p><a href="index.html">返回知識中心</a> · <a href="#sources">查看來源與共用資料</a></footer><script type="module" src="NVM技術全景.js"></script></body></html>\n`;
// 全頁標題使用標籤語法，不保留句尾標點。
html = html.replace(/<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/giu, heading => heading.replace(/[。.!?！？](?=(?:[”’"'）)}\]】》]+)?\s*(?:<br\b[^>]*>|<\/(?:span|em|h[1-6])>))/giu,''));
const packageData = { schemaVersion: '1.0', revision: intro.revision, language: 'zh-Hant', classification: 'Public', title: intro.title, intro, topics, comparison, foundry, sources, provenance: { sourceFiles: ['NVM全景導論.json','NVM電荷專題.json','NVM新興專題.json','NVM比較與系統.json','NVM晶圓代工路線圖.json'], reviewScope: '公開來源與教學內容查核；網頁為後續簡報的取材來源' } };
const sourceMarkdown = ids => (ids || []).map(id => `- [${id}：${sourceMap.get(id).label}](${sourceMap.get(id).url})`).join('\n');
let markdown = `# ${intro.title}\n\n研究版本：${intro.revision}\n\n${intro.intro}\n\n${intro.axes.map(axis=>`## ${axis.title}\n\n${axis.body}`).join('\n\n')}\n\n${topics.map(topic=>`## ${topic.title}\n\n${topic.summary}\n\n成熟度：${topic.maturity.stage}。${topic.maturity.claim}\n\n${topic.maturity.limit}\n\n### 儲存與結構\n\n${topic.storage}\n\n${topic.structure}\n\n### 操作\n\n${topic.operations.map(operation=>`#### ${operation.title}\n\n操作前：${operation.before}\n\n刺激：${operation.stimulus}\n\n操作後：${operation.after}\n\n${operation.explanation}`).join('\n\n')}\n\n### 選擇與變異\n\n${topic.selection}\n\n${topic.variability}\n\n### 優勢與代價\n\n${[...topic.advantages,...topic.tradeoffs].map(item=>'- '+item).join('\n')}\n\n### 四層天花板\n\n${[['device','單元'],['array','陣列'],['process','製程'],['system','系統']].map(([key,label])=>`- ${label}：${topic.ceilings[key]}`).join('\n')}\n\n### 適用與誤用\n\n${topic.fit}\n\n${topic.avoid}\n\n### 專利導讀\n\n${topic.patents.map(patent=>`- [${patent.id}](${patent.url})：${patent.problem}。${patent.mechanism}。權利項導讀：${patent.claimReading}。限制：${patent.limit}`).join('\n')}\n\n### 檢查理解\n\n${topic.quiz.question}\n\n${topic.quiz.answer}\n\n### 來源\n\n${sourceMarkdown([...new Set([...topic.sourceIds,...topic.maturity.sourceIds])])}`).join('\n\n')}\n\n## 晶圓代工年度路線圖\n\n${foundry.milestones.map(item=>`### ${item.year} · ${item.foundry} · ${item.technology} · ${item.node}\n\n${item.stage}：${item.claim}\n\n限制：${item.limit}\n\n${sourceMarkdown(item.sourceIds)}`).join('\n\n')}\n\n## 比較案例\n\n${comparison.benchmarks.map(item=>`### ${item.implementation}\n\n${item.level}\n\n${list(item.values).join('；')}\n\n條件：${list(item.conditions).join('；')}\n\n${item.lesson}\n\n${sourceMarkdown(item.sourceIds)}`).join('\n\n')}\n\n${comparison.systems.map(system=>`## ${system.title}\n\n${system.summary}\n\n${system.sections.map(section=>`### ${section.title}\n\n${section.body}`).join('\n\n')}\n\n${sourceMarkdown(system.sourceIds)}`).join('\n\n')}\n\n## 共同詞彙\n\n${comparison.glossary.map(item=>`- ${item.term}：${item.definition}`).join('\n')}\n\n## 來源紀錄\n\n${sources.map(source=>`- [${source.id}：${source.label}](${source.url})。${source.kind}；${sourceDate(source)}；定位：${source.locator}；限制：${source.limit}`).join('\n')}\n`;
markdown += `

## 歷史課程表與現況修正

${comparison.historicalTable.intro}

| 比較項目 | ${comparison.historicalTable.columns.join(' | ')} |
|---|${comparison.historicalTable.columns.map(()=> '---').join('|')}|
${comparison.historicalTable.rows.map(row=>`| ${row.metric} | ${row.values.join(' | ')} |`).join('\n')}

${comparison.historicalTable.rows.filter(row=>row.note).map(row=>`- ${row.metric}：${row.note}`).join('\n')}

${comparison.historicalTable.corrections.map(item=>`### ${item.old}\n\n${item.current}\n\n${item.reason}\n\n${sourceMarkdown(item.sourceIds)}`).join('\n\n')}

## 專利書目與圖號

${patents.map(item=>`### ${item.id}\n\n優先權日：${item.priority}；受讓紀錄：${item.assignee}；代表圖／段落：${item.figures}。`).join('\n\n')}

## 系統理解題

${comparison.systems.map(item=>`### ${item.title}\n\n${item.quiz.question}\n\n${item.quiz.answer}`).join('\n\n')}

## 年度論壇資料取得範圍

${foundry.annualForumCoverage.map(item=>`### ${item.year}\n\n${item.finding}\n\n${sourceMarkdown([item.tsmcSourceId,item.gfSourceId])}`).join('\n\n')}

## 晶圓代工性能條件

${foundry.performanceBoundaries.map(item=>`### ${item.platform}\n\n${item.values}\n\n${item.conditions}\n\n${item.limit}\n\n${sourceMarkdown(item.sourceIds)}`).join('\n\n')}

## 路線圖閱讀修正

${foundry.corrections.map(item=>`### ${item.issue}\n\n${item.replacement}\n\n${sourceMarkdown(item.sourceIds)}`).join('\n\n')}
`;
const searchEntries = [
  {title_zh:intro.title, title_en:intro.title, url:'NVM技術全景.html', tags:'NVM 全景 物理 比較 科普 bitcell MRAM ReRAM GLOBALFOUNDRIES TSMC', language:'zh-Hant'},
  ...topics.map(topic=>({title_zh:topic.title,title_en:topic.title,url:`NVM技術全景.html#topic-${topic.id}`,tags:[topic.storage,topic.summary,topic.maturity.claim,...topic.patents.map(patent=>patent.id)].join(' '),language:'zh-Hant'})),
  ...comparison.systems.map(system=>({title_zh:system.title,title_en:system.title,url:`NVM技術全景.html#system-${system.id}`,tags:system.summary,language:'zh-Hant'})),
  {title_zh:'GF／TSMC 年度路線圖',title_en:'GF／TSMC 年度路線圖',url:'NVM技術全景.html#foundry',tags:'GLOBALFOUNDRIES TSMC eMRAM ReRAM RRAM eNVM roadmap 22FDX 12LP AutoPro150',language:'zh-Hant'},
  {title_zh:'歷史總表與有條件比較',title_en:'歷史總表與有條件比較',url:'NVM技術全景.html#comparison',tags:'2016 2021 2026 比較 能量 耐久 保持 延遲',language:'zh-Hant'}
];
const outputs = [['data/NVM搜尋索引.js','window.NVMTopicIndex = '+JSON.stringify(searchEntries,null,2)+';\n'],['NVM技術全景.html',html],['data/NVM知識資料.json',JSON.stringify(packageData,null,2)+'\n'],['data/NVM技術專題.md',markdown]];
for (const [file,bytes] of outputs) {
  const target = path.join(root,file);
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target,'utf8') !== bytes) throw new Error(`衍生檔未同步：${file}`);
  } else fs.writeFileSync(target,bytes,'utf8');
}
const contentHash = crypto.createHash('sha256').update(serialized).digest('hex');
console.log(`通過：${topics.length} 個技術、${comparison.systems.length} 個整合專題、${patents.length} 件專利、${sources.length} 筆來源、${foundry.milestones.length} 筆路線圖；${check?'衍生內容一致':'已完成靜態網頁與資料匯出'}；內容雜湊 ${contentHash}`);
