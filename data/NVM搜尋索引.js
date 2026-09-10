window.NVMTopicIndex = [
  {
    "title_zh": "NVM 技術全景",
    "title_en": "NVM Technology Atlas",
    "url": "NVM技術全景.html",
    "tags": "NVM 全景 物理 比較 bitcell MRAM ReRAM GLOBALFOUNDRIES TSMC"
  },
  {
    "title_zh": "IP 單元與操作原理",
    "title_en": "IP Cells and Operating Principles",
    "url": "NVM技術全景.html#ip-directory",
    "tags": "IP 單元 目錄 operating principles directory"
  },
  {
    "title_zh": "IP 技術沿革與產品承接",
    "title_en": "IP Technology Lineage and Product Succession",
    "url": "NVM技術全景.html#ip-lineage",
    "tags": "Synopsys 收購 承接 技術沿革 acquisition lineage Kilopass Sidense Impinj Virage Logic AEON"
  },
  {
    "title_zh": "儲存物理專題",
    "title_en": "Device Physics Topics",
    "url": "NVM技術全景.html#nvm-physics-overview",
    "tags": "物理 基礎 儲存 standalone physics background"
  },
  {
    "title_zh": "NeoBit：浮動閘極 OTP 單元",
    "title_en": "NeoBit: Floating-Gate OTP Cell",
    "url": "NVM技術全景.html#ip-neobit",
    "tags": "eMemory NeoBit · Floating-Gate OTP Follow the series select transistor and p-type floating-gate storage transistor as electron injection changes read current. Then distinguish normal OTP operation from the physical possibility of ultraviolet erasure. Hot-hole-induced electron injection No electrical erase in normal OTP operation P-type storage-channel current 從串聯的選擇器與 p 型浮動閘極儲存電晶體，看電子注入如何改變讀取電流；再區分正常 OTP 操作與紫外線清除的物理可能性。"
  },
  {
    "title_zh": "NeoFuse：介電層型 Antifuse OTP 單元",
    "title_en": "NeoFuse: Gate-Dielectric Antifuse OTP Cell",
    "url": "NVM技術全景.html#ip-neofuse",
    "tags": "eMemory NeoFuse · Antifuse OTP Start at the n-type cell's gate dielectric and follow high-field defect creation, changes in effective tunneling distance and the gate current used for sensing. High-field dielectric defect generation No restoration of the pristine dielectric in normal use Gate current through the dielectric 從 n 型單元的閘極介電層出發，追蹤高場造成的缺陷、有效穿隧距離變化，以及讀取時可辨識的閘極電流。"
  },
  {
    "title_zh": "Kilopass XPM：歷史 2T 反熔絲",
    "title_en": "Kilopass XPM: Historical 2T Antifuse",
    "url": "NVM技術全景.html#ip-kilopass-xpm",
    "tags": "Kilopass; acquired by Synopsys in 2018 Kilopass XPM The original patent explicitly names XPM and distinguishes the storage MOS from the select MOS. High-field gate-oxide breakdown leaves a persistent conductance difference. The normal OTP interface has no electrical erase; remapping or emulated updates do not repair the original cell. After M1 selection, BL senses low/high current through M0 gate oxide. 以原始專利明稱 XPM 的 2T 圖解，分清儲存 MOS 與選擇 MOS。"
  },
  {
    "title_zh": "Sidense 1T-Fuse：分裂通道反熔絲",
    "title_en": "Sidense 1T-Fuse: Split-Channel Antifuse",
    "url": "NVM技術全景.html#ip-sidense-1t-fuse",
    "tags": "Sidense; acquired by Synopsys in 2017 Sidense 1T-Fuse One gate spans thick and thin oxide; persistent conduction through the thin region creates the OTP state. High-field gate-oxide breakdown leaves a persistent conductance difference. The normal OTP interface has no electrical erase; remapping or emulated updates do not repair the original cell. Sense low/high current between WL and BL at lower stress. 單一閘極跨越厚／薄氧化層；薄區永久導通形成 OTP 狀態。"
  },
  {
    "title_zh": "NeoEE：FN／FN 單層多晶矽 MTP",
    "title_en": "NeoEE: FN/FN Single-Poly MTP",
    "url": "NVM技術全景.html#ip-neoee",
    "tags": "eMemory NeoEE · FN/FN MTP Follow the control-coupling region, floating node and tunneling region as FN transport stores and removes electrons. A read transistor then senses the stored state. FN transfers electrons into the floating node FN transfers electrons out of the floating node Charge changes the read-transistor state 沿控制耦合區、浮動節點與穿隧區，分別追蹤 FN 如何將電子存入與移出，再由讀取電晶體感測儲存狀態。"
  },
  {
    "title_zh": "NeoMTP：CHI／FN 單層多晶矽 MTP",
    "title_en": "NeoMTP: CHI/FN Single-Poly MTP",
    "url": "NVM技術全景.html#ip-neomtp",
    "tags": "eMemory NeoMTP · CHI/FN MTP Compare hot-carrier programming of the p-type floating-gate cell with FN electron transfer toward a dedicated erase gate. Both operations act on the same storage node. Channel-hot-hole-induced electron injection FN electron transfer toward the erase gate P-type floating-gate transistor current 比較 p 型浮動閘極單元的熱載子寫入，以及電子經 FN 移向專用抹除閘極的反向路徑。兩種操作在同一儲存節點上完成。"
  },
  {
    "title_zh": "YMC MTP：寫入、抹除與公開證據",
    "title_en": "YMC MTP: Program, Erase and Public Evidence",
    "url": "NVM技術全景.html#ip-ymc-mtp",
    "tags": "Yield Microelectronics (YMC) YMC · MTP and Mechanism Boundaries YMC publicly identifies a logic-process MTP family. The CHI/BBHH sequence below is an independent mechanism illustration, not evidence that a current ymtp product uses BBHH. Separate product capability from an illustrative 1T1C model. Product: programmable; illustration: CHI electron injection Product: rewritable MTP; illustration: BBHH hole injection NMOS threshold and channel current YMC 公開提供邏輯製程 MTP 家族。下方 CHI／BBHH 是獨立機制示意，並非現行 ymtp 商品採 BBHH 的證據；產品能力與 1T1C 教學模型分開閱讀。"
  },
  {
    "title_zh": "AEON：Impinj 起源的 FN／FN MTP 家族",
    "title_en": "AEON: An Impinj-Origin FN/FN MTP Family",
    "url": "NVM技術全景.html#ip-impinj-aeon",
    "tags": "Impinj → Virage Logic → Synopsys AEON · FN/FN MTP Follow the named 2009 AEON company account: electrons enter and leave FG by FN, then a read MOS senses the state. Business and brand succession have a separate timeline. FN adds electrons to floating gate FN removes electrons from floating gate Low-stimulus read-MOS current sensing 依 2009 年具名 AEON 原廠資料，追蹤電子經 FN 存入與移出浮動閘極，再由讀取 MOS 感測；品牌與業務承接另列時間線。"
  },
  {
    "title_zh": "Numem：嵌入式 STT-MRAM IP 單元",
    "title_en": "Numem: Embedded STT-MRAM IP Cell",
    "url": "NVM技術全景.html#ip-numem-mram",
    "tags": "Numem Numem · STT-MRAM IP Connect foundry-standard STT-MRAM cells to embedded IP by identifying the magnetic junction, access transistor, bit line, source line and sensing path. Spin-transfer torque switches magnetization Opposite write current overwrites the state Magnetic-junction resistance contrast 從晶圓廠標準 STT-MRAM 單元與嵌入式 IP 的關係，辨認磁性接面、存取電晶體、位元線、源極線及感測路徑。"
  },
  {
    "title_zh": "GLOBALFOUNDRIES：22FDX 嵌入式 MRAM 單元",
    "title_en": "GLOBALFOUNDRIES: 22FDX Embedded MRAM Cell",
    "url": "NVM技術全景.html#ip-gf-emram",
    "tags": "GLOBALFOUNDRIES GF 22FDX · eMRAM Cell Use a publicly reported 22FDX research cell to examine 1T1MTJ, free and reference layers, and bidirectional switching under the source's current convention. Switch under the named study's polarity convention Reverse overwrite; no prior erase cycle Sense P/AP resistance with a small stimulus 用 22FDX 公開研究單元理解 1T1MTJ、自由層與參考層，以及由該來源定義的雙向電流切換。"
  },
  {
    "title_zh": "Weebit Nano：氧化矽 ReRAM IP 單元",
    "title_en": "Weebit Nano: Silicon-Oxide ReRAM IP Cell",
    "url": "NVM技術全景.html#ip-weebit-reram",
    "tags": "Weebit Nano Weebit · Silicon-Oxide ReRAM Follow oxygen exchange, a defect-related conduction path and access-transistor current compliance in a public silicon-oxide research structure to understand embedded ReRAM SET, RESET and read. SET establishes a low-resistance defect path RESET changes oxygen and defect distributions Sense resistance with a small stimulus 以公開的氧化矽研究結構，追蹤氧交換、缺陷路徑與存取電晶體限流，理解嵌入式 ReRAM 的 SET、RESET 與讀取。"
  },
  {
    "title_zh": "Crossbar：金屬路徑 ReRAM 嵌入式單元",
    "title_en": "Crossbar: Metallic-Path Embedded ReRAM Cell",
    "url": "NVM技術全景.html#ip-crossbar-reram",
    "tags": "Crossbar Crossbar · Metallic-Path ReRAM Read Crossbar's public patent and historical embedded-macro materials through metallic-path extension, retraction and low-stimulus sensing. SET extends the metallic path RESET retracts or disconnects the path Conduction paths and interparticle transport 以 Crossbar 公開專利與歷史嵌入式宏資料，理解金屬粒子路徑延伸、回縮與低刺激感測。"
  },
  {
    "title_zh": "eFuse：以永久導通變化記住一個位元",
    "title_en": "eFuse: Permanent Conductance Programming",
    "url": "NVM技術全景.html#topic-efuse",
    "tags": "A bit is stored as a difference in the resistance of a conductive path. An unprogrammed fuse typically has low resistance; a controlled current causes material migration or a break in a designated region, producing higher resistance. Logic 0/1 is defined by sensing and encoding. High resistance does not intrinsically correspond to a particular bit value, and the programmed state must not be assumed to be an ideal open circuit. eFuse is suited to permanently storing small amounts of on-chip configuration, such as trim codes, repair addresses, and identification data. One-time programming means that each physical location supports an effective transition in only one irreversible direction; separate locations can be programmed in batches. Multiple programming commands to a macro do not make an individual fuse reversibly erasable and rewritable. IBM's 2007 technology review describes eFUSE evolution from 180 nm to 45 nm and applications in memory redundancy, chip identification, and analog trimming, establishing implementations in identified processes. This material also uses IBM and TSMC patents to explain polysilicon/silicide and metal-via structures. 位元存在導電路徑的電阻差異中。未程式化熔絲通常保持低電阻；受控電流使指定區域發生材料遷移或斷開，形成較高電阻。邏輯 0／1 由感測與編碼定義，不能把高電阻天然指定為某個位元，也不能假定寫後一定是理想開路。 eFuse 適合把少量設定永久留在晶片上，例如校調碼、修復位址與識別資料。OTP 的一次是每個物理位置只允許一個不可逆方向的有效轉換；多個位置可分批寫入。巨集收到多次程式化命令，並不表示同一熔絲已具備可逆抹寫能力。 IBM: Locally Narrowed Electrical Fuse Patent US7417300B2 TSMC: Metal Via Fuse Patent US8847350B2 IBM: eFUSE from Memory Redundancy to Autonomic Chips US7417300B2 US8847350B2"
  },
  {
    "title_zh": "Antifuse：以介電層崩潰建立永久導通",
    "title_en": "Antifuse: Permanent Conduction Through Dielectric Breakdown",
    "url": "NVM技術全景.html#topic-antifuse",
    "tags": "Before programming, the storage dielectric separates two electrodes and permits only very small leakage. Programming creates a permanent, detectable conduction path through a high electric field. Information resides in the conduction difference before and after breakdown, opposite to the typical eFuse transition from low to high resistance. Both can provide OTP, but their storage materials and programming conditions differ. Antifuse design aims to establish acceptable conduction first in a designated storage dielectric while keeping selectors, peripheral circuits, and half-selected cells functional; it does not rely on uncontrolled breakdown across the chip. Permanent data can support identification, trimming, code, or key storage. Security is separately determined by the readout interface, access controls, and protective design. Synopsys' 2018 acquisition statement identifies Kilopass antifuse 1T/2T IP, including XPM, Gusto, and SecretCode, and reports aggregate cumulative shipments exceeding 10 billion units. The current OTP page separately lists advanced-node silicon validation and specific automotive qualifications, indicating continued commercial availability. 未程式化時，儲存介電層隔開兩個電極，只容許很小的漏電；程式化以高電場形成永久可感測導通路徑。資訊存在崩潰後與崩潰前的導通差異，方向與典型 eFuse 的低阻轉高阻相反。兩者都可提供 OTP，但儲存材料與寫入條件不同。 Antifuse 的設計不是讓整個晶片承受失控崩潰，而是使指定儲存介電層先形成可接受的導通，選擇器、周邊和半選單元仍保持功能。永久資料可用於識別、校調、程式碼或金鑰儲存；安全性則另由讀出介面、存取控制與防護設計決定。 Kilopass: Ultrathin Dielectric Breakdown Cell Patent US6667902B2 Synopsys: 2018 Kilopass Acquisition and OTP Shipment Statement Synopsys: Current Antifuse OTP NVM IP Product Page US6667902B2"
  },
  {
    "title_zh": "傳統獨立式 EEPROM：局部穿隧窗口與細粒度更新",
    "title_en": "Conventional Standalone EEPROM: Local Windows and Fine Updates",
    "url": "NVM技術全景.html#topic-eeprom",
    "tags": "A floating gate is a conductive island surrounded by insulating layers, with no direct DC metal connection to it. Retained charge changes how the control gate acts on the channel, shifting the MOS threshold voltage. In a typical n-channel example, adding electrons makes conduction more difficult. Reading measures the channel; normal read operation does not require draining the stored electrons. This topic covers conventional standalone EEPROM: the array, voltage boosting, controller, and interface are packaged as a separate device accessed through a serial or parallel interface. Microchip 24LC256 is an identified I2C serial example. Foundry EEPROM macros and third-party MTP IP integrated within a chip are compared in the separate Embedded MTP IP topic. Microchip publicly offers the 24LC256 serial EEPROM and its full datasheet, covering packages, I2C, byte writes, a page buffer, and an internal high-voltage generator. This establishes a standalone product; the local-window teaching diagram is supported separately by a public patent. 浮動閘極是被絕緣層包圍的導電小島，沒有直流金屬接點直接連到它。留存電荷改變控制閘極對通道的作用，使 MOS 臨界電壓位移；對典型 n 通道例，增加電子使導通較困難。讀取量測通道，正常操作不必把儲存電子倒出來。 本頁聚焦 conventional standalone EEPROM：記憶體陣列、升壓、控制與介面包在獨立元件內，系統透過序列或平行介面存取。Microchip 24LC256 是具名 I²C 序列元件範例；嵌入晶片內部的 foundry EEPROM 巨集與第三方 MTP IP，另在嵌入式 MTP IP 主題比較。 Hughes Aircraft Company: Local Tunnel-Window EEPROM Patent US4115914A Microchip: 24AA256/24LC256/24FC256 Standalone Serial EEPROM Datasheet US4115914A"
  },
  {
    "title_zh": "嵌入式 MTP IP：代工雙層與第三方單層多晶矽",
    "title_en": "Embedded MTP IP: Foundry Double-Poly and Third-Party Single-Poly",
    "url": "NVM技術全景.html#topic-mtp",
    "tags": "This topic focuses on floating-gate embedded MTP/EEPROM IP. Charge remains on an insulated conductive floating node and alters channel conduction through capacitive coupling. n-type and p-type storage transistors have different read-state behavior: adding electrons makes the n-channel US5844271A example harder to turn on, while eMemory describes its p-type NeoMTP device as turning on after electron injection. MTP IP provides rewritable nonvolatile storage inside the host chip, so selection centers on process and macro integration. Foundry double-poly EEPROM can be supplied through a dedicated NVM option; identified public evidence for third-party single-poly alternatives includes Synopsys MTP EEPROM and eMemory NeoEE/NeoMTP. This category is separate from packaged standalone EEPROM and does not merge SONOS Flash or antifuse OTP into floating-gate MTP. Current Synopsys and eMemory product pages directly identify single-poly MTP/EEPROM IP. The 2003 X-FAB XC06 brief provides a historical foundry double-poly NVM example. YMC has a logic-process MTP offering and a separate single-poly patent; Floadia ZT has a public floating-gate/FN program-and-erase example. 本頁聚焦浮動閘極型嵌入式 MTP／EEPROM IP。電荷留在絕緣包圍的導電浮動節點，透過電容耦合改變通道導通條件。n 型與 p 型儲存電晶體的讀取狀態不同；例如 US5844271A 的 n 通道例加電子後較難導通，力旺 NeoMTP 的 p 型例則由原廠說明加電子後導通。 MTP IP 在主晶片內提供可重寫非揮發性儲存，選型重點是製程與巨集整合。代工廠雙層多晶矽 EEPROM 可依專用 NVM 選配供應；第三方單層多晶矽方案則有 Synopsys MTP EEPROM、eMemory NeoEE／NeoMTP 等具名公開證據。此分類與獨立封裝 EEPROM 分開，也不把 SONOS Flash 或 Antifuse OTP 混入浮動閘極 MTP。 Foundry Double-Poly EEPROM Option X-FAB XC06 (historical 2003 example) 2: double-poly NVM stack Separate polysilicon layers can form floating and control gates; the XC06 brief does not disclose the complete EEPROM cross-section. Third-Party Single-Poly MTP IP Synopsys MTP EEPROM; eMemory NeoEE/NeoMTP 1: explicitly stated for the identified products Capacitive coupling controls a floating node; control capacitors, storage transistors, and erase regions are vendor-specific. Cypress Semiconductor: Buried-Control-Gate Single-Poly EEPROM Patent US5844271A Synopsys: MTP EEPROM NVM IP for Analog and Mixed-Signal Processes Synopsys: Single-Poly Floating-Gate MTP EEPROM IP eMemory: NeoEE Single-Poly Embedded EEPROM eMemory: NeoMTP Single-Poly p-Type Floating-Gate Principles X-FAB: Historical XC06 Double-Poly Embedded EEPROM Process Brief Yield Microelectronics: Logic-Process Embedded MTP IP Yield Microelectronics: Single-Floating-Gate NVM Patent US7423903B2 Floadia: LEE Flash ZT Zero-Added-Mask MTP Floadia and Maxchip: Public Floating-Gate LEE Flash ZT MTP Integration US5844271A"
  },
  {
    "title_zh": "NOR：從堆疊閘極到分離閘極的程式碼儲存",
    "title_en": "NOR: Stacked-Gate and Split-Gate Code Storage",
    "url": "NVM技術全景.html#topic-nor",
    "tags": "NOR describes array connectivity and access organization, not a unique storage material. This topic uses floating-gate NOR: charge changes cell threshold voltage, and the selected cell is sensed through the bitline and source path. Both stacked-gate and split-gate cells can serve NOR arrays, but their selection channels, programming efficiency, and erase control differ. NOR is commonly used for code storage requiring direct, predictable reads. Stacked-gate cells place storage and selection responsibilities under the cell's gate control; split-gate cells add a selection channel that helps block unselected leakage from overerased cells. Execute-in-place support also depends on the interface, controller, and cache timing and cannot be guaranteed by the NOR name alone. Microchip's SST39SF020A was listed as in production when reviewed, with a public summary specifying 2 Mb and a 4.5–5.5 V parallel flash interface. SST's SuperFlash technology brochure separately provides an identified technical lineage for split gates, source-side injection, and inter-gate FN erase, allowing commercial implementation evidence to be compared with the mechanism lesson. NOR 描述陣列的連接與存取組織，並不限定唯一儲存材料。本題以浮動閘極 NOR 說明：電荷改變單元臨界電壓，受選單元經位元線與源極路徑被感測。堆疊閘極與分離閘極都可服務 NOR，但選擇通道、寫入效率及抹除控制不同。 NOR 常用於需要直接、可預測讀取的程式碼儲存。堆疊閘極把儲存與選擇責任集中在單元的閘極控制；分離閘極加入選擇通道，有助阻斷過度抹除單元的非受選漏電。是否支援原地執行，還取決於介面、控制器及快取時序，不能從 NOR 名稱單獨保證。 Worldwide Semiconductor Manufacturing / TSMC: Split-Gate Flash Patent US6232180B1 SST / Microchip: SuperFlash Technology Brochure DS00001425F Microchip: SST39SF020A Parallel Flash Product Page Kioxia: NAND Flash Memory Fundamentals US6232180B1"
  },
  {
    "title_zh": "SONOS 與 NROM：把電荷留在絕緣捕捉層",
    "title_en": "SONOS and NROM: Charge Trapping in Insulating Layers",
    "url": "NVM技術全景.html#topic-sonos",
    "tags": "Electrons remain in trapping centers within insulating materials such as silicon nitride, changing the potential seen by the channel and its threshold voltage. The trapping layer is not a conductive floating gate, and charge can have a spatial distribution. Channel-wide SONOS program/erase examples and localized NROM charge-trapping examples therefore require different operating and sensing explanations; simply recoloring a floating gate is not sufficient. SONOS/MONOS describe material stacks or gate materials, while NROM refers to an implementation lineage that uses localized trapping and read direction. They are not directly interchangeable product names. Infineon's SONOS has production platforms, so the entire charge-trap family must not be labeled emerging. Its FN program/erase mechanism and reliability figures also must not be transferred to every NROM implementation. Infineon publicly lists SONOS eFlash production at 130, 65, 55, 40, and 28 nm and explicitly describes a 2T cell with FN program/erase. Its MCU shipments and licensable macro information support classification as an established platform. Localized-charge NROM is treated separately here through Saifun's original patent, with its own evidence boundary. 電子停留在氮化矽等絕緣材料的捕捉中心，改變通道所見電位與臨界電壓。捕捉層不是導電浮動閘極，電荷可具有位置分布；SONOS 全域寫抹例與 NROM 局部捕捉例因此需要不同的操作與讀取解說，不能只把浮動閘極改塗另一種顏色。 SONOS／MONOS 是材料堆疊或閘極材料的描述，NROM 代表利用局部捕捉與讀取方向的實作脈絡；兩者並非可直接互換的商品名稱。英飛凌 SONOS 已有量產平台，所以不能把整個捕捉型家族標成新興；同時也不能把它的 FN 寫抹與可靠度套到所有 NROM。 NCR: SONOS Blocking-Oxide Patent WO1981000790A1 Saifun: Asymmetric Charge-Trapping Patent US5768192A Infineon: SONOS Embedded Flash IP Solutions Saifun: Self-Aligned NROM Programming and Erasure Areas WO1981000790A1 US5768192A"
  },
  {
    "title_zh": "NAND：從平面串列到垂直堆疊與多階儲存",
    "title_en": "NAND: Planar Strings, Vertical Stacks, and Multilevel Storage",
    "url": "NVM技術全景.html#topic-nand",
    "tags": "NAND data can still be retained by charge in a floating gate or dielectric trapping layer that changes threshold voltage. NAND itself describes an array organization with multiple cells connected in series. Storing N bits per cell requires 2 to the Nth power distinguishable states, such as eight for TLC and sixteen for QLC. More bits do not provide additional windows of unchanged width for free. Series connection increases density by sharing contact overhead across cells, but reading one cell requires the other cells in its string to provide a conduction path. Planar feature shrink, additional 3D layers, and more bits per cell are distinct density axes, each with charge-window, process, and reliability costs. Page programming and block erase also make the controller an important part of usable storage. Kioxia's fundamentals explanation records commercial planar 15 nm technology and BiCS FLASH generations: 48 layers in 2015, 96 layers in 2018, 112 layers in 2020, and 162 layers in 2022. This establishes 3D NAND as a mature commercial family and supports a historical comparison of planar scaling and vertical stacking. NAND 的資料仍可由浮動閘極或介電捕捉層中的電荷改變臨界電壓來保存；NAND 本身指多顆單元串接的陣列組織。每單元存 N 個位元就需區分 2 的 N 次方個狀態，例如 TLC 的八個及 QLC 的十六個；更多位元不是增加同樣寬度的免費窗口。 串接讓多顆單元分攤接點以提升密度，代價是讀取一顆時必須讓同串其他單元提供通路。平面縮小尺寸、3D 增加層數與多階增加每單元位元數是不同密度軸，各有電荷窗口、製程及可靠度代價。頁面寫入與區塊抹除又使控制器成為可用儲存的重要部分。 Toshiba: Columnar-Semiconductor Vertical NAND Patent US7696559B2 Kioxia: NAND Flash Memory Fundamentals Kioxia: Increasing Flash Capacity with Multilevel Cells Kioxia: Data Retention in the Managed Flash Endurance and Reliability Series Kioxia: NAND Error-Correction Code Technical Brief Kioxia: Improving Memory-Hole Process Productivity with a New Etch Gas Y. Luo et al.: Early Retention Loss and Process Variation in 3D NAND Y. Cai et al.: Read-Disturb Errors in MLC NAND Flash Kioxia: BiCS FLASH Principles and Commercial Generations US7696559B2"
  },
  {
    "title_zh": "Toggle MRAM：用磁場時序翻轉磁矩",
    "title_en": "Toggle MRAM: Magnetic-Field Sequencing",
    "url": "NVM技術全景.html#topic-toggle",
    "tags": "The bit is stored in the magnetization direction of the free magnetic layer. Parallel and antiparallel alignment relative to the reference layer produce different resistance levels in the magnetic tunnel junction. A magnetic energy barrier maintains the direction after power is removed. Toggle specifically denotes a write method that reverses data through the rotation of coupled magnetic moments; it is not a general name for all field-written MRAM. Toggle MRAM assigns data retention to the magnetic energy barrier and data modification to precisely sequenced magnetic fields. The controller first determines whether the existing and requested values differ, then toggles only when needed. It does not require the block-erase sequence of Flash, but it adds read, comparison, and toggle control. This complete sequence is essential to a valid comparison of write latency and energy. Everspin's 2025 annual filing explicitly states that Toggle products entered volume production in 2008 and that devices with capacities of 128kb–32Mb continue to ship. This is commercial evidence for a named product family, rather than maturity inferred from a patent or experimental device. 位元儲存在自由磁層的磁化方向；相對參考層平行或反平行，會讓磁性穿隧接面的電阻不同。磁能障壁使方向在斷電後仍可維持。Toggle 特別指一類利用耦合磁矩旋轉來翻轉資料的寫入方式，並不是所有磁場寫入 MRAM 的通稱。 Toggle MRAM 把「保持資料」與「改變資料」分別交給磁能障壁及精確磁場時序。控制器先判斷原值與新值是否不同，只有需要時才執行翻轉。它沒有 Flash 必備的區塊抹除流程，但多了讀取、比較及翻轉控制；理解這個流程才能正確比較寫入延遲與能量。 Everspin 2025 Product and Manufacturing Filing Motorola: Toggle Writing Patent US6545906B1 US6545906B1"
  },
  {
    "title_zh": "STT-MRAM：讓自旋電流穿過接面",
    "title_en": "STT-MRAM: Spin Current Through the Junction",
    "url": "NVM技術全景.html#topic-stt",
    "tags": "The stored quantity remains the orientation of the free magnetic layer relative to the reference layer, and reading relies on the resistance difference of the magnetic tunnel junction. The principal difference from Toggle is writing: current passing through the magnetic stack carries spin angular momentum and exerts torque on the free layer, changing its magnetic state. Nonvolatility comes from the magnetic energy barrier, not from keeping current inside the device. STT concentrates write current in the selected junction and improves on the scaling limitations of magnetic-field write lines, making it an important route for commercial discrete and embedded MRAM. Increasing current can shorten switching time, but also raises access-transistor requirements and barrier stress. Reducing current can lengthen latency and worsen the error-rate tail. The best speed, lifetime, and density values from separate conditions cannot be combined into one product specification. Everspin has shipped STT products with DDR-derived interfaces and SPI-class products. In 2026, its 64Mb high-reliability xSPI product also has evidence of completed production qualification and ordering availability. Embedded implementations must be linked individually to a specific MCU or process document. 儲存量仍是自由磁層相對參考磁層的方向，讀取依賴磁性穿隧接面的電阻差。與 Toggle 的主要區別在寫入：電流經過磁性堆疊後攜帶自旋角動量，向自由層施加轉矩，使磁態改變。非揮發性由磁能障壁提供，不是把電流持續留在元件內。 STT 讓寫入電流集中在被選中的接面，改善磁場導線的縮放限制，因而成為商用獨立及嵌入式 MRAM 的重要路線。但加大電流可以縮短切換時間，同時增加存取電晶體需求與障壁應力；降低電流又會拉長延遲與錯誤率尾端，不能把速度、壽命與密度分別取最佳值拼成一個產品。 Everspin 2025 Product and Manufacturing Filing Everspin 64Mb High-Reliability xSPI Production Qualification Renesas RA8M2/RA8D2 MCUs with Embedded MRAM IBM: Spin-Torque Structure Patent US5695864A US5695864A"
  },
  {
    "title_zh": "SOT-MRAM：分開讀取與寫入路徑",
    "title_en": "SOT-MRAM: Separate Read and Write Paths",
    "url": "NVM技術全景.html#topic-sot",
    "tags": "SOT-MRAM also retains data in the magnetization direction of an MTJ free layer and senses it through magnetoresistance. Its distinguishing feature is that write angular momentum is generated primarily by a spin-orbit material beside or beneath the free layer and injected into it, rather than by sending the main write current through the tunnel barrier. The stored physical quantity is therefore similar to STT, while the write structure and array cost differ. SOT seeks short write pulses and lower barrier stress by separating the read and write paths, making it a focus of last-level-cache research. However, the third terminal and extra line consume area, and deterministic field-free switching, large-array yield, and process integration must also be established. Low-energy or high-cycle-count cell demonstrations satisfy only part of that validation. imec demonstrated extremely scaled devices and functional arrays in 2023–2024. TSMC's 2025 annual report also records field-free Type-C SOT-MRAM presented at IEDM 2025. These are concrete device and array research results, but they are insufficient to label a last-level cache as being in volume production. SOT-MRAM 同樣以 MTJ 的自由層磁化方向保存資料，並以磁阻感測。其新意在於寫入角動量主要由旁側或底部的自旋軌道材料產生，注入自由層，而不是讓主要寫入電流穿過穿隧障壁。因此物理儲存量與 STT 相近，寫入結構及陣列代價卻不同。 SOT 試圖用分離的讀寫路徑，同時追求短寫入脈衝與較低障壁應力，因而受到末級快取研究重視。但三端與額外導線會花掉面積，確定性無磁場切換、大陣列良率與製程整合也必須成立。單元的低能量或高循環展示，只完成了其中一部分驗證。 imec Extremely Scaled SOT-MRAM Device Demonstration imec: Functional SOT-MRAM Arrays and Cache Research Spin Memory Scalable SOT Device Process Patent TSMC 2025 Annual Report: Type-C SOT-MRAM Research US10930843B2"
  },
  {
    "title_zh": "VCM ReRAM：重排氧離子與導電通道",
    "title_en": "VCM ReRAM: Oxygen Redistribution and Conductive Paths",
    "url": "NVM技術全景.html#topic-vcm",
    "tags": "VCM stores data in the ionic distribution, local redox state, or interfacial barrier of an oxide, producing distinguishable resistance states. A typical filament model explains conduction and rupture through redistribution of oxygen ions/oxygen vacancies, but not every device has a single clearly defined filament. Materials, electrodes, and measurement evidence determine the mechanism; a hysteretic I–V curve alone is insufficient to identify VCM. VCM operation centers on controlling reversible local changes without driving the oxide into permanent breakdown. SET commonly lowers resistance, while RESET raises it. Some stacks require initial current-limited forming to activate a conductive path. Rebuilding the path may differ slightly on each cycle, making the relationship among forming, write verification, cycling distributions, and retention more important than one attractive typical I–V curve. Weebit/DB HiTek 130nm BCD RRAM has public evidence of completed technology qualification, and SkyWater S130 has a named 1T1R reliability test vehicle. These support the maturity of resistive-memory integration; a product name alone cannot reveal its complete VCM material cross section. VCM 以氧化物中的離子分布、局部氧化還原狀態或界面障壁儲存資料，表現為可區分的電阻狀態。典型通道模型用氧離子／氧空缺重分布解釋導通與斷裂，但並非所有元件都只有一根清晰細絲。材料、電極及量測證據才是機制判定依據，遲滯 I–V 本身不足以識別 VCM。 VCM 的操作重點是控制可逆的局部變化，避免把氧化物推入永久崩潰。SET 常使電阻降低，RESET 使電阻提高；部分堆疊需先以限流形成啟動通道。每次通道重建可能略有不同，因此形成、寫後驗證、循環分布與保存之間的關係，比一條漂亮的典型 I–V 曲線更重要。 Resistive Switching Mechanisms in Metal/Oxide/Metal Devices HP: Multilayer Oxide Switching Patent US8331131B2 Weebit/DB HiTek Technology Qualification and Product Adoption Weebit SkyWater S130 Reliability Validation US8331131B2"
  },
  {
    "title_zh": "ECM／CBRAM：長出並溶解金屬橋",
    "title_en": "ECM/CBRAM: Growing and Dissolving a Metal Bridge",
    "url": "NVM技術全景.html#topic-ecm",
    "tags": "ECM changes a conductive path through the motion and redox reactions of active-metal ions. An existing conductive bridge commonly produces a low-resistance state; dissolving a critical part of the bridge produces a high-resistance state. Both ECM and oxygen-vacancy VCM exhibit resistive switching, but their ion sources and path materials differ. CBRAM is a common commercial name for this conductive-bridge memory. Sharing the ReRAM label does not justify combining their physical models. During SET, the active metal oxidizes into ions, moves through the medium under an electric field, and is reduced to progressively establish a metal bridge. RESET dissolves part of that bridge. A thin bridge can reduce switching energy but may be destabilized by heat and surface energy. Fast formation and long-term retention must be checked under the same conditions rather than taken from separate best-case experiments. The CBRAM section of Adesto's 2019 annual filing explicitly records commercial product shipments. ECM/CBRAM therefore cannot uniformly be labeled as never commercialized. This evidence supports historical product maturity, but does not establish every subsequent node or availability of the original part numbers in 2026. ECM 用活性金屬離子的移動與氧化還原改變導電路徑；導電橋存在時常為低阻態，橋的關鍵位置溶解後成為高阻態。它與氧空缺 VCM 都表現為電阻切換，但離子來源及通道材料不同。CBRAM 是此類導電橋記憶體的常見商業名稱，不能只因同叫 ReRAM 就合併物理模型。 SET 時活性金屬氧化成離子，在電場下穿過介質並還原，逐步建立金屬橋；RESET 則使橋的某處溶解。細橋可降低切換能量，但也容易受熱與表面能影響而不穩定。設計必須把快速形成與長期保持放在同一條件下檢查，而非分別挑選最佳實驗。 Adesto 2019 CBRAM Commercial Shipment Filing Axon: Programmable Metallization Cell Patent US5761115A US5761115A"
  },
  {
    "title_zh": "PCM：用熱歷程控制晶相",
    "title_en": "PCM: Controlling Phase with Thermal History",
    "url": "NVM技術全景.html#topic-pcm",
    "tags": "PCM stores data in the fraction and geometry of crystalline and amorphous phase-change material. In a typical electronic device, the crystalline state has lower resistance and the amorphous state higher resistance; material kinetics retain the state after power removal. The actual state is more than an abstract resistance value. It includes the location and size of the phase-change region, degree of crystallization, and evolution over time, which jointly determine reading and lifetime. RESET locally melts material with a short, high-peak pulse and rapidly cools it into an amorphous state. SET uses an appropriate thermal history to crystallize the material. Reducing phase-change volume can lower energy, but retention, cycling failure, and thermal crosstalk must still be considered. PCM appears in production MCUs and is also researched for storage-class memory and analog weights. Different uses do not change its phase-based storage mechanism. On 2026-09-10, ST's SR6P6C8 product page explicitly lists production status, includes PCM in the product description, and provides specific ordering codes. This is a concrete commercial example of embedded PCM, avoiding judgments about the entire technology family based only on one discontinued storage-class product. PCM 把資料儲存在相變材料的晶態／非晶態比例與幾何形狀。典型電子式元件中，晶態較低阻、非晶態較高阻；斷電後依材料動力學保存狀態。真正的狀態不只是一個抽象電阻值，還包含相變區的位置、大小、結晶程度與時間演變，這些共同決定讀取與壽命。 RESET 用高峰值短脈衝使局部熔融，再快速冷卻成非晶；SET 則用合適熱歷程讓材料結晶。降低相變體積可減少能量，卻仍需兼顧保持、循環失效及熱串擾。PCM 可以出現在量產 MCU，也能被研究為儲存級記憶體或類比權重；用途不同不會改變其晶相儲存機制。 ST Stellar SR6P6C8 MCU with Phase-Change Memory Multilevel Phase-Change Memory Programming Patent IBM: Temporal Resistance Evolution in Projected PCM IBM Research on PCM Cycling Endurance and Atomic Migration IBM Low-Drift Projected PCM Devices US5912839A"
  },
  {
    "title_zh": "電容式 FeRAM：感測極化翻轉的電荷",
    "title_en": "Capacitor FeRAM: Sensing Polarization-Switching Charge",
    "url": "NVM技術全景.html#topic-feram",
    "tags": "The bit is represented by the polarization direction retained in a ferroelectric material after the external electric field is removed. Unlike DRAM, which relies on temporarily stored free charge, FeRAM is based on switchable remanent polarization. Reading uses the different charge responses when polarization switches and when it does not. Distinguishing the material's retention mechanism from the circuit's sensing method explains why nonvolatile memory may still require restoration after a read. Writing sets polarization through the electric-field direction. Reading applies an excitation and identifies the original value from the charge difference between switching and non-switching responses. If reading changes polarization, the circuit must restore the original data. Commercial FeRAM can conceal this sequence behind its interface so that the user sees an ordinary read command, but internal restoration, power-failure conditions, and timing remain part of reliability. Infineon EXCELON F-RAM is a named commercial family with a datasheet for the 16Mb CY15B116QI/CY15V116QI. The document specifies the interface, operating temperature, and retention conditions at different temperatures. It supports discussion of conditional product performance without extrapolating from a single material paper. 位元由鐵電材料在移除外電場後仍保留的極化方向表示。與 DRAM 依賴暫存自由電荷不同，FeRAM 的核心是可切換剩餘極化；讀取則利用極化翻轉與未翻轉時不同的電荷響應。必須分清材料的保持機制與電路的感測方法，才能理解為何非揮發記憶體仍可能需要讀後恢復。 寫入以電場方向設定極化；讀取施加激勵後，利用是否翻轉產生的電荷差辨識原值。若讀取改變了極化，電路必須恢復原資料。商用 FeRAM 可把此流程包在介面內，讓使用者看到一般讀取命令，但內部的恢復、掉電條件與時序仍是可靠性的一部分。 Infineon 16Mb EXCELON F-RAM Datasheet Ramtron: Self-Restoring Ferroelectric Memory Patent US4873664A US4873664A"
  },
  {
    "title_zh": "FeFET：把極化轉成臨界電壓差",
    "title_en": "FeFET: Translating Polarization into Threshold Voltage",
    "url": "NVM技術全景.html#topic-fefet",
    "tags": "FeFET uses ferroelectric polarization in the gate stack to change channel electrostatics, giving the transistor distinguishable high and low threshold voltages. Reading selects a gate bias between those thresholds and senses channel current. Charge trapping and detrapping also affect the actual memory window, so not every threshold-voltage change can be attributed solely to polarization. FeFET combines ferroelectric retention with transistor current gain, providing research opportunities for nondestructive reading and density scaling. The challenge is that write voltage is divided across both the ferroelectric and interfacial layers, while polarization switching may also generate or fill traps. Polarization stability, memory window, and endurance are not three independently optimizable numbers. The KIOXIA study associated with IEDM 2023 and reviewed here explicitly demonstrates control of trapped charge and polarization stability through interface engineering. An original FeFET PUF paper provides additional evidence. These support concrete device and circuit research, but are insufficient to identify a commercial production part using this stack. FeFET 利用閘極堆疊的鐵電極化改變通道靜電位勢，使電晶體具有可區分的高、低臨界電壓。讀取在兩個臨界電壓之間選一個閘極偏壓，感測通道電流。實際記憶視窗也會受到電荷捕獲與釋放影響，所以不能把所有臨界電壓變化都單獨歸因於極化。 FeFET 把鐵電的保持能力與電晶體電流增益結合，提供非破壞式讀取及密度縮放的研究空間。困難在於寫入電壓要同時跨過鐵電層與介面層，切換極化時也可能生成或充填陷阱。極化穩定、記憶視窗與耐久不是各自獨立最佳化的三項數字。 KIOXIA: FeFET Trapping and Polarization Stability Original Research on FeFET Cycle Variation and Charge-Domain PUFs FMC Industry News and Ferroelectric Memory Classification Layered Doping of HfO₂ Ferroelectric Films Patent FeFET Gate Stack and Device Integration Patent US10153155B2 US11502083B2"
  },
  {
    "title_zh": "FTJ：用極化改變穿隧障壁",
    "title_en": "FTJ: Modulating the Tunnel Barrier with Polarization",
    "url": "NVM技術全景.html#topic-ftj",
    "tags": "FTJ controls tunneling current through the polarization direction of a thin ferroelectric barrier. The two directions produce different effective barrier profiles and resistance levels, commonly described through tunnel electroresistance, or TER. FTJ and FeFET both use polarization, but FTJ does not rely on threshold-voltage amplification in a semiconductor channel. Read current, barrier thickness, electrode screening, and leakage therefore become central tradeoffs. FTJ reverses polarization with a larger pulse, then senses tunneling current at a smaller bias, pursuing two-terminal nondestructive storage and interconnect-layer integration. The barrier must be thin enough to provide readable current while retaining stable ferroelectricity and suppressing leakage. An attractive resistance ratio does not establish sufficient absolute read current, much less a reliable selection window for a large array. The 2024 original FTJ paper and TSMC FTJ structure patent publication reviewed here support concrete thin-film and reliability research. A datasheet and supply evidence identifying a commercial production part using this structure have not been obtained, so the research-demonstration label is retained. FTJ 以薄鐵電障壁的極化方向控制穿隧電流，兩種方向對應不同的有效障壁形狀及電阻。此穿隧電阻差常以 TER 描述。它與 FeFET 都利用極化，但沒有依靠半導體通道的臨界電壓放大，因此讀取電流、障壁厚度、電極屏蔽與漏電的取捨成為核心。 FTJ 用較大的脈衝反轉極化，再以較小偏壓感測穿隧電流，追求兩端非破壞式儲存及互連層整合。挑戰是障壁要夠薄才能讀到電流，卻又要保有穩定鐵電性並抑制漏電。漂亮的電阻比不代表足夠的絕對讀取電流，更不代表大陣列已具備可靠的選址窗口。 Original Research: Atomic-Scale BSO Ferroelectric Tunnel Junctions TSMC FTJ Structure and Low-Temperature Formation Application US20240057343A1"
  },
  {
    "title_zh": "從一個位元到完整陣列：選擇、感測與寫入驗證",
    "title_en": "From One Bit to a Complete Array: Selection, Sensing, and Program Verify",
    "url": "NVM技術全景.html#system-array",
    "tags": "Switching a device twice establishes only that it has usable storage states. A practical memory must also select its target from a large population of cells, avoid disturbing its neighbors, and read data correctly across temperature, aging, and process variation. Selectors, wires, and peripheral circuits therefore determine how much of the cell-level advantage survives."
  },
  {
    "title_zh": "SCM 與持久性記憶體：從媒體走到系統",
    "title_en": "SCM and Persistent Memory: From Media to Systems",
    "url": "NVM技術全景.html#system-scm",
    "tags": "Storage-class memory (SCM) addresses the gap in requirements between DRAM and NAND storage. It is not another bitcell type, and adopting CXL does not automatically establish an SCM implementation. Understanding SCM requires distinguishing storage physics, attachment, access granularity, and which data can actually be recovered after failure."
  },
  {
    "title_zh": "Everspin Toggle MRAM · Toggle MRAM",
    "title_en": "Everspin Toggle MRAM · Toggle MRAM",
    "url": "NVM技術全景.html#company-everspin-toggle",
    "tags": "Everspin Toggle MRAM Toggle MRAM The current PERSYST catalog lists Toggle production parts. MR3A16ACYS35 is marked MP and specifies 8Mb, asynchronous x16, 35ns, 3.3V and −40 to 85°C. Everspin Toggle MRAM 現行PERSYST目錄保留Toggle量產料號，例如MR3A16ACYS35為8Mb、x16非同步介面、35ns、3.3V、−40～85°C，標示MP。 The current PERSYST catalog lists Toggle production parts. MR3A16ACYS35 is marked MP and specifies 8Mb, asynchronous x16, 35ns, 3.3V and −40 to 85°C. 現行PERSYST目錄保留Toggle量產料號，例如MR3A16ACYS35為8Mb、x16非同步介面、35ns、3.3V、−40～85°C，標示MP。"
  },
  {
    "title_zh": "Everspin 1Gb STT-MRAM · STT-MRAM / DDR4-derived",
    "title_en": "Everspin 1Gb STT-MRAM · STT-MRAM / DDR4-derived",
    "url": "NVM技術全景.html#company-everspin-1gb-ddr",
    "tags": "Everspin 1Gb STT-MRAM STT-MRAM / DDR4-derived The 2025 Form 10-K confirms continuing 1Gb STT-MRAM shipments. The technology page identifies a DDR4-like persistent-DRAM product for enterprise storage. Everspin 1Gb STT-MRAM 2025年度10-K確認1Gb STT-MRAM持續出貨，採DDR衍生介面；官方技術頁將1Gb定位為類DDR4介面的持續性DRAM。 The 2025 Form 10-K confirms continuing 1Gb STT-MRAM shipments. The technology page identifies a DDR4-like persistent-DRAM product for enterprise storage. 2025年度10-K確認1Gb STT-MRAM持續出貨，採DDR衍生介面；官方技術頁將1Gb定位為類DDR4介面的持續性DRAM。"
  },
  {
    "title_zh": "Everspin EMxxLX xSPI · STT-MRAM / xSPI",
    "title_en": "Everspin EMxxLX xSPI · STT-MRAM / xSPI",
    "url": "NVM技術全景.html#company-everspin-xspi",
    "tags": "Everspin EMxxLX xSPI STT-MRAM / xSPI The March 5, 2026 investor release confirms HR 64Mb xSPI STT-MRAM completed AEC-Q100 Grade 1 production qualification and is orderable with distributor inventory. HR 128Mb qualification was expected in May and 256Mb in July, with 256Mb volume availability expected in the second half of 2026. Everspin EMxxLX xSPI 2026-03-05官方投資人公告：HR 64Mb xSPI STT-MRAM完成AEC-Q100 Grade 1量產認證，可訂購且通路有庫存；HR 128Mb預定5月、256Mb預定7月完成認證，256Mb預期下半年供量。 The March 5, 2026 investor release confirms HR 64Mb xSPI STT-MRAM completed AEC-Q100 Grade 1 production qualification and is orderable with distributor inventory. HR 128Mb qualification was expected in May and 256Mb in July, with 256Mb volume availability expected in the second half of 2026. 2026-03-05官方投資人公告：HR 64Mb xSPI STT-MRAM完成AEC-Q100 Grade 1量產認證，可訂購且通路有庫存；HR 128Mb預定5月、256Mb預定7月完成認證，256Mb預期下半年供量。"
  },
  {
    "title_zh": "Avalanche Technology / UMC · pMTJ STT-MRAM",
    "title_en": "Avalanche Technology / UMC · pMTJ STT-MRAM",
    "url": "NVM技術全景.html#company-avalanche-umc22",
    "tags": "Avalanche Technology / UMC pMTJ STT-MRAM The September 13, 2022 release announces immediate availability of Gen 3 P-SRAM on UMC 22nm. The cited parallel x32 product specifies over 10^14 writes and 1,000-year retention at 85°C. Avalanche Technology / UMC 2022-09-13宣布UMC 22nm第三代P-SRAM立即供應，Parallel x32系列所述規格為逾10^14次耐寫、85°C保存1,000年及−40～125°C操作。 The September 13, 2022 release announces immediate availability of Gen 3 P-SRAM on UMC 22nm. The cited parallel x32 product specifies over 10^14 writes and 1,000-year retention at 85°C. 2022-09-13宣布UMC 22nm第三代P-SRAM立即供應，Parallel x32系列所述規格為逾10^14次耐寫、85°C保存1,000年及−40～125°C操作。"
  },
  {
    "title_zh": "Avalanche Technology · STT-MRAM",
    "title_en": "Avalanche Technology · STT-MRAM",
    "url": "NVM技術全景.html#company-avalanche-scaling2026",
    "tags": "Avalanche Technology STT-MRAM The 2026 web announcement reports completion of a first-phase MTJ scaling milestone for future higher-density space-grade MRAM. Avalanche Technology 2026年網頁公告完成政府合約第一階段MTJ縮放，以支援未來更高密度太空級MRAM。 The 2026 web announcement reports completion of a first-phase MTJ scaling milestone for future higher-density space-grade MRAM. 2026年網頁公告完成政府合約第一階段MTJ縮放，以支援未來更高密度太空級MRAM。"
  },
  {
    "title_zh": "Samsung Foundry · STT-MRAM / eMRAM",
    "title_en": "Samsung Foundry · STT-MRAM / eMRAM",
    "url": "NVM技術全景.html#company-samsung-emram",
    "tags": "Samsung Foundry STT-MRAM / eMRAM The current specialty-process page confirms 28nm FD-SOI eMRAM mass production since 2019 and expansion to 14LPU and 8LPU, with 5nm still planned. Samsung Foundry 官方現行特殊製程頁確認2019年28nm FD-SOI eMRAM量產，並表示MTJ模組已擴展至14LPU及8LPU，5nm仍列計畫。 The current specialty-process page confirms 28nm FD-SOI eMRAM mass production since 2019 and expansion to 14LPU and 8LPU, with 5nm still planned. 官方現行特殊製程頁確認2019年28nm FD-SOI eMRAM量產，並表示MTJ模組已擴展至14LPU及8LPU，5nm仍列計畫。"
  },
  {
    "title_zh": "Intel · STT-MRAM",
    "title_en": "Intel · STT-MRAM",
    "url": "NVM技術全景.html#company-intel-22ffl-research",
    "tags": "Intel STT-MRAM The official IEDM 2018 program lists Intel-authored work on MRAM embedded in 22FFL FinFET, establishing primary evidence of process-integration research. Intel IEDM 2018官方議程列Intel作者22FFL FinFET嵌入式MRAM論文，提供整合技術的一手研究證據。 The official IEDM 2018 program lists Intel-authored work on MRAM embedded in 22FFL FinFET, establishing primary evidence of process-integration research. IEDM 2018官方議程列Intel作者22FFL FinFET嵌入式MRAM論文，提供整合技術的一手研究證據。"
  },
  {
    "title_zh": "TSMC · eMRAM / STT route",
    "title_en": "TSMC · eMRAM / STT route",
    "url": "NVM技術全景.html#company-tsmc-16mram2025",
    "tags": "TSMC eMRAM / STT route The 2025 annual report confirms qualification and customer availability of second-generation 16nm automotive Grade 1 MRAM. 12nm automotive and 5nm high-speed MRAM remain in development. TSMC 2025年報確認16nm第二代MRAM通過車用Grade 1並提供客戶；12nm車用及5nm高速MRAM仍在開發。 The 2025 annual report confirms qualification and customer availability of second-generation 16nm automotive Grade 1 MRAM. 12nm automotive and 5nm high-speed MRAM remain in development. 2025年報確認16nm第二代MRAM通過車用Grade 1並提供客戶；12nm車用及5nm高速MRAM仍在開發。"
  },
  {
    "title_zh": "TSMC SOT-MRAM · SOT-MRAM",
    "title_en": "TSMC SOT-MRAM · SOT-MRAM",
    "url": "NVM技術全景.html#company-tsmc-sot2025",
    "tags": "TSMC SOT-MRAM SOT-MRAM The 2025 annual report describes an IEDM 2025 Type-C SOT-MRAM demonstration using a circular MTJ with built-in magnetic anisotropy for field-free operation. TSMC SOT-MRAM 2025年報記載IEDM 2025展示Type-C SOT-MRAM，以圓形MTJ與內建磁異向性達成無外加磁場操作。 The 2025 annual report describes an IEDM 2025 Type-C SOT-MRAM demonstration using a circular MTJ with built-in magnetic anisotropy for field-free operation. 2025年報記載IEDM 2025展示Type-C SOT-MRAM，以圓形MTJ與內建磁異向性達成無外加磁場操作。"
  },
  {
    "title_zh": "GlobalFoundries · STT-MRAM / 22FDX",
    "title_en": "GlobalFoundries · STT-MRAM / 22FDX",
    "url": "NVM技術全景.html#company-gf-22fdx",
    "tags": "GlobalFoundries STT-MRAM / 22FDX The February 27, 2020 announcement confirms production entry of 22FDX eMRAM and 4–48Mb silicon-validated macros, with 100k endurance and 10-year retention across the stated temperature range. GlobalFoundries 2020-02-27官方確認22FDX eMRAM進入生產，供應4～48Mb矽驗證巨集；公告展示100k耐寫、10年保存與−40～125°C範圍。 The February 27, 2020 announcement confirms production entry of 22FDX eMRAM and 4–48Mb silicon-validated macros, with 100k endurance and 10-year retention across the stated temperature range. 2020-02-27官方確認22FDX eMRAM進入生產，供應4～48Mb矽驗證巨集；公告展示100k耐寫、10年保存與−40～125°C範圍。"
  },
  {
    "title_zh": "Renesas RA8M2 / RA8D2 · Embedded MRAM",
    "title_en": "Renesas RA8M2 / RA8D2 · Embedded MRAM",
    "url": "NVM技術全景.html#company-renesas-ra8-2025",
    "tags": "Renesas RA8M2 / RA8D2 Embedded MRAM The October 22, 2025 release announces available RA8M2 and RA8D2 MCUs with embedded MRAM, a 1GHz Cortex-M85 and a 250MHz Cortex-M33. Renesas RA8M2 / RA8D2 2025-10-22推出RA8M2與RA8D2，內建MRAM、1GHz Cortex-M85與250MHz Cortex-M33；官方可供貨，不應只停留在2024年試驗巨集紀錄。 The October 22, 2025 release announces available RA8M2 and RA8D2 MCUs with embedded MRAM, a 1GHz Cortex-M85 and a 250MHz Cortex-M33. 2025-10-22推出RA8M2與RA8D2，內建MRAM、1GHz Cortex-M85與250MHz Cortex-M33；官方可供貨，不應只停留在2024年試驗巨集紀錄。"
  },
  {
    "title_zh": "NXP S32K5 · Embedded MRAM",
    "title_en": "NXP S32K5 · Embedded MRAM",
    "url": "NVM技術全景.html#company-nxp-s32k5",
    "tags": "NXP S32K5 Embedded MRAM NXP announced the 16nm FinFET S32K5 with embedded MRAM on March 11, 2025. Its October 30, 2025 product brief still labels the family preproduction. NXP S32K5 2025-03-11宣布16nm FinFET S32K5內建MRAM；2025-10-30官方產品摘要仍標示量產前產品。 NXP announced the 16nm FinFET S32K5 with embedded MRAM on March 11, 2025. Its October 30, 2025 product brief still labels the family preproduction. 2025-03-11宣布16nm FinFET S32K5內建MRAM；2025-10-30官方產品摘要仍標示量產前產品。"
  },
  {
    "title_zh": "NETSOL · STT-MRAM",
    "title_en": "NETSOL · STT-MRAM",
    "url": "NVM技術全景.html#company-netsol-stt",
    "tags": "NETSOL STT-MRAM The March 2024 S3RxxxxR1M datasheet specifies 1–16Mbit STT-MRAM, asynchronous x8/x16 interfaces and an industrial −40 to 85°C range; the website also lists serial products. NETSOL 2024年3月S3RxxxxR1M資料表列1～16Mbit STT-MRAM、x8／x16非同步平行介面及−40～85°C工業溫度；官網另列串列系列。 The March 2024 S3RxxxxR1M datasheet specifies 1–16Mbit STT-MRAM, asynchronous x8/x16 interfaces and an industrial −40 to 85°C range; the website also lists serial products. 2024年3月S3RxxxxR1M資料表列1～16Mbit STT-MRAM、x8／x16非同步平行介面及−40～85°C工業溫度；官網另列串列系列。"
  },
  {
    "title_zh": "TDK / Headway · STT-MRAM",
    "title_en": "TDK / Headway · STT-MRAM",
    "url": "NVM技術全景.html#company-tdk-headway",
    "tags": "TDK / Headway STT-MRAM TDK's September 1, 2025 investor-day presentation includes STT-MRAM among its spintronics technologies; Headway authors also have public embedded-STT-MRAM research presentations. TDK / Headway TDK 2025-09-01投資人日資料將STT-MRAM列為累積自旋電子技術；Headway作者亦有公開STT-MRAM嵌入式研究簡報。 TDK's September 1, 2025 investor-day presentation includes STT-MRAM among its spintronics technologies; Headway authors also have public embedded-STT-MRAM research presentations. TDK 2025-09-01投資人日資料將STT-MRAM列為累積自旋電子技術；Headway作者亦有公開STT-MRAM嵌入式研究簡報。"
  },
  {
    "title_zh": "Numem · Foundry-based STT-MRAM",
    "title_en": "Numem · Foundry-based STT-MRAM",
    "url": "NVM技術全景.html#company-numem-aime",
    "tags": "Numem Foundry-based STT-MRAM Numem describes foundry-based STT-MRAM IP and chips/chiplets enhanced by AIME. Its June 10, 2025 announcement claims production readiness. Numem 官方網站將方案定位為以代工STT-MRAM單元為基礎的IP及晶粒／小晶片，搭配AIME；2025-06-10新聞稱AI記憶體引擎已可供量產。 Numem describes foundry-based STT-MRAM IP and chips/chiplets enhanced by AIME. Its June 10, 2025 announcement claims production readiness. 官方網站將方案定位為以代工STT-MRAM單元為基礎的IP及晶粒／小晶片，搭配AIME；2025-06-10新聞稱AI記憶體引擎已可供量產。"
  },
  {
    "title_zh": "imec · SOT-MRAM",
    "title_en": "imec · SOT-MRAM",
    "url": "NVM技術全景.html#company-imec-sot",
    "tags": "imec SOT-MRAM On December 13, 2023 imec reported roughly 50nm critical-dimension SOT devices on 300mm wafers, below 100fJ/bit switching energy and endurance above 10^15 cycles. imec 2023-12-13公開300mm晶圓上約50nm關鍵尺寸SOT元件，切換能量低於100fJ/bit、耐受超過10^15次循環，供快取應用研發。 On December 13, 2023 imec reported roughly 50nm critical-dimension SOT devices on 300mm wafers, below 100fJ/bit switching energy and endurance above 10^15 cycles. 2023-12-13公開300mm晶圓上約50nm關鍵尺寸SOT元件，切換能量低於100fJ/bit、耐受超過10^15次循環，供快取應用研發。"
  },
  {
    "title_zh": "IBM Research · STT-MRAM",
    "title_en": "IBM Research · STT-MRAM",
    "url": "NVM技術全景.html#company-ibm-research",
    "tags": "IBM Research STT-MRAM IBM contributes traceable device physics and CMOS integration results. MTJ size, process node and write-error rate from different studies must not be combined into an imaginary best-specification product. IBM Research STT-MRAM IBM 的價值在於可追溯的元件物理與 CMOS 整合成果。不同年份的 MTJ 尺寸、製程節點與寫入錯誤率，不能拼成一顆不存在的最佳規格產品。"
  },
  {
    "title_zh": "工研院 ITRI · SOT-MRAM",
    "title_en": "ITRI · SOT-MRAM",
    "url": "NVM技術全景.html#company-itri-research",
    "tags": "ITRI SOT-MRAM ITRI evidence spans distinct collaborations and versions: SOT with TSMC, cryogenic STT with NYCU, a joint β-W array, an 8-inch prototyping service and RRAM technology transfer. ITRI SOT-MRAM 工研院應以具名合作與版本呈現：台積電合作的 SOT、陽明交大合作的低溫 STT、跨機構 β-W 陣列，以及 8 吋試作與 RRAM 技轉，分屬不同成果。"
  },
  {
    "title_zh": "Weebit Nano · ReRAM",
    "title_en": "Weebit Nano · ReRAM",
    "url": "NVM技術全景.html#company-rram-weebit-2026",
    "tags": "Weebit Nano ReRAM Three customer designs had taped out by July 2026, with a prototype running software. Weebit Nano 2026 年 7 月公告三個客戶設計已投片，已有原型執行軟體。 Three customer designs had taped out by July 2026, with a prototype running software. 2026 年 7 月公告三個客戶設計已投片，已有原型執行軟體。"
  },
  {
    "title_zh": "onsemi · ReRAM",
    "title_en": "onsemi · ReRAM",
    "url": "NVM技術全景.html#company-rram-onsemi-2026",
    "tags": "onsemi ReRAM Weebit reported onsemi ReRAM technology transfer progressing to schedule. onsemi Weebit 公告對 onsemi 的 ReRAM 技轉按計畫進行。 Weebit reported onsemi ReRAM technology transfer progressing to schedule. Weebit 公告對 onsemi 的 ReRAM 技轉按計畫進行。"
  },
  {
    "title_zh": "Texas Instruments · ReRAM",
    "title_en": "Texas Instruments · ReRAM",
    "url": "NVM技術全景.html#company-rram-ti-2026",
    "tags": "Texas Instruments ReRAM Weebit reported TI ReRAM technology transfer progressing to schedule. Texas Instruments Weebit 公告對 TI 的 ReRAM 技轉按計畫進行。 Weebit reported TI ReRAM technology transfer progressing to schedule. Weebit 公告對 TI 的 ReRAM 技轉按計畫進行。"
  },
  {
    "title_zh": "SkyWater / Weebit Nano · ReRAM",
    "title_en": "SkyWater / Weebit Nano · ReRAM",
    "url": "NVM技術全景.html#company-rram-skywater-s130",
    "tags": "SkyWater / Weebit Nano ReRAM The official IP page lists qualified S130 130 nm CMOS ReRAM, available for integration, with two added masks in BEOL. SkyWater／Weebit Nano 官方 IP 頁列 S130 130 nm CMOS 已依 JEDEC 與 AEC-Q100 驗證、可供整合；BEOL 增加 2 層光罩。 The official IP page lists qualified S130 130 nm CMOS ReRAM, available for integration, with two added masks in BEOL. 官方 IP 頁列 S130 130 nm CMOS 已依 JEDEC 與 AEC-Q100 驗證、可供整合；BEOL 增加 2 層光罩。"
  },
  {
    "title_zh": "DB HiTek / Weebit Nano · ReRAM",
    "title_en": "DB HiTek / Weebit Nano · ReRAM",
    "url": "NVM技術全景.html#company-rram-dbhitek-130",
    "tags": "DB HiTek / Weebit Nano ReRAM 130 nm BCD ReRAM IP is silicon-proven and qualified, adding two masks; listed specifications include 10K writes and over ten years retention at 125°C. DB HiTek／Weebit Nano 130 nm BCD 的 ReRAM IP 已矽驗證與資格驗證，使用 2 層加罩；官方列 10K 次耐寫、125°C 保存超過 10 年。 130 nm BCD ReRAM IP is silicon-proven and qualified, adding two masks; listed specifications include 10K writes and over ten years retention at 125°C. 130 nm BCD 的 ReRAM IP 已矽驗證與資格驗證，使用 2 層加罩；官方列 10K 次耐寫、125°C 保存超過 10 年。"
  },
  {
    "title_zh": "TSMC · ReRAM",
    "title_en": "TSMC · ReRAM",
    "url": "NVM技術全景.html#company-rram-tsmc-iot",
    "tags": "TSMC ReRAM The IoT NVM page lists 40RRAM and 22RRAM in production; 12RRAM entered consumer-grade risk production in 2024, with cells between BEOL metal layers. TSMC 官方 IoT NVM 頁列 40RRAM、22RRAM 已量產；12RRAM 於 2024 年進入消費級風險試產，記憶單元位於後段金屬層間。 The IoT NVM page lists 40RRAM and 22RRAM in production; 12RRAM entered consumer-grade risk production in 2024, with cells between BEOL metal layers. 官方 IoT NVM 頁列 40RRAM、22RRAM 已量產；12RRAM 於 2024 年進入消費級風險試產，記憶單元位於後段金屬層間。"
  },
  {
    "title_zh": "Infineon / TSMC · ReRAM",
    "title_en": "Infineon / TSMC · ReRAM",
    "url": "NVM技術全景.html#company-rram-infineon-tc4x",
    "tags": "Infineon / TSMC ReRAM The 2022 announcement describes preparing TSMC RRAM for next-generation AURIX TC4x, supporting bit-wise writes without prior erase. Infineon／TSMC 2022 年公告準備將台積電 RRAM 導入下一代 AURIX TC4x，支援位元寫入而不需先抹除。 The 2022 announcement describes preparing TSMC RRAM for next-generation AURIX TC4x, supporting bit-wise writes without prior erase. 2022 年公告準備將台積電 RRAM 導入下一代 AURIX TC4x，支援位元寫入而不需先抹除。"
  },
  {
    "title_zh": "GlobalFoundries / Renesas / Dialog · CBRAM",
    "title_en": "GlobalFoundries / Renesas / Dialog · CBRAM",
    "url": "NVM技術全景.html#company-cbram-gf-renesas",
    "tags": "GlobalFoundries / Renesas / Dialog CBRAM GF acquired production-proven CBRAM technology from Renesas in 2023, following a 2020 Dialog license; 22FDX qualification was underway. GlobalFoundries／Renesas／Dialog GF 於 2023 年向 Renesas 收購已具量產實績的 CBRAM 技術；GF 先於 2020 年向 Dialog 授權，2023 年公告 22FDX 正在驗證。 GF acquired production-proven CBRAM technology from Renesas in 2023, following a 2020 Dialog license; 22FDX qualification was underway. GF 於 2023 年向 Renesas 收購已具量產實績的 CBRAM 技術；GF 先於 2020 年向 Dialog 授權，2023 年公告 22FDX 正在驗證。"
  },
  {
    "title_zh": "Nuvoton · ReRAM",
    "title_en": "Nuvoton · ReRAM",
    "url": "NVM技術全景.html#company-rram-nuvoton-m2l31",
    "tags": "Nuvoton ReRAM The M2L31 family lists an Arm Cortex-M23, 64–512 KB ReRAM and 72 MHz operation; writes do not require a page erase. Nuvoton M2L31 產品頁列 Arm Cortex-M23、64–512 KB ReRAM 與 72 MHz；ReRAM 寫入前不需頁抹除。 The M2L31 family lists an Arm Cortex-M23, 64–512 KB ReRAM and 72 MHz operation; writes do not require a page erase. M2L31 產品頁列 Arm Cortex-M23、64–512 KB ReRAM 與 72 MHz；ReRAM 寫入前不需頁抹除。"
  },
  {
    "title_zh": "Panasonic / UMC · ReRAM",
    "title_en": "Panasonic / UMC · ReRAM",
    "url": "NVM技術全景.html#company-rram-panasonic-umc",
    "tags": "Panasonic / UMC ReRAM The 2017 agreement combined Panasonic ReRAM with UMC manufacturing to develop a 40 nm mass-production process. Panasonic／UMC 2017 年宣布共同開發 40 nm ReRAM 量產製程，將 Panasonic ReRAM 與 UMC 製造能力結合。 The 2017 agreement combined Panasonic ReRAM with UMC manufacturing to develop a 40 nm mass-production process. 2017 年宣布共同開發 40 nm ReRAM 量產製程，將 Panasonic ReRAM 與 UMC 製造能力結合。"
  },
  {
    "title_zh": "RAMXEED · ReRAM",
    "title_en": "RAMXEED · ReRAM",
    "url": "NVM技術全景.html#company-rram-ramxeed-product",
    "tags": "RAMXEED ReRAM The product list marks the MB85AS8MT 8 Mbit SPI ReRAM as mass-produced with one million cycles; the 12 Mbit part requires sales contact. RAMXEED 官方清單將 MB85AS8MT 8 Mbit SPI ReRAM 標示量產，列 100 萬次循環；12 Mbit 型號則要求洽詢業務。 The product list marks the MB85AS8MT 8 Mbit SPI ReRAM as mass-produced with one million cycles; the 12 Mbit part requires sales contact. 官方清單將 MB85AS8MT 8 Mbit SPI ReRAM 標示量產，列 100 萬次循環；12 Mbit 型號則要求洽詢業務。"
  },
  {
    "title_zh": "CrossBar · ReRAM",
    "title_en": "CrossBar · ReRAM",
    "url": "NVM技術全景.html#company-rram-crossbar-daric",
    "tags": "CrossBar ReRAM A 2026 company article describes the 22 nm Daric secure processor integrating ReRAM, computing and cryptography on one die. CrossBar 2026 年官方文章介紹採 ReRAM 的 22 nm Daric 安全處理器，將 NVM、運算與密碼功能整合於單晶片。 A 2026 company article describes the 22 nm Daric secure processor integrating ReRAM, computing and cryptography on one die. 2026 年官方文章介紹採 ReRAM 的 22 nm Daric 安全處理器，將 NVM、運算與密碼功能整合於單晶片。"
  },
  {
    "title_zh": "CEA-Leti / Weebit Nano · ReRAM",
    "title_en": "CEA-Leti / Weebit Nano · ReRAM",
    "url": "NVM技術全景.html#company-rram-cea-leti",
    "tags": "CEA-Leti / Weebit Nano ReRAM The announcement combines CEA-Leti spiking neural networks with Weebit SiOx ReRAM in a neuromorphic object-recognition demonstration. CEA-Leti／Weebit Nano 官方公告結合 CEA-Leti 脈衝神經網路與 Weebit SiOx ReRAM，展示物件辨識方向的神經形態運算。 The announcement combines CEA-Leti spiking neural networks with Weebit SiOx ReRAM in a neuromorphic object-recognition demonstration. 官方公告結合 CEA-Leti 脈衝神經網路與 Weebit SiOx ReRAM，展示物件辨識方向的神經形態運算。"
  },
  {
    "title_zh": "UMC 聯電 · 22nm RRAM",
    "title_en": "UMC · 22nm RRAM",
    "url": "NVM技術全景.html#company-umc-research",
    "tags": "UMC 22nm RRAM UMC evidence spans process availability, qualified RRAM IP, a SoC development platform and standalone MRAM products. These are distinct delivery levels. UMC 22nm RRAM UMC 的重點是製程與 IP 生態的可用性。22nm RRAM 的資格驗證、智原的 SoC 平台，以及 Avalanche 的獨立式 MRAM，代表不同交付層級。"
  },
  {
    "title_zh": "ITRI · 1S1R RRAM",
    "title_en": "ITRI · 1S1R RRAM",
    "url": "NVM技術全景.html#company-itri-1s1r",
    "tags": "ITRI 1S1R RRAM Cross-point RRAM and selector development with published electrical and geometry targets. ITRI 1S1R RRAM 交叉陣列 RRAM 與選擇器開發，列有電性與幾何條件。"
  },
  {
    "title_zh": "STMicroelectronics · PCM, not established MRAM offering",
    "title_en": "STMicroelectronics · PCM, not established MRAM offering",
    "url": "NVM技術全景.html#company-st-pcm-boundary",
    "tags": "STMicroelectronics PCM, not established MRAM offering The November 18, 2025 STM32V8 announcement explicitly identifies 18nm FD-SOI and embedded PCM, with Samsung Foundry manufacturing cooperation. STMicroelectronics 2025-11-18 STM32V8官方公告明確採18nm FD-SOI與嵌入式PCM，並與Samsung Foundry合作製造。 The November 18, 2025 STM32V8 announcement explicitly identifies 18nm FD-SOI and embedded PCM, with Samsung Foundry manufacturing cooperation. 2025-11-18 STM32V8官方公告明確採18nm FD-SOI與嵌入式PCM，並與Samsung Foundry合作製造。"
  },
  {
    "title_zh": "Micron · 3D XPoint",
    "title_en": "Micron · 3D XPoint",
    "url": "NVM技術全景.html#company-xpoint-micron-exit",
    "tags": "Micron 3D XPoint Micron announced an immediate end to 3D XPoint development in 2021 and redirected resources toward CXL memory products. Micron Micron 於 2021 年宣布立即停止 3D XPoint 開發，將資源轉向 CXL 記憶體產品。 Micron announced an immediate end to 3D XPoint development in 2021 and redirected resources toward CXL memory products. Micron 於 2021 年宣布立即停止 3D XPoint 開發，將資源轉向 CXL 記憶體產品。"
  },
  {
    "title_zh": "Intel · 3D XPoint",
    "title_en": "Intel · 3D XPoint",
    "url": "NVM技術全景.html#company-xpoint-intel-exit",
    "tags": "Intel 3D XPoint Intel's 2022 annual filing states that the Optane memory business wind-down began in 2022. Intel Intel 2022 年年報確認該年啟動 Optane 記憶體業務收尾。 Intel's 2022 annual filing states that the Optane memory business wind-down began in 2022. Intel 2022 年年報確認該年啟動 Optane 記憶體業務收尾。"
  },
  {
    "title_zh": "STMicroelectronics · PCM",
    "title_en": "STMicroelectronics · PCM",
    "url": "NVM技術全景.html#company-pcm-st-p3e",
    "tags": "STMicroelectronics PCM The 2026 Stellar P3E page identifies xMemory PCM, with full automotive qualification and production readiness planned for H2 2026. STMicroelectronics 2026 年 Stellar P3E 官方公告採 xMemory PCM；完整車規驗證與量產準備排定於 2026 下半年。 The 2026 Stellar P3E page identifies xMemory PCM, with full automotive qualification and production readiness planned for H2 2026. 2026 年 Stellar P3E 官方公告採 xMemory PCM；完整車規驗證與量產準備排定於 2026 下半年。"
  },
  {
    "title_zh": "IBM Research · PCM",
    "title_en": "IBM Research · PCM",
    "url": "NVM技術全景.html#company-pcm-ibm-aimc",
    "tags": "IBM Research PCM A 14 nm CMOS research chip with backend PCM integrates 64 256×256 analog cores and digital processing and communication for neural-network inference. IBM Research 14 nm CMOS 後段整合 PCM 的研究晶片包含 64 個 256×256 類比運算核心及數位處理／通訊，展示神經網路推論。 A 14 nm CMOS research chip with backend PCM integrates 64 256×256 analog cores and digital processing and communication for neural-network inference. 14 nm CMOS 後段整合 PCM 的研究晶片包含 64 個 256×256 類比運算核心及數位處理／通訊，展示神經網路推論。"
  },
  {
    "title_zh": "Texas Instruments · FeRAM",
    "title_en": "Texas Instruments · FeRAM",
    "url": "NVM技術全景.html#company-feram-ti-msp430",
    "tags": "Texas Instruments FeRAM An MSP430 reference design emulates EEPROM using embedded FRAM and lists supported MCUs and I2C/SPI host interfaces. Texas Instruments MSP430 FRAM 參考設計以嵌入式 FRAM 模擬 EEPROM，列出可採用的 MCU 與 I²C／SPI 主機介面。 An MSP430 reference design emulates EEPROM using embedded FRAM and lists supported MCUs and I2C/SPI host interfaces. MSP430 FRAM 參考設計以嵌入式 FRAM 模擬 EEPROM，列出可採用的 MCU 與 I²C／SPI 主機介面。"
  },
  {
    "title_zh": "RAMXEED · FeRAM",
    "title_en": "RAMXEED · FeRAM",
    "url": "NVM技術全景.html#company-feram-ramxeed",
    "tags": "RAMXEED FeRAM The FAQ states FeRAM has been mass-produced since 1999 for frequent-write applications; retention must be interpreted at the specified temperature. RAMXEED 官方 FAQ 說明 FeRAM 自 1999 年持續量產，應用於高頻寫入紀錄；保存年限必須依產品規定溫度解讀。 The FAQ states FeRAM has been mass-produced since 1999 for frequent-write applications; retention must be interpreted at the specified temperature. 官方 FAQ 說明 FeRAM 自 1999 年持續量產，應用於高頻寫入紀錄；保存年限必須依產品規定溫度解讀。"
  },
  {
    "title_zh": "Infineon · FeRAM",
    "title_en": "Infineon · FeRAM",
    "url": "NVM技術全景.html#company-feram-infineon",
    "tags": "Infineon FeRAM Infineon lists serial, parallel and EXCELON F-RAM using PZT ferroelectric films, with family-dependent endurance up to 100 trillion cycles. Infineon Infineon 列出串列／並列及 EXCELON F-RAM，採 PZT 鐵電薄膜，最高 100 兆次讀寫循環依系列而定。 Infineon lists serial, parallel and EXCELON F-RAM using PZT ferroelectric films, with family-dependent endurance up to 100 trillion cycles. Infineon 列出串列／並列及 EXCELON F-RAM，採 PZT 鐵電薄膜，最高 100 兆次讀寫循環依系列而定。"
  },
  {
    "title_zh": "GlobalFoundries / Fraunhofer IPMS · FeRAM",
    "title_en": "GlobalFoundries / Fraunhofer IPMS · FeRAM",
    "url": "NVM技術全景.html#company-feram-gf-ipms-2026",
    "tags": "GlobalFoundries / Fraunhofer IPMS FeRAM The 2026 collaboration reports HfO2 ferroelectric FRAM integrated in 22FDX, operating below 1 V with nanosecond switching. GlobalFoundries／Fraunhofer IPMS 2026 年共同成果將 HfO₂ 鐵電 FRAM 整合於 22FDX，公告低於 1 V 與奈秒級切換。 The 2026 collaboration reports HfO2 ferroelectric FRAM integrated in 22FDX, operating below 1 V with nanosecond switching. 2026 年共同成果將 HfO₂ 鐵電 FRAM 整合於 22FDX，公告低於 1 V 與奈秒級切換。"
  },
  {
    "title_zh": "imec · FeRAM / FeCAP",
    "title_en": "imec · FeRAM / FeCAP",
    "url": "NVM技術全景.html#company-ferro-imec-ndread",
    "tags": "imec FeRAM / FeCAP Joint work with Georgia Tech demonstrated nondestructive FeCAP reading, reporting over 10^11 read cycles at IEDM 2023. imec 與 Georgia Tech 研究展示 FeCAP 非破壞讀取，在 IEDM 2023 發表超過 10¹¹ 次讀取耐受度。 Joint work with Georgia Tech demonstrated nondestructive FeCAP reading, reporting over 10^11 read cycles at IEDM 2023. 與 Georgia Tech 研究展示 FeCAP 非破壞讀取，在 IEDM 2023 發表超過 10¹¹ 次讀取耐受度。"
  },
  {
    "title_zh": "NaMLab · FeFET / FTJ",
    "title_en": "NaMLab · FeFET / FTJ",
    "url": "NVM技術全景.html#company-ferro-namlab-2025",
    "tags": "NaMLab FeFET / FTJ The official 2025 publication list includes HZO bilayer FTJ thickness scaling and charge-trapping challenges in CMOS-embedded FeFETs. NaMLab 2025 年官方論文清單包括 HZO 雙層 FTJ 厚度微縮及 CMOS 嵌入式 FeFET 的電荷捕陷挑戰。 The official 2025 publication list includes HZO bilayer FTJ thickness scaling and charge-trapping challenges in CMOS-embedded FeFETs. 2025 年官方論文清單包括 HZO 雙層 FTJ 厚度微縮及 CMOS 嵌入式 FeFET 的電荷捕陷挑戰。"
  },
  {
    "title_zh": "FMC · HfO2 Ferroelectric Memory",
    "title_en": "FMC · HfO2 Ferroelectric Memory",
    "url": "NVM技術全景.html#company-ferro-fmc",
    "tags": "FMC HfO2 Ferroelectric Memory The current site proposes DRAM+ persistent modules and CACHE+ persistent chiplets based on ferroelectric technology. FMC 現行官網提出 DRAM+ 持久記憶體模組與 CACHE+ 持久快取晶粒，主張鐵電技術可整合既有製造流程。 The current site proposes DRAM+ persistent modules and CACHE+ persistent chiplets based on ferroelectric technology. 現行官網提出 DRAM+ 持久記憶體模組與 CACHE+ 持久快取晶粒，主張鐵電技術可整合既有製造流程。"
  },
  {
    "title_zh": "Infineon / Cypress · SONOS eFlash",
    "title_en": "Infineon / Cypress · SONOS eFlash",
    "url": "NVM技術全景.html#company-industry-infineon-sonos",
    "tags": "Infineon / Cypress SONOS eFlash The official page identifies 2T SONOS, FN program/erase, production nodes and process/design licensing. Infineon／Cypress 官方列出 2T SONOS、FN 寫抹與多個量產節點，提供製程及設計授權。 The official page identifies 2T SONOS, FN program/erase, production nodes and process/design licensing. 官方列出 2T SONOS、FN 寫抹與多個量產節點，提供製程及設計授權。"
  },
  {
    "title_zh": "SST / Microchip · SuperFlash NOR / eFlash",
    "title_en": "SST / Microchip · SuperFlash NOR / eFlash",
    "url": "NVM技術全景.html#company-industry-sst-superflash",
    "tags": "SST / Microchip SuperFlash NOR / eFlash SST lists SuperFlash process integration and licensing, complementing standalone NOR coverage. SST／Microchip 官方列出 SuperFlash 製程整合與授權，適合補上獨立 NOR 以外的嵌入式技術入口。 SST lists SuperFlash process integration and licensing, complementing standalone NOR coverage. 官方列出 SuperFlash 製程整合與授權，適合補上獨立 NOR 以外的嵌入式技術入口。"
  },
  {
    "title_zh": "STMicroelectronics · eSTM eFlash / Page EEPROM",
    "title_en": "STMicroelectronics · eSTM eFlash / Page EEPROM",
    "url": "NVM技術全景.html#company-industry-st-estm",
    "tags": "STMicroelectronics eSTM eFlash / Page EEPROM ST links 40nm floating-gate eSTM with vertical select transistors to STM32H5 and Page EEPROM implementations. STMicroelectronics 官方 eSTM 頁連結 40 nm 浮動閘極與垂直選擇電晶體，以及 STM32H5、Page EEPROM 的實施。 ST links 40nm floating-gate eSTM with vertical select transistors to STM32H5 and Page EEPROM implementations. 官方 eSTM 頁連結 40 nm 浮動閘極與垂直選擇電晶體，以及 STM32H5、Page EEPROM 的實施。"
  },
  {
    "title_zh": "Renesas · SG-MONOS eFlash",
    "title_en": "Renesas · SG-MONOS eFlash",
    "url": "NVM技術全景.html#company-industry-renesas-sgmonos",
    "tags": "Renesas SG-MONOS eFlash The 2016 announcement identifies production 40nm SG-MONOS MCUs and research on 16/14nm fin-shaped cells. Renesas 2016 公告確認當時 40 nm MCU 採 SG-MONOS 量產，並展示 16／14 nm Fin 結構研究。 The 2016 announcement identifies production 40nm SG-MONOS MCUs and research on 16/14nm fin-shaped cells. 2016 公告確認當時 40 nm MCU 採 SG-MONOS 量產，並展示 16／14 nm Fin 結構研究。"
  },
  {
    "title_zh": "X-FAB · XT011 eFlash / EEPROM",
    "title_en": "X-FAB · XT011 eFlash / EEPROM",
    "url": "NVM技術全景.html#company-industry-xfab-xt011",
    "tags": "X-FAB XT011 eFlash / EEPROM The 2024 announcement identifies embedded Flash and EEPROM on the XT011 110nm BCD-on-SOI platform. X-FAB 2024 年公告 XT011 110 nm BCD-on-SOI 平台的嵌入式 Flash 與 EEPROM。 The 2024 announcement identifies embedded Flash and EEPROM on the XT011 110nm BCD-on-SOI platform. 2024 年公告 XT011 110 nm BCD-on-SOI 平台的嵌入式 Flash 與 EEPROM。"
  },
  {
    "title_zh": "Macronix · Serial NOR / OctaBus",
    "title_en": "Macronix · Serial NOR / OctaBus",
    "url": "NVM技術全景.html#company-industry-macronix-nor",
    "tags": "Macronix Serial NOR / OctaBus Macronix's official Serial NOR page provides its product portfolio and OctaBus interface offerings. Macronix 官方 Serial NOR 目錄提供產品組合與 OctaBus 介面方案。 Macronix's official Serial NOR page provides its product portfolio and OctaBus interface offerings. 官方 Serial NOR 目錄提供產品組合與 OctaBus 介面方案。"
  },
  {
    "title_zh": "Winbond · W25Q16JW Serial NOR",
    "title_en": "Winbond · W25Q16JW Serial NOR",
    "url": "NVM技術全景.html#company-industry-winbond-w25q",
    "tags": "Winbond W25Q16JW Serial NOR The official catalog identifies W25Q16JW Serial NOR and associated ordering entries. Winbond 原廠目錄提供 W25Q16JW 序列 NOR 及對應料號入口。 The official catalog identifies W25Q16JW Serial NOR and associated ordering entries. 原廠目錄提供 W25Q16JW 序列 NOR 及對應料號入口。"
  },
  {
    "title_zh": "Samsung · Ninth-Generation TLC V-NAND",
    "title_en": "Samsung · Ninth-Generation TLC V-NAND",
    "url": "NVM技術全景.html#company-industry-samsung-vnand9",
    "tags": "Samsung Ninth-Generation TLC V-NAND Samsung announced mass production of 1Tb TLC ninth-generation V-NAND in April 2024. Samsung 2024 年 4 月公告 1 Tb TLC 第九代 V-NAND 開始量產。 Samsung announced mass production of 1Tb TLC ninth-generation V-NAND in April 2024. 2024 年 4 月公告 1 Tb TLC 第九代 V-NAND 開始量產。"
  },
  {
    "title_zh": "SK hynix · 321-Layer TLC 4D NAND",
    "title_en": "SK hynix · 321-Layer TLC 4D NAND",
    "url": "NVM技術全景.html#company-industry-skhynix-321tlc",
    "tags": "SK hynix 321-Layer TLC 4D NAND SK hynix announced the start of 321-layer 1Tb TLC NAND mass production in November 2024. SK hynix 2024 年 11 月公告 321 層、1 Tb TLC NAND 開始量產。 SK hynix announced the start of 321-layer 1Tb TLC NAND mass production in November 2024. 2024 年 11 月公告 321 層、1 Tb TLC NAND 開始量產。"
  },
  {
    "title_zh": "Solidigm · D5-P5336 QLC SSD",
    "title_en": "Solidigm · D5-P5336 QLC SSD",
    "url": "NVM技術全景.html#company-industry-solidigm-p5336",
    "tags": "Solidigm D5-P5336 QLC SSD The official D5-P5336 page identifies a commercial enterprise QLC SSD family and capacity options. Solidigm 官方 D5-P5336 產品頁提供 QLC 企業級 SSD 的產品與容量選項。 The official D5-P5336 page identifies a commercial enterprise QLC SSD family and capacity options. 官方 D5-P5336 產品頁提供 QLC 企業級 SSD 的產品與容量選項。"
  },
  {
    "title_zh": "Micron · G9 TLC NAND",
    "title_en": "Micron · G9 TLC NAND",
    "url": "NVM技術全景.html#company-industry-micron-g9",
    "tags": "Micron G9 TLC NAND The July 2024 release reports G9 TLC NAND and volume shipment of the Micron 2650 SSD using it. Micron 2024 年 7 月公告 G9 TLC NAND 及採用該世代的 Micron 2650 SSD 量產出貨。 The July 2024 release reports G9 TLC NAND and volume shipment of the Micron 2650 SSD using it. 2024 年 7 月公告 G9 TLC NAND 及採用該世代的 Micron 2650 SSD 量產出貨。"
  },
  {
    "title_zh": "Kioxia / Sandisk · Tenth-Generation BiCS 3D NAND",
    "title_en": "Kioxia / Sandisk · Tenth-Generation BiCS 3D NAND",
    "url": "NVM技術全景.html#company-industry-kioxia-sandisk-gen10",
    "tags": "Kioxia / Sandisk Tenth-Generation BiCS 3D NAND The July 2026 joint announcement states that tenth-generation 3D Flash production began at Kitakami K2. Kioxia／Sandisk 2026 年 7 月共同公告北上 K2 開始第十代 3D Flash 生產。 The July 2026 joint announcement states that tenth-generation 3D Flash production began at Kitakami K2. 2026 年 7 月共同公告北上 K2 開始第十代 3D Flash 生產。"
  },
  {
    "title_zh": "YMTC · Xtacking 3D NAND",
    "title_en": "YMTC · Xtacking 3D NAND",
    "url": "NVM技術全景.html#company-industry-ymtc-xtacking",
    "tags": "YMTC Xtacking 3D NAND The official page explains separate peripheral/array wafers joined by bonding and names Xtacking 4.0 X4 products in 2025. YMTC 官方頁說明周邊與陣列分別製造再鍵合，並列 2025 年 Xtacking 4.0 的 X4 系列產品。 The official page explains separate peripheral/array wafers joined by bonding and names Xtacking 4.0 X4 products in 2025. 官方頁說明周邊與陣列分別製造再鍵合，並列 2025 年 Xtacking 4.0 的 X4 系列產品。"
  },
  {
    "title_zh": "GigaDevice · GD25 / GD55 NOR",
    "title_en": "GigaDevice · GD25 / GD55 NOR",
    "url": "NVM技術全景.html#company-industry-gigadevice-flash",
    "tags": "GigaDevice GD25 / GD55 NOR The official portfolio lists GD25/GD55 NOR products. GigaDevice 官方頁列出 GD25／GD55 SPI NOR 與 GD5F SPI／平行 NAND。 The official portfolio identifies GD25/GD55 SPI NOR and GD5F SPI/parallel NAND. 官方產品組合列出 GD25／GD55 NOR。"
  },
  {
    "title_zh": "Floadia · LEE Flash ZT MTP",
    "title_en": "Floadia · LEE Flash ZT MTP",
    "url": "NVM技術全景.html#company-industry-floadia-zt",
    "tags": "Floadia LEE Flash ZT MTP The ZT page describes FN program/erase, zero added masks and named platform production records. Floadia ZT 官方頁說明 FN 寫抹、零新增光罩與具名平台量產紀錄。 The ZT page describes FN program/erase, zero added masks and named platform production records. ZT 官方頁說明 FN 寫抹、零新增光罩與具名平台量產紀錄。"
  },
  {
    "title_zh": "力旺 eMemory · NeoBit · 浮動閘極 OTP · OTP",
    "title_en": "eMemory · NeoBit · Floating-Gate OTP · OTP",
    "url": "NVM技術全景.html#company-ip-neobit",
    "tags": "eMemory · NeoBit · Floating-Gate OTP OTP Follow the series select transistor and p-type floating-gate storage transistor as electron injection changes read current. Then distinguish normal OTP operation from the physical possibility of ultraviolet erasure. eMemory · NeoBit · Floating-Gate OTP OTP 從串聯的選擇器與 p 型浮動閘極儲存電晶體，看電子注入如何改變讀取電流；再區分正常 OTP 操作與紫外線清除的物理可能性。"
  },
  {
    "title_zh": "力旺 eMemory · NeoFuse · Antifuse OTP · OTP",
    "title_en": "eMemory · NeoFuse · Antifuse OTP · OTP",
    "url": "NVM技術全景.html#company-ip-neofuse",
    "tags": "eMemory · NeoFuse · Antifuse OTP OTP Start at the n-type cell's gate dielectric and follow high-field defect creation, changes in effective tunneling distance and the gate current used for sensing. eMemory · NeoFuse · Antifuse OTP OTP 從 n 型單元的閘極介電層出發，追蹤高場造成的缺陷、有效穿隧距離變化，以及讀取時可辨識的閘極電流。"
  },
  {
    "title_zh": "Kilopass；2018 年併入 Synopsys · Kilopass XPM · OTP",
    "title_en": "Kilopass; acquired by Synopsys in 2018 · Kilopass XPM · OTP",
    "url": "NVM技術全景.html#company-ip-kilopass-xpm",
    "tags": "Kilopass; acquired by Synopsys in 2018 · Kilopass XPM OTP The original patent explicitly names XPM and distinguishes the storage MOS from the select MOS. Kilopass; acquired by Synopsys in 2018 · Kilopass XPM OTP 以原始專利明稱 XPM 的 2T 圖解，分清儲存 MOS 與選擇 MOS。"
  },
  {
    "title_zh": "Sidense；2017 年併入 Synopsys · Sidense 1T-Fuse · OTP",
    "title_en": "Sidense; acquired by Synopsys in 2017 · Sidense 1T-Fuse · OTP",
    "url": "NVM技術全景.html#company-ip-sidense-1t-fuse",
    "tags": "Sidense; acquired by Synopsys in 2017 · Sidense 1T-Fuse OTP One gate spans thick and thin oxide; persistent conduction through the thin region creates the OTP state. Sidense; acquired by Synopsys in 2017 · Sidense 1T-Fuse OTP 單一閘極跨越厚／薄氧化層；薄區永久導通形成 OTP 狀態。"
  },
  {
    "title_zh": "力旺 eMemory · NeoEE · FN／FN MTP · MTP",
    "title_en": "eMemory · NeoEE · FN/FN MTP · MTP",
    "url": "NVM技術全景.html#company-ip-neoee",
    "tags": "eMemory · NeoEE · FN/FN MTP MTP Follow the control-coupling region, floating node and tunneling region as FN transport stores and removes electrons. A read transistor then senses the stored state. eMemory · NeoEE · FN/FN MTP MTP 沿控制耦合區、浮動節點與穿隧區，分別追蹤 FN 如何將電子存入與移出，再由讀取電晶體感測儲存狀態。"
  },
  {
    "title_zh": "力旺 eMemory · NeoMTP · CHI／FN MTP · MTP",
    "title_en": "eMemory · NeoMTP · CHI/FN MTP · MTP",
    "url": "NVM技術全景.html#company-ip-neomtp",
    "tags": "eMemory · NeoMTP · CHI/FN MTP MTP Compare hot-carrier programming of the p-type floating-gate cell with FN electron transfer toward a dedicated erase gate. Both operations act on the same storage node. eMemory · NeoMTP · CHI/FN MTP MTP 比較 p 型浮動閘極單元的熱載子寫入，以及電子經 FN 移向專用抹除閘極的反向路徑。兩種操作在同一儲存節點上完成。"
  },
  {
    "title_zh": "億而得 YMC · YMC · MTP 與機制界線 · MTP",
    "title_en": "Yield Microelectronics (YMC) · YMC · MTP and Mechanism Boundaries · MTP",
    "url": "NVM技術全景.html#company-ip-ymc-mtp",
    "tags": "Yield Microelectronics (YMC) · YMC · MTP and Mechanism Boundaries MTP YMC publicly identifies a logic-process MTP family. The CHI/BBHH sequence below is an independent mechanism illustration, not evidence that a current ymtp product uses BBHH. Separate product capability from an illustrative 1T1C model. Yield Microelectronics (YMC) · YMC · MTP and Mechanism Boundaries MTP YMC 公開提供邏輯製程 MTP 家族。下方 CHI／BBHH 是獨立機制示意，並非現行 ymtp 商品採 BBHH 的證據；產品能力與 1T1C 教學模型分開閱讀。"
  },
  {
    "title_zh": "Impinj → Virage Logic → Synopsys · AEON · FN／FN MTP · MTP",
    "title_en": "Impinj → Virage Logic → Synopsys · AEON · FN/FN MTP · MTP",
    "url": "NVM技術全景.html#company-ip-impinj-aeon",
    "tags": "Impinj → Virage Logic → Synopsys · AEON · FN/FN MTP MTP Follow the named 2009 AEON company account: electrons enter and leave FG by FN, then a read MOS senses the state. Business and brand succession have a separate timeline. Impinj → Virage Logic → Synopsys · AEON · FN/FN MTP MTP 依 2009 年具名 AEON 原廠資料，追蹤電子經 FN 存入與移出浮動閘極，再由讀取 MOS 感測；品牌與業務承接另列時間線。"
  },
  {
    "title_zh": "Sony / Micron · Copper ReRAM",
    "title_en": "Sony / Micron · Copper ReRAM",
    "url": "NVM技術全景.html#company-sony-micron-reram",
    "tags": "Sony / Micron Copper ReRAM Micron’s 2014 VLSI announcement identifies Sony collaboration on copper ReRAM for a 16Gb storage-class-memory demonstration. Sony Micron 索尼 銅 Copper ReRAM CBRAM Micron 2014 年 VLSI 公告明確列出與 Sony 合作的銅 ReRAM，對應 16Gb 儲存級記憶體展示。"
  },
  {
    "title_zh": "GigaDevice · GD5F NAND",
    "title_en": "GigaDevice · GD5F NAND",
    "url": "NVM技術全景.html#company-industry-gigadevice-nand",
    "tags": "GigaDevice GD5F NAND The official portfolio separately lists GD5F NAND products. GigaDevice 官方頁列出 GD25／GD55 SPI NOR 與 GD5F SPI／平行 NAND。 The official portfolio identifies GD25/GD55 SPI NOR and GD5F SPI/parallel NAND. 官方產品組合另列 GD5F NAND。"
  },
  {
    "title_zh": "Kioxia／SK hynix · 64 Gbit 1Selector–1MTJ Cross-Point MRAM",
    "title_en": "Kioxia／SK hynix · 64 Gbit 1Selector–1MTJ Cross-Point MRAM",
    "url": "NVM技術全景.html#company-kioxia-skhynix-crosspoint",
    "tags": "Kioxia／SK hynix 64 Gbit 1Selector–1MTJ Cross-Point MRAM The jointly developed 64 Gbit cross-point MRAM replaces select transistors with two-terminal selectors; MTJ diameter is 20 nm, half-pitch 20.5 nm, and cell area 0.001681 µm². Kioxia／SK hynix 64 Gbit 1Selector–1MTJ Cross-Point MRAM Joint high-density MRAM research 高密度 MRAM 共同研究 共同開發 64 Gbit 交叉點 MRAM，以兩端選擇器取代選擇電晶體；MTJ 直徑 20 nm、半節距 20.5 nm，單元面積 0.001681 µm²。"
  },
  {
    "title_zh": "TetraMem · MLX200 Multi-Level RRAM Analog IMC",
    "title_en": "TetraMem · MLX200 Multi-Level RRAM Analog IMC",
    "url": "NVM技術全景.html#company-tetramem-mlx200",
    "tags": "TetraMem MLX200 Multi-Level RRAM Analog IMC In May 2026, TetraMem reported MLX200 tape-out and initial silicon validation on TSMC 22nm, integrating multi-level RRAM with mixed-signal computing in a SoC. TetraMem MLX200 Multi-Level RRAM Analog IMC Multi-level RRAM analog in-memory computing developer 多階 RRAM 類比記憶體內運算開發商 2026 年 5 月公告 MLX200 在 TSMC 22nm 製程完成投片與初步矽驗證，將多階 RRAM 與混合訊號運算整合於 SoC。"
  },
  {
    "title_zh": "Intrinsic／sureCore · SiOx RRAM",
    "title_en": "Intrinsic／sureCore · SiOx RRAM",
    "url": "NVM技術全景.html#company-intrinsic-surecore",
    "tags": "Intrinsic／sureCore SiOx RRAM Intrinsic identifies silicon-oxide RRAM as its core technology and lists a sureCore collaboration combining CMOS-compatible cells, memory architectures and compiler-design expertise. Intrinsic／sureCore SiOx RRAM Silicon-oxide RRAM and embedded-memory architecture collaboration 氧化矽 RRAM 與嵌入式記憶體架構合作 Intrinsic 官網以氧化矽 RRAM 為核心，並列出與 sureCore 合作，結合 CMOS 相容單元、記憶體架構及編譯器設計能力。"
  },
  {
    "title_zh": "Nantero／Fujitsu Semiconductor／Mie Fujitsu Semiconductor · Carbon-Nanotube NRAM",
    "title_en": "Nantero／Fujitsu Semiconductor／Mie Fujitsu Semiconductor · Carbon-Nanotube NRAM",
    "url": "NVM技術全景.html#company-nantero-fujitsu-nram",
    "tags": "Nantero／Fujitsu Semiconductor／Mie Fujitsu Semiconductor Carbon-Nanotube NRAM Fujitsu's official archive confirms that its two semiconductor businesses licensed Nantero carbon-nanotube NRAM in 2016 and began joint development toward a 55nm product. Nantero／Fujitsu Semiconductor／Mie Fujitsu Semiconductor Carbon-Nanotube NRAM Historical carbon-nanotube NRAM licensing and joint development 碳奈米管 NRAM 歷史授權與共同開發 Fujitsu 官方歷史新聞確認兩家半導體事業於 2016 年取得 Nantero 碳奈米管 NRAM 授權，並共同開發 55nm 產品。"
  },
  {
    "title_zh": "Toggle、DDR STT 與 xSPI 的三條產品線",
    "title_en": "Three Product Lines: Toggle, DDR STT and xSPI",
    "url": "NVM技術全景.html#research-everspin",
    "tags": "Everspin Everspin is a core commercial MRAM reference. Its three product lines differ in write physics, interfaces, retention and qualification; compare exact ordering codes and document versions."
  },
  {
    "title_zh": "RRAM 嵌入式平台與 MRAM 商品路徑並進",
    "title_en": "Embedded RRAM and a Distinct MRAM Product Route",
    "url": "NVM技術全景.html#research-umc",
    "tags": "UMC UMC evidence spans process availability, qualified RRAM IP, a SoC development platform and standalone MRAM products. These are distinct delivery levels."
  },
  {
    "title_zh": "Ta 氧化物的導電絲控制與商品證據",
    "title_en": "Tantalum-Oxide Filaments and Product Evidence",
    "url": "NVM技術全景.html#research-panasonic",
    "tags": "Panasonic Panasonic is an important early commercial ReRAM developer. Trace 180nm production, 40nm test macros and Fujitsu products separately to connect the mechanism with reliability and products."
  },
  {
    "title_zh": "把 MRAM 微縮、電流與保持放在一起看",
    "title_en": "Read MRAM Scaling, Current and Retention Together",
    "url": "NVM技術全景.html#research-ibm",
    "tags": "IBM Research IBM contributes traceable device physics and CMOS integration results. MTJ size, process node and write-error rate from different studies must not be combined into an imaginary best-specification product."
  },
  {
    "title_zh": "從 SOT 寫入通道走向陣列與運算",
    "title_en": "From SOT Write Channels to Arrays and Computing",
    "url": "NVM技術全景.html#research-itri",
    "tags": "ITRI ITRI evidence spans distinct collaborations and versions: SOT with TSMC, cryogenic STT with NYCU, a joint β-W array, an 8-inch prototyping service and RRAM technology transfer."
  },
  {
    "title_zh": "全球 NVM 產業與研究地圖",
    "title_en": "Global NVM Industry and Research Map",
    "url": "NVM技術全景.html#ecosystem",
    "tags": "Everspin Samsung Intel MRAM ReRAM PCM FeRAM FeFET 產業 研究 工研院"
  },
  {
    "title_zh": "GF／TSMC／UMC 年度路線圖",
    "title_en": "GF / TSMC / UMC Roadmap",
    "url": "NVM技術全景.html#foundry",
    "tags": "GLOBALFOUNDRIES TSMC eMRAM ReRAM RRAM eNVM roadmap 22FDX 12LP AutoPro150"
  },
  {
    "title_zh": "歷史總表與有條件比較",
    "title_en": "Historical and Current Comparisons",
    "url": "NVM技術全景.html#comparison",
    "tags": "2016 2021 2026 比較 能量 耐久 保持 延遲 endurance retention latency energy"
  }
];
