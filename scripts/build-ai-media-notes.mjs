// 把 AI 媒體說明寫進手寫頁頁尾的標記區段；--check 只比對、不寫入，供 CI 確認頁面與媒體清單同步。
// 標記：<!-- ai-media-note:start --> … <!-- ai-media-note:end -->；atlas、首頁與白皮書由各自的產生器輸出，不在這裡處理。
import fs from 'node:fs';
import path from 'node:path';
import {AI_MEDIA_NOTE_PAGES, aiMediaNote} from './ai-media-notes.mjs';

const root = path.resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const GENERATED = new Set(['index.html', 'nvm-technology-atlas.html', 'nvm-technology-atlas-zh.html', 'whitepaper/index.html']);
const start = '<!-- ai-media-note:start -->', end = '<!-- ai-media-note:end -->';
let stale = 0;
const pages = Object.keys(AI_MEDIA_NOTE_PAGES).filter(page => !GENERATED.has(page));
for (const page of pages) {
  const file = path.join(root, page);
  const text = fs.readFileSync(file, 'utf8');
  const from = text.indexOf(start), to = text.indexOf(end);
  if (from < 0 || to < from) throw new Error(`${page} 缺少 AI 媒體說明的標記區段`);
  const next = text.slice(0, from + start.length) + aiMediaNote(page) + text.slice(to);
  if (next === text) continue;
  stale++;
  if (check) console.error(`${page}：AI 媒體說明與媒體清單不同步，請執行 node scripts/build-ai-media-notes.mjs`);
  else fs.writeFileSync(file, next);
}
if (check && stale) process.exit(1);
console.log(check ? `通過：${pages.length} 頁的 AI 媒體說明與媒體清單同步` : `已更新 ${stale} 頁的 AI 媒體說明`);
