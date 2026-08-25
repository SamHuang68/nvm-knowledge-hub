import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(scriptDir, "..");
const pagePath = path.join(siteDir, "ai-nvm-opportunities.html");
const knowledgePath = path.join(siteDir, "data", "ai-nvm-opportunities-knowledge.json");
const exporterPath = path.join(siteDir, "scripts", "build-ai-nvm-sharepoint.mjs");
const errors = [];

const report = message => errors.push(message);
const exists = filePath => fs.existsSync(filePath);
const read = filePath => fs.readFileSync(filePath, "utf8");
const relative = filePath => path.relative(siteDir, filePath).replaceAll("\\", "/") || ".";

for (const requiredPath of [pagePath, knowledgePath, exporterPath]) {
  if (!exists(requiredPath)) report(`Missing required artifact: ${relative(requiredPath)}`);
}

function parseAttributes(source) {
  const attributes = {};
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attributes;
}

function parseHtml(source) {
  const root = { uid: 0, tag: "#document", attributes: {}, parent: null };
  const nodes = [];
  const stack = [root];
  const voidElements = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  const scrubbed = source
    .replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, "<script$1></script>")
    .replace(/<style\b([^>]*)>[\s\S]*?<\/style>/gi, "<style$1></style>");
  const tokenPattern = /<!--[\s\S]*?-->|<![^>]*>|<\/?[A-Za-z][^>]*>/g;
  let uid = 1;

  for (const match of scrubbed.matchAll(tokenPattern)) {
    const token = match[0];
    if (token.startsWith("<!--") || token.startsWith("<!")) continue;
    const closing = token.match(/^<\/\s*([A-Za-z][\w:-]*)/);
    if (closing) {
      const tag = closing[1].toLowerCase();
      while (stack.length > 1) {
        const candidate = stack.pop();
        if (candidate.tag === tag) break;
      }
      continue;
    }

    const opening = token.match(/^<\s*([A-Za-z][\w:-]*)([\s\S]*?)\/?\s*>$/);
    if (!opening) continue;
    const tag = opening[1].toLowerCase();
    const parent = stack.at(-1);
    const node = { uid: uid++, tag, attributes: parseAttributes(opening[2]), parent };
    nodes.push(node);
    if (!voidElements.has(tag) && !/\/\s*>$/.test(token)) stack.push(node);
  }
  return nodes;
}

function splitLocalReference(rawValue) {
  const value = String(rawValue ?? "").trim();
  if (!value) return { empty: true };
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return { external: true };
  const hashIndex = value.indexOf("#");
  const fragment = hashIndex >= 0 ? value.slice(hashIndex + 1) : "";
  const beforeHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const queryIndex = beforeHash.indexOf("?");
  const pathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
  return { pathname, fragment };
}

function decodePath(value, label) {
  try {
    return decodeURIComponent(value);
  } catch {
    report(`${label}: invalid URL encoding in ${JSON.stringify(value)}`);
    return value;
  }
}

function isInsideSite(filePath) {
  const relation = path.relative(siteDir, filePath);
  return relation === "" || (!relation.startsWith("..") && !path.isAbsolute(relation));
}

const htmlIdCache = new Map();
function idsForHtml(filePath) {
  if (!htmlIdCache.has(filePath)) {
    const ids = new Set();
    if (exists(filePath) && fs.statSync(filePath).isFile()) {
      for (const node of parseHtml(read(filePath))) {
        if (node.attributes.id) ids.add(node.attributes.id);
      }
    }
    htmlIdCache.set(filePath, ids);
  }
  return htmlIdCache.get(filePath);
}

function resolveLocalPath(pathname, baseFile) {
  const decoded = decodePath(pathname, relative(baseFile));
  return decoded.startsWith("/")
    ? path.resolve(siteDir, decoded.replace(/^\/+/, ""))
    : path.resolve(path.dirname(baseFile), decoded || path.basename(baseFile));
}

function checkReference(rawValue, baseFile, label, options = {}) {
  const parsed = splitLocalReference(rawValue);
  if (parsed.external) return null;
  if (parsed.empty) {
    report(`${label}: empty target`);
    return null;
  }
  if (String(rawValue).trim() === "#") {
    report(`${label}: placeholder target \"#\" is not allowed`);
    return null;
  }
  if (options.css && !parsed.pathname && parsed.fragment) return null;

  const targetPath = resolveLocalPath(parsed.pathname, baseFile);
  if (!isInsideSite(targetPath)) {
    report(`${label}: target escapes the site root (${rawValue})`);
    return null;
  }
  if (!exists(targetPath)) {
    report(`${label}: missing local target ${relative(targetPath)} (${rawValue})`);
    return null;
  }
  if (parsed.fragment && /\.html?$/i.test(targetPath)) {
    const targetIds = idsForHtml(targetPath);
    if (!targetIds.has(decodePath(parsed.fragment, label))) {
      report(`${label}: missing fragment #${parsed.fragment} in ${relative(targetPath)}`);
    }
  }
  return targetPath;
}

function srcsetCandidates(value) {
  return String(value ?? "")
    .split(",")
    .map(candidate => candidate.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function cssReferences(source) {
  const values = [];
  const urlPattern = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s][^)]*?))\s*\)/gi;
  for (const match of source.matchAll(urlPattern)) values.push((match[1] ?? match[2] ?? match[3] ?? "").trim());
  const importPattern = /@import\s+["']([^"']+)["']/gi;
  for (const match of source.matchAll(importPattern)) values.push(match[1].trim());
  return values;
}

if (exists(pagePath)) {
  const html = read(pagePath);
  const nodes = parseHtml(html);
  const ids = new Map();
  const cssQueue = [];
  const visitedCss = new Set();

  const cleanHeadingText = value => String(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|#160);/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
  for (const match of html.matchAll(/<(h[123])\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const [, tag, content] = match;
    const localized = [...content.matchAll(/<span\b[^>]*data-lang=["'](zh|en)["'][^>]*>([\s\S]*?)<\/span>/gi)];
    const variants = localized.length
      ? localized.map(item => ({ language: item[1], text: cleanHeadingText(item[2]) }))
      : [{ language: "shared", text: cleanHeadingText(content) }];
    for (const variant of variants) {
      if (/[。．.!！?？;；…]\s*$/.test(variant.text)) {
        report(`<${tag}> ${variant.language} title ends with sentence punctuation: ${JSON.stringify(variant.text)}`);
      }
    }
  }

  for (const match of html.matchAll(/<strong\b[^>]*>([\s\S]*?)<\/strong>/gi)) {
    const content = match[1];
    const localized = [...content.matchAll(/<span\b[^>]*data-lang=["'](zh|en)["'][^>]*>([\s\S]*?)<\/span>/gi)];
    const variants = localized.length
      ? localized.map(item => ({ language: item[1], text: cleanHeadingText(item[2]) }))
      : [{ language: "shared", text: cleanHeadingText(content) }];
    for (const variant of variants) {
      if (/[。．.!！?？;；…]\s*$/.test(variant.text)) {
        report(`<strong> ${variant.language} callout ends with sentence punctuation: ${JSON.stringify(variant.text)}`);
      }
    }
  }

  if (!/href=["']#photonics["']/.test(html)) report("Primary navigation is missing the #photonics chapter link");
  if (/Persistent-state ownership planes|持久狀態權責平面/.test(read(path.join(siteDir, "ai-nvm.js")))) {
    report("ai-nvm.js uses ownership wording where the diagram is a state-contract view");
  }
  if (!html.includes("ai-photonics-state-contract-v1-1600.webp")) {
    report("Photonics section is missing the governed commercial artwork");
  }

  for (const node of nodes) {
    const id = node.attributes.id;
    if (id) {
      if (ids.has(id)) report(`Duplicate id \"${id}\" on <${ids.get(id)}> and <${node.tag}>`);
      else ids.set(id, node.tag);
    }

    for (const attribute of ["href", "src"]) {
      if (!(attribute in node.attributes)) continue;
      const value = node.attributes[attribute];
      const target = checkReference(value, pagePath, `<${node.tag}> ${attribute}`);
      if (node.tag === "link" && attribute === "href" && /(?:^|\s)stylesheet(?:\s|$)/i.test(node.attributes.rel ?? "") && target) {
        cssQueue.push(target);
      }
    }
    if ("srcset" in node.attributes) {
      for (const candidate of srcsetCandidates(node.attributes.srcset)) {
        checkReference(candidate, pagePath, `<${node.tag}> srcset`);
      }
    }
    if (node.attributes.style) {
      for (const reference of cssReferences(node.attributes.style)) {
        checkReference(reference, pagePath, `<${node.tag}> style url()`, { css: true });
      }
    }
  }

  for (const styleMatch of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const reference of cssReferences(styleMatch[1])) {
      checkReference(reference, pagePath, "inline <style> url()", { css: true });
    }
  }

  while (cssQueue.length) {
    const cssPath = cssQueue.shift();
    if (visitedCss.has(cssPath) || !exists(cssPath) || !fs.statSync(cssPath).isFile()) continue;
    visitedCss.add(cssPath);
    const css = read(cssPath);
    for (const reference of cssReferences(css)) {
      const target = checkReference(reference, cssPath, `${relative(cssPath)} url()`, { css: true });
      if (target && /\.css$/i.test(target)) cssQueue.push(target);
    }
  }

  const languageGroups = new Map();
  for (const node of nodes) {
    if (!("data-lang" in node.attributes)) continue;
    const language = node.attributes["data-lang"];
    if (language !== "zh" && language !== "en") {
      report(`<${node.tag}> has unsupported data-lang=${JSON.stringify(language)}`);
      continue;
    }
    const key = `${node.parent?.uid ?? 0}:${node.tag}`;
    const counts = languageGroups.get(key) ?? { tag: node.tag, zh: 0, en: 0 };
    counts[language] += 1;
    languageGroups.set(key, counts);
  }
  for (const counts of languageGroups.values()) {
    if (counts.zh !== counts.en) {
      report(`Unpaired bilingual siblings for <${counts.tag}>: zh=${counts.zh}, en=${counts.en}`);
    }
  }

  if (exists(knowledgePath)) {
    let knowledge;
    try {
      knowledge = JSON.parse(read(knowledgePath));
    } catch (error) {
      report(`${relative(knowledgePath)}: invalid JSON (${error.message})`);
    }
    if (knowledge) {
      const records = Array.isArray(knowledge.records) ? knowledge.records : null;
      if (!records) {
        report(`${relative(knowledgePath)}: expected a records array`);
      } else {
        const recordIds = new Set();
        for (const [index, record] of records.entries()) {
          const recordId = record?.recordId ?? record?.RecordID;
          if (!recordId) {
            report(`${relative(knowledgePath)}: record ${index + 1} has no recordId`);
            continue;
          }
          if (recordIds.has(recordId)) report(`${relative(knowledgePath)}: duplicate recordId ${recordId}`);
          recordIds.add(recordId);

          const source = record.source ?? {};
          const sourceUrl = record.sourceUrl ?? record.SourceURL ?? source.url ?? "";
          const sourceDocumentKey = record.sourceDocumentKey ?? record.SourceDocumentKey ?? source.documentKey ?? "";
          const sourceType = record.sourceType ?? record.sourceFormat ?? record.sourceDocumentType ?? source.type ?? source.format ?? "";
          const pdfSignal = `${sourceUrl} ${sourceDocumentKey} ${sourceType}`;
          const isPdfClaim = /\.pdf(?:$|[?#])/i.test(String(sourceUrl)) || /(?:^|[\s_-])pdf(?:$|[\s_-])/i.test(pdfSignal);
          const sourceLocator = record.sourceLocator ?? record.SourceLocator ?? source.locator;
          const missingSourceLocator = sourceLocator === undefined || sourceLocator === null || String(sourceLocator).trim() === "";
          if (missingSourceLocator) {
            report(`${recordId}: claim is missing SourceLocator${isPdfClaim ? " (PDF-derived)" : ""}`);
          }
        }

        const referencedIds = new Set();
        for (const node of nodes) {
          for (const attribute of ["data-record-id", "data-record-ids"]) {
            const value = node.attributes[attribute];
            if (!value) continue;
            for (const recordId of value.split(/[\s,;]+/).filter(Boolean)) referencedIds.add(recordId);
          }
        }
        if (referencedIds.size === 0) report("ai-nvm-opportunities.html has no data-record-id or data-record-ids references");
        for (const recordId of referencedIds) {
          if (!recordIds.has(recordId)) report(`HTML references unknown AI recordId ${recordId}`);
        }
      }
    }
  }
}

if (exists(exporterPath)) {
  const exportCheck = spawnSync(process.execPath, [exporterPath, "--check"], {
    cwd: siteDir,
    encoding: "utf8",
    windowsHide: true
  });
  if (exportCheck.error) {
    report(`Could not run build-ai-nvm-sharepoint.mjs --check: ${exportCheck.error.message}`);
  } else if (exportCheck.status !== 0) {
    const detail = `${exportCheck.stdout ?? ""}\n${exportCheck.stderr ?? ""}`.trim();
    report(`AI SharePoint CSV check failed${detail ? `: ${detail}` : ""}`);
  }
}

if (errors.length) {
  console.error(`FAIL: AI NVM integrity check found ${errors.length} issue${errors.length === 1 ? "" : "s"}.`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("PASS: AI NVM page links/assets/CSS, IDs, bilingual pairs, governed record references, PDF locators and SharePoint CSV are consistent.");
}
