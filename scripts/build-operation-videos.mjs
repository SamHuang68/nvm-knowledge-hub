// 操作影片試點：直接錄 atlas 步進演示的同一組原始影格與示意動態（data-motion），不另建圖面資料。
// 每支片中英各一版（圖內標籤跟頁面語言），AV1 WebM 為主、H.264 MP4 備援，附 WebP 海報與中英 WebVTT。
// 逐格 PNG 與 ffmpeg 清單放在 repo 外的母帶資料夾，只有成品進 assets/video/，並登記到 data/media-manifest.json。
// node scripts/build-operation-videos.mjs [母帶資料夾]
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
if (!process.argv[2] && !process.env.NVM_MEDIA_MASTERS) throw new Error('請指定 repo 外的母帶資料夾（參數或 NVM_MEDIA_MASTERS），例如 …\\data\\nvm-hub\\media-masters\\operation-videos-v1');
const masters = path.resolve(process.argv[2] || process.env.NVM_MEDIA_MASTERS);
const outDir = path.join(root, 'assets', 'video');
const FPS = 24;
const HOLD = 2.5;        // 沒有動態的步次停留秒數
const MOTION_TAIL = 0.8; // 動態播完後停在原圖的秒數
const VERSION = 'v1';
const PARTS = {
  write: {zh: '寫入', en: 'Program'},
  erase: {zh: '抹除', en: 'Erase'},
  read: {zh: '讀取', en: 'Read'},
  'stt-write': {zh: '寫入 P → AP', en: 'Write P → AP'},
  'stt-erase': {zh: '反向重寫 AP → P', en: 'Reverse write AP → P'}
};
const VIDEOS = [
  {id: 'neobit-program', operation: 'ip-neobit-write', title: {zh: 'NeoBit 寫入：熱電洞誘發電子注入', en: 'NeoBit program: hot-hole-induced electron injection'}, parts: [{ip: 'neobit', operation: 'write'}]},
  {id: 'neofuse-program', operation: 'ip-neofuse-write', title: {zh: 'NeoFuse 寫入：缺陷生成與直接穿隧', en: 'NeoFuse program: defect generation and direct tunneling'}, parts: [{ip: 'neofuse', operation: 'write'}]},
  {id: 'stt-write-erase', operation: 'stt-write', title: {zh: 'STT-MRAM：P → AP → P', en: 'STT-MRAM: P → AP → P'}, parts: [{op: 'stt-write'}, {op: 'stt-erase'}]},
  {id: 'neoee-mtp-cycle', operation: 'ip-neoee-write', title: {zh: 'NeoEE 完整 MTP 循環：寫入 → 讀取 → 抹除 → 讀取', en: 'NeoEE full MTP cycle: program → read → erase → read'}, parts: [{ip: 'neoee', operation: 'write'}, {ip: 'neoee', operation: 'read'}, {ip: 'neoee', operation: 'erase'}, {ip: 'neoee', operation: 'read'}]}
];

const sha = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
const stamp = seconds => {
  const ms = Math.round(seconds * 1000);
  const pad = (value, size = 2) => String(value).padStart(size, '0');
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}.${pad(ms % 1000, 3)}`;
};
const ffmpeg = args => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {stdio: ['ignore', 'inherit', 'inherit']});
const probe = file => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,profile,level,width,height,nb_frames:format=duration', '-of', 'json', file], {encoding: 'utf8'}));

async function openPart(page, base, language, part) {
  await page.goto(`${base}nvm-technology-atlas${language === 'zh' ? '-zh' : ''}.html?lang=${language}#panorama`, {waitUntil: 'networkidle'});
  let variant;
  if (part.ip) {
    await page.evaluate(hash => { location.hash = hash; }, `ip-${part.ip}`);
    await page.locator(`#ip-${part.ip} [data-operation-select="${part.operation}"]`).click();
    variant = page.locator(`#ip-op-${part.ip}-${part.operation} .nvm-op-variant`).first();
  } else {
    await page.evaluate(hash => { location.hash = hash; }, `op-${part.op}`);
    variant = page.locator(`#op-${part.op} .nvm-op-variant`).first();
  }
  const demo = variant.locator('[data-nvm-step-root]');
  await demo.waitFor();
  await demo.scrollIntoViewIfNeeded();
  await demo.locator('[data-nvm-step-action="reset"]').click();
  return demo;
}

// 讓目前步次的示意動態停在指定時間點；回傳動態總長（毫秒）。
// 只認圖內標記元素自己的 WAAPI 動畫；換步時的 CSS 淡入（演示框外層也帶 data-motion）一律直接結束，
// 否則它是否已播完會隨執行速度不同，造成中英版本的時間不一致。
const freeze = (demo, time) => demo.evaluate((root, time) => {
  const stage = root.querySelector('.nvm-step-stage');
  let length = 0;
  for (const animation of document.getAnimations()) {
    const target = animation.effect?.target;
    if (!target || !stage.contains(target)) continue;
    if (animation instanceof CSSAnimation || !target.matches('[data-motion]')) { animation.finish(); continue; }
    const timing = animation.effect.getComputedTiming();
    length = Math.max(length, timing.endTime);
    animation.pause();
    animation.currentTime = Math.min(time, timing.endTime);
  }
  return length;
}, time);

async function record(browser, base, video, language, frameDir) {
  fs.rmSync(frameDir, {recursive: true, force: true});
  fs.mkdirSync(frameDir, {recursive: true});
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}, deviceScaleFactor: 2, reducedMotion: 'no-preference'});
  const list = [];
  const cues = [];
  let clock = 0;
  let frame = 0;
  let poster = null;
  const shot = async (demo, duration) => {
    const file = path.join(frameDir, `f${String(++frame).padStart(5, '0')}.png`);
    await demo.locator('.nvm-step-stage').screenshot({path: file, animations: 'allow'});
    list.push({file, duration});
    clock += duration;
    return file;
  };
  for (const part of video.parts) {
    const demo = await openPart(page, base, language, part);
    const total = Number(await demo.getAttribute('data-step-count'));
    const label = PARTS[part.op || part.operation][language];
    for (let step = 1; step <= total; step++) {
      if (step > 1) await demo.locator('[data-nvm-step-action="next"]').click();
      const start = clock;
      const length = await freeze(demo, 0);
      if (length > 0) {
        for (let time = 0; time < length; time += 1000 / FPS) {
          await freeze(demo, time);
          const file = await shot(demo, 1 / FPS);
          if (!poster && time >= length * 0.3) poster = file;
        }
        await freeze(demo, length);
        await shot(demo, MOTION_TAIL);
      } else {
        await shot(demo, HOLD);
      }
      const text = await demo.evaluate((root, step) => {
        const frames = root.parentElement.querySelectorAll(':scope > .nvm-op-frames > .nvm-op-frame');
        const current = frames[step - 1];
        const state = current.querySelector('[data-figure-notes] dd')?.textContent.trim() || '';
        return {title: current.querySelector('h6').textContent.trim(), state};
      }, step);
      cues.push({start, end: clock, line1: `${label} · ${String(step).padStart(2, '0')}/${String(total).padStart(2, '0')} ${text.title}`, line2: text.state});
    }
  }
  await page.close();
  return {list, cues, poster: poster || list[0].file, duration: clock};
}

function encode(id, language, recording) {
  const base = `${id}-${VERSION}-${language}`;
  const concat = path.join(masters, `${base}.ffconcat`);
  // concat 清單：每格各自的停留時間；最後一格重複一次，ffmpeg 才會套用它的時間。
  const lines = ['ffconcat version 1.0', ...recording.list.flatMap(item => [`file '${item.file.replaceAll('\\', '/')}'`, `duration ${item.duration.toFixed(6)}`]), `file '${recording.list.at(-1).file.replaceAll('\\', '/')}'`];
  fs.writeFileSync(concat, lines.join('\n') + '\n');
  const scale = `fps=${FPS},scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p`;
  const webm = path.join(outDir, `${base}.webm`);
  const mp4 = path.join(outDir, `${base}.mp4`);
  const poster = path.join(outDir, `${base}-poster.webp`);
  // 重複的最後一格會讓 ffmpeg 多算一段停留，所以在錄製總長處截斷，影片長度才和字幕一致。
  const length = ['-t', recording.duration.toFixed(3)];
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', concat, '-vf', scale, ...length, '-c:v', 'libaom-av1', '-crf', '38', '-b:v', '0', '-cpu-used', '6', '-row-mt', '1', '-an', webm]);
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', concat, '-vf', scale, ...length, '-c:v', 'libx264', '-crf', '26', '-preset', 'slow', '-tune', 'animation', '-movflags', '+faststart', '-an', mp4]);
  ffmpeg(['-i', recording.poster, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libwebp', '-quality', '82', poster]);
  for (const file of [webm, mp4]) {
    const actual = Number(probe(file).format.duration);
    if (Math.abs(actual - recording.duration) > 1 / FPS + 0.02) throw new Error(`${path.basename(file)}：影片長 ${actual} 秒，字幕總長 ${recording.duration.toFixed(3)} 秒`);
  }
  return {webm, mp4, poster};
}

function vtt(cues) {
  return 'WEBVTT\n\n' + cues.map((cue, index) => `${index + 1}\n${stamp(cue.start)} --> ${stamp(cue.end)}\n${cue.line1}${cue.line2 ? `\n${cue.line2}` : ''}\n`).join('\n');
}

function codecs(file) {
  const stream = probe(file).streams[0];
  if (stream.codec_name === 'av1') return `av01.0.${String(stream.level).padStart(2, '0')}M.08`;
  const profile = {Baseline: '42', 'Constrained Baseline': '42', Main: '4d', High: '64'}[stream.profile] || '64';
  return `avc1.${profile}00${Number(stream.level).toString(16).padStart(2, '0')}`;
}

fs.mkdirSync(outDir, {recursive: true});
fs.mkdirSync(masters, {recursive: true});
const server = await startTestServer(root);
const browser = await chromium.launch({headless: true});
const produced = [];
try {
  for (const video of VIDEOS) {
    const recordings = {};
    for (const language of ['zh', 'en']) recordings[language] = await record(browser, server.base, video, language, path.join(masters, 'frames', `${video.id}-${language}`));
    const timing = language => recordings[language].cues.map(cue => [cue.start.toFixed(3), cue.end.toFixed(3)]).join('|');
    if (timing('zh') !== timing('en')) throw new Error(`${video.id}：中英版本的步次時間不一致`);
    const captions = {};
    for (const language of ['zh', 'en']) {
      const file = path.join(outDir, `${video.id}-${VERSION}.${language}.vtt`);
      fs.writeFileSync(file, vtt(recordings[language].cues), {encoding: 'utf8'});
      captions[language] = file;
    }
    for (const language of ['zh', 'en']) {
      const files = encode(video.id, language, recordings[language]);
      produced.push({video, language, files, captions, recording: recordings[language]});
    }
  }
} finally {
  await browser.close();
  await server.close();
}

// 登記到媒體清單：每個檔一筆；WebM 條目另記播放器需要的欄位。
const manifestPath = path.join(root, 'data', 'media-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.budgetBytes.video = 2 * 1024 * 1024;
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const evidence = video => `Rendered by scripts/build-operation-videos.mjs from the atlas step demonstration (${video.parts.map(part => part.op || `ip-${part.ip}-${part.operation}`).join(', ')}): original frames plus their data-motion layer, ${FPS} fps; frames kept outside the repository.`;
const entry = (file, video, extra = {}) => {
  const bytes = fs.readFileSync(file);
  return {path: relative(file), kind: 'site-drawn', bytes: bytes.length, sha256: sha(bytes), display: [`nvm-technology-atlas#${video.operation}`], tool: null, master: `media-masters/${path.basename(masters)}/frames/${video.id}`, rights: 'Drawn for this site: frames are the hub\'s own operation diagrams.', evidence: evidence(video), ...extra};
};
const fresh = new Map();
for (const item of produced) {
  const {video, language, files, captions, recording} = item;
  const info = probe(files.webm);
  fresh.set(relative(files.webm), entry(files.webm, video, {video: {
    operation: video.operation, language, title: video.title[language],
    durationSeconds: Number(recording.duration.toFixed(2)), width: info.streams[0].width, height: info.streams[0].height,
    fallback: relative(files.mp4), poster: relative(files.poster), captions: {zh: relative(captions.zh), en: relative(captions.en)},
    codecs: {webm: codecs(files.webm), mp4: codecs(files.mp4)},
    transcript: recording.cues.map(cue => cue.line2 ? `${cue.line1}：${cue.line2}` : cue.line1)
  }}));
  fresh.set(relative(files.mp4), entry(files.mp4, video));
  fresh.set(relative(files.poster), entry(files.poster, video));
  for (const language of ['zh', 'en']) fresh.set(relative(captions[language]), entry(captions[language], video));
}
manifest.assets = [...manifest.assets.filter(asset => !asset.path.startsWith('assets/video/')), ...fresh.values()];
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
for (const [file, value] of fresh) console.log(`${file} ${value.bytes} bytes${value.video ? ` · ${value.video.durationSeconds} s · ${value.video.width}x${value.video.height}` : ''}`);
