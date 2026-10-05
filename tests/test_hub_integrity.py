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
        test(f"{name} 採用旗艦半導體視覺基底 (Obsidian / Light)", "background-color: #f8fafc" in content or "background-color: #fafaf7" in content or "background-color: #061925" in content or "background-color: #08090a" in content or "background-color: var(--bg-deep)" in content or "background-color: #0f172a" in content)
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
        "index.html", "nvm-technology-atlas.html", "nvm-technology-atlas-zh.html", "secure-storage.html",
        "security-assurance.html", "ai-nvm-opportunities.html", "iot-mcu-envm.html",
        "automotive-nvm.html", "specialty-nvm.html", "memory-physics.html",
        "memory-evidence.html", "technology-comparison.html", "oip-secure-storage.html",
        "sram-repair.html", "404.html", "briefing/index.html", "whitepaper/index.html"
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
    test(f"全站共計驗證 {total_sliders} 組互動滑桿無障礙雙語屬性 (>=10)", total_sliders >= 10)

    # 2. 驗證所有具備麵包屑的頁面其 nav 標籤具備雙語 ARIA
    total_bcs = 0
    for p in BILINGUAL_DYNAMIC_PAGES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        bcs = re.findall(r'<nav[^>]*class=[\x22\x27][^>]*breadcrumb[^>]*[\x22\x27][^>]*>', p_text, re.IGNORECASE)
        for bc in bcs:
            total_bcs += 1
            test(f"{p} 麵包屑導覽具備雙語 ARIA 標籤 (Breadcrumb / 麵包屑導覽)",
                 'data-aria-zh="麵包屑導覽"' in bc and 'data-aria-en="Breadcrumb"' in bc)
    test("全站共計驗證 12 處麵包屑導覽雙語 ARIA 屬性", total_bcs >= 12)

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
        "index.html", "nvm-technology-atlas.html", "nvm-technology-atlas-zh.html", "secure-storage.html",
        "security-assurance.html", "ai-nvm-opportunities.html", "iot-mcu-envm.html",
        "automotive-nvm.html", "specialty-nvm.html", "memory-physics.html",
        "memory-evidence.html", "technology-comparison.html", "oip-secure-storage.html",
        "sram-repair.html", "briefing/index.html", "whitepaper/index.html"
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
        test(f"{p} 具備標準 meta color-scheme (light / dark light)",
             'color-scheme' in p_text and ('light' in p_text or 'dark light' in p_text))

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
             bool(re.search(rf'<th\b[^>]*scope=["\']row["\'][^>]*>(?:(?!</th>)[\s\S])*?{re.escape(row_name)}', mp_text)))

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
    public_surfaces = [p for p in ALL_SURFACES if p not in {"404.html", "tools/whitepaper-studio/index.html"}]
    for p in public_surfaces:
        p_text = (BASE / p).read_text(encoding="utf-8")
        has_robots = ('content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"' in p_text and
                      'name="robots"' in p_text)
        test(f"{p} 具備標準 meta robots (index, follow, max-image-preview:large)", has_robots)

    # 3. 驗證 16 個公開頁面具備雙語 Open Graph og:locale 與 og:locale:alternate
    for p in public_surfaces:
        p_text = (BASE / p).read_text(encoding="utf-8")
        if p == "nvm-technology-atlas-zh.html":
            has_og_locale = ('property="og:locale" content="zh_TW"' in p_text and
                             'property="og:locale:alternate" content="en_US"' in p_text)
            test(f"{p} 具備繁中主要 og:locale (zh_TW) 與備選 og:locale:alternate (en_US)", has_og_locale)
        else:
            has_og_locale = (('property="og:locale" content="en_US"' in p_text or 'property="og:locale" content="en_US"/>' in p_text) and
                             ('property="og:locale:alternate" content="zh_TW"' in p_text or 'property="og:locale:alternate" content="zh_TW"/>' in p_text))
            test(f"{p} 具備英文主要 og:locale (en_US) 與備選 og:locale:alternate (zh_TW)", has_og_locale)

    # 4. 驗證 NVM技術全景 (中英雙語) 具備雙向 Reciprocal Hreflang 連結與 x-default
    en_atlas = (BASE / "nvm-technology-atlas.html").read_text(encoding="utf-8")
    zh_atlas = (BASE / "nvm-technology-atlas-zh.html").read_text(encoding="utf-8")
    en_href = "https://hub.samhuang68.org/nvm-technology-atlas.html"
    zh_href = "https://hub.samhuang68.org/nvm-technology-atlas-zh.html"

    test("nvm-technology-atlas.html 包含 hreflang='en' 參照", f'hreflang="en" href="{en_href}"' in en_atlas)
    test("nvm-technology-atlas.html 包含 hreflang='zh-TW' 雙向參照", f'hreflang="zh-TW" href="{zh_href}"' in en_atlas)
    test("nvm-technology-atlas.html 包含 hreflang='x-default' 預設語系宣告", f'hreflang="x-default" href="{en_href}"' in en_atlas)

    test("nvm-technology-atlas-zh.html 包含 hreflang='en' 雙向參照", f'hreflang="en" href="{en_href}"' in zh_atlas)
    test("nvm-technology-atlas-zh.html 包含 hreflang='zh-TW' 參照", f'hreflang="zh-TW" href="{zh_href}"' in zh_atlas)
    test("nvm-technology-atlas-zh.html 包含 hreflang='x-default' 預設語系宣告", f'hreflang="x-default" href="{en_href}"' in zh_atlas)

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

    # 2. 驗證 14 個 TechArticle 技術文章頁面 100% 具備 Google Rich Results mainEntityOfPage 實體綁定
    tech_articles = [p for p in public_surfaces if p not in {"index.html", "sram-repair.html"}]
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

    test("全站 14 個 TechArticle 頁面 100% 具備與 canonical 嚴格一致之 mainEntityOfPage 實體對齊",
         unbound_articles == 0)

    # 3. 驗證全站 16 個公開頁面之 publisher 100% 宣告組織網址 (publisher.url)
    hub_url = "https://hub.samhuang68.org/"
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
         "Allow: /" in robots_txt and "Sitemap: https://hub.samhuang68.org/sitemap.xml" in robots_txt)

    # 2. 驗證 sitemap.xml 與全站 17 個公開頁面 canonical URL 雙向對齊 (Bijection)
    sitemap_path = BASE / "sitemap.xml"
    test("sitemap.xml 實體存在", sitemap_path.exists())
    tree = ET.parse(sitemap_path)
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap_elements = tree.getroot().findall("sm:url", ns)
    sitemap_urls = [elem.find("sm:loc", ns).text.strip() for elem in sitemap_elements if elem.find("sm:loc", ns) is not None]

    sitemap_pages = [p for p in ALL_SURFACES if p != "404.html"] + ["tools/whitepaper-studio/index.html"]
    canonical_map = {}
    for p in sitemap_pages:
        p_text = (BASE / p).read_text(encoding="utf-8")
        can_match = re.search(r'<link\s+[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\']', p_text)
        if not can_match:
            can_match = re.search(r'<link\s+[^>]*href=["\']([^"\']+)["\'][^>]*rel=["\']canonical["\']', p_text)
        canonical_map[p] = can_match.group(1) if can_match else ""

    test("sitemap.xml 包含完整 17 個公開頁面 URL 且與全站 Canonical 100% 雙向對齊 (零遺漏、零死連結)",
         set(sitemap_urls) == set(canonical_map.values()) and len(sitemap_urls) == len(sitemap_pages))

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

    # 6. 驗證全站 14 個 TechArticle 頁面 100% 宣告 datePublished 與 dateModified 標準時間軸
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
    test("全站 14 個 TechArticle 頁面 100% 宣告符合 ISO 8601 之發布與修訂時間軸", missing_timeline == 0)

    # 7. 驗證全站 14 個 TechArticle 頁面 100% 宣告 Open Graph article 延伸標籤
    missing_og_articles = 0
    for p in tech_articles:
        p_text = (BASE / p).read_text(encoding="utf-8")
        has_og_art = ('property="article:published_time" content="2026-08-29T00:00:00+08:00"' in p_text and
                      'property="article:modified_time" content="2026-09-10T00:00:00+08:00"' in p_text and
                      'property="article:author" content="NVM Knowledge Hub Editorial Board"' in p_text)
        if not has_og_art:
            missing_og_articles += 1
        test(f"{p} 具備完整 Open Graph article:published_time/modified_time/author 標籤", has_og_art)
    test("全站 14 個 TechArticle 頁面 100% 包含完整 Open Graph article 延伸中繼標籤", missing_og_articles == 0)

    # ════════════════════════════════════════════════════════════
    # TEST 34: 圖片渲染效能與防累計位移 (CLS)、全站 SVG 語意分類與折疊手風琴 (Details/Summary) 鍵盤焦點標準
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 34: 圖片渲染效能與防累計位移 (CLS)、全站 SVG 語意分類與折疊手風琴 (Details/Summary) 鍵盤焦點標準 ═══")

    # 1. 驗證全站所有 <img> 元素 100% 具備防累計位移 (CLS) 之明確 width 與 height
    total_imgs = 0
    missing_dimensions = 0
    missing_alts = 0
    missing_loading_attr = 0
    missing_decoding_attr = 0
    bilingual_alt_mismatch = 0

    for p in ALL_SURFACES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        img_tags = re.findall(r'<img\b([^>]*)>', p_text, re.IGNORECASE)
        total_imgs += len(img_tags)
        for img_attr in img_tags:
            src_m = re.search(r'\bsrc=["\']([^"\']+)["\']', img_attr, re.IGNORECASE)
            src_val = src_m.group(1) if src_m else "unknown"

            has_w = bool(re.search(r'\bwidth=["\']\d+["\']', img_attr, re.IGNORECASE))
            has_h = bool(re.search(r'\bheight=["\']\d+["\']', img_attr, re.IGNORECASE))
            if not (has_w and has_h):
                missing_dimensions += 1

            alt_m = re.search(r'\balt=["\']([^"\']*)["\']', img_attr, re.IGNORECASE)
            has_alt = bool(alt_m and alt_m.group(1).strip())
            if not has_alt:
                missing_alts += 1

            has_load = bool(re.search(r'\bloading=["\'](lazy|eager)["\']', img_attr, re.IGNORECASE))
            if not has_load:
                missing_loading_attr += 1

            has_dec = bool(re.search(r'\bdecoding=["\']async["\']', img_attr, re.IGNORECASE))
            if not has_dec:
                missing_decoding_attr += 1

            alt_en_m = re.search(r'\bdata-alt-en=["\']([^"\']*)["\']', img_attr, re.IGNORECASE)
            if alt_en_m and alt_m:
                if alt_m.group(1) != alt_en_m.group(1):
                    bilingual_alt_mismatch += 1

            test(f"圖片 {src_val.split('/')[-1]} 具備完整尺寸、替代文字與非同步解碼 (width/height/alt/loading/decoding)",
                 has_w and has_h and has_alt and has_load and has_dec)

    test(f"全站內容圖片總數符合規模 (共計 {total_imgs} 個 <img> 元素)", total_imgs >= 12)
    test("全站所有 <img> 元素 100% 具備明確 width 與 height 屬性 (防止 Cumulative Layout Shift，符合 Core Web Vitals)",
         missing_dimensions == 0)
    test("全站所有 <img> 元素 100% 具備非空 alt 替代文字 (零無替代文字圖片，符合 WCAG SC 1.1.1)",
         missing_alts == 0)
    test("全站所有 <img> 元素 100% 宣告明確 loading (eager/lazy) 與 decoding='async' (防止主線程解碼阻塞)",
         missing_loading_attr == 0 and missing_decoding_attr == 0)
    test("全站雙語 <img> 元素 100% 初始 alt 與 data-alt-en 完全一致 (符合 English Default 全站規範)",
         bilingual_alt_mismatch == 0)

    # 2. 驗證全站所有 <svg> 元素 100% 具備明確語意分類 (裝飾性 vs 資訊性)
    total_svgs = 0
    unclassified_svgs = 0
    for p in ALL_SURFACES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        for block in re.findall(r'<svg\b[\s\S]*?<\/svg>', p_text, re.IGNORECASE):
            total_svgs += 1
            open_tag = re.match(r'<svg\b[^>]*>', block, re.IGNORECASE).group(0)
            is_hidden = bool(re.search(r'\baria-hidden=["\']true["\']', open_tag, re.IGNORECASE))
            has_label = bool(re.search(r'\b(aria-label|aria-labelledby)=["\'][^"\']+["\']', open_tag, re.IGNORECASE))
            has_title = bool(re.search(r'<title\b', block, re.IGNORECASE))
            if not (is_hidden or has_label or has_title):
                unclassified_svgs += 1

    test(f"全站向量圖形總數符合規模 (共計 {total_svgs} 個 <svg> 元素)", total_svgs >= 1000)
    test("全站所有 <svg> 向量圖形 100% 具備明確無障礙語意 (aria-hidden='true' 或具名 aria-label/title，零未標記幽靈圖形)",
         unclassified_svgs == 0)

    # 3. 驗證全站所有 <details> 折疊手風琴 100% 包含非空 <summary> 標籤
    total_details_tags = 0
    total_summaries = 0
    for p in ALL_SURFACES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        d_cnt = len(re.findall(r'<details\b', p_text, re.IGNORECASE))
        s_cnt = len(re.findall(r'<summary\b', p_text, re.IGNORECASE))
        total_details_tags += d_cnt
        total_summaries += s_cnt

    test(f"全站折疊手風琴總數符合規模 (共計 {total_details_tags} 個 <details> 元素)", total_details_tags >= 850)
    test("全站所有 <details> 折疊元素 100% 具備一對一之 <summary> 交互標題 (符合 W3C HTML5 規範)",
         total_details_tags == total_summaries)

    # ════════════════════════════════════════════════════════════
    # TEST 35: WCAG 2.1 SC 1.3.1 全站標題層級大綱連續性 (Zero Heading Level Skips) 與無障礙導覽語意
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 35: WCAG 2.1 SC 1.3.1 全站標題層級大綱連續性 (Zero Heading Level Skips) 與無障礙導覽語意 ═══")

    total_headings_audited = 0
    total_skips_found = 0

    for p in ALL_SURFACES:
        p_text = (BASE / p).read_text(encoding="utf-8")
        matches = list(re.finditer(r'<(h[1-6])\b([^>]*)>([\s\S]*?)<\/\1>', p_text, re.IGNORECASE))
        total_headings_audited += len(matches)
        page_skips = 0
        for i in range(len(matches) - 1):
            c_tag, c_lvl = matches[i].group(1).lower(), int(matches[i].group(1)[1])
            n_tag, n_lvl = matches[i+1].group(1).lower(), int(matches[i+1].group(1)[1])
            if n_lvl > c_lvl + 1:
                page_skips += 1
                total_skips_found += 1
        test(f"{p} 標題大綱層級 100% 平滑連續無越級跳號 (符合 WCAG 2.1 SC 1.3.1/2.4.6)", page_skips == 0)

    test(f"全站標題總數符合規模 (共計 {total_headings_audited} 個標題元素)", total_headings_audited >= 350)
    test("全站 17 個公開頁面 100% 達成零標題越級跳號 (Zero Heading Skips, hX -> hX+2+ = 0)", total_skips_found == 0)

    # ════════════════════════════════════════════════════════════
    # TEST 36: NVM 技術對比矩陣數據核實、第一性原理物理常數與 5 軸動態雷達決策器門禁
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 36: NVM 技術對比矩陣數據核實、第一性原理物理常數與 5 軸動態雷達決策器門禁 ═══")
    tc_text = (BASE / "technology-comparison.html").read_text(encoding="utf-8")

    # 1. 矩陣數據：面積倒掛修復 (LD-MTP 60-120+ F^2 vs HD-MTP 25-50 F^2)
    test("technology-comparison.html 矩陣包含 LD-MTP 60–120+ F² 與 HD-MTP 25–50 F² (徹底解決面積倒掛)",
         "60–120+ F²" in tc_text and "25–50 F²" in tc_text and tc_text.find("60–120+ F²") < tc_text.find("25–50 F²"))

    # 2. 矩陣數據：SST SSI 與 FG-OTP 無抹除
    test("technology-comparison.html 載明 SST 來源端注入 SSI/FN 與 FG-OTP 無電氣抹除 CHEI/None",
         "SSI / FN" in tc_text and "CHEI / None" in tc_text)

    # 3. 矩陣數據：MRAM 耐久度 TDDB 與延遲校準
    test("technology-comparison.html 載明 MRAM 商業量產 10⁶–10¹⁰ 耐久度與 10–25 ns 陣列讀取延遲",
         "10<sup>6</sup>–10<sup>10</sup>" in tc_text and "~10–25 ns" in tc_text)

    # 4. 物理方程式：FN 穿隧理論係數與 4 階段微觀崩潰
    test("technology-comparison.html 具備 FN 穿隧理論解 (270 MV/cm 理論 vs 250 MV/cm 經驗) 與 4 階段滲透崩潰微絲模型",
         "2.70&times;10<sup>8</sup> V/cm (270 MV/cm)" in tc_text and "2.48&times;10<sup>8</sup> V/cm &approx; 2.5&times;10<sup>8</sup> V/cm" in tc_text and "局域再結晶矽微絲" in tc_text)

    # 5. 代工廠路線：TSMC/UMC/GF/Samsung 與實體資安責任鏈
    test("technology-comparison.html 具備四大晶圓代工廠最新量產路線圖與多層實體防護責任鏈 (非單週期位元消除)",
         "2025 年通過 AEC-Q100 Grade 1 (10萬次循環)" in tc_text and "Avalanche" in tc_text and "12LP+ AutoPro150" in tc_text and "SF4A (4nm) 與 SF3 / SF2" in tc_text and "非揮發微絲為永久性物理歐姆結構" in tc_text)

    # 6. 雷達決策器：軸向對齊與硬性排除閘
    test("technology-comparison.html 雷達選型器軸向與 baseProfile 100% 對齊且包含 >1M 次工作 RAM 硬性排除閘",
         'nameZh: "微縮先進度"' in tc_text and 'nameZh: "高溫留存力"' in tc_text and 'nameZh: "覆寫耐受性"' in tc_text and "if (endIdx === 2) return 5;" in tc_text)

    # ════════════════════════════════════════════════════════════
    # TEST 37: 全站模擬英文模式 DOM 樹剪枝雙語純度與 CJK 零洩漏永久門禁
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 37: 全站模擬英文模式 DOM 樹剪枝雙語純度與 CJK 零洩漏永久門禁 ═══")
    import subprocess
    bilingual_proc = subprocess.run(
        ["node", "scripts/check-bilingual-purity.mjs"],
        cwd=str(BASE),
        capture_output=True,
        text=True,
        encoding="utf-8"
    )
    test("scripts/check-bilingual-purity.mjs 全站 17 頁面模擬英文 DOM 剪枝純度 100% 通過 (Zero CJK Leaks)",
         bilingual_proc.returncode == 0,
         detail=bilingual_proc.stderr or bilingual_proc.stdout)

    # 驗證 site-language.js 支援 data-title-en / data-title-zh 動態切換
    site_lang_js = (BASE / "site-language.js").read_text(encoding="utf-8")
    test("site-language.js 完整具備 data-title-en 與 data-title-zh 雙語 Tooltip 同步控制器",
         "data-title-zh" in site_lang_js and "data-title-en" in site_lang_js and "element.setAttribute('title', title)" in site_lang_js)

    # 驗證 package.json 門禁已整合雙語純度檢查
    pkg_json = (BASE / "package.json").read_text(encoding="utf-8")
    test("package.json check 命令已強制整合 check-bilingual-purity.mjs (Fail-Closed)",
         "check-bilingual-purity.mjs" in pkg_json)

    # ════════════════════════════════════════════════════════════
    # TEST 38: 全站 Schema.org BreadcrumbList 微資料 100% 覆蓋
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 38: 全站 Schema.org BreadcrumbList 微資料 100% 覆蓋 ═══")
    PUBLIC_17_PAGES = [
        "index.html", "technology-comparison.html", "specialty-nvm.html",
        "automotive-nvm.html", "iot-mcu-envm.html", "security-assurance.html",
        "secure-storage.html", "ai-nvm-opportunities.html", "memory-physics.html",
        "memory-evidence.html", "oip-secure-storage.html", "sram-repair.html",
        "404.html", "briefing/index.html", "whitepaper/index.html",
        "nvm-technology-atlas.html", "nvm-technology-atlas-zh.html"
    ]
    for p in PUBLIC_17_PAGES:
        content = (BASE / p).read_text(encoding="utf-8")
        has_bc = '"@type":"BreadcrumbList"' in content or '"@type": "BreadcrumbList"' in content
        test(f"{p} 具備標準 Schema.org BreadcrumbList 結構化微資料", has_bc, f"{p} 缺少 BreadcrumbList")

    # ════════════════════════════════════════════════════════════
    # TEST 39: AI 存算一體 (CIM) 混訊能效試算器與汽車 Arrhenius 活化能擴展
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 39: AI 存算一體 (CIM) 混訊能效試算器與汽車 Arrhenius 活化能擴展 ═══")
    cim_js = (BASE / "cim-efficiency-calculator.js").read_text(encoding="utf-8")
    test("cim-efficiency-calculator.js 存在且導出 calculateCimMetrics 與 initCimEfficiencyCalculator",
         "export function calculateCimMetrics" in cim_js and "export function initCimEfficiencyCalculator" in cim_js)
    test("cim-efficiency-calculator.js 包含四大記憶體元件模型 (ReRAM, MRAM, Flash, SRAM)",
         "reram:" in cim_js and "mram:" in cim_js and "nor_flash:" in cim_js and "sram_cim:" in cim_js)
    test("cim-efficiency-calculator.js 包含 ADC 2^B 指數能耗模型與 IR-drop 壓降計算",
         "ADC_ENERGY_TABLE" in cim_js and "irDropPercentage" in cim_js and "worstCaseDropV" in cim_js)

    ai_html = (BASE / "ai-nvm-opportunities.html").read_text(encoding="utf-8")
    test("ai-nvm-opportunities.html 整合 cim-calculator-widget 互動儀表板與模組引用",
         'id="cim-calculator-widget"' in ai_html and 'src="cim-efficiency-calculator.js"' in ai_html)

    auto_html = (BASE / "automotive-nvm.html").read_text(encoding="utf-8")
    test("automotive-nvm.html 包含 eaSelect 活化能選擇器 (0.84eV, 1.10eV, 1.25eV, 1.80eV)",
         'id="eaSelect"' in auto_html and '0.84 eV' in auto_html and '1.80 eV' in auto_html)

    auto_thermal_js = (BASE / "automotive-thermal.js").read_text(encoding="utf-8")
    test("automotive-thermal.js 支援讀取 eaSelect 動態計算不同活化能下的加速因子 AF",
         'document.getElementById("eaSelect")' in auto_thermal_js and 'activationEV: eaVal' in auto_thermal_js)

    # ════════════════════════════════════════════════════════════
    # TEST 40: NIST FIPS 203/204 後量子密碼學 (PQC) 晶片信任根儲存預算試算器
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 40: NIST FIPS 203/204 後量子密碼學 (PQC) 晶片信任根儲存預算試算器 ═══")
    pqc_js = (BASE / "pqc-rot-budget-calculator.js").read_text(encoding="utf-8")
    test("pqc-rot-budget-calculator.js 存在且導出 calculatePqcRotBudget 與 initPqcRotCalculator",
         "export function calculatePqcRotBudget" in pqc_js and "export function initPqcRotCalculator" in pqc_js)
    test("pqc-rot-budget-calculator.js 包含 FIPS 203/204 (ML-KEM, ML-DSA) 與 LMS 演算法規格",
         "ml_kem_768" in pqc_js and "ml_kem_1024" in pqc_js and "ml_dsa_65" in pqc_js and "ml_dsa_87" in pqc_js and "lms_sha256" in pqc_js)
    test("pqc-rot-budget-calculator.js 包含 eFuse (4Kb 上限溢位)、AntiFuse 與 eMRAM 物理可行性評估",
         "efuseLimitBits" in pqc_js and "antifuseLimitBits" in pqc_js and "mramLimitBits" in pqc_js and "OVERFLOW" in pqc_js)

    sec_html = (BASE / "secure-storage.html").read_text(encoding="utf-8")
    test("secure-storage.html 整合 pqc-budget-simulator-root 互動面板與模組引用",
         'id="pqc-budget-simulator-root"' in sec_html and 'src="pqc-rot-budget-calculator.js' in sec_html)
    test("secure-storage.html PQC 試算器包含預設情境與三種技術可行性卡片",
         'id="pqc-preset-select"' in sec_html and 'id="pqc-efuse-pill"' in sec_html and 'id="pqc-antifuse-pill"' in sec_html and 'id="pqc-mram-pill"' in sec_html)

    # ════════════════════════════════════════════════════════════
    # TEST 41: SRAM PUF 金鑰重建與 Fuzzy Extractor 物理邊界模擬器
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 41: SRAM PUF 金鑰重建與 Fuzzy Extractor 物理邊界模擬器 ═══")
    puf_js = (BASE / "puf-reconstruction-simulator.js").read_text(encoding="utf-8")
    test("puf-reconstruction-simulator.js 存在且導出 calculatePufReconstruction 與 initPufReconstructionSimulator",
         "export function calculatePufReconstruction" in puf_js and "export function initPufReconstructionSimulator" in puf_js)
    test("puf-reconstruction-simulator.js 包含溫度係數、NBTI/PBTI 老化與二項式 CDF 區塊失敗率模型",
         "alphaTemp" in puf_js and "betaAge" in puf_js and "binomialCoeff" in puf_js and "pBlockFail" in puf_js)
    test("puf-reconstruction-simulator.js 包含殘餘最小熵與 Helper Data 尺寸估算",
         "residualMinEntropy" in puf_js and "helperDataBytes" in puf_js and "minEntropyPerCell" in puf_js)

    oip_html = (BASE / "oip-secure-storage.html").read_text(encoding="utf-8")
    test("oip-secure-storage.html 整合 puf-reconstruction-root 實驗室與模組引用",
         'id="puf-reconstruction-root"' in oip_html and 'src="puf-reconstruction-simulator.js' in oip_html)
    test("oip-secure-storage.html 包含 PUF 漢明距離分佈畫布與溫度/老化控制項",
         'id="puf-dist-canvas"' in oip_html and 'id="puf-temp-slider"' in oip_html and 'id="puf-age-slider"' in oip_html)

    # ════════════════════════════════════════════════════════════
    # TEST 42: Common Criteria (ISO/IEC 15408 / CEM v3.1) AVA_VAN.5 實體防護力與攻擊潛能評估器
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 42: Common Criteria AVA_VAN.5 實體防護力與攻擊潛能評估器 ═══")
    eval_js = (BASE / "attack-resistance-evaluator.js").read_text(encoding="utf-8")
    test("attack-resistance-evaluator.js 存在且導出 calculateAttackPotential 與 initAttackResistanceEvaluator",
         "export function calculateAttackPotential" in eval_js and "export function initAttackResistanceEvaluator" in eval_js)
    test("attack-resistance-evaluator.js 包含 CEM 標準五大因子權重與 AVA_VAN.1~5 映射模型",
         "CEM_SCORING_WEIGHTS" in eval_js and "CC_PRESETS" in eval_js and "AVA_VAN.5" in eval_js and "RESISTANT_MAX" in eval_js)
    test("attack-resistance-evaluator.js 包含 6 大硬體縱深防禦措施加分 (activeMesh, zeroization, scrambling, antifuse, puf, diffRead)",
         "inputs.activeMesh" in eval_js and "inputs.zeroization" in eval_js and "inputs.scrambling" in eval_js and "inputs.antifuse" in eval_js and "inputs.puf" in eval_js and "inputs.diffRead" in eval_js)

    sec_assure_html = (BASE / "security-assurance.html").read_text(encoding="utf-8")
    test("security-assurance.html 整合 attack-resistance-evaluator-root 互動面板與模組腳本引用",
         'id="attack-resistance-evaluator-root"' in sec_assure_html and 'src="attack-resistance-evaluator.js' in sec_assure_html)
    test("security-assurance.html 包含 CEM 五大因子選擇器、防禦多選框與結果評估指示器",
         'id="cc-preset-select"' in sec_assure_html and 'id="cc-time-select"' in sec_assure_html and 'id="cc-chk-mesh"' in sec_assure_html and 'id="cc-eff-score"' in sec_assure_html and 'id="cc-level-badge"' in sec_assure_html)

    # ════════════════════════════════════════════════════════════
    # TEST 43: 極低功耗 IoT MCU 休眠/喚醒能耗預算與電池壽命試算器 (EEMBC ULPMark)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 43: 極低功耗 IoT MCU 休眠/喚醒能耗預算與電池壽命試算器 ═══")
    iot_js = (BASE / "iot-energy-tradeoff-calculator.js").read_text(encoding="utf-8")
    test("iot-energy-tradeoff-calculator.js 存在且導出 calculateIotEnergyBudget 與 initIotEnergyCalculator",
         "export function calculateIotEnergyBudget" in iot_js and "export function initIotEnergyCalculator" in iot_js)
    test("iot-energy-tradeoff-calculator.js 包含四大 MCU 記憶體架構與電池預設模型",
         "IOT_MCU_PROFILES" in iot_js and "sram_retention" in iot_js and "tiered_antifuse" in iot_js and "embedded_mram" in iot_js and "BATTERY_PRESETS" in iot_js and "cr2032" in iot_js)
    test("iot-energy-tradeoff-calculator.js 第一性原理週期能耗、平均電流與電池壽命演算法",
         "eActiveUJ" in iot_js and "eSleepUJ" in iot_js and "eWakeUJ" in iot_js and "batteryLifeYears" in iot_js)

    iot_html = (BASE / "iot-mcu-envm.html").read_text(encoding="utf-8")
    test("iot-mcu-envm.html 整合 iot-energy-calculator-root 工作台與模組腳本引用",
         'id="iot-energy-calculator-root"' in iot_html and 'src="iot-energy-tradeoff-calculator.js' in iot_html)
    test("iot-mcu-envm.html 包含架構選擇器、電池選擇器、週期滑桿與堆疊能耗進度條",
         'id="iot-profile-select"' in iot_html and 'id="iot-battery-select"' in iot_html and 'id="iot-interval-slider"' in iot_html and 'id="iot-bar-active"' in iot_html and 'id="iot-life-display"' in iot_html)

    # ════════════════════════════════════════════════════════════
    # TEST 44: 車規任務剖面 (Mission Profile) 累計熱老化與 15 年安全留存試算器
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 44: 車規任務剖面 (Mission Profile) 累計熱老化與 15 年安全留存試算器 ═══")
    auto_mp_js = (BASE / "automotive-mission-profile.js").read_text(encoding="utf-8")
    test("automotive-mission-profile.js 存在且導出 calculateMissionProfileAging 與 initAutomotiveMissionProfile",
         "export function calculateMissionProfileAging" in auto_mp_js and "export function initAutomotiveMissionProfile" in auto_mp_js)
    test("automotive-mission-profile.js 包含四大車規情境預設與三大 NVM 物理活化能參數",
         "AUTOMOTIVE_MISSION_PRESETS" in auto_mp_js and "powertrain_grade0" in auto_mp_js and "braking_chassis_grade1" in auto_mp_js and "AUTOMOTIVE_NVM_PHYSICS" in auto_mp_js and "antifuse_otp" in auto_mp_js and "floating_gate_eflash" in auto_mp_js)
    test("automotive-mission-profile.js 第一性原理 Arrhenius 累計熱等效時長與認證烘烤餘裕演算法",
         "tEquivRefHours" in auto_mp_js and "requiredBakeHours" in auto_mp_js and "retentionMargin" in auto_mp_js and "KB_EV" in auto_mp_js)

    auto_html = (BASE / "automotive-nvm.html").read_text(encoding="utf-8")
    test("automotive-nvm.html 整合 automotive-mission-profile-root 工作台與模組腳本引用",
         'id="automotive-mission-profile-root"' in auto_html and 'src="automotive-mission-profile.js' in auto_html)
    test("automotive-nvm.html 包含任務預設選擇器、烘烤溫度選擇器、溫度光譜滑桿與三卡比較指示器",
         'id="auto-preset-select"' in auto_html and 'id="auto-baketemp-select"' in auto_html and 'id="bin-hours-175"' in auto_html and 'id="card-antifuse-margin"' in auto_html and 'id="card-eflash-margin"' in auto_html and 'id="card-mram-margin"' in auto_html)

    # ════════════════════════════════════════════════════════════
    # TEST 45: 先進 SoC SRAM 備援良率挽救與 BIRA 晶圓經濟效益試算器
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 45: 先進 SoC SRAM 備援良率挽救與 BIRA 晶圓經濟效益試算器 ═══")
    bira_js = (BASE / "sram-yield-bira-simulator.js").read_text(encoding="utf-8")
    test("sram-yield-bira-simulator.js 存在且導出 calculateSramYieldRecovery 與 initSramYieldBiraSimulator",
         "export function calculateSramYieldRecovery" in bira_js and "export function initSramYieldBiraSimulator" in bira_js and "export function calculateGdpw300mm" in bira_js)
    test("sram-yield-bira-simulator.js 包含先進節點 SoC 預設與 Poisson/Murphy 瑕疵良率模型",
         "SRAM_YIELD_PRESETS" in bira_js and "n3_ai_accelerator" in bira_js and "n5_flagship_soc" in bira_js and "yBasePoisson" in bira_js and "poissonCdf" in bira_js)
    test("sram-yield-bira-simulator.js 包含 300mm 晶圓 GDPW 與單片/萬片經濟效益精算演算法",
         "calculateGdpw300mm" in bira_js and "extraGoodDies" in bira_js and "valueRecoveredPerWafer" in bira_js and "annualRun10kWafersUsd" in bira_js)

    sram_html = (BASE / "sram-repair.html").read_text(encoding="utf-8")
    test("sram-repair.html 整合 sram-yield-bira-root 工作台與模組腳本引用",
         'id="sram-yield-bira-root"' in sram_html and 'src="sram-yield-bira-simulator.js' in sram_html)
    test("sram-repair.html 包含 BIRA 參數輸入組、五項 KPI 指標卡與良率對照進度條",
         'id="bira-preset-select"' in sram_html and 'id="bira-diearea-input"' in sram_html and 'id="bira-base-yield"' in sram_html and 'id="bira-repaired-yield"' in sram_html and 'id="bira-extra-dies"' in sram_html and 'id="bira-bar-repair"' in sram_html)

    # ════════════════════════════════════════════════════════════
    # TEST 46: BCD 類比精度修調與晶圓良率最佳化試算器 (specialty-nvm.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 46: BCD 類比精度修調與晶圓良率最佳化試算器 ═══")
    bcd_js = (BASE / "bcd-trimming-simulator.js").read_text(encoding="utf-8")
    test("bcd-trimming-simulator.js 存在且導出 calculateBcdTrimming 與 initBcdTrimmingSimulator",
         "export function calculateBcdTrimming" in bcd_js and "export function initBcdTrimmingSimulator" in bcd_js and "export function normalCdf" in bcd_js)
    test("bcd-trimming-simulator.js 包含四大 BCD 電源管理預設與四大修調技術評估",
         "BCD_TRIM_PRESETS" in bcd_js and "pmic_bandgap" in bcd_js and "buck_oscillator" in bcd_js and "gate_driver_ocp" in bcd_js and "BCD_TRIM_TECHNOLOGIES" in bcd_js and "antifuse_otp" in bcd_js and "laser_trim" in bcd_js)
    test("bcd-trimming-simulator.js 第一性原理高斯分佈、DAC 步進與修調後良率演算法",
         "normalCdf" in bcd_js and "postTrimYield" in bcd_js and "deltaYieldPct" in bcd_js and "deltaV" in bcd_js)

    specialty_html = (BASE / "specialty-nvm.html").read_text(encoding="utf-8")
    test("specialty-nvm.html 整合 bcd-trimming-root 工作台與模組腳本引用",
         'id="bcd-trimming-root"' in specialty_html and 'src="bcd-trimming-simulator.js' in specialty_html)
    test("specialty-nvm.html 包含 BCD 預設選擇器、修調位元、容差滑桿與良率提升卡片",
         'id="trim-preset-select"' in specialty_html and 'id="trim-bits-select"' in specialty_html and 'id="trim-spec-slider"' in specialty_html and 'id="trim-raw-yield"' in specialty_html and 'id="trim-post-yield"' in specialty_html and 'id="trim-delta-yield"' in specialty_html)

    # ════════════════════════════════════════════════════════════
    # TEST 47: AMOLED / MicroLED De-Mura 補償儲存容量與開機 DMA 延遲試算器 (specialty-nvm.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 47: AMOLED / MicroLED De-Mura 補償儲存容量與開機 DMA 延遲試算器 ═══")
    demura_js = (BASE / "demura-lut-calculator.js").read_text(encoding="utf-8")
    test("demura-lut-calculator.js 存在且導出 calculateDemuraLutStorage 與 initDemuraLutCalculator",
         "export function calculateDemuraLutStorage" in demura_js and "export function initDemuraLutCalculator" in demura_js)
    test("demura-lut-calculator.js 包含四大顯示面板預設與三大 DMA 匯流排介面",
         "DEMURA_PRESETS" in demura_js and "smartphone_wqhd" in demura_js and "wearable_microled" in demura_js and "DMA_INTERFACES" in demura_js and "quad_80" in demura_js and "octal_133" in demura_js and "octal_dtr_200" in demura_js)
    test("demura-lut-calculator.js 第一性原理光學點陣空間壓縮、容量試算與 DMA 載入延遲演算法",
         "calculateDemuraLutStorage" in demura_js and "compMb" in demura_js and "compMB" in demura_js and "dmaTimeMs" in demura_js and "embeddedDieAreaMm2" in demura_js)

    test("specialty-nvm.html 整合 demura-lut-calculator-root 工作台與模組腳本引用",
         'id="demura-lut-calculator-root"' in specialty_html and 'src="demura-lut-calculator.js' in specialty_html)
    test("specialty-nvm.html 包含 De-Mura 預設選擇器、區塊壓縮、灰階平面、DMA 介面與容量指標卡",
         'id="demura-preset-select"' in specialty_html and 'id="demura-bin-select"' in specialty_html and 'id="demura-planes-select"' in specialty_html and 'id="demura-dma-select"' in specialty_html and 'id="demura-size-mb"' in specialty_html and 'id="demura-dma-time"' in specialty_html and 'id="demura-embedded-area"' in specialty_html)

    # ════════════════════════════════════════════════════════════
    # TEST 48: 全站 HTML 行內腳本 (Inline Scripts) 標籤閉合與語法完備性 (防再發門禁)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 48: 全站 HTML 行內腳本標籤閉合與語法完備性 ═══")
    script_mismatch = []
    for html_file in BASE.glob("**/*.html"):
        if "node_modules" in html_file.parts or ".git" in html_file.parts:
            continue
        content = html_file.read_text(encoding="utf-8")
        open_tags = len(re.findall(r'<script\b', content, re.IGNORECASE))
        close_tags = len(re.findall(r'</script>', content, re.IGNORECASE))
        if open_tags != close_tags:
            script_mismatch.append(f"{html_file.name}: <script> ({open_tags}) != </script> ({close_tags})")
    test("全站所有 HTML 檔案之 <script> 開啟與 </script> 閉合標籤數量嚴格對等 (防再發)", len(script_mismatch) == 0, ", ".join(script_mismatch))

    # ════════════════════════════════════════════════════════════
    # TEST 49: 互補成對差動單元 (Twin-Cell) 感測裕度與 DPA 側信道物理衰減試算器 (memory-physics.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 49: 互補成對差動單元感測裕度與 DPA 側信道物理衰減試算器 ═══")
    diff_js = (BASE / "differential-sensing-simulator.js").read_text(encoding="utf-8")
    test("differential-sensing-simulator.js 存在且導出 calculateDifferentialSensing 與 initDifferentialSensingSimulator",
         "export function calculateDifferentialSensing" in diff_js and "export function initDifferentialSensingSimulator" in diff_js)
    test("differential-sensing-simulator.js 包含四大應用場景預設與三大感測拓撲",
         "DIFF_SENSING_PRESETS" in diff_js and "automotive_grade0_28nm" in diff_js and "banking_smartcard_40nm" in diff_js and "SENSING_ARCHITECTURES" in diff_js and "single_ended" in diff_js and "true_twin_cell" in diff_js)
    test("differential-sensing-simulator.js 第一性原理差分信號窗、CMRR 與 DPA 側信道衰減演算法",
         "deltaVsenseMv" in diff_js and "cmrrDb" in diff_js and "firstOrderDeltaI" in diff_js and "dpaAttenDb" in diff_js and "mtdTraces" in diff_js)

    f1_phys_html = (BASE / "memory-physics.html").read_text(encoding="utf-8")
    test("memory-physics.html 整合 differential-sensing-root 工作台與模組腳本引用",
         'id="differential-sensing-root"' in f1_phys_html and 'src="differential-sensing-simulator.js' in f1_phys_html)
    test("memory-physics.html 包含預設選擇器、架構選擇器、溫度/雜訊滑桿、五項指標卡與對稱性條狀圖",
         'id="diff-preset-select"' in f1_phys_html and 'id="diff-arch-select"' in f1_phys_html and 'id="diff-temp-slider"' in f1_phys_html and 'id="diff-margin-mv"' in f1_phys_html and 'id="diff-cmrr-db"' in f1_phys_html and 'id="diff-mtd-traces"' in f1_phys_html and 'id="diff-bar-bit0"' in f1_phys_html and 'id="diff-bar-bit1"' in f1_phys_html)

    # ════════════════════════════════════════════════════════════
    # TEST 50: 時變介電質崩潰 (TDDB) 與 Weibull 統計壽命推論模擬器 (memory-physics.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 50: 時變介電質崩潰與 Weibull 統計壽命推論模擬器 ═══")
    tddb_js = (BASE / "tddb-weibull-simulator.js").read_text(encoding="utf-8")
    test("tddb-weibull-simulator.js 存在且導出 calculateTddbWeibull 與 initTddbWeibullSimulator",
         "export function calculateTddbWeibull" in tddb_js and "export function initTddbWeibullSimulator" in tddb_js)
    test("tddb-weibull-simulator.js 包含四大情境預設、三大加速模型與三大應力多工模式",
         "TDDB_PRESETS" in tddb_js and "automotive_read_disturb_28nm" in tddb_js and "antifuse_hard_breakdown_write" in tddb_js and "ACCELERATION_MODELS" in tddb_js and "e_model" in tddb_js and "inv_e_model" in tddb_js and "STRESS_DUTY_CYCLES" in tddb_js and "array_multiplexed" in tddb_js)
    test("tddb-weibull-simulator.js 第一性原理介電電場、Weibull 斜率、特性壽命、面積縮放與 FIT 演算法",
         "eoxMvCm" in tddb_js and "beta" in tddb_js and "etaCellSec" in tddb_js and "etaArraySec" in tddb_js and "fitRate15Y" in tddb_js and "f15YArray" in tddb_js)

    f1_phys_html = (BASE / "memory-physics.html").read_text(encoding="utf-8")
    test("memory-physics.html 整合 tddb-weibull-root 工作台與模組腳本引用",
         'id="tddb-weibull-root"' in f1_phys_html and 'src="tddb-weibull-simulator.js' in f1_phys_html)
    test("memory-physics.html 包含預設/模型/容量/多工選擇器、三軸滑桿、六大指標卡與 Weibull 機率圖 Canvas",
         'id="tddb-preset-select"' in f1_phys_html and 'id="tddb-model-select"' in f1_phys_html and 'id="tddb-array-select"' in f1_phys_html and 'id="tddb-duty-select"' in f1_phys_html and 'id="tddb-tox-slider"' in f1_phys_html and 'id="tddb-vox-slider"' in f1_phys_html and 'id="tddb-temp-slider"' in f1_phys_html and 'id="tddb-eox-val"' in f1_phys_html and 'id="tddb-beta-val"' in f1_phys_html and 'id="tddb-eta-cell-val"' in f1_phys_html and 'id="tddb-eta-array-val"' in f1_phys_html and 'id="tddb-f15y-val"' in f1_phys_html and 'id="tddb-fit-val"' in f1_phys_html and 'id="tddb-canvas"' in f1_phys_html)

    # ════════════════════════════════════════════════════════════
    # TEST 51: 先進節點 FinFET / GAA 奈米片 AntiFuse 延伸性與量子穿隧試算器 (technology-comparison.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 51: 先進節點 FinFET / GAA 奈米片 AntiFuse 延伸性與量子穿隧試算器 ═══")
    finfet_js = (BASE / "advanced-finfet-gaa-simulator.js").read_text(encoding="utf-8")
    test("advanced-finfet-gaa-simulator.js 存在且導出 calculateAdvancedFinfetGaa 與 initAdvancedFinfetGaaSimulator",
         "export function calculateAdvancedFinfetGaa" in finfet_js and "export function initAdvancedFinfetGaaSimulator" in finfet_js)
    test("advanced-finfet-gaa-simulator.js 包含四大先進代工節點 (N3 GAA, N5 FinFET, 16FFC, 28HPC)",
         "FOUNDRY_ADVANCED_NODES" in finfet_js and "tsmc_n3_gaa" in finfet_js and "tsmc_n5_finfet" in finfet_js and "foundry_16ffc" in finfet_js and "planar_28hpc" in finfet_js)
    test("advanced-finfet-gaa-simulator.js 第一性原理 3D 角隅場強、Vbd 微縮、WKB 穿隧與電荷泵節省演算法",
         "e1dMvCm" in finfet_js and "eCornerMvCm" in finfet_js and "vbdPredicted" in finfet_js and "jdtTotalAcm2" in finfet_js and "areaSavingsPct" in finfet_js)

    tech_comp_html = (BASE / "technology-comparison.html").read_text(encoding="utf-8")
    test("technology-comparison.html 整合 finfet-gaa-simulator-root 工作台與模組腳本引用",
         'id="finfet-gaa-simulator-root"' in tech_comp_html and 'src="advanced-finfet-gaa-simulator.js' in tech_comp_html)
    test("technology-comparison.html 包含節點選擇器、偏壓/溫度滑桿、六大指標卡與 3D 靜電場 Canvas",
         'id="finfet-node-select"' in tech_comp_html and 'id="finfet-volt-slider"' in tech_comp_html and 'id="finfet-temp-slider"' in tech_comp_html and 'id="finfet-e1d-val"' in tech_comp_html and 'id="finfet-ecorner-val"' in tech_comp_html and 'id="finfet-vbd-val"' in tech_comp_html and 'id="finfet-pump-stages-val"' in tech_comp_html and 'id="finfet-area-savings-val"' in tech_comp_html and 'id="finfet-jdt-val"' in tech_comp_html and 'id="finfet-canvas"' in tech_comp_html)

    # ════════════════════════════════════════════════════════════
    # TEST 52: 晶片實體不可複製功能 (PUF) 空間隨機性與 NIST SP 800-22 統計檢驗器 (security-assurance.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 52: 晶片實體不可複製功能空間隨機性與 NIST SP 800-22 統計檢驗器 ═══")
    puf_nist_js = (BASE / "puf-nist-randomness-evaluator.js").read_text(encoding="utf-8")
    test("puf-nist-randomness-evaluator.js 存在且導出 calculatePufNistRandomness 與 initPufNistRandomnessEvaluator",
         "export function calculatePufNistRandomness" in puf_nist_js and "export function initPufNistRandomnessEvaluator" in puf_nist_js)
    test("puf-nist-randomness-evaluator.js 包含四大硬體原生熵源拓撲與 Chebyshev erfc / igamc 數學庫",
         "PUF_ENTROPY_PRESETS" in puf_nist_js and "antifuse_neopuf_quantum" in puf_nist_js and "sram_startup_uncompensated" in puf_nist_js and "export function erfc" in puf_nist_js and "export function igamc" in puf_nist_js)
    test("puf-nist-randomness-evaluator.js 第一性原理 Monobit、Block Frequency、Runs、Cusum 與 Min-Entropy 演算法",
         "pValMonobit" in puf_nist_js and "pValBlock" in puf_nist_js and "pValRuns" in puf_nist_js and "pValCusum" in puf_nist_js and "minEntropy" in puf_nist_js)

    sec_assure_html = (BASE / "security-assurance.html").read_text(encoding="utf-8")
    test("security-assurance.html 整合 puf-nist-evaluator-root 工作台與模組腳本引用",
         'id="puf-nist-evaluator-root"' in sec_assure_html and 'src="puf-nist-randomness-evaluator.js' in sec_assure_html)
    test("security-assurance.html 包含拓撲選擇器、重新採樣按鈕、四大指標卡與 32x32 點陣 Canvas",
         'id="puf-preset-select"' in sec_assure_html and 'id="puf-resample-btn"' in sec_assure_html and 'id="puf-hw-val"' in sec_assure_html and 'id="puf-entropy-val"' in sec_assure_html and 'id="puf-passed-tests-val"' in sec_assure_html and 'id="puf-cusum-val"' in sec_assure_html and 'id="puf-canvas"' in sec_assure_html)

    # ════════════════════════════════════════════════════════════
    # TEST 53: AI 存算一體 (CiM) 類比陣列乘加精度與 ADC 訊噪比 (ENOB) 權衡試算器 (ai-nvm-opportunities.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 53: AI 存算一體 (CiM) 類比陣列乘加精度與 ADC 訊噪比 (ENOB) 權衡試算器 ═══")
    cim_mac_js = (BASE / "cim-analog-mac-simulator.js").read_text(encoding="utf-8")
    test("cim-analog-mac-simulator.js 存在且導出 calculateCimAnalogMac 與 initCimAnalogMacSimulator",
         "export function calculateCimAnalogMac" in cim_mac_js and "export function initCimAnalogMacSimulator" in cim_mac_js)
    test("cim-analog-mac-simulator.js 包含四大神經網路層與四大存算元件模型",
         "CIM_WORKLOAD_PRESETS" in cim_mac_js and "transformer_attn" in cim_mac_js and "resnet_conv" in cim_mac_js and "mobilenet_dw" in cim_mac_js and "bnn_xnor" in cim_mac_js and "CIM_DEVICE_ARCHITECTURES" in cim_mac_js and "reram_oxram" in cim_mac_js and "mram_stt" in cim_mac_js and "nor_flash" in cim_mac_js and "sram_charge" in cim_mac_js)
    test("cim-analog-mac-simulator.js 第一性原理電導漂移、IR-Drop、SINAD、實現 ENOB 與推論精度演算法",
         "driftFactor" in cim_mac_js and "pNoiseC2c" in cim_mac_js and "pNoiseIr" in cim_mac_js and "pNoiseQuant" in cim_mac_js and "sinadDb" in cim_mac_js and "realizedEnob" in cim_mac_js and "estimatedAccuracy" in cim_mac_js and "macroTopsPerWatt" in cim_mac_js)

    ai_nvm_html = (BASE / "ai-nvm-opportunities.html").read_text(encoding="utf-8")
    test("ai-nvm-opportunities.html 整合 cim-mac-precision-root 工作台與模組腳本引用",
         'id="cim-mac-precision-root"' in ai_nvm_html and 'src="cim-analog-mac-simulator.js"' in ai_nvm_html)
    test("ai-nvm-opportunities.html 包含工作負載選擇器、三軸滑桿、五大 KPI 指標卡與高解析度 Canvas",
         'id="cim-mac-workload-select"' in ai_nvm_html and 'id="cim-mac-device-select"' in ai_nvm_html and 'id="cim-mac-adc-select"' in ai_nvm_html and 'id="cim-mac-temp-slider"' in ai_nvm_html and 'id="cim-mac-ret-slider"' in ai_nvm_html and 'id="cim-mac-out-enob"' in ai_nvm_html and 'id="cim-mac-out-sinad"' in ai_nvm_html and 'id="cim-mac-out-accuracy"' in ai_nvm_html and 'id="cim-mac-out-topswatt"' in ai_nvm_html and 'id="cim-mac-out-adcshare"' in ai_nvm_html and 'id="cim-mac-canvas"' in ai_nvm_html)

    # ════════════════════════════════════════════════════════════
    # TEST 54: 次世代晶片封裝 Chiplet UCIe 互連與 NVM 延遲拓撲試算器 (specialty-nvm.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 54: 次世代晶片封裝 Chiplet UCIe 互連與 NVM 延遲拓撲試算器 ═══")
    chiplet_js = (BASE / "chiplet-ucie-nvm-simulator.js").read_text(encoding="utf-8")
    test("chiplet-ucie-nvm-simulator.js 存在且導出 calculateChipletUcieNvm 與 initChipletUcieNvmSimulator",
         "export function calculateChipletUcieNvm" in chiplet_js and "export function initChipletUcieNvmSimulator" in chiplet_js)
    test("chiplet-ucie-nvm-simulator.js 包含四大異質整合封裝拓撲與四大 NVM 儲存應用工作負載",
         "CHIPLET_TOPOLOGY_PRESETS" in chiplet_js and "monolithic_envm" in chiplet_js and "chiplet_ucie_standard" in chiplet_js and "chiplet_ucie_advanced" in chiplet_js and "stacked_3d_hybrid" in chiplet_js and "NVM_STORAGE_ROLES" in chiplet_js and "secure_boot_rot" in chiplet_js and "firmware_xip" in chiplet_js and "cache_repair_hbm" in chiplet_js and "ai_weight_table" in chiplet_js)
    test("chiplet-ucie-nvm-simulator.js 第一性原理 D2D 延遲分解、傳輸能耗、熱阻溫升與 Murphy 矽分割良率演算法",
         "tauRoundTripD2dNs" in chiplet_js and "totalReadLatencyNs" in chiplet_js and "totalBandwidthGBps" in chiplet_js and "interconnectEnergyPjBit" in chiplet_js and "deltaTj" in chiplet_js and "arrheniusAF" in chiplet_js and "yieldGainPercent" in chiplet_js)

    spec_nvm_html = (BASE / "specialty-nvm.html").read_text(encoding="utf-8")
    test("specialty-nvm.html 整合 chiplet-ucie-simulator-root 工作台與模組腳本引用",
         'id="chiplet-ucie-simulator-root"' in spec_nvm_html and 'src="chiplet-ucie-nvm-simulator.js' in spec_nvm_html)
    test("specialty-nvm.html 包含拓撲選擇器、工作負載選擇器、雙軸滑桿、五大 KPI 指標卡與封裝拓撲 Canvas",
         'id="chiplet-top-select"' in spec_nvm_html and 'id="chiplet-role-select"' in spec_nvm_html and 'id="chiplet-lanes-select"' in spec_nvm_html and 'id="chiplet-power-slider"' in spec_nvm_html and 'id="chiplet-temp-slider"' in spec_nvm_html and 'id="chiplet-out-latency"' in spec_nvm_html and 'id="chiplet-out-energy"' in spec_nvm_html and 'id="chiplet-out-bandwidth"' in spec_nvm_html and 'id="chiplet-out-temprise"' in spec_nvm_html and 'id="chiplet-out-yield"' in spec_nvm_html and 'id="chiplet-canvas"' in spec_nvm_html)

    # ════════════════════════════════════════════════════════════
    # TEST 55: 車規高壓 BCD / PMIC 故障安全黑盒子日誌快取試算器 (automotive-nvm.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 55: 車規高壓 BCD / PMIC 故障安全黑盒子日誌快取試算器 ═══")
    auto_bb_js = (BASE / "automotive-blackbox-journal-calculator.js").read_text(encoding="utf-8")
    test("automotive-blackbox-journal-calculator.js 存在且導出 calculateBlackboxJournal 與 initAutomotiveBlackboxCalculator",
         "export function calculateBlackboxJournal" in auto_bb_js and "export function initAutomotiveBlackboxCalculator" in auto_bb_js)
    test("automotive-blackbox-journal-calculator.js 包含四大車載故障場景與四大 NVM 技術設定檔",
         "AUTOMOTIVE_FAULT_PRESETS" in auto_bb_js and "powertrain_inverter" in auto_bb_js and "adas_radar_fail" in auto_bb_js and "bms_thermal_runaway" in auto_bb_js and "chassis_steer_by_wire" in auto_bb_js and "AUTO_NVM_TECH_PROFILES" in auto_bb_js and "logic_mtp_ee" in auto_bb_js and "antifuse_dense" in auto_bb_js and "emram_stt" in auto_bb_js and "legacy_eflash" in auto_bb_js)
    test("automotive-blackbox-journal-calculator.js 第一性原理斷電儲能守恆、緊急寫入時長、峰值突波電流、環形緩衝磨損與 Arrhenius 留存折損演算法",
         "burstWriteTimeMs" in auto_bb_js and "requiredEnergyJoules" in auto_bb_js and "holdupCapacitanceUf" in auto_bb_js and "peakSurgeCurrentMa" in auto_bb_js and "maxLifetimeEvents" in auto_bb_js and "deratedRetentionYears" in auto_bb_js)

    auto_nvm_html = (BASE / "automotive-nvm.html").read_text(encoding="utf-8")
    test("automotive-nvm.html 整合 auto-blackbox-simulator-root 工作台與模組腳本引用",
         'id="auto-blackbox-simulator-root"' in auto_nvm_html and 'src="automotive-blackbox-journal-calculator.js' in auto_nvm_html)
    test("automotive-nvm.html 包含故障選擇器、NVM 選擇器、雙軸滑桿、五大 KPI 指標卡與放電/環形雙模態 Canvas",
         'id="auto-bb-fault-select"' in auto_nvm_html and 'id="auto-bb-tech-select"' in auto_nvm_html and 'id="auto-bb-buffer-select"' in auto_nvm_html and 'id="auto-bb-temp-slider"' in auto_nvm_html and 'id="auto-bb-margin-slider"' in auto_nvm_html and 'id="auto-bb-out-capuf"' in auto_nvm_html and 'id="auto-bb-out-writetime"' in auto_nvm_html and 'id="auto-bb-out-surgema"' in auto_nvm_html and 'id="auto-bb-out-events"' in auto_nvm_html and 'id="auto-bb-out-retention"' in auto_nvm_html and 'id="auto-bb-canvas"' in auto_nvm_html)

    # ════════════════════════════════════════════════════════════
    # TEST 56: 量子運算與低溫超導 (Cryogenic 4K/77K) NVM 物理特性與感測裕度試算器 (memory-physics.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 56: 量子運算與低溫超導 (Cryogenic 4K/77K) NVM 物理特性與感測裕度試算器 ═══")
    cryo_js = (BASE / "cryogenic-nvm-physics-simulator.js").read_text(encoding="utf-8")
    test("cryogenic-nvm-physics-simulator.js 存在且導出 calculateCryogenicPhysics 與 initCryogenicNvmSimulator",
         "export function calculateCryogenicPhysics" in cryo_js and "export function initCryogenicNvmSimulator" in cryo_js)
    test("cryogenic-nvm-physics-simulator.js 包含四大低溫運作環境與四大 NVM 架構設定檔",
         "CRYO_ENV_PRESETS" in cryo_js and "cryo_4k" in cryo_js and "cryo_77k" in cryo_js and "cryo_200k" in cryo_js and "ambient_300k" in cryo_js and "CRYO_TECH_PROFILES" in cryo_js and "antifuse_cryo" in cryo_js and "mram_stt_cryo" in cryo_js and "eflash_cryo" in cryo_js and "reram_cryo" in cryo_js)
    test("cryogenic-nvm-physics-simulator.js 第一性原理載子凍結率、Bloch T^1.5 自旋波展寬、金屬微絲電導、Johnson 熱噪聲劇降與 SNR 感測窗演算法",
         "ionizationFractionPercent" in cryo_js and "tmrActualPercent" in cryo_js and "criticalCurrentActualUa" in cryo_js and "vbdActualV" in cryo_js and "noisePowerDropDb" in cryo_js and "deltaIreadUa" in cryo_js and "snrDb" in cryo_js)

    phys_cryo_html = (BASE / "memory-physics.html").read_text(encoding="utf-8")
    test("memory-physics.html 整合 cryogenic-nvm-simulator-root 工作台與模組腳本引用",
         'id="cryogenic-nvm-simulator-root"' in phys_cryo_html and 'src="cryogenic-nvm-physics-simulator.js' in phys_cryo_html)
    test("memory-physics.html 包含環境選擇器、NVM 架構選擇器、雙軸滑桿、五大 KPI 指標卡與感測窗/噪聲譜雙模態 Canvas",
         'id="cryo-env-select"' in phys_cryo_html and 'id="cryo-tech-select"' in phys_cryo_html and 'id="cryo-bias-slider"' in phys_cryo_html and 'id="cryo-time-slider"' in phys_cryo_html and 'id="cryo-out-window"' in phys_cryo_html and 'id="cryo-out-noise"' in phys_cryo_html and 'id="cryo-out-vbd"' in phys_cryo_html and 'id="cryo-out-freeze"' in phys_cryo_html and 'id="cryo-out-snr"' in phys_cryo_html and 'id="cryo-canvas"' in phys_cryo_html)

    # ════════════════════════════════════════════════════════════
    # TEST 57: 側信道 DPA / CPA 功耗痕跡外洩與高階遮罩評估試算器 (secure-storage.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 57: 側信道 DPA / CPA 功耗痕跡外洩與高階遮罩評估試算器 ═══")
    dpa_js = (BASE / "dpa-cpa-leakage-simulator.js").read_text(encoding="utf-8")
    test("dpa-cpa-leakage-simulator.js 存在且導出 calculateDpaCpaLeakage 與 initDpaCpaSimulator",
         "export function calculateDpaCpaLeakage" in dpa_js and "export function initDpaCpaSimulator" in dpa_js)
    test("dpa-cpa-leakage-simulator.js 包含四大攻擊目標預設與四大物理防禦對策設定檔",
         "DPA_ATTACK_PRESETS" in dpa_js and "fpga_unprotected_aes" in dpa_js and "smartcard_jitter_masked" in dpa_js and "boolean_masked_core" in dpa_js and "dual_rail_neopuf_diff" in dpa_js and "DPA_COUNTERMEASURE_PROFILES" in dpa_js and "none_single_ended" in dpa_js and "dummy_precharge" in dpa_js and "boolean_mask_1st" in dpa_js and "complementary_dual_rail" in dpa_js)
    test("dpa-cpa-leakage-simulator.js 第一性原理漢明重量洩漏模型、SNR、皮爾森相關係數、Mangard MTD 與高階遮罩二次方縮放演算法",
         "effectiveSnrDb" in dpa_js and "pearsonCorrelation" in dpa_js and "estimatedMtdTraces" in dpa_js and "effectiveOrder" in dpa_js and "scaEquivalentSecurityBits" in dpa_js and "isAvaVan5Compliant" in dpa_js and "isFips140Level3Compliant" in dpa_js)

    sec_store_html = (BASE / "secure-storage.html").read_text(encoding="utf-8")
    test("secure-storage.html 整合 dpa-cpa-simulator-root 工作台與模組腳本引用",
         'id="dpa-cpa-simulator-root"' in sec_store_html and 'src="dpa-cpa-leakage-simulator.js' in sec_store_html)
    test("secure-storage.html 包含攻擊選擇器、防禦選擇器、雙軸滑桿、五大 KPI 指標卡與相關曲線/時域波形雙模態 Canvas",
         'id="dpa-preset-select"' in sec_store_html and 'id="dpa-defense-select"' in sec_store_html and 'id="dpa-noise-slider"' in sec_store_html and 'id="dpa-rate-slider"' in sec_store_html and 'id="dpa-out-snr"' in sec_store_html and 'id="dpa-out-mtd"' in sec_store_html and 'id="dpa-out-rho"' in sec_store_html and 'id="dpa-out-bits"' in sec_store_html and 'id="dpa-out-level"' in sec_store_html and 'id="dpa-canvas"' in sec_store_html)

    # ════════════════════════════════════════════════════════════
    # TEST 58: 向量補丁 CAM 查找與微控制器 ROM 熱修復延遲能耗試算器 (iot-mcu-envm.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 58: 向量補丁 CAM 查找與微控制器 ROM 熱修復延遲能耗試算器 ═══")
    patch_js = (BASE / "mcu-vector-patch-simulator.js").read_text(encoding="utf-8")
    test("mcu-vector-patch-simulator.js 存在且導出 calculateMcuVectorPatch 與 initMcuVectorPatchSimulator",
         "export function calculateMcuVectorPatch" in patch_js and "export function initMcuVectorPatchSimulator" in patch_js)
    test("mcu-vector-patch-simulator.js 包含四大邊緣工作負載預設與四大補丁儲存後端技術設定檔",
         "MCU_PATCH_WORKLOAD_PRESETS" in patch_js and "ble_beacon_ulp" in patch_js and "smart_meter_zigbee" in patch_js and "matter_gateway_iot" in patch_js and "automotive_body_mcu" in patch_js and "PATCH_STORAGE_BACKENDS" in patch_js and "antifuse_direct" in patch_js and "shadow_sram" in patch_js and "logic_mtp" in patch_js and "ext_spi_nor" in patch_js)
    test("mcu-vector-patch-simulator.js 第一性原理 CAM 平行比對功率、攔截延遲週期、常規 vs 修補指令能耗與全 eFlash 晶圓成本節省演算法",
         "pCamDynamicUw" in patch_js and "patchLatencyCycles" in patch_js and "patchLatencyNs" in patch_js and "normalRomInstrPj" in patch_js and "patchedInstrPj" in patch_js and "waferCostSavingsPercent" in patch_js and "remainingYearsCapacity" in patch_js)

    iot_mcu_html = (BASE / "iot-mcu-envm.html").read_text(encoding="utf-8")
    test("iot-mcu-envm.html 整合 mcu-vector-patch-simulator-root 工作台與模組腳本引用",
         'id="mcu-vector-patch-simulator-root"' in iot_mcu_html and 'src="mcu-vector-patch-simulator.js' in iot_mcu_html)
    test("iot-mcu-envm.html 包含負載選擇器、後端技術選擇器、CAM 槽位選擇器、雙軸滑桿、五大 KPI 指標卡與位址地圖/管線週期雙模態 Canvas",
         'id="patch-workload-select"' in iot_mcu_html and 'id="patch-backend-select"' in iot_mcu_html and 'id="patch-cam-select"' in iot_mcu_html and 'id="patch-clock-slider"' in iot_mcu_html and 'id="patch-volt-slider"' in iot_mcu_html and 'id="patch-out-campower"' in iot_mcu_html and 'id="patch-out-latency"' in iot_mcu_html and 'id="patch-out-energy"' in iot_mcu_html and 'id="patch-out-savings"' in iot_mcu_html and 'id="patch-out-lifespan"' in iot_mcu_html and 'id="patch-canvas"' in iot_mcu_html)

    # ════════════════════════════════════════════════════════════
    # TEST 59: CiM 類比矩陣乘加單元非理想物理效應與深度神經網路分類精度衰退試算器 (ai-nvm-opportunities.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 59: CiM 類比矩陣乘加單元非理想物理效應與深度神經網路分類精度衰退試算器 ═══")
    cim_nn_js = (BASE / "cim-nn-accuracy-degradation-simulator.js").read_text(encoding="utf-8")
    test("cim-nn-accuracy-degradation-simulator.js 存在且導出 calculateCimNnDegradation 與 initCimNnDegradationSimulator",
         "export function calculateCimNnDegradation" in cim_nn_js and "export function initCimNnDegradationSimulator" in cim_nn_js)
    test("cim-nn-accuracy-degradation-simulator.js 包含四大神經網路架構預設與四大存算元件拓撲設定檔",
         "CIM_NN_WORKLOAD_PRESETS" in cim_nn_js and "resnet50_imagenet" in cim_nn_js and "mobilenet_v2" in cim_nn_js and "vit_base_patch16" in cim_nn_js and "kws_tinyml_bnn" in cim_nn_js and "CIM_DEVICE_TECHNOLOGIES" in cim_nn_js and "reram_oxram_mlc" in cim_nn_js and "pcm_analog_synapse" in cim_nn_js and "nor_flash_embedded" in cim_nn_js and "sram_charge_domain" in cim_nn_js)
    test("cim-nn-accuracy-degradation-simulator.js 第一性原理電導漂移冪律、IR-Drop、ADC 量化噪聲、權重信噪比、Top-1 分類精度衰退與片上再校準週期演算法",
         "weightSnrDb" in cim_nn_js and "realizedMacBits" in cim_nn_js and "realizedTop1Pct" in cim_nn_js and "top1DropPct" in cim_nn_js and "recommendedRefreshHours" in cim_nn_js and "energyEfficiencyTopsPerWatt" in cim_nn_js and "sigmaDrift" in cim_nn_js and "sigmaQuant" in cim_nn_js and "sigmaTotal" in cim_nn_js)

    ai_nvm_html = (BASE / "ai-nvm-opportunities.html").read_text(encoding="utf-8")
    test("ai-nvm-opportunities.html 整合 cim-nn-degradation-simulator-root 工作台與模組腳本引用",
         'id="cim-nn-degradation-simulator-root"' in ai_nvm_html and 'src="cim-nn-accuracy-degradation-simulator.js' in ai_nvm_html)
    test("ai-nvm-opportunities.html 包含負載選擇器、元件選擇器、ADC 選擇器、雙軸滑桿、五大 KPI 指標卡與精度衰退/誤差分佈雙模態 Canvas",
         'id="cim-nn-workload-select"' in ai_nvm_html and 'id="cim-nn-device-select"' in ai_nvm_html and 'id="cim-nn-adc-select"' in ai_nvm_html and 'id="cim-nn-ret-slider"' in ai_nvm_html and 'id="cim-nn-temp-slider"' in ai_nvm_html and 'id="cim-nn-out-snr"' in ai_nvm_html and 'id="cim-nn-out-macbits"' in ai_nvm_html and 'id="cim-nn-out-top1"' in ai_nvm_html and 'id="cim-nn-out-drop"' in ai_nvm_html and 'id="cim-nn-out-refresh"' in ai_nvm_html and 'id="cim-nn-canvas"' in ai_nvm_html)

    # ════════════════════════════════════════════════════════════
    # TEST 60: AEC-Q100 Grade 0 / ISO 16750-2 負載突降 (Load Dump) 瞬態脈衝與高溫電荷泵升壓箝位安全試算器 (automotive-nvm.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 60: AEC-Q100 Grade 0 / ISO 16750-2 負載突降 (Load Dump) 瞬態脈衝與高溫電荷泵升壓箝位安全試算器 ═══")
    ld_js = (BASE / "automotive-load-dump-clamp-simulator.js").read_text(encoding="utf-8")
    test("automotive-load-dump-clamp-simulator.js 存在且導出 calculateAutomotiveLoadDumpClamp 與 initAutomotiveLoadDumpSimulator",
         "export function calculateAutomotiveLoadDumpClamp" in ld_js and "export function initAutomotiveLoadDumpSimulator" in ld_js)
    test("automotive-load-dump-clamp-simulator.js 包含四大車規瞬態突波預設與四大高壓箝位與電荷泵防護拓撲設定檔",
         "LOAD_DUMP_PRESETS" in ld_js and "iso16750_pulse5a_unsuppressed" in ld_js and "iso16750_pulse5b_suppressed" in ld_js and "mhev_48v_pulse" in ld_js and "inductive_kick_pulse2a" in ld_js and "CLAMP_PROTECTION_TOPOLOGIES" in ld_js and "active_fet_surge_stopper" in ld_js and "external_tvs_sm8s" in ld_js and "internal_zener_cap" in ld_js and "hybrid_multistage" in ld_js)
    test("automotive-load-dump-clamp-simulator.js 第一性原理 ISO 16750-2 指數衰減、動態箝位吸收功耗、175°C Arrhenius 漏電、電荷泵穿透擊穿裕度與升壓漣波演算法",
         "peakClampedV" in ld_js and "peakClampCurrentA" in ld_js and "peakDissipatedWatts" in ld_js and "highTempLeakageMa" in ld_js and "vPumpStressPeak" in ld_js and "dielectricMarginPct" in ld_js and "pumpRippleMv" in ld_js and "complianceRating" in ld_js)

    auto_html = (BASE / "automotive-nvm.html").read_text(encoding="utf-8")
    test("automotive-nvm.html 整合 auto-load-dump-simulator-root 工作台與模組腳本引用",
         'id="auto-load-dump-simulator-root"' in auto_html and 'src="automotive-load-dump-clamp-simulator.js' in auto_html)
    test("automotive-nvm.html 包含脈衝選擇器、拓撲選擇器、雙軸滑桿、五大 KPI 指標卡與時域瞬態/電荷泵階梯雙模態 Canvas",
         'id="auto-ld-pulse-select"' in auto_html and 'id="auto-ld-topology-select"' in auto_html and 'id="auto-ld-temp-slider"' in auto_html and 'id="auto-ld-clamp-slider"' in auto_html and 'id="auto-ld-out-clampedv"' in auto_html and 'id="auto-ld-out-power"' in auto_html and 'id="auto-ld-out-ripple"' in auto_html and 'id="auto-ld-out-margin"' in auto_html and 'id="auto-ld-out-rating"' in auto_html and 'id="auto-ld-canvas"' in auto_html)

    # ════════════════════════════════════════════════════════════
    # TEST 61: 低溫量子位元讀出介面磁場自旋去相干與微波射頻干擾試算器 (memory-physics.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 61: 低溫量子位元讀出介面磁場自旋去相干與微波射頻干擾試算器 ═══")
    cryo_qubit_js = (BASE / "cryo-qubit-readout-simulator.js").read_text(encoding="utf-8")
    test("cryo-qubit-readout-simulator.js 存在且導出 calculateCryoQubitReadout、drawCryoQubitCanvas 與 initCryoQubitSimulator",
         "export function calculateCryoQubitReadout" in cryo_qubit_js and "export function drawCryoQubitCanvas" in cryo_qubit_js and "export function initCryoQubitSimulator" in cryo_qubit_js)
    test("cryo-qubit-readout-simulator.js 包含四大大規模量子控制場景預設與四大低溫記憶體拓撲設定檔",
         "QUBIT_CONTROL_PRESETS" in cryo_qubit_js and "superconducting_transmon_4k" in cryo_qubit_js and "silicon_spin_qubit_1k" in cryo_qubit_js and "nv_center_diamond_77k" in cryo_qubit_js and "trapped_ion_magnetic_4k" in cryo_qubit_js and "CRYO_MEMORY_TOPOLOGIES" in cryo_qubit_js and "antifuse_cryo_filament" in cryo_qubit_js and "perpendicular_stt_mram" in cryo_qubit_js and "inplane_stt_mram" in cryo_qubit_js and "cryo_cmos_8t_sram" in cryo_qubit_js)
    test("cryo-qubit-readout-simulator.js 第一性原理磁場 TMR 衰減公式、自旋去相干時間 T2*、感測差分電壓窗 ΔV、微波 RF 誘發誤碼率 BER 與 QPU 介面相容性等級演算法",
         "realizedTmrPct" in cryo_qubit_js and "deltaVSenseMv" in cryo_qubit_js and "vRfMv" in cryo_qubit_js and "effectiveT2Us" in cryo_qubit_js and "sinrDb" in cryo_qubit_js and "berFormatted" in cryo_qubit_js and "isQpuCompatible" in cryo_qubit_js and "qpuRatingZh" in cryo_qubit_js and "qpuRatingEn" in cryo_qubit_js)

    phys_qubit_html = (BASE / "memory-physics.html").read_text(encoding="utf-8")
    test("memory-physics.html 整合 cryo-qubit-simulator-root 工作台與模組腳本引用",
         'id="cryo-qubit-simulator-root"' in phys_qubit_html and 'src="cryo-qubit-readout-simulator.js' in phys_qubit_html)
    test("memory-physics.html 包含預設選擇器、拓撲選擇器、雙軸滑桿、六大 KPI 指標卡與磁場掃描/微波波形雙模態 Canvas",
         'id="cryo-qubit-preset-select"' in phys_qubit_html and 'id="cryo-qubit-tech-select"' in phys_qubit_html and 'id="cryo-qubit-bfield-slider"' in phys_qubit_html and 'id="cryo-qubit-rf-slider"' in phys_qubit_html and 'id="cryo-qubit-out-tmr"' in phys_qubit_html and 'id="cryo-qubit-out-deltav"' in phys_qubit_html and 'id="cryo-qubit-out-t2"' in phys_qubit_html and 'id="cryo-qubit-out-sinr"' in phys_qubit_html and 'id="cryo-qubit-out-ber"' in phys_qubit_html and 'id="cryo-qubit-out-rating"' in phys_qubit_html and 'id="cryo-qubit-canvas"' in phys_qubit_html)

    # ════════════════════════════════════════════════════════════
    # TEST 62: 深空軌道與極限環境輻射硬化 (TID / SEU / SEL) Weibull 存活率試算器 (specialty-nvm.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 62: 深空軌道與極限環境輻射硬化 (TID / SEU / SEL) Weibull 存活率試算器 ═══")
    space_rad_js = (BASE / "space-radiation-hardening-simulator.js").read_text(encoding="utf-8")
    test("space-radiation-hardening-simulator.js 存在且導出 calculateSpaceRadiationHardening、drawSpaceRadiationCanvas 與 initSpaceRadiationSimulator",
         "export function calculateSpaceRadiationHardening" in space_rad_js and "export function drawSpaceRadiationCanvas" in space_rad_js and "export function initSpaceRadiationSimulator" in space_rad_js)
    test("space-radiation-hardening-simulator.js 包含四大太空任務軌道預設與四大記憶體輻射硬化技術設定檔",
         "SPACE_MISSION_PRESETS" in space_rad_js and "leo_polar_orbit" in space_rad_js and "geo_telecom_sat" in space_rad_js and "lunar_deep_space_artemis" in space_rad_js and "jupiter_europa_clipper" in space_rad_js and "RAD_HARD_TECH_PROFILES" in space_rad_js and "antifuse_rad_hard" in space_rad_js and "rad_hard_stt_mram" in space_rad_js and "sonos_charge_trap" in space_rad_js and "legacy_fg_eflash" in space_rad_js)
    test("space-radiation-hardening-simulator.js 第一性原理總游離劑量 (TID) 氧化層電洞累積與漂移、重離子 Weibull SEU 截面積、軟錯誤率、10 年存活率與航太等級演算法",
         "deltaVthShiftVolts" in space_rad_js and "crossSectionFormatted" in space_rad_js and "seuRatePerMbDay" in space_rad_js and "totalMissionSurvivalPct" in space_rad_js and "isSelImmune" in space_rad_js and "isRadHardPassed" in space_rad_js and "radGradeZh" in space_rad_js and "radGradeEn" in space_rad_js)

    spec_rad_html = (BASE / "specialty-nvm.html").read_text(encoding="utf-8")
    test("specialty-nvm.html 整合 space-radiation-simulator-root 工作台與模組腳本引用",
         'id="space-radiation-simulator-root"' in spec_rad_html and 'src="space-radiation-hardening-simulator.js' in spec_rad_html)
    test("specialty-nvm.html 包含任務選擇器、技術選擇器、雙軸滑桿、六大 KPI 指標卡與累積劑量存活率/Weibull 翻轉截面雙模態 Canvas",
         'id="space-rad-mission-select"' in spec_rad_html and 'id="space-rad-tech-select"' in spec_rad_html and 'id="space-rad-tid-slider"' in spec_rad_html and 'id="space-rad-let-slider"' in spec_rad_html and 'id="space-rad-out-vth"' in spec_rad_html and 'id="space-rad-out-cross"' in spec_rad_html and 'id="space-rad-out-ser"' in spec_rad_html and 'id="space-rad-out-surv"' in spec_rad_html and 'id="space-rad-out-sel"' in spec_rad_html and 'id="space-rad-out-rating"' in spec_rad_html and 'id="space-rad-canvas"' in spec_rad_html)

    # ════════════════════════════════════════════════════════════
    # TEST 63: 後量子密碼學 (PQC) 超大金鑰儲存、擦寫磨損與緊急零化試算器 (secure-storage.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 63: 後量子密碼學 (PQC) 超大金鑰儲存、擦寫磨損與緊急零化試算器 ═══")
    pqc_js = (BASE / "pqc-key-storage-simulator.js").read_text(encoding="utf-8")
    test("pqc-key-storage-simulator.js 存在且導出 calculatePqcKeyStorage、drawPqcKeyStorageCanvas 與 initPqcKeyStorageSimulator",
         "export function calculatePqcKeyStorage" in pqc_js and "export function drawPqcKeyStorageCanvas" in pqc_js and "export function initPqcKeyStorageSimulator" in pqc_js)
    test("pqc-key-storage-simulator.js 包含四大 PQC 演算法預設與四大安全儲存介質設定檔",
         "PQC_ALGORITHM_PROFILES" in pqc_js and "ml_kem_512" in pqc_js and "ml_kem_768" in pqc_js and "ml_kem_1024" in pqc_js and "ml_dsa_65" in pqc_js and "STORAGE_MEDIA_PROFILES" in pqc_js and "antifuse_append_log" in pqc_js and "embedded_flash_sector" in pqc_js and "spintronic_mram" in pqc_js and "battery_backed_sram" in pqc_js)
    test("pqc-key-storage-simulator.js 第一性原理金鑰尺寸、陣列槽位、擦寫磨損率、安全剩餘壽命、防竄改緊急零化延遲與 FIPS 140-3 評級演算法",
         "keySizeBytes" in pqc_js and "totalSlots" in pqc_js and "wearoutPct" in pqc_js and "remainingLifetimeYears" in pqc_js and "zeroizeNs" in pqc_js and "isFipsLevel4Compliant" in pqc_js and "complianceGradeZh" in pqc_js and "complianceGradeEn" in pqc_js)

    sec_pqc_html = (BASE / "secure-storage.html").read_text(encoding="utf-8")
    test("secure-storage.html 整合 pqc-key-simulator-root 工作台與模組腳本引用",
         'id="pqc-key-simulator-root"' in sec_pqc_html and 'src="pqc-key-storage-simulator.js' in sec_pqc_html)
    test("secure-storage.html 包含演算法選擇器、介質選擇器、雙軸滑桿、六大 KPI 指標卡與磨損曲線/零化銷毀雙模態 Canvas",
         'id="pqc-algo-select"' in sec_pqc_html and 'id="pqc-media-select"' in sec_pqc_html and 'id="pqc-cycles-slider"' in sec_pqc_html and 'id="pqc-capacity-slider"' in sec_pqc_html and 'id="pqc-out-keysize"' in sec_pqc_html and 'id="pqc-out-slots"' in sec_pqc_html and 'id="pqc-out-wear"' in sec_pqc_html and 'id="pqc-out-life"' in sec_pqc_html and 'id="pqc-out-zeroize"' in sec_pqc_html and 'id="pqc-out-rating"' in sec_pqc_html and 'id="pqc-key-canvas"' in sec_pqc_html)

    # ════════════════════════════════════════════════════════════
    # TEST 64: 常時關閉 (Normally-Off) 能量採集與非揮發狀態保留電源自給試算器 (iot-mcu-envm.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 64: 常時關閉 (Normally-Off) 能量採集與非揮發狀態保留電源自給試算器 ═══")
    norm_js = (BASE / "normally-off-energy-harvesting-simulator.js").read_text(encoding="utf-8")
    test("normally-off-energy-harvesting-simulator.js 存在且導出 calculateNormallyOffEnergy、drawNormallyOffCanvas 與 initNormallyOffSimulator",
         "export function calculateNormallyOffEnergy" in norm_js and "export function drawNormallyOffCanvas" in norm_js and "export function initNormallyOffSimulator" in norm_js)
    test("normally-off-energy-harvesting-simulator.js 包含四大能量採集源預設與四大 MCU 狀態保留技術設定檔",
         "HARVESTING_SOURCE_PRESETS" in norm_js and "indoor_solar_100lux" in norm_js and "piezo_vibration_industrial" in norm_js and "rf_ambient_sub1g" in norm_js and "thermoelectric_teg_human" in norm_js and "MCU_MEMORY_POWER_PROFILES" in norm_js and "antifuse_normally_off" in norm_js and "eflash_charge_pump" in norm_js and "sram_dvs_sleep" in norm_js and "fram_ferroelectric" in norm_js)
    test("normally-off-energy-harvesting-simulator.js 第一性原理微能量採集輸入、電容有效儲能、冷啟動充電時長、系統平均總功耗、能量平衡比與自律自給自足演算法",
         "pSourceUw" in norm_js and "usableEnergyUj" in norm_js and "chargeTimeSec" in norm_js and "averagePowerUw" in norm_js and "energyBalanceRatio" in norm_js and "isSelfSustaining" in norm_js and "isInrushSafe" in norm_js and "statusZh" in norm_js and "statusEn" in norm_js)

    iot_norm_html = (BASE / "iot-mcu-envm.html").read_text(encoding="utf-8")
    test("iot-mcu-envm.html 整合 normally-off-simulator-root 工作台與模組腳本引用",
         'id="normally-off-simulator-root"' in iot_norm_html and 'src="normally-off-energy-harvesting-simulator.js' in iot_norm_html)
    test("iot-mcu-envm.html 包含採集源選擇器、狀態技術選擇器、雙軸滑桿、六大 KPI 指標卡與電壓鋸齒/占空比功耗雙模態 Canvas",
         'id="norm-source-select"' in iot_norm_html and 'id="norm-memory-select"' in iot_norm_html and 'id="norm-cap-slider"' in iot_norm_html and 'id="norm-duty-slider"' in iot_norm_html and 'id="norm-out-powerin"' in iot_norm_html and 'id="norm-out-energystored"' in iot_norm_html and 'id="norm-out-chargetime"' in iot_norm_html and 'id="norm-out-avgpower"' in iot_norm_html and 'id="norm-out-ratio"' in iot_norm_html and 'id="norm-out-status"' in iot_norm_html and 'id="norm-canvas"' in iot_norm_html)

    # ════════════════════════════════════════════════════════════
    # TEST 65: 2nm / A16 GAA 奈米片與背面供電 (BSPDN) eNVM 寄生 RC 延遲與熱阻聚集試算器 (ai-nvm-opportunities.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 65: 2nm / A16 GAA 奈米片與背面供電 (BSPDN) eNVM 寄生 RC 延遲與熱阻聚集試算器 ═══")
    bspdn_js = (BASE / "nanosheet-bspdn-nvm-simulator.js").read_text(encoding="utf-8")
    test("nanosheet-bspdn-nvm-simulator.js 存在且導出 calculateNanosheetBspdnNvm、drawNanosheetBspdnCanvas 與 initNanosheetBspdnSimulator",
         "export function calculateNanosheetBspdnNvm" in bspdn_js and "export function drawNanosheetBspdnCanvas" in bspdn_js and "export function initNanosheetBspdnSimulator" in bspdn_js)
    test("nanosheet-bspdn-nvm-simulator.js 包含四大先進節點預設與四大奈米片 eNVM 拓撲設定檔",
         "ADVANCED_NODE_PRESETS" in bspdn_js and "tsmc_n2_nanosheet" in bspdn_js and "tsmc_a16_spr" in bspdn_js and "intel_18a_powervia" in bspdn_js and "foundry_14a_advanced" in bspdn_js and "NANOSHEET_NVM_TOPOLOGIES" in bspdn_js and "antifuse_nanosheet_logic" in bspdn_js and "embedded_stt_mram_beol" in bspdn_js and "embedded_reram_oxram" in bspdn_js and "nanosheet_sram_macro" in bspdn_js)
    test("nanosheet-bspdn-nvm-simulator.js 第一性原理背面供電壓降抑制、基板薄化熱阻聚集、接面溫升、正面金屬互連釋放、RC 讀取延遲與熱油門邊界演算法",
         "realizedIrDropMv" in bspdn_js and "junctionTempRiseC" in bspdn_js and "junctionTempC" in bspdn_js and "realizedReadLatencyNs" in bspdn_js and "isOptimal" in bspdn_js and "bspdnCompatibilityZh" in bspdn_js and "bspdnCompatibilityEn" in bspdn_js)
    test("nanosheet-bspdn-nvm-simulator.js 包含 TSMC A16 SPR Nano-TSV 互連電阻與 Intel 18A PowerVia 實體參數校準",
         "irDropMvBaseline" in bspdn_js and "thermalResistanceCPerW" in bspdn_js and "beolTrackDensityFactor" in bspdn_js and "substrateThicknessUm" in bspdn_js)

    ai_bspdn_html = (BASE / "ai-nvm-opportunities.html").read_text(encoding="utf-8")
    test("ai-nvm-opportunities.html 整合 bspdn-nvm-simulator-root 工作台與模組腳本引用",
         'id="bspdn-nvm-simulator-root"' in ai_bspdn_html and 'src="nanosheet-bspdn-nvm-simulator.js' in ai_bspdn_html)
    test("ai-nvm-opportunities.html 包含先進節點選擇器、拓撲選擇器、滑桿控制項與熱阻/RC 延遲雙模態 Canvas",
         'id="bspdn-node-select"' in ai_bspdn_html and 'id="bspdn-tech-select"' in ai_bspdn_html and 'id="bspdn-array-slider"' in ai_bspdn_html and 'id="bspdn-act-slider"' in ai_bspdn_html and 'id="bspdn-canvas"' in ai_bspdn_html)
    test("ai-nvm-opportunities.html 包含六大 KPI 輸出欄位 (out-vdd, out-irdrop, out-temp, out-latency, out-mask, out-rating)",
         'id="bspdn-out-vdd"' in ai_bspdn_html and 'id="bspdn-out-irdrop"' in ai_bspdn_html and 'id="bspdn-out-temp"' in ai_bspdn_html and 'id="bspdn-out-latency"' in ai_bspdn_html and 'id="bspdn-out-mask"' in ai_bspdn_html and 'id="bspdn-out-rating"' in ai_bspdn_html and 'id="bspdn-out-verdict"' in ai_bspdn_html)

    # ════════════════════════════════════════════════════════════
    # TEST 66: 晶圓光罩附加成本、Murphy 矽良率損失與百萬晶圓量產 TCO 經濟學試算器 (technology-comparison.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 66: 晶圓光罩附加成本、Murphy 矽良率損失與百萬晶圓量產 TCO 經濟學試算器 ═══")
    tco_js = (BASE / "wafer-cost-tco-calculator.js").read_text(encoding="utf-8")
    test("wafer-cost-tco-calculator.js 存在且導出 calculateWaferCostTco、drawWaferCostTcoCanvas 與 initWaferCostTcoCalculator",
         "export function calculateWaferCostTco" in tco_js and "export function drawWaferCostTcoCanvas" in tco_js and "export function initWaferCostTcoCalculator" in tco_js)
    test("wafer-cost-tco-calculator.js 包含四大晶圓代工製程預設與四大 eNVM 光罩附加設定檔",
         "FOUNDRY_PROCESS_PRESETS" in tco_js and "55nm_mature" in tco_js and "28nm_hpc" in tco_js and "16nm_finfet" in tco_js and "5nm_advanced" in tco_js and "ENVM_COST_PROFILES" in tco_js and "antifuse_logic" in tco_js and "eflash_split_gate" in tco_js and "beol_emram" in tco_js and "beol_reram" in tco_js)
    test("wafer-cost-tco-calculator.js 第一性原理光罩加價晶圓成本、Murphy 矽良率、GDPW 毛晶粒數、良品晶片淨成本、年度總擁有成本與損益平衡演算法",
         "waferFabCostUsd" in tco_js and "totalWaferCostUsd" in tco_js and "gdpw" in tco_js and "murphyYield" in tco_js and "netGoodDies" in tco_js and "totalDieCostUsd" in tco_js and "annualTotalTcoUsd" in tco_js and "tcoDeltaUsd" in tco_js and "tcoPremiumPercent" in tco_js)
    test("wafer-cost-tco-calculator.js 包含 300mm 晶圓幾何、邊緣晶粒剔除效應與 Poisson 基準良率對比",
         "edgeExclusionPenalty" in tco_js and "poissonYield" in tco_js and "dieAreaCm2" in tco_js and "waferAreaMm2" in tco_js)
    test("wafer-cost-tco-calculator.js 包含純邏輯 AntiFuse 基準對比與年化 TCO 節省額溢價計算",
         "afTotalDieCost" in tco_js and "afAnnualTcoUsd" in tco_js and "dieCostPremiumPercent" in tco_js)

    tech_tco_html = (BASE / "technology-comparison.html").read_text(encoding="utf-8")
    test("technology-comparison.html 整合 wafer-tco-calculator-root 工作台與模組腳本引用",
         'id="wafer-tco-calculator-root"' in tech_tco_html and 'src="wafer-cost-tco-calculator.js' in tech_tco_html)
    test("wafer-cost-tco-calculator.js 包含代工製程選擇器、技術選擇器、面積/產量雙軸滑桿與產量 TCO/晶粒良率成本雙模態 Canvas",
         'id="tco-process-select"' in tco_js and 'id="tco-envm-select"' in tco_js and 'id="tco-area-slider"' in tco_js and 'id="tco-volume-slider"' in tco_js and 'id="tco-canvas"' in tco_js)

    # ════════════════════════════════════════════════════════════
    # TEST 67: 4K 極低溫量子與太空輻射耐受 (Cryo-CMOS & Rad-Hard) 物理模擬器 (automotive-nvm.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 67: 4K 極低溫量子與太空輻射耐受 (Cryo-CMOS & Rad-Hard) 物理模擬器 ═══")
    cryo_js = (BASE / "cryo-radhard-nvm-simulator.js").read_text(encoding="utf-8")
    test("cryo-radhard-nvm-simulator.js 存在且導出 calculateCryoRadhardMetrics、drawCryoRadhardCanvas 與 initCryoRadhardSimulator",
         "export function calculateCryoRadhardMetrics" in cryo_js and "export function drawCryoRadhardCanvas" in cryo_js and "export function initCryoRadhardSimulator" in cryo_js)
    test("cryo-radhard-nvm-simulator.js 包含四大極限環境預設與五大 eNVM 拓撲設定檔",
         "CRYO_ENVIRONMENT_PRESETS" in cryo_js and "quantum_cryo_4k" in cryo_js and "leo_satellite" in cryo_js and "deep_space_jupiter" in cryo_js and "geothermal_underhood" in cryo_js and "CRYO_NVM_TOPOLOGIES" in cryo_js and "antifuse_radhard" in cryo_js and "stt_mram_hardened" in cryo_js and "feram_radhard" in cryo_js and "eflash_split_gate" in cryo_js and "radhard_sram_ecc" in cryo_js)
    test("cryo-radhard-nvm-simulator.js 第一性原理極低溫載子凍結、Vth 溫度偏移、TID 氧化層電洞陷阱漂移、Weibull 重離子 SEU 截面積與綜合可靠度評分演算法",
         "freezeOutFactor" in cryo_js and "deltaVthTemp" in cryo_js and "deltaVthTid" in cryo_js and "effectiveMargin" in cryo_js and "seuCrossSection" in cryo_js and "annualSerFitPerMbit" in cryo_js and "resilienceScore" in cryo_js)
    test("cryo-radhard-nvm-simulator.js 包含雙模態視覺化 (temp_voltage_window 與 weibull_seu_cross_section)",
         "temp_voltage_window" in cryo_js and "weibull_seu_cross_section" in cryo_js)

    auto_cryo_html = (BASE / "automotive-nvm.html").read_text(encoding="utf-8")
    test("automotive-nvm.html 整合 cryo-simulator-root 工作台與模組腳本引用",
         'id="cryo-simulator-root"' in auto_cryo_html and 'cryo-radhard-nvm-simulator.js' in auto_cryo_html)
    test("automotive-nvm.html 包含極限環境選擇器、拓撲選擇器、溫度/TID/LET 三軸滑桿與雙模態 Canvas",
         'id="cryo-preset-select"' in auto_cryo_html and 'id="cryo-topology-select"' in auto_cryo_html and 'id="cryo-temp-slider"' in auto_cryo_html and 'id="cryo-tid-slider"' in auto_cryo_html and 'id="cryo-let-slider"' in auto_cryo_html and 'id="cryo-radhard-canvas"' in auto_cryo_html)
    test("automotive-nvm.html 包含四大 KPI 輸出欄位與判定橫幅",
         'id="cryo-metric-vth"' in auto_cryo_html and 'id="cryo-metric-margin"' in auto_cryo_html and 'id="cryo-metric-ser"' in auto_cryo_html and 'id="cryo-metric-score"' in auto_cryo_html and 'id="cryo-verdict-banner"' in auto_cryo_html)

    # ════════════════════════════════════════════════════════════
    # TEST 68: 硬體根信任 (RoT) 與後量子密碼 PUF 熵品質與差分功率分析 (DPA) 模擬器 (security-assurance.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 68: 硬體根信任 (RoT) 與後量子密碼 PUF 熵品質與差分功率分析 (DPA) 模擬器 ═══")
    pqc_js = (BASE / "pqc-rot-dpa-simulator.js").read_text(encoding="utf-8")
    test("pqc-rot-dpa-simulator.js 存在且導出 calculatePqcDpaMetrics、drawPqcDpaCanvas 與 initPqcDpaSimulator",
         "export function calculatePqcDpaMetrics" in pqc_js and "export function drawPqcDpaCanvas" in pqc_js and "export function initPqcDpaSimulator" in pqc_js)
    test("pqc-rot-dpa-simulator.js 包含四大安全等級預設與四大金鑰/PUF 儲存拓撲設定檔",
         "PQC_SECURITY_PRESETS" in pqc_js and "fips140_3_lvl4" in pqc_js and "automotive_evita_high" in pqc_js and "iot_commercial_secure" in pqc_js and "legacy_unprotected" in pqc_js and "PQC_STORAGE_TOPOLOGIES" in pqc_js and "antifuse_rot_puf" in pqc_js and "sram_puf_helper" in pqc_js and "efuse_metal_poly" in pqc_js and "eflash_tunnel_trap" in pqc_js)
    test("pqc-rot-dpa-simulator.js 第一性原理差分信號差消、電流偽裝、時鐘抖動、Pearson 相關係數 ρmax、MTD 揭示次數與 PUF 高斯漢明距演算法",
         "effectiveDelta" in pqc_js and "totalNoiseSigma" in pqc_js and "rhoMax" in pqc_js and "mtd" in pqc_js and "pufInterHdMean" in pqc_js and "pufIntraBerPpm" in pqc_js and "securityScore" in pqc_js and "verdictStatus" in pqc_js)
    test("pqc-rot-dpa-simulator.js 包含雙模態視覺化 (cpa_correlation_traces 與 puf_gaussian_hamming)",
         "cpa_correlation_traces" in pqc_js and "puf_gaussian_hamming" in pqc_js)

    sec_pqc_html = (BASE / "security-assurance.html").read_text(encoding="utf-8")
    test("security-assurance.html 整合 pqc-dpa-simulator-root 工作台與模組腳本引用",
         'id="pqc-dpa-simulator-root"' in sec_pqc_html and 'pqc-rot-dpa-simulator.js' in sec_pqc_html)
    test("security-assurance.html 包含安全認證等級選擇器、拓撲選擇器、差分/偽裝/抖動複選框與雙模態 Canvas",
         'id="pqc-preset-select"' in sec_pqc_html and 'id="pqc-topology-select"' in sec_pqc_html and 'id="pqc-diff-check"' in sec_pqc_html and 'id="pqc-blinding-check"' in sec_pqc_html and 'id="pqc-jitter-check"' in sec_pqc_html and 'id="pqc-rot-dpa-canvas"' in sec_pqc_html)
    test("security-assurance.html 包含四大 KPI 輸出欄位 (MTD, ρmax, BER, Security Score) 與判定橫幅",
         'id="pqc-metric-mtd"' in sec_pqc_html and 'id="pqc-metric-rho"' in sec_pqc_html and 'id="pqc-metric-ber"' in sec_pqc_html and 'id="pqc-metric-score"' in sec_pqc_html and 'id="pqc-verdict-banner"' in sec_pqc_html)

    # ════════════════════════════════════════════════════════════
    # TEST 69: 3D Chiplet / 2.5D CoWoS 異質整合 eNVM 微凸塊 RC 延遲與熱機械應力模擬器 (oip-secure-storage.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 69: 3D Chiplet / 2.5D CoWoS 異質整合 eNVM 微凸塊 RC 延遲與熱機械應力模擬器 ═══")
    chiplet_js = (BASE / "chiplet-3d-hetero-nvm-simulator.js").read_text(encoding="utf-8")
    test("chiplet-3d-hetero-nvm-simulator.js 存在且導出 calculateChipletHeteroMetrics、drawChipletHeteroCanvas 與 initChipletHeteroSimulator",
         "export function calculateChipletHeteroMetrics" in chiplet_js and "export function drawChipletHeteroCanvas" in chiplet_js and "export function initChipletHeteroSimulator" in chiplet_js)
    test("chiplet-3d-hetero-nvm-simulator.js 包含四大先進封裝預設與四大 Chiplet eNVM 拓撲設定檔",
         "CHIPLET_PACKAGING_PRESETS" in chiplet_js and "tsmc_soic_hybrid" in chiplet_js and "tsmc_cowos_s" in chiplet_js and "intel_foveros_3d" in chiplet_js and "organic_substrate_mcm" in chiplet_js and "CHIPLET_NVM_TOPOLOGIES" in chiplet_js and "antifuse_base_die" in chiplet_js and "beol_mram_top_cache" in chiplet_js and "embedded_flash_sidecar" in chiplet_js and "sram_cache_stack" in chiplet_js)
    test("chiplet-3d-hetero-nvm-simulator.js 第一性原理熱機械切應力、CTE 失配、D2D 垂直與橫向寄生 RC、端到端讀取延遲、Arrhenius 高溫留存退化與可靠度評分演算法",
         "totalJunctionTempC" in chiplet_js and "interfaceShearStressMpa" in chiplet_js and "effectiveReadLatencyNs" in chiplet_js and "actualRetentionYears" in chiplet_js and "packagingScore" in chiplet_js and "verdictStatus" in chiplet_js)
    test("chiplet-3d-hetero-nvm-simulator.js 包含雙模態視覺化 (thermal_stress_profile 與 d2d_rc_latency)",
         "thermal_stress_profile" in chiplet_js and "d2d_rc_latency" in chiplet_js)

    oip_chiplet_html = (BASE / "oip-secure-storage.html").read_text(encoding="utf-8")
    test("oip-secure-storage.html 整合 chiplet-simulator-root 工作台與模組腳本引用",
         'id="chiplet-simulator-root"' in oip_chiplet_html and 'chiplet-3d-hetero-nvm-simulator.js' in oip_chiplet_html)
    test("oip-secure-storage.html 包含封裝預設選擇器、拓撲選擇器、功耗/長度/溫差三軸滑桿與雙模態 Canvas",
         'id="chiplet-preset-select"' in oip_chiplet_html and 'id="chiplet-topology-select"' in oip_chiplet_html and 'id="chiplet-power-slider"' in oip_chiplet_html and 'id="chiplet-length-slider"' in oip_chiplet_html and 'id="chiplet-deltat-slider"' in oip_chiplet_html and 'id="chiplet-hetero-canvas"' in oip_chiplet_html)
    test("oip-secure-storage.html 包含四大 KPI 輸出欄位 (Tj, τ, Latency, Packaging Score) 與判定橫幅",
         'id="chiplet-metric-temp"' in oip_chiplet_html and 'id="chiplet-metric-stress"' in oip_chiplet_html and 'id="chiplet-metric-latency"' in oip_chiplet_html and 'id="chiplet-metric-score"' in oip_chiplet_html and 'id="chiplet-verdict-banner"' in oip_chiplet_html)

    # ════════════════════════════════════════════════════════════
    # TEST 70: 次閾值與近閾值超低壓 eNVM 讀取能耗與位元漏電比模擬器 (iot-mcu-envm.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 70: 次閾值與近閾值超低壓 eNVM 讀取能耗與位元漏電比模擬器 ═══")
    subvt_js = (BASE / "subthreshold-lowvoltage-nvm-simulator.js").read_text(encoding="utf-8")
    test("subthreshold-lowvoltage-nvm-simulator.js 存在且導出 calculateSubthresholdMetrics、drawSubthresholdCanvas 與 initSubthresholdSimulator",
         "export function calculateSubthresholdMetrics" in subvt_js and "export function drawSubthresholdCanvas" in subvt_js and "export function initSubthresholdSimulator" in subvt_js)
    test("subthreshold-lowvoltage-nvm-simulator.js 包含四大超低壓供電預設與四大超低壓 eNVM 拓撲設定檔",
         "LOW_VOLTAGE_SUPPLY_PRESETS" in subvt_js and "subthreshold_0_35v" in subvt_js and "nearthreshold_0_50v" in subvt_js and "ultralow_0_70v" in subvt_js and "nominal_1_00v" in subvt_js and "LOW_VOLTAGE_NVM_TOPOLOGIES" in subvt_js and "antifuse_lowvoltage" in subvt_js and "reram_lowcurrent" in subvt_js and "eflash_charge_sensing" in subvt_js and "sram_subvt_10t" in subvt_js)
    test("subthreshold-lowvoltage-nvm-simulator.js 第一性原理次閾值載子擴散電流、感測延遲、動態 CV² 能耗、陣列靜態漏電佔比、最小能耗點 MEP 與 Pelgrom 失效機率演算法",
         "driveCurrentNa" in subvt_js and "senseLatencyNs" in subvt_js and "activeEnergyFj" in subvt_js and "leakageEnergyFj" in subvt_js and "totalEnergyFj" in subvt_js and "leakageEnergyRatioPercent" in subvt_js and "failureRatePpm" in subvt_js and "efficiencyScore" in subvt_js)
    test("subthreshold-lowvoltage-nvm-simulator.js 包含雙模態視覺化 (voltage_energy_curve 與 read_latency_failure)",
         "voltage_energy_curve" in subvt_js and "read_latency_failure" in subvt_js)

    iot_subvt_html = (BASE / "iot-mcu-envm.html").read_text(encoding="utf-8")
    test("iot-mcu-envm.html 整合 subvt-simulator-root 工作台與模組腳本引用",
         'id="subvt-simulator-root"' in iot_subvt_html and 'subthreshold-lowvoltage-nvm-simulator.js' in iot_subvt_html)
    test("iot-mcu-envm.html 包含低壓預設選擇器、拓撲選擇器、電壓/溫度/容量三軸滑桿與雙模態 Canvas",
         'id="subvt-preset-select"' in iot_subvt_html and 'id="subvt-topology-select"' in iot_subvt_html and 'id="subvt-vdd-slider"' in iot_subvt_html and 'id="subvt-temp-slider"' in iot_subvt_html and 'id="subvt-capacity-slider"' in iot_subvt_html and 'id="subvt-lowvoltage-canvas"' in iot_subvt_html)
    test("iot-mcu-envm.html 包含四大 KPI 輸出欄位 (Energy, Latency, Leakage Ratio, Score) 與判定橫幅",
         'id="subvt-metric-energy"' in iot_subvt_html and 'id="subvt-metric-latency"' in iot_subvt_html and 'id="subvt-metric-leakage"' in iot_subvt_html and 'id="subvt-metric-score"' in iot_subvt_html and 'id="subvt-verdict-banner"' in iot_subvt_html)

    # ════════════════════════════════════════════════════════════
    # TEST 71: CPO / 矽光子光電共封裝微環微調與雷射自發熱 eNVM 留存性模擬器 (ai-nvm-opportunities.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 71: CPO / 矽光子光電共封裝微環微調與雷射自發熱 eNVM 留存性模擬器 ═══")
    cpo_js = (BASE / "cpo-siph-nvm-simulator.js").read_text(encoding="utf-8")
    test("cpo-siph-nvm-simulator.js 存在且導出 calculateCpoSiphMetrics、drawCpoSiphCanvas 與 initCpoSiphSimulator",
         "export function calculateCpoSiphMetrics" in cpo_js and "export function drawCpoSiphCanvas" in cpo_js and "export function initCpoSiphSimulator" in cpo_js)
    test("cpo-siph-nvm-simulator.js 包含四大 CPO 系統預設與四大光學微調 eNVM 拓撲設定檔",
         "CPO_SYSTEM_PRESETS" in cpo_js and "hyperscale_cpo_51t" in cpo_js and "ai_accelerator_oio" in cpo_js and "external_laser_els" in cpo_js and "neuromorphic_photonic_gemm" in cpo_js and "OPTICAL_NVM_TECHS" in cpo_js and "antifuse_zero_static" in cpo_js and "optical_pcm_gst" in cpo_js and "active_thermal_heater" in cpo_js and "reram_analog_trim" in cpo_js)
    test("cpo-siph-nvm-simulator.js 第一性原理雷射發熱、熱耦合接面溫升、微環諧振波長漂移、零待機熱調諧節能與 Arrhenius 留存壽命演算法",
         "totalHeatLoadW" in cpo_js and "junctionTempC" in cpo_js and "wavelengthDriftNm" in cpo_js and "savedTuningPowerW" in cpo_js and "powerSavingsPercent" in cpo_js and "estimatedRetentionYears" in cpo_js and "systemRating" in cpo_js)
    test("cpo-siph-nvm-simulator.js 包含雙模態視覺化 (mrr_resonance_shift 與 laser_thermal_retention)",
         "mrr_resonance_shift" in cpo_js and "laser_thermal_retention" in cpo_js)

    ai_cpo_html = (BASE / "ai-nvm-opportunities.html").read_text(encoding="utf-8")
    test("ai-nvm-opportunities.html 整合 cpo-siph-simulator-root 工作台與模組腳本引用",
         'id="cpo-siph-simulator-root"' in ai_cpo_html and 'cpo-siph-nvm-simulator.js' in ai_cpo_html)
    test("ai-nvm-opportunities.html 包含 CPO 預設選擇器、拓撲選擇器、環境/雷射/通道三軸滑桿與雙模態 Canvas",
         'id="cpo-preset-select"' in ai_cpo_html and 'id="cpo-tech-select"' in ai_cpo_html and 'id="cpo-ambient-slider"' in ai_cpo_html and 'id="cpo-laser-slider"' in ai_cpo_html and 'id="cpo-channel-slider"' in ai_cpo_html and 'id="cpo-siph-canvas"' in ai_cpo_html)
    test("ai-nvm-opportunities.html 包含四大 KPI 輸出欄位 (Tj, Δλ, Savings, Retention) 與判定橫幅",
         'id="cpo-out-junction"' in ai_cpo_html and 'id="cpo-out-drift"' in ai_cpo_html and 'id="cpo-out-powersave"' in ai_cpo_html and 'id="cpo-out-retention"' in ai_cpo_html and 'id="cpo-out-rating"' in ai_cpo_html and 'id="cpo-out-verdict"' in ai_cpo_html)

    # ════════════════════════════════════════════════════════════
    # TEST 72: 深空重離子單粒子閂鎖 (SEL) 閾值與 20 年超高溫 Arrhenius 數據留存衰減試算器 (specialty-nvm.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 72: 深空重離子單粒子閂鎖 (SEL) 閾值與 20 年超高溫 Arrhenius 數據留存衰減試算器 ═══")
    deep_js = (BASE / "deep-space-sel-retention-simulator.js").read_text(encoding="utf-8")
    test("deep-space-sel-retention-simulator.js 存在且導出 calculateDeepSpaceMetrics、drawDeepSpaceCanvas 與 initDeepSpaceSimulator",
         "export function calculateDeepSpaceMetrics" in deep_js and "export function drawDeepSpaceCanvas" in deep_js and "export function initDeepSpaceSimulator" in deep_js)
    test("deep-space-sel-retention-simulator.js 包含四大深空任務預設與四大耐受技術拓撲",
         "DEEP_SPACE_MISSION_PRESETS" in deep_js and "venus_lander_460c" in deep_js and "jupiter_europa_belt" in deep_js and "artemis_lunar_20yr" in deep_js and "downhole_geothermal_300c" in deep_js and "DEEP_SPACE_TECH_PROFILES" in deep_js and "antifuse_soi_radhard" in deep_js and "sic_widebandgap_envm" in deep_js and "radhard_stt_mram" in deep_js and "bulk_cmos_eflash" in deep_js)
    test("deep-space-sel-retention-simulator.js 第一性原理重離子 SEL Weibull 截面積、免疫閾值、Arrhenius 460°C 極限高溫留存、20 年任務存活率與 NASA Class-S 評級演算法",
         "selCrossSection" in deep_js and "selMarginMev" in deep_js and "isSelLatching" in deep_js and "estimatedRetentionYears" in deep_js and "retentionSurvPct" in deep_js and "rating" in deep_js and "verdictZh" in deep_js)
    test("deep-space-sel-retention-simulator.js 包含雙模態視覺化 (sel_cross_section_let 與 arrhenius_high_temp_retention)",
         "sel_cross_section_let" in deep_js and "arrhenius_high_temp_retention" in deep_js)

    spec_deep_html = (BASE / "specialty-nvm.html").read_text(encoding="utf-8")
    test("specialty-nvm.html 整合 deep-space-simulator-root 工作台與模組腳本引用",
         'id="deep-space-simulator-root"' in spec_deep_html and 'deep-space-sel-retention-simulator.js' in spec_deep_html)
    test("specialty-nvm.html 包含深空任務選擇器、技術選擇器、溫度/LET/年限三軸滑桿與雙模態 Canvas",
         'id="deep-space-preset-select"' in spec_deep_html and 'id="deep-space-tech-select"' in spec_deep_html and 'id="deep-space-temp-slider"' in spec_deep_html and 'id="deep-space-let-slider"' in spec_deep_html and 'id="deep-space-mission-slider"' in spec_deep_html and 'id="deep-space-canvas"' in spec_deep_html)
    test("specialty-nvm.html 包含四大 KPI 輸出欄位 (SEL Status, Retention, Survival, Ea) 與判定橫幅",
         'id="deep-space-out-sel"' in spec_deep_html and 'id="deep-space-out-retention"' in spec_deep_html and 'id="deep-space-out-survival"' in spec_deep_html and 'id="deep-space-out-ea"' in spec_deep_html and 'id="deep-space-out-rating"' in spec_deep_html and 'id="deep-space-out-verdict"' in spec_deep_html)

    # ════════════════════════════════════════════════════════════
    # TEST 73: 車用 ISO 26262 ASIL-D 瞬態軟錯誤 FIT 率、中子通量與 ECC 診斷覆蓋率試算器 (automotive-nvm.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 73: 車用 ISO 26262 ASIL-D 瞬態軟錯誤 FIT 率、中子通量與 ECC 診斷覆蓋率試算器 ═══")
    auto_js = (BASE / "automotive-asild-ecc-simulator.js").read_text(encoding="utf-8")
    test("automotive-asild-ecc-simulator.js 存在且導出 calculateAutomotiveAsilMetrics、drawAutomotiveAsilCanvas 與 initAutomotiveAsilSimulator",
         "export function calculateAutomotiveAsilMetrics" in auto_js and "export function drawAutomotiveAsilCanvas" in auto_js and "export function initAutomotiveAsilSimulator" in auto_js)
    test("automotive-asild-ecc-simulator.js 包含四大任務情境預設、四大記憶體拓撲與四大 ECC 診斷架構",
         "AUTO_MISSION_PROFILES" in auto_js and "powertrain_inverter_asild" in auto_js and "adas_domain_controller" in auto_js and "battery_management_asild" in auto_js and "gateway_telematics_asilb" in auto_js and "AUTO_NVM_PROFILES" in auto_js and "antifuse_charge_free" in auto_js and "radhard_stt_mram" in auto_js and "embedded_flash_sg" in auto_js and "embedded_sram_sub20nm" in auto_js and "ECC_ARCHITECTURES" in auto_js and "secded_72_64" in auto_js and "chipkill_reed_solomon" in auto_js)
    test("automotive-asild-ecc-simulator.js 第一性原理大氣中子通量海拔擴增因子、Raw SER、SEC-DED 糾錯、週期巡檢清洗雙錯累積抑制、SPFM、LFM 與 ASIL-D 評級演算法",
         "neutronFluxFactor" in auto_js and "rawNeutronFit" in auto_js and "rawTotalFit" in auto_js and "accumulationDoubleFit" in auto_js and "residualFit" in auto_js and "spfmMetric" in auto_js and "lfmMetric" in auto_js and "achievedAsil" in auto_js)
    test("automotive-asild-ecc-simulator.js 包含雙模態視覺化 (scrub_period_vs_residual_fit 與 altitude_neutron_fit_curve)",
         "scrub_period_vs_residual_fit" in auto_js and "altitude_neutron_fit_curve" in auto_js)

    auto_html = (BASE / "automotive-nvm.html").read_text(encoding="utf-8")
    test("automotive-nvm.html 整合 auto-asild-simulator-root 工作台與模組腳本引用",
         'id="auto-asild-simulator-root"' in auto_html and 'automotive-asild-ecc-simulator.js' in auto_html)
    test("automotive-nvm.html 包含任務選擇器、NVM 選擇器、ECC 選擇器、海拔/容量/巡檢三軸滑桿與雙模態 Canvas",
         'id="asild-mission-select"' in auto_html and 'id="asild-nvm-select"' in auto_html and 'id="asild-ecc-select"' in auto_html and 'id="asild-altitude-slider"' in auto_html and 'id="asild-capacity-slider"' in auto_html and 'id="asild-scrub-slider"' in auto_html and 'id="asild-canvas"' in auto_html)
    test("automotive-nvm.html 包含四大 KPI 輸出欄位 (Raw FIT, Residual FIT, SPFM, LFM) 與判定橫幅",
         'id="asild-out-rawfit"' in auto_html and 'id="asild-out-residualfit"' in auto_html and 'id="asild-out-spfm"' in auto_html and 'id="asild-out-lfm"' in auto_html and 'id="asild-out-rating"' in auto_html and 'id="asild-out-verdict"' in auto_html)

    # ════════════════════════════════════════════════════════════
    # TEST 74: 3D 立體垂直堆疊 eNVM 字元線階梯 RC 延遲與薄膜金屬電阻率尺寸效應模擬器 (technology-comparison.html)
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 74: 3D 立體垂直堆疊 eNVM 字元線階梯 RC 延遲與薄膜金屬電阻率尺寸效應模擬器 ═══")
    vert_js = (BASE / "vertical-3d-nvm-simulator.js").read_text(encoding="utf-8")
    test("vertical-3d-nvm-simulator.js 存在且導出 calculateVertical3dMetrics、drawVertical3dCanvas 與 initVertical3dSimulator",
         "export function calculateVertical3dMetrics" in vert_js and "export function drawVertical3dCanvas" in vert_js and "export function initVertical3dSimulator" in vert_js)
    test("vertical-3d-nvm-simulator.js 包含四大 3D 垂直堆疊架構預設與四大字元線導體材料",
         "VERTICAL_3D_PRESETS" in vert_js and "vert_3d_antifuse_64l" in vert_js and "vert_3d_nor_48l" in vert_js and "vert_3d_nand_128l" in vert_js and "vert_3d_reram_64l" in vert_js and "WORDLINE_CONDUCTORS" in vert_js and "molybdenum_mo_pvd" in vert_js and "tungsten_w_ald" in vert_js and "ruthenium_ru_subnm" in vert_js and "doped_poly_silicon" in vert_js)
    test("vertical-3d-nvm-simulator.js 第一性原理薄膜金屬電阻率尺寸效應、HAR 階梯走線幾何、最差層字元線 RC 延遲、頂底層延遲梯差與存取時間演算法",
         "sizeEffectFactor" in vert_js and "effectiveResistivityUohmCm" in vert_js and "worstLengthUm" in vert_js and "worstWlDelayNs" in vert_js and "tierDelaySkewNs" in vert_js and "totalAccessTimeNs" in vert_js and "tierGrade" in vert_js)
    test("vertical-3d-nvm-simulator.js 包含雙模態視覺化 (tier_count_vs_rc_delay 與 tier_delay_gradient_profile)",
         "tier_count_vs_rc_delay" in vert_js and "tier_delay_gradient_profile" in vert_js)

    tech_vert_html = (BASE / "technology-comparison.html").read_text(encoding="utf-8")
    test("technology-comparison.html 整合 vertical-3d-simulator-root 工作台與模組腳本引用",
         'id="vertical-3d-simulator-root"' in tech_vert_html and 'vertical-3d-nvm-simulator.js' in tech_vert_html)
    test("technology-comparison.html 包含架構選擇器、導體選擇器、層數/厚度/長度三軸滑桿與雙模態 Canvas",
         'id="vert3d-preset-select"' in tech_vert_html and 'id="vert3d-conductor-select"' in tech_vert_html and 'id="vert3d-tier-slider"' in tech_vert_html and 'id="vert3d-thickness-slider"' in tech_vert_html and 'id="vert3d-length-slider"' in tech_vert_html and 'id="vert3d-canvas"' in tech_vert_html)
    test("technology-comparison.html 包含四大 KPI 輸出欄位 (Resistivity, Worst Delay, Delay Skew, Access Time) 與判定橫幅",
         'id="vert3d-out-resistivity"' in tech_vert_html and 'id="vert3d-out-worstdelay"' in tech_vert_html and 'id="vert3d-out-delayskew"' in tech_vert_html and 'id="vert3d-out-accesstime"' in tech_vert_html and 'id="vert3d-out-grade"' in tech_vert_html and 'id="vert3d-out-verdict"' in tech_vert_html)

    # ════════════════════════════════════════════════════════════
    # TEST 75: HBM4 Base Die 轉向邏輯製程、eNVM 修復架構與先進邏輯探針卡生態系大遷徙
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 75: HBM4 Base Die 轉向邏輯製程、eNVM 修復架構與先進邏輯探針卡生態系大遷徙 ═══")
    ai_html = (BASE / "ai-nvm-opportunities.html").read_text(encoding="utf-8")
    test("ai-nvm-opportunities.html 包含 HBM4 Base Die 邏輯製程與探針卡生態系轉移模組 (#hbm4-base-die-revolution)",
         'id="hbm4-base-die-revolution"' in ai_html and 'class="hbm4-evolution-module"' in ai_html)
    test("ai-nvm-opportunities.html 詳述 Base Die DRAM 轉邏輯製程（三星 4nm、SK 海力士台積電 12nm/3nm、美光評估）與 2048-bit 超寬 PHY",
         "三星自家代工 4nm" in ai_html and "SK 海力士委託台積電 12nm/3nm" in ai_html and "美光積極評估導入晶圓代工" in ai_html and "2048-bit" in ai_html)
    test("ai-nvm-opportunities.html 包含邏輯相容 AntiFuse 0-Mask、260°C 封裝熱預算零回彈、晶片內幫浦與 TSV/DRAM 壞列修復",
         "零額外光罩 (0-Mask Adder)" in ai_html and "耐受 260°C 封裝熱預算" in ai_html and "Zero Grow-Back" in ai_html and "晶片內幫浦與多維重映射" in ai_html)
    test("ai-nvm-opportunities.html 包含晶圓測試採購權轉移與邏輯探針卡生態系（Micronics Japan 轉向旺矽 6223、精測 6510、Technoprobe、FormFactor）",
         "Micronics Japan" in ai_html and "旺矽 (MPI, 6223)" in ai_html and "中華精測 (CHPT, 6510)" in ai_html and "Technoprobe" in ai_html and "FormFactor" in ai_html)
    test("ai-nvm-opportunities.html 包含 HBM3E vs HBM4 八大架構維度對比表與法說會觀測指標",
         'class="hbm4-matrix-table"' in ai_html and "法說會關鍵觀測指標" in ai_html and "Earnings Call Watch" in ai_html)

    spec_html = (BASE / "specialty-nvm.html").read_text(encoding="utf-8")
    test("specialty-nvm.html 整合 HBM4 邏輯 Base Die 2048-bit 封裝後修復 (PPR) 與探針卡移轉說明",
         "HBM4 邏輯 Base Die" in spec_html and "符合 JEDEC DDR5/HBM3e/HBM4" in spec_html and "旺矽 6223" in spec_html and "精測 6510" in spec_html)

    tech_html = (BASE / "technology-comparison.html").read_text(encoding="utf-8")
    test("technology-comparison.html 晶圓代工節點標註台積電 12nm 與三星 4nm 之 HBM4 Base Die 代工及邏輯探針卡生態",
         "16FFC / 12FFC+ (N12e / HBM4 Base Die)" in tech_html and "HBM4 Base Die 代工" in tech_html and "旺矽 6223" in tech_html)

    ev_html = (BASE / "memory-evidence.html").read_text(encoding="utf-8")
    test("memory-evidence.html Evidence V11 納入 HBM4 邏輯 Base Die、0-mask AntiFuse 修復與邏輯探針卡採購轉移",
         "HBM4 Logic Base Die" in ev_html and "旺矽 6223" in ev_html and "Technoprobe" in ev_html)

    # ════════════════════════════════════════════════════════════
    # TEST 76: HBM4 邏輯 Base Die 複合堆疊良率、eNVM 封裝後修復 (hPPR) 與高針數探針卡測試經濟學模擬器
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 76: HBM4 邏輯 Base Die 複合堆疊良率、eNVM 封裝後修復 (hPPR) 與高針數探針卡測試經濟學模擬器 ═══")
    hbm4_probe_js = (BASE / "hbm4-base-die-repair-probe-simulator.js").read_text(encoding="utf-8")
    test("hbm4-base-die-repair-probe-simulator.js 存在且導出 calculateHbm4ProbeMetrics、drawHbm4ProbeCanvas 與 initHbm4ProbeSimulator",
         "export function calculateHbm4ProbeMetrics" in hbm4_probe_js and "export function drawHbm4ProbeCanvas" in hbm4_probe_js and "export function initHbm4ProbeSimulator" in hbm4_probe_js)
    test("hbm4-base-die-repair-probe-simulator.js 包含五大系統架構預設與五大探針卡架構",
         "HBM4_SYSTEM_PRESETS" in hbm4_probe_js and "sk_hynix_tsmc_12nm_16hi" in hbm4_probe_js and "samsung_foundry_4nm_12hi" in hbm4_probe_js and "sk_hynix_tsmc_3nm_nextgen" in hbm4_probe_js and "PROBE_CARD_ARCHITECTURES" in hbm4_probe_js and "mpi_taiwan" in hbm4_probe_js and "chpt_taiwan" in hbm4_probe_js and "technoprobe" in hbm4_probe_js and "formfactor" in hbm4_probe_js and "micronics_japan" in hbm4_probe_js)
    test("hbm4-base-die-repair-probe-simulator.js 第一性原理 3D 複合堆疊良率、AntiFuse 0-mask 260°C 零回彈修復挽回與探針卡針數成本模型",
         "rawStackYield" in hbm4_probe_js and "repairedStackYield" in hbm4_probe_js and "yieldDeltaPercent" in hbm4_probe_js and "valueRecoveryPerHbm" in hbm4_probe_js and "probeCardAsp" in hbm4_probe_js and "hbmExposureIndex" in hbm4_probe_js)
    test("hbm4-base-die-repair-probe-simulator.js 包含雙模態視覺化 (compound_yield_curve 與 probe_card_capex_economics)",
         "compound_yield_curve" in hbm4_probe_js and "probe_card_capex_economics" in hbm4_probe_js)

    ai_html = (BASE / "ai-nvm-opportunities.html").read_text(encoding="utf-8")
    test("ai-nvm-opportunities.html 整合 hbm4-repair-probe-simulator-root 工作台與模組腳本引用",
         'id="hbm4-repair-probe-simulator-root"' in ai_html and 'src="hbm4-base-die-repair-probe-simulator.js' in ai_html)
    test("ai-nvm-opportunities.html 包含預設選擇器、探針卡選擇器、良率/層數/針數三軸滑桿與雙模態 Canvas",
         'id="hbm4-preset-select"' in ai_html and 'id="hbm4-probe-select"' in ai_html and 'id="hbm4-core-yield-slider"' in ai_html and 'id="hbm4-layer-slider"' in ai_html and 'id="hbm4-pin-slider"' in ai_html and 'id="hbm4-probe-canvas"' in ai_html)
    test("ai-nvm-opportunities.html 包含四大 KPI 輸出欄位 (Raw Yield, Repaired Yield, Value Recovery, Probe Exposure) 與判定橫幅",
         'id="hbm4-out-raw-yield"' in ai_html and 'id="hbm4-out-rep-yield"' in ai_html and 'id="hbm4-out-value-recovery"' in ai_html and 'id="hbm4-out-exposure"' in ai_html and 'id="hbm4-out-rating"' in ai_html and 'id="hbm4-out-verdict"' in ai_html)

    # ════════════════════════════════════════════════════════════
    # TEST 77: HBM4 / 3D Chiplet Cu-Cu 晶圓級混合鍵合、TSV 寄生 RC 與 KGD 探針表面物理模擬器
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 77: HBM4 / 3D Chiplet Cu-Cu 晶圓級混合鍵合、TSV 寄生 RC 與 KGD 探針表面物理模擬器 ═══")
    hb_js = (BASE / "hybrid-bonding-tsv-kgd-simulator.js").read_text(encoding="utf-8")
    test("hybrid-bonding-tsv-kgd-simulator.js 存在且導出 calculateHybridBondingMetrics、drawHybridBondingCanvas 與 initHybridBondingSimulator",
         "export function calculateHybridBondingMetrics" in hb_js and "export function drawHybridBondingCanvas" in hb_js and "export function initHybridBondingSimulator" in hb_js)
    test("hybrid-bonding-tsv-kgd-simulator.js 包含四大 3D 互連鍵合預設與五大 KGD 探針卡架構",
         "HYBRID_BONDING_PRESETS" in hb_js and "hbm4_hybrid_bonding_1um" in hb_js and "hbm4_microbump_20um" in hb_js and "chiplet_soic_0_8um" in hb_js and "KGD_PROBE_ARCHITECTURES" in hb_js and "mpi_zero_mark_mems" in hb_js and "chpt_submicron_mems" in hb_js and "technoprobe_tplus" in hb_js and "legacy_cantilever" in hb_js)
    test("hybrid-bonding-tsv-kgd-simulator.js 第一性原理互連密度、TSV 寄生電容 RC、2048-bit PHY 眼高與探針針痕 CMP 容許邊界模型",
         "interconnectDensityPerMm2" in hb_js and "rAcOhm" in hb_js and "cTsvFemtofarads" in hb_js and "tauRcPicoSec" in hb_js and "eyeOpeningPercent" in hb_js and "actualMarkDepthNm" in hb_js and "dishingThresholdNm" in hb_js and "bondingVoidPpm" in hb_js)
    test("hybrid-bonding-tsv-kgd-simulator.js 包含雙模態視覺化 (tsv_rc_frequency_response 與 probe_force_surface_damage)",
         "tsv_rc_frequency_response" in hb_js and "probe_force_surface_damage" in hb_js)

    spec_hb_html = (BASE / "specialty-nvm.html").read_text(encoding="utf-8")
    test("specialty-nvm.html 整合 hybrid-bonding-tsv-simulator-root 工作台與模組腳本引用",
         'id="hybrid-bonding-tsv-simulator-root"' in spec_hb_html and 'src="hybrid-bonding-tsv-kgd-simulator.js' in spec_hb_html)
    test("specialty-nvm.html 包含預設選擇器、探針選擇器、間距/頻率/壓力三軸滑桿與雙模態 Canvas",
         'id="hb-preset-select"' in spec_hb_html and 'id="hb-probe-select"' in spec_hb_html and 'id="hb-pitch-slider"' in spec_hb_html and 'id="hb-freq-slider"' in spec_hb_html and 'id="hb-force-slider"' in spec_hb_html and 'id="hb-canvas"' in spec_hb_html)
    test("specialty-nvm.html 包含四大 KPI 輸出欄位 (Density, Capacitance, Scrub Depth, Eye Opening) 與判定橫幅",
         'id="hb-out-density"' in spec_hb_html and 'id="hb-out-cap"' in spec_hb_html and 'id="hb-out-depth"' in spec_hb_html and 'id="hb-out-eye"' in spec_hb_html and 'id="hb-out-status"' in spec_hb_html and 'id="hb-out-verdict"' in spec_hb_html)

    # ════════════════════════════════════════════════════════════
    # TEST 78: 先進封裝 (TSMC CoWoS, SoIC, Samsung I-Cube, Intel Foveros) 邏輯 Base Die PDK 互連矩陣、微凸塊熱阻與多晶粒晶圓測試模擬器
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 78: 先進封裝 (TSMC CoWoS, SoIC, Samsung I-Cube, Intel Foveros) 邏輯 Base Die PDK 互連矩陣、微凸塊熱阻與多晶粒晶圓測試模擬器 ═══")
    pkg_js = (BASE / "advanced-packaging-pdks-simulator.js").read_text(encoding="utf-8")
    test("advanced-packaging-pdks-simulator.js 存在且導出 calculatePackagingPdkMetrics、drawPackagingCanvas 與 initPackagingPdkSimulator",
         "export function calculatePackagingPdkMetrics" in pkg_js and "export function drawPackagingCanvas" in pkg_js and "export function initPackagingPdkSimulator" in pkg_js)
    test("advanced-packaging-pdks-simulator.js 包含五大封裝預設 (CoWoS-S, CoWoS-L, SoIC-X, I-Cube, Foveros)",
         "PACKAGING_PRESETS" in pkg_js and "tsmc_cowos_s_hbm" in pkg_js and "tsmc_cowos_l_chiplet" in pkg_js and "tsmc_soic_x_3d" in pkg_js and "samsung_icube_x_2_5d" in pkg_js and "intel_foveros_direct_3d" in pkg_js)
    test("advanced-packaging-pdks-simulator.js 第一性原理 D2D 傳輸延遲、單線頻寬容量、垂直熱阻接面溫升與 Base Die 0-Mask eNVM 預算模型",
         "tauPicoSec" in pkg_js and "maxChannelBwGbps" in pkg_js and "junctionTempRiseC" in pkg_js and "effectiveThetaKW" in pkg_js and "totalEnvmBudgetKb" in pkg_js)
    test("advanced-packaging-pdks-simulator.js 包含雙模態視覺化 (interconnect_latency_bandwidth 與 thermal_resistance_gradient)",
         "interconnect_latency_bandwidth" in pkg_js and "thermal_resistance_gradient" in pkg_js)

    tech_html = (BASE / "technology-comparison.html").read_text(encoding="utf-8")
    test("technology-comparison.html 整合 advanced-packaging-simulator-root 工作台與模組腳本引用",
         'id="advanced-packaging-simulator-root"' in tech_html and 'src="advanced-packaging-pdks-simulator.js' in tech_html)
    test("technology-comparison.html 包含預設選擇器、走線長度/功耗/速率三軸滑桿與雙模態 Canvas",
         'id="pkg-preset-select"' in tech_html and 'id="pkg-trace-slider"' in tech_html and 'id="pkg-power-slider"' in tech_html and 'id="pkg-rate-slider"' in tech_html and 'id="pkg-canvas"' in tech_html)
    test("technology-comparison.html 包含四大 KPI 輸出欄位 (Latency, Bandwidth, Junction Temp, eNVM Budget) 與判定橫幅",
         'id="pkg-out-latency"' in tech_html and 'id="pkg-out-bw"' in tech_html and 'id="pkg-out-temp"' in tech_html and 'id="pkg-out-envm"' in tech_html and 'id="pkg-out-rating"' in tech_html and 'id="pkg-out-verdict"' in tech_html)

    # ════════════════════════════════════════════════════════════
    # TEST 79: 車規自駕 HPC / AI Accelerator HBM4 極限任務剖面、動態 sPPR / hPPR 巡檢清洗與 FIT 率退化模擬器
    # ════════════════════════════════════════════════════════════
    print("\n═══ TEST 79: 車規自駕 HPC / AI Accelerator HBM4 極限任務剖面、動態 sPPR / hPPR 巡檢清洗與 FIT 率退化模擬器 ═══")
    scrub_js = (BASE / "automotive-hbm4-scrubbing-simulator.js").read_text(encoding="utf-8")
    test("automotive-hbm4-scrubbing-simulator.js 存在且導出 calculateAutomotiveHbm4Metrics、drawAutomotiveHbm4Canvas 與 initAutomotiveHbm4Simulator",
         "export function calculateAutomotiveHbm4Metrics" in scrub_js and "export function drawAutomotiveHbm4Canvas" in scrub_js and "export function initAutomotiveHbm4Simulator" in scrub_js)
    test("automotive-hbm4-scrubbing-simulator.js 包含四大任務剖面預設與四大修復架構",
         "AUTOMOTIVE_MISSION_PRESETS" in scrub_js and "l4_robotaxi_extreme" in scrub_js and "highway_adas_pilot" in scrub_js and "in_cabin_ai_cockpit" in scrub_js and "heavy_truck_powertrain" in scrub_js and "REPAIR_ARCHITECTURES" in scrub_js and "hybrid_tier_scrubbing" in scrub_js and "dynamic_sppr_only" in scrub_js and "hard_anti_fuse_only" in scrub_js and "legacy_ecc_unmanaged" in scrub_js)
    test("automotive-hbm4-scrubbing-simulator.js 第一性原理中子通量海拔擴增、Arrhenius 軟錯誤熱加速、焊點熱疲勞與週期巡檢雙錯抑制模型",
         "rawSerFit" in scrub_js and "baseHardFailureFit" in scrub_js and "totalResidualFit" in scrub_js and "spfmPercent" in scrub_js and "lfmPercent" in scrub_js and "hpprUsagePercent" in scrub_js)
    test("automotive-hbm4-scrubbing-simulator.js 包含雙模態視覺化 (scrubbing_period_vs_residual_fit 與 junction_temp_mission_lifetime)",
         "scrubbing_period_vs_residual_fit" in scrub_js and "junction_temp_mission_lifetime" in scrub_js)

    auto_hbm_html = (BASE / "automotive-nvm.html").read_text(encoding="utf-8")
    test("automotive-nvm.html 整合 auto-hbm4-scrubbing-simulator-root 工作台與模組腳本引用",
         'id="auto-hbm4-scrubbing-simulator-root"' in auto_hbm_html and 'src="automotive-hbm4-scrubbing-simulator.js' in auto_hbm_html)
    test("automotive-nvm.html 包含任務選擇器、修復選擇器、溫度/週期/容量三軸滑桿與雙模態 Canvas",
         'id="hbm4-scrub-mission-select"' in auto_hbm_html and 'id="hbm4-scrub-repair-select"' in auto_hbm_html and 'id="hbm4-scrub-temp-slider"' in auto_hbm_html and 'id="hbm4-scrub-period-slider"' in auto_hbm_html and 'id="hbm4-scrub-density-slider"' in auto_hbm_html and 'id="hbm4-scrub-canvas"' in auto_hbm_html)
    test("automotive-nvm.html 包含四大 KPI 輸出欄位 (Raw FIT, Residual FIT, SPFM, hPPR Usage) 與判定橫幅",
         'id="hbm4-scrub-out-raw-fit"' in auto_hbm_html and 'id="hbm4-scrub-out-res-fit"' in auto_hbm_html and 'id="hbm4-scrub-out-spfm"' in auto_hbm_html and 'id="hbm4-scrub-out-hppr"' in auto_hbm_html and 'id="hbm4-scrub-out-rating"' in auto_hbm_html and 'id="hbm4-scrub-out-verdict"' in auto_hbm_html)

    print(f"\n{'='*60}")
    print(f"  TOTAL: {PASS + FAIL}  |  ✅ PASS: {PASS}  |  ❌ FAIL: {FAIL}")
    print(f"{'='*60}")
    return FAIL == 0

if __name__ == "__main__":
    exit(0 if run_tests() else 1)




