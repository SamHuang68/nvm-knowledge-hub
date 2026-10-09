/**
 * 具名新興記憶體 IP 的原創單元圖解。
 * 幾何、磁矩軌跡與粒子位置均為教材示意，並非產品剖面或量測。
 */
const bi = (zh,en) => ({zh,en});
const pick = (value,language) => typeof value === 'string' ? value : value[language];
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const C = {ink:'#173449',muted:'#536c7c',line:'#6b8492',metal:'#bdd0dc',oxide:'#edf3f7',free:'#178084',ref:'#4b6396',spin:'#7f5899',current:'#bd6827',electron:'#236fab',oxygen:'#1b80a2',vacancy:'#b66b21',silver:'#82639d',copper:'#b86e33',white:'#ffffff'};
const source = (id,label,url,kind,date,locator,limit,accessedAt='2026-09-10') => ({id,label,url,kind,date,accessedAt,locator,limit});
const SOURCES = {
  numem:source("ip-numem-current",bi("Numem：晶圓廠 STT-MRAM 與記憶體架構","Numem: Foundry STT-MRAM and Memory Architecture"),"https://www.numem.com/",bi("原廠技術概況","Vendor overview"),null,bi("Numem MRAM 與 foundry-based STT-MRAM 說明","Numem MRAM and foundry-based STT-MRAM description"),bi("支持晶圓廠 STT 單元與 IP 整合；SWT 偵測電路及精確能量改善未核實。","Supports foundry STT cells and IP integration; SWT sensing circuitry and exact energy gains are unverified."),"2026-10-09"),
  numem2019:source('ip-numem-2019',bi('Numem：第一代 22nm 嵌入式 MRAM 原始發表','Numem: First-Generation 22nm Embedded MRAM Presentation'),'https://web.archive.org/web/20240627014017/https://files.futurememorystorage.com/proceedings/2019/08-05-Monday/20190805_MRAMDD_EmbeddedMRAM_Hendrickson.pdf',bi('原廠公開會議簡報','Manufacturer public conference presentation'),'2019-08-05',bi('第 2、4、5、7 頁：試驗晶片、WL／BL／SL、定電流感測、RMTJ','Pages 2, 4, 5, 7: test chip, WL/BL/SL, forced-current sensing, RMTJ'),bi('這是第一代試驗晶片架構；未把其量測數值當成現行 NuRAM 規格。','This is a first-generation test-chip architecture; its measured values are not treated as current NuRAM specifications.')),
  stt:source('ip-stt-physics',bi('Everspin：STT 家族物理說明','Everspin: STT Family Physics'),'https://www.everspin.com/stt-mram-technology',bi('原廠機制說明','Manufacturer mechanism explanation'),null,bi('Spin-transfer Torque MRAM Technology：電流方向、自由層、P／AP 電阻','Spin-transfer Torque MRAM Technology: current direction, free layer, P/AP resistance'),bi('僅支持 STT 家族物理；不作為 Numem 的產品、材料或效能證據。','Supports STT family physics only, not Numem product, material, or performance evidence.')),
  gf:source('ip-gf-platform',bi('GF：22FDX 嵌入式 MRAM 平台','GF: 22FDX Embedded MRAM Platform'),'https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram',bi('晶圓代工廠原始公告','Original foundry announcement'),'2020-02-27',bi('首段與 Custom design kits：進入生產、可嵌入的矽驗證 MRAM 巨集','Opening and Custom design kits: production entry and drop-in silicon-validated MRAM macros'),bi('平台身分與單元研究配方分開；可用宏、節點與條件須以供應商交付確認。','Platform identity is separate from the research-cell recipe; confirm macro availability, nodes, and conditions with the supplier.')),
  gf2024:source('ip-gf-cell-2024',bi('GF 共同作者研究：22FDX STT-MRAM 單元','GF Coauthored Research: 22FDX STT-MRAM Cells'),'https://pmc.ncbi.nlm.nih.gov/articles/PMC11409953/',bi('原始研究論文','Original research paper'),'2024-09-18',bi('Materials and Methods：MRAM array structure and fabrication；圖 2','Materials and Methods: MRAM array structure and fabrication; Figure 2'),bi('僅限文中 CoFeB／SAF 與 1T1MTJ 範例；文中正向 Ic：RL→FL，寫入 P。未指定障壁材料。','Limited to the reported CoFeB/SAF and 1T1MTJ example; positive Ic is RL-to-FL and writes P. Barrier material is not specified here.')),
  weebit:source("ip-weebit-product",bi("Weebit：OxRAM 單元運作","Weebit: OxRAM Cell Operation"),"https://www.weebit-nano.com/faq/how-does-weebit-reram-rram-work/",bi("原廠技術說明","Vendor technology explanation"),null,bi("How does Weebit ReRAM / RRAM work?","How does Weebit ReRAM / RRAM work?"),bi("支持氧化物、電極與缺陷路徑教學；未核實專利及特定 TiN/SiOx/Ti 配方不作產品規格。","Supports oxide, electrode and defect-path teaching; the unverified patent and a specific TiN/SiOx/Ti recipe are not product specifications."),"2026-10-09"),
  weebitCell:source('ip-weebit-bitcell',bi('Weebit：ReRAM 位元單元','Weebit: ReRAM Bitcell'),'https://www.weebit-nano.com/technology/reram-bitcell/',bi('原廠機制說明','Manufacturer mechanism explanation'),null,bi('雙電極／薄氧化物、成形、正向 SET 與反向 RESET','Two electrodes/thin oxide, forming, positive SET, and reverse RESET'),bi('成形與日常 SET 分開；頁面未給所有材料與逐端點電壓。','Forming is distinct from recurring SET; the page does not specify all materials or terminal voltages.')),
  weebit2021:source('ip-weebit-cell-2021',bi('Weebit／CEA-Leti／Silvaco：氧化物 ReRAM 原始模型','Weebit/CEA-Leti/Silvaco: Original Oxide ReRAM Model'),'https://www.weebit-nano.com/wp-content/uploads/2021/05/Weebit-nano_Silvaco_ReRAM-TCAD_Oxide-Based-Model_IMW_OxRAM_2021_published-on-IEEE_V3-1.pdf',bi('原始研究論文的作者公開版本','Author-posted original research paper'),'2021-05',bi('PDF 第 2–5 頁；II–IV 節、圖 1、3、5、11：Ti／SiOx／TiN 與氧交換','PDF pages 2–5; Sections II–IV and Figures 1, 3, 5, 11: Ti/SiOx/TiN and oxygen exchange'),bi('CEA 130nm 研究單元的模型與電性比對；不是現場直接追蹤離子，也不是所有 SkyWater 宏的配方揭露。','Model/electrical comparison for a CEA 130nm research cell; neither direct operando ion tracking nor a recipe disclosure for every SkyWater macro.')),
  crossbar:source('ip-crossbar-macro',bi('Crossbar：高效能 ReRAM IP 產品簡介','Crossbar: High-Performance ReRAM IP Brief'),'https://web.archive.org/web/20251111045329/https://www.crossbar-inc.com/assets/white-papers/High-Performance-Memory-Product-Brief.pdf',bi('原廠公開產品簡介','Manufacturer public product brief'),null,bi('第 1–2 頁：hard macro／architectural license、嵌入式宏與改寫','Pages 1–2: hard macro/architectural license, embedded macro, and overwrite'),bi('支持歷史 IP 授權形態；本次未確認 2026 年可新授權的節點與宏清單。','Supports historical IP licensing forms; this review does not confirm a 2026 list of newly licensable nodes or macros.')),
  crossbar2015:source('ip-crossbar-2015',bi('Crossbar：嵌入式 1T1R 與金屬路徑原始發表','Crossbar: Original Embedded 1T1R and Metallic-Path Presentation'),'https://web.archive.org/web/20240712152921/https://files.futurememorystorage.com/proceedings/2015/20150812_S203A_Nazarian.pdf',bi('原廠公開會議簡報','Manufacturer public conference presentation'),'2015',bi('第 3、4、7、8、15 頁：金屬路徑、單元與選擇器、BEOL 1T1R','Pages 3, 4, 7, 8, 15: metallic path, cell versus selector, BEOL 1T1R'),bi('嵌入式 1T1R 與高密度 1S1R／1TnR 各有範圍，不合併為同一電路。','Embedded 1T1R and high-density 1S1R/1TnR have separate scopes and are not merged into one circuit.')),
  crossbar2012:source("ip-crossbar-cell-2012",bi("Crossbar：RRAM 內在寫入電流控制公開申請案","Crossbar: Intrinsic Programming Current Control for RRAM"),"https://patents.google.com/patent/US20120007035A1/en",bi("公開專利申請案","Published patent application"),null,bi("圖 1–3；摘要與非晶矽缺陷密度描述","Figures 1–3; abstract and amorphous-silicon defect-density description"),bi("使用歷史實施例的金屬粒子路徑；不是奈米開孔專利，公開申請不等於有效授權或現行產品。","Uses the historical metal-particle-path embodiment; not a nano-aperture patent. Publication does not establish an enforceable grant or current product."),"2026-10-09"),
  everspinPat:source("ip-everspin-pmtj",bi("Everspin：STT-MRAM 技術","Everspin: STT-MRAM Technology"),"https://www.everspin.com/stt-mram-technology",bi("原廠技術頁","Vendor technology page"),null,bi("Spin-transfer Torque MRAM Technology；pMTJ、寫入電流與 P/AP 段落","Spin-transfer Torque MRAM Technology; pMTJ, write current and P/AP paragraphs"),bi("支持垂直 MTJ 與雙向 STT；未揭露雙 MgO、薄膜厚度或通用熱預算。","Supports perpendicular MTJs and bidirectional STT; no dual-MgO stack, film thickness or universal thermal budget is established."),"2026-10-09"),
  everspinProd:source('ip-everspin-product',bi('Everspin：STT-MRAM 產品技術','Everspin: STT-MRAM Product Technology'),'https://www.everspin.com/stt-mram-technology',bi('原廠技術說明','Manufacturer technology overview'),null,bi('pMTJ、寫入電流方向與 P／AP 電阻態','pMTJ, write-current direction and P/AP resistance states'),bi('只支持公開的 STT 原理與技術定位；精確堆疊、熱預算及可用節點須依具名產品另行核對。','Supports public STT principles and technology positioning; exact stacks, thermal budgets and available nodes require named-product evidence.'),'2026-10-09'),
  avalanchePat:source("ip-avalanche-saf",bi("Avalanche：STT-MRAM 公司技術概況","Avalanche: STT-MRAM Company Overview"),"https://www.avalanche-technology.com/company/",bi("原廠技術概況","Vendor overview"),null,bi("公司 STT-MRAM 與應用介紹","Company STT-MRAM and application overview"),bi("只支持 STT-MRAM 技術定位；Dual-SAF、雙障壁與 50% 改善未核實。","Supports the STT-MRAM positioning only; dual-SAF, dual barriers and a 50% improvement are unverified."),"2026-10-09"),
  spinmemPat:source("ip-spinmem-psc",bi("Spin Memory：PSC 與 skyrmionic 增強層專利","Spin Memory: PSC and Skyrmionic Enhancement Patent"),"https://patents.google.com/patent/US10468588B2/en",bi("公開專利","Public patent"),null,bi("圖 3；權利項 1、8、20；原始申請人 Spin Memory Inc","Figure 3; claims 1, 8 and 20; original assignee Spin Memory Inc"),bi("限定含 PSC、耦合層與增強層的實施例；不保證次 3ns、耐久或商用量產。","Limited to the PSC, coupling-layer and enhancement-layer embodiment; no sub-3ns, endurance or production guarantee."),"2026-10-09"),
  crocusPat:source("ip-crocus-tas",bi("Crocus：具加熱元件與熱障壁的 TAS-MRAM 專利","Crocus: TAS-MRAM with Heating Elements and Thermal Barriers"),"https://patents.google.com/patent/US8717812B2/en",bi("公開專利","Public patent"),null,bi("圖 1、2；權利項 1；TAS 寫入與冷卻鎖定說明","Figures 1 and 2; claim 1; TAS writing and cooling description"),bi("加熱選址與磁態設定須分開；本教案採磁場輔助 TAS，並非一般 STT 或 SOT。專利另述熱輔助 STT 變體。","Separate thermal selection from magnetic setting; this lesson uses field-assisted TAS, not ordinary STT or SOT. The patent also discusses thermally assisted STT variants."),"2026-10-09"),
  panaPat:source("ip-panasonic-taox",bi("Panasonic：安全 LSI 用高速低功耗 ReRAM 技報","Panasonic: High-Speed Low-Power ReRAM for Security LSIs"),"https://tech.panasonic.com/jp/phd/pdf/technology-journal/v6302/p0112.pdf",bi("原廠技術論文","Vendor technical paper"),null,bi("Panasonic Technical Journal 63(2), 2017-11；PDF 第 2–4 頁圖 2、3、6","Panasonic Technical Journal 63(2), November 2017; PDF pages 2–4, figures 2, 3 and 6"),bi("支持 Ta2O5/TaOx 與氧相關微絲模型；40nm 研究載具不等於所有商品或量產節點。","Supports Ta2O5/TaOx and an oxygen-related filament model; the 40nm research vehicle does not establish every product or production node."),"2026-10-09"),
  tetraPat:source("ip-tetramem-cim",bi("TetraMem：多階 RRAM 類比記憶體內運算","TetraMem: Multi-Level RRAM Analog In-Memory Computing"),"https://tetramem.com/rebuilding-ai-hardware/",bi("原廠技術說明","Vendor technology explanation"),null,bi("Multi-level RRAM 與類比運算段落","Multi-level RRAM and analog computing sections"),bi("支持多階電導與類比運算；未揭露本圖的氧空缺幾何、精確障壁或通用 256 階規格。","Supports multi-level conductance and analog computing; no vacancy geometry, exact barrier or universal 256-level specification is established."),"2026-10-09"),
  fourdsPat:source("ip-4ds-pcmo",bi("4DS：PCMO 面積型介面切換技術","4DS: PCMO Area-Based Interface Switching"),"https://www.4dsmemory.com/technology/4ds-technology/",bi("原廠技術說明","Vendor technology explanation"),null,bi("PCMO and Area Based Interface Switching","PCMO and Area Based Interface Switching"),bi("原廠描述氧進入位點時 SET、氧耗盡時 RESET；不支持精確化學比例、通用肖特基曲線或無 Forming 保證。","The vendor describes SET when oxygen occupies sites and RESET on oxygen depletion; no exact stoichiometry, universal Schottky curve or forming-free guarantee is established."),"2026-10-09"),
  adestoPat:source("ip-adesto-cbram",bi("Adesto：CBRAM 可靠度研究公告","Adesto: CBRAM Reliability Research Announcement"),"https://www.renesas.com/en/about/newsroom/adesto-demonstrates-resistive-ram-technology-targeting-high-reliability-applications-such-automotive",bi("原廠研究公告","Vendor research announcement"),null,bi("CBRAM 研究與歷史 IoT 商品敘述","CBRAM research and historical IoT commercialization paragraphs"),bi("支持 CBRAM 技術與歷史商品；此公告不揭露通用銅堆疊、1µA、TΩ 或現行 MCU 整合。","Supports CBRAM and historical products; the announcement does not disclose a universal copper stack, 1µA, TΩ or current MCU integration."),"2026-10-09")
};

function localSources(keys,language) {
  return keys.map(key=>Object.fromEntries(Object.entries(SOURCES[key]).map(([field,value])=>[field,value && typeof value==='object'?pick(value,language):value])));
}
const META = {
  'numem-mram':{
    name:bi('Numem MRAM IP：STT 教材重建','Numem MRAM IP: STT Teaching Reconstruction'),
    model:bi('公開 IP 架構＋未指定材料的 STT 模型','Public IP Architecture + Material-Unspecified STT Model'),
    mechanism:bi('MTJ 自由層磁化保存資訊','MTJ free-layer magnetization stores information'),
    structure:bi('以 FL／穿隧障壁／RL 畫出 STT 功能；A、B 是教材端點。WL／BL／SL 依 Numem 2019 年架構，未指定實際層對線映射。','FL/tunnel barrier/RL represent STT functions; A/B are teaching terminals. WL/BL/SL follow the 2019 Numem architecture without claiming a layer-to-line mapping.'),
    caveat:bi('這是 Numem 公開 IP 架構的教學重建。材料、厚度、上下層序、寫入端點極性及邏輯編碼未由現行來源公開；方向 A/B 僅表示校準後的兩種反向驅動。2019 年定電流感測不是全系列規格。','This reconstructs the public Numem IP architecture for teaching. Current sources do not disclose materials, thicknesses, vertical order, write-terminal polarity, or logic encoding. Directions A/B mean two calibrated opposite drives. The 2019 forced-current read is not a specification for every product.'),
    refs:['numem','numem2019','stt']
  },
  'gf-emram':{
    name:bi('GF 22FDX eMRAM：公開研究單元','GF 22FDX eMRAM: Published Research Cell'),
    model:bi('22FDX：CoFeB／障壁／CoFeB 與 SAF','22FDX: CoFeB/Barrier/CoFeB and SAF'),
    mechanism:bi('1T1MTJ 的 P／AP 磁態與電阻','P/AP magnetization and resistance in 1T1MTJ'),
    structure:bi('2024 年原始研究採用 CoFeB 自由層、穿隧障壁、由 SAF 固定的 CoFeB 參考層與選擇電晶體。層在圖中的上下位置是示意座標。','The 2024 research uses CoFeB free/reference layers, a tunnel barrier, SAF pinning, and an access transistor. Their vertical placement here defines a drawing coordinate.'),
    caveat:bi('極性遵循這篇研究：正向 Ic 由 RL 流向 FL，寫入 P；反向寫入 AP。未把此符號或配方推廣到所有 MRAM。BL／SL 的層對端點映射及數值依正式 PDK；圖不給未公開障壁材料或精確厚度。','Polarity follows this paper: positive Ic flows RL-to-FL and writes P; reverse writes AP. This sign convention and recipe are not universal to MRAM. Obtain BL/SL layer mapping and values from the PDK; undisclosed barrier material and exact thicknesses are omitted.'),
    refs:['gf','gf2024']
  },
  'everspin-mram':{
    name:bi('Everspin pMTJ STT-MRAM 教學單元','Everspin pMTJ STT-MRAM Teaching Cell'),
    model:bi('垂直 MTJ 功能層模型','Perpendicular MTJ Functional-Layer Model'),
    mechanism:bi('STT 調整自由層磁矩，以 P／AP 電阻區分狀態','STT changes the free-layer moment; P/AP resistance distinguishes states'),
    structure:bi('功能層僅作教學示意；材料、層序與專利對應尚未核實，不代表原廠單元剖面。','Functional layers are teaching abstractions; materials, layer order, and patent mapping remain unverified and do not represent a vendor cell cross-section.'),
    caveat:bi('原廠支持 pMTJ 與雙向 STT；圖未指定雙 MgO、材料配方、薄膜厚度或通用熱預算。','The vendor supports pMTJ and bidirectional STT; the drawing does not assign dual MgO, material recipes, thicknesses, or a universal thermal budget.'),
    refs:['everspinPat','everspinProd','stt']
  },
  'avalanche-mram':{
    name:bi('Avalanche STT-MRAM 功能教學單元','Avalanche STT-MRAM Functional Teaching Cell'),
    model:bi('未指定材料的 STT 功能層','Material-Unspecified STT Functional Layers'),
    mechanism:bi('STT 調整自由層磁矩，讀取 MTJ 電阻態','STT changes the free-layer moment; reading senses MTJ resistance'),
    structure:bi('功能層僅作教學示意；材料、層序與專利對應尚未核實，不代表原廠單元剖面。','Functional layers are teaching abstractions; materials, layer order, and patent mapping remain unverified and do not represent a vendor cell cross-section.'),
    caveat:bi('原廠來源僅支持 STT-MRAM 定位；此圖未重建 Dual-SAF、雙障壁或宣稱定量改善。','The vendor source supports STT-MRAM positioning only; this drawing does not reconstruct dual-SAF or dual barriers or claim a quantitative improvement.'),
    refs:['avalanchePat','stt']
  },
  'spinmem-mram':{
    name:bi('Spin Memory PSC 公開專利功能示意','Spin Memory PSC Published-Patent Functional Model'),
    model:bi('PSC、耦合層與增強層功能示意','PSC, Coupling and Enhancement Functional Layers'),
    mechanism:bi('專利實施例以 PSC 與增強層輔助磁態切換','The patent embodiment uses PSC and enhancement functions to assist magnetic switching'),
    structure:bi('依 US10468588B2 圖 3 與權利項 1、8、20 表示 PSC、耦合層與 skyrmionic 增強層功能；圖層位置與厚度為教學配置。','PSC, coupling and skyrmionic enhancement functions follow US10468588B2 Figure 3 and claims 1, 8 and 20; placement and thickness are teaching abstractions.'),
    caveat:bi('限定此專利實施例；未宣稱通用面內極化器、次 3ns 速度、耐久或現行量產配方。','Limited to this patent embodiment; no generic in-plane polarizer, sub-3ns speed, endurance, or current production recipe is asserted.'),
    refs:['spinmemPat','stt']
  },
  'crocus-mram':{
    name:bi('Crocus TAS-MRAM 熱輔助阻變單元','Crocus TAS-MRAM Thermally Assisted Cell'),
    model:bi('加熱電極 ＋ AFM 阻斷溫度 (Tb) 交換偏置鎖定','Heater Line + AFM Blocking Temperature (Tb) Exchange-Bias Pinning'),
    mechanism:bi('加熱越過 Tb 解鎖儲存層；外加寫入場翻轉後冷卻鎖定','Heat above Tb to unlock the storage layer; an applied write field reverses it before cooling locks it'),
    structure:bi('功能層僅作教學示意；材料、層序與專利對應尚未核實，不代表原廠單元剖面。','Functional layers are teaching abstractions; materials, layer order, and patent mapping remain unverified and do not represent a vendor cell cross-section.'),
    caveat:bi('此為 TAS 功能教學序列；加熱路徑、磁場線與層序未重建原廠版圖，不提供未核實溫度、時間或寫入電流。','This TAS teaching sequence abstracts heating and field functions; it does not reconstruct vendor layout or specify unverified temperature, timing, or write current.'),
    refs:['crocusPat']
  },
  'weebit-reram':{
    name:bi('Weebit ReRAM IP：CEA 研究單元','Weebit ReRAM IP: CEA Research Cell'),
    model:bi('Ti／SiOx／TiN：具氧交換界面的 1T1R','Ti/SiOx/TiN: 1T1R with an Oxygen-Exchange Interface'),
    mechanism:bi('氧離子交換與氧空缺導電路徑','Oxygen-ion exchange and an oxygen-vacancy conduction path'),
    structure:bi('採用原廠共同發表的 CEA 130nm 1T1R：Ti 上電極、SiOx 切換層、TiN 下電極。選擇電晶體提供選取與限流。','Uses the coauthored CEA 130nm 1T1R: Ti top electrode, SiOx switching layer, and TiN bottom electrode. The access transistor selects and limits current.'),
    caveat:bi('此為 Weebit／CEA-Leti／Silvaco 公開研究模型，不是所有代工節點的產品配方。SET：正 TE，O²− 朝 Ti；RESET：負 TE，氧回入 SiOx，在靠近 BE 的路徑處復合。成形只作初始條件，不列為每次寫入。','This is the public Weebit/CEA-Leti/Silvaco research model, not a product recipe for every foundry node. SET: positive TE, O²− toward Ti. RESET: negative TE, oxygen returns into SiOx and recombines near the BE-side path. Forming is an initial condition, not every write.'),
    refs:['weebit','weebitCell','weebit2021']
  },
  'crossbar-reram':{
    name:bi('Crossbar ReRAM IP：歷史專利單元','Crossbar ReRAM IP: Historical Patent Cell'),
    model:bi('Ag／a-Si／p+ poly-Si：粒子路徑的 1T1R 示意','Ag/a-Si/p+ poly-Si: 1T1R Particle-Path Model'),
    mechanism:bi('上端金屬區延伸／回縮，改變粒子間穿隧路徑','Extension/retraction from an upper metal region changes interparticle tunneling'),
    structure:bi('選取 US20120007035A1 的 Ag／非晶矽／p+ 多晶矽實施例；外接選擇電晶體表達原廠公開的嵌入式 1T1R 整合。','Selects the Ag/amorphous-Si/p+ poly-Si embodiment of US20120007035A1; an access transistor represents the separately published embedded 1T1R integration.'),
    caveat:bi('這是歷史嵌入式 IP 的公開專利實施例，不證明現售宏配方或 2026 年可新授權節點。專利以金屬粒子與粒子間穿隧描述路徑；未把路徑等同完整實心銀橋，也未指定一般 ECM 的陰極起始成核。','This is a published patent embodiment associated with historical embedded IP, not proof of current macro recipes or newly licensable nodes in 2026. The patent describes metal particles and interparticle tunneling; the path is not equated to a solid silver bridge or generic cathode-nucleated ECM.'),
    refs:['crossbar','crossbar2015','crossbar2012']
  },
  'panasonic-reram':{
    name:bi('Panasonic 雙層鉭氧化物 (Ta2O5/TaOx) ReRAM 單元','Panasonic Bilayer Tantalum Oxide (Ta2O5/TaOx) ReRAM Cell'),
    model:bi('Ta2O5／TaOx 雙層功能示意','Ta2O5/TaOx Bilayer Functional Model'),
    mechanism:bi('氧相關導電微絲改變阻態','An oxygen-related conductive filament changes resistance'),
    structure:bi('依 Panasonic 公開技報表示 Ta2O5／TaOx 與氧相關微絲；電極材料及層厚不在圖中指定。','Ta2O5/TaOx and an oxygen-related filament follow the Panasonic technical paper; electrode materials and layer thicknesses are unspecified.'),
    caveat:bi('限公開研究模型；40nm 研究載具不代表所有商品、量產節點或單元配方。','Limited to the published research model; a 40nm research vehicle does not establish every product, production node, or cell recipe.'),
    refs:['panaPat']
  },
  'tetramem-reram':{
    name:bi('TetraMem 類比多階電導教學單元','TetraMem Analog Multi-Level Conductance Teaching Cell'),
    model:bi('類比電導功能教學模型','Analog Conductance Teaching Model'),
    mechanism:bi('以可調類比電導表達運算權重；微觀載子機制未核實','Adjustable analog conductance represents compute weights; microscopic carrier mechanism is unverified'),
    structure:bi('功能層僅作教學示意；材料、層序與專利對應尚未核實，不代表原廠單元剖面。','Functional layers are teaching abstractions; materials, layer order, and patent mapping remain unverified and do not represent a vendor cell cross-section.'),
    caveat:bi('原廠支持多階 RRAM 與類比運算；圖中相對電導與功能層不代表位元精度、氧空缺幾何或原廠材料堆疊。','The vendor supports multi-level RRAM and analog computing; relative conductance and functional layers do not establish bit precision, vacancy geometry, or vendor material stacks.'),
    refs:['tetraPat']
  },
  '4ds-reram':{
    name:bi('4DS Memory 非微絲面積型 PCMO ReRAM 單元','4DS Memory Non-Filamentary Area-Dependent PCMO Cell'),
    model:bi('PCMO 介面阻態功能示意','PCMO Interface Resistance Teaching Model'),
    mechanism:bi('介面氧分布改變阻態；障壁陰影僅作教學類比','Interface oxygen distribution changes resistance; barrier shading is only a teaching analogy'),
    structure:bi('功能層僅作教學示意；材料、層序與專利對應尚未核實，不代表原廠單元剖面。','Functional layers are teaching abstractions; materials, layer order, and patent mapping remain unverified and do not represent a vendor cell cross-section.'),
    caveat:bi('原廠描述氧進入位點時 SET、氧耗盡時 RESET；障壁陰影僅為定性阻態類比，不證明肖特基曲線、精確化學比例或免成形。','The vendor describes SET on oxygen site occupancy and RESET on depletion; barrier shading is only a qualitative resistance analogy and does not establish Schottky curves, exact stoichiometry, or forming-free behavior.'),
    refs:['fourdsPat']
  },
  'adesto-cbram':{
    name:bi('Adesto CBRAM 導電橋功能教學單元','Adesto CBRAM Conductive-Bridge Teaching Cell'),
    model:bi('活性金屬／電解質／對向電極功能示意','Active Metal / Electrolyte / Counter-Electrode Functional Model'),
    mechanism:bi('以金屬橋生成與溶解表達 CBRAM 家族機制','Metal-bridge formation and dissolution illustrate the CBRAM family mechanism'),
    structure:bi('功能層僅作教學示意；材料、層序與專利對應尚未核實，不代表原廠單元剖面。','Functional layers are teaching abstractions; materials, layer order, and patent mapping remain unverified and do not represent a vendor cell cross-section.'),
    caveat:bi('原廠公告支持 CBRAM 與歷史產品；此為家族機制示意，未指定銅／鎢配方、電流、TΩ 電阻或現行 MCU 整合。','The vendor announcement supports CBRAM and historical products; this family-level model does not assign a copper/tungsten recipe, current, tera-ohm resistance, or current MCU integration.'),
    refs:['adestoPat']
  }
};

function canvas(id,operation,language,index) {
  const prefix=`ip-study-${id}-${operation}-${index}-${language}`;
  const t=(x,y,value,anchor='start',color=C.ink)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="22">${esc(value)}</text>`;
  const path=(d,color=C.line,width=2.2,fill='none',extra='')=>`<path d="${d}" stroke="${color}" stroke-width="${width}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const line=(x1,y1,x2,y2,color=C.line,width=2.2,extra='')=>path(`M${x1} ${y1}L${x2} ${y2}`,color,width,'none',extra);
  const rect=(x,y,w,h,fill=C.white,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.line}" stroke-width="1.5" ${extra}/>`;
  const dot=(x,y,r,color,extra='')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${extra}/>`;
  const arrow=(x1,y1,x2,y2,color=C.current,width=3,extra='')=>{
    const a=Math.atan2(y2-y1,x2-x1),s=9;
    return line(x1,y1,x2,y2,color,width,extra)+path(`M${x2-s*Math.cos(a-.5)} ${y2-s*Math.sin(a-.5)}L${x2} ${y2}L${x2-s*Math.cos(a+.5)} ${y2-s*Math.sin(a+.5)}`,color,width);
  };
  const moment=(x,y,angle,color=C.free)=>{
    const a=angle*Math.PI/180,dx=14*Math.cos(a),dy=-14*Math.sin(a);
    return arrow(x-dx,y-dy,x+dx,y+dy,color,4);
  };
  const text=(x,y,zh,en,anchor='start',color=C.ink)=>t(x,y,language==='zh'?zh:en,anchor,color);
  return {prefix,t,text,path,line,rect,dot,arrow,moment};
}

function svg(c,title,caption,body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" id="${c.prefix}" viewBox="0 0 560 360" role="img" aria-labelledby="${c.prefix}-title ${c.prefix}-desc"><title id="${c.prefix}-title">${esc(title)}</title><desc id="${c.prefix}-desc">${esc(caption)}</desc><style>#${c.prefix} text{font-family:Arial,'Microsoft JhengHei',sans-serif;font-size:22px}#${c.prefix}{background:#fff;color:${C.ink}}</style>${c.rect(1,1,558,358,C.white,'rx="14"')}${body}</svg>`;
}
function access(c,on,topY=216,terminal='B') {
  return c.line(265,topY,265,243)+c.line(265,243,256,253)+c.line(256,253,256,287,on?C.current:C.line,on?4:2,'stroke-dasharray="6 3"')+c.line(256,287,265,299)+c.line(240,250,240,290)+c.line(187,270,240,270)+c.line(265,299,465,299)+c.t(122,278,'WL')+c.t(482,307,terminal)+c.t(287,279,on?'ON':'OFF', 'start',on?C.current:C.muted);
}
function pulse(c,index,negative=false) {
  const y=333,x=25;
  const points=negative?`M${x} ${y-17}h60v17h240v-17h70`:`M${x} ${y}h60v-17h240v17h70`;
  return c.path(points,C.line,2)+c.line([50,140,250,365][index],310,[50,140,250,365][index],343,C.current,2)+c.t(416,339,'t →');
}
function flow(c,direction,read=false) {
  const y1=92,y2=191,a=direction>0?y1:y2,b=direction>0?y2:y1,color=read?C.electron:C.current;
  return c.arrow(405,a,405,b,color,read?2.5:4)+c.arrow(470,b,470,a,C.electron,2.5,'stroke-dasharray="6 5"')+c.t(405,223,read?'Ir':'Ic','middle',color)+c.t(470,223,'e−','middle',C.electron);
}
function mtj(c,id,angle,on,bias,drive=0,read=false,torque=false) {
  let out='';
  if(id==='everspin-mram'||id==='avalanche-mram') {
    out+=c.line(265,40,265,79)+c.t(248,54,'A','end')+c.t(282,54,bias);
    out+=c.rect(180,79,170,42,'#d9efee')+c.text(20,108,'自由層 FL','Free Layer');
    out+=c.rect(180,121,170,27,C.oxide)+c.text(20,141,'穿隧障壁','Barrier');
    out+=c.rect(180,148,170,42,'#e2e8f4')+c.text(20,177,'參考層 RL','Reference');
    out+=c.moment(265,100,angle)+c.moment(265,169,90,C.ref)+access(c,on,190,'B');
  } else if(id==='spinmem-mram') {
    out+=c.line(265,20,265,46)+c.t(248,36,'A','end')+c.t(282,36,bias);
    out+=c.rect(180,46,170,24,'#ebdcf5')+c.t(20,65,'PSC');
    out+=c.rect(180,70,170,22,C.metal)+c.text(20,88,'耦合功能','Coupling');
    out+=c.rect(180,92,170,22,'#e3d4eb')+c.text(20,110,'增強功能','Enhancement');
    out+=c.rect(180,114,170,32,'#d9efee')+c.t(20,137,'FL');
    out+=c.rect(180,146,170,24,C.oxide)+c.text(20,165,'穿隧障壁','Barrier');
    out+=c.rect(180,170,170,32,'#e2e8f4')+c.t(20,192,'RL');
    out+=c.moment(265,130,angle)+c.moment(265,186,90,C.ref)+access(c,on,202,'B');
  } else if(id==='crocus-mram') {
    out+=c.line(265,20,265,46)+c.t(248,36,'BL','end')+c.t(282,36,bias);
    out+=c.rect(180,46,170,28,'#fbe6d4')+c.text(20,66,'加熱功能','Heating');
    out+=c.rect(180,74,170,28,'#ebd0d0')+c.t(20,95,'AFM (Tb)');
    out+=c.rect(180,102,170,38,'#d9efee')+c.t(20,127,'Storage FL');
    out+=c.rect(180,140,170,26,C.oxide)+c.text(20,158,'穿隧障壁','Barrier');
    out+=c.rect(180,166,170,38,'#e2e8f4')+c.t(20,191,'Pinned RL');
    out+=c.moment(265,121,angle)+c.moment(265,185,90,C.ref);
    out+=access(c,on,204,'SL');
  } else {
    out+=c.line(265,46,265,79)+c.t(286,54,bias);
    const gf=id==='gf-emram';
    out+=c.t(20,54,gf?'A / BL*':'A / BL*');
    out+=c.rect(180,79,170,42,'#d9efee')+c.rect(180,121,170,27,C.oxide)+c.rect(180,148,170,42,'#e2e8f4');
    out+=c.t(20,108,gf?'CoFeB FL':'FL')+c.text(20,141,'穿隧障壁','Barrier')+c.t(20,177,gf?'CoFeB RL':'RL');
    out+=c.moment(265,100,angle)+c.moment(265,169,90,C.ref);
    if(gf) out+=c.rect(180,190,170,26,'#edf0f7')+c.t(20,211,'SAF')+c.arrow(240,212,240,194,C.ref,2.2)+c.arrow(290,194,290,212,C.ref,2.2);
    else out+=c.line(265,190,265,216);
    out+=access(c,on,216,'B / SL*');
  }
  if(drive) out+=flow(c,drive,read);
  if(torque) out+=c.path('M304 88C321 89 322 108 308 111',C.spin,3)+c.arrow(313,111,306,111,C.spin,3)+c.t(360,75,'τSTT','start',C.spin);
  return out;
}
function ion(c,x,y,kind) {
  if(kind==='vacancy') return c.dot(x,y,7,C.white,`stroke="${C.vacancy}" stroke-width="2.6"`);
  if(kind==='oxygen') return c.dot(x,y,6,C.oxygen)+c.line(x-3,y,x+3,y,C.white,1.5);
  if(kind==='copper') return c.dot(x,y,6,C.copper);
  return c.dot(x,y,6,C.silver);
}
function reram(c,id,on,bias,stage,operation,drive=0) {
  let out=c.line(265,47,265,79)+c.t(20,54,'TE')+c.t(286,55,bias);
  if(id==='panasonic-reram') {
    out+=c.rect(180,79,170,28,C.metal)+c.t(20,98,'TE');
    out+=c.rect(180,107,170,32,'#fdeee2')+c.t(20,128,'Ta2O5');
    out+=c.rect(180,139,170,72,'#e5eff4')+c.t(20,182,'TaOx');
    out+=c.rect(180,211,170,28,C.metal)+c.t(20,231,'BE');
    out+=access(c,on,239,'BE / SL');
    const set=operation==='write',read=operation==='read'||operation==='structure';
    const gap=read?false:set?stage<=1:stage>=2;
    const ys=[115,127,148,168,188].filter(y=>!gap||y>130);
    for(const y of ys) out+=ion(c,265,y,'vacancy');
    if(set&&stage===1) out+=ion(c,276,128,'oxygen')+c.arrow(288,125,288,165,C.oxygen,3);
    if(operation==='erase'&&stage===1) out+=ion(c,276,160,'oxygen')+c.arrow(288,160,288,120,C.oxygen,3);
    if(gap) out+=c.text(366,130,'氧化截斷','Oxidized Gap');
  } else if(id==='tetramem-reram') {
    out+=c.rect(180,79,170,28,C.metal)+c.t(20,98,'Top Electrode');
    out+=c.rect(180,107,170,38,'#fcf1d8')+c.t(20,132,'Barrier Layer');
    out+=c.rect(180,145,170,66,'#eaf2f8')+c.t(20,185,'Oxide Medium');
    out+=c.rect(180,211,170,28,C.metal)+c.t(20,231,'Bottom Electrode');
    out+=access(c,on,239,'BE / SL');
    const g=operation==='read'||operation==='structure'?0.65:(operation==='erase'?[0.8,0.5,0.2,0.2]:[0.2,0.5,0.8,0.8])[stage];
    out+=`<g data-state="analog-conductance" data-g="${g}">`;
    out+=c.rect(202,158,126,28,C.oxide)+c.rect(202,158,126*g,28,C.free);
    out+=c.text(365,160,'相對電導 G','Relative G')+c.t(365,190,g.toFixed(2));
    out+='</g>';
  } else if(id==='4ds-reram') {
    out+=c.rect(180,79,170,28,C.metal)+c.text(20,98,'上接點','Top Contact');
    out+=c.rect(180,107,170,104,'#efe6f3')+c.t(20,165,'PCMO');
    out+=c.rect(180,211,170,28,C.metal)+c.text(20,231,'下接點','Bottom Contact');
    out+=access(c,on,239,'BE / SL');
    const barrier=operation==='read'||operation==='structure'?0.25:(operation==='erase'?[0.25,0.5,0.8,0.8]:[0.8,0.5,0.25,0.25])[stage];
    const height=12+barrier*60;
    out+=`<g data-state="interface-barrier" data-barrier="${barrier}">`;
    out+=c.rect(200,111,130,height,'#efd7bb')+c.path(`M200 ${111+height}Q265 ${115+height} 330 ${111+height}`,C.current,3);
    out+=c.text(365,130,'介面障壁','Interface Barrier')+c.t(365,160,barrier.toFixed(2));
    out+='</g>';
  } else if(id==='adesto-cbram') {
    out+=c.rect(180,79,170,28,'#f2d0ba')+c.t(20,98,'Active Metal');
    out+=c.rect(180,107,170,104,'#eef6f6')+c.text(20,165,'電解質','Electrolyte');
    out+=c.rect(180,211,170,28,'#ccd5de')+c.t(20,231,'BE');
    out+=access(c,on,239,'BE / SL');
    const read=operation==='read'||operation==='structure',set=operation==='write';
    const end=read?205:set?[140,165,205,205][stage]:[205,175,140,140][stage];
    for(let y=115;y<=end;y+=15) out+=ion(c,265+(y%4-1.5)*2,y,'copper');
    if((set||operation==='erase')&&stage===1) out+=c.arrow(302,set?120:190,302,set?190:120,C.copper,3)+c.t(363,165,'M+');
    if(end<180) out+=c.text(365,190,'奈米橋間隙','Bridge Gap');
  } else {
    const wb=id==='weebit-reram';
    out+=c.rect(180,79,170,34,C.metal)+c.rect(180,113,170,99,C.oxide)+c.rect(180,212,170,29,C.metal);
    out+=c.t(20,102,wb?'Ti':'Ag')+c.t(20,167,wb?'SiOx':'a-Si')+c.t(20,234,wb?'TiN':'p+ poly-Si');
    out+=access(c,on,241,'BE / SL');
    if(wb){
      const set=operation==='write',read=operation==='read'||operation==='structure';
      const gap=read?false:set?stage<=1:stage>=2;
      const ys=[122,141,160,179,199].filter(y=>!gap||y<179);
      for(const y of ys) out+=ion(c,265,y,'vacancy');
      for(const [x,y] of [[206,129],[227,174],[317,151],[302,195]]) out+=ion(c,x,y,'oxygen');
      if(set&&stage===1) out+=ion(c,276,195,'oxygen')+c.arrow(288,190,288,127,C.oxygen,3);
      if(set&&stage>=2) out+=ion(c,283,111,'oxygen')+ion(c,307,111,'oxygen');
      if(operation==='erase'&&stage===1) out+=ion(c,284,128,'oxygen')+c.arrow(288,126,288,195,C.oxygen,3);
      if(operation==='erase'&&stage>=2) out+=ion(c,265,194,'oxygen')+c.path('M250 183H280M250 205H280',C.current,2.3);
      if(gap) out+=c.text(366,262,'間隙','Gap');
    } else {
      out+=c.path('M246 113L282 113L274 143L256 147Z',C.silver,1,C.silver);
      const read=operation==='read'||operation==='structure',set=operation==='write';
      const end=read?204:set?[157,177,204,204][stage]:[204,181,158,158][stage];
      for(let y=153;y<=end;y+=13) out+=ion(c,265+(y%3-1)*2,y,'silver');
      if((set||operation==='erase')&&stage===1) out+=c.arrow(302,set?149:200,302,set?199:148,C.silver,3)+c.t(363,174,'Ag');
      if(end<190) out+=c.path('M247 189H283M247 206H283',C.current,2.3)+c.text(365,262,'間隙','Gap');
    }
  }
  if(drive)out+=flow(c,drive,operation==='read');
  return out;
}
const MRAM_LEGEND=[
  ['FL / RL',bi('自由層／參考層；箭頭是磁矩，不是粒子流','Free/reference layers; arrows are moments, not particle flow')],
  ['Ic / e−',bi('橘色實線為傳統電流；藍色虛線電子流方向相反','Orange solid line: conventional current; blue dashed electrons flow oppositely')],
  ['A / B; BL* / SL*',bi('A/B 定義教材接面座標；星號表示未宣稱實際層對陣列線映射','A/B define drawing terminals; asterisks mean the actual layer-to-array-line mapping is not asserted')],
  ['WL; P / AP',bi('字元線選取；平行低阻／反平行高阻','Word-line selection; parallel low resistance / antiparallel high resistance')],
  ['τSTT',bi('自旋轉移力矩；中間箭頭只是翻轉過程示意','Spin-transfer torque; the intermediate arrow only illustrates reversal')]
];
const EVERSPIN_LEGEND=[
  ['FL / RL',bi('自由層與參考層；箭頭表示磁矩','Free and reference layers; arrows represent magnetic moments')],
  ['Barrier',bi('穿隧障壁；材料與厚度未指定','Tunnel barrier; material and thickness are unspecified')],
  ['Ic / e−',bi('傳統電流與電子流方向相反','Conventional current and electron flow have opposite directions')]
];
const AVALANCHE_LEGEND=EVERSPIN_LEGEND;
const SPINMEM_LEGEND=[
  ['PSC',bi('專利實施例的進動自旋流功能','Precessional spin-current function in the patent embodiment')],
  ['Coupling / Enhancement',bi('耦合與 skyrmionic 增強功能；非原廠比例剖面','Coupling and skyrmionic enhancement functions; not a scaled vendor cross-section')],
  ['FL / RL',bi('儲存與參考磁矩；中間角度只作操作示意','Storage and reference moments; intermediate angles are only schematic')]
];
const CROCUS_LEGEND=[
  ['Heating',bi('加熱電阻脈衝將局域溫度升高超過阻斷溫度 Tb','Heating pulse raises temperature above blocking temperature Tb')],
  ['AFM (Tb)',bi('反鐵磁層在常溫下以交換偏置場鎖定儲存層','Antiferromagnetic layer locks storage layer via exchange bias below Tb')],
  ['Hwrite / Storage FL',bi('加熱解鎖後由外加寫入場定向；冷卻鎖定後撤場','An applied write field orients thermally unlocked storage; remove the field after cooling locks it')]
];
const WB_LEGEND=[
  ['Ti / SiOx / TiN',bi('上電極／切換氧化物／下電極；僅限公開 CEA 範例','Top electrode/switching oxide/bottom electrode, limited to the public CEA example')],
  ['O²− / VO',bi('藍色實心圓為氧離子；橘色空心圓為氧空缺，沒有金屬銀','Filled blue circles are oxygen ions; open orange circles are vacancies, with no silver metal')],
  ['TE / BE; WL',bi('上／下電極及選擇閘極；TE 偏壓以 BE 為基準','Top/bottom electrodes and select gate; TE bias is referenced to BE')],
  ['Ic / e−',bi('傳統電流與電子流方向相反；不是氧離子移動方向','Conventional current and electrons flow oppositely; neither denotes oxygen motion')]
];
const PANA_LEGEND=[
  ['TE / BE',bi('上、下電極；材料未指定','Top and bottom electrodes; materials unspecified')],
  ['Ta2O5 / TaOx',bi('公開研究的雙層氧化鉭示意；厚度非比例','Published-research tantalum-oxide bilayer; thicknesses not to scale')],
  ['O / VO',bi('氧與氧空缺表達微絲模型','Oxygen and vacancies illustrate the filament model')]
];
const TETRA_LEGEND=[
  ['Barrier / Oxide',bi('功能層示意；材料與層序尚未核實','Functional-layer abstraction; materials and layer order remain unverified')],
  ['Relative G',bi('相對類比電導；長條與數值不是量測或精度規格','Relative analog conductance; bar and values are not measurements or precision specifications')],
  ['CIM',bi('以電導表示類比運算權重','Conductance represents an analog compute weight')]
];
const FOURDS_LEGEND=[
  ['PCMO',bi('原廠所述介面記憶體材料；不指定未核實化學比例','Vendor-described interface-memory material; unverified chemical ratios are omitted')],
  ['Interface Barrier',bi('陰影僅表示阻態變化；非已核實肖特基能障量測','Shading represents resistance change, not verified Schottky-barrier measurements')],
  ['O',bi('氧進入位點對應 SET，氧耗盡對應 RESET；幾何非比例','Oxygen entering sites corresponds to SET; depletion corresponds to RESET; geometry is not to scale')]
];
const CB_LEGEND=[
  ['Ag / a-Si / p+ poly-Si',bi('銀上電極／非晶矽／選定的下端緩衝與接點實施例','Silver top electrode/amorphous silicon/selected lower buffer-contact embodiment')],
  ['Ag',bi('紫色實心區與圓點表示金屬區與粒子；不指定粒子電荷態','Purple region and dots denote metal region/particles without asserting each charge state')],
  ['TE / BE; WL',bi('上／下電極與選擇閘極；1T1R 整合是原廠另一公開來源','Top/bottom electrodes and select gate; 1T1R integration has a separate manufacturer source')],
  ['Ic / e−',bi('傳統電流與電子方向相反；電子可在相鄰粒子間穿隧','Conventional current opposes electron motion; electrons may tunnel between neighboring particles')]
];
const ADESTO_LEGEND=[
  ['Active Metal',bi('活性金屬功能；未指定銅配方','Active-metal function; no copper recipe is assigned')],
  ['Electrolyte',bi('離子移動介質的功能示意','Functional illustration of the ion-transport medium')],
  ['Bridge',bi('導電橋生成與溶解；不指定電流或阻值規格','Bridge formation and dissolution; no current or resistance specification is assigned')]
];
const legendFor=(id,language)=>{
  if(id==='everspin-mram') return EVERSPIN_LEGEND.map(([s,m])=>({symbol:s,meaning:pick(m,language)}));
  if(id==='avalanche-mram') return AVALANCHE_LEGEND.map(([s,m])=>({symbol:s,meaning:pick(m,language)}));
  if(id==='spinmem-mram') return SPINMEM_LEGEND.map(([s,m])=>({symbol:s,meaning:pick(m,language)}));
  if(id==='crocus-mram') return CROCUS_LEGEND.map(([s,m])=>({symbol:s,meaning:pick(m,language)}));
  if(id==='weebit-reram') return WB_LEGEND.map(([s,m])=>({symbol:s,meaning:pick(m,language)}));
  if(id==='panasonic-reram') return PANA_LEGEND.map(([s,m])=>({symbol:s,meaning:pick(m,language)}));
  if(id==='tetramem-reram') return TETRA_LEGEND.map(([s,m])=>({symbol:s,meaning:pick(m,language)}));
  if(id==='4ds-reram') return FOURDS_LEGEND.map(([s,m])=>({symbol:s,meaning:pick(m,language)}));
  if(id==='crossbar-reram') return CB_LEGEND.map(([s,m])=>({symbol:s,meaning:pick(m,language)}));
  if(id==='adesto-cbram') return ADESTO_LEGEND.map(([s,m])=>({symbol:s,meaning:pick(m,language)}));
  return MRAM_LEGEND.map(([s,m])=>({symbol:s,meaning:pick(m,language)}));
};

function record(c,title,caption,state,stimulus,body,language,sourceIds) {
  const localTitle=pick(title,language),localCaption=pick(caption,language);
  return {id:c.prefix,title:localTitle,state:pick(state,language),stimulus:pick(stimulus,language),caption:localCaption,svg:svg(c,localTitle,localCaption,body),sourceIds};
}

// TAS 採獨立加熱／外加場序列；磁矩箭頭不代表電荷流。
function tasFrames(id,operation,language,sourceIds) {
  const read=operation==='read',reverse=operation==='erase';
  const titles=read?[bi('鎖定磁態待讀','Locked State Awaits Read'),bi('小偏壓感測 MTJ','Sense MTJ at Small Bias'),bi('撤去讀取偏壓','Remove Read Bias')]:[bi('低於 Tb：儲存磁態鎖定','Below Tb: Storage State Locked'),bi('加熱越過 Tb：解除鎖定','Heat above Tb: Unlock Storage'),bi('外加寫入場翻轉磁矩','Applied Write Field Reverses Moment'),bi('保留寫入場並冷卻鎖定','Cool and Lock with Write Field Held'),bi('移除寫入場，磁態保留','Remove Write Field; Retain State')];
  const initial=reverse?90:-90,target=reverse?-90:90;
  return titles.map((title,i)=>{
    const c=canvas(id,operation,language,i+1),hot=!read&&(i===1||i===2),field=!read&&(i===2||i===3);
    const angle=read?90:i<2?initial:target,active=read?i===1:hot;
    let body=mtj(c,id,angle,active,read&&active?'Vr':hot?'HEAT':'0',read&&active?1:0,read,false);
    body+=`<g data-state="tas" data-temperature="${hot?'above-tb':'below-tb'}" data-field="${field?(reverse?'reverse':'forward'):'off'}" data-moment="${angle}">`;
    body+=c.rect(365,74,170,44,hot?'#fbe6d4':'#edf6f4','rx="6"')+c.t(450,103,hot?'T > Tb':'T < Tb','middle');
    body+=c.text(365,150,hot?'已解鎖':'已鎖定',hot?'Unlocked':'Locked');
    if(field) body+=c.arrow(405,reverse?183:228,405,reverse?228:183,C.ref,4)+c.t(428,211,'Hwrite');
    body+='</g>';
    const caption=read?bi('以小偏壓感測既有電阻態；不加熱解鎖，不施加寫入場。','Sense the retained resistance with small bias; do not unlock thermally or apply a write field.'):i===0?bi('交換偏置在低於 Tb 時鎖定儲存磁矩。','Exchange bias locks the storage moment below Tb.'):i===1?bi('加熱使儲存層相關釘扎解除；此步不表示 STT 翻轉。','Heating releases storage-layer pinning; this step does not represent STT switching.'):i===2?bi('在已解鎖的狀態下，外加寫入場設定儲存磁矩方向。','With storage unlocked, the applied write field sets the storage moment direction.'):i===3?bi('停止加熱並維持寫入場，冷卻低於 Tb 後重新鎖定。','Stop heating and hold the write field while cooling below Tb to restore pinning.'):bi('鎖定後移除寫入場；以相反場方向執行反向覆寫。','After pinning is restored, remove the field; the opposite field performs reverse overwrite.');
    return record(c,title,caption,bi(hot?'熱解鎖':'磁態鎖定',hot?'Thermally unlocked':'Magnetic state locked'),bi(read?(active?'小讀取偏壓':'偏壓為零'):hot?'加熱中':field?'冷卻；寫入場保持':'加熱與寫入場關閉',read?(active?'Small read bias':'Zero bias'):hot?'Heating':field?'Cooling; write field held':'Heating and write field off'),body,language,sourceIds);
  });
}

function interfaceFrames(id,operation,language,sourceIds) {
  const analog=id==='tetramem-reram',read=operation==='read',reverse=operation==='erase';
  const titles=read?[bi('既有狀態待感測','Retained State Awaits Sensing'),bi('施加小讀取偏壓','Apply Small Read Bias'),bi('鎖存並撤去偏壓','Latch and Remove Bias')]:analog?[bi('既有類比電導','Initial Analog Conductance'),bi('脈衝逐步調整電導','Pulses Gradually Adjust Conductance'),bi('到達目標電導','Reach Target Conductance'),bi('撤壓保留電導','Remove Bias and Retain Conductance')]:[bi('既有介面阻態','Initial Interface Resistance'),bi('脈衝調變介面障壁','Pulse Modulates Interface Barrier'),bi('到達目標阻態','Reach Target Resistance'),bi('撤壓保留阻態','Remove Bias and Retain Resistance')];
  return titles.map((title,i)=>{
    const c=canvas(id,operation,language,i+1),active=read?i===1:i===1||i===2;
    const caption=analog?bi(read?'小偏壓讀出既有電導；示意 G 保持不變。':'長條表示逐步調整的相對類比電導；數字為教學座標，不代表量測值、位元精度或特定微觀材料機制。',read?'Small bias reads retained conductance; schematic G remains unchanged.':'The bar represents gradual adjustment of relative analog conductance; values are teaching coordinates, not measurements, bit precision, or a specific microscopic mechanism.'):bi(read?'小偏壓感測既有介面阻態；障壁示意保持不變。':'陰影高度表示介面障壁的定性變化；不是金屬微橋，也不代表實測能障或原廠層序。',read?'Small bias senses retained interface resistance; the schematic barrier remains unchanged.':'Shading height represents qualitative interface-barrier modulation, not a metallic bridge, measured barrier, or vendor layer order.');
    const body=reram(c,id,active,active?(read?'Vr':reverse?'ADJUST B':'ADJUST A'):'0',i,operation,0);
    return record(c,title,caption,bi(analog?'相對類比電導':'介面障壁示意',analog?'Relative analog conductance':'Schematic interface barrier'),bi(active?(read?'小讀取偏壓':'調整脈衝；極性未指定'):'偏壓為零',active?(read?'Small read bias':'Adjustment pulse; polarity unspecified'):'Zero bias'),body,language,sourceIds);
  });
}

function magneticFrames(id,operation,language,sourceIds) {
  const gf=id==='gf-emram',read=operation==='read',reverse=operation==='erase';
  const frames=[];
  if(read){
    const titles=[bi('選取前：P 磁態已保留','Before Selection: P Is Retained'),bi(gf?'低偏壓產生感測電流':'低偏壓產生感測信號',gf?'Low Bias Produces Sense Current':'Low Bias Produces Sense Signal'),bi('鎖存後撤去讀取刺激','Latch and Remove Read Stimulus')];
    const captions=[bi('同一個單元從既有 P 狀態開始，WL 關閉；讀取不先翻轉磁矩。','The same cell starts in retained P with WL off; reading does not first reverse its moment.'),bi(gf?'WL 開啟，低讀取偏壓沿 MTJ 與選擇元件形成電流；同偏壓下 P 電流高於 AP。':'施加小感測電壓或定電流讀出接面電阻；P 態電阻顯著低於 AP 態。',gf?'WL enables a low-bias current through the MTJ/access device; P has greater current than AP at equal bias.':'A small sense voltage or current reads junction resistance; P state resistance is markedly lower than AP.'),bi('感測器鎖存後關閉 WL；畫中的自由層與參考層仍為 P，沒有讀後還原週期。','After the sensor latches, WL turns off; free/reference layers remain P without a read-restore cycle.')];
    for(let i=0;i<3;i++){
      const c=canvas(id,operation,language,i+1);
      let body=mtj(c,id,90,i===1,i===1?(gf?'Vr':'Vr'): '0',i===1?1:0,true);
      if(i===1) body+=c.rect(356,235,176,47,'#eaf3fa','rx="7"')+c.t(444,266,gf?'IP > IAP':'RP < RAP','middle',C.electron);
      if(i===2) body+=c.rect(370,116,150,64,'#edf6f4','rx="9"')+c.t(445,155,'SA: P','middle',C.free);
      frames.push(record(c,titles[i],captions[i],bi('P 保持不變','P remains unchanged'),bi(i===1?'WL 開啟；小讀取刺激':'WL 關閉；讀取刺激為零',i===1?'WL on; small read stimulus':'WL off; read stimulus zero'),body,language,sourceIds));
    }
    return frames;
  }
  const target=reverse?'AP':'P',initial=reverse?'P':'AP';
  const angles=reverse?[90,20,-90,-90]:[-90,20,90,90];
  const drive=gf?(reverse?1:-1):(reverse?-1:1);
  const labels=gf?(reverse?'I−':'I+'):(reverse?'Drive B':'Drive A');
  const titles=[bi(`原始 ${initial} 磁態`,`Initial ${initial} State`),bi(reverse?'選取並施加反向自旋驅動':'選取並施加自旋驅動',reverse?'Select and Apply Reverse Spin Drive':'Select and Apply Spin Drive'),bi(`自由層切換至 ${target}`,`Free Layer Switches to ${target}`),bi(`撤去驅動，保留 ${target}`,`Remove Drive and Retain ${target}`)];
  const captions=[bi(`WL 關閉，單元保存 ${initial}。此序列的目標是${reverse?'反向覆寫':'寫入'} ${target}。`, `WL is off and the cell retains ${initial}; this sequence ${reverse?'overwrites':'writes'} ${target}.`),bi(gf?`WL 開啟，${reverse?'FL→RL':'RL→FL'} 的傳統電流施加 STT，電子方向相反。`:'WL 開啟，自旋極化電流穿過 MTJ 產生翻轉力矩；電子流與傳統電流方向相反。',gf?`WL turns on; conventional current ${reverse?'FL-to-RL':'RL-to-FL'} applies STT, with opposite electron flow.`:'WL turns on and spin-polarized current flows through MTJ, exerting switching torque with opposite electron motion.'),bi(`磁化切換至 ${target}；中間角度為示意，自旋轉矩已完成能障跨越。`, `Magnetization reaches ${target}; intermediate angle is schematic as torque surmounts the barrier.`),bi('關閉 WL 並撤去偏壓，磁態保留；反向資料由另一寫入方向覆寫，沒有浮動閘抹除步驟。','Turn WL off and remove bias to retain the moment; the other drive overwrites the opposite data without a floating-gate erase step.')];
  for(let i=0;i<4;i++){
    const c=canvas(id,operation,language,i+1),active=i===1||i===2;
    const body=mtj(c,id,angles[i],active,active?labels:'0',active?drive:0,false,i===1)+pulse(c,i,reverse);
    frames.push(record(c,titles[i],captions[i],bi(i===0?initial:i===1?'切換中':target,i===0?initial:i===1?'Switching':target),bi(active?'WL 開啟；MTJ 雙向驅動':'WL 關閉；驅動為零',active?'WL on; bidirectional MTJ drive':'WL off; drive zero'),body,language,sourceIds));
  }
  return frames;
}

function resistiveFrames(id,operation,language,sourceIds) {
  const wb=id==='weebit-reram'||id==='panasonic-reram',read=operation==='read',reverse=operation==='erase';
  const frames=[];
  if(read){
    const titles=[bi('選取前：低阻結構已保留','Before Selection: Low-R Structure Is Retained'),bi('小偏壓感測導電路徑','Sense the Path at Small Bias'),bi('鎖存後隔離單元','Latch and Isolate the Cell')];
    for(let i=0;i<3;i++){
      const c=canvas(id,operation,language,i+1);
      let body=reram(c,id,i===1,i===1?'＋Vr':'0',i,'read',i===1?1:0);
      if(i===1)body+=c.rect(362,235,170,47,'#eaf3fa','rx="7"')+c.t(447,266,'IL > IH','middle',C.electron);
      if(i===2)body+=c.rect(370,116,150,64,'#edf6f4','rx="9"')+c.t(445,155,'SA: LRS','middle',C.free);
      const caption=i===0?bi('同一單元從已保留的 LRS 開始，選擇閘極關閉。HRS 可沿相同程序讀取。','The same cell starts in retained LRS with selection off. HRS can follow the same read sequence.'):i===1?bi('小偏壓感測導電通道；同偏壓下 ILRS > IHRS，未以讀取脈衝改變材料阻態。','A small bias senses the conduction path; ILRS > IHRS at equal bias without altering the material resistance state.'):bi('鎖存後撤去偏壓，原導電路徑保留；實際讀取擾動限制仍由供應商條件決定。','After latching, remove bias and retain the original path; actual read-disturb limits remain supplier-specific.');
      frames.push(record(c,titles[i],caption,bi('LRS 結構保持','LRS structure retained'),bi(i===1?'WL 開啟；TE 小正偏壓':'WL 關閉；TE 偏壓為零',i===1?'WL on; small positive TE bias':'WL off; TE bias zero'),body,language,sourceIds));
    }
    return frames;
  }
  const titles=wb?(reverse?[bi('原氧空缺路徑導通','Initial Vacancy Path Conducts'),bi('反向偏壓使氧回入','Reverse Bias Returns Oxygen'),bi('關鍵界面微絲中斷','Critical Interface Filament Ruptures'),bi('撤去偏壓，保留高阻','Remove Bias and Retain High R')]:[bi('初始高阻間隙','Initial High-R Gap'),bi('電場驅動氧離子遷移','Electric Field Drives Oxygen Migration'),bi('氧空缺導電微絲接通','Oxygen Vacancy Filament Connects'),bi('撤去偏壓，保留低阻','Remove Bias and Retain Low R')]):(reverse?[bi('原導電路徑為低阻','Initial Conduction Path Is Low R'),bi('反向偏壓驅動微橋溶解或回縮','Reverse Bias Dissolves or Retracts Path'),bi('形成局部絕緣間隙','Insulating Gap Forms'),bi('撤去偏壓，保留高阻','Remove Bias and Retain High R')]:[bi('初始高阻態','Initial High-R State'),bi('正偏壓誘導金屬離子遷移或能障調變','Positive Bias Drives Migration or Modulates Barrier'),bi('導電微橋接通或能障降低','Conductive Bridge Connects or Barrier Lowers'),bi('撤去偏壓，保留低阻','Remove Bias and Retain Low R')]);
  const captions=wb?(reverse?[bi('氧空缺導電路徑已形成；這次操作把 LRS 改為 HRS。','A vacancy path already exists; this operation changes LRS to HRS.'),bi('TE 相對 BE 施加反向電壓，氧離子回填並複合氧空缺。','Reverse bias drives oxygen ions back to recombine with vacancies.'),bi('在關鍵薄絕緣層界面打開高阻間隙；RESET 成功完成。','A high-resistance gap opens at the critical interface; RESET completes.'),bi('撤壓後保留 HRS；介面缺陷處於高阻分佈。','HRS remains after bias removal; interface defects remain in high-R distribution.')]:[bi('從高阻態 HRS 開始，界面存在局部絕緣間隙。','Start in high-R HRS with a localized insulating gap.'),bi('正向電壓驅動氧離子偏壓漂移，在氧化物內聚集氧空缺。','Positive voltage drifts oxygen ions, accumulating oxygen vacancies.'),bi('導電微絲接通上、下電極，電流上升並受選擇管限流約束。','Conductive filament bridges top and bottom electrodes under compliance current.'),bi('撤去偏壓與 WL 後，低阻微絲結構保留為 LRS。','After removing bias and WL, the conductive filament is retained as LRS.')]):(reverse?[bi('從既有的低阻金屬或能障通道開始。','Start from the low-resistance metallic or barrier path.'),bi('反向偏壓驅動金屬離子電化學溶解或抽取介面空缺。','Reverse bias drives electrochemical dissolution or extracts interface vacancies.'),bi('金屬微橋斷開或肖特基能障增厚，電阻大幅上升。','Metallic bridge ruptures or Schottky barrier widens, sharply increasing resistance.'),bi('撤去偏壓後保留 HRS。這是反向 RESET 操作。','HRS remains after bias removal. This is reverse RESET operation.')]:[bi('初始處於高阻 HRS 狀態。','Start in the high-resistance HRS state.'),bi('正向偏壓使活性金屬陽極氧化電離或誘導介面氧空缺聚集。','Positive bias oxidizes active metal anode or accumulates interface vacancies.'),bi('奈米微橋形成或肖特基能障降低，通道進入低阻導通態。','Nanobridge forms or Schottky barrier lowers, transitioning to low-resistance state.'),bi('關閉選擇閘極並撤壓，保留低阻路徑。','Turn selection off and remove bias to retain the low-R path.')]);
  for(let i=0;i<4;i++){
    const c=canvas(id,operation,language,i+1),active=i===1||i===2;
    const body=reram(c,id,active,active?(reverse?'−VRESET':'＋VSET'):'0',i,operation,active?(reverse?-1:1):0)+pulse(c,i,reverse);
    frames.push(record(c,titles[i],captions[i],bi(i===0?(reverse?'LRS':'HRS'):i===1?'切換中':reverse?'HRS':'LRS',i===0?(reverse?'LRS':'HRS'):i===1?'Switching':reverse?'HRS':'LRS'),bi(active?`WL 開啟；TE ${reverse?'負':'正'}偏壓`:'WL 關閉；TE 偏壓為零',active?`WL on; ${reverse?'negative':'positive'} TE bias`:'WL off; TE bias zero'),body,language,sourceIds));
  }
  return frames;
}

/** 回傳自包含的雙語具名單元；未知 ID 回傳 null。 */
export function getIPStudy(id,language='en') {
  if(!Object.hasOwn(META,id))return null;
  if(language!=='zh'&&language!=='en')throw new TypeError('Unsupported language');
  const meta=META[id];
  const magnetic=['numem-mram','gf-emram','everspin-mram','avalanche-mram','spinmem-mram','crocus-mram'].includes(id);
  const sources=localSources(meta.refs,language),sourceIds=sources.map(item=>item.id),legend=legendFor(id,language);
  const title=pick(meta.name,language),caption=pick(meta.structure,language),c=canvas(id,'structure',language,0);
  let structureBody=magnetic?mtj(c,id,90,false,'0'):reram(c,id,false,'0',3,'structure');
  structureBody+=c.text(28,338,'原創結構示意；非比例剖面','Original Structure Model; Not to Scale');
  const operations=['write','erase','read'].map(operationId=>{
    const action=operationId==='read'?bi('讀取','Read'):operationId==='erase'?(magnetic?bi('反向覆寫','Reverse Overwrite'):(id==='tetramem-reram'?bi('降低電導','Decrease Conductance'):bi('反向 RESET','Reverse RESET'))):(magnetic?bi('寫入','Write'):(id==='tetramem-reram'?bi('提高電導','Increase Conductance'):bi('SET 寫入','SET Write')));
    const frames=id==='crocus-mram'?tasFrames(id,operationId,language,sourceIds):['tetramem-reram','4ds-reram'].includes(id)?interfaceFrames(id,operationId,language,sourceIds):magnetic?magneticFrames(id,operationId,language,sourceIds):resistiveFrames(id,operationId,language,sourceIds);
    const summary=id==='crocus-mram'?pick(bi(operationId==='read'?'小偏壓讀出鎖定磁態。':'加熱越過 Tb、外加寫入場定向、冷卻鎖定後移除場。',operationId==='read'?'Read the locked state at small bias.':'Heat above Tb, orient with an applied write field, cool to lock, then remove the field.'),language):['tetramem-reram','4ds-reram'].includes(id)?pick(bi(id==='tetramem-reram'?'以相對類比電導呈現逐步調整與讀取；不指定載子機制。':'以介面障壁變化呈現阻態調整與讀取；數值與幾何僅為教學示意。',id==='tetramem-reram'?'Show gradual analog-conductance adjustment and reading without assigning a carrier mechanism.':'Show interface-barrier modulation and reading; values and geometry are teaching abstractions.'),language):operationId==='read'?pick(bi('選取同一單元，以小感測刺激讀出已保留的電阻態，再鎖存與隔離。','Select the same cell, sense its retained resistance with a small stimulus, then latch and isolate.'),language):operationId==='erase'?pick(bi(magnetic?'以另一方向的 MTJ 驅動覆寫磁態。':'反向 TE 偏壓使導電路徑中斷，形成高阻。',magnetic?'Use the opposite MTJ drive to overwrite magnetization.':'Reverse TE bias interrupts the conduction path and produces high resistance.'),language):pick(bi(magnetic?'以自旋轉移力矩寫入自由層磁態。':'正 TE 偏壓重建導電路徑，形成低阻。',magnetic?'Write free-layer magnetization through spin-transfer torque.':'Positive TE bias restores the conduction path and produces low resistance.'),language);
    return {topicId:`ip-${id}`,operationId,title:`${title} — ${pick(action,language)}`,summary,sources,variants:[{id:'published-model',title:pick(meta.model,language),mechanism:pick(meta.mechanism,language),summary,frames,legend,sources,caveat:pick(meta.caveat,language)}]};
  });
  return {id,structure:{title,svg:svg(c,title,caption,structureBody),caption,legend,sourceIds},operations};
}
