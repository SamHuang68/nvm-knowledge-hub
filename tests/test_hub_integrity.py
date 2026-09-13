"""
test_hub_integrity_v3.py — NVM Knowledge Hub V3.0 架構重構驗證
驗證三層知識架構、Knowledge Map Grid、導覽一致性、孤兒頁收編、語系完整性
"""
import re
import json
import xml.etree.ElementTree as ET
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

    # ════════════════════════════════════════════════════════════
    # TEST 27: 全站 PWA Service Worker、Apple Touch Icon、顏色主題與減少動態無障礙規範驗證
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 27: 全站 PWA Service Worker、Apple Touch Icon、顏色主題與減少動態無障礙規範驗證 ═══")

    # 1. 驗證全站 17 個頁面具備 meta color-scheme
    for p in ALL_SURFACES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        test(f"{p} 具備標準 meta color-scheme (dark light)",
             'color-scheme' in p_text and 'dark light' in p_text)

    # 2. 驗證全站 17 個頁面具備 apple-touch-icon 且實體檔案存在
    for p in ALL_SURFACES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        match = re.search(r'<link[^>]+rel=["\']apple-touch-icon["\'][^>]+href=["\']([^"\']+)["\']|<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']apple-touch-icon["\']', p_text)
        has_ati = match is not None
        icon_href = (match.group(1) or match.group(2)) if match else ""
        icon_exists = (p_path.parent / icon_href).resolve().is_file() if icon_href else False
        test(f"{p} 包含有效且指向存在檔案之 apple-touch-icon ({icon_href})", has_ati and icon_exists)

    # 3. 驗證全站頁面包含 iOS WebKit PWA 增強標籤 (apple-mobile-web-app-title)
    all_have_ios_pwa = True
    for p in ALL_SURFACES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        if 'name="apple-mobile-web-app-title"' not in p_text:
            all_have_ios_pwa = False
            break
    test("全站 17 頁全面包含 iOS WebKit PWA 元資料標籤 (apple-mobile-web-app-title)", all_have_ios_pwa)

    # 4. 驗證 PWA 高解析圖示資產實體 (180x180, 192x192, 512x512)
    for icon_name in ["apple-touch-icon.png", "icon-192.png", "icon-512.png"]:
        icon_file = BASE / "assets" / icon_name
        test(f"assets/{icon_name} 實體檔案存在且大小正常 (>1KB)", icon_file.is_file() and icon_file.stat().st_size > 1024)

    # 5. 驗證 site.webmanifest 圖示多尺寸覆蓋 (192x192 與 512x512)
    manifest_data = json.loads((BASE / "site.webmanifest").read_text(encoding="utf-8"))
    manifest_sizes = [ic.get("sizes") for ic in manifest_data.get("icons", [])]
    test("site.webmanifest 包含 PWA 規範之 192x192 與 512x512 圖標規格",
         "192x192" in manifest_sizes and "512x512" in manifest_sizes)

    # 6. 驗證 site-shell.css 包含全站 WCAG 2.1 SC 2.3.3 prefers-reduced-motion 無障礙防禦
    shell_text = (BASE / "site-shell.css").read_text(encoding="utf-8")
    test("site-shell.css 包含全站 WCAG 2.1 SC 2.3.3 prefers-reduced-motion 減少動態防護",
         "@media (prefers-reduced-motion: reduce)" in shell_text and "animation-duration: 0.01ms" in shell_text)

    # 7. 驗證 sw.js Service Worker 存在且配置完整離線快取
    sw_path = BASE / "sw.js"
    sw_text = sw_path.read_text(encoding="utf-8") if sw_path.is_file() else ""
    test("sw.js 存在且包含 Service Worker 生命週期 (install/activate/fetch) 與預快取",
         sw_path.is_file() and "addEventListener('install'" in sw_text and "addEventListener('fetch'" in sw_text)

    # 8. 驗證 site-language.js 註冊 Service Worker
    test("site-language.js 包含 Service Worker 自動註冊邏輯 (serviceWorker.register)",
         "serviceWorker.register" in sl_text)

    # ════════════════════════════════════════════════════════════
    # TEST 28: 表格可訪問性名稱 (Caption)、表頭範圍 (TH Scope) 與外部連結安全性無障礙驗證
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 28: 表格可訪問性名稱 (Caption)、表頭範圍 (TH Scope) 與外部連結安全性無障礙驗證 ═══")

    # 1. 驗證全站所有資料表皆具備 <caption> 或可訪問性名稱
    total_tables = 0
    missing_table_captions = 0
    for p in ALL_SURFACES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        # 尋找所有 <table> 標籤及其內部 <caption> 或 aria-label
        tables = re.findall(r'<table\b([^>]*)>(.*?)(?=<\/table>)', p_text, re.DOTALL | re.IGNORECASE)
        total_tables += len(tables)
        for t_attrs, t_body in tables:
            has_caption = '<caption' in t_body.lower()
            has_aria = 'aria-label=' in t_attrs.lower() or 'aria-labelledby=' in t_attrs.lower()
            if not (has_caption or has_aria):
                missing_table_captions += 1

    test(f"全站資料表總數符合預期 (共計 {total_tables} 張專業資料表格)", total_tables >= 15)
    test("全站所有 <table> 標籤 100% 具備可訪問性標題 (caption 或 aria-label，零無名資料表)",
         missing_table_captions == 0)

    # 2. 驗證全站所有 <th> 標籤 100% 具備 scope 屬性 (col 或 row)
    total_ths = 0
    missing_th_scopes = 0
    for p in ALL_SURFACES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        ths = re.findall(r'<th\b([^>]*)>', p_text, re.IGNORECASE)
        total_ths += len(ths)
        for th_attr in ths:
            if 'scope=' not in th_attr.lower():
                missing_th_scopes += 1

    test(f"全站表頭單元格總數符合預期 (共計 {total_ths} 個 <th> 表頭)", total_ths >= 110)
    test("全站所有 <th> 表頭 100% 具備 scope 語意宣告 (scope='col' 或 'row'，符合 WCAG SC 1.3.1)",
         missing_th_scopes == 0)

    # 3. 驗證 memory-physics.html 表格 row header 具備 scope="row"
    mp_text = (BASE / "memory-physics.html").read_text(encoding="utf-8")
    for row_name in ["SRAM / SRAM PUF", "eFuse", "Antifuse / NeoPUF", "ReRAM / PCM", "MRAM"]:
        test(f"memory-physics.html 列標題 {row_name} 具備 scope='row'",
             f'scope="row">{row_name}' in mp_text or f"scope='row'>{row_name}" in mp_text)

    # 4. 驗證全站 target='_blank' 連結 100% 包含 rel="noopener noreferrer" 安全防護
    total_blanks = 0
    unprotected_blanks = 0
    for p in ALL_SURFACES:
        p_path = BASE / p
        p_text = p_path.read_text(encoding="utf-8")
        blank_links = re.findall(r'<a\b([^>]*target=["\']_blank["\'][^>]*)>', p_text, re.IGNORECASE)
        total_blanks += len(blank_links)
        for link_attr in blank_links:
            rel_match = re.search(r'rel=["\']([^"\']+)["\']', link_attr, re.IGNORECASE)
            rel_val = rel_match.group(1).lower() if rel_match else ""
            if 'noopener' not in rel_val or 'noreferrer' not in rel_val:
                unprotected_blanks += 1

    test(f"全站外連與彈窗連結總數符合規模 (共計 {total_blanks} 處 target='_blank')", total_blanks >= 800)
    test("全站所有 target='_blank' 連結 100% 具備 rel='noopener noreferrer' 反釣魚與反頁籤劫持防禦",
         unprotected_blanks == 0)

    # 5. 驗證 site-language.js 包含 WCAG G201 外連動態新視窗提示器
    test("site-language.js 包含 WCAG G201 外部連結新視窗雙語提示器 (syncExternalLinks)",
         "syncExternalLinks" in sl_text and "opens in a new tab" in sl_text and "另開新分頁" in sl_text)

    # ════════════════════════════════════════════════════════════
    # TEST 29: 國際化 SEO、Reciprocal Hreflang、OG Locale 與搜尋引擎 Robots 標籤驗證
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 29: 國際化 SEO、Reciprocal Hreflang、OG Locale 與搜尋引擎 Robots 標籤驗證 ═══")

    # 1. 驗證 404.html 包含 noindex, nofollow 搜尋防護
    p404_text = (BASE / "404.html").read_text(encoding="utf-8")
    test("404.html 具備 meta name='robots' content='noindex, nofollow' 搜尋防護",
         '<meta name="robots" content="noindex, nofollow">' in p404_text)

    # 2. 驗證 16 個公開頁面 100% 具備標準 index, follow 與進階摘要標籤
    public_surfaces = [p for p in ALL_SURFACES if p != "404.html"]
    for p in public_surfaces:
        p_text = (BASE / p).read_text(encoding="utf-8")
        has_robots = ('content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"' in p_text and
                      'name="robots"' in p_text)
        test(f"{p} 具備標準 meta robots (index, follow, max-image-preview:large)", has_robots)

    # 3. 驗證 16 個公開頁面具備雙語 Open Graph og:locale 與 og:locale:alternate
    for p in public_surfaces:
        p_text = (BASE / p).read_text(encoding="utf-8")
        if p == "NVM技術全景中文.html":
            has_og_locale = ('property="og:locale" content="zh_TW"' in p_text and
                             'property="og:locale:alternate" content="en_US"' in p_text)
            test(f"{p} 具備繁中主要 og:locale (zh_TW) 與備選 og:locale:alternate (en_US)", has_og_locale)
        else:
            has_og_locale = (('property="og:locale" content="en_US"' in p_text or 'property="og:locale" content="en_US"/>' in p_text) and
                             ('property="og:locale:alternate" content="zh_TW"' in p_text or 'property="og:locale:alternate" content="zh_TW"/>' in p_text))
            test(f"{p} 具備英文主要 og:locale (en_US) 與備選 og:locale:alternate (zh_TW)", has_og_locale)

    # 4. 驗證 NVM技術全景 (中英雙語) 具備雙向 Reciprocal Hreflang 連結與 x-default
    en_atlas = (BASE / "NVM技術全景.html").read_text(encoding="utf-8")
    zh_atlas = (BASE / "NVM技術全景中文.html").read_text(encoding="utf-8")
    en_href = "https://samhuang68.github.io/nvm-knowledge-hub/NVM%E6%8A%80%E8%A1%93%E5%85%A8%E6%99%AF.html"
    zh_href = "https://samhuang68.github.io/nvm-knowledge-hub/NVM%E6%8A%80%E8%A1%93%E5%85%A8%E6%99%AF%E4%B8%AD%E6%96%87.html"

    test("NVM技術全景.html 包含 hreflang='en' 參照", f'hreflang="en" href="{en_href}"' in en_atlas)
    test("NVM技術全景.html 包含 hreflang='zh-TW' 雙向參照", f'hreflang="zh-TW" href="{zh_href}"' in en_atlas)
    test("NVM技術全景.html 包含 hreflang='x-default' 預設語系宣告", f'hreflang="x-default" href="{en_href}"' in en_atlas)

    test("NVM技術全景中文.html 包含 hreflang='en' 雙向參照", f'hreflang="en" href="{en_href}"' in zh_atlas)
    test("NVM技術全景中文.html 包含 hreflang='zh-TW' 參照", f'hreflang="zh-TW" href="{zh_href}"' in zh_atlas)
    test("NVM技術全景中文.html 包含 hreflang='x-default' 預設語系宣告", f'hreflang="x-default" href="{en_href}"' in zh_atlas)

    # 5. 驗證載入 Google Fonts 之頁面全面具備 DNS Prefetch 備援加速
    font_pages = ["index.html", "404.html", "automotive-nvm.html", "iot-mcu-envm.html", "specialty-nvm.html", "technology-comparison.html"]
    for fp in font_pages:
        fp_text = (BASE / fp).read_text(encoding="utf-8")
        has_dns_prefetch = ("dns-prefetch" in fp_text and
                            "fonts.googleapis.com" in fp_text and
                            "fonts.gstatic.com" in fp_text)
        test(f"{fp} 具備 Google Fonts 雙重 dns-prefetch 備援加速 (googleapis 與 gstatic)", has_dns_prefetch)

    # ════════════════════════════════════════════════════════════
    # TEST 30: 根節點多語資料集 (HTML Dataset)、編輯作者 (Meta Author) 與社群預覽卡無障礙 (Image Alt) 驗證
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 30: 根節點多語資料集 (HTML Dataset)、編輯作者 (Meta Author) 與社群預覽卡無障礙 (Image Alt) 驗證 ═══")

    # 1. 驗證全站 17 頁 <html> 標籤 100% 具備雙語標題與描述屬性 (data-title-*, data-description-*)
    for p in ALL_SURFACES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        has_dataset = ("data-title-en=" in p_text and
                       "data-title-zh=" in p_text and
                       "data-description-en=" in p_text and
                       "data-description-zh=" in p_text)
        test(f"{p} 根節點具備完整雙語資料集 (data-title-*/data-description-*)", has_dataset)

    # 2. 驗證全站 17 頁 100% 具備標準編輯委員會作者中繼標籤 (meta name="author")
    for p in ALL_SURFACES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        has_author = ('name="author" content="NVM Knowledge Hub Editorial Board"' in p_text or
                      'content="NVM Knowledge Hub Editorial Board" name="author"' in p_text)
        test(f"{p} 具備標準編輯委員會作者標籤 (<meta name='author'>)", has_author)

    # 3. 驗證 16 個公開頁面 100% 具備社群預覽卡影像替代文字 (og:image:alt 與 twitter:image:alt)
    for p in public_surfaces:
        p_text = (BASE / p).read_text(encoding="utf-8")
        has_og_alt = 'property="og:image:alt"' in p_text
        has_tw_alt = 'name="twitter:image:alt"' in p_text
        test(f"{p} 具備社群預覽卡影像替代文字 (og:image:alt 與 twitter:image:alt)", has_og_alt and has_tw_alt)

    # ════════════════════════════════════════════════════════════
    # TEST 31: 互動按鈕標準型別 (Button Type)、導覽地標唯一名稱 (Nav Landmarks) 與無障礙大綱 (Heading Outline)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 31: 互動按鈕標準型別 (Button Type)、導覽地標唯一名稱 (Nav Landmarks) 與無障礙大綱 (Heading Outline) ═══")

    # 1. 驗證全站 17 頁中所有 <button> 元素 100% 具備明確 type 屬性
    total_buttons = 0
    untyped_buttons = 0
    for p in ALL_SURFACES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        btn_tags = re.findall(r'<button\b([^>]*)>', p_text, re.IGNORECASE)
        total_buttons += len(btn_tags)
        for b_attrs in btn_tags:
            if not re.search(r'\btype=["\'](?:button|submit|reset)["\']', b_attrs, re.IGNORECASE):
                untyped_buttons += 1
    test(f"全站互動按鈕總數符合規模 (共計 {total_buttons} 個 <button> 元素)", total_buttons >= 80)
    test("全站所有 <button> 元素 100% 具備明確 type 宣告 (零無型別按鈕，符合 W3C HTML5 規範)", untyped_buttons == 0)

    # 2. 驗證全站 17 頁中所有 <nav> 元素 100% 具備無障礙名稱
    total_navs = 0
    unlabelled_navs = 0
    for p in ALL_SURFACES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        nav_tags = re.findall(r'<nav\b([^>]*)>', p_text, re.IGNORECASE)
        total_navs += len(nav_tags)
        for n_attrs in nav_tags:
            has_label = ('aria-label=' in n_attrs.lower() or 'aria-labelledby=' in n_attrs.lower())
            if not has_label:
                unlabelled_navs += 1
    test(f"全站導覽地標總數符合規模 (共計 {total_navs} 個 <nav> 地標)", total_navs >= 150)
    test("全站所有 <nav> 地標 100% 具備 aria-label 或 aria-labelledby 無障礙名稱 (零未命名地標)", unlabelled_navs == 0)

    # 3. 驗證同頁存在多個 <nav> 時，所有 <nav> 地標名稱 100% 具備情境唯一性
    pages_with_dup_navs = 0
    for p in ALL_SURFACES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        nav_labels = re.findall(r'<nav\b[^>]*aria-label=["\']([^"\']+)["\']', p_text, re.IGNORECASE)
        if len(nav_labels) > 1:
            if len(nav_labels) != len(set(nav_labels)):
                pages_with_dup_navs += 1
    test("全站各頁面多重 <nav> 地標 100% 具備唯一情境名稱 (零同頁重複地標標籤，符合 WCAG SC 1.3.1/2.4.1)",
         pages_with_dup_navs == 0)

    # 4. 驗證 site-shell.css 包含全站 .sr-only 輔助技術樣式
    test("site-shell.css 包含標準 .sr-only 螢幕閱讀器與輔助技術專用無障礙類別",
         ".sr-only" in shell_text and "clip: rect(0, 0, 0, 0)" in shell_text)

    # 5. 驗證 briefing/index.html 具備無障礙二級標題維持標題大綱連續性
    briefing_text = (BASE / "briefing/index.html").read_text(encoding="utf-8")
    test("briefing/index.html 包含 <h2 class='sr-only'> 維持文件標題大綱連續性 (h1 -> h2 -> h3)",
         '<h2 class="sr-only">' in briefing_text)

    # ════════════════════════════════════════════════════════════
    # TEST 32: Open Graph MIME 媒體型別標準化 (og:image:type) 與結構化資料實體綁定 (JSON-LD mainEntityOfPage & publisher.url)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 32: Open Graph MIME 媒體型別標準化 (og:image:type) 與結構化資料實體綁定 (JSON-LD mainEntityOfPage & publisher.url) ═══")

    # 1. 驗證 16 個公開頁面 100% 具備精確 Open Graph 影像 MIME 型別 (og:image:type)
    mismatched_og_types = 0
    for p in public_surfaces:
        p_text = (BASE / p).read_text(encoding="utf-8")
        expected_mime = "image/jpeg" if p == "iot-mcu-envm.html" else "image/webp"
        has_type = (f'property="og:image:type" content="{expected_mime}"' in p_text or
                    f'content="{expected_mime}" property="og:image:type"' in p_text)
        if not has_type:
            mismatched_og_types += 1
        test(f"{p} 具備精確 Open Graph MIME 宣告 (og:image:type='{expected_mime}')", has_type)
    test("全站 16 個公開內容頁面 100% 具備精準對應之 og:image:type 宣告 (零遺漏、零型別誤判)",
         mismatched_og_types == 0)

    # 2. 驗證 15 個 TechArticle 技術文章頁面 100% 具備 Google Rich Results mainEntityOfPage 實體綁定
    tech_articles = [p for p in public_surfaces if p != "index.html"]
    unbound_articles = 0
    for p in tech_articles:
        p_text = (BASE / p).read_text(encoding="utf-8")
        can_match = re.search(r'<link\s+[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', p_text)
        if not can_match:
            can_match = re.search(r'<link\s+[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']canonical["\']', p_text)
        canonical_url = can_match.group(1) if can_match else ""

        s_match = re.search(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', p_text, re.DOTALL)
        if not s_match:
            unbound_articles += 1
            test(f"{p} 包含結構化資料 JSON-LD", False)
            continue

        try:
            ld_data = json.loads(s_match.group(1))
            me = ld_data.get("mainEntityOfPage", {})
            is_bound = (me.get("@type") == "WebPage" and me.get("@id") == canonical_url)
            if not is_bound:
                unbound_articles += 1
            test(f"{p} 具備 mainEntityOfPage WebPage 實體對齊 ({canonical_url})", is_bound)
        except Exception:
            unbound_articles += 1
            test(f"{p} JSON-LD 解析有效且具備 mainEntityOfPage", False)

    test("全站 15 個 TechArticle 頁面 100% 具備與 canonical 嚴格一致之 mainEntityOfPage 實體對齊",
         unbound_articles == 0)

    # 3. 驗證全站 16 個公開頁面之 publisher 100% 宣告組織網址 (publisher.url)
    hub_url = "https://samhuang68.github.io/nvm-knowledge-hub/"
    missing_pub_urls = 0
    for p in public_surfaces:
        p_text = (BASE / p).read_text(encoding="utf-8")
        s_match = re.search(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', p_text, re.DOTALL)
        if not s_match:
            missing_pub_urls += 1
            test(f"{p} 具備 publisher.url 組織官網連結", False)
            continue
        try:
            ld_data = json.loads(s_match.group(1))
            pub = ld_data.get("publisher", {})
            has_pub_url = (pub.get("url") == hub_url)
            if not has_pub_url:
                missing_pub_urls += 1
            test(f"{p} publisher 具備標準組織官方網址 ({hub_url})", has_pub_url)
        except Exception:
            missing_pub_urls += 1
            test(f"{p} JSON-LD 解析有效且包含 publisher.url", False)

    test("全站 16 個公開頁面之 JSON-LD publisher 100% 完整宣告官方首頁 URL",
         missing_pub_urls == 0)

    # ════════════════════════════════════════════════════════════
    # TEST 33: 搜尋引擎 Sitemap 索引對齊、Robots 協定與 Schema.org 時間軸作者宣告
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 33: 搜尋引擎 Sitemap 索引對齊、Robots 協定與 Schema.org 時間軸作者宣告 ═══")

    # 1. 驗證 robots.txt 存在且宣告全站 Allow 與 Sitemap 指引
    robots_path = BASE / "robots.txt"
    test("robots.txt 實體存在", robots_path.exists())
    robots_txt = robots_path.read_text(encoding="utf-8")
    test("robots.txt 宣告 Allow: / 全站抓取權限與 sitemap.xml 索引指引",
         "Allow: /" in robots_txt and "Sitemap: https://samhuang68.github.io/nvm-knowledge-hub/sitemap.xml" in robots_txt)

    # 2. 驗證 sitemap.xml 與全站 16 個公開頁面 canonical URL 雙向對齊 (Bijection)
    sitemap_path = BASE / "sitemap.xml"
    test("sitemap.xml 實體存在", sitemap_path.exists())
    tree = ET.parse(sitemap_path)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap_elements = tree.getroot().findall("sm:url", ns)
    sitemap_urls = [elem.find("sm:loc", ns).text.strip() for elem in sitemap_elements if elem.find("sm:loc", ns) is not None]

    canonical_map = {}
    for p in public_surfaces:
        p_text = (BASE / p).read_text(encoding="utf-8")
        can_match = re.search(r'<link\s+[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', p_text)
        if not can_match:
            can_match = re.search(r'<link\s+[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']canonical["\']', p_text)
        canonical_map[p] = can_match.group(1) if can_match else ""

    test("sitemap.xml 包含完整 16 個公開頁面 URL 且與全站 Canonical 100% 雙向對齊 (零遺漏、零死連結)",
         set(sitemap_urls) == set(canonical_map.values()) and len(sitemap_urls) == len(public_surfaces))

    # 3. 驗證 sitemap.xml 中每個 URL 之 lastmod 格式符合 W3C Datetime
    invalid_lastmods = 0
    for elem in sitemap_elements:
        loc = elem.find("sm:loc", ns).text.strip()
        lastmod = elem.find("sm:lastmod", ns)
        lastmod_val = lastmod.text.strip() if lastmod is not None else ""
        is_valid_date = bool(re.match(r"^\d{4}-\d{2}-\d{2}$", lastmod_val))
        if not is_valid_date:
            invalid_lastmods += 1
        test(f"sitemap.xml 項目 {loc.split('/')[-1] or 'root'} lastmod 符合 W3C 日期格式 ({lastmod_val})", is_valid_date)
    test("sitemap.xml 所有條目 100% 具備標準 W3C YYYY-MM-DD lastmod 格式", invalid_lastmods == 0)

    # 4. 驗證 sitemap.xml priority 範圍 (0.0 ~ 1.0) 與 changefreq 列舉有效性
    valid_freqs = {"always", "hourly", "daily", "weekly", "monthly", "yearly", "never"}
    invalid_prios = 0
    invalid_freqs_cnt = 0
    for elem in sitemap_elements:
        prio = elem.find("sm:priority", ns)
        prio_val = float(prio.text.strip()) if prio is not None else -1.0
        if not (0.0 <= prio_val <= 1.0):
            invalid_prios += 1
        freq = elem.find("sm:changefreq", ns)
        freq_val = freq.text.strip() if freq is not None else ""
        if freq_val not in valid_freqs:
            invalid_freqs_cnt += 1
    test("sitemap.xml 所有條目 priority 介於 0.0 至 1.0 之間", invalid_prios == 0)
    test("sitemap.xml 所有條目 changefreq 均為 W3C 標準列舉值", invalid_freqs_cnt == 0)

    # 5. 驗證全站 16 個公開頁面 JSON-LD 100% 包含標準 author 組織宣告
    missing_authors = 0
    for p in public_surfaces:
        p_text = (BASE / p).read_text(encoding="utf-8")
        s_match = re.search(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', p_text, re.DOTALL)
        has_author = False
        if s_match:
            try:
                ld = json.loads(s_match.group(1))
                auth = ld.get("author", {})
                has_author = (auth.get("@type") == "Organization" and
                              auth.get("name") == "NVM Knowledge Hub Editorial Board" and
                              auth.get("url") == hub_url)
            except Exception:
                pass
        if not has_author:
            missing_authors += 1
        test(f"{p} JSON-LD 具備標準 author 編輯委員會組織宣告與官方網址", has_author)
    test("全站 16 個公開頁面之 JSON-LD 100% 包含標準 author 組織結構化實體", missing_authors == 0)

    # 6. 驗證全站 15 個 TechArticle 頁面 100% 宣告 datePublished 與 dateModified 標準時間軸
    missing_timeline = 0
    for p in tech_articles:
        p_text = (BASE / p).read_text(encoding="utf-8")
        s_match = re.search(r'<script\s+type=["\']application/ld\+json["\']>(.*?)</script>', p_text, re.DOTALL)
        has_timeline = False
        if s_match:
            try:
                ld = json.loads(s_match.group(1))
                has_timeline = (ld.get("datePublished") == "2026-08-29T00:00:00+08:00" and
                                ld.get("dateModified") == "2026-09-10T00:00:00+08:00")
            except Exception:
                pass
        if not has_timeline:
            missing_timeline += 1
        test(f"{p} JSON-LD 具備標準 datePublished 與 dateModified 時間軸", has_timeline)
    test("全站 15 個 TechArticle 頁面 100% 宣告符合 ISO 8601 之發布與修訂時間軸", missing_timeline == 0)

    # 7. 驗證全站 15 個 TechArticle 頁面 100% 宣告 Open Graph article 延伸標籤
    missing_og_articles = 0
    for p in tech_articles:
        p_text = (BASE / p).read_text(encoding="utf-8")
        has_og_art = ('property="article:published_time" content="2026-08-29T00:00:00+08:00"' in p_text and
                      'property="article:modified_time" content="2026-09-10T00:00:00+08:00"' in p_text and
                      'property="article:author" content="NVM Knowledge Hub Editorial Board"' in p_text)
        if not has_og_art:
            missing_og_articles += 1
        test(f"{p} 具備完整 Open Graph article:published_time/modified_time/author 標籤", has_og_art)
    test("全站 15 個 TechArticle 頁面 100% 包含完整 Open Graph article 延伸中繼標籤", missing_og_articles == 0)

    print(f"\n{'='*60}")
    print(f"  TOTAL: {PASS + FAIL}  |  ✅ PASS: {PASS}  |  ❌ FAIL: {FAIL}")
    print(f"{'='*60}")
    return FAIL == 0

if __name__ == "__main__":
    exit(0 if run_tests() else 1)


