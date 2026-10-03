/**
 * quick-probe.js — NVM Knowledge Hub Instant Architecture Decision Probe
 * 首頁即時架構決策探針：免跳轉極速選型判定，支援 W3C APG Tabs 鍵盤無障礙與雙語
 */

(() => {
  'use strict';

  const PROBE_DATA = {
    'auto-grade0': {
      techZh: 'AntiFuse OTP (閘氧化層擊穿) / 12LP+ STT-MRAM',
      techEn: 'AntiFuse OTP (Gate-Oxide Breakdown) / 12LP+ STT-MRAM',
      titleZh: '車規 AEC-Q100 Grade 0 極端環境架構',
      titleEn: 'Automotive AEC-Q100 Grade 0 Mission Architecture',
      physicsZh: '在高達 175°C 接面溫度下，浮閘記憶體（FG）面臨極高的熱離子發射與電洞漏電風險。AntiFuse 穿隧擊穿形成固態局域再結晶矽微絲（歐姆接觸），活化能 Ea ≈ 1.8–2.1 eV，具備無可匹敵之 10 年高溫留存力。',
      physicsEn: 'At junction temperatures up to 175°C, floating-gate memories suffer severe thermionic emission leakage. AntiFuse dielectric breakdown creates a physical recrystallized silicon filament with Ea ≈ 1.8–2.1 eV, providing uncompromised 10-year retention.',
      maskZh: '0 額外光罩 (邏輯 CMOS 相容)',
      maskEn: '0 Mask Adders (Logic Compatible)',
      retentionZh: '10 年 @ 175°C (AEC-Q100 Gr.0)',
      retentionEn: '10 Years @ 175°C (Grade 0)',
      enduranceZh: '1 次寫入 (永久不可逆微絲)',
      enduranceEn: '1 Cycle (Irreversible Filament)',
      linkUrl: 'automotive-nvm.html',
      linkTextZh: '深入車規 NVM 驗證標準 →',
      linkTextEn: 'Explore Automotive NVM Standards →'
    },
    'gaa-rot': {
      techZh: '純邏輯 0-mask AntiFuse OTP + SRAM PUF 混合信任根',
      techEn: 'Pure Logic 0-mask AntiFuse OTP + SRAM PUF Hybrid RoT',
      titleZh: '2nm / 3nm GAA 奈米片先進節點信任根',
      titleEn: '2nm / 3nm GAA Nanosheet Root-of-Trust (RoT)',
      physicsZh: '在 FinFET 至 2nm 奈米片 GAA 世代，傳統浮閘 eFlash 於 28nm 終止微縮，且 BEOL 熱預算受限（<400°C）。以超薄奈米片閘氧化層之介電質硬擊穿固化非對稱金鑰與安全韌體，配合 SRAM PUF 提供零殘留私鑰。',
      physicsEn: 'From FinFET to 2nm GAA nanosheets, eFlash halted scaling at 28nm with severe BEOL thermal limits (<400°C). Ultra-thin dielectric breakdown anchors hardware public keys and secure boot firmware, complemented by SRAM PUF for zero-at-rest keys.',
      maskZh: '0 額外光罩 (完全相容 GAA 基底)',
      maskEn: '0 Mask Adders (GAA Native)',
      retentionZh: '> 10 年 @ 125°C',
      retentionEn: '> 10 Years @ 125°C',
      enduranceZh: 'OTP: 1 次 / PUF: 無限啟動重構',
      enduranceEn: 'OTP: 1x / PUF: Infinite Reboot',
      linkUrl: 'ai-nvm-opportunities.html',
      linkTextZh: '查看 AI 系統與先進節點研究 →',
      linkTextEn: 'View AI Systems & Advanced Nodes →'
    },
    'sram-repair': {
      techZh: '高密度 AntiFuse OTP 陣列 + 行程長度壓縮 (RLE)',
      techEn: 'High-Density AntiFuse OTP Array + Run-Length Compression',
      titleZh: '大容量 SRAM (16Gb+) 晶圓良率密集修復架構',
      titleEn: 'High-Capacity SRAM (16Gb+) Yield Repair Architecture',
      physicsZh: '先進節點中 SRAM 位元胞面積微縮停滯（~0.021 µm²），快取良率缺陷隨面積非線性攀升。AntiFuse OTP 密度達到 eFuse 的 10–20 倍，結合行程壓縮演算法可將 2–8 Mb 修復向量緊湊儲存，節省 >80% 晶片矽面積。',
      physicsEn: 'In advanced nodes, SRAM cell area scaling has stalled (~0.021 µm²), with defect rates rising exponentially. AntiFuse OTP achieves 10–20x higher bitcell density than eFuse, storing 2–8 Mb compressed repair vectors while saving >80% silicon area.',
      maskZh: '0 額外光罩 (高密度 1T/1.5T 單元)',
      maskEn: '0 Mask Adders (Dense 1T/1.5T Cell)',
      retentionZh: '> 10 年 @ 105°C',
      retentionEn: '> 10 Years @ 105°C',
      enduranceZh: '1 次寫入 (支援多輪分段 BIRA)',
      enduranceEn: '1x Write (Multi-Phase BIRA)',
      linkUrl: 'sram-repair.html',
      linkTextZh: '啟動 SRAM 修復容量試算器 →',
      linkTextEn: 'Launch SRAM Repair Estimator →'
    },
    'zero-mask': {
      techZh: 'NeoBit (浮閘 OTP) / NeoFuse (反熔絲) / I-fuse (電遷移)',
      techEn: 'NeoBit (FG-OTP) / NeoFuse (AntiFuse) / I-fuse (EM-OTP)',
      titleZh: '純邏輯 0 額外光罩類比校準與晶片 ID',
      titleEn: 'Pure Logic 0-Mask Analog Trim and Die ID',
      physicsZh: '電源管理（PMIC）、高壓驅動（HV-BCD）與感測器晶片要求極端晶圓成本控制。0-mask 技術利用標準 CMOS 閘極或金屬走線，透過浮閘電子注入、閘氧擊穿或受控電遷移實現位元寫入，完全無需特殊材料沉積。',
      physicsEn: 'Power management (PMIC), display drivers (HV-BCD), and sensors demand strict wafer cost control. 0-mask IP uses standard CMOS poly gates or metal interconnects via charge injection, dielectric breakdown, or electromigration without extra masks.',
      maskZh: '0 額外光罩 (最低晶圓成本)',
      maskEn: '0 Mask Adders (Minimum Wafer Cost)',
      retentionZh: '10 年 @ 85°C–125°C',
      retentionEn: '10 Years @ 85°C–125°C',
      enduranceZh: 'OTP 1 次寫入',
      enduranceEn: 'OTP 1 Cycle',
      linkUrl: 'specialty-nvm.html',
      linkTextZh: '探索特種製程與 BCD 校準 →',
      linkTextEn: 'Explore Specialty Silicon & BCD Trim →'
    },
    'ai-chiplet': {
      techZh: '後段 BEOL STT-eMRAM / Fast ReRAM + Base Die OTP',
      techEn: 'BEOL STT-eMRAM / Fast ReRAM + Base Die AntiFuse OTP',
      titleZh: 'AI Chiplet、3D 堆疊與非揮發快取記憶體',
      titleEn: 'AI Chiplet, 3D Stacking and Nonvolatile Cache Fabric',
      physicsZh: '在大規模 AI 運算加速器與 3D 封裝（CoWoS / SoIC）中，高頻讀寫需要近記憶體運算與零待機漏電。BEOL 整合之 STT-MRAM 支援納秒級讀取與高覆寫耐久度，Base Die 則以 AntiFuse OTP 保存晶片身分與 Die-to-Die 校準參數。',
      physicsEn: 'In massive AI accelerators and 3D heterogeneous packaging (CoWoS / SoIC), ultra-dense compute demands near-memory caching with zero standby leakage. BEOL STT-MRAM offers nanosecond reads and high endurance, while Base Die OTP secures D2D calibration.',
      maskZh: '3–5 道後段 (BEOL) 磁性光罩',
      maskEn: '3–5 BEOL Magnetic Masks',
      retentionZh: '10 年 @ 105°C (陣列級)',
      retentionEn: '10 Years @ 105°C (Array Level)',
      enduranceZh: '10⁶–10¹⁰ 週期 (近工作記憶體)',
      enduranceEn: '10⁶–10¹⁰ Cycles (Near-RAM)',
      linkUrl: 'ai-nvm-opportunities.html',
      linkTextZh: '檢視 3D 封裝與 AI NVM 機會 →',
      linkTextEn: 'Examine 3D Packaging & AI NVM →'
    }
  };

  function initQuickProbe() {
    const probe = document.getElementById('quickArchitectureProbe');
    if (!probe) return;

    const buttons = probe.querySelectorAll('.probe-btn');
    const display = document.getElementById('probeResultDisplay');
    if (!buttons.length || !display) return;

    function renderScenario(key) {
      const data = PROBE_DATA[key];
      if (!data) return;

      display.innerHTML = `
        <div class="probe-detail-primary">
          <div class="probe-tech-pill">
            <span data-lang="zh">推薦架構</span><span data-lang="en">RECOMMENDED ARCHITECTURE</span>
          </div>
          <h4 class="probe-solution-title">
            <span data-lang="zh">${data.techZh}</span>
            <span data-lang="en">${data.techEn}</span>
          </h4>
          <p class="probe-physics-text">
            <span data-lang="zh">${data.physicsZh}</span>
            <span data-lang="en">${data.physicsEn}</span>
          </p>
        </div>
        <div class="probe-stats-grid">
          <div class="probe-stat-item">
            <span class="probe-stat-label"><span data-lang="zh">額外光罩代價</span><span data-lang="en">Mask Adders</span></span>
            <span class="probe-stat-value"><span data-lang="zh">${data.maskZh}</span><span data-lang="en">${data.maskEn}</span></span>
          </div>
          <div class="probe-stat-item">
            <span class="probe-stat-label"><span data-lang="zh">高溫留存等級</span><span data-lang="en">Retention Class</span></span>
            <span class="probe-stat-value"><span data-lang="zh">${data.retentionZh}</span><span data-lang="en">${data.retentionEn}</span></span>
          </div>
          <div class="probe-stat-item">
            <span class="probe-stat-label"><span data-lang="zh">抹寫耐受性</span><span data-lang="en">Endurance Cycles</span></span>
            <span class="probe-stat-value"><span data-lang="zh">${data.enduranceZh}</span><span data-lang="en">${data.enduranceEn}</span></span>
          </div>
          <div class="probe-stat-item">
            <span class="probe-stat-label"><span data-lang="zh">關鍵應用目標</span><span data-lang="en">Mission Profile</span></span>
            <span class="probe-stat-value"><span data-lang="zh">${data.titleZh}</span><span data-lang="en">${data.titleEn}</span></span>
          </div>
          <div class="probe-cta-row">
            <a href="${data.linkUrl}" class="probe-deep-link">
              <span data-lang="zh">${data.linkTextZh}</span>
              <span data-lang="en">${data.linkTextEn}</span>
            </a>
          </div>
        </div>
      `;

      // 觸發全站雙語同步 (若已載入 site-language.js)
      const currentLang = document.documentElement.dataset.language || 'en';
      display.querySelectorAll(`[data-lang="${currentLang === 'zh' ? 'en' : 'zh'}"]`).forEach(el => {
        el.style.display = 'none';
      });
      display.querySelectorAll(`[data-lang="${currentLang}"]`).forEach(el => {
        el.style.display = '';
      });
    }

    buttons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const scenario = btn.dataset.scenario;
        display.style.opacity = '0.3';
        setTimeout(() => {
          renderScenario(scenario);
          display.style.opacity = '1';
        }, 120);
      });

      // 鍵盤導航 (W3C APG Tabs)
      btn.addEventListener('keydown', (e) => {
        let targetIndex = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          targetIndex = (index + 1) % buttons.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          targetIndex = (index - 1 + buttons.length) % buttons.length;
        }
        if (targetIndex !== null) {
          e.preventDefault();
          buttons[targetIndex].focus();
          buttons[targetIndex].click();
        }
      });
    });

    // 初始化渲染預設場景 (auto-grade0)
    renderScenario('auto-grade0');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuickProbe);
  } else {
    initQuickProbe();
  }
})();
