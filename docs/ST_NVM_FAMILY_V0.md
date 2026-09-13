# st-nvm-family-v0 · NVM Technology Taxonomy

Host gate: **TAXONOMY ACCEPT** on `st-nvm-family-v0` (Sam GO).

This taxonomy drives the comparison matrix on `technology-comparison.html`. Figures in the matrix are **architecture-class** ranges with **VERIFY** footnotes — not named-macro datasheets.

## Five buckets · eleven leaf columns

| Bucket | Leaf columns | Notes |
|--------|--------------|-------|
| **Foundry process** | eFuse · Mask ROM · EEPROM-DP | Foundry-integrated or mask-defined paths |
| **OTP** | FG-OTP · **AntiFuse** | **Never merge** FG-OTP and AntiFuse into one OTP column |
| **MTP** | LD-MTP (FN/FN) · HD-MTP (CHI/FN) | Low-disturb vs hot-carrier-injection write |
| **eFlash** | SST · SONOS | Split-gate floating gate vs charge-trap |
| **Emerging** | ReRAM · MRAM | BEOL resistive and magnetic NVM |

## Matrix rows (scannable)

1. Mask adders
2. Cell area class
3. **PGM/ERS mechanism** (mandatory)
4. Program V/I (process-set)
5. Retention class
6. Read latency (array / SA)
7. Endurance
8. Scaling
9. Anti-tamper geometry (no Blind / immune absolutes)

## MUST KEEP hedges

- Zero extra masks ≠ free wafers
- AntiFuse Vpgm is **not** fixed 2.8–3.5 V
- I/O FG HCI ≠ AntiFuse (footnote only)
- Architecture-class ≠ datasheet; not shipment proof
- TEM / DPA = attenuation geometry, not absolute immunity
- No **Grade 0 Qualified**, **Unlimited Cycles**, or **TEM Invisibility** absolutes

## Column migration (legacy → v0)

| Legacy column | v0 destination |
|---------------|----------------|
| AntiFuse OTP (merged) | **AntiFuse** (OTP bucket) |
| eFuse | **eFuse** (Foundry process) |
| eFlash (merged) | **SST** and **SONOS** (eFlash bucket) |
| STT-eMRAM | **MRAM** (Emerging) |
| eRRAM (OxRAM) | **ReRAM** (Emerging) |
| Mask ROM | **Mask ROM** (Foundry process) |
| *(new)* | **FG-OTP**, **EEPROM-DP**, **LD-MTP**, **HD-MTP** |

## Scrap removed

- `OTP ARCHITECTURE` header label under AntiFuse
- Orphan `not I/O FG HCI` as a bare cell note (meaning kept in footnote)
- Orphan `Opens on 1.8 V-class…` as sole cell slogan (moved to footnote)
