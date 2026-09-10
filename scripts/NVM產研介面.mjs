const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paragraphs=value=>(Array.isArray(value)?value:[value]).filter(Boolean).map(text=>`<p>${esc(text)}</p>`).join('');
const displayTitle=value=>esc(value).replace(/導電絲|STT-MRAM|SOT-MRAM|DDR STT/g,term=>`<span class="nvm-technical-term">${term}</span>`);

function editorialHeader(data,en,landscape=false) {
 const title=landscape?(en?'Global NVM Industry and Research Map':'全球 NVM 產業與研究地圖'):data.title;
 const intro=landscape?(en?'Trace named products, process platforms and research programs. Compare the implementation, its public maturity and the conditions behind each claim.':'從具名產品、製程平台到研究計畫，對齊實作、公開成熟度與主張背後的條件。'):data.intro;
 const count=landscape?data.landscape.length:data.profiles.length;
 return `<header class="nvm-editorial-header"><div><p class="nvm-kicker">${en?'NVM · INDUSTRY & RESEARCH':'NVM · 產業與研究'}</p><h2 tabindex="-1">${esc(title)}</h2><div class="nvm-lede">${paragraphs(intro)}</div></div><aside class="nvm-editorial-stat" aria-label="${en?'Editorial coverage':'編輯涵蓋範圍'}"><strong>${String(count).padStart(2,'0')}</strong><span>${landscape?(en?'Named Routes':'具名技術路線'):(en?'In-Depth Studies':'深度比較專題')}</span><small>${landscape?(en?`${new Set(data.landscape.map(r=>r.family)).size} technology families`:`${new Set(data.landscape.map(r=>r.family)).size} 個技術家族`):(en?'Physics · Integration · Evidence':'物理 · 整合 · 證據')}</small></aside></header>`;
}

export function validateResearch(data) {
  if(data.profiles?.length<5||new Set(data.profiles.map(p=>p.id)).size!==data.profiles.length)throw new Error('產研專題機構不足或重複');
  for(const p of data.profiles){
    for(const key of ['id','name','role','title','summary','stage','boundary','integration','program','reverse','read','opportunity','qualification'])if(!p[key])throw new Error(`${p.id} 缺少 ${key}`);
    if(!p.sourceIds?.length||!p.sections?.length||!p.metrics?.length)throw new Error(`${p.id} 缺少證據或比較條件`);
    for(const m of p.metrics)if(!m.value||!m.condition||!m.limit||!m.sourceIds?.length)throw new Error(`${p.id} 指標缺少條件`);
  }
}

function mechanism(p,en){
  const text=(x,y,s,extra='')=>`<text x="${x}" y="${y}" style="fill:#17354b" ${extra}>${esc(s)}</text>`;
  const line=(x1,y1,x2,y2,color='#087f86')=>`<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="3"/>`;
  const arrow=(x,y,down,color='#087f86')=>`<path d="M${x} ${y}v${down?46:-46}m-7 ${down?-8:8} 7 ${down?8:-8} 7 ${down?-8:8}" fill="none" stroke="${color}" stroke-width="3"/>`;
  const plate=(x,y,w,h,fill,label)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#809caa"/>${text(x+w/2,y+h/2+5,label,'text-anchor="middle"')}`;
  let content;
  if(p.id==='everspin'){
    const label=(x,zh,a,b)=>en?text(x,211,a,'text-anchor="middle"')+text(x,236,b,'text-anchor="middle"'):text(x,217,zh,'text-anchor="middle"');
    content=plate(30,30,460,46,'#e1edf1',en?'Three Distinct Product Contracts':'三種不同的產品條件')+plate(30,113,140,65,'#eae1d5','Toggle')+plate(190,113,140,65,'#cee5e3','STT / DDR')+plate(350,113,140,65,'#cee5e3','STT / xSPI')+line(100,76,100,113)+line(260,76,260,113)+line(420,76,420,113)+label(100,'磁場寫入','Field','Write')+label(260,'儲存緩衝','Storage','Buffer')+label(420,'序列介面','Serial','Interface');
  }else if(p.id==='umc'){
    content=plate(40,45,440,50,'#e1edf1',en?'22nm Logic Platform':'22nm 邏輯平台')+plate(40,135,200,65,'#cee5e3','RRAM')+plate(280,135,200,65,'#eae1d5',en?'Standalone STT-MRAM':'獨立式 STT-MRAM')+line(140,95,140,135)+line(380,95,380,135)+text(140,233,en?'eMemory IP qualification':'eMemory IP 資格驗證','text-anchor="middle"')+text(380,233,en?'Avalanche product route':'Avalanche 產品路徑','text-anchor="middle"');
  }else if(p.id==='panasonic'){
    content=plate(155,35,210,36,'#d9e8ef',en?'Top Electrode':'上電極')+plate(155,71,210,58,'#eae1d5',en?'Oxygen-Rich TaOx':'富氧 TaOx')+plate(155,129,210,67,'#cee5e3',en?'Oxygen-Poor TaOx':'缺氧 TaOx')+plate(155,196,210,36,'#d9e8ef',en?'Bottom Electrode':'下電極')+text(75,110,'SET','text-anchor="middle"')+text(75,140,'HRS → LRS','text-anchor="middle" font-size="13"')+text(445,110,'RESET','text-anchor="middle"')+text(445,140,'LRS → HRS','text-anchor="middle" font-size="13"');
  }else{
    content=plate(155,35,210,45,'#d9e8ef',en?'Reference Layer':'參考磁層')+plate(155,80,210,28,'#eae1d5','MgO')+plate(155,108,210,45,'#cee5e3',en?'Free Layer':'自由磁層');
    if(p.id==='ibm')content+=arrow(110,62,true)+arrow(411,109,false,'#936236')+text(260,196,en?'Write and Read Through MTJ':'寫入與讀取穿過 MTJ','text-anchor="middle"')+text(260,228,en?'P ↔ AP: Magnetic Overwrite':'P ↔ AP：磁態覆寫','text-anchor="middle"');
    else content+=plate(65,153,390,37,'#d2e4ec',en?'Spin-Orbit Write Channel':'自旋軌道寫入通道')+`<path d="M78 212h360m-9-7 9 7-9 7" fill="none" stroke="#087f86" stroke-width="3"/>`+text(260,244,en?'In-Plane Write / MTJ Read':'平面內寫入／MTJ 讀取','text-anchor="middle"');
  }
  return `<figure class="nvm-research-figure nvm-cell"><div class="bc-figure-head"><span>${esc(p.figureTitle)}</span><button type="button" data-zoom-diagram>${en?'Enlarge':'放大'}</button></div><svg viewBox="0 0 520 275" style="font:17px Inter,Arial,sans-serif" role="img" aria-labelledby="research-figure-${p.id}"><title id="research-figure-${p.id}">${esc(p.figureTitle)}</title>${content}</svg><figcaption><p class="bc-legend">${esc(p.figureCaption)}</p><p class="bc-mechanism">${en?'Read the adjacent operation descriptions together with this diagram.':'請搭配旁邊的寫入、反向更新與讀取說明閱讀。'}</p></figcaption></figure>`;
}

export function renderResearch(data,language,cite){
  const en=language==='en';
  const labels=en?['Organization / Role','Technology and Integration','Public Maturity','Evidence Boundary']:['機構／角色','技術與整合','公開成熟度','證據邊界'];
  return `<article id="research" class="nvm-panel nvm-research" data-nvm-panel>${editorialHeader(data,en)}
  <nav class="nvm-research-nav" aria-label="${en?'Research studies':'產研專題'}">${data.profiles.map((p,i)=>`<a href="#research-${p.id}"><span>0${i+1}</span>${esc(p.name)}</a>`).join('')}<a href="#foundry">${en?'TSMC / GF / UMC Roadmap':'TSMC／GF／UMC 年表'}</a></nav>
  <section class="nvm-research-synthesis"><h3>${esc(data.thesisTitle)}</h3>${paragraphs(data.thesis)}</section>
  <section><h3>${en?'Compare the Delivery Level First':'先比較供應與驗證層級'}</h3><table class="nvm-table nvm-tech-table nvm-research-table"><thead><tr>${labels.map(l=>`<th scope="col">${l}</th>`).join('')}</tr></thead><tbody>${data.profiles.map(p=>`<tr>${[ `<a href="#research-${p.id}"><strong>${esc(p.name)}</strong></a>${paragraphs(p.role)}`,paragraphs(p.integration),`<span class="nvm-research-stage">${esc(p.stage)}</span>`,paragraphs(p.boundary)].map((v,i)=>`<td data-label="${labels[i]}">${v}</td>`).join('')}</tr>`).join('')}</tbody></table></section>
  ${data.profiles.map((p,i)=>`<section id="research-${p.id}" class="nvm-research-study" tabindex="-1"><header class="nvm-study-heading"><span class="nvm-study-number" aria-hidden="true">0${i+1}</span><div><p class="nvm-kicker">${esc(p.name)} · ${esc(p.role)}</p><h3>${displayTitle(p.title)}</h3><p class="nvm-research-deck">${esc(p.summary)}</p></div></header><div class="nvm-research-mechanism">${mechanism(p,en)}<dl><dt>${en?'Program / Forward Update':'寫入／正向更新'}</dt><dd>${esc(p.program)}</dd><dt>${en?'Erase / Reverse Update':'抹除／反向更新'}</dt><dd>${esc(p.reverse)}</dd><dt>${en?'Read and Verify':'讀取與驗證'}</dt><dd>${esc(p.read)}</dd></dl></div>${cite(p.sourceIds)}
  <div class="nvm-research-body"><div>${p.sections.map(s=>`<section><h4>${esc(s.title)}</h4>${paragraphs(s.body)}${cite(s.sourceIds)}</section>`).join('')}</div><aside class="nvm-research-measurements" aria-label="${en?'Measured results and conditions':'數據與適用條件'}"><h4>${en?'Results in Context':'有條件的實測結果'}</h4>${p.metrics.map(m=>`<div class="nvm-research-metric"><strong>${esc(m.value)}</strong><p>${esc(m.condition)}</p><p class="nvm-maturity-limit">${esc(m.limit)}</p>${cite(m.sourceIds)}</div>`).join('')}</aside></div>
  <section class="nvm-research-implication"><h4>${en?'Application and Adoption Implications':'應用與導入意涵'}</h4>${paragraphs(p.opportunity)}<p><strong>${en?'Before adoption: ':'導入前確認：'}</strong>${esc(p.qualification)}</p></section></section>`).join('')}
  <section class="nvm-research-conclusion"><h3>${esc(data.comparisonTitle)}</h3>${data.comparison.map(p=>`<section><h4>${esc(p.title)}</h4>${paragraphs(p.body)}${cite(p.sourceIds)}</section>`).join('')}</section><p class="nvm-maturity-limit">${esc(data.researchScope)}</p><div class="nvm-actions"><a href="#foundry">${en?'Inspect the Foundry Timeline':'核對晶圓代工年表'}</a><a href="#topic-vcm">${en?'ReRAM Device Operations':'ReRAM 元件操作'}</a><a href="#topic-sot">${en?'SOT-MRAM Device Operations':'SOT-MRAM 元件操作'}</a></div></article>`;
}

export function researchMarkdown(data,sourceMarkdown){
 return `\n\n## ${data.title}\n\n${data.intro}\n\n### ${data.thesisTitle}\n\n${data.thesis}\n\n${data.profiles.map(p=>`### ${p.name} · ${p.title}\n\n${p.role}\n\n${p.summary}\n\n${p.stage}：${p.boundary}\n\n${p.integration}\n\n${p.program}\n\n${p.reverse}\n\n${p.read}\n\n${sourceMarkdown(p.sourceIds)}\n\n${p.sections.map(s=>`#### ${s.title}\n\n${s.body}\n\n${sourceMarkdown(s.sourceIds)}`).join('\n\n')}\n\n${p.metrics.map(m=>`- **${m.value}**：${m.condition} ${m.limit}\n\n${sourceMarkdown(m.sourceIds)}`).join('\n\n')}\n\n${p.opportunity}\n\n${p.qualification}`).join('\n\n')}\n\n### ${data.comparisonTitle}\n\n${data.comparison.map(s=>`#### ${s.title}\n\n${s.body}\n\n${sourceMarkdown(s.sourceIds)}`).join('\n\n')}\n\n${data.researchScope}\n`;
}

export function renderLandscape(data,language,cite){
 const en=language==='en',rows=data.landscape;
 const families=[...new Set(rows.map(r=>r.family))];
 return `<article id="ecosystem" class="nvm-panel nvm-landscape" data-nvm-panel>${editorialHeader(data,en,true)}
 <p class="nvm-landscape-coverage">${en?`${rows.length} named routes across ${families.length} families · Reviewed through ${data.asOf}`:`${rows.length} 條具名路線 · ${families.length} 個技術家族 · 查核截至 ${data.asOf}`}</p>
 <div class="nvm-family-shortcuts" role="group" aria-label="${en?'Quick family filter':'快速篩選技術家族'}"><button type="button" data-landscape-family-shortcut="" aria-pressed="true">${en?'All':'全部'}<span>${rows.length}</span></button>${families.map(f=>`<button type="button" data-landscape-family-shortcut="${esc(f)}" aria-pressed="false">${esc(f)}<span>${rows.filter(r=>r.family===f).length}</span></button>`).join('')}</div>
 <div class="nvm-filters nvm-landscape-filters"><label>${en?'Company or Technology':'公司或技術'}<input id="nvm-landscape-search" type="search" placeholder="${en?'Everspin, SONOS, SOT, PCM…':'Everspin、工研院、SONOS、PCM…'}"></label><label>${en?'Technology Family':'技術家族'}<select id="nvm-landscape-family"><option value="">${en?'All Families':'全部家族'}</option>${families.map(f=>`<option value="${esc(f)}">${esc(f)}</option>`).join('')}</select></label><button id="nvm-landscape-reset" type="button">${en?'Clear Filters':'清除篩選'}</button></div><p id="nvm-landscape-count" role="status" aria-live="polite"></p>
 <div class="nvm-landscape-list">${rows.map(r=>`<section id="company-${esc(r.id)}" class="nvm-landscape-row" data-landscape-row data-family="${esc(r.family)}" data-search="${esc([r.name,r.technology,r.role,r.claim,r.search].join(' '))}" tabindex="-1"><header><p class="nvm-kicker">${esc(r.family)} · ${esc(r.role)}</p><h3>${esc(r.name)}</h3><p class="nvm-landscape-tech">${esc(r.technology)}</p><span class="nvm-research-stage">${esc(r.maturity)}</span></header><div>${paragraphs(r.claim)}<p class="nvm-maturity-limit"><span class="nvm-boundary-label">${en?'Scope':'適用邊界'}</span>${esc(r.limit)}</p><p class="nvm-landscape-date">${esc(r.dateLabel)}</p>${cite(r.sourceIds)}<a class="nvm-landscape-more" href="#${esc(r.target)}">${en?'Read the Related Study':'閱讀相關技術專題'}</a></div></section>`).join('')}</div><p id="nvm-landscape-empty" class="nvm-empty" hidden>${en?'No matching entries. Clear the filters or try another technology name.':'沒有符合的條目。請清除篩選或改用其他技術名稱。'}</p><aside class="nvm-note"><p>${en?'Coverage is a curated primary-source map, not a claim to list every company or paper. Historical and discontinued routes remain labeled. An undated product page shows what was publicly listed when checked; it does not establish an announcement date or shipment volume.':'涵蓋範圍是依一手來源整理的代表性地圖，不宣稱列盡全球每一家機構或論文。歷史與退出路線保留標示；無日期產品頁只代表查核時的公開內容，不能推定發布日期或出貨規模。'}</p></aside><div class="nvm-actions"><a href="#research">${en?'Read the In-Depth Studies':'閱讀產研深度專題'}</a><a href="#foundry">${en?'Open the Foundry Timeline':'查看晶圓代工年表'}</a></div></article>`;
}

export function landscapeMarkdown(data,sourceMarkdown,en){return `\n\n## ${en?'Global NVM Industry and Research Map':'全球 NVM 產業與研究地圖'}\n\n${data.landscape.map(r=>`### ${r.name} · ${r.technology}\n\n${r.role} · ${r.maturity}\n\n${r.claim}\n\n${r.limit}\n\n${r.dateLabel}\n\n${sourceMarkdown(r.sourceIds)}`).join('\n\n')}`;}
