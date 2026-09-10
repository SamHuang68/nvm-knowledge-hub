import { operationPlate as chargePlate } from './NVM電荷操作圖.mjs';
import { operationPlate as emergingPlate } from './NVM新興操作圖.mjs';
import { patentStudy } from './NVM專利圖解.mjs';
const chargeIds=new Set(['efuse','antifuse','eeprom','mtp','nor','sonos','nand']);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=(language,zh,en)=>language==='en'?en:zh;
export function collectEngineeringStudies(topics,language){
 const operations=topics.flatMap(topic=>topic.operations.map(operation=>{
  const plate=(chargeIds.has(topic.id)?chargePlate:emergingPlate)(topic.id,operation.id,language);
  if(!plate)throw new Error(`缺少操作圖：${topic.id}/${operation.id}`);
  const variants=plate.variants?.length?plate.variants:[{...plate,id:'base',title:plate.variant}];
  for(const variant of variants){
   if(variant.frames.length<3)throw new Error(`操作狀態不足：${topic.id}/${operation.id}`);
   if(variant.frames.some(frame=>!frame.svg?.includes('<svg')||!frame.title||!frame.caption))throw new Error(`操作附圖缺少必要欄位：${topic.id}/${operation.id}`);
  }
  // 頂層 frames 為相容別名；共用資料只保留每個實際變體一次。
  return{topicId:topic.id,operationId:operation.id,title:plate.title,summary:plate.summary,sources:plate.sources,variants:variants.map(({variants:unused,...variant})=>variant)};
 }));
 const patents=topics.flatMap(topic=>topic.patents.map(patent=>({topicId:topic.id,...patentStudy(patent.id,language)})));
 return{schemaVersion:'1.0',language,operations,patents};
}
export function renderOperationStudy(study,language){
 const t=(zh,en)=>text(language,zh,en);
 return `<div class="nvm-engineering-operation" data-engineering-operation="${esc(study.topicId+'-'+study.operationId)}"><p class="nvm-op-reading-key">${t('依圖序追蹤狀態、刺激與結果；每一組圖保持同一個指定結構與操作慣例。','Follow state, stimulus and result across the frames. Each sequence uses one specified structure and operating convention.')}</p>${study.variants.map(variant=>`<section class="nvm-op-variant" data-operation-variant="${esc(variant.id)}"><header><p class="nvm-op-method">${esc(variant.mechanism||t('指定結構與操作慣例','Specified Structure and Operating Convention'))}</p><h5>${esc(variant.title)}</h5><p>${esc(variant.summary||'')}</p></header><div class="nvm-op-frames" data-frame-count="${variant.frames.length}">${variant.frames.map((frame,index)=>`<figure class="nvm-op-frame" data-engineering-figure data-figure-name="${esc(study.topicId+'-'+study.operationId+'-'+variant.id+'-'+(index+1))}"><figcaption class="nvm-op-frame-heading"><span>${String(index+1).padStart(2,'0')}</span><h6>${esc(frame.title)}</h6></figcaption><div class="nvm-op-drawing">${frame.svg}</div><div class="nvm-op-caption" data-figure-notes>${frame.state||frame.stimulus?`<dl>${frame.state?`<dt>${t('狀態','State')}</dt><dd>${esc(frame.state)}</dd>`:''}${frame.stimulus?`<dt>${t('刺激','Stimulus')}</dt><dd>${esc(frame.stimulus)}</dd>`:''}</dl>`:''}<p>${esc(frame.caption)}</p></div><div class="nvm-figure-actions"><button type="button" data-engineering-zoom>${t('放大此狀態','Enlarge State')}</button><button type="button" data-engineering-download>${t('下載 SVG','Download SVG')}</button></div></figure>`).join('')}</div><dl class="nvm-op-legend">${(variant.legend||[]).map(item=>`<div><dt>${esc(item.symbol)}</dt><dd>${esc(item.meaning)}</dd></div>`).join('')}</dl><p class="nvm-op-caveat">${esc(variant.caveat||'')}</p><div class="nvm-op-sources"><strong>${t('這組圖的原始依據','Sources for This Sequence')}</strong>${(variant.sources||study.sources||[]).map(source=>`<a href="#source-${esc(source.id)}">${esc(source.label)}</a>`).join('')}</div></section>`).join('')}</div>`;
}
function originalFigure(study,figure,language,context){
 const t=(zh,en)=>text(language,zh,en),rotate=figure.rotation===90;
 const width=rotate?figure.height:figure.width,height=rotate?figure.width:figure.height;
 const labelId=`original-${context}-${study.id}-${figure.index}`;
 return `<figure class="nvm-patent-figure" data-engineering-figure data-patent-figure="${esc(study.id)}" data-figure-name="${esc(study.id+'-'+figure.index)}"><div class="nvm-patent-image"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${esc(labelId)}"><title id="${esc(labelId)}">${esc(study.id+' · '+figure.label+' · '+study.focus)}</title><image href="${esc(figure.asset)}" width="${figure.width}" height="${figure.height}" ${rotate?`transform="translate(${figure.height} 0) rotate(90)"`:''}/></svg></div><figcaption data-figure-notes><strong>${esc(figure.label)}</strong><span>${t('原始專利附圖','Original Patent Drawing')} · ${t('PDF 第','PDF Page ')} ${figure.page}${t(' 頁','')}</span></figcaption><div class="nvm-figure-actions"><button type="button" data-engineering-zoom>${t('放大原圖與編號','Enlarge Drawing and Numerals')}</button><a href="${esc(figure.originalUrl)}" target="_blank" rel="noopener noreferrer">${t('原始圖頁','Source Drawing')}</a><a href="${esc(figure.pdfUrl+'#page='+figure.page)}" target="_blank" rel="noopener noreferrer">${t('定位原始公報','Open PDF at Page')}</a></div></figure>`;
}
export function renderPatentGuide(study,language){
 const t=(zh,en)=>text(language,zh,en);
 return `<div class="nvm-patent-guide"><header><p class="nvm-op-method">${t('原圖、元件與權利項對照','Drawing, Elements and Claim Reading')}</p><h4>${esc(study.focus)}</h4><p>${esc(study.trace)}</p></header><div class="nvm-patent-originals">${study.figures.map(figure=>originalFigure(study,figure,language,'guide')).join('')}</div><div class="nvm-patent-reading"><section><h5>${t('圖中編號','Drawing Numerals')}</h5><dl class="nvm-patent-callouts">${study.callouts.map(item=>`<div><dt>${esc(item.number)}</dt><dd>${esc(item.meaning)}</dd></div>`).join('')}</dl></section><section><h5>${t('從圖讀到權利項','From Drawing to Claims')}</h5><p>${esc(study.claim)}</p><a href="${esc(study.sourceUrl+'#'+study.claimsAnchor)}" target="_blank" rel="noopener noreferrer">${t('開啟權利項原文','Open the Original Claims')}</a><h5>${t('連回操作圖','Connect to the Operation Sequence')}</h5><p>${esc(study.bridge)}</p><a href="#topic-${esc(study.topicId)}">${t('回到此技術的操作序列','Return to This Technology’s Operation Sequences')}</a></section></div></div>`;
}
export function renderPatentTeaser(study,language){
 const t=(zh,en)=>text(language,zh,en);
 return `<article class="nvm-patent-teaser">${originalFigure(study,study.figures[0],language,'topic')}<div><p class="nvm-op-method">${esc(study.id)}</p><h4>${esc(study.focus)}</h4><p>${esc(study.trace)}</p><p>${esc(study.bridge)}</p><a class="nvm-patent-guide-link" href="#patent-${esc(study.id)}">${t('對照全部附圖、元件編號與權利項','Compare All Drawings, Numerals and Claims')} →</a></div></article>`;
}
