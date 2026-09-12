"""
test_hub_integrity_v3.py — NVM Knowledge Hub V3.0 架構重構驗證
驗證三層知識架構、Knowledge Map Grid、導覽一致性、孤兒頁收編、語系完整性
"""
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PASS = 0
FAIL = 0

def test(name: str, condition: bool, detail: str = "") -> None:
    """執行單一測試斷言並記錄結果。"""
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  ✅ {name}")
    else:
        FAIL += 1
        print(f"  ❌ {name} — {detail}")


def run_tests() -> None:
    """執行所有測試。"""
    global PASS, FAIL

    # ===== TEST 1: 所有核心頁面存在 =====
    print("\n═══ TEST 1: 核心頁面存在性 ═══")
    REQUIRED_PAGES = [
        "index.html", "secure-storage.html", "security-assurance.html",
        "ai-nvm-opportunities.html", "iot-mcu-envm.html",
        "automotive-nvm.html", "specialty-nvm.html",
        "memory-physics.html", "memory-evidence.html",
        "technology-comparison.html", "oip-secure-storage.html",
        "briefing/index.html", "whitepaper/index.html",
    ]
    for page in REQUIRED_PAGES:
        test(f"Page exists: {page}", (BASE / page).exists(), f"not found")

    # ===== TEST 2: 首頁 Knowledge Map Grid =====
    print("\n═══ TEST 2: 首頁 Knowledge Map Grid ═══")
    ic = (BASE / "index.html").read_text(encoding="utf-8")
    test("無 deck-slide (Slide Deck 已移除)", "deck-slide" not in ic)
    test("無 module-tab-btn (Tab Strip 已移除)", "module-tab-btn" not in ic)
    test("km-grid class 存在", "km-grid" in ic or "knowledge-map" in ic)
    test("km-card class 存在", "km-card" in ic or "knowledge-row" in ic)
    test("Layer 1 Foundations", "foundations" in ic and ("LAYER 1" in ic or "01" in ic or "layer-foundations" in ic))
    test("Layer 2 Architecture", ("architecture" in ic or "layer-ip-process" in ic) and ("LAYER 2" in ic or "02" in ic))
    test("Layer 3 Applications", "applications" in ic and ("LAYER 3" in ic or "03" in ic))
    test("Resources", "resources" in ic.lower())

    km_links = re.findall(r'<a\s+[^>]*class="[^"]*(?:km-card|knowledge-row)[^"]*"[^>]*href="([^"#]+)(?:#[^"]*)?"', ic)
    for link in ["memory-physics.html", "technology-comparison.html",
                 "secure-storage.html", "security-assurance.html",
                 "ai-nvm-opportunities.html", "iot-mcu-envm.html",
                 "automotive-nvm.html", "specialty-nvm.html",
                 "whitepaper/", "briefing/index.html", "memory-evidence.html"]:
        test(f"Grid has {link}", link in km_links or any(link.rstrip('/') in x for x in km_links), f"missing {link}")

    # ===== TEST 3: 全局搜尋 =====
    print("\n═══ TEST 3: 全局搜尋 ═══")
    test("searchTrigger", "searchTrigger" in ic)
    test("searchOverlay", "searchOverlay" in ic)
    hub_js = (BASE / "hub.js").read_text(encoding="utf-8") if (BASE / "hub.js").exists() else ""
    search_ctrl = (BASE / "搜尋控制器.js").read_text(encoding="utf-8") if (BASE / "搜尋控制器.js").exists() else ""
    test("Ctrl+K binding", 'key === "k"' in ic or "key === 'k'" in ic or 'key === "k"' in hub_js or '=== \'k\'' in search_ctrl)
    test("SEARCH_INDEX", "SEARCH_INDEX" in ic or "SEARCH_INDEX" in hub_js)

    # ===== TEST 4: 導覽一致性 =====
    print("\n═══ TEST 4: 導覽一致性 ═══")
    for page in ["secure-storage.html", "ai-nvm-opportunities.html",
                  "iot-mcu-envm.html", "specialty-nvm.html",
                  "memory-physics.html", "automotive-nvm.html",
                  "technology-comparison.html"]:
        p = BASE / page
        if not p.exists(): continue
        c = p.read_text(encoding="utf-8")
        test(f"{page} → automotive link", "automotive-nvm.html" in c)
        test(f"{page} → comparison link", "technology-comparison.html" in c)

    # ===== TEST 5: 語系 =====
    print("\n═══ TEST 5: 首頁語系雙軌 ═══")
    zh = len(re.findall(r'data-lang="zh"', ic))
    en = len(re.findall(r'data-lang="en"', ic))
    test(f"中英文平衡 (zh={zh}, en={en})", zh > 0 and en > 0 and abs(zh - en) < 10)
    test("site-language.js 引用", "site-language.js" in ic)

    # ===== TEST 6: Skip Link =====
    print("\n═══ TEST 6: Skip Link ═══")
    test("首頁 skip-link", "skip-link" in ic)
    for page in ["automotive-nvm.html", "technology-comparison.html"]:
        if (BASE / page).exists():
            test(f"{page} skip-link", "skip-link" in (BASE / page).read_text(encoding="utf-8"))

    # ===== TEST 7: Spec Drawer 移除 =====
    print("\n═══ TEST 7: Spec Drawer 移除 ═══")
    test("無 specDrawer", "specDrawer" not in ic and "spec-drawer" not in ic)

    # ===== TEST 8: 孤兒頁收編與 Breadcrumb 驗證 =====
    print("\n═══ TEST 8: 孤兒頁收編與 Breadcrumb 驗證 ═══")
    ev_c = (BASE / "memory-evidence.html").read_text(encoding="utf-8")
    test("memory-evidence 父層指向 memory-physics", "memory-physics.html" in ev_c and "Evidence Ledger" in ev_c)

    as_c = (BASE / "security-assurance.html").read_text(encoding="utf-8")
    test("security-assurance 父層指向 secure-storage", "secure-storage.html" in as_c and "Security Assurance" in as_c)

    oip_c = (BASE / "oip-secure-storage.html").read_text(encoding="utf-8")
    test("oip-secure-storage 標記展會版 (Event Edition)", "Event Edition" in oip_c or "EVENT EDITION" in oip_c)

    # ===== TEST 9: hub.js 模組重構驗證 =====
    print("\n═══ TEST 9: hub.js 模組重構驗證 ═══")
    hub_js = (BASE / "hub.js").read_text(encoding="utf-8")
    test("hub.js 包含 SEARCH_INDEX", "SEARCH_INDEX" in hub_js)
    test("hub.js 包含 Ctrl+K 搜尋監聽", 'key === "k"' in hub_js)
    test("hub.js 無 TOTAL_SLIDES 舊遺留", "TOTAL_SLIDES" not in hub_js)
    test("hub.js 無 switchSlide 舊遺留", "switchSlide" not in hub_js)

    # ===== TEST 10: F2/M2/M3 旗艦互動實驗室與企業識別驗證 =====
    print("\n═══ TEST 10: F2/M2/M3 旗艦互動實驗室與企業識別驗證 ═══")
    tc_c = (BASE / "technology-comparison.html").read_text(encoding="utf-8")
    test("F2 包含選型決策器 (selNode, matchResultsDeck)", "selNode" in tc_c and "matchResultsDeck" in tc_c)
    test("F2 包含 7 維度比較矩陣 (compare-matrix)", "compare-matrix" in tc_c and "AntiFuse OTP" in tc_c)

    iot_c = (BASE / "iot-mcu-envm.html").read_text(encoding="utf-8")
    test("M2 包含 0.5V NTV 模擬畫布 (ntvCanvas)", "ntvCanvas" in iot_c and "ntvVdd" in iot_c)
    test("M2 包含 TSMC 微縮 Stepper (roadmap-stepper)", "roadmap-stepper" in iot_c)
    test("M2 包含 Vector Patch CAM 模擬器 (camTriggerBtn)", "camTriggerBtn" in iot_c and "camOtpState" in iot_c)

    auto_c = (BASE / "automotive-nvm.html").read_text(encoding="utf-8")
    test("M3 包含 175°C 微絲熱老化畫布 (thermalCanvas)", "thermalCanvas" in auto_c and "tempSlider" in auto_c)
    test("M3 包含 SECDED ECC 測試台 (eccBitsDeck)", "eccBitsDeck" in auto_c and "eccStatusPill" in auto_c)
    test("M3 包含晶圓認證三道門禁 (gate-stepper)", "gate-stepper" in auto_c and "GATE 01" in auto_c)

    # ===== TEST 11: Whitepaper Decision Studio 內容完整度與 SSR 預渲染驗證 =====
    print("\n═══ TEST 11: Whitepaper Decision Studio 完整性 ═══")
    wp_c = (BASE / "whitepaper" / "index.html").read_text(encoding="utf-8")
    for pid in ["panel-overview", "panel-whitepaper", "panel-selector", "panel-taxonomy", "panel-templates"]:
        test(f"Whitepaper 包含非空 #{pid}", f'id="{pid}"' in wp_c and f'class="studio-panel"' in wp_c)
    test("Whitepaper 包含 5 大完整章節 (chap-state-contract 等)", "chap-state-contract" in wp_c and "chap-enterprise-transfer" in wp_c)
    test("Whitepaper 包含決策矩陣資料表 (decision-table)", "decision-table" in wp_c)
    test("Whitepaper 包含技術範本卡片 (template-card)", "template-card" in wp_c)
    test("Whitepaper 包含 SharePoint 分類架構", "SharePoint" in wp_c and "taxonomy" in wp_c)

    # ===== TEST 12: F2/M2/M3 Quality Gates 嚴格驗收 (Nav Pills, 4-Metric Strip, Physics Formulas) =====
    print("\n═══ TEST 12: F2/M2/M3 Quality Gates 嚴格驗收 ═══")
    for name, content in [("F2", tc_c), ("M2", iot_c), ("M3", auto_c)]:
        test(f"{name} 包含頂部快速跳轉藥丸列 (hub-nav-pills)", "hub-nav-pills" in content and "nav-pill" in content)
        test(f"{name} 包含 4-Metric 規格彩條 (stat-strip-grid)", "stat-strip-grid" in content and "border-l-cyan" in content and "pulse-chip-mini" in content)
        test(f"{name} 包含 第一性原理物理公式 (formula-box-math)", "formula-box-math" in content)

    test("F2 包含 5 軸動態雷達圖 (selectorRadarCanvas)", "selectorRadarCanvas" in tc_c)
    test("M2 包含 CAM 匯流排動態畫布 (camCanvas)", "camCanvas" in iot_c)
    test("M3 包含 72-bit SECDED 漢明碼矩陣 (ecc-bit-node)", "ecc-bit-node" in auto_c)

    # ===== TEST 13: 白底輕盈排版 (Editorial Light Theme) 與旗艦級 Footer 驗證 =====
    print("\n═══ TEST 13: 白底輕盈排版與旗艦 Footer 驗證 ═══")
    shell_css = (BASE / "site-shell.css").read_text(encoding="utf-8")
    test("site-shell.css 包含旗艦 hub-footer 完整樣式", "footer.hub-footer" in shell_css and "hub-footer-nav-grid" in shell_css)

    spec_c = (BASE / "specialty-nvm.html").read_text(encoding="utf-8")
    f1_c = (BASE / "memory-physics.html").read_text(encoding="utf-8")
    for name, content in [("F1", f1_c), ("F2", tc_c), ("M2", iot_c), ("M3", auto_c), ("M4", spec_c)]:
        test(f"{name} 採用旗艦半導體視覺基底 (Obsidian / Light)", "background-color: #f8fafc" in content or "background-color: #061925" in content or "background-color: #08090a" in content or "background-color: var(--bg-deep)" in content)
        test(f"{name} 包含旗艦級 Footer 品牌識徽 (hub-footer-logo-mark)", "hub-footer-logo-mark" in content)
        test(f"{name} 包含 4 欄階層導覽 (hub-footer-nav-grid)", "hub-footer-nav-grid" in content)
        test(f"{name} 包含技術標籤彩條 (hub-footer-badge-strip)", "hub-footer-badge-strip" in content)

    test("M2 包含 Section 5 MCU 狀態契約架構 (sec-contracts)", "id=\"sec-contracts\"" in iot_c and "mcu-contracts-title" in iot_c)
    test("M3 包含 ASIL-D 故障率指標矩陣表 (ISO 26262 ASIL-D)", "ISO 26262 ASIL-D" in auto_c and "CONTRACT 01" in auto_c and "CONTRACT 03" in auto_c)

    # ===== TEST 14: M2 專屬視覺與 DOM 拓撲防禦斷言 (Anti-Pollution & Topology) =====
    print("\n═══ TEST 14: M2 專屬視覺與 DOM 拓撲防禦斷言 ═══")
    test("M2 頁面絕不包含 secure-storage-hero-key.webp", "secure-storage-hero-key.webp" not in iot_c)
    test("M2 頁面包含專屬 iot-mcu-hero.jpg 裸晶視覺圖引用", "iot-mcu-hero.jpg" in iot_c)
    
    hero_pos = iot_c.find('<section class="hero"')
    stat_pos = iot_c.find('class="stat-strip-grid"')
    pills_pos = iot_c.find('class="hub-nav-pills"')
    thesis_pos = iot_c.find('<section id="thesis"')
    test("M2 DOM 拓撲順序正確 (Hero ➔ Stat Strip ➔ Nav Pills ➔ Thesis)",
         0 < hero_pos < stat_pos < pills_pos < thesis_pos)

    # ===== TEST 15: Header Unify 一致性與 IoT 大小寫標準識別驗證 =====
    print("\n═══ TEST 15: Header Unify 一致性與 IoT 大小寫標準識別驗證 ═══")
    test("site-shell.css 包含 .brand-section nowrap 強制防折行",
         "white-space: nowrap !important" in shell_css)
    test("site-shell.css 包含 site-header auto 1fr auto 統一規格",
         "grid-template-columns: auto 1fr auto !important" in shell_css)
    test("M2 頂列 brand-section 為標準識別 ULP IoT & MCU",
         "ULP IoT &amp; MCU" in iot_c and "ULP IOT &amp; MCU" not in iot_c)
    test("M2 Hero Eyebrow 為標準識別 ULP IoT & EDGE MCU",
         "ULP IoT &amp; EDGE MCU" in iot_c and "ULP IOT &amp; EDGE MCU" not in iot_c)
    test("Secure Storage app-card 為標準識別 IoT / CONNECTIVITY",
         "IoT / CONNECTIVITY" in (BASE / "secure-storage.html").read_text(encoding="utf-8"))

    # ===== TEST 16: F2 專屬主視覺圖與白底輕盈配色整合驗證 =====
    print("\n═══ TEST 16: F2 專屬主視覺圖與白底輕盈配色整合驗證 ═══")
    test("F2 包含專屬 1600/900 webp 主視覺圖標籤",
         "technology-comparison-hero-1600.webp" in tc_c and "technology-comparison-hero-900.webp" in tc_c)
    test("F2 主視覺圖實體檔案存在",
         (BASE / "assets" / "technology-comparison-hero-1600.webp").exists() and
         (BASE / "assets" / "technology-comparison-hero-900.webp").exists())
    test("F2 包含 f2-stat-bridge 與純白規格彩條",
         "f2-stat-bridge" in tc_c and ".stat-strip-card {" in tc_c)
    test("F2 包含 selector-workbench-frame 半導體儀表框",
         "selector-workbench-frame" in tc_c)

    # ===== TEST 17: M3 車規專屬主視覺圖與白底輕盈配色整合驗證 =====
    print("\n═══ TEST 17: M3 車規專屬主視覺圖與白底輕盈配色整合驗證 ═══")
    test("M3 包含專屬 1600/900 webp 主視覺圖標籤",
         "automotive-nvm-hero-1600.webp" in auto_c and "automotive-nvm-hero-900.webp" in auto_c)
    test("M3 主視覺圖實體檔案存在",
         (BASE / "assets" / "automotive-nvm-hero-1600.webp").exists() and
         (BASE / "assets" / "automotive-nvm-hero-900.webp").exists())
    test("M3 包含 m3-stat-bridge 與純白規格彩條",
         "m3-stat-bridge" in auto_c and ".stat-strip-card {" in auto_c)
    test("M3 包含 lab-box 半導體儀表框與超寬工作台",
         "lab-box" in auto_c and "min(1780px, 97vw)" in auto_c)

    # ===== TEST 18: 0 MASK ADDERS 規格彩條對比度防融合驗證 =====
    print("\n═══ TEST 18: 0 MASK ADDERS 規格彩條對比度防融合驗證 ═══")
    test("F2 解耦 compact-ate-strip 防止黑底覆寫",
         'class="stat-strip-grid compact-ate-strip"' not in tc_c)
    test("F2 包含 .f2-stat-bridge .stat-val 高特異度對比規則",
         ".f2-stat-bridge .stat-val" in tc_c)
    test("M3 解耦 compact-ate-strip 防止黑底覆寫",
         'class="stat-strip-grid compact-ate-strip"' not in auto_c)
    test("specialty-nvm.css compact-ate-strip 具備防禦 scoping",
         ":not(.f2-stat-bridge *):not(.m3-stat-bridge *)" in (BASE / "specialty-nvm.css").read_text(encoding="utf-8"))

    # ===== TEST 19: M3 Executive Studio Workbench 與直立測條架構驗證 =====
    print("\n═══ TEST 19: M3 Executive Studio Workbench 與直立測條架構驗證 ═══")
    test("M3 包含 studio-workbench-wrapper 與 studio-layout 雙欄容器",
         "studio-workbench-wrapper" in auto_c and "studio-layout" in auto_c)
    test("M3 包含 lens-vertical-rail 直立半導體測條",
         "lens-vertical-rail" in auto_c)
    test("M3 包含 lens-stage-container 工作台舞台",
         "lens-stage-container" in auto_c)
    test("M3 直立測條包含 4 個章節跳轉節點 (lens-node-item)",
         auto_c.count("lens-node-item") >= 4)

    # ===== TEST 20: F1 Memory Physics 專屬主視覺、Stat Bridge 與旗艦結構驗證 =====
    print("\n═══ TEST 20: F1 Memory Physics 專屬主視覺、Stat Bridge 與旗艦結構驗證 ═══")
    test("F1 包含專屬 1600/900 webp 主視覺圖標籤",
         "memory-physics-hero-1600.webp" in f1_c and "memory-physics-hero-900.webp" in f1_c)
    test("F1 主視覺圖實體檔案存在",
         (BASE / "assets" / "memory-physics-hero-1600.webp").exists() and
         (BASE / "assets" / "memory-physics-hero-900.webp").exists())
    test("F1 包含 f1-stat-bridge 與 4 項規格彩條 (RULE #01 ~ #04)",
         "f1-stat-bridge" in f1_c and "RULE #01" in f1_c and "RULE #04" in f1_c)
    test("F1 包含 Bento 數據指標卡片 (bento-metric-card)",
         "bento-metric-card" in f1_c and "bento-hero-metrics" in f1_c)
    test("F1 包含旗艦級 Footer (hub-footer) 與 4 欄導覽 (hub-footer-nav-grid)",
         "hub-footer" in f1_c and "hub-footer-nav-grid" in f1_c)

    # ===== TEST 21: 全站 17 頁 HTML Head 元資料、Favicon 與無障礙雙語全域驗證 =====
    print("\n═══ TEST 21: 全站 17 頁 HTML Head 元資料、Favicon 與無障礙雙語全域驗證 ═══")
    ALL_SURFACES = [
        "index.html", "NVM技術全景.html", "NVM技術全景中文.html", "secure-storage.html",
        "security-assurance.html", "ai-nvm-opportunities.html", "iot-mcu-envm.html",
        "automotive-nvm.html", "specialty-nvm.html", "memory-physics.html",
        "memory-evidence.html", "technology-comparison.html", "oip-secure-storage.html",
        "404.html", "briefing/index.html", "whitepaper/index.html", "tools/whitepaper-studio/index.html"
    ]
    test("全站 17 個公開頁面實體存在", all((BASE / p).exists() for p in ALL_SURFACES))
    for p in ALL_SURFACES:
        p_path = BASE / p
        if not p_path.exists():
            continue
        p_text = p_path.read_text(encoding="utf-8")
        test(f"{p} 包含 favicon.svg 識徽連結", "favicon.svg" in p_text)
        test(f"{p} 包含響應式 viewport 與 charset", "viewport" in p_text and "charset" in p_text)
        sliders = re.findall(r'<input[^>]*type=[\x22\x27]range[\x22\x27][^>]*>', p_text)
        for s in sliders:
            test(f"{p} 滑桿控制項包含 aria-label", "aria-label=" in s)
        skip_match = re.search(r'<a class=[\x22\x27]skip-link[\x22\x27][^>]*>([\s\S]*?)</a>', p_text)
        if skip_match:
            test(f"{p} 快速跳轉連結具備雙語 data-lang 標籤", 'data-lang="zh"' in skip_match.group(1) and 'data-lang="en"' in skip_match.group(1))
        menu_match = re.search(r'<button[^>]*id=[\x22\x27]menuToggle[\x22\x27][^>]*>', p_text)
        if menu_match:
            s = menu_match.group(0)
            test(f"{p} 漢堡選單包含動態無障礙 data-aria-zh/en 屬性", 'data-aria-zh="開啟選單"' in s and 'data-aria-en="Open menu"' in s)

    # ===== TEST 22: 全站麵包屑雙語與動態頁面元資料全域防禦驗證 =====
    print("\n═══ TEST 22: 全站麵包屑雙語與動態頁面元資料全域防禦驗證 ═══")
    BILINGUAL_DYNAMIC_PAGES = [
        "index.html", "secure-storage.html", "security-assurance.html", "ai-nvm-opportunities.html",
        "iot-mcu-envm.html", "automotive-nvm.html", "specialty-nvm.html", "memory-physics.html",
        "memory-evidence.html", "technology-comparison.html", "oip-secure-storage.html",
        "404.html", "briefing/index.html", "whitepaper/index.html", "tools/whitepaper-studio/index.html"
    ]
    for p in BILINGUAL_DYNAMIC_PAGES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        html_m = re.search(r'<html\b([^>]*)>', p_text, re.IGNORECASE)
        test(f"{p} 根標籤具備雙語標題與描述資料 (data-title / data-description)",
             html_m is not None and 'data-title-en=' in html_m.group(1) and 'data-title-zh=' in html_m.group(1)
             and 'data-description-en=' in html_m.group(1) and 'data-description-zh=' in html_m.group(1))

        bc_m = re.search(r'<nav[^>]*class=[\x22\x27][^>]*breadcrumb[^>]*[\x22\x27][^>]*>([\s\S]*?)</nav>', p_text, re.IGNORECASE)
        if bc_m:
            bc_inner = bc_m.group(1)
            test(f"{p} 麵包屑導覽包含完整的雙語語意標籤 (data-lang zh/en)",
                 'data-lang="zh"' in bc_inner and 'data-lang="en"' in bc_inner)

    # ===== TEST 23: 全站互動元件、滑桿與導覽 ARIA 動態雙語無障礙完整度驗證 =====
    print("\n═══ TEST 23: 全站互動元件、滑桿與導覽 ARIA 動態雙語無障礙完整度驗證 ═══")
    # 1. 驗證全站所有 range 滑桿均具備 data-aria-zh 與 data-aria-en
    total_sliders = 0
    for p in BILINGUAL_DYNAMIC_PAGES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        sliders = re.findall(r'<input[^>]*type=[\x22\x27]range[\x22\x27][^>]*>', p_text)
        for s in sliders:
            total_sliders += 1
            test(f"{p} 滑桿具備雙語無障礙 data-aria-zh/en 屬性",
                 'data-aria-zh=' in s and 'data-aria-en=' in s)
    test("全站共計驗證 10 組互動滑桿無障礙雙語屬性", total_sliders == 10)

    # 2. 驗證所有具備麵包屑的頁面其 nav 標籤具備雙語 ARIA
    total_bcs = 0
    for p in BILINGUAL_DYNAMIC_PAGES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        bcs = re.findall(r'<nav[^>]*class=[\x22\x27][^>]*breadcrumb[^>]*[\x22\x27][^>]*>', p_text, re.IGNORECASE)
        for bc in bcs:
            total_bcs += 1
            test(f"{p} 麵包屑導覽具備雙語 ARIA 標籤 (Breadcrumb / 麵包屑導覽)",
                 'data-aria-zh="麵包屑導覽"' in bc and 'data-aria-en="Breadcrumb"' in bc)
    test("全站共計驗證 13 處麵包屑導覽雙語 ARIA 屬性", total_bcs >= 13)

    # 3. 驗證全站 15 個動態頁面之靜態 aria-label 100% 具備雙語支援
    for p in BILINGUAL_DYNAMIC_PAGES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        tags = re.findall(r'(<[a-zA-Z0-9\-]+[^>]*?aria-label="[^"]*"[^>]*?>)', p_text, re.DOTALL)
        missing_count = 0
        for tag in tags:
            if 'id="languageToggle"' in tag or "id='languageToggle'" in tag:
                continue
            if 'data-aria-zh' not in tag or 'data-aria-en' not in tag:
                missing_count += 1
        test(f"{p} 所有具備 aria-label 的元件 100% 具備動態雙語 data-aria-zh/en", missing_count == 0)

    # ===== TEST 24: 全站 SEO / Canonical / Open Graph / Twitter Cards 與圖片零 CLS 完整性驗證 =====
    print("\n═══ TEST 24: 全站 SEO / Canonical / Open Graph / Twitter Cards 與圖片零 CLS 完整性驗證 ═══")
    ALL_INDEXABLE_PAGES = [
        "index.html", "NVM技術全景.html", "NVM技術全景中文.html", "secure-storage.html",
        "security-assurance.html", "ai-nvm-opportunities.html", "iot-mcu-envm.html",
        "automotive-nvm.html", "specialty-nvm.html", "memory-physics.html",
        "memory-evidence.html", "technology-comparison.html", "oip-secure-storage.html",
        "briefing/index.html", "whitepaper/index.html", "tools/whitepaper-studio/index.html"
    ]
    # 1. 驗證 16 個公開頁面具備 canonical 與社群分享元資料
    for p in ALL_INDEXABLE_PAGES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        test(f"{p} 具備標準 Canonical 標籤", '<link rel="canonical"' in p_text)
        test(f"{p} 具備 Open Graph 完整元資料 (type/site_name/url/title/description/image)",
             'property="og:type"' in p_text and 'property="og:site_name"' in p_text and
             'property="og:url"' in p_text and 'property="og:title"' in p_text and
             'property="og:description"' in p_text and 'property="og:image"' in p_text)
        test(f"{p} 具備 Twitter Card 完整元資料 (card/title/description/image)",
             'name="twitter:card"' in p_text and 'name="twitter:title"' in p_text and
             'name="twitter:description"' in p_text and 'name="twitter:image"' in p_text)

    # 2. 驗證全站所有圖片具備 loading, width, height, decoding 與雙語 data-alt 屬性 (零 CLS 防禦)
    total_imgs = 0
    missing_loading = 0
    missing_dimensions = 0
    missing_decoding = 0
    missing_bilingual_alt = 0

    for p in ALL_SURFACES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        imgs = re.findall(r'<img\b[^>]*>', p_text, re.IGNORECASE)
        for img in imgs:
            total_imgs += 1
            if "loading=" not in img:
                missing_loading += 1
            if "width=" not in img or "height=" not in img:
                missing_dimensions += 1
            if 'decoding="async"' not in img:
                missing_decoding += 1
            if 'data-alt-en=' not in img or 'data-alt-zh=' not in img:
                missing_bilingual_alt += 1

    test(f"全站圖片總數符合預期 (共計 {total_imgs} 張圖片)", total_imgs == 13)
    test("全站所有 <img> 標籤皆具備 loading 屬性 (eager/lazy 規範)", missing_loading == 0)
    test("全站所有 <img> 標籤皆具備 width 與 height 屬性 (零 CLS 佈局位移防禦)", missing_dimensions == 0)
    test("全站所有 <img> 標籤皆具備 decoding='async' 非同步解碼優化", missing_decoding == 0)
    test("全站所有 <img> 標籤皆具備 data-alt-en 與 data-alt-zh 雙語動態支援", missing_bilingual_alt == 0)

    # ===== TEST 25: 全站 JSON-LD 結構化資料、統一 Main 地標、鍵盤區域無障礙與列印規範驗證 =====
    print("\n═══ TEST 25: 全站 JSON-LD 結構化資料、統一 Main 地標、鍵盤區域無障礙與列印規範驗證 ═══")
    # 1. 驗證全站 16 個公開主要頁面 100% 具備合規 JSON-LD 結構化資料
    for p in ALL_INDEXABLE_PAGES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        ld_m = re.search(r'<script type=[\x22\x27]application/ld\+json[\x22\x27]>([\s\S]*?)</script>', p_text)
        test(f"{p} 包含合規 JSON-LD 結構化資料腳本", ld_m is not None)

    # 2. 驗證全站 17 個頁面 100% 統一具備 <main id="main-content"> 與跳轉目標
    for p in ALL_SURFACES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        test(f"{p} 具備標準語意地標 <main id=\"main-content\">",
             bool(re.search(r'<main\b[^>]*id=[\x22\x27]main-content[\x22\x27]', p_text)))
        test(f"{p} 具備指向 #main-content 之跳轉連結",
             'href="#main-content"' in p_text)

    # 3. 驗證橫向捲動表格容器皆具備鍵盤可訪問性 (tabindex="0" 與 role="region")
    TABLE_PAGES = ["automotive-nvm.html", "specialty-nvm.html", "memory-physics.html", "whitepaper/index.html"]
    for p in TABLE_PAGES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        test(f"{p} 包含鍵盤可聚焦的捲動表格容器 (tabindex=0 與 role=region)",
             'tabindex="0"' in p_text and 'role="region"' in p_text)

    # 4. 驗證 site-shell.css 與 hub.css 具備 @media print 高保真列印樣式
    shell_css = (BASE / "site-shell.css").read_text(encoding="utf-8")
    hub_css = (BASE / "hub.css").read_text(encoding="utf-8")
    test("site-shell.css 包含完整的 @media print 高保真列印樣式", "@media print" in shell_css and "break-inside: avoid" in shell_css)
    test("hub.css 包含 @media print 列印防護規則", "@media print" in hub_css)

    # ===== TEST 26: 全站 PWA WebManifest、100% SVG 無障礙規範與語系切換語音播報驗證 =====
    print("\n═══ TEST 26: 全站 PWA WebManifest、100% SVG 無障礙規範與語系切換語音播報驗證 ═══")
    # 1. 驗證全站 17 個頁面 100% 具備 PWA WebManifest 連結
    for p in ALL_SURFACES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        test(f"{p} 包含 PWA WebManifest 連結 (rel=\"manifest\")",
             'rel="manifest"' in p_text or "rel='manifest'" in p_text)

    # 2. 驗證全站所有 SVG 標籤皆具備可訪問性定義 (aria-hidden/aria-label/role)
    total_svgs = 0
    missing_svg_a11y = 0
    for p in ALL_SURFACES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        svgs = re.findall(r'<svg\b([^>]*)>', p_text, re.IGNORECASE)
        total_svgs += len(svgs)
        for attrs in svgs:
            has_a11y = ('aria-hidden=' in attrs or 'aria-label=' in attrs or
                        'aria-labelledby=' in attrs or 'role=' in attrs)
            if not has_a11y:
                missing_svg_a11y += 1

    test(f"全站 SVG 總數符合規模 (共計 {total_svgs} 個向量圖形元件)", total_svgs >= 1000)
    test("全站所有 <svg> 標籤 100% 具備無障礙定義 (aria-hidden/label/role，零無標籤視覺噪音)", missing_svg_a11y == 0)

    # 3. 驗證 site-language.js 具備動態語音播報器 (aria-live polite announcer)
    sl_text = (BASE / "site-language.js").read_text(encoding="utf-8")
    test("site-language.js 包含 aria-live='polite' 語音即時廣播器 (hubLanguageAnnouncer)",
         "hubLanguageAnnouncer" in sl_text and 'aria-live' in sl_text)

    print(f"\n{'='*60}")
    print(f"  TOTAL: {PASS + FAIL}  |  ✅ PASS: {PASS}  |  ❌ FAIL: {FAIL}")
    print(f"{'='*60}")
    return FAIL == 0

if __name__ == "__main__":
    exit(0 if run_tests() else 1)

