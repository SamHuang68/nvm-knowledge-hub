import { DEFAULT, UNITS, estimate, ceil, compact, compactText, integer, byteText } from './sram-repair-model.js';
const L = (zh, en) => window.HubLanguage?.get() === 'zh' ? zh : en;
const $ = id => document.getElementById(id);
const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 });
const errorEnglish = {"請輸入有效的非負數字。": "Enter a valid nonnegative number.", "數值超出可計算範圍。": "The value exceeds the supported range.", "計算結果超出 9,007,199,254,740,991 bits，請縮小參數。": "The result exceeds 9,007,199,254,740,991 bits. Reduce the inputs.", "比例格式為 1/1000、0.001 或 0.1%。": "Use a fraction, decimal or percentage: 1/1000, 0.001 or 0.1%.", "比例的分母必須大於 0。": "The denominator must be greater than zero.", "原始修復資料比例須大於 0，且不超過 1（100%）。": "The repair fraction must be greater than 0 and at most 1 (100%).", "壓縮倍率須大於或等於 1。": "Compression ratio must be at least 1.", "保留比例須大於 0%，且不超過 100%。": "Retained percentage must be greater than 0% and at most 100%.", "減少比例須介於 0%（含）與 100%（不含）。": "Reduction must be at least 0% and less than 100%.", "請選擇有效的壓縮率定義。": "Choose a valid compression definition.", "請輸入 0% 至 1000%。": "Enter a percentage from 0% to 1000%.", "配置粒度須為 1 至 9,007,199,254,740,991 的整數 bits。": "Block size must be an integer from 1 to 9,007,199,254,740,991 bits.", "SRAM 容量必須大於 0。": "SRAM capacity must be greater than zero.", "請選擇有效的容量單位。": "Choose a valid capacity unit."};
let current = null, currentState = null, scale = 'log', toastTimer;
const techNames = { otp: 'OTP', efuse: 'eFuse' };
const chip = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="14" height="14" rx="3"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3"/></svg>';
function renderTechCards() {
const previous = document.getElementById('otp-overhead') ? getState() : DEFAULT;
$('tech-grid').innerHTML = ['otp','efuse'].map(key => `<article class="panel tech ${key}"><div class="tech-top"><div class="tech-identity"><div class="tech-icon">${chip}</div><div><h3>${techNames[key]}</h3><div class="tech-label">${L("修復資料儲存","Repair-data storage")}</div></div></div><div class="tech-summary"><div class="tech-label">${L("配置容量","Allocated capacity")}</div><div class="tech-amount" id="${key}-amount">—</div><div class="tech-bits" id="${key}-bits">—</div></div></div><div class="tech-inputs">${[['overhead',L("額外開銷","Overhead"),'%','0'],['reserve',L("預留空間","Reserve"),'%','0'],['block',L("配置粒度","Block size"),'bits','1']].map(([field,label,unit,value])=>`<div><label for="${key}-${field}">${label}</label><div class="joined"><input id="${key}-${field}" type="number" min="${field==='block'?'1':'0'}" step="${field==='block'?'1':'any'}" value="${value}" aria-label="${techNames[key]} ${label}" aria-describedby="${key}-${field}-error"><span>${unit}</span></div><p class="field-error" id="${key}-${field}-error"></p></div>`).join('')}</div><p class="tech-note">${L("規劃參數，請依實際 IP 規格調整。","Planning inputs; adjust to actual IP specifications.")}</p></article>`).join('');
for (const key of ['otp','efuse']) for (const field of ['overhead','reserve','block']) $(`${key}-${field}`).value=previous[key][field];
}
renderTechCards();
function getState() { return { capacity: $('capacity').value, unit: $('unit').value, repair: $('repair').value, compression: $('compression').value, mode: $('mode').value, ...Object.fromEntries(['otp','efuse'].map(key=>[key,Object.fromEntries(['overhead','reserve','block'].map(f=>[f,$(`${key}-${f}`).value]))])) }; }
function displayCapacity(id,bits) { const c=compact(bits); $(id).innerHTML=`${c.value} <small>${c.unit}</small>`; }
function toast(message) { $('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3000); }
function setModeUI() { const mode=$('mode').value; $('compression-suffix').textContent=mode==='ratio'?': 1':'%';$('compression').min=mode==='ratio'?'1':'0';if(mode==='ratio')$('compression').removeAttribute('max');else $('compression').max='100'; }
function render() {
  document.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
  document.querySelectorAll('.field-error').forEach(el=>el.textContent='');
  $('error-banner').hidden=true;$('results').classList.remove('invalid');
  setModeUI();
  $('repair-hint').textContent=L('支援分數、小數或百分比','Fraction, decimal or percentage');
  const state=getState();
  $('capacity-hint').textContent=`1 ${state.unit} = ${integer(UNITS[state.unit])} bits (${state.unit.includes('i')?L('二進位','binary'):L('十進位','decimal')})`;
  document.querySelectorAll('[data-capacity]').forEach(b=>{const selected=state.unit==='Gb'&&Number(state.capacity)===Number(b.dataset.capacity);b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
  try {
    const r=estimate(state);current=r;currentState=state;
    $('export').disabled=false;
    $('live-status').innerHTML=L("<i></i> 已更新","<i></i> Updated");
    displayCapacity('raw-display',r.raw);displayCapacity('payload-display',r.payload);
    $('raw-exact').textContent=`${integer(r.raw)} bits`;$('payload-exact').textContent=`${integer(r.payload)} bits`;
    $('raw-bytes').textContent=byteText(r.raw);$('payload-bytes').textContent=byteText(r.payload);
    const savings=Number(r.saved)/Number(r.raw)*100;
    $('saved-display').innerHTML=`${nf.format(savings)} <small>%</small>`;
    $('saved-exact').textContent=L(`節省 ${integer(r.saved)} bits`,`${integer(r.saved)} bits saved`);
    $('ratio-display').textContent=L(`壓縮倍率 ${nf.format(r.ratio)} : 1`,`Compression ${nf.format(r.ratio)} : 1`);
    $('repair-hint').textContent=`= ${nf.format(Number(r.repair.n)/Number(r.repair.d)*100)}% · ${L('支援分數、小數或百分比','Fraction, decimal or percentage')}`;
    $('compression-hint').textContent=L(`保留 ${nf.format(100/r.ratio)}% · 減少 ${nf.format(100-100/r.ratio)}%（取整前）`,`Retained ${nf.format(100/r.ratio)}% · Reduced ${nf.format(100-100/r.ratio)}% (before rounding)`);
    $('compression-slider').value=Math.min(100,Math.max(0,Math.log10(r.ratio)*25));
    $('compression-slider').setAttribute('aria-valuetext',`${nf.format(r.ratio)} ${L('比','to')} 1`);
    for(const key of ['otp','efuse']){displayCapacity(`${key}-amount`,r[key].allocated);$(`${key}-bits`).textContent=`${integer(r[key].allocated)} bits · ${compactText(r[key].allocated,true)}`;}
    const rows=[[L("有效修復資料","Repair payload"),'payload'],[L("額外開銷","Overhead"),'overhead'],[L("預留空間","Reserve"),'reserve'],[L("對齊補足","Alignment padding"),'padding'],[L("實際配置容量","Allocated capacity"),'allocated']];
    $('comparison-rows').innerHTML=rows.map(([label,key])=>`<tr class="${key==='allocated'?'total':''}"><td>${label}</td><td data-value="otp-${key}">${integer(r.otp[key])} bits</td><td data-value="efuse-${key}">${integer(r.efuse[key])} bits</td></tr>`).join('')+`<tr><td>${L("完整位元組容量","Whole-byte capacity")}</td><td>${integer(ceil(r.otp.allocated,8n))} B</td><td>${integer(ceil(r.efuse.allocated,8n))} B</td></tr>`;
    const diff=r.otp.allocated-r.efuse.allocated;
    $('difference').textContent=diff===0n?L("目前兩種技術的配置容量相同；技術名稱本身不改變有效資料位元數。","Both technologies allocate the same capacity; the technology label does not change the payload bits."):L(`${diff>0n?'OTP':'eFuse'} 配置容量較多 ${integer(diff>0n?diff:-diff)} bits；差異來自目前設定的開銷、預留與配置粒度。`,`${diff>0n?'OTP':'eFuse'} allocates ${integer(diff>0n?diff:-diff)} more bits due to the selected overhead, reserve and block size.`);
    $('insight').textContent=L(`${state.capacity} ${state.unit} SRAM 在 ${state.repair} 修復資料比例、${nf.format(r.ratio)}:1 壓縮假設下，需 ${compactText(r.payload)} 有效修復資料。`,`${state.capacity} ${state.unit} SRAM at ${state.repair} raw repair data and ${nf.format(r.ratio)}:1 compression requires ${compactText(r.payload)} of payload.`)+(r.raw===r.payload?L('目前沒有容量節省。','No capacity is saved in this scenario.'):'');
    renderChart(r,state);
  } catch(error) {
    const message=L(error.message,errorEnglish[error.message]||"Check the input values.");
    current=null;currentState=null;$('export').disabled=true;
    $('results').classList.add('invalid');$('error-banner').hidden=false;$('error-banner').textContent=message;
    $('live-status').textContent=L("等待有效輸入","Awaiting valid input");
    if(error.field&&$(error.field)) { $(error.field).setAttribute('aria-invalid','true');if($(error.field+'-error'))$(error.field+'-error').textContent=message; }
    for(const id of ['raw-display','payload-display','saved-display','raw-exact','payload-exact','raw-bytes','payload-bytes','saved-exact','ratio-display','otp-amount','efuse-amount','otp-bits','efuse-bits'])$(id).textContent='—';
    $('comparison-rows').innerHTML=L("<tr><td colspan=\"3\">請修正輸入，系統將重新計算。</td></tr>","<tr><td colspan=\"3\">Correct the inputs to recalculate.</td></tr>");
    $('chart').replaceChildren();$('chart-note').textContent=L("請修正輸入以顯示趨勢圖。","Correct the inputs to display the chart.");$('difference').textContent=L("等待有效輸入。","Awaiting valid input.");$('insight').textContent=L("輸入修正後，結果會立即更新。","Results update as soon as the inputs are valid.");
    $('compression-hint').textContent=L("倍率 100:1 = 保留 1% = 減少 99%。","100:1 compression = 1% retained = 99% reduction.");
  }
}
function renderChart(r,state){
  const W=Math.max(300,Math.round($('chart').clientWidth)),H=Math.round($('chart').clientHeight)||240,left=58,R=24,T=24,B=34,pw=W-left-R,ph=H-T-B;
  const maxPower=Math.max(3,Math.ceil(Math.log10(r.ratio)));const maxRatio=10**maxPower;
  const samples=Array.from({length:81},(_,i)=>10**(i/80*maxPower));samples.push(r.ratio);samples.sort((a,b)=>a-b);
  const data=samples.map(ratio=>{try{const q=estimate({...state,mode:'ratio',compression:String(ratio)});return {ratio,otp:Number(q.otp.allocated),efuse:Number(q.efuse.allocated)};}catch{return null;}}).filter(Boolean);
  if(!data.length){$('chart').textContent=L("此參數組合超出圖表範圍。","These settings exceed the chart range.");return;}
  const vals=data.flatMap(d=>[d.otp,d.efuse]);const low=Math.floor(Math.log10(Math.max(1,Math.min(...vals)))),high=Math.max(low+1,Math.ceil(Math.log10(Math.max(...vals))));
  const maxValue=Math.max(...vals)*1.06;const x=v=>left+Math.log10(v)/maxPower*pw;
  const y=v=>T+ph*(1-(scale==='log'?(Math.log10(Math.max(1,v))-low)/(high-low):v/maxValue));
  const ticks=Array.from({length:5},(_,i)=>scale==='log'?10**(low+(high-low)*i/4):maxValue*i/4);
  const grids=ticks.map(v=>`<line class="grid-line" x1="${left}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}"/><text x="${left-12}" y="${y(v)+3}" text-anchor="end">${compactText(BigInt(Math.round(v)))}</text>`).join('');
  const xPowers=Array.from(new Set([0,Math.round(maxPower/3),Math.round(maxPower*2/3),maxPower]));
  const xticks=xPowers.map(p=>`<text x="${x(10**p)}" y="${H-8}" text-anchor="middle">${nf.format(10**p)}:1</text>`).join('');
  const path=key=>data.map((d,i)=>`${i?'L':'M'}${x(d.ratio).toFixed(2)},${y(d[key]).toFixed(2)}`).join(' ');
  const otpY=y(Number(r.otp.allocated)),efY=y(Number(r.efuse.allocated)),px=x(r.ratio);
  const labelX=Math.max(left+70,Math.min(W-R-70,px));
  $('chart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="chart-title chart-description" preserveAspectRatio="none"><title id="chart-title">${L("OTP 與 eFuse 配置容量隨壓縮倍率變化","OTP and eFuse allocated capacity versus compression")}</title><desc id="chart-description">${L(`橫軸為壓縮倍率，對數刻度 1 至 ${nf.format(maxRatio)}；縱軸為容量 bits，${scale==='log'?'對數':'線性'}刻度。目前 ${nf.format(r.ratio)} 比 1，OTP ${integer(r.otp.allocated)} bits，eFuse ${integer(r.efuse.allocated)} bits。`,`X: compression ratio, log scale 1 to ${nf.format(maxRatio)}. Y: capacity in bits, ${scale} scale. Current ratio ${nf.format(r.ratio)} to 1; OTP ${integer(r.otp.allocated)} bits; eFuse ${integer(r.efuse.allocated)} bits.`)}</desc>${grids}${xticks}<path d="${path('otp')} L${x(data.at(-1).ratio)},${T+ph} L${x(data[0].ratio)},${T+ph} Z" fill="#eaf3e9" opacity=".75"/><path d="${path('otp')}" fill="none" stroke="#2b8562" stroke-width="3"/><path d="${path('efuse')}" fill="none" stroke="#8a77b3" stroke-width="2" stroke-dasharray="6 5"/><line x1="${px}" x2="${px}" y1="${T}" y2="${T+ph}" stroke="#728e64" stroke-width="1" stroke-dasharray="3 4"/><circle cx="${px}" cy="${otpY}" r="5" fill="#2b8562" stroke="white" stroke-width="2"><title>OTP: ${integer(r.otp.allocated)} bits</title></circle><circle cx="${px}" cy="${efY}" r="3" fill="#8a77b3" stroke="white" stroke-width="1"><title>eFuse: ${integer(r.efuse.allocated)} bits</title></circle><rect x="${labelX-56}" y="0" width="112" height="19" rx="4" fill="#edf3e7"/><text x="${labelX}" y="13" text-anchor="middle" style="fill:#587344;font-size:10px">${L('目前','Current')} ${nf.format(r.ratio)}:1</text></svg>`;
  const overlap=data.every(d=>d.otp===d.efuse);
  $('chart-note').textContent=`${overlap?L("相同配置結果，兩條曲線重疊。","Identical allocations: the two curves overlap."):L("含各自開銷、預留及配置粒度。","Includes each technology's overhead, reserve and block size.")}${data.length<samples.length?L(" 部分倍率超出計算範圍。"," Some ratios exceed the calculation range."):''}`;
}
function loadDefault(message){for(const f of ['capacity','unit','repair','compression','mode'])$(f).value=DEFAULT[f];for(const key of ['otp','efuse'])for(const f of ['overhead','reserve','block'])$(`${key}-${f}`).value=DEFAULT[key][f];render();toast(message);}
document.addEventListener('input',event=>{if(event.target.matches('input:not([type=range]), #unit'))render();});
$('mode').addEventListener('change',()=>{if(current){const ratio=current.ratio;const mode=$('mode').value;const value=mode==='ratio'?ratio:mode==='retained'?100/ratio:100-100/ratio;$('compression').value=String(Number(value.toPrecision(12)));}render();});
$('compression-slider').addEventListener('input',()=>{const ratio=10**(Number($('compression-slider').value)/25);const mode=$('mode').value;const value=mode==='ratio'?ratio:mode==='retained'?100/ratio:100-100/ratio;$('compression').value=String(Number(value.toPrecision(10)));render();});
document.querySelectorAll('[data-capacity]').forEach(b=>b.addEventListener('click',()=>{$('capacity').value=b.dataset.capacity;$('unit').value='Gb';render();}));
$('load-example').addEventListener('click',()=>loadDefault(L("已載入 16 Gb 範例：1/1000、100:1，配置參數回到預設。","Loaded 16 Gb, 1/1000, 100:1; allocation settings restored.")));
$('reset').addEventListener('click',()=>loadDefault(L("已重設全部估算與配置參數。","All estimate and allocation settings reset.")));
for(const s of ['log','linear'])$('scale-'+s).addEventListener('click',()=>{scale=s;for(const k of ['log','linear'])$('scale-'+k).setAttribute('aria-pressed',String(s===k));if(current)renderChart(current,currentState);});
$('export').addEventListener('click',()=>{
  if(!current)return;
  const r=current,s=currentState;
  const rows=[[L("SRAM 修復容量試算","SRAM repair capacity estimate"),L("數值","Value"),L("單位／定義","Unit / definition")],[L("匯出時間","Export time"),new Date().toISOString(),'UTC'],[L("SRAM 容量","SRAM capacity"),s.capacity,s.unit],[L("SRAM 位元數","SRAM bits"),r.capacity,'bits'],[L("原始修復資料比例","Raw repair-data fraction"),s.repair,L("修復 bits / SRAM bits","Repair bits / SRAM bits")],[L("壓縮輸入值","Compression input"),s.compression,{ratio:L("倍率（原始 / 壓縮後）","Ratio (raw / compressed)"),retained:L("保留比例 %","Retained %"),reduction:L("減少比例 %","Reduction %")}[s.mode]],[L("等效壓縮倍率","Equivalent compression ratio"),r.ratio,':1'],[L("壓縮前修復資料","Raw repair data"),r.raw,'bits'],[L("壓縮後有效資料","Compressed payload"),r.payload,'bits'],[L("節省容量","Saved capacity"),r.saved,'bits'],[L("實際減少比例","Actual reduction"),Number(r.saved)/Number(r.raw)*100,L("%（含取整）","% (after rounding)")],[],[L("比較項目","Comparison"),'OTP','eFuse']];
  for(const [label,key] of [[L("額外開銷 %","Overhead %"),'overhead'],[L("預留空間 %","Reserve %"),'reserve'],[L("配置粒度 bits","Block size (bits)"),'block']])rows.push([label,s.otp[key],s.efuse[key]]);
  for(const [label,key] of [[L("有效資料 bits","Payload (bits)"),'payload'],[L("額外開銷 bits","Overhead (bits)"),'overhead'],[L("預留空間 bits","Reserve (bits)"),'reserve'],[L("對齊補足 bits","Alignment padding (bits)"),'padding'],[L("配置容量 bits","Allocated capacity (bits)"),'allocated']])rows.push([label,r.otp[key],r.efuse[key]]);
  rows.push([L("完整位元組 B","Whole bytes (B)"),ceil(r.otp.allocated,8n),ceil(r.efuse.allocated,8n)],[],[L("計算規則","Rounding rule"),L("各階段向上取整至 bits；B 向上取整至完整位元組。","Each stage rounds up to bits; bytes round up to whole bytes.")],[L("預留規則","Reserve rule"),L("預留以有效資料加開銷為基底；配置再向上對齊至粒度。","Reserve applies to payload plus overhead; allocation rounds up to a full block.")],[L("單位定義","Unit definitions"),L("Gb = 10^9 bits；Gib = 2^30 bits；1 B = 8 bits。","Gb = 10^9 bits; Gib = 2^30 bits; 1 B = 8 bits.")],[L("規劃假設","Planning assumptions"),L("所有參數為情境輸入，非 IP 規格；不推論面積、可靠度或修復率。","All inputs are scenario assumptions, not IP specifications; no area, reliability or repair-rate inference.")]);
  const cell=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
  const csv='\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='SRAM-repair-estimate.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(L("已匯出目前參數與容量比較結果。","Exported the current inputs and capacity comparison."));
});
function syncLanguage() {
 $('toast').hidden=true; clearTimeout(toastTimer);
 document.querySelectorAll('[data-copy-en]').forEach(el=>el.textContent=L(el.dataset.copyZh,el.dataset.copyEn));
 renderTechCards(); render();
}
window.addEventListener('hub:language-change',syncLanguage);
syncLanguage();

new ResizeObserver(()=>{if(current)renderChart(current,currentState);}).observe($('chart'));
