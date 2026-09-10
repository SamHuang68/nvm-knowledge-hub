/**
 * 具名新興記憶體 IP 的原創單元圖解。
 * 幾何、磁矩軌跡與粒子位置均為教材示意，並非產品剖面或量測。
 */
const bi = (zh,en) => ({zh,en});
const pick = (value,language) => typeof value === 'string' ? value : value[language];
const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const C = {ink:'#173449',muted:'#536c7c',line:'#6b8492',metal:'#bdd0dc',oxide:'#edf3f7',free:'#178084',ref:'#4b6396',spin:'#7f5899',current:'#bd6827',electron:'#236fab',oxygen:'#1b80a2',vacancy:'#b66b21',silver:'#82639d',white:'#ffffff'};
const source = (id,label,url,kind,date,locator,limit) => ({id,label,url,kind,date,accessedAt:'2026-09-10',locator,limit});
const SOURCES = {
  numem:source('ip-numem-current',bi('Numem：MRAM IP 公開定位','Numem: Public MRAM IP Positioning'),'https://www.numem.com/',bi('原廠產品頁','Manufacturer product page'),null,bi('What is Numem MRAM?；Numem MRAM IP','What is Numem MRAM?; Numem MRAM IP'),bi('支持嵌入式 IP 與晶圓代工廠標準 STT 單元；未公開現行材料配方。','Supports embedded IP and foundry-standard STT cells; current material recipes are not disclosed.')),
  numem2019:source('ip-numem-2019',bi('Numem：第一代 22nm 嵌入式 MRAM 原始發表','Numem: First-Generation 22nm Embedded MRAM Presentation'),'https://files.futurememorystorage.com/proceedings/2019/08-05-Monday/20190805_MRAMDD_EmbeddedMRAM_Hendrickson.pdf',bi('原廠公開會議簡報','Manufacturer public conference presentation'),'2019-08-05',bi('第 2、4、5、7 頁：試驗晶片、WL／BL／SL、定電流感測、RMTJ','Pages 2, 4, 5, 7: test chip, WL/BL/SL, forced-current sensing, RMTJ'),bi('這是第一代試驗晶片架構；未把其量測數值當成現行 NuRAM 規格。','This is a first-generation test-chip architecture; its measured values are not treated as current NuRAM specifications.')),
  stt:source('ip-stt-physics',bi('Everspin：STT 家族物理說明','Everspin: STT Family Physics'),'https://www.everspin.com/stt-mram-technology',bi('原廠機制說明','Manufacturer mechanism explanation'),null,bi('Spin-transfer Torque MRAM Technology：電流方向、自由層、P／AP 電阻','Spin-transfer Torque MRAM Technology: current direction, free layer, P/AP resistance'),bi('僅支持 STT 家族物理；不作為 Numem 的產品、材料或效能證據。','Supports STT family physics only, not Numem product, material, or performance evidence.')),
  gf:source('ip-gf-platform',bi('GF：22FDX 嵌入式 MRAM 平台','GF: 22FDX Embedded MRAM Platform'),'https://investors.gf.com/news-releases/news-release-details/globalfoundries-delivers-industrys-first-production-ready-emram',bi('晶圓代工廠原始公告','Original foundry announcement'),'2020-02-27',bi('首段與 Custom design kits：進入生產、可嵌入的矽驗證 MRAM 巨集','Opening and Custom design kits: production entry and drop-in silicon-validated MRAM macros'),bi('平台身分與單元研究配方分開；可用宏、節點與條件須以供應商交付確認。','Platform identity is separate from the research-cell recipe; confirm macro availability, nodes, and conditions with the supplier.')),
  gf2024:source('ip-gf-cell-2024',bi('GF 共同作者研究：22FDX STT-MRAM 單元','GF Coauthored Research: 22FDX STT-MRAM Cells'),'https://pmc.ncbi.nlm.nih.gov/articles/PMC11409953/',bi('原始研究論文','Original research paper'),'2024-09-18',bi('Materials and Methods：MRAM array structure and fabrication；圖 2','Materials and Methods: MRAM array structure and fabrication; Figure 2'),bi('僅限文中 CoFeB／SAF 與 1T1MTJ 範例；文中正向 Ic：RL→FL，寫入 P。未指定障壁材料。','Limited to the reported CoFeB/SAF and 1T1MTJ example; positive Ic is RL-to-FL and writes P. Barrier material is not specified here.')),
  weebit:source('ip-weebit-product',bi('Weebit：嵌入式 ReRAM IP','Weebit: Embedded ReRAM IP'),'https://www.weebit-nano.com/products/embedded-reram-ip/',bi('原廠 IP 產品頁','Manufacturer IP product page'),null,bi('IP 模組、設計交付、控制與類比周邊','IP module, design deliverables, control, and analog periphery'),bi('產品身分不代表每個代工節點採用同一公開研究配方。','Product identity does not imply every foundry node uses the same published research recipe.')),
  weebitCell:source('ip-weebit-bitcell',bi('Weebit：ReRAM 位元單元','Weebit: ReRAM Bitcell'),'https://www.weebit-nano.com/technology/reram-bitcell/',bi('原廠機制說明','Manufacturer mechanism explanation'),null,bi('雙電極／薄氧化物、成形、正向 SET 與反向 RESET','Two electrodes/thin oxide, forming, positive SET, and reverse RESET'),bi('成形與日常 SET 分開；頁面未給所有材料與逐端點電壓。','Forming is distinct from recurring SET; the page does not specify all materials or terminal voltages.')),
  weebit2021:source('ip-weebit-cell-2021',bi('Weebit／CEA-Leti／Silvaco：氧化物 ReRAM 原始模型','Weebit/CEA-Leti/Silvaco: Original Oxide ReRAM Model'),'https://www.weebit-nano.com/wp-content/uploads/2021/05/Weebit-nano_Silvaco_ReRAM-TCAD_Oxide-Based-Model_IMW_OxRAM_2021_published-on-IEEE_V3-1.pdf',bi('原始研究論文的作者公開版本','Author-posted original research paper'),'2021-05',bi('PDF 第 2–5 頁；II–IV 節、圖 1、3、5、11：Ti／SiOx／TiN 與氧交換','PDF pages 2–5; Sections II–IV and Figures 1, 3, 5, 11: Ti/SiOx/TiN and oxygen exchange'),bi('CEA 130nm 研究單元的模型與電性比對；不是現場直接追蹤離子，也不是所有 SkyWater 宏的配方揭露。','Model/electrical comparison for a CEA 130nm research cell; neither direct operando ion tracking nor a recipe disclosure for every SkyWater macro.')),
  crossbar:source('ip-crossbar-macro',bi('Crossbar：高效能 ReRAM IP 產品簡介','Crossbar: High-Performance ReRAM IP Brief'),'https://www.crossbar-inc.com/assets/white-papers/High-Performance-Memory-Product-Brief.pdf',bi('原廠公開產品簡介','Manufacturer public product brief'),null,bi('第 1–2 頁：hard macro／architectural license、嵌入式宏與改寫','Pages 1–2: hard macro/architectural license, embedded macro, and overwrite'),bi('支持歷史 IP 授權形態；本次未確認 2026 年可新授權的節點與宏清單。','Supports historical IP licensing forms; this review does not confirm a 2026 list of newly licensable nodes or macros.')),
  crossbar2015:source('ip-crossbar-2015',bi('Crossbar：嵌入式 1T1R 與金屬路徑原始發表','Crossbar: Original Embedded 1T1R and Metallic-Path Presentation'),'https://www.crossbar-inc.com/assets/resources/presentations/FMS2015-Slides-Versatile-ReRAM-Technology-and-Applications.pdf',bi('原廠公開會議簡報','Manufacturer public conference presentation'),'2015',bi('第 3、4、7、8、15 頁：金屬路徑、單元與選擇器、BEOL 1T1R','Pages 3, 4, 7, 8, 15: metallic path, cell versus selector, BEOL 1T1R'),bi('嵌入式 1T1R 與高密度 1S1R／1TnR 各有範圍，不合併為同一電路。','Embedded 1T1R and high-density 1S1R/1TnR have separate scopes and are not merged into one circuit.')),
  crossbar2012:source('ip-crossbar-cell-2012',bi('Crossbar：公開專利申請 US20120007035A1','Crossbar: Published Patent Application US20120007035A1'),'https://patents.google.com/patent/US20120007035A1/en',bi('原始公開專利申請','Original published patent application'),'2012-01-12',bi('圖 1–3；[0023]–[0025]、[0037]：Ag／a-Si／p+ poly-Si、正向延伸、負向回縮','Figures 1–3; [0023]–[0025], [0037]: Ag/a-Si/p+ poly-Si, positive extension, negative retraction'),bi('選取其中的具名實施例；以金屬粒子與穿隧路徑描述，未宣稱已證明現售宏皆為此配方或一般陰極成核銀橋。','Selects a named embodiment with metal particles and tunneling paths; does not establish this recipe for all current macros or generic cathode-grown silver bridges.'))
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
  const gf=id==='gf-emram';
  let out=c.line(265,46,265,79)+c.t(286,54,bias)+c.t(20,54,gf?'A / BL*':'A / BL*');
  out+=c.rect(180,79,170,42,'#d9efee')+c.rect(180,121,170,27,C.oxide)+c.rect(180,148,170,42,'#e2e8f4');
  out+=c.t(20,108,gf?'CoFeB FL':'FL')+c.text(20,141,'穿隧障壁','Barrier')+c.t(20,177,gf?'CoFeB RL':'RL');
  out+=c.moment(265,100,angle)+c.moment(265,169,90,C.ref);
  if(gf) out+=c.rect(180,190,170,26,'#edf0f7')+c.t(20,211,'SAF')+c.arrow(240,212,240,194,C.ref,2.2)+c.arrow(290,194,290,212,C.ref,2.2);
  else out+=c.line(265,190,265,216);
  out+=access(c,on,216,'B / SL*');
  if(drive) out+=flow(c,drive,read);
  if(torque) out+=c.path('M304 88C321 89 322 108 308 111',C.spin,3)+c.arrow(313,111,306,111,C.spin,3)+c.t(360,75,'τSTT','start',C.spin);
  return out;
}
function ion(c,x,y,kind) {
  if(kind==='vacancy') return c.dot(x,y,7,C.white,`stroke="${C.vacancy}" stroke-width="2.6"`);
  if(kind==='oxygen') return c.dot(x,y,6,C.oxygen)+c.line(x-3,y,x+3,y,C.white,1.5);
  return c.dot(x,y,6,C.silver);
}
function reram(c,id,on,bias,stage,operation,drive=0) {
  const wb=id==='weebit-reram';
  let out=c.line(265,47,265,79)+c.t(20,54,'TE')+c.t(286,55,bias);
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
const WB_LEGEND=[
  ['Ti / SiOx / TiN',bi('上電極／切換氧化物／下電極；僅限公開 CEA 範例','Top electrode/switching oxide/bottom electrode, limited to the public CEA example')],
  ['O²− / VO',bi('藍色實心圓為氧離子；橘色空心圓為氧空缺，沒有金屬銀','Filled blue circles are oxygen ions; open orange circles are vacancies, with no silver metal')],
  ['TE / BE; WL',bi('上／下電極及選擇閘極；TE 偏壓以 BE 為基準','Top/bottom electrodes and select gate; TE bias is referenced to BE')],
  ['Ic / e−',bi('傳統電流與電子流方向相反；不是氧離子移動方向','Conventional current and electrons flow oppositely; neither denotes oxygen motion')]
];
const CB_LEGEND=[
  ['Ag / a-Si / p+ poly-Si',bi('銀上電極／非晶矽／選定的下端緩衝與接點實施例','Silver top electrode/amorphous silicon/selected lower buffer-contact embodiment')],
  ['Ag',bi('紫色實心區與圓點表示金屬區與粒子；不指定粒子電荷態','Purple region and dots denote metal region/particles without asserting each charge state')],
  ['TE / BE; WL',bi('上／下電極與選擇閘極；1T1R 整合是原廠另一公開來源','Top/bottom electrodes and select gate; 1T1R integration has a separate manufacturer source')],
  ['Ic / e−',bi('傳統電流與電子方向相反；電子可在相鄰粒子間穿隧','Conventional current opposes electron motion; electrons may tunnel between neighboring particles')]
];
const legendFor=(id,language)=>(id==='weebit-reram'?WB_LEGEND:id==='crossbar-reram'?CB_LEGEND:MRAM_LEGEND).map(([symbol,meaning])=>({symbol,meaning:pick(meaning,language)}));

function record(c,title,caption,state,stimulus,body,language,sourceIds) {
  const localTitle=pick(title,language),localCaption=pick(caption,language);
  return {id:c.prefix,title:localTitle,state:pick(state,language),stimulus:pick(stimulus,language),caption:localCaption,svg:svg(c,localTitle,localCaption,body),sourceIds};
}

function magneticFrames(id,operation,language,sourceIds) {
  const gf=id==='gf-emram',read=operation==='read',reverse=operation==='erase';
  const frames=[];
  if(read){
    const titles=[bi('選取前：P 磁態已保留','Before Selection: P Is Retained'),bi(gf?'低偏壓產生感測電流':'定電流產生感測電壓',gf?'Low Bias Produces Sense Current':'Forced Current Produces Sense Voltage'),bi('鎖存後撤去讀取刺激','Latch and Remove Read Stimulus')];
    const captions=[bi('同一個單元從既有 P 狀態開始，WL 關閉；讀取不先翻轉磁矩。','The same cell starts in retained P with WL off; reading does not first reverse its moment.'),bi(gf?'WL 開啟，低讀取偏壓沿 MTJ 與選擇元件形成電流；同偏壓下 P 電流高於 AP。':'依 2019 年架構施加小感測電流，量得含存取路徑的電壓；同電流下 P 電壓低於 AP。',gf?'WL enables a low-bias current through the MTJ/access device; P has greater current than AP at equal bias.':'Following the 2019 architecture, a small forced current produces a voltage including access-path resistance; P voltage is below AP at equal current.'),bi('感測器鎖存後關閉 WL；畫中的自由層與參考層仍為 P，沒有讀後還原週期。','After the sensor latches, WL turns off; free/reference layers remain P without a read-restore cycle.')];
    for(let i=0;i<3;i++){
      const c=canvas(id,operation,language,i+1);
      let body=mtj(c,id,90,i===1,i===1?(gf?'Vr':'Ir'): '0',i===1?1:0,true);
      if(i===1) body+=c.rect(356,235,176,47,'#eaf3fa','rx="7"')+c.t(444,266,gf?'IP > IAP':'VP < VAP','middle',C.electron);
      if(i===2) body+=c.rect(370,116,150,64,'#edf6f4','rx="9"')+c.t(445,155,'SA: P','middle',C.free);
      frames.push(record(c,titles[i],captions[i],bi('P 保持不變','P remains unchanged'),bi(i===1?'WL 開啟；小讀取刺激':'WL 關閉；讀取刺激為零',i===1?'WL on; small read stimulus':'WL off; read stimulus zero'),body,language,sourceIds));
    }
    return frames;
  }
  const target=reverse?'AP':'P',initial=reverse?'P':'AP';
  const angles=reverse?[90,20,-90,-90]:[-90,20,90,90];
  const drive=gf?(reverse?1:-1):(reverse?-1:1);
  const labels=gf?(reverse?'I−':'I+'):(reverse?'Drive B':'Drive A');
  const titles=[bi(`原始 ${initial} 磁態`,`Initial ${initial} State`),bi('選取並施加反向自旋驅動','Select and Apply Spin Drive'),bi(`自由層切換至 ${target}`,`Free Layer Switches to ${target}`),bi(`撤去驅動，保留 ${target}`,`Remove Drive and Retain ${target}`)];
  const captions=[bi(`WL 關閉，單元保存 ${initial}。此序列的目標是${reverse?'反向覆寫':'寫入'} ${target}。`,`WL is off and the cell retains ${initial}; this sequence ${reverse?'overwrites':'writes'} ${target}.`),bi(gf?`WL 開啟，${reverse?'FL→RL':'RL→FL'} 的傳統電流施加 STT，電子方向相反。`:'WL 開啟，教材方向 A/B 的驅動穿過 MTJ；電子流與傳統電流相反，層對實際 BL／SL 的映射需由 PDK 確認。',gf?`WL turns on; conventional current ${reverse?'FL-to-RL':'RL-to-FL'} applies STT, with opposite electron flow.`:'WL turns on and teaching drive A/B crosses the MTJ; electron and conventional-current arrows oppose each other. The actual BL/SL layer mapping requires the PDK.'),bi(`磁化切換至 ${target}；中間角度不表示量測軌跡或確定性切換時間。`,`Magnetization reaches ${target}; the intermediate angle is not a measured trajectory or deterministic switching time.`),bi('關閉 WL 並撤去偏壓，磁態保留；反向資料由另一寫入方向覆寫，沒有浮動閘抹除步驟。','Turn WL off and remove bias to retain the moment; the other drive overwrites the opposite data without a floating-gate erase step.')];
  for(let i=0;i<4;i++){
    const c=canvas(id,operation,language,i+1),active=i===1||i===2;
    const body=mtj(c,id,angles[i],active,active?labels:'0',active?drive:0,false,i===1)+pulse(c,i,reverse);
    frames.push(record(c,titles[i],captions[i],bi(i===0?initial:i===1?'切換中':target,i===0?initial:i===1?'Switching':target),bi(active?'WL 開啟；MTJ 雙向驅動':'WL 關閉；驅動為零',active?'WL on; bidirectional MTJ drive':'WL off; drive zero'),body,language,sourceIds));
  }
  return frames;
}

function resistiveFrames(id,operation,language,sourceIds) {
  const wb=id==='weebit-reram',read=operation==='read',reverse=operation==='erase';
  const frames=[];
  if(read){
    const titles=[bi('選取前：低阻結構已保留','Before Selection: Low-R Structure Is Retained'),bi('小偏壓感測導電路徑','Sense the Path at Small Bias'),bi('鎖存後隔離單元','Latch and Isolate the Cell')];
    for(let i=0;i<3;i++){
      const c=canvas(id,operation,language,i+1);
      let body=reram(c,id,i===1,i===1?'＋Vr':'0',i,'read',i===1?1:0);
      if(i===1)body+=c.rect(362,235,170,47,'#eaf3fa','rx="7"')+c.t(447,266,'IL > IH','middle',C.electron);
      if(i===2)body+=c.rect(370,116,150,64,'#edf6f4','rx="9"')+c.t(445,155,'SA: LRS','middle',C.free);
      const caption=i===0?bi('同一單元從已保留的 LRS 開始，選擇閘極關閉。HRS 可沿相同程序讀取。','The same cell starts in retained LRS with selection off. HRS can follow the same read sequence.'):i===1?bi(wb?'小偏壓感測氧空缺路徑；同偏壓下 ILRS > IHRS，未以讀取脈衝重排氧離子。':'小偏壓感測金屬粒子路徑；同偏壓下 ILRS > IHRS，電流可經粒子間穿隧。',wb?'A small bias senses the vacancy path; ILRS > IHRS at equal bias, without using the read pulse to rearrange oxygen.':'A small bias senses the metal-particle path; ILRS > IHRS at equal bias and transport can involve interparticle tunneling.'):bi('鎖存後撤去偏壓，原導電路徑保留；實際讀取擾動限制仍由供應商條件決定。','After latching, remove bias and retain the original path; actual read-disturb limits remain supplier-specific.');
      frames.push(record(c,titles[i],caption,bi('LRS 結構保持','LRS structure retained'),bi(i===1?'WL 開啟；TE 小正偏壓':'WL 關閉；TE 偏壓為零',i===1?'WL on; small positive TE bias':'WL off; TE bias zero'),body,language,sourceIds));
    }
    return frames;
  }
  const titles=wb?(reverse?[bi('原氧空缺路徑導通','Initial Vacancy Path Conducts'),bi('反向偏壓使氧回入','Reverse Bias Returns Oxygen'),bi('靠近下端的路徑中斷','The BE-Side Path Breaks'),bi('撤去偏壓，保留高阻','Remove Bias and Retain High R')]:[bi('初始高阻間隙','Initial High-R Gap'),bi('氧離子移向 Ti 界面','Oxygen Moves toward the Ti Interface'),bi('氧空缺路徑恢復導通','Vacancy Path Reconnects'),bi('撤去偏壓，保留低阻','Remove Bias and Retain Low R')]):(reverse?[bi('原粒子路徑為低阻','Initial Particle Path Is Low R'),bi('反向偏壓驅動路徑回縮','Reverse Bias Retracts the Path'),bi('粒子路徑形成較大間隙','A Larger Gap Forms in the Particle Path'),bi('撤去偏壓，保留高阻','Remove Bias and Retain High R')]:[bi('成形後的高阻初態','High-R State after Forming'),bi('正偏壓使粒子路徑延伸','Positive Bias Extends the Particle Path'),bi('粒子間穿隧路徑增強','Interparticle Tunneling Path Strengthens'),bi('撤去偏壓，保留低阻','Remove Bias and Retain Low R')]);
  const captions=wb?(reverse?[bi('氧空缺導電路徑已形成；這次操作把 LRS 改為 HRS。','A vacancy path already exists; this operation changes LRS to HRS.'),bi('TE 相對 BE 為負，Ti 界面的氧返回 SiOx；藍色箭頭是氧離子移動。','TE is negative relative to BE; oxygen returns from the Ti interface into SiOx. Blue arrows denote oxygen motion.'),bi('氧與空缺復合，在靠近 BE 的關鍵位置打開間隙；RESET 不代表整層完全恢復原始材料。','Oxygen recombines with vacancies and opens a critical BE-side gap; RESET does not restore the entire layer to its as-fabricated material.'),bi('撤壓後保留 HRS；空缺與界面氧仍可存在。','HRS remains after bias removal; vacancies and interfacial oxygen may remain.')]:[bi('從成形後的 HRS 開始，BE 側有局部間隙；不是每次重新成形。','Start in a formed HRS with a local BE-side gap; forming is not repeated on every cycle.'),bi('TE 相對 BE 為正，O²− 朝 Ti 移動並參與界面交換；選擇電晶體限制電流。','Positive TE drives O²− toward Ti for interfacial exchange; the access transistor limits current.'),bi('缺氧位置的導電路徑接通，電流上升並受限流約束。','The oxygen-deficient conduction path reconnects; current rises under compliance.'),bi('撤去偏壓與 WL 後，路徑保留為 LRS。','After removing bias and WL selection, the path retains LRS.')]):(reverse?[bi('從既有的低阻粒子路徑開始；上端金屬區與細路徑分開表示。','Start with the existing low-R particle path; the upper metal region and narrow path are shown separately.'),bi('TE 負偏壓使細粒子路徑向上端金屬區回縮或變得不連續；未指定每個粒子的電荷態。','Negative TE bias retracts or disconnects the narrow particle path toward the upper metal region; each particle charge state is unspecified.'),bi('靠近下端的有效間距增加，穿隧電流減少；上端殘留金屬區未消失。','The effective lower-side spacing increases and tunneling current falls; the upper residual metal region remains.'),bi('撤去偏壓後保留 HRS。這是反向 RESET，不是先做區塊抹除再寫入。','HRS remains after bias removal. This is reverse RESET, without a preceding block-erase cycle.')]:[bi('成形已在上端建立金屬區；HRS 初態的細粒子路徑尚未有效延伸到下端。','Forming has established an upper metal region; the HRS particle path does not yet extend effectively toward the lower contact.'),bi('正 TE 偏壓使路徑由上端金屬區向 BE 延伸；此圖依該專利，沒有改畫成通用的陰極向上成核。','Positive TE bias extends the path from the upper metal region toward BE, following this patent rather than assuming generic upward cathodic nucleation.'),bi('相鄰金屬粒子距離縮短，穿隧導電增強；圖中的圓點不是已證實的完整實心銀橋。','Closer neighboring metal particles strengthen tunneling conduction; the dots do not claim a fully solid silver bridge.'),bi('關閉選擇閘極並撤壓，保留低阻路徑。','Turn selection off and remove bias to retain the low-R path.')]);
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
  const meta=META[id],magnetic=id==='numem-mram'||id==='gf-emram';
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
