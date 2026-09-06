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
      const properNoun = /\b(AES-256|SRAM PUF|TSMC|Synopsys|OpenPGP|Okta|OTP|MCU|NVM|APB|PUF|FI|SCA|FIB|PVC|RP2350|ISO|PSA|SESIP|NIST|PVT|HPC|IoT|AMBA|NeoPUF|OKTA|OPENPGP|RFC|BER|EM|BMC|JEDEC|OCP|NDA|HBM|PMIC|SPD|RAS|MCU|GPU|CPU|AI|HPC|GO|GATE|SCREEN|EXCLUDE|HTTPS|URL|HTML|CSS|JS|API|BOM|TPM|FIB|PVC|MFA|APB|ABMA)\b/gi;
      const isEnglishSentence = (text) => {
        if (!text || text.length < 40 || cjk.test(text)) return false;
        const stripped = text.replace(properNoun, ' ').replace(/[^A-Za-z\s]/g, ' ');
        const words = stripped.split(/\s+/).filter((w) => w.length >= 4);
        return words.length >= 3;
      };
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

      const enVisibleInZh = [];
      if (lang === 'zh') {
        document.querySelectorAll('[data-lang="en"]').forEach((el) => {
          if (getComputedStyle(el).display === 'none') return;
          const text = (el.innerText || '').trim();
          if (text.length > 12) enVisibleInZh.push(text.slice(0, 80));
        });
      }

      const bareEn = [];
      if (fullScan && lang === 'zh') {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const text = node.textContent.trim();
          if (!isEnglishSentence(text)) continue;
          const el = node.parentElement;
          if (!el) continue;
          let hidden = false;
          let p = el;
          while (p) {
            if (getComputedStyle(p).display === 'none') { hidden = true; break; }
            p = p.parentElement;
          }
          if (hidden) continue;
          if (el.closest('[data-lang="en"], [data-assurance-en], .language-toggle')) continue;
          bareEn.push(text.slice(0, 80));
        }
      }

      return { leaks, bare: bare.slice(0, 5), bareEn: bareEn.slice(0, 8), ariaLeaks: ariaLeaks.slice(0, 8), enVisibleInZh: enVisibleInZh.slice(0, 5) };
    }, { checks, lang, fullScan });

    const label = `${url} [${lang}]`;
    const hasFail = report.leaks.length
      || (lang === 'en' && fullScan && report.bare.length)
      || (lang === 'en' && report.ariaLeaks.length)
      || (lang === 'zh' && report.enVisibleInZh.length)
      || (lang === 'zh' && fullScan && report.bareEn.length);
    if (hasFail) {
      console.log('FAIL', label, JSON.stringify(report, null, 2));
      failed += 1;
    } else {
      console.log('OK', label);
    }
  }
  await page.close();
}

// 3× language-toggle residue (secure-storage)
{
  const page = await browser.newPage();
  await page.goto('http://localhost:8765/secure-storage.html', { waitUntil: 'networkidle' });
  for (const lang of ['en', 'zh', 'en', 'zh', 'en']) {
    await page.evaluate((l) => window.HubLanguage.set(l, false), lang);
    await page.waitForTimeout(250);
    const bad = await page.evaluate((lang) => {
      const cjk = /[\u4e00-\u9fff]/;
      const properNoun = /\b(AES-256|SRAM PUF|TSMC|Synopsys|OpenPGP|Okta|OTP|MCU|NVM|APB|PUF|FI|SCA|FIB|PVC|RP2350|ISO|PSA|SESIP|NIST|PVT|HPC|IoT|AMBA|NeoPUF|OKTA|OPENPGP|RFC|BER|EM|BMC|JEDEC|OCP|NDA|HBM|PMIC|SPD|RAS|MCU|GPU|CPU|AI|HPC|GO|GATE|SCREEN|EXCLUDE|HTTPS|URL|HTML|CSS|JS|API|BOM|TPM|FIB|PVC|MFA|APB|ABMA)\b/gi;
      const isEnglishSentence = (text) => {
        if (!text || text.length < 40 || cjk.test(text)) return false;
        const stripped = text.replace(properNoun, ' ').replace(/[^A-Za-z\s]/g, ' ');
        const words = stripped.split(/\s+/).filter((w) => w.length >= 4);
        return words.length >= 3;
      };
      const issues = [];
      if (lang === 'en') {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const text = node.textContent.trim();
          if (!text || !cjk.test(text)) continue;
          const el = node.parentElement;
          if (!el || el.closest('[data-lang="zh"], [data-assurance-zh], .language-toggle')) continue;
          let hidden = false;
          let p = el;
          while (p) {
            if (getComputedStyle(p).display === 'none') { hidden = true; break; }
            p = p.parentElement;
          }
          if (!hidden) issues.push('cjk:' + text.slice(0, 40));
        }
      } else {
        document.querySelectorAll('[data-lang="en"]').forEach((el) => {
          if (getComputedStyle(el).display !== 'none' && (el.innerText || '').length > 12) {
            issues.push('en:' + el.innerText.slice(0, 40));
          }
        });
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const text = node.textContent.trim();
          if (!isEnglishSentence(text)) continue;
          const el = node.parentElement;
          if (!el || el.closest('[data-lang="en"], [data-assurance-en], .language-toggle')) continue;
          let hidden = false;
          let p = el;
          while (p) {
            if (getComputedStyle(p).display === 'none') { hidden = true; break; }
            p = p.parentElement;
          }
          if (!hidden) issues.push('en-bare:' + text.slice(0, 40));
        }
      }
      return issues.slice(0, 3);
    }, lang);
    if (bad.length) {
      console.log('FAIL toggle-residue', lang, bad);
      failed += 1;
    } else {
      console.log('OK toggle-residue', lang);
    }
  }
  await page.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
