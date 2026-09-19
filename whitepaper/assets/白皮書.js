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
        <nav aria-label="Whitepaper chapters">
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
          <nav><a href="https://samhuang68.github.io/nvm-knowledge-hub/memory-evidence.html">Open Evidence Ledger <span>↗</span></a><a href="https://samhuang68.github.io/nvm-knowledge-hub/memory-physics.html">Review Memory Physics <span>↗</span></a></nav>
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
		updateModel: "Dynamic boot generation + line-speed AES-256-XTS execution + instant zeroization",
		strongestFit: "AI Accelerators, LLM KV Cache cipher, Chiplet D2D Root-of-Trust, Automotive ADAS",
		boundary: "Requires helper data integrity checks and hardware trust-boundary enclosure",
		evidenceStatus: "1.5B+ Devices (Vendor-Aggregated Portfolio Claim) · PSA L3 · SESIP L3 · AEC-Q100 G1",
		latency: "Sub-microsecond (<1 µs)",
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
}));
//#endregion
//#region src/js/modules/matrix.js
function f(e = "ALL") {
	return e === "ALL" ? d : d.filter((t) => t.family === e);
}
function p(e) {
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

    <section class="selector-controls" aria-label="Decision matrix filters">
      <label for="filter-family">
        <span>FILTER BY TECHNOLOGY FAMILY</span>
        <select id="filter-family">
          <option value="ALL">All public profiles (${d.length})</option>
          ${[...new Set(d.map((e) => e.family))].map((e) => `<option value="${e}">${e}</option>`).join("")}
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
        <tbody id="decision-body">${m(d)}</tbody>
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
	let t = e.querySelector("#filter-family"), n = e.querySelector("#decision-body"), r = "ALL";
	t?.addEventListener("change", (e) => {
		r = e.target.value;
		let t = f(r);
		n.innerHTML = m(t);
	}), e.querySelector("#btn-export-csv")?.addEventListener("click", () => {
		v(f(r));
	}), e.querySelector("#btn-export-json")?.addEventListener("click", () => {
		y(f(r));
	});
}
function m(e) {
	return e.map((e) => `
    <tr data-profile-id="${e.id}">
      <th scope="row" data-label="STATE PROFILE">
        <strong>${e.profile}</strong>
        <small>${e.updateModel || ""}</small>
      </th>
      <td data-label="TECHNOLOGY FAMILY"><span class="family-chip">${e.family}</span></td>
      <td data-label="STATE CONTRACT">${e.contract}</td>
      <td data-label="BUS EXPOSURE">
        <span class="security-chip ${h(e.busExposure)}">${e.busExposure || "On-chip"}</span>
      </td>
      <td data-label="LATENCY & BOM">
        <small><strong>Latency:</strong> ${e.latency || "N/A"}</small><br>
        <small><strong>BOM:</strong> ${e.bomCost || "N/A"}</small>
      </td>
      <td data-label="STRONGEST FIT">${e.strongestFit}</td>
      <td data-label="EVIDENCE STATUS">
        <strong><span data-lang="zh">待查證的原稿聲稱</span><span data-lang="en">Draft claim — verification pending</span></strong>
        <span class="status-chip">${e.evidenceStatus}</span>
        <p class="profile-boundary">${e.evidenceReview.scope}</p>
        ${e.evidenceReview.sources.map((e) => `<p><a href="${e.url}" target="_blank" rel="noopener noreferrer">${e.product}<span data-lang="zh"> 官方來源</span><span data-lang="en"> official source</span></a><small>${e.claim} ${e.limitation}</small></p>`).join("")}
      </td>
    </tr>
  `).join("");
}
function h(e) {
	return e ? e.includes("None") || e.includes("Monolithic") || e.includes("Die-internal") ? "sec-high" : e.includes("High") || e.includes("External") ? "sec-low" : "sec-med" : "";
}
function g(e) {
	let t = [
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
	], n = [
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
	], r = (e) => {
		let t = String(e ?? "");
		return `"${(/^[\s\u0000-\u001f]*[=+@-]/u.test(t) || /^[\t\r\n]/u.test(t) ? `'${t}` : t).replace(/"/g, "\"\"")}"`;
	};
	return "﻿" + [t.join(","), ...e.map((e) => [
		...n.map((t) => e[t]),
		e.evidenceReview?.status,
		e.evidenceReview?.scope,
		JSON.stringify(e.evidenceReview?.sources || [])
	].map(r).join(","))].join("\r\n");
}
function _(e, t, n) {
	let r = URL.createObjectURL(new Blob([e], { type: t })), i = document.createElement("a");
	i.href = r, i.download = n, document.body.appendChild(i), i.click(), i.remove(), setTimeout(() => URL.revokeObjectURL(r), 1e3);
}
function v(e) {
	_(g(e), "text/csv;charset=utf-8", "NVM_決策矩陣.csv");
}
function y(e) {
	_(JSON.stringify(e, null, 2), "application/json;charset=utf-8", "NVM_決策矩陣.json");
}
//#endregion
//#region src/js/app.js
var b = [
	"overview",
	"whitepaper",
	"selector",
	"taxonomy",
	"templates"
], x = {
	phase1: "overview",
	phase2: "whitepaper",
	matrix: "selector",
	phase4: "taxonomy",
	phase3: "templates"
};
function S() {
	let e = new URLSearchParams(window.location.search).get("view") || "overview";
	return b.includes(e) ? e : x[e] || "overview";
}
function C(e, { updateHistory: t = !0, focus: n = !1 } = {}) {
	let r = b.includes(e) ? e : "overview";
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
function w({ scrollChapter: e = !1 } = {}) {
	let t = new URL(window.location.href), n = t.hash.startsWith("#chap-"), r = t.searchParams.has("view"), i = S();
	n && !r && (i = "whitepaper"), n && i !== "whitepaper" && (t.hash = "", window.history.replaceState({ view: i }, "", `${t.pathname}${t.search}`)), C(i, { updateHistory: !1 }), n && i === "whitepaper" && e && requestAnimationFrame(() => {
		let e = decodeURIComponent((window.location.hash || "").replace(/^#/, ""));
		e && document.getElementById(e)?.scrollIntoView({ block: "start" });
	});
}
function T() {
	let e = [...document.querySelectorAll(".view-tab")];
	e.forEach((t, n) => {
		t.addEventListener("click", () => C(t.dataset.view)), t.addEventListener("keydown", (t) => {
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
			r = t.key === "Home" ? 0 : t.key === "End" ? e.length - 1 : t.key === "ArrowLeft" || t.key === "ArrowUp" ? (n - 1 + e.length) % e.length : (n + 1) % e.length, C(e[r].dataset.view, { focus: !0 });
		});
	}), window.addEventListener("popstate", () => w({ scrollChapter: !0 }));
}
function E() {
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
function D(e) {
	let t = document.querySelector("#toast");
	t && (t.textContent = e, t.classList.add("show"), window.clearTimeout(D.timer), D.timer = window.setTimeout(() => t.classList.remove("show"), 2400));
}
function O() {
	document.addEventListener("click", async (e) => {
		let t = e.target.closest("[data-copy-outline]");
		if (!t) return;
		let n = window.WhitepaperLanguage?.translateText(t.dataset.copyOutline || "") || t.dataset.copyOutline || "";
		try {
			await navigator.clipboard.writeText(n), D("Template outline copied");
		} catch {
			let e = document.createElement("textarea");
			e.value = n, e.setAttribute("readonly", ""), e.className = "clipboard-fallback", document.body.appendChild(e), e.select();
			let r = !1;
			try {
				r = document.execCommand("copy");
			} catch {}
			if (r) {
				e.remove(), D("Template outline copied");
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
			}), i.append(a, o, s), t.after(i), o.focus(), o.select(), D("Copy failed. Select the outline below and copy it manually.");
		}
	});
}
document.addEventListener("DOMContentLoaded", () => {
	t(document.querySelector("#panel-overview")), r(document.querySelector("#panel-whitepaper")), p(document.querySelector("#panel-selector")), c(document.querySelector("#panel-taxonomy")), a(document.querySelector("#panel-templates")), T(), E(), O(), w({ scrollChapter: !0 });
});
//#endregion
