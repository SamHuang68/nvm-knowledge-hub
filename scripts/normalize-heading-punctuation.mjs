import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const walk = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  if ([".git", "node_modules", "qa", ".loop-engineering"].includes(entry.name)) return [];
  const target = path.join(directory, entry.name);
  return entry.isDirectory() ? walk(target) : (entry.name.endsWith(".html") ? [target] : []);
});
const files = walk(root);
const changed = [];

for (const target of files) {
  const file = path.relative(root, target).replaceAll("\\", "/");
  const source = fs.readFileSync(target, "utf8");
  const output = source.replace(/<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/giu, heading =>
    heading.replace(/[。.!?！？](?=(?:[”’"'）)}\]】》]+)?\s*(?:<br\b[^>]*>|<\/(?:span|em|h[1-6])>))/giu, "")
  );
  if (output !== source) {
    changed.push(file);
    if (!checkOnly) fs.writeFileSync(target, output, "utf8");
  }
}

if (checkOnly && changed.length) {
  console.error(`Heading punctuation normalization required: ${changed.join(", ")}`);
  process.exit(1);
}
console.log(`${checkOnly ? "PASS" : "NORMALIZED"}: heading labels in ${files.length} HTML files${changed.length ? `; changed ${changed.join(", ")}` : ""}.`);
