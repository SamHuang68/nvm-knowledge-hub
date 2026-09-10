import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicBase = new URL("https://samhuang68.github.io/nvm-knowledge-hub/");
const excludedDirectories = new Set([".git", ".loop-engineering", "qa", "node_modules", "attachments", "附件"]);
const publicDirectories = ["briefing", "whitepaper", "tools/whitepaper-studio"];
const brandClasses = new Set(["brand", "hub-micro-logo", "studio-brand"]);

function decodeEntities(value) {
  const named = { amp: "&", AMP: "&", quot: '"', QUOT: '"', apos: "'", lt: "<", LT: "<", gt: ">", GT: ">", nbsp: "\u00a0", colon: ":", sol: "/", num: "#", quest: "?", equals: "=", percnt: "%" };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/giu, (entity, code) => {
    if (!code.startsWith("#")) return named[code] ?? entity;
    const value = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return value > 0 && value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff) ? String.fromCodePoint(value) : "\ufffd";
  });
}

export function parseHtml(source) {
  const nodes = [];
  const stack = [];
  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  const tokens = /<!--[\s\S]*?-->|<(script|style)\b(?:[^>"']|"[^"]*"|'[^']*')*>[\s\S]*?<\/\1\s*>|<\/?[a-z][\w:-]*(?:[^>"']|"[^"]*"|'[^']*')*>/giu;
  for (const match of source.matchAll(tokens)) {
    if (match[0].startsWith("<!--")) continue;
    if (match[0].startsWith("</")) {
      const tag = match[0].match(/^<\/([\w:-]+)/u)[1].toLowerCase();
      const index = stack.findLastIndex(node => node.tag === tag);
      if (index >= 0) stack.length = index;
      continue;
    }
    const opening = match[0].match(/^<([\w:-]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/u);
    if (!opening) continue;
    const tag = opening[1].toLowerCase();
    const attributes = Object.create(null);
    for (const attribute of opening[2].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gu)) {
      const name = attribute[1].toLowerCase();
      if (!(name in attributes)) attributes[name] = decodeEntities(attribute[2] ?? attribute[3] ?? attribute[4] ?? "");
    }
    const node = { tag, attributes, parent: stack.at(-1) ?? null, offset: match.index };
    nodes.push(node);
    if (!voidTags.has(tag) && !match[1] && !/\/\s*>$/u.test(opening[0])) stack.push(node);
  }
  return { nodes, ids: new Set(nodes.flatMap(node => [node.attributes.id, node.tag === "a" ? node.attributes.name : undefined]).filter(Boolean)) };
}

export function resolveReference(value, page, baseHref) {
  const pageUrl = new URL(page.split("/").map(encodeURIComponent).join("/"), publicBase);
  const base = baseHref === undefined ? pageUrl : new URL(baseHref, pageUrl);
  const url = new URL(value, base);
  if (!["http:", "https:"].includes(url.protocol)) return { external: true };
  const explicitUrl = /^(?:[a-z][a-z\d+.-]*:|\/\/)/iu.test(value.trim());
  const pathname = url.origin === publicBase.origin ? decodeURIComponent(url.pathname) : url.pathname;
  const projectDirectory = pathname === publicBase.pathname.slice(0, -1);
  if (url.origin !== publicBase.origin || (!projectDirectory && !pathname.startsWith(publicBase.pathname))) {
    if (!explicitUrl && base.origin === publicBase.origin) throw new Error("相對連結離開網站根目錄");
    return { external: true };
  }
  const decodedPath = projectDirectory ? "" : pathname.slice(publicBase.pathname.length);
  if (decodedPath.includes("\0") || decodedPath.includes("\\")) throw new Error("URL 含不支援的路徑字元");
  const target = path.posix.normalize(decodedPath || "index.html");
  if (target === ".." || target.startsWith("../") || path.posix.isAbsolute(target)) throw new Error("URL 編碼後離開網站根目錄");
  const fragment = decodeURIComponent(url.hash.slice(1).split(":~:")[0]);
  return { target: target.endsWith("/") ? `${target}index.html` : target, fragment, search: url.search };
}

export function collectPages(siteRoot) {
  const pages = fs.readdirSync(siteRoot, { withFileTypes: true }).filter(entry => entry.isFile() && /\.html?$/iu.test(entry.name)).map(entry => entry.name);
  const walk = relative => {
    const directory = path.join(siteRoot, relative);
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (excludedDirectories.has(entry.name)) continue;
      const next = `${relative}/${entry.name}`;
      if (entry.isDirectory()) walk(next);
      else if (entry.isFile() && /\.html?$/iu.test(entry.name)) pages.push(next);
    }
  };
  publicDirectories.forEach(walk);
  return pages.sort();
}

export async function inspectSite(siteRoot = root) {
  const pages = collectPages(siteRoot);
  const documents = new Map(pages.map(page => [page, parseHtml(fs.readFileSync(path.join(siteRoot, page), "utf8"))]));
  const failures = new Set();
  const pending = [];
  const queued = new Set();
  let references = 0;
  let renderedRoutes = 0;
  const fail = message => failures.add(message);

  function localReference(value, page, baseHref) {
    try {
      const reference = resolveReference(value, page, baseHref);
      if (reference.external) return reference;
      let absolute = path.resolve(siteRoot, reference.target);
      const relative = path.relative(siteRoot, absolute);
      if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error("目標離開網站根目錄");
      if (fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()) {
        reference.target = `${reference.target.replace(/\/$/u, "")}/index.html`;
        absolute = path.join(absolute, "index.html");
      }
      if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) throw new Error(`本機目標不存在：${reference.target}`);
      if (/\.html?$/iu.test(reference.target) && !documents.has(reference.target)) throw new Error(`HTML 目標不在公開頁面清單或大小寫不符：${reference.target}`);
      return reference;
    } catch (error) {
      fail(`${page}：${value} → ${error.message}`);
      return null;
    }
  }

  function inspectDocument(page, document, runtime = false) {
    const baseHref = document.nodes.find(node => node.tag === "base" && "href" in node.attributes)?.attributes.href;
    for (const node of document.nodes) {
      for (const attribute of ["href", "data-language-en", "data-language-zh"]) {
        if (!(attribute in node.attributes) || (node.tag === "base" && attribute === "href")) continue;
        const value = node.attributes[attribute];
        const reference = localReference(value, page, baseHref);
        references += 1;
        if (!reference || reference.external || !reference.fragment || !/\.html?$/iu.test(reference.target)) continue;
        const targetDocument = reference.target === page ? document : documents.get(reference.target);
        if (targetDocument.ids.has(reference.fragment) || reference.fragment.toLowerCase() === "top") continue;
        const key = `${reference.target}${reference.search}#${reference.fragment}`;
        if (!queued.has(key)) {
          queued.add(key);
          pending.push({ ...reference, key, from: page, value });
        }
      }
    }
    if (runtime) return;
    const brands = document.nodes.filter(node => node.tag === "a" && (node.attributes.class ?? "").split(/\s+/u).some(token => brandClasses.has(token)));
    if (!brands.length) fail(`${page}：缺少可返回知識中心的主要品牌連結`);
    for (const brand of brands) {
      const reference = "href" in brand.attributes ? localReference(brand.attributes.href, page, baseHref) : null;
      if (!reference || reference.external || reference.target !== "index.html" || reference.fragment) fail(`${page}：主要品牌連結必須解析至根目錄 index.html`);
    }
  }

  for (const [page, document] of documents) inspectDocument(page, document);
  const home = documents.get("index.html");
  const catalog = JSON.parse(fs.readFileSync(path.join(root,"data/NVM知識目錄.json"),"utf8"));
  const layers = Object.fromEntries(catalog.sections.map(section=>[`layer-${section.id}`,section.items.map(item=>item.url)]));
  if (!home) fail("index.html：缺少知識中心首頁");
  else {
    const baseHref = home.nodes.find(node => node.tag === "base" && "href" in node.attributes)?.attributes.href;
    const links = home.nodes.filter(node => node.tag === "a" && "href" in node.attributes).map(node => ({ node, reference: localReference(node.attributes.href, "index.html", baseHref) }));
    for (const [layer, targets] of Object.entries(layers)) {
      if (!home.ids.has(layer)) fail(`index.html：缺少現行導覽層 #${layer}`);
      if (!links.some(({ reference }) => reference?.target === "index.html" && reference.fragment === layer)) fail(`index.html：缺少前往 #${layer} 的導覽連結`);
      for (const target of targets) {
        const expected = localReference(target,"index.html",baseHref);
        const found = links.some(({ node, reference }) => {
          if (reference?.target !== expected?.target || reference?.fragment !== expected?.fragment) return false;
          for (let parent = node.parent; parent; parent = parent.parent) if (parent.attributes.id === layer) return true;
          return false;
        });
        if (!found) fail(`index.html：#${layer} 缺少入口 ${target}`);
      }
    }
    for(const alias of catalog.legacyAnchors||[]){
      const item=catalog.sections.flatMap(section=>section.items).find(item=>item.id===alias.targetItem);
      const anchor=home.nodes.find(node=>node.attributes.id===alias.id);
      if(!item||anchor?.attributes.href!==item.url)fail(`index.html：舊入口 #${alias.id} 未保留正確內容`);
    }
  }
  for (const page of ["NVM技術全景.html", "NVM技術全景中文.html", ...publicDirectories.map(directory => `${directory}/index.html`)]) {
    if (!documents.has(page)) fail(`缺少必要公開頁面：${page}`);
  }

  // 靜態 HTML 沒有的錨點，必須由真正執行的頁面 DOM 證明；不可用來源字串或例外清單放行。
  if (pending.length) {
    const { createServer } = await import("node:http");
    const { chromium } = await import("playwright");
    const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".webp": "image/webp" };
    const server = createServer((request, response) => {
      try {
        const reference = resolveReference(new URL(request.url, publicBase.origin).href, "index.html");
        if (reference.external) throw new Error("非本機公開路由");
        let target = path.resolve(siteRoot, reference.target);
        const relative = path.relative(siteRoot, target);
        if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error("路由離開網站根目錄");
        if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
        if (!fs.existsSync(target) || !fs.statSync(target).isFile()) throw new Error("路由不存在");
        response.writeHead(200, { "content-type": types[path.extname(target)] ?? "application/octet-stream", "cache-control": "no-store" });
        response.end(fs.readFileSync(target));
      } catch {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("找不到本機公開路由");
      }
    });
    let browser;
    try {
      await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
      const origin = `http://127.0.0.1:${server.address().port}`;
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({ serviceWorkers: "block" });
      await context.route("**/*", route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
      for (const reference of pending) {
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        try {
          const url = `${origin}${publicBase.pathname}${reference.target.split("/").map(encodeURIComponent).join("/")}${reference.search}#${encodeURIComponent(reference.fragment)}`;
          const response = await page.goto(url, { waitUntil: "networkidle", timeout: 15000 });
          if (!response?.ok()) throw new Error(`HTTP ${response?.status() ?? "無回應"}`);
          const rendered = parseHtml(await page.content());
          renderedRoutes += 1;
          if (!rendered.ids.has(reference.fragment)) fail(`${reference.from}：${reference.value} → ${reference.target} 缺少錨點 #${reference.fragment}（執行後 DOM 亦不存在）`);
          if (errors.length) fail(`${reference.target}：錨點驗證時發生頁面錯誤：${errors.join("；")}`);
          inspectDocument(reference.target, rendered, true);
        } catch (error) {
          fail(`${reference.from}：${reference.value} → 動態錨點驗證未完成：${error.message}`);
        } finally {
          await page.close();
        }
      }
    } catch (error) {
      fail(`無法驗證 ${pending.length} 個靜態 HTML 未包含的錨點：${error.message}`);
    } finally {
      await browser?.close();
      await new Promise(resolve => server.close(resolve));
    }
  }
  return { pages, references, renderedRoutes, failures: [...failures] };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await inspectSite();
  if (result.failures.length) {
    console.error(result.failures.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`通過：${result.pages.length} 個公開頁面、${result.references} 個參照及 ${result.renderedRoutes} 個動態錨點路由；本機路徑、錨點、中英頁面、品牌首頁連結與四類主題導覽均有效。`);
  }
}
