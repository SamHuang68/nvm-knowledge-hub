import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const markerStart = '<!-- NAMED-COMPARISON:START -->';
const markerEnd = '<!-- NAMED-COMPARISON:END -->';
export const metricLabels = {
  endurance: { en: 'Endurance', zh: '耐久次數' },
  retention: { en: 'Data retention', zh: '資料保持' },
  'program-time': { en: 'Write / program time', zh: '寫入／編程時間' }
};
const contextLabels = {
  processNode: { en: 'Process node', zh: '製程節點' },
  macroRevision: { en: 'Macro / silicon revision', zh: '巨集／晶片修訂版' },
  capacity: { en: 'Capacity', zh: '容量' },
  interface: { en: 'Interface / granularity', zh: '介面／粒度' },
  supply: { en: 'Device supply', zh: '元件供電' },
  temperature: { en: 'Temperature', zh: '溫度' },
  testPopulation: { en: 'Test population', zh: '測試樣本' }
};
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const bilingual = value => `<span data-lang="en">${esc(value.en)}</span><span data-lang="zh">${esc(value.zh)}</span>`;
const pair = (value, label) => {
  for (const lang of ['en', 'zh']) assert.ok(typeof value?.[lang] === 'string' && value[lang].trim(), `${label}: missing ${lang}`);
};

export function validateNamedComparison(data) {
  assert.equal(data.schemaVersion, 1);
  assert.equal(data.evidenceKind, 'manufacturer-datasheet');
  assert.match(data.reviewedOn, /^\d{4}-\d{2}-\d{2}$/);
  pair(data.scope, 'scope');
  const ids = new Set();
  for (const source of data.sources) {
    assert.ok(!ids.has(source.id), `duplicate source ${source.id}`);
    ids.add(source.id);
    assert.equal(new URL(source.url).protocol, 'https:');
    for (const key of ['publisher', 'title', 'version', 'published', 'rights']) assert.ok(source[key]?.trim(), `source ${key}`);
  }
  assert.ok(data.cases.length >= 2 && data.cases.length <= 3, 'bounded two-to-three case comparison');
  const caseIds = new Set();
  const refs = values => {
    assert.ok(values?.length, 'reported fact needs a source locator');
    for (const ref of values) {
      assert.ok(Number.isInteger(ref.page) && ref.page > 0, 'source page');
      assert.ok(ref.locator?.trim(), 'source table or section');
    }
  };
  for (const item of data.cases) {
    assert.match(item.id, /^[a-z][a-z0-9-]+$/);
    assert.ok(!caseIds.has(item.id), 'duplicate case'); caseIds.add(item.id);
    assert.ok(ids.has(item.sourceId), 'unknown source');
    assert.ok(item.name?.trim() && item.technology?.trim(), 'named implementation');
    pair(item.selection, 'selection');
    for (const key of Object.keys(contextLabels)) {
      const entry = item.context[key];
      assert.ok(entry && ['reported', 'unknown'].includes(entry.status), `${item.id} ${key} status`);
      if (entry.status === 'unknown') pair(entry.reason, `${item.id} ${key} reason`);
      else { pair(entry.text, `${item.id} ${key}`); refs(entry.refs); }
    }
    assert.deepEqual(item.metrics.map(metric => metric.id), Object.keys(metricLabels), 'three ordered metrics');
    for (const metric of item.metrics) {
      for (const key of ['value', 'conditions', 'basis']) pair(metric[key], `${item.id} ${metric.id} ${key}`);
      refs(metric.refs);
    }
  }
  return data;
}

export function renderNamedComparison(data) {
  validateNamedComparison(data);
  const sources = new Map(data.sources.map(source => [source.id, source]));
  const citations = (item, refs) => refs.map(ref => `<a class="named-source-link" href="${esc(sources.get(item.sourceId).url)}#page=${ref.page}" target="_blank" rel="noopener noreferrer">${esc(sources.get(item.sourceId).version)} · ${esc(ref.locator)} · p. ${ref.page}</a>`).join(' ');
  const cases = data.cases.map(item => {
    const context = Object.entries(contextLabels).map(([key, label]) => {
      const entry = item.context[key];
      return `<div><dt>${bilingual(label)}</dt><dd>${entry.status === 'unknown' ? `<strong class="named-unknown">${bilingual({ en: 'Unknown', zh: '未知' })}</strong> · ${bilingual(entry.reason)}` : `${bilingual(entry.text)} ${citations(item, entry.refs)}`}</dd></div>`;
    }).join('\n');
    return `<details id="named-case-${item.id}" class="named-case" data-named-case="${item.id}"><summary><span class="named-case-name">${esc(item.name)}</span><span class="named-case-kind">${esc(item.technology)}</span><span class="named-case-action">${bilingual({ en: 'Conditions and unknowns', zh: '條件與未知項' })}</span></summary><div class="named-case-body"><p>${bilingual(item.selection)}</p><dl>${context}</dl></div></details>`;
  }).join('\n');
  const rows = Object.entries(metricLabels).map(([id, label]) => `<tr><th scope="row">${bilingual(label)}</th>${data.cases.map(item => {
    const metric = item.metrics.find(value => value.id === id);
    return `<td data-case="${item.id}" data-metric="${id}"><strong class="named-metric-value">${bilingual(metric.value)}</strong><p>${bilingual(metric.conditions)}</p><p class="named-metric-basis">${bilingual(metric.basis)}</p>${citations(item, metric.refs)}</td>`;
  }).join('')}</tr>`).join('\n');
  const sourceList = data.sources.map(source => `<li><a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)} · ${esc(source.title)}</a><span>${esc(source.version)} · ${bilingual({ en: 'Published / revised', zh: '發布／修訂' })} ${esc(source.published)}</span></li>`).join('\n');
  return `${markerStart}
    <section id="named-implementations" class="lens-panel named-comparison" aria-labelledby="named-comparison-title">
      <div class="hub-sec-header">
        <div class="hub-sec-badge">${bilingual({ en: '01B · SOURCE-BOUND CASES', zh: '01B · 可追溯具名案例' })}</div>
        <h2 id="named-comparison-title">${bilingual({ en: 'Named Cases · Conditions Differ, No Ranking', zh: '具名案例・條件不同，不作排名' })}</h2>
      </div>
      <p class="named-lead">${bilingual(data.scope)}</p>
      <p class="named-evidence-kind">${bilingual({ en: 'Manufacturer datasheets · not independent measurements. Each metric inherits its device conditions below; row-specific conditions take precedence.', zh: '原廠規格書・非獨立實測。各指標連同下方元件條件解讀，以該列特定條件為準。' })}</p>
      <div class="named-case-grid">${cases}</div>
      <p id="named-table-help" class="named-table-help">${bilingual({ en: 'On narrow screens, scroll the table horizontally. Keyboard: focus the table region and use the arrow keys.', zh: '窄螢幕可橫向捲動表格。鍵盤操作：將焦點移至表格區域後使用方向鍵。' })}</p>
      <div class="named-table-scroll" role="region" tabindex="0" aria-labelledby="named-comparison-title" aria-describedby="named-table-help">
        <table class="named-metric-table">
          <caption>${bilingual({ en: 'Three metrics with their original scope and source locators', zh: '三項指標、原始條件與來源定位' })}</caption>
          <thead><tr><th scope="col">${bilingual({ en: 'Metric', zh: '指標' })}</th>${data.cases.map(item => `<th scope="col">${esc(item.name)}<small>${esc(item.technology)}</small></th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <div class="named-reading-note">
        <h3>${bilingual({ en: 'Before a Design Decision', zh: '設計決策前仍需確認' })}</h3>
        <p>${bilingual({ en: 'Ask for the exact ordering code / macro revision, mission temperature and cycle history, supply margins, ECC and power-loss behavior. TA is ambient temperature; TJ is junction temperature. These cases do not establish area, cost, security, qualification or superiority of a memory family.', zh: '確認完整訂購代碼／巨集版本、任務溫度與循環歷史、供電裕量、ECC 及掉電行為。TA 為環境溫度，TJ 為接面溫度。這些案例不證明記憶體家族的面積、成本、安全、資格驗證或優勢。' })}</p>
        <a href="whitepaper/index.html">${bilingual({ en: 'Continue to the decision whitepaper', zh: '繼續閱讀決策白皮書' })}</a>
      </div>
      <div class="named-sources" id="named-comparison-sources">
        <h3>${bilingual({ en: 'Sources and Reuse', zh: '來源與引用' })}</h3>
        <ul>${sourceList}</ul>
        <p>${bilingual({ en: 'Reviewed', zh: '查核日期' })} <time datetime="${data.reviewedOn}">${data.reviewedOn}</time>. ${bilingual({ en: 'Factual summaries with source links; no source PDF, figure or table is republished. Source documents and marks remain with their owners; public access is not a redistribution license. Verify the cited revision and current errata before use.', zh: '本區僅整理事實並連結來源，未重製原始 PDF、圖片或表格。原文件與商標權利屬各權利人；公開可讀不等於授權散布。使用前請核對引用版本及最新勘誤。' })}</p>
        <a class="named-download" href="data/named-nvm-comparison.json" download>${bilingual({ en: 'Download this comparison with conditions and sources (JSON)', zh: '下載含條件與來源的本區對照資料（JSON）' })}</a>
      </div>
    </section>
${markerEnd}`;
}

export function buildNamedComparison({ check = false, projectRoot = root } = {}) {
  const data = JSON.parse(fs.readFileSync(path.join(projectRoot, 'data/named-nvm-comparison.json'), 'utf8'));
  const file = path.join(projectRoot, 'technology-comparison.html');
  const current = fs.readFileSync(file, 'utf8');
  assert.equal(current.split(markerStart).length, 2, 'exactly one start marker');
  assert.equal(current.split(markerEnd).length, 2, 'exactly one end marker');
  const start = current.indexOf(markerStart), end = current.indexOf(markerEnd) + markerEnd.length;
  assert.ok(end > start, 'ordered markers');
  const rendered = renderNamedComparison(data).replaceAll('\n', current.includes('\r\n') ? '\r\n' : '\n');
  const expected = current.slice(0, start) + rendered + current.slice(end);
  if (check && current !== expected) throw new Error('Named comparison is stale; run node scripts/build-named-comparison.mjs');
  if (!check && current !== expected) fs.writeFileSync(file, expected);
  return { cases: data.cases.length, metrics: Object.keys(metricLabels).length, checked: check };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(buildNamedComparison({ check: process.argv.includes('--check') }))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
