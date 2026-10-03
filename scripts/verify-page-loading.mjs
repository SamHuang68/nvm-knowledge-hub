import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit } from 'playwright';
import { startTestServer } from './test-server.mjs';

const root = path.resolve(import.meta.dirname, '..');
const engine = process.env.NVM_QA_ENGINE || 'chromium';
assert.ok(['chromium', 'webkit'].includes(engine));
const channel = process.env.NVM_QA_BROWSER || process.env.NVM_QA_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chromium');
const baseline = process.env.NVM_QA_LOADING_BASELINE === '1';
const output = path.resolve(process.env.NVM_QA_OUTPUT || path.join(root, 'qa', 'page-loading', engine));
fs.mkdirSync(output, { recursive: true });
const server = process.env.NVM_QA_BASE ? null : await startTestServer(root);
const base = process.env.NVM_QA_BASE || server.base;
const imageCompletionTimeout = ['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname) ? 10000 : 60000;
const browser = await ({ chromium, webkit })[engine].launch({ headless: true, ...(engine === 'chromium' && channel !== 'chromium' ? { channel } : {}) });
const sections = [
  { selector: '.immersive-wafer', image: 'silicon-ip-panorama-v2.webp' },
  { selector: '#identity-stack', image: 'comparison-cell-states-v1.webp', finalBackgroundNone: true },
  { selector: '#architecture', image: 'architecture-subsystem-v1.webp', finalBackgroundNone: true },
  { selector: '.immersive-probe', image: 'assurance-evidence-v1.webp' },
  { selector: '#compare', image: 'comparison-cell-states-v1.webp', finalBackgroundNone: true },
  { selector: '.immersive-silicon', image: 'power-off-state-v1.webp' },
  { selector: '#evidence', image: 'evidence-field-v1.webp', finalBackgroundNone: true },
  { selector: '#applications', image: 'applications-ecosystem-v1.webp' },
  { selector: '#learn', image: 'learning-path-v1.webp' },
  { selector: '.closing-section', image: 'closing-secure-boundary-v1.webp' },
];
const hero = 'secure-storage-hero-key.webp';
const images = [...new Set([hero, ...sections.map(section => section.image)])].sort();
// The existing JS chapter layout suppresses four panel backgrounds. Their
// original CSS images still apply without JS; do not force them into the layout.
const visibleImages = [hero, ...sections.filter(section => !section.finalBackgroundNone).map(section => section.image)].sort();
const sourceAssets = images.map(name => {
  const bytes = fs.readFileSync(path.join(root, 'assets', name));
  return { name, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
});
const profiles = [
  { name: 'desktop-en', language: 'en', viewport: { width: 1440, height: 1000 } },
  { name: 'mobile-zh', language: 'zh', viewport: { width: 390, height: 844 } },
];
const results = [];
const references = new Map();
const imageDownloads = new WeakMap();

async function check(name, profile, run, options = {}) {
  const context = await browser.newContext({ viewport: profile.viewport, serviceWorkers: 'block', reducedMotion: 'reduce', javaScriptEnabled: options.javaScriptEnabled !== false });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(base).origin || (options.blockLoader && url.pathname.endsWith('/deferred-backgrounds.js'))) return route.abort();
    return route.continue();
  });
  if (options.silentObserver) await context.addInitScript(() => {
    // Delayed observer callbacks must not leave a direct hash destination empty.
    window.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() { return []; }
    };
  });
  const page = await context.newPage();
  const downloaded = new Map();
  const downloadFailures = [];
  const pendingBodies = new Set();
  imageDownloads.set(page, { downloaded, downloadFailures });
  page.setDefaultTimeout(10000);
  page.setDefaultNavigationTimeout(60000);
  const errors = [];
  const requests = [];
  const imageResponses = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (new URL(request.url()).origin === new URL(base).origin) requests.push(request.url()); });
  page.on('response', response => { const name = new URL(response.url()).pathname.split('/').at(-1); if (images.includes(name)) imageResponses.push({ name, status: response.status() }); });
  page.on('requestfinished', request => {
    const name = new URL(request.url()).pathname.split('/').at(-1);
    if (!images.includes(name)) return;
    const pending = (async () => {
      try {
        const response = await request.response();
        // Read the completed browser response, without creating an extra fetch.
        const bytes = await response.body();
        downloaded.set(name, { name, status: response.status(), bodyBytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
      } catch (error) { downloadFailures.push({ name, error: error.message }); }
    })();
    pendingBodies.add(pending);
    pending.finally(() => pendingBodies.delete(pending));
  });
  const record = { name, profile: profile.name, passed: false };
  try {
    await run(page, record, requests);
    await Promise.all(pendingBodies);
    assert.deepEqual(errors, [], 'no runtime errors');
    assert.ok(imageResponses.every(response => response.status === 200), 'every requested original image loads successfully');
    for (const asset of downloaded.values()) assert.equal(asset.sha256, sourceAssets.find(source => source.name === asset.name).sha256, `completed ${asset.name} matches the original asset bytes`);
    record.passed = true;
  } catch (error) {
    record.error = error.stack;
    record.failureResources = await page.evaluate(() => performance.getEntriesByType('resource').map(entry => ({ name: entry.name, responseEnd: entry.responseEnd, encodedBodyBytes: entry.encodedBodySize }))).catch(() => []);
    await page.screenshot({ path: path.join(output, `${name}-${profile.name}-failure.png`), animations: 'disabled' }).catch(() => {});
  } finally {
    record.pageErrors = errors;
    record.imageResponses = imageResponses;
    record.completedImageDownloads = [...downloaded.values()];
    record.imageDownloadReadErrors = downloadFailures;
    results.push(record);
    await context.close();
  }
}

const navigate = (page, profile, hash = '') => page.goto(new URL(`secure-storage.html?lang=${profile.language}${hash}`, base).href, { waitUntil: 'networkidle' });
const requestedImages = requests => [...new Set(requests.map(url => new URL(url).pathname.split('/').at(-1)).filter(name => images.includes(name)))].sort();
const allWebPImages = requests => [...new Set(requests.map(url => new URL(url).pathname.split('/').at(-1)).filter(name => name.endsWith('.webp')))].sort();
async function waitImages(page, expected) {
  const { downloaded, downloadFailures } = imageDownloads.get(page);
  const deadline = Date.now() + imageCompletionTimeout;
  while (!expected.every(name => downloaded.has(name))) {
    const failures = downloadFailures.filter(failure => expected.includes(failure.name));
    assert.deepEqual(failures, [], 'completed image response bodies remain readable');
    assert.ok(Date.now() < deadline, `image download did not finish: ${expected.filter(name => !downloaded.has(name)).join(', ')}`);
    await new Promise(resolve => setTimeout(resolve, 25));
  }
}
async function snapshot(page) {
  return page.evaluate(items => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: innerWidth,
    sections: items.map(({ selector, image }) => {
      const element = document.querySelector(selector);
      const css = getComputedStyle(element);
      return { selector, image, top: element.offsetTop, left: element.offsetLeft, width: element.offsetWidth, height: element.offsetHeight, backgroundImage: css.backgroundImage, backgroundPosition: css.backgroundPosition, backgroundSize: css.backgroundSize, backgroundRepeat: css.backgroundRepeat, text: element.textContent.trim() };
    }),
    gradientOnlySections: ['.sources-section', '.research-launch'].map(selector => ({ selector, backgroundImage: getComputedStyle(document.querySelector(selector)).backgroundImage })),
    timing: (() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return { ttfbMs: nav.responseStart - nav.requestStart, loadMs: nav.loadEventEnd, DOMContentLoadedMs: nav.domContentLoadedEventEnd };
    })(),
    resources: performance.getEntriesByType('resource').map(entry => ({ name: entry.name, type: entry.initiatorType, transferBytes: entry.transferSize, encodedBodyBytes: entry.encodedBodySize, durationMs: entry.duration })),
  }), sections);
}
function layout(records) {
  return records.map(({ selector, top, left, width, height, text }) => ({ selector, top, left, width, height, text }));
}
function appearance(records) {
  return records.map(({ selector, backgroundImage, backgroundPosition, backgroundSize, backgroundRepeat }) => ({ selector, backgroundImage, backgroundPosition, backgroundSize, backgroundRepeat }));
}

try {
  for (const profile of profiles) {
    await check('initial-and-scroll', profile, async (page, record, requests) => {
      await navigate(page, profile);
      await waitImages(page, baseline ? visibleImages : [hero]);
      record.initialImages = requestedImages(requests);
      record.initialCompletedImageDownloads = [...imageDownloads.get(page).downloaded.values()];
      record.initialAllWebPImages = allWebPImages(requests);
      record.initialImageFileBytes = sourceAssets.filter(asset => record.initialImages.includes(asset.name)).reduce((sum, asset) => sum + asset.bytes, 0);
      record.initial = await snapshot(page);
      if (baseline) {
        assert.ok(visibleImages.every(image => record.initialImages.includes(image)), 'the eager reference loads every finally visible image');
        assert.ok(record.initialAllWebPImages.every(image => images.includes(image)), 'the eager reference only requests original WebP assets');
      } else {
        assert.deepEqual(record.initialImages, [hero], 'screen entry fetches the hero; deferred decorative images wait for their sections');
        assert.deepEqual(record.initialAllWebPImages, [hero], 'no other selector eagerly requests a deferred or shared WebP image');
      }
      assert.ok(record.initial.gradientOnlySections.every(section => !section.backgroundImage.includes('url(')), 'sources and research keep their existing gradient-only composition');
      assert.ok(record.initial.scrollWidth <= record.initial.viewportWidth + 1, 'page content fits the viewport');
      if (!baseline) for (const section of record.initial.sections) {
        if (sections.find(item => item.selector === section.selector).finalBackgroundNone) assert.equal(section.backgroundImage, 'none', 'the existing chapter layout keeps this panel background suppressed');
        else assert.match(section.backgroundImage, /linear-gradient/, 'the original gradient remains before the decorative image loads');
        assert.ok(!section.backgroundImage.includes('url('), 'offscreen image URL is not active');
      }
      await page.screenshot({ path: path.join(output, `entry-${profile.name}.png`), animations: 'disabled' });
      for (const section of sections) {
        record.lastSection = section.selector;
        await page.locator(section.selector).scrollIntoViewIfNeeded();
        await page.waitForFunction(({ selector, image, finalBackgroundNone }) => {
          const value = getComputedStyle(document.querySelector(selector)).backgroundImage;
          return finalBackgroundNone ? value === 'none' : value.includes(image);
        }, section);
        if (!section.finalBackgroundNone) await waitImages(page, [section.image]);
        if (['.immersive-wafer', '#architecture', '#compare', '#applications', '#learn'].includes(section.selector)) await page.screenshot({ path: path.join(output, `${section.image}-${profile.name}.png`), animations: 'disabled' });
      }
      record.afterScroll = await snapshot(page);
      record.afterScrollImages = requestedImages(requests);
      assert.deepEqual(record.afterScrollImages, baseline ? record.initialImages : visibleImages, 'all finally visible original images load; suppressed panel backgrounds stay suppressed');
      assert.deepEqual(allWebPImages(requests), record.afterScrollImages, 'the complete WebP request set contains only the expected original assets');
      assert.deepEqual(layout(record.afterScroll.sections), layout(record.initial.sections), 'loading images does not change section layout or content');
      references.set(profile.name, record);
    });
    await check('loader-unavailable-eager-fallback', profile, async (page, record, requests) => {
      await navigate(page, profile);
      await waitImages(page, visibleImages);
      record.initialImages = requestedImages(requests);
      record.initialImageFileBytes = sourceAssets.filter(asset => record.initialImages.includes(asset.name)).reduce((sum, asset) => sum + asset.bytes, 0);
      record.initial = await snapshot(page);
      assert.ok(visibleImages.every(image => record.initialImages.includes(image)), 'an unavailable loader leaves every original visible background intact');
      assert.ok(record.initialImages.every(image => images.includes(image)), 'the eager fallback only requests original images');
      const reference = references.get(profile.name);
      if (reference) {
        assert.deepEqual(layout(record.initial.sections), layout(reference.initial.sections), 'deferred and eager modes preserve the same layout and content');
        assert.deepEqual(appearance(record.initial.sections), appearance(reference.afterScroll.sections), 'loaded backgrounds match the original eager composition');
      }
    }, { blockLoader: true });
  }
  if (!baseline) {
    for (const profile of profiles) {
      await check('direct-hash-and-hashchange', profile, async (page, record) => {
        await navigate(page, profile, '#learn');
        await waitImages(page, ['learning-path-v1.webp']);
        assert.ok(await page.locator('#learn').evaluate(element => getComputedStyle(element).backgroundImage.includes('learning-path-v1.webp')));
        assert.ok(await page.locator('#learn').evaluate(element => element.getBoundingClientRect().top < innerHeight), 'direct hash target enters the viewport');
        await page.evaluate(() => { location.hash = 'applications'; });
        await waitImages(page, ['applications-ecosystem-v1.webp']);
        record.hash = await page.evaluate(() => location.hash);
        assert.equal(record.hash, '#applications');
      }, { silentObserver: true });
      await check('javascript-disabled', profile, async (page, record, requests) => {
        await navigate(page, profile);
        await waitImages(page, images);
        record.images = requestedImages(requests);
        assert.deepEqual(record.images, images, 'all original background assets remain available without JavaScript');
        record.snapshot = await snapshot(page);
        for (const section of record.snapshot.sections) assert.ok(section.backgroundImage.includes(section.image));
      }, { javaScriptEnabled: false });
    }
    const profile = profiles[0];
    let printReference;
    await check('print-eager-reference', profile, async (page, record) => {
      await navigate(page, profile);
      await page.emulateMedia({ media: 'print' });
      printReference = await snapshot(page);
      record.print = printReference;
      assert.ok(printReference.sections.every(section => section.backgroundImage === 'none'), 'existing print CSS omits decorative backgrounds');
    }, { blockLoader: true });
    await check('print-media-and-return', profile, async (page, record, requests) => {
      await navigate(page, profile);
      await page.emulateMedia({ media: 'print' });
      record.print = await snapshot(page);
      assert.deepEqual(layout(record.print.sections), layout(printReference.sections), 'print media preserves original layout and content');
      assert.deepEqual(appearance(record.print.sections), appearance(printReference.sections), 'print media preserves original background suppression');
      await page.screenshot({ path: path.join(output, 'print-media.png'), animations: 'disabled' });
      await page.emulateMedia({ media: 'screen' });
      await waitImages(page, visibleImages);
      record.imagesAfterReturn = requestedImages(requests);
      assert.deepEqual(record.imagesAfterReturn, visibleImages, 'returning from print makes all original visible screen backgrounds available');
    });
    await check('beforeprint-hook', profile, async (page, record, requests) => {
      await navigate(page, profile);
      await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
      await waitImages(page, visibleImages);
      record.images = requestedImages(requests);
      assert.deepEqual(record.images, visibleImages, 'the beforeprint hook releases every deferred visible image while preserving suppressed panels');
      record.scope = 'Synthetic beforeprint hook; print media is separately checked, not a physical printer test.';
    });
  }
} finally {
  await browser.close();
  if (server) await server.close();
}
const report = {
  generatedAt: new Date().toISOString(), engine, browserVersion: browser.version(), phase: baseline ? 'eager-baseline' : 'deferred-backgrounds',
  scope: 'Isolated local or named-origin requests, original image bytes, viewport/scroll/hash/no-JavaScript/print-media behavior. Windows WebKit is not Safari; timing samples do not establish a speed guarantee.',
  imageCompletionEvidence: 'Browser requestfinished plus completed response body/hash, without another image fetch. ResourceTiming entries are retained only as diagnostic timing data because an observed painted image could lack a timing entry.',
  timeouts: { navigationMs: 60000, imageCompletionMs: imageCompletionTimeout, interactionMs: 10000 },
  sourceAssets, results,
};
fs.writeFileSync(path.join(output, 'verification-results.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`Secure-storage page loading (${engine}, ${report.phase}): ${results.filter(result => result.passed).length}/${results.length} passed`);
if (results.some(result => !result.passed)) { console.error(JSON.stringify(results.filter(result => !result.passed).map(({ name, profile, lastSection, error, pageErrors }) => ({ name, profile, lastSection, error, pageErrors })), null, 2)); process.exitCode = 1; }
