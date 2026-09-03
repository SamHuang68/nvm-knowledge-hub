import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const output = path.resolve(import.meta.dirname, '..', '.loop-engineering', 'rendered-r19');
fs.mkdirSync(output, { recursive: true });
const widths = [1440, 1361, 1280, 1101, 901, 768, 621, 390, 312];
const views = ['overview', 'whitepaper', 'selector', 'taxonomy', 'templates'];
const failures = [];
const browser = await chromium.launch({ headless: true });

for (const width of widths) {
  for (const view of views) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) => errors.push(`request: ${request.url()} ${request.failure()?.errorText || 'failed'}`));
    await page.goto(`http://127.0.0.1:4175/?view=${view}`, { waitUntil: 'networkidle' });

    const audit = await page.evaluate((expected) => {
      const doc = document.documentElement;
      const body = document.body;
      const active = document.querySelector('.view-tab[aria-selected="true"]');
      const visiblePanels = [...document.querySelectorAll('.studio-panel')].filter((panel) => !panel.hidden);
      const horizontalScrollers = [...document.querySelectorAll('body *')].filter((element) => {
        const style = getComputedStyle(element);
        return element.getClientRects().length && ['auto', 'scroll'].includes(style.overflowX) && element.scrollWidth > element.clientWidth + 1;
      }).map((element) => `${element.tagName.toLowerCase()}.${element.className || ''}:${element.scrollWidth}/${element.clientWidth}`);
      const outside = [...document.querySelectorAll('body *')].filter((element) => {
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return element.getClientRects().length && style.position !== 'fixed' && (box.right > innerWidth + 1 || box.left < -1);
      }).slice(0, 12).map((element) => {
        const box = element.getBoundingClientRect();
        return `${element.tagName.toLowerCase()}.${element.className || ''}:${Math.round(box.left)}/${Math.round(box.right)}`;
      });
      const labelSelectors = [
        '.micro-label', '.contract-card dt', '.technology-list small', '.evidence-note b',
        '.paper-heading dt', '.evidence-contract dt', '.reader-boundary b', '.chapter-takeaways > p',
        '.selector-controls label span', '.selector-controls > p span', '.decision-table thead th',
        '.schema-flow small', '.record-grid header', '.record-grid dt', '.record-grid article > p b'
      ];
      const labelIssues = [...document.querySelectorAll(labelSelectors.join(','))]
        .filter((element) => element.getClientRects().length)
        .map((element) => ({ label: element.textContent.trim().slice(0, 28), size: parseFloat(getComputedStyle(element).fontSize) }))
        .filter((item) => item.size < 9);
      return {
        overflow: Math.max(doc.scrollWidth - doc.clientWidth, body.scrollWidth - body.clientWidth),
        horizontalScrollers,
        outside,
        selected: active?.dataset.view,
        visiblePanel: visiblePanels[0]?.id,
        visibleCount: visiblePanels.length,
        h1Count: document.querySelectorAll('h1').length,
        lang: document.documentElement.lang,
        brand: document.querySelector('.studio-brand')?.href,
        heroSize: parseFloat(getComputedStyle(document.querySelector('.studio-hero h1')).fontSize),
        labelIssues,
        expected
      };
    }, view);

    if (audit.overflow > 1) failures.push(`${view}@${width}: document overflow ${audit.overflow}px; ${audit.outside.join(', ')}`);
    if (audit.horizontalScrollers.length) failures.push(`${view}@${width}: horizontal scroller ${audit.horizontalScrollers.join(', ')}`);
    if (audit.selected !== view || audit.visiblePanel !== `panel-${view}` || audit.visibleCount !== 1) failures.push(`${view}@${width}: route/panel ${JSON.stringify(audit)}`);
    if (audit.h1Count !== 1 || audit.lang !== 'en') failures.push(`${view}@${width}: document semantics H1=${audit.h1Count} lang=${audit.lang}`);
    if (audit.brand !== 'https://samhuang68.github.io/secure-storage-knowledge-hub/') failures.push(`${view}@${width}: brand target ${audit.brand}`);
    if (audit.labelIssues.length) failures.push(`${view}@${width}: evidence label floor ${JSON.stringify(audit.labelIssues)}`);
    if (width <= 390 && audit.heroSize > 44.1) failures.push(`${view}@${width}: mobile hero ${audit.heroSize}px exceeds 44px`);
    if (errors.length) failures.push(`${view}@${width}: ${errors.join(' | ')}`);

    if (width <= 621) {
      const smallTargets = await page.evaluate(() => [...document.querySelectorAll('button:not([hidden]), a.button')].filter((element) => element.getClientRects().length).map((element) => ({ label: element.textContent.trim().slice(0, 30), w: element.getBoundingClientRect().width, h: element.getBoundingClientRect().height })).filter((box) => box.w < 44 || box.h < 44));
      if (smallTargets.length) failures.push(`${view}@${width}: small targets ${JSON.stringify(smallTargets)}`);
      const menu = page.locator('#menuToggle');
      await menu.click();
      const menuAudit = await page.evaluate(() => ({ expanded: document.querySelector('#menuToggle')?.getAttribute('aria-expanded'), focus: document.activeElement === document.querySelector('#globalNav a'), box: document.querySelector('#globalNav')?.getBoundingClientRect().toJSON() }));
      if (menuAudit.expanded !== 'true' || !menuAudit.focus || menuAudit.box.left < -1 || menuAudit.box.right > width + 1) failures.push(`${view}@${width}: menu ${JSON.stringify(menuAudit)}`);
      await page.keyboard.press('Escape');
      const escaped = await page.evaluate(() => document.querySelector('#menuToggle')?.getAttribute('aria-expanded') === 'false' && document.activeElement === document.querySelector('#menuToggle'));
      if (!escaped) failures.push(`${view}@${width}: Escape did not close and restore focus`);
    }

    if (view === 'overview') {
      const firstTab = page.locator('#tab-overview');
      await firstTab.focus();
      await page.keyboard.press('ArrowRight');
      const keyboard = await page.evaluate(() => ({ selected: document.querySelector('.view-tab[aria-selected="true"]')?.dataset.view, focused: document.activeElement?.dataset?.view, query: new URL(location.href).searchParams.get('view') }));
      if (keyboard.selected !== 'whitepaper' || keyboard.focused !== 'whitepaper' || keyboard.query !== 'whitepaper') failures.push(`overview@${width}: keyboard tab contract ${JSON.stringify(keyboard)}`);
    }

    if ((width === 1440 && view === 'overview') || (width === 390 && ['overview', 'whitepaper', 'selector'].includes(view)) || (width === 312 && view === 'overview')) {
      await page.locator(`#tab-${view}`).click();
      await page.screenshot({ path: path.join(output, `${view}-${width}-viewport.png`), fullPage: false });
      await page.locator(`#panel-${view}`).scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `${view}-${width}-panel.png`), fullPage: false });
    }
    await page.close();
  }
}

{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:4175/?view=whitepaper#chap-state-contract', { waitUntil: 'networkidle' });
  await page.locator('#tab-selector').click();
  await page.reload({ waitUntil: 'networkidle' });
  const route = await page.evaluate(() => ({
    selected: document.querySelector('.view-tab[aria-selected="true"]')?.dataset.view,
    hash: location.hash,
    view: new URL(location.href).searchParams.get('view')
  }));
  if (route.selected !== 'selector' || route.view !== 'selector' || route.hash) failures.push(`chapter-to-selector reload contract ${JSON.stringify(route)}`);
  await page.goto('http://127.0.0.1:4175/#chap-state-contract', { waitUntil: 'networkidle' });
  const direct = await page.evaluate(() => document.querySelector('.view-tab[aria-selected="true"]')?.dataset.view);
  if (direct !== 'whitepaper') failures.push(`direct chapter route selected ${direct}`);
  await page.close();
}

await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`PASS: ${views.length} views × ${widths.length} widths; no horizontal overflow, runtime errors, route mismatch or mobile control failure.`);
