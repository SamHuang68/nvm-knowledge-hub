# NVM Knowledge Hub · Secure Storage

Executive learning prototype for positioning Synopsys Secure Storage and SRAM-PUF-protected OTP.

## Run locally

From the `site` directory:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`.

## Experience modules

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
