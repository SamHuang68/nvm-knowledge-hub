// AVIF 與裁切變體（提案 5.5）：從 repo 外的母帶產生，頁面以 AVIF 為優先、原 WebP／JPG 保留為備援，並登記到 data/media-manifest.json。
// - 同尺寸變體：像素尺寸與同組 WebP 相同，換來源不改變版面。
// - 裁切變體：對齊目前 object-fit: cover 實際顯示的區域。寬 = 比例 × 母帶高，左緣 = object-position × (母帶寬 − 裁切寬)，
//   頁面只在顯示框比例不大於裁切比例的寬度使用，可見區域不變、解析度較高。
// - 背景變體：上方蓋著 96% 白色漸層，只透出約 4%，改用 960 寬的低解析 AVIF。
// 母帶不進 repo，這支腳本不在 CI 執行；成品位元組由清單的 SHA-256 固定。
// node scripts/build-image-variants.mjs <內含 media-masters/ 的資料夾>（或 NVM_MEDIA_DATA）
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

if (!process.argv[2] && !process.env.NVM_MEDIA_DATA) throw new Error('請指定內含 media-masters/ 的資料夾（參數或 NVM_MEDIA_DATA），例如 …\\data\\nvm-hub');
const data = path.resolve(process.argv[2] || process.env.NVM_MEDIA_DATA);
const root = path.resolve(import.meta.dirname, '..');
const manifestPath = path.join(root, 'data', 'media-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const VARIANTS = [
  {out: 'ai-nvm-system-boundaries-hero-1600.avif', from: 'ai-nvm-system-boundaries-hero-1600.webp'},
  {out: 'ai-nvm-system-boundaries-hero-mobile-4x5.avif', from: 'ai-nvm-system-boundaries-hero-1600.webp', crop: {label: '4:5', ratio: 4 / 5, x: 0.7, maxWidth: 760}},
  {out: 'ai-persistent-state-fabric-v1-1800.avif', from: 'ai-persistent-state-fabric-v1-1800.webp'},
  {out: 'ai-persistent-state-fabric-v1-900.avif', from: 'ai-persistent-state-fabric-v1-900.webp'},
  {out: 'ai-photonics-state-contract-v1-1600.avif', from: 'ai-photonics-state-contract-v1-1600.webp'},
  {out: 'ai-photonics-state-contract-v1-800.avif', from: 'ai-photonics-state-contract-v1-800.webp'},
  {out: 'automotive-nvm-hero-1600.avif', from: 'automotive-nvm-hero-1600.webp'},
  {out: 'automotive-nvm-hero-900.avif', from: 'automotive-nvm-hero-900.webp'},
  {out: 'automotive-nvm-hero-mobile-1x1.avif', from: 'automotive-nvm-hero-1600.webp', crop: {label: '1:1', ratio: 1, x: 0.5, maxWidth: 400}},
  {out: 'memory-physics-hero-1600.avif', from: 'memory-physics-hero-1600.webp'},
  {out: 'memory-physics-hero-900.avif', from: 'memory-physics-hero-900.webp'},
  {out: 'memory-physics-hero-mobile-1x1.avif', from: 'memory-physics-hero-1600.webp', crop: {label: '1:1', ratio: 1, x: 0.72, maxWidth: 600}},
  {out: 'luminous-wafer-bg.avif', from: 'luminous-wafer-bg.jpg', background: 960},
  {out: 'iot-mcu-hero-bg.avif', from: 'iot-mcu-hero.jpg', background: 960},
  {out: 'secure-storage-hero-key-bg.avif', from: 'secure-storage-hero-key.webp', background: 960},
];
const CRF = {page: 30, background: 40};

const probe = file => execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file], {encoding: 'utf8'}).trim().split(',').map(Number);
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const byPath = new Map(manifest.assets.map(asset => [asset.path, asset]));

for (const variant of VARIANTS) {
  const sibling = byPath.get(`assets/${variant.from}`);
  if (!sibling?.master) throw new Error(`${variant.from} 在清單中沒有母帶`);
  const master = path.join(data, sibling.master);
  const [width, height] = probe(master);
  const [siblingWidth, siblingHeight] = probe(path.join(root, sibling.path));
  let filter, crop = null, crf = CRF.page;
  if (variant.crop) {
    const w = Math.round(variant.crop.ratio * height), x = Math.round(variant.crop.x * (width - w));
    crop = {ratio: variant.crop.label, objectPositionX: variant.crop.x, maxViewportWidth: variant.crop.maxWidth, masterSize: [width, height], masterBox: [x, 0, w, height]};
    filter = `crop=${w}:${height}:${x}:0`;
  } else if (variant.background) {
    filter = `scale=${variant.background}:-2:flags=lanczos`;
    crf = CRF.background;
  } else {
    filter = `scale=${siblingWidth}:${siblingHeight}:flags=lanczos`;
  }
  const output = path.join(root, 'assets', variant.out);
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', master, '-vf', `${filter},format=yuv420p`, '-c:v', 'libaom-av1', '-crf', String(crf), '-b:v', '0', '-still-picture', '1', '-cpu-used', '4', output]);
  const bytes = fs.readFileSync(output);
  const [outWidth, outHeight] = probe(output);
  const how = crop ? `${crop.ratio} crop at object-position ${Math.round(crop.objectPositionX * 100)}% (master box ${crop.masterBox.join(',')})` : variant.background ? `low-resolution background, ${outWidth} px wide` : `same ${outWidth}x${outHeight} size as ${variant.from}`;
  const entry = {
    path: `assets/${variant.out}`,
    variantOf: sibling.path,
    kind: sibling.kind,
    bytes: bytes.length,
    sha256: sha(bytes),
    display: variant.background ? ['css-background'] : sibling.display.filter(item => item !== 'social-preview' && item !== 'data-reference'),
    tool: sibling.tool,
    generatedAt: sibling.generatedAt,
    master: sibling.master,
    c2pa: sibling.c2pa,
    ...(sibling.visibleDisclosure ? {visibleDisclosure: sibling.visibleDisclosure} : {}),
    ...(crop ? {crops: [crop]} : {}),
    rights: sibling.rights,
    evidence: `AVIF variant of ${variant.from}: ${how}; encoded from the master by scripts/build-image-variants.mjs (libaom-av1, crf ${crf}). ${variant.from} stays as the fallback.`,
  };
  const index = manifest.assets.findIndex(asset => asset.path === entry.path);
  if (index >= 0) manifest.assets[index] = entry;
  else manifest.assets.splice(manifest.assets.findIndex(asset => asset.path === sibling.path) + 1, 0, entry);
  byPath.set(entry.path, entry);
  console.log(`${variant.out}: ${outWidth}x${outHeight}, ${bytes.length} bytes (${variant.from} ${sibling.bytes} bytes)`);
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', {encoding: 'utf8'});
