export const phase1KnowledgeBase = {
  stateContracts: [
    {
      id: 'identity',
      number: '01',
      contract: 'Immutable identity',
      role: 'Device identity, lifecycle state and boot trust anchors',
      owner: 'Provisioning authority',
      updateCadence: 'Program once; verify throughout life',
      selectionQuestion: 'Can the state ever be rotated, revoked or recovered?',
      evidenceBoundary: 'Threat model and provisioning flow must be explicit before selecting OTP.'
    },
    {
      id: 'calibration',
      number: '02',
      contract: 'Bounded calibration',
      role: 'Trim, remap, analog compensation and configuration',
      owner: 'Manufacturing or hardware controller',
      updateCadence: 'Rare, controlled updates',
      selectionQuestion: 'How many updates are required after test, package and field aging?',
      evidenceBoundary: 'Endurance, write energy and high-voltage availability are use-case specific.'
    },
    {
      id: 'firmware',
      number: '03',
      contract: 'Adaptive firmware',
      role: 'Boot code, patches, policy and feature configuration',
      owner: 'Secure update service',
      updateCadence: 'Managed change with rollback or recovery',
      selectionQuestion: 'Does capacity and update frequency justify an embedded array?',
      evidenceBoundary: 'Separate code-storage needs from immutable security state.'
    },
    {
      id: 'operations',
      number: '04',
      contract: 'Operational evidence',
      role: 'Repair history, RAS logs, counters and field learning',
      owner: 'Platform controller',
      updateCadence: 'Repeated writes over system life',
      selectionQuestion: 'Which state must survive power loss, service events or module replacement?',
      evidenceBoundary: 'System retention and recovery may be more important than bit-cell density.'
    }
  ],

  technologyFamilies: [
    {
      family: 'OTP',
      mechanism: 'One-time physical state transition',
      strongestFit: 'Immutable and monotonic state',
      processLens: 'Broad logic-node reach; implementation is provider specific',
      limit: 'A written bit cannot become an update policy by itself',
      status: 'Architecture baseline'
    },
    {
      family: 'MTP / EEPROM class',
      mechanism: 'Reprogrammable charge-based state',
      strongestFit: 'Bounded calibration and small firmware state',
      processLens: 'High-voltage and oxide options constrain portability',
      limit: 'Endurance, programming supply and retention must be jointly qualified',
      status: 'Public evidence needed per process'
    },
    {
      family: 'Embedded Flash',
      mechanism: 'Dedicated embedded charge-storage integration',
      strongestFit: 'Code-rich embedded systems',
      processLens: 'Commercial fit is shaped by mask cost and process-development complexity',
      limit: 'Node migration is an economics and integration decision—not a simple shrink',
      status: 'Node-specific decision'
    },
    {
      family: 'MRAM / ReRAM',
      mechanism: 'Magnetic or resistive state',
      strongestFit: 'Advanced-node embedded NVM where available',
      processLens: 'Foundry module, density and qualification status dominate',
      limit: 'Availability does not automatically establish application readiness',
      status: 'Evidence varies by platform'
    },
    {
      family: 'SRAM PUF + crypto',
      mechanism: 'Power-up-derived secret plus cryptographic protection',
      strongestFit: 'Companion security layer above persistent ciphertext',
      processLens: 'System architecture rather than a peer storage medium',
      limit: 'Reliability, helper data and attack assurance still require validation',
      status: 'Companion architecture'
    }
  ],

  processLenses: [
    {
      range: 'MATURE & SPECIALTY',
      title: 'Start with the available voltage and device stack',
      body: 'For power, BCD, sensor and interface products, I/O devices and programming-voltage generation often define the feasible NVM set before density does.',
      decision: 'Validate I/O voltage, charge pump, test flow and retention together.'
    },
    {
      range: 'eFLASH TRANSITION',
      title: 'Treat scaling as an integration-economics boundary',
      body: 'Conventional embedded-flash commercialization is widely associated with the 28 nm generation. Crossing that boundary is not a hard physics cliff; mask count, development effort and manufacturing economics shape adoption.',
      decision: 'Keep vendor-specific mask-stack detail in the internal evidence layer.'
    },
    {
      range: 'ADVANCED NODE',
      title: 'Decouple read supply from program infrastructure',
      body: 'A single-VDD read path can simplify always-on and low-voltage domains, while programming may still require an I/O-derived foundation for an internal charge pump.',
      decision: 'Specify read and program power contracts separately.'
    },
    {
      range: 'LEADING EDGE & CHIPLET',
      title: 'Move from one macro to a distributed state architecture',
      body: 'Identity, repair, calibration, firmware and operational logs may reside in different dies or controllers. The selection unit becomes the system state contract, not a single NVM array.',
      decision: 'Define ownership, trust boundary and recovery before technology.'
    }
  ],

  selectionSequence: [
    { step: '01', name: 'Name the state', detail: 'What survives power loss—and why?' },
    { step: '02', name: 'Assign ownership', detail: 'Who may create, update, revoke or recover it?' },
    { step: '03', name: 'Constrain the process', detail: 'Which node, voltage and integration options actually exist?' },
    { step: '04', name: 'Close the evidence gap', detail: 'What is sourced, inferred or still target-silicon dependent?' }
  ]
};
