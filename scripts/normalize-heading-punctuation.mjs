import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const files = fs.readdirSync(root).filter(file => file.endsWith(".html"));
const changed = [];

for (const file of files) {
  const target = path.join(root, file);
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
