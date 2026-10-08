/**
 * 首頁情境探針：候選路線、成立前提與待確認欄位。
 * 每個候選的原理及來源共用既有專題路由，不建立另一份性能規格。
 */
'use strict';

  const CANDIDATES = Object.freeze({
    antifuse: {
      nameZh: 'AntiFuse OTP', nameEn: 'AntiFuse OTP',
      mechanismZh: '介電質程式化改變導通狀態；一般 OTP 使用不提供抹除與覆寫。',
      mechanismEn: 'Dielectric programming changes conduction; ordinary OTP operation provides no erase or overwrite.',
      conditionsZh: '適用不可變資料；寫入電壓、讀取方式及材料須綁定目標 IP。',
      conditionsEn: 'For immutable state; bind programming voltage, read mode and materials to the target IP.',
      confirmZh: '具名巨集、製程、光罩、保持條件、編程分布與讀取裕度。',
      confirmEn: 'Named macro, process, masks, retention conditions, programming distribution and read margin.',
      recordId: 'neofuse', path: 'nvm-technology-atlas.html#ip-neofuse'
    },
    gfMram: {
      nameZh: '12LP+ STT-MRAM 製程路線', nameEn: '12LP+ STT-MRAM Process Route',
      mechanismZh: '以磁性狀態保存可更新資料；與一次寫入的 OTP 分開比較。',
      mechanismEn: 'Magnetic state stores updatable data; compare it separately from one-time OTP.',
      conditionsZh: '需求包含重寫，且目標製程與巨集有相應公開或交付文件。',
      conditionsEn: 'Updates are required and the target process and macro have applicable public or delivery documents.',
      confirmZh: '可用版本、溫度等級、耐寫、保持、光罩及資格驗證狀態。',
      confirmEn: 'Available version, temperature grade, endurance, retention, masks and qualification status.',
      recordId: 'foundry', path: 'nvm-technology-atlas.html#foundry'
    },
    puf: {
      nameZh: 'SRAM PUF 與安全控制器', nameEn: 'SRAM PUF and Secure Controller',
      mechanismZh: '由上電回應重建裝置金鑰；輔助資料與執行期金鑰責任須分開。',
      mechanismEn: 'Reconstruct a device key from power-up response; separate helper-data and runtime-key responsibilities.',
      conditionsZh: '搭配加密持久資料，並明確定義重建、授權存取與零化。',
      conditionsEn: 'Pair with encrypted persistent data and define reconstruction, authorized access and zeroization.',
      confirmZh: 'PVT、老化、失敗率、熵、輔助資料完整性及目標晶片攻擊證據。',
      confirmEn: 'PVT, aging, failure rate, entropy, helper-data integrity and target-silicon attack evidence.',
      recordId: 'OIP-PUF-001', path: 'oip-secure-storage.html#helper-data'
    },
    efuse: {
      nameZh: 'eFuse 修復資料路線', nameEn: 'eFuse Repair-State Route',
      mechanismZh: '永久結構或電阻變化保存修復配置；容量不能只由位元胞面積推算。',
      mechanismEn: 'Permanent structural or resistance changes store repair configuration; capacity is not determined by bitcell area alone.',
      conditionsZh: '支援既有修復流程、測試介面與所需一次寫入配置。',
      conditionsEn: 'Fits the repair flow, test interface and required one-time configuration.',
      confirmZh: '有效資料、保護位元、周邊、粒度、配置容量及製程實作。',
      confirmEn: 'Payload, protection bits, periphery, granularity, allocated capacity and process implementation.',
      recordId: 'efuse', path: 'nvm-technology-atlas.html#topic-efuse'
    },
    neobit: {
      nameZh: 'NeoBit 浮閘 OTP', nameEn: 'NeoBit Floating-Gate OTP',
      mechanismZh: '浮閘電荷改變讀取電流；應與介電擊穿與電遷移分開。',
      mechanismEn: 'Floating-gate charge changes read current; distinguish it from dielectric breakdown and electromigration.',
      conditionsZh: '目標標準邏輯製程支援所需元件與寫入電壓。',
      conditionsEn: 'The target logic process supports the required devices and programming voltage.',
      confirmZh: '具名版本、零額外光罩適用性、寫入方式、保持與溫度條件。',
      confirmEn: 'Named version, zero-mask applicability, programming method, retention and temperature conditions.',
      recordId: 'neobit', path: 'nvm-technology-atlas.html#ip-neobit'
    },
    neofuse: {
      nameZh: 'NeoFuse 反熔絲 OTP', nameEn: 'NeoFuse Antifuse OTP',
      mechanismZh: '閘極介電質程式化改變感測電流；操作機制依該 IP 專題說明。',
      mechanismEn: 'Programming the gate dielectric changes sensing current; use the named IP study for its mechanism.',
      conditionsZh: '目標邏輯製程與周邊隔離電路支援程式化與讀取。',
      conditionsEn: 'The target logic process and peripheral isolation support programming and readout.',
      confirmZh: '巨集與製程、光罩主張、程式化條件、保持與讀取裕度。',
      confirmEn: 'Macro and process, mask claim, programming conditions, retention and read margin.',
      recordId: 'neofuse', path: 'nvm-technology-atlas.html#ip-neofuse'
    },
    ifuse: {
      nameZh: 'I-fuse 電遷移 OTP', nameEn: 'I-fuse Electromigration OTP',
      mechanismZh: '熱輔助電遷移提高熔絲電阻；不等同氧化層擊穿。',
      mechanismEn: 'Heat-assisted electromigration increases fuse resistance; it is distinct from oxide breakdown.',
      conditionsZh: '需使用該 IP 指定材料、電流脈衝與驗證流程。',
      conditionsEn: 'Use the IP-specific material, current pulse and verification flow.',
      confirmZh: '可用製程、光罩、編程電流、感測裕度、保持及可靠度證據。',
      confirmEn: 'Available process, masks, programming current, sense margin, retention and reliability evidence.',
      recordId: 'attopsemi-ifuse', path: 'nvm-technology-atlas.html#ip-attopsemi-ifuse'
    },
    stt: {
      nameZh: 'BEOL STT-eMRAM', nameEn: 'BEOL STT-eMRAM',
      mechanismZh: '自旋轉移切換磁態；寫入電流、耐寫與保持必須一起比較。',
      mechanismEn: 'Spin transfer switches magnetic state; compare write current, endurance and retention together.',
      conditionsZh: '目標製程可整合磁性堆疊，且狀態更新符合具名巨集條件。',
      conditionsEn: 'The process integrates the magnetic stack and state updates fit a named macro.',
      confirmZh: '整合模組與光罩、介面、延遲、能量、耐寫、保持及熱預算。',
      confirmEn: 'Integration modules and masks, interface, latency, energy, endurance, retention and thermal budget.',
      recordId: 'stt', path: 'nvm-technology-atlas.html#topic-stt'
    },
    reram: {
      nameZh: '快速 ReRAM 候選路線', nameEn: 'Fast ReRAM Candidate Route',
      mechanismZh: '可逆電阻狀態提供更新；快取用途需要額外陣列與系統證據。',
      mechanismEn: 'Reversible resistance stores updates; cache use needs additional array and system evidence.',
      conditionsZh: 'SET／RESET、變異控制與更新負載符合具名堆疊及陣列。',
      conditionsEn: 'SET/RESET, variability control and update workload fit a named stack and array.',
      confirmZh: '材料、selector、延遲、能量、耐寫、保持、半選與 ECC 成本。',
      confirmEn: 'Materials, selector, latency, energy, endurance, retention, half-select and ECC cost.',
      recordId: 'vcm', path: 'nvm-technology-atlas.html#topic-vcm'
    }
  });

  export const QUICK_PROBE_SCENARIOS = Object.freeze({
    'auto-grade0': {
      tabZh: '車用溫度', tabEn: 'Automotive', badgeZh: '任務條件', badgeEn: 'Mission Conditions',
      titleZh: '車用溫度與資料生命週期', titleEn: 'Automotive Temperature and State Lifecycle',
      introZh: '先區分環境溫度、接面溫度及保持驗證條件。Grade 0 不是 175°C 接面溫度的同義詞；不可變資料與可更新資料使用不同候選。',
      introEn: 'Separate ambient temperature, junction temperature and retention-test conditions. Grade 0 is not synonymous with a 175°C junction temperature; immutable and updatable state need different candidates.',
      candidates: ['antifuse', 'gfMram'], path: 'automotive-nvm.html',
      linkZh: '查看車用任務條件與驗證界線', linkEn: 'Review Automotive Conditions and Evidence Boundaries'
    },
    'gaa-rot': {
      tabZh: 'GAA 信任根', tabEn: 'GAA Root of Trust', badgeZh: '製程待核', badgeEn: 'Process to Confirm',
      titleZh: 'GAA 先進節點信任根', titleEn: 'Root of Trust at Advanced GAA Nodes',
      introZh: '2nm／3nm 是待確認的目標平臺，不是本探針的可用性承諾。將 OTP 的持久公開資料或密文，與 SRAM PUF 重建的執行期根金鑰分開。',
      introEn: '2nm/3nm are target platforms to confirm, not availability commitments. Separate persistent public data or ciphertext in OTP from a runtime root reconstructed by SRAM PUF.',
      candidates: ['antifuse', 'puf'], path: 'ai-nvm-opportunities.html',
      linkZh: '查看先進節點與系統整合問題', linkEn: 'Review Advanced-Node and System Integration Questions'
    },
    'sram-repair': {
      tabZh: 'SRAM 良率修復', tabEn: 'SRAM Repair', badgeZh: '容量假設', badgeEn: 'Capacity Assumptions',
      titleZh: 'SRAM 良率與修復容量', titleEn: 'SRAM Yield and Repair Capacity',
      introZh: '保留大容量 SRAM、行程長度壓縮（RLE）與分輪 BIRA 修復情境。先輸入容量、修復資料比例與壓縮假設，再比較 OTP／eFuse 配置；不由單一位元胞比率推定節省面積。',
      introEn: 'Retain large SRAM, run-length compression (RLE) and staged BIRA repair scenarios. Enter capacity, repair-data fraction and compression assumptions before comparing OTP/eFuse allocation; do not infer area savings from a bitcell ratio.',
      candidates: ['antifuse', 'efuse'], path: 'sram-repair.html',
      linkZh: '開啟 SRAM 修復容量試算器', linkEn: 'Open the SRAM Repair Capacity Estimator'
    },
    'zero-mask': {
      tabZh: '純邏輯校準', tabEn: 'Logic-Process Trim', badgeZh: '版本待核', badgeEn: 'Version to Confirm',
      titleZh: '純邏輯校準與晶片識別', titleEn: 'Logic-Process Trim and Die Identity',
      introZh: '保留 PMIC、HV-BCD、感測器與零額外光罩目標。三條路線的儲存變數與操作不同；零光罩、最低成本及高壓相容性均需分別核對目標版本。',
      introEn: 'Retain PMIC, HV-BCD, sensor and zero-mask targets. The three routes store and operate differently; confirm mask count, cost and high-voltage compatibility for each target version.',
      candidates: ['neobit', 'neofuse', 'ifuse'], path: 'specialty-nvm.html',
      linkZh: '查看特種製程與 BCD 條件', linkEn: 'Review Specialty-Process and BCD Conditions'
    },
    'ai-chiplet': {
      tabZh: 'AI Chiplet 狀態', tabEn: 'AI Chiplet State', badgeZh: '系統分工', badgeEn: 'System Responsibilities',
      titleZh: 'AI Chiplet 與 3D 封裝持久狀態', titleEn: 'Persistent State in AI Chiplets and 3D Packaging',
      introZh: '保留近記憶體快取、BEOL 整合、CoWoS／SoIC 與 Base Die 校準情境。工作資料、持久緩衝與不可變識別分開配置，並核對斷電提交、互連及熱條件。',
      introEn: 'Retain near-memory cache, BEOL integration, CoWoS/SoIC and Base Die calibration scenarios. Allocate working state, persistent buffers and immutable identity separately; check power-fail commit, interconnect and thermal conditions.',
      candidates: ['stt', 'reram', 'antifuse'], path: 'ai-nvm-opportunities.html',
      linkZh: '查看 AI 系統與封裝整合問題', linkEn: 'Review AI-System and Packaging Integration Questions'
    }
  });

  const bilingual = (zh, en) => `<span data-lang="zh">${zh}</span><span data-lang="en">${en}</span>`;

  // 首頁生成器與瀏覽器共用此純函式，避免初始內容另存一份條件。
export function renderQuickProbeScenario(key) {
  const data = QUICK_PROBE_SCENARIOS[key];
  if (!data) return '';
  return `
        <div class="probe-detail-primary">
          <div class="probe-tech-pill">${bilingual('候選路線與確認條件', 'CANDIDATE ROUTES AND CONDITIONS')}</div>
          <h4 class="probe-solution-title">${bilingual(data.titleZh, data.titleEn)}</h4>
          <p class="probe-physics-text">${bilingual(data.introZh, data.introEn)}</p>
          <p class="probe-physics-text">${bilingual('情境導讀，非產品推薦或資格驗證結果。各候選的原理與來源沿用既有專題。', 'Scenario guidance, not a product recommendation or qualification result. Each candidate reuses an existing study for principles and sources.')}</p>
          <a href="${data.path}" class="probe-deep-link">${bilingual(data.linkZh, data.linkEn)} →</a>
        </div>
        <div class="probe-stats-grid">${data.candidates.map(id => {
          const candidate = CANDIDATES[id];
          return `<article class="probe-stat-item" data-probe-candidate="${id}" data-record-id="${candidate.recordId}">
            <h5 class="probe-stat-value">${bilingual(candidate.nameZh, candidate.nameEn)}</h5>
            <p>${bilingual(candidate.mechanismZh, candidate.mechanismEn)}</p>
            <p><strong>${bilingual('成立前提：', 'Prerequisites: ')}</strong>${bilingual(candidate.conditionsZh, candidate.conditionsEn)}</p>
            <p><strong>${bilingual('需確認：', 'Confirm: ')}</strong>${bilingual(candidate.confirmZh, candidate.confirmEn)}</p>
            <a class="probe-deep-link" href="${candidate.path}">${bilingual('原理與具名來源', 'Principles and Named Sources')} →</a>
          </article>`;
        }).join('')}</div>`;
 }

  function initQuickProbe() {
    const probe = document.getElementById('quickArchitectureProbe');
    if (!probe) return;
    const buttons = Array.from(probe.querySelectorAll('.probe-btn'));
    const display = document.getElementById('probeResultDisplay');
    if (!buttons.length || !display) return;

    function renderScenario(key) {
      const data = QUICK_PROBE_SCENARIOS[key];
      if (!data) return;
      display.innerHTML = renderQuickProbeScenario(key);
      const active = buttons.find(button => button.dataset.scenario === key);
      buttons.forEach((button,index) => {
        button.id ||= `probe-scenario-${index+1}`;
        const selected = button === active;
        button.classList.toggle('active', selected);
        button.setAttribute('aria-pressed', String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      if (active?.id) display.setAttribute('aria-labelledby', active.id);
      const lang = document.documentElement.dataset.language || 'en';
      display.querySelectorAll('[data-lang]').forEach(el => {
        el.style.display = el.dataset.lang === lang ? '' : 'none';
      });
    }

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => renderScenario(button.dataset.scenario));
      button.addEventListener('keydown', event => {
        let target = null;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = buttons.length - 1;
        if (target !== null) {
          event.preventDefault();
          buttons[target].focus();
          renderScenario(buttons[target].dataset.scenario);
        }
      });
    });
    window.addEventListener('hub:language-change', () => {
      renderScenario(buttons.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.scenario || 'auto-grade0');
    });
    renderScenario(buttons.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.scenario || 'auto-grade0');
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initQuickProbe);
    else initQuickProbe();
  }
