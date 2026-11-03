// 把等角爆炸圖寫進手寫頁的標記區段；--check 只比對、不寫入，供 CI 確認頁面與產生器同步。
// 標記：<!-- isometric:<id>:start --> … <!-- isometric:<id>:end -->
import fs from 'node:fs';
import path from 'node:path';
import {isometricBilingualFigure} from './nvm-isometric-diagrams.mjs';

const root = path.resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const PLACEMENTS = [{page: 'technology-comparison.html', id: 'hybrid-bonding'}];
let stale = 0;
for (const {page, id} of PLACEMENTS) {
  const file = path.join(root, page);
  const text = fs.readFileSync(file, 'utf8');
  const start = `<!-- isometric:${id}:start -->`, end = `<!-- isometric:${id}:end -->`;
  const from = text.indexOf(start), to = text.indexOf(end);
  if (from < 0 || to < from) throw new Error(`${page} 缺少 ${id} 的標記區段`);
  const next = text.slice(0, from + start.length) + isometricBilingualFigure(id) + text.slice(to);
  if (next === text) continue;
  stale++;
  if (check) console.error(`${page}：${id} 區段與產生器不同步，請執行 node scripts/build-isometric-sections.mjs`);
  else fs.writeFileSync(file, next);
}
if (check && stale) process.exit(1);
console.log(check ? `通過：${PLACEMENTS.length} 個等角圖區段與產生器同步` : `已更新 ${stale} 個等角圖區段`);
