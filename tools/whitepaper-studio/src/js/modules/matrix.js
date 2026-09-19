import { nvmIpSpecs } from '../../data/nvm_specs.js';
import { localizeProfile } from '../../data/設定檔語系.js';

const getLanguage = () => globalThis.window?.HubLanguage?.get() || globalThis.document?.documentElement?.dataset.language || 'en';
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const bilingual = (en, zh) => `<span data-lang="en">${escapeHTML(en)}</span><span data-lang="zh">${escapeHTML(zh)}</span>`;

export function selectProfiles(family = 'ALL') {
  return family === 'ALL' ? nvmIpSpecs : nvmIpSpecs.filter((item) => item.family === family);
}

export function renderMatrix(container) {
  if (!container) return;
  container.innerHTML = `
    <header class="panel-heading selector-heading">
      <div>
        <p class="eyebrow dark">03 · DECISION MATRIX</p>
        <h2>Compare the state contract<br><em>before comparing a macro</em></h2>
      </div>
      <p>Interactive multi-way security & NVM architecture comparison (${nvmIpSpecs.length} canonical profiles). Filter by technology family, inspect latency and physical exposure, or export profiles for system engineering reviews.</p>
    </header>

    <p class="matrix-evidence-boundary"><span data-lang="zh">以下保留 12 筆工程原稿供審查。數值、製程、認證與量產字樣均屬待查證聲稱；只有明確標示的來源支援指定欄位，不能視為完整產品規格。</span><span data-lang="en">These 12 engineering drafts retain their original values for review. Numbers, nodes, certifications and production wording remain unverified claims; a linked source supports only its stated fields, not a complete product specification.</span></p>

    <section class="selector-controls" aria-label="Decision matrix filters">
      <label for="filter-family">
        <span>FILTER BY TECHNOLOGY FAMILY</span>
        <select id="filter-family">
          <option value="ALL">All public profiles (${nvmIpSpecs.length})</option>
          ${[...new Set(nvmIpSpecs.map((item) => item.family))].map((family) => `<option value="${escapeHTML(family)}">${escapeHTML(family)}</option>`).join('')}
        </select>
      </label>
      <div class="matrix-actions">
        <button id="btn-export-csv" class="button secondary small" type="button" title="Export current profiles as CSV">
          <span>📥</span> Export CSV
        </button>
        <button id="btn-export-json" class="button secondary small" type="button" title="Export current profiles as JSON">
          <span>📋</span> Export JSON
        </button>
      </div>
    </section>

    <div class="decision-table-wrap">
      <table class="decision-table">
        <caption>Illustrative NVM selection profiles with explicit evidence boundaries (${nvmIpSpecs.length} Profiles)</caption>
        <thead>
          <tr>
            <th scope="col">State Profile</th>
            <th scope="col">Technology Family</th>
            <th scope="col">State Contract & Power-Off Key</th>
            <th scope="col">Bus Exposure & Security</th>
            <th scope="col">Latency & BOM</th>
            <th scope="col">Strongest Fit</th>
            <th scope="col">Evidence Status</th>
          </tr>
        </thead>
        <tbody id="decision-body">${renderRows(nvmIpSpecs)}</tbody>
      </table>
    </div>

    <aside class="selector-gate">
      <div>
        <p>SELECTION GATE</p>
        <h3>A categorical fit is not a qualification result</h3>
      </div>
      <ol>
        <li><b>01</b><span>Confirm device stack, voltage options & power-off key residency</span></li>
        <li><b>02</b><span>Bind retention and endurance to mission profile (-40°C to 150°C)</span></li>
        <li><b>03</b><span>Close PVT, fault injection and physical tamper evidence on target silicon</span></li>
      </ol>
    </aside>
  `;

  // 畫面與匯出共用同一個篩選狀態。
  const filterSelect = container.querySelector('#filter-family');
  const tbody = container.querySelector('#decision-body');
  let selectedFamily = 'ALL';
  const syncFamilyLabels = () => {
    if (!filterSelect) return;
    const language = getLanguage();
    for (const option of filterSelect.options) {
      const profile = nvmIpSpecs.find(item => item.family === option.value);
      option.textContent = profile ? localizeProfile(profile, language).family : language === 'zh' ? `全部公開設定檔（${nvmIpSpecs.length}）` : `All public profiles (${nvmIpSpecs.length})`;
    }
  };
  // option 不允許巢狀 span；使用與表格、匯出相同的語系資料。
  syncFamilyLabels();
  globalThis.window?.addEventListener('hub:language-change', syncFamilyLabels);

  filterSelect?.addEventListener('change', (event) => {
    selectedFamily = event.target.value;
    const items = selectProfiles(selectedFamily);
    tbody.innerHTML = renderRows(items);
  });

  // Bind CSV Export
  container.querySelector('#btn-export-csv')?.addEventListener('click', () => {
    exportCSV(selectProfiles(selectedFamily));
  });

  // Bind JSON Export
  container.querySelector('#btn-export-json')?.addEventListener('click', () => {
    exportJSON(selectProfiles(selectedFamily));
  });
}

function renderRows(items) {
  return items.map((item) => {
    const zh = localizeProfile(item, 'zh');
    const field = key => bilingual(item[key], zh[key]);
    return `
    <tr data-profile-id="${item.id}">
      <th scope="row" data-label="STATE PROFILE">
        <strong>${field('profile')}</strong>
        <small>${field('updateModel')}</small>
      </th>
      <td data-label="TECHNOLOGY FAMILY"><span class="family-chip">${field('family')}</span></td>
      <td data-label="STATE CONTRACT">${field('contract')}</td>
      <td data-label="BUS EXPOSURE">
        <span class="security-chip ${getSecurityClass(item.busExposure)}">${field('busExposure')}</span>
      </td>
      <td data-label="LATENCY & BOM">
        <small><strong>Latency:</strong> ${field('latency')}</small><br>
        <small><strong>BOM:</strong> ${field('bomCost')}</small>
      </td>
      <td data-label="STRONGEST FIT">${field('strongestFit')}</td>
      <td data-label="EVIDENCE STATUS">
        <strong><span data-lang="zh">待查證的原稿聲稱</span><span data-lang="en">Draft claim — verification pending</span></strong>
        <span class="status-chip">${field('evidenceStatus')}</span>
        <p class="profile-boundary">${bilingual(item.evidenceReview.scope, zh.evidenceReview.scope)}</p>
        ${item.evidenceReview.sources.map((source, index) => `<p><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.product}<span data-lang="zh"> 官方來源</span><span data-lang="en"> official source</span></a><small>${bilingual(`${source.claim} ${source.limitation}`, `${zh.evidenceReview.sources[index].claim} ${zh.evidenceReview.sources[index].limitation}`)}</small></p>`).join('')}
      </td>
    </tr>
  `; }).join('');
}

function getSecurityClass(text) {
  if (!text) return '';
  if (text.includes('None') || text.includes('Monolithic') || text.includes('Die-internal')) return 'sec-high';
  if (text.includes('High') || text.includes('External')) return 'sec-low';
  return 'sec-med';
}

export function serializeCSV(items, language = 'en') {
  const headers = language === 'zh'
    ? ['識別碼', '設定檔', '技術家族', '狀態契約', '製程節點', '更新方式', '匯流排暴露度', '延遲', 'BOM成本', '最適應用', '技術限制', '原稿證據聲稱', '審查狀態', '證據範圍', '來源']
    : ['ID', 'Profile', 'Family', 'Contract', 'NodeLens', 'UpdateModel', 'BusExposure', 'Latency', 'BOMCost', 'StrongestFit', 'Boundary', 'EvidenceStatus', 'ReviewStatus', 'ReviewScope', 'Sources'];
  const fields = ['id', 'profile', 'family', 'contract', 'nodeLens', 'updateModel', 'busExposure', 'latency', 'bomCost', 'strongestFit', 'boundary', 'evidenceStatus'];
  const cell = (value) => {
    const text = String(value ?? '');
    // 試算表可能忽略前置空白或控制字元後執行公式；文字欄位明確加上單引號。
    const safe = /^[\s\u0000-\u001f]*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return '\uFEFF' + [headers.join(','), ...items.map(item => localizeProfile(item, language)).map(item => [...fields.map(field => item[field]), language === 'zh' && item.evidenceReview?.status === 'source-needed' ? '待補來源' : item.evidenceReview?.status, item.evidenceReview?.scope, JSON.stringify(item.evidenceReview?.sources || [])].map(cell).join(','))].join('\r\n');
}

// JSON 保留穩定欄位與狀態識別碼，僅翻譯供人閱讀的值。
export const serializeJSON = (items, language = 'en') => JSON.stringify(items.map(item => localizeProfile(item, language)), null, 2);

function download(content, mimeType, filename) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // 保留瀏覽器開始讀取下載的時間，之後釋放記憶體。
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCSV(items) {
  const language = getLanguage();
  download(serializeCSV(items, language), 'text/csv;charset=utf-8', language === 'zh' ? 'NVM_決策矩陣.csv' : 'NVM_Decision_Matrix.csv');
}

function exportJSON(items) {
  const language = getLanguage();
  download(serializeJSON(items, language), 'application/json;charset=utf-8', language === 'zh' ? 'NVM_決策矩陣.json' : 'NVM_Decision_Matrix.json');
}
