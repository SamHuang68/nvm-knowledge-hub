# Mask adder evidence · st-nvm-family-v0

Host gate: **ACCEPT** on mask-row revision for `technology-comparison.html`.

Figures in the matrix **Mask Adders** row are **architecture-class** ranges with **VERIFY** footnotes — not foundry PDK quotes. **Zero extra masks ≠ free wafers** (cost identity unchanged).

## Leaf guidance (v0 columns)

| Leaf | Cell | Evidence / notes |
|------|------|------------------|
| eFuse | +0 | Foundry-standard integration |
| Mask ROM | 0–1 | Via/contact pattern only |
| EEPROM-DP | VERIFY | Extra double-poly / module layers — count per PDK; **do not hard-code +4–8** |
| FG-OTP | +0 | Logic-IP class; VERIFY per PDK |
| AntiFuse | +0 | Logic-IP class; VERIFY per PDK |
| LD-MTP | Typically +0 | e.g. NeoEE-class; **not universally always +0** — VERIFY |
| HD-MTP | +0 ~ +2 (vendor-split) | Impinj/AEON-class +0; YMC +0–2; eMemory NeoMTP baseline +0 / **gen2 +2** |
| SST | +4 / VERIFY / +10 | **Generation split** — do not lump: ESF1 ex. +4 (GF 130BCDLite); ESF2 VERIFY; ESF3 ex. +10 (GF 28SLPe incl. 5V I/O) |
| SONOS | +2–3 | Floadia G1 class; reject +6–10; original PDK/SPICE preserved (Floadia public) |
| ReRAM | +2–4 | BEOL resistive stack; VERIFY |
| MRAM | +3–5 | BEOL MTJ; VERIFY |

## Citations

- **NeoMTP gen2 +2 well-implant masks:** [ChipEstimate — CMOS-Compatible MTP in Advanced BCD Applications (eMemory, 2022-11-29)](https://www.chipestimate.com/CMOS-Compatible-MTP-in-Advanced-BCD-Applications/eMemory/Technical-Article/2022/11/29)
- **SST ESF1 +4 example:** GlobalFoundries 130BCDLite embedded SuperFlash (ESF1 generation class)
- **SST ESF3 +10 example:** GlobalFoundries 28SLPe embedded SuperFlash incl. 5V I/O (ESF3 generation class)
- **SONOS +2–3:** Floadia G1 charge-trap flash class; public PDK/SPICE preservation noted on Floadia materials

## Rejected lumped ranges

- EEPROM-DP **+4–8** (page-untrusted without per-PDK layer count)
- SONOS **+6–10** (overstates Floadia G1-class adders)
- SST single **+8–12** bucket (hides ESF1/2/3 generation split)
