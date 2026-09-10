const english=document.documentElement.lang==='en';
const say=(zh,en)=>english?en:zh;
const dialog=document.createElement('dialog');
dialog.className='nvm-engineering-dialog';
dialog.setAttribute('aria-labelledby','nvm-engineering-zoom-title');
dialog.innerHTML=`<header class="nvm-engineering-dialog-head"><h2 id="nvm-engineering-zoom-title"></h2><button type="button" aria-label="${say('關閉放大圖','Close Enlarged Figure')}">×</button></header><div class="nvm-engineering-dialog-body"><div class="nvm-engineering-zoom-toolbar"><label>${say('檢視倍率','Inspection Scale')} <select aria-label="${say('調整圖像倍率','Adjust Figure Scale')}"><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option><option value="3">3×</option></select></label></div><p class="nvm-engineering-zoom-hint">${say('可左右與上下捲動檢查完整元件、接點與編號；下方保留本圖說明。','Scroll horizontally and vertically to inspect the complete device, terminals and numerals. The figure explanation remains below.')}</p><div class="nvm-engineering-zoom-scroll" tabindex="0" aria-label="${say('可捲動的放大圖','Scrollable Enlarged Figure')}"></div><div class="nvm-engineering-zoom-notes"></div></div>`;
document.body.append(dialog);
dialog.querySelector('button').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
const cloneDiagram=original=>{
 const svg=original.cloneNode(true),ids=new Map([svg,...svg.querySelectorAll('[id]')].filter(node=>node.id).map(node=>[node.id,`${node.id}--engineering-zoom`]));
 for(const node of [svg,...svg.querySelectorAll('*')]){
  if(ids.has(node.id))node.id=ids.get(node.id);
  for(const attribute of [...node.attributes]){
   let value=attribute.value;
   for(const [oldId,newId] of ids)value=value.replaceAll(`url(#${oldId})`,`url(#${newId})`);
   if(['aria-labelledby','aria-describedby'].includes(attribute.name))value=value.split(' ').map(id=>ids.get(id)||id).join(' ');
   if(value!==attribute.value)node.setAttribute(attribute.name,value);
  }
  if(node.tagName.toLowerCase()==='style')node.textContent=node.textContent.replace(/#([A-Za-z0-9_:.-]+)/g,(match,id)=>ids.has(id)?'#'+ids.get(id):match);
 }
 return svg;
};
const scaleSelect=dialog.querySelector('select');
const updateScale=()=>{
 const scroller=dialog.querySelector('.nvm-engineering-zoom-scroll'),svg=scroller.querySelector('svg');if(!svg)return;
 const body=dialog.querySelector('.nvm-engineering-dialog-body'),before=svg.getBoundingClientRect(),bodyRect=body.getBoundingClientRect();
 const centerX=before.width?(scroller.scrollLeft+scroller.clientWidth/2)/before.width:.5;
 const centerY=before.height?Math.max(0,Math.min(1,(bodyRect.top+bodyRect.height/2-before.top)/before.height)):.5;
 const size=scroller.dataset.original==='true'?1200:900;svg.style.width=`${size*Number(scaleSelect.value)}px`;
 if(dialog.open&&before.width){
  const after=svg.getBoundingClientRect();scroller.scrollLeft=centerX*after.width-scroller.clientWidth/2;
  body.scrollTop+=after.top+centerY*after.height-(bodyRect.top+bodyRect.height/2);
 }
};
scaleSelect.addEventListener('change',updateScale);
document.addEventListener('click',event=>{
 const button=event.target.closest('[data-engineering-zoom], [data-engineering-download]');if(!button)return;
 const figure=button.closest('[data-engineering-figure]'),original=figure?.querySelector('svg');if(!original)return;
 if(button.hasAttribute('data-engineering-download')){
  const clone=original.cloneNode(true);clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
  const blob=new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'});
  const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=`${say('操作圖','Operation')}-${figure.dataset.figureName}.svg`;anchor.hidden=true;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return;
 }
 dialog.querySelector('h2').textContent=original.querySelector('title')?.textContent||figure.dataset.figureName;
 const scroller=dialog.querySelector('.nvm-engineering-zoom-scroll');scroller.dataset.original=String(figure.hasAttribute('data-patent-figure'));scroller.replaceChildren(cloneDiagram(original));
 const notes=figure.querySelector('[data-figure-notes]');
 const legend=figure.hasAttribute('data-patent-figure')?document.getElementById('patent-'+figure.dataset.patentFigure)?.querySelector('.nvm-patent-callouts'):figure.closest('.nvm-op-variant')?.querySelector('.nvm-op-legend');
 dialog.querySelector('.nvm-engineering-zoom-notes').replaceChildren(...[notes,legend].filter(Boolean).map(node=>node.cloneNode(true)));
 scaleSelect.value='1';updateScale();
 dialog.showModal();dialog.querySelector('.nvm-engineering-dialog-body').scrollTop=0;scroller.scrollLeft=0;scroller.scrollTop=0;
});
