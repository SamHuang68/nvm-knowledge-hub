(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={stateContracts:[{id:`identity`,number:`01`,contract:`Immutable identity`,role:`Device identity, lifecycle state and boot trust anchors`,owner:`Provisioning authority`,updateCadence:`Program once; verify throughout life`,selectionQuestion:`Can the state ever be rotated, revoked or recovered?`,evidenceBoundary:`Threat model and provisioning flow must be explicit before selecting OTP.`},{id:`calibration`,number:`02`,contract:`Bounded calibration`,role:`Trim, remap, analog compensation and configuration`,owner:`Manufacturing or hardware controller`,updateCadence:`Rare, controlled updates`,selectionQuestion:`How many updates are required after test, package and field aging?`,evidenceBoundary:`Endurance, write energy and high-voltage availability are use-case specific.`},{id:`firmware`,number:`03`,contract:`Adaptive firmware`,role:`Boot code, patches, policy and feature configuration`,owner:`Secure update service`,updateCadence:`Managed change with rollback or recovery`,selectionQuestion:`Does capacity and update frequency justify an embedded array?`,evidenceBoundary:`Separate code-storage needs from immutable security state.`},{id:`operations`,number:`04`,contract:`Operational evidence`,role:`Repair history, RAS logs, counters and field learning`,owner:`Platform controller`,updateCadence:`Repeated writes over system life`,selectionQuestion:`Which state must survive power loss, service events or module replacement?`,evidenceBoundary:`System retention and recovery may be more important than bit-cell density.`}],technologyFamilies:[{family:`OTP`,mechanism:`One-time physical state transition`,strongestFit:`Immutable and monotonic state`,processLens:`Broad logic-node reach; implementation is provider specific`,limit:`A written bit cannot become an update policy by itself`,status:`Architecture baseline`},{family:`MTP / EEPROM class`,mechanism:`Reprogrammable charge-based state`,strongestFit:`Bounded calibration and small firmware state`,processLens:`High-voltage and oxide options constrain portability`,limit:`Endurance, programming supply and retention must be jointly qualified`,status:`Public evidence needed per process`},{family:`Embedded Flash`,mechanism:`Dedicated embedded charge-storage integration`,strongestFit:`Code-rich embedded systems`,processLens:`Commercial fit is shaped by mask cost and process-development complexity`,limit:`Node migration is an economics and integration decision—not a simple shrink`,status:`Node-specific decision`},{family:`MRAM / ReRAM`,mechanism:`Magnetic or resistive state`,strongestFit:`Advanced-node embedded NVM where available`,processLens:`Foundry module, density and qualification status dominate`,limit:`Availability does not automatically establish application readiness`,status:`Evidence varies by platform`},{family:`SRAM PUF + crypto`,mechanism:`Power-up-derived secret plus cryptographic protection`,strongestFit:`Companion security layer above persistent ciphertext`,processLens:`System architecture rather than a peer storage medium`,limit:`Reliability, helper data and attack assurance still require validation`,status:`Companion architecture`}],processLenses:[{range:`MATURE & SPECIALTY`,title:`Start with the available voltage and device stack`,body:`For power, BCD, sensor and interface products, I/O devices and programming-voltage generation often define the feasible NVM set before density does.`,decision:`Validate I/O voltage, charge pump, test flow and retention together.`},{range:`eFLASH TRANSITION`,title:`Treat scaling as an integration-economics boundary`,body:`Conventional embedded-flash commercialization is widely associated with the 28 nm generation. Crossing that boundary is not a hard physics cliff; mask count, development effort and manufacturing economics shape adoption.`,decision:`Keep vendor-specific mask-stack detail in the internal evidence layer.`},{range:`ADVANCED NODE`,title:`Decouple read supply from program infrastructure`,body:`A single-VDD read path can simplify always-on and low-voltage domains, while programming may still require an I/O-derived foundation for an internal charge pump.`,decision:`Specify read and program power contracts separately.`},{range:`LEADING EDGE & CHIPLET`,title:`Move from one macro to a distributed state architecture`,body:`Identity, repair, calibration, firmware and operational logs may reside in different dies or controllers. The selection unit becomes the system state contract, not a single NVM array.`,decision:`Define ownership, trust boundary and recovery before technology.`}],selectionSequence:[{step:`01`,name:`Name the state`,detail:`What survives power loss—and why?`},{step:`02`,name:`Assign ownership`,detail:`Who may create, update, revoke or recover it?`},{step:`03`,name:`Constrain the process`,detail:`Which node, voltage and integration options actually exist?`},{step:`04`,name:`Close the evidence gap`,detail:`What is sourced, inferred or still target-silicon dependent?`}]};function t(t){if(!t)return;let{stateContracts:n,technologyFamilies:r,processLenses:i,selectionSequence:a}=e;t.innerHTML=`
    <header class="panel-heading">
      <div><p class="eyebrow dark">01 · NVM OVERVIEW</p><h2>NVM is a system state decision,<br><em>not a product-name decision</em></h2></div>
      <p>Start with the state the system must preserve. Then constrain technology by ownership, update cadence, process options and evidence.</p>
    </header>

    <section class="content-section" aria-labelledby="contracts-title">
      <div class="section-label"><span>01</span><div><p>STATE CONTRACTS</p><h3 id="contracts-title">Four persistent-state promises</h3></div></div>
      <div class="contract-grid">
        ${n.map(e=>`
          <article class="contract-card">
            <div class="contract-index"><span>${e.number}</span><i aria-hidden="true"></i></div>
            <p class="micro-label">${e.updateCadence}</p>
            <h4>${e.contract}</h4>
            <strong>${e.role}</strong>
            <dl><div><dt>OWNER</dt><dd>${e.owner}</dd></div><div><dt>DECISION QUESTION</dt><dd>${e.selectionQuestion}</dd></div></dl>
            <p class="evidence-note"><b>LIMIT</b>${e.evidenceBoundary}</p>
          </article>
        `).join(``)}
      </div>
    </section>

    <section class="content-section technology-section" aria-labelledby="technology-title">
      <div class="section-label"><span>02</span><div><p>TECHNOLOGY FAMILIES</p><h3 id="technology-title">Compare by fit and boundary</h3></div></div>
      <div class="technology-list">
        ${r.map((e,t)=>`
          <article>
            <span class="technology-number">0${t+1}</span>
            <div class="technology-name"><p>${e.status}</p><h4>${e.family}</h4><span>${e.mechanism}</span></div>
            <div><small>STRONGEST FIT</small><p>${e.strongestFit}</p></div>
            <div><small>PROCESS LENS</small><p>${e.processLens}</p></div>
            <div class="technology-limit"><small>BOUNDARY</small><p>${e.limit}</p></div>
          </article>
        `).join(``)}
      </div>
    </section>

    <section class="content-section" aria-labelledby="node-title">
      <div class="section-label"><span>03</span><div><p>PROCESS-NODE LENS</p><h3 id="node-title">What changes as the process changes</h3></div></div>
      <div class="node-lens-grid">
        ${i.map(e=>`
          <article><p>${e.range}</p><h4>${e.title}</h4><span>${e.body}</span><strong>${e.decision}</strong></article>
        `).join(``)}
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
        ${a.map(e=>`<li><span>${e.step}</span><div><b>${e.name}</b><p>${e.detail}</p></div></li>`).join(``)}
      </ol>
      <a class="inline-cta" href="?view=selector">Apply the sequence in the Decision Matrix <span aria-hidden="true">↗</span></a>
    </section>
  `}var n={title:`Selecting NVM by State Contract, Process Boundary and Evidence`,subtitle:`A public architecture guide for turning persistent-state requirements into defensible technology decisions`,author:`NVM Knowledge Hub Editorial System`,version:`Public working draft`,publishDate:`Reviewed 2026-08-25`,chapters:[{id:`state-contract`,number:`01`,title:`Begin With the State Contract`,lede:`The first decision is not OTP versus MTP. It is the promise the system must keep after power is removed.`,paragraphs:[`Persistent state carries an owner, update cadence, retention obligation, recovery rule and threat boundary. Two bit arrays of similar size can therefore require very different architectures: an immutable lifecycle transition is not governed like a field-updatable calibration table.`,`A useful state contract names who may create the state, when it may change, which failures must be recoverable and what evidence proves the contract across process, voltage, temperature and lifecycle conditions.`],takeaways:[`Define state before technology`,`Separate immutability from update policy`,`Treat recovery as part of retention`],evidenceClass:`Architecture principle`,limitation:`Implementation targets still require product- and process-specific validation.`},{id:`technology-boundaries`,number:`02`,title:`Map Technology Families to the Contract`,lede:`Each NVM family expresses a different compromise among permanence, updates, density, voltage and process integration.`,paragraphs:[`OTP is naturally aligned with immutable or monotonic state. MTP and EEPROM-class structures support bounded changes but introduce endurance, programming-energy and high-voltage questions. Embedded Flash addresses code-rich systems where its process integration is economically justified. MRAM and ReRAM extend the advanced-node portfolio, but availability and qualification remain platform specific.`,`SRAM PUF is a companion security primitive rather than a peer non-volatile medium. It can derive a device-unique root secret at power-up so persistent memory stores ciphertext or helper data instead of a reusable root key. That architecture raises assurance requirements of its own; it does not erase them.`],takeaways:[`Do not model PUF as stored NVM`,`Qualify program and read paths separately`,`Avoid technology labels without a state owner`],evidenceClass:`Supported architecture synthesis`,limitation:`Technology availability, reliability and security claims vary by supplier and target process.`},{id:`node-boundary`,number:`03`,title:`Treat Node Migration as an Integration Decision`,lede:`NVM scaling is shaped by device options, mask economics, program voltage and qualification effort—not geometry alone.`,paragraphs:[`Floating-gate MTP relies on an oxide and high-voltage environment capable of preserving programmed charge. A process portfolio that only exposes lower-voltage devices can therefore narrow implementation choices. Dedicated embedded-flash integration can introduce a purpose-built oxide, but additional process complexity changes the commercial equation.`,`The frequently cited 28 nm boundary for conventional embedded Flash is best read as a clear public commercialization high point, not a law of physics. Beyond it, development difficulty, mask-stack expansion and cost can outweigh the benefit. At more advanced nodes, foundry roadmaps increasingly turn to MRAM or ReRAM, while logic-compatible OTP continues to serve small persistent-state needs.`,`For advanced-node OTP, a single-VDD read mode can reduce always-on power-domain dependencies and simplify power sequencing. Programming can remain a separate event that uses an I/O supply as the foundation for an internal charge pump. Public architecture should state that separation without disclosing proprietary circuit detail.`],takeaways:[`Node names are not portability proof`,`Separate read simplification from program infrastructure`,`Model mask and qualification cost as system constraints`],evidenceClass:`Industry synthesis + expert calibration`,limitation:`Vendor-specific voltage coverage, mask counts and product roadmaps require internal portfolio evidence before customer use.`},{id:`decision-evidence`,number:`04`,title:`Make the Decision Evidence-Aware`,lede:`A decision matrix is useful only when it makes uncertainty visible instead of converting assumptions into specifications.`,paragraphs:[`Public evidence can establish mechanisms, disclosed product availability and demonstrated use cases. Supplier claims may describe performance or qualification. Architecture inference can connect those facts to a system proposal. Target-silicon evidence is still required to close PVT, retention, endurance, power and attack-resilience claims for a specific implementation.`,`Every comparison row should therefore carry a source class, scope, limitation, review status and next validation action. Unsupported precision should be removed; a categorical range with an explicit evidence gap is more trustworthy than an exact number without provenance.`],takeaways:[`Never let UI polish promote an assumption to fact`,`Bind every claim to scope and limitation`,`Use open gaps to drive the next validation action`],evidenceClass:`Evidence governance method`,limitation:`This public workbench intentionally excludes confidential qualification and customer data.`},{id:`enterprise-transfer`,number:`05`,title:`Transfer the Knowledge, Not Just the Page`,lede:`SharePoint migration succeeds when content has a stable contract before it enters the corporate system.`,paragraphs:[`The canonical record begins with Technology Family, State Contract, Application Domain and Process Node. Evidence Class, Source, Limitation and Review Status make the record governable. Operational fields such as owner, visibility, review date and migration ID make it maintainable.`,`The public site supplies a clean knowledge spine. The internal SharePoint version can add confidential product data, foundry qualification, customer context and validation artifacts without changing the information architecture. Copilot then operates over governed metadata rather than an unstructured document dump.`],takeaways:[`Preserve the eight-field content contract`,`Keep public and restricted evidence separate`,`Make review status machine-readable`],evidenceClass:`Enterprise content architecture`,limitation:`Final column types, permissions and retention policies must align with the company tenant.`}]};function r(e){if(!e)return;let{title:t,subtitle:r,author:i,version:a,publishDate:o,chapters:s}=n;e.innerHTML=`
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
          ${s.map(e=>`<a href="#chap-${e.id}"><b>${e.number}</b><span>${e.title}</span></a>`).join(``)}
        </nav>
        <div class="reader-boundary"><b>PUBLIC EVIDENCE RULE</b><span>Exact specifications require a source, scope and limitation. Otherwise this paper uses architecture-level language.</span></div>
      </aside>
      <div class="paper-body">
        ${s.map(e=>`
          <article id="chap-${e.id}" class="paper-chapter">
            <header><p>CHAPTER ${e.number}</p><h3>${e.title}</h3><strong>${e.lede}</strong></header>
            <div class="chapter-copy">${e.paragraphs.map(e=>`<p>${e}</p>`).join(``)}</div>
            <div class="chapter-takeaways"><p>ARCHITECTURE TAKEAWAYS</p><ul>${e.takeaways.map(e=>`<li>${e}</li>`).join(``)}</ul></div>
            <dl class="evidence-contract"><div><dt>EVIDENCE CLASS</dt><dd>${e.evidenceClass}</dd></div><div><dt>LIMITATION</dt><dd>${e.limitation}</dd></div></dl>
          </article>
        `).join(``)}
        <aside class="paper-sources">
          <div><p>CONTINUE THE EVIDENCE TRAIL</p><h3>Use the Hub to separate source facts from architecture inference</h3></div>
          <nav><a href="https://samhuang68.github.io/nvm-knowledge-hub/memory-evidence.html">Open Evidence Ledger <span>↗</span></a><a href="https://samhuang68.github.io/nvm-knowledge-hub/memory-physics.html">Review Memory Physics <span>↗</span></a></nav>
        </aside>
      </div>
    </div>
  `}var i=[{id:`architecture-brief`,type:`Architecture Brief`,title:`NVM State-Contract Brief`,targetAudience:`System architects · Product managers`,summary:`Frame a persistent-state problem before proposing an IP or memory family.`,sections:[{heading:`System state`,body:`Name the state, owner, update cadence and power-off obligation.`},{heading:`Architecture choice`,body:`Compare candidate NVM families and companion controls.`},{heading:`Evidence boundary`,body:`Separate source-backed facts, inference and target-silicon gaps.`},{heading:`Decision`,body:`Record the preferred architecture, rejected alternatives and validation owner.`}]},{id:`technology-note`,type:`Technical Note`,title:`Technology Boundary Review`,targetAudience:`NVM engineers · Process integration teams`,summary:`Explain a mechanism and its node, voltage, retention and integration constraints without overstating readiness.`,sections:[{heading:`Mechanism`,body:`Describe the stored physical variable and read observable.`},{heading:`Process boundary`,body:`Identify required devices, voltages, modules and test assumptions.`},{heading:`Reliability contract`,body:`Define required retention, endurance and environmental scope.`},{heading:`Open evidence`,body:`List missing supplier, PDK, silicon or qualification evidence.`}]},{id:`selection-record`,type:`Decision Record`,title:`NVM Selection Decision Record`,targetAudience:`Architecture review boards · Marketing teams`,summary:`Capture why one technology was selected for one state contract at one process boundary.`,sections:[{heading:`Decision context`,body:`Application, state contract, node and business constraint.`},{heading:`Options`,body:`Candidate families with strengths, limits and evidence class.`},{heading:`Decision rationale`,body:`Trade-off logic and assumptions that materially affect the choice.`},{heading:`Review trigger`,body:`Event or new evidence that requires the decision to be revisited.`}]},{id:`evidence-entry`,type:`Evidence Entry`,title:`Claim-to-Evidence Ledger Entry`,targetAudience:`Editors · Validation owners · Copilot users`,summary:`Turn a statement into a reviewable knowledge record ready for public or restricted SharePoint libraries.`,sections:[{heading:`Claim`,body:`Use the narrowest wording supported by the evidence.`},{heading:`Source and class`,body:`Record origin, date and whether evidence is direct, supported or inferred.`},{heading:`Scope and limitation`,body:`State what the source does not prove.`},{heading:`Review status`,body:`Assign owner, next action and review date.`}]}];function a(e){e&&(e.innerHTML=`
    <header class="panel-heading template-heading">
      <div><p class="eyebrow dark">05 · CONTENT TEMPLATES</p><h2>Make evidence discipline<br><em>repeatable by design</em></h2></div>
      <p>Each template begins with the decision or claim and ends with its evidence boundary. Copy an outline, then adapt it to the target audience.</p>
    </header>
    <div class="template-grid">
      ${i.map((e,t)=>{let n=`${e.title}\n\n${e.sections.map(e=>`${e.heading}\n${e.body}`).join(`

`)}`;return`
          <article class="template-card">
            <header><span>${String(t+1).padStart(2,`0`)}</span><p>${e.type}</p></header>
            <h3>${e.title}</h3>
            <p class="template-audience">${e.targetAudience}</p>
            <p class="template-summary">${e.summary}</p>
            <ol>${e.sections.map((e,t)=>`<li><span>${String(t+1).padStart(2,`0`)}</span><div><b>${e.heading}</b><p>${e.body}</p></div></li>`).join(``)}</ol>
            <button class="copy-button" type="button" data-copy-outline="${o(n)}">Copy template outline <span aria-hidden="true">↗</span></button>
          </article>
        `}).join(``)}
    </div>
    <aside class="template-rule"><p>TEMPLATE RULE</p><h3>Do not start with a product name</h3><span>Start with the system state, evidence status and decision owner. Product mapping comes after the contract is understood.</span></aside>
  `)}function o(e){return e.replaceAll(`&`,`&amp;`).replaceAll(`"`,`&quot;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`
`,`&#10;`)}var s={canonicalFields:[{field:`Technology Family`,purpose:`OTP, MTP, eFlash, MRAM, ReRAM or companion primitive`,example:`OTP`},{field:`State Contract`,purpose:`Persistence promise and update semantics`,example:`Immutable identity`},{field:`Application Domain`,purpose:`System context that gives the state meaning`,example:`Secure boot`},{field:`Process Node`,purpose:`Node or platform boundary without implying qualification`,example:`Advanced-node logic`},{field:`Evidence Class`,purpose:`Direct, supported, inferred or open gap`,example:`Architecture inference`},{field:`Source`,purpose:`Public URL, document ID or restricted-library reference`,example:`Public evidence ledger`},{field:`Limitation`,purpose:`What the evidence does not establish`,example:`Target-silicon PVT pending`},{field:`Review Status`,purpose:`Draft, reviewed, approved or evidence required`,example:`Evidence required`}],operationalFields:[`Asset Type`,`Audience`,`Content Owner`,`Visibility`,`Last Reviewed`,`Migration ID`],publicRecords:[{id:`PUB-NVM-001`,title:`Immutable Device Identity Architecture`,technology:`OTP + companion key derivation`,contract:`Immutable identity`,domain:`Secure boot`,node:`Node-specific implementation`,evidence:`Architecture inference`,status:`Public review complete`,limitation:`Target-silicon security assurance remains implementation specific`},{id:`PUB-NVM-002`,title:`Bounded Calibration Selection Note`,technology:`OTP or MTP`,contract:`Bounded calibration`,domain:`Power and mixed signal`,node:`Specialty or mature logic`,evidence:`Supported synthesis`,status:`Evidence required`,limitation:`Programming voltage and endurance need platform confirmation`},{id:`PUB-NVM-003`,title:`AI Package Persistent-State Map`,technology:`Portfolio decision`,contract:`Operational evidence`,domain:`AI systems`,node:`Multi-die and advanced-node`,evidence:`Architecture inference`,status:`Public working draft`,limitation:`Component ownership varies by platform architecture`}]};function c(e){if(!e)return;let{canonicalFields:t,operationalFields:n,publicRecords:r}=s;e.innerHTML=`
    <header class="panel-heading taxonomy-heading">
      <div><p class="eyebrow dark">04 · SHAREPOINT TAXONOMY</p><h2>Transfer a governed knowledge model,<br><em>not a folder of pages</em></h2></div>
      <p>The same eight fields organize public research now and restricted corporate evidence later. Operational fields add ownership without changing the content spine.</p>
    </header>
    <section class="content-section" aria-labelledby="canonical-title">
      <div class="section-label"><span>01</span><div><p>CANONICAL CONTENT CONTRACT</p><h3 id="canonical-title">Eight fields every NVM asset keeps</h3></div></div>
      <ol class="schema-flow">
        ${t.map((e,t)=>`<li><span>${String(t+1).padStart(2,`0`)}</span><div><h4>${e.field}</h4><p>${e.purpose}</p><small>EXAMPLE · ${e.example}</small></div></li>`).join(``)}
      </ol>
    </section>
    <section class="content-section operational-section" aria-labelledby="operations-title">
      <div class="section-label"><span>02</span><div><p>OPERATIONAL LAYER</p><h3 id="operations-title">Fields that make the system maintainable</h3></div></div>
      <div class="operational-fields">${n.map((e,t)=>`<span><b>${String(t+1).padStart(2,`0`)}</b>${e}</span>`).join(``)}</div>
    </section>
    <section class="content-section" aria-labelledby="records-title">
      <div class="section-label"><span>03</span><div><p>PUBLIC RECORD PREVIEW</p><h3 id="records-title">Safe examples for the future SharePoint library</h3></div></div>
      <div class="record-grid">
        ${r.map(e=>`
          <article>
            <header><span>${e.id}</span><b>${e.status}</b></header>
            <h4>${e.title}</h4>
            <dl><div><dt>TECHNOLOGY</dt><dd>${e.technology}</dd></div><div><dt>STATE CONTRACT</dt><dd>${e.contract}</dd></div><div><dt>APPLICATION</dt><dd>${e.domain}</dd></div><div><dt>PROCESS NODE</dt><dd>${e.node}</dd></div><div><dt>EVIDENCE CLASS</dt><dd>${e.evidence}</dd></div></dl>
            <p><b>LIMITATION</b>${e.limitation}</p>
          </article>
        `).join(``)}
      </div>
    </section>
    <aside class="sharepoint-transfer">
      <div><p>TRANSFER MODEL</p><h3>Public architecture now<br>Restricted evidence later</h3></div>
      <p>The company SharePoint edition can extend each record with foundry qualification, customer context, validation artifacts and confidential product data. Copilot then retrieves content through stable metadata and permissions.</p>
    </aside>
  `}var l=[{id:`sram_puf_secure_storage`,profile:`SRAM PUF Secure Storage`,family:`SRAM PUF + 1T OTP + AES-256`,contract:`Absent-at-rest; ephemeral root regenerated on-the-fly; encrypted ciphertext in OTP`,nodeLens:`Logic-compatible CMOS; qualified across TSMC N7, N6, N5, N4P, N3P, N2 GAA, N7A, N5A`,updateModel:`Dynamic boot generation + line-speed AES-256-XTS execution + instant zeroization`,strongestFit:`AI Accelerators, LLM KV Cache cipher, Chiplet D2D Root-of-Trust, Automotive ADAS`,boundary:`Requires helper data integrity checks and hardware trust-boundary enclosure`,evidenceStatus:`1.5B+ Devices · PSA L3 · SESIP L3 · AEC-Q100 G1`,latency:`Sub-microsecond (<1 µs)`,busExposure:`None (Monolithic on-die boundary)`,bomCost:`Zero mask adder (Standard CMOS)`},{id:`conventional_otp`,profile:`Conventional Plain Antifuse OTP`,family:`Antifuse OTP (Raw / Unencrypted)`,contract:`Permanent physical oxide breakdown; static bit values readable under bias`,nodeLens:`Broad foundry logic-node availability; mainstream 180nm down to 3nm`,updateModel:`Program once (irreversible physical breakdown); no key rotation`,strongestFit:`Wafer ID, analog trim, non-sensitive feature configuration, basic boot pointers`,boundary:`Susceptible to FIB/PVC probing (RP2350 threat model) and power side-channel analysis`,evidenceStatus:`10B+ Units Shipped · Foundry Baseline`,latency:`Low (10-50 ns)`,busExposure:`On-chip bus (Registers vulnerable to glitching)`,bomCost:`Low (Standard macro)`},{id:`otp_puf_tunneling`,profile:`Quantum Tunneling OTP-PUF`,family:`Quantum Tunneling / High-Voltage OTP-PUF`,contract:`Permanent trapped-charge / tunneling paths; zero helper-data activation`,nodeLens:`Requires specialized high-voltage write characterization per foundry/node`,updateModel:`Enrolled once at wafer sort; static physical response without fuzzy extractor`,strongestFit:`Die-unique identity where helper data storage is completely disallowed`,boundary:`Permanent physical conductivity requires thermal/FIB tamper validation`,evidenceStatus:`Commercial IP · Foundry Specific`,latency:`Low (20-100 ns)`,busExposure:`On-chip bus`,bomCost:`Low to Medium (Foundry dependent)`},{id:`discrete_secure_element`,profile:`Discrete Secure Element (SE)`,family:`Dedicated Security Chip (e.g. NXP SE050)`,contract:`Secured smartcard micro-controller with internal tamper-shielded EEPROM/Flash`,nodeLens:`Independent external package; bonded to PCB adjacent to main SoC`,updateModel:`Secure command APDU transactions via serial bus`,strongestFit:`IoT Gateways, payment POS terminals, smart meters, low-bandwidth crypto offload`,boundary:`External I2C/SPI bus is exposed to board-level probing, MITM and replay attacks`,evidenceStatus:`Common Criteria EAL6+ · FIPS 140-3`,latency:`High (10-50 ms serial overhead)`,busExposure:`High (External PCB trace sniffing)`,bomCost:`High (Dedicated chip + PCB area + assembly)`},{id:`dedicated_hsm`,profile:`Hardware Security Module (HSM)`,family:`Board-Level / PCIe HSM Module`,contract:`Battery-backed SRAM key vault inside active physical tamper-sensing envelope`,nodeLens:`PCIe add-in card or rackmount appliance with dedicated cryptoprocessor`,updateModel:`Network/PCIe PKCS#11 / KMIP service requests with mTLS/SPDM authentication`,strongestFit:`Datacenter Root CA, Cloud Key Management Service (KMS), Banking Core Attestation`,boundary:`Cannot be integrated into single-die SoC; PCIe latency prohibitive for memory cipher`,evidenceStatus:`FIPS 140-2 Level 4 · PCI-PTS`,latency:`Medium-High (1-10 ms per RPC)`,busExposure:`PCIe / Network TLS boundary`,bomCost:`Extreme ($1,000 - $20,000+ per unit)`},{id:`embedded_flash`,profile:`Embedded Flash (eFlash)`,family:`Floating Gate / Charge Trap eFlash`,contract:`Managed firmware updates; block erase and sector programming`,nodeLens:`Economically & physically constrained at <=28nm due to high mask count (10-15 masks)`,updateModel:`Signed in-system firmware updates with recovery dual-bank partition`,strongestFit:`Automotive MCUs and IoT microcontrollers on mature nodes (40nm-180nm)`,boundary:`Do not treat 28nm commercialization boundary as a physics law, but mask cost dominates`,evidenceStatus:`AEC-Q100 · Mature Node Mainstream`,latency:`Medium (15-30 ns read, ms write)`,busExposure:`Internal bus`,bomCost:`High mask cost (10-15 additional masks)`},{id:`mram_reram`,profile:`Emerging NVM (MRAM / ReRAM)`,family:`Spin-Torque Transfer MRAM / ReRAM`,contract:`Fast byte-addressable persistent state with high endurance`,nodeLens:`Advanced foundry backend modules (22nm, 16nm, 12nm, N7 available from select foundries)`,updateModel:`Direct memory-mapped write without block erase`,strongestFit:`Low-latency persistent cache, AI edge inference weight storage, battery-less sensors`,boundary:`Magnetic field sensitivity (MRAM) and retention distribution tails (ReRAM) need qualification`,evidenceStatus:`Foundry Qualified (22nm/16nm)`,latency:`Very Low (10-30 ns read/write)`,busExposure:`Internal bus`,bomCost:`Medium (3-5 extra BEOL masks)`},{id:`cpo_chiplet_nvm`,profile:`CPO & 3D Chiplet NVM Trim`,family:`On-Die Managed MTP / AntiFuse OTP`,contract:`Bounded mutable optical phase/heater calibration and UCIe D2D session keys`,nodeLens:`CoWoS / SoIC / COUPE heterogeneous advanced packaging & TSMC 3DFabric`,updateModel:`Atomic calibration commit + instant cold-boot zeroization`,strongestFit:`51.2T/102.4T CPO Switches, UCIe 2.0 D2D Links, Optical Compute Interconnect (OCI)`,boundary:`Requires DAC precision calibration and high-temperature thermal cycling margin`,evidenceStatus:`800G/1.6T Foundry-Verified · OCP OIF · UCIe 2.0`,latency:`Sub-10 ns read, atomic write`,busExposure:`None (Die-internal analog/interconnect boundary)`,bomCost:`Zero extra mask adder in standard CMOS`}];function u(e){if(!e)return;e.innerHTML=`
    <header class="panel-heading selector-heading">
      <div>
        <p class="eyebrow dark">03 · DECISION MATRIX</p>
        <h2>Compare the state contract<br><em>before comparing a macro</em></h2>
      </div>
      <p>Interactive multi-way security & NVM architecture comparison (${l.length} canonical profiles). Filter by technology family, inspect latency and physical exposure, or export profiles for system engineering reviews.</p>
    </header>

    <section class="selector-controls" aria-label="Decision matrix filters">
      <label for="filter-family">
        <span>FILTER BY TECHNOLOGY FAMILY</span>
        <select id="filter-family">
          <option value="ALL">All public profiles (${l.length})</option>
          ${[...new Set(l.map(e=>e.family))].map(e=>`<option value="${e}">${e}</option>`).join(``)}
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
        <caption>Illustrative NVM selection profiles with explicit evidence boundaries (${l.length} Profiles)</caption>
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
        <tbody id="decision-body">${d(l)}</tbody>
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
  `;let t=e.querySelector(`#filter-family`),n=e.querySelector(`#decision-body`);t?.addEventListener(`change`,e=>{let t=e.target.value,r=t===`ALL`?l:l.filter(e=>e.family===t);n.innerHTML=d(r)}),e.querySelector(`#btn-export-csv`)?.addEventListener(`click`,()=>{p(l)}),e.querySelector(`#btn-export-json`)?.addEventListener(`click`,()=>{m(l)})}function d(e){return e.map(e=>`
    <tr>
      <th scope="row" data-label="STATE PROFILE">
        <strong>${e.profile}</strong>
        <small>${e.updateModel||``}</small>
      </th>
      <td data-label="TECHNOLOGY FAMILY"><span class="family-chip">${e.family}</span></td>
      <td data-label="STATE CONTRACT">${e.contract}</td>
      <td data-label="BUS EXPOSURE">
        <span class="security-chip ${f(e.busExposure)}">${e.busExposure||`On-chip`}</span>
      </td>
      <td data-label="LATENCY & BOM">
        <small><strong>Latency:</strong> ${e.latency||`N/A`}</small><br>
        <small><strong>BOM:</strong> ${e.bomCost||`N/A`}</small>
      </td>
      <td data-label="STRONGEST FIT">${e.strongestFit}</td>
      <td data-label="EVIDENCE STATUS"><span class="status-chip">${e.evidenceStatus}</span></td>
    </tr>
  `).join(``)}function f(e){return e?e.includes(`None`)||e.includes(`Monolithic`)||e.includes(`Die-internal`)?`sec-high`:e.includes(`High`)||e.includes(`External`)?`sec-low`:`sec-med`:``}function p(e){let t=[`Profile`,`Family`,`Contract`,`NodeLens`,`UpdateModel`,`BusExposure`,`Latency`,`BOMCost`,`StrongestFit`,`EvidenceStatus`],n=e.map(e=>[`"${e.profile.replace(/"/g,`""`)}"`,`"${e.family.replace(/"/g,`""`)}"`,`"${e.contract.replace(/"/g,`""`)}"`,`"${(e.nodeLens||``).replace(/"/g,`""`)}"`,`"${(e.updateModel||``).replace(/"/g,`""`)}"`,`"${(e.busExposure||``).replace(/"/g,`""`)}"`,`"${(e.latency||``).replace(/"/g,`""`)}"`,`"${(e.bomCost||``).replace(/"/g,`""`)}"`,`"${e.strongestFit.replace(/"/g,`""`)}"`,`"${e.evidenceStatus.replace(/"/g,`""`)}"`]),r=`data:text/csv;charset=utf-8,`+[t.join(`,`),...n.map(e=>e.join(`,`))].join(`
`),i=encodeURI(r),a=document.createElement(`a`);a.setAttribute(`href`,i),a.setAttribute(`download`,`nvm_decision_matrix_profiles.csv`),document.body.appendChild(a),a.click(),document.body.removeChild(a)}function m(e){let t=`data:text/json;charset=utf-8,`+encodeURIComponent(JSON.stringify(e,null,2)),n=document.createElement(`a`);n.setAttribute(`href`,t),n.setAttribute(`download`,`nvm_decision_matrix_profiles.json`),document.body.appendChild(n),n.click(),document.body.removeChild(n)}var h=[`overview`,`whitepaper`,`selector`,`taxonomy`,`templates`],g={phase1:`overview`,phase2:`whitepaper`,matrix:`selector`,phase4:`taxonomy`,phase3:`templates`};function _(){let e=new URLSearchParams(window.location.search).get(`view`)||`overview`;return h.includes(e)?e:g[e]||`overview`}function v(e,{updateHistory:t=!0,focus:n=!1}={}){let r=h.includes(e)?e:`overview`;if(document.querySelectorAll(`.view-tab`).forEach(e=>{let t=e.dataset.view===r;e.setAttribute(`aria-selected`,t?`true`:`false`),e.tabIndex=t?0:-1,t&&n&&e.focus()}),document.querySelectorAll(`.studio-panel`).forEach(e=>{e.hidden=e.id!==`panel-${r}`}),t){let e=new URL(window.location.href);r===`overview`?e.searchParams.delete(`view`):e.searchParams.set(`view`,r),r!==`whitepaper`&&e.hash.startsWith(`#chap-`)&&(e.hash=``),window.history.pushState({view:r},``,`${e.pathname}${e.search}${e.hash}`)}}function y({scrollChapter:e=!1}={}){let t=new URL(window.location.href),n=t.hash.startsWith(`#chap-`),r=t.searchParams.has(`view`),i=_();n&&!r&&(i=`whitepaper`),n&&i!==`whitepaper`&&(t.hash=``,window.history.replaceState({view:i},``,`${t.pathname}${t.search}`)),v(i,{updateHistory:!1}),n&&i===`whitepaper`&&e&&requestAnimationFrame(()=>document.querySelector(window.location.hash)?.scrollIntoView({block:`start`}))}function b(){let e=[...document.querySelectorAll(`.view-tab`)];e.forEach((t,n)=>{t.addEventListener(`click`,()=>v(t.dataset.view)),t.addEventListener(`keydown`,t=>{if(![`ArrowLeft`,`ArrowRight`,`ArrowUp`,`ArrowDown`,`Home`,`End`].includes(t.key))return;t.preventDefault();let r=n;r=t.key===`Home`?0:t.key===`End`?e.length-1:t.key===`ArrowLeft`||t.key===`ArrowUp`?(n-1+e.length)%e.length:(n+1)%e.length,v(e[r].dataset.view,{focus:!0})})}),window.addEventListener(`popstate`,()=>y({scrollChapter:!0}))}function x(){let e=document.querySelector(`#menuToggle`),t=document.querySelector(`#globalNav`),n=(n=!1)=>{t?.classList.remove(`open`),e?.setAttribute(`aria-expanded`,`false`),e?.setAttribute(`aria-label`,`Open navigation`),n&&e?.focus()};e?.addEventListener(`click`,()=>{let n=t.classList.toggle(`open`);e.setAttribute(`aria-expanded`,n?`true`:`false`),e.setAttribute(`aria-label`,n?`Close navigation`:`Open navigation`),n&&t.querySelector(`a`)?.focus()}),t?.addEventListener(`click`,e=>{e.target.closest(`a`)&&n()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&t?.classList.contains(`open`)&&n(!0)}),window.addEventListener(`resize`,()=>{window.matchMedia(`(min-width: 1081px)`).matches&&n()},{passive:!0})}function S(e){let t=document.querySelector(`#toast`);t&&(t.textContent=e,t.classList.add(`show`),window.clearTimeout(S.timer),S.timer=window.setTimeout(()=>t.classList.remove(`show`),2400))}function C(){document.addEventListener(`click`,async e=>{let t=e.target.closest(`[data-copy-outline]`);if(!t)return;let n=t.dataset.copyOutline||``;try{await navigator.clipboard.writeText(n),S(`Template outline copied`)}catch{let e=document.createElement(`textarea`);e.value=n,e.setAttribute(`readonly`,``),e.className=`clipboard-fallback`,document.body.appendChild(e),e.select(),document.execCommand(`copy`),e.remove(),S(`Template outline copied`)}})}document.addEventListener(`DOMContentLoaded`,()=>{t(document.querySelector(`#panel-overview`)),r(document.querySelector(`#panel-whitepaper`)),u(document.querySelector(`#panel-selector`)),c(document.querySelector(`#panel-taxonomy`)),a(document.querySelector(`#panel-templates`)),b(),x(),C(),y({scrollChapter:!0})});const WP_ZH_DICT = {
  "TECHNOLOGY & SELECTION": "技術與架構決策",
  "← PORTFOLIO": "← 作品集",
  "All Topics": "總門戶",
  "Secure Storage": "安全儲存",
  "AI Systems": "AI 與先進節點",
  "Research Library": "研究與證據庫",
  "Skip to main content": "跳至主要內容",
  "NVM Knowledge Hub": "NVM 知識總體系",
  "Knowledge Workbench": "知識決策工作台",
  "Whitepaper Studio": "白皮書決策工作室",
  "NVM KNOWLEDGE WORKBENCH · PUBLIC EDITION": "NVM 知識決策工作台 · 公開版",
  "From NVM technology": "從 NVM 物理技術",
  "to a defensible selection": "到可辯護的架構決策",
  "A governed workspace for technology whitepapers, state-contract trade-offs and SharePoint content models—built around what can be supported, what must be validated and what remains open.": "針對半導體技術白皮書、持久狀態契約權衡與企業 SharePoint 內容模型所構建的受治理工作台——圍繞著何種技術可被支援、何種指標必須驗證、以及何種邊界仍待探索。",
  "Read the whitepaper": "閱讀完整白皮書",
  "Open decision matrix": "開啟架構決策矩陣",
  "PUBLIC WORKING DRAFT": "公開工作草案",
  "Illustrative profiles are decision aids, not product specifications.": "展示設定檔僅作為架構決策輔助，非商業產品保證規格。",
  "Conceptual NVM state-contract map · not a physical floorplan": "概念性 NVM 狀態契約地圖 · 非物理佈局圖",
  "program once · verify always": "單次寫入 · 永久驗證",
  "rare updates · controlled owner": "極低更新 · 受控權威",
  "managed change · recovery path": "受控變更 · 復原路徑",
  "logs · repair · field learning": "運作日誌 · 修復 · 現場學習",
  "IDENTITY": "晶片身分",
  "CALIBRATION": "參數微調",
  "FIRMWARE": "安全韌體",
  "RAS STATE": "RAS 狀態",
  "IMMUTABLE": "不可竄改",
  "BOUNDED": "受限變更",
  "ADAPTIVE": "自適應",
  "OPERATIONAL": "運行維運",
  "NVM SELECTION": "NVM 決策矩陣",
  "STATE": "狀態",
  "CONTRACT": "契約",
  "EVIDENCE · SCOPE · LIMIT": "技術證據 · 範圍 · 邊界",
  "EXPLORE THE WORKBENCH": "探索決策工作台",
  "Each view preserves evidence status and a SharePoint-ready content contract.": "每一種檢視皆完整保留技術證據狀態與 SharePoint 就緒內容契約。",
  "NVM Overview": "NVM 全貌總覽",
  "Technical Whitepaper": "技術白皮書閱讀器",
  "Decision Matrix": "架構決策矩陣",
  "SharePoint Taxonomy": "SharePoint 分類體系",
  "Content Templates": "技術內容範本",
  "Selecting NVM by State Contract, Process Boundary and Evidence": "依狀態契約、製程邊界與證據鏈進行 NVM 架構選型",
  "A public architecture guide for turning persistent-state requirements into defensible technology decisions": "一份將非揮發性持久狀態需求轉化為可辯護技術決策的公開架構指引",
  "Begin With the State Contract": "以狀態契約為決策起點",
  "Map Technology Families to the Contract": "將記憶體技術家族對齊狀態契約",
  "Treat Node Migration as an Integration Decision": "將製程節點微縮視為系統整合決策",
  "Make the Decision Evidence-Aware": "建立具備證據感知能力的架構決策",
  "Transfer the Knowledge, Not Just the Page": "沉澱轉移架構知識，而非僅交付頁面",
  "Start with the available voltage and device stack": "從可用電壓與元件堆疊出發",
  "Treat scaling as an integration-economics boundary": "將製程微縮視為整合經濟學邊界",
  "Decouple read supply from program infrastructure": "將讀取電源與燒錄基礎架構解耦",
  "Move from one macro to a distributed state architecture": "從單一巨集轉向分散式狀態架構",
  "Four persistent-state promises": "四大持久狀態承諾",
  "Compare by fit and boundary": "依適配度與物理邊界比較",
  "What changes as the process changes": "製程演進帶來的架構變化",
  "A repeatable way to select NVM": "可重複驗證的 NVM 選型序列",
  "STATE CONTRACTS": "狀態契約",
  "TECHNOLOGY FAMILIES": "技術家族",
  "PROCESS-NODE LENS": "製程節點視角",
  "DECISION SEQUENCE": "選型序列",
  "CHAPTER INDEX": "章節目錄",
  "ARCHITECTURE TAKEAWAYS": "架構核心結論",
  "EVIDENCE CLASS": "證據等級",
  "LIMITATION": "限制條件",
  "EDITORIAL OWNER": "架構負責人",
  "STATUS": "狀態",
  "REVIEW DATE": "審查日期",
  "PUBLIC EVIDENCE RULE": "公開證據規則",
  "CONTINUE THE EVIDENCE TRAIL": "延伸證據鏈追蹤",
  "Use the Hub to separate source facts from architecture inference": "透過知識庫嚴格區分原始事實與架構推論",
  "Open Evidence Ledger": "開啟 40 筆技術總帳",
  "Review Memory Physics": "查閱記憶體物理機制",
  "PUBLIC WORKBENCH · EVIDENCE-GOVERNED · SHAREPOINT TRANSFER MODEL · 2026": "公開工作台 · 證據治理 · SHAREPOINT 轉移模型 · 2026"
};

function translateWhitepaperDOM(root, lang) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while ((node = walker.nextNode())) {
    const p = node.parentElement;
    if (!p || p.tagName === "SCRIPT" || p.tagName === "STYLE") continue;
    const raw = node.nodeValue.trim();
    if (!raw) continue;
    if (lang === "zh") {
      if (!node._origText) node._origText = node.nodeValue;
      const t = node._origText.trim();
      if (WP_ZH_DICT[t]) {
        node.nodeValue = node._origText.replace(t, WP_ZH_DICT[t]);
      }
    } else if (node._origText) {
      node.nodeValue = node._origText;
    }
  }

  // Translate SVG text
  root.querySelectorAll("text").forEach(st => {
    const raw = st.textContent.trim();
    if (lang === "zh") {
      if (!st._origText) st._origText = raw;
      if (WP_ZH_DICT[st._origText]) st.textContent = WP_ZH_DICT[st._origText];
    } else if (st._origText) {
      st.textContent = st._origText;
    }
  });
}

function w(){
  let btn = document.getElementById("languageToggle");
  let curLang = localStorage.getItem("nvm-language") || "zh";

  function apply(lang){
    curLang = lang;
    localStorage.setItem("nvm-language", lang);
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    document.body.dataset.language = lang;

    if (btn) {
      btn.setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切換至繁體中文");
      const zhB = btn.querySelector('[data-lang-option="zh"]');
      const enB = btn.querySelector('[data-lang-option="en"]');
      if (zhB && enB) {
        zhB.style.color = lang === "zh" ? "#73eee4" : "#8ea9b3";
        enB.style.color = lang === "en" ? "#73eee4" : "#8ea9b3";
      }
    }

    translateWhitepaperDOM(document.body, lang);
  }

  btn?.addEventListener("click", (e) => {
    e.preventDefault();
    apply(curLang === "zh" ? "en" : "zh");
  });

  // Observe dynamically rendered panels
  const panels = document.querySelector(".studio-panels");
  if (panels) {
    const obs = new MutationObserver(() => {
      if (curLang === "zh") translateWhitepaperDOM(panels, "zh");
    });
    obs.observe(panels, { childList: true, subtree: true });
  }

  // Also hook view tabs
  document.querySelectorAll(".view-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      setTimeout(() => {
        if (curLang === "zh") translateWhitepaperDOM(panels, "zh");
      }, 50);
    });
  });

  // Apply default language
  apply(curLang);
}
document.addEventListener("DOMContentLoaded", w);