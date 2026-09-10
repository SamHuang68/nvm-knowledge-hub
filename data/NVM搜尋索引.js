window.NVMTopicIndex = [
  {
    "title_zh": "NVM 技術全景",
    "title_en": "NVM Technology Panorama",
    "url": "NVM技術全景.html",
    "tags": "NVM 全景 物理 比較 bitcell MRAM ReRAM GLOBALFOUNDRIES TSMC"
  },
  {
    "title_zh": "eFuse：以永久導通變化記住一個位元",
    "title_en": "eFuse: Permanent Conductance Programming",
    "url": "NVM技術全景.html#topic-efuse",
    "tags": "A bit is stored as a difference in the resistance of a conductive path. An unprogrammed fuse typically has low resistance; a controlled current causes material migration or a break in a designated region, producing higher resistance. Logic 0/1 is defined by sensing and encoding. High resistance does not intrinsically correspond to a particular bit value, and the programmed state must not be assumed to be an ideal open circuit. eFuse is suited to permanently storing small amounts of on-chip configuration, such as trim codes, repair addresses, and identification data. One-time programming means that each physical location supports an effective transition in only one irreversible direction; separate locations can be programmed in batches. Multiple programming commands to a macro do not make an individual fuse reversibly erasable and rewritable. 位元存在導電路徑的電阻差異中。未程式化熔絲通常保持低電阻；受控電流使指定區域發生材料遷移或斷開，形成較高電阻。邏輯 0／1 由感測與編碼定義，不能把高電阻天然指定為某個位元，也不能假定寫後一定是理想開路。 US7417300B2 US8847350B2"
  },
  {
    "title_zh": "Antifuse：以介電層崩潰建立永久導通",
    "title_en": "Antifuse: Permanent Conduction Through Dielectric Breakdown",
    "url": "NVM技術全景.html#topic-antifuse",
    "tags": "Before programming, the storage dielectric separates two electrodes and permits only very small leakage. Programming creates a permanent, detectable conduction path through a high electric field. Information resides in the conduction difference before and after breakdown, opposite to the typical eFuse transition from low to high resistance. Both can provide OTP, but their storage materials and programming conditions differ. Antifuse design aims to establish acceptable conduction first in a designated storage dielectric while keeping selectors, peripheral circuits, and half-selected cells functional; it does not rely on uncontrolled breakdown across the chip. Permanent data can support identification, trimming, code, or key storage. Security is separately determined by the readout interface, access controls, and protective design. 未程式化時，儲存介電層隔開兩個電極，只容許很小的漏電；程式化以高電場形成永久可感測導通路徑。資訊存在崩潰後與崩潰前的導通差異，方向與典型 eFuse 的低阻轉高阻相反。兩者都可提供 OTP，但儲存材料與寫入條件不同。 US6667902B2"
  },
  {
    "title_zh": "EEPROM 與 MTP：以浮動閘極管理可更新電荷",
    "title_en": "EEPROM and MTP: Rewritable Floating-Gate Storage",
    "url": "NVM技術全景.html#topic-eeprom",
    "tags": "A floating gate is a conductive island surrounded by insulating layers, with no direct DC metal connection to it. Retained charge changes how the control gate acts on the channel, shifting the MOS threshold voltage. In a typical n-channel example, adding electrons makes conduction more difficult. Reading measures the channel; normal read operation does not require draining the stored electrons. EEPROM describes nonvolatile storage that can be electrically programmed and erased. MTP describes the ability to program multiple times or a product positioning. One publicly described Synopsys MTP product uses floating-gate EEPROM, but the MTP name alone does not guarantee single-poly construction, a particular program/erase mechanism, or a fixed endurance. Identify the physical structure first, then check the product's update granularity and cycling specification. 浮動閘極是被絕緣層包圍的導電小島，沒有直流金屬接點直接連到它。留存電荷改變控制閘極對通道的作用，使 MOS 臨界電壓位移；對典型 n 通道例，增加電子使導通較困難。讀取量測通道，正常操作不必把儲存電子倒出來。 US4115914A US5844271A"
  },
  {
    "title_zh": "NOR：從堆疊閘極到分離閘極的程式碼儲存",
    "title_en": "NOR: Stacked-Gate and Split-Gate Code Storage",
    "url": "NVM技術全景.html#topic-nor",
    "tags": "NOR describes array connectivity and access organization, not a unique storage material. This topic uses floating-gate NOR: charge changes cell threshold voltage, and the selected cell is sensed through the bitline and source path. Both stacked-gate and split-gate cells can serve NOR arrays, but their selection channels, programming efficiency, and erase control differ. NOR is commonly used for code storage requiring direct, predictable reads. Stacked-gate cells place storage and selection responsibilities under the cell's gate control; split-gate cells add a selection channel that helps block unselected leakage from overerased cells. Execute-in-place support also depends on the interface, controller, and cache timing and cannot be guaranteed by the NOR name alone. NOR 描述陣列的連接與存取組織，並不限定唯一儲存材料。本題以浮動閘極 NOR 說明：電荷改變單元臨界電壓，受選單元經位元線與源極路徑被感測。堆疊閘極與分離閘極都可服務 NOR，但選擇通道、寫入效率及抹除控制不同。 US6232180B1"
  },
  {
    "title_zh": "SONOS 與 NROM：把電荷留在絕緣捕捉層",
    "title_en": "SONOS and NROM: Charge Trapping in Insulating Layers",
    "url": "NVM技術全景.html#topic-sonos",
    "tags": "Electrons remain in trapping centers within insulating materials such as silicon nitride, changing the potential seen by the channel and its threshold voltage. The trapping layer is not a conductive floating gate, and charge can have a spatial distribution. Channel-wide SONOS program/erase examples and localized NROM charge-trapping examples therefore require different operating and sensing explanations; simply recoloring a floating gate is not sufficient. SONOS/MONOS describe material stacks or gate materials, while NROM refers to an implementation lineage that uses localized trapping and read direction. They are not directly interchangeable product names. Infineon's SONOS has production platforms, so the entire charge-trap family must not be labeled emerging. Its FN program/erase mechanism and reliability figures also must not be transferred to every NROM implementation. 電子停留在氮化矽等絕緣材料的捕捉中心，改變通道所見電位與臨界電壓。捕捉層不是導電浮動閘極，電荷可具有位置分布；SONOS 全域寫抹例與 NROM 局部捕捉例因此需要不同的操作與讀取解說，不能只把浮動閘極改塗另一種顏色。 WO1981000790A1 US5768192A"
  },
  {
    "title_zh": "NAND：從平面串列到垂直堆疊與多階儲存",
    "title_en": "NAND: Planar Strings, Vertical Stacks, and Multilevel Storage",
    "url": "NVM技術全景.html#topic-nand",
    "tags": "NAND data can still be retained by charge in a floating gate or dielectric trapping layer that changes threshold voltage. NAND itself describes an array organization with multiple cells connected in series. Storing N bits per cell requires 2 to the Nth power distinguishable states, such as eight for TLC and sixteen for QLC. More bits do not provide additional windows of unchanged width for free. Series connection increases density by sharing contact overhead across cells, but reading one cell requires the other cells in its string to provide a conduction path. Planar feature shrink, additional 3D layers, and more bits per cell are distinct density axes, each with charge-window, process, and reliability costs. Page programming and block erase also make the controller an important part of usable storage. NAND 的資料仍可由浮動閘極或介電捕捉層中的電荷改變臨界電壓來保存；NAND 本身指多顆單元串接的陣列組織。每單元存 N 個位元就需區分 2 的 N 次方個狀態，例如 TLC 的八個及 QLC 的十六個；更多位元不是增加同樣寬度的免費窗口。 US7696559B2"
  },
  {
    "title_zh": "Toggle MRAM：用磁場時序翻轉磁矩",
    "title_en": "Toggle MRAM: Magnetic-Field Sequencing",
    "url": "NVM技術全景.html#topic-toggle",
    "tags": "The bit is stored in the magnetization direction of the free magnetic layer. Parallel and antiparallel alignment relative to the reference layer produce different resistance levels in the magnetic tunnel junction. A magnetic energy barrier maintains the direction after power is removed. Toggle specifically denotes a write method that reverses data through the rotation of coupled magnetic moments; it is not a general name for all field-written MRAM. Toggle MRAM assigns data retention to the magnetic energy barrier and data modification to precisely sequenced magnetic fields. The controller first determines whether the existing and requested values differ, then toggles only when needed. It does not require the block-erase sequence of Flash, but it adds read, comparison, and toggle control. This complete sequence is essential to a valid comparison of write latency and energy. 位元儲存在自由磁層的磁化方向；相對參考層平行或反平行，會讓磁性穿隧接面的電阻不同。磁能障壁使方向在斷電後仍可維持。Toggle 特別指一類利用耦合磁矩旋轉來翻轉資料的寫入方式，並不是所有磁場寫入 MRAM 的通稱。 US6545906B1"
  },
  {
    "title_zh": "STT-MRAM：讓自旋電流穿過接面",
    "title_en": "STT-MRAM: Spin Current Through the Junction",
    "url": "NVM技術全景.html#topic-stt",
    "tags": "The stored quantity remains the orientation of the free magnetic layer relative to the reference layer, and reading relies on the resistance difference of the magnetic tunnel junction. The principal difference from Toggle is writing: current passing through the magnetic stack carries spin angular momentum and exerts torque on the free layer, changing its magnetic state. Nonvolatility comes from the magnetic energy barrier, not from keeping current inside the device. STT concentrates write current in the selected junction and improves on the scaling limitations of magnetic-field write lines, making it an important route for commercial discrete and embedded MRAM. Increasing current can shorten switching time, but also raises access-transistor requirements and barrier stress. Reducing current can lengthen latency and worsen the error-rate tail. The best speed, lifetime, and density values from separate conditions cannot be combined into one product specification. 儲存量仍是自由磁層相對參考磁層的方向，讀取依賴磁性穿隧接面的電阻差。與 Toggle 的主要區別在寫入：電流經過磁性堆疊後攜帶自旋角動量，向自由層施加轉矩，使磁態改變。非揮發性由磁能障壁提供，不是把電流持續留在元件內。 US5695864A"
  },
  {
    "title_zh": "SOT-MRAM：分開讀取與寫入路徑",
    "title_en": "SOT-MRAM: Separate Read and Write Paths",
    "url": "NVM技術全景.html#topic-sot",
    "tags": "SOT-MRAM also retains data in the magnetization direction of an MTJ free layer and senses it through magnetoresistance. Its distinguishing feature is that write angular momentum is generated primarily by a spin-orbit material beside or beneath the free layer and injected into it, rather than by sending the main write current through the tunnel barrier. The stored physical quantity is therefore similar to STT, while the write structure and array cost differ. SOT seeks short write pulses and lower barrier stress by separating the read and write paths, making it a focus of last-level-cache research. However, the third terminal and extra line consume area, and deterministic field-free switching, large-array yield, and process integration must also be established. Low-energy or high-cycle-count cell demonstrations satisfy only part of that validation. SOT-MRAM 同樣以 MTJ 的自由層磁化方向保存資料，並以磁阻感測。其新意在於寫入角動量主要由旁側或底部的自旋軌道材料產生，注入自由層，而不是讓主要寫入電流穿過穿隧障壁。因此物理儲存量與 STT 相近，寫入結構及陣列代價卻不同。 US10930843B2"
  },
  {
    "title_zh": "VCM ReRAM：重排氧離子與導電通道",
    "title_en": "VCM ReRAM: Oxygen Redistribution and Conductive Paths",
    "url": "NVM技術全景.html#topic-vcm",
    "tags": "VCM stores data in the ionic distribution, local redox state, or interfacial barrier of an oxide, producing distinguishable resistance states. A typical filament model explains conduction and rupture through redistribution of oxygen ions/oxygen vacancies, but not every device has a single clearly defined filament. Materials, electrodes, and measurement evidence determine the mechanism; a hysteretic I–V curve alone is insufficient to identify VCM. VCM operation centers on controlling reversible local changes without driving the oxide into permanent breakdown. SET commonly lowers resistance, while RESET raises it. Some stacks require initial current-limited forming to activate a conductive path. Rebuilding the path may differ slightly on each cycle, making the relationship among forming, write verification, cycling distributions, and retention more important than one attractive typical I–V curve. VCM 以氧化物中的離子分布、局部氧化還原狀態或界面障壁儲存資料，表現為可區分的電阻狀態。典型通道模型用氧離子／氧空缺重分布解釋導通與斷裂，但並非所有元件都只有一根清晰細絲。材料、電極及量測證據才是機制判定依據，遲滯 I–V 本身不足以識別 VCM。 US8331131B2"
  },
  {
    "title_zh": "ECM／CBRAM：長出並溶解金屬橋",
    "title_en": "ECM/CBRAM: Growing and Dissolving a Metal Bridge",
    "url": "NVM技術全景.html#topic-ecm",
    "tags": "ECM changes a conductive path through the motion and redox reactions of active-metal ions. An existing conductive bridge commonly produces a low-resistance state; dissolving a critical part of the bridge produces a high-resistance state. Both ECM and oxygen-vacancy VCM exhibit resistive switching, but their ion sources and path materials differ. CBRAM is a common commercial name for this conductive-bridge memory. Sharing the ReRAM label does not justify combining their physical models. During SET, the active metal oxidizes into ions, moves through the medium under an electric field, and is reduced to progressively establish a metal bridge. RESET dissolves part of that bridge. A thin bridge can reduce switching energy but may be destabilized by heat and surface energy. Fast formation and long-term retention must be checked under the same conditions rather than taken from separate best-case experiments. ECM 用活性金屬離子的移動與氧化還原改變導電路徑；導電橋存在時常為低阻態，橋的關鍵位置溶解後成為高阻態。它與氧空缺 VCM 都表現為電阻切換，但離子來源及通道材料不同。CBRAM 是此類導電橋記憶體的常見商業名稱，不能只因同叫 ReRAM 就合併物理模型。 US5761115A"
  },
  {
    "title_zh": "PCM：用熱歷程控制晶相",
    "title_en": "PCM: Controlling Phase with Thermal History",
    "url": "NVM技術全景.html#topic-pcm",
    "tags": "PCM stores data in the fraction and geometry of crystalline and amorphous phase-change material. In a typical electronic device, the crystalline state has lower resistance and the amorphous state higher resistance; material kinetics retain the state after power removal. The actual state is more than an abstract resistance value. It includes the location and size of the phase-change region, degree of crystallization, and evolution over time, which jointly determine reading and lifetime. RESET locally melts material with a short, high-peak pulse and rapidly cools it into an amorphous state. SET uses an appropriate thermal history to crystallize the material. Reducing phase-change volume can lower energy, but retention, cycling failure, and thermal crosstalk must still be considered. PCM appears in production MCUs and is also researched for storage-class memory and analog weights. Different uses do not change its phase-based storage mechanism. PCM 把資料儲存在相變材料的晶態／非晶態比例與幾何形狀。典型電子式元件中，晶態較低阻、非晶態較高阻；斷電後依材料動力學保存狀態。真正的狀態不只是一個抽象電阻值，還包含相變區的位置、大小、結晶程度與時間演變，這些共同決定讀取與壽命。 US5912839A"
  },
  {
    "title_zh": "電容式 FeRAM：感測極化翻轉的電荷",
    "title_en": "Capacitor FeRAM: Sensing Polarization-Switching Charge",
    "url": "NVM技術全景.html#topic-feram",
    "tags": "The bit is represented by the polarization direction retained in a ferroelectric material after the external electric field is removed. Unlike DRAM, which relies on temporarily stored free charge, FeRAM is based on switchable remanent polarization. Reading uses the different charge responses when polarization switches and when it does not. Distinguishing the material's retention mechanism from the circuit's sensing method explains why nonvolatile memory may still require restoration after a read. Writing sets polarization through the electric-field direction. Reading applies an excitation and identifies the original value from the charge difference between switching and non-switching responses. If reading changes polarization, the circuit must restore the original data. Commercial FeRAM can conceal this sequence behind its interface so that the user sees an ordinary read command, but internal restoration, power-failure conditions, and timing remain part of reliability. 位元由鐵電材料在移除外電場後仍保留的極化方向表示。與 DRAM 依賴暫存自由電荷不同，FeRAM 的核心是可切換剩餘極化；讀取則利用極化翻轉與未翻轉時不同的電荷響應。必須分清材料的保持機制與電路的感測方法，才能理解為何非揮發記憶體仍可能需要讀後恢復。 US4873664A"
  },
  {
    "title_zh": "FeFET：把極化轉成臨界電壓差",
    "title_en": "FeFET: Translating Polarization into Threshold Voltage",
    "url": "NVM技術全景.html#topic-fefet",
    "tags": "FeFET uses ferroelectric polarization in the gate stack to change channel electrostatics, giving the transistor distinguishable high and low threshold voltages. Reading selects a gate bias between those thresholds and senses channel current. Charge trapping and detrapping also affect the actual memory window, so not every threshold-voltage change can be attributed solely to polarization. FeFET combines ferroelectric retention with transistor current gain, providing research opportunities for nondestructive reading and density scaling. The challenge is that write voltage is divided across both the ferroelectric and interfacial layers, while polarization switching may also generate or fill traps. Polarization stability, memory window, and endurance are not three independently optimizable numbers. FeFET 利用閘極堆疊的鐵電極化改變通道靜電位勢，使電晶體具有可區分的高、低臨界電壓。讀取在兩個臨界電壓之間選一個閘極偏壓，感測通道電流。實際記憶視窗也會受到電荷捕獲與釋放影響，所以不能把所有臨界電壓變化都單獨歸因於極化。 US10153155B2 US11502083B2"
  },
  {
    "title_zh": "FTJ：用極化改變穿隧障壁",
    "title_en": "FTJ: Modulating the Tunnel Barrier with Polarization",
    "url": "NVM技術全景.html#topic-ftj",
    "tags": "FTJ controls tunneling current through the polarization direction of a thin ferroelectric barrier. The two directions produce different effective barrier profiles and resistance levels, commonly described through tunnel electroresistance, or TER. FTJ and FeFET both use polarization, but FTJ does not rely on threshold-voltage amplification in a semiconductor channel. Read current, barrier thickness, electrode screening, and leakage therefore become central tradeoffs. FTJ reverses polarization with a larger pulse, then senses tunneling current at a smaller bias, pursuing two-terminal nondestructive storage and interconnect-layer integration. The barrier must be thin enough to provide readable current while retaining stable ferroelectricity and suppressing leakage. An attractive resistance ratio does not establish sufficient absolute read current, much less a reliable selection window for a large array. FTJ 以薄鐵電障壁的極化方向控制穿隧電流，兩種方向對應不同的有效障壁形狀及電阻。此穿隧電阻差常以 TER 描述。它與 FeFET 都利用極化，但沒有依靠半導體通道的臨界電壓放大，因此讀取電流、障壁厚度、電極屏蔽與漏電的取捨成為核心。 US20240057343A1"
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
    "title_zh": "GF／TSMC 年度路線圖",
    "title_en": "GF / TSMC Roadmap",
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
