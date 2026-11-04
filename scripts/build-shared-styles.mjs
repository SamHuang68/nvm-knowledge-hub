// 手寫頁面的共用樣式靜態區塊（規則見 scripts/hub-shared-styles.mjs）；首頁、atlas 與白皮書由各自產生器套用。
// --check 只比對，不寫入。
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {applySharedStyles, SHARED_STYLE_EXCLUDED} from './hub-shared-styles.mjs';

const root = path.resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const GENERATED = new Set(['index.html', 'nvm-technology-atlas.html', 'nvm-technology-atlas-zh.html', 'whitepaper/index.html']);
const pages = execFileSync('git', ['-c', 'core.quotepath=false', 'ls-files', '*.html'], {cwd: root, encoding: 'utf8'}).trim().split('\n')
  .filter(page => !GENERATED.has(page) && !SHARED_STYLE_EXCLUDED.has(page))
  .filter(page => /<script src="(?:\.\.\/)*site-language\.js\?v=/.test(fs.readFileSync(path.join(root, page), 'utf8')));
const stale = [];
for (const page of pages) {
  const file = path.join(root, page), html = fs.readFileSync(file, 'utf8'), next = applySharedStyles(html, page);
  if (next === html) continue;
  if (check) stale.push(page);
  else fs.writeFileSync(file, next);
}
if (stale.length) throw new Error('共用樣式區塊未同步：' + stale.join('、'));
console.log(`通過：${pages.length} 個手寫頁面的共用樣式區塊${check ? '已同步' : '已寫入'}`);
