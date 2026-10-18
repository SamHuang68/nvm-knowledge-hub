import fs from 'fs';

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

let hasFailures = false;
let totalChecked = 0;

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = [...content.matchAll(/id="([a-zA-Z0-9\-_]+simulator-root)"/g)];
  if (matches.length > 0) {
    matches.forEach(m => {
      totalChecked++;
      const id = m[1];
      const idx = m.index;
      // Search inside the enclosing section or container
      const slice = content.slice(Math.max(0, idx - 2000), Math.min(content.length, idx + 4500));
      const has = /⚠️|示意模擬模型|邊界說明|Disclaimer|Schematic Model|Illustrative Model/i.test(slice);
      if (!has) {
        hasFailures = true;
      }
      console.log(`${file.padEnd(28)} | ${id.padEnd(38)} | ${has ? 'HAS_BANNER' : 'MISSING_BANNER'}`);
    });
  }
});

if (hasFailures) {
  console.error(`FAIL: One or more simulators are missing technical boundary disclaimers.`);
  process.exit(1);
} else {
  console.log(`PASS: All ${totalChecked} interactive simulators have valid technical boundary disclaimers.`);
  process.exit(0);
}

