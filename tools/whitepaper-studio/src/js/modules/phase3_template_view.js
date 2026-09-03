import { phase3Templates } from '../../data/phase3_templates.js';

export function renderPhase3Templates(container) {
  if (!container) return;
  container.innerHTML = `
    <header class="panel-heading template-heading">
      <div><p class="eyebrow dark">05 · CONTENT TEMPLATES</p><h2>Make evidence discipline<br><em>repeatable by design</em></h2></div>
      <p>Each template begins with the decision or claim and ends with its evidence boundary. Copy an outline, then adapt it to the target audience.</p>
    </header>
    <div class="template-grid">
      ${phase3Templates.map((template, index) => {
        const outline = `${template.title}\n\n${template.sections.map((section) => `${section.heading}\n${section.body}`).join('\n\n')}`;
        return `
          <article class="template-card">
            <header><span>${String(index + 1).padStart(2, '0')}</span><p>${template.type}</p></header>
            <h3>${template.title}</h3>
            <p class="template-audience">${template.targetAudience}</p>
            <p class="template-summary">${template.summary}</p>
            <ol>${template.sections.map((section, sectionIndex) => `<li><span>${String(sectionIndex + 1).padStart(2, '0')}</span><div><b>${section.heading}</b><p>${section.body}</p></div></li>`).join('')}</ol>
            <button class="copy-button" type="button" data-copy-outline="${escapeAttribute(outline)}">Copy template outline <span aria-hidden="true">↗</span></button>
          </article>
        `;
      }).join('')}
    </div>
    <aside class="template-rule"><p>TEMPLATE RULE</p><h3>Do not start with a product name</h3><span>Start with the system state, evidence status and decision owner. Product mapping comes after the contract is understood.</span></aside>
  `;
}

function escapeAttribute(value) {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', '&#10;');
}
