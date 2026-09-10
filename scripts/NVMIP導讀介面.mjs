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
    return {...record, ...study};
  });
  const sources = [...new Map(units.flatMap(unit => unit.operations.flatMap(operation => [...operation.sources,...operation.variants.flatMap(variant => variant.sources || [])])).map(source => [source.id, source])).values()];
  const sourceIds = new Set(sources.map(source => source.id));
  for (const unit of units) {
    const references = [...(unit.structure.sourceIds || []),...unit.operations.flatMap(operation => operation.variants.flatMap(variant => variant.frames.flatMap(frame => frame.sourceIds)))];
    if (!references.length || references.some(id => !sourceIds.has(id))) throw new Error(`${unit.id} 引用不存在的 IP 來源`);
  }
  return {schemaVersion:'1.0', revision:index.revision, language, groups:index.groups, units, sources};
}

export function renderIPDirectory(curriculum, language) {
  const t = (zh, en) => choose(language, zh, en);
  return `<section class="nvm-ip-directory" id="ip-directory"><h3>${t('從具名 IP 的單元開始','Start with Named IP Cells')}</h3><p>${t('先選一款 IP，沿同一單元看寫入、反向更新與讀取。OTP、MTP、MRAM、ReRAM 的差異直接落在圖中的儲存區與操作路徑。','Choose an IP and follow the same cell through programming, reverse update and read. The storage region and operating paths explain the differences among OTP, MTP, MRAM and ReRAM.')}</p>${curriculum.groups.map(group => `<section class="nvm-ip-group"><div class="nvm-ip-group-label"><span>${esc(group.label)}</span><p>${esc(group.description)}</p></div><div class="nvm-ip-rows">${curriculum.units.filter(unit => unit.group === group.id).map(unit => `<article class="nvm-ip-row" data-ip-entry="${esc(unit.id)}"><div><p class="nvm-ip-vendor">${esc(unit.vendor)}</p><h4><a href="#ip-${esc(unit.id)}">${esc(unit.shortTitle)}</a></h4><span class="nvm-ip-entry-link">${t('開啟單元與操作圖','Explore the Cell and Operations')} →</span></div><dl><div><dt>${t('寫入','Program')}</dt><dd>${esc(unit.program)}</dd></div><div><dt>${t('反向操作','Reverse Operation')}</dt><dd>${esc(unit.reverse)}</dd></div><div><dt>${t('讀取','Read')}</dt><dd>${esc(unit.readout)}</dd></div></dl></article>`).join('')}</div></section>`).join('')}</section>`;
}

export function renderIPNavigation(curriculum, language) {
  return `<div class="nvm-ip-nav"><h3>${choose(language,'IP 單元主線','IP Cell Studies')}</h3>${curriculum.groups.map(group => `<p class="nvm-ip-nav-group">${esc(group.label)}</p>${curriculum.units.filter(unit => unit.group === group.id).map(unit => `<a class="nvm-ip-link" href="#ip-${esc(unit.id)}">${esc(unit.shortTitle)}</a>`).join('')}`).join('')}</div>`;
}

export function renderIPPanels(curriculum, language, cite) {
  const t = (zh, en) => choose(language, zh, en);
  return curriculum.units.map((unit, index) => `<article class="nvm-panel nvm-ip-panel" id="ip-${esc(unit.id)}" data-nvm-panel data-ip-study="${esc(unit.id)}"><header><p class="nvm-kicker">${esc(unit.vendor)} · ${esc(curriculum.groups.find(group => group.id === unit.group).label)}</p><h2 tabindex="-1">${esc(unit.title)}</h2><div class="nvm-lede">${paragraphs(unit.summary)}</div></header>
<section class="nvm-ip-structure-section"><h3>${t('先看單元：儲存區、控制端與讀取路徑','The Cell: Storage, Control and Read Path')}</h3><figure class="nvm-ip-structure-figure" data-engineering-figure data-figure-name="ip-${esc(unit.id)}-structure"><figcaption class="nvm-ip-structure-heading"><h4>${esc(unit.structure.title)}</h4><span>${t('原理示意 · 可編輯 SVG','Principle Diagram · Editable SVG')}</span></figcaption><div class="nvm-ip-structure-drawing">${unit.structure.svg}</div><div class="nvm-ip-structure-notes" data-figure-notes><dl class="nvm-op-legend">${unit.structure.legend.map(item => `<div><dt>${esc(item.symbol)}</dt><dd>${esc(item.meaning)}</dd></div>`).join('')}</dl><p>${esc(unit.structure.caption)}</p></div><div class="nvm-figure-actions"><button type="button" data-engineering-zoom>${t('放大單元圖','Enlarge Cell')}</button><button type="button" data-engineering-download>${t('下載 SVG','Download SVG')}</button></div></figure>${cite(unit.structure.sourceIds)}</section>
<section><h3>${t('沿同一單元追蹤完整操作','Follow the Complete Operation on the Same Cell')}</h3><div class="nvm-operation" data-operation-widget><div class="nvm-operation-buttons" role="group" aria-label="${esc(unit.shortTitle)} ${t('操作選擇','Operation Selection')}">${unit.operations.map((operation, operationIndex) => `<button type="button" data-operation-select="${esc(operation.operationId)}" aria-controls="ip-op-${esc(unit.id)}-${esc(operation.operationId)}" aria-pressed="${operationIndex === 0}">${esc(operation.title)}</button>`).join('')}</div>${unit.operations.map(operation => `<div id="ip-op-${esc(unit.id)}-${esc(operation.operationId)}" data-operation-detail="${esc(operation.operationId)}"><h4>${esc(operation.title)}</h4>${renderOperationStudy(operation,language)}</div>`).join('')}</div></section>
<section class="nvm-ip-takeaway"><h3>${t('用這個單元理解 IP 取捨','What This Cell Explains About the IP')}</h3>${paragraphs(unit.lesson)}<p><a href="#topic-${esc(unit.hostTopic)}">${t('延伸閱讀相關儲存物理','Continue with the Related Device Physics')} →</a></p></section>
<nav class="nvm-bottom-nav" aria-label="${t('IP 單元接續','Continue Through IP Cells')}"><a href="${index ? '#ip-'+esc(curriculum.units[index-1].id) : '#panorama'}">${index ? t('上一款：','Previous: ')+esc(curriculum.units[index-1].shortTitle) : t('回到 IP 主線','Back to the IP Overview')}</a><a href="${index < curriculum.units.length-1 ? '#ip-'+esc(curriculum.units[index+1].id) : '#panorama'}">${index < curriculum.units.length-1 ? t('下一款：','Next: ')+esc(curriculum.units[index+1].shortTitle) : t('回到 IP 主線','Back to the IP Overview')}</a></nav></article>`).join('');
}

export function ipCurriculumMarkdown(curriculum, language, sourceMarkdown) {
  const t = (zh, en) => choose(language, zh, en);
  return `## ${t('具名 IP 單元與操作主線','Named IP Cells and Operating Principles')}\n\n${curriculum.units.map(unit => `### ${unit.title}\n\n${unit.vendor}\n\n${unit.summary}\n\n${unit.structure.title}\n\n${unit.structure.caption}\n\n${unit.structure.legend.map(item => '- '+item.symbol+' · '+item.meaning).join('\n')}\n\n${sourceMarkdown(unit.structure.sourceIds)}\n\n${unit.operations.map(operation => `#### ${operation.title}\n\n${operation.summary}\n\n${operation.variants.map(variant => `${variant.mechanism}\n\n${variant.frames.map((frame, index) => `**${index+1}. ${frame.title}**\n\n${t('狀態','State')}: ${frame.state}\n\n${t('刺激','Stimulus')}: ${frame.stimulus}\n\n${frame.caption}`).join('\n\n')}\n\n${variant.legend.map(item => '- '+item.symbol+' · '+item.meaning).join('\n')}\n\n${variant.caveat}\n\n${sourceMarkdown((variant.sources||operation.sources).map(source => source.id))}`).join('\n\n')}`).join('\n\n')}\n\n#### ${t('IP 單元取捨','IP Cell Tradeoffs')}\n\n${unit.lesson}`).join('\n\n')}`;
}
