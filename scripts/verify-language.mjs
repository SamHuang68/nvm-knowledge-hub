import { chromium } from 'playwright';

const pages = [
  {
    url: 'http://localhost:8765/secure-storage.html',
    checks: ['#hero-title', '#thesis .thesis-grid h2', '#vendor-ask-title', '#identity-stack-title', '.stat-strip-compact'],
    fullScan: true,
  },
  {
    url: 'http://localhost:8765/index.html',
    checks: ['.hub-hero-compact h1', '.km-card-title'],
    fullScan: false,
  },
  {
    url: 'http://localhost:8765/ai-nvm-opportunities.html',
    checks: ['#overview .paper-heading h2'],
    fullScan: false,
  },
];

const browser = await chromium.launch({ headless: true });
let failed = 0;

for (const { url, checks, fullScan } of pages) {
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  for (const lang of ['en', 'zh']) {
    await page.evaluate((l) => {
      document.documentElement.setAttribute('data-language', l);
      document.body.setAttribute('data-language', l);
      localStorage.setItem('nvm-hub-language', l);
      if (window.HubLanguage) window.HubLanguage.set(l, false);
    }, lang);
    await page.waitForTimeout(250);

    const report = await page.evaluate(({ checks, lang, fullScan }) => {
      const cjk = /[\u4e00-\u9fff]/;
      const leaks = [];
      for (const sel of checks) {
        const el = document.querySelector(sel);
        if (!el) {
          leaks.push({ sel, issue: 'missing' });
          continue;
        }
        const text = el.innerText || '';
        const en = el.querySelector('[data-lang="en"], [data-assurance-en]');
        if (lang === 'en' && cjk.test(text)) leaks.push({ sel, issue: 'cjk-in-en', text: text.slice(0, 80) });
        if (lang === 'zh' && en && getComputedStyle(en).display !== 'none' && (en.innerText || '').length > 12) {
          leaks.push({ sel, issue: 'en-visible-in-zh', text: en.innerText.slice(0, 80) });
        }
      }

      const bare = [];
      if (fullScan) {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const text = node.textContent.trim();
          if (!text || !cjk.test(text)) continue;
          const el = node.parentElement;
          if (!el) continue;
          let hidden = false;
          let p = el;
          while (p) {
            if (getComputedStyle(p).display === 'none') { hidden = true; break; }
            p = p.parentElement;
          }
          if (hidden) continue;
          if (el.closest('[data-lang="zh"], [data-assurance-zh], .language-toggle')) continue;
          if (lang === 'en') bare.push(text.slice(0, 50));
        }
      }

      const ariaLeaks = [];
      if (lang === 'en') {
        document.querySelectorAll('[aria-label]').forEach((el) => {
          if (el.closest('.language-toggle, #languageToggle')) return;
          const label = el.getAttribute('aria-label') || '';
          if (cjk.test(label)) ariaLeaks.push({ tag: el.tagName, label: label.slice(0, 60) });
        });
        const meta = document.querySelector('meta[name="description"]');
        if (meta && cjk.test(meta.getAttribute('content') || '')) {
          ariaLeaks.push({ tag: 'meta', label: (meta.getAttribute('content') || '').slice(0, 60) });
        }
      }

      return { leaks, bare: bare.slice(0, 5), ariaLeaks: ariaLeaks.slice(0, 8) };
    }, { checks, lang, fullScan });

    const label = `${url} [${lang}]`;
    const hasFail = report.leaks.length
      || (lang === 'en' && fullScan && report.bare.length)
      || (lang === 'en' && report.ariaLeaks.length);
    if (hasFail) {
      console.log('FAIL', label, JSON.stringify(report, null, 2));
      failed += 1;
    } else {
      console.log('OK', label);
    }
  }
  await page.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
