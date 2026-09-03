export const phase4Metadata = {
  canonicalFields: [
    { field: 'Technology Family', purpose: 'OTP, MTP, eFlash, MRAM, ReRAM or companion primitive', example: 'OTP' },
    { field: 'State Contract', purpose: 'Persistence promise and update semantics', example: 'Immutable identity' },
    { field: 'Application Domain', purpose: 'System context that gives the state meaning', example: 'Secure boot' },
    { field: 'Process Node', purpose: 'Node or platform boundary without implying qualification', example: 'Advanced-node logic' },
    { field: 'Evidence Class', purpose: 'Direct, supported, inferred or open gap', example: 'Architecture inference' },
    { field: 'Source', purpose: 'Public URL, document ID or restricted-library reference', example: 'Public evidence ledger' },
    { field: 'Limitation', purpose: 'What the evidence does not establish', example: 'Target-silicon PVT pending' },
    { field: 'Review Status', purpose: 'Draft, reviewed, approved or evidence required', example: 'Evidence required' }
  ],
  operationalFields: [
    'Asset Type', 'Audience', 'Content Owner', 'Visibility', 'Last Reviewed', 'Migration ID'
  ],
  publicRecords: [
    {
      id: 'PUB-NVM-001',
      title: 'Immutable Device Identity Architecture',
      technology: 'OTP + companion key derivation',
      contract: 'Immutable identity',
      domain: 'Secure boot',
      node: 'Node-specific implementation',
      evidence: 'Architecture inference',
      status: 'Public review complete',
      limitation: 'Target-silicon security assurance remains implementation specific'
    },
    {
      id: 'PUB-NVM-002',
      title: 'Bounded Calibration Selection Note',
      technology: 'OTP or MTP',
      contract: 'Bounded calibration',
      domain: 'Power and mixed signal',
      node: 'Specialty or mature logic',
      evidence: 'Supported synthesis',
      status: 'Evidence required',
      limitation: 'Programming voltage and endurance need platform confirmation'
    },
    {
      id: 'PUB-NVM-003',
      title: 'AI Package Persistent-State Map',
      technology: 'Portfolio decision',
      contract: 'Operational evidence',
      domain: 'AI systems',
      node: 'Multi-die and advanced-node',
      evidence: 'Architecture inference',
      status: 'Public working draft',
      limitation: 'Component ownership varies by platform architecture'
    }
  ]
};
