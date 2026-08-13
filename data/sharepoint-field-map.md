# SharePoint / Copilot field map

| JSON field | SharePoint column | Type | Copilot use |
|---|---|---|---|
| title | Title | Single line text | Result heading |
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

Copilot grounding rule: never return `SecurityClaim` alone. Always return `SourceURL`, `AssuranceScope`, `ClaimStatus`, `Limitation`, `ReviewedDate`, and `OpenQuestion` when available.
