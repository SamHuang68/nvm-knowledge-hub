// 首頁圖解與索引共用同一組路由；全部為概念示意，沒有產品數值。
export const storageStates = [
  {id:'charge', zh:'電荷', en:'Charge', target:'ip-neobit', writeTarget:'ip-op-neobit-write', readTarget:'ip-op-neobit-read', examples:'FG OTP · EEPROM · Flash',
   descZh:'電荷分佈改變閾值；讀取比較導通差異。', descEn:'Stored charge shifts the threshold; sensing compares conduction.',
   writeZh:'注入或移除電荷；機制及可逆性依實作。',writeEn:'Inject or remove charge; mechanism and reversibility depend on the implementation.',
   readZh:'閾值電壓／電流',readEn:'Threshold / current',
   limitZh:'浮動閘 OTP、EEPROM 與 Flash 的操作窗口不同。',limitEn:'Floating-gate OTP, EEPROM and Flash have different operating windows.'},
  {id:'magnetic',zh:'磁態',en:'Magnetization',target:'topic-stt',writeTarget:'op-stt-write',readTarget:'op-stt-read',examples:'Toggle · STT · SOT',
   descZh:'磁層相對方向改變電阻；讀取區分平行與反平行。',descEn:'Relative magnetic orientation changes resistance; sensing distinguishes P and AP.',
   writeZh:'磁場或自旋力矩改變自由層方向。',writeEn:'A magnetic field or spin torque changes the free-layer orientation.',
   readZh:'MTJ 電阻',readEn:'MTJ resistance',
   limitZh:'此圖以 MTJ 說明；Toggle、STT 與 SOT 的寫入路徑不同。',limitEn:'An MTJ teaching model; Toggle, STT and SOT use different write paths.'},
  {id:'resistance',zh:'電阻',en:'Resistance',target:'topic-antifuse',writeTarget:'op-antifuse-write',readTarget:'op-antifuse-read',examples:'AntiFuse OTP · ReRAM · PCM',
   descZh:'導電路徑或材料狀態改變；讀取比較高低電阻。',descEn:'A conductive path or material state changes; sensing compares resistance.',
   writeZh:'形成路徑或改變材料狀態；AntiFuse 擊穿通常不可逆。',writeEn:'Form a path or change the material state; AntiFuse breakdown is generally irreversible.',
   readZh:'路徑電阻／電流',readEn:'Path resistance / current',
   limitZh:'圖示是路徑概念，不把 AntiFuse、ReRAM 與 PCM 當成同一材料。',limitEn:'A path concept, not a shared material model for AntiFuse, ReRAM and PCM.'},
  {id:'polarization',zh:'極化',en:'Polarization',target:'topic-feram',writeTarget:'op-feram-write',readTarget:'op-feram-read',examples:'FeRAM · FeFET · FTJ',
   descZh:'極化方向留下不同狀態；感測方式依元件而異。',descEn:'Polarization direction stores distinct states; sensing depends on the device.',
   writeZh:'施加電場，切換可用的極化方向。',writeEn:'Apply an electric field to switch the available polarization direction.',
   readZh:'電荷／閾值／電流',readEn:'Charge / threshold / current',
   limitZh:'FeRAM、FeFET 與 FTJ 的讀取及破壞性不同。',limitEn:'FeRAM, FeFET and FTJ differ in sensing and read destructiveness.'}
];

function cell(kind, second) {
 const electrodes='<path d="M28 28h144M28 116h144" stroke="#18394f" stroke-width="6"/>';
 const arrow=(y,left=false)=>`<path d="M${left?148:52} ${y}h${left?-96:96}m${left?16:-16}-12 ${left?-16:16} 12 ${left?16:-16} 12" fill="none" stroke="#fff" stroke-width="5"/>`;
 const shapes={
  charge:`${electrodes}<rect x="40" y="52" width="120" height="32" rx="4" fill="#dbe8ec" stroke="#2f607f" stroke-width="3"/>${(second?[56,80,104,128,144]:[88]).map(x=>`<circle cx="${x}" cy="68" r="6" fill="#006667"/>`).join('')}<path d="M44 100h112" stroke="#a77742" stroke-width="4"/>`,
  magnetic:`<rect x="28" y="32" width="144" height="32" rx="4" fill="#2f607f"/><rect x="28" y="72" width="144" height="8" fill="#a77742"/><rect x="28" y="88" width="144" height="32" rx="4" fill="#006667"/>${arrow(48,second)}${arrow(104)}`,
  resistance:`${electrodes}<rect x="28" y="40" width="144" height="64" rx="4" fill="#e8eff1" stroke="#2f607f" stroke-width="2"/><path d="M100 30v24l-12 12 24 12-12 12v${second?24:8}" stroke="#006667" stroke-width="6" fill="none"/>${second?'':'<circle cx="100" cy="110" r="4" fill="#a77742"/>'}`,
  polarization:`${electrodes}<rect x="28" y="40" width="144" height="64" rx="4" fill="#e8eff1"/>${[56,100,144].map(x=>`<path d="M${x} ${second?52:92}v${second?40:-40}m-10 ${second?-12:12} 10 ${second?12:-12} 10 ${second?-12:12}" stroke="#006667" stroke-width="4" fill="none"/>`).join('')}`
 };
 return `<svg class="storage-state-svg" viewBox="0 0 200 144" aria-hidden="true" focusable="false" data-engineering-palette>${shapes[kind]}</svg>`;
}

export function storageExplorer(bi) {
 const phaseNames=[['儲存差異','Stored Difference'],['寫入刺激','Write Stimulus'],['感測差異','Sensed Difference']];
 return `<section id="storage-explorer" class="storage-explorer" data-motion-root data-motion-mode="step" data-frame="static" aria-labelledby="storage-explorer-title"><h3 id="storage-explorer-title">${bi('一個位元如何留下差異','How a Bit Leaves a Difference')}</h3><p class="storage-intro">${bi('先比較兩個儲存狀態，再沿著寫入與感測的因果閱讀。','Compare two stored states, then follow writing and sensing.')}</p><div class="storage-mode-controls" role="group" data-aria-zh="選擇儲存機制" data-aria-en="Choose a storage mechanism" aria-label="Choose a storage mechanism">${storageStates.map((s,i)=>`<button type="button" data-storage-mode="${s.id}" aria-pressed="${i===0}" aria-controls="storage-${s.id}">${bi(s.zh,s.en)}</button>`).join('')}</div><div class="storage-phase-map" aria-hidden="true">${phaseNames.map((names,i)=>`${i?'<b>→</b>':''}<span data-storage-focus="${i}"><small>0${i+1}</small>${bi(...names)}</span>`).join('')}</div><div class="storage-panels">${storageStates.map(s=>`<figure id="storage-${s.id}" data-storage-panel="${s.id}"><div class="storage-state-pair"><div><strong>${bi('狀態 A','State A')}</strong>${cell(s.id,false)}</div><div><strong>${bi('狀態 B','State B')}</strong>${cell(s.id,true)}</div></div><ol class="storage-causal-chain">${[s.descZh,s.writeZh,s.readZh].map((text,i)=>`<li data-storage-step="${i}"><span>0${i+1}</span><div><strong>${bi(...phaseNames[i])}</strong><p>${bi(text,[s.descEn,s.writeEn,s.readEn][i])}</p><a href="nvm-technology-atlas.html#${[s.target,s.writeTarget,s.readTarget][i]}">${bi(i===0?'查看此位元胞':i===1?'查看寫入操作':'查看讀取操作',i===0?'View This Bitcell':i===1?'View Write Operations':'View Read Operations')} ↗</a></div></li>`).join('')}</ol><figcaption>${bi(s.limitZh,s.limitEn)} <a href="nvm-technology-atlas.html#${s.target}">${bi('查看操作圖與來源','View Operations and Sources')} ↗</a></figcaption></figure>`).join('')}</div><div class="storage-playback" hidden><button type="button" data-storage-prev data-aria-zh="上一步" data-aria-en="Previous step" aria-label="Previous step">←</button><button type="button" data-storage-play>${bi('播放導讀','Play the Guide')}</button><button type="button" data-storage-reset>${bi('重設','Reset')}</button><button type="button" data-storage-next data-aria-zh="下一步" data-aria-en="Next step" aria-label="Next step">→</button><output data-storage-status aria-live="polite"></output><button type="button" data-storage-share>${bi('複製目前導讀連結','Copy Guide Link')}</button><output data-storage-share-status aria-live="polite"></output><input type="url" data-storage-share-url readonly hidden data-aria-zh="目前導讀連結，可手動複製" data-aria-en="Guide link, available for manual copying" aria-label="Guide link, available for manual copying"></div><p class="storage-boundary">${bi('概念圖，未按比例。A／B 不指定通用的 0／1，也不表示產品時序或性能。','Conceptual, not to scale. A/B does not assign a universal 0/1 or represent product timing or performance.')}</p></section>`;
}
