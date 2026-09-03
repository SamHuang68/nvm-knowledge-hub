export const phase3Templates = [
  {
    id: 'architecture-brief',
    type: 'Architecture Brief',
    title: 'NVM State-Contract Brief',
    targetAudience: 'System architects · Product managers',
    summary: 'Frame a persistent-state problem before proposing an IP or memory family.',
    sections: [
      { heading: 'System state', body: 'Name the state, owner, update cadence and power-off obligation.' },
      { heading: 'Architecture choice', body: 'Compare candidate NVM families and companion controls.' },
      { heading: 'Evidence boundary', body: 'Separate source-backed facts, inference and target-silicon gaps.' },
      { heading: 'Decision', body: 'Record the preferred architecture, rejected alternatives and validation owner.' }
    ]
  },
  {
    id: 'technology-note',
    type: 'Technical Note',
    title: 'Technology Boundary Review',
    targetAudience: 'NVM engineers · Process integration teams',
    summary: 'Explain a mechanism and its node, voltage, retention and integration constraints without overstating readiness.',
    sections: [
      { heading: 'Mechanism', body: 'Describe the stored physical variable and read observable.' },
      { heading: 'Process boundary', body: 'Identify required devices, voltages, modules and test assumptions.' },
      { heading: 'Reliability contract', body: 'Define required retention, endurance and environmental scope.' },
      { heading: 'Open evidence', body: 'List missing supplier, PDK, silicon or qualification evidence.' }
    ]
  },
  {
    id: 'selection-record',
    type: 'Decision Record',
    title: 'NVM Selection Decision Record',
    targetAudience: 'Architecture review boards · Marketing teams',
    summary: 'Capture why one technology was selected for one state contract at one process boundary.',
    sections: [
      { heading: 'Decision context', body: 'Application, state contract, node and business constraint.' },
      { heading: 'Options', body: 'Candidate families with strengths, limits and evidence class.' },
      { heading: 'Decision rationale', body: 'Trade-off logic and assumptions that materially affect the choice.' },
      { heading: 'Review trigger', body: 'Event or new evidence that requires the decision to be revisited.' }
    ]
  },
  {
    id: 'evidence-entry',
    type: 'Evidence Entry',
    title: 'Claim-to-Evidence Ledger Entry',
    targetAudience: 'Editors · Validation owners · Copilot users',
    summary: 'Turn a statement into a reviewable knowledge record ready for public or restricted SharePoint libraries.',
    sections: [
      { heading: 'Claim', body: 'Use the narrowest wording supported by the evidence.' },
      { heading: 'Source and class', body: 'Record origin, date and whether evidence is direct, supported or inferred.' },
      { heading: 'Scope and limitation', body: 'State what the source does not prove.' },
      { heading: 'Review status', body: 'Assign owner, next action and review date.' }
    ]
  }
];
