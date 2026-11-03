// AVIF 與裁切變體驗收：各寬度實際載入 AVIF、版面框與可見區域和 WebP 備援相同（裁切不減少可見內容），
// 不支援 AVIF 時退回原 WebP／JPG，三個背景改用低解析 AVIF。可見區域以 object-fit: cover 的換算比對兩種來源。
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const results = [];
const errors = [];
const note = (passed, label, detail = {}) => results.push({passed: Boolean(passed), label, ...detail});
const HEROES = [
  {page: 'ai-nvm-opportunities.html', image: '.ai-hero-media img'},
  {page: 'ai-nvm-opportunities.html', image: '.map-art img'},
  {page: 'automotive-nvm.html', image: '.m3-hero-media img'},
  {page: 'memory-physics.html', image: '.f1-hero-media img'},
];
const BACKGROUNDS = [
  {page: 'index.html', selector: 'body', avif: 'luminous-wafer-bg.avif'},
  {page: 'iot-mcu-envm.html', selector: '.hero-media', avif: 'iot-mcu-hero-bg.avif'},
  {page: 'secure-storage.html', selector: '.hero-media', avif: 'secure-storage-hero-key-bg.avif'},
];
// 以圖片座標表示 cover 可見區域（左、上、寬、高佔整張原圖的比例），裁切變體換回原圖座標後比對。
// 用版面尺寸（offsetWidth／offsetHeight），不受主圖放大動畫的 transform 影響。
const visibleRegion = image => image.evaluate(img => {
  const box = {width: img.offsetWidth, height: img.offsetHeight}, style = getComputedStyle(img);
  const [px, py] = style.objectPosition.split(' ').map(value => parseFloat(value) / 100);
  const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
  const w = box.width / scale, h = box.height / scale;
  return {box: [Math.round(box.width), Math.round(box.height)], src: img.currentSrc.split('/').pop(), natural: [img.naturalWidth, img.naturalHeight], region: [px * (img.naturalWidth - w), py * (img.naturalHeight - h), w, h]};
});
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/media-manifest.json'), 'utf8'));
const crops = new Map(manifest.assets.filter(asset => asset.crops).map(asset => [path.basename(asset.path), asset.crops[0]]));
// 把裁切變體的可見區域換回母帶比例座標；同尺寸變體直接換成比例。
const normalized = state => {
  const crop = crops.get(state.src);
  const [x, y, w, h] = state.region;
  if (!crop) return [x / state.natural[0], y / state.natural[1], w / state.natural[0], h / state.natural[1]];
  const [cx, cy, cw] = crop.masterBox, [mw, mh] = crop.masterSize, k = cw / state.natural[0];
  return [(cx + x * k) / mw, (cy + y * k) / mh, w * k / mw, h * k / mh];
};

const server = await startTestServer(root);
const browser = await chromium.launch({headless: true});
try {
  for (const language of ['zh', 'en']) for (const width of [320, 390, 600, 760, 1024, 1440]) {
    for (const {page, image} of HEROES) {
      const states = {};
      for (const avif of [true, false]) {
        const tab = await browser.newPage({viewport: {width, height: 900}});
        tab.on('pageerror', error => errors.push(`${page} ${width}: ${error.message}`));
        // 模擬不支援 AVIF：拿掉 type="image/avif" 的來源，瀏覽器只剩原本的 WebP／JPG。
        if (!avif) await tab.route('**/*.html*', async route => { const response = await route.fetch(); route.fulfill({response, body: (await response.text()).replace(/<source\b[^>]*type="image\/avif"[^>]*>/g, '')}); });
        await tab.goto(`${server.base}${page}?lang=${language}`, {waitUntil: 'networkidle'});
        const target = tab.locator(image).first();
        await target.evaluate(img => { img.loading = 'eager'; });
        await target.evaluate(img => img.decode().catch(() => {}));
        states[avif ? 'avif' : 'fallback'] = await visibleRegion(target);
        await tab.close();
      }
      const {avif, fallback} = states;
      const a = normalized(avif), b = normalized(fallback);
      const drift = Math.max(...a.map((value, index) => Math.abs(value - b[index])));
      note(avif.src.endsWith('.avif') && !fallback.src.endsWith('.avif') && avif.box.join() === fallback.box.join() && drift < 0.01, `${page} ${image} 載入 AVIF，版面框與可見區域和備援相同（${language} ${width}）`, {avif: avif.src, fallback: fallback.src, box: avif.box, drift: Number(drift.toFixed(4))});
    }
  }
  for (const {page, selector, avif} of BACKGROUNDS) for (const width of [1440, 390]) {
    const tab = await browser.newPage({viewport: {width, height: 900}});
    await tab.goto(`${server.base}${page}?lang=zh`, {waitUntil: 'networkidle'});
    const value = await tab.locator(selector).first().evaluate(node => getComputedStyle(node).backgroundImage);
    const requested = await tab.evaluate(name => performance.getEntriesByType('resource').some(entry => entry.name.includes(name)), avif);
    note(value.includes(avif) && /gradient/.test(value) && requested, `${page} 背景改用 ${avif} 並保留漸層（${width}）`, {value: value.slice(0, 160)});
    await tab.close();
  }
} finally {
  await browser.close();
  await server.close();
}
note(!errors.length, '沒有頁面錯誤', {errors: errors.slice(0, 5)});
const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({passed: results.length - failed.length, total: results.length, failed: failed.slice(0, 12)}, null, 2));
process.exitCode = failed.length ? 1 : 0;
