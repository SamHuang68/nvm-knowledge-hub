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

    print(f"\n{'='*60}")
    print(f"  TOTAL: {PASS + FAIL}  |  ✅ PASS: {PASS}  |  ❌ FAIL: {FAIL}")
    print(f"{'='*60}")
    return FAIL == 0

if __name__ == "__main__":
    exit(0 if run_tests() else 1)
