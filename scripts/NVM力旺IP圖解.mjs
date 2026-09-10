/**
 * 力旺具名 IP 的公開原理教學圖。
 * 來源與雙語文案自包含；歷史專利和現行產品不可互換。
 * @typedef {{id:string,label:string,url:string,kind:string,date:string,locator:string,limit:string}} Source
 * @typedef {{symbol:string,meaning:string}} Legend
 * @typedef {{id:string,title:string,state:string,stimulus:string,caption:string,svg:string,sourceIds:string[]}} Frame
 */
const C={ink:'#16334c',si:'#bfd3e4',p:'#7d9fbb',oxide:'#f4e0a9',fg:'#c6a16b',metal:'#9badba',e:'#075f9d',h:'#bd354a',i:'#087968',field:'#a45410',muted:'#5b6f82'};
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const local=(language,zh,en)=>language==='zh'?zh:en;
const r=(x,y,w,h,fill,extra='')=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'" stroke="'+C.ink+'" stroke-width="1.5" '+extra+'/>';
const p=(d,color=C.ink,width=2,extra='')=>'<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';
const t=(x,y,value,anchor='middle',color=C.ink)=>'<text x="'+x+'" y="'+y+'" text-anchor="'+anchor+'" fill="'+color+'" font-size="22" font-weight="600">'+esc(value)+'</text>';
const particle=(x,y,hole=false,stored=false)=>'<circle data-charge="'+(stored?'stored':'mobile')+'" cx="'+x+'" cy="'+y+'" r="11" fill="'+(hole?C.h:C.e)+'"/>'+t(x,y+8,hole?'+':'−','middle','#fff');
const stop=(x,y)=>'<circle cx="'+x+'" cy="'+y+'" r="18" fill="#fff" stroke="'+C.h+'" stroke-width="3"/>'+p('M'+(x-12)+' '+(y+12)+'l24 -24',C.h,3);
const port=(x,y,end,label)=>p('M'+x+' '+y+'V'+end)+t(x,y-13,label);
function context(prefix,language){return{l:(zh,en)=>local(language,zh,en),arrow:(d,kind='e')=>p(d,C[kind],3,'marker-end="url(#'+prefix+'-'+kind+')"')};}
function svg(prefix,label,body){
 const markers=['e','h','i','field'].map(k=>'<marker id="'+prefix+'-'+k+'" markerWidth="11" markerHeight="11" refX="9" refY="5.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M1 1L9 5.5L1 10" fill="none" stroke="'+C[k]+'" stroke-width="2"/></marker>').join('');
 return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 400" role="img" aria-labelledby="'+prefix+'-title" style="font-family:Arial,Microsoft JhengHei,sans-serif;background:#f8fafc"><title id="'+prefix+'-title">'+esc(label)+'</title><defs>'+markers+'</defs>'+body+'</svg>';
}
function footer(ctx,kind,operation,phase){
 const {l}=ctx;
 if(operation==='structure')return l('公開來源重建；非比例佈局','Public-source reconstruction; not to scale');
 if(operation==='erase'&&kind==='neobit')return phase===1?l('正常介面：無電性抹除','Normal interface: no electrical erase'):phase===2?l('UV*：歷史選項，封裝另核對','UV*: historical option; check package'):l('FG 保留既有負電荷','FG retains stored negative charge');
 if(operation==='erase'&&kind==='neofuse')return phase===1?l('正常偏壓不修復介電質','Normal bias does not repair dielectric'):l('OTP：缺陷狀態持續存在','OTP: the defect state persists');
 if(operation==='read')return phase===3?(kind==='neoee'?l('比較 I_R；0 / 1 由巨集定義','Compare I_R; macro defines 0 / 1'):kind==='neofuse'?'I_GATE: low / high':'I_R(Q−) > I_R(Q low)'):l('低場感測；保留儲存狀態','Low-field sensing; state retained');
 if(operation==='erase')return phase===0?l('抹除前：FG 保留電荷','Before erase: FG retains charge'):phase===1?l('建立移出電荷所需電場','Establish charge-removal field'):phase===2?'e−: FG → '+(kind==='neomtp'?'EG':'T')+' · FN':l('電荷減少；可再次寫入','Charge reduced; ready to reprogram');
 return phase===0?l('寫入脈衝之前','Before the programming pulse'):phase===1?l('選通並建立寫入電場','Select and establish program field'):phase===2?(kind==='neoee'?'e−: T → FG · FN':kind==='neofuse'?'e−: Si → AF · DT':l('電洞產生載子對；電子進 FG','Pairs generated; e− enters FG')):l('刺激移除後保留儲存狀態','State persists after stimulus removal');
}
function pmos(ctx,kind,operation,phase){
 const {l,arrow}=ctx, mtp=kind==='neomtp', structure=operation==='structure', write=operation==='write', read=operation==='read', erase=operation==='erase';
 const loaded=structure||read||(erase?(!mtp||phase<3):phase>=2);
 let s=t(280,31,mtp?l('pMOS + EG 功能示意','pMOS + EG Functional Model'):l('歷史 pMOS 單元剖面','Historical pMOS Cell Section'));
 s+=r(26,230,505,116,C.si)+r(42,230,460,89,'#a9c7df')+t(105,309,'n-well')+t(281,340,'p-Si');
 s+=r(62,230,69,36,C.p)+r(205,230,61,36,C.p)+r(376,230,65,36,C.p);
 s+=r(122,211,266,19,C.oxide)+r(122,178,81,33,C.metal)+r(265,174,123,37,C.fg,'data-storage-region="fg"');
 s+=t(162,202,'SG')+t(96,256,'p+')+t(236,256,'p+')+t(408,256,'p+');
 s+=port(94,82,230,'SL')+port(162,82,178,'SG')+port(408,82,230,'BL')+port(478,82,295,'NW');
 if(mtp){
  s+=r(291,140,32,34,C.fg)+r(269,113,88,27,C.oxide)+r(269,82,88,31,C.metal)+t(338,106,'EG')+t(353,158,'FG');
 }else s+=t(326,155,'p+ FG');
 if(loaded){
  if(kind==='neobit')s+=t(326,202,'Q−','middle',C.e);
  else s+=[288,313,339,364].map(x=>particle(x,192,false,true)).join('');
 }
 if(write&&phase===1)s+=arrow('M276 283H372','h')+particle(293,246,true)+t(340,307,l('橫向高場','Lateral field'));
 if(write&&phase===2){
  s+=arrow('M276 283H369','h')+particle(298,246,true)+particle(350,245,true)+arrow('M369 246Q397 230 372 208','e')+particle(383,224);
 }
 if(read&&phase>=1){
  s+=p('M106 237H401',C.i,4)+arrow('M143 286H398','i')+t(268,309,'I_R');
  if(phase>=2)s+=particle(171,240,true)+particle(309,240,true);
 }
 if(erase&&mtp&&phase>=1&&phase<=2){
  s+=arrow('M310 177V105','e');
  if(phase===2)s+=particle(310,128);
  s+=t(395,157,'FN','middle',C.e);
 }
 if(erase&&!mtp&&phase===1)s+=stop(498,186);
 if(erase&&!mtp&&phase===2)s+=t(496,173,'UV*','middle','#7e4ba8')+p('M484 185L420 199M481 200L422 208','#7e4ba8',2,'stroke-dasharray="5 5"');
 return s;
}
function neoee(ctx,operation,phase){
 const {l,arrow}=ctx, structure=operation==='structure', read=operation==='read', erase=operation==='erase', loaded=structure||read||(erase?phase<3:phase>=2);
 let s=t(280,31,l('FN / FN：功能窗與共享 FG','FN / FN: Functional Windows and FG'));
 s+=r(75,91,100,33,C.si)+r(75,124,100,25,C.oxide)+r(369,91,100,33,C.si)+r(369,124,100,25,C.oxide);
 s+=r(75,149,394,46,C.fg,'data-storage-region="fg"')+r(203,195,157,28,C.oxide);
 s+=t(125,114,'Si / C')+t(394,114,'Si')+t(281,139,'FG');
 s+=port(125,72,91,'C')+port(419,72,91,'T');
 s+=r(41,236,80,48,C.metal)+r(153,223,285,70,C.si)+p('M121 260H153M438 260H518')+t(81,267,'S')+t(296,267,'READ MOS')+t(505,244,'R');
 s+=t(280,329,l('C / T：功能角色，非固定元件數','C / T: roles, not a fixed device count'));
 if(loaded)s+=[217,250,283,316].map(x=>particle(x,172,false,true)).join('');
 if(operation==='write'&&phase>=1&&phase<=2){s+=arrow('M433 117V175','e');if(phase===2)s+=particle(433,140);s+=t(495,174,'FN','middle',C.e);}
 if(erase&&phase>=1&&phase<=2){s+=arrow('M433 177V115','e');if(phase===2)s+=particle(433,140);s+=t(495,174,'FN','middle',C.e);}
 if(read&&phase>=1){s+=arrow('M130 307H448','i');if(phase>=2)s+=t(485,288,'I_R');}
 return s;
}
function neofuse(ctx,operation,phase){
 const {l,arrow}=ctx, loaded=operation==='structure'||operation==='read'||operation==='erase'||phase>=1;
 let s=t(280,31,l('3T 功能與儲存介電質放大','3T Functions and Enlarged Dielectric'));
 s+=r(43,233,97,53,C.metal)+r(168,233,98,53,C.metal)+r(308,223,183,65,C.si);
 s+=t(92,266,'SEL')+t(217,266,'REG')+t(334,251,'Si')+t(458,282,'nFET');
 s+=p('M22 258H43M140 258H168M266 258H308')+t(25,220,'BL');
 s+=port(91,220,233,'S_CTL')+port(217,220,233,'R_CTL');
 s+=r(334,158,132,65,C.oxide)+r(334,117,132,41,C.metal)+port(399,87,117,'AF');
 s+=t(283,151,l('儲存層','Storage'),'end')+t(283,178,l('閘極氧化層','Gate oxide'),'end')+p('M291 171H328');
 const sites=loaded?[[349,173],[365,173],[432,173],[450,173],[346,185],[451,188],[351,208],[372,209],[431,209],[451,209],[367,189],[434,194]]:[[346,173],[451,209]];
 s+=sites.map(([x,y])=>'<circle data-defect="oxide" cx="'+x+'" cy="'+y+'" r="3.6" fill="'+C.field+'"/>').join('');
 if(operation==='write'&&(phase===1||phase===2)){
  s+=arrow('M399 254V143','e');if(phase===2)s+=particle(399,190);
  s+=t(495,204,'DT','middle',C.e);
 }
 if(operation==='read'&&phase>=1){
  s+=arrow('M382 245V142','e')+arrow('M422 144V275H281','i');
  if(phase>=2)s+=particle(382,190);
  s+=t(400,321,'I_GATE');
 }
 if(operation==='erase'&&phase===1)s+=stop(513,182);
 if(operation==='erase'&&phase===2)s+=r(329,153,142,75,'none','stroke-dasharray="6 5"');
 s+=t(280,350,l('SEL / REG：公開功能，非現行接線表','SEL / REG: functions, not a current netlist'));
 return s;
}
function render(id,operation,phase,language,title){
 const prefix='emip-'+id+'-'+operation+'-'+phase+'-'+language,ctx=context(prefix,language);
 let body=id==='neoee'?neoee(ctx,operation,phase):id==='neofuse'?neofuse(ctx,operation,phase):pmos(ctx,id,operation,phase);
 body+=t(280,395,footer(ctx,id,operation,phase));
 return svg(prefix,title,body);
}
function sourceList(ids,language){
 return ids.map(id=>{
  const source=DATA.sources.find(s=>s.id===id);
  if(!source)throw new Error('來源不存在：'+id);
  const fields=source[language];
  return{id,label:fields.label,url:source.url,kind:local(language,source.kind,source.kind==='公開專利'?'Public Patent':source.kind==='官方轉載主管訪談'?'Officially Reposted Executive Interview':'Primary Technical Source'),date:fields.date,locator:fields.locator,limit:fields.limit};
 });
}
function legend(id,language){
 const l=(zh,en)=>local(language,zh,en);
 const entries=[
  {symbol:'e− / h+',meaning:l('藍色為電子、紅色為電洞；箭頭表示載子方向。','Blue indicates electrons; red indicates holes. Arrows follow carriers.')},
  {symbol:'I',meaning:l('綠色箭頭為傳統電流；它與電子方向相反、與電洞方向相同。','Green arrows show conventional current, opposite to electrons and aligned with holes.')},
  {symbol:'Bias',meaning:l('圖示只給操作角色；不提供可直接使用的端點電壓或脈衝規格。','Only operating roles are shown; terminal voltages and pulse specifications are not supplied.')},
  {symbol:'Scale',meaning:l('幾何與介電質厚度為閱讀而放大；不是製程佈局。','Geometry and dielectrics are enlarged for readability, not a process layout.')}
 ];
 if(id==='neofuse')entries.push({symbol:'DT / 3T',meaning:l('DT 是缺陷增加後有效障壁縮短的直接穿隧模型；SEL／REG 是公開功能，相關專利不等同現行 NeoFuse 接線。','DT describes direct tunneling through a shorter effective barrier after defect generation. SEL/REG are published functions; the related patent is not a verified current NeoFuse netlist.')});
 else entries.push({symbol:'FG / Q−',meaning:id==='neobit'?l('FG 不接直流端；Q− 採歷史 p+ 專利的儲存電荷符號，包含局部負離子電荷。','FG has no DC terminal. Q− follows the historical p+ charge model, including localized negative ionic charge.'):l('FG 是隔離的浮動閘極；藍色負號標示儲存電子。','FG is an isolated floating gate; blue minus signs indicate stored electrons.')});
 if(id==='neobit')entries.push({symbol:'UV*',meaning:l('官方 2021 簡介曾列紫外光抹除；正常 OTP 不提供電性抹除，UV 是否可用須核對實施與封裝。','The 2021 brief lists UV erase. Normal OTP lacks electrical erase; UV access depends on implementation and package.')});
 if(id==='neoee')entries.push({symbol:'C / T / S / R',meaning:l('分別是耦合、穿隧、選擇與讀取功能；不是官方接腳或固定元件數。T 概括各操作的 MOS 穿隧區，不宣稱是同一實體接點。電子多寡與 ON／OFF 對應未指定。','Coupling, tunneling, selection and read roles; not official pins or a fixed device count. T groups the MOS tunneling regions used by the operations, without asserting one physical terminal. No charge-to-ON/OFF polarity is assigned.')});
 if(id==='neomtp')entries.push({symbol:'EG / SL / SG / BL / NW',meaning:l('EG 是公開抹除功能，其餘為 pMOS 教學端點。EG 的方位與材料不代表現行版圖；箭頭只表達 FG→EG 的 FN 路徑。','EG is the published erase function; the remaining labels are pMOS teaching terminals. EG geometry/materials are not a current layout; its arrow expresses the FG-to-EG FN path.')});
 return entries;
}
/**
 * @param {string} id
 * @param {'zh'|'en'} [language='en']
 * @returns {object|null}
 */
export function getIPStudy(id,language='en'){
 if(!['zh','en'].includes(language))return null;
 const cell=DATA.cells.find(c=>c.id===id);
 if(!cell)return null;
 const l=(zh,en)=>local(language,zh,en),sources=sourceList(cell.sourceIds,language),keyLegend=legend(id,language);
 const mechanism={neobit:l('熱電洞誘發電子注入','Hot-hole-induced electron injection'),neofuse:l('高場缺陷生成與穿隧增強','High-field defect generation and enhanced tunneling'),neoee:'FN',neomtp:l('熱電洞誘發電子注入','Hot-hole-induced electron injection')}[id];
 const names={write:l('寫入','Program'),erase:l(id==='neobit'||id==='neofuse'?'抹除操作界線':'抹除',id==='neobit'||id==='neofuse'?'Erase Boundary':'Erase'),read:l('讀取','Read')};
 const phaseNames={write:[l('初始狀態','Initial State'),l('施加條件','Apply Conditions'),l('載子移動','Carrier Motion'),l('保持結果','Retained Result')],erase:id==='neobit'||id==='neofuse'?[l('寫入後狀態','Programmed State'),l('正常操作界線','Normal Operating Boundary'),l(id==='neobit'?'歷史 UV 界線':'持續保持',id==='neobit'?'Historical UV Boundary':'Persistent State')]:[l('寫入後狀態','Programmed State'),l('切換端點條件','Switch Terminal Conditions'),l('移出電子','Remove Electrons'),l('可再次寫入','Ready to Reprogram')],read:[l('保持狀態','Retained State'),l('選擇單元','Select the Cell'),l('感測路徑','Sense the Path'),l('比較結果','Compare the Result')]};
 const operations=['write','erase','read'].map(operationId=>{
  const title=cell.name+' — '+names[operationId];
  const frames=cell.operations[operationId].map((frame,i)=>({id:frame.id,title:phaseNames[operationId][i],state:frame[language],stimulus:i===0?l('維持儲存狀態；尚未施加本次刺激。','Retain the stored state before the operation.'):i===3?l('完成本次操作後回到保持條件。','Return to retention conditions after the operation.'):i===2&&operationId==='erase'&&(id==='neobit'||id==='neofuse')?l('沒有一般電性抹除刺激；此格說明使用界線。','No normal electrical erase stimulus; this frame explains the operating boundary.'):i===2?l('維持本次操作條件，觀察載子或感測路徑。','Maintain the operating conditions and observe the carrier or sensing path.'):cell.operations[operationId][1][language],caption:frame[language],svg:render(id,operationId,i,language,title+' — '+phaseNames[operationId][i]),sourceIds:[...cell.sourceIds]}));
  const summary=operationId==='erase'?cell.reverse[language]:operationId==='read'?l('感測輸出電流並保留儲存狀態；邏輯編碼由巨集定義。','Sense output current while preserving the stored state; the macro defines logic coding.'):cell.operations.write[2][language];
  const operationMechanism=operationId==='read'?(id==='neofuse'?l('閘極電流感測','Gate-current sensing'):l('通道電流感測','Channel-current sensing')):operationId==='erase'?(id==='neobit'||id==='neofuse'?l('正常 OTP 操作界線','Normal OTP operating boundary'):'FN'):mechanism;
  return{topicId:'ip-'+id,operationId,title,summary,sources,variants:[{id:'published-model',title:l('具名 IP 公開原理重建','Named IP Public-Principle Reconstruction'),mechanism:operationMechanism,summary,frames,legend:keyLegend,sources,caveat:cell.excludes[language]+' '+cell.terminals[language]}]};
 });
 return{id,structure:{title:cell.name+' — '+l('單元結構','Cell Structure'),svg:render(id,'structure',0,language,cell.name+' — '+l('單元結構','Cell Structure')),caption:cell.structure[language]+' '+cell.retention[language],legend:keyLegend,sourceIds:[...cell.sourceIds]},operations};
}


const DATA={
  "schema": "力旺單元來源候選-v1",
  "checkedAt": "2026-09-10",
  "sources": [
    {
      "id": "ip-neobit",
      "url": "https://www.ememory.com.tw/en-US/Products/OTP/NeoBit",
      "kind": "原始技術來源",
      "zh": {
        "label": "NeoBit 官方技術原理",
        "date": "未標示；2026-09-10 查核",
        "locator": "Technical Principles",
        "limit": "現行產品原理；未公開全部偏壓及佈局。"
      },
      "en": {
        "label": "NeoBit Technical Principles",
        "date": "Undated; checked 2026-09-10",
        "locator": "Technical Principles",
        "limit": "Current product principle; full biases and layout are not disclosed."
      }
    },
    {
      "id": "ip-neobit-pat",
      "url": "https://patents.google.com/patent/US6914825B2/en",
      "kind": "公開專利",
      "zh": {
        "label": "NeoBit 歷史保留電荷專利",
        "date": "2005-07-05",
        "locator": "Figures 2(a), 2(b), 6; claims 1, 4",
        "limit": "p+ 浮動閘極模型；由 2005 年官方新聞連結，不能推定所有現行製程。"
      },
      "en": {
        "label": "Historical NeoBit Charge-Retention Patent",
        "date": "2005-07-05",
        "locator": "Figures 2(a), 2(b), 6; claims 1, 4",
        "limit": "Historical p+ floating-gate model linked by 2005 company news; not every current process."
      }
    },
    {
      "id": "ip-neobit-link",
      "url": "https://www.ememory.com.tw/en-US/News/News?guid=19081915004414",
      "kind": "原始技術來源",
      "zh": {
        "label": "NeoBit 與保留電荷專利的官方連結",
        "date": "2005-10-04",
        "locator": "Second body paragraph: patent title and inventors",
        "limit": "同名專利與 NeoBit 的直接歷史關聯。"
      },
      "en": {
        "label": "Official NeoBit-to-Patent Link",
        "date": "2005-10-04",
        "locator": "Second body paragraph: patent title and inventors",
        "limit": "Direct historical association between NeoBit and the named patent."
      }
    },
    {
      "id": "ip-neobit-uv",
      "url": "https://www.ememory.com.tw/Content/Upload/files/Product%20Brief/07_NeoBit%C2%AE%E2%80%93%20Most%20Widely%20Used%20OTP%20Solution_20210330.pdf",
      "kind": "原始技術來源",
      "zh": {
        "label": "NeoBit 紫外光抹除的公開界線",
        "date": "2021；檔名版本 2021-03-30",
        "locator": "第 1 頁：功能優點的其他效益段落；UV erase",
        "limit": "曾公開支援紫外光抹除；不代表任意現行封裝可照光抹除。"
      },
      "en": {
        "label": "Published NeoBit UV-Erase Boundary",
        "date": "2021; filename version 2021-03-30",
        "locator": "Page 1: Feature/Advantage, Other benefits; UV erase",
        "limit": "UV erase was published; this does not make every current package UV erasable."
      }
    },
    {
      "id": "ip-neofuse",
      "url": "https://www.ememory.com.tw/en-US/Products/OTP/NeoFuse",
      "kind": "原始技術來源",
      "zh": {
        "label": "NeoFuse 官方技術原理",
        "date": "未標示；2026-09-10 查核",
        "locator": "Technical Principles",
        "limit": "阻抗式 OTP 及 GIDL 抑制；未公開完整層材。"
      },
      "en": {
        "label": "NeoFuse Technical Principles",
        "date": "Undated; checked 2026-09-10",
        "locator": "Technical Principles",
        "limit": "Impedance-based OTP and GIDL suppression; full dielectric materials are undisclosed."
      }
    },
    {
      "id": "ip-neofuse-dt",
      "url": "https://www.chipestimate.com/Quantum-Tunneling-Mechanism-in-NeoFuse/eMemory/Technical-Article/2021/01/19",
      "kind": "原始技術來源",
      "zh": {
        "label": "NeoFuse 的量子穿隧機制",
        "date": "2021-01-19",
        "locator": "Figures 1–3; core nFET, gate oxide, dangling bonds, direct tunneling",
        "limit": "力旺署名原文；超薄氧化層的 DT 模型，不是所有世代的金屬導通絲。"
      },
      "en": {
        "label": "Quantum Tunneling Mechanism in NeoFuse",
        "date": "2021-01-19",
        "locator": "Figures 1–3; core nFET, gate oxide, dangling bonds, direct tunneling",
        "limit": "eMemory-authored article; an ultrathin-oxide DT model, not a metallic filament for all generations."
      }
    },
    {
      "id": "ip-neofuse-3t",
      "url": "https://www.ememory.com.tw/en-US/News/2024-12-09/Powering-the-NVM-and-Embedded-Chip-Security-Technologies",
      "kind": "官方轉載主管訪談",
      "zh": {
        "label": "NeoFuse 具名三電晶體架構",
        "date": "2024-12-09",
        "locator": "NeoFuse: patented 3T design and regulating transistor",
        "limit": "確認 3T 與調節功能，未確認全部現行接線及剖面。"
      },
      "en": {
        "label": "Named NeoFuse Three-Transistor Architecture",
        "date": "2024-12-09",
        "locator": "NeoFuse: patented 3T design and regulating transistor",
        "limit": "Confirms 3T and a regulating function, not every current netlist or cross-section."
      }
    },
    {
      "id": "ip-neofuse-pat",
      "url": "https://patents.google.com/patent/US20250024668A1/en",
      "kind": "公開專利",
      "zh": {
        "label": "三電晶體反熔絲相關專利",
        "date": "2025-01-16",
        "locator": "Figures 2, 3A, 3B; first 3T embodiment; gate dielectric 262/264/266/268",
        "limit": "同公司相關實施例，未直接以 NeoFuse 命名。"
      },
      "en": {
        "label": "Related Three-Transistor Antifuse Patent",
        "date": "2025-01-16",
        "locator": "Figures 2, 3A, 3B; first 3T embodiment; gate dielectric 262/264/266/268",
        "limit": "Related same-company embodiment, not explicitly branded NeoFuse."
      }
    },
    {
      "id": "ip-neoee",
      "url": "https://www.ememory.com.tw/en-US/Products/MTP/NeoEE",
      "kind": "原始技術來源",
      "zh": {
        "label": "NeoEE 官方技術原理",
        "date": "未標示；2026-09-10 查核",
        "locator": "Technical Principles; capacitive-coupling MOS devices and selectors",
        "limit": "現行 FN/FN；未公開確切元件數、p/n 配置及節點偏壓。"
      },
      "en": {
        "label": "NeoEE Technical Principles",
        "date": "Undated; checked 2026-09-10",
        "locator": "Technical Principles; capacitive-coupling MOS devices and selectors",
        "limit": "Current FN/FN; exact device count, p/n arrangement and biases are undisclosed."
      }
    },
    {
      "id": "ip-neoee-history",
      "url": "https://www.chipestimate.com/Value-Propositions-that-NeoEETM-Technology-can-Delivery/eMemory/Technical-Article/2010/10/19",
      "kind": "原始技術來源",
      "zh": {
        "label": "NeoEE 概念單元的歷史原圖",
        "date": "2010-10-19",
        "locator": "NeoEE Technology; Figure 1(b), Tej tunneling junction",
        "limit": "歷史家族同時談 CHE/FN 與 FN/FN；不能覆蓋現行主線。"
      },
      "en": {
        "label": "Historical NeoEE Conceptual Cell",
        "date": "2010-10-19",
        "locator": "NeoEE Technology; Figure 1(b), Tej tunneling junction",
        "limit": "Historical family includes CHE/FN and FN/FN; it does not override the current route."
      }
    },
    {
      "id": "ip-neomtp",
      "url": "https://www.ememory.com.tw/en-US/Products/MTP/NeoMTP",
      "kind": "原始技術來源",
      "zh": {
        "label": "NeoMTP 官方技術原理",
        "date": "未標示；2026-09-10 查核",
        "locator": "Technical Principles; p-type FG-MOSFET; extra erase gate",
        "limit": "熱電洞誘發電子注入及 FG 到抹除閘極的 FN；未公開完整剖面。"
      },
      "en": {
        "label": "NeoMTP Technical Principles",
        "date": "Undated; checked 2026-09-10",
        "locator": "Technical Principles; p-type FG-MOSFET; extra erase gate",
        "limit": "Hot-hole-induced electron injection and FN from FG to erase gate; full cross-section is undisclosed."
      }
    },
    {
      "id": "ip-neomtp-pat",
      "url": "https://patents.google.com/patent/US20030235082A1/en",
      "kind": "公開專利",
      "zh": {
        "label": "pMOS 與邊緣抹除閘極的相關專利",
        "date": "2003-12-25",
        "locator": "Figures 2, 3A–3C, 4, 5; paragraphs 0019–0035",
        "limit": "歷史同公司專利；n+ 側向 EG 不能直接指稱現行 NeoMTP。"
      },
      "en": {
        "label": "Related pMOS and Edge-Erase-Gate Patent",
        "date": "2003-12-25",
        "locator": "Figures 2, 3A–3C, 4, 5; paragraphs 0019–0035",
        "limit": "Historical same-company patent; lateral n+ EG is not established as current NeoMTP."
      }
    }
  ],
  "cells": [
    {
      "id": "neobit",
      "name": "NeoBit",
      "family": "floating-gate-otp",
      "sourceIds": [
        "ip-neobit",
        "ip-neobit-pat",
        "ip-neobit-link",
        "ip-neobit-uv"
      ],
      "structure": {
        "zh": "串聯 pMOS 選擇器與 pMOS 浮動閘極單元。歷史剖面：p 型基板內的 n 井、p+ 源／共用區／汲極、獨立選擇閘極與 p+ 浮動閘極；FG 不接導線，也沒有堆疊控制閘極。",
        "en": "Series pMOS selector and pMOS floating-gate cell. Historical section: n-well in p substrate, p+ source/shared region/drain, separate select gate and p+ FG; no FG wire or stacked control gate."
      },
      "terminals": {
        "zh": "SL、SG/WL、BL、NW；FG 為浮動節點。SG 與 FG 不相連；BL 的電容耦合不能畫成直流導線。",
        "en": "SL, SG/WL, BL and NW; FG floats. SG is separate from FG; capacitive BL coupling is not a DC connection."
      },
      "retention": {
        "zh": "介電質隔離 FG。歷史 p+ 模型另說明注入電子與自由電洞復合，留下局部負離子電荷；圖中 Q− 表示儲存狀態，不全是自由電子。",
        "en": "Dielectric isolates FG. The historical p+ model adds electron–hole recombination leaving localized negative ionic charge; stored Q− is not entirely free electrons."
      },
      "reverse": {
        "zh": "正常 OTP 介面沒有電性抹除操作；不能據此聲稱物理上永不可清除。2021 年官方簡介明列 UV erase，是否能照光取決於實施與封裝。",
        "en": "The normal OTP interface lacks electrical erase. This does not imply physical irreversibility: the 2021 brief lists UV erase, subject to implementation and package."
      },
      "supports": {
        "zh": "可畫兩個 pMOS、隔離 FG、熱電洞→電子／電洞對→電子進 FG，以及低場通道感測。",
        "en": "Draw two pMOS devices, isolated FG, hot holes generating electron–hole pairs, electron injection, and low-field channel sensing."
      },
      "excludes": {
        "zh": "不畫介電質擊穿、永久導電絲、nMOS CHE；不補數值電壓或所有現行型號的 p+ 摻雜保證。",
        "en": "Do not draw oxide rupture, a permanent filament or nMOS CHE; do not invent voltages or universal current p+ doping."
      },
      "operations": {
        "write": [
          {
            "id": "neobit-write-1",
            "zh": "初始：FG 儲存負電荷較少，p 通道未進入寫入後的導通狀態。",
            "en": "Initial: less stored negative FG charge; p-channel is not in its programmed conductive state."
          },
          {
            "id": "neobit-write-2",
            "zh": "刺激：選通 pMOS，在通道建立橫向高場；FG 經電容耦合改變電位。",
            "en": "Stimulus: select pMOS and establish a lateral channel field; coupling shifts FG potential."
          },
          {
            "id": "neobit-write-3",
            "zh": "載子：加速電洞產生電子／電洞對；部分熱電子穿過氧化層進入 FG。",
            "en": "Carriers: accelerated holes create electron–hole pairs; some hot electrons enter FG through oxide."
          },
          {
            "id": "neobit-write-4",
            "zh": "保持：脈衝移除後保留 Q−；p 通道在指定讀取條件下較易導通。",
            "en": "Hold: Q− remains after the pulse; the p-channel conducts more readily at specified read bias."
          }
        ],
        "erase": [
          {
            "id": "neobit-erase-1",
            "zh": "寫入後：FG 保留 Q−。",
            "en": "After programming: FG retains Q−."
          },
          {
            "id": "neobit-erase-2",
            "zh": "操作界線：正常 OTP 不提供電性抹除路徑。",
            "en": "Boundary: normal OTP operation provides no electrical erase path."
          },
          {
            "id": "neobit-erase-3",
            "zh": "歷史例外：官方曾列 UV erase；不代表本封裝可用。",
            "en": "Historical exception: UV erase was published; package support is not implied."
          }
        ],
        "read": [
          {
            "id": "neobit-read-1",
            "zh": "保持：讀取前 FG 電荷狀態不變。",
            "en": "Hold: FG charge is unchanged before reading."
          },
          {
            "id": "neobit-read-2",
            "zh": "刺激：選通單元並施加低場讀取條件。",
            "en": "Stimulus: select the cell with low-field read conditions."
          },
          {
            "id": "neobit-read-3",
            "zh": "路徑：電洞沿 p 通道流動；不把 FG 電荷拉進位元線。",
            "en": "Path: holes flow along the p-channel; FG charge is not discharged into BL."
          },
          {
            "id": "neobit-read-4",
            "zh": "結果：感測通道電流；資料 0/1 對應由巨集定義。",
            "en": "Result: sense channel current; the macro defines the 0/1 mapping."
          }
        ]
      }
    },
    {
      "id": "neofuse",
      "name": "NeoFuse",
      "family": "antifuse-otp",
      "sourceIds": [
        "ip-neofuse",
        "ip-neofuse-dt",
        "ip-neofuse-3t",
        "ip-neofuse-pat"
      ],
      "structure": {
        "zh": "儲存核心是 nFET 閘極介電質，讀取閘極電流。公開 3T 說明增加調節電晶體；主圖可用選擇／調節／反熔絲三功能，並標示連線為概念。",
        "en": "Storage uses an nFET gate dielectric and gate-current sensing. Published 3T adds regulation; show selection, regulation and antifuse functions with conceptual connectivity."
      },
      "terminals": {
        "zh": "反熔絲閘極 AF、下方矽區 Si、選擇與調節控制、BL；AF 與 Si 間的儲存介電質不同於選擇器氧化層。",
        "en": "Antifuse gate AF, underlying Si, selection/regulation controls and BL; storage dielectric lies between AF and Si, not in the selector oxide."
      },
      "retention": {
        "zh": "寫入後介電質缺陷狀態保留；資料不是 FG 內的電子數。",
        "en": "The programmed dielectric-defect state persists; data is not an FG electron count."
      },
      "reverse": {
        "zh": "正常操作沒有修復介電質缺陷的抹除步驟；降低偏壓不會回復原始低缺陷狀態。",
        "en": "Normal operation has no defect-repair erase step; reducing bias does not restore the initial dielectric."
      },
      "supports": {
        "zh": "保留介電質層的示意輪廓、增加缺陷密度並縮短有效障壁；畫 Si→閘極的電子穿隧。",
        "en": "Keep a dielectric-layer outline, increase defects and shorten the effective barrier; show electrons tunneling from Si toward the gate."
      },
      "excludes": {
        "zh": "不畫粗金屬短路或 FG 儲存；未證明現行先進製程是高介電常數層或介面層哪一層先損傷。",
        "en": "No thick metallic short or FG storage; the damaged high-k/interfacial sublayer of current advanced processes is unverified."
      },
      "operations": {
        "write": [
          {
            "id": "neofuse-write-1",
            "zh": "初始：閘極介電質缺陷少、閘極電流低。",
            "en": "Initial: few dielectric defects and low gate current."
          },
          {
            "id": "neofuse-write-2",
            "zh": "刺激：選擇／調節路徑施加介電質高場。",
            "en": "Stimulus: selection/regulation establishes high dielectric field."
          },
          {
            "id": "neofuse-write-3",
            "zh": "載子：缺陷生成，有效穿隧距離縮短；電子穿越介電質。",
            "en": "Carriers: defects shorten the effective barrier; electrons tunnel across it."
          },
          {
            "id": "neofuse-write-4",
            "zh": "保持：移除刺激後缺陷狀態保留。",
            "en": "Hold: the defect state remains after stress removal."
          }
        ],
        "erase": [
          {
            "id": "neofuse-erase-1",
            "zh": "寫入後：缺陷狀態已改變。",
            "en": "After programming: the defect state has changed."
          },
          {
            "id": "neofuse-erase-2",
            "zh": "操作界線：一般偏壓不能修復介電質。",
            "en": "Boundary: ordinary bias does not repair the dielectric."
          },
          {
            "id": "neofuse-erase-3",
            "zh": "結果：正常使用維持 OTP 狀態。",
            "en": "Result: normal use retains the OTP state."
          }
        ],
        "read": [
          {
            "id": "neofuse-read-1",
            "zh": "比較：原始與寫入後的缺陷密度不同。",
            "en": "Compare: initial and programmed states have different defect densities."
          },
          {
            "id": "neofuse-read-2",
            "zh": "刺激：施加低於寫入應力的感測條件。",
            "en": "Stimulus: use read conditions below programming stress."
          },
          {
            "id": "neofuse-read-3",
            "zh": "路徑：讀取閘極電流；Si→AF 電子與傳統電流反向。",
            "en": "Path: sense gate current; Si-to-AF electrons oppose conventional current."
          },
          {
            "id": "neofuse-read-4",
            "zh": "結果：比較參考電流，保留介電質狀態。",
            "en": "Result: compare with a current reference without resetting defects."
          }
        ]
      }
    },
    {
      "id": "neoee",
      "name": "NeoEE",
      "family": "fn-fn-mtp",
      "sourceIds": [
        "ip-neoee",
        "ip-neoee-history"
      ],
      "structure": {
        "zh": "單層多晶矽 FG、電容耦合 MOS 結構與選擇器。控制耦合與穿隧是功能角色，可能由多個 MOS 區域實現；公開資料不足以固定數量或 p/n 配置。",
        "en": "Single-poly FG with capacitive-coupling MOS structures and selectors. Coupling and tunneling are functional roles; public evidence does not fix the device count or p/n arrangement."
      },
      "terminals": {
        "zh": "耦合端 C、穿隧端 T、讀取通道 R、選擇端 S 是示意功能名稱，並非官方接腳。共享 FG 不接外部電源。",
        "en": "C, T, R and S denote coupling, tunneling, read-channel and selection functions, not official pins. Shared FG has no external supply connection."
      },
      "retention": {
        "zh": "移除高場後，隔離 FG 保存電荷並改變讀取通道的臨界條件。",
        "en": "After high-field removal, isolated FG charge shifts the read-channel threshold."
      },
      "reverse": {
        "zh": "具備反向 FN 電荷移出路徑，因而可電性更新；循環壽命仍由介電質與巨集條件限制。",
        "en": "An FN charge-removal path enables electrical rewriting; dielectric wear and macro conditions limit cycling."
      },
      "supports": {
        "zh": "主線固定 FN 寫入／FN 抹除；以功能窗呈現電子進出同一 FG。",
        "en": "Keep the main route FN program/FN erase; show electrons entering and leaving the same FG through functional windows."
      },
      "excludes": {
        "zh": "不將 2010 年 CHE/FN 分支混入；不把 C、T 都畫成固定兩顆實體電容；不指定電子多必為 ON。",
        "en": "Exclude the historical CHE/FN branch; do not assert exactly two physical capacitors or that more electrons always mean ON."
      },
      "operations": {
        "write": [
          {
            "id": "neoee-write-1",
            "zh": "初始：FG 處於較少電子的示意狀態。",
            "en": "Initial: FG is shown with fewer electrons."
          },
          {
            "id": "neoee-write-2",
            "zh": "刺激：耦合及穿隧端建立所需氧化層電場。",
            "en": "Stimulus: coupling and tunneling terminals establish oxide field."
          },
          {
            "id": "neoee-write-3",
            "zh": "載子：電子由 MOS 穿隧區以 FN 方式進入 FG。",
            "en": "Carriers: electrons enter FG from a MOS tunneling region by FN tunneling."
          },
          {
            "id": "neoee-write-4",
            "zh": "保持：電場解除，FG 電荷增加並保留。",
            "en": "Hold: field removal leaves increased FG charge."
          }
        ],
        "erase": [
          {
            "id": "neoee-erase-1",
            "zh": "初始：FG 保留已寫入電荷。",
            "en": "Initial: FG retains programmed charge."
          },
          {
            "id": "neoee-erase-2",
            "zh": "刺激：切換端點條件，建立移出電荷所需電場。",
            "en": "Stimulus: switch terminal conditions to establish charge-removal field."
          },
          {
            "id": "neoee-erase-3",
            "zh": "載子：電子由 FG 經 FN 穿隧移至 MOS 接收區。",
            "en": "Carriers: electrons leave FG by FN tunneling into a MOS receiving region."
          },
          {
            "id": "neoee-erase-4",
            "zh": "結果：FG 電荷減少，可再次寫入。",
            "en": "Result: reduced FG charge permits another program cycle."
          }
        ],
        "read": [
          {
            "id": "neoee-read-1",
            "zh": "保持：兩種 FG 電荷狀態形成不同臨界條件。",
            "en": "Hold: two FG charge states create different thresholds."
          },
          {
            "id": "neoee-read-2",
            "zh": "刺激：選擇器開啟讀取通道。",
            "en": "Stimulus: selectors enable the read channel."
          },
          {
            "id": "neoee-read-3",
            "zh": "路徑：感測通道導電差異，不產生 FN 電荷搬移。",
            "en": "Path: sense channel conductance without FN charge transfer."
          },
          {
            "id": "neoee-read-4",
            "zh": "結果：比較參考值，保持 FG 電荷。",
            "en": "Result: compare against a reference while preserving FG charge."
          }
        ]
      }
    },
    {
      "id": "neomtp",
      "name": "NeoMTP",
      "family": "chi-fn-mtp",
      "sourceIds": [
        "ip-neomtp",
        "ip-neomtp-pat",
        "ip-neobit"
      ],
      "structure": {
        "zh": "類似 NeoBit 的單層多晶矽 p 型 FG-MOSFET，另有抹除閘極 EG。EG 與 FG 以介電質隔離，不能畫成導線短接。",
        "en": "Single-poly p-type FG-MOSFET related to NeoBit, with an additional erase gate EG. Dielectric separates EG and FG; they are not shorted."
      },
      "terminals": {
        "zh": "SL、SG、BL 與井接點沿用 pMOS 概念；EG 是公開抹除端。現行 EG 摻雜、相對方位與電壓未完整公開。這些是教學端點，並非官方接腳表。",
        "en": "SL, SG, BL and well contact follow the pMOS concept; EG is a published erase terminal. Current EG doping, geometry and voltages are not fully disclosed. These are teaching terminals, not an official pin table."
      },
      "retention": {
        "zh": "FG 電荷受介電質隔離；EG 僅在抹除條件下提供 FN 出口。",
        "en": "Dielectric isolates FG charge; EG provides an FN exit under erase conditions."
      },
      "reverse": {
        "zh": "可用 EG 移出電子，並重新注入；不能把 OTP 無電性抹除界線套在本單元。",
        "en": "EG removes electrons for later reinjection; the OTP electrical-erase boundary does not apply."
      },
      "supports": {
        "zh": "寫入：熱電洞誘發電子注入；抹除：電子 FG→EG；讀取：p 通道電流。",
        "en": "Program: hot-hole-induced electron injection; erase: electrons FG-to-EG; read: p-channel current."
      },
      "excludes": {
        "zh": "不把電洞箭頭直接畫進 FG；不以 nMOS 傳統 CHE 代替；歷史邊緣 n+ EG 需另標來源。",
        "en": "Do not draw injected holes in FG or substitute conventional nMOS CHE; historical edge n+ EG requires separate attribution."
      },
      "operations": {
        "write": [
          {
            "id": "neomtp-write-1",
            "zh": "初始：FG 電荷較少，p 通道為抹除後狀態。",
            "en": "Initial: less FG charge; p-channel is in the erased state."
          },
          {
            "id": "neomtp-write-2",
            "zh": "刺激：選通後建立通道橫向高場。",
            "en": "Stimulus: selection establishes a lateral channel field."
          },
          {
            "id": "neomtp-write-3",
            "zh": "載子：熱電洞誘發熱電子，電子穿過氧化層進 FG。",
            "en": "Carriers: hot holes induce hot electrons, which cross oxide into FG."
          },
          {
            "id": "neomtp-write-4",
            "zh": "保持：FG 留下負電荷；p 通道在讀取條件下導通。",
            "en": "Hold: negative FG charge remains; p-channel conducts at read bias."
          }
        ],
        "erase": [
          {
            "id": "neomtp-erase-1",
            "zh": "初始：FG 保有寫入負電荷。",
            "en": "Initial: FG retains programmed negative charge."
          },
          {
            "id": "neomtp-erase-2",
            "zh": "刺激：施加 EG 抹除條件，建立移出電荷的電場。",
            "en": "Stimulus: EG erase conditions establish charge-removal field."
          },
          {
            "id": "neomtp-erase-3",
            "zh": "載子：電子由 FG 經 FN 穿隧移向 EG。",
            "en": "Carriers: electrons tunnel from FG toward EG by FN."
          },
          {
            "id": "neomtp-erase-4",
            "zh": "結果：FG 電子減少，p 通道在指定讀取條件下關閉。",
            "en": "Result: reduced FG electrons turn the p-channel off at specified read bias."
          }
        ],
        "read": [
          {
            "id": "neomtp-read-1",
            "zh": "保持：讀取前維持 FG 儲存狀態；電荷多寡影響 p 通道。",
            "en": "Hold: retain the FG state before reading; charge level affects the p-channel."
          },
          {
            "id": "neomtp-read-2",
            "zh": "刺激：選通並施加讀取條件，EG 不執行抹除。",
            "en": "Stimulus: apply read conditions; EG does not erase."
          },
          {
            "id": "neomtp-read-3",
            "zh": "路徑：電洞沿 p 通道移動，FG 無淨電荷搬移。",
            "en": "Path: holes move along the p-channel without net FG charge transfer."
          },
          {
            "id": "neomtp-read-4",
            "zh": "結果：比較通道電流，保留儲存狀態。",
            "en": "Result: compare channel current while retaining the stored state."
          }
        ]
      }
    }
  ]
};
