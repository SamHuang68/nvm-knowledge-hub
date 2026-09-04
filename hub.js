// ==========================================================================
// 2026 NVM KNOWLEDGE HUB MONOREPO · V3.0 PRODUCTION HUB ENGINE
// Architecture Knowledge Map · Global Search Engine (Ctrl+K) · Language Sync
// ==========================================================================

/**
 * 語系單一真實來源同步 (Single Source of Truth)
 */
function syncHubLanguage() {
  const lang = window.HubLanguage ? window.HubLanguage.get() : "en";
  document.documentElement.dataset.language = lang;
  document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  if (document.body) {
    document.body.dataset.language = lang;
  }
  // 更新搜尋框 placeholder
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.placeholder =
      searchInput.dataset[lang === "zh" ? "placeholderZh" : "placeholderEn"] || "";
  }
}
window.addEventListener("hub:language-change", syncHubLanguage);
document.addEventListener("DOMContentLoaded", syncHubLanguage);

/**
 * 全局搜尋索引 (Global Search Index)
 * 涵蓋全站 12 個核心知識領域與資源頁面
 */
const SEARCH_INDEX = [
  {
    title_zh: "位元胞物理與可靠度",
    title_en: "Bitcell Physics & Reliability",
    url: "memory-physics.html",
    tags: "antifuse gate oxide filament physics fowler nordheim 175 drift evidence"
  },
  {
    title_zh: "NVM 技術對比矩陣",
    title_en: "NVM Technology Comparison Matrix",
    url: "technology-comparison.html",
    tags: "comparison matrix eflash emram efuse selection guide foundry tsmc umc"
  },
  {
    title_zh: "安全儲存架構",
    title_en: "Secure Storage Architecture",
    url: "secure-storage.html",
    tags: "sram puf aes 256 gcm otp zero rest key security"
  },
  {
    title_zh: "安全保證與信任根",
    title_en: "Security Assurance & Root of Trust",
    url: "security-assurance.html",
    tags: "fips 140 caliptra dpa fault injection root trust nist"
  },
  {
    title_zh: "AI 系統與先進節點",
    title_en: "AI Systems & Advanced Nodes",
    url: "ai-nvm-opportunities.html",
    tags: "xpu ddr5 pmic spd soic chiplet ucie pqc boot accelerator"
  },
  {
    title_zh: "超低功耗 IoT 與 MCU eNVM",
    title_en: "ULP IoT & Edge MCU eNVM",
    url: "iot-mcu-envm.html",
    tags: "iot mcu 22ull n4e eflash cliff 0.5v ntv vector patch"
  },
  {
    title_zh: "車規級 NVM",
    title_en: "Automotive-Grade NVM",
    url: "automotive-nvm.html",
    tags: "automotive aec q100 iso 26262 grade 0 175 secded ecc ppm adas ev"
  },
  {
    title_zh: "特種矽與 BCD 製程",
    title_en: "Specialty Silicon & BCD",
    url: "specialty-nvm.html",
    tags: "bcd pmic hv ddi gamma mura eink 110hv cis dram hbm ppr bist bira trim"
  },
  {
    title_zh: "白皮書決策工作台",
    title_en: "Whitepaper Decision Studio",
    url: "whitepaper/",
    tags: "whitepaper reader evidence ledger phase search"
  },
  {
    title_zh: "高階技術簡報",
    title_en: "Executive Briefing Deck",
    url: "briefing/index.html",
    tags: "briefing deck pptx speaker notes executive v19"
  },
  {
    title_zh: "矽驗證證據總帳",
    title_en: "Evidence Ledger",
    url: "memory-evidence.html",
    tags: "evidence 44 claims ledger silicon verified"
  },
  {
    title_zh: "OIP Secure Storage Brief (展會版)",
    title_en: "OIP Secure Storage Brief (Event Edition)",
    url: "oip-secure-storage.html",
    tags: "oip tsmc secure storage brief event"
  }
];

/**
 * 搜尋互動控制器
 */
function initSearchEngine() {
  const overlay = document.getElementById("searchOverlay");
  const input = document.getElementById("searchInput");
  const results = document.getElementById("searchResults");
  const trigger = document.getElementById("searchTrigger");

  if (!overlay || !input || !results) return;

  function openSearch() {
    overlay.classList.add("is-open");
    input.value = "";
    renderResults("");
    setTimeout(() => input.focus(), 50);
  }

  function closeSearch() {
    overlay.classList.remove("is-open");
  }

  function renderResults(query) {
    const lang = window.HubLanguage ? window.HubLanguage.get() : "en";
    const q = query.toLowerCase().trim();
    const filtered = q
      ? SEARCH_INDEX.filter(item =>
          item.title_en.toLowerCase().includes(q) ||
          item.title_zh.includes(q) ||
          item.tags.includes(q))
      : SEARCH_INDEX;

    results.innerHTML = filtered.map(item => `
      <a class="search-result-item" href="${item.url}">
        <div class="sr-title">${lang === "zh" ? item.title_zh : item.title_en}</div>
        <div class="sr-desc">${item.url}</div>
      </a>
    `).join("");
  }

  if (trigger) {
    trigger.addEventListener("click", openSearch);
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSearch();
  });

  input.addEventListener("input", () => renderResults(input.value));

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape" && overlay.classList.contains("is-open")) {
      closeSearch();
    }
  });
}

// 頁面就緒時啟動
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    syncHubLanguage();
    initSearchEngine();
  });
} else {
  syncHubLanguage();
  initSearchEngine();
}

// 匯出至全域環境
window.NVMHub = {
  syncLanguage: syncHubLanguage,
  searchIndex: SEARCH_INDEX
};
