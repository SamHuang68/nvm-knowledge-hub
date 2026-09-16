import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {chromium} from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const MIN = Number(process.env.KEEPOUT || 24);
const PANEL_MIN = Number(process.env.PANEL_KEEPOUT || 20);
const widths = process.argv.includes('--desktop-only') ? [1440] : [1440, 390];
const routes = [
  'index.html',
  'NVM技術全景.html',
  'NVM技術全景中文.html',
  'technology-comparison.html',
  'memory-physics.html',
  'memory-evidence.html',
  'secure-storage.html',
  'oip-secure-storage.html',
  'security-assurance.html',
  'specialty-nvm.html',
  'ai-nvm-opportunities.html',
  'automotive-nvm.html',
  'iot-mcu-envm.html',
  '404.html',
  'whitepaper/index.html',
  'briefing/index.html'
];

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let file;
  try {
    file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { 'content-type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/`;
const results = [];
let browser;

try {
  browser = await chromium.launch({ headless: true });
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(120);
      const report = await page.evaluate(({ minKeepout, panelMin }) => {
        const vw = innerWidth;
        const skip = (el) => el.closest('.skip-link, .nvm-skip, .sr-only, [hidden], dialog');
        const hidden = (el) => {
          const s = getComputedStyle(el);
          return s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0;
        };
        const obscured = (el, rect) => {
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const s = getComputedStyle(p);
            if (/(auto|scroll)/.test(s.overflowX) && p.scrollWidth > p.clientWidth + 1) return true;
            if (s.overflowX === 'hidden' || s.overflowX === 'clip' || s.overflow === 'hidden' || s.overflow === 'clip') {
              const box = p.getBoundingClientRect();
              if (rect.left < box.left - 0.6 || rect.right > box.right + 0.6) return true;
            }
          }
          return false;
        };
        const offenders = [];
        let minLeft = vw;
        let minRight = vw;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (!node.nodeValue || !node.nodeValue.trim()) continue;
          const el = node.parentElement;
          if (!el || skip(el) || hidden(el)) continue;
          const s = getComputedStyle(el);
          if (s.position === 'fixed' && el.getBoundingClientRect().bottom <= 0) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const r of range.getClientRects()) {
            if (r.width < 1 || r.height < 1) continue;
            if (r.right <= 0 || r.left >= vw) continue;
            if (obscured(el, r)) continue;
            minLeft = Math.min(minLeft, r.left);
            minRight = Math.min(minRight, vw - r.right);
            if (r.left < minKeepout - 0.6 || r.right > vw - (minKeepout - 0.6)) {
              offenders.push({
                text: node.nodeValue.trim().slice(0, 72),
                tag: el.tagName.toLowerCase(),
                className: String(el.className || '').slice(0, 80),
                left: Number(r.left.toFixed(1)),
                right: Number((vw - r.right).toFixed(1))
              });
            }
          }
        }
        for (const el of document.querySelectorAll('button, a, input, select, textarea, summary')) {
          if (skip(el) || hidden(el)) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) continue;
          if (r.right <= 0 || r.left >= vw) continue;
          if (obscured(el, r)) continue;
          minLeft = Math.min(minLeft, r.left);
          minRight = Math.min(minRight, vw - r.right);
          if (r.left < minKeepout - 0.6 || r.right > vw - (minKeepout - 0.6)) {
            offenders.push({
              text: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 72),
              tag: el.tagName.toLowerCase(),
              className: String(el.className || '').slice(0, 80),
              left: Number(r.left.toFixed(1)),
              right: Number((vw - r.right).toFixed(1))
            });
          }
        }
        const uniq = [];
        const seen = new Set();
        for (const hit of offenders) {
          const key = `${hit.tag}|${hit.left}|${hit.right}|${hit.text}`;
          if (seen.has(key)) continue;
          seen.add(key);
          uniq.push(hit);
        }
        const panelHits = [];
        for (const panel of document.querySelectorAll('.main-container > .lens-panel')) {
          const box = panel.getBoundingClientRect();
          if (box.width < 8 || box.height < 8) continue;
          const walker2 = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
          while (walker2.nextNode()) {
            const node = walker2.currentNode;
            if (!node.nodeValue || !node.nodeValue.trim()) continue;
            const el = node.parentElement;
            if (!el || skip(el) || hidden(el)) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            for (const r of range.getClientRects()) {
              if (r.width < 1 || r.height < 1) continue;
              if (obscured(el, r)) continue;
              const insetLeft = r.left - box.left;
              const insetRight = box.right - r.right;
              if (insetLeft < panelMin - 0.6 || insetRight < panelMin - 0.6) {
                panelHits.push({
                  panel: panel.id || '',
                  text: node.nodeValue.trim().slice(0, 72),
                  tag: el.tagName.toLowerCase(),
                  insetLeft: Number(insetLeft.toFixed(1)),
                  insetRight: Number(insetRight.toFixed(1))
                });
              }
            }
          }
        }
        const panelUniq = [];
        const panelSeen = new Set();
        for (const hit of panelHits) {
          const key = `${hit.panel}|${hit.tag}|${hit.insetLeft}|${hit.insetRight}|${hit.text}`;
          if (panelSeen.has(key)) continue;
          panelSeen.add(key);
          panelUniq.push(hit);
        }
        return {
          minLeft: Number(minLeft.toFixed(1)),
          minRight: Number(minRight.toFixed(1)),
          overflow: document.documentElement.scrollWidth - vw,
          offenders: uniq.slice(0, 8),
          panelOffenders: panelUniq.slice(0, 8)
        };
      }, { minKeepout: MIN, panelMin: PANEL_MIN });
      const pass = report.offenders.length === 0 && report.overflow <= 2 && report.panelOffenders.length === 0;
      results.push({ width, route, pass, ...report });
      if (!pass) {
        console.log(JSON.stringify({
          width,
          route,
          pass,
          minLeft: report.minLeft,
          minRight: report.minRight,
          overflow: report.overflow,
          offenders: report.offenders,
          panelOffenders: report.panelOffenders
        }, null, 2));
      }
    }
    await context.close();
  }
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}

const outDir = path.join(root, 'qa');
fs.mkdirSync(outDir, { recursive: true });
const summary = {
  date: '2026-09-16',
  minKeepout: MIN,
  panelKeepout: PANEL_MIN,
  failed: results.filter((r) => !r.pass).length,
  results
};
fs.writeFileSync(path.join(outDir, 'keepout-audit.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ checks: results.length, failed: summary.failed, minKeepout: MIN, panelKeepout: PANEL_MIN }, null, 2));
if (summary.failed) process.exitCode = 1;
