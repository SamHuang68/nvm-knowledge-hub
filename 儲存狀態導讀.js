// 以固定圖面逐步強調因果；播放一次後停止，不改變物理圖或技術數值。
document.querySelectorAll('.storage-explorer').forEach(root => {
 if(new URLSearchParams(location.search).get('motion')==='static')return;
 const modes=[...root.querySelectorAll('[data-storage-mode]')], panels=[...root.querySelectorAll('[data-storage-panel]')];
 const controls=root.querySelector('.storage-playback'), play=root.querySelector('[data-storage-play]'), status=root.querySelector('[data-storage-status]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const phases=[['儲存差異','Stored difference'],['寫入刺激','Write stimulus'],['感測差異','Sensed difference']];
 let mode=modes[0].dataset.storageMode, step=0, timer=null;
 const zh=()=>window.HubLanguage?.get()==='zh';
 function stop(){clearTimeout(timer);timer=null;render();}
 function render(){
  root.dataset.frame=String(step);
  modes.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.storageMode===mode)));
  panels.forEach(panel=>{panel.hidden=panel.dataset.storagePanel!==mode;panel.querySelectorAll('[data-storage-step]').forEach(item=>{item.dataset.current=String(Number(item.dataset.storageStep)===step);});});
  play.textContent=zh()?(timer?'暫停':'播放導讀'):(timer?'Pause':'Play the Guide');
  play.disabled=reduced.matches;
  play.setAttribute('aria-pressed',String(Boolean(timer)));
  root.querySelector('[data-storage-prev]').disabled=step===0;
  root.querySelector('[data-storage-next]').disabled=step===2;
  status.textContent=`${step+1} / 3 · ${phases[step][zh()?0:1]}`;
 }
 function advance(){if(step===2){stop();return;}step++;timer=setTimeout(advance,1200);render();}
 modes.forEach((button,i)=>{
  button.addEventListener('click',()=>{mode=button.dataset.storageMode;step=0;stop();});
  button.addEventListener('keydown',event=>{let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(i+1)%modes.length;else if(['ArrowLeft','ArrowUp'].includes(event.key))next=(i+modes.length-1)%modes.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=modes.length-1;else return;event.preventDefault();modes[next].focus();modes[next].click();});
 });
 play.addEventListener('click',()=>{if(timer){stop();return;}if(reduced.matches)return;if(step===2)step=0;timer=setTimeout(advance,1200);render();});
 root.querySelector('[data-storage-prev]').addEventListener('click',()=>{step=Math.max(0,step-1);stop();});
 root.querySelector('[data-storage-next]').addEventListener('click',()=>{step=Math.min(2,step+1);stop();});
 root.querySelector('[data-storage-reset]').addEventListener('click',()=>{step=0;stop();});
 window.addEventListener('hub:language-change',render);
 window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 reduced.addEventListener('change',stop);
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(root);
 render();controls.hidden=false;root.classList.add('storage-explorer-ready');
});
