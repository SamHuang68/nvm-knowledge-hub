import {validateRewriteCycle, renderRewriteCycle, rewriteCycleMarkdown} from './NVM寫抹循環.mjs';
import {renderOperationStudy} from './NVM工程圖解介面.mjs';

const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const choose = (language, zh, en) => language === 'en' ? en : zh;
const paragraphs = value => (Array.isArray(value) ? value : [value]).filter(Boolean).map(text => `<p>${esc(text)}</p>`).join('');

/** Combine authored IP records and their source-bound drawing modules. */
export function collectIPCurriculum(index, language, rendererFor) {
  const ids = new Set();
  const units = index.units.map(record => {
    if (!record.id || ids.has(record.id)) throw new Error('IP 單元識別碼缺漏或重複');
    ids.add(record.id);
    for (const field of ['title','shortTitle','vendor','group','hostTopic','summary','program','reverse','readout','lesson']) {
      if (!record[field]?.trim()) throw new Error(`${record.id} 缺少 IP 導讀欄位 ${field}`);
    }
    const study = rendererFor(record.id)(record.id, language);
    if (!study?.structure?.svg?.startsWith('<svg') || !study.structure.title || !study.structure.caption || !study.structure.legend?.length) throw new Error(`${record.id} 缺少完整 IP 結構圖`);
    if (study.operations?.length !== 3 || study.operations.map(operation => operation.operationId).join(',') !== 'write,erase,read') throw new Error(`${record.id} 的 IP 操作契約不完整`);
    for (const operation of study.operations) {
      if (operation.topicId !== 'ip-'+record.id) throw new Error(`${record.id} 的操作主題識別碼不一致`);
      if (!operation.title || !operation.summary || !operation.sources?.length || !operation.variants?.length) throw new Error(`${record.id} 的操作來源或內容缺漏`);
      for (const variant of operation.variants) {
        if (variant.frames?.length < 3 || !variant.legend?.length || !variant.caveat) throw new Error(`${record.id} 的操作圖說不完整`);
        for (const frame of variant.frames) {
          if (!frame.svg?.startsWith('<svg') || !frame.id || !frame.title || !frame.state || !frame.stimulus || !frame.caption || !frame.sourceIds?.length) throw new Error(`${record.id} 的狀態圖欄位不完整`);
        }
      }
    }
    const unit = {...record, ...study};
    if (unit.group !== 'otp') validateRewriteCycle(unit);
    return unit;
  });
  const sources = [...new Map([...units.flatMap(unit => unit.operations.flatMap(operation => [...operation.sources,...operation.variants.flatMap(variant => variant.sources || [])])),...(index.lineage?.sources||[])].map(source => [source.id, source])).values()];
  const sourceIds = new Set(sources.map(source => source.id));
  for (const unit of units) {
    const references = [...(unit.structure.sourceIds || []),...unit.operations.flatMap(operation => operation.variants.flatMap(variant => variant.frames.flatMap(frame => frame.sourceIds)))];
    if (!references.length || references.some(id => !sourceIds.has(id))) throw new Error(`${unit.id} 引用不存在的 IP 來源`);
  }
  if(index.lineage){
    for(const entry of index.lineage.entries){
      if(!entry.id||!entry.title||!entry.summary||!entry.events?.length||!entry.currentContext||!entry.cellBoundary||!entry.sourceIds?.length)throw new Error('IP 技術沿革欄位不完整');
      if(!ids.has(entry.unitId)||[...entry.sourceIds,...entry.events.flatMap(event=>event.sourceIds||[])].some(id=>!sourceIds.has(id)))throw new Error('IP 技術沿革的單元或來源不存在');
      if(entry.events.some(event=>!event.date||!event.title||!event.body||!event.sourceIds?.length))throw new Error('IP 承接事件缺少日期、說明或來源');
    }
  }
  return {schemaVersion:'1.1', revision:index.revision, language, groups:index.groups, units, sources,...(index.lineage?{lineage:index.lineage}:{})};
}

export function renderIPDirectory(curriculum, language) {
  const t = (zh, en) => choose(language, zh, en);
  const countFor = group => curriculum.units.filter(unit => unit.group === group.id).length;
  return `<article class="nvm-panel nvm-ip-directory nvm-ip-editorial" id="ip-directory" data-nvm-panel>
  <header class="nvm-ip-directory-cover"><div><p class="nvm-kicker">${t('IP 與製程 · 單元導讀','IP AND PROCESSES · CELL STUDIES')}</p><h2>${t('IP 單元與操作原理','IP Cells and Operating Principles')}</h2><p class="nvm-lede">${t('先選一款 IP，沿同一單元看寫入、反向更新與讀取。OTP、MTP、MRAM、ReRAM 的差異直接落在圖中的儲存區與操作路徑。','Choose an IP and follow the same cell through programming, reverse update and read. The storage region and operating paths explain the differences among OTP, MTP, MRAM and ReRAM.')}</p></div><dl><div><dt>${t('具名單元','Named Cells')}</dt><dd>${curriculum.units.length}</dd></div><div><dt>${t('技術家族','Technology Families')}</dt><dd>${curriculum.groups.length}</dd></div></dl></header>
  <nav class="nvm-ip-family-index" aria-label="${t('IP 家族入口','IP Family Index')}">${curriculum.groups.map((group,i)=>`<a href="#ip-group-${esc(group.id)}"><span>${String(i+1).padStart(2,'0')}</span><strong>${esc(group.label)}</strong><small>${countFor(group)} ${t('款單元','Cells')}</small></a>`).join('')}</nav>
  ${curriculum.groups.map(group => `<section class="nvm-ip-group" id="ip-group-${esc(group.id)}"><div class="nvm-ip-group-label"><h3>${esc(group.label)}</h3><p>${esc(group.description)}</p></div><div class="nvm-ip-rows">${curriculum.units.filter(unit => unit.group === group.id).map(unit => `<article class="nvm-ip-row" data-ip-entry="${esc(unit.id)}"><div><p class="nvm-ip-vendor">${esc(unit.vendor)}</p><h4><a href="#ip-${esc(unit.id)}">${esc(unit.shortTitle)}</a></h4><a class="nvm-ip-entry-link" href="#ip-${esc(unit.id)}">${t('開啟單元與操作圖','Explore the Cell and Operations')} <span aria-hidden="true">↗</span></a></div><dl><div><dt>${t('寫入','Program')}</dt><dd>${unit.group === 'mtp' ? 'PGM · ' : ''}${esc(unit.program)}</dd></div><div><dt>${t('反向操作','Reverse Operation')}</dt><dd>${unit.group === 'mtp' ? 'ERS · ' : ''}${esc(unit.reverse)}</dd></div><div><dt>${t('讀取','Read')}</dt><dd>${esc(unit.readout)}</dd></div></dl></article>`).join('')}</div></section>`).join('')}</article>`;
}

export function renderIPNavigation(curriculum, language) {
  return `<details class="nvm-ip-nav"><summary>${choose(language,'IP 單元與操作原理','IP Cells and Operations')}</summary><a href="#ip-directory">${choose(language,'查看全部 IP 單元','Browse All IP Cells')}</a>${curriculum.groups.map(group => `<p class="nvm-ip-nav-group">${esc(group.label)}</p>${curriculum.units.filter(unit => unit.group === group.id).map(unit => `<a class="nvm-ip-link" href="#ip-${esc(unit.id)}">${esc(unit.shortTitle)}</a>`).join('')}`).join('')}</details>`;
}

export function renderIPLineage(curriculum,language,cite){
  const t=(zh,en)=>choose(language,zh,en),lineage=curriculum.lineage;
  if(!lineage)return '';
  return `<article id="ip-lineage" class="nvm-panel nvm-ip-lineage" data-nvm-panel><header><p class="nvm-kicker">${t('IP 與製程 · 技術沿革','IP AND PROCESSES · TECHNOLOGY LINEAGE')}</p><h2>${esc(lineage.title)}</h2><div class="nvm-lede">${paragraphs(lineage.intro)}</div></header><nav class="nvm-lineage-index" aria-label="${t('技術家族','Technology Families')}">${lineage.entries.map(entry=>`<a href="#lineage-${esc(entry.id)}">${esc(entry.title)}</a>`).join('')}</nav>${lineage.entries.map(entry=>`<section id="lineage-${esc(entry.id)}" class="nvm-lineage-entry"><h3>${esc(entry.title)}</h3>${paragraphs(entry.summary)}<ol class="nvm-lineage-events">${entry.events.map(event=>`<li><time>${esc(event.date)}</time><div><h4>${esc(event.title)}</h4>${paragraphs(event.body)}${cite(event.sourceIds)}</div></li>`).join('')}</ol><div class="nvm-lineage-context"><h4>${t('後續產品與現況','Subsequent Products and Current Context')}</h4>${paragraphs(entry.currentContext)}<h4>${t('與單元圖解的對應','Relation to the Cell Study')}</h4>${paragraphs(entry.cellBoundary)}${cite(entry.sourceIds)}<a href="#ip-${esc(entry.unitId)}">${t('閱讀這個家族的單元與操作','Explore This Family’s Cell and Operations')} →</a></div></section>`).join('')}</article>`;
}

export function ipLineageMarkdown(curriculum,language,sourceMarkdown){
  const lineage=curriculum.lineage;if(!lineage)return '';
  return `## ${lineage.title}\n\n${lineage.intro}\n\n${lineage.entries.map(entry=>`### ${entry.title}\n\n${entry.summary}\n\n${entry.events.map(event=>`#### ${event.date} · ${event.title}\n\n${event.body}\n\n${sourceMarkdown(event.sourceIds)}`).join('\n\n')}\n\n${entry.currentContext}\n\n${entry.cellBoundary}\n\n${sourceMarkdown(entry.sourceIds)}`).join('\n\n')}`;
}

export function renderIPPanels(curriculum, language, cite) {
  const t = (zh, en) => choose(language, zh, en);
  return curriculum.units.map((unit, index) => `<article class="nvm-panel nvm-ip-panel" id="ip-${esc(unit.id)}" data-nvm-panel data-ip-study="${esc(unit.id)}"><header><p class="nvm-kicker">${esc(unit.vendor)} · ${esc(curriculum.groups.find(group => group.id === unit.group).label)}</p><h2 tabindex="-1">${esc(unit.title)}</h2><div class="nvm-lede">${paragraphs(unit.summary)}</div></header>${renderRewriteCycle(unit,language,cite)}
<section class="nvm-ip-structure-section"><h3>${t('先看單元：儲存區、控制端與讀取路徑','The Cell: Storage, Control and Read Path')}</h3><figure class="nvm-ip-structure-figure" data-engineering-figure data-figure-name="ip-${esc(unit.id)}-structure"><figcaption class="nvm-ip-structure-heading"><h4>${esc(unit.structure.title)}</h4><span>${t('原理示意 · 可編輯 SVG','Principle Diagram · Editable SVG')}</span></figcaption><div class="nvm-ip-structure-drawing">${unit.structure.svg}</div><div class="nvm-ip-structure-notes" data-figure-notes><dl class="nvm-op-legend">${unit.structure.legend.map(item => `<div><dt>${esc(item.symbol)}</dt><dd>${esc(item.meaning)}</dd></div>`).join('')}</dl><p>${esc(unit.structure.caption)}</p></div><div class="nvm-figure-actions"><button type="button" data-engineering-zoom>${t('放大單元圖','Enlarge Cell')}</button><button type="button" data-engineering-download>${t('下載 SVG','Download SVG')}</button></div></figure>${cite(unit.structure.sourceIds)}</section>
<section><h3>${t('沿同一單元追蹤完整操作','Follow the Complete Operation on the Same Cell')}</h3><div class="nvm-operation" data-operation-widget${unit.group !== 'otp' ? ' data-complete-cycle' : ''}><div class="nvm-operation-buttons" role="group" aria-label="${esc(unit.shortTitle)} ${t('操作選擇','Operation Selection')}">${unit.operations.map((operation, operationIndex) => `<button type="button" data-operation-select="${esc(operation.operationId)}" aria-controls="ip-op-${esc(unit.id)}-${esc(operation.operationId)}" aria-pressed="${operationIndex === 0}">${esc(operation.title)}</button>`).join('')}</div>${unit.operations.map(operation => `<div id="ip-op-${esc(unit.id)}-${esc(operation.operationId)}" data-operation-detail="${esc(operation.operationId)}"><h4>${esc(operation.title)}</h4>${renderOperationStudy(operation,language)}</div>`).join('')}</div></section>
<section class="nvm-ip-takeaway"><h3>${t('用這個單元理解 IP 取捨','What This Cell Explains About the IP')}</h3>${paragraphs(unit.lesson)}<p><a href="#topic-${esc(unit.hostTopic)}">${t('延伸閱讀相關儲存物理','Continue with the Related Device Physics')} →</a></p></section>
<nav class="nvm-bottom-nav" aria-label="${t('IP 單元接續','Continue Through IP Cells')}"><a href="${index ? '#ip-'+esc(curriculum.units[index-1].id) : '#ip-directory'}">${index ? t('上一款：','Previous: ')+esc(curriculum.units[index-1].shortTitle) : t('回到 IP 目錄','Back to the IP Directory')}</a><a href="${index < curriculum.units.length-1 ? '#ip-'+esc(curriculum.units[index+1].id) : '#ip-directory'}">${index < curriculum.units.length-1 ? t('下一款：','Next: ')+esc(curriculum.units[index+1].shortTitle) : t('回到 IP 目錄','Back to the IP Directory')}</a></nav></article>`).join('');
}

export function ipCurriculumMarkdown(curriculum, language, sourceMarkdown) {
  const t = (zh, en) => choose(language, zh, en);
  return `## ${t('具名 IP 單元與操作主線','Named IP Cells and Operating Principles')}\n\n${curriculum.units.map(unit => `### ${unit.title}\n\n${unit.vendor}\n\n${unit.summary}${rewriteCycleMarkdown(unit,language,sourceMarkdown)}\n\n${unit.structure.title}\n\n${unit.structure.caption}\n\n${unit.structure.legend.map(item => '- '+item.symbol+' · '+item.meaning).join('\n')}\n\n${sourceMarkdown(unit.structure.sourceIds)}\n\n${unit.operations.map(operation => `#### ${operation.title}\n\n${operation.summary}\n\n${operation.variants.map(variant => `${variant.mechanism}\n\n${variant.frames.map((frame, index) => `**${index+1}. ${frame.title}**\n\n${t('狀態','State')}: ${frame.state}\n\n${t('刺激','Stimulus')}: ${frame.stimulus}\n\n${frame.caption}`).join('\n\n')}\n\n${variant.legend.map(item => '- '+item.symbol+' · '+item.meaning).join('\n')}\n\n${variant.caveat}\n\n${sourceMarkdown((variant.sources||operation.sources).map(source => source.id))}`).join('\n\n')}`).join('\n\n')}\n\n#### ${t('IP 單元取捨','IP Cell Tradeoffs')}\n\n${unit.lesson}`).join('\n\n')}`;
}
