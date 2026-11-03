// AI 媒體說明驗收：逐頁實測實際套用的 AI 生成 CSS 背景與 og:image／twitter:image，
// 和 scripts/ai-media-notes.mjs 的對應表比對（不漏標、不多標），並確認頁尾說明可見、只顯示頁面語言、寫明每張圖的工具與日期。
// 分享預覽圖若也以 <img> 顯示在頁面上，沿用發布門禁的圖旁揭露，不另列。
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';
import {AI_MEDIA_NOTE_PAGES} from './ai-media-notes.mjs';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/media-manifest.json'), 'utf8'));
const ai = manifest.assets.filter(asset => asset.kind === 'ai-generated');
const aiNames = ai.map(asset => path.basename(asset.path));
const byName = new Map(ai.map(asset => [path.basename(asset.path), asset]));
// AVIF 等變體（variantOf）視為原圖：image-set() 會同時列出變體與原圖，說明與對應表只記原圖。
const original = name => byName.get(name)?.variantOf ? path.basename(byName.get(name).variantOf) : name;
const pages = JSON.parse(fs.readFileSync(path.join(root, 'data/public-routes.json'), 'utf8')).pages;
const results = [];
const errors = [];
const note = (passed, label, detail = {}) => results.push({passed: Boolean(passed), label, ...detail});
const server = await startTestServer(root);
const browser = await chromium.launch({headless: true});
try {
  for (const page of pages) {
    const languages = page === 'nvm-technology-atlas.html' ? ['en'] : page === 'nvm-technology-atlas-zh.html' ? ['zh'] : ['zh', 'en'];
    for (const language of languages) for (const width of [1440, 390]) {
      const tab = await browser.newPage({viewport: {width, height: 900}});
      tab.on('pageerror', error => errors.push(`${page} ${language} ${width}: ${error.message}`));
      await tab.goto(`${server.base}${page}?lang=${language}`, {waitUntil: 'networkidle'});
      // 轉址頁（例如白皮書工作室）以導向後實際停留的頁面為準。
      const landed = decodeURIComponent(new URL(tab.url()).pathname.slice(1)) || 'index.html';
      const seen = await tab.evaluate(names => {
        const background = new Set(), shown = new Set();
        for (const element of document.querySelectorAll('*')) for (const pseudo of [null, '::before', '::after']) {
          const value = getComputedStyle(element, pseudo).backgroundImage;
          if (value && value !== 'none') for (const name of names) if (value.includes(name)) background.add(name);
        }
        for (const image of document.querySelectorAll('img, source')) {
          const refs = `${image.getAttribute('src') || ''} ${image.getAttribute('srcset') || ''}`;
          for (const name of names) if (refs.includes(name)) shown.add(name);
        }
        const share = [...document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]')].map(meta => meta.content).flatMap(url => names.filter(name => url.includes(name)));
        return {background: [...background], share: [...new Set(share)].filter(name => !shown.has(name))};
      }, aiNames);
      seen.background = [...new Set(seen.background.map(original))];
      seen.share = [...new Set(seen.share.map(original))];
      const listed = AI_MEDIA_NOTE_PAGES[landed] || {};
      const same = (a, b) => JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b || [])].sort());
      note(same(seen.background, listed.background) && same(seen.share, listed.share), `對應表與實際使用一致（${page} ${language} ${width}）`, {seen, listed});
      const needed = [...new Set([...seen.background, ...seen.share])];
      const notes = tab.locator('[data-ai-media-note]');
      if (!needed.length) {
        note(await notes.count() === 0, `沒有 AI 背景或預覽圖的頁面不加說明（${page} ${language} ${width}）`);
      } else if (!await notes.count()) {
        note(false, `頁尾說明可見、只顯示頁面語言並寫明工具與日期（${page} ${language} ${width}）`, {missing: needed});
      } else {
        await notes.first().scrollIntoViewIfNeeded();
        const state = await notes.first().evaluate((node, language) => ({
          visible: node.checkVisibility(),
          text: [...node.childNodes].filter(child => child.nodeType === 3 || child.checkVisibility()).map(child => child.textContent).join(' ').trim(),
          other: [...node.querySelectorAll(`[data-lang="${language === 'zh' ? 'en' : 'zh'}"]`)].some(child => child.checkVisibility()),
        }), language);
        const credits = needed.every(name => state.text.includes(byName.get(name).tool) && state.text.includes(byName.get(name).generatedAt));
        const label = language === 'zh' ? 'AI 生成' : 'AI-generated';
        note(await notes.count() === 1 && state.visible && !state.other && state.text.includes(label) && credits, `頁尾說明可見、只顯示頁面語言並寫明工具與日期（${page} ${language} ${width}）`, state);
      }
      await tab.close();
    }
  }
} finally {
  await browser.close();
  await server.close();
}
note(!errors.length, '沒有頁面錯誤', {errors: errors.slice(0, 5)});
const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({passed: results.length - failed.length, total: results.length, failed: failed.slice(0, 12)}, null, 2));
process.exitCode = failed.length ? 1 : 0;
