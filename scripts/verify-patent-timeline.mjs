// 專利優先權日時間軸與附圖權利說明的驗收：每一點都對得回 data/nvm-vendor-patent-maps*.json 的既有欄位，
// 不推算到期年；畫面在 1440／390 可讀、窄螢幕可橫向捲動，頁面本身不溢出。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {startTestServer} from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const results = [];
const note = (passed, label, detail = {}) => results.push({passed: Boolean(passed), label, ...detail});
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

for (const [language, atlasFile, dataFile] of [['zh', 'nvm-technology-atlas-zh.html', 'data/nvm-vendor-patent-maps.json'], ['en', 'nvm-technology-atlas.html', 'data/nvm-vendor-patent-maps-en.json']]) {
  const html = read(atlasFile);
  const data = JSON.parse(read(dataFile));
  const records = new Map(data.vendors.flatMap(vendor => vendor.families.flatMap(family => family.patents.map(patent => [patent.id, {vendor: vendor.id, patent}]))));
  const section = html.match(/<section class="nvm-priority-timeline"[\s\S]*?<\/section>/)?.[0] || '';
  const viewBox = section.match(/<svg viewBox="0 0 1000 (\d+)"/);
  const years = [...records.values()].map(record => Number(record.patent.priorityDate.slice(0, 4)));
  const first = Math.floor(Math.min(...years) / 5) * 5;
  const last = Math.ceil((Math.max(...years) + 1) / 5) * 5;
  const yearWidth = (965 - 190) / (last - first);
  const problems = [];
  let dots = 0;
  for (const lane of section.matchAll(/<g data-timeline-vendor="([^"]+)">([\s\S]*?)<\/g>/g)) {
    for (const dot of lane[2].matchAll(/<circle class="nvm-timeline-dot" data-status="([a-z]+)" data-id="([^"]+)" data-priority="([^"]+)" cx="([\d.]+)"/g)) {
      dots++;
      const [, status, id, priority, cx] = dot;
      const record = records.get(id);
      if (!record) { problems.push({id, issue: '資料中沒有這筆'}); continue; }
      if (record.vendor !== lane[1]) problems.push({id, issue: '放錯廠商列'});
      if (record.patent.priorityDate !== priority) problems.push({id, issue: '優先權日不符'});
      if (record.patent.legalStatus !== status) problems.push({id, issue: '收錄狀態不符'});
      const left = 190 + (Number(priority.slice(0, 4)) - first) * yearWidth;
      if (Number(cx) < left || Number(cx) >= left + yearWidth) problems.push({id, cx, issue: '點不在優先權年的寬度內'});
    }
  }
  const legend = Object.fromEntries([...section.matchAll(/data-status="(active|expired|unverified)" aria-hidden="true"><\/span>[^<]*? (\d+)<\/li>/g)].map(match => [match[1], Number(match[2])]));
  const expected = status => [...records.values()].filter(record => record.patent.legalStatus === status).length;
  const tableRows = (section.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1].match(/<tr>/g) || []).length;
  note(viewBox && dots === records.size && !problems.length, `時間軸每一點對回既有資料（${language}）`, {dots, records: records.size, problems: problems.slice(0, 5)});
  note(['active', 'expired', 'unverified'].every(status => legend[status] === expected(status)) && tableRows === data.vendors.length, `圖例與表格統計和資料相同（${language}）`, {legend, tableRows});
  // 不推算到期年：時間軸不得出現任何一筆的期滿日欄位值，點上也只帶狀態、編號與優先權日。
  const termValues = [...new Set([...records.values()].map(record => record.patent.expirationDate))];
  const dotAttributes = [...new Set([...section.matchAll(/<circle class="nvm-timeline-dot"([^>]*)>/g)].flatMap(match => [...match[1].matchAll(/ ([a-z-]+)=/g)].map(attribute => attribute[1])))];
  note(termValues.every(value => !section.includes(value)) && JSON.stringify(dotAttributes) === JSON.stringify(['data-status', 'data-id', 'data-priority', 'cx', 'cy', 'r']), `時間軸不使用期滿日（${language}）`, {termValues, dotAttributes});
  const rights = [...html.matchAll(/<span class="nvm-patent-rights" title="([^"]*)">([^<]*)<\/span>/g)];
  const figures = (html.match(/data-patent-figure="/g) || []).length;
  note(rights.length === figures && rights.every(match => match[1] && match[2]) && rights.every(match => (language === 'zh' ? /^權利：/ : /^Rights: /).test(match[2])), `每張專利附圖都有一行權利說明（${language}）`, {figures, rights: rights.length});
}

const server = await startTestServer(root);
const browser = await chromium.launch({headless: true});
const errors = [];
try {
  for (const [language, width] of [['zh', 390], ['en', 1440]]) {
    const page = await browser.newPage({viewport: {width, height: 1000}});
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${server.base}nvm-technology-atlas${language === 'zh' ? '-zh' : ''}.html?lang=${language}#patent-maps`, {waitUntil: 'networkidle'});
    const timeline = page.locator('#nvm-priority-timeline');
    await timeline.scrollIntoViewIfNeeded();
    const layout = await timeline.evaluate(section => {
      const wrap = section.querySelector('.nvm-timeline-wrap');
      const svg = wrap.querySelector('svg');
      const scale = svg.getBoundingClientRect().width / 1000;
      return {
        visible: section.checkVisibility(),
        pageOverflow: document.documentElement.scrollWidth - innerWidth,
        scrollable: wrap.scrollWidth > wrap.clientWidth + 1,
        focusable: wrap.tabIndex === 0,
        dots: svg.querySelectorAll('.nvm-timeline-dot').length,
        drawn: [...svg.querySelectorAll('.nvm-timeline-dot')].every(dot => dot.getBBox().width > 0),
        smallestText: Math.min(...[...svg.querySelectorAll('text')].map(text => parseFloat(getComputedStyle(text).fontSize) * scale)),
        legend: section.querySelector('.nvm-timeline-legend').checkVisibility()
      };
    });
    note(layout.visible && layout.pageOverflow <= 1 && layout.dots === 477 && layout.drawn && layout.legend && layout.smallestText >= 11 && (width > 900 || (layout.scrollable && layout.focusable)), `時間軸版面（${language} ${width}）`, layout);
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
