# NVM Technology Atlas

Research Revision: 2026-09-10

Choose a topic to explore IP cell principles, technology lineage, foundry processes or storage physics. Each study connects diagrams and operating conditions to public sources.

## Storage Physics

Charge, conductive structure, magnetization, ion distribution, crystal phase and polarization determine the physical mechanism. OTP is not one physics: floating-gate OTP stores charge; AntiFuse OTP forms a dielectric path. Study conventional standalone EEPROM separately from embedded MTP IP; within MTP IP, distinguish foundry double-poly EEPROM and third-party single-poly routes. NOR and NAND still describe array organization.

## Commercial Maturity

Volume production, completed qualification, research demonstrations, and development plans must be tied to a named company, process node, version, and application. Finding one MRAM product in volume production does not establish the same maturity for every SOT-MRAM implementation.

## System Role

SCM describes an application role that addresses the gap between memory and storage; it is not another bitcell type. Application, access semantics, persistence through power loss, and current supply status must be explained separately.

## Named IP Cells and Operating Principles

### NeoBit: Floating-Gate OTP Cell

eMemory

Follow the series select transistor and p-type floating-gate storage transistor as electron injection changes read current. Then distinguish normal OTP operation from the physical possibility of ultraviolet erasure.

NeoBit — Cell Structure

Series pMOS selector and pMOS floating-gate cell. Historical section: n-well in p substrate, p+ source/shared region/drain, separate select gate and p+ FG; no FG wire or stacked control gate. Dielectric isolates FG. The historical p+ model adds electron–hole recombination leaving localized negative ionic charge; stored Q− is not entirely free electrons.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- FG / Q− · FG has no DC terminal. Q− follows the historical p+ charge model, including localized negative ionic charge.
- UV* · The 2021 brief lists UV erase. Normal OTP lacks electrical erase; UV access depends on implementation and package.

- [ip-neobit: NeoBit Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoBit)
- [ip-neobit-pat: Historical NeoBit Charge-Retention Patent](https://patents.google.com/patent/US6914825B2/en)
- [ip-neobit-link: Official NeoBit-to-Patent Link](https://www.ememory.com.tw/en-US/News/News?guid=19081915004414)
- [ip-neobit-uv: Published NeoBit UV-Erase Boundary](https://www.ememory.com.tw/Content/Upload/files/Product%20Brief/07_NeoBit%C2%AE%E2%80%93%20Most%20Widely%20Used%20OTP%20Solution_20210330.pdf)

#### NeoBit — Program

Carriers: accelerated holes create electron–hole pairs; some hot electrons enter FG through oxide.

Hot-hole-induced electron injection

**1. Initial State**

State: Initial: less stored negative FG charge; p-channel is not in its programmed conductive state.

Stimulus: Retain the stored state before the operation.

Initial: less stored negative FG charge; p-channel is not in its programmed conductive state.

**2. Apply Conditions**

State: Stimulus: select pMOS and establish a lateral channel field; coupling shifts FG potential.

Stimulus: Stimulus: select pMOS and establish a lateral channel field; coupling shifts FG potential.

Stimulus: select pMOS and establish a lateral channel field; coupling shifts FG potential.

**3. Carrier Motion**

State: Carriers: accelerated holes create electron–hole pairs; some hot electrons enter FG through oxide.

Stimulus: Maintain the operating conditions and observe the carrier or sensing path.

Carriers: accelerated holes create electron–hole pairs; some hot electrons enter FG through oxide.

**4. Retained Result**

State: Hold: Q− remains after the pulse; the p-channel conducts more readily at specified read bias.

Stimulus: Return to retention conditions after the operation.

Hold: Q− remains after the pulse; the p-channel conducts more readily at specified read bias.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- FG / Q− · FG has no DC terminal. Q− follows the historical p+ charge model, including localized negative ionic charge.
- UV* · The 2021 brief lists UV erase. Normal OTP lacks electrical erase; UV access depends on implementation and package.

Do not draw oxide rupture, a permanent filament or nMOS CHE; do not invent voltages or universal current p+ doping. SL, SG/WL, BL and NW; FG floats. SG is separate from FG; capacitive BL coupling is not a DC connection.

- [ip-neobit: NeoBit Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoBit)
- [ip-neobit-pat: Historical NeoBit Charge-Retention Patent](https://patents.google.com/patent/US6914825B2/en)
- [ip-neobit-link: Official NeoBit-to-Patent Link](https://www.ememory.com.tw/en-US/News/News?guid=19081915004414)
- [ip-neobit-uv: Published NeoBit UV-Erase Boundary](https://www.ememory.com.tw/Content/Upload/files/Product%20Brief/07_NeoBit%C2%AE%E2%80%93%20Most%20Widely%20Used%20OTP%20Solution_20210330.pdf)

#### NeoBit — Erase Boundary

The normal OTP interface lacks electrical erase. This does not imply physical irreversibility: the 2021 brief lists UV erase, subject to implementation and package.

Normal OTP operating boundary

**1. Programmed State**

State: After programming: FG retains Q−.

Stimulus: Retain the stored state before the operation.

After programming: FG retains Q−.

**2. Normal Operating Boundary**

State: Boundary: normal OTP operation provides no electrical erase path.

Stimulus: Boundary: normal OTP operation provides no electrical erase path.

Boundary: normal OTP operation provides no electrical erase path.

**3. Historical UV Boundary**

State: Historical exception: UV erase was published; package support is not implied.

Stimulus: No normal electrical erase stimulus; this frame explains the operating boundary.

Historical exception: UV erase was published; package support is not implied.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- FG / Q− · FG has no DC terminal. Q− follows the historical p+ charge model, including localized negative ionic charge.
- UV* · The 2021 brief lists UV erase. Normal OTP lacks electrical erase; UV access depends on implementation and package.

Do not draw oxide rupture, a permanent filament or nMOS CHE; do not invent voltages or universal current p+ doping. SL, SG/WL, BL and NW; FG floats. SG is separate from FG; capacitive BL coupling is not a DC connection.

- [ip-neobit: NeoBit Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoBit)
- [ip-neobit-pat: Historical NeoBit Charge-Retention Patent](https://patents.google.com/patent/US6914825B2/en)
- [ip-neobit-link: Official NeoBit-to-Patent Link](https://www.ememory.com.tw/en-US/News/News?guid=19081915004414)
- [ip-neobit-uv: Published NeoBit UV-Erase Boundary](https://www.ememory.com.tw/Content/Upload/files/Product%20Brief/07_NeoBit%C2%AE%E2%80%93%20Most%20Widely%20Used%20OTP%20Solution_20210330.pdf)

#### NeoBit — Read

Sense output current while preserving the stored state; the macro defines logic coding.

Channel-current sensing

**1. Retained State**

State: Hold: FG charge is unchanged before reading.

Stimulus: Retain the stored state before the operation.

Hold: FG charge is unchanged before reading.

**2. Select the Cell**

State: Stimulus: select the cell with low-field read conditions.

Stimulus: Stimulus: select the cell with low-field read conditions.

Stimulus: select the cell with low-field read conditions.

**3. Sense the Path**

State: Path: holes flow along the p-channel; FG charge is not discharged into BL.

Stimulus: Maintain the operating conditions and observe the carrier or sensing path.

Path: holes flow along the p-channel; FG charge is not discharged into BL.

**4. Compare the Result**

State: Result: sense channel current; the macro defines the 0/1 mapping.

Stimulus: Return to retention conditions after the operation.

Result: sense channel current; the macro defines the 0/1 mapping.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- FG / Q− · FG has no DC terminal. Q− follows the historical p+ charge model, including localized negative ionic charge.
- UV* · The 2021 brief lists UV erase. Normal OTP lacks electrical erase; UV access depends on implementation and package.

Do not draw oxide rupture, a permanent filament or nMOS CHE; do not invent voltages or universal current p+ doping. SL, SG/WL, BL and NW; FG floats. SG is separate from FG; capacitive BL coupling is not a DC connection.

- [ip-neobit: NeoBit Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoBit)
- [ip-neobit-pat: Historical NeoBit Charge-Retention Patent](https://patents.google.com/patent/US6914825B2/en)
- [ip-neobit-link: Official NeoBit-to-Patent Link](https://www.ememory.com.tw/en-US/News/News?guid=19081915004414)
- [ip-neobit-uv: Published NeoBit UV-Erase Boundary](https://www.ememory.com.tw/Content/Upload/files/Product%20Brief/07_NeoBit%C2%AE%E2%80%93%20Most%20Widely%20Used%20OTP%20Solution_20210330.pdf)

#### IP Cell Tradeoffs

A floating-gate OTP stores its state in charge. The selector controls access, while programming moves the storage transistor to another sensed state. An interface without electrical erase is a different OTP design path from an irreversible dielectric change.

### NeoFuse: Gate-Dielectric Antifuse OTP Cell

eMemory

Start at the n-type cell's gate dielectric and follow high-field defect creation, changes in effective tunneling distance and the gate current used for sensing.

NeoFuse — Cell Structure

Storage uses an nFET gate dielectric and gate-current sensing. Published 3T adds regulation; show selection, regulation and antifuse functions with conceptual connectivity. The programmed dielectric-defect state persists; data is not an FG electron count.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- DT / 3T · DT describes direct tunneling through a shorter effective barrier after defect generation. SEL/REG are published functions; the related patent is not a verified current NeoFuse netlist.

- [ip-neofuse: NeoFuse Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoFuse)
- [ip-neofuse-dt: Quantum Tunneling Mechanism in NeoFuse](https://www.chipestimate.com/Quantum-Tunneling-Mechanism-in-NeoFuse/eMemory/Technical-Article/2021/01/19)
- [ip-neofuse-3t: Named NeoFuse Three-Transistor Architecture](https://www.ememory.com.tw/en-US/News/2024-12-09/Powering-the-NVM-and-Embedded-Chip-Security-Technologies)
- [ip-neofuse-pat: Related Three-Transistor Antifuse Patent](https://patents.google.com/patent/US20250024668A1/en)

#### NeoFuse — Program

Carriers: defects shorten the effective barrier; electrons tunnel across it.

High-field defect generation and enhanced tunneling

**1. Initial State**

State: Initial: few dielectric defects and low gate current.

Stimulus: Retain the stored state before the operation.

Initial: few dielectric defects and low gate current.

**2. Apply Conditions**

State: Stimulus: selection/regulation establishes high dielectric field.

Stimulus: Stimulus: selection/regulation establishes high dielectric field.

Stimulus: selection/regulation establishes high dielectric field.

**3. Carrier Motion**

State: Carriers: defects shorten the effective barrier; electrons tunnel across it.

Stimulus: Maintain the operating conditions and observe the carrier or sensing path.

Carriers: defects shorten the effective barrier; electrons tunnel across it.

**4. Retained Result**

State: Hold: the defect state remains after stress removal.

Stimulus: Return to retention conditions after the operation.

Hold: the defect state remains after stress removal.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- DT / 3T · DT describes direct tunneling through a shorter effective barrier after defect generation. SEL/REG are published functions; the related patent is not a verified current NeoFuse netlist.

No thick metallic short or FG storage; the damaged high-k/interfacial sublayer of current advanced processes is unverified. Antifuse gate AF, underlying Si, selection/regulation controls and BL; storage dielectric lies between AF and Si, not in the selector oxide.

- [ip-neofuse: NeoFuse Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoFuse)
- [ip-neofuse-dt: Quantum Tunneling Mechanism in NeoFuse](https://www.chipestimate.com/Quantum-Tunneling-Mechanism-in-NeoFuse/eMemory/Technical-Article/2021/01/19)
- [ip-neofuse-3t: Named NeoFuse Three-Transistor Architecture](https://www.ememory.com.tw/en-US/News/2024-12-09/Powering-the-NVM-and-Embedded-Chip-Security-Technologies)
- [ip-neofuse-pat: Related Three-Transistor Antifuse Patent](https://patents.google.com/patent/US20250024668A1/en)

#### NeoFuse — Erase Boundary

Normal operation has no defect-repair erase step; reducing bias does not restore the initial dielectric.

Normal OTP operating boundary

**1. Programmed State**

State: After programming: the defect state has changed.

Stimulus: Retain the stored state before the operation.

After programming: the defect state has changed.

**2. Normal Operating Boundary**

State: Boundary: ordinary bias does not repair the dielectric.

Stimulus: Boundary: ordinary bias does not repair the dielectric.

Boundary: ordinary bias does not repair the dielectric.

**3. Persistent State**

State: Result: normal use retains the OTP state.

Stimulus: No normal electrical erase stimulus; this frame explains the operating boundary.

Result: normal use retains the OTP state.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- DT / 3T · DT describes direct tunneling through a shorter effective barrier after defect generation. SEL/REG are published functions; the related patent is not a verified current NeoFuse netlist.

No thick metallic short or FG storage; the damaged high-k/interfacial sublayer of current advanced processes is unverified. Antifuse gate AF, underlying Si, selection/regulation controls and BL; storage dielectric lies between AF and Si, not in the selector oxide.

- [ip-neofuse: NeoFuse Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoFuse)
- [ip-neofuse-dt: Quantum Tunneling Mechanism in NeoFuse](https://www.chipestimate.com/Quantum-Tunneling-Mechanism-in-NeoFuse/eMemory/Technical-Article/2021/01/19)
- [ip-neofuse-3t: Named NeoFuse Three-Transistor Architecture](https://www.ememory.com.tw/en-US/News/2024-12-09/Powering-the-NVM-and-Embedded-Chip-Security-Technologies)
- [ip-neofuse-pat: Related Three-Transistor Antifuse Patent](https://patents.google.com/patent/US20250024668A1/en)

#### NeoFuse — Read

Sense output current while preserving the stored state; the macro defines logic coding.

Gate-current sensing

**1. Retained State**

State: Compare: initial and programmed states have different defect densities.

Stimulus: Retain the stored state before the operation.

Compare: initial and programmed states have different defect densities.

**2. Select the Cell**

State: Stimulus: use read conditions below programming stress.

Stimulus: Stimulus: use read conditions below programming stress.

Stimulus: use read conditions below programming stress.

**3. Sense the Path**

State: Path: sense gate current; Si-to-AF electrons oppose conventional current.

Stimulus: Maintain the operating conditions and observe the carrier or sensing path.

Path: sense gate current; Si-to-AF electrons oppose conventional current.

**4. Compare the Result**

State: Result: compare with a current reference without resetting defects.

Stimulus: Return to retention conditions after the operation.

Result: compare with a current reference without resetting defects.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- DT / 3T · DT describes direct tunneling through a shorter effective barrier after defect generation. SEL/REG are published functions; the related patent is not a verified current NeoFuse netlist.

No thick metallic short or FG storage; the damaged high-k/interfacial sublayer of current advanced processes is unverified. Antifuse gate AF, underlying Si, selection/regulation controls and BL; storage dielectric lies between AF and Si, not in the selector oxide.

- [ip-neofuse: NeoFuse Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoFuse)
- [ip-neofuse-dt: Quantum Tunneling Mechanism in NeoFuse](https://www.chipestimate.com/Quantum-Tunneling-Mechanism-in-NeoFuse/eMemory/Technical-Article/2021/01/19)
- [ip-neofuse-3t: Named NeoFuse Three-Transistor Architecture](https://www.ememory.com.tw/en-US/News/2024-12-09/Powering-the-NVM-and-Embedded-Chip-Security-Technologies)
- [ip-neofuse-pat: Related Three-Transistor Antifuse Patent](https://patents.google.com/patent/US20250024668A1/en)

#### IP Cell Tradeoffs

The storage event changes dielectric conduction. An ideal short does not explain the ultrathin-dielectric physics. Selection and regulation transistors support array operation; defects and tunneling in the storage region create the programmed read-current difference.

### Kilopass XPM: Historical 2T Antifuse

Kilopass; acquired by Synopsys in 2018

The original patent explicitly names XPM and distinguishes the storage MOS from the select MOS.

Kilopass XPM — Cell Structure

Original patent Figure 1 describes XPM as storage MOS M0 plus select MOS M1. WLP drives the storage gate, WLR selects M1, and BL senses current. The enlarged M0 region shows function without inventing a second diffusion or an intermediate sense terminal.

- e− · Blue dots are mobile electrons and blue arrows follow electron flow; they are not charge retained inside the gate.
- I · Green denotes conventional current, opposite to electrons. The illustrated branch fixes positive gate bias and a low BL.
- OTP · The local orange path indicates conductive oxide state; normal operation has no electrical erase.
- I_L / I_H · Short/long bars illustrate low/high read-current comparison, not measured values or fixed logic coding.
- Geometry · Historical public-source functional reconstruction, not a scale section or current layout; terminal biases are not process operating specifications.
- M0 / M1 · M0 stores and M1 selects. No sense output absent from the original is added at their internal node.

- [ip-kilopass-xpm-2007: Historical Kilopass XPM 2T Patent Diagram](https://patents.google.com/patent/WO2007090089A2/en)
- [ip-kilopass-2t-2012: Kilopass 130/110 nm XPM and Gusto 2T Announcement](https://www.design-reuse.com/news/202521997-kilopass-nvm-ip-cores-first-to-deliver-footprint-and-pin-compatibility-across-eight-top-tier-silicon-foundries-for-the-130-110nm-process-node/)

#### Kilopass XPM — Program

Local M0 oxide breakdown creates a conductive path; electrons are illustrated from BL through M1 and silicon toward positive WLP.

Gate-Oxide Breakdown

**1. Initial State**

State: Gate oxide is intact; M0 has low gate-to-silicon leakage and M1 is not yet selected.

Stimulus: The present operation has not yet applied a stimulus.

Gate oxide is intact; M0 has low gate-to-silicon leakage and M1 is not yet selected.

**2. Establish Program Field**

State: Apply positive programming bias at WLP, select M1 through WLR, and hold BL low to stress M0 gate oxide.

Stimulus: Apply positive programming bias at WLP, select M1 through WLR, and hold BL low to stress M0 gate oxide.

Apply positive programming bias at WLP, select M1 through WLR, and hold BL low to stress M0 gate oxide.

**3. Oxide Breakdown**

State: Local M0 oxide breakdown creates a conductive path; electrons are illustrated from BL through M1 and silicon toward positive WLP.

Stimulus: Apply positive programming bias at WLP, select M1 through WLR, and hold BL low to stress M0 gate oxide.

Local M0 oxide breakdown creates a conductive path; electrons are illustrated from BL through M1 and silicon toward positive WLP.

**4. Retained Result**

State: After the pulse, the oxide conductance difference persists; the stored quantity is the oxide state.

Stimulus: Remove programming bias.

After the pulse, the oxide conductance difference persists; the stored quantity is the oxide state.

- e− · Blue dots are mobile electrons and blue arrows follow electron flow; they are not charge retained inside the gate.
- I · Green denotes conventional current, opposite to electrons. The illustrated branch fixes positive gate bias and a low BL.
- OTP · The local orange path indicates conductive oxide state; normal operation has no electrical erase.
- I_L / I_H · Short/long bars illustrate low/high read-current comparison, not measured values or fixed logic coding.
- Geometry · Historical public-source functional reconstruction, not a scale section or current layout; terminal biases are not process operating specifications.
- M0 / M1 · M0 stores and M1 selects. No sense output absent from the original is added at their internal node.

Uses Figure 1 explicitly named XPM in the 2007 patent and the 2012 product announcement. Later self-sensing, latch and 3T drawings are excluded. Positive WLP and low BL define this nMOS teaching branch; read uses lower stress without implementation voltages. Acquisition announcements establish portfolio continuity; current 1T/2T or advanced-process articles do not prove this section is retained at every node.

- [ip-kilopass-xpm-2007: Historical Kilopass XPM 2T Patent Diagram](https://patents.google.com/patent/WO2007090089A2/en)
- [ip-kilopass-2t-2012: Kilopass 130/110 nm XPM and Gusto 2T Announcement](https://www.design-reuse.com/news/202521997-kilopass-nvm-ip-cores-first-to-deliver-footprint-and-pin-compatibility-across-eight-top-tier-silicon-foundries-for-the-130-110nm-process-node/)
- [ip-lineage-kilopass-2018: Synopsys Acquisition of Kilopass](https://news.synopsys.com/2018-01-10-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Kilopass-Technology)
- [ip-synopsys-otp-current: Synopsys OTP NVM 1T/2T Portfolio](https://www.synopsys.com/articles/non-volatile-memory.html)
- [ip-synopsys-advanced-otp: Synopsys Advanced-Process OTP Reliability and Sensing](https://www.synopsys.com/articles/reliable-secure-otp-ip.html)

#### Kilopass XPM — Erase Boundary

Normal OTP provides no electrical erase; an ordinary reverse operation cannot restore the unprogrammed cell.

Normal OTP Operating Boundary

**1. Programmed State**

State: The programmed local oxide conduction state remains.

Stimulus: The present operation has not yet applied a stimulus.

The programmed local oxide conduction state remains.

**2. Normal Operating Boundary**

State: The normal OTP interface has no electrical erase procedure that repairs gate oxide.

Stimulus: No normal electrical erase stimulus.

The normal OTP interface has no electrical erase procedure that repairs gate oxide.

**3. Persistent State**

State: The original cell remains programmed; spare bits, remapping or eMTP emulated updates are system methods.

Stimulus: No normal electrical erase stimulus.

The original cell remains programmed; spare bits, remapping or eMTP emulated updates are system methods.

- e− · Blue dots are mobile electrons and blue arrows follow electron flow; they are not charge retained inside the gate.
- I · Green denotes conventional current, opposite to electrons. The illustrated branch fixes positive gate bias and a low BL.
- OTP · The local orange path indicates conductive oxide state; normal operation has no electrical erase.
- I_L / I_H · Short/long bars illustrate low/high read-current comparison, not measured values or fixed logic coding.
- Geometry · Historical public-source functional reconstruction, not a scale section or current layout; terminal biases are not process operating specifications.
- M0 / M1 · M0 stores and M1 selects. No sense output absent from the original is added at their internal node.

Uses Figure 1 explicitly named XPM in the 2007 patent and the 2012 product announcement. Later self-sensing, latch and 3T drawings are excluded. Positive WLP and low BL define this nMOS teaching branch; read uses lower stress without implementation voltages. Acquisition announcements establish portfolio continuity; current 1T/2T or advanced-process articles do not prove this section is retained at every node.

- [ip-kilopass-xpm-2007: Historical Kilopass XPM 2T Patent Diagram](https://patents.google.com/patent/WO2007090089A2/en)
- [ip-kilopass-2t-2012: Kilopass 130/110 nm XPM and Gusto 2T Announcement](https://www.design-reuse.com/news/202521997-kilopass-nvm-ip-cores-first-to-deliver-footprint-and-pin-compatibility-across-eight-top-tier-silicon-foundries-for-the-130-110nm-process-node/)
- [ip-lineage-kilopass-2018: Synopsys Acquisition of Kilopass](https://news.synopsys.com/2018-01-10-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Kilopass-Technology)
- [ip-synopsys-otp-current: Synopsys OTP NVM 1T/2T Portfolio](https://www.synopsys.com/articles/non-volatile-memory.html)
- [ip-synopsys-advanced-otp: Synopsys Advanced-Process OTP Reliability and Sensing](https://www.synopsys.com/articles/reliable-secure-otp-ip.html)

#### Kilopass XPM — Read

The sense amplifier compares low/high BL current. The macro defines 0/1 coding; read does not repair the oxide.

Oxide-Conduction Current Sensing

**1. Retained State**

State: The illustrated programmed cell retains its conductive oxide state without a read stimulus.

Stimulus: The present operation has not yet applied a stimulus.

The illustrated programmed cell retains its conductive oxide state without a read stimulus.

**2. Establish Read Conditions**

State: WLR selects M1; WLP and BL establish lower-stress read conditions.

Stimulus: WLR selects M1; WLP and BL establish lower-stress read conditions.

WLR selects M1; WLP and BL establish lower-stress read conditions.

**3. Sense the Path**

State: For the illustrated positive WLP and low BL, conventional current flows through oxide, silicon and M1 toward BL; electrons move oppositely.

Stimulus: WLR selects M1; WLP and BL establish lower-stress read conditions.

For the illustrated positive WLP and low BL, conventional current flows through oxide, silicon and M1 toward BL; electrons move oppositely.

**4. Compare the Result**

State: The sense amplifier compares low/high BL current. The macro defines 0/1 coding; read does not repair the oxide.

Stimulus: Complete sensing and interpret using macro logic.

The sense amplifier compares low/high BL current. The macro defines 0/1 coding; read does not repair the oxide.

- e− · Blue dots are mobile electrons and blue arrows follow electron flow; they are not charge retained inside the gate.
- I · Green denotes conventional current, opposite to electrons. The illustrated branch fixes positive gate bias and a low BL.
- OTP · The local orange path indicates conductive oxide state; normal operation has no electrical erase.
- I_L / I_H · Short/long bars illustrate low/high read-current comparison, not measured values or fixed logic coding.
- Geometry · Historical public-source functional reconstruction, not a scale section or current layout; terminal biases are not process operating specifications.
- M0 / M1 · M0 stores and M1 selects. No sense output absent from the original is added at their internal node.

Uses Figure 1 explicitly named XPM in the 2007 patent and the 2012 product announcement. Later self-sensing, latch and 3T drawings are excluded. Positive WLP and low BL define this nMOS teaching branch; read uses lower stress without implementation voltages. Acquisition announcements establish portfolio continuity; current 1T/2T or advanced-process articles do not prove this section is retained at every node.

- [ip-kilopass-xpm-2007: Historical Kilopass XPM 2T Patent Diagram](https://patents.google.com/patent/WO2007090089A2/en)
- [ip-kilopass-2t-2012: Kilopass 130/110 nm XPM and Gusto 2T Announcement](https://www.design-reuse.com/news/202521997-kilopass-nvm-ip-cores-first-to-deliver-footprint-and-pin-compatibility-across-eight-top-tier-silicon-foundries-for-the-130-110nm-process-node/)
- [ip-lineage-kilopass-2018: Synopsys Acquisition of Kilopass](https://news.synopsys.com/2018-01-10-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Kilopass-Technology)
- [ip-synopsys-otp-current: Synopsys OTP NVM 1T/2T Portfolio](https://www.synopsys.com/articles/non-volatile-memory.html)
- [ip-synopsys-advanced-otp: Synopsys Advanced-Process OTP Reliability and Sensing](https://www.synopsys.com/articles/reliable-secure-otp-ip.html)

#### IP Cell Tradeoffs

Learn the two transistor roles and the original XPM evidence; acquisition does not prove one cell is retained at every node.

### Sidense 1T-Fuse: Split-Channel Antifuse

Sidense; acquired by Synopsys in 2017

One gate spans thick and thin oxide; persistent conduction through the thin region creates the OTP state.

Sidense 1T-Fuse — Cell Structure

Following original-author Figure 2 from 2007, one continuous poly gate connects to WL and the sole N+ diffusion connects to BL. Thick I/O oxide lies near BL; thin core oxide lies farther away. Breakdown links the gate to the channel through the thin region. Thicknesses and paths are enlarged for readability.

- e− · Blue dots are mobile electrons and blue arrows follow electron flow; they are not charge retained inside the gate.
- I · Green denotes conventional current, opposite to electrons. The illustrated branch fixes positive gate bias and a low BL.
- OTP · The local orange path indicates conductive oxide state; normal operation has no electrical erase.
- I_L / I_H · Short/long bars illustrate low/high read-current comparison, not measured values or fixed logic coding.
- Geometry · Historical public-source functional reconstruction, not a scale section or current layout; terminal biases are not process operating specifications.
- WL / BL · WL connects to one poly gate and BL to the sole N+ diffusion. Only the thin core oxide is shown breaking down. Horizontal carrier paths are offset for readability from the under-gate surface channel; they do not indicate conduction through the p-type bulk.

- [ip-sidense-cell-2007: Sidense 1T-Fuse Original-Author Cell Section](https://www.chipestimate.com/1T-OTP-Memory-Delivering-Quality-and-Reliability/Sidense-a-part-of-Synopsys/Technical-Article/2007/12/18)
- [ip-sidense-irreversible-2017: Sidense 1T-Fuse Irreversibility and eMTP Boundary](https://www.chipestimate.com/Enabling-Secure-Semiconductor-Supply-Chain-Management/Sidense-a-part-of-Synopsys/Technical-Article/2017/09/05)
- [ip-sidense-patent-2006: Historical Sidense Split-Channel Antifuse Patent](https://patents.google.com/patent/US20060244099A1/en)

#### Sidense 1T-Fuse — Program

The thin core oxide locally breaks down. Electrons travel from BL diffusion through the channel and the thin region toward WL; the thick oxide remains intact.

Gate-Oxide Breakdown

**1. Initial State**

State: Both thick and thin oxide beneath the single gate are intact; WL-to-BL leakage is initially low.

Stimulus: The present operation has not yet applied a stimulus.

Both thick and thin oxide beneath the single gate are intact; WL-to-BL leakage is initially low.

**2. Establish Program Field**

State: For the illustrated n-type teaching bias, raise WL and hold BL low. The thick region controls the channel while the thin region experiences stronger oxide field.

Stimulus: For the illustrated n-type teaching bias, raise WL and hold BL low. The thick region controls the channel while the thin region experiences stronger oxide field.

For the illustrated n-type teaching bias, raise WL and hold BL low. The thick region controls the channel while the thin region experiences stronger oxide field.

**3. Oxide Breakdown**

State: The thin core oxide locally breaks down. Electrons travel from BL diffusion through the channel and the thin region toward WL; the thick oxide remains intact.

Stimulus: For the illustrated n-type teaching bias, raise WL and hold BL low. The thick region controls the channel while the thin region experiences stronger oxide field.

The thin core oxide locally breaks down. Electrons travel from BL diffusion through the channel and the thin region toward WL; the thick oxide remains intact.

**4. Retained Result**

State: After programming bias is removed, the thin region retains persistent conduction rather than charge stored inside the gate.

Stimulus: Remove programming bias.

After programming bias is removed, the thin region retains persistent conduction rather than charge stored inside the gate.

- e− · Blue dots are mobile electrons and blue arrows follow electron flow; they are not charge retained inside the gate.
- I · Green denotes conventional current, opposite to electrons. The illustrated branch fixes positive gate bias and a low BL.
- OTP · The local orange path indicates conductive oxide state; normal operation has no electrical erase.
- I_L / I_H · Short/long bars illustrate low/high read-current comparison, not measured values or fixed logic coding.
- Geometry · Historical public-source functional reconstruction, not a scale section or current layout; terminal biases are not process operating specifications.
- WL / BL · WL connects to one poly gate and BL to the sole N+ diffusion. Only the thin core oxide is shown breaking down. Horizontal carrier paths are offset for readability from the under-gate surface channel; they do not indicate conduction through the p-type bulk.

The section follows the product article’s n-type structure. Positive WL and low BL define the teaching bias from which directions are inferred. Detailed voltages from the historical p-type patent example are excluded. Split channel means neither two separate gates nor a floating gate. Acquisition announcements establish portfolio continuity; current 1T/2T or advanced-process articles do not prove this section is retained at every node.

- [ip-sidense-cell-2007: Sidense 1T-Fuse Original-Author Cell Section](https://www.chipestimate.com/1T-OTP-Memory-Delivering-Quality-and-Reliability/Sidense-a-part-of-Synopsys/Technical-Article/2007/12/18)
- [ip-sidense-irreversible-2017: Sidense 1T-Fuse Irreversibility and eMTP Boundary](https://www.chipestimate.com/Enabling-Secure-Semiconductor-Supply-Chain-Management/Sidense-a-part-of-Synopsys/Technical-Article/2017/09/05)
- [ip-sidense-patent-2006: Historical Sidense Split-Channel Antifuse Patent](https://patents.google.com/patent/US20060244099A1/en)
- [ip-lineage-sidense-2017: Synopsys Acquisition of Sidense](https://news.synopsys.com/2017-10-17-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Sidense-Corporation)
- [ip-synopsys-otp-current: Synopsys OTP NVM 1T/2T Portfolio](https://www.synopsys.com/articles/non-volatile-memory.html)
- [ip-synopsys-advanced-otp: Synopsys Advanced-Process OTP Reliability and Sensing](https://www.synopsys.com/articles/reliable-secure-otp-ip.html)

#### Sidense 1T-Fuse — Erase Boundary

Normal OTP provides no electrical erase; an ordinary reverse operation cannot restore the unprogrammed cell.

Normal OTP Operating Boundary

**1. Programmed State**

State: The programmed local oxide conduction state remains.

Stimulus: The present operation has not yet applied a stimulus.

The programmed local oxide conduction state remains.

**2. Normal Operating Boundary**

State: The normal OTP interface has no electrical erase procedure that repairs gate oxide.

Stimulus: No normal electrical erase stimulus.

The normal OTP interface has no electrical erase procedure that repairs gate oxide.

**3. Persistent State**

State: The original cell remains programmed; spare bits, remapping or eMTP emulated updates are system methods.

Stimulus: No normal electrical erase stimulus.

The original cell remains programmed; spare bits, remapping or eMTP emulated updates are system methods.

- e− · Blue dots are mobile electrons and blue arrows follow electron flow; they are not charge retained inside the gate.
- I · Green denotes conventional current, opposite to electrons. The illustrated branch fixes positive gate bias and a low BL.
- OTP · The local orange path indicates conductive oxide state; normal operation has no electrical erase.
- I_L / I_H · Short/long bars illustrate low/high read-current comparison, not measured values or fixed logic coding.
- Geometry · Historical public-source functional reconstruction, not a scale section or current layout; terminal biases are not process operating specifications.
- WL / BL · WL connects to one poly gate and BL to the sole N+ diffusion. Only the thin core oxide is shown breaking down. Horizontal carrier paths are offset for readability from the under-gate surface channel; they do not indicate conduction through the p-type bulk.

The section follows the product article’s n-type structure. Positive WL and low BL define the teaching bias from which directions are inferred. Detailed voltages from the historical p-type patent example are excluded. Split channel means neither two separate gates nor a floating gate. Acquisition announcements establish portfolio continuity; current 1T/2T or advanced-process articles do not prove this section is retained at every node.

- [ip-sidense-cell-2007: Sidense 1T-Fuse Original-Author Cell Section](https://www.chipestimate.com/1T-OTP-Memory-Delivering-Quality-and-Reliability/Sidense-a-part-of-Synopsys/Technical-Article/2007/12/18)
- [ip-sidense-irreversible-2017: Sidense 1T-Fuse Irreversibility and eMTP Boundary](https://www.chipestimate.com/Enabling-Secure-Semiconductor-Supply-Chain-Management/Sidense-a-part-of-Synopsys/Technical-Article/2017/09/05)
- [ip-sidense-patent-2006: Historical Sidense Split-Channel Antifuse Patent](https://patents.google.com/patent/US20060244099A1/en)
- [ip-lineage-sidense-2017: Synopsys Acquisition of Sidense](https://news.synopsys.com/2017-10-17-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Sidense-Corporation)
- [ip-synopsys-otp-current: Synopsys OTP NVM 1T/2T Portfolio](https://www.synopsys.com/articles/non-volatile-memory.html)
- [ip-synopsys-advanced-otp: Synopsys Advanced-Process OTP Reliability and Sensing](https://www.synopsys.com/articles/reliable-secure-otp-ip.html)

#### Sidense 1T-Fuse — Read

Compare low/high current along the WL/BL path. The macro defines logic coding and normal read preserves the state.

Oxide-Conduction Current Sensing

**1. Retained State**

State: The illustrated programmed thin region retains its conductive state without stimulus.

Stimulus: The present operation has not yet applied a stimulus.

The illustrated programmed thin region retains its conductive state without stimulus.

**2. Establish Read Conditions**

State: Use lower-stress bias for channel access and sensing. This figure uses the positive-WL, low-BL n-type teaching direction.

Stimulus: Use lower-stress bias for channel access and sensing. This figure uses the positive-WL, low-BL n-type teaching direction.

Use lower-stress bias for channel access and sensing. This figure uses the positive-WL, low-BL n-type teaching direction.

**3. Sense the Path**

State: Conventional current leaves WL through the thin-oxide breakdown path, channel and BL diffusion; electrons move from BL toward WL.

Stimulus: Use lower-stress bias for channel access and sensing. This figure uses the positive-WL, low-BL n-type teaching direction.

Conventional current leaves WL through the thin-oxide breakdown path, channel and BL diffusion; electrons move from BL toward WL.

**4. Compare the Result**

State: Compare low/high current along the WL/BL path. The macro defines logic coding and normal read preserves the state.

Stimulus: Complete sensing and interpret using macro logic.

Compare low/high current along the WL/BL path. The macro defines logic coding and normal read preserves the state.

- e− · Blue dots are mobile electrons and blue arrows follow electron flow; they are not charge retained inside the gate.
- I · Green denotes conventional current, opposite to electrons. The illustrated branch fixes positive gate bias and a low BL.
- OTP · The local orange path indicates conductive oxide state; normal operation has no electrical erase.
- I_L / I_H · Short/long bars illustrate low/high read-current comparison, not measured values or fixed logic coding.
- Geometry · Historical public-source functional reconstruction, not a scale section or current layout; terminal biases are not process operating specifications.
- WL / BL · WL connects to one poly gate and BL to the sole N+ diffusion. Only the thin core oxide is shown breaking down. Horizontal carrier paths are offset for readability from the under-gate surface channel; they do not indicate conduction through the p-type bulk.

The section follows the product article’s n-type structure. Positive WL and low BL define the teaching bias from which directions are inferred. Detailed voltages from the historical p-type patent example are excluded. Split channel means neither two separate gates nor a floating gate. Acquisition announcements establish portfolio continuity; current 1T/2T or advanced-process articles do not prove this section is retained at every node.

- [ip-sidense-cell-2007: Sidense 1T-Fuse Original-Author Cell Section](https://www.chipestimate.com/1T-OTP-Memory-Delivering-Quality-and-Reliability/Sidense-a-part-of-Synopsys/Technical-Article/2007/12/18)
- [ip-sidense-irreversible-2017: Sidense 1T-Fuse Irreversibility and eMTP Boundary](https://www.chipestimate.com/Enabling-Secure-Semiconductor-Supply-Chain-Management/Sidense-a-part-of-Synopsys/Technical-Article/2017/09/05)
- [ip-sidense-patent-2006: Historical Sidense Split-Channel Antifuse Patent](https://patents.google.com/patent/US20060244099A1/en)
- [ip-lineage-sidense-2017: Synopsys Acquisition of Sidense](https://news.synopsys.com/2017-10-17-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Sidense-Corporation)
- [ip-synopsys-otp-current: Synopsys OTP NVM 1T/2T Portfolio](https://www.synopsys.com/articles/non-volatile-memory.html)
- [ip-synopsys-advanced-otp: Synopsys Advanced-Process OTP Reliability and Sensing](https://www.synopsys.com/articles/reliable-secure-otp-ip.html)

#### IP Cell Tradeoffs

The thick region controls access and the thin region stores conductance; split channel means neither two gates nor a floating gate.

### NeoEE: FN/FN Single-Poly MTP

eMemory

Follow the control-coupling region, floating node and tunneling region as FN transport stores and removes electrons. A read transistor then senses the stored state.

#### Floating-Gate MTP in This Chapter: PGM / ERS Cycle

The same storage cell supports programming, electrical erase and subsequent programming. ERS restores a window suitable for another program operation; it does not require every carrier to disappear. Whether the host issues a separate erase command depends on the macro or component interface.

PGM → ERS → PGM

Initial: FG retains programmed charge.

FN — Carriers: electrons leave FG by FN tunneling into a MOS receiving region.

Result: reduced FG charge permits another program cycle.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

The official NeoEE page describes page/word operation units and a byte-write function. Verify the exact macro’s erase unit rather than inferring it from the host write size.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [ip-neoee: NeoEE Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoEE)
- [ip-neoee-history: Historical NeoEE Conceptual Cell](https://www.chipestimate.com/Value-Propositions-that-NeoEETM-Technology-can-Delivery/eMemory/Technical-Article/2010/10/19)

NeoEE — Cell Structure

Single-poly FG with capacitive-coupling MOS structures and selectors. Coupling and tunneling are functional roles; public evidence does not fix the device count or p/n arrangement. After high-field removal, isolated FG charge shifts the read-channel threshold.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- FG / Q− · FG is an isolated floating gate; blue minus signs indicate stored electrons.
- C / T / S / R · Coupling, tunneling, selection and read roles; not official pins or a fixed device count. T groups the MOS tunneling regions used by the operations, without asserting one physical terminal. No charge-to-ON/OFF polarity is assigned.

- [ip-neoee: NeoEE Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoEE)
- [ip-neoee-history: Historical NeoEE Conceptual Cell](https://www.chipestimate.com/Value-Propositions-that-NeoEETM-Technology-can-Delivery/eMemory/Technical-Article/2010/10/19)

#### NeoEE — Program

Carriers: electrons enter FG from a MOS tunneling region by FN tunneling.

FN

**1. Initial State**

State: Initial: FG is shown with fewer electrons.

Stimulus: Retain the stored state before the operation.

Initial: FG is shown with fewer electrons.

**2. Apply Conditions**

State: Stimulus: coupling and tunneling terminals establish oxide field.

Stimulus: Stimulus: coupling and tunneling terminals establish oxide field.

Stimulus: coupling and tunneling terminals establish oxide field.

**3. Carrier Motion**

State: Carriers: electrons enter FG from a MOS tunneling region by FN tunneling.

Stimulus: Maintain the operating conditions and observe the carrier or sensing path.

Carriers: electrons enter FG from a MOS tunneling region by FN tunneling.

**4. Retained Result**

State: Hold: field removal leaves increased FG charge.

Stimulus: Return to retention conditions after the operation.

Hold: field removal leaves increased FG charge.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- FG / Q− · FG is an isolated floating gate; blue minus signs indicate stored electrons.
- C / T / S / R · Coupling, tunneling, selection and read roles; not official pins or a fixed device count. T groups the MOS tunneling regions used by the operations, without asserting one physical terminal. No charge-to-ON/OFF polarity is assigned.

Exclude the historical CHE/FN branch; do not assert exactly two physical capacitors or that more electrons always mean ON. C, T, R and S denote coupling, tunneling, read-channel and selection functions, not official pins. Shared FG has no external supply connection.

- [ip-neoee: NeoEE Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoEE)
- [ip-neoee-history: Historical NeoEE Conceptual Cell](https://www.chipestimate.com/Value-Propositions-that-NeoEETM-Technology-can-Delivery/eMemory/Technical-Article/2010/10/19)

#### NeoEE — Erase

An FN charge-removal path enables electrical rewriting; dielectric wear and macro conditions limit cycling.

FN

**1. Programmed State**

State: Initial: FG retains programmed charge.

Stimulus: Retain the stored state before the operation.

Initial: FG retains programmed charge.

**2. Switch Terminal Conditions**

State: Stimulus: switch terminal conditions to establish charge-removal field.

Stimulus: Stimulus: switch terminal conditions to establish charge-removal field.

Stimulus: switch terminal conditions to establish charge-removal field.

**3. Remove Electrons**

State: Carriers: electrons leave FG by FN tunneling into a MOS receiving region.

Stimulus: Maintain the operating conditions and observe the carrier or sensing path.

Carriers: electrons leave FG by FN tunneling into a MOS receiving region.

**4. Ready to Reprogram**

State: Result: reduced FG charge permits another program cycle.

Stimulus: Return to retention conditions after the operation.

Result: reduced FG charge permits another program cycle.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- FG / Q− · FG is an isolated floating gate; blue minus signs indicate stored electrons.
- C / T / S / R · Coupling, tunneling, selection and read roles; not official pins or a fixed device count. T groups the MOS tunneling regions used by the operations, without asserting one physical terminal. No charge-to-ON/OFF polarity is assigned.

Exclude the historical CHE/FN branch; do not assert exactly two physical capacitors or that more electrons always mean ON. C, T, R and S denote coupling, tunneling, read-channel and selection functions, not official pins. Shared FG has no external supply connection.

- [ip-neoee: NeoEE Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoEE)
- [ip-neoee-history: Historical NeoEE Conceptual Cell](https://www.chipestimate.com/Value-Propositions-that-NeoEETM-Technology-can-Delivery/eMemory/Technical-Article/2010/10/19)

#### NeoEE — Read

Sense output current while preserving the stored state; the macro defines logic coding.

Channel-current sensing

**1. Retained State**

State: Hold: two FG charge states create different thresholds.

Stimulus: Retain the stored state before the operation.

Hold: two FG charge states create different thresholds.

**2. Select the Cell**

State: Stimulus: selectors enable the read channel.

Stimulus: Stimulus: selectors enable the read channel.

Stimulus: selectors enable the read channel.

**3. Sense the Path**

State: Path: sense channel conductance without FN charge transfer.

Stimulus: Maintain the operating conditions and observe the carrier or sensing path.

Path: sense channel conductance without FN charge transfer.

**4. Compare the Result**

State: Result: compare against a reference while preserving FG charge.

Stimulus: Return to retention conditions after the operation.

Result: compare against a reference while preserving FG charge.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- FG / Q− · FG is an isolated floating gate; blue minus signs indicate stored electrons.
- C / T / S / R · Coupling, tunneling, selection and read roles; not official pins or a fixed device count. T groups the MOS tunneling regions used by the operations, without asserting one physical terminal. No charge-to-ON/OFF polarity is assigned.

Exclude the historical CHE/FN branch; do not assert exactly two physical capacitors or that more electrons always mean ON. C, T, R and S denote coupling, tunneling, read-channel and selection functions, not official pins. Shared FG has no external supply connection.

- [ip-neoee: NeoEE Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoEE)
- [ip-neoee-history: Historical NeoEE Conceptual Cell](https://www.chipestimate.com/Value-Propositions-that-NeoEETM-Technology-can-Delivery/eMemory/Technical-Article/2010/10/19)

#### IP Cell Tradeoffs

Both update directions use tunneling, but field direction, selection and biased regions must still be distinguished. Single poly describes layer count; the division of work among coupling, tunneling and read devices explains this IP's update path.

### NeoMTP: CHI/FN Single-Poly MTP

eMemory

Compare hot-carrier programming of the p-type floating-gate cell with FN electron transfer toward a dedicated erase gate. Both operations act on the same storage node.

#### Floating-Gate MTP in This Chapter: PGM / ERS Cycle

The same storage cell supports programming, electrical erase and subsequent programming. ERS restores a window suitable for another program operation; it does not require every carrier to disappear. Whether the host issues a separate erase command depends on the macro or component interface.

PGM → ERS → PGM

Initial: FG retains programmed negative charge.

FN — Carriers: electrons tunnel from FG toward EG by FN.

Result: reduced FG electrons turn the p-channel off at specified read bias.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [ip-neomtp: NeoMTP Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP)
- [ip-neomtp-pat: Related pMOS and Edge-Erase-Gate Patent](https://patents.google.com/patent/US20030235082A1/en)
- [ip-neobit: NeoBit Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoBit)

NeoMTP — Cell Structure

Single-poly p-type FG-MOSFET related to NeoBit, with an additional erase gate EG. Dielectric separates EG and FG; they are not shorted. Dielectric isolates FG charge; EG provides an FN exit under erase conditions.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- FG / Q− · FG is an isolated floating gate; blue minus signs indicate stored electrons.
- EG / SL / SG / BL / NW · EG is the published erase function; the remaining labels are pMOS teaching terminals. EG geometry/materials are not a current layout; its arrow expresses the FG-to-EG FN path.

- [ip-neomtp: NeoMTP Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP)
- [ip-neomtp-pat: Related pMOS and Edge-Erase-Gate Patent](https://patents.google.com/patent/US20030235082A1/en)
- [ip-neobit: NeoBit Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoBit)

#### NeoMTP — Program

Carriers: hot holes induce hot electrons, which cross oxide into FG.

Hot-hole-induced electron injection

**1. Initial State**

State: Initial: less FG charge; p-channel is in the erased state.

Stimulus: Retain the stored state before the operation.

Initial: less FG charge; p-channel is in the erased state.

**2. Apply Conditions**

State: Stimulus: selection establishes a lateral channel field.

Stimulus: Stimulus: selection establishes a lateral channel field.

Stimulus: selection establishes a lateral channel field.

**3. Carrier Motion**

State: Carriers: hot holes induce hot electrons, which cross oxide into FG.

Stimulus: Maintain the operating conditions and observe the carrier or sensing path.

Carriers: hot holes induce hot electrons, which cross oxide into FG.

**4. Retained Result**

State: Hold: negative FG charge remains; p-channel conducts at read bias.

Stimulus: Return to retention conditions after the operation.

Hold: negative FG charge remains; p-channel conducts at read bias.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- FG / Q− · FG is an isolated floating gate; blue minus signs indicate stored electrons.
- EG / SL / SG / BL / NW · EG is the published erase function; the remaining labels are pMOS teaching terminals. EG geometry/materials are not a current layout; its arrow expresses the FG-to-EG FN path.

Do not draw injected holes in FG or substitute conventional nMOS CHE; historical edge n+ EG requires separate attribution. SL, SG, BL and well contact follow the pMOS concept; EG is a published erase terminal. Current EG doping, geometry and voltages are not fully disclosed. These are teaching terminals, not an official pin table.

- [ip-neomtp: NeoMTP Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP)
- [ip-neomtp-pat: Related pMOS and Edge-Erase-Gate Patent](https://patents.google.com/patent/US20030235082A1/en)
- [ip-neobit: NeoBit Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoBit)

#### NeoMTP — Erase

EG removes electrons for later reinjection; the OTP electrical-erase boundary does not apply.

FN

**1. Programmed State**

State: Initial: FG retains programmed negative charge.

Stimulus: Retain the stored state before the operation.

Initial: FG retains programmed negative charge.

**2. Switch Terminal Conditions**

State: Stimulus: EG erase conditions establish charge-removal field.

Stimulus: Stimulus: EG erase conditions establish charge-removal field.

Stimulus: EG erase conditions establish charge-removal field.

**3. Remove Electrons**

State: Carriers: electrons tunnel from FG toward EG by FN.

Stimulus: Maintain the operating conditions and observe the carrier or sensing path.

Carriers: electrons tunnel from FG toward EG by FN.

**4. Ready to Reprogram**

State: Result: reduced FG electrons turn the p-channel off at specified read bias.

Stimulus: Return to retention conditions after the operation.

Result: reduced FG electrons turn the p-channel off at specified read bias.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- FG / Q− · FG is an isolated floating gate; blue minus signs indicate stored electrons.
- EG / SL / SG / BL / NW · EG is the published erase function; the remaining labels are pMOS teaching terminals. EG geometry/materials are not a current layout; its arrow expresses the FG-to-EG FN path.

Do not draw injected holes in FG or substitute conventional nMOS CHE; historical edge n+ EG requires separate attribution. SL, SG, BL and well contact follow the pMOS concept; EG is a published erase terminal. Current EG doping, geometry and voltages are not fully disclosed. These are teaching terminals, not an official pin table.

- [ip-neomtp: NeoMTP Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP)
- [ip-neomtp-pat: Related pMOS and Edge-Erase-Gate Patent](https://patents.google.com/patent/US20030235082A1/en)
- [ip-neobit: NeoBit Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoBit)

#### NeoMTP — Read

Sense output current while preserving the stored state; the macro defines logic coding.

Channel-current sensing

**1. Retained State**

State: Hold: retain the FG state before reading; charge level affects the p-channel.

Stimulus: Retain the stored state before the operation.

Hold: retain the FG state before reading; charge level affects the p-channel.

**2. Select the Cell**

State: Stimulus: apply read conditions; EG does not erase.

Stimulus: Stimulus: apply read conditions; EG does not erase.

Stimulus: apply read conditions; EG does not erase.

**3. Sense the Path**

State: Path: holes move along the p-channel without net FG charge transfer.

Stimulus: Maintain the operating conditions and observe the carrier or sensing path.

Path: holes move along the p-channel without net FG charge transfer.

**4. Compare the Result**

State: Result: compare channel current while retaining the stored state.

Stimulus: Return to retention conditions after the operation.

Result: compare channel current while retaining the stored state.

- e− / h+ · Blue indicates electrons; red indicates holes. Arrows follow carriers.
- I · Green arrows show conventional current, opposite to electrons and aligned with holes.
- Bias · Only operating roles are shown; terminal voltages and pulse specifications are not supplied.
- Scale · Geometry and dielectrics are enlarged for readability, not a process layout.
- FG / Q− · FG is an isolated floating gate; blue minus signs indicate stored electrons.
- EG / SL / SG / BL / NW · EG is the published erase function; the remaining labels are pMOS teaching terminals. EG geometry/materials are not a current layout; its arrow expresses the FG-to-EG FN path.

Do not draw injected holes in FG or substitute conventional nMOS CHE; historical edge n+ EG requires separate attribution. SL, SG, BL and well contact follow the pMOS concept; EG is a published erase terminal. Current EG doping, geometry and voltages are not fully disclosed. These are teaching terminals, not an official pin table.

- [ip-neomtp: NeoMTP Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP)
- [ip-neomtp-pat: Related pMOS and Edge-Erase-Gate Patent](https://patents.google.com/patent/US20030235082A1/en)
- [ip-neobit: NeoBit Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoBit)

#### IP Cell Tradeoffs

CHI/FN is the operation-pair shorthand used here. eMemory describes programming as channel-hot-hole-induced hot-electron injection and labels it CHEI. The erase gate provides a separate electron exit, distinguishing this cell from NeoBit's normal OTP interface and NeoEE's FN/FN mechanism.

### YMC MTP: Program, Erase and Public Evidence

Yield Microelectronics (YMC)

YMC publicly identifies a logic-process MTP family. The CHI/BBHH sequence below is an independent mechanism illustration, not evidence that a current ymtp product uses BBHH. Separate product capability from an illustrative 1T1C model.

#### Floating-Gate MTP in This Chapter: PGM / ERS Cycle

The same storage cell supports programming, electrical erase and subsequent programming. ERS restores a window suitable for another program operation; it does not require every carrier to disappear. Whether the host issues a separate erase command depends on the macro or component interface.

PGM → ERS → PGM

FG holds net negative charge from programming.

Band-to-Band Carrier Generation Followed by Hot-Hole Injection into FG — Under this local field condition, a few red holes cross the dielectric into FG and reduce negative charge. Silicon BBT generation and subsequent dielectric injection each require suitable conditions; neither FN electron removal nor DAHHI avalanche generation is substituted.

Vth is lower and I_R is larger at the same read bias. This qualitative direction does not guarantee neutrality, a fixed endpoint or self-convergent erase.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

The cited public product sources do not establish BBHH for a current ymtp version. The diagrams illustrate independent CHI/BBHH physics; obtain the target macro’s actual PGM/ERS mechanism, biases, granularity and cycling specification.

- [ymc-product: YMC: Logic-Process ymtp MTP IP](https://www.ymc.com.tw/index_en.php)
- [ymc-1t1c: YMC: 1T1C Core Technology](https://www.ymc.com.tw/upload/files/6423%E5%84%84%E8%80%8C%E5%BE%97%E4%B8%8A%E5%B8%82%E5%89%8D%E6%A5%AD%E7%B8%BE%E7%99%BC%E8%A1%A8%E6%9C%83_%E7%B0%A1%E5%A0%B10416(%E4%B8%8A).pdf#page=25)
- [physics-bbhh-fg: Wu et al.: BBHH and Floating-Gate Demonstration](https://pure.lib.cgu.edu.tw/en/publications/a-nand-type-flash-memory-using-impact-ionization-generated-substr/)
- [physics-btbt-carriers: Chu and Wu: BTBT Hot-Carrier Paths](https://ir.lib.nycu.edu.tw/bitstream/11536/30685/1/000085620800010.pdf)
- [physics-fg-hole-erase: IEEE: Hot-Hole Injection into a Floating Gate](https://ieeexplore.ieee.org/document/748914/)

Independent Mechanism Study: CHI / BBHH Equivalent 1T1C

One nMOS and one functional coupling capacitor share FG. Official information supports ymtp and the 1T1C family; this original equivalent drawing does not assert current product junctions, wells or dimensions. FG and CG have no DC short.

- FG / Cc / CG · FG is a floating gate with no DC terminal. Cc is a functional coupling capacitor; CG is its external control terminal.
- N+ / p / B · N+ denotes model source/drain regions, p the nMOS body, and B its terminal. Concentrations, well layout and dimensions are unspecified.
- S / D* · S is the model source. D* is the selected high-field end and model drain, not a ymtp macro-pin mapping.
- e− / h+ · Blue e− and arrows represent electrons; red h+ and arrows represent holes. Particle counts and animation speed are qualitative.
- I / I_R / Iref · Green I is conventional current, opposite to electron motion. I_R is read current and Iref is the sensing reference.
- BBT / BBHH · BBT is band-to-band tunneling in silicon. BBHH uses the resulting holes for hot-hole injection; crossing the dielectric is a subsequent step.
- Vth / QFG · Vth is the effective nMOS threshold and QFG is FG charge. The actual product defines biases, sensing margins and logic encoding.

- [ymc-product: YMC: Logic-Process ymtp MTP IP](https://www.ymc.com.tw/index_en.php)
- [ymc-1t1c: YMC: 1T1C Core Technology](https://www.ymc.com.tw/upload/files/6423%E5%84%84%E8%80%8C%E5%BE%97%E4%B8%8A%E5%B8%82%E5%89%8D%E6%A5%AD%E7%B8%BE%E7%99%BC%E8%A1%A8%E6%9C%83_%E7%B0%A1%E5%A0%B10416(%E4%B8%8A).pdf#page=25)
- [physics-bbhh-fg: Wu et al.: BBHH and Floating-Gate Demonstration](https://pure.lib.cgu.edu.tw/en/publications/a-nand-type-flash-memory-using-impact-ionization-generated-substr/)

#### CHI Program: Electrons Enter the Floating Gate

CG controls the channel through the coupling capacitor. Electrons accelerate near the model high-field end; a fraction crosses the dielectric, producing higher Vth and lower read current.

Channel Hot-Carrier Injection; Electrons Enter FG in This nMOS Model

**1. Form the Conducting Channel**

State: FG holds its initial charge.

Stimulus: CG couples through Cc; D* is above S.

CG and FG remain separated by the capacitor dielectric; an electron channel forms between the model source and drain.

**2. Accelerate Channel Electrons**

State: Electrons move from S through the channel toward D*.

Stimulus: The source/drain potential difference establishes a lateral field.

Blue arrows follow electrons; green arrows show conventional current in the opposite direction. Only a fraction acquires sufficient injection energy.

**3. Inject Energetic Electrons into FG**

State: Some high-field electrons have gained energy; local E⊥ points toward silicon at the injection region.

Stimulus: Channel acceleration combines with local E⊥ toward silicon, so the electron force is toward FG.

The local vertical field is an explicit injection condition, not implied by D* relative to S alone. Electrons cross the dielectric into FG and increase negative charge; this is neither oxide rupture nor a CG-to-FG DC connection.

**4. Retain More Negative Charge**

State: FG stores more electrons after injection.

Stimulus: Remove program stimulation; compare later under read conditions.

At the same read bias, the effective nMOS has higher Vth and smaller I_R: the sensed consequence of its charge state.

- FG / Cc / CG · FG is a floating gate with no DC terminal. Cc is a functional coupling capacitor; CG is its external control terminal.
- N+ / p / B · N+ denotes model source/drain regions, p the nMOS body, and B its terminal. Concentrations, well layout and dimensions are unspecified.
- S / D* · S is the model source. D* is the selected high-field end and model drain, not a ymtp macro-pin mapping.
- e− / h+ · Blue e− and arrows represent electrons; red h+ and arrows represent holes. Particle counts and animation speed are qualitative.
- I / I_R / Iref · Green I is conventional current, opposite to electron motion. I_R is read current and Iref is the sensing reference.
- BBT / BBHH · BBT is band-to-band tunneling in silicon. BBHH uses the resulting holes for hot-hole injection; crossing the dielectric is a subsequent step.
- Vth / QFG · Vth is the effective nMOS threshold and QFG is FG charge. The actual product defines biases, sensing margins and logic encoding.

An independent CHI / BBHH teaching model; cited sources do not establish BBHH in current YMC ymtp products. It uses an equivalent 1T1C and qualitative directions rather than a current version-specific cross-section or bias table. Independent original research supports BBHH physics; YMC FN/DAHHI patent variants retain their distinct mechanisms.

- [ymc-product: YMC: Logic-Process ymtp MTP IP](https://www.ymc.com.tw/index_en.php)
- [ymc-1t1c: YMC: 1T1C Core Technology](https://www.ymc.com.tw/upload/files/6423%E5%84%84%E8%80%8C%E5%BE%97%E4%B8%8A%E5%B8%82%E5%89%8D%E6%A5%AD%E7%B8%BE%E7%99%BC%E8%A1%A8%E6%9C%83_%E7%B0%A1%E5%A0%B10416(%E4%B8%8A).pdf#page=25)
- [ymc-pat-7423903: YMC: Historical Single-Floating-Gate Example](https://patents.google.com/patent/US7423903B2/en)
- [ymc-pat-dahhi: YMC: DAHCI Program and DAHHI Erase Variant](https://patents.google.com/patent/US20070158733A1/en)

#### BBHH Erase: Holes Reduce Negative FG Charge

A high-field region in silicon first produces electron/hole pairs. Some holes then cross the dielectric into FG. Silicon BBT and hot-carrier injection into FG are distinct physical steps.

Band-to-Band Carrier Generation Followed by Hot-Hole Injection into FG

**1. Establish the High-Field Junction**

State: FG holds net negative charge from programming.

Stimulus: D* is positive relative to B; FG is lower than D*. Injection also requires local E⊥ toward FG.

Terminal relationships describe the model junction condition but do not alone guarantee the local vertical field. E⊥ toward FG is a separate condition; D* is not a current ymtp terminal specification.

**2. Generate Holes by BBT in Silicon**

State: Band bending in the high-field region permits BBT.

Stimulus: A valence-band electron tunnels into the conduction band, leaving a hole.

Electrons are collected by the high-field junction while holes move toward the channel/body side. This tunneling occurs in silicon, not across the FG oxide.

**3. Inject Hot Holes into FG**

State: Some holes have gained energy; local E⊥ points toward FG at the injection region.

Stimulus: Lateral acceleration combines with local E⊥ toward FG; hole force follows the field.

Under this local field condition, a few red holes cross the dielectric into FG and reduce negative charge. Silicon BBT generation and subsequent dielectric injection each require suitable conditions; neither FN electron removal nor DAHHI avalanche generation is substituted.

**4. Reach a Lower-Threshold State**

State: FG holds less net negative charge.

Stimulus: End erase stimulation and return to read conditions.

Vth is lower and I_R is larger at the same read bias. This qualitative direction does not guarantee neutrality, a fixed endpoint or self-convergent erase.

- FG / Cc / CG · FG is a floating gate with no DC terminal. Cc is a functional coupling capacitor; CG is its external control terminal.
- N+ / p / B · N+ denotes model source/drain regions, p the nMOS body, and B its terminal. Concentrations, well layout and dimensions are unspecified.
- S / D* · S is the model source. D* is the selected high-field end and model drain, not a ymtp macro-pin mapping.
- e− / h+ · Blue e− and arrows represent electrons; red h+ and arrows represent holes. Particle counts and animation speed are qualitative.
- I / I_R / Iref · Green I is conventional current, opposite to electron motion. I_R is read current and Iref is the sensing reference.
- BBT / BBHH · BBT is band-to-band tunneling in silicon. BBHH uses the resulting holes for hot-hole injection; crossing the dielectric is a subsequent step.
- Vth / QFG · Vth is the effective nMOS threshold and QFG is FG charge. The actual product defines biases, sensing margins and logic encoding.

An independent CHI / BBHH teaching model; cited sources do not establish BBHH in current YMC ymtp products. It uses an equivalent 1T1C and qualitative directions rather than a current version-specific cross-section or bias table. Independent original research supports BBHH physics; YMC FN/DAHHI patent variants retain their distinct mechanisms.

- [ymc-product: YMC: Logic-Process ymtp MTP IP](https://www.ymc.com.tw/index_en.php)
- [ymc-1t1c: YMC: 1T1C Core Technology](https://www.ymc.com.tw/upload/files/6423%E5%84%84%E8%80%8C%E5%BE%97%E4%B8%8A%E5%B8%82%E5%89%8D%E6%A5%AD%E7%B8%BE%E7%99%BC%E8%A1%A8%E6%9C%83_%E7%B0%A1%E5%A0%B10416(%E4%B8%8A).pdf#page=25)
- [physics-bbhh-fg: Wu et al.: BBHH and Floating-Gate Demonstration](https://pure.lib.cgu.edu.tw/en/publications/a-nand-type-flash-memory-using-impact-ionization-generated-substr/)
- [physics-btbt-carriers: Chu and Wu: BTBT Hot-Carrier Paths](https://ir.lib.nycu.edu.tw/bitstream/11536/30685/1/000085620800010.pdf)
- [physics-fg-hole-erase: IEEE: Hot-Hole Injection into a Floating Gate](https://ieeexplore.ieee.org/document/748914/)

#### Read: Translate FG Charge into a Current Difference

A and B are fixed alternative initial states, not sequential updates. At the same read bias, A has more negative charge, higher Vth and smaller current; B has the opposite. Reading preserves either state.

nMOS Threshold Modulation and Reference-Current Sensing

**1. Apply the Same Read Conditions**

State: A and B are two separately established alternative initial states.

Stimulus: CG couples a control potential; S/D* provide the same sensing conditions.

All four frames retain the same two-state comparison. There is no A-to-B program or erase and no carrier transfer across the dielectric.

**2. Alternative State A: Lower Read Current**

State: Before reading, A already has more negative charge and higher Vth.

Stimulus: Apply the same read bias used for B while retaining A charge.

This is an independent read example for A. Higher Vth gives smaller I_R; reading does not add FG electrons.

**3. Alternative State B: Higher Read Current**

State: Before reading, B already has less negative charge and lower Vth.

Stimulus: Apply the same read bias used for A while retaining B charge.

B is an alternative example, not a conversion from A in the previous frame. Lower Vth gives larger I_R; the green arrow denotes conventional current.

**4. Sense the Existing State with Iref**

State: A and B retain their respective charge and produce different read currents.

Stimulus: The sensing circuit compares I_R with Iref without updating FG.

Iref must separate the states with adequate margin; the comparison is unchanged from earlier frames. Process, temperature and usage history affect the window; product specifications define margins and 0/1 encoding.

- FG / Cc / CG · FG is a floating gate with no DC terminal. Cc is a functional coupling capacitor; CG is its external control terminal.
- N+ / p / B · N+ denotes model source/drain regions, p the nMOS body, and B its terminal. Concentrations, well layout and dimensions are unspecified.
- S / D* · S is the model source. D* is the selected high-field end and model drain, not a ymtp macro-pin mapping.
- e− / h+ · Blue e− and arrows represent electrons; red h+ and arrows represent holes. Particle counts and animation speed are qualitative.
- I / I_R / Iref · Green I is conventional current, opposite to electron motion. I_R is read current and Iref is the sensing reference.
- BBT / BBHH · BBT is band-to-band tunneling in silicon. BBHH uses the resulting holes for hot-hole injection; crossing the dielectric is a subsequent step.
- Vth / QFG · Vth is the effective nMOS threshold and QFG is FG charge. The actual product defines biases, sensing margins and logic encoding.

An independent CHI / BBHH teaching model; cited sources do not establish BBHH in current YMC ymtp products. It uses an equivalent 1T1C and qualitative directions rather than a current version-specific cross-section or bias table. Independent original research supports BBHH physics; YMC FN/DAHHI patent variants retain their distinct mechanisms.

- [ymc-product: YMC: Logic-Process ymtp MTP IP](https://www.ymc.com.tw/index_en.php)
- [ymc-1t1c: YMC: 1T1C Core Technology](https://www.ymc.com.tw/upload/files/6423%E5%84%84%E8%80%8C%E5%BE%97%E4%B8%8A%E5%B8%82%E5%89%8D%E6%A5%AD%E7%B8%BE%E7%99%BC%E8%A1%A8%E6%9C%83_%E7%B0%A1%E5%A0%B10416(%E4%B8%8A).pdf#page=25)
- [ymc-pat-dahhi: YMC: DAHCI Program and DAHHI Erase Variant](https://patents.google.com/patent/US20070158733A1/en)
- [physics-bbhh-fg: Wu et al.: BBHH and Floating-Gate Demonstration](https://pure.lib.cgu.edu.tw/en/publications/a-nand-type-flash-memory-using-impact-ionization-generated-substr/)

#### IP Cell Tradeoffs

This is the CHI/BBHH mechanism model selected for this course. Public YMC material supports its logic-process MTP IP positioning; independent primary research supports the BBHH physics. The figure is not identified as a complete cross-section of a current ymtp version. FN, drain-avalanche hot-hole injection and band-to-band hot-hole injection are distinct paths, even when related patents share an assignee.

### AEON: An Impinj-Origin FN/FN MTP Family

Impinj → Virage Logic → Synopsys

Follow the named 2009 AEON company account: electrons enter and leave FG by FN, then a read MOS senses the state. Business and brand succession have a separate timeline.

#### Floating-Gate MTP in This Chapter: PGM / ERS Cycle

The same storage cell supports programming, electrical erase and subsequent programming. ERS restores a window suitable for another program operation; it does not require every carrier to disappear. Whether the host issues a separate erase command depends on the macro or component interface.

PGM → ERS → PGM

FG retains negative charge from the previous program operation.

FN — Erase is represented as electron removal, not neutralization by injected holes.

Electrical erase and reprogramming enable MTP. Particle counts do not imply endurance, speed or retention specifications.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [aeon-impinj-2007: Impinj AEON/MTP Floating-Gate Announcement](https://www.impinj.com/about-us/news-room/2007/impinj-delivers-reprogrammable-nonvolatile-memory-ip-breakthrough---aeonmtp-worlds-first-25v-floatin)
- [aeon-virage-fn-2009: Virage Logic AEON MTP Program/Erase and Monitoring](https://www.chipestimate.com/Auto-Industry-Replaces-Fuse-Technology-with-Standard-CMOS-Based-MTP---Adds-Functionality-Testability-and-Reliability/Synopsys-formerly-Virage-Logic-products/Technical-Article/2009/06/30)

AEON MTP — Functional Cell Structure

Public FN/FN functional model: coupling role C, isolated floating gate FG, tunnel counterparts and a read MOS. Floating-gate product positioning and named FN program/erase evidence are attributed separately. This original functional reconstruction leaves undisclosed physical wiring unspecified.

- FG / e− · The brown FG is dielectric-isolated and has no external DC connection. Blue minus signs denote electrons; their count is qualitative.
- C / T_P / T_E · C denotes capacitive coupling. T_P and T_E denote program/erase tunnel counterparts. Reusing the enlarged window does not assert one physical terminal or a fixed device count.
- Si / Dielectric · Blue-gray regions represent silicon functions; pale yellow represents insulating dielectric. Doping, thickness, relative size and actual layout are unspecified.
- e− / E · Blue open arrows show electron motion. Brown arrows show the tunnel-region electric field E, opposite to electron force. Program adds FG electrons; erase removes them in this convention. No official 0/1 coding is assigned.
- A / B / I_R · A and B are functional read terminals, not official pins. The green arrow denotes conventional sensing current for A above B. MOS polarity is unspecified, so no carrier direction or fixed charge-to-ON/OFF relation is assigned.
- 2009 AEON / FN–FN · The model follows the named 2009 AEON company article. Business transfers and Synopsys branding form a separate timeline and do not prove identical internal cells across generations.

- [aeon-impinj-2007: Impinj AEON/MTP Floating-Gate Announcement](https://www.impinj.com/about-us/news-room/2007/impinj-delivers-reprogrammable-nonvolatile-memory-ip-breakthrough---aeonmtp-worlds-first-25v-floatin)
- [aeon-virage-fn-2009: Virage Logic AEON MTP Program/Erase and Monitoring](https://www.chipestimate.com/Auto-Industry-Replaces-Fuse-Technology-with-Standard-CMOS-Based-MTP---Adds-Functionality-Testability-and-Reliability/Synopsys-formerly-Virage-Logic-products/Technical-Article/2009/06/30)

#### AEON MTP — Program

FN program in the 2009 AEON company account: electrons cross dielectric into isolated FG.

FN

**1. Initial State**

State: FG holds less negative charge; this isolated charge controls the read MOS state.

Stimulus: Retention conditions; no FN high field has been established.

The initial charge is a relative illustration, not a claim that FG must be neutral.

**2. Establish the Tunnel Field**

State: Coupling and tunnel conditions establish a high field that can add electrons to FG.

Stimulus: Local E points from FG to T_P; electron force is opposite. No numerical biases are assigned.

Dielectric field enables FN; channel hot-electron injection is not substituted. C couples to FG through dielectric only.

**3. Tunnel Electrons Into FG**

State: Electrons tunnel from T_P through dielectric into FG by FN, increasing stored negative charge.

Stimulus: Maintain program field: blue arrows point toward FG; brown E arrows toward T_P.

FN crosses dielectric. No metallic short or external DC injection wire is drawn into FG.

**4. Retain the Programmed State**

State: After removing program stimulus, dielectric isolation retains the added FG charge.

Stimulus: Return to retention; FN and high-field arrows disappear.

The read device senses charge-dependent behavior. No fixed charge-to-ON or charge-to-logic-1 mapping is assumed.

- FG / e− · The brown FG is dielectric-isolated and has no external DC connection. Blue minus signs denote electrons; their count is qualitative.
- C / T_P / T_E · C denotes capacitive coupling. T_P and T_E denote program/erase tunnel counterparts. Reusing the enlarged window does not assert one physical terminal or a fixed device count.
- Si / Dielectric · Blue-gray regions represent silicon functions; pale yellow represents insulating dielectric. Doping, thickness, relative size and actual layout are unspecified.
- e− / E · Blue open arrows show electron motion. Brown arrows show the tunnel-region electric field E, opposite to electron force. Program adds FG electrons; erase removes them in this convention. No official 0/1 coding is assigned.
- A / B / I_R · A and B are functional read terminals, not official pins. The green arrow denotes conventional sensing current for A above B. MOS polarity is unspecified, so no carrier direction or fixed charge-to-ON/OFF relation is assigned.
- 2009 AEON / FN–FN · The model follows the named 2009 AEON company article. Business transfers and Synopsys branding form a separate timeline and do not prove identical internal cells across generations.

T_P/T_E are operating roles and must not be assumed to be one physical pin. MOS polarity, device count, wells, voltages and logic coding are unspecified. Do not substitute early Impinj hot-electron patents or the internal cell of every current Synopsys MTP product.

- [aeon-impinj-2007: Impinj AEON/MTP Floating-Gate Announcement](https://www.impinj.com/about-us/news-room/2007/impinj-delivers-reprogrammable-nonvolatile-memory-ip-breakthrough---aeonmtp-worlds-first-25v-floatin)
- [aeon-virage-fn-2009: Virage Logic AEON MTP Program/Erase and Monitoring](https://www.chipestimate.com/Auto-Industry-Replaces-Fuse-Technology-with-Standard-CMOS-Based-MTP---Adds-Functionality-Testability-and-Reliability/Synopsys-formerly-Virage-Logic-products/Technical-Article/2009/06/30)

#### AEON MTP — Erase

The same named source identifies FN erase; this model represents reverse updating by removing FG electrons.

FN

**1. Programmed State**

State: FG retains negative charge from the previous program operation.

Stimulus: Retention conditions; no erase high field is applied.

Reverse updating begins from the stored charge state.

**2. Establish Erase Conditions**

State: Erase conditions establish a local field that can remove electrons from FG.

Stimulus: Local E points from T_E to FG; electron force points from FG to T_E.

T_E denotes the erase tunnel counterpart. Its physical relationship to T_P is not fully disclosed by these sources.

**3. Tunnel Electrons Out of FG**

State: Electrons tunnel from FG through dielectric toward T_E by FN, reducing negative FG charge.

Stimulus: Maintain erase field; blue electron arrows oppose brown E arrows.

Erase is represented as electron removal, not neutralization by injected holes.

**4. Retain a Reprogrammable State**

State: After removing high field, FG retains its updated charge and can receive another FN program operation.

Stimulus: Return to retention; tunneling stops.

Electrical erase and reprogramming enable MTP. Particle counts do not imply endurance, speed or retention specifications.

- FG / e− · The brown FG is dielectric-isolated and has no external DC connection. Blue minus signs denote electrons; their count is qualitative.
- C / T_P / T_E · C denotes capacitive coupling. T_P and T_E denote program/erase tunnel counterparts. Reusing the enlarged window does not assert one physical terminal or a fixed device count.
- Si / Dielectric · Blue-gray regions represent silicon functions; pale yellow represents insulating dielectric. Doping, thickness, relative size and actual layout are unspecified.
- e− / E · Blue open arrows show electron motion. Brown arrows show the tunnel-region electric field E, opposite to electron force. Program adds FG electrons; erase removes them in this convention. No official 0/1 coding is assigned.
- A / B / I_R · A and B are functional read terminals, not official pins. The green arrow denotes conventional sensing current for A above B. MOS polarity is unspecified, so no carrier direction or fixed charge-to-ON/OFF relation is assigned.
- 2009 AEON / FN–FN · The model follows the named 2009 AEON company article. Business transfers and Synopsys branding form a separate timeline and do not prove identical internal cells across generations.

T_P/T_E are operating roles and must not be assumed to be one physical pin. MOS polarity, device count, wells, voltages and logic coding are unspecified. Do not substitute early Impinj hot-electron patents or the internal cell of every current Synopsys MTP product.

- [aeon-impinj-2007: Impinj AEON/MTP Floating-Gate Announcement](https://www.impinj.com/about-us/news-room/2007/impinj-delivers-reprogrammable-nonvolatile-memory-ip-breakthrough---aeonmtp-worlds-first-25v-floatin)
- [aeon-virage-fn-2009: Virage Logic AEON MTP Program/Erase and Monitoring](https://www.chipestimate.com/Auto-Industry-Replaces-Fuse-Technology-with-Standard-CMOS-Based-MTP---Adds-Functionality-Testability-and-Reliability/Synopsys-formerly-Virage-Logic-products/Technical-Article/2009/06/30)

#### AEON MTP — Read

Sense the read MOS under low stimulus; all frames retain the same charge without assigning p/n polarity or logic coding.

MOS current sensing

**1. Retain the Existing Charge**

State: All four frames preserve the same FG charge; reading is not a second program operation.

Stimulus: Sensing has not started.

Isolated charge affects MOS behavior. MOS polarity is unspecified, so no fixed ON/OFF mapping is imposed.

**2. Select and Apply Read Conditions**

State: Read terminals establish a small sensing potential difference while FG charge remains unchanged.

Stimulus: The model takes A above B; the green arrow is conventional current from A to B.

Read conditions do not establish an FN update field. A and B are teaching terminals, not a macro pin table.

**3. Sense the Channel Current**

State: The read path supplies I_R associated with the existing stored state.

Stimulus: Maintain read bias and measure sensing current.

Current flows through the read device, without transporting stored charge through FG or the tunnel dielectric.

**4. Compare and Preserve Data**

State: Compare I_R with a reference; FG charge still matches the first frame.

Stimulus: Sample the sensing result; read bias can then be removed.

Reference strategy, differential implementation and 0/1 coding belong to a specific macro. Automotive differential-cell options are not generalized to all AEON products.

- FG / e− · The brown FG is dielectric-isolated and has no external DC connection. Blue minus signs denote electrons; their count is qualitative.
- C / T_P / T_E · C denotes capacitive coupling. T_P and T_E denote program/erase tunnel counterparts. Reusing the enlarged window does not assert one physical terminal or a fixed device count.
- Si / Dielectric · Blue-gray regions represent silicon functions; pale yellow represents insulating dielectric. Doping, thickness, relative size and actual layout are unspecified.
- e− / E · Blue open arrows show electron motion. Brown arrows show the tunnel-region electric field E, opposite to electron force. Program adds FG electrons; erase removes them in this convention. No official 0/1 coding is assigned.
- A / B / I_R · A and B are functional read terminals, not official pins. The green arrow denotes conventional sensing current for A above B. MOS polarity is unspecified, so no carrier direction or fixed charge-to-ON/OFF relation is assigned.
- 2009 AEON / FN–FN · The model follows the named 2009 AEON company article. Business transfers and Synopsys branding form a separate timeline and do not prove identical internal cells across generations.

T_P/T_E are operating roles and must not be assumed to be one physical pin. MOS polarity, device count, wells, voltages and logic coding are unspecified. Do not substitute early Impinj hot-electron patents or the internal cell of every current Synopsys MTP product.

- [aeon-impinj-2007: Impinj AEON/MTP Floating-Gate Announcement](https://www.impinj.com/about-us/news-room/2007/impinj-delivers-reprogrammable-nonvolatile-memory-ip-breakthrough---aeonmtp-worlds-first-25v-floatin)
- [aeon-virage-fn-2009: Virage Logic AEON MTP Program/Erase and Monitoring](https://www.chipestimate.com/Auto-Industry-Replaces-Fuse-Technology-with-Standard-CMOS-Based-MTP---Adds-Functionality-Testability-and-Reliability/Synopsys-formerly-Virage-Logic-products/Technical-Article/2009/06/30)

#### IP Cell Tradeoffs

AEON is a named logic-process MTP family originating at Impinj. A 2009 Virage Logic company article explicitly supports FN program and erase. The diagram retains that physical scope through C, T_P, T_E and read-MOS roles, without assuming undisclosed p/n polarity, device count or current wiring.

### Numem: Embedded STT-MRAM IP Cell

Numem

Connect foundry-standard STT-MRAM cells to embedded IP by identifying the magnetic junction, access transistor, bit line, source line and sensing path.

#### Erase Semantics: Direct Magnetic Overwrite, No Separate ERS

MRAM overwrites existing data by changing magnetic state, without a Flash-style erase-before-program step. Clearing to all zeros or ones is a series of target-state writes; the P/AP-to-data mapping is product-specific.

P ⇄ AP

P

MTJ free-layer magnetization stores information — Magnetization reaches AP; the intermediate angle is not a measured trajectory or deterministic switching time.

Turn WL off and remove bias to retain the moment; the other drive overwrites the opposite data without a floating-gate erase step.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [ip-numem-current: Numem: Public MRAM IP Positioning](https://www.numem.com/)
- [ip-numem-2019: Numem: First-Generation 22nm Embedded MRAM Presentation](https://files.futurememorystorage.com/proceedings/2019/08-05-Monday/20190805_MRAMDD_EmbeddedMRAM_Hendrickson.pdf)
- [ip-stt-physics: Everspin: STT Family Physics](https://www.everspin.com/stt-mram-technology)

Numem MRAM IP: STT Teaching Reconstruction

FL/tunnel barrier/RL represent STT functions; A/B are teaching terminals. WL/BL/SL follow the 2019 Numem architecture without claiming a layer-to-line mapping.

- FL / RL · Free/reference layers; arrows are moments, not particle flow
- Ic / e− · Orange solid line: conventional current; blue dashed electrons flow oppositely
- A / B; BL* / SL* · A/B define drawing terminals; asterisks mean the actual layer-to-array-line mapping is not asserted
- WL; P / AP · Word-line selection; parallel low resistance / antiparallel high resistance
- τSTT · Spin-transfer torque; the intermediate arrow only illustrates reversal

- [ip-numem-current: Numem: Public MRAM IP Positioning](https://www.numem.com/)
- [ip-numem-2019: Numem: First-Generation 22nm Embedded MRAM Presentation](https://files.futurememorystorage.com/proceedings/2019/08-05-Monday/20190805_MRAMDD_EmbeddedMRAM_Hendrickson.pdf)
- [ip-stt-physics: Everspin: STT Family Physics](https://www.everspin.com/stt-mram-technology)

#### Numem MRAM IP: STT Teaching Reconstruction — Write

Write free-layer magnetization through spin-transfer torque.

MTJ free-layer magnetization stores information

**1. Initial AP State**

State: AP

Stimulus: WL off; drive zero

WL is off and the cell retains AP; this sequence writes P.

**2. Select and Apply Spin Drive**

State: Switching

Stimulus: WL on; bidirectional MTJ drive

WL turns on and teaching drive A/B crosses the MTJ; electron and conventional-current arrows oppose each other. The actual BL/SL layer mapping requires the PDK.

**3. Free Layer Switches to P**

State: P

Stimulus: WL on; bidirectional MTJ drive

Magnetization reaches P; the intermediate angle is not a measured trajectory or deterministic switching time.

**4. Remove Drive and Retain P**

State: P

Stimulus: WL off; drive zero

Turn WL off and remove bias to retain the moment; the other drive overwrites the opposite data without a floating-gate erase step.

- FL / RL · Free/reference layers; arrows are moments, not particle flow
- Ic / e− · Orange solid line: conventional current; blue dashed electrons flow oppositely
- A / B; BL* / SL* · A/B define drawing terminals; asterisks mean the actual layer-to-array-line mapping is not asserted
- WL; P / AP · Word-line selection; parallel low resistance / antiparallel high resistance
- τSTT · Spin-transfer torque; the intermediate arrow only illustrates reversal

This reconstructs the public Numem IP architecture for teaching. Current sources do not disclose materials, thicknesses, vertical order, write-terminal polarity, or logic encoding. Directions A/B mean two calibrated opposite drives. The 2019 forced-current read is not a specification for every product.

- [ip-numem-current: Numem: Public MRAM IP Positioning](https://www.numem.com/)
- [ip-numem-2019: Numem: First-Generation 22nm Embedded MRAM Presentation](https://files.futurememorystorage.com/proceedings/2019/08-05-Monday/20190805_MRAMDD_EmbeddedMRAM_Hendrickson.pdf)
- [ip-stt-physics: Everspin: STT Family Physics](https://www.everspin.com/stt-mram-technology)

#### Numem MRAM IP: STT Teaching Reconstruction — Reverse Overwrite

Use the opposite MTJ drive to overwrite magnetization.

MTJ free-layer magnetization stores information

**1. Initial P State**

State: P

Stimulus: WL off; drive zero

WL is off and the cell retains P; this sequence overwrites AP.

**2. Select and Apply Reverse Spin Drive**

State: Switching

Stimulus: WL on; bidirectional MTJ drive

WL turns on and teaching drive A/B crosses the MTJ; electron and conventional-current arrows oppose each other. The actual BL/SL layer mapping requires the PDK.

**3. Free Layer Switches to AP**

State: AP

Stimulus: WL on; bidirectional MTJ drive

Magnetization reaches AP; the intermediate angle is not a measured trajectory or deterministic switching time.

**4. Remove Drive and Retain AP**

State: AP

Stimulus: WL off; drive zero

Turn WL off and remove bias to retain the moment; the other drive overwrites the opposite data without a floating-gate erase step.

- FL / RL · Free/reference layers; arrows are moments, not particle flow
- Ic / e− · Orange solid line: conventional current; blue dashed electrons flow oppositely
- A / B; BL* / SL* · A/B define drawing terminals; asterisks mean the actual layer-to-array-line mapping is not asserted
- WL; P / AP · Word-line selection; parallel low resistance / antiparallel high resistance
- τSTT · Spin-transfer torque; the intermediate arrow only illustrates reversal

This reconstructs the public Numem IP architecture for teaching. Current sources do not disclose materials, thicknesses, vertical order, write-terminal polarity, or logic encoding. Directions A/B mean two calibrated opposite drives. The 2019 forced-current read is not a specification for every product.

- [ip-numem-current: Numem: Public MRAM IP Positioning](https://www.numem.com/)
- [ip-numem-2019: Numem: First-Generation 22nm Embedded MRAM Presentation](https://files.futurememorystorage.com/proceedings/2019/08-05-Monday/20190805_MRAMDD_EmbeddedMRAM_Hendrickson.pdf)
- [ip-stt-physics: Everspin: STT Family Physics](https://www.everspin.com/stt-mram-technology)

#### Numem MRAM IP: STT Teaching Reconstruction — Read

Select the same cell, sense its retained resistance with a small stimulus, then latch and isolate.

MTJ free-layer magnetization stores information

**1. Before Selection: P Is Retained**

State: P remains unchanged

Stimulus: WL off; read stimulus zero

The same cell starts in retained P with WL off; reading does not first reverse its moment.

**2. Forced Current Produces Sense Voltage**

State: P remains unchanged

Stimulus: WL on; small read stimulus

Following the 2019 architecture, a small forced current produces a voltage including access-path resistance; P voltage is below AP at equal current.

**3. Latch and Remove Read Stimulus**

State: P remains unchanged

Stimulus: WL off; read stimulus zero

After the sensor latches, WL turns off; free/reference layers remain P without a read-restore cycle.

- FL / RL · Free/reference layers; arrows are moments, not particle flow
- Ic / e− · Orange solid line: conventional current; blue dashed electrons flow oppositely
- A / B; BL* / SL* · A/B define drawing terminals; asterisks mean the actual layer-to-array-line mapping is not asserted
- WL; P / AP · Word-line selection; parallel low resistance / antiparallel high resistance
- τSTT · Spin-transfer torque; the intermediate arrow only illustrates reversal

This reconstructs the public Numem IP architecture for teaching. Current sources do not disclose materials, thicknesses, vertical order, write-terminal polarity, or logic encoding. Directions A/B mean two calibrated opposite drives. The 2019 forced-current read is not a specification for every product.

- [ip-numem-current: Numem: Public MRAM IP Positioning](https://www.numem.com/)
- [ip-numem-2019: Numem: First-Generation 22nm Embedded MRAM Presentation](https://files.futurememorystorage.com/proceedings/2019/08-05-Monday/20190805_MRAMDD_EmbeddedMRAM_Hendrickson.pdf)
- [ip-stt-physics: Everspin: STT Family Physics](https://www.everspin.com/stt-mram-technology)

#### IP Cell Tradeoffs

Numem can use foundry-standard STT cells while integrating its layout, circuits and memory architecture. Understand the two junction states and access/sense paths before considering macro behavior; a control-architecture improvement is not a new storage mechanism.

### GLOBALFOUNDRIES: 22FDX Embedded MRAM Cell

GLOBALFOUNDRIES

Use a publicly reported 22FDX research cell to examine 1T1MTJ, free and reference layers, and bidirectional switching under the source's current convention.

#### Erase Semantics: Direct Magnetic Overwrite, No Separate ERS

MRAM overwrites existing data by changing magnetic state, without a Flash-style erase-before-program step. Clearing to all zeros or ones is a series of target-state writes; the P/AP-to-data mapping is product-specific.

P ⇄ AP

P

P/AP magnetization and resistance in 1T1MTJ — Magnetization reaches AP; the intermediate angle is not a measured trajectory or deterministic switching time.

Turn WL off and remove bias to retain the moment; the other drive overwrites the opposite data without a floating-gate erase step.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [ip-gf-platform: GF: 22FDX Embedded MRAM Platform](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram)
- [ip-gf-cell-2024: GF Coauthored Research: 22FDX STT-MRAM Cells](https://pmc.ncbi.nlm.nih.gov/articles/PMC11409953/)

GF 22FDX eMRAM: Published Research Cell

The 2024 research uses CoFeB free/reference layers, a tunnel barrier, SAF pinning, and an access transistor. Their vertical placement here defines a drawing coordinate.

- FL / RL · Free/reference layers; arrows are moments, not particle flow
- Ic / e− · Orange solid line: conventional current; blue dashed electrons flow oppositely
- A / B; BL* / SL* · A/B define drawing terminals; asterisks mean the actual layer-to-array-line mapping is not asserted
- WL; P / AP · Word-line selection; parallel low resistance / antiparallel high resistance
- τSTT · Spin-transfer torque; the intermediate arrow only illustrates reversal

- [ip-gf-platform: GF: 22FDX Embedded MRAM Platform](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram)
- [ip-gf-cell-2024: GF Coauthored Research: 22FDX STT-MRAM Cells](https://pmc.ncbi.nlm.nih.gov/articles/PMC11409953/)

#### GF 22FDX eMRAM: Published Research Cell — Write

Write free-layer magnetization through spin-transfer torque.

P/AP magnetization and resistance in 1T1MTJ

**1. Initial AP State**

State: AP

Stimulus: WL off; drive zero

WL is off and the cell retains AP; this sequence writes P.

**2. Select and Apply Spin Drive**

State: Switching

Stimulus: WL on; bidirectional MTJ drive

WL turns on; conventional current RL-to-FL applies STT, with opposite electron flow.

**3. Free Layer Switches to P**

State: P

Stimulus: WL on; bidirectional MTJ drive

Magnetization reaches P; the intermediate angle is not a measured trajectory or deterministic switching time.

**4. Remove Drive and Retain P**

State: P

Stimulus: WL off; drive zero

Turn WL off and remove bias to retain the moment; the other drive overwrites the opposite data without a floating-gate erase step.

- FL / RL · Free/reference layers; arrows are moments, not particle flow
- Ic / e− · Orange solid line: conventional current; blue dashed electrons flow oppositely
- A / B; BL* / SL* · A/B define drawing terminals; asterisks mean the actual layer-to-array-line mapping is not asserted
- WL; P / AP · Word-line selection; parallel low resistance / antiparallel high resistance
- τSTT · Spin-transfer torque; the intermediate arrow only illustrates reversal

Polarity follows this paper: positive Ic flows RL-to-FL and writes P; reverse writes AP. This sign convention and recipe are not universal to MRAM. Obtain BL/SL layer mapping and values from the PDK; undisclosed barrier material and exact thicknesses are omitted.

- [ip-gf-platform: GF: 22FDX Embedded MRAM Platform](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram)
- [ip-gf-cell-2024: GF Coauthored Research: 22FDX STT-MRAM Cells](https://pmc.ncbi.nlm.nih.gov/articles/PMC11409953/)

#### GF 22FDX eMRAM: Published Research Cell — Reverse Overwrite

Use the opposite MTJ drive to overwrite magnetization.

P/AP magnetization and resistance in 1T1MTJ

**1. Initial P State**

State: P

Stimulus: WL off; drive zero

WL is off and the cell retains P; this sequence overwrites AP.

**2. Select and Apply Reverse Spin Drive**

State: Switching

Stimulus: WL on; bidirectional MTJ drive

WL turns on; conventional current FL-to-RL applies STT, with opposite electron flow.

**3. Free Layer Switches to AP**

State: AP

Stimulus: WL on; bidirectional MTJ drive

Magnetization reaches AP; the intermediate angle is not a measured trajectory or deterministic switching time.

**4. Remove Drive and Retain AP**

State: AP

Stimulus: WL off; drive zero

Turn WL off and remove bias to retain the moment; the other drive overwrites the opposite data without a floating-gate erase step.

- FL / RL · Free/reference layers; arrows are moments, not particle flow
- Ic / e− · Orange solid line: conventional current; blue dashed electrons flow oppositely
- A / B; BL* / SL* · A/B define drawing terminals; asterisks mean the actual layer-to-array-line mapping is not asserted
- WL; P / AP · Word-line selection; parallel low resistance / antiparallel high resistance
- τSTT · Spin-transfer torque; the intermediate arrow only illustrates reversal

Polarity follows this paper: positive Ic flows RL-to-FL and writes P; reverse writes AP. This sign convention and recipe are not universal to MRAM. Obtain BL/SL layer mapping and values from the PDK; undisclosed barrier material and exact thicknesses are omitted.

- [ip-gf-platform: GF: 22FDX Embedded MRAM Platform](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram)
- [ip-gf-cell-2024: GF Coauthored Research: 22FDX STT-MRAM Cells](https://pmc.ncbi.nlm.nih.gov/articles/PMC11409953/)

#### GF 22FDX eMRAM: Published Research Cell — Read

Select the same cell, sense its retained resistance with a small stimulus, then latch and isolate.

P/AP magnetization and resistance in 1T1MTJ

**1. Before Selection: P Is Retained**

State: P remains unchanged

Stimulus: WL off; read stimulus zero

The same cell starts in retained P with WL off; reading does not first reverse its moment.

**2. Low Bias Produces Sense Current**

State: P remains unchanged

Stimulus: WL on; small read stimulus

WL enables a low-bias current through the MTJ/access device; P has greater current than AP at equal bias.

**3. Latch and Remove Read Stimulus**

State: P remains unchanged

Stimulus: WL off; read stimulus zero

After the sensor latches, WL turns off; free/reference layers remain P without a read-restore cycle.

- FL / RL · Free/reference layers; arrows are moments, not particle flow
- Ic / e− · Orange solid line: conventional current; blue dashed electrons flow oppositely
- A / B; BL* / SL* · A/B define drawing terminals; asterisks mean the actual layer-to-array-line mapping is not asserted
- WL; P / AP · Word-line selection; parallel low resistance / antiparallel high resistance
- τSTT · Spin-transfer torque; the intermediate arrow only illustrates reversal

Polarity follows this paper: positive Ic flows RL-to-FL and writes P; reverse writes AP. This sign convention and recipe are not universal to MRAM. Obtain BL/SL layer mapping and values from the PDK; undisclosed barrier material and exact thicknesses are omitted.

- [ip-gf-platform: GF: 22FDX Embedded MRAM Platform](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram)
- [ip-gf-cell-2024: GF Coauthored Research: 22FDX STT-MRAM Cells](https://pmc.ncbi.nlm.nih.gov/articles/PMC11409953/)

#### IP Cell Tradeoffs

A foundry embedded macro joins the magnetic junction to logic processing, the access transistor and reliability conditions. This figure retains the named study's materials and polarity convention for step-by-step reading; those details do not automatically describe every current 22FDX memory version.

### Weebit Nano: Silicon-Oxide ReRAM IP Cell

Weebit Nano

Follow oxygen exchange, a defect-related conduction path and access-transistor current compliance in a public silicon-oxide research structure to understand embedded ReRAM SET, RESET and read.

#### Erase Semantics: RESET Followed by Another SET

RESET is the reverse data-state update from low to high resistance; a later SET restores low resistance. This is reversible resistance switching rather than Flash-style block erase. The circuit defines logical zero/one encoding.

SET → RESET → SET

LRS

Oxygen-ion exchange and an oxygen-vacancy conduction path — Oxygen recombines with vacancies and opens a critical BE-side gap; RESET does not restore the entire layer to its as-fabricated material.

HRS remains after bias removal; vacancies and interfacial oxygen may remain.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [ip-weebit-product: Weebit: Embedded ReRAM IP](https://www.weebit-nano.com/products/embedded-reram-ip/)
- [ip-weebit-bitcell: Weebit: ReRAM Bitcell](https://www.weebit-nano.com/technology/reram-bitcell/)
- [ip-weebit-cell-2021: Weebit/CEA-Leti/Silvaco: Original Oxide ReRAM Model](https://www.weebit-nano.com/wp-content/uploads/2021/05/Weebit-nano_Silvaco_ReRAM-TCAD_Oxide-Based-Model_IMW_OxRAM_2021_published-on-IEEE_V3-1.pdf)

Weebit ReRAM IP: CEA Research Cell

Uses the coauthored CEA 130nm 1T1R: Ti top electrode, SiOx switching layer, and TiN bottom electrode. The access transistor selects and limits current.

- Ti / SiOx / TiN · Top electrode/switching oxide/bottom electrode, limited to the public CEA example
- O²− / VO · Filled blue circles are oxygen ions; open orange circles are vacancies, with no silver metal
- TE / BE; WL · Top/bottom electrodes and select gate; TE bias is referenced to BE
- Ic / e− · Conventional current and electrons flow oppositely; neither denotes oxygen motion

- [ip-weebit-product: Weebit: Embedded ReRAM IP](https://www.weebit-nano.com/products/embedded-reram-ip/)
- [ip-weebit-bitcell: Weebit: ReRAM Bitcell](https://www.weebit-nano.com/technology/reram-bitcell/)
- [ip-weebit-cell-2021: Weebit/CEA-Leti/Silvaco: Original Oxide ReRAM Model](https://www.weebit-nano.com/wp-content/uploads/2021/05/Weebit-nano_Silvaco_ReRAM-TCAD_Oxide-Based-Model_IMW_OxRAM_2021_published-on-IEEE_V3-1.pdf)

#### Weebit ReRAM IP: CEA Research Cell — SET Write

Positive TE bias restores the conduction path and produces low resistance.

Oxygen-ion exchange and an oxygen-vacancy conduction path

**1. Initial High-R Gap**

State: HRS

Stimulus: WL off; TE bias zero

Start in a formed HRS with a local BE-side gap; forming is not repeated on every cycle.

**2. Oxygen Moves toward the Ti Interface**

State: Switching

Stimulus: WL on; positive TE bias

Positive TE drives O²− toward Ti for interfacial exchange; the access transistor limits current.

**3. Vacancy Path Reconnects**

State: LRS

Stimulus: WL on; positive TE bias

The oxygen-deficient conduction path reconnects; current rises under compliance.

**4. Remove Bias and Retain Low R**

State: LRS

Stimulus: WL off; TE bias zero

After removing bias and WL selection, the path retains LRS.

- Ti / SiOx / TiN · Top electrode/switching oxide/bottom electrode, limited to the public CEA example
- O²− / VO · Filled blue circles are oxygen ions; open orange circles are vacancies, with no silver metal
- TE / BE; WL · Top/bottom electrodes and select gate; TE bias is referenced to BE
- Ic / e− · Conventional current and electrons flow oppositely; neither denotes oxygen motion

This is the public Weebit/CEA-Leti/Silvaco research model, not a product recipe for every foundry node. SET: positive TE, O²− toward Ti. RESET: negative TE, oxygen returns into SiOx and recombines near the BE-side path. Forming is an initial condition, not every write.

- [ip-weebit-product: Weebit: Embedded ReRAM IP](https://www.weebit-nano.com/products/embedded-reram-ip/)
- [ip-weebit-bitcell: Weebit: ReRAM Bitcell](https://www.weebit-nano.com/technology/reram-bitcell/)
- [ip-weebit-cell-2021: Weebit/CEA-Leti/Silvaco: Original Oxide ReRAM Model](https://www.weebit-nano.com/wp-content/uploads/2021/05/Weebit-nano_Silvaco_ReRAM-TCAD_Oxide-Based-Model_IMW_OxRAM_2021_published-on-IEEE_V3-1.pdf)

#### Weebit ReRAM IP: CEA Research Cell — Reverse RESET

Reverse TE bias interrupts the conduction path and produces high resistance.

Oxygen-ion exchange and an oxygen-vacancy conduction path

**1. Initial Vacancy Path Conducts**

State: LRS

Stimulus: WL off; TE bias zero

A vacancy path already exists; this operation changes LRS to HRS.

**2. Reverse Bias Returns Oxygen**

State: Switching

Stimulus: WL on; negative TE bias

TE is negative relative to BE; oxygen returns from the Ti interface into SiOx. Blue arrows denote oxygen motion.

**3. The BE-Side Path Breaks**

State: HRS

Stimulus: WL on; negative TE bias

Oxygen recombines with vacancies and opens a critical BE-side gap; RESET does not restore the entire layer to its as-fabricated material.

**4. Remove Bias and Retain High R**

State: HRS

Stimulus: WL off; TE bias zero

HRS remains after bias removal; vacancies and interfacial oxygen may remain.

- Ti / SiOx / TiN · Top electrode/switching oxide/bottom electrode, limited to the public CEA example
- O²− / VO · Filled blue circles are oxygen ions; open orange circles are vacancies, with no silver metal
- TE / BE; WL · Top/bottom electrodes and select gate; TE bias is referenced to BE
- Ic / e− · Conventional current and electrons flow oppositely; neither denotes oxygen motion

This is the public Weebit/CEA-Leti/Silvaco research model, not a product recipe for every foundry node. SET: positive TE, O²− toward Ti. RESET: negative TE, oxygen returns into SiOx and recombines near the BE-side path. Forming is an initial condition, not every write.

- [ip-weebit-product: Weebit: Embedded ReRAM IP](https://www.weebit-nano.com/products/embedded-reram-ip/)
- [ip-weebit-bitcell: Weebit: ReRAM Bitcell](https://www.weebit-nano.com/technology/reram-bitcell/)
- [ip-weebit-cell-2021: Weebit/CEA-Leti/Silvaco: Original Oxide ReRAM Model](https://www.weebit-nano.com/wp-content/uploads/2021/05/Weebit-nano_Silvaco_ReRAM-TCAD_Oxide-Based-Model_IMW_OxRAM_2021_published-on-IEEE_V3-1.pdf)

#### Weebit ReRAM IP: CEA Research Cell — Read

Select the same cell, sense its retained resistance with a small stimulus, then latch and isolate.

Oxygen-ion exchange and an oxygen-vacancy conduction path

**1. Before Selection: Low-R Structure Is Retained**

State: LRS structure retained

Stimulus: WL off; TE bias zero

The same cell starts in retained LRS with selection off. HRS can follow the same read sequence.

**2. Sense the Path at Small Bias**

State: LRS structure retained

Stimulus: WL on; small positive TE bias

A small bias senses the vacancy path; ILRS > IHRS at equal bias, without using the read pulse to rearrange oxygen.

**3. Latch and Isolate the Cell**

State: LRS structure retained

Stimulus: WL off; TE bias zero

After latching, remove bias and retain the original path; actual read-disturb limits remain supplier-specific.

- Ti / SiOx / TiN · Top electrode/switching oxide/bottom electrode, limited to the public CEA example
- O²− / VO · Filled blue circles are oxygen ions; open orange circles are vacancies, with no silver metal
- TE / BE; WL · Top/bottom electrodes and select gate; TE bias is referenced to BE
- Ic / e− · Conventional current and electrons flow oppositely; neither denotes oxygen motion

This is the public Weebit/CEA-Leti/Silvaco research model, not a product recipe for every foundry node. SET: positive TE, O²− toward Ti. RESET: negative TE, oxygen returns into SiOx and recombines near the BE-side path. Forming is an initial condition, not every write.

- [ip-weebit-product: Weebit: Embedded ReRAM IP](https://www.weebit-nano.com/products/embedded-reram-ip/)
- [ip-weebit-bitcell: Weebit: ReRAM Bitcell](https://www.weebit-nano.com/technology/reram-bitcell/)
- [ip-weebit-cell-2021: Weebit/CEA-Leti/Silvaco: Original Oxide ReRAM Model](https://www.weebit-nano.com/wp-content/uploads/2021/05/Weebit-nano_Silvaco_ReRAM-TCAD_Oxide-Based-Model_IMW_OxRAM_2021_published-on-IEEE_V3-1.pdf)

#### IP Cell Tradeoffs

In this named research example, the storage medium, oxygen-exchange electrode and access transistor jointly shape switching. Current compliance and read stimulus are part of cell operation. Materials and recipes remain scoped to the cited implementation.

### Crossbar: Metallic-Path Embedded ReRAM Cell

Crossbar

Read Crossbar's public patent and historical embedded-macro materials through metallic-path extension, retraction and low-stimulus sensing.

#### Erase Semantics: RESET Followed by Another SET

RESET is the reverse data-state update from low to high resistance; a later SET restores low resistance. This is reversible resistance switching rather than Flash-style block erase. The circuit defines logical zero/one encoding.

SET → RESET → SET

LRS

Extension/retraction from an upper metal region changes interparticle tunneling — The effective lower-side spacing increases and tunneling current falls; the upper residual metal region remains.

HRS remains after bias removal. This is reverse RESET, without a preceding block-erase cycle.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [ip-crossbar-macro: Crossbar: High-Performance ReRAM IP Brief](https://www.crossbar-inc.com/assets/white-papers/High-Performance-Memory-Product-Brief.pdf)
- [ip-crossbar-2015: Crossbar: Original Embedded 1T1R and Metallic-Path Presentation](https://www.crossbar-inc.com/assets/resources/presentations/FMS2015-Slides-Versatile-ReRAM-Technology-and-Applications.pdf)
- [ip-crossbar-cell-2012: Crossbar: Published Patent Application US20120007035A1](https://patents.google.com/patent/US20120007035A1/en)

Crossbar ReRAM IP: Historical Patent Cell

Selects the Ag/amorphous-Si/p+ poly-Si embodiment of US20120007035A1; an access transistor represents the separately published embedded 1T1R integration.

- Ag / a-Si / p+ poly-Si · Silver top electrode/amorphous silicon/selected lower buffer-contact embodiment
- Ag · Purple region and dots denote metal region/particles without asserting each charge state
- TE / BE; WL · Top/bottom electrodes and select gate; 1T1R integration has a separate manufacturer source
- Ic / e− · Conventional current opposes electron motion; electrons may tunnel between neighboring particles

- [ip-crossbar-macro: Crossbar: High-Performance ReRAM IP Brief](https://www.crossbar-inc.com/assets/white-papers/High-Performance-Memory-Product-Brief.pdf)
- [ip-crossbar-2015: Crossbar: Original Embedded 1T1R and Metallic-Path Presentation](https://www.crossbar-inc.com/assets/resources/presentations/FMS2015-Slides-Versatile-ReRAM-Technology-and-Applications.pdf)
- [ip-crossbar-cell-2012: Crossbar: Published Patent Application US20120007035A1](https://patents.google.com/patent/US20120007035A1/en)

#### Crossbar ReRAM IP: Historical Patent Cell — SET Write

Positive TE bias restores the conduction path and produces low resistance.

Extension/retraction from an upper metal region changes interparticle tunneling

**1. High-R State after Forming**

State: HRS

Stimulus: WL off; TE bias zero

Forming has established an upper metal region; the HRS particle path does not yet extend effectively toward the lower contact.

**2. Positive Bias Extends the Particle Path**

State: Switching

Stimulus: WL on; positive TE bias

Positive TE bias extends the path from the upper metal region toward BE, following this patent rather than assuming generic upward cathodic nucleation.

**3. Interparticle Tunneling Path Strengthens**

State: LRS

Stimulus: WL on; positive TE bias

Closer neighboring metal particles strengthen tunneling conduction; the dots do not claim a fully solid silver bridge.

**4. Remove Bias and Retain Low R**

State: LRS

Stimulus: WL off; TE bias zero

Turn selection off and remove bias to retain the low-R path.

- Ag / a-Si / p+ poly-Si · Silver top electrode/amorphous silicon/selected lower buffer-contact embodiment
- Ag · Purple region and dots denote metal region/particles without asserting each charge state
- TE / BE; WL · Top/bottom electrodes and select gate; 1T1R integration has a separate manufacturer source
- Ic / e− · Conventional current opposes electron motion; electrons may tunnel between neighboring particles

This is a published patent embodiment associated with historical embedded IP, not proof of current macro recipes or newly licensable nodes in 2026. The patent describes metal particles and interparticle tunneling; the path is not equated to a solid silver bridge or generic cathode-nucleated ECM.

- [ip-crossbar-macro: Crossbar: High-Performance ReRAM IP Brief](https://www.crossbar-inc.com/assets/white-papers/High-Performance-Memory-Product-Brief.pdf)
- [ip-crossbar-2015: Crossbar: Original Embedded 1T1R and Metallic-Path Presentation](https://www.crossbar-inc.com/assets/resources/presentations/FMS2015-Slides-Versatile-ReRAM-Technology-and-Applications.pdf)
- [ip-crossbar-cell-2012: Crossbar: Published Patent Application US20120007035A1](https://patents.google.com/patent/US20120007035A1/en)

#### Crossbar ReRAM IP: Historical Patent Cell — Reverse RESET

Reverse TE bias interrupts the conduction path and produces high resistance.

Extension/retraction from an upper metal region changes interparticle tunneling

**1. Initial Particle Path Is Low R**

State: LRS

Stimulus: WL off; TE bias zero

Start with the existing low-R particle path; the upper metal region and narrow path are shown separately.

**2. Reverse Bias Retracts the Path**

State: Switching

Stimulus: WL on; negative TE bias

Negative TE bias retracts or disconnects the narrow particle path toward the upper metal region; each particle charge state is unspecified.

**3. A Larger Gap Forms in the Particle Path**

State: HRS

Stimulus: WL on; negative TE bias

The effective lower-side spacing increases and tunneling current falls; the upper residual metal region remains.

**4. Remove Bias and Retain High R**

State: HRS

Stimulus: WL off; TE bias zero

HRS remains after bias removal. This is reverse RESET, without a preceding block-erase cycle.

- Ag / a-Si / p+ poly-Si · Silver top electrode/amorphous silicon/selected lower buffer-contact embodiment
- Ag · Purple region and dots denote metal region/particles without asserting each charge state
- TE / BE; WL · Top/bottom electrodes and select gate; 1T1R integration has a separate manufacturer source
- Ic / e− · Conventional current opposes electron motion; electrons may tunnel between neighboring particles

This is a published patent embodiment associated with historical embedded IP, not proof of current macro recipes or newly licensable nodes in 2026. The patent describes metal particles and interparticle tunneling; the path is not equated to a solid silver bridge or generic cathode-nucleated ECM.

- [ip-crossbar-macro: Crossbar: High-Performance ReRAM IP Brief](https://www.crossbar-inc.com/assets/white-papers/High-Performance-Memory-Product-Brief.pdf)
- [ip-crossbar-2015: Crossbar: Original Embedded 1T1R and Metallic-Path Presentation](https://www.crossbar-inc.com/assets/resources/presentations/FMS2015-Slides-Versatile-ReRAM-Technology-and-Applications.pdf)
- [ip-crossbar-cell-2012: Crossbar: Published Patent Application US20120007035A1](https://patents.google.com/patent/US20120007035A1/en)

#### Crossbar ReRAM IP: Historical Patent Cell — Read

Select the same cell, sense its retained resistance with a small stimulus, then latch and isolate.

Extension/retraction from an upper metal region changes interparticle tunneling

**1. Before Selection: Low-R Structure Is Retained**

State: LRS structure retained

Stimulus: WL off; TE bias zero

The same cell starts in retained LRS with selection off. HRS can follow the same read sequence.

**2. Sense the Path at Small Bias**

State: LRS structure retained

Stimulus: WL on; small positive TE bias

A small bias senses the metal-particle path; ILRS > IHRS at equal bias and transport can involve interparticle tunneling.

**3. Latch and Isolate the Cell**

State: LRS structure retained

Stimulus: WL off; TE bias zero

After latching, remove bias and retain the original path; actual read-disturb limits remain supplier-specific.

- Ag / a-Si / p+ poly-Si · Silver top electrode/amorphous silicon/selected lower buffer-contact embodiment
- Ag · Purple region and dots denote metal region/particles without asserting each charge state
- TE / BE; WL · Top/bottom electrodes and select gate; 1T1R integration has a separate manufacturer source
- Ic / e− · Conventional current opposes electron motion; electrons may tunnel between neighboring particles

This is a published patent embodiment associated with historical embedded IP, not proof of current macro recipes or newly licensable nodes in 2026. The patent describes metal particles and interparticle tunneling; the path is not equated to a solid silver bridge or generic cathode-nucleated ECM.

- [ip-crossbar-macro: Crossbar: High-Performance ReRAM IP Brief](https://www.crossbar-inc.com/assets/white-papers/High-Performance-Memory-Product-Brief.pdf)
- [ip-crossbar-2015: Crossbar: Original Embedded 1T1R and Metallic-Path Presentation](https://www.crossbar-inc.com/assets/resources/presentations/FMS2015-Slides-Versatile-ReRAM-Technology-and-Applications.pdf)
- [ip-crossbar-cell-2012: Crossbar: Published Patent Application US20120007035A1](https://patents.google.com/patent/US20120007035A1/en)

#### IP Cell Tradeoffs

This figure follows the named patent's metal/amorphous-silicon model. Do not substitute another ECM cell's nucleation direction or an ideal continuous silver bridge. Evidence for the embedded macro and for the historical cell embodiment is identified separately.

## IP Technology Lineage and Product Succession

Follow three IP families into the Synopsys portfolio through original cells, product announcements and succession events. Each lineage links to its cell lesson, followed by subsequent public products and the physical scope supported by sources.

### Kilopass XPM → Synopsys

XPM stores a one-time state in a gate-oxide antifuse. Its historical 2T cell separates the storage and selection MOS roles. XPM later joined Synopsys with other Kilopass products.

#### 2007-08-09 · Public Patent Identifies the Existing XPM 2T Cell

Figure 1 of WO2007090089A2 identifies the existing XPM with M0 for storage and M1 for selection. This is the structure reconstructed in the lesson.

- [ip-kilopass-xpm-2007: Historical Kilopass XPM 2T Patent Diagram](https://patents.google.com/patent/WO2007090089A2/en)

#### 2012-05-15 · XPM/Gusto Announcement Links 130/110 nm 2T Products

A Kilopass announcement names XPM, Gusto and 2T CMOS antifuse, linking the named historical products to the cell approach.

- [ip-kilopass-2t-2012: Kilopass 130/110 nm XPM and Gusto 2T Announcement](https://www.design-reuse.com/news/202521997-kilopass-nvm-ip-cores-first-to-deliver-footprint-and-pin-compatibility-across-eight-top-tier-silicon-foundries-for-the-130-110nm-process-node/)

#### 2018-01-10 · Synopsys Announces Its Kilopass Acquisition

The official announcement includes XPM, Gusto and SecretCode in the acquired portfolio and describes an expanded 1T/2T OTP offering.

- [ip-lineage-kilopass-2018: Synopsys Acquisition of Kilopass](https://news.synopsys.com/2018-01-10-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Kilopass-Technology)

As checked on 2026-09-10, Synopsys publicly lists a 1T/2T antifuse OTP portfolio. Its advanced-node article discusses cell sizing, analog supply and sensing, repair, ECC and controller design. These span cell and macro design; the article does not trace every current product to an original vendor cell.

The cell lesson uses the historical XPM 2T functional topology in patent Figure 1. It excludes the self-sensing node of Figure 2 and undisclosed current FinFET sections. Business succession and internal cell implementation have separate evidence scopes.

- [ip-kilopass-xpm-2007: Historical Kilopass XPM 2T Patent Diagram](https://patents.google.com/patent/WO2007090089A2/en)
- [ip-lineage-kilopass-2018: Synopsys Acquisition of Kilopass](https://news.synopsys.com/2018-01-10-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Kilopass-Technology)
- [ip-synopsys-otp-current: Synopsys OTP NVM 1T/2T Portfolio](https://www.synopsys.com/articles/non-volatile-memory.html)
- [ip-synopsys-advanced-otp: Synopsys Advanced-Process OTP Reliability and Sensing](https://www.synopsys.com/articles/reliable-secure-otp-ip.html)

### Sidense 1T-Fuse → Synopsys

1T-Fuse uses one continuous gate over thick and thin oxide, integrating channel selection and antifuse storage in a split-channel cell. This is the starting point for understanding the named Sidense 1T architecture.

#### 2007-12-18 · Original Author Publishes the 1T-Fuse Cell Section

Figure 2 in the Sidense author article shows thick/thin oxide, continuous poly and one BL diffusion. The lesson distinguishes its selection region from the persistent conduction region.

- [ip-sidense-cell-2007: Sidense 1T-Fuse Original-Author Cell Section](https://www.chipestimate.com/1T-OTP-Memory-Delivering-Quality-and-Reliability/Sidense-a-part-of-Synopsys/Technical-Article/2007/12/18)

#### 2017-09-05 · Technical Article Explains Persistent State and Emulated Updates

Thin-oxide conduction creates an irreversible 1T-Fuse cell state. Emulated MTP updates use multiple storage locations and management; they do not erase or repair the original antifuse.

- [ip-sidense-irreversible-2017: Sidense 1T-Fuse Irreversibility and eMTP Boundary](https://www.chipestimate.com/Enabling-Secure-Semiconductor-Supply-Chain-Management/Sidense-a-part-of-Synopsys/Technical-Article/2017/09/05)

#### 2017-10-17 · Synopsys Announces Its Sidense Acquisition

The official announcement names the single-transistor, split-channel 1T-Fuse technology, linking the original cell approach to the acquired portfolio.

- [ip-lineage-sidense-2017: Synopsys Acquisition of Sidense](https://news.synopsys.com/2017-10-17-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Sidense-Corporation)

Current Synopsys OTP material lists 1T and 2T offerings. Later design descriptions cover oxide-breakdown control, leakage and sensing, plus macro repair and ECC. Public material does not map every current node to the historical Sidense section.

The lesson retains the n-type structure and single BL diffusion shown by the original author in 2007; read arrows are inferred from that structure. It does not import p-type patent biases, extra terminals or undisclosed current macro wiring.

- [ip-sidense-cell-2007: Sidense 1T-Fuse Original-Author Cell Section](https://www.chipestimate.com/1T-OTP-Memory-Delivering-Quality-and-Reliability/Sidense-a-part-of-Synopsys/Technical-Article/2007/12/18)
- [ip-sidense-irreversible-2017: Sidense 1T-Fuse Irreversibility and eMTP Boundary](https://www.chipestimate.com/Enabling-Secure-Semiconductor-Supply-Chain-Management/Sidense-a-part-of-Synopsys/Technical-Article/2017/09/05)
- [ip-lineage-sidense-2017: Synopsys Acquisition of Sidense](https://news.synopsys.com/2017-10-17-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Sidense-Corporation)
- [ip-synopsys-otp-current: Synopsys OTP NVM 1T/2T Portfolio](https://www.synopsys.com/articles/non-volatile-memory.html)
- [ip-synopsys-advanced-otp: Synopsys Advanced-Process OTP Reliability and Sensing](https://www.synopsys.com/articles/reliable-secure-otp-ip.html)

### Impinj AEON → Virage Logic → Synopsys

AEON is a logic-process floating-gate MTP family originating at Impinj. Virage Logic acquired the business, which subsequently entered Synopsys with Virage Logic and continued in named AEON MTP ULP products.

#### 2007-09-26 · Impinj Announces Floating-Gate AEON/MTP

The company announcement names AEON/MTP and floating-gate transistors. Its specifications apply to that product announcement.

- [aeon-impinj-2007: Impinj AEON/MTP Floating-Gate Announcement](https://www.impinj.com/about-us/news-room/2007/impinj-delivers-reprogrammable-nonvolatile-memory-ip-breakthrough---aeonmtp-worlds-first-25v-floatin)

#### 2008-06-26 · Virage Logic Acquires Impinj Logic NVM IP Business

The SEC filing records completion of an asset purchase on this date; Impinj as a whole was not acquired.

- [aeon-transfer-2008: Virage Logic Filing on the Impinj NVM IP Business](https://www.sec.gov/Archives/edgar/data/1050776/000119312508145768/d8k.htm)

#### 2009-06-30 · Virage Logic Documents AEON FN Program and Erase

NVM manager Craig Zajac identifies FN for both operations in a company-authored article. This defines the cell lesson scope.

- [aeon-virage-fn-2009: Virage Logic AEON MTP Program/Erase and Monitoring](https://www.chipestimate.com/Auto-Industry-Replaces-Fuse-Technology-with-Standard-CMOS-Based-MTP---Adds-Functionality-Testability-and-Reliability/Synopsys-formerly-Virage-Logic-products/Technical-Article/2009/06/30)

#### 2010-09-02 · Synopsys Completes Its Virage Logic Acquisition

The completion announcement includes NVM in the added portfolio, bringing this succession chain into Synopsys.

- [aeon-transfer-2010: Synopsys Completes the Virage Logic Acquisition](https://news.synopsys.com/home?item=123195)

#### 2013-11-20 · Synopsys Announces DesignWare AEON MTP ULP

The announcement explicitly uses AEON branding, supporting product-family continuity without asserting identical internal wiring.

- [aeon-synopsys-2013: Synopsys DesignWare AEON MTP ULP Announcement](https://news.synopsys.com/2013-11-20-Synopsys-New-Ultra-Low-Power-Non-Volatile-Memory-IP-Cuts-Power-by-90-Percent-and-Size-in-Half)

The 2013 official announcement explicitly uses DesignWare AEON MTP ULP branding. As checked on 2026-09-10, the current Synopsys MTP ULP page describes single-poly, floating-gate and zero-mask-adder positioning. That is a check date, not a launch date or evidence of unchanged wiring across generations.

The named FN/FN basis is a 2009 article by a Virage Logic NVM manager. The diagrams use coupling, tunneling roles, FG and read MOS to explain electron entry and removal. Undisclosed device count, p/n polarity and pin arrangement remain unspecified.

- [aeon-impinj-2007: Impinj AEON/MTP Floating-Gate Announcement](https://www.impinj.com/about-us/news-room/2007/impinj-delivers-reprogrammable-nonvolatile-memory-ip-breakthrough---aeonmtp-worlds-first-25v-floatin)
- [aeon-virage-fn-2009: Virage Logic AEON MTP Program/Erase and Monitoring](https://www.chipestimate.com/Auto-Industry-Replaces-Fuse-Technology-with-Standard-CMOS-Based-MTP---Adds-Functionality-Testability-and-Reliability/Synopsys-formerly-Virage-Logic-products/Technical-Article/2009/06/30)
- [aeon-transfer-2008: Virage Logic Filing on the Impinj NVM IP Business](https://www.sec.gov/Archives/edgar/data/1050776/000119312508145768/d8k.htm)
- [aeon-transfer-2010: Synopsys Completes the Virage Logic Acquisition](https://news.synopsys.com/home?item=123195)
- [aeon-synopsys-2013: Synopsys DesignWare AEON MTP ULP Announcement](https://news.synopsys.com/2013-11-20-Synopsys-New-Ultra-Low-Power-Non-Volatile-Memory-IP-Cuts-Power-by-90-Percent-and-Size-in-Half)
- [aeon-synopsys-current: Synopsys Current MTP ULP NVM Product Page](https://www.synopsys.com/designware-ip/memories-logic-libraries/non-volatile-memory/mtp-rfid.html)

## eFuse: Permanent Conductance Programming

eFuse is suited to permanently storing small amounts of on-chip configuration, such as trim codes, repair addresses, and identification data. One-time programming means that each physical location supports an effective transition in only one irreversible direction; separate locations can be programmed in batches. Multiple programming commands to a macro do not make an individual fuse reversibly erasable and rewritable.

Maturity: Identified Implementation. IBM's 2007 technology review describes eFUSE evolution from 180 nm to 45 nm and applications in memory redundancy, chip identification, and analog trimming, establishing implementations in identified processes. This material also uses IBM and TSMC patents to explain polysilicon/silicide and metal-via structures.

The reviewed historical abstract does not enumerate product models or shipment volumes, so no named volume-production product is invented. A patent also does not establish that the same fuse macro can be used in any current TSMC node. Adoption requires qualification evidence for the specified process and IP version.

### Storage and Structure

A bit is stored as a difference in the resistance of a conductive path. An unprogrammed fuse typically has low resistance; a controlled current causes material migration or a break in a designated region, producing higher resistance. Logic 0/1 is defined by sensing and encoding. High resistance does not intrinsically correspond to a particular bit value, and the programmed state must not be assumed to be an ideal open circuit.

A polysilicon/silicide fuse has a narrow link between end contacts. A metal-via implementation places the region intended to change near an interconnect layer and via. Its equivalent circuit is a resistor whose state can change permanently, in series with a select or programming transistor and connected to a read sensor. Link dimensions, heat-flow paths, via placement, and peripheral drivers must be shown together; a broken line alone is insufficient.

### Operation

#### Program: Concentrate Current in a Controlled Region

Before: The conductor still has a continuous low-resistance path. The select transistor has not initiated programming, and the read bias is insufficient to induce the intended permanent material change.

Stimulus: Enable the selected driver and apply a programming current calibrated for both the device and pulse duration; keep unselected paths isolated. No process-independent voltage or current is specified here.

After: A high-resistance path forms at the narrowed region or near the via. Post-program sensing verifies that resistance has crossed the decision boundary, while allowing for residual conduction and drift over time.

Carriers travel along the conductor, while local current density and Joule heating increase the rate of material migration. US7417300B2 uses a narrowed geometry to control current crowding and address material backflow; US8847350B2 shapes current concentration through via contact placement. The teaching focus is permanent material redistribution and the final resistance distribution, rather than describing every mechanism as metal rupture.

#### Erase: No Reverse Recovery in Normal Operation

Before: The programmed conductor has material depletion, voids, or a changed conduction path. This is a structural state, not stored charge that can be moved back by changing a gate bias.

Stimulus: There is no specified normal electrical erase pulse that reconstructs the original low-resistance path. Additional high current may cause new damage and must not be treated as a RESET operation.

After: The original location remains consumed. If an application must modify logical data, the design must use reserved fresh locations, version encoding, or another rewritable memory.

Changing the data encoding or activating spare locations can change the information read by the system, but it does not restore the original fuse material. The number of available updates depends on reserved capacity and the protocol, not on the program/erase endurance of one bit. Test flows must also reserve sacrificial test cells rather than treating irreversible programming as a repeatedly recoverable functional test.

#### Read: Measure Resistance Without Reprogramming

Before: The selected fuse lies in either the low-resistance or programmed high-resistance distribution. The sensor has a reference current, reference resistance, or voltage decision threshold.

Stimulus: Establish a current path under read conditions far below the programming stress. The selector connects the specified fuse, and sensing measures current magnitude or a node's charging/discharging rate.

After: The low-resistance path conducts more readily than the high-resistance path. The sensor outputs the encoded bit, without requiring a change to the stored state during normal reading.

The required guarantee is that the high- and low-resistance distributions remain distinguishable across temperature, process variation, and time in service. Programmed resistance is not infinite, and unprogrammed resistance is not zero; series resistance from the select transistor and wiring affects the result. The readout must therefore be analyzed with its reference path, rather than judging read reliability solely from a gap in a microscope image.

### Selection and Variability

A transistor typically selects the cell's programming and read paths. The programming driver must withstand the pulse current, and supply or wiring drops must not leave distant cells underprogrammed; unselected cells must avoid additional stress on shared lines. A small fuse link therefore does not guarantee a small complete macro once drivers, sensing, and wiring are included.

Fuse width, silicide or metal thickness, via overlap, and the thermal environment change local current density. Programming pulses then translate those differences into a post-program resistance distribution. Measure the distributions before programming, after programming, after thermal treatment, and after read-life stress; examine material backflow, residual paths, and reference-sensing drift rather than reporting only an average programming success rate.

### Advantages and Tradeoffs

- A permanently retained physical state suits trim, identification, and repair settings that do not require reversal.
- Implementations can use appropriate polysilicon/silicide or metal-interconnect structures, allowing selection to match the available process.
- Readout can be reduced to resistance or current comparison and integrated with logic that loads configuration at power-up.
- The same physical location cannot be erased in normal operation; field updates require reserved locations and data-validity encoding.
- Programming current, supply drops, and select-transistor area may dominate the complete macro cost.
- Post-program resistance and long-term drift must be controlled; permanence must not be equated directly with security protection or unlimited retention.

### Four Layers of Limits

- Device: The physical limit is the window for reproducible material change: too little stress produces overlapping resistance distributions, while too much may damage neighboring structures. Any local geometry improvement must be demonstrated through sensing margin across process corners and after aging. No single minimum linewidth or programming current applies to every material.
- Array: Larger arrays require more decoding, programming-drive, and sensing resources. An individual resistor may shrink, but line drop, selected-cell isolation, reference matching, and test redundancy do not disappear with it. Effective density should be calculated as the number of reliable deliverable bits divided by the area of the complete macro.
- Process: Fuse materials and contacts must comply with the baseline process's thermal budget, interconnect reliability requirements, and layout rules. Deliberately induced local migration must not propagate into ordinary wiring failure. Via placement and neighboring structures are part of process integration and cannot be signed off through logic simulation alone.
- System: System limits include remaining programmable locations, the cost of irreversible misprogramming, and the supply's pulse capability. If many data updates are required, additional encoding and redundancy progressively consume capacity. Permanent records still require access permissions, fault handling, and update-transaction integrity.

### Fit and Misuse

Suitable for chip identification, analog trimming, manufacturing repair, and permanent options when programming is infrequent and the data lifecycle can be defined in advance. Before selecting it, establish the latest programming point, whether field appends are needed, the reserved bit count for each field, and whether the platform can provide the specified programming pulses and verification.

Not suitable as a direct store for frequently rewritten counters, logs, or user settings that must be freely reversible. Low-cost, large-capacity updatable storage requires comparison of complete macro and management costs. The word Fuse also does not make a resettable electronic fuse IC for power protection equivalent to this memory cell.

### Patent Study

- [US7417300B2](https://patents.google.com/patent/US7417300B2/en): Programming location and material backflow in a polysilicon/silicide fuse may leave resistance too low or unstable. The design must concentrate current density at an intended location while controlling the remaining post-program path so that the sensor can reliably distinguish the two states. Local narrowing within the fuse body changes current-crowding and material-migration conditions. When reading Figures 3 and 4A, first trace where current enters the narrowed region from the contacts, then examine how silicide migration, residual polysilicon, and material backflow affect programmed resistance. Claim Reading: Claim 1 defines a combination through specific fuse geometry and structural relationships. Map each actual limitation onto the drawings. An eFuse that uses electromigration is only a technology category; that description does not replace reading the claim's narrowing, terminal, and relative-position requirements. Limitations: This is a lesson on an engineering problem and structure. Patent-family deduplication, validity, legal status, and freedom-to-operate analysis have not been completed, nor has any current IBM product been shown to require this implementation.
- [US8847350B2](https://patents.google.com/patent/US8847350B2/en): Inadequate concentration of current in a metal/via structure can constrain the programming window and required current. Material movement must also avoid unintended conduction to neighboring structures. The problem spans interconnect geometry, the programmable region, and driver capability. A via that lands partly on the fuse, together with interconnects running in different directions, creates a region of local current concentration. Figure 1 identifies the upper and lower metals and the via; Figure 5A traces the complete current path from the select or programming transistor to the fuse. Claim Reading: Claim 1 centers on a specific arrangement of interconnects, the fuse, and the via contact region. Mark the via's partial overlap and its effect on the current path when reading it. The label metal fuse does not capture all of the patent's concrete limitations. Limitations: The patent supplies neither universal process design rules nor production reliability data. Publication alone is not used here to infer IP availability at a particular node, an actual license scope, or an infringement relationship.

### Check Your Understanding

If an OTP macro allows ten data appends, does each eFuse have ten program/erase cycles of endurance?

No. The appends may use ten groups of previously unprogrammed locations and version encoding; each fuse still supports only one irreversible transition. Record the system's update count, the capacity consumed per update, and the rewritability of an individual physical cell separately.

### Sources

- [ch-pat-efuse-poly: IBM: Locally Narrowed Electrical Fuse Patent US7417300B2](https://patents.google.com/patent/US7417300B2/en)
- [ch-pat-efuse-via: TSMC: Metal Via Fuse Patent US8847350B2](https://patents.google.com/patent/US8847350B2/en)
- [ch-maturity-ibm-efuse: IBM: eFUSE from Memory Redundancy to Autonomic Chips](https://research.ibm.com/publications/electrically-programmable-fuse-efuse-from-memory-redundancy-to-autonomic-chips)

## Antifuse: Permanent Conduction Through Dielectric Breakdown

Antifuse design aims to establish acceptable conduction first in a designated storage dielectric while keeping selectors, peripheral circuits, and half-selected cells functional; it does not rely on uncontrolled breakdown across the chip. Permanent data can support identification, trimming, code, or key storage. Security is separately determined by the readout interface, access controls, and protective design.

Maturity: In Volume Production. Synopsys' 2018 acquisition statement identifies Kilopass antifuse 1T/2T IP, including XPM, Gusto, and SecretCode, and reports aggregate cumulative shipments exceeding 10 billion units. The current OTP page separately lists advanced-node silicon validation and specific automotive qualifications, indicating continued commercial availability.

The historical shipment figure is an aggregate manufacturer statement and cannot be assigned to an individual macro or the 3 nm node. Silicon validation is not volume production, and N5A/N7A automotive qualifications are not common qualifications for every product.

### Storage and Structure

Before programming, the storage dielectric separates two electrodes and permits only very small leakage. Programming creates a permanent, detectable conduction path through a high electric field. Information resides in the conduction difference before and after breakdown, opposite to the typical eFuse transition from low to high resistance. Both can provide OTP, but their storage materials and programming conditions differ.

The teaching embodiment in US6667902B2 places a thin-dielectric storage element in series with a select transistor. The column line connects to one side of the storage element; the other side reaches the source line through the selected channel, while the row line controls the select gate. The equivalent circuit combines a dielectric element that changes from low leakage to conduction with a MOS device for current control and isolation. The storage layer must not be drawn as an ordinary gate-controlled switch.

### Operation

#### Program: Apply the Breakdown Field Only to the Selected Dielectric

Before: The storage dielectric is intact and the selected bit has low leakage. Other cells in the same row and column must remain unprogrammed.

Stimulus: In the early embodiment of US6667902B2, Figures 1/8 use a 2.5 V row-select line, a 0 V source line, and a 7 V selected column line. These values apply only to that structure and period, not to current product operation.

After: The thin dielectric develops detectable conduction. Program verification checks whether current reaches the specified window, rather than mistaking a slight leakage increase for sufficient programming.

The selected MOS provides a path that establishes a storage-layer field between the high-potential column line and a low-potential internal node. Charge transport accumulates defects in the dielectric and eventually establishes a conductive path; current must be controlled to protect the selector. Evolution from soft breakdown to stronger conduction is a distributed process, not the formation of an ideal metal wire with identical dimensions and resistance in every cell.

#### Erase: No Repair of the Broken-Down Dielectric in Normal Operation

Before: Permanent defects and a conduction path have changed the dielectric's insulating state.

Stimulus: There is no normal erase operation that fully reconstructs the original dielectric with reverse bias. Repeated high-field stress may worsen damage or change current and cannot be treated as qualified reverse programming.

After: The physical location remains programmed. Appending or correcting application data must consume a fresh location or use a separate rewritable storage region.

Resistive memories that also contain conductive paths may perform SET/RESET through controlled ion migration; antifuse OTP does not provide a product operating contract for reversible recovery. The ability to draw a conductive filament in both devices does not make their endurance, operating directions, or array requirements equivalent.

#### Read: Distinguish an Intact Dielectric from a Conductive Path

Before: An unprogrammed cell retains low leakage, while a programmed cell passes more current. The same selector and wiring participate in the actual readout.

Stimulus: In the early patent example above, the row line remains at 2.5 V, the selected column line changes to 1.5 V, and the source line is at 0 V. Read stress is lower than the programming condition.

After: Current flows from the column line through the established dielectric path and selected MOS to the source line. The sensor compares its magnitude and outputs a bit; an unprogrammed cell does not produce the same effective current.

The read criterion is the current distribution of each state under the actual read bias. Selector threshold, series resistance, dielectric leakage, and variation in programmed conduction all affect margin. Validate these over the specified temperature and time conditions rather than treating one high-current measurement immediately after programming as sufficient evidence of lifetime read reliability.

### Selection and Variability

A selected cell needs both a high column potential and a select path that establishes the low-side potential. Cells in the same row but another column, the same column but another row, and fully unselected cells see different fields, so each category needs its own bias table. Isolation requires more than turning off a row line. High-voltage level shifting, well isolation, and current limiting together allow the storage layer to break down before other devices are damaged.

Dielectric thickness, local defects, area, and field distribution produce statistical distributions of breakdown time and post-breakdown current. Research should report pulse amplitude/duration, current compliance, initial leakage, and the post-program verify threshold together, and examine accumulated half-select stress. Comparing typical programming voltage alone cannot establish yield or sensing margin.

### Advantages and Tradeoffs

- Permanent conduction provides one-time-programmable storage for identification and trim data written after manufacturing.
- Identified commercial IP is available in standard logic CMOS processes, although each process version still requires confirmation.
- Topologies such as 1T and 2T offer tradeoffs among capacity, area, selection capability, and operating conditions.
- No normal erase is available; misprogramming recovery and appended updates require reserved capacity and encoding from the outset.
- Programming depends on dielectric-breakdown distributions and requires high-field peripheral circuits, current limiting, and post-program sensing verification.
- Physical immutability does not imply that data cannot be read out. Security applications still need a separate threat model and product evidence.

### Four Layers of Limits

- Device: The usable window lies between reliably establishing sufficient conduction and avoiding unintended damage. Reducing storage area or changing the dielectric does not necessarily improve breakdown statistics and programmed current proportionally. Limits should be described by complete distributions, specified temperatures, and long-term sensing margin.
- Array: Density is jointly limited by selectors, high-voltage decoding, half-select isolation, wiring drops, and sensors. Theoretical cell area is not a substitute for complete macro efficiency. As an array grows, additional unselected leakage and accumulated programming stress must enter its failure-rate budget.
- Process: Availability in standard CMOS does not remove the need for qualification. Controlled breakdown of the storage dielectric, selector voltage tolerance, thick/thin oxide choices, and reliability tests must be reconfirmed for the foundry process version. Success at one node does not establish usable pulses at another.
- System: System bottlenecks often include the irreversible programming flow, remaining blank bits, and supply conditions during programming. For keys or boot settings, programming permissions, read isolation, lock state, and fault recovery must be validated separately from the storage physics. The OTP label does not replace system design.

### Fit and Misuse

Suitable for parameters determined after manufacturing and intended to remain permanent, chip IDs, code with a defined lifecycle, and security settings. Selection starts with the required update count, latest programming location, supply, read timing, and capacity, followed by verification of the identified macro's process, test modes, and qualifications.

Not suitable for unrestricted repeated overwrites without a redundancy plan. A system that must directly overwrite the same address or restore an old value should use electrically erasable storage or an upper-layer protocol for a bounded number of appends. High-field test results must not be equated with production yield or resistance to invasive attacks.

### Patent Study

- [US6667902B2](https://patents.google.com/patent/US6667902B2/en): Using ultrathin dielectric breakdown as readable memory requires sufficient conduction in selected cells while avoiding half-select misprogramming, selector damage, and excessive post-breakdown current. The ability to break down an individual device does not establish a reliable array. A half-transistor storage element works with a select transistor. Row-, column-, and source-line biases establish a high field across the storage dielectric. Reading lowers the column bias and distinguishes states through post-breakdown current; the figures show alternative cell and array arrangements. Claim Reading: Map the storage dielectric, its electrodes, and the select path onto the claim limitations, then use the Figure 1/8 biases to verify the selected path. The 7 V embodiment value is not the entire inventive concept, and half-select protection must not be omitted when describing the design as a breakdown-capable capacitor. Limitations: This patent supplies an early mechanism and bias lesson. The structures, voltage tolerance, verification algorithms, and qualifications of current Kilopass/Synopsys 1T or 2T IP require separate evidence and are not established directly by this patent.

### Check Your Understanding

Why is reducing the gate voltage of an unselected row insufficient to prove that an entire antifuse array is immune to half-select misprogramming?

Cells sharing a column or row, and internal floating nodes, can develop different storage-layer fields. Turning off a select MOS does not hold every node at zero potential. Each category's bias, leakage, and accumulated stress must be evaluated and then validated with the specified pulse sequence.

### Sources

- [ch-pat-antifuse: Kilopass: Ultrathin Dielectric Breakdown Cell Patent US6667902B2](https://patents.google.com/patent/US6667902B2/en)
- [ch-maturity-kilopass: Synopsys: 2018 Kilopass Acquisition and OTP Shipment Statement](https://news.synopsys.com/2018-01-10-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Kilopass-Technology)
- [ch-maturity-otp-current: Synopsys: Current Antifuse OTP NVM IP Product Page](https://www.synopsys.com/designware-ip/memories-logic-libraries/non-volatile-memory/otp.html)

## Conventional Standalone EEPROM: Local Windows and Fine Updates

This topic covers conventional standalone EEPROM: the array, voltage boosting, controller, and interface are packaged as a separate device accessed through a serial or parallel interface. Microchip 24LC256 is an identified I2C serial example. Foundry EEPROM macros and third-party MTP IP integrated within a chip are compared in the separate Embedded MTP IP topic.

#### Electrical Erase: The Complete PGM / ERS Cycle

The same storage cell supports programming, electrical erase and subsequent programming. ERS restores a window suitable for another program operation; it does not require every carrier to disappear. Whether the host issues a separate erase command depends on the macro or component interface.

PGM → ERS → PGM

The floating gate holds more electrons and the n-channel teaching example has an elevated threshold.

Change terminal potentials within the same identified local-window structure so that its field supports electron transfer out of the floating gate.

Fewer electrons remain and threshold voltage returns toward the erased range for reprogramming.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [ch-pat-eeprom-window: Hughes Aircraft Company: Local Tunnel-Window EEPROM Patent US4115914A](https://patents.google.com/patent/US4115914A/en)
- [ch-mtp-standalone-microchip: Microchip: 24AA256/24LC256/24FC256 Standalone Serial EEPROM Datasheet](https://ww1.microchip.com/downloads/aemDocuments/documents/MPD/ProductDocuments/DataSheets/24AA256-24LC256-24FC256-256K-I2C-Serial-EEPROM-DS20001203.pdf)

Maturity: Production Device. Microchip publicly offers the 24LC256 serial EEPROM and its full datasheet, covering packages, I2C, byte writes, a page buffer, and an internal high-voltage generator. This establishes a standalone product; the local-window teaching diagram is supported separately by a public patent.

The datasheet does not disclose the bitcell cross-section, polysilicon count, or precise tunneling terminals. US4115914A cannot be treated as the 24LC256 implementation. Capacity, endurance, and retention must follow the specified part and conditions.

### Storage and Structure

A floating gate is a conductive island surrounded by insulating layers, with no direct DC metal connection to it. Retained charge changes how the control gate acts on the channel, shifting the MOS threshold voltage. In a typical n-channel example, adding electrons makes conduction more difficult. Reading measures the channel; normal read operation does not require draining the stored electrons.

The teaching cross-section contains source, drain, channel, a localized thin tunneling window, floating gate, inter-gate dielectric, and control gate, with a selection function isolating unselected paths. US4115914A explains the local window and capacitive coupling; it is not a teardown of a current serial EEPROM.

### Operation

#### Program: Establish Stored Charge Through a Local Window

Before: The floating gate starts in a known charge range. The control electrode and terminal across the window determine its potential.

Stimulus: The local-window teaching example establishes a high field across the thin dielectric to transfer electrons into the floating gate. In the n-channel explanation, additional electrons raise threshold voltage.

After: Electrons remain on the insulated floating gate and change channel conduction. In a device, the internal controller executes the write sequence and the system checks completion as specified.

FN tunneling occurs at the thin dielectric's high-field region. The control gate acts through capacitive coupling and has no metal connection to the floating gate. Byte/page write commands are interface behavior and do not directly describe bare-cell bias voltages.

#### Erase: Reverse the Window Field to Remove Electrons

Before: The floating gate holds more electrons and the n-channel teaching example has an elevated threshold.

Stimulus: Change terminal potentials within the same identified local-window structure so that its field supports electron transfer out of the floating gate.

After: Fewer electrons remain and threshold voltage returns toward the erased range for reprogramming.

Separate physical erase from host commands. A 24LC256 write includes an internally timed erase/write cycle; the host does not directly apply bare-cell erase biases. Selection lines, shared terminals, and page organization determine the affected region, which the EEPROM label alone does not specify.

#### Read: Sense the Channel and Return Data Through the Interface

Before: Stored charge maps to distinguishable threshold ranges and address decoding selects the data.

Stimulus: Apply normal low-stress read biases and enable the selected path. Internal sensing and output control respond to the host read command.

After: The sensor distinguishes channel-current levels and the serial interface returns data while stored electrons remain on the floating gate.

The source-to-drain channel carries the read current; floating-gate electrons need not leave. Interface clock rate, serial transfer, and random/sequential access are device timing conditions, separate from bare-cell sensing time.

### Selection and Variability

The local window confines charge transfer while selection controls which storage path receives program, erase, or read biases. A standalone device also contains address decoding, page latches, voltage boosting, and command control. Byte-update costs require checking internal update granularity and page-boundary rules.

Floating-gate charge, coupling ratio, tunnel-oxide thickness, and interface defects determine threshold voltage and its drift. Traps accumulated through cycling change program/erase speed and retention. Studies should measure cycle count, temperature, retention time, and error criteria together. One product's typical cycle count cannot be combined with another product's best retention time to form a common limit.

### Advantages and Tradeoffs

- The same location can be electrically erased and reprogrammed for settings and calibration that need updates.
- A separate package and standard interface support reuse across host chips, with memory high-voltage control inside the device.
- Byte/page update behavior can be checked against a complete datasheet to establish a traceable update sequence.
- The external device consumes package, board, and interface resources; serial transfer adds end-to-end latency.
- Repeated tunneling accumulates dielectric defects, so endurance and retention require joint evaluation.
- Interface write size does not identify physical cell erase granularity; power-loss consistency still needs system design.

### Four Layers of Limits

- Device: The localized thin window must support tunneling while preserving long-term insulation. Defect accumulation, coupling ratio, and charge distributions determine the threshold window remaining after repeated operation.
- Array: Fine updates require selection, decoding, page latches, and high-voltage distribution. Page boundaries, internal erase/write units, and verification jointly limit update speed; one floating gate's area is an incomplete comparison.
- Process: A dedicated memory process controls the tunneling window, inter-gate dielectric, and high-voltage devices. Public teaching cross-sections explain principles; the stack and process conditions of a current part require separate manufacturer evidence.
- System: Serial transfer, internal erase/write busy time, write protection, and power-loss handling define system behavior. Budget lifetime cycles at the actual updated locations; important settings can use versions, checksums, and a controlled switchover.

### Fit and Misuse

Suitable for settings, calibration, product identification, and moderately updated state stored outside the host chip. Establish capacity, interface, page rules, write latency, and lifetime cycle demand before selecting a part and temperature grade.

Frequent high-throughput logging, large sequential data, and very low latency workloads may be constrained by interface and erase/write timing. For integration within the same chip, use the Embedded MTP IP topic's process routes.

### Patent Study

- [US4115914A](https://patents.google.com/patent/US4115914A/en): Nonvolatile charge requires good insulation for retention, while electrical erase needs a controlled path for electron transfer. Making the entire dielectric region too thin complicates retention and process control; making it uniformly too thick restricts charge transfer. A localized thinner tunneling window is placed between the floating gate and semiconductor, while other regions retain stronger isolation. Control-terminal coupling and the field across the window govern charge transfer. Figure 3i shows the cross-section formed by the process; Figure 6 traces the operating arrangement. Claim Reading: The localized thin-dielectric and memory-structure limitations in claims 2 and 9 map to three questions: where the window lies, which terminal it reaches, and how the remaining regions are insulated. The thin window is a concrete structural limitation and cannot be omitted while retaining only the functional statement that the device can be electrically erased. Limitations: The parent-application date is neither a complete historical determination of EEPROM's invention date nor a conclusion about the effective priority of all claims. This lesson does not infer that any current MTP product implements this patent.

### Check Your Understanding

Does 24LC256 page-write support prove its polysilicon count and local-window cross-section?

No. The datasheet establishes device interface behavior, update rules, and ratings. A bitcell cross-section needs separate implementation evidence. This topic uses US4115914A to explain a local window without assigning that patent to the 24LC256.

### Sources

- [ch-pat-eeprom-window: Hughes Aircraft Company: Local Tunnel-Window EEPROM Patent US4115914A](https://patents.google.com/patent/US4115914A/en)
- [ch-mtp-standalone-microchip: Microchip: 24AA256/24LC256/24FC256 Standalone Serial EEPROM Datasheet](https://ww1.microchip.com/downloads/aemDocuments/documents/MPD/ProductDocuments/DataSheets/24AA256-24LC256-24FC256-256K-I2C-Serial-EEPROM-DS20001203.pdf)

## Embedded MTP IP: Foundry Double-Poly and Third-Party Single-Poly

MTP IP provides rewritable nonvolatile storage inside the host chip, so selection centers on process and macro integration. Foundry double-poly EEPROM can be supplied through a dedicated NVM option; identified public evidence for third-party single-poly alternatives includes Synopsys MTP EEPROM and eMemory NeoEE/NeoMTP. This category is separate from packaged standalone EEPROM and does not merge SONOS Flash or antifuse OTP into floating-gate MTP.

#### Floating-Gate MTP in This Chapter: PGM / ERS Cycle

The same storage cell supports programming, electrical erase and subsequent programming. ERS restores a window suitable for another program operation; it does not require every carrier to disappear. Whether the host issues a separate erase command depends on the macro or component interface.

PGM → ERS → PGM

The floating node retains charge from the previous data state and the macro has selected the page, word, or block allowed to update.

The US5844271A teaching example transfers electrons from floating gate to source through FN tunneling. NeoMTP instead identifies an additional erase gate as its destination; NeoEE provides FN paths through MOS structures.

Charge decreases and the floating node returns to a state suitable for programming. Completion is determined by erase verification and the target macro specification.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [ch-pat-eeprom-singlepoly: Cypress Semiconductor: Buried-Control-Gate Single-Poly EEPROM Patent US5844271A](https://patents.google.com/patent/US5844271A/en)
- [ch-product-mtp: Synopsys: MTP EEPROM NVM IP for Analog and Mixed-Signal Processes](https://www.synopsys.com/resources/mtp-eeprom-nvm-ip-for-analog-and-mixed-signal-process-nodes-datasheet.html)
- [ch-mtp-synopsys: Synopsys: Single-Poly Floating-Gate MTP EEPROM IP](https://www.synopsys.com/designware-ip/memories-logic-libraries/non-volatile-memory/mtp-eeprom.html)
- [ch-mtp-ememory-neoee: eMemory: NeoEE Single-Poly Embedded EEPROM](https://www.ememory.com.tw/en-US/Products/MTP/NeoEE)
- [ch-mtp-ememory-neomtp: eMemory: NeoMTP Single-Poly p-Type Floating-Gate Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP)
- [ch-mtp-xfab-xc06: X-FAB: Historical XC06 Double-Poly Embedded EEPROM Process Brief](https://www.fbe-asic.com/documents/is-xc06.pdf)
- [ch-mtp-ymc-product: Yield Microelectronics: Logic-Process Embedded MTP IP](https://www.ymc.com.tw/index_en.php)
- [ch-mtp-ymc-singlepoly: Yield Microelectronics: Single-Floating-Gate NVM Patent US7423903B2](https://patents.google.com/patent/US7423903B2/en)
- [ch-mtp-floadia-zt: Floadia: LEE Flash ZT Zero-Added-Mask MTP](https://floadia.com/product/lee-flash-zt/)
- [ch-mtp-floadia-zt-fg: Floadia and Maxchip: Public Floating-Gate LEE Flash ZT MTP Integration](https://floadia.com/news/422/)

Maturity: Commercial IP. Current Synopsys and eMemory product pages directly identify single-poly MTP/EEPROM IP. The 2003 X-FAB XC06 brief provides a historical foundry double-poly NVM example. YMC has a logic-process MTP offering and a separate single-poly patent; Floadia ZT has a public floating-gate/FN program-and-erase example.

Each product family requires its target process, macro revision, and qualification conditions. A YMC patent does not identify all current ymtp cells; the reviewed Floadia documents do not explicitly state polysilicon count. The historical X-FAB document does not establish current availability.

### Embedded MTP IP Integration Routes

#### Foundry Double-Poly EEPROM Option

X-FAB XC06 (historical 2003 example)

2: double-poly NVM stack

Separate polysilicon layers can form floating and control gates; the XC06 brief does not disclose the complete EEPROM cross-section.

Use the target foundry's EEPROM/NVM option and check the actual mask combination and memory specification.

The EEPROM macro defines program/erase mechanism, biases, and granularity; neither layer count nor a process brief is sufficient.

- [ch-mtp-xfab-xc06: X-FAB: Historical XC06 Double-Poly Embedded EEPROM Process Brief](https://www.fbe-asic.com/documents/is-xc06.pdf)

#### Third-Party Single-Poly MTP IP

Synopsys MTP EEPROM; eMemory NeoEE/NeoMTP

1: explicitly stated for the identified products

Capacitive coupling controls a floating node; control capacitors, storage transistors, and erase regions are vendor-specific.

Integrate on a specified logic, analog, or BCD platform. Zero added masks applies only to explicitly supported versions.

NeoEE uses FN program/erase; NeoMTP uses p-type storage and an erase gate. The reviewed Synopsys source does not disclose carrier paths.

- [ch-mtp-synopsys: Synopsys: Single-Poly Floating-Gate MTP EEPROM IP](https://www.synopsys.com/designware-ip/memories-logic-libraries/non-volatile-memory/mtp-eeprom.html)
- [ch-mtp-ememory-neoee: eMemory: NeoEE Single-Poly Embedded EEPROM](https://www.ememory.com.tw/en-US/Products/MTP/NeoEE)
- [ch-mtp-ememory-neomtp: eMemory: NeoMTP Single-Poly p-Type Floating-Gate Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP)

#### Synopsys · MTP EEPROM IP

Single-poly

Floating gate

Program: PGM is supported; the reviewed product page does not disclose carrier paths or terminal biases.

Erase: Electrical ERS is supported; the reviewed product page does not disclose the microscopic erase path or terminal biases.

Specified standard-CMOS platforms; zero added masks; integrated high-voltage circuitry

Do not assign US5844271A or another vendor's carrier paths to this product.

- [ch-mtp-synopsys: Synopsys: Single-Poly Floating-Gate MTP EEPROM IP](https://www.synopsys.com/designware-ip/memories-logic-libraries/non-volatile-memory/mtp-eeprom.html)

#### eMemory · NeoEE

Single-poly

Floating gate; capacitive-coupling MOS devices and selectors

Program: FN transfer stores charge on the floating gate

Erase: FN transfer removes charge from the floating gate

Specified logic processes; zero added masks; integrated high-voltage and control circuits

Complete terminal biases and macro update units require the specified version.

- [ch-mtp-ememory-neoee: eMemory: NeoEE Single-Poly Embedded EEPROM](https://www.ememory.com.tw/en-US/Products/MTP/NeoEE)

#### eMemory · NeoMTP

Single-poly

p-type floating-gate MOSFET; additional erase gate

Program: Channel-hot-hole-induced hot-electron injection (manufacturer label: CHEI)

Erase: FN electron transfer from floating gate to erase gate

Specified logic/BCD platforms; zero-added-mask versions

Do not substitute an n-type storage transistor or source-erase diagram; use the macro's terminal specifications.

- [ch-mtp-ememory-neomtp: eMemory: NeoMTP Single-Poly p-Type Floating-Gate Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP)

### Storage and Structure

This topic focuses on floating-gate embedded MTP/EEPROM IP. Charge remains on an insulated conductive floating node and alters channel conduction through capacitive coupling. n-type and p-type storage transistors have different read-state behavior: adding electrons makes the n-channel US5844271A example harder to turn on, while eMemory describes its p-type NeoMTP device as turning on after electron injection.

Compare two integration routes: foundry double-poly EEPROM options and third-party single-poly MTP IP. A double-poly stack can place control and floating gates in separate polysilicon layers; a single-poly solution uses capacitive-control regions and a floating node. The buried n-type control electrode in US5844271A is one identified teaching implementation, not the cell of every third-party product.

### Operation

#### Program: Establish the Identified Cell's Charge-Transfer Path

Before: The floating node starts in an identifiable charge state. Control capacitances, source/drain, wells, and selectors jointly establish the selected path.

Stimulus: The US5844271A teaching example combines buried-control coupling with drain-side channel hot-electron injection. NeoEE instead publicly describes FN programming. Each mechanism has its own structure and terminals; do not overlay their arrows on one generic cell.

After: Electrons remain on the floating node and alter the read conduction state. The target macro's controller manages pulses, verification, and retries.

Single-poly does not specify an injection mechanism. NeoMTP uses channel-hot-hole-induced hot-electron injection in a p-type device, distinct from the n-channel teaching example. Floadia ZT separately discloses FN programming. A low core supply does not eliminate internal voltage boosting or high fields.

#### ERS: Restore a State Suitable for Reprogramming

Before: The floating node retains charge from the previous data state and the macro has selected the page, word, or block allowed to update.

Stimulus: The US5844271A teaching example transfers electrons from floating gate to source through FN tunneling. NeoMTP instead identifies an additional erase gate as its destination; NeoEE provides FN paths through MOS structures.

After: Charge decreases and the floating node returns to a state suitable for programming. Completion is determined by erase verification and the target macro specification.

Polysilicon count cannot establish erase destination, polarity, or granularity. Capacitive-control regions and tunneling exits may differ. Changing a control voltage is not a direct metal connection that drains the floating gate. Dielectric defects still accumulate through cycling. Electron removal by FN and net-charge reduction by hot-hole injection are different mechanisms. The separate BBHH teaching model is not evidence that a current YMC product uses BBHH.

#### Read: Sense the Selected Channel Under Normal Bias

Before: Charge states correspond to distinguishable conduction ranges, with array selection and references established.

Stimulus: Apply normal read biases to the selected storage transistor and selectors, sensing a small current or voltage signal without initiating high-field program/erase.

After: The sensing circuit returns data while charge remains on the floating node. n-type and p-type conduction states and logical mappings are defined by their respective circuits.

Macro read behavior depends on the cell, coupling ratio, selectors, bitlines, references, and ECC. A public cross-section explains storage principles but does not replace macro timing, output protocol, or usable read margin.

### Selection and Variability

Single-poly shifts control requirements into capacitive coupling and layout while retaining selectors, well isolation, and controlled high-voltage distribution. Both foundry NVM options and third-party IP require selected, half-selected, and unselected operating conditions, update granularity, and disturb limits. Total area includes boosting, control, sensing, ECC, and redundancy.

Coupling ratio, oxide quality, channel type, charge-transfer mechanism, and cycling defects jointly govern distribution drift. FN and hot-carrier paths have different energy and stress conditions. Compare vendors at fixed capacity, temperature, cycle count, retention time, and error criteria instead of combining the best figures from unrelated macros.

### Advantages and Tradeoffs

- Stores updateable parameters within the same chip, reducing external memory interfaces and packaging needs.
- Third-party single-poly solutions can integrate with specified logic, analog, or BCD processes, with zero-added-mask options in identified products.
- Foundry NVM options and third-party IP offer distinct integration conditions that can be matched to update lifetime and available process resources.
- Single-poly does not eliminate area or qualification cost; coupling capacitors, isolation, and high-voltage peripherals still consume die resources.
- The MTP label can cover different carrier mechanisms, update granularities, and endurance; verify the specified macro.
- An IP listed by a foundry is not necessarily double-poly. Third-party licensed IP can appear in foundry catalogs, so technology origin needs separate checking.

### Four Layers of Limits

- Device: Coupling, tunneling or hot-carrier efficiency, and dielectric reliability limit the usable read window after repeated updates. n/p channel types and different erase destinations cannot share one universal operating limit.
- Array: Boosting, selectors, references, ECC, redundancy, and verification determine total macro area and usable throughput. Fine updates can reduce array efficiency; shared lines and half-select disturb constrain parallel program/erase.
- Process: Double-poly NVM options and single-poly logic integration have distinct masks, oxides, wells, thermal budgets, and model requirements. Zero added masks still requires memory qualification on the target process. Base-process poly count cannot substitute for the NVM-option stack.
- System: Update frequency, program/erase stalls, power budgets, and power-loss consistency jointly define usability. The host must honor macro busy states, locks, error handling, and test modes while budgeting cycles over product lifetime.

### Fit and Misuse

Suitable for analog trimming, PMIC settings, sensor parameters, and device configuration that require updates within the same chip. Fix the foundry process and use lifetime first, then compare foundry EEPROM options, third-party MTP macros, total area, and qualification conditions.

Do not substitute the MTP label for physical and macro documentation or treat it as RAM with unlimited rewrites. For a separate memory device, return to conventional EEPROM. Classify SONOS, embedded Flash, and antifuse by their respective storage mechanisms.

### Patent Study

- [US5844271A](https://patents.google.com/patent/US5844271A/en): Reducing the polysilicon layer count still requires effective floating-gate control, program/erase paths, and protection against leakage caused by overerase. Moving the control terminal into the substrate does not remove coupling, selection, or isolation requirements. A buried n-type region serves as the control electrode and a single polysilicon layer forms the floating gate. Thick/thin oxide regions and a separate selection region shape the channel. The specified operation uses channel hot-electron programming and FN electron transfer toward the source for erase, demonstrating that a single-poly structure can still provide capacitive control. Claim Reading: Read claim 1 by tracing the buried control electrode, floating gate, oxide-thickness relationships, and split region. Single-poly is a process-layer characteristic, not a substitute for the complete structure. It also does not make every logic-only MTP product the same combination of claim limitations. Limitations: No public evidence links current Synopsys MTP to this patent, so it is used only for structural teaching. Actual commercial implementation, node qualification, and reliability require independent evidence.

### Check Your Understanding

If two third-party MTP products are both single-poly, can both use the same n-channel hot-electron program and source-FN erase diagram?

No. NeoEE publicly describes FN charge transfer in both directions. NeoMTP describes a p-type floating-gate device, channel-hot-hole-induced hot-electron injection, and an erase-gate exit. Single-poly establishes layer count; a complete diagram must still match the identified cell, terminals, and operating conditions.

### Sources

- [ch-pat-eeprom-singlepoly: Cypress Semiconductor: Buried-Control-Gate Single-Poly EEPROM Patent US5844271A](https://patents.google.com/patent/US5844271A/en)
- [ch-product-mtp: Synopsys: MTP EEPROM NVM IP for Analog and Mixed-Signal Processes](https://www.synopsys.com/resources/mtp-eeprom-nvm-ip-for-analog-and-mixed-signal-process-nodes-datasheet.html)
- [ch-mtp-synopsys: Synopsys: Single-Poly Floating-Gate MTP EEPROM IP](https://www.synopsys.com/designware-ip/memories-logic-libraries/non-volatile-memory/mtp-eeprom.html)
- [ch-mtp-ememory-neoee: eMemory: NeoEE Single-Poly Embedded EEPROM](https://www.ememory.com.tw/en-US/Products/MTP/NeoEE)
- [ch-mtp-ememory-neomtp: eMemory: NeoMTP Single-Poly p-Type Floating-Gate Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP)
- [ch-mtp-xfab-xc06: X-FAB: Historical XC06 Double-Poly Embedded EEPROM Process Brief](https://www.fbe-asic.com/documents/is-xc06.pdf)
- [ch-mtp-ymc-product: Yield Microelectronics: Logic-Process Embedded MTP IP](https://www.ymc.com.tw/index_en.php)
- [ch-mtp-ymc-singlepoly: Yield Microelectronics: Single-Floating-Gate NVM Patent US7423903B2](https://patents.google.com/patent/US7423903B2/en)
- [ch-mtp-floadia-zt: Floadia: LEE Flash ZT Zero-Added-Mask MTP](https://floadia.com/product/lee-flash-zt/)
- [ch-mtp-floadia-zt-fg: Floadia and Maxchip: Public Floating-Gate LEE Flash ZT MTP Integration](https://floadia.com/news/422/)

## NOR: Stacked-Gate and Split-Gate Code Storage

NOR is commonly used for code storage requiring direct, predictable reads. Stacked-gate cells place storage and selection responsibilities under the cell's gate control; split-gate cells add a selection channel that helps block unselected leakage from overerased cells. Execute-in-place support also depends on the interface, controller, and cache timing and cannot be guaranteed by the NOR name alone.

#### Electrical Erase: The Complete PGM / ERS Cycle

The same storage cell supports programming, electrical erase and subsequent programming. ERS restores a window suitable for another program operation; it does not require every carrier to disappear. Whether the host issues a separate erase command depends on the macro or component interface.

PGM → ERS → PGM

The floating gate retains programmed charge. Cells sharing an erase terminal generally need coordinated biasing.

The SuperFlash brochure describes FN tunneling from the floating gate to another gate. In contrast, the channel-erase example in US6232180B1 leaves the select gate, source, and drain floating and raises the p-well and deep n-well to 10–15 V.

Electrons leave the floating gate through the designated exit and threshold voltage falls. A separate selection channel can suppress some unselected conduction caused by overerase, but does not remove storage-layer reliability requirements.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Erase acts on the region defined by shared array controls, commonly a sector or block in the cited products. Preserve still-valid data before erasing; read or program granularity does not define erase granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [ch-pat-nor-splitgate: Worldwide Semiconductor Manufacturing / TSMC: Split-Gate Flash Patent US6232180B1](https://patents.google.com/patent/US6232180B1/en)
- [ch-tech-superflash: SST / Microchip: SuperFlash Technology Brochure DS00001425F](https://ww1.microchip.com/downloads/aemDocuments/documents/sst/product-documents/brochures/00001425F.pdf)
- [ch-maturity-nor-product: Microchip: SST39SF020A Parallel Flash Product Page](https://www.microchip.com/en-us/product/SST39SF020A)
- [ch-tech-nand: Kioxia: NAND Flash Memory Fundamentals](https://www.kioxia.com/en-jp/rd/technology/nand-flash.html)

Maturity: In Volume Production. Microchip's SST39SF020A was listed as in production when reviewed, with a public summary specifying 2 Mb and a 4.5–5.5 V parallel flash interface. SST's SuperFlash technology brochure separately provides an identified technical lineage for split gates, source-side injection, and inter-gate FN erase, allowing commercial implementation evidence to be compared with the mechanism lesson.

A product's interface supply is not its internal cell bias. Typical endurance, retention, and generation figures in the 2018 brochure are not common guarantees for all NOR. The channel-erase table in US6232180B1 must not be applied to SuperFlash.

### Storage and Structure

NOR describes array connectivity and access organization, not a unique storage material. This topic uses floating-gate NOR: charge changes cell threshold voltage, and the selected cell is sensed through the bitline and source path. Both stacked-gate and split-gate cells can serve NOR arrays, but their selection channels, programming efficiency, and erase control differ.

A stacked-gate example places the control gate, inter-gate dielectric, floating gate, and channel vertically above one another. A split-gate example assigns part of the channel to an independent selection function in series with the storage-region channel. The equivalent circuit must clearly show both channel segments and the shared bitline. NOR cells can each connect to the bitline, unlike a NAND string of series-connected cells, at the cost of higher contact and wiring overhead per cell.

### Operation

#### Program: Compare Channel Hot-Electron and Source-Side Injection

Before: The cell starts in an erased threshold range that permits programming. The selected storage and selection channels must establish the correct potential distribution.

Stimulus: A typical stacked-gate hot-electron example uses the lateral source-to-drain field; SuperFlash uses source-side injection. A separate, bounded embodiment in US6232180B1 specifies a 1.5–2 V select gate, 0 V drain, and 9–12 V source.

After: Electrons enter the floating gate and the threshold voltage of a typical n-channel storage region rises. Verify the read state after the pulse and keep unselected cells free from program disturb.

Source-side injection uses the potential drop at the boundary between the selection and storage regions to energize channel electrons, which are collected by the field toward the floating gate. Source/drain labels and biases must follow the original drawing; injection locations in different structures cannot be interchanged arbitrarily. Higher injection efficiency also does not eliminate the macro's need for voltage boosting, current limiting, or verification.

#### Erase: Follow the Structure's Electron Exit Path

Before: The floating gate retains programmed charge. Cells sharing an erase terminal generally need coordinated biasing.

Stimulus: The SuperFlash brochure describes FN tunneling from the floating gate to another gate. In contrast, the channel-erase example in US6232180B1 leaves the select gate, source, and drain floating and raises the p-well and deep n-well to 10–15 V.

After: Electrons leave the floating gate through the designated exit and threshold voltage falls. A separate selection channel can suppress some unselected conduction caused by overerase, but does not remove storage-layer reliability requirements.

Two split-gate implementations may have different erase barriers and charge exits, so their terminal voltages cannot be combined into one bias set. Erase scope depends on shared gates, wells, and array control. Updating a byte still requires the product's block-erase and data-preservation flow; fine-grained reading is not equivalent to fine-grained erase.

#### Read: Sense the Selected Cell's Channel Directly

Before: Different floating-gate charge states produce different conduction levels. Unselected cells on the same bitline must remain isolated.

Stimulus: Apply a read potential to the selected wordline or select gate and establish a small bitline bias. The US6232180B1 example uses Vcc at the select gate, 2 V at the drain, and 0 V at the source and wells.

After: Current flows through the selected cell's source-to-drain channel and, in a split-gate example, through the selection channel. The sensor distinguishes charge states from the current.

NOR does not require an entire string of storage cells to conduct before one cell can be read, which favors random access. An overerased stacked-gate cell that conducts while unselected can corrupt the shared bitline; a separate selection function helps shut off that path. Actual latency still includes wordlines, bitlines, sensing, and the external interface, not only individual-cell speed.

### Selection and Variability

NOR selects cells through wordlines and bitlines, and leakage from unselected rows directly affects sensing. A split gate adds a channel segment that can be turned off independently, addressing the selection problem associated with overerase. Programming, erase, and reading use different terminal combinations, so selected and unselected paths must be redrawn for each operation rather than inferring program/erase safety from a read circuit alone.

Floating-gate coupling, oxide thickness, and injection location change the threshold-voltage distribution. Cycling defects and erase nonuniformity widen it further. Split gates reduce certain array-leakage risks but do not eliminate charge-retention requirements, read disturb, or program/erase stress in the storage region. Comparisons must hold product generation, temperature, and cycling conditions constant.

### Advantages and Tradeoffs

- The array organization favors random reads and suits code and boot data.
- A split gate provides an additional selection function that can suppress unselected leakage caused by overerase.
- Identified production products and an established technical lineage allow selection against actual interface and update requirements.
- More cell contacts and wiring reduce density relative to NAND; complete cost must be compared at the required capacity.
- Erase granularity is usually larger than read granularity, so a small update may still require block-level relocation and data preservation.
- Additional gates, coupling, and high-voltage control increase process and peripheral costs; split gates do not provide a cost-free endurance improvement.

### Four Layers of Limits

- Device: Injection efficiency, tunnel-dielectric quality, and the threshold-voltage window jointly limit program/erase speed and lifetime. Shrinking a cell can increase sensitivity to coupling, short-channel effects, and electron count. A generation's typical endurance must not be treated as the physical limit of the NOR family.
- Array: Bitline contacts and wiring overhead constrain density, while long-line capacitance and leakage constrain sensing speed. Split gates can improve unselected-cell isolation, but erase control, references, and redundancy remain necessary. Comparisons should report capacity, array efficiency, and peripheral area.
- Process: Floating gates, inter-gate dielectric, and injection-region geometry require dedicated process control. Different split-gate generations and erase exits are not interchangeable modules. Integration into a logic process requires checking added masks, thermal budget, voltage-tolerant devices, and qualification data.
- System: Code-read performance depends on the interface, controller, cache, and package, and execute-in-place requires a complete timing contract. Data updates are constrained by block erase, read availability during programming, power-loss handling, and cycle budgets. The fastest quoted read time alone cannot determine the solution.

### Fit and Misuse

Suitable for boot code, firmware requiring predictable random reads, and resident code of moderate capacity. Execute-in-place must be matched to the processor bus, controller, cache, and actual worst-case access time. If firmware must be updated, additionally validate dual-image handling, erase granularity, and power-loss recovery.

For workloads prioritizing large sequential datasets and low cost per bit, compare against NAND's management cost and complete system performance. Frequent small overwrites should not be mapped directly to NOR block erases without first estimating write amplification, movement of retained data, and cycle consumption.

### Patent Study

- [US6232180B1](https://patents.google.com/patent/US6232180B1/en): A split-gate cell must combine efficient programming, controlled erase, and unselected-cell isolation. This patent places source-side injection and channel erase within a specific well and gate structure so that terminal roles support the different operations. During programming, a low select-gate potential and raised source produce source-side injection. During erase, source, drain, and select gate float while the p-well and deep n-well are raised, removing electrons through the channel side. Reading instead uses a Vcc select gate and low drain bias for sensing. Claim Reading: Read claims 4 and 6 together with the Figure 6 operating table to check the combination of wells, storage region, and selection region. Explicitly identify floating terminals and channel erase; the fact that both technologies use split gates does not permit substituting a SuperFlash inter-gate FN diagram. Limitations: The earliest assignee found is Worldwide Semiconductor Manufacturing; TSMC in an aggregated field does not erase that original record. This is a lesson on a specific operation and does not establish implementation correspondence with SST39SF020A or all split-gate NOR.

### Check Your Understanding

If two cells are both called split-gate NOR, can they share the same erase-bias table?

No. The SuperFlash brochure's example uses inter-gate FN tunneling, while US6232180B1 provides a channel-erase embodiment. Identify each electron exit, well, and floating terminal before citing its biases. A shared family name does not establish identical operation.

### Sources

- [ch-pat-nor-splitgate: Worldwide Semiconductor Manufacturing / TSMC: Split-Gate Flash Patent US6232180B1](https://patents.google.com/patent/US6232180B1/en)
- [ch-tech-superflash: SST / Microchip: SuperFlash Technology Brochure DS00001425F](https://ww1.microchip.com/downloads/aemDocuments/documents/sst/product-documents/brochures/00001425F.pdf)
- [ch-maturity-nor-product: Microchip: SST39SF020A Parallel Flash Product Page](https://www.microchip.com/en-us/product/SST39SF020A)
- [ch-tech-nand: Kioxia: NAND Flash Memory Fundamentals](https://www.kioxia.com/en-jp/rd/technology/nand-flash.html)

## SONOS and NROM: Charge Trapping in Insulating Layers

SONOS/MONOS describe material stacks or gate materials, while NROM refers to an implementation lineage that uses localized trapping and read direction. They are not directly interchangeable product names. Infineon's SONOS has production platforms, so the entire charge-trap family must not be labeled emerging. Its FN program/erase mechanism and reliability figures also must not be transferred to every NROM implementation.

#### Electrical Erase: The Complete PGM / ERS Cycle

The same storage cell supports programming, electrical erase and subsequent programming. ERS restores a window suitable for another program operation; it does not require every carrier to disappear. Whether the host issues a separate erase command depends on the macro or component interface.

PGM → ERS → PGM

Programmed charge occupies a trapping material such as nitride, shifting channel threshold voltage or a local barrier.

The cited Infineon 2T SONOS uses FN erase. In the separate US6664588B2 NROM example, band-to-band tunneling generates holes near the selected bit-line/channel junction; lateral acceleration and the gate field inject hot holes into the local nitride storage region.

The selected storage region returns toward its erase window for subsequent programming. In the NROM example, hole injection must overlap the programmed-electron region; residual electrons or excess holes can otherwise disturb the read threshold.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [ch-pat-sonos: NCR: SONOS Blocking-Oxide Patent WO1981000790A1](https://patents.google.com/patent/WO1981000790A1/en)
- [ch-pat-nrom: Saifun: Asymmetric Charge-Trapping Patent US5768192A](https://patents.google.com/patent/US5768192A/en)
- [ch-product-sonos: Infineon: SONOS Embedded Flash IP Solutions](https://www.infineon.com/products/memories/embedded-flash-ip-solutions)
- [op-pat-nrom-hhi: Saifun: Self-Aligned NROM Programming and Erasure Areas](https://patents.google.com/patent/US6664588B2/en)

Maturity: In Volume Production. Infineon publicly lists SONOS eFlash production at 130, 65, 55, 40, and 28 nm and explicitly describes a 2T cell with FN program/erase. Its MCU shipments and licensable macro information support classification as an established platform. Localized-charge NROM is treated separately here through Saifun's original patent, with its own evidence boundary.

The listed 25 ns, 100,000-cycle, and ten-year retention figures are not fully paired across all nodes, capacities, and temperatures, so they are not combined into one guarantee. SONOS production evidence does not automatically establish the same NROM specifications or current product status.

### Storage and Structure

Electrons remain in trapping centers within insulating materials such as silicon nitride, changing the potential seen by the channel and its threshold voltage. The trapping layer is not a conductive floating gate, and charge can have a spatial distribution. Channel-wide SONOS program/erase examples and localized NROM charge-trapping examples therefore require different operating and sensing explanations; simply recoloring a floating gate is not sufficient.

SONOS denotes silicon, oxide, nitride, oxide, and silicon in sequence. From channel toward gate, the stack contains a tunnel oxide, charge-trapping nitride, blocking oxide, and gate. Infineon's identified eFlash implementation adds a series MOS selector to form a 2T cell. NROM emphasizes charge localized near one terminal. Its equivalent model must preserve position along the channel instead of representing storage as one equipotential conductor.

### Operation

#### Program: Distinguish Tunneling Capture from Local Hot-Electron Injection

Before: The trapping layer has a known initial charge distribution. A channel-wide SONOS example controls the storage region as a whole; a localized example must also specify which end stores the charge.

Stimulus: Infineon's identified SONOS uses FN programming. In the localized example of Saifun's US5768192A, high gate and drain biases with the source at low potential establish hot-electron injection conditions.

After: Electrons remain in the trapping layer and raise the barrier in the corresponding channel region. SONOS represents data through distinguishable threshold-voltage windows; the localized example also uses charge position to influence reverse readout.

In a tunneling example, charge crosses the thin dielectric from the channel side and is then trapped. In a hot-electron example, carriers first gain energy near the drain, producing localized stored charge. An insulating trapping layer does not automatically equalize potentials and charge distributions as a conductor does. The product page does not disclose the complete film thicknesses and terminal biases, so this explanation remains at the verified mechanism level.

#### Erase: Follow the Trap Stack and Identified Mechanism

Before: Programmed charge occupies a trapping material such as nitride, shifting channel threshold voltage or a local barrier.

Stimulus: The cited Infineon 2T SONOS uses FN erase. In the separate US6664588B2 NROM example, band-to-band tunneling generates holes near the selected bit-line/channel junction; lateral acceleration and the gate field inject hot holes into the local nitride storage region.

After: The selected storage region returns toward its erase window for subsequent programming. In the NROM example, hole injection must overlap the programmed-electron region; residual electrons or excess holes can otherwise disturb the read threshold.

Read US6664588B2 Figures 8A and 9–11 as a named pocket-implant erase example. Do not attribute that structure to US5768192A or substitute the SONOS FN diagram for NROM hot-hole erase. The cited implementation defines selection, pulse verification and erase granularity.

#### Read: Sense the SONOS Window and the NROM Direction

Before: Stored SONOS charge changes threshold voltage. Localized NROM charge changes the channel barrier near a particular terminal.

Stimulus: The SONOS 2T example enables its selector and applies a read-gate bias. The localized US5768192A example reverses the direction relative to programming: the gate and original source are biased, while the original drain is held at low potential.

After: Source-to-drain channel current is sensed. Reverse reading positions charge originally near the programming drain where it controls the carrier-injection-end barrier more effectively, increasing its influence on the readout.

Read current travels through the channel; it does not empty all electrons from the nitride. A channel-wide threshold model explains many SONOS operations, but ignoring charge position in a localized cell can obscure why reverse reading works. Read direction must be labeled against the original programming terminals, rather than silently exchanging source and drain names in a drawing.

### Selection and Variability

In Infineon's 2T SONOS, a MOS selector is in series with the charge-trap storage transistor, separating isolation and storage functions. High-field program/erase also requires consideration of shared wordlines and wells. Localized-charge arrays must additionally manage direction, half-selection, and neighboring data states. Successful reverse reading of one cell does not establish reliable storage of two independent bits in a large array.

Trap density, energy levels, interface quality, and film thickness affect programming speed, detrapping, and retention. Localized charge also varies in lateral position and distribution width. Compare windows initially, after cycling, and after high-temperature retention. Extending the concept to storage at both ends requires measuring their interaction rather than simply counting an additional possible storage position.

### Advantages and Tradeoffs

- The insulating trapping layer offers structural and scaling choices distinct from a conductive floating gate.
- Identified SONOS embedded-memory production nodes and licensable macros exist; the technology cannot broadly be described as not yet commercial.
- Localized charge position can participate in information encoding and readout design, but additional bits require separate proof that their states remain distinguishable.
- Trap, interface, and blocking-layer quality jointly determine retention and endurance; charge-loss risk remains.
- Channel-wide tunneling and localized hot-electron operations cannot share unqualified bias or reliability data.
- Localized trapping increases sensitivity to position and interaction between terminals, requiring more detailed models and measurements.

### Four Layers of Limits

- Device: Program/erase speed and retention depend on the tunneling barrier, trap depth, and blocking layer. Charge that is easier to inject may also escape more readily. Cycling-induced defects change the window, while localized charge is additionally affected by short-channel behavior and lateral distribution. The SONOS name alone does not establish a fixed endurance ceiling.
- Array: Selectors and shared biases determine isolation, granularity, and effective density. Localized multibit implementations must keep spatially distinct states distinguishable while accounting for programming direction, half-selection, and neighbor interference. Two charge clusters in a cell illustration do not establish two reliable deliverable bits.
- Process: The upper/lower oxides, nitride, and interfaces must retain appropriate traps and barriers within the thermal budget. Changing the metal gate or blocking layer also changes field distribution. Production qualification for an embedded process belongs to a particular stack, node, and macro combination and cannot be extended to arbitrary charge-trap devices.
- System: The system must still budget program/erase latency, supply requirements, post-cycling retention, and ECC conditions. A macro family listing fast reads and long retention does not establish simultaneous operation at maximum temperature, maximum capacity, and maximum accumulated cycles. Obtain the fully paired conditions before committing to an application lifetime.

### Fit and Misuse

Suitable for embedded code and parameter storage where the identified process has qualification evidence. When selecting a solution such as Infineon SONOS, obtain the corresponding macro data for the node, capacity, temperature, and read/write requirements. NROM is also useful for understanding the principles and costs of localized charge, reverse reading, and spatial multibit encoding.

Do not treat SONOS, MONOS, NROM, and 3D NAND as one interchangeable cell. Requirements involving two-bit storage, very-high-temperature retention, or a specific cycling guarantee need complete product or measurement data for that implementation. The best figures from a different charge-trap family must not be used to fill missing evidence.

### Patent Study

- [WO1981000790A1](https://patents.google.com/patent/WO1981000790A1/en): Early charge-trap memories needed longer retention under practical program/erase conditions. If charge readily escapes toward the gate, simply thickening or changing the lower dielectric may not meet both programming-speed and retention requirements. A blocking oxide is inserted between the silicon-nitride trapping layer and the silicon gate, while a thin tunnel oxide remains below. Figure 1 distinguishes the lower barrier used for electron transfer from the upper barrier that suppresses escape, showing the different responsibilities of the stack's layers. Claim Reading: Claim 1 includes a particular stack and thickness relationships. For example, the early limitations of a 70–100 Å blocking oxide and a lower oxide no thicker than 15 Å must be labeled as conditions of this patent. The technical focus is on which layers tunnel, trap, and block, not on treating these values as modern design rules. Limitations: This patent is not the complete structure or operating specification of modern Infineon SONOS. It also does not provide common performance figures for all MONOS, NROM, or 3D NAND.
- [US5768192A](https://patents.google.com/patent/US5768192A/en): The effect of localized trapped charge on the channel depends on read direction. Reading in an unfavorable direction may weaken its control of current. Injection position and read terminals must be paired to distinguish data using the asymmetric charge distribution. High gate and drain biases inject hot electrons into the trapping layer near the drain. Reversing current direction during readout makes that localized charge control the channel injection barrier more effectively. Storage position and read direction therefore become part of data interpretation. Claim Reading: Read claims 1 and 23 by identifying the localized trapping region, programming direction, and reverse-read conditions in sequence. Extracting only the phrase silicon nitride stores charge misses the relevant combination. A single localized charge region also does not establish that the patent fully describes every two-ended, two-bit array. Limitations: The original publication names Saifun; later Spansion Israel metadata does not replace the original corporate record. This material uses the patent for localized programming and reverse reading. Two-bit erase, current products, and production reliability require separate evidence.

### Check Your Understanding

If a SONOS nitride layer is drawn as one continuous film, does that mean all its charge can freely equalize as it would on a metallic floating gate?

No. Nitride is an insulating trapping material, so charge can remain at different positions. Readout of a localized-charge cell consequently depends on charge position and read direction. Distinguish continuity of the material, localization of charge, and the way the full channel is sensed.

### Sources

- [ch-pat-sonos: NCR: SONOS Blocking-Oxide Patent WO1981000790A1](https://patents.google.com/patent/WO1981000790A1/en)
- [ch-pat-nrom: Saifun: Asymmetric Charge-Trapping Patent US5768192A](https://patents.google.com/patent/US5768192A/en)
- [ch-product-sonos: Infineon: SONOS Embedded Flash IP Solutions](https://www.infineon.com/products/memories/embedded-flash-ip-solutions)
- [op-pat-nrom-hhi: Saifun: Self-Aligned NROM Programming and Erasure Areas](https://patents.google.com/patent/US6664588B2/en)

## NAND: Planar Strings, Vertical Stacks, and Multilevel Storage

Series connection increases density by sharing contact overhead across cells, but reading one cell requires the other cells in its string to provide a conduction path. Planar feature shrink, additional 3D layers, and more bits per cell are distinct density axes, each with charge-window, process, and reliability costs. Page programming and block erase also make the controller an important part of usable storage.

#### Electrical Erase: The Complete PGM / ERS Cycle

The same storage cell supports programming, electrical erase and subsequent programming. ERS restores a window suitable for another program operation; it does not require every carrier to disappear. Whether the host issues a separate erase command depends on the macro or component interface.

PGM → ERS → PGM

Cells occupy different programmed threshold-voltage states. A block being reclaimed may still contain other pages whose data must be preserved.

Depending on the structure, raise the channel or well potential relative to the wordlines to establish an erase field that reduces stored electrons. The US7696559B2 example raises the common source line, holds the selected block's wordlines at 0 V, and leaves bitlines and selection-related terminals floating as specified in that embodiment.

The block's cells return to the erased window. The controller must first preserve still-valid pages elsewhere; rewriting a single bit is not a substitute for block erase.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Erase acts on the region defined by shared array controls, commonly a sector or block in the cited products. Preserve still-valid data before erasing; read or program granularity does not define erase granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [ch-pat-nand-vertical: Toshiba: Columnar-Semiconductor Vertical NAND Patent US7696559B2](https://patents.google.com/patent/US7696559B2/en)
- [ch-tech-nand: Kioxia: NAND Flash Memory Fundamentals](https://www.kioxia.com/en-jp/rd/technology/nand-flash.html)
- [ch-tech-multilevel: Kioxia: Increasing Flash Capacity with Multilevel Cells](https://www.kioxia.com/en-jp/rd/technology/multi-level-cell.html)
- [ch-tech-retention: Kioxia: Data Retention in the Managed Flash Endurance and Reliability Series](https://americas.kioxia.com/content/dam/kioxia/en-us/business/memory/mlc-nand/asset/KIOXIA_NAND_Flash_Data_Retention_Technical_Brief.pdf)
- [ch-tech-ecc: Kioxia: NAND Error-Correction Code Technical Brief](https://www.kioxia.com/content/dam/kioxia/shared/business/memory/mlc-nand/asset/productbrief/KIOXIA_Understanding_ECC_Tech_Brief.pdf)
- [ch-tech-deepetch: Kioxia: Improving Memory-Hole Process Productivity with a New Etch Gas](https://www.kioxia.com/en-jp/rd/technology/topics/topics-62.html)
- [ch-paper-3dvariation: Y. Luo et al.: Early Retention Loss and Process Variation in 3D NAND](https://arxiv.org/abs/1807.05140)
- [ch-paper-readdisturb: Y. Cai et al.: Read-Disturb Errors in MLC NAND Flash](https://arxiv.org/abs/1805.03283)
- [ch-maturity-bics: Kioxia: BiCS FLASH Principles and Commercial Generations](https://www.kioxia.com/en-jp/rd/technology/bics-flash.html)

Maturity: Commercial Generations Established. Kioxia's fundamentals explanation records commercial planar 15 nm technology and BiCS FLASH generations: 48 layers in 2015, 96 layers in 2018, 112 layers in 2020, and 162 layers in 2022. This establishes 3D NAND as a mature commercial family and supports a historical comparison of planar scaling and vertical stacking.

This material deliberately uses verifiable commercial history rather than claiming the latest 2026 layer-count or product ranking. Layer count, bits per cell, capacity, and performance must be cited together for each generation. Sampling or announcing a new layer count is not automatically volume production.

### Storage and Structure

NAND data can still be retained by charge in a floating gate or dielectric trapping layer that changes threshold voltage. NAND itself describes an array organization with multiple cells connected in series. Storing N bits per cell requires 2 to the Nth power distinguishable states, such as eight for TLC and sixteen for QLC. More bits do not provide additional windows of unchanged width for free.

Planar NAND connects a row of memory transistors in series along the substrate, with string selectors, a bitline, and a source line at the ends. In 3D NAND, a vertical channel passes through multiple wordline layers, forming a cell at each intersection. BiCS illustrations show a storage film along the hole and a columnar channel. The equivalent circuit remains a string of wordline-controlled transistors. The early columnar-sidewall drawings in US7696559B2 are not substitutes for every modern gate-all-around cross-section.

### Operation

#### Program: Raise the Selected Wordline and Inhibit Other Channels

Before: The block starts in a programmable state, and the controller determines the page data. Bits on the same wordline may either require programming or need to remain unchanged.

Stimulus: Apply the programming potential to the selected wordline and appropriate pass potentials to other wordlines. Bitlines and selectors control each string's channel so that cells to be programmed see a larger tunneling field while inhibited cells see a reduced effective field.

After: Electrons enter the floating gate or trapping layer from the channel side, raising threshold voltage toward the target state. Multilevel storage requires controlled programming and read verification to maintain state separation, not a single arbitrarily high pulse.

The early US7696559B2 example uses Vpgm on the selected wordline and lower pass potentials on the others, with channel conditions inhibiting unwanted programming. Both planar and 3D implementations depend on the effective field across the storage layer, not merely the wordline-to-ground voltage. Specific channel boosting, pulse stepping, and selector timing require verification for each implementation.

#### Erase: Reset the Charge Window of a Shared Block

Before: Cells occupy different programmed threshold-voltage states. A block being reclaimed may still contain other pages whose data must be preserved.

Stimulus: Depending on the structure, raise the channel or well potential relative to the wordlines to establish an erase field that reduces stored electrons. The US7696559B2 example raises the common source line, holds the selected block's wordlines at 0 V, and leaves bitlines and selection-related terminals floating as specified in that embodiment.

After: The block's cells return to the erased window. The controller must first preserve still-valid pages elsewhere; rewriting a single bit is not a substitute for block erase.

Erase granularity follows shared wells, channels, and wordline-bias control, and differs from a read page or a host address. Planar floating-gate cells and modern 3D stacks may use different charge-removal or neutralization paths. This material preserves the boundary of the early embodiment and does not present one common-source bias as the erase specification of all NAND.

#### Read: Pass Unselected Cells and Sense the Selected Threshold

Before: The bitline is precharged or otherwise placed in a sensing condition, and the selectors at both string ends prepare a path. The selected cell may occupy one of several threshold-voltage states.

Stimulus: Use a decision potential on the selected wordline and pass potentials on unselected wordlines so that they conduct despite their stored states. Multilevel reading uses the corresponding reference conditions to identify the state interval.

After: If the selected cell conducts, the string permits a detectable bitline current or discharge; if it remains off, the path is blocked. Data mapping and any required ECC then recover the bits from the sensing results.

When one cell is read, the other storage cells still experience pass bias, so the absence of a program command does not mean zero read disturb. String resistance, wordline/bitline loading, and threshold-voltage distributions jointly affect readout. In US7696559B2, the selected 0 V condition belongs only to that early example; one fixed potential cannot distinguish all multilevel states.

### Selection and Variability

NAND selection has three levels: the block defines the shared control scope, the wordline identifies a position in the string, and bitlines with string selectors determine which strings are programmed or sensed. Half-select inhibition requires management of channel potential and pass stress. Unselected wordline potentials must enable the path without accumulating excessive disturb, so reporting only the selected wordline voltage is insufficient.

Planar scaling increases sensitivity to small charge losses and neighboring-cell coupling. 3D introduces hole-profile, layer-to-layer process, and channel differences. Abstracts of original measurement studies also identify early retention loss and retention interference. Narrower multilevel windows make these distribution differences more likely to cause errors, so analysis must include cycling, temperature, retention time, and ECC conditions together.

### Advantages and Tradeoffs

- Series connection shares contacts, supporting high density and large-capacity data storage.
- 3D stacking adds storage cells per unit planar area instead of relying only on lateral feature shrink.
- Multilevel storage adds bits per cell and can be combined with vertical stacking, at the cost of tighter windows and additional management.
- Page programming and block erase make small updates involve data movement, write amplification, and garbage collection.
- More states reduce threshold-voltage separation and increase the burden on read/program procedures and error management.
- Higher layer counts increase deep-hole etching, profile-control, and layer-variation challenges and do not automatically reduce effective cost per bit.

### Four Layers of Limits

- Device: The usable threshold-voltage range is finite; more bits divide that same range into more states. Charge loss, trapping/detrapping, cycling defects, and interference broaden distributions. Physical limits must be expressed through distinguishable state count and specified retention/cycling conditions, not minimum cell area alone.
- Array: String length, selectors, pass bias, and wordline loading affect read/program timing and disturb. Layer variation in 3D and multilevel distributions also require reference adjustment, verification, and error correction. Effective density must account for redundancy and management overhead rather than treating layer count multiplied by bits per cell as usable capacity.
- Process: High-aspect-ratio 3D memory holes require balanced control of profile, uniformity, etch time, and subsequent film quality. More layers also increase manufacturing time and cost risk. Kioxia's deep-hole process research identifies productivity as a key bottleneck; a layer-count record alone does not demonstrate lower cost per bit.
- System: Host-visible performance and lifetime depend on ECC, data movement, redundancy, the controller, and workload. Cycle count, temperature, and retention time jointly determine reliability. Performance after the cache fills, worst-case tail latency, and write amplification require measurement; a NAND die's peak transfer rate alone is insufficient.

### Fit and Misuse

Suitable for SSDs, managed flash, and systems requiring large-capacity data storage. Selection must distinguish raw NAND from products with a controller and evaluate lifetime against actual read/write mix, retention time, operating temperature, and written data volume. Capacity, bits per cell, and ECC conditions must be tied to an identified product.

Raw NAND should not be treated as directly and arbitrarily overwritable byte-addressable memory. Individual-device speed or performance with an empty cache is also not representative of application performance. When the primary requirements are small capacity, direct random reads, or highly predictable latency, compare alternatives with controller and management costs included.

### Patent Study

- [US7696559B2](https://patents.google.com/patent/US7696559B2/en): Planar density growth is limited by cell dimensions and contacts. Storage cells need to be arranged vertically while retaining selectable NAND strings, a manufacturable process, and workable program/erase/read biases. Stacked materials alone, without a complete current path, do not form a memory array. The sidewalls of a columnar semiconductor layer combine with stacked wordlines and an insulating charge-trap layer to form vertical cells. Selectors, bitlines, and a common source complete the string. Figures 7–9 provide specific examples of erase by raising the common source, programming a selected wordline, and reading by bitline discharge. Claim Reading: First map the spatial relationships among the columnar semiconductor layer, gates, and charge-storage dielectric in claim 1, then read them with the array and bias drawings. Vertical NAND is only a family name. This patent's particular sidewall and channel arrangement must not be drawn as the universal cross-section of all modern gate-all-around implementations. Limitations: This is an early vertical-NAND research seed, not a complete patent lineage for planar NAND, channel boosting, or pulse algorithms. The patent alone also does not establish that a contemporary BiCS product implements every claim limitation.

### Check Your Understanding

Does moving from TLC to QLC while increasing the layer count necessarily improve speed and endurance and reduce cost at the same time?

No. QLC must distinguish sixteen states, while TLC needs only eight; narrower windows increase verification and error-management demands. More layers add deep-hole process and layer-variation challenges. Evaluate an identified product's usable capacity, manufacturing and controller costs, workload, and reliability conditions together.

### Sources

- [ch-pat-nand-vertical: Toshiba: Columnar-Semiconductor Vertical NAND Patent US7696559B2](https://patents.google.com/patent/US7696559B2/en)
- [ch-tech-nand: Kioxia: NAND Flash Memory Fundamentals](https://www.kioxia.com/en-jp/rd/technology/nand-flash.html)
- [ch-tech-multilevel: Kioxia: Increasing Flash Capacity with Multilevel Cells](https://www.kioxia.com/en-jp/rd/technology/multi-level-cell.html)
- [ch-tech-retention: Kioxia: Data Retention in the Managed Flash Endurance and Reliability Series](https://americas.kioxia.com/content/dam/kioxia/en-us/business/memory/mlc-nand/asset/KIOXIA_NAND_Flash_Data_Retention_Technical_Brief.pdf)
- [ch-tech-ecc: Kioxia: NAND Error-Correction Code Technical Brief](https://www.kioxia.com/content/dam/kioxia/shared/business/memory/mlc-nand/asset/productbrief/KIOXIA_Understanding_ECC_Tech_Brief.pdf)
- [ch-tech-deepetch: Kioxia: Improving Memory-Hole Process Productivity with a New Etch Gas](https://www.kioxia.com/en-jp/rd/technology/topics/topics-62.html)
- [ch-paper-3dvariation: Y. Luo et al.: Early Retention Loss and Process Variation in 3D NAND](https://arxiv.org/abs/1807.05140)
- [ch-paper-readdisturb: Y. Cai et al.: Read-Disturb Errors in MLC NAND Flash](https://arxiv.org/abs/1805.03283)
- [ch-maturity-bics: Kioxia: BiCS FLASH Principles and Commercial Generations](https://www.kioxia.com/en-jp/rd/technology/bics-flash.html)

## Toggle MRAM: Magnetic-Field Sequencing

Toggle MRAM assigns data retention to the magnetic energy barrier and data modification to precisely sequenced magnetic fields. The controller first determines whether the existing and requested values differ, then toggles only when needed. It does not require the block-erase sequence of Flash, but it adds read, comparison, and toggle control. This complete sequence is essential to a valid comparison of write latency and energy.

#### Erase Semantics: Direct Magnetic Overwrite, No Separate ERS

MRAM overwrites existing data by changing magnetic state, without a Flash-style erase-before-program step. Clearing to all zeros or ones is a series of target-state writes; the P/AP-to-data mapping is product-specific.

P ⇄ AP

The junction is in the antiparallel, high-resistance state, and the controller requests the earlier data value.

Compare the data, then apply another qualified Toggle write sequence.

The free layer returns to the low-resistance state, parallel to the reference layer.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [EMG-SEC: Everspin 2025 Product and Manufacturing Filing](https://www.sec.gov/Archives/edgar/data/1438423/000162828026014733/mram-20251231.htm)
- [EMG-P-TOGGLE: Motorola: Toggle Writing Patent US6545906B1](https://patents.google.com/patent/US6545906B1/en)

Maturity: In Volume Production. Everspin's 2025 annual filing explicitly states that Toggle products entered volume production in 2008 and that devices with capacities of 128kb–32Mb continue to ship. This is commercial evidence for a named product family, rather than maturity inferred from a patent or experimental device.

Interfaces, capacities, and grades have individual specifications. Commercial history does not replace a datasheet and availability check for the selected part number.

### Storage and Structure

The bit is stored in the magnetization direction of the free magnetic layer. Parallel and antiparallel alignment relative to the reference layer produce different resistance levels in the magnetic tunnel junction. A magnetic energy barrier maintains the direction after power is removed. Toggle specifically denotes a write method that reverses data through the rotation of coupled magnetic moments; it is not a general name for all field-written MRAM.

A representative cross section contains a reference magnetic layer, a thin tunnel barrier, and a coupled free magnetic layer, with the MTJ connected to a read access transistor. Two intersecting write lines near the junction generate magnetic fields through their respective currents. Read current passes through the junction, whereas the write stimulus primarily flows through the lines. Their area and spacing must be included in the bit dimensions.

### Operation

#### Write: Compare Before Toggling

Before: The MTJ is in the parallel, low-resistance state, and the requested data is the opposite value.

Stimulus: Read and compare first, then activate the currents in the two write lines in sequence.

After: The coupled free magnetic moments rotate along the designed trajectory and settle into the antiparallel, high-resistance state.

One Toggle sequence reverses the existing state. If the target and existing values match, toggling must be skipped. Products may define their own logic encoding; low resistance does not necessarily represent 0.

#### Reverse Overwrite: No Separate Physical Erase

Before: The junction is in the antiparallel, high-resistance state, and the controller requests the earlier data value.

Stimulus: Compare the data, then apply another qualified Toggle write sequence.

After: The free layer returns to the low-resistance state, parallel to the reference layer.

Restoration here is performed through individual-bit rewriting, not a physical erase that clears the whole array. The result of the same toggle sequence depends on the current state, so the initial read and decision cannot be omitted.

#### Read: Sense MTJ Resistance

Before: Data is retained in the parallel or antiparallel magnetic state.

Stimulus: Enable the access transistor, apply a small voltage, and compare the resulting current with a reference.

After: The sense amplifier outputs data while the original magnetic state remains unchanged under normal operation.

Reading requires separation between resistance distributions while keeping disturbance and stress within acceptable limits. Reference cells, temperature, and process variation affect the read margin.

### Selection and Variability

For reading, the word line normally enables the access transistor and the bit line connects the cell to the sensing circuit. Writing selects the target through the sequence and intersection of two lines; cells that are not fully selected may still experience partial magnetic fields. Verification must therefore examine magnetic-field trajectories and data retention in half-selected cells, as well as the logical address and successful switching of the target cell.

Free-layer dimensions, coupling strength, magnetic anisotropy, and line current change the safe switching region. Circuits must keep process and temperature distributions within the qualified timing window, using write verification, redundancy, and error correction to control tail failures. If these variations are used for a PUF, reproducibility must also be demonstrated; occasional write errors are not automatically a usable fingerprint.

### Advantages and Tradeoffs

- The write stimulus does not require a large current through the tunnel barrier, helping reduce write stress on the barrier.
- Long commercial product experience and individual-bit rewriting support systems that frequently preserve small data records.
- Normal sensing does not require the read-and-restore sequence of ferroelectric capacitor memory, allowing straightforward system operation and interfaces.
- The current, spacing, and half-select conditions of magnetic-field lines limit density scaling.
- Reading and comparison are required before deciding to toggle, so the complete write sequence takes longer than a single physical reversal.
- External magnetic fields, packaging, and temperature conditions require product-specific validation; the device cannot be assumed immune to magnetic fields.

### Four Layers of Limits

- Device: The magnetic energy barrier must be high enough to retain data yet permit reliable reversal by a field generated with reasonable current. An improperly designed coupled free layer can follow an incorrect rotation trajectory or lose stable states.
- Array: The spacing, current distribution, and half-select disturbance of two write-line sets constrain array scaling. If the lines cannot scale with the bit, a smaller cell does not produce a proportional improvement in effective density.
- Process: Magnetic-layer deposition, coupling-layer thickness, and junction etching affect magnetic uniformity. Thermal processing must accommodate the magnetic layers, tunnel barrier, and CMOS interconnects; package reflow conditions also require separate validation.
- System: Pre-write reading, comparison, and worst-case sequencing belong in the access time. Power-failure atomicity, bus transfers, and capacity cost determine system benefit; magnetic reversal time cannot substitute for complete write latency.

### Fit and Misuse

Suitable for small records, industrial control, and equipment-state retention when available products meet capacity requirements, updates are frequent, and data must survive power loss. Selection should check actual capacity, interface, operating temperature, and magnetic-field conditions, considering the availability of mature products together with their lifetime conditions.

For maximum bit density, low-cost bulk storage, or very small embedded caches at advanced nodes, commercial Toggle availability alone does not establish the best technology choice. Write-line area, drive current, and comparison operations may dominate cost; compare concrete STT implementations and other options with suitable interfaces.

### Patent Study

- [US6545906B1](https://patents.google.com/patent/US6545906B1/en): Keep field writing within a controllable switching region and reduce the sensitivity of direct writing to magnetic-field amplitude and half-select conditions. Antiferromagnetically coupled free magnetic layers and sequentially applied write fields rotate the free magnetic moments along a designed trajectory to reverse the state. Claim Reading: Claim 1 links the coupled free layer with the write method. Read the layer structure, field order, and state transition together, rather than extracting only the word "toggle.". Limitations: This patent discloses a specific Toggle design. It does not establish the actual internal structure of every Everspin product or the patent's current legal status.

### Check Your Understanding

If the stored data already matches the target value, why must the controller avoid executing another Toggle sequence?

A Toggle write reverses the current state. Executing it once would invert data that is already correct. The controller must read and compare first, toggling only when the existing and target values differ.

### Sources

- [EMG-SEC: Everspin 2025 Product and Manufacturing Filing](https://www.sec.gov/Archives/edgar/data/1438423/000162828026014733/mram-20251231.htm)
- [EMG-P-TOGGLE: Motorola: Toggle Writing Patent US6545906B1](https://patents.google.com/patent/US6545906B1/en)

## STT-MRAM: Spin Current Through the Junction

STT concentrates write current in the selected junction and improves on the scaling limitations of magnetic-field write lines, making it an important route for commercial discrete and embedded MRAM. Increasing current can shorten switching time, but also raises access-transistor requirements and barrier stress. Reducing current can lengthen latency and worsen the error-rate tail. The best speed, lifetime, and density values from separate conditions cannot be combined into one product specification.

#### Erase Semantics: Direct Magnetic Overwrite, No Separate ERS

MRAM overwrites existing data by changing magnetic state, without a Flash-style erase-before-program step. Clearing to all zeros or ones is a series of target-state writes; the P/AP-to-data mapping is product-specific.

P ⇄ AP

The MTJ is in the antiparallel, high-resistance state.

Reverse the junction write-current direction and apply a qualified pulse.

The free layer returns to the parallel, low-resistance state.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [EMG-SEC: Everspin 2025 Product and Manufacturing Filing](https://www.sec.gov/Archives/edgar/data/1438423/000162828026014733/mram-20251231.htm)
- [EMG-XSPI: Everspin 64Mb High-Reliability xSPI Production Qualification](https://investor.everspin.com/news-releases/news-release-details/everspin-advances-high-reliability-xspi-mram-portfolio-256mb)
- [EMG-RA8: Renesas RA8M2/RA8D2 MCUs with Embedded MRAM](https://www.renesas.com/en/about/newsroom/renesas-adds-two-new-mcu-groups-blazing-fast-ra8-series-1ghz-performance-and-embedded-mram)
- [EMG-P-STT: IBM: Spin-Torque Structure Patent US5695864A](https://patents.google.com/patent/US5695864A/en)

Maturity: In Volume Production. Everspin has shipped STT products with DDR-derived interfaces and SPI-class products. In 2026, its 64Mb high-reliability xSPI product also has evidence of completed production qualification and ordering availability. Embedded implementations must be linked individually to a specific MCU or process document.

Interface speed is not junction switching time. Production capacity, automotive grade, and qualification year must not be combined across product families.

### Storage and Structure

The stored quantity remains the orientation of the free magnetic layer relative to the reference layer, and reading relies on the resistance difference of the magnetic tunnel junction. The principal difference from Toggle is writing: current passing through the magnetic stack carries spin angular momentum and exerts torque on the free layer, changing its magnetic state. Nonvolatility comes from the magnetic energy barrier, not from keeping current inside the device.

A typical embedded cell places one access transistor in series with one MTJ. The MTJ contains a reference magnetic layer, a thin MgO barrier, and a free magnetic layer; modern designs often use perpendicular magnetic anisotropy. Bit and source lines apply write biases of opposite polarity, while the word line controls the access transistor. The sensing circuit reads through the same junction, creating a shared read/write path.

### Operation

#### Write: Switch with Spin Torque in One Direction

Before: The MTJ is in the parallel, low-resistance state, and the target is the opposite data value.

Stimulus: Enable the word line and drive current of the selected polarity through the MTJ for a sufficient pulse duration.

After: The free layer switches to antiparallel alignment, increasing the sensed resistance.

Switching has a probability distribution. Pulse amplitude and duration must cover process, temperature, and the target error rate. A teaching diagram's current arrow represents one stack convention; actual direction must be checked against the electrodes and current convention.

#### Reverse Overwrite: No Separate Physical Erase

Before: The MTJ is in the antiparallel, high-resistance state.

Stimulus: Reverse the junction write-current direction and apply a qualified pulse.

After: The free layer returns to the parallel, low-resistance state.

STT can directly rewrite either magnetic state without first erasing a whole block. A clear command in a particular product may be a controller or interface function; it does not establish a Flash-like physical erase mechanism.

#### Read: Sense Resistance Within Read-Disturb Limits

Before: The junction retains one of its magnetic states.

Stimulus: Read with a small current signal far below the normal write requirement and compare it with a reference current.

After: Output the bit while aiming to preserve the original magnetic state.

Reading also produces spin torque, so the signal cannot be increased without limit. The design must simultaneously satisfy sensing speed, read margin, and the long-term cumulative probability of read disturbance.

### Selection and Variability

The access transistor in a 1T1MTJ cell isolates unselected cells and supplies write current. The word line and bit/source lines jointly determine the address and current direction. The transistor must drive the MTJ at worst-case voltage and temperature, so its area may become a bottleneck before the magnetic device itself. Reference cells, sense amplifiers, and spare rows also count toward macro density.

MTJ diameter, barrier thickness, magnetic anisotropy, and reference-layer properties create distributions of resistance and critical current. Thermal fluctuations add a probabilistic switching tail, so average write latency alone is insufficient. Grouped pulse settings, write verification, ECC, redundancy, and read-reference design can reduce errors, but they add energy, time, and peripheral area.

### Advantages and Tradeoffs

- Write selection can concentrate current in a single junction, supporting further scaling more readily than field writing.
- Individual bits can be rewritten directly, combining power-off retention with frequent updates.
- Discrete chips and embedded platforms already exist, allowing actual capacity and reliability to be checked in product documents.
- Reading and writing share the tunnel barrier, requiring joint design of write stress and read disturbance.
- Retention, write speed, and current are subject to physical tradeoffs.
- As capacity grows, the distribution tails of difficult-to-write or difficult-to-read bits are more likely to dominate yield.

### Four Layers of Limits

- Device: Shrinking the free layer reduces its magnetic energy barrier and may weaken high-temperature retention. Increasing anisotropy to restore stability can increase write current. Barrier breakdown lifetime and stochastic switching tails jointly constrain the operating window.
- Array: Access-transistor size, bit-line voltage drop, and write-polarity asymmetry affect writability at the worst-case location. Large arrays must also account for reference drift, tail bits, redundancy, and the actual area overhead of ECC.
- Process: MTJ etch redeposition, sidewall damage, and barrier uniformity directly affect shorts and the resistance ratio. The thermal budget must preserve magnetic properties while supporting interconnects and package reflow. Demonstrating room-temperature switching in a cell is insufficient.
- System: Complete latency includes the bus, macro access, possible write verification, and ECC. Higher-level power-failure consistency, cache writeback, and update frequency determine endurance requirements. A DDR-derived interface does not make every behavior equivalent to DRAM.

### Fit and Misuse

Suitable for code, equipment state, data logging, and some persistent working memory that require power-off retention and frequent updates. MCU or SoC integration must jointly confirm available capacity, process options, write latency, temperature-dependent lifetime, and software update strategy. Select a concrete macro rather than the MRAM name alone.

Generic STT figures are insufficient for decisions involving extremely high density, the lowest bit cost for long-term bulk storage, or unlimited high-frequency writes without workload conditions. Cache replacement also requires worst-case write error rate, energy, and read-disturb checks, rather than average switching speed alone.

### Patent Study

- [US5695864A](https://patents.google.com/patent/US5695864A/en): Change a magnetic moment with current flowing through a magnetic structure, providing state control without the magnetic field from external write lines. Current passes through a layered structure containing fixed and variable magnetic moments. Angular-momentum exchange exerts torque on the variable magnetic moment. Claim Reading: Claim 1 focuses on the relationship among the magnetic roles of the layers, current direction, and the change in magnetic moment. Modern MgO junction materials and all 1T1MTJ peripheral circuits must not be read into this early claim. Limitations: A starting point for research into STT principles. It does not establish adoption of a specific embodiment by a foundry or product, nor does it support a conclusion on legal status.

### Check Your Understanding

Why cannot STT-MRAM read current simply be increased indefinitely to accelerate sensing?

Read current also passes through the MTJ, producing spin torque and electrical stress. Higher current increases the signal but may also increase read disturbance and barrier stress. Sensing margin and error rate must be considered together.

### Sources

- [EMG-SEC: Everspin 2025 Product and Manufacturing Filing](https://www.sec.gov/Archives/edgar/data/1438423/000162828026014733/mram-20251231.htm)
- [EMG-XSPI: Everspin 64Mb High-Reliability xSPI Production Qualification](https://investor.everspin.com/news-releases/news-release-details/everspin-advances-high-reliability-xspi-mram-portfolio-256mb)
- [EMG-RA8: Renesas RA8M2/RA8D2 MCUs with Embedded MRAM](https://www.renesas.com/en/about/newsroom/renesas-adds-two-new-mcu-groups-blazing-fast-ra8-series-1ghz-performance-and-embedded-mram)
- [EMG-P-STT: IBM: Spin-Torque Structure Patent US5695864A](https://patents.google.com/patent/US5695864A/en)

## SOT-MRAM: Separate Read and Write Paths

SOT seeks short write pulses and lower barrier stress by separating the read and write paths, making it a focus of last-level-cache research. However, the third terminal and extra line consume area, and deterministic field-free switching, large-array yield, and process integration must also be established. Low-energy or high-cycle-count cell demonstrations satisfy only part of that validation.

#### Erase Semantics: Direct Magnetic Overwrite, No Separate ERS

MRAM overwrites existing data by changing magnetic state, without a Flash-style erase-before-program step. Clearing to all zeros or ones is a series of target-state writes; the P/AP-to-data mapping is product-specific.

P ⇄ AP

The free layer is already in the opposite magnetic state.

Reverse the line current or apply another qualified write sequence, as required by the device design.

The free layer returns to its previous magnetic state, and the MTJ resistance changes accordingly.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [EMG-SOT23: imec Extremely Scaled SOT-MRAM Device Demonstration](https://www.imec-int.com/en/press/imecs-extremely-scaled-sot-mram-devices-show-record-low-switching-energy-and-virtually)
- [EMG-SOT24: imec: Functional SOT-MRAM Arrays and Cache Research](https://www.imec-int.com/en/articles/bringing-sot-mram-technology-closer-last-level-cache-memory-specifications)
- [EMG-P-SOT: Spin Memory Scalable SOT Device Process Patent](https://patents.google.com/patent/US10930843B2/en)
- [EMG-TSMC-SOT: TSMC 2025 Annual Report: Type-C SOT-MRAM Research](https://investor.tsmc.com/static/annualReports/2025/english/pdf/2025_tsmc_ar_e_ch5.pdf)

Maturity: Research Demonstration. imec demonstrated extremely scaled devices and functional arrays in 2023–2024. TSMC's 2025 annual report also records field-free Type-C SOT-MRAM presented at IEDM 2025. These are concrete device and array research results, but they are insufficient to label a last-level cache as being in volume production.

Existing STT-MRAM volume production and automotive qualifications cannot be transferred to SOT. Failure to identify a commercial product in this review is not a claim that none exists anywhere in the industry.

### Storage and Structure

SOT-MRAM also retains data in the magnetization direction of an MTJ free layer and senses it through magnetoresistance. Its distinguishing feature is that write angular momentum is generated primarily by a spin-orbit material beside or beneath the free layer and injected into it, rather than by sending the main write current through the tunnel barrier. The stored physical quantity is therefore similar to STT, while the write structure and array cost differ.

A typical three-terminal cell places a heavy-metal or other efficient SOT line next to the MTJ free layer. Lateral current flows through the line; vertical read current flows through the MTJ. Writing and reading require their own terminals and selection paths. Field-free switching may also require structural asymmetry, an internal magnetic field, or material engineering. The simplest schematic is not a complete production-ready stack.

### Operation

#### Write: Generate Spin Torque with Lateral Current

Before: The MTJ free layer is in a stable magnetic state.

Stimulus: Send a write pulse through the SOT line and provide the symmetry-breaking conditions required by the design.

After: Spin torque switches the free layer to the target magnetic state.

A perpendicularly magnetized system generally needs an additional structure or mechanism to select the final direction reliably. A schematic must not assume that one ideal line alone provides deterministic writing with zero external magnetic field.

#### Reverse Overwrite: No Separate Physical Erase

Before: The free layer is already in the opposite magnetic state.

Stimulus: Reverse the line current or apply another qualified write sequence, as required by the device design.

After: The free layer returns to its previous magnetic state, and the MTJ resistance changes accordingly.

This is direct rewriting, with no inherent block-erase requirement. The relationship between current polarity and magnetic state depends on the SOT material, stack orientation, and field-free switching method.

#### Read: Sense Through the Independent MTJ Branch

Before: The MTJ magnetic state retains the data; the SOT write line does not need continuous current.

Stimulus: Select the vertical read branch and sense MTJ resistance at low bias.

After: Retrieve the data while preserving the original magnetic state under normal conditions.

Separate paths can reduce the barrier stress from the main write current, but reading must still satisfy disturbance, leakage, resistance-distribution, and reference-circuit requirements.

### Selection and Variability

Selection must manage both the lateral SOT line and the vertical MTJ read branch, using different transistor and shared-line arrangements as appropriate. Sharing can reduce area but introduces current through unselected devices, line-resistance effects, and current-distribution concerns. Density assessment must show all terminals, access transistors, and lines rather than comparing only MTJ diameters.

Differences in SOT conversion efficiency, line thickness, magnetic-layer dimensions, interface roughness, and field-free switching structures change the required current and the probability of the final magnetic state. Array validation must examine worst-case tails, thermal conditions, and mutual disturbance rather than only representative devices. Using stochastic switching for probabilistic computing requires retention specifications and statistical validation to be redefined.

### Advantages and Tradeoffs

- The main write current bypasses the tunnel barrier, helping reduce barrier write stress.
- Read and write paths can be optimized separately, providing research opportunities for short pulses and high-cycle-count operation.
- MTJ magnetoresistive sensing remains applicable, preserving some existing magnetic-memory sensing design experience.
- The third terminal, write line, and selection circuits add area and may offset the benefit of cell scaling.
- Deterministic switching without an external magnetic field is not inherent to every SOT stack.
- Write-current density, heat, line resistance, and process damage may dominate macro performance.

### Four Layers of Limits

- Device: Spin-torque efficiency, magnetic stability, and deterministic switching must be achieved together. A material that lowers switching current may introduce high line resistance. Device pulse energy must include actual resistance and switching success probability.
- Array: Three terminals and separate paths add selection-area cost, while shared lines introduce mutual disturbance and current shunting. Large arrays require validation of writability, sensing margin, and error-rate tails at every location.
- Process: Alignment, etching, sidewall cleaning, and interface quality of the SOT line and MTJ affect both torque and read quality. Integration with advanced logic and subsequent thermal processing can also damage materials, requiring validation of the complete process flow.
- System: Last-level-cache requirements include capacity, standby leakage, worst-case write latency, and bandwidth, as well as ECC and coherence costs. Cell-level fJ energy and high cycle counts do not directly establish the energy per access or lifetime of a complete cache.

### Fit and Misuse

Suitable for high-speed memory research combining frequent updates, short latency, and power-off retention, particularly where more complex selection and material integration are acceptable. Research programs should develop device, functional-array, and macro models together so that the benefits of separate read and write paths can be verified in effective density and system energy.

A SOT research record alone does not establish production readiness for near-term products needing standard off-the-shelf chips, complete automotive qualification data, or a process replacement without integration risk. If area is tightly constrained or external magnetic fields and complex write assists are unacceptable, first verify the specific field-free approach and its array-selection cost.

### Patent Study

- [US10930843B2](https://patents.google.com/patent/US10930843B2/en): Arrange SOT devices, interconnects, and sensing in a scalable array while controlling the integration and area cost of a three-terminal structure. Use differently oriented lines and SOT-device formation steps to arrange write excitation and read connections in a manufacturing method suitable for arrays. Claim Reading: Claim 1 emphasizes the relationship between lines in two directions and device formation. Use the process order in Figure 7 to distinguish required structural limitations from optional embodiments in the specification. Limitations: This patent does not define the general principle of all SOT devices or establish volume production at a specific foundry. Area claims in the specification are not measured density; patent-family and legal-status comparisons are incomplete.

### Check Your Understanding

Why can a SOT macro still be larger than an STT macro even when the main write current is moved out of the MTJ?

SOT typically needs a third terminal, a SOT line, and additional selection paths. Shrinking the MTJ does not mean the entire bit and its peripheral circuits shrink together. Effective macro density must be calculated.

### Sources

- [EMG-SOT23: imec Extremely Scaled SOT-MRAM Device Demonstration](https://www.imec-int.com/en/press/imecs-extremely-scaled-sot-mram-devices-show-record-low-switching-energy-and-virtually)
- [EMG-SOT24: imec: Functional SOT-MRAM Arrays and Cache Research](https://www.imec-int.com/en/articles/bringing-sot-mram-technology-closer-last-level-cache-memory-specifications)
- [EMG-P-SOT: Spin Memory Scalable SOT Device Process Patent](https://patents.google.com/patent/US10930843B2/en)
- [EMG-TSMC-SOT: TSMC 2025 Annual Report: Type-C SOT-MRAM Research](https://investor.tsmc.com/static/annualReports/2025/english/pdf/2025_tsmc_ar_e_ch5.pdf)

## VCM ReRAM: Oxygen Redistribution and Conductive Paths

VCM operation centers on controlling reversible local changes without driving the oxide into permanent breakdown. SET commonly lowers resistance, while RESET raises it. Some stacks require initial current-limited forming to activate a conductive path. Rebuilding the path may differ slightly on each cycle, making the relationship among forming, write verification, cycling distributions, and retention more important than one attractive typical I–V curve.

#### Erase Semantics: RESET Followed by Another SET

RESET is the reverse data-state update from low to high resistance; a later SET restores low resistance. This is reversible resistance switching rather than Flash-style block erase. The circuit defines logical zero/one encoding.

SET → RESET → SET

The device is in a readable low-resistance state.

Apply a reverse-polarity or different-amplitude pulse as specified by the design to promote local oxidation of the path or redistribution of defects.

A gap appears in the conductive path or the barrier increases, raising resistance.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [EMG-VCM08: Resistive Switching Mechanisms in Metal/Oxide/Metal Devices](https://www.nature.com/articles/nnano.2008.160)
- [EMG-P-VCM: HP: Multilayer Oxide Switching Patent US8331131B2](https://patents.google.com/patent/US8331131B2/en)
- [EMG-DBH: Weebit/DB HiTek Technology Qualification and Product Adoption](https://www.weebit-nano.com/news/press-releases/weebit-nano-signs-largest-customer-to-date-technology-qualified-at-db-hitek/)
- [EMG-S130: Weebit SkyWater S130 Reliability Validation](https://www.weebit-nano.com/wp-content/uploads/2025/11/251124.-2025-Annual-General-Meeting-%E2%80%93-Chair-Address-and-CEO-Presentation.pdf)

Maturity: Qualification Completed. Weebit/DB HiTek 130nm BCD RRAM has public evidence of completed technology qualification, and SkyWater S130 has a named 1T1R reliability test vehicle. These support the maturity of resistive-memory integration; a product name alone cannot reveal its complete VCM material cross section.

The oxide VCM description here is a source-supported teaching model. It does not assign the same oxygen-vacancy stack to all commercial RRAM, including TSMC products. Technology qualification also does not establish volume shipments of customer products.

### Storage and Structure

VCM stores data in the ionic distribution, local redox state, or interfacial barrier of an oxide, producing distinguishable resistance states. A typical filament model explains conduction and rupture through redistribution of oxygen ions/oxygen vacancies, but not every device has a single clearly defined filament. Materials, electrodes, and measurement evidence determine the mechanism; a hysteretic I–V curve alone is insufficient to identify VCM.

The teaching cross section uses a metal/oxide/metal stack, optionally including an oxygen reservoir, barrier, or interface-control layer. A 1T1R cell uses a transistor for both selection and current compliance; a 1S1R cell uses a nonlinear selector to suppress unselected paths in a crosspoint array. The conductive path occupies a very small region, but the periphery still requires pulse drivers, forming control, sensing references, and verification circuits. Two-terminal device area alone cannot estimate macro cost.

### Operation

#### SET: Establish a Lower-Resistance State

Before: The device is in a high-resistance state; controlled forming has been completed first if required.

Stimulus: Apply a SET pulse with the polarity specified for the stack, limiting current through the access transistor or driver.

After: Local ions and defects rearrange, creating a more conductive path or interface and lowering resistance.

Current compliance controls path growth. Excessive SET can make RESET difficult or even cause hard breakdown. Forming is not required for every write, and not every process requires it.

#### RESET: Restore a Higher-Resistance State

Before: The device is in a readable low-resistance state.

Stimulus: Apply a reverse-polarity or different-amplitude pulse as specified by the design to promote local oxidation of the path or redistribution of defects.

After: A gap appears in the conductive path or the barrier increases, raising resistance.

RESET is a local resistance-state transition, not a Flash-like block erase. Polarity, thermal effects, and path morphology depend on the material. One bipolar operating mode cannot define the entire family.

#### Read: Distinguish Resistance States at Low Bias

Before: The device retains a state within either the high- or low-resistance distribution.

Stimulus: Apply a low read bias sufficient for sensing but intended to avoid ionic rearrangement.

After: Compare the sensed current with a reference, ideally preserving the original resistance state.

Read bias and accumulated read count may cause disturbance. Check worst-case overlap of high- and low-resistance distributions, temperature variation, line resistance, and sensing noise.

### Selection and Variability

In 1T1R, the word line controls the access transistor, while bit and source lines apply pulses; the transistor also limits current. In 1S1R, strong selector nonlinearity distinguishes fully selected from half-selected biases. The approaches differ in area, forming capability, and sneak paths. A device that switches under a probe does not necessarily have a usable array-selection window.

Device-to-device variation must be distinguished from cycle-to-cycle variation within the same device. Path location, width, and defect distribution cause SET/RESET voltages and resistance values to vary. Multipulse verification, differential encoding, ECC, and calibration can reduce the impact. Analog weights additionally require validation of update linearity, symmetry, effective state count, and read noise; demonstrating several resistance values is insufficient.

### Advantages and Tradeoffs

- The compact two-terminal structure provides design options for interconnect-layer integration and different selection architectures.
- Resistance states can be rewritten directly, supporting research and product adoption for embedded code and configuration storage.
- Tunable conductance creates opportunities for analog computing and multilevel-state research, with precision and reliability requiring separate evidence.
- Forming and path growth are stochastic, so the verification algorithm may dominate write latency.
- Lower current can reduce energy but may narrow the read margin or weaken path retention.
- Crosspoint arrays must address sneak paths, line resistance, half-select disturbance, and selector integration.

### Four Layers of Limits

- Device: The conductive path must switch with bounded pulses while remaining stable at high temperature and low read bias over time. An overly thick path is difficult to reset; an overly thin path may relax. Defect generation can also accumulate into permanent breakdown.
- Array: Sneak current and line resistance alter the bias actually reaching the target device, and forming may exceed the selector operating window. Large arrays require read/write reliability validation across position, half-select count, and the tails of resistance-state distributions.
- Process: Oxygen content, electrode oxygen affinity, interfacial layers, and deposition uniformity govern reversible switching. Interconnect thermal budgets and contamination requirements must both be met. Low-temperature material deposition does not establish reliability qualification of the complete process.
- System: Write verification, ECC, redundancy, and wear management add time and energy. In-memory computing may be dominated by ADCs, DACs, line-resistance compensation, and model-level error tolerance; device conductance alone does not establish system cost.

### Fit and Misuse

Suitable for embedded NVM when a concrete process provides design and qualification support and macro specifications cover the required capacity and endurance. Research applications include analog weights and small crosspoint computing arrays that can tolerate calibration and error compensation, provided array and peripheral costs are counted alongside device energy.

VCM variation and selection requirements may be unsuitable when every write must reach exactly the same analog resistance, when a fixed short write time is required without verification, or when two-terminal devices are assumed to scale directly into an arbitrarily large array. A best-case pulse from one device or an image showing successful forming cannot replace high-capacity yield and post-cycling retention data.

### Patent Study

- [US8331131B2](https://patents.google.com/patent/US8331131B2/en): Control state transitions and intermediate states in multilayer resistive-switching devices, improving on the limited precision of simple two-state pulses. Use a multilayer structure and specific segmented pulses to alter ionic or defect distributions and barriers, moving the device between target resistance states. Claim Reading: First identify the layer structure and operating relationships required by the independent claims, then connect pulses and physical states using Figures 3 and 5. Do not treat the specification's particular two-stage pulse as mandatory for all VCM. Limitations: A specific oxide-switching design, not substitute evidence for a known commercial RRAM cross section. Patent-family and subsequent granted-scope comparisons are incomplete.

### Check Your Understanding

Why does a hysteretic current–voltage curve alone not establish that a device uses oxygen-vacancy VCM?

Several ionic, interfacial, thermal, or electronic mechanisms can produce resistance hysteresis. Materials and electrodes, polarity, time and temperature response, and structural evidence must be considered together to identify the dominant switching mechanism reasonably.

### Sources

- [EMG-VCM08: Resistive Switching Mechanisms in Metal/Oxide/Metal Devices](https://www.nature.com/articles/nnano.2008.160)
- [EMG-P-VCM: HP: Multilayer Oxide Switching Patent US8331131B2](https://patents.google.com/patent/US8331131B2/en)
- [EMG-DBH: Weebit/DB HiTek Technology Qualification and Product Adoption](https://www.weebit-nano.com/news/press-releases/weebit-nano-signs-largest-customer-to-date-technology-qualified-at-db-hitek/)
- [EMG-S130: Weebit SkyWater S130 Reliability Validation](https://www.weebit-nano.com/wp-content/uploads/2025/11/251124.-2025-Annual-General-Meeting-%E2%80%93-Chair-Address-and-CEO-Presentation.pdf)

## ECM/CBRAM: Growing and Dissolving a Metal Bridge

During SET, the active metal oxidizes into ions, moves through the medium under an electric field, and is reduced to progressively establish a metal bridge. RESET dissolves part of that bridge. A thin bridge can reduce switching energy but may be destabilized by heat and surface energy. Fast formation and long-term retention must be checked under the same conditions rather than taken from separate best-case experiments.

#### Erase Semantics: RESET Followed by Another SET

RESET is the reverse data-state update from low to high resistance; a later SET restores low resistance. This is reversible resistance switching rather than Flash-style block erase. The circuit defines logical zero/one encoding.

SET → RESET → SET

A metal bridge creates a low-resistance state between the electrodes.

In this bipolar teaching example, apply a suitable reverse bias to oxidize and ionize metal locally.

A narrow part of the bridge opens, breaking the continuous path and returning the device to a high-resistance state.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [EMG-ADESTO: Adesto 2019 CBRAM Commercial Shipment Filing](https://www.sec.gov/Archives/edgar/data/1395848/000155837020002795/iots-20191231x10k.htm)
- [EMG-P-ECM: Axon: Programmable Metallization Cell Patent US5761115A](https://patents.google.com/patent/US5761115A/en)

Maturity: Historical Commercial Shipments. The CBRAM section of Adesto's 2019 annual filing explicitly records commercial product shipments. ECM/CBRAM therefore cannot uniformly be labeled as never commercialized. This evidence supports historical product maturity, but does not establish every subsequent node or availability of the original part numbers in 2026.

Licensing, technology transfer, and new foundry-development programs cannot be elevated to volume-production status on the strength of historical shipments.

### Storage and Structure

ECM changes a conductive path through the motion and redox reactions of active-metal ions. An existing conductive bridge commonly produces a low-resistance state; dissolving a critical part of the bridge produces a high-resistance state. Both ECM and oxygen-vacancy VCM exhibit resistive switching, but their ion sources and path materials differ. CBRAM is a common commercial name for this conductive-bridge memory. Sharing the ReRAM label does not justify combining their physical models.

A representative cross section contains an active electrode that supplies a metal such as Ag or Cu, a solid medium that permits ion migration, and a comparatively inert counter electrode. An access transistor or selector is connected in series and limits current during bridge formation. Practical stacks may also require diffusion barriers and interface control to prevent metal migration into CMOS or interconnect regions where contamination is unacceptable.

### Operation

#### SET: Form a Conductive Bridge with Metal Ions

Before: The medium has no stable conductive bridge connecting the two electrodes, and the device is in a high-resistance state.

Stimulus: Oxidize the active electrode, apply an electric field to drive metal-ion migration, and limit forming current.

After: Metal is reduced and grows at nucleation sites, establishing a lower-resistance conductive path.

Growth direction and nucleation location depend on the material and kinetics. A single path in a schematic is not the morphology of every real device. Current compliance prevents an excessively thick bridge that would be difficult to RESET.

#### RESET: Dissolve a Critical Part of the Bridge

Before: A metal bridge creates a low-resistance state between the electrodes.

Stimulus: In this bipolar teaching example, apply a suitable reverse bias to oxidize and ionize metal locally.

After: A narrow part of the bridge opens, breaking the continuous path and returning the device to a high-resistance state.

RESET does not remove all the metal. Residual metal or nucleation sites affect the next SET, creating cycle-history effects and variation that are important in reliability analysis.

#### Read: Sense at Low Bias Without Reshaping the Bridge

Before: The device has a distinguishable resistance state corresponding to an intact or interrupted bridge.

Stimulus: Apply a lower read bias and sense current under conditions that limit disturbance.

After: Determine the resistance state while normally preserving the metal-bridge morphology.

Accumulated bias and temperature can still drive metal ions. Validate whether prolonged reading and half-select operations gradually change the bridge, rather than checking only a single low-voltage read.

### Selection and Variability

1T1R can limit SET current while selecting the cell. Crosspoint implementations require a sufficiently nonlinear selector or an appropriate array-bias scheme. Selector tolerance for forming and RESET pulses, half-select leakage, and reverse current must be matched to the memory device. An active-metal bridge can have very low resistance; without current-limited driving, local overcurrent can easily destroy reversibility.

Metal-ion nucleation sites, bridge width, and residual metal distributions create both cycle-to-cycle and device-to-device variation. Short pulses, current compliance, and write verification can narrow the resistance window but increase operation count and energy. When using these differences for PUFs or stochastic computing, distinguish reproducible fixed features from path noise that changes each time the bridge is rebuilt.

### Advantages and Tradeoffs

- The two-terminal structure and localized metallization provide opportunities for low-energy switching.
- Resistance states can be rewritten directly without Flash-like block erase.
- CBRAM has a history of commercial shipments, allowing practical tradeoffs to be studied through named products and datasheets.
- Rapid formation and long-term stability of thin metal bridges constrain each other.
- Metal diffusion, electrode depletion, and contamination control complicate process integration.
- Bridge morphology changes with cycling history, so average SET voltage does not represent tail reliability.

### Four Layers of Limits

- Device: Lower forming energy often implies a thinner bridge, which may break through thermal or surface-energy effects. An overly thick bridge increases RESET energy. Metal depletion, agglomeration, and residue progressively change the reversible switching window.
- Array: Low-resistance bridges, sneak paths, and half-select bias can expose non-target devices to additional current. Bidirectional selector operation, current compliance, and line resistance must be matched, and resistance-distribution tails must be tested after extensive cycling.
- Process: Active-metal diffusion barriers, medium uniformity, and interfacial nucleation control determine yield. CMOS contamination rules and subsequent thermal processing may impose stricter limits than the device-formation temperature. The full interconnect integration flow requires validation.
- System: Write verification, error correction, and data-update strategy determine achievable lifetime. If supply-chain evidence covers only historical products, current part numbers, temperature conditions, and long-term supply must be checked again. Material potential does not establish system availability.

### Fit and Misuse

Suitable for embedded applications requiring low-energy updates of small data records when a specific product or process provides support, and for research into stochastic and analog functions of metal-ion paths. Practical selection must jointly consider post-cycling retention, read disturbance, temperature, and supply, rather than only one SET energy value or the initial resistance ratio.

A conceptual ECM design should not be adopted directly for long-term retention at very high temperature without post-cycling retention data, or where active-metal process-contamination constraints are unacceptable. Maturity and algorithms from oxide VCM also cannot simply be transferred to a metal bridge, because the ion sources and failure paths differ.

### Patent Study

- [US5761115A](https://patents.google.com/patent/US5761115A/en): Establish a nonvolatile conductive path that can be formed and restored electrically, rather than treating a one-time metal short as rewritable memory. Control metal-dendrite growth in a solid medium and reverse the resulting conductive state with opposite polarity. Claim Reading: Read claims 1–2 against the metal source, growth path, and reverse-restoration conditions. The lateral and vertical arrangements in the figures are different embodiments; do not combine them into a cell that the patent does not disclose. Limitations: An early metallization-cell patent that provides an entry point to ECM principles. It does not establish that every CBRAM product uses its specific structure, and current legal status is not addressed.

### Check Your Understanding

Why can an ECM metal bridge still influence the next write after RESET?

RESET often dissolves only part of the bridge, leaving metal and nucleation sites in the medium. These remnants alter the path and threshold of subsequent metal growth, producing cycle-history effects and variation.

### Sources

- [EMG-ADESTO: Adesto 2019 CBRAM Commercial Shipment Filing](https://www.sec.gov/Archives/edgar/data/1395848/000155837020002795/iots-20191231x10k.htm)
- [EMG-P-ECM: Axon: Programmable Metallization Cell Patent US5761115A](https://patents.google.com/patent/US5761115A/en)

## PCM: Controlling Phase with Thermal History

RESET locally melts material with a short, high-peak pulse and rapidly cools it into an amorphous state. SET uses an appropriate thermal history to crystallize the material. Reducing phase-change volume can lower energy, but retention, cycling failure, and thermal crosstalk must still be considered. PCM appears in production MCUs and is also researched for storage-class memory and analog weights. Different uses do not change its phase-based storage mechanism.

#### Erase Semantics: RESET Quenching and SET Crystallization

PCM RESET creates a high-resistance amorphous region through local melting and rapid quenching; SET promotes crystallization with a suitable thermal profile. Data is rewritten through pulse-induced thermal histories, not merely voltage reversal or mandatory Flash-style block erase.

SET → RESET → SET

The device has a lower-resistance crystalline conductive path.

Locally melt the material with a short, high-peak pulse, then rapidly reduce current to quench it.

An amorphous region forms across the main path, increasing resistance.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [EMG-STPCM: ST Stellar SR6P6C8 MCU with Phase-Change Memory](https://www.st.com/en/automotive-microcontrollers/sr6p6c8.html)
- [EMG-P-PCM: Multilevel Phase-Change Memory Programming Patent](https://patents.google.com/patent/US5912839A/en)
- [EMG-PCMDRIFT: IBM: Temporal Resistance Evolution in Projected PCM](https://research.ibm.com/publications/state-dependence-and-temporal-evolution-of-resistance-in-projected-phase-change-memory)
- [EMG-PCMEND: IBM Research on PCM Cycling Endurance and Atomic Migration](https://research.ibm.com/publications/phase-change-memory-cycling-endurance)
- [EMG-PCMPROJ: IBM Low-Drift Projected PCM Devices](https://research.ibm.com/publications/design-of-projected-phase-change-memory-mushroom-cells-for-low-resistance-drift)

Maturity: In Volume Production. On 2026-09-10, ST's SR6P6C8 product page explicitly lists production status, includes PCM in the product description, and provides specific ordering codes. This is a concrete commercial example of embedded PCM, avoiding judgments about the entire technology family based only on one discontinued storage-class product.

Other devices in the same family may still be in design or engineering-sample stages. The role of ePCM in an MCU does not establish a storage-class-memory interface or capacity.

### Storage and Structure

PCM stores data in the fraction and geometry of crystalline and amorphous phase-change material. In a typical electronic device, the crystalline state has lower resistance and the amorphous state higher resistance; material kinetics retain the state after power removal. The actual state is more than an abstract resistance value. It includes the location and size of the phase-change region, degree of crystallization, and evolution over time, which jointly determine reading and lifetime.

Common cross sections use a small bottom heater contact, phase-change material, and a top electrode, or a confined geometry that reduces the heated volume. Access may use a transistor or a selector in a crosspoint array. Thermal isolation, current concentration, and heat removal through interconnects jointly determine pulse efficiency. Projected-PCM research adds a conductive branch; this is not a standard structure shared by all PCM.

### Operation

#### SET: Recrystallize the Amorphous Region

Before: The phase-change region contains more amorphous material and has higher resistance.

Stimulus: Apply a pulse that maintains the crystallization-temperature range long enough for crystal nuclei to grow.

After: The crystalline fraction in the conductive path increases, lowering resistance.

SET is controlled jointly by time and temperature. A stronger pulse is not necessarily better: remelting followed by rapid cooling may return the material to an amorphous state.

#### RESET: Melt and Rapidly Quench

Before: The device has a lower-resistance crystalline conductive path.

Stimulus: Locally melt the material with a short, high-peak pulse, then rapidly reduce current to quench it.

After: An amorphous region forms across the main path, increasing resistance.

RESET requires control of peak amplitude, duration, and cooling rate. It rewrites the phase-change device state; it does not imply that a whole region must first be erased before writing.

#### Read: Sense Resistance Without Thermal Switching

Before: The proportions and shapes of the crystalline and amorphous regions retain the data.

Stimulus: Read current at a low-disturbance bias, using state-dependent references when needed.

After: Retrieve the data without changing the phase state under normal operation.

Amorphous resistance drifts with time and temperature, and multilevel reading requires greater precision than binary reading. A cumulative read method in a specific patent may be destructive; ordinary PCM reads are not therefore all destructive.

### Selection and Variability

In a transistor-based cell, the word line selects the heater paths that can conduct, and the access device must supply RESET current under worst-case conditions. A crosspoint version additionally requires a selector whose nonlinearity isolates half-selected cells. Selector turn-on, line resistance, and thermal crosstalk can all alter the actual thermal history of the phase-change region. An ideal current waveform cannot simply be assumed at every array location.

Material composition, heater-contact dimensions, amorphous-region shape, and local thermal resistance create write distributions. Structural relaxation also causes resistance to drift with time. Write verification, differential storage, drift compensation, and ECC can reduce errors. Projected PCM uses an additional branch to reduce the dependence of reading on the drifting material, but introduces new tradeoffs in current shunting and interface design.

### Advantages and Tradeoffs

- Direct rewriting and power-off retention are possible, with material and geometry choices offering different speed and energy options.
- Controlled partial crystallization can create multilevel or cumulative states for analog-weight and in-memory-computing research.
- Named embedded products already exist, connecting device thermal physics to real MCU operating conditions.
- Peak RESET current may require a larger access transistor.
- Material kinetics create a tradeoff between fast crystallization and long-term high-temperature retention.
- Resistance drift, thermal crosstalk, and material migration after cycling limit multilevel precision and lifetime.

### Four Layers of Limits

- Device: The material must crystallize readily for fast SET while keeping the amorphous state stable over time. Repeated melting and crystallization can cause segregation, atomic migration, and voids, progressively changing resistance and the energy required for switching.
- Array: RESET current, line resistance, and heat removal create position-dependent thermal histories, and neighboring devices can be heated. Selectors and access transistors must match the pulses while preserving half-selected data and the read-resistance window.
- Process: Heater-contact dimensions, phase-change composition, interfaces, and package thermal history affect the switched volume. Confined and projected structures have different deposition, etching, and material-compatibility costs. Ideal thermal simulations alone are insufficient.
- System: Write verification, drift tracking, ECC, and update strategies increase control overhead. Storage-class-memory use requires persistence and power-failure consistency; analog-weight use must include data-conversion and calibration energy.

### Fit and Misuse

Suitable for code and data storage on an available ePCM platform and for multilevel, cumulative, or analog-computing research that can accommodate verification and calibration. Selection requires post-cycling retention and read conditions for the specific product or stack at its operating temperature, with thermal management and access current included in the system assessment.

PCM nonvolatility alone does not establish suitability for drift-free long-term precision analog weights, extremely low peak current, or unconditional long-term retention at high temperature. Production status of one ePCM MCU also cannot be converted into proof of volume production for arbitrary high-capacity SCM or crosspoint arrays.

### Patent Study

- [US5912839A](https://patents.google.com/patent/US5912839A/en): Establish multilevel programming and controllable cumulative states in phase-change material rather than using only two resistance extremes. Apply subthreshold or specific cumulative pulses to change the material state progressively, using corresponding sensing methods to distinguish multilevel data. Claim Reading: Read the claims for multilevel writing separately from those for the specific cumulative read method. The latter may change the state; it does not establish that ordinary low-bias resistance sensing is always destructive. Limitations: This patent is not evidence of the internal thermal structure of an ST product, nor does it guarantee identical multilevel precision, retention, or endurance for every PCM implementation.

### Check Your Understanding

Why might simply increasing the peak amplitude of a SET pulse fail to produce lower resistance?

A higher peak may melt the material. Rapid cooling afterward can then form an amorphous high-resistance region. The outcome depends on the complete time–temperature history, not current amplitude alone.

### Sources

- [EMG-STPCM: ST Stellar SR6P6C8 MCU with Phase-Change Memory](https://www.st.com/en/automotive-microcontrollers/sr6p6c8.html)
- [EMG-P-PCM: Multilevel Phase-Change Memory Programming Patent](https://patents.google.com/patent/US5912839A/en)
- [EMG-PCMDRIFT: IBM: Temporal Resistance Evolution in Projected PCM](https://research.ibm.com/publications/state-dependence-and-temporal-evolution-of-resistance-in-projected-phase-change-memory)
- [EMG-PCMEND: IBM Research on PCM Cycling Endurance and Atomic Migration](https://research.ibm.com/publications/phase-change-memory-cycling-endurance)
- [EMG-PCMPROJ: IBM Low-Drift Projected PCM Devices](https://research.ibm.com/publications/design-of-projected-phase-change-memory-mushroom-cells-for-low-resistance-drift)

## Capacitor FeRAM: Sensing Polarization-Switching Charge

Writing sets polarization through the electric-field direction. Reading applies an excitation and identifies the original value from the charge difference between switching and non-switching responses. If reading changes polarization, the circuit must restore the original data. Commercial FeRAM can conceal this sequence behind its interface so that the user sees an ordinary read command, but internal restoration, power-failure conditions, and timing remain part of reliability.

#### Erase Semantics: Polarization Reversal and Subsequent Write

An opposite write stimulus changes ferroelectric polarization to another readable state, which can be rewritten again. Research labels such as ERS or RESET refer to that polarization mechanism, not necessarily floating-gate charge removal or block erase.

A → B → A

The capacitor retains the previously written polarization direction.

Apply a reverse write field across the same capacitor.

Polarization reverses into the other retained state.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [EMG-FRAM: Infineon 16Mb EXCELON F-RAM Datasheet](https://www.infineon.com/assets/row/public/documents/10/49/infineon-cy15b116qi-cy15v116qi-16mb-excelon-tm-lp-ferroelectric-ram-f-ram-datasheet-en.pdf)
- [EMG-P-FERAM: Ramtron: Self-Restoring Ferroelectric Memory Patent US4873664A](https://patents.google.com/patent/US4873664A/en)

Maturity: In Volume Production. Infineon EXCELON F-RAM is a named commercial family with a datasheet for the 16Mb CY15B116QI/CY15V116QI. The document specifies the interface, operating temperature, and retention conditions at different temperatures. It supports discussion of conditional product performance without extrapolating from a single material paper.

This is commercial capacitor-based F-RAM. Its endurance and retention years must not be transferred to HfO₂ FeFET or FTJ.

### Storage and Structure

The bit is represented by the polarization direction retained in a ferroelectric material after the external electric field is removed. Unlike DRAM, which relies on temporarily stored free charge, FeRAM is based on switchable remanent polarization. Reading uses the different charge responses when polarization switches and when it does not. Distinguishing the material's retention mechanism from the circuit's sensing method explains why nonvolatile memory may still require restoration after a read.

Common cells use one access transistor and one ferroelectric capacitor in 1T1C, or two transistors and two capacitors for differential 2T2C sensing. The word line controls the transistor, the bit line connects to the sense amplifier, and the plate line excites the ferroelectric capacitor. Capacitor material, area, and reference design determine the available sensing charge. Traditional commercial materials and HfO₂-based ferroelectric capacitors cannot be treated as the same process.

### Operation

#### Write: Set Remanent Polarization with an Electric Field

Before: The ferroelectric capacitor has one polarization direction, and the target is the other logic state.

Stimulus: Select the cell and apply an electric field across the capacitor that exceeds the required switching condition.

After: Polarization aligns in the target direction; remanent polarization remains after voltage removal.

Positive and negative polarization can be assigned to logic 0/1 by the design. Validation must establish voltage distribution, switching charge, and write success probability at the worst-case temperature.

#### Polarization Overwrite: No Separate Block Erase

Before: The capacitor retains the previously written polarization direction.

Stimulus: Apply a reverse write field across the same capacitor.

After: Polarization reverses into the other retained state.

This is direct rewriting and usually does not require a prior block erase. If a product offers a chip-clear command, its controller behavior must be distinguished from the cell's polarization physics.

#### Read: Compare Switching Charge and Restore Data

Before: One of the two polarization directions represents the original data.

Stimulus: Apply a read excitation through the plate line and sense the bit-line charge difference between switching and non-switching responses.

After: Sense the original value; if reading changed the polarization, write it back afterward to restore it.

Destructive reading means that the sensing operation may change the internal storage state. It does not mean that every external read loses the data. The complete read sequence must include sense latching and restoration timing.

### Selection and Variability

The word line enables the access transistor, connecting the ferroelectric capacitor to the bit line. The plate line supplies excitation, and the sense amplifier compares charge with a reference cell. A 1T1C design depends on reference precision; 2T2C allows differential sensing at greater area cost. The array must also control voltage distribution across unselected capacitors to prevent unnecessary switching or fatigue from shared plate lines.

Capacitor area, grains, ferroelectric-phase fraction, and coercive-field distribution change switching charge. Fatigue reduces switchable polarization, imprint makes switching asymmetric between directions, and reference drift reduces sensing margin. Differential circuits, reference design, and timing control can reduce the impact, but a typical polarization curve cannot replace full-array validation of writing, reading, and restoration.

### Advantages and Tradeoffs

- Polarization switching offers fast, low-energy nonvolatile storage that supports frequent updates.
- Commercial capacitor-based products have explicit datasheets and support practical applications such as industrial logging.
- Direct rewriting without prior whole-block erase simplifies retention of small state records.
- Reading may require restoration, so internal timing and power-failure scenarios must be included in reliability design.
- Smaller capacitors provide less sensing charge, constraining high-density scaling.
- Ferroelectric integration, reference circuits, and plate lines add process and array cost.

### Four Layers of Limits

- Device: Shrinking the capacitor reduces switchable charge. Increasing the field to strengthen the signal may increase fatigue and dielectric stress. Retention, imprint, and polarization back-switching also depend on material, temperature, and cycling history.
- Array: Bit-line parasitic capacitance dilutes the sensing signal. Reference cells and plate-line distributions affect the worst-case read margin. Differential structures improve discrimination at an area cost, and restoration also consumes array timing.
- Process: Ferroelectric-film phase, electrodes, and annealing conditions must be integrated with CMOS. Traditional oxides and HfO₂ systems have different material windows. The ability to deposit a ferroelectric material does not establish array-process maturity.
- System: Read restoration, supply droop, and interface completion conditions determine data consistency. Datasheet cycle counts, retention temperatures, and interface clocks describe different levels and must be matched to the actual update workload and environment.

### Fit and Misuse

Suitable for frequent data logging, metering, industrial control, and equipment-state retention when existing capacities and interfaces meet the requirements. Selection can use commercial datasheet tables for temperature, retention, and cycling, while checking minimum supply voltage, write-completion conditions, and the power-failure sequence to turn nonvolatility into verifiable system reliability.

If the primary goal is extremely high density, the lowest bit cost, or a read operation that never requires internal restoration, FeRAM's high cycle capability should not obscure its structural cost. Specifications of commercial capacitor-based products also cannot guarantee the performance of FeFET or FTJ technologies still under research.

### Patent Study

- [US4873664A](https://patents.google.com/patent/US4873664A/en): Arrange nonvolatile-memory operation that restores the original value when polarization sensing may change the data. Use an access transistor, plate excitation, and sensing/restoration circuits to read polarization charge and write data back when required. Claim Reading: Identify the capacitor, switching device, and three types of control lines in claim 1, then trace capacitor voltage and polarization before and after sensing. The RAM name alone does not make this DRAM-like free-charge storage. Limitations: A historical circuit patent used as a teaching reference. It does not establish that a specific Infineon product uses exactly the same internal circuit. No legal-status or freedom-to-operate judgment has been made.

### Check Your Understanding

If FeRAM retains data after power loss, why might reading still require a writeback?

Nonvolatility comes from remanent polarization, but some sensing sequences deliberately switch polarization to obtain a charge difference. The original direction must be restored after sensing to preserve the data held before the read.

### Sources

- [EMG-FRAM: Infineon 16Mb EXCELON F-RAM Datasheet](https://www.infineon.com/assets/row/public/documents/10/49/infineon-cy15b116qi-cy15v116qi-16mb-excelon-tm-lp-ferroelectric-ram-f-ram-datasheet-en.pdf)
- [EMG-P-FERAM: Ramtron: Self-Restoring Ferroelectric Memory Patent US4873664A](https://patents.google.com/patent/US4873664A/en)

## FeFET: Translating Polarization into Threshold Voltage

FeFET combines ferroelectric retention with transistor current gain, providing research opportunities for nondestructive reading and density scaling. The challenge is that write voltage is divided across both the ferroelectric and interfacial layers, while polarization switching may also generate or fill traps. Polarization stability, memory window, and endurance are not three independently optimizable numbers.

#### Erase Semantics: Polarization Reversal and Subsequent Write

An opposite write stimulus changes ferroelectric polarization to another readable state, which can be rewritten again. Research labels such as ERS or RESET refer to that polarization mechanism, not necessarily floating-gate charge removal or block erase.

A → B → A

The device is in a low-threshold-voltage state and conducts more readily during reading.

Apply an opposite gate pulse to rearrange polarization and the associated interfacial charge.

Threshold voltage rises and current falls at the same read gate voltage.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [EMG-KIOXIA: KIOXIA: FeFET Trapping and Polarization Stability](https://www.kioxia.com/en-jp/rd/technology/topics/topics-67.html)
- [EMG-FEPUF: Original Research on FeFET Cycle Variation and Charge-Domain PUFs](https://www.nature.com/articles/s41467-024-55380-x)
- [EMG-FMC: FMC Industry News and Ferroelectric Memory Classification](https://www.ferroelectric-memory.com/industry-news/)
- [EMG-P-HFO: Layered Doping of HfO₂ Ferroelectric Films Patent](https://patents.google.com/patent/US10153155B2/en)
- [EMG-P-FEFET: FeFET Gate Stack and Device Integration Patent](https://patents.google.com/patent/US11502083B2/en)

Maturity: Research Demonstration. The KIOXIA study associated with IEDM 2023 and reviewed here explicitly demonstrates control of trapped charge and polarization stability through interface engineering. An original FeFET PUF paper provides additional evidence. These support concrete device and circuit research, but are insufficient to identify a commercial production part using this stack.

Some suppliers' ferroelectric-memory production news may refer to capacitor-based structures. Company or material names alone do not establish FeFET volume production. Failure to identify a product in this review does not establish that none exists anywhere in the industry.

### Storage and Structure

FeFET uses ferroelectric polarization in the gate stack to change channel electrostatics, giving the transistor distinguishable high and low threshold voltages. Reading selects a gate bias between those thresholds and senses channel current. Charge trapping and detrapping also affect the actual memory window, so not every threshold-voltage change can be attributed solely to polarization.

A typical cross section includes a control gate, ferroelectric layer, interfacial dielectric, and semiconductor channel, with the source and drain forming the read path. MFIS and MFMIS, which adds a floating metal layer, are different integration approaches. The crystalline phase, grains, and interfacial layer of HfO₂-based ferroelectrics control polarization and voltage division. A single transistor in a schematic does not mean every array can operate without additional selection.

### Operation

#### Write: Set the Low-Threshold-Voltage State

Before: Device polarization and interfacial charge produce a higher threshold voltage.

Stimulus: Apply a gate write pulse in the selected direction to switch ferroelectric polarization.

After: Channel electrostatics change, producing a larger current at the specified read gate voltage.

This schematic uses an n-channel device and one stack orientation. The actual polarity corresponding to high and low threshold voltage must be checked against the structure. The pulse may also change trapped charge, so the two effects must be separated.

#### Erase / Polarization Reversal: Set the High-Threshold State

Before: The device is in a low-threshold-voltage state and conducts more readily during reading.

Stimulus: Apply an opposite gate pulse to rearrange polarization and the associated interfacial charge.

After: Threshold voltage rises and current falls at the same read gate voltage.

Research often calls the two directions program and erase, but the mechanism is polarization rewriting. It differs from Flash erase through charge removal or neutralization; the named stack defines its threshold direction and operating conditions.

#### Read: Sense Between the Two Threshold Voltages

Before: High and low threshold-voltage distributions represent the two data states.

Stimulus: Apply a read gate voltage intended not to switch polarization, together with a small drain bias.

After: Sense channel current, ideally preserving the original polarization.

Read bias must avoid polarization-switching conditions and substantial trap charging or discharging. If the memory window shrinks or distributions overlap, reliable reading can fail even while a typical device still exhibits hysteresis.

### Selection and Variability

The array uses word lines for gate operation and bit/source lines to sense the channel. Practical schemes may add access transistors or special biases to suppress write and read interference in unselected cells. Write voltage divides across the ferroelectric and interfacial layers. The terminal potentials of half-selected cells must be drawn explicitly; being a transistor does not automatically provide complete isolation.

A small device contains only a few ferroelectric grains and may switch in discrete steps. Grain orientation, coercive field, interface thickness, and trap distributions also create device-to-device differences. Analog weights require multilevel windows and update control. PUF research can exploit cycle variation, but reproducibility, bias, environment, and reconfiguration conditions need separate testing. Variation is not itself security.

### Advantages and Tradeoffs

- The transistor channel amplifies electrical differences caused by polarization, offering potential for nondestructive reading.
- Gate integration provides opportunities for single-transistor storage and further scaling.
- Multilevel storage, analog computing, and reconfigurable PUFs can be explored, with each application requiring its own validation metrics.
- Voltage division between the ferroelectric and interfacial layers may require higher write voltage and increase dielectric stress.
- Trapped charge may stabilize polarization but may also narrow or shift the memory window.
- Few-grain switching and device variation make large-array tails and multilevel precision difficult to control.

### Four Layers of Limits

- Device: Polarization back-switching, depolarization fields, trap generation, and oxide lifetime jointly limit retention and endurance. Introducing trapped charge to stabilize polarization may sacrifice the initial window. Readable distributions must be compared after both cycling and retention.
- Array: Write bias may disturb half-selected gates, while threshold-voltage tails and bit-line leakage limit read margin. A small cell does not imply small high-voltage drivers, references, or redundancy overhead. Multilevel data requires particularly fine control.
- Process: Ferroelectric phase, grains, doping, annealing, and interfacial-layer thickness require stable control. The floating metal in MFMIS and the direct interface in MFIS introduce different integration problems. A material patent cannot replace complete process qualification.
- System: Analog computing must compensate for window drift, update asymmetry, and read noise. Digital storage requires ECC and update strategies. PUFs must validate entropy, reliability, and the attack model rather than merely provide an attractive threshold-voltage histogram.

### Fit and Misuse

Suitable for research into dense embedded storage, transistor-based analog weights, and PUFs with explicit environmental validation. For a target process, first establish a coupled model of ferroelectric behavior and trapping, then validate the worst-case window through array operation so that small-device potential translates into usable sensing margin.

FeFET research data is insufficient to promise a mature standard chip in the near term, calibration-free multilevel precision across all temperatures, or direct reuse of the high-cycle specifications of commercial FeRAM. Hysteresis alone does not establish nonvolatility, and short room-temperature retention cannot replace post-cycling lifetime at high temperature.

### Patent Study

- [US10153155B2](https://patents.google.com/patent/US10153155B2/en): Control materials and thermal processing to form HfO₂-based ferroelectric films suitable for electronic devices. Use layered doping and annealing to adjust film structure and obtain the required ferroelectric properties. Claim Reading: Claim 1 focuses on the film-formation method and layer structure. Descriptions of use in capacitors or transistor gates do not mean that the claim covers every FeFET array operation. Limitations: An entry point to material engineering, not a complete implementation or endurance qualification for any commercial FeFET.
- [US11502083B2](https://patents.google.com/patent/US11502083B2/en): Arrange the gate stack and interfaces in a ferroelectric transistor to address polarization control and integration conditions. A structure containing a substrate, isolation, source/drain regions, and a stack of buffer layer, floating electrode, ferroelectric layer, and control gate. Claim Reading: The individual layers of claim 1 cannot be omitted. Compare voltage division in MFMIS and MFIS; effects of a specific structure must not become universal FeFET specifications. Limitations: A published device design does not establish product volume production or complete array qualification. Patent-family and legal-status analysis is incomplete.

### Check Your Understanding

Why cannot all FeFET threshold-voltage drift be treated as weakening polarization?

Traps in the interface and dielectric capture and release charge, also changing threshold voltage and, in turn, polarization stability. Time, bias, and material evidence are needed to separate the two effects.

### Sources

- [EMG-KIOXIA: KIOXIA: FeFET Trapping and Polarization Stability](https://www.kioxia.com/en-jp/rd/technology/topics/topics-67.html)
- [EMG-FEPUF: Original Research on FeFET Cycle Variation and Charge-Domain PUFs](https://www.nature.com/articles/s41467-024-55380-x)
- [EMG-FMC: FMC Industry News and Ferroelectric Memory Classification](https://www.ferroelectric-memory.com/industry-news/)
- [EMG-P-HFO: Layered Doping of HfO₂ Ferroelectric Films Patent](https://patents.google.com/patent/US10153155B2/en)
- [EMG-P-FEFET: FeFET Gate Stack and Device Integration Patent](https://patents.google.com/patent/US11502083B2/en)

## FTJ: Modulating the Tunnel Barrier with Polarization

FTJ reverses polarization with a larger pulse, then senses tunneling current at a smaller bias, pursuing two-terminal nondestructive storage and interconnect-layer integration. The barrier must be thin enough to provide readable current while retaining stable ferroelectricity and suppressing leakage. An attractive resistance ratio does not establish sufficient absolute read current, much less a reliable selection window for a large array.

#### Erase Semantics: Polarization Reversal and Subsequent Write

An opposite write stimulus changes ferroelectric polarization to another readable state, which can be rewritten again. Research labels such as ERS or RESET refer to that polarization mechanism, not necessarily floating-gate charge removal or block erase.

A → B → A

The FTJ carries a higher current at the specified read bias.

Apply a reverse write pulse to reset ferroelectric polarization.

The effective barrier returns to the other profile, reducing tunneling current.

After the prescribed pulse or internal update cycle completes, use the specified read/verify criteria to confirm the target state before accepting new data. Do not invent a universal verification threshold, pulse count or completion time.

Selection and update granularity follow the named array and interface. Cell-level reversibility does not establish byte, word, page or block command granularity.

This sequence explains state reuse, not unlimited endurance. Qualify cycling, retention, disturb and interrupted-update behavior for the target product; do not merge maxima or bias recipes from different implementations.

- [EMG-FTJ24: Original Research: Atomic-Scale BSO Ferroelectric Tunnel Junctions](https://www.nature.com/articles/s41467-024-44927-7)
- [EMG-P-FTJ: TSMC FTJ Structure and Low-Temperature Formation Application](https://patents.google.com/patent/US20240057343A1/en)

Maturity: Research Demonstration. The 2024 original FTJ paper and TSMC FTJ structure patent publication reviewed here support concrete thin-film and reliability research. A datasheet and supply evidence identifying a commercial production part using this structure have not been obtained, so the research-demonstration label is retained.

Production status of other TSMC MRAM/RRAM technologies does not automatically place FTJ in volume production. Patent publication, patent grant, and process-product supply are separate events.

### Storage and Structure

FTJ controls tunneling current through the polarization direction of a thin ferroelectric barrier. The two directions produce different effective barrier profiles and resistance levels, commonly described through tunnel electroresistance, or TER. FTJ and FeFET both use polarization, but FTJ does not rely on threshold-voltage amplification in a semiconductor channel. Read current, barrier thickness, electrode screening, and leakage therefore become central tradeoffs.

A typical cell sandwiches an ultrathin ferroelectric layer between two electrodes; it may also include an interfacial dielectric or asymmetric electrodes. A transistor or selector provides selection, and read current passes directly through the barrier. Electrode material, interfacial screening, ferroelectric thickness, and crystallization jointly determine TER. The cross section must identify which layers provide polarization and which primarily limit current.

### Operation

#### Write: Set a Lower Tunneling Resistance

Before: Ferroelectric polarization makes the effective barrier less favorable for electron tunneling.

Stimulus: Apply a write pulse across the barrier strong enough to reverse polarization.

After: Polarization and interfacial potential change, increasing current at the specified low read voltage.

The polarization direction corresponding to low resistance depends on electrode and interface asymmetry. A teaching diagram must not define a fixed relationship between up/down arrows and high/low resistance for the entire family.

#### RESET / Polarization Reversal: Set the Higher-Resistance State

Before: The FTJ carries a higher current at the specified read bias.

Stimulus: Apply a reverse write pulse to reset ferroelectric polarization.

After: The effective barrier returns to the other profile, reducing tunneling current.

This is polarization rewriting, sometimes called SET/RESET or program/erase. Those labels do not imply Flash-style block erase; the electrode structure defines the relation between polarization and resistance.

#### Read: Compare Tunneling Current at Low Bias

Before: One polarization direction and its corresponding barrier profile retain the data.

Stimulus: Apply a read bias below the normal polarization-switching condition.

After: Sense current and determine the bit, ideally preserving the original polarization.

TER and absolute current must both be observed. A high resistance ratio with extremely small currents may still be limited by sensing noise, leakage, and read time.

### Selection and Variability

A single FTJ has only two terminals and does not inherently provide complete array isolation. A 1T1FTJ implementation uses a transistor for selection and biasing; a crosspoint array needs a selector or sufficiently nonlinear current characteristics. Half-select voltages may cumulatively affect polarization, and read leakage may obscure small tunneling currents. Device TER and array readability therefore require separate validation.

Small film-thickness differences can change tunneling current exponentially. Grains, ferroelectric phase, and interfacial traps also affect polarization switching and the barrier. Multilevel research must distinguish a controllable polarization fraction from random leakage paths. Differential cells, pulse verification, and reference calibration may improve behavior, but their additional area and time must also be quantified.

### Advantages and Tradeoffs

- The two-terminal structure and nondestructive resistance reading offer research potential for compact integration.
- Electrode and interface engineering can tune the barrier, providing design choices different from FeFET.
- Thin-film and multilevel-polarization research can support interconnect-layer storage and analog weights, provided the full operating conditions are validated.
- Tunneling current and polarization retention impose competing requirements on film thickness.
- High TER does not necessarily provide sufficient read current, and leakage may undermine practical sensing.
- Low-temperature crystallization, interface quality, selectors, and large-array yield require complete integration evidence.

### Four Layers of Limits

- Device: A thinner barrier improves read current but may reduce polarization stability or increase leakage. A thicker barrier reduces the available sensing signal. Electrode screening, depolarization fields, and traps jointly affect retention and TER after cycling.
- Array: Small tunneling currents are easily obscured by sneak currents and sensing noise. Half-select pulses may also change polarization cumulatively. The selector turn-on window, line resistance, and cell-current distributions determine the usable array size.
- Process: Ultrathin-layer uniformity, ferroelectric crystallization, and electrode/interface reactions are highly sensitive. Lower annealing temperature can benefit interconnect integration, but phase, polarization, and leakage must all meet requirements; deposition alone is insufficient.
- System: With very small read current, sensing time, amplifiers, and calibration energy may offset device-level write savings. Multilevel weights also require management of drift and update distributions. TER or cell cycle count alone cannot compare complete memories.

### Fit and Misuse

Suitable for research into two-terminal polarization storage, interconnect-layer integration, and analog weights that tolerate calibration, particularly when electrodes, interfaces, and selectors can be designed together. Research targets should jointly specify absolute read current, TER, pulses, area, retention, and post-cycling distributions to assess suitability for larger arrays.

Available research abstracts do not guarantee standard chips deliverable in the near term, calibration-free high-capacity multilevel storage, or extremely low sensing energy without a long integration time. A low-temperature step in a patent also does not establish validation of the complete back-end process and its reliability.

### Patent Study

- [US20240057343A1](https://patents.google.com/patent/US20240057343A1/en): Form a thin ferroelectric structure with the required properties within an integrable thermal budget and connect it to a memory circuit. Bring a catalytic metal into contact with the ferroelectric material and use film and annealing steps to adjust formation conditions. The figures also show an embodiment connected to a transistor. Claim Reading: Claim 1 focuses on the material and its contact with a catalytic metal; claim 17 focuses on the formation method. Distinguish structure, method, and effects described in the specification. Do not read every feature from every figure into every claim as a required limitation. Limitations: The reviewed document is the A1 publication. Family records include US12550335B2, granted on 2026-02-10; discussing the granted scope requires a separate reading of B2. Neither publication nor grant establishes FTJ volume production.

### Check Your Understanding

Why can an FTJ still read slowly despite a large high-to-low resistance ratio?

A large ratio does not mean a large absolute current. If both state currents are very small, the sense circuit needs a longer integration time and becomes more sensitive to leakage and noise. TER and current magnitude must be evaluated together.

### Sources

- [EMG-FTJ24: Original Research: Atomic-Scale BSO Ferroelectric Tunnel Junctions](https://www.nature.com/articles/s41467-024-44927-7)
- [EMG-P-FTJ: TSMC FTJ Structure and Low-Temperature Formation Application](https://patents.google.com/patent/US20240057343A1/en)

## Foundry Roadmap by Year

### 2020 · GF · MRAM · 22FDX (22nm FD-SOI)

Volume Production: GF officially announced that eMRAM had entered production.

Limitations: Provides a production baseline preceding 2022; it does not imply that every subsequent version was completed in 2020.

- [FND-GF-2020-MRAM: GF: 22FDX eMRAM Production Announcement](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram)

### 2022 · GF · MRAM · 22FDX/22FDX+

Unresolved: The existing 22FDX production baseline traces back to 2020. MRAM-G2 appears in the 2022 roadmap, but this review has not established its separate qualification or completed volume-production status.

Limitations: Planned features shown in a chart must not all be marked as in production.

- [FND-GF-2020-MRAM: GF: 22FDX eMRAM Production Announcement](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram)
- [FND-GF-2022-MAP: GF 2022 Investor Presentation: Platform Feature Roadmap](https://investors.gf.com/static-files/65f5f1b9-2aea-47a3-8455-10413c6560f4)

### 2022 · TSMC · MRAM · 16FFC

Production-Ready: Completed reliability qualification, with one million cycles and solder-reflow capability. The technology was production-ready; Grade 1 was then targeted for 2023.

Limitations: Does not establish completed automotive qualification or customer volume shipments in that year.

- [FND-TSMC-2022-AR: TSMC 2022 Annual Report: 16FFC MRAM and 22/28ULL RRAM](https://investor.tsmc.com/static/annualReports/2022/english/ebook/files/basic-html/page97.html)

### 2022 · TSMC · RRAM · 22ULL/28ULL

Volume Production: Several customers completed product qualification and began volume production.

Limitations: Applies to specific platforms and customer products; does not establish automotive qualification for every capacity.

- [FND-TSMC-2022-AR: TSMC 2022 Annual Report: 16FFC MRAM and 22/28ULL RRAM](https://investor.tsmc.com/static/annualReports/2022/english/ebook/files/basic-html/page97.html)

### 2023 · GF · MRAM · 22FDX/22FDX+; 12LP Listed Separately

Unresolved: The platform chart continues to show MRAM development. Joint development is documented for 12LP, but this does not confirm embedded MRAM volume production in that year.

Limitations: Foundry manufacturing of discrete STT-MRAM products and GF's embedded macro availability must be distinguished.

- [FND-GF-2023-MAP: GF 2023 Investor Presentation: Platforms and Features](https://investors.gf.com/static-files/9aecbb31-1a7a-43a5-b1ed-d5e0d4380cee)
- [FND-EVERSPIN-12LP: Everspin/GF 12LP MRAM Joint Development Agreement Amendment](https://www.sec.gov/Archives/edgar/data/1438423/000155837021002369/mram-20201231xex10d11d4.htm)

### 2023 · TSMC · MRAM · 16FFC (Version in That Year's Process-Services Chapter)

Qualified: The annual report records completed AEC-Q100 Grade 1 reliability qualification, providing subsequent completion evidence for the target stated in 2022.

Limitations: The same year's R&D chapter separately describes a consumer-grade version and a next generation with smaller bits. A precise mapping of macro versions is unavailable.

- [FND-TSMC-2023-AR: TSMC 2023 Annual Report, Chapter Five: Process Services and Emerging Memory](https://investor.tsmc.com/static/annualReports/2023/english/pdf/2023_tsmc_ar_e_ch5.pdf)
- [FND-TSMC-2024-BUS: TSMC 2024 Annual Report: Automotive Technology Services](https://investor.tsmc.com/static/annualReports/2024/english/ebook/files/basic-html/page21.html)

### 2023 · TSMC · MRAM · 22nm; 16nm R&D Version

Volume Production: The R&D chapter explicitly records volume production of 22nm consumer-grade MRAM, completed consumer-grade technology qualification at 16nm, and continued development of a next generation with smaller bits.

Limitations: This statement of 22nm production is not used as the sole evidence for the first volume-production year. Distinct 16nm versions are not conflated.

- [FND-TSMC-2023-AR: TSMC 2023 Annual Report, Chapter Five: Process Services and Emerging Memory](https://investor.tsmc.com/static/annualReports/2023/english/pdf/2023_tsmc_ar_e_ch5.pdf)

### 2023 · TSMC · RRAM · 40/28/22nm; 12nm

Volume Production: 40/28/22nm was in volume production, while 12nm and the next generation remained in development. 22/28ULL was in its second year of volume production.

Limitations: Volume production of the underlying 12nm logic platform does not establish volume production of embedded RRAM.

- [FND-TSMC-2023-AR: TSMC 2023 Annual Report, Chapter Five: Process Services and Emerging Memory](https://investor.tsmc.com/static/annualReports/2023/english/pdf/2023_tsmc_ar_e_ch5.pdf)

### 2024 · GF · MRAM · 12LP+ AutoPro150 (FinFET)

Announced: The official article describes the direction of eMRAM deployment and its use in automotive MCUs.

Limitations: No macro-specific qualification or production-completion date is available for verification. MRAM figures from 22FDX must not be applied.

- [FND-GF-2024-AUTO: GF: Automotive Platform Innovation and 12LP+ AutoPro150](https://gf.com/news-and-events/blog/driving-automotive-innovation-on-the-semiconductor-superhighway/)

### 2024 · TSMC · MRAM · Smaller, More Energy-Efficient 16nm Bits; 12/5nm

In Development: Automotive qualification for the smaller-bit 16nm technology was targeted for 2025; development began at the 12nm and 5nm nodes.

Limitations: The earlier 16FFC Grade 1 completion in 2023 remains valid. A target for a new version must not be misrepresented as a delay of the entire node.

- [FND-TSMC-2024-AR: TSMC 2024 Annual Report: Emerging Memory with Smaller Bits](https://investor.tsmc.com/static/annualReports/2024/english/ebook/files/basic-html/page104.html)

### 2024 · TSMC · RRAM · 12nm; 6nm

Qualified: The annual report's R&D chapter states that 12nm consumer-grade technology qualification was completed and 6nm entered development.

Limitations: The 2025 annual report additionally records consumer-grade qualification for production. Both source statements are retained; no single first-qualification date is assigned independently.

- [FND-TSMC-2024-AR: TSMC 2024 Annual Report: Emerging Memory with Smaller Bits](https://investor.tsmc.com/static/annualReports/2024/english/ebook/files/basic-html/page104.html)

### 2025 · GF · MRAM · 12LP+/22FDX

Announced: The automotive article lists MRAM on both platforms as technologies supporting MCUs.

Limitations: An application claim cannot replace production and quality documentation for a 12LP+ macro.

- [FND-GF-2025-MCU: GF: Automotive MCUs and Software-Defined Vehicles](https://gf.com/news-and-events/blog/inside-a-cars-digital-brain-mcus-the-engine-powering-sdv-innovation/)

### 2025 · GF · RRAM · 22FDX+ OxRAM

Design Kit Available: The technology summit announced prototyping availability and preliminary macro design kits, with volume production targeted for 2026.

Limitations: Its mechanism and version differ from the 2020 Dialog CBRAM collaboration. It is not treated as evidence that the earlier plan was completed.

- [FND-GF-2025-RRAM: GF 2025 Technology Summit: 22FDX+ RRAM Available for Prototyping](https://gf.com/news-and-events/news/globalfoundries-announces-availability-of-22fdx-rram-technology-for-wireless-connectivity-and-ai-applications/)

### 2025 · TSMC · MRAM · Second-Generation 16MRAM

Qualified: Passed automotive Grade 1. The annual report states a chip failure rate below 1 ppm after one million cycles.

Limitations: Limited to the second generation; does not rewrite the earlier record of 16FFC completion in 2023.

- [FND-TSMC-2025-AR: TSMC 2025 Annual Report: Second-Generation MRAM and Third-Generation RRAM](https://investor.tsmc.com/static/annualReports/2025/english/pdf/2025_tsmc_ar_e_ch5.pdf)
- [FND-TSMC-2025-20F: TSMC Form 20-F for Fiscal Year 2025](https://www.sec.gov/Archives/edgar/data/1046179/000162828026025362/tsm-20251231.htm)
- [FND-TSMC-CURRENT-LOGIC: TSMC Current 16/12nm Technology Page](https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_16_12nm)

### 2025 · TSMC · RRAM · N12e; 22RRAM/22ULL

Qualified: N12e completed consumer-grade qualification for production; 22RRAM completed qualification for one hundred thousand cycles; 22ULL RRAM met automotive Grade 1 requirements.

Limitations: The three qualification scopes remain separate. One hundred thousand cycles and all automotive conditions must not be automatically combined into a commitment for the same macro.

- [FND-TSMC-2025-AR: TSMC 2025 Annual Report: Second-Generation MRAM and Third-Generation RRAM](https://investor.tsmc.com/static/annualReports/2025/english/pdf/2025_tsmc_ar_e_ch5.pdf)
- [FND-TSMC-2025-20F: TSMC Form 20-F for Fiscal Year 2025](https://www.sec.gov/Archives/edgar/data/1046179/000162828026025362/tsm-20251231.htm)
- [FND-TSMC-CURRENT-LOGIC: TSMC Current 16/12nm Technology Page](https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_16_12nm)

### 2026 · GF · MRAM · FDX+ AutoPro150

Design Kit Available: The March announcement stated Grade 1 ready, PDK availability, and specified performance. Volume production in Dresden was targeted for the second half of 2026.

Limitations: As of September 10, this review had not obtained an announcement confirming volume production of the new version. Entering the second half of the year does not establish volume production.

- [FND-GF-2026-AUTO: GF: FDX+ AutoPro150 eMRAM Available for Prototyping](https://gf.com/news-and-events/news/globalfoundries-announces-availability-of-autopro-150-emram-technology-on-enhanced-fdx-platform-for-advanced-automotive-applications/)
- [FND-GF-CURRENT-FDX: GF Current FDX Platform and Embedded Memory Page](https://gf.com/technologies/cmos/fdx-fd-soi/)

### 2026 · GF · RRAM · 22FDX+ OxRAM

Volume-Production Target: Retains the 2026 volume-production target from the 2025 announcement; the current FDX page continues to describe RRAM.

Limitations: No explicit completion announcement was obtained in this review. A feature listed on a product page is not evidence of its completion date.

- [FND-GF-2025-RRAM: GF 2025 Technology Summit: 22FDX+ RRAM Available for Prototyping](https://gf.com/news-and-events/news/globalfoundries-announces-availability-of-22fdx-rram-technology-for-wireless-connectivity-and-ai-applications/)
- [FND-GF-CURRENT-FDX: GF Current FDX Platform and Embedded Memory Page](https://gf.com/technologies/cmos/fdx-fd-soi/)

### 2026 · TSMC · MRAM · 22/16nm; 12nm Automotive; 5nm High-Speed

Volume Production: As of the verification date, official product text lists 22/16nm as automotive-qualified and in production, with 12nm automotive and 5nm high-write-speed versions in development.

Limitations: This is a dynamic current-status snapshot. 2026 is not assigned as the first volume-production year of each platform; not all performance conditions are published.

- [FND-TSMC-CURRENT-NVM: TSMC Current Embedded Nonvolatile Memory Page](https://www.tsmc.com/english/dedicatedFoundry/technology/specialty/eflash)

### 2026 · TSMC · RRAM · 40/28/22/12nm; 6nm

Volume Production: As of the verification date, official text lists 40/28/22/12nm in volume production and 6nm in development.

Limitations: A 12nm automotive qualification date or 6nm volume-production date must not be added without public primary evidence of completion.

- [FND-TSMC-CURRENT-NVM: TSMC Current Embedded Nonvolatile Memory Page](https://www.tsmc.com/english/dedicatedFoundry/technology/specialty/eflash)

### 2017 · UMC · ReRAM · 40nm

Joint development: Panasonic collaboration targeting samples in 2018.

Limitations: Sampling and production were forward plans; existing 180nm production does not establish 40nm production.

- [RES-PANASONIC-UMC-2017: Panasonic / UMC: 40nm ReRAM Collaboration](https://news.panasonic.com/global/press/en170201-3)

### 2018 · UMC · MRAM · 28nm

Joint development: MRAM development with Avalanche starting from 28nm CMOS.

Limitations: An agreement does not establish availability of every embedded macro.

- [RES-UMC-MRAM-2018: UMC / Avalanche: MRAM Development Agreement](https://www.umc.com/en/News/press_release/Content/technology_related/20180806)

### 2022 · UMC · STT-MRAM / Standalone P-SRAM · 22nm

Named product production: Avalanche third-generation P-SRAM announced immediately available.

Limitations: Standalone-product evidence is not a specification for a general UMC embedded macro.

- [RES-UMC-MRAM-2022: UMC / Avalanche: 22nm P-SRAM Availability](https://www.umc.com/en/News/press_release/Content/technology_related/20220913)

### 2023 · UMC · RRAM / eMemory IP · 22nm ULP

Qualified: 8Mb plus 16Kb RRAM IP qualified on the 0.8V/2.5V platform.

Limitations: The 16Mb automotive and 0.8V/1.8V versions remained under development in this announcement.

- [RES-UMC-RRAM-2023: UMC / eMemory: 22nm RRAM Qualification](https://www.umc.com/en/News/press_release/Content/technology_related/20230328)

### 2025 · UMC · RRAM / FlashKit-22RRAM · 22nm ULP

SoC platform silicon validation: Faraday announced completion and silicon validation of its RRAM SoC development platform.

Limitations: Controller and processor integration evidence does not establish named customer volume shipments.

- [RES-FARADAY-RRAM-2025: Faraday: FlashKit-22RRAM Silicon Validation](https://www.faraday-tech.com/html/News/pressRelease/CHI_01_0441.jsp)

## Comparison Examples

### Infineon CY15B104QSN, 4 Mb EXCELON Ultra F-RAM

Complete Product

Up to 108 MHz SDR or 54 MHz DDR; Endurance: 10¹⁴ read/write cycles; Data retention: 10 years at 85°C, 38 years at 75°C, and 151 years at 65°C

Conditions: Datasheet 002-18293 Rev. *N, 2024-07-25, Table 63.; Endurance is specified over the operating-temperature range listed in the table. Each retention rating must be cited together with its corresponding temperature.; MHz describes the interface clock; it does not imply that a complete command takes a single cycle.

Compare test conditions before comparing numbers. Removing 65°C from the 151-year rating changes the meaning of the specification.

- [CMP-FRAM-DS: Infineon CY15B104QSN/CY15V104QSN Datasheet](https://www.infineon.com/dgdl/Infineon-CY15B104QSN_CY15V104QSN_4Mb_EXCELON_Ultra_Ferroelectric_RAM_F-RAM_Serial_quad_SPI_512K_8_108_MHz_industrial-DataSheet-v15_00-EN.pdf?fileId=8ac78c8c7d0d8da4017d0ee59c446d71)
- [CMP-FRAM-PRODUCT: Infineon CY15B104QSN-108SXI Product Status](https://www.infineon.com/part/CY15B104QSN-108SXI)

### Everspin MR25H40, 4 Mb SPI MRAM

Complete Product

SPI up to 40 MHz; Supply voltage: 3.0–3.6 V; Data retention exceeding 20 years; The supplier specifies unlimited read/write cycling

Conditions: MR2xH40 datasheet revision 12.6, 2020-08. This example uses the MR25H40's 40 MHz specification, not the MR20H40's 50 MHz specification.; The product has multiple temperature grades and part numbers; the design must use the applicable version.; Unlimited cycling is a product specification. It does not mean that the magnetic materials and dielectric layers never age under any conditions.

Identify the write mechanism even within the same technology family. Toggle specifications cannot represent STT or SOT.

- [CMP-MRAM-DS: Everspin MR20H40/MR25H40 Datasheet](https://www.everspin.com/sites/default/files/EST00459_MR2xH40_Datasheet_Rev12.6_08092020.pdf)
- [CMP-MRAM-PRODUCT: Everspin MR25H40 Products and Part Numbers](https://www.everspin.com/products/series/mr25h40)

### RAMXEED MB85AS8MT, 8 Mb SPI ReRAM

Complete Product

SPI up to 10 MHz; Endurance at 85°C: 10⁶ cycles per 4 bytes; Data retention at 85°C: 10 years; Write cycle tWC: 5,000 µs typical, 10,000 µs maximum

Conditions: Datasheet DS501-00060-2v2-E, p17: tWC is specified with all data bits toggling.; Up to 256 bytes are first received in the data register; internal nonvolatile programming starts after CS rises.; During internal programming, completion must be checked through WIP in the status register. The 10 MHz interface rate is not the nonvolatile-write speed.; See p20 for endurance and retention conditions. The granularity of 4 bytes must be retained.

A research cell may switch with ns pulses while a commercial product's complete write sequence takes ms. The two measurements describe different levels of implementation.

- [CMP-RERAM-DS: RAMXEED MB85AS8MT Datasheet](https://www.ramxeed.com/assets/images/products/datasheet/ReRAM/MB85AS8MT-DS2v2-E.pdf)
- [CMP-RERAM-PRODUCT: RAMXEED ReRAM Product Family](https://www.ramxeed.com/zh-tw/products/reram-products/)

### TSMC 22 nm Embedded STT-MRAM: 20 Mb Research Design and Performance Option

Array / Research Design

Sensing-signal development time: 6 ns at 125°C; Average write-pulse duration: slightly above 30 ns at −40°C

Conditions: Gallagher et al., research abstract published in 2019.; These performance results use an option with smaller MTJs that gives up data retention through reflow.; The same paper also discusses options with stronger reflow and retention capability. The conditions of these options cannot be combined into a single implementation.; Neither sensing-signal development nor average write-pulse duration is the complete access latency visible to a CPU.

The most useful comparison is often the explicit trade-off within one study, rather than a selection of best-case values from unrelated papers.

- [CMP-TSMC-STT2019: TSMC 22 nm STT-MRAM: Reflow, Automotive Reliability, and Performance Options](https://research.tsmc.com/page/mram/1.html)

### Kioxia/Sandisk 10th-Generation 2 Tb BiCS FLASH, 4 Bits per Cell

ISSCC 2026 Die Demonstration

4 bits per cell; 332 word-line layers; Die-level bit density: 37.6 Gb/mm²; Write throughput exceeding 85 MB/s

Conditions: Kioxia's research article dated 2026-07-15 corresponds to an ISSCC 2026 paper.; The stated capacity is for the 2 Tb die, and density uses die area as the denominator.; Write throughput describes the memory die, not the host-visible write performance of an arbitrary SSD.; A research publication does not directly establish volume production of an entire product generation.

Assess 3D density through layer count, bits per cell, and peripheral efficiency together. F² alone misses major contributors to cost.

- [CMP-KIOXIA2026: Kioxia/Sandisk Research on 10th-Generation 2 Tb QLC NAND](https://www.kioxia.com/en-jp/rd/technology/topics/topics-92.html)

### Intel Optane SSD P5800X: Historical Product-Platform Measurement

Complete SSD and Host Platform

Average 512 B random-read latency: 3.5 µs; Average 4 KB random-read latency: below 6 µs

Conditions: Intel test date: 2021-03-18.; The platform included dual Xeon Platinum 8380 processors, 512 GB DDR4, Ubuntu 20.04.2, and FIO 3.16. See source items 11 and 12 for complete details.; 512 B and 4 KB are different test granularities. An average is not a tail-latency measurement.; This is a historical system-level example, not evidence of new-product availability in 2026.

User-visible latency also includes the controller, interface, and platform. SSD values in µs cannot be ranked directly against cell values in ns.

- [CMP-OPTANE-PERF: Intel Optane P5800X Performance and Test Conditions](https://edc.intel.com/content/www/us/en/products/performance/benchmarks/intel-optane-ssd-p5800x-series/)
- [CMP-INTEL2023: Intel Optane Customer Letter](https://cdrdv2-public.intel.com/774331/IOG-DCL-March%202023.pdf)

## From One Bit to a Complete Array: Selection, Sensing, and Program Verify

Switching a device twice establishes only that it has usable storage states. A practical memory must also select its target from a large population of cells, avoid disturbing its neighbors, and read data correctly across temperature, aging, and process variation. Selectors, wires, and peripheral circuits therefore determine how much of the cell-level advantage survives.

### A Storage Device Is Not Yet a Memory

For a resistive cell, data may be represented by high- and low-resistance states, but an external address does not directly select a laboratory probe. Row and column decoders first identify the target. Word lines, bit lines, and access devices then establish the current path. The read circuit converts a finite current or voltage difference into digital data, while the controller schedules reads, writes, and error handling.

This path gives cell switching time and complete access time different meanings. The former may record only the pulse needed to change the material state; the latter also includes decoding, wire charging and discharging, sensing, verification, and data transfer. The first step in interpreting any performance number is therefore to identify where the measurement starts and what defines completion.

### 1T1R: Transistor Selection Also Provides Write Control

A 1T1R cell consists of an access transistor and a resistive storage device. The transistor gate provides an independent control terminal that can isolate unselected cells. With an appropriate circuit design, the transistor can also limit forming or programming current to prevent excessive resistive switching. A read selects the target path, applies a lower bias, and uses the sensing circuit to determine the state.

The trade-off is transistor area. The required write current and voltage affect transistor sizing and voltage tolerance. Shrinking the storage material does not mean the complete cell can shrink by the same ratio. This explains why papers may report a very small resistive device while a practical 1T1R array occupies substantially more area.

### 1S1R and Crossbar Arrays: Density Depends on Suppressing Sneak Paths

A 1S1R cell places a two-terminal selector in series with a storage device. Strong nonlinearity, rectification, or threshold switching can suppress current at low bias while delivering enough current at the selected read or write bias. The two-terminal structure fits at the intersection of crossing wires and creates opportunities for vertical stacking. A volatile selector does not prevent its series-connected storage device from retaining data: the two components perform different functions.

Without sufficient isolation, current can flow through other low-resistance cells along parasitic paths, overwhelming the target read signal or altering programming conditions. A selector also consumes voltage headroom and introduces leakage and variability. IBM's array research shows why the selector and storage device must be assessed together with the wires, operating biases, and array size. A high nonlinearity ratio does not establish operation at arbitrary scale. Devices with intrinsic rectification or selection require separate evidence for their array conditions.

### Half-Select Bias: Cells Outside the Target Also Experience Stress

Consider an idealized V/2 scheme: drive the selected word line to V, the selected bit line to 0, and all other word and bit lines to V/2. The target intersection sees V. Cells sharing one selected line with the target see approximately V/2. The remaining cells see no voltage difference if the wires are ideal. Cells selected at only one terminal are called half-selected cells.

Even if a half-select voltage cannot switch a cell during one pulse, repeated exposure can cause cumulative disturbance. Real arrays also have wire voltage drops and voltage division across selectors, so the voltage delivered to a distant cell may differ from the driver's setting. V/2 is therefore a biasing strategy that must be validated, not a universal solution across materials and switching polarities.

### Sense Margin Depends on Distribution Tails, Not Just Average Resistance

The sense circuit compares a cell signal with a reference. Even when average high- and low-resistance states are widely separated, a minority of cells can approach the decision boundary because of process variation, temperature, read noise, or programming history. In a large array, these distribution tails can determine product yield more strongly than the typical curve of a well-behaved device.

Reducing read bias generally helps reduce disturbance, but it can also reduce the signal, require more settling time, or demand a more precise sense circuit. Practical macros use reference tracking, offset compensation, and measures to address wire voltage drop. The 40 nm RRAM macro studied by TSMC and collaborators treats read-channel mismatch, leakage, ADC offset, IR drop, and cell variability as coupled problems. The device resistance ratio cannot substitute for this circuit-level evidence.

### Program Verify: Feedback Reduces Error but Adds Time and Energy

Program verify applies a programming pulse, reads the cell back, and checks whether it lies within the target range. If it does not, the controller adjusts or adds pulses until the target is reached or the retry limit is exhausted. This feedback helps manage device-to-device and cycle-to-cycle variation. It is particularly important for multistate storage, where each state has a narrower usable margin.

Verification has a cost and its own limitations. Every readback consumes time and energy, and the verification measurement is itself affected by noise. NIST's oxide-RRAM experiments show that read fluctuations can produce false-pass decisions and leave longer tails in the state distribution. IBM's analog-PCM work also shows that read noise and drift limit closed-loop programming precision. To assess write quality, report pulse count, verification thresholds, retries, failure fraction, and the delay after programming together.

### ECC, Redundancy, and Repair: Include Usable Data in Density

Error-correcting codes (ECC) add check information to detect or correct errors within a defined capability. Spare rows, spare columns, and defect replacement can avoid some permanent failures. These methods translate raw-cell error rates into data reliability acceptable to the system, but consume capacity, area, latency, or computation.

Successful data retrieval does not mean that the raw bits contained no errors. Reports should distinguish error rates before and after ECC. ECC also has finite capability against overlapping state distributions, correlated errors, and failed bits. Effective density should divide actual usable data capacity by the area that includes the associated periphery, rather than simply multiplying layer count by bits per cell.

### An Array's Ceiling Requires Three Accounts: Signal, Energy, and Area

The signal account asks how much read and write margin remains at the worst location and under the worst data pattern. The energy account includes not only the selected cell but also wire charging and discharging, leakage through unselected paths, and repeated verification. The area account includes decoders, drivers, sense circuits, ECC, and redundancy.

A larger array is therefore not necessarily more efficient. Partitioning it into smaller subarrays can add some peripheral overhead while improving voltage drop, speed, and reliability. A research result should identify the bottleneck under the stated material, array, and operating conditions, rather than declare that an entire technology family has reached an immutable physical endpoint. A persuasive improvement reports performance, reliability, and cost under the same conditions.

- [CMP-YU2016: Yu and Chen: Emerging Memory Technologies—Recent Trends and Prospects](https://knowen-production.s3.amazonaws.com/uploads/attachment/file/5249/yu2016.pdf)
- [CMP-LECTURE2021: Shimeng Yu: Comparison Table from Lecture 6, 2021](https://www.youtube.com/watch?v=_Ov2KUZTIv8&t=2165s)
- [CMP-IBM-SELECTOR2017: IBM: Memory Selector Devices and Crossbar Array Design](https://research.ibm.com/publications/memory-selector-devices-and-crossbar-array-design-a-modeling-based-assessment)
- [CMP-IBM-ARRAY2014: IBM: Design Space for Resistive-Memory Arrays with MIEC Selectors](https://research.ibm.com/publications/exploring-the-design-space-for-resistive-nonvolatile-memory-crossbar-arrays-with-mixed-ionic-electronic-conduction-miec-based-access-devices)
- [CMP-NIST-VERIFY2017: NIST: Impact of RRAM Read Fluctuations on Program Verify](https://www.nist.gov/publications/impact-rram-read-fluctuations-program-verify-approach)
- [CMP-IBM-PCM2020: IBM: Precision Limits of Closed-Loop PCM Programming](https://research.ibm.com/publications/precision-of-synaptic-weights-programmed-in-phase-change-memory-devices-for-deep-learning-inference)
- [CMP-TSMC-ECC2023: TSMC and Collaborators: Read Compensation and ECC in an RRAM Macro](https://research.tsmc.com/page/artificial-intelligence/3.html)
- [CMP-RERAM-DS: RAMXEED MB85AS8MT Datasheet](https://www.ramxeed.com/assets/images/products/datasheet/ReRAM/MB85AS8MT-DS2v2-E.pdf)

## SCM and Persistent Memory: From Media to Systems

Storage-class memory (SCM) addresses the gap in requirements between DRAM and NAND storage. It is not another bitcell type, and adopting CXL does not automatically establish an SCM implementation. Understanding SCM requires distinguishing storage physics, attachment, access granularity, and which data can actually be recovered after failure.

### SCM Is a System Role; Persistent Memory Has Specific Semantics

DRAM provides low-latency working memory, while NAND supports large-scale storage through high capacity and low cost per bit. SCM is often used to discuss the space between them in performance, capacity, cost, and endurance. Different publications may include low-latency storage products or NVM with a memory interface, so any discussion of SCM should first define its scope.

This topic treats SCM as a system role rather than a material name. Technologies such as PCM and ReRAM have been explored as candidates. Persistent-memory discussions focus more specifically on properties such as nonvolatility, byte addressability, and low latency, together with how software guarantees recoverability. Not every NVM is suitable as main memory, and not every low-latency SSD provides the same load/store semantics.

### CXL Changes Attachment, Not DRAM Physics

CXL is an interconnect protocol built on a PCIe physical link that can let a processor access memory on a device. The specification distinguishes volatile and persistent memory ranges. They can share an attachment architecture while retaining different data-persistence properties. Samsung CMM-D, for example, is a DRAM memory module using CXL.

Capacity expansion, memory sharing, and pooling therefore do not establish retention through power loss. Assessing a CXL device requires identifying its media, exposed address ranges, platform-supported capabilities, and handling of host, link, or device failures. The interface name alone answers none of these questions.

### Persistence Can Come from the Media or from a Complete Save/Restore Mechanism

One approach uses media that inherently retain data. Another lets fast but volatile DRAM handle normal reads and writes, then combines it with NAND and backup energy to save data during power loss and restore it after restart. NVDIMM-N is an example of the latter. A member technical article published by the CXL Consortium in 2026 also discusses a similar CXL architecture.

The guarantee depends on sufficient backup energy, successful completion of the save sequence, firmware identification of valid data, and platform coordination. The architecture does not make a DRAM bitcell nonvolatile; it provides data persistence through system design. An architectural diagram must also keep conceptual feasibility, product qualification, and volume-production status separate.

### 3D XPoint and Optane: Commercial History Must Include the Exit Timeline

3D XPoint and Optane are important commercial implementations in the history of SCM, but their lifecycle has changed. On 2021-03-16, Micron announced the immediate discontinuation of 3D XPoint development and stated that manufacturing would end after existing commitments were fulfilled. It completed the sale of the Lehi fab on 2021-10-22. Intel announced in July 2022 that it would discontinue further Optane product development.

Intel's customer letter dated 2023-03-21 stated that, at the time, media inventory was expected to support customer demand through 2025, with support resources planned through 2030. Inventory, warranties, and support cannot be described as continued investment in next-generation manufacturing, nor does that letter establish that every part number remains available in 2026. The history also shows why the exit of one commercial roadmap does not eliminate an entire storage-physics family such as PCM: ST SR6P6C8 provides a separate embedded-PCM implementation in volume production.

### A Completed Processor Store Does Not Mean the Data Is Safely Persistent

After a program executes a store instruction, the new data may still reside in a CPU cache, memory controller, or device buffer. If any of those locations lack power-loss protection, the system can lose power before the nonvolatile media ever receive the data. The persistence domain is the boundary within which the platform guarantees that data are retained, or their retention is completed, under specified failure conditions.

Software must use platform-appropriate synchronization, cache flushing, and ordering mechanisms to ensure that data reach this domain. PMDK documentation explains the process in terms of cache flushing and hardware-buffer draining, and notes that some platforms can omit certain steps. The objective is not to memorize a universal instruction sequence, but to identify what the platform protects and which completion event establishes persistence.

### Persistence and Atomicity Are Different Problems

Suppose a program creates a new data record and then updates an index pointer to refer to it. If the pointer becomes persistent before the content does, recovery may find an incomplete record. Requiring both writes to become persistent eventually does not remove the need to control their order. Conversely, persisting the content before updating the index can leave unreferenced data, which requires a reclamation or recovery strategy.

This is a failure-consistency problem. A persistence operation guarantees that data reach the persistence domain; it does not automatically combine multiple fields into an indivisible transaction. Logging, commit markers, version information, and transaction mechanisms establish recognizable recovery points. The platform must guarantee the relevant atomic-write granularity; arbitrary-size writes cannot be assumed to survive as complete units. SNIA's white paper on atomics and transactions illustrates these distinctions through data structures.

### Latency and Granularity Must Match the Workload

Byte or cache-line access can reduce some software and data-movement overheads. Block SSDs use controllers and parallelism to increase throughput. Each approach has suitable applications; one number in ns or µs cannot determine the role. Granularity, queue depth, read/write ratio, access locality, and synchronization frequency all affect user-visible performance.

For example, Intel's 2021 P5800X tests report average 512 B random-read latency of 3.5 µs and average 4 KB random-read latency below 6 µs. These are results for a specific complete SSD and host platform, not material-level pulse durations. Average latency also cannot substitute for tail latency. For databases and logging, the relevant measure is transaction latency after data become persistent, rather than merely the speed of handing data to a buffer.

### SCM's Ceiling Also Includes Cost, Supply, and Software Adoption

A technology positioned between DRAM and NAND does not necessarily sustain a commercial position between them. Media density, yield, controller and packaging costs, supply scale, software modification costs, and alternatives within existing systems all influence adoption. Micron's 2021 announcement explicitly cited insufficient market validation to support scaled investment as part of its decision. That is a commercial judgment, not proof that a single physical-performance metric failed.

Evaluate an SCM candidate through three questions: Which specific workload bottleneck does it address? What is the complete system cost under the same capacity, reliability, and failure-protection requirements? If the media or supplier change, is there still a viable path for the software and hardware? This connects bitcell principles to practical product decisions.

- [CMP-SNIA-PM: SNIA Definition of Persistent Memory](https://www.snia.org/education/what-is-persistent-memory)
- [CMP-CXL2022: CXL 3.0 Specification](https://computeexpresslink.org/wp-content/uploads/2024/02/CXL-3.0-Specification.pdf)
- [CMP-CXL-FAQ2021: CXL Consortium Persistent-Memory Webinar Questions and Answers](https://computeexpresslink.org/blog/questions-from-the-compute-express-link-cxl-supporting-persistent-memory-webinar-2407/)
- [CMP-SAMSUNG-CMM: Samsung CXL Memory and CMM-D](https://semiconductor.samsung.com/cxl-memory/)
- [CMP-CXL2026: DRAM, NAND, and Backup Energy in CXL Persistent Memory](https://computeexpresslink.org/blog/from-nvdimm-n-to-cxl-persistent-memory-bringing-persistence-to-the-memory-fabric-4635/)
- [CMP-MICRON2021: Micron 3D XPoint and Data-Center Portfolio Strategy Update](https://investors.micron.com/news/press-release/2021/Micron-Updates-Data-Center-Portfolio-Strategy-to-Address-Growing-Opportunity-for-Memory-and-Storage-Hierarchy-Innovation-03-16-2021/default.aspx)
- [CMP-MICRON-CALL2021: Micron 3D XPoint Strategy-Update Prepared Remarks](https://investors.micron.com/static-files/c858cbb2-bfd2-4f84-ba10-f69b385cf4bf)
- [CMP-MICRON-LEHI2021: Micron Completes the Sale of the Lehi Fab](https://www.micron.com/about/blog/company/partners/sale-of-lehi-fab)
- [CMP-INTEL2023: Intel Optane Customer Letter](https://cdrdv2-public.intel.com/774331/IOG-DCL-March%202023.pdf)
- [CMP-PCM-PRODUCT: ST SR6P6C8 Microcontroller with Embedded PCM](https://www.st.com/en/automotive-microcontrollers/sr6p6c8.html)
- [CMP-PMDK: PMDK libpmem Persistence Operations](https://pmem.io/pmdk/libpmem/)
- [CMP-SNIA-NPM: SNIA NVM Programming Model](https://www.snia.org/sites/default/files/technical-work/npm/release/SNIA-NVM-Programming-Model-v1.pdf)
- [CMP-SNIA-ATOMICS2017: SNIA: Persistent Memory Atomics and Transactions](https://www.snia.org/sites/default/files/technical-work/whitepapers/SNIA-Persistent-Memory-Atomics-Transactions-WP.pdf)
- [CMP-OPTANE-PERF: Intel Optane P5800X Performance and Test Conditions](https://edc.intel.com/content/www/us/en/products/performance/benchmarks/intel-optane-ssd-p5800x-series/)

## Glossary

- CHI and CHEI: CHI is shorthand for channel hot-carrier injection. Name the actual carrier and cell polarity: the YMC course model injects energetic channel electrons, while eMemory describes NeoBit/NeoMTP programming as channel-hot-hole-induced hot-electron injection (CHEI). In the latter case, holes generate carriers in silicon and electrons enter the floating gate.
- Fowler–Nordheim (FN) Tunneling: A sufficiently strong field changes the dielectric energy barrier so electrons can tunnel through it. State the electron origin, destination and field direction separately. NeoEE uses FN transport for both updates; NeoMTP uses FN electron transfer toward an erase gate for the reverse update.
- BBT, BBHH and DAHHI: Band-to-band tunneling (BBT) creates electron/hole pairs inside silicon. Band-to-band hot-hole injection (BBHH) then uses energetic holes to cross the dielectric. Drain-avalanche hot-hole injection (DAHHI) uses avalanche generation instead; shared hot-hole injection does not make the carrier-generation mechanisms identical.
- Direct Tunneling and Antifuse Readout: In eMemory's published ultrathin-dielectric explanation, programming generates defects that reduce effective tunneling distance and increase gate current. Preserve this named mechanism when discussing NeoFuse; an ideal metal short or a generic trap-assisted-tunneling label is not a substitute.
- P/AP and SET/RESET: P and AP describe parallel and antiparallel magnetic-layer states, generally associated with lower and higher MTJ resistance. SET and RESET describe transitions to lower and higher resistance in the ReRAM examples. These state labels do not prescribe a universal terminal polarity or logic 0/1 encoding.
- Bitcell: The smallest circuit or combination of devices that stores data in a physical state. A complete bitcell may also include an access transistor or selector; it is not necessarily just the storage material.
- Array and Macro: An array organizes many cells through wires. A macro generally also includes peripheral functions such as decoding, driving, sensing, and control, and can serve as a memory block within a chip design.
- Word Line and Bit Line: A word line usually participates in selecting a row of cells, while a bit line carries a data-dependent current or voltage. Connections and biasing strategies differ across array architectures.
- Selector: A device controlling which storage cell participates in a read or write. It may be a transistor, diode, nonlinear two-terminal device, or threshold-switching device. Its purpose is to conduct when selected and suppress unintended paths when unselected.
- Half-Select Disturbance: Cells sharing one selected line with the target also experience part of the operating bias. Repeated stress can alter their stored state or reliability.
- Sneak Path: An unintended current path through non-target cells. It can corrupt the read signal, alter programming bias, and increase energy consumption.
- Sense Margin: The usable signal separation between a stored state and the decision boundary in the presence of noise, variability, and operating conditions. It must be evaluated across distributions and worst-case conditions.
- Program Verify: A feedback sequence that reads a cell after programming, checks whether it meets the target, and adjusts or adds pulses if necessary. It improves state control but adds time and energy.
- Endurance: The number of read/write or program/erase cycles supported under specified operating conditions, error thresholds, and retention requirements. The granularity—bit, byte, page, or block—must be stated.
- Data Retention: How long data remain valid under specified temperature, prior cycling, power, and error requirements. Retention in years cannot be compared independently of those conditions.
- F² and Effective Bit Density: F² expresses area normalized to the square of the feature size. Effective bit density also depends on layer count, multibit storage, peripheral circuits, redundancy, and ECC; the two measures must remain distinct.
- Access Granularity: The amount of data involved in one read, write, erase, or guaranteed atomic operation. Byte, cache-line, page, and block granularities affect performance and software behavior.
- Error-Correcting Code (ECC): A method that adds check information to detect or correct errors within the code's capability. It adds capacity and processing overhead and has a defined boundary beyond which errors cannot be corrected.
- Persistence Domain: The part of a platform within which data are guaranteed to be retained, or their retention completed, under specified failure conditions. It may involve media, controllers, buffers, and backup energy.
- Failure Atomicity: After recovery from a failure, an update appears either fully completed or not completed, rather than as an ambiguous partial update. The platform or transaction mechanism must define the atomic granularity and guarantee.
- Storage-Class Memory (SCM): A system role used to discuss the performance, capacity, and cost space between DRAM and NAND storage. It is not a single material or bitcell type.
- CXL: An interconnect protocol supporting memory-related access between processors and devices. It can attach volatile or persistent memory; the protocol name alone does not guarantee retention through power loss.
- Standalone EEPROM: Delivered as a separate memory IC, with an external interface to the host chip; a packaged I²C serial EEPROM is one example. Capacity, page-write behavior and timing describe the component interface, not its undisclosed internal poly stack.
- Embedded MTP IP: MTP describes programmability more than once. This site uses its embedded MTP IP chapter for floating-gate MTP/EEPROM macros; it is not a reclassification of MRAM, ReRAM, Flash or SONOS. Identify the actual storage mechanism, erase or overwrite behavior, process, update granularity and reliability for each implementation.
- Double-Poly EEPROM: The first poly layer forms the floating gate and a second poly layer forms the control gate, separated by an interpoly dielectric. This describes the NVM stack; a base-logic process label does not determine an optional memory module.
- Single-Poly MTP: One poly layer implements storage and the required gates, with MOS capacitors, wells or other specified terminals coupling the floating node. Single-poly implementations can still differ in carriers, program/erase paths, selectors and area costs.
- NVM Process Option: An optional memory process module on a selected foundry platform. Verify second-poly, tunnel-oxide and added-mask requirements for that module. Logic compatibility and zero added masks are separate integration claims.

## Source Records

- [INTRO-COURSE: Shimeng Yu: Lecture Six, Emerging NVM, Part One](https://www.youtube.com/watch?v=_Ov2KUZTIv8). University Course; 2021; accessed 2026-09-10; Location in the Source: 2021 course; comparison table at approximately 36:05–43:49, SCM at approximately 50:08, and arrays at approximately 1:00:04; Limitations: This page independently organizes the material and redraws the operating principles; it does not reproduce the complete lecture deck. Automatic captions cannot replace the original technical material.
- [INTRO-2016: Yu and Chen: Emerging Memory Technologies—Recent Trends and Prospects](https://asu.elsevierpure.com/en/publications/emerging-memory-technologies-recent-trends-and-prospects). Peer-Reviewed Review; 2016; Location in the Source: IEEE Solid-State Circuits Magazine 8(2), 43–56; DOI 10.1109/MSSC.2016.2546199; Limitations: A historical comparison baseline. Additions to the 2021 course and commercial status in 2026 are identified separately.
- [INTRO-IRDS: IEEE 2024 IRDS: Beyond CMOS and Emerging Research Materials](https://irds.ieee.org/images/files/pdf/2024/2024IRDS_BC.pdf). Technology Roadmap Assessment; 2024; Location in the Source: Sections 2 and 2.5; Limitations: Technology assessments and targets do not establish volume production of named products or a ranking under common measurement conditions.
- [ch-pat-efuse-poly: IBM: Locally Narrowed Electrical Fuse Patent US7417300B2](https://patents.google.com/patent/US7417300B2/en). Patent; Granted 2008-08-26; reviewed 2026-09-10; Location in the Source: Figures 3 and 4A; embodiment descriptions of electromigration and material backflow; claim 1; Limitations: Supports a specific polysilicon/silicide fuse structure and its engineering problems. A patent embodiment is not a commercial product reliability guarantee, nor does it establish that all eFuses use the same materials or state transition.
- [ch-pat-efuse-via: TSMC: Metal Via Fuse Patent US8847350B2](https://patents.google.com/patent/US8847350B2/en). Patent; Granted 2014-09-30; reviewed 2026-09-10; Location in the Source: Figures 1 and 5A; sections on current crowding and via contact placement; claim 1; Limitations: Supports a specific interconnect geometry and programming method. It does not provide process-independent programming current, area, or production yield figures.
- [ch-pat-antifuse: Kilopass: Ultrathin Dielectric Breakdown Cell Patent US6667902B2](https://patents.google.com/patent/US6667902B2/en). Patent; Granted 2003-12-23; reviewed 2026-09-10; Location in the Source: Figures 1, 3, and 8: selection, programming, and read; Figures 12–15: stress and breakdown-characteristic plots; Limitations: The 2.5 V, 7 V, and 1.5 V values in this material belong only to this early embodiment. They must not be reused as operating recommendations for current OTP IP, and this patent does not establish the topology of every commercial cell.
- [ch-pat-eeprom-window: Hughes Aircraft Company: Local Tunnel-Window EEPROM Patent US4115914A](https://patents.google.com/patent/US4115914A/en). Patent; Granted 1978-09-26; reviewed 2026-09-10; Location in the Source: Front page of the original publication; Figures 3i and 6; claims 2 and 9; parent application in the priority chain; Limitations: 1976-03-26 is the parent-application date found in the records; this application was filed in 1977. The earliest date in a priority chain is not a legal determination of the effective priority of every claim.
- [ch-pat-eeprom-singlepoly: Cypress Semiconductor: Buried-Control-Gate Single-Poly EEPROM Patent US5844271A](https://patents.google.com/patent/US5844271A/en). Patent; Granted 1998-12-01; reviewed 2026-09-10; Location in the Source: Figures 3–6; buried control electrode, thick/thin oxide regions, and operating descriptions; claim 1; Limitations: Demonstrates one single-poly EEPROM implementation. It does not establish that current Synopsys MTP uses this structure or the same hot-electron injection and tunneling paths.
- [ch-pat-nor-splitgate: Worldwide Semiconductor Manufacturing / TSMC: Split-Gate Flash Patent US6232180B1](https://patents.google.com/patent/US6232180B1/en). Patent; Granted 2001-05-15; reviewed 2026-09-10; Location in the Source: Assignment records from 1999 and 2000; Figure 6 and its operating table; claims 4 and 6; Limitations: This embodiment uses source-side injection and channel erase. Its operating table must not be combined with SuperFlash inter-gate FN erase in the same cross-section. Aggregated assignee metadata must be checked against the assignment timeline.
- [ch-pat-sonos: NCR: SONOS Blocking-Oxide Patent WO1981000790A1](https://patents.google.com/patent/WO1981000790A1/en). Patent; Published 1981-03-19; reviewed 2026-09-10; Location in the Source: Figure 1; descriptions of silicon nitride and the upper/lower oxides; claim 1; PCT priority information; Limitations: Provides an early SONOS stack and retention/program-erase tradeoffs. Its film thicknesses, biases, and cycling results must not be extrapolated to modern SONOS, MONOS, or 3D NAND.
- [ch-pat-nrom: Saifun: Asymmetric Charge-Trapping Patent US5768192A](https://patents.google.com/patent/US5768192A/en). Patent; Granted 1998-06-16; reviewed 2026-09-10; Location in the Source: Front page of the original publication; localized hot-electron programming and reverse-read sections; claims 1 and 23; Limitations: The original publication names Saifun; Spansion Israel in aggregated metadata reflects later corporate history. This patent alone does not establish the erase mechanisms or commercial specifications of every two-bit NROM implementation.
- [ch-pat-nand-vertical: Toshiba: Columnar-Semiconductor Vertical NAND Patent US7696559B2](https://patents.google.com/patent/US7696559B2/en). Patent; Granted 2010-04-13; reviewed 2026-09-10; Location in the Source: Figures 2 and 5–9; programming, erase, and bitline-discharge descriptions; claim 1; Limitations: A specific early columnar-sidewall embodiment. It is not a substitute for every modern gate-all-around cross-section and is not a complete patent history of planar NAND.
- [ch-product-mtp: Synopsys: MTP EEPROM NVM IP for Analog and Mixed-Signal Processes](https://www.synopsys.com/resources/mtp-eeprom-nvm-ip-for-analog-and-mixed-signal-process-nodes-datasheet.html). Manufacturer Product Introduction; No publication date stated; reviewed 2026-09-10; Location in the Source: Public introduction and learning points: floating gate, logic process, electrical erase, and hard macro; Limitations: Only the public introduction was reviewed; the detailed datasheet behind the registration form was not obtained. The product positioning and broad physical mechanism are confirmed. Undisclosed capacities, paired endurance/retention conditions, film stacks, and carrier paths are not inferred.
- [ch-product-sonos: Infineon: SONOS Embedded Flash IP Solutions](https://www.infineon.com/products/memories/embedded-flash-ip-solutions). Manufacturer Technology and Volume-Production Statement; No publication date stated; reviewed 2026-09-10; Location in the Source: SONOS technology section; production nodes; 2T cell and FN program/erase; macro-family specification list; Limitations: The 25 ns, 100,000-cycle, and ten-year retention figures are listed at family level without fully pairing each node, capacity, temperature, and post-cycling retention condition. They are not combined into one guaranteed specification. This evidence does not cover all NROM or 3D NAND implementations.
- [ch-tech-superflash: SST / Microchip: SuperFlash Technology Brochure DS00001425F](https://ww1.microchip.com/downloads/aemDocuments/documents/sst/product-documents/brochures/00001425F.pdf). Manufacturer Technical Brochure; 2018-03; reviewed 2026-09-10; Location in the Source: Pages 2–3; stacked-gate/split-gate comparison; source-side injection, inter-gate FN erase, and three structural generations; Limitations: Structures and mechanisms are read in the context of the identified SuperFlash generation. The 2018 shipment figures, node table, and typical reliability data are not guarantees for every product in 2026.
- [ch-tech-nand: Kioxia: NAND Flash Memory Fundamentals](https://www.kioxia.com/en-jp/rd/technology/nand-flash.html). Manufacturer Fundamentals Explanation; No publication date stated; reviewed 2026-09-10; Location in the Source: Figures 2–5; floating-gate and charge-trap storage; threshold voltage and series-string reading; Limitations: An introductory teaching source, not a complete operating specification for a particular chip. Generic illustrations do not establish the materials and biases of all planar or 3D NAND.
- [ch-tech-multilevel: Kioxia: Increasing Flash Capacity with Multilevel Cells](https://www.kioxia.com/en-jp/rd/technology/multi-level-cell.html). Manufacturer Fundamentals Explanation; No publication date stated; reviewed 2026-09-10; Location in the Source: Figure 5 and adjacent text; bits per cell, threshold-voltage states, and speed/lifetime tradeoffs; Limitations: Supports the requirement for 2 to the Nth power distinguishable states to store N bits and the qualitative tradeoffs. It does not provide universal endurance or speed ratios between TLC/QLC generations.
- [ch-tech-retention: Kioxia: Data Retention in the Managed Flash Endurance and Reliability Series](https://americas.kioxia.com/content/dam/kioxia/en-us/business/memory/mlc-nand/asset/KIOXIA_NAND_Flash_Data_Retention_Technical_Brief.pdf). Manufacturer Technical Brief; 2024-03; reviewed 2026-09-10; Location in the Source: Pages 1–2; P/E cycling, temperature, and data retention; Limitations: Supports evaluating NAND reliability under combined conditions. NAND values must not be transferred directly to EEPROM, SONOS, or OTP specifications.
- [ch-tech-ecc: Kioxia: NAND Error-Correction Code Technical Brief](https://www.kioxia.com/content/dam/kioxia/shared/business/memory/mlc-nand/asset/productbrief/KIOXIA_Understanding_ECC_Tech_Brief.pdf). Manufacturer Technical Brief; 2022-05; reviewed 2026-09-10; Location in the Source: Page 1; raw NAND, managed NAND, and the role of ECC; Limitations: Supports including error management in system comparisons. It does not supply a universal ECC strength, decoding latency, or spare-capacity ratio that can be applied directly throughout this material.
- [ch-tech-deepetch: Kioxia: Improving Memory-Hole Process Productivity with a New Etch Gas](https://www.kioxia.com/en-jp/rd/technology/topics/topics-62.html). Manufacturer Process Research; 2024-02-22; reviewed 2026-09-10; Location in the Source: Sections on memory-hole profile, etch rate, and high-aspect-ratio processing; Limitations: Describes a specific deep-hole etching study and process bottlenecks. Its improvement figures are not extrapolated to all equipment, stack heights, or production costs.
- [ch-paper-3dvariation: Y. Luo et al.: Early Retention Loss and Process Variation in 3D NAND](https://arxiv.org/abs/1807.05140). Abstract of Original Chip-Measurement Research; 2018; reviewed 2026-09-10; Location in the Source: Abstract: layer-to-layer process variation, early retention loss, and retention interference; Limitations: Only the abstract was reviewed to identify research questions. Unreviewed methods, sample counts, and quantitative improvements are not reused, and the distributions are not assumed to apply to all modern 3D NAND.
- [ch-paper-readdisturb: Y. Cai et al.: Read-Disturb Errors in MLC NAND Flash](https://arxiv.org/abs/1805.03283). Abstract of Original Chip-Measurement Research; Research account published 2018-05-08; corresponding DSN 2015 work; reviewed 2026-09-10; Location in the Source: Abstract: relationships among pass bias, accumulated cycling, and read disturb; Limitations: Only qualitative relationships are supported by the reviewed abstract. Unreviewed quantitative results are not reused, and 2Y nm MLC samples are not treated as equivalent to modern 3D QLC.
- [ch-maturity-ibm-efuse: IBM: eFUSE from Memory Redundancy to Autonomic Chips](https://research.ibm.com/publications/electrically-programmable-fuse-efuse-from-memory-redundancy-to-autonomic-chips). Manufacturer Research Abstract; 2007-09-16; reviewed 2026-09-10; Location in the Source: CICC 2007 abstract; IBM implementations and applications from 180 nm to 45 nm; Limitations: Establishes historical implementations at an identified company across an identified process range. The abstract does not enumerate product models, shipment volumes, or current platform qualifications; 32 nm and beyond were prospective at the time.
- [ch-maturity-kilopass: Synopsys: 2018 Kilopass Acquisition and OTP Shipment Statement](https://news.synopsys.com/2018-01-10-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Kilopass-Technology). Manufacturer Historical Product and Shipment Statement; 2018-01-10; reviewed 2026-09-10; Location in the Source: Highlights and product sections; antifuse 1T/2T, XPM, Gusto, SecretCode, and cumulative shipments; Limitations: More than 170 customers, 400 SoC designs, and 10 billion units were manufacturer statements in 2018, not an independent shipment audit conducted for this material. Portfolio-wide figures are not assigned to an individual model or node.
- [ch-maturity-otp-current: Synopsys: Current Antifuse OTP NVM IP Product Page](https://www.synopsys.com/designware-ip/memories-logic-libraries/non-volatile-memory/otp.html). Manufacturer Product and Validation Statement; No publication date stated; reviewed 2026-09-10; Location in the Source: Overview; process availability; TSMC advanced-node silicon validation and N5A/N7A automotive qualification; Limitations: Availability, silicon validation, automotive qualification, and volume-production shipments are different evidence levels. N5A/N7A AEC-Q100 Grade 1 qualifications are not extended to every node, nor are the claims restated as an unbreakable security guarantee.
- [ch-maturity-nor-product: Microchip: SST39SF020A Parallel Flash Product Page](https://www.microchip.com/en-us/product/SST39SF020A). Manufacturer Status for an Identified Product; No publication date stated; reviewed 2026-09-10; Location in the Source: Model, product status, and 2 Mb / 4.5–5.5 V parallel flash summary; Limitations: Listed as in production when reviewed. The 4.5–5.5 V range is this product's supply range, not an interface voltage for all NOR and certainly not the cell's tunneling bias.
- [ch-maturity-bics: Kioxia: BiCS FLASH Principles and Commercial Generations](https://www.kioxia.com/en-jp/rd/technology/bics-flash.html). Manufacturer Fundamentals and Commercial History; Page includes technical descriptions through 2023; reviewed 2026-09-10; Location in the Source: Commercial-generation section; stacked electrodes, memory holes, and charge-storage film in Figures 4–5; Limitations: 48 layers / 2015, 96 layers / 2018, 112 layers / 2020, and 162 layers / 2022 are the manufacturer's listed commercial history. This page is not treated as the latest 2026 layer-count ranking or a complete specification for each generation.
- [ch-mtp-standalone-microchip: Microchip: 24AA256/24LC256/24FC256 Standalone Serial EEPROM Datasheet](https://ww1.microchip.com/downloads/aemDocuments/documents/MPD/ProductDocuments/DataSheets/24AA256-24LC256-24FC256-256K-I2C-Serial-EEPROM-DS20001203.pdf). Manufacturer Datasheet; 2022 revision; reviewed 2026-09-10; Location in the Source: DS20001203Y pages 1–2: product, packages, and block diagram; Section 6: byte/page writes; Section 8: reads; Limitations: Establishes a standalone device, I2C interface, 64-byte page buffer, and internal erase/write control. The datasheet does not disclose the bitcell cross-section or polysilicon layer count; a teaching patent is not evidence of this product's implementation.
- [ch-mtp-synopsys: Synopsys: Single-Poly Floating-Gate MTP EEPROM IP](https://www.synopsys.com/designware-ip/memories-logic-libraries/non-volatile-memory/mtp-eeprom.html). Manufacturer Product Page; No publication date stated; reviewed 2026-09-10; Location in the Source: Product overview paragraphs 1–2; first Highlights item; integrated high-voltage circuitry description; Limitations: Confirms single-poly floating-gate storage and zero added masks for this product family. Control-terminal cross-sections and carrier paths are not disclosed. Family maxima and qualifications for selected nodes cannot be combined into a guarantee for every macro.
- [ch-mtp-xfab-xc06: X-FAB: Historical XC06 Double-Poly Embedded EEPROM Process Brief](https://www.fbe-asic.com/documents/is-xc06.pdf). Manufacturer-Authored Process Document; Rev 09/2003; reviewed 2026-09-10; Location in the Source: Page 1 Main Process Features: Flash/EEPROM tunnel oxide and double-poly stack; page 2 EEPROM macros; revision footer; Limitations: A 2003 X-FAB-authored document publicly hosted by FBE ASIC. Used only as a historical foundry example. Current availability, the complete EEPROM cross-section, and carrier paths are not established. Base-CMOS single-poly specifications cannot substitute for the NVM-option stack.
- [ch-mtp-ymc-product: Yield Microelectronics: Logic-Process Embedded MTP IP](https://www.ymc.com.tw/index_en.php). Manufacturer Company and Product Introduction; No publication date stated; reviewed 2026-09-10; Location in the Source: About YMC paragraph: ymtp core technology, logic-process-based MTP eNVM, and licensing customers; Limitations: Confirms YMC's MTP IP business and customer types. This paragraph does not disclose the polysilicon count, bitcell, or program/erase mechanism of every product.
- [ch-mtp-ymc-singlepoly: Yield Microelectronics: Single-Floating-Gate NVM Patent US7423903B2](https://patents.google.com/patent/US7423903B2/en). Patent; Granted 2008-09-09; reviewed 2026-09-10; Location in the Source: Figures 1, 2A, and 2B; fabrication paragraphs describing one polysilicon deposition and patterning; original-assignee field; Limitations: Establishes a disclosed YMC single-poly implementation connecting transistor and capacitor gates into one floating node. It does not identify the cell of every current ymtp product; bias conditions and transfer directions must be read separately for each embodiment.
- [ch-mtp-ememory-neoee: eMemory: NeoEE Single-Poly Embedded EEPROM](https://www.ememory.com.tw/en-US/Products/MTP/NeoEE). Manufacturer Technical Product Page; No publication date stated; reviewed 2026-09-10; Location in the Source: Opening single-poly description; Technical Principles: capacitive-coupling MOS devices, selectors, and FN charge transfer in both directions; Limitations: Confirms the identified single-poly floating-gate technology and FN program/erase principles. Complete terminal biases, cross-section dimensions, and paired reliability ratings for a target macro were not obtained.
- [ch-mtp-ememory-neomtp: eMemory: NeoMTP Single-Poly p-Type Floating-Gate Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP). Manufacturer Technical Product Page; No publication date stated; reviewed 2026-09-10; Location in the Source: Opening single-poly and additional-erase-gate descriptions; Technical Principles: p-type FG-MOSFET, CHEI, and FN erase destination; Limitations: The manufacturer describes channel-hot-hole-induced hot-electron injection and FN electron transfer from floating gate to erase gate. Do not substitute an n-channel/source-erase cross-section or extend this mechanism to NeoEE or other vendors' MTP.
- [ch-mtp-floadia-zt: Floadia: LEE Flash ZT Zero-Added-Mask MTP](https://floadia.com/product/lee-flash-zt/). Manufacturer Product Page; No publication date stated; reviewed 2026-09-10; Location in the Source: Product Info; Major Features items 4–5; FN program/erase paragraph; Limitations: Confirms MTP, standard CMOS, zero added masks, and FN programming/erase. This page does not explicitly state the polysilicon count. Cycle figures differ across page sections and are not adopted as a common guarantee.
- [ch-mtp-floadia-zt-fg: Floadia and Maxchip: Public Floating-Gate LEE Flash ZT MTP Integration](https://floadia.com/news/422/). Manufacturer Announcement; 2016-05-20; reviewed 2026-09-10; Location in the Source: 2016-05-20 title and announcement; paragraph identifying floating-gate storage and FN program/erase; Limitations: An identified historical integration on Maxchip 0.18 um BCD supports floating-gate storage and FN program/erase. The polysilicon count is not stated and cannot be inferred from zero added masks. These generation-specific ratings do not apply to all current ZT products.
- [EMG-SEC: Everspin 2025 Product and Manufacturing Filing](https://www.sec.gov/Archives/edgar/data/1438423/000162828026014733/mram-20251231.htm). Company Regulatory Filing; 2026-03-04; Accessed 2026-09-10; Location in the Source: 2025 product overview and manufacturing sections; the SEC index confirms a filing date of 2026-03-04 and an acceptance time of 17:20:43; Limitations: Production and shipment claims apply to named products; specifications for one product must not be applied to the entire MRAM family.
- [EMG-XSPI: Everspin 64Mb High-Reliability xSPI Production Qualification](https://investor.everspin.com/news-releases/news-release-details/everspin-advances-high-reliability-xspi-mram-portfolio-256mb). Manufacturer Announcement; 2026-03-05; Accessed 2026-09-10; Location in the Source: 64Mb qualification, ordering availability, and distributor inventory; schedules for other densities; Limitations: The announcement describes 128Mb/256Mb qualification as planned. A passed target date does not establish completion.
- [EMG-RA8: Renesas RA8M2/RA8D2 MCUs with Embedded MRAM](https://www.renesas.com/en/about/newsroom/renesas-adds-two-new-mcu-groups-blazing-fast-ra8-series-1ghz-performance-and-embedded-mram). Manufacturer Product Announcement; 2025-10-22; Accessed 2026-09-10; Location in the Source: Sections on 1MB MRAM, 22nm ULL, and availability; Limitations: 1GHz is the CPU clock frequency, not the MTJ write frequency. External Flash options are excluded from MRAM capacity.
- [EMG-DBH: Weebit/DB HiTek Technology Qualification and Product Adoption](https://www.weebit-nano.com/news/press-releases/weebit-nano-signs-largest-customer-to-date-technology-qualified-at-db-hitek/). Manufacturer Quarterly Update; 2026-01-30; Accessed 2026-09-10; Location in the Source: DB HiTek 130nm BCD qualification and customer tape-out progress; Limitations: Technology qualification, licensing revenue, and volume shipments of customer products are distinct milestones.
- [EMG-S130: Weebit SkyWater S130 Reliability Validation](https://www.weebit-nano.com/wp-content/uploads/2025/11/251124.-2025-Annual-General-Meeting-%E2%80%93-Chair-Address-and-CEO-Presentation.pdf). Manufacturer Technical Presentation; 2025-11-24; Accessed 2026-09-10; Location in the Source: Page 18; S130/1T1R test vehicle and reliability conditions; Limitations: The 150°C and cycling data apply to this test vehicle and must not be transferred to other foundries, nodes, or capacities.
- [EMG-STPCM: ST Stellar SR6P6C8 MCU with Phase-Change Memory](https://www.st.com/en/automotive-microcontrollers/sr6p6c8.html). Manufacturer Product Page; 2026-09-10; Accessed 2026-09-10; Location in the Source: Production status label, PCM description, and ordering-code quality table; Limitations: The date is the verification date. Other devices in the same family may still be in design or engineering-sample stages.
- [EMG-FRAM: Infineon 16Mb EXCELON F-RAM Datasheet](https://www.infineon.com/assets/row/public/documents/10/49/infineon-cy15b116qi-cy15v116qi-16mb-excelon-tm-lp-ferroelectric-ram-f-ram-datasheet-en.pdf). Manufacturer Datasheet; 2022-05-25; Accessed 2026-09-10; Location in the Source: Rev. C; pages 1, 7, 27, and 30–31; Limitations: Commercial operating temperature, retention temperature, and SPI clock frequency must be distinguished. Commercial F-RAM endurance must not be attributed to FeFET/FTJ.
- [EMG-ADESTO: Adesto 2019 CBRAM Commercial Shipment Filing](https://www.sec.gov/Archives/edgar/data/1395848/000155837020002795/iots-20191231x10k.htm). Company Regulatory Filing; 2020; Accessed 2026-09-10; Location in the Source: CBRAM product and commercial shipment sections; Limitations: Evidence of historical shipments; continued availability of the original part numbers in 2026 has not been verified.
- [EMG-SOT23: imec Extremely Scaled SOT-MRAM Device Demonstration](https://www.imec-int.com/en/press/imecs-extremely-scaled-sot-mram-devices-show-record-low-switching-energy-and-virtually). Research Institution Announcement; 2023-12-13; Accessed 2026-09-10; Location in the Source: Experiments on 300mm wafers and approximately 50nm devices; Limitations: The summary does not provide the complete pulse, temperature, sample, and error-rate matrix. Device energy is not memory-macro energy.
- [EMG-SOT24: imec: Functional SOT-MRAM Arrays and Cache Research](https://www.imec-int.com/en/articles/bringing-sot-mram-technology-closer-last-level-cache-memory-specifications). Research institute technical article; 2024-12-16; Location in the Source: Three-terminal SOT structure, separate read/write paths, and magnetic-field requirements; Limitations: A research mechanism, not SOT volume production; the diagram explicitly includes an assist field and makes no field-free claim.
- [EMG-KIOXIA: KIOXIA: FeFET Trapping and Polarization Stability](https://www.kioxia.com/en-jp/rd/technology/topics/topics-67.html). Manufacturer original research description; 2024-04-09; Location in the Source: Figures 1–3, IEDM 2023 reference; polarization, trapped charge, and memory window; Limitations: Uses a simplified n-channel MFIS electrostatic model, not a reproduction of the metal-doped TCIL process.
- [EMG-FTJ24: Original Research: Atomic-Scale BSO Ferroelectric Tunnel Junctions](https://www.nature.com/articles/s41467-024-44927-7). Original research paper; 2024; Location in the Source: Figures 3a/3b: polarization, accumulation/depletion, and barriers in Cr/Au–BSO–NSTO; Limitations: The low-resistance mapping for P toward NSTO is limited to this named stack; HRS can include thermally assisted tunneling.
- [EMG-VCM08: Resistive Switching Mechanisms in Metal/Oxide/Metal Devices](https://www.nature.com/articles/nnano.2008.160). Original Research Paper; 2008-06-15; Accessed 2026-09-10; Location in the Source: Abstract and accessible figure captions; Limitations: The main text is subscription-restricted. This review does not claim access to all experimental details.
- [EMG-PCMDRIFT: IBM: Temporal Resistance Evolution in Projected PCM](https://research.ibm.com/publications/state-dependence-and-temporal-evolution-of-resistance-in-projected-phase-change-memory). Author-institution original paper record; 2020-05-19; Location in the Source: Abstract: state-dependent resistance and temporal drift; Limitations: Supports the read-drift caveat only; a projection branch is not drawn as mandatory for general PCM.
- [EMG-PCMEND: IBM Research on PCM Cycling Endurance and Atomic Migration](https://research.ibm.com/publications/phase-change-memory-cycling-endurance). Author Institution Paper Record and Abstract; 2019-09-05; Accessed 2026-09-10; Location in the Source: MRS Bulletin; cycling failure mechanisms; Limitations: Mechanisms depend on the material. General discussion cannot support a lifetime commitment for an arbitrary product.
- [EMG-PCMPROJ: IBM Low-Drift Projected PCM Devices](https://research.ibm.com/publications/design-of-projected-phase-change-memory-mushroom-cells-for-low-resistance-drift). Author Institution Paper Record and Abstract; 2022-09-18; Accessed 2026-09-10; Location in the Source: Projection branch and mushroom-shaped phase-change devices; Limitations: The research structure is not an established cross section of ST ePCM or another commercial product.
- [EMG-FEPUF: Original Research on FeFET Cycle Variation and Charge-Domain PUFs](https://www.nature.com/articles/s41467-024-55380-x). Original Research Paper; 2024; Accessed 2026-09-10; Location in the Source: Reconfigurable PUF structure, cycle variation, and validation; Limitations: PUF reconfigurability does not establish reproducibility in arbitrary environments, nor does it independently demonstrate resistance to attacks.
- [EMG-FMC: FMC Industry News and Ferroelectric Memory Classification](https://www.ferroelectric-memory.com/industry-news/). Manufacturer News Collection; 2026-09-10; Accessed 2026-09-10; Location in the Source: Links to 2025 ferroelectric capacitor-based nonvolatile DRAM news and a 2026 interview; Limitations: The date is the verification date. News headlines alone cannot establish the respective production status of FeFET and capacitor-based memory.
- [EMG-P-STT: IBM: Spin-Torque Structure Patent US5695864A](https://patents.google.com/patent/US5695864A/en). Published patent; 1997-12-09; Location in the Source: Abstract and claim 1: fixed and variable moments and current through the stack; Limitations: An early magnetic structure, not a complete disclosure of modern perpendicular MgO MTJ processing.
- [EMG-P-TOGGLE: Motorola: Toggle Writing Patent US6545906B1](https://patents.google.com/patent/US6545906B1/en). Published patent; 2003-04-08; Location in the Source: Figures 4–6; SAF free layer, t0–t4 pulse sequence, and read-before-toggle description; Limitations: Applies to the nearly balanced SAF toggle embodiment; drawn intermediate angles are illustrative.
- [EMG-P-SOT: Spin Memory Scalable SOT Device Process Patent](https://patents.google.com/patent/US10930843B2/en). Published Patent; 2021-02-23; Accessed 2026-09-10; Location in the Source: Figures 3–6 and 7A–7F; claims 1–13; Limitations: The original assignee and subsequent assignment history are distinguished. Area effects are not treated as production measurements.
- [EMG-P-VCM: HP: Multilayer Oxide Switching Patent US8331131B2](https://patents.google.com/patent/US8331131B2/en). Published patent; 2012-12-11; Location in the Source: Figures 3 and 5; ionic/defect redistribution and pulse conditions; Limitations: The patent-specific multilayer and two-stage pulse are not mandatory for every VCM.
- [EMG-P-ECM: Axon: Programmable Metallization Cell Patent US5761115A](https://patents.google.com/patent/US5761115A/en). Published patent; 1998-06-02; Location in the Source: Vertical embodiment, Figures 4A/4B; metal source, cathode nucleation, and reverse-bias retraction; Limitations: The diagram selects an active Ag upper electrode and inert lower electrode; different kinetics can alter nucleation sites.
- [EMG-P-PCM: Multilevel Phase-Change Memory Programming Patent](https://patents.google.com/patent/US5912839A/en). Published Patent; 1999-06-15; Accessed 2026-09-10; Location in the Source: Figure 1; claims 1, 18, and 23; Limitations: Its specific cumulative read method does not mean that ordinary PCM resistance reads are all destructive.
- [EMG-P-FERAM: Ramtron: Self-Restoring Ferroelectric Memory Patent US4873664A](https://patents.google.com/patent/US4873664A/en). Published patent; 1989-10-10; Location in the Source: Figure 3: 1T1C and reference branch; Figures 1/3 and read, latch, plate-line fall, and restore description; Limitations: The two drawn branches are alternative initial states of one cell, not a merged circuit from Figures 3 and 4.
- [EMG-P-HFO: Layered Doping of HfO₂ Ferroelectric Films Patent](https://patents.google.com/patent/US10153155B2/en). Published Patent; 2018-12-11; Accessed 2026-09-10; Location in the Source: Figures 1/2 and 4; claim 1; Limitations: A material-formation method; this patent does not provide a complete FeFET array and system design.
- [EMG-P-FEFET: FeFET Gate Stack and Device Integration Patent](https://patents.google.com/patent/US11502083B2/en). Published Patent; 2022-11-15; Accessed 2026-09-10; Location in the Source: Figures 2 and 3A–3F; claim 1; Limitations: Improvements in a specific stack do not establish production qualification or universally applicable endurance values.
- [EMG-P-FTJ: TSMC FTJ Structure and Low-Temperature Formation Application](https://patents.google.com/patent/US20240057343A1/en). Published Patent Application; 2024-02-15; Accessed 2026-09-10; Location in the Source: Figure 17; claims 1 and 17; Limitations: The reviewed document is the A1 publication. The granted scope of a B2 family member requires a separate comparison.
- [EMG-TSMC-SOT: TSMC 2025 Annual Report: Type-C SOT-MRAM Research](https://investor.tsmc.com/static/annualReports/2025/english/pdf/2025_tsmc_ar_e_ch5.pdf). Supplier Annual Report: R&D Results; 2026; Accessed 2026-09-10; Location in the Source: Printed pages 104–105; page 4 of the chapter PDF; IEDM 2025 Type-C section; Limitations: A research demonstration. Qualification of other TSMC MRAM platforms does not establish SOT volume production; area and current improvements must retain their comparison baseline.
- [CMP-YU2016: Yu and Chen: Emerging Memory Technologies—Recent Trends and Prospects](https://knowen-production.s3.amazonaws.com/uploads/attachment/file/5249/yu2016.pdf). Original Technical Review; 2016; Location in the Source: IEEE Solid-State Circuits Magazine 8(2), 43–56; p44, Table 1; DOI 10.1109/MSSC.2016.2546199; Limitations: The original table includes only STT-MRAM, PCRAM, and RRAM in its emerging-technology columns. Representative values and cell-level energy estimates are not guarantees for modern products.
- [CMP-LECTURE2021: Shimeng Yu: Comparison Table from Lecture 6, 2021](https://www.youtube.com/watch?v=_Ov2KUZTIv8&t=2165s). Lecture and Supplied Screenshot; 2021-11-01; Location in the Source: Slide p14, dated 2021/11/1; comparison segment at 36:05–43:49; every table cell was checked against the screenshot at its original size; Limitations: The course cites and extends the 2016 paper, adding SOT-MRAM, FeRAM, and FeFET. This website retains the historical values without presenting them as universal specifications for 2026.
- [CMP-FRAM-PRODUCT: Infineon CY15B104QSN-108SXI Product Status](https://www.infineon.com/part/CY15B104QSN-108SXI). Supplier Product Page; Verified 2026-09-10; Location in the Source: Product status, 4 Mb capacity, and interface specifications; Limitations: Active supply status applies to the specified part number; it cannot be generalized to every ferroelectric-memory implementation.
- [CMP-FRAM-DS: Infineon CY15B104QSN/CY15V104QSN Datasheet](https://www.infineon.com/dgdl/Infineon-CY15B104QSN_CY15V104QSN_4Mb_EXCELON_Ultra_Ferroelectric_RAM_F-RAM_Serial_quad_SPI_512K_8_108_MHz_industrial-DataSheet-v15_00-EN.pdf?fileId=8ac78c8c7d0d8da4017d0ee59c446d71). Product Datasheet; 2024-07-25; Location in the Source: 002-18293 Rev. *N; p1 and p105, Table 63; Limitations: The 151-year retention rating applies at 65°C; retention at 85°C is 10 years. Interface frequency is not cell read or write latency.
- [CMP-MRAM-PRODUCT: Everspin MR25H40 Products and Part Numbers](https://www.everspin.com/products/series/mr25h40). Supplier Product Page; Verified 2026-09-10; Location in the Source: Toggle MRAM technology field, production status, and part numbers by temperature grade; Limitations: Supply status and temperature grades vary by part number. Toggle MRAM specifications do not describe STT or SOT implementations.
- [CMP-MRAM-DS: Everspin MR20H40/MR25H40 Datasheet](https://www.everspin.com/sites/default/files/EST00459_MR2xH40_Datasheet_Rev12.6_08092020.pdf). Product Datasheet; 2020-08; Location in the Source: Revision 12.6; p1 product features and interface description; Limitations: Unlimited read/write cycling is the supplier's specification for this product, not a physical law that all MRAM can never fail.
- [CMP-EVERSPIN2024: Everspin 2024 Annual Filing](https://www.sec.gov/Archives/edgar/data/1438423/000155837025001827/mram-20241231x10k.htm). Statutory Company Filing; Filed in 2025; fiscal year 2024; Location in the Source: STT-MRAM product and shipment disclosures; Limitations: Supports commercial shipments of 256 Mb and 1 Gb STT-MRAM. It does not establish volume production for unlisted densities or technologies.
- [CMP-EVERSPIN2026: Everspin High-Reliability xSPI MRAM Production Qualification Progress](https://investor.everspin.com/news-releases/news-release-details/everspin-advances-high-reliability-xspi-mram-portfolio-256mb). Supplier Announcement; 2026-03-05; Location in the Source: Completed qualification and orderability of 64 Mb; expected schedules for 128 Mb/256 Mb; Limitations: Only completed milestones establish completion. Passing a forecast date does not automatically demonstrate that the plan was fulfilled.
- [CMP-RERAM-PRODUCT: RAMXEED ReRAM Product Family](https://www.ramxeed.com/zh-tw/products/reram-products/). Supplier Product Page; Verified 2026-09-10; Location in the Source: Production-status fields for MB85AS8MT and MB85AS12MT; Limitations: The 8 Mb device is listed as in mass production; the 12 Mb device requires an inquiry. A datasheet or sampling announcement is not evidence of volume production.
- [CMP-RERAM-DS: RAMXEED MB85AS8MT Datasheet](https://www.ramxeed.com/assets/images/products/datasheet/ReRAM/MB85AS8MT-DS2v2-E.pdf). Product Datasheet; 2024; Location in the Source: DS501-00060-2v2-E; p8, p12–13, p17, and p20; Limitations: Product tWC includes the internal nonvolatile-write sequence and differs from a switching pulse measured on a research cell. Endurance is specified per 4 bytes.
- [CMP-PCM-PRODUCT: ST SR6P6C8 Microcontroller with Embedded PCM](https://www.st.com/en/automotive-microcontrollers/sr6p6c8.html). Supplier Product Page; Verified 2026-09-10; Location in the Source: Production status at the top of the page, memory features, and the quality-and-reliability part-number table; Limitations: Supports volume production of SR6P6C8 and its listed part numbers. It does not establish the status of every Stellar device or PCM implementation.
- [CMP-TSMC-STT2019: TSMC 22 nm STT-MRAM: Reflow, Automotive Reliability, and Performance Options](https://research.tsmc.com/page/mram/1.html). Authors' Research Abstract; 2019; Location in the Source: Gallagher et al., 2019; 20 Mb design and alternative MTJ options; Limitations: The 6 ns sensing result and write time slightly above 30 ns belong to a performance option that gives up reflow retention. They cannot be combined with the separate high-retention option.
- [CMP-KIOXIA2026: Kioxia/Sandisk Research on 10th-Generation 2 Tb QLC NAND](https://www.kioxia.com/en-jp/rd/technology/topics/topics-92.html). Author-Institution Research Article; 2026-07-15; Location in the Source: ISSCC 2026; DOI 10.1109/ISSCC49663.2026.11409136; 332 layers and die-level density; Limitations: Die-level Gb/mm² and write throughput cannot be substituted directly for cell F² or host-visible SSD performance. Publication of research does not by itself establish volume production across the product range.
- [CMP-OPTANE-PERF: Intel Optane P5800X Performance and Test Conditions](https://edc.intel.com/content/www/us/en/products/performance/benchmarks/intel-optane-ssd-p5800x-series/). Supplier System Measurement; Tested 2021-03-18; Location in the Source: Items 11 and 12; Xeon 8380, Ubuntu 20.04.2, and FIO 3.16; Limitations: Average latency for 512 B and 4 KB random reads. These values are not tail latency, cell switching time, or evidence of new-product availability in 2026.
- [CMP-MICRON2021: Micron 3D XPoint and Data-Center Portfolio Strategy Update](https://investors.micron.com/news/press-release/2021/Micron-Updates-Data-Center-Portfolio-Strategy-to-Address-Growing-Opportunity-for-Memory-and-Storage-Hierarchy-Innovation-03-16-2021/default.aspx). Supplier Announcement; 2021-03-16; Location in the Source: Immediate discontinuation of 3D XPoint development and a shift toward CXL-related investment; Limitations: Establishes the end of development; it does not mean that manufacturing or shipments of all existing products stopped on the same date.
- [CMP-MICRON-CALL2021: Micron 3D XPoint Strategy-Update Prepared Remarks](https://investors.micron.com/static-files/c858cbb2-bfd2-4f84-ba10-f69b385cf4bf). Company Investor-Call Document; 2021-03-16; Location in the Source: p4: manufacturing to end after industry commitments are fulfilled; Limitations: Manufacturing withdrawal follows existing commitments. The document does not determine the last shipment date for every part number.
- [CMP-MICRON-LEHI2021: Micron Completes the Sale of the Lehi Fab](https://www.micron.com/about/blog/company/partners/sale-of-lehi-fab). Supplier Announcement; Transaction closed 2021-10-22; Location in the Source: Transaction closing date and background on 3D XPoint production; Limitations: The fab sale is a separate event; it does not mean that all systems or support services ended at the same time.
- [CMP-INTEL2023: Intel Optane Customer Letter](https://cdrdv2-public.intel.com/774331/IOG-DCL-March%202023.pdf). Supplier Lifecycle Announcement; 2023-03-21; Location in the Source: Discontinuation of further development in July 2022; inventory and support statements; Limitations: Availability through 2025 was a demand-dependent inventory forecast made at the time. Support resources through 2030 are not a commitment to continued manufacturing.
- [CMP-SNIA-PM: SNIA Definition of Persistent Memory](https://www.snia.org/education/what-is-persistent-memory). Industry-Organization Technical Explanation; Verified 2026-09-10; Location in the Source: Nonvolatility, byte addressability, low latency, and CXL attachment; Limitations: The definition and use of persistent memory depend on context; the term SCM has not been used identically across different periods.
- [CMP-CXL2022: CXL 3.0 Specification](https://computeexpresslink.org/wp-content/uploads/2024/02/CXL-3.0-Specification.pdf). Original Specification; 2022-08-01; Location in the Source: Version 3.0, p636: flags for volatile and persistent memory ranges; Limitations: Protocol support for persistence does not mean that every CXL device contains persistent media or shares the same failure-protection domain.
- [CMP-CXL-FAQ2021: CXL Consortium Persistent-Memory Webinar Questions and Answers](https://computeexpresslink.org/blog/questions-from-the-compute-express-link-cxl-supporting-persistent-memory-webinar-2407/). Standards-Organization Technical Q&A; 2021-07-27; Location in the Source: CXL.mem, multiple media types, controllers, and device forms; Limitations: Supports treating media and attachment as separate concepts. The concepts discussed do not guarantee that a particular product implements every optional capability.
- [CMP-SAMSUNG-CMM: Samsung CXL Memory and CMM-D](https://semiconductor.samsung.com/cxl-memory/). Supplier Product-Technology Explanation; Verified 2026-09-10; Location in the Source: CMM-D name, DRAM media, and CXL interface; Limitations: DRAM memory expansion and sharing do not imply data retention through power loss.
- [CMP-CXL2026: DRAM, NAND, and Backup Energy in CXL Persistent Memory](https://computeexpresslink.org/blog/from-nvdimm-n-to-cxl-persistent-memory-bringing-persistence-to-the-memory-fabric-4635/). Member Technical Article Published by the CXL Consortium; 2026-05-25; Location in the Source: Netlist: NVDIMM-N and CXL save/restore architectures; Limitations: An architectural explanation, not direct evidence that a specific CXL persistent-memory product is in volume production. The DRAM cells themselves remain volatile.
- [CMP-IBM-SELECTOR2017: IBM: Memory Selector Devices and Crossbar Array Design](https://research.ibm.com/publications/memory-selector-devices-and-crossbar-array-design-a-modeling-based-assessment). Author-Institution Research Abstract; 2017-09-02; Location in the Source: An Chen; nonlinearity, rectification, and array trade-offs for two-terminal selectors; Limitations: Selector capabilities must be assessed together with the storage device and array conditions. A single nonlinearity ratio cannot establish complete-system feasibility.
- [CMP-IBM-ARRAY2014: IBM: Design Space for Resistive-Memory Arrays with MIEC Selectors](https://research.ibm.com/publications/exploring-the-design-space-for-resistive-nonvolatile-memory-crossbar-arrays-with-mixed-ionic-electronic-conduction-miec-based-access-devices). Authors' Research Abstract; 2014-06-22; Location in the Source: DRC 2014; selector leakage, write power, wire resistance, and array size; Limitations: This study uses a specific MIEC selector and circuit simulations. It illustrates trade-offs; it does not establish that the same factor limits every crossbar array.
- [CMP-NIST-VERIFY2017: NIST: Impact of RRAM Read Fluctuations on Program Verify](https://www.nist.gov/publications/impact-rram-read-fluctuations-program-verify-approach). Original-Research Page at the Authors' Institution; 2017-05-22; Location in the Source: Nminibapiel et al.; IEEE Electron Device Letters; false reads and distribution tails; Limitations: Experiments on a specific oxide RRAM show that read fluctuations can mislead verification. They do not imply that every program-verify method is ineffective.
- [CMP-IBM-PCM2020: IBM: Precision Limits of Closed-Loop PCM Programming](https://research.ibm.com/publications/precision-of-synaptic-weights-programmed-in-phase-change-memory-devices-for-deep-learning-inference). Authors' Research Abstract; 2020-12-12; Location in the Source: IEDM 2020; array experiments with more than 1,000 PCM devices; Limitations: Read-noise and drift results for analog-weight programming cannot be treated directly as product specifications for every digital PCM implementation.
- [CMP-TSMC-ECC2023: TSMC and Collaborators: Read Compensation and ECC in an RRAM Macro](https://research.tsmc.com/page/artificial-intelligence/3.html). Authors' Research Abstract; 2023; Location in the Source: 2023, 40 nm RRAM compute macro; offset, leakage, IR drop, and error rate after calibration; Limitations: The compute-macro demonstration illustrates the importance of peripheral circuits and calibration. Its compute efficiency and error rate do not represent all storage-oriented RRAM.
- [CMP-PMDK: PMDK libpmem Persistence Operations](https://pmem.io/pmdk/libpmem/). Original Software-Project Documentation; Verified 2026-09-10; Location in the Source: Cache flushing and hardware-buffer draining for persistence; platform differences; Limitations: An educational example of persistence semantics. Implementations still require the correct API for the platform and software version; this is not a universal processor-instruction sequence.
- [CMP-SNIA-ATOMICS2017: SNIA: Persistent Memory Atomics and Transactions](https://www.snia.org/sites/default/files/technical-work/whitepapers/SNIA-Persistent-Memory-Atomics-Transactions-WP.pdf). Industry-Organization Technical White Paper; 2017-01-10; Location in the Source: p14 and related sections: flush ordering, linked data structures, and failure atomicity; Limitations: Atomic-write granularity in the examples belongs to the assumed machine architecture. Persistence and transaction atomicity must not be conflated.
- [CMP-SNIA-NPM: SNIA NVM Programming Model](https://www.snia.org/sites/default/files/technical-work/npm/release/SNIA-NVM-Programming-Model-v1.pdf). Original Technical Specification; Version 1; historical specification; Location in the Source: Version 1; Section 10.2.4 and p59: synchronization, persistence domains, and atomicity boundaries; Limitations: Used for fundamental semantics and the development of the concepts. This does not claim that the cited version is the latest implementation specification in 2026.
- [FND-GF-2020-MRAM: GF: 22FDX eMRAM Production Announcement](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram). Supplier Press Release; 2020-02-27; Accessed 2026-09-10; Location in the Source: Sections on production, reliability, and macros; Limitations: Applies to the platform and macro conditions disclosed at the time; cannot be generalized to all MRAM.
- [FND-GF-2020-CBRAM: GF and Dialog: 22FDX CBRAM Licensing Agreement](https://investors.gf.com/node/6441/pdf). Joint Supplier Press Release; 2020-10-19; Accessed 2026-09-10; Location in the Source: Sections on licensing and the planned availability year; Limitations: Establishes a planned schedule only. CBRAM and the later OxRAM offering must not be treated as the same material system or version.
- [FND-GF-2022-MAP: GF 2022 Investor Presentation: Platform Feature Roadmap](https://investors.gf.com/static-files/65f5f1b9-2aea-47a3-8455-10413c6560f4). Supplier Investor Presentation; 2022; Accessed 2026-09-10; Location in the Source: Investing for a Bold Future chart; Limitations: The color legend and graphical associations have not been verified. Flattened text is not used to declare that a platform is in volume production, and MRAM-G2 is not independently mapped to later naming.
- [FND-GF-2023-MAP: GF 2023 Investor Presentation: Platforms and Features](https://investors.gf.com/static-files/9aecbb31-1a7a-43a5-b1ed-d5e0d4380cee). Supplier Investor Presentation; 2023; Accessed 2026-09-10; Location in the Source: Platform feature roadmap on page 32; Limitations: Text extraction loses the association between individual features and the production/development legend. It does not establish that 12LP MRAM is in volume production.
- [FND-GF-2024-AUTO: GF: Automotive Platform Innovation and 12LP+ AutoPro150](https://gf.com/news-and-events/blog/driving-automotive-innovation-on-the-semiconductor-superhighway/). Supplier Technical Blog; 2024-06-11; Accessed 2026-09-10; Location in the Source: Sections on eMRAM and 12LP+ features; Limitations: Does not provide a completed qualification date, production date, or full electrical conditions for the MRAM macro. Power improvements in the logic platform are not MRAM metrics.
- [FND-GF-2025-MCU: GF: Automotive MCUs and Software-Defined Vehicles](https://gf.com/news-and-events/blog/inside-a-cars-digital-brain-mcus-the-engine-powering-sdv-innovation/). Supplier Technical Blog; 2025-05-22; Accessed 2026-09-10; Location in the Source: Sections on 12LP+ MRAM and 22FDX MRAM; Limitations: These are platform and application claims; they do not provide macro-specific evidence of volume production or completed qualification for 12LP+ MRAM.
- [FND-GF-2025-RRAM: GF 2025 Technology Summit: 22FDX+ RRAM Available for Prototyping](https://gf.com/news-and-events/news/globalfoundries-announces-availability-of-22fdx-rram-technology-for-wireless-connectivity-and-ai-applications/). Supplier Technology Summit Press Release; 2025-08-28; Accessed 2026-09-10; Location in the Source: Subtitle, OxRAM section, and final design-kit section; Limitations: The maturity wording in the opening paragraph of the regional Chinese page differs from the English original. This timeline follows the English original's distinction between prototyping and future volume production and does not repeat the mistranslated production claim.
- [FND-GF-2026-AUTO: GF: FDX+ AutoPro150 eMRAM Available for Prototyping](https://gf.com/news-and-events/news/globalfoundries-announces-availability-of-autopro-150-emram-technology-on-enhanced-fdx-platform-for-advanced-automotive-applications/). Supplier Press Release; 2026-03-09; Accessed 2026-09-10; Location in the Source: Subtitle, performance section, design kits, and volume-production target; Limitations: The announcement does not disclose a joint test matrix for all metrics, ECC, or the failure distribution. No subsequent announcement confirming completed volume-production ramp was obtained as of the verification date.
- [FND-GF-CURRENT-FDX: GF Current FDX Platform and Embedded Memory Page](https://gf.com/technologies/cmos/fdx-fd-soi/). Dynamic Supplier Product Page; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: MRAM, RRAM, and AutoPro150 sections; Limitations: The page has no version or update date. Its performance claims are not treated as confirmation that a new version has entered volume production, and twenty-year retention and the maximum cycle count are not assumed to have been achieved together on the same sample under the same workload.
- [FND-EVERSPIN-12LP: Everspin/GF 12LP MRAM Joint Development Agreement Amendment](https://www.sec.gov/Archives/edgar/data/1438423/000155837021002369/mram-20201231xex10d11d4.htm). Public Contract Exhibit; 2019-12-31; Accessed 2026-09-10; Location in the Source: Preamble to Amendment No. 4 and Section 3.2.1; Limitations: The agreement establishes collaboration, not commercial volume production, finished-product specifications, or macro compatibility between 12LP+ and 12LP.
- [FND-TSMC-2022-AR: TSMC 2022 Annual Report: 16FFC MRAM and 22/28ULL RRAM](https://investor.tsmc.com/static/annualReports/2022/english/ebook/files/basic-html/page97.html). Supplier Annual Report; 2023; Accessed 2026-09-10; Location in the Source: Printed page 95; e-book page 97; Limitations: Production readiness and volume production are distinct. Grade 1 was still a forward-looking target at that point.
- [FND-TSMC-2023-AR: TSMC 2023 Annual Report, Chapter Five: Process Services and Emerging Memory](https://investor.tsmc.com/static/annualReports/2023/english/pdf/2023_tsmc_ar_e_ch5.pdf). Supplier Annual Report; 2024; Accessed 2026-09-10; Location in the Source: Printed pages 97 and 101; PDF pages 2 and 4; Limitations: The MRAM scopes and versions described in different chapters of the same report are not fully mapped to one another. All 16nm qualification events must not be collapsed into a single first-completion date.
- [FND-TSMC-2024-AR: TSMC 2024 Annual Report: Emerging Memory with Smaller Bits](https://investor.tsmc.com/static/annualReports/2024/english/ebook/files/basic-html/page104.html). Supplier Annual Report; 2025; Accessed 2026-09-10; Location in the Source: Printed page 102; e-book page 104; Limitations: No mapping of macro versions and names across generations is provided. Technology qualification for 12nm RRAM is not directly equivalent to volume production.
- [FND-TSMC-2024-BUS: TSMC 2024 Annual Report: Automotive Technology Services](https://investor.tsmc.com/static/annualReports/2024/english/ebook/files/basic-html/page21.html). Supplier Annual Report; 2025; Accessed 2026-09-10; Location in the Source: Printed page 19; e-book page 21; Limitations: Coexists with the R&D chapter's 2025 target. Differences in version scope must be retained.
- [FND-TSMC-2025-AR: TSMC 2025 Annual Report: Second-Generation MRAM and Third-Generation RRAM](https://investor.tsmc.com/static/annualReports/2025/english/pdf/2025_tsmc_ar_e_ch5.pdf). Supplier Annual Report; 2026; Accessed 2026-09-10; Location in the Source: Printed page 101; Chapter Five PDF page 2; Section 5.1, Specialty Technologies; Limitations: The annual report does not provide full capacity, ECC, temperature, or sample-distribution information. The chip failure rate cannot be extrapolated to arbitrary macros.
- [FND-TSMC-2025-20F: TSMC Form 20-F for Fiscal Year 2025](https://www.sec.gov/Archives/edgar/data/1046179/000162828026025362/tsm-20251231.htm). Official Company Regulatory Filing; 2026-04-17; Accessed 2026-09-10; Location in the Source: Automotive platform technology section; Limitations: Establishes completion within the reporting year, but provides no volume-production start date, customer part number, or full test conditions.
- [FND-TSMC-CURRENT-LOGIC: TSMC Current 16/12nm Technology Page](https://www.tsmc.com/english/dedicatedFoundry/technology/logic/l_16_12nm). Dynamic Supplier Product Page; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Sections on N12 RRAM and N16 MRAM qualification; Limitations: The 2017 volume-production year of the underlying 12FFC+ logic platform must not be substituted for the RRAM macro's production year.
- [FND-TSMC-CURRENT-NVM: TSMC Current Embedded Nonvolatile Memory Page](https://www.tsmc.com/english/dedicatedFoundry/technology/specialty/eflash). Dynamic Supplier Product Page; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Main text on eMRAM and eRRAM; Limitations: The website is dynamic and has no revision date. This is a snapshot of current status, not evidence of the first year of volume production.
- [FND-TSMC-SYMP-2022: TSMC 2022 North America Technology Symposium Press Release](https://pr.tsmc.com/english/news/2939). Official Annual Technology Symposium Press Release; 2022-06-16; Accessed 2026-09-10; Location in the Source: N6e ultra-low-power platform section; Limitations: The public release does not contain a complete roadmap sufficient to determine volume-production status for each MRAM/RRAM generation.
- [FND-TSMC-SYMP-2023: TSMC 2023 North America Technology Symposium Press Release](https://pr.tsmc.com/system/files/newspdf/attachment/af320740c347534184a5705ac01982e22e743978/2023%20Tech%20Symposium%20%28E%29_final_wmn.pdf). Official Annual Technology Symposium Press Release; 2023-04-26; Accessed 2026-09-10; Location in the Source: Three-page public press release; Limitations: No occurrence of MRAM was found. A symposium date cited by media is not substituted for official evidence of completion.
- [FND-TSMC-SYMP-2024: TSMC 2024 North America Technology Symposium Press Release](https://pr.tsmc.com/english/news/3136). Official Annual Technology Symposium Press Release; 2024-04-24; Accessed 2026-09-10; Location in the Source: Sections on new technologies and advanced automotive packaging; Limitations: The main release contains no complete MRAM/RRAM node timeline. Annual reports provide supplemental evidence; access to conference slides is not claimed.
- [FND-TSMC-SYMP-2025: TSMC 2025 North America Technology Symposium Press Release](https://pr.tsmc.com/system/files/newspdf/attachment/167c59998c7117f14c13647c8e46a6b20a43316c/2025%20Tech%20Symposium%20%28E%29_Final_wmn.pdf). Official Annual Technology Symposium Press Release; 2025-04-23; Accessed 2026-09-10; Location in the Source: Three-page public press release; Limitations: The main release contains no complete MRAM/RRAM timeline suitable for verification. Unobtained internal symposium pages are not used to invent completion dates.
- [FND-TSMC-SYMP-2026: TSMC 2026 North America Technology Symposium Press Release and Public Video Portal](https://pr.tsmc.com/english/news/3302). Official Annual Technology Symposium Press Release; 2026-04-23; Accessed 2026-09-10; Location in the Source: The US event took place on 2026-04-22; press release and technology highlights; Limitations: The public release does not provide a complete MRAM/RRAM roadmap. A presentation uploaded by a third party is not treated as an official version.
- [FND-TSMC-SYMP-ACCESS: TSMC 2026 Technology Symposium Public Video Portal](https://www.tsmc.com/english/symposium_highlights/2026). Official Conference Portal; 2026; Accessed 2026-09-10; Location in the Source: Access instructions for the full on-demand videos; Limitations: This review did not obtain invitation-only conference content and cannot claim to have checked the complete internal roadmap.
- [ip-neobit: NeoBit Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoBit). Primary Technical Source; Undated; checked 2026-09-10; Location in the Source: Technical Principles; Limitations: Current product principle; full biases and layout are not disclosed.
- [ip-neobit-pat: Historical NeoBit Charge-Retention Patent](https://patents.google.com/patent/US6914825B2/en). Public Patent; 2005-07-05; Location in the Source: Figures 2(a), 2(b), 6; claims 1, 4; Limitations: Historical p+ floating-gate model linked by 2005 company news; not every current process.
- [ip-neobit-link: Official NeoBit-to-Patent Link](https://www.ememory.com.tw/en-US/News/News?guid=19081915004414). Primary Technical Source; 2005-10-04; Location in the Source: Second body paragraph: patent title and inventors; Limitations: Direct historical association between NeoBit and the named patent.
- [ip-neobit-uv: Published NeoBit UV-Erase Boundary](https://www.ememory.com.tw/Content/Upload/files/Product%20Brief/07_NeoBit%C2%AE%E2%80%93%20Most%20Widely%20Used%20OTP%20Solution_20210330.pdf). Primary Technical Source; 2021; filename version 2021-03-30; Location in the Source: Page 1: Feature/Advantage, Other benefits; UV erase; Limitations: UV erase was published; this does not make every current package UV erasable.
- [ip-neofuse: NeoFuse Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoFuse). Primary Technical Source; Undated; checked 2026-09-10; Location in the Source: Technical Principles; Limitations: Impedance-based OTP and GIDL suppression; full dielectric materials are undisclosed.
- [ip-neofuse-dt: Quantum Tunneling Mechanism in NeoFuse](https://www.chipestimate.com/Quantum-Tunneling-Mechanism-in-NeoFuse/eMemory/Technical-Article/2021/01/19). Primary Technical Source; 2021-01-19; Location in the Source: Figures 1–3; core nFET, gate oxide, dangling bonds, direct tunneling; Limitations: eMemory-authored article; an ultrathin-oxide DT model, not a metallic filament for all generations.
- [ip-neofuse-3t: Named NeoFuse Three-Transistor Architecture](https://www.ememory.com.tw/en-US/News/2024-12-09/Powering-the-NVM-and-Embedded-Chip-Security-Technologies). Officially Reposted Executive Interview; 2024-12-09; Location in the Source: NeoFuse: patented 3T design and regulating transistor; Limitations: Confirms 3T and a regulating function, not every current netlist or cross-section.
- [ip-neofuse-pat: Related Three-Transistor Antifuse Patent](https://patents.google.com/patent/US20250024668A1/en). Public Patent; 2025-01-16; Location in the Source: Figures 2, 3A, 3B; first 3T embodiment; gate dielectric 262/264/266/268; Limitations: Related same-company embodiment, not explicitly branded NeoFuse.
- [ip-kilopass-xpm-2007: Historical Kilopass XPM 2T Patent Diagram](https://patents.google.com/patent/WO2007090089A2/en). Public Patent; 2007-08-09; Accessed 2026-09-10; Location in the Source: Figure 1; paragraphs [0025]–[0029]; Figure 2 contrast in [0031]; Limitations: Figure 1 explicitly names existing XPM. Reconstruct only its 2T function; exclude the intermediate output in Figure 2 and later self-sensing circuits.
- [ip-kilopass-2t-2012: Kilopass 130/110 nm XPM and Gusto 2T Announcement](https://www.design-reuse.com/news/202521997-kilopass-nvm-ip-cores-first-to-deliver-footprint-and-pin-compatibility-across-eight-top-tier-silicon-foundries-for-the-130-110nm-process-node/). Republished Vendor Announcement; 2012-05-15; Accessed 2026-09-10; Location in the Source: Body paragraphs naming 2T CMOS antifuse and XPM/Gusto; Limitations: Supports the 2T link for the named historical products and nodes, not every node, current macro, or identical layout across foundries.
- [ip-lineage-kilopass-2018: Synopsys Acquisition of Kilopass](https://news.synopsys.com/2018-01-10-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Kilopass-Technology). Official Acquisition Announcement; 2018-01-10; Accessed 2026-09-10; Location in the Source: Announcement date; XPM, Gusto, SecretCode and 1T/2T product paragraphs; Limitations: Confirms portfolio acquisition, not identity between historical cells and all current implementations.
- [ip-synopsys-otp-current: Synopsys OTP NVM 1T/2T Portfolio](https://www.synopsys.com/articles/non-volatile-memory.html). Official Technical Article; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Synopsys OTP NVM IP Solutions; Limitations: Article is undated. Records the public 1T/2T antifuse portfolio as checked; does not assign every current product to a historical vendor cell.
- [ip-synopsys-advanced-otp: Synopsys Advanced-Process OTP Reliability and Sensing](https://www.synopsys.com/articles/reliable-secure-otp-ip.html). Official Technical Article; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Basic Operation; Figure 2; sensing, ECC and controller discussion; Limitations: Article is undated. Supports oxide breakdown, current sensing and macro-level improvements, but does not establish a separately named third cell.
- [ip-sidense-cell-2007: Sidense 1T-Fuse Original-Author Cell Section](https://www.chipestimate.com/1T-OTP-Memory-Delivering-Quality-and-Reliability/Sidense-a-part-of-Synopsys/Technical-Article/2007/12/18). Original-Author Technical Article; 2007-12-18; Accessed 2026-09-10; Location in the Source: Wlodek Kurjanowicz; Figure 2 and adjacent 1T-Fuse explanation; Limitations: Figure 2 is an n-type teaching structure with one continuous poly gate, thick/thin oxide, and one BL diffusion. Read arrows are inferred from this structure and the stated teaching bias, not a current macro bias table.
- [ip-sidense-irreversible-2017: Sidense 1T-Fuse Irreversibility and eMTP Boundary](https://www.chipestimate.com/Enabling-Secure-Semiconductor-Supply-Chain-Management/Sidense-a-part-of-Synopsys/Technical-Article/2017/09/05). Original-Author Technical Article; 2017-09-05; Accessed 2026-09-10; Location in the Source: Where NVM Fits In; Sidense Antifuse-based Split-channel 1T-Fuse Bit Cell; Figure 5; Limitations: Supports persistent thin-oxide conduction and emulated updates at system level; absolute security and competitor-comparison claims are excluded.
- [ip-sidense-patent-2006: Historical Sidense Split-Channel Antifuse Patent](https://patents.google.com/patent/US20060244099A1/en). Public Patent; 2006-11-02; Accessed 2026-09-10; Location in the Source: Figures 4, 5, 11, 12; paragraphs [0062]–[0067], [0087]–[0091]; claims 1–3, 12–13; Limitations: Corroborates thick/thin oxide and optional omission of the second diffusion. Detailed p-type biases are not transferred into the 2007 n-type product diagram.
- [ip-lineage-sidense-2017: Synopsys Acquisition of Sidense](https://news.synopsys.com/2017-10-17-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Sidense-Corporation). Official Acquisition Announcement; 2017-10-17; Accessed 2026-09-10; Location in the Source: Announcement date; single-transistor and split-channel 1T-Fuse paragraphs; Limitations: Directly links Sidense 1T-Fuse to the acquisition; does not establish one unchanged cross-section for all later OTP.
- [ip-neoee: NeoEE Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoEE). Primary Technical Source; Undated; checked 2026-09-10; Location in the Source: Technical Principles; capacitive-coupling MOS devices and selectors; Limitations: Current FN/FN; exact device count, p/n arrangement and biases are undisclosed.
- [ip-neoee-history: Historical NeoEE Conceptual Cell](https://www.chipestimate.com/Value-Propositions-that-NeoEETM-Technology-can-Delivery/eMemory/Technical-Article/2010/10/19). Primary Technical Source; 2010-10-19; Location in the Source: NeoEE Technology; Figure 1(b), Tej tunneling junction; Limitations: Historical family includes CHE/FN and FN/FN; it does not override the current route.
- [ip-neomtp: NeoMTP Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP). Primary Technical Source; Undated; checked 2026-09-10; Location in the Source: Technical Principles; p-type FG-MOSFET; extra erase gate; Limitations: Hot-hole-induced electron injection and FN from FG to erase gate; full cross-section is undisclosed.
- [ip-neomtp-pat: Related pMOS and Edge-Erase-Gate Patent](https://patents.google.com/patent/US20030235082A1/en). Public Patent; 2003-12-25; Location in the Source: Figures 2, 3A–3C, 4, 5; paragraphs 0019–0035; Limitations: Historical same-company patent; lateral n+ EG is not established as current NeoMTP.
- [ymc-product: YMC: Logic-Process ymtp MTP IP](https://www.ymc.com.tw/index_en.php). Manufacturer Information; Undated; accessed 2026-09-10; Location in the Source: About YMC paragraph; Limitations: Confirms product positioning; no cell or operating-bias disclosure for a specific version.
- [ymc-1t1c: YMC: 1T1C Core Technology](https://www.ymc.com.tw/upload/files/6423%E5%84%84%E8%80%8C%E5%BE%97%E4%B8%8A%E5%B8%82%E5%89%8D%E6%A5%AD%E7%B8%BE%E7%99%BC%E8%A1%A8%E6%9C%83_%E7%B0%A1%E5%A0%B10416(%E4%B8%8A).pdf#page=25). Manufacturer Information; 2024; accessed 2026-09-10; Location in the Source: Pre-listing business presentation, page 25; Limitations: Confirms a 1T1C family and multiple generations; does not establish this model as a current product cross-section.
- [ymc-pat-7423903: YMC: Historical Single-Floating-Gate Example](https://patents.google.com/patent/US7423903B2/en). Public Patent; 2008-09-09; accessed 2026-09-10; Location in the Source: Figures 1, 2A and 2B; first embodiment; FN erase in Summary; Limitations: Four-terminal nMOS/N-type capacitor example; its stated FN erase is not evidence for BBHH.
- [ymc-pat-dahhi: YMC: DAHCI Program and DAHHI Erase Variant](https://patents.google.com/patent/US20070158733A1/en). Public Patent; 2007-07-12; accessed 2026-09-10; Location in the Source: Figures 3B, 5A, 6B and 8A with adjacent description; Limitations: Supports hot-carrier and threshold directions; avalanche-based DAHHI is distinct from BBHH.
- [physics-bbhh-fg: Wu et al.: BBHH and Floating-Gate Demonstration](https://pure.lib.cgu.edu.tw/en/publications/a-nand-type-flash-memory-using-impact-ionization-generated-substr/). Original Research; 2007; accessed 2026-09-10; Location in the Source: IEDM 2007, pages 87–90; author-institution abstract; DOI 10.1109/IEDM.2007.4418870; Limitations: Uses BBHH and reports a floating-gate demonstration; its NAND structure, IIHE programming and values are not transferred to the YMC model.
- [physics-btbt-carriers: Chu and Wu: BTBT Hot-Carrier Paths](https://ir.lib.nycu.edu.tw/bitstream/11536/30685/1/000085620800010.pdf). Original Research; 2000-03; accessed 2026-09-10; Location in the Source: IEEE EDL 21(3), page 123 Introduction; page 125 Figure 4; DOI 10.1109/55.823576; Limitations: Supports silicon BBT carrier generation and field-assisted injection; Figure 3 is pMOS and is not copied into the nMOS model.
- [physics-fg-hole-erase: IEEE: Hot-Hole Injection into a Floating Gate](https://ieeexplore.ieee.org/document/748914/). Original Research; 1999-03; accessed 2026-09-10; Location in the Source: IEEE EDL 20(3), pages 140–142; abstract; DOI 10.1109/55.748914; Limitations: Observes BBT/possible avalanche enhancement during FN erase; used only for floating-gate hot-hole physics, not a pure-BBHH recipe.
- [aeon-impinj-2007: Impinj AEON/MTP Floating-Gate Announcement](https://www.impinj.com/about-us/news-room/2007/impinj-delivers-reprogrammable-nonvolatile-memory-ip-breakthrough---aeonmtp-worlds-first-25v-floatin). Company product announcement; 2007-09-26; Location in the Source: Opening AEON/MTP and floating-gate transistor paragraphs; Limitations: Supports the floating-gate family. Process and voltage claims apply to that announcement; no complete cell section is disclosed.
- [aeon-virage-fn-2009: Virage Logic AEON MTP Program/Erase and Monitoring](https://www.chipestimate.com/Auto-Industry-Replaces-Fuse-Technology-with-Standard-CMOS-Based-MTP---Adds-Functionality-Testability-and-Reliability/Synopsys-formerly-Virage-Logic-products/Technical-Article/2009/06/30). Company-authored technical article; 2009-06-30; Location in the Source: Craig Zajac; Architectural decisions, Manufacturing and author biography; Limitations: Explicitly identifies FN for program and erase. Differential cells and ECC concern the described automotive options. No terminal voltages, p/n polarity or physical geometry are disclosed.
- [ip-numem-current: Numem: Public MRAM IP Positioning](https://www.numem.com/). Manufacturer product page; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: What is Numem MRAM?; Numem MRAM IP; Limitations: Supports embedded IP and foundry-standard STT cells; current material recipes are not disclosed.
- [ip-numem-2019: Numem: First-Generation 22nm Embedded MRAM Presentation](https://files.futurememorystorage.com/proceedings/2019/08-05-Monday/20190805_MRAMDD_EmbeddedMRAM_Hendrickson.pdf). Manufacturer public conference presentation; 2019-08-05; Accessed 2026-09-10; Location in the Source: Pages 2, 4, 5, 7: test chip, WL/BL/SL, forced-current sensing, RMTJ; Limitations: This is a first-generation test-chip architecture; its measured values are not treated as current NuRAM specifications.
- [ip-stt-physics: Everspin: STT Family Physics](https://www.everspin.com/stt-mram-technology). Manufacturer mechanism explanation; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Spin-transfer Torque MRAM Technology: current direction, free layer, P/AP resistance; Limitations: Supports STT family physics only, not Numem product, material, or performance evidence.
- [ip-gf-platform: GF: 22FDX Embedded MRAM Platform](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram). Original foundry announcement; 2020-02-27; Accessed 2026-09-10; Location in the Source: Opening and Custom design kits: production entry and drop-in silicon-validated MRAM macros; Limitations: Platform identity is separate from the research-cell recipe; confirm macro availability, nodes, and conditions with the supplier.
- [ip-gf-cell-2024: GF Coauthored Research: 22FDX STT-MRAM Cells](https://pmc.ncbi.nlm.nih.gov/articles/PMC11409953/). Original research paper; 2024-09-18; Accessed 2026-09-10; Location in the Source: Materials and Methods: MRAM array structure and fabrication; Figure 2; Limitations: Limited to the reported CoFeB/SAF and 1T1MTJ example; positive Ic is RL-to-FL and writes P. Barrier material is not specified here.
- [ip-weebit-product: Weebit: Embedded ReRAM IP](https://www.weebit-nano.com/products/embedded-reram-ip/). Manufacturer IP product page; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: IP module, design deliverables, control, and analog periphery; Limitations: Product identity does not imply every foundry node uses the same published research recipe.
- [ip-weebit-bitcell: Weebit: ReRAM Bitcell](https://www.weebit-nano.com/technology/reram-bitcell/). Manufacturer mechanism explanation; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Two electrodes/thin oxide, forming, positive SET, and reverse RESET; Limitations: Forming is distinct from recurring SET; the page does not specify all materials or terminal voltages.
- [ip-weebit-cell-2021: Weebit/CEA-Leti/Silvaco: Original Oxide ReRAM Model](https://www.weebit-nano.com/wp-content/uploads/2021/05/Weebit-nano_Silvaco_ReRAM-TCAD_Oxide-Based-Model_IMW_OxRAM_2021_published-on-IEEE_V3-1.pdf). Author-posted original research paper; 2021-05; Accessed 2026-09-10; Location in the Source: PDF pages 2–5; Sections II–IV and Figures 1, 3, 5, 11: Ti/SiOx/TiN and oxygen exchange; Limitations: Model/electrical comparison for a CEA 130nm research cell; neither direct operando ion tracking nor a recipe disclosure for every SkyWater macro.
- [ip-crossbar-macro: Crossbar: High-Performance ReRAM IP Brief](https://www.crossbar-inc.com/assets/white-papers/High-Performance-Memory-Product-Brief.pdf). Manufacturer public product brief; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Pages 1–2: hard macro/architectural license, embedded macro, and overwrite; Limitations: Supports historical IP licensing forms; this review does not confirm a 2026 list of newly licensable nodes or macros.
- [ip-crossbar-2015: Crossbar: Original Embedded 1T1R and Metallic-Path Presentation](https://www.crossbar-inc.com/assets/resources/presentations/FMS2015-Slides-Versatile-ReRAM-Technology-and-Applications.pdf). Manufacturer public conference presentation; 2015; Accessed 2026-09-10; Location in the Source: Pages 3, 4, 7, 8, 15: metallic path, cell versus selector, BEOL 1T1R; Limitations: Embedded 1T1R and high-density 1S1R/1TnR have separate scopes and are not merged into one circuit.
- [ip-crossbar-cell-2012: Crossbar: Published Patent Application US20120007035A1](https://patents.google.com/patent/US20120007035A1/en). Original published patent application; 2012-01-12; Accessed 2026-09-10; Location in the Source: Figures 1–3; [0023]–[0025], [0037]: Ag/a-Si/p+ poly-Si, positive extension, negative retraction; Limitations: Selects a named embodiment with metal particles and tunneling paths; does not establish this recipe for all current macros or generic cathode-grown silver bridges.
- [aeon-transfer-2008: Virage Logic Filing on the Impinj NVM IP Business](https://www.sec.gov/Archives/edgar/data/1050776/000119312508145768/d8k.htm). Original SEC filing; 2008-06-26; Location in the Source: Item 2.01; signed 2008-07-02; transaction 2008-06-26; Limitations: Supports acquisition of the logic NVM IP business assets by Virage Logic, not a direct Synopsys acquisition of Impinj.
- [aeon-transfer-2010: Synopsys Completes the Virage Logic Acquisition](https://news.synopsys.com/home?item=123195). Company completion announcement; 2010-09-02; Location in the Source: Opening completion paragraph and added NVM portfolio; Limitations: Supports corporate acquisition and portfolio succession, not identical AEON internal cells across generations.
- [aeon-synopsys-2013: Synopsys DesignWare AEON MTP ULP Announcement](https://news.synopsys.com/2013-11-20-Synopsys-New-Ultra-Low-Power-Non-Volatile-Memory-IP-Cuts-Power-by-90-Percent-and-Size-in-Half). Company product announcement; 2013-11-20; Location in the Source: Highlights, opening paragraph and Availability; Limitations: Explicitly continues AEON branding with MTP ULP. Performance comparisons are not used; branding does not establish a cell netlist.
- [aeon-synopsys-current: Synopsys Current MTP ULP NVM Product Page](https://www.synopsys.com/designware-ip/memories-logic-libraries/non-volatile-memory/mtp-rfid.html). Current company product page; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Overview and Highlights; checked 2026-09-10; Limitations: Publishes single-poly, floating-gate and zero-mask-adder positioning. The page uses MTP ULP naming; this does not prove all current MTP shares the 2009 AEON cell.
- [RES-UMC-RRAM-2023: UMC / eMemory: 22nm RRAM Qualification](https://www.umc.com/en/News/press_release/Content/technology_related/20230328). Official primary source / author research; 2023-03-28; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: Qualification applies to the announced version, not shipments by every customer.
- [RES-UMC-MRAM-2018: UMC / Avalanche: MRAM Development Agreement](https://www.umc.com/en/News/press_release/Content/technology_related/20180806). Official primary source / author research; 2018-08-06; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: A development agreement does not establish embedded-macro production.
- [RES-UMC-MRAM-2022: UMC / Avalanche: 22nm P-SRAM Availability](https://www.umc.com/en/News/press_release/Content/technology_related/20220913). Official primary source / author research; 2022-09-13; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: Standalone specifications are not specifications for a general embedded IP offering.
- [RES-FARADAY-RRAM-2025: Faraday: FlashKit-22RRAM Silicon Validation](https://www.faraday-tech.com/html/News/pressRelease/CHI_01_0441.jsp). Official primary source / author research; 2025-06-10; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: Platform validation does not establish a named customer shipment volume.
- [RES-UMC-ENVMPAGE: UMC: eNVM Platform Table](https://www.umc.com/en/Product/technologies/Detail/envm). Official primary source / author research; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: Undated page; SRAM area entries are not RRAM bitcell areas.
- [RES-UMC-INFINEON-2023: UMC / Infineon: 40nm Automotive MCU Agreement](https://www.umc.com/en/News/press_release/Content/technology_related/20230307). Official primary source / author research; 2023-03-07; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: The announcement does not identify RRAM, MRAM, or the memory material.
- [RES-PANASONIC-UMC-2017: Panasonic / UMC: 40nm ReRAM Collaboration](https://news.panasonic.com/global/press/en170201-3). Official primary source / author research; 2017-02-01; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: A forward-looking sampling plan does not establish completion.
- [RES-PANASONIC-SSDM-2018: Panasonic: 40nm ReRAM Mechanism and Reliability](https://confit.atlas.jp/guide/event-img/ssdm2018/B-1-01/public/pdf_archive?type=in). Official primary source / author research; 2018; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: 100k-cycle endurance and retention after 10k cycles are distinct conditions.
- [RES-FUJITSU-RERAM-2019: Fujitsu / Panasonic: 8Mbit ReRAM Product](https://info.archives.global.fujitsu/tw/about/resources/news/press-releases/2019/fep-0812.html). Official primary source / author research; 2019-08-12; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: This announcement does not identify the process node or foundry.
- [RES-IBM-14NM-2020: IBM: 14nm CMOS Embedded STT-MRAM](https://research.ibm.com/publications/a-14-nm-embedded-stt-mram-cmos-technology). Official primary source / author research; 2020-12-12; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: An integration demonstration, not a public PDK or foundry-production announcement.
- [RES-IBM-11NM-2017: IBM: Low-Current 11nm MTJ Research](https://research.ibm.com/publications/low-current-spin-transfer-torque-mram--1). Official primary source / author research; 2017-06-05; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: 11nm describes the MTJ size, not a CMOS node.
- [RES-IBM-ALLOY-2024: IBM: Ordered-Alloy Free-Layer Research](https://research.ibm.com/publications/first-demonstration-of-high-retention-energy-barriers-and-2-ns-switching-using-magnetic-ordered-alloy-based-stt-mram-devices). Official primary source / author research; 2024-06-16; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: No node, array capacity or production qualification is stated; an energy barrier is not an unconditional retention guarantee.
- [RES-IBM-REVIEW-2024: IBM Authors: STT-MRAM Status and Directions](https://research.ibm.com/publications/spin-transfer-torque-magnetoresistive-random-access-memory-technology-status-and-future-directions). Official primary source / author research; 2024-11-06; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: Commercial technology categories in a review do not establish IBM product availability.
- [RES-ITRI-SOT-2022: ITRI: SOT and Cryogenic STT Collaborations](https://www.itri.org.tw/ListStyle.aspx?DisplayStyle=01_content&MGID=111061510283488782&MmmID=1036276263153520257&SiteID=1). Official primary source / author research; 2022-06-15; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: The release omits full error-rate, node and retention-temperature conditions.
- [RES-ITRI-CIM-2024: ITRI / TSMC: IEDM 2023 SOT-CIM](https://www.itri.org.tw/ListStyle.aspx?DisplayStyle=01_content&MGID=113011710184808020&MmmID=1036276263153520257&SiteID=1). Official primary source / author research; 2024-01-17; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: The comparison workload is not fully disclosed; this is not a universal 100× SOT advantage.
- [RES-SOT-BETAW-2025: Joint Research: β-W 64kb SOT-MRAM](https://www.nature.com/articles/s41928-025-01434-x). Official primary source / author research; 2025-09-02; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: Public abstract and author information reviewed; annealing is not operating temperature and does not establish production.
- [RES-ITRI-SERVICE: ITRI: 8-Inch MRAM Development Services](https://www.itri.org.tw/english/ListStyle.aspx?DisplayStyle=01_content&MGID=1126511563713777471&MmmID=1071732317047353240&SiteID=1). Official primary source / author research; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: 8 inches is wafer size, not a node; these services do not imply high-volume production.
- [RES-ITRI-RRAM: ITRI: 1S1R 3D RRAM Technology Transfer](https://www.itri.org.tw/ListStyle.aspx?DisplayStyle=13_content&MmmID=1036233405427625204&SiteID=1&Trt_idx=4557). Official primary source / author research; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Main text / abstract; Limitations: Undated and without current production evidence; this older listing does not describe the entire ReRAM market today.
- [everspin-toggle: Everspin Toggle MRAM · Toggle MRAM](https://www.everspin.com/persyst?page=2). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: These values belong only to MR3A16ACYS35. Do not mix speed, temperature or automotive ratings across parts. The old MR4A16B datasheet is inaccessible, so its over-20-year retention is not cited.
- [everspin-1gb-ddr: Everspin 1Gb STT-MRAM · STT-MRAM / DDR4-derived](https://www.sec.gov/Archives/edgar/data/1438423/000162828026014733/mram-20251231.htm). Official primary source; 2026-03-04; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: DDR4-like does not imply drop-in compatibility with every DDR4 controller. Do not transfer Toggle or xSPI retention, endurance or automotive ratings. The old family URL is now 404.
- [everspin-xspi: Everspin EMxxLX xSPI · STT-MRAM / xSPI](https://investor.everspin.com/news-releases/news-release-details/everspin-advances-high-reliability-xspi-mram-portfolio-256mb). Official primary source; 2026-03-05; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: The 128Mb and 256Mb dates were forecasts as of March 5, 2026; subsequent completion was not verified. HR qualification does not transfer to other EMxxLX variants. This release does not specify bandwidth or retention.
- [avalanche-umc22: Avalanche Technology / UMC · pMTJ STT-MRAM](https://www.umc.com/en/News/press_release/Content/technology_related/20220913). Official primary source; 2022-09-13; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: This is a discrete product, not proof of identical specifications for general UMC embedded macros. Retention is a supplier reliability specification.
- [avalanche-scaling2026: Avalanche Technology · STT-MRAM](https://www.avalanche-technology.com/avalanche-technology-phase-one-magnetic-cell-scaling-space-grade-mram-us-government/). Official primary source; 2026-03-02; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: The page is dated March 2, 2026, but the body says March 2, 2025. A 16x density increase is a future goal, not a shipped product.
- [samsung-emram: Samsung Foundry · STT-MRAM / eMRAM](https://semiconductor.samsung.com/foundry/process-technology/specialty-technology/). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Platform expansion does not establish named high-volume customers at every node. Earlier roadmap dates are not completion evidence.
- [intel-22ffl-research: Intel · STT-MRAM](https://ieee-iedm.org/wp-content/uploads/2026/05/2018-IEDM-Archive.pdf). Official primary source; 2018-12-04; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: No newer verified Intel commercial MRAM offering was found in this bounded review. Do not infer availability from the paper or the Intel 16 name.
- [tsmc-16mram2025: TSMC · eMRAM / STT route](https://investor.tsmc.com/sites/ir/annual-report/2025/2025%20Annual%20Report.E.pdf). Official primary source; 2025; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Qualification is not proof of volume shipment of a named MCU. SOT research must remain separate from qualified platforms.
- [tsmc-sot2025: TSMC SOT-MRAM · SOT-MRAM](https://investor.tsmc.com/sites/ir/annual-report/2025/2025%20Annual%20Report.E.pdf). Official primary source; 2025-12; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: A research demonstration is not a commercial process or a shipping SRAM replacement; 16nm automotive MRAM maturity does not transfer.
- [gf-22fdx: GlobalFoundries · STT-MRAM / 22FDX](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram). Official primary source; 2020-02-27; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Grade 1 was a future target in that release. The current FDX page still lists MRAM, but customer-specific qualification requires separate evidence.
- [renesas-ra8-2025: Renesas RA8M2 / RA8D2 · Embedded MRAM](https://www.renesas.com/en/about/newsroom/renesas-adds-two-new-mcu-groups-blazing-fast-ra8-series-1ghz-performance-and-embedded-mram). Official primary source; 2025-10-22; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: CPU clock is not native MRAM read speed. Do not transfer 2024 research-macro measurements directly to the RA8 products.
- [st-pcm-boundary: STMicroelectronics · PCM, not established MRAM offering](https://newsroom.st.com/media-center/press-item.html/p4733.html). Official primary source; 2025-11-18; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Samsung cooperation or advanced eNVM does not make this MRAM. Any ST MRAM research requires its own direct source.
- [nxp-s32k5: NXP S32K5 · Embedded MRAM](https://www.nxp.com/assets/block-diagram/en/S32K5.pdf). Official primary source; 2025-10-30; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: The claimed 15x write advantage is a supplier comparison against embedded flash, not an absolute latency. Announcement is not volume-production evidence.
- [netsol-stt: NETSOL · STT-MRAM](https://netsol.co.kr/wp-content/uploads/2024/03/S3RxxxxR1M_rev1.1.pdf). Official primary source; 2024-03; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Do not transfer larger densities or process nodes from other series or media reports into this datasheet. Shipment volume is not disclosed.
- [tdk-headway: TDK / Headway · STT-MRAM](https://www.tdk.com/system/files/tdk_investor_day_20250901_en.pdf). Official primary source; 2025-09-01; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: HDD-head production and MTJ expertise do not establish commercial discrete MRAM. No orderable MRAM SKU, PDK or specific foundry commitment was verified.
- [numem-aime: Numem · Foundry-based STT-MRAM](https://numem.com/news). Official primary source; 2025-06-10; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Power and SRAM-class performance are supplier claims without uniform independent benchmarking. This is not evidence of a new magnetic material or named volume shipments.
- [imec-sot: imec · SOT-MRAM](https://www.imec-int.com/en/press/imecs-extremely-scaled-sot-mram-devices-show-record-low-switching-energy-and-virtually). Official primary source; 2023-12-13; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Device switching energy excludes full macro, bus and system overhead. The 50nm dimension is not a 50nm CMOS process-node claim.
- [RRAM-WEEBIT-2026: Weebit Nano · ReRAM](https://www.weebit-nano.com/news/press-releases/weebit-nano-expands-licensing-agreements-with-key-customers-three-customer-chip-designs-taped-out-to-date/). Official primary source; 2026-07-31; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: First customer product mass production remained a future milestone.
- [RRAM-ONSEMI-2026: onsemi · ReRAM](https://www.weebit-nano.com/news/press-releases/weebit-nano-expands-licensing-agreements-with-key-customers-three-customer-chip-designs-taped-out-to-date/). Official primary source; 2026-07-31; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Licensing or transfer does not establish product mass production.
- [RRAM-TI-2026: Texas Instruments · ReRAM](https://www.weebit-nano.com/news/press-releases/weebit-nano-expands-licensing-agreements-with-key-customers-three-customer-chip-designs-taped-out-to-date/). Official primary source; 2026-07-31; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: TI commercial FRAM and this ReRAM transfer are separate technology routes.
- [RRAM-SKYWATER-S130: SkyWater/Weebit Nano · ReRAM](https://www.weebit-nano.com/products/embedded-reram-ip/weebit-reram-nvm-in-skywater-130nm-cmos/). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: IP qualification does not qualify every customer chip or prove its mass production.
- [RRAM-DBHITEK-130: DB HiTek/Weebit Nano · ReRAM](https://www.weebit-nano.com/products/embedded-reram-ip/wbt-dbh-db130lva-reram-rram/). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: 100K cycles is an extension option; base BCD volume does not establish ReRAM product shipments.
- [RRAM-TSMC-IOT: TSMC · ReRAM](https://www.tsmc.com/english/dedicatedFoundry/technology/platform_IoT_tech_NVM). Official primary source; 2024; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: 12RRAM risk production is not full production or automotive qualification.
- [RRAM-INFINEON-TC4X: Infineon/TSMC · ReRAM](https://www.infineon.com/technology-news/2022/infatv202211-031). Official primary source; 2022-11-25; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: This announcement does not prove every TC4x variant uses RRAM or has reached production.
- [CBRAM-GF-RENESAS: GlobalFoundries/Renesas/Dialog · CBRAM](https://gf.com/news-and-events/news/globalfoundries-acquires-renesas-non-volatile-resistive-ram-technology-to-proliferate-iot-and-5g-applications/). Official primary source; 2023-02-09; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Prior CBRAM production does not establish 22FDX production; the acquirer was GF, not Infineon.
- [RRAM-NUVOTON-M2L31: Nuvoton · ReRAM](https://www.nuvoton.com/products/microcontrollers/arm-cortex-m23-mcus/m2l31-series/index.html). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: 72 MHz is the MCU clock, not cell write latency; density and reliability are part-specific.
- [RRAM-PANASONIC-UMC: Panasonic/UMC · ReRAM](https://news.panasonic.com/global/press/en170201-3). Official primary source; 2017-02-01; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: The development target is not evidence of 2026 availability or the process used by every current Nuvoton part.
- [RRAM-RAMXEED-PRODUCT: RAMXEED · ReRAM](https://www.ramxeed.com/products/reram/reram-products.html). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Do not transfer the 8 Mbit production status or endurance to the 12 Mbit part.
- [RRAM-CROSSBAR-DARIC: CrossBar · ReRAM](https://crossbar-inc.com/blogs/all/overview-of-crossbar-hardware-reram-and-chip). Official primary source; 2026-05-06; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: The article does not establish production qualification or independent security certification; avoid blanket immunity claims.
- [XPOINT-MICRON-EXIT: Micron · 3D XPoint](https://investors.micron.com/news/press-release/2021/Micron-Updates-Data-Center-Portfolio-Strategy-to-Address-Growing-Opportunity-for-Memory-and-Storage-Hierarchy-Innovation-03-16-2021/default.aspx). Official primary source; 2021-03-16; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Ending this route does not end all PCM research; CXL is an interconnect, not a memory-cell mechanism.
- [XPOINT-INTEL-EXIT: Intel · 3D XPoint](https://www.intc.com/filings-reports/all-sec-filings/content/0000050863-23-000006/intc-20221231.htm). Official primary source; 2022; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Historical product pages or inventory sales do not establish continuing development or other vendors' PCM exits.
- [PCM-ST-P3E: STMicroelectronics · PCM](https://www.st.com/content/st_com/en/campaigns/stellar-p3e-automotive-mcu-with-npu-accelerator-and-xmemory.html). Official primary source; 2026; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Reaching the planned quarter does not prove completion; P3E timing does not apply to every Stellar part.
- [PCM-IBM-AIMC: IBM Research · PCM](https://research.ibm.com/publications/deep-neural-network-inference-with-a-64-core-in-memory-compute-chip-based-on-phase-change-memory). Official primary source; 2023-09-17; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Analog weight-compute results do not establish a purchasable general-purpose PCM memory or complete-system performance.
- [FERAM-TI-MSP430: Texas Instruments · FeRAM](https://www.ti.com/tool/TIDM-FRAM-EEPROM). Official primary source; 2016-12-20; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: FRAM is the storage technology; EEPROM emulation is interface behavior, not floating-gate or FeFET construction.
- [FERAM-RAMXEED: RAMXEED · FeRAM](https://www.ramxeed.com/faq/). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Cycle ratings, interfaces and temperatures are part-specific; FeRAM is not synonymous with all FeFET or FTJ devices.
- [FERAM-INFINEON: Infineon · FeRAM](https://www.infineon.com/products/memories/f-ram-ferroelectric-ram). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Maximum ratings do not apply to every part; this does not establish HfO2 FeFET or FTJ construction.
- [FERAM-GF-IPMS-2026: GlobalFoundries/Fraunhofer IPMS · FeRAM](https://www.ipms.fraunhofer.de/en/press-media/press/2026/Ferroelectric-memory-storage.html). Official primary source; 2026-06-11; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: The announcement lacks orderable parts, a complete qualification report or shipment volumes.
- [FERRO-NAMLAB-2025: NaMLab · FeFET/FTJ](https://www.namlab.com/publications/). Official primary source; 2025; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Publication listings establish research participation, not foundry service, PDK availability or mass production.
- [FERRO-FMC: FMC · Ferroelectric Memory](https://www.ferroelectric-memory.com/technology/). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: The current page describes ferroelectric capacitors; it does not establish that DRAM+ or CACHE+ uses a FeFET or FTJ. Product qualification and shipment volumes are not verified.
- [FERRO-IMEC-NDREAD: imec · FeRAM/FeCAP](https://www.imec-int.com/en/articles/non-destructive-readout-mechanism-ferroelectric-capacitors). Official primary source; 2023; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Read endurance is not write endurance and does not establish conventional FeRAM behavior or mass production.
- [RRAM-CEA-LETI: CEA-Leti/Weebit Nano · ReRAM](https://www.cea.fr/cea-tech/leti/english/Pages/What's-On/Press%20release/Weebit-Nano-and-CEA-Leti-to-demonstrate-brain-inspired-neuromorphic-demo-.aspx). Official primary source; 2019-07-18; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: The demonstration is not an orderable complete AI accelerator; transfer and qualification require separate evidence.
- [industry-infineon-sonos: Infineon/Cypress · SONOS eFlash](https://www.infineon.com/products/memories/embedded-flash-ip-solutions). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Separate Cypress history from current macros; do not combine family-wide maximum specifications.
- [industry-sst-superflash: SST/Microchip · SuperFlash NOR/eFlash](https://www.sst.com/services/). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Licensing does not establish identical current qualification across nodes; verify each technology generation.
- [industry-st-estm: STMicroelectronics · eSTM eFlash/Page EEPROM](https://www.st.com/content/st_com/en/about/innovation-and-technology/estm.html). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Keep eSTM separate from Stellar PCM; it is not the cell used by every ST MCU.
- [industry-renesas-sgmonos: Renesas · SG-MONOS eFlash](https://www.renesas.com/en/about/press-room/renesas-electronics-announces-world-s-first-development-fin-shaped-monos-flash-memory-cells-high). Official primary source; 2016-12-07; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: This announcement does not prove 16/14nm production; verify current part numbers separately.
- [industry-xfab-xt011: X-FAB · XT011 eFlash/EEPROM](https://www.xfab.com/news/details/article/x-fab-releases-embedded-flash-solution-on-its-110nm-automotive-bcd-on-soi-technology). Official primary source; 2024-12-03; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Keep this separate from the historical 2003 XC06 example; do not assume identical cells.
- [industry-floadia-zt: Floadia · LEE Flash ZT MTP](https://floadia.com/product/lee-flash-zt/). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: General and platform-specific endurance figures differ; do not infer universal endurance or polysilicon count.
- [industry-samsung-vnand9: Samsung · Ninth-Generation TLC V-NAND](https://news.samsung.com/global/samsung-electronics-begins-industrys-first-mass-production-of-9th-gen-v-nand). Official primary source; 2024-04-23; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Evidence concerns this TLC generation; later demonstrations and projected QLC timing are separate.
- [industry-skhynix-321tlc: SK hynix · 321-Layer TLC 4D NAND](https://news.skhynix.com/en/sk-hynix-starts-mass-production-of-world-first-321-high-nand/). Official primary source; 2024-11-21; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Separate production from customer delivery; do not assign this die to every Solidigm SSD.
- [industry-solidigm-p5336: Solidigm · D5-P5336 QLC SSD](https://www.solidigm.com/products/data-center/d5/p5336.html). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: SSD capacity and system metrics are not die specifications; corporate relationships do not establish common NAND.
- [industry-micron-g9: Micron · G9 TLC NAND](https://investors.micron.com/news/press-release/2024/Micron-Announces-Volume-Production-of-Ninth-Generation-NAND-Flash-Technology-07-30-2024/default.aspx). Official primary source; 2024-07-30; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Do not extend TLC evidence to every QLC or NOR product; interface speed is not cell programming speed.
- [industry-kioxia-sandisk-gen10: Kioxia/Sandisk · Tenth-Generation BiCS 3D NAND](https://www.kioxia.com/en-jp/about/news/2026/20260703-2.html). Official primary source; 2026-07-03; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Production start does not establish universal customer availability or identical finished products.
- [industry-ymtc-xtacking: YMTC · Xtacking 3D NAND](https://www.ymtc.com/en/technicalintroduction.html). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Awards and architecture descriptions alone do not prove each product's volume, layer count or shipment status.
- [industry-macronix-nor: Macronix · Serial NOR/OctaBus](https://www.macronix.com/en-us/products/NOR-Flash/Serial-NOR-Flash/Pages/default.aspx). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: This source directly supports NOR; verify NAND parts separately and do not infer cell geometry from interfaces.
- [industry-winbond-w25q: Winbond · W25Q16JW Serial NOR](https://www.winbond.com/hq/new-online-purchasing-guide/?__locale=en&pLine=/product/code-storage-flash/qspi-nor/&pNo=W25Q16JW). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Catalog presence does not guarantee stock; verify NAND families and other capacities separately.
- [industry-gigadevice-flash: GigaDevice · GD25/GD55 NOR; GD5F NAND](https://www.gigadevice.com/product/flash). Official primary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Product, technology or announcement text; Limitations: Family coverage does not replace part-specific production status, temperature, endurance or retention specifications.
- [everspin-ddr-technology: Current official explanation of 1Gb DDR4-like persistent DRAM and separate xSPI STT products.](https://www.everspin.com/stt-mram-technology). Official supplementary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Main text / relevant specification; Limitations: Applies only to the named version and stated conditions.
- [gf-current-fdx: Current FDX platform page continues to list MRAM.](https://gf.com/technologies/cmos/fdx-fd-soi/). Official supplementary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Main text / relevant specification; Limitations: Applies only to the named version and stated conditions.
- [headway-author-research: Headway-authored embedded STT-MRAM research presentation; not commercial supply evidence.](https://www.cea.fr/cea-tech/leti/Documents/%C3%A9v%C3%A9nements/Prez%20workshop%20memory%202017/2.2.pdf). Official supplementary source; 2017; Accessed 2026-09-10; Location in the Source: Main text / relevant specification; Limitations: Applies only to the named version and stated conditions.
- [numem-current: Current site explicitly identifies foundry-based STT-MRAM and AIME.](https://www.numem.com/). Official supplementary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Main text / relevant specification; Limitations: Applies only to the named version and stated conditions.
- [nxp-launch: S32K5 launch and supplier comparison claims.](https://www.nxp.com/company/about-nxp/newsroom/NW-NEW-S32K5-MICROCONTROLLER). Official supplementary source; 2025-03-11; Accessed 2026-09-10; Location in the Source: Main text / relevant specification; Limitations: Applies only to the named version and stated conditions.
- [samsung-history: Historical node schedules must remain separate from current platform evidence.](https://semiconductor.samsung.com/news-events/tech-blog/developing-the-industrys-most-energy-efficient-next-generation-mram-selected-as-iedm-highlight-paper/). Official supplementary source; 2023; Accessed 2026-09-10; Location in the Source: Main text / relevant specification; Limitations: Applies only to the named version and stated conditions.
- [everspin-persyst-catalog: Current official catalog lists MR3A16ACYS35 as MP, 8Mb, x16, 35ns, 3.3V and −40 to 85°C.](https://www.everspin.com/persyst?page=2). Official supplementary source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Main text / relevant specification; Limitations: Applies only to the named version and stated conditions.
- [everspin-2025-10k: The annual filing confirms continuing 1Gb STT-MRAM shipments; its March 4 filing date is explicitly stated in the March 5 official release.](https://www.sec.gov/Archives/edgar/data/1438423/000162828026014733/mram-20251231.htm). Official supplementary source; 2026-03-04; Accessed 2026-09-10; Location in the Source: Main text / relevant specification; Limitations: Applies only to the named version and stated conditions.
- [everspin-hr-xspi-20260305: Original official release: HR 64Mb qualified and orderable; HR 128/256Mb qualification and volume dates remain forecasts.](https://investor.everspin.com/news-releases/news-release-details/everspin-advances-high-reliability-xspi-mram-portfolio-256mb). Official supplementary source; 2026-03-05; Accessed 2026-09-10; Location in the Source: Main text / relevant specification; Limitations: Applies only to the named version and stated conditions.
- [RES-IBM-DSMTJ-2025: IBM: Double Spin-Torque MTJs for Cache](https://research.ibm.com/publications/progress-and-gaps-in-double-spin-torque-mtjs-for-last-level-cache-applications). Official primary source; 2025-12-06; Accessed 2026-09-10; Location in the Source: Public abstract / main text; Limitations: Research-array demonstration; does not establish production yield or a shipped cache product.
- [RES-EVERSPIN-TELEDYNE-2026: Everspin / Teledyne HiRel Partnership](https://investor.everspin.com/news-releases/news-release-details/everspin-technologies-and-teledyne-hirel-semiconductors-partner). Official primary source; 2026-09-02; Accessed 2026-09-10; Location in the Source: Public abstract / main text; Limitations: A planned partner delivery does not prove completed qualification of every HR SKU.
- [RES-SONY-MICRON-2014: Micron / Sony: Copper ReRAM Research](https://investors.micron.com/static-files/7ac25c4b-edd0-4482-97ad-267a7263bcf0). Official primary source; 2014-06-05; Accessed 2026-09-10; Location in the Source: Public abstract / main text; Limitations: Historical R&D evidence, not current availability, a Sony sensor design win or production volume.
- [MRAM-KIOXIA-SKHYNIX-64GB-2025: Kioxia/SK hynix · 64 Gbit 1Selector–1MTJ Cross-Point MRAM](https://www.kioxia.com/en-jp/rd/technology/topics/topics-80.html). Primary official source; 2025-04-15; Accessed 2026-09-10; Location in the Source: Official body; NRAM uses the August 2016 archive entry; Limitations: This is a research array, not evidence of product availability. The 20 nm figure is MTJ diameter, not a CMOS process node; typical-bit tests do not establish full-array yield.
- [RRAM-TETRAMEM-MLX200-2026: TetraMem · MLX200 Multi-Level RRAM Analog IMC](https://tetramem.com/tetramem-completes-mlx200-silicon-validation/). Primary official source; 2026-05-19; Accessed 2026-09-10; Location in the Source: Official body; NRAM uses the August 2016 archive entry; Limitations: Evaluation kits were scheduled for H2 2026 at announcement. Initial validation does not establish mass production or delivery, and computing results are not general-purpose storage specifications.
- [RRAM-INTRINSIC-SURECORE: Intrinsic/sureCore · SiOx RRAM](https://www.intrinsicsemi.com/). Primary official source; Publication Date Not Stated; Accessed 2026-09-10; Location in the Source: Official body; NRAM uses the August 2016 archive entry; Limitations: The collaboration does not establish qualification or mass production of a named process macro; the site does not provide a complete orderable part and datasheet proving current supply.
- [NRAM-NANTERO-FUJITSU-2016: Nantero/Fujitsu Semiconductor/Mie Fujitsu Semiconductor · Carbon-Nanotube NRAM](https://info.archives.global.fujitsu/global/about/resources/news/press-releases/2016/). Primary official source; 2016-08-31; Accessed 2026-09-10; Location in the Source: Official body; NRAM uses the August 2016 archive entry; Limitations: This historical development evidence establishes neither 2026 production and availability nor program termination; NRAM should be classified separately from oxide RRAM.
- [op-pat-nrom-hhi: Saifun: Self-Aligned NROM Programming and Erasure Areas](https://patents.google.com/patent/US6664588B2/en). Public Patent; 2003; 2026-09-10 accessed; Location in the Source: Figures 4, 8A, 9, and 10–11; band-to-band hole generation and localized hot-hole injection; Limitations: The pocket implant and local hole path belong to this example; US5768192A is not used as evidence for this erase path.
- [op-pat-sonos-fn: Cypress: SONOS ONO Stack Scaling](https://patents.google.com/patent/WO2014008160A2/en). Public Patent; 2014; 2026-09-10 accessed; Location in the Source: Figures 1–3; uniform channel tunneling, electron programming, and hole erase; Limitations: A named SONOS tunneling example; no equivalence to the stack or biases of a current Infineon macro is asserted.
- [op-nand-hole-erase: KIOXIA: Schottky Source Contact and Hole Supply](https://www.kioxia.com/en-jp/rd/technology/topics/topics-88.html). Manufacturer Research; 2025-09-18; 2026-09-10 accessed; Location in the Source: Figures 1 and 4; GIDL hole supply from an N+ silicon source and the Schottky-contact alternative; Limitations: Supports carrier supply and a named study; this diagram uses the conventional GIDL branch without merging in a Schottky source.
- [op-pat-nand-gidl: SanDisk: GIDL-Assisted 3D NAND Erase](https://patents.google.com/patent/US10923196B1/en). Public Patent; 2021; 2026-09-10 accessed; Location in the Source: Figure 8 and GIDL erase description; terminal/select-gate bias difference, hole supply, and charge neutralization; Limitations: Uses its own BL/SL and select-gate biases; do not substitute the floating-terminal erase conditions of US7696559B2.
- [op-stt-katine-2000: Katine et al.: Current-Driven Reversal in Co/Cu/Co Pillars](https://arxiv.org/abs/cond-mat/9908231). Original research paper; 2000; Location in the Source: Abstract: electron flow from thin to thick layer favors AP; reverse flow favors P; Limitations: Used for the current/electron-flow convention; not product data for an MgO MTJ.
- [op-vcm-reservoir-2026: Yuan et al.: Controlled Oxygen-Reservoir Electrodes for WO₃ Memory](https://www.nature.com/articles/s43246-026-01143-8). Original research paper; 2026-04-06; Location in the Source: Figures 1b/4h and Discussion: positive-bias SET, reverse RESET, and oxygen-exchange model in ITO/WO₃/TiN; Limitations: A simplified teaching model. The paper supports the mechanism electrically and spectroscopically but does not directly track operando ion trajectories; these drawings are not in situ measurements.
- [op-pcm-ibm-thermal-2016: Bakan et al.: Temperature Distribution during PCM Crystallization](https://research.ibm.com/publications/extracting-the-temperature-distribution-on-a-phase-change-memory-cell-during-crystallization). Author-institution original paper record; 2016-10-25; Location in the Source: Abstract: melt-quench amorphization and temperature/time-dependent crystallization; Limitations: Tx, Tm, and curves are qualitative symbols; no measured product temperature or pulse duration is asserted.


## Historical Course Table and Current Corrections

This historical comparison table is reconstructed from the screenshot of slide 14 in the course dated 2021-11-01. That slide cites Yu and Chen's 2016 paper and adds SOT-MRAM, FeRAM, FeFET, and several numerical updates, so the complete table cannot be called the original 2016 table. The course values are retained as a baseline for learning how to compare technologies; they are not uniform product specifications for each family in 2026. F is the lithographic feature size used in the course, and energy is estimated at the cell level. The original slide also describes the values as representative, rather than best-case or worst-case figures.

| Metric | SRAM | DRAM | NOR Flash | NAND Flash | PCM | RRAM | STT-MRAM | SOT-MRAM | FeRAM | FeFET |
|---|---|---|---|---|---|---|---|---|---|---|
| Cell Area | >150 F² | 6 F² | 10 F² | <4 F² (3D) | 4–50 F² | 4–50 F² | 6–50 F² | 12–100 F² | 6–50 F² | 6–50 F² |
| Bits per Cell | 1 | 1 | 2 | 3–4 | 2–3 | 2–3 | 1 | 1 | 1 | 2–3 |
| Operating Voltage | <1 V | <1 V | >10 V | >10 V | <3 V | <3 V | <1 V | <1 V | <2 V | <3 V |
| Read Time | ~1 ns | ~10 ns | ~50 ns | ~10 µs | <10 ns | <10 ns | <10 ns | ~1 ns | <100 ns | <50 ns |
| Write Time | ~1 ns | ~10 ns | 10 µs–1 ms | 100 µs–1 ms | ~50 ns | <100 ns | <20 ns | <3 ns | <100 ns | <100 ns |
| Data Retention | N/A | ~64 ms | >10 years | >10 years | >10 years | >10 years | >1 years | >1 years | >10 years | >1 years |
| Endurance | >10¹⁶ cycles | >10¹⁶ cycles | ~10⁵ cycles | 10³–10⁴ cycles | 10⁶–10⁹ cycles | 10³–10⁹ cycles | 10⁶–10¹⁴ cycles | ~10¹² cycles | 10⁹–10¹² cycles | 10⁶–10⁹ cycles |
| Write Energy | ~fJ-scale/bit | ~10 fJ/bit | 100 pJ/bit | ~10 fJ/bit | ~10 pJ/bit | ~pJ-scale/bit | ~pJ-scale/bit | ~pJ-scale/bit | ~100 fJ/bit | ~fJ-scale/bit |

- Cell Area: The course's area notation is retained. The original slide also states that PCM, RRAM, and FeFET could reach below 4 F² through 3D integration. This is not a strictly equivalent comparison of physical cell area, effective area per bit, and complete-die density within one process.
- Bits per Cell: The course's representative values are retained. A multibit research demonstration does not establish the usable number of bits in a specified product under its temperature, endurance, and retention conditions.
- Operating Voltage: The course does not distinguish supply, read, write, forming, and internally boosted voltages in every cell of the table. Updated product comparisons must separate these quantities; they cannot be compared directly with a part number's VDD.
- Read Time: These are representative time scales from the course. They are not tied to common capacity, peripheral circuits, sensing methods, or interface completion points.
- Write Time: An updated comparison must separately record erase, SET/RESET, pulse duration, verification and retries, and total time from entry into a data buffer to completion of the nonvolatile write.
- Data Retention: The original table does not specify temperature, prior cycling, or extrapolation conditions for every entry. SRAM requires power. The time scale for dynamic storage or refresh in DRAM is not the same guarantee as power-off retention in NVM.
- Endurance: Historical ranges are retained cell by cell. The sources do not use a common bit/page/block granularity, definition of a read/write cycle, error threshold, ECC policy, temperature, or retention test.
- Write Energy: The original slide explicitly limits these estimates to the cell level, excluding the complete array periphery. fJ denotes 10⁻¹⁵ J and pJ denotes 10⁻¹² J. Entries without a numerical coefficient remain order-of-magnitude estimates; no precise value is invented.

### Treating Every Technology and Value in the Course Screenshot as Table 1 of the 2016 Paper

The emerging-technology columns in the 2016 paper contain only STT-MRAM, PCRAM, and RRAM. The 2021 course adds SOT-MRAM, FeRAM, and FeFET.

Distinguish the original paper from the lecturer's later additions so that the provenance remains traceable.

- [CMP-YU2016: Yu and Chen: Emerging Memory Technologies—Recent Trends and Prospects](https://knowen-production.s3.amazonaws.com/uploads/attachment/file/5249/yu2016.pdf)
- [CMP-LECTURE2021: Shimeng Yu: Comparison Table from Lecture 6, 2021](https://www.youtube.com/watch?v=_Ov2KUZTIv8&t=2165s)

### Assuming the 2016 and 2021 Tables Have Identical Values

Three differences have been verified: SRAM area changes from >100 F² to >150 F²; NAND bits per cell change from 3 to 3–4; and STT-MRAM endurance changes from >10¹⁵ to 10⁶–10¹⁴ cycles.

These differences show that the course table was updated, but a representative value from any particular year is not a guarantee for an entire technology family.

- [CMP-YU2016: Yu and Chen: Emerging Memory Technologies—Recent Trends and Prospects](https://knowen-production.s3.amazonaws.com/uploads/attachment/file/5249/yu2016.pdf)
- [CMP-LECTURE2021: Shimeng Yu: Comparison Table from Lecture 6, 2021](https://www.youtube.com/watch?v=_Ov2KUZTIv8&t=2165s)

### Assuming FeRAM, MRAM, ReRAM, and PCM Are All Preproduction Because They Are Called Emerging Memories

As of 2026-09-10, these families have verifiable commercial products or implementations in volume production: CY15B104QSN, MR25H40/Everspin STT-MRAM, MB85AS8MT, and ST SR6P6C8.

Maturity must be tied to the subtechnology, materials, process, and specific part number, not assigned solely by the family name.

- [CMP-FRAM-PRODUCT: Infineon CY15B104QSN-108SXI Product Status](https://www.infineon.com/part/CY15B104QSN-108SXI)
- [CMP-MRAM-PRODUCT: Everspin MR25H40 Products and Part Numbers](https://www.everspin.com/products/series/mr25h40)
- [CMP-EVERSPIN2024: Everspin 2024 Annual Filing](https://www.sec.gov/Archives/edgar/data/1438423/000155837025001827/mram-20241231x10k.htm)
- [CMP-RERAM-PRODUCT: RAMXEED ReRAM Product Family](https://www.ramxeed.com/zh-tw/products/reram-products/)
- [CMP-PCM-PRODUCT: ST SR6P6C8 Microcontroller with Embedded PCM](https://www.st.com/en/automotive-microcontrollers/sr6p6c8.html)

### Using a Nanosecond Cell Pulse to Label the Entire Product's Write Latency as Nanoseconds

Separate cell switching, array sensing, macro completion, and host-visible latency. The MB85AS8MT specifies product tWC of 5 ms typical and 10 ms maximum, and write-completion status must be checked.

Buffering, internal programming, and control sequences can all add time.

- [CMP-RERAM-DS: RAMXEED MB85AS8MT Datasheet](https://www.ramxeed.com/assets/images/products/datasheet/ReRAM/MB85AS8MT-DS2v2-E.pdf)
- [CMP-OPTANE-PERF: Intel Optane P5800X Performance and Test Conditions](https://edc.intel.com/content/www/us/en/products/performance/benchmarks/intel-optane-ssd-p5800x-series/)

### Equating 40 MHz SPI with a Complete Read or Write Transaction in 25 ns

25 ns is the clock period. A complete transaction also includes the instruction, address, data transfer, and any internal write wait.

Frequency describes the transfer cadence; latency describes how long it takes to complete an operation.

- [CMP-MRAM-DS: Everspin MR20H40/MR25H40 Datasheet](https://www.everspin.com/sites/default/files/EST00459_MR2xH40_Datasheet_Rev12.6_08092020.pdf)
- [CMP-RERAM-DS: RAMXEED MB85AS8MT Datasheet](https://www.ramxeed.com/assets/images/products/datasheet/ReRAM/MB85AS8MT-DS2v2-E.pdf)

### Treating 151-Year and 10-Year Retention as Unconditional Family Characteristics

The CY15B104QSN's 151-year rating applies at 65°C; the rating is 38 years at 75°C and 10 years at 85°C. Retention must also be paired with the specified cycling and test conditions.

Temperature and usage history change the probability of state failure. Comparing years alone is insufficient.

- [CMP-FRAM-DS: Infineon CY15B104QSN/CY15V104QSN Datasheet](https://www.infineon.com/dgdl/Infineon-CY15B104QSN_CY15V104QSN_4Mb_EXCELON_Ultra_Ferroelectric_RAM_F-RAM_Serial_quad_SPI_512K_8_108_MHz_industrial-DataSheet-v15_00-EN.pdf?fileId=8ac78c8c7d0d8da4017d0ee59c446d71)

### Treating Below 4 F², 332 Layers, and 37.6 Gb/mm² as the Same Density Metric

Record physical cell footprint, layer count, bits per cell, array efficiency, and complete-die bit density separately.

3D stacking and multibit storage change effective bit density. Peripheral circuits, redundancy, and ECC also occupy area.

- [CMP-LECTURE2021: Shimeng Yu: Comparison Table from Lecture 6, 2021](https://www.youtube.com/watch?v=_Ov2KUZTIv8&t=2165s)
- [CMP-KIOXIA2026: Kioxia/Sandisk Research on 10th-Generation 2 Tb QLC NAND](https://www.kioxia.com/en-jp/rd/technology/topics/topics-92.html)

### Using Cell-Level fJ per Bit to Rank Product or System Energy Efficiency

Compare cell pulses, wire charging and discharging, selector leakage, charge pumps, verification, ECC, and interface energy at their respective levels.

Low cell energy does not guarantee the same advantage in a large array or a workload with low utilization.

- [CMP-LECTURE2021: Shimeng Yu: Comparison Table from Lecture 6, 2021](https://www.youtube.com/watch?v=_Ov2KUZTIv8&t=2165s)
- [CMP-IBM-ARRAY2014: IBM: Design Space for Resistive-Memory Arrays with MIEC Selectors](https://research.ibm.com/publications/exploring-the-design-space-for-resistive-nonvolatile-memory-crossbar-arrays-with-mixed-ionic-electronic-conduction-miec-based-access-devices)
- [CMP-TSMC-ECC2023: TSMC and Collaborators: Read Compensation and ECC in an RRAM Macro](https://research.tsmc.com/page/artificial-intelligence/3.html)

### Treating Volume Production, Emerging Memory, and SCM as Mutually Exclusive Bitcell Categories

Volume production is a maturity state; emerging describes a development stage or a convention in the literature; SCM is a system role within the memory/storage hierarchy.

The same storage physics can support different maturity levels and applications. The classification dimensions must remain separate.

- [CMP-YU2016: Yu and Chen: Emerging Memory Technologies—Recent Trends and Prospects](https://knowen-production.s3.amazonaws.com/uploads/attachment/file/5249/yu2016.pdf)
- [CMP-SNIA-PM: SNIA Definition of Persistent Memory](https://www.snia.org/education/what-is-persistent-memory)
- [CMP-CXL-FAQ2021: CXL Consortium Persistent-Memory Webinar Questions and Answers](https://computeexpresslink.org/blog/questions-from-the-compute-express-link-cxl-supporting-persistent-memory-webinar-2407/)

### Assuming Every CXL Device Retains Data After Power Loss

CXL can carry volatile or persistent memory; Samsung CMM-D uses DRAM. Persistence must be established through the media, backup energy, and platform semantics together.

An interconnect protocol is not storage physics and does not automatically guarantee recovery after failure.

- [CMP-CXL2022: CXL 3.0 Specification](https://computeexpresslink.org/wp-content/uploads/2024/02/CXL-3.0-Specification.pdf)
- [CMP-SAMSUNG-CMM: Samsung CXL Memory and CMM-D](https://semiconductor.samsung.com/cxl-memory/)
- [CMP-CXL2026: DRAM, NAND, and Backup Energy in CXL Persistent Memory](https://computeexpresslink.org/blog/from-nvdimm-n-to-cxl-persistent-memory-bringing-persistence-to-the-memory-fabric-4635/)

### Presenting Optane's Historical Commercial Implementation as an SCM Roadmap Still Investing in New Products

Micron discontinued 3D XPoint development on 2021-03-16; Intel discontinued further Optane development in July 2022. The inventory forecasts and support statements in the 2023 letter must be recorded separately.

Development, manufacturing, inventory shipments, warranties, and support are different lifecycle events.

- [CMP-MICRON2021: Micron 3D XPoint and Data-Center Portfolio Strategy Update](https://investors.micron.com/news/press-release/2021/Micron-Updates-Data-Center-Portfolio-Strategy-to-Address-Growing-Opportunity-for-Memory-and-Storage-Hierarchy-Innovation-03-16-2021/default.aspx)
- [CMP-MICRON-CALL2021: Micron 3D XPoint Strategy-Update Prepared Remarks](https://investors.micron.com/static-files/c858cbb2-bfd2-4f84-ba10-f69b385cf4bf)
- [CMP-INTEL2023: Intel Optane Customer Letter](https://cdrdv2-public.intel.com/774331/IOG-DCL-March%202023.pdf)

## Patent Bibliography and Figures

### US7417300B2

Priority Date: 2006-03-09; Assignment Record: IBM; checked against bibliographic and assignment records; Figures and Passages: Figures 3 and 4A; claim 1.

### US8847350B2

Priority Date: 2012-08-30; Assignment Record: Taiwan Semiconductor Manufacturing Company; checked against the initial 2012 assignment record; Figures and Passages: Figures 1 and 5A; claim 1.

### US6667902B2

Priority Date: 2001-09-18; Assignment Record: Kilopass Technology; checked against the initial assignment and continuation relationships; Figures and Passages: Figures 1, 3, and 8; additional embodiments in Figures 12–15.

### US4115914A

Priority Date: 1976-03-26; parent-application date found in the records; this application was filed in 1977; Assignment Record: Hughes Aircraft Company; verified from the front page of the original publication; Figures and Passages: Figures 3i and 6; claims 2 and 9.

### US5844271A

Priority Date: 1995-08-21; Assignment Record: Cypress Semiconductor; checked against bibliographic and 1995 assignment records; Figures and Passages: Figures 3–6; claim 1.

### US6232180B1

Priority Date: 1999-07-02; Assignment Record: The initial assignment names Worldwide Semiconductor Manufacturing; transferred to Taiwan Semiconductor Manufacturing Company in 2000; Figures and Passages: Figure 6 and its operating table; claims 4 and 6.

### WO1981000790A1

Priority Date: 1979-09-13; Assignment Record: NCR; checked against PCT bibliographic and priority information; Figures and Passages: Figure 1; claim 1.

### US5768192A

Priority Date: 1996-07-23; Assignment Record: Saifun Semiconductors; verified from the original publication's front page and 1997 assignment record; Figures and Passages: Figure descriptions for localized charge and programming/reverse reading; claims 1 and 23.

### US7696559B2

Priority Date: 2005-12-28; Assignment Record: Toshiba; checked against bibliographic records and the original publication; Figures and Passages: Figures 2 and 5–9; claim 1.

### US6545906B1

Priority Date: 2001-10-16; Assignment Record: Original Applicant/Assignee: Motorola; Figures and Passages: Figure 3: direct/Toggle regions; Figure 4: two-line current sequence; Figure 5: magnetic-moment rotation.

### US5695864A

Priority Date: 1995-09-28; Assignment Record: Original Applicant/Assignee: IBM; Figures and Passages: Multilayer structure with fixed and variable magnetic moments; use claim 1 to trace the current path.

### US10930843B2

Priority Date: 2018-12-17; Assignment Record: Original Applicant/Assignee: Spin Memory; subsequent assignments require separate review; Figures and Passages: Figures 3–6: lines, selection, and sensing; Figures 7A–7F: process steps.

### US8331131B2

Priority Date: 2011-01-31; Assignment Record: Original Applicant/Assignee: Hewlett-Packard Development; Figures and Passages: Figure 3: pulses; Figure 5: ionic distributions and barrier states.

### US5761115A

Priority Date: 1996-05-30; Assignment Record: Published Assignment Records Include Axon Technologies and the Arizona Board of Regents; Figures and Passages: Figures 1A/1B: lateral structure; Figures 4A/4B: vertical structure; claims 1–2.

### US5912839A

Priority Date: 1998-06-23; Assignment Record: Original Applicant/Assignee: Energy Conversion Devices; Figures and Passages: Figure 1: current and resistance operating regions; claims 1, 18, and 23.

### US4873664A

Priority Date: 1987-02-12; Assignment Record: Original Applicant/Assignee: Ramtron; Figures and Passages: Use claim 1 to identify the ferroelectric capacitor, switching device, bit line, word line, plate line, and restoration sequence.

### US10153155B2

Priority Date: 2015-10-09; Assignment Record: Original Applicant/Assignee: University of Florida Research Foundation; Figures and Passages: Figures 1/2: stack; Figure 4: material images; claim 1.

### US11502083B2

Priority Date: 2019-03-26; Assignment Record: Original Applicant/Assignee: Xiangtan University; Figures and Passages: Figures 2 and 3A–3F: device and process steps; claim 1.

### US20240057343A1

Priority Date: 2022-08-11; Assignment Record: Original Applicant/Assignee: Taiwan Semiconductor Manufacturing Company (TSMC); Figures and Passages: Figure 17: FTJ connection to a transistor; claims 1 and 17.

## System Review Questions

### From One Bit to a Complete Array: Selection, Sensing, and Program Verify

A paper demonstrates that an RRAM cell switches with a 10 ns pulse. Does that establish a 10 ns write time for a 1 Gb memory? What additional categories of evidence are needed?

No. Establish whether the material and implementation are the same, whether selection uses 1T1R or 1S1R, the actual bias at the array's worst location, sense margin, pulse and verification counts, retry and failure thresholds, ECC and peripheral latency, and the product's definition of write completion. The cell pulse describes only one part of the complete path.

### SCM and Persistent Memory: From Media to Systems

A CXL card uses DRAM plus NAND and advertises memory expansion. Can it be called persistent memory on that basis alone? Can power be removed immediately after a program completes a store?

The interface or combination of media is insufficient. Verify whether the device exposes a persistent range, its backup energy and save/restore mechanism, protection for buffers from host to device, synchronization and ordering semantics, and the software recovery method. Store completion does not necessarily mean the data have reached the persistence domain. Even after persistence, updates to multiple fields still require failure atomicity and consistency.

## Annual Symposium Source Coverage

### 2022

TSMC's public release establishes only the relevant platform scope; GF's investor platform chart was obtained through indexed text. Node-specific completion status is supported by annual reports and formal product announcements.

- [FND-TSMC-SYMP-2022: TSMC 2022 North America Technology Symposium Press Release](https://pr.tsmc.com/english/news/2939)
- [FND-GF-2022-MAP: GF 2022 Investor Presentation: Platform Feature Roadmap](https://investors.gf.com/static-files/65f5f1b9-2aea-47a3-8455-10413c6560f4)

### 2023

TSMC's main symposium release was reviewed, but no complete MRAM roadmap was found. The graphical associations in GF's chart were not fully verified, so the limitations are retained.

- [FND-TSMC-SYMP-2023: TSMC 2023 North America Technology Symposium Press Release](https://pr.tsmc.com/system/files/newspdf/attachment/af320740c347534184a5705ac01982e22e743978/2023%20Tech%20Symposium%20%28E%29_final_wmn.pdf)
- [FND-GF-2023-MAP: GF 2023 Investor Presentation: Platforms and Features](https://investors.gf.com/static-files/9aecbb31-1a7a-43a5-b1ed-d5e0d4380cee)

### 2024

TSMC's main release is not a complete memory timeline. GF's official automotive technical article supports the direction of 12LP+ MRAM but provides no volume-production date.

- [FND-TSMC-SYMP-2024: TSMC 2024 North America Technology Symposium Press Release](https://pr.tsmc.com/english/news/3136)
- [FND-GF-2024-AUTO: GF: Automotive Platform Innovation and 12LP+ AutoPro150](https://gf.com/news-and-events/blog/driving-automotive-innovation-on-the-semiconductor-superhighway/)

### 2025

GF's annual summit provides directly citable evidence of RRAM prototyping availability and a 2026 target. TSMC completion events are verified against the subsequent annual report.

- [FND-TSMC-SYMP-2025: TSMC 2025 North America Technology Symposium Press Release](https://pr.tsmc.com/system/files/newspdf/attachment/167c59998c7117f14c13647c8e46a6b20a43316c/2025%20Tech%20Symposium%20%28E%29_Final_wmn.pdf)
- [FND-GF-2025-RRAM: GF 2025 Technology Summit: 22FDX+ RRAM Available for Prototyping](https://gf.com/news-and-events/news/globalfoundries-announces-availability-of-22fdx-rram-technology-for-wireless-connectivity-and-ai-applications/)

### 2026

Access to TSMC's full videos beyond the public highlights requires an invitation; no access to restricted slides is claimed. GF's March AutoPro150 announcement and its undated current-status page are recorded separately.

- [FND-TSMC-SYMP-2026: TSMC 2026 North America Technology Symposium Press Release and Public Video Portal](https://pr.tsmc.com/english/news/3302)
- [FND-GF-2026-AUTO: GF: FDX+ AutoPro150 eMRAM Available for Prototyping](https://gf.com/news-and-events/news/globalfoundries-announces-availability-of-autopro-150-emram-technology-on-enhanced-fdx-platform-for-advanced-automotive-applications/)

## Foundry Performance Conditions

### GF 22FDX eMRAM (Version Announced in 2020)

One hundred thousand cycles; ten-year retention over −40°C to 125°C; five solder-reflow cycles; silicon-validated macros from 4–48 Mbit.

The announcement states Grade 2 design support; Grade 1 was a development target at the time.

The selectable 4–48 Mbit macro range, endurance, and retention metrics must not be treated as guaranteed in every combination. A complete test matrix is unavailable.

- [FND-GF-2020-MRAM: GF: 22FDX eMRAM Production Announcement](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram)

### GF FDX+ AutoPro150 eMRAM (2026)

Press release: up to five hundred thousand cycles, reads below 10 ns, and operation up to 150°C. Current page: more than five hundred thousand cycles and twenty-year retention at 150°C.

The sources use different wording, which is retained for each metric. Exact capacity, ECC, failure rate, and read/write conditions require the design kit.

Read latency is not write latency. Qualification for operation at 150°C and twenty-year data retention are different metrics.

- [FND-GF-2026-AUTO: GF: FDX+ AutoPro150 eMRAM Available for Prototyping](https://gf.com/news-and-events/news/globalfoundries-announces-availability-of-autopro-150-emram-technology-on-enhanced-fdx-platform-for-advanced-automotive-applications/)
- [FND-GF-CURRENT-FDX: GF Current FDX Platform and Embedded Memory Page](https://gf.com/technologies/cmos/fdx-fd-soi/)

### GF 12LP/12LP+ MRAM

No MRAM macro performance specification with complete traceability was obtained in this review.

12LP is a FinFET joint-development platform; official 12LP+ articles describe an automotive offering.

Neither 22FDX figures nor improvements in 12LP+ logic performance are transferred to MRAM performance.

- [FND-EVERSPIN-12LP: Everspin/GF 12LP MRAM Joint Development Agreement Amendment](https://www.sec.gov/Archives/edgar/data/1438423/000155837021002369/mram-20201231xex10d11d4.htm)
- [FND-GF-2024-AUTO: GF: Automotive Platform Innovation and 12LP+ AutoPro150](https://gf.com/news-and-events/blog/driving-automotive-innovation-on-the-semiconductor-superhighway/)
- [FND-GF-2025-MCU: GF: Automotive MCUs and Software-Defined Vehicles](https://gf.com/news-and-events/blog/inside-a-cars-digital-brain-mcus-the-engine-powering-sdv-innovation/)

### TSMC 16FFC/Second-Generation 16MRAM

Early 16FFC: one million cycles and solder-reflow capability. Second-generation 16MRAM: chip failure rate below 1 ppm after one million cycles.

Statements from different annual reports and technology generations are kept separate. The second generation completed automotive qualification in 2025.

The public summaries do not disclose complete capacity, temperature, ECC, or sample-distribution information. These results cannot be directly compared with the write error rate of an individual MTJ.

- [FND-TSMC-2023-AR: TSMC 2023 Annual Report, Chapter Five: Process Services and Emerging Memory](https://investor.tsmc.com/static/annualReports/2023/english/pdf/2023_tsmc_ar_e_ch5.pdf)
- [FND-TSMC-2025-AR: TSMC 2025 Annual Report: Second-Generation MRAM and Third-Generation RRAM](https://investor.tsmc.com/static/annualReports/2025/english/pdf/2025_tsmc_ar_e_ch5.pdf)

### TSMC 22RRAM/N12e RRAM

22RRAM completed qualification for one hundred thousand cycles in 2025; N12e completed consumer-grade qualification for production in 2025.

High-endurance options, automotive options, and consumer-grade platforms have distinct qualification scopes.

Without complete macro data, no single shared endurance or retention value is assigned to all RRAM.

- [FND-TSMC-2025-AR: TSMC 2025 Annual Report: Second-Generation MRAM and Third-Generation RRAM](https://investor.tsmc.com/static/annualReports/2025/english/pdf/2025_tsmc_ar_e_ch5.pdf)
- [FND-TSMC-2025-20F: TSMC Form 20-F for Fiscal Year 2025](https://www.sec.gov/Archives/edgar/data/1046179/000162828026025362/tsm-20251231.htm)

## Roadmap Reading Corrections

### Assigning 2025 as the First Automotive Qualification Year for All 16nm MRAM

16FFC has a documented Grade 1 completion in 2023. Separate automotive milestones for smaller bits and second-generation 16MRAM appear in 2024–2025. Preserve the version distinctions and the limitation that a complete macro mapping is unavailable.

- [FND-TSMC-2023-AR: TSMC 2023 Annual Report, Chapter Five: Process Services and Emerging Memory](https://investor.tsmc.com/static/annualReports/2023/english/pdf/2023_tsmc_ar_e_ch5.pdf)
- [FND-TSMC-2024-AR: TSMC 2024 Annual Report: Emerging Memory with Smaller Bits](https://investor.tsmc.com/static/annualReports/2024/english/ebook/files/basic-html/page104.html)
- [FND-TSMC-2025-AR: TSMC 2025 Annual Report: Second-Generation MRAM and Third-Generation RRAM](https://investor.tsmc.com/static/annualReports/2025/english/pdf/2025_tsmc_ar_e_ch5.pdf)

### Treating the 2024 N12 RRAM Technology Qualification as Volume Production

Record the 2024 technology qualification, the 2025 consumer-grade qualification for production, and the product page's volume-production confirmation as of the verification date separately. No unique first volume-production date has been established.

- [FND-TSMC-2024-AR: TSMC 2024 Annual Report: Emerging Memory with Smaller Bits](https://investor.tsmc.com/static/annualReports/2024/english/ebook/files/basic-html/page104.html)
- [FND-TSMC-2025-AR: TSMC 2025 Annual Report: Second-Generation MRAM and Third-Generation RRAM](https://investor.tsmc.com/static/annualReports/2025/english/pdf/2025_tsmc_ar_e_ch5.pdf)
- [FND-TSMC-CURRENT-NVM: TSMC Current Embedded Nonvolatile Memory Page](https://www.tsmc.com/english/dedicatedFoundry/technology/specialty/eflash)

### Reporting GF 22FDX+ RRAM's 2026 Target as Completed

The 2025 summit announced prototyping availability and preliminary design kits. The verifiable 2026 milestone remains a target and requires a subsequent completion announcement.

- [FND-GF-2025-RRAM: GF 2025 Technology Summit: 22FDX+ RRAM Available for Prototyping](https://gf.com/news-and-events/news/globalfoundries-announces-availability-of-22fdx-rram-technology-for-wireless-connectivity-and-ai-applications/)

### Treating GF's 2020 CBRAM Collaboration and 2025 OxRAM as the Same Product

The conductive-bridge material mechanism and oxide resistive switching cannot be merged under the shared RRAM name. Record each collaboration, platform, version, and schedule separately.

- [FND-GF-2020-CBRAM: GF and Dialog: 22FDX CBRAM Licensing Agreement](https://investors.gf.com/node/6441/pdf)
- [FND-GF-2025-RRAM: GF 2025 Technology Summit: 22FDX+ RRAM Available for Prototyping](https://gf.com/news-and-events/news/globalfoundries-announces-availability-of-22fdx-rram-technology-for-wireless-connectivity-and-ai-applications/)

### Conflating 12LP, 12LP+, and 22FDX as a Single MRAM Platform

12LP/12LP+ belong to the FinFET family; 22FDX is FD-SOI. Joint development, application marketing, and production-macro qualification require separate evidence.

- [FND-EVERSPIN-12LP: Everspin/GF 12LP MRAM Joint Development Agreement Amendment](https://www.sec.gov/Archives/edgar/data/1438423/000155837021002369/mram-20201231xex10d11d4.htm)
- [FND-GF-2024-AUTO: GF: Automotive Platform Innovation and 12LP+ AutoPro150](https://gf.com/news-and-events/blog/driving-automotive-innovation-on-the-semiconductor-superhighway/)
- [FND-GF-2020-MRAM: GF: 22FDX eMRAM Production Announcement](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram)

### Assuming That All Emerging NVM Remains Outside Volume Production

Production evidence exists for GF 22FDX MRAM and multiple TSMC MRAM/RRAM nodes. New nodes, automotive variants, and high-endurance variants still require their own qualification.

- [FND-GF-2020-MRAM: GF: 22FDX eMRAM Production Announcement](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram)
- [FND-TSMC-CURRENT-NVM: TSMC Current Embedded Nonvolatile Memory Page](https://www.tsmc.com/english/dedicatedFoundry/technology/specialty/eflash)


## Operation State Diagrams

### efuse · Program: Concentrate Current in a Controlled Region

#### Silicide/Polysilicon eFuse

Electromigration opens a silicide gap at the neck; underlying polysilicon can remain, so high resistance does not imply complete physical separation.

1. **Initial Path** — The intact conductor provides a low-resistance path. R ↓ Unprogrammed
2. **Apply Program Conditions** — Current crowds at the constriction, producing local heat and electromigration. Before transition I_P → J ↑
3. **Local Permanent Change** — Material migration leaves a local void or gap. R ↑ Controlled program pulse
4. **Verify at Low Field** — After program stress is removed, read current identifies the permanent state. I_R ↓ V_R ≪ V_P

- [ch-pat-efuse-poly: IBM: Locally Narrowed Electrical Fuse Patent US7417300B2](https://patents.google.com/patent/US7417300B2/en)

#### Metal-Via eFuse

Shows current crowding, local heating, and melt separation near the via; a silicide electromigration path is not substituted.

1. **Initial Path** — The intact conductor provides a low-resistance path. R ↓ Unprogrammed
2. **Apply Program Conditions** — Current crowding generates local heat near the via. Before transition I_P → J ↑
3. **Local Permanent Change** — Material near the via heats, melts, and separates, leaving a high-resistance gap. R ↑ Controlled program pulse
4. **Verify at Low Field** — After program stress is removed, read current identifies the permanent state. I_R ↓ V_R ≪ V_P

- [ch-pat-efuse-via: TSMC: Metal Via Fuse Patent US8847350B2](https://patents.google.com/patent/US8847350B2/en)

### efuse · Erase: No Reverse Recovery in Normal Operation

#### Silicide/Polysilicon eFuse

Electromigration opens a silicide gap at the neck; underlying polysilicon can remain, so high resistance does not imply complete physical separation.

1. **Original Material** — Keep the unprogrammed structure as a reference. R ↓ No high-field pulse
2. **After Permanent Change** — Removing normal power does not restore the original material. R ↑ Program pulse completed
3. **Reverse Operation Unavailable** — No qualified electrical erase path exists; read still detects the changed state. I_R ↓ Reverse bias is not an erase procedure

- [ch-pat-efuse-poly: IBM: Locally Narrowed Electrical Fuse Patent US7417300B2](https://patents.google.com/patent/US7417300B2/en)

#### Metal-Via eFuse

Shows current crowding, local heating, and melt separation near the via; a silicide electromigration path is not substituted.

1. **Original Material** — Keep the unprogrammed structure as a reference. R ↓ No high-field pulse
2. **After Permanent Change** — Removing normal power does not restore the original material. R ↑ Program pulse completed
3. **Reverse Operation Unavailable** — No qualified electrical erase path exists; read still detects the changed state. I_R ↓ Reverse bias is not an erase procedure

- [ch-pat-efuse-via: TSMC: Metal Via Fuse Patent US8847350B2](https://patents.google.com/patent/US8847350B2/en)

### efuse · Read: Measure Resistance Without Reprogramming

#### Silicide/Polysilicon eFuse

Electromigration opens a silicide gap at the neck; underlying polysilicon can remain, so high resistance does not imply complete physical separation.

1. **Written Material Retained** — Start with permanently changed material; reading does not repair it. R ↑ Before read bias
2. **Apply Low-Field Read** — Observe the existing path under read conditions below program stress. R ↑ V_R ≪ V_P
3. **Measure Existing Conduction** — The gap reduces read current; high resistance does not mean an ideal open circuit. I_R ↓ Maintain low-field read
4. **Compare Initial and Written Branches** — Compare two pre-existing states at equal V_R; reading did not change the material. Resistance window distinguished V_R = const.

- [ch-pat-efuse-poly: IBM: Locally Narrowed Electrical Fuse Patent US7417300B2](https://patents.google.com/patent/US7417300B2/en)

#### Metal-Via eFuse

Shows current crowding, local heating, and melt separation near the via; a silicide electromigration path is not substituted.

1. **Written Material Retained** — Start with permanently changed material; reading does not repair it. R ↑ Before read bias
2. **Apply Low-Field Read** — Observe the existing path under read conditions below program stress. R ↑ V_R ≪ V_P
3. **Measure Existing Conduction** — The gap reduces read current; high resistance does not mean an ideal open circuit. I_R ↓ Maintain low-field read
4. **Compare Initial and Written Branches** — Compare two pre-existing states at equal V_R; reading did not change the material. Resistance window distinguished V_R = const.

- [ch-pat-efuse-via: TSMC: Metal Via Fuse Patent US8847350B2](https://patents.google.com/patent/US8847350B2/en)

### antifuse · Program: Apply the Breakdown Field Only to the Selected Dielectric

#### MOS Dielectric-Breakdown Antifuse

Storage element only: gate connects to column C, silicon to an internal node. The series select MOS and array periphery are omitted, not a complete commercial OTP cell.

1. **Initial Path** — Intact dielectric blocks low-field DC. R ↑ Unprogrammed
2. **Apply Program Conditions** — A high field stresses the thin dielectric; periphery limits stress. Before transition V_P → E
3. **Local Permanent Change** — A local conducting path lets electrons cross the former dielectric region. R ↓ Controlled program pulse
4. **Verify at Low Field** — After program stress is removed, read current identifies the permanent state. I_R ↑ V_R ≪ V_P

- [ch-pat-antifuse: Kilopass: Ultrathin Dielectric Breakdown Cell Patent US6667902B2](https://patents.google.com/patent/US6667902B2/en)

### antifuse · Erase: No Repair of the Broken-Down Dielectric in Normal Operation

#### MOS Dielectric-Breakdown Antifuse

Storage element only: gate connects to column C, silicon to an internal node. The series select MOS and array periphery are omitted, not a complete commercial OTP cell.

1. **Original Material** — Keep the unprogrammed structure as a reference. R ↑ No high-field pulse
2. **After Permanent Change** — Removing normal power does not restore the original material. R ↓ Program pulse completed
3. **Reverse Operation Unavailable** — No qualified electrical erase path exists; read still detects the changed state. I_R ↑ Reverse bias is not an erase procedure

- [ch-pat-antifuse: Kilopass: Ultrathin Dielectric Breakdown Cell Patent US6667902B2](https://patents.google.com/patent/US6667902B2/en)

### antifuse · Read: Distinguish an Intact Dielectric from a Conductive Path

#### MOS Dielectric-Breakdown Antifuse

Storage element only: gate connects to column C, silicon to an internal node. The series select MOS and array periphery are omitted, not a complete commercial OTP cell.

1. **Written Material Retained** — Start with permanently changed material; reading does not repair it. R ↓ Before read bias
2. **Apply Low-Field Read** — Observe the existing path under read conditions below program stress. R ↓ V_R ≪ V_P
3. **Measure Existing Conduction** — The broken-down region conducts more strongly; its geometry is unchanged. I_R ↑ Maintain low-field read
4. **Compare Initial and Written Branches** — Compare two pre-existing states at equal V_R; reading did not change the material. Resistance window distinguished V_R = const.

- [ch-pat-antifuse: Kilopass: Ultrathin Dielectric Breakdown Cell Patent US6667902B2](https://patents.google.com/patent/US6667902B2/en)

### eeprom · Program: Establish Stored Charge Through a Local Window

#### Local Window: FN Program/Tunnel Erase

The n-channel branch expressly permitted by US4115914A is redrawn with n+ contacts and p-type silicon. Most original process figures use a p-channel example; this is not a literal reproduction of that process section. This sequence uses tunneling only.

1. **Known Initial Charge** — Isolated storage starts within its programmable window. Q ≈ 0 Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q ≈ 0 V_G > V_CH
3. **Track Electron Transfer** — Electrons tunnel through the local barrier into isolated storage. Q < 0 V_G > V_CH
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↑ Low-field read verification

- [ch-pat-eeprom-window: Hughes Aircraft Company: Local Tunnel-Window EEPROM Patent US4115914A](https://patents.google.com/patent/US4115914A/en)

### eeprom · Erase: Reverse the Window Field to Remove Electrons

#### Local Window: FN Program/Tunnel Erase

The n-channel branch expressly permitted by US4115914A is redrawn with n+ contacts and p-type silicon. Most original process figures use a p-channel example; this is not a literal reproduction of that process section. This sequence uses tunneling only.

1. **Known Initial Charge** — Locate programmed charge and this variant’s exit. Q < 0; Vₜ ↑ Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q < 0 V_G < V_CH
3. **Track Electron Transfer** — Electrons leave storage through this variant’s specified exit. Q → 0 V_G < V_CH
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↓ Low-field read verification

- [ch-pat-eeprom-window: Hughes Aircraft Company: Local Tunnel-Window EEPROM Patent US4115914A](https://patents.google.com/patent/US4115914A/en)

### eeprom · Read: Sense the Channel and Return Data Through the Interface

#### Local Window: FN Program/Tunnel Erase

The n-channel branch expressly permitted by US4115914A is redrawn with n+ contacts and p-type silicon. Most original process figures use a p-channel example; this is not a literal reproduction of that process section. This sequence uses tunneling only.

1. **Stored State Retained** — Drawn stored carriers represent data, not the source of read current. Q < 0 Inspect the existing state
2. **Apply Low-Field Read Bias** — Select the measured path and apply low-field read conditions. Charge remains in storage V_R; |V_DS| = v
3. **Conduction Response** — The stored state determines sense current under the same read bias. I_R ↓ Normal read field
4. **Compare Sense Results** — Compare stored states under equal read conditions; logic encoding is not assigned. Distinguishable read window V_R = const.

- [ch-pat-eeprom-window: Hughes Aircraft Company: Local Tunnel-Window EEPROM Patent US4115914A](https://patents.google.com/patent/US4115914A/en)

### mtp · Program: Establish the Identified Cell's Charge-Transfer Path

#### Double-Poly EEPROM: Local-Window Principle

Uses the control/floating gates and local window in US4115914A to explain the double-poly EEPROM route. This is not a named foundry macro cross-section; process details, tunneling terminals and operating conditions remain vendor-specific.

1. **Known Initial Charge** — Isolated storage starts within its programmable window. Q ≈ 0 Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q ≈ 0 V_G > V_CH
3. **Track Electron Transfer** — Electrons tunnel through the local barrier into isolated storage. Q < 0 V_G > V_CH
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↑ Low-field read verification

- [ch-pat-eeprom-window: Hughes Aircraft Company: Local Tunnel-Window EEPROM Patent US4115914A](https://patents.google.com/patent/US4115914A/en)

#### Single Poly: Buried-Control CHE/Source FN Example

Figures 4 and 5 of US5844271A share one FG conductor, with control buried in silicon. This teaching example does not define current vendors’ MTP cells or carrier paths. Erase coupling remains symbolic; inconsistent read entries in Table 2 are not reproduced.

1. **Known Initial Charge** — Isolated storage starts within its programmable window. Q ≈ 0 Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q ≈ 0 G/CG +V_P; D +V_P; S = 0
3. **Track Electron Transfer** — Channel electrons accelerate before local injection into storage. Q < 0 G/CG +V_P; D +V_P; S = 0
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↑ Low-field read verification

- [ch-pat-eeprom-singlepoly: Cypress Semiconductor: Buried-Control-Gate Single-Poly EEPROM Patent US5844271A](https://patents.google.com/patent/US5844271A/en)

### mtp · ERS: Restore a State Suitable for Reprogramming

#### Double-Poly EEPROM: Local-Window Principle

Uses the control/floating gates and local window in US4115914A to explain the double-poly EEPROM route. This is not a named foundry macro cross-section; process details, tunneling terminals and operating conditions remain vendor-specific.

1. **Known Initial Charge** — Locate programmed charge and this variant’s exit. Q < 0; Vₜ ↑ Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q < 0 V_G < V_CH
3. **Track Electron Transfer** — Electrons leave storage through this variant’s specified exit. Q → 0 V_G < V_CH
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↓ Low-field read verification

- [ch-pat-eeprom-window: Hughes Aircraft Company: Local Tunnel-Window EEPROM Patent US4115914A](https://patents.google.com/patent/US4115914A/en)

#### Single Poly: Buried-Control CHE/Source FN Example

Figures 4 and 5 of US5844271A share one FG conductor, with control buried in silicon. This teaching example does not define current vendors’ MTP cells or carrier paths. Erase coupling remains symbolic; inconsistent read entries in Table 2 are not reproduced.

1. **Known Initial Charge** — Locate programmed charge and this variant’s exit. Q < 0; Vₜ ↑ Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q < 0 V_S > V_FG
3. **Track Electron Transfer** — Electrons leave storage through this variant’s specified exit. Q → 0 V_S > V_FG
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↓ Low-field read verification

- [ch-pat-eeprom-singlepoly: Cypress Semiconductor: Buried-Control-Gate Single-Poly EEPROM Patent US5844271A](https://patents.google.com/patent/US5844271A/en)

### mtp · Read: Sense the Selected Channel Under Normal Bias

#### Double-Poly EEPROM: Local-Window Principle

Uses the control/floating gates and local window in US4115914A to explain the double-poly EEPROM route. This is not a named foundry macro cross-section; process details, tunneling terminals and operating conditions remain vendor-specific.

1. **Stored State Retained** — Drawn stored carriers represent data, not the source of read current. Q < 0 Inspect the existing state
2. **Apply Low-Field Read Bias** — Select the measured path and apply low-field read conditions. Charge remains in storage V_R; |V_DS| = v
3. **Conduction Response** — The stored state determines sense current under the same read bias. I_R ↓ Normal read field
4. **Compare Sense Results** — Compare stored states under equal read conditions; logic encoding is not assigned. Distinguishable read window V_R = const.

- [ch-pat-eeprom-window: Hughes Aircraft Company: Local Tunnel-Window EEPROM Patent US4115914A](https://patents.google.com/patent/US4115914A/en)

#### Single Poly: Buried-Control CHE/Source FN Example

Figures 4 and 5 of US5844271A share one FG conductor, with control buried in silicon. This teaching example does not define current vendors’ MTP cells or carrier paths. Erase coupling remains symbolic; inconsistent read entries in Table 2 are not reproduced.

1. **Stored State Retained** — Drawn stored carriers represent data, not the source of read current. Q < 0 Inspect the existing state
2. **Apply Low-Field Read Bias** — Select the measured path and apply low-field read conditions. Charge remains in storage V_R; |V_DS| = v
3. **Conduction Response** — The stored state determines sense current under the same read bias. I_R ↓ Normal read field
4. **Compare Sense Results** — Compare stored states under equal read conditions; logic encoding is not assigned. Distinguishable read window V_R = const.

- [ch-pat-eeprom-singlepoly: Cypress Semiconductor: Buried-Control-Gate Single-Poly EEPROM Patent US5844271A](https://patents.google.com/patent/US5844271A/en)

### nor · Program: Compare Channel Hot-Electron and Source-Side Injection

#### Stacked Gate: Drain CHE/Source FN

Corresponds to conventional stacked-gate mechanisms in the background of US6232180B1, not to its proposed split-gate invention.

1. **Known Initial Charge** — Isolated storage starts within its programmable window. Q ≈ 0 Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q ≈ 0 G/CG +V_P; D +V_P; S = 0
3. **Track Electron Transfer** — Channel electrons accelerate before local injection into storage. Q < 0 G/CG +V_P; D +V_P; S = 0
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↑ Low-field read verification

- [ch-pat-nor-splitgate: Worldwide Semiconductor Manufacturing / TSMC: Split-Gate Flash Patent US6232180B1](https://patents.google.com/patent/US6232180B1/en)

#### SuperFlash: SSI/Inter-Gate FN

WL-poly erase exit of the first/second generation; third-generation dedicated erase gates and another patent’s well-erase conditions are not substituted.

1. **Known Initial Charge** — Isolated storage starts within its programmable window. Q ≈ 0 Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q ≈ 0 SG = V_ON; S +V_P; D = 0
3. **Track Electron Transfer** — Channel electrons accelerate before local injection into storage. Q < 0 SG = V_ON; S +V_P; D = 0
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↑ Low-field read verification

- [ch-tech-superflash: SST / Microchip: SuperFlash Technology Brochure DS00001425F](https://ww1.microchip.com/downloads/aemDocuments/documents/sst/product-documents/brochures/00001425F.pdf)

#### US6232180B1: SSI/Well-Channel FN

SG is below an overlapping FG; source is raised for program, while SG/S/D float and the well is raised for erase.

1. **Known Initial Charge** — Isolated storage starts within its programmable window. Q ≈ 0 Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q ≈ 0 SG = V_ON; S +V_P; D = 0
3. **Track Electron Transfer** — Channel electrons accelerate before local injection into storage. Q < 0 SG = V_ON; S +V_P; D = 0
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↑ Low-field read verification

- [ch-pat-nor-splitgate: Worldwide Semiconductor Manufacturing / TSMC: Split-Gate Flash Patent US6232180B1](https://patents.google.com/patent/US6232180B1/en)

### nor · Erase: Follow the Structure's Electron Exit Path

#### Stacked Gate: Drain CHE/Source FN

Corresponds to conventional stacked-gate mechanisms in the background of US6232180B1, not to its proposed split-gate invention.

1. **Known Initial Charge** — Locate programmed charge and this variant’s exit. Q < 0; Vₜ ↑ Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q < 0 V_G < V_CH
3. **Track Electron Transfer** — Electrons leave storage through this variant’s specified exit. Q → 0 V_G < V_CH
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↓ Low-field read verification

- [ch-pat-nor-splitgate: Worldwide Semiconductor Manufacturing / TSMC: Split-Gate Flash Patent US6232180B1](https://patents.google.com/patent/US6232180B1/en)

#### SuperFlash: SSI/Inter-Gate FN

WL-poly erase exit of the first/second generation; third-generation dedicated erase gates and another patent’s well-erase conditions are not substituted.

1. **Known Initial Charge** — Locate programmed charge and this variant’s exit. Q < 0; Vₜ ↑ Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q < 0 V_WL > V_FG
3. **Track Electron Transfer** — Electrons leave storage through this variant’s specified exit. Q → 0 V_WL > V_FG
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↓ Low-field read verification

- [ch-tech-superflash: SST / Microchip: SuperFlash Technology Brochure DS00001425F](https://ww1.microchip.com/downloads/aemDocuments/documents/sst/product-documents/brochures/00001425F.pdf)

#### US6232180B1: SSI/Well-Channel FN

SG is below an overlapping FG; source is raised for program, while SG/S/D float and the well is raised for erase.

1. **Known Initial Charge** — Locate programmed charge and this variant’s exit. Q < 0; Vₜ ↑ Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q < 0 SG/S/D = FLT; W +V_E
3. **Track Electron Transfer** — Electrons leave storage through this variant’s specified exit. Q → 0 SG/S/D = FLT; W +V_E
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↓ Low-field read verification

- [ch-pat-nor-splitgate: Worldwide Semiconductor Manufacturing / TSMC: Split-Gate Flash Patent US6232180B1](https://patents.google.com/patent/US6232180B1/en)

### nor · Read: Sense the Selected Cell's Channel Directly

#### Stacked Gate: Drain CHE/Source FN

Corresponds to conventional stacked-gate mechanisms in the background of US6232180B1, not to its proposed split-gate invention.

1. **Stored State Retained** — Drawn stored carriers represent data, not the source of read current. Q < 0 Inspect the existing state
2. **Apply Low-Field Read Bias** — Select the measured path and apply low-field read conditions. Charge remains in storage V_R; |V_DS| = v
3. **Conduction Response** — The stored state determines sense current under the same read bias. I_R ↓ Normal read field
4. **Compare Sense Results** — Compare stored states under equal read conditions; logic encoding is not assigned. Distinguishable read window V_R = const.

- [ch-pat-nor-splitgate: Worldwide Semiconductor Manufacturing / TSMC: Split-Gate Flash Patent US6232180B1](https://patents.google.com/patent/US6232180B1/en)

#### SuperFlash: SSI/Inter-Gate FN

WL-poly erase exit of the first/second generation; third-generation dedicated erase gates and another patent’s well-erase conditions are not substituted.

1. **Stored State Retained** — Drawn stored carriers represent data, not the source of read current. Q < 0 Inspect the existing state
2. **Apply Low-Field Read Bias** — Select the measured path and apply low-field read conditions. Charge remains in storage V_R; |V_DS| = v
3. **Conduction Response** — The stored state determines sense current under the same read bias. I_R ↓ Normal read field
4. **Compare Sense Results** — Compare stored states under equal read conditions; logic encoding is not assigned. Distinguishable read window V_R = const.

- [ch-tech-superflash: SST / Microchip: SuperFlash Technology Brochure DS00001425F](https://ww1.microchip.com/downloads/aemDocuments/documents/sst/product-documents/brochures/00001425F.pdf)

#### US6232180B1: SSI/Well-Channel FN

SG is below an overlapping FG; source is raised for program, while SG/S/D float and the well is raised for erase.

1. **Stored State Retained** — Drawn stored carriers represent data, not the source of read current. Q < 0 Inspect the existing state
2. **Apply Low-Field Read Bias** — Select the measured path and apply low-field read conditions. Charge remains in storage V_R; |V_DS| = v
3. **Conduction Response** — The stored state determines sense current under the same read bias. I_R ↓ Normal read field
4. **Compare Sense Results** — Compare stored states under equal read conditions; logic encoding is not assigned. Distinguishable read window V_R = const.

- [ch-pat-nor-splitgate: Worldwide Semiconductor Manufacturing / TSMC: Split-Gate Flash Patent US6232180B1](https://patents.google.com/patent/US6232180B1/en)

### sonos · Program: Distinguish Tunneling Capture from Local Hot-Electron Injection

#### Uniform SONOS: Electron/Hole Tunneling

Storage-transistor detail; Infineon’s 2T cell also has a series selector. Carrier paths follow the public Cypress patent without asserting a current macro’s complete stack.

1. **Known Initial Charge** — Isolated storage starts within its programmable window. Q ≈ 0 Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q ≈ 0 V_G > V_CH
3. **Track Electron Transfer** — Electrons tunnel through the local barrier into isolated storage. Q < 0 V_G > V_CH
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↑ Low-field read verification

- [ch-product-sonos: Infineon: SONOS Embedded Flash IP Solutions](https://www.infineon.com/products/memories/embedded-flash-ip-solutions)
- [ch-pat-sonos: NCR: SONOS Blocking-Oxide Patent WO1981000790A1](https://patents.google.com/patent/WO1981000790A1/en)
- [op-pat-sonos-fn: Cypress: SONOS ONO Stack Scaling](https://patents.google.com/patent/WO2014008160A2/en)

#### Localized NROM: CHE/Reverse Read

S/D keep their programming-time names; reverse read changes bias and current direction without silently renaming terminals.

1. **Known Initial Charge** — Isolated storage starts within its programmable window. Q ≈ 0 Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q ≈ 0 G/CG +V_P; D +V_P; S = 0
3. **Track Electron Transfer** — Channel electrons accelerate before local injection into storage. Q < 0 G/CG +V_P; D +V_P; S = 0
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↑ Low-field read verification

- [ch-pat-nrom: Saifun: Asymmetric Charge-Trapping Patent US5768192A](https://patents.google.com/patent/US5768192A/en)

### sonos · Erase: Follow the Trap Stack and Identified Mechanism

#### Uniform SONOS: Electron/Hole Tunneling

Storage-transistor detail; Infineon’s 2T cell also has a series selector. Carrier paths follow the public Cypress patent without asserting a current macro’s complete stack.

1. **Known Initial Charge** — Locate programmed charge and this variant’s exit. Q < 0; Vₜ ↑ Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q < 0 V_G < V_CH
3. **Hole Supply and Neutralization** — Holes enter the trap layer and reduce net stored negative charge. Q → 0 V_G < V_CH
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↓ Low-field read verification

- [ch-product-sonos: Infineon: SONOS Embedded Flash IP Solutions](https://www.infineon.com/products/memories/embedded-flash-ip-solutions)
- [ch-pat-sonos: NCR: SONOS Blocking-Oxide Patent WO1981000790A1](https://patents.google.com/patent/WO1981000790A1/en)
- [op-pat-sonos-fn: Cypress: SONOS ONO Stack Scaling](https://patents.google.com/patent/WO2014008160A2/en)

#### US6664588B2: Pocket BBT/Hot-Hole Erase

Follows the one-sided pocket of Figures 8A and 9; hole injection must overlap the stored-electron region. This separate erase example is not attributed to US5768192A.

1. **Known Initial Charge** — Locate programmed charge and this variant’s exit. Q < 0; Vₜ ↑ Before the operation pulse
2. **Establish the Required Field** — Negative gate and positive drain establish BBT and a local field at the pocket junction. Q < 0 G −V_E; D +V_E
3. **Hole Supply and Neutralization** — Holes enter the trap layer and reduce net stored negative charge. Q → 0 G −V_E; D +V_E
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↓ Low-field read verification

- [op-pat-nrom-hhi: Saifun: Self-Aligned NROM Programming and Erasure Areas](https://patents.google.com/patent/US6664588B2/en)

### sonos · Read: Sense the SONOS Window and the NROM Direction

#### Uniform SONOS: Electron/Hole Tunneling

Storage-transistor detail; Infineon’s 2T cell also has a series selector. Carrier paths follow the public Cypress patent without asserting a current macro’s complete stack.

1. **Stored State Retained** — Drawn stored carriers represent data, not the source of read current. Q < 0 Inspect the existing state
2. **Apply Low-Field Read Bias** — Select the measured path and apply low-field read conditions. Charge remains in storage V_R; |V_DS| = v
3. **Conduction Response** — The stored state determines sense current under the same read bias. I_R ↓ Normal read field
4. **Compare Sense Results** — Compare stored states under equal read conditions; logic encoding is not assigned. Distinguishable read window V_R = const.

- [ch-product-sonos: Infineon: SONOS Embedded Flash IP Solutions](https://www.infineon.com/products/memories/embedded-flash-ip-solutions)
- [ch-pat-sonos: NCR: SONOS Blocking-Oxide Patent WO1981000790A1](https://patents.google.com/patent/WO1981000790A1/en)
- [op-pat-sonos-fn: Cypress: SONOS ONO Stack Scaling](https://patents.google.com/patent/WO2014008160A2/en)

#### Localized NROM: CHE/Reverse Read

S/D keep their programming-time names; reverse read changes bias and current direction without silently renaming terminals.

1. **Stored State Retained** — Drawn stored carriers represent data, not the source of read current. Q < 0 Inspect the existing state
2. **Apply Low-Field Read Bias** — Bias original S and ground original D, reversing the program direction. Charge remains in storage V_R; |V_DS| = v
3. **Conduction Response** — The stored state determines sense current under the same read bias. I_R ↓ Normal read field
4. **Compare Sense Results** — Compare stored states under equal read conditions; logic encoding is not assigned. Distinguishable read window V_R = const.

- [ch-pat-nrom: Saifun: Asymmetric Charge-Trapping Patent US5768192A](https://patents.google.com/patent/US5768192A/en)

### nand · Program: Raise the Selected Wordline and Inhibit Other Channels

#### US7696559B2: Vertical String/Electron Tunneling

A string topology with an unfolded local film section. Erase follows source-line raising and electron release, not an asserted GIDL hole mechanism.

1. **Identify the String** — WL* identifies the target level; SGD/SGS control terminal access. Q ≈ 0 Before the program pulse
2. **Bias the Selected Channel** — BL=0 keeps the selected channel low; target WL receives V_PGM and neighbors V_PASS. V_CH ≈ 0 V_PGM > V_PASS
3. **Electrons Enter Storage** — The local section traces CH through tunnel dielectric into CTL, where electrons are trapped. Q < 0; Vₜ ↑ V_WL > V_CH
4. **Selected versus Inhibited** — The low channel at left programs; BL=V_DD at right precharges a floating, boosted channel and reduces tunneling field. Left: program; right: retain Same V_PGM, different V_CH

- [ch-pat-nand-vertical: Toshiba: Columnar-Semiconductor Vertical NAND Patent US7696559B2](https://patents.google.com/patent/US7696559B2/en)
- [ch-tech-nand: Kioxia: NAND Flash Memory Fundamentals](https://www.kioxia.com/en-jp/rd/technology/nand-flash.html)

### nand · Erase: Reset the Charge Window of a Shared Block

#### US7696559B2: Vertical String/Electron Tunneling

A string topology with an unfolded local film section. Erase follows source-line raising and electron release, not an asserted GIDL hole mechanism.

1. **Known Initial Charge** — Locate programmed charge and this variant’s exit. Q < 0; Vₜ ↑ Before the operation pulse
2. **Establish the Required Field** — Terminal conditions belong only to the named variant. Q < 0 SL +V_E; BL/SG = FLT
3. **Track Electron Transfer** — Electrons leave storage through this variant’s specified exit. Q → 0 SL +V_E; BL/SG = FLT
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↓ Low-field read verification

- [ch-pat-nand-vertical: Toshiba: Columnar-Semiconductor Vertical NAND Patent US7696559B2](https://patents.google.com/patent/US7696559B2/en)
- [ch-tech-nand: Kioxia: NAND Flash Memory Fundamentals](https://www.kioxia.com/en-jp/rd/technology/nand-flash.html)

#### GIDL Assist: Hole Supply/Trap Neutralization

A positive terminal above the select-gate potential generates electron–hole pairs. Only the upper supply is expanded; the other end depends on the example. Separate from the older floating-terminal erase.

1. **Known Initial Charge** — Locate programmed charge and this variant’s exit. Q < 0; Vₜ ↑ Before the operation pulse
2. **Establish the Required Field** — A positive terminal above the select gate separates electron–hole pairs and supplies channel holes. Q < 0 V_BL/SL > V_GIDL; WL = 0
3. **Hole Supply and Neutralization** — Holes enter the trap layer and reduce net stored negative charge. Q → 0 V_BL/SL > V_GIDL; WL = 0
4. **Remove High Field and Verify** — The state shifts toward its target window; residual charge and defects are not assumed absent. Vₜ ↓ Low-field read verification

- [op-nand-hole-erase: KIOXIA: Schottky Source Contact and Hole Supply](https://www.kioxia.com/en-jp/rd/technology/topics/topics-88.html)
- [op-pat-nand-gidl: SanDisk: GIDL-Assisted 3D NAND Erase](https://patents.google.com/patent/US10923196B1/en)

### nand · Read: Pass Unselected Cells and Sense the Selected Threshold

#### US7696559B2: Vertical String/Electron Tunneling

A string topology with an unfolded local film section. Erase follows source-line raising and electron release, not an asserted GIDL hole mechanism.

1. **Stored State Retained** — Drawn stored carriers represent data, not the source of read current. Start with a low-threshold state Inspect the existing state
2. **Apply Low-Field Read Bias** — Select the measured path and apply low-field read conditions. Charge remains in storage V_R; |V_DS| = v
3. **Conduction Response** — A low-threshold selected cell and pass-biased neighbors permit BL discharge; electrons travel SL to BL. I_R ↑ Normal read field
4. **Compare Sense Results** — Comparison branch: a high-threshold selected cell blocks the string; reading did not change its charge. Distinguishable read window V_R = const.

- [ch-pat-nand-vertical: Toshiba: Columnar-Semiconductor Vertical NAND Patent US7696559B2](https://patents.google.com/patent/US7696559B2/en)
- [ch-tech-nand: Kioxia: NAND Flash Memory Fundamentals](https://www.kioxia.com/en-jp/rd/technology/nand-flash.html)

### toggle · Toggle MRAM · Write / SET

#### Nearly balanced two-layer SAF; ordered-field teaching model

Compare data before following H1, overlapping H1/H2, H2, and field removal; reading senses junction resistance.

1. **Read and Confirm a Toggle Is Needed** — M1 starts parallel at low R to REF. A read/compare decision precedes toggling. Initial state retained H1 = H2 = 0
2. **H1 Rises: Rotation Starts** — H1 alone starts spin-flop rotation of the SAF moments while they remain largely antiparallel. Coupled moments rotating H1 only
3. **H1 and H2 Overlap** — H2 rises before H1 ends. The resultant field changes direction and both moments continue along the same rotational sense. Coupled moments rotating H1 and H2 overlap
4. **Remove H1; Retain H2** — H1 falls first. H2 continues driving the moments beyond the hard-axis instability. Coupled moments rotating H2 only
5. **Remove H2; Settle in the Opposite State** — After H2 falls, the moments return to the easy axis. M1 has reversed about 180°, reaching antiparallel high R. Opposite state retained H1 = H2 = 0

- [EMG-P-TOGGLE: Motorola: Toggle Writing Patent US6545906B1](https://patents.google.com/patent/US6545906B1/en)

### toggle · Toggle MRAM · Reverse Rewrite / RESET

#### Nearly balanced two-layer SAF; ordered-field teaching model

Compare data before following H1, overlapping H1/H2, H2, and field removal; reading senses junction resistance.

1. **Read and Confirm a Toggle Is Needed** — M1 starts antiparallel at high R to REF. A read/compare decision precedes toggling. Initial state retained H1 = H2 = 0
2. **H1 Rises: Rotation Starts** — H1 alone starts spin-flop rotation of the SAF moments while they remain largely antiparallel. Coupled moments rotating H1 only
3. **H1 and H2 Overlap** — H2 rises before H1 ends. The resultant field changes direction and both moments continue along the same rotational sense. Coupled moments rotating H1 and H2 overlap
4. **Remove H1; Retain H2** — H1 falls first. H2 continues driving the moments beyond the hard-axis instability. Coupled moments rotating H2 only
5. **Remove H2; Settle in the Opposite State** — After H2 falls, the moments return to the easy axis. M1 has reversed about 180°, reaching parallel low R. Opposite state retained H1 = H2 = 0

- [EMG-P-TOGGLE: Motorola: Toggle Writing Patent US6545906B1](https://patents.google.com/patent/US6545906B1/en)

### toggle · Toggle MRAM · Read

#### Nearly balanced two-layer SAF: resistance sensing from M1/REF alignment

Compare retained P/AP states at the same small bias, latch the current difference, then remove bias while retaining each alignment.

1. **Initial: Retained P and AP** — The two diagrams represent possible P and AP states. Their access paths are open and carry no read current. P and AP alignments remain retained Write fields and write currents are zero
2. **Select: Establish Small Read Currents** — Close the access paths at the same small bias. P carries more current and AP less current. Magnetic states unchanged; read nodes carry current Small read bias; access paths enabled
3. **Latch: Isolate and Retain Magnetization** — The sense circuit latches the current difference and removes read bias. Each magnetic alignment is retained. P and AP alignments remain retained Write fields and write currents are zero

- [EMG-P-TOGGLE: Motorola: Toggle Writing Patent US6545906B1](https://patents.google.com/patent/US6545906B1/en)

### stt · STT-MRAM · Write / SET

#### Perpendicular MTJ: upper free layer / MgO / lower reference

Separate conventional current from electron flow, then follow spin torque, free-layer reversal, and low-bias sensing.

1. **Initial: Access Transistor Off** — mF starts parallel to REF; no current crosses the junction. Initial stable magnetization Write current is zero
2. **Pulse: Spin Torque Deflects the Free Layer** — Enable WL. Electrons flow from upper free layer to lower REF. Orange Ic points oppositely while the free moment deflects. Free layer precessing/reversing WL enabled; write pulse through the MTJ
3. **Pulse Removed: Opposite Magnetization Retained** — After current stops, mF settles in AP at high R while REF retains its direction. Opposite stable magnetization Write current is zero

- [EMG-P-STT: IBM: Spin-Torque Structure Patent US5695864A](https://patents.google.com/patent/US5695864A/en)
- [op-stt-katine-2000: Katine et al.: Current-Driven Reversal in Co/Cu/Co Pillars](https://arxiv.org/abs/cond-mat/9908231)

### stt · STT-MRAM · Reverse Rewrite / RESET

#### Perpendicular MTJ: upper free layer / MgO / lower reference

Separate conventional current from electron flow, then follow spin torque, free-layer reversal, and low-bias sensing.

1. **Initial: Access Transistor Off** — mF starts antiparallel to REF; no current crosses the junction. Initial stable magnetization Write current is zero
2. **Pulse: Spin Torque Deflects the Free Layer** — Enable WL. Electrons flow from lower REF to upper free layer. Orange Ic points oppositely while the free moment deflects. Free layer precessing/reversing WL enabled; write pulse through the MTJ
3. **Pulse Removed: Opposite Magnetization Retained** — After current stops, mF settles in P at low R while REF retains its direction. Opposite stable magnetization Write current is zero

- [EMG-P-STT: IBM: Spin-Torque Structure Patent US5695864A](https://patents.google.com/patent/US5695864A/en)
- [op-stt-katine-2000: Katine et al.: Current-Driven Reversal in Co/Cu/Co Pillars](https://arxiv.org/abs/cond-mat/9908231)

### stt · STT-MRAM · Read

#### Perpendicular MTJ: upper free layer / MgO / lower reference

Enable low-bias sensing, compare P/AP junction currents, then latch and isolate the paths while retaining free-layer magnetization.

1. **Initial: Retained P and AP** — The two diagrams represent possible P and AP states. Their access paths are open and carry no read current. P and AP alignments remain retained Write fields and write currents are zero
2. **Select: Establish Small Read Currents** — Close the access paths at the same small bias. P carries more current and AP less current. Magnetic states unchanged; read nodes carry current Small read bias; access paths enabled
3. **Latch: Isolate and Retain Magnetization** — The sense circuit latches the current difference and removes read bias. Each magnetic alignment is retained. P and AP alignments remain retained Write fields and write currents are zero

- [EMG-P-STT: IBM: Spin-Torque Structure Patent US5695864A](https://patents.google.com/patent/US5695864A/en)
- [op-stt-katine-2000: Katine et al.: Current-Driven Reversal in Co/Cu/Co Pillars](https://arxiv.org/abs/cond-mat/9908231)

### sot · SOT-MRAM · Write / SET

#### Three-terminal SOT/MTJ teaching structure with an assist field

A lateral write line supplies spin injection; an independent upper terminal and MTJ branch provide sensing.

1. **Initial: Upper MTJ Terminal Isolated** — The free layer retains its initial state. R is isolated, so write current need not cross the barrier. Magnetization retained or relaxing to equilibrium Read/write excitation off
2. **Lateral Pulse and Spin Injection** — A calibrated W1/W2 pulse injects Js into the free layer. Explicit Hassist supplies symmetry breaking for this example. Free layer deflecting Lateral W1/W2 pulse and Hassist
3. **Relaxation after Pulse Removal** — Turn off the lateral pulse. The free moment relaxes toward the target equilibrium under effective fields and damping. Magnetization retained or relaxing to equilibrium Read/write excitation off
4. **Final: Opposite Magnetization** — The free layer settles in the opposite state. The write line carries no current, and the MTJ can be read independently later. Magnetization retained or relaxing to equilibrium Read/write excitation off

- [EMG-SOT24: imec: Functional SOT-MRAM Arrays and Cache Research](https://www.imec-int.com/en/articles/bringing-sot-mram-technology-closer-last-level-cache-memory-specifications)

### sot · SOT-MRAM · Reverse Rewrite / RESET

#### Three-terminal SOT/MTJ teaching structure with an assist field

A lateral write line supplies spin injection; an independent upper terminal and MTJ branch provide sensing.

1. **Initial: Upper MTJ Terminal Isolated** — The free layer retains its initial state. R is isolated, so write current need not cross the barrier. Magnetization retained or relaxing to equilibrium Read/write excitation off
2. **Lateral Pulse and Spin Injection** — A calibrated W1/W2 pulse injects Js into the free layer. Explicit Hassist supplies symmetry breaking for this example. Free layer deflecting Lateral W1/W2 pulse and Hassist
3. **Relaxation after Pulse Removal** — Turn off the lateral pulse. The free moment relaxes toward the target equilibrium under effective fields and damping. Magnetization retained or relaxing to equilibrium Read/write excitation off
4. **Final: Opposite Magnetization** — The free layer settles in the opposite state. The write line carries no current, and the MTJ can be read independently later. Magnetization retained or relaxing to equilibrium Read/write excitation off

- [EMG-SOT24: imec: Functional SOT-MRAM Arrays and Cache Research](https://www.imec-int.com/en/articles/bringing-sot-mram-technology-closer-last-level-cache-memory-specifications)

### sot · SOT-MRAM · Read

#### Three-terminal SOT/MTJ: R→W2 sensing path with W1 isolated

Sense from R through the MTJ and return via W2 while W1 stays isolated; latch and remove read current while retaining magnetization.

1. **Retain: Write and Read Paths Isolated** — The illustrated P state is retained with R and W1 isolated; no holding current is required. Magnetization retained or relaxing to equilibrium Read/write excitation off
2. **Read: Enable Only the MTJ Branch** — Read current passes from R through REF/barrier/free layer and returns via W2. W1 is isolated, so no W1→W2 write drive is applied. Magnetization retained or relaxing to equilibrium Only the R→W2 read branch
3. **Latch: Read Current Removed** — After latching the sensed value, open the R branch and stop read current; the free-layer direction is retained. Magnetization retained or relaxing to equilibrium Read/write excitation off

- [EMG-SOT24: imec: Functional SOT-MRAM Arrays and Cache Research](https://www.imec-int.com/en/articles/bringing-sot-mram-technology-closer-last-level-cache-memory-specifications)

### vcm · VCM ReRAM · Write / SET

#### Bipolar oxide model with an oxygen-exchange upper interface

Follow oxygen-ion exchange, oxygen-vacancy distribution, and a local gap through SET, RESET, and low-bias read.

1. **High-R Initial State: Gap in the Path** — The plate begins in a formed, RESET high-R state. A locally oxidized gap interrupts the oxygen-deficient path. Gapped oxygen-deficient path TE and BE are equipotential
2. **SET Bias: Oxygen Migrates Upward** — With the selected positive TE bias, O²− moves toward the upper exchange interface, leaving oxygen-deficient sites along the path. Gapped oxygen-deficient path Positive TE bias; BE at zero; current compliance enabled
3. **Oxygen-Vacancy Path Connects** — The local vacancy-rich path connects and resistance falls. Ilim limits excessive path growth and Joule heating. Connected oxygen-deficient low-R path Positive TE bias; BE at zero; current compliance enabled
4. **Bias Removed: Low Resistance Retained** — After SET bias is removed, the oxygen-deficient path remains connected without a holding voltage. Connected oxygen-deficient low-R path TE and BE are equipotential

- [op-vcm-reservoir-2026: Yuan et al.: Controlled Oxygen-Reservoir Electrodes for WO₃ Memory](https://www.nature.com/articles/s43246-026-01143-8)
- [EMG-P-VCM: HP: Multilayer Oxide Switching Patent US8331131B2](https://patents.google.com/patent/US8331131B2/en)

### vcm · VCM ReRAM · Reverse Rewrite / RESET

#### Bipolar oxide model with an oxygen-exchange upper interface

Follow oxygen-ion exchange, oxygen-vacancy distribution, and a local gap through SET, RESET, and low-bias read.

1. **Low-R Initial State: Vacancy Path Connected** — After SET, an oxygen-deficient region connects the electrodes and retains low resistance without bias. Low-R path with returning oxygen TE and BE are equipotential
2. **Reverse Bias: Oxygen Ions Return** — Reversing TE bias in this model returns O²− from the exchange region toward the local path; arrows indicate oxygen-ion motion. Low-R path with returning oxygen Negative TE bias; BE at zero
3. **Neck Reoxidation: A Gap Opens** — Oxygen reincorporation interrupts the narrowest path segment. The entire pre-existing path need not disappear. High-R state with a local gap Negative TE bias; BE at zero
4. **Bias Removed: High Resistance Retained** — After RESET bias is removed, the local gap and residual oxygen-deficient regions remain for a later high-R read. High-R state with a local gap TE and BE are equipotential

- [op-vcm-reservoir-2026: Yuan et al.: Controlled Oxygen-Reservoir Electrodes for WO₃ Memory](https://www.nature.com/articles/s43246-026-01143-8)
- [EMG-P-VCM: HP: Multilayer Oxide Switching Patent US8331131B2](https://patents.google.com/patent/US8331131B2/en)

### vcm · VCM ReRAM · Read

#### Bipolar oxide model with an oxygen-exchange upper interface

Follow oxygen-ion exchange, oxygen-vacancy distribution, and a local gap through SET, RESET, and low-bias read.

1. **Initial: Two Possible Resistance States** — Left and right are the low- and high-resistance alternatives for one cell. Read bias has not yet been applied. Low-R and high-R structures retained Operation bias is zero
2. **Small Bias: Compare Electronic Current** — Compare currents at the same small read bias, chosen to avoid appreciable ionic redistribution. Electronic sensing; ionic state approximately unchanged Small read bias; no SET or RESET pulse
3. **After Latching: Remove Bias and Retain Structure** — After the sense circuit latches the difference, current stops. The connected low-R path and local high-R gap remain retained. Low-R and high-R structures retained Operation bias is zero

- [op-vcm-reservoir-2026: Yuan et al.: Controlled Oxygen-Reservoir Electrodes for WO₃ Memory](https://www.nature.com/articles/s43246-026-01143-8)
- [EMG-P-VCM: HP: Multilayer Oxide Switching Patent US8331131B2](https://patents.google.com/patent/US8331131B2/en)

### ecm · ECM / CBRAM · Write / SET

#### Active Ag upper electrode / solid ion conductor / inert lower electrode

The active Ag electrode releases Ag+ by oxidation; ions drift to the cathode for reduction and nucleation, then the growing bridge connects before bias removal.

1. **High-R Initial State: No Metal Bridge** — Upper Ag is the oxidizable metal source and lower BE is inert. Initially no metallic bridge spans the medium. Unconnected state Operation bias is zero
2. **Ag Oxidation, Ion Drift, and Nucleation** — The Ag anode releases Ag+ and electrons. Ag+ drifts toward the cathode, where electrons reduce ions and initiate nucleation. Cathodic nucleation and metal growth Positive bias at upper Ag; SET current compliance
3. **Cathodic Reduction: Metal Grows Upward** — Cathodic metal deposition extends toward the Ag electrode. This selected growth direction is not universal across ECM. Cathodic nucleation and metal growth Positive bias at upper Ag; SET current compliance
4. **After Connection: Remove Bias and Retain the Bridge** — Current compliance limits bridge thickening. After connection and bias removal, the retained bridge supplies a low-R electronic path. Continuous silver bridge Operation bias is zero

- [EMG-P-ECM: Axon: Programmable Metallization Cell Patent US5761115A](https://patents.google.com/patent/US5761115A/en)

### ecm · ECM / CBRAM · Reverse Rewrite / RESET

#### Active Ag upper electrode / solid ion conductor / inert lower electrode

Apply reverse bias to a connected silver bridge, oxidize and dissolve its neck locally, then remove bias while retaining a high-R gap and residual metal.

1. **Low-R Initial State: Silver Bridge Connected** — A continuous silver bridge forms a low-R electronic path. Ionic transport and electronic conduction are distinct. Connected or locally dissolving metal bridge Operation bias is zero
2. **Reverse Bias: Neck Oxidizes and Dissolves** — Reverse bias oxidizes Ag at the bridge neck into Ag+. Released cations move toward the active electrode, now cathodic. Connected or locally dissolving metal bridge Negative bias at the upper Ag electrode
3. **Bridge Interrupted: Residual Metal Remains** — A critical neck gap interrupts the metallic connection between electrodes while residual deposits can remain. High-R gap with residual metal Negative bias at the upper Ag electrode
4. **Bias Removed: High-R Gap Retained** — After bias removal, the high-R gap remains. A later SET can use residual nucleation sites. High-R gap with residual metal Operation bias is zero

- [EMG-P-ECM: Axon: Programmable Metallization Cell Patent US5761115A](https://patents.google.com/patent/US5761115A/en)

### ecm · ECM / CBRAM · Read

#### Active Ag upper electrode / solid ion conductor / inert lower electrode

Compare low-bias currents for a retained metal bridge and a local gap; latch and remove read bias with the ionic structure approximately unchanged.

1. **Initial: Two Possible Resistance States** — Left and right are the low- and high-resistance alternatives for one cell. Read bias has not yet been applied. Low-R and high-R structures retained Operation bias is zero
2. **Small Bias: Compare Electronic Current** — Compare currents at the same small read bias, chosen to avoid appreciable ionic redistribution. Electronic sensing; ionic state approximately unchanged Small read bias; no SET or RESET pulse
3. **After Latching: Remove Bias and Retain Structure** — After the sense circuit latches the difference, current stops. The connected low-R path and local high-R gap remain retained. Low-R and high-R structures retained Operation bias is zero

- [EMG-P-ECM: Axon: Programmable Metallization Cell Patent US5761115A](https://patents.google.com/patent/US5761115A/en)

### pcm · Phase-Change Memory · Write / SET

#### Locally heated mushroom-type PCM principle cross-section

Heat the amorphous cap into a crystallization-favorable region below Tm, dwell for nucleation and growth, then cool into a retained crystalline low-R state.

1. **SET Start: Amorphous High Resistance** — The RESET-created amorphous cap A sits above the heater and increases cell resistance. Amorphous high R No heating pulse
2. **Heat into the Crystallization Region and Dwell** — SET raises the local temperature into a crystallization-favorable region below Tm and maintains sufficient dwell time. Crystallization-temperature region SET dwell; Tx < T < Tm
3. **Nuclei Grow: Amorphous Volume Crystallizes** — Thermally activated nucleation and grain growth reduce amorphous volume, governed by material and the temperature-time history. Nucleation and growth SET dwell; Tx < T < Tm
4. **Cooled Final State: Crystalline Low Resistance** — Cooling leaves continuous crystalline material C and lower resistance. This thermal history differs from melt-quench RESET. Crystalline low R No heating pulse

- [op-pcm-ibm-thermal-2016: Bakan et al.: Temperature Distribution during PCM Crystallization](https://research.ibm.com/publications/extracting-the-temperature-distribution-on-a-phase-change-memory-cell-during-crystallization)
- [EMG-PCMDRIFT: IBM: Temporal Resistance Evolution in Projected PCM](https://research.ibm.com/publications/state-dependence-and-temporal-evolution-of-resistance-in-projected-phase-change-memory)

### pcm · Phase-Change Memory · Reverse Rewrite / RESET

#### Locally heated mushroom-type PCM principle cross-section

A short strong pulse melts a local crystalline volume above Tm; a steep pulse fall rapidly quenches it into a retained amorphous cap and high resistance.

1. **RESET Start: Crystalline Low Resistance** — The initial local phase-change volume is crystalline, with conduction through material above the heater. Crystalline low R No heating pulse
2. **Strong Short Pulse: Local Temperature Exceeds Melting** — A short strong RESET pulse produces Joule heat, taking a local volume above Tm into liquid state L. Local liquid Short strong RESET pulse; T > Tm
3. **Rapid Cooling: Prevent Full Crystallization** — A steep pulse fall rapidly quenches the molten volume. Insufficient time for crystal growth produces an amorphous cap. Rapid quench forming amorphous material Steep pulse fall; rapid quench
4. **Cooled Final State: Amorphous High Resistance** — The amorphous cap A interrupts the low-R crystalline path and retains high resistance after cooling; no material is removed. Amorphous high R No heating pulse

- [op-pcm-ibm-thermal-2016: Bakan et al.: Temperature Distribution during PCM Crystallization](https://research.ibm.com/publications/extracting-the-temperature-distribution-on-a-phase-change-memory-cell-during-crystallization)
- [EMG-PCMDRIFT: IBM: Temporal Resistance Evolution in Projected PCM](https://research.ibm.com/publications/state-dependence-and-temporal-evolution-of-resistance-in-projected-phase-change-memory)

### pcm · Phase-Change Memory · Read

#### Locally heated mushroom-type PCM principle cross-section

Compare crystalline and amorphous currents at a small read bias, then latch and remove bias while retaining phase; read temperature stays below the crystallization region.

1. **Initial: Crystalline and Amorphous Alternatives** — C and A are alternative stored states of one cell. The local amorphous cap increases resistance. Crystalline and amorphous alternatives retained Zero bias
2. **Low-Energy Read: Below the Crystallization Region** — At a small read bias, the crystalline state carries greater current. Read energy is chosen to avoid appreciable crystallization or melting. Crystalline and amorphous alternatives retained Small read bias; Tread below Tx
3. **Current Latched: Original Phase Retained** — After latching the current difference, remove bias and retain each phase. Resistance can still drift with time, requiring sense margin. Crystalline and amorphous alternatives retained Zero bias

- [op-pcm-ibm-thermal-2016: Bakan et al.: Temperature Distribution during PCM Crystallization](https://research.ibm.com/publications/extracting-the-temperature-distribution-on-a-phase-change-memory-cell-during-crystallization)
- [EMG-PCMDRIFT: IBM: Temporal Resistance Evolution in Projected PCM](https://research.ibm.com/publications/state-dependence-and-temporal-evolution-of-resistance-in-projected-phase-change-memory)

### feram · Capacitor FeRAM · Write P↑

#### 1T1C: A PL-above-BL pulse writes P↑

Enable WL and raise PL above BL to switch domains with an upward field; remove capacitor bias and isolate the cell to retain P↑.

1. **Initial: Opposite Remanent Polarization** — The starting remanent polarization represents opposite data, with no voltage across the capacitor. Remanent polarization retained Capacitor terminals equipotential; WL=0
2. **Apply a Capacitor Pulse: Domains Switch** — Enable access and set PL above BL. A pulse meeting the effective switching condition drives domains upward. Domains switching BL=0; PL=V; WL=1
3. **Remove the Field: Target Polarization Retained** — Remove capacitor voltage and isolate the cell. Remanent polarization is retained; opposite data is directly rewritten without a block erase. Remanent polarization retained Capacitor terminals equipotential; WL=0

- [EMG-P-FERAM: Ramtron: Self-Restoring Ferroelectric Memory Patent US4873664A](https://patents.google.com/patent/US4873664A/en)

### feram · Capacitor FeRAM · Reverse Rewrite P↓

#### 1T1C: A BL-above-PL pulse rewrites P↓

Enable WL and raise BL above PL so a downward field rewrites P↑ as P↓; remove bias and isolate the cell to retain the opposite data.

1. **Initial: Opposite Remanent Polarization** — The starting remanent polarization represents opposite data, with no voltage across the capacitor. Remanent polarization retained Capacitor terminals equipotential; WL=0
2. **Apply a Capacitor Pulse: Domains Switch** — Enable access and set BL above PL. A pulse meeting the effective switching condition drives domains downward. Domains switching BL=V; PL=0; WL=1
3. **Remove the Field: Target Polarization Retained** — Remove capacitor voltage and isolate the cell. Remanent polarization is retained; opposite data is directly rewritten without a block erase. Remanent polarization retained Capacitor terminals equipotential; WL=0

- [EMG-P-FERAM: Ramtron: Self-Restoring Ferroelectric Memory Patent US4873664A](https://patents.google.com/patent/US4873664A/en)

### feram · Capacitor FeRAM · Read and Restore

#### 1T1C with external reference: two alternative initial-state branches

Distinguish switching and non-switching charge, latch the read value, then restore polarization as PL falls while WL stays enabled.

1. **Before Read: Two Possible Remanent Polarizations** — A and B represent two possible initial states of one 1T1C cell: P↑ or P↓. BL and PL are zero and WL is off. Two original polarization alternatives BL=PL=0; WL=0
2. **PL Rises: Separate Switching and Non-Switching Charge** — Enable WL and raise PL to create an upward field. A contributes Qns without switching; B switches and adds Qsw, creating distinct BL signals. B switches; unequal charge signals PL rises to V; WL=1
3. **Sense and Latch: Preserve the Original Data Decision** — The sense amplifier compares against an external reference and latches. In this convention A drives BL to zero and B to V; both presently have P↑. Original data latched; B requires restore SA drives BL; PL=V; WL=1
4. **PL Falls with WL Enabled: Restore B** — Keep WL enabled while PL falls to zero. A sees no reverse field; B retains BL at V, creating a downward field that restores its original P↓. B restores under downward field PL falls to zero; WL=1
5. **Isolate and Precharge: Original Polarization Retained** — After restore, turn WL off and precharge BL to zero. A and B retain their respective pre-read polarization; sensing plus restore completes the read. Both original polarizations retained WL=0, then BL precharge

- [EMG-P-FERAM: Ramtron: Self-Restoring Ferroelectric Memory Patent US4873664A](https://patents.google.com/patent/US4873664A/en)

### fefet · FeFET · Write / SET

#### Simplified n-channel MFIS: gate / ferroelectric / interface layer / silicon

Polarization changes channel-side bound charge and threshold voltage; sense channel current between the two Vt distributions.

1. **Initial: Opposite Polarization and Threshold** — Initial P points away from the channel, corresponding to higher n-channel Vt. Remanent polarization and Vt retained Read/write bias removed
2. **Gate Pulse: Polarization and Bound Charge Change** — The selected gate pulse drives P toward the channel, creating positive channel-side bound charge and lowering Vt. Polarization switching and Vt shift Gate write pulse relative to the channel
3. **Remanent Polarization: New Threshold Retained** — After the pulse, remanent polarization retains the Vt shift. Opposite data is directly rewritten; not every trap-related Vt shift is assigned to polarization. Remanent polarization and Vt retained Read/write bias removed

- [EMG-KIOXIA: KIOXIA: FeFET Trapping and Polarization Stability](https://www.kioxia.com/en-jp/rd/technology/topics/topics-67.html)

### fefet · FeFET · Reverse Rewrite / RESET

#### Simplified n-channel MFIS: gate / ferroelectric / interface layer / silicon

Polarization changes channel-side bound charge and threshold voltage; sense channel current between the two Vt distributions.

1. **Initial: Opposite Polarization and Threshold** — Initial P points toward the channel, corresponding to lower n-channel Vt. Remanent polarization and Vt retained Read/write bias removed
2. **Gate Pulse: Polarization and Bound Charge Change** — The selected gate pulse drives P away from the channel, creating negative channel-side bound charge and raising Vt. Polarization switching and Vt shift Gate write pulse relative to the channel
3. **Remanent Polarization: New Threshold Retained** — After the pulse, remanent polarization retains the Vt shift. Opposite data is directly rewritten; not every trap-related Vt shift is assigned to polarization. Remanent polarization and Vt retained Read/write bias removed

- [EMG-KIOXIA: KIOXIA: FeFET Trapping and Polarization Stability](https://www.kioxia.com/en-jp/rd/technology/topics/topics-67.html)

### fefet · FeFET · Read

#### Simplified n-channel MFIS: gate / ferroelectric / interface layer / silicon

Polarization changes channel-side bound charge and threshold voltage; sense channel current between the two Vt distributions.

1. **Before Read: Polarization Sets a Threshold Window** — The illustrated low-Vt state has polarization toward silicon and positive bound charge favoring an n-channel. The alternative high-Vt curve is also shown below. Polarization and two-state Vt window Read/write bias removed
2. **Sense: Gate Bias between Two Thresholds** — Use a small drain bias and Vg,r between Vt,L and Vt,H. Low Vt gives larger Id and high Vt smaller Id, flowing through the source-drain channel. Polarization and two-state Vt window Small Vd; Vt,L < Vg,r < Vt,H
3. **Remove Read Bias: Polarization Remains** — Remove read bias after latching the decision. Polarization and the Vt window remain; actual read bias must control disturbance. Polarization and two-state Vt window Read/write bias removed

- [EMG-KIOXIA: KIOXIA: FeFET Trapping and Polarization Stability](https://www.kioxia.com/en-jp/rd/technology/topics/topics-67.html)

### ftj · Ferroelectric Tunnel Junction · Write / SET

#### Named research stack: Cr/Au / BSO / n-type NSTO

Compare interfacial accumulation/depletion, effective barrier, and low-bias current for opposite polarizations.

1. **Initial: Original Polarization Sets the Interface** — Initial P points toward Cr/Au, giving NSTO depletion and high R. Remanent polarization and interface state Write bias removed
2. **Write Field: Polarization Reverses and Screening Rearranges** — Write voltage is defined at Cr/Au relative to NSTO, driving P toward NSTO. Interfacial bound charge and electronic screening rearrange. Polarization and screening switching Write pulse at Cr/Au relative to NSTO
3. **Final without Bias: Barrier Change Retained** — After write bias removal, remanent P retains interfacial accumulation and a smaller effective barrier. This polarization/resistance mapping is limited to the named research stack. Remanent polarization and interface state Write bias removed

- [EMG-FTJ24: Original Research: Atomic-Scale BSO Ferroelectric Tunnel Junctions](https://www.nature.com/articles/s41467-024-44927-7)

### ftj · Ferroelectric Tunnel Junction · Reverse Rewrite / RESET

#### Named research stack: Cr/Au / BSO / n-type NSTO

Compare interfacial accumulation/depletion, effective barrier, and low-bias current for opposite polarizations.

1. **Initial: Original Polarization Sets the Interface** — Initial P points toward NSTO, giving electron accumulation and low R. Remanent polarization and interface state Write bias removed
2. **Write Field: Polarization Reverses and Screening Rearranges** — Write voltage is defined at Cr/Au relative to NSTO, driving P toward Cr/Au. Interfacial bound charge and electronic screening rearrange. Polarization and screening switching Write pulse at Cr/Au relative to NSTO
3. **Final without Bias: Barrier Change Retained** — After write bias removal, remanent P retains NSTO depletion and a higher, wider effective barrier. This polarization/resistance mapping is limited to the named research stack. Remanent polarization and interface state Write bias removed

- [EMG-FTJ24: Original Research: Atomic-Scale BSO Ferroelectric Tunnel Junctions](https://www.nature.com/articles/s41467-024-44927-7)

### ftj · Ferroelectric Tunnel Junction · Read

#### Named research stack: Cr/Au / BSO / n-type NSTO

Compare interfacial accumulation/depletion, effective barrier, and low-bias current for opposite polarizations.

1. **Before Read: Compare Low- and High-R Barriers** — The coordinate runs Cr/Au→BSO→NSTO. The illustrated low-R initial state has P toward NSTO; U(x) is a qualitative barrier, not a measured band profile. Low-R branch: electron accumulation in NSTO Operation bias is zero
2. **Low-R Read: Accumulation and a Smaller Barrier** — Positive interfacial bound charge for P toward NSTO attracts electron accumulation. At the same small read bias, the smaller barrier permits greater electronic current. Low-R branch: electron accumulation in NSTO Same small read bias
3. **High-R Read: Depletion Adds an Effective Barrier** — This frame compares the alternative high-R initial state; reading does not turn low R into high R. Reverse P depletes NSTO, adding a barrier and reducing current. High-R comparison branch: NSTO depletion Same small read bias
4. **Remove Bias and Latch: Polarization and Barrier Retained** — Latch after removing small read bias. The diagram returns to the low-R branch with polarization, accumulation, and barrier retained; the high-R branch likewise retains its state. Low-R branch: electron accumulation in NSTO Operation bias is zero

- [EMG-FTJ24: Original Research: Atomic-Scale BSO Ferroelectric Tunnel Junctions](https://www.nature.com/articles/s41467-024-44927-7)

## Original Patent Drawings and Claim Reading

### US7417300B2 · Steer the programmed resistance change into a controlled region

Compare the terminal and neck widths, then trace current crowding and the local thermal gradient. Geometry and material distribution are the design variables.

![US7417300B2 Fig. 4 / 4A](../assets/專利原圖/US7417300B2-02.png)

[Fig. 4 / 4A · PDF 4](https://patentimages.storage.googleapis.com/1e/7d/12/c3ce4fbb0c479a/US7417300B2.pdf#page=4)

- 410 / 420 · Terminal regions, wider than the connecting fuse
- 430 · Elongated fuse joining the terminals
- 440 · Narrowed region within the terminal, distinct from the fuse link

Claim 1 combines terminal narrowing, different silicide and polysilicon footprints, and unsilicided boundaries. Figure 4A explains the narrowing; the material and boundary requirements remain part of the claim.

Compare the eFuse write sequence: current path → material redistribution → high resistance. Different fuse stacks need different physical failure models.

### US8847350B2 · Control the programming location through partial via contact

Follow the top-view metal link into the two via cross-sections. A smaller contact area concentrates current and local heating.

![US8847350B2 Fig. 4A–4C](../assets/專利原圖/US8847350B2-05.png)

[Fig. 4A–4C · PDF 6](https://patentimages.storage.googleapis.com/f0/e6/d1/93874e8e69ad3a/US8847350.pdf#page=6)

- 410 / 420 · Anode and cathode terminals
- 430 · Metal fuse link
- 435 / 435A / 435B · Via plugs and contact portions; compare their overlap with the link

Claim 1 requires a via end that lands only partly on the fuse link and specifies the connection between two metal layers. Dimensions, resistance and other conditions appear in dependent claims.

Compare localized heating and separation in a metal-via fuse. Its material explanation differs from the silicide electromigration example.

### US6667902B2 · Separate dielectric breakdown from array selection

Locate the storage element and select transistor in Figure 3, then compare selected and unselected biases in Figure 8. The listed voltages belong to this embodiment.

![US6667902B2 Fig. 3](../assets/專利原圖/US6667902B2-03.png)

[Fig. 3 · PDF 5](https://patentimages.storage.googleapis.com/7a/76/35/6662110a53d9f3/US6667902.pdf#page=5)

![US6667902B2 Fig. 8](../assets/專利原圖/US6667902B2-08.png)

[Fig. 8 · PDF 10](https://patentimages.storage.googleapis.com/7a/76/35/6662110a53d9f3/US6667902.pdf#page=10)

- 311 / 312 · Conductive storage gate and underlying thin gate dielectric
- 313 · Active region participating in the post-breakdown current path
- 111 / 115 · Adjacent device arrangement; read with the selection lines

Claim 1 combines a MOS select transistor, a thin-dielectric storage element, and row-select, column-select and row-program lines. The breakdown cross-section alone does not capture the array connections.

Compare antifuse operation: intact dielectric → selected high field → permanent conduction path, followed by low-stress sensing.

### US4115914A · Provide charge transfer through a localized thin dielectric

Identify the floating gate, localized thin region and upper control gate in the late process cross-sections. Thin-region placement and the second dielectric determine coupling and tunneling paths.

![US4115914A Fig. 3h / 3i / 4](../assets/專利原圖/US4115914A-02.png)

[Fig. 3h / 3i / 4 · PDF 4](https://patentimages.storage.googleapis.com/31/47/ab/e89f6659da690c/US4115914.pdf#page=4)

- 54 · First dielectric containing the localized thin region
- 56 · Insulated floating gate
- 58 / 62 · Second dielectric and upper second gate

Claim 1 is a fabrication method: active regions, a localized thin dielectric, floating gate, isolating second dielectric and second gate covering the channel. Its process requirements are more specific than a generic EEPROM sketch.

Compare EEPROM FN injection and removal: both directions must pass through the actual thin dielectric region.

### US5844271A · Couple a single-poly floating gate through a buried control node

Find the overlap between the buried control region and floating gate, then use the equivalent circuit to distinguish coupling, storage and channel conduction.

![US5844271A Fig. 4–7](../assets/專利原圖/US5844271A-01.png)

[Fig. 4–7 · PDF 3](https://patentimages.storage.googleapis.com/1e/60/1a/e2aacc35ea296c/US5844271.pdf#page=3)

- 32 · Buried n+ control-gate region
- 36 · Single-poly floating gate
- 40 / 42 / 44 · Source, drain and channel

Claim 1 includes a buried control gate, coupled floating gate and a thin tunnel region spanning part of the channel and a junction, with inhibition of an unselected overerased cell. Claim 4 separately specifies a split-gate structure.

Compare the MTP IP study’s single-poly teaching variant: this patent’s CHE injection and FN removal use a buried control node, with no second control-poly layer above the floating gate. Current product mechanisms require their own documentation.

### US6232180B1 · Control operation with source coupling, split gates and well bias

Follow floating-gate formation in Figure 5 into the source/drain structure in Figure 6. Locate the select gate and tunnel oxide; the nested wells support separately controlled erase bias.

![US6232180B1 Fig. 5 / 6](../assets/專利原圖/US6232180B1-02.png)

[Fig. 5 / 6 · PDF 4](https://patentimages.storage.googleapis.com/bf/a4/72/d2d74438bd3c5f/US6232180.pdf#page=4)

- 501 / 113 · Floating gate and select gate
- 403 · Tunnel oxide toward the channel
- 103 / 105 · Deep n-well and enclosed p-well

Claim 1 specifies nested wells, select and floating gates, and a source acting as the control-coupling node. Claims 4–6 add particular erase and programming biases; these values do not define all split-gate NOR.

Compare the third NOR variant: source-side injection and well/channel-side FN erase, separately from implementations that tunnel toward a select gate.

### WO1981000790A1 · Add a blocking oxide between the charge-trapping layer and gate

Read upward from silicon: thin memory oxide, silicon nitride, interfacial oxide and polysilicon gate. The drawing explains the dielectric stack.

![WO1981000790A1 Fig. 1](../assets/專利原圖/WO1981000790A1-頁14.png)

[Fig. 1 · PDF 14](https://patentimages.storage.googleapis.com/28/0b/c1/62d59b67395c82/WO1981000790A1.pdf#page=14)

- 11 / 12 · Thin memory oxide and nitride trapping layer
- 13 / 14 · Interfacial oxide and polysilicon gate
- 16 / 17 / 18 · Substrate and source/drain regions

Claim 1 specifies a CVD second oxide with a thickness range and an upper limit for the first oxide. Claim 6 covers fabrication. This early SONOS stack does not specify every later engineered tunneling stack.

For SONOS operation, distinguish the lower tunnel oxide from the upper blocking oxide. Stored charge resides in the nitride.

### US5768192A · Use localized trapping and reverse read to increase sensing contrast

Compare the prior-art A panels with embodiment B panels. Trace the localized charge region and READ arrow; reading direction changes which end of the channel barrier controls current.

![US5768192A Fig. 5A / 5B](../assets/專利原圖/US5768192A-02.png)

[Fig. 5A / 5B · PDF 4](https://patentimages.storage.googleapis.com/59/3c/28/7e679959ef55fa/US5768192.pdf#page=4)

![US5768192A Fig. 8A / 8B](../assets/專利原圖/US5768192A-04.png)

[Fig. 8A / 8B · PDF 6](https://patentimages.storage.googleapis.com/59/3c/28/7e679959ef55fa/US5768192.pdf#page=6)

- 14 / 16 · Source/drain labels; interpret them with the operating bias
- 20 · Nonconducting nitride trapping layer
- 24 / 68 · Control gate and localized stored-charge region

Claim 1 combines localized electron trapping near the programming drain with different thresholds for reverse and forward read. The directional behavior is essential to the reading, beyond the ONO stack alone.

Compare the localized NROM sequence: CHE stores electrons near one end, reverse read senses from the opposite direction, and BBHH erase is explained with its separate source.

### US7696559B2 · Move the NAND string into a vertical gate stack

In Figure 2, trace the silicon pillar from the common source to the bit line. Figure 6 unfolds the same structure into a string circuit, with select gates at both ends.

![US7696559B2 Fig. 2](../assets/專利原圖/US7696559B2-02.png)

[Fig. 2 · PDF 4](https://patentimages.storage.googleapis.com/79/10/3c/cc469fa1eed4fc/US7696559.pdf#page=4)

![US7696559B2 Fig. 6](../assets/專利原圖/US7696559B2-05.png)

[Fig. 6 · PDF 7](https://patentimages.storage.googleapis.com/79/10/3c/cc469fa1eed4fc/US7696559.pdf#page=7)

- 21 · Stacked gate wiring, including memory and end-select gates
- 3 / 4 · Charge-storage gate dielectric and silicon pillar
- 7 / 11 · Upper bit line and lower common-source diffusion

Claim 1 specifies gate stacks, sidewall dielectric containing an insulating storage layer, semiconductor pillars, data lines and upper/lower select gates. It describes a particular vertical NAND structure, not every modern cylindrical-hole array.

Compare selected-word-line injection, pass biases and program inhibit. This patent’s source-side electron removal is shown separately from later GIDL hole-assisted erase.

### US6545906B1 · Rotate coupled moments with overlapping field pulses

Start with the two pulse waveforms in Figure 4, then follow the moments through Figures 5 and 6. The overlap interval and turn-off order are part of the operation.

![US6545906B1 Fig. 3 / 4](../assets/專利原圖/US6545906B1-02.png)

[Fig. 3 / 4 · PDF 3](https://patentimages.storage.googleapis.com/1e/95/11/99d21025b0f19c/US6545906.pdf#page=3)

![US6545906B1 Fig. 5 / 6](../assets/專利原圖/US6545906B1-03.png)

[Fig. 5 / 6 · PDF 4](https://patentimages.storage.googleapis.com/1e/95/11/99d21025b0f19c/US6545906.pdf#page=4)

- 60 / 70 · Word-line and digit-line pulses
- 100 · Complete overlapping write sequence
- 40 / 53 / 57 · Resultant moment and antiferromagnetically coupled sublayer moments

Claim 1 combines at least two antiferromagnetically coupled free layers, a moment-balance condition and pulse order t₀<t₁<t₂<t₃<t₄. Arbitrary orthogonal field pulses are not equivalent.

Compare the five-frame Toggle sequence and initial-state check: apply a toggle when the stored bit needs to change.

### US5695864A · Transfer spin angular momentum with current through the layers

Figure 1 is a five-layer metallic-conductor model. Follow A→F1→B→F2→C to locate fixed and variable moments, then relate current to torque on F2.

![US5695864A Fig. 1 / 2](../assets/專利原圖/US5695864A-00.png)

[Fig. 1 / 2 · PDF 2](https://patentimages.storage.googleapis.com/f2/de/53/7c37f0c1e307e4/US5695864.pdf#page=2)

- 10 · Five-layer spin-transfer device
- F1 / F2 · Fixed-moment and changeable-moment magnetic layers
- A / B / C · Outer electrodes and central nonmagnetic conductor; current crosses the layers

Claim 1 specifies fixed and changeable magnetic conducting layers, a nonmagnetic conductor between them and a perpendicular current source. This early embodiment has a metallic spacer, rather than a modern MgO tunnel barrier.

Use this patent for spin-transfer physics, then the modern STT-MRAM plates for P/AP resistance sensing and the tunnel barrier.

### US10930843B2 · Integrate SOT write conductors and magnetic stacks into an array

Trace the first horizontal wire through the magnetic stack to wiring in the other direction. Access transistors and crossing interconnect explain array integration beyond one MTJ.

![US10930843B2 Fig. 3](../assets/專利原圖/US10930843B2-03.png)

[Fig. 3 · PDF 5](https://patentimages.storage.googleapis.com/1b/15/5f/552c7b2be8d3cd/US10930843.pdf#page=5)

- 102a / 102b · First conductive wires carrying the lateral write path
- 108 / 110 / 112 · Magnetic storage, spacing and reference layers
- 116 / 118 / 314 · Control transistors and second wiring set

Claim 1 is a fabrication method covering isolated first wires, common device layers formed and separated above them, and second wires in another direction. The drawing explains connectivity; the claim centers on fabrication steps.

Compare three-terminal SOT read/write separation. Preserve the control terminals rather than reducing them to the STT current path.

### US8331131B2 · Control resistance switching through an intermediate state and second pulse

Follow the Figure 5 cycle through mobile-species, barrier and conductive-region changes. The intermediate state has a physical location; it is not a single-step SET/RESET diagram.

![US8331131B2 Fig. 5](../assets/專利原圖/US8331131B2-04.png)

[Fig. 5 · PDF 5](https://patentimages.storage.googleapis.com/90/dd/5a/259ef8491b3d97/US8331131.pdf#page=5)

- 507 · Mobile species
- 502 / 506 / 510 · Initial, intermediate and changed states
- 511 / 517 / 519 · Tunneling barriers in the different stages

Claim 1 requires three intermediate layers and two pulses: accumulation in the first layer, then motion into the third to complete the change. This specific multilayer memristor scheme does not define all bipolar VCM.

Compare species redistribution in VCM operation; this patent additionally shows how pulse sequencing introduces an intermediate state.

### US5761115A · Reversibly grow a metal bridge inside an ion conductor

Trace the dendrite in Figure 1’s plan and cross-section, then compare the vertical geometry in Figure 4. Figure 5 adds an insulating condition that prevents direct contact.

![US5761115A Fig. 1A / 1B / 2 / 3](../assets/專利原圖/US5761115A-00.png)

[Fig. 1A / 1B / 2 / 3 · PDF 3](https://patentimages.storage.googleapis.com/8e/2a/ba/50b37273a2724f/US5761115.pdf#page=3)

![US5761115A Fig. 4A / 4B / 5A / 5B](../assets/專利原圖/US5761115A-01.png)

[Fig. 4A / 4B / 5A / 5B · PDF 4](https://patentimages.storage.googleapis.com/8e/2a/ba/50b37273a2724f/US5761115.pdf#page=4)

- 12 / 22 · Fast ion conductor containing metal ions
- 13 / 14 / 23 / 24 · Biased electrodes; 23 denotes the cathode
- 15 / 25 · Metal dendrite growing from the negative electrode

Claim 1 covers an ion-containing conductor, electrodes and dendrite growth from negative toward positive. Claim 2 adds opposite-polarity reversal. Claim 3’s blocking condition is an additional limitation, not universal to all embodiments.

Compare ECM metal oxidation, ion migration, reduction/deposition and reverse dissolution. The bridge is metallic, rather than an oxygen-vacancy filament.

### US5912839A · Use cumulative pulses to reach distinguishable phase-change resistance states

First inspect Figure 1’s nonmonotonic resistance versus pulse-current relationship, then the material/electrode structure in Figure 2. The plot lacks a complete measurement contract for current product specifications.

![US5912839A Fig. 1](../assets/專利原圖/US5912839A-00.png)

[Fig. 1 · PDF 2](https://patentimages.storage.googleapis.com/b9/d0/ac/dfd15bdaa20dc7/US5912839.pdf#page=2)

![US5912839A Fig. 2](../assets/專利原圖/US5912839A-01.png)

[Fig. 2 · PDF 3](https://patentimages.storage.googleapis.com/b9/d0/ac/dfd15bdaa20dc7/US5912839.pdf#page=3)

- 36 · Phase-change memory material
- 42 · Electrode grid structure
- 46 · Insulation layer

Claim 1 focuses on a program pulse insufficient for a single SET but effective cumulatively with later pulses. Claim 2 adds RESET; claim 3 adds a read method that counts extra pulses. This is more specific than generic PCM heating.

Compare PCM temperature and phase-state sequences, then examine how this patent uses repeated stimulation for data encoding.

### US4873664A · Restore ferroelectric data through the sensing circuit

Trace the 1T1C cell along the bit line into the sense/restore circuit, then compare word-line and plate-line timing. After charge sensing, the latched result restores the original polarization.

![US4873664A Fig. 3 / 4](../assets/專利原圖/US4873664A-01.png)

[Fig. 3 / 4 · PDF 3](https://patentimages.storage.googleapis.com/33/4c/dd/c26b6f9525498b/US4873664.pdf#page=3)

![US4873664A Fig. 5](../assets/專利原圖/US4873664A-02.png)

[Fig. 5 · PDF 4](https://patentimages.storage.googleapis.com/33/4c/dd/c26b6f9525498b/US4873664.pdf#page=4)

- 22 / 24 · Ferroelectric capacitor and access transistor
- 32 / 68 · Word line and separate plate line
- 64 · Sense amplifier, with reference cells providing a comparison

Claim 1 specifies cell connections to word, bit and separate plate lines, with one capacitor electrode connected to the bit line through a switch. Claim 2 adds a sense amplifier and dummy ferroelectric reference cell.

Compare both initial polarizations, switching-charge contrast, latching and write-back in the FeRAM read plates. Restoration is an explicit stage.

### US10153155B2 · Form a ferroelectric film through alternating dopants and heat treatment

Figures 1 and 2 compare three- and four-layer film arrangements. Identify the material and outer conducting layers, then read the distinct dopant layers and heating requirements in the process claim.

![US10153155B2 Fig. 1 / 2](../assets/專利原圖/US10153155B2-01.png)

[Fig. 1 / 2 · PDF 3](https://patentimages.storage.googleapis.com/14/31/15/bbdde795e5e4a4/US10153155.pdf#page=3)

- 110 / 120 / 130 · First, second and third material layers
- 112 / 114 · Outer conductive layers
- 210 / 220 / 230 / 240 · Extended four-layer arrangement

Claim 1 is a film-formation method involving three hafnium/oxygen layers, two different dopant layers, heating and conductive layers on both sides. The figure is not a complete FeFET bitcell and does not define its read channel.

Use this source for FeFET material/process constraints. The next transistor-stack patent and operation plates cover the electrical device.

### US11502083B2 · Integrate a ferroelectric film into a specific composite gate

Read layers 31, 32, 33b, 34 and 35 upward from the substrate, then trace the junctions back to the channel. This stack includes a floating gate and is not the simplest metal/ferroelectric/silicon structure.

![US11502083B2 Fig. 1](../assets/專利原圖/US11502083B2-01.png)

[Fig. 1 · PDF 3](https://patentimages.storage.googleapis.com/26/68/6f/921a8116ea99d7/US11502083.pdf#page=3)

- 31 / 32 · Buffer layer and floating-gate electrode
- 33b / 34 / 35 · Hafnium-based ferroelectric, control gate and film-electrode layer
- 5 / 6 / 71 · Source, drain and silicide contact

Claim 1 details the relative positions of the composite gate, isolation, sidewalls, source/drain and silicide. The drawing teaches one implementation, rather than a universal FeFET stack.

Compare polarization-controlled threshold shift in FeFETs. Distinguish material layers from electrical terminals to locate the applied field.

### US20240057343A1 · Design tunneling states with a catalytic interface and thin ferroelectric layer

Read the five-layer stack in Figure 3, then compare polarization-dependent barriers in Figure 5. Figures 15–18 connect memory stacks to transistors.

![US20240057343A1 Fig. 3–5](../assets/專利原圖/US20240057343A1-03.png)

[Fig. 3–5 · PDF 4](https://patentimages.storage.googleapis.com/82/23/f6/5dcf02a41aa96f/US20240057343A1.pdf#page=4)

![US20240057343A1 Fig. 15–18](../assets/專利原圖/US20240057343A1-08.png)

[Fig. 15–18 · PDF 9](https://patentimages.storage.googleapis.com/82/23/f6/5dcf02a41aa96f/US20240057343A1.pdf#page=9)

- 210 / 220 · Bottom electrode and catalytic metal layer
- 230 / 240 / 250 · Ferroelectric layer, tunneling dielectric and top electrode
- 122 / 124 / 200 · Access gate, source/drain regions and memory cell

This is a published application. Claim 1 combines a first electrode, ferroelectric material and contacting catalytic metal; claims 2–3 add particular electronegativity and thickness limits. The five-layer embodiment includes details beyond the independent claim.

Compare FTJ polarization reversal and barrier changes, keeping this stack distinct from research devices using other electrodes and ferroelectrics.


## Major Industry and Research Routes

Trace named implementations from purchasable memories and integrable IP/processes to materials and arrays still under validation. Align mechanisms, measurement levels and maturity before assessing application value.

### A Technology Name Does Not Define a Deliverable

RRAM filaments, STT tunneling-current writes and SOT separate paths impose different process, endurance and peripheral requirements. Products, foundry platforms and research papers answer different questions; preserve their conditions and attribution.

### Everspin · Three Product Lines: Toggle, DDR STT and xSPI

Standalone MRAM Product Supplier

Everspin is a core commercial MRAM reference. Its three product lines differ in write physics, interfaces, retention and qualification; compare exact ordering codes and document versions.

Commercial Products; Qualification Is Version-Specific: DDR4-like does not mean a drop-in replacement for every DDR4 device; HR 64Mb qualification does not cover the whole family.

Standalone Toggle MRAM, 1Gb persistent STT memory and EMxxLX xSPI.

Toggle uses fields from selected lines to switch magnetization; STT switches the free layer with spin-polarized current through the MTJ.

Both routes can update the opposite magnetic state without a Flash block erase. Commands, update granularity and timing remain interface-specific.

Sense data through MTJ resistance. System latency includes asynchronous-bus, DDR or xSPI transactions and cannot be reduced to a switching pulse.

- [everspin-toggle: Everspin Toggle MRAM · Toggle MRAM](https://www.everspin.com/persyst?page=2)
- [everspin-ddr-technology: Current official explanation of 1Gb DDR4-like persistent DRAM and separate xSPI STT products.](https://www.everspin.com/stt-mram-technology)
- [EMG-P-TOGGLE: Motorola: Toggle Writing Patent US6545906B1](https://patents.google.com/patent/US6545906B1/en)

#### Toggle: Mature Interfaces and Exact Parts

The current PERSYST catalog marks MR3A16ACYS35 as mass production, with 8Mb, asynchronous x16, 35ns, 3.3V and −40°C to 85°C. These are named-part conditions, not universal MRAM density, speed or retention specifications.

- [everspin-toggle: Everspin Toggle MRAM · Toggle MRAM](https://www.everspin.com/persyst?page=2)

#### 1Gb STT: Persistent Buffers for Enterprise Storage

The 2025 filing confirms continuing 1Gb STT-MRAM shipments; the technology page describes a DDR4-like persistent-DRAM interface. Retention and controller requirements need the relevant datasheet, rather than values copied from Toggle or xSPI.

- [everspin-1gb-ddr: Everspin 1Gb STT-MRAM · STT-MRAM / DDR4-derived](https://www.sec.gov/Archives/edgar/data/1438423/000162828026014733/mram-20251231.htm)
- [everspin-ddr-technology: Current official explanation of 1Gb DDR4-like persistent DRAM and separate xSPI STT products.](https://www.everspin.com/stt-mram-technology)

#### xSPI: Separate Density Availability from HR Qualification

The March 5, 2026 release confirms HR 64Mb AEC-Q100 Grade 1 production qualification and order availability. Its HR 128Mb/256Mb dates are announcement-time plans; later completion is not established by the primary text reviewed here. A September 2 Teledyne partnership starts with 256Mb and anticipates partner customer availability in Q4 2026.

- [everspin-xspi: Everspin EMxxLX xSPI · STT-MRAM / xSPI](https://investor.everspin.com/news-releases/news-release-details/everspin-advances-high-reliability-xspi-mram-portfolio-256mb)
- [RES-EVERSPIN-TELEDYNE-2026: Everspin / Teledyne HiRel Partnership](https://investor.everspin.com/news-releases/news-release-details/everspin-technologies-and-teledyne-hirel-semiconductors-partner)

- **8Mb / 35ns**: Capacity and asynchronous cycle specification for MR3A16ACYS35. Not a specification for 1Gb DDR or EMxxLX.

- [everspin-toggle: Everspin Toggle MRAM · Toggle MRAM](https://www.everspin.com/persyst?page=2)

- **HR 64Mb / Grade 1**: Qualified and available for orders on March 5, 2026. Other capacities and versions do not inherit this qualification.

- [everspin-xspi: Everspin EMxxLX xSPI · STT-MRAM / xSPI](https://investor.everspin.com/news-releases/news-release-details/everspin-advances-high-reliability-xspi-mram-portfolio-256mb)

Engineering interpretation: Toggle, persistent DDR buffers and low-pin-count xSPI serve different controllers and data lifecycles. Compare power-loss protection, update frequency, latency, qualification and board-integration cost.

Specify the complete part number, datasheet revision, retention temperature, endurance conditions, controller support and exact qualification scope.

### UMC · Embedded RRAM and a Distinct MRAM Product Route

Foundry and Ecosystem Integration

UMC evidence spans process availability, qualified RRAM IP, a SoC development platform and standalone MRAM products. These are distinct delivery levels.

Qualified RRAM IP; Named MRAM Products Available: A standalone MRAM product does not establish an available embedded macro.

22nm ULP/ULL RRAM; separately, Avalanche 22nm pMTJ STT-MRAM.

RRAM SET establishes a low-resistance state; the UMC/eMemory announcement does not disclose material, bias or pulse algorithms.

RESET returns to high resistance, unlike Flash block erase. Avalanche STT-MRAM directly overwrites a magnetic state.

Low-disturb sensing is combined with verification, ECC and repair; controller behavior is specific to the IP.

- [RES-UMC-RRAM-2023: UMC / eMemory: 22nm RRAM Qualification](https://www.umc.com/en/News/press_release/Content/technology_related/20230328)
- [RES-UMC-MRAM-2022: UMC / Avalanche: 22nm P-SRAM Availability](https://www.umc.com/en/News/press_release/Content/technology_related/20220913)

#### From 40nm Collaboration to 22nm IP

The 2017 Panasonic collaboration establishes a 40nm history; eMemory announced qualification of a 22nm version in 2023. Public evidence does not establish an identical stack or IP lineage. Low-temperature backend integration and logic-platform compatibility matter to SoC adoption.

- [RES-PANASONIC-UMC-2017: Panasonic / UMC: 40nm ReRAM Collaboration](https://news.panasonic.com/global/press/en170201-3)
- [RES-UMC-RRAM-2023: UMC / eMemory: 22nm RRAM Qualification](https://www.umc.com/en/News/press_release/Content/technology_related/20230328)

#### MRAM: Separate Agreements from Products

The 2018 agreement began with 28nm CMOS. The 2022 immediate-availability evidence concerns Avalanche third-generation 22nm P-SRAM. This establishes a named MRAM product route, not a universally available embedded macro.

- [RES-UMC-MRAM-2018: UMC / Avalanche: MRAM Development Agreement](https://www.umc.com/en/News/press_release/Content/technology_related/20180806)
- [RES-UMC-MRAM-2022: UMC / Avalanche: 22nm P-SRAM Availability](https://www.umc.com/en/News/press_release/Content/technology_related/20220913)

#### SoC Adoption Evidence and Open Roadmap Items

Faraday FlashKit-22RRAM adds silicon-validated controller, BIST and processor integration in 2025. The 16Mb automotive and 0.8V/1.8V variants targeted in 2023 still require completion evidence. The Infineon/UMC 40nm automotive agreement identifies proprietary eNVM without identifying RRAM.

- [RES-FARADAY-RRAM-2025: Faraday: FlashKit-22RRAM Silicon Validation](https://www.faraday-tech.com/html/News/pressRelease/CHI_01_0441.jsp)
- [RES-UMC-RRAM-2023: UMC / eMemory: 22nm RRAM Qualification](https://www.umc.com/en/News/press_release/Content/technology_related/20230328)
- [RES-UMC-INFINEON-2023: UMC / Infineon: 40nm Automotive MCU Agreement](https://www.umc.com/en/News/press_release/Content/technology_related/20230307)

- **8Mb + 16Kb**: The 2023 qualified RRAM macro and information area; 10k cycles and 10-year retention up to 105°C. These values belong to the named version, not all 22nm eNVM.

- [RES-UMC-RRAM-2023: UMC / eMemory: 22nm RRAM Qualification](https://www.umc.com/en/News/press_release/Content/technology_related/20230328)

- **22nm P-SRAM**: Avalanche standalone products announced immediately available in 2022. This does not establish qualification of an embedded MRAM macro.

- [RES-UMC-MRAM-2022: UMC / Avalanche: 22nm P-SRAM Availability](https://www.umc.com/en/News/press_release/Content/technology_related/20220913)

Engineering interpretation: evaluate RRAM for low-standby-power MCUs, AIoT and embedded code storage. Value depends on the selected IP retention conditions, update budget, test cost and controller integration.

Confirm the version, PDK, macro capacity, ECC, update granularity, automotive qualification and tapeout availability.

### Panasonic · Tantalum-Oxide Filaments and Product Evidence

ReRAM Technology and Product Lineage

Panasonic is an important early commercial ReRAM developer. Trace 180nm production, 40nm test macros and Fujitsu products separately to connect the mechanism with reliability and products.

Historical Production, Test Macros and Named Products: Sampling targets and test macros do not establish production of every 40nm product.

Tantalum-oxide ReRAM; integration in foundry-standard 40nm CMOS.

Forming first creates a localized conductive path in the oxide; later SET enters the low-resistance state. Forming is distinct from each data write.

RESET returns to high resistance through redox and defect redistribution; it neither removes the layer nor irreversibly blows a fuse.

Sense high and low resistance with a low-disturb bias, accounting for state distributions and the post-cycling sensing window.

- [RES-PANASONIC-SSDM-2018: Panasonic: 40nm ReRAM Mechanism and Reliability](https://confit.atlas.jp/guide/event-img/ssdm2018/B-1-01/public/pdf_archive?type=in)

#### Reliability Must Preserve the Test Sequence

The 2018 8Mbit test macro separately reports 100k-cycle endurance and over ten years at 85°C after 10k cycles. These do not establish ten-year retention after 100k cycles. Engineering evaluation also needs HRS/LRS distribution tails, not only average resistance.

- [RES-PANASONIC-SSDM-2018: Panasonic: 40nm ReRAM Mechanism and Reliability](https://confit.atlas.jp/guide/event-img/ssdm2018/B-1-01/public/pdf_archive?type=in)

#### Partnerships Do Not Reveal Undisclosed Processes

The 2017 announcement confirms 180nm production since 2013 and describes future 40nm sampling. The 2019 Fujitsu/Panasonic MB85AS8MT release names an SPI product without identifying its node or foundry. It cannot by itself establish UMC 40nm product production.

- [RES-PANASONIC-UMC-2017: Panasonic / UMC: 40nm ReRAM Collaboration](https://news.panasonic.com/global/press/en170201-3)
- [RES-FUJITSU-RERAM-2019: Fujitsu / Panasonic: 8Mbit ReRAM Product](https://info.archives.global.fujitsu/tw/about/resources/news/press-releases/2019/fep-0812.html)

- **100k Cycles**: Endurance result for a 40nm 8Mbit test macro. The retention result uses a separate 10k-cycle condition.

- [RES-PANASONIC-SSDM-2018: Panasonic: 40nm ReRAM Mechanism and Reliability](https://confit.atlas.jp/guide/event-img/ssdm2018/B-1-01/public/pdf_archive?type=in)

- **0.15mA @ 5MHz**: Average read current for the standalone MB85AS8MT SPI product. Not bitcell write energy and not directly comparable with macro speed.

- [RES-FUJITSU-RERAM-2019: Fujitsu / Panasonic: 8Mbit ReRAM Product](https://info.archives.global.fujitsu/tw/about/resources/news/press-releases/2019/fep-0812.html)

Engineering interpretation: this lineage informs low-power persistent storage. Product selection must separate standalone serial-interface system costs from embedded-macro process costs.

Confirm current supplier, ordering code, interface and combined cycling/retention conditions rather than relying on historical partnerships.

### IBM Research · Read MRAM Scaling, Current and Retention Together

Device and Integration Research

IBM contributes traceable device physics and CMOS integration results. MTJ size, process node and write-error rate from different studies must not be combined into an imaginary best-specification product.

Device and CMOS Integration Demonstrations: IBM papers are not a list of IBM production foundry services.

Perpendicular STT-MRAM; distinguish 14nm CMOS integration from smaller-MTJ research.

Current through the MTJ transfers spin angular momentum to set P or AP. The current required for a target WER depends on pulse width and materials.

Switch magnetization in the opposite direction to overwrite the other value, without a Flash-style block erase. The two switching thresholds can differ.

Sense P/AP through MTJ resistance; sensing margin, read disturb and MgO barrier lifetime constrain the bias design.

- [RES-IBM-REVIEW-2024: IBM Authors: STT-MRAM Status and Directions](https://research.ibm.com/publications/spin-transfer-torque-magnetoresistive-random-access-memory-technology-status-and-future-directions)
- [RES-IBM-11NM-2017: IBM: Low-Current 11nm MTJ Research](https://research.ibm.com/publications/low-current-spin-transfer-torque-mram--1)

#### 14nm Is a CMOS Node; 11nm Is an MTJ Size

The 2020 14nm study places MTJs between M1 and M2 with three added masks and one electrode module; 400°C describes process compatibility. The 2017 11nm result describes a junction size for low-current switching, not an 11nm CMOS platform.

- [RES-IBM-14NM-2020: IBM: 14nm CMOS Embedded STT-MRAM](https://research.ibm.com/publications/a-14-nm-embedded-stt-mram-cmos-technology)
- [RES-IBM-11NM-2017: IBM: Low-Current 11nm MTJ Research](https://research.ibm.com/publications/low-current-spin-transfer-torque-mram--1)

#### Co-Designing Retention and Speed

The 2024 ordered-alloy study combines a low magnetic moment with strong perpendicular anisotropy, demonstrating a high energy barrier and 2ns operation. This advances material and switching design; retention guarantees still require temperature and statistical conditions.

- [RES-IBM-ALLOY-2024: IBM: Ordered-Alloy Free-Layer Research](https://research.ibm.com/publications/first-demonstration-of-high-retention-energy-barriers-and-2-ns-switching-using-magnetic-ordered-alloy-based-stt-mram-devices)

#### 2025: Double Spin-Torque Arrays for Cache

IEDM 2025 reports a 4-kbit DS-MTJ array in which all devices switch with 2ns pulses, with an approximately 60kT energy barrier at about 40nm critical dimension. This extends the evidence to a research array while preserving the distinction between device geometry and CMOS node.

- [RES-IBM-DSMTJ-2025: IBM: Double Spin-Torque MTJs for Cache](https://research.ibm.com/publications/progress-and-gaps-in-double-spin-torque-mtjs-for-last-level-cache-applications)

- **0.0273μm² / 4ns**: Cell area and minimum demonstrated write time in the 14nm CMOS integration study. Not system area per bit including periphery, nor full access latency.

- [RES-IBM-14NM-2020: IBM: 14nm CMOS Embedded STT-MRAM](https://research.ibm.com/publications/a-14-nm-embedded-stt-mram-cmos-technology)

- **8μA / 10ns / 10⁻⁹**: Current, pulse duration and WER for an 11nm MTJ. Does not establish large-array yield or identical retention.

- [RES-IBM-11NM-2017: IBM: Low-Current 11nm MTJ Research](https://research.ibm.com/publications/low-current-spin-transfer-torque-mram--1)

Engineering interpretation: use these studies to evaluate the physics and integration of embedded MRAM or cache candidates. Procurement still requires a named supplier and a deliverable macro, controller and production contract.

Align definitions of node versus MTJ size, pulse versus access time, device versus array WER, retention temperature and thermal budget.

### ITRI · From SOT Write Channels to Arrays and Computing

Collaborative Research, Prototyping and Transfer

ITRI evidence spans distinct collaborations and versions: SOT with TSMC, cryogenic STT with NYCU, a joint β-W array, an 8-inch prototyping service and RRAM technology transfer.

Research Arrays, Prototypes and Trial Production: Collaborative research must not be represented as an ITRI standalone production product.

SOT-MRAM and BEOL integration; separately, 1S1R RRAM transfer.

In-plane channel current generates spin-orbit torque to switch the free layer; field requirements, assist pulses and directionality depend on the implementation.

Update the opposite magnetic state by direct overwrite. Separate paths can reduce write stress across the tunnel barrier without implying unlimited endurance.

MTJ resistance still reads the state; compute-in-memory also depends on RA, read current, interconnect drop and peripheral circuitry.

- [RES-ITRI-SOT-2022: ITRI: SOT and Cryogenic STT Collaborations](https://www.itri.org.tw/ListStyle.aspx?DisplayStyle=01_content&MGID=111061510283488782&MmmID=1036276263153520257&SiteID=1)
- [RES-ITRI-CIM-2024: ITRI / TSMC: IEDM 2023 SOT-CIM](https://www.itri.org.tw/ListStyle.aspx?DisplayStyle=01_content&MGID=113011710184808020&MmmID=1036276263153520257&SiteID=1)
- [RES-ITRI-SERVICE: ITRI: 8-Inch MRAM Development Services](https://www.itri.org.tw/english/ListStyle.aspx?DisplayStyle=01_content&MGID=1126511563713777471&MmmID=1071732317047353240&SiteID=1)

#### Different Research Targets in 2022 and 2023

The 2022 0.4ns and seven-trillion-cycle claim concerns SOT with TSMC; the same release attributes −269°C to 127°C operation to cryogenic STT with NYCU. The IEDM 2023 result released in 2024 addresses 10ns devices and computing. Its 1% power claim lacks a fully disclosed comparison workload.

- [RES-ITRI-SOT-2022: ITRI: SOT and Cryogenic STT Collaborations](https://www.itri.org.tw/ListStyle.aspx?DisplayStyle=01_content&MGID=111061510283488782&MmmID=1036276263153520257&SiteID=1)
- [RES-ITRI-CIM-2024: ITRI / TSMC: IEDM 2023 SOT-CIM](https://www.itri.org.tw/ListStyle.aspx?DisplayStyle=01_content&MGID=113011710184808020&MmmID=1036276263153520257&SiteID=1)

#### 2025: Thermally Stable Materials in a 64kb Array

A joint NYCU, TSMC, ITRI, NSRRC, Stanford and NCHU paper uses Co insertion to stabilize β-W. The film maintains phase stability at 400°C for ten hours, and the memory demonstrates 1ns switching. This is integration evidence, not a production-platform announcement.

- [RES-SOT-BETAW-2025: Joint Research: β-W 64kb SOT-MRAM](https://www.nature.com/articles/s41928-025-01434-x)

#### Prototyping and RRAM Transfer Have Separate Contracts

The 8-inch BEOL platform supports Kb-to-Mb research, prototypes and initial trial production. A separate 1S1R RRAM transfer page lists selector, current and geometry specifications. Its undated status cannot establish current production or the maturity of the overall ReRAM market.

- [RES-ITRI-SERVICE: ITRI: 8-Inch MRAM Development Services](https://www.itri.org.tw/english/ListStyle.aspx?DisplayStyle=01_content&MGID=1126511563713777471&MmmID=1071732317047353240&SiteID=1)
- [RES-ITRI-RRAM: ITRI: 1S1R 3D RRAM Technology Transfer](https://www.itri.org.tw/ListStyle.aspx?DisplayStyle=13_content&MmmID=1036233405427625204&SiteID=1&Trt_idx=4557)

- **64kb / 1ns**: The 2025 β-W SOT research memory; the abstract also reports >10-year retention and 146% TMR. The public abstract omits retention temperature, full WER and CMOS node.

- [RES-SOT-BETAW-2025: Joint Research: β-W 64kb SOT-MRAM](https://www.nature.com/articles/s41928-025-01434-x)

- **1S1R / ≤4F²**: The RRAM transfer listing specifies selectivity ≥100 and current ≤100μA. Transfer specifications, not production density, yield or a node guarantee.

- [RES-ITRI-RRAM: ITRI: 1S1R 3D RRAM Technology Transfer](https://www.itri.org.tw/ListStyle.aspx?DisplayStyle=13_content&MmmID=1036233405427625204&SiteID=1&Trt_idx=4557)

Engineering interpretation: consider joint research, process prototyping and compute-architecture validation. SOT speed and barrier-reliability potential must be weighed against channel area, selectors, routing and drive current.

Request version-specific capacity, WER, field or assist requirements, retention, process compatibility and deliverable service scope.

### Turn Research Numbers into Engineering Questions

#### Define the Timing Boundary

A switching pulse excludes some or all decoding, verification, ECC and serial-transfer overhead. Engineering interpretation: establish the measurement level before comparing access time or update energy.

- [RES-IBM-14NM-2020: IBM: 14nm CMOS Embedded STT-MRAM](https://research.ibm.com/publications/a-14-nm-embedded-stt-mram-cmos-technology)
- [RES-FUJITSU-RERAM-2019: Fujitsu / Panasonic: 8Mbit ReRAM Product](https://info.archives.global.fujitsu/tw/about/resources/news/press-releases/2019/fep-0812.html)

#### Bind Cycling, Retention and Temperature

Thermal budget describes processing, retention temperature describes storage and operating range is a separate specification. Best values from different experiments do not form a product guarantee.

- [RES-PANASONIC-SSDM-2018: Panasonic: 40nm ReRAM Mechanism and Reliability](https://confit.atlas.jp/guide/event-img/ssdm2018/B-1-01/public/pdf_archive?type=in)
- [RES-SOT-BETAW-2025: Joint Research: β-W 64kb SOT-MRAM](https://www.nature.com/articles/s41928-025-01434-x)

#### Ground Commercial Value in Deliverables

Engineering interpretation: separate components, IP, PDKs and joint research. Power, endurance and density become adoption advantages only when testing, yield, controllers, licensing and supply meet the product requirements.

- [RES-FARADAY-RRAM-2025: Faraday: FlashKit-22RRAM Silicon Validation](https://www.faraday-tech.com/html/News/pressRelease/CHI_01_0441.jsp)
- [RES-ITRI-SERVICE: ITRI: 8-Inch MRAM Development Services](https://www.itri.org.tw/english/ListStyle.aspx?DisplayStyle=01_content&MGID=1126511563713777471&MmmID=1071732317047353240&SiteID=1)

#### NRAM: Keep the Material Route and Historical Status Separate

The 2016 Fujitsu archive identifies carbon nanotubes as the NRAM storage technology and a 55nm joint-development plan with Nantero. That evidence does not identify an oxide-filament ReRAM device, nor does it establish a currently available product. The detailed write, reverse-update and read waveforms require a specific device publication or datasheet; no voltage or endurance specification is inferred from the licensing announcement.

- [NRAM-NANTERO-FUJITSU-2016: Nantero/Fujitsu Semiconductor/Mie Fujitsu Semiconductor · Carbon-Nanotube NRAM](https://info.archives.global.fujitsu/global/about/resources/news/press-releases/2016/)

Reviewed through 2026-09-10 using official releases, product documents, author papers and public abstracts. Claims based on abstracts remain limited to those abstracts. Engineering interpretations are comparative analysis, not supplier guarantees.


## Global NVM Industry and Research Map

### Everspin Toggle MRAM · Toggle MRAM

Discrete memory supplier · Commercial products

The current PERSYST catalog lists Toggle production parts. MR3A16ACYS35 is marked MP and specifies 8Mb, asynchronous x16, 35ns, 3.3V and −40 to 85°C.

These values belong only to MR3A16ACYS35. Do not mix speed, temperature or automotive ratings across parts. The old MR4A16B datasheet is inaccessible, so its over-20-year retention is not cited.

Undated source; checked 2026-09-10

- [everspin-toggle: Everspin Toggle MRAM · Toggle MRAM](https://www.everspin.com/persyst?page=2)
- [everspin-persyst-catalog: Current official catalog lists MR3A16ACYS35 as MP, 8Mb, x16, 35ns, 3.3V and −40 to 85°C.](https://www.everspin.com/persyst?page=2)

### Everspin 1Gb STT-MRAM · STT-MRAM / DDR4-derived

Discrete persistent-memory supplier · Shipping

The 2025 Form 10-K confirms continuing 1Gb STT-MRAM shipments. The technology page identifies a DDR4-like persistent-DRAM product for enterprise storage.

DDR4-like does not imply drop-in compatibility with every DDR4 controller. Do not transfer Toggle or xSPI retention, endurance or automotive ratings. The old family URL is now 404.

Source date / event period: 2026-03-04 · Checked 2026-09-10

- [everspin-1gb-ddr: Everspin 1Gb STT-MRAM · STT-MRAM / DDR4-derived](https://www.sec.gov/Archives/edgar/data/1438423/000162828026014733/mram-20251231.htm)
- [everspin-ddr-technology: Current official explanation of 1Gb DDR4-like persistent DRAM and separate xSPI STT products.](https://www.everspin.com/stt-mram-technology)
- [everspin-2025-10k: The annual filing confirms continuing 1Gb STT-MRAM shipments; its March 4 filing date is explicitly stated in the March 5 official release.](https://www.sec.gov/Archives/edgar/data/1438423/000162828026014733/mram-20251231.htm)

### Everspin EMxxLX xSPI · STT-MRAM / xSPI

Discrete memory supplier · HR 64Mb qualified and orderable; HR 128/256Mb scheduled at release

The March 5, 2026 investor release confirms HR 64Mb xSPI STT-MRAM completed AEC-Q100 Grade 1 production qualification and is orderable with distributor inventory. HR 128Mb qualification was expected in May and 256Mb in July, with 256Mb volume availability expected in the second half of 2026.

The 128Mb and 256Mb dates were forecasts as of March 5, 2026; subsequent completion was not verified. HR qualification does not transfer to other EMxxLX variants. This release does not specify bandwidth or retention.

Source date / event period: 2026-03-05 · Checked 2026-09-10

- [everspin-xspi: Everspin EMxxLX xSPI · STT-MRAM / xSPI](https://investor.everspin.com/news-releases/news-release-details/everspin-advances-high-reliability-xspi-mram-portfolio-256mb)
- [everspin-hr-xspi-20260305: Original official release: HR 64Mb qualified and orderable; HR 128/256Mb qualification and volume dates remain forecasts.](https://investor.everspin.com/news-releases/news-release-details/everspin-advances-high-reliability-xspi-mram-portfolio-256mb)
- [everspin-ddr-technology: Current official explanation of 1Gb DDR4-like persistent DRAM and separate xSPI STT products.](https://www.everspin.com/stt-mram-technology)

### Avalanche Technology / UMC · pMTJ STT-MRAM

Memory supplier / foundry · Named product in production

The September 13, 2022 release announces immediate availability of Gen 3 P-SRAM on UMC 22nm. The cited parallel x32 product specifies over 10^14 writes and 1,000-year retention at 85°C.

This is a discrete product, not proof of identical specifications for general UMC embedded macros. Retention is a supplier reliability specification.

Source date / event period: 2022-09-13 · Checked 2026-09-10

- [avalanche-umc22: Avalanche Technology / UMC · pMTJ STT-MRAM](https://www.umc.com/en/News/press_release/Content/technology_related/20220913)

### Avalanche Technology · STT-MRAM

Memory and technology developer · Cell-scaling milestone

The 2026 web announcement reports completion of a first-phase MTJ scaling milestone for future higher-density space-grade MRAM.

The page is dated March 2, 2026, but the body says March 2, 2025. A 16x density increase is a future goal, not a shipped product.

Source date / event period: 2026-03-02 · Checked 2026-09-10

- [avalanche-scaling2026: Avalanche Technology · STT-MRAM](https://www.avalanche-technology.com/avalanche-technology-phase-one-magnetic-cell-scaling-space-grade-mram-us-government/)

### Samsung Foundry · STT-MRAM / eMRAM

Foundry platform · 28FDS production; FinFET expansion

The current specialty-process page confirms 28nm FD-SOI eMRAM mass production since 2019 and expansion to 14LPU and 8LPU, with 5nm still planned.

Platform expansion does not establish named high-volume customers at every node. Earlier roadmap dates are not completion evidence.

Undated source; checked 2026-09-10

- [samsung-emram: Samsung Foundry · STT-MRAM / eMRAM](https://semiconductor.samsung.com/foundry/process-technology/specialty-technology/)

### Intel · STT-MRAM

Process and device R&D · Published research; current product unverified

The official IEDM 2018 program lists Intel-authored work on MRAM embedded in 22FFL FinFET, establishing primary evidence of process-integration research.

No newer verified Intel commercial MRAM offering was found in this bounded review. Do not infer availability from the paper or the Intel 16 name.

Source date / event period: 2018-12-04 · Checked 2026-09-10

- [intel-22ffl-research: Intel · STT-MRAM](https://ieee-iedm.org/wp-content/uploads/2026/05/2018-IEDM-Archive.pdf)

### TSMC · eMRAM / STT route

Foundry platform · Automotive Grade 1 qualified

The 2025 annual report confirms qualification and customer availability of second-generation 16nm automotive Grade 1 MRAM. 12nm automotive and 5nm high-speed MRAM remain in development.

Qualification is not proof of volume shipment of a named MCU. SOT research must remain separate from qualified platforms.

Source date / event period: 2025 · Checked 2026-09-10

- [tsmc-16mram2025: TSMC · eMRAM / STT route](https://investor.tsmc.com/sites/ir/annual-report/2025/2025%20Annual%20Report.E.pdf)

### TSMC SOT-MRAM · SOT-MRAM

Advanced memory R&D · Research demonstration

The 2025 annual report describes an IEDM 2025 Type-C SOT-MRAM demonstration using a circular MTJ with built-in magnetic anisotropy for field-free operation.

A research demonstration is not a commercial process or a shipping SRAM replacement; 16nm automotive MRAM maturity does not transfer.

Source date / event period: 2025-12 · Checked 2026-09-10

- [tsmc-sot2025: TSMC SOT-MRAM · SOT-MRAM](https://investor.tsmc.com/sites/ir/annual-report/2025/2025%20Annual%20Report.E.pdf)

### GlobalFoundries · STT-MRAM / 22FDX

Foundry platform · Platform entered production

The February 27, 2020 announcement confirms production entry of 22FDX eMRAM and 4–48Mb silicon-validated macros, with 100k endurance and 10-year retention across the stated temperature range.

Grade 1 was a future target in that release. The current FDX page still lists MRAM, but customer-specific qualification requires separate evidence.

Source date / event period: 2020-02-27 · Checked 2026-09-10

- [gf-22fdx: GlobalFoundries · STT-MRAM / 22FDX](https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram)
- [gf-current-fdx: Current FDX platform page continues to list MRAM.](https://gf.com/technologies/cmos/fdx-fd-soi/)

### Renesas RA8M2 / RA8D2 · Embedded MRAM

MCU supplier · Available; Japanese release confirms production

The October 22, 2025 release announces available RA8M2 and RA8D2 MCUs with embedded MRAM, a 1GHz Cortex-M85 and a 250MHz Cortex-M33.

CPU clock is not native MRAM read speed. Do not transfer 2024 research-macro measurements directly to the RA8 products.

Source date / event period: 2025-10-22 · Checked 2026-09-10

- [renesas-ra8-2025: Renesas RA8M2 / RA8D2 · Embedded MRAM](https://www.renesas.com/en/about/newsroom/renesas-adds-two-new-mcu-groups-blazing-fast-ra8-series-1ghz-performance-and-embedded-mram)

### NXP S32K5 · Embedded MRAM

Automotive MCU supplier · Announced; official brief says preproduction

NXP announced the 16nm FinFET S32K5 with embedded MRAM on March 11, 2025. Its October 30, 2025 product brief still labels the family preproduction.

The claimed 15x write advantage is a supplier comparison against embedded flash, not an absolute latency. Announcement is not volume-production evidence.

Source date / event period: 2025-10-30 · Checked 2026-09-10

- [nxp-s32k5: NXP S32K5 · Embedded MRAM](https://www.nxp.com/assets/block-diagram/en/S32K5.pdf)
- [nxp-launch: S32K5 launch and supplier comparison claims.](https://www.nxp.com/company/about-nxp/newsroom/NW-NEW-S32K5-MICROCONTROLLER)

### NETSOL · STT-MRAM

Discrete memory supplier · Named product datasheet

The March 2024 S3RxxxxR1M datasheet specifies 1–16Mbit STT-MRAM, asynchronous x8/x16 interfaces and an industrial −40 to 85°C range; the website also lists serial products.

Do not transfer larger densities or process nodes from other series or media reports into this datasheet. Shipment volume is not disclosed.

Source date / event period: 2024-03 · Checked 2026-09-10

- [netsol-stt: NETSOL · STT-MRAM](https://netsol.co.kr/wp-content/uploads/2024/03/S3RxxxxR1M_rev1.1.pdf)

### TDK / Headway · STT-MRAM

Magnetics, MTJ and technology R&D · Technology and R&D; commercial memory SKU unverified

TDK's September 1, 2025 investor-day presentation includes STT-MRAM among its spintronics technologies; Headway authors also have public embedded-STT-MRAM research presentations.

HDD-head production and MTJ expertise do not establish commercial discrete MRAM. No orderable MRAM SKU, PDK or specific foundry commitment was verified.

Source date / event period: 2025-09-01 · Checked 2026-09-10

- [tdk-headway: TDK / Headway · STT-MRAM](https://www.tdk.com/system/files/tdk_investor_day_20250901_en.pdf)
- [headway-author-research: Headway-authored embedded STT-MRAM research presentation; not commercial supply evidence.](https://www.cea.fr/cea-tech/leti/Documents/%C3%A9v%C3%A9nements/Prez%20workshop%20memory%202017/2.2.pdf)

### Numem · Foundry-based STT-MRAM

Memory IP and chip/chiplet architecture provider · Supplier claims production readiness; shipments unverified

Numem describes foundry-based STT-MRAM IP and chips/chiplets enhanced by AIME. Its June 10, 2025 announcement claims production readiness.

Power and SRAM-class performance are supplier claims without uniform independent benchmarking. This is not evidence of a new magnetic material or named volume shipments.

Source date / event period: 2025-06-10 · Checked 2026-09-10

- [numem-aime: Numem · Foundry-based STT-MRAM](https://numem.com/news)
- [numem-current: Current site explicitly identifies foundry-based STT-MRAM and AIME.](https://www.numem.com/)

### imec · SOT-MRAM

Research institute / technology R&D · 300mm research-device demonstration

On December 13, 2023 imec reported roughly 50nm critical-dimension SOT devices on 300mm wafers, below 100fJ/bit switching energy and endurance above 10^15 cycles.

Device switching energy excludes full macro, bus and system overhead. The 50nm dimension is not a 50nm CMOS process-node claim.

Source date / event period: 2023-12-13 · Checked 2026-09-10

- [imec-sot: imec · SOT-MRAM](https://www.imec-int.com/en/press/imecs-extremely-scaled-sot-mram-devices-show-record-low-switching-energy-and-virtually)

### IBM Research · STT-MRAM

Device and Integration Research · Device and CMOS Integration Demonstrations

IBM contributes traceable device physics and CMOS integration results. MTJ size, process node and write-error rate from different studies must not be combined into an imaginary best-specification product.

IBM papers are not a list of IBM production foundry services.

Checked 2026-09-10

- [RES-IBM-REVIEW-2024: IBM Authors: STT-MRAM Status and Directions](https://research.ibm.com/publications/spin-transfer-torque-magnetoresistive-random-access-memory-technology-status-and-future-directions)
- [RES-IBM-11NM-2017: IBM: Low-Current 11nm MTJ Research](https://research.ibm.com/publications/low-current-spin-transfer-torque-mram--1)

### ITRI · SOT-MRAM

Collaborative Research, Prototyping and Transfer · Research Arrays, Prototypes and Trial Production

ITRI evidence spans distinct collaborations and versions: SOT with TSMC, cryogenic STT with NYCU, a joint β-W array, an 8-inch prototyping service and RRAM technology transfer.

Collaborative research must not be represented as an ITRI standalone production product.

Checked 2026-09-10

- [RES-ITRI-SOT-2022: ITRI: SOT and Cryogenic STT Collaborations](https://www.itri.org.tw/ListStyle.aspx?DisplayStyle=01_content&MGID=111061510283488782&MmmID=1036276263153520257&SiteID=1)
- [RES-ITRI-CIM-2024: ITRI / TSMC: IEDM 2023 SOT-CIM](https://www.itri.org.tw/ListStyle.aspx?DisplayStyle=01_content&MGID=113011710184808020&MmmID=1036276263153520257&SiteID=1)
- [RES-ITRI-SERVICE: ITRI: 8-Inch MRAM Development Services](https://www.itri.org.tw/english/ListStyle.aspx?DisplayStyle=01_content&MGID=1126511563713777471&MmmID=1071732317047353240&SiteID=1)

### Weebit Nano · ReRAM

ReRAM IP licensor · Licensing and customer prototypes

Three customer designs had taped out by July 2026, with a prototype running software.

First customer product mass production remained a future milestone.

Source date / event period: 2026-07-31 · Checked 2026-09-10

- [RRAM-WEEBIT-2026: Weebit Nano · ReRAM](https://www.weebit-nano.com/news/press-releases/weebit-nano-expands-licensing-agreements-with-key-customers-three-customer-chip-designs-taped-out-to-date/)

### onsemi · ReRAM

IDM adopting ReRAM · Technology transfer

Weebit reported onsemi ReRAM technology transfer progressing to schedule.

Licensing or transfer does not establish product mass production.

Source date / event period: 2026-07-31 · Checked 2026-09-10

- [RRAM-ONSEMI-2026: onsemi · ReRAM](https://www.weebit-nano.com/news/press-releases/weebit-nano-expands-licensing-agreements-with-key-customers-three-customer-chip-designs-taped-out-to-date/)

### Texas Instruments · ReRAM

IDM adopting ReRAM · Technology transfer

Weebit reported TI ReRAM technology transfer progressing to schedule.

TI commercial FRAM and this ReRAM transfer are separate technology routes.

Source date / event period: 2026-07-31 · Checked 2026-09-10

- [RRAM-TI-2026: Texas Instruments · ReRAM](https://www.weebit-nano.com/news/press-releases/weebit-nano-expands-licensing-agreements-with-key-customers-three-customer-chip-designs-taped-out-to-date/)

### SkyWater / Weebit Nano · ReRAM

Foundry and IP partnership · Qualified IP available for SoC integration

The official IP page lists qualified S130 130 nm CMOS ReRAM, available for integration, with two added masks in BEOL.

IP qualification does not qualify every customer chip or prove its mass production.

Undated source; checked 2026-09-10

- [RRAM-SKYWATER-S130: SkyWater/Weebit Nano · ReRAM](https://www.weebit-nano.com/products/embedded-reram-ip/weebit-reram-nvm-in-skywater-130nm-cmos/)

### DB HiTek / Weebit Nano · ReRAM

Foundry and IP partnership · Qualified and available for integration

130 nm BCD ReRAM IP is silicon-proven and qualified, adding two masks; listed specifications include 10K writes and over ten years retention at 125°C.

100K cycles is an extension option; base BCD volume does not establish ReRAM product shipments.

Undated source; checked 2026-09-10

- [RRAM-DBHITEK-130: DB HiTek/Weebit Nano · ReRAM](https://www.weebit-nano.com/products/embedded-reram-ip/wbt-dbh-db130lva-reram-rram/)

### TSMC · ReRAM

Embedded-memory foundry · 40/22 in production; 12 risk production

The IoT NVM page lists 40RRAM and 22RRAM in production; 12RRAM entered consumer-grade risk production in 2024, with cells between BEOL metal layers.

12RRAM risk production is not full production or automotive qualification.

Source date / event period: 2024 · Checked 2026-09-10

- [RRAM-TSMC-IOT: TSMC · ReRAM](https://www.tsmc.com/english/dedicatedFoundry/technology/platform_IoT_tech_NVM)

### Infineon / TSMC · ReRAM

Automotive MCU and process partnership · Announced integration partnership

The 2022 announcement describes preparing TSMC RRAM for next-generation AURIX TC4x, supporting bit-wise writes without prior erase.

This announcement does not prove every TC4x variant uses RRAM or has reached production.

Source date / event period: 2022-11-25 · Checked 2026-09-10

- [RRAM-INFINEON-TC4X: Infineon/TSMC · ReRAM](https://www.infineon.com/technology-news/2022/infatv202211-031)

### GlobalFoundries / Renesas / Dialog · CBRAM

CBRAM acquisition and foundry integration · 2023 acquisition; 22FDX then in qualification

GF acquired production-proven CBRAM technology from Renesas in 2023, following a 2020 Dialog license; 22FDX qualification was underway.

Prior CBRAM production does not establish 22FDX production; the acquirer was GF, not Infineon.

Source date / event period: 2023-02-09 · Checked 2026-09-10

- [CBRAM-GF-RENESAS: GlobalFoundries/Renesas/Dialog · CBRAM](https://gf.com/news-and-events/news/globalfoundries-acquires-renesas-non-volatile-resistive-ram-technology-to-proliferate-iot-and-5g-applications/)

### Nuvoton · ReRAM

Embedded ReRAM MCU supplier · Commercial product family

The M2L31 family lists an Arm Cortex-M23, 64–512 KB ReRAM and 72 MHz operation; writes do not require a page erase.

72 MHz is the MCU clock, not cell write latency; density and reliability are part-specific.

Undated source; checked 2026-09-10

- [RRAM-NUVOTON-M2L31: Nuvoton · ReRAM](https://www.nuvoton.com/products/microcontrollers/arm-cortex-m23-mcus/m2l31-series/index.html)

### Panasonic / UMC · ReRAM

Historical ReRAM process collaboration · 2017 joint-development announcement

The 2017 agreement combined Panasonic ReRAM with UMC manufacturing to develop a 40 nm mass-production process.

The development target is not evidence of 2026 availability or the process used by every current Nuvoton part.

Source date / event period: 2017-02-01 · Checked 2026-09-10

- [RRAM-PANASONIC-UMC: Panasonic/UMC · ReRAM](https://news.panasonic.com/global/press/en170201-3)

### RAMXEED · ReRAM

Standalone ReRAM supplier · Specific part in mass production

The product list marks the MB85AS8MT 8 Mbit SPI ReRAM as mass-produced with one million cycles; the 12 Mbit part requires sales contact.

Do not transfer the 8 Mbit production status or endurance to the 12 Mbit part.

Undated source; checked 2026-09-10

- [RRAM-RAMXEED-PRODUCT: RAMXEED · ReRAM](https://www.ramxeed.com/products/reram/reram-products.html)

### CrossBar · ReRAM

ReRAM IP and secure-processor developer · Vendor architecture and chip disclosure

A 2026 company article describes the 22 nm Daric secure processor integrating ReRAM, computing and cryptography on one die.

The article does not establish production qualification or independent security certification; avoid blanket immunity claims.

Source date / event period: 2026-05-06 · Checked 2026-09-10

- [RRAM-CROSSBAR-DARIC: CrossBar · ReRAM](https://crossbar-inc.com/blogs/all/overview-of-crossbar-hardware-reram-and-chip)

### CEA-Leti / Weebit Nano · ReRAM

ReRAM and neuromorphic research partnership · Research demonstration

The announcement combines CEA-Leti spiking neural networks with Weebit SiOx ReRAM in a neuromorphic object-recognition demonstration.

The demonstration is not an orderable complete AI accelerator; transfer and qualification require separate evidence.

Source date / event period: 2019-07-18 · Checked 2026-09-10

- [RRAM-CEA-LETI: CEA-Leti/Weebit Nano · ReRAM](https://www.cea.fr/cea-tech/leti/english/Pages/What's-On/Press%20release/Weebit-Nano-and-CEA-Leti-to-demonstrate-brain-inspired-neuromorphic-demo-.aspx)

### UMC · 22nm RRAM

Foundry and Ecosystem Integration · Qualified RRAM IP; Named MRAM Products Available

UMC evidence spans process availability, qualified RRAM IP, a SoC development platform and standalone MRAM products. These are distinct delivery levels.

A standalone MRAM product does not establish an available embedded macro.

Checked 2026-09-10

- [RES-UMC-RRAM-2023: UMC / eMemory: 22nm RRAM Qualification](https://www.umc.com/en/News/press_release/Content/technology_related/20230328)
- [RES-UMC-MRAM-2022: UMC / Avalanche: 22nm P-SRAM Availability](https://www.umc.com/en/News/press_release/Content/technology_related/20220913)

### ITRI · 1S1R RRAM

Technology transfer · Undated research / transfer listing

Cross-point RRAM and selector development with published electrical and geometry targets.

Not evidence of current high-volume manufacturing.

Checked 2026-09-10

- [RES-ITRI-RRAM: ITRI: 1S1R 3D RRAM Technology Transfer](https://www.itri.org.tw/ListStyle.aspx?DisplayStyle=13_content&MmmID=1036233405427625204&SiteID=1&Trt_idx=4557)

### STMicroelectronics · PCM, not established MRAM offering

MCU supplier; classification boundary · Announced; selected-customer early access

The November 18, 2025 STM32V8 announcement explicitly identifies 18nm FD-SOI and embedded PCM, with Samsung Foundry manufacturing cooperation.

The 2025 announcement offered early access to selected customers and targeted major OEM availability for Q1 2026, with broad availability later. Calendar passage does not prove completion.

Source date / event period: 2025-11-18 · Checked 2026-09-10

- [st-pcm-boundary: STMicroelectronics · PCM, not established MRAM offering](https://newsroom.st.com/media-center/press-item.html/p4733.html)

### Micron · 3D XPoint

Historical 3D XPoint developer and supplier · Historical route; development ceased

Micron announced an immediate end to 3D XPoint development in 2021 and redirected resources toward CXL memory products.

Ending this route does not end all PCM research; CXL is an interconnect, not a memory-cell mechanism.

Source date / event period: 2021-03-16 · Checked 2026-09-10

- [XPOINT-MICRON-EXIT: Micron · 3D XPoint](https://investors.micron.com/news/press-release/2021/Micron-Updates-Data-Center-Portfolio-Strategy-to-Address-Growing-Opportunity-for-Memory-and-Storage-Hierarchy-Innovation-03-16-2021/default.aspx)

### Intel · 3D XPoint

Historical Optane supplier · Historical route; business wind-down

Intel's 2022 annual filing states that the Optane memory business wind-down began in 2022.

Historical product pages or inventory sales do not establish continuing development or other vendors' PCM exits.

Source date / event period: 2022 · Checked 2026-09-10

- [XPOINT-INTEL-EXIT: Intel · 3D XPoint](https://www.intc.com/filings-reports/all-sec-filings/content/0000050863-23-000006/intc-20221231.htm)

### STMicroelectronics · PCM

Automotive embedded-PCM MCU supplier · Stellar family; P3E sampling and production plan

The 2026 Stellar P3E page identifies xMemory PCM, with full automotive qualification and production readiness planned for H2 2026.

Reaching the planned quarter does not prove completion; P3E timing does not apply to every Stellar part.

Source date / event period: 2026 · Checked 2026-09-10

- [PCM-ST-P3E: STMicroelectronics · PCM](https://www.st.com/content/st_com/en/campaigns/stellar-p3e-automotive-mcu-with-npu-accelerator-and-xmemory.html)

### IBM Research · PCM

Analog in-memory-computing research · Research chip

A 14 nm CMOS research chip with backend PCM integrates 64 256×256 analog cores and digital processing and communication for neural-network inference.

Analog weight-compute results do not establish a purchasable general-purpose PCM memory or complete-system performance.

Source date / event period: 2023-09-17 · Checked 2026-09-10

- [PCM-IBM-AIMC: IBM Research · PCM](https://research.ibm.com/publications/deep-neural-network-inference-with-a-64-core-in-memory-compute-chip-based-on-phase-change-memory)

### Texas Instruments · FeRAM

Embedded FRAM MCU supplier · Commercial MCUs and reference design

An MSP430 reference design emulates EEPROM using embedded FRAM and lists supported MCUs and I2C/SPI host interfaces.

FRAM is the storage technology; EEPROM emulation is interface behavior, not floating-gate or FeFET construction.

Source date / event period: 2016-12-20 · Checked 2026-09-10

- [FERAM-TI-MSP430: Texas Instruments · FeRAM](https://www.ti.com/tool/TIDM-FRAM-EEPROM)

### RAMXEED · FeRAM

Standalone FeRAM and embedded-application supplier · Mass-produced products

The FAQ states FeRAM has been mass-produced since 1999 for frequent-write applications; retention must be interpreted at the specified temperature.

Cycle ratings, interfaces and temperatures are part-specific; FeRAM is not synonymous with all FeFET or FTJ devices.

Undated source; checked 2026-09-10

- [FERAM-RAMXEED: RAMXEED · FeRAM](https://www.ramxeed.com/faq/)

### Infineon · FeRAM

Standalone F-RAM supplier · Commercial product family

Infineon lists serial, parallel and EXCELON F-RAM using PZT ferroelectric films, with family-dependent endurance up to 100 trillion cycles.

Maximum ratings do not apply to every part; this does not establish HfO2 FeFET or FTJ construction.

Undated source; checked 2026-09-10

- [FERAM-INFINEON: Infineon · FeRAM](https://www.infineon.com/products/memories/f-ram-ferroelectric-ram)

### GlobalFoundries / Fraunhofer IPMS · FeRAM

Ferroelectric process and research partnership · 22FDX industrial-process integration demonstration

The 2026 collaboration reports HfO2 ferroelectric FRAM integrated in 22FDX, operating below 1 V with nanosecond switching.

The announcement lacks orderable parts, a complete qualification report or shipment volumes.

Source date / event period: 2026-06-11 · Checked 2026-09-10

- [FERAM-GF-IPMS-2026: GlobalFoundries/Fraunhofer IPMS · FeRAM](https://www.ipms.fraunhofer.de/en/press-media/press/2026/Ferroelectric-memory-storage.html)

### imec · FeRAM / FeCAP

Ferroelectric-device and compute-in-memory research · Research demonstration

Joint work with Georgia Tech demonstrated nondestructive FeCAP reading, reporting over 10^11 read cycles at IEDM 2023.

Read endurance is not write endurance and does not establish conventional FeRAM behavior or mass production.

Source date / event period: 2023 · Checked 2026-09-10

- [FERRO-IMEC-NDREAD: imec · FeRAM/FeCAP](https://www.imec-int.com/en/articles/non-destructive-readout-mechanism-ferroelectric-capacitors)

### NaMLab · FeFET / FTJ

Ferroelectric-device research institute · Research and publications

The official 2025 publication list includes HZO bilayer FTJ thickness scaling and charge-trapping challenges in CMOS-embedded FeFETs.

Publication listings establish research participation, not foundry service, PDK availability or mass production.

Source date / event period: 2025 · Checked 2026-09-10

- [FERRO-NAMLAB-2025: NaMLab · FeFET/FTJ](https://www.namlab.com/publications/)

### FMC · HfO2 Ferroelectric Memory

Ferroelectric-memory commercialization developer · Commercialization and vendor solution claims

The current site proposes DRAM+ persistent modules and CACHE+ persistent chiplets based on ferroelectric technology.

The current page describes ferroelectric capacitors; it does not establish that DRAM+ or CACHE+ uses a FeFET or FTJ. Product qualification and shipment volumes are not verified.

Undated source; checked 2026-09-10

- [FERRO-FMC: FMC · Ferroelectric Memory](https://www.ferroelectric-memory.com/technology/)

### Infineon / Cypress · SONOS eFlash

Technology and IP licensor · Named production platforms and licensing

The official page identifies 2T SONOS, FN program/erase, production nodes and process/design licensing.

Separate Cypress history from current macros; do not combine family-wide maximum specifications.

Undated source; checked 2026-09-10

- [industry-infineon-sonos: Infineon/Cypress · SONOS eFlash](https://www.infineon.com/products/memories/embedded-flash-ip-solutions)

### SST / Microchip · SuperFlash NOR / eFlash

Technology and IP licensor · Commercial technology licensing

SST lists SuperFlash process integration and licensing, complementing standalone NOR coverage.

Licensing does not establish identical current qualification across nodes; verify each technology generation.

Undated source; checked 2026-09-10

- [industry-sst-superflash: SST/Microchip · SuperFlash NOR/eFlash](https://www.sst.com/services/)

### STMicroelectronics · eSTM eFlash / Page EEPROM

Integrated device manufacturer · Named commercial implementation

ST links 40nm floating-gate eSTM with vertical select transistors to STM32H5 and Page EEPROM implementations.

Keep eSTM separate from Stellar PCM; it is not the cell used by every ST MCU.

Undated source; checked 2026-09-10

- [industry-st-estm: STMicroelectronics · eSTM eFlash/Page EEPROM](https://www.st.com/content/st_com/en/about/innovation-and-technology/estm.html)

### Renesas · SG-MONOS eFlash

Integrated device manufacturer · Historical production and smaller-node research

The 2016 announcement identifies production 40nm SG-MONOS MCUs and research on 16/14nm fin-shaped cells.

This announcement does not prove 16/14nm production; verify current part numbers separately.

Source date / event period: 2016-12-07 · Checked 2026-09-10

- [industry-renesas-sgmonos: Renesas · SG-MONOS eFlash](https://www.renesas.com/en/about/press-room/renesas-electronics-announces-world-s-first-development-fin-shaped-monos-flash-memory-cells-high)

### X-FAB · XT011 eFlash / EEPROM

Foundry and platform provider · Named platform release

The 2024 announcement identifies embedded Flash and EEPROM on the XT011 110nm BCD-on-SOI platform.

Keep this separate from the historical 2003 XC06 example; do not assume identical cells.

Source date / event period: 2024-12-03 · Checked 2026-09-10

- [industry-xfab-xt011: X-FAB · XT011 eFlash/EEPROM](https://www.xfab.com/news/details/article/x-fab-releases-embedded-flash-solution-on-its-110nm-automotive-bcd-on-soi-technology)

### Macronix · Serial NOR / OctaBus

NOR/NAND product supplier · Official product portfolio

Macronix's official Serial NOR page provides its product portfolio and OctaBus interface offerings.

This source directly supports NOR; verify NAND parts separately and do not infer cell geometry from interfaces.

Undated source; checked 2026-09-10

- [industry-macronix-nor: Macronix · Serial NOR/OctaBus](https://www.macronix.com/en-us/products/NOR-Flash/Serial-NOR-Flash/Pages/default.aspx)

### Winbond · W25Q16JW Serial NOR

Code-storage memory supplier · Named product catalog

The official catalog identifies W25Q16JW Serial NOR and associated ordering entries.

Catalog presence does not guarantee stock; verify NAND families and other capacities separately.

Undated source; checked 2026-09-10

- [industry-winbond-w25q: Winbond · W25Q16JW Serial NOR](https://www.winbond.com/hq/new-online-purchasing-guide/?__locale=en&pLine=/product/code-storage-flash/qspi-nor/&pNo=W25Q16JW)

### Samsung · Ninth-Generation TLC V-NAND

NAND and storage supplier · Named generation in mass production

Samsung announced mass production of 1Tb TLC ninth-generation V-NAND in April 2024.

Evidence concerns this TLC generation; later demonstrations and projected QLC timing are separate.

Source date / event period: 2024-04-23 · Checked 2026-09-10

- [industry-samsung-vnand9: Samsung · Ninth-Generation TLC V-NAND](https://news.samsung.com/global/samsung-electronics-begins-industrys-first-mass-production-of-9th-gen-v-nand)

### SK hynix · 321-Layer TLC 4D NAND

NAND and storage supplier · Named generation starts mass production

SK hynix announced the start of 321-layer 1Tb TLC NAND mass production in November 2024.

Separate production from customer delivery; do not assign this die to every Solidigm SSD.

Source date / event period: 2024-11-21 · Checked 2026-09-10

- [industry-skhynix-321tlc: SK hynix · 321-Layer TLC 4D NAND](https://news.skhynix.com/en/sk-hynix-starts-mass-production-of-world-first-321-high-nand/)

### Solidigm · D5-P5336 QLC SSD

Enterprise SSD supplier · Named commercial product

The official D5-P5336 page identifies a commercial enterprise QLC SSD family and capacity options.

SSD capacity and system metrics are not die specifications; corporate relationships do not establish common NAND.

Undated source; checked 2026-09-10

- [industry-solidigm-p5336: Solidigm · D5-P5336 QLC SSD](https://www.solidigm.com/products/data-center/d5/p5336.html)

### Micron · G9 TLC NAND

NAND and storage supplier · Volume production and named SSD shipments

The July 2024 release reports G9 TLC NAND and volume shipment of the Micron 2650 SSD using it.

Do not extend TLC evidence to every QLC or NOR product; interface speed is not cell programming speed.

Source date / event period: 2024-07-30 · Checked 2026-09-10

- [industry-micron-g9: Micron · G9 TLC NAND](https://investors.micron.com/news/press-release/2024/Micron-Announces-Volume-Production-of-Ninth-Generation-NAND-Flash-Technology-07-30-2024/default.aspx)

### Kioxia / Sandisk · Tenth-Generation BiCS 3D NAND

Joint development and manufacturing partners · Production begins at a named fab

The July 2026 joint announcement states that tenth-generation 3D Flash production began at Kitakami K2.

Production start does not establish universal customer availability or identical finished products.

Source date / event period: 2026-07-03 · Checked 2026-09-10

- [industry-kioxia-sandisk-gen10: Kioxia/Sandisk · Tenth-Generation BiCS 3D NAND](https://www.kioxia.com/en-jp/about/news/2026/20260703-2.html)

### YMTC · Xtacking 3D NAND

NAND technology and product supplier · Published architecture and named product family

The official page explains separate peripheral/array wafers joined by bonding and names Xtacking 4.0 X4 products in 2025.

Awards and architecture descriptions alone do not prove each product's volume, layer count or shipment status.

Undated source; checked 2026-09-10

- [industry-ymtc-xtacking: YMTC · Xtacking 3D NAND](https://www.ymtc.com/en/technicalintroduction.html)

### GigaDevice · GD25 / GD55 NOR

NOR/NAND product supplier · Official product portfolio

The official portfolio lists GD25/GD55 NOR products.

Family coverage does not replace part-specific production status, temperature, endurance or retention specifications.

Undated source; checked 2026-09-10

- [industry-gigadevice-flash: GigaDevice · GD25/GD55 NOR; GD5F NAND](https://www.gigadevice.com/product/flash)

### Floadia · LEE Flash ZT MTP

Technology and IP licensor · Named commercial IP

The ZT page describes FN program/erase, zero added masks and named platform production records.

General and platform-specific endurance figures differ; do not infer universal endurance or polysilicon count.

Undated source; checked 2026-09-10

- [industry-floadia-zt: Floadia · LEE Flash ZT MTP](https://floadia.com/product/lee-flash-zt/)

### eMemory · NeoBit · Floating-Gate OTP · OTP

Memory IP / technology lineage · Named IP study; qualification is process-specific

Follow the series select transistor and p-type floating-gate storage transistor as electron injection changes read current. Then distinguish normal OTP operation from the physical possibility of ultraviolet erasure.

Historical cells and patents do not establish the structure of every current implementation.

Checked 2026-09-10

- [ip-neobit: NeoBit Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoBit)
- [ip-neobit-pat: Historical NeoBit Charge-Retention Patent](https://patents.google.com/patent/US6914825B2/en)

### eMemory · NeoFuse · Antifuse OTP · OTP

Memory IP / technology lineage · Named IP study; qualification is process-specific

Start at the n-type cell's gate dielectric and follow high-field defect creation, changes in effective tunneling distance and the gate current used for sensing.

Historical cells and patents do not establish the structure of every current implementation.

Checked 2026-09-10

- [ip-neofuse: NeoFuse Technical Principles](https://www.ememory.com.tw/en-US/Products/OTP/NeoFuse)
- [ip-neofuse-dt: Quantum Tunneling Mechanism in NeoFuse](https://www.chipestimate.com/Quantum-Tunneling-Mechanism-in-NeoFuse/eMemory/Technical-Article/2021/01/19)

### Kilopass; acquired by Synopsys in 2018 · Kilopass XPM · OTP

Memory IP / technology lineage · Named IP study; qualification is process-specific

The original patent explicitly names XPM and distinguishes the storage MOS from the select MOS.

Historical cells and patents do not establish the structure of every current implementation.

Checked 2026-09-10

- [ip-kilopass-xpm-2007: Historical Kilopass XPM 2T Patent Diagram](https://patents.google.com/patent/WO2007090089A2/en)
- [ip-kilopass-2t-2012: Kilopass 130/110 nm XPM and Gusto 2T Announcement](https://www.design-reuse.com/news/202521997-kilopass-nvm-ip-cores-first-to-deliver-footprint-and-pin-compatibility-across-eight-top-tier-silicon-foundries-for-the-130-110nm-process-node/)

### Sidense; acquired by Synopsys in 2017 · Sidense 1T-Fuse · OTP

Memory IP / technology lineage · Named IP study; qualification is process-specific

One gate spans thick and thin oxide; persistent conduction through the thin region creates the OTP state.

Historical cells and patents do not establish the structure of every current implementation.

Checked 2026-09-10

- [ip-sidense-cell-2007: Sidense 1T-Fuse Original-Author Cell Section](https://www.chipestimate.com/1T-OTP-Memory-Delivering-Quality-and-Reliability/Sidense-a-part-of-Synopsys/Technical-Article/2007/12/18)
- [ip-sidense-irreversible-2017: Sidense 1T-Fuse Irreversibility and eMTP Boundary](https://www.chipestimate.com/Enabling-Secure-Semiconductor-Supply-Chain-Management/Sidense-a-part-of-Synopsys/Technical-Article/2017/09/05)

### eMemory · NeoEE · FN/FN MTP · MTP

Memory IP / technology lineage · Named IP study; qualification is process-specific

Follow the control-coupling region, floating node and tunneling region as FN transport stores and removes electrons. A read transistor then senses the stored state.

Historical cells and patents do not establish the structure of every current implementation.

Checked 2026-09-10

- [ip-neoee: NeoEE Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoEE)
- [ip-neoee-history: Historical NeoEE Conceptual Cell](https://www.chipestimate.com/Value-Propositions-that-NeoEETM-Technology-can-Delivery/eMemory/Technical-Article/2010/10/19)

### eMemory · NeoMTP · CHI/FN MTP · MTP

Memory IP / technology lineage · Named IP study; qualification is process-specific

Compare hot-carrier programming of the p-type floating-gate cell with FN electron transfer toward a dedicated erase gate. Both operations act on the same storage node.

Historical cells and patents do not establish the structure of every current implementation.

Checked 2026-09-10

- [ip-neomtp: NeoMTP Technical Principles](https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP)
- [ip-neomtp-pat: Related pMOS and Edge-Erase-Gate Patent](https://patents.google.com/patent/US20030235082A1/en)

### Yield Microelectronics (YMC) · YMC · MTP and Mechanism Boundaries · MTP

Memory IP / technology lineage · Named IP study; qualification is process-specific

YMC publicly identifies a logic-process MTP family. The CHI/BBHH sequence below is an independent mechanism illustration, not evidence that a current ymtp product uses BBHH. Separate product capability from an illustrative 1T1C model.

Historical cells and patents do not establish the structure of every current implementation.

Checked 2026-09-10

- [ymc-product: YMC: Logic-Process ymtp MTP IP](https://www.ymc.com.tw/index_en.php)
- [ymc-1t1c: YMC: 1T1C Core Technology](https://www.ymc.com.tw/upload/files/6423%E5%84%84%E8%80%8C%E5%BE%97%E4%B8%8A%E5%B8%82%E5%89%8D%E6%A5%AD%E7%B8%BE%E7%99%BC%E8%A1%A8%E6%9C%83_%E7%B0%A1%E5%A0%B10416(%E4%B8%8A).pdf#page=25)

### Impinj → Virage Logic → Synopsys · AEON · FN/FN MTP · MTP

Memory IP / technology lineage · Named IP study; qualification is process-specific

Follow the named 2009 AEON company account: electrons enter and leave FG by FN, then a read MOS senses the state. Business and brand succession have a separate timeline.

Historical cells and patents do not establish the structure of every current implementation.

Checked 2026-09-10

- [aeon-impinj-2007: Impinj AEON/MTP Floating-Gate Announcement](https://www.impinj.com/about-us/news-room/2007/impinj-delivers-reprogrammable-nonvolatile-memory-ip-breakthrough---aeonmtp-worlds-first-25v-floatin)
- [aeon-virage-fn-2009: Virage Logic AEON MTP Program/Erase and Monitoring](https://www.chipestimate.com/Auto-Industry-Replaces-Fuse-Technology-with-Standard-CMOS-Based-MTP---Adds-Functionality-Testability-and-Reliability/Synopsys-formerly-Virage-Logic-products/Technical-Article/2009/06/30)

### Sony / Micron · Copper ReRAM

Joint device and memory R&D · Historical research demonstration

Micron’s 2014 VLSI announcement identifies Sony collaboration on copper ReRAM for a 16Gb storage-class-memory demonstration.

This does not establish current products or adoption in a Sony image sensor.

Source: 2014-06-05; checked 2026-09-10

- [RES-SONY-MICRON-2014: Micron / Sony: Copper ReRAM Research](https://investors.micron.com/static-files/7ac25c4b-edd0-4482-97ad-267a7263bcf0)

### GigaDevice · GD5F NAND

NOR/NAND product supplier · Official product portfolio

The official portfolio separately lists GD5F NAND products.

Family coverage does not replace part-specific production status, temperature, endurance or retention specifications.

Undated source; checked 2026-09-10

- [industry-gigadevice-flash: GigaDevice · GD25/GD55 NOR; GD5F NAND](https://www.gigadevice.com/product/flash)

### Kioxia/SK hynix · 64 Gbit 1Selector–1MTJ Cross-Point MRAM

Joint high-density MRAM research · IEDM 2024 research prototype; described publicly in 2025

The jointly developed 64 Gbit cross-point MRAM replaces select transistors with two-terminal selectors; MTJ diameter is 20 nm, half-pitch 20.5 nm, and cell area 0.001681 µm².

This is a research array, not evidence of product availability. The 20 nm figure is MTJ diameter, not a CMOS process node; typical-bit tests do not establish full-array yield.

Source date 2025-04-15

- [MRAM-KIOXIA-SKHYNIX-64GB-2025: Kioxia/SK hynix · 64 Gbit 1Selector–1MTJ Cross-Point MRAM](https://www.kioxia.com/en-jp/rd/technology/topics/topics-80.html)

### TetraMem · MLX200 Multi-Level RRAM Analog IMC

Multi-level RRAM analog in-memory computing developer · Tape-out and initial silicon validation completed

In May 2026, TetraMem reported MLX200 tape-out and initial silicon validation on TSMC 22nm, integrating multi-level RRAM with mixed-signal computing in a SoC.

Evaluation kits were scheduled for H2 2026 at announcement. Initial validation does not establish mass production or delivery, and computing results are not general-purpose storage specifications.

Source date 2026-05-19

- [RRAM-TETRAMEM-MLX200-2026: TetraMem · MLX200 Multi-Level RRAM Analog IMC](https://tetramem.com/tetramem-completes-mlx200-silicon-validation/)

### Intrinsic/sureCore · SiOx RRAM

Silicon-oxide RRAM and embedded-memory architecture collaboration · Technology development and commercialization collaboration

Intrinsic identifies silicon-oxide RRAM as its core technology and lists a sureCore collaboration combining CMOS-compatible cells, memory architectures and compiler-design expertise.

The collaboration does not establish qualification or mass production of a named process macro; the site does not provide a complete orderable part and datasheet proving current supply.

Undated source; reviewed 2026-09-10

- [RRAM-INTRINSIC-SURECORE: Intrinsic/sureCore · SiOx RRAM](https://www.intrinsicsemi.com/)

### Nantero/Fujitsu Semiconductor/Mie Fujitsu Semiconductor · Carbon-Nanotube NRAM

Historical carbon-nanotube NRAM licensing and joint development · 2016 licensing and 55nm joint-development announcement

Fujitsu's official archive confirms that its two semiconductor businesses licensed Nantero carbon-nanotube NRAM in 2016 and began joint development toward a 55nm product.

This historical development evidence establishes neither 2026 production and availability nor program termination; NRAM should be classified separately from oxide RRAM.

Source date 2016-08-31

- [NRAM-NANTERO-FUJITSU-2016: Nantero/Fujitsu Semiconductor/Mie Fujitsu Semiconductor · Carbon-Nanotube NRAM](https://info.archives.global.fujitsu/global/about/resources/news/press-releases/2016/)