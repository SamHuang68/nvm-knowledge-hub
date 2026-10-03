import { MODEL_VERSION, estimate, ceil, integer } from './sram-repair-model.js';
import { SCHEMA_VERSION, SLOT_IDS } from './sram-scenarios.js';

// Shared by the on-screen preview, standalone download and print layout.
export const REPORT_CSS = `
.scenario-report{font-family:Arial,"Microsoft JhengHei",sans-serif;color:#092235;background:#fff;font-size:12px;line-height:1.4;max-width:100%;overflow-wrap:anywhere}
.scenario-report h2{font-size:23px;margin:0 0 6px}.scenario-report h3{font-size:13px;margin:10px 0 4px}.scenario-report p{margin:5px 0}.scenario-report .report-meta{font-size:10px;color:#465a69}.scenario-report table{width:100%;min-width:590px;border-collapse:collapse;table-layout:fixed;text-align:left;margin:12px 0}.scenario-report caption{text-align:left;font-size:11px;margin:0 0 5px}.scenario-report th,.scenario-report td{font-family:inherit;font-size:11px;border:1px solid #c8d6dd;padding:5px 7px;vertical-align:top;overflow-wrap:anywhere;font-weight:400;text-align:right;color:inherit}.scenario-report th:first-child{width:28%;text-align:left}.scenario-report thead th{background:#edf5f7;font-weight:700;text-align:center}.scenario-report tbody th{text-align:left}.scenario-report .report-section th{background:#edf5f7;font-weight:700;text-align:left}.scenario-report .report-total th,.scenario-report .report-total td{font-weight:700;background:#edf5f7}.scenario-report .report-scroll{overflow-x:auto}.scenario-report .report-columns{display:grid;grid-template-columns:1fr 1fr;gap:16px}.scenario-report ul{padding-left:17px;margin:4px 0}.scenario-report li{margin:3px 0}.scenario-report a{color:#056a7b;text-decoration:underline}.scenario-report .report-provenance{font-size:10px;border-top:1px solid #c8d6dd;margin-top:8px;padding-top:6px}.scenario-report .report-provenance p{margin:3px 0}
@media(max-width:620px){.scenario-report .report-columns{grid-template-columns:1fr;gap:0}.scenario-report h2{font-size:20px}}
@page{size:A4 portrait;margin:12mm}
@media print{.scenario-report{font-size:8.5pt;line-height:1.25;width:186mm;max-width:100%;margin:0}.scenario-report h2{font-size:15pt;margin:0 0 3mm}.scenario-report h3{font-size:9pt;margin:2mm 0 1mm}.scenario-report table{min-width:0;margin:2mm 0}.scenario-report th,.scenario-report td{font-size:8pt;padding:1mm 1.5mm!important}.scenario-report caption{font-size:8pt}.scenario-report .report-meta,.scenario-report .report-provenance{font-size:7pt}.scenario-report .report-columns{display:grid;grid-template-columns:1fr 1fr;gap:5mm}.scenario-report .report-scroll{overflow:visible}.scenario-report ul{padding-left:4mm}.scenario-report li{margin:1mm 0}.scenario-report p{margin:1mm 0}.scenario-report .report-provenance p{margin:.5mm 0}.scenario-report a[href]:after{content:none!important}.scenario-report table,.scenario-report .report-columns,.scenario-report .report-provenance{break-inside:avoid}}
`;

export function buildScenarioReport(scenarios, { document: doc, language = 'en', generatedAt = new Date().toISOString() }) {
  const L = (zh, en) => language === 'zh' ? zh : en;
  const make = (tag, text, className) => {
    const node = doc.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  const report = make('article', undefined, 'scenario-report');
  report.append(make('h2', L('SRAM 修復容量 · 決策摘要', 'SRAM repair capacity · decision summary')));
  report.append(make('p', L('A、B 是兩組規劃情境；每組均計算 OTP 與 eFuse。所有結果由輸入重新計算。', 'A and B are planning scenarios; each includes OTP and eFuse. All results are recalculated from inputs.')));
  report.append(make('p', `${L('產生時間', 'Generated')} ${generatedAt} · ${L('模型', 'Model')} ${MODEL_VERSION} · ${L('檔案結構', 'Schema')} ${SCHEMA_VERSION}`, 'report-meta'));
  const results = Object.fromEntries(SLOT_IDS.map(id => [id, scenarios[id] ? estimate(scenarios[id].inputs) : null]));
  const table = make('table');
  table.append(make('caption', L('完整輸入與計算結果；— 表示該情境尚未保存。', 'Complete inputs and calculated results; — means the scenario has not been saved.')));
  const head = make('thead'), h1 = make('tr'), h2 = make('tr');
  const label = make('th', L('參數／結果', 'Parameter / result')); label.scope = 'col'; label.rowSpan = 2; h1.append(label);
  for (const id of SLOT_IDS) { const cell = make('th', L(`情境 ${id}`, `Scenario ${id}`)); cell.colSpan = 2; cell.scope = 'colgroup'; h1.append(cell); }
  for (const id of SLOT_IDS) for (const tech of ['OTP', 'eFuse']) { const cell = make('th', tech); cell.scope = 'col'; h2.append(cell); }
  head.append(h1, h2); table.append(head);
  const body = make('tbody'); table.append(body);
  const section = text => { const row = make('tr', undefined, 'report-section'), cell = make('th', text); cell.colSpan = 5; cell.scope = 'rowgroup'; row.append(cell); body.append(row); };
  const row = (title, read, shared = false, total = false) => {
    const tr = make('tr', undefined, total ? 'report-total' : undefined), th = make('th', title); th.scope = 'row'; tr.append(th);
    for (const id of SLOT_IDS) {
      for (const tech of shared ? [null] : ['otp', 'efuse']) {
        const td = make('td', scenarios[id] ? read(scenarios[id].inputs, results[id], tech) : '—');
        if (shared) td.colSpan = 2;
        tr.append(td);
      }
    }
    body.append(tr);
  };
  section(L('輸入假設', 'Input assumptions'));
  row(L('SRAM 容量', 'SRAM capacity'), s => `${s.capacity} ${s.unit}`, true);
  row(L('原始修復資料比例', 'Raw repair-data fraction'), s => s.repair, true);
  row(L('壓縮定義與輸入', 'Compression definition / input'), s => `${s.compression} ${s.mode === 'ratio' ? ':1' : '%'} · ${({ ratio: L('原始／壓縮後', 'raw / compressed'), retained: L('保留比例', 'retained'), reduction: L('減少比例', 'reduction') })[s.mode]}`, true);
  for (const [key, title] of [['overhead', L('額外開銷 %', 'Overhead %')], ['reserve', L('預留空間 %', 'Reserve %')], ['block', L('配置粒度 bits', 'Block size (bits)')]]) row(title, (s, r, tech) => s[tech][key]);
  section(L('結果（bits；位元組列除外）', 'Results (bits, except the byte row)'));
  for (const [key, title] of [['capacity', L('SRAM 位元數', 'SRAM bits')], ['raw', L('壓縮前修復資料', 'Raw repair data')], ['payload', L('壓縮後有效資料', 'Compressed payload')], ['saved', L('有效資料容量減少', 'Payload capacity saved')]]) row(title, (s, r) => integer(r[key]), true);
  for (const [key, title] of [['overhead', L('開銷', 'Overhead')], ['reserve', L('預留', 'Reserve')], ['required', L('對齊前需求', 'Required before alignment')], ['padding', L('對齊補足', 'Alignment padding')], ['allocated', L('配置容量', 'Allocated capacity')]]) row(title, (s, r, tech) => integer(r[tech][key]), false, key === 'allocated');
  row(L('完整位元組 B', 'Whole bytes (B)'), (s, r, tech) => integer(ceil(r[tech].allocated, 8n)));
  row(L('配置區塊數', 'Allocated block count'), (s, r, tech) => integer(r[tech].blocks));
  const scroll = make('div', undefined, 'report-scroll'); scroll.tabIndex = 0; scroll.setAttribute('role', 'region'); scroll.setAttribute('aria-label', L('可橫向捲動的情境對照表', 'Scrollable scenario comparison table')); scroll.append(table); report.append(scroll);
  const columns = make('div', undefined, 'report-columns');
  const method = make('section'); method.append(make('h3', L('假設、單位與取整', 'Assumptions, units and rounding')));
  const assumptions = [
    L('SRAM bits＝⌈容量×單位位元數⌉；原始資料＝⌈SRAM bits×修復比例⌉；有效資料＝⌈原始資料×保留比例⌉。倍率 c 的保留比例為 1/c；減少 p% 則為 (100−p)/100。', 'SRAM bits = ceil(capacity × unit bits); raw = ceil(SRAM bits × repair fraction); payload = ceil(raw × retained fraction). A c:1 ratio retains 1/c; p% reduction retains (100−p)/100.'),
    L('開銷＝⌈有效資料×開銷%⌉；預留＝⌈(有效資料＋開銷)×預留%⌉；配置＝⌈(有效資料＋開銷＋預留)／粒度⌉×粒度。各階段向上取整至 bits；B＝⌈bits／8⌉。', 'Overhead = ceil(payload × overhead %); reserve = ceil((payload + overhead) × reserve %); allocated = ceil((payload + overhead + reserve) / block) × block. Round upward at each stage; B = ceil(bits / 8).'),
    L('Mb／Gb／Tb＝10⁶／10⁹／10¹² bits；Mib／Gib／Tib＝2²⁰／2³⁰／2⁴⁰ bits。開銷可概估 ECC、索引及控制資料；實作須確認實際編碼。', 'Mb / Gb / Tb = 10⁶ / 10⁹ / 10¹² bits; Mib / Gib / Tib = 2²⁰ / 2³⁰ / 2⁴⁰ bits. Overhead may approximate ECC, indexes and control data; confirm actual encoding.'),
    L('全部輸入均為規劃假設，非供應商規格；不推論面積、功耗、成本、良率、可靠度、修復成功率或技術優劣。預設範例不是已驗證的面積交叉點。', 'All inputs are planning assumptions, not vendor specifications. No area, power, cost, yield, reliability, repair success or technology-superiority inference. Defaults are not a validated area crossover.'),
  ];
  const ul = make('ul'); for (const text of assumptions) ul.append(make('li', text)); method.append(ul); columns.append(method);
  const questions = make('section'); questions.append(make('h3', L('仍待供應商／設計團隊回答', 'Questions for the vendor / design team')));
  const qu = make('ul');
  for (const text of [
    L('修復資料比例、壓縮率的演算法、缺陷分布與測試樣本是什麼？最壞情況如何設定？', 'Which repair algorithm, defect distribution and test samples support the repair fraction and compression? What is the worst case?'),
    L('具名 IP、製程／版本及 PVT 範圍是否已確認？讀取、燒錄、保持與耐久條件有哪些依據？', 'Which named IP, process / revision and PVT range apply? What supports read, programming, retention and endurance conditions?'),
    L('ECC、索引、控制資料、備援與安全開銷是否完整？實際最小巨集容量與配置粒度是多少？', 'Are ECC, index, control, redundancy and security overheads complete? What are the actual minimum macro capacity and allocation granularity?'),
    L('修復流程、開機載入、更新次數與失效處理如何驗證？面積、功耗、成本與可靠度須另取資料。', 'How are repair, boot loading, update count and failure handling validated? Obtain separate area, power, cost and reliability evidence.'),
  ]) qu.append(make('li', text));
  questions.append(qu); columns.append(questions); report.append(columns);
  const provenance = make('section', undefined, 'report-provenance');
  provenance.append(make('h3', L('可追溯來源與下一步', 'Traceable sources and next steps')));
  for (const id of SLOT_IDS) {
    const snapshot = scenarios[id]; if (!snapshot) continue;
    const p = make('p', `${L(`情境 ${id} 保存`, `Scenario ${id} saved`)} ${snapshot.savedAt} · `);
    if (snapshot.source) {
      p.append(doc.createTextNode(`${snapshot.source.releaseId} · `));
      const a = make('a', snapshot.source.canonicalCommit); a.href = `https://github.com/SamHuang68/nvm-knowledge-hub/commit/${snapshot.source.canonicalCommit}`; p.append(a);
    } else p.append(doc.createTextNode(L('來源版本未知（未能讀取來源紀錄）', 'Source version unknown (lineage was unavailable)')));
    provenance.append(p);
  }
  provenance.append(make('p', L('來源欄為保存時讀取或匯入的內容提交識別，不等同已部署 SHA，也不驗證匯入檔的真實性。請連同情境 JSON 保存；HTML 摘要不作匯入用途。', 'Source fields identify a saved or imported content commit, not a deployed SHA or proof of file authenticity. Keep the scenario JSON with this report; HTML is not an import format.')));
  const links = make('p');
  for (const [href, label] of [
    ['sram-repair.html#method', L('計算方法', 'Calculation method')],
    ['technology-comparison.html#sec-matrix', L('技術條件比較', 'Technology conditions')],
    ['memory-evidence.html#ledger', L('可引用來源總帳', 'Evidence ledger')],
  ]) {
    if (links.childNodes.length) links.append(doc.createTextNode(' · '));
    const url = new URL(href, 'https://hub.samhuang68.org/'); url.searchParams.set('lang', language);
    const a = make('a', label); a.href = url.href; links.append(a);
  }
  provenance.append(links); report.append(provenance);
  return report;
}

export function standaloneReport(report, language, doc) {
  const html = doc.implementation.createHTMLDocument(language === 'zh' ? 'SRAM 修復容量 · 決策摘要' : 'SRAM repair capacity · decision summary');
  html.documentElement.lang = language === 'zh' ? 'zh-Hant' : 'en';
  const meta = html.createElement('meta'); meta.setAttribute('charset', 'utf-8'); html.head.prepend(meta);
  const viewport = html.createElement('meta'); viewport.name = 'viewport'; viewport.content = 'width=device-width, initial-scale=1'; html.head.append(viewport);
  const style = html.createElement('style'); style.textContent = REPORT_CSS + 'body{margin:20px} @media print{body{margin:0}}'; html.head.append(style);
  html.body.append(html.importNode(report, true));
  return '<!doctype html>\n' + html.documentElement.outerHTML;
}
