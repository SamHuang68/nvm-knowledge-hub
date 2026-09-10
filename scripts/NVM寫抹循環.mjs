const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

export function validateRewriteCycle(record) {
  const erase = record.operations?.find(operation => (operation.operationId || operation.id) === 'erase');
  if (!erase) throw new Error(`${record.id} 缺少抹除或反向更新操作`);
  const frames = erase.variants?.[0]?.frames;
  const cycle = record.eraseCycle && {
    ...record.eraseCycle,
    before: erase.before || frames?.[0]?.state,
    mechanism: erase.stimulus || (frames?.[2]?.caption ? `${erase.variants[0].mechanism} — ${frames[2].caption}` : erase.summary),
    after: erase.after || frames?.at(-1)?.caption,
  };
  for (const field of ['title','sequence','definition','before','mechanism','after','verification','granularity','limits']) {
    if (!cycle?.[field]?.trim()) throw new Error(`${record.id} 缺少可重寫操作循環欄位：${field}`);
  }
  if (!cycle.sourceIds?.length) throw new Error(`${record.id} 缺少可重寫操作循環來源`);
  record.eraseCycle = cycle;
}

export function renderRewriteCycle(record, language, cite) {
  if (!record.eraseCycle) return '';
  const english = language === 'en';
  const cycle = record.eraseCycle;
  const labels = english
    ? [['before','Before Erase / Reverse Update'],['mechanism','Erase / Reverse-Update Mechanism'],['after','Result and Subsequent Write'],['verification','Completion and Verification'],['granularity','Operation Granularity'],['limits','Evidence and Cycling Limits']]
    : [['before','抹除／反向更新前'],['mechanism','抹除／反向更新機制'],['after','操作後與再次寫入'],['verification','完成判定與驗證'],['granularity','操作粒度'],['limits','證據與循環限制']];
  return `<section class="nvm-cycle-summary" data-cycle-summary><h3>${escape(cycle.title)}</h3><p>${escape(cycle.definition)}</p><p class="nvm-cycle-sequence">${escape(cycle.sequence)}</p><dl class="nvm-state-sequence">${labels.map(([field,label])=>`<div><dt>${label}</dt><dd>${escape(cycle[field])}</dd></div>`).join('')}</dl>${cite(cycle.sourceIds)}</section>`;
}

export function rewriteCycleMarkdown(record, language, cite) {
  if (!record.eraseCycle) return '';
  const cycle = record.eraseCycle;
  return `\n\n#### ${cycle.title}\n\n${cycle.definition}\n\n${cycle.sequence}\n\n${['before','mechanism','after','verification','granularity','limits'].map(field=>cycle[field]).join('\n\n')}\n\n${cite(cycle.sourceIds)}`;
}
