import { phase1KnowledgeBase } from '../../data/phase1_kb.js';

export function renderPhase1KB(container) {
  if (!container) return;
  const { stateContracts, technologyFamilies, processLenses, selectionSequence } = phase1KnowledgeBase;

  container.innerHTML = `
    <header class="panel-heading">
      <div><p class="eyebrow dark">01 · NVM OVERVIEW</p><h2>NVM is a system state decision,<br><em>not a product-name decision</em></h2></div>
      <p>Start with the state the system must preserve. Then constrain technology by ownership, update cadence, process options and evidence.</p>
    </header>

    <section class="content-section" aria-labelledby="contracts-title">
      <div class="section-label"><span>01</span><div><p>STATE CONTRACTS</p><h3 id="contracts-title">Four persistent-state promises</h3></div></div>
      <div class="contract-grid">
        ${stateContracts.map((item) => `
          <article class="contract-card">
            <div class="contract-index"><span>${item.number}</span><i aria-hidden="true"></i></div>
            <p class="micro-label">${item.updateCadence}</p>
            <h4>${item.contract}</h4>
            <strong>${item.role}</strong>
            <dl><div><dt>OWNER</dt><dd>${item.owner}</dd></div><div><dt>DECISION QUESTION</dt><dd>${item.selectionQuestion}</dd></div></dl>
            <p class="evidence-note"><b>LIMIT</b>${item.evidenceBoundary}</p>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="content-section technology-section" aria-labelledby="technology-title">
      <div class="section-label"><span>02</span><div><p>TECHNOLOGY FAMILIES</p><h3 id="technology-title">Compare by fit and boundary</h3></div></div>
      <div class="technology-list">
        ${technologyFamilies.map((item, index) => `
          <article>
            <span class="technology-number">0${index + 1}</span>
            <div class="technology-name"><p>${item.status}</p><h4>${item.family}</h4><span>${item.mechanism}</span></div>
            <div><small>STRONGEST FIT</small><p>${item.strongestFit}</p></div>
            <div><small>PROCESS LENS</small><p>${item.processLens}</p></div>
            <div class="technology-limit"><small>BOUNDARY</small><p>${item.limit}</p></div>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="content-section" aria-labelledby="node-title">
      <div class="section-label"><span>03</span><div><p>PROCESS-NODE LENS</p><h3 id="node-title">What changes as the process changes</h3></div></div>
      <div class="node-lens-grid">
        ${processLenses.map((item) => `
          <article><p>${item.range}</p><h4>${item.title}</h4><span>${item.body}</span><strong>${item.decision}</strong></article>
        `).join('')}
      </div>
      <aside class="calibration-boundary">
        <p>PUBLIC / INTERNAL BOUNDARY</p>
        <div><h4>Publish the architecture principle</h4><span>Floating-gate feasibility is tied to oxide and high-voltage options; advanced-node read and program supplies can have different contracts.</span></div>
        <div><h4>Retain portfolio detail internally</h4><span>Vendor-specific voltage coverage, mask counts, foundry availability and qualification data belong in the restricted SharePoint evidence layer.</span></div>
      </aside>
    </section>

    <section class="content-section sequence-section" aria-labelledby="sequence-title">
      <div class="section-label"><span>04</span><div><p>DECISION SEQUENCE</p><h3 id="sequence-title">A repeatable way to select NVM</h3></div></div>
      <ol class="selection-sequence">
        ${selectionSequence.map((item) => `<li><span>${item.step}</span><div><b>${item.name}</b><p>${item.detail}</p></div></li>`).join('')}
      </ol>
      <a class="inline-cta" href="?view=selector">Apply the sequence in the Decision Matrix <span aria-hidden="true">↗</span></a>
    </section>
  `;
}
