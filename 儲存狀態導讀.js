// 固定圖面只改變閱讀焦點；網址保存合法的機制與階段，不保存播放狀態。
document.querySelectorAll('.storage-explorer').forEach(root => {
 const disclosure=root.closest('details');let printDisclosureOpen;
 window.addEventListener('beforeprint',()=>{if(disclosure){printDisclosureOpen=disclosure.open;disclosure.open=true;}});
 window.addEventListener('afterprint',()=>{if(disclosure&&printDisclosureOpen!==undefined){disclosure.open=printDisclosureOpen;printDisclosureOpen=undefined;}});
 if(new URLSearchParams(location.search).get('motion')==='static')return;
 const modes=[...root.querySelectorAll('[data-storage-mode]')], panels=[...root.querySelectorAll('[data-storage-panel]')];
 const controls=root.querySelector('.storage-playback'), play=root.querySelector('[data-storage-play]'), status=root.querySelector('[data-storage-status]');
 const share=root.querySelector('[data-storage-share]'), shareStatus=root.querySelector('[data-storage-share-status]'), shareUrl=root.querySelector('[data-storage-share-url]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const phases=[['儲存差異','Stored difference'],['寫入刺激','Write stimulus'],['感測差異','Sensed difference']];
 let mode=modes[0].dataset.storageMode, step=0, timer=null, shareRequest=0, sharing=false;
 const zh=()=>window.HubLanguage?.get()==='zh';
 function readState(){
  const params=new URLSearchParams(location.search), candidate=params.get('storage'), value=params.get('storage-step');
  mode=modes.some(button=>button.dataset.storageMode===candidate)?candidate:modes[0].dataset.storageMode;
  step=/^[0-2]$/.test(value||'')?Number(value):0;
 }
 function writeState(){
  const url=new URL(location.href);url.searchParams.set('storage',mode);url.searchParams.set('storage-step',String(step));
  // 保留其他控制器與閱讀位置的 history.state。
  history.replaceState(history.state,'',url);
  invalidateShare();
 }
 function invalidateShare(){
  shareRequest++;sharing=false;share.disabled=false;share.setAttribute('aria-busy','false');
  shareStatus.textContent='';shareUrl.hidden=true;shareUrl.value='';
 }
 function stop(){clearTimeout(timer);timer=null;render();}
 function render(){
  root.dataset.frame=String(step);
  modes.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.storageMode===mode)));
  root.querySelectorAll('[data-storage-focus]').forEach(node=>node.dataset.current=String(Number(node.dataset.storageFocus)===step));
  panels.forEach(panel=>{panel.hidden=panel.dataset.storagePanel!==mode;panel.querySelectorAll('[data-storage-step]').forEach(item=>{item.dataset.current=String(Number(item.dataset.storageStep)===step);});});
  play.textContent=zh()?(timer?'暫停':'播放導讀'):(timer?'Pause':'Play the Guide');
  play.disabled=reduced.matches;play.setAttribute('aria-pressed',String(Boolean(timer)));
  root.querySelector('[data-storage-prev]').disabled=step===0;
  root.querySelector('[data-storage-next]').disabled=step===2;
  status.textContent=`${step+1} / 3 · ${phases[step][zh()?0:1]}`;
  share.disabled=sharing;share.setAttribute('aria-busy',String(sharing));
 }
 function advance(){if(step===2){stop();return;}step++;writeState();timer=step===2?null:setTimeout(advance,1200);render();}
 function choose(nextMode,nextStep){mode=nextMode;step=nextStep;writeState();stop();}
 modes.forEach((button,i)=>{
  button.addEventListener('click',()=>choose(button.dataset.storageMode,0));
  button.addEventListener('keydown',event=>{let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(i+1)%modes.length;else if(['ArrowLeft','ArrowUp'].includes(event.key))next=(i+modes.length-1)%modes.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=modes.length-1;else return;event.preventDefault();modes[next].focus();modes[next].click();});
 });
 play.addEventListener('click',()=>{if(timer){stop();return;}if(reduced.matches)return;if(step===2){step=0;writeState();}timer=setTimeout(advance,1200);render();});
 root.querySelector('[data-storage-prev]').addEventListener('click',()=>choose(mode,Math.max(0,step-1)));
 root.querySelector('[data-storage-next]').addEventListener('click',()=>choose(mode,Math.min(2,step+1)));
 root.querySelector('[data-storage-reset]').addEventListener('click',()=>choose(mode,0));
 share.addEventListener('click',async()=>{
  if(sharing)return;
  stop();const url=new URL(location.href);url.searchParams.set('storage',mode);url.searchParams.set('storage-step',String(step));if(!url.hash)url.hash='storage-explorer';
  const request=++shareRequest;sharing=true;render();shareUrl.value=url.href;shareUrl.hidden=true;
  shareStatus.textContent=zh()?'正在複製導讀連結…':'Copying the guide link…';
  // 完成順序不代表目前操作；只讓仍有效的最新請求更新訊息、連結與焦點。
  try{await navigator.clipboard.writeText(url.href);if(request!==shareRequest)return;shareStatus.textContent=zh()?'導讀連結已複製':'Guide link copied';shareUrl.hidden=true;}
  catch{if(request!==shareRequest)return;shareStatus.textContent=zh()?'請從下方欄位手動複製連結':'Copy the link manually from the field below';shareUrl.hidden=false;shareUrl.focus();shareUrl.select();}
  finally{if(request===shareRequest){sharing=false;render();}}
 });
 window.addEventListener('popstate',()=>{invalidateShare();readState();stop();});
 window.addEventListener('hub:language-change',()=>{invalidateShare();render();});
 window.addEventListener('blur',stop);window.addEventListener('pagehide',()=>{invalidateShare();stop();});
 window.addEventListener('beforeprint',stop);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 reduced.addEventListener('change',stop);
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(root);
 readState();render();controls.hidden=false;root.classList.add('storage-explorer-ready');
});
