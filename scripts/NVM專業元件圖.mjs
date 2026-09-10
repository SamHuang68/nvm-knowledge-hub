const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// 各圖呈現具名的原理結構；材料配方、厚度與商用製程不由示意圖推定。
export function bitcellFigure(id, title, language = 'en', compact = false) {
  const en = language === 'en';
  const p = `bc-${id}-${compact ? 'preview' : 'detail'}-${language}`;
  const g = name => `url(#${p}-${name})`;
  const palette = { metal:'#7e97ab', active:'#cd9b61', oxide:'#d9e6eb', silicon:'#a8b8c6', trap:'#ba8661', ferro:'#97789d', free:'#32949a', reference:'#425976' };
  const path = (d, fill, extra='') => `<path d="${d}" fill="${fill}" ${extra}/>`;
  const line = (d, color='#516979', width=2, extra='') => path(d, 'none', `stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}`);
  const circle = (x,y,r,fill,extra='') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
  const arrow = (d,color='#bc7134') => line(d,color,3,`marker-end="url(#${p}-arrow)"`);
  const txt = (x,y,text,extra='') => `<text x="${x}" y="${y}" ${extra}>${escape(text)}</text>`;
  const slab = (x,y,w,h,fill,depth=38) => path(`M${x} ${y}l${depth} -20h${w}l-${depth} 20Z`,fill, 'stroke="#fff" stroke-width="1"') + path(`M${x} ${y}h${w}v${h}H${x}Z`,fill) + path(`M${x+w} ${y}l${depth} -20v${h}l-${depth} 20Z`,fill, 'style="filter:brightness(.8)"') + line(`M${x} ${y}h${w}`, '#fff',1);
  const disk = (cx,y,rx,h,fill,ry=26) => path(`M${cx-rx} ${y}v${h}a${rx} ${ry} 0 0 0 ${rx*2} 0v-${h}`,fill) + `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="#f5f8fa" stroke-width="1.5"/>` + `<ellipse cx="${cx}" cy="${y+h}" rx="${rx}" ry="${ry}" fill="none" stroke="#516979" stroke-opacity=".35"/>`;
  const call = (n,x,y,tx,ty,bendY) => compact ? '' : line(bendY === undefined ? `M${tx} ${ty}L${x} ${ty}V${y}` : `M${tx} ${ty}h${x>tx?26:-26}V${bendY}H${x}V${y}`, '#718391',1.3) + circle(tx,ty,3,'#718391') + circle(x,y,13,'#fff','stroke="#627c8e" stroke-width="1.3"') + txt(x,y+5,String(n),'text-anchor="middle" class="bc-number"');
  const charge = (x,y) => circle(x,y,6,'#965c2a') + line(`M${x-3} ${y}h6`,'#fff',1.4);
  const spin = (x,y,up=true,color='#fff',half=14) => line(`M${x} ${up?y+half:y-half}V${up?y-half:y+half}m-5 ${up?7:-7}l5 ${up?-7:7} 5 ${up?7:-7}`,color,2.5);
  const domains = (xs,y) => xs.map((x,i)=>spin(x,y,i%3!==2,'#fff')).join('');
  let drawing = '', labels=[], mechanism, view;
  const set = (zh, english) => en ? english : zh;
  const mos = (mode) => {
    const fe = mode==='fefet', trap=mode==='sonos', split=mode==='nor';
    let out=slab(160,258,394,83,g('silicon'));
    out+=path('M178 258h85v35q-43 23-85 0Z',g('implant'))+path('M451 258h85v35q-43 23-85 0Z',g('implant'));
    out+=line('M263 262H450','#298f94',4)+txt(215,285,'n+','text-anchor="middle" class="bc-small"')+txt(494,285,'n+','text-anchor="middle" class="bc-small"');
    const gx=split?333:278, gw=split?142:170;
    out+=slab(gx-8,244,gw+16,13,palette.oxide);
    if(fe) out+=slab(gx,209,gw,34,g('ferro'))+domains([gx+25,gx+63,gx+105,gx+145],225);
    else out+=slab(gx,210,gw,30,trap?g('trap'):g('floating'))+[gx+22,gx+57,gx+95,gx+135].map(x=>charge(x,225)).join('');
    if(!fe) out+=slab(gx-8,193,gw+16,14,palette.oxide);
    out+=slab(gx-4,154,gw+8,fe?52:37,g('metal'));
    out+=slab(gx+gw/2-12,94,24,60,g('contact'),20)+slab(208,214,24,40,g('contact'),20)+slab(482,214,24,40,g('contact'),20);
    out+=txt(gx+gw/2+8,67,fe?'G / WL':'CG / WL','text-anchor="middle"')+line(`M${gx+gw/2+8} 76v17`)+txt(220,192,'S','text-anchor="middle"')+txt(495,192,'D','text-anchor="middle"');
    if(split) out+=slab(230,244,74,13,palette.oxide,20)+slab(230,205,74,37,g('metal'),20)+txt(253,173,'SG','text-anchor="middle"')+line('M253 180v16');
    if(fe) out+=arrow('M296 263H435','#298f94');
    else out+=arrow(split?'M304 267q26 -3 34 -42':'M360 283V231');
    return out;
  };
  if (['eeprom','nor','sonos','fefet'].includes(id)) {
    drawing=mos(id)+call(1,108,113,365,170)+call(2,618,186,410,224)+call(3,625,278,430,250)+call(4,116,317,281,262);
    labels=[set('控制閘極與字元線接點','Control Gate and Word-Line Contact'),set(id==='fefet'?'可切換極化的鐵電層':id==='sonos'?'氮化物內的局部電荷陷阱':'被介電層包覆的導電浮動閘極',id==='fefet'?'Ferroelectric Layer with Switchable Polarization':id==='sonos'?'Localized Charge Traps in Silicon Nitride':'Conductive Floating Gate Enclosed by Dielectric'),set('介電層／通道界面','Dielectric–Channel Interface'),set('源極、汲極與矽通道；讀取臨界電壓差','Source, Drain, and Silicon Channel; Read the Threshold Shift')];
    mechanism=set(id==='nor'?'分離閘極變體：局部注入把電荷送入浮動閘極。':id==='fefet'?'以極化狀態改變通道臨界電壓；界面陷阱仍影響讀取視窗。':id==='sonos'?'電子分布在絕緣捕捉層的局部陷阱，與導電浮動閘極不同。':'電子經穿隧或特定注入路徑進出絕緣包覆的浮動閘極。',id==='nor'?'Split-Gate Variant: Local Injection Transfers Charge into the Floating Gate.':id==='fefet'?'Polarization Shifts the Channel Threshold; Interface Traps Also Affect the Read Window.':id==='sonos'?'Electrons Occupy Localized Traps in an Insulator, Unlike a Conductive Floating Gate.':'Electrons Enter or Leave an Insulated Floating Gate through Tunneling or an Implementation-Specific Injection Path.');
    view=set('元件剖面與接點','Device Cross-Section and Contacts');
  } else if(id==='efuse') {
    drawing=slab(145,230,400,85,g('dielectric'),48);
    drawing+=path('M169 173l42 -24h101l36 34h43l36 -34h110l-42 24H424l-35 34h-70l-36 -34Z',g('copper'),'stroke="#956d46" stroke-width="1.3"');
    drawing+=path('M169 173v34h114l36 34h70l35 -34h71v-34h-71l-35 34h-70l-36 -34Z',g('metal'));
    drawing+=path('M341 181l15 3-7 13 13 7-18 20-9 -7 9 -11-12 -9Z','#f8fafb','stroke="#965b34" stroke-width="1.2"');
    [205,230,265,293,404,448,468].forEach((x,i)=>drawing+=line(`M${x} 178l${i%2?12:-8} 22`,'#bdcbd5',1));
    drawing+=arrow('M123 118H290')+arrow('M399 118H565')+txt(350,100,'I PROGRAM','text-anchor="middle" class="bc-small"');
    drawing+=slab(195,193,28,37,g('contact'),14)+slab(461,193,28,37,g('contact'),14);
    drawing+=call(1,101,215,216,190)+call(2,600,137,354,204)+call(3,598,301,464,275)+call(4,105,328,210,222);
    labels=[set('導體與晶粒結構','Conductor and Grain Structure'),set('電流集中頸部；形成高電阻區或空洞','Current-Concentrating Neck; High-Resistance Region or Void'),set('介電隔離與下方互連層','Dielectric Isolation and Underlying Interconnect'),set('接點通往選擇管與感測電路','Contacts to Selector and Sense Circuit')];
    mechanism=set('以電流與局部熱效應永久改變指定導體區域的電阻。','Current and Local Heating Permanently Change Resistance in a Designed Conductor Region.');
    view=set('金屬熔絲局部剖視','Metal-Link Cutaway');
  } else if(id==='antifuse') {
    drawing=slab(177,272,365,74,g('silicon'))+slab(267,252,166,16,g('oxide'))+slab(273,160,155,89,g('metal'))+slab(335,93,30,65,g('contact'),20);
    drawing+=path('M347 245l8 7-5 7 7 6-8 11','#bd713b','stroke="#a56234" stroke-width="3"')+circle(350,260,26,'#ddad6a','opacity=".18"');
    drawing+=arrow('M472 173v103')+txt(488,228,'V PROGRAM','class="bc-small"')+txt(350,65,'G','text-anchor="middle"');
    drawing+=call(1,109,158,344,191)+call(2,615,128,420,257)+call(3,603,322,350,260)+call(4,111,326,331,310);
    labels=[set('上電極／閘極','Upper Electrode / Gate'),set('寫入前保持絕緣的薄介電層','Thin Dielectric, Insulating before Programming'),set('局部介電崩潰形成永久導通點','Localized Breakdown Creates a Permanent Conduction Path'),set('半導體下電極；偏壓與選擇管依實作決定','Semiconductor Lower Electrode; Biasing and Selector Are Implementation-Specific')];
    mechanism=set('MOS 反熔絲範例：局部介電崩潰使高電阻狀態轉為低電阻。','MOS Antifuse Example: Local Dielectric Breakdown Changes a High-Resistance State to a Low-Resistance State.');
    view=set('MOS 反熔絲剖面','MOS Antifuse Cross-Section');
  } else if(id==='nand') {
    for(let i=4;i>=0;i--) {
      const y=320-i*46;
      drawing+=slab(220,y,248,20,g('metal'),52)+slab(220,y+22,248,20,g('dielectric'),52);
      drawing+=txt(174,y+16,`WL${4-i}`,'class="bc-small" text-anchor="end"')+line(`M185 ${y+10}h34`,'#718391',1.2);
    }
    // 前側開口露出連續垂直通道及環狀介質；各字元線不畫成串接導體。
    drawing+=path('M306 109h82v244h-82Z',g('oxide'))+path('M320 109h54v244h-54Z',g('trap'))+path('M328 109h38v244h-38Z','#f8fcfd')+path('M333 109h28v244h-28Z',g('silicon'))+path('M342 109h10v244h-10Z','#e1ebf0');
    drawing+=disk(347,109,41,7,g('oxide'),12)+disk(347,108,27,7,g('trap'),8)+disk(347,107,19,7,'#f8fcfd',6)+disk(347,106,14,7,g('silicon'),4)+disk(347,105,5,7,'#e1ebf0',2);
    drawing+=line('M347 62v18h-11v26')+circle(336,106,3,'#526f83')+txt(347,43,'BL','text-anchor="middle"')+arrow('M418 158v129','#298f94');
    drawing+=call(1,601,87,464,159)+call(2,608,193,325,205)+call(3,611,307,337,281)+call(4,114,385,348,343);
    labels=[set('彼此隔離的環繞字元線','Separately Addressed, Gate-All-Around Word Lines'),set('阻擋層、電荷捕捉層與穿隧層的環狀記憶膜','Annular Memory Film: Blocking, Charge-Trap, and Tunnel Layers'),set('連續的垂直半導體通道','Continuous Vertical Semiconductor Channel'),set('中心介電填充；選擇閘與完整串列另見內文','Dielectric Core; Select Gates and the Complete String Are Discussed in the Text')];
    mechanism=set('多層字元線共享垂直通道。圖中剖開前側，露出徑向材料順序。','Stacked Word Lines Share a Vertical Channel. The Front Cutaway Exposes the Radial Material Sequence.');
    view=set('3D 電荷捕捉 NAND 剖視','3D Charge-Trap NAND Cutaway');
  } else if(['toggle','stt','sot'].includes(id)) {
    const sot=id==='sot', toggle=id==='toggle';
    drawing+=sot?slab(158,291,371,29,g('spinmetal'),48):slab(253,293,178,33,g('metal'),38);
    drawing+=disk(350,267,103,24,sot?palette.free:palette.reference)+disk(350,250,103,12,g('barrier'))+(toggle ? disk(350,230,103,12,palette.free)+disk(350,227,103,3,'#c5d9de')+disk(350,210,103,17,palette.free) : disk(350,210,103,32,sot?palette.reference:palette.free))+disk(350,179,91,23,g('metal'));
    drawing+=slab(332,106,36,57,g('contact'),22)+line('M350 54v45')+txt(350,36,'BL / READ','text-anchor="middle" class="bc-small"');
    if(toggle) {
      drawing+=arrow('M315 239h69','#fff')+arrow('M384 262h-69','#fff')+arrow('M311 303h73','#fff');
      drawing+=slab(179,96,342,17,g('copper'),30)+arrow('M146 92H548');
      drawing+=path('M253 374l28 18 164 -46-28 -18Z',g('copper'))+arrow('M228 398L473 330');
      drawing+=line('M517 128q81 66 8 118','#bd7134',2,'stroke-dasharray="6 6"')+txt(579,181,'H','class="bc-small"');
    } else {
      [319,349,379].forEach(x=>{drawing+=spin(x,247,true,'#fff',10);drawing+=spin(x,302,true,'#fff',10);});
      if(sot) drawing+=arrow('M110 332H554')+txt(351,363,'I WRITE','text-anchor="middle" class="bc-small"')+arrow('M500 271v-75','#298f94')+txt(523,222,'I READ','class="bc-small"');
      else drawing+=arrow('M502 139v156')+txt(523,220,'I WRITE / READ','class="bc-small"');
    }
    drawing+=call(1,108,155,300,sot?302:247)+call(2,619,116,401,276)+call(3,618,321,401,sot?247:302)+call(4,111,350,sot?225:toggle?230:286,sot?308:toggle?109:321);
    labels=[set(toggle?'合成反鐵磁自由層：兩磁層經薄間隔層耦合':'可切換磁化方向的自由層',toggle?'Synthetic Antiferromagnetic Free Structure: Two Magnetic Layers Coupled through a Thin Spacer':'Free Layer with Switchable Magnetization'),set('超薄穿隧障壁（典型為 MgO）','Ultrathin Tunnel Barrier, Typically MgO'),set('提供讀取基準的參考磁性層','Reference Magnetic Layer for Resistance Sensing'),set(sot?'橫向自旋軌道材料通道，緊鄰自由層':toggle?'正交寫入導線以磁場切換接面':'垂直接面電流路徑，通往選擇管',sot?'Lateral Spin-Orbit Channel Directly Adjacent to the Free Layer':toggle?'Orthogonal Write Conductors Switch the Junction by Magnetic Fields':'Vertical Junction Current Path to the Selector')];
    mechanism=set(sot?'三端拓撲：橫向寫入電流與垂直穿隧讀取路徑分開。':toggle?'平面磁化範例：正交導線提供切換磁場，讀取接面電阻。':'垂直磁化範例：電流穿過障壁產生自旋轉移力矩，讀取 P／AP 電阻差。',sot?'Three-Terminal Topology: Lateral Write Current and Vertical Tunneling Read Current Use Separate Paths.':toggle?'In-Plane Magnetization Example: Orthogonal Conductors Supply Switching Fields; Junction Resistance Is Read.':'Perpendicular-Magnetization Example: Current through the Barrier Supplies Spin-Transfer Torque; Read the P/AP Resistance Difference.');
    view=set(toggle?'磁場切換 MTJ 與導線':sot?'SOT 接面與自旋通道':'垂直磁化 MTJ 堆疊',toggle?'Field-Switched MTJ and Conductors':sot?'SOT Junction and Spin Channel':'Perpendicular MTJ Stack');
  } else if(['vcm','ecm'].includes(id)) {
    const ecm=id==='ecm';
    drawing=slab(232,293,262,36,g('metal'))+slab(232,158,262,132,g('oxide'))+slab(232,119,262,36,ecm?g('copper'):g('metal'));
    drawing+=line('M363 64v55M363 329v45')+txt(363,48,'TE','text-anchor="middle"')+txt(363,401,'BE','text-anchor="middle"');
    if(ecm) {
      drawing+=path('M328 292q5 -18 16 -43t6 -68l12 -24 10 31q-1 30 14 58t14 46Z',g('copper'),'opacity=".9"');
      [[315,177],[393,195],[321,226],[410,247],[401,168]].forEach(([x,y])=>drawing+=circle(x,y,7,'#b77839')+txt(x,y+4,'+','text-anchor="middle" class="bc-ion"'));
      drawing+=arrow('M418 177v61');
    } else {
      for(let i=0;i<9;i++) for(let j=0;j<5;j++) {const x=252+i*26, y=177+j*23; if(Math.abs(x-(350+Math.sin(j*2)*15))>21) drawing+=circle(x,y,3.5,'#a4bcc9');}
      [[351,168],[346,184],[355,199],[340,213],[346,231],[360,245],[350,260],[359,278],[347,289]].forEach(([x,y])=>drawing+=circle(x,y,7,'#fff','stroke="#b6783f" stroke-width="2"'));
      drawing+=line('M351 168l-5 16 9 15-15 14 6 18 14 14-10 15 9 18-12 11','#b6783f',2,'stroke-dasharray="3 5"');
      drawing+=arrow('M418 184v63','#298f94');
    }
    drawing+=call(1,116,110,346,131)+call(2,607,185,439,208)+call(3,117,271,355,235)+call(4,608,330,437,311);
    labels=[set(ecm?'提供可移動金屬離子的活性電極':'上電極；氧交換能力依材料而異',ecm?'Active Electrode Supplying Mobile Metal Ions':'Upper Electrode; Oxygen-Exchange Behavior Depends on Material'),set(ecm?'離子導體／固態電解質':'氧化物晶格與氧相關缺陷',ecm?'Ion Conductor / Solid Electrolyte':'Oxide Lattice and Oxygen-Related Defects'),set(ecm?'電化學還原形成的金屬細絲':'氧空缺富集形成的局部導電路徑',ecm?'Metal Filament Formed by Electrochemical Reduction':'Localized Conduction Path Enriched in Oxygen Vacancies'),set(ecm?'相對惰性的下電極':'下電極與介面區',ecm?'Relatively Inert Counter Electrode':'Lower Electrode and Interface Region')];
    mechanism=set(ecm?'金屬離子移動與還原建立橋接；反向操作可使細絲溶解。':'缺陷重分布改變局部導電路徑；不是所有商用 ReRAM 都公開此機制。',ecm?'Metal-Ion Migration and Reduction Create a Bridge; Reverse Operation Can Dissolve the Filament.':'Defect Redistribution Alters a Local Conduction Path; This Mechanism Is Not Disclosed for Every Commercial ReRAM.');
    view=set(ecm?'金屬離子細絲剖面':'氧化物缺陷細絲剖面',ecm?'Metal-Ion Filament Cross-Section':'Oxide Defect-Filament Cross-Section');
  } else if(id==='pcm') {
    drawing=slab(169,305,381,45,g('dielectric'))+slab(307,263,85,63,g('heater'),31)+slab(214,183,289,78,g('pcm'))+slab(214,151,289,30,g('metal'));
    drawing+=path('M282 260a64 57 0 0 1 131 0Z',g('amorphous'),'stroke="#a86538" stroke-width="1.5"');
    drawing+=line('M349 265v63','#b66c31',3)+arrow('M350 364V276')+line('M351 95v48')+txt(351,77,'TE','text-anchor="middle"');
    [[251,217],[461,225],[255,248],[439,202],[473,250]].forEach(([x,y])=>drawing+=path(`M${x} ${y}l8 -7 10 4 1 12-10 7-9 -7Z`,'none','stroke="#8d6f82" stroke-width="1"'));
    drawing+=call(1,118,121,349,170)+call(2,611,188,460,224)+call(3,607,297,351,237)+call(4,118,325,350,294);
    labels=[set('上電極','Top Electrode'),set('相變材料的結晶區','Crystalline Phase-Change Material'),set('RESET 後的局部非晶區；SET 使其結晶','Localized Amorphous Region after RESET; SET Recrystallizes It'),set('窄加熱器與熱侷限區','Narrow Heater and Thermally Confined Region')];
    mechanism=set('蘑菇型範例：短而強的 RESET 脈衝熔融後急冷；較溫和的 SET 脈衝促進結晶。','Mushroom-Cell Example: A Short, Strong RESET Pulse Melts and Quenches; a Milder SET Pulse Promotes Crystallization.');
    view=set('蘑菇型相變單元剖面','Mushroom Phase-Change Cell');
  } else if(['feram','ftj'].includes(id)) {
    const ftj=id==='ftj';
    drawing=slab(234,273,252,41,g('metal'))+slab(234,ftj?248:195,252,ftj?22:75,g('ferro'))+slab(234,ftj?205:151,252,41,g('metal'));
    drawing+=(ftj?[266,302,338,374,410,446].map((x,i)=>spin(x,259,i%3!==2,'#fff',7)).join(''):domains([266,302,338,374,410,446],233))+line(`M361 97v${ftj?108:54}M361 314v50`)+txt(361,75,ftj?'TE':'PL','text-anchor="middle"');
    if(ftj) drawing+=arrow('M523 194v132','#298f94')+txt(546,266,'I TUNNEL','class="bc-small"');
    else drawing+=line('M361 364H201V345H215M201 306V318H215M215 318V345M195 318V345M164 331H195')+txt(145,338,'WL','class="bc-small" text-anchor="end"')+txt(204,289,'BL','class="bc-small" text-anchor="middle"');
    drawing+=call(1,110,110,351,ftj?221:169)+call(2,616,182,424,ftj?257:230,ftj?170:undefined)+call(3,611,329,420,290)+call(4,111,263,ftj?351:276,ftj?257:234);
    labels=[set(ftj?'上電極與界面':'極板線與上電極',ftj?'Top Electrode and Interface':'Plate Line and Upper Electrode'),set(ftj?'可穿隧的超薄鐵電障壁':'可翻轉極化的鐵電電容材料',ftj?'Ultrathin Ferroelectric Tunnel Barrier':'Ferroelectric Capacitor Material with Switchable Polarization'),set(ftj?'下電極；界面不對稱影響障壁輪廓':'儲存節點連接選擇電晶體',ftj?'Bottom Electrode; Interface Asymmetry Affects the Barrier Profile':'Storage Node Connected to an Access Transistor'),set(ftj?'極化改變穿隧障壁輪廓與電阻':'感測切換電荷；破壞式讀取須回寫',ftj?'Polarization Changes the Tunneling Barrier Profile and Resistance':'Sense Switching Charge; Destructive Read Requires Restore')];
    mechanism=set(ftj?'以極化方向調變穿隧電流；圖中特意放大障壁厚度以呈現材料順序。':'1T1C 拓撲：選擇電晶體連接電容儲存節點，極板脈衝配合感測與回寫。',ftj?'Polarization Modulates Tunneling Current; the Barrier Is Exaggerated to Show the Material Sequence.':'1T1C Topology: an Access Transistor Connects to the Capacitor Storage Node; Plate Pulses Work with Sensing and Restore.');
    view=set(ftj?'鐵電穿隧接面剖面':'鐵電電容與選擇管',ftj?'Ferroelectric Tunnel Junction':'Ferroelectric Capacitor and Access Transistor');
  } else throw new Error(`尚未建立元件圖：${id}`);

  const gradients = [['metal','#cedbe4','#7c94a8'],['contact','#adc1d0','#698499'],['silicon','#c0ced9','#91a5b6'],['implant','#6b9aaf','#448198'],['oxide','#edf6f8','#bfd4de'],['dielectric','#e6edf1','#c9d5de'],['floating','#e4c18d','#bb864a'],['trap','#dcad87','#b27852'],['ferro','#c6b0c9','#8b6b98'],['copper','#e8c59c','#ac713a'],['spinmetal','#6da5ae','#39727e'],['barrier','#ebefc2','#b4c087'],['heater','#a0807c','#605164'],['pcm','#d1bdd0','#a68aa8'],['amorphous','#e8b682','#c4824c']].map(([name,start,end])=>`<linearGradient id="${p}-${name}" x1="0" y1="0" x2=".85" y2="1"><stop stop-color="${start}"/><stop offset="1" stop-color="${end}"/></linearGradient>`).join('');
  const svg=`<svg class="bc-illustration" viewBox="0 0 740 430" role="img" aria-labelledby="${p}-title ${p}-desc" xmlns="http://www.w3.org/2000/svg"><title id="${p}-title">${escape(title)} — ${escape(view)}</title><desc id="${p}-desc">${escape(labels.map((label,i)=>`${i+1}: ${label}`).join('; '))}. ${escape(mechanism)}</desc><defs>${gradients}<marker id="${p}-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 1L7 4 1 7" fill="none" stroke="context-stroke" stroke-width="1.8"/></marker><filter id="${p}-shadow" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="13"/></filter></defs><ellipse cx="374" cy="366" rx="206" ry="19" fill="#486174" opacity=".1" filter="${g('shadow')}"/>${drawing}</svg>`;
  if(compact) return svg;
  return `<div class="bc-figure-head"><span>${escape(view)}</span><span>${en?'PRINCIPLE RECONSTRUCTION · NOT TO SCALE':'原理重建 · 非比例'}</span><button type="button" class="bc-zoom-trigger" data-zoom-diagram>${en?'Enlarge Diagram':'放大元件圖'}</button></div>${svg}<ol class="bc-legend">${labels.map((label,i)=>`<li><b>${i+1}</b><span>${escape(label)}</span></li>`).join('')}</ol><p class="bc-mechanism">${escape(mechanism)}</p>`;
}
