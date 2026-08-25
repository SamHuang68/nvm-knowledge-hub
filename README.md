# NVM Knowledge Hub

An NVM-centered, evidence-governed knowledge system designed for later migration into an enterprise SharePoint Knowledge Hub. Secure Storage and AI Systems are the first two application lenses—not competing site roots.

## Run locally

From the `site` directory (Node.js):

```powershell
npm ci
npm run serve
```

Open `http://127.0.0.1:8765/`.

## Experience modules

- Neutral Hub home with equal, one-click entrances to Secure Storage and AI Systems & NVM.
- Cross-topic NVM Whitepaper & Decision Studio for governed comparison, authoring and SharePoint transfer.
- Consistent `Knowledge Hub → Topic → Research asset` navigation, breadcrumbs and legacy deep-link routing.
- Cinematic Secure Storage hero with project-owned artwork.
- Persistent Traditional Chinese / English language switch.
- Paper-grade bilingual Memory Physics research note covering SRAM, OTP, sensing, optical/thermal leakage and attack windows.
- Searchable 27-record Evidence Ledger spanning peer-reviewed papers, patents, foundry records, vendor disclosures and an official case study.
- Interactive power-off / power-up security-state lab.
- Threat-to-product journey using RP2350 as a supporting signal.
- Clickable SRAM PUF + AES-256 + OTP + controller architecture.
- Root-key lifecycle explorer.
- PUF-level and product-level competitor comparison.
- Field-evidence, TSMC node and application visualizations.
- Searchable Secure Storage learning path and article library.
- Public-source and claim-discipline section.
- Physical Security Assurance center covering FI, SCA, invasive analysis, attack windows, countermeasure evidence, certification routing and role-based learning.
- OIP Secure Storage brief connecting RP2350 threat evidence, SRAM-PUF root reconstruction, AES-256 protected OTP, node readiness and explicit validation gates.
- Bilingual AI Systems NVM Opportunities topic mapping OTP/MTP use cases, evidence boundaries and target-validation needs across AI accelerators, silicon photonics, repair, security and RAS.
- SharePoint/Copilot-ready knowledge schema in `data/assurance-knowledge-schema.json`, with the List field map in `data/sharepoint-field-map.md`.
- Governed OIP claim records in `data/oip-secure-storage-knowledge.json` for SharePoint import and presentation grounding.
- Governed AI opportunity records in `data/ai-nvm-opportunities-knowledge.json`, validated by `data/ai-nvm-opportunities-schema.json`, with PDF page/figure locators retained for source-traceable SharePoint and Copilot answers.

## Information architecture

| Level | Route | Responsibility |
|---|---|---|
| L0 | `index.html` | Neutral NVM Knowledge Hub and topic map |
| L1 | `secure-storage.html` | Secure Storage architecture, assurance and learning |
| L1 | `ai-nvm-opportunities.html` | AI-system persistent-state opportunity map |
| Workbench | `https://samhuang68.github.io/nvm-whitepaper-site/` | Cross-topic whitepaper, selection and SharePoint authoring studio |
| L2 | `memory-physics.html` | Memory physics and security research |
| L2 | `memory-evidence.html` | Evidence Ledger |
| L2 | `security-assurance.html` | Physical Security Assurance center |
| L2 | `oip-secure-storage.html` | OIP Secure Storage knowledge brief |

The NVM brand always resolves to L0. `All Topics` resolves to `index.html#topics`; topic badges and breadcrumbs provide the local context. Historic Secure Storage hashes on `index.html` are redirected by `hub.js` to their matching anchors on `secure-storage.html`.

## Governed data workflow

`data/oip-secure-storage-knowledge.json` is the canonical OIP claim source. Regenerate the SharePoint CSV after any record edit, then verify that the export is current:

```powershell
node scripts/build-oip-sharepoint.mjs
node scripts/build-oip-sharepoint.mjs --check
```

The AI Systems topic has an independent canonical package and deterministic export so its opportunity fields do not weaken the security-specific OIP schema:

```powershell
node scripts/build-ai-nvm-sharepoint.mjs
node scripts/build-ai-nvm-sharepoint.mjs --check
node scripts/check-ai-nvm-integrity.mjs
```

The integrity check validates local page, image and stylesheet targets; fragment IDs; bilingual pairs; governed record references; PDF source locators; unique AI record IDs; and CSV freshness.

Keep `EvidenceClass` (how a source supports a claim) separate from `AssuranceMaturity` (how far validation has progressed). Copilot answers must carry each claim's scope, limitation, source, review date, and open question.

## Design system

- **Executive Silicon:** deep navy, wafer cyan and restrained copper.
- **Typography:** Segoe UI / Microsoft JhengHei throughout, with scale and weight—not a conflicting display serif—providing emphasis.
- **Semantic colors:** cyan = Synopsys/volatile root; copper = persistent physical state; red = attack path; green = protected outcome.
- **Icon language:** single-stroke, rounded technical symbols implemented as reusable inline SVG.

## PowerPoint reuse map

| Website module | Presentation use |
|---|---|
| Hero artwork and headline | Cover and closing frame |
| Power-state lab | Power-off thesis / root-key lifecycle |
| Threat-to-product journey | RP2350 / product-development trigger |
| Four-block architecture | Secure Storage architecture hero slide |
| PUF comparison | SRAM PUF vs. NeoPUF decision slide |
| Evidence numbers | Maturity and field-proof slide |
| Wafer node map | TSMC OIP readiness slide |
| Application cards | AI/HPC, automotive, aerospace and IoT outcomes |

## Source discipline

Visible claims are based on public Synopsys, PUFsecurity/eMemory, Raspberry Pi and Wikipedia/ISO sources. NDA-only implementation details and independent attack-evidence claims are intentionally not invented.
