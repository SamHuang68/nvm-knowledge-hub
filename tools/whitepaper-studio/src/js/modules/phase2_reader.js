import { phase2Whitepaper } from '../../data/phase2_paper.js';

export function renderPhase2Reader(container) {
  if (!container) return;
  const { title, subtitle, author, version, publishDate, chapters } = phase2Whitepaper;

  container.innerHTML = `
    <header class="paper-heading">
      <p class="eyebrow dark">02 · TECHNICAL WHITEPAPER</p>
      <h2>${title}</h2>
      <p>${subtitle}</p>
      <dl><div><dt>EDITORIAL OWNER</dt><dd>${author}</dd></div><div><dt>STATUS</dt><dd>${version}</dd></div><div><dt>REVIEW DATE</dt><dd>${publishDate}</dd></div></dl>
    </header>
    <div class="reader-layout">
      <aside class="reader-index">
        <p>CHAPTER INDEX</p>
        <nav aria-label="Whitepaper chapters">
          ${chapters.map((chapter) => `<a href="#chap-${chapter.id}"><b>${chapter.number}</b><span>${chapter.title}</span></a>`).join('')}
        </nav>
        <div class="reader-boundary"><b>PUBLIC EVIDENCE RULE</b><span>Exact specifications require a source, scope and limitation. Otherwise this paper uses architecture-level language.</span></div>
      </aside>
      <div class="paper-body">
        ${chapters.map((chapter) => `
          <article id="chap-${chapter.id}" class="paper-chapter">
            <header><p>CHAPTER ${chapter.number}</p><h3>${chapter.title}</h3><strong>${chapter.lede}</strong></header>
            <div class="chapter-copy">${chapter.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div>
            <div class="chapter-takeaways"><p>ARCHITECTURE TAKEAWAYS</p><ul>${chapter.takeaways.map((item) => `<li>${item}</li>`).join('')}</ul></div>
            <dl class="evidence-contract"><div><dt>EVIDENCE CLASS</dt><dd>${chapter.evidenceClass}</dd></div><div><dt>LIMITATION</dt><dd>${chapter.limitation}</dd></div></dl>
          </article>
        `).join('')}
        <aside class="paper-sources">
          <div><p>CONTINUE THE EVIDENCE TRAIL</p><h3>Use the Hub to separate source facts from architecture inference</h3></div>
          <nav><a href="https://samhuang68.github.io/nvm-knowledge-hub/memory-evidence.html">Open Evidence Ledger <span>↗</span></a><a href="https://samhuang68.github.io/nvm-knowledge-hub/memory-physics.html">Review Memory Physics <span>↗</span></a></nav>
        </aside>
      </div>
    </div>
  `;
}
