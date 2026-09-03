export const phase2Whitepaper = {
  title: 'Selecting NVM by State Contract, Process Boundary and Evidence',
  subtitle: 'A public architecture guide for turning persistent-state requirements into defensible technology decisions',
  author: 'NVM Knowledge Hub Editorial System',
  version: 'Public working draft',
  publishDate: 'Reviewed 2026-08-25',
  chapters: [
    {
      id: 'state-contract',
      number: '01',
      title: 'Begin With the State Contract',
      lede: 'The first decision is not OTP versus MTP. It is the promise the system must keep after power is removed.',
      paragraphs: [
        'Persistent state carries an owner, update cadence, retention obligation, recovery rule and threat boundary. Two bit arrays of similar size can therefore require very different architectures: an immutable lifecycle transition is not governed like a field-updatable calibration table.',
        'A useful state contract names who may create the state, when it may change, which failures must be recoverable and what evidence proves the contract across process, voltage, temperature and lifecycle conditions.'
      ],
      takeaways: ['Define state before technology', 'Separate immutability from update policy', 'Treat recovery as part of retention'],
      evidenceClass: 'Architecture principle',
      limitation: 'Implementation targets still require product- and process-specific validation.'
    },
    {
      id: 'technology-boundaries',
      number: '02',
      title: 'Map Technology Families to the Contract',
      lede: 'Each NVM family expresses a different compromise among permanence, updates, density, voltage and process integration.',
      paragraphs: [
        'OTP is naturally aligned with immutable or monotonic state. MTP and EEPROM-class structures support bounded changes but introduce endurance, programming-energy and high-voltage questions. Embedded Flash addresses code-rich systems where its process integration is economically justified. MRAM and ReRAM extend the advanced-node portfolio, but availability and qualification remain platform specific.',
        'SRAM PUF is a companion security primitive rather than a peer non-volatile medium. It can derive a device-unique root secret at power-up so persistent memory stores ciphertext or helper data instead of a reusable root key. That architecture raises assurance requirements of its own; it does not erase them.'
      ],
      takeaways: ['Do not model PUF as stored NVM', 'Qualify program and read paths separately', 'Avoid technology labels without a state owner'],
      evidenceClass: 'Supported architecture synthesis',
      limitation: 'Technology availability, reliability and security claims vary by supplier and target process.'
    },
    {
      id: 'node-boundary',
      number: '03',
      title: 'Treat Node Migration as an Integration Decision',
      lede: 'NVM scaling is shaped by device options, mask economics, program voltage and qualification effort—not geometry alone.',
      paragraphs: [
        'Floating-gate MTP relies on an oxide and high-voltage environment capable of preserving programmed charge. A process portfolio that only exposes lower-voltage devices can therefore narrow implementation choices. Dedicated embedded-flash integration can introduce a purpose-built oxide, but additional process complexity changes the commercial equation.',
        'The frequently cited 28 nm boundary for conventional embedded Flash is best read as a clear public commercialization high point, not a law of physics. Beyond it, development difficulty, mask-stack expansion and cost can outweigh the benefit. At more advanced nodes, foundry roadmaps increasingly turn to MRAM or ReRAM, while logic-compatible OTP continues to serve small persistent-state needs.',
        'For advanced-node OTP, a single-VDD read mode can reduce always-on power-domain dependencies and simplify power sequencing. Programming can remain a separate event that uses an I/O supply as the foundation for an internal charge pump. Public architecture should state that separation without disclosing proprietary circuit detail.'
      ],
      takeaways: ['Node names are not portability proof', 'Separate read simplification from program infrastructure', 'Model mask and qualification cost as system constraints'],
      evidenceClass: 'Industry synthesis + expert calibration',
      limitation: 'Vendor-specific voltage coverage, mask counts and product roadmaps require internal portfolio evidence before customer use.'
    },
    {
      id: 'decision-evidence',
      number: '04',
      title: 'Make the Decision Evidence-Aware',
      lede: 'A decision matrix is useful only when it makes uncertainty visible instead of converting assumptions into specifications.',
      paragraphs: [
        'Public evidence can establish mechanisms, disclosed product availability and demonstrated use cases. Supplier claims may describe performance or qualification. Architecture inference can connect those facts to a system proposal. Target-silicon evidence is still required to close PVT, retention, endurance, power and attack-resilience claims for a specific implementation.',
        'Every comparison row should therefore carry a source class, scope, limitation, review status and next validation action. Unsupported precision should be removed; a categorical range with an explicit evidence gap is more trustworthy than an exact number without provenance.'
      ],
      takeaways: ['Never let UI polish promote an assumption to fact', 'Bind every claim to scope and limitation', 'Use open gaps to drive the next validation action'],
      evidenceClass: 'Evidence governance method',
      limitation: 'This public workbench intentionally excludes confidential qualification and customer data.'
    },
    {
      id: 'enterprise-transfer',
      number: '05',
      title: 'Transfer the Knowledge, Not Just the Page',
      lede: 'SharePoint migration succeeds when content has a stable contract before it enters the corporate system.',
      paragraphs: [
        'The canonical record begins with Technology Family, State Contract, Application Domain and Process Node. Evidence Class, Source, Limitation and Review Status make the record governable. Operational fields such as owner, visibility, review date and migration ID make it maintainable.',
        'The public site supplies a clean knowledge spine. The internal SharePoint version can add confidential product data, foundry qualification, customer context and validation artifacts without changing the information architecture. Copilot then operates over governed metadata rather than an unstructured document dump.'
      ],
      takeaways: ['Preserve the eight-field content contract', 'Keep public and restricted evidence separate', 'Make review status machine-readable'],
      evidenceClass: 'Enterprise content architecture',
      limitation: 'Final column types, permissions and retention policies must align with the company tenant.'
    }
  ]
};
