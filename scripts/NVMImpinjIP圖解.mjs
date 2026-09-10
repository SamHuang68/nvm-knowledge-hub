/**
 * AEON 具名 MTP 的公開 FN／FN 功能模型。
 * 2009 年原廠文章支持寫抹機制；功能區形狀不宣稱特定世代的實體剖面。
 */
const C = { ink:'#16334c', si:'#bfd3e4', oxide:'#f4e0a9', fg:'#c6a16b', e:'#075f9d', field:'#a45410', i:'#087968' };
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = (x,y,value,anchor='middle',fill=C.ink) => '<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+fill+'" font-size="22" font-weight="600">'+esc(value)+'</text>';
const rect = (x,y,w,h,fill,extra='') => '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+C.ink+'" stroke-width="1.5" '+extra+'/>';
const path = (d,fill=C.ink,width=2,extra='') => '<path d="'+d+'" fill="none" stroke="'+fill+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';
const electron = (x,y,stored=true) => '<circle data-charge="'+(stored?'stored':'mobile')+'" cx="'+x+'" cy="'+y+'" r="9" fill="'+C.e+'"/>'+text(x,y+7,'−','middle','#fff');
const sourceIds = ['aeon-impinj-2007','aeon-virage-fn-2009'];
const SOURCES = [
 {id:'aeon-impinj-2007',url:'https://www.impinj.com/about-us/news-room/2007/impinj-delivers-reprogrammable-nonvolatile-memory-ip-breakthrough---aeonmtp-worlds-first-25v-floatin',date:'2007-09-26',zh:{label:'Impinj：AEON/MTP 浮動閘極產品公告',kind:'原廠產品公告',locator:'開頭 AEON/MTP 及 floating-gate transistor 段落',limit:'支持 AEON/MTP 浮動閘極家族；公告中的製程與電壓限定於該次產品，不提供完整單元剖面。'},en:{label:'Impinj AEON/MTP Floating-Gate Announcement',kind:'Company product announcement',locator:'Opening AEON/MTP and floating-gate transistor paragraphs',limit:'Supports the floating-gate family. Process and voltage claims apply to that announcement; no complete cell section is disclosed.'}},
 {id:'aeon-virage-fn-2009',url:'https://www.chipestimate.com/Auto-Industry-Replaces-Fuse-Technology-with-Standard-CMOS-Based-MTP---Adds-Functionality-Testability-and-Reliability/Synopsys-formerly-Virage-Logic-products/Technical-Article/2009/06/30',date:'2009-06-30',zh:{label:'Virage Logic：AEON MTP 寫抹與製造監測',kind:'原廠主管署名技術文章',locator:'Craig Zajac；Architectural decisions、Manufacturing 及作者簡介',limit:'原廠署名文章明確說明寫入與抹除使用 FN；差動位元與錯誤修正限定於文中車用產品選項。未公開端點電壓、p/n 極性或實體區域配置。'},en:{label:'Virage Logic AEON MTP Program/Erase and Monitoring',kind:'Company-authored technical article',locator:'Craig Zajac; Architectural decisions, Manufacturing and author biography',limit:'Explicitly identifies FN for program and erase. Differential cells and ECC concern the described automotive options. No terminal voltages, p/n polarity or physical geometry are disclosed.'}}
];
function sources(language) { return SOURCES.map(s => ({id:s.id,url:s.url,date:s.date,...s[language]})); }
function legend(language) {
 const l=(zh,en)=>language==='zh'?zh:en;
 return [
  {symbol:'FG / e−',meaning:l('棕色 FG 是介電質隔離的浮動閘極，沒有外接直流導線；藍色負號表示電子，數量只作電荷狀態示意。','The brown FG is dielectric-isolated and has no external DC connection. Blue minus signs denote electrons; their count is qualitative.')},
  {symbol:'C / T_P / T_E',meaning:l('C 表示電容耦合功能；T_P 與 T_E 分別表示寫入／抹除的穿隧對端。圖中共用放大窗不代表它們是同一實體接點，也不指定電容或電晶體數量。','C denotes capacitive coupling. T_P and T_E denote program/erase tunnel counterparts. Reusing the enlarged window does not assert one physical terminal or a fixed device count.')},
  {symbol:l('Si / 介電質','Si / Dielectric'),meaning:l('藍灰色區表示矽功能區，淡黃色區表示隔離介電質。沒有指定摻雜、厚度、相對尺寸或實際單元版圖。','Blue-gray regions represent silicon functions; pale yellow represents insulating dielectric. Doping, thickness, relative size and actual layout are unspecified.')},
  {symbol:'e− / E',meaning:l('藍色開放箭頭表示電子移動；棕色開放箭頭表示穿隧區電場 E，方向與電子受力相反。寫入示意電子存入 FG，抹除示意移出；未指定官方 0／1 編碼。','Blue open arrows show electron motion. Brown arrows show the tunnel-region electric field E, opposite to electron force. Program adds FG electrons; erase removes them in this convention. No official 0/1 coding is assigned.')},
  {symbol:'A / B / I_R',meaning:l('A、B 是讀取元件的功能端，並非官方接腳。綠箭頭是 A 電位高於 B 時的傳統感測電流示意；未指定 nMOS／pMOS，故不畫載子方向或電荷對 ON／OFF 的固定關係。','A and B are functional read terminals, not official pins. The green arrow denotes conventional sensing current for A above B. MOS polarity is unspecified, so no carrier direction or fixed charge-to-ON/OFF relation is assigned.')},
  {symbol:'2009 AEON / FN–FN',meaning:l('圖解依 2009 年具名 AEON 原廠文章建立。Impinj 業務轉移與 Synopsys 品牌承接另列時間線，不證明跨世代內部單元完全相同。','The model follows the named 2009 AEON company article. Business transfers and Synopsys branding form a separate timeline and do not prove identical internal cells across generations.')}
 ];
}
const COPY = {
 zh:{
  structure:'公開 FN／FN 功能模型：耦合區 C、隔離的浮動閘極 FG、穿隧對端及讀取 MOS。浮動閘極產品定位與具名 FN 寫抹證據分別標明；這是原創功能重建，未公開的實體接線保持未指定。',
  caveat:'圖中 T_P／T_E 是操作角色，不能直接當成同一實體接腳。MOS 極性、元件數、井結構、電壓及邏輯編碼未指定；不得把早期 Impinj 熱電子專利或現行 Synopsys 每一款 MTP 的內部單元套入此圖。',
  write:[
   {title:'初始狀態',state:'FG 保有較少負電荷；讀取 MOS 的狀態由這個隔離電荷控制。',stimulus:'維持保持條件，尚未建立 FN 穿隧高場。',caption:'起始電荷僅作相對狀態示意，不表示 FG 必須完全中性。'},
   {title:'建立穿隧電場',state:'耦合與穿隧端條件形成可將電子移入 FG 的高場。',stimulus:'局部 E 由 FG 指向 T_P；電子受力方向相反。圖中沒有數值電壓。',caption:'FN 由介電質電場促成，不以通道熱電子注入替代。C 僅經介電質耦合 FG。'},
   {title:'電子進入浮動閘極',state:'電子由 T_P 經介電質 FN 穿隧進入 FG，增加儲存負電荷。',stimulus:'維持寫入高場；藍箭頭朝向 FG，棕色 E 箭頭朝向 T_P。',caption:'FN 穿隧跨越介電質；沒有畫成金屬短路，也沒有從外部導線直接注入 FG。'},
   {title:'保留寫入狀態',state:'移除寫入刺激後，FG 的新增負電荷受介電質隔離而保留。',stimulus:'回到保持條件；FN 箭頭與高場撤除。',caption:'電荷差異可由讀取元件感測；不預設哪個電荷狀態必然對應導通或邏輯 1。'}
  ],
  erase:[
   {title:'寫入後狀態',state:'FG 保有前次寫入留下的負電荷。',stimulus:'維持保持條件，尚未施加抹除高場。',caption:'反向更新從已儲存的電荷狀態出發。'},
   {title:'建立反向穿隧條件',state:'抹除條件建立可將電子移出 FG 的局部電場。',stimulus:'局部 E 由 T_E 指向 FG；電子受力由 FG 指向 T_E。',caption:'T_E 表示抹除的穿隧對端；它與 T_P 的實體關係未由本次來源完整揭露。'},
   {title:'電子移出浮動閘極',state:'電子由 FG 經介電質 FN 穿隧移向 T_E，FG 負電荷減少。',stimulus:'維持抹除高場；藍色電子箭頭與棕色 E 箭頭相反。',caption:'這裡以電子移出解釋抹除，未採電洞注入中和模型。'},
   {title:'保留可再寫入狀態',state:'撤除高場後，FG 保留更新後的電荷狀態，可再次進行 FN 寫入。',stimulus:'回到保持條件；穿隧停止。',caption:'電性抹除與再寫入構成 MTP 操作；不從示意粒子數推定耐久、速度或保持時間。'}
  ],
  read:[
   {title:'保持既有電荷',state:'四格皆維持同一 FG 電荷，沒有把讀取畫成第二次寫入。',stimulus:'尚未啟動本次感測。',caption:'儲存的隔離電荷影響 MOS 電性；來源未指定本圖 MOS 極性，故不套用固定的 ON／OFF 關係。'},
   {title:'選擇並施加讀取條件',state:'讀取功能端形成小的感測電位差；FG 電荷維持不變。',stimulus:'本圖約定 A 高於 B；綠箭頭為 A→B 的傳統電流。',caption:'讀取條件不建立 FN 更新高場。A、B 為教學端點，不是巨集接腳表。'},
   {title:'感測通道電流',state:'讀取路徑提供與既有儲存狀態相關的 I_R。',stimulus:'保持讀取偏壓，量測感測電流。',caption:'電流沿讀取元件流動，沒有經 FG 或穿隧介電質搬移儲存電荷。'},
   {title:'比較並保留資料',state:'將 I_R 與參考值比較；FG 儲存電荷仍與第一格相同。',stimulus:'取樣感測結果，隨後可撤除讀取偏壓。',caption:'參考策略、差動實作與 0／1 編碼由特定巨集定義；車用差動位元選項不泛化為全部 AEON。'}
  ]
 },
 en:{
  structure:'Public FN/FN functional model: coupling role C, isolated floating gate FG, tunnel counterparts and a read MOS. Floating-gate product positioning and named FN program/erase evidence are attributed separately. This original functional reconstruction leaves undisclosed physical wiring unspecified.',
  caveat:'T_P/T_E are operating roles and must not be assumed to be one physical pin. MOS polarity, device count, wells, voltages and logic coding are unspecified. Do not substitute early Impinj hot-electron patents or the internal cell of every current Synopsys MTP product.',
  write:[
   {title:'Initial State',state:'FG holds less negative charge; this isolated charge controls the read MOS state.',stimulus:'Retention conditions; no FN high field has been established.',caption:'The initial charge is a relative illustration, not a claim that FG must be neutral.'},
   {title:'Establish the Tunnel Field',state:'Coupling and tunnel conditions establish a high field that can add electrons to FG.',stimulus:'Local E points from FG to T_P; electron force is opposite. No numerical biases are assigned.',caption:'Dielectric field enables FN; channel hot-electron injection is not substituted. C couples to FG through dielectric only.'},
   {title:'Tunnel Electrons Into FG',state:'Electrons tunnel from T_P through dielectric into FG by FN, increasing stored negative charge.',stimulus:'Maintain program field: blue arrows point toward FG; brown E arrows toward T_P.',caption:'FN crosses dielectric. No metallic short or external DC injection wire is drawn into FG.'},
   {title:'Retain the Programmed State',state:'After removing program stimulus, dielectric isolation retains the added FG charge.',stimulus:'Return to retention; FN and high-field arrows disappear.',caption:'The read device senses charge-dependent behavior. No fixed charge-to-ON or charge-to-logic-1 mapping is assumed.'}
  ],
  erase:[
   {title:'Programmed State',state:'FG retains negative charge from the previous program operation.',stimulus:'Retention conditions; no erase high field is applied.',caption:'Reverse updating begins from the stored charge state.'},
   {title:'Establish Erase Conditions',state:'Erase conditions establish a local field that can remove electrons from FG.',stimulus:'Local E points from T_E to FG; electron force points from FG to T_E.',caption:'T_E denotes the erase tunnel counterpart. Its physical relationship to T_P is not fully disclosed by these sources.'},
   {title:'Tunnel Electrons Out of FG',state:'Electrons tunnel from FG through dielectric toward T_E by FN, reducing negative FG charge.',stimulus:'Maintain erase field; blue electron arrows oppose brown E arrows.',caption:'Erase is represented as electron removal, not neutralization by injected holes.'},
   {title:'Retain a Reprogrammable State',state:'After removing high field, FG retains its updated charge and can receive another FN program operation.',stimulus:'Return to retention; tunneling stops.',caption:'Electrical erase and reprogramming enable MTP. Particle counts do not imply endurance, speed or retention specifications.'}
  ],
  read:[
   {title:'Retain the Existing Charge',state:'All four frames preserve the same FG charge; reading is not a second program operation.',stimulus:'Sensing has not started.',caption:'Isolated charge affects MOS behavior. MOS polarity is unspecified, so no fixed ON/OFF mapping is imposed.'},
   {title:'Select and Apply Read Conditions',state:'Read terminals establish a small sensing potential difference while FG charge remains unchanged.',stimulus:'The model takes A above B; the green arrow is conventional current from A to B.',caption:'Read conditions do not establish an FN update field. A and B are teaching terminals, not a macro pin table.'},
   {title:'Sense the Channel Current',state:'The read path supplies I_R associated with the existing stored state.',stimulus:'Maintain read bias and measure sensing current.',caption:'Current flows through the read device, without transporting stored charge through FG or the tunnel dielectric.'},
   {title:'Compare and Preserve Data',state:'Compare I_R with a reference; FG charge still matches the first frame.',stimulus:'Sample the sensing result; read bias can then be removed.',caption:'Reference strategy, differential implementation and 0/1 coding belong to a specific macro. Automotive differential-cell options are not generalized to all AEON products.'}
  ]
 }
};
function render(operation,phase,language,label) {
 const l=(zh,en)=>language==='zh'?zh:en;
 const prefix='ip-impinj-aeon-'+language+'-'+operation+'-'+phase;
 const arrow=(d,kind)=>path(d,C[kind],3,'data-path="'+kind+'" marker-end="url(#'+prefix+'-'+kind+')"');
 const markers=['e','field','i'].map(kind=>'<marker id="'+prefix+'-'+kind+'" markerWidth="11" markerHeight="11" refX="9" refY="5.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 1L9 5.5L1 10" fill="none" stroke="'+C[kind]+'" stroke-width="2"/></marker>').join('');
 const active=(operation==='write'||operation==='erase')&&(phase===1||phase===2);
 const count=operation==='write'?(phase<2?1:4):operation==='erase'?(phase<2?4:phase===2?2:1):4;
 let s=text(280,31,l('AEON · FN／FN 功能模型','AEON · FN/FN Functional Model'));
 s+=rect(84,114,105,25,C.si)+rect(84,139,105,22,C.oxide)+rect(365,114,105,25,C.si)+rect(365,139,105,22,C.oxide);
 s+=rect(84,161,386,54,C.fg,'data-storage-region="fg"')+rect(220,215,133,25,C.oxide)+rect(168,240,260,58,C.si);
 s+=path('M136 89V114M418 89V114M68 270H168M428 270H506');
 s+=text(136,80,'C')+text(418,80,operation==='write'?'T_P':operation==='erase'?'T_E':'T_P / T_E');
 s+=text(136,133,'Si')+text(418,133,'Si')+text(111,195,'FG')+text(298,275,'READ MOS');
 s+=text(97,255,'A')+text(483,255,'B');
 s+=[183,219,255,291].slice(0,count).map(x=>electron(x,188)).join('');
 if(active) {
  s+=arrow(operation==='write'?'M388 188V127':'M388 127V188','field')+text(504,162,'FN');
  if(phase===2) s+=arrow(operation==='write'?'M448 127V188':'M448 188V127','e')+electron(448,150,false);
 }
 if(operation==='read'&&phase>0) s+=arrow('M130 323H470','i')+text(300,350,'I_R');
 const footers=operation==='structure'?[l('C / T：功能角色；FG 無直流接點','C / T: functional roles; FG has no DC pin'),l('非比例；未指定固定元件數','Not to scale; device count unspecified')]:operation==='read'?[phase===0?l('同一儲存狀態','The Same Stored State'):'I_R ↔ I_ref',l('FG 電荷維持不變','FG Charge Remains Unchanged')]:operation==='write'?phase===0?[l('FG 負電荷較少','Less Negative FG Charge'),l('尚未建立 FN 穿隧條件','FN Conditions Not Yet Applied')]:phase===1?[l('建立穿隧高場','Establish the Tunnel Field'),'E: FG → T_P']:phase===2?['e−: T_P → FG · FN','E: FG → T_P']:[l('撤除高場；保留負電荷','Remove High Field; Retain Charge'),l('介電質隔離 FG','Dielectric Isolates FG')]:phase===0?[l('FG 保留寫入後負電荷','FG Retains Programmed Charge'),l('尚未施加抹除高場','Erase High Field Not Yet Applied')]:phase===1?[l('建立反向穿隧條件','Establish Erase Conditions'),'E: T_E → FG']:phase===2?['e−: FG → T_E · FN','E: T_E → FG']:[l('FG 負電荷減少','Less Negative FG Charge'),l('撤除高場；可再次寫入','Remove High Field; Reprogram Later')];
 s+=text(280,380,footers[0])+text(280,409,footers[1]);
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 430" role="img" aria-labelledby="'+prefix+'-title" style="font-family:Arial,Microsoft JhengHei,sans-serif;background:#f8fafc"><title id="'+prefix+'-title">'+esc(label)+'</title><defs>'+markers+'</defs>'+s+'</svg>';
}
/** @param {string} id @param {'zh'|'en'} [language='en'] */
export function getIPStudy(id,language='en') {
 if(id!=='impinj-aeon'||!['zh','en'].includes(language)) return null;
 const copy=COPY[language], l=(zh,en)=>language==='zh'?zh:en;
 const refs=sources(language), key=legend(language);
 const summaries={write:l('2009 年 AEON 原廠資料的 FN 寫入：電子經介電質存入隔離 FG。','FN program in the 2009 AEON company account: electrons cross dielectric into isolated FG.'),erase:l('同一份具名資料以 FN 描述電性抹除；本模型用電子移出 FG 表達反向更新。','The same named source identifies FN erase; this model represents reverse updating by removing FG electrons.'),read:l('低刺激下感測讀取 MOS；四格保持同一電荷，不指定 p/n 極性或邏輯編碼。','Sense the read MOS under low stimulus; all frames retain the same charge without assigning p/n polarity or logic coding.')};
 const names={write:l('寫入','Program'),erase:l('抹除','Erase'),read:l('讀取','Read')};
 const operations=['write','erase','read'].map(operationId=>{
  const title='AEON MTP — '+names[operationId], summary=summaries[operationId];
  const frames=copy[operationId].map((frame,index)=>({id:'impinj-aeon-'+operationId+'-'+(index+1),...frame,svg:render(operationId,index,language,title+' — '+frame.title),sourceIds:[...sourceIds]}));
  return {topicId:'ip-impinj-aeon',operationId,title,summary,sources:refs,variants:[{id:'aeon-fn-functional',title:l('2009 AEON 公開功能模型','2009 AEON Public Functional Model'),mechanism:operationId==='read'?l('MOS 電流感測','MOS current sensing'):'FN',summary,frames,legend:key,sources:refs,caveat:copy.caveat}]};
 });
 const title=l('AEON MTP — 單元功能結構','AEON MTP — Functional Cell Structure');
 return {id,structure:{title,svg:render('structure',0,language,title),caption:copy.structure,legend:key,sourceIds:[...sourceIds]},operations};
}
