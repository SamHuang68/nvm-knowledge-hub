import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const files = fs.readdirSync(root).filter(f => f.endsWith('.html') && !f.includes('404'));

let issues = 0;
for (const file of files) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  
  // 1. Check img tags for alt
  const imgRegex = /<img\b([^>]*)>/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    if (!/alt=["']/i.test(match[1])) {
      console.log(`[ALT MISSING] ${file}: ${match[0].slice(0, 100)}`);
      issues++;
    }
  }

  // 2. Check canvas tags for role and aria-label
  const canvasRegex = /<canvas\b([^>]*)>/gi;
  while ((match = canvasRegex.exec(content)) !== null) {
    const attrs = match[1];
    if (!/role=["']img["']/i.test(attrs) || !/aria-label=["']/i.test(attrs)) {
      console.log(`[CANVAS A11Y INCOMPLETE] ${file}: ${match[0].slice(0, 100)}`);
      issues++;
    }
  }

  // 3. Check select tags for aria-label or accessible name
  const selectRegex = /<select\b([^>]*)>/gi;
  while ((match = selectRegex.exec(content)) !== null) {
    const attrs = match[1];
    if (!/aria-label=["']/i.test(attrs) && !/aria-labelledby=["']/i.test(attrs) && !/id=["'](targetSelect|marketSelect|goalSelect)/i.test(attrs)) {
      console.log(`[SELECT A11Y INCOMPLETE] ${file}: ${match[0].slice(0, 100)}`);
      issues++;
    }
  }

  // 4. Check button tags with no text inside to ensure aria-label
  const buttonRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  while ((match = buttonRegex.exec(content)) !== null) {
    const attrs = match[1];
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    if (!text && !/aria-label=["']/i.test(attrs)) {
      console.log(`[BUTTON EMPTY NO ARIA-LABEL] ${file}: ${match[0].slice(0, 100)}`);
      issues++;
    }
  }
}

if (issues === 0) {
  console.log(`PASS: All HTML files passed deep a11y static checks (imgs, canvases, selects, buttons).`);
} else {
  console.log(`FAIL: Found ${issues} deep a11y issues.`);
  process.exit(1);
}
