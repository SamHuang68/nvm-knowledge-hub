/**
 * Kilopass／Sidense 具名 OTP 公開原理重建。
 * 歷史單元、品牌收購與後續公開產品描述分開記錄。
 */
const C={ink:'#16334c',si:'#bdd3e6',n:'#7299b8',oxide:'#f4e0a9',gate:'#9badba',defect:'#a45410',e:'#075f9d',i:'#087968',muted:'#607486',stop:'#bd354a'};
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const L=(lang,zh,en)=>lang==='zh'?zh:en;
const rect=(x,y,w,h,fill,extra='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+C.ink+'" stroke-width="1.5" '+extra+'/>';
const path=(d,color=C.ink,width=2,extra='')=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';
const text=(x,y,value,anchor='middle',color=C.ink)=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+color+'" font-size="22" font-weight="600">'+esc(value)+'</text>';
const dot=(x,y)=>'<circle data-charge="mobile" cx="'+x+'" cy="'+y+'" r="10" fill="'+C.e+'"/>'+text(x,y+7,'−','middle','#fff');
const stop=(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="18" fill="#fff" stroke="'+C.stop+'" stroke-width="3"/>'+path('M'+(x-12)+' '+(y+12)+'l24 -24',C.stop,3);
function context(prefix,lang){return{l:(zh,en)=>L(lang,zh,en),arrow:(d,kind)=>path(d,C[kind],3,'marker-end="url(#'+prefix+'-'+kind+')"')};}
function svg(prefix,title,body){
 const markers=['e','i'].map(k=>'<marker id="'+prefix+'-'+k+'" markerWidth="11" markerHeight="11" refX="9" refY="5.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 1L9 5.5L1 10" fill="none" stroke="'+C[k]+'" stroke-width="2"/></marker>').join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 400" role="img" aria-labelledby="'+prefix+'-title" style="font-family:Arial,Microsoft JhengHei,sans-serif;background:#f8fafc"><title id="'+prefix+'-title">'+esc(title)+'</title><defs>'+markers+'</defs>'+body+'</svg>';
}
function oxideState(x,y,h,broken){
 if(!broken)return '';
 return rect(x-13,y,26,h,'#f3bf7d','data-conductive-region="oxide"')+path('M'+x+' '+y+'l-5 '+(h*.24)+'l10 '+(h*.25)+'l-10 '+(h*.26)+'L'+x+' '+(y+h),C.defect,4);
}
function comparison(x,y){return text(x,y,'I_L','start',C.muted)+path('M'+(x+51)+' '+(y-7)+'h20',C.muted,6)+text(x,y+30,'I_H','start',C.i)+path('M'+(x+51)+' '+(y+23)+'h85',C.i,6);}
function bottom(ctx,operation,phase){
 const {l}=ctx;
 let label=operation==='structure'?l('歷史功能圖；幾何非比例','Historical model; geometry not to scale'):
 operation==='write'?(phase===0?l('閘氧未崩潰；初始低漏電','Intact oxide; initially low leakage'):phase===1?l('提高閘氧電場；尚未畫成導通','Increase oxide field before breakdown'):phase===2?l('局部氧化層崩潰；電子流動','Local oxide breakdown; electron motion'):l('脈衝移除；永久導通狀態保留','Pulse removed; conductive state remains')):
 operation==='erase'?(phase===1?l('正常操作不修復氧化層','Normal operation cannot repair oxide'):l('無電性抹除；原單元保持','No electrical erase; original cell retained')):
 phase===3?'I: low / high → sense':l('低應力讀取；保留導通差異','Lower-stress read; conductance retained');
 return text(280,386,label);
}
function kilo(ctx,operation,phase){
 const {l,arrow}=ctx,broken=operation==='erase'||operation==='read'||operation==='write'&&phase>=2;
 let s=text(280,29,l('XPM：M0 儲存 + M1 選擇','XPM: M0 Storage + M1 Selection'));
 s+=rect(328,201,143,97,C.si)+rect(328,153,143,48,C.oxide,'data-oxide-region="storage"')+rect(328,108,143,45,C.gate);
 s+=rect(124,220,104,78,C.gate)+text(176,282,'M1')+text(435,282,'Si')+text(434,138,'M0');
 s+=path('M43 241H124M228 241H328M400 73V108M176 169V220')+text(44,211,'BL')+text(400,63,'WLP')+text(176,159,'WLR');
 s+=text(296,183,l('閘氧','Gate oxide'),'end')+path('M301 176H323');
 s+=oxideState(398,153,48,broken);
 if(operation==='write'&&phase===1)s+=text(489,104,'+','middle',C.defect)+text(43,270,'0')+text(176,320,l('選通','Select'));
 if(operation==='write'&&phase===2){
  s+=arrow('M50 244H388V126','e')+dot(388,184)+text(70,313,'e−','middle',C.e);
 }
 if(operation==='read'&&phase>=1){
  s+=arrow('M408 125V239H45','i');
  if(phase>=2)s+=arrow('M50 254H387V125','e')+dot(387,183);
  s+=text(62,312,'I','middle',C.i)+text(111,312,'e−','middle',C.e);
 }
 if(operation==='erase'&&phase===1)s+=stop(497,176);
 if(operation==='erase'&&phase===2)s+=rect(322,147,155,60,'none','stroke-dasharray="6 5"');
 if(operation==='read'&&phase===3)s+=comparison(48,87);
 s+=text(280,351,l('BL — M1 — M0 內部節點','BL — M1 — M0 internal node'));
 return s;
}
function sidense(ctx,operation,phase){
 const {l,arrow}=ctx,broken=operation==='erase'||operation==='read'||operation==='write'&&phase>=2;
 let s=text(280,29,l('1T-Fuse：單閘極、厚／薄閘氧','1T-Fuse: One Gate, Thick/Thin Oxide'));
 s+=rect(46,230,468,101,C.si)+rect(78,230,88,52,C.n)+rect(166,230,43,16,C.n);
 s+=rect(180,169,149,61,C.oxide)+rect(329,207,131,23,C.oxide,'data-oxide-region="storage"');
 s+='<path d="M180 126H460V207H329V169H180Z" fill="'+C.gate+'" stroke="'+C.ink+'" stroke-width="1.5"/>';
 s+=rect(460,210,35,72,'#e0e6e9')+path('M119 74V230M296 74V126')+text(119,64,'BL')+text(296,64,'WL');
 s+=text(405,162,'Poly')+text(251,205,l('厚 I/O','Thick I/O'))+text(122,275,'N+')+text(133,313,'P− Si');
 s+=text(395,302,l('薄 core 氧化層','Thin core oxide'))+path('M445 277V237');
 s+=oxideState(397,207,23,broken);
 if(operation==='write'&&phase===1)s+=text(327,95,'+','middle',C.defect)+text(86,95,'0');
 if(operation==='write'&&phase===2)s+=arrow('M129 191V250H387V176','e')+dot(387,220)+text(210,284,'e−','middle',C.e);
 if(operation==='read'&&phase>=1){
  s+=arrow('M409 180V240H115V185','i');
  if(phase>=2)s+=arrow('M129 191V252H386V177','e')+dot(386,220);
  s+=text(211,284,'I','middle',C.i)+text(257,284,'e−','middle',C.e);
 }
 if(operation==='erase'&&phase===1)s+=stop(517,188);
 if(operation==='erase'&&phase===2)s+=rect(323,202,137,34,'none','stroke-dasharray="6 5"');
 if(operation==='read'&&phase===3)s+=comparison(354,73);
 s+=text(280,351,l('BL 只有一個擴散接點','One diffusion contact at BL'));
 return s;
}
function render(id,operation,phase,language,title){
 const prefix='snip-'+id+'-'+operation+'-'+phase+'-'+language,ctx=context(prefix,language);
 return svg(prefix,title,(id==='kilopass-xpm'?kilo(ctx,operation,phase):sidense(ctx,operation,phase))+bottom(ctx,operation,phase));
}
const CELLS={
 'kilopass-xpm':{name:'Kilopass XPM',sourceIds:['ip-kilopass-xpm-2007','ip-kilopass-2t-2012','ip-lineage-kilopass-2018','ip-synopsys-otp-current','ip-synopsys-advanced-otp'],mechanismIds:['ip-kilopass-xpm-2007','ip-kilopass-2t-2012'],
  structure:['原始專利圖 1 將 XPM 描述為 M0 儲存 MOS 與 M1 選擇 MOS 的 2T 單元；WLP 控制儲存閘極、WLR 選通 M1，BL 讀取電流。M0 區域為功能放大，不補畫原圖未公開的第二擴散或中間感測端。','Original patent Figure 1 describes XPM as storage MOS M0 plus select MOS M1. WLP drives the storage gate, WLR selects M1, and BL senses current. The enlarged M0 region shows function without inventing a second diffusion or an intermediate sense terminal.'],
  caveat:['採 2007 年專利明稱 XPM 的圖 1 與 2012 年產品公告，不混入後續自我感測、鎖存或 3T 圖。正 WLP、低 BL 是此 nMOS 教學支線；讀取只指定較低應力，不給可實作電壓。','Uses Figure 1 explicitly named XPM in the 2007 patent and the 2012 product announcement. Later self-sensing, latch and 3T drawings are excluded. Positive WLP and low BL define this nMOS teaching branch; read uses lower stress without implementation voltages.'],
  write:[
   ['intact','閘氧完整；M0 的閘極到矽側只有低漏電，M1 尚未選通。','Gate oxide is intact; M0 has low gate-to-silicon leakage and M1 is not yet selected.'],
   ['stress','WLP 加上正寫入偏壓、WLR 選通 M1、BL 接低電位，在 M0 閘氧建立高場。','Apply positive programming bias at WLP, select M1 through WLR, and hold BL low to stress M0 gate oxide.'],
   ['breakdown','M0 閘氧局部崩潰形成可導通路徑；示意電子由 BL 經 M1、矽側流向正 WLP。','Local M0 oxide breakdown creates a conductive path; electrons are illustrated from BL through M1 and silicon toward positive WLP.'],
   ['retained','移除脈衝後，閘氧的導通差異仍存在；儲存的是氧化層狀態。','After the pulse, the oxide conductance difference persists; the stored quantity is the oxide state.']
  ],
  read:[
   ['hold','以已寫入單元示範；其氧化層導通狀態在沒有讀取刺激時仍保持。','The illustrated programmed cell retains its conductive oxide state without a read stimulus.'],
   ['select','WLR 選通 M1，WLP 與 BL 建立較低應力的讀取條件。','WLR selects M1; WLP and BL establish lower-stress read conditions.'],
   ['sense','圖示正 WLP、低 BL 條件下，傳統電流經閘氧、矽側與 M1 流向 BL，電子方向相反。','For the illustrated positive WLP and low BL, conventional current flows through oxide, silicon and M1 toward BL; electrons move oppositely.'],
   ['compare','感測放大器比較 BL 的低／高電流；邏輯 0／1 對應由巨集定義，讀取不修復閘氧。','The sense amplifier compares low/high BL current. The macro defines 0/1 coding; read does not repair the oxide.']
  ]},
 'sidense-1t-fuse':{name:'Sidense 1T-Fuse',sourceIds:['ip-sidense-cell-2007','ip-sidense-irreversible-2017','ip-sidense-patent-2006','ip-lineage-sidense-2017','ip-synopsys-otp-current','ip-synopsys-advanced-otp'],mechanismIds:['ip-sidense-cell-2007','ip-sidense-irreversible-2017','ip-sidense-patent-2006'],
  structure:['依 2007 年原作者圖 2，單一連續 poly 閘極接 WL，BL 接唯一 N+ 擴散。BL 側為厚 I/O 閘氧、遠 BL 端為薄 core 閘氧；薄區崩潰後連通閘極與通道。厚度與導通路徑為閱讀而放大。','Following original-author Figure 2 from 2007, one continuous poly gate connects to WL and the sole N+ diffusion connects to BL. Thick I/O oxide lies near BL; thin core oxide lies farther away. Breakdown links the gate to the channel through the thin region. Thicknesses and paths are enlarged for readability.'],
  caveat:['剖面採產品文章的 n 型結構；正 WL、低 BL 的方向為明示偏壓下的教學推導。歷史專利 p 型範例的詳細電壓不搬入此圖。分裂通道不是兩個獨立閘極，也不是浮動閘極。','The section follows the product article’s n-type structure. Positive WL and low BL define the teaching bias from which directions are inferred. Detailed voltages from the historical p-type patent example are excluded. Split channel means neither two separate gates nor a floating gate.'],
  write:[
   ['intact','單一閘極下的厚／薄氧化層均完整，WL 至 BL 為初始低漏電狀態。','Both thick and thin oxide beneath the single gate are intact; WL-to-BL leakage is initially low.'],
   ['stress','在圖示 n 型教學條件中提高 WL、保持 BL 低電位；厚區控制通道，薄區承受較強氧化層電場。','For the illustrated n-type teaching bias, raise WL and hold BL low. The thick region controls the channel while the thin region experiences stronger oxide field.'],
   ['breakdown','薄 core 閘氧局部崩潰。電子由 BL 擴散經通道穿過該薄區流向 WL；厚區不畫成破裂。','The thin core oxide locally breaks down. Electrons travel from BL diffusion through the channel and the thin region toward WL; the thick oxide remains intact.'],
   ['retained','寫入偏壓移除後，薄區的永久導通狀態保持，不靠閘極中儲存電子。','After programming bias is removed, the thin region retains persistent conduction rather than charge stored inside the gate.']
  ],
  read:[
   ['hold','以已寫入的薄區示範；永久導通狀態在無刺激時保持。','The illustrated programmed thin region retains its conductive state without stimulus.'],
   ['select','以較低應力偏壓啟用通道與感測；本圖固定採正 WL、低 BL 的 n 型教學方向。','Use lower-stress bias for channel access and sensing. This figure uses the positive-WL, low-BL n-type teaching direction.'],
   ['sense','傳統電流由 WL 經薄區崩潰路徑、通道與 BL 擴散流出；電子由 BL 朝 WL 移動。','Conventional current leaves WL through the thin-oxide breakdown path, channel and BL diffusion; electrons move from BL toward WL.'],
   ['compare','比較 WL／BL 路徑的低／高電流；巨集定義邏輯編碼，正常讀取保留原狀態。','Compare low/high current along the WL/BL path. The macro defines logic coding and normal read preserves the state.']
  ]}
};
const ERASE=[
 ['programmed','已寫入後，局部閘氧導通狀態仍在。','The programmed local oxide conduction state remains.'],
 ['no-erase','正常 OTP 介面沒有可修復閘氧的電性抹除流程。','The normal OTP interface has no electrical erase procedure that repairs gate oxide.'],
 ['persistent','原單元保持；冗餘位元、重新配置或 eMTP 模擬更新屬於系統方法。','The original cell remains programmed; spare bits, remapping or eMTP emulated updates are system methods.']
];
function legend(language,id){
 const l=(zh,en)=>L(language,zh,en);
 return [
  {symbol:'e−',meaning:l('藍色圓點為移動電子，藍色箭頭沿電子流向；不是保留在閘極內的儲存電荷。','Blue dots are mobile electrons and blue arrows follow electron flow; they are not charge retained inside the gate.')},
  {symbol:'I',meaning:l('綠色為傳統電流，方向與電子相反。圖示支線固定為閘極正偏壓、BL 低電位。','Green denotes conventional current, opposite to electrons. The illustrated branch fixes positive gate bias and a low BL.')},
  {symbol:'OTP',meaning:l('橘色局部路徑表示氧化層導通狀態；正常操作無電性抹除。','The local orange path indicates conductive oxide state; normal operation has no electrical erase.')},
  {symbol:'I_L / I_H',meaning:l('短／長線條只示意低／高讀取電流的比較，不是量測值或固定邏輯編碼。','Short/long bars illustrate low/high read-current comparison, not measured values or fixed logic coding.')},
  {symbol:'Geometry',meaning:l('公開來源的歷史功能重建，非比例剖面或現行版圖；端點偏壓不構成製程操作規格。','Historical public-source functional reconstruction, not a scale section or current layout; terminal biases are not process operating specifications.')},
  {symbol:id==='kilopass-xpm'?'M0 / M1':'WL / BL',meaning:id==='kilopass-xpm'?l('M0 儲存、M1 選擇；兩者間的內部節點不增設原圖沒有的感測輸出。','M0 stores and M1 selects. No sense output absent from the original is added at their internal node.'):l('WL 接單一 poly 閘極，BL 接唯一 N+ 擴散；只有薄 core 氧化層畫出崩潰。水平載子路徑是為閱讀而偏移的閘下表面通道示意，不表示 P 型本體導電。','WL connects to one poly gate and BL to the sole N+ diffusion. Only the thin core oxide is shown breaking down. Horizontal carrier paths are offset for readability from the under-gate surface channel; they do not indicate conduction through the p-type bulk.')}
 ];
}
/** @param {string} id @param {'zh'|'en'} [language='en'] */
export function getIPStudy(id,language='en'){
 if(!['zh','en'].includes(language)||!Object.hasOwn(CELLS,id))return null;
 const cell=CELLS[id],n=language==='zh'?1:2,l=(zh,en)=>L(language,zh,en),keyLegend=legend(language,id);
 const sources=cell.sourceIds.map(sourceId=>{const source=SOURCES[language].find(s=>s.id===sourceId);if(!source)throw new Error('來源不存在：'+sourceId);return {...source};});
 const phaseTitles={
 write:[l('初始狀態','Initial State'),l('建立寫入電場','Establish Program Field'),l('氧化層崩潰','Oxide Breakdown'),l('保持結果','Retained Result')],
 erase:[l('寫入後狀態','Programmed State'),l('正常操作界線','Normal Operating Boundary'),l('持續保持','Persistent State')],
 read:[l('保持狀態','Retained State'),l('建立讀取條件','Establish Read Conditions'),l('感測路徑','Sense the Path'),l('比較結果','Compare the Result')]};
 const operations=['write','erase','read'].map(operationId=>{
  const opName=operationId==='write'?l('寫入','Program'):operationId==='erase'?l('抹除操作界線','Erase Boundary'):l('讀取','Read'),title=cell.name+' — '+opName,rows=operationId==='erase'?ERASE:cell[operationId];
  const frames=rows.map((row,i)=>({id:row[0],title:phaseTitles[operationId][i],state:row[n],stimulus:i===0?l('本次刺激尚未施加。','The present operation has not yet applied a stimulus.'):operationId==='erase'?l('無正常電性抹除刺激。','No normal electrical erase stimulus.'):operationId==='write'&&i===3?l('移除寫入偏壓。','Remove programming bias.'):operationId==='read'&&i===3?l('完成感測；以巨集邏輯判讀。','Complete sensing and interpret using macro logic.'):rows[1][n],caption:row[n],svg:render(id,operationId,i,language,title+' — '+phaseTitles[operationId][i]),sourceIds:[...cell.mechanismIds]}));
  const summary=operationId==='erase'?l('正常 OTP 不提供電性抹除；原單元無法藉一般反向操作回復未寫入狀態。','Normal OTP provides no electrical erase; an ordinary reverse operation cannot restore the unprogrammed cell.'):operationId==='write'?cell.write[2][n]:cell.read[3][n];
  return{topicId:'ip-'+id,operationId,title,summary,sources,variants:[{id:'published-model',title:l('具名 IP 歷史公開原理','Named IP Historical Public Principle'),mechanism:operationId==='write'?l('閘極氧化層崩潰','Gate-Oxide Breakdown'):operationId==='erase'?l('正常 OTP 操作界線','Normal OTP Operating Boundary'):l('氧化層導通電流感測','Oxide-Conduction Current Sensing'),summary,frames,legend:keyLegend,sources,caveat:cell.caveat[n-1]+' '+l('收購公告只證明產品組合承接；現行 1T／2T 或先進製程文章不證明逐節點沿用此剖面。','Acquisition announcements establish portfolio continuity; current 1T/2T or advanced-process articles do not prove this section is retained at every node.')}]};
 });
 return{id,structure:{title:cell.name+' — '+l('單元結構','Cell Structure'),svg:render(id,'structure',0,language,cell.name+' — '+l('單元結構','Cell Structure')),caption:cell.structure[n-1],legend:keyLegend,sourceIds:[...cell.mechanismIds]},operations};
}
const SOURCES=
{
  "zh": [
    {
      "id": "ip-kilopass-xpm-2007",
      "url": "https://patents.google.com/patent/WO2007090089A2/en",
      "date": "2007-08-09",
      "accessedAt": "2026-09-10",
      "kind": "公開專利",
      "label": "Kilopass XPM 2T 歷史專利圖",
      "locator": "圖 1；段落 [0025]–[0029]；[0031] 的圖 2 差異",
      "limit": "圖 1 明稱既有 XPM；只重建 2T 功能，不混入圖 2 的中間輸出或後續自我感測電路。"
    },
    {
      "id": "ip-kilopass-2t-2012",
      "url": "https://www.design-reuse.com/news/202521997-kilopass-nvm-ip-cores-first-to-deliver-footprint-and-pin-compatibility-across-eight-top-tier-silicon-foundries-for-the-130-110nm-process-node/",
      "date": "2012-05-15",
      "accessedAt": "2026-09-10",
      "kind": "原廠新聞轉載",
      "label": "Kilopass 130／110 nm XPM 與 Gusto 2T 公告",
      "locator": "內文 2T CMOS antifuse、XPM／Gusto 段落",
      "limit": "支持指定年代與節點產品的 2T 連結；不推定所有節點、現行巨集或各晶圓廠共用相同版圖。"
    },
    {
      "id": "ip-lineage-kilopass-2018",
      "url": "https://news.synopsys.com/2018-01-10-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Kilopass-Technology",
      "date": "2018-01-10",
      "accessedAt": "2026-09-10",
      "kind": "官方收購公告",
      "label": "Synopsys 收購 Kilopass 官方公告",
      "locator": "公告日期；XPM、Gusto、SecretCode 與 1T／2T 產品段落",
      "limit": "證明產品組合併入，不證明歷史單元等於現行所有實施。"
    },
    {
      "id": "ip-sidense-cell-2007",
      "url": "https://www.chipestimate.com/1T-OTP-Memory-Delivering-Quality-and-Reliability/Sidense-a-part-of-Synopsys/Technical-Article/2007/12/18",
      "date": "2007-12-18",
      "accessedAt": "2026-09-10",
      "kind": "原作者技術文章",
      "label": "Sidense 1T-Fuse 原作者單元剖面",
      "locator": "作者 Wlodek Kurjanowicz；圖 2 與前後 1T-Fuse 原理說明",
      "limit": "圖 2 為 n 型教學結構：單一連續 poly、厚／薄氧化層、單一 BL 擴散。讀取箭頭由此結構與圖示偏壓推導，不是現行巨集偏壓表。"
    },
    {
      "id": "ip-sidense-irreversible-2017",
      "url": "https://www.chipestimate.com/Enabling-Secure-Semiconductor-Supply-Chain-Management/Sidense-a-part-of-Synopsys/Technical-Article/2017/09/05",
      "date": "2017-09-05",
      "accessedAt": "2026-09-10",
      "kind": "原作者技術文章",
      "label": "Sidense 1T-Fuse 不可逆狀態與 eMTP 界線",
      "locator": "Where NVM Fits In；Sidense Antifuse-based Split-channel 1T-Fuse Bit Cell；圖 5",
      "limit": "支持薄閘氧永久導通及系統模擬更新；不採用文中的絕對安全或競品比較說法。"
    },
    {
      "id": "ip-sidense-patent-2006",
      "url": "https://patents.google.com/patent/US20060244099A1/en",
      "date": "2006-11-02",
      "accessedAt": "2026-09-10",
      "kind": "公開專利",
      "label": "Sidense 分裂通道反熔絲歷史專利",
      "locator": "圖 4、5、11、12；段落 [0062]–[0067]、[0087]–[0091]；請求項 1–3、12–13",
      "limit": "厚／薄氧化層與可省略第二擴散的旁證；詳細 p 型偏壓不搬入 2007 年 n 型產品圖。"
    },
    {
      "id": "ip-lineage-sidense-2017",
      "url": "https://news.synopsys.com/2017-10-17-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Sidense-Corporation",
      "date": "2017-10-17",
      "accessedAt": "2026-09-10",
      "kind": "官方收購公告",
      "label": "Synopsys 收購 Sidense 官方公告",
      "locator": "公告日期；single-transistor、split-channel 1T-Fuse 段落",
      "limit": "直接連結 Sidense 1T-Fuse 與收購；不證明收購後所有 OTP 使用同一剖面。"
    },
    {
      "id": "ip-synopsys-otp-current",
      "url": "https://www.synopsys.com/articles/non-volatile-memory.html",
      "date": null,
      "accessedAt": "2026-09-10",
      "kind": "官方技術文章",
      "label": "Synopsys OTP NVM 1T／2T 產品組合",
      "locator": "Synopsys OTP NVM IP Solutions",
      "limit": "未標示文章日期；以查核日記錄公開 1T／2T 反熔絲組合，不自行對應每個現行產品的原廠譜系。"
    },
    {
      "id": "ip-synopsys-advanced-otp",
      "url": "https://www.synopsys.com/articles/reliable-secure-otp-ip.html",
      "date": null,
      "accessedAt": "2026-09-10",
      "kind": "官方技術文章",
      "label": "Synopsys 先進製程 OTP 可靠度與感測演進",
      "locator": "Basic Operation；圖 2；感測、ECC 與控制器相關說明",
      "limit": "未標示文章日期；支持氧化層崩潰、電流感測與巨集層改良，不足以命名第三種全新單元。"
    }
  ],
  "en": [
    {
      "id": "ip-kilopass-xpm-2007",
      "url": "https://patents.google.com/patent/WO2007090089A2/en",
      "date": "2007-08-09",
      "accessedAt": "2026-09-10",
      "kind": "Public Patent",
      "label": "Historical Kilopass XPM 2T Patent Diagram",
      "locator": "Figure 1; paragraphs [0025]–[0029]; Figure 2 contrast in [0031]",
      "limit": "Figure 1 explicitly names existing XPM. Reconstruct only its 2T function; exclude the intermediate output in Figure 2 and later self-sensing circuits."
    },
    {
      "id": "ip-kilopass-2t-2012",
      "url": "https://www.design-reuse.com/news/202521997-kilopass-nvm-ip-cores-first-to-deliver-footprint-and-pin-compatibility-across-eight-top-tier-silicon-foundries-for-the-130-110nm-process-node/",
      "date": "2012-05-15",
      "accessedAt": "2026-09-10",
      "kind": "Republished Vendor Announcement",
      "label": "Kilopass 130/110 nm XPM and Gusto 2T Announcement",
      "locator": "Body paragraphs naming 2T CMOS antifuse and XPM/Gusto",
      "limit": "Supports the 2T link for the named historical products and nodes, not every node, current macro, or identical layout across foundries."
    },
    {
      "id": "ip-lineage-kilopass-2018",
      "url": "https://news.synopsys.com/2018-01-10-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Kilopass-Technology",
      "date": "2018-01-10",
      "accessedAt": "2026-09-10",
      "kind": "Official Acquisition Announcement",
      "label": "Synopsys Acquisition of Kilopass",
      "locator": "Announcement date; XPM, Gusto, SecretCode and 1T/2T product paragraphs",
      "limit": "Confirms portfolio acquisition, not identity between historical cells and all current implementations."
    },
    {
      "id": "ip-sidense-cell-2007",
      "url": "https://www.chipestimate.com/1T-OTP-Memory-Delivering-Quality-and-Reliability/Sidense-a-part-of-Synopsys/Technical-Article/2007/12/18",
      "date": "2007-12-18",
      "accessedAt": "2026-09-10",
      "kind": "Original-Author Technical Article",
      "label": "Sidense 1T-Fuse Original-Author Cell Section",
      "locator": "Wlodek Kurjanowicz; Figure 2 and adjacent 1T-Fuse explanation",
      "limit": "Figure 2 is an n-type teaching structure with one continuous poly gate, thick/thin oxide, and one BL diffusion. Read arrows are inferred from this structure and the stated teaching bias, not a current macro bias table."
    },
    {
      "id": "ip-sidense-irreversible-2017",
      "url": "https://www.chipestimate.com/Enabling-Secure-Semiconductor-Supply-Chain-Management/Sidense-a-part-of-Synopsys/Technical-Article/2017/09/05",
      "date": "2017-09-05",
      "accessedAt": "2026-09-10",
      "kind": "Original-Author Technical Article",
      "label": "Sidense 1T-Fuse Irreversibility and eMTP Boundary",
      "locator": "Where NVM Fits In; Sidense Antifuse-based Split-channel 1T-Fuse Bit Cell; Figure 5",
      "limit": "Supports persistent thin-oxide conduction and emulated updates at system level; absolute security and competitor-comparison claims are excluded."
    },
    {
      "id": "ip-sidense-patent-2006",
      "url": "https://patents.google.com/patent/US20060244099A1/en",
      "date": "2006-11-02",
      "accessedAt": "2026-09-10",
      "kind": "Public Patent",
      "label": "Historical Sidense Split-Channel Antifuse Patent",
      "locator": "Figures 4, 5, 11, 12; paragraphs [0062]–[0067], [0087]–[0091]; claims 1–3, 12–13",
      "limit": "Corroborates thick/thin oxide and optional omission of the second diffusion. Detailed p-type biases are not transferred into the 2007 n-type product diagram."
    },
    {
      "id": "ip-lineage-sidense-2017",
      "url": "https://news.synopsys.com/2017-10-17-Synopsys-Expands-DesignWare-IP-Portfolio-with-Acquisition-of-Sidense-Corporation",
      "date": "2017-10-17",
      "accessedAt": "2026-09-10",
      "kind": "Official Acquisition Announcement",
      "label": "Synopsys Acquisition of Sidense",
      "locator": "Announcement date; single-transistor and split-channel 1T-Fuse paragraphs",
      "limit": "Directly links Sidense 1T-Fuse to the acquisition; does not establish one unchanged cross-section for all later OTP."
    },
    {
      "id": "ip-synopsys-otp-current",
      "url": "https://www.synopsys.com/articles/non-volatile-memory.html",
      "date": null,
      "accessedAt": "2026-09-10",
      "kind": "Official Technical Article",
      "label": "Synopsys OTP NVM 1T/2T Portfolio",
      "locator": "Synopsys OTP NVM IP Solutions",
      "limit": "Article is undated. Records the public 1T/2T antifuse portfolio as checked; does not assign every current product to a historical vendor cell."
    },
    {
      "id": "ip-synopsys-advanced-otp",
      "url": "https://www.synopsys.com/articles/reliable-secure-otp-ip.html",
      "date": null,
      "accessedAt": "2026-09-10",
      "kind": "Official Technical Article",
      "label": "Synopsys Advanced-Process OTP Reliability and Sensing",
      "locator": "Basic Operation; Figure 2; sensing, ECC and controller discussion",
      "limit": "Article is undated. Supports oxide breakdown, current sensing and macro-level improvements, but does not establish a separately named third cell."
    }
  ]
};
