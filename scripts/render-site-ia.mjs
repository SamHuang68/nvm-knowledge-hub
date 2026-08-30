import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, ".loop-engineering", "rendered-r18");
fs.mkdirSync(output, { recursive: true });

const allPages = ["index.html", "secure-storage.html", "ai-nvm-opportunities.html", "memory-physics.html", "memory-evidence.html", "oip-secure-storage.html", "security-assurance.html"];
const pages = process.argv[2] ? [process.argv[2]] : allPages;
const widths = process.argv[3] ? [Number(process.argv[3])] : [1440, 1320, 1180, 900, 620, 390, 312];
const failures = [];
const browser = await chromium.launch({ headless: true });

for (const pageName of pages) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors = [];
    page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
    page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
    page.on("requestfailed", request => errors.push(`request: ${request.url()} ${request.failure()?.errorText || "failed"}`));
    await page.goto(`http://127.0.0.1:8765/${pageName}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.querySelectorAll(".reveal").forEach(node => node.classList.add("visible")));

    const audit = await page.evaluate(() => {
      const doc = document.documentElement;
      const body = document.body;
      const brand = document.querySelector("header .brand");
      const overflow = [...document.querySelectorAll("body *")].filter(element => {
        const style = getComputedStyle(element);
        const visible = element.getClientRects().length > 0;
        return visible && ["auto", "scroll"].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 1;
      }).map(element => `${element.tagName.toLowerCase()}.${element.className || ""}:${element.scrollWidth}/${element.clientWidth}`);
      const clipped = [...document.querySelectorAll("input, select, textarea, button, [role='button'], [role='tab'], [role='tabpanel'], table, pre, code, .calc-grid-layout, .suite-card")].filter(element => {
        const style = getComputedStyle(element);
        if (element.getClientRects().length === 0 || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
        const box = element.getBoundingClientRect();
        if (box.width < 4 || box.height < 4) return false;
        let ancestor = element.parentElement;
        while (ancestor && ancestor !== document.body) {
          const ancestorStyle = getComputedStyle(ancestor);
          if (["hidden", "clip"].includes(ancestorStyle.overflowX)) {
            const boundary = ancestor.getBoundingClientRect();
            return box.left < boundary.left - 1 || box.right > boundary.right + 1;
          }
          ancestor = ancestor.parentElement;
        }
        return box.left < -1 || box.right > innerWidth + 1;
      }).slice(0, 12).map(element => {
        const box = element.getBoundingClientRect();
        return `${element.tagName.toLowerCase()}.${element.className || ""}:${Math.round(box.left)}/${Math.round(box.right)}`;
      });
      const idCounts = new Map();
      for (const element of document.querySelectorAll("[id]")) idCounts.set(element.id, (idCounts.get(element.id) || 0) + 1);
      const duplicateIds = [...idCounts.entries()].filter(([, count]) => count > 1).map(([id, count]) => `${id}:${count}`);
      const contrastRatio = (foreground, background) => {
        const rgb = value => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
        const luminance = value => {
          const channels = rgb(value).map(channel => {
            const normalized = channel / 255;
            return normalized <= .03928 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
          });
          return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
        };
        const a = luminance(foreground);
        const b = luminance(background);
        return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      };
      const disclaimer = document.querySelector(".workbench-feature > small");
      const disclaimerStyle = disclaimer ? getComputedStyle(disclaimer) : null;
      const disclaimerParentStyle = disclaimer?.parentElement ? getComputedStyle(disclaimer.parentElement) : null;
      const headerBox = document.querySelector(".site-header")?.getBoundingClientRect();
      const breadcrumbBox = document.querySelector(".site-breadcrumb")?.getBoundingClientRect();
      const topicLinks = [...document.querySelectorAll(".topic-switch a")].filter(node => node.getClientRects().length > 0);
      const claimLeafNodes = [...document.querySelectorAll(".claim-rung h3 [data-lang], .claim-rung p [data-lang]")]
        .filter(node => node.getClientRects().length > 0);
      return {
        docOverflow: Math.max(doc.scrollWidth - doc.clientWidth, body.scrollWidth - body.clientWidth),
        brand: brand ? new URL(brand.href).pathname : "missing",
        overflow,
        clipped,
        duplicateIds,
        heroSize: document.querySelector(".hub-hero h1") ? parseFloat(getComputedStyle(document.querySelector(".hub-hero h1")).fontSize) : null,
        breadcrumbBelowHeader: !breadcrumbBox || !headerBox || breadcrumbBox.top >= headerBox.bottom - 1,
        topicSwitchInside: topicLinks.every(node => { const box = node.getBoundingClientRect(); return box.left >= -1 && box.right <= innerWidth + 1 && (!headerBox || box.top >= headerBox.bottom - 1); }),
        claimLeafMinimum: claimLeafNodes.length ? Math.min(...claimLeafNodes.map(node => parseFloat(getComputedStyle(node).fontSize))) : null,
        disclaimer: disclaimerStyle ? {
          size: parseFloat(disclaimerStyle.fontSize),
          contrast: contrastRatio(disclaimerStyle.color, disclaimerParentStyle.backgroundColor)
        } : null,
        wide: [...document.querySelectorAll("body *")].filter(element => {
          const box = element.getBoundingClientRect();
          return element.getClientRects().length > 0 && (box.right > innerWidth + 1 || box.left < -1);
        }).slice(0, 12).map(element => {
          const box = element.getBoundingClientRect();
          return `${element.tagName.toLowerCase()}.${element.className || ""}:${Math.round(box.left)}/${Math.round(box.right)}`;
        })
      };
    });
    if (audit.docOverflow > 1) failures.push(`${pageName}@${width}: document overflow ${audit.docOverflow}px; wide ${audit.wide.join(", ")}`);
    if (!audit.brand.endsWith("/index.html")) failures.push(`${pageName}@${width}: brand ${audit.brand}`);
    if (audit.overflow.length) failures.push(`${pageName}@${width}: internal horizontal scroller ${audit.overflow.join(", ")}`);
    if (audit.clipped.length) failures.push(`${pageName}@${width}: clipped horizontal content ${audit.clipped.join(", ")}`);
    if (audit.duplicateIds.length) failures.push(`${pageName}@${width}: duplicate ids ${audit.duplicateIds.join(", ")}`);
    if (!audit.breadcrumbBelowHeader || !audit.topicSwitchInside) failures.push(`${pageName}@${width}: shell navigation is obscured by header ${JSON.stringify({ breadcrumbBelowHeader: audit.breadcrumbBelowHeader, topicSwitchInside: audit.topicSwitchInside })}`);
    if (audit.claimLeafMinimum !== null && audit.claimLeafMinimum < 13) failures.push(`${pageName}@${width}: evidence-card leaf text ${audit.claimLeafMinimum}px is below 13px`);
    if (pageName === "index.html" && (!audit.disclaimer || audit.disclaimer.size < 9 || audit.disclaimer.contrast < 4.5)) failures.push(`${pageName}@${width}: topology disclaimer ${JSON.stringify(audit.disclaimer)}`);
    if (pageName === "index.html" && width <= 390 && audit.heroSize > 44.1) failures.push(`${pageName}@${width}: mobile hero ${audit.heroSize}px exceeds 44px`);
    if (errors.length) failures.push(`${pageName}@${width}: ${errors.join(" | ")}`);

    if (pageName === "ai-nvm-opportunities.html") {
      if ([1440, 390, 312].includes(width)) {
        await page.locator("#opportunities .opportunity-list").screenshot({ path: path.join(output, `ai-nvm-opportunities-list-${width}.png`) });
        await page.locator(".decision-grammar").screenshot({ path: path.join(output, `ai-nvm-decision-grammar-${width}.png`) });
        await page.locator("#sources .research-intake").screenshot({ path: path.join(output, `ai-nvm-research-disposition-${width}.png`) });
      }
      const repairAudit = await page.evaluate(() => {
        const module = document.querySelector("#repair-programming");
        const moduleBox = module?.getBoundingClientRect();
        const bodyNodes = [...document.querySelectorAll("#repair-programming .repair-programming-lede, #repair-programming .repair-path > p, #repair-programming .repair-evidence-boundary p, #repair-programming .programming-chain li span, #repair-programming nav b")]
          .filter(node => node.getClientRects().length > 0);
        const title = document.querySelector("#repair-programming-title");
        const boundary = document.querySelector("#repair-programming .repair-evidence-boundary");
        const smallestBody = bodyNodes
          .map(node => ({
            node: `${node.tagName.toLowerCase()}.${node.className || ""}`,
            size: parseFloat(getComputedStyle(node).fontSize),
            text: node.textContent.trim().slice(0, 48),
          }))
          .sort((a, b) => a.size - b.size)[0] || null;
        return {
          moduleInside: moduleBox ? moduleBox.left >= -1 && moduleBox.right <= innerWidth + 1 : false,
          minimumBodySize: bodyNodes.length ? Math.min(...bodyNodes.map(node => parseFloat(getComputedStyle(node).fontSize))) : 0,
          smallestBody,
          titleSize: title ? parseFloat(getComputedStyle(title).fontSize) : 0,
          boundaryVisible: Boolean(boundary && boundary.getClientRects().length),
          sourceCount: document.querySelectorAll("#repair-programming .repair-evidence-links a").length,
          evidenceIds: module?.getAttribute("data-record-ids")?.trim().split(/\s+/).length || 0,
        };
      });
      if (!repairAudit.moduleInside || repairAudit.minimumBodySize < 12 || !repairAudit.boundaryVisible || repairAudit.sourceCount !== 4 || repairAudit.evidenceIds !== 5) {
        failures.push(`${pageName}@${width}: repair module ${JSON.stringify(repairAudit)}`);
      }
      if (width <= 390 && repairAudit.titleSize > 34.1) failures.push(`${pageName}@${width}: repair title ${repairAudit.titleSize}px exceeds 34px`);
      if ([1440, 390, 312].includes(width)) {
        await page.locator("#repair-programming").screenshot({ path: path.join(output, `ai-nvm-repair-${width}.png`) });
      }

      const originalLanguage = await page.evaluate(() => document.body.dataset.language);
      if (originalLanguage !== "en") await page.locator("#languageToggle").click();

      const opportunityAudit = await page.evaluate(() => {
        const firstCard = document.querySelector("#opportunityList .opportunity-record:not([hidden])");
        const cardBox = firstCard?.getBoundingClientRect();
        const decisionFields = [...document.querySelectorAll("#opportunityList .opportunity-record:not([hidden]) .record-boundary-field")];
        const fieldText = decisionFields.flatMap(field => [...field.querySelectorAll("small, p")]).filter(node => node.getClientRects().length > 0);
        const namespace = document.querySelector(".decision-grammar");
        return {
          firstCardInside: cardBox ? cardBox.left >= -1 && cardBox.right <= innerWidth + 1 : false,
          fieldCount: firstCard?.querySelectorAll(".record-boundary-field").length || 0,
          minimumFieldText: fieldText.length ? Math.min(...fieldText.map(node => parseFloat(getComputedStyle(node).fontSize))) : 0,
          lineageClosed: [...document.querySelectorAll("#opportunityList details.record-lineage")].every(node => !node.open),
          namespaceVisible: Boolean(namespace?.getClientRects().length),
          namespaceInside: namespace ? namespace.getBoundingClientRect().left >= -1 && namespace.getBoundingClientRect().right <= innerWidth + 1 : false
        };
      });
      if (!opportunityAudit.firstCardInside || opportunityAudit.fieldCount !== 4 || opportunityAudit.minimumFieldText < 10 || !opportunityAudit.lineageClosed || !opportunityAudit.namespaceVisible || !opportunityAudit.namespaceInside) {
        failures.push(`${pageName}@${width}: opportunity semantic/readability contract ${JSON.stringify(opportunityAudit)}`);
      }
      const firstLineage = page.locator("#opportunityList .opportunity-record:not([hidden]) details.record-lineage").first();
      await firstLineage.locator("summary").click();
      const lineageAudit = await firstLineage.evaluate(node => {
        const box = node.getBoundingClientRect();
        return { open: node.open, inside: box.left >= -1 && box.right <= innerWidth + 1, detailVisible: Boolean(node.querySelector(".record-lineage-detail")?.getClientRects().length) };
      });
      if (!lineageAudit.open || !lineageAudit.inside || !lineageAudit.detailVisible) failures.push(`${pageName}@${width}: opportunity lineage disclosure ${JSON.stringify(lineageAudit)}`);
      await firstLineage.locator("summary").click();
      const englishAudit = await page.evaluate(() => ({
        pageLanguage: document.body.dataset.language,
        documentLanguage: document.documentElement.lang,
        visibleChineseNodes: [...document.querySelectorAll("#repair-programming [data-lang='zh']")]
          .filter(node => node.getClientRects().length > 0).length,
        visibleEnglishNodes: [...document.querySelectorAll("#repair-programming [data-lang='en']")]
          .filter(node => node.getClientRects().length > 0).length,
      }));
      if (englishAudit.pageLanguage !== "en" || englishAudit.documentLanguage !== "en" || englishAudit.visibleChineseNodes !== 0 || englishAudit.visibleEnglishNodes < 7) {
        failures.push(`${pageName}@${width}: repair English mode ${JSON.stringify(englishAudit)}`);
      }
      if (originalLanguage !== "en") await page.locator("#languageToggle").click();

      const initialCount = await page.locator("#opportunityCount").textContent();
      await page.locator("button[data-opportunity-view='all']").click();
      const allViewCount = await page.locator("#opportunityCount").textContent();
      await page.locator("button[data-opportunity-view='source-grounded']").click();
      const restoredGroundedCount = await page.locator("#opportunityCount").textContent();
      await page.locator("button[data-write-filter='immutable']").click();
      const filterAudit = await page.evaluate(() => ({
        moduleVisible: Boolean(document.querySelector("#repair-programming")?.getClientRects().length),
        count: document.querySelector("#opportunityCount")?.textContent,
        bmcVisible: Boolean(document.querySelector('[data-record-ids~="AI-NVM-BMC-001"]')?.getClientRects().length),
        bmcInside: (() => {
          const box = document.querySelector('[data-record-ids~="AI-NVM-BMC-001"]')?.getBoundingClientRect();
          return box ? box.left >= -1 && box.right <= innerWidth + 1 : false;
        })(),
      }));
      await page.locator("button[data-write-filter='repeated']").click();
      const repeatedAudit = await page.evaluate(() => {
        const card = document.querySelector('[data-record-id="AI-NVM-DDR5-002"]');
        const box = card?.getBoundingClientRect();
        return { visible: Boolean(card?.getClientRects().length), inside: box ? box.left >= -1 && box.right <= innerWidth + 1 : false };
      });
      await page.locator("button[data-write-filter='few']").click();
      const fewWriteAudit = await page.evaluate(() => {
        const card = document.querySelector('[data-record-id="AI-NVM-DDR5-001"]');
        const box = card?.getBoundingClientRect();
        return { visible: Boolean(card?.getClientRects().length), inside: box ? box.left >= -1 && box.right <= innerWidth + 1 : false };
      });
      await page.locator("button[data-write-filter='all']").click();
      if (initialCount?.trim() !== "07") failures.push(`${pageName}@${width}: initial source-grounded count ${JSON.stringify(initialCount)}`);
      if (allViewCount?.trim() !== "12" || restoredGroundedCount?.trim() !== "07") failures.push(`${pageName}@${width}: opportunity view toggle ${JSON.stringify({ allViewCount, restoredGroundedCount })}`);
      if (!filterAudit.moduleVisible || filterAudit.count === initialCount || !filterAudit.bmcVisible || !filterAudit.bmcInside) failures.push(`${pageName}@${width}: immutable/BMC filter ${JSON.stringify(filterAudit)}`);
      if (!repeatedAudit.visible || !repeatedAudit.inside) failures.push(`${pageName}@${width}: repeated/DDR5 SPD filter ${JSON.stringify(repeatedAudit)}`);
      if (!fewWriteAudit.visible || !fewWriteAudit.inside) failures.push(`${pageName}@${width}: few-write/DDR5 PMIC filter ${JSON.stringify(fewWriteAudit)}`);
    }

    if (pageName === "memory-physics.html" && [1440, 390].includes(width)) {
      await page.locator("#method").screenshot({ path: path.join(output, `memory-physics-method-${width}.png`) });
    }

    if (pageName === "secure-storage.html") {
      const portfolioMetricAudit = await page.evaluate(() => {
        const expected = ["OIP-PUF-SCALE-001", "OIP-PUF-HISTORY-001", "OIP-OTP-SCALE-001"];
        const cards = [...document.querySelectorAll("#evidence .evidence-numbers article")];
        const boxes = cards.map(card => card.getBoundingClientRect());
        const copy = cards.map(card => card.textContent.replace(/\s+/g, " ").trim());
        return {
          ids: cards.map(card => card.dataset.recordId),
          inside: boxes.every(box => box.left >= -1 && box.right <= innerWidth + 1),
          minimumCopySize: cards.length ? Math.min(...cards.flatMap(card => [...card.querySelectorAll("strong, span")]).map(node => parseFloat(getComputedStyle(node).fontSize))) : 0,
          scopedCopy: copy[0]?.includes("SRAM PUF technology") && copy[1]?.includes("SRAM PUF technology") && copy[2]?.includes("antifuse OTP NVM"),
          exactBindings: expected.every((recordId, index) => cards[index]?.dataset.recordId === recordId)
        };
      });
      if (!portfolioMetricAudit.inside || portfolioMetricAudit.minimumCopySize < 12 || !portfolioMetricAudit.scopedCopy || !portfolioMetricAudit.exactBindings) {
        failures.push(`${pageName}@${width}: portfolio metric evidence contract ${JSON.stringify(portfolioMetricAudit)}`);
      }
      if ([1440, 390].includes(width)) {
        await page.locator("#evidence").screenshot({ path: path.join(output, `secure-storage-evidence-${width}.png`) });
      }
    }

    if (width === 390 && await page.locator("#languageToggle").count()) {
      const originalLanguage = await page.evaluate(() => document.body.dataset.language || document.documentElement.lang);
      if (originalLanguage !== "en") await page.locator("#languageToggle").click();
      const languageAudit = await page.evaluate(() => {
        const samples = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const parent = node.parentElement;
          const text = node.textContent.replace(/\s+/g, " ").trim();
          if (!parent || !text || !/[\u3400-\u9FFF]/u.test(text)) continue;
          if (parent.closest("#languageToggle, script, style, noscript, svg, [aria-hidden='true']")) continue;
          const style = getComputedStyle(parent);
          if (parent.getClientRects().length === 0 || style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) continue;
          samples.push(`${parent.tagName.toLowerCase()}:${text.slice(0, 54)}`);
          if (samples.length === 8) break;
        }
        return {
          pageLanguage: document.body.dataset.language,
          documentLanguage: document.documentElement.lang,
          visibleCjkSamples: samples
        };
      });
      if (languageAudit.pageLanguage !== "en" || languageAudit.documentLanguage !== "en" || languageAudit.visibleCjkSamples.length) {
        failures.push(`${pageName}@${width}: English-mode language leak ${JSON.stringify(languageAudit)}`);
      }
      if (originalLanguage !== "en") await page.locator("#languageToggle").click();
    }

    const menu = page.locator("#menuToggle");
    if (await menu.count() && await menu.isVisible()) {
      await menu.click();
      const menuAudit = await page.evaluate(() => {
        const toggle = document.querySelector("#menuToggle");
        const nav = document.querySelector(".primary-nav");
        const header = document.querySelector(".site-header");
        const navBox = nav?.getBoundingClientRect();
        const headerBox = header?.getBoundingClientRect();
        return {
          expanded: toggle?.getAttribute("aria-expanded"),
          firstFocused: document.activeElement === nav?.querySelector("a"),
          inside: navBox ? navBox.left >= -1 && navBox.right <= innerWidth + 1 : false,
          below: navBox && headerBox ? navBox.top >= headerBox.bottom - 1 : false
        };
      });
      if (menuAudit.expanded !== "true" || !menuAudit.firstFocused || !menuAudit.inside || !menuAudit.below) failures.push(`${pageName}@${width}: menu contract ${JSON.stringify(menuAudit)}`);
      await page.keyboard.press("Escape");
      const escapeAudit = await page.evaluate(() => ({ expanded: document.querySelector("#menuToggle")?.getAttribute("aria-expanded"), focus: document.activeElement === document.querySelector("#menuToggle") }));
      if (escapeAudit.expanded !== "false" || !escapeAudit.focus) failures.push(`${pageName}@${width}: Escape contract ${JSON.stringify(escapeAudit)}`);
    }

    if ((pageName === "index.html" && [1440, 390, 312].includes(width)) || (pageName === "ai-nvm-opportunities.html" && width === 390) || (pageName === "secure-storage.html" && width === 390)) {
      await page.screenshot({ path: path.join(output, `${pageName.replace(".html", "")}-${width}.png`), fullPage: true });
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(output, `${pageName.replace(".html", "")}-${width}-viewport.png`), fullPage: false });
      if (pageName === "index.html") {
        await page.locator("#topics").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(output, `index-${width}-topics.png`), fullPage: false });
        await page.locator("#workbench").scrollIntoViewIfNeeded();
        const stickyHeader = await page.evaluate(() => {
          const header = document.querySelector(".site-header");
          const box = header?.getBoundingClientRect();
          return box ? { top: box.top, bottom: box.bottom, display: getComputedStyle(header).display, position: getComputedStyle(header).position } : null;
        });
        if (!stickyHeader || stickyHeader.display === "none" || stickyHeader.top < -1 || stickyHeader.top > 1 || stickyHeader.position !== "sticky") failures.push(`${pageName}@${width}: sticky header contract ${JSON.stringify(stickyHeader)}`);
        await page.screenshot({ path: path.join(output, `index-${width}-workbench.png`), fullPage: false });
        await page.locator("#research").screenshot({ path: path.join(output, `index-${width}-research.png`) });
      }
    }
    await page.close();
  }
}
await browser.close();

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`PASS: ${pages.length} pages × ${widths.length} viewports; zero document/internal overflow, brand routes to Hub, responsive menus pass focus/geometry/Escape, and no runtime failures.`);
