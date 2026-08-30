# SharePoint / Copilot field map

| JSON field | SharePoint column | Type | Copilot use |
|---|---|---|---|
| recordId | RecordID | Single line text, unique | Stable citation and update key |
| title | Title | Single line text | Result heading |
| contentType | ContentType | Choice | Page, evidence, case-study and presentation routing |
| topic | Topic | Choice | Topic routing |
| asset | SecurityAsset | Choice | Asset filtering |
| attackClass | AttackClass | Multi-choice | Threat lookup |
| lifecyclePhase | LifecyclePhase | Multi-choice | Window lookup |
| claim | SecurityClaim | Multiple lines | Answer body |
| claimStatus | ClaimStatus | Choice | Confidence label |
| evidenceClass | EvidenceClass | Choice | How the source supports the claim; not an ordinal |
| assuranceMaturity | AssuranceMaturity | Choice | Claimed → specified → tested → evaluated → certified → field-proven |
| scope | AssuranceScope | Choice | Applicability boundary |
| applicability | Applicability | Multiple lines | What the claim covers |
| limitation | Limitation | Multiple lines | Required answer caveat |
| openQuestion | OpenQuestion | Multiple lines | Unknowns disclosure |
| sourceUrl | SourceURL | Hyperlink | Citation |
| sourceOwner | SourceOwner | Single line text | Source attribution and stewardship |
| publishedDate | PublishedDate | Date | Source chronology |
| reviewedDate | ReviewedDate | Date | Freshness check |
| owner | ContentOwnerKey | Single line text | Stable owner label before corporate identity resolution |
| — | ContentOwnerUPN | Person | Resolve during company migration; not populated by the public CSV until a corporate UPN is assigned |
| classification | Classification | Choice | Public/Internal/NDA access |
| audience | Audience | Multi-choice | OIP, architecture, product-security and training targeting |
| presentationRole | PresentationRole | Choice | Maps governed content into the OIP narrative |
| oipRelevance | OIPRelevance | Multiple lines | Explains why the record matters to the platform conversation |

## Shared core and domain extensions

Use one **NVM Knowledge Records** List for cross-topic retrieval, but keep separate deterministic JSON/CSV exporters for each topic. Both packages govern stable record identity, bilingual or display title, content type, topic, asset, lifecycle phase, claim status, evidence class, assurance maturity, scope, applicability, limitation, open question, source provenance, review date, owner, classification, audience and presentation role.

The public JSON packages intentionally keep separate schemas because their enum vocabularies differ. Secure Storage uses security assets and attack windows; AI Systems uses platform layers, persistence classes and opportunity boundaries. The SharePoint columns may be shared, but an importer must not invent placeholder security values for an AI record or collapse the two domains into one confidence score.

For the AI Systems package, configure `EvidenceClass` with six non-ordinal choices: `DIRECT_REQUIREMENT`, `FIRST_PARTY_CASE`, `TECHNICAL_EVIDENCE`, `VENDOR_CAPABILITY`, `INFERRED_OPPORTUNITY`, and `VALIDATION_NEEDED`. `TECHNICAL_EVIDENCE` is reserved for peer-reviewed implementations or independent physical analysis that directly supports a mechanism or constraint; it must not be silently recast as a first-party product case.

An exact standards clause that explicitly defines a function or state contract qualifies as `DIRECT_REQUIREMENT`. A product document showing one commercial implementation remains `FIRST_PARTY_CASE` unless a standard independently mandates that physical medium. For example, JEDEC directly defines MTP NVM in the DDR5 PMIC and rewritable NVM in the DDR5 SPD Hub, while a BMC product brief that integrates OTP and PUF proves productization—not a universal PUF mandate. Keep the standard behavior, implementation technology and target-macro qualification as separate fields and claims.

### AI Systems opportunity extensions

| JSON field | SharePoint column | Type | Copilot use |
|---|---|---|---|
| titleEn / titleZh | Title / TitleZH | Single line text | Preserves bilingual result headings without runtime translation |
| claimEn / claimZh | SecurityClaim / SecurityClaimZH | Multiple lines | Bilingual answer body |
| applicabilityEn / applicabilityZh | Applicability / ApplicabilityZH | Multiple lines | Bilingual applicability boundary |
| limitationEn / limitationZh | Limitation / LimitationZH | Multiple lines | Bilingual mandatory caveat |
| openQuestionEn / openQuestionZh | OpenQuestion / OpenQuestionZH | Multiple lines | Bilingual unresolved validation need |
| oipRelevanceEn / oipRelevanceZh | OIPRelevance / OIPRelevanceZH | Multiple lines | Bilingual platform and OIP relevance |
| sourceLocator | SourceLocator | Single line text | Page, figure, table or section supporting the claim |
| systemLayer | SystemLayer | Choice | Photonic engine, platform management, trust, repair, power or interconnect routing |
| persistenceClass | PersistenceClass | Choice | Immutable, bounded mutable, high-rate stream, external/bulk or unspecified |
| storageCandidate | StorageCandidate | Multi-choice | Candidate architecture; never presented as a source requirement by itself |
| evidenceDisposition | EvidenceDisposition | Choice | Source Requirement, Official Product Case, Technical Evidence, Vendor Disclosure, Bounded Architecture Inference or Validation Gate; not a portfolio decision |
| opportunityStatus | OpportunityStatus | Choice, deprecated alias | Compatibility only; retains legacy labels and must not be interpreted as GO/GATE/SCREEN/EXCLUDE |
| evidenceBoundaryEn / evidenceBoundaryZh | EvidenceBoundaryEN / EvidenceBoundaryZH | Multiple lines | States precisely what the source proves and what remains inferred |
| chapterRefs | ChapterRefs | Multi-choice | Connects governed records to authored topic sections |
| isInference | IsInference | Yes/No | Hard guard against presenting an inferred placement as a requirement |
| sourceGroundedEligible | SourceGroundedEligible | Yes/No | Includes standards, official cases, technical evidence and vendor disclosures while excluding bounded inference |
| proofModeEligible | ProofModeEligible | Yes/No, deprecated alias | Compatibility only; mirrors SourceGroundedEligible and must not be described as independent proof |
| researchFreeze | ResearchFreeze | Date | Records the research cutoff applied to every exported row |
| sourceDocument.sha256 | SourceDocumentSHA256 | Single line text | Binds supplied-PDF claims to the reviewed document version |

Copilot grounding rule: never return `SecurityClaim` alone. Always return `SourceURL`, `AssuranceScope`, `ClaimStatus`, `EvidenceClass`, `AssuranceMaturity`, `Limitation`, `ReviewedDate`, and `OpenQuestion` when available. `EvidenceClass` describes source relationship; `AssuranceMaturity` describes validation progress. Never rank or merge them into one number.

## Recommended SharePoint structure

- **NVM Knowledge Records** — one item per governed claim; import `oip-secure-storage-knowledge.json` records here.
- **NVM Source Library** — public PDFs, product pages, internal reports and NDA collateral with classification and retention metadata.
- **NVM Topic Pages** — authored SharePoint pages that query governed records by `ContentType`, `Topic`, `Audience` and `PresentationRole`.
- **NVM Review Queue** — Power Automate review workflow driven by `ReviewedDate`, `ClaimStatus`, `Classification` and `ContentOwner`.

For the OIP topic page, filter `Audience` for `TSMC OIP`, group by `PresentationRole`, and display `Limitation` and `OpenQuestion` beside every externally visible claim. Copilot must respect SharePoint permissions and must not combine Public, Internal and NDA evidence into a response unless the requesting user is authorized for every cited record.

For the AI Systems topic page, filter the AI import by `Topic`, `SystemLayer`, `EvidenceDisposition` and `PresentationRole`; the SharePoint migration may additionally stamp fixed `KnowledgeDomain = AI Systems` and `TopicSlug = ai-nvm-opportunities` values. A PDF-derived answer must include `SourceLocator`; an opportunity inference must also expose `EvidenceBoundary`, `Limitation`, `OpenQuestion`, `EvidenceClass` and `AssuranceMaturity`. After company migration, resolve `SourceURL` or the supplied-document provenance to the governed file in **NVM Source Library** and populate `ContentOwnerUPN` without changing the stable `RecordID`.

### Company-only decision and responsibility extension

The public package deliberately stops at evidence, candidate fit, limitation and validation gate. Add the following columns only in the authorized company SharePoint layer; do not populate them in the public CSV and do not derive them automatically from `EvidenceClass` or `EvidenceDisposition`.

| SharePoint column | Type | Internal purpose |
|---|---|---|
| PortfolioDisposition | Choice: GO / GATE / SCREEN / EXCLUDE | Explicit portfolio decision |
| DispositionRationale | Multiple lines | Evidence-backed reason for the internal decision |
| CommercialStage | Choice | Candidate, qualification, design-in, design win, shipment or contract-defined revenue state |
| SystemResponsibilityOwner | Person or Group | Owner of system integration and architecture closure |
| QualificationOwner | Person or Group | Owner of target-node, PVT, reliability and security qualification |
| NextActionOwner | Person or Group | Accountable owner for the next validation or customer action |

Copilot must not call a candidate socket a design win, shipment or royalty unit unless the authorized internal record explicitly supplies that commercial stage.
