import { phase4Metadata } from '../../data/phase4_metadata.js';

export function renderPhase4Metadata(container) {
  if (!container) return;
  const { canonicalFields, operationalFields, publicRecords } = phase4Metadata;

  container.innerHTML = `
    <header class="panel-heading taxonomy-heading">
      <div><p class="eyebrow dark">04 · SHAREPOINT TAXONOMY</p><h2>Transfer a governed knowledge model,<br><em>not a folder of pages</em></h2></div>
      <p>The same eight fields organize public research now and restricted corporate evidence later. Operational fields add ownership without changing the content spine.</p>
    </header>
    <section class="content-section" aria-labelledby="canonical-title">
      <div class="section-label"><span>01</span><div><p>CANONICAL CONTENT CONTRACT</p><h3 id="canonical-title">Eight fields every NVM asset keeps</h3></div></div>
      <ol class="schema-flow">
        ${canonicalFields.map((item, index) => `<li><span>${String(index + 1).padStart(2, '0')}</span><div><h4>${item.field}</h4><p>${item.purpose}</p><small>EXAMPLE · ${item.example}</small></div></li>`).join('')}
      </ol>
    </section>
    <section class="content-section operational-section" aria-labelledby="operations-title">
      <div class="section-label"><span>02</span><div><p>OPERATIONAL LAYER</p><h3 id="operations-title">Fields that make the system maintainable</h3></div></div>
      <div class="operational-fields">${operationalFields.map((field, index) => `<span><b>${String(index + 1).padStart(2, '0')}</b>${field}</span>`).join('')}</div>
    </section>
    <section class="content-section" aria-labelledby="records-title">
      <div class="section-label"><span>03</span><div><p>PUBLIC RECORD PREVIEW</p><h3 id="records-title">Safe examples for the future SharePoint library</h3></div></div>
      <div class="record-grid">
        ${publicRecords.map((item) => `
          <article>
            <header><span>${item.id}</span><b>${item.status}</b></header>
            <h4>${item.title}</h4>
            <dl><div><dt>TECHNOLOGY</dt><dd>${item.technology}</dd></div><div><dt>STATE CONTRACT</dt><dd>${item.contract}</dd></div><div><dt>APPLICATION</dt><dd>${item.domain}</dd></div><div><dt>PROCESS NODE</dt><dd>${item.node}</dd></div><div><dt>EVIDENCE CLASS</dt><dd>${item.evidence}</dd></div></dl>
            <p><b>LIMITATION</b>${item.limitation}</p>
          </article>
        `).join('')}
      </div>
    </section>
    <aside class="sharepoint-transfer">
      <div><p>TRANSFER MODEL</p><h3>Public architecture now<br>Restricted evidence later</h3></div>
      <p>The company SharePoint edition can extend each record with foundry qualification, customer context, validation artifacts and confidential product data. Copilot then retrieves content through stable metadata and permissions.</p>
    </aside>
  `;
}
