import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const pages = fs.readdirSync(root).filter(file => file.endsWith(".html"));
const failures = [];
const idsByPage = new Map();

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  idsByPage.set(page, new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1])));
}

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  for (const match of html.matchAll(/\bhref=["']([^"']+)["']/g)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|javascript:)/i.test(href)) continue;
    const [rawTarget, fragment] = href.split("#");
    const target = rawTarget || page;
    if (!target.endsWith(".html")) continue;
    if (!idsByPage.has(target)) {
      failures.push(`${page}: missing local target ${href}`);
      continue;
    }
    if (fragment && !idsByPage.get(target).has(fragment)) failures.push(`${page}: missing fragment ${href}`);
  }
  const brand = html.match(/<a\s+class=["'][^"']*\bbrand\b[^"']*["']\s+href=["']([^"']+)["']/);
  if (!brand || brand[1] !== "index.html") failures.push(`${page}: primary brand must resolve to index.html`);
}

const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const required of ["secure-storage.html", "ai-nvm-opportunities.html", "#spine", "#topics", "#sharepoint"]) {
  if (!home.includes(`href="${required}"`) && !home.includes(`id="${required.slice(1)}"`)) failures.push(`index.html: missing Hub route ${required}`);
}

const secure = fs.readFileSync(path.join(root, "secure-storage.html"), "utf8");
if (!secure.includes('class="brand" href="index.html"')) failures.push("secure-storage.html: brand does not return to Hub");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`PASS: ${pages.length} pages; all local routes/fragments resolve, every primary brand returns to the Hub, and both L1 topics are one click from L0.`);

