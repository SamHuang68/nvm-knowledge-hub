let language = window.HubLanguage ? window.HubLanguage.get() : "en";
const L = (zh, en) => ({ zh, en });
const t = value => value[language];

const phases = {
  off: { number:L("01 / 斷電","01 / POWER-OFF"), title:L("在已驗證的關機條件下，不保留通電重建的根金鑰","No powered reconstructed root remains under the validated shutdown condition"), text:L("密文、輔助資料、生命週期狀態與 SRAM 元件失配可能持續存在；殘留效應與金鑰清除仍須驗證。","Ciphertext, helper data, lifecycle state and SRAM device mismatch may persist; remanence and zeroization still require assurance."), asset:L("OTP 密文 · 輔助資料 · 生命週期位元 · 元件失配","OTP ciphertext · helper data · lifecycle bits · device mismatch"), method:L("侵入式／光學讀取","Invasive / optical readout"), question:L("成功讀取後，在組合控制成立的條件下實際揭露什麼？","What does readout reveal when the composed controls hold?"), outcome:L("預期為密文／受保護資料；輔助資料完整性、殘留效應與金鑰清除仍是測試目標。","Expected ciphertext/protected data; helper-data integrity, remanence and zeroization remain test targets."), key:L("未通電","NOT POWERED"), result:L("有條件成立","CONDITIONAL"), active:false },
  boot: { number:L("02 / 啟動","02 / BOOT"), title:L("PUF 重建形成第一個敏感時窗","PUF reconstruction creates the first sensitive window"), text:L("啟動回應、錯誤更正、輔助資料處理與控制流程需要同時接受洩漏、故障及 PVT／老化驗證。","Startup response, error correction, helper-data processing and control flow require leakage, fault and PVT/aging validation."), asset:L("PUF 回應 · 重建中間值","PUF response · reconstruction intermediate"), method:L("功耗／EM 側通道分析 · 電壓／時鐘／EM 故障注入","Power/EM SCA · voltage/clock/EM FI"), question:L("重建失敗能否被利用為繞過檢查、資訊探測或降級路徑？","Can reconstruction failure become a bypass, oracle or downgrade path?"), outcome:L("失敗時維持安全；不輸出可利用的中間值。","Fail secure without exploitable intermediates."), key:L("重建中","RECONSTRUCTING"), result:L("失敗時維持安全","FAIL SECURE"), active:true },
  derive: { number:L("03 / 衍生","03 / DERIVE"), title:L("根金鑰與衍生金鑰必須限制駐留時間","Root and derived keys need bounded residency"), text:L("KDF 與 AES 操作可能產生功耗／EM 洩漏，也可能受到 DFA 或指令跳過類故障影響。","KDF and AES operations may leak through power or EM and may be exposed to DFA or instruction-skip faults."), asset:L("根金鑰中間值 · 工作金鑰","Root intermediate · working keys"), method:L("DPA／CPA · 高階側通道分析 · DFA","DPA/CPA · higher-order SCA · DFA"), question:L("錯誤輸出是否可形成金鑰復原的資訊探測管道？","Can faulty outputs form a key-recovery oracle?"), outcome:L("偵測錯誤、限制輸出、隔離與清除。","Detect errors, suppress outputs, isolate and clear."), key:L("啟用／受限","ACTIVE / BOUNDED"), result:L("不洩漏金鑰","NO KEY DISCLOSURE"), active:true },
  access: { number:L("04 / 授權存取","04 / AUTHORIZED ACCESS"), title:L("明文只應存在於受控交易內","Plaintext belongs only inside an authorized transaction"), text:L("控制器、匯流排、權限檢查、位址映射與重設順序共同決定安全邊界是否成立。","Controller, bus, permission checks, address mapping and reset sequencing determine whether the secure boundary holds."), asset:L("明文時窗 · 存取政策 · 匯流排資料","Plaintext window · access policy · bus data"), method:L("協定濫用 · 突波 · 除錯誤用","Protocol abuse · glitch · debug misuse"), question:L("跳過一次檢查，是否足以完成未授權讀寫？","Can one skipped check complete an unauthorized transaction?"), outcome:L("政策原子性；錯誤或重設不可放寬權限。","Policy atomicity; error or reset never relaxes access."), key:L("授權時窗","AUTHORIZED WINDOW"), result:L("政策已執行","POLICY ENFORCED"), active:true },
  zeroize: { number:L("05 / 金鑰清除","05 / ZEROIZE"), title:L("清除必須可驗證，而且能承受中斷","Clearing must be verifiable and interruption-safe"), text:L("金鑰清除不只是寫入零；必須定義觸發條件、重設／故障行為、殘留狀態與驗證方法。","Zeroization is more than writing zeroes; define triggers, reset/fault behavior, residual state and verification."), asset:L("殘留根金鑰／工作金鑰狀態","Residual root/working-key state"), method:L("重設中斷 · 殘留效應 · 故障","Reset interruption · remanence · fault"), question:L("在最不利中斷點，敏感狀態是否仍可恢復？","At the worst interruption point, can sensitive state be recovered?"), outcome:L("不可恢復、重設時維持安全，且測試結果可重現。","Irrecoverable, reset-safe and reproducibly tested."), key:L("清除中","REMOVING"), result:L("無殘留金鑰","NO RESIDUAL KEY"), active:true }
};

const assuranceMaturity = [
  {name:L("公開主張","CLAIMED"),title:L("公開主張","Public claim"),text:L("供應商公開描述功能或安全特性。","A supplier publicly describes a function or security property."),items:L(["保留原始來源與日期","不可改寫為已驗證事實"],["Retain original source and date","Do not restate as verified fact"])},
  {name:L("需求已界定","SPECIFIED"),title:L("需求已界定","Requirement specified"),text:L("資產、威脅、邊界、假設與通過條件已有文件。","Assets, threats, boundary, assumptions and pass criteria are documented."),items:L(["威脅模型與安全需求","仍不代表測試已完成"],["Threat model and security requirement","Testing is not yet complete"])},
  {name:L("內部測試","TESTED"),title:L("內部測試","Internally tested"),text:L("有版本化方法、環境、結果、例外與負責人。","Versioned method, environment, results, exceptions and owner exist."),items:L(["保存原始資料與重現條件","揭露涵蓋範圍與限制"],["Retain raw data and reproduction conditions","Disclose coverage and limits"])},
  {name:L("獨立評估","EVALUATED"),title:L("獨立評估","Independently evaluated"),text:L("第三方依明確範圍與方法審查安全性。","A third party reviews security against an explicit scope and method."),items:L(["記錄實驗室、報告與 TOE","不可擴張至未評估整合"],["Record lab, report and TOE","Do not extend to unevaluated integration"])},
  {name:L("正式認證","CERTIFIED"),title:L("正式認證","Formally certified"),text:L("認證制度、等級、證書、版本與有效範圍可查。","Scheme, level, certificate, version and valid scope are traceable."),items:L(["區分 IP、SoC 與裝置範圍","標誌不代表能抵抗所有攻擊"],["Distinguish IP, SoC and device scope","A logo does not imply immunity to all attacks"])},
  {name:L("量產證據","FIELD-PROVEN"),title:L("量產證據","Field-proven"),text:L("部署、PVT、老化、回報與修補形成長期證據。","Deployment, PVT, aging, reports and remediation form longitudinal evidence."),items:L(["持續更新事件與勘誤","數量不能取代適用性分析"],["Continuously update incidents and errata","Volume does not replace applicability analysis"])}
];

const roleContent = {
  foundation:[L("分辨攻擊類型","Distinguish attack classes"),L("理解 FI、SCA 與實體讀取的目的、差異和限制。","Understand the goals, differences and limits of FI, SCA and physical readout."),L("概念檢核","CONCEPT CHECK")],
  practitioner:[L("建立安全 NVM 威脅模型","Build a Secure NVM threat model"),L("把 SRAM PUF、AES、OTP、控制器與生命週期映射至資產和攻擊時窗。","Map SRAM PUF, AES, OTP, controller and lifecycle to assets and attack windows."),L("威脅地圖","THREAT MAP")],
  evaluator:[L("設計可重現的測試計畫","Design a reproducible test campaign"),L("定義觸發條件、參數空間、分類、通過條件、涵蓋範圍與殘餘風險；公開頁不提供漏洞利用步驟。","Define triggers, parameter space, classification, pass criteria, coverage and residual risk; exploit recipes remain controlled."),L("測試計畫","TEST PLAN")],
  decision:[L("審查證據與認證範圍","Review evidence and certification scope"),L("判斷 TOE、證據成熟度、可重用性、限制、未知項目與產品決策風險。","Assess TOE, evidence maturity, reuse, limits, unknowns and product decision risk."),L("安全保證審查","ASSURANCE REVIEW")]
};

const roleNames = {
  foundation: L("基礎學習者", "FOUNDATION"), practitioner: L("實務工作者", "PRACTITIONER"),
  evaluator: L("評估人員", "EVALUATOR"), decision: L("決策者", "DECISION"),
};
const schemeNames = {
  "ISO/SAE 21434 evidence": L("ISO/SAE 21434 證據", "ISO/SAE 21434 evidence"),
  "UN R155/R156 context": L("UN R155/R156 背景", "UN R155/R156 context"),
  "Independent evaluation": L("獨立評估", "Independent evaluation"),
  "Internal assurance case": L("內部安全保證論證", "Internal assurance case"),
};
// 正式認證與標準名稱保留；一般說明隨語系呈現。
const localizeScheme = name => schemeNames[name] ? t(schemeNames[name]) : name;

function applyLanguage(){document.body.dataset.language=language;document.documentElement.lang=language==="zh"?"zh-Hant":"en";document.querySelectorAll("[data-zh][data-en]").forEach(el=>el.textContent=el.dataset[language]);document.querySelector("#languageToggle").setAttribute("aria-label",language==="zh"?"切換為英文":"Switch to Traditional Chinese");document.querySelector(".brand").setAttribute("aria-label",language==="zh"?"NVM 知識中心首頁":"NVM Knowledge Hub home");document.querySelector("#primaryNav").setAttribute("aria-label",language==="zh"?"頁面導覽":"Page navigation");document.querySelector("#controlMatrix").setAttribute("aria-label",language==="zh"?"安全控制比較表":"Security control comparison");document.querySelector(".role-tabs").setAttribute("aria-label",language==="zh"?"學習路徑起始角色":"Learning path starting role");renderPhase(document.querySelector(".phase-tabs button.active")?.dataset.phase||"off");renderEvidence(document.querySelector("#evidenceLadder button.active")?.dataset.level||0);renderRole(document.querySelector(".role-tabs button.active")?.dataset.role||"foundation");renderCertification();updateCertSelectsLanguage();localStorage.setItem("nvm-language",language)}
function renderPhase(id){const p=phases[id];document.querySelectorAll(".phase-tabs button").forEach(b=>{const a=b.dataset.phase===id;b.classList.toggle("active",a);b.setAttribute("aria-pressed",a)});document.querySelector("#windowDetail").innerHTML=`<span class="state">${t(p.number)}</span><h3>${t(p.title)}</h3><p>${t(p.text)}</p><div class="detail-grid"><div><small>${t(L("敏感資產","SENSITIVE ASSET"))}</small><b>${t(p.asset)}</b></div><div><small>${t(L("攻擊方法","ATTACK METHOD"))}</small><b>${t(p.method)}</b></div><div><small>${t(L("測試問題","TEST QUESTION"))}</small><b>${t(p.question)}</b></div><div><small>${t(L("預期結果","EXPECTED OUTCOME"))}</small><b>${t(p.outcome)}</b></div></div>`;document.querySelector("#keyState").textContent=t(p.key);document.querySelector("#resultState").textContent=t(p.result);document.querySelector("#windowVisual").classList.toggle("active",p.active)}
function renderEvidence(level=0){const n=Number(level);const item=assuranceMaturity[n];document.querySelector("#evidenceLadder").innerHTML=assuranceMaturity.map((e,i)=>`<button data-level="${i}" class="${i===n?'active':''}" aria-pressed="${i===n}"><small>M${i+1}</small><b>${t(e.name)}</b></button>`).join("");document.querySelector("#evidenceDetail").innerHTML=`<div><p class="kicker">${t(L("成熟度","MATURITY"))} M${n+1}</p><h3>${t(item.title)}</h3></div><p>${t(item.text)}</p><ul>${t(item.items).map(x=>`<li>${x}</li>`).join("")}</ul>`}
function renderRole(role){document.querySelectorAll(".role-tabs button").forEach(b=>{const active=b.dataset.role===role;b.classList.toggle("active",active);b.setAttribute("aria-pressed",active)});const order=["foundation","practitioner","evaluator","decision"],start=order.indexOf(role),items=[...order.slice(start),...order.slice(0,start)];document.querySelector("#rolePath").innerHTML=items.map((key,i)=>{const r=roleContent[key];return `<article><span>0${i+1} · ${t(roleNames[key])}</span><h3>${t(r[0])}</h3><p>${t(r[1])}</p><b>${t(L("產出","OUTPUT"))} · ${t(r[2])}</b></article>`}).join("")}
function renderCertification(){const target=document.querySelector("#targetSelect").value,market=document.querySelector("#marketSelect").value,goal=document.querySelector("#goalSelect").value;let schemes=[];if(market==="iot")schemes=["SESIP","PSA Certified","Common Criteria"];if(market==="auto")schemes=["ISO/SAE 21434 evidence","Common Criteria","UN R155/R156 context"];if(market==="payment")schemes=["Common Criteria","EMVCo","GlobalPlatform"];if(market==="general")schemes=["Independent evaluation","Common Criteria","Internal assurance case"];const scope=target==="ip"?L("建立可由 SoC／產品重用的 IP 證據套件；先確認認證制度是否接受組合式重用。","Build an IP evidence package reusable by SoC/product teams; confirm whether the scheme accepts compositional reuse."):target==="soc"?L("把 IP 證據納入安全 IC／SoC 評估目標（TOE），補上整合、韌體、除錯與生命週期控制。","Bring IP evidence into the secure IC/SoC TOE and cover integration, firmware, debug and lifecycle controls."):L("從裝置威脅模型回推 IP 與 SoC 證據，並涵蓋供應鏈、更新與營運要求。","Trace device threats back to IP and SoC evidence, including supply-chain, update and operational requirements.");const strength=goal==="high"?L("以認可實驗室與正式認證制度範圍為目標。","Target an accredited lab and formal scheme scope."):goal==="reuse"?L("優先建立版本化、可組合與可移轉的證據。","Prioritize versioned, composable and transferable evidence."):L("先完成威脅模型、設計審查與認證前落差評估。","Start with threat modeling, design review and a pre-certification gap assessment.");document.querySelector("#certResult").innerHTML=`<span class="route">${t(L("建議方向","DIRECTIONAL ROUTE"))}</span><h3>${localizeScheme(schemes[0])}</h3><p>${t(scope)} ${t(strength)}</p><div class="cert-tags">${schemes.map(s=>`<span>${localizeScheme(s)}</span>`).join("")}</div><p class="cert-warning">${language==="zh"?"需要確認：評估目標（TOE）、保護設定檔、保證等級、實驗室認可、產品版本與證據重用規則。此結果不表示已認證。":"Confirm TOE, protection profile, assurance level, lab accreditation, product version and evidence-reuse rules. This result does not indicate certification."}</p>`}

document.querySelector(".phase-tabs").addEventListener("click",e=>{const b=e.target.closest("button[data-phase]");if(b)renderPhase(b.dataset.phase)});document.querySelector("#evidenceLadder").addEventListener("click",e=>{const b=e.target.closest("button[data-level]");if(b)renderEvidence(b.dataset.level)});document.querySelector(".role-tabs").addEventListener("click",e=>{const b=e.target.closest("button[data-role]");if(b)renderRole(b.dataset.role)});document.querySelector("#certForm").addEventListener("change",renderCertification);window.addEventListener("scroll",()=>{const max=document.documentElement.scrollHeight-innerHeight;document.querySelector("#progressBar").style.width=`${max>0?scrollY/max*100:0}%`});

const primaryNav = document.querySelector("#primaryNav");
const menuToggle = document.querySelector("#menuToggle");
const navLinks = [...primaryNav.querySelectorAll('a[href^="#"]')];
const navSections = navLinks.map(link => document.querySelector(link.hash)).filter(Boolean);
const setCurrentSection = id => navLinks.forEach(link => {
  const current = link.hash === `#${id}`;
  if (current) link.setAttribute("aria-current", "location");
  else link.removeAttribute("aria-current");
});
const closeMenu = ({ restoreFocus = false } = {}) => {
  primaryNav.classList.remove("open");
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  if (restoreFocus) menuToggle.focus();
};
if (menuToggle && primaryNav && !menuToggle._hubNavBound) {
  menuToggle._hubNavBound = true;
  menuToggle.addEventListener("click", () => {
    const open = !primaryNav.classList.contains("open");
    primaryNav.classList.toggle("open", open);
    menuToggle.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    if (open) navLinks[0]?.focus();
  });
  navLinks.forEach(link => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && primaryNav.classList.contains("open")) closeMenu({ restoreFocus: true });
  });
}
const sectionObserver = new IntersectionObserver(entries => {
  const current = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (current) setCurrentSection(current.target.id);
}, { rootMargin: "-20% 0px -65% 0px", threshold: [0.05, 0.2, 0.5] });
navSections.forEach(section => sectionObserver.observe(section));
const initialSection = location.hash.slice(1);
if (navSections.some(section => section.id === initialSection)) setCurrentSection(initialSection);



// 認證導引表單下拉選單多語支援
const certOptionDict = {
  "ip": { zh: "矽智財／安全子系統", en: "Silicon IP / subsystem" },
  "soc": { zh: "系統單晶片／安全 IC", en: "SoC / secure IC" },
  "device": { zh: "終端聯網裝置", en: "Connected device" },
  "iot": { zh: "物聯網／運算平臺", en: "IoT / platform" },
  "auto": { zh: "車用電子（ISO 21434）", en: "Automotive" },
  "payment": { zh: "支付／安全元件", en: "Payment / secure element" },
  "general": { zh: "通用高安全確證", en: "General assurance" },
  "baseline": { zh: "基礎市場信任", en: "Baseline market trust" },
  "reuse": { zh: "可重用 IP 評估證據", en: "Reusable IP evidence" },
  "high": { zh: "高保證等級認證", en: "High-assurance certification" }
};

function updateCertSelectsLanguage() {
  document.querySelectorAll("#certForm select option").forEach(opt => {
    const val = opt.value;
    if (certOptionDict[val]) {
      opt.textContent = certOptionDict[val][language];
    }
  });
}

window.addEventListener("hub:language-change", e => { language = e.detail.language; if (typeof applyLanguage === "function") applyLanguage(); });

renderEvidence(0);renderRole("foundation");applyLanguage();
