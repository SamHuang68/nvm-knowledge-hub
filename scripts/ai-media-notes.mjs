// 頁面層級的 AI 媒體說明：頁面背景或分享預覽用了 AI 生成圖、圖旁卻沒有圖說時，在頁尾寫明工具與日期。
// 文字由 data/media-manifest.json 產生，不手抄；頁面與圖的對應依 2026-11-03 逐頁量測（實際套用的 CSS 背景與 og:image）。
// 手寫頁由 scripts/build-ai-media-notes.mjs 寫入標記區段；atlas、首頁與白皮書由各自的產生器直接引用。
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/media-manifest.json'), 'utf8'));
const entries = new Map(manifest.assets.map(asset => [path.basename(asset.path), asset]));

export const AI_MEDIA_NOTE_PAGES = {
  'index.html': {background: ['luminous-wafer-bg.jpg'], share: ['silicon-ip-panorama-v2.webp']},
  'iot-mcu-envm.html': {background: ['iot-mcu-hero.jpg', 'closing-secure-boundary-v1.webp'], share: ['iot-mcu-hero.jpg']},
  'secure-storage.html': {background: ['secure-storage-hero-key.webp'], share: ['secure-storage-hero-v2.webp']},
  'nvm-technology-atlas.html': {share: ['nvm-state-atlas-hero-r17.webp']},
  'nvm-technology-atlas-zh.html': {share: ['nvm-state-atlas-hero-r17.webp']},
  'briefing/index.html': {share: ['specialty-foundry-v1.webp']},
  'memory-evidence.html': {share: ['evidence-field-v1.webp']},
  'oip-secure-storage.html': {share: ['oip-secure-storage-cover-v1-1440.webp']},
  'security-assurance.html': {share: ['assurance-evidence-v1.webp']},
  'specialty-nvm.html': {share: ['specialty-foundry-v1.webp']},
  'sram-repair.html': {share: ['silicon-ip-panorama-v2.webp']},
  'whitepaper/index.html': {share: ['nvm-state-atlas-hero-r17.webp']},
};

const esc = value => String(value).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

export function aiMediaNoteText(page, language) {
  const usage = AI_MEDIA_NOTE_PAGES[page];
  if (!usage) return '';
  const names = [...new Set([...(usage.background || []), ...(usage.share || [])])];
  for (const name of names) if (entries.get(name)?.kind !== 'ai-generated') throw new Error(`${page}: ${name} 不是媒體清單中的 AI 生成圖`);
  const credits = [...new Set(names.map(name => `${entries.get(name).tool}${language === 'zh' ? '・' : ', '}${entries.get(name).generatedAt}`))];
  const background = Boolean(usage.background?.length), share = Boolean(usage.share?.length);
  if (language === 'zh') {
    const what = background && share ? '本頁背景圖與分享預覽圖' : background ? '本頁背景圖' : '本頁分享預覽圖';
    return `${what}為 AI 生成示意圖（${credits.join('；')}），不是照片或量測。`;
  }
  const what = background && share ? "This page's background and share-preview images are" : background ? "This page's background image is" : "This page's share-preview image is";
  return `${what} AI-generated (${credits.join('; ')}); not a photograph or measurement.`;
}

// language 為 'zh' 或 'en' 時輸出單一語言（atlas）；'both' 輸出兩個 data-lang 片段，由頁面的語言切換顯示其一。
export function aiMediaNote(page, language = 'both') {
  if (!AI_MEDIA_NOTE_PAGES[page]) return '';
  const body = language === 'both'
    ? `<span data-lang="zh">${esc(aiMediaNoteText(page, 'zh'))}</span><span data-lang="en">${esc(aiMediaNoteText(page, 'en'))}</span>`
    : esc(aiMediaNoteText(page, language));
  return `<p class="ai-media-note" data-ai-media-note style="margin:12px 0 0;font-size:13px;line-height:1.6;color:#4b5f6b">${body}</p>`;
}
