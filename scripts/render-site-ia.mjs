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
      return {
        docOverflow: Math.max(doc.scrollWidth - doc.clientWidth, body.scrollWidth - body.clientWidth),
        brand: brand ? new URL(brand.href).pathname : "missing",
        overflow,
        heroSize: document.querySelector(".hub-hero h1") ? parseFloat(getComputedStyle(document.querySelector(".hub-hero h1")).fontSize) : null,
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
    if (pageName === "index.html" && (!audit.disclaimer || audit.disclaimer.size < 9 || audit.disclaimer.contrast < 4.5)) failures.push(`${pageName}@${width}: topology disclaimer ${JSON.stringify(audit.disclaimer)}`);
    if (pageName === "index.html" && width <= 390 && audit.heroSize > 44.1) failures.push(`${pageName}@${width}: mobile hero ${audit.heroSize}px exceeds 44px`);
    if (errors.length) failures.push(`${pageName}@${width}: ${errors.join(" | ")}`);

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
