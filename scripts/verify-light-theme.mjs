import path from "node:path";
import { chromium } from "playwright";
import { loadPublicRoutes } from "./public-routes.mjs";
import { startTestServer } from "./test-server.mjs";

// 規則 0003 的渲染門禁：頁首、頁尾、麵包屑、可見的大型容器與 canvas 都不得是深色底，
// 語言切換鈕的文字對比至少 4.5:1。以實際渲染結果判定，避免只改外框或覆寫不完整。
const root = path.resolve(import.meta.dirname, "..");
// --source-only（或 NVM_QA_SOURCE_ONLY=1）擋下執行期的淡色轉換，確認原始碼本身就是淡色。
const sourceOnly = process.argv.includes("--source-only") || process.env.NVM_QA_SOURCE_ONLY === "1";
const args = process.argv.slice(2).filter(arg => !arg.startsWith("--"));
const pages = args[0] ? [args[0]] : [...loadPublicRoutes(root).pages];
const widths = args[1] ? [Number(args[1])] : [1440, 390];
const DARK_LUMINANCE = 0.2;
const MIN_AREA = 10000;
const failures = [];
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const browser = await chromium.launch({ headless: true });

for (const pageName of pages) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1, colorScheme: "light" });
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
    if (sourceOnly) await page.route("**/literature-paper.js*", route => route.abort());
    await page.goto(new URL(pageName, base).href, { waitUntil: "networkidle" });
    // 模擬器在進入視窗時才繪製 canvas，逐段捲動後再量測。
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 800) {
      await page.evaluate(top => window.scrollTo(0, top), y);
      await page.waitForTimeout(40);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    const audit = await page.evaluate(({ DARK_LUMINANCE, MIN_AREA }) => {
      const colors = value => [...value.matchAll(/rgba?\(([^)]+)\)/g)].map(match => {
        const [r, g, b, a = 1] = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        return { r, g, b, a };
      });
      const luminance = ({ r, g, b }) => {
        const channel = value => {
          const normalized = value / 255;
          return normalized <= .03928 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
        };
        return .2126 * channel(r) + .7152 * channel(g) + .0722 * channel(b);
      };
      const contrast = (a, b) => {
        const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
        return (high + .05) / (low + .05);
      };
      const blend = (top, bottom, alpha) => ({ r: top.r * alpha + bottom.r * (1 - alpha), g: top.g * alpha + bottom.g * (1 - alpha), b: top.b * alpha + bottom.b * (1 - alpha) });
      const ownBackground = element => {
        const style = getComputedStyle(element);
        const color = colors(style.backgroundColor)[0];
        if (color && color.a >= .5) return color;
        if (style.backgroundImage.includes("gradient")) {
          const stops = colors(style.backgroundImage).filter(stop => stop.a >= .5);
          if (stops.length) return stops.reduce((sum, stop) => ({ r: sum.r + stop.r / stops.length, g: sum.g + stop.g / stops.length, b: sum.b + stop.b / stops.length }), { r: 0, g: 0, b: 0 });
        }
        return null;
      };
      const effectiveBackground = element => {
        for (let node = element; node; node = node.parentElement) {
          const color = ownBackground(node);
          if (color) return color;
        }
        return { r: 255, g: 255, b: 255 };
      };
      const visible = element => {
        const style = getComputedStyle(element);
        return element.getClientRects().length > 0 && style.visibility !== "hidden" && Number(style.opacity) > 0;
      };
      const label = element => {
        const id = element.id ? `#${element.id}` : "";
        const name = typeof element.className === "string" && element.className.trim() ? `.${element.className.trim().split(/\s+/).slice(0, 2).join(".")}` : "";
        return `${element.tagName.toLowerCase()}${id}${name}`;
      };
      const dark = [];
      const shell = document.querySelectorAll(".site-header, .knowledge-header, header[role=banner], .site-breadcrumb, footer, .site-footer, .knowledge-footer, .hub-footer");
      for (const element of shell) {
        if (!visible(element)) continue;
        const color = effectiveBackground(element);
        if (luminance(color) < DARK_LUMINANCE) dark.push(`${label(element)} shell ${luminance(color).toFixed(3)}`);
      }
      // 按鈕與連結的填色是強調色，不是內容載體；圖片與 SVG 由各自的圖稿檢查負責。
      const skipped = ["A", "BUTTON", "IMG", "PICTURE", "VIDEO", "SVG", "CANVAS", "IFRAME"];
      for (const element of document.body.querySelectorAll("*")) {
        if (skipped.includes(element.tagName.toUpperCase()) || element.closest("svg")) continue;
        const color = ownBackground(element);
        if (!color || luminance(color) >= DARK_LUMINANCE || !visible(element)) continue;
        const box = element.getBoundingClientRect();
        // 沒有文字的細長元素是資料長條或分隔線，屬圖形標記，不是內容底。
        if (box.height <= 24 && !element.textContent.trim()) continue;
        if (box.width * box.height >= MIN_AREA) dark.push(`${label(element)} ${Math.round(box.width)}x${Math.round(box.height)} ${luminance(color).toFixed(3)}`);
      }
      for (const canvas of document.querySelectorAll("canvas")) {
        const box = canvas.getBoundingClientRect();
        if (!visible(canvas) || box.width * box.height < MIN_AREA || !canvas.width || !canvas.height) continue;
        const carrier = effectiveBackground(canvas);
        let total = 0;
        let samples = 0;
        try {
          const data = canvas.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height).data;
          if (!data) continue;
          for (let index = 0; index < data.length; index += 4 * 16) {
            const pixel = { r: data[index], g: data[index + 1], b: data[index + 2] };
            total += luminance(blend(pixel, carrier, data[index + 3] / 255));
            samples += 1;
          }
        } catch {
          continue;
        }
        if (samples && total / samples < DARK_LUMINANCE) dark.push(`${label(canvas)} canvas ${(total / samples).toFixed(3)}`);
      }
      const toggles = [];
      for (const option of document.querySelectorAll(".language-toggle [data-lang-option], .language-toggle")) {
        if (!visible(option) || !option.textContent.trim() || option.querySelector("[data-lang-option]")) continue;
        const toggle = option.closest(".language-toggle");
        let alpha = colors(getComputedStyle(option).color)[0]?.a ?? 1;
        for (let node = option; node && node !== toggle.parentElement; node = node.parentElement) alpha *= Number(getComputedStyle(node).opacity);
        const background = effectiveBackground(option);
        const ratio = contrast(blend(colors(getComputedStyle(option).color)[0], background, alpha), background);
        if (ratio < 4.5) toggles.push(`${option.textContent.trim()} ${ratio.toFixed(2)}:1`);
      }
      return { dark: [...new Set(dark)], toggles };
    }, { DARK_LUMINANCE, MIN_AREA });

    if (audit.dark.length) failures.push(`${pageName}@${width}: dark background ${audit.dark.slice(0, 12).join(" | ")}${audit.dark.length > 12 ? ` (+${audit.dark.length - 12})` : ""}`);
    if (audit.toggles.length) failures.push(`${pageName}@${width}: language toggle contrast ${audit.toggles.join(" | ")}`);
    await page.close();
  }
}

await browser.close();
await server?.close();
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`light theme gate passed${sourceOnly ? " (source only)" : ""}: ${pages.length} pages x ${widths.length} widths`);
