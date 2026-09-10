// 物理概念索引使用原生向量符號；不代表特定產品的實際剖面。
export function storageGlyph(kind) {
 const shapes={
  charge:'<path d="M12 52h56M18 43h44M18 22h44v14H18z"/><path class="storage-fill" d="M24 26h32v6H24z"/><circle cx="28" cy="29" r="1.5"/><circle cx="40" cy="29" r="1.5"/><circle cx="52" cy="29" r="1.5"/><path d="M24 52v9m32-9v9M40 12v10"/>',
  magnetic:'<path d="M17 17h46v13H17zM17 43h46v13H17z"/><path class="storage-fill" d="M17 34h46v5H17z"/><path d="M29 24h23m-6-5 6 5-6 5M29 50h23m-6-5 6 5-6 5"/>',
  resistance:'<path d="M18 15h44v7H18zM18 52h44v7H18z"/><path class="storage-faint" d="M18 25h44v24H18z"/><path d="m40 22-5 7 9 7-8 8 4 8"/><circle cx="35" cy="29" r="2"/><circle cx="44" cy="36" r="2"/><circle cx="36" cy="44" r="2"/>',
  polarization:'<path d="M14 18h52M14 56h52"/><path class="storage-faint" d="M14 23h52v28H14z"/><path d="M25 47V28m-5 6 5-6 5 6M40 47V28m-5 6 5-6 5 6M55 47V28m-5 6 5-6 5 6"/>'
 };
 return `<svg class="storage-glyph" viewBox="0 0 80 74" aria-hidden="true" focusable="false">${shapes[kind]||shapes.resistance}</svg>`;
}

export function physicsIndex(bi) {
 const items=[
  ['charge','電荷','Charge','浮閘電荷改變閾值電壓','Floating-gate charge shifts threshold voltage','FG OTP · EEPROM · Flash','ip-neobit'],
  ['magnetic','磁態','Magnetization','磁層的相對方向','Relative magnetic orientation','Toggle · STT · SOT','topic-stt'],
  ['resistance','電阻','Resistance','導電路徑、介電擊穿或相態','Conductive path, dielectric breakdown, or phase','AntiFuse OTP · ReRAM · PCM','topic-antifuse'],
  ['polarization','極化','Polarization','可切換的極化方向','Switchable polarization','FeRAM · FeFET · FTJ','topic-feram']
 ];
 return `<details class="knowledge-physics" open><summary>${bi('儲存狀態的四個觀察角度','Four Ways to Read a Stored State')}</summary><div class="knowledge-physics-index">${items.map(([kind,zh,en,descZh,descEn,examples,target])=>`<a href="NVM技術全景.html#${target}">${storageGlyph(kind)}<div><strong>${bi(zh,en)}</strong><span>${bi(descZh,descEn)}</span></div><small>${examples}</small></a>`).join('')}</div><p>${bi('物理概念示意。OTP 不是單一物理：浮動閘 OTP 是電荷，AntiFuse OTP 是介電路徑。各實作的材料與操作條件請見專題。','Conceptual symbols. OTP is not one physics: floating-gate OTP is charge; AntiFuse OTP is a dielectric path. See each study for materials and operating conditions.')}</p></details>`;
}

export function researchShowcase(zh,en,bi) {
 const lead=zh.profiles[0],leadEn=en.profiles.find(p=>p.id===lead.id);
 const href=id=>`NVM技術全景.html#research-${id}`;
 return `<section id="featured-studies" class="knowledge-features" aria-labelledby="featured-studies-title"><header><p class="eyebrow">${bi('產研專題導讀','RESEARCH IN FOCUS')}</p><h2 id="featured-studies-title">${bi('從具名實作看工程取捨','Engineering Tradeoffs, Named Implementations')}</h2><p>${bi('先選一個研究問題，再深入機制、整合條件與原始證據。','Choose a research question, then examine the mechanism, integration conditions and original evidence.')}</p></header><div class="knowledge-feature-grid"><a class="knowledge-feature-lead" href="${href(lead.id)}"><p class="knowledge-feature-label">01 · Everspin</p><h3>${bi(lead.title,leadEn.title)}</h3><p>${bi(lead.summary,leadEn.summary)}</p><div class="knowledge-product-tracks" aria-label="${'Everspin'}"><span>Toggle</span><span>STT / DDR</span><span>STT / xSPI</span></div><span class="knowledge-feature-cta">${bi('閱讀完整專題','Read the Full Study')}<span aria-hidden="true">↗</span></span></a><div class="knowledge-feature-list">${zh.profiles.slice(1).map((p,i)=>{const e=en.profiles.find(x=>x.id===p.id);return `<a href="${href(p.id)}"><span class="knowledge-feature-number">0${i+2}</span><div><p class="knowledge-feature-label">${bi(p.name,e.name)}</p><h3>${bi(p.title,e.title)}</h3></div><span aria-hidden="true">↗</span></a>`;}).join('')}</div></div></section>`;
}
