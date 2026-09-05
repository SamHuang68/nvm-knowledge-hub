"""
test_hub_integrity_v3.py — NVM Knowledge Hub V3.0 架構重構驗證
驗證三層知識架構、Knowledge Map Grid、導覽一致性、孤兒頁收編、語系完整性
"""
import re
from pathlib import Path

BASE = Path(r"c:\Users\Sam\Documents\antigravity\peaceful-newton\secure-storage-knowledge-hub")
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
    test("km-grid class 存在", "km-grid" in ic)
    test("km-card class 存在", "km-card" in ic)
    test("Layer 1 Foundations", "foundations" in ic and "LAYER 1" in ic)
    test("Layer 2 Architecture", "architecture" in ic and "LAYER 2" in ic)
    test("Layer 3 Applications", "applications" in ic and "LAYER 3" in ic)
    test("Resources", "RESOURCES" in ic)

    km_links = re.findall(r'<a\s+class="km-card"\s+href="([^"]+)"', ic)
    for link in ["memory-physics.html", "technology-comparison.html",
                 "secure-storage.html", "security-assurance.html",
                 "ai-nvm-opportunities.html", "iot-mcu-envm.html",
                 "automotive-nvm.html", "specialty-nvm.html",
                 "whitepaper/", "briefing/index.html", "memory-evidence.html"]:
        test(f"Grid has {link}", link in km_links, f"missing {link}")

    # ===== TEST 3: 全局搜尋 =====
    print("\n═══ TEST 3: 全局搜尋 ═══")
    test("searchTrigger", "searchTrigger" in ic)
    test("searchOverlay", "searchOverlay" in ic)
    test("Ctrl+K binding", 'key === "k"' in ic or "key === 'k'" in ic)
    test("SEARCH_INDEX", "SEARCH_INDEX" in ic)

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
    for name, content in [("F2", tc_c), ("M2", iot_c), ("M3", auto_c), ("M4", spec_c)]:
        test(f"{name} 採用白底輕盈背景 (#f8fafc)", "background-color: #f8fafc" in content)
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

    print(f"\n{'='*60}")
    print(f"  TOTAL: {PASS + FAIL}  |  ✅ PASS: {PASS}  |  ❌ FAIL: {FAIL}")
    print(f"{'='*60}")
    return FAIL == 0

if __name__ == "__main__":
    exit(0 if run_tests() else 1)

