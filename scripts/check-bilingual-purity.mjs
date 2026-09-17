/**
 * scripts/check-bilingual-purity.mjs
 * 
 * 全站雙語純度與 CJK 零洩漏自動化門禁
 * 1. 模擬英文模式（排除所有 [data-lang="zh"] 及其子節點），全站靜態可見文字 100% 零 CJK 漢字殘留。
 * 2. 驗證所有互動與無障礙屬性（aria-label, alt, title, placeholder, data-*-en）的純度與成對完整性。
 * 3. 靜態審查前端 JS 檔案，攔截未經國際化條件保護的中文硬編碼。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CJK_REGEX = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/u;
const CJK_PUNCT_REGEX = /[\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/u;

const failures = [];
const checkedFiles = [];

// 白名單：語言切換鈕本身標籤與特殊專有名詞
const ALLOWED_EXCEPTIONS = new Set([
  '中', '繁中', '中文', 'EN', '中/EN', '中 / EN'
]);

/**
 * 收集全站公開 HTML 頁面
 */
function collectHtmlPages(dir) {
  const pages = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['.git', 'node_modules', '.loop-engineering', 'qa', 'dist', 'build'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...collectHtmlPages(fullPath));
    } else if (entry.isFile() && /\.html$/i.test(entry.name)) {
      pages.push(fullPath);
    }
  }
  return pages;
}

/**
 * 檢查單一 HTML 檔案之雙語純度
 */
function auditHtmlFile(filePath) {
  const relative = path.relative(root, filePath).replaceAll('\\', '/');
  checkedFiles.push(relative);
  const html = fs.readFileSync(filePath, 'utf8');

  // 純中文專用頁面（如 NVM技術全景中文.html）豁免英文模式投影檢測
  if (relative === 'NVM技術全景中文.html') {
    return;
  }

  // 其餘 16 個頁面（包含雙語整合頁面與純英文頁面）：執行 Simulated English DOM Projection
  // 1. 剝除 HTML 註解、script 與 style 標籤（O(N) 線性預處理，徹底杜絕災難性回溯）
  const sanitized = html
    .replace(/<!--[\s\S]*?-->/gu, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, '');

  // 2. 高效無回溯標籤與樹狀剪枝狀態機（純 DFA 線性掃描）
  const tokenRegex = /<(\/)?([a-zA-Z0-9\-]+)([^>]*)>|([^<]+)/giu;

  let zhDepth = 0;
  const tagStack = [];

  for (const match of sanitized.matchAll(tokenRegex)) {
    const [fullMatch, isClose, tagName, attrString, textNode] = match;

    // 處理文字節點
    if (textNode) {
      if (zhDepth === 0) {
        const trimmed = textNode.trim();
        if (trimmed && (CJK_REGEX.test(trimmed) || CJK_PUNCT_REGEX.test(trimmed))) {
          if (!ALLOWED_EXCEPTIONS.has(trimmed)) {
            const currentTag = tagStack.at(-1)?.tag || 'root';
            const lineNo = sanitized.slice(0, match.index).split('\n').length;
            failures.push(`${relative}:${lineNo} [DOM]: 英文模式殘留中文 (<${currentTag}>: "${trimmed.slice(0, 50)}")`);
          }
        }
      }
      continue;
    }

    // 處理 HTML 標籤
    const tag = tagName?.toLowerCase();
    const isSelfClosing = fullMatch.endsWith('/>') || ['img', 'input', 'meta', 'link', 'br', 'hr', 'col'].includes(tag);

    if (isClose) {
      const lastIdx = tagStack.findLastIndex(item => item.tag === tag);
      if (lastIdx >= 0) {
        const popped = tagStack.splice(lastIdx);
        for (const item of popped) {
          if (item.isZh) zhDepth = Math.max(0, zhDepth - 1);
        }
      }
    } else {
      const isZh = /\bdata-lang=["']zh["']/iu.test(attrString);
      const isToggle = /class=["'][^"']*language-toggle[^"']*["']/iu.test(attrString) || /\bid=["']languageToggle["']/iu.test(attrString);

      // 檢查互動屬性純度
      if (zhDepth === 0 && !isZh && !isToggle) {
        for (const attr of ['aria-label', 'alt', 'title', 'placeholder', 'data-aria-en', 'data-alt-en', 'data-placeholder-en', 'data-title-en', 'data-description-en']) {
          const attrMatch = attrString.match(new RegExp(`\\b${attr}=["']([^"']*)["']`, 'iu'));
          if (attrMatch && (CJK_REGEX.test(attrMatch[1]) || CJK_PUNCT_REGEX.test(attrMatch[1]))) {
            const lineNo = sanitized.slice(0, match.index).split('\n').length;
            failures.push(`${relative}:${lineNo} [Attr]: 英文屬性 ${attr} 包含中文: "${attrMatch[1]}"`);
          }
        }
      }

      // 檢查雙語屬性對稱性
      const hasAriaZh = /\bdata-aria-zh=["']/iu.test(attrString);
      const hasAriaEn = /\bdata-aria-en=["']/iu.test(attrString);
      if (hasAriaZh !== hasAriaEn) {
        const lineNo = sanitized.slice(0, match.index).split('\n').length;
        failures.push(`${relative}:${lineNo} [Parity]: data-aria-zh 與 data-aria-en 未成對出現在 <${tag}>`);
      }

      const hasAltZh = /\bdata-alt-zh=["']/iu.test(attrString);
      const hasAltEn = /\bdata-alt-en=["']/iu.test(attrString);
      if (hasAltZh !== hasAltEn) {
        const lineNo = sanitized.slice(0, match.index).split('\n').length;
        failures.push(`${relative}:${lineNo} [Parity]: data-alt-zh 與 data-alt-en 未成對出現在 <${tag}>`);
      }

      const hasTitleZh = /\bdata-title-zh=["']/iu.test(attrString);
      const hasTitleEn = /\bdata-title-en=["']/iu.test(attrString);
      if (hasTitleZh !== hasTitleEn) {
        const lineNo = sanitized.slice(0, match.index).split('\n').length;
        failures.push(`${relative}:${lineNo} [Parity]: data-title-zh 與 data-title-en 未成對出現在 <${tag}>`);
      }

      const hasPlaceholderZh = /\bdata-placeholder-zh=["']/iu.test(attrString);
      const hasPlaceholderEn = /\bdata-placeholder-en=["']/iu.test(attrString);
      if (hasPlaceholderZh !== hasPlaceholderEn) {
        const lineNo = sanitized.slice(0, match.index).split('\n').length;
        failures.push(`${relative}:${lineNo} [Parity]: data-placeholder-zh 與 data-placeholder-en 未成對出現在 <${tag}>`);
      }

      const hasDescriptionZh = /\bdata-description-zh=["']/iu.test(attrString);
      const hasDescriptionEn = /\bdata-description-en=["']/iu.test(attrString);
      if (hasDescriptionZh !== hasDescriptionEn) {
        const lineNo = sanitized.slice(0, match.index).split('\n').length;
        failures.push(`${relative}:${lineNo} [Parity]: data-description-zh 與 data-description-en 未成對出現在 <${tag}>`);
      }

      if (!isSelfClosing) {
        tagStack.push({ tag, isZh });
        if (isZh) zhDepth++;
      }
    }
  }
}

/**
 * 靜態審查前端 JS 檔案之動態中文硬編碼（遞迴子目錄深層掃描）
 */
function auditJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (['.git', 'node_modules', '.loop-engineering', 'qa', 'dist', 'build', 'reports'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      auditJsFiles(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
      if (entry.name.startsWith('check-') || entry.name.startsWith('build-') || entry.name.startsWith('render-') || entry.name.startsWith('normalize-') || entry.name.startsWith('test-') || entry.name.startsWith('驗證') || entry.name.startsWith('建立')) continue;
      const content = fs.readFileSync(fullPath, 'utf8');

      const noComments = content
        .replace(/\/\*[\s\S]*?\*\//gu, '')
        .replace(/\/\/[^\n]*/gu, '');

      const lines = noComments.split('\n');
      lines.forEach((line, idx) => {
        if (CJK_REGEX.test(line)) {
          const isProtected = /currentLang|language|isZh|isEnglish|zhCopy|zhEl|zhNode|zhText|\bL\(|\bt\(|\bsay\(|\blocalized\(|data-lang=|zh:|data-aria-zh|data-alt-zh|data-title-zh/iu.test(line);
          if (!isProtected && /(?:\.textContent|\.innerHTML|ctx\.fillText|\.placeholder)\s*=\s*['"`][^'"`]*[\u4e00-\u9fff]/u.test(line)) {
            const rel = path.relative(root, fullPath).replaceAll('\\', '/');
            failures.push(`${rel}:${idx + 1} [JS Dynamic]: 包含未經國際化條件保護之中文硬編碼賦值: "${line.trim().slice(0, 60)}"`);
          }
        }
      });
    }
  }
}

// 執行審查
const htmlPages = collectHtmlPages(root);
htmlPages.forEach(auditHtmlFile);
auditJsFiles(root);

if (failures.length > 0) {
  console.error(`❌ 雙語純度檢查失敗，共發現 ${failures.length} 項違規：`);
  failures.slice(0, 30).forEach(f => console.error(`  - ${f}`));
  if (failures.length > 30) {
    console.error(`  ... 還有 ${failures.length - 30} 項未列出`);
  }
  process.exit(1);
} else {
  console.log(`通過：全站 ${checkedFiles.length} 個 HTML 頁面達成英文模式零 CJK 漢字殘留，屬性純度與雙語成對性符合規範。`);
}
