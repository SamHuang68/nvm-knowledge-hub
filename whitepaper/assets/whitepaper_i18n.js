/**
 * Whitepaper Studio Real-time Bilingual (ZH-TW / EN) Engine
 * Provides comprehensive translation for static and dynamically rendered panels.
 */
(function () {
  const DICT = {
    // Specialty eNVM Architecture Additions
    "Specialty NVM": "特種 NVM",
    "Specialty eNVM": "特種製程 eNVM",
    "BCD Power PMIC & LED Trimming": "BCD 電源 PMIC 與 LED 電性微調",
    "CIS & DRAM Matrix Defect Repair": "CIS 與 DRAM 矩陣缺陷修復",
    "HV Display Driver (OLED / LCD DDIC)": "高壓顯示驅動晶片 (OLED / LCD DDIC)",
    "E-Ink Ultra-HV Driver (40V-50V / 110HV)": "電子紙超高壓驅動晶片 (40V-50V / 110HV)",
    "Zero Mask Adder": "零額外光罩",
    "Post-Package Repair (PPR)": "封裝後現場修復 (PPR)",
    "Waveform LUT": "波形查找表 (Waveform LUT)",
    "De-Mura Optical Calibration": "De-Mura 光學均勻性補償",

    // Top Bar & Navigation
    "TECHNOLOGY & SELECTION": "技術與架構決策",
    "← PORTFOLIO": "← 作品集",
    "All Topics": "總門戶",
    "Secure Storage": "安全儲存",
    "AI Systems": "AI 與先進節點",
    "Research Library": "研究與證據庫",
    "Skip to main content": "跳至主要內容",

    // Breadcrumb
    "NVM Knowledge Hub": "NVM 知識總體系",
    "Knowledge Workbench": "知識決策工作台",
    "Whitepaper Studio": "白皮書決策工作室",

    // Hero Section
    "NVM KNOWLEDGE WORKBENCH · PUBLIC EDITION": "NVM 知識決策工作台 · 公開版",
    "From NVM technology": "從 NVM 物理技術",
    "to a defensible selection": "到可辯護的架構決策",
    "A governed workspace for technology whitepapers, state-contract trade-offs and SharePoint content models—built around what can be supported, what must be validated and what remains open.":
      "針對半導體技術白皮書、持久狀態契約權衡與企業 SharePoint 內容模型所構建的受治理工作台——圍繞著何種技術可被支援、何種指標必須驗證、以及何種邊界仍待探索。",
    "Read the whitepaper": "閱讀完整白皮書",
    "Open decision matrix": "開啟架構決策矩陣",
    "PUBLIC WORKING DRAFT": "公開工作草案",
    "Illustrative profiles are decision aids, not product specifications.":
      "展示設定檔僅作為架構決策輔助，非商業產品保證規格。",

    // SVG Map
    "Conceptual NVM state-contract map · not a physical floorplan":
      "概念性 NVM 狀態契約地圖 · 非物理佈局圖",
    "program once · verify always": "單次寫入 · 永久驗證",
    "rare updates · controlled owner": "極低更新 · 受控權威",
    "managed change · recovery path": "受控變更 · 復原路徑",
    "logs · repair · field learning": "運作日誌 · 修復 · 現場學習",
    "IDENTITY": "晶片身分",
    "CALIBRATION": "參數微調",
    "FIRMWARE": "安全韌體",
    "RAS STATE": "RAS 狀態",
    "IMMUTABLE": "不可竄改",
    "BOUNDED": "受限變更",
    "ADAPTIVE": "自適應",
    "OPERATIONAL": "運行維運",
    "NVM SELECTION": "NVM 決策矩陣",
    "STATE": "狀態",
    "CONTRACT": "契約",
    "EVIDENCE · SCOPE · LIMIT": "技術證據 · 範圍 · 邊界",

    // View Dock Tabs
    "EXPLORE THE WORKBENCH": "探索決策工作台",
    "Each view preserves evidence status and a SharePoint-ready content contract.":
      "每一種檢視皆完整保留技術證據狀態與 SharePoint 就緒內容契約。",
    "NVM Overview": "NVM 全貌總覽",
    "Technical Whitepaper": "技術白皮書閱讀器",
    "Decision Matrix": "架構決策矩陣",
    "SharePoint Taxonomy": "SharePoint 分類體系",
    "Content Templates": "技術內容範本",

    // Dynamic Panels & Whitepaper Chapters
    "Selecting NVM by State Contract, Process Boundary and Evidence":
      "依狀態契約、製程邊界與證據鏈進行 NVM 架構選型",
    "A public architecture guide for turning persistent-state requirements into defensible technology decisions":
      "一份將非揮發性持久狀態需求轉化為可辯護技術決策的公開架構指引",
    "Begin With the State Contract": "以狀態契約為決策起點",
    "Map Technology Families to the Contract": "將記憶體技術家族對齊狀態契約",
    "Treat Node Migration as an Integration Decision": "將製程節點微縮視為系統整合決策",
    "Make the Decision Evidence-Aware": "建立具備證據感知能力的架構決策",
    "Transfer the Knowledge, Not Just the Page": "沉澱轉移架構知識，而非僅交付頁面",
    "Start with the available voltage and device stack": "從可用電壓與元件堆疊出發",
    "Treat scaling as an integration-economics boundary": "將製程微縮視為整合經濟學邊界",
    "Decouple read supply from program infrastructure": "將讀取電源與燒錄基礎架構解耦",
    "Move from one macro to a distributed state architecture": "從單一巨集轉向分散式狀態架構",

    // Matrix & Tables
    "Technology Family": "技術家族",
    "State Contract Fit": "狀態契約適配性",
    "Typical Density": "典型容量密度",
    "Write Endurance": "寫入耐受度 (Endurance)",
    "Read Latency": "讀取延遲",
    "Key Trade-off": "核心權衡 (Trade-off)",
    "Evidence Level": "證據等級",
    "Silicon Proven": "矽驗證成熟 (Silicon Proven)",
    "Production Qualified": "量產認證 (Qualified)",
    "Exploratory": "前瞻探索 (Exploratory)",
    "Primary Locus": "權威所在 (Locus)",
    "Update Frequency": "更新頻率",
    "Retention Boundary": "保存期限邊界",
    "Recovery Contract": "故障復原契約",

    // Footer
    "PUBLIC WORKBENCH · EVIDENCE-GOVERNED · SHAREPOINT TRANSFER MODEL · 2026":
      "公開工作台 · 證據治理 · SHAREPOINT 轉移模型 · 2026"
  };

  let currentLang = (window.HubLanguage && window.HubLanguage.get()) || localStorage.getItem("nvm-hub-language") || "en";

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("hub-lang", lang);
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    document.body.dataset.language = lang;

    const btn = document.getElementById("languageToggle");
    if (btn) {
      btn.setAttribute("aria-label", lang === "zh" ? "切換至英文 Switch to English" : "Switch to Traditional Chinese");
      const zhB = btn.querySelector('[data-lang-option="zh"]');
      const enB = btn.querySelector('[data-lang-option="en"]');
      if (zhB && enB) {
        zhB.style.color = lang === "zh" ? "#73eee4" : "#8ea9b3";
        enB.style.color = lang === "en" ? "#73eee4" : "#8ea9b3";
      }
    }

    translateDom(document.body, lang);
  }

  function translateDom(root, lang) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.tagName === "SCRIPT" || parent.tagName === "STYLE") continue;

      const raw = node.nodeValue.trim();
      if (!raw) continue;

      if (lang === "zh") {
        if (!node._originalEn) {
          node._originalEn = node.nodeValue;
        }
        const orig = node._originalEn.trim();
        if (DICT[orig]) {
          node.nodeValue = node._originalEn.replace(orig, DICT[orig]);
        }
      } else {
        if (node._originalEn) {
          node.nodeValue = node._originalEn;
        }
      }
    }

    const svgTexts = root.querySelectorAll("text");
    svgTexts.forEach(function (st) {
      const raw = st.textContent.trim();
      if (lang === "zh") {
        if (!st._originalEn) st._originalEn = raw;
        if (DICT[st._originalEn]) {
          st.textContent = DICT[st._originalEn];
        }
      } else {
        if (st._originalEn) {
          st.textContent = st._originalEn;
        }
      }
    });

    const titled = root.querySelectorAll("[title]");
    titled.forEach(function (el) {
      const t = el.getAttribute("title");
      if (t && DICT[t]) {
        if (lang === "zh") {
          if (!el._origTitle) el._origTitle = t;
          el.setAttribute("title", DICT[t]);
        } else if (el._origTitle) {
          el.setAttribute("title", el._origTitle);
        }
      }
    });
  }

  function setupObserver() {
    const panels = document.querySelector(".studio-panels");
    if (!panels) return;

    const observer = new MutationObserver(function (mutations) {
      if (currentLang === "zh") {
        mutations.forEach(function (m) {
          m.addedNodes.forEach(function (n) {
            if (n.nodeType === 1) {
              translateDom(n, "zh");
            }
          });
        });
      }
    });

    observer.observe(panels, { childList: true, subtree: true });
  }

  function init() {
    const btn = document.getElementById("languageToggle");
    if (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        applyLanguage(currentLang === "zh" ? "en" : "zh");
      });
    }

    const tabBtns = document.querySelectorAll(".view-tab");
    tabBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        setTimeout(function () {
          if (currentLang === "zh") {
            translateDom(document.querySelector(".studio-panels"), "zh");
          }
        }, 80);
      });
    });

    setupObserver();

  // 接入全域頂層單一真相來源事件廣播
  window.addEventListener("hub:language-change", function(e) {
    if (e.detail && e.detail.language) {
      applyLanguage(e.detail.language);
    }
  });

    applyLanguage(currentLang);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
