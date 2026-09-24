//#region src/data/phase1_kb.js
var e = {
	stateContracts: [
		{
			id: "identity",
			number: "01",
			contract: "Immutable identity",
			role: "Device identity, lifecycle state and boot trust anchors",
			owner: "Provisioning authority",
			updateCadence: "Program once; verify throughout life",
			selectionQuestion: "Can the state ever be rotated, revoked or recovered?",
			evidenceBoundary: "Threat model and provisioning flow must be explicit before selecting OTP."
		},
		{
			id: "calibration",
			number: "02",
			contract: "Bounded calibration",
			role: "Trim, remap, analog compensation and configuration",
			owner: "Manufacturing or hardware controller",
			updateCadence: "Rare, controlled updates",
			selectionQuestion: "How many updates are required after test, package and field aging?",
			evidenceBoundary: "Endurance, write energy and high-voltage availability are use-case specific."
		},
		{
			id: "firmware",
			number: "03",
			contract: "Adaptive firmware",
			role: "Boot code, patches, policy and feature configuration",
			owner: "Secure update service",
			updateCadence: "Managed change with rollback or recovery",
			selectionQuestion: "Does capacity and update frequency justify an embedded array?",
			evidenceBoundary: "Separate code-storage needs from immutable security state."
		},
		{
			id: "operations",
			number: "04",
			contract: "Operational evidence",
			role: "Repair history, RAS logs, counters and field learning",
			owner: "Platform controller",
			updateCadence: "Repeated writes over system life",
			selectionQuestion: "Which state must survive power loss, service events or module replacement?",
			evidenceBoundary: "System retention and recovery may be more important than bit-cell density."
		}
	],
	technologyFamilies: [
		{
			family: "OTP",
			mechanism: "One-time physical state transition",
			strongestFit: "Immutable and monotonic state",
			processLens: "Broad logic-node reach; implementation is provider specific",
			limit: "A written bit cannot become an update policy by itself",
			status: "Architecture baseline"
		},
		{
			family: "Embedded MTP IP",
			mechanism: "Reprogrammable on-chip state; may use EEPROM storage",
			strongestFit: "Bounded calibration and small firmware state",
			processLens: "EEPROM-based IP depends on high-voltage and oxide options",
			limit: "An embedded macro, distinct from external standalone EEPROM; endurance, programming supply and retention need joint qualification",
			status: "Public evidence needed per process"
		},
		{
			family: "Embedded Flash",
			mechanism: "Dedicated embedded charge-storage integration",
			strongestFit: "Code-rich embedded systems",
			processLens: "Commercial fit is shaped by mask cost and process-development complexity",
			limit: "Node migration is an economics and integration decision—not a simple shrink",
			status: "Node-specific decision"
		},
		{
			family: "MRAM / ReRAM",
			mechanism: "Magnetic or resistive state",
			strongestFit: "Advanced-node embedded NVM where available",
			processLens: "Foundry module, density and qualification status dominate",
			limit: "Availability does not automatically establish application readiness",
			status: "Evidence varies by platform"
		},
		{
			family: "SRAM PUF + crypto",
			mechanism: "Power-up-derived secret plus cryptographic protection",
			strongestFit: "Companion security layer above persistent ciphertext",
			processLens: "System architecture rather than a peer storage medium",
			limit: "Reliability, helper data and attack assurance still require validation",
			status: "Companion architecture"
		}
	],
	processLenses: [
		{
			range: "MATURE & SPECIALTY",
			title: "Start with the available voltage and device stack",
			body: "For power, BCD, sensor and interface products, I/O devices and programming-voltage generation often define the feasible NVM set before density does.",
			decision: "Validate I/O voltage, charge pump, test flow and retention together."
		},
		{
			range: "eFLASH TRANSITION",
			title: "Treat scaling as an integration-economics boundary",
			body: "Conventional embedded-flash commercialization is widely associated with the 28 nm generation. Crossing that boundary is not a hard physics cliff; mask count, development effort and manufacturing economics shape adoption.",
			decision: "Keep vendor-specific mask-stack detail in the internal evidence layer."
		},
		{
			range: "ADVANCED NODE",
			title: "Decouple read supply from program infrastructure",
			body: "A single-VDD read path can simplify always-on and low-voltage domains, while programming may still require an I/O-derived foundation for an internal charge pump.",
			decision: "Specify read and program power contracts separately."
		},
		{
			range: "LEADING EDGE & CHIPLET",
			title: "Move from one macro to a distributed state architecture",
			body: "Identity, repair, calibration, firmware and operational logs may reside in different dies or controllers. The selection unit becomes the system state contract, not a single NVM array.",
			decision: "Define ownership, trust boundary and recovery before technology."
		}
	],
	selectionSequence: [
		{
			step: "01",
			name: "Name the state",
			detail: "What survives power loss—and why?"
		},
		{
			step: "02",
			name: "Assign ownership",
			detail: "Who may create, update, revoke or recover it?"
		},
		{
			step: "03",
			name: "Constrain the process",
			detail: "Which node, voltage and integration options actually exist?"
		},
		{
			step: "04",
			name: "Close the evidence gap",
			detail: "What is sourced, inferred or still target-silicon dependent?"
		}
	]
};
//#endregion
//#region src/js/modules/phase1_kb_view.js
function t(t) {
	if (!t) return;
	let { stateContracts: n, technologyFamilies: r, processLenses: i, selectionSequence: a } = e;
	t.innerHTML = `
    <header class="panel-heading">
      <div><p class="eyebrow dark">01 · NVM OVERVIEW</p><h2>NVM is a system state decision,<br><em>not a product-name decision</em></h2></div>
      <p>Start with the state the system must preserve. Then constrain technology by ownership, update cadence, process options and evidence.</p>
    </header>

    <section class="content-section" aria-labelledby="contracts-title">
      <div class="section-label"><span>01</span><div><p>STATE CONTRACTS</p><h3 id="contracts-title">Four persistent-state promises</h3></div></div>
      <div class="contract-grid">
        ${n.map((e) => `
          <article class="contract-card">
            <div class="contract-index"><span>${e.number}</span><i aria-hidden="true"></i></div>
            <p class="micro-label">${e.updateCadence}</p>
            <h4>${e.contract}</h4>
            <strong>${e.role}</strong>
            <dl><div><dt>OWNER</dt><dd>${e.owner}</dd></div><div><dt>DECISION QUESTION</dt><dd>${e.selectionQuestion}</dd></div></dl>
            <p class="evidence-note"><b>LIMIT</b>${e.evidenceBoundary}</p>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="content-section technology-section" aria-labelledby="technology-title">
      <div class="section-label"><span>02</span><div><p>TECHNOLOGY FAMILIES</p><h3 id="technology-title">Compare by fit and boundary</h3></div></div>
      <div class="technology-list">
        ${r.map((e, t) => `
          <article>
            <span class="technology-number">0${t + 1}</span>
            <div class="technology-name"><p>${e.status}</p><h4>${e.family}</h4><span>${e.mechanism}</span></div>
            <div><small>STRONGEST FIT</small><p>${e.strongestFit}</p></div>
            <div><small>PROCESS LENS</small><p>${e.processLens}</p></div>
            <div class="technology-limit"><small>BOUNDARY</small><p>${e.limit}</p></div>
          </article>
        `).join("")}
      </div>
    </section>

    <section class="content-section" aria-labelledby="node-title">
      <div class="section-label"><span>03</span><div><p>PROCESS-NODE LENS</p><h3 id="node-title">What changes as the process changes</h3></div></div>
      <div class="node-lens-grid">
        ${i.map((e) => `
          <article><p>${e.range}</p><h4>${e.title}</h4><span>${e.body}</span><strong>${e.decision}</strong></article>
        `).join("")}
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
        ${a.map((e) => `<li><span>${e.step}</span><div><b>${e.name}</b><p>${e.detail}</p></div></li>`).join("")}
      </ol>
      <a class="inline-cta" href="?view=selector">Apply the sequence in the Decision Matrix <span aria-hidden="true">↗</span></a>
    </section>
  `;
}
//#endregion
//#region src/data/phase2_paper.js
var n = {
	title: "Selecting NVM by State Contract, Process Boundary and Evidence",
	subtitle: "A public architecture guide for turning persistent-state requirements into defensible technology decisions",
	author: "NVM Knowledge Hub Editorial System",
	version: "Public working draft",
	publishDate: "Reviewed 2026-08-25",
	chapters: [
		{
			id: "state-contract",
			number: "01",
			title: "Begin With the State Contract",
			lede: "The first decision is not OTP versus MTP. It is the promise the system must keep after power is removed.",
			paragraphs: ["Persistent state carries an owner, update cadence, retention obligation, recovery rule and threat boundary. Two bit arrays of similar size can therefore require very different architectures: an immutable lifecycle transition is not governed like a field-updatable calibration table.", "A useful state contract names who may create the state, when it may change, which failures must be recoverable and what evidence proves the contract across process, voltage, temperature and lifecycle conditions."],
			takeaways: [
				"Define state before technology",
				"Separate immutability from update policy",
				"Treat recovery as part of retention"
			],
			evidenceClass: "Architecture principle",
			limitation: "Implementation targets still require product- and process-specific validation."
		},
		{
			id: "technology-boundaries",
			number: "02",
			title: "Map Technology Families to the Contract",
			lede: "Each NVM family expresses a different compromise among permanence, updates, density, voltage and process integration.",
			paragraphs: ["OTP is naturally aligned with immutable or monotonic state. Embedded MTP IP provides repeatedly programmable storage inside the host chip and may use an EEPROM structure. External standalone EEPROM is a separate memory device; a shared storage principle does not make these the same integration option. Endurance, programming energy and supply requirements must be checked for the selected implementation. Embedded Flash addresses code-rich systems where its process integration is economically justified. MRAM and ReRAM extend the advanced-node portfolio, but availability and qualification remain platform specific.", "SRAM PUF is a companion security primitive rather than a peer non-volatile medium. It can derive a device-unique root secret at power-up so persistent memory stores ciphertext or helper data instead of a reusable root key. That architecture raises assurance requirements of its own; it does not erase them."],
			takeaways: [
				"Do not model PUF as stored NVM",
				"Qualify program and read paths separately",
				"Avoid technology labels without a state owner"
			],
			evidenceClass: "Supported architecture synthesis",
			limitation: "Technology availability, reliability and security claims vary by supplier and target process."
		},
		{
			id: "node-boundary",
			number: "03",
			title: "Treat Node Migration as an Integration Decision",
			lede: "NVM scaling is shaped by device options, mask economics, program voltage and qualification effort—not geometry alone.",
			paragraphs: [
				"Floating-gate MTP relies on an oxide and high-voltage environment capable of preserving programmed charge. A process portfolio that only exposes lower-voltage devices can therefore narrow implementation choices. Dedicated embedded-flash integration can introduce a purpose-built oxide, but additional process complexity changes the commercial equation.",
				"The frequently cited 28 nm boundary for conventional embedded Flash is best read as a clear public commercialization high point, not a law of physics. Beyond it, development difficulty, mask-stack expansion and cost can outweigh the benefit. At more advanced nodes, foundry roadmaps increasingly turn to MRAM or ReRAM, while logic-compatible OTP continues to serve small persistent-state needs.",
				"For advanced-node OTP, a single-VDD read mode can reduce always-on power-domain dependencies and simplify power sequencing. Programming can remain a separate event that uses an I/O supply as the foundation for an internal charge pump. Public architecture should state that separation without disclosing proprietary circuit detail."
			],
			takeaways: [
				"Node names are not portability proof",
				"Separate read simplification from program infrastructure",
				"Model mask and qualification cost as system constraints"
			],
			evidenceClass: "Industry synthesis + expert calibration",
			limitation: "Vendor-specific voltage coverage, mask counts and product roadmaps require internal portfolio evidence before customer use."
		},
		{
			id: "decision-evidence",
			number: "04",
			title: "Make the Decision Evidence-Aware",
			lede: "A decision matrix is useful only when it makes uncertainty visible instead of converting assumptions into specifications.",
			paragraphs: ["Public evidence can establish mechanisms, disclosed product availability and demonstrated use cases. Supplier claims may describe performance or qualification. Architecture inference can connect those facts to a system proposal. Target-silicon evidence is still required to close PVT, retention, endurance, power and attack-resilience claims for a specific implementation.", "Every comparison row should therefore carry a source class, scope, limitation, review status and next validation action. Unsupported precision should be removed; a categorical range with an explicit evidence gap is more trustworthy than an exact number without provenance."],
			takeaways: [
				"Never let UI polish promote an assumption to fact",
				"Bind every claim to scope and limitation",
				"Use open gaps to drive the next validation action"
			],
			evidenceClass: "Evidence governance method",
			limitation: "This public workbench intentionally excludes confidential qualification and customer data."
		},
		{
			id: "enterprise-transfer",
			number: "05",
			title: "Transfer the Knowledge, Not Just the Page",
			lede: "SharePoint migration succeeds when content has a stable contract before it enters the corporate system.",
			paragraphs: ["The canonical record begins with Technology Family, State Contract, Application Domain and Process Node. Evidence Class, Source, Limitation and Review Status make the record governable. Operational fields such as owner, visibility, review date and migration ID make it maintainable.", "The public site supplies a clean knowledge spine. The internal SharePoint version can add confidential product data, foundry qualification, customer context and validation artifacts without changing the information architecture. Copilot then operates over governed metadata rather than an unstructured document dump."],
			takeaways: [
				"Preserve the eight-field content contract",
				"Keep public and restricted evidence separate",
				"Make review status machine-readable"
			],
			evidenceClass: "Enterprise content architecture",
			limitation: "Final column types, permissions and retention policies must align with the company tenant."
		}
	]
};
//#endregion
//#region src/js/modules/phase2_reader.js
function r(e) {
	if (!e) return;
	let { title: t, subtitle: r, author: i, version: a, publishDate: o, chapters: s } = n;
	e.innerHTML = `
    <header class="paper-heading">
      <p class="eyebrow dark">02 · TECHNICAL WHITEPAPER</p>
      <h2>${t}</h2>
      <p>${r}</p>
      <dl><div><dt>EDITORIAL OWNER</dt><dd>${i}</dd></div><div><dt>STATUS</dt><dd>${a}</dd></div><div><dt>REVIEW DATE</dt><dd>${o}</dd></div></dl>
    </header>
    <div class="reader-layout">
      <aside class="reader-index">
        <p>CHAPTER INDEX</p>
        <nav aria-label="Whitepaper chapters" data-aria-en="Whitepaper chapters" data-aria-zh="白皮書章節">
          ${s.map((e) => `<a href="#chap-${e.id}"><b>${e.number}</b><span>${e.title}</span></a>`).join("")}
        </nav>
        <div class="reader-boundary"><b>PUBLIC EVIDENCE RULE</b><span>Exact specifications require a source, scope and limitation. Otherwise this paper uses architecture-level language.</span></div>
      </aside>
      <div class="paper-body">
        ${s.map((e) => `
          <article id="chap-${e.id}" class="paper-chapter">
            <header><p>CHAPTER ${e.number}</p><h3>${e.title}</h3><strong>${e.lede}</strong></header>
            <div class="chapter-copy">${e.paragraphs.map((e) => `<p>${e}</p>`).join("")}</div>
            <div class="chapter-takeaways"><p>ARCHITECTURE TAKEAWAYS</p><ul>${e.takeaways.map((e) => `<li>${e}</li>`).join("")}</ul></div>
            <dl class="evidence-contract"><div><dt>EVIDENCE CLASS</dt><dd>${e.evidenceClass}</dd></div><div><dt>LIMITATION</dt><dd>${e.limitation}</dd></div></dl>
          </article>
        `).join("")}
        <aside class="paper-sources">
          <div><p>CONTINUE THE EVIDENCE TRAIL</p><h3>Use the Hub to separate source facts from architecture inference</h3></div>
          <nav aria-label="Evidence trail navigation" data-aria-en="Evidence trail navigation" data-aria-zh="證據追蹤導覽"><a href="https://blog.samhuang68.org/memory-evidence.html">Open Evidence Ledger <span>↗</span></a><a href="https://blog.samhuang68.org/memory-physics.html">Review Memory Physics <span>↗</span></a></nav>
        </aside>
      </div>
    </div>
  `;
}
//#endregion
//#region src/data/phase3_templates.js
var i = [
	{
		id: "architecture-brief",
		type: "Architecture Brief",
		title: "NVM State-Contract Brief",
		targetAudience: "System architects · Product managers",
		summary: "Frame a persistent-state problem before proposing an IP or memory family.",
		sections: [
			{
				heading: "System state",
				body: "Name the state, owner, update cadence and power-off obligation."
			},
			{
				heading: "Architecture choice",
				body: "Compare candidate NVM families and companion controls."
			},
			{
				heading: "Evidence boundary",
				body: "Separate source-backed facts, inference and target-silicon gaps."
			},
			{
				heading: "Decision",
				body: "Record the preferred architecture, rejected alternatives and validation owner."
			}
		]
	},
	{
		id: "technology-note",
		type: "Technical Note",
		title: "Technology Boundary Review",
		targetAudience: "NVM engineers · Process integration teams",
		summary: "Explain a mechanism and its node, voltage, retention and integration constraints without overstating readiness.",
		sections: [
			{
				heading: "Mechanism",
				body: "Describe the stored physical variable and read observable."
			},
			{
				heading: "Process boundary",
				body: "Identify required devices, voltages, modules and test assumptions."
			},
			{
				heading: "Reliability contract",
				body: "Define required retention, endurance and environmental scope."
			},
			{
				heading: "Open evidence",
				body: "List missing supplier, PDK, silicon or qualification evidence."
			}
		]
	},
	{
		id: "selection-record",
		type: "Decision Record",
		title: "NVM Selection Decision Record",
		targetAudience: "Architecture review boards · Marketing teams",
		summary: "Capture why one technology was selected for one state contract at one process boundary.",
		sections: [
			{
				heading: "Decision context",
				body: "Application, state contract, node and business constraint."
			},
			{
				heading: "Options",
				body: "Candidate families with strengths, limits and evidence class."
			},
			{
				heading: "Decision rationale",
				body: "Trade-off logic and assumptions that materially affect the choice."
			},
			{
				heading: "Review trigger",
				body: "Event or new evidence that requires the decision to be revisited."
			}
		]
	},
	{
		id: "evidence-entry",
		type: "Evidence Entry",
		title: "Claim-to-Evidence Ledger Entry",
		targetAudience: "Editors · Validation owners · Copilot users",
		summary: "Turn a statement into a reviewable knowledge record ready for public or restricted SharePoint libraries.",
		sections: [
			{
				heading: "Claim",
				body: "Use the narrowest wording supported by the evidence."
			},
			{
				heading: "Source and class",
				body: "Record origin, date and whether evidence is direct, supported or inferred."
			},
			{
				heading: "Scope and limitation",
				body: "State what the source does not prove."
			},
			{
				heading: "Review status",
				body: "Assign owner, next action and review date."
			}
		]
	}
];
//#endregion
//#region src/js/modules/phase3_template_view.js
function a(e) {
	e && (e.innerHTML = `
    <header class="panel-heading template-heading">
      <div><p class="eyebrow dark">05 · CONTENT TEMPLATES</p><h2>Make evidence discipline<br><em>repeatable by design</em></h2></div>
      <p>Each template begins with the decision or claim and ends with its evidence boundary. Copy an outline, then adapt it to the target audience.</p>
    </header>
    <div class="template-grid">
      ${i.map((e, t) => {
		let n = `${e.title}\n\n${e.sections.map((e) => `${e.heading}\n${e.body}`).join("\n\n")}`;
		return `
          <article class="template-card">
            <header><span>${String(t + 1).padStart(2, "0")}</span><p>${e.type}</p></header>
            <h3>${e.title}</h3>
            <p class="template-audience">${e.targetAudience}</p>
            <p class="template-summary">${e.summary}</p>
            <ol>${e.sections.map((e, t) => `<li><span>${String(t + 1).padStart(2, "0")}</span><div><b>${e.heading}</b><p>${e.body}</p></div></li>`).join("")}</ol>
            <button class="copy-button" type="button" data-copy-outline="${o(n)}">Copy template outline <span aria-hidden="true">↗</span></button>
          </article>
        `;
	}).join("")}
    </div>
    <aside class="template-rule"><p>TEMPLATE RULE</p><h3>Do not start with a product name</h3><span>Start with the system state, evidence status and decision owner. Product mapping comes after the contract is understood.</span></aside>
  `);
}
function o(e) {
	return e.replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "&#10;");
}
//#endregion
//#region src/data/phase4_metadata.js
var s = {
	canonicalFields: [
		{
			field: "Technology Family",
			purpose: "OTP, MTP, eFlash, MRAM, ReRAM or companion primitive",
			example: "OTP"
		},
		{
			field: "State Contract",
			purpose: "Persistence promise and update semantics",
			example: "Immutable identity"
		},
		{
			field: "Application Domain",
			purpose: "System context that gives the state meaning",
			example: "Secure boot"
		},
		{
			field: "Process Node",
			purpose: "Node or platform boundary without implying qualification",
			example: "Advanced-node logic"
		},
		{
			field: "Evidence Class",
			purpose: "Direct, supported, inferred or open gap",
			example: "Architecture inference"
		},
		{
			field: "Source",
			purpose: "Public URL, document ID or restricted-library reference",
			example: "Public evidence ledger"
		},
		{
			field: "Limitation",
			purpose: "What the evidence does not establish",
			example: "Target-silicon PVT pending"
		},
		{
			field: "Review Status",
			purpose: "Draft, reviewed, approved or evidence required",
			example: "Evidence required"
		}
	],
	operationalFields: [
		"Asset Type",
		"Audience",
		"Content Owner",
		"Visibility",
		"Last Reviewed",
		"Migration ID"
	],
	publicRecords: [
		{
			id: "PUB-NVM-001",
			title: "Immutable Device Identity Architecture",
			technology: "OTP + companion key derivation",
			contract: "Immutable identity",
			domain: "Secure boot",
			node: "Node-specific implementation",
			evidence: "Architecture inference",
			status: "Public review complete",
			limitation: "Target-silicon security assurance remains implementation specific"
		},
		{
			id: "PUB-NVM-002",
			title: "Bounded Calibration Selection Note",
			technology: "OTP or MTP",
			contract: "Bounded calibration",
			domain: "Power and mixed signal",
			node: "Specialty or mature logic",
			evidence: "Supported synthesis",
			status: "Evidence required",
			limitation: "Programming voltage and endurance need platform confirmation"
		},
		{
			id: "PUB-NVM-003",
			title: "AI Package Persistent-State Map",
			technology: "Portfolio decision",
			contract: "Operational evidence",
			domain: "AI systems",
			node: "Multi-die and advanced-node",
			evidence: "Architecture inference",
			status: "Public working draft",
			limitation: "Component ownership varies by platform architecture"
		}
	]
};
//#endregion
//#region src/js/modules/phase4_meta_view.js
function c(e) {
	if (!e) return;
	let { canonicalFields: t, operationalFields: n, publicRecords: r } = s;
	e.innerHTML = `
    <header class="panel-heading taxonomy-heading">
      <div><p class="eyebrow dark">04 · SHAREPOINT TAXONOMY</p><h2>Transfer a governed knowledge model,<br><em>not a folder of pages</em></h2></div>
      <p>The same eight fields organize public research now and restricted corporate evidence later. Operational fields add ownership without changing the content spine.</p>
    </header>
    <section class="content-section" aria-labelledby="canonical-title">
      <div class="section-label"><span>01</span><div><p>CANONICAL CONTENT CONTRACT</p><h3 id="canonical-title">Eight fields every NVM asset keeps</h3></div></div>
      <ol class="schema-flow">
        ${t.map((e, t) => `<li><span>${String(t + 1).padStart(2, "0")}</span><div><h4>${e.field}</h4><p>${e.purpose}</p><small>EXAMPLE · ${e.example}</small></div></li>`).join("")}
      </ol>
    </section>
    <section class="content-section operational-section" aria-labelledby="operations-title">
      <div class="section-label"><span>02</span><div><p>OPERATIONAL LAYER</p><h3 id="operations-title">Fields that make the system maintainable</h3></div></div>
      <div class="operational-fields">${n.map((e, t) => `<span><b>${String(t + 1).padStart(2, "0")}</b>${e}</span>`).join("")}</div>
    </section>
    <section class="content-section" aria-labelledby="records-title">
      <div class="section-label"><span>03</span><div><p>PUBLIC RECORD PREVIEW</p><h3 id="records-title">Safe examples for the future SharePoint library</h3></div></div>
      <div class="record-grid">
        ${r.map((e) => `
          <article>
            <header><span>${e.id}</span><b>${e.status}</b></header>
            <h4>${e.title}</h4>
            <dl><div><dt>TECHNOLOGY</dt><dd>${e.technology}</dd></div><div><dt>STATE CONTRACT</dt><dd>${e.contract}</dd></div><div><dt>APPLICATION</dt><dd>${e.domain}</dd></div><div><dt>PROCESS NODE</dt><dd>${e.node}</dd></div><div><dt>EVIDENCE CLASS</dt><dd>${e.evidence}</dd></div></dl>
            <p><b>LIMITATION</b>${e.limitation}</p>
          </article>
        `).join("")}
      </div>
    </section>
    <aside class="sharepoint-transfer">
      <div><p>TRANSFER MODEL</p><h3>Public architecture now<br>Restricted evidence later</h3></div>
      <p>The company SharePoint edition can extend each record with foundry qualification, customer context, validation artifacts and confidential product data. Copilot then retrieves content through stable metadata and permissions.</p>
    </aside>
  `;
}
//#endregion
//#region src/data/nvm_specs.js
var l = [
	{
		id: "sram_puf_secure_storage",
		profile: "SRAM PUF Secure Storage",
		family: "SRAM PUF + 1T OTP + AES-256",
		contract: "Absent-at-rest; ephemeral root regenerated on-the-fly; encrypted ciphertext in OTP",
		nodeLens: "Logic-compatible CMOS; qualified across TSMC N7, N6, N5, N4P, N3P, N2 GAA, N7A, N5A",
		updateModel: "Dynamic boot generation + AES-256 (mode per product docs) + ephemeral key zeroization",
		strongestFit: "AI Accelerators, LLM KV Cache cipher, Chiplet D2D Root-of-Trust, Automotive ADAS",
		boundary: "Requires helper data integrity checks and hardware trust-boundary enclosure",
		evidenceStatus: "Portfolio-scale deployment narrative · PSA/SESIP/AEC tiers require named product evidence",
		latency: "Architecture-dependent (verify per macro/integration)",
		busExposure: "None (Monolithic on-die boundary)",
		bomCost: "Zero mask adder (Standard CMOS)"
	},
	{
		id: "conventional_otp",
		profile: "Conventional Plain Antifuse OTP",
		family: "Antifuse OTP (Raw / Unencrypted)",
		contract: "Permanent physical oxide breakdown; static bit values readable under bias",
		nodeLens: "Broad foundry logic-node availability; mainstream 180nm down to 3nm",
		updateModel: "Program once (irreversible physical breakdown); no key rotation",
		strongestFit: "Wafer ID, analog trim, non-sensitive feature configuration, basic boot pointers",
		boundary: "Susceptible to FIB/PVC probing (RP2350 threat model) and power side-channel analysis",
		evidenceStatus: "10B+ Units Shipped · Foundry Baseline",
		latency: "Low (10-50 ns)",
		busExposure: "On-chip bus (Registers vulnerable to glitching)",
		bomCost: "Low (Standard macro)"
	},
	{
		id: "otp_puf_tunneling",
		profile: "Quantum Tunneling OTP-PUF",
		family: "Quantum Tunneling / High-Voltage OTP-PUF",
		contract: "Permanent dielectric breakdown tunneling paths; zero helper-data activation (No trapped charge)",
		nodeLens: "Requires specialized high-voltage write characterization per foundry/node",
		updateModel: "Enrolled once at wafer sort; static physical response without fuzzy extractor",
		strongestFit: "Die-unique identity where helper data storage is completely disallowed",
		boundary: "Permanent physical conductivity requires thermal/FIB tamper validation",
		evidenceStatus: "100M+ Shipped · PSA L3 · SESIP L3 · AEC-Q100 G0/G1 Lineage",
		latency: "Low (20-100 ns)",
		busExposure: "On-chip bus",
		bomCost: "Low to Medium (Foundry dependent)"
	},
	{
		id: "discrete_secure_element",
		profile: "Discrete Secure Element (SE)",
		family: "Dedicated Security Chip (e.g. NXP SE050)",
		contract: "Secured smartcard micro-controller with internal tamper-shielded EEPROM/Flash",
		nodeLens: "Independent external package; bonded to PCB adjacent to main SoC",
		updateModel: "Secure command APDU transactions via serial bus",
		strongestFit: "IoT Gateways, payment POS terminals, smart meters, low-bandwidth crypto offload",
		boundary: "External I2C/SPI bus is exposed to board-level probing, MITM and replay attacks",
		evidenceStatus: "Common Criteria EAL6+ · FIPS 140-3",
		latency: "High (10-50 ms serial overhead)",
		busExposure: "High (External PCB trace sniffing)",
		bomCost: "High (Dedicated chip + PCB area + assembly)"
	},
	{
		id: "dedicated_hsm",
		profile: "Hardware Security Module (HSM)",
		family: "Board-Level / PCIe HSM Module",
		contract: "Battery-backed SRAM key vault inside active physical tamper-sensing envelope",
		nodeLens: "PCIe add-in card or rackmount appliance with dedicated cryptoprocessor",
		updateModel: "Network/PCIe PKCS#11 / KMIP service requests with mTLS/SPDM authentication",
		strongestFit: "Datacenter Root CA, Cloud Key Management Service (KMS), Banking Core Attestation",
		boundary: "Cannot be integrated into single-die SoC; PCIe latency prohibitive for memory cipher",
		evidenceStatus: "FIPS 140-2 Level 4 · PCI-PTS",
		latency: "Medium-High (1-10 ms per RPC)",
		busExposure: "PCIe / Network TLS boundary",
		bomCost: "Extreme ($1,000 - $20,000+ per unit)"
	},
	{
		id: "embedded_flash",
		profile: "Embedded Flash (eFlash)",
		family: "Floating Gate / Charge Trap eFlash",
		contract: "Managed firmware updates; block erase and sector programming",
		nodeLens: "Economically & physically constrained at <=28nm due to high mask count (10-15 masks)",
		updateModel: "Signed in-system firmware updates with recovery dual-bank partition",
		strongestFit: "Automotive MCUs and IoT microcontrollers on mature nodes (40nm-180nm)",
		boundary: "Do not treat 28nm commercialization boundary as a physics law, but mask cost dominates",
		evidenceStatus: "AEC-Q100 · Mature Node Mainstream",
		latency: "Medium (15-30 ns read, ms write)",
		busExposure: "Internal bus",
		bomCost: "High mask cost (10-15 additional masks)"
	},
	{
		id: "mram_reram",
		profile: "Emerging NVM (MRAM / ReRAM)",
		family: "Emerging BEOL NVM (STT-MRAM / OxRAM ReRAM)",
		contract: "Fast byte-addressable persistent state with high endurance",
		nodeLens: "Advanced foundry backend modules (22nm, 16nm, 12nm, N7 available from select foundries)",
		updateModel: "Direct memory-mapped write without block erase",
		strongestFit: "Low-latency persistent cache, AI edge inference weight storage, battery-less sensors",
		boundary: "Magnetic field sensitivity (MRAM) and retention distribution tails (ReRAM) need qualification",
		evidenceStatus: "Foundry Qualified (22nm/16nm)",
		latency: "Very Low (10-30 ns read/write)",
		busExposure: "Internal bus",
		bomCost: "Medium (3-5 extra BEOL masks)"
	},
	{
		id: "cpo_chiplet_nvm",
		profile: "CPO & 3D Chiplet NVM Trim",
		family: "On-Die Managed MTP / AntiFuse OTP",
		contract: "Bounded mutable optical phase/heater calibration and UCIe D2D session keys",
		nodeLens: "CoWoS / SoIC / COUPE heterogeneous advanced packaging & TSMC 3DFabric",
		updateModel: "Atomic calibration commit + instant cold-boot zeroization",
		strongestFit: "51.2T/102.4T CPO Switches, UCIe 2.0 D2D Links, Optical Compute Interconnect (OCI)",
		boundary: "Requires DAC precision calibration and high-temperature thermal cycling margin",
		evidenceStatus: "800G/1.6T Foundry-Verified · OCP OIF · UCIe 2.0",
		latency: "Sub-10 ns read, atomic write",
		busExposure: "None (Die-internal analog/interconnect boundary)",
		bomCost: "Zero extra mask adder in standard CMOS"
	},
	{
		id: "bcd_power_pmic_trim",
		profile: "BCD Power PMIC & LED Trimming",
		family: "Antifuse OTP (Fixed) / NeoMTP (Floating-Gate MTP)",
		contract: "Fixed OTP or updateable NeoMTP analog Vref bandgap (±0.5%) & oscillator calibration; multi-channel LED balance",
		nodeLens: "0.18µm, 0.13µm, 90nm, 55nm BCD Foundry Platforms (VIS, TSMC, PSMC, UMC)",
		updateModel: "Wafer sort (CP) & final test (FT) trimming; OTP fixed after programming; NeoMTP updates within the qualified IP budget",
		strongestFit: "PMIC, USB-PD 3.1 240W EPR Controllers, BLDC Motor Drivers, BMIC 16-24 Cell AFEs",
		boundary: "Requires high-temperature retention validation up to 150°C-175°C automotive junction temp",
		evidenceStatus: "AEC-Q100 Grade 0 · Multi-Foundry BCD Baseline",
		latency: "Low (15-30 ns read)",
		busExposure: "None (Internal analog resistor ladder trim boundary)",
		bomCost: "Zero extra mask adder (Eliminates 10-15 eFlash masks, saving 30-50%)"
	},
	{
		id: "cis_dram_matrix_repair",
		profile: "CIS & DRAM Matrix Defect Repair",
		family: "AntiFuse OTP Hard FuseBox & PPR",
		contract: "Non-volatile bad bitcell / pixel address remapping to spare rows/columns",
		nodeLens: "Advanced DRAM (DDR5, HBM3e) & 3D Stacking CIS (TSMC 3DFabric, Cu-Cu Hybrid Bonding)",
		updateModel: "BIST autonomous scanning + BIRA minimum vertex cover + FuseBox OTP burn",
		strongestFit: "JEDEC Hard Post-Package Repair (hPPR), 200MP Mobile CIS, Datacenter AI Server Memories",
		boundary: "Limited by physical spare row/column availability and macro height (<250µm)",
		evidenceStatus: "JEDEC JESD79-5 DDR5 · JESD238 HBM3e · Mass Production Proven",
		latency: "Zero-cycle address redirection on-die",
		busExposure: "Internal memory address decoder override",
		bomCost: "Ultra-low silicon overhead (<0.5% total die area)"
	},
	{
		id: "hv_display_ddic_demura",
		profile: "HV Display Driver (OLED / LCD DDIC)",
		family: "High-Density Embedded MTP / Pure Logic OTP",
		contract: "Multi-point Gamma 2.2 R-DAC calibration, Vcom 5mV anti-flicker, 2D De-Mura gain LUT",
		nodeLens: "80nm-55nm HV, 40nm-28nm eHV, 16nm FinFET eHV (TSMC, UMC, VIS, Nexchip)",
		updateModel: "Factory optical camera calibration write; dynamic refresh rate adaptive indexing",
		strongestFit: "AMOLED Smartphone DDIC, Automotive Cockpit Displays, Micro-OLED AR/VR Systems",
		boundary: "Must withstand high-voltage swings (+20V/-15V gate rails, 8V-12V source lines)",
		evidenceStatus: "Commercial AMOLED Standard · 120Hz-144Hz Production",
		latency: "Sub-microsecond frame-level LUT retrieval",
		busExposure: "Internal display pipeline pixel stream",
		bomCost: "Zero mask adder in specialized eHV platforms"
	},
	{
		id: "eink_ultra_hv_mtp_otp",
		profile: "E-Ink Ultra-HV Driver (40V-50V / 110HV)",
		family: "MTP in Evolution ➔ Pure Logic AntiFuse OTP in Maturity",
		contract: "Multi-dimensional electrophoretic driving waveform LUT & temperature compensation",
		nodeLens: "110HV, 90HV, 80eHV Specialty CMOS (VIS, UMC, Nexchip; BCD excluded due to leakage)",
		updateModel: "MTP (32Kb-64Kb) during color formulation evolution; OTP (<250µm height) in volume maturity",
		strongestFit: "Electronic Shelf Labels (ESL), Full-Color E-Paper (Spectra 6, Kaleido 3), Outdoor Signage",
		boundary: "Zero standby drain strictly required for 5-10 yr coin battery; strict <250µm die height",
		evidenceStatus: "E-Ink Panel Partner Standard · Fitipower / UltraChip / Solomon Baseline",
		latency: "Fast multi-frame waveform index (<50 ns)",
		busExposure: "Internal driver waveform generator engine",
		bomCost: "Zero extra mask adder; reduces BOM cost by eliminating discrete external SPI Flash"
	}
], u = {
	sram_puf_secure_storage: "The 1.5B+ figure is a vendor-aggregated portfolio claim, not shipments of this Secure Storage implementation. Node availability, certifications, latency and the combined architecture require separate product-specific evidence.",
	conventional_otp: "Shipment totals, node range and timing refer to an illustrative technology-family comparison. A named macro and its qualification report are required; one RP2350 attack does not prove every OTP implementation vulnerable.",
	otp_puf_tunneling: "Dielectric-breakdown tunneling is the mechanism described by this draft, not a verified identification of every OTP PUF. Shipment totals, helper-data requirements and certification lineage need named-product sources.",
	discrete_secure_element: "SE050 is a named example, not evidence that every discrete secure element shares the same certification, memory technology or latency. Verify the exact device, certificate and secure-channel threat model.",
	dedicated_hsm: "Battery-backed storage, physical integration, certifications, RPC latency and price are scenario assumptions. They are not universal properties of all HSM products.",
	embedded_flash: "Node economics, added masks, timing and automotive qualification depend on the foundry process and macro. The 28nm comparison is not a universal technology limit.",
	mram_reram: "Node availability, foundry qualification, mask count and timing require separate MRAM/ReRAM and foundry evidence. A roadmap target or design-ready announcement is not production.",
	cpo_chiplet_nvm: "Packaging names and interface standards provide application context. They do not establish that this NVM trim architecture, throughput, timing or zero-mask claim is foundry-qualified.",
	bcd_power_pmic_trim: "The cited eMemory page supports the NeoMTP floating-gate, rewritable-memory mechanism. It does not prove every listed BCD platform, trim accuracy, Grade 0 qualification, timing or cost-saving percentage in this draft.",
	cis_dram_matrix_repair: "Standard names describe application context; capacity, dimensions, timing, area overhead and production status need the exact memory device, standard revision and implementation evidence.",
	hv_display_ddic_demura: "Voltage rails, resolution, refresh rates, process availability and mask assumptions are design examples; no named DDIC qualification or production result is established by this profile.",
	eink_ultra_hv_mtp_otp: "Driver platforms, memory size, battery life, height limits and named suppliers are application assumptions requiring product-specific sources. These statements do not establish a universal panel-partner standard."
}, d = l.map((e) => ({
	...e,
	evidenceReview: {
		status: "source-needed",
		scope: u[e.id],
		sources: e.id === "bcd_power_pmic_trim" ? [{
			product: "NeoMTP",
			url: "https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP",
			fields: [
				"family",
				"contract",
				"updateModel"
			],
			claim: "Floating-gate programming and erase support a rewritable NeoMTP mechanism; exact operating budgets require the selected IP.",
			limitation: "Does not substantiate the draft platform list, certification grade, accuracy, latency or savings.",
			checkedAt: "2026-09-19"
		}] : []
	}
})), f = {
	sram_puf_secure_storage: {
		profile: "SRAM PUF 安全儲存",
		family: "SRAM PUF + 1T OTP + AES-256",
		contract: "靜態時不保留根金鑰；運作時重新產生暫時性根金鑰；OTP 儲存加密密文",
		nodeLens: "相容邏輯 CMOS；原稿列為已驗證的 TSMC 節點：N7、N6、N5、N4P、N3P、N2 GAA、N7A、N5A",
		updateModel: "開機時動態產生＋線速 AES-256-XTS 執行＋即時清除",
		strongestFit: "AI 加速器、LLM KV 快取加密、小晶片晶粒間信任根、車用 ADAS",
		boundary: "需要輔助資料完整性檢查與硬體信任邊界防護",
		evidenceStatus: "1.5B+ 台裝置（供應商彙總的產品組合聲稱）· PSA L3 · SESIP L3 · AEC-Q100 G1",
		latency: "次微秒等級 (<1 µs)",
		busExposure: "無（單晶粒內部邊界）",
		bomCost: "無額外光罩（標準 CMOS）",
		evidenceReview: {
			scope: "1.5B+ 為供應商彙總的產品組合聲稱，不代表此安全儲存實作的出貨量。節點可用性、認證、延遲與組合架構，均需另附特定產品證據。",
			sources: []
		}
	},
	conventional_otp: {
		profile: "傳統純 AntiFuse OTP",
		family: "反熔絲 OTP（原始／未加密）",
		contract: "永久性氧化層物理崩潰；施加偏壓時可讀取靜態位元值",
		nodeLens: "廣泛適用於晶圓代工邏輯節點；原稿主流範圍為 180nm 至 3nm",
		updateModel: "單次寫入（不可逆物理崩潰）；無法輪替金鑰",
		strongestFit: "晶圓識別碼、類比微調、非敏感功能組態、基本開機指標",
		boundary: "可能受到 FIB／PVC 探測（RP2350 威脅模型）與功耗側通道分析影響",
		evidenceStatus: "累計出貨超過 100 億顆 · 晶圓代工基準",
		latency: "低 (10-50 ns)",
		busExposure: "晶片內匯流排（暫存器可能受突波攻擊）",
		bomCost: "低（標準巨集）",
		evidenceReview: {
			scope: "出貨總量、節點範圍與時序均屬技術家族的示意比較。必須指定巨集與驗證報告；單一 RP2350 攻擊不能證明所有 OTP 實作都存在相同弱點。",
			sources: []
		}
	},
	otp_puf_tunneling: {
		profile: "量子穿隧型 OTP-PUF",
		family: "量子穿隧／高電壓 OTP-PUF",
		contract: "永久介電質擊穿穿隧路徑；啟動無須輔助資料（無電荷捕捉）",
		nodeLens: "需要依晶圓代工廠與節點進行專屬高電壓寫入特性驗證",
		updateModel: "於晶圓測試時單次註冊；無須模糊擷取器的靜態物理回應",
		strongestFit: "完全不允許儲存輔助資料時的晶粒唯一身分",
		boundary: "永久物理導電性需要熱與 FIB 竄改驗證",
		evidenceStatus: "100M+ 出貨 · PSA L3 · SESIP L3 · AEC-Q100 G0/G1 沿革",
		latency: "低 (20-100 ns)",
		busExposure: "晶片內匯流排",
		bomCost: "低至中等（依晶圓代工平台而異）",
		evidenceReview: {
			scope: "介電層崩潰穿隧是本原稿描述的機制，並非對所有 OTP PUF 的已驗證判定。出貨總量、輔助資料需求與認證沿革，均需指定產品的來源。",
			sources: []
		}
	},
	discrete_secure_element: {
		profile: "獨立安全元件 (SE)",
		family: "專用安全晶片（例如 NXP SE050）",
		contract: "內含防竄改屏蔽 EEPROM／Flash 的安全智慧卡微控制器",
		nodeLens: "獨立外部封裝；安裝於主 SoC 旁的 PCB",
		updateModel: "透過序列匯流排執行安全命令 APDU 交易",
		strongestFit: "IoT 閘道器、支付 POS 終端、智慧電表、低頻寬密碼運算卸載",
		boundary: "外部 I2C／SPI 匯流排暴露於板級探測、中間人與重放攻擊",
		evidenceStatus: "共同準則 EAL6+ · FIPS 140-3",
		latency: "高（10-50 ms 序列傳輸額外延遲）",
		busExposure: "高（外部 PCB 走線側錄）",
		bomCost: "高（專用晶片＋PCB 面積＋組裝）",
		evidenceReview: {
			scope: "SE050 是具名範例，不能據此認定所有獨立安全元件均具有相同認證、記憶體技術或延遲。應核對確切元件、證書與安全通道威脅模型。",
			sources: []
		}
	},
	dedicated_hsm: {
		profile: "硬體安全模組 (HSM)",
		family: "板級／PCIe HSM 模組",
		contract: "主動實體竄改偵測防護範圍內的電池備援 SRAM 金鑰儲存庫",
		nodeLens: "具有專用密碼處理器的 PCIe 擴充卡或機架式設備",
		updateModel: "經 mTLS/SPDM 驗證的網路／PCIe PKCS#11／KMIP 服務請求",
		strongestFit: "資料中心根憑證機構、雲端金鑰管理服務 (KMS)、銀行核心系統證明",
		boundary: "無法整合至單晶粒 SoC；PCIe 延遲不利於記憶體加密",
		evidenceStatus: "FIPS 140-2 第 4 級 · PCI-PTS",
		latency: "中高（每次 RPC 為 1-10 ms）",
		busExposure: "PCIe／網路 TLS 邊界",
		bomCost: "極高（每顆 $1,000 - $20,000 以上）",
		evidenceReview: {
			scope: "電池備援儲存、實體整合、認證、RPC 延遲與價格均屬情境假設，不能視為所有 HSM 產品的共同特性。",
			sources: []
		}
	},
	embedded_flash: {
		profile: "嵌入式快閃記憶體 (eFlash)",
		family: "浮動閘極／電荷捕捉式 eFlash",
		contract: "受控韌體更新；區塊抹除與磁區寫入",
		nodeLens: "在 ≤28nm 時因高光罩數（10-15 層）受到經濟與物理限制",
		updateModel: "具簽章的系統內韌體更新，並搭配可復原的雙儲存區分割",
		strongestFit: "成熟製程 (40nm-180nm) 的車用 MCU 與 IoT 微控制器",
		boundary: "不可將 28nm 商業化邊界視為物理定律，但光罩成本占主導因素",
		evidenceStatus: "AEC-Q100 · 成熟製程主流",
		latency: "中等（讀取 15-30 ns、寫入為 ms 等級）",
		busExposure: "內部匯流排",
		bomCost: "高光罩成本（增加 10-15 層光罩）",
		evidenceReview: {
			scope: "節點經濟性、額外光罩、時序與車規驗證取決於晶圓代工製程和巨集。28nm 的比較不能當作普遍的技術限制。",
			sources: []
		}
	},
	mram_reram: {
		profile: "新興非揮發性記憶體 (MRAM / ReRAM)",
		family: "新興 BEOL NVM（STT-MRAM／OxRAM ReRAM）",
		contract: "具高耐寫能力、可依位元組定址的快速持久狀態",
		nodeLens: "先進晶圓代工後段模組（部分代工廠可提供 22nm、16nm、12nm、N7）",
		updateModel: "無須區塊抹除的直接記憶體映射寫入",
		strongestFit: "低延遲持久快取、AI 邊緣推論權重儲存、無電池感測器",
		boundary: "MRAM 的磁場敏感度與 ReRAM 資料保存分布尾端需要資格驗證",
		evidenceStatus: "晶圓代工資格驗證 (22nm/16nm)",
		latency: "極低（讀取／寫入 10-30 ns）",
		busExposure: "內部匯流排",
		bomCost: "中等（增加 3-5 層 BEOL 光罩）",
		evidenceReview: {
			scope: "節點可用性、晶圓代工驗證、光罩數與時序，需要分別核對 MRAM／ReRAM 及各代工廠的證據。路線圖目標或可供設計公告不等於量產。",
			sources: []
		}
	},
	cpo_chiplet_nvm: {
		profile: "CPO 與 3D 小晶片 NVM 微調",
		family: "晶粒內受控 MTP／反熔絲 OTP",
		contract: "有限次可變的光學相位／加熱器校準與 UCIe 晶粒間工作階段金鑰",
		nodeLens: "CoWoS／SoIC／COUPE 異質先進封裝與 TSMC 3DFabric",
		updateModel: "原子性校準提交＋冷啟動即時清除",
		strongestFit: "51.2T/102.4T CPO 交換器、UCIe 2.0 晶粒間連結、光學運算互連 (OCI)",
		boundary: "需要 DAC 精度校準與高溫熱循環裕量",
		evidenceStatus: "800G/1.6T 晶圓代工驗證 · OCP OIF · UCIe 2.0",
		latency: "讀取低於 10 ns，原子性寫入",
		busExposure: "無（晶粒內類比／互連邊界）",
		bomCost: "標準 CMOS 無須增加光罩",
		evidenceReview: {
			scope: "封裝名稱與介面標準僅提供應用背景，不能證明此 NVM 微調架構、吞吐量、時序或零額外光罩聲稱已通過晶圓代工驗證。",
			sources: []
		}
	},
	bcd_power_pmic_trim: {
		profile: "BCD 電源 PMIC 與 LED 電性微調",
		family: "AntiFuse OTP（固定）／NeoMTP（浮動閘 MTP）",
		contract: "OTP 固定或 NeoMTP 可更新的類比 Vref 能隙（±0.5%）與振盪器校準；多通道 LED 平衡",
		nodeLens: "0.18µm、0.13µm、90nm、55nm BCD 晶圓代工平臺（VIS、TSMC、PSMC、UMC）",
		updateModel: "晶圓測試（CP）與最終測試（FT）微調；OTP 寫入後固定；NeoMTP 依已驗證 IP 預算更新",
		strongestFit: "PMIC、USB-PD 3.1 240W EPR 控制器、BLDC 馬達驅動器、BMIC 16-24 電芯 AFE",
		boundary: "需要驗證高達 150°C-175°C 車用接面溫度下的高溫資料保存",
		evidenceStatus: "AEC-Q100 Grade 0 · 多家晶圓代工 BCD 基準",
		latency: "低（讀取 15-30 ns）",
		busExposure: "無（內部類比電阻梯微調邊界）",
		bomCost: "零額外光罩（省去 10-15 層 eFlash 光罩，節省 30-50%）",
		evidenceReview: {
			scope: "所列力旺頁面支援 NeoMTP 的浮動閘與可改寫記憶體機制，並未證明本原稿列出的所有 BCD 平臺、微調精度、Grade 0 驗證、時序或節省成本百分比。",
			sources: [{
				claim: "浮動閘寫入與抹除支援可改寫的 NeoMTP 機制；確切操作預算取決於選定 IP。",
				limitation: "此來源未證實原稿的平臺清單、認證等級、精度、延遲或節省成本。"
			}]
		}
	},
	cis_dram_matrix_repair: {
		profile: "CIS 與 DRAM 矩陣缺陷修復",
		family: "AntiFuse OTP 硬體 FuseBox 與 PPR",
		contract: "將缺陷位元單元／像素位址非揮發性重新映射至備援列／行",
		nodeLens: "先進 DRAM（DDR5、HBM3e）與 3D 堆疊 CIS（TSMC 3DFabric、Cu-Cu 混合接合）",
		updateModel: "BIST 自主掃描＋BIRA 最小頂點覆蓋＋FuseBox OTP 燒錄",
		strongestFit: "JEDEC 硬體封裝後修復（hPPR）、200MP 行動裝置 CIS、資料中心 AI 伺服器記憶體",
		boundary: "受實體備援列／行數量與巨集高度（<250µm）限制",
		evidenceStatus: "JEDEC JESD79-5 DDR5 · JESD238 HBM3e · 原稿聲稱已量產驗證",
		latency: "晶粒內零週期位址重新導向",
		busExposure: "內部記憶體位址解碼器覆寫",
		bomCost: "極低矽面積額外成本（總晶粒面積 <0.5%）",
		evidenceReview: {
			scope: "標準名稱僅描述應用背景；容量、尺寸、時序、面積額外成本與量產狀態，需要確切記憶體元件、標準版本及實作證據。",
			sources: []
		}
	},
	hv_display_ddic_demura: {
		profile: "高壓顯示驅動晶片 (OLED / LCD DDIC)",
		family: "高密度嵌入式 MTP／純邏輯 OTP",
		contract: "多點 Gamma 2.2 R-DAC 校準、Vcom 5mV 抗閃爍、2D De-Mura 增益 LUT",
		nodeLens: "80nm-55nm HV、40nm-28nm eHV、16nm FinFET eHV（TSMC、UMC、VIS、Nexchip）",
		updateModel: "工廠光學相機校準寫入；動態更新率自適應索引",
		strongestFit: "AMOLED 智慧型手機 DDIC、車用座艙顯示器、Micro-OLED AR／VR 系統",
		boundary: "必須承受高電壓擺幅（+20V/-15V 閘極電壓軌、8V-12V 源極線）",
		evidenceStatus: "商用 AMOLED 標準 · 原稿聲稱 120Hz-144Hz 量產",
		latency: "次微秒影格層級 LUT 讀取",
		busExposure: "內部顯示管線像素串流",
		bomCost: "專用 eHV 平臺零額外光罩",
		evidenceReview: {
			scope: "電壓軌、解析度、更新率、製程可用性與光罩假設均屬設計範例；此設定檔未確立具名 DDIC 的驗證或量產結果。",
			sources: []
		}
	},
	eink_ultra_hv_mtp_otp: {
		profile: "電子紙超高壓驅動晶片 (40V-50V / 110HV)",
		family: "演進階段採 MTP ➔ 成熟階段採純邏輯 AntiFuse OTP",
		contract: "多維電泳驅動波形 LUT 與溫度補償",
		nodeLens: "110HV、90HV、80eHV 特種 CMOS（VIS、UMC、Nexchip；原稿因漏電排除 BCD）",
		updateModel: "色彩配方演進時採 MTP（32Kb-64Kb）；量產成熟時採 OTP（高度 <250µm）",
		strongestFit: "電子貨架標籤（ESL）、全彩電子紙（Spectra 6、Kaleido 3）、戶外看板",
		boundary: "5-10 年鈕扣電池壽命嚴格要求零待機耗電；晶粒高度嚴格小於 250µm",
		evidenceStatus: "電子紙面板夥伴標準 · Fitipower／UltraChip／Solomon 基準",
		latency: "快速多影格波形索引（<50 ns）",
		busExposure: "內部驅動波形產生引擎",
		bomCost: "零額外光罩；省去獨立外部 SPI Flash 以降低 BOM 成本",
		evidenceReview: {
			scope: "驅動平臺、記憶體容量、電池壽命、高度限制與具名供應商均屬應用假設，需要特定產品來源。這些敘述不能確立通用的面板夥伴標準。",
			sources: []
		}
	}
}, p = [
	"profile",
	"family",
	"contract",
	"nodeLens",
	"updateModel",
	"strongestFit",
	"boundary",
	"evidenceStatus",
	"latency",
	"busExposure",
	"bomCost"
], m = /* @__PURE__ */ new Set([
	"SRAM PUF + 1T OTP + AES-256",
	"Common Criteria EAL6+ · FIPS 140-3",
	"FIPS 140-2 Level 4 · PCI-PTS",
	"80nm-55nm HV、40nm-28nm eHV、16nm FinFET eHV（TSMC、UMC、VIS、Nexchip）"
]);
function h(e = d, t = f) {
	let n = [], r = (e, t) => {
		typeof e != "string" || !e.trim() ? n.push(`${t}：缺少繁中翻譯`) : !/[\u3400-\u9fff]/u.test(e) && !m.has(e) && n.push(`${t}：一般敘述未提供繁中`);
	};
	for (let i of e) {
		let e = t[i.id], a = Object.keys(i).filter((e) => e !== "id" && typeof i[e] == "string");
		for (let t of a) p.includes(t) || n.push(`${i.id}.${t}：新增欄位尚未加入語系契約`), r(e?.[t], `${i.id}.${t}`);
		for (let e of p) a.includes(e) || n.push(`${i.id}.${e}：原稿欄位遺失`);
		r(e?.evidenceReview?.scope, `${i.id}.evidenceReview.scope`), e?.evidenceReview?.sources?.length !== i.evidenceReview.sources.length && n.push(`${i.id}.evidenceReview.sources：來源翻譯數量不符`), i.evidenceReview.sources.forEach((t, n) => {
			for (let t of ["claim", "limitation"]) r(e?.evidenceReview?.sources?.[n]?.[t], `${i.id}.evidenceReview.sources.${n}.${t}`);
		});
	}
	for (let r of Object.keys(t)) e.some((e) => e.id === r) || n.push(`${r}：語系資料沒有對應原稿`);
	if (n.length) throw Error(`設定檔語系驗證失敗：\n${n.join("\n")}`);
	return {
		profiles: e.length,
		fields: e.length * p.length
	};
}
function g(e, t = "en") {
	if (t !== "zh") return e;
	let n = f[e.id];
	if (!n) throw Error(`缺少設定檔語系：${e.id}`);
	return {
		...e,
		...Object.fromEntries(p.map((e) => [e, n[e]])),
		evidenceReview: {
			...e.evidenceReview,
			scope: n.evidenceReview.scope,
			sources: e.evidenceReview.sources.map((e, t) => ({
				...e,
				...n.evidenceReview.sources[t]
			}))
		}
	};
}
h();
//#endregion
//#region src/js/modules/matrix.js
var _ = () => globalThis.window?.HubLanguage?.get() || globalThis.document?.documentElement?.dataset.language || "en", v = (e) => String(e).replace(/[&<>"']/g, (e) => ({
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	"\"": "&quot;",
	"'": "&#39;"
})[e]), y = (e, t) => `<span data-lang="en">${v(e)}</span><span data-lang="zh">${v(t)}</span>`;
function b(e = "ALL") {
	return e === "ALL" ? d : d.filter((t) => t.family === e);
}
function x(e) {
	if (!e) return;
	e.innerHTML = `
    <header class="panel-heading selector-heading">
      <div>
        <p class="eyebrow dark">03 · DECISION MATRIX</p>
        <h2>Compare the state contract<br><em>before comparing a macro</em></h2>
      </div>
      <p>Interactive multi-way security & NVM architecture comparison (${d.length} canonical profiles). Filter by technology family, inspect latency and physical exposure, or export profiles for system engineering reviews.</p>
    </header>

    <p class="matrix-evidence-boundary"><span data-lang="zh">以下保留 12 筆工程原稿供審查。數值、製程、認證與量產字樣均屬待查證聲稱；只有明確標示的來源支援指定欄位，不能視為完整產品規格。</span><span data-lang="en">These 12 engineering drafts retain their original values for review. Numbers, nodes, certifications and production wording remain unverified claims; a linked source supports only its stated fields, not a complete product specification.</span></p>

    <section class="selector-controls" aria-label="Decision matrix filters" data-aria-en="Decision matrix filters" data-aria-zh="決策矩陣篩選條件">
      <label for="filter-family">
        <span>FILTER BY TECHNOLOGY FAMILY</span>
        <select id="filter-family">
          <option value="ALL">All public profiles (${d.length})</option>
          ${[...new Set(d.map((e) => e.family))].map((e) => `<option value="${v(e)}">${v(e)}</option>`).join("")}
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

    <div class="decision-table-wrap" tabindex="0" role="region" aria-label="Decision matrix table" data-aria-en="Decision matrix table" data-aria-zh="決策矩陣表格">
      <table class="decision-table">
        <caption>Illustrative NVM selection profiles with explicit evidence boundaries (${d.length} Profiles)</caption>
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
        <tbody id="decision-body">${S(d)}</tbody>
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
	let t = e.querySelector("#filter-family"), n = e.querySelector("#decision-body"), r = "ALL", i = () => {
		if (!t) return;
		let e = _();
		for (let n of t.options) {
			let t = d.find((e) => e.family === n.value);
			n.textContent = t ? g(t, e).family : e === "zh" ? `全部公開設定檔（${d.length}）` : `All public profiles (${d.length})`;
		}
	};
	i(), globalThis.window?.addEventListener("hub:language-change", i), t?.addEventListener("change", (e) => {
		r = e.target.value;
		let t = b(r);
		n.innerHTML = S(t);
	}), e.querySelector("#btn-export-csv")?.addEventListener("click", () => {
		D(b(r));
	}), e.querySelector("#btn-export-json")?.addEventListener("click", () => {
		O(b(r));
	});
}
function S(e) {
	return e.map((e) => {
		let t = g(e, "zh"), n = (n) => y(e[n], t[n]);
		return `
    <tr data-profile-id="${e.id}">
      <th scope="row" data-label="STATE PROFILE">
        <strong>${n("profile")}</strong>
        <small>${n("updateModel")}</small>
      </th>
      <td data-label="TECHNOLOGY FAMILY"><span class="family-chip">${n("family")}</span></td>
      <td data-label="STATE CONTRACT">${n("contract")}</td>
      <td data-label="BUS EXPOSURE">
        <span class="security-chip ${C(e.busExposure)}">${n("busExposure")}</span>
      </td>
      <td data-label="LATENCY & BOM">
        <small><strong>Latency:</strong> ${n("latency")}</small><br>
        <small><strong>BOM:</strong> ${n("bomCost")}</small>
      </td>
      <td data-label="STRONGEST FIT">${n("strongestFit")}</td>
      <td data-label="EVIDENCE STATUS">
        <strong><span data-lang="zh">待查證的原稿聲稱</span><span data-lang="en">Draft claim — verification pending</span></strong>
        <span class="status-chip">${n("evidenceStatus")}</span>
        <p class="profile-boundary">${y(e.evidenceReview.scope, t.evidenceReview.scope)}</p>
        ${e.evidenceReview.sources.map((e, n) => `<p><a href="${e.url}" target="_blank" rel="noopener noreferrer">${e.product}<span data-lang="zh"> 官方來源</span><span data-lang="en"> official source</span></a><small>${y(`${e.claim} ${e.limitation}`, `${t.evidenceReview.sources[n].claim} ${t.evidenceReview.sources[n].limitation}`)}</small></p>`).join("")}
      </td>
    </tr>
  `;
	}).join("");
}
function C(e) {
	return e ? e.includes("None") || e.includes("Monolithic") || e.includes("Die-internal") ? "sec-high" : e.includes("High") || e.includes("External") ? "sec-low" : "sec-med" : "";
}
function w(e, t = "en") {
	let n = t === "zh" ? [
		"識別碼",
		"設定檔",
		"技術家族",
		"狀態契約",
		"製程節點",
		"更新方式",
		"匯流排暴露度",
		"延遲",
		"BOM成本",
		"最適應用",
		"技術限制",
		"原稿證據聲稱",
		"審查狀態",
		"證據範圍",
		"來源"
	] : [
		"ID",
		"Profile",
		"Family",
		"Contract",
		"NodeLens",
		"UpdateModel",
		"BusExposure",
		"Latency",
		"BOMCost",
		"StrongestFit",
		"Boundary",
		"EvidenceStatus",
		"ReviewStatus",
		"ReviewScope",
		"Sources"
	], r = [
		"id",
		"profile",
		"family",
		"contract",
		"nodeLens",
		"updateModel",
		"busExposure",
		"latency",
		"bomCost",
		"strongestFit",
		"boundary",
		"evidenceStatus"
	], i = (e) => {
		let t = String(e ?? "");
		return `"${(/^[\s\u0000-\u001f]*[=+@-]/u.test(t) || /^[\t\r\n]/u.test(t) ? `'${t}` : t).replace(/"/g, "\"\"")}"`;
	};
	return "﻿" + [n.join(","), ...e.map((e) => g(e, t)).map((e) => [
		...r.map((t) => e[t]),
		t === "zh" && e.evidenceReview?.status === "source-needed" ? "待補來源" : e.evidenceReview?.status,
		e.evidenceReview?.scope,
		JSON.stringify(e.evidenceReview?.sources || [])
	].map(i).join(","))].join("\r\n");
}
var T = (e, t = "en") => JSON.stringify(e.map((e) => g(e, t)), null, 2);
function E(e, t, n) {
	let r = URL.createObjectURL(new Blob([e], { type: t })), i = document.createElement("a");
	i.href = r, i.download = n, document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e3);
}
function D(e) {
	let t = _();
	E(w(e, t), "text/csv;charset=utf-8", t === "zh" ? "NVM_決策矩陣.csv" : "NVM_Decision_Matrix.csv");
}
function O(e) {
	let t = _();
	E(T(e, t), "application/json;charset=utf-8", t === "zh" ? "NVM_決策矩陣.json" : "NVM_Decision_Matrix.json");
}
//#endregion
//#region src/js/app.js
var k = [
	"overview",
	"whitepaper",
	"selector",
	"taxonomy",
	"templates"
], A = {
	phase1: "overview",
	phase2: "whitepaper",
	matrix: "selector",
	phase4: "taxonomy",
	phase3: "templates"
};
function j() {
	let e = new URLSearchParams(window.location.search).get("view") || "overview";
	return k.includes(e) ? e : A[e] || "overview";
}
function M(e, { updateHistory: t = !0, focus: n = !1 } = {}) {
	let r = k.includes(e) ? e : "overview";
	if (document.querySelectorAll(".view-tab").forEach((e) => {
		let t = e.dataset.view === r;
		e.setAttribute("aria-selected", t ? "true" : "false"), e.tabIndex = t ? 0 : -1, t && n && e.focus();
	}), document.querySelectorAll(".studio-panel").forEach((e) => {
		e.hidden = e.id !== `panel-${r}`;
	}), t) {
		let e = new URL(window.location.href);
		r === "overview" ? e.searchParams.delete("view") : e.searchParams.set("view", r), r !== "whitepaper" && e.hash.startsWith("#chap-") && (e.hash = ""), window.history.pushState({ view: r }, "", `${e.pathname}${e.search}${e.hash}`);
	}
}
function N({ scrollChapter: e = !1 } = {}) {
	let t = new URL(window.location.href), n = t.hash.startsWith("#chap-"), r = t.searchParams.has("view"), i = j();
	n && !r && (i = "whitepaper"), n && i !== "whitepaper" && (t.hash = "", window.history.replaceState({ view: i }, "", `${t.pathname}${t.search}`)), M(i, { updateHistory: !1 }), n && i === "whitepaper" && e && requestAnimationFrame(() => {
		let e = decodeURIComponent((window.location.hash || "").replace(/^#/, ""));
		e && document.getElementById(e)?.scrollIntoView({ block: "start" });
	});
}
function P() {
	let e = [...document.querySelectorAll(".view-tab")];
	e.forEach((t, n) => {
		t.addEventListener("click", () => M(t.dataset.view)), t.addEventListener("keydown", (t) => {
			if (![
				"ArrowLeft",
				"ArrowRight",
				"ArrowUp",
				"ArrowDown",
				"Home",
				"End"
			].includes(t.key)) return;
			t.preventDefault();
			let r = n;
			r = t.key === "Home" ? 0 : t.key === "End" ? e.length - 1 : t.key === "ArrowLeft" || t.key === "ArrowUp" ? (n - 1 + e.length) % e.length : (n + 1) % e.length, M(e[r].dataset.view, { focus: !0 });
		});
	}), window.addEventListener("popstate", () => N({ scrollChapter: !0 }));
}
function F() {
	let e = document.querySelector("#menuToggle"), t = document.querySelector("#primaryNav, #globalNav");
	if (!e || !t || e._hubNavBound) return;
	e._hubNavBound = !0;
	let n = (n = !1) => {
		t?.classList.remove("open"), e?.setAttribute("aria-expanded", "false"), e?.setAttribute("aria-label", "Open navigation"), n && e?.focus();
	};
	e?.addEventListener("click", () => {
		let n = t.classList.toggle("open");
		e.setAttribute("aria-expanded", n ? "true" : "false"), e.setAttribute("aria-label", n ? "Close navigation" : "Open navigation"), n && t.querySelector("a")?.focus();
	}), t?.addEventListener("click", (e) => {
		e.target.closest("a") && n();
	}), document.addEventListener("keydown", (e) => {
		e.key === "Escape" && t?.classList.contains("open") && n(!0);
	}), window.addEventListener("resize", () => {
		window.matchMedia("(min-width: 1081px)").matches && n();
	}, { passive: !0 });
}
function I(e) {
	let t = document.querySelector("#toast");
	t && (t.textContent = e, t.classList.add("show"), window.clearTimeout(I.timer), I.timer = window.setTimeout(() => t.classList.remove("show"), 2400));
}
function L() {
	document.addEventListener("click", async (e) => {
		let t = e.target.closest("[data-copy-outline]");
		if (!t) return;
		let n = window.WhitepaperLanguage?.translateText(t.dataset.copyOutline || "") || t.dataset.copyOutline || "";
		try {
			await navigator.clipboard.writeText(n), I("Template outline copied");
		} catch {
			let e = document.createElement("textarea");
			e.value = n, e.setAttribute("readonly", ""), e.className = "clipboard-fallback", document.body.appendChild(e), e.select();
			let r = !1;
			try {
				r = document.execCommand("copy");
			} catch {}
			if (r) {
				e.remove(), I("Template outline copied");
				return;
			}
			e.remove(), document.querySelector("#manual-copy-outline")?.remove();
			let i = document.createElement("section");
			i.id = "manual-copy-outline", i.className = "manual-copy-outline";
			let a = document.createElement("p");
			a.textContent = "Copy failed. Select the outline below and copy it manually.";
			let o = document.createElement("textarea");
			o.value = n, o.readOnly = !0, o.setAttribute("aria-label", "Template outline for manual copy");
			let s = document.createElement("button");
			s.type = "button", s.textContent = "Close", s.addEventListener("click", () => {
				i.remove(), t.focus();
			}), i.append(a, o, s), t.after(i), o.focus(), o.select(), I("Copy failed. Select the outline below and copy it manually.");
		}
	});
}
document.addEventListener("DOMContentLoaded", () => {
	t(document.querySelector("#panel-overview")), r(document.querySelector("#panel-whitepaper")), x(document.querySelector("#panel-selector")), c(document.querySelector("#panel-taxonomy")), a(document.querySelector("#panel-templates")), P(), F(), L(), N({ scrollChapter: !0 });
});
//#endregion
