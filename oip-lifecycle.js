/* 架構閱讀模型；沒有金鑰產生、加密或實體寫入。 */
(() => {
 const root=document.querySelector('.lifecycle-reader');
 if(!root)return;
 const $=id=>document.getElementById(id),zh=()=>window.HubLanguage?.get()==='zh',words=(a,b)=>zh()?a:b;
 const phases={
  off:{title:['斷電：區分持久資料與暫存機密','Power-off: persistent data and volatile secrets'],runtime:['在已驗證的完整斷電條件下，不維持刻意保存的重建根金鑰。製程差異仍存在。','Under validated full power-off conditions, no intentionally retained reconstructed root is maintained. Process variation remains.'],evidence:['電源域、殘留狀態、重設路徑與斷電完成條件。','Power domains, remanence, reset paths and power-off completion.']},
  reconstruct:{title:['上電重建：從 PUF 回應建立可用根金鑰','Reconstruct: establish the usable root from the PUF response'],runtime:['重建路徑可能暫時處理 PUF 回應、根金鑰與衍生金鑰。Helper 資料需先符合完整性與版本政策。','The reconstruction path may temporarily handle PUF responses, the root and derived keys. Helper data must satisfy integrity and version policy.'],evidence:['PVT 與老化下的穩定度、helper 資料洩漏與完整性、重建失敗及重設中斷處理。','Stability across PVT and aging; helper-data leakage and integrity; reconstruction failure and reset interruption.']},
  access:{title:['授權存取：控制解密與明文出口','Authorized access: control decryption and plaintext release'],runtime:['授權交易期間，金鑰及明文可能存在於引擎或緩衝區；需限制權限、可見路徑與存活時間。','During authorized transactions, keys and plaintext may exist in engines or buffers. Bound privileges, observable paths and lifetime.'],evidence:['APB 權限、DFT／除錯、錯誤反應、故障注入與側通道測試，以及加密模式與完整性政策。','APB privileges, DFT/debug, error response, fault and side-channel testing, plus encryption mode and integrity policy.']},
  zeroize:{title:['零化暫存：清除可用金鑰，不擦除 OTP','Zeroize volatile state: clear usable keys, not OTP'],runtime:['目標是清除根金鑰、衍生金鑰與敏感緩衝區。必須驗證所有相關電源域與中斷路徑，不能只依賴軟體完成旗標。','The goal is to clear root and derived keys and sensitive buffers. Verify every relevant power domain and interruption path rather than relying solely on a software completion flag.'],evidence:['零化涵蓋範圍、完成時序、斷電或重設中斷、殘留資料與失敗反應。','Zeroization scope, completion timing, power/reset interruption, residual data and failure response.']}
 };
 const sequence=Object.keys(phases);
 const readPhase=()=>{const value=new URLSearchParams(location.search).get('lifecycle-phase');return sequence.includes(value)?value:'off';};
 let current=readPhase();const buttons=[...root.querySelectorAll('.lifecycle-controls button')];
 const diagram=root.querySelector('.lifecycle-diagram'), playback=root.querySelector('.life-playback'), play=root.querySelector('[data-life-play]'), status=root.querySelector('[data-life-status]');
 if(diagram)diagram.dataset.phase=current;
 if(new URLSearchParams(location.search).get('motion')==='static'){document.documentElement.classList.add('life-static');return;}
 const share=root.querySelector('.life-share'), copy=root.querySelector('[data-life-copy]'), shareLink=root.querySelector('[data-life-share-link]'), shareStatus=root.querySelector('[data-life-share-status]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let timer=null,shareState='ready',copying=false;
 function phaseURL(){const url=new URL(location.href);url.searchParams.set('lifecycle-phase',current);return url.href;}
 function updateURL(method){const url=phaseURL();if(url!==location.href)history[method==='push'?'pushState':'replaceState'](history.state,'',url);}
 function stop(){clearTimeout(timer);timer=null;render();}
 function choose(phase,method='push'){clearTimeout(timer);timer=null;current=phase;shareState='ready';if(method!=='none')updateURL(method);render();}
 function advance(){let i=sequence.indexOf(current);if(i===sequence.length-1){stop();return;}current=sequence[i+1];shareState='ready';updateURL('replace');timer=setTimeout(advance,1800);render();}
 function render(){const p=phases[current];$('phaseTitle').textContent=words(...p.title);$('phasePersistent').textContent=words('已編程 OTP 密文、helper 資料及生命週期中繼資料，依目標配置保持持久存在。','Programmed OTP ciphertext, helper data and lifecycle metadata persist according to the target configuration.');$('phaseRuntime').textContent=words(...p.runtime);$('phaseEvidence').textContent=words(...p.evidence);$('lifecycleOutput').dataset.phase=current;
 if(diagram)diagram.dataset.phase=current;
 if(play){play.textContent=words(timer?'暫停':'播放一次',timer?'Pause':'Play Once');play.disabled=reduced.matches;play.setAttribute('aria-pressed',String(Boolean(timer)));const i=sequence.indexOf(current);root.querySelector('[data-life-prev]').disabled=i===0;root.querySelector('[data-life-next]').disabled=i===sequence.length-1;status.textContent=`${i+1} / 4 · ${words(...p.title)}`;}
 buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.phase===current)));
 if(shareLink){shareLink.value=phaseURL();copy.disabled=copying;shareStatus.textContent=shareState==='copied'?words('已複製目前階段連結；開啟連結會停在這一階段。','Phase link copied; opening it restores this phase and stays paused.'):shareState==='manual'?words('無法自動複製。已選取連結欄位，請手動複製。','Automatic copy was unavailable. The link field is selected for manual copying.'):words('開啟連結會還原此階段，保持暫停。','Opening the link restores this phase and stays paused.');}}
 buttons.forEach((button,i)=>{button.addEventListener('click',()=>choose(button.dataset.phase));button.addEventListener('keydown',event=>{let index;if(event.key==='ArrowRight'||event.key==='ArrowDown')index=(i+1)%buttons.length;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')index=(i+buttons.length-1)%buttons.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=buttons.length-1;else return;event.preventDefault();buttons[index].focus();buttons[index].click();});});

 if(play){
 play.addEventListener('click',()=>{if(timer){stop();return;}if(reduced.matches)return;if(current==='zeroize'){current='off';shareState='ready';updateURL('replace');}timer=setTimeout(advance,1800);render();});
 root.querySelector('[data-life-prev]').addEventListener('click',()=>choose(sequence[Math.max(0,sequence.indexOf(current)-1)]));
 root.querySelector('[data-life-next]').addEventListener('click',()=>choose(sequence[Math.min(sequence.length-1,sequence.indexOf(current)+1)]));
 root.querySelector('[data-life-reset]').addEventListener('click',()=>choose('off'));
 window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});reduced.addEventListener('change',stop);
 new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop();}).observe(root);
 }
 if(copy)copy.addEventListener('click',async()=>{const requestedURL=phaseURL();copying=true;render();try{if(!navigator.clipboard?.writeText)throw new Error('無可用剪貼簿介面');await navigator.clipboard.writeText(requestedURL);if(requestedURL===phaseURL())shareState='copied';}catch{if(requestedURL===phaseURL())shareState='manual';}finally{copying=false;render();if(shareState==='manual'){shareLink.focus();shareLink.select();}}});
 window.addEventListener('popstate',()=>choose(readPhase(),'none'));
 window.addEventListener('hashchange',()=>{shareState='ready';render();});
 window.addEventListener('hub:language-change',()=>{shareState='ready';render();});root.classList.add('life-ready');render();if(playback)playback.hidden=false;if(share)share.hidden=false;
})();
