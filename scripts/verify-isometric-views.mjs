// 2.5D 等角爆炸圖與 3D 試點驗收：編號與圖例一致、爆炸後各層不重疊；
// 3D 檢視按下才建立，可用拖曳與方向鍵旋轉、Home 重設，列印時隱藏；1440／390 版面不溢出。
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {ISOMETRIC_MODELS, explodedBoxes} from './nvm-isometric-diagrams.mjs';

const root = path.resolve(import.meta.dirname, '..');
const results = [];
const note = (passed, label, detail = {}) => results.push({passed: Boolean(passed), label, ...detail});
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

// 一、模型：爆炸後每一組都在前一組上方，編號連續。
for (const [id, model] of Object.entries(ISOMETRIC_MODELS)) {
  const boxes = explodedBoxes(model);
  const groups = [...new Set(boxes.map(item => item.g))].sort((a, b) => a - b);
  const stacked = groups.slice(1).every(group => Math.min(...boxes.filter(item => item.g === group).map(item => item.z)) > Math.max(...boxes.filter(item => item.g === group - 1).map(item => item.z + item.h)));
  note(stacked && JSON.stringify(groups) === JSON.stringify(model.groups.map((_, index) => index)), `爆炸後各組由下而上、不重疊（${id}）`);
}

// 二、發布頁面：atlas 三個專題與比較頁的 hybrid bonding。
const figureOf = (html, id) => html.match(new RegExp(`<figure class="nvm-iso[^"]*" data-isometric-figure="${id}"[\\s\\S]*?</figure>`))?.[0] || '';
for (const [file, language] of [['nvm-technology-atlas-zh.html', 'zh'], ['nvm-technology-atlas.html', 'en']]) {
  const html = read(file);
  for (const id of ['stt', 'vcm', 'antifuse']) {
    const figure = figureOf(html, id);
    const groups = ISOMETRIC_MODELS[id].groups;
    const numbers = [...figure.matchAll(/<text [^>]*>(\d+)<\/text>/g)].map(match => Number(match[1])).sort((a, b) => a - b);
    note(figure && (figure.match(/<li>/g) || []).length === groups.length && JSON.stringify(numbers) === JSON.stringify(groups.map((_, index) => index + 1)) && groups.every(group => figure.includes(group[language].replace(/&/g, '&amp;'))), `圖內編號與圖例一致（${language} ${id}）`, {numbers});
  }
  note((html.match(/data-iso-model=/g) || []).length === 1 && figureOf(html, 'stt').includes('data-iso-model='), `3D 試點只在 STT（${language}）`);
}
const comparison = figureOf(read('technology-comparison.html'), 'hybrid-bonding');
note(comparison && ISOMETRIC_MODELS['hybrid-bonding'].groups.every(group => comparison.includes(group.zh) && comparison.includes(group.en)), '比較頁的 hybrid bonding 圖有中英圖例');

// 三、瀏覽器。
const server = await startTestServer(root);
const browser = await chromium.launch({headless: true});
const errors = [];
try {
  for (const [language, width] of [['zh', 1440], ['en', 390]]) {
    const page = await browser.newPage({viewport: {width, height: 1000}});
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${server.base}nvm-technology-atlas${language === 'zh' ? '-zh' : ''}.html?lang=${language}#panorama`, {waitUntil: 'networkidle'});
    await page.evaluate(() => { location.hash = 'topic-stt-storage'; });
    const figure = page.locator('[data-isometric-figure="stt"]');
    await figure.scrollIntoViewIfNeeded();
    const layout = await figure.evaluate(node => ({visible: node.checkVisibility(), svg: node.querySelector('svg')?.getBoundingClientRect().width || 0, toggle: node.querySelector('[data-iso-3d]').checkVisibility(), overflow: document.documentElement.scrollWidth - innerWidth}));
    note(layout.visible && layout.svg > 150 && layout.toggle && layout.overflow <= 1, `STT 等角圖與 3D 按鈕可見、版面不溢出（${language} ${width}）`, layout);
    note(await figure.evaluate(node => !node.querySelector('.nvm-iso-cuboid')), `按下前不建立 3D（${language} ${width}）`);
    await figure.locator('[data-iso-3d]').click();
    const stage = figure.locator('[data-iso-3d-stage]');
    const transform = () => stage.evaluate(node => node.querySelector('.nvm-iso-scene').style.transform);
    const initial = await transform();
    const cuboids = await stage.evaluate(node => node.querySelectorAll('.nvm-iso-cuboid').length);
    await page.keyboard.press('ArrowRight');
    const keyed = await transform();
    const box = await stage.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 30, {steps: 4});
    await page.mouse.up();
    const dragged = await transform();
    await stage.focus();
    await page.keyboard.press('Home');
    const reset = await transform();
    note(cuboids === ISOMETRIC_MODELS.stt.boxes.length && keyed !== initial && dragged !== keyed && reset === initial && await stage.evaluate(node => node === document.activeElement), `3D 可用方向鍵與拖曳旋轉、Home 重設（${language} ${width}）`, {cuboids, initial, keyed, dragged, reset});
    await page.emulateMedia({media: 'print'});
    note(!await stage.isVisible() && await figure.locator('svg').isVisible(), `列印時隱藏 3D、保留等角圖（${language} ${width}）`);
    await page.emulateMedia({media: 'screen'});
    await page.goto(`${server.base}technology-comparison.html?lang=${language}`, {waitUntil: 'networkidle'});
    const hybrid = page.locator('[data-isometric-figure="hybrid-bonding"]');
    await hybrid.scrollIntoViewIfNeeded();
    const shown = await hybrid.evaluate((node, language) => ({visible: node.checkVisibility(), svg: node.querySelector('svg').getBoundingClientRect().width, own: [...node.querySelectorAll(`[data-lang="${language}"]`)].every(item => item.checkVisibility()), other: [...node.querySelectorAll(`[data-lang="${language === 'zh' ? 'en' : 'zh'}"]`)].some(item => item.checkVisibility()), overflow: document.documentElement.scrollWidth - innerWidth}), language);
    note(shown.visible && shown.svg > 150 && shown.own && !shown.other && shown.overflow <= 1, `比較頁 hybrid bonding 圖只顯示頁面語言（${language} ${width}）`, shown);
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
