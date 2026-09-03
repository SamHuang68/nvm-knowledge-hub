import { nvmIpSpecs } from '../../data/nvm_specs.js';

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

    <section class="selector-controls" aria-label="Decision matrix filters">
      <label for="filter-family">
        <span>FILTER BY TECHNOLOGY FAMILY</span>
        <select id="filter-family">
          <option value="ALL">All public profiles (${nvmIpSpecs.length})</option>
          ${[...new Set(nvmIpSpecs.map((item) => item.family))].map((family) => `<option value="${family}">${family}</option>`).join('')}
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

  // Bind Filter
  const filterSelect = container.querySelector('#filter-family');
  const tbody = container.querySelector('#decision-body');

  filterSelect?.addEventListener('change', (event) => {
    const value = event.target.value;
    const items = value === 'ALL' ? nvmIpSpecs : nvmIpSpecs.filter((item) => item.family === value);
    tbody.innerHTML = renderRows(items);
  });

  // Bind CSV Export
  container.querySelector('#btn-export-csv')?.addEventListener('click', () => {
    exportCSV(nvmIpSpecs);
  });

  // Bind JSON Export
  container.querySelector('#btn-export-json')?.addEventListener('click', () => {
    exportJSON(nvmIpSpecs);
  });
}

function renderRows(items) {
  return items.map((item) => `
    <tr>
      <th scope="row" data-label="STATE PROFILE">
        <strong>${item.profile}</strong>
        <small>${item.updateModel || ''}</small>
      </th>
      <td data-label="TECHNOLOGY FAMILY"><span class="family-chip">${item.family}</span></td>
      <td data-label="STATE CONTRACT">${item.contract}</td>
      <td data-label="BUS EXPOSURE">
        <span class="security-chip ${getSecurityClass(item.busExposure)}">${item.busExposure || 'On-chip'}</span>
      </td>
      <td data-label="LATENCY & BOM">
        <small><strong>Latency:</strong> ${item.latency || 'N/A'}</small><br>
        <small><strong>BOM:</strong> ${item.bomCost || 'N/A'}</small>
      </td>
      <td data-label="STRONGEST FIT">${item.strongestFit}</td>
      <td data-label="EVIDENCE STATUS"><span class="status-chip">${item.evidenceStatus}</span></td>
    </tr>
  `).join('');
}

function getSecurityClass(text) {
  if (!text) return '';
  if (text.includes('None') || text.includes('Monolithic') || text.includes('Die-internal')) return 'sec-high';
  if (text.includes('High') || text.includes('External')) return 'sec-low';
  return 'sec-med';
}

function exportCSV(items) {
  const headers = ['Profile', 'Family', 'Contract', 'NodeLens', 'UpdateModel', 'BusExposure', 'Latency', 'BOMCost', 'StrongestFit', 'EvidenceStatus'];
  const rows = items.map(i => [
    `"${i.profile.replace(/"/g, '""')}"`,
    `"${i.family.replace(/"/g, '""')}"`,
    `"${i.contract.replace(/"/g, '""')}"`,
    `"${(i.nodeLens || '').replace(/"/g, '""')}"`,
    `"${(i.updateModel || '').replace(/"/g, '""')}"`,
    `"${(i.busExposure || '').replace(/"/g, '""')}"`,
    `"${(i.latency || '').replace(/"/g, '""')}"`,
    `"${(i.bomCost || '').replace(/"/g, '""')}"`,
    `"${i.strongestFit.replace(/"/g, '""')}"`,
    `"${i.evidenceStatus.replace(/"/g, '""')}"`
  ]);
  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "nvm_decision_matrix_profiles.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function exportJSON(items) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", dataStr);
  link.setAttribute("download", "nvm_decision_matrix_profiles.json");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
