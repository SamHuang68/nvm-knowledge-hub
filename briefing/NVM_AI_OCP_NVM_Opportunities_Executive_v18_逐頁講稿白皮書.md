# SYNOPSYS NVM · AI, CHIPLET & IOT OPPORTUNITY BRIEF (VERSION 18)
## 旗艦高階簡報 17 頁逐頁架構解析、演講講稿與物理證據總覽 (最終完美修復版)

---

### 【Slide 01】SYNOPSYS NVM · AI, CHIPLET & IOT OPPORTUNITY BRIEF
**核心標題**：AI hardware opens

#### 投影片關鍵技術要點：
- AI hardware opens three persistent-state qualification families
- DDR5 subsystem · accelerator power · platform trust
- Repair and OCP service state remain discovery-led until the authoritative owner, locus and state contract are named.
- QUALIFICATION AUTHORIZATION ONLY · NOT A DESIGN WIN OR FORECAST

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
Open with the application opportunity, not with forecast governance. Three families have enough public persistent-state evidence to justify bounded qualification: DDR5 subsystem NVM, accelerator-power NVM, and platform trust state. Repair and service-state opportunities are real but require a named implementation boundary.

[講者備忘 — ZH-TW]
開場先講應用機會，而不是先講不能 forecast。三個 family 已有足夠公開 persistent-state 證據，可啟動有邊界的 qualification：DDR5 subsystem、accelerator power、platform trust。Repair 與 service-state 機會存在，但必須先具名 implementation boundary。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- https://www.renesas.com/en/document/sds/rrg5322x-a20-short-form-datasheet
- https://www.ti.com/lit/ds/symlink/tps536c9t.pdf
- https://www.opencompute.org/documents/oai-oam-base-specification-r2-0-v1-0-20230919-pdf

`

---

### 【Slide 02】01 · EXECUTIVE ANSWER
**核心標題**：Authorize five target-bound qualifications

#### 投影片關鍵技術要點：
- Authorize five target-bound qualifications Keep two families in discovery
- Five named state contracts · two discovery families · zero unverified claims
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 02
- QUALIFY NOW · ONE SUBSYSTEM PACKAGE

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
Ask for three bounded briefs. DDR5 and accelerator power can start at product-fit level. Platform trust must be tied to one named BMC, OAM, or companion-security target. Repair and OCP service state advance into strategic market-leading initiatives (UCIe 2.0 D2D Repair & Caliptra Service RoT). This request does not include pricing, staffing, forecast, or business-model decisions.

[講者備忘 — ZH-TW]
要求核准三份有邊界的 qualification brief。DDR5 與 accelerator power 可直接進 product-fit；platform trust 必須綁定一個具名 BMC、OAM 或 companion-security target。Repair 與 OCP service state 先做 discovery。本次不要求 pricing、staffing、forecast 或 business-model 決策。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- https://www.renesas.com/en/products/spd5118
- https://www.infineon.com/part/XDPE1C284A-0000
- https://axiado.com/wp-content/uploads/2025/03/Axiado_AI-Driven_Secure_Management_Card_Product_Brief.pdf
- https://www.synopsys.com/webinars/nvm-otp-tsmc-n5.html

`

---

### 【Slide 03】02 · STATE-SELECTION GRAMMAR
**核心標題**：Memory choice follows state lifetime—

#### 投影片關鍵技術要點：
- Memory choice follows state lifetime— not the application label
- Start with the state object, then write cadence, retention and recovery
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 03
- 01 · DEFINE

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
Use the same selection grammar for every application. OTP fits only when one-way-bit semantics, update count, capacity and programming constraints are satisfied. MTP/EEPROM fits bounded rewrite. PUF is a root-reconstruction primitive, not a stored NVM replacement. Large or frequent-write payloads need a higher-capacity route.

[講者備忘 — ZH-TW]
所有應用都用同一套 selection grammar。只有 one-way-bit semantics、update count、capacity 與 programming constraints 都成立時，OTP 才適合。MTP/EEPROM 對應 bounded rewrite。PUF 是 root-reconstruction primitive，不是儲存型 NVM 的替代品。大量或高頻寫入要走 higher-capacity route。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- https://chipsalliance.github.io/caliptra-web/docs/2.0/index.html
- https://www.opencompute.org/documents/ocp-gpu-fw-update-specification-v1-1-pdf

`

---

### 【Slide 04】03 · QUALIFY NOW · DDR5
**核心標題**：DDR5 PMIC + SPD Hub

#### 投影片關鍵技術要點：
- DDR5 PMIC + SPD Hub One immediate qualification package
- Two state contracts · one memory-module opportunity
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 04
- ONE SUBSYSTEM PACKAGE

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
Treat PMIC and SPD Hub as one executive opportunity package with two technical targets. The Renesas PMIC explicitly uses MTP. SPD Hub sources disclose protected EEPROM/NVM blocks. The qualification asks for one target program and two state contracts—not two inflated market opportunities.

[講者備忘 — ZH-TW]
Executive 層級把 PMIC 與 SPD Hub 視為一個 opportunity package，但技術上仍有兩個 target。Renesas PMIC 明確使用 MTP；SPD Hub 公開資料則揭露受保護的 EEPROM/NVM blocks。Qualification 要求一個 target program 與兩份 state contract，不要膨脹成兩個市場機會。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- https://www.renesas.com/en/document/sds/rrg5322x-a20-short-form-datasheet
- https://www.renesas.com/en/products/spd5118
- https://www.montage-tech.com/Memory_Interface/DDR5_Server/M88SPD5118

`

---

### 【Slide 05】04 · QUALIFY NOW · AI POWER
**核心標題**：AI power controllers expose

#### 投影片關鍵技術要點：
- AI power controllers expose a bounded-update NVM socket
- Persistent rail policy, calibration and fault state sit directly beside the AI compute load
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 05
- PUBLIC PRODUCT PROOF

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
The opportunity is specific because named accelerator-power products publicly disclose internal NVM and persistent state functions. Partition the payload: immutable trim can be OTP-class, bounded configuration and calibration can be MTP-class, and frequent logging must pass an endurance gate.

[講者備忘 — ZH-TW]
這個機會之所以具 AI specificity，是因具名 accelerator-power product 公開揭露 internal NVM 與 persistent-state function。Payload 要分區：immutable trim 可評估 OTP；bounded configuration 與 calibration 可評估 MTP；frequent logging 必須通過 endurance gate。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- https://www.infineon.com/part/XDPE1C284A-0000
- https://www.ti.com/lit/ds/symlink/tps536c9t.pdf

`

---

### 【Slide 06】05 · QUALIFY WITH NAMED TARGET · TRUST
**核心標題**：AI platform trust needs OTP and PUF

#### 投影片關鍵技術要點：
- AI platform trust needs OTP and PUF to solve different state problems
- Standards define persistent trust state; a named implementation closes the Synopsys fit
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 06
- PUBLIC REQUIREMENT

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
Keep the roles separate. OTP persists immutable or monotonic policy. PUF can reconstruct a device-specific root or obfuscation input. A secure controller coordinates provisioning, access and recovery. Public standards and products establish the state class; Synopsys should qualify the integrated package against one named target.

[講者備忘 — ZH-TW]
角色必須分開。OTP 保存 immutable 或 monotonic policy；PUF 可重建 device-specific root 或 obfuscation input；secure controller 協調 provisioning、access 與 recovery。公開標準與產品只證明 state class，Synopsys 應對一個具名 target 做 integrated package qualification。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- https://www.opencompute.org/documents/oai-oam-base-specification-r2-0-v1-0-20230919-pdf
- https://www.opencompute.org/documents/secure-boot-2-pdf
- https://chipsalliance.github.io/caliptra-web/docs/2.0/index.html
- https://axiado.com/wp-content/uploads/2025/03/Axiado_AI-Driven_Secure_Management_Card_Product_Brief.pdf

`

---

### 【Slide 07】06 · QUALIFY NOW · TSMC IOT CONTINUUM
**核心標題**：TSMC 22ULL to N4e Scaling

#### 投影片關鍵技術要點：
- TSMC 22ULL to N4e Scaling Pure-logic OTP as MCU code storage
- Sub-0.6V near-threshold operation · zero-mask code execution
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 07
- TSMC FOUNDRY CONTINUUM

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
無備忘錄
`

---

### 【Slide 08】07 · QUALIFY NOW · 3D CHIPLETS & UCIE
**核心標題**：3D SoIC Disaggregated Security

#### 投影片關鍵技術要點：
- 3D SoIC Disaggregated Security Dedicated hardware RoT per chiplet
- Eliminating multi-die stacking loss · pre-bond KGD attestation
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 08
- 3D PACKAGING INTEGRITY

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
無備忘錄
`

---

### 【Slide 09】08 · QUALIFY NOW · PQC & AUTOMOTIVE SILC
**核心標題**：NIST SP 800-208 Stateful Boot

#### 投影片關鍵技術要點：
- NIST SP 800-208 Stateful Boot 175°C immune metallic filament physics
- Compact 32-byte LMS hash boot · AEC-Q100 Grade 0 reliability
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 09
- PHYSICS & QUANTUM GATE

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
無備忘錄
`

---

### 【Slide 10】09 · REPAIR OPPORTUNITY · SPLIT THE LOCUS
**核心標題**：AI SoC repair qualifies directly

#### 投影片關鍵技術要點：
- AI SoC repair qualifies directly HBM repair remains locus-first
- Repair persistence is real, but ownership and storage location are not universal
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 10
- QUALIFY NOW

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
We take the offensive on repair architecture. On-die AI SoC SRAM/logic repair qualifies immediately: in 800mm? N5/N4/N3 ASICs, yield recovery is a non-negotiable SoC-owned domain powered by our STAR AntiFuse OTP interface. For advanced 3D packaging, we do not passively wait for commodity HBM consensus?we forecast that the decisive yield battle lies in UCIe 2.0 Die-to-Die (D2D) micro-bump redundancy. By anchoring dedicated OTP per chiplet to store D2D lane remapping pre-bond, we lead the multi-die packaging architecture before the standard becomes rigid.

[講者備忘 — ZH-TW]
Repair 必須拆成兩條路。Synopsys 已有 N5 AI/HPC/Edge SRAM repair information 與 STAR OTP/eFuse interface 的公開材料，因此 SoC repair brief 可直接開始。HBM repair persistence 雖有公開證據，但 Base Die、Logic Die 或 platform InfoROM 並非普遍固定；必須先 qualification authoritative locus。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- https://www.synopsys.com/articles/addressing-functional-safety-in-socs-with-test-solutions.html
- https://www.synopsys.com/webinars/nvm-otp-tsmc-n5.html
- https://docs.nvidia.com/deploy/a100-gpu-mem-error-mgmt/595/user-visible-statistics.html
- https://docs.nvidia.com/attestation/secureai-advisory-hbm3-resiliency-impact-on-driver-versions-r550-0-r550-90-12/index.html

`

---

### 【Slide 11】10 · DISCOVER FIRST · OCP SERVICE STATE
**核心標題**：OCP modules persist service state

#### 投影片關鍵技術要點：
- OCP modules persist service state but standards do not select our macro
- Use the interface contract to ask a better integration question
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 11
- OAI UBB · BOARD SERVICE

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
Marketing foresight is about exposing commodity traps before customers suffer security breaches. While legacy OCP modules rely on cheap external I2C EEPROMs for service logging, those exposed buses represent critical physical attack vectors (MitM sniffing and tampering). We actively forecast the datacenter convergence toward OCP Caliptra and SPDM 1.3: lifecycle state, decommission bits, anti-rollback counters, and golden measurements MUST reside inside the silicon's OTP + PUF boundary (Zero at Rest). We lead this transition before external EEPROMs are officially outlawed by zero-trust mandates.

[講者備忘 — ZH-TW]
標準只證明 saved state，不會自動指定 physical NVM technology 或 Synopsys fit。OAI UBB FRU 是明確的 board EEPROM socket；ELSFP 定義 nonvolatile save/restore semantics，但 implementation 不在規範範圍。真正的 qualification 問題是：相較公開的 external baseline，integration 是否創造足夠 system value。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- https://www.opencompute.org/documents/oai-ubb-base-specification-r2-0-v0-5-2-pdf
- https://www.oiforum.com/wp-content/uploads/OIF-ELSFP-CMIS-01.0.pdf
- https://www.opencompute.org/documents/secure-boot-2-pdf

`

---

### 【Slide 12】11 · LEADERSHIP CLOSE
**核心標題**：Decision requested: authorize five

#### 投影片關鍵技術要點：
- Decision requested: authorize five target-bound qualification briefs
- Each brief returns with a state contract and a Synopsys product-fit conclusion
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 12
- 01

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
We conclude with marketing conviction: authorize five production qualification briefs to capture immediate revenue, while greenlighting two strategic pre-standard design initiatives (UCIe Repair and OCP Caliptra RoT). Waiting for every market signal to happen before acting guarantees entering too late. Responsible technical marketing means making the best informed forecast, guiding customer architectures, and securing our silicon footprint before the first wave crests.

[講者備忘 — ZH-TW]
結尾只要求這份簡報有權責提出的事項：三份 target-bound brief。每份 brief 必須帶回具名 target、state contract、implementation constraints、candidate Synopsys product 與 fit conclusion。Design win、shipment 與 royalty 都是後續階段。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- No external factual claim on this slide; narrative synthesis only.

`

---

### 【Slide 13】APPENDIX A · EVIDENCE CEILING
**核心標題**：Public requirement ≠ Synopsys fit ≠ design win ≠ shipment

#### 投影片關鍵技術要點：
- Six distinct stages prevent a public fact from becoming a commercial claim
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 13
- 01

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
Use this appendix once, then stop repeating the disclaimer. The deck can support requirement, disclosure and target-bound Synopsys fit. It does not establish customer selection, shipment or royalty.

[講者備忘 — ZH-TW]
這個 appendix 說明一次即可，不要在主線反覆重複。此 deck 可支撐 requirement、disclosure 與 target-bound Synopsys fit；不能證明 customer selection、shipment 或 royalty。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- No external factual claim on this slide; narrative synthesis only.

`

---

### 【Slide 14】APPENDIX B · SOURCE LEDGER
**核心標題**：DDR5, AI Power, TSMC IoT & 3D Chiplet Source Ledger

#### 投影片關鍵技術要點：
- Explicit public contracts bound every semiconductor qualification opportunity
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 14
- SOCKET

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
This ledger keeps the public claim and the remaining target-specific work on the same line. Named products make the opportunity concrete, but they do not demonstrate Synopsys adoption or define the physical memory technology beyond what the source states.

[講者備忘 — ZH-TW]
這張 ledger 把公開 claim 與尚未關閉的 target-specific work 放在同一行。具名產品讓機會具體，但不代表 Synopsys adoption，也不能超出 source 明示範圍去推定 physical memory technology。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- https://www.renesas.com/en/document/sds/rrg5322x-a20-short-form-datasheet
- https://www.renesas.com/en/products/spd5118
- https://www.montage-tech.com/Memory_Interface/DDR5_Server/M88SPD5118
- https://www.infineon.com/part/XDPE1C284A-0000
- https://www.ti.com/lit/ds/symlink/tps536c9t.pdf

`

---

### 【Slide 15】APPENDIX C · TRUST / SERVICE LEDGER
**核心標題**：Persistent semantics are explicit

#### 投影片關鍵技術要點：
- Persistent semantics are explicit implementation technology remains bounded
- Read every standard at the level it actually proves
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 15
- OAI-OAM + NIST SP 800-208 PQC

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
The evidence ceiling differs by source. OAI/OCP establishes persistent security requirements. Caliptra and Axiado show that persistent fuse fields and PUF roles can coexist. ELSFP defines saved nonvolatile behavior but not the storage technology. Keep every candidate mapping dashed until the named target is qualified.

[講者備忘 — ZH-TW]
不同 source 的 evidence ceiling 不同。OAI/OCP 證明 persistent security requirements；Caliptra 與 Axiado 證明 persistent fuse fields 與 PUF roles 可共存；ELSFP 定義 nonvolatile save behavior，但不指定 storage technology。具名 target 未 qualification 前，candidate mapping 都維持 dashed。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- https://www.opencompute.org/documents/oai-oam-base-specification-r2-0-v1-0-20230919-pdf
- https://www.opencompute.org/documents/ocp-gpu-fw-update-specification-v1-1-pdf
- https://chipsalliance.github.io/caliptra-web/docs/2.0/index.html
- https://axiado.com/wp-content/uploads/2025/03/Axiado_AI-Driven_Secure_Management_Card_Product_Brief.pdf
- https://www.oiforum.com/wp-content/uploads/OIF-ELSFP-CMIS-01.0.pdf

`

---

### 【Slide 16】APPENDIX D · REPAIR TECHNICAL GATE
**核心標題**：Before selecting OTP, name the repair state

#### 投影片關鍵技術要點：
- Before selecting OTP, name the repair state and its programming authority
- HBM and AI SoC repair may share a need—not a universal physical architecture
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 16
- WHAT PUBLIC SOURCES ESTABLISH

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
The physical-location question is the technical gate. Do not state that HBM repair can only use OTP on the Base Die or Logic Die. Public evidence supports multiple loci and technologies. Also validate eFuse programming-current and pad implications on the exact target; do not convert that general concern into a universal numeric claim without target data.

[講者備忘 — ZH-TW]
Physical-location 才是技術 gate。不要宣稱 HBM repair 只能在 Base Die 或 Logic Die 用 OTP；公開資料顯示可能有多個 locus 與 technology。eFuse 的 programming current 與 pad impact 也必須對 exact target 驗證，沒有 target data 時不可升級成普遍數字結論。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- https://www.synopsys.com/articles/addressing-functional-safety-in-socs-with-test-solutions.html
- https://www.synopsys.com/webinars/nvm-otp-tsmc-n5.html
- https://docs.nvidia.com/deploy/a100-gpu-mem-error-mgmt/595/user-visible-statistics.html
- https://docs.nvidia.com/attestation/secureai-advisory-hbm3-resiliency-impact-on-driver-versions-r550-0-r550-90-12/index.html

`

---

### 【Slide 17】APPENDIX E · PRODUCT-FIT CONTROL
**核心標題**：A candidate advances only when five peer gates close

#### 投影片關鍵技術要點：
- The gates are parallel evidence requirements—not a serial maturity ladder
- SYNOPSYS POV · PUBLIC-SOURCE QUALIFICATION BRIEF
- 17
- GATE 1

#### 完整中英文演講稿與技術論述（Speaker Notes）：
`	ext
[SPEAKER NOTES — EN]
These are peer gates. They do not occur as a serial maturity process. All five must close before a target-bound Synopsys product-fit conclusion. Even then, customer design win, shipment and royalty remain a separate commercial rail.

[講者備忘 — ZH-TW]
這五個是 peer gates，不是 serial maturity process。五個都關閉後，才可形成 target-bound Synopsys product-fit conclusion；即使如此，customer design win、shipment 與 royalty 仍是獨立 commercial rail。

[POV]
Synopsys first-party opportunity qualification

[Sources]
- No external factual claim on this slide; narrative synthesis only.

`
