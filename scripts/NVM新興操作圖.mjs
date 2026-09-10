/**
 * 新興 NVM 操作的原創教材圖版。
 * 圖形是機制示意，不含實測曲線、產品剖面或通用製程規格。
 * @typedef {{id:string,title:string,caption:string,svg:string,state:string,stimulus:string}} OperationFrame
 * @typedef {{id:string,label:string,url:string,kind:string,date:string,locator:string,limit:string}} OperationSource
 * @typedef {{title:string,summary:string,variant:string,frames:OperationFrame[],legend:{symbol:string,meaning:string}[],sources:OperationSource[],caveat:string}} OperationPlate
 */

const pair = (zh, en) => ({zh, en});
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const C = Object.freeze({ink:'#163449',muted:'#536b7d',line:'#678393',metal:'#829dad',oxide:'#e7eff4',free:'#147e82',ref:'#435b89',stim:'#b96521',read:'#196daf',oxygen:'#257fa2',vacancy:'#aa5d1d',ion:'#b76730',ferro:'#836197',hot:'#d55c25',cold:'#c6d8e2',white:'#ffffff'});

function canvas(topic, operation, language, frame) {
  const prefix = `op-${topic}-${operation}-${frame}-${language}`;
  const choose = (zh,en) => language === 'zh' ? zh : en;
  const path = (d,fill='none',color=C.line,width=2,extra='') => `<path d="${d}" fill="${fill}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const line = (x1,y1,x2,y2,color=C.line,width=2,extra='') => path(`M${x1} ${y1}L${x2} ${y2}`,'none',color,width,extra);
  const box = (x,y,w,h,fill,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${C.line}" stroke-width="1.4" ${extra}/>`;
  const dot = (x,y,r=4,color=C.ink,extra='') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" ${extra}/>`;
  const text = (x,y,value,anchor='start',color=C.ink,extra='') => `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="20" ${extra}>${escape(value)}</text>`;
  const head = (x,y,angle,color=C.stim,width=2.8,size=8) => {
    const a=angle*Math.PI/180, b1=a+2.62, b2=a-2.62;
    return path(`M${x+size*Math.cos(b1)} ${y+size*Math.sin(b1)}L${x} ${y}L${x+size*Math.cos(b2)} ${y+size*Math.sin(b2)}`,'none',color,width);
  };
  const arrow = (x1,y1,x2,y2,color=C.stim,width=2.8,extra='') => line(x1,y1,x2,y2,color,width,extra)+head(x2,y2,Math.atan2(y2-y1,x2-x1)*180/Math.PI,color,width);
  const moment = (x,y,angle,length=36,color=C.free) => {
    const rad=angle*Math.PI/180, dx=Math.cos(rad)*length, dy=-Math.sin(rad)*length;
    return arrow(x-dx/2,y-dy/2,x+dx/2,y+dy/2,color,4);
  };
  const ring = (x,y,r=7,color=C.vacancy) => dot(x,y,r,C.white,`stroke="${color}" stroke-width="2.2"`);
  const charge = (x,y,positive=false,color=C.read) => dot(x,y,6,color)+line(x-3,y,x+3,y,C.white,1.5)+(positive?line(x,y-3,x,y+3,C.white,1.5):'');
  const ground = (x,y) => line(x,y,x,y+6)+line(x-10,y+6,x+10,y+6)+line(x-6,y+11,x+6,y+11)+line(x-2,y+16,x+2,y+16);
  const switchLine = (x,y,on,vertical=true) => vertical
    ? line(x,y,x,y+7)+dot(x,y+7,2.5)+dot(x,y+29,2.5)+line(x,y+29,x,y+36)+line(x,y+7,on?x:x-11,y+29,on?C.read:C.line,2.5)
    : line(x,y,x+7,y)+dot(x+7,y,2.5)+dot(x+29,y,2.5)+line(x+29,y,x+36,y)+line(x+7,y,on?x+29:x+25,on?y:y-12,on?C.read:C.line,2.5);
  const pulse = (x,y,w,h,active,reset=false) => line(x,y,x+w,y,C.line,1)+path(reset?`M${x} ${y}h${w*.28}v-${h}h${w*.2}v${h}h${w*.52}`:`M${x} ${y}h${w*.22}v-${h}h${w*.55}v${h}h${w*.23}`,'none',active?C.stim:C.muted,2.5);
  return {prefix,choose,path,line,box,dot,text,head,arrow,moment,ring,charge,ground,switchLine,pulse};
}

function frame(topic,operation,language,index,title,caption,draw,state,stimulus) {
  const c=canvas(topic,operation,language,index), pick=value=>value[language];
  const heading=pick(title), description=pick(caption);
  const drawing=draw(c);
  return {id:`${topic}-${operation}-${index}-${language}`,title:heading,caption:description,state:pick(state||title),stimulus:pick(stimulus||pair('依圖中端點與箭頭施加激勵','Apply the excitation at the labeled terminals')),
    svg:`<svg xmlns="http://www.w3.org/2000/svg" id="${c.prefix}" viewBox="0 0 360 270" role="img" aria-labelledby="${c.prefix}-title ${c.prefix}-desc" data-topic="${topic}" data-operation="${operation}" data-frame="${index}" data-language="${language}"><title id="${c.prefix}-title">${escape(heading)}</title><desc id="${c.prefix}-desc">${escape(description)}</desc><style>#${c.prefix} text{font-family:Arial,'Noto Sans TC',sans-serif;font-size:20px;font-weight:500}#${c.prefix} path,#${c.prefix} line{vector-effect:non-scaling-stroke}</style><rect width="360" height="270" rx="10" fill="#f8fbfd"/>${drawing}</svg>`};
}

const source = (id,label,url,kind,date,locator,limit) => ({id,label,url,kind,date,locator,limit});
const SOURCES = {
  toggle: source('EMG-P-TOGGLE',pair('Motorola：Toggle 寫入專利 US6545906B1','Motorola: Toggle Writing Patent US6545906B1'),'https://patents.google.com/patent/US6545906B1/en',pair('公開專利','Published patent'),'2003-04-08',pair('圖 4–6；SAF 自由層、t0–t4 脈衝序列及讀取比較說明','Figures 4–6; SAF free layer, t0–t4 pulse sequence, and read-before-toggle description'),pair('僅表示此近似平衡 SAF 的 Toggle 實施例；旋轉角度為教材示意。','Applies to the nearly balanced SAF toggle embodiment; drawn intermediate angles are illustrative.')),
  stt: source('EMG-P-STT',pair('IBM：自旋力矩結構專利 US5695864A','IBM: Spin-Torque Structure Patent US5695864A'),'https://patents.google.com/patent/US5695864A/en',pair('公開專利','Published patent'),'1997-12-09',pair('摘要及請求項 1：固定與可變磁矩、穿越堆疊的電流','Abstract and claim 1: fixed and variable moments and current through the stack'),pair('早期磁性結構，不是現代 MgO 垂直 MTJ 製程的完整揭露。','An early magnetic structure, not a complete disclosure of modern perpendicular MgO MTJ processing.')),
  sttDirection: source('op-stt-katine-2000',pair('Katine 等：Co/Cu/Co 電流驅動磁化反轉','Katine et al.: Current-Driven Reversal in Co/Cu/Co Pillars'),'https://arxiv.org/abs/cond-mat/9908231',pair('原始研究論文','Original research paper'),'2000',pair('摘要：薄層至厚層的電子流對應 AP，反向電子流對應 P','Abstract: electron flow from thin to thick layer favors AP; reverse flow favors P'),pair('只用於說明電流與電子流的符號慣例；不是 MgO MTJ 產品數據。','Used for the current/electron-flow convention; not product data for an MgO MTJ.')),
  sot: source('EMG-SOT24',pair('imec：SOT-MRAM 功能陣列與快取研究','imec: Functional SOT-MRAM Arrays and Cache Research'),'https://www.imec-int.com/en/articles/bringing-sot-mram-technology-closer-last-level-cache-memory-specifications',pair('研究機構技術文章','Research institute technical article'),'2024-12-16',pair('三端 SOT 結構、獨立讀寫路徑與磁場需求','Three-terminal SOT structure, separate read/write paths, and magnetic-field requirements'),pair('研究機制，不代表 SOT 已量產；此圖明示輔助場，未宣稱無外加磁場切換。','A research mechanism, not SOT volume production; the diagram explicitly includes an assist field and makes no field-free claim.')),
  vcm: source('op-vcm-reservoir-2026',pair('Yuan 等：WO₃ 記憶體的可控氧交換電極','Yuan et al.: Controlled Oxygen-Reservoir Electrodes for WO₃ Memory'),'https://www.nature.com/articles/s43246-026-01143-8',pair('原始研究論文','Original research paper'),'2026-04-06',pair('圖 1b、4h 與討論：ITO／WO₃／TiN 的正偏 SET、反向 RESET 及氧交換模型','Figures 1b/4h and Discussion: positive-bias SET, reverse RESET, and oxygen-exchange model in ITO/WO₃/TiN'),pair('圖採簡化氧交換教材結構。論文以電性與光譜支持機制，明言沒有直接追蹤運作中的氧離子軌跡；本圖亦非原位量測。','A simplified teaching model. The paper supports the mechanism electrically and spectroscopically but does not directly track operando ion trajectories; these drawings are not in situ measurements.')),
  vcmPatent: source('EMG-P-VCM',pair('HP：多層氧化物切換專利 US8331131B2','HP: Multilayer Oxide Switching Patent US8331131B2'),'https://patents.google.com/patent/US8331131B2/en',pair('公開專利','Published patent'),'2012-12-11',pair('圖 3、5；離子／缺陷調整與脈衝條件','Figures 3 and 5; ionic/defect redistribution and pulse conditions'),pair('專利的多層與兩階段脈衝不是所有 VCM 必備條件。','The patent-specific multilayer and two-stage pulse are not mandatory for every VCM.')),
  ecm: source('EMG-P-ECM',pair('Axon：可程式化金屬化單元專利 US5761115A','Axon: Programmable Metallization Cell Patent US5761115A'),'https://patents.google.com/patent/US5761115A/en',pair('公開專利','Published patent'),'1998-06-02',pair('垂直實施例圖 4A/4B；金屬源、陰極成核與反向偏壓回縮','Vertical embodiment, Figures 4A/4B; metal source, cathode nucleation, and reverse-bias retraction'),pair('此圖選擇活性 Ag 上電極與惰性下電極；其他動力學可能改變成核位置。','The diagram selects an active Ag upper electrode and inert lower electrode; different kinetics can alter nucleation sites.')),
  pcm: source('op-pcm-ibm-thermal-2016',pair('Bakan 等：PCM 結晶期間的溫度分布','Bakan et al.: Temperature Distribution during PCM Crystallization'),'https://research.ibm.com/publications/extracting-the-temperature-distribution-on-a-phase-change-memory-cell-during-crystallization',pair('作者機構原始論文紀錄','Author-institution original paper record'),'2016-10-25',pair('摘要：熔融淬冷非晶化，以及依溫度與脈衝時間而定的結晶','Abstract: melt-quench amorphization and temperature/time-dependent crystallization'),pair('圖中 Tx、Tm 與曲線皆為定性符號；未引用任何產品的實測溫度或脈衝長度。','Tx, Tm, and curves are qualitative symbols; no measured product temperature or pulse duration is asserted.')),
  pcmDrift: source('EMG-PCMDRIFT',pair('IBM：投影式 PCM 電阻的時間演變','IBM: Temporal Resistance Evolution in Projected PCM'),'https://research.ibm.com/publications/state-dependence-and-temporal-evolution-of-resistance-in-projected-phase-change-memory',pair('作者機構原始論文紀錄','Author-institution original paper record'),'2020-05-19',pair('摘要：狀態相依電阻與時間漂移','Abstract: state-dependent resistance and temporal drift'),pair('僅支持讀取漂移提醒；此處沒有把投影支路畫成一般 PCM 的必要構件。','Supports the read-drift caveat only; a projection branch is not drawn as mandatory for general PCM.')),
  feram: source('EMG-P-FERAM',pair('Ramtron：自還原鐵電記憶體專利 US4873664A','Ramtron: Self-Restoring Ferroelectric Memory Patent US4873664A'),'https://patents.google.com/patent/US4873664A/en',pair('公開專利','Published patent'),'1989-10-10',pair('圖 3：1T1C 與參考支路；圖 1、3 及說明中的讀取、鎖存、PL 先下降、資料還原','Figure 3: 1T1C and reference branch; Figures 1/3 and read, latch, plate-line fall, and restore description'),pair('兩個並列圖是同一單元的兩種可能初態，並非把圖 3 與圖 4 合成未揭露的電路。','The two drawn branches are alternative initial states of one cell, not a merged circuit from Figures 3 and 4.')),
  fefet: source('EMG-KIOXIA',pair('KIOXIA：FeFET 陷阱與極化穩定性研究','KIOXIA: FeFET Trapping and Polarization Stability'),'https://www.kioxia.com/en-jp/rd/technology/topics/topics-67.html',pair('原廠原始研究說明','Manufacturer original research description'),'2024-04-09',pair('圖 1–3；IEDM 2023 參考文獻；極化、陷阱電荷與記憶視窗','Figures 1–3, IEDM 2023 reference; polarization, trapped charge, and memory window'),pair('本文使用簡化 n 通道 MFIS 電靜力示意，並未複製金屬摻雜 TCIL 製程。','Uses a simplified n-channel MFIS electrostatic model, not a reproduction of the metal-doped TCIL process.')),
  ftj: source('EMG-FTJ24',pair('原始研究：原子尺度 BSO 鐵電穿隧接面','Original Research: Atomic-Scale BSO Ferroelectric Tunnel Junctions'),'https://www.nature.com/articles/s41467-024-44927-7',pair('原始研究論文','Original research paper'),'2024',pair('圖 3a/3b：Cr/Au–BSO–NSTO 的極化、累積／耗盡與能障','Figures 3a/3b: polarization, accumulation/depletion, and barriers in Cr/Au–BSO–NSTO'),pair('P 指向 NSTO 的低阻關係只用於這個具名結構；HRS 可能包含熱輔助穿隧。','The low-resistance mapping for P toward NSTO is limited to this named stack; HRS can include thermally assisted tunneling.'))
};

const META = {
  toggle:{name:pair('Toggle MRAM','Toggle MRAM'),variant:pair('近似平衡的雙磁層 SAF；磁場先後次序示意','Nearly balanced two-layer SAF; ordered-field teaching model'),summary:pair('先比較資料，再沿 H1、重疊 H1/H2、H2、撤場的路徑反轉磁矩；讀取只感測接面電阻。','Compare data before following H1, overlapping H1/H2, H2, and field removal; reading senses junction resistance.'),caveat:pair('M1 是靠近障壁的自由子層；其與 REF 的夾角決定 P/AP。中間角度與脈衝高度不是實測值。反向資料以另一輪 Toggle 重寫，沒有區塊抹除。','M1 is the free sublayer next to the barrier; its angle to REF determines P/AP. Intermediate angles and pulse heights are not measured. Rewriting the opposite data uses another toggle sequence, with no block erase.'),refs:['toggle'],legend:[['M1 / M2',pair('SAF 中耦合的兩個自由磁矩','Two coupled free moments in the SAF')],['H1 / H2',pair('由正交導線產生的兩個磁場分量','Two field components generated by orthogonal lines')],['REF; P / AP',pair('固定參考磁矩；平行低阻／反平行高阻','Pinned reference moment; parallel low R / antiparallel high R')]]},
  stt:{name:pair('STT-MRAM','STT-MRAM'),variant:pair('上自由層／MgO／下參考層的垂直 MTJ 示意','Perpendicular MTJ: upper free layer / MgO / lower reference'),summary:pair('畫開傳統電流與電子流，再追蹤自旋力矩、自由層反轉與低偏壓感測。','Separate conventional current from electron flow, then follow spin torque, free-layer reversal, and low-bias sensing.'),caveat:pair('所選正向定義為傳統電流由下向上、電子由自由層流向參考層，示意 P→AP；反向示意 AP→P。極性須依實際堆疊確認，切換機率與讀取擾動未由示意圖量化。','Here positive conventional current is upward and electron flow is free-to-reference, illustrating P→AP; reverse flow illustrates AP→P. Verify polarity for the actual stack. Switching probability and read disturbance are not quantified.'),refs:['stt','sttDirection'],legend:[['Ic',pair('傳統電流方向，與電子流相反','Conventional current, opposite to electron flow')],['e−',pair('電子流方向，不是磁矩箭頭','Electron-flow direction, not a magnetization arrow')],['mF / REF',pair('自由層／固定參考層磁矩','Free-layer / pinned-reference magnetization')],['P / AP',pair('平行低阻／反平行高阻，未指定邏輯編碼','Parallel low R / antiparallel high R; no logic encoding assigned')]]},
  sot:{name:pair('SOT-MRAM','SOT-MRAM'),variant:pair('帶輔助場的三端 SOT／MTJ 教材結構','Three-terminal SOT/MTJ teaching structure with an assist field'),summary:pair('橫向寫入線提供自旋注入；獨立上端點與 MTJ 分支負責讀取。','A lateral write line supplies spin injection; an independent upper terminal and MTJ branch provide sensing.'),caveat:pair('圖中明示 Hassist；沒有假設單一理想直線可實現無外加磁場的確定性切換。I+／I− 只表示已校準的相反寫入方向，對應磁態依材料自旋霍爾符號、堆疊與輔助場而變。','Hassist is explicit; no deterministic field-free switching is assumed for a lone ideal line. I+/I− are opposite calibrated write directions; their state mapping depends on spin-Hall sign, stack orientation, and assist field.'),refs:['sot'],legend:[['W1 / W2',pair('橫向寫入線的兩個端點','Two terminals of the lateral write line')],['R',pair('MTJ 上方獨立讀取端點','Independent read terminal above the MTJ')],['Js',pair('流入自由層的自旋角動量通量','Spin-angular-momentum flux into the free layer')],['σ ⊙ / ⊗',pair('兩個寫入方向對應相反的自旋極化，出／入圖面','Opposite spin polarization for the two write directions, out of / into the page')],['Hassist',pair('此示意中明示的對稱性破缺輔助場','Explicit symmetry-breaking assist field in this example')]]},
  vcm:{name:pair('VCM ReRAM','VCM ReRAM'),variant:pair('具氧交換上界面的雙極性氧化物示意','Bipolar oxide model with an oxygen-exchange upper interface'),summary:pair('以氧離子交換、氧空缺分布與局部間隙，分別呈現 SET、RESET 與低偏壓讀取。','Follow oxygen-ion exchange, oxygen-vacancy distribution, and a local gap through SET, RESET, and low-bias read.'),caveat:pair('上電極正偏壓驅動 O²− 朝上界面移動，是本圖選定的堆疊慣例。空缺不是金屬離子；實際 VCM 也可能以界面或較寬通道切換。成形與每次 SET 是不同事件。','Positive upper-electrode bias drives O²− toward the upper interface in this selected convention. Vacancies are not metal ions; actual VCM can switch at interfaces or broader channels. Forming is distinct from recurring SET.'),refs:['vcm','vcmPatent'],legend:[['O²−',pair('可遷移氧離子，藍色實心圓','Mobile oxygen ions, filled blue circles')],['VO',pair('缺氧位置，空心圓；不是金屬粒子','Oxygen-deficient sites, open circles; not metal particles')],['TE / BE',pair('上／下電極；TE 電壓相對 BE','Upper / lower electrode; TE voltage referenced to BE')],['Ilim',pair('SET 限流，限制導電路徑過度成長','SET current compliance, limiting path overgrowth')]]},
  ecm:{name:pair('ECM／CBRAM','ECM / CBRAM'),variant:pair('Ag 活性上電極／固態離子介質／惰性下電極','Active Ag upper electrode / solid ion conductor / inert lower electrode'),summary:pair('銀氧化成 Ag+、離子遷移與陰極還原逐格可見；反向偏壓打開橋接頸部。','Track Ag oxidation, Ag+ migration, and cathodic reduction; reverse bias opens the bridge neck.'),caveat:pair('選用陰極起始成核的代表實施例；其他介質與遷移速率可能改變成長方向。RESET 只需中斷關鍵路徑，並不清空所有金屬。','A representative cathode-nucleated embodiment is selected; other media and kinetics can change growth direction. RESET interrupts a critical path and does not remove all metal.'),refs:['ecm'],legend:[['Ag / Ag+',pair('金屬銀／銀離子；與 VCM 氧空缺不同','Metallic silver / silver ions; distinct from VCM vacancies')],['Ag → Ag+ + e−',pair('活性電極的氧化反應','Oxidation at the active electrode')],['Ag+ + e− → Ag',pair('陰極附近的還原與金屬沉積','Reduction and metal deposition near the cathode')],['Ilim',pair('限制金屬橋粗化的電流上限','Current compliance limiting bridge thickening')]]},
  pcm:{name:pair('相變化記憶體','Phase-Change Memory'),variant:pair('局部加熱的蘑菇型 PCM 原理剖面','Locally heated mushroom-type PCM principle cross-section'),summary:pair('SET 的結晶保溫與 RESET 的熔融淬冷各自呈現溫度歷程與相態變化。','SET crystallization dwell and RESET melt-quench are shown with distinct thermal histories and phase states.'),caveat:pair('Tx 表示定性的結晶溫度區域，Tm 表示熔點；曲線與空間比例皆非量測。結晶速率依溫度、時間與材料而定；一般讀取不要求熔融或還原。','Tx denotes a qualitative crystallization region and Tm the melting point; curves and geometry are not measurements. Crystallization depends on temperature, time, and material; ordinary reads require neither melting nor restore.'),refs:['pcm','pcmDrift'],legend:[['A / C / L',pair('非晶態／晶態／液態','Amorphous / crystalline / liquid')],['Tx / Tm',pair('結晶溫度區域／熔點；僅用符號','Crystallization-temperature region / melting point; symbolic only')],['T(t)',pair('局部溫度歷程，非示波器或熱量測數據','Local thermal history, not oscilloscope or thermometry data')],['H',pair('局部加熱接點','Local heater contact')]]},
  feram:{name:pair('電容式 FeRAM','Capacitor FeRAM'),variant:pair('1T1C 及外部參考：並列兩種可能初態','1T1C with external reference: two alternative initial-state branches'),summary:pair('先分清翻轉與未翻轉電荷，再鎖存讀值；PL 下降且 WL 保持開啟時還原原始極化。','Distinguish switching and non-switching charge, latch the read value, then restore polarization as PL falls while WL stays enabled.'),caveat:pair('A／B 是同一單元的兩種可能初態，不是額外兩個實體記憶單元。圖採 PL 由低升高的讀取慣例；圖中 Qsw 是扣除介電與寄生貢獻後的極化切換分量，理想化為約 2PrA。','A/B are alternative initial states of one cell, not two additional physical cells. PL rises during the illustrated read. Qsw is the polarization-switching component after dielectric/parasitic contributions, ideally about 2PrA.'),refs:['feram'],legend:[['WL / BL / PL',pair('字元線／位元線／電容板線','Word line / bit line / capacitor plate line')],['P↑ / P↓',pair('兩種剩餘極化方向；不固定對應 0/1','Two remanent polarization directions; no universal 0/1 mapping')],['Qns / Qsw',pair('未翻轉背景電荷／額外極化切換電荷','Non-switching background charge / additional switching charge')],['SA',pair('感測與還原放大器；比較外部參考','Sense/restore amplifier, compared with an external reference')]]},
  fefet:{name:pair('FeFET','FeFET'),variant:pair('簡化 n 通道 MFIS：閘極／鐵電／界面層／矽','Simplified n-channel MFIS: gate / ferroelectric / interface layer / silicon'),summary:pair('極化改變通道側束縛電荷與臨界電壓；在兩個 Vt 分布間感測通道電流。','Polarization changes channel-side bound charge and threshold voltage; sense channel current between the two Vt distributions.'),caveat:pair('本圖中 P 向通道產生正束縛電荷並降低 n 通道 Vt；實際正負脈衝映射須依堆疊確認。陷阱電荷也會移動 Vt，不能把所有遲滯歸因於極化。','Here P toward the channel creates positive bound charge and lowers n-channel Vt; verify pulse polarity for the actual stack. Trapped charge also shifts Vt, so hysteresis is not attributed solely to polarization.'),refs:['fefet'],legend:[['P',pair('鐵電極化箭頭','Ferroelectric polarization vector')],['Vt,L / Vt,H',pair('低／高臨界電壓','Low / high threshold voltage')],['Vg,r',pair('位於兩個臨界電壓之間的讀取閘極電壓','Read gate voltage between the two thresholds')],['S / D / G',pair('源極／汲極／閘極；讀取電流走通道','Source / drain / gate; read current flows in the channel')]]},
  ftj:{name:pair('鐵電穿隧接面','Ferroelectric Tunnel Junction'),variant:pair('具名研究結構：Cr/Au／BSO／n 型 NSTO','Named research stack: Cr/Au / BSO / n-type NSTO'),summary:pair('對照兩個極化方向下的界面累積／耗盡、有效能障與低偏壓電流。','Compare interfacial accumulation/depletion, effective barrier, and low-bias current for opposite polarizations.'),caveat:pair('x 軸從 Cr/Au 指向 NSTO，P→NSTO 在此具名研究結構對應 LRS；反向 P 增強耗盡而提高 HRS 能障。此映射不是所有 FTJ 的通則；HRS 傳輸亦可能包含熱輔助機制。','The x axis runs from Cr/Au toward NSTO. P toward NSTO corresponds to LRS in this named stack; reverse P strengthens depletion and the HRS barrier. This mapping is not universal to FTJs; HRS transport can include thermal assistance.'),refs:['ftj'],legend:[['P→ / P←',pair('沿 Cr/Au→NSTO 座標或反向的極化','Polarization along or opposite the Cr/Au→NSTO coordinate')],['U(x)',pair('有效電子能障；定性曲線','Effective electronic barrier; qualitative curve')],['Wdep',pair('NSTO 表面耗盡區的有效寬度','Effective width of the depleted NSTO surface')],['LRS / HRS',pair('在相同低讀取偏壓下的低／高電阻','Low / high resistance at the same low read bias')]]}
};

// 圖版頂層文字只描述目前操作；共用材料與結構仍由 META 提供。
const OPERATION_META = {
  toggle:{read:{summary:pair('以相同小偏壓比較保留的 P／AP 磁態；感測電流差後撤壓，原磁矩排列保持。','Compare retained P/AP states at the same small bias, latch the current difference, then remove bias while retaining each alignment.'),variant:pair('近似平衡雙磁層 SAF：以 M1 與 REF 的排列感測電阻','Nearly balanced two-layer SAF: resistance sensing from M1/REF alignment')}},
  stt:{read:{summary:pair('開啟小偏壓讀取支路，比較 P／AP 的接面電流；鎖存後隔離支路，保留自由層磁態。','Enable low-bias sensing, compare P/AP junction currents, then latch and isolate the paths while retaining free-layer magnetization.')}},
  sot:{read:{summary:pair('由 R 穿過 MTJ 並經 W2 回流，W1 保持隔離；鎖存後撤去讀取電流，磁態保留。','Sense from R through the MTJ and return via W2 while W1 stays isolated; latch and remove read current while retaining magnetization.'),variant:pair('三端 SOT／MTJ：R→W2 感測支路，W1 隔離','Three-terminal SOT/MTJ: R→W2 sensing path with W1 isolated'),caveat:pair('本組示範保留 P 磁態的小偏壓感測；AP 也可沿同一路徑讀取。實際讀取偏壓與時間須依 MTJ 堆疊及讀取擾動限制設定。','This sequence illustrates low-bias sensing of retained P; AP can be sensed through the same path. Set actual read bias and duration according to the MTJ stack and read-disturb constraints.')}},
  ecm:{
    write:{summary:pair('Ag 活性電極氧化釋出 Ag+；離子遷移至陰極還原成核，金屬橋成長接通後撤去偏壓。','The active Ag electrode releases Ag+ by oxidation; ions drift to the cathode for reduction and nucleation, then the growing bridge connects before bias removal.')},
    erase:{summary:pair('對已連接的銀橋施加反向偏壓，使頸部局部氧化溶解；形成間隙後撤壓，保留高阻及殘餘金屬。','Apply reverse bias to a connected silver bridge, oxidize and dissolve its neck locally, then remove bias while retaining a high-R gap and residual metal.')},
    read:{summary:pair('比較已保留金屬橋與局部間隙的小偏壓電流；鎖存判讀後撤去讀取偏壓，離子結構近似不變。','Compare low-bias currents for a retained metal bridge and a local gap; latch and remove read bias with the ionic structure approximately unchanged.')}
  },
  pcm:{
    write:{summary:pair('加熱非晶帽至有利結晶且低於 Tm 的區域，保溫使晶核成長；冷卻後保留晶態低阻。','Heat the amorphous cap into a crystallization-favorable region below Tm, dwell for nucleation and growth, then cool into a retained crystalline low-R state.')},
    erase:{summary:pair('短強脈衝使局部晶態材料超過 Tm 熔融；脈衝陡降後快速淬冷，保留非晶帽與高阻。','A short strong pulse melts a local crystalline volume above Tm; a steep pulse fall rapidly quenches it into a retained amorphous cap and high resistance.')},
    read:{summary:pair('以小讀取偏壓比較晶態與非晶態的電流；鎖存後撤壓並保留相態，讀取溫度低於結晶區域。','Compare crystalline and amorphous currents at a small read bias, then latch and remove bias while retaining phase; read temperature stays below the crystallization region.')}
  },
  feram:{
    write:{action:pair('寫入 P↑','Write P↑'),summary:pair('開啟 WL 並使 PL 高於 BL，向上電場使電域切換；撤去電容偏壓並隔離單元後保留 P↑。','Enable WL and raise PL above BL to switch domains with an upward field; remove capacitor bias and isolate the cell to retain P↑.'),variant:pair('1T1C：以 PL 高於 BL 的脈衝寫入 P↑','1T1C: A PL-above-BL pulse writes P↑'),caveat:pair('P↑／P↓ 未固定對應 0／1。圖中場方向由 PL 與 BL 的相對電壓決定；實際脈衝須依鐵電材料、堆疊及有效切換條件設定。反向資料可直接重寫，沒有區塊抹除。','P↑/P↓ have no fixed 0/1 mapping. Field direction follows the relative PL/BL voltage; choose actual pulses for the ferroelectric material, stack, and effective switching condition. Opposite data is directly rewritten without block erase.')},
    erase:{action:pair('反向重寫 P↓','Reverse Rewrite P↓'),summary:pair('開啟 WL 並使 BL 高於 PL，向下電場把原 P↑ 改為 P↓；撤去偏壓並隔離後保留反向資料。','Enable WL and raise BL above PL so a downward field rewrites P↑ as P↓; remove bias and isolate the cell to retain the opposite data.'),variant:pair('1T1C：以 BL 高於 PL 的脈衝重寫 P↓','1T1C: A BL-above-PL pulse rewrites P↓'),caveat:pair('這裡的反向操作是直接極化重寫，沒有區塊抹除。P↑／P↓ 未固定對應 0／1；實際脈衝須依鐵電材料、堆疊及有效切換條件設定。','This reverse operation directly rewrites polarization, without block erase. P↑/P↓ have no fixed 0/1 mapping; choose actual pulses for the ferroelectric material, stack, and effective switching condition.')},
    read:{action:pair('讀取與還原','Read and Restore')}
  }
};

const BUILDERS = {};

function magneticRead(topic,operation,language) {
  const titles=[pair('初態：保留 P 與 AP','Initial: Retained P and AP'),pair('選通：建立小感測電流','Select: Establish Small Read Currents'),pair('鎖存：關閉支路並保留磁態','Latch: Isolate and Retain Magnetization')];
  const captions=[pair('兩個圖代表 P 與 AP 兩種可能磁態；選擇支路未開啟，沒有讀取電流。','The two diagrams represent possible P and AP states. Their access paths are open and carry no read current.'),pair('施加相同小偏壓並開啟選擇支路；P 的電流較大，AP 的電流較小。','Close the access paths at the same small bias. P carries more current and AP less current.'),pair('感測器鎖存電流差，撤除讀取偏壓；兩種磁矩排列各自保留。','The sense circuit latches the current difference and removes read bias. Each magnetic alignment is retained.')];
  return titles.map((title,i)=>frame(topic,operation,language,i+1,title,captions[i],c=>{
    let out=c.text(180,28,i===1?'Vread':i===2?c.choose('SA 已鎖存','SA latched'):'V = 0','middle',i===1?C.read:C.ink);
    if(i!==2)out+=c.line(65,45,227,45)+c.line(65,45,65,77)+c.line(227,45,227,77);
    for(const [index,x] of [98,260].entries()) {
      out+=c.text(x,64,index?'AP':'P','middle')+c.box(x-33,77,66,41,C.free)+c.box(x-33,120,66,10,C.oxide)+c.box(x-33,132,66,41,C.ref);
      out+=c.moment(x,98,index?(topic==='toggle'?225:270):(topic==='toggle'?45:90),26,C.white)+c.moment(x,153,topic==='toggle'?45:90,26,C.white);
      out+=c.line(x,173,x,180)+c.switchLine(x,180,i===1)+c.ground(x,219);
      if(i===1) {
        out+=c.arrow(x-51,81,x-51,163,C.read,index?2:4);
        [0,...(index?[]:[1,2])].forEach(n=>{out+=c.charge(x+49,91+n*26);});
      }
      if(i===2)out+=c.box(x-44,184,88,32,'#e4edf4')+c.text(x,207,index?'IAP':'IP','middle');
    }
    return out+c.text(180,258,i===0?c.choose('支路隔離','Paths isolated'):i===1?'IP > IAP':c.choose('原磁態保留','States retained'),'middle');
  },pair(i===1?'磁態不變；讀取節點有電流':'P 與 AP 磁態各自保留',i===1?'Magnetic states unchanged; read nodes carry current':'P and AP alignments remain retained'),pair(i===1?'小讀取偏壓；選擇支路開啟':'寫入場與寫入電流皆為零',i===1?'Small read bias; access paths enabled':'Write fields and write currents are zero')));
}

BUILDERS.toggle=(operation,language)=>{
  if(operation==='read')return magneticRead('toggle',operation,language);
  const reverse=operation==='erase', angles=[[45,225],[80,280],[125,325],[170,370],[225,405]];
  const titles=[pair('先讀取並確認需要反轉','Read and Confirm a Toggle Is Needed'),pair('H1 上升：開始旋轉','H1 Rises: Rotation Starts'),pair('H1 與 H2 重疊','H1 and H2 Overlap'),pair('H1 撤除：保留 H2','Remove H1; Retain H2'),pair('H2 撤除：落入反向穩態','Remove H2; Settle in the Opposite State')];
  const captions=[pair(`M1 與 REF 起始為${reverse?'反平行高阻':'平行低阻'}；讀取比較後才啟動 Toggle。`,`M1 starts ${reverse?'antiparallel at high R':'parallel at low R'} to REF. A read/compare decision precedes toggling.`),pair('H1 單獨作用，SAF 磁矩開始自旋翻倒式旋轉，兩者仍大致反平行。','H1 alone starts spin-flop rotation of the SAF moments while they remain largely antiparallel.'),pair('H2 在 H1 尚未結束時上升；合成磁場轉向，兩磁矩持續沿同方向旋轉。','H2 rises before H1 ends. The resultant field changes direction and both moments continue along the same rotational sense.'),pair('先撤除 H1，H2 繼續驅動，讓磁矩跨越硬軸不穩定位置。','H1 falls first. H2 continues driving the moments beyond the hard-axis instability.'),pair(`撤除 H2 後回到易軸；M1 反轉約 180°，成為${reverse?'平行低阻':'反平行高阻'}。`,`After H2 falls, the moments return to the easy axis. M1 has reversed about 180°, reaching ${reverse?'parallel low R':'antiparallel high R'}.`)];
  return titles.map((title,i)=>frame('toggle',operation,language,i+1,title,captions[i],c=>{
    const [a,b]=reverse?[angles[i][1],angles[i][0]]:angles[i], h1=i===1||i===2, h2=i===2||i===3;
    let out=c.text(160,26,'SAF','middle')+c.text(93,26,'M1','middle',C.stim)+c.text(219,26,'M2','middle',C.free)+c.text(287,26,'REF','middle')+`<ellipse cx="158" cy="96" rx="67" ry="58" fill="#eef4f7" stroke="${C.line}" stroke-width="1.5"/>`;
    out+=c.line(109,145,207,47,C.muted,1,'stroke-dasharray="5 5"')+c.moment(158,92,a,103,C.stim)+c.moment(158,100,b,85,C.free)+c.dot(158,96,4);
    out+=c.box(253,58,69,72,'#edf0f7')+c.moment(287,94,45,47,C.ref);
    out+=c.text(27,48,'H2','middle',h2?C.stim:C.muted)+c.arrow(27,117,27,62,h2?C.stim:'#c7d2da')+c.text(48,153,'H1','middle',h1?C.stim:C.muted)+c.arrow(16,132,77,132,h1?C.stim:'#c7d2da');
    out+=c.text(10,193,'H1')+c.text(10,237,'H2');
    out+=c.path('M65 196H113V176H246V196H330','none',C.stim,2.5)+c.path('M65 240H175V220H298V240H330','none',C.free,2.5);
    const pos=[81,141,204,269,320][i];out+=c.line(pos,164,pos,244,C.ink,1.5,'stroke-dasharray="4 5"')+c.dot(pos,254,4,C.ink)+c.text(180,262,`t${i}`,'middle');
    return out;
  },pair(i===4?'反向磁態已保留':i===0?'初始磁態已保留':'耦合磁矩正在旋轉',i===4?'Opposite state retained':i===0?'Initial state retained':'Coupled moments rotating'),pair(i===0||i===4?'H1 = H2 = 0':i===1?'僅 H1':i===2?'H1 與 H2 同時作用':'僅 H2',i===0||i===4?'H1 = H2 = 0':i===1?'H1 only':i===2?'H1 and H2 overlap':'H2 only')));
};

function sttStack(c,angle,stage,reverse) {
  let out=c.text(180,29,'BL','middle')+c.line(180,37,180,74)+c.box(128,74,104,56,C.free)+c.box(128,133,104,12,C.oxide)+c.box(128,148,104,50,C.ref);
  out+=c.moment(180,102,angle,38,C.white)+c.moment(180,173,90,34,C.white)+c.text(242,110,'mF')+c.text(242,149,'MgO')+c.text(242,185,'REF');
  out+=c.line(180,198,180,210)+c.switchLine(180,210,stage===1)+c.text(213,237,stage===1?'WL=1':'WL=0');
  if(stage===1) {
    out+=c.text(58,51,'Ic','middle',C.stim)+c.text(302,51,'e−','middle',C.read);
    out+=c.arrow(58,reverse?80:194,58,reverse?194:80,C.stim,3.5)+c.arrow(310,reverse?194:80,310,reverse?80:194,C.read,2.5,'stroke-dasharray="5 4"');
    out+=c.path('M156 89C147 72 174 61 188 77','none',C.stim,2)+c.head(188,77,50,C.stim,2);
    [97,132,168].forEach(y=>{out+=c.charge(91,y);});
  } else out+=c.text(44,120,'Ic=0','middle',C.muted);
  return out+c.text(180,265,stage===1?c.choose('自旋力矩','Spin torque'):((angle%360+360)%360===90?'P · R↓':'AP · R↑'),'middle');
}

BUILDERS.stt=(operation,language)=>{
  if(operation==='read')return magneticRead('stt',operation,language);
  const reverse=operation==='erase', states=reverse?[270,200,90]:[90,20,270];
  const titles=[pair('初態：選擇管關閉','Initial: Access Transistor Off'),pair('脈衝：自旋力矩使自由層偏轉','Pulse: Spin Torque Deflects the Free Layer'),pair('撤去脈衝：反向磁態保留','Pulse Removed: Opposite Magnetization Retained')];
  const captions=[pair(`mF 起始${reverse?'反平行':'平行'}於 REF；尚無穿越接面的電流。`,`mF starts ${reverse?'antiparallel':'parallel'} to REF; no current crosses the junction.`),pair(`開啟 WL；電子由${reverse?'下方 REF 流向上方自由層':'上方自由層流向下方 REF'}。橘色 Ic 方向相反，自由磁矩偏轉。`,`Enable WL. Electrons flow ${reverse?'from lower REF to upper free layer':'from upper free layer to lower REF'}. Orange Ic points oppositely while the free moment deflects.`),pair(`電流停止後 mF 落入${reverse?'P 低阻':'AP 高阻'}狀態，REF 保持原方向。`,`After current stops, mF settles in ${reverse?'P at low R':'AP at high R'} while REF retains its direction.`)];
  return titles.map((title,i)=>frame('stt',operation,language,i+1,title,captions[i],c=>sttStack(c,states[i],i,reverse),pair(i===1?'自由層進動／反轉中':i===0?'起始穩定磁態':'反向穩定磁態',i===1?'Free layer precessing/reversing':i===0?'Initial stable magnetization':'Opposite stable magnetization'),pair(i===1?'WL 開啟；穿越 MTJ 的寫入脈衝':'寫入電流為零',i===1?'WL enabled; write pulse through the MTJ':'Write current is zero')));
};

function sotStack(c,state,mode,reverse=false) {
  const write=mode==='write',read=mode==='read';
  let out=c.text(180,25,'R','middle')+c.switchLine(180,33,read)+c.line(180,69,180,77)+c.box(133,77,94,37,C.ref)+c.box(133,117,94,11,C.oxide)+c.box(133,131,94,39,C.free);
  out+=c.moment(180,95,90,27,C.white)+c.moment(180,150,state,28,C.white)+c.text(239,103,'REF')+c.text(239,158,'mF');
  out+=c.box(37,175,286,37,'#7e99b0')+c.dot(37,193,4)+c.dot(323,193,4)+c.text(34,239,'W1')+c.text(322,239,'W2','end');
  if(write) {
    out+=c.arrow(reverse?290:67,194,reverse?67:290,194,C.stim,4)+c.text(180,239,reverse?'I−':'I+','middle',C.stim);
    out+=c.arrow(112,179,112,141,C.free,3)+c.text(78,157,'Js','middle',C.free)+c.text(49,111,'σ','middle',C.free)+c.ring(82,103,8,C.free)+(reverse?c.line(78,99,86,107,C.free,2)+c.line(78,107,86,99,C.free,2):c.dot(82,103,3,C.free));
    out+=c.arrow(272,63,324,63,C.stim,2.5)+c.text(274,47,'Hassist','middle');
  } else if(read) {
    out+=c.arrow(180,40,180,72,C.read,3)+c.arrow(180,172,180,195,C.read,3)+c.arrow(181,195,308,195,C.read,3);
    out+=c.text(53,72,'Iread','middle',C.read)+c.text(180,258,c.choose('W1 隔離','W1 isolated'),'middle');
  } else out+=c.text(180,256,c.choose('寫入線電流為零','Write-line current = 0'),'middle');
  return out;
}

BUILDERS.sot=(operation,language)=>{
  const reading=operation==='read',reverse=operation==='erase';
  const states=reading?[90,90,90]:(reverse?[270,210,110,90]:[90,30,250,270]);
  const titles=reading?[pair('保留：寫入線與讀取端隔離','Retain: Write and Read Paths Isolated'),pair('讀取：僅開啟垂直 MTJ 分支','Read: Enable Only the MTJ Branch'),pair('鎖存：讀取電流撤除','Latch: Read Current Removed')]:[pair('初態：垂直 MTJ 上端隔離','Initial: Upper MTJ Terminal Isolated'),pair('橫向脈衝與自旋注入','Lateral Pulse and Spin Injection'),pair('脈衝撤除後鬆弛','Relaxation after Pulse Removal'),pair('終態：相反磁化方向','Final: Opposite Magnetization')];
  const captions=reading?[pair('圖示 P 磁態；R、W1 皆隔離，磁化不靠持續電流維持。','The illustrated P state is retained with R and W1 isolated; no holding current is required.'),pair('電流由 R 穿過 REF／障壁／自由層，再經 W2 回流；W1 隔離，沒有 W1→W2 寫入電流。','Read current passes from R through REF/barrier/free layer and returns via W2. W1 is isolated, so no W1→W2 write drive is applied.'),pair('感測值鎖存後開啟 R 支路，停止讀取；自由層方向保留。','After latching the sensed value, open the R branch and stop read current; the free-layer direction is retained.')]:[pair('自由層維持起始磁態；上端 R 隔離，寫入電流不必穿越障壁。','The free layer retains its initial state. R is isolated, so write current need not cross the barrier.'),pair('對 W1/W2 施加已校準脈衝，Js 注入自由層；Hassist 明確提供所選示意的對稱性破缺。','A calibrated W1/W2 pulse injects Js into the free layer. Explicit Hassist supplies symmetry breaking for this example.'),pair('關閉橫向脈衝；自由磁矩在有效磁場與阻尼下向目標穩態鬆弛。','Turn off the lateral pulse. The free moment relaxes toward the target equilibrium under effective fields and damping.'),pair('自由層落入反向穩態；寫入線無電流，MTJ 可在後續獨立讀取。','The free layer settles in the opposite state. The write line carries no current, and the MTJ can be read independently later.')];
  return titles.map((title,i)=>frame('sot',operation,language,i+1,title,captions[i],c=>sotStack(c,states[i],i===1?(reading?'read':'write'):'off',reverse)+(reading&&i===2?c.box(29,67,66,30,'#e2edf4')+c.text(62,90,'SA','middle'):''),pair(i===1&&!reading?'自由層偏轉中':'磁態保留或鬆弛至終態',i===1&&!reading?'Free layer deflecting':'Magnetization retained or relaxing to equilibrium'),pair(i===1?(reading?'僅 R→W2 讀取支路':'W1/W2 橫向脈衝與 Hassist'):'讀寫激勵關閉',i===1?(reading?'Only the R→W2 read branch':'Lateral W1/W2 pulse and Hassist'):'Read/write excitation off')));
};

function resistiveRead(topic,language,material) {
  const titles=[pair('初態：兩種可能的電阻狀態','Initial: Two Possible Resistance States'),pair('小偏壓：比較電子電流','Small Bias: Compare Electronic Current'),pair('鎖存後：撤去偏壓並保留結構','After Latching: Remove Bias and Retain Structure')];
  const captions=[pair('左、右是同一單元的低阻與高阻兩種可能初態；尚未施加讀取偏壓。','Left and right are the low- and high-resistance alternatives for one cell. Read bias has not yet been applied.'),pair('在相同的小讀取偏壓下比較電流；偏壓以避免驅動可觀的離子重新分布為設計目標。','Compare currents at the same small read bias, chosen to avoid appreciable ionic redistribution.'),pair('感測器鎖存差異後停止電流；低阻的連接路徑與高阻的局部間隙仍各自保留。','After the sense circuit latches the difference, current stops. The connected low-R path and local high-R gap remain retained.')];
  return titles.map((title,i)=>frame(topic,'read',language,i+1,title,captions[i],c=>{
    let out=c.text(180,27,i===1?'Vread':i===2?'SA':'V = 0','middle');
    if(i<2)out+=c.line(55,41,229,41)+c.line(55,41,55,91)+c.line(229,41,229,91);
    for(const [k,x] of [93,267].entries()) {
      out+=c.text(x,79,k?'HRS':'LRS','middle')+c.box(x-38,91,76,15,C.metal)+c.box(x-38,108,76,81,C.oxide)+c.box(x-38,191,76,15,C.metal);
      if(material==='vacancy') {
        out+=c.path(k?`M${x} 189V158M${x} 135V108`:`M${x} 189V108`,'none',C.vacancy,9);
        [118,134,150,166,182].forEach(y=>{if(k&&y===150)out+=c.dot(x,y,6,C.oxygen);else out+=c.ring(x,y,5);});
      } else {
        out+=c.path(k?`M${x-4} 189V157M${x+2} 133V108`:`M${x-4} 189L${x+1} 160L${x-1} 136L${x+2} 108`,'none',C.ion,10);
        [117,173,184].forEach(y=>{out+=c.dot(x+(y%2?3:-4),y,5,'#d1a67d');});
      }
      if(i===1)out+=c.arrow(x-51,112,x-51,183,C.read,k?2:4);
      if(i<2)out+=c.switchLine(x,205,i===1);
      else out+=c.box(x-51,219,102,30,'#e2edf4')+c.text(x,241,k?'I small':'I large','middle');
    }
    return out+(i===1?c.text(180,265,'ILRS > IHRS','middle'):c.text(180,263,i===2?c.choose('離子位置保留','Ion positions retained'):c.choose('支路隔離','Paths isolated'),'middle'));
  },pair(i===1?'以電子電流感測；離子狀態近似不變':'低阻與高阻結構各自保留',i===1?'Electronic sensing; ionic state approximately unchanged':'Low-R and high-R structures retained'),pair(i===1?'小讀取偏壓；不使用 SET 或 RESET 脈衝':'操作偏壓為零',i===1?'Small read bias; no SET or RESET pulse':'Operation bias is zero')));
}

function oxideStack(c,connected,stage,reset) {
  const active=stage===1||stage===2;
  let out=c.text(180,27,active?(reset?'TE − / BE 0':'TE + / BE 0'):'V = 0','middle')+c.box(100,62,158,26,C.metal)+c.box(100,91,158,111,C.oxide)+c.box(100,205,158,23,C.metal);
  out+=c.text(278,81,'TE')+c.text(278,224,'BE')+c.text(19,130,'O²−', 'start',C.oxygen)+c.text(19,190,'VO','start',C.vacancy);
  [113,135,157,179,195].forEach((y,k)=>{out+=c.dot(117+(k%2)*15,y,5,C.oxygen)+c.dot(229-(k%2)*12,y,5,C.oxygen);});
  const gap=reset?(stage>=2):(stage<2);
  out+=c.path(gap?'M180 201V160M180 131V92':'M180 201V92','none','#e1c29f',15);
  [101,118,135,152,169,186,199].forEach(y=>{if(gap&&(y===135||y===152))out+=c.dot(180,y,6,C.oxygen);else out+=c.ring(180,y,6);});
  const reservoirCount=reset?(stage===0?5:stage===1?4:3):(stage===0?3:stage===1?4:5);
  for(let k=0;k<reservoirCount;k++)out+=c.dot(131+k*23,74,5,C.oxygen);
  if(active) {
    const ionY=reset?(stage===1?111:143):(stage===1?140:105);
    out+=c.dot(208,ionY,7,C.oxygen)+c.arrow(208,reset?95:174,208,reset?169:94,C.oxygen,2.5);
    out+=c.arrow(67,reset?177:91,67,reset?91:177,C.stim,2.5)+c.text(54,157,'E','end',C.stim);
    if(!reset)out+=c.text(299,173,'Ilim','middle',C.stim);
    else out+=c.path('M162 128H197V158H162Z','none',C.vacancy,1.5,'stroke-dasharray="4 3"');
  }
  return out+c.text(180,259,connected?'LRS':gap?'HRS':c.choose('通道建立中','Path developing'),'middle');
}

BUILDERS.vcm=(operation,language)=>{
  if(operation==='read')return resistiveRead('vcm',language,'vacancy');
  const reset=operation==='erase';
  const titles=reset?[pair('低阻初態：缺氧路徑連接','Low-R Initial State: Vacancy Path Connected'),pair('反向偏壓：氧離子返回','Reverse Bias: Oxygen Ions Return'),pair('頸部再氧化：間隙打開','Neck Reoxidation: A Gap Opens'),pair('撤去偏壓：高阻保留','Bias Removed: High Resistance Retained')]:[pair('高阻初態：通道中有間隙','High-R Initial State: Gap in the Path'),pair('SET 偏壓：氧向上界面遷移','SET Bias: Oxygen Migrates Upward'),pair('氧空缺路徑連接','Oxygen-Vacancy Path Connects'),pair('撤去偏壓：低阻保留','Bias Removed: Low Resistance Retained')];
  const captions=reset?[pair('SET 後的缺氧區連接上下電極，沒有讀寫偏壓時仍保持低阻。','After SET, an oxygen-deficient region connects the electrodes and retains low resistance without bias.'),pair('本示意反向 TE 偏壓使 O²− 從氧交換區返回局部通道；箭頭代表氧離子運動。','Reversing TE bias in this model returns O²− from the exchange region toward the local path; arrows indicate oxygen-ion motion.'),pair('通道最窄處獲得氧，局部缺氧路徑中斷；不必抹去整條已形成的通道。','Oxygen reincorporation interrupts the narrowest path segment. The entire pre-existing path need not disappear.'),pair('撤除 RESET 偏壓後，局部間隙與剩餘缺氧區保留，高阻可供後續讀取。','After RESET bias is removed, the local gap and residual oxygen-deficient regions remain for a later high-R read.')]:[pair('圖從已成形且完成 RESET 的高阻狀態開始；局部氧化間隙阻斷缺氧路徑。','The plate begins in a formed, RESET high-R state. A locally oxidized gap interrupts the oxygen-deficient path.'),pair('選定 TE 正偏壓時，O²− 朝上方氧交換界面移動，在通道留下缺氧位置。','With the selected positive TE bias, O²− moves toward the upper exchange interface, leaving oxygen-deficient sites along the path.'),pair('局部氧空缺路徑接通，電阻下降；Ilim 控制通道過度成長與焦耳熱。','The local vacancy-rich path connects and resistance falls. Ilim limits excessive path growth and Joule heating.'),pair('SET 偏壓撤除後，缺氧路徑保持連接；保留狀態不依賴持續施壓。','After SET bias is removed, the oxygen-deficient path remains connected without a holding voltage.')];
  return titles.map((title,i)=>frame('vcm',operation,language,i+1,title,captions[i],c=>oxideStack(c,reset?i<2:i>=2,i,reset),pair(reset?(i<2?'低阻通道，氧逐步返回':'局部間隙形成的高阻態'):(i<2?'有間隙的缺氧通道':'連接的缺氧低阻通道'),reset?(i<2?'Low-R path with returning oxygen':'High-R state with a local gap'):(i<2?'Gapped oxygen-deficient path':'Connected oxygen-deficient low-R path')),pair(i===1||i===2?(reset?'TE 負偏壓，BE 為零':'TE 正偏壓，BE 為零，啟用限流'):'TE 與 BE 等電位',i===1||i===2?(reset?'Negative TE bias; BE at zero':'Positive TE bias; BE at zero; current compliance enabled'):'TE and BE are equipotential')));
};

function ecmStack(c,stage,reset) {
  const active=stage===1||stage===2, gap=reset?stage>=2:stage<3;
  let out=c.text(180,25,active?(reset?'Ag − / BE 0':'Ag + / BE 0'):'V = 0','middle')+c.box(93,61,174,25,'#c39a70')+c.box(93,89,174,113,'#ecedf5')+c.box(93,205,174,23,C.metal);
  out+=c.text(282,81,'Ag')+c.text(282,224,'BE')+c.text(15,122,'Ag+','start',C.ion);
  let bridge='';
  if(reset)bridge=gap?'M180 202L176 176L185 156M181 126L179 89':'M180 202L176 176L185 154L177 132L179 89';
  else if(stage===1)bridge='M180 202L175 188L184 180';
  else if(stage===2)bridge='M180 202L175 181L184 161L177 139L183 124';
  else if(stage===3)bridge='M180 202L175 181L184 161L177 139L182 116L179 89';
  if(bridge)out+=c.path(bridge,'none',C.ion,11)+c.path('M180 200L160 184M181 181L197 174','none',C.ion,6);
  const ions=reset?(stage===0?[[128,115],[234,168]]:stage===1?[[130,120],[204,141],[234,168]]:[[130,113],[195,132],[219,145]]):(stage===0?[[132,127],[230,174]]:stage===1?[[160,108],[210,133],[196,167]]:stage===2?[[175,105],[213,126],[208,157]]:[[129,116],[231,157]]);
  ions.forEach(([x,y])=>{out+=c.charge(x,y,true,C.ion);});
  if(active) {
    out+=c.arrow(66,reset?178:93,66,reset?94:178,C.stim,2.5)+c.text(50,155,'E','end',C.stim);
    out+=c.arrow(237,reset?174:103,237,reset?104:174,C.ion,2.5);
    if(!reset)out+=c.text(289,173,'Ilim','middle',C.stim)+c.charge(145,194)+c.arrow(157,194,172,185,C.read,2.3);
    else out+=c.path('M161 129H203V156H161Z','none',C.ion,1.5,'stroke-dasharray="4 3"');
  }
  const reaction=active?(reset?'Ag → Ag+ + e−':stage===1?'Ag → Ag+ + e−':'Ag+ + e− → Ag'):(gap?'HRS':'LRS');
  return out+c.text(180,258,reaction,'middle',active?C.ion:C.ink);
}

BUILDERS.ecm=(operation,language)=>{
  if(operation==='read')return resistiveRead('ecm',language,'metal');
  const reset=operation==='erase';
  const titles=reset?[pair('低阻初態：銀橋連接','Low-R Initial State: Silver Bridge Connected'),pair('反向偏壓：頸部氧化溶解','Reverse Bias: Neck Oxidizes and Dissolves'),pair('橋接中斷：保留部分金屬','Bridge Interrupted: Residual Metal Remains'),pair('撤去偏壓：高阻間隙保留','Bias Removed: High-R Gap Retained')]:[pair('高阻初態：尚無金屬橋','High-R Initial State: No Metal Bridge'),pair('Ag 氧化、離子遷移與成核','Ag Oxidation, Ion Drift, and Nucleation'),pair('陰極還原：金屬朝上成長','Cathodic Reduction: Metal Grows Upward'),pair('接通後撤壓：銀橋保留','After Connection: Remove Bias and Retain the Bridge')];
  const captions=reset?[pair('連續銀橋形成低阻電子導通路徑；離子傳輸與電子導通不可混為一談。','A continuous silver bridge forms a low-R electronic path. Ionic transport and electronic conduction are distinct.'),pair('反向偏壓使局部橋頸的 Ag 氧化為 Ag+；溶出的陽離子朝此時為陰極的活性電極移動。','Reverse bias oxidizes Ag at the bridge neck into Ag+. Released cations move toward the active electrode, now cathodic.'),pair('關鍵頸部形成間隙，使兩電極之間失去連續金屬通路；其餘沉積物仍可能存在。','A critical neck gap interrupts the metallic connection between electrodes while residual deposits can remain.'),pair('撤去偏壓後保留高阻間隙；下一次 SET 可以利用殘留成核位置。','After bias removal, the high-R gap remains. A later SET can use residual nucleation sites.')]:[pair('上方 Ag 是可氧化金屬源，下方 BE 是惰性電極；起始沒有跨越介質的金屬橋。','Upper Ag is the oxidizable metal source and lower BE is inert. Initially no metallic bridge spans the medium.'),pair('Ag 陽極釋出 Ag+ 與電子；Ag+ 朝陰極遷移，電子在陰極附近還原銀離子並開始成核。','The Ag anode releases Ag+ and electrons. Ag+ drifts toward the cathode, where electrons reduce ions and initiate nucleation.'),pair('陰極側金屬沉積向 Ag 電極延伸；此選定實施例的成長方向不是所有 ECM 的固定法則。','Cathodic metal deposition extends toward the Ag electrode. This selected growth direction is not universal across ECM.'),pair('限流限制橋接粗化；接通後移除偏壓，金屬橋仍提供低阻電子路徑。','Current compliance limits bridge thickening. After connection and bias removal, the retained bridge supplies a low-R electronic path.')];
  return titles.map((title,i)=>frame('ecm',operation,language,i+1,title,captions[i],c=>ecmStack(c,i,reset),pair(reset?(i<2?'連接或局部溶解的金屬橋':'含殘留金屬的高阻間隙'):(i===3?'連續銀橋':i===0?'未連接狀態':'陰極成核與金屬成長'),reset?(i<2?'Connected or locally dissolving metal bridge':'High-R gap with residual metal'):(i===3?'Continuous silver bridge':i===0?'Unconnected state':'Cathodic nucleation and metal growth')),pair(i===1||i===2?(reset?'Ag 上電極負偏壓':'Ag 上電極正偏壓；SET 限流'):'操作偏壓為零',i===1||i===2?(reset?'Negative bias at the upper Ag electrode':'Positive bias at upper Ag; SET current compliance'):'Operation bias is zero')));
};

function pcmCell(c,phase,hot=false,x=180,scale=1) {
  let out=`<g transform="translate(${x-180*scale},0) scale(${scale},1)">`;
  out+=c.box(88,52,184,19,C.metal)+c.box(88,74,184,61,'#dce8e8');
  for(let row=0;row<3;row++)for(let col=0;col<7;col++)out+=c.dot(102+col*25,85+row*20,3,'#67a399');
  const dome='M131 134C130 95 145 81 180 82C215 81 230 95 229 134Z';
  if(phase!=='C')out+=c.path(dome,phase==='L'?'#ec9d72':'#aebcc9',phase==='L'?C.hot:C.line,1.5);
  if(phase==='A'||phase==='N')[[145,116],[160,101],[174,122],[187,97],[201,118],[216,105],[198,133]].forEach(([px,py])=>{out+=c.dot(px,py,3,'#667a8d');});
  if(phase==='N')[[154,118],[183,103],[207,122]].forEach(([px,py])=>{out+=c.box(px-5,py-5,10,10,'#4a9f8e');});
  if(phase==='L')[[151,116],[171,99],[202,114]].forEach(([px,py])=>{out+=c.path(`M${px-7} ${py}q7 -9 14 0`,'none',C.hot,2);});
  out+=c.box(164,135,32,27,hot?'#dc793d':C.metal)+c.line(180,162,180,174)+c.text(286,70,'TE')+c.text(208,164,'H');
  if(hot)out+=c.arrow(149,154,149,117,C.hot,2.5)+c.arrow(214,154,214,117,C.hot,2.5);
  return out+'</g>';
}

function pcmThermal(c,stage,reset) {
  const curve=reset?'M61 249H109L137 179H165L187 249H329':'M61 249H100L132 207H238L275 249H329';
  const points=reset?[[86,249],[145,179],[183,236],[305,249]]:[[81,249],[150,207],[218,207],[305,249]];
  let out=c.line(59,174,59,250)+c.line(59,250,333,250)+c.line(59,190,332,190,C.muted,1,'stroke-dasharray="3 4"')+c.line(59,221,332,221,C.muted,1,'stroke-dasharray="3 4"');
  out+=c.text(10,196,'Tm')+c.text(10,227,'Tx')+c.text(344,257,'t','middle')+c.path(curve,'none',C.hot,2.5);
  const [x,y]=points[stage];
  return out+c.line(x,175,x,254,C.ink,1,'stroke-dasharray="4 4"')+c.dot(x,y,5,C.hot);
}

BUILDERS.pcm=(operation,language)=>{
  if(operation==='read') {
    const titles=[pair('初態：晶態與非晶態','Initial: Crystalline and Amorphous Alternatives'),pair('低能量讀取：溫度低於結晶區域','Low-Energy Read: Below the Crystallization Region'),pair('電流鎖存：保留原相態','Current Latched: Original Phase Retained')];
    const captions=[pair('左 C 與右 A 是同一單元的兩個可能儲存狀態；局部非晶帽增加電阻。','C and A are alternative stored states of one cell. The local amorphous cap increases resistance.'),pair('在小讀取偏壓下，晶態電流較大；讀取能量以避免可觀結晶或熔融為設計目標。','At a small read bias, the crystalline state carries greater current. Read energy is chosen to avoid appreciable crystallization or melting.'),pair('鎖存電流差後撤除偏壓，各相態保留；電阻仍可能隨時間漂移，須留感測裕量。','After latching the current difference, remove bias and retain each phase. Resistance can still drift with time, requiring sense margin.')];
    return titles.map((title,i)=>frame('pcm','read',language,i+1,title,captions[i],c=>{
      let out=c.text(180,26,i===1?'Vread':i===2?'SA':'V = 0','middle');
      for(const [k,x] of [90,270].entries()) {
        out+=c.box(x-52,60,104,17,C.metal)+c.box(x-52,80,104,68,'#dce8e8');
        for(let row=0;row<3;row++)for(let col=0;col<4;col++)out+=c.dot(x-36+col*24,92+row*20,3,'#67a399');
        if(k)out+=c.path(`M${x-36} 147C${x-38} 91 ${x+38} 91 ${x+36} 147Z`,'#aebcc9',C.line,1.5);
        out+=c.box(x-11,149,22,24,C.metal)+c.text(x,199,k?'A · HRS':'C · LRS','middle');
        if(i===1)out+=c.arrow(x,37,x,55,C.read,k?2:4)+c.arrow(x,173,x,181,C.read,k?2:4);
        if(i===2)out+=c.box(x-55,214,110,29,'#e2edf4')+c.text(x,236,k?'I small':'I large','middle');
        else out+=c.switchLine(x,210,i===1);
      }
      return out+c.text(180,264,i===1?'Tread < Tx':i===2?c.choose('相態保留','Phases retained'):c.choose('無加熱脈衝','No heating pulse'),'middle');
    },pair('晶態與非晶態各自保留','Crystalline and amorphous alternatives retained'),pair(i===1?'小讀取偏壓；Tread 低於 Tx':'偏壓為零',i===1?'Small read bias; Tread below Tx':'Zero bias')));
  }
  const reset=operation==='erase', phases=reset?['C','L','A','A']:['A','A','N','C'];
  const titles=reset?[pair('RESET 起點：晶態低阻','RESET Start: Crystalline Low Resistance'),pair('強短脈衝：局部溫度高於熔點','Strong Short Pulse: Local Temperature Exceeds Melting'),pair('快速降溫：避開充分結晶','Rapid Cooling: Prevent Full Crystallization'),pair('冷卻終態：非晶高阻','Cooled Final State: Amorphous High Resistance')]:[pair('SET 起點：非晶高阻','SET Start: Amorphous High Resistance'),pair('加熱到結晶區域並保溫','Heat into the Crystallization Region and Dwell'),pair('晶核成長：非晶區轉為晶態','Nuclei Grow: Amorphous Volume Crystallizes'),pair('冷卻終態：晶態低阻','Cooled Final State: Crystalline Low Resistance')];
  const captions=reset?[pair('起始局部相變材料為晶態，電流通過加熱接點上方的導電區。','The initial local phase-change volume is crystalline, with conduction through material above the heater.'),pair('短而強的 RESET 脈衝以焦耳熱使局部材料超過 Tm，形成液態區 L。','A short strong RESET pulse produces Joule heat, taking a local volume above Tm into liquid state L.'),pair('脈衝陡降後局部液態快速淬冷；冷卻時間不足以完成晶體成長，形成非晶帽。','A steep pulse fall rapidly quenches the molten volume. Insufficient time for crystal growth produces an amorphous cap.'),pair('非晶帽 A 阻斷低阻晶態路徑，冷卻後保留高阻；不是靠移走材料抹除。','The amorphous cap A interrupts the low-R crystalline path and retains high resistance after cooling; no material is removed.')]:[pair('RESET 留下的非晶帽 A 位於加熱接點上方，增加單元電阻。','The RESET-created amorphous cap A sits above the heater and increases cell resistance.'),pair('SET 把局部溫度帶到有利結晶、但低於 Tm 的區域，維持足夠時間。','SET raises the local temperature into a crystallization-favorable region below Tm and maintains sufficient dwell time.'),pair('熱活化成核與晶粒成長逐步減少非晶體積；狀態由材料與溫度時間積分共同決定。','Thermally activated nucleation and grain growth reduce amorphous volume, governed by material and the temperature-time history.'),pair('冷卻後留下連續晶態 C 與較低電阻；這條熱歷程與熔融淬冷的 RESET 不同。','Cooling leaves continuous crystalline material C and lower resistance. This thermal history differs from melt-quench RESET.')];
  return titles.map((title,i)=>frame('pcm',operation,language,i+1,title,captions[i],c=>c.text(180,26,phases[i]==='N'?'A → C':phases[i],'middle')+pcmCell(c,phases[i],i===1||(!reset&&i===2))+pcmThermal(c,i,reset),pair(reset?['晶態低阻','局部液態','快速淬冷形成非晶','非晶高阻'][i]:['非晶高阻','結晶溫度區域','晶核形成與成長','晶態低阻'][i],reset?['Crystalline low R','Local liquid','Rapid quench forming amorphous material','Amorphous high R'][i]:['Amorphous high R','Crystallization-temperature region','Nucleation and growth','Crystalline low R'][i]),pair(i===0||i===3?'無加熱脈衝':reset?(i===1?'短強 RESET 脈衝；T > Tm':'脈衝快速下降；快速淬冷'):'SET 保溫；Tx < T < Tm',i===0||i===3?'No heating pulse':reset?(i===1?'Short strong RESET pulse; T > Tm':'Steep pulse fall; rapid quench'):'SET dwell; Tx < T < Tm')));
};

function ferroCap(c,x,polarization,{wl=false,bl='0',pl='0',field=0,chargeLabel='',mixed=false}={}) {
  let out=c.text(x,56,`BL ${bl}`,'middle')+c.line(x,64,x,70)+c.switchLine(x,70,wl)+c.line(x,106,x,121);
  out+=c.line(x-32,122,x+32,122,C.metal,4)+c.box(x-32,127,64,44,'#eee7f3')+c.line(x-32,176,x+32,176,C.metal,4)+c.line(x,177,x,193)+c.text(x,219,`PL ${pl}`,'middle');
  for(let k=-1;k<=1;k++)out+=c.moment(x+k*20,149,mixed&&k===0?-polarization:polarization,26,C.ferro);
  if(field)out+=c.arrow(x+46,field>0?170:128,x+46,field>0?128:170,C.stim,2.5)+c.text(x+53,156,'E','start',C.stim);
  if(chargeLabel)out+=c.text(x,247,chargeLabel,'middle',C.read);
  return out;
}

BUILDERS.feram=(operation,language)=>{
  if(operation==='read') {
    const titles=[pair('讀前：兩種可能的剩餘極化','Before Read: Two Possible Remanent Polarizations'),pair('PL 上升：分開切換與未切換電荷','PL Rises: Separate Switching and Non-Switching Charge'),pair('感測與鎖存：保留原始資料判斷','Sense and Latch: Preserve the Original Data Decision'),pair('PL 下降且 WL 開啟：還原 B','PL Falls with WL Enabled: Restore B'),pair('隔離並預充：原始極化保留','Isolate and Precharge: Original Polarization Retained')];
    const captions=[pair('A 與 B 代表同一 1T1C 的兩個可能初態：P↑ 或 P↓。BL 與 PL 為零，WL 關閉。','A and B represent two possible initial states of one 1T1C cell: P↑ or P↓. BL and PL are zero and WL is off.'),pair('WL 開啟、PL 上升，電場向上。A 不翻轉只提供 Qns；B 翻轉並多出 Qsw，兩者形成不同 BL 訊號。','Enable WL and raise PL to create an upward field. A contributes Qns without switching; B switches and adds Qsw, creating distinct BL signals.'),pair('感測放大器與外部參考比較後鎖存。此慣例把 A 的 BL 驅動至零，B 的 BL 驅動至 V；兩者當下均為 P↑。','The sense amplifier compares against an external reference and latches. In this convention A drives BL to zero and B to V; both presently have P↑.'),pair('保持 WL 開啟並先讓 PL 回零。A 的電容沒有反向電場；B 的 BL 仍為 V，使場向下並還原原 P↓。','Keep WL enabled while PL falls to zero. A sees no reverse field; B retains BL at V, creating a downward field that restores its original P↓.'),pair('完成還原後關閉 WL，再把 BL 預充回零。A 與 B 各自恢復讀取前的極化；感測加還原才完成本次讀取。','After restore, turn WL off and precharge BL to zero. A and B retain their respective pre-read polarization; sensing plus restore completes the read.')];
    return titles.map((title,i)=>frame('feram','read',language,i+1,title,captions[i],c=>{
      let out=c.text(82,27,'A','middle')+c.text(251,27,'B','middle')+c.text(180,263,`WL ${i>0&&i<4?'1':'0'}`,'middle');
      const common={wl:i>0&&i<4,pl:i===1||i===2?'V':'0'};
      out+=ferroCap(c,82,90,{...common,bl:i===1?'δA':'0',field:i===1||i===2?1:0,chargeLabel:i===1?'Qns':i===2?'SA: A':i===4?'P↑':''});
      out+=ferroCap(c,251,i===0||i>=3?270:90,{...common,bl:i===1?'δB':i===2||i===3?'V':'0',field:i===1?1:i===3?-1:0,chargeLabel:i===1?'Qns+Qsw':i===2?'SA: B':i===3?'P↓':i===4?'P↓':''});
      if(i===2)out+=c.box(118,1,124,32,'#e2edf4')+c.text(180,25,'SA ↔ REF','middle');
      if(i===3)out+=c.path('M222 142C213 132 228 121 240 132','none',C.ferro,2)+c.head(240,132,45,C.ferro,2);
      return out;
    },pair(['兩種原始極化','B 翻轉；兩支路電荷不同','原始資料已鎖存，B 需還原','B 在向下電場中還原','兩種原始極化均已保留'][i],['Two original polarization alternatives','B switches; unequal charge signals','Original data latched; B requires restore','B restores under downward field','Both original polarizations retained'][i]),pair(['BL=PL=0；WL=0','PL 升至 V；WL=1','SA 驅動 BL；PL=V；WL=1','PL 降至 0；WL=1','WL=0，再預充 BL'][i],['BL=PL=0; WL=0','PL rises to V; WL=1','SA drives BL; PL=V; WL=1','PL falls to zero; WL=1','WL=0, then BL precharge'][i])));
  }
  const reverse=operation==='erase', direction=reverse?270:90;
  const titles=[pair('初態：相反方向的剩餘極化','Initial: Opposite Remanent Polarization'),pair('施加跨電容脈衝：電域切換','Apply a Capacitor Pulse: Domains Switch'),pair('撤去電場：目標極化保留','Remove the Field: Target Polarization Retained')];
  const captions=[pair('圖從相反資料的剩餘極化開始；沒有施加跨電容電壓。','The starting remanent polarization represents opposite data, with no voltage across the capacitor.'),pair(`開啟選擇管並使${reverse?'BL 高於 PL':'PL 高於 BL'}；超過有效切換條件的脈衝使電域朝${reverse?'下':'上'}切換。`,`Enable access and set ${reverse?'BL above PL':'PL above BL'}. A pulse meeting the effective switching condition drives domains ${reverse?'downward':'upward'}.`),pair('撤去跨電容電壓並隔離單元，剩餘極化保留；反向資料可直接重寫，沒有區塊抹除。','Remove capacitor voltage and isolate the cell. Remanent polarization is retained; opposite data is directly rewritten without a block erase.')];
  return titles.map((title,i)=>frame('feram',operation,language,i+1,title,captions[i],c=>c.text(180,27,`WL ${i===1?'1':'0'}`,'middle')+ferroCap(c,170,i===0?(direction+180)%360:direction,{wl:i===1,bl:i===1&&reverse?'V':'0',pl:i===1&&!reverse?'V':'0',field:i===1?(reverse?-1:1):0,mixed:i===1,chargeLabel:i===1?c.choose('電域切換中','Domains switching'):(i===0?reverse?'P↑':'P↓':reverse?'P↓':'P↑')}),pair(i===1?'電域正在切換':'剩餘極化保留',i===1?'Domains switching':'Remanent polarization retained'),pair(i===1?(reverse?'BL=V；PL=0；WL=1':'BL=0；PL=V；WL=1'):'電容兩端等電位；WL=0',i===1?(reverse?'BL=V; PL=0; WL=1':'BL=0; PL=V; WL=1'):'Capacitor terminals equipotential; WL=0')));
};

function fefetCell(c,down,active=false,read=false,mixed=false) {
  let out=c.text(181,25,active?(down?'G +':'G −'):read?'Vg,r':'G = 0','middle')+c.line(180,33,180,43)+c.box(113,43,134,21,C.metal)+c.box(113,67,134,40,'#eee7f3')+c.box(113,110,134,10,C.oxide)+c.box(64,123,232,53,'#dfe9f0');
  for(let k=0;k<4;k++)out+=c.moment(129+k*34,87,mixed&&k===1?(down?90:270):(down?270:90),25,C.ferro);
  for(let k=0;k<5;k++)out+=c.charge(128+k*26,118,down,C.ferro);
  out+=c.box(64,123,42,28,'#97b9ce')+c.box(254,123,42,28,'#97b9ce')+c.text(82,118,'S','middle')+c.text(279,118,'D','middle');
  out+=c.text(258,62,'G')+c.text(258,94,'FE')+c.text(180,169,'p-Si','middle');
  if(down) {
    if(read)out+=c.line(107,135,254,135,'#84b4d0',6);
    [124,149,176,203,232].forEach(x=>{out+=c.charge(x,135);});
  }
  if(active)out+=c.arrow(44,down?65:113,44,down?113:65,C.stim,2.5)+c.text(29,96,'E','end',C.stim);
  if(read)out+=c.arrow(329,139,297,139,C.read,down?4:2)+c.text(317,166,'Id','middle',C.read)+c.text(288,25,'Vd +','middle',C.read);
  return out;
}

function fefetWindow(c,low,reading=false) {
  let out=c.line(62,260,62,190)+c.line(62,259,317,259)+c.text(41,205,'Id','middle')+c.text(337,265,'Vg','middle');
  out+=c.path('M66 254H109C133 254 136 218 162 201Q177 190 192 190H313','none',low?C.free:'#a7c3c4',low?3:2)+c.path('M66 255H214C239 255 232 225 278 197H313','none',!low?C.ref:'#b7bed0',!low?3:2);
  if(reading)out+=c.line(188,193,188,260,C.read,1.5,'stroke-dasharray="4 4"');
  else out+=c.text(137,240,'Vt,L','middle')+c.text(269,240,'Vt,H','middle');
  return out;
}

BUILDERS.fefet=(operation,language)=>{
  const read=operation==='read',reverse=operation==='erase';
  const titles=read?[pair('讀前：極化建立臨界電壓視窗','Before Read: Polarization Sets a Threshold Window'),pair('感測：閘極位於兩個 Vt 之間','Sense: Gate Bias between Two Thresholds'),pair('撤去讀取偏壓：極化保持','Remove Read Bias: Polarization Remains')]:[pair('初態：相反極化與臨界電壓','Initial: Opposite Polarization and Threshold'),pair('閘極脈衝：極化與束縛電荷改變','Gate Pulse: Polarization and Bound Charge Change'),pair('剩餘極化：新臨界電壓保留','Remanent Polarization: New Threshold Retained')];
  const captions=read?[pair('圖示低 Vt 初態；極化朝矽通道，正束縛電荷有利於 n 通道形成。下方同時畫出另一高 Vt 曲線。','The illustrated low-Vt state has polarization toward silicon and positive bound charge favoring an n-channel. The alternative high-Vt curve is also shown below.'),pair('以小汲極偏壓及介於 Vt,L、Vt,H 的 Vg,r 讀取；低 Vt 有較大 Id，高 Vt 的 Id 較小。電流走源極至汲極通道。','Use a small drain bias and Vg,r between Vt,L and Vt,H. Low Vt gives larger Id and high Vt smaller Id, flowing through the source-drain channel.'),pair('撤除讀取偏壓並鎖存判讀，極化與 Vt 視窗保留；實際偏壓須控制讀取擾動。','Remove read bias after latching the decision. Polarization and the Vt window remain; actual read bias must control disturbance.')]:[pair(`初始 P ${reverse?'朝向':'遠離'}通道，對應${reverse?'較低':'較高'}的 n 通道 Vt。`,`Initial P points ${reverse?'toward':'away from'} the channel, corresponding to ${reverse?'lower':'higher'} n-channel Vt.`),pair(`選定閘極脈衝使 P ${reverse?'遠離':'朝向'}通道；通道側束縛電荷變為${reverse?'負':'正'}，臨界電壓${reverse?'升高':'降低'}。`,`The selected gate pulse drives P ${reverse?'away from':'toward'} the channel, creating ${reverse?'negative':'positive'} channel-side bound charge and ${reverse?'raising':'lowering'} Vt.`),pair('脈衝撤除後剩餘極化使 Vt 位移保留。反向資料是直接改寫；圖未把陷阱電荷造成的所有 Vt 位移算成極化。','After the pulse, remanent polarization retains the Vt shift. Opposite data is directly rewritten; not every trap-related Vt shift is assigned to polarization.')];
  return titles.map((title,i)=>frame('fefet',operation,language,i+1,title,captions[i],c=>{
    const low=read?true:(i===0?reverse:!reverse);
    let out=fefetCell(c,low,!read&&i===1,read&&i===1,!read&&i===1)+fefetWindow(c,low,read&&i===1);
    if(read&&i===2)out+=c.box(26,57,67,31,'#e2edf4')+c.text(60,80,'SA','middle');
    return out;
  },pair(read?'極化狀態與兩種 Vt 視窗':i===1?'極化切換與 Vt 位移':'剩餘極化與 Vt 保留',read?'Polarization and two-state Vt window':i===1?'Polarization switching and Vt shift':'Remanent polarization and Vt retained'),pair(i===1?(read?'小 Vd；Vt,L < Vg,r < Vt,H':'相對通道的閘極寫入脈衝'):'讀寫偏壓撤除',i===1?(read?'Small Vd; Vt,L < Vg,r < Vt,H':'Gate write pulse relative to the channel'):'Read/write bias removed')));
};

function ftjDiagram(c,low,active=false,read=false,mixed=false,latched=false) {
  let out=c.text(67,26,'Cr/Au','middle')+c.text(178,26,'BSO','middle')+c.text(292,26,'NSTO','middle');
  out+=c.box(25,43,87,78,C.metal)+c.box(115,43,121,78,'#eee7f3')+c.box(239,43,98,78,'#dce9ed');
  if(!low)out+=c.box(239,43,44,78,'#f7e6cd','stroke-dasharray="4 3"');
  [64,83,103].forEach((y,k)=>{out+=c.moment(175,y,mixed&&k===1?(low?180:0):(low?0:180),57,C.ferro);});
  [57,78,101].forEach(y=>{out+=c.charge(231,y,low,C.ferro);});
  if(low)[[249,58],[260,76],[248,99],[273,60]].forEach(([x,y])=>{out+=c.charge(x,y);});
  else [254,272].forEach(x=>{out+=c.charge(x,82,true,C.stim);});
  out+=c.text(177,146,active?(low?'Vwrite +':'Vwrite −'):read?'Vread':latched?'SA latched':'V = 0','middle',active?C.stim:read?C.read:C.ink);
  if(active)out+=c.arrow(low?52:310,132,low?110:252,132,C.stim,2.5);
  if(read)out+=c.arrow(32,132,108,132,C.read,low?4:2);
  out+=c.line(27,246,335,246)+c.line(27,246,27,171)+c.text(14,167,'U','middle')+c.text(343,254,'x','middle');
  out+=c.line(114,173,114,246,C.muted,1,'stroke-dasharray="3 4"')+c.line(237,173,237,246,C.muted,1,'stroke-dasharray="3 4"');
  out+=c.path(low?'M30 232H113V195L237 212V232H335':'M30 232H113V178L237 187Q261 192 287 232H335','none',low?C.free:C.ref,3);
  out+=c.line(30,232,335,232,C.read,1,'stroke-dasharray="3 4"');
  if(!low)out+=c.line(241,257,285,257,C.stim,2)+c.line(241,253,241,261,C.stim,2)+c.line(285,253,285,261,C.stim,2);
  out+=c.text(173,263,low?'LRS':'HRS','middle');
  if(read)out+=c.arrow(57,221,101,221,C.read,low?3.5:2)+c.path('M121 221Q172 237 229 225','none',C.read,low?2.5:1.5,'stroke-dasharray="4 4"')+c.head(229,225,0,C.read,2);
  if(latched)out+=c.box(35,174,64,29,'#e2edf4')+c.text(67,197,'SA','middle');
  return out;
}

BUILDERS.ftj=(operation,language)=>{
  const read=operation==='read',reverse=operation==='erase';
  const titles=read?[pair('讀前：對照低阻與高阻能障','Before Read: Compare Low- and High-R Barriers'),pair('低阻讀取：界面累積與較小能障','Low-R Read: Accumulation and a Smaller Barrier'),pair('高阻讀取：耗盡區增加有效能障','High-R Read: Depletion Adds an Effective Barrier'),pair('撤壓鎖存：極化與能障保留','Remove Bias and Latch: Polarization and Barrier Retained')]:[pair('初態：原始極化決定界面狀態','Initial: Original Polarization Sets the Interface'),pair('寫入場：極化翻轉與屏蔽重排','Write Field: Polarization Reverses and Screening Rearranges'),pair('撤壓終態：能障變化保留','Final without Bias: Barrier Change Retained')];
  const captions=read?[pair('採 Cr/Au→BSO→NSTO 座標。圖示 P 朝 NSTO 的低阻初態；下方 U(x) 是定性能障，不是實測能帶。','The coordinate runs Cr/Au→BSO→NSTO. The illustrated low-R initial state has P toward NSTO; U(x) is a qualitative barrier, not a measured band profile.'),pair('P 朝 NSTO 的正界面束縛電荷吸引電子累積；同一小讀取偏壓下，較小能障允許較大電子電流。','Positive interfacial bound charge for P toward NSTO attracts electron accumulation. At the same small read bias, the smaller barrier permits greater electronic current.'),pair('這一格是另一高阻初態的比較，並非讀取把低阻改成高阻。反向 P 引起 NSTO 耗盡，額外能障使電流較小。','This frame compares the alternative high-R initial state; reading does not turn low R into high R. Reverse P depletes NSTO, adding a barrier and reducing current.'),pair('撤去小讀取偏壓後鎖存結果；圖回示低阻支路，極化、累積與定性能障保留，高阻支路也同樣保留。','Latch after removing small read bias. The diagram returns to the low-R branch with polarization, accumulation, and barrier retained; the high-R branch likewise retains its state.')]:[pair(`起始 P ${reverse?'朝 NSTO':'朝 Cr/Au'}，對應${reverse?'電子累積與低阻':'NSTO 耗盡與高阻'}。`,`Initial P points ${reverse?'toward NSTO':'toward Cr/Au'}, giving ${reverse?'electron accumulation and low R':'NSTO depletion and high R'}.`),pair(`圖中寫入電壓以 Cr/Au 相對 NSTO 定義，使 P ${reverse?'轉向 Cr/Au':'轉向 NSTO'}；界面束縛電荷與電子屏蔽隨之改變。`,`Write voltage is defined at Cr/Au relative to NSTO, driving P ${reverse?'toward Cr/Au':'toward NSTO'}. Interfacial bound charge and electronic screening rearrange.`),pair(`撤去寫入偏壓後，剩餘 P 保持${reverse?'NSTO 耗盡與較高較寬的有效能障':'界面累積與較小的有效能障'}。此極化與電阻關係只對應具名研究結構。`,`After write bias removal, remanent P retains ${reverse?'NSTO depletion and a higher, wider effective barrier':'interfacial accumulation and a smaller effective barrier'}. This polarization/resistance mapping is limited to the named research stack.`)];
  return titles.map((title,i)=>frame('ftj',operation,language,i+1,title,captions[i],c=>ftjDiagram(c,read?i!==2:i===0?reverse:!reverse,!read&&i===1,read&&(i===1||i===2),!read&&i===1,read&&i===3),pair(read?(i===2?'高阻比較支路：NSTO 耗盡':'低阻支路：NSTO 電子累積'):i===1?'極化與屏蔽切換中':'剩餘極化及界面狀態',read?(i===2?'High-R comparison branch: NSTO depletion':'Low-R branch: electron accumulation in NSTO'):i===1?'Polarization and screening switching':'Remanent polarization and interface state'),pair(read?(i===1||i===2?'同一小讀取偏壓':'操作偏壓為零'):i===1?'Cr/Au 相對 NSTO 的寫入脈衝':'寫入偏壓撤除',read?(i===1||i===2?'Same small read bias':'Operation bias is zero'):i===1?'Write pulse at Cr/Au relative to NSTO':'Write bias removed')));
};

/**
 * @param {string} topicId
 * @param {'write'|'erase'|'read'} operationId
 * @param {'en'|'zh'} [language='en']
 * @returns {OperationPlate}
 */
export function operationPlate(topicId,operationId,language='en') {
  if (!Object.hasOwn(META,topicId)) throw new RangeError(`Unknown emerging NVM topic: ${topicId}`);
  if (!['write','erase','read'].includes(operationId)) throw new RangeError(`Unknown operation: ${operationId}`);
  if (!['en','zh'].includes(language)) throw new RangeError(`Unsupported language: ${language}`);
  const meta={...META[topicId],...OPERATION_META[topicId]?.[operationId]},pick=value=>value[language];
  const action=meta.action||{write:pair('寫入／SET','Write / SET'),erase:pair('反向重寫／RESET','Reverse Rewrite / RESET'),read:pair('讀取','Read')}[operationId];
  return {title:`${pick(meta.name)} · ${pick(action)}`,summary:pick(meta.summary),variant:pick(meta.variant),frames:BUILDERS[topicId](operationId,language),legend:meta.legend.map(([symbol,meaning])=>({symbol,meaning:pick(meaning)})),sources:meta.refs.map(key=>{const s=SOURCES[key];return {id:s.id,label:pick(s.label),url:s.url,kind:pick(s.kind),date:s.date,locator:pick(s.locator),limit:pick(s.limit)};}),caveat:pick(meta.caveat)};
}
