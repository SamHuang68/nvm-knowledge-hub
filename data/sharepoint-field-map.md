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
| evidenceLevel | EvidenceLevel | Number | Evidence ranking |
| scope | AssuranceScope | Choice | Applicability boundary |
| applicability | Applicability | Multiple lines | What the claim covers |
| limitation | Limitation | Multiple lines | Required answer caveat |
| openQuestion | OpenQuestion | Multiple lines | Unknowns disclosure |
| sourceUrl | SourceURL | Hyperlink | Citation |
| reviewedDate | ReviewedDate | Date | Freshness check |
| owner | ContentOwner | Person | Review workflow |
| classification | Classification | Choice | Public/Internal/NDA access |
| audience | Audience | Multi-choice | OIP, architecture, product-security and training targeting |
| presentationRole | PresentationRole | Choice | Maps governed content into the OIP narrative |
| oipRelevance | OIPRelevance | Multiple lines | Explains why the record matters to the platform conversation |

Copilot grounding rule: never return `SecurityClaim` alone. Always return `SourceURL`, `AssuranceScope`, `ClaimStatus`, `Limitation`, `ReviewedDate`, and `OpenQuestion` when available.

## Recommended SharePoint structure

- **NVM Knowledge Records** — one item per governed claim; import `oip-secure-storage-knowledge.json` records here.
- **NVM Source Library** — public PDFs, product pages, internal reports and NDA collateral with classification and retention metadata.
- **NVM Topic Pages** — authored SharePoint pages that query governed records by `ContentType`, `Topic`, `Audience` and `PresentationRole`.
- **NVM Review Queue** — Power Automate review workflow driven by `ReviewedDate`, `ClaimStatus`, `Classification` and `ContentOwner`.

For the OIP topic page, filter `Audience` for `TSMC OIP`, group by `PresentationRole`, and display `Limitation` and `OpenQuestion` beside every externally visible claim. Copilot must respect SharePoint permissions and must not combine Public, Internal and NDA evidence into a response unless the requesting user is authorized for every cited record.
