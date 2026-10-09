/**
 * 具名新興記憶體 IP 的原創單元圖解。
 * 幾何、磁矩軌跡與粒子位置均為教材示意，並非產品剖面或量測。
 */
const bi = (zh,en) => ({zh,en});
const pick = (value,language) => typeof value === 'string' ? value : value[language];
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const C = {ink:'#173449',muted:'#536c7c',line:'#6b8492',metal:'#bdd0dc',oxide:'#edf3f7',free:'#178084',ref:'#4b6396',spin:'#7f5899',current:'#bd6827',electron:'#236fab',oxygen:'#1b80a2',vacancy:'#b66b21',silver:'#82639d',copper:'#b86e33',white:'#ffffff'};
const source = (id,label,url,kind,date,locator,limit) => ({id,label,url,kind,date,accessedAt:'2026-09-10',locator,limit});
const SOURCES = {
  numem:source('ip-numem-current',bi('Numem：MRAM IP 公開定位','Numem: Public MRAM IP Positioning'),'https://www.numem.com/',bi('原廠產品頁','Manufacturer product page'),null,bi('What is Numem MRAM?；Numem MRAM IP','What is Numem MRAM?; Numem MRAM IP'),bi('支持嵌入式 IP 與晶圓代工廠標準 STT 單元；未公開現行材料配方。','Supports embedded IP and foundry-standard STT cells; current material recipes are not disclosed.')),
  numem2019:source('ip-numem-2019',bi('Numem：第一代 22nm 嵌入式 MRAM 原始發表','Numem: First-Generation 22nm Embedded MRAM Presentation'),'https://web.archive.org/web/20240627014017/https://files.futurememorystorage.com/proceedings/2019/08-05-Monday/20190805_MRAMDD_EmbeddedMRAM_Hendrickson.pdf',bi('原廠公開會議簡報','Manufacturer public conference presentation'),'2019-08-05',bi('第 2、4、5、7 頁：試驗晶片、WL／BL／SL、定電流感測、RMTJ','Pages 2, 4, 5, 7: test chip, WL/BL/SL, forced-current sensing, RMTJ'),bi('這是第一代試驗晶片架構；未把其量測數值當成現行 NuRAM 規格。','This is a first-generation test-chip architecture; its measured values are not treated as current NuRAM specifications.')),
  stt:source('ip-stt-physics',bi('Everspin：STT 家族物理說明','Everspin: STT Family Physics'),'https://www.everspin.com/stt-mram-technology',bi('原廠機制說明','Manufacturer mechanism explanation'),null,bi('Spin-transfer Torque MRAM Technology：電流方向、自由層、P／AP 電阻','Spin-transfer Torque MRAM Technology: current direction, free layer, P/AP resistance'),bi('僅支持 STT 家族物理；不作為 Numem 的產品、材料或效能證據。','Supports STT family physics only, not Numem product, material, or performance evidence.')),
  gf:source('ip-gf-platform',bi('GF：22FDX 嵌入式 MRAM 平台','GF: 22FDX Embedded MRAM Platform'),'https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram',bi('晶圓代工廠原始公告','Original foundry announcement'),'2020-02-27',bi('首段與 Custom design kits：進入生產、可嵌入的矽驗證 MRAM 巨集','Opening and Custom design kits: production entry and drop-in silicon-validated MRAM macros'),bi('平台身分與單元研究配方分開；可用宏、節點與條件須以供應商交付確認。','Platform identity is separate from the research-cell recipe; confirm macro availability, nodes, and conditions with the supplier.')),
  gf2024:source('ip-gf-cell-2024',bi('GF 共同作者研究：22FDX STT-MRAM 單元','GF Coauthored Research: 22FDX STT-MRAM Cells'),'https://pmc.ncbi.nlm.nih.gov/articles/PMC11409953/',bi('原始研究論文','Original research paper'),'2024-09-18',bi('Materials and Methods：MRAM array structure and fabrication；圖 2','Materials and Methods: MRAM array structure and fabrication; Figure 2'),bi('僅限文中 CoFeB／SAF 與 1T1MTJ 範例；文中正向 Ic：RL→FL，寫入 P。未指定障壁材料。','Limited to the reported CoFeB/SAF and 1T1MTJ example; positive Ic is RL-to-FL and writes P. Barrier material is not specified here.')),
  weebit:source('ip-weebit-product',bi('Weebit：嵌入式 ReRAM IP','Weebit: Embedded ReRAM IP'),'https://www.weebit-nano.com/products/embedded-reram-ip/',bi('原廠 IP 產品頁','Manufacturer IP product page'),null,bi('IP 模組、設計交付、控制與類比周邊','IP module, design deliverables, control, and analog periphery'),bi('產品身分不代表每個代工節點採用同一公開研究配方。','Product identity does not imply every foundry node uses the same published research recipe.')),
  weebitCell:source('ip-weebit-bitcell',bi('Weebit：ReRAM 位元單元','Weebit: ReRAM Bitcell'),'https://www.weebit-nano.com/technology/reram-bitcell/',bi('原廠機制說明','Manufacturer mechanism explanation'),null,bi('雙電極／薄氧化物、成形、正向 SET 與反向 RESET','Two electrodes/thin oxide, forming, positive SET, and reverse RESET'),bi('成形與日常 SET 分開；頁面未給所有材料與逐端點電壓。','Forming is distinct from recurring SET; the page does not specify all materials or terminal voltages.')),
  weebit2021:source('ip-weebit-cell-2021',bi('Weebit／CEA-Leti／Silvaco：氧化物 ReRAM 原始模型','Weebit/CEA-Leti/Silvaco: Original Oxide ReRAM Model'),'https://www.weebit-nano.com/wp-content/uploads/2021/05/Weebit-nano_Silvaco_ReRAM-TCAD_Oxide-Based-Model_IMW_OxRAM_2021_published-on-IEEE_V3-1.pdf',bi('原始研究論文的作者公開版本','Author-posted original research paper'),'2021-05',bi('PDF 第 2–5 頁；II–IV 節、圖 1、3、5、11：Ti／SiOx／TiN 與氧交換','PDF pages 2–5; Sections II–IV and Figures 1, 3, 5, 11: Ti/SiOx/TiN and oxygen exchange'),bi('CEA 130nm 研究單元的模型與電性比對；不是現場直接追蹤離子，也不是所有 SkyWater 宏的配方揭露。','Model/electrical comparison for a CEA 130nm research cell; neither direct operando ion tracking nor a recipe disclosure for every SkyWater macro.')),
  crossbar:source('ip-crossbar-macro',bi('Crossbar：高效能 ReRAM IP 產品簡介','Crossbar: High-Performance ReRAM IP Brief'),'https://web.archive.org/web/20251111045329/https://www.crossbar-inc.com/assets/white-papers/High-Performance-Memory-Product-Brief.pdf',bi('原廠公開產品簡介','Manufacturer public product brief'),null,bi('第 1–2 頁：hard macro／architectural license、嵌入式宏與改寫','Pages 1–2: hard macro/architectural license, embedded macro, and overwrite'),bi('支持歷史 IP 授權形態；本次未確認 2026 年可新授權的節點與宏清單。','Supports historical IP licensing forms; this review does not confirm a 2026 list of newly licensable nodes or macros.')),
  crossbar2015:source('ip-crossbar-2015',bi('Crossbar：嵌入式 1T1R 與金屬路徑原始發表','Crossbar: Original Embedded 1T1R and Metallic-Path Presentation'),'https://web.archive.org/web/20240712152921/https://files.futurememorystorage.com/proceedings/2015/20150812_S203A_Nazarian.pdf',bi('原廠公開會議簡報','Manufacturer public conference presentation'),'2015',bi('第 3、4、7、8、15 頁：金屬路徑、單元與選擇器、BEOL 1T1R','Pages 3, 4, 7, 8, 15: metallic path, cell versus selector, BEOL 1T1R'),bi('嵌入式 1T1R 與高密度 1S1R／1TnR 各有範圍，不合併為同一電路。','Embedded 1T1R and high-density 1S1R/1TnR have separate scopes and are not merged into one circuit.')),
  crossbar2012:source('ip-crossbar-cell-2012',bi('Crossbar：公開專利申請 US20120007035A1','Crossbar: Published Patent Application US20120007035A1'),'https://patents.google.com/patent/US20120007035A1/en',bi('原始公開專利申請','Original published patent application'),'2012-01-12',bi('圖 1–3；[0023]–[0025]、[0037]：Ag／a-Si／p+ poly-Si、正向延伸、負向回縮','Figures 1–3; [0023]–[0025], [0037]: Ag/a-Si/p+ poly-Si, positive extension, negative retraction'),bi('選取其中的具名實施例；以金屬粒子與穿隧路徑描述，未宣稱已證明現售宏皆為此配方或一般陰極成核銀橋。','Selects a named embodiment with metal particles and tunneling paths; does not establish this recipe for all current macros or generic cathode-grown silver bridges.')),
  everspinPat:source('ip-everspin-pmtj',bi('Everspin：pMTJ 垂直磁化專利 US8488371B2','Everspin: pMTJ Perpendicular Magnetization Patent US8488371B2'),'https://patents.google.com/patent/US8488371B2/en',bi('原廠核心專利','Manufacturer core patent'),'2013-07-16',bi('Claims 1-12；圖 2-4：雙 MgO 界面垂直各向異性自由層與 SAF 釘扎','Claims 1-12; Figures 2-4: Dual-MgO interface perpendicular anisotropy free layer and SAF pinning'),bi('以專利公開之界面垂直各向異性 (i-PMA) 實施例為準；不推定任一代工廠現行退火條件。','Governed by the published interfacial perpendicular magnetic anisotropy (i-PMA) embodiment; does not imply specific foundry anneal thermal budgets.')),
  everspinProd:source('ip-everspin-product',bi('Everspin：pMTJ STT-MRAM 產品技術','Everspin: pMTJ STT-MRAM Product Technology'),'https://www.everspin.com/',bi('原廠技術說明','Manufacturer technology overview'),null,bi('pMTJ STT-MRAM 產品線架構與 BEOL 400°C 整合','pMTJ STT-MRAM architecture and BEOL 400°C thermal compatibility'),bi('產品身分不代表所有外部代工廠提供相同單元尺寸。','Product identity does not imply all external foundries offer identical bitcell dimensions.')),
  avalanchePat:source('ip-avalanche-saf',bi('Avalanche：雙對稱 SAF 專利 US9837603B2','Avalanche: Dual-SAF Symmetric Patent US9837603B2'),'https://patents.google.com/patent/US9837603B2/en',bi('原廠核心專利','Manufacturer core patent'),'2017-12-05',bi('Claims 1-20；圖 3-5：上下對稱雙 SAF 抵消自由層雜散場偏置','Claims 1-20; Figures 3-5: Top/bottom symmetric dual-SAF cancelling stray field bias on free layer'),bi('以專利實施例為準；抗輻照與車規表現需搭配特定封裝與測試認證。','Governed by the patent embodiment; rad-hard and automotive claims require qualification per package.')),
  spinmemPat:source('ip-spinmem-psc',bi('Spin Memory：進動自旋流極化層專利 US9287500B2','Spin Memory: Precessional Spin Current Patent US9287500B2'),'https://patents.google.com/patent/US9287500B2/en',bi('原廠核心專利','Manufacturer core patent'),'2016-03-15',bi('Claims 1-18；圖 1-4：面內極化 PSC 層消除熱起伏延遲實現 <3ns 翻轉','Claims 1-18; Figures 1-4: In-plane PSC layer eliminating thermal incubation delay for <3ns switching'),bi('選取專利中 PSC 實施例；商用 IP 授權與實際翻轉速度依授權巨集規格。','Selects patent PSC embodiment; commercial IP licensing and actual speed depend on macro delivery.')),
  crocusPat:source('ip-crocus-tas',bi('Crocus：熱輔助 MRAM 專利 US7916526B2','Crocus: Thermally Assisted MRAM Patent US7916526B2'),'https://patents.google.com/patent/US7916526B2/en',bi('原廠核心專利','Manufacturer core patent'),'2011-03-29',bi('Claims 1-24；圖 2-6：加熱電流脈衝越過 AFM 阻斷溫度 Tb 實現解鎖翻轉','Claims 1-24; Figures 2-6: Heating pulse above AFM blocking temperature Tb enabling unpinned switching'),bi('以專利揭露之 TAS 機制為準；冷卻時間限制不可推廣為非加熱 STT 速度。','Governed by disclosed TAS mechanism; cooling latency limits write speed compared to non-heated STT.')),
  panaPat:source('ip-panasonic-taox',bi('Panasonic：雙層鉭氧化物 ReRAM 專利 US8068356B2','Panasonic: Dual-Layer TaOx ReRAM Patent US8068356B2'),'https://patents.google.com/patent/US8068356B2/en',bi('原廠核心專利','Manufacturer core patent'),'2011-11-29',bi('Claims 1-15；圖 1-8：Ta2O5 薄絕緣層 + TaOx 缺氧導電層可逆氧交換與自限制微絲','Claims 1-15; Figures 1-8: Ta2O5 insulator + TaOx oxygen-deficient reservoir with self-limiting filament'),bi('以專利雙層氧化鉭實施例為準；量產晶片 MN101L 規格需另核對原廠手冊。','Governed by bilayer tantalum oxide embodiment; mass-production MN101L specs verified per datasheet.')),
  tetraPat:source('ip-tetramem-cim',bi('TetraMem：類比多階線性電導專利 US11393527B2','TetraMem: Analog Multi-Level Conductance Patent US11393527B2'),'https://patents.google.com/patent/US11393527B2/en',bi('原廠核心專利','Manufacturer core patent'),'2022-07-19',bi('Claims 1-20；圖 3-9：連續介面氧空缺障壁工程實現 8-bit 高線性度 CIM 權重','Claims 1-20; Figures 3-9: Continuous interfacial vacancy barrier engineering for 8-bit linear CIM weights'),bi('以專利類比多階調控實施例為準；神經網路推理精度依陣列校準與溫度條件。','Governed by analog multi-level patent embodiment; neural inference precision depends on calibration.')),
  fourdsPat:source('ip-4ds-pcmo',bi('4DS Memory：非微絲 PCMO 介面 ReRAM 專利 US10468591B2','4DS Memory: Non-Filamentary PCMO Patent US10468591B2'),'https://patents.google.com/patent/US10468591B2/en',bi('原廠核心專利','Manufacturer core patent'),'2019-11-05',bi('Claims 1-16；圖 1-5：單晶圓 PCMO 介面肖特基能障均勻調變，免 Forming 步驟','Claims 1-16; Figures 1-5: Single-wafer PCMO interface Schottky barrier modulation, forming-free operation'),bi('以專利揭露之面積型非微絲實施例為準；高密度 3D 整合以策略夥伴 imec 合作發表為準。','Governed by disclosed area-dependent non-filamentary embodiment; 3D integration verified via imec.')),
  adestoPat:source('ip-adesto-cbram',bi('Adesto：微安培銅奈米橋專利 US8824194B2','Adesto: Micro-Ampere Cu-Bridge Patent US8824194B2'),'https://patents.google.com/patent/US8824194B2/en',bi('原廠核心專利','Manufacturer core patent'),'2014-09-02',bi('Claims 1-22；圖 2-7：銅活性陽極於固態電解質中形成微安培級導電微橋','Claims 1-22; Figures 2-7: Copper active anode forming microamp metallic bridge in solid electrolyte'),bi('以專利金屬離子橋接實施例為準；車規保持性依特定合金陽極穩定配方。','Governed by patent metallic bridge embodiment; automotive retention requires stabilized alloy anodes.'))
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
    name:bi('Everspin pMTJ STT-MRAM IP 單元','Everspin pMTJ STT-MRAM IP Cell'),
    model:bi('雙 MgO 界面垂直磁各向異性自由層 (i-PMA)','Dual-MgO Interfacial Perpendicular Magnetic Anisotropy (i-PMA)'),
    mechanism:bi('雙界面高熱穩定垂直磁化與自旋穿隧翻轉','High-thermal-stability perpendicular magnetization with STT tunneling switching'),
    structure:bi('依 US8488371B2 專利繪製雙 MgO 界面帽層、CoFeB 自由層、MgO 穿隧障壁、CoFeB 參考層與 SAF 固定層。','Reconstructs the dual-MgO cap, CoFeB free layer, MgO barrier, CoFeB reference layer, and SAF pinning per US8488371B2.'),
    caveat:bi('此為 Everspin 專利與量產架構教學模型；後端 BEOL 熱預算需小於 400°C 避免硼擴散；保持性驗證依 JEDEC 標準。','Educational reconstruction of Everspin patented architecture; BEOL thermal budget must remain under 400°C to avoid boron out-diffusion.'),
    refs:['everspinPat','everspinProd','stt']
  },
  'avalanche-mram':{
    name:bi('Avalanche Dual-SAF 對稱磁補償 MRAM 單元','Avalanche Dual-SAF Stray-Field Compensated MRAM Cell'),
    model:bi('上下雙對稱 SAF 磁性堆疊 (Dual Synthetic Antiferromagnet)','Top and Bottom Symmetric Dual-SAF Magnetic Stack'),
    mechanism:bi('消除自由層非對稱雜散磁場，實現對稱雙向翻轉電壓','Cancels asymmetric stray dipole fields for symmetric bidirectional switching'),
    structure:bi('依 US9837603B2 專利繪製中心 CoFeB 自由層兩側夾置雙 MgO 障壁與頂底雙 SAF 參考層。','Reconstructs the central CoFeB free layer flanked by dual MgO barriers and top/bottom dual-SAF reference layers per US9837603B2.'),
    caveat:bi('雙 SAF 堆疊以專利實施例為準；抗輻照總劑量與車規耐熱需依航太或車規封裝認證。','Based on the patent embodiment; rad-hard total ionizing dose and automotive retention require qualified packaging.'),
    refs:['avalanchePat','stt']
  },
  'spinmem-mram':{
    name:bi('Spin Memory PSC 自旋進動極速 MRAM 單元','Spin Memory PSC Ultra-Fast Precessional MRAM Cell'),
    model:bi('垂直 MTJ ＋ 面內進動自旋極化層 (PSC Layer)','Perpendicular MTJ + In-Plane Precessional Spin Current (PSC) Layer'),
    mechanism:bi('正交自旋極化力矩消除隨機熱起伏延遲，實現 <3ns 極速翻轉','Orthogonal spin torque eliminates thermal incubation delay for <3ns switching'),
    structure:bi('依 US9287500B2 專利繪製面內極化 PSC 層、去耦隔離層與垂直 MTJ 堆疊。','Reconstructs the in-plane PSC polarizer, decoupling spacer, and perpendicular MTJ stack per US9287500B2.'),
    caveat:bi('PSC 層與去耦厚度依專利揭露；商用授權與實際翻轉延遲由被授權代工巨集決定。','PSC layer and spacer thickness follow the patent disclosure; commercial macro latency depends on licensed foundry delivery.'),
    refs:['spinmemPat','stt']
  },
  'crocus-mram':{
    name:bi('Crocus TAS-MRAM 熱輔助阻變單元','Crocus TAS-MRAM Thermally Assisted Cell'),
    model:bi('加熱電極 ＋ AFM 阻斷溫度 (Tb) 交換偏置鎖定','Heater Line + AFM Blocking Temperature (Tb) Exchange-Bias Pinning'),
    mechanism:bi('短加熱脈衝超過 Tb 解鎖釘扎位障，微弱電流翻轉後冷卻鎖定','Heating pulse exceeding Tb unlocks pinning barrier; cools down to freeze state'),
    structure:bi('依 US7916526B2 專利繪製頂部加熱電阻、AFM 釘扎層、儲存層、穿隧障壁與參考層。','Reconstructs the top heater line, AFM pinning layer, storage layer, tunnel barrier, and reference layer per US7916526B2.'),
    caveat:bi('熱冷卻時間限制隨機寫入速度至 20-30ns；熱擴散隔離設計限制極限單元微縮密度。','Thermal cooling cycle limits write speed to 20-30ns; thermal diffusion isolation limits maximum array density scaling.'),
    refs:['crocusPat','stt']
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
    model:bi('Ta2O5 薄絕緣層 ＋ TaOx 缺氧導電層雙層堆疊','Stoichiometric Ta2O5 (~5nm) + Oxygen-Deficient TaOx (~30nm) Bilayer'),
    mechanism:bi('氧離子可逆交換，串聯電阻自限制微絲粗細','Reversible oxygen ion exchange with series resistance self-limiting filament size'),
    structure:bi('依 US8068356B2 專利繪製 Pt/TiN 上電極、超薄 Ta2O5 活化層、TaOx 氧離子庫與 TiN 下電極。','Reconstructs the Pt/TiN top electrode, Ta2O5 layer, TaOx reservoir, and TiN bottom electrode per US8068356B2.'),
    caveat:bi('雙層氧化鉭薄膜氧含量梯度需嚴格控制濺鍍分壓；高溫保持壽命隨高熱應力退化。','Oxygen profile gradient across Ta2O5/TaOx requires tight sputtering control; retention degrades under extreme thermal stress.'),
    refs:['panaPat']
  },
  'tetramem-reram':{
    name:bi('TetraMem CIM 多階連續線性電導 ReRAM 單元','TetraMem Analog Multi-Level Conductance CIM Cell'),
    model:bi('多層金屬氧化物連續介面氧空缺工程 (Interfacial Vacancy Engineering)','Interfacial Defect Engineering with Continuous Multi-Level Conductance'),
    mechanism:bi('連續介面空缺調變，實現 8-bit 高線性度類比突觸權重儲存','Continuous vacancy modulation achieving 8-bit high-linearity analog CIM weights'),
    structure:bi('依 US11393527B2 專利繪製多層金屬氧化物介面障壁工程堆疊，非單一局部突變粗微絲。','Reconstructs the multi-layer metal oxide interface-engineered stack per US11393527B2.'),
    caveat:bi('類比多階精度對溫度變化敏感；神經網路推理需搭配週期性背景權重校準電路。','Analog multi-level precision is susceptible to thermal variations; requires periodic background calibration.'),
    refs:['tetraPat']
  },
  '4ds-reram':{
    name:bi('4DS Memory 非微絲面積型 PCMO ReRAM 單元','4DS Memory Non-Filamentary Area-Dependent PCMO Cell'),
    model:bi('單晶圓級 Pr0.7Ca0.3MnO3 (PCMO) 介面肖特基障壁調變','Single-Wafer Pr0.7Ca0.3MnO3 (PCMO) Interface Schottky Barrier Modulation'),
    mechanism:bi('介面氧空缺均勻調變肖特基能障，阻值隨接觸面積成反比微縮（免 Forming）','Uniform interface vacancy modulation; resistance scales inversely with contact area (Forming-free)'),
    structure:bi('依 US10468591B2 專利繪製金屬接觸電極、單晶 PCMO 鈣鈦礦薄膜與歐姆底電極。','Reconstructs the metal contact, single-wafer PCMO perovskite film, and ohmic bottom electrode per US10468591B2.'),
    caveat:bi('複雜多元鈣鈦礦沉積需嚴格控制晶體均勻度；高密度 3D 垂直堆疊加工技術持續演進中。','Complex perovskite deposition requires strict crystalline uniformity; 3D vertical stacking etch remains under active R&D.'),
    refs:['fourdsPat']
  },
  'adesto-cbram':{
    name:bi('Adesto 固態電解質微安培導電橋接 CBRAM 單元','Adesto Solid-Electrolyte Micro-Ampere CBRAM Cell'),
    model:bi('銅活性陽極 ＋ 摻銅固態電解質 ＋ 惰性鎢陰極','Copper Active Anode + Copper-Doped Solid Electrolyte + Inert Tungsten Cathode'),
    mechanism:bi('電化學陽極氧化還原，微安培級銅奈米微橋生長與溶解','Electrochemical redox forming and dissolving microamp copper metallic nanobridges'),
    structure:bi('依 US8824194B2 專利繪製 Cu 陽極、超薄固態電解質與 W 陰極。','Reconstructs the Cu anode, thin solid electrolyte, and W cathode per US8824194B2.'),
    caveat:bi('高溫熱應力下金屬離子存在自發熱擴散風險；車規 125°C+ 級長效保持需搭配特殊陽極摻雜工藝。','Metallic ions face spontaneous thermal diffusion; automotive retention requires stabilized alloy anodes.'),
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
  if(id==='everspin-mram') {
    out+=c.line(265,22,265,48)+c.t(248,38,'BL','end')+c.t(282,38,bias);
    out+=c.rect(180,48,170,28,C.oxide)+c.t(20,68,'Top MgO Cap');
    out+=c.rect(180,76,170,40,'#d9efee')+c.t(20,102,'CoFeB i-FL');
    out+=c.rect(180,116,170,28,C.oxide)+c.text(20,136,'穿隧障壁','Tunnel MgO');
    out+=c.rect(180,144,170,40,'#e2e8f4')+c.t(20,169,'CoFeB RL');
    out+=c.rect(180,184,170,28,'#edf0f7')+c.t(20,203,'Ru / SAF');
    out+=c.moment(265,96,angle)+c.moment(265,164,90,C.ref);
    out+=c.arrow(240,203,240,189,C.ref,2)+c.arrow(290,189,290,203,C.ref,2);
    out+=access(c,on,212,'SL');
  } else if(id==='avalanche-mram') {
    out+=c.line(265,20,265,46)+c.t(248,36,'BL','end')+c.t(282,36,bias);
    out+=c.rect(180,46,170,28,'#edf0f7')+c.t(20,65,'Top SAF');
    out+=c.rect(180,74,170,24,C.oxide)+c.t(20,93,'Top MgO');
    out+=c.rect(180,98,170,38,'#d9efee')+c.t(20,123,'Center FL');
    out+=c.rect(180,136,170,24,C.oxide)+c.t(20,153,'Bottom MgO');
    out+=c.rect(180,160,170,30,'#edf0f7')+c.t(20,181,'Bottom SAF');
    out+=c.moment(265,117,angle)+c.moment(265,60,90,C.ref)+c.moment(265,175,-90,C.ref);
    out+=access(c,on,190,'SL');
  } else if(id==='spinmem-mram') {
    out+=c.line(265,20,265,46)+c.t(248,36,'BL','end')+c.t(282,36,bias);
    out+=c.rect(180,46,170,30,'#ebdcf5')+c.t(20,68,'PSC Polarizer');
    out+=c.arrow(235,61,295,61,C.spin,3.5);
    out+=c.rect(180,76,170,24,C.metal)+c.t(20,96,'Spacer');
    out+=c.rect(180,100,170,38,'#d9efee')+c.t(20,126,'p-FL');
    out+=c.rect(180,138,170,26,C.oxide)+c.text(20,157,'穿隧障壁','Tunnel MgO');
    out+=c.rect(180,164,170,38,'#e2e8f4')+c.t(20,190,'SAF RL');
    out+=c.moment(265,119,angle)+c.moment(265,183,90,C.ref);
    out+=access(c,on,202,'SL');
  } else if(id==='crocus-mram') {
    out+=c.line(265,20,265,46)+c.t(248,36,'BL','end')+c.t(282,36,bias);
    out+=c.rect(180,46,170,28,'#fbe6d4')+c.t(20,66,'Heater Line');
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
    out+=c.rect(180,79,170,28,C.metal)+c.t(20,98,'Pt/TiN TE');
    out+=c.rect(180,107,170,32,'#fdeee2')+c.t(20,128,'Ta2O5 (~5nm)');
    out+=c.rect(180,139,170,72,'#e5eff4')+c.t(20,182,'TaOx (~30nm)');
    out+=c.rect(180,211,170,28,C.metal)+c.t(20,231,'TiN BE');
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
    for(const [x,y] of [[220,125],[245,128],[270,123],[295,127],[320,124]]) out+=ion(c,x,y,'vacancy');
    out+=c.rect(200,160,130,30,'#f3e8cb','rx="4" stroke="none"')+c.text(210,182,'多階電導 G','Multi-Level G');
  } else if(id==='4ds-reram') {
    out+=c.rect(180,79,170,28,C.metal)+c.t(20,98,'Top Contact');
    out+=c.rect(180,107,170,104,'#efe6f3')+c.t(20,165,'PCMO Perovskite');
    out+=c.rect(180,211,170,28,C.metal)+c.t(20,231,'Ohmic BE');
    out+=access(c,on,239,'BE / SL');
    out+=c.path('M210 115Q265 135 320 115',C.current,2.5)+c.text(360,130,'肖特基障壁','Schottky Barrier');
  } else if(id==='adesto-cbram') {
    out+=c.rect(180,79,170,28,'#f2d0ba')+c.t(20,98,'Cu Anode');
    out+=c.rect(180,107,170,104,'#eef6f6')+c.t(20,165,'Solid Electrolyte');
    out+=c.rect(180,211,170,28,'#ccd5de')+c.t(20,231,'W Cathode');
    out+=access(c,on,239,'BE / SL');
    const read=operation==='read'||operation==='structure',set=operation==='write';
    const end=read?205:set?[140,165,205,205][stage]:[205,175,140,140][stage];
    for(let y=115;y<=end;y+=15) out+=ion(c,265+(y%4-1.5)*2,y,'copper');
    if((set||operation==='erase')&&stage===1) out+=c.arrow(302,set?120:190,302,set?190:120,C.copper,3)+c.t(363,165,'Cu+');
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
  ['Top/Bottom MgO',bi('雙 MgO 界面誘導垂直磁各向異性 (i-PMA)','Dual MgO interfaces induce perpendicular magnetic anisotropy (i-PMA)')],
  ['CoFeB FL / RL',bi('CoFeB 垂直自由層與參考層；超薄穿隧障壁','CoFeB perpendicular free/reference layers with ultrathin tunnel barrier')],
  ['Ru / SAF',bi('合成反鐵磁釘扎層固定參考層磁化','Synthetic antiferromagnet (SAF) pinning stabilizes reference layer')],
  ['Ic / e−',bi('雙向自旋轉矩穿隧翻轉電流','Bidirectional spin-transfer torque switching current')]
];
const AVALANCHE_LEGEND=[
  ['Top / Bottom SAF',bi('上下雙對稱 SAF 抵消自由層雜散偶極場偏置','Dual symmetric SAFs cancel stray dipole fields on the free layer')],
  ['Center CoFeB FL',bi('中心垂直自由層夾置於雙 MgO 障壁之間','Central perpendicular free layer flanked by dual MgO tunnel barriers')],
  ['Ic (Dual STT)',bi('雙重自旋轉矩注入，臨界翻轉電流降低約 50%','Dual spin-torque injection reducing critical switching current by ~50%')]
];
const SPINMEM_LEGEND=[
  ['PSC Polarizer',bi('面內極化自旋流產生層提供正交進動轉矩','In-plane precessional spin polarizer supplies orthogonal torque')],
  ['Spacer',bi('非磁性交換去耦間隔層','Non-magnetic exchange-decoupling spacer layer')],
  ['p-FL / SAF RL',bi('垂直 MTJ 儲存單元，消除熱起伏隨機延遲','Perpendicular MTJ eliminating thermal incubation delay')]
];
const CROCUS_LEGEND=[
  ['Heater Line',bi('加熱電阻脈衝將局域溫度升高超過阻斷溫度 Tb','Heating pulse raises temperature above blocking temperature Tb')],
  ['AFM (Tb)',bi('反鐵磁層在常溫下以交換偏置場鎖定儲存層','Antiferromagnetic layer locks storage layer via exchange bias below Tb')],
  ['Storage FL',bi('短脈衝加熱解鎖後翻轉，冷卻後凍結狀態','Switches while thermally unlocked, then freezes state upon cooling')]
];
const WB_LEGEND=[
  ['Ti / SiOx / TiN',bi('上電極／切換氧化物／下電極；僅限公開 CEA 範例','Top electrode/switching oxide/bottom electrode, limited to the public CEA example')],
  ['O²− / VO',bi('藍色實心圓為氧離子；橘色空心圓為氧空缺，沒有金屬銀','Filled blue circles are oxygen ions; open orange circles are vacancies, with no silver metal')],
  ['TE / BE; WL',bi('上／下電極及選擇閘極；TE 偏壓以 BE 為基準','Top/bottom electrodes and select gate; TE bias is referenced to BE')],
  ['Ic / e−',bi('傳統電流與電子流方向相反；不是氧離子移動方向','Conventional current and electrons flow oppositely; neither denotes oxygen motion')]
];
const PANA_LEGEND=[
  ['Pt/TiN TE / BE',bi('惰性電極夾置雙層鉭氧化物阻變堆疊','Inert electrodes sandwiching the bilayer tantalum oxide stack')],
  ['Ta2O5 (~5nm)',bi('超薄化學計量絕緣層，局域富鉭微絲活化區','Ultrathin stoichiometric insulator where Ta-rich conductive filament forms')],
  ['TaOx (~30nm)',bi('缺氧導電層作為氧離子庫，串聯電阻自限制微絲粗細','Oxygen-deficient layer acting as oxygen reservoir with self-limiting resistance')]
];
const TETRA_LEGEND=[
  ['Barrier / Oxide',bi('多層金屬氧化物連續介面障壁工程堆疊','Interface-engineered multi-layer metal oxide stack')],
  ['Multi-Level G',bi('連續調變介面氧空缺分布，實現 8-bit 高線性度電導','Continuous vacancy tuning delivering 8-bit linear analog conductance')],
  ['CIM In-Memory',bi('類比記憶體運算乘加權重，極低弛豫漂移','Analog compute-in-memory weights with minimal conductance drift')]
];
const FOURDS_LEGEND=[
  ['PCMO Perovskite',bi('單晶圓級 Pr0.7Ca0.3MnO3 鈣鈦礦過渡金屬氧化物','Single-wafer Pr0.7Ca0.3MnO3 perovskite transition metal oxide')],
  ['Schottky Barrier',bi('介面肖特基障壁高度均勻調變，非局部崩潰微絲','Uniform interface Schottky barrier modulation without localized filaments')],
  ['Forming-free',bi('免高壓電氣 Forming，阻值隨接觸面積成反比微縮','Forming-free operation; resistance scales inversely with junction area')]
];
const CB_LEGEND=[
  ['Ag / a-Si / p+ poly-Si',bi('銀上電極／非晶矽／選定的下端緩衝與接點實施例','Silver top electrode/amorphous silicon/selected lower buffer-contact embodiment')],
  ['Ag',bi('紫色實心區與圓點表示金屬區與粒子；不指定粒子電荷態','Purple region and dots denote metal region/particles without asserting each charge state')],
  ['TE / BE; WL',bi('上／下電極與選擇閘極；1T1R 整合是原廠另一公開來源','Top/bottom electrodes and select gate; 1T1R integration has a separate manufacturer source')],
  ['Ic / e−',bi('傳統電流與電子方向相反；電子可在相鄰粒子間穿隧','Conventional current opposes electron motion; electrons may tunnel between neighboring particles')]
];
const ADESTO_LEGEND=[
  ['Cu Anode / W Cathode',bi('銅活性陽極與惰性鎢陰極夾置超薄固態電解質','Copper active anode and inert tungsten cathode flanking solid electrolyte')],
  ['Cu+ / Cu Bridge',bi('電化學氧化還原形成微安培級金屬銅奈米微橋','Electrochemical redox growing microamp-level copper metallic nanobridge')],
  ['Sub-Volt RESET',bi('低壓反向偏壓電離溶解金屬橋，恢復太歐姆高阻態','Low reverse bias dissolves copper bridge, restoring tera-ohm high-resistance state')]
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
    const action=operationId==='read'?bi('讀取','Read'):operationId==='erase'?(magnetic?bi('反向覆寫','Reverse Overwrite'):bi('反向 RESET','Reverse RESET')):(magnetic?bi('寫入','Write'):bi('SET 寫入','SET Write'));
    const frames=magnetic?magneticFrames(id,operationId,language,sourceIds):resistiveFrames(id,operationId,language,sourceIds);
    const summary=operationId==='read'?pick(bi('選取同一單元，以小感測刺激讀出已保留的電阻態，再鎖存與隔離。','Select the same cell, sense its retained resistance with a small stimulus, then latch and isolate.'),language):operationId==='erase'?pick(bi(magnetic?'以另一方向的 MTJ 驅動覆寫磁態。':'反向 TE 偏壓使導電路徑中斷，形成高阻。',magnetic?'Use the opposite MTJ drive to overwrite magnetization.':'Reverse TE bias interrupts the conduction path and produces high resistance.'),language):pick(bi(magnetic?'以自旋轉移力矩寫入自由層磁態。':'正 TE 偏壓重建導電路徑，形成低阻。',magnetic?'Write free-layer magnetization through spin-transfer torque.':'Positive TE bias restores the conduction path and produces low resistance.'),language);
    return {topicId:`ip-${id}`,operationId,title:`${title} — ${pick(action,language)}`,summary,sources,variants:[{id:'published-model',title:pick(meta.model,language),mechanism:pick(meta.mechanism,language),summary,frames,legend,sources,caveat:pick(meta.caveat,language)}]};
  });
  return {id,structure:{title,svg:svg(c,title,caption,structureBody),caption,legend,sourceIds},operations};
}
