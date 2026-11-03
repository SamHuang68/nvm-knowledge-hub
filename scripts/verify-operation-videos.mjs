// 操作影片試點驗收：清單、字幕、播放器標記與實際播放。
// 不自動播放、按下播放前不下載影片；中英字幕各一軌且時間對得上；切換章節或操作時暫停；版面不溢出。
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const results = [];
const note = (passed, label, detail = {}) => results.push({passed: Boolean(passed), label, ...detail});
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const manifest = JSON.parse(read('data/media-manifest.json'));
const videos = manifest.assets.filter(asset => asset.video);
const cuesOf = file => [...read(file).matchAll(/(\d\d):(\d\d):(\d\d)\.(\d{3}) --> (\d\d):(\d\d):(\d\d)\.(\d{3})/g)].map(match => {
  const seconds = (h, m, s, ms) => Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000;
  return [seconds(...match.slice(1, 5)), seconds(...match.slice(5, 9))];
});
let ffprobe = true;
try { execFileSync('ffprobe', ['-version'], {stdio: 'ignore'}); } catch { ffprobe = false; }

// 一、清單與字幕。
note(videos.length === 8 && new Set(videos.map(video => video.video.operation)).size === 4, '4 支試點影片各有中英兩版', {count: videos.length});
for (const entry of videos) {
  const video = entry.video;
  const zh = cuesOf(video.captions.zh);
  const en = cuesOf(video.captions.en);
  const ordered = zh.every(([start, end], index) => end > start && (index === 0 || Math.abs(start - zh[index - 1][1]) < 0.002));
  note(zh.length > 0 && JSON.stringify(zh) === JSON.stringify(en) && ordered && Math.abs(zh.at(-1)[1] - video.durationSeconds) < 0.01 && zh.length === video.transcript.length, `字幕中英同步、首尾相接、與片長及文字稿一致（${entry.path}）`, {cues: zh.length, end: zh.at(-1)?.[1], duration: video.durationSeconds});
  note(/[㐀-鿿]/.test(read(video.captions.zh)) && !/[㐀-鿿]/.test(read(video.captions.en)), `中文字幕是中文、英文字幕沒有中文（${entry.path}）`);
  if (ffprobe) {
    for (const file of [entry.path, video.fallback]) {
      const info = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height:format=duration', '-of', 'json', path.join(root, file)], {encoding: 'utf8'}));
      const codec = info.streams[0].codec_name;
      note(Math.abs(Number(info.format.duration) - video.durationSeconds) <= 1 / 24 + 0.02 && info.streams[0].width === video.width && codec === (file.endsWith('.webm') ? 'av1' : 'h264'), `片長、尺寸與編碼（${file}）`, {codec, duration: info.format.duration});
    }
  }
}
if (!ffprobe) note(true, '此環境沒有 ffprobe：片長與編碼改由產製腳本在輸出時核對', {skipped: true});

// 二、播放器標記。
for (const [language, file] of [['zh', 'nvm-technology-atlas-zh.html'], ['en', 'nvm-technology-atlas.html']]) {
  const html = read(file);
  const figures = [...html.matchAll(/<figure class="nvm-op-video"[\s\S]*?<\/figure>/g)].map(match => match[0]);
  const wanted = videos.filter(entry => entry.video.language === language);
  const ok = figures.length === wanted.length && wanted.every(entry => {
    const figure = figures.find(item => item.includes(`data-operation-video="${entry.path}"`));
    return figure && /<video controls playsinline preload="none"/.test(figure) && !/autoplay/.test(figure)
      && figure.includes(`poster="${entry.video.poster}"`) && (figure.match(/<source /g) || []).length === 2 && (figure.match(/<track /g) || []).length === 2
      && (figure.match(/<li>/g) || []).length === entry.video.transcript.length;
  });
  note(ok, `播放器標記：不自動播放、按下才下載、兩種格式、中英字幕與文字稿（${language}）`, {figures: figures.length});
}

// 三、實際播放。
const server = await startTestServer(root);
const browser = await chromium.launch({headless: true});
const errors = [];
try {
  for (const [language, width] of [['en', 1440], ['zh', 390]]) {
    const page = await browser.newPage({viewport: {width, height: 1000}});
    page.on('pageerror', error => errors.push(error.message));
    const requested = [];
    page.on('request', request => { if (/\.(webm|mp4)$/.test(new URL(request.url()).pathname)) requested.push(new URL(request.url()).pathname); });
    await page.goto(`${server.base}nvm-technology-atlas${language === 'zh' ? '-zh' : ''}.html?lang=${language}#panorama`, {waitUntil: 'networkidle'});
    await page.evaluate(() => { location.hash = 'ip-neobit'; });
    await page.locator('#ip-neobit [data-operation-select="write"]').click();
    const figure = page.locator('#ip-op-neobit-write .nvm-op-video');
    await figure.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const before = {requested: requested.length, layout: await figure.evaluate(node => ({visible: node.checkVisibility(), videoWidth: node.querySelector('video').getBoundingClientRect().width, figureWidth: node.getBoundingClientRect().width, pageOverflow: document.documentElement.scrollWidth - innerWidth}))};
    note(before.requested === 0 && before.layout.visible && before.layout.videoWidth <= before.layout.figureWidth && before.layout.pageOverflow <= 1, `播放前不下載影片、版面不溢出（${language} ${width}）`, before);
    const playback = await figure.evaluate(async node => {
      const video = node.querySelector('video');
      await video.play();
      await new Promise(resolve => setTimeout(resolve, 1500));
      const tracks = [...video.textTracks];
      const showing = tracks.find(track => track.mode === 'showing');
      return {time: video.currentTime, source: video.currentSrc.split('/').pop(), tracks: tracks.map(track => track.language), showing: showing?.language, cues: showing?.cues?.length ?? 0};
    });
    const entry = videos.find(item => item.video.operation === 'ip-neobit-write' && item.video.language === language);
    note(playback.time > 0.5 && playback.source.endsWith('.webm') && playback.tracks.length === 2 && playback.showing === (language === 'zh' ? 'zh-Hant' : 'en') && playback.cues === entry.video.transcript.length && requested.length > 0, `按下播放後播放 AV1 版並顯示頁面語言字幕（${language} ${width}）`, playback);
    await page.locator('#ip-neobit [data-operation-select="read"]').click();
    await page.waitForTimeout(300);
    note(await figure.evaluate(node => node.querySelector('video').paused), `切換到其他操作時影片暫停（${language} ${width}）`);
    await page.close();
  }
} finally {
  await browser.close();
  await server.close();
}
note(!errors.length, '沒有頁面錯誤', {errors});
const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({passed: results.length - failed.length, total: results.length, failed}, null, 2));
process.exitCode = failed.length ? 1 : 0;
